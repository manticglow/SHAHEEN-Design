// اختبارات لوحة التحكم بدون إنترنت: node test/cms.mjs
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import worker from '../lib/app.js';
import { DEFAULT_CONTENT } from '../lib/content-default.js';

const ORIGIN = 'https://api.example';
function makeKV() {
  const m = new Map();
  return {
    m,
    async get(k, type) { const e = m.get(k); if (!e) return null; const v = e.v; if (type === 'json') return JSON.parse(v); if (type === 'arrayBuffer') return v; return typeof v === 'string' ? v : new TextDecoder().decode(v); },
    async getWithMetadata(k, type) { const e = m.get(k); if (!e) return { value: null, metadata: null }; return { value: await this.get(k, type), metadata: e.meta || null }; },
    async put(k, v, o = {}) { m.set(k, { v: typeof v === 'string' ? v : v, meta: o.metadata }); },
  };
}
const sent = [];
const env = {
  BOT_KV: makeKV(), ADMIN_PASSWORD: 'correct horse battery', SESSION_SECRET: 's'.repeat(40), SITE_URL: 'https://site.example',
  APP_SECRET: 'app', PHONE_NUMBER_ID: '111', WA_TOKEN: 't', MODE: 'coexistence', OWNER_NAME: 'عبدالرحمن', OWNER_WA: '966582409776',
  LEADS_KEY: 'k',
  __fetch: async (url, init) => { sent.push(JSON.parse(init.body)); return new Response('{}'); },
};
const call = (path, { method = 'GET', body, headers = {}, cookie, ip = '1.1.1.1', origin = ORIGIN } = {}) => {
  const h = { 'cf-connecting-ip': ip, ...headers };
  if (cookie) h.cookie = cookie;
  if (origin && method !== 'GET') h.origin = origin;
  if (body !== undefined && typeof body !== 'string' && !(body instanceof Uint8Array)) { h['content-type'] = 'application/json'; body = JSON.stringify(body); }
  return worker.fetch(new Request(ORIGIN + path, { method, body, headers: h }), env, null);
};
const clone = (o) => JSON.parse(JSON.stringify(o));
let n = 0; const t = async (name, fn) => { await fn(); n++; console.log('✓ ' + name); };

