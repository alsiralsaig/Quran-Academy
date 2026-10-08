// اختبارات الـ API كاملة على Postgres حقيقي داخل الذاكرة (PGlite).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { createPgliteDb, type Db } from '../server/db.ts';
import { handleApi } from '../server/app.ts';
import { normalizePhone } from '../server/auth.ts';

process.env.NODE_ENV = 'test';
process.env.ADMIN_PHONE = '0911111111';
process.env.ADMIN_PASSWORD = 'admin-pass-1';

let db: Db;
before(async () => { db = await createPgliteDb(); });

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

class Client {
  cookie = '';
  async call(method: string, path: string, body?: any, extra: Record<string, string> = {}) {
    const res = await handleApi(
      { method, path, body, ip: '1.2.3.4', headers: { cookie: this.cookie, 'x-qa-client': '1', ...extra } },
      db
    );
    for (const c of res.cookies || []) {
      const v = c.split(';')[0];
      this.cookie = v.endsWith('=') ? '' : v;
    }
    return res;
  }
  async ok(method: string, path: string, body?: any) {
    const r = await this.call(method, path, body);
    assert.equal(r.status, 200, `${method} ${path} -> ${r.status} ${JSON.stringify(r.json)}`);
    return r.json as any;
  }
}

test('normalizePhone يوحّد الأرقام السودانية والدولية', () => {
  assert.equal(normalizePhone('0912345678'), '+249912345678');
  assert.equal(normalizePhone('912345678'), '+249912345678');
  assert.equal(normalizePhone('249912345678'), '+249912345678');
  assert.equal(normalizePhone('00249 91 234 5678'), '+249912345678');
  assert.equal(normalizePhone('+249-912-345-678'), '+249912345678');
  assert.equal(normalizePhone('٠٩١٢٣٤٥٦٧٨'), '+249912345678');
  assert.equal(normalizePhone('+966501234567'), '+966501234567');
  assert.equal(normalizePhone('0812345678'), null); // سوداني لازم يبدأ بـ 9 أو 1
  assert.equal(normalizePhone('123'), null);
  assert.equal(normalizePhone(''), null);
});

test('الزوار يشوفوا الباقات والحسابات البنكية بس', async () => {
  const guest = new Client();
  const b = await guest.ok('GET', '/bootstrap');
  assert.equal(b.user, null);
  assert.equal(b.packages.length, 3);
  assert.equal(b.bankAccounts.length, 2);
  assert.deepEqual(b.subscriptions, []);
  assert.deepEqual(b.students, []);
});

test('حماية CSRF: الطلبات المعدِّلة بدون الترويسة مرفوضة', async () => {
  const r = await handleApi({ method: 'POST', path: '/auth/login', headers: {}, body: {} }, db);
  assert.equal(r.status, 403);
});

test('المسارات غير المعروفة 404 والطريقة الغلط 405', async () => {
  const c = new Client();
  assert.equal((await c.call('GET', '/nope')).status, 404);
  assert.equal((await c.call('GET', '/auth/login')).status, 405);
});

