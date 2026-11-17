// لوحة التحكم: الدخول، المحتوى، الصور، النسخ السابقة
import { DEFAULT_CONTENT } from './content-default.js';
import { MESSAGE_KEYS, MESSAGE_MAX } from './messages.js';
import { hashPw, checkPw } from './saas/core.js';
import { vapid, subscribe, unsubscribe, sendPush } from './push.js';

const enc = new TextEncoder();
const COOKIE = 'sd_admin';
const SESSION_DAYS = 7;
const MAX_CONTENT_BYTES = 300 * 1024;
const MAX_MEDIA_BYTES = 2 * 1024 * 1024;
const MEDIA_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif' };
const HISTORY_KEEP = 15;

// ---------- helpers ----------
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}
async function sha(s) { return new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
function same(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0; }
const json = (o, status = 200, headers = {}) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

// ---------- sessions ----------
export async function makeSession(env, now) {
  const payload = b64u(enc.encode(JSON.stringify({ exp: now + SESSION_DAYS * 86400 * 1000 })));
  return `${payload}.${await hmac(env.SESSION_SECRET, payload)}`;
}
export async function isAdmin(request, env, now = Date.now()) {
  if (!env.SESSION_SECRET) return false;
  const c = (request.headers.get('cookie') || '').split(/;\s*/).find((x) => x.startsWith(COOKIE + '='));
  if (!c) return false;
  const [payload, sig] = c.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig) return false;
  const want = await hmac(env.SESSION_SECRET, payload);
  if (!same(enc.encode(want), enc.encode(sig))) return false;
  try { return JSON.parse(new TextDecoder().decode(fromB64u(payload))).exp > now; } catch { return false; }
}
const cookie = (v, maxAge) => `${COOKIE}=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

// ---------- حسابات الموظفين ----------
// كوكي مستقل عن المالك، فكل فحوصات isAdmin تبقى للمالك بس. الموظف يشوف الطلبات ويحدّث حالتها وملاحظاتها فقط.
const STAFF_COOKIE = 'sd_staff', STAFF_HOURS = 24, STAFF_KEY = 'staff:accounts';
const staffCookie = (v, maxAge) => `${STAFF_COOKIE}=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
export const staffAccounts = async (kv) => (await kv.get(STAFF_KEY, 'json')) || [];
async function makeStaffSession(env, acc, now) {
  const payload = b64u(enc.encode(JSON.stringify({ sid: acc.id, v: acc.v, exp: now + STAFF_HOURS * 3600e3 })));
  return `${payload}.${await hmac(env.SESSION_SECRET, 'staff|' + payload)}`;
}
export async function staffSession(request, env, now = Date.now()) {
  if (!env.SESSION_SECRET || !env.BOT_KV) return null;
  const c = (request.headers.get('cookie') || '').split(/;\s*/).find((x) => x.startsWith(STAFF_COOKIE + '='));
  if (!c) return null;
  const [payload, sig] = c.slice(STAFF_COOKIE.length + 1).split('.');
  if (!payload || !sig) return null;
  const want = await hmac(env.SESSION_SECRET, 'staff|' + payload);
  if (!same(enc.encode(want), enc.encode(sig))) return null;
  let o; try { o = JSON.parse(new TextDecoder().decode(fromB64u(payload))); } catch { return null; }
  if (!(o.exp > now)) return null;
  const acc = (await staffAccounts(env.BOT_KV)).find((a) => a.id === o.sid);
  return acc && acc.active && acc.v === o.v ? { id: acc.id, name: acc.name, user: acc.user } : null;
}
const pubAcc = (a) => ({ id: a.id, name: a.name, user: a.user, active: a.active, createdAt: a.createdAt, lastLogin: a.lastLogin || null });
async function staffAdmin(kv, b, now) {
  const list = await staffAccounts(kv), act = String(b.action || '');
  const pw = String(b.password || '');
  const pwOk = () => { if (pw.length < 8 || pw.length > 100) throw new Error('كلمة المرور ٨ حروف أو أكثر'); };
  if (act === 'add') {
    const name = String(b.name || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 40), user = String(b.user || '').trim().toLowerCase();
    if (name.length < 2) throw new Error('اكتب اسم الموظف');
    if (!(/^[a-z][a-z0-9._-]{2,23}$/.test(user) || (user.length <= 60 && /^[a-z0-9._%+-]{1,40}@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(user)))) throw new Error('اسم المستخدم بالإنجليزي (٣ إلى ٢٤ حرف) أو إيميل');
    if (list.some((a) => a.user === user)) throw new Error('اسم المستخدم مستخدم');
    if (list.length >= 20) throw new Error('الحد ٢٠ موظف');
    pwOk();
    list.push({ id: 's' + now.toString(36) + Math.random().toString(36).slice(2, 6), name, user, pw: await hashPw(pw), v: 1, active: true, createdAt: new Date(now).toISOString() });
  } else {
    const a = list.find((x) => x.id === b.id); if (!a) throw new Error('الموظف مو موجود');
    if (act === 'disable') { a.active = false; a.v++; }
    else if (act === 'enable') a.active = true;
    else if (act === 'reset') { pwOk(); a.pw = await hashPw(pw); a.v++; }
    else if (act === 'delete') list.splice(list.indexOf(a), 1);
    else throw new Error('عملية غير معروفة');
  }
  await kv.put(STAFF_KEY, JSON.stringify(list));
  return list.map(pubAcc);
}

