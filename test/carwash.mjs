// حماية تجربة المغسلة: node test/carwash.mjs
import assert from 'node:assert/strict';
import { handleCarwash } from '../lib/carwash.js';
function makeKV() { const m = new Map(); return { m, async get(k, t) { const v = m.get(k); if (v == null) return null; return t === 'json' ? JSON.parse(v) : v; }, async put(k, v) { m.set(k, String(v)); } }; }
const env = { BOT_KV: makeKV(), SESSION_SECRET: 's'.repeat(40) };
let now = Date.UTC(2026, 10, 17, 9, 0), ipn = 0, n = 0;
const ok = (t) => { n++; console.log('✓ ' + t); };
const call = async (body, ip) => { const r = await handleCarwash(new Request('https://x/api/wallet/op', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip || '9.9.9.' + (ipn++ % 200) }, body: JSON.stringify(body) }), env, new URL('https://x/api/wallet/op'), now); return { status: r.status, j: await r.json() }; };

let r = await call({ op: 'join', data: { name: 'فهد', phone: '0512345678', type: 'SUV', color: '#ffffff' } });
assert.equal(r.status, 200); const id = r.j.issued.id, cust = r.j.issued.token; assert.ok(cust);
assert.equal(r.j.members[id].phone, '05•••••678'); ok('التسجيل يعطي توكن للبطاقة، والجوال يطلع مخفي');

r = await call({ op: 'stamp', data: { id } }); assert.equal(r.status, 401); ok('ما ينضاف ختم بدون دخول موظف');
r = await call({ op: 'stamp', data: { id }, auth: { staff: cust } }); assert.equal(r.status, 401); ok('توكن الزبون ما يشتغل كموظف');

r = await call({ op: 'pin', pin: '0000' }, '7.7.7.7'); assert.equal(r.status, 403);
const staff = (await call({ op: 'pin', pin: '1234' })).j.token; assert.ok(staff);
r = await call({ op: 'stamp', data: { id }, auth: { staff } }); assert.equal(r.status, 200); assert.equal(r.j.members[id].stamps, 2);
r = await call({ op: 'stamp', data: { id }, auth: { staff } }); assert.equal(r.status, 409); ok('الموظف يضيف ختم، والثاني في نفس الساعة ينرفض');

for (let i = 0; i < 8; i++) await call({ op: 'pin', pin: String(1000 + i) }, '8.8.8.8');
r = await call({ op: 'pin', pin: '1234' }, '8.8.8.8'); assert.equal(r.status, 429); ok('تخمين الرمز يتقفل بعد ٨ محاولات');

r = await call({ op: 'order', data: { member: id, pkg: 'vip', method: 'مدى', agreed: true } }); assert.equal(r.status, 403);
r = await call({ op: 'order', data: { member: id, pkg: 'vip', addons: ['scent', 'scent', 'x'], method: 'مدى', agreed: true, total: 1 }, auth: { cust: [cust] } });
assert.equal(r.status, 200); const ord = r.j.orders[0]; assert.equal(ord.total, 130); assert.equal(ord.items.length, 2); ok('الطلب يحتاج توكن البطاقة، والسعر يحسبه الخادم مو الجوال');
r = await call({ op: 'order', data: { member: id, pkg: 'ext', method: 'store' }, auth: { cust: [cust] } }); assert.equal(r.status, 400); ok('ما ينفع طلب بدون إقرار المتعلقات');

r = await call({ op: 'orderStatus', data: { id: ord.id, status: 'done' }, auth: { staff } }); assert.equal(r.status, 409); ok('ما ينفع يقفز الطلب من مدفوع إلى جاهز');
await call({ op: 'orderStatus', data: { id: ord.id, status: 'washing' }, auth: { staff } });
now += 61 * 60e3;
r = await call({ op: 'orderStatus', data: { id: ord.id, status: 'done' }, auth: { staff } }); assert.equal(r.j.members[id].stamps, 3); assert.ok(r.j.members[id].pendingRating); ok('لما يجهز الطلب بعد ساعة ينضاف ختم ويطلب التقييم');

