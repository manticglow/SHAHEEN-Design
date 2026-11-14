// منطق المحادثة — مستقل عن Cloudflare عشان نقدر نختبره
import * as STATIC from './catalog.js';

const RESTART_WORDS = ['القائمة', 'قائمة', 'ابدأ', 'ابدا', 'البداية', 'menu', 'start', '0', '٠'];
const HUMAN_WORDS = ['موظف', 'عبدالرحمن', 'عبد الرحمن', 'شخص', 'بشري', 'agent', 'human', 'أكلم أحد', 'اكلم احد'];
const SESSION_TTL_MS = 24 * 3600 * 1000;
const MAX_RETRIES = 2;

const norm = (t) => String(t || '').trim().replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase();
const hasWord = (text, words) => { const t = norm(text); return words.some((w) => t === norm(w) || (norm(w).length > 3 && t.includes(norm(w)))); };
const isExact = (text, words) => { const t = norm(text).replace(/[.!؟?،,]/g, ''); return words.some((w) => t === norm(w)); };
const FREE_TEXT_STEPS = ['name', 'name_h', 'org', 'details', 'svc_text', 'lookup'];
const clip = (s, n) => (String(s || '').length > n ? String(s).slice(0, n - 1) + '…' : String(s || ''));

export function cfgFrom(env) {
  return {
    mode: env.MODE === 'separate' ? 'separate' : 'coexistence',
    ownerName: env.OWNER_NAME || 'عبدالرحمن',
    ownerWa: (env.OWNER_WA || '').replace(/\D/g, ''),
    admins: String(env.ADMINS || '').split(',').map((x) => x.replace(/\D/g, '')).filter(Boolean),
    workDays: String(env.WORK_DAYS ?? '0,1,2,3,4').split(',').map(Number),
    workStart: Number(env.WORK_START ?? 17),
    workEnd: Number(env.WORK_END ?? 23),
    tzOffset: Number(env.TZ_OFFSET ?? 3),
    pauseMs: Number(env.HUMAN_PAUSE_HOURS ?? 72) * 3600 * 1000,
    alertTemplate: env.OWNER_ALERT_TEMPLATE || '',
    templateLang: env.TEMPLATE_LANG || 'ar',
  };
}

