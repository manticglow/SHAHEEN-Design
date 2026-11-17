import { pushLead } from './push.js';
// حجز الاستشارة المجانية من الموقع: GET /api/slots و POST /api/booking
// الأوقات بتوقيت السعودية. الإعدادات من متغيرات Vercel (اختيارية) ولازم تطابق BOOK في index.html
import { makeId } from './flow.js';
import { getStore, bookFromStore } from './store.js';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const p2 = (n) => String(n).padStart(2, '0');
const DN = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MN = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const clip = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

export function bookCfg(env) {
  return {
    days: String(env.BOOK_DAYS ?? env.WORK_DAYS ?? '0,1,2,3,4').split(',').map(Number),
    from: Number(env.BOOK_FROM ?? 17), to: Number(env.BOOK_TO ?? 22), step: Number(env.BOOK_STEP ?? 30),
    len: Number(env.BOOK_LEN ?? 15), ahead: Number(env.BOOK_AHEAD ?? 14), leadHours: Number(env.BOOK_LEAD_HOURS ?? 3),
  };
}

// "2026-11-16T17:30" (الرياض) → وقت UTC بالملي ثانية
export function slotMs(key) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(key));
  return m ? Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5]) - 3 * 3600e3 : NaN;
}

export function validSlot(cfg, key, now) {
  const t = slotMs(key);
  if (!Number.isFinite(t)) return false;
  const local = new Date(t + 3 * 3600e3);
  const mins = local.getUTCHours() * 60 + local.getUTCMinutes();
  if (!cfg.days.includes(local.getUTCDay())) return false;
  if ((cfg.closed || []).includes(String(key).slice(0, 10))) return false;
  if (mins < cfg.from * 60 || mins + cfg.len > cfg.to * 60 || (mins - cfg.from * 60) % cfg.step) return false;
  if (t < now + cfg.leadHours * 3600e3) return false;
  if (t > now + (cfg.ahead + 1) * 86400e3) return false;
  return true;
}

export function whenLabel(key) {
  const d = new Date(slotMs(key) + 3 * 3600e3);
  const h = d.getUTCHours(), hh = h % 12 || 12;
  return `${DN[d.getUTCDay()]} ${d.getUTCDate()} ${MN[d.getUTCMonth()]}، ${hh}:${p2(d.getUTCMinutes())} ${h >= 12 ? 'م' : 'ص'}`;
}

function phoneOf(v) {
  const d = String(v ?? '').replace(/[٠-٩]/g, (c) => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/\D/g, '');
  if (/^05\d{8}$/.test(d)) return '966' + d.slice(1);
  if (/^5\d{8}$/.test(d)) return '966' + d;
  if (/^00\d{8,14}$/.test(d)) return d.slice(2);
  if (/^[1-9]\d{8,14}$/.test(d)) return d;
  return '';
}

async function takenMap(kv, now) {
  const m = (await kv.get('book:taken', 'json')) || {};
  for (const k of Object.keys(m)) if (slotMs(k) < now - 86400e3) delete m[k];
  return m;
}

export async function handleBooking(request, env, url, { notify, now = Date.now() } = {}) {
  const kv = env.BOT_KV, cfg = bookFromStore(bookCfg(env), await getStore(kv));

  if (url.pathname === '/api/slots' && request.method === 'GET') {
    const m = await takenMap(kv, now);
    return json({ taken: Object.keys(m).filter((k) => slotMs(k) > now), cfg });
  }

  if (url.pathname === '/api/booking' && request.method === 'POST') {
    // حد بسيط: ٥ حجوزات بالساعة لكل جهاز
    const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'x').split(',')[0].trim();
    const rlKey = `rl:book:${ip}`;
    const count = Number((await kv.get(rlKey)) || 0);
    if (count >= 5) return json({ ok: false, error: 'محاولات كثيرة، جرّب بعد ساعة' }, 429);

    const raw = await request.text();
    if (raw.length > 4000) return json({ ok: false, error: 'too large' }, 413);
    let b; try { b = JSON.parse(raw); } catch { return json({ ok: false, error: 'bad json' }, 400); }

    const name = clip(b.name, 60), phone = phoneOf(b.phone), slot = String(b.slot || '');
    if (name.length < 2) return json({ ok: false, error: 'الاسم ناقص' }, 400);
    if (!phone) return json({ ok: false, error: 'رقم الجوال غير صحيح' }, 400);
    if (!validSlot(cfg, slot, now)) return json({ ok: false, error: 'الوقت غير متاح' }, 400);

    const taken = await takenMap(kv, now);
    if (taken[slot]) return json({ ok: false, error: 'هالوقت انحجز' }, 409);

    const id = makeId(now);
    taken[slot] = id;
    await kv.put('book:taken', JSON.stringify(taken));
    await kv.put(rlKey, String(count + 1), { expirationTtl: 3600 });

    const when = whenLabel(slot);
    const lead = {
      id, at: new Date(now).toISOString(), source: 'حجز استشارة من الموقع', kind: 'booking',
      name, wa: phone, slot, timeline: when,
      serviceName: `استشارة مجانية${b.topic ? ' · ' + clip(b.topic, 40) : ''}`,
      pref: clip(b.way || 'مكالمة واتساب', 30), details: clip(b.note, 400),
    };
    await kv.put(`lead:${id}`, JSON.stringify(lead));
    const idx = (await kv.get('leads:index', 'json')) || [];
    idx.unshift(id);
    await kv.put('leads:index', JSON.stringify(idx.slice(0, 200)));

    if (notify) { try { await notify(lead); } catch (e) { console.log('booking alert failed', String(e)); } }
    await pushLead(kv, lead);
    return json({ ok: true, id, when });
  }

  return json({ ok: false, error: 'not found' }, 404);
}

// تنبيه صاحب الموقع على الواتساب: رسالة عادية لو كلمت البوت آخر ٢٣ ساعة، وإلا قالب التنبيه
export function bookingNotifier({ kv, api, cfg, now = () => Date.now() }) {
  return async (lead) => {
    if (!cfg.admins.length) return;
    const text = `📅 حجز استشارة جديد ${lead.id}\nالموعد: ${lead.timeline}\nالاسم: ${lead.name}\nالطريقة: ${lead.pref}\nالموضوع: ${lead.serviceName}${lead.details ? '\nملاحظة: ' + lead.details : ''}\nرقم العميل: +${lead.wa}\nhttps://wa.me/${lead.wa}`;
    const lastSeen = Number((await kv.get('owner:lastSeen')) || 0);
    if (now() - lastSeen < 23 * 3600e3) { for (const a of cfg.admins) await api.text(a, text); return; }
    if (cfg.alertTemplate) {
      for (const a of cfg.admins) await api.template(a, cfg.alertTemplate, cfg.templateLang, [lead.name, clip(`استشارة ${lead.timeline}`, 60), lead.id, '+' + lead.wa]);
    }
  };
}
