// منصة الاشتراكات: كل مشترك (مقهى، صالون، عيادة...) له رابطه /s/<slug> وبياناته المنفصلة
//   شاهين ديزاين (لوحة /admin): ينشئ الاشتراك ويعطي رابط تفعيل، يوقف أو يمدد
//   المشترك (/app): يفعّل حسابه بكلمة مرور، ويدير نظامه وموظفينه وعملاءه
//   الموظف: يدخل برمز يحطه له المشترك  ·  العميل: بطاقته بتوكن على جواله، ويرجع لها برقمه ورمز البطاقة
// التجارب الحية demo-<النوع> ترجع لبدايتها كل يوم، ورموزها ١٢٣٤ للموظف و٩٩٩٩ للمدير
import { json, str, int, cleanPhone, phoneOk, HttpError, fail, sign, verify, hashPw, checkPw, randomCode, randomDigits, sha256, limited, peekLimit, ksaDay, uid, HEX, mask, same } from './core.js';
import { isAdmin, sameOrigin } from '../cms.js';
import KINDS from './kinds/index.js';
import { phase, graceEnd, handleAccount, ownSession, ownsTenant, strictOrigin, manualPayment, payMode } from './billing.js';

const TKEY = (s) => 'sd:tenant:' + s, SKEY = (s) => 'sd:state:' + s, CKEY = (h) => 'sd:code:' + h, INDEX = 'sd:tenants';
const SLUG = /^[a-z][a-z0-9-]{2,30}$/;
const RESERVED = new Set(['admin', 'api', 'app', 'demo', 'demos', 'www', 'shaheen', 'test', 'carwash', 'static', 'vendor', 'invitations', 'pay', 'billing']);
const H = 3600e3, D = 86400e3;
export const DEMO_PIN = { staff: '1234', owner: '9999' };
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const ipOf = (r) => (r.headers.get('x-real-ip') || r.headers.get('x-forwarded-for') || 'x').split(',')[0].trim().slice(0, 60);

function demoTenant(slug, now) {
  const kind = slug.slice(5); if (!KINDS[kind]) return null;
  return { slug, kind, name: KINDS[kind].demoName, status: 'active', demo: true, until: new Date(now + D).toISOString() };
}
async function getTenant(kv, slug, now) {
  if (!SLUG.test(slug)) return null;
  if (slug.startsWith('demo-')) return demoTenant(slug, now);
  const t = await kv.get(TKEY(slug), 'json');
  return t && KINDS[t.kind] ? t : null;
}
const activeT = (t, now) => t && t.status === 'active' && (!t.until || Date.parse(t.until) > now);
const pubTenant = (t, full) => ({ slug: t.slug, name: t.name, kind: t.kind, demo: !!t.demo, ...(full ? { status: t.status, until: t.until, phone: mask(t.phone), createdAt: t.createdAt } : {}) });

export function seedState(t, now) {
  const K = KINDS[t.kind], day = ksaDay(now);
  const s = { kind: t.kind, day, brand: { name: t.name, tagline: K.tagline, color: K.color }, staff: [], customers: {}, feed: [], ...K.seed(now, !!t.demo) };
  if (t.demo) s.ownerPin = DEMO_PIN.owner;
  s.staff = s.staff.map((x, i) => ({ id: x.id || 'st' + i, v: 1, ...x }));
  return s;
}
export async function loadStateFor(kv, t, now) { return (await loadState(kv, t, now))[0]; }
async function loadState(kv, t, now) {
  const s = await kv.get(SKEY(t.slug), 'json');
  if (!s || s.kind !== t.kind || (t.demo && s.day !== ksaDay(now))) return [seedState(t, now), true];
  return [s, false];
}

