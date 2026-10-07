// Zero-dependency production server for Azure Container Apps.
// Serves the Astro build from ./dist, returns a real 404 status with the 404 page,
// applies 301 redirects, and delivers form submissions by email via Resend.
//
// Env: PORT (default 8080), RESEND_API_KEY, FORM_TO (default ctagronomy@gmail.com),
//      FORM_FROM (a sender on a Resend-verified domain; default onboarding@resend.dev)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(fileURLToPath(new URL('./dist', import.meta.url)));
const PORT = Number(process.env.PORT) || 8080;
const TO = process.env.FORM_TO || 'ctagronomy@gmail.com';
const FROM = process.env.FORM_FROM || 'CTA Website <onboarding@resend.dev>';

// Old URL -> new URL (301). The old site is static .html on GoDaddy, so the likely
// old paths are the page names with .html. Add real ones from the old site's file list.
export const REDIRECTS = {
  '/index.html': '/',
  '/home': '/',
  '/home.html': '/',
  '/product': '/products',
  '/products.html': '/products',
  '/product.html': '/products',
  '/programs.html': '/programs',
  '/science.html': '/science',
  '/resources.html': '/resources',
  '/dealer.html': '/dealer',
  '/dealers.html': '/dealer',
  '/contact.html': '/contact',
  '/contact-us': '/contact',
  '/contact-us.html': '/contact',
};

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.woff': 'font/woff',
};
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
};

async function exists(p) { try { return (await stat(p)).isFile(); } catch { return false; } }

async function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const base = join(DIST, clean);
  if (!base.startsWith(DIST)) return null;
  for (const c of [base, base + '.html', join(base, 'index.html')]) if (await exists(c)) return c;
  return null;
}

function cache(file) {
  if (file.includes('/_astro/')) return 'public, max-age=31536000, immutable';
  if (/\.(png|jpe?g|webp|avif|svg|pdf|woff2?)$/.test(file)) return 'public, max-age=86400';
  return 'public, max-age=0, must-revalidate';
}

async function serve(req, res, pathname) {
  let status = 200;
  let file = await resolveFile(pathname);
  if (!file) { status = 404; file = join(DIST, '404.html'); }
  const buf = await readFile(file);
  res.writeHead(status, { ...SECURITY, 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Content-Length': buf.length, 'Cache-Control': status === 404 ? 'no-store' : cache(file) });
  res.end(req.method === 'HEAD' ? undefined : buf);
}

/* ---- forms ---- */
const REQUIRED = { contact: ['fullname', 'email'], quote: ['fullname', 'email'], dealer: ['fullname', 'company', 'email', 'territory'] };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LABELS = { fullname: 'Name', org: 'Organization', company: 'Company', email: 'Email', phone: 'Phone', type: 'I manage', customers: 'Customers are mostly', territory: 'Territory', message: 'Message' };
const hits = new Map(); // naive per-IP rate limit: 8 posts / 10 min

const clip = (v, n = 4000) => String(v ?? '').slice(0, n);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function readJson(req, limit = 32_000) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > limit) throw Object.assign(new Error('too large'), { code: 413 }); chunks.push(c); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export function validate(data) {
  const kind = REQUIRED[data.form] ? data.form : null;
  if (!kind) return { ok: false, error: 'unknown form' };
  for (const f of REQUIRED[kind]) if (!clip(data[f]).trim()) return { ok: false, error: `missing ${f}` };
  if (!EMAIL.test(clip(data.email).trim())) return { ok: false, error: 'bad email' };
  return { ok: true, kind };
}

async function sendMail(kind, data) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');
  const rows = Object.keys(LABELS).filter((k) => data[k]).map((k) => [LABELS[k], clip(data[k])]);
  const subject = { quote: 'Quote request (popup)', contact: 'Quote request (contact page)', dealer: 'Dealer application' }[kind] + ' — ' + clip(data.fullname, 80);
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM, to: [TO], reply_to: clip(data.email, 200).trim(), subject,
      html: `<table>${rows.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table><p>Sent from ${esc(clip(data.page, 200))}</p>`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    }),
  });
  if (!r.ok) throw new Error('mail provider ' + r.status);
}

async function handleForm(req, res) {
  const json = (code, obj) => { res.writeHead(code, { ...SECURITY, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
  if (req.method !== 'POST') return json(405, { ok: false });
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600_000);
  if (recent.length >= 8) return json(429, { ok: false });
  hits.set(ip, [...recent, now]);
  try {
    const data = await readJson(req);
    if (data.website) return json(200, { ok: true }); // honeypot: pretend success
    const v = validate(data);
    if (!v.ok) return json(400, v);
    await sendMail(v.kind, data);
    return json(200, { ok: true });
  } catch (e) {
    console.error('form error:', e.message);
    return json(e.code === 413 ? 413 : 502, { ok: false });
  }
}

export const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/form') return await handleForm(req, res);
    if (url.pathname === '/healthz') { res.writeHead(200); return res.end('ok'); }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    const to = REDIRECTS[url.pathname.replace(/(.)\/$/, '$1')];
    if (to) { res.writeHead(301, { Location: to + url.search }); return res.end(); }
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) { res.writeHead(301, { Location: url.pathname.slice(0, -1) + url.search }); return res.end(); }
    await serve(req, res, url.pathname);
  } catch (e) {
    console.error(e);
    res.writeHead(500); res.end('Server error');
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, '0.0.0.0', () => console.log(`listening on ${PORT}`));
}
