// تعديلات المتجر من اللوحة: node test/store.mjs
import assert from 'node:assert/strict';
import worker from '../lib/app.js';
import { servePublic } from '../lib/seo.js';

function makeKV() { const m = new Map(); return { m, async get(k, t) { const v = m.get(k); if (v == null) return null; return t === 'json' ? JSON.parse(v) : v; }, async put(k, v) { m.set(k, String(v)); } }; }
const ORIGIN = 'https://shaheen.test';
const env = { BOT_KV: makeKV(), ADMIN_PASSWORD: 'pw-123456', SESSION_SECRET: 's'.repeat(40) };
const call = (path, { method = 'GET', body, cookie, origin = ORIGIN } = {}) => {
  const h = { origin, 'content-type': 'application/json' }; if (cookie) h.cookie = cookie;
  return worker.fetch(new Request(ORIGIN + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) }), env, {});
};
let n = 0; const t = async (name, fn) => { await fn(); n++; };

await t('store API needs login', async () => {
  assert.equal((await call('/api/store')).status, 401);
  assert.equal((await call('/api/store', { method: 'PUT', body: {} })).status, 401);
});
const r = await call('/api/login', { method: 'POST', body: { password: env.ADMIN_PASSWORD } });
const cookie = r.headers.get('set-cookie').split(';')[0];

await t('defaults list the site products', async () => {
  const d = await (await call('/api/store/defaults', { cookie })).json();
  assert.ok(d.length >= 10); assert.ok(d.find((p) => p.id === 'salla' && p.tiers.length === 3));
});
await t('bad edits are refused with clear errors', async () => {
  let x = await call('/api/store', { method: 'PUT', cookie, body: { products: { nope: {} } } }); assert.equal(x.status, 422);
  x = await call('/api/store', { method: 'PUT', cookie, body: { products: { salla: { tiers: [{ price: -5 }] } } } }); assert.equal(x.status, 422);
  x = await call('/api/store', { method: 'PUT', cookie, body: { book: { from: 20, to: 18 } } }); assert.equal(x.status, 422);
  x = await call('/api/store', { method: 'PUT', cookie, origin: 'https://evil.example', body: {} }); assert.equal(x.status, 403);
});
await t('saving edits keeps history', async () => {
  let x = await call('/api/store', { method: 'PUT', cookie, body: { products: { salla: { full: 'ثيم سلة فاخر', tiers: [{ price: 4900 }] }, hr: { hidden: true } }, book: { closed: ['2030-01-06'] } } });
  assert.equal(x.status, 200);
  x = await call('/api/store', { method: 'PUT', cookie, body: { products: { salla: { full: 'ثيم سلة فاخر', tiers: [{ price: 4900 }] }, hr: { hidden: true } }, book: { closed: ['2030-01-06'], from: 16 } } });
  assert.equal((await x.json()).version, 2);
  const h = await (await call('/api/store/history', { cookie })).json(); assert.equal(h.length, 1);
});
await t('pages, prices and sitemap follow the edits', async () => {
  const page = (p) => servePublic(new URL(ORIGIN + p), undefined, env.BOT_KV);
  let res = await page('/salla'); let h = await res.text();
  assert.match(h, /<title>ثيم سلة فاخر في جدة \| يبدأ من 4,900 ر.س/);
  assert.match(h, /window.SD_STORE=\{"products":/);
  res = await page('/hr'); assert.equal(res.status, 404, 'hidden product has no page');
  h = await (await page('/sitemap.xml')).text(); assert.ok(!h.includes('/hr<'), 'hidden product not in sitemap'); assert.ok(h.includes('/salla<'));
  res = await page('/'); assert.equal(res.status, 200);
});
await t('site works without database', async () => {
  const res = await servePublic(new URL(ORIGIN + '/salla')); assert.equal(res.status, 200);
  assert.match(await res.text(), /يبدأ من 4,500/);
});
console.log(`store: ${n} passed`);
