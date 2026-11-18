// تخزين Supabase: جدول kv للمحتوى والمحادثات والطلبات، وحاوية media للصور
// يتكلم مع Supabase عبر REST مباشرة، بدون مكتبات إضافية

function headers(key, extra = {}) {
  const h = { apikey: key, ...extra };
  // المفاتيح الجديدة (sb_secret_...) تنرسل في apikey فقط، والمفتاح القديم (service_role) ينرسل في الاثنين
  if (!String(key).startsWith('sb_')) h.authorization = `Bearer ${key}`;
  return h;
}

export function supabaseKV({ url, key, fetchImpl = fetch }) {
  const base = `${url.replace(/\/$/, '')}/rest/v1/kv`;
  let puts = 0;
  return {
    async get(k, type) {
      const r = await fetchImpl(`${base}?key=eq.${encodeURIComponent(k)}&select=value,expires_at`, { headers: headers(key) });
      if (!r.ok) throw new Error(`Supabase get ${r.status}: ${await r.text()}`);
      const row = (await r.json())[0];
      if (!row) return null;
      if (row.expires_at && Date.parse(row.expires_at) <= Date.now()) return null;
      return type === 'json' ? JSON.parse(row.value) : row.value;
    },
    async put(k, value, opts = {}) {
      const row = {
        key: k,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        expires_at: opts.expirationTtl ? new Date(Date.now() + opts.expirationTtl * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      const r = await fetchImpl(base, {
        method: 'POST',
        headers: headers(key, { 'content-type': 'application/json', prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify(row),
      });
      if (!r.ok) throw new Error(`Supabase put ${r.status}: ${await r.text()}`);
      // تنظيف خفيف للسجلات المنتهية، مرة كل ٢٠٠ كتابة تقريبًا
      if (++puts % 200 === 0) fetchImpl(`${base}?expires_at=lt.${encodeURIComponent(new Date().toISOString())}`, { method: 'DELETE', headers: headers(key) }).catch(() => {});
    },
    // يكتب المفتاح بس إذا ما كان موجود (ذرّي في قاعدة البيانات): يرجع true لو انكتب، false لو كان موجود
    // نستخدمه للأشياء اللي ما تتكرر أبدًا: رقم فاتورة، دفعة انحسبت، رابط محجوز
    async add(k, value, opts = {}) {
      const row = () => ({ key: k, value: typeof value === 'string' ? value : JSON.stringify(value), expires_at: opts.expirationTtl ? new Date(Date.now() + opts.expirationTtl * 1000).toISOString() : null, updated_at: new Date().toISOString() });
      for (let i = 0; i < 2; i++) {
        const r = await fetchImpl(base, { method: 'POST', headers: headers(key, { 'content-type': 'application/json', prefer: 'resolution=ignore-duplicates,return=representation' }), body: JSON.stringify(row()) });
        if (!r.ok) throw new Error(`Supabase add ${r.status}: ${await r.text()}`);
        if ((await r.json()).length) return true;
        // موجود: إذا كان منتهي نشيله ونحاول مرة وحدة
        const d = await fetchImpl(`${base}?key=eq.${encodeURIComponent(k)}&expires_at=lt.${encodeURIComponent(new Date().toISOString())}`, { method: 'DELETE', headers: headers(key, { prefer: 'return=representation' }) });
        if (!d.ok || !(await d.json()).length) return false;
      }
      return false;
    },
    async getWithMetadata() { return { value: null, metadata: null }; }, // الصور في Storage مو هنا
  };
}

export function supabaseMedia({ url, key, bucket = 'media', fetchImpl = fetch }) {
  const base = url.replace(/\/$/, '');
  return {
    async put(id, buf, type) {
      const r = await fetchImpl(`${base}/storage/v1/object/${bucket}/${id}`, {
        method: 'POST',
        headers: headers(key, { 'content-type': type, 'x-upsert': 'true', 'cache-control': '31536000' }),
        body: buf,
      });
      if (!r.ok) throw new Error(`Supabase storage ${r.status}: ${await r.text()}`);
      return `${base}/storage/v1/object/public/${bucket}/${id}`;
    },
  };
}
