// محاكاة فتح التطبيق بوضع المعلمة وجمع الأخطاء
import pkg from 'jsdom';
const { JSDOM, ResourceLoader, VirtualConsole } = pkg;
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

const DIST = '/home/user/Quran-Academy/dist';
const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = join(DIST, p);
  if (existsSync(f) && statSync(f).isFile()) {
    res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' });
    res.end(readFileSync(f));
  } else {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(readFileSync(join(DIST, 'index.html'))); // SPA fallback
  }
});
await new Promise((r) => server.listen(4321, r));

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push('JSDOM: ' + (e.detail?.stack || e.stack || e.message).split('\n').slice(0, 4).join(' | ')));
vc.on('error', (...a) => errors.push('console.error: ' + a.map(String).join(' ').slice(0, 300)));
vc.on('warn', () => {});
vc.on('log', () => {});

const dom = new JSDOM(await fetch('http://127.0.0.1:4321/?app=teacher').then((r) => r.text()), {
  url: 'http://127.0.0.1:4321/?app=teacher',
  runScripts: 'dangerously',
  resources: new ResourceLoader({ proxy: '' }),
  pretendToBeVisual: true,
  virtualConsole: vc,
});
dom.window.fetch = (u, o) => fetch(u.startsWith('http') ? u : 'http://127.0.0.1:4321' + u, o);
dom.window.Request = undefined;
await new Promise((r) => setTimeout(r, 6000));
const root = dom.window.document.getElementById('root');
console.log('═══ محتوى الـ root:');
console.log(root ? (root.innerHTML.length > 100 ? 'فيه محتوى (' + root.innerHTML.length + ' حرف)' : 'فاضي — شاشة بيضاء!') : 'مفيش root');
console.log('═══ أول 300 حرف من الشاشة:');
console.log(root ? root.textContent.replace(/\s+/g, ' ').slice(0, 300) : '—');
console.log('═══ الأخطاء (' + errors.length + '):');
errors.slice(0, 6).forEach((e) => console.log('•', e.slice(0, 400)));
process.exit(0);
