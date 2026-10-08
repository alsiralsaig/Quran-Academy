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