test('الرحلة الكاملة: معلمة ← طالب ← إيصال ← اعتماد ← حصص', async () => {
  const admin = new Client();
  const teacher = new Client();
  const student = new Client();
  const other = new Client();

  // دخول المدير من متغيرات البيئة
  const a = await admin.ok('POST', '/auth/login', { phone: '0911111111', password: 'admin-pass-1' });
  assert.equal(a.user.role, 'admin');
  assert.equal(a.user.phone, '+249911111111');

  // المعلمة تسجّل وتقدّم طلب
  const t = await teacher.ok('POST', '/auth/register', { role: 'teacher', name: 'أ. أمل', phone: '0922222222', password: 'teach-123' });
  assert.equal(t.user.role, 'teacher');
  const app = await teacher.ok('POST', '/teachers/application', {
    qualifications: { ijazat: ['إجازة حفص'], memorizationParts: 30, experienceYears: 5, specialization: 'تجويد', bio: 'نبذة' },
    availableDays: ['الأحد'], availableTimes: '4-8 م',
  });
  assert.equal(app.teacher.status, 'pending');
  assert.equal(app.teacher.applicationSubmitted, true);

  // الطالب ما بيشوف المعلمة لسه (ما اتعتمدت)
  await student.ok('POST', '/auth/register', { role: 'student', name: 'عبدالله', phone: '0933333333', password: 'stud-123' });
  let sb = await student.ok('GET', '/bootstrap');
  assert.equal(sb.teachers.length, 0);

  // الطالب ما بيقدر يعتمد المعلمة
  assert.equal((await student.call('POST', `/teachers/${t.user.id}/approve`, {})).status, 403);

  // المدير يشوف الطلب + إشعار + يعتمد
  let ab = await admin.ok('GET', '/bootstrap');
  assert.equal(ab.teachers.length, 1);
  assert.ok(ab.notifications.some((n: any) => n.title === 'طلب انضمام جديد'));
  await admin.ok('POST', `/teachers/${t.user.id}/approve`, { hourlyRate: 150 });

  // الطالب يشوف المعلمة بدون رقمها
  sb = await student.ok('GET', '/bootstrap');
  assert.equal(sb.teachers.length, 1);
  assert.equal(sb.teachers[0].phone, '');

  // اشتراك بدون إيصال مرفوض، وبإيصال SVG مرفوض
  assert.equal((await student.call('POST', '/subscriptions', { packageId: 'pkg_1', teacherId: t.user.id })).status, 400);
  assert.equal((await student.call('POST', '/subscriptions', { packageId: 'pkg_1', teacherId: t.user.id, receipt: 'data:image/svg+xml;utf8,<svg/>' })).status, 400);

  const s = await student.ok('POST', '/subscriptions', { packageId: 'pkg_1', teacherId: t.user.id, receipt: PNG });
  const subId = s.subscription.id;
  assert.equal(s.subscription.paymentStatus, 'pending');
  assert.equal(s.subscription.totalSessions, 8);
  assert.equal(s.subscription.paymentReceiptUrl, `/api/receipts/${subId}`);

  // الإيصال: المدير والطالب صاحبه بس
  const rcpt = await admin.call('GET', `/receipts/${subId}`);
  assert.equal(rcpt.status, 200);
  assert.equal(rcpt.raw?.contentType, 'image/png');
  assert.equal((await student.call('GET', `/receipts/${subId}`)).status, 200);
  assert.equal((await teacher.call('GET', `/receipts/${subId}`)).status, 403);
  assert.equal((await other.call('GET', `/receipts/${subId}`)).status, 401);

  // المعلمة ما بتشوف الاشتراك قبل الاعتماد، وما بتقدر تسجّل حصة
  let tb = await teacher.ok('GET', '/bootstrap');
  assert.equal(tb.subscriptions.length, 0);
  assert.equal((await teacher.call('POST', '/sessions', { subscriptionId: subId, surahName: 'البقرة', fromAyah: 1, toAyah: 5, rating: 5, attendance: 'present' })).status, 400);

  // المدير يعتمد
  const ap = await admin.ok('POST', `/subscriptions/${subId}/approve`);
  assert.equal(ap.subscription.paymentStatus, 'approved');
  assert.ok(ap.subscription.expiryDate);

  // الطالب جاه إشعار
  sb = await student.ok('GET', '/bootstrap');
  assert.ok(sb.notifications.some((n: any) => n.title === 'تأكيد تفعيل الباقة'));
  assert.equal(sb.subscriptions[0].paymentStatus, 'approved');

  // المعلمة تشوف الطالب وتسجّل حصة
  tb = await teacher.ok('GET', '/bootstrap');
  assert.equal(tb.subscriptions.length, 1);
  assert.equal(tb.teachers.find((x: any) => x.id === t.user.id).studentCount, 1);
  const rec = await teacher.ok('POST', '/sessions', {
    subscriptionId: subId, surahName: 'سورة البقرة', fromAyah: 1, toAyah: 5, rating: 4,
    attendance: 'present', tajweedNotes: 'ممتاز', homework: 'مراجعة', date: '2026-10-08', time: '5:00 م',
  });
  assert.equal(rec.subscription.usedSessions, 1);
  assert.equal(rec.subscription.remainingSessions, 7);
  assert.equal(rec.session.studentName, 'عبدالله');

  // معلمة تانية ما بتقدر تسجّل لطالب ما في حلقتها
  const t2 = new Client();
  await t2.ok('POST', '/auth/register', { role: 'teacher', name: 'أ. سارة', phone: '0944444444', password: 'teach-456' });
  assert.equal((await t2.call('POST', '/sessions', { subscriptionId: subId, surahName: 'x', fromAyah: 1, toAyah: 1, rating: 5, attendance: 'present' })).status, 403);

  // الرصيد ما بيتجاوز: نستهلك الباقي
  for (let i = 0; i < 7; i++) {
    await teacher.ok('POST', '/sessions', { subscriptionId: subId, surahName: 'x', fromAyah: 1, toAyah: 2, rating: 5, attendance: 'present' });
  }
  const over = await teacher.call('POST', '/sessions', { subscriptionId: subId, surahName: 'x', fromAyah: 1, toAyah: 2, rating: 5, attendance: 'present' });
  assert.equal(over.status, 400);

  // المدير يضيف حصتين
  const add = await admin.ok('POST', `/subscriptions/${subId}/add-sessions`, { count: 2 });
  assert.equal(add.subscription.remainingSessions, 2);

  // الطالب يشوف حصصه بس
  sb = await student.ok('GET', '/bootstrap');
  assert.equal(sb.sessions.length, 8);
  assert.equal(sb.students.length, 1);
});

