// الشكاوى وطلبات البيانات والمتابعة والكوكيز وسجل النشاط وتقرير الامتثال — node test/compliance.mjs
import assert from 'node:assert/strict';
import app from '../lib/app.js';
import { makeSession } from '../lib/cms.js';
import { zatcaQr } from '../lib/saas/billing.js';

function makeKV() { const m = new Map(); return { m, async get(k, t) { const v = m.get(k); if (v == null) return null; return t === 'json' ? JSON.parse(v) : v; }, async put(k, v) { m.set(k, String(v)); }, async delete(k) { m.delete(k); } }; }
const sent = [];
const env = { BOT_KV: makeKV(), SESSION_SECRET: 's'.repeat(40), ADMIN_PASSWORD: 'adminpass12345', APP_SECRET: 'x', WA_TOKEN: 't', PHONE_NUMBER_ID: '1', ADMINS: '966500000000', OWNER_ALERT_TEMPLATE: 'owner_lead_alert',
  __fetch: async (u, o) => { sent.push(JSON.parse(o.body)); return new Response('{}', { status: 200 }); } };
let n = 0; const ok = (t) => { n++; console.log('✓ ' + t); };
let ipn = 0;
const call = async (path, { method = 'GET', body, cookie, origin = 'https://x' } = {}) => {
  const h = { 'x-forwarded-for': '10.0.0.' + (ipn++ % 250), origin }; if (body) h['content-type'] = 'application/json'; if (cookie) h.cookie = cookie;
  const r = await app.fetch(new Request('https://x' + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined }), env, null);
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {} return { s: r.status, j, t, r };
};
const tok = await makeSession(env, Date.now()); const admin = 'sd_admin=' + tok;

// --- شكوى
let r = await call('/api/legal/complaint', { method: 'POST', body: { name: 'سارة', phone: '0551234567', type: 'billing', details: 'انسحب المبلغ مرتين من البطاقة' } });
assert.equal(r.s, 200); assert.match(r.j.ref, /^SDC-\d{6}-[A-Z2-9]{4}$/);
const cref = r.j.ref;
assert.ok(sent.some((m) => JSON.stringify(m).includes(cref)), 'owner alerted');
ok('الشكوى تاخذ رقم مرجعي والمالك يتنبه');

r = await call('/api/legal/complaint', { method: 'POST', body: { name: 'س', phone: '123', details: 'x' } }); assert.equal(r.s, 400);
r = await call('/api/legal/complaint', { method: 'POST', body: { name: 'سارة', phone: '0551234567', details: 'تفاصيل كافية للشكوى' }, origin: 'https://evil.example' }); assert.equal(r.s, 403);
ok('الشكوى الناقصة تنرفض، والطلب من موقع ثاني ينرفض');

// --- المتابعة
r = await call('/api/legal/track?ref=' + cref + '&p=4567'); assert.equal(r.s, 200); assert.equal(r.j.status, 'new'); assert.equal(r.j.events.length, 1); assert.equal(r.j.phone, undefined); assert.equal(r.j.details, undefined);
r = await call('/api/legal/track?ref=' + cref + '&p=0000'); assert.equal(r.s, 404);
ok('المتابعة تحتاج آخر ٤ أرقام، وما تكشف الجوال ولا التفاصيل');

// --- طلب بيانات
r = await call('/api/legal/data-request', { method: 'POST', body: { name: 'خالد', phone: '+966 55 999 8888', type: 'delete' } });
assert.equal(r.s, 200); assert.match(r.j.ref, /^SDR-/); const rref = r.j.ref;
r = await call('/api/legal/data-request', { method: 'POST', body: { name: 'خالد', phone: '0559998888', type: 'hack' } }); assert.equal(r.s, 400);
ok('طلب البيانات (حذف) ياخذ رقم مرجعي، والنوع لازم يكون معروف');

// --- فخ البوتات وحد المحاولات
r = await call('/api/legal/complaint', { method: 'POST', body: { website: 'spam', name: 'x', phone: '0551234567', details: 'xxxxxxxxxxxxxx' } }); assert.equal(r.s, 200);
const idx = await env.BOT_KV.get('lg:c:idx', 'json'); assert.equal(idx.length, 1);
ok('رسائل البوتات (الحقل المخفي) ما تنحفظ');

