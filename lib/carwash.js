// تجربة نظام المغسلة (/carwash): بطاقة ولاء + طلب ودفع تجريبي + تقييم
// كل البيانات في مفتاح واحد cw:state، وترجع لبدايتها كل يوم (تجربة عامة)
const KEY = 'cw:state';
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const ksaDay = (t = Date.now()) => new Date(t + 3 * 3600e3).toISOString().slice(0, 10);
const str = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const int = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));
const iso = (v) => { const t = Date.parse(v); return Number.isFinite(t) ? new Date(t).toISOString() : new Date().toISOString(); };
const HEX = /^#[0-9a-f]{6}$/i;

export function seedState(now = Date.now()) {
  const ago = (h) => new Date(now - h * 3600e3).toISOString();
  const M = [
    ['LM-1042', 'سعد الحربي', '0551234567', 'جيب كبير', '#F4F6F8', 8, 18, 1, 6],
    ['LM-1043', 'نورة القحطاني', '0569876543', 'كروس أوفر', '#C8323A', 3, 3, 0, 30],
    ['LM-1044', 'ماجد الزهراني', '0541112233', 'بيك أب', '#B8C0C8', 9, 29, 2, 8],
    ['LM-1045', 'ريم الشهري', '0533344556', 'هاتشباك', '#2F6FD6', 5, 5, 0, 26],
    ['LM-1046', 'خالد المالكي', '0507788990', 'سيدان فاخرة', '#1B1E22', 1, 11, 1, 50],
  ];
  const members = {};
  M.forEach((e, i) => { members[e[0]] = { id: e[0], name: e[1], phone: e[2], type: e[3], color: e[4], stamps: e[5], total: e[6], rewards: e[7], joined: ago(24 * (20 + i * 9)), visits: [ago(e[8])], example: true }; });
  const days = {}; [9, 14, 11, 7, 16, 19, 6].forEach((v, i) => { days[ksaDay(now - (6 - i) * 86400e3)] = v; });
  return {
    day: ksaDay(now), members, orders: [],
    ratings: [
      { id: 'r1', member: 'LM-1042', name: 'سعد الحربي', stars: 5, tags: ['نظافة ممتازة', 'سريع'], note: 'شغل نظيف وسريع', by: 'أحمد', at: ago(5), example: true },
      { id: 'r2', member: 'LM-1044', name: 'ماجد الزهراني', stars: 4, tags: ['تلميع حلو'], note: '', by: 'أحمد', at: ago(7), example: true },
      { id: 'r3', member: 'LM-1045', name: 'ريم الشهري', stars: 2, tags: ['فاتهم أماكن'], note: 'الجنوط ما انغسلت زين', by: 'أحمد', at: ago(25), example: true },
    ],
    feed: { items: [{ at: ago(6), text: 'ختم لـ سعد الحربي', by: 'أحمد' }, { at: ago(8), text: 'ختم لـ ماجد الزهراني', by: 'أحمد' }], days },
    config: { need: 10, gapMin: 60, staff: [{ name: 'أحمد', pin: '1234' }], offers: 0, google: '' },
  };
}

async function load(kv, now) {
  let s = null; try { s = await kv.get(KEY, 'json'); } catch {}
  if (!s || s.day !== ksaDay(now)) { s = seedState(now); await kv.put(KEY, JSON.stringify(s)); }
  return s;
}
const mask = (p) => (p ? String(p).slice(0, 2) + '•••••' + String(p).slice(-3) : '');
function publicState(s) {
  const members = {};
  for (const [k, m] of Object.entries(s.members)) members[k] = { ...m, phone: mask(m.phone) };
  return { members, orders: s.orders.map((o) => ({ ...o, phone: undefined })), ratings: s.ratings.map((r) => ({ ...r, phone: undefined })), feed: s.feed, config: { ...s.config, staff: s.config.staff.map((x) => ({ name: x.name })) }, serverTime: new Date().toISOString() };
}
const lastVisit = (m) => { const v = (m && m.visits) || []; return v.length ? Date.parse(v[v.length - 1]) || 0 : 0; };

function cleanMember(d, old) {
  const phone = String(d.phone || '');
  return {
    id: str(d.id, 20), name: str(d.name, 60), phone: old && phone.includes('•') ? old.phone : phone.replace(/\D/g, '').slice(0, 10),
    type: str(d.type, 20), color: HEX.test(d.color) ? d.color : '#F4F6F8',
    stamps: int(d.stamps, 0, 20), total: int(d.total, 0, 100000), rewards: int(d.rewards, 0, 10000),
    joined: iso(old ? old.joined : d.joined), visits: (Array.isArray(d.visits) ? d.visits : []).slice(-10).map(iso),
    ...(d.pendingRating ? { pendingRating: iso(d.pendingRating) } : {}), ...(d.lastStaff ? { lastStaff: str(d.lastStaff, 30) } : {}),
    ...(d.thanks ? { thanks: int(d.thanks, 1, 5) } : {}), ...(old && old.example ? { example: true } : {}),
  };
}

