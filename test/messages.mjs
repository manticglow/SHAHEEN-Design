// رسائل الواتساب القابلة للتعديل + قوالب التأكيد والتذكير: node test/messages.mjs
import assert from 'node:assert/strict';
import { fill, messagesFrom, templatesFrom } from '../lib/messages.js';
import { createBot } from '../lib/flow.js';
import { sendReminders, customerBookingNotice } from '../lib/notify.js';
import { validate } from '../lib/cms.js';
import { DEFAULT_CONTENT } from '../lib/content-default.js';

function makeKV() { const m = new Map(); return { m, async get(k, t) { const v = m.get(k); if (v == null) return null; return t === 'json' ? JSON.parse(v) : v; }, async put(k, v) { m.set(k, String(v)); } }; }
let n = 0; const ok = (name) => { n++; console.log('✓ ' + name); };

assert.equal(fill('هلا يا {الاسم}، طلبك {رقم_الطلب}', { name: 'سارة', id: 'SD-1' }), 'هلا يا سارة، طلبك SD-1');
assert.equal(fill('هلا فيك يا {الاسم} 🦅', { name: '' }), 'هلا فيك 🦅');
assert.equal(fill('{المالك} متواجد', { owner: 'عبدالرحمن' }), 'عبدالرحمن متواجد');
ok('المتغيرات تتبدل، و"يا" تنشال إذا الاسم فاضي');

assert.match(messagesFrom({ messages: { welcome: 'أهلين {الاسم}' } }).welcome, /أهلين/);
assert.match(messagesFrom({ messages: { welcome: '   ' } }).welcome, /شاهين ديزاين/);
assert.equal(templatesFrom({ settings: { templates: { bookingConfirm: 'x' } } }).lang, 'ar');
ok('النص الفاضي يرجع للأصلي');

// البوت يستخدم الترحيب المعدّل
const sent = [];
const api = new Proxy({}, { get: (_, k) => async (...a) => { sent.push([k, ...a]); return {}; } });
const bot = createBot({ kv: makeKV(), api, cfg: { mode: 'separate', ownerName: 'عبدالرحمن', ownerWa: '966500000009', admins: [], workDays: [0, 1, 2, 3, 4, 5, 6], workStart: 0, workEnd: 24, tzOffset: 3, pauseMs: 1 }, messages: { welcome: 'مرحبا في الاستوديو يا {الاسم}' } });
await bot.handle({ entry: [{ changes: [{ value: { contacts: [{ wa_id: '966511111111', profile: { name: 'خالد' } }], messages: [{ id: 'w1', from: '966511111111', type: 'text', text: { body: 'هلا' } }] } }] }] });
const welcome = sent.find((s) => s[0] === 'list');
assert.ok(welcome, 'welcome list sent'); assert.match(welcome[2].body, /^مرحبا في الاستوديو/);
ok('البوت يرسل الترحيب اللي انكتب في اللوحة');

// التحقق من المحتوى
const c = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
c.messages = { welcome: 'x'.repeat(901) }; c.settings.templates = { bookingConfirm: 'Booking Confirm!' };
const errs = validate(c);
assert.ok(errs.some((e) => /الترحيب/.test(e)) && errs.some((e) => /قالب تأكيد الموعد/.test(e)));
c.messages = { welcome: 'هلا' }; c.settings.templates = { bookingConfirm: 'booking_confirmation', lang: 'ar' };
assert.deepEqual(validate(c), []);
ok('اللوحة ترفض النص الطويل واسم القالب الغلط');

// تأكيد الموعد للعميل
const t1 = [];
const api2 = { template: async (...a) => { t1.push(a); } };
assert.equal(await customerBookingNotice({ api: api2, templates: { lang: 'ar' }, lead: { wa: '9665', name: 'سارة', timeline: 'الأحد' } }), false);
await customerBookingNotice({ api: api2, templates: { lang: 'ar', bookingConfirm: 'booking_confirmation' }, lead: { wa: '966512345678', name: 'سارة', timeline: 'الأحد 15 نوفمبر، 5:30 م' } });
assert.deepEqual(t1[0], ['966512345678', 'booking_confirmation', 'ar', ['سارة', 'الأحد 15 نوفمبر، 5:30 م']]);
ok('تأكيد الموعد يروح للعميل بالقالب');

// التذكير: مواعيد اليوم بس، ومرة وحدة، والملغي لا
const kv = makeKV();
const now = Date.UTC(2026, 10, 16, 6, 0); // ٩ الصبح بتوقيت السعودية
const mk = (id, slot, extra = {}) => kv.put(`lead:${id}`, JSON.stringify({ id, kind: 'booking', slot, wa: '9665' + id, name: 'ع' + id, timeline: slot, ...extra }));
await mk('1', '2026-11-16T18:00'); await mk('2', '2026-11-17T18:00'); await mk('3', '2026-11-16T19:00', { status: 'ملغي' }); await mk('4', '2026-11-16T20:00');
await kv.put('leads:index', JSON.stringify(['1', '2', '3', '4']));
const t2 = []; const api3 = { template: async (...a) => { t2.push(a); } };
const r1 = await sendReminders({ kv, api: api3, templates: { lang: 'ar', bookingReminder: 'booking_reminder' }, now });
assert.equal(r1.sent, 2); assert.deepEqual(t2.map((x) => x[0]).sort(), ['96651', '96654']);
const r2 = await sendReminders({ kv, api: api3, templates: { lang: 'ar', bookingReminder: 'booking_reminder' }, now });
assert.equal(r2.sent, 0);
assert.equal((await sendReminders({ kv, api: api3, templates: {}, now })).sent, 0);
ok('التذكير لمواعيد اليوم بس، مرة وحدة، ويتجاهل الملغي');

console.log(`\n${n} passed`);
