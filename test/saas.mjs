// منصة الاشتراكات: العزل بين المشتركين، التفعيل، الدخول، الخصوصية — node test/saas.mjs
import assert from 'node:assert/strict';
import { handleTenant, handlePlatform } from '../lib/saas/platform.js';
import { makeSession } from '../lib/cms.js';
import KINDS from '../lib/saas/kinds/index.js';

function makeKV() { const m = new Map(); return { m, async get(k, t) { const v = m.get(k); if (v == null) return null; return t === 'json' ? JSON.parse(v) : v; }, async put(k, v) { m.set(k, String(v)); } }; }
const env = { BOT_KV: makeKV(), SESSION_SECRET: 'z'.repeat(40) };
let now = Date.UTC(2026, 10, 17, 9, 0), ipn = 0, n = 0;
const ok = (t) => { n++; console.log('✓ ' + t); };
const req = (path, body, h = {}) => new Request('https://x' + path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.0.' + (Math.floor(ipn / 200) % 200) + '.' + (ipn++ % 200), ...h }, body: JSON.stringify(body) });
const T = async (slug, body, h) => { const p = '/api/t/' + slug + '/op'; const r = await handleTenant(req(p, body, h), env, new URL('https://x' + p), now); return { s: r.status, j: await r.json() }; };
const P = async (path, body, h) => { const p = '/api/platform/' + path; const r = await handlePlatform(req(p, body, h), env, new URL('https://x' + p), now); return { s: r.status, j: await r.json() }; };
const admin = { cookie: 'sd_admin=' + await makeSession(env, now) };

// --- كل التجارب تشتغل
for (const k of Object.keys(KINDS)) { const r = await T('demo-' + k, { op: 'state' }); assert.equal(r.s, 200, k); assert.equal(r.j.tenant.kind, k); }
ok('كل الأنظمة الستة تفتح كتجربة حية');

// --- لوحة الاشتراكات لشاهين ديزاين بس
let r = await P('admin', { action: 'list' }); assert.equal(r.s, 401);
r = await P('admin', { action: 'create', name: 'مقهى تجربة', kind: 'cafe', slug: 'demo-x' }, admin); assert.equal(r.s, 400);
r = await P('admin', { action: 'list' }, { ...admin, origin: 'https://evil.example' }); assert.equal(r.s, 403);
ok('إدارة الاشتراكات تحتاج دخول لوحة التحكم، ومن نفس الموقع، وما ينفع تنتحل رابط التجارب');
r = await P('admin', { action: 'create', name: 'مقهى الريم', kind: 'cafe', slug: 'reem-cafe', phone: '0551234567', months: 3 }, admin);
assert.equal(r.s, 200); const code1 = r.j.code; assert.equal(code1.length, 20);
r = await P('admin', { action: 'create', name: 'عيادة النور', kind: 'clinic', slug: 'noor-clinic', months: 1 }, admin); const code2 = r.j.code;
r = await P('admin', { action: 'create', name: 'تكرار', kind: 'cafe', slug: 'reem-cafe' }, admin); assert.equal(r.s, 409);
ok('إنشاء اشتراك يعطي رابط تفعيل، والرابط ما يتكرر');

// --- قبل التفعيل الصفحة مقفلة
r = await T('reem-cafe', { op: 'state' }); assert.equal(r.s, 402);
r = await P('login', { slug: 'reem-cafe', password: 'whatever1' }); assert.equal(r.s, 403);
ok('قبل التفعيل: صفحة العملاء مقفلة وما فيه دخول');

// --- التفعيل
r = await P('activate', { code: 'A'.repeat(20), password: 'StrongPass1' }); assert.equal(r.s, 403);
r = await P('activate', { code: code1, password: 'short' }); assert.equal(r.s, 400);
r = await P('activate', { code: code1, password: 'ReemCafe2026' }); assert.equal(r.s, 200); let own1 = r.j.token;
r = await P('activate', { code: code1, password: 'Hijack2026!' }); assert.equal(r.s, 403);
ok('رابط التفعيل يشتغل مرة وحدة، ويرفض كلمة مرور ضعيفة ورموز مزيفة');
r = await P('activate', { code: code2, password: 'NoorClinic99' }); const own2 = r.j.token;

// --- الدخول ولوحة المالك
r = await P('login', { slug: 'reem-cafe', password: 'wrong-pass' }); assert.equal(r.s, 403);
r = await P('login', { slug: 'reem-cafe', password: 'ReemCafe2026' }); assert.equal(r.s, 200);
r = await P('me', { token: own1 }); assert.equal(r.s, 200); assert.equal(r.j.tenant.slug, 'reem-cafe'); assert.ok(!JSON.stringify(r.j).includes('0551234567'));
ok('الدخول بكلمة المرور، ولوحة المشترك تخفي رقمه');
let s = await T('reem-cafe', { op: 'state', auth: { owner: own1 } }); assert.equal(s.s, 200); assert.equal(s.j.me.owner, true);
s = await T('noor-clinic', { op: 'state', auth: { owner: own1 } }); assert.equal(s.j.me.owner, false);
s = await T('noor-clinic', { op: 'doctor', data: { name: 'د. اختراق', open: '08:00', close: '12:00', dur: 20 }, auth: { owner: own1 } }); assert.equal(s.s, 401);
ok('توكن مشترك ما يفتح لوحة مشترك ثاني');
s = await T('reem-cafe', { op: 'ownerPin', pin: '9999' }); assert.equal(s.s, 400);
s = await T('reem-cafe', { op: 'ownerLogin', password: 'ReemCafe2026' }); assert.equal(s.s, 200); assert.ok(s.j.token);
ok('رمز التجربة ٩٩٩٩ ما يشتغل على حساب حقيقي');

// --- تغيير كلمة المرور يطلّع الجلسات القديمة
r = await P('password', { token: own1, old: 'ReemCafe2026', password: 'NewReem2026' }); assert.equal(r.s, 200);
s = await T('reem-cafe', { op: 'state', auth: { owner: own1 } }); assert.equal(s.j.me.owner, false);
own1 = r.j.token; s = await T('reem-cafe', { op: 'state', auth: { owner: own1 } }); assert.equal(s.j.me.owner, true);
ok('تغيير كلمة المرور يلغي الجلسات القديمة');

// --- الموظفين
s = await T('reem-cafe', { op: 'staffAdd', data: { name: 'سعد', pin: '4321' } }); assert.equal(s.s, 401);
s = await T('reem-cafe', { op: 'staffAdd', data: { name: 'سعد', pin: '4321' }, auth: { owner: own1 } }); assert.equal(s.s, 200); const sid = s.j.staff[0].id; assert.equal(s.j.staff[0].pin, undefined);
s = await T('reem-cafe', { op: 'staffPin', pin: '4321' }); const stok = s.j.token; assert.ok(stok);
s = await T('noor-clinic', { op: 'call', data: { doctor: 'd1' }, auth: { staff: stok } }); assert.equal(s.s, 401);
s = await T('reem-cafe', { op: 'item', data: { name: 'x', price: 1 }, auth: { staff: stok } }); assert.equal(s.s, 401);
s = await T('reem-cafe', { op: 'staffDel', data: { id: sid }, auth: { owner: own1 } });
s = await T('reem-cafe', { op: 'avail', data: { id: 'x' }, auth: { staff: stok } }); assert.equal(s.s, 401);
ok('الموظف محصور في نشاطه وصلاحياته، ولو انحذف يطلع على طول');
for (let i = 0; i < 8; i++) await T('reem-cafe', { op: 'staffPin', pin: String(5000 + i) }, { 'x-forwarded-for': '7.7.7.7' });
s = await T('reem-cafe', { op: 'staffPin', pin: '4321' }, { 'x-forwarded-for': '7.7.7.7' }); assert.equal(s.s, 429);
ok('تخمين رموز الموظفين يتقفل بعد ٨ محاولات');

// --- خصوصية العملاء
s = await T('reem-cafe', { op: 'join', data: { name: 'هند', phone: '0509998877' } }); const c1 = s.j.issued; const code = s.j.cards[0].code;
s = await T('reem-cafe', { op: 'join', data: { name: 'مها', phone: '0507776655' } }); const c2 = s.j.issued;
s = await T('reem-cafe', { op: 'state', auth: { cust: [c2.token] } }); assert.equal(s.j.cards.length, 1); assert.equal(s.j.cards[0].name, 'مها'); assert.equal(s.j.members, undefined); assert.equal(s.j.orders, undefined);
ok('العميل يشوف بطاقته بس، بدون قائمة العملاء ولا الطلبات');
s = await T('reem-cafe', { op: 'state' }); const menu = s.j.menu;
s = await T('reem-cafe', { op: 'order', data: { items: [{ id: menu[0].id, qty: 2 }], table: 3, cust: c1.id }, auth: { cust: [c2.token] } });
const o1 = s.j.issued; const placed = s.j.mine[0]; assert.equal(placed.cust, null); assert.equal(placed.total, menu[0].price * 2);
ok('ما ينفع تربط طلبك ببطاقة غيرك، والسعر من الخادم');
s = await T('reem-cafe', { op: 'state', data: { mine: [[o1.order, 'WRONGKEY0000']] } }); assert.equal(s.j.mine.length, 0);
s = await T('reem-cafe', { op: 'state', data: { mine: [[o1.order, o1.key]] } }); assert.equal(s.j.mine.length, 1);
ok('متابعة الطلب تحتاج مفتاحه السري');
s = await T('reem-cafe', { op: 'lookup', phone: '0509998877', code: '0000' === code ? '1111' : '0000' }); assert.equal(s.s, 403);
s = await T('reem-cafe', { op: 'lookup', phone: '0509998877', code }); assert.equal(s.s, 200);
ok('الرجوع للبطاقة من جوال ثاني يحتاج رمز البطاقة');

// --- عيادة: الشاشة العامة بدون أسماء
s = await T('demo-clinic', { op: 'state' }); assert.ok(!JSON.stringify(s.j.board).match(/سارة|محمد|عبدالله/)); assert.equal(s.j.queue, undefined); assert.equal(s.j.appts, undefined);
ok('شاشة الانتظار العامة ما فيها أسماء المراجعين');
// ما بعد البيع: مالك وحدة ما يشوف طلبات غيره
s = await T('demo-aftersales', { op: 'lookup', phone: '0554445566', code: '2222' }); const u2 = s.j.issued.token;
s = await T('demo-aftersales', { op: 'state', auth: { cust: [u2] } }); assert.ok(s.j.mine.every((k) => k.unit === 'B-04')); assert.equal(s.j.tickets, undefined);
ok('مالك الوحدة يشوف طلباته بس');
// الموارد البشرية: الموظف يشوف حضوره بس
s = await T('demo-hr', { op: 'staffPin', pin: '2345' }); const e2 = s.j.token;
s = await T('demo-hr', { op: 'state', auth: { staff: e2 } }); assert.equal(s.j.emp.name, 'ليان العمري'); assert.equal(s.j.board, undefined); assert.equal(s.j.emp.pin, undefined);
s = await T('demo-hr', { op: 'decide', data: { id: 'x', ok: true }, auth: { staff: e2 } }); assert.equal(s.s, 401);
ok('الموظف يشوف حضوره بس وما يقدر يوافق على إجازات');
// صفحة الروابط: الروابط الخطرة ترفض
s = await T('demo-bio', { op: 'ownerPin', pin: '9999' }); const bo = s.j.token;
s = await T('demo-bio', { op: 'link', data: { title: 'xss', url: 'javascript:alert(1)' }, auth: { owner: bo } }); assert.equal(s.s, 400);
s = await T('demo-bio', { op: 'state' }); assert.ok(s.j.links.every((l) => l.url === undefined)); assert.equal(s.j.inbox, undefined);
ok('صفحة الروابط ترفض javascript: وما تكشف الروابط ولا الطلبات للزوار');

// --- الإيقاف وانتهاء الاشتراك
r = await P('admin', { action: 'suspend', slug: 'reem-cafe' }, admin); s = await T('reem-cafe', { op: 'state', auth: { owner: own1 } }); assert.equal(s.s, 402);
r = await P('admin', { action: 'resume', slug: 'reem-cafe' }, admin); s = await T('reem-cafe', { op: 'state' }); assert.equal(s.s, 200);
now += 40 * 86400e3; admin.cookie = 'sd_admin=' + await makeSession(env, now); s = await T('noor-clinic', { op: 'state' }); assert.equal(s.s, 402);
r = await P('admin', { action: 'extend', slug: 'noor-clinic', months: 1 }, admin); s = await T('noor-clinic', { op: 'state' }); assert.equal(s.s, 200);
ok('الإيقاف وانتهاء المدة يقفلون الصفحة، والتمديد يرجّعها');
// استعادة كلمة المرور برابط جديد
r = await P('admin', { action: 'code', slug: 'noor-clinic' }, admin); const c3 = r.j.code;
r = await P('activate', { code: c3, password: 'NoorReset2026' }); assert.equal(r.s, 200);
s = await T('noor-clinic', { op: 'state', auth: { owner: own2 } }); assert.equal(s.j.me.owner, false);
ok('رابط استعادة كلمة المرور يلغي الجلسات القديمة');

// --- التجارب ترجع لبدايتها مع اليوم الجديد
s = await T('demo-cafe', { op: 'ownerPin', pin: '9999' }); const dt = s.j.token;
s = await T('demo-cafe', { op: 'brand', data: { name: 'تم التغيير', color: '#000000' }, auth: { owner: dt } }); assert.equal(s.j.brand.name, 'تم التغيير');
now += 86400e3; s = await T('demo-cafe', { op: 'state', auth: { owner: dt } }); assert.equal(s.j.brand.name, 'مقهى سَنا'); assert.equal(s.j.me.owner, false);
ok('التجربة ترجع لبدايتها كل يوم، وجلساتها تنتهي معها');
r = await handleTenant(new Request('https://x/api/t/demo-cafe/op', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' }), env, new URL('https://x/api/t/demo-cafe/op'), now); assert.equal(r.status, 415);
s = await T('demo-cafe', { op: '__proto__' }); assert.equal(s.s, 404); s = await T('demo-cafe', { op: 'constructor' }); assert.equal(s.s, 404);
ok('يرفض غير JSON والعمليات المزيفة');
console.log(`\nsaas: ${n} passed`);
