/* مقهى: منيو QR + سلة + متابعة الطلب + بطاقة ولاء · شاشة الباريستا · لوحة المدير */
(function () {
  var E = K.esc, M = K.money, ui = K.ui;
  ui.cart = K.LS.get(K.key('cart'), {}); ui.cat = null;
  var qp = new URLSearchParams(location.search); ui.table = Number(qp.get('t')) || K.LS.get(K.key('table'), 0) || 0;
  if (qp.get('t')) K.LS.set(K.key('table'), ui.table);
  var saveCart = function () { K.LS.set(K.key('cart'), ui.cart); };
  var FLOW = { new: 'استلمنا طلبك', prep: 'نحضّره لك', ready: 'جاهز! تفضّل استلمه', done: 'بالعافية', cancel: 'انلغى الطلب' };
  var STEPS = ['new', 'prep', 'ready', 'done'];
  function card() { return (K.st.cards || [])[0]; }
  function cartItems() { var m = K.st.menu; return Object.keys(ui.cart).map(function (id) { var x = m.filter(function (y) { return y.id === id; })[0]; return x ? { x: x, q: ui.cart[id] } : null; }).filter(Boolean); }
  function cartTotal() { return cartItems().reduce(function (t, c) { return t + c.x.price * c.q; }, 0); }
  function stampsHtml(n, need) { var s = ''; for (var i = 0; i < need; i++) s += '<span style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;' + (i < n ? 'background:#fff;color:var(--accent)' : 'border:1.5px dashed rgba(255,255,255,.5);color:rgba(255,255,255,.5)') + '">' + K.ic(i === need - 1 ? 'gift' : 'cup', 18) + '</span>'; return '<div style="display:flex;flex-wrap:wrap;gap:8px">' + s + '</div>'; }

  function tracker(o) {
    var k = STEPS.indexOf(o.status);
    return '<div class="panel stack' + (o.status === 'ready' ? ' soft' : '') + '"><div class="row between"><div><span class="tiny muted">طلب رقم</span><h2 class="num">#' + o.no + '</h2></div><div style="text-align:left"><b>' + M(o.total) + '</b><div class="tiny muted">' + E(o.where) + ' · ' + K.clock(o.at) + '</div></div></div>' +
      (o.status === 'cancel' ? K.chip('انلغى', 'bad') : '<div class="row" style="gap:4px">' + STEPS.map(function (s, i) { return '<div class="grow"><div class="meter"><i style="width:' + (i <= k ? 100 : 0) + '%"></i></div></div>'; }).join('') + '</div><p><b>' + E(FLOW[o.status]) + '</b>' + (o.status === 'ready' ? ' — ' + (o.where === 'استلام' ? 'من الكاونتر' : 'بنجيبه لطاولتك') : '') + '</p>') +
      '<p class="small muted">' + o.items.map(function (x) { return E(x[0]) + ' ×' + x[1]; }).join('، ') + '</p></div>';
  }
  function cust() {
    var st = K.st, c = card(), cats = st.cats, cur = ui.cat || cats[0];
    var active = (st.mine || []).filter(function (o) { return o.status !== 'done' && o.status !== 'cancel'; });
    var html = '<div class="col">';
    html += '<section class="hero"><svg class="deco" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1">' + K.ic('latte').replace(/<\/?svg[^>]*>/g, '') + '</svg><span class="chip" style="background:rgba(255,255,255,.18);color:#fff;border:0">' + (ui.table ? 'طاولة ' + ui.table : 'استلام من الكاونتر') + '</span><h1 style="margin-top:10px">أهلًا فيك في ' + E(st.brand.name) + '</h1><p>اطلب من جوالك، ونجهّزه لك على طول.</p></section>';
    html += active.map(tracker).join('');
    // loyalty
    if (c) html += '<section class="hero" style="padding:18px"><div class="row between"><div><span class="tiny" style="opacity:.8">بطاقة الولاء · ' + E(c.name) + '</span><h2 class="num" style="margin-top:2px">' + c.stamps + ' / ' + st.need + '</h2></div><div style="text-align:left"><span class="tiny" style="opacity:.8">رمز البطاقة</span><div class="num ltr" style="font-size:18px">' + E(c.code) + '</div></div></div><div style="margin-top:12px">' + stampsHtml(Math.min(c.stamps, st.need), st.need) + '</div><p class="tiny" style="margin-top:10px;opacity:.85">' + (c.stamps >= st.need ? 'مبروك! مشروبك المجاني جاهز، قل للباريستا 🎁' : 'باقي ' + (st.need - c.stamps) + ' ويصير مشروبك مجاني. الختم ينضاف تلقائي مع كل طلب.') + '</p></section>';
    else html += '<section class="panel soft row between"><div><b>بطاقة ولاء</b><p class="small muted">كل ' + st.need + ' طلبات، الطلب اللي بعدها علينا</p></div><button class="btn sm" data-a="joinSheet">' + K.ic('gift', 18) + 'فعّلها</button></section>';
    // menu
    html += '<div class="scroller" style="position:sticky;top:0;z-index:5;background:var(--bg);padding:8px 0">' + cats.map(function (x) { return '<button class="btn sm ' + (x === cur ? '' : 'ghost') + '" data-a="cat" data-v="' + E(x) + '">' + E(x) + '</button>'; }).join('') + '</div>';
    html += '<div class="stack">' + st.menu.filter(function (m) { return m.cat === cur; }).map(function (m) {
      var q = ui.cart[m.id] || 0;
      return '<div class="panel flat item" style="padding:14px;' + (m.on ? '' : 'opacity:.5') + '"><div class="av" style="width:54px;height:54px;border-radius:16px">' + K.ic(m.icon, 28) + '</div><div class="grow"><b>' + E(m.name) + '</b><p class="small muted">' + E(m.desc) + '</p><b class="num" style="color:var(--accent)">' + M(m.price) + '</b></div>' +
        (!m.on ? K.chip('خلص اليوم') : q ? '<div class="row" style="gap:6px"><button class="btn xs ghost" data-a="dec" data-id="' + m.id + '" aria-label="نقّص">' + K.ic('minus', 16) + '</button><b class="num">' + q + '</b><button class="btn xs" data-a="inc" data-id="' + m.id + '" aria-label="زوّد">' + K.ic('plus', 16) + '</button></div>' : '<button class="btn xs" data-a="inc" data-id="' + m.id + '" aria-label="أضف ' + E(m.name) + '">' + K.ic('plus', 16) + '</button>') + '</div>';
    }).join('') + '</div>';
    var n = cartItems().reduce(function (t, x) { return t + x.q; }, 0);
    if (n) html += '<div style="height:70px"></div><div style="position:fixed;bottom:calc(14px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:min(440px,calc(100% - 32px));z-index:20"><button class="btn block dark" style="min-height:58px;justify-content:space-between;box-shadow:0 14px 30px -10px rgba(0,0,0,.4)" data-a="cartSheet"><span>' + K.ic('cup', 20) + ' السلة · ' + n + '</span><span class="num">' + M(cartTotal()) + '</span></button></div>';
    var past = (st.mine || []).filter(function (o) { return o.status === 'done'; });
    if (past.length) html += '<details class="panel"><summary style="cursor:pointer;font-weight:600">طلباتي السابقة</summary><div class="list" style="margin-top:10px">' + past.map(function (o) { return '<div class="row between small"><span>#' + o.no + ' · ' + o.items.map(function (x) { return E(x[0]); }).join('، ') + '</span><b>' + M(o.total) + '</b></div>'; }).join('') + '</div></details>';
    if (!c) html += '<p class="small muted" style="text-align:center">عندك بطاقة من قبل؟ <a href="#" data-a="lookupSheet" style="color:var(--accent)">ادخل برقمك</a></p>';
    return html + '</div>';
  }
  function cartSheet() {
    var st = K.st, items = cartItems(), c = card();
    K.sheet('<form class="stack" data-a="order"><div class="row between"><h2>سلتك</h2><button type="button" class="btn xs ghost" data-a="close">إغلاق</button></div><div class="list">' + items.map(function (x) { return '<div class="row between"><span>' + E(x.x.name) + ' <span class="muted">×' + x.q + '</span></span><b class="num">' + M(x.x.price * x.q) + '</b></div>'; }).join('') + '</div>' +
      '<label class="f">وين تبغاه؟<select name="table"><option value="0">استلام من الكاونتر</option>' + Array.from({ length: st.tables }, function (_, i) { return '<option value="' + (i + 1) + '"' + (ui.table === i + 1 ? ' selected' : '') + '>طاولة ' + (i + 1) + '</option>'; }).join('') + '</select></label>' +
      (c ? '' : '<label class="f">اسمك (اختياري)<input name="name" maxlength="30" placeholder="عشان نناديك"></label>') + '<label class="f">ملاحظة<input name="note" maxlength="120" placeholder="مثلًا: بدون سكر، حليب شوفان"></label>' +
      (c ? '<p class="small chip acc" style="align-self:flex-start">ينضاف ختم لبطاقة ' + E(c.name) + ' بعد ما تستلم</p>' : '') +
      '<div class="row between" style="border-top:1px solid var(--line);padding-top:12px"><b>الإجمالي</b><b class="num" style="font-size:20px">' + M(cartTotal()) + '</b></div><button class="btn block">أرسل الطلب · الدفع عند الكاشير</button><p class="tiny muted" style="text-align:center">الدفع الإلكتروني (Apple Pay ومدى) يتفعّل مع بوابة الدفع حقت المقهى</p></form>');
  }
  function baristaCard(o, next, label) {
    return '<div class="card' + (o.status === 'new' ? ' hot' : '') + '"><div class="row between"><b class="num" style="font-size:18px">#' + o.no + '</b><span class="chip ' + (o.where === 'استلام' ? 'info' : 'acc') + '">' + E(o.where) + '</span></div><div>' + o.items.map(function (x) { return '<div class="row between"><span>' + E(x[0]) + '</span><b class="num">×' + x[1] + '</b></div>'; }).join('') + '</div>' +
      (o.note ? '<p class="small" style="background:var(--warn-bg);color:var(--warn);border-radius:9px;padding:6px 9px">' + E(o.note) + '</p>' : '') + '<div class="row between tiny muted"><span>' + (o.name ? E(o.name) + ' · ' : '') + K.ago(o.at) + '</span><b>' + M(o.total) + '</b></div>' +
      '<div class="row">' + (next ? '<button class="btn sm grow" data-a="status" data-id="' + o.id + '" data-to="' + next + '">' + label + '</button>' : '') + (o.status === 'new' || o.status === 'prep' ? '<button class="btn sm danger" data-a="status" data-id="' + o.id + '" data-to="cancel" aria-label="إلغاء">' + K.ic('x', 16) + '</button>' : '') + '</div></div>';
  }
  var lastNew = null;
  function staff() {
    var st = K.st, o = st.orders || [], tab = ui.stab || 'q';
    var lane = function (s) { return o.filter(function (x) { return x.status === s; }).sort(function (a, b) { return a.at < b.at ? -1 : 1; }); };
    var html = K.tabs('staffTab', [['q', 'الطلبات'], ['loyal', 'الولاء'], ['menu', 'المتوفر']], tab);
    if (tab === 'q') {
      html += '<div class="kanban">' + [['new', 'جديد', 'prep', 'ابدأ التحضير'], ['prep', 'نحضّر', 'ready', 'جاهز'], ['ready', 'جاهز للتسليم', 'done', 'تم التسليم']].map(function (l) { var x = lane(l[0]); return '<section class="lane"><h3>' + l[1] + ' <span class="chip">' + x.length + '</span></h3>' + (x.length ? x.map(function (y) { return baristaCard(y, l[2], l[3]); }).join('') : K.empty('ما فيه')) + '</section>'; }).join('') + '</div>';
    } else if (tab === 'loyal') {
      var q = (ui.lq || '').trim(), list = (st.members || []).filter(function (m) { return !q || m.last4.indexOf(q) >= 0 || m.name.indexOf(q) >= 0; }).slice(0, 20);
      html += '<div class="col"><div class="panel stack"><h2>بطاقات الولاء</h2><input type="search" id="lq" placeholder="آخر ٤ أرقام من الجوال أو الاسم" value="' + E(q) + '" inputmode="search"><div class="list">' + (list.length ? list.map(function (m) { return '<div class="item"><div class="av">' + K.initial(m.name) + '</div><div class="grow"><b>' + E(m.name) + '</b><div class="tiny muted ltr" style="text-align:right">' + E(m.phone) + '</div></div><b class="num">' + m.stamps + '/' + st.need + '</b>' + (m.stamps >= st.need ? '<button class="btn xs ok" data-a="redeem" data-id="' + m.id + '">' + K.ic('gift', 16) + 'سلّم الهدية</button>' : '<button class="btn xs soft" data-a="stamp" data-id="' + m.id + '">+ ختم</button>') + '</div>'; }).join('') : K.empty('ما لقينا أحد')) + '</div></div></div>';
    } else {
      html += '<div class="col"><div class="panel"><h2>المتوفر اليوم</h2><div class="list" style="margin-top:8px">' + st.menu.map(function (m) { return '<label class="row between" style="cursor:pointer"><span class="row">' + K.ic(m.icon, 20) + E(m.name) + '</span><input type="checkbox" data-a="avail" data-id="' + m.id + '"' + (m.on ? ' checked' : '') + ' style="width:22px;height:22px;accent-color:var(--accent)"></label>'; }).join('') + '</div></div></div>';
    }
    return html;
  }
  function owner() {
    var st = K.st, s = st.stats || {}, tab = ui.otab || 'home', html = K.tabs('ownerTab', [['home', 'نظرة عامة'], ['menu', 'المنيو'], ['qr', 'رموز الطاولات'], ['team', 'الفريق'], ['brand', 'الهوية والرابط']], tab);
    if (tab === 'home') {
      html += K.stats([['مبيعات اليوم', M(s.revenue)], ['طلبات اليوم', s.count], ['متوسط الفاتورة', M(s.avg)], ['أعضاء الولاء', s.members]]);
      html += '<div class="dash" style="margin-top:14px"><div class="stack"><div class="panel"><h3>المبيعات آخر ٧ أيام</h3>' + K.bars(s.days.map(function (d) { return [K.dayShort(d[0]), d[1]]; }), function (v) { return Math.round(v); }) + '</div>' +
        '<div class="panel"><h3>الطلبات حسب الساعة اليوم</h3>' + K.bars(s.hours.map(function (v, h) { return [h % 3 ? '' : String(h), v]; }).slice(6, 24)) + '</div></div>' +
        '<div class="stack"><div class="panel"><h3>الأكثر طلبًا اليوم</h3><div class="list" style="margin-top:8px">' + (s.top.length ? s.top.map(function (t, i) { return '<div class="row between"><span>' + (i + 1) + '. ' + E(t[0]) + '</span><b class="num">' + t[1] + '</b></div>'; }).join('') : K.empty('ما فيه طلبات اليوم')) + '</div></div>' +
        '<div class="panel"><h3>آخر الأحداث</h3><div class="list small" style="margin-top:8px">' + st.feed.slice(0, 10).map(function (f) { return '<div class="row between"><span>' + E(f.text) + '</span><span class="tiny muted">' + K.ago(f.at) + '</span></div>'; }).join('') + '</div></div></div></div>';
    } else if (tab === 'menu') {
      html += '<div class="panel"><div class="row between"><h2>المنيو</h2><button class="btn sm" data-a="itemSheet">' + K.ic('plus', 18) + 'صنف جديد</button></div><div class="tablewrap" style="margin-top:10px"><table class="t"><thead><tr><th>الصنف</th><th>القسم</th><th>السعر</th><th>الحالة</th><th></th></tr></thead><tbody>' +
        st.menu.map(function (m) { return '<tr><td><span class="row">' + K.ic(m.icon, 18) + E(m.name) + '</span></td><td>' + E(m.cat) + '</td><td class="num">' + M(m.price) + '</td><td>' + (m.on ? K.chip('متوفر', 'ok') : K.chip('خلص')) + '</td><td><button class="btn xs ghost" data-a="itemSheet" data-id="' + m.id + '">تعديل</button></td></tr>'; }).join('') + '</tbody></table></div></div>';
      html += '<form class="panel row wrap2" data-a="settings" style="margin-top:14px;align-items:flex-end"><label class="f grow">عدد الطاولات<input name="tables" type="number" min="0" max="200" value="' + st.tables + '"></label><label class="f grow">أختام المكافأة<input name="need" type="number" min="3" max="30" value="' + st.need + '"></label><button class="btn">حفظ</button></form>';
    } else if (tab === 'qr') {
      var base = location.origin + '/s/' + K.slug + '?t=';
      html += '<div class="panel"><div class="row between"><div><h2>رموز الطاولات</h2><p class="small muted">اطبعها وحطها على الطاولات. الزبون يمسح ويطلب، والطلب يوصل الباريستا برقم الطاولة.</p></div><button class="btn sm ghost" data-a="print">طباعة</button></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-top:14px">' +
        Array.from({ length: Math.min(st.tables, 40) }, function (_, i) { return '<div class="panel flat" style="text-align:center;padding:12px"><div class="qrbox" style="padding:6px">' + K.qr(base + (i + 1)).replace('<svg', '<svg style="width:130px;height:130px"') + '</div><b style="display:block;margin-top:6px">طاولة ' + (i + 1) + '</b><span class="tiny muted">امسح واطلب</span></div>'; }).join('') + '</div></div>';
    } else if (tab === 'team') html += '<div class="col" style="max-width:620px">' + K.teamPanel({ hint: 'الباريستا والكاشير. كل واحد يدخل برمزه من صفحة "الباريستا".' }) + '</div>';
    else html += K.brandPanel();
    return html;
  }
  K.define({
    roles: [['cust', 'الزبون'], ['staff', 'الباريستا'], ['owner', 'المدير']], staffTitle: 'دخول الباريستا', ownerCanStaff: true,
    views: { cust: cust, staff: staff, owner: owner },
    after: function () {
      var lq = K.$('lq'); if (lq) { lq.oninput = function () { ui.lq = lq.value; var p = lq.selectionStart; K.render(true); var n = K.$('lq'); n.focus(); n.setSelectionRange(p, p); }; }
      if (K.role === 'staff' && K.st.orders) { var news = K.st.orders.filter(function (o) { return o.status === 'new'; }).map(function (o) { return o.id; }); if (lastNew && news.some(function (id) { return lastNew.indexOf(id) < 0; })) { K.ping(990); setTimeout(function () { K.ping(1320); }, 160); } lastNew = news; }
    },
    actions: {
      cat: function (b) { ui.cat = b.dataset.v; K.render(true); },
      inc: function (b) { ui.cart[b.dataset.id] = Math.min(20, (ui.cart[b.dataset.id] || 0) + 1); saveCart(); K.render(true); },
      dec: function (b) { var id = b.dataset.id; ui.cart[id] = (ui.cart[id] || 0) - 1; if (ui.cart[id] <= 0) delete ui.cart[id]; saveCart(); K.render(true); },
      cartSheet: cartSheet,
      order: function (f, d) {
        var c = card(); var items = cartItems().map(function (x) { return { id: x.x.id, qty: x.q }; });
        K.api('order', { items: items, table: Number(d.table), note: d.note, name: d.name, cust: c ? c.id : null }).then(function (j) { K.addMine(j.issued.order, j.issued.key); ui.cart = {}; saveCart(); K.close(); K.render(true); window.scrollTo(0, 0); K.celebrate('وصل طلبك', 'نبلّغك هنا أول ما يجهز'); }, function (e) { K.toast(e.error); });
      },
      joinSheet: function () { K.sheet('<form class="stack" data-a="join"><h2>بطاقة الولاء</h2><p class="muted small">كل طلب = ختم. بعد ' + K.st.need + ' أختام مشروبك علينا.</p><label class="f">الاسم<input name="name" required maxlength="40" autocomplete="given-name"></label><label class="f">رقم الجوال<input name="phone" type="tel" inputmode="numeric" required placeholder="05xxxxxxxx" class="ltr" autocomplete="tel"></label><button class="btn block">فعّل البطاقة</button><button type="button" class="btn ghost block" data-a="close">لاحقًا</button></form>'); },
      join: function (f, d) { K.api('join', d).then(function (j) { K.addCust(j.issued.id, j.issued.token); K.close(); K.render(true); K.celebrate('بطاقتك جاهزة', 'وأول ختم هدية منّا'); }, function (e) { K.toast(e.error); }); },
      lookupSheet: function () { K.sheet('<form class="stack" data-a="lookup"><h2>ادخل لبطاقتك</h2><label class="f">رقم الجوال<input name="phone" type="tel" inputmode="numeric" required class="ltr"></label><label class="f">رمز البطاقة<input name="code" inputmode="numeric" required maxlength="4" class="ltr" placeholder="٤ أرقام"></label><p class="tiny muted">الرمز مكتوب على بطاقتك' + (K.st.tenant.demo ? ' · للتجربة: 0501112233 والرمز 1111' : '') + '</p><button class="btn block">دخول</button></form>'); },
      lookup: function (f, d) { K.api('lookup', {}, { phone: d.phone, code: d.code }).then(function (j) { K.addCust(j.issued.id, j.issued.token); K.close(); K.refresh(); K.toast('أهلًا من جديد'); }, function (e) { K.toast(e.error); }); },
      status: function (b) { K.run('status', { id: b.dataset.id, to: b.dataset.to }); },
      stamp: function (b) { K.run('stamp', { id: b.dataset.id }, 'انضاف الختم'); },
      redeem: function (b) { K.run('redeem', { id: b.dataset.id }).then(function () { K.celebrate('تم تسليم الهدية', ''); }); },
      avail: function (b) { K.run('avail', { id: b.dataset.id, on: b.checked }); },
      itemSheet: function (b) {
        var m = b.dataset.id ? K.st.menu.filter(function (x) { return x.id === b.dataset.id; })[0] : { name: '', price: '', desc: '', cat: K.st.cats[0], icon: 'cup' };
        var icons = ['latte', 'cup', 'drip', 'dallah', 'iced', 'matcha', 'tea', 'cake', 'cookie'];
        K.sheet('<form class="stack" data-a="item"><h2>' + (m.id ? 'تعديل صنف' : 'صنف جديد') + '</h2><input type="hidden" name="id" value="' + E(m.id || '') + '"><label class="f">الاسم<input name="name" required maxlength="40" value="' + E(m.name) + '"></label><div class="grid2"><label class="f">السعر<input name="price" type="number" step="0.5" min="0" required value="' + E(m.price) + '"></label><label class="f">القسم<select name="cat">' + K.st.cats.map(function (c) { return '<option' + (c === m.cat ? ' selected' : '') + '>' + E(c) + '</option>'; }).join('') + '</select></label></div><label class="f">وصف قصير<input name="desc" maxlength="80" value="' + E(m.desc) + '"></label><fieldset class="f" style="border:0;padding:0;margin:0"><legend style="font-weight:600;font-size:13.5px;margin-bottom:6px">الأيقونة</legend><div class="seg">' + icons.map(function (i) { return '<label style="cursor:pointer"><input type="radio" name="icon" value="' + i + '"' + (i === m.icon ? ' checked' : '') + ' style="position:absolute;opacity:0"><span class="btn xs ghost" style="min-width:44px;min-height:44px">' + K.ic(i, 20) + '</span></label>'; }).join('') + '</div></fieldset><button class="btn block">حفظ</button>' + (m.id ? '<button type="button" class="btn danger block" data-a="itemDel" data-id="' + m.id + '">حذف الصنف</button>' : '') + '</form>');
      },
      item: function (f, d) { K.run('item', d, 'انحفظ').then(function () { K.close(); }); },
      itemDel: function (b) { if (confirm('حذف الصنف؟')) K.run('itemDel', { id: b.dataset.id }, 'انحذف').then(function () { K.close(); }); },
      settings: function (f, d) { K.run('settings', { tables: Number(d.tables), need: Number(d.need) }, 'انحفظ'); }
    }
  });
})();
