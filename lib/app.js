// بوت واتساب شاهين ديزاين — Cloudflare Worker
import { createBot, cfgFrom } from './flow.js';
import { handleCms, isAdmin, getContent, catalogFromContent, sameOrigin } from './cms.js';
import ADMIN_HTML from './admin-html.js';
import { handleBooking, bookingNotifier } from './booking.js';
import { handleStore } from './store.js';
import { recordHit, ownerApi } from './owner.js';
import { productIds, siteDefaults } from './seo.js';

const ADMIN_CSP = "default-src 'self'; script-src 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8' } });

// ---------- WhatsApp Cloud API ----------
export function makeApi(env, fetchImpl = fetch) {
  const base = (env.GRAPH_BASE || 'https://graph.facebook.com').replace(/\/$/, '');
  const url = `${base}/${env.GRAPH_VERSION || 'v26.0'}/${env.PHONE_NUMBER_ID}/messages`;
  async function post(payload) {
    const r = await fetchImpl(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.WA_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
    });
    if (!r.ok) throw new Error(`WhatsApp API ${r.status}: ${await r.text()}`);
    return r.json().catch(() => ({}));
  }
  const to = (n) => ({ recipient_type: 'individual', to: String(n) });
  return {
    text: (n, body) => post({ ...to(n), type: 'text', text: { preview_url: true, body: String(body).slice(0, 4096) } }),
    buttons: (n, body, buttons) => post({ ...to(n), type: 'interactive', interactive: {
      type: 'button', body: { text: String(body).slice(0, 1024) },
      action: { buttons: buttons.slice(0, 3).map((b) => ({ type: 'reply', reply: { id: b.id, title: b.title } })) },
    } }),
    list: (n, { body, button, sections }) => post({ ...to(n), type: 'interactive', interactive: {
      type: 'list', body: { text: String(body).slice(0, 4096) }, action: { button, sections },
    } }),
    template: (n, name, lang, params) => post({ ...to(n), type: 'template', template: {
      name, language: { code: lang },
      components: [{ type: 'body', parameters: params.map((p) => ({ type: 'text', text: String(p) })) }],
    } }),
    read: (id) => post({ status: 'read', message_id: id }),
  };
}

