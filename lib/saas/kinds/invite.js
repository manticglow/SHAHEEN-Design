// دعوات إلكترونية للمناسبات: لكل ضيف رابط شخصي فيه دعوته وتأكيد الحضور وباركود الدخول
//   الضيف: يفتح رابطه /s/<slug>#g=<id>.<key> ← يأكد حضوره وعدد المرافقين ← يطلع له باركود الدخول
//   الاستقبال (موظف برمز): يمسح الباركود عند الباب، والنظام يمنع الدخول المكرر
//   صاحب المناسبة: قائمة الضيوف، إرسال الدعوات بالواتساب، الردود والحضور لحظيًا
import { str, text, int, fail, uid, ksaDay, cleanPhone, phoneOk, mask, same, safeUrl } from '../core.js';
import { newKey, sum } from './util.js';

const THEMES = ['gold', 'night', 'rose', 'sage'];
const TYPES = ['زواج', 'ملكة', 'خطوبة', 'تخرج', 'مولود', 'افتتاح', 'فعالية', 'عشاء'];
const DAY = /^\d{4}-\d{2}-\d{2}$/, TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const startOf = (e) => Date.parse(e.date + 'T' + (e.time || '20:00') + ':00+03:00');
const DEMO_G = { id: 'gDEMO', key: 'DEMOGUEST2026' };

// الضيف يثبت نفسه بالمعرف والمفتاح اللي في رابطه
function guestOf(s, d) {
  const g = Array.isArray(d.guest) ? d.guest : [];
  const x = s.guests.find((y) => y.id === String(g[0] || ''));
  return x && same(x.key, String(g[1] || '')) ? x : null;
}
const pubGuest = (g) => ({ id: g.id, name: g.name, seats: g.seats, group: g.group, rsvp: g.rsvp, coming: g.coming, inAt: g.inAt || null, inCount: g.inCount || 0 });
const staffGuest = (g) => ({ ...pubGuest(g), phone: mask(g.phone), opened: !!g.openedAt, sent: !!g.sentAt });
function counts(s) {
  const G = s.guests, yes = G.filter((g) => g.rsvp === 'yes');
  return {
    invited: G.length, seats: sum(G, (g) => g.seats), yes: yes.length, coming: sum(yes, (g) => g.coming || g.seats),
    no: G.filter((g) => g.rsvp === 'no').length, pending: G.filter((g) => g.rsvp === 'pending').length,
    opened: G.filter((g) => g.openedAt).length, sent: G.filter((g) => g.sentAt).length,
    inGuests: G.filter((g) => g.inAt).length, inPeople: sum(G, (g) => g.inCount || 0),
  };
}
function cleanGuest(d, demo) {
  const name = str(d.name, 50); if (name.length < 2) fail('اكتب اسم الضيف');
  const phone = cleanPhone(d.phone); if (d.phone && !phoneOk(phone)) fail('رقم الجوال لازم يبدأ بـ 05 ومن ١٠ أرقام');
  return { name, phone: phone || '', seats: int(d.seats || 1, 1, demo ? 6 : 20), group: str(d.group, 30) };
}

