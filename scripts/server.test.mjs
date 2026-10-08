import { test } from 'node:test';
import assert from 'node:assert/strict';
import { server, validate } from '../server.mjs';

const start = () => new Promise((r) => server.listen(0, () => r(server.address().port)));

test('validate', () => {
  assert.equal(validate({ form: 'quote', fullname: 'A', email: 'a@b.co' }).ok, true);
  assert.equal(validate({ form: 'quote', fullname: '', email: 'a@b.co' }).ok, false);
  assert.equal(validate({ form: 'dealer', fullname: 'A', email: 'a@b.co', company: 'X' }).ok, false);
  assert.equal(validate({ form: 'quote', fullname: 'A', email: 'nope' }).ok, false);
  assert.equal(validate({ form: 'zzz' }).ok, false);
});

test('compression, validators, caching and ranges', async () => {
  const port = await start();
  const url = `http://localhost:${port}`;
  const raw = (p, headers = {}) => fetch(url + p, { redirect: 'manual', headers: { 'accept-encoding': 'identity', ...headers } });

  const plain = await raw('/');
  const plainLen = (await plain.arrayBuffer()).byteLength;
  const etag = plain.headers.get('etag');
  assert.ok(etag, 'HTML has an ETag');
  assert.match(plain.headers.get('cache-control'), /must-revalidate/);

  const br = await fetch(url + '/', { headers: { 'accept-encoding': 'br' } });
  assert.equal(br.headers.get('content-encoding'), 'br');
  assert.match(br.headers.get('vary'), /Accept-Encoding/);
  assert.ok(Number(br.headers.get('content-length')) < plainLen / 2, 'brotli shrinks the page');
  assert.match(await br.text(), /<title>/, 'decodes to the real page');
  const gzip = await fetch(url + '/', { headers: { 'accept-encoding': 'gzip' } });
  assert.equal(gzip.headers.get('content-encoding'), 'gzip');

  const again = await raw('/', { 'if-none-match': etag });
  assert.equal(again.status, 304);
  assert.equal((await again.arrayBuffer()).byteLength, 0);

  const font = await raw('/assets/fonts/source-serif-4-opsz-normal.woff2');
  assert.equal(font.status, 200);
  assert.match(font.headers.get('cache-control'), /immutable/);
  assert.equal(font.headers.get('content-encoding'), null, 'woff2 is already compressed');

  const pdf = await raw('/assets/CTA-Catalog-2026.pdf', { range: 'bytes=0-99' });
  assert.equal(pdf.status, 206);
  assert.equal((await pdf.arrayBuffer()).byteLength, 100);
  assert.match(pdf.headers.get('content-range'), /^bytes 0-99\/\d+$/);
  assert.equal((await raw('/assets/CTA-Catalog-2026.pdf', { range: 'bytes=999999999-' })).status, 416);

  assert.equal((await raw('/nope')).headers.get('cache-control'), 'no-store');
  server.closeAllConnections(); server.close();
});

test('serves pages, real 404s, redirects, form api', async () => {
  const port = await start();
  const get = (p, o) => fetch(`http://localhost:${port}${p}`, { redirect: 'manual', ...o });
  assert.equal((await get('/')).status, 200);
  assert.equal((await get('/products')).status, 200);
  assert.equal((await get('/products/humic')).status, 200);
  const nf = await get('/products/nope');
  assert.equal(nf.status, 404);
  assert.match(await nf.text(), /the press\./);
  assert.equal((await get('/nope')).status, 404);
  assert.equal((await get('/../server.mjs')).status, 404);
  const apex = await get('/products?x=1', { headers: { 'x-forwarded-host': 'ctagronomy.com' } });
  assert.equal(apex.status, 301);
  assert.equal(apex.headers.get('location'), 'https://www.ctagronomy.com/products?x=1');
  assert.equal((await get('/home')).status, 301);
  const old = await get('/products.html?x=1');
  assert.equal(old.status, 301);
  assert.equal(old.headers.get('location'), '/products?x=1');
  assert.equal((await get('/products/')).status, 301);
  const bad = await get('/api/form', { method: 'POST', body: JSON.stringify({ form: 'quote' }) });
  assert.equal(bad.status, 400);
  const hp = await get('/api/form', { method: 'POST', body: JSON.stringify({ website: 'x' }) });
  assert.equal(hp.status, 200);
  server.close();
});
