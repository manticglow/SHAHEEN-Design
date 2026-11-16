// تجربة نظام المغسلة (/carwash): بطاقة ولاء + طلب ودفع + تقييم
// القواعد كلها هنا في الخادم، والجوال يرسل الطلب بس:
//   الزبون: ينشئ بطاقته، ويطلب لنفسه، ويقيّم غسلته (بتوكن بطاقته)
//   الموظف: يضيف الختم ويسلّم المكافأة ويغيّر حالة الطلبات (بتوكن من رمزه)
//   صاحب المغسلة: يغيّر الإعدادات (بتوكن من رمزه)
// البيانات في مفتاح واحد cw:state، وترجع لبدايتها كل يوم (تجربة عامة)
const KEY = 'cw:state';
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const ksaDay = (t = Date.now()) => new Date(t + 3 * 3600e3).toISOString().slice(0, 10);
const str = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').trim().slice(0, n);
const int = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));
const iso = (v, now) => { const t = Date.parse(v); return Number.isFinite(t) ? new Date(t).toISOString() : new Date(now).toISOString(); };
const HEX = /^#[0-9a-f]{6}$/i;
const enc = new TextEncoder();
const PAYMODE = { key: '' }; // يتعبّى من env في كل طلب

// الأسعار في الخادم، والجوال ما يقدر يغيّرها
export const PKGS = { ext: ['غسيل خارجي', 25], full: ['خارجي + داخلي', 45], vip: ['غسيل كامل + تلميع', 120] };
export const ADDONS = { eng: ['تنظيف المحرك', 30], scent: ['معطر فاخر', 10] };
const CAR_TYPES = ['سيدان', 'سيدان فاخرة', 'SUV', 'كروس أوفر', 'جيب كبير', 'جيب مربع', 'بيك أب', 'هاتشباك', 'ستيشن', 'كوبيه', 'رياضية', 'فان', 'ميني باص', 'شاحنة صغيرة'];
const ONLINE = ['Apple Pay', 'مدى'];
const STORE = ['كاش', 'شبكة'];
const GOOD = ['نظافة ممتازة', 'سريع', 'تعامل راقي', 'تلميع حلو'], BAD = ['فاتهم أماكن', 'تأخير', 'الداخل مو نظيف', 'تعامل الموظف'];

// ---------- tokens ----------
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function hmac(secret, data) {
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
}
async function sign(secret, r, n, now) { const p = b64u(enc.encode(JSON.stringify({ r, n, d: ksaDay(now) }))); return p + '.' + await hmac(secret, 'cw|' + p); }
async function verify(secret, tok, now) {
  if (!secret || typeof tok !== 'string' || tok.length > 600) return null;
  const [p, sig] = tok.split('.'); if (!p || !sig) return null;
  const want = await hmac(secret, 'cw|' + p);
  if (want.length !== sig.length) return null; let d = 0; for (let i = 0; i < want.length; i++) d |= want.charCodeAt(i) ^ sig.charCodeAt(i); if (d) return null;
  try { const o = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/'))); return o.d === ksaDay(now) ? o : null; } catch { return null; }
}
async function rolesOf(auth, secret, now) {
  const R = { staff: null, owner: false, cust: new Set() };
  if (!auth || typeof auth !== 'object') return R;
  const s = await verify(secret, auth.staff, now); if (s && s.r === 'staff') R.staff = String(s.n);
  const o = await verify(secret, auth.owner, now); if (o && o.r === 'owner') R.owner = true;
  for (const t of (Array.isArray(auth.cust) ? auth.cust : []).slice(0, 5)) { const c = await verify(secret, t, now); if (c && c.r === 'cust') R.cust.add(String(c.n)); }
  return R;
}

// ---------- state ----------
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
    config: { need: 10, gapMin: 60, staff: [{ name: 'أحمد', pin: '1234' }], ownerPin: '9999', offers: 0, google: '' },
  };
}
async function load(kv, now) {
  let s = null; try { s = await kv.get(KEY, 'json'); } catch {}
  if (!s || s.day !== ksaDay(now)) { s = seedState(now); await kv.put(KEY, JSON.stringify(s)); }
  return s;
}
const mask = (p) => (p ? String(p).slice(0, 2) + '•••••' + String(p).slice(-3) : '');
function publicState(s, now) {
  const members = {};
  for (const [k, m] of Object.entries(s.members)) members[k] = { ...m, phone: mask(m.phone) };
  const { staff, ownerPin, ...cfg } = s.config;
  return { members, orders: s.orders.map(({ phone, ...o }) => o), ratings: s.ratings.map(({ phone, ...r }) => r), feed: s.feed, config: { ...cfg, staff: staff.map((x) => ({ name: x.name })) }, pay: PAYMODE.key ? { mode: 'moyasar', key: PAYMODE.key } : { mode: 'demo' }, serverTime: new Date(now).toISOString() };
}
const lastVisit = (m) => { const v = (m && m.visits) || []; return v.length ? Date.parse(v[v.length - 1]) || 0 : 0; };
function feedAdd(s, text, by, now, stamp) {
  s.feed.items = [{ at: new Date(now).toISOString(), text: str(text, 140), by: str(by, 30) }, ...(s.feed.items || [])].slice(0, 40);
  if (stamp) { const k = ksaDay(now); s.feed.days[k] = (s.feed.days[k] || 0) + 1; const ks = Object.keys(s.feed.days).sort(); while (ks.length > 31) delete s.feed.days[ks.shift()]; }
}
function priceItems(d) {
  const p = PKGS[d.pkg]; if (!p) return null;
  const items = [[p[0], p[1]]];
  for (const a of (Array.isArray(d.addons) ? d.addons : []).slice(0, 4)) if (ADDONS[a] && !items.some((x) => x[0] === ADDONS[a][0])) items.push([ADDONS[a][0], ADDONS[a][1]]);
  return { items, total: items.reduce((t, i) => t + i[1], 0) };
}
const invNo = (now) => ksaDay(now).slice(2).replace(/-/g, '') + '-' + String(now).slice(-4);
const err = (msg, code = 400, s, now) => json({ error: msg, ...(s ? { state: publicState(s, now) } : {}) }, code);