test('رفض الإيصال يرسل السبب للطالب', async () => {
  const admin = new Client();
  await admin.ok('POST', '/auth/login', { phone: '+249911111111', password: 'admin-pass-1' });
  const st = new Client();
  await st.ok('POST', '/auth/register', { role: 'student', name: 'محمد', phone: '0955555555', password: 'abc12345' });
  const teachers = (await st.ok('GET', '/bootstrap')).teachers;
  const s = await st.ok('POST', '/subscriptions', { packageId: 'pkg_2', teacherId: teachers[0].id, receipt: PNG });
  assert.equal((await admin.call('POST', `/subscriptions/${s.subscription.id}/reject`, {})).status, 400); // السبب مطلوب
  await admin.ok('POST', `/subscriptions/${s.subscription.id}/reject`, { reason: 'المبلغ ناقص' });
  const b = await st.ok('GET', '/bootstrap');
  assert.equal(b.subscriptions[0].paymentStatus, 'rejected');
  assert.equal(b.subscriptions[0].rejectionReason, 'المبلغ ناقص');
  assert.ok(b.notifications.some((n: any) => n.message.includes('المبلغ ناقص')));
});

test('التسجيل: رقم مكرر، كلمة سر قصيرة، رقم غلط، ودور admin ممنوع', async () => {
  const c = new Client();
  assert.equal((await c.call('POST', '/auth/register', { role: 'student', name: 'x', phone: '0933333333', password: 'abcdef' })).status, 409);
  assert.equal((await c.call('POST', '/auth/register', { role: 'student', name: 'x', phone: '0966666666', password: '123' })).status, 400);
  assert.equal((await c.call('POST', '/auth/register', { role: 'student', name: 'x', phone: '12', password: 'abcdef' })).status, 400);
  assert.equal((await c.call('POST', '/auth/register', { role: 'admin', name: 'x', phone: '0977777777', password: 'abcdef' })).status, 400);
});

test('قفل الحساب بعد 5 محاولات غلط', async () => {
  const c = new Client();
  await c.ok('POST', '/auth/register', { role: 'student', name: 'قفل', phone: '0988888888', password: 'right-pass' });
  await c.ok('POST', '/auth/logout');
  for (let i = 0; i < 5; i++) {
    assert.equal((await c.call('POST', '/auth/login', { phone: '0988888888', password: 'wrong' })).status, 401);
  }
  assert.equal((await c.call('POST', '/auth/login', { phone: '0988888888', password: 'right-pass' })).status, 429);
});

test('تغيير كلمة السر يلغي الجلسات القديمة', async () => {
  const a = new Client();
  const b = new Client();
  await a.ok('POST', '/auth/register', { role: 'student', name: 'جلسات', phone: '0999999991', password: 'first-pass' });
  await b.ok('POST', '/auth/login', { phone: '0999999991', password: 'first-pass' });
  assert.ok((await b.ok('GET', '/auth/me')).user);
  assert.equal((await a.call('POST', '/auth/password', { currentPassword: 'bad', newPassword: 'second-pass' })).status, 400);
  await a.ok('POST', '/auth/password', { currentPassword: 'first-pass', newPassword: 'second-pass' });
  assert.ok((await a.ok('GET', '/auth/me')).user, 'الجهاز اللي غيّر يفضل داخل');
  assert.equal((await b.ok('GET', '/auth/me')).user, null, 'الجهاز التاني يطلع');
});

test('المدير يعيد تعيين كلمة السر ويوقف الحسابات', async () => {
  const admin = new Client();
  await admin.ok('POST', '/auth/login', { phone: '0911111111', password: 'admin-pass-1' });
  const u = new Client();
  const r = await u.ok('POST', '/auth/register', { role: 'student', name: 'نسيت', phone: '0999999992', password: 'forgot-it' });
  const reset = await admin.ok('POST', `/admin/users/${r.user.id}/reset-password`);
  assert.match(reset.tempPassword, /^\d{8}$/);
  assert.equal((await u.ok('GET', '/auth/me')).user, null);
  await u.ok('POST', '/auth/login', { phone: '0999999992', password: reset.tempPassword });
  await admin.ok('POST', `/admin/users/${r.user.id}/active`, { active: false });
  assert.equal((await u.call('POST', '/auth/login', { phone: '0999999992', password: reset.tempPassword })).status, 403);
});

