// إنشاء الجداول تلقائياً (آمن للتشغيل أكثر من مرة) + البيانات الأولية + حساب المدير من متغيرات البيئة.
import type { Db } from './db.js';
import { hashPassword, normalizePhone } from './auth.js';
import { DEFAULT_PACKAGES, DEFAULT_BANK_ACCOUNTS } from './seed.js';

export const SCHEMA_VERSION = 1;

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS schema_meta (
     id INT PRIMARY KEY DEFAULT 1,
     version INT NOT NULL,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     role TEXT NOT NULL CHECK (role IN ('admin','teacher','student')),
     name TEXT NOT NULL,
     phone TEXT NOT NULL UNIQUE,
     email TEXT NOT NULL DEFAULT '',
     password_hash TEXT NOT NULL,
     avatar TEXT,
     active BOOLEAN NOT NULL DEFAULT true,
     failed_logins INT NOT NULL DEFAULT 0,
     locked_until TIMESTAMPTZ,
     token_version INT NOT NULL DEFAULT 0,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS teacher_profiles (
     user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
     rejection_reason TEXT,
     application_submitted BOOLEAN NOT NULL DEFAULT false,
     qualifications JSONB NOT NULL DEFAULT '{}'::jsonb,
     hourly_rate NUMERIC,
     available_days JSONB NOT NULL DEFAULT '[]'::jsonb,
     available_times TEXT NOT NULL DEFAULT '',
     rating NUMERIC NOT NULL DEFAULT 5,
     zoom_link TEXT
   )`,
  `CREATE TABLE IF NOT EXISTS packages (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     session_count INT NOT NULL,
     session_duration_minutes INT NOT NULL,
     price NUMERIC NOT NULL,
     currency TEXT NOT NULL,
     description TEXT NOT NULL DEFAULT '',
     features JSONB NOT NULL DEFAULT '[]'::jsonb,
     popular BOOLEAN NOT NULL DEFAULT false,
     active BOOLEAN NOT NULL DEFAULT true,
     sort INT NOT NULL DEFAULT 0,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS settings (
     key TEXT PRIMARY KEY,
     value JSONB NOT NULL,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
     id TEXT PRIMARY KEY,
     student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     teacher_id TEXT NOT NULL REFERENCES users(id),
     package_id TEXT NOT NULL,
     package_name TEXT NOT NULL,
     total_sessions INT NOT NULL,
     used_sessions INT NOT NULL DEFAULT 0,
     amount_paid NUMERIC NOT NULL,
     currency TEXT NOT NULL,
     payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','approved','rejected')),
     rejection_reason TEXT,
     start_date DATE,
     expiry_date DATE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS subscriptions_student_idx ON subscriptions(student_id)`,
  `CREATE INDEX IF NOT EXISTS subscriptions_teacher_idx ON subscriptions(teacher_id)`,
  `CREATE TABLE IF NOT EXISTS receipts (
     subscription_id TEXT PRIMARY KEY REFERENCES subscriptions(id) ON DELETE CASCADE,
     mime TEXT NOT NULL,
     data_b64 TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS sessions (
     id TEXT PRIMARY KEY,
     subscription_id TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
     student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     teacher_id TEXT NOT NULL REFERENCES users(id),
     date DATE NOT NULL,
     time TEXT NOT NULL DEFAULT '',
     surah_name TEXT NOT NULL,
     from_ayah INT NOT NULL,
     to_ayah INT NOT NULL,
     rating INT NOT NULL,
     tajweed_notes TEXT NOT NULL DEFAULT '',
     homework TEXT NOT NULL DEFAULT '',
     attendance TEXT NOT NULL CHECK (attendance IN ('present','absent_excused','absent_unexcused')),
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS sessions_teacher_idx ON sessions(teacher_id)`,
  `CREATE INDEX IF NOT EXISTS sessions_student_idx ON sessions(student_id)`,
  `CREATE TABLE IF NOT EXISTS notifications (
     id TEXT PRIMARY KEY,
     recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     recipient_role TEXT NOT NULL,
     title TEXT NOT NULL,
     message TEXT NOT NULL,
     type TEXT NOT NULL DEFAULT 'info',
     link_tab TEXT,
     is_read BOOLEAN NOT NULL DEFAULT false,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS notifications_recipient_idx ON notifications(recipient_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS broadcasts (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     priority TEXT NOT NULL DEFAULT 'normal',
     target_role TEXT NOT NULL DEFAULT 'all',
     active BOOLEAN NOT NULL DEFAULT true,
     created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
     key TEXT NOT NULL,
     day DATE NOT NULL,
     count INT NOT NULL DEFAULT 0,
     PRIMARY KEY (key, day)
   )`,
];

async function seed(db: Db) {
  const pk = await db.query<{ n: string }>(`SELECT count(*)::text AS n FROM packages`);
  if (pk[0]?.n === '0') {
    await db.tx(
      DEFAULT_PACKAGES.map((p, i) => ({
        text: `INSERT INTO packages (id,name,session_count,session_duration_minutes,price,currency,description,features,popular,sort)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10) ON CONFLICT (id) DO NOTHING`,
        params: [p.id, p.name, p.sessionCount, p.sessionDurationMinutes, p.price, p.currency, p.description, JSON.stringify(p.features), !!p.popular, i],
      }))
    );
  }
  await db.query(
    `INSERT INTO settings (key, value) VALUES ('bank_accounts', $1::jsonb) ON CONFLICT (key) DO NOTHING`,
    [JSON.stringify(DEFAULT_BANK_ACCOUNTS)]
  );
}

/** ينشئ حساب المدير من ADMIN_PHONE و ADMIN_PASSWORD لو ما في مدير */
export async function ensureAdmin(db: Db) {
  const rawPhone = process.env.ADMIN_PHONE || '';
  const password = process.env.ADMIN_PASSWORD || '';
  if (!rawPhone || !password) return;
  const phone = normalizePhone(rawPhone);
  if (!phone) return;
  const admins = await db.query(`SELECT id FROM users WHERE role='admin' LIMIT 1`);
  if (admins.length > 0) return;
  const hash = await hashPassword(password);
  await db.query(
    `INSERT INTO users (id, role, name, phone, email, password_hash)
     VALUES ('admin_1','admin',$1,$2,'',$3)
     ON CONFLICT (phone) DO UPDATE SET role='admin', password_hash=EXCLUDED.password_hash`,
    [process.env.ADMIN_NAME || 'الإدارة العامة', phone, hash]
  );
}

const ready = new WeakMap<Db, Promise<void>>();

/** يتأكد من وجود الجداول مرة واحدة لكل اتصال */
export function ensureSchema(db: Db): Promise<void> {
  let p = ready.get(db);
  if (!p) {
    p = (async () => {
      const meta = await db
        .query<{ version: number }>(`SELECT version FROM schema_meta WHERE id=1`)
        .catch(() => [] as { version: number }[]);
      if (!meta[0] || meta[0].version < SCHEMA_VERSION) {
        for (const stmt of DDL) await db.query(stmt);
        await db.query(
          `INSERT INTO schema_meta (id, version) VALUES (1, $1)
           ON CONFLICT (id) DO UPDATE SET version = EXCLUDED.version, updated_at = now()`,
          [SCHEMA_VERSION]
        );
        await seed(db);
      }
      await ensureAdmin(db);
    })();
    p.catch(() => ready.delete(db));
    ready.set(db, p);
  }
  return p;
}
