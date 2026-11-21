// محاكاة محادثات كاملة على البوت بدون إنترنت: node test/sim.mjs
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import worker from '../lib/app.js';

const SECRET = 'test-app-secret';
let clock = Date.parse('2026-10-27T17:00:00Z'); // 20:00 الرياض، يوم ثلاثاء = وقت عمل

function makeKV() {
  const m = new Map();
  return {
    m,
    async get(k, type) { const v = m.get(k); if (v == null) return null; return type === 'json' ? JSON.parse(v) : v; },
    async put(k, v) { m.set(k, String(v)); },
  };
}

function makeEnv(over = {}) {
  const sent = [];
  const env = {
    BOT_KV: makeKV(), PHONE_NUMBER_ID: '111', WA_TOKEN: 'tok', APP_SECRET: SECRET, VERIFY_TOKEN: 'verify-me',
    GRAPH_VERSION: 'v26.0', MODE: 'coexistence', OWNER_NAME: 'عبدالرحمن', OWNER_WA: '966582409776', ADMINS: '966500000001',
    LEADS_KEY: 'k123', HUMAN_PAUSE_HOURS: '72',
    __fetch: async (url, init) => { const b = JSON.parse(init.body); sent.push({ url, b }); return new Response('{}', { status: 200 }); },
    ...over,
  };
  return { env, sent };
}

let seq = 0;
const wamid = () => `wamid.${++seq}`;
function payload(from, msg, name = 'عميل') {
  return { object: 'whatsapp_business_account', entry: [{ id: 'w', changes: [{ field: 'messages', value: {
    messaging_product: 'whatsapp', metadata: { phone_number_id: '111' }, contacts: [{ wa_id: from, profile: { name } }],
    messages: [{ from, id: msg.id || wamid(), timestamp: String(Math.floor(clock / 1000)), ...msg }],
  } }] }] };
}
const text = (body) => ({ type: 'text', text: { body } });
const list = (id) => ({ type: 'interactive', interactive: { type: 'list_reply', list_reply: { id, title: id } } });
const btn = (id) => ({ type: 'interactive', interactive: { type: 'button_reply', button_reply: { id, title: id } } });

async function post(env, body, sign = true) {
  const raw = JSON.stringify(body);
  const sig = 'sha256=' + crypto.createHmac('sha256', SECRET).update(raw).digest('hex');
  const req = new Request('https://bot.example/webhook', { method: 'POST', body: raw, headers: { 'content-type': 'application/json', ...(sign ? { 'x-hub-signature-256': sig } : {}) } });
  const origNow = Date.now; Date.now = () => clock;
  try { return await worker.fetch(req, env, null); } finally { Date.now = origNow; }
}
async function say(ctx, from, msg) {
  const before = ctx.sent.length;
  const r = await post(ctx.env, payload(from, msg));
  assert.equal(r.status, 200);
  return ctx.sent.slice(before).map((s) => s.b).filter((b) => !b.status); // نتجاهل إشعارات القراءة
}

// ---- WhatsApp limits check on every outgoing message ----
const issues = [];
function checkLimits(b) {
  if (b.type !== 'interactive') return;
  const i = b.interactive;
  if (i.type === 'button') {
    if (i.body.text.length > 1024) issues.push(`button body ${i.body.text.length}>1024`);
    if (i.action.buttons.length > 3) issues.push('more than 3 buttons');
    for (const x of i.action.buttons) if ([...x.reply.title].length > 20) issues.push(`button title >20: ${x.reply.title}`);
  }
  if (i.type === 'list') {
    if ([...i.action.button].length > 20) issues.push(`list button >20: ${i.action.button}`);
    if (i.action.sections.length > 10) issues.push('sections >10');
    let rows = 0;
    for (const s of i.action.sections) {
      if ([...s.title].length > 24) issues.push(`section title >24: ${s.title}`);
      for (const r of s.rows) { rows++; if ([...r.title].length > 24) issues.push(`row title >24: ${r.title}`); if (r.description && [...r.description].length > 72) issues.push(`row desc >72: ${r.description}`); if (r.id.length > 200) issues.push('row id >200'); }
    }
    if (rows > 10) issues.push(`rows ${rows}>10`);
  }
}
const kind = (b) => (b.type === 'interactive' ? b.interactive.type : b.type);
const bodyOf = (b) => (b.type === 'text' ? b.text.body : b.type === 'interactive' ? b.interactive.body.text : b.type);