// --- الكوكيز
r = await call('/api/legal/consent', { method: 'POST', body: { c: 'all', id: 'abc123def456' } }); assert.equal(r.s, 200);
r = await call('/api/legal/consent', { method: 'POST', body: { c: 'necessary' } });
const cs = await env.BOT_KV.get('lg:consent', 'json'); assert.deepEqual(cs.counts, { all: 1, necessary: 1 });
ok('موافقات الكوكيز تنحسب بدون بيانات شخصية');

// --- اللوحة
r = await call('/api/legal/admin'); assert.equal(r.s, 401);
r = await call('/api/legal/admin', { cookie: admin }); assert.equal(r.s, 200);
assert.equal(r.j.complaints.length, 1); assert.equal(r.j.requests.length, 1); assert.ok(r.j.report.score > 50); assert.ok(r.j.report.items.length >= 15);
assert.equal(r.j.biz.licenseNo, 'FL-609963534');
ok('اللوحة للمالك بس، وفيها التقرير ونسبة الامتثال');

r = await call('/api/legal/admin/complaint', { method: 'POST', cookie: admin, body: { ref: cref, status: 'resolved', reply: 'رجعنا المبلغ المكرر', note: 'ملاحظة داخلية' } });
assert.equal(r.s, 200);
r = await call('/api/legal/track?ref=' + cref + '&p=4567'); assert.equal(r.j.status, 'resolved');
assert.ok(r.j.events.some((e) => e.msg === 'رجعنا المبلغ المكرر')); assert.ok(!r.j.events.some((e) => e.msg === 'ملاحظة داخلية'));
ok('رد المالك يطلع للعميل، والملاحظة الداخلية ما تطلع');

r = await call('/api/legal/admin/request', { method: 'POST', cookie: admin, body: { ref: rref, status: 'done', reply: 'حذفنا بياناتك' } }); assert.equal(r.s, 200);
r = await call('/api/legal/admin/breach', { method: 'POST', cookie: admin, body: { title: 'تجربة حادثة', detectedAt: new Date(Date.now() - 80 * 3600e3).toISOString() } }); assert.equal(r.s, 200);
r = await call('/api/legal/admin', { cookie: admin });
const late = r.j.report.items.find((i) => i.sec === 'privacy' && /تسرب/.test(i.title)); assert.equal(late.ok, false);
const bid = r.j.breaches[0].id;
await call('/api/legal/admin/breach', { method: 'POST', cookie: admin, body: { id: bid, notified: true } });
r = await call('/api/legal/admin', { cookie: admin }); assert.equal(r.j.report.items.find((i) => /تسرب/.test(i.title)).ok, true);
ok('حادثة بدون إبلاغ بعد ٧٢ ساعة تنزّل التقرير، وتصلح بعد تسجيل الإبلاغ');

r = await call('/api/legal/admin/business', { method: 'POST', cookie: admin, body: { cr: '4030000000', dpoEmail: 'bad' } }); assert.equal(r.s, 400);
r = await call('/api/legal/admin/business', { method: 'POST', cookie: admin, body: { cr: '4030000000' } }); assert.equal(r.j.biz.cr, '4030000000');
ok('بيانات المنشأة تتعدل وتتحقق من البريد');

// --- سجل النشاط
const log = await env.BOT_KV.get('lg:audit', 'json');
assert.ok(log.length >= 4); assert.ok(log.every((e) => e.who === 'owner' && e.path.startsWith('/api/legal/admin')));
assert.ok(!log.some((e) => /complaint$|consent|data-request/.test(e.path) && !e.path.includes('admin')), 'public writes not logged');
ok('كل تعديل من المالك ينسجّل في سجل النشاط، والنماذج العامة لا');

r = await call('/api/legal/admin/export', { cookie: admin }); assert.equal(r.s, 200); assert.match(r.r.headers.get('content-disposition'), /compliance-/);
ok('تصدير التقرير JSON');

// --- QR الزكاة
const b = Buffer.from(zatcaQr('شاهين ديزاين', '310000000000003', '2026-11-21T10:00:00.000Z', 11500, 1500), 'base64');
assert.equal(b[0], 1); const nameLen = b[1]; assert.equal(b.slice(2, 2 + nameLen).toString(), 'شاهين ديزاين');
ok('رمز QR الفاتورة الضريبية TLV صحيح');

console.log(`\ncompliance: ${n} passed`);