// ---------- payment (Moyasar) ----------
// إذا انضاف MOYASAR_SECRET_KEY في Vercel: الطلب الإلكتروني يبدأ "بانتظار الدفع"، وما يصير "مدفوع"
// إلا بعد ما الخادم يتأكد من ميسّر نفسه إن الدفعة ناجحة وبنفس المبلغ ورقم الطلب.
// بدون المفتاح: وضع تجريبي، والدفع وهمي.
export async function verifyMoyasar(env, paymentId, order, fetchImpl = fetch) {
  const key = env.MOYASAR_SECRET_KEY; if (!key || !/^[a-zA-Z0-9_-]{8,64}$/.test(String(paymentId || ''))) return { ok: false, why: 'bad id' };
  const r = await fetchImpl(`https://api.moyasar.com/v1/payments/${paymentId}`, { headers: { authorization: 'Basic ' + btoa(key + ':') } });
  if (!r.ok) return { ok: false, why: 'lookup ' + r.status };
  const p = await r.json();
  const meta = p.metadata || {};
  const good = p.status === 'paid' && p.currency === 'SAR' && Number(p.amount) === Math.round(order.total * 100) && String(meta.order || '') === order.id;
  return good ? { ok: true, method: (p.source && p.source.type === 'applepay') ? 'Apple Pay' : (p.source && p.source.company === 'mada' ? 'مدى' : 'بطاقة'), ref: p.id } : { ok: false, why: 'mismatch' };
}
function markOnlinePaid(s, o, v, now) {
  o.status = 'paid'; o.method = v.method; o.payRef = v.ref; o.paidAt = new Date(now).toISOString(); o.no = o.no.replace('ORD-', 'INV-');
  feedAdd(s, 'دفع إلكتروني ' + o.no + ' · ' + o.total + ' ر.س', '', now, false);
}

