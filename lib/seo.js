// صفحات قابلة للأرشفة: كل منتج له رابط (/salla، /wallet …) بعنوان ووصف وصورة معاينة خاصة فيه
// يقرأ بيانات المنتجات من lib/site.html نفسه، فأي تعديل على الأسعار والنصوص هناك يظهر هنا تلقائيًا
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { getStore, applyStore, publicStore } from './store.js';
import { getContent } from './cms.js';

const BRAND = 'شاهين ديزاين';
const HOME_TITLE = 'شاهين ديزاين | تصميم وبرمجة مواقع ومتاجر سلة وأنظمة في جدة';
const HOME_DESC = 'متجر شاهين ديزاين في جدة: مواقع شركات، ثيمات سلة مخصصة، أنظمة تشغيل ولوحات تحكم، بطاقات ولاء Apple Wallet، منيو QR، وبوت واتساب. اختر منتجك وباقتك، أو احجز استشارة مجانية ١٥ دقيقة. مستقل موثّق بوثيقة العمل الحر.';
const BOOK_TITLE = 'احجز استشارة مجانية ١٥ دقيقة | شاهين ديزاين';
const BOOK_DESC = 'اختر اليوم والوقت المناسب لك، ونتكلم ١٥ دقيقة عن مشروعك: موقع، متجر سلة، نظام، أو أتمتة. مجانًا وبدون التزام.';
const PHONE = '+966582409776';

let cache = null;
export function loadSite(file = join(process.cwd(), 'lib', 'site.html')) {
  if (cache && cache.file === file) return cache;
  const html = readFileSync(file, 'utf8');
  cache = { file, html, data: extractData(html) };
  return cache;
}

function block(html, start, end) {
  const i = html.indexOf(start); if (i < 0) return '';
  const j = html.indexOf(end, i); if (j < 0) return '';
  return html.slice(i, j + end.length);
}

export function extractData(html) {
  try {
    const code = [block(html, 'var CATS=', '};'), block(html, 'var TIERS_BY=', '\n};'), block(html, 'var PRODUCTS=', '\n];'), 'var CONTACT_PHONE=(' + JSON.stringify((/phone:'(\d+)'/.exec(html) || [])[1] || '') + ');'].join('\n');
    const ctx = {}; vm.runInNewContext(code + '\nthis.out={CATS:CATS,TIERS_BY:TIERS_BY,PRODUCTS:PRODUCTS};', ctx, { timeout: 200 });
    const { CATS, TIERS_BY, PRODUCTS } = ctx.out;
    return PRODUCTS.map((p) => {
      const tiers = (TIERS_BY[p.id] || []).map((t) => ({ name: t[0], price: t[1], days: t[2], sub: t[3], items: t[4], support: t[5] }));
      return { id: p.id, name: p.name, full: p.full || p.name, cat: CATS[p.cat] || '', desc: p.desc || p.short || '', short: p.short || '', hook: p.hook || '', tag: p.tag || '', days: p.days || '', support: p.support || '', inc: p.inc || [], tiers, from: tiers.length ? tiers[0].price : p.price, to: tiers.length ? tiers[tiers.length - 1].price : p.price };
    });
  } catch (e) { console.log('seo: could not read products', String(e)); return []; }
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sar = (n) => Number(n).toLocaleString('en-US');
const ldJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

export function routeOf(pathname, products) {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/' || p === '/index') return { kind: 'home' };
  if (p === '/book') return { kind: 'book' };
  const id = p.slice(1);
  const prod = products.find((x) => x.id === id);
  return prod ? { kind: 'product', product: prod } : null;
}

function business(origin, products) {
  return {
    '@type': 'ProfessionalService', '@id': `${origin}/#business`, name: BRAND, alternateName: 'Shaheen Design',
    url: `${origin}/`, logo: `${origin}/icon-512.png`, image: `${origin}/og/home.png`, telephone: PHONE,
    description: HOME_DESC,
    address: { '@type': 'PostalAddress', addressLocality: 'جدة', addressRegion: 'منطقة مكة المكرمة', addressCountry: 'SA' },
    areaServed: { '@type': 'Country', name: 'المملكة العربية السعودية' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '17:00', closes: '22:00' }],
    priceRange: products.length ? `${sar(Math.min(...products.map((p) => p.from)))}–${sar(Math.max(...products.map((p) => p.to)))} SAR` : undefined,
    founder: { '@type': 'Person', name: 'عبدالرحمن فهد شاهين' },
    potentialAction: { '@type': 'ReserveAction', name: 'احجز استشارة مجانية', target: `${origin}/book` },
    hasOfferCatalog: { '@type': 'OfferCatalog', name: 'منتجات شاهين ديزاين', itemListElement: products.map((p) => ({
      '@type': 'Offer', price: p.from, priceCurrency: 'SAR', url: `${origin}/${p.id}`,
      itemOffered: { '@type': 'Service', name: p.full, description: p.short },
    })) },
  };
}

