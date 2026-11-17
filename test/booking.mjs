// اختبار الحجز والصفحات بدون إنترنت: node test/booking.mjs
import assert from 'node:assert/strict';
import worker from '../lib/app.js';
import { validSlot, bookCfg, whenLabel } from '../lib/booking.js';
import { servePublic } from '../lib/seo.js';

function makeKV() { const m = new Map(); return { m, async get(k, t) { const v = m.get(k); if (v == null) return null; return t === 'json' ? JSON.parse(v) : v; }, async put(k, v) { m.set(k, String(v)); } }; }
const sent = [];
const env = { BOT_KV: makeKV(), PHONE_NUMBER_ID: '111', WA_TOKEN: 't', ADMINS: '966500000001', OWNER_ALERT_TEMPLATE: 'new_lead_alert', TEMPLATE_LANG: 'ar',
  __fetch: async (url, init) => { sent.push(JSON.parse(init.body)); return new Response('{}'); } };
const call = (path, init) => worker.fetch(new Request('https://shaheen.test' + path, init), env, {});
const post = (body, ip = '1.1.1.1') => call('/api/booking', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(body) });

// slot math (الرياض)
const cfg = bookCfg({});
const now = Date.now();
function nextSlot(offsetDays = 1, hm = '18:00') {
  for (let i = offsetDays; i < 20; i++) {
    const d = new Date(now + 3 * 3600e3 + i * 86400e3);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}T${hm}`;
    if (validSlot(cfg, key, now)) return key;
  }
}
const s1 = nextSlot(1), s2 = nextSlot(2, '21:30');
assert.ok(s1 && s2, 'should find valid slots');
assert.equal(validSlot(cfg, s1.replace('18:00', '18:10'), now), false, 'off-grid minute');
assert.equal(validSlot(cfg, s1.replace('18:00', '22:00'), now), false, 'after hours');
assert.equal(validSlot(cfg, '2020-01-05T18:00', now), false, 'past');
assert.match(whenLabel('2026-11-15T17:30'), /الأحد 15 نوفمبر، 5:30 م/);

// booking flow
let r = await call('/api/slots'); let j = await r.json(); assert.deepEqual(j.taken, []);
r = await post({ name: 'خالد', phone: '٠٥٥١٢٣٤٥٦٧', slot: s1, topic: 'ثيم سلة', way: 'مكالمة واتساب', note: 'عندي متجر' });
j = await r.json(); assert.equal(r.status, 200); assert.ok(j.ok); assert.match(j.id, /^SD-\d{6}-[A-Z0-9]{4}$/);
const lead = JSON.parse(env.BOT_KV.m.get('lead:' + j.id)); assert.equal(lead.wa, '966551234567'); assert.equal(lead.kind, 'booking');
assert.ok(JSON.parse(env.BOT_KV.m.get('leads:index')).includes(j.id));
const tpl = sent.find((b) => b.type === 'template'); assert.ok(tpl, 'owner alert template'); assert.equal(tpl.to, '966500000001'); assert.equal(tpl.template.components[0].parameters.length, 4);
r = await call('/api/slots'); j = await r.json(); assert.deepEqual(j.taken, [s1]);
r = await post({ name: 'سارة', phone: '0501112222', slot: s1 }, '2.2.2.2'); assert.equal(r.status, 409, 'double booking');
r = await post({ name: 'س', phone: '0501112222', slot: s2 }, '2.2.2.2'); assert.equal(r.status, 400, 'short name');
r = await post({ name: 'سارة', phone: '123', slot: s2 }, '2.2.2.2'); assert.equal(r.status, 400, 'bad phone');
// owner talked to bot recently → plain text alert
await env.BOT_KV.put('owner:lastSeen', String(Date.now()));
sent.length = 0; r = await post({ name: 'سارة', phone: '0501112222', slot: s2 }, '2.2.2.2'); assert.equal(r.status, 200);
assert.ok(sent.find((b) => b.type === 'text' && /حجز استشارة جديد/.test(b.text.body)));
// rate limit
for (let i = 0; i < 5; i++) await post({ name: 'x', phone: '0', slot: 'bad' }, '9.9.9.9').then(() => {});
r = await post({ name: 'سارة', phone: '0501112222', slot: s2 }, '3.3.3.3'); assert.notEqual(r.status, 429);

// public pages
const page = (p) => servePublic(new URL('https://shaheen.test' + p));
let res = await page('/'); let h = await res.text(); assert.equal(res.status, 200);
assert.match(h, /<link rel="canonical" href="https:\/\/shaheen.test\/">/); assert.match(h, /og:image" content="https:\/\/shaheen.test\/og\/home.png"/); assert.equal((h.match(/<title>/g) || []).length, 1);
res = await page('/salla'); h = await res.text(); assert.match(h, /<title>ثيم سلة مخصص في جدة/); assert.match(h, /"@type":"AggregateOffer"/); assert.match(h, /window.SD_PATHS=1/);
assert.equal((h.match(/property="og:title"/g) || []).length, 1, 'no duplicate og tags');
res = await page('/book'); h = await res.text(); assert.match(h, /احجز استشارة/);
res = await page('/nope'); assert.equal(res.status, 404);
res = await page('/sitemap.xml'); h = await res.text(); assert.match(h, /<loc>https:\/\/shaheen.test\/wallet<\/loc>/); assert.equal((h.match(/<url>/g) || []).length, 15); assert.match(h, /\/demos<\/loc>/); assert.match(h, /\/invitations<\/loc>/);
res = await page('/robots.txt'); h = await res.text(); assert.match(h, /Sitemap: https:\/\/shaheen.test\/sitemap.xml/);
assert.equal(await page('/admin'), null); assert.equal(await page('/api/slots'), null);
console.log('booking + seo: all tests passed');
