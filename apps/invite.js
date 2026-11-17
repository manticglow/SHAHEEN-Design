/* دعوات إلكترونية: دعوة شخصية لكل ضيف + تأكيد حضور + باركود دخول · شاشة الاستقبال بالكاميرا · لوحة صاحب المناسبة */
(function () {
  var E = K.esc, ui = K.ui, LS = K.LS;
  var TH = {
    gold: { bg: '#F4EDE0', paper: '#FFFCF6', ink: '#2B2418', mut: '#8A7B62', acc: '#A8834A', soft: '#EFE3CB', n: 'ذهبي' },
    night: { bg: '#0D1424', paper: '#131D33', ink: '#F3EBDD', mut: '#A9A08E', acc: '#D4B26A', soft: '#1D2A45', n: 'كحلي' },
    rose: { bg: '#F5E6E5', paper: '#FFF9F8', ink: '#3A2326', mut: '#8F6D70', acc: '#B0646F', soft: '#F2DADC', n: 'وردي' },
    sage: { bg: '#E5EBE1', paper: '#FBFCF9', ink: '#1F2A22', mut: '#6E7B69', acc: '#6F8560', soft: '#DCE5D5', n: 'زيتي' }
  };
  var RS = { yes: ['أكد', 'ok'], no: ['اعتذر', 'bad'], pending: ['بانتظار الرد', 'warn'] };
  var gkey = K.key('guest');
  // رابط الدعوة: #g=<id>.<key> ← ينحفظ في الجوال وينشال من العنوان
  (function () { var m = /^#g=([A-Za-z0-9]{2,20})\.([A-Za-z0-9]{6,20})$/.exec(location.hash || ''); if (m) { LS.set(gkey, [m[1], m[2]]); history.replaceState(null, '', location.pathname); } })();
  function myGuest() { return LS.get(gkey, null); }
  if (!document.getElementById('invcss')) {
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Amiri:wght@400;700&display=swap'; document.head.appendChild(l);
    var s = document.createElement('style'); s.id = 'invcss'; s.textContent =
      '.inv{--ip:#fff;border-radius:28px;max-width:460px;margin:0 auto;padding:16px;position:relative}' +
      '.inv .paper{background:var(--ip);border-radius:22px;padding:34px 22px 28px;text-align:center;position:relative;overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.35)}' +
      '.inv .frame{position:absolute;inset:10px;border:1px solid var(--ia);border-radius:16px;opacity:.55;pointer-events:none}.inv .frame:after{content:"";position:absolute;inset:5px;border:1px solid var(--ia);border-radius:12px;opacity:.5}' +
      '.inv .orn{color:var(--ia);display:block;margin:0 auto}.inv .bism{font-family:Amiri,serif;font-size:17px;color:var(--im)}' +
      '.inv .names{font-family:"Aref Ruqaa",Amiri,serif;font-size:46px;line-height:1.25;color:var(--ia);margin:8px 0 2px;font-weight:700}.inv .amp{font-size:26px;display:block;line-height:1;opacity:.8}' +
      '.inv .lead{font-family:Amiri,serif;font-size:18px;line-height:1.9;color:var(--ii)}.inv .kind{letter-spacing:.06em;font-size:13px;color:var(--im);margin-top:6px}' +
      '.inv .when{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;margin:20px 0 6px;color:var(--ii)}.inv .when .d{border-top:1px solid var(--ia);border-bottom:1px solid var(--ia);padding:6px 0;font-family:Amiri,serif;font-size:15px}' +
      '.inv .big{font-family:"Readex Pro",sans-serif;font-size:40px;font-weight:600;color:var(--ia);line-height:1}.inv .hij{font-size:12.5px;color:var(--im)}' +
      '.inv .cd{display:flex;gap:8px;justify-content:center;margin:16px 0 4px}.inv .cd div{min-width:58px;padding:8px 4px;border-radius:14px;background:var(--is)}.inv .cd b{display:block;font-family:"Readex Pro";font-size:22px;color:var(--ii)}.inv .cd span{font-size:11px;color:var(--im)}' +
      '.inv .ibtn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding:0 18px;border-radius:14px;font-weight:600;font-size:15px;background:var(--ia);color:#fff;transition:transform .12s}.inv .ibtn:active{transform:scale(.97)}' +
      '.inv .ibtn.o{background:transparent;color:var(--ii);border:1px solid color-mix(in srgb,var(--ia) 45%,transparent)}.inv .ibtn:focus-visible{outline:2px solid var(--ia);outline-offset:2px}' +
      '.inv .box{margin-top:16px;background:var(--ip);border-radius:22px;padding:20px;color:var(--ii);box-shadow:0 20px 40px -30px rgba(0,0,0,.3)}.inv .note{font-size:13px;color:var(--im);margin-top:14px;line-height:1.8}' +
      '.inv .pass{border:1.5px dashed var(--ia);border-radius:20px;padding:18px;text-align:center}.inv .pass .qrbox{border:0;padding:8px}.inv .pass .qrbox svg{width:200px;height:200px}' +
      '.env{min-height:78vh;display:grid;place-items:center;text-align:center;cursor:pointer}.env .e{width:min(320px,86vw);aspect-ratio:1.45;border-radius:18px;position:relative;background:var(--ip);box-shadow:0 40px 70px -30px rgba(0,0,0,.45);overflow:hidden}' +
      '.env .flap{position:absolute;inset:0 0 auto;height:62%;background:var(--is);clip-path:polygon(0 0,100% 0,50% 100%)}.env .seal{position:absolute;left:50%;top:62%;transform:translate(-50%,-50%);width:74px;height:74px;border-radius:50%;background:var(--ia);color:#fff;display:grid;place-items:center;font-family:"Aref Ruqaa",serif;font-size:30px;box-shadow:0 8px 20px -6px rgba(0,0,0,.4);animation:pulse 2s infinite}' +
      '@keyframes pulse{50%{transform:translate(-50%,-50%) scale(1.06)}}.reveal{animation:rv .8s cubic-bezier(.2,.8,.2,1)}@keyframes rv{from{opacity:0;transform:translateY(30px) scale(.97)}}' +
      '.scan{position:fixed;inset:0;z-index:60;background:#000;color:#fff;display:flex;flex-direction:column}.scan video{flex:1;width:100%;object-fit:cover;min-height:0}.scan .bar{display:flex;gap:10px;justify-content:center;padding:14px 14px calc(14px + env(safe-area-inset-bottom))}' +
      '.scan .tip{position:absolute;top:calc(16px + env(safe-area-inset-top));left:0;right:0;text-align:center;font-size:14px;text-shadow:0 1px 4px #000}.scan .aim{position:absolute;left:50%;top:45%;width:min(64vw,280px);aspect-ratio:1;transform:translate(-50%,-50%);border:3px solid rgba(255,255,255,.9);border-radius:28px;box-shadow:0 0 0 100vmax rgba(0,0,0,.35)}' +
      '.res{position:fixed;inset:0;z-index:61;display:grid;place-items:center;padding:20px;text-align:center;color:#fff;animation:fade .15s}.res .in{max-width:380px}.res h2{font-size:30px;margin:14px 0 6px;color:#fff}.res p{opacity:.92}.res .ico{width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.18);display:grid;place-items:center;margin:0 auto}' +
      '.door{text-align:center;padding:26px 18px}.door .scanbig{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:flex;flex-direction:column;align-items:center;gap:10px;padding:26px;border-radius:26px;background:var(--accent);color:var(--accent-ink);font-family:var(--display);font-size:22px;font-weight:600;box-shadow:0 20px 40px -20px var(--accent)}' +
      '.ring2{width:84px;height:84px;border-radius:50%;background:conic-gradient(var(--accent) calc(var(--p)*1%),var(--line2) 0);display:grid;place-items:center}.ring2 b{width:66px;height:66px;border-radius:50%;background:var(--surface);display:grid;place-items:center;font-family:var(--display);font-size:16px}' +
      '@media print{.inv .ibtn{display:none!important}}';
    document.head.appendChild(s);
  }
  function th() { return TH[(K.st.event || {}).theme] || TH.gold; }
  function vars(t) { return '--ip:' + t.paper + ';--ia:' + t.acc + ';--ii:' + t.ink + ';--im:' + t.mut + ';--is:' + t.soft + ';background:' + t.bg; }
  function evDate(e) { return K.dayName(e.date); }
  function hijri(day) { try { return new Date(day + 'T12:00:00Z').toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); } catch (e) { return ''; } }
  function hosts(e) { return e.host1 && e.host2 ? E(e.host1) + '<span class="amp">&amp;</span>' + E(e.host2) : E(e.host1 || e.host2 || e.title); }
  var ORN = '<svg class="orn" width="120" height="22" viewBox="0 0 120 22" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M2 11h40M78 11h40"/><path d="M60 3c-6 4-6 12 0 16 6-4 6-12 0-16z"/><circle cx="48" cy="11" r="2"/><circle cx="72" cy="11" r="2"/></svg>';
  function card(e, guest) {
    var rel = /زواج|ملكة|خطوبة/.test(e.type);
    return '<div class="paper"><span class="frame"></span>' + (rel ? '<p class="bism">بسم الله الرحمن الرحيم</p>' : '') + ORN +
      (guest ? '<p style="margin-top:12px;font-size:14px;color:var(--im)">إلى ' + E(guest.name) + '</p>' : '') +
      '<p class="lead" style="margin-top:10px">' + E(e.invite) + '</p><h1 class="names">' + hosts(e) + '</h1><p class="kind">' + E(e.title) + '</p>' +
      '<div class="when"><div class="d">' + E(K.dayName(e.date, { weekday: 'long', day: undefined, month: undefined })) + '</div><div><div class="big num">' + Number(e.date.slice(8)) + '</div><div style="font-size:13px">' + E(K.dayName(e.date, { weekday: undefined, day: undefined, month: 'long', year: 'numeric' })) + '</div></div><div class="d">' + K.t12(e.time) + '</div></div>' +
      '<p class="hij">' + E(hijri(e.date)) + '</p><div class="cd" id="cd" aria-live="off"></div>' +
      (e.venue ? '<p style="margin-top:14px;font-family:Amiri,serif;font-size:18px">' + E(e.venue) + '</p><p style="font-size:13px;color:var(--im)">' + E(e.city) + '</p>' : '') +
      '<div class="row" style="justify-content:center;flex-wrap:wrap;margin-top:14px;gap:8px">' + (e.mapUrl ? '<a class="ibtn o" href="' + E(e.mapUrl) + '" target="_blank" rel="noopener">' + K.ic('pin', 18) + 'الموقع</a>' : '') + '<button class="ibtn o" data-a="ics">' + K.ic('cal', 18) + 'أضف للتقويم</button></div>' +
      (e.note ? '<p class="note">' + E(e.note) + '</p>' : '') + '<div style="margin-top:16px">' + ORN + '</div></div>';
  }
  function rsvpBox(g, st) {
    if (g.inAt) return '<div class="box" style="text-align:center"><div style="width:64px;height:64px;border-radius:50%;background:var(--ia);color:#fff;display:grid;place-items:center;margin:0 auto">' + K.ic('check', 32) + '</div><h2 style="margin-top:10px">حيّاك الله</h2><p style="color:var(--im)">تم تسجيل دخولك الساعة ' + K.clock(g.inAt) + '</p></div>';
    if (g.rsvp === 'yes' && !ui.change) return '<div class="box"><div class="pass"><p style="font-size:12px;color:var(--im);letter-spacing:.08em">بطاقة الدخول</p><h2 style="margin:4px 0 2px">' + E(g.name) + '</h2><p style="color:var(--im);font-size:14px">' + (g.coming > 1 ? g.coming + ' أشخاص' : 'شخص واحد') + '</p><div class="qrbox" style="margin-top:12px">' + K.qr(g.qr) + '</div><p style="font-size:13px;color:var(--im);margin-top:8px">اعرض الباركود عند الدخول</p></div>' + (st.closed ? '' : '<p style="text-align:center;margin-top:12px"><button class="ibtn o" style="min-height:40px;font-size:13px" data-a="change">تعديل الرد</button></p>') + '</div>';
    if (g.rsvp === 'no' && !ui.change) return '<div class="box" style="text-align:center"><p>وصلنا اعتذارك، شكرًا على ردك</p>' + (st.closed ? '' : '<button class="ibtn o" style="margin-top:12px;min-height:40px;font-size:13px" data-a="change">تغيّر رأيي</button>') + '</div>';
    if (st.closed) return '<div class="box" style="text-align:center"><p>انتهى وقت تأكيد الحضور</p></div>';
    var n = ui.coming || g.coming || g.seats;
    return '<div class="box" style="text-align:center"><h2>تشرفنا بحضورك</h2><p style="color:var(--im);font-size:14px;margin-top:4px">الدعوة لـ ' + (g.seats > 1 ? g.seats + ' أشخاص' : 'شخص واحد') + (st.event.deadline ? ' · أكد قبل ' + E(K.dayName(st.event.deadline, { weekday: undefined })) : '') + '</p>' +
      (g.seats > 1 ? '<div class="row" style="justify-content:center;margin-top:14px;gap:14px"><button class="ibtn o" style="width:46px;padding:0" data-a="cnt" data-v="-1" aria-label="أقل">' + K.ic('minus', 18) + '</button><div><b class="num" style="font-size:28px">' + n + '</b><div style="font-size:12px;color:var(--im)">عدد الحضور</div></div><button class="ibtn o" style="width:46px;padding:0" data-a="cnt" data-v="1" aria-label="أكثر">' + K.ic('plus', 18) + '</button></div>' : '') +
      (ui.change ? '<p style="margin-top:10px"><button class="ibtn o" style="min-height:36px;font-size:13px" data-a="unchange">تراجع</button></p>' : '') + '<div class="grid2" style="margin-top:16px"><button class="ibtn" data-a="yes">' + K.ic('check', 18) + 'سأحضر</button><button class="ibtn o" data-a="no">أعتذر</button></div></div>';
  }
  function cust() {
    var st = K.st, e = st.event, g = st.guest, t = th();
    if (!g) {
      return '<div class="inv" style="' + vars(t) + '">' + card(e) + '<div class="box" style="text-align:center"><p>هذي الدعوة شخصية. افتحها من الرابط اللي وصلك بالواتساب</p>' +
        (st.demoGuest ? '<button class="ibtn" style="margin-top:14px" data-a="tryGuest">' + K.ic('mail', 18) + 'افتح دعوة تجريبية كضيف</button>' : '') + '</div></div>';
    }
    var opened = ui.opened || g.rsvp !== 'pending' || (function () { try { return sessionStorage.getItem('inv-open-' + K.slug); } catch (x) { return 0; } })();
    if (!opened) return '<div class="inv env" style="' + vars(t) + '" data-a="openEnv" role="button" tabindex="0" aria-label="افتح الدعوة"><div><div class="e"><div class="flap"></div><div class="seal">' + E((e.host1 || e.title).charAt(0)) + '</div></div><p style="margin-top:22px;color:' + t.ink + ';font-family:Amiri,serif;font-size:20px">' + E(g.name) + '</p><p style="color:' + t.mut + ';font-size:13px">اضغط لفتح الدعوة</p></div></div>';
    return '<div class="inv' + (ui.justOpened ? ' reveal' : '') + '" style="' + vars(t) + '">' + card(e, g) + rsvpBox(g, st) + '</div>';
  }
  function tickCd() {
    var el = document.getElementById('cd'); if (!el || !K.st) return;
    var ms = Date.parse(K.st.starts) - Date.now();
    if (ms <= 0) { el.innerHTML = ms > -6 * 3600e3 ? '<div style="min-width:auto;padding:8px 16px"><b style="font-size:16px">الحفل الحين</b></div>' : ''; return; }
    var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
    el.innerHTML = [[d, 'يوم'], [h, 'ساعة'], [m, 'دقيقة'], [s, 'ثانية']].filter(function (x, i) { return i || x[0]; }).map(function (x) { return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('');
  }
  setInterval(tickCd, 1000);

  // ---------- الاستقبال ----------
  function gRow(g, owner) {
    var r = RS[g.rsvp] || RS.pending;
    return '<div class="item" data-name="' + E(g.name) + '"><div class="av">' + K.initial(g.name) + '</div><div class="grow"><b>' + E(g.name) + '</b><div class="row wrap2 tiny muted" style="gap:6px;margin-top:2px">' + (g.inAt ? K.chip('دخل ' + g.inCount + ' · ' + K.clock(g.inAt), 'ok') : K.chip(r[0], r[1])) + '<span>' + (g.rsvp === 'yes' ? g.coming + ' من ' + g.seats : g.seats + ' مقاعد') + '</span>' + (g.group ? '<span>' + E(g.group) + '</span>' : '') + (owner && !g.sent ? K.chip('ما انرسلت', '') : '') + (owner && g.sent && !g.opened ? '<span>ما فتحها</span>' : '') + '</div></div>' +
      (owner ? '<div class="row" style="gap:6px">' + (g.phone ? '<button class="btn xs ok" data-a="wa" data-id="' + g.id + '" aria-label="أرسل بالواتساب">' + K.ic('mail', 15) + '</button>' : '') + '<button class="btn xs ghost" data-a="guestSheet" data-id="' + g.id + '">المزيد</button></div>'
        : (g.inAt && g.inCount >= g.seats ? '' : '<button class="btn xs" data-a="inSheet" data-id="' + g.id + '">' + (g.inAt ? '+ دخول' : 'دخول') + '</button>')) + '</div>';
  }
  function filtered(list) {
    var q = (ui.q || '').trim(), f = ui.f || 'all';
    return list.filter(function (g) {
      if (q && g.name.indexOf(q) < 0) return false;
      if (f === 'in') return !!g.inAt; if (f === 'notin') return g.rsvp === 'yes' && !g.inAt; if (f === 'unsent') return !g.sent;
      return f === 'all' || g.rsvp === f;
    });
  }
  function staff() {
    var st = K.st, s = st.stats, exp = s.coming || 1, p = Math.min(100, Math.round(100 * s.inPeople / exp));
    var html = '<div class="dash"><div class="stack"><section class="panel door"><div class="row" style="justify-content:center;gap:18px;margin-bottom:18px"><div class="ring2" style="--p:' + p + '"><b>' + p + '٪</b></div><div style="text-align:start"><div class="num" style="font-size:30px;font-weight:600;line-height:1.1">' + s.inPeople + '</div><div class="small muted">دخلوا من ' + s.coming + ' مؤكد</div></div></div>' +
      '<button class="scanbig" data-a="scan">' + K.ic('qr', 54) + 'امسح باركود الضيف<span style="font-family:var(--body);font-size:13px;font-weight:400;opacity:.85">تفتح الكاميرا مباشرة</span></button></section>' +
      '<section class="panel stack"><div class="row between"><h2>قائمة الضيوف</h2><span class="chip">' + st.guests.length + '</span></div><input type="search" id="gq" placeholder="ابحث بالاسم" value="' + E(ui.q || '') + '" autocomplete="off">' +
      K.seg('gf', [['all', 'الكل'], ['notin', 'ما دخلوا'], ['in', 'دخلوا'], ['pending', 'بدون رد']], ui.f || 'all') + '<div class="list" id="glist">' + listHtml(false) + '</div></section></div>' +
      '<div class="stack"><section class="panel"><h3>آخر الداخلين</h3><div class="list small" style="margin-top:8px">' + ((st.log || []).length ? st.log.slice(0, 12).map(function (x) { return '<div class="row between"><span>' + E(x.name) + (x.n > 1 ? ' <span class="muted">+' + (x.n - 1) + '</span>' : '') + '</span><span class="muted tiny">' + K.clock(x.at) + '</span></div>'; }).join('') : K.empty('ما دخل أحد لسا')) + '</div></section></div></div>';
    return html;
  }
  function listHtml(owner) { var l = filtered(K.st.guests); return l.length ? l.slice(0, 300).map(function (g) { return gRow(g, owner); }).join('') : K.empty('ما فيه نتائج'); }

  // الكاميرا
  var stream = null, scanning = false, cv = document.createElement('canvas');
  function loadQR() { return new Promise(function (res, rej) { if (window.jsQR) return res(); var s = document.createElement('script'); s.src = '/vendor/jsQR.js'; s.onload = res; s.onerror = rej; document.body.appendChild(s); }); }
  function stopScan() { scanning = false; if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; } var o = document.querySelector('.scan'); if (o) o.remove(); }
  function startScan() {
    stopScan(); closeRes();
    var o = document.createElement('div'); o.className = 'scan'; o.innerHTML = '<video playsinline muted></video><div class="aim"></div><p class="tip">وجّه الكاميرا على باركود الضيف</p><div class="bar"><button class="btn ghost" data-a="photo" style="background:#fff;color:#111">صوّر بدلها</button><button class="btn" data-a="stopScan" style="background:#fff;color:#111">إغلاق</button></div><input type="file" accept="image/*" capture="environment" hidden id="camf">';
    document.body.appendChild(o);
    o.querySelector('#camf').addEventListener('change', function (ev) { var f = ev.target.files[0]; if (f) decodeFile(f); });
    loadQR().then(function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw 0;
      return navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    }).then(function (s) { stream = s; var v = o.querySelector('video'); v.srcObject = s; return v.play(); }).then(function () { scanning = true; tick(); })
      .catch(function () { var tp = o.querySelector('.tip'); if (tp) tp.textContent = 'ما قدرنا نفتح الكاميرا. اسمح بالكاميرا أو اضغط "صوّر بدلها"'; });
  }
  function tick() {
    if (!scanning) return; var v = document.querySelector('.scan video');
    if (v && v.readyState >= 2 && v.videoWidth) { var w = 480, h = Math.round(v.videoHeight * w / v.videoWidth); cv.width = w; cv.height = h; var x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(v, 0, 0, w, h); var r = window.jsQR(x.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' }); if (r && r.data) { got(r.data); return; } }
    requestAnimationFrame(tick);
  }
  function decodeFile(file) {
    loadQR().then(function () {
      var url = URL.createObjectURL(file), img = new Image(); img.onload = function () { var out = null; [1200, 800, 500].forEach(function (mx) { if (out) return; var s = Math.min(1, mx / Math.max(img.width, img.height)), w = Math.round(img.width * s), h = Math.round(img.height * s); cv.width = w; cv.height = h; var x = cv.getContext('2d'); x.drawImage(img, 0, 0, w, h); var r = window.jsQR(x.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' }); if (r) out = r.data; }); URL.revokeObjectURL(url); if (out) got(out); else K.toast('ما لقينا باركود في الصورة'); }; img.src = url;
    });
  }
  function got(code) { stopScan(); try { navigator.vibrate && navigator.vibrate(60); } catch (e) {} K.api('checkin', { code: code }).then(showRes, function (e) { K.toast(e.error); }); }
  function closeRes() { var r = document.querySelector('.res'); if (r) r.remove(); }
  function showRes(j) {
    var x = j.scan || {}, g = x.guest, bg = '#1B7F4B', ic = 'check', h = '', p = '', more = '';
    if (x.result === 'ok') { h = 'أهلًا ' + E(g.name); p = (x.n > 1 ? 'دخول ' + x.n + ' أشخاص' : 'دخول شخص واحد') + (g.group ? ' · ' + E(g.group) : ''); K.ping(880); }
    else if (x.result === 'dup') { bg = '#B7791F'; ic = 'clock'; h = 'دخل من قبل'; p = E(g.name) + ' · الساعة ' + K.clock(g.inAt) + ' (' + g.inCount + ' من ' + g.seats + ')'; if (g.inCount < g.seats) more = '<button class="btn" style="background:#fff;color:#111" data-a="inSheet" data-id="' + g.id + '">دخول مرافق إضافي</button>'; K.ping(330); }
    else if (x.result === 'declined') { bg = '#8A5A00'; ic = 'x'; h = 'معتذر عن الحضور'; p = E(g.name) + ' كان معتذر'; more = '<button class="btn" style="background:#fff;color:#111" data-a="inSheet" data-id="' + g.id + '" data-force="1">سجّل دخوله</button>'; K.ping(330); }
    else if (x.result === 'full') { bg = '#B3261E'; ic = 'x'; h = 'اكتمل العدد'; p = E(g.name) + ' · دخل ' + g.inCount + ' من ' + g.seats; K.ping(220); }
    else { bg = '#B3261E'; ic = 'x'; h = 'باركود غير صالح'; p = 'هذا الباركود مو لهذي المناسبة'; K.ping(220); }
    closeRes(); var r = document.createElement('div'); r.className = 'res'; r.style.background = bg; r.setAttribute('role', 'alert');
    r.innerHTML = '<div class="in"><div class="ico">' + K.ic(ic, 60) + '</div><h2>' + h + '</h2><p>' + p + '</p><div class="stack" style="margin-top:24px">' + more + '<button class="btn" style="background:#fff;color:#111" data-a="scan">' + K.ic('qr', 18) + 'امسح التالي</button><button class="btn" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.6)" data-a="closeRes">رجوع للقائمة</button></div></div>';
    document.body.appendChild(r); K.render(true);
  }

  // ---------- صاحب المناسبة ----------
  function link(g) { return location.origin + '/s/' + K.slug + '#g=' + g.id + '.' + g.key; }
  function waText(g) { var e = K.st.event; return 'السلام عليكم ' + g.name + '\n' + e.invite + '\n' + e.title + (K.st.event.hosts ? ' ' + K.st.event.hosts : '') + '\n' + K.dayName(e.date) + ' · ' + K.t12(e.time) + (e.venue ? '\n' + e.venue : '') + '\n\nدعوتك الخاصة وتأكيد الحضور:\n' + link(g); }
  function waUrl(g) { return 'https://wa.me/966' + g.phone.slice(1) + '?text=' + encodeURIComponent(waText(g)); }
  function owner() {
    var st = K.st, s = st.stats, tab = ui.otab || 'home';
    var html = K.tabs('ownerTab', [['home', 'نظرة عامة'], ['guests', 'الضيوف (' + s.invited + ')'], ['event', 'تفاصيل الدعوة'], ['team', 'فريق الاستقبال']], tab);
    if (tab === 'home') {
      html += K.stats([['المدعوين', s.invited, s.seats + ' مقعد'], ['أكدوا', s.coming + ' شخص', s.yes + ' دعوة'], ['اعتذروا', s.no], ['بانتظار الرد', s.pending], ['فتحوا الدعوة', s.opened + ' من ' + s.sent], ['دخلوا', s.inPeople + ' شخص']]);
      var groups = {}; st.guests.forEach(function (g) { var k = g.group || 'بدون مجموعة'; groups[k] = groups[k] || [0, 0, 0]; groups[k][0] += g.seats; if (g.rsvp === 'yes') groups[k][1] += g.coming; groups[k][2] += g.inCount || 0; });
      html += '<div class="dash" style="margin-top:14px"><div class="stack"><section class="panel"><h3>الردود</h3><div class="meter" style="height:14px;display:flex;margin-top:12px"><i style="width:' + pct(s.yes) + '%;background:var(--ok);border-radius:0"></i><i style="width:' + pct(s.no) + '%;background:var(--danger);border-radius:0"></i><i style="width:' + pct(s.pending) + '%;background:#E0B252;border-radius:0"></i></div><div class="row wrap2 small muted" style="margin-top:8px;gap:14px"><span>● أكد ' + s.yes + '</span><span>● اعتذر ' + s.no + '</span><span>● بانتظار ' + s.pending + '</span></div></section>' +
        '<section class="panel"><h3>حسب المجموعة</h3><div class="list" style="margin-top:8px">' + Object.keys(groups).map(function (k) { var x = groups[k]; return '<div class="stack tight"><div class="row between small"><span>' + E(k) + '</span><span class="num">' + x[1] + ' مؤكد · ' + x[2] + ' دخلوا · ' + x[0] + ' مقعد</span></div><div class="meter"><i style="width:' + Math.round(100 * x[1] / Math.max(1, x[0])) + '%"></i></div></div>'; }).join('') + '</div></section></div>' +
        '<div class="stack"><section class="panel stack"><h3>الخطوة الجاية</h3>' + (s.sent < s.invited ? '<p class="small muted">' + (s.invited - s.sent) + ' ضيف ما وصلتهم الدعوة</p><button class="btn sm" data-a="nextWa">' + K.ic('mail', 16) + 'أرسل للي بعده</button>' : '<p class="small muted">كل الدعوات انرسلت</p>') + '<a class="btn sm ghost" href="#staff" data-role="staff">' + K.ic('qr', 16) + 'افتح شاشة الاستقبال</a></section>' +
        '<section class="panel"><h3>آخر التحديثات</h3><div class="list small" style="margin-top:8px">' + (st.feed.length ? st.feed.slice(0, 10).map(function (f) { return '<div class="row between"><span>' + E(f.text) + '</span><span class="tiny muted">' + K.ago(f.at) + '</span></div>'; }).join('') : K.empty('ما فيه شي لسا')) + '</div></section></div></div>';
    } else if (tab === 'guests') {
      html += '<section class="panel stack"><div class="row between wrap2"><div class="row" style="gap:8px"><button class="btn sm" data-a="guestSheet">' + K.ic('plus', 16) + 'ضيف</button><button class="btn sm ghost" data-a="bulkSheet">إضافة قائمة</button></div>' + (s.sent < s.invited ? '<button class="btn sm ok" data-a="nextWa">' + K.ic('mail', 16) + 'أرسل للتالي (' + (s.invited - s.sent) + ')</button>' : '') + '</div>' +
        '<input type="search" id="gq" placeholder="ابحث بالاسم" value="' + E(ui.q || '') + '" autocomplete="off">' + K.seg('gf', [['all', 'الكل'], ['yes', 'أكد'], ['pending', 'بانتظار'], ['no', 'اعتذر'], ['unsent', 'ما انرسلت'], ['in', 'دخلوا']], ui.f || 'all') + '<div class="list" id="glist">' + listHtml(true) + '</div></section>';
    } else if (tab === 'event') {
      var e = st.event;
      html += '<div class="split"><form class="panel stack" data-a="event"><h2>تفاصيل الدعوة</h2><div class="grid2"><label class="f">نوع المناسبة<select name="type">' + st.types.map(function (x) { return '<option' + (x === e.type ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label><label class="f">العنوان<input name="title" value="' + E(e.title) + '" maxlength="50"></label></div>' +
        '<div class="grid2"><label class="f">الاسم الأول<input name="host1" value="' + E(e.host1) + '" maxlength="40"></label><label class="f">الاسم الثاني<input name="host2" value="' + E(e.host2) + '" maxlength="40" placeholder="اختياري"></label></div><label class="f">نص الدعوة<input name="invite" value="' + E(e.invite) + '" maxlength="200"></label>' +
        '<div class="grid2"><label class="f">التاريخ<input type="date" name="date" value="' + E(e.date) + '" required></label><label class="f">الوقت<input type="time" name="time" value="' + E(e.time) + '" required></label></div><div class="grid2"><label class="f">المكان<input name="venue" value="' + E(e.venue) + '" maxlength="80"></label><label class="f">المدينة<input name="city" value="' + E(e.city) + '" maxlength="30"></label></div>' +
        '<label class="f">رابط الموقع (قوقل ماب)<input name="mapUrl" type="url" class="ltr" value="' + E(e.mapUrl) + '" placeholder="https://maps.app.goo.gl/..."></label><label class="f">ملاحظة للضيوف<textarea name="note" maxlength="240" placeholder="مثل: يُرجى عدم اصطحاب الأطفال">' + E(e.note) + '</textarea></label><label class="f">آخر يوم لتأكيد الحضور<input type="date" name="deadline" value="' + E(e.deadline) + '"></label>' +
        '<fieldset style="border:0;padding:0;margin:0"><legend class="small" style="font-weight:600;margin-bottom:6px">الألوان</legend><div class="row wrap2">' + Object.keys(TH).map(function (k) { return '<label class="check"><input type="radio" name="theme" value="' + k + '"' + (e.theme === k ? ' checked' : '') + '><span style="width:20px;height:20px;border-radius:50%;background:' + TH[k].acc + ';border:3px solid ' + TH[k].bg + ';display:inline-block"></span>' + TH[k].n + '</label>'; }).join('') + '</div></fieldset><button class="btn">حفظ</button></form>' +
        '<div><p class="small muted" style="margin-bottom:8px">معاينة الدعوة</p><div class="inv" style="' + vars(th()) + '">' + card(e, { name: 'اسم الضيف' }) + '</div></div></div>';
    } else html += K.teamPanel({ title: 'فريق الاستقبال', hint: 'كل شخص على الباب يدخل برمزه من صفحة الاستقبال ويمسح الباركود من جواله.', add: 'إضافة شخص للاستقبال' });
    return html;
    function pct(n) { return Math.round(100 * n / Math.max(1, s.invited)); }
  }
  function gById(id) { return K.st.guests.filter(function (g) { return g.id === id; })[0]; }
  function ics() {
    var e = K.st.event, st = new Date(Date.parse(K.st.starts)), en = new Date(st.getTime() + 4 * 3600e3), f = function (d) { return d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'; };
    var body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Shaheen Design//Invite//AR', 'BEGIN:VEVENT', 'UID:' + K.slug + '-' + Date.now() + '@shaheendesign.sa', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(st), 'DTEND:' + f(en), 'SUMMARY:' + (e.title + ' ' + (e.hosts || '')).trim(), 'LOCATION:' + [e.venue, e.city].filter(Boolean).join('، '), 'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', 'DESCRIPTION:' + e.title, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = 'invitation.ics'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function inSheet(id, force) {
    var g = gById(id); if (!g) return; var left = g.seats - (g.inCount || 0), n = g.inAt ? 1 : Math.min(left, g.coming || g.seats);
    K.sheet('<form class="stack" data-a="doIn"><input type="hidden" name="id" value="' + E(id) + '"><input type="hidden" name="force" value="' + (force ? 1 : '') + '"><h2>دخول ' + E(g.name) + '</h2><p class="small muted">' + (g.inAt ? 'دخل ' + g.inCount + ' من ' + g.seats : 'أكد ' + (g.coming || 0) + ' من ' + g.seats) + '</p><label class="f">عدد الداخلين الحين<select name="n">' + Array.from({ length: left }, function (_, i) { return '<option' + (i + 1 === n ? ' selected' : '') + '>' + (i + 1) + '</option>'; }).join('') + '</select></label><button class="btn block">' + K.ic('check', 18) + 'تسجيل الدخول</button></form>');
  }
  K.define({
    roles: [['cust', 'الدعوة'], ['staff', 'الاستقبال'], ['owner', 'صاحب المناسبة']], bare: function (r) { return r === 'cust'; }, ownerCanStaff: true, staffTitle: 'دخول الاستقبال',
    stateData: function () { var g = myGuest(); return g ? { guest: g } : {}; },
    views: { cust: cust, staff: staff, owner: owner },
    after: function () {
      tickCd(); var q = document.getElementById('gq');
      if (q) q.addEventListener('input', function () { ui.q = q.value; var l = document.getElementById('glist'); if (l) l.innerHTML = listHtml(K.role === 'owner'); });
      if (K.role === 'cust' && K.st.guest && !ui.sentOpen) { ui.sentOpen = 1; K.api('open').catch(function () {}); }
      ui.justOpened = 0;
    },
    actions: {
      tryGuest: function () { LS.set(gkey, K.st.demoGuest); K.refresh(); },
      openEnv: function () { ui.opened = 1; ui.justOpened = 1; try { sessionStorage.setItem('inv-open-' + K.slug, '1'); } catch (e) {} K.render(true); window.scrollTo(0, 0); },
      cnt: function (b) { var g = K.st.guest; ui.coming = Math.max(1, Math.min(g.seats, (ui.coming || g.coming || g.seats) + Number(b.dataset.v))); K.render(true); },
      yes: function () { var g = K.st.guest; K.api('rsvp', { answer: 'yes', coming: ui.coming || g.coming || g.seats }).then(function () { ui.change = 0; K.render(true); K.celebrate('نتشرف بحضورك', 'هذا باركود دخولك، تلقاه هنا متى ما فتحت الرابط'); }, function (e) { K.toast(e.error); }); },
      no: function () { if (!confirm('متأكد إنك تعتذر عن الحضور؟')) return; K.api('rsvp', { answer: 'no' }).then(function () { ui.change = 0; K.render(true); K.toast('وصل اعتذارك، شكرًا'); }, function (e) { K.toast(e.error); }); },
      change: function () { var g = K.st.guest; ui.change = 1; ui.coming = g.coming || g.seats; K.render(true); },
      unchange: function () { ui.change = 0; K.render(true); },
      ics: ics,
      gf: function (b) { ui.f = b.dataset.v; K.render(true); },
      scan: function () { startScan(); }, stopScan: function () { stopScan(); }, photo: function () { var f = document.getElementById('camf'); if (f) f.click(); }, closeRes: function () { closeRes(); },
      inSheet: function (b) { closeRes(); inSheet(b.dataset.id, b.dataset.force); },
      doIn: function (f, d) { K.api('checkin', { id: d.id, n: Number(d.n), more: 1, force: !!d.force }).then(function (j) { K.close(); showRes(j); }, function (e) { K.toast(e.error); }); },
      wa: function (b) { var g = gById(b.dataset.id); if (!g) return; window.open(waUrl(g), '_blank', 'noopener'); if (!g.sent) K.run('sent', { id: g.id }); },
      nextWa: function () { var g = K.st.guests.filter(function (x) { return !x.sent && x.phone; })[0]; if (!g) { K.toast('ما فيه ضيوف بأرقام ما انرسلت لهم'); return; } window.open(waUrl(g), '_blank', 'noopener'); K.run('sent', { id: g.id }, 'انرسلت لـ ' + g.name); },
      guestSheet: function (b) {
        var g = b.dataset.id ? gById(b.dataset.id) : { name: '', phone: '', seats: 1, group: '' }, st = K.st;
        K.sheet('<form class="stack" data-a="guest"><h2>' + (g.id ? E(g.name) : 'ضيف جديد') + '</h2><input type="hidden" name="id" value="' + E(g.id || '') + '"><label class="f">الاسم<input name="name" required maxlength="50" value="' + E(g.name) + '"></label><div class="grid2"><label class="f">الجوال<input name="phone" inputmode="tel" class="ltr" placeholder="05xxxxxxxx" value="' + E(g.phone) + '"></label><label class="f">عدد المقاعد<input name="seats" type="number" min="1" max="20" value="' + (g.seats || 1) + '"></label></div><label class="f">المجموعة<input name="group" list="grps" maxlength="30" value="' + E(g.group) + '"><datalist id="grps">' + st.groups.map(function (x) { return '<option value="' + E(x) + '">'; }).join('') + '</datalist></label><button class="btn block">حفظ</button>' +
          (g.id ? '<div class="panel flat stack" style="padding:12px"><span class="small muted">رابط دعوته</span><p class="ltr tiny" style="word-break:break-all">' + E(link(g)) + '</p><div class="row wrap2"><button type="button" class="btn xs ghost" data-a="copyLink" data-v="' + E(link(g)) + '">نسخ الرابط</button>' + (g.phone ? '<button type="button" class="btn xs ok" data-a="wa" data-id="' + g.id + '">واتساب</button>' : '') + '<button type="button" class="btn xs ghost" data-a="relink" data-id="' + g.id + '">رابط جديد</button>' + (g.inAt ? '<button type="button" class="btn xs ghost" data-a="checkout" data-id="' + g.id + '">إلغاء الدخول</button>' : '') + '</div></div><button type="button" class="btn danger block" data-a="guestDel" data-id="' + g.id + '">حذف الضيف</button>' : '') + '</form>');
      },
      guest: function (f, d) { K.run('guest', { id: d.id, name: d.name, phone: d.phone, seats: Number(d.seats), group: d.group }, 'انحفظ').then(function () { K.close(); }); },
      guestDel: function (b) { if (confirm('حذف الضيف؟ رابط دعوته بيوقف')) K.run('guestDel', { id: b.dataset.id }, 'انحذف').then(function () { K.close(); }); },
      relink: function (b) { if (confirm('الرابط القديم بيوقف، وتحتاج ترسل له الجديد. أكمل؟')) K.run('relink', { id: b.dataset.id }, 'تغيّر الرابط').then(function () { K.close(); }); },
      checkout: function (b) { K.run('checkout', { id: b.dataset.id }, 'انلغى الدخول').then(function () { K.close(); }); },
      bulkSheet: function () { K.sheet('<form class="stack" data-a="bulk"><h2>إضافة قائمة ضيوف</h2><p class="small muted">كل ضيف في سطر: الاسم، الجوال، عدد المقاعد. تقدر تنسخها من الإكسل أو الملاحظات</p><textarea name="text" rows="8" required placeholder="نورة السبيعي، 0551234567، 2&#10;أم خالد، 0569876543، 4"></textarea><label class="f">المجموعة<input name="group" list="grps2" maxlength="30"><datalist id="grps2">' + K.st.groups.map(function (x) { return '<option value="' + E(x) + '">'; }).join('') + '</datalist></label><button class="btn block">إضافة</button></form>'); },
      bulk: function (f, d) { K.api('bulk', d).then(function (j) { K.close(); K.render(true); K.toast('انضاف ' + j.bulk.added + (j.bulk.skipped ? ' · تخطينا ' + j.bulk.skipped : '')); }, function (e) { K.toast(e.error); }); },
      event: function (f, d) { K.run('event', d, 'انحفظت الدعوة'); }
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target && e.target.dataset && e.target.dataset.a === 'openEnv') e.target.click(); if (e.key === 'Escape') { stopScan(); closeRes(); } });
})();
