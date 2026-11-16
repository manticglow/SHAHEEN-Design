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

const r2 = await handleCarwash(new Request('https://x/api/wallet/op', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' }), env, new URL('https://x/api/wallet/op'), now);
assert.equal(r2.status, 415); ok('يرفض الطلبات اللي مو JSON');
now += 86400e3; r = await call({ op: 'stamp', data: { id: 'LM-1042' }, auth: { staff } }); assert.equal(r.status, 401); ok('التوكنات تنتهي مع نهاية اليوم');
console.log(`\ncarwash: ${n} passed`);