let passed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log('✓', name); }
  catch (e) { console.log('✗', name, '\n   ', e.message); process.exitCode = 1; }
}

// ======================================================================
await test('webhook verification (GET)', async () => {
  const { env } = makeEnv();
  const ok = await worker.fetch(new Request('https://b/webhook?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=42'), env, null);
  assert.equal(ok.status, 200); assert.equal(await ok.text(), '42');
  const bad = await worker.fetch(new Request('https://b/webhook?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=42'), env, null);
  assert.equal(bad.status, 403);
});

await test('rejects unsigned / forged webhook', async () => {
  const ctx = makeEnv();
  const r = await post(ctx.env, payload('966511111111', text('هلا')), false);
  assert.equal(r.status, 401); assert.equal(ctx.sent.length, 0);
});

await test('full conversation: menu → service → questions → confirm → handoff', async () => {
  const ctx = makeEnv(); const c = '966511111111';
  let out = await say(ctx, c, text('السلام عليكم'));
  out.forEach(checkLimits); assert.equal(kind(out[0]), 'list'); assert.match(bodyOf(out[0]), /شاهين ديزاين/);
  out = await say(ctx, c, list('cat_co')); out.forEach(checkLimits); assert.equal(kind(out[0]), 'list'); assert.equal(out[0].interactive.action.sections[0].rows.length, 9);
  out = await say(ctx, c, list('svc_data')); assert.match(bodyOf(out[0]), /اسمك/);
  out = await say(ctx, c, text('عبدالرحمن محمد')); // اسم فيه كلمة "عبدالرحمن" — لازم ينحفظ كاسم مو تحويل
  out.forEach(checkLimits); assert.equal(kind(out[0]), 'button'); assert.match(bodyOf(out[0]), /البراند أو الجهة/);
  out = await say(ctx, c, text('شركة الريادة')); out.forEach(checkLimits); assert.match(bodyOf(out[0]), /متى تحتاج/);
  out = await say(ctx, c, btn('tl2')); out.forEach(checkLimits); assert.equal(kind(out[0]), 'list');
  out = await say(ctx, c, list('b3')); out.forEach(checkLimits); assert.match(bodyOf(out[0]), /وصف مختصر/);
  out = await say(ctx, c, text('عندنا ٣ فروع ونبي تقارير مبيعات يومية'));
  out.forEach(checkLimits); assert.match(bodyOf(out[0]), /أتمتة البيانات وتحليلها/); assert.match(bodyOf(out[0]), /عبدالرحمن محمد/);
  out = await say(ctx, c, btn('c_ok'));
  assert.match(bodyOf(out[0]), /SD-\d{6}-[A-Z0-9]{4}/); assert.match(bodyOf(out[0]), /نفس المحادثة/); assert.match(bodyOf(out[0]), /متواجد الحين/);
  const idx = await ctx.env.BOT_KV.get('leads:index', 'json'); assert.equal(idx.length, 1);
  const lead = await ctx.env.BOT_KV.get(`lead:${idx[0]}`, 'json');
  assert.equal(lead.name, 'عبدالرحمن محمد'); assert.equal(lead.serviceName, 'أتمتة البيانات وتحليلها'); assert.equal(lead.budget, '١٥ – ٤٠ ألف ريال');
  // bot stays quiet while a human handles the chat
  out = await say(ctx, c, text('شكرًا')); assert.equal(out.length, 0);
  // ...unless the client asks for the menu
  out = await say(ctx, c, text('القائمة')); assert.equal(kind(out[0]), 'list');
  globalThis.__transcript = ctx.sent.map((s) => s.b);
});

await test('website order message is recognised and skips the questions', async () => {
  const ctx = makeEnv(); const c = '966522222222';
  const msg = 'طلب جديد من الموقع\nرقم الطلب: SD-261027-CTLD\nالاسم: أحمد\nالجهة: شركة الاختبار\nالقسم: للشركات والمؤسسات\nالخدمات: أتمتة البيانات وتحليلها\nالموعد: خلال شهر\nالميزانية: ٥ – ١٥ ألف ريال\nالتفاصيل: عندنا ٤٠ موظف ونبي تقارير أسبوعية';
  let out = await say(ctx, c, text(msg)); out.forEach(checkLimits);
  assert.equal(kind(out[0]), 'button'); assert.match(bodyOf(out[0]), /SD-261027-CTLD/); assert.match(bodyOf(out[0]), /كيف تحب/);
  out = await say(ctx, c, btn('pref_call'));
  assert.match(bodyOf(out[0]), /SD-261027-CTLD/);
  const lead = await ctx.env.BOT_KV.get('lead:SD-261027-CTLD', 'json');
  assert.equal(lead.source, 'website'); assert.equal(lead.pref, 'اتصال'); assert.equal(lead.org, 'شركة الاختبار');
});