async function rolesOf(auth, secret, t, s, now) {
  const R = { owner: false, staff: null, cust: new Set() };
  auth = obj(auth);
  const ok = (x, r) => x && x.t === t.slug && x.r === r && (!t.demo || x.d === s.day);
  const o = await verify(secret, auth.owner, now);
  if (ok(o, 'owner') && (t.demo || o.v === t.pwv)) R.owner = true;
  const st = await verify(secret, auth.staff, now);
  if (ok(st, 'staff')) { const m = s.staff.find((x) => x.id === st.n && x.v === st.v); if (m) R.staff = m; }
  for (const c of (Array.isArray(auth.cust) ? auth.cust : []).slice(0, 5)) {
    const x = await verify(secret, c, now);
    if (ok(x, 'cust') && s.customers[x.n] && (s.customers[x.n].v || 1) === x.v) R.cust.add(x.n);
  }
  return R;
}

function view(ctx) {
  const { t, s, R, now } = ctx, K = KINDS[t.kind];
  const staff = R.owner ? s.staff.map(({ pin, ...x }) => x) : K.publicStaff ? s.staff.map((x) => ({ id: x.id, name: x.name, ...(K.publicStaff(x) || {}) })) : [];
  return {
    tenant: pubTenant(t, R.owner), brand: s.brand, day: s.day,
    me: { owner: R.owner, staff: R.staff ? { id: R.staff.id, name: R.staff.name } : null, cust: [...R.cust] },
    staff, feed: R.owner ? s.feed.slice(0, 30) : [], ...K.view(ctx), serverTime: new Date(now).toISOString(),
    ...(R.owner && !t.demo ? { billing: { phase: phase(t, now), until: t.until, graceEnd: graceEnd(t), test: !!t.test } } : {}),
  };
}

