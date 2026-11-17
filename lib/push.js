// تنبيهات الجوال لتطبيق اللوحة (Web Push): المالك والموظفين يجيهم إشعار لما يوصل طلب أو حجز جديد
// المفاتيح (VAPID) تنولد مرة وحدة وتنحفظ في قاعدة البيانات، فما يحتاج متغيرات بيئة
import webpush from 'web-push';

const VKEY = 'push:vapid', SKEY = 'push:subs', MAX = 40;

export async function vapid(kv) {
  let v = await kv.get(VKEY, 'json');
  if (!v || !v.publicKey) { v = webpush.generateVAPIDKeys(); await kv.put(VKEY, JSON.stringify(v)); }
  return v;
}

const validSub = (s) => s && typeof s.endpoint === 'string' && /^https:\/\/[^\s]{10,800}$/.test(s.endpoint) && s.keys && typeof s.keys.p256dh === 'string' && typeof s.keys.auth === 'string' && s.keys.p256dh.length < 200 && s.keys.auth.length < 100;

// who = { role: 'owner' } | { role: 'staff', id, name }
export async function subscribe(kv, who, sub, now = Date.now()) {
  if (!validSub(sub)) throw new Error('اشتراك غير صالح');
  const list = ((await kv.get(SKEY, 'json')) || []).filter((x) => x.sub.endpoint !== sub.endpoint);
  list.unshift({ who: who.role === 'owner' ? 'owner' : 'staff:' + who.id, name: who.name || 'المالك', sub: { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }, at: new Date(now).toISOString() });
  await kv.put(SKEY, JSON.stringify(list.slice(0, MAX)));
}
export async function unsubscribe(kv, endpoint) {
  const list = (await kv.get(SKEY, 'json')) || [];
  await kv.put(SKEY, JSON.stringify(list.filter((x) => x.sub.endpoint !== endpoint)));
}

// يرسل لكل الأجهزة المشتركة (أو لجهاز واحد للتجربة). الموظف الموقوف أو المحذوف ما يوصله شي
export async function sendPush(kv, payload, { only, timeoutMs = 6000 } = {}) {
  const list = (await kv.get(SKEY, 'json')) || [];
  if (!list.length) return { sent: 0 };
  const staff = (await kv.get('staff:accounts', 'json')) || [];
  const allowed = (w) => w === 'owner' || staff.some((a) => 'staff:' + a.id === w && a.active);
  const v = await vapid(kv);
  const opts = { vapidDetails: { subject: 'https://shaheendesign.sa', publicKey: v.publicKey, privateKey: v.privateKey }, TTL: 60 * 60 * 24, urgency: 'high', timeout: timeoutMs };
  const body = JSON.stringify(payload);
  const dead = [];
  let sent = 0;
  await Promise.all(list.filter((x) => allowed(x.who) && (!only || x.sub.endpoint === only)).map((x) =>
    webpush.sendNotification(x.sub, body, opts).then(() => { sent++; }, (e) => { if (e && (e.statusCode === 404 || e.statusCode === 410)) dead.push(x.sub.endpoint); else console.log('push failed', e && e.statusCode, String(e && e.body || e).slice(0, 200)); })));
  if (dead.length) await kv.put(SKEY, JSON.stringify(list.filter((x) => !dead.includes(x.sub.endpoint))));
  return { sent };
}

// تنبيه طلب جديد (حجز من الموقع أو طلب من البوت)
export async function pushLead(kv, lead) {
  try {
    const title = (lead.kind === 'booking' ? 'حجز جديد ' : 'طلب جديد ') + (lead.id || '');
    const body = [lead.name, lead.serviceName || lead.services, lead.timeline].filter(Boolean).join(' · ').slice(0, 160);
    await sendPush(kv, { title, body, url: '/admin', tag: 'lead-' + lead.id });
  } catch (e) { console.log('pushLead failed', String(e)); }
}
