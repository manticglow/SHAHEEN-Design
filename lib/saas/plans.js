// الأسعار: مصدر واحد للصفحة والدفع والفواتير (بالهللة). الأسعار نهائية للعميل.
// الضريبة: لو انضاف VAT_NUMBER في Vercel تصير الفواتير "فاتورة ضريبية مبسطة" والسعر شامل ١٥٪ (الأسعار نفسها ما تتغير)
export const PLANS = {
  bio: { m: 3900, y: 39000, setup: 0 },
  cafe: { m: 14900, y: 149000, setup: 29900 },
  salon: { m: 14900, y: 149000, setup: 29900 },
  hr: { m: 14900, y: 149000, setup: 29900 },
  clinic: { m: 19900, y: 199000, setup: 29900 },
  aftersales: { m: 49900, y: 499000, setup: 150000, setupAlways: true },
  // الدعوات بالمناسبة: باقات حسب عدد الضيوف، تنتهي بعد المناسبة بأسبوع
  invite: { event: true, packs: { p100: { guests: 100, price: 34900 }, p250: { guests: 250, price: 74900 }, p500: { guests: 500, price: 129000 } } },
};
export const PERIODS = { m: { months: 1, label: 'شهر' }, y: { months: 12, label: 'سنة' } };

// يحسب المبلغ على الخادم دايمًا (العميل يرسل النوع والمدة بس)
export function quote(kind, period, pack, { renew = false, vat = false } = {}) {
  const P = PLANS[kind]; if (!P) return null;
  const lines = [];
  if (P.event) {
    const k = P.packs[pack]; if (!k) return null;
    lines.push({ desc: 'دعوات إلكترونية لمناسبة · ' + k.guests + ' ضيف', amount: k.price });
  } else {
    if (!PERIODS[period]) return null;
    lines.push({ desc: 'اشتراك ' + (period === 'y' ? 'سنوي' : 'شهري'), amount: P[period] });
    const setup = !renew && P.setup && (period === 'm' || P.setupAlways) ? P.setup : 0;
    if (setup) lines.push({ desc: 'تجهيز النظام (مرة وحدة)', amount: setup });
  }
  const total = lines.reduce((a, l) => a + l.amount, 0);
  const vatH = vat ? Math.round(total * 15 / 115) : 0; // السعر شامل الضريبة
  return { lines, total, vat: vatH, net: total - vatH, months: P.event ? 0 : PERIODS[period].months, guests: P.event ? P.packs[pack].guests : 0 };
}

// أشهر تقويمية (مو ٣٠ يوم): ٣١ يناير + شهر = ٢٨/٢٩ فبراير
export function addMonths(ts, n) {
  const d = new Date(ts), day = d.getUTCDate();
  d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d.getTime();
}
export const sar = (h) => (h / 100).toLocaleString('en-US', { minimumFractionDigits: h % 100 ? 2 : 0, maximumFractionDigits: 2 });