r = await call({ op: 'rate', data: { member: id, stars: 5, tags: ['<script>', 'سريع'], note: '<img src=x onerror=alert(1)>' }, auth: { cust: [cust] } });
assert.equal(r.status, 200); assert.deepEqual(r.j.ratings[0].tags, ['سريع']); assert.ok(!/[<>]/.test(r.j.ratings[0].note)); ok('التقييم ينظّف النصوص، والوسوم من القائمة بس');
r = await call({ op: 'rate', data: { member: id, stars: 1 }, auth: { cust: [cust] } }); assert.equal(r.status, 409); ok('تقييم واحد لكل غسلة');

r = await call({ op: 'config', data: { need: 8 }, auth: { staff } }); assert.equal(r.status, 401);
const owner = (await call({ op: 'ownerPin', pin: '9999' })).j.token;
r = await call({ op: 'config', data: { need: 8, staffAdd: { name: 'سالم', pin: '9999' } }, auth: { owner } }); assert.equal(r.status, 409);
r = await call({ op: 'config', data: { need: 8 }, auth: { owner } }); assert.equal(r.j.config.need, 8); assert.equal(r.j.config.ownerPin, undefined); assert.equal(r.j.config.staff[0].pin, undefined);
ok('الإعدادات لصاحب المغسلة بس، والرموز ما تطلع للعامة');