test('الباقات والحسابات البنكية: المدير بس', async () => {
  const admin = new Client();
  await admin.ok('POST', '/auth/login', { phone: '0911111111', password: 'admin-pass-1' });
  const st = new Client();
  await st.ok('POST', '/auth/login', { phone: '0933333333', password: 'stud-123' });
  const pkg = { name: 'باقة تجريبية', sessionCount: 4, sessionDurationMinutes: 30, price: 50000, currency: 'جنيه سوداني', features: ['أ'] };
  assert.equal((await st.call('POST', '/packages', pkg)).status, 403);
  const p = await admin.ok('POST', '/packages', pkg);
  await admin.ok('PUT', `/packages/${p.package.id}`, { ...pkg, price: 60000 });
  let b = await st.ok('GET', '/bootstrap');
  assert.equal(b.packages.find((x: any) => x.id === p.package.id).price, 60000);
  await admin.ok('DELETE', `/packages/${p.package.id}`);
  b = await st.ok('GET', '/bootstrap');
  assert.ok(!b.packages.some((x: any) => x.id === p.package.id));

  assert.equal((await st.call('PUT', '/settings/bank-accounts', { accounts: [] })).status, 403);
  await admin.ok('PUT', '/settings/bank-accounts', { accounts: [{ bankName: 'بنك فيصل', accountNumber: '123' }] });
  b = await st.ok('GET', '/bootstrap');
  assert.equal(b.bankAccounts[0].bankName, 'بنك فيصل');
});

test('الإعلانات والإشعارات', async () => {
  const admin = new Client();
  await admin.ok('POST', '/auth/login', { phone: '0911111111', password: 'admin-pass-1' });
  const st = new Client();
  await st.ok('POST', '/auth/login', { phone: '0933333333', password: 'stud-123' });
  const tc = new Client();
  await tc.ok('POST', '/auth/login', { phone: '0922222222', password: 'teach-123' });

  await admin.ok('POST', '/broadcasts', { title: 'للمعلمات', content: 'اجتماع', targetRole: 'teachers' });
  assert.equal((await st.ok('GET', '/bootstrap')).broadcasts.length, 0);
  const tb = await tc.ok('GET', '/bootstrap');
  assert.equal(tb.broadcasts.length, 1);
  assert.equal((await st.call('POST', '/broadcasts', { title: 'x', content: 'y' })).status, 403);
  await admin.ok('DELETE', `/broadcasts/${tb.broadcasts[0].id}`);
  assert.equal((await tc.ok('GET', '/bootstrap')).broadcasts.length, 0);

  const n = (await st.ok('GET', '/bootstrap')).notifications;
  assert.ok(n.length > 0);
  await st.ok('POST', `/notifications/${n[0].id}/read`);
  // طالب ما بيقدر يعدّل إشعار زول تاني
  const an = (await admin.ok('GET', '/bootstrap')).notifications;
  await st.ok('POST', `/notifications/${an[0].id}/read`);
  assert.equal((await admin.ok('GET', '/bootstrap')).notifications[0].isRead, an[0].isRead);
  await st.ok('POST', '/notifications/read-all');
  assert.ok((await st.ok('GET', '/bootstrap')).notifications.every((x: any) => x.isRead));
  await st.ok('DELETE', '/notifications');
  assert.equal((await st.ok('GET', '/bootstrap')).notifications.length, 0);
});

test('التصدير للمدير بس وبدون كلمات السر', async () => {
  const admin = new Client();
  await admin.ok('POST', '/auth/login', { phone: '0911111111', password: 'admin-pass-1' });
  const ex = await admin.ok('GET', '/admin/export');
  assert.equal(ex.format, 'quran-academy-backup');
  assert.ok(ex.users.length >= 5);
  assert.ok(!JSON.stringify(ex).includes('password_hash'));
  assert.ok(!JSON.stringify(ex).includes('$2a$') && !JSON.stringify(ex).includes('$2b$'));
  const st = new Client();
  await st.ok('POST', '/auth/login', { phone: '0933333333', password: 'stud-123' });
  assert.equal((await st.call('GET', '/admin/export')).status, 403);
});

test('المساعد الذكي بدون مفتاح يرجّع 503 (والواجهة بتستعمل البديل المحلي)', async () => {
  delete process.env.GEMINI_API_KEY;
  const c = new Client();
  const r = await c.call('POST', '/ai/ask', { prompt: 'ما هو الإدغام؟' });
  assert.equal(r.status, 503);
});
