/* الموارد البشرية: حضور وانصراف وإجازات من جوال الموظف · لوحة المدير وتقرير الشهر */
(function () {
  var E = K.esc, ui = K.ui;
  var DS = { present: ['حاضر', 'ok', '#1B7F4B'], late: ['متأخر', 'warn', '#D69500'], absent: ['غائب', 'bad', '#B3261E'], leave: ['إجازة', 'info', '#1F5F99'], off: ['عطلة', '', '#CFC8C0'], pending: ['لم يحضر بعد', '', '#E7E2DC'] };
  var LS = { pending: ['بانتظار الموافقة', 'warn'], approved: ['موافق عليها', 'ok'], rejected: ['مرفوضة', 'bad'], cancelled: ['ملغية', ''] };
  var WD = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  function cal(m) {
    var first = m.rows.length ? new Date(m.rows[0].day + 'T12:00:00Z').getUTCDay() : 0, cells = '';
    for (var i = 0; i < first; i++) cells += '<span></span>';
    cells += m.rows.map(function (r) { var s = DS[r.st] || DS.off; return '<span title="' + E(r.day + ' · ' + s[0]) + '" style="aspect-ratio:1;border-radius:9px;display:grid;place-items:center;font-size:12px;font-weight:600;background:' + s[2] + (r.st === 'off' || r.st === 'pending' ? ';color:var(--muted)' : ';color:#fff') + '">' + Number(r.day.slice(8)) + '</span>'; }).join('');
    return '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px">' + ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(function (w) { return '<span class="tiny muted" style="text-align:center">' + w + '</span>'; }).join('') + cells + '</div><div class="row wrap2 tiny" style="margin-top:8px">' + ['present', 'late', 'absent', 'leave'].map(function (k) { return '<span class="row" style="gap:4px"><i style="width:10px;height:10px;border-radius:3px;background:' + DS[k][2] + '"></i>' + DS[k][0] + '</span>'; }).join('') + '</div>';
  }
  function monthPicker() { var cur = K.st.month, opts = []; for (var i = 0; i < 6; i++) { var d = new Date(Date.UTC(+K.today().slice(0, 4), +K.today().slice(5, 7) - 1 - i, 1)); var v = d.toISOString().slice(0, 7); opts.push('<option value="' + v + '"' + (v === cur ? ' selected' : '') + '>' + d.toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { month: 'long', year: 'numeric', timeZone: 'UTC' }) + '</option>'); } return '<select id="mpick" style="width:auto">' + opts.join('') + '</select>'; }
  function staff() {
    var st = K.st, e = st.emp; if (!e) return K.empty('…');
    var t = e.today, m = e.month, r = st.rules;
    var html = '<div class="col"><section class="hero" style="text-align:center"><span class="tiny" style="opacity:.85">' + E(e.title || '') + (e.dept ? ' · ' + E(e.dept) : '') + '</span><h1>' + E(e.name) + '</h1><div class="num" style="font-size:44px;line-height:1.2;margin-top:6px" id="clk"></div><p class="tiny">' + K.dayName(K.today()) + ' · الدوام ' + K.t12(r.start) + ' – ' + K.t12(r.end) + '</p></section>';
    if (t.st === 'off') html += '<div class="panel" style="text-align:center"><b>اليوم عطلة</b></div>';
    else if (t.st === 'leave') html += '<div class="panel soft" style="text-align:center"><b>أنت في إجازة اليوم</b></div>';
    else if (t.in == null) html += '<button class="btn block" style="min-height:72px;font-size:19px" data-a="checkin">' + K.ic('in', 26) + 'تسجيل الحضور</button>';
    else html += '<div class="panel stack"><div class="row between"><span>الحضور <b class="num">' + K.t12(t.in) + '</b></span>' + K.chip(DS[t.st][0], DS[t.st][1]) + '</div>' + (t.late && t.st === 'late' ? '<p class="small muted">تأخير ' + t.late + ' دقيقة</p>' : '') + (t.out == null ? '<button class="btn dark block" style="min-height:62px" data-a="checkout">' + K.ic('out', 22) + 'تسجيل الانصراف</button>' : '<p>الانصراف <b class="num">' + K.t12(t.out) + '</b> · ' + Math.round((t.out - t.in) / 6) / 10 + ' ساعة</p>') + '</div>';
    html += K.stats([['أيام الحضور', m.present], ['التأخير', m.late], ['الغياب', m.absent], ['رصيد الإجازة', e.balance + ' يوم']]);
    html += '<section class="panel stack"><div class="row between"><h3>حضوري</h3>' + monthPicker() + '</div>' + cal(m) + '</section>';
    html += '<section class="panel stack"><div class="row between"><h3>إجازاتي</h3><button class="btn sm" data-a="leaveSheet">' + K.ic('plus', 16) + 'طلب إجازة</button></div><div class="list">' + (e.leaves.length ? e.leaves.map(function (l) { return '<div class="stack tight"><div class="row between"><b>' + E(l.type) + ' · ' + l.days + ' يوم</b>' + K.chip(LS[l.status][0], LS[l.status][1]) + '</div><span class="small muted">' + E(l.from) + (l.to !== l.from ? ' ← ' + E(l.to) : '') + (l.reply ? ' · ' + E(l.reply) : '') + '</span>' + (l.status === 'pending' ? '<button class="btn xs ghost" style="align-self:flex-start" data-a="cancelLeave" data-id="' + l.id + '">سحب الطلب</button>' : '') + '</div>'; }).join('') : K.empty('ما فيه طلبات')) + '</div></section>';
    return html + '</div>';
  }
  function owner() {
    var st = K.st, tab = ui.otab || 'today', html = K.tabs('ownerTab', [['today', 'اليوم'], ['leaves', 'الإجازات'], ['report', 'تقرير الشهر'], ['emps', 'الموظفين'], ['rules', 'الدوام'], ['brand', 'الهوية والرابط']], tab);
    var B = st.board || [], cnt = function (k) { return B.filter(function (x) { return x.st === k; }).length; };
    var pend = (st.leaves || []).filter(function (l) { return l.status === 'pending'; });
    if (tab === 'today') {
      html += K.stats([['حاضر', cnt('present') + cnt('late')], ['متأخر', cnt('late')], ['غائب', cnt('absent')], ['إجازة', cnt('leave')], ['لم يحضر بعد', cnt('pending')]]);
      html += '<div class="dash" style="margin-top:14px"><section class="panel"><h3>الحضور اليوم</h3><div class="list" style="margin-top:8px">' + B.map(function (x) { var s = DS[x.st]; return '<div class="item"><div class="av">' + K.initial(x.name) + '</div><div class="grow"><b>' + E(x.name) + '</b><div class="tiny muted">' + E(x.title || '') + ' · ' + E(x.dept || '') + '</div></div><div style="text-align:left">' + K.chip(s[0], s[1]) + (x.in != null ? '<div class="tiny num muted">' + K.t12(x.in) + (x.out != null ? ' ← ' + K.t12(x.out) : '') + '</div>' : '') + '</div></div>'; }).join('') + '</div></section>' +
        '<div class="stack"><section class="panel"><h3>الحضور آخر أسبوعين</h3>' + K.bars(st.days.map(function (d) { return [String(Number(d[0].slice(8))), d[1]]; })) + '</section>' + (pend.length ? '<section class="panel soft row between"><b>' + pend.length + ' طلب إجازة بانتظارك</b><button class="btn sm" data-a="ownerTab" data-v="leaves">راجعها</button></section>' : '') + '</div></div>';
    } else if (tab === 'leaves') {
      html += '<div class="dash"><section class="panel stack"><h2>بانتظار الموافقة</h2>' + (pend.length ? pend.map(function (l) { var e = B.filter(function (x) { return x.id === l.emp; })[0] || {}; return '<div class="card"><div class="row between"><b>' + E(l.name) + '</b>' + K.chip(l.type, 'acc') + '</div><span class="small">' + E(l.from) + (l.to !== l.from ? ' ← ' + E(l.to) : '') + ' · ' + l.days + ' يوم · الرصيد ' + (e.balance != null ? e.balance : '—') + '</span>' + (l.note ? '<p class="small muted">' + E(l.note) + '</p>' : '') + '<div class="row"><button class="btn sm ok grow" data-a="decide" data-id="' + l.id + '" data-ok="1">موافقة</button><button class="btn sm danger grow" data-a="decide" data-id="' + l.id + '" data-ok="0">رفض</button></div></div>'; }).join('') : K.empty('ما فيه طلبات')) + '</section>' +
        '<section class="panel"><h3>السجل</h3><div class="list small" style="margin-top:8px">' + (st.leaves || []).filter(function (l) { return l.status !== 'pending'; }).slice(0, 30).map(function (l) { return '<div class="row between"><span>' + E(l.name) + ' · ' + E(l.type) + ' · ' + l.days + ' يوم</span>' + K.chip(LS[l.status][0], LS[l.status][1]) + '</div>'; }).join('') + '</div></section></div>';
    } else if (tab === 'report') {
      html += '<section class="panel"><div class="row between wrap2"><h2>تقرير الحضور</h2><div class="row">' + monthPicker() + '<button class="btn sm ghost" data-a="csv">تنزيل Excel (CSV)</button></div></div><div class="tablewrap" style="margin-top:10px"><table class="t"><thead><tr><th>الموظف</th><th>القسم</th><th>حضور</th><th>تأخير</th><th>دقائق التأخير</th><th>غياب</th><th>إجازة</th><th>ساعات العمل</th><th></th></tr></thead><tbody>' +
        st.report.map(function (r) { return '<tr><td>' + E(r.name) + '</td><td>' + E(r.dept || '') + '</td><td class="num">' + r.present + '</td><td class="num">' + r.late + '</td><td class="num">' + r.lateMin + '</td><td class="num"' + (r.absent ? ' style="color:var(--danger)"' : '') + '>' + r.absent + '</td><td class="num">' + r.leave + '</td><td class="num">' + r.hours + '</td><td><button class="btn xs ghost" data-a="detail" data-id="' + r.id + '">التفاصيل</button></td></tr>'; }).join('') + '</tbody></table></div></section>';
      if (st.detail) html += '<section class="panel stack" style="margin-top:14px;max-width:520px"><div class="row between"><h3>' + E(st.detail.name) + '</h3><button class="btn xs ghost" data-a="detail" data-id="">إغلاق</button></div>' + cal(st.detail.month) + '<form class="stack" data-a="fix" style="border-top:1px solid var(--line);padding-top:10px"><b class="small">تعديل يوم (نسي يسجّل)</b><div class="grid3"><input type="date" name="day" required><input type="time" name="in" required><input type="time" name="out"></div><button class="btn sm">حفظ التعديل</button></form></section>';
    } else if (tab === 'emps') {
      html += '<div class="col" style="max-width:660px">' + K.teamPanel({ title: 'الموظفين', add: 'إضافة موظف', hint: 'كل موظف يسجّل حضوره من جواله برمزه.', sub: function (x) { return (x.title || '') + (x.dept ? ' · ' + x.dept : '') + ' · رصيد ' + x.balance + ' يوم'; }, fields: '<div class="grid3"><label class="f">المسمى<input name="title" maxlength="40"></label><label class="f">القسم<select name="dept">' + st.depts.map(function (d) { return '<option>' + E(d) + '</option>'; }).join('') + '</select></label><label class="f">رصيد الإجازة<input name="balance" type="number" min="0" max="90" value="21"></label></div>' }) + '</div>';
    } else if (tab === 'rules') {
      var r = st.rules;
      html += '<form class="panel stack" data-a="rules" style="max-width:540px"><h2>الدوام</h2><div class="grid3"><label class="f">البداية<input type="time" name="start" value="' + r.startT + '"></label><label class="f">النهاية<input type="time" name="end" value="' + r.endT + '"></label><label class="f">سماح التأخير (د)<input type="number" name="grace" min="0" max="120" value="' + r.grace + '"></label></div><fieldset style="border:0;padding:0;margin:0"><legend class="small" style="font-weight:600;margin-bottom:6px">أيام الدوام</legend><div class="row wrap2">' + WD.map(function (n, i) { return '<label class="check"><input type="checkbox" name="days" value="' + i + '"' + (r.days.indexOf(i) >= 0 ? ' checked' : '') + '>' + n + '</label>'; }).join('') + '</div></fieldset><button class="btn">حفظ</button></form>';
    } else html += K.brandPanel();
    return html;
  }
  K.define({
    roles: [['staff', 'الموظف'], ['owner', 'المدير']], staffTitle: 'دخول الموظف',
    views: { staff: staff, owner: owner },
    stateData: function () { var o = {}; if (ui.month) o.month = ui.month; if (ui.emp) o.emp = ui.emp; return o; },
    after: function () {
      var c = K.$('clk'); if (c) { var tick = function () { var d = new Date(Date.now() + 3 * 3600e3); c.textContent = K.t12(d.getUTCHours() * 60 + d.getUTCMinutes()); }; tick(); }
      var mp = K.$('mpick'); if (mp) mp.onchange = function () { ui.month = mp.value; K.refresh(); };
    },
    actions: {
      checkin: function () { K.api('checkin').then(function () { K.render(true); K.celebrate('تم تسجيل حضورك', K.clock(new Date().toISOString())); }, function (e) { K.toast(e.error); }); },
      checkout: function () { if (confirm('تسجيل الانصراف الحين؟')) K.run('checkout', {}, 'تم تسجيل الانصراف'); },
      leaveSheet: function () { var T = K.st.types; K.sheet('<form class="stack" data-a="leave"><h2>طلب إجازة</h2><label class="f">النوع<select name="type">' + T.map(function (t) { return '<option>' + E(t) + '</option>'; }).join('') + '</select></label><div class="grid2"><label class="f">من<input type="date" name="from" required value="' + K.today() + '"></label><label class="f">إلى<input type="date" name="to" required value="' + K.today() + '"></label></div><label class="f">ملاحظة<input name="note" maxlength="160"></label><p class="tiny muted">رصيدك السنوي ' + K.st.emp.balance + ' يوم</p><button class="btn block">أرسل للمدير</button></form>'); },
      leave: function (f, d) { K.run('leave', d, 'وصل طلبك للمدير').then(function () { K.close(); }); },
      cancelLeave: function (b) { K.run('cancelLeave', { id: b.dataset.id }, 'انسحب الطلب'); },
      decide: function (b) { var ok = b.dataset.ok === '1', note = ok ? '' : (prompt('سبب الرفض (يشوفه الموظف)') || ''); K.run('decide', { id: b.dataset.id, ok: ok, note: note }, ok ? 'تمت الموافقة' : 'انرفض'); },
      detail: function (b) { ui.emp = b.dataset.id || null; K.refresh(); },
      fix: function (f, d) { K.run('fix', { emp: ui.emp, day: d.day, in: d.in, out: d.out }, 'انحفظ'); },
      csv: function () {
        var rows = [['الموظف', 'القسم', 'أيام الحضور', 'مرات التأخير', 'دقائق التأخير', 'الغياب', 'الإجازة', 'ساعات العمل']].concat(K.st.report.map(function (r) { return [r.name, r.dept, r.present, r.late, r.lateMin, r.absent, r.leave, r.hours]; }));
        var csv = '﻿' + rows.map(function (r) { return r.map(function (x) { return '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'attendance-' + K.st.month + '.csv'; document.body.appendChild(a); a.click(); a.remove();
      },
      staffAdd: function (f, d) { d.balance = Number(d.balance); K.run('staffAdd', d, 'تمت الإضافة'); },
      rules: function (f, d) { K.run('rules', { start: d.start, end: d.end, grace: Number(d.grace), days: [].concat(d.days || []).map(Number) }, 'انحفظ'); }
    }
  });
})();
