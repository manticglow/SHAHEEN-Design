// أدوات مشتركة بين الأنظمة
import { randomCode, ksaDay, same } from '../core.js';
export const newKey = () => randomCode(12);
// العميل بدون حساب يتابع طلبه/حجزه بمفتاح ينحفظ في جواله: d.mine = [[id, key], ...]
export function mine(list, d, R, custField = 'cust') {
  const pairs = (Array.isArray(d.mine) ? d.mine : []).slice(0, 30).filter((p) => Array.isArray(p) && p.length === 2).map((p) => [String(p[0]), String(p[1])]);
  return list.filter((x) => (x[custField] && R.cust.has(x[custField])) || pairs.some(([id, k]) => id === x.id && x.key && same(x.key, k)));
}
export const strip = (o, ...keys) => { const c = { ...o }; for (const k of keys) delete c[k]; return c; };
export const todayOf = (list, now, field = 'at') => list.filter((x) => ksaDay(Date.parse(x[field])) === ksaDay(now));
export const sum = (a, f) => a.reduce((t, x) => t + (Number(f(x)) || 0), 0);
export function top(list, keyFn, n = 5) { const m = {}; for (const x of list) { const k = keyFn(x); if (k) m[k] = (m[k] || 0) + 1; } return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n); }
export const lastDays = (now, n) => Array.from({ length: n }, (_, i) => ksaDay(now, i - n + 1));
export const myCard = (s, R) => [...R.cust].map((id) => s.customers[id]).filter(Boolean).map((c) => ({ id: c.id, name: c.name, phone: c.phone, code: c.code, stamps: c.stamps || 0, rewards: c.rewards || 0, ...(c.unit ? { unit: c.unit, project: c.project, handover: c.handover, until: c.until } : {}) }));
// بيانات تجريبية ثابتة (نفس النتيجة كل يوم)
export function rng(seed) { let x = seed % 2147483647 || 7; return () => (x = (x * 48271) % 2147483647) / 2147483647; }
export const pastAt = (now, daysAgo, minute) => new Date(Date.parse(ksaDay(now, -daysAgo) + 'T00:00:00Z') - 3 * 3600e3 + minute * 60e3).toISOString();
