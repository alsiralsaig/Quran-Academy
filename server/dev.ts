// سيرفر API محلي للتطوير: npm run dev:api
// بدون DATABASE_URL بيستعمل PGlite (Postgres داخل الذاكرة) — مافي حاجة تتنصب.
import 'dotenv/config';
import express from 'express';
import { handleApi } from './app.js';

if (!process.env.DATABASE_URL && !process.env.LOCAL_PGLITE) process.env.LOCAL_PGLITE = 'memory';
if (!process.env.ADMIN_PHONE) {
  process.env.ADMIN_PHONE = '0900000000';
  process.env.ADMIN_PASSWORD = 'admin123';
  console.log('⚠️  حساب مدير تجريبي للتطوير: 0900000000 / admin123');
}

const app = express();
app.use(express.json({ limit: '6mb' }));
app.all(/^\/api(\/.*)?$/, async (req, res) => {
  const headers: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(req.headers)) headers[k] = Array.isArray(v) ? v.join(', ') : v;
  const out = await handleApi({
    method: req.method,
    path: req.path.replace(/^\/api/, ''),
    headers,
    body: req.body,
    ip: req.ip,
  });
  res.status(out.status);
  for (const [k, v] of Object.entries(out.headers || {})) res.setHeader(k, v);
  if (out.cookies?.length) res.setHeader('Set-Cookie', out.cookies);
  if (out.raw) res.type(out.raw.contentType).send(Buffer.from(out.raw.data));
  else res.json(out.json ?? null);
});

const port = Number(process.env.API_PORT || 3001);
app.listen(port, '0.0.0.0', () => console.log(`API جاهز على http://localhost:${port}`));
