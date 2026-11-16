// الموارد البشرية: حضور وانصراف من الجوال + طلبات إجازة + لوحة المدير وتقرير الشهر
// الموظف يدخل برمزه (دور الموظف)، والمدير بكلمة المرور
import { str, int, fail, uid, ksaDay, ksaMin, toMin, hhmm } from '../core.js';
import { strip } from './util.js';

const TYPES = ['سنوية', 'مرضية', 'اضطرارية', 'بدون راتب'];
const workday = (s, day) => s.rules.days.includes(new Date(day + 'T12:00:00Z').getUTCDay());
const daysBetween = (a, b) => { const out = []; for (let t = Date.parse(a); t <= Date.parse(b) && out.length < 60; t += 864e5) out.push(new Date(t).toISOString().slice(0, 10)); return out; };
const onLeave = (s, empId, day) => s.leaves.some((l) => l.emp === empId && l.status === 'approved' && l.from <= day && l.to >= day);

function dayStatus(s, e, day, now) {
  const a = (s.att[day] || {})[e.id];
  if (a && a.in != null) return { st: a.in > s.rules.start + s.rules.grace ? 'late' : 'present', in: a.in, out: a.out ?? null, late: Math.max(0, a.in - s.rules.start) };
  if (onLeave(s, e.id, day)) return { st: 'leave' };
  if (!workday(s, day)) return { st: 'off' };
  if (day === ksaDay(now) && ksaMin(now) < s.rules.start + s.rules.grace) return { st: 'pending' };
  return { st: 'absent' };
}
function month(s, e, ym, now) {
  const rows = [], today = ksaDay(now);
  for (let i = 1; i <= 31; i++) { const day = ym + '-' + String(i).padStart(2, '0'); if (Number.isNaN(Date.parse(day)) || new Date(day + 'T12:00:00Z').getUTCMonth() + 1 !== Number(ym.slice(5)) || day > today) continue; rows.push({ day, ...dayStatus(s, e, day, now) }); }
  const c = (k) => rows.filter((r) => r.st === k).length;
  const hrs = rows.filter((r) => r.in != null && r.out != null).reduce((t, r) => t + (r.out - r.in) / 60, 0);
  return { rows, present: c('present') + c('late'), late: c('late'), absent: c('absent'), leave: c('leave'), hours: Math.round(hrs * 10) / 10, lateMin: rows.reduce((t, r) => t + (r.st === 'late' ? r.late : 0), 0) };
}

