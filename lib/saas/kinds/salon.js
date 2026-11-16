// صالون وسبا: حجز موعد بالخدمة والمختصة والوقت + جدول اليوم للموظفات + ولاء بالزيارات
import { str, int, money, fail, uid, ksaDay, ksaMin, freeSlots, nextDays, toMin, hhmm, cleanPhone, phoneOk, mask } from '../core.js';
import { newKey, mine, strip, sum, top, lastDays, myCard, rng } from './util.js';

const FLOW = { booked: ['arrived', 'cancel', 'noshow'], arrived: ['done'] };
const svc = (name, min, price, cat) => ({ id: uid('v'), name, min, price, cat });
const busyOf = (s, staffId, day, skip) => s.bookings.filter((b) => b.staff === staffId && b.day === day && !['cancel', 'noshow'].includes(b.status) && b.id !== skip).map((b) => [b.start, b.start + b.dur]);
const canDo = (st, v) => !st.does || !st.does.length || st.does.includes(v.cat);

function slotsFor(s, v, staffId, day, now) {
  const team = s.staff.filter((x) => (!staffId || x.id === staffId) && canDo(x, v));
  const all = new Map();
  for (const st of team) for (const t of freeSlots({ day, open: s.hours.open, close: s.hours.close, step: 30, dur: v.min, busy: busyOf(s, st.id, day), now, offDays: s.hours.off })) if (!all.has(t)) all.set(t, st.id);
  return [...all.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

export default {
  title: 'حجوزات وولاء للصالونات والسبا', demoName: 'صالون لُجين', tagline: 'عناية وجمال · احجزي موعدك بدقيقة', color: '#A0526B',
  publicStaff: (x) => ({ role: x.role || '', does: x.does || [] }),
  staffExtra: (d) => ({ role: str(d.role, 30), does: Array.isArray(d.does) ? d.does.map((x) => str(x, 20)).slice(0, 6) : [] }),
  seed(now, demo) {
    const services = [svc('قص وتصفيف', 60, 120, 'شعر'), svc('صبغة كاملة', 120, 380, 'شعر'), svc('بروتين', 150, 650, 'شعر'), svc('مانيكير وباديكير', 75, 160, 'أظافر'),
      svc('تنظيف بشرة عميق', 60, 280, 'بشرة'), svc('مساج استرخاء', 60, 240, 'سبا'), svc('مكياج سهرة', 90, 450, 'مكياج')];
    const s = { services, cats: ['شعر', 'أظافر', 'بشرة', 'سبا', 'مكياج'], hours: { open: 600, close: 1320, off: [] }, need: 6, bookings: [] };
    if (demo) {
      s.staff = [{ id: 'st0', name: 'منى', pin: '1234', role: 'خبيرة شعر', does: ['شعر', 'مكياج'] }, { id: 'st1', name: 'سارا', pin: '2345', role: 'أخصائية بشرة وسبا', does: ['بشرة', 'سبا'] }, { id: 'st2', name: 'جود', pin: '3456', role: 'أظافر', does: ['أظافر'] }];
      s.customers = { cDEMO1: { id: 'cDEMO1', v: 1, name: 'لمى', phone: '0501112233', code: '1111', stamps: 4, rewards: 0, at: new Date(now - 9e8).toISOString() } };
      const day = ksaDay(now), nm = Math.max(600, Math.min(1140, Math.ceil(ksaMin(now) / 30) * 30));
      const b = (v, st, start, status, name, phone, cust) => ({ id: uid('b'), key: newKey(), svc: services[v].name, svcId: services[v].id, cat: services[v].cat, staff: 'st' + st, day, start, dur: services[v].min, price: services[v].price, name, phone, cust: cust || null, status, at: new Date(now - 864e5).toISOString() });
      s.bookings = [b(0, 0, Math.max(600, nm - 120), 'done', 'هيا', '0533334444'), b(4, 1, Math.max(600, nm - 60), 'arrived', 'لمى', '0501112233', 'cDEMO1'), b(1, 0, nm + 60, 'booked', 'ريما', '0566667777'), b(3, 2, nm + 30, 'booked', 'دانة', '0577778888'), b(5, 1, nm + 120, 'booked', 'العنود', '0588889999')];
      const r = rng(11), nm2 = ['أروى', 'شهد', 'رغد', 'مها', 'بشاير', 'جواهر', 'ديما', 'ميار'];
      for (let a = 6; a >= 1; a--) for (let k = 0, n = 6 + Math.floor(r() * 6); k < n; k++) { const vi = Math.floor(r() * services.length), v = services[vi]; const st = vi < 3 || vi === 6 ? 0 : vi === 3 ? 2 : 1;
        s.bookings.push({ id: uid('b'), key: newKey(), svc: v.name, svcId: v.id, cat: v.cat, staff: 'st' + st, day: ksaDay(now, -a), start: 600 + Math.floor(r() * 18) * 30, dur: v.min, price: v.price, name: nm2[k % 8], phone: '05' + String(10000000 + Math.floor(r() * 89999999)), cust: null, status: r() > 0.1 ? 'done' : 'noshow', at: new Date(now - (a + 2) * 864e5).toISOString() }); }
      s.feed = [{ at: new Date(now - 18e5).toISOString(), text: 'حجز مساج استرخاء · العنود' }, { at: new Date(now - 72e5).toISOString(), text: 'زيارة لـ لمى (4/6)' }];
    }
    return s;
  },
  view({ s, d, R, now }) {
    const base = { services: s.services, cats: s.cats, hours: s.hours, need: s.need, days: nextDays(now, 14), mine: mine(s.bookings, d, R).slice(0, 10).map((b) => strip(b, 'key', 'phone')), cards: myCard(s, R) };
    if (d.slots) { const v = s.services.find((x) => x.id === d.slots.svc); const day = String(d.slots.day || ''); base.slots = v && base.days.includes(day) ? slotsFor(s, v, String(d.slots.staff || ''), day, now).map(([t, st]) => ({ t, st })) : []; }
    if (!R.staff && !R.owner) return base;
    const from = ksaDay(now, -1);
    const out = { ...base, bookings: s.bookings.filter((b) => b.day >= from).slice(0, 300).map((b) => strip(b, 'key')) };
    if (R.owner) {
      const today = s.bookings.filter((b) => b.day === ksaDay(now));
      const week = s.bookings.filter((b) => b.day >= ksaDay(now, -6) && b.day <= ksaDay(now));
      const done = week.filter((b) => b.status === 'done');
      out.stats = { today: today.filter((b) => b.status !== 'cancel').length, revenueToday: sum(today.filter((b) => b.status === 'done'), (b) => b.price), revenueWeek: sum(done, (b) => b.price),
        noshow: week.length ? Math.round(100 * week.filter((b) => b.status === 'noshow').length / week.length) : 0, top: top(week.filter((b) => b.status !== 'cancel'), (b) => b.svc, 5),
        perStaff: s.staff.map((st) => [st.name, today.filter((b) => b.staff === st.id && b.status !== 'cancel').length]), members: Object.keys(s.customers).length,
        days: lastDays(now, 7).map((k) => [k, sum(s.bookings.filter((b) => b.day === k && b.status === 'done'), (b) => b.price)]) };
      out.members = Object.values(s.customers).slice(-300).map((c) => ({ id: c.id, name: c.name, phone: mask(c.phone), stamps: c.stamps || 0 }));
    }
    return out;
  },
  stats(s, now) { const t = s.bookings.filter((b) => b.day === ksaDay(now) && b.status !== 'cancel'); return [['حجوزات اليوم', t.length], ['حجوزات قادمة', s.bookings.filter((b) => b.day > ksaDay(now) && b.status === 'booked').length], ['عميلات الولاء', Object.keys(s.customers).length]]; },
  ops: {
    async book(c) {
      const { s, d, R, now } = c; const v = s.services.find((x) => x.id === d.svc); if (!v) fail('اختاري الخدمة');
      const day = String(d.day || ''); if (!nextDays(now, 14).includes(day)) fail('اختاري يوم');
      const free = slotsFor(s, v, String(d.staff || ''), day, now); const hit = free.find(([t]) => t === d.time);
      if (!hit) fail('الوقت انحجز، اختاري وقت ثاني', 409);
      const phone = cleanPhone(d.phone); if (!phoneOk(phone)) fail('رقم الجوال لازم يبدأ بـ 05'); const name = str(d.name, 40); if (name.length < 2) fail('اكتبي الاسم');
      if (s.bookings.filter((b) => b.phone === phone && b.status === 'booked' && b.day >= ksaDay(now)).length >= 3) fail('عندك ٣ حجوزات قادمة، الغي وحدة أول', 409);
      let cust = [...R.cust].find((id) => s.customers[id] && s.customers[id].phone === phone) || null, issued = null;
      if (!cust && !Object.values(s.customers).some((x) => x.phone === phone)) { const m = c.newCustomer({ name, phone, extra: { stamps: 0, rewards: 0 } }); cust = m.id; R.cust.add(cust); issued = { id: cust, token: await c.issue(cust) }; }
      else if (!cust) cust = Object.values(s.customers).find((x) => x.phone === phone).id; // يربط الزيارة ببطاقتها بدون ما يفتحها هنا
      const b = { id: uid('b'), key: newKey(), svc: v.name, svcId: v.id, cat: v.cat, staff: hit[1], day, start: toMin(d.time), dur: v.min, price: v.price, name, phone, cust, status: 'booked', at: new Date(now).toISOString(), by: R.staff ? R.staff.name : '' };
      s.bookings = [b, ...s.bookings].slice(0, 1500);
      c.feed('حجز ' + v.name + ' · ' + name + ' · ' + day + ' ' + d.time);
      return { issued: { ...(issued || {}), booking: b.id, key: b.key } };
    },
    cancel(c) {
      const { s, d, R, now } = c; const b = s.bookings.find((x) => x.id === d.id); if (!b) fail('الحجز مو موجود', 404);
      const okOwn = mine([b], d, R).length; if (!okOwn && !R.staff && !R.owner) fail('غير مسموح', 403);
      if (b.status !== 'booked') fail('ما ينفع إلغاؤه', 409);
      const at = Date.parse(b.day + 'T00:00:00Z') - 3 * 3600e3 + b.start * 60e3; if (!R.staff && !R.owner && at - now < 2 * 3600e3) fail('الإلغاء قبل الموعد بساعتين على الأقل. تواصلي مع الصالون', 409);
      b.status = 'cancel'; c.feed('إلغاء حجز ' + b.name + ' ' + b.day + ' ' + hhmm(b.start));
    },
    status(c) {
      c.staff(); const { s, d } = c; const b = s.bookings.find((x) => x.id === d.id); if (!b) fail('الحجز مو موجود', 404);
      const to = String(d.to || ''); if (!(FLOW[b.status] || []).includes(to)) fail('ما ينفع تغيّر الحالة كذا', 409);
      b.status = to; b.by = (c.R.staff || {}).name || 'المدير';
      if (to === 'done' && b.cust && s.customers[b.cust] && !b.stamped) { const m = s.customers[b.cust]; m.stamps = (m.stamps || 0) + 1; b.stamped = true; c.feed('زيارة لـ ' + m.name + ' (' + m.stamps + '/' + s.need + ')'); }
    },
    redeem(c) { c.staff(); const m = c.s.customers[c.d.id]; if (!m) fail('العميلة مو موجودة', 404); if ((m.stamps || 0) < c.s.need) fail('ما كملت الزيارات', 409); m.stamps -= c.s.need; m.rewards = (m.rewards || 0) + 1; c.feed('🎁 ' + m.name + ' استلمت هديتها'); },
    service(c) {
      c.owner(); const { s, d } = c; const name = str(d.name, 40), price = money(d.price, 20000), min = int(d.min, 15, 480);
      if (name.length < 2 || !price) fail('اكتب الاسم والسعر'); const cat = s.cats.includes(d.cat) ? d.cat : s.cats[0];
      const v = d.id ? s.services.find((x) => x.id === d.id) : null;
      if (v) Object.assign(v, { name, price, min: Math.round(min / 15) * 15, cat }); else { if (s.services.length >= 80) fail('وصلت الحد', 409); s.services.push({ id: uid('v'), name, price, min: Math.round(min / 15) * 15, cat }); }
    },
    serviceDel(c) { c.owner(); const i = c.s.services.findIndex((x) => x.id === c.d.id); if (i < 0) fail('الخدمة مو موجودة', 404); c.s.services.splice(i, 1); },
    hours(c) { c.owner(); const o = toMin(c.d.open), cl = toMin(c.d.close); if (o == null || cl == null || cl - o < 60) fail('أوقات العمل غير صحيحة'); c.s.hours = { open: o, close: cl, off: (Array.isArray(c.d.off) ? c.d.off : []).map((x) => int(x, 0, 6)).slice(0, 6) }; c.s.need = int(c.d.need || c.s.need, 3, 30); },
  },
};
