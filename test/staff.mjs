// حسابات الموظفين في لوحة التحكم: node test/staff.mjs
import assert from 'node:assert/strict';
import worker from '../lib/app.js';

function makeKV() { const m = new Map(); return { m, async get(k, t) { const v = m.get(k); if (v == null) return null; return t === 'json' ? JSON.parse(v) : v; }, async put(k, v) { m.set(k, String(v)); } }; }
const env = { BOT_KV: makeKV(), ADMIN_PASSWORD: 'owner-secret-pass', SESSION_SECRET: 'q'.repeat(40) };
let ipn = 0, n = 0;
const ok = (t) => { n++; console.log('✓ ' + t); };
const call = async (path, { method = 'GET', body, cookie, ip } = {}) => {
  const r = await worker.fetch(new Request('https://shaheen.test' + path, { method, headers: { 'content-type': 'application/json', 'x-forwarded-for': ip || '9.9.' + (ipn++ % 250) + '.1', ...(cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined }), env, {});
  const sc = r.headers.get('set-cookie') || ''; let j = null; try { j = await r.json(); } catch {}
  return { s: r.status, j, c: sc.split(';')[0] };
};

// طلب من الموقع
await env.BOT_KV.put('leads:index', JSON.stringify(['L1001']));
await env.BOT_KV.put('lead:L1001', JSON.stringify({ id: 'L1001', name: 'سعاد', wa: '966500000009', status: 'جديد', value: 9000, at: new Date().toISOString() }));

const owner = (await call('/api/login', { method: 'POST', body: { password: 'owner-secret-pass' } })).c;
assert.match(owner, /^sd_admin=/);
let r = await call('/api/staff', { method: 'POST', body: { action: 'add', name: 'ريم', user: 'reem', password: 'short' }, cookie: owner }); assert.equal(r.s, 400);
r = await call('/api/staff', { method: 'POST', body: { action: 'add', name: 'ريم', user: 'reem', password: 'Reem-2026-pass' }, cookie: owner }); assert.equal(r.s, 200);
const id = r.j[0].id; assert.equal(r.j[0].pw, undefined);
r = await call('/api/staff', { method: 'POST', body: { action: 'add', name: 'x', user: 'reem', password: 'Another-pass1' }, cookie: owner }); assert.equal(r.s, 400);
ok('المالك يضيف موظف، وكلمة المرور ما ترجع في الرد، واسم المستخدم ما يتكرر');

r = await call('/api/login', { method: 'POST', body: { user: 'reem', password: 'wrong-password' } }); assert.equal(r.s, 401);
r = await call('/api/login', { method: 'POST', body: { user: 'reem', password: 'Reem-2026-pass' } }); assert.equal(r.s, 200); const staff = r.c;
assert.match(staff, /^sd_staff=/);
r = await call('/api/me', { cookie: staff }); assert.equal(r.j.role, 'staff'); assert.equal(r.j.name, 'ريم');
ok('الموظفة تدخل باسم المستخدم وكلمة المرور');

r = await call('/api/owner/summary', { cookie: staff }); assert.equal(r.s, 200); assert.equal(r.j.leads[0].name, 'سعاد'); assert.equal(r.j.leads[0].value, undefined); assert.equal(r.j.days.length, 0);
r = await call('/api/owner/lead', { method: 'POST', body: { id: 'L1001', status: 'تواصلت', note: 'كلمتها الساعة ٥', value: 1 }, cookie: staff }); assert.equal(r.s, 200);
const saved = await env.BOT_KV.get('lead:L1001', 'json'); assert.equal(saved.status, 'تواصلت'); assert.equal(saved.value, 9000); assert.equal(saved.updatedBy, 'ريم');
ok('تشوف الطلبات وتغيّر الحالة والملاحظات، بدون قيمة الصفقة وإحصائيات الزوار');

for (const [m, p, b] of [['PUT', '/api/content', {}], ['GET', '/api/store', null], ['PUT', '/api/store', {}], ['GET', '/api/staff', null], ['POST', '/api/staff', { action: 'add', name: 'هاكر', user: 'hack', password: 'Hack-2026-pass' }], ['GET', '/api/history', null], ['GET', '/leads', null]]) {
  r = await call(p, { method: m, body: b || undefined, cookie: staff }); assert.ok([401, 403].includes(r.s), m + ' ' + p + ' ' + r.s);
}
r = await call('/api/platform/admin', { method: 'POST', body: { action: 'list' }, cookie: staff }); assert.equal(r.s, 401);
ok('ما تقدر تعدّل الموقع ولا المتجر ولا الموظفين ولا الاشتراكات');

const [pl, sig] = staff.slice('sd_staff='.length).split('.');
r = await call('/api/me', { cookie: 'sd_admin=' + pl + '.' + sig }); assert.equal(r.s, 401);
ok('كوكي الموظف ما ينفع يتحوّل لكوكي المالك');

await call('/api/staff', { method: 'POST', body: { action: 'disable', id }, cookie: owner });
r = await call('/api/owner/summary', { cookie: staff }); assert.equal(r.s, 401);
r = await call('/api/login', { method: 'POST', body: { user: 'reem', password: 'Reem-2026-pass' } }); assert.equal(r.s, 401);
await call('/api/staff', { method: 'POST', body: { action: 'enable', id }, cookie: owner });
const s2 = (await call('/api/login', { method: 'POST', body: { user: 'reem', password: 'Reem-2026-pass' } })).c;
await call('/api/staff', { method: 'POST', body: { action: 'reset', id, password: 'New-Reem-2026' }, cookie: owner });
r = await call('/api/owner/summary', { cookie: s2 }); assert.equal(r.s, 401);
ok('الإيقاف وتغيير كلمة المرور يطلّعونها من أجهزتها على طول');

for (let i = 0; i < 10; i++) await call('/api/login', { method: 'POST', body: { user: 'reem', password: 'guess-' + i }, ip: '5.5.5.' + i });
r = await call('/api/login', { method: 'POST', body: { user: 'reem', password: 'New-Reem-2026' }, ip: '6.6.6.6' }); assert.equal(r.s, 429);
ok('تخمين كلمة المرور يقفل الحساب مؤقتًا حتى من أجهزة مختلفة');
r = await call('/api/me', { cookie: owner }); assert.equal(r.j.role, 'owner');
r = await call('/api/staff', { method: 'POST', body: { action: 'add', name: 'لمى', user: 'Lama.Test@Gmail.com', password: 'Lama-2026-pass' }, cookie: owner }); assert.equal(r.s, 200);
r = await call('/api/login', { method: 'POST', body: { user: 'lama.test@gmail.com', password: 'Lama-2026-pass' } }); assert.equal(r.s, 200);
r = await call('/api/staff', { method: 'POST', body: { action: 'add', name: 'x', user: 'bad@@mail', password: 'Lama-2026-pass' }, cookie: owner }); assert.equal(r.s, 400);
ok('اسم المستخدم ينفع يكون إيميل');
console.log(`\nstaff: ${n} passed`);
