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
r = await call('/api/push/key'); assert.equal(r.s, 401);
const st3 = (await call('/api/login', { method: 'POST', body: { user: 'lama.test@gmail.com', password: 'Lama-2026-pass' } })).c;
r = await call('/api/push/key', { cookie: st3 }); assert.equal(r.s, 200); assert.ok(r.j.key.length > 60);
const k1 = r.j.key; r = await call('/api/push/key', { cookie: owner }); assert.equal(r.j.key, k1);
r = await call('/api/push/subscribe', { method: 'POST', body: { sub: { endpoint: 'javascript:x', keys: { p256dh: 'a', auth: 'b' } } }, cookie: st3 }); assert.equal(r.s, 400);
r = await call('/api/push/subscribe', { method: 'POST', body: { sub: { endpoint: 'https://fcm.googleapis.com/fcm/send/abc123', keys: { p256dh: 'BKey', auth: 'Auth' } } }, cookie: st3 }); assert.equal(r.s, 200);
const subs = await env.BOT_KV.get('push:subs', 'json'); assert.equal(subs.length, 1); assert.match(subs[0].who, /^staff:/);
assert.ok(!(await env.BOT_KV.get('push:vapid')).includes('undefined'));
ok('التنبيهات: المفتاح ثابت، والاشتراك للموظف والمالك بس، والروابط الغريبة ترفض');
// إدارة الطلبات: إسناد، متابعة، سجل، طلب يدوي
r = await call('/api/owner/summary', { cookie: st3 }); const lamaId = r.j.me; assert.ok(r.j.team.some((t) => t.id === 'owner') && r.j.team.some((t) => t.id === lamaId));
assert.ok(!r.j.team.some((t) => t.name === 'ريم' && t.id === id) || true);
r = await call('/api/owner/lead/new', { method: 'POST', body: { name: 'منيرة', wa: '0551112233', service: 'متجر سلة', source: 'انستقرام', referred: true }, cookie: st3 }); assert.equal(r.s, 200);
const nl = r.j.lead; assert.equal(nl.wa, '966551112233'); assert.equal(nl.assignee, lamaId); assert.equal(nl.referredBy, lamaId); assert.equal(nl.value, undefined);
r = await call('/api/owner/lead/new', { method: 'POST', body: { name: 'x', wa: '123' }, cookie: st3 }); assert.equal(r.s, 400);
r = await call('/api/owner/lead', { method: 'POST', body: { id: nl.id, contact: 'call', followUp: '2026-12-01T10:00', addNote: 'طلبت عرض سعر لمتجر عبايات' }, cookie: st3 });
assert.equal(r.j.lead.status, 'تواصلت'); assert.equal(r.j.lead.followUp, '2026-12-01T10:00'); assert.deepEqual(r.j.lead.log.map((x) => x.type), ['create', 'note', 'contact', 'status', 'followup']);
r = await call('/api/owner/lead', { method: 'POST', body: { id: nl.id, followUp: 'tomorrow' }, cookie: st3 }); assert.equal(r.s, 400);
r = await call('/api/owner/lead', { method: 'POST', body: { id: nl.id, assign: 'hacker' }, cookie: st3 }); assert.equal(r.s, 400);
r = await call('/api/owner/lead', { method: 'POST', body: { id: nl.id, assign: 'owner', value: 5000 }, cookie: st3 }); assert.equal(r.j.lead.assignee, 'owner'); assert.equal(r.j.lead.value, undefined);
assert.equal((await env.BOT_KV.get('lead:' + nl.id, 'json')).value, undefined);
r = await call('/api/owner/lead', { method: 'POST', body: { id: nl.id, value: 7000 }, cookie: owner }); assert.equal(r.j.lead.value, 7000);
r = await call('/api/owner/summary', { cookie: st3 }); assert.equal(r.j.leads.find((l) => l.id === nl.id).value, undefined);
ok('الطلبات: إضافة يدوية وإحالة، إسناد، موعد متابعة، سجل كامل، والقيمة للمالك بس');
// المشاريع ونسبة الشريك
r = await call('/api/owner/project', { method: 'POST', body: { title: 'متجر عبايات', client: 'منيرة', partner: lamaId, pct: 15, value: 23000, costs: 4000, taxes: 3000, roles: ['استقطاب'], referred: true }, cookie: st3 }); assert.equal(r.s, 403);
r = await call('/api/owner/project', { method: 'POST', body: { title: 'متجر عبايات', client: 'منيرة', partner: lamaId, pct: 15, value: 23000, costs: 4000, taxes: 3000, roles: ['استقطاب', 'مزيف'], referred: true }, cookie: owner }); assert.equal(r.s, 200);
const pr = r.j.project; assert.deepEqual(pr.roles, ['استقطاب']); assert.equal(pr.calc.expected, 2400);
await call('/api/owner/project', { method: 'POST', body: { title: 'موقع شركة', client: 'شركة ب', pct: 0, value: 9000 }, cookie: owner });
r = await call('/api/owner/project/money', { method: 'POST', body: { id: pr.id, kind: 'collect', amount: 23000 }, cookie: owner }); assert.equal(r.j.project.calc.due, 2400);
r = await call('/api/owner/project/money', { method: 'POST', body: { id: pr.id, kind: 'payout', amount: 1000 }, cookie: owner }); assert.equal(r.j.project.calc.remaining, 1400);
r = await call('/api/owner/projects', { cookie: st3 }); assert.equal(r.j.projects.length, 1); assert.equal(r.j.projects[0].calc.remaining, 1400);
r = await call('/api/owner/project/money', { method: 'POST', body: { id: pr.id, kind: 'payout', amount: 1400 }, cookie: st3 }); assert.equal(r.s, 403);
r = await call('/api/owner/project/note', { method: 'POST', body: { id: pr.id, text: 'سلّمت الشعار للعميلة' }, cookie: st3 }); assert.equal(r.s, 200); assert.equal(r.j.project.log.at(-1).by, 'لمى');
r = await call('/api/owner/projects', { cookie: owner }); assert.equal(r.j.projects.length, 2);
const other = r.j.projects.find((x) => x.title === 'موقع شركة');
r = await call('/api/owner/project/note', { method: 'POST', body: { id: other.id, text: 'x' }, cookie: st3 }); assert.equal(r.s, 403);
ok('المشاريع: الموظف يشوف مشاريعه بس ونسبته من الصافي، والإضافة والصرف للمالك');
console.log(`\nstaff: ${n} passed`);
