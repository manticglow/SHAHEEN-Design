/* نواة صفحات المشتركين /s/<slug>: الاتصال بالخادم، الأدوار، الدخول، والمكونات المشتركة.
   كل نظام (cafe.js, salon.js...) يعرّف نفسه بـ K.define({roles, views, actions}) */
(function () {
  'use strict';
  var slug = (location.pathname.match(/^\/s\/([a-z0-9-]{3,31})/) || [])[1] || '';
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var key = function (n) { return 'sd:' + slug + ':' + n; };
  var K = window.K = { slug: slug, st: null, role: null, ui: {}, def: null, LS: LS, key: key,
    tok: { owner: LS.get(key('owner'), null), staff: LS.get(key('staff'), null), cust: LS.get(key('cust'), []) },
    mine: LS.get(key('mine'), []) };
  K.role = (location.hash || '').slice(1) || null; // يعرف من البداية إذا الصفحة مفتوحة للإدارة (عشان يرسل كوكي الحساب)
  var MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  K.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return MAP[c]; }); };
  K.$ = function (id) { return document.getElementById(id); };
  K.money = function (n) { return (Math.round((Number(n) || 0) * 100) / 100).toLocaleString('en-US') + ' ر.س'; };
  K.hhmm = function (m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  K.t12 = function (m) { if (typeof m === 'string') { var p = m.split(':'); m = (+p[0]) * 60 + (+p[1]); } var h = Math.floor(m / 60), mi = m % 60; return ((h % 12) || 12) + ':' + String(mi).padStart(2, '0') + ' ' + (h < 12 ? 'ص' : 'م'); };
  K.dayName = function (day, opt) { try { return new Date(day + 'T12:00:00Z').toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', Object.assign({ weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }, opt || {})); } catch (e) { return day; } };
  K.today = function () { return new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10); };
  K.clock = function (iso) { var d = new Date(Date.parse(iso) + 3 * 3600e3); return K.t12(d.getUTCHours() * 60 + d.getUTCMinutes()); };
  K.ago = function (iso) { var m = Math.round((Date.now() - Date.parse(iso)) / 60e3); if (m < 1) return 'الحين'; if (m < 60) return 'قبل ' + m + ' د'; var h = Math.round(m / 60); if (h < 24) return 'قبل ' + h + ' س'; return 'قبل ' + Math.round(h / 24) + ' يوم'; };
  K.initial = function (s) { return K.esc(String(s || '؟').trim().replace(/^(د\.|م\.|أ\.)\s*/, '').charAt(0)); };

  // ---------- server ----------
  K.auth = function () { return { owner: K.tok.owner || (K.role === 'owner' ? 'cookie' : null), staff: K.tok.staff, cust: K.tok.cust.map(function (c) { return c.token; }) }; };
  K.addMine = function (id, k) { K.mine = [[id, k]].concat(K.mine.filter(function (x) { return x[0] !== id; })).slice(0, 25); LS.set(key('mine'), K.mine); };
  K.addCust = function (id, token) { K.tok.cust = [{ id: id, token: token }].concat(K.tok.cust.filter(function (c) { return c.id !== id; })).slice(0, 5); LS.set(key('cust'), K.tok.cust); };
  K.setTok = function (role, t) { K.tok[role] = t; if (t) LS.set(key(role), t); else LS.del(key(role)); };
  K.api = function (op, data, extra) {
    var body = Object.assign({ op: op, data: Object.assign({ mine: K.mine }, (K.def && K.def.stateData) ? K.def.stateData() : {}, data || {}), auth: K.auth() }, extra || {});
    return fetch('/api/t/' + slug + '/op', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { r: r, j: j }; }); })
      .then(function (x) {
        if (x.r.status === 402) { K.blocked = x.j; render(true); throw { status: 402, error: x.j.error }; }
        if (!x.r.ok) {
          if (x.r.status === 401) { if (K.role === 'owner') K.setTok('owner', null); if (K.role === 'staff') K.setTok('staff', null); }
          if (x.j.state) apply(x.j.state);
          throw { status: x.r.status, error: x.j.error || 'صار خطأ، جرّب مرة ثانية' };
        }
        apply(x.j); return x.j;
      });
  };
  function apply(j) {
    if (!j || !j.tenant) return;
    var had = K.st; K.st = j;
    if (j.me && K.tok.cust.length) { var keep = K.tok.cust.filter(function (c) { return j.me.cust.indexOf(c.id) >= 0; }); if (keep.length !== K.tok.cust.length) { K.tok.cust = keep; LS.set(key('cust'), keep); } }
    if (j.me && K.tok.owner && !j.me.owner) K.setTok('owner', null);
    if (j.me && K.tok.staff && !j.me.staff) K.setTok('staff', null);
    var b = j.brand || {}; document.title = b.name || 'شاهين ديزاين';
    if (b.color) { var r = document.documentElement.style; r.setProperty('--accent', b.color); r.setProperty('--accent-ink', lum(b.color) > 0.55 ? '#1C1A18' : '#fff'); }
    if (!had && j.tenant && !K.def) loadKind(j.tenant.kind);
  }
  function lum(h) { var n = parseInt(h.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; }
  function loadKind(kind) { var s = document.createElement('script'); s.src = '/apps/' + kind + '.js?v=2'; s.onerror = function () { K.toast('ما قدرنا نحمّل الصفحة'); }; document.body.appendChild(s); }
  K.refresh = function () { return K.api('state').then(function () { render(); }, function () {}); };
  K.run = function (op, data, okMsg) { // تنفيذ عملية + رسالة + إعادة رسم
    return K.api(op, data).then(function (j) { if (okMsg) K.toast(okMsg); render(true); return j; }, function (e) { K.toast(e.error || 'صار خطأ'); render(true); throw e; });
  };

  // ---------- render ----------
  K.define = function (def) { K.def = def; var roles = def.roles.map(function (r) { return r[0]; }); var h = (location.hash || '').slice(1); K.role = roles.indexOf(h) >= 0 ? h : roles[0]; if (def.init) def.init(); render(true); if (K.role === 'owner' && K.st && !K.st.me.owner && !K.tok.owner) K.refresh(); };
  function busy() { if (document.querySelector('.sheet-bg')) return true; var a = document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.closest('#app'); }
  function render(force) {
    var app = K.$('app'); if (!app) return;
    if (K.blocked) { var bk = K.blocked; app.innerHTML = '<div class="col" style="margin-top:12vh;text-align:center"><div class="panel stack" style="align-items:center"><div class="av" style="width:56px;height:56px;border-radius:16px">' + K.ic(bk.owner ? 'crown' : 'clock', 26) + '</div><h2>' + K.esc(bk.error || 'الصفحة متوقفة مؤقتًا') + '</h2><p class="muted">' + K.esc(bk.note || (bk.tenant || {}).name || '') + '</p>' + (bk.owner ? '<a class="btn" style="width:100%" href="' + K.esc(bk.renew || '/app#billing') + '">' + K.ic('card', 18) + 'جدّد الاشتراك</a>' : '') + '</div><p class="foot">' + (bk.owner || K.role !== 'owner' ? '' : '') + 'بواسطة <a href="/">شاهين ديزاين</a></p></div>'; return; }
    if (!K.st || !K.def) return;
    if (!force && busy()) return;
    var y = window.scrollY, st = K.st, b = st.brand || {}, demo = st.tenant.demo, d = K.def;
    var showRoles = demo || K.role !== 'cust' && K.role !== d.roles[0][0];
    var top = '<header class="top"><div class="brand"><div class="logo" aria-hidden="true">' + (d.logo ? d.logo() : K.initial(b.name)) + '</div><div style="min-width:0"><b>' + K.esc(b.name) + '</b><small>' + K.esc(b.tagline || '') + '</small></div></div>' +
      (showRoles ? '<nav class="roles" role="tablist">' + d.roles.map(function (r) { return '<button role="tab" type="button" data-role="' + r[0] + '" aria-selected="' + (K.role === r[0]) + '">' + K.esc(r[1]) + '</button>'; }).join('') + '</nav>' : '') + '</header>';
    if (d.bare && d.bare(K.role)) top = showRoles ? '<header class="top" style="justify-content:center"><nav class="roles" role="tablist">' + d.roles.map(function (r) { return '<button role="tab" type="button" data-role="' + r[0] + '" aria-selected="' + (K.role === r[0]) + '">' + K.esc(r[1]) + '</button>'; }).join('') + '</nav></header>' : '';
    var bar = demo ? '<div class="demo-bar"><span class="live"><i></i>تجربة حية ترجع لبدايتها كل يوم</span><span>رمز الموظف <b class="ltr">1234</b> · المدير <b class="ltr">9999</b></span><span class="row" style="gap:12px"><a href="/demos">كل الأنظمة</a><a class="btn xs" style="min-height:34px;color:var(--accent-ink);text-decoration:none" href="' + (st.tenant.kind === 'invite' ? 'https://wa.me/966582409776?text=' + encodeURIComponent('أبي دعوات إلكترونية لمناسبتي') : '/app#start/' + st.tenant.kind) + '">' + (st.tenant.kind === 'invite' ? 'اطلب دعوتك' : 'اشترك بهذا النظام') + '</a></span></div>' : '';
    // تنبيه الاشتراك للمالك: قرب ينتهي أو في فترة السماح
    var bl = st.billing, left = bl ? Math.ceil((Date.parse(bl.until) - Date.now()) / 864e5) : 99;
    if (bl && K.role === 'owner' && st.me.owner && (bl.phase === 'grace' || left <= 7)) bar += '<div class="panel ' + (bl.phase === 'grace' ? '' : 'soft') + ' row between wrap2" style="margin-bottom:12px;' + (bl.phase === 'grace' ? 'background:var(--danger-bg);border-color:transparent' : '') + '"><span class="row" style="gap:8px">' + K.ic(bl.phase === 'grace' ? 'alert' : 'clock', 20) + '<b class="small">' + (bl.phase === 'grace' ? 'انتهى اشتراكك، ونظامك شغّال لعملائك لين ' + K.dayName(new Date(Date.parse(bl.graceEnd) + 3 * 36e5).toISOString().slice(0, 10)) + '. جدّد عشان ما يوقف' : (left > 1 ? 'اشتراكك ينتهي بعد ' + left + ' أيام' : left === 1 ? 'اشتراكك ينتهي بكرة' : 'اشتراكك ينتهي اليوم')) + '</b></span><a class="btn sm" href="/app#billing">جدّد</a></div>';
    var body;
    if ((K.role === 'staff' || K.role === 'owner') && !(K.role === 'staff' ? st.me.staff || (d.ownerCanStaff && st.me.owner) : st.me.owner)) body = gate(K.role);
    else body = d.views[K.role]();
    var foot = '<p class="foot">' + (demo ? '' : (K.role === d.roles[0][0] ? '<a href="#staff" data-role="staff">دخول الموظفين</a> · <a href="#owner" data-role="owner">الإدارة</a> · ' : '') + (st.me.owner && !demo ? '<a href="/app">اشتراكي</a> · ' : '')) + ((st.me.owner || st.me.staff) ? '<a href="#" data-a="logout">تسجيل خروج</a> · ' : '') + 'بواسطة <a href="https://shaheendesign.sa/">شاهين ديزاين</a></p>';
    app.innerHTML = top + bar + '<main>' + body + '</main>' + foot;
    if (d.after) d.after();
    window.scrollTo(0, y);
  }
  K.render = render;

  function gate(role) {
    var demo = K.st.tenant.demo, title = role === 'staff' ? (K.def.staffTitle || 'دخول الموظف') : 'دخول الإدارة';
    if (role === 'owner' && !demo) return '<div class="col"><form class="panel stack" data-a="ownerLogin"><h2>' + title + '</h2><p class="muted small">ادخل بكلمة مرور حسابك</p><label class="f">كلمة المرور<input name="password" type="password" autocomplete="current-password" required minlength="8"></label><button class="btn">دخول</button><p class="small muted">عندك حساب في شاهين؟ <a href="/app">ادخل برقم جوالك</a> وترجع هنا على طول · <a href="/app#forgot">نسيت كلمة المرور؟</a></p></form></div>';
    var p = K.ui.pin || '';
    return '<div class="col"><div class="panel pin" id="pinp"><h2>' + title + '</h2><p class="muted small">' + (demo ? 'رمز التجربة <b class="ltr">' + (role === 'staff' ? '1234' : '9999') + '</b>' : 'اكتب رمزك من ٤ إلى ٦ أرقام') + '</p><div class="dots">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i < p.length ? 'on' : '') + '"></i>'; }).join('') + '</div><div class="keys">' +
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map(function (k) { return '<button type="button" data-a="pinkey" data-k="' + k + '" aria-label="' + (k === 'del' ? 'مسح' : k === 'ok' ? 'دخول' : k) + '">' + (k === 'del' ? K.ic('back', 24) : k === 'ok' ? K.ic('check', 24) : k) + '</button>'; }).join('') + '</div></div></div>';
  }
  function pinSubmit() {
    var role = K.role, pin = K.ui.pin; K.ui.pin = '';
    K.api(role === 'staff' ? 'staffPin' : 'ownerPin', {}, { pin: pin }).then(function (j) { K.setTok(role, j.token); render(true); K.toast(j.me.staff && role === 'staff' ? 'أهلًا ' + j.me.staff.name : 'أهلًا فيك'); },
      function (e) { render(true); var p = K.$('pinp'); if (p) { p.classList.add('shake'); } K.toast(e.error || 'الرمز غلط'); });
  }

  // ---------- UI bits ----------
  K.toast = function (msg) { var t = document.querySelector('.toast'); if (t) t.remove(); t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200); };
  K.sheet = function (html) { K.close(); var bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>'; bg.addEventListener('click', function (e) { if (e.target === bg) K.close(); }); document.body.appendChild(bg); var f = bg.querySelector('input,select,textarea'); if (f && matchMedia('(min-width:700px)').matches) f.focus(); };
  K.close = function () { var s = document.querySelector('.sheet-bg'); if (s) s.remove(); };
  K.celebrate = function (title, sub) { var fx = document.createElement('div'); fx.className = 'fx'; fx.innerHTML = '<div class="b"><div class="ring"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2>' + K.esc(title) + '</h2>' + (sub ? '<p class="muted" style="margin-top:4px">' + K.esc(sub) + '</p>' : '') + '</div>'; document.body.appendChild(fx); K.ping(880); setTimeout(function () { fx.remove(); }, 1700); fx.onclick = function () { fx.remove(); }; };
  var ac; K.ping = function (f) { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); var o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f || 660; o.type = 'sine'; g.gain.setValueAtTime(0.0001, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35); o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.4); } catch (e) {} };
  K.chip = function (t, c) { return '<span class="chip ' + (c || '') + '">' + K.esc(t) + '</span>'; };
  K.stars = function (n) { var s = ''; for (var i = 1; i <= 5; i++) s += '<span aria-hidden="true" style="color:' + (i <= n ? '#E0A100' : 'var(--line)') + '">★</span>'; return '<span aria-label="' + n + ' من ٥">' + s + '</span>'; };
  K.empty = function (t) { return '<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>' + K.esc(t) + '</div>'; };
  K.bars = function (rows, fmt) { var mx = Math.max.apply(null, rows.map(function (r) { return r[1]; }).concat([1])); return '<div class="bars">' + rows.map(function (r) { return '<div><em>' + K.esc(fmt ? fmt(r[1]) : r[1]) + '</em><i style="height:' + Math.max(3, Math.round(100 * r[1] / mx)) + '%"></i><span>' + K.esc(r[0]) + '</span></div>'; }).join('') + '</div>'; };
  K.dayShort = function (day) { return K.dayName(day, { weekday: 'short', day: undefined, month: undefined }); };
  K.stats = function (rows) { return '<div class="stats">' + rows.map(function (r) { return '<div class="stat"><small>' + K.esc(r[0]) + '</small><b>' + K.esc(r[1]) + '</b>' + (r[2] ? '<span class="tiny muted">' + K.esc(r[2]) + '</span>' : '') + '</div>'; }).join('') + '</div>'; };
  K.qr = function (text) { if (!window.qrcode) return ''; var q = window.qrcode(0, 'M'); q.addData(text); q.make(); var n = q.getModuleCount(), p = ''; for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) p += 'M' + c + ' ' + r + 'h1v1h-1z'; return '<svg viewBox="-2 -2 ' + (n + 4) + ' ' + (n + 4) + '" shape-rendering="crispEdges" role="img" aria-label="رمز QR"><rect x="-2" y="-2" width="' + (n + 4) + '" height="' + (n + 4) + '" fill="#fff"/><path d="' + p + '" fill="#1C1A18"/></svg>'; };
  K.form = function (f) { var o = {}; new FormData(f).forEach(function (v, k) { if (o[k] !== undefined) { o[k] = [].concat(o[k], v); } else o[k] = v; }); return o; };
  K.seg = function (name, opts, cur) { return '<div class="seg" role="group">' + opts.map(function (o) { return '<button type="button" data-a="' + name + '" data-v="' + K.esc(o[0]) + '" aria-pressed="' + (String(cur) === String(o[0])) + '">' + K.esc(o[1]) + '</button>'; }).join('') + '</div>'; };
  K.tabs = function (name, opts, cur) { return '<div class="tabs" role="tablist">' + opts.map(function (o) { return '<button role="tab" type="button" data-a="' + name + '" data-v="' + o[0] + '" aria-selected="' + (cur === o[0]) + '">' + K.esc(o[1]) + '</button>'; }).join('') + '</div>'; };

  // ---------- icons (خط رفيع) ----------
  var IC = {
    cup: '<path d="M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 9h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3v2M11 3v2"/>',
    latte: '<path d="M6 7h12l-1.4 11.2A2 2 0 0 1 14.6 20H9.4a2 2 0 0 1-2-1.8z"/><path d="M5 7h14"/><path d="M9.5 12.5c1-1.2 4-1.2 5 0-1 1.5-4 1.5-5 0z"/>',
    drip: '<path d="M6 5h12l-4 7h-4z"/><path d="M12 12v3"/><path d="M8 17h8l-1 3H9z"/>',
    dallah: '<path d="M9 5h4l1 4-3 1-3-1z"/><path d="M8 9c-2 3-2 7 0 10h6c2-3 2-7 0-10"/><path d="M14 11l4-3"/>',
    iced: '<path d="M7 6h10l-1.5 14h-7z"/><path d="M12 6V2.5l3-1"/><rect x="9" y="10" width="3" height="3" rx=".5"/><rect x="12" y="13" width="3" height="3" rx=".5"/>',
    matcha: '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M8 11c1-2 3-3 4-6 1 3 3 4 4 6"/>',
    tea: '<path d="M5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h2a2 2 0 0 1 0 4h-2"/><path d="M9 7c0-1 1-1 1-2M12 7c0-1 1-1 1-2"/>',
    cake: '<path d="M4 20h16v-7H4z"/><path d="M4 15c2 1 4 1 6 0s4-1 6 0 3 1 4 0"/><path d="M12 13V9"/><path d="M12 6.5a1 1 0 0 1 0-2 1 1 0 0 1 0 2z"/>',
    cookie: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r=".8"/><circle cx="14" cy="9" r=".8"/><circle cx="13" cy="14" r=".8"/><circle cx="9.5" cy="15" r=".8"/>',
    back: '<path d="M9 6h11v12H9l-6-6z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/>', crown: '<path d="M4 17l-1-9 5 4 4-7 4 7 5-4-1 9z"/><path d="M4 20h16"/>', alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S9 9 12 9zM12 9c2-4 6-4 6-1.5S15 9 12 9z"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5l-8.5 8.5a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5L17 4"/>', home: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1"/><path d="M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1"/>', arrow: '<path d="M15 6l-6 6 6 6"/>',
    qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
    pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>', steth: '<path d="M6 4v5a4 4 0 0 0 8 0V4"/><path d="M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
    scissors: '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 17M8 15.5L20 7"/>', spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    drop: '<path d="M12 3.5c3 4 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3-6.5 6-10.5z"/>', bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>', snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>', brush: '<path d="M15 4l5 5-8 8-5-5z"/><path d="M7 12c-3 0-4 3-4 7 4 0 7-1 7-4"/>', door: '<path d="M6 21V4h10v17"/><path d="M4 21h16"/><circle cx="13" cy="12.5" r=".8"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>', insta: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".6"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>', chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', in: '<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 4h5v16h-5"/>', out: '<path d="M14 17l5-5-5-5"/><path d="M19 12H7"/><path d="M10 4H5v16h5"/>'
  };
  K.ic = function (n, size) { return '<svg width="' + (size || 22) + '" height="' + (size || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[n] || IC.cup) + '</svg>'; };

  // ---------- لوحات مشتركة للمدير: الفريق والهوية ----------
  K.teamPanel = function (o) {
    o = o || {}; var st = K.st;
    return '<div class="panel stack"><div class="row between"><h2>' + K.esc(o.title || 'الفريق') + '</h2><span class="chip">' + st.staff.length + '</span></div><p class="small muted">' + K.esc(o.hint || 'كل موظف يدخل برمزه الخاص من صفحة الموظفين. لو حذفته يطلع من حسابه على طول.') + '</p>' +
      '<div class="list">' + (st.staff.length ? st.staff.map(function (x) { return '<div class="item"><div class="av">' + K.initial(x.name) + '</div><div class="grow"><b>' + K.esc(x.name) + '</b><div class="small muted">' + K.esc(o.sub ? o.sub(x) : (x.role || x.title || '')) + '</div></div><button class="btn xs danger" data-a="staffDel" data-id="' + K.esc(x.id) + '">حذف</button></div>'; }).join('') : K.empty('ما فيه موظفين لسا')) + '</div>' +
      '<form class="stack" data-a="staffAdd" style="border-top:1px solid var(--line);padding-top:14px"><h3>' + K.esc(o.add || 'إضافة موظف') + '</h3><div class="grid2"><label class="f">الاسم<input name="name" required maxlength="30"></label><label class="f">رمز الدخول<input name="pin" inputmode="numeric" pattern="\\d{4,6}" required placeholder="٤–٦ أرقام" class="ltr"></label></div>' + (o.fields || '') + '<button class="btn sm">' + K.ic('plus', 18) + 'إضافة</button></form></div>';
  };
  K.brandPanel = function () {
    var b = K.st.brand, link = location.origin + '/s/' + K.slug;
    return '<div class="split"><form class="panel stack" data-a="brand"><h2>هوية النشاط</h2><label class="f">الاسم<input name="name" value="' + K.esc(b.name) + '" required maxlength="40"></label><label class="f">سطر تعريفي<input name="tagline" value="' + K.esc(b.tagline) + '" maxlength="90"></label><label class="f">اللون الأساسي<span class="row"><input type="color" name="color" value="' + K.esc(b.color) + '"><span class="small muted">يطلع في الأزرار والبطاقات</span></span></label><button class="btn">حفظ</button></form>' +
      '<div class="panel stack" style="text-align:center"><h2>رابط عملائك</h2><div><div class="qrbox">' + K.qr(link) + '</div></div><p class="ltr small" style="word-break:break-all">' + K.esc(link) + '</p><div class="row" style="justify-content:center"><button class="btn sm ghost" data-a="copyLink" data-v="' + K.esc(link) + '">نسخ الرابط</button><button class="btn sm ghost" data-a="print">طباعة</button></div></div></div>';
  };
  var common = {
    staffAdd: function (f, d) { K.run('staffAdd', d, 'تمت الإضافة'); },
    staffDel: function (b) { if (confirm('متأكد من حذف الموظف؟')) K.run('staffDel', { id: b.dataset.id }, 'انحذف'); },
    brand: function (f, d) { K.run('brand', d, 'انحفظت الهوية'); },
    copyLink: function (b) { try { navigator.clipboard.writeText(b.dataset.v); K.toast('انسخ الرابط'); } catch (e) { K.toast(b.dataset.v); } },
    print: function () { window.print(); },
    ownerTab: function (b) { K.ui.otab = b.dataset.v; render(true); },
    staffTab: function (b) { K.ui.stab = b.dataset.v; render(true); }
  };
  var _define = K.define; K.define = function (def) { def.actions = Object.assign({}, common, def.actions); _define(def); };

  // ---------- events ----------
  document.addEventListener('click', function (e) {
    var r = e.target.closest('[data-role]');
    if (r) { e.preventDefault(); K.role = r.dataset.role; K.ui.pin = ''; history.replaceState(null, '', '#' + K.role); K.close(); render(true); window.scrollTo(0, 0); if (K.role === 'owner' && !K.st.me.owner && !K.st.tenant.demo) K.refresh(); return; }
    var a = e.target.closest('[data-a]'); if (!a || a.tagName === 'FORM') return;
    var n = a.dataset.a;
    if (n === 'pinkey') { var k = a.dataset.k, p = K.ui.pin || ''; if (k === 'del') p = p.slice(0, -1); else if (k === 'ok') { if (p.length >= 4) { K.ui.pin = p; return pinSubmit(); } } else if (p.length < 6) p += k; K.ui.pin = p; render(true); if (p.length === 4 && K.st.tenant.demo) pinSubmit(); return; }
    if (n === 'logout') { e.preventDefault(); if (K.role === 'owner' && !K.st.tenant.demo) fetch('/api/platform/logout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }).catch(function () {}); K.setTok(K.role === 'owner' ? 'owner' : 'staff', null); if (K.role !== 'owner' && K.role !== 'staff') { K.setTok('owner', null); K.setTok('staff', null); } K.refresh(); return; }
    if (n === 'close') { K.close(); return; }
    var fn = K.def && K.def.actions[n]; if (fn) { e.preventDefault(); fn(a, e); }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('form[data-a]'); if (!f) return; e.preventDefault();
    var n = f.dataset.a, data = K.form(f);
    if (n === 'ownerLogin') { K.api('ownerLogin', {}, { password: data.password }).then(function (j) { K.setTok('owner', j.token); render(true); }, function (er) { K.toast(er.error); }); return; }
    var fn = K.def && K.def.actions[n]; if (fn) fn(f, data, e);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') K.close(); if ((K.role === 'staff' || K.role === 'owner') && K.$('pinp') && /^\d$/.test(e.key)) { var b = document.querySelector('[data-k="' + e.key + '"]'); if (b) b.click(); } if (K.$('pinp') && e.key === 'Backspace') { var d = document.querySelector('[data-k="del"]'); if (d) d.click(); } });

  // ---------- start ----------
  function start() {
    if (!slug) { K.$('app').innerHTML = K.empty('الرابط غير صحيح'); return; }
    K.api('state').then(function () { if (K.def) render(); }, function (e) { if (e.status !== 402) K.$('app').innerHTML = '<div class="col" style="margin-top:14vh">' + K.empty(e.error || 'ما قدرنا نفتح الصفحة') + '</div>'; });
    setInterval(function () { if (document.visibilityState === 'visible' && K.def && !K.blocked) K.refresh(); }, 4000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && K.def) K.refresh(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