// ---------- handler ----------
export async function handleCarwash(request, env, url, now = Date.now()) {
  const kv = env.BOT_KV, secret = env.SESSION_SECRET || '';
  PAYMODE.key = env.MOYASAR_SECRET_KEY && env.MOYASAR_PUBLISHABLE_KEY ? String(env.MOYASAR_PUBLISHABLE_KEY) : '';
  const live = !!PAYMODE.key;
  // إشعار ميسّر (webhook): نتأكد منه بالرجوع لميسّر نفسها، مو بالثقة في محتوى الإشعار
  if (url.pathname === '/api/wallet/moyasar' && request.method === 'POST') {
    let ev = {}; try { ev = JSON.parse((await request.text()).slice(0, 20000)); } catch {}
    if (!env.MOYASAR_WEBHOOK_SECRET || ev.secret_token !== env.MOYASAR_WEBHOOK_SECRET) return json({ error: 'forbidden' }, 403);
    const s = await load(kv, now), pid = ev.data && ev.data.id, oid = ev.data && ev.data.metadata && ev.data.metadata.order;
    const o = s.orders.find((x) => x.id === oid);
    if (o && o.status === 'pending') { const v = await verifyMoyasar(env, pid, o, env.__fetch || fetch); if (v.ok) { markOnlinePaid(s, o, v, now); await kv.put(KEY, JSON.stringify(s)); } }
    return json({ ok: true });
  }
  if (url.pathname === '/api/wallet/state' && request.method === 'GET') return json(publicState(await load(kv, now), now));
  if (request.method !== 'POST') return json({ error: 'not found' }, 404);

  const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'x').split(',')[0].trim();
  const rl = `rl:cw:${ip}:${Math.floor(now / 60000)}`;
  const n = Number((await kv.get(rl)) || 0);
  if (n >= 40) return json({ error: 'طلبات كثيرة، انتظر دقيقة' }, 429);
  await kv.put(rl, String(n + 1), { expirationTtl: 120 });
  const ct = (request.headers.get('content-type') || '').toLowerCase();
  if (!ct.startsWith('application/json')) return json({ error: 'bad content type' }, 415);

  const raw = await request.text();
  if (raw.length > 8000) return json({ error: 'too large' }, 413);
  let b; try { b = JSON.parse(raw); } catch { return json({ error: 'bad json' }, 400); }
  if (!b || typeof b !== 'object') return json({ error: 'bad body' }, 400);
  const s = await load(kv, now);
  const R = await rolesOf(b.auth, secret, now);
  const op = String(b.op || ''), d = (b.data && typeof b.data === 'object') ? b.data : {};
  let issued = null;
  const done = async (extra = {}) => { await kv.put(KEY, JSON.stringify(s)); return json({ ...publicState(s, now), ...extra }); };

  // دخول الموظف أو صاحب المغسلة: ٨ محاولات كل ١٥ دقيقة لكل جهاز
  if (op === 'pin' || op === 'ownerPin') {
    const lk = `rl:cwpin:${ip}:${Math.floor(now / 900000)}`, tries = Number((await kv.get(lk)) || 0);
    const gk = `rl:cwpin:all:${Math.floor(now / 900000)}`, gtries = Number((await kv.get(gk)) || 0);
    if (tries >= 8) return json({ error: 'محاولات كثيرة، جرّب بعد ربع ساعة' }, 429);
    if (gtries >= 60) return json({ error: 'الدخول موقوف مؤقتًا بسبب محاولات كثيرة، جرّب بعد ربع ساعة' }, 429);
    if (!secret) return json({ error: 'الخادم ناقصه SESSION_SECRET' }, 500);
    const pin = String(b.pin || '');
    if (op === 'pin') { const st = s.config.staff.find((x) => x.pin === pin); if (st) return json({ name: st.name, token: await sign(secret, 'staff', st.name, now) }); }
    else if (pin && pin === s.config.ownerPin) return json({ token: await sign(secret, 'owner', 'owner', now) });
    await kv.put(lk, String(tries + 1), { expirationTtl: 1000 });
    await kv.put(gk, String(gtries + 1), { expirationTtl: 1000 });
    return json({ error: 'الرمز غلط' }, 403);
  }
  // الزبون يرجع لبطاقته برقمه
  if (op === 'lookup') {
    const p = String(b.phone || '').replace(/\D/g, '');
    const m = /^05\d{8}$/.test(p) && Object.values(s.members).find((x) => x.phone === p);
    if (!m) return json({ id: null });
    return json({ id: m.id, token: secret ? await sign(secret, 'cust', m.id, now) : null });
  }

  switch (op) {
    case 'join': {
      if (Object.keys(s.members).length >= 300) return err('التجربة امتلت، ترجع لبدايتها بكرة', 409);
      const name = str(d.name, 60), phone = String(d.phone || '').replace(/\D/g, '');
      if (name.length < 2 || !/^05\d{8}$/.test(phone)) return err('الاسم أو الجوال غير صحيح');
      if (Object.values(s.members).some((x) => x.phone === phone)) return err('الرقم مسجّل، اكتبه في الخطوة الأولى وترجع لك بطاقتك', 409);
      let id; do { id = 'LM-' + Math.random().toString(36).slice(2, 7).toUpperCase(); } while (s.members[id]);
      s.members[id] = { id, name, phone, type: CAR_TYPES.includes(d.type) ? d.type : 'SUV', color: HEX.test(d.color) ? d.color : '#F4F6F8', stamps: 1, total: 1, rewards: 0, joined: new Date(now).toISOString(), visits: [] };
      feedAdd(s, 'انضم ' + name, '', now, false);
      issued = { id, token: secret ? await sign(secret, 'cust', id, now) : null };
      return done({ issued });
    }
    case 'stamp': {
      if (!R.staff) return err('سجّل دخول كموظف', 401);
      const m = s.members[d.id]; if (!m) return err('الزبون مو موجود', 404);
      if (m.stamps >= s.config.need) return err('البطاقة مكتملة، سلّم المكافأة أول', 409, s, now);
      if (now - lastVisit(m) < (s.config.gapMin || 60) * 60e3) return err('ما ينفع ختمين خلال المدة المحددة', 409, s, now);
      m.stamps += 1; m.total += 1; m.visits = [...(m.visits || []), new Date(now).toISOString()].slice(-10); m.pendingRating = new Date(now).toISOString(); m.lastStaff = R.staff;
      feedAdd(s, 'ختم لـ ' + m.name, R.staff, now, true);
      return done();
    }
    case 'redeem': {
      if (!R.staff) return err('سجّل دخول كموظف', 401);
      const m = s.members[d.id]; if (!m) return err('الزبون مو موجود', 404);
      if (m.stamps < s.config.need) return err('البطاقة ما اكتملت', 409, s, now);
      m.stamps = 0; m.rewards += 1; feedAdd(s, 'سلّم غسلة مجانية لـ ' + m.name, R.staff, now, false);
      return done();
    }
    case 'order': { // طلب من جوال الزبون
      const m = s.members[d.member]; if (!m) return err('البطاقة مو موجودة', 404);
      if (!R.cust.has(m.id)) return err('افتح الطلب من جوالك اللي فيه البطاقة', 403);
      if (!d.agreed) return err('أقر بإخلاء مسؤولية المتعلقات أول');
      const pr = priceItems(d); if (!pr) return err('اختر الباقة');
      const store = d.method === 'store';
      if (!store && !ONLINE.includes(d.method) && !(live && d.method === 'online')) return err('طريقة دفع غير معروفة');
      if (s.orders.filter((o) => o.member === m.id && o.status !== 'done').length >= 2) return err('عندك طلب مفتوح، كمّله أول', 409);
      // الدفع الإلكتروني هنا تجريبي. في النظام الحقيقي الطلب ما يصير "مدفوع" إلا من إشعار بوابة الدفع
      const pending = !store && live;
      const o = { id: 'o' + now.toString(36), no: (store || pending ? 'ORD-' : 'INV-') + invNo(now), member: m.id, name: m.name, car: m.type, ...pr, method: store ? 'في المغسلة' : (pending ? 'دفع إلكتروني' : d.method), status: store ? 'unpaid' : (pending ? 'pending' : 'paid'), at: new Date(now).toISOString(), agreed: true, agreedAt: new Date(now).toISOString(), ...(store || pending ? {} : { paidAt: new Date(now).toISOString(), demo: true }) };
      s.orders = [o, ...s.orders].slice(0, 200);
      feedAdd(s, (store || pending ? 'طلب ' + o.no + ' بانتظار الدفع · ' : 'طلب مدفوع ' + o.no + ' · ') + o.total + ' ر.س من ' + m.name, '', now, false);
      return done({ issued: { order: o.id } });
    }
    case 'confirmPay': { // الزبون رجع من صفحة الدفع: نتأكد من ميسّر
      const o = s.orders.find((x) => x.id === d.order); if (!o) return err('الطلب مو موجود', 404);
      if (!R.cust.has(o.member)) return err('غير مسموح', 403);
      if (o.status !== 'pending') return done();
      const v = await verifyMoyasar(env, d.paymentId, o, env.__fetch || fetch);
      if (!v.ok) return err('ما تأكدنا من الدفع. إذا انخصم المبلغ تواصل مع المغسلة', 402, s, now);
      markOnlinePaid(s, o, v, now); return done();
    }
    case 'walkin': { // بيع في المحل من الموظف
      if (!R.staff) return err('سجّل دخول كموظف', 401);
      const m = s.members[d.member]; if (!m) return err('الزبون مو موجود', 404);
      const pr = priceItems(d); if (!pr || !STORE.includes(d.method)) return err('اختر الباقة وطريقة الدفع');
      if (!d.warned) return err('نبّه الزبون على المتعلقات أول');
      const o = { id: 'o' + now.toString(36), no: 'INV-' + invNo(now), member: m.id, name: m.name, car: m.type, ...pr, method: d.method, status: 'paid', at: new Date(now).toISOString(), paidAt: new Date(now).toISOString(), agreed: false, by: R.staff };
      s.orders = [o, ...s.orders].slice(0, 200);
      feedAdd(s, 'بيع في المحل ' + d.method + ' ' + o.total + ' ر.س · ' + m.name, R.staff, now, false);
      return done();
    }
    case 'orderStatus': { // الموظف: استلام الدفع، البدء، الجاهزية
      if (!R.staff) return err('سجّل دخول كموظف', 401);
      const o = s.orders.find((x) => x.id === d.id); if (!o) return err('الطلب مو موجود', 404);
      const to = String(d.status || '');
      if (to === 'paid' && o.status === 'unpaid' && STORE.includes(d.method)) { o.status = 'paid'; o.method = d.method; o.paidAt = new Date(now).toISOString(); o.no = o.no.replace('ORD-', 'INV-'); o.by = R.staff; feedAdd(s, 'استلم ' + d.method + ' ' + o.total + ' ر.س · ' + o.no, R.staff, now, false); }
      else if (to === 'washing' && o.status === 'paid') { o.status = 'washing'; o.by = R.staff; }
      else if (to === 'done' && o.status === 'washing') {
        o.status = 'done'; o.doneAt = new Date(now).toISOString(); o.by = R.staff;
        const m = s.members[o.member];
        if (m && m.stamps < s.config.need && now - lastVisit(m) >= (s.config.gapMin || 60) * 60e3) {
          m.stamps += 1; m.total += 1; m.visits = [...(m.visits || []), o.doneAt].slice(-10); m.pendingRating = o.doneAt; m.lastStaff = R.staff;
          feedAdd(s, 'غسيل ' + o.no + ' جاهز · ختم لـ ' + m.name, R.staff, now, true); o.stamped = true;
        } else { feedAdd(s, 'غسيل ' + o.no + ' جاهز · بدون ختم', R.staff, now, false); o.stamped = false; }
      } else return err('ما ينفع هالتغيير على حالة الطلب', 409, s, now);
      return done();
    }
    case 'rate': {
      const m = s.members[d.member]; if (!m) return err('البطاقة مو موجودة', 404);
      if (!R.cust.has(m.id)) return err('قيّم من جوالك اللي فيه البطاقة', 403);
      if (!m.pendingRating) return err('ما فيه غسلة تنتظر تقييم', 409, s, now);
      const stars = int(d.stars, 1, 5), allowed = stars <= 3 ? BAD : GOOD;
      const r = { id: 'r' + now.toString(36), member: m.id, name: m.name, stars, tags: (Array.isArray(d.tags) ? d.tags : []).filter((t) => allowed.includes(t)).slice(0, 4), note: str(d.note, 300), by: m.lastStaff || '', visit: m.pendingRating, at: new Date(now).toISOString() };
      s.ratings = [r, ...s.ratings].slice(0, 200);
      delete m.pendingRating; m.thanks = stars;
      feedAdd(s, 'تقييم ' + '★'.repeat(stars) + ' من ' + m.name, '', now, false);
      return done();
    }
    case 'skipRate': case 'clearThanks': {
      const m = s.members[d.member]; if (!m || !R.cust.has(m.id)) return err('غير مسموح', 403);
      if (op === 'skipRate') delete m.pendingRating; else delete m.thanks;
      return done();
    }
    case 'config': {
      if (!R.owner) return err('سجّل دخول كصاحب المغسلة', 401);
      const c = s.config;
      if ([8, 10, 12].includes(Number(d.need))) c.need = Number(d.need);
      if ([60, 180, 1440].includes(Number(d.gapMin))) c.gapMin = Number(d.gapMin);
      if (typeof d.google === 'string') c.google = /^https:\/\/[^\s"'<>]{4,300}$/.test(d.google) ? d.google : '';
      if (typeof d.disclaimer === 'string') { const t = str(d.disclaimer, 300); if (t.length >= 20) c.disclaimer = t; }
      if (d.staffAdd && typeof d.staffAdd === 'object') {
        const name = str(d.staffAdd.name, 30), pin = String(d.staffAdd.pin || '');
        if (name.length < 2 || !/^\d{4}$/.test(pin)) return err('اكتب اسم الموظف ورمز من ٤ أرقام');
        if (pin === c.ownerPin || c.staff.some((y) => y.pin === pin || y.name === name)) return err('الاسم أو الرمز مستخدم', 409);
        if (c.staff.length >= 10) return err('أقصى عدد ١٠ موظفين', 409);
        c.staff.push({ name, pin });
      }
      if (d.staffDel != null && c.staff.length > 1) c.staff = c.staff.filter((x) => x.name !== String(d.staffDel));
      return done();
    }
    case 'offer': {
      if (!R.owner) return err('سجّل دخول كصاحب المغسلة', 401);
      s.config.offers = (s.config.offers || 0) + 1; feedAdd(s, 'عرض لكل الزبائن: ' + str(d.text, 60), '', now, false);
      return done();
    }
    default: return err('unknown op');
  }
}
