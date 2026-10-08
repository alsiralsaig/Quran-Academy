// المرحلة 2: البيانات الشخصية في القاعدة، تنبيهات المعلم المباشرة، وخصوصية رابط الحصة.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { createPgliteDb, type Db } from '../server/db.ts';
import { handleApi } from '../server/app.ts';

process.env.NODE_ENV = 'test';
process.env.ADMIN_PHONE = '0911111111';
process.env.ADMIN_PASSWORD = 'admin-pass-1';

let db: Db;
before(async () => { db = await createPgliteDb(); });

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

class Client {
  cookie = '';
  async call(method: string, path: string, body?: any) {
    const res = await handleApi({ method, path, body, ip: '1.2.3.4', headers: { cookie: this.cookie, 'x-qa-client': '1' } }, db);
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

let seq = 0;
async function setup() {
  seq++;
  const tp = `092000000${seq}`, sp = `093000000${seq}`, xp = `094000000${seq}`;
  const admin = new Client(), teacher = new Client(), student = new Client(), stranger = new Client(), guest = new Client();
  await admin.ok('POST', '/auth/login', { phone: '0911111111', password: 'admin-pass-1' });
  const t = await teacher.ok('POST', '/auth/register', { role: 'teacher', name: 'أ. سارة', phone: tp, password: 'teach-123' });
  await teacher.ok('POST', '/teachers/application', {
    qualifications: { ijazat: [], memorizationParts: 30, experienceYears: 3, specialization: 'تجويد', bio: '' },
    availableDays: [], availableTimes: '',
  });
  await admin.ok('POST', `/teachers/${t.user.id}/approve`, { hourlyRate: 100 });
  const s = await student.ok('POST', '/auth/register', { role: 'student', name: 'أحمد', phone: sp, password: 'stud-123' });
  const x = await stranger.ok('POST', '/auth/register', { role: 'student', name: 'غريب', phone: xp, password: 'stud-123' });
  const sub = await student.ok('POST', '/subscriptions', { packageId: 'pkg_1', teacherId: t.user.id, receipt: PNG });
  return { sp, admin, teacher, student, stranger, guest, teacherId: t.user.id, studentId: s.user.id, strangerId: x.user.id, subId: sub.subscription.id };
}

test('رابط الحصة: يتحفظ، ويظهر فقط للمعلم والمدير والطالب المعتمد', async () => {
  const c = await setup();
  assert.equal((await c.teacher.call('PATCH', '/teachers/me', { zoomLink: 'http://zoom.us/x' })).status, 400);
  await c.teacher.ok('PATCH', '/teachers/me', { zoomLink: 'https://zoom.us/j/123' });

  const linkFor = async (cl: Client) => (await cl.ok('GET', '/bootstrap')).teachers.find((t: any) => t.id === c.teacherId)?.zoomLink;
  assert.equal(await linkFor(c.teacher), 'https://zoom.us/j/123');
  assert.equal(await linkFor(c.admin), 'https://zoom.us/j/123');
  assert.equal(await linkFor(c.guest), undefined);
  assert.equal(await linkFor(c.stranger), undefined);
  assert.equal(await linkFor(c.student), undefined, 'قبل اعتماد الاشتراك ما بيظهر');

  await c.admin.ok('POST', `/subscriptions/${c.subId}/approve`);
  assert.equal(await linkFor(c.student), 'https://zoom.us/j/123');
  assert.equal(await linkFor(c.stranger), undefined);
});

test('تنبيهات المعلم المباشرة: لطلابه المعتمدين بس', async () => {
  const c = await setup();
  const msg = { kind: 'encouragement', title: 'أحسنت', message: 'تسميع ممتاز' };
  // قبل الاعتماد: ما عنده طلاب
  assert.equal((await c.teacher.call('POST', '/notifications/send', { ...msg, all: true })).status, 400);
  await c.admin.ok('POST', `/subscriptions/${c.subId}/approve`);

  // الطالب والمستخدم الغريب ما بيقدروا يرسلوا
  assert.equal((await c.student.call('POST', '/notifications/send', { ...msg, all: true })).status, 403);

  // إرسال لطالب غريب = مرفوض (يتفلتر)
  assert.equal((await c.teacher.call('POST', '/notifications/send', { ...msg, recipientIds: [c.strangerId] })).status, 400);

  const r = await c.teacher.ok('POST', '/notifications/send', { ...msg, recipientIds: [c.studentId, c.strangerId] });
  assert.equal(r.sent, 1);
  const r2 = await c.teacher.ok('POST', '/notifications/send', { ...msg, kind: 'attendance', all: true });
  assert.equal(r2.sent, 1);

  const sb = await c.student.ok('GET', '/bootstrap');
  const mine = sb.notifications.filter((n: any) => n.title === 'أحسنت');
  assert.equal(mine.length, 2);
  assert.ok(mine[0].message.includes('من المعلم/ة أ. سارة'));
  assert.ok(mine.some((n: any) => n.type === 'warning'));
  const xb = await c.stranger.ok('GET', '/bootstrap');
  assert.equal(xb.notifications.filter((n: any) => n.title === 'أحسنت').length, 0);

  // نوع غير مسموح
  assert.equal((await c.teacher.call('POST', '/notifications/send', { ...msg, kind: 'spam', all: true })).status, 400);
});

test('البيانات الشخصية: تتحفظ في القاعدة وتخص صاحبها بس', async () => {
  const c = await setup();
  assert.equal((await c.guest.call('PUT', '/me/data/weekly_goals', { value: [] })).status, 401);
  assert.equal((await c.student.call('PUT', '/me/data/hack', { value: 1 })).status, 400);
  assert.equal((await c.student.call('PUT', '/me/data/weekly_goals', {})).status, 400);

  const goals = [{ dayName: 'الأحد', targetPages: 2, completedPages: 1 }];
  await c.student.ok('PUT', '/me/data/weekly_goals', { value: goals });
  await c.student.ok('PUT', '/me/data/ayah_notes', { value: { '2_255': { textNote: 'آية الكرسي' } } });
  await c.student.ok('PUT', '/me/data/memorization_days', { value: { '2026-10-08': true } });

  // جهاز تاني: دخول جديد بنفس الحساب
  const other = new Client();
  await other.ok('POST', '/auth/login', { phone: c.sp, password: 'stud-123' });
  const b = await other.ok('GET', '/bootstrap');
  assert.deepEqual(b.userData.weekly_goals, goals);
  assert.equal(b.userData.ayah_notes['2_255'].textNote, 'آية الكرسي');
  assert.equal((await other.ok('GET', '/me/data')).data.memorization_days['2026-10-08'], true);

  // تحديث يستبدل القيمة
  await other.ok('PUT', '/me/data/weekly_goals', { value: [] });
  assert.deepEqual((await c.student.ok('GET', '/bootstrap')).userData.weekly_goals, []);

  // مستخدم تاني ما بيشوفها
  const xb = await c.stranger.ok('GET', '/bootstrap');
  assert.deepEqual(xb.userData, {});

  // الحد الأقصى للحجم
  assert.equal((await c.student.call('PUT', '/me/data/quick_reviews', { value: 'x'.repeat(310_000) })).status, 413);

  // التصدير يشمل البيانات الشخصية
  const exp = await c.admin.ok('GET', '/admin/export');
  assert.ok(exp.userData.some((r: any) => r.key === 'ayah_notes'));
});

test('مواعيد الحصص: المعلم يجدول، والطالب المعتمد بس بيشوف ويتنبّه', async () => {
  const c = await setup();
  const when = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  // قبل الاعتماد: الطالب ما من طلابه
  assert.equal((await c.teacher.call('POST', '/schedule', { title: 'حصة', date: when, time: '5:00 م', studentId: c.studentId })).status, 400);
  await c.admin.ok('POST', `/subscriptions/${c.subId}/approve`);
  await c.teacher.ok('PATCH', '/teachers/me', { zoomLink: 'https://zoom.us/j/777' });
  assert.equal((await c.student.call('POST', '/schedule', { title: 'x', date: when, time: '1' })).status, 403);
  assert.equal((await c.teacher.call('POST', '/schedule', { title: 'x', date: 'بكرة', time: '1' })).status, 400);

  const one = await c.teacher.ok('POST', '/schedule', { title: 'تسميع البقرة', date: when, time: '5:00 م', studentId: c.studentId });
  await c.teacher.ok('POST', '/schedule', { title: 'حلقة جماعية', date: when, time: '8:00 م' });

  const sb = await c.student.ok('GET', '/bootstrap');
  assert.equal(sb.scheduled.length, 2);
  assert.equal(sb.scheduled[0].meetingUrl, 'https://zoom.us/j/777');
  assert.ok(sb.notifications.some((n: any) => n.title === 'موعد حصة جديد 📅'));
  assert.equal((await c.stranger.ok('GET', '/bootstrap')).scheduled.length, 0);

  // الطالب ما بيمسح، المعلم بيمسح
  assert.equal((await c.student.call('DELETE', `/schedule/${one.scheduled.id}`)).status, 403);
  await c.teacher.ok('DELETE', `/schedule/${one.scheduled.id}`);
  assert.equal((await c.student.ok('GET', '/bootstrap')).scheduled.length, 1);
});

test('المكتبة: المعلم يضيف روابط https، الكل يشوف، المالك بس يمسح', async () => {
  const c = await setup();
  assert.equal((await c.student.call('POST', '/library', { title: 'x', kind: 'pdf', url: 'https://a.com/x.pdf' })).status, 403);
  assert.equal((await c.teacher.call('POST', '/library', { title: 'x', kind: 'pdf', url: 'javascript:alert(1)' })).status, 400);
  const it = await c.teacher.ok('POST', '/library', { title: 'متن الجزرية', kind: 'pdf', url: 'https://example.com/jazari.pdf', description: 'للحفظ' });
  const sb = await c.student.ok('GET', '/bootstrap');
  assert.ok(sb.library.some((x: any) => x.id === it.item.id && x.ownerName === 'أ. سارة'));
  assert.equal((await c.student.call('DELETE', `/library/${it.item.id}`)).status, 403);
  await c.admin.ok('DELETE', `/library/${it.item.id}`);
});

test('الختمة الجماعية: حجز الأجزاء بدون تكرار، وإكمال، وإشعار عند الختم', async () => {
  const c = await setup();
  const k = (await c.teacher.ok('POST', '/khatm', { title: 'ختمة رمضان' })).khatm;
  // الطالب قبل الاعتماد ما بيشوف ولا بيحجز
  assert.equal((await c.student.ok('GET', '/bootstrap')).khatms.length, 0);
  assert.equal((await c.student.call('POST', `/khatm/${k.id}/claim`, { juz: 1 })).status, 403);
  await c.admin.ok('POST', `/subscriptions/${c.subId}/approve`);
  assert.equal((await c.student.ok('GET', '/bootstrap')).khatms.length, 1);

  await c.student.ok('POST', `/khatm/${k.id}/claim`, { juz: 1 });
  assert.equal((await c.teacher.call('POST', `/khatm/${k.id}/claim`, { juz: 1 })).status, 409, 'محجوز');
  assert.equal((await c.student.call('POST', `/khatm/${k.id}/claim`, { juz: 31 })).status, 400);
  // الغريب ما بيقدر
  assert.equal((await c.stranger.call('POST', `/khatm/${k.id}/claim`, { juz: 2 })).status, 403);

  let r = await c.student.ok('POST', `/khatm/${k.id}/done`, { juz: 1 });
  assert.equal(r.khatm.parts['1'].done, true);
  assert.equal(r.khatm.parts['1'].name, 'أحمد');

  // المعلم يحجز الباقي ويكملهم → إشعار ختم
  for (let j = 2; j <= 30; j++) {
    await c.teacher.ok('POST', `/khatm/${k.id}/claim`, { juz: j });
    r = await c.teacher.ok('POST', `/khatm/${k.id}/done`, { juz: j });
  }
  assert.equal(Object.values(r.khatm.parts).filter((p: any) => p.done).length, 30);
  assert.ok((await c.teacher.ok('GET', '/bootstrap')).notifications.some((n: any) => n.title === 'اكتملت الختمة 🎉'));

  // التحرير: الطالب ما بيحرر جزء غيره
  assert.equal((await c.student.call('POST', `/khatm/${k.id}/release`, { juz: 5 })).status, 403);
  await c.student.ok('POST', `/khatm/${k.id}/release`, { juz: 1 });
  await c.teacher.ok('DELETE', `/khatm/${k.id}`);
  assert.equal((await c.student.ok('GET', '/bootstrap')).khatms.length, 0);
});