// writes must come from the admin page itself
export function sameOrigin(request) {
  const o = request.headers.get('origin');
  if (!o) return true;
  let host; try { host = new URL(o).host; } catch { return false; }
  const h = request.headers; // خلف بروكسي (Vercel) نقارن كمان بالدومين الأصلي
  return [new URL(request.url).host, h.get('x-forwarded-host'), h.get('host')].filter(Boolean).some((x) => x.split(',')[0].trim() === host);
}

// ---------- content ----------
export async function getContent(kv) {
  return (await kv.get('content:current', 'json')) || DEFAULT_CONTENT;
}

export function catalogFromContent(c) {
  const GROUPS = {};
  for (const [k, g] of Object.entries(c.groups || {})) GROUPS[k] = { label: g.label, title: g.title, desc: g.desc };
  const SERVICES = {};
  for (const k of Object.keys(GROUPS)) SERVICES[k] = [];
  for (const s of c.services || []) if (SERVICES[s.group]) SERVICES[s.group].push([s.id, s.name, s.botTitle || s.name.slice(0, 24), s.botDesc || '']);
  const TIMELINES = (c.settings?.timelines || []).slice(0, 3).map((t, i) => [`tl${i + 1}`, t]);
  const BUDGETS = (c.settings?.budgets || []).slice(0, 10).map((t, i) => [`b${i + 1}`, t]);
  return { GROUPS, SERVICES, TIMELINES, BUDGETS };
}