// ---------- صفحة المشترك: /api/t/<slug>/op ----------
export async function handleTenant(request, env, url, now = Date.now()) {
  const m = /^\/api\/t\/([a-z0-9-]{3,31})\/op$/.exec(url.pathname);
  if (!m || request.method !== 'POST') return json({ error: 'not found' }, 404);
  const kv = env.BOT_KV, secret = env.SESSION_SECRET || '';
  if (!secret) return json({ error: 'الخادم ناقصه SESSION_SECRET' }, 500);
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return json({ error: 'bad content type' }, 415);
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  const ip = ipOf(request);
  if (await limited(kv, 'ip:' + ip, 240, 60e3, now)) return json({ error: 'طلبات كثيرة، انتظر دقيقة' }, 429);
  const raw = await request.text(); if (raw.length > 30000) return json({ error: 'البيانات كبيرة' }, 413);
  let b; try { b = obj(JSON.parse(raw)); } catch { return json({ error: 'bad json' }, 400); }
  const t = await getTenant(kv, m[1], now);
  if (!t) return json({ error: 'الصفحة مو موجودة' }, 404);
  const ph = phase(t, now);
  if (ph === 'invited') return json({ blocked: true, tenant: pubTenant(t), error: 'الحساب لسا ما تفعّل' }, 402);
  const K = KINDS[t.kind];
  const [s, fresh] = await loadState(kv, t, now);
  const R = await rolesOf(b.auth, secret, t, s, now);
  // المالك يقدر يدخل بحساب شاهين (كوكي) بدل كلمة المرور، بس لما الصفحة تطلب وضع الإدارة صراحة
  if (!t.demo && obj(b.auth).owner === 'cookie' && strictOrigin(request)) { const sess = await ownSession(request, env, now); if (ownsTenant(sess, t)) R.owner = true; }
  if (ph === 'expired' || ph === 'suspended') {
    // العملاء ما يشوفون شي عن الفوترة. المالك يشوف زر التجديد
    if (R.owner && ph === 'expired') return json({ blocked: true, owner: true, renew: '/app#billing', tenant: pubTenant(t), error: 'انتهى اشتراكك', note: 'جدّد اشتراكك ويرجع كل شي مثل ما هو. بياناتك محفوظة' }, 402);
    return json({ blocked: true, tenant: pubTenant(t), error: 'الصفحة متوقفة مؤقتًا', note: 'ترجع قريب إن شاء الله' }, 402);
  }
  const op = String(b.op || ''), d = obj(b.data);
  const dtag = t.demo ? s.day : undefined;
  const ctx = {
    t, s, d, R, now, demo: !!t.demo, kv, ip,
    feed: (txt) => { s.feed = [{ at: new Date(now).toISOString(), text: str(txt, 160) }, ...s.feed].slice(0, 60); },
    issue: (id) => sign(secret, { t: t.slug, r: 'cust', n: id, v: s.customers[id].v || 1, d: dtag }, t.demo ? D : 180 * D, now),
    owner: () => { if (!R.owner) fail('سجّل دخول كمدير', 401); },
    staff: () => { if (!R.staff && !R.owner) fail('سجّل دخول كموظف', 401); },
    newCustomer: (fields) => {
      const ids = Object.keys(s.customers); if (ids.length >= (t.demo ? 300 : 20000)) fail(t.demo ? 'التجربة امتلت، ترجع لبدايتها بكرة' : 'وصلت الحد', 409);
      const phone = cleanPhone(fields.phone); if (!phoneOk(phone)) fail('رقم الجوال لازم يبدأ بـ 05 ومن ١٠ أرقام');
      if (Object.values(s.customers).some((c) => c.phone === phone)) fail('الرقم مسجّل من قبل. ادخل برقمك ورمز البطاقة', 409);
      const id = uid('c'), c = { id, v: 1, name: str(fields.name, 40) || 'عميل', phone, code: randomDigits(4), at: new Date(now).toISOString(), ...fields.extra };
      if (c.name.length < 2) fail('اكتب الاسم'); s.customers[id] = c; return c;
    },
  };
  // نعدّ المحاولات الغلط بس: عشان أحد ما يقدر يقفل دخول موظفين المحل بطلبات عشوائية
  const lock = async (what) => {
    if (await peekLimit(kv, `pin:${t.slug}:${what}:${ip}`, 8, 900e3, now)) fail('محاولات كثيرة، جرّب بعد ربع ساعة', 429);
    if (what !== 'lookup' && await peekLimit(kv, `pinall:${t.slug}`, 200, 900e3, now)) fail('الدخول موقوف مؤقتًا، جرّب بعد ربع ساعة', 429);
  };
  const bad = async (what, msg) => { await limited(kv, `pin:${t.slug}:${what}:${ip}`, 8, 900e3, now); if (what !== 'lookup') await limited(kv, `pinall:${t.slug}`, 200, 900e3, now); fail(msg, 403); };
  try {
    let extra = {}, dirty = fresh;
    switch (op) {
      case 'state': break;
      case 'staffPin': {
        await lock('staff'); const pin = String(b.pin || '');
        const st = /^\d{4,6}$/.test(pin) && s.staff.find((x) => x.pin && same(x.pin, pin));
        if (!st) await bad('staff', 'الرمز غلط');
        ctx.R.staff = st;
        extra = { token: await sign(secret, { t: t.slug, r: 'staff', n: st.id, v: st.v, d: dtag }, 12 * H, now) }; break;
      }
      case 'ownerPin': {
        if (!t.demo) fail('ادخل بكلمة المرور', 400); await lock('owner');
        if (!same(String(b.pin || ''), s.ownerPin)) await bad('owner', 'الرمز غلط');
        ctx.R.owner = true; extra = { token: await sign(secret, { t: t.slug, r: 'owner', n: 'owner', d: dtag }, 12 * H, now) }; break;
      }
      case 'ownerLogin': {
        if (t.demo) fail('التجربة تدخل برمز ٩٩٩٩', 400); await lock('owner');
        const pwRec = t.ownerPhone ? ((await kv.get('sd:acct:' + t.ownerPhone, 'json')) || {}).pw : t.pw;
        if (!(await checkPw(String(b.password || '').slice(0, 200), pwRec))) await bad('owner', 'كلمة المرور غلط');
        ctx.R.owner = true; extra = { token: await sign(secret, { t: t.slug, r: 'owner', n: 'owner', v: t.pwv }, 12 * H, now) }; break;
      }
      case 'lookup': { // العميل يرجع لبطاقته من جوال ثاني: رقمه + رمز البطاقة
        await lock('lookup'); const phone = cleanPhone(b.phone), code = String(b.code || '');
        const c = Object.values(s.customers).find((x) => x.phone === phone);
        if (!c || !same(c.code, code)) await bad('lookup', 'الرقم أو رمز البطاقة غلط');
        ctx.R.cust.add(c.id); extra = { issued: { id: c.id, token: await ctx.issue(c.id) } }; break;
      }
      case 'brand': {
        ctx.owner(); const name = str(d.name, 40), tag = str(d.tagline, 90);
        if (name.length < 2) fail('اكتب اسم النشاط');
        s.brand = { name, tagline: tag, color: HEX.test(d.color) ? d.color : s.brand.color }; dirty = true; break;
      }
      case 'staffAdd': {
        ctx.owner(); const name = str(d.name, 30), pin = String(d.pin || '');
        if (name.length < 2) fail('اكتب اسم الموظف'); if (!/^\d{4,6}$/.test(pin)) fail('الرمز من ٤ إلى ٦ أرقام');
        if (s.staff.some((x) => x.pin === pin) || pin === s.ownerPin) fail('الرمز مستخدم، اختر رمز ثاني', 409);
        if (s.staff.length >= 40) fail('وصلت الحد', 409);
        s.staff.push({ id: uid('st'), v: 1, name, pin, ...(K.staffExtra ? K.staffExtra(d, ctx) : {}) });
        ctx.feed('موظف جديد: ' + name); dirty = true; break;
      }
      case 'staffDel': {
        ctx.owner(); const i = s.staff.findIndex((x) => x.id === d.id); if (i < 0) fail('الموظف مو موجود', 404);
        ctx.feed('حذف الموظف ' + s.staff[i].name); s.staff.splice(i, 1); dirty = true; break;
      }
      default: {
        const fn = K.ops[op]; if (!fn || !Object.prototype.hasOwnProperty.call(K.ops, op)) fail('عملية غير معروفة', 404);
        extra = (await fn(ctx)) || {}; dirty = true;
      }
    }
    if (dirty) await kv.put(SKEY(t.slug), JSON.stringify(s));
    const iss = extra.issued; // الطلب/الحجز الجديد يطلع في الرد على طول
    if (iss && iss.key) { const id = iss.order || iss.booking || iss.appt || iss.ticket; if (id) d.mine = [[id, iss.key], ...(Array.isArray(d.mine) ? d.mine : [])]; }
    return json({ ...view(ctx), ...extra });
  } catch (e) {
    if (e instanceof HttpError) { const body = { error: e.message }; if (e.code === 409 || e.code === 400) Object.assign(body, { state: view(ctx) }); return json(body, e.code); }
    console.log('tenant op failed', op, String(e && e.stack || e)); return json({ error: 'صار خطأ، جرّب مرة ثانية' }, 500);
  }
}