export function makeId(now) {
  const d = new Date(now + 3 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = '';
  for (let i = 0; i < 4; i++) r += c[Math.floor(Math.random() * c.length)];
  return `SD-${String(d.getUTCFullYear()).slice(2)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${r}`;
}

export function isWorkingNow(cfg, now) {
  const local = new Date(now + cfg.tzOffset * 3600 * 1000);
  const day = local.getUTCDay();
  const h = local.getUTCHours();
  return cfg.workDays.includes(day) && h >= cfg.workStart && h < cfg.workEnd;
}

// يقرأ رسالة الطلب اللي يرسلها نموذج الموقع
export function parseWebsiteMessage(text) {
  const t = String(text || '');
  const isOrder = /طلب جديد من الموقع/.test(t);
  const isCall = /طلب مكالمة من الموقع/.test(t);
  if (!isOrder && !isCall) return null;
  const keys = { 'رقم الطلب': 'id', 'الاسم': 'name', 'الجهة': 'org', 'القسم': 'group', 'الخدمات': 'services', 'الموعد': 'timeline', 'الميزانية': 'budget', 'التفاصيل': 'details', 'النوع': 'callType' };
  const out = { kind: isCall ? 'call' : 'order' };
  for (const line of t.split(/\r?\n/)) {
    const m = line.match(/^\s*([^:：]{2,20})\s*[:：]\s*(.+)$/);
    if (m && keys[m[1].trim()]) out[keys[m[1].trim()]] = m[2].trim().slice(0, 600);
  }
  if (out.id && !/^SD-\d{6}-[A-Z0-9]{4}$/.test(out.id)) delete out.id;
  return out;
}

export function createBot({ kv, api, now = () => Date.now(), cfg, log = () => {}, catalog }) {
  // الخدمات تجي من لوحة التحكم، وإذا ما فيه نرجع للقائمة الثابتة
  const { GROUPS, SERVICES, TIMELINES, BUDGETS } = catalog || STATIC;
  const findService = (id) => {
    for (const g of Object.keys(SERVICES)) { const s = SERVICES[g].find((x) => x[0] === id); if (s) return { group: g, id: s[0], name: s[1] }; }
    return null;
  };
  // ---------- storage ----------
  const getUser = async (wa) => (await kv.get(`u:${wa}`, 'json')) || { step: 'new', data: {}, retries: 0 };
  const putUser = (wa, u) => kv.put(`u:${wa}`, JSON.stringify({ ...u, updated: now() }), { expirationTtl: 60 * 60 * 24 * 60 });
  const seen = async (id) => { if (!id) return false; if (await kv.get(`m:${id}`)) return true; await kv.put(`m:${id}`, '1', { expirationTtl: 86400 }); return false; };

  async function saveLead(lead) {
    await kv.put(`lead:${lead.id}`, JSON.stringify(lead));
    const idx = (await kv.get('leads:index', 'json')) || [];
    idx.unshift(lead.id);
    await kv.put('leads:index', JSON.stringify(idx.slice(0, 200)));
  }
  async function recentLeads(n = 5) {
    const idx = (await kv.get('leads:index', 'json')) || [];
    const out = [];
    for (const id of idx.slice(0, n)) { const l = await kv.get(`lead:${id}`, 'json'); if (l) out.push(l); }
    return out;
  }

  // ---------- prompts ----------
  const P = {
    welcome: (to, name, again) => api.list(to, {
      body: `${again ? 'هلا فيك من جديد' : 'هلا فيك في شاهين ديزاين'}${name ? ' يا ' + name : ''}.\nأنا مساعد ${cfg.ownerName}، أرتب معك طلبك في أقل من دقيقة وأوصله له.\n\nوش يناسبك؟`,
      button: 'اختر من هنا',
      sections: [
        { title: 'الخدمات', rows: Object.entries(GROUPS).filter(([k]) => (SERVICES[k] || []).length).map(([k, g]) => ({ id: `cat_${k}`, title: g.title, description: g.desc })) },
        { title: 'أخرى', rows: [
          { id: 'old_order', title: 'عندي طلب سابق', description: 'أتابع طلب أرسلته قبل' },
          { id: 'human', title: `أكلم ${cfg.ownerName} مباشرة`, description: 'أحولك له على طول' },
        ] },
      ],
    }),
    services: (to, g) => api.list(to, {
      body: 'تمام، اختر الخدمة اللي تحتاجها:',
      button: 'الخدمات',
      sections: [{ title: GROUPS[g].label, rows: [
        ...SERVICES[g].map((s) => ({ id: `svc_${s[0]}`, title: s[2], description: s[3] })),
        { id: 'svc_other', title: 'خدمة ثانية', description: 'اكتبها لنا بكلماتك' },
      ] }],
    }),
    svcText: (to) => api.text(to, 'اكتب لي باختصار وش تحتاج.'),
    name: (to) => api.text(to, 'حلو. وش اسمك الكريم؟'),
    org: (to) => api.buttons(to, 'وش اسم البراند أو الجهة؟ اكتبه، أو اضغط تخطي.', [{ id: 'skip_org', title: 'تخطي' }]),
    timeline: (to) => api.buttons(to, 'متى تحتاج المشروع؟', TIMELINES.map(([id, t]) => ({ id, title: t }))),
    budget: (to) => api.list(to, {
      body: 'كم الميزانية التقريبية؟ تساعدنا نقترح لك الأنسب، وما تلزمك بشي.',
      button: 'الميزانية',
      sections: [{ title: 'الميزانية التقريبية', rows: BUDGETS.map(([id, t]) => ({ id, title: t })) }],
    }),
    details: (to) => api.buttons(to, 'اكتب وصف مختصر لطلبك، أو أرسل صورة أو ملف أو رابط يوضح اللي تبيه.', [{ id: 'skip_details', title: 'ما عندي إضافات' }]),
    confirm: (to, d) => api.buttons(to, `هذا ملخص طلبك:\n\n${summary(d)}\n\nكل شي صحيح؟`, [
      { id: 'c_ok', title: 'تأكيد الطلب' },
      { id: 'c_edit', title: 'تعديل' },
      { id: 'human', title: `أكلم ${cfg.ownerName}` },
    ]),
    contactPref: (to, d) => api.buttons(to,
      `هلا ${d.name || ''}، استلمنا طلبك رقم ${d.id}.\n\n${summary(d)}\n\nكيف تحب ${cfg.ownerName} يتواصل معك؟`,
      [{ id: 'pref_wa', title: 'واتساب' }, { id: 'pref_call', title: 'اتصال' }, { id: 'pref_meet', title: 'اجتماع أونلاين' }]),
    orderLookup: (to) => api.text(to, 'اكتب رقم طلبك (يبدأ بـ SD-)، أو اكتب اسمك ونوصل له.'),
  };

  function summary(d) {
    const rows = [
      ['رقم الطلب', d.id],
      ['الاسم', d.name], ['الجهة', d.org],
      ['القسم', d.group && GROUPS[d.group] ? GROUPS[d.group].label : d.groupLabel],
      ['الخدمة', d.serviceName || d.services],
      ['الموعد', d.timeline], ['الميزانية', d.budget], ['التفاصيل', d.details && clip(d.details, 200)],
      ['طريقة التواصل', d.pref],
    ];
    return rows.filter((r) => r[1]).map((r) => `${r[0]}: ${r[1]}`).join('\n');
  }

  // ---------- handoff ----------
  async function handoff(to, u, reason) {
    const d = u.data;
    if (!d.id) d.id = makeId(now());
    const lead = { ...d, wa: to, reason, at: new Date(now()).toISOString(), source: d.source || 'bot' };
    await saveLead(lead);
    const open = isWorkingNow(cfg, now());
    const when = open
      ? `${cfg.ownerName} متواجد الحين وبيرد عليك قريب.`
      : `${cfg.ownerName} يرد في أوقات العمل (الأحد إلى الخميس، مساءً)، وطلبك محفوظ عندنا.`;
    let msg;
    if (reason === 'human' && !d.serviceName && !d.services) {
      msg = `أبشر${d.name ? ' يا ' + d.name : ''}. حولتك إلى ${cfg.ownerName}، ورقم محادثتك ${d.id}.\n${when}`;
    } else {
      msg = `تم${d.name ? ' يا ' + d.name : ''}. طلبك رقم ${d.id} وصل إلى ${cfg.ownerName}.\n${when}`;
    }
    if (cfg.mode === 'separate' && cfg.ownerWa) {
      const pre = encodeURIComponent(`السلام عليكم، معك ${d.name || ''}.\n${summary(d)}`);
      msg += `\n\nتقدر تكمل معه مباشرة من هنا:\nhttps://wa.me/${cfg.ownerWa}?text=${pre}`;
    } else {
      msg += '\nبيكمل معك هنا في نفس المحادثة.';
    }
    await api.text(to, msg);
    await alertOwner(lead);
    u.step = 'human'; u.retries = 0; u.pausedUntil = now() + cfg.pauseMs;
    await putUser(to, u);
  }

  async function alertOwner(lead) {
    const text = `طلب جديد ${lead.id}\n${summary(lead)}\nرقم العميل: +${lead.wa}`;
    const lastSeen = Number((await kv.get('owner:lastSeen')) || 0);
    const adminInWindow = cfg.admins.length && now() - lastSeen < 23 * 3600 * 1000;
    try {
      if (adminInWindow) { for (const a of cfg.admins) await api.text(a, text); return; }
      if (cfg.alertTemplate && cfg.admins.length) {
        for (const a of cfg.admins) {
          await api.template(a, cfg.alertTemplate, cfg.templateLang, [lead.name || '-', clip(lead.serviceName || lead.services || lead.reason, 60), lead.id, '+' + lead.wa]);
        }
      }
    } catch (e) { log('alert failed', String(e)); }
  }

  // ---------- admin commands ----------
  async function admin(from, text) {
    await kv.put('owner:lastSeen', String(now()));
    const t = String(text || '').trim();
    const num = (t.match(/(\+?\d[\d\s]{7,})/) || [])[1]?.replace(/\D/g, '');
    if (/^#?(طلبات|leads)/i.test(t)) {
      const ls = await recentLeads(5);
      return api.text(from, ls.length ? ls.map((l) => `${l.id} · ${l.name || '-'} · ${l.serviceName || l.services || l.reason} · +${l.wa}`).join('\n') : 'ما فيه طلبات للحين.');
    }
    if (/^#?(شغل|bot|resume)/i.test(t) && num) {
      const u = await getUser(num); u.step = 'new'; u.pausedUntil = 0; await putUser(num, u);
      return api.text(from, `رجعت البوت يرد على +${num}.`);
    }
    if (/^#?(وقف|stop|pause)/i.test(t) && num) {
      const u = await getUser(num); u.step = 'human'; u.pausedUntil = now() + cfg.pauseMs; await putUser(num, u);
      return api.text(from, `وقفت البوت عن +${num}، المحادثة عندك.`);
    }
    return api.text(from, 'أوامر المشرف:\n#طلبات — آخر ٥ طلبات\n#وقف 9665xxxxxxxx — توقف البوت عن عميل\n#شغل 9665xxxxxxxx — ترجع البوت لعميل\n\nإرسال أي رسالة هنا يفعّل تنبيهات الطلبات الجديدة لمدة ٢٤ ساعة (مجانًا).');
  }

  // ---------- main ----------
  async function onMessage(m, profileName) {
    const from = m.from;
    if (await seen(m.id)) return;
    api.read(m.id).catch(() => {});
    const text = m.type === 'text' ? m.text?.body || '' : '';
    const reply = m.type === 'interactive' ? (m.interactive?.list_reply?.id || m.interactive?.button_reply?.id) : (m.type === 'button' ? m.button?.payload : null);

    if (cfg.admins.includes(from)) return admin(from, text);

    let u = await getUser(from);
    const t = now();

    // paused: a human is handling this chat
    if (u.step === 'human') {
      if (u.pausedUntil > t && !(text && isExact(text, RESTART_WORDS))) return;
      u = { step: 'new', data: { name: u.data?.name, org: u.data?.org }, retries: 0, returning: true };
    }
    // stale session
    if (u.step !== 'new' && u.updated && t - u.updated > SESSION_TTL_MS) u = { step: 'new', data: { name: u.data?.name, org: u.data?.org }, retries: 0, returning: true };

    // website order / call message
    const web = text && parseWebsiteMessage(text);
    if (web) {
      u.data = { ...u.data, source: 'website', id: web.id || makeId(t), name: web.name, org: web.org, groupLabel: web.group, services: web.services, timeline: web.timeline, budget: web.budget, details: web.details };
      if (web.kind === 'call') {
        u.data.services = 'مكالمة تعارف'; u.data.pref = `${web.callType || 'مكالمة'} · ${web.timeline || ''}`;
        await api.text(from, `هلا ${web.name || ''}، وصلنا طلب المكالمة (${web.timeline || ''}).`);
        return handoff(from, u, 'call');
      }
      u.step = 'pref'; u.retries = 0; await putUser(from, u);
      return P.contactPref(from, u.data);
    }

    // global shortcuts
    if (text && isExact(text, RESTART_WORDS)) { u = { step: 'cat', data: { name: u.data?.name, org: u.data?.org }, retries: 0 }; await putUser(from, u); return P.welcome(from, u.data.name); }
    if (reply === 'human' || (text && !FREE_TEXT_STEPS.includes(u.step) && hasWord(text, HUMAN_WORDS))) {
      if (!u.data.name) { u.step = 'name_h'; await putUser(from, u); return P.name(from); }
      return handoff(from, u, 'human');
    }

    const retry = async (prompt) => {
      u.retries = (u.retries || 0) + 1;
      if (u.retries > MAX_RETRIES) return handoff(from, u, 'stuck');
      await putUser(from, u);
      await api.text(from, 'اختر من الخيارات تحت عشان أقدر أساعدك، أو اكتب "موظف" وأحولك مباشرة.');
      return prompt();
    };
    const next = async (step, prompt) => { u.step = step; u.retries = 0; await putUser(from, u); return prompt(); };
    const d = u.data;

    switch (u.step) {
      case 'new':
        if (profileName && !d.profileName) d.profileName = profileName;
        return next('cat', () => P.welcome(from, d.name, u.returning));

      case 'cat':
        if (reply && reply.startsWith('cat_') && GROUPS[reply.slice(4)]) { d.group = reply.slice(4); return next('svc', () => P.services(from, d.group)); }
        if (reply === 'old_order') return next('lookup', () => P.orderLookup(from));
        return retry(() => P.welcome(from, d.name));

      case 'svc':
        if (reply === 'svc_other') return next('svc_text', () => P.svcText(from));
        if (reply && reply.startsWith('svc_')) {
          const s = findService(reply.slice(4));
          if (s) { d.serviceId = s.id; d.serviceName = s.name; return afterService(); }
        }
        return retry(() => P.services(from, d.group));

      case 'svc_text':
        if (text) { d.serviceName = clip(text, 200); return afterService(); }
        return retry(() => P.svcText(from));

      case 'name':
      case 'name_h':
        if (text && text.length <= 60 && !parseWebsiteMessage(text)) {
          d.name = text.trim();
          if (u.step === 'name_h') return handoff(from, u, 'human');
          return d.org ? next('timeline', () => P.timeline(from)) : next('org', () => P.org(from));
        }
        return retry(() => P.name(from));

      case 'org':
        if (reply === 'skip_org') return next('timeline', () => P.timeline(from));
        if (text) { d.org = clip(text.trim(), 80); return next('timeline', () => P.timeline(from)); }
        return retry(() => P.org(from));

      case 'timeline': {
        const tl = TIMELINES.find((x) => x[0] === reply);
        if (tl) { d.timeline = tl[1]; return next('budget', () => P.budget(from)); }
        return retry(() => P.timeline(from));
      }

      case 'budget': {
        const b = BUDGETS.find((x) => x[0] === reply);
        if (b) { d.budget = b[1]; return next('details', () => P.details(from)); }
        return retry(() => P.budget(from));
      }

      case 'details':
        if (reply === 'skip_details') return next('confirm', () => P.confirm(from, d));
        if (text) { d.details = clip(text, 600); return next('confirm', () => P.confirm(from, d)); }
        if (['image', 'document', 'video', 'audio'].includes(m.type)) {
          d.attachments = (d.attachments || 0) + 1;
          d.details = (d.details ? d.details + ' · ' : '') + `أرسل مرفق (${m.type})`;
          return next('confirm', () => P.confirm(from, d));
        }
        return retry(() => P.details(from));

      case 'confirm':
        if (reply === 'c_ok') return handoff(from, u, 'order');
        if (reply === 'c_edit') {
          u.data = { name: d.name, org: d.org };
          return next('cat', () => P.welcome(from, d.name));
        }
        if (['image', 'document'].includes(m.type)) { d.attachments = (d.attachments || 0) + 1; return P.confirm(from, d); }
        return retry(() => P.confirm(from, d));

      case 'pref': {
        const map = { pref_wa: 'واتساب', pref_call: 'اتصال', pref_meet: 'اجتماع أونلاين' };
        if (map[reply]) { d.pref = map[reply]; return handoff(from, u, 'order'); }
        if (text) { d.pref = clip(text, 80); return handoff(from, u, 'order'); }
        return retry(() => P.contactPref(from, d));
      }

      case 'lookup': {
        const id = (text.match(/SD-\d{6}-[A-Z0-9]{4}/i) || [])[0]?.toUpperCase();
        if (id) { const l = await kv.get(`lead:${id}`, 'json'); if (l) { u.data = { ...l, id }; } else d.id = id; }
        else if (text) d.name = d.name || clip(text, 60);
        else return retry(() => P.orderLookup(from));
        return handoff(from, u, 'follow-up');
      }

      default:
        u = { step: 'new', data: {}, retries: 0 };
        return next('cat', () => P.welcome(from));
    }

    async function afterService() {
      if (!d.name) return next('name', () => P.name(from));
      if (!d.org) return next('org', () => P.org(from));
      return next('timeline', () => P.timeline(from));
    }
  }

  // رسائل يرسلها صاحب الرقم من تطبيق واتساب للأعمال (وضع الربط المشترك): نوقف البوت عن هذا العميل
  async function onEcho(e) {
    const to = String(e.to || '').replace(/\D/g, '');
    if (!to) return;
    const u = await getUser(to);
    u.step = 'human'; u.pausedUntil = now() + cfg.pauseMs;
    await putUser(to, u);
  }

  async function handle(body) {
    for (const entry of body?.entry || []) {
      for (const ch of entry.changes || []) {
        const v = ch.value || {};
        const names = Object.fromEntries((v.contacts || []).map((c) => [c.wa_id, c.profile?.name]));
        for (const m of v.messages || []) {
          try { await onMessage(m, names[m.from]); } catch (e) { log('message error', String(e?.stack || e)); }
        }
        for (const e of v.message_echoes || []) {
          try { await onEcho(e); } catch (err) { log('echo error', String(err)); }
        }
      }
    }
  }

  return { handle, recentLeads, _getUser: getUser };
}
