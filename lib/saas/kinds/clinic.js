// عيادة: حجز موعد مع الطبيب + تسجيل وصول + طابور أرقام حي وشاشة انتظار
// الخصوصية: الشاشة العامة تعرض الأرقام بس، بدون أسماء
import { str, int, money, fail, uid, ksaDay, ksaMin, freeSlots, nextDays, toMin, hhmm, cleanPhone, phoneOk } from '../core.js';
import { newKey, mine, strip, sum, top, lastDays, rng, pastAt } from './util.js';

const doc = (id, name, spec, fee, dur, open, close) => ({ id, name, spec, fee, dur, open, close, off: [5], on: true });
const busyOf = (s, docId, day) => s.appts.filter((a) => a.doctor === docId && a.day === day && !['cancel', 'noshow'].includes(a.status)).map((a) => [a.start, a.start + a.dur]);

function queueSummary(s, now) {
  const day = ksaDay(now), q = s.queue.filter((x) => x.day === day);
  return s.doctors.filter((d) => d.on).map((d) => {
    const mineQ = q.filter((x) => x.doctor === d.id);
    const called = mineQ.filter((x) => x.status === 'called' || x.status === 'in').sort((a, b) => (b.calledAt || '').localeCompare(a.calledAt || ''))[0];
    const served = mineQ.filter((x) => x.doneAt && x.calledAt).map((x) => (Date.parse(x.doneAt) - Date.parse(x.calledAt)) / 60e3);
    return { id: d.id, name: d.name, spec: d.spec, now: called ? called.no : null, nowStatus: called ? called.status : null, waiting: mineQ.filter((x) => x.status === 'waiting').length, avg: served.length ? Math.max(5, Math.round(sum(served, (x) => x) / served.length)) : d.dur };
  });
}

