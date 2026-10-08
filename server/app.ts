// موجّه الـ API — مستقل عن المنصة (Vercel أو Express المحلي أو الاختبارات).
import type { Db } from './db.js';
import { getDb } from './db.js';
import { ensureSchema } from './schema.js';
import {
  COOKIE_NAME, type Role, type SessionClaims,
  hashPassword, verifyPassword, passwordProblem, normalizePhone,
  signSession, readSession, sessionCookie, clearCookie, parseCookies, tempPassword,
} from './auth.js';
import { askGemini, tafsirWithGemini } from './ai.js';

// ───────────────────────── أنواع عامة ─────────────────────────

export interface ApiRequest {
  method: string;
  path: string; // بدون ‎/api — مثلاً ‎/auth/login
  headers: Record<string, string | undefined>;
  body?: any;
  ip?: string;
}

export interface ApiResponse {
  status: number;
  json?: unknown;
  raw?: { contentType: string; data: Uint8Array };
  headers?: Record<string, string>;
  cookies?: string[];
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

interface Ctx {
  db: Db;
  req: ApiRequest;
  user: CurrentUser | null;
  secure: boolean;
  params: Record<string, string>;
  cookies: string[];
}

interface CurrentUser {
  id: string;
  role: Role;
  name: string;
  phone: string;
  email: string;
  avatar: string | null;
  created_at: string;
}

type Handler = (c: Ctx) => Promise<unknown>;

// ───────────────────────── أدوات ─────────────────────────

const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;

function str(v: unknown, field: string, max = 500, required = true): string {
  if (v === undefined || v === null || v === '') {
    if (required) throw new HttpError(400, `الحقل «${field}» مطلوب`);
    return '';
  }
  if (typeof v !== 'string' && typeof v !== 'number') throw new HttpError(400, `قيمة «${field}» غير صحيحة`);
  const s = String(v).trim();
  if (required && !s) throw new HttpError(400, `الحقل «${field}» مطلوب`);
  if (s.length > max) throw new HttpError(400, `«${field}» طويل جداً`);
  return s;
}

function int(v: unknown, field: string, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n) || Math.floor(n) !== n || n < min || n > max) {
    throw new HttpError(400, `قيمة «${field}» لازم تكون رقم بين ${min} و ${max}`);
  }
  return n;
}

function num(v: unknown, field: string, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new HttpError(400, `قيمة «${field}» غير صحيحة`);
  return n;
}

function strList(v: unknown, field: string, maxItems = 30, maxLen = 300): string[] {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) throw new HttpError(400, `«${field}» لازم يكون قائمة`);
  return v.slice(0, maxItems).map((x) => str(x, field, maxLen, false)).filter(Boolean);
}

function oneOf<T extends string>(v: unknown, field: string, allowed: readonly T[]): T {
  if (typeof v !== 'string' || !allowed.includes(v as T)) throw new HttpError(400, `قيمة «${field}» غير مسموحة`);
  return v as T;
}

const isoDate = (d: unknown) => (d ? new Date(d as string).toISOString().slice(0, 10) : undefined);
const isoTime = (d: unknown) => (d ? new Date(d as string).toISOString() : undefined);

function requireUser(c: Ctx, ...roles: Role[]): CurrentUser {
  if (!c.user) throw new HttpError(401, 'لازم تسجّل دخول أولاً');
  if (roles.length && !roles.includes(c.user.role)) throw new HttpError(403, 'ما عندك صلاحية لهذه العملية');
  return c.user;
}

/** حد يومي بسيط (تسجيل حسابات، المساعد الذكي…) */
async function rateLimit(db: Db, key: string, limit: number) {
  const rows = await db.query<{ count: number }>(
    `INSERT INTO rate_limits (key, day, count) VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (key, day) DO UPDATE SET count = rate_limits.count + 1
     RETURNING count`,
    [key]
  );
  if ((rows[0]?.count ?? 0) > limit) throw new HttpError(429, 'وصلت الحد المسموح لليوم، جرّب بكرة');
}