// ---------- المنصة: /api/platform/* ----------
export async function handlePlatform(request, env, url, now = Date.now()) {
  const kv = env.BOT_KV, secret = env.SESSION_SECRET || '';
  const reply = (o, st = 200, h = {}) => new Response(JSON.stringify(o), { status: st, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...h } });
  if (request.method === 'GET' && url.pathname === '/api/platform/plans') { try { return await handleAccount('plans', request, env, {}, now, reply); } catch (e) { return json({ error: 'صار خطأ' }, 500); } }
  if (request.method === 'GET' && url.pathname === '/api/platform/kinds') return json(Object.fromEntries(Object.entries(KINDS).map(([k, K]) => [k, { title: K.title, demoName: K.demoName, color: K.color }])));
  if (request.method !== 'POST') return json({ error: 'not found' }, 404);
  if (!secret) return json({ error: 'الخادم ناقصه SESSION_SECRET' }, 500);
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return json({ error: 'bad content type' }, 415);
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  const ip = ipOf(request);
  let b; try { b = obj(JSON.parse((await request.text()).slice(0, 8000))); } catch { return json({ error: 'bad json' }, 400); }
  const path = url.pathname.slice('/api/platform/'.length);
  try {
    if (path === 'admin') return json(await adminAction(request, env, b, now));
    const acc = await handleAccount(path, request, env, b, now, reply); if (acc) return acc;
    if (path === 'activate') {
      if (await limited(kv, 'act:' + ip, 10, 900e3, now)) fail('محاولات كثيرة، جرّب بعد ربع ساعة', 429);
      const code = String(b.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const slug = code.length === 20 ? await kv.get(CKEY(await sha256(code))) : null;
      const t = slug && await kv.get(TKEY(slug), 'json');
      if (!t || !t.codeHash || !same(t.codeHash, await sha256(code)) || Date.parse(t.codeExp) < now) fail('رابط التفعيل غير صالح أو انتهى. اطلب رابط جديد من شاهين ديزاين', 403);
      const pw = String(b.password || '');
      if (pw.length < 8 || pw.length > 100) fail('كلمة المرور ٨ حروف أو أكثر');
      t.pw = await hashPw(pw); t.pwv = (t.pwv || 0) + 1; delete t.codeHash; delete t.codeExp;
      if (t.status === 'invited') t.status = 'active'; t.activatedAt = t.activatedAt || new Date(now).toISOString();
      await kv.put(TKEY(slug), JSON.stringify(t)); await kv.put(CKEY(await sha256(code)), '');
      const own = await sign(secret, { r: 'own', k: 's', p: slug, v: t.pwv }, 30 * D, now);
      return reply({ ok: true, tenant: pubTenant(t, true) }, 200, { 'set-cookie': `sd_own=${encodeURIComponent(own)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 86400}` });
    }
    if (path === 'login') {
      const slug = String(b.slug || '').toLowerCase().trim();
      if (await limited(kv, 'login:' + ip, 8, 900e3, now) || await limited(kv, 'loginslug:' + slug.slice(0, 40), 20, 900e3, now)) fail('محاولات كثيرة، جرّب بعد ربع ساعة', 429);
      const t = SLUG.test(slug) && !slug.startsWith('demo-') ? await kv.get(TKEY(slug), 'json') : null;
      if (!t || !(await checkPw(String(b.password || '').slice(0, 200), t.pw))) fail('اسم الحساب أو كلمة المرور غلط', 403);
      return json({ token: await sign(secret, { t: slug, r: 'owner', n: 'owner', v: t.pwv }, 12 * H, now), tenant: pubTenant(t, true) });
    }
    if (path === 'me' || path === 'password') {
      const tok = await verify(secret, b.token, now);
      const t = tok && tok.r === 'owner' && SLUG.test(tok.t || '') && !tok.t.startsWith('demo-') ? await kv.get(TKEY(tok.t), 'json') : null;
      if (!t || tok.v !== t.pwv) fail('انتهت الجلسة، سجّل دخول', 401);
      if (path === 'password') {
        if (!(await checkPw(String(b.old || ''), t.pw))) fail('كلمة المرور الحالية غلط', 403);
        const pw = String(b.password || ''); if (pw.length < 8 || pw.length > 100) fail('كلمة المرور ٨ حروف أو أكثر');
        t.pw = await hashPw(pw); t.pwv += 1; await kv.put(TKEY(t.slug), JSON.stringify(t));
        return json({ token: await sign(secret, { t: t.slug, r: 'owner', n: 'owner', v: t.pwv }, 12 * H, now), tenant: pubTenant(t, true) });
      }
      const [s] = await loadState(kv, t, now);
      return json({ tenant: pubTenant(t, true), active: activeT(t, now), brand: s.brand, title: KINDS[t.kind].title, stats: KINDS[t.kind].stats ? KINDS[t.kind].stats(s, now) : [] });
    }
    fail('not found', 404);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.code);
    console.log('platform failed', String(e && e.stack || e)); return json({ error: 'صار خطأ، جرّب مرة ثانية' }, 500);
  }
}