export default {
  title: 'مواعيد وطابور انتظار للعيادات', demoName: 'عيادات رُقيّة', tagline: 'رعاية قريبة منك · احجز وتابع دورك من جوالك', color: '#1F6F78',
  publicStaff: null,
  seed(now, demo) {
    const s = { doctors: [doc('d1', 'د. سلمان العتيبي', 'طب عام', 150, 20, 960, 1320), doc('d2', 'د. ريم القحطاني', 'جلدية', 300, 30, 1020, 1320), doc('d3', 'د. ماجد الزهراني', 'أسنان', 200, 30, 960, 1260)], appts: [], queue: [], seq: {}, selfQueue: true };
    if (demo) {
      s.staff = [{ id: 'st0', name: 'استقبال - هند', pin: '1234' }];
      const day = ksaDay(now), nm = ksaMin(now);
      for (const d of s.doctors) { d.open = Math.min(d.open, Math.max(480, Math.floor(nm / 60) * 60 - 120)); d.close = Math.max(d.close, Math.min(1410, nm + 240)); }
      const t = (m) => new Date(now - m * 60e3).toISOString();
      const names = ['عبدالله', 'سارة', 'محمد', 'نوف', 'تركي', 'أمل', 'بدر', 'غادة'];
      let k = 0;
      for (const d of s.doctors) {
        s.seq[day + d.id] = 0;
        const add = (status, m) => { s.seq[day + d.id]++; s.queue.push({ id: uid('q'), key: newKey(), day, doctor: d.id, no: d.id.slice(1) + String(s.seq[day + d.id]).padStart(2, '0'), name: names[k++ % names.length], status, at: t(m + 15), ...(status !== 'waiting' ? { calledAt: t(m) } : {}), ...(status === 'done' ? { doneAt: t(m - 14) } : {}) }); };
        add('done', 55); add('done', 35); add('in', 12); add('waiting', 0); add('waiting', 0);
      }
      const ap = (docId, start, name) => ({ id: uid('a'), key: newKey(), doctor: docId, day, start, dur: s.doctors.find((x) => x.id === docId).dur, name, phone: '0500000000', reason: 'مراجعة', status: 'booked', at: t(600) });
      const r = rng(5);
      for (let a = 6; a >= 1; a--) for (let k = 0, n = 18 + Math.floor(r() * 14); k < n; k++) { const dd = s.doctors[k % 3], at = 960 + Math.floor(r() * 300), w = 5 + Math.floor(r() * 25);
        s.queue.push({ id: uid('q'), key: newKey(), day: ksaDay(now, -a), doctor: dd.id, no: dd.id.slice(1) + String(k + 1).padStart(2, '0'), name: names[k % 8], status: 'done', at: pastAt(now, a, at), calledAt: pastAt(now, a, at + w), doneAt: pastAt(now, a, at + w + dd.dur) }); }
      s.appts = [ap('d1', Math.ceil((nm + 40) / 20) * 20, 'خالد'), ap('d2', Math.ceil((nm + 60) / 30) * 30, 'منيرة')];
    }
    return s;
  },
  view({ s, d, R, now }) {
    const days = nextDays(now, 14), day = ksaDay(now);
    const myQ = mine(s.queue.filter((x) => x.day === day), d, R).map((x) => { const ahead = s.queue.filter((y) => y.day === day && y.doctor === x.doctor && y.status === 'waiting' && y.at < x.at).length; return { ...strip(x, 'key', 'phone'), ahead }; });
    const base = { doctors: s.doctors.filter((x) => x.on || R.owner), days, selfQueue: s.selfQueue, board: queueSummary(s, now), myQueue: myQ, mine: mine(s.appts, d, R).slice(0, 10).map((a) => strip(a, 'key', 'phone')) };
    if (d.slots) { const doc = s.doctors.find((x) => x.id === d.slots.doctor && x.on); const dd = String(d.slots.day || ''); base.slots = doc && days.includes(dd) ? freeSlots({ day: dd, open: doc.open, close: doc.close, step: doc.dur, dur: doc.dur, busy: busyOf(s, doc.id, dd), now, offDays: doc.off }) : []; }
    if (!R.staff && !R.owner) return base;
    const out = { ...base, queue: s.queue.filter((x) => x.day === day).map((x) => strip(x, 'key')), appts: s.appts.filter((a) => a.day >= day).slice(0, 300).map((a) => strip(a, 'key')) };
    if (R.owner) {
      const q = s.queue.filter((x) => x.day === day), done = q.filter((x) => x.status === 'done');
      const waits = q.filter((x) => x.calledAt).map((x) => (Date.parse(x.calledAt) - Date.parse(x.at)) / 60e3);
      const wk = s.appts.filter((a) => a.day >= ksaDay(now, -6) && a.day <= day);
      out.stats = { patients: q.length, done: done.length, avgWait: waits.length ? Math.round(sum(waits, (x) => x) / waits.length) : 0, revenue: sum(done, (x) => (s.doctors.find((y) => y.id === x.doctor) || {}).fee),
        noshow: wk.length ? Math.round(100 * wk.filter((a) => a.status === 'noshow').length / wk.length) : 0, perDoctor: s.doctors.map((x) => [x.name, q.filter((y) => y.doctor === x.id).length]),
        days: lastDays(now, 7).map((k) => [k, s.queue.filter((x) => x.day === k).length]) };
    }
    return out;
  },
  stats(s, now) { const q = s.queue.filter((x) => x.day === ksaDay(now)); return [['مراجعين اليوم', q.length], ['بالانتظار الحين', q.filter((x) => x.status === 'waiting').length], ['مواعيد قادمة', s.appts.filter((a) => a.day >= ksaDay(now) && a.status === 'booked').length]]; },
  ops: {
    book(c) {
      const { s, d, now } = c; const doc = s.doctors.find((x) => x.id === d.doctor && x.on); if (!doc) fail('اختر الطبيب');
      const day = String(d.day || ''); if (!nextDays(now, 14).includes(day)) fail('اختر اليوم');
      const free = freeSlots({ day, open: doc.open, close: doc.close, step: doc.dur, dur: doc.dur, busy: busyOf(s, doc.id, day), now, offDays: doc.off });
      if (!free.includes(d.time)) fail('الوقت انحجز، اختر وقت ثاني', 409);
      const phone = cleanPhone(d.phone); if (!phoneOk(phone)) fail('رقم الجوال لازم يبدأ بـ 05'); const name = str(d.name, 40); if (name.length < 2) fail('اكتب اسم المراجع');
      if (s.appts.filter((a) => a.phone === phone && a.status === 'booked' && a.day >= ksaDay(now)).length >= 3) fail('عندك ٣ مواعيد قادمة', 409);
      const a = { id: uid('a'), key: newKey(), doctor: doc.id, day, start: toMin(d.time), dur: doc.dur, name, phone, reason: str(d.reason, 80), status: 'booked', at: new Date(now).toISOString() };
      s.appts = [a, ...s.appts].slice(0, 3000); c.feed('موعد ' + doc.name + ' · ' + day + ' ' + d.time);
      return { issued: { appt: a.id, key: a.key } };
    },
    cancel(c) {
      const { s, d, R } = c; const a = s.appts.find((x) => x.id === d.id); if (!a) fail('الموعد مو موجود', 404);
      if (!mine([a], d, R).length && !R.staff && !R.owner) fail('غير مسموح', 403); if (a.status !== 'booked') fail('ما ينفع إلغاؤه', 409);
      a.status = 'cancel'; c.feed('إلغاء موعد ' + a.day + ' ' + hhmm(a.start));
    },
    ticket(c) { // رقم انتظار: المراجع من جواله (لو مسموح) أو الاستقبال
      const { s, d, R, now } = c; const day = ksaDay(now);
      if (!R.staff && !R.owner && !s.selfQueue) fail('خذ رقمك من الاستقبال', 403);
      const doc = s.doctors.find((x) => x.id === d.doctor && x.on); if (!doc) fail('اختر الطبيب');
      let appt = null;
      if (d.appt) { appt = s.appts.find((x) => x.id === d.appt && x.day === day && x.status === 'booked'); if (!appt || (!R.staff && !R.owner && !mine([appt], d, R).length)) fail('الموعد مو موجود اليوم', 404); }
      const q = s.queue.filter((x) => x.day === day);
      if (q.filter((x) => x.status === 'waiting').length >= 120) fail('الطابور ممتلئ', 409);
      const name = str(d.name || (appt && appt.name), 40); if (name.length < 2) fail('اكتب الاسم');
      s.seq[day + doc.id] = (s.seq[day + doc.id] || 0) + 1;
      for (const k of Object.keys(s.seq)) if (k.slice(0, 10) < ksaDay(now, -2)) delete s.seq[k];
      const t = { id: uid('q'), key: newKey(), day, doctor: doc.id, no: doc.id.replace(/\D/g, '').slice(-1) + String(s.seq[day + doc.id]).padStart(2, '0'), name, appt: appt ? appt.id : null, status: 'waiting', at: new Date(now).toISOString() };
      if (appt) { appt.status = 'checked'; t.at = new Date(now - 10 * 60e3).toISOString(); } // صاحب الموعد له أولوية بسيطة
      s.queue = [...s.queue.filter((x) => x.day >= ksaDay(now, -7)), t];
      c.feed('رقم ' + t.no + ' · ' + doc.name);
      return { issued: { ticket: t.id, key: t.key } };
    },
    call(c) { // نداء الرقم التالي للطبيب
      c.staff(); const { s, d, now } = c; const day = ksaDay(now);
      for (const x of s.queue) if (x.day === day && x.doctor === d.doctor && x.status === 'called') { x.status = 'skip'; }
      const next = s.queue.filter((x) => x.day === day && x.doctor === d.doctor && x.status === 'waiting').sort((a, b) => a.at.localeCompare(b.at))[0];
      if (!next) fail('ما فيه أحد بالانتظار', 409);
      for (const x of s.queue) if (x.day === day && x.doctor === d.doctor && x.status === 'in') { x.status = 'done'; x.doneAt = new Date(now).toISOString(); }
      next.status = 'called'; next.calledAt = new Date(now).toISOString(); c.feed('نداء ' + next.no);
    },
    qstatus(c) {
      c.staff(); const { s, d, now } = c; const x = s.queue.find((y) => y.id === d.id); if (!x) fail('الرقم مو موجود', 404);
      const to = String(d.to || ''), ok = { called: ['in', 'skip', 'waiting'], in: ['done'], skip: ['waiting'] };
      if (!(ok[x.status] || []).includes(to)) fail('ما ينفع', 409);
      x.status = to; if (to === 'done') x.doneAt = new Date(now).toISOString(); if (to === 'waiting') x.at = new Date(now).toISOString();
      if (to === 'done' && x.appt) { const a = s.appts.find((y) => y.id === x.appt); if (a) a.status = 'done'; }
    },
    apptStatus(c) { c.staff(); const a = c.s.appts.find((x) => x.id === c.d.id); if (!a) fail('الموعد مو موجود', 404); if (!['noshow', 'cancel'].includes(c.d.to) || a.status !== 'booked') fail('ما ينفع', 409); a.status = c.d.to; },
    doctor(c) {
      c.owner(); const { s, d } = c; const name = str(d.name, 40), spec = str(d.spec, 30), fee = money(d.fee, 5000), dur = int(d.dur, 10, 120), open = toMin(d.open), close = toMin(d.close);
      if (name.length < 3 || open == null || close == null || close - open < dur) fail('بيانات الطبيب ناقصة');
      const off = (Array.isArray(d.off) ? d.off : []).map((x) => int(x, 0, 6)).slice(0, 6);
      const x = d.id ? s.doctors.find((y) => y.id === d.id) : null;
      if (x) Object.assign(x, { name, spec, fee, dur, open, close, off, on: d.on !== false }); else { if (s.doctors.length >= 9) fail('الحد ٩ أطباء', 409); const ids = s.doctors.map((y) => y.id); let i = 1; while (ids.includes('d' + i)) i++; s.doctors.push({ id: 'd' + i, name, spec, fee, dur, open, close, off, on: true }); }
    },
    settings(c) { c.owner(); c.s.selfQueue = !!c.d.selfQueue; },
  },
};
