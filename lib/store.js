// تعديلات المتجر من لوحة التحكم: أسماء المنتجات ونصوصها وباقاتها وأسعارها، إخفاء منتج، وأوقات الحجز
// الأصل في lib/site.html، واللوحة تحفظ الفروقات بس في store:current
const MAX_BYTES = 200 * 1024;
const KEEP = 15;
const len = (s) => [...String(s ?? '')].length;

export async function getStore(kv) {
  if (!kv) return {};
  try { return (await kv.get('store:current', 'json')) || {}; } catch (e) { console.log('store read failed', String(e)); return {}; }
}

const TEXT = { name: 30, full: 60, short: 120, desc: 400, hook: 80, tag: 30, days: 30, support: 30 };

export function validateStore(s, ids) {
  const E = [];
  if (!s || typeof s !== 'object' || Array.isArray(s)) return ['صيغة غير صالحة'];
  const P = s.products || {};
  if (typeof P !== 'object' || Array.isArray(P)) E.push('products: صيغة غير صالحة');
  else for (const [id, x] of Object.entries(P)) {
    if (!ids.includes(id)) { E.push(`منتج غير معروف: ${id}`); continue; }
    if (!x || typeof x !== 'object') { E.push(`${id}: صيغة غير صالحة`); continue; }
    if (x.hidden != null && typeof x.hidden !== 'boolean') E.push(`${id}: الإخفاء لازم يكون نعم أو لا`);
    for (const [k, max] of Object.entries(TEXT)) {
      if (x[k] == null) continue;
      if (typeof x[k] !== 'string') E.push(`${id}.${k}: لازم نص`);
      else if (len(x[k]) > max) E.push(`${id}.${k}: أطول من ${max} حرف`);
    }
    if (x.inc != null) {
      if (!Array.isArray(x.inc) || x.inc.length > 12 || x.inc.some((t) => typeof t !== 'string' || len(t) > 140)) E.push(`${id}: «وش يشمل» حدها ١٢ سطر، وكل سطر ١٤٠ حرف`);
    }
    if (x.tiers != null) {
      if (!Array.isArray(x.tiers) || x.tiers.length > 3) { E.push(`${id}: الباقات حدها ٣`); continue; }
      x.tiers.forEach((t, i) => {
        if (t == null) return;
        const n = `${id} باقة ${i + 1}`;
        if (typeof t !== 'object') { E.push(`${n}: صيغة غير صالحة`); return; }
        if (t.name != null && (typeof t.name !== 'string' || len(t.name) > 24)) E.push(`${n}: الاسم حده ٢٤ حرف`);
        if (t.price != null && !(Number.isInteger(t.price) && t.price >= 0 && t.price <= 10000000)) E.push(`${n}: السعر لازم رقم صحيح`);
        if (t.days != null && (typeof t.days !== 'string' || len(t.days) > 30)) E.push(`${n}: المدة حدها ٣٠ حرف`);
        if (t.sub != null && (typeof t.sub !== 'string' || len(t.sub) > 120)) E.push(`${n}: الوصف حده ١٢٠ حرف`);
        if (t.support != null && (typeof t.support !== 'string' || len(t.support) > 30)) E.push(`${n}: الدعم حده ٣٠ حرف`);
        if (t.items != null && (!Array.isArray(t.items) || t.items.length > 10 || t.items.some((v) => typeof v !== 'string' || len(v) > 120))) E.push(`${n}: المزايا حدها ١٠ أسطر، وكل سطر ١٢٠ حرف`);
      });
    }
  }
  if (s.book != null) {
    const b = s.book;
    if (typeof b !== 'object') E.push('المواعيد: صيغة غير صالحة');
    else {
      if (b.days != null && (!Array.isArray(b.days) || b.days.some((d) => !Number.isInteger(d) || d < 0 || d > 6))) E.push('المواعيد: الأيام غير صحيحة');
      if (b.from != null && !(Number.isInteger(b.from) && b.from >= 0 && b.from <= 23)) E.push('المواعيد: ساعة البداية غير صحيحة');
      if (b.to != null && !(Number.isInteger(b.to) && b.to >= 1 && b.to <= 24)) E.push('المواعيد: ساعة النهاية غير صحيحة');
      if (b.from != null && b.to != null && b.to <= b.from) E.push('المواعيد: النهاية لازم بعد البداية');
      if (b.closed != null && (!Array.isArray(b.closed) || b.closed.length > 120 || b.closed.some((d) => !/^\d{4}-\d{2}-\d{2}$/.test(String(d))))) E.push('المواعيد: الأيام المقفلة غير صحيحة');
    }
  }
  return E;
}

