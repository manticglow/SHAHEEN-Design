// الاشتراك الذاتي والدفع والفواتير والجلسات — node test/billing.mjs
import assert from 'node:assert/strict';
import { handleTenant, handlePlatform } from '../lib/saas/platform.js';
import { subWebhook, applyPaid, phase } from '../lib/saas/billing.js';
import { addMonths, quote } from '../lib/saas/plans.js';
import { handleCarwash } from '../lib/carwash.js';
import { makeSession } from '../lib/cms.js';

function makeKV() { const m = new Map(); return { m, async get(k, t) { const v = m.get(k); if (v == null) return null; return t === 'json' ? JSON.parse(v) : v; }, async put(k, v) { m.set(k, String(v)); }, async add(k, v) { if (m.has(k)) return false; m.set(k, String(v)); return true; } }; }
const pays = new Map(); let moyasarDown = false;
const mkEnv = (live) => ({ BOT_KV: makeKV(), SESSION_SECRET: 'q'.repeat(40), ADMIN_PASSWORD: 'adminpass123', ...(live ? { MOYASAR_SECRET_KEY: 'sk_live_x', MOYASAR_PUBLISHABLE_KEY: 'pk_live_x', MOYASAR_WEBHOOK_SECRET: 'w'.repeat(30) } : {}),
  __fetch: async (u) => { if (moyasarDown) return new Response('x', { status: 503 }); const p = pays.get(String(u).split('/').pop()); return new Response(JSON.stringify(p || {}), { status: p ? 200 : 404 }); } });
