// الدخول بالواتساب: الرمز + نفس المتصفح + رسالة من رقم صاحب الحساب + ضغطة تأكيد — node test/walogin.mjs
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import worker from '../lib/app.js';
import { handlePlatform } from '../lib/saas/platform.js';
import { ownSession } from '../lib/saas/billing.js';

const SECRET = 'test-app-secret';
let clock = Date.UTC(2026, 10, 20, 17, 0), n = 0, ipn = 0, seq = 0;
const ok = (t) => { n++; console.log('✓ ' + t); };
function makeKV() { const m = new Map(); return { m, async get(k, t) { const v = m.get(k); if (v == null) return null; return t === 'json' ? JSON.parse(v) : v; }, async put(k, v) { m.set(k, String(v)); } }; }
const sent = [];
const env = {
  BOT_KV: makeKV(), SESSION_SECRET: 'z'.repeat(40), PHONE_NUMBER_ID: '111', WA_TOKEN: 'tok', APP_SECRET: SECRET, VERIFY_TOKEN: 'v',
  MODE: 'separate', OWNER_WA: '966582409776', ADMINS: '966500000001', BOT_WA: '966591234939',
  __fetch: async (url, init) => { sent.push(JSON.parse(init.body)); return new Response('{}', { status: 200 }); },
};
const OWNER = '0551234567', OWNER_WA = '966551234567';
await env.BOT_KV.put('sd:acct:' + OWNER, JSON.stringify({ phone: OWNER, name: 'مقهى', pw: 'x', sv: 3, slugs: ['reem-cafe'] }));

