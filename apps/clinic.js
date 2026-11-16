/* عيادة: حجز موعد + رقم انتظار حي · الاستقبال ونداء الأرقام · شاشة الانتظار · لوحة الإدارة */
(function () {
  var E = K.esc, M = K.money, ui = K.ui; ui.bk = {};
  var QS = { waiting: ['بالانتظار', 'info'], called: ['تفضّل للعيادة', 'warn'], in: ['عند الطبيب', 'acc'], done: ['انتهى', 'ok'], skip: ['تخطّي', 'bad'] };
  var AS = { booked: ['محجوز', 'info'], checked: ['وصل', 'warn'], done: ['تم', 'ok'], cancel: ['ملغي', ''], noshow: ['ما حضر', 'bad'] };
  function doc(id) { return K.st.doctors.filter(function (d) { return d.id === id; })[0] || { name: '—', spec: '' }; }
  function myTicket(t) {
    var b = K.st.board.filter(function (x) { return x.id === t.doctor; })[0] || {}, mineNow = t.status === 'called';
    return '<section class="hero" style="text-align:center;padding:22px' + (mineNow ? ';animation:pop .4s' : '') + '"><span class="tiny" style="opacity:.85">رقمك · ' + E(doc(t.doctor).name) + '</span><div class="num" style="font-size:64px;line-height:1.1;margin:6px 0">' + E(t.no) + '</div>' +
      (t.status === 'waiting' ? '<p><b>قدامك ' + t.ahead + '</b> · الدور الحين على <b class="num">' + E(b.now || '—') + '</b></p><p class="tiny" style="opacity:.85;margin-top:4px">الانتظار المتوقع تقريبًا ' + Math.max(5, (t.ahead + 1) * (b.avg || 15)) + ' دقيقة · خلك قريب، الصفحة تتحدث لحالها</p>'
        : '<p style="font-size:18px"><b>' + E(QS[t.status][0]) + '</b></p>') + '</section>';
  }
  function wizard() {
    var st = K.st, bk = ui.bk, d = bk.doctor && doc(bk.doctor), html = '<section class="panel stack"><div class="row between"><h2>احجز موعد</h2>' + (bk.doctor ? '<button class="btn xs ghost" data-a="wreset">من جديد</button>' : '') + '</div>';
    if (!d || !d.id) return html + '<div class="stack tight">' + st.doctors.map(function (x) { return '<button class="panel flat item" style="padding:12px;text-align:start;cursor:pointer" data-a="pickDoc" data-id="' + x.id + '"><div class="av">' + K.ic('steth', 20) + '</div><div class="grow"><b>' + E(x.name) + '</b><div class="tiny muted">' + E(x.spec) + ' · ' + K.t12(x.open) + ' – ' + K.t12(x.close) + '</div></div><span class="small num">' + M(x.fee) + '</span></button>'; }).join('') + '</div></section>';
    html += '<div class="panel soft row between" style="padding:12px"><span><b>' + E(d.name) + '</b><span class="small muted"> · ' + E(d.spec) + '</span></span><b class="num">' + M(d.fee) + '</b></div>';
    html += '<div class="scroller">' + st.days.map(function (x, i) { return '<button type="button" class="btn ' + (x === bk.day ? '' : 'ghost') + '" style="flex-direction:column;min-width:66px;min-height:66px;gap:0;padding:6px" data-a="pickDay" data-v="' + x + '"><span class="tiny">' + (i === 0 ? 'اليوم' : i === 1 ? 'بكرة' : K.dayName(x, { weekday: 'short', day: undefined, month: undefined })) + '</span><b class="num" style="font-size:18px">' + Number(x.slice(8)) + '</b></button>'; }).join('') + '</div>';
    if (bk.day) { var sl = st.slots || []; html += sl.length ? '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:8px">' + sl.map(function (t) { return '<button type="button" class="btn sm ' + (bk.time === t ? '' : 'ghost') + '" data-a="pickTime" data-v="' + t + '">' + K.t12(t) + '</button>'; }).join('') + '</div>' : K.empty('ما فيه مواعيد فاضية هاليوم'); }
    if (bk.time) html += '<form class="stack" data-a="book" style="border-top:1px solid var(--line);padding-top:12px"><p><b>' + E(d.name) + '</b> · ' + K.dayName(bk.day) + ' · ' + K.t12(bk.time) + '</p><div class="grid2"><label class="f">اسم المراجع<input name="name" required maxlength="40"></label><label class="f">الجوال<input name="phone" type="tel" inputmode="numeric" required class="ltr" placeholder="05xxxxxxxx"></label></div><label class="f">سبب الزيارة (اختياري)<input name="reason" maxlength="80"></label><button class="btn block">تأكيد الموعد</button></form>';
    return html + '</section>';
  }
  function cust() {
    var st = K.st, today = K.today(), tk = (st.myQueue || []).filter(function (t) { return t.status !== 'done' && t.status !== 'skip'; });
    var appts = (st.mine || []).filter(function (a) { return a.status === 'booked' || a.status === 'checked'; });
    var html = '<div class="col">';
    if (!tk.length) html += '<section class="hero"><svg class="deco" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1">' + K.ic('steth').replace(/<\/?svg[^>]*>/g, '') + '</svg><h1>' + E(st.brand.name) + '</h1><p>' + E(st.brand.tagline) + '</p></section>';
    html += tk.map(myTicket).join('');
    html += appts.map(function (a) { var d = doc(a.doctor); return '<section class="panel stack"><div class="row between"><b>موعدك مع ' + E(d.name) + '</b>' + K.chip(AS[a.status][0], AS[a.status][1]) + '</div><span class="small">' + K.dayName(a.day) + ' · ' + K.t12(a.start) + '</span><div class="row">' + (a.day === today && a.status === 'booked' && st.selfQueue ? '<button class="btn sm" data-a="checkin" data-id="' + a.id + '" data-doc="' + a.doctor + '" data-name="' + E(a.name) + '">وصلت؟ سجّل وصولك</button>' : '') + (a.status === 'booked' ? '<button class="btn sm danger" data-a="cancel" data-id="' + a.id + '">إلغاء</button>' : '') + '</div></section>'; }).join('');
    html += '<section class="panel stack"><h2>الانتظار الحين</h2><div class="list">' + st.board.map(function (b) { return '<div class="item"><div class="av">' + K.ic('steth', 20) + '</div><div class="grow"><b>' + E(b.name) + '</b><div class="tiny muted">' + E(b.spec) + ' · بالانتظار ' + b.waiting + '</div></div><div style="text-align:center"><span class="tiny muted">الدور على</span><div class="num" style="font-size:20px">' + E(b.now || '—') + '</div></div></div>'; }).join('') + '</div>' +
      (st.selfQueue && !tk.length ? '<button class="btn block soft" data-a="ticketSheet">' + K.ic('plus', 18) + 'خذ رقم انتظار</button>' : '') + '</section>';
    html += wizard();
    return html + '</div>';
  }
  function staff() {
    var st = K.st, q = st.queue || [], today = K.today();
    var html = '<div class="dash"><div class="stack"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px">' + st.board.map(function (b) {
      var mine = q.filter(function (t) { return t.doctor === b.id; }), cur = mine.filter(function (t) { return t.status === 'called' || t.status === 'in'; })[0], wait = mine.filter(function (t) { return t.status === 'waiting'; }).sort(function (a, c) { return a.at < c.at ? -1 : 1; });
      return '<section class="lane"><h3>' + E(b.name) + ' <span class="chip">' + wait.length + ' بالانتظار</span></h3><div class="card" style="text-align:center"><span class="tiny muted">الحالي</span><div class="num" style="font-size:38px;line-height:1.1">' + E(cur ? cur.no : '—') + '</div>' + (cur ? '<span class="small">' + E(cur.name) + ' · ' + K.chip(QS[cur.status][0], QS[cur.status][1]) + '</span><div class="row" style="justify-content:center">' + (cur.status === 'called' ? '<button class="btn xs ok" data-a="qs" data-id="' + cur.id + '" data-to="in">دخل</button><button class="btn xs danger" data-a="qs" data-id="' + cur.id + '" data-to="skip">ما حضر</button>' : '<button class="btn xs ok" data-a="qs" data-id="' + cur.id + '" data-to="done">انتهى</button>') + '</div>' : '') + '</div>' +
        '<button class="btn block" data-a="call" data-doc="' + b.id + '"' + (wait.length ? '' : ' disabled') + '>' + K.ic('bell', 18) + 'نادِ التالي</button>' + wait.slice(0, 6).map(function (t) { return '<div class="row between small"><span><b class="num">' + E(t.no) + '</b> · ' + E(t.name) + (t.appt ? ' ' + K.chip('موعد', 'acc') : '') + '</span><span class="tiny muted">' + K.ago(t.at) + '</span></div>'; }).join('') + '</section>';
    }).join('') + '</div></div>';
    var ap = (st.appts || []).filter(function (a) { return a.day === today; }).sort(function (a, b) { return a.start - b.start; });
    html += '<div class="stack"><section class="panel stack"><div class="row between"><h3>رقم جديد</h3></div><form class="stack" data-a="walkTicket"><select name="doctor">' + st.doctors.map(function (d) { return '<option value="' + d.id + '">' + E(d.name) + '</option>'; }).join('') + '</select><input name="name" required placeholder="اسم المراجع" maxlength="40"><button class="btn sm">' + K.ic('plus', 16) + 'اطبع رقم</button></form></section>' +
      '<section class="panel"><h3>مواعيد اليوم</h3><div class="list small" style="margin-top:8px">' + (ap.length ? ap.map(function (a) { return '<div class="stack tight"><div class="row between"><b>' + K.t12(a.start) + ' · ' + E(a.name) + '</b>' + K.chip(AS[a.status][0], AS[a.status][1]) + '</div><span class="tiny muted">' + E(doc(a.doctor).name) + (a.reason ? ' · ' + E(a.reason) : '') + '</span>' + (a.status === 'booked' ? '<div class="row"><button class="btn xs" data-a="checkin" data-id="' + a.id + '" data-doc="' + a.doctor + '" data-name="' + E(a.name) + '">سجّل وصوله</button><button class="btn xs danger" data-a="noshow" data-id="' + a.id + '">ما حضر</button></div>' : '') + '</div>'; }).join('') : K.empty('ما فيه مواعيد اليوم')) + '</div></section>' +
      '<a class="btn ghost block" href="#screen" data-role="screen">' + K.ic('chart', 18) + 'افتح شاشة الانتظار</a></div></div>';
    return html;
  }
  var lastNow = {};
  function screen() {
    var st = K.st;
    return '<div style="background:#0F1A1C;color:#fff;border-radius:26px;padding:24px;min-height:70vh"><div class="row between" style="margin-bottom:18px"><h1 style="font-size:28px">' + E(st.brand.name) + '</h1><span class="num" style="font-size:22px;opacity:.8" id="clk"></span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">' +
      st.board.map(function (b) { return '<div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:22px;text-align:center"><div style="font-size:18px;font-weight:600">' + E(b.name) + '</div><div style="opacity:.6;font-size:14px">' + E(b.spec) + '</div><div class="num" style="font-size:88px;line-height:1.1;margin:14px 0;color:var(--accent-mid)">' + E(b.now || '—') + '</div><div style="opacity:.75">بالانتظار ' + b.waiting + '</div></div>'; }).join('') + '</div><p style="text-align:center;opacity:.55;margin-top:22px;font-size:14px">امسح الرمز عند الاستقبال وتابع دورك من جوالك</p></div>';
  }
  function owner() {
    var st = K.st, s = st.stats || {}, tab = ui.otab || 'home';
    var html = K.tabs('ownerTab', [['home', 'نظرة عامة'], ['docs', 'الأطباء'], ['team', 'الاستقبال'], ['set', 'الإعدادات'], ['brand', 'الهوية والرابط']], tab);
    if (tab === 'home') {
      html += K.stats([['مراجعين اليوم', s.patients], ['انتهوا', s.done], ['متوسط الانتظار', s.avgWait + ' د'], ['دخل الكشوفات', M(s.revenue)]]);
      html += '<div class="dash" style="margin-top:14px"><div class="panel"><h3>المراجعين آخر ٧ أيام</h3>' + K.bars(s.days.map(function (d) { return [K.dayShort(d[0]), d[1]]; })) + '</div><div class="stack"><div class="panel"><h3>اليوم لكل طبيب</h3><div class="list small" style="margin-top:8px">' + s.perDoctor.map(function (t) { return '<div class="row between"><span>' + E(t[0]) + '</span><b>' + t[1] + '</b></div>'; }).join('') + '</div></div><div class="panel"><h3>عدم الحضور</h3><b class="num" style="font-size:24px">' + s.noshow + '٪</b><p class="tiny muted">من مواعيد آخر ٧ أيام</p></div></div></div>';
    } else if (tab === 'docs') {
      html += '<div class="panel"><div class="row between"><h2>الأطباء</h2><button class="btn sm" data-a="docSheet">' + K.ic('plus', 16) + 'طبيب</button></div><div class="tablewrap" style="margin-top:10px"><table class="t"><thead><tr><th>الطبيب</th><th>التخصص</th><th>الكشف</th><th>الدوام</th><th>مدة الموعد</th><th></th></tr></thead><tbody>' + st.doctors.map(function (d) { return '<tr><td>' + E(d.name) + (d.on ? '' : ' ' + K.chip('موقوف')) + '</td><td>' + E(d.spec) + '</td><td class="num">' + M(d.fee) + '</td><td>' + K.t12(d.open) + ' – ' + K.t12(d.close) + '</td><td>' + d.dur + ' د</td><td><button class="btn xs ghost" data-a="docSheet" data-id="' + d.id + '">تعديل</button></td></tr>'; }).join('') + '</tbody></table></div></div>';
    } else if (tab === 'team') html += '<div class="col" style="max-width:620px">' + K.teamPanel({ title: 'موظفي الاستقبال', add: 'إضافة موظف استقبال', hint: 'الاستقبال ينادي الأرقام ويسجّل وصول المراجعين.' }) + '</div>';
    else if (tab === 'set') html += '<form class="panel stack" data-a="settings" style="max-width:520px"><h2>الطابور</h2><label class="check"><input type="checkbox" name="selfQueue"' + (st.selfQueue ? ' checked' : '') + '>المراجع ياخذ رقمه من جواله (من رابط العيادة أو رمز QR عند الاستقبال)</label><button class="btn">حفظ</button></form>';
    else html += K.brandPanel();
    return html;
  }
  function docSheet(b) {
    var d = b.dataset.id ? doc(b.dataset.id) : { name: '', spec: '', fee: '', dur: 20, open: 960, close: 1320, off: [5], on: true };
    K.sheet('<form class="stack" data-a="doctor"><h2>' + (d.id ? 'تعديل طبيب' : 'طبيب جديد') + '</h2><input type="hidden" name="id" value="' + E(d.id || '') + '"><div class="grid2"><label class="f">الاسم<input name="name" required value="' + E(d.name) + '"></label><label class="f">التخصص<input name="spec" value="' + E(d.spec) + '"></label></div><div class="grid3"><label class="f">الكشف<input name="fee" type="number" min="0" value="' + E(d.fee) + '"></label><label class="f">مدة الموعد<input name="dur" type="number" min="10" step="5" value="' + d.dur + '"></label><label class="f">الحالة<select name="on"><option value="1">يستقبل</option><option value="0"' + (d.on ? '' : ' selected') + '>موقوف</option></select></label></div><div class="grid2"><label class="f">من<input type="time" name="open" value="' + K.hhmm(d.open) + '"></label><label class="f">إلى<input type="time" name="close" value="' + K.hhmm(d.close) + '"></label></div><fieldset style="border:0;padding:0;margin:0"><legend class="small" style="font-weight:600;margin-bottom:6px">أيام الإجازة</legend><div class="row wrap2">' + ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(function (n, i) { return '<label class="check"><input type="checkbox" name="off" value="' + i + '"' + ((d.off || []).indexOf(i) >= 0 ? ' checked' : '') + '>' + n + '</label>'; }).join('') + '</div></fieldset><button class="btn block">حفظ</button></form>');
  }
  K.define({
    roles: [['cust', 'المراجع'], ['staff', 'الاستقبال'], ['screen', 'شاشة الانتظار'], ['owner', 'الإدارة']], staffTitle: 'دخول الاستقبال', ownerCanStaff: true,
    views: { cust: cust, staff: staff, screen: screen, owner: owner },
    stateData: function () { return ui.bk.doctor && ui.bk.day ? { slots: { doctor: ui.bk.doctor, day: ui.bk.day } } : {}; },
    after: function () {
      var c = K.$('clk'); if (c) c.textContent = K.clock(new Date().toISOString());
      var changed = false; (K.st.board || []).forEach(function (b) { if (lastNow[b.id] !== undefined && b.now && lastNow[b.id] !== b.now) changed = true; lastNow[b.id] = b.now; });
      if (changed && (K.role === 'screen' || (K.st.myQueue || []).some(function (t) { return t.status === 'called'; }))) { K.ping(740); setTimeout(function () { K.ping(990); }, 220); }
    },
    actions: {
      pickDoc: function (b) { ui.bk = { doctor: b.dataset.id, day: K.st.days[0] }; K.refresh(); K.render(true); },
      pickDay: function (b) { ui.bk.day = b.dataset.v; ui.bk.time = null; K.st.slots = null; K.render(true); K.refresh(); },
      pickTime: function (b) { ui.bk.time = b.dataset.v; K.render(true); },
      wreset: function () { ui.bk = {}; K.render(true); },
      book: function (f, d) { var bk = ui.bk; K.api('book', { doctor: bk.doctor, day: bk.day, time: bk.time, name: d.name, phone: d.phone, reason: d.reason }).then(function (j) { K.addMine(j.issued.appt, j.issued.key); ui.bk = {}; K.render(true); window.scrollTo(0, 0); K.celebrate('تم حجز موعدك', 'يوم الموعد سجّل وصولك من هنا'); }, function (e) { K.toast(e.error); if (e.status === 409) { ui.bk.time = null; K.refresh(); } }); },
      cancel: function (b) { if (confirm('إلغاء الموعد؟')) K.run('cancel', { id: b.dataset.id }, 'انلغى'); },
      ticketSheet: function () { K.sheet('<form class="stack" data-a="takeTicket"><h2>رقم انتظار</h2><label class="f">الطبيب<select name="doctor">' + K.st.doctors.map(function (d) { return '<option value="' + d.id + '">' + E(d.name) + ' · ' + E(d.spec) + '</option>'; }).join('') + '</select></label><label class="f">الاسم<input name="name" required maxlength="40"></label><button class="btn block">خذ رقمي</button></form>'); },
      takeTicket: function (f, d) { K.api('ticket', d).then(function (j) { K.addMine(j.issued.ticket, j.issued.key); K.close(); K.render(true); window.scrollTo(0, 0); K.celebrate('رقمك جاهز', 'تابع دورك من هنا'); }, function (e) { K.toast(e.error); }); },
      checkin: function (b) { K.api('ticket', { doctor: b.dataset.doc, appt: b.dataset.id, name: b.dataset.name }).then(function (j) { if (K.role === 'cust') K.addMine(j.issued.ticket, j.issued.key); K.render(true); K.toast('تم تسجيل الوصول'); }, function (e) { K.toast(e.error); }); },
      walkTicket: function (f, d) { K.run('ticket', d).then(function (j) { K.toast('رقم المراجع: ' + ((j.queue || []).filter(function (t) { return t.id === j.issued.ticket; })[0] || {}).no); }); },
      call: function (b) { K.run('call', { doctor: b.dataset.doc }).then(function () { K.ping(880); }); },
      qs: function (b) { K.run('qstatus', { id: b.dataset.id, to: b.dataset.to }); },
      noshow: function (b) { K.run('apptStatus', { id: b.dataset.id, to: 'noshow' }); },
      docSheet: docSheet,
      doctor: function (f, d) { d.off = [].concat(d.off || []).map(Number); d.on = d.on !== '0'; K.run('doctor', d, 'انحفظ').then(function () { K.close(); }); },
      settings: function (f, d) { K.run('settings', { selfQueue: !!d.selfQueue }, 'انحفظ'); }
    }
  });
})();