let now = Date.UTC(2026, 10, 18, 9, 0), n = 0, ipn = 0;
const ok = (t) => { n++; console.log('✓ ' + t); };
const req = (path, body, h = {}) => new Request('https://x' + path, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://x', 'x-real-ip': '10.1.' + (ipn % 200) + '.' + (ipn++ % 250), ...h }, body: JSON.stringify(body) });
const mk = (env) => ({
  P: async (path, body = {}, h) => { const p = '/api/platform/' + path; const r = await handlePlatform(req(p, body, h), env, new URL('https://x' + p), now); return { s: r.status, j: await r.json(), c: (r.headers.get('set-cookie') || '').split(';')[0] }; },
  T: async (slug, body, h) => { const p = '/api/t/' + slug + '/op'; const r = await handleTenant(req(p, body, h), env, new URL('https://x' + p), now); return { s: r.status, j: await r.json() }; },
});

// --- الأسعار والأشهر
assert.equal(new Date(addMonths(Date.UTC(2027, 0, 31), 1)).toISOString().slice(0, 10), '2027-02-28');
assert.equal(new Date(addMonths(Date.UTC(2028, 0, 31), 1)).toISOString().slice(0, 10), '2028-02-29');
assert.equal(new Date(addMonths(Date.UTC(2026, 10, 18), 12)).toISOString().slice(0, 10), '2027-11-18');
assert.equal(quote('cafe', 'm', null, { renew: true }).total, 14900); assert.equal(quote('cafe', 'y', null, { renew: true }).total, 149000);
assert.equal(quote('cafe', 'm', null, { renew: true, vat: true }).vat, 1943);
ok('الأشهر تقويمية (٣١ يناير + شهر = آخر فبراير)، والسعر من الخادم، والضريبة شاملة');

// ===== وضع الإنتاج مع ميسّر =====
let env = mkEnv(true); let { P, T } = mk(env);
let r = await P('plans'); assert.equal(r.j.mode, 'live'); assert.equal(r.j.plans.cafe.m, 14900); assert.equal(r.j.plans.invite, undefined);
r = await P('checkout', { kind: 'cafe', period: 'm', name: 'مقهى ورد', slug: 'Admin', phone: '0551112222', password: 'Wardcafe2026' }); assert.equal(r.s, 400);
r = await P('checkout', { kind: 'cafe', period: 'm', name: 'مقهى ورد', slug: 'ward-cafe', phone: '12', password: 'Wardcafe2026' }); assert.equal(r.s, 400);
r = await P('checkout', { kind: 'cafe', period: 'm', name: 'مقهى ورد', slug: 'ward-cafe', phone: '0551112222', password: 'short' }); assert.equal(r.s, 400);
r = await P('checkout', { kind: 'cafe', period: 'm', name: 'مقهى ورد', slug: 'ward-cafe', phone: '0551112222', password: 'Wardcafe2026', amount: 1 }, { origin: '' }); assert.equal(r.s, 403);
r = await P('checkout', { kind: 'cafe', period: 'm', name: 'مقهى ورد', slug: 'ward-cafe', phone: '0551112222', password: 'Wardcafe2026', amount: 1 });
assert.equal(r.s, 200); assert.equal(r.j.amount, 14900); assert.ok(r.c.startsWith('sd_co=')); const coCookie = r.c; const co = r.j.co.id, g1 = r.j.given_id;
assert.match(g1, /^[0-9a-f-]{36}$/); assert.ok(!JSON.stringify(r.j).includes('Wardcafe2026'));
r = await P('slug', { slug: 'ward-cafe' }); assert.equal(r.j.ok, false);
r = await P('checkout', { kind: 'cafe', period: 'm', name: 'سارق', slug: 'ward-cafe', phone: '0559998888', password: 'Thief20266' }); assert.equal(r.s, 409);
ok('الاشتراك: السعر من الخادم مو من المتصفح، والرابط ينحجز لصاحبه أثناء الدفع');

r = await P('pay/confirm', { co }); assert.equal(r.j.status, 'pending');
pays.set(g1, { id: g1, status: 'failed', amount: 14900, currency: 'SAR', metadata: { co, kind: 'sub' }, source: { type: 'creditcard', message: 'رفض البنك' } });
r = await P('pay/confirm', { co }); assert.equal(r.j.status, 'failed'); assert.equal(r.j.message, 'رفض البنك');
r = await P('checkout/attempt', { co }); const g2 = r.j.given_id; assert.notEqual(g2, g1);
pays.set(g2, { id: g2, status: 'paid', amount: 100, currency: 'SAR', metadata: { co, kind: 'sub' }, source: { type: 'creditcard', company: 'mada' } });
r = await P('pay/confirm', { co }); assert.notEqual(r.j.status, 'paid'); assert.equal(await env.BOT_KV.get('sd:tenant:ward-cafe'), null);
ok('فشل الدفع يرجع رسالة البنك، ودفعة بمبلغ غلط ما تفعّل شي');

pays.set(g2, { id: g2, status: 'paid', amount: 14900, currency: 'SAR', metadata: { co, kind: 'sub' }, source: { type: 'applepay' } });
const res = await Promise.all(Array.from({ length: 20 }, () => P('pay/confirm', { co })));
r = await P('pay/confirm', { co }); assert.equal(r.j.status, 'paid'); assert.equal(r.j.co.slug, 'ward-cafe'); assert.ok(r.j.co.invoice);
const t1 = await env.BOT_KV.get('sd:tenant:ward-cafe', 'json'); assert.equal(t1.status, 'active'); assert.equal(t1.until.slice(0, 10), '2026-12-18'); assert.equal(t1.pays.length, 1);
const invs = [...env.BOT_KV.m.keys()].filter((k) => /^sd:inv:SD-/.test(k)); assert.equal(invs.length, 1); assert.equal(invs[0], 'sd:inv:SD-2026-000001');
assert.ok(res.every((x) => !x.c), 'no login cookie without the checkout device cookie');
ok('٢٠ تأكيد بنفس اللحظة = مشترك واحد وفاتورة وحدة بالرقم SD-2026-000001');

r = await P('pay/confirm', { co }, { cookie: coCookie }); assert.equal(r.j.loggedIn, true); const own = r.c; assert.ok(own.startsWith('sd_own='));
r = await P('pay/confirm', { co }, { cookie: coCookie }); assert.equal(r.j.loggedIn, undefined);
r = await P('me', {}, { cookie: own }); assert.equal(r.s, 200); assert.equal(r.j.tenant.slug, 'ward-cafe'); assert.equal(r.j.invoices.length, 1); assert.equal(r.j.invoices[0].method, 'Apple Pay');
ok('بعد الدفع يدخل تلقائيًا بس على نفس الجهاز اللي دفع منه ومرة وحدة؛ أي أحد معه الرابط ما يدخل');

r = await P('invoice', { no: 'SD-2026-000001' }, { cookie: own }); assert.equal(r.s, 200); assert.equal(r.j.invoice.title, 'فاتورة'); assert.equal(r.j.invoice.total, 14900); assert.equal(r.j.invoice.seller.doc, 'FL-609963534'); assert.equal(r.j.invoice.vat, 0);
r = await P('invoice', { no: 'SD-2026-000001' }); assert.equal(r.s, 401);
const admin = { cookie: 'sd_admin=' + await makeSession(env, now) };
r = await P('invoice', { no: 'SD-2026-000001' }, admin); assert.equal(r.s, 200);
ok('الفاتورة تنعرض لصاحبها وللإدارة بس، والأرقام المتسلسلة ما تكشف بيانات أحد');

// الدخول برقم الجوال، والكوكي على صفحة النظام
r = await P('login', { id: '٠٥٥١١١٢٢٢٢', password: 'wrong-pass' }); assert.equal(r.s, 403);
r = await P('login', { id: '0551112222', password: 'Wardcafe2026' }); assert.equal(r.s, 200); const own2 = r.c;
r = await P('login', { id: 'ward-cafe', password: 'Wardcafe2026' }); assert.equal(r.s, 200);
let s = await T('ward-cafe', { op: 'state', auth: { owner: 'cookie' } }, { cookie: own2 }); assert.equal(s.j.me.owner, true); assert.equal(s.j.billing.phase, 'active');
s = await T('ward-cafe', { op: 'ownerLogin', password: 'Wardcafe2026' }); assert.ok(s.j.token); const body = s.j.token;
ok('الدخول برقم الجوال (حتى بالأرقام العربية) أو باسم الحساب، ونفس الحساب يفتح لوحة النظام');

// إضافة نظام ثاني لنفس الرقم: لازم يكون داخل
r = await P('checkout', { kind: 'bio', period: 'y', name: 'روابط ورد', slug: 'ward-links', phone: '0551112222', password: 'Another2026' }); assert.equal(r.s, 409);
r = await P('checkout', { kind: 'bio', period: 'y', name: 'روابط ورد', slug: 'ward-links' }, { cookie: own2 }); assert.equal(r.s, 200); assert.equal(r.j.amount, 39000);
const co2 = r.j.co.id, g3 = r.j.given_id;
pays.set(g3, { id: g3, status: 'paid', amount: 39000, currency: 'SAR', metadata: { co: co2, kind: 'sub' }, source: { type: 'creditcard', company: 'mada' } });
r = await handleCarwash(new Request('https://x/api/wallet/moyasar', { method: 'POST', body: JSON.stringify({ secret_token: 'bad', data: { id: g3, metadata: { co: co2, kind: 'sub' } } }) }), env, new URL('https://x/api/wallet/moyasar'), now); assert.equal(r.status, 403);
r = await handleCarwash(new Request('https://x/api/wallet/moyasar', { method: 'POST', body: JSON.stringify({ secret_token: 'w'.repeat(30), type: 'payment_paid', data: { id: g3, status: 'paid', amount: 1, metadata: { co: co2, kind: 'sub' } } }) }), env, new URL('https://x/api/wallet/moyasar'), now); assert.equal(r.status, 200);
r = await P('me', { slug: 'ward-links' }, { cookie: own2 }); assert.equal(r.j.tenants.length, 2); assert.equal(r.j.tenant.slug, 'ward-links'); assert.equal(r.j.invoices[0].no, 'SD-2026-000002');
moyasarDown = true; r = await handleCarwash(new Request('https://x/api/wallet/moyasar', { method: 'POST', body: JSON.stringify({ secret_token: 'w'.repeat(30), data: { id: g3, metadata: { co: co2, kind: 'sub' } } }) }), env, new URL('https://x/api/wallet/moyasar'), now); assert.equal(r.status, 200); moyasarDown = false;
ok('الرقم المسجّل ما ينسرق، وإشعار ميسّر يفعّل الاشتراك حتى لو العميل قفل الصفحة (ويتأكد من ميسّر نفسها)');

// التجديد يمدد من نهاية المدة الحالية
r = await P('checkout', { renew: 'ward-cafe', period: 'y' }); assert.equal(r.s, 401);
r = await P('checkout', { renew: 'ward-cafe', period: 'y' }, { cookie: own2 }); assert.equal(r.j.amount, 149000); const co3 = r.j.co.id, g4 = r.j.given_id;
pays.set(g4, { id: g4, status: 'paid', amount: 149000, currency: 'SAR', metadata: { co: co3, kind: 'sub' }, source: { type: 'creditcard' } });
r = await P('pay/confirm', { co: co3 }); assert.equal(r.j.status, 'paid');
assert.equal((await env.BOT_KV.get('sd:tenant:ward-cafe', 'json')).until.slice(0, 10), '2027-12-18');
r = await P('pay/confirm', { co: co3 }); assert.equal((await env.BOT_KV.get('sd:tenant:ward-cafe', 'json')).until.slice(0, 10), '2027-12-18');
ok('التجديد يضيف سنة من نهاية الاشتراك الحالي، والتأكيد المكرر ما يضيف مرتين');

// السماح ثم الانتهاء
let t = await env.BOT_KV.get('sd:tenant:ward-links', 'json');
now = Date.parse(t.until) + 2 * 86400e3; assert.equal(phase(t, now), 'grace');
s = await T('ward-links', { op: 'state' }); assert.equal(s.s, 200);
now = Date.parse(t.until) + 4 * 86400e3; assert.equal(phase(t, now), 'expired');
s = await T('ward-links', { op: 'state' }); assert.equal(s.s, 402); assert.equal(s.j.owner, undefined); assert.ok(!/اشتراك/.test(s.j.error));
r = await P('login', { id: '0551112222', password: 'Wardcafe2026' }); const own3 = r.c;
s = await T('ward-links', { op: 'state', auth: { owner: 'cookie' } }, { cookie: own3 }); assert.equal(s.s, 402); assert.equal(s.j.owner, true); assert.equal(s.j.renew, '/app#billing');
ok('بعد الانتهاء: ٣ أيام سماح والصفحة شغالة، بعدها العملاء يشوفون "متوقفة مؤقتًا" بدون كلام فوترة، والمالك يشوف زر التجديد');

// خروج من كل الأجهزة
r = await P('logout-all', {}, { cookie: own3 }); assert.equal(r.s, 200);
assert.equal((await P('me', {}, { cookie: own2 })).s, 401); assert.equal((await P('me', {}, { cookie: own3 })).s, 401);
s = await T('ward-cafe', { op: 'state', auth: { owner: body } }); assert.equal(s.j.me.owner, false);
r = await P('logout'); assert.match(r.c, /^sd_own=$/);
ok('خروج من كل الأجهزة يطلّع كل الجلسات (حتى لوحة الإدارة القديمة)');

// دفعة يدوية من الإدارة = فاتورة بنفس التسلسل
const ad = { cookie: 'sd_admin=' + await makeSession(env, now) };
r = await P('admin', { action: 'pay', slug: 'ward-links', period: 'm', months: 1, amount: 39, method: 'تحويل بنكي', resume: true }, ad); assert.equal(r.s, 200); assert.equal(r.j.invoice, 'SD-2027-000001'); // سنة جديدة = تسلسل جديد
r = await P('admin', { action: 'list' }, ad); assert.equal(r.j.tenants.find((x) => x.slug === 'ward-links').phase, 'active'); assert.ok(r.j.month.revenue >= 3900);
ok('الدفع اليدوي (تحويل) يمدد ويطلع فاتورة بنفس التسلسل، ويظهر في دخل الشهر');

// ===== بدون مفاتيح ميسّر: دفع تجريبي آمن =====
env = mkEnv(false); ({ P, T } = mk(env));
r = await P('checkout', { kind: 'salon', period: 'm', name: 'صالون لمى', slug: 'lama-salon', phone: '0561234567', password: 'LamaSalon26' }); assert.equal(r.j.mode, 'test'); const cot = r.j.co.id, cc = r.c;
r = await P('pay/confirm', { co: cot, sim: true }, { origin: '' }); assert.equal(r.s, 403);
r = await P('pay/confirm', { co: cot, sim: true }, { cookie: cc }); assert.equal(r.j.status, 'paid'); assert.equal(r.j.loggedIn, true); assert.match(r.j.co.invoice, /^TEST-\d{4}-000001$/);
t = await env.BOT_KV.get('sd:tenant:lama-salon', 'json'); assert.equal(t.test, true); assert.ok(Date.parse(t.until) - now <= 86400e3);
assert.equal(await env.BOT_KV.get('sd:pays:' + new Date(now + 3 * 3600e3).toISOString().slice(0, 7)), null);
ok('بدون مفاتيح ميسّر: الدفع التجريبي يجرب الرحلة كاملة، والحساب تجريبي ليوم واحد وما يدخل في الدخل');

// القفل ما ينسرق: ٦٠ محاولة غلط لبطاقة عميل ما تقفل دخول الموظفين
env = mkEnv(false); ({ P, T } = mk(env));
s = await T('demo-cafe', { op: 'state' });
for (let i = 0; i < 60; i++) await T('demo-cafe', { op: 'lookup', phone: '0500000000', code: '0000' }, { 'x-real-ip': '9.9.9.' + i });
s = await T('demo-cafe', { op: 'staffPin', pin: '1234' }); assert.equal(s.s, 200);
ok('محاولات غلط على بطاقات العملاء ما تقفل دخول موظفين المحل');

// applyPaid يرفض دفعة مو من محاولات هذا الطلب
r = await applyPaid(env, { id: 'X', total: 100, attempts: ['a'] }, { id: 'b', status: 'paid', amount: 100, currency: 'SAR', metadata: { co: 'X' } }, now); assert.equal(r.ok, false);
r = await subWebhook(env, { data: { id: 'zz', metadata: { co: 'NOPE' } } }, now); assert.equal(r.skip, true);
ok('دفعة غريبة أو طلب مو موجود ما يأثر على شي');
console.log(`\nbilling: ${n} passed`);