export default {
  title: 'نظام حضور وإجازات للموظفين', demoName: 'شركة مدار للتقنية', tagline: 'الحضور والإجازات · من جوال الموظف', color: '#3B4A8C',
  staffExtra: (d) => ({ title: str(d.title, 40), dept: str(d.dept, 30), balance: int(d.balance ?? 21, 0, 90) }),
  seed(now, demo) {
    const s = { rules: { start: 480, end: 960, grace: 15, days: [0, 1, 2, 3, 4] }, att: {}, leaves: [], depts: ['الإدارة', 'المبيعات', 'التقنية', 'العمليات'] };
    if (demo) {
      const E = (id, name, pin, title, dept, balance) => ({ id, name, pin, title, dept, balance });
      s.staff = [E('st0', 'أحمد الشهري', '1234', 'مطوّر واجهات', 'التقنية', 18), E('st1', 'ليان العمري', '2345', 'أخصائية مبيعات', 'المبيعات', 21), E('st2', 'سعود الدوسري', '3456', 'مشرف عمليات', 'العمليات', 9), E('st3', 'هيفاء الغامدي', '4567', 'محاسبة', 'الإدارة', 25), E('st4', 'ناصر البقمي', '5678', 'دعم فني', 'التقنية', 14)];
      // شهر حضور تقريبي
      for (let i = 30; i >= 0; i--) {
        const day = ksaDay(now, -i); if (!workday(s, day)) continue; s.att[day] = {};
        s.staff.forEach((e, j) => {
          if (i === 0) { if (j < 3) s.att[day][e.id] = { in: 470 + j * 11 }; return; }
          const r = (i * 7 + j * 13) % 17; if (r === 0) return;
          s.att[day][e.id] = { in: 465 + ((i * 3 + j * 5) % 30) + (r === 3 ? 25 : 0), out: 960 + ((i + j) % 25) };
        });
      }
      const L = (emp, type, from, to, status, note) => ({ id: uid('l'), emp, type, from, to, days: daysBetween(from, to).length, note, status, at: new Date(now - 3 * 864e5).toISOString() });
      s.leaves = [L('st3', 'سنوية', ksaDay(now, 5), ksaDay(now, 9), 'pending', 'سفر عائلي'), L('st1', 'اضطرارية', ksaDay(now, 1), ksaDay(now, 1), 'pending', 'موعد مستشفى للوالدة'), L('st4', 'سنوية', ksaDay(now, -12), ksaDay(now, -10), 'approved', '')];
    }
    return s;
  },
  view({ s, d, R, now }) {
    const today = ksaDay(now), ym = /^\d{4}-\d{2}$/.test(d.month || '') ? d.month : today.slice(0, 7);
    const base = { rules: { ...s.rules, startT: hhmm(s.rules.start), endT: hhmm(s.rules.end) }, types: TYPES, month: ym };
    if (R.staff && !R.owner) {
      const e = R.staff;
      return { ...base, emp: { ...strip(e, 'pin', 'v'), today: dayStatus(s, e, today, now), month: month(s, e, ym, now), leaves: s.leaves.filter((l) => l.emp === e.id).slice(0, 20) } };
    }
    if (!R.owner) return base;
    const board = s.staff.map((e) => ({ id: e.id, name: e.name, title: e.title, dept: e.dept, balance: e.balance, ...dayStatus(s, e, today, now) }));
    const report = s.staff.map((e) => { const m = month(s, e, ym, now); return { id: e.id, name: e.name, dept: e.dept, present: m.present, late: m.late, absent: m.absent, leave: m.leave, hours: m.hours, lateMin: m.lateMin }; });
    const days = []; for (let i = 13; i >= 0; i--) { const day = ksaDay(now, -i); if (!workday(s, day)) continue; days.push([day, s.staff.filter((e) => ['present', 'late'].includes(dayStatus(s, e, day, now).st)).length]); }
    const detail = d.emp ? s.staff.find((e) => e.id === d.emp) : null;
    return { ...base, depts: s.depts, board, report, days, leaves: s.leaves.slice(0, 100).map((l) => ({ ...l, name: (s.staff.find((e) => e.id === l.emp) || {}).name || '—' })), ...(detail ? { detail: { ...strip(detail, 'pin', 'v'), month: month(s, detail, ym, now) } } : {}) };
  },
  stats(s, now) { const t = ksaDay(now); const n = s.staff.filter((e) => ['present', 'late'].includes(dayStatus(s, e, t, now).st)).length; return [['الموظفين', s.staff.length], ['حاضر اليوم', n], ['إجازات بانتظار الموافقة', s.leaves.filter((l) => l.status === 'pending').length]]; },
  ops: {
    checkin(c) {
      const { s, R, now } = c; if (!R.staff) fail('ادخل برمزك', 401); const day = ksaDay(now);
      if (!workday(s, day)) fail('اليوم مو يوم دوام', 409); s.att[day] = s.att[day] || {};
      if (s.att[day][R.staff.id]) fail('سجّلت حضورك اليوم', 409);
      s.att[day][R.staff.id] = { in: ksaMin(now) };
      for (const k of Object.keys(s.att)) if (k < ksaDay(now, -400)) delete s.att[k];
      c.feed(R.staff.name + ' حضور ' + hhmm(ksaMin(now)));
    },
    checkout(c) {
      const { s, R, now } = c; if (!R.staff) fail('ادخل برمزك', 401); const a = (s.att[ksaDay(now)] || {})[R.staff.id];
      if (!a) fail('سجّل الحضور أول', 409); if (a.out != null) fail('سجّلت انصرافك', 409); a.out = ksaMin(now); c.feed(R.staff.name + ' انصراف ' + hhmm(a.out));
    },
    leave(c) {
      const { s, d, R, now } = c; if (!R.staff) fail('ادخل برمزك', 401);
      const type = TYPES.includes(d.type) ? d.type : null; const from = String(d.from || ''), to = String(d.to || d.from || '');
      if (!type || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || to < from) fail('اختر النوع والتاريخ');
      if (from < ksaDay(now, -30)) fail('التاريخ قديم');
      const days = daysBetween(from, to).filter((x) => workday(s, x)).length; if (!days) fail('الفترة ما فيها أيام دوام');
      if (type === 'سنوية' && days > R.staff.balance) fail('رصيدك ' + R.staff.balance + ' يوم', 409);
      if (s.leaves.some((l) => l.emp === R.staff.id && l.status !== 'rejected' && l.from <= to && l.to >= from)) fail('عندك طلب بنفس الفترة', 409);
      s.leaves = [{ id: uid('l'), emp: R.staff.id, type, from, to, days, note: str(d.note, 160), status: 'pending', at: new Date(now).toISOString() }, ...s.leaves].slice(0, 2000);
      c.feed('طلب إجازة ' + type + ' من ' + R.staff.name);
    },
    cancelLeave(c) { const { s, d, R } = c; const l = s.leaves.find((x) => x.id === d.id && R.staff && x.emp === R.staff.id); if (!l || l.status !== 'pending') fail('ما ينفع', 409); l.status = 'cancelled'; },
    decide(c) {
      c.owner(); const { s, d, now } = c; const l = s.leaves.find((x) => x.id === d.id); if (!l || l.status !== 'pending') fail('الطلب مو بانتظار', 409);
      const e = s.staff.find((x) => x.id === l.emp); l.status = d.ok ? 'approved' : 'rejected'; l.reply = str(d.note, 160); l.decidedAt = new Date(now).toISOString();
      if (d.ok && l.type === 'سنوية' && e) e.balance = Math.max(0, e.balance - l.days);
      c.feed((d.ok ? 'موافقة' : 'رفض') + ' إجازة ' + (e ? e.name : ''));
    },
    fix(c) { // تعديل حضور يوم من المدير (نسي يبصم)
      c.owner(); const { s, d } = c; const e = s.staff.find((x) => x.id === d.emp); const day = String(d.day || ''); if (!e || !/^\d{4}-\d{2}-\d{2}$/.test(day)) fail('بيانات ناقصة');
      const i = toMin(d.in), o = d.out ? toMin(d.out) : null; s.att[day] = s.att[day] || {};
      if (i == null) delete s.att[day][e.id]; else s.att[day][e.id] = { in: i, ...(o != null ? { out: o } : {}), fixed: true };
      c.feed('تعديل حضور ' + e.name + ' ' + day);
    },
    balance(c) { c.owner(); const e = c.s.staff.find((x) => x.id === c.d.emp); if (!e) fail('الموظف مو موجود', 404); e.balance = int(c.d.balance, 0, 90); },
    rules(c) { c.owner(); const st = toMin(c.d.start), en = toMin(c.d.end); if (st == null || en == null || en <= st) fail('أوقات الدوام غير صحيحة'); c.s.rules = { start: st, end: en, grace: int(c.d.grace, 0, 120), days: (Array.isArray(c.d.days) ? c.d.days : []).map((x) => int(x, 0, 6)).filter((x, i, a) => a.indexOf(x) === i) }; },
  },
};
