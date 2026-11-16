// صفحة روابط فاخرة للمؤثرين: روابط + طلبات تعاون للبراندات + إحصائيات الزيارات والنقرات
import { str, text, int, fail, uid, ksaDay, safeUrl, HEX } from '../core.js';
import { sum, lastDays } from './util.js';

const THEMES = ['cream', 'night', 'rose', 'sage'];
const SOC = ['instagram', 'tiktok', 'snapchat', 'x', 'youtube'];
const bump = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; const ks = Object.keys(o).sort(); while (ks.length > 120) delete o[ks.shift()]; };

export default {
  title: 'صفحة روابط فاخرة للمؤثرين', demoName: 'رُبى | Ruba', tagline: 'لايف ستايل · سفر · جمال', color: '#B08968',
  seed(now, demo) {
    const L = (title, url, sub, pin) => ({ id: uid('l'), title, url, sub, on: true, pin: !!pin, clicks: 0 });
    const s = { bio: { handle: 'ruba', about: 'أشارككم يومياتي، أماكن أحبها في السعودية، ومنتجات جربتها بنفسي.', theme: 'cream', accent: '#B08968', socials: { instagram: 'ruba', tiktok: 'ruba', snapchat: 'ruba', x: '', youtube: '' }, collab: true, rates: 'تبدأ الإعلانات من ٣٬٠٠٠ ر.س' }, links: [], inbox: [], views: {}, clicks: {} };
    if (!demo) { s.bio.handle = ''; s.bio.about = ''; s.bio.socials = { instagram: '', tiktok: '', snapchat: '', x: '', youtube: '' }; s.bio.rates = ''; return s; }
    s.links = [L('دليلي لمقاهي جدة ٢٠٢٦', 'https://shaheendesign.sa', 'ملف PDF مجاني', true), L('كود خصم عطوراتي المفضلة', 'https://shaheendesign.sa', 'RUBA15 · خصم ١٥٪'), L('رحلتي إلى العلا', 'https://shaheendesign.sa', 'فلوق كامل على يوتيوب'), L('روتين العناية بالبشرة', 'https://shaheendesign.sa', 'كل المنتجات بالروابط')];
    s.links.forEach((l, i) => { l.clicks = [412, 268, 190, 97][i]; });
    lastDays(now, 14).forEach((k, i) => { s.views[k] = 180 + ((i * 37) % 90) + i * 6; s.clicks[k] = Math.round(s.views[k] * (0.32 + (i % 4) * 0.03)); });
    s.inbox = [{ id: uid('q'), name: 'سلمى', brand: 'متجر لمسة عطور', contact: 'salma@example.com', budget: '5,000 - 10,000', msg: 'نحب نتعاون معك في إطلاق عطرنا الجديد بداية الشهر.', at: new Date(now - 7200e3).toISOString(), status: 'new' },
      { id: uid('q'), name: 'عمر', brand: 'منتجع الشاطئ', contact: '0551234567', budget: '+10,000', msg: 'دعوة لزيارة المنتجع وتغطية عطلة نهاية الأسبوع.', at: new Date(now - 90e6).toISOString(), status: 'read' }];
    return s;
  },
  view({ s, R, now }) {
    const links = s.links.filter((l) => l.on || R.owner).map((l) => (R.owner ? l : { id: l.id, title: l.title, sub: l.sub, pin: l.pin }));
    const base = { bio: s.bio, links, themes: THEMES };
    if (!R.owner) return base;
    const days = lastDays(now, 14).map((k) => [k, s.views[k] || 0, s.clicks[k] || 0]);
    const v = sum(days, (x) => x[1]), c = sum(days, (x) => x[2]);
    return { ...base, inbox: s.inbox.slice(0, 100), stats: { days, views: v, clicks: c, ctr: v ? Math.round(100 * c / v) : 0, today: s.views[ksaDay(now)] || 0, newInbox: s.inbox.filter((x) => x.status === 'new').length } };
  },
  stats(s, now) { return [['زيارات اليوم', s.views[ksaDay(now)] || 0], ['نقرات اليوم', s.clicks[ksaDay(now)] || 0], ['طلبات تعاون جديدة', s.inbox.filter((x) => x.status === 'new').length]]; },
  ops: {
    hit(c) { if (c.R.owner) return; bump(c.s.views, ksaDay(c.now)); },
    click(c) { const l = c.s.links.find((x) => x.id === c.d.id && x.on); if (!l) fail('الرابط مو موجود', 404); if (!c.R.owner) { l.clicks = (l.clicks || 0) + 1; bump(c.s.clicks, ksaDay(c.now)); } return { go: l.url }; },
    inquire(c) {
      const { s, d, now } = c; if (!s.bio.collab) fail('طلبات التعاون مقفلة حاليًا', 409);
      const name = str(d.name, 40), contact = str(d.contact, 80), msg = text(d.msg, 600);
      if (name.length < 2 || contact.length < 5 || msg.length < 10) fail('اكتب الاسم ووسيلة التواصل وتفاصيل التعاون');
      if (s.inbox.filter((x) => x.status === 'new').length >= 200) fail('الصندوق ممتلئ، جرّب لاحقًا', 409);
      s.inbox = [{ id: uid('q'), name, brand: str(d.brand, 60), contact, budget: str(d.budget, 30), msg, at: new Date(now).toISOString(), status: 'new' }, ...s.inbox].slice(0, 500);
      c.feed('طلب تعاون من ' + (str(d.brand, 60) || name));
    },
    profile(c) {
      c.owner(); const { s, d } = c; const so = {}; for (const k of SOC) so[k] = str((d.socials || {})[k], 40).replace(/^@/, '').replace(/[^\w.\-]/g, '');
      s.bio = { handle: str(d.handle, 30).replace(/^@/, '').replace(/[^\w.\-]/g, ''), about: text(d.about, 300), theme: THEMES.includes(d.theme) ? d.theme : 'cream', accent: HEX.test(d.accent) ? d.accent : s.bio.accent, socials: so, collab: !!d.collab, rates: str(d.rates, 80) };
    },
    link(c) {
      c.owner(); const { s, d } = c; const title = str(d.title, 60), url = safeUrl(d.url); if (title.length < 2 || !url) fail('اكتب العنوان ورابط صحيح يبدأ بـ https');
      const l = d.id ? s.links.find((x) => x.id === d.id) : null; const rec = { title, url, sub: str(d.sub, 60), pin: !!d.pin, on: d.on !== false };
      if (l) Object.assign(l, rec); else { if (s.links.length >= 40) fail('الحد ٤٠ رابط', 409); s.links.push({ id: uid('l'), clicks: 0, ...rec }); }
    },
    linkDel(c) { c.owner(); const i = c.s.links.findIndex((x) => x.id === c.d.id); if (i < 0) fail('الرابط مو موجود', 404); c.s.links.splice(i, 1); },
    linkMove(c) { c.owner(); const L = c.s.links, i = L.findIndex((x) => x.id === c.d.id), j = i + (c.d.dir > 0 ? 1 : -1); if (i < 0 || j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; },
    inboxMark(c) { c.owner(); const q = c.s.inbox.find((x) => x.id === c.d.id); if (!q) fail('مو موجود', 404); q.status = ['new', 'read', 'done'].includes(c.d.status) ? c.d.status : 'read'; },
  },
};
void int;