// ---------- validation ----------
const len = (s) => [...String(s ?? '')].length;
export function validate(c) {
  const E = [];
  const str = (v, path, max, req = false) => {
    if (v == null || v === '') { if (req) E.push(`${path}: مطلوب`); return; }
    if (typeof v !== 'string') return E.push(`${path}: لازم يكون نص`);
    if (len(v) > max) E.push(`${path}: أطول من ${max} حرف (${len(v)})`);
  };
  const url = (v, path) => {
    if (!v) return;
    if (typeof v !== 'string' || !(/^https:\/\/[^\s"'<>]+$/i.test(v))) E.push(`${path}: لازم رابط يبدأ بـ https://`);
  };
  const img = (v, path) => {
    if (!v) return;
    if (typeof v !== 'string' || !(/^(images\/[\w./-]+|\/media\/[\w.-]+|https:\/\/[^\s"'<>]+)$/i.test(v)) || v.includes('..')) E.push(`${path}: رابط صورة غير صالح`);
  };
  const color = (v, path, allowNone) => { if (!(allowNone && v === 'none') && !/^#[0-9a-f]{6}$/i.test(String(v || ''))) E.push(`${path}: لون غير صالح (مثال #B8935A)`); };
  const list = (v, path, max) => { if (!Array.isArray(v)) { E.push(`${path}: لازم قائمة`); return []; } if (v.length > max) E.push(`${path}: أكثر من ${max} عنصر`); return v; };
  const id = (v, path) => { if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(String(v || ''))) E.push(`${path}: المعرّف لازم حروف إنجليزية صغيرة وأرقام وشرطة فقط`); };
  const digits = (v, path) => { if (v && !/^\d{8,15}$/.test(v)) E.push(`${path}: رقم بالصيغة الدولية بدون + (مثال 9665xxxxxxxx)`); };

  if (!c || typeof c !== 'object') return ['المحتوى غير صالح'];
  str(c.hero?.line1, 'الواجهة · السطر الأول', 40, true); str(c.hero?.line2, 'الواجهة · السطر الثاني', 40, true); str(c.hero?.lead, 'الواجهة · الوصف', 220, true);
  str(c.about?.heading, 'عنّي · العنوان', 60, true); str(c.about?.lead, 'عنّي · المقدمة', 400); img(c.about?.photo, 'عنّي · الصورة'); str(c.about?.signature, 'عنّي · التوقيع', 30);
  list(c.about?.paragraphs ?? [], 'عنّي · الفقرات', 6).forEach((p, i) => str(p, `عنّي · فقرة ${i + 1}`, 900));

  const groups = c.groups || {};
  for (const k of ['brand', 'co', 'sector']) {
    if (!groups[k]) { E.push(`الأقسام: القسم ${k} ناقص`); continue; }
    str(groups[k].label, `قسم ${k} · الاسم`, 24, true); str(groups[k].title, `قسم ${k} · عنوان البوت`, 24, true); str(groups[k].desc, `قسم ${k} · وصف البوت`, 72);
  }
  const ids = new Set(); const perGroup = {};
  list(c.services, 'الخدمات', 40).forEach((s, i) => {
    const p = `خدمة ${i + 1}${s?.name ? ' (' + s.name + ')' : ''}`;
    id(s.id, p + ' · المعرّف'); if (ids.has(s.id)) E.push(`${p}: المعرّف مكرر`); ids.add(s.id);
    if (!groups[s.group]) E.push(`${p}: القسم غير موجود`);
    perGroup[s.group] = (perGroup[s.group] || 0) + 1;
    str(s.name, p + ' · الاسم', 60, true); str(s.en, p + ' · الاسم بالإنجليزي', 40); str(s.short, p + ' · الوصف المختصر', 90);
    str(s.body, p + ' · الشرح', 700); str(s.time, p + ' · المدة', 80); str(s.formLabel, p + ' · اسمه في نموذج الطلب', 40, true);
    str(s.botTitle, p + ' · عنوان البوت', 24, true); str(s.botDesc, p + ' · وصف البوت', 72);
    list(s.gets || [], p + ' · تستلم', 10).forEach((g, j) => str(g, `${p} · تستلم ${j + 1}`, 120));
  });
  for (const [g, n] of Object.entries(perGroup)) if (n > 9) E.push(`القسم ${groups[g]?.label || g}: أقصى عدد ٩ خدمات (حد قائمة واتساب)`);

  const wids = new Set();
  list(c.works, 'الأعمال', 30).forEach((w, i) => {
    const p = `عمل ${i + 1}${w?.name ? ' (' + w.name + ')' : ''}`;
    id(w.id, p + ' · المعرّف'); if (wids.has(w.id)) E.push(`${p}: المعرّف مكرر`); wids.add(w.id);
    str(w.name, p + ' · الاسم', 40, true); str(w.kind, p + ' · النشاط', 60); str(w.did, p + ' · وش سوينا', 120);
    url(w.site, p + ' · الرابط'); img(w.logo, p + ' · الشعار'); color(w.bg, p + ' · لون البطاقة'); color(w.disc, p + ' · لون الدائرة', true);
  });
  list(c.testimonials ?? [], 'آراء العملاء', 30).forEach((t, i) => { const p = `رأي ${i + 1}`; str(t.name, p + ' · الاسم', 60, true); str(t.role, p + ' · الصفة', 80); str(t.text, p + ' · النص', 600, true); });
  list(c.faq ?? [], 'الأسئلة الشائعة', 30).forEach((f, i) => { const p = `سؤال ${i + 1}`; str(f.q, p + ' · السؤال', 140, true); str(f.a, p + ' · الجواب', 900, true); });

  const st = c.settings || {};
  digits(st.phone, 'الإعدادات · رقم الواتساب'); if (!st.phone) E.push('الإعدادات · رقم الواتساب: مطلوب');
  digits(st.orderPhone, 'الإعدادات · رقم البوت');
  if (st.email && !/^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(st.email)) E.push('الإعدادات · الإيميل غير صالح');
  str(st.license, 'الإعدادات · رقم الوثيقة', 40); str(st.hours, 'الإعدادات · أوقات الرد', 60); str(st.city, 'الإعدادات · المدينة', 60);
  str(st.bank?.name, 'البنك · الاسم', 60); str(st.bank?.holder, 'البنك · المستفيد', 80); str(st.bank?.account, 'البنك · الحساب', 34);
  if (st.bank?.iban && !/^SA\d{22}$/i.test(String(st.bank.iban).replace(/\s/g, ''))) E.push('البنك · الآيبان لازم يبدأ بـ SA وبعده ٢٢ رقم');
  list(st.social ?? [], 'السوشال', 12).forEach((s, i) => { url(s.url, `السوشال · ${s.label || i + 1}`); str(s.label, `السوشال ${i + 1} · الاسم`, 24); });
  const tl = list(st.timelines ?? [], 'المواعيد', 3); if (!tl.length) E.push('المواعيد: لازم خيار واحد على الأقل'); tl.forEach((t, i) => str(t, `موعد ${i + 1}`, 20, true));
  list(st.budgets ?? [], 'الميزانيات', 10).forEach((t, i) => str(t, `ميزانية ${i + 1}`, 24, true));
  const ML = { welcome: 'الترحيب', welcomeAgain: 'الترحيب بعميل راجع', received: 'استلام الطلب', done: 'بعد تأكيد الطلب', human: 'التحويل لك', online: 'وقت الدوام', offline: 'خارج الدوام' };
  if (c.messages != null && typeof c.messages !== 'object') E.push('رسائل الواتساب: صيغة غير صالحة');
  for (const k of MESSAGE_KEYS) str(c.messages?.[k], `رسائل الواتساب · ${ML[k] || k}`, MESSAGE_MAX);
  const T = st.templates || {};
  for (const [k, l] of [['bookingConfirm', 'قالب تأكيد الموعد'], ['bookingReminder', 'قالب تذكير الموعد'], ['invoice', 'قالب الفاتورة']]) {
    if (T[k] && !/^[a-z0-9_]{1,100}$/.test(T[k])) E.push(`${l}: اسم القالب بحروف إنجليزية صغيرة وأرقام و _ فقط`);
  }
  if (T.lang && !/^[a-z]{2}(_[A-Z]{2})?$/.test(T.lang)) E.push('لغة القوالب: مثل ar أو en_US');
  return E;
}

// ---------- routes ----------
export async function handleCms(request, env, url, now = Date.now()) {
  const kv = env.BOT_KV;
  const p = url.pathname;
  const h = request.headers;
  const ip = h.get('cf-connecting-ip') || h.get('x-real-ip') || (h.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';

  // public content for the website
  if (p === '/api/content' && request.method === 'GET') {
    const c = await getContent(kv);
    return json(c, 200, { 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=0, s-maxage=15, stale-while-revalidate=60' });
  }
  if (p === '/api/content' && request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET', 'access-control-max-age': '86400' } });
  }

  // public media
  if (p.startsWith('/media/') && request.method === 'GET') {
    const id = p.slice(7);
    if (!/^[\w.-]{1,80}$/.test(id)) return new Response('not found', { status: 404 });
    const { value, metadata } = await kv.getWithMetadata(`media:${id}`, 'arrayBuffer');
    if (!value) return new Response('not found', { status: 404 });
    return new Response(value, { headers: {
      'content-type': metadata?.type || 'application/octet-stream',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      'access-control-allow-origin': '*',
    } });
  }

  // login
  if (p === '/api/login' && request.method === 'POST') {
    if (!sameOrigin(request)) return json({ error: 'origin' }, 403);
    if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return json({ error: 'كلمة سر اللوحة ما انضبطت في الخادم' }, 500);
    const failKey = `login:fail:${ip}`;
    const fails = Number((await kv.get(failKey)) || 0);
    if (fails >= 5) return json({ error: 'محاولات كثيرة، جرب بعد ١٥ دقيقة' }, 429);
    let body = {}; try { body = await request.json(); } catch {}
    const user = String(body.user || '').trim().toLowerCase();
    if (user) { // دخول موظف
      const uKey = `login:failu:${user.slice(0, 60)}`, uf = Number((await kv.get(uKey)) || 0);
      if (uf >= 10) return json({ error: 'الحساب موقوف مؤقتًا من كثر المحاولات، جرب بعد ١٥ دقيقة' }, 429);
      const list = await staffAccounts(kv), acc = list.find((a) => a.user === user);
      if (!acc || !acc.active || !(await checkPw(String(body.password || '').slice(0, 200), acc.pw))) {
        await kv.put(failKey, String(fails + 1), { expirationTtl: 900 }); await kv.put(uKey, String(uf + 1), { expirationTtl: 900 });
        return json({ error: acc && !acc.active ? 'الحساب موقوف، كلم المدير' : 'اسم المستخدم أو كلمة المرور غلط' }, 401);
      }
      acc.lastLogin = new Date(now).toISOString(); await kv.put('staff:accounts', JSON.stringify(list));
      return json({ ok: true, role: 'staff' }, 200, { 'set-cookie': staffCookie(await makeStaffSession(env, acc, now), STAFF_HOURS * 3600) });
    }
    const ok = same(await sha(String(body.password || '').trim()), await sha(String(env.ADMIN_PASSWORD).trim()));
    if (!ok) { await kv.put(failKey, String(fails + 1), { expirationTtl: 900 }); return json({ error: 'كلمة السر غلط' }, 401); }
    return json({ ok: true, role: 'owner' }, 200, { 'set-cookie': cookie(await makeSession(env, now), SESSION_DAYS * 86400) });
  }
  if (p === '/api/logout' && request.method === 'POST') return json({ ok: true }, 200, { 'set-cookie': url.searchParams.get('c') === 'staff' ? staffCookie('', 0) : cookie('', 0) }); // اللوحة تنادي الاثنين

  // everything below needs the owner
  const admin = await isAdmin(request, env, now);
  if (p === '/api/me') {
    if (admin) return json({ ok: true, role: 'owner', siteUrl: env.SITE_URL || url.origin });
    const st = await staffSession(request, env, now);
    return st ? json({ ok: true, role: 'staff', name: st.name, siteUrl: env.SITE_URL || url.origin }) : json({ ok: false }, 401);
  }
  // الموظف يغيّر كلمة مروره بنفسه
  if (p === '/api/me/password' && request.method === 'POST') {
    if (!sameOrigin(request)) return json({ error: 'origin' }, 403);
    const st = await staffSession(request, env, now); if (!st) return json({ error: 'سجّل دخول' }, 401);
    const fk = `login:failu:pw:${st.id}`, ff = Number((await kv.get(fk)) || 0); if (ff >= 8) return json({ error: 'محاولات كثيرة، جرّب بعد ربع ساعة' }, 429);
    let b = {}; try { b = JSON.parse((await request.text()).slice(0, 2000)); } catch {}
    const list = await staffAccounts(kv), acc = list.find((a) => a.id === st.id);
    if (!acc || !(await checkPw(String(b.old || '').slice(0, 200), acc.pw))) { await kv.put(fk, String(ff + 1), { expirationTtl: 900 }); return json({ error: 'كلمة المرور الحالية غلط' }, 403); }
    const pw = String(b.password || ''); if (pw.length < 8 || pw.length > 100) return json({ error: 'كلمة المرور الجديدة ٨ حروف أو أكثر' }, 400);
    acc.pw = await hashPw(pw); acc.v++; await kv.put(STAFF_KEY, JSON.stringify(list));
    return json({ ok: true }, 200, { 'set-cookie': staffCookie(await makeStaffSession(env, acc, now), STAFF_HOURS * 3600) });
  }
  // تنبيهات الجوال: للمالك والموظفين
  if (p.startsWith('/api/push/')) {
    const who = admin ? { role: 'owner' } : await staffSession(request, env, now).then((x) => x && { role: 'staff', id: x.id, name: x.name });
    if (!who) return json({ error: 'سجّل دخول' }, 401);
    if (request.method !== 'GET' && !sameOrigin(request)) return json({ error: 'origin' }, 403);
    if (p === '/api/push/key' && request.method === 'GET') return json({ key: (await vapid(kv)).publicKey });
    let b = {}; try { b = JSON.parse((await request.text()).slice(0, 4000)); } catch {}
    try {
      if (p === '/api/push/subscribe' && request.method === 'POST') { await subscribe(kv, who, b.sub, now); return json({ ok: true }); }
      if (p === '/api/push/unsubscribe' && request.method === 'POST') { await unsubscribe(kv, String(b.endpoint || '')); return json({ ok: true }); }
      if (p === '/api/push/test' && request.method === 'POST') { const r = await sendPush(kv, { title: 'التنبيهات شغالة ✓', body: 'بيوصلك إشعار هنا مع كل طلب أو حجز جديد', url: '/admin', tag: 'test' }, { only: String(b.endpoint || '') }); return json({ ok: true, ...r }); }
    } catch (e) { return json({ error: e.message }, 400); }
    return json({ error: 'not found' }, 404);
  }
  if (!admin) return json({ error: 'سجّل دخول' }, 401);
  if (request.method !== 'GET' && !sameOrigin(request)) return json({ error: 'origin' }, 403);

  // إدارة حسابات الموظفين (المالك فقط)
  if (p === '/api/staff' && request.method === 'GET') return json((await staffAccounts(kv)).map(pubAcc));
  if (p === '/api/staff' && request.method === 'POST') {
    let b = {}; try { b = await request.json(); } catch {}
    try { return json(await staffAdmin(kv, b, now)); } catch (e) { return json({ error: e.message }, 400); }
  }

  if (p === '/api/content' && request.method === 'PUT') {
    const raw = await request.text();
    if (raw.length > MAX_CONTENT_BYTES) return json({ error: 'المحتوى أكبر من المسموح' }, 413);
    let c; try { c = JSON.parse(raw); } catch { return json({ error: 'صيغة غير صالحة' }, 400); }
    const errors = validate(c);
    if (errors.length) return json({ error: 'فيه حقول تحتاج تعديل', errors }, 422);
    const prev = await kv.get('content:current');
    c.version = (Number(JSON.parse(prev || '{}').version) || 0) + 1;
    c.updatedAt = new Date(now).toISOString();
    if (prev) {
      await kv.put(`content:hist:${now}`, prev, { expirationTtl: 60 * 60 * 24 * 120 });
      const idx = (await kv.get('content:hist:index', 'json')) || [];
      idx.unshift({ ts: now, version: JSON.parse(prev).version || 0, at: JSON.parse(prev).updatedAt || null });
      await kv.put('content:hist:index', JSON.stringify(idx.slice(0, HISTORY_KEEP)));
    }
    await kv.put('content:current', JSON.stringify(c));
    return json({ ok: true, version: c.version, updatedAt: c.updatedAt });
  }

  if (p === '/api/history' && request.method === 'GET') return json((await kv.get('content:hist:index', 'json')) || []);
  if (p === '/api/history/restore' && request.method === 'POST') {
    let body = {}; try { body = await request.json(); } catch {}
    const old = await kv.get(`content:hist:${Number(body.ts)}`);
    if (!old) return json({ error: 'النسخة غير موجودة' }, 404);
    return json(JSON.parse(old)); // اللوحة تعرضها، وتحفظها أنت إذا عجبتك
  }

  if (p === '/api/media' && request.method === 'POST') {
    const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!MEDIA_TYPES[type]) return json({ error: 'نوع الملف غير مدعوم (PNG أو JPG أو WEBP أو SVG)' }, 415);
    const buf = await request.arrayBuffer();
    if (buf.byteLength > MAX_MEDIA_BYTES) return json({ error: 'الصورة أكبر من ٢ ميقا' }, 413);
    if (!buf.byteLength) return json({ error: 'الملف فاضي' }, 400);
    const hash = b64u(await crypto.subtle.digest('SHA-256', buf)).slice(0, 16);
    const id = `${hash}.${MEDIA_TYPES[type]}`;
    if (env.MEDIA) { // Supabase Storage (نسخة Vercel)
      try { return json({ ok: true, id, url: await env.MEDIA.put(id, buf, type) }); }
      catch (e) { console.log('media upload failed', e); return json({ error: 'ما قدرت أحفظ الصورة في التخزين' }, 502); }
    }
    await kv.put(`media:${id}`, buf, { metadata: { type, size: buf.byteLength, at: now } });
    return json({ ok: true, id, url: `/media/${id}` }); // مسار نسبي: الموقع يكمله برابط الخادم
  }

  return json({ error: 'not found' }, 404);
}
