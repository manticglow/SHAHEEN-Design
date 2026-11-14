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
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL و SUPABASE_SECRET_KEY ناقصين في إعدادات Vercel');
  env = { ...process.env, BOT_KV: supabaseKV({ url, key }), MEDIA: supabaseMedia({ url, key }) };
  return env;
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
    let e;
    try { e = getEnv(); } catch (err) { return new Response(String(err.message), { status: 500 }); }
    return app.fetch(request, e, { waitUntil });
  },
};
