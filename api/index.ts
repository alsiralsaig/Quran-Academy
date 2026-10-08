// نقطة دخول Vercel — كل طلبات ‎/api/* بتتحول هنا (شوف vercel.json).
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApi } from '../server/app.js';

type VercelReq = IncomingMessage & { body?: any; query?: Record<string, string | string[]> };

export default async function handler(req: VercelReq, res: ServerResponse) {
  const url = new URL(req.url || '/', 'http://x');
  // المسار الأصلي: إما من باراميتر إعادة التوجيه أو من الرابط نفسه
  const q = url.searchParams.get('__path');
  const path = q !== null ? '/' + q : url.pathname.replace(/^\/api/, '');

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = undefined; }
  }

  const headers: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(req.headers)) headers[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : v;
  const ip = (headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '';

  const out = await handleApi({ method: req.method || 'GET', path, headers, body, ip });

  res.statusCode = out.status;
  for (const [k, v] of Object.entries(out.headers || {})) res.setHeader(k, v);
  if (out.cookies?.length) res.setHeader('Set-Cookie', out.cookies);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (out.raw) {
    res.setHeader('Content-Type', out.raw.contentType);
    res.end(Buffer.from(out.raw.data));
  } else {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(out.json ?? null));
  }
}