async function notify(
  db: Db,
  target: { userId?: string; role?: Role },
  n: { title: string; message: string; type?: string; linkTab?: string }
) {
  if (target.userId) {
    await db.query(
      `INSERT INTO notifications (id, recipient_id, recipient_role, title, message, type, link_tab)
       SELECT $1, id, role, $2, $3, $4, $5 FROM users WHERE id = $6`,
      [newId('ntf'), n.title, n.message, n.type || 'info', n.linkTab || 'workspace', target.userId]
    );
  } else if (target.role) {
    const users = await db.query<{ id: string }>(`SELECT id FROM users WHERE role = $1 AND active`, [target.role]);
    if (users.length === 0) return;
    await db.tx(
      users.map((u) => ({
        text: `INSERT INTO notifications (id, recipient_id, recipient_role, title, message, type, link_tab)
               VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        params: [newId('ntf'), u.id, target.role, n.title, n.message, n.type || 'info', n.linkTab || 'workspace'],
      }))
    );
  }
}

// ───────────────────────── تحويل الصفوف لشكل الواجهة ─────────────────────────

function userOut(r: any) {
  return {
    id: r.id,
    name: r.name,
    email: r.email || '',
    phone: r.phone,
    role: r.role,
    avatar: r.avatar || undefined,
    createdAt: isoDate(r.created_at),
  };
}

function teacherOut(r: any, full: boolean) {
  const t: any = {
    id: r.id,
    name: r.name,
    email: full ? r.email || '' : '',
    phone: full ? r.phone : '',
    role: 'teacher',
    avatar: r.avatar || undefined,
    createdAt: isoDate(r.created_at),
    status: r.status,
    rejectionReason: r.rejection_reason || undefined,
    applicationSubmitted: !!r.application_submitted,
    qualifications: {
      ijazat: [],
      memorizationParts: 0,
      experienceYears: 0,
      specialization: '',
      bio: '',
      ...(r.qualifications || {}),
    },
    hourlyRate: r.hourly_rate != null ? Number(r.hourly_rate) : undefined,
    availableDays: r.available_days || [],
    availableTimes: r.available_times || '',
    rating: Number(r.rating ?? 5),
    studentCount: Number(r.student_count ?? 0),
    zoomLink: r.zoom_link || undefined,
  };
  return t;
}

function packageOut(r: any) {
  return {
    id: r.id,
    name: r.name,
    sessionCount: Number(r.session_count),
    sessionDurationMinutes: Number(r.session_duration_minutes),
    price: Number(r.price),
    currency: r.currency,
    description: r.description,
    features: r.features || [],
    popular: !!r.popular,
  };
}

function subOut(r: any) {
  const total = Number(r.total_sessions);
  const used = Number(r.used_sessions);
  return {
    id: r.id,
    studentId: r.student_id,
    studentName: r.student_name || '',
    studentPhone: r.student_phone || '',
    teacherId: r.teacher_id,
    teacherName: r.teacher_name || '',
    packageId: r.package_id,
    packageName: r.package_name,
    totalSessions: total,
    usedSessions: used,
    remainingSessions: Math.max(0, total - used),
    amountPaid: Number(r.amount_paid),
    currency: r.currency,
    paymentReceiptUrl: r.has_receipt ? `/api/receipts/${r.id}` : '',
    paymentStatus: r.payment_status,
    rejectionReason: r.rejection_reason || undefined,
    startDate: isoDate(r.start_date),
    expiryDate: isoDate(r.expiry_date),
    createdAt: isoDate(r.created_at),
  };
}

function sessionOut(r: any) {
  return {
    id: r.id,
    subscriptionId: r.subscription_id,
    studentId: r.student_id,
    studentName: r.student_name || '',
    teacherId: r.teacher_id,
    teacherName: r.teacher_name || '',
    date: isoDate(r.date),
    time: r.time,
    surahName: r.surah_name,
    fromAyah: Number(r.from_ayah),
    toAyah: Number(r.to_ayah),
    rating: Number(r.rating),
    tajweedNotes: r.tajweed_notes,
    homework: r.homework,
    attendance: r.attendance,
  };
}

function notifOut(r: any) {
  return {
    id: r.id,
    recipientRole: r.recipient_role,
    recipientId: r.recipient_id,
    title: r.title,
    message: r.message,
    type: r.type,
    createdAt: isoTime(r.created_at),
    isRead: !!r.is_read,
    linkTab: r.link_tab || undefined,
  };
}

function broadcastOut(r: any) {
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    priority: r.priority,
    targetRole: r.target_role,
    active: !!r.active,
    createdAt: isoTime(r.created_at),
  };
}

const TEACHER_SELECT = `
  SELECT u.id, u.name, u.email, u.phone, u.avatar, u.created_at,
         tp.status, tp.rejection_reason, tp.application_submitted, tp.qualifications,
         tp.hourly_rate, tp.available_days, tp.available_times, tp.rating, tp.zoom_link,
         (SELECT count(DISTINCT s.student_id) FROM subscriptions s
            WHERE s.teacher_id = u.id AND s.payment_status = 'approved') AS student_count
  FROM users u JOIN teacher_profiles tp ON tp.user_id = u.id`;

const SUB_SELECT = `
  SELECT s.*, st.name AS student_name, st.phone AS student_phone, te.name AS teacher_name,
         EXISTS (SELECT 1 FROM receipts r WHERE r.subscription_id = s.id) AS has_receipt
  FROM subscriptions s
  JOIN users st ON st.id = s.student_id
  JOIN users te ON te.id = s.teacher_id`;

const SESSION_SELECT = `
  SELECT se.*, st.name AS student_name, te.name AS teacher_name
  FROM sessions se
  JOIN users st ON st.id = se.student_id
  JOIN users te ON te.id = se.teacher_id`;

async function getTeacher(db: Db, id: string) {
  const rows = await db.query(`${TEACHER_SELECT} WHERE u.id = $1`, [id]);
  return rows[0] || null;
}

async function getSub(db: Db, id: string) {
  const rows = await db.query(`${SUB_SELECT} WHERE s.id = $1`, [id]);
  return rows[0] || null;
}

// ───────────────────────── المسارات ─────────────────────────

const routes: { method: string; pattern: RegExp; keys: string[]; handler: Handler; mutating: boolean }[] = [];

function route(method: string, path: string, handler: Handler) {
  const keys: string[] = [];
  const pattern = new RegExp(
    '^' + path.replace(/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$'
  );
  routes.push({ method, pattern, keys, handler, mutating: method !== 'GET' });
}

// ── الصحة
route('GET', '/health', async (c) => {
  await c.db.query('SELECT 1');
  return { ok: true };
});

// ── الحسابات
async function startSession(c: Ctx, u: { id: string; role: Role; token_version: number }) {
  const token = await signSession({ uid: u.id, role: u.role, tv: u.token_version });
  c.cookies.push(sessionCookie(token, c.secure));
}

route('POST', '/auth/register', async (c) => {
  const b = c.req.body || {};
  const role = oneOf(b.role, 'نوع الحساب', ['student', 'teacher'] as const);
  const name = str(b.name, 'الاسم', 100);
  const phone = normalizePhone(b.phone);
  if (!phone) throw new HttpError(400, 'رقم التلفون غير صحيح — اكتبه زي 0912345678 أو بالمفتاح الدولي');
  const pwErr = passwordProblem(b.password);
  if (pwErr) throw new HttpError(400, pwErr);
  const email = str(b.email, 'الإيميل', 200, false);

  await rateLimit(c.db, `register:${c.req.ip || 'unknown'}`, 20);

  const exists = await c.db.query(`SELECT 1 FROM users WHERE phone = $1`, [phone]);
  if (exists.length) throw new HttpError(409, 'الرقم ده مسجّل قبل كده — سجّل دخول بدل حساب جديد');

  const id = newId(role === 'teacher' ? 'tch' : 'std');
  const hash = await hashPassword(b.password);
  const stmts = [
    {
      text: `INSERT INTO users (id, role, name, phone, email, password_hash) VALUES ($1,$2,$3,$4,$5,$6)`,
      params: [id, role, name, phone, email, hash],
    },
  ];
  if (role === 'teacher') {
    stmts.push({ text: `INSERT INTO teacher_profiles (user_id) VALUES ($1)`, params: [id] });
  }
  try {
    await c.db.tx(stmts);
  } catch (e: any) {
    if (String(e?.message || e).includes('unique') || e?.code === '23505') {
      throw new HttpError(409, 'الرقم ده مسجّل قبل كده — سجّل دخول بدل حساب جديد');
    }
    throw e;
  }
  if (role === 'student') {
    await notify(c.db, { role: 'admin' }, {
      title: 'طالب جديد',
      message: `سجّل الطالب (${name}) حساباً جديداً في الأكاديمية.`,
      type: 'info',
    });
  }
  await startSession(c, { id, role, token_version: 0 });
  const u = (await c.db.query(`SELECT * FROM users WHERE id = $1`, [id]))[0];
  return { user: userOut(u) };
});

route('POST', '/auth/login', async (c) => {
  const b = c.req.body || {};
  const phone = normalizePhone(b.phone);
  const password = typeof b.password === 'string' ? b.password : '';
  if (!phone || !password) throw new HttpError(400, 'اكتب رقم التلفون وكلمة السر');

  const rows = await c.db.query(`SELECT * FROM users WHERE phone = $1`, [phone]);
  const u = rows[0];
  const wrong = new HttpError(401, 'رقم التلفون أو كلمة السر غير صحيحة');
  if (!u) {
    await verifyPassword(password, '$2a$10$abcdefghijklmnopqrstuuJ5e9c5mJyZ0o1r6tW0b4cVdD1Yk6x3K'); // توقيت ثابت
    throw wrong;
  }
  if (u.locked_until && new Date(u.locked_until) > new Date()) {
    throw new HttpError(429, 'محاولات كتيرة غلط — الحساب مقفول مؤقتاً، جرّب بعد 15 دقيقة');
  }
  if (!u.active) throw new HttpError(403, 'الحساب ده موقوف — تواصل مع الإدارة');
  const ok = await verifyPassword(password, u.password_hash);
  if (!ok) {
    await c.db.query(
      `UPDATE users SET failed_logins = failed_logins + 1,
         locked_until = CASE WHEN failed_logins + 1 >= 5 THEN now() + interval '15 minutes' ELSE locked_until END
       WHERE id = $1`,
      [u.id]
    );
    throw wrong;
  }
  await c.db.query(`UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = $1`, [u.id]);
  await startSession(c, u);
  return { user: userOut(u) };
});

route('POST', '/auth/logout', async (c) => {
  c.cookies.push(clearCookie(c.secure));
  return { ok: true };
});

route('GET', '/auth/me', async (c) => ({ user: c.user ? userOut(c.user) : null }));

route('POST', '/auth/password', async (c) => {
  const me = requireUser(c);
  const b = c.req.body || {};
  const pwErr = passwordProblem(b.newPassword);
  if (pwErr) throw new HttpError(400, pwErr);
  const row = (await c.db.query(`SELECT password_hash, token_version FROM users WHERE id = $1`, [me.id]))[0];
  if (!(await verifyPassword(String(b.currentPassword || ''), row.password_hash))) {
    throw new HttpError(400, 'كلمة السر الحالية غير صحيحة');
  }
  const hash = await hashPassword(b.newPassword);
  const upd = await c.db.query<{ token_version: number }>(
    `UPDATE users SET password_hash = $1, token_version = token_version + 1 WHERE id = $2 RETURNING token_version`,
    [hash, me.id]
  );
  await startSession(c, { id: me.id, role: me.role, token_version: upd[0].token_version });
  return { ok: true };
});

route('PATCH', '/auth/profile', async (c) => {
  const me = requireUser(c);
  const b = c.req.body || {};
  const name = b.name !== undefined ? str(b.name, 'الاسم', 100) : me.name;
  const email = b.email !== undefined ? str(b.email, 'الإيميل', 200, false) : me.email;
  const rows = await c.db.query(`UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *`, [name, email, me.id]);
  return { user: userOut(rows[0]) };
});

// ── تحميل كل البيانات حسب الدور
route('GET', '/bootstrap', async (c) => {
  const db = c.db;
  const me = c.user;
  const [pkgRows, bankRows] = await Promise.all([
    db.query(`SELECT * FROM packages WHERE active ORDER BY sort, created_at`),
    db.query(`SELECT value FROM settings WHERE key = 'bank_accounts'`),
  ]);
  const out: any = {
    user: me ? userOut(me) : null,
    packages: pkgRows.map(packageOut),
    bankAccounts: bankRows[0]?.value || [],
    teachers: [],
    students: [],
    subscriptions: [],
    sessions: [],
    notifications: [],
    broadcasts: [],
  };

  const isAdmin = me?.role === 'admin';
  const teacherRows = isAdmin
    ? await db.query(`${TEACHER_SELECT} ORDER BY u.created_at DESC`)
    : await db.query(`${TEACHER_SELECT} WHERE tp.status = 'approved' OR u.id = $1 ORDER BY u.created_at`, [me?.id || '']);
  // رابط الحصة يظهر فقط للمعلم نفسه والمدير والطلاب المشتركين معه باشتراك معتمد
  let myTeacherIds = new Set<string>();
  if (me?.role === 'student') {
    const rows = await db.query<{ teacher_id: string }>(
      `SELECT DISTINCT teacher_id FROM subscriptions WHERE student_id = $1 AND payment_status = 'approved'`,
      [me.id]
    );
    myTeacherIds = new Set(rows.map((r) => r.teacher_id));
  }
  out.teachers = teacherRows.map((r) => {
    const full = isAdmin || r.id === me?.id;
    const t = teacherOut(r, full);
    if (!full && !myTeacherIds.has(r.id)) delete t.zoomLink;
    return t;
  });

  if (!me) return out;

  const audience = me.role === 'admin' ? ['all', 'teachers', 'students'] : me.role === 'teacher' ? ['all', 'teachers'] : ['all', 'students'];
  const [bc, notif, ud] = await Promise.all([
    db.query(`SELECT * FROM broadcasts WHERE active AND target_role = ANY($1) ORDER BY created_at DESC LIMIT 20`, [audience]),
    db.query(`SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC LIMIT 100`, [me.id]),
    db.query<{ key: string; value: unknown }>(`SELECT key, value FROM user_data WHERE user_id = $1`, [me.id]),
  ]);
  out.broadcasts = bc.map(broadcastOut);
  out.notifications = notif.map(notifOut);
  out.userData = Object.fromEntries(ud.map((r) => [r.key, r.value]));

  if (me.role === 'admin') {
    const [stu, subs, ses] = await Promise.all([
      db.query(`SELECT * FROM users WHERE role = 'student' ORDER BY created_at DESC`),
      db.query(`${SUB_SELECT} ORDER BY s.created_at DESC`),
      db.query(`${SESSION_SELECT} ORDER BY se.date DESC, se.created_at DESC LIMIT 1000`),
    ]);
    out.students = stu.map(userOut);
    out.subscriptions = subs.map(subOut);
    out.sessions = ses.map(sessionOut);
  } else if (me.role === 'teacher') {
    const [subs, ses] = await Promise.all([
      db.query(`${SUB_SELECT} WHERE s.teacher_id = $1 AND s.payment_status = 'approved' ORDER BY s.created_at DESC`, [me.id]),
      db.query(`${SESSION_SELECT} WHERE se.teacher_id = $1 ORDER BY se.date DESC, se.created_at DESC LIMIT 1000`, [me.id]),
    ]);
    out.subscriptions = subs.map(subOut);
    out.sessions = ses.map(sessionOut);
    const ids = [...new Set(subs.map((s: any) => s.student_id))];
    if (ids.length) {
      const stu = await db.query(`SELECT * FROM users WHERE id = ANY($1)`, [ids]);
      out.students = stu.map(userOut);
    }
  } else {
    const [subs, ses] = await Promise.all([
      db.query(`${SUB_SELECT} WHERE s.student_id = $1 ORDER BY s.created_at DESC`, [me.id]),
      db.query(`${SESSION_SELECT} WHERE se.student_id = $1 ORDER BY se.date DESC, se.created_at DESC`, [me.id]),
    ]);
    out.subscriptions = subs.map(subOut);
    out.sessions = ses.map(sessionOut);
    out.students = [userOut(me)];
  }
  return out;
});

// ── المعلمات
route('POST', '/teachers/application', async (c) => {
  const me = requireUser(c, 'teacher');
  const b = c.req.body || {};
  const q = b.qualifications || {};
  const qualifications = {
    ijazat: strList(q.ijazat, 'الإجازات', 20, 300),
    memorizationParts: int(q.memorizationParts ?? 0, 'عدد الأجزاء', 0, 30),
    experienceYears: int(q.experienceYears ?? 0, 'سنوات الخبرة', 0, 80),
    specialization: str(q.specialization, 'التخصص', 300, false),
    bio: str(q.bio, 'النبذة', 3000, false),
  };
  const days = strList(b.availableDays, 'الأيام', 7, 30);
  const times = str(b.availableTimes, 'الأوقات', 200, false);
  const stmts: any[] = [
    {
      text: `UPDATE teacher_profiles SET qualifications = $1::jsonb, available_days = $2::jsonb, available_times = $3,
               application_submitted = true,
               status = CASE WHEN status = 'rejected' THEN 'pending' ELSE status END,
               rejection_reason = CASE WHEN status = 'rejected' THEN NULL ELSE rejection_reason END
             WHERE user_id = $4`,
      params: [JSON.stringify(qualifications), JSON.stringify(days), times, me.id],
    },
  ];
  if (b.name) stmts.push({ text: `UPDATE users SET name = $1 WHERE id = $2`, params: [str(b.name, 'الاسم', 100), me.id] });
  if (b.email !== undefined) stmts.push({ text: `UPDATE users SET email = $1 WHERE id = $2`, params: [str(b.email, 'الإيميل', 200, false), me.id] });
  await c.db.tx(stmts);
  const t = await getTeacher(c.db, me.id);
  await notify(c.db, { role: 'admin' }, {
    title: 'طلب انضمام جديد',
    message: `قدّمت الأستاذة (${t.name}) طلب انضمام للكادر التعليمي وبانتظار المراجعة.`,
    type: 'warning',
  });
  return { teacher: teacherOut(t, true) };
});

route('PATCH', '/teachers/me', async (c) => {
  const me = requireUser(c, 'teacher');
  const b = c.req.body || {};
  if (b.zoomLink !== undefined) {
    const link = str(b.zoomLink, 'رابط الحصة', 500, false);
    if (link && !/^https:\/\//i.test(link)) throw new HttpError(400, 'الرابط لازم يبدأ بـ https://');
    await c.db.query(`UPDATE teacher_profiles SET zoom_link = $1 WHERE user_id = $2`, [link || null, me.id]);
  }
  return { teacher: teacherOut(await getTeacher(c.db, me.id), true) };
});

route('POST', '/teachers/:id/approve', async (c) => {
  requireUser(c, 'admin');
  const rate = c.req.body?.hourlyRate != null ? num(c.req.body.hourlyRate, 'سعر الساعة', 0, 1e7) : null;
  const rows = await c.db.query(
    `UPDATE teacher_profiles SET status = 'approved', rejection_reason = NULL, hourly_rate = COALESCE($1, hourly_rate, 100)
     WHERE user_id = $2 RETURNING user_id`,
    [rate, c.params.id]
  );
  if (!rows.length) throw new HttpError(404, 'المعلمة غير موجودة');
  const t = await getTeacher(c.db, c.params.id);
  await notify(c.db, { userId: t.id }, {
    title: 'اعتماد حساب المعلمة',
    message: `مرحباً بكِ أستاذة (${t.name})! تمت الموافقة على طلب انضمامكِ، ويمكنكِ الآن البدء بتدريس الطلاب وتسجيل الحصص.`,
    type: 'success',
  });
  return { teacher: teacherOut(t, true) };
});

route('POST', '/teachers/:id/reject', async (c) => {
  requireUser(c, 'admin');
  const reason = str(c.req.body?.reason, 'سبب الرفض', 1000);
  const rows = await c.db.query(
    `UPDATE teacher_profiles SET status = 'rejected', rejection_reason = $1 WHERE user_id = $2 RETURNING user_id`,
    [reason, c.params.id]
  );
  if (!rows.length) throw new HttpError(404, 'المعلمة غير موجودة');
  await notify(c.db, { userId: c.params.id }, {
    title: 'تحديث حالة طلب الانضمام',
    message: `تمت مراجعة طلب الانضمام. السبب: ${reason}`,
    type: 'warning',
  });
  return { teacher: teacherOut(await getTeacher(c.db, c.params.id), true) };
});

// ── الباقات
function packageInput(b: any) {
  return {
    name: str(b.name, 'اسم الباقة', 150),
    sessionCount: int(b.sessionCount, 'عدد الحصص', 1, 1000),
    sessionDurationMinutes: int(b.sessionDurationMinutes, 'مدة الحصة', 5, 600),
    price: num(b.price, 'السعر', 0, 1e9),
    currency: str(b.currency, 'العملة', 50),
    description: str(b.description, 'الوصف', 2000, false),
    features: strList(b.features, 'المميزات', 30, 300),
    popular: !!b.popular,
  };
}

route('POST', '/packages', async (c) => {
  requireUser(c, 'admin');
  const p = packageInput(c.req.body || {});
  const rows = await c.db.query(
    `INSERT INTO packages (id,name,session_count,session_duration_minutes,price,currency,description,features,popular,sort)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,(SELECT COALESCE(max(sort),0)+1 FROM packages)) RETURNING *`,
    [newId('pkg'), p.name, p.sessionCount, p.sessionDurationMinutes, p.price, p.currency, p.description, JSON.stringify(p.features), p.popular]
  );
  return { package: packageOut(rows[0]) };
});

route('PUT', '/packages/:id', async (c) => {
  requireUser(c, 'admin');
  const p = packageInput(c.req.body || {});
  const rows = await c.db.query(
    `UPDATE packages SET name=$1, session_count=$2, session_duration_minutes=$3, price=$4, currency=$5,
       description=$6, features=$7::jsonb, popular=$8 WHERE id=$9 RETURNING *`,
    [p.name, p.sessionCount, p.sessionDurationMinutes, p.price, p.currency, p.description, JSON.stringify(p.features), p.popular, c.params.id]
  );
  if (!rows.length) throw new HttpError(404, 'الباقة غير موجودة');
  return { package: packageOut(rows[0]) };
});

route('DELETE', '/packages/:id', async (c) => {
  requireUser(c, 'admin');
  // حذف ناعم — الاشتراكات القديمة بتفضل محتفظة باسم الباقة
  await c.db.query(`UPDATE packages SET active = false WHERE id = $1`, [c.params.id]);
  return { ok: true };
});

// ── الحسابات البنكية
route('PUT', '/settings/bank-accounts', async (c) => {
  requireUser(c, 'admin');
  const list = c.req.body?.accounts;
  if (!Array.isArray(list) || list.length > 20) throw new HttpError(400, 'قائمة الحسابات غير صحيحة');
  const clean = list.map((a: any) => ({
    bankName: str(a.bankName, 'اسم البنك', 150),
    accountName: str(a.accountName, 'اسم الحساب', 150, false),
    accountNumber: str(a.accountNumber, 'رقم الحساب', 100, false),
    iban: str(a.iban, 'الآيبان', 100, false),
    logoColor: str(a.logoColor, 'اللون', 100, false) || 'from-emerald-600 to-teal-700',
  }));
  await c.db.query(
    `INSERT INTO settings (key, value) VALUES ('bank_accounts', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [JSON.stringify(clean)]
  );
  return { bankAccounts: clean };
});

// ── الاشتراكات
const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;

function parseReceipt(v: unknown): { mime: string; b64: string } {
  if (typeof v !== 'string') throw new HttpError(400, 'لازم ترفع صورة إيصال التحويل');
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(v);
  if (!m) throw new HttpError(400, 'صيغة صورة الإيصال غير مدعومة — استعمل صورة JPG أو PNG');
  const bytes = Math.floor((m[2].length * 3) / 4);
  if (bytes > MAX_RECEIPT_BYTES) throw new HttpError(413, 'صورة الإيصال كبيرة جداً (الحد 3 ميجا)');
  return { mime: m[1], b64: m[2] };
}

route('POST', '/subscriptions', async (c) => {
  const me = requireUser(c, 'student');
  const b = c.req.body || {};
  const receipt = parseReceipt(b.receipt);
  const pkg = (await c.db.query(`SELECT * FROM packages WHERE id = $1 AND active`, [str(b.packageId, 'الباقة', 100)]))[0];
  if (!pkg) throw new HttpError(400, 'الباقة غير موجودة');
  const teacher = (await c.db.query(
    `SELECT u.id, u.name FROM users u JOIN teacher_profiles tp ON tp.user_id = u.id
     WHERE u.id = $1 AND tp.status = 'approved' AND u.active`,
    [str(b.teacherId, 'المعلمة', 100)]
  ))[0];
  if (!teacher) throw new HttpError(400, 'المعلمة غير متاحة');

  await rateLimit(c.db, `subscribe:${me.id}`, 10);

  const id = newId('sub');
  await c.db.tx([
    {
      text: `INSERT INTO subscriptions (id, student_id, teacher_id, package_id, package_name, total_sessions, amount_paid, currency)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      params: [id, me.id, teacher.id, pkg.id, pkg.name, pkg.session_count, pkg.price, pkg.currency],
    },
    {
      text: `INSERT INTO receipts (subscription_id, mime, data_b64) VALUES ($1,$2,$3)`,
      params: [id, receipt.mime, receipt.b64],
    },
  ]);
  await notify(c.db, { role: 'admin' }, {
    title: 'إيصال تحويل جديد',
    message: `قام الطالب (${me.name}) برفع إيصال تحويل لباقة (${pkg.name}) وبانتظار المراجعة والاعتماد.`,
    type: 'warning',
  });
  return { subscription: subOut(await getSub(c.db, id)) };
});

route('GET', '/receipts/:id', async (c) => {
  const me = requireUser(c);
  const sub = (await c.db.query(`SELECT student_id FROM subscriptions WHERE id = $1`, [c.params.id]))[0];
  if (!sub) throw new HttpError(404, 'غير موجود');
  if (me.role !== 'admin' && sub.student_id !== me.id) throw new HttpError(403, 'ما عندك صلاحية');
  const r = (await c.db.query(`SELECT mime, data_b64 FROM receipts WHERE subscription_id = $1`, [c.params.id]))[0];
  if (!r) throw new HttpError(404, 'ما في إيصال');
  return {
    __raw: {
      contentType: r.mime,
      data: Uint8Array.from(Buffer.from(r.data_b64, 'base64')),
    },
  };
});

route('POST', '/subscriptions/:id/approve', async (c) => {
  requireUser(c, 'admin');
  const rows = await c.db.query(
    `UPDATE subscriptions SET payment_status = 'approved', rejection_reason = NULL,
       start_date = COALESCE(start_date, CURRENT_DATE),
       expiry_date = COALESCE(expiry_date, (CURRENT_DATE + interval '2 months')::date)
     WHERE id = $1 RETURNING id`,
    [c.params.id]
  );
  if (!rows.length) throw new HttpError(404, 'الاشتراك غير موجود');
  const s = await getSub(c.db, c.params.id);
  await notify(c.db, { userId: s.student_id }, {
    title: 'تأكيد تفعيل الباقة',
    message: `تمت مراجعة التحويل وتفعيل (${s.package_name}) بنجاح! يمكنك الآن الالتحاق بحلقة المعلمة (${s.teacher_name}).`,
    type: 'success',
  });
  await notify(c.db, { userId: s.teacher_id }, {
    title: 'طالب جديد في حلقتك',
    message: `انضم الطالب (${s.student_name}) لحلقتك بباقة (${s.package_name}).`,
    type: 'info',
  });
  return { subscription: subOut(s) };
});

route('POST', '/subscriptions/:id/reject', async (c) => {
  requireUser(c, 'admin');
  const reason = str(c.req.body?.reason, 'سبب الرفض', 1000);
  const rows = await c.db.query(
    `UPDATE subscriptions SET payment_status = 'rejected', rejection_reason = $1 WHERE id = $2 RETURNING id`,
    [reason, c.params.id]
  );
  if (!rows.length) throw new HttpError(404, 'الاشتراك غير موجود');
  const s = await getSub(c.db, c.params.id);
  await notify(c.db, { userId: s.student_id }, {
    title: 'تحديث حالة التحويل البنكي',
    message: `لم يتم اعتماد الإيصال. السبب: ${reason}`,
    type: 'warning',
  });
  return { subscription: subOut(s) };
});

route('POST', '/subscriptions/:id/add-sessions', async (c) => {
  requireUser(c, 'admin');
  const count = int(c.req.body?.count, 'عدد الحصص', 1, 500);
  const rows = await c.db.query(
    `UPDATE subscriptions SET total_sessions = total_sessions + $1 WHERE id = $2 RETURNING id`,
    [count, c.params.id]
  );
  if (!rows.length) throw new HttpError(404, 'الاشتراك غير موجود');
  return { subscription: subOut(await getSub(c.db, c.params.id)) };
});

// ── الحصص
route('POST', '/sessions', async (c) => {
  const me = requireUser(c, 'teacher', 'admin');
  const b = c.req.body || {};
  const sub = await getSub(c.db, str(b.subscriptionId, 'الاشتراك', 100));
  if (!sub) throw new HttpError(404, 'الاشتراك غير موجود');
  if (me.role === 'teacher' && sub.teacher_id !== me.id) throw new HttpError(403, 'الطالب ده ما في حلقتك');
  if (sub.payment_status !== 'approved') throw new HttpError(400, 'اشتراك الطالب غير مفعّل');

  const attendance = oneOf(b.attendance, 'الحضور', ['present', 'absent_excused', 'absent_unexcused'] as const);
  const fromAyah = int(b.fromAyah, 'من آية', 1, 286);
  const toAyah = int(b.toAyah, 'إلى آية', 1, 286);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.date || '')) ? String(b.date) : new Date().toISOString().slice(0, 10);
  const id = newId('ses');

  const rating = int(b.rating, 'التقييم', 1, 5);
  const surahName = str(b.surahName, 'السورة', 100);

  // الخصم والتسجيل في استعلام واحد ذرّي؛ الشرط بيمنع تجاوز الرصيد حتى لو اتضغط الزر مرتين
  const res = await c.db.query<{ id: string; remaining: number }>(
    `WITH upd AS (
       UPDATE subscriptions SET used_sessions = used_sessions + 1
       WHERE id = $2 AND used_sessions < total_sessions AND payment_status = 'approved'
       RETURNING id, student_id, teacher_id, total_sessions - used_sessions AS remaining
     )
     INSERT INTO sessions (id, subscription_id, student_id, teacher_id, date, time, surah_name, from_ayah, to_ayah,
                           rating, tajweed_notes, homework, attendance)
     SELECT $1, upd.id, upd.student_id, upd.teacher_id, $3, $4, $5, $6, $7, $8, $9, $10, $11 FROM upd
     RETURNING id, (SELECT remaining FROM upd) AS remaining`,
    [
      id, sub.id, date, str(b.time, 'الوقت', 30, false), surahName, fromAyah, toAyah, rating,
      str(b.tajweedNotes, 'ملاحظات التجويد', 3000, false), str(b.homework, 'الواجب', 3000, false), attendance,
    ]
  );
  if (!res.length) throw new HttpError(400, 'الطالب استهلك كل حصص الباقة — لازم يجدد الاشتراك');
  const remaining = Number(res[0].remaining);
  await notify(c.db, { userId: sub.student_id }, {
    title: 'تقييم جديد وحصة منجزة',
    message: `سجّلت المعلمة (${sub.teacher_name}) تقييم (${rating} نجوم) لحصة (${surahName}). المتبقي من رصيدك: ${remaining} حصة.`,
    type: 'info',
  });
  const s = (await c.db.query(`${SESSION_SELECT} WHERE se.id = $1`, [id]))[0];
  return { session: sessionOut(s), subscription: subOut(await getSub(c.db, sub.id)) };
});

// ── الإشعارات
route('POST', '/notifications/:id/read', async (c) => {
  const me = requireUser(c);
  await c.db.query(`UPDATE notifications SET is_read = true WHERE id = $1 AND recipient_id = $2`, [c.params.id, me.id]);
  return { ok: true };
});

route('POST', '/notifications/read-all', async (c) => {
  const me = requireUser(c);
  await c.db.query(`UPDATE notifications SET is_read = true WHERE recipient_id = $1`, [me.id]);
  return { ok: true };
});

route('DELETE', '/notifications', async (c) => {
  const me = requireUser(c);
  await c.db.query(`DELETE FROM notifications WHERE recipient_id = $1`, [me.id]);
  return { ok: true };
});

// ── تنبيهات مباشرة من المعلم لطلابه (أو من المدير لأي مستخدم)
route('POST', '/notifications/send', async (c) => {
  const me = requireUser(c, 'teacher', 'admin');
  const b = c.req.body || {};
  const title = str(b.title, 'العنوان', 200);
  const message = str(b.message, 'الرسالة', 1500);
  const kind = oneOf(b.kind || 'encouragement', 'نوع التنبيه', ['encouragement', 'attendance', 'homework'] as const);
  let ids: string[] = Array.isArray(b.recipientIds) ? b.recipientIds.filter((x: unknown) => typeof x === 'string').slice(0, 200) : [];
  if (me.role === 'teacher') {
    const mine = await c.db.query<{ student_id: string }>(
      `SELECT DISTINCT student_id FROM subscriptions WHERE teacher_id = $1 AND payment_status = 'approved'`,
      [me.id]
    );
    const allowed = new Set(mine.map((r) => r.student_id));
    ids = b.all ? [...allowed] : ids.filter((id) => allowed.has(id));
  }
  if (!ids.length) throw new HttpError(400, 'اختار طالب واحد على الأقل من طلابك المعتمدين');
  await rateLimit(c.db, `notify:${me.id}`, 300);
  const type = kind === 'encouragement' ? 'success' : kind === 'attendance' ? 'warning' : 'info';
  const sender = me.role === 'teacher' ? `من المعلم/ة ${me.name}` : 'من الإدارة';
  await c.db.tx(
    ids.map((id) => ({
      text: `INSERT INTO notifications (id, recipient_id, recipient_role, title, message, type, link_tab)
             SELECT $1, id, role, $2, $3, $4, 'workspace' FROM users WHERE id = $5`,
      params: [newId('ntf'), title, `${message}\n— ${sender}`, type, id],
    }))
  );
  return { ok: true, sent: ids.length };
});

// ── بيانات المستخدم الشخصية (أهداف، مراجعات، ملاحظات الآيات، الحلقات المؤرشفة…)
const USER_DATA_KEYS = [
  'weekly_goals', 'quick_reviews', 'ayah_notes', 'archived_circles', 'memorized_surahs', 'memorization_days',
] as const;
const USER_DATA_MAX = 300_000; // حرف

route('GET', '/me/data', async (c) => {
  const me = requireUser(c);
  const rows = await c.db.query<{ key: string; value: unknown; updated_at: string }>(
    `SELECT key, value, updated_at FROM user_data WHERE user_id = $1`,
    [me.id]
  );
  const data: Record<string, unknown> = {};
  rows.forEach((r) => (data[r.key] = r.value));
  return { data };
});

route('PUT', '/me/data/:key', async (c) => {
  const me = requireUser(c);
  const key = oneOf(c.params.key, 'المفتاح', USER_DATA_KEYS);
  const value = (c.req.body || {}).value;
  if (value === undefined) throw new HttpError(400, 'القيمة مطلوبة');
  const json = JSON.stringify(value);
  if (json.length > USER_DATA_MAX) throw new HttpError(413, 'البيانات كبيرة جداً');
  await c.db.query(
    `INSERT INTO user_data (user_id, key, value, updated_at) VALUES ($1, $2, $3::jsonb, now())
     ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [me.id, key, json]
  );
  return { ok: true };
});

// ── الإعلانات العامة
route('POST', '/broadcasts', async (c) => {
  const me = requireUser(c, 'admin');
  const b = c.req.body || {};
  const rows = await c.db.query(
    `INSERT INTO broadcasts (id, title, content, priority, target_role, created_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      newId('bc'), str(b.title, 'العنوان', 200), str(b.content, 'المحتوى', 3000),
      oneOf(b.priority || 'normal', 'الأولوية', ['normal', 'high', 'urgent'] as const),
      oneOf(b.targetRole || 'all', 'الفئة', ['all', 'teachers', 'students'] as const),
      me.id,
    ]
  );
  return { broadcast: broadcastOut(rows[0]) };
});

route('DELETE', '/broadcasts/:id', async (c) => {
  requireUser(c, 'admin');
  await c.db.query(`UPDATE broadcasts SET active = false WHERE id = $1`, [c.params.id]);
  return { ok: true };
});

// ── الإدارة: المستخدمين والنسخ الاحتياطي
route('POST', '/admin/users/:id/reset-password', async (c) => {
  const me = requireUser(c, 'admin');
  if (c.params.id === me.id) throw new HttpError(400, 'غيّر كلمة سرك من إعدادات حسابك');
  const pw = tempPassword();
  const rows = await c.db.query(
    `UPDATE users SET password_hash = $1, token_version = token_version + 1, failed_logins = 0, locked_until = NULL
     WHERE id = $2 RETURNING name, phone`,
    [await hashPassword(pw), c.params.id]
  );
  if (!rows.length) throw new HttpError(404, 'المستخدم غير موجود');
  return { tempPassword: pw, name: rows[0].name, phone: rows[0].phone };
});

route('POST', '/admin/users/:id/active', async (c) => {
  const me = requireUser(c, 'admin');
  if (c.params.id === me.id) throw new HttpError(400, 'ما بتقدر توقف حسابك');
  const active = !!c.req.body?.active;
  await c.db.query(`UPDATE users SET active = $1, token_version = token_version + 1 WHERE id = $2`, [active, c.params.id]);
  return { ok: true };
});

route('GET', '/admin/export', async (c) => {
  requireUser(c, 'admin');
  const db = c.db;
  const [users, teacherProfiles, packages, settings, subscriptions, sessions, broadcasts, userData] = await Promise.all([
    db.query(`SELECT id, role, name, phone, email, active, created_at FROM users ORDER BY created_at`),
    db.query(`SELECT * FROM teacher_profiles`),
    db.query(`SELECT * FROM packages ORDER BY sort`),
    db.query(`SELECT * FROM settings`),
    db.query(`SELECT * FROM subscriptions ORDER BY created_at`),
    db.query(`SELECT * FROM sessions ORDER BY created_at`),
    db.query(`SELECT * FROM broadcasts ORDER BY created_at`),
    db.query(`SELECT * FROM user_data ORDER BY user_id, key`),
  ]);
  return {
    format: 'quran-academy-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    note: 'كلمات السر وصور الإيصالات غير مضمّنة في النسخة لأسباب أمنية وحجمية',
    users, teacherProfiles, packages, settings, subscriptions, sessions, broadcasts, userData,
  };
});

// ── المساعد الذكي (المفتاح محفوظ في السيرفر)
route('POST', '/ai/ask', async (c) => {
  const prompt = str(c.req.body?.prompt, 'السؤال', 2000);
  const context = str(c.req.body?.context, 'السياق', 4000, false);
  await rateLimit(c.db, `ai:${c.user?.id || c.req.ip || 'anon'}`, c.user ? 100 : 30);
  const text = await askGemini(prompt, context);
  if (!text) throw new HttpError(503, 'المساعد غير متاح حالياً');
  return { text };
});

route('POST', '/gemini/tafsir', async (c) => {
  const b = c.req.body || {};
  const surah = str(b.surahName, 'السورة', 100);
  const ayahNumber = int(b.ayahNumber, 'رقم الآية', 1, 286);
  const ayahText = str(b.ayahText, 'نص الآية', 3000);
  await rateLimit(c.db, `ai:${c.user?.id || c.req.ip || 'anon'}`, c.user ? 100 : 30);
  const insight = await tafsirWithGemini(surah, ayahNumber, ayahText);
  if (!insight) throw new HttpError(503, 'التفسير الذكي غير متاح حالياً');
  return { insight };
});

// ───────────────────────── نقطة الدخول ─────────────────────────

async function loadUser(db: Db, claims: SessionClaims | null): Promise<CurrentUser | null> {
  if (!claims) return null;
  const rows = await db.query(
    `SELECT id, role, name, phone, email, avatar, created_at, token_version, active FROM users WHERE id = $1`,
    [claims.uid]
  );
  const u = rows[0];
  if (!u || !u.active || Number(u.token_version) !== claims.tv) return null;
  return u;
}

export async function handleApi(req: ApiRequest, dbOverride?: Db): Promise<ApiResponse> {
  const cookiesOut: string[] = [];
  const secure =
    (req.headers['x-forwarded-proto'] || '').includes('https') || process.env.NODE_ENV === 'production';
  try {
    const method = req.method.toUpperCase();
    const path = ('/' + req.path.replace(/^\/+/, '')).replace(/\/+$/, '') || '/';
    const match = routes.find((r) => r.method === method && r.pattern.test(path));
    if (!match) {
      const anyMethod = routes.some((r) => r.pattern.test(path));
      throw new HttpError(anyMethod ? 405 : 404, anyMethod ? 'الطريقة غير مسموحة' : 'المسار غير موجود');
    }
    // حماية CSRF: الطلبات المعدِّلة لازم تحمل ترويسة مخصصة (المتصفح ما بيرسلها من موقع تاني بدون إذن)
    if (match.mutating && req.headers['x-qa-client'] !== '1') {
      throw new HttpError(403, 'طلب غير موثوق');
    }
    const m = match.pattern.exec(path)!;
    const params: Record<string, string> = {};
    match.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));

    const db = dbOverride || (await getDb());
    await ensureSchema(db);
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
    const claims = await readSession(token);
    const user = await loadUser(db, claims);
    if (token && !user) cookiesOut.push(clearCookie(secure));

    const ctx: Ctx = { db, req, user, secure, params, cookies: cookiesOut };
    const result: any = await match.handler(ctx);
    if (result && result.__raw) {
      return {
        status: 200,
        raw: result.__raw,
        headers: { 'Cache-Control': 'private, max-age=3600' },
        cookies: cookiesOut,
      };
    }
    return { status: 200, json: result, headers: { 'Cache-Control': 'no-store' }, cookies: cookiesOut };
  } catch (e: any) {
    if (e instanceof HttpError) {
      return { status: e.status, json: { error: e.message }, headers: { 'Cache-Control': 'no-store' }, cookies: cookiesOut };
    }
    console.error('[api] unexpected error:', e);
    const msg = String(e?.message || '').includes('DATABASE_URL')
      ? 'قاعدة البيانات غير مربوطة — تأكد من DATABASE_URL في إعدادات Vercel'
      : 'حصل خطأ في السيرفر، جرّب تاني';
    return { status: 500, json: { error: msg }, headers: { 'Cache-Control': 'no-store' }, cookies: cookiesOut };
  }
}
