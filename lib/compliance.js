// الامتثال: الشكاوى، طلبات البيانات الشخصية، موافقات الكوكيز، سجل الحوادث، سجل نشاط اللوحة، بيانات المنشأة، وتقرير الامتثال
//   العام: /api/legal/complaint · /api/legal/data-request · /api/legal/track · /api/legal/consent
//   المالك: /api/legal/admin (GET يرجع كل شي مع التقرير) و /api/legal/admin/<complaint|request|breach|business>
// كل شي محفوظ في نفس التخزين (BOT_KV)، والقوائم مقصوصة لحد معقول
import { json, str, text, cleanPhone, phoneOk, randomCode, limited, HttpError } from './saas/core.js';
import { SELLER } from './saas/billing.js';

const D = 86400e3, H = 3600e3;
export const POLICY_VERSION = '2026-11-21';
export const SLA = { complaint: 14, request: 30, breachHours: 72 };
const K = { c: (r) => 'lg:c:' + r, cIdx: 'lg:c:idx', r: (r) => 'lg:r:' + r, rIdx: 'lg:r:idx', breach: 'lg:breach', audit: 'lg:audit', biz: 'lg:biz', consent: 'lg:consent' };
export const COMPLAINT_TYPES = { service: 'جودة الخدمة', delay: 'تأخير في التنفيذ', billing: 'الفوترة والدفع', subscription: 'الاشتراك في نظام', bot: 'رد البوت أو الواتساب', privacy: 'الخصوصية والبيانات', other: 'أخرى' };
export const REQUEST_TYPES = { access: 'معرفة البيانات المحفوظة عني', export: 'نسخة من بياناتي', correct: 'تصحيح بياناتي', delete: 'حذف بياناتي', stop: 'إيقاف رسائل واتساب' };
export const C_STATUS = { new: 'استلمناها', progress: 'قيد المعالجة', resolved: 'تم الحل', closed: 'مغلقة' };
export const R_STATUS = { new: 'استلمناه', verify: 'نتحقق من هويتك', progress: 'قيد التنفيذ', done: 'تم التنفيذ', rejected: 'تعذّر التنفيذ' };

const ksaStamp = (t) => { const d = new Date(t + 3 * H); return String(d.getUTCFullYear()).slice(2) + String(d.getUTCMonth() + 1).padStart(2, '0') + String(d.getUTCDate()).padStart(2, '0'); };
const newRef = (p, now) => `${p}-${ksaStamp(now)}-${randomCode(4)}`;
const REF = /^SD[CR]-\d{6}-[A-Z2-9]{4}$/;
const ip = (req) => String(req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'x').split(',')[0].trim().slice(0, 64);
const getJ = async (kv, k, d) => { try { return (await kv.get(k, 'json')) ?? d; } catch { return d; } };
async function body(request) { try { const b = await request.json(); return b && typeof b === 'object' ? b : {}; } catch { return {}; } }
const emailOk = (e) => !e || /^[^\s@<>]{1,64}@[^\s@<>]{1,120}\.[a-z]{2,}$/i.test(e);
async function pushIdx(kv, key, ref, cap = 3000) { const l = await getJ(kv, key, []); l.unshift(ref); await kv.put(key, JSON.stringify(l.slice(0, cap))); }

// ---------- بيانات المنشأة ----------
export function bizDefaults(env = {}) {
  return { tradeName: SELLER.name, legalName: SELLER.holder, licenseNo: SELLER.doc, cr: '', vatNo: String(env.VAT_NUMBER || '').trim(), city: SELLER.city, address: 'جدة، المملكة العربية السعودية', phone: SELLER.phone, email: 'owner@shaheendesign.sa', dpoName: SELLER.holder, dpoEmail: 'owner@shaheendesign.sa', site: 'https://www.shaheendesign.sa' };
}
export async function getBiz(kv, env) { return { ...bizDefaults(env), ...(await getJ(kv, K.biz, {})), vatNo: String(env.VAT_NUMBER || '').trim() }; }

// ---------- سجل نشاط اللوحة ----------
export async function audit(kv, entry, now = Date.now()) {
  try { const l = await getJ(kv, K.audit, []); l.unshift({ at: new Date(now).toISOString(), ...entry }); await kv.put(K.audit, JSON.stringify(l.slice(0, 1500))); } catch (e) { console.log('audit failed', String(e)); }
}