// ---------- security ----------
async function validSignature(env, raw, header) {
  if (!env.APP_SECRET) return false;
  if (!header || !header.startsWith('sha256=')) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.APP_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw)));
  const hex = [...mac].map((b) => b.toString(16).padStart(2, '0')).join('');
  const got = header.slice(7);
  if (got.length !== hex.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function leadsPage(leads) {
  const rows = leads.map((l) => `<tr><td>${esc(l.id)}</td><td>${esc(l.at?.slice(0, 16).replace('T', ' '))}</td><td>${esc(l.name)}</td><td>${esc(l.org)}</td><td>${esc(l.serviceName || l.services || l.reason)}</td><td>${esc(l.timeline)}</td><td>${esc(l.budget)}</td><td>${esc(l.pref)}</td><td>${esc(l.details)}</td><td><a href="https://wa.me/${esc(l.wa)}">+${esc(l.wa)}</a></td><td>${esc(l.source)}</td></tr>`).join('');
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>طلبات شاهين ديزاين</title>
<style>body{font-family:system-ui,Tahoma,sans-serif;margin:0;padding:24px;background:#F1ECDF;color:#0E0E11}h1{font-size:22px}table{border-collapse:collapse;width:100%;background:#fff;font-size:14px}th,td{border:1px solid #E2D9C6;padding:8px 10px;text-align:start;vertical-align:top}th{background:#0E0E11;color:#F1ECDF}a{color:#8A6A3E}.wrap{overflow-x:auto}</style></head>
<body><h1>آخر الطلبات (${leads.length})</h1><div class="wrap"><table><thead><tr><th>رقم الطلب</th><th>الوقت (UTC)</th><th>الاسم</th><th>الجهة</th><th>الخدمة</th><th>الموعد</th><th>الميزانية</th><th>التواصل</th><th>التفاصيل</th><th>واتساب</th><th>المصدر</th></tr></thead><tbody>${rows || '<tr><td colspan="11">ما فيه طلبات للحين</td></tr>'}</tbody></table></div></body></html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // على Vercel كل الطلبات تمر على دالة وحدة، والمسار الأصلي يجي في __p
    const routed = url.searchParams.get('__p');
    if (routed != null) { url.pathname = '/' + routed.replace(/^\/+/, ''); url.searchParams.delete('__p'); }

    // لوحة التحكم
    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      return new Response(ADMIN_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'content-security-policy': ADMIN_CSP, 'x-frame-options': 'DENY', 'referrer-policy': 'same-origin', 'x-robots-tag': 'noindex' } });
    }
    // زيارات الموقع (عدّاد بسيط بدون بيانات شخصية)
    if (url.pathname === '/api/hit' && request.method === 'POST') return recordHit(request, env.BOT_KV);
    // لوحة المالك
    if (url.pathname.startsWith('/api/owner/')) {
      if (!(await isAdmin(request, env))) return new Response(JSON.stringify({ error: 'سجّل دخول' }), { status: 401, headers: { 'content-type': 'application/json; charset=utf-8' } });
      if (request.method !== 'GET' && !sameOrigin(request)) return new Response(JSON.stringify({ error: 'origin' }), { status: 403 });
      return ownerApi(request, env.BOT_KV, url);
    }
    // تعديلات المتجر (للمالك فقط)
    if (url.pathname === '/api/store' || url.pathname.startsWith('/api/store/')) {
      if (!(await isAdmin(request, env))) return new Response(JSON.stringify({ error: 'سجّل دخول' }), { status: 401, headers: { 'content-type': 'application/json; charset=utf-8' } });
      if (request.method !== 'GET' && !sameOrigin(request)) return new Response(JSON.stringify({ error: 'origin' }), { status: 403 });
      if (url.pathname === '/api/store/defaults') return new Response(JSON.stringify(siteDefaults(env.__siteFile)), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
      return handleStore(request, env.BOT_KV, url, { ids: productIds(env.__siteFile) });
    }
    // حجز الاستشارة
    if (url.pathname === '/api/slots' || url.pathname === '/api/booking') {
      const notify = bookingNotifier({ kv: env.BOT_KV, api: makeApi(env, env.__fetch || fetch), cfg: cfgFrom(env) });
      return handleBooking(request, env, url, { notify });
    }
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/media/')) return handleCms(request, env, url);

    // البوت ياخذ الخدمات والميزانيات من المحتوى اللي تعدله في اللوحة
    const catalog = url.pathname === '/webhook' && request.method === 'POST' ? catalogFromContent(await getContent(env.BOT_KV)) : undefined;
    const bot = createBot({ kv: env.BOT_KV, api: makeApi(env, env.__fetch || fetch), cfg: cfgFrom(env), log: (...a) => console.log(...a), catalog });

    if (url.pathname === '/webhook' && request.method === 'GET') {
      const ok = url.searchParams.get('hub.mode') === 'subscribe' && env.VERIFY_TOKEN && url.searchParams.get('hub.verify_token') === env.VERIFY_TOKEN;
      return ok ? new Response(url.searchParams.get('hub.challenge') || '', { status: 200 }) : new Response('forbidden', { status: 403 });
    }

    if (url.pathname === '/webhook' && request.method === 'POST') {
      const raw = await request.text();
      if (!(await validSignature(env, raw, request.headers.get('x-hub-signature-256')))) return new Response('bad signature', { status: 401 });
      let body; try { body = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }
      const work = bot.handle(body);
      if (ctx && ctx.waitUntil) ctx.waitUntil(work); else await work;
      return new Response('ok', { status: 200 });
    }

    if (url.pathname === '/leads') {
      const byKey = env.LEADS_KEY && url.searchParams.get('key') === env.LEADS_KEY;
      if (!byKey && !(await isAdmin(request, env))) return new Response('forbidden', { status: 403 });
      const leads = await bot.recentLeads(100);
      return url.searchParams.get('format') === 'json' ? json(leads)
        : new Response(leadsPage(leads), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    }

    return new Response('not found', { status: 404 });
  },
};