await test('website call booking goes straight to handoff', async () => {
  const ctx = makeEnv(); const c = '966533333333';
  const out = await say(ctx, c, text('طلب مكالمة من الموقع\nالاسم: سارة\nالنوع: مكالمة جوال\nالموعد: الأربعاء، ٢٨ أكتوبر الساعة ٨:٠٠ مساءً'));
  assert.equal(out.length, 2); assert.match(bodyOf(out[0]), /طلب المكالمة/); assert.match(bodyOf(out[1]), /SD-/);
});

await test('"talk to a human" asks the name then hands off', async () => {
  const ctx = makeEnv(); const c = '966544444444';
  await say(ctx, c, text('هلا'));
  let out = await say(ctx, c, list('human')); assert.match(bodyOf(out[0]), /اسمك/);
  out = await say(ctx, c, text('نورة')); assert.match(bodyOf(out[0]), /حولتك/);
});

await test('typing "موظف" at a menu step hands off', async () => {
  const ctx = makeEnv(); const c = '966544444445';
  await say(ctx, c, text('هلا'));
  const out = await say(ctx, c, text('ابي اكلم موظف')); assert.match(bodyOf(out[0]), /اسمك/);
});

await test('never gets stuck: 3 wrong answers → handoff', async () => {
  const ctx = makeEnv(); const c = '966555555555';
  await say(ctx, c, text('هلا'));
  await say(ctx, c, text('كم السعر؟'));
  await say(ctx, c, text('؟؟'));
  const out = await say(ctx, c, text('طيب'));
  assert.match(bodyOf(out[out.length - 1]), /وصل إلى|حولتك/);
});

await test('duplicate webhook delivery is processed once', async () => {
  const ctx = makeEnv(); const c = '966566666666';
  const p = payload(c, { ...text('هلا'), id: 'wamid.dup' });
  await post(ctx.env, p); const n = ctx.sent.length; await post(ctx.env, p);
  assert.equal(ctx.sent.length, n);
});

await test('owner replying from the WhatsApp Business app pauses the bot (echo)', async () => {
  const ctx = makeEnv(); const c = '966577777777';
  await say(ctx, c, text('هلا'));
  await post(ctx.env, { object: 'whatsapp_business_account', entry: [{ changes: [{ field: 'smb_message_echoes', value: { message_echoes: [{ from: '966582409776', to: c, id: 'e1', type: 'text', text: { body: 'هلا، أنا عبدالرحمن' } }] } }] }] });
  const out = await say(ctx, c, list('cat_brand')); assert.equal(out.length, 0);
});

await test('admin commands + free lead alerts while the admin window is open', async () => {
  const ctx = makeEnv(); const admin = '966500000001'; const c = '966588888888';
  let out = await say(ctx, admin, text('مرحبا')); assert.match(bodyOf(out[0]), /أوامر المشرف/);
  await say(ctx, c, text('هلا')); await say(ctx, c, list('human'));
  out = await say(ctx, c, text('خالد'));
  const alert = out.find((b) => b.to === admin); assert.ok(alert, 'admin should get the lead'); assert.match(bodyOf(alert), /خالد/);
  out = await say(ctx, admin, text('#طلبات')); assert.match(bodyOf(out[0]), /خالد/);
  out = await say(ctx, admin, text(`#وقف ${c}`)); assert.match(bodyOf(out[0]), /وقفت/);
  out = await say(ctx, admin, text(`#شغل ${c}`)); assert.match(bodyOf(out[0]), /رجعت/);
  out = await say(ctx, c, text('هلا')); assert.equal(kind(out[0]), 'list');
});