// ---------- العام ----------
async function createComplaint(kv, b, now) {
  const name = str(b.name, 80), phone = cleanPhone(b.phone), email = str(b.email, 160), type = COMPLAINT_TYPES[b.type] ? b.type : 'other', details = text(b.details, 2000), orderRef = str(b.orderRef, 60);
  if (name.length < 2) throw new HttpError('اكتب اسمك');
  if (!phoneOk(phone)) throw new HttpError('رقم الجوال لازم يبدأ بـ 05 ومن ١٠ أرقام');
  if (!emailOk(email)) throw new HttpError('البريد غير صحيح');
  if (details.length < 10) throw new HttpError('اكتب تفاصيل الشكوى (١٠ حروف على الأقل)');
  const ref = newRef('SDC', now), at = new Date(now).toISOString();
  const rec = { ref, at, due: new Date(now + SLA.complaint * D).toISOString(), name, phone, email, type, orderRef, details, status: 'new', events: [{ at, by: 'customer', msg: 'تم تقديم الشكوى', pub: true }] };
  await kv.put(K.c(ref), JSON.stringify(rec)); await pushIdx(kv, K.cIdx, ref);
  return rec;
}
async function createRequest(kv, b, now) {
  const name = str(b.name, 80), phone = cleanPhone(b.phone), email = str(b.email, 160), type = REQUEST_TYPES[b.type] ? b.type : null, details = text(b.details, 1500);
  if (name.length < 2) throw new HttpError('اكتب اسمك');
  if (!phoneOk(phone)) throw new HttpError('رقم الجوال لازم يبدأ بـ 05 ومن ١٠ أرقام');
  if (!emailOk(email)) throw new HttpError('البريد غير صحيح');
  if (!type) throw new HttpError('اختر نوع الطلب');
  const ref = newRef('SDR', now), at = new Date(now).toISOString();
  const rec = { ref, at, due: new Date(now + SLA.request * D).toISOString(), name, phone, email, type, details, status: 'new', events: [{ at, by: 'customer', msg: 'تم تقديم الطلب', pub: true }] };
  await kv.put(K.r(ref), JSON.stringify(rec)); await pushIdx(kv, K.rIdx, ref);
  return rec;
}
// المتابعة: الرقم المرجعي + آخر ٤ أرقام من الجوال، وما يطلع إلا الرسائل العامة
function publicView(rec) {
  const isC = rec.ref.startsWith('SDC');
  return { ref: rec.ref, kind: isC ? 'complaint' : 'request', type: (isC ? COMPLAINT_TYPES : REQUEST_TYPES)[rec.type] || '', status: rec.status, statusLabel: (isC ? C_STATUS : R_STATUS)[rec.status] || rec.status, at: rec.at, due: rec.due, events: (rec.events || []).filter((e) => e.pub).map((e) => ({ at: e.at, by: e.by, msg: e.msg })) };
}
async function recordConsent(kv, b, now) {
  const c = b.c === 'all' ? 'all' : 'necessary', id = /^[a-z0-9]{8,32}$/i.test(String(b.id || '')) ? String(b.id) : '';
  const s = await getJ(kv, K.consent, { counts: { all: 0, necessary: 0 }, recent: [] });
  s.counts[c] = (s.counts[c] || 0) + 1; s.recent.unshift({ id, c, at: new Date(now).toISOString(), v: POLICY_VERSION }); s.recent = s.recent.slice(0, 500);
  await kv.put(K.consent, JSON.stringify(s));
}

