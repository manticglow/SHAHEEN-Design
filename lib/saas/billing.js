// الحسابات والاشتراك الذاتي والدفع والفواتير لمنصة شاهين
//   الحساب: رقم الجوال + كلمة مرور، وجلسة بكوكي HttpOnly اسمها sd_own (٣٠ يوم) تقدر تطلع منها من جهاز واحد أو من كل الأجهزة
//   الاشتراك: العميل يختار النظام والمدة ← يدفع بميسّر ← يرجع لـ /app?paid=<co> ← الخادم يتأكد من ميسّر نفسها ← الحساب يجهز والفاتورة تطلع
//   أي طريق يوصل للدفع (رجوع العميل، إشعار ميسّر، الفحص اليومي) يمر على applyPaid، وهي ما تعيد شي سوّته مرتين
//   الفواتير: رقم متسلسل بدون فراغات SD-2026-000001، ما تتعدل أبدًا، وتنعرض لصاحبها بس
import { str, int, cleanPhone, phoneOk, fail, sign, verify, hashPw, checkPw, randomCode, sha256, limited, peekLimit, same, mask, kvAdd, ksaDay } from './core.js';
import { PLANS, quote, addMonths } from './plans.js';
import KINDS from './kinds/index.js';

const D = 86400e3, H = 3600e3, GRACE = 3 * D;
const TKEY = (s) => 'sd:tenant:' + s, SKEY = (s) => 'sd:state:' + s, INDEX = 'sd:tenants';
const AKEY = (p) => 'sd:acct:' + p, COKEY = (c) => 'sd:co:' + c;
export const SLUG = /^[a-z][a-z0-9-]{2,30}$/;
export const RESERVED = new Set(['admin', 'api', 'app', 'demo', 'demos', 'www', 'shaheen', 'test', 'carwash', 'static', 'vendor', 'invitations', 'pay', 'billing']);
export const SELLER = { name: 'شاهين ديزاين', holder: 'عبدالرحمن فهد يوسف شاهين', doc: 'FL-609963534', city: 'جدة', phone: '0582409776', site: 'shaheendesign.sa' };

// ---------- حالة الاشتراك ----------
// فعّال ← سماح ٣ أيام (كل شي يشتغل ويطلع للمالك تنبيه) ← منتهي (المالك يجدد بس، والعملاء يشوفون "متوقفة مؤقتًا"). البيانات ما تنحذف
export function phase(t, now) {
  if (!t) return 'none';
  if (t.demo) return 'active';
  if (t.status === 'suspended') return 'suspended';
  if (t.status === 'invited') return 'invited';
  const u = Date.parse(t.until) || 0;
  if (now <= u) return 'active';
  if (!t.test && now <= u + GRACE) return 'grace';
  return 'expired';
}
export const graceEnd = (t) => new Date((Date.parse(t.until) || 0) + GRACE).toISOString();