export function metaFor(route, origin, products) {
  if (route.kind === 'product') {
    const p = route.product;
    const title = `${p.full} في جدة | يبدأ من ${sar(p.from)} ر.س | ${BRAND}`;
    const desc = `${p.desc} الباقات: ${p.tiers.map((t) => `${t.name} ${sar(t.price)} ر.س`).join('، ')}.`.slice(0, 300);
    const ld = { '@context': 'https://schema.org', '@graph': [
      business(origin, products),
      { '@type': 'Service', '@id': `${origin}/${p.id}#service`, name: p.full, serviceType: p.cat, description: p.desc, url: `${origin}/${p.id}`, image: `${origin}/og/${p.id}.png`,
        provider: { '@id': `${origin}/#business` }, areaServed: { '@type': 'Country', name: 'المملكة العربية السعودية' },
        offers: { '@type': 'AggregateOffer', priceCurrency: 'SAR', lowPrice: p.from, highPrice: p.to, offerCount: p.tiers.length,
          offers: p.tiers.map((t) => ({ '@type': 'Offer', name: `باقة ${t.name}`, price: t.price, priceCurrency: 'SAR', description: t.sub })) } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'المتجر', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: p.cat || 'المنتجات', item: `${origin}/#all` },
        { '@type': 'ListItem', position: 3, name: p.full, item: `${origin}/${p.id}` }] },
    ] };
    return { title, desc, url: `${origin}/${p.id}`, image: `${origin}/og/${p.id}.png`, alt: `${p.full} من شاهين ديزاين`, ld };
  }
  if (route.kind === 'book') {
    return { title: BOOK_TITLE, desc: BOOK_DESC, url: `${origin}/book`, image: `${origin}/og/book.png`, alt: 'احجز استشارة مجانية مع شاهين ديزاين',
      ld: { '@context': 'https://schema.org', '@graph': [business(origin, products)] } };
  }
  return { title: HOME_TITLE, desc: HOME_DESC, url: `${origin}/`, image: `${origin}/og/home.png`, alt: 'متجر شاهين ديزاين',
    ld: { '@context': 'https://schema.org', '@graph': [business(origin, products),
      { '@type': 'WebSite', '@id': `${origin}/#site`, url: `${origin}/`, name: BRAND, inLanguage: 'ar-SA', publisher: { '@id': `${origin}/#business` } }] } };
}

export function injectMeta(html, m, store) {
  const head = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.desc)}">`,
    `<link rel="canonical" href="${esc(m.url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${BRAND}">`,
    `<meta property="og:locale" content="ar_SA">`,
    `<meta property="og:title" content="${esc(m.title)}">`,
    `<meta property="og:description" content="${esc(m.desc)}">`,
    `<meta property="og:url" content="${esc(m.url)}">`,
    `<meta property="og:image" content="${esc(m.image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(m.alt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(m.title)}">`,
    `<meta name="twitter:description" content="${esc(m.desc)}">`,
    `<meta name="twitter:image" content="${esc(m.image)}">`,
    `<script type="application/ld+json">${ldJson(m.ld)}</script>`,
    `<script>window.SD_PATHS=1;window.SD_STORE=${ldJson(store || {})}</script>`,
  ].join('\n');
  // نشيل العنوان والوصف ومعاينة og الموجودة في الملف ونحط الجديدة
  let out = html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/i, '')
    .replace(/<meta\s+(?:property|name)="(?:og|twitter):[^"]*"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/i, '');
  return out.replace(/<meta name="viewport"[^>]*>/i, (v) => `${v}\n${head}`);
}

