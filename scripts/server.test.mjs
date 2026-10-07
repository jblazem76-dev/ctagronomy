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
  assert.equal((await get('/home')).status, 301);
  assert.equal((await get('/products/')).status, 301);
  const bad = await get('/api/form', { method: 'POST', body: JSON.stringify({ form: 'quote' }) });
  assert.equal(bad.status, 400);
  const hp = await get('/api/form', { method: 'POST', body: JSON.stringify({ website: 'x' }) });
  assert.equal(hp.status, 200);
  server.close();
});