// ---------- الدفع الحقيقي (ميسّر) ----------
{
  const pays = new Map();
  const live = { BOT_KV: makeKV(), SESSION_SECRET: 's'.repeat(40), MOYASAR_SECRET_KEY: 'sk_test_x', MOYASAR_PUBLISHABLE_KEY: 'pk_test_x', MOYASAR_WEBHOOK_SECRET: 'w'.repeat(32),
    __fetch: async (u, o) => { assert.match(o.headers.authorization, /^Basic /); const p = pays.get(u.split('/').pop()); return p ? new Response(JSON.stringify(p), { status: 200 }) : new Response('{}', { status: 404 }); } };
  const lc = async (body, path = '/api/wallet/op') => { const r = await handleCarwash(new Request('https://x' + path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '6.6.6.' + (ipn++ % 200) }, body: JSON.stringify(body) }), live, new URL('https://x' + path), now); return { status: r.status, j: await r.json() }; };
  let q = await lc({ op: 'join', data: { name: 'سعد', phone: '0550000000', type: 'سيدان', color: '#000000' } });
  const mid = q.j.issued.id, ct = q.j.issued.token; assert.equal(q.j.pay.mode, 'moyasar'); assert.equal(q.j.pay.key, 'pk_test_x'); assert.ok(!JSON.stringify(q.j).includes('sk_test'));
  ok('وضع ميسّر: المفتاح العام بس يطلع للجوال، السري لا');
  q = await lc({ op: 'order', data: { member: mid, pkg: 'full', method: 'online', agreed: true }, auth: { cust: [ct] } });
  const oid = q.j.issued.order, o1 = q.j.orders.find((x) => x.id === oid); assert.equal(o1.status, 'pending'); assert.equal(o1.total, 45);
  ok('الطلب الإلكتروني يبدأ بانتظار الدفع، مو مدفوع');
  const st = (await lc({ op: 'pin', pin: '1234' })).j.token;
  q = await lc({ op: 'orderStatus', data: { id: oid, status: 'paid', method: 'كاش' }, auth: { staff: st } }); assert.notEqual(q.j.orders?.find((x) => x.id === oid)?.status, 'paid');
  q = await lc({ op: 'orderStatus', data: { id: oid, status: 'washing' }, auth: { staff: st } }); assert.notEqual(q.j.orders?.find((x) => x.id === oid)?.status, 'washing');
  ok('الموظف ما يقدر يبدأ غسيل طلب إلكتروني ما تأكد دفعه');
  pays.set('pay_fake_0001', { id: 'pay_fake_0001', status: 'paid', currency: 'SAR', amount: 100, metadata: { order: oid }, source: { company: 'mada' } });
  q = await lc({ op: 'confirmPay', data: { order: oid, paymentId: 'pay_fake_0001' }, auth: { cust: [ct] } }); assert.equal(q.status, 402);
  pays.set('pay_other_002', { id: 'pay_other_002', status: 'paid', currency: 'SAR', amount: 4500, metadata: { order: 'oOTHER' } });
  q = await lc({ op: 'confirmPay', data: { order: oid, paymentId: 'pay_other_002' }, auth: { cust: [ct] } }); assert.equal(q.status, 402);
  pays.set('pay_fail_0003', { id: 'pay_fail_0003', status: 'failed', currency: 'SAR', amount: 4500, metadata: { order: oid } });
  q = await lc({ op: 'confirmPay', data: { order: oid, paymentId: 'pay_fail_0003' }, auth: { cust: [ct] } }); assert.equal(q.status, 402);
  q = await lc({ op: 'confirmPay', data: { order: oid, paymentId: '../../x' }, auth: { cust: [ct] } }); assert.equal(q.status, 402);
  ok('الدفع يترفض لو المبلغ أقل، أو الدفعة لطلب ثاني، أو فاشلة، أو رقمها غلط');
  pays.set('pay_good_0004', { id: 'pay_good_0004', status: 'paid', currency: 'SAR', amount: 4500, metadata: { order: oid }, source: { type: 'applepay' } });
  q = await lc({ op: 'confirmPay', data: { order: oid, paymentId: 'pay_good_0004' } }); assert.equal(q.status, 403);
  q = await lc({ op: 'confirmPay', data: { order: oid, paymentId: 'pay_good_0004' }, auth: { cust: [ct] } }); assert.equal(q.status, 200);
  const o2 = q.j.orders.find((x) => x.id === oid); assert.equal(o2.status, 'paid'); assert.equal(o2.method, 'Apple Pay'); assert.match(o2.no, /^INV-/);
  ok('بعد ما ميسّر تأكد: الطلب مدفوع وتطلع فاتورة');
  // webhook
  q = await lc({ op: 'order', data: { member: mid, pkg: 'ext', method: 'online', agreed: true }, auth: { cust: [ct] } }); const oid2 = q.j.issued.order;
  pays.set('pay_hook_0005', { id: 'pay_hook_0005', status: 'paid', currency: 'SAR', amount: 2500, metadata: { order: oid2 } });
  q = await lc({ type: 'payment_paid', secret_token: 'wrong', data: { id: 'pay_hook_0005', metadata: { order: oid2 } } }, '/api/wallet/moyasar'); assert.equal(q.status, 403);
  q = await lc({ type: 'payment_paid', data: { id: 'pay_hook_0005', metadata: { order: oid2 } } }, '/api/wallet/moyasar'); assert.equal(q.status, 403);
  q = await lc({ type: 'payment_paid', secret_token: 'w'.repeat(32), data: { id: 'pay_hook_0005', metadata: { order: oid2 } } }, '/api/wallet/moyasar'); assert.equal(q.status, 200);
  const sj = await (await handleCarwash(new Request('https://x/api/wallet/state'), live, new URL('https://x/api/wallet/state'), now)).json();
  assert.equal(sj.orders.find((x) => x.id === oid2).status, 'paid');
  ok('إشعار ميسّر لازم معه الرمز السري، وبعدها نتأكد من ميسّر نفسها');
}

const r2 = await handleCarwash(new Request('https://x/api/wallet/op', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' }), env, new URL('https://x/api/wallet/op'), now);
assert.equal(r2.status, 415); ok('يرفض الطلبات اللي مو JSON');
now += 86400e3; r = await call({ op: 'stamp', data: { id: 'LM-1042' }, auth: { staff } }); assert.equal(r.status, 401); ok('التوكنات تنتهي مع نهاية اليوم');
console.log(`\ncarwash: ${n} passed`);
