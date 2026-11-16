// مقهى: منيو QR بالطاولة + طلب مباشر للباريستا + بطاقة ولاء بالأختام
import { str, int, money, fail, uid, ksaDay, cleanPhone, mask } from '../core.js';
import { newKey, mine, strip, todayOf, sum, top, lastDays, myCard, rng, pastAt } from './util.js';

const FLOW = { new: ['prep', 'cancel'], prep: ['ready', 'cancel'], ready: ['done'] };
const CATS = ['قهوة حارة', 'قهوة باردة', 'مشروبات', 'حلى'];
const it = (cat, name, price, desc, icon) => ({ id: uid('m'), cat, name, price, desc, icon, on: true });

export default {
  title: 'منيو QR وطلبات وولاء للمقاهي', demoName: 'مقهى سَنا', tagline: 'قهوة مختصة · طلبك من طاولتك', color: '#7A4B2A',
  seed(now, demo) {
    const menu = [
      it(CATS[0], 'لاتيه', 18, 'إسبريسو مع حليب مبخّر', 'latte'), it(CATS[0], 'كورتادو', 16, 'نسبة متساوية حليب وإسبريسو', 'cup'),
      it(CATS[0], 'V60', 22, 'قهوة مقطّرة، محصول إثيوبي', 'drip'), it(CATS[0], 'قهوة سعودية', 12, 'دلة لشخصين مع تمر', 'dallah'),
      it(CATS[1], 'سبانش لاتيه بارد', 21, 'حليب مكثّف وإسبريسو على ثلج', 'iced'), it(CATS[1], 'كولد برو', 19, 'منقوع ١٨ ساعة', 'iced'),
      it(CATS[2], 'ماتشا لاتيه', 22, 'ماتشا ياباني مع حليب', 'matcha'), it(CATS[2], 'شاي مغربي', 14, 'نعناع طازج', 'tea'),
      it(CATS[3], 'سان سباستيان', 26, 'تشيز كيك محروق', 'cake'), it(CATS[3], 'كوكيز', 11, 'شوكولاتة بلجيكية', 'cookie'),
    ];
    const s = { menu, cats: CATS, tables: 12, need: 8, orders: [], counter: 100 };
    if (demo) {
      s.staff = [{ id: 'st0', name: 'ريم', pin: '1234', role: 'باريستا' }, { id: 'st1', name: 'خالد', pin: '2345', role: 'باريستا' }];
      const t = (m) => new Date(now - m * 60e3).toISOString();
      s.customers = { cDEMO1: { id: 'cDEMO1', v: 1, name: 'نورة', phone: '0501112233', code: '1111', stamps: 6, rewards: 1, at: t(9000) }, cDEMO2: { id: 'cDEMO2', v: 1, name: 'فيصل', phone: '0554445566', code: '2222', stamps: 3, rewards: 0, at: t(5000) } };
      const o = (no, items, where, status, m, cust) => ({ id: uid('o'), key: newKey(), no, items, total: sum(items, (x) => x[1] * x[2]), where, note: '', status, pay: 'counter', at: t(m), cust: cust || null, name: cust ? s.customers[cust].name : '' });
      s.orders = [o(97, [['لاتيه', 2, 18], ['كوكيز', 1, 11]], 'طاولة 3', 'prep', 6, 'cDEMO1'), o(98, [['V60', 1, 22]], 'استلام', 'new', 2), o(96, [['سبانش لاتيه بارد', 1, 21]], 'طاولة 7', 'ready', 11, 'cDEMO2'),
        o(95, [['قهوة سعودية', 1, 12], ['سان سباستيان', 2, 26]], 'طاولة 1', 'done', 40), o(94, [['ماتشا لاتيه', 1, 22]], 'استلام', 'done', 75)];
      s.counter = 98;
      const r = rng(7); let no = 20;
      for (let dAgo = 6; dAgo >= 1; dAgo--) for (let k = 0, n = 14 + Math.floor(r() * 12); k < n; k++) {
        const items = [menu[Math.floor(r() * menu.length)], ...(r() > 0.6 ? [menu[Math.floor(r() * menu.length)]] : [])].map((m) => [m.name, 1 + Math.floor(r() * 2), m.price]);
        s.orders.push({ id: uid('o'), key: newKey(), no: no++, items, total: sum(items, (x) => x[1] * x[2]), where: r() > 0.4 ? 'طاولة ' + (1 + Math.floor(r() * 12)) : 'استلام', note: '', status: 'done', pay: 'counter', at: pastAt(now, dAgo, 450 + Math.floor(r() * 900)), cust: null, name: '' });
      }
      s.feed = [{ at: t(2), text: 'طلب #98 · استلام · 22 ر.س' }, { at: t(6), text: 'طلب #97 · طاولة 3 · 47 ر.س' }, { at: t(40), text: 'ختم لـ نورة (6/8)' }, { at: t(300), text: '🎁 نورة استلمت مشروب مجاني' }];
    }
    return s;
  },
  publicStaff: null,
  view({ s, d, R, now }) {
    const own = mine(s.orders, d, R).slice(0, 10).map((o) => strip(o, 'key'));
    const base = { cats: s.cats, menu: s.menu, tables: s.tables, need: s.need, mine: own, cards: myCard(s, R) };
    if (!R.staff && !R.owner) return base;
    const orders = s.orders.slice(0, 120).map((o) => strip(o, 'key'));
    const out = { ...base, orders, members: Object.values(s.customers).slice(-400).map((c) => ({ id: c.id, name: c.name, phone: mask(c.phone), last4: c.phone.slice(-4), stamps: c.stamps || 0, rewards: c.rewards || 0 })) };
    if (R.owner) {
      const today = todayOf(s.orders, now).filter((o) => o.status !== 'cancel');
      const items = today.flatMap((o) => o.items.map((x) => x[0]));
      const hours = Array(24).fill(0); for (const o of today) hours[new Date(Date.parse(o.at) + 3 * 3600e3).getUTCHours()]++;
      const days = lastDays(now, 7).map((k) => [k, sum(s.orders.filter((o) => o.status !== 'cancel' && ksaDay(Date.parse(o.at)) === k), (o) => o.total)]);
      out.stats = { revenue: sum(today, (o) => o.total), count: today.length, avg: today.length ? Math.round(sum(today, (o) => o.total) / today.length) : 0, members: Object.keys(s.customers).length, top: top(items, (x) => x, 5), hours, days };
    }
    return out;
  },
  stats(s, now) { const today = todayOf(s.orders, now).filter((o) => o.status !== 'cancel'); return [['طلبات اليوم', today.length], ['مبيعات اليوم', sum(today, (o) => o.total) + ' ر.س'], ['أعضاء الولاء', Object.keys(s.customers).length]]; },
  ops: {
    join(c) { const m = c.newCustomer({ name: c.d.name, phone: c.d.phone, extra: { stamps: 1, rewards: 0 } }); c.R.cust.add(m.id); c.feed('عضو جديد في الولاء: ' + m.name); return c.issue(m.id).then((token) => ({ issued: { id: m.id, token } })); },
    order(c) {
      const { s, d, R, now } = c;
      const open = s.orders.filter((o) => o.status === 'new' || o.status === 'prep').length; if (open >= 60) fail('الطلبات كثيرة الحين، جرّب بعد شوي', 409);
      const items = [];
      for (const x of (Array.isArray(d.items) ? d.items : []).slice(0, 20)) {
        const m = s.menu.find((y) => y.id === x.id); const q = int(x.qty, 0, 20);
        if (!m || !q) continue; if (!m.on) fail(m.name + ' خلص اليوم', 409);
        const ex = items.find((y) => y[0] === m.name); if (ex) ex[1] += q; else items.push([m.name, q, m.price]);
      }
      if (!items.length) fail('السلة فاضية');
      const table = int(d.table, 0, s.tables); const cust = d.cust && R.cust.has(d.cust) ? d.cust : null;
      s.counter = s.counter >= 999 ? 100 : s.counter + 1;
      const o = { id: uid('o'), key: newKey(), no: s.counter, items, total: sum(items, (x) => x[1] * x[2]), where: table ? 'طاولة ' + table : 'استلام', note: str(d.note, 120), status: 'new', pay: 'counter', at: new Date(now).toISOString(), cust, name: cust ? s.customers[cust].name : str(d.name, 30) };
      s.orders = [o, ...s.orders].slice(0, 400);
      c.feed('طلب #' + o.no + ' · ' + o.where + ' · ' + o.total + ' ر.س');
      return { issued: { order: o.id, key: o.key } };
    },
    status(c) {
      c.staff(); const { s, d } = c; const o = s.orders.find((x) => x.id === d.id); if (!o) fail('الطلب مو موجود', 404);
      const to = String(d.to || ''); if (!(FLOW[o.status] || []).includes(to)) fail('ما ينفع تغيّر الحالة كذا', 409);
      o.status = to; o.by = (c.R.staff || {}).name || 'المدير'; o[to + 'At'] = new Date(c.now).toISOString();
      if (to === 'done' && o.cust && s.customers[o.cust] && !o.stamped) {
        const m = s.customers[o.cust]; const today = ksaDay(c.now);
        m.days = (m.days || []).filter((x) => x === today);
        if (m.days.length < 2) { m.stamps = (m.stamps || 0) + 1; m.days.push(today); o.stamped = true; c.feed('ختم لـ ' + m.name + ' (' + m.stamps + '/' + s.need + ')'); }
      }
    },
    stamp(c) { // ختم يدوي من الكاشير لعميل طلب من الكاونتر
      c.staff(); const m = c.s.customers[c.d.id]; if (!m) fail('العضو مو موجود', 404);
      const today = ksaDay(c.now); m.days = (m.days || []).filter((x) => x === today); if (m.days.length >= 2) fail('وصل حد الأختام اليوم لهذا العضو', 409);
      m.stamps = (m.stamps || 0) + 1; m.days.push(today); c.feed('ختم يدوي لـ ' + m.name + ' من ' + ((c.R.staff || {}).name || 'المدير'));
    },
    redeem(c) {
      c.staff(); const m = c.s.customers[c.d.id]; if (!m) fail('العضو مو موجود', 404);
      if ((m.stamps || 0) < c.s.need) fail('ما كمل الأختام', 409);
      m.stamps -= c.s.need; m.rewards = (m.rewards || 0) + 1; c.feed('🎁 ' + m.name + ' استلم مشروب مجاني');
    },
    avail(c) { c.staff(); const m = c.s.menu.find((x) => x.id === c.d.id); if (!m) fail('الصنف مو موجود', 404); m.on = !!c.d.on; c.feed((m.on ? 'رجع ' : 'خلص ') + m.name); },
    item(c) {
      c.owner(); const { s, d } = c; const name = str(d.name, 40), cat = s.cats.includes(d.cat) ? d.cat : s.cats[0], price = money(d.price, 2000);
      if (name.length < 2 || !price) fail('اكتب الاسم والسعر');
      const ICONS = ['latte', 'cup', 'drip', 'dallah', 'iced', 'matcha', 'tea', 'cake', 'cookie'];
      const m = d.id ? s.menu.find((x) => x.id === d.id) : null;
      const rec = { name, cat, price, desc: str(d.desc, 80), icon: ICONS.includes(d.icon) ? d.icon : 'cup' };
      if (m) Object.assign(m, rec); else { if (s.menu.length >= 120) fail('وصلت الحد', 409); s.menu.push({ id: uid('m'), on: true, ...rec }); }
    },
    itemDel(c) { c.owner(); const i = c.s.menu.findIndex((x) => x.id === c.d.id); if (i < 0) fail('الصنف مو موجود', 404); c.s.menu.splice(i, 1); },
    settings(c) { c.owner(); c.s.tables = int(c.d.tables, 0, 200); c.s.need = int(c.d.need, 3, 30); },
  },
};