export function renderPage(url, file, store = {}, content = null) {
  const { html, data: base } = loadSite(file);
  const data = applyStore(base, store);
  const route = routeOf(url.pathname, data);
  if (!route) return null;
  return injectMeta(html, metaFor(route, url.origin, data), publicStore(store, content));
}

export function productIds(file) { return loadSite(file).data.map((p) => p.id); }
export function siteDefaults(file) { return loadSite(file).data; }

export function sitemap(origin, file, store = {}) {
  const data = applyStore(loadSite(file).data, store);
  const day = new Date().toISOString().slice(0, 10);
  const urls = [['/', '1.0'], ['/book', '0.8'], ['/demos', '0.8'], ...data.map((p) => [`/${p.id}`, '0.9'])];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, pr]) => `  <url><loc>${origin}${u}</loc><lastmod>${day}</lastmod><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`;
}

// الصفحات العامة: ما تحتاج Supabase، عشان الموقع يشتغل حتى لو الخادم ناقصه إعدادات
const PAGE_CACHE = 'public, max-age=0, s-maxage=20, stale-while-revalidate=300';
export async function servePublic(url, file, kv = null) {
  const p = url.pathname;
  if (p === '/robots.txt') return new Response(robots(url.origin), { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': PAGE_CACHE } });
  if (p.startsWith('/api/') || p.startsWith('/media/') || ['/admin', '/admin/', '/webhook', '/leads'].includes(p)) return null;
  // صفحات المشتركين والتجارب: /s/<slug> و /app (بوابة المشترك) و /demos (كل الأنظمة)
  const sm = /^\/s\/[a-z0-9-]{3,31}\/?$/.test(p) ? 'tenant' : (p === '/app' || p === '/demos') ? p.slice(1) : null;
  if (sm) {
    const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
    try { return new Response(readFileSync(join(process.cwd(), sm + '.html'), 'utf8'), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': sm === 'demos' ? PAGE_CACHE : 'no-cache', 'content-security-policy': csp, 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer' } }); } catch {}
  }
  if (p === '/privacy' || p === '/terms' || p === '/carwash') {
    // صفحات ثابتة بسياسة محتوى صارمة: سكربتاتها وطلباتها من نفس الموقع بس
    const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' https://applepay.cdn-apple.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.moyasar.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://cdn.moyasar.com; connect-src 'self' https://api.moyasar.com; frame-src https://*.moyasar.com; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'none'; form-action 'self' https://api.moyasar.com";
    try { return new Response(readFileSync(join(process.cwd(), p.slice(1) + '.html'), 'utf8'), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': PAGE_CACHE, 'content-security-policy': csp, 'x-frame-options': 'DENY' } }); } catch {}
  }
  const store = await getStore(kv);
  let content = null; if (kv) { try { content = await getContent(kv); } catch {} }
  if (p === '/sitemap.xml') return new Response(sitemap(url.origin, file, store), { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': PAGE_CACHE } });
  const html = renderPage(url, file, store, content);
  if (html) return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': PAGE_CACHE } });
  let nf = '<!doctype html><meta charset="utf-8"><title>الصفحة غير موجودة</title><p style="font-family:system-ui;text-align:center;margin-top:20vh">الصفحة غير موجودة. <a href="/">ارجع للمتجر</a></p>';
  try { nf = readFileSync(join(process.cwd(), '404.html'), 'utf8'); } catch {}
  return new Response(nf, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export function robots(origin) {
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /leads\nDisallow: /api/\nDisallow: /lib/\n\nSitemap: ${origin}/sitemap.xml\n`;
}