// ---------- تقرير الامتثال ----------
export function report({ env = {}, biz, complaints, requests, breaches, audits, consent, now = Date.now() }) {
  const openC = complaints.filter((c) => !['resolved', 'closed'].includes(c.status)), openR = requests.filter((r) => !['done', 'rejected'].includes(r.status));
  const lateC = openC.filter((c) => Date.parse(c.due) < now), lateR = openR.filter((r) => Date.parse(r.due) < now);
  const lateB = breaches.filter((b) => b.notifyNeeded && !b.notifiedAt && Date.parse(b.detectedAt) + SLA.breachHours * H < now);
  const has = (k) => !!String(env[k] || '').trim();
  const pw = String(env.ADMIN_PASSWORD || '').trim();
  const vat = !!biz.vatNo;
  const items = [
    ['legal', 'سياسة الخصوصية منشورة وفيها بيانات التواصل ومسؤول حماية البيانات', 'نظام حماية البيانات الشخصية', true, '/privacy'],
    ['legal', 'الشروط والأحكام منشورة', 'نظام التجارة الإلكترونية', true, '/terms'],
    ['legal', 'سياسة الاسترداد والإلغاء منشورة', 'نظام التجارة الإلكترونية', true, '/refund'],
    ['legal', 'سياسة تنفيذ الخدمة والتسليم منشورة', 'نظام التجارة الإلكترونية', true, '/delivery'],
    ['legal', 'هوية مقدم الخدمة ووثيقة العمل الحر ظاهرة في الموقع', 'نظام التجارة الإلكترونية', !!(biz.legalName && biz.licenseNo && biz.phone && biz.email)],
    ['complaints', 'قناة شكاوى برقم مرجعي ومتابعة', 'نظام التجارة الإلكترونية', true, '/complaints'],
    ['complaints', `كل الشكاوى المفتوحة ضمن ${SLA.complaint} يوم`, 'التزام داخلي', lateC.length === 0, lateC.length ? `${lateC.length} متأخرة` : ''],
    ['privacy', 'نموذج لطلبات البيانات (معرفة، نسخة، تصحيح، حذف)', 'نظام حماية البيانات الشخصية', true, '/complaints#data'],
    ['privacy', `طلبات البيانات منفّذة خلال ${SLA.request} يوم`, 'نظام حماية البيانات الشخصية', lateR.length === 0, lateR.length ? `${lateR.length} متأخرة` : ''],
    ['privacy', 'موافقة الكوكيز قبل أي تتبع إعلاني (Meta Pixel)', 'نظام حماية البيانات الشخصية', true],
    ['privacy', 'مسؤول حماية البيانات وبريده محددين', 'نظام حماية البيانات الشخصية', !!(biz.dpoName && biz.dpoEmail)],
    ['privacy', `سجل حوادث تسرب البيانات، والإبلاغ خلال ${SLA.breachHours} ساعة`, 'نظام حماية البيانات الشخصية', lateB.length === 0, lateB.length ? `${lateB.length} بدون إبلاغ` : `${breaches.length} مسجّلة`],
    ['privacy', 'مدة حفظ البيانات محددة (سنتين بعد آخر تواصل)', 'نظام حماية البيانات الشخصية', true],
    ['security', 'HTTPS إجباري مع HSTS', 'أمن', true],
    ['security', 'التحقق من توقيع رسائل واتساب (APP_SECRET)', 'أمن', has('APP_SECRET')],
    ['security', 'التحقق من إشعارات الدفع (MOYASAR_WEBHOOK_SECRET)', 'أمن', has('MOYASAR_WEBHOOK_SECRET') || !has('MOYASAR_SECRET_KEY'), has('MOYASAR_SECRET_KEY') ? '' : 'الدفع الإلكتروني مو مفعّل'],
    ['security', 'كلمة مرور اللوحة ١٢ حرف أو أكثر، ومفتاح الجلسات موجود', 'أمن', pw.length >= 12 && String(env.SESSION_SECRET || '').length >= 16],
    ['security', 'حد لمحاولات الدخول ورموز التحقق والنماذج', 'أمن', true],
    ['security', 'سجل نشاط اللوحة (كل تعديل بوقته ومين سوّاه)', 'أمن', true, `${audits.length} عملية`],
    ['zatca', vat ? 'الفواتير ضريبية مبسطة وفيها رمز QR الزكاة' : 'المنشأة غير مسجّلة في الضريبة، والفواتير مكتوب فيها كذا', 'هيئة الزكاة والضريبة والجمارك', true, vat ? biz.vatNo : 'غير مسجّل'],
    ['zatca', 'الفواتير بأرقام متسلسلة وما تتعدل ومحفوظة', 'هيئة الزكاة والضريبة والجمارك', true],
  ].map(([sec, title, ref, ok, note]) => ({ sec, title, ref, ok: !!ok, note: note || '' }));
  const score = Math.round((items.filter((i) => i.ok).length / items.length) * 100);
  return { at: new Date(now).toISOString(), score, items, stats: { complaints: { total: complaints.length, open: openC.length, late: lateC.length }, requests: { total: requests.length, open: openR.length, late: lateR.length }, breaches: { total: breaches.length, late: lateB.length }, consent: consent.counts, audit: audits.length } };
}

