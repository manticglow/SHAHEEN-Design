// أدوات مشتركة لأنظمة الاشتراك: توكنات، كلمات مرور، تنظيف مدخلات، حد للطلبات، مواعيد
const enc = new TextEncoder();
export const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
export const ksaDay = (t = Date.now(), plus = 0) => new Date(t + 3 * 3600e3 + plus * 86400e3).toISOString().slice(0, 10);
export const ksaMin = (t = Date.now()) => { const d = new Date(t + 3 * 3600e3); return d.getUTCHours() * 60 + d.getUTCMinutes(); };
export const ksaTs = (day, min) => Date.parse(day + 'T00:00:00Z') - 3 * 3600e3 + min * 60e3; // يوم + دقيقة بتوقيت السعودية → وقت حقيقي
export const str = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
export const text = (v, n) => String(v ?? '').replace(/[\u0000-\u0009\u000b-\u001f\u007f<>]/g, ' ').trim().slice(0, n);
export const int = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));
export const money = (v, hi = 100000) => Math.max(0, Math.min(hi, Math.round((Number(v) || 0) * 100) / 100));
export const HEX = /^#[0-9a-f]{6}$/i;
export const phoneOk = (p) => /^05\d{8}$/.test(p);
export const cleanPhone = (p) => { let x = String(p || '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, ''); if (x.startsWith('966')) x = '0' + x.slice(3); if (/^5\d{8}$/.test(x)) x = '0' + x; return x; };
export const mask = (p) => (p ? String(p).slice(0, 2) + '•••••' + String(p).slice(-3) : '');
export const hhmm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
export const toMin = (s) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '')); return m ? int(m[1], 0, 23) * 60 + int(m[2], 0, 59) : null; };
export const uid = (p = '') => p + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 6);
export const safeUrl = (u) => { const s = String(u || '').trim().slice(0, 400); try { const x = new URL(s); return ['https:', 'http:', 'mailto:', 'tel:'].includes(x.protocol) ? x.href : ''; } catch { return ''; } };

export class HttpError extends Error { constructor(msg, code = 400) { super(msg); this.code = code; } }
export const fail = (msg, code = 400) => { throw new HttpError(msg, code); };

// ---------- crypto ----------
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => atob(s.replace(/-/g, '+').replace(/_/g, '/'));
export async function hmac(secret, data) {
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
}
export const sha256 = async (s) => b64u(await crypto.subtle.digest('SHA-256', enc.encode(s)));
export function same(a, b) { a = String(a); b = String(b); if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
export function randomCode(n = 20, abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') { const b = crypto.getRandomValues(new Uint8Array(n)); return [...b].map((x) => abc[x % abc.length]).join(''); }
export const randomDigits = (n) => randomCode(n, '0123456789');

// توكن موقّع: {t: المشترك, r: الدور, n: المعرف, v: نسخة, e: ينتهي}
export async function sign(secret, p, ttl, now) { const body = b64u(enc.encode(JSON.stringify({ ...p, e: now + ttl }))); return body + '.' + await hmac(secret, 'sd|' + body); }
export async function verify(secret, tok, now) {
  if (!secret || typeof tok !== 'string' || tok.length > 700) return null;
  const [p, sig] = tok.split('.'); if (!p || !sig) return null;
  if (!same(await hmac(secret, 'sd|' + p), sig)) return null;
  try { const o = JSON.parse(unb64u(p)); return o.e > now ? o : null; } catch { return null; }
}

// كلمة المرور: PBKDF2 مع ملح لكل مشترك
export async function hashPw(pw, salt = randomCode(16)) {
  const k = await crypto.subtle.importKey('raw', enc.encode(String(pw)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000 }, k, 256);
  return { salt, hash: b64u(bits) };
}
export async function checkPw(pw, rec) { if (!rec || !rec.salt) return false; const h = await hashPw(pw, rec.salt); return same(h.hash, rec.hash); }

// حد للمحاولات: يرجع false لو تعدّى
export async function limited(kv, key, max, windowMs, now) {
  const k = `rl:sd:${key}:${Math.floor(now / windowMs)}`; const n = Number((await kv.get(k)) || 0);
  if (n >= max) return true; await kv.put(k, String(n + 1), { expirationTtl: Math.ceil(windowMs / 1000) + 60 }); return false;
}
export async function peekLimit(kv, key, max, windowMs, now) { return Number((await kv.get(`rl:sd:${key}:${Math.floor(now / windowMs)}`)) || 0) >= max; }

// ---------- مواعيد ----------
// أوقات اليوم المتاحة: من الافتتاح للإغلاق بخطوة، بدون اللي تتعارض مع حجوزات المختص، وبدون الماضي
export function freeSlots({ day, open, close, step, dur, busy, now, offDays = [] }) {
  const wd = new Date(day + 'T12:00:00Z').getUTCDay();
  if (offDays.includes(wd)) return [];
  const out = [], today = ksaDay(now), nowM = ksaMin(now);
  for (let m = open; m + dur <= close; m += step) {
    if (day === today && m <= nowM + 15) continue;
    if (busy.some(([a, b]) => m < b && a < m + dur)) continue;
    out.push(hhmm(m));
  }
  return out;
}
export const nextDays = (now, n) => Array.from({ length: n }, (_, i) => ksaDay(now, i));
