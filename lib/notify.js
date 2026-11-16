// رسائل يبدأها النظام للعميل عبر قوالب واتساب المعتمدة من Meta
// قالب تأكيد الموعد وقالب التذكير: متغيرين بالترتيب {{1}} الاسم، {{2}} الموعد
import { slotMs } from './booking.js';

const SKIP = ['ملغي', 'ما تم'];

export async function customerBookingNotice({ api, templates, lead }) {
  if (!templates?.bookingConfirm || !lead?.wa) return false;
  await api.template(lead.wa, templates.bookingConfirm, templates.lang || 'ar', [lead.name || 'عميلنا', lead.timeline]);
  return true;
}

// كل صباح: يذكّر أصحاب مواعيد اليوم (بتوقيت السعودية) مرة وحدة
export async function sendReminders({ kv, api, templates, now = Date.now() }) {
  if (!templates?.bookingReminder) return { ok: true, sent: 0, note: 'قالب التذكير مو محدد في اللوحة' };
  const ksaDay = (t) => new Date(t + 3 * 3600e3).toISOString().slice(0, 10);
  const today = ksaDay(now);
  const ids = (await kv.get('leads:index', 'json')) || [];
  let sent = 0; const failed = [];
  for (const id of ids.slice(0, 200)) {
    const l = await kv.get(`lead:${id}`, 'json');
    if (!l || l.kind !== 'booking' || !l.slot || l.reminded || SKIP.includes(l.status)) continue;
    const t = slotMs(l.slot);
    if (!(t > now) || ksaDay(t) !== today) continue;
    try {
      await api.template(l.wa, templates.bookingReminder, templates.lang || 'ar', [l.name || 'عميلنا', l.timeline]);
      l.reminded = new Date(now).toISOString();
      await kv.put(`lead:${id}`, JSON.stringify(l));
      sent++;
    } catch (e) { failed.push(id); console.log('reminder failed', id, String(e).slice(0, 200)); }
  }
  return { ok: true, sent, failed };
}
