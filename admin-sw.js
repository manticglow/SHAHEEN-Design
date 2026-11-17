// تطبيق لوحة شاهين ديزاين: ما نخزّن أي بيانات (الطلبات خاصة)، بس نعرض رسالة لو انقطع النت
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>لا يوجد اتصال</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0e0f11;color:#efe6d6;font-family:system-ui;text-align:center;padding:24px"><div><h1 style="font-size:20px">ما فيه اتصال بالإنترنت</h1><p style="opacity:.75">تأكد من النت وارجع افتح التطبيق.</p><button onclick="location.reload()" style="margin-top:12px;padding:12px 22px;border-radius:12px;border:0;background:#B8935A;color:#111;font-weight:700">إعادة المحاولة</button></div></body></html>', { headers: { 'content-type': 'text/html; charset=utf-8' } })));
});

// تنبيه طلب جديد
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch { d = { title: 'شاهين ديزاين', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'طلب جديد', { body: d.body || '', icon: '/admin-icon-192.png', badge: '/admin-icon-192.png', tag: d.tag || 'lead', renotify: true, dir: 'rtl', lang: 'ar', data: { url: d.url || '/admin' } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/admin';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    for (const c of cs) if (c.url.includes('/admin') && 'focus' in c) { c.postMessage({ type: 'refresh' }); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
