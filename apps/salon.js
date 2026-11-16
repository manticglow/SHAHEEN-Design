/* صالون وسبا: حجز بالخدمة والمختصة والوقت · جدول اليوم للموظفات · لوحة المديرة */
(function () {
  var E = K.esc, M = K.money, ui = K.ui; ui.bk = {};
  var ST = { booked: ['محجوز', 'info'], arrived: ['وصلت', 'warn'], done: ['تمت', 'ok'], cancel: ['ملغي', ''], noshow: ['ما حضرت', 'bad'] };
  var CI = { 'شعر': 'scissors', 'أظافر': 'spark', 'بشرة': 'drop', 'سبا': 'spark', 'مكياج': 'brush' };
  function svc(id) { return K.st.services.filter(function (v) { return v.id === id; })[0]; }
  function sname(id) { var x = K.st.staff.filter(function (s) { return s.id === id; })[0]; return x ? x.name : '—'; }
  function when(b) { return K.dayName(b.day, { weekday: 'long', day: 'numeric', month: 'short' }) + ' · ' + K.t12(b.start); }
  function bookingRow(b, actions) {
    var s = ST[b.status] || ['', ''];
    return '<div class="item"><div class="av" style="flex-direction:column;width:58px;height:52px;line-height:1.1"><b class="num" style="font-size:14px">' + K.t12(b.start).split(' ')[0] + '</b><span class="tiny">' + K.t12(b.start).split(' ')[1] + '</span></div><div class="grow"><b>' + E(b.name) + '</b> ' + K.chip(s[0], s[1]) + '<div class="small muted">' + E(b.svc) + ' · ' + E(sname(b.staff)) + ' · ' + b.dur + ' د</div>' + (b.phone && K.role !== 'cust' ? '<a class="tiny ltr" style="color:var(--accent)" href="tel:' + E(b.phone) + '">' + E(b.phone) + '</a>' : '') + '</div>' + (actions || '') + '</div>';
  }
  function wizard() {
    var st = K.st, bk = ui.bk, v = bk.svc && svc(bk.svc), html = '<section class="panel stack" id="wiz"><div class="row between"><h2>احجزي موعدك</h2>' + (bk.svc ? '<button class="btn xs ghost" data-a="wreset">من جديد</button>' : '') + '</div>';
    if (!v) {
      html += st.cats.map(function (c) { var list = st.services.filter(function (x) { return x.cat === c; }); if (!list.length) return ''; return '<div><h4 class="muted" style="margin:6px 0">' + E(c) + '</h4><div class="stack tight">' + list.map(function (x) { return '<button class="panel flat item" style="padding:12px;text-align:start;cursor:pointer" data-a="pickSvc" data-id="' + x.id + '"><div class="av">' + K.ic(CI[x.cat] || 'spark', 20) + '</div><div class="grow"><b>' + E(x.name) + '</b><div class="tiny muted">' + x.min + ' دقيقة</div></div><b class="num" style="color:var(--accent)">' + M(x.price) + '</b></button>'; }).join('') + '</div></div>'; }).join('');
      return html + '</section>';
    }
    var team = st.staff.filter(function (s) { return !s.does || !s.does.length || s.does.indexOf(v.cat) >= 0; });
    html += '<div class="panel soft row between" style="padding:12px"><span><b>' + E(v.name) + '</b><span class="small muted"> · ' + v.min + ' د</span></span><b class="num">' + M(v.price) + '</b></div>';
    html += '<div><h4 style="margin-bottom:8px">المختصة</h4>' + K.seg('pickStaff', [['', 'أي وحدة متاحة']].concat(team.map(function (s) { return [s.id, s.name]; })), bk.staff || '') + '</div>';
    html += '<div><h4 style="margin-bottom:8px">اليوم</h4><div class="scroller">' + st.days.map(function (d, i) { var on = d === bk.day; return '<button type="button" class="btn ' + (on ? '' : 'ghost') + '" style="flex-direction:column;min-width:66px;min-height:66px;gap:0;padding:6px" data-a="pickDay" data-v="' + d + '"><span class="tiny">' + (i === 0 ? 'اليوم' : i === 1 ? 'بكرة' : K.dayName(d, { weekday: 'short', day: undefined, month: undefined })) + '</span><b class="num" style="font-size:18px">' + Number(d.slice(8)) + '</b></button>'; }).join('') + '</div></div>';
    if (bk.day) {
      var slots = st.slots || [];
      html += '<div><h4 style="margin-bottom:8px">الوقت</h4>' + (slots.length ? '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:8px">' + slots.map(function (x) { return '<button type="button" class="btn sm ' + (bk.time === x.t ? '' : 'ghost') + '" data-a="pickTime" data-v="' + x.t + '" data-st="' + x.st + '">' + K.t12(x.t) + '</button>'; }).join('') + '</div>' : K.empty('ما فيه أوقات فاضية هاليوم، جربي يوم ثاني')) + '</div>';
    }
    if (bk.time) {
      var c = (st.cards || [])[0];
      html += '<form class="stack" data-a="book" style="border-top:1px solid var(--line);padding-top:12px"><p><b>' + E(v.name) + '</b> · ' + K.dayName(bk.day) + ' · ' + K.t12(bk.time) + '</p><div class="grid2"><label class="f">الاسم<input name="name" required maxlength="40" value="' + E(c ? c.name : '') + '" autocomplete="given-name"></label><label class="f">الجوال<input name="phone" type="tel" inputmode="numeric" required class="ltr" value="' + E(c ? c.phone : '') + '" placeholder="05xxxxxxxx" autocomplete="tel"></label></div><button class="btn block">تأكيد الحجز · الدفع في الصالون</button><p class="tiny muted" style="text-align:center">تقدرين تلغين قبل الموعد بساعتين من هنا</p></form>';
    }
    return html + '</section>';
  }
  function cust() {
    var st = K.st, c = (st.cards || [])[0], up = (st.mine || []).filter(function (b) { return b.status === 'booked' || b.status === 'arrived'; });
    var html = '<div class="col"><section class="hero"><svg class="deco" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1">' + K.ic('spark').replace(/<\/?svg[^>]*>/g, '') + '</svg><h1>' + E(st.brand.name) + '</h1><p>' + E(st.brand.tagline) + '</p><p class="tiny" style="margin-top:8px">' + K.ic('clock', 14) + ' يوميًا ' + K.t12(st.hours.open) + ' – ' + K.t12(st.hours.close) + '</p></section>';
    if (up.length) html += '<section class="panel stack"><h2>مواعيدك</h2><div class="list">' + up.map(function (b) { return '<div class="stack tight"><div class="row between"><b>' + E(b.svc) + '</b>' + K.chip((ST[b.status] || [''])[0], 'info') + '</div><span class="small">' + when(b) + ' · مع ' + E(sname(b.staff)) + '</span>' + (b.status === 'booked' ? '<button class="btn xs danger" style="align-self:flex-start" data-a="cancel" data-id="' + b.id + '">إلغاء الموعد</button>' : '') + '</div>'; }).join('') + '</div></section>';
    if (c) html += '<section class="hero" style="padding:18px"><div class="row between"><div><span class="tiny" style="opacity:.8">بطاقة الولاء · ' + E(c.name) + '</span><h2 class="num">' + Math.min(c.stamps, st.need) + ' / ' + st.need + ' زيارات</h2></div><div style="text-align:left"><span class="tiny" style="opacity:.8">رمز البطاقة</span><div class="num ltr" style="font-size:18px">' + E(c.code) + '</div></div></div><div class="meter" style="margin-top:12px;background:rgba(255,255,255,.25)"><i style="background:#fff;width:' + Math.min(100, Math.round(100 * c.stamps / st.need)) + '%"></i></div><p class="tiny" style="margin-top:8px;opacity:.85">' + (c.stamps >= st.need ? 'هديتك جاهزة: جلسة مجانية بزيارتك الجاية 🎁' : 'باقي ' + (st.need - c.stamps) + ' زيارات وتوصلك جلسة هدية') + '</p></section>';
    html += wizard();
    if (!c) html += '<p class="small muted" style="text-align:center">حجزتي قبل؟ <a href="#" data-a="lookupSheet" style="color:var(--accent)">ادخلي برقمك</a></p>';
    return html + '</div>';
  }
  function dayBookings(day) { return (K.st.bookings || []).filter(function (b) { return b.day === day; }).sort(function (a, b) { return a.start - b.start; }); }
  function staffActs(b) {
    if (b.status === 'booked') return '<div class="row" style="gap:6px"><button class="btn xs" data-a="bstatus" data-id="' + b.id + '" data-to="arrived">وصلت</button><button class="btn xs danger" data-a="bstatus" data-id="' + b.id + '" data-to="noshow" aria-label="ما حضرت">' + K.ic('x', 14) + '</button></div>';
    if (b.status === 'arrived') return '<button class="btn xs ok" data-a="bstatus" data-id="' + b.id + '" data-to="done">تمت</button>';
    return '';
  }
  function staff() {
    var st = K.st, me = st.me.staff, today = K.today(), list = dayBookings(today).filter(function (b) { return b.status !== 'cancel'; });
    var mineL = me ? list.filter(function (b) { return b.staff === me.id; }) : [];
    var html = '<div class="dash"><div class="stack">';
    if (me) html += '<section class="panel"><div class="row between"><h2>مواعيدي اليوم</h2>' + K.chip(mineL.length + ' مواعيد', 'acc') + '</div><div class="list" style="margin-top:10px">' + (mineL.length ? mineL.map(function (b) { return bookingRow(b, staffActs(b)); }).join('') : K.empty('ما عندك مواعيد اليوم')) + '</div></section>';
    html += '<section class="panel"><div class="row between"><h2>جدول الصالون اليوم</h2><button class="btn sm" data-a="walkin">' + K.ic('plus', 16) + 'حجز مباشر</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:12px">' +
      st.staff.map(function (s) { var x = list.filter(function (b) { return b.staff === s.id; }); return '<div class="lane"><h3>' + E(s.name) + ' <span class="chip">' + x.length + '</span></h3>' + (x.length ? x.map(function (b) { return '<div class="card" style="padding:9px"><div class="row between"><b class="num">' + K.t12(b.start) + '</b>' + K.chip(ST[b.status][0], ST[b.status][1]) + '</div><span class="small">' + E(b.name) + ' · ' + E(b.svc) + '</span>' + staffActs(b) + '</div>'; }).join('') : '<span class="tiny muted">فاضية</span>') + '</div>'; }).join('') + '</div></section></div>';
    var tom = dayBookings(K.st.days[1]).filter(function (b) { return b.status === 'booked'; });
    html += '<div class="stack"><section class="panel"><h3>بكرة</h3><div class="list small" style="margin-top:8px">' + (tom.length ? tom.map(function (b) { return '<div class="row between"><span>' + K.t12(b.start) + ' · ' + E(b.name) + '</span><span class="muted">' + E(b.svc) + '</span></div>'; }).join('') : K.empty('ما فيه حجوزات')) + '</div></section></div></div>';
    return html;
  }
  function owner() {
    var st = K.st, s = st.stats || {}, tab = ui.otab || 'home';
    var html = K.tabs('ownerTab', [['home', 'نظرة عامة'], ['book', 'الحجوزات'], ['svc', 'الخدمات'], ['team', 'الفريق'], ['members', 'العميلات'], ['set', 'الأوقات'], ['brand', 'الهوية والرابط']], tab);
    if (tab === 'home') {
      html += K.stats([['حجوزات اليوم', s.today], ['دخل اليوم', M(s.revenueToday)], ['دخل الأسبوع', M(s.revenueWeek)], ['نسبة عدم الحضور', s.noshow + '٪']]);
      html += '<div class="dash" style="margin-top:14px"><div class="stack"><div class="panel"><h3>الدخل آخر ٧ أيام</h3>' + K.bars(s.days.map(function (d) { return [K.dayShort(d[0]), d[1]]; })) + '</div><div class="panel"><h3>جدول اليوم</h3><div class="list" style="margin-top:8px">' + (dayBookings(K.today()).length ? dayBookings(K.today()).map(function (b) { return bookingRow(b, staffActs(b)); }).join('') : K.empty('ما فيه حجوزات اليوم')) + '</div></div></div>' +
        '<div class="stack"><div class="panel"><h3>الأكثر طلبًا هالأسبوع</h3><div class="list small" style="margin-top:8px">' + s.top.map(function (t) { return '<div class="row between"><span>' + E(t[0]) + '</span><b>' + t[1] + '</b></div>'; }).join('') + '</div></div><div class="panel"><h3>حجوزات اليوم لكل مختصة</h3><div class="list small" style="margin-top:8px">' + s.perStaff.map(function (t) { return '<div class="row between"><span>' + E(t[0]) + '</span><b>' + t[1] + '</b></div>'; }).join('') + '</div></div><div class="panel"><h3>آخر الأحداث</h3><div class="list small" style="margin-top:8px">' + st.feed.slice(0, 8).map(function (f) { return '<div class="row between"><span>' + E(f.text) + '</span><span class="tiny muted">' + K.ago(f.at) + '</span></div>'; }).join('') + '</div></div></div></div>';
    } else if (tab === 'book') {
      var days = st.days.slice(0, 7);
      html += '<div class="stack">' + days.map(function (d) { var x = dayBookings(d).filter(function (b) { return b.status !== 'cancel'; }); return '<section class="panel"><div class="row between"><h3>' + K.dayName(d) + '</h3>' + K.chip(x.length + ' حجز') + '</div>' + (x.length ? '<div class="list" style="margin-top:8px">' + x.map(function (b) { return bookingRow(b, b.status === 'booked' ? '<button class="btn xs danger" data-a="cancel" data-id="' + b.id + '">إلغاء</button>' : ''); }).join('') + '</div>' : '') + '</section>'; }).join('') + '</div>';
    } else if (tab === 'svc') {
      html += '<div class="panel"><div class="row between"><h2>الخدمات والأسعار</h2><button class="btn sm" data-a="svcSheet">' + K.ic('plus', 16) + 'خدمة</button></div><div class="tablewrap" style="margin-top:10px"><table class="t"><thead><tr><th>الخدمة</th><th>القسم</th><th>المدة</th><th>السعر</th><th></th></tr></thead><tbody>' + st.services.map(function (v) { return '<tr><td>' + E(v.name) + '</td><td>' + E(v.cat) + '</td><td>' + v.min + ' د</td><td class="num">' + M(v.price) + '</td><td><button class="btn xs ghost" data-a="svcSheet" data-id="' + v.id + '">تعديل</button></td></tr>'; }).join('') + '</tbody></table></div></div>';
    } else if (tab === 'team') {
      html += '<div class="col" style="max-width:640px">' + K.teamPanel({ title: 'المختصات', add: 'إضافة مختصة', hint: 'كل مختصة تدخل برمزها وتشوف مواعيدها. الأقسام تحدد وش الخدمات اللي تنحجز معها.', sub: function (x) { return (x.role || '') + (x.does && x.does.length ? ' · ' + x.does.join('، ') : ''); },
        fields: '<label class="f">المسمى<input name="role" maxlength="30" placeholder="خبيرة شعر"></label><fieldset style="border:0;padding:0;margin:0"><legend class="small" style="font-weight:600;margin-bottom:6px">الأقسام</legend><div class="row wrap2">' + st.cats.map(function (c) { return '<label class="check"><input type="checkbox" name="does" value="' + E(c) + '">' + E(c) + '</label>'; }).join('') + '</div></fieldset>' }) + '</div>';
    } else if (tab === 'members') {
      html += '<div class="col" style="max-width:640px"><div class="panel"><h2>عميلات الولاء</h2><div class="list" style="margin-top:10px">' + ((st.members || []).length ? st.members.map(function (m) { return '<div class="item"><div class="av">' + K.initial(m.name) + '</div><div class="grow"><b>' + E(m.name) + '</b><div class="tiny muted ltr" style="text-align:right">' + E(m.phone) + '</div></div><b class="num">' + m.stamps + '/' + st.need + '</b>' + (m.stamps >= st.need ? '<button class="btn xs ok" data-a="redeem" data-id="' + m.id + '">سلّمي الهدية</button>' : '') + '</div>'; }).join('') : K.empty('ما فيه عميلات لسا')) + '</div></div></div>';
    } else if (tab === 'set') {
      html += '<form class="panel stack" data-a="hours" style="max-width:520px"><h2>أوقات العمل</h2><div class="grid2"><label class="f">يفتح<input type="time" name="open" value="' + K.hhmm(st.hours.open) + '"></label><label class="f">يقفل<input type="time" name="close" value="' + K.hhmm(st.hours.close) + '"></label></div><fieldset style="border:0;padding:0;margin:0"><legend class="small" style="font-weight:600;margin-bottom:6px">أيام الإجازة</legend><div class="row wrap2">' + ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(function (n, i) { return '<label class="check"><input type="checkbox" name="off" value="' + i + '"' + (st.hours.off.indexOf(i) >= 0 ? ' checked' : '') + '>' + n + '</label>'; }).join('') + '</div></fieldset><label class="f">زيارات بطاقة الولاء<input type="number" name="need" min="3" max="30" value="' + st.need + '"></label><button class="btn">حفظ</button></form>';
    } else html += K.brandPanel();
    return html;
  }
  function svcSheet(b) {
    var v = b.dataset.id ? svc(b.dataset.id) : { name: '', price: '', min: 60, cat: K.st.cats[0] };
    K.sheet('<form class="stack" data-a="service"><h2>' + (v.id ? 'تعديل خدمة' : 'خدمة جديدة') + '</h2><input type="hidden" name="id" value="' + E(v.id || '') + '"><label class="f">الاسم<input name="name" required maxlength="40" value="' + E(v.name) + '"></label><div class="grid3"><label class="f">السعر<input name="price" type="number" min="0" required value="' + E(v.price) + '"></label><label class="f">المدة (د)<input name="min" type="number" step="15" min="15" required value="' + v.min + '"></label><label class="f">القسم<select name="cat">' + K.st.cats.map(function (c) { return '<option' + (c === v.cat ? ' selected' : '') + '>' + E(c) + '</option>'; }).join('') + '</select></label></div><button class="btn block">حفظ</button>' + (v.id ? '<button type="button" class="btn danger block" data-a="svcDel" data-id="' + v.id + '">حذف</button>' : '') + '</form>');
  }
  K.define({
    roles: [['cust', 'العميلة'], ['staff', 'الموظفات'], ['owner', 'المديرة']], staffTitle: 'دخول الموظفة', ownerCanStaff: true,
    views: { cust: cust, staff: staff, owner: owner },
    stateData: function () { return ui.bk.svc && ui.bk.day ? { slots: { svc: ui.bk.svc, staff: ui.bk.staff || '', day: ui.bk.day } } : {}; },
    actions: {
      pickSvc: function (b) { ui.bk = { svc: b.dataset.id, staff: '', day: K.st.days[0] }; K.refresh(); K.render(true); },
      pickStaff: function (b) { ui.bk.staff = b.dataset.v; ui.bk.time = null; K.refresh(); },
      pickDay: function (b) { ui.bk.day = b.dataset.v; ui.bk.time = null; K.st.slots = null; K.render(true); K.refresh(); },
      pickTime: function (b) { ui.bk.time = b.dataset.v; K.render(true); var f = document.querySelector('form[data-a=book] input'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
      wreset: function () { ui.bk = {}; K.render(true); },
      book: function (f, d) {
        var bk = ui.bk; K.api('book', { svc: bk.svc, staff: bk.staff, day: bk.day, time: bk.time, name: d.name, phone: d.phone }).then(function (j) {
          K.addMine(j.issued.booking, j.issued.key); if (j.issued.token) K.addCust(j.issued.id, j.issued.token); ui.bk = {}; K.close(); K.render(true); window.scrollTo(0, 0); K.celebrate('تم الحجز', 'نشوفك على خير');
        }, function (e) { K.toast(e.error); if (e.status === 409) { ui.bk.time = null; K.refresh(); } });
      },
      cancel: function (b) { if (confirm('إلغاء الموعد؟')) K.run('cancel', { id: b.dataset.id }, 'انلغى الموعد'); },
      bstatus: function (b) { K.run('status', { id: b.dataset.id, to: b.dataset.to }); },
      walkin: function () { K.role = 'cust'; ui.bk = {}; history.replaceState(null, '', '#cust'); K.render(true); K.toast('اختاري الخدمة واحجزي للعميلة'); },
      redeem: function (b) { K.run('redeem', { id: b.dataset.id }).then(function () { K.celebrate('تم تسليم الهدية', ''); }); },
      svcSheet: svcSheet,
      service: function (f, d) { K.run('service', d, 'انحفظت').then(function () { K.close(); }); },
      svcDel: function (b) { if (confirm('حذف الخدمة؟')) K.run('serviceDel', { id: b.dataset.id }, 'انحذفت').then(function () { K.close(); }); },
      hours: function (f, d) { K.run('hours', { open: d.open, close: d.close, off: [].concat(d.off || []).map(Number), need: Number(d.need) }, 'انحفظ'); },
      staffAdd: function (f, d) { d.does = [].concat(d.does || []); K.run('staffAdd', d, 'تمت الإضافة'); },
      lookupSheet: function () { K.sheet('<form class="stack" data-a="lookup"><h2>ادخلي لبطاقتك</h2><label class="f">رقم الجوال<input name="phone" type="tel" inputmode="numeric" required class="ltr"></label><label class="f">رمز البطاقة<input name="code" inputmode="numeric" required maxlength="4" class="ltr"></label><p class="tiny muted">' + (K.st.tenant.demo ? 'للتجربة: 0501112233 والرمز 1111' : 'الرمز يوصلك مع أول حجز') + '</p><button class="btn block">دخول</button></form>'); },
      lookup: function (f, d) { K.api('lookup', {}, { phone: d.phone, code: d.code }).then(function (j) { K.addCust(j.issued.id, j.issued.token); K.close(); K.refresh(); }, function (e) { K.toast(e.error); }); }
    }
  });
})();
