// اختبار نسخة Vercel + Supabase على خادم Supabase وهمي: node test/supabase.mjs
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

// ---- Supabase وهمي (REST + Storage) ----
const rows = new Map(); const files = new Map(); const seenHeaders = [];
const srv = http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c); const body = Buffer.concat(chunks);
  const u = new URL(req.url, 'http://x'); seenHeaders.push(req.headers);
  if (req.headers.apikey !== 'sb_secret_test') { res.writeHead(401); return res.end('bad key'); }
  if (u.pathname === '/rest/v1/kv' && req.method === 'GET') {
    const k = decodeURIComponent((u.searchParams.get('key') || '').replace(/^eq\./, ''));
    res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify(rows.has(k) ? [rows.get(k)] : []));
  }
  if (u.pathname === '/rest/v1/kv' && req.method === 'POST') {
    assert.match(req.headers.prefer, /merge-duplicates/); const r = JSON.parse(body); rows.set(r.key, r); res.writeHead(201); return res.end();
  }
  if (u.pathname === '/rest/v1/kv' && req.method === 'DELETE') { res.writeHead(204); return res.end(); }
  const m = u.pathname.match(/^\/storage\/v1\/object\/media\/(.+)$/);
  if (m && req.method === 'POST') { files.set(m[1], { type: req.headers['content-type'], body }); res.writeHead(200, { 'content-type': 'application/json' }); return res.end('{}'); }
  res.writeHead(404); res.end();
});
await new Promise((r) => srv.listen(0, r));
const SB = `http://127.0.0.1:${srv.address().port}`;

Object.assign(process.env, { SUPABASE_URL: SB, SUPABASE_SECRET_KEY: 'sb_secret_test', ADMIN_PASSWORD: 'pw-123456', SESSION_SECRET: 'x'.repeat(40),
  APP_SECRET: 'app', WA_TOKEN: 't', PHONE_NUMBER_ID: '111', LEADS_KEY: 'k', OWNER_WA: '966582409776' });
const sent = [];
const realFetch = globalThis.fetch;
globalThis.fetch = (u, i) => String(u).startsWith('https://graph.facebook.com') ? (sent.push(JSON.parse(i.body)), Promise.resolve(new Response('{}'))) : realFetch(u, i);
const { default: fn } = await import('../api/index.js');

const O = 'https://shaheen.example';
// يحاكي إعادة التوجيه في vercel.json
const route = (path) => { const [p, q = ''] = path.split('?'); if (p.startsWith('/api/index')) return path;
  const map = { '/admin': 'admin', '/webhook': 'webhook', '/leads': 'leads' }; const t = map[p] ?? (p.startsWith('/api/') ? p.slice(1) : null);
  return t == null ? path : `/api/index?__p=${t}${q ? '&' + q : ''}`; };
const call = (path, { method = 'GET', body, headers = {}, cookie } = {}) => {
  const h = { 'x-forwarded-for': '5.5.5.5, 10.0.0.1', ...headers }; if (cookie) h.cookie = cookie; if (method !== 'GET') h.origin = O;
  if (body !== undefined && typeof body === 'object' && !(body instanceof Uint8Array)) { h['content-type'] = 'application/json'; body = JSON.stringify(body); }
  return fn.fetch(new Request(O + route(path), { method, body, headers: h }));
};
let n = 0; const t = async (name, f) => { await f(); n++; console.log('✓ ' + name); };

await t('admin page and public content through the Vercel routes', async () => {
  assert.equal((await call('/admin')).status, 200);
  const r = await call('/api/content'); assert.equal(r.status, 200); assert.match(r.headers.get('cache-control'), /s-maxage/);
});
let cookie;
await t('login works; rate limit is stored in Supabase by real client IP', async () => {
  assert.equal((await call('/api/login', { method: 'POST', body: { password: 'no' } })).status, 401);
  assert.ok(rows.has('login:fail:5.5.5.5'));
  const r = await call('/api/login', { method: 'POST', body: { password: 'pw-123456' } }); assert.equal(r.status, 200);
  cookie = r.headers.get('set-cookie').split(';')[0];
  const me = await (await call('/api/me', { cookie })).json(); assert.equal(me.siteUrl, O);
});
await t('image goes to Supabase Storage and comes back as a public https link', async () => {
  const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));
  const j = await (await call('/api/media', { method: 'POST', body: png, headers: { 'content-type': 'image/png' }, cookie })).json();
  assert.ok(j.url.startsWith(SB + '/storage/v1/object/public/media/'), j.url); assert.equal(files.size, 1);
  globalThis.__logo = j.url;
});
await t('save content: stored in Supabase, history kept, site reads it', async () => {
  const c = await (await call('/api/content')).json();
  c.works[0].name = 'FROM SUPABASE'; c.works[0].logo = globalThis.__logo.replace('http://', 'https://');
  let r = await call('/api/content', { method: 'PUT', body: c, cookie }); assert.equal(r.status, 200, await r.clone().text());
  c.hero.line1 = 'تعديل ثاني'; r = await call('/api/content', { method: 'PUT', body: c, cookie }); assert.equal((await r.json()).version, 2);
  assert.equal(JSON.parse(rows.get('content:current').value).works[0].name, 'FROM SUPABASE');
  assert.equal((await (await call('/api/history', { cookie })).json()).length, 1);
});
await t('WhatsApp webhook runs the bot with Supabase storage', async () => {
  const raw = JSON.stringify({ object: 'whatsapp_business_account', entry: [{ changes: [{ field: 'messages', value: { metadata: { phone_number_id: '111' }, contacts: [{ wa_id: '966522222222', profile: { name: 'ريم' } }], messages: [{ from: '966522222222', id: 'wx1', timestamp: String(Math.floor(Date.now() / 1000)), type: 'text', text: { body: 'هلا' } }] } }] }] });
  const sig = 'sha256=' + crypto.createHmac('sha256', 'app').update(raw).digest('hex');
  const r = await fn.fetch(new Request(O + '/api/index?__p=webhook', { method: 'POST', body: raw, headers: { 'x-hub-signature-256': sig } }));
  assert.equal(r.status, 200);
  for (let i = 0; i < 50 && !sent.some((b) => b.type === 'interactive'); i++) await new Promise((r) => setTimeout(r, 20));
  assert.ok(sent.some((b) => b.type === 'interactive' && b.interactive.type === 'list'), 'bot did not reply');
  assert.ok(rows.has('u:966522222222'));
  assert.equal((await fn.fetch(new Request(O + '/api/index?__p=webhook', { method: 'POST', body: raw, headers: { 'x-hub-signature-256': 'sha256=00' } }))).status, 401);
});
await t('expired rows are ignored', async () => {
  rows.set('m:old', { key: 'm:old', value: '1', expires_at: new Date(Date.now() - 1000).toISOString() });
  const { supabaseKV } = await import('../lib/supabase.js');
  assert.equal(await supabaseKV({ url: SB, key: 'sb_secret_test' }).get('m:old'), null);
});
await t('new secret keys are never sent as Bearer tokens', async () => {
  assert.ok(seenHeaders.every((h) => !h.authorization));
});
await t('orders page with session; leads?key works with query merged by the rewrite', async () => {
  assert.equal((await call('/leads', { cookie })).status, 200);
  assert.equal((await call('/leads?key=k&format=json')).headers.get('content-type').includes('json'), true);
});
srv.close(); console.log(`\n${n} passed`);
