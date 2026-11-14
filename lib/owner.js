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

export async function ownerApi(request, kv, url, now = Date.now()) {
  const p = url.pathname;
  if (p === '/api/owner/summary' && request.method === 'GET') {
    const days = [];
    for (let i = 29; i >= 0; i--) { const d = ksaDay(now - i * 864e5); days.push({ day: d, ...((await kv.get(`stats:${d}`, 'json')) || { views: 0, visitors: 0, paths: {}, refs: {} }) }); }
    const leads = await allLeads(kv);
    const upcoming = leads.filter((l) => l.kind === 'booking' && l.slot && l.status !== 'ملغي' && Date.parse(l.slot + ':00+03:00') > now - 3600e3)
      .sort((a, b) => a.slot.localeCompare(b.slot));
    return json({ days, leads, upcoming, statuses: STATUSES, today: ksaDay(now) });
  }
  if (p === '/api/owner/lead' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch {}
    const id = String(b.id || '');
    if (!/^[\w-]{4,40}$/.test(id)) return json({ error: 'رقم غير صالح' }, 400);
    const l = await kv.get(`lead:${id}`, 'json');
    if (!l) return json({ error: 'الطلب غير موجود' }, 404);
    if (b.status != null) { if (![...STATUSES, 'ملغي', 'تمت'].includes(b.status)) return json({ error: 'حالة غير معروفة' }, 400); l.status = b.status; }
    if (b.note != null) l.note = String(b.note).slice(0, 1000);
    if (b.value != null) { const v = parseInt(String(b.value).replace(/[^0-9]/g, ''), 10); l.value = v > 0 ? v : undefined; }
    if (b.status === 'ملغي' && l.slot) { const t = (await kv.get('book:taken', 'json')) || {}; if (t[l.slot] === id) { delete t[l.slot]; await kv.put('book:taken', JSON.stringify(t)); } }
    l.updatedAt = new Date(now).toISOString();
    await kv.put(`lead:${id}`, JSON.stringify(l));
    return json({ ok: true, lead: l });
  }
  return json({ error: 'not found' }, 404);
}