// ---------- كوكيز ----------
export function getCookie(request, name) {
  const c = request.headers.get('cookie') || '';
  for (const part of c.split(/;\s*/)) if (part.startsWith(name + '=')) { try { return decodeURIComponent(part.slice(name.length + 1)); } catch { return ''; } }
  return '';
}
const cookie = (name, val, maxAge) => `${name}=${encodeURIComponent(val)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
// طلب بكوكي لازم يجي من نفس الموقع ومعه Origin (حماية من التزوير بين المواقع)
export function strictOrigin(request) {
  const o = request.headers.get('origin'); if (!o) return false;
  let host; try { host = new URL(o).host; } catch { return false; }
  const h = request.headers;
  return [new URL(request.url).host, h.get('x-forwarded-host'), h.get('host')].filter(Boolean).some((x) => x.split(',')[0].trim() === host);
}
export const ipOf = (r) => (r.headers.get('x-real-ip') || r.headers.get('x-forwarded-for') || 'x').split(',')[0].trim().slice(0, 60);

// ---------- الجلسة ----------
// k = 'p' حساب برقم جوال (الجديد) · k = 's' حساب قديم باسم الحساب (slug)
async function ownCookie(env, k, p, v, now) { return cookie('sd_own', await sign(env.SESSION_SECRET, { r: 'own', k, p, v }, 30 * D, now), 30 * 86400); }
export async function ownSession(request, env, now) {
  const kv = env.BOT_KV, tok = await verify(env.SESSION_SECRET || '', getCookie(request, 'sd_own'), now);
  if (!tok || tok.r !== 'own') return null;
  if (tok.k === 'p') { const a = await kv.get(AKEY(tok.p), 'json'); return a && a.sv === tok.v ? { k: 'p', phone: tok.p, acct: a, slugs: a.slugs || [] } : null; }
  if (tok.k === 's') { const t = SLUG.test(tok.p || '') ? await kv.get(TKEY(tok.p), 'json') : null; return t && !t.ownerPhone && t.pw && t.pwv === tok.v ? { k: 's', slug: tok.p, slugs: [tok.p] } : null; }
  return null;
}
export const ownsTenant = (sess, t) => !!(sess && t && sess.slugs.includes(t.slug) && (sess.k === 's' ? sess.slug === t.slug : t.ownerPhone === sess.phone));

// ---------- ميسّر ----------
export const payMode = (env) => (env.MOYASAR_SECRET_KEY && env.MOYASAR_PUBLISHABLE_KEY ? (String(env.MOYASAR_SECRET_KEY).startsWith('sk_test_') ? 'sandbox' : 'live') : 'test');
async function fetchPayment(env, id) {
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(String(id || ''))) return null;
  const r = await (env.__fetch || fetch)('https://api.moyasar.com/v1/payments/' + id, { headers: { authorization: 'Basic ' + btoa(env.MOYASAR_SECRET_KEY + ':') } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('moyasar ' + r.status);
  return r.json();
}
const methodOf = (p) => (p.source && p.source.type === 'applepay' ? 'Apple Pay' : p.source && p.source.company === 'mada' ? 'مدى' : p.source && p.source.type === 'stcpay' ? 'STC Pay' : p.source && p.source.type === 'manual' ? (p.source.label || 'تحويل بنكي') : 'بطاقة');
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16); return (c === 'x' ? r : (r & 3) | 8).toString(16); }));

// إضافة لقائمة مشتركة: نعيد القراءة بعد الكتابة ونتأكد إن العنصر انحفظ (الكتابة المتزامنة ممكن تمسح بعض)
async function listAdd(kv, key, item, same, cap) {
  for (let i = 0; i < 4; i++) {
    const list = (await kv.get(key, 'json')) || [];
    if (list.some(same)) return;
    await kv.put(key, JSON.stringify([item, ...list].slice(0, cap)));
    if (((await kv.get(key, 'json')) || []).some(same)) return;
  }
}

// ---------- الفواتير ----------
// الرقم: نحجز أول رقم فاضي بكتابة "مرة وحدة" — الحجز والفاتورة نفس الخطوة، فما فيه فراغات ولا تكرار
export async function issueInvoice(env, payKey, data, now) {
  const kv = env.BOT_KV;
  const had = await kv.get('sd:inv:pay:' + payKey); if (had) return await kv.get('sd:inv:' + had, 'json');
  const year = ksaDay(now).slice(0, 4), series = data.test ? 'TEST' : 'SD', seqKey = 'sd:invseq:' + series + year;
  const vatNo = String(env.VAT_NUMBER || '').trim();
  let n = Number(await kv.get(seqKey)) || 0, inv = null;
  // لو انكتبت الفاتورة قبل وانقطع قبل الربط، نلقاها بدل ما نصدر رقم ثاني
  for (let k = n + 3; k > Math.max(0, n - 30); k--) { const no = `${series}-${year}-${String(k).padStart(6, '0')}`; const x = await kv.get('sd:inv:' + no, 'json'); if (x && x.payKey === payKey) { inv = x; break; } }
  for (let i = 0; !inv && i < 1000; i++) {
    n++;
    const no = `${series}-${year}-${String(n).padStart(6, '0')}`;
    const rec = { no, payKey, issuedAt: new Date(now).toISOString(), title: vatNo ? 'فاتورة ضريبية مبسطة' : 'فاتورة', vatNo: vatNo || null, seller: SELLER, ...data };
    if (await kvAdd(kv, 'sd:inv:' + no, rec)) { inv = rec; break; }
  }
  if (!inv) throw new Error('invoice numbering failed');
  if (Number(inv.no.slice(-6)) > (Number(await kv.get(seqKey)) || 0)) await kv.put(seqKey, String(Number(inv.no.slice(-6))));
  await kvAdd(kv, 'sd:inv:pay:' + payKey, inv.no);
  await listAdd(kv, 'sd:tinv:' + data.slug, inv.no, (x) => x === inv.no, 300);
  if (!data.test) await listAdd(kv, 'sd:pays:' + ksaDay(Date.parse(inv.issuedAt)).slice(0, 7), { no: inv.no, slug: data.slug, kind: data.kind, total: data.total, method: data.method, ref: data.ref || '', at: inv.issuedAt }, (x) => x.no === inv.no, 2000);
  return inv;
}
const pubInvoice = (inv) => inv && ({ no: inv.no, issuedAt: inv.issuedAt, title: inv.title, total: inv.total, method: inv.method, test: !!inv.test, status: inv.status || 'paid' });

// ---------- الدفع: نقطة وحدة لكل الطرق ----------
export async function applyPaid(env, co, p, now) {
  const kv = env.BOT_KV;
  const ok = p && p.status === 'paid' && p.currency === 'SAR' && Number(p.amount) === co.total && p.metadata && p.metadata.co === co.id && (co.attempts || []).includes(p.id);
  if (!ok) return { ok: false, why: 'mismatch' };
  // قفل: لو وصل الإشعار ورجوع العميل بنفس اللحظة، واحد بس يشتغل. القفل القديم (أكثر من دقيقة) ينسحب
  const LK = 'sd:apply:' + p.id;
  if (!(await kvAdd(kv, LK, JSON.stringify({ at: now })))) {
    const lk = (await kv.get(LK, 'json')) || {};
    if (lk.done) return { ok: true, co: await kv.get(COKEY(co.id), 'json') };
    if (now - (lk.at || 0) < 60e3) return { ok: false, busy: true };
    await kv.put(LK, JSON.stringify({ at: now }));
  }
  co = (await kv.get(COKEY(co.id), 'json')) || co;
  let slug = co.renew || co.slugFinal, t = null;
  if (co.signup && !co.slugFinal) {
    // ننشئ المشترك "مرة وحدة". لو الرابط انحجز لأحد ثاني أثناء الدفع، نضيف رقم في آخره ونخبره
    const S = co.signup, base = S.slug;
    // الرقم انسجّل لأحد ثاني أثناء الدفع: ما نربطه بحسابه أبدًا (حماية من سرقة الحساب)، ونرجّع المبلغ يدويًا
    const pre = await kv.get(AKEY(S.phone), 'json');
    if (pre && !S.existing && pre.coId !== co.id) {
      Object.assign(co, { status: 'conflict', payId: p.id, paidAt: new Date(now).toISOString() }); await kv.put(COKEY(co.id), JSON.stringify(co));
      await kv.put(LK, JSON.stringify({ at: now, done: true })); console.log('signup conflict, refund needed', co.id, p.id);
      return { ok: true, co };
    }
    for (const suf of ['', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-' + randomCode(3, 'abcdefghjkmnpqrstuvwxyz23456789')]) {
      const cand = base.slice(0, 31 - suf.length) + suf;
      const rec = { slug: cand, name: S.name, kind: co.kind, phone: S.phone, ownerPhone: S.phone, status: 'active', until: new Date(co.test ? now + D : addMonths(now, co.months)).toISOString(), createdAt: new Date(now).toISOString(), pwv: 1, plan: { period: co.period }, pays: [p.id], coId: co.id, test: !!co.test, ref: co.ref || '', note: co.test ? 'تجربة دفع (وضع تجريبي)' : 'اشتراك ذاتي' };
      if (await kvAdd(kv, TKEY(cand), JSON.stringify(rec))) { slug = cand; t = rec; break; }
      const ex = await kv.get(TKEY(cand), 'json'); if (ex && ex.coId === co.id) { slug = cand; t = ex; break; }
    }
    if (!t) throw new Error('slug allocation failed');
    co.slugFinal = slug; co.renamed = slug !== base;
    await kv.put(COKEY(co.id), JSON.stringify(co));
    const { seedState } = await import('./platform.js');
    if (!(await kv.get(SKEY(slug)))) await kv.put(SKEY(slug), JSON.stringify(seedState(t, now)));
    await listAdd(kv, INDEX, slug, (x) => x === slug, 5000);
    if (!(await kvAdd(kv, AKEY(S.phone), JSON.stringify({ phone: S.phone, name: S.name, pw: S.pw, sv: 1, slugs: [slug], coId: co.id, createdAt: new Date(now).toISOString() })))) {
      const a = await kv.get(AKEY(S.phone), 'json');
      if (a && (S.existing || a.coId === co.id) && !(a.slugs || []).includes(slug)) { a.slugs = [...(a.slugs || []), slug]; await kv.put(AKEY(S.phone), JSON.stringify(a)); }
    }
    await kv.put('sd:hold:' + base, '', { expirationTtl: 60 });
  } else {
    t = await kv.get(TKEY(slug), 'json'); if (!t) throw new Error('tenant missing');
    if (!(t.pays || []).includes(p.id)) {
      const from = Math.max(now, Date.parse(t.until) || now);
      t.until = new Date(co.test ? from + D : addMonths(from, co.months)).toISOString();
      t.pays = [...(t.pays || []), p.id].slice(-60); t.plan = { period: co.period };
      if (t.status === 'invited' && t.pw) t.status = 'active';
      await kv.put(TKEY(slug), JSON.stringify(t));
    }
  }
  const inv = await issueInvoice(env, p.id, { slug, kind: co.kind, test: !!co.test, buyer: { name: t.name, phone: t.ownerPhone || t.phone || '' }, lines: co.lines, total: co.total, vat: co.vat, net: co.total - co.vat, method: methodOf(p), payRef: p.id, ref: co.ref || '', period: co.period, until: t.until }, now);
  Object.assign(co, { status: 'paid', payId: p.id, invoice: inv.no, paidAt: co.paidAt || new Date(now).toISOString(), until: t.until, slugFinal: slug });
  await kv.put(COKEY(co.id), JSON.stringify(co));
  await kv.put(LK, JSON.stringify({ at: now, done: true }));
  return { ok: true, co };
}

// يتأكد من كل محاولات الدفع لهذا الاشتراك عند ميسّر (أو الدفع التجريبي)
async function settle(env, co, now, sim) {
  if (co.status === 'paid') return { status: 'paid', co };
  if (co.status === 'conflict') return { status: 'conflict', co };
  if (sim) {
    if (co.mode !== 'test') fail('الدفع التجريبي مو متاح', 403);
    const id = co.attempts[co.attempts.length - 1];
    const r = await applyPaid(env, co, { id, status: 'paid', currency: 'SAR', amount: co.total, metadata: { co: co.id, kind: 'sub' }, source: { type: 'creditcard', company: 'mada' } }, now);
    return r.ok ? { status: r.co.status === 'conflict' ? 'conflict' : 'paid', co: r.co } : { status: r.busy ? 'pending' : 'failed', co };
  }
  if (co.mode === 'test') return { status: 'open', co };
  let last = null;
  for (const id of [...co.attempts].reverse()) {
    const p = await fetchPayment(env, id); if (!p) continue;
    if (!last) last = p;
    if (p.status === 'paid') { const r = await applyPaid(env, co, p, now); if (r.ok) return { status: r.co.status === 'conflict' ? 'conflict' : 'paid', co: r.co }; if (r.busy) return { status: 'pending', co }; }
  }
  if (!last) return { status: co.attempts.length ? 'pending' : 'open', co };
  if (last.status === 'failed') return { status: 'failed', co, message: str(last.source && last.source.message, 120) };
  return { status: 'pending', co };
}
const coView = (co) => ({ id: co.id, status: co.status, kind: co.kind, title: KINDS[co.kind] ? KINDS[co.kind].title : '', period: co.period, total: co.total, lines: co.lines, mode: co.mode, slug: co.slugFinal || co.renew || (co.signup && co.signup.slug), renamed: !!co.renamed, until: co.until || null, invoice: co.invoice || null, renew: !!co.renew, name: co.signup ? co.signup.name : '' });

// إشعار ميسّر للاشتراكات (من نفس رابط الإشعارات الحالي)
export async function subWebhook(env, ev, now = Date.now()) {
  const kv = env.BOT_KV, data = ev.data || {}, coId = data.metadata && data.metadata.co;
  const co = typeof coId === 'string' && /^[A-Z0-9]{24}$/.test(coId) ? await kv.get(COKEY(coId), 'json') : null;
  if (!co || !(co.attempts || []).includes(data.id)) return { ok: true, skip: true };
  if (co.status === 'paid') return { ok: true, done: true };
  const p = await fetchPayment(env, data.id); // نرجع لميسّر نفسها، ما نثق بمحتوى الإشعار
  if (p && p.status === 'paid') { const r = await applyPaid(env, co, p, now); if (r.busy) throw new Error('busy'); }
  return { ok: true };
}

// الفحص اليومي: أي دفعة انقفلت صفحتها قبل ما ترجع
export async function sweepCheckouts(env, now = Date.now()) {
  const kv = env.BOT_KV, open = (await kv.get('sd:co:open', 'json')) || [];
  if (payMode(env) === 'test') return { checked: 0 };
  let checked = 0; const keep = [];
  for (const [id, at] of open) {
    if (now - at > 3 * D) continue;
    const co = await kv.get(COKEY(id), 'json'); if (!co || co.status === 'paid') continue;
    try { await settle(env, co, now); checked++; } catch {}
    const after = await kv.get(COKEY(id), 'json'); if (after && after.status !== 'paid') keep.push([id, at]);
  }
  await kv.put('sd:co:open', JSON.stringify(keep));
  return { checked };
}

// ---------- طلبات /api/platform/* الخاصة بالحساب والاشتراك ----------
// ترجع Response أو null (لو المسار مو لها)
export async function handleAccount(path, request, env, b, now, reply) {
  const kv = env.BOT_KV, ip = ipOf(request);
  const cookieAuthOk = () => strictOrigin(request);
  const sessOrFail = async () => { if (!cookieAuthOk()) fail('forbidden', 403); const s = await ownSession(request, env, now); if (!s) fail('سجّل دخولك', 401); return s; };
  const tenantsOf = async (sess) => { const out = []; for (const slug of sess.slugs.slice(0, 20)) { const t = await kv.get(TKEY(slug), 'json'); if (t && ownsTenant(sess, t)) out.push(t); } return out; };

  if (path === 'plans') {
    const out = {}; for (const [k, P] of Object.entries(PLANS)) { if (P.event) continue; out[k] = { m: P.m, y: P.y, title: KINDS[k] ? KINDS[k].title : k }; }
    return reply({ plans: out, mode: payMode(env), pk: payMode(env) === 'test' ? '' : String(env.MOYASAR_PUBLISHABLE_KEY), vat: !!env.VAT_NUMBER });
  }
  if (path === 'slug') {
    const slug = String(b.slug || '').toLowerCase().trim();
    if (!SLUG.test(slug) || slug.startsWith('demo-') || RESERVED.has(slug)) return reply({ ok: false, why: 'الرابط بالإنجليزي الصغير والأرقام والشرطة، من ٣ حروف' });
    if (await limited(kv, 'slugq:' + ip, 120, 600e3, now)) fail('طلبات كثيرة', 429);
    const taken = !!(await kv.get(TKEY(slug))) || !!(await kv.get('sd:hold:' + slug));
    return reply({ ok: !taken, why: taken ? 'الرابط مأخوذ' : '' });
  }

  // دخول: رقم الجوال (أو اسم الحساب للحسابات القديمة) + كلمة المرور ← كوكي HttpOnly
  if (path === 'login') {
    if (!cookieAuthOk()) fail('forbidden', 403);
    const raw = String(b.id || b.slug || '').trim().toLowerCase(), pw = String(b.password || '').slice(0, 200), id = phoneOk(cleanPhone(raw)) ? cleanPhone(raw) : raw;
    if (await peekLimit(kv, 'loginf:' + ip, 10, 900e3, now) || await peekLimit(kv, 'loginfid:' + id.slice(0, 40), 20, 900e3, now)) fail('محاولات كثيرة، جرّب بعد ربع ساعة', 429);
    const phone = id; let set = null;
    if (phoneOk(phone)) { const a = await kv.get(AKEY(phone), 'json'); if (a && await checkPw(pw, a.pw)) set = await ownCookie(env, 'p', phone, a.sv, now); }
    else if (SLUG.test(id) && !id.startsWith('demo-')) {
      const t = await kv.get(TKEY(id), 'json');
      if (t && t.ownerPhone) { const a = await kv.get(AKEY(t.ownerPhone), 'json'); if (a && await checkPw(pw, a.pw)) set = await ownCookie(env, 'p', t.ownerPhone, a.sv, now); }
      else if (t && t.pw && await checkPw(pw, t.pw)) set = await ownCookie(env, 's', id, t.pwv, now);
    }
    if (!set) { await limited(kv, 'loginf:' + ip, 10, 900e3, now); await limited(kv, 'loginfid:' + id.slice(0, 40), 20, 900e3, now); fail('الرقم أو كلمة المرور غلط', 403); }
    return reply({ ok: true }, 200, { 'set-cookie': set });
  }
  if (path === 'logout') return reply({ ok: true }, 200, { 'set-cookie': cookie('sd_own', '', 0) });
  if (path === 'logout-all') {
    const s = await sessOrFail();
    if (s.k === 'p') { s.acct.sv = (s.acct.sv || 1) + 1; await kv.put(AKEY(s.phone), JSON.stringify(s.acct)); }
    for (const t of await tenantsOf(s)) { t.pwv = (t.pwv || 0) + 1; await kv.put(TKEY(t.slug), JSON.stringify(t)); } // يطلع جلسات لوحات الإدارة القديمة بعد
    return reply({ ok: true }, 200, { 'set-cookie': cookie('sd_own', '', 0) });
  }
  if (path === 'me') {
    const s = await sessOrFail(); const ts = await tenantsOf(s);
    if (!ts.length) fail('سجّل دخولك', 401);
    const cur = ts.find((t) => t.slug === b.slug) || ts[0];
    const { loadStateFor } = await import('./platform.js');
    const st = await loadStateFor(kv, cur, now);
    const invs = []; for (const no of ((await kv.get('sd:tinv:' + cur.slug, 'json')) || []).slice(0, 24)) { const i = await kv.get('sd:inv:' + no, 'json'); if (i) invs.push(pubInvoice(i)); }
    const P = PLANS[cur.kind] || {};
    return reply({
      account: { phone: s.k === 'p' ? s.phone : cur.phone || '', name: s.k === 'p' ? s.acct.name : cur.name, kind: s.k },
      tenants: ts.map((t) => ({ slug: t.slug, name: t.name, kind: t.kind, phase: phase(t, now) })),
      tenant: { slug: cur.slug, name: cur.name, kind: cur.kind, status: cur.status, until: cur.until, phase: phase(cur, now), graceEnd: graceEnd(cur), test: !!cur.test, plan: cur.plan || null, createdAt: cur.createdAt },
      title: KINDS[cur.kind].title, brand: st.brand, stats: KINDS[cur.kind].stats ? KINDS[cur.kind].stats(st, now) : [],
      price: P.m ? { m: P.m, y: P.y } : null, invoices: invs, mode: payMode(env),
    });
  }
  if (path === 'password') {
    const s = await sessOrFail();
    const pw = String(b.password || ''); if (pw.length < 8 || pw.length > 100) fail('كلمة المرور ٨ حروف أو أكثر');
    if (await peekLimit(kv, 'pwf:' + ip, 8, 900e3, now)) fail('محاولات كثيرة، جرّب بعد ربع ساعة', 429);
    if (s.k === 'p') {
      if (!(await checkPw(String(b.old || ''), s.acct.pw))) { await limited(kv, 'pwf:' + ip, 8, 900e3, now); fail('كلمة المرور الحالية غلط', 403); }
      s.acct.pw = await hashPw(pw); s.acct.sv = (s.acct.sv || 1) + 1; await kv.put(AKEY(s.phone), JSON.stringify(s.acct));
      for (const t of await tenantsOf({ ...s, acct: s.acct })) { t.pwv = (t.pwv || 0) + 1; await kv.put(TKEY(t.slug), JSON.stringify(t)); }
      return reply({ ok: true }, 200, { 'set-cookie': await ownCookie(env, 'p', s.phone, s.acct.sv, now) });
    }
    const t = await kv.get(TKEY(s.slug), 'json');
    if (!(await checkPw(String(b.old || ''), t.pw))) { await limited(kv, 'pwf:' + ip, 8, 900e3, now); fail('كلمة المرور الحالية غلط', 403); }
    t.pw = await hashPw(pw); t.pwv = (t.pwv || 0) + 1; await kv.put(TKEY(t.slug), JSON.stringify(t));
    return reply({ ok: true }, 200, { 'set-cookie': await ownCookie(env, 's', t.slug, t.pwv, now) });
  }
  if (path === 'invoice') {
    const no = String(b.no || ''); if (!/^(SD|TEST)-\d{4}-\d{6}$/.test(no)) fail('الفاتورة مو موجودة', 404);
    const inv = await kv.get('sd:inv:' + no, 'json'); if (!inv) fail('الفاتورة مو موجودة', 404);
    const { isAdmin } = await import('../cms.js');
    let allowed = await isAdmin(request, env, now);
    if (!allowed) { const s = await ownSession(request, env, now); if (s && cookieAuthOk()) { const t = await kv.get(TKEY(inv.slug), 'json'); allowed = ownsTenant(s, t); } }
    if (!allowed) fail('سجّل دخولك عشان تشوف الفاتورة', 401);
    return reply({ invoice: inv });
  }

  // ---------- الاشتراك والدفع ----------
  if (path === 'checkout') {
    if (!cookieAuthOk()) fail('forbidden', 403);
    if (await limited(kv, 'co:' + ip, 12, H, now)) fail('محاولات كثيرة، جرّب بعد ساعة', 429);
    const mode = payMode(env), period = b.period === 'y' ? 'y' : 'm';
    const sess = await ownSession(request, env, now);
    const co = { id: randomCode(24), mode, test: mode !== 'live', period, attempts: [], status: 'open', createdAt: new Date(now).toISOString(), ref: str(b.ref, 20) };
    if (b.renew) {
      const t = SLUG.test(String(b.renew)) ? await kv.get(TKEY(b.renew), 'json') : null;
      if (!t || !ownsTenant(sess, t)) fail('سجّل دخولك عشان تجدد', 401);
      if (t.test && mode === 'live') fail('هذا حساب تجريبي، اشترك من جديد', 400);
      if (!t.test && mode !== 'live') fail('الدفع الإلكتروني لسا ما تفعّل، كلّمنا واتساب ونجدد لك', 400); // ما نمدد حساب حقيقي بدفع تجريبي
      co.renew = t.slug; co.kind = t.kind; co.test = !!t.test;
    } else {
      const kind = String(b.kind || ''); if (!PLANS[kind] || PLANS[kind].event) fail('اختر النظام');
      const name = str(b.name, 40); if (name.length < 2) fail('اكتب اسم نشاطك');
      const slug = String(b.slug || '').toLowerCase().trim();
      if (!SLUG.test(slug) || slug.startsWith('demo-') || RESERVED.has(slug)) fail('الرابط بالإنجليزي الصغير والأرقام والشرطة، من ٣ إلى ٣١ حرف');
      if (await kv.get(TKEY(slug))) fail('الرابط مأخوذ، اختر غيره', 409);
      let phone, pw, existing = false;
      if (sess && sess.k === 'p') { phone = sess.phone; pw = sess.acct.pw; existing = true; }
      else {
        phone = cleanPhone(b.phone); if (!phoneOk(phone)) fail('رقم الجوال لازم يبدأ بـ 05 ومن ١٠ أرقام');
        if (await kv.get(AKEY(phone))) fail('هذا الرقم عنده حساب عندنا. سجّل دخولك أول وبعدين أضف النظام', 409);
        const p = String(b.password || ''); if (p.length < 8 || p.length > 100) fail('كلمة المرور ٨ حروف أو أكثر');
        pw = await hashPw(p);
      }
      const held = await kv.get('sd:hold:' + slug); // نحجز الرابط ساعتين لنفس الرقم أثناء الدفع
      if (held && held !== phone) fail('الرابط محجوز الحين لأحد ثاني، اختر غيره', 409);
      await kv.put('sd:hold:' + slug, phone, { expirationTtl: 2 * 3600 });
      Object.assign(co, { kind, signup: { name, slug, phone, pw, existing } });
    }
    const q = quote(co.kind, period, null, { renew: true, vat: !!env.VAT_NUMBER });
    Object.assign(co, { months: q.months, lines: q.lines, total: q.total, vat: q.vat });
    const claim = randomCode(24); co.claimH = await sha256(claim);
    const gid = uuid(); co.attempts.push(gid);
    await kv.put(COKEY(co.id), JSON.stringify(co));
    if (mode !== 'test') await listAdd(kv, 'sd:co:open', [co.id, now], (x) => x[0] === co.id, 300);
    return reply({ co: coView(co), given_id: gid, amount: co.total, description: 'شاهين ديزاين · ' + KINDS[co.kind].title, mode, pk: mode === 'test' ? '' : String(env.MOYASAR_PUBLISHABLE_KEY) }, 200, { 'set-cookie': cookie('sd_co', co.id + '.' + claim, 2 * 86400) });
  }
  if (path === 'checkout/attempt') { // محاولة دفع جديدة لنفس الاشتراك (ميسّر ما تقبل نفس المعرف مرتين)
    if (!cookieAuthOk()) fail('forbidden', 403);
    const co = /^[A-Z0-9]{24}$/.test(String(b.co || '')) ? await kv.get(COKEY(b.co), 'json') : null;
    if (!co) fail('الطلب مو موجود', 404); if (co.status === 'paid') return reply({ co: coView(co) });
    if (co.attempts.length >= 6) fail('محاولات كثيرة، ابدأ من جديد', 429);
    const gid = uuid(); co.attempts.push(gid); await kv.put(COKEY(co.id), JSON.stringify(co));
    return reply({ co: coView(co), given_id: gid, amount: co.total, mode: co.mode });
  }
  if (path === 'pay/confirm') {
    const co = /^[A-Z0-9]{24}$/.test(String(b.co || '')) ? await kv.get(COKEY(b.co), 'json') : null;
    if (!co) fail('ما لقينا طلب الاشتراك', 404);
    if (await limited(kv, 'conf:' + co.id, 60, 600e3, now)) fail('لحظة، جرّب بعد شوي', 429);
    if (b.sim && !cookieAuthOk()) fail('forbidden', 403);
    let r;
    try { r = await settle(env, co, now, !!b.sim); } catch (e) { if (e && e.code) throw e; console.log('confirm failed', String(e)); return reply({ status: 'pending', co: coView(co), retry: true }); }
    const out = { status: r.status, co: coView(r.co), message: r.message || '' };
    const headers = {};
    // نسجّل دخوله تلقائيًا بس على نفس الجهاز اللي بدأ الدفع، ومرة وحدة، وخلال نص ساعة
    if (r.status === 'paid' && r.co.signup) {
      const [cid, claim] = getCookie(request, 'sd_co').split('.');
      if (cid === r.co.id && claim && same(await sha256(claim), r.co.claimH) && now - Date.parse(r.co.paidAt) < 30 * 60e3 && await kvAdd(kv, 'sd:co:login:' + r.co.id, '1')) {
        const a = await kv.get(AKEY(r.co.signup.phone), 'json');
        if (a && (a.coId === r.co.id || r.co.signup.existing)) { headers['set-cookie'] = await ownCookie(env, 'p', a.phone, a.sv, now); out.loggedIn = true; }
      }
      out.phone = mask(r.co.signup.phone);
    }
    return reply(out, 200, headers);
  }
  return null;
}

// ---------- إدارة شاهين: دفعة يدوية (تحويل/كاش) بنفس الفاتورة ----------
export async function manualPayment(env, t, d, now) {
  const kv = env.BOT_KV, period = d.period === 'y' ? 'y' : 'm', months = period === 'y' ? 12 : int(d.months || 1, 1, 36);
  const amount = Math.round(Number(d.amount) * 100); if (!(amount > 0) || amount > 10000000) fail('اكتب المبلغ');
  const from = Math.max(now, Date.parse(t.until) || now);
  t.until = new Date(addMonths(from, months)).toISOString(); if (t.status === 'suspended' && d.resume) t.status = t.pw || t.ownerPhone ? 'active' : 'invited';
  const key = 'manual:' + randomCode(12); t.pays = [...(t.pays || []), key].slice(-60);
  await kv.put(TKEY(t.slug), JSON.stringify(t));
  const vat = env.VAT_NUMBER ? Math.round(amount * 15 / 115) : 0;
  const inv = await issueInvoice(env, key, { slug: t.slug, kind: t.kind, test: false, buyer: { name: t.name, phone: t.ownerPhone || t.phone || '' }, lines: [{ desc: 'اشتراك ' + (months === 12 ? 'سنوي' : months + ' شهر'), amount }], total: amount, vat, net: amount - vat, method: str(d.method, 30) || 'تحويل بنكي', payRef: str(d.ref, 60), ref: t.ref || '', period, until: t.until }, now);
  return inv;
}