export async function handleCarwash(request, env, url, now = Date.now()) {
  const kv = env.BOT_KV;
  if (url.pathname === '/api/wallet/state' && request.method === 'GET') return json(publicState(await load(kv, now)));
  if (request.method !== 'POST') return json({ error: 'not found' }, 404);

  const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'x').split(',')[0].trim();
  const rl = `rl:cw:${ip}:${Math.floor(now / 60000)}`;
  const n = Number((await kv.get(rl)) || 0);
  if (n >= 60) return json({ error: 'طلبات كثيرة، انتظر دقيقة' }, 429);
  await kv.put(rl, String(n + 1), { expirationTtl: 120 });

  const raw = await request.text();
  if (raw.length > 20000) return json({ error: 'too large' }, 413);
  let b; try { b = JSON.parse(raw); } catch { return json({ error: 'bad json' }, 400); }
  const s = await load(kv, now);
  const d = b.data || {};

  if (url.pathname === '/api/wallet/lookup') {
    const p = String(b.phone || '').replace(/\D/g, '');
    const m = Object.values(s.members).find((x) => x.phone === p);
    return json({ id: m ? m.id : null });
  }
  if (url.pathname === '/api/wallet/pin') {
    const st = s.config.staff.find((x) => x.pin === String(b.pin || ''));
    return st ? json({ name: st.name }) : json({ error: 'الرمز غلط' }, 403);
  }
  if (url.pathname !== '/api/wallet/put') return json({ error: 'not found' }, 404);

  switch (b.kind) {
    case 'member': {
      if (!/^LM-[A-Z0-9-]{3,14}$/.test(d.id || '')) return json({ error: 'bad id' }, 400);
      const old = s.members[d.id];
      if (!old && Object.keys(s.members).length >= 300) return json({ error: 'التجربة امتلت، ترجع لبدايتها بكرة' }, 409);
      const m = cleanMember(d, old);
      if (!old && (m.name.length < 2 || !/^05\d{8}$/.test(m.phone))) return json({ error: 'الاسم أو الجوال غير صحيح' }, 400);
      if (old && m.total > old.total && now - lastVisit(old) < (s.config.gapMin || 60) * 60e3) {
        return json({ error: 'ما ينفع ختمين في نفس المدة', state: publicState(s) }, 409);
      }
      s.members[m.id] = m; break;
    }
    case 'order': {
      if (!/^o[a-z0-9]{4,16}$/.test(d.id || '')) return json({ error: 'bad id' }, 400);
      const o = {
        id: d.id, no: str(d.no, 24), member: str(d.member, 20), name: str(d.name, 60), car: str(d.car, 20),
        items: (Array.isArray(d.items) ? d.items : []).slice(0, 5).map((it) => [str(it[0], 40), int(it[1], 0, 2000)]),
        total: int(d.total, 0, 5000), method: str(d.method, 20), status: ['unpaid', 'paid', 'washing', 'done'].includes(d.status) ? d.status : 'paid',
        at: iso(d.at), agreed: !!d.agreed, ...(d.paidAt ? { paidAt: iso(d.paidAt) } : {}), ...(d.agreedAt ? { agreedAt: iso(d.agreedAt) } : {}), ...(d.by ? { by: str(d.by, 30) } : {}), ...(d.doneAt ? { doneAt: iso(d.doneAt) } : {}),
      };
      const i = s.orders.findIndex((x) => x.id === o.id);
      if (i > -1) s.orders[i] = o; else s.orders.unshift(o);
      s.orders = s.orders.slice(0, 200); break;
    }
    case 'rating': {
      const r = { id: str(d.id, 20), member: str(d.member, 20), name: str(d.name, 60), stars: int(d.stars, 1, 5), tags: (Array.isArray(d.tags) ? d.tags : []).slice(0, 6).map((t) => str(t, 30)), note: str(d.note, 300), by: str(d.by, 30), at: iso(d.at) };
      const m = s.members[r.member]; if (m) r.phone = m.phone;
      s.ratings = [r, ...s.ratings.filter((x) => x.id !== r.id)].slice(0, 200); break;
    }
    case 'feed': {
      s.feed = { items: (Array.isArray(d.items) ? d.items : []).slice(0, 40).map((x) => ({ at: iso(x.at), text: str(x.text, 140), by: str(x.by, 30) })), days: {} };
      for (const [k, v] of Object.entries(d.days || {}).slice(-31)) if (/^\d{4}-\d{2}-\d{2}$/.test(k)) s.feed.days[k] = int(v, 0, 10000);
      break;
    }
    case 'config': {
      const c = s.config;
      if ([8, 10, 12].includes(Number(d.need))) c.need = Number(d.need);
      if ([60, 180, 1440].includes(Number(d.gapMin))) c.gapMin = Number(d.gapMin);
      if (d.offers != null) c.offers = int(d.offers, 0, 100000);
      if (typeof d.disclaimer === 'string') { const t = str(d.disclaimer, 300); if (t.length >= 20) c.disclaimer = t; }
      if (typeof d.google === 'string') c.google = /^https:\/\/[^\s"'<>]{4,300}$/.test(d.google) ? d.google : '';
      if (Array.isArray(d.staffAdd)) for (const x of d.staffAdd.slice(0, 1)) {
        const name = str(x.name, 30), pin = String(x.pin || '');
        if (name.length >= 2 && /^\d{4}$/.test(pin) && !c.staff.some((y) => y.pin === pin) && c.staff.length < 10) c.staff.push({ name, pin });
      }
      if (d.staffDel != null && c.staff.length > 1) c.staff = c.staff.filter((x) => x.name !== String(d.staffDel));
      break;
    }
    default: return json({ error: 'unknown' }, 400);
  }
  await kv.put(KEY, JSON.stringify(s));
  return json(publicState(s));
}