async function loadAll(kv, env, now) {
  const cIdx = await getJ(kv, K.cIdx, []), rIdx = await getJ(kv, K.rIdx, []);
  const complaints = (await Promise.all(cIdx.slice(0, 300).map((r) => getJ(kv, K.c(r), null)))).filter(Boolean);
  const requests = (await Promise.all(rIdx.slice(0, 300).map((r) => getJ(kv, K.r(r), null)))).filter(Boolean);
  const breaches = await getJ(kv, K.breach, []), audits = await getJ(kv, K.audit, []);
  const consent = await getJ(kv, K.consent, { counts: { all: 0, necessary: 0 }, recent: [] });
  const biz = await getBiz(kv, env);
  return { biz, complaints, requests, breaches, audits, consent, report: report({ env, biz, complaints, requests, breaches, audits, consent, now }) };
}

// ---------- المسارات ----------
// notify(text, params) ينبه المالك (واتساب + إشعار الجوال)، و isAdmin(request) من اللوحة
export async function handleLegal(request, env, url, { isAdmin, sameOrigin, notify = async () => {}, now = Date.now() } = {}) {
  const kv = env.BOT_KV, p = url.pathname.replace(/^\/api\/legal\/?/, ''), M = request.method;
  try {
    if (p === 'complaint' && M === 'POST') {
      if (!sameOrigin(request)) return json({ error: 'origin' }, 403);
      if (await limited(kv, 'lgc:' + ip(request), 5, H, now)) return json({ error: 'محاولات كثيرة، جرّب بعد ساعة' }, 429);
      const b = await body(request); if (b.website) return json({ ok: true, ref: newRef('SDC', now) }); // فخ للبوتات
      const rec = await createComplaint(kv, b, now);
      try { await notify(`📮 شكوى جديدة ${rec.ref}\nالنوع: ${COMPLAINT_TYPES[rec.type]}\nالاسم: ${rec.name}\nالجوال: ${rec.phone}\n${rec.details.slice(0, 300)}\nالرد مطلوب قبل: ${rec.due.slice(0, 10)}`, [rec.name, 'شكوى: ' + COMPLAINT_TYPES[rec.type], rec.ref, rec.phone]); } catch (e) { console.log('complaint notify failed', String(e)); }
      return json({ ok: true, ref: rec.ref, due: rec.due });
    }
    if (p === 'data-request' && M === 'POST') {
      if (!sameOrigin(request)) return json({ error: 'origin' }, 403);
      if (await limited(kv, 'lgr:' + ip(request), 5, H, now)) return json({ error: 'محاولات كثيرة، جرّب بعد ساعة' }, 429);
      const b = await body(request); if (b.website) return json({ ok: true, ref: newRef('SDR', now) });
      const rec = await createRequest(kv, b, now);
      try { await notify(`🔐 طلب بيانات شخصية ${rec.ref}\nالطلب: ${REQUEST_TYPES[rec.type]}\nالاسم: ${rec.name}\nالجوال: ${rec.phone}${rec.details ? '\n' + rec.details.slice(0, 200) : ''}\nالتنفيذ قبل: ${rec.due.slice(0, 10)}`, [rec.name, 'طلب بيانات: ' + REQUEST_TYPES[rec.type], rec.ref, rec.phone]); } catch (e) { console.log('request notify failed', String(e)); }
      return json({ ok: true, ref: rec.ref, due: rec.due });
    }
    if (p === 'track' && M === 'GET') {
      if (await limited(kv, 'lgt:' + ip(request), 30, H, now)) return json({ error: 'محاولات كثيرة، جرّب بعد ساعة' }, 429);
      const ref = String(url.searchParams.get('ref') || '').trim().toUpperCase(), last4 = String(url.searchParams.get('p') || '').replace(/\D/g, '');
      if (!REF.test(ref) || last4.length !== 4) return json({ error: 'اكتب الرقم المرجعي وآخر ٤ أرقام من جوالك' }, 400);
      const rec = await getJ(kv, ref.startsWith('SDC') ? K.c(ref) : K.r(ref), null);
      if (!rec || !rec.phone.endsWith(last4)) return json({ error: 'ما لقينا طلب بهذي البيانات' }, 404);
      return json(publicView(rec));
    }
    if (p === 'consent' && M === 'POST') {
      if (await limited(kv, 'lgk:' + ip(request), 20, H, now)) return json({ ok: true });
      await recordConsent(kv, await body(request), now); return json({ ok: true });
    }
    if (p.startsWith('admin')) {
      if (!(await isAdmin(request))) return json({ error: 'سجّل دخول' }, 401);
      if (M !== 'GET' && !sameOrigin(request)) return json({ error: 'origin' }, 403);
      const sub = p.slice(5).replace(/^\//, '');
      if (sub === '' && M === 'GET') return json(await loadAll(kv, env, now));
      if (sub === 'export' && M === 'GET') {
        const all = await loadAll(kv, env, now);
        return new Response(JSON.stringify({ exportedAt: new Date(now).toISOString(), policyVersion: POLICY_VERSION, ...all }, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8', 'content-disposition': `attachment; filename="compliance-${ksaStamp(now)}.json"`, 'cache-control': 'no-store' } });
      }
      const b = await body(request), at = new Date(now).toISOString();
      if ((sub === 'complaint' || sub === 'request') && M === 'POST') {
        const isC = sub === 'complaint', ref = String(b.ref || ''), key = isC ? K.c(ref) : K.r(ref);
        const rec = REF.test(ref) ? await getJ(kv, key, null) : null; if (!rec) return json({ error: 'ما لقيته' }, 404);
        const ST = isC ? C_STATUS : R_STATUS, msg = text(b.reply, 1500), note = text(b.note, 1500);
        if (b.status && ST[b.status] && b.status !== rec.status) { rec.status = b.status; rec.events.push({ at, by: 'owner', msg: 'الحالة: ' + ST[b.status], pub: true }); if (['resolved', 'closed', 'done', 'rejected'].includes(b.status)) rec.closedAt = at; }
        if (msg) { rec.events.push({ at, by: 'owner', msg, pub: true }); rec.respondedAt = rec.respondedAt || at; }
        if (note) rec.events.push({ at, by: 'owner', msg: note, pub: false });
        await kv.put(key, JSON.stringify(rec)); return json({ ok: true, rec });
      }
      if (sub === 'breach' && M === 'POST') {
        const l = await getJ(kv, K.breach, []);
        if (b.id) { const x = l.find((y) => y.id === b.id); if (!x) return json({ error: 'ما لقيته' }, 404); if (b.notified) x.notifiedAt = x.notifiedAt || at; if (b.closed) x.closedAt = x.closedAt || at; if (b.actions) x.actions = text(b.actions, 2000); }
        else {
          const title = str(b.title, 160); if (title.length < 3) return json({ error: 'اكتب وصف الحادثة' }, 400);
          const det = Date.parse(b.detectedAt) || now;
          l.unshift({ id: 'B' + randomCode(6), title, detectedAt: new Date(det).toISOString(), affected: text(b.affected, 500), data: text(b.data, 500), actions: text(b.actions, 2000), notifyNeeded: b.notifyNeeded !== false, notifiedAt: null, closedAt: null, at });
        }
        await kv.put(K.breach, JSON.stringify(l.slice(0, 300))); return json({ ok: true, breaches: l });
      }
      if (sub === 'business' && M === 'POST') {
        const cur = await getJ(kv, K.biz, {}), out = { ...cur };
        for (const f of ['tradeName', 'legalName', 'licenseNo', 'cr', 'address', 'phone', 'email', 'dpoName', 'dpoEmail']) if (b[f] != null) out[f] = str(b[f], 160);
        for (const f of ['email', 'dpoEmail']) if (out[f] && !emailOk(out[f])) return json({ error: 'البريد غير صحيح' }, 400);
        await kv.put(K.biz, JSON.stringify(out)); return json({ ok: true, biz: await getBiz(kv, env) });
      }
    }
    return json({ error: 'not found' }, 404);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.code);
    console.log('legal error', String(e && e.stack || e)); return json({ error: 'صار خطأ، جرّب مرة ثانية' }, 500);
  }
}