// يطبّق التعديلات على بيانات المنتجات (نفس منطق الموقع) — للعناوين وخريطة الموقع
export function applyStore(products, s) {
  const P = (s && s.products) || {};
  return products.filter((p) => !(P[p.id] && P[p.id].hidden)).map((p) => {
    const x = P[p.id]; if (!x) return p;
    const q = { ...p, tiers: p.tiers.map((t) => ({ ...t })) };
    for (const k of Object.keys(TEXT)) if (typeof x[k] === 'string' && x[k].trim()) q[k] = x[k].trim();
    (x.tiers || []).forEach((t, i) => { if (!t || !q.tiers[i]) return; for (const k of ['name', 'days', 'sub']) if (typeof t[k] === 'string' && t[k].trim()) q.tiers[i][k] = t[k].trim(); if (Number.isInteger(t.price) && t.price > 0) q.tiers[i].price = t.price; });
    if (q.tiers.length) { q.from = q.tiers[0].price; q.to = q.tiers[q.tiers.length - 1].price; }
    return q;
  });
}

export function bookFromStore(cfg, s) {
  const b = (s && s.book) || {};
  const out = { ...cfg, closed: Array.isArray(b.closed) ? b.closed : [] };
  if (Array.isArray(b.days) && b.days.length) out.days = b.days;
  if (Number.isInteger(b.from)) out.from = b.from;
  if (Number.isInteger(b.to)) out.to = b.to;
  return out;
}

// اللي ينحقن في الصفحة: الفروقات + رقم الواتساب من الإعدادات
export function publicStore(s, content) {
  const o = { products: s.products || {}, book: s.book || {} };
  // أزرار الواتساب في الموقع تروح لرقم البوت إذا محدد في الإعدادات، وإلا لرقمك
  const st = (content && content.settings) || {};
  const phone = st.orderPhone || st.phone;
  if (/^\d{9,15}$/.test(String(phone || ''))) o.contact = { phone: String(phone) };
  return o;
}

export async function handleStore(request, kv, url, { ids, now = Date.now() }) {
  const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
  const p = url.pathname;
  if (p === '/api/store' && request.method === 'GET') return json(await getStore(kv));
  if (p === '/api/store' && request.method === 'PUT') {
    const raw = await request.text();
    if (raw.length > MAX_BYTES) return json({ error: 'التعديلات أكبر من المسموح' }, 413);
    let s; try { s = JSON.parse(raw); } catch { return json({ error: 'صيغة غير صالحة' }, 400); }
    const errors = validateStore(s, ids);
    if (errors.length) return json({ error: 'فيه حقول تحتاج تعديل', errors }, 422);
    const prev = await kv.get('store:current');
    const old = prev ? JSON.parse(prev) : {};
    s.version = (Number(old.version) || 0) + 1;
    s.updatedAt = new Date(now).toISOString();
    if (prev) {
      await kv.put(`store:hist:${now}`, prev, { expirationTtl: 60 * 60 * 24 * 120 });
      const idx = (await kv.get('store:hist:index', 'json')) || [];
      idx.unshift({ ts: now, version: old.version || 0, at: old.updatedAt || null });
      await kv.put('store:hist:index', JSON.stringify(idx.slice(0, KEEP)));
    }
    await kv.put('store:current', JSON.stringify(s));
    return json({ ok: true, version: s.version, updatedAt: s.updatedAt });
  }
  if (p === '/api/store/history' && request.method === 'GET') return json((await kv.get('store:hist:index', 'json')) || []);
  if (p === '/api/store/restore' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch {}
    const old = await kv.get(`store:hist:${Number(b.ts)}`);
    if (!old) return json({ error: 'النسخة غير موجودة' }, 404);
    return json(JSON.parse(old));
  }
  return json({ error: 'not found' }, 404);
}
