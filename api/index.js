// نقطة الدخول على Vercel: صفحات الموقع + لوحة التحكم + المحتوى + الحجز + بوت الواتساب + الطلبات
// vercel.json يحوّل / و /book وروابط المنتجات و /admin و /webhook و /leads و /api/* لهذي الدالة
import { waitUntil } from '@vercel/functions';
import app from '../lib/app.js';
import { servePublic } from '../lib/seo.js';
import { supabaseKV, supabaseMedia } from '../lib/supabase.js';

export const config = { maxDuration: 30 };

let env;
function getEnv() {
  if (env) return env;
  // يقبل أسماء المتغيرات اللي يحطها ربط Supabase مع Vercel تلقائيًا، أو اللي تحطها بيدك
  // ربط Supabase مع Vercel أحيانًا يضيف بادئة للأسماء (مثل STORAGE_SUPABASE_URL)، فندوّر بأي اسم ينتهي بالمطلوب
  const E = process.env;
  const find = (...ends) => { for (const e of ends) { if (E[e]) return E[e]; const k = Object.keys(E).find((n) => n.endsWith('_' + e) && E[n]); if (k) return E[k]; } return ''; };
  let url = find('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL').trim().replace(/\/+$/, '');
  // لو انحط رقم المشروع بس (مثل zjdcziuyrcldujterxbi) أو الدومين بدون https نكمّله
  if (/^[a-z0-9]{15,40}$/i.test(url)) url = `https://${url}.supabase.co`;
  else if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  const key = find('SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('SUPABASE_URL و SUPABASE_SECRET_KEY ناقصين في إعدادات Vercel');
  env = { ...process.env, BOT_KV: supabaseKV({ url, key }), MEDIA: supabaseMedia({ url, key }) };
  return env;
}

async function health() {
  const E = process.env, out = {};
  const names = Object.keys(E).filter((n) => /SUPABASE|ADMIN_PASSWORD|SESSION_SECRET|OWNER_WA/.test(n) && !/^NEXT_PUBLIC_SUPABASE_ANON|JWT/.test(n));
  out.found = names.sort(); // الأسماء بس، بدون القيم
  const pw = String(E.ADMIN_PASSWORD || '');
  out.admin_password = pw ? `موجود — عدد حروفه ${pw.trim().length}${pw !== pw.trim() ? ' (فيه مسافة زايدة، تجاهلناها)' : ''}${/[\u0600-\u06FF]/.test(pw) ? ' (فيه حروف عربية)' : ''}` : 'ناقص';
  out.session_secret = E.SESSION_SECRET ? (E.SESSION_SECRET.length >= 16 ? 'موجود' : 'قصير، لازم ١٦ حرف أو أكثر') : 'ناقص';
  try {
    const env = getEnv();
    out.supabase_env = 'موجود';
    try { await env.BOT_KV.get('health:ping'); out.database = 'متصل ✓'; }
    catch (err) { out.database = 'فشل الاتصال: ' + String(err.message).slice(0, 300); }
  } catch (err) { out.supabase_env = String(err.message); }
  return new Response(JSON.stringify(out, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

export default {
  async fetch(request) {
    // الصفحات العامة أول (ما تحتاج قاعدة بيانات)
    const url = new URL(request.url);
    const routed = url.searchParams.get('__p');
    if (routed != null) { url.pathname = '/' + routed.replace(/^\/+/, ''); url.searchParams.delete('__p'); }
    if (request.method === 'GET' || request.method === 'HEAD') {
      let kv = null; try { kv = getEnv().BOT_KV; } catch {} // بدون Supabase الموقع يطلع بمحتواه الأصلي
      const page = await servePublic(url, undefined, kv);
      if (page) return page;
    }
    // فحص سريع: /api/health يقول وش الناقص بدون ما يكشف أي قيمة
    if (url.pathname === '/api/health') return health();
    let e;
    try { e = getEnv(); } catch (err) { return Response.json({ error: String(err.message) }, { status: 500 }); }
    return app.fetch(request, e, { waitUntil });
  },
};