const P = async (path, body, h = {}, e = env) => {
  const p = '/api/platform/' + path;
  const r = await handlePlatform(new Request('https://x' + p, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://x', 'x-forwarded-for': '10.1.0.' + (ipn++ % 250), ...h }, body: JSON.stringify(body || {}) }), e, new URL('https://x' + p), clock);
  const cookies = r.headers.getSetCookie ? r.headers.getSetCookie() : [r.headers.get('set-cookie') || ''];
  return { s: r.status, j: await r.json(), cookies, c: (name) => (cookies.find((x) => x.startsWith(name + '=')) || '').split(';')[0] };
};
const G = async (path) => { const r = await handlePlatform(new Request('https://x/api/platform/' + path), env, new URL('https://x/api/platform/' + path), clock); return r.json(); };
async function wa(from, msg) {
  const body = { object: 'whatsapp_business_account', entry: [{ id: 'w', changes: [{ field: 'messages', value: { messaging_product: 'whatsapp', metadata: { phone_number_id: '111' }, contacts: [{ wa_id: from, profile: { name: 'x' } }], messages: [{ from, id: 'wamid.' + (++seq), timestamp: String(Math.floor(clock / 1000)), ...msg }] } }] }] };
  const raw = JSON.stringify(body), sig = 'sha256=' + crypto.createHmac('sha256', SECRET).update(raw).digest('hex');
  const before = sent.length, orig = Date.now; Date.now = () => clock;
  try { const r = await worker.fetch(new Request('https://x/webhook', { method: 'POST', body: raw, headers: { 'content-type': 'application/json', 'x-hub-signature-256': sig } }), env, null); assert.equal(r.status, 200); }
  finally { Date.now = orig; }
  return sent.slice(before).filter((b) => !b.status);
}
const text = (body) => ({ type: 'text', text: { body } });
const btn = (id) => ({ type: 'interactive', interactive: { type: 'button_reply', button_reply: { id, title: id } } });
const said = (out) => out.map((b) => b.text?.body || b.interactive?.body?.text || '').join('\n');

// --- بدون رقم البوت: الزر مخفي والطلب مرفوض
{
  const off = { ...env, BOT_WA: '' };
  const r = await P('wa-start', {}, {}, off); assert.equal(r.s, 503);
  const pl = await handlePlatform(new Request('https://x/api/platform/plans'), off, new URL('https://x/api/platform/plans'), clock);
  assert.equal((await pl.json()).wal, false); assert.equal((await G('plans')).wal, true);
  assert.equal((await P('wa-start', {}, { origin: 'https://evil.example' })).s, 403);
}
ok('الدخول بالواتساب يظهر بس لما يكون رقم البوت مضبوط، ومن نفس الموقع بس');

// --- الرحلة كاملة
let r = await P('wa-start'); assert.equal(r.s, 200);
const code = r.j.code, wal = r.c('sd_wal');
assert.match(code, /^[A-Z0-9]{6}$/); assert.ok(wal.length > 20); assert.ok(r.j.link.startsWith('https://wa.me/966591234939?text='));
assert.ok(r.cookies[0].includes('HttpOnly') && r.cookies[0].includes('SameSite=Strict')); assert.equal(JSON.stringify(r.j).includes(wal.slice(7)), false);
ok('الصفحة تاخذ رمز ورابط واتساب جاهز، والسر في كوكي HttpOnly ما يطلع في الرد');

assert.equal((await P('wa-poll', { code })).j.st, 'expired');
assert.equal((await P('wa-poll', { code }, { cookie: 'sd_wal=fake' })).j.st, 'expired');
assert.equal((await P('wa-poll', { code }, { cookie: wal })).j.st, 'wait');
ok('الرمز لحاله ما يفيد: متصفح ثاني بدون الكوكي ما يقدر ينتظر الدخول');

let out = await wa(OWNER_WA, text('دخول ' + code.toLowerCase()));
assert.equal(out.length, 1); assert.equal(out[0].type, 'interactive');
assert.deepEqual(out[0].interactive.action.buttons.map((b) => b.reply.id), ['wal:ok:' + code, 'wal:no:' + code]);
assert.match(said(out), /لا تأكد/);
assert.equal((await P('wa-poll', { code }, { cookie: wal })).j.st, 'ask');
ok('البوت يستقبل "دخول XXXXXX" ويطلب تأكيد بزر مع تحذير من الاحتيال');

out = await wa('966509999999', btn('wal:ok:' + code));
assert.match(said(out), /انتهى/); assert.equal((await P('wa-poll', { code }, { cookie: wal })).j.st, 'ask');
ok('رقم ثاني ما يقدر يأكد بدال صاحب الحساب');

out = await wa(OWNER_WA, btn('wal:ok:' + code)); assert.match(said(out), /تم/);
r = await P('wa-poll', { code }, { cookie: wal }); assert.equal(r.j.st, 'ok');
const own = r.c('sd_own'); assert.ok(own); assert.ok(r.cookies.some((x) => x.startsWith('sd_wal=;') && x.includes('Max-Age=0')));
const sess = await ownSession(new Request('https://x', { headers: { cookie: own } }), env, clock);
assert.equal(sess.phone, OWNER); assert.deepEqual(sess.slugs, ['reem-cafe']);
assert.equal((await P('wa-poll', { code }, { cookie: wal })).j.st, 'expired');
out = await wa(OWNER_WA, btn('wal:ok:' + code)); assert.match(said(out), /انتهى/);
ok('بعد التأكيد يدخل نفس المتصفح بجلسة الحساب، والرمز ما يشتغل مرة ثانية');

// --- خروج من كل الأجهزة يطلّع جلسة الواتساب بعد (نفس نظام الجلسات)
{ const a = JSON.parse(env.BOT_KV.m.get('sd:acct:' + OWNER)); a.sv++; await env.BOT_KV.put('sd:acct:' + OWNER, JSON.stringify(a)); }
assert.equal(await ownSession(new Request('https://x', { headers: { cookie: own } }), env, clock), null);
ok('جلسة الواتساب تطلع مع "خروج من كل الأجهزة" مثل جلسة كلمة المرور');

// --- "مو أنا"
r = await P('wa-start'); let c2 = r.j.code, w2 = r.c('sd_wal');
await wa(OWNER_WA, text('دخول ' + c2));
out = await wa(OWNER_WA, btn('wal:no:' + c2)); assert.match(said(out), /ألغيت/);
assert.equal((await P('wa-poll', { code: c2 }, { cookie: w2 })).j.st, 'no');
out = await wa(OWNER_WA, btn('wal:ok:' + c2)); assert.match(said(out), /انتهى/);
assert.equal((await P('wa-poll', { code: c2 }, { cookie: w2 })).j.st, 'no');
ok('"مو أنا" يلغي الطلب نهائيًا، وما ينفع يتأكد بعدها');

// --- رقم ما له حساب
r = await P('wa-start'); c2 = r.j.code; w2 = r.c('sd_wal');
out = await wa('966507777777', text('login ' + c2)); assert.match(said(out), /ما لقينا حساب/);
assert.equal((await P('wa-poll', { code: c2 }, { cookie: w2 })).j.st, 'none');
out = await wa(OWNER_WA, text('دخول ' + c2)); assert.match(said(out), /انتهى/);
ok('رقم بدون حساب ياخذ رد واضح، والرمز يتقفل بعدها');

// --- انتهاء الوقت
r = await P('wa-start'); c2 = r.j.code; w2 = r.c('sd_wal');
clock += 5 * 60e3 + 1000;
out = await wa(OWNER_WA, text('دخول ' + c2)); assert.match(said(out), /انتهى/);
assert.equal((await P('wa-poll', { code: c2 }, { cookie: w2 })).j.st, 'expired');
r = await P('wa-start'); c2 = r.j.code; w2 = r.c('sd_wal');
await wa(OWNER_WA, text('دخول ' + c2)); clock += 5 * 60e3 + 1000;
out = await wa(OWNER_WA, btn('wal:ok:' + c2)); assert.match(said(out), /انتهى/);
ok('الرمز يعيش ٥ دقايق بس، حتى لو وصلت الرسالة قبلها والتأكيد تأخر');

// --- ما يخرب البوت العادي ولا أوامر المشرف
out = await wa('966508888888', text('دخول')); assert.doesNotMatch(said(out), /الرمز|ما لقينا حساب/);
out = await wa('966508888888', text('دخول ABC')); assert.doesNotMatch(said(out), /الرمز/);
out = await wa('966500000001', text('دخول ZZZZZZ')); assert.match(said(out), /انتهى/);
out = await wa('966500000001', text('#طلبات')); assert.doesNotMatch(said(out), /الرمز/);
ok('كلمة "دخول" لحالها تروح للبوت العادي، والمشرف يقدر يدخل بالواتساب وأوامره تشتغل');

// --- حد المحاولات
let lim = 0; for (let i = 0; i < 12; i++) { const x = await P('wa-start', {}, { 'x-forwarded-for': '9.9.9.9' }); if (x.s === 429) lim++; }
assert.ok(lim >= 2);
ok('طلب رموز كثيرة من نفس الجهاز يتوقف بعد ١٠ محاولات');

console.log(`\nwalogin: ${n} passed`);
