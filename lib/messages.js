// نصوص رسائل البوت والإشعارات: تتعدل من لوحة التحكم ← رسائل الواتساب
// المتغيرات اللي تنكتب بين { } تتبدل وقت الإرسال:
// {الاسم} {رقم_الطلب} {المالك} {الملخص} {الموعد}

export const DEFAULT_MESSAGES = {
  welcome: 'هلا فيك في شاهين ديزاين يا {الاسم} 🦅\nأنا مساعد {المالك}، أرتب معك طلبك في أقل من دقيقة وأوصله له.\n\nوش يناسبك؟',
  welcomeAgain: 'هلا فيك من جديد يا {الاسم} 🦅\nوش تحتاج اليوم؟',
  received: 'هلا {الاسم}، استلمنا طلبك رقم {رقم_الطلب} ✅\n\n{الملخص}\n\nكيف تحب {المالك} يتواصل معك؟',
  done: 'تم يا {الاسم}. طلبك رقم {رقم_الطلب} وصل إلى {المالك} ✅',
  human: 'أبشر يا {الاسم}. حولتك إلى {المالك}، ورقم محادثتك {رقم_الطلب}.',
  online: '{المالك} متواجد الحين وبيرد عليك قريب.',
  offline: '{المالك} يرد في أوقات العمل (الأحد إلى الخميس، مساءً)، وطلبك محفوظ عندنا.',
};

export const MESSAGE_KEYS = Object.keys(DEFAULT_MESSAGES);
export const MESSAGE_MAX = 900;

// قوالب واتساب (يوافق عليها Meta) للرسائل اللي يبدأها النظام
export const DEFAULT_TEMPLATES = { lang: 'ar', bookingConfirm: '', bookingReminder: '', invoice: '' };

export function messagesFrom(content) {
  const m = { ...DEFAULT_MESSAGES };
  for (const k of MESSAGE_KEYS) { const v = content?.messages?.[k]; if (typeof v === 'string' && v.trim()) m[k] = v; }
  return m;
}
export function templatesFrom(content) {
  return { ...DEFAULT_TEMPLATES, ...(content?.settings?.templates || {}) };
}

// يبدّل المتغيرات، وإذا الاسم فاضي يشيل "يا" اللي قبله
export function fill(tpl, vars = {}) {
  const map = { 'الاسم': vars.name, 'رقم_الطلب': vars.id, 'المالك': vars.owner, 'الملخص': vars.summary, 'الموعد': vars.when };
  let s = String(tpl || '');
  if (!String(vars.name || '').trim()) s = s.replace(/\s*يا\s*\{الاسم\}/g, '').replace(/\s*\{الاسم\}\s*،/g, '،');
  s = s.replace(/\{(الاسم|رقم_الطلب|المالك|الملخص|الموعد)\}/g, (_, k) => String(map[k] ?? '').trim());
  return s.replace(/[ \t]{2,}/g, ' ').replace(/ +([،.!؟])/g, '$1').trim();
}
