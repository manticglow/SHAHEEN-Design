import { makeId } from './flow.js';
import { sendPush } from './push.js';
// لوحة المالك: إحصائيات الزوار (بدون أي بيانات شخصية)، الحجوزات الجاية، وإدارة الطلبات
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const p2 = (n) => String(n).padStart(2, '0');
export const ksaDay = (t = Date.now()) => { const d = new Date(t + 3 * 3600e3); return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`; };
export const STATUSES = ['جديد', 'تواصلت', 'عرض سعر', 'تم الاتفاق', 'مؤجل', 'ما تم'];
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|lighthouse|pingdom|monitor/i;

// زيارة: { p: '/' أو '/salla' أو 'p:salla', r: 'instagram.com', u: 1 لو أول زيارة اليوم }
export async function recordHit(request, kv, now = Date.now()) {
  if (BOT.test(request.headers.get('user-agent') || '')) return new Response(null, { status: 204 });
  let b = {}; try { b = JSON.parse((await request.text()).slice(0, 500)); } catch {}
  const path = String(b.p || '/').slice(0, 40).replace(/[^\w/:.-]/g, '');
  let ref = String(b.r || '').toLowerCase().replace(/^www\./, '').slice(0, 40).replace(/[^a-z0-9.-]/g, '');
  if (/instagram/.test(ref)) ref = 'instagram'; else if (/tiktok/.test(ref)) ref = 'tiktok'; else if (/snapchat/.test(ref)) ref = 'snapchat';
  else if (/google\./.test(ref)) ref = 'google'; else if (/(^|\.)t\.co$|twitter|x\.com/.test(ref)) ref = 'x'; else if (/whatsapp|wa\.me/.test(ref)) ref = 'whatsapp';
  else if (/facebook|fb\./.test(ref)) ref = 'facebook'; else if (/linkedin/.test(ref)) ref = 'linkedin'; else if (/shaheendesign|vercel\.app/.test(ref)) ref = '';
  const key = `stats:${ksaDay(now)}`;
  const s = (await kv.get(key, 'json')) || { views: 0, visitors: 0, paths: {}, refs: {}, books: 0 };
  s.views++; if (b.u) s.visitors++;
  s.paths[path] = (s.paths[path] || 0) + 1;
  if (b.u) { const r = ref || 'مباشر'; s.refs[r] = (s.refs[r] || 0) + 1; }
  if (Object.keys(s.paths).length > 80) delete s.paths[Object.keys(s.paths).sort((a, c) => s.paths[a] - s.paths[c])[0]];
  if (Object.keys(s.refs).length > 30) delete s.refs[Object.keys(s.refs).sort((a, c) => s.refs[a] - s.refs[c])[0]];
  await kv.put(key, JSON.stringify(s), { expirationTtl: 60 * 60 * 24 * 200 });
  return new Response(null, { status: 204 });
}

async function allLeads(kv, n = 150) {
  const idx = ((await kv.get('leads:index', 'json')) || []).slice(0, n);
  const out = [];
  for (const id of idx) { const l = await kv.get(`lead:${id}`, 'json'); if (l) out.push(l); }
  return out;
}

const clip = (v, n) => String(v ?? '').replace(/[<>\u0000-\u001f]/g, ' ').trim().slice(0, n);
const strip = ({ value, ...l }) => l;
async function teamOf(kv) {
  const acc = (await kv.get('staff:accounts', 'json')) || [];
  return [{ id: 'owner', name: 'عبدالرحمن' }, ...acc.filter((a) => a.active).map((a) => ({ id: a.id, name: a.name }))];
}

export async function ownerApi(request, kv, url, now = Date.now(), who = { role: 'owner' }) {
  const staff = who.role === 'staff';
  const p = url.pathname;
  if (p === '/api/owner/summary' && request.method === 'GET') {
    const days = [];
    for (let i = 29; i >= 0; i--) { const d = ksaDay(now - i * 864e5); days.push({ day: d, ...((await kv.get(`stats:${d}`, 'json')) || { views: 0, visitors: 0, paths: {}, refs: {} }) }); }
    const leads = await allLeads(kv);
    const upcoming = leads.filter((l) => l.kind === 'booking' && l.slot && l.status !== 'ملغي' && Date.parse(l.slot + ':00+03:00') > now - 3600e3)
      .sort((a, b) => a.slot.localeCompare(b.slot));
    const team = await teamOf(kv);
    const meId = staff ? who.id : 'owner';
    if (staff) return json({ days: [], leads: leads.map(({ value, ...l }) => l), upcoming, statuses: STATUSES, today: ksaDay(now), role: 'staff', team, me: meId }); // إحصائيات الزوار وقيمة الصفقات للمالك
    return json({ days, leads, upcoming, statuses: STATUSES, today: ksaDay(now), role: 'owner', team, me: meId });
  }
  // ---------- المشاريع ونسب الشركاء ----------
  if (p.startsWith('/api/owner/project')) return projectsApi(request, kv, p, now, who);
  // طلب جديد يدخله الفريق بنفسه (اتصال، انستقرام، زيارة، إحالة)
  if (p === '/api/owner/lead/new' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch {}
    const name = clip(b.name, 60), wa = String(b.wa || '').replace(/[^0-9]/g, '').replace(/^0(5\d{8})$/, '966$1').replace(/^(5\d{8})$/, '966$1');
    if (name.length < 2) return json({ error: 'اكتب اسم العميل' }, 400);
    if (wa && !/^9665\d{8}$/.test(wa)) return json({ error: 'رقم الجوال لازم يبدأ بـ 05' }, 400);
    const id = makeId(now), by = staff ? who.name : 'المالك';
    const lead = { id, at: new Date(now).toISOString(), source: clip(b.source, 40) || 'إدخال يدوي', kind: 'manual', name, wa: wa || '', serviceName: clip(b.service, 80), details: clip(b.details, 600), budget: clip(b.budget, 40), status: 'جديد',
      assignee: staff ? who.id : (b.assign || ''), referredBy: b.referred ? (staff ? who.id : 'owner') : undefined, createdBy: by, log: [{ at: new Date(now).toISOString(), by, type: 'create', text: 'أضاف الطلب' + (b.referred ? ' (إحالة)' : '') }] };
    await kv.put(`lead:${id}`, JSON.stringify(lead));
    const idx = (await kv.get('leads:index', 'json')) || []; idx.unshift(id); await kv.put('leads:index', JSON.stringify(idx.slice(0, 200)));
    return json({ ok: true, lead: staff ? strip(lead) : lead });
  }
  if (p === '/api/owner/lead' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch {}
    const id = String(b.id || '');
    if (!/^[\w-]{4,40}$/.test(id)) return json({ error: 'رقم غير صالح' }, 400);
    const l = await kv.get(`lead:${id}`, 'json');
    if (!l) return json({ error: 'الطلب غير موجود' }, 404);
    const by = staff ? who.name : 'المالك', at = new Date(now).toISOString();
    const log = (type, text) => { l.log = [...(l.log || []), { at, by, type, text: clip(text, 1000) }].slice(-120); };
    if (b.status != null && b.status !== (l.status || 'جديد')) {
      if (![...STATUSES, 'ملغي', 'تمت'].includes(b.status)) return json({ error: 'حالة غير معروفة' }, 400);
      log('status', 'غيّر الحالة: ' + (l.status || 'جديد') + ' ← ' + b.status); l.status = b.status;
    }
    if (b.note != null) l.note = String(b.note).slice(0, 1000);
    if (b.addNote != null && String(b.addNote).trim()) log('note', String(b.addNote).trim());
    if (b.contact) { const ch = { whatsapp: 'تواصل بالواتساب', call: 'اتصل بالعميل', noanswer: 'اتصل وما رد' }[b.contact]; if (ch) { log('contact', ch); l.lastContact = at; if ((l.status || 'جديد') === 'جديد' && b.contact !== 'noanswer') { l.status = 'تواصلت'; log('status', 'غيّر الحالة: جديد ← تواصلت'); } } }
    if (b.followUp !== undefined) {
      const f = String(b.followUp || '');
      if (f && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(f)) return json({ error: 'موعد المتابعة غير صالح' }, 400);
      if (f !== (l.followUp || '')) { log('followup', f ? 'حدد موعد متابعة ' + f.replace('T', ' ') : 'شال موعد المتابعة'); l.followUp = f || undefined; }
    }
    let notifyAssignee = null;
    if (b.assign !== undefined && b.assign !== (l.assignee || '')) {
      const team = await teamOf(kv), t = team.find((x) => x.id === b.assign);
      if (b.assign && !t) return json({ error: 'الموظف مو موجود' }, 400);
      l.assignee = b.assign || undefined; log('assign', t ? 'أسند الطلب لـ ' + t.name : 'شال الإسناد');
      if (t && t.id !== (staff ? who.id : 'owner')) notifyAssignee = t.id;
    }
    if (b.value != null && !staff) { const v = parseInt(String(b.value).replace(/[^0-9]/g, ''), 10); l.value = v > 0 ? v : undefined; }
    if (b.status === 'ملغي' && l.slot) { const t = (await kv.get('book:taken', 'json')) || {}; if (t[l.slot] === id) { delete t[l.slot]; await kv.put('book:taken', JSON.stringify(t)); } }
    l.updatedAt = at; l.updatedBy = by;
    await kv.put(`lead:${id}`, JSON.stringify(l));
    if (notifyAssignee) { try { await sendPush(kv, { title: 'انسند لك طلب ' + id, body: [l.name, l.serviceName].filter(Boolean).join(' · '), url: '/admin', tag: 'assign-' + id }, { toWho: notifyAssignee === 'owner' ? 'owner' : 'staff:' + notifyAssignee }); } catch {} }
    return json({ ok: true, lead: staff ? strip(l) : l });
  }
  return json({ error: 'not found' }, 404);
}


// المشاريع: كل مشروع له عميل وقيمة وتكاليف وضرائب ونسبة للشريك، وتحصيلات من العميل ومدفوعات للشريك
// الشريك يشوف مشاريعه بس، مع كشف حسابها (حسب البند الرابع في الاتفاقية). الإضافة والتعديل للمالك
const PSTATUS = ['قيد التنفيذ', 'تم التسليم', 'متوقف', 'ملغي'];
const PTYPES = ['تطبيق', 'موقع', 'نظام', 'متجر', 'اشتراك', 'دعم فني', 'هوية بصرية', 'أخرى'];
const PROLES = ['استقطاب', 'توجيه برمجي', 'خدمات', 'دعم تقني'];
const money = (v) => { const n = Math.round((Number(String(v ?? '').replace(/[^0-9.]/g, '')) || 0) * 100) / 100; return Math.min(n, 1e8); };
const day = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : '');
export function calcProject(x) {
  const collected = (x.collections || []).reduce((a, c) => a + c.amount, 0);
  const paid = (x.payouts || []).reduce((a, c) => a + c.amount, 0);
  const net = Math.max(0, collected - (x.costs || 0) - (x.taxes || 0));
  const due = Math.round(net * (x.pct || 0)) / 100;
  const expected = Math.round(Math.max(0, (x.value || 0) - (x.costs || 0) - (x.taxes || 0)) * (x.pct || 0)) / 100;
  return { collected, paid, net, due, remaining: Math.round((due - paid) * 100) / 100, expected };
}
async function projectsApi(request, kv, p, now, who) {
  const staff = who.role === 'staff', me = staff ? who.id : 'owner', by = staff ? who.name : 'المالك', at = new Date(now).toISOString();
  const all = (await kv.get('projects', 'json')) || [];
  const view = (x) => ({ ...x, calc: calcProject(x) });
  if (p === '/api/owner/projects' && request.method === 'GET') {
    const list = staff ? all.filter((x) => x.partner === me) : all;
    return json({ projects: list.map(view), team: await teamOf(kv), me, statuses: PSTATUS, types: PTYPES, roles: PROLES });
  }
  if (request.method !== 'POST') return json({ error: 'not found' }, 404);
  let b = {}; try { b = await request.json(); } catch {}
  const save = async () => { await kv.put('projects', JSON.stringify(all.slice(0, 1000))); };
  const find = () => { const x = all.find((y) => y.id === b.id); if (!x) throw Object.assign(new Error('المشروع مو موجود'), { code: 404 }); if (staff && x.partner !== me) throw Object.assign(new Error('غير مسموح'), { code: 403 }); return x; };
  const log = (x, text) => { x.log = [...(x.log || []), { at, by, text: clip(text, 600) }].slice(-150); };
  try {
    if (p === '/api/owner/project/note') { const x = find(); if (!String(b.text || '').trim()) throw new Error('اكتب الملاحظة'); log(x, String(b.text).trim()); await save(); return json({ ok: true, project: view(x) }); }
    if (staff) return json({ error: 'إضافة المشاريع وتعديلها للمالك' }, 403);
    if (p === '/api/owner/project') {
      const team = await teamOf(kv);
      const title = clip(b.title, 80), client = clip(b.client, 60);
      if (title.length < 2 || client.length < 2) throw new Error('اكتب اسم المشروع والعميل');
      if (b.partner && !team.some((t) => t.id === b.partner && t.id !== 'owner')) throw new Error('الشريك مو موجود');
      const pct = Math.min(100, Math.max(0, Number(b.pct) || 0));
      const rec = { title, client, clientWa: String(b.clientWa || '').replace(/[^0-9]/g, '').slice(0, 15), type: PTYPES.includes(b.type) ? b.type : 'أخرى', status: PSTATUS.includes(b.status) ? b.status : 'قيد التنفيذ',
        partner: b.partner || '', referred: !!b.referred, roles: (Array.isArray(b.roles) ? b.roles : []).filter((r) => PROLES.includes(r)), pct,
        value: money(b.value), costs: money(b.costs), taxes: money(b.taxes), start: day(b.start), delivered: day(b.delivered), annex: clip(b.annex, 30), notes: clip(b.notes, 600), leadId: clip(b.leadId, 40) };
      if (b.id) { const x = find(); const changes = []; if (x.status !== rec.status) changes.push('الحالة: ' + rec.status); if (x.pct !== rec.pct) changes.push('النسبة: ' + rec.pct + '٪'); Object.assign(x, rec, { updatedAt: at }); log(x, 'عدّل المشروع' + (changes.length ? ' (' + changes.join('، ') + ')' : '')); await save(); return json({ ok: true, project: view(x) }); }
      const x = { id: 'PR-' + now.toString(36).toUpperCase().slice(-6), ...rec, collections: [], payouts: [], createdAt: at, log: [{ at, by, text: 'أنشأ المشروع' }] };
      all.unshift(x); await save(); return json({ ok: true, project: view(x) });
    }
    if (p === '/api/owner/project/money') {
      const x = find(); const kind = b.kind === 'payout' ? 'payouts' : 'collections'; const amount = money(b.amount);
      if (b.remove != null) { const i = Number(b.remove); const r = (x[kind] || [])[i]; if (!r) throw new Error('غير موجود'); x[kind].splice(i, 1); log(x, (kind === 'payouts' ? 'حذف دفعة للشريك ' : 'حذف تحصيل ') + r.amount + ' ر.س'); await save(); return json({ ok: true, project: view(x) }); }
      if (!amount) throw new Error('اكتب المبلغ');
      x[kind] = [...(x[kind] || []), { amount, date: day(b.date) || at.slice(0, 10), note: clip(b.note, 120) }];
      log(x, (kind === 'payouts' ? 'صرف للشريك ' : 'تحصيل من العميل ') + amount + ' ر.س'); await save(); return json({ ok: true, project: view(x) });
    }
    if (p === '/api/owner/project/delete') { const x = find(); all.splice(all.indexOf(x), 1); await save(); return json({ ok: true }); }
  } catch (e) { return json({ error: e.message }, e.code || 400); }
  return json({ error: 'not found' }, 404);
}
