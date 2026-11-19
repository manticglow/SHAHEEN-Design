// الدخول بالواتساب (مجاني): الموقع يعطي رمز قصير، صاحب الحساب يرسله لبوت شاهين ديزاين من جواله،
// والبوت يطلب منه تأكيد بزر. الدخول يصير بس في نفس المتصفح اللي طلب الرمز (كوكي HttpOnly فيه سر ما يطلع للصفحة).
// - مجاني لأن العميل هو اللي يبدأ المحادثة، وردود البوت داخل نافذة الـ٢٤ ساعة ببلاش
// - الرمز لحاله ما يدخل أحد: لازم نفس المتصفح + رسالة من رقم صاحب الحساب + ضغطة تأكيد
// - زر التأكيد فيه تحذير: لو أحد طلب منك ترسل الرسالة لا تأكد (عشان ما ينخدع أحد ويدخّل غيره لحسابه)
import { randomCode, sha256, same, cleanPhone, phoneOk } from './saas/core.js';

export const WAL_TTL = 5 * 60e3;
export const WAL_RE = /^\s*(?:دخول|login)\s*[:#-]?\s*([A-Za-z0-9]{6})\s*$/i;
export const WAL_BTN = /^wal:(ok|no):([A-Z0-9]{6})$/;
const CODE = /^[A-Z0-9]{6}$/;
const KEY = (c) => 'sd:wal:' + c;

export const botNumber = (env) => String(env.BOT_WA || '').replace(/\D/g, '');
export const waLoginReady = (env) => !!(botNumber(env) && env.PHONE_NUMBER_ID && env.WA_TOKEN);
export const waLink = (env, code) => `https://wa.me/${botNumber(env)}?text=${encodeURIComponent('دخول ' + code)}`;

const save = (kv, code, r) => kv.put(KEY(code), JSON.stringify(r), { expirationTtl: 900 });

// المتصفح يطلب رمز: نرجع الرمز (يظهر للعميل) والسر (يروح في كوكي HttpOnly بس)
// kind: 'own' أصحاب الحسابات في /app · 'admin' لوحة التحكم (المالك والموظفين)
export async function walStart(kv, now, kind = 'own') {
  let code = randomCode(6);
  for (let i = 0; i < 3 && (await kv.get(KEY(code))); i++) code = randomCode(6);
  const claim = randomCode(32);
  await save(kv, code, { h: await sha256(claim), exp: now + WAL_TTL, st: 'wait', k: kind === 'admin' ? 'admin' : 'own' });
  return { code, claim };
}

// البوت استلم "دخول XXXXXX" من رقم ما
export async function walOnCode({ kv, api, from, code, now, hasAccount }) {
  code = String(code || '').toUpperCase();
  const r = CODE.test(code) ? await kv.get(KEY(code), 'json') : null;
  if (!r || r.exp < now || r.st !== 'wait') return api.text(from, 'هالرمز انتهى أو مو صحيح. ارجع للموقع واضغط "ادخل بالواتساب" من جديد.');
  const phone = cleanPhone(from);
  const k = r.k || 'own';
  if (!phoneOk(phone) || !(await hasAccount(phone, k))) {
    r.st = 'none'; await save(kv, code, r);
    return api.text(from, 'ما لقينا حساب مسجّل بهالرقم. لو حسابك برقم ثاني، أرسل الرسالة من واتساب ذاك الرقم، أو ادخل بكلمة المرور.');
  }
  r.st = 'ask'; r.p = phone; r.wa = String(from); await save(kv, code, r);
  return api.buttons(from,
    (k === 'admin' ? 'فيه طلب دخول للوحة تحكم شاهين ديزاين برقمك.' : 'فيه طلب دخول لحسابك في شاهين ديزاين.') + '\n\nإذا أنت اللي تدخل الحين اضغط "تأكيد الدخول".\n\n⚠️ لو أحد طلب منك ترسل هالرسالة أو تضغط الزر، لا تأكد، لأنه بيدخل حسابك.',
    [{ id: `wal:ok:${code}`, title: 'تأكيد الدخول' }, { id: `wal:no:${code}`, title: 'مو أنا' }]);
}

// البوت استلم ضغطة زر التأكيد أو الرفض
export async function walOnReply({ kv, api, from, id, now }) {
  const m = WAL_BTN.exec(String(id || ''));
  const r = m ? await kv.get(KEY(m[2]), 'json') : null;
  if (!r || r.st !== 'ask' || r.wa !== String(from) || r.exp < now) return api.text(from, 'طلب الدخول هذا انتهى. ارجع للموقع وابدأ من جديد.');
  if (m[1] === 'ok') { r.st = 'ok'; await save(kv, m[2], r); return api.text(from, 'تم ✅ ارجع للموقع، بتدخل تلقائيًا خلال ثواني.'); }
  r.st = 'no'; await save(kv, m[2], r);
  return api.text(from, 'تمام، ألغيت طلب الدخول ومحد دخل حسابك.');
}

// المتصفح يسأل: وصل التأكيد؟ يرجع الرقم مرة وحدة بس، وبعدها الرمز ما يشتغل
export async function walPoll(kv, code, claim, now, kind = 'own') {
  code = String(code || '').toUpperCase();
  const r = CODE.test(code) ? await kv.get(KEY(code), 'json') : null;
  if (!r || r.exp < now || (r.k || 'own') !== kind || !claim || !same(await sha256(claim), r.h)) return { st: 'expired' };
  if (r.st === 'ok') { r.st = 'used'; await save(kv, code, r); return { st: 'ok', phone: r.p }; }
  return { st: r.st === 'used' ? 'expired' : r.st }; // wait | ask | none | no
}
