// خدمة ما بعد البيع للمطورين العقاريين: مالك الوحدة يرفع طلب صيانة ويتابعه، المدير يوزّع على الفنيين ويقيس الأداء
import { str, text, int, fail, uid, ksaDay, randomDigits } from '../core.js';
import { strip, sum, top, lastDays, myCard } from './util.js';

const CATS = ['سباكة', 'كهرباء', 'تكييف', 'دهانات وتشطيبات', 'أبواب ونوافذ', 'عزل وتسربات', 'أخرى'];
const ST = { new: 'جديد', assigned: 'تم التعيين', visit: 'الفني في الطريق', done: 'تم الإصلاح', closed: 'مغلق', rejected: 'مرفوض' };
const inWarranty = (c, now) => c && c.until && Date.parse(c.until) > now;
const hours = (a, b) => (Date.parse(b) - Date.parse(a)) / 3600e3;

export default {
  title: 'بوابة ما بعد البيع والصيانة للمطورين العقاريين', demoName: 'تطوير دار الأفق', tagline: 'خدمة ما بعد البيع · ضمانك محفوظ وطلبك متابع', color: '#2F4858',
  staffExtra: (d) => ({ role: str(d.role, 30) || 'فني' }),
  seed(now, demo) {
    const s = { cats: CATS, tickets: [], counter: 1000, sla: 48 };
    if (demo) {
      s.staff = [{ id: 'st0', name: 'م. فهد', pin: '1234', role: 'فني تكييف وكهرباء' }, { id: 'st1', name: 'أبو سعد', pin: '2345', role: 'فني سباكة' }];
      const t = (h) => new Date(now - h * 3600e3).toISOString(), y = (n) => new Date(now + n * 365 * 864e5).toISOString().slice(0, 10);
      const u = (id, name, phone, code, unit, project, handover, until) => ({ id, v: 1, name, phone, code, unit, project, handover, until, at: t(9000) });
      s.customers = { cDEMO1: u('cDEMO1', 'عبدالعزيز الحربي', '0501112233', '1111', 'A-12', 'أفق الشاطئ', y(-1), y(1)), cDEMO2: u('cDEMO2', 'منيرة السبيعي', '0554445566', '2222', 'B-04', 'أفق الشاطئ', y(-2.5), y(-0.5)), cDEMO3: u('cDEMO3', 'ياسر المطيري', '0567778899', '3333', 'C-21', 'أفق الحديقة', y(-0.3), y(1.7)) };
      const tk = (no, cust, cat, desc, status, h, tech, rating) => {
        const tl = [{ at: t(h), text: 'تم استلام الطلب' }];
        if (tech) tl.push({ at: t(h - 2), text: 'تم التعيين للفني ' + (tech === 'st0' ? 'م. فهد' : 'أبو سعد') });
        if (status === 'done' || status === 'closed') tl.push({ at: t(h - 20), text: 'تم الإصلاح' });
        return { id: uid('k'), no, cust, unit: s.customers[cust].unit, project: s.customers[cust].project, name: s.customers[cust].name, cat, desc, prefer: 'مساءً', urgent: false, warranty: inWarranty(s.customers[cust], now), status, tech: tech || null, timeline: tl, at: t(h), ...(status === 'done' || status === 'closed' ? { doneAt: t(h - 20) } : {}), ...(rating ? { rating } : {}) };
      };
      s.tickets = [tk(1007, 'cDEMO1', 'تكييف', 'المكيف في غرفة النوم ما يبرد ويطلع صوت', 'assigned', 5, 'st0'), tk(1006, 'cDEMO3', 'سباكة', 'تسريب بسيط تحت مغسلة المطبخ', 'new', 2),
        tk(1005, 'cDEMO1', 'كهرباء', 'فيش الصالة ما يشتغل', 'closed', 60, 'st0', { stars: 5, note: 'سريعين ومرتبين' }), tk(1004, 'cDEMO2', 'دهانات وتشطيبات', 'تشققات في دهان الممر', 'rejected', 100),
        tk(1003, 'cDEMO3', 'أبواب ونوافذ', 'باب البلكونة يعلق', 'done', 30, 'st1')];
      s.counter = 1007;
    }
    return s;
  },
  view({ s, R, now }) {
    const mineT = s.tickets.filter((k) => R.cust.has(k.cust)).slice(0, 30);
    const base = { cats: s.cats, statusNames: ST, sla: s.sla, cards: myCard(s, R).map((c) => ({ ...c, warranty: inWarranty(c, now) })), mine: mineT };
    if (!R.staff && !R.owner) return base;
    const list = R.owner ? s.tickets : s.tickets.filter((k) => k.tech === R.staff.id || k.status === 'new');
    const out = { ...base, tickets: list.slice(0, 300), units: R.owner ? Object.values(s.customers).map((c) => ({ ...strip(c, 'v'), warranty: inWarranty(c, now), open: s.tickets.filter((k) => k.cust === c.id && !['closed', 'rejected', 'done'].includes(k.status)).length })) : [] };
    if (R.owner) {
      const closed = s.tickets.filter((k) => k.doneAt);
      const res = closed.map((k) => hours(k.at, k.doneAt));
      const rated = s.tickets.filter((k) => k.rating);
      const open = s.tickets.filter((k) => ['new', 'assigned', 'visit'].includes(k.status));
      const soon = Object.values(s.customers).filter((c) => c.until && Date.parse(c.until) > now && Date.parse(c.until) - now < 60 * 864e5);
      out.stats = { open: open.length, late: open.filter((k) => hours(k.at, new Date(now).toISOString()) > s.sla).length, avgHours: res.length ? Math.round(sum(res, (x) => x) / res.length) : 0,
        sat: rated.length ? Math.round(10 * sum(rated, (k) => k.rating.stars) / rated.length) / 10 : 0, byCat: top(s.tickets, (k) => k.cat, 7), perTech: s.staff.map((x) => [x.name, open.filter((k) => k.tech === x.id).length, closed.filter((k) => k.tech === x.id).length]),
        expiring: soon.map((c) => ({ unit: c.unit, name: c.name, until: c.until })), days: lastDays(now, 7).map((k) => [k, s.tickets.filter((x) => ksaDay(Date.parse(x.at)) === k).length]) };
    }
    return out;
  },
  stats(s) { const open = s.tickets.filter((k) => ['new', 'assigned', 'visit'].includes(k.status)); return [['طلبات مفتوحة', open.length], ['طلبات جديدة', s.tickets.filter((k) => k.status === 'new').length], ['الوحدات المسجلة', Object.keys(s.customers).length]]; },
  ops: {
    request(c) {
      const { s, d, R, now } = c; const cust = [...R.cust][0]; if (!cust) fail('ادخل بحساب وحدتك', 401);
      const u = s.customers[cust]; const cat = CATS.includes(d.cat) ? d.cat : null; const desc = text(d.desc, 500);
      if (!cat || desc.length < 8) fail('اختر نوع المشكلة واكتب وصف واضح');
      if (s.tickets.filter((k) => k.cust === cust && ['new', 'assigned', 'visit'].includes(k.status)).length >= 5) fail('عندك ٥ طلبات مفتوحة', 409);
      s.counter += 1;
      const k = { id: uid('k'), no: s.counter, cust, unit: u.unit, project: u.project, name: u.name, cat, desc, prefer: str(d.prefer, 30), urgent: !!d.urgent, warranty: inWarranty(u, now), status: 'new', tech: null, timeline: [{ at: new Date(now).toISOString(), text: 'تم استلام الطلب' }], at: new Date(now).toISOString() };
      s.tickets = [k, ...s.tickets].slice(0, 3000); c.feed('طلب صيانة #' + k.no + ' · ' + cat + ' · ' + u.unit + (k.urgent ? ' · عاجل' : ''));
      return { issued: { ticket: k.id } };
    },
    rate(c) {
      const { s, d, R } = c; const k = s.tickets.find((x) => x.id === d.id && R.cust.has(x.cust)); if (!k) fail('الطلب مو موجود', 404);
      if (k.status !== 'done' || k.rating) fail('التقييم بعد الإصلاح ومرة وحدة', 409);
      k.rating = { stars: int(d.stars, 1, 5), note: str(d.note, 200) }; k.status = 'closed'; k.timeline.push({ at: new Date(c.now).toISOString(), text: 'العميل قيّم ' + k.rating.stars + ' من ٥ وأُغلق الطلب' });
      c.feed('تقييم #' + k.no + ': ' + k.rating.stars + '/5');
    },
    reopen(c) {
      const { s, d, R } = c; const k = s.tickets.find((x) => x.id === d.id && R.cust.has(x.cust)); if (!k || k.status !== 'done') fail('ما ينفع', 409);
      k.status = 'assigned'; k.timeline.push({ at: new Date(c.now).toISOString(), text: 'العميل أفاد إن المشكلة ما انحلّت: ' + str(d.note, 120) }); c.feed('إعادة فتح #' + k.no);
    },
    assign(c) {
      c.owner(); const { s, d } = c; const k = s.tickets.find((x) => x.id === d.id); if (!k) fail('الطلب مو موجود', 404);
      const tech = s.staff.find((x) => x.id === d.tech); if (!tech) fail('اختر الفني'); if (['closed', 'rejected'].includes(k.status)) fail('الطلب مغلق', 409);
      k.tech = tech.id; k.status = 'assigned'; k.timeline.push({ at: new Date(c.now).toISOString(), text: 'تم التعيين للفني ' + tech.name + (d.when ? ' · الموعد ' + str(d.when, 40) : '') });
    },
    reject(c) {
      c.owner(); const k = c.s.tickets.find((x) => x.id === c.d.id); if (!k || !['new', 'assigned'].includes(k.status)) fail('ما ينفع', 409);
      const why = str(c.d.note, 160); if (why.length < 4) fail('اكتب السبب للعميل'); k.status = 'rejected'; k.timeline.push({ at: new Date(c.now).toISOString(), text: 'مرفوض: ' + why });
    },
    progress(c) {
      c.staff(); const { s, d, R, now } = c; const k = s.tickets.find((x) => x.id === d.id); if (!k) fail('الطلب مو موجود', 404);
      if (R.staff && !R.owner && k.tech !== R.staff.id) fail('الطلب مو لك', 403);
      const to = String(d.to || ''), ok = { assigned: ['visit', 'done'], visit: ['done'] }; if (!(ok[k.status] || []).includes(to)) fail('ما ينفع', 409);
      k.status = to; if (to === 'done') k.doneAt = new Date(now).toISOString();
      k.timeline.push({ at: new Date(now).toISOString(), text: ST[to] + (d.note ? ' · ' + str(d.note, 160) : '') + ' · ' + ((R.staff || {}).name || 'الإدارة') });
      c.feed('#' + k.no + ' ' + ST[to]);
    },
    async unit(c) {
      c.owner(); const { s, d, now } = c; const unit = str(d.unit, 20), project = str(d.project, 40); if (unit.length < 1 || project.length < 2) fail('اكتب رقم الوحدة والمشروع');
      const handover = /^\d{4}-\d{2}-\d{2}$/.test(d.handover) ? d.handover : ksaDay(now); const months = int(d.months || 12, 0, 240);
      const until = new Date(Date.parse(handover) + months * 30.44 * 864e5).toISOString().slice(0, 10);
      const m = c.newCustomer({ name: d.name, phone: d.phone, extra: { unit, project, handover, until } });
      c.feed('وحدة جديدة ' + unit + ' · ' + project);
      return { created: { name: m.name, phone: m.phone, code: m.code, unit } };
    },
    unitCode(c) { c.owner(); const m = c.s.customers[c.d.id]; if (!m) fail('الوحدة مو موجودة', 404); m.code = randomDigits(4); m.v = (m.v || 1) + 1; return { created: { name: m.name, phone: m.phone, code: m.code, unit: m.unit } }; },
    settings(c) { c.owner(); c.s.sla = int(c.d.sla, 4, 240); },
  },
};