await test('alert via template when admin window is closed', async () => {
  const ctx = makeEnv({ OWNER_ALERT_TEMPLATE: 'new_lead_alert' }); const c = '966599999999';
  await say(ctx, c, text('هلا')); await say(ctx, c, list('human'));
  const out = await say(ctx, c, text('ريم'));
  const t = out.find((b) => b.type === 'template'); assert.ok(t); assert.equal(t.template.name, 'new_lead_alert'); assert.equal(t.template.components[0].parameters.length, 4);
});

await test('welcome menu lists ready-made systems and they can be picked', async () => {
  const ctx = makeEnv(); const c = '966510000099';
  const w = await say(ctx, c, text('هلا'));
  const rows = w[0].interactive.action.sections.flatMap((s) => s.rows.map((r) => r.id));
  assert.equal(rows[0], 'cat_ready');
  const svc = await say(ctx, c, list('cat_ready'));
  const ids = svc[0].interactive.action.sections[0].rows.map((r) => r.id);
  for (const id of ['svc_wallet', 'svc_salon', 'svc_menu', 'svc_invite']) assert.ok(ids.includes(id), id);
  assert.ok(ids.length <= 10);
});

await test('separate-number mode gives the client a link to the owner', async () => {
  const ctx = makeEnv({ MODE: 'separate' }); const c = '966510000000';
  await say(ctx, c, text('هلا')); await say(ctx, c, list('human'));
  const out = await say(ctx, c, text('فهد'));
  assert.equal(out[0].interactive.type, 'cta_url');
  assert.match(out[0].interactive.action.parameters.url, /wa\.me\/966582409776\?text=/);
  assert.ok(out[0].interactive.action.parameters.display_text.length <= 20);
  assert.doesNotMatch(bodyOf(out[0]), /https?:/); // الرابط في الزر مو في النص
});

await test('outside working hours the client is told when to expect a reply', async () => {
  const ctx = makeEnv(); const c = '966510000001';
  const saved = clock; clock = Date.parse('2026-10-30T09:00:00Z'); // جمعة
  await say(ctx, c, text('هلا')); await say(ctx, c, list('human'));
  const out = await say(ctx, c, text('منى')); assert.match(bodyOf(out[0]), /أوقات العمل/);
  clock = saved;
});

await test('stale session resets after 24h', async () => {
  const ctx = makeEnv(); const c = '966510000002';
  await say(ctx, c, text('هلا')); await say(ctx, c, list('cat_brand'));
  clock += 25 * 3600 * 1000;
  const out = await say(ctx, c, text('هلا')); assert.equal(kind(out[0]), 'list'); assert.match(bodyOf(out[0]), /من جديد/);
});

await test('attachment in details step is accepted', async () => {
  const ctx = makeEnv(); const c = '966510000003';
  await say(ctx, c, text('هلا')); await say(ctx, c, list('cat_brand')); await say(ctx, c, list('svc_salla'));
  await say(ctx, c, text('ليلى')); await say(ctx, c, btn('skip_org')); await say(ctx, c, btn('tl1')); await say(ctx, c, list('b5'));
  const out = await say(ctx, c, { type: 'image', image: { id: 'media1' } }); assert.match(bodyOf(out[0]), /مرفق/);
});

await test('leads page needs the key and escapes content', async () => {
  const ctx = makeEnv(); const c = '966510000004';
  await say(ctx, c, text('هلا')); await say(ctx, c, list('human')); await say(ctx, c, text('<b>x</b>'));
  const no = await worker.fetch(new Request('https://b/leads'), ctx.env, null); assert.equal(no.status, 403);
  const ok = await worker.fetch(new Request('https://b/leads?key=k123'), ctx.env, null); const html = await ok.text();
  assert.equal(ok.status, 200); assert.ok(html.includes('&lt;b&gt;x&lt;/b&gt;')); assert.ok(!html.includes('<b>x</b>'));
});

await test('every message respects WhatsApp limits', async () => {
  assert.deepEqual(issues, []);
});

console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}`);
if (process.argv.includes('--transcript')) {
  console.log('\n--- نموذج محادثة ---');
  for (const b of globalThis.__transcript || []) {
    if (b.status) continue;
    const opts = b.type === 'interactive' ? (b.interactive.type === 'button' ? b.interactive.action.buttons.map((x) => `[${x.reply.title}]`).join(' ') : b.interactive.action.sections.flatMap((s) => s.rows.map((r) => `• ${r.title}`)).join('\n')) : '';
    console.log(`\nالبوت → ${bodyOf(b)}${opts ? '\n' + opts : ''}`);
  }
}