export default {
  title: 'دعوات إلكترونية وباركود دخول للمناسبات', demoName: 'زواج فيصل وريم', tagline: 'بحضوركم تكتمل فرحتنا', color: '#9A7B4F',
  seed(now, demo) {
    const event = { type: 'زواج', title: 'حفل زواج', hosts: '', host1: '', host2: '', date: ksaDay(now, 30), time: '21:00', venue: '', city: 'جدة', mapUrl: '', note: '', theme: 'gold', deadline: '', invite: 'بكل الحب والتقدير ندعوكم لمشاركتنا فرحتنا' };
    const s = { event, guests: [], groups: ['أهل العريس', 'أهل العروس', 'الأصدقاء'] };
    if (!demo) return s;
    Object.assign(event, { title: 'حفل زواج', host1: 'فيصل', host2: 'ريم', date: ksaDay(now), time: '21:00', venue: 'قاعة الياقوت للاحتفالات', city: 'جدة', mapUrl: 'https://maps.google.com/?q=Jeddah', note: 'يُرجى عدم اصطحاب الأطفال · التصوير ممنوع داخل القاعة', deadline: '' });
    s.staff = [{ id: 'st0', name: 'استقبال البوابة', pin: '1234' }];
    const names = ['أم فيصل العتيبي', 'نورة السبيعي', 'هيفاء القحطاني', 'منيرة الشهري', 'سارة الحربي', 'العنود الدوسري', 'ريما الزهراني', 'دانة الغامدي', 'أمل المطيري', 'وعد العنزي', 'لطيفة الشمري', 'جواهر المالكي', 'شهد البقمي', 'ديما الرشيدي', 'رهف السلمي', 'أروى الجهني', 'بشاير الثبيتي', 'منال العمري', 'غادة الحارثي', 'هند الأحمدي', 'مشاعل القرني', 'تهاني الشهراني', 'ابتسام الفيفي', 'خلود العصيمي', 'نجلاء المحمدي', 'مها الرويلي', 'سلمى الخالدي', 'عبير الزهراني', 'أسماء البلوي', 'ندى اليامي'];
    const st = ['yes', 'yes', 'yes', 'no', 'yes', 'pending', 'yes', 'yes', 'pending', 'yes'];
    names.forEach((n, i) => {
      const seats = 1 + (i % 4), rsvp = st[i % st.length], g = { id: 'g' + i, key: newKey(), name: n, phone: '05' + String(50000000 + i * 1234567).slice(0, 8), seats, group: s.groups[i % 3], rsvp, coming: rsvp === 'yes' ? Math.max(1, seats - (i % 2)) : 0, at: new Date(now - (20 - (i % 10)) * 86400e3).toISOString(), sentAt: new Date(now - 9 * 86400e3).toISOString(), openedAt: i % 7 === 5 ? null : new Date(now - (8 - (i % 6)) * 86400e3).toISOString(), inAt: null, inCount: 0 };
      if (rsvp === 'yes' && i % 3 === 0) { g.inAt = new Date(now - (40 - i) * 60e3).toISOString(); g.inCount = g.coming; }
      s.guests.push(g);
    });
    s.guests.unshift({ id: DEMO_G.id, key: DEMO_G.key, name: 'ضيف التجربة', phone: '0500000000', seats: 3, group: 'الأصدقاء', rsvp: 'pending', coming: 0, at: new Date(now).toISOString(), sentAt: new Date(now).toISOString(), openedAt: null, inAt: null, inCount: 0 });
    s.feed = [{ at: new Date(now - 6e5).toISOString(), text: 'دخلت نورة السبيعي (+١)' }, { at: new Date(now - 36e5).toISOString(), text: 'أكدت منال العمري حضور ٢' }];
    return s;
  },
  view({ s, d, R, t, now }) {
    const e = s.event, g = guestOf(s, d);
    const base = { event: { ...e, hosts: [e.host1, e.host2].filter(Boolean).join(' و') }, types: TYPES, themes: THEMES, starts: new Date(startOf(e)).toISOString(), closed: now > startOf(e) + 6 * 3600e3 };
    if (g) base.guest = { ...pubGuest(g), qr: 'SDI:' + g.id + '.' + g.key };
    if (t.demo && !g && !R.owner && !R.staff) base.demoGuest = [DEMO_G.id, DEMO_G.key];
    if (R.owner) return { ...base, guests: s.guests.map((x) => ({ ...staffGuest(x), phone: x.phone, key: x.key, at: x.at })), groups: s.groups, stats: counts(s), log: (s.log || []).slice(0, 40) };
    if (R.staff) return { ...base, guests: s.guests.map(staffGuest), stats: counts(s), log: (s.log || []).slice(0, 25) };
    return base;
  },
  stats(s) { const c = counts(s); return [['المدعوين', c.invited], ['أكدوا الحضور', c.coming + ' شخص'], ['دخلوا', c.inPeople]]; },
  ops: {
    open(c) { const g = guestOf(c.s, c.d); if (g && !g.openedAt) g.openedAt = new Date(c.now).toISOString(); },
    rsvp(c) {
      const { s, d, now } = c, g = guestOf(s, d); if (!g) fail('رابط الدعوة غير صحيح', 403);
      if (now > startOf(s.event)) fail('بدأت المناسبة، ما يمديك تغيّر الرد', 409);
      if (s.event.deadline && DAY.test(s.event.deadline) && ksaDay(now) > s.event.deadline) fail('انتهى وقت تأكيد الحضور', 409);
      if (g.inAt) fail('سجّلت دخولك من قبل', 409);
      const yes = d.answer === 'yes', n = yes ? int(d.coming || g.seats, 1, g.seats) : 0;
      const changed = g.rsvp !== (yes ? 'yes' : 'no') || g.coming !== n;
      g.rsvp = yes ? 'yes' : 'no'; g.coming = n; g.openedAt = g.openedAt || new Date(now).toISOString(); g.rsvpAt = new Date(now).toISOString();
      if (changed) c.feed(yes ? `أكد ${g.name} حضور ${n}` : `اعتذر ${g.name}`);
    },
    // الباب: مسح الباركود أو اختيار الضيف من القائمة
    checkin(c) {
      c.staff(); const { s, d, now } = c;
      let g = null; const code = String(d.code || '').trim();
      if (code) { const m = /^SDI:([A-Za-z0-9]{2,20})\.([A-Za-z0-9]{6,20})$/.exec(code); g = m && s.guests.find((x) => x.id === m[1] && same(x.key, m[2])); if (!g) return { scan: { result: 'bad' } }; }
      else { g = s.guests.find((x) => x.id === String(d.id || '')); if (!g) fail('الضيف مو موجود', 404); }
      if (g.inAt && !d.more) return { scan: { result: 'dup', guest: staffGuest(g) } };
      if (g.rsvp === 'no' && !d.force) return { scan: { result: 'declined', guest: staffGuest(g) } };
      const left = g.seats - (g.inCount || 0); if (left <= 0) return { scan: { result: 'full', guest: staffGuest(g) } };
      const n = int(d.n || (g.inAt ? 1 : (g.coming || g.seats)), 1, left);
      g.inCount = (g.inCount || 0) + n; g.inAt = g.inAt || new Date(now).toISOString(); if (g.rsvp !== 'yes') { g.rsvp = 'yes'; g.coming = Math.max(g.coming || 0, g.inCount); }
      const who = c.R.staff ? c.R.staff.name : 'المدير';
      s.log = [{ at: new Date(now).toISOString(), id: g.id, name: g.name, n, by: who }, ...(s.log || [])].slice(0, 300);
      c.feed(`دخل ${g.name}${n > 1 ? ' (+' + (n - 1) + ')' : ''}`);
      return { scan: { result: 'ok', n, guest: staffGuest(g) } };
    },
    checkout(c) { c.owner(); const g = c.s.guests.find((x) => x.id === c.d.id); if (!g) fail('الضيف مو موجود', 404); g.inAt = null; g.inCount = 0; },
    sent(c) { c.staff(); const g = c.s.guests.find((x) => x.id === c.d.id); if (!g) fail('الضيف مو موجود', 404); g.sentAt = g.sentAt || new Date(c.now).toISOString(); },
    guest(c) {
      c.owner(); const { s, d, now, demo } = c, rec = cleanGuest(d, demo);
      if (rec.phone && s.guests.some((x) => x.phone === rec.phone && x.id !== d.id)) fail('الرقم مضاف لضيف ثاني', 409);
      if (rec.group && !s.groups.includes(rec.group) && s.groups.length < 12) s.groups.push(rec.group);
      const g = d.id ? s.guests.find((x) => x.id === d.id) : null;
      if (g) { Object.assign(g, rec); if (g.coming > g.seats) g.coming = g.seats; return; }
      if (s.guests.length >= (demo ? 120 : 2000)) fail(demo ? 'التجربة امتلت، ترجع لبدايتها بكرة' : 'وصلت الحد', 409);
      s.guests.push({ id: uid('g'), key: newKey(), ...rec, rsvp: 'pending', coming: 0, at: new Date(now).toISOString(), sentAt: null, openedAt: null, inAt: null, inCount: 0 });
    },
    // إضافة جماعية: كل سطر "الاسم، الجوال، عدد المقاعد"
    bulk(c) {
      c.owner(); const { s, d, now, demo } = c; const lines = text(d.text, 30000).split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 400);
      if (!lines.length) fail('الصق الأسماء، كل ضيف في سطر');
      let added = 0, skipped = 0; const group = str(d.group, 30);
      for (const l of lines) {
        const p = l.split(/[,،\t|]+/).map((x) => x.trim().replace(/[٠-٩]/g, (z) => '٠١٢٣٤٥٦٧٨٩'.indexOf(z)));
        const phone = p.slice(1).find((x) => x.replace(/\D/g, '').length >= 9) || '', seats = p.slice(1).find((x) => /^\d{1,2}$/.test(x));
        try {
          const rec = cleanGuest({ name: p[0], phone, seats: seats ? Number(seats) : 1, group }, demo);
          if ((rec.phone && s.guests.some((x) => x.phone === rec.phone)) || s.guests.length >= (demo ? 120 : 2000)) { skipped++; continue; }
          s.guests.push({ id: uid('g'), key: newKey(), ...rec, rsvp: 'pending', coming: 0, at: new Date(now).toISOString(), sentAt: null, openedAt: null, inAt: null, inCount: 0 }); added++;
        } catch { skipped++; }
      }
      if (group && !s.groups.includes(group) && s.groups.length < 12) s.groups.push(group);
      return { bulk: { added, skipped } };
    },
    guestDel(c) { c.owner(); const i = c.s.guests.findIndex((x) => x.id === c.d.id); if (i < 0) fail('الضيف مو موجود', 404); c.s.guests.splice(i, 1); },
    relink(c) { c.owner(); const g = c.s.guests.find((x) => x.id === c.d.id); if (!g) fail('الضيف مو موجود', 404); g.key = newKey(); }, // رابط جديد لو انتشر الرابط القديم
    event(c) {
      c.owner(); const { s, d } = c;
      if (!DAY.test(String(d.date || ''))) fail('اختر تاريخ المناسبة'); if (!TIME.test(String(d.time || ''))) fail('اختر الوقت');
      const map = d.mapUrl ? safeUrl(d.mapUrl) : ''; if (d.mapUrl && !map) fail('رابط الموقع لازم يبدأ بـ https');
      s.event = { type: TYPES.includes(d.type) ? d.type : 'فعالية', title: str(d.title, 50) || 'دعوة', host1: str(d.host1, 40), host2: str(d.host2, 40), date: d.date, time: d.time, venue: str(d.venue, 80), city: str(d.city, 30), mapUrl: map, note: text(d.note, 240), theme: THEMES.includes(d.theme) ? d.theme : 'gold', deadline: DAY.test(String(d.deadline || '')) ? d.deadline : '', invite: text(d.invite, 200) || 'يسعدنا دعوتكم' };
    },
  },
};