await t('public content works without login, with CORS', async () => {
  const r = await call('/api/content');
  assert.equal(r.status, 200); assert.equal(r.headers.get('access-control-allow-origin'), '*');
  const c = await r.json(); assert.equal(c.services.length, DEFAULT_CONTENT.services.length);
});
await t('default content passes its own validation', async () => {
  const { validate } = await import('../lib/cms.js'); assert.deepEqual(validate(clone(DEFAULT_CONTENT)), []);
});
await t('admin page is served with CSP and no-frame', async () => {
  const r = await call('/admin'); assert.equal(r.status, 200);
  assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'none'/); assert.match(await r.text(), /لوحة تحكم شاهين ديزاين/);
});
await t('writes refuse without login', async () => {
  assert.equal((await call('/api/me')).status, 401);
  assert.equal((await call('/api/content', { method: 'PUT', body: DEFAULT_CONTENT })).status, 401);
  assert.equal((await call('/api/media', { method: 'POST', body: new Uint8Array([1]), headers: { 'content-type': 'image/png' } })).status, 401);
});
await t('wrong password 5 times locks that IP', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await call('/api/login', { method: 'POST', body: { password: 'x' }, ip: '9.9.9.9' })).status, 401);
  assert.equal((await call('/api/login', { method: 'POST', body: { password: env.ADMIN_PASSWORD }, ip: '9.9.9.9' })).status, 429);
});
await t('login from another site is refused', async () => {
  assert.equal((await call('/api/login', { method: 'POST', body: { password: env.ADMIN_PASSWORD }, origin: 'https://evil.example' })).status, 403);
});
let cookie;
await t('correct password gives a secure session cookie', async () => {
  const r = await call('/api/login', { method: 'POST', body: { password: env.ADMIN_PASSWORD } });
  assert.equal(r.status, 200);
  const sc = r.headers.get('set-cookie'); assert.match(sc, /HttpOnly/); assert.match(sc, /Secure/); assert.match(sc, /SameSite=Strict/);
  cookie = sc.split(';')[0];
  const me = await (await call('/api/me', { cookie })).json(); assert.equal(me.ok, true); assert.equal(me.siteUrl, 'https://site.example');
});
await t('tampered or forged cookie is refused', async () => {
  const [p, s] = cookie.split('=')[1].split('.');
  const forgedPayload = Buffer.from(JSON.stringify({ exp: Date.now() + 1e12 })).toString('base64url');
  assert.equal((await call('/api/me', { cookie: `sd_admin=${forgedPayload}.${s}` })).status, 401);
  assert.equal((await call('/api/me', { cookie: `sd_admin=${p}.AAAA${s.slice(4)}` })).status, 401);
});
await t('expired session is refused', async () => {
  const orig = Date.now; Date.now = () => orig() + 8 * 86400e3;
  try { assert.equal((await call('/api/me', { cookie })).status, 401); } finally { Date.now = orig; }
});
await t('bad content is rejected with clear Arabic errors', async () => {
  const c = clone(DEFAULT_CONTENT);
  c.services[0].botTitle = 'عنوان طويل جدًا يتجاوز حد واتساب للصف';
  c.works[0].bg = 'red'; c.works[0].site = 'javascript:alert(1)'; c.works[1].logo = 'images/../../etc/passwd';
  c.settings.bank.iban = 'SA12'; c.works[2].id = c.works[0].id;
  const r = await call('/api/content', { method: 'PUT', body: c, cookie });
  assert.equal(r.status, 422);
  const { errors } = await r.json();
  for (const re of [/عنوان البوت/, /لون البطاقة/, /https/, /رابط صورة/, /الآيبان/, /مكرر/]) assert.ok(errors.some((e) => re.test(e)), 'missing error ' + re);
});
await t('more than 9 services in one group is rejected (WhatsApp list limit)', async () => {
  const c = clone(DEFAULT_CONTENT);
  for (let i = 0; i < 2; i++) c.services.push({ ...c.services.find((s) => s.group === 'co'), id: 'extra-' + i });
  const r = await call('/api/content', { method: 'PUT', body: c, cookie }); assert.equal(r.status, 422);
  assert.ok((await r.json()).errors.some((e) => /٩ خدمات/.test(e)));
});
await t('save from another site is refused even with the cookie', async () => {
  assert.equal((await call('/api/content', { method: 'PUT', body: DEFAULT_CONTENT, cookie, origin: 'https://evil.example' })).status, 403);
});
let mediaUrl;
await t('image upload: stored by hash, served safely; wrong types and big files refused', async () => {
  const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));
  const r = await call('/api/media', { method: 'POST', body: png, headers: { 'content-type': 'image/png' }, cookie });
  assert.equal(r.status, 200); const j = await r.json(); mediaUrl = j.url; assert.match(j.url, /^\/media\/[\w-]+\.png$/);
  const g = await call(j.url);
  assert.equal(g.status, 200); assert.equal(g.headers.get('content-type'), 'image/png'); assert.equal(g.headers.get('x-content-type-options'), 'nosniff'); assert.match(g.headers.get('content-security-policy'), /sandbox/);
  assert.equal(Buffer.from(await g.arrayBuffer()).length, png.length);
  assert.equal((await call('/api/media', { method: 'POST', body: new TextEncoder().encode('<script>'), headers: { 'content-type': 'text/html' }, cookie })).status, 415);
  assert.equal((await call('/api/media', { method: 'POST', body: new Uint8Array(2 * 1024 * 1024 + 1), headers: { 'content-type': 'image/png' }, cookie })).status, 413);
  assert.equal((await call('/media/../content')).status, 404);
});
await t('save works: version goes up, site sees the change, history keeps old versions', async () => {
  const c = clone(DEFAULT_CONTENT);
  c.works[0].name = 'NEW BRAND'; c.works[0].logo = mediaUrl;
  c.services.push({ id: 'ecommerce-audit', group: 'sector', name: 'تدقيق متاجر', en: 'Store Audit', short: 'نراجع متجرك', body: 'شرح', gets: ['تقرير'], time: '', formLabel: 'تدقيق متجر', botTitle: 'تدقيق متجر', botDesc: 'نراجع متجرك ونعطيك خطة' });
  let r = await call('/api/content', { method: 'PUT', body: c, cookie }); assert.equal(r.status, 200); assert.equal((await r.json()).version, 1);
  const live = await (await call('/api/content')).json(); assert.equal(live.works[0].name, 'NEW BRAND'); assert.equal(live.version, 1);
  c.hero.line1 = 'سطر جديد';
  r = await call('/api/content', { method: 'PUT', body: c, cookie }); assert.equal((await r.json()).version, 2);
  const hist = await (await call('/api/history', { cookie })).json(); assert.equal(hist.length, 1); assert.equal(hist[0].version, 1);
  const old = await (await call('/api/history/restore', { method: 'POST', body: { ts: hist[0].ts }, cookie })).json();
  assert.notEqual(old.hero.line1, 'سطر جديد'); assert.equal(old.works[0].name, 'NEW BRAND');
});
await t('WhatsApp bot shows the service you added from the panel', async () => {
  const send = async (msg, id) => {
    const raw = JSON.stringify({ object: 'whatsapp_business_account', entry: [{ changes: [{ field: 'messages', value: { metadata: { phone_number_id: '111' }, contacts: [{ wa_id: '966511111111', profile: { name: 'سارة' } }], messages: [{ from: '966511111111', id, timestamp: String(Math.floor(Date.now() / 1000)), ...msg }] } }] }] });
    const sig = 'sha256=' + crypto.createHmac('sha256', env.APP_SECRET).update(raw).digest('hex');
    sent.length = 0;
    const r = await worker.fetch(new Request(ORIGIN + '/webhook', { method: 'POST', body: raw, headers: { 'x-hub-signature-256': sig } }), env, null);
    assert.equal(r.status, 200);
    return sent.find((b) => b.type === 'interactive' && b.interactive.type === 'list');
  };
  await send({ type: 'text', text: { body: 'هلا' } }, 'w1');
  const lst = await send({ type: 'interactive', interactive: { type: 'list_reply', list_reply: { id: 'cat_sector', title: 'x' } } }, 'w2');
  assert.ok(lst, 'no list sent');
  assert.ok(lst.interactive.action.sections[0].rows.some((row) => row.id === 'svc_ecommerce-audit' && row.title === 'تدقيق متجر'));
});
await t('orders page opens with the owner session (no key needed)', async () => {
  assert.equal((await call('/leads')).status, 403);
  assert.equal((await call('/leads', { cookie })).status, 200);
  assert.equal((await call('/leads?key=k')).status, 200);
});
await t('logout clears the cookie', async () => {
  const r = await call('/api/logout', { method: 'POST', cookie }); assert.match(r.headers.get('set-cookie'), /Max-Age=0/);
});
console.log(`\n${n} passed`);