async function newCode(kv, t, now) {
  if (t.codeHash) await kv.put(CKEY(t.codeHash), '');
  const code = randomCode(20); t.codeHash = await sha256(code); t.codeExp = new Date(now + 14 * D).toISOString();
  await kv.put(CKEY(t.codeHash), t.slug); return code;
}

async function adminAction(request, env, b, now) {
  const kv = env.BOT_KV;
  if (!(await isAdmin(request, env, now))) fail('سجّل دخول في لوحة التحكم أول', 401);
  const list = (await kv.get(INDEX, 'json')) || [];
  const act = String(b.action || '');
  if (act === 'list') {
    const out = [];
    for (const slug of list.slice(0, 500)) { const t = await kv.get(TKEY(slug), 'json'); if (t) out.push({ slug, name: t.name, kind: t.kind, status: t.status, phase: phase(t, now), until: t.until, phone: t.ownerPhone || t.phone, note: t.note || '', createdAt: t.createdAt, activated: !!(t.pw || t.ownerPhone), test: !!t.test, self: !!t.ownerPhone, ref: t.ref || '' }); }
    const month = ksaDay(now).slice(0, 7), led = (await kv.get('sd:pays:' + month, 'json')) || [];
    return { tenants: out, mode: payMode(env), month: { key: month, revenue: led.reduce((a, x) => a + x.total, 0), count: led.length, pays: led.slice(0, 50) }, kinds: Object.fromEntries(Object.entries(KINDS).map(([k, K]) => [k, K.title])) };
  }
  if (act === 'create') {
    const slug = String(b.slug || '').toLowerCase().trim(), kind = String(b.kind || ''), name = str(b.name, 40);
    if (!SLUG.test(slug) || slug.startsWith('demo-') || RESERVED.has(slug)) fail('الرابط بالإنجليزي الصغير والأرقام والشرطة، من ٣ إلى ٣١ حرف');
    if (!KINDS[kind]) fail('اختر نوع النظام'); if (name.length < 2) fail('اكتب اسم النشاط');
    if (await kv.get(TKEY(slug), 'json') || await kv.get('sd:hold:' + slug)) fail('الرابط مستخدم، اختر غيره', 409);
    const phone = cleanPhone(b.phone); if (b.phone && !phoneOk(phone)) fail('رقم الجوال لازم يبدأ بـ 05');
    const t = { slug, name, kind, phone: phone || '', status: 'invited', until: new Date(now + int(b.months || 1, 1, 36) * 30 * D).toISOString(), createdAt: new Date(now).toISOString(), pwv: 0, note: str(b.note, 200) };
    const code = await newCode(kv, t, now);
    await kv.put(TKEY(slug), JSON.stringify(t)); await kv.put(SKEY(slug), JSON.stringify(seedState(t, now)));
    await kv.put(INDEX, JSON.stringify([...list.filter((x) => x !== slug), slug]));
    return { tenant: pubTenant(t, true), code };
  }
  const slug = String(b.slug || ''); const t = list.includes(slug) && await kv.get(TKEY(slug), 'json');
  if (!t) fail('المشترك مو موجود', 404);
  let code;
  if (act === 'extend') { const base = Math.max(now, Date.parse(t.until) || now); t.until = new Date(base + int(b.months || 1, 1, 36) * 30 * D).toISOString(); }
  else if (act === 'suspend') t.status = 'suspended';
  else if (act === 'resume') t.status = t.pw ? 'active' : 'invited';
  else if (act === 'code') code = await newCode(kv, t, now); // تفعيل جديد أو نسيان كلمة المرور
  else if (act === 'note') t.note = str(b.note, 200);
  else if (act === 'pay') { const inv = await manualPayment(env, t, b, now); return { tenant: { ...pubTenant(t, true), phone: t.phone, activated: !!(t.pw || t.ownerPhone) }, invoice: inv.no }; }
  else if (act === 'invoices') { const nos = (await kv.get('sd:tinv:' + slug, 'json')) || []; const out = []; for (const no of nos.slice(0, 50)) { const i = await kv.get('sd:inv:' + no, 'json'); if (i) out.push({ no: i.no, issuedAt: i.issuedAt, total: i.total, method: i.method }); } return { invoices: out }; }
  else fail('عملية غير معروفة', 404);
  await kv.put(TKEY(slug), JSON.stringify(t));
  return { tenant: { ...pubTenant(t, true), phone: t.phone, activated: !!t.pw }, ...(code ? { code } : {}) };
}
