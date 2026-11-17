// واجهة لوحة التحكم (/admin)
export default String.raw`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="manifest" href="/admin.webmanifest">
<meta name="theme-color" content="#0e0e11">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="شاهين">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<link rel="apple-touch-icon" href="/admin-icon-192.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="robots" content="noindex, nofollow">
<title>لوحة تحكم شاهين ديزاين</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Marcellus&display=swap" rel="stylesheet">
<style>
:root{--ink:#0E0E11;--ink2:#1A1A1F;--gold:#B8935A;--gold2:#D4B886;--cream:#F1ECDF;--paper:#FBF8F2;--line:#E2D9C6;--sub:#5E584C;--mute:#8C8678;--err:#B4483C;--ok:#3E7B53}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--paper);color:var(--ink);font-family:Cairo,Tahoma,sans-serif;font-size:15px;line-height:1.6}
[hidden]{display:none!important}
button,input,textarea,select{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.lat{font-family:Marcellus,Georgia,serif;direction:ltr;unicode-bidi:isolate}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--gold);background:var(--gold);color:var(--ink);font-weight:700;border-radius:999px;padding:9px 20px;cursor:pointer;text-decoration:none;min-height:42px}
.btn:hover{background:var(--gold2);border-color:var(--gold2)}
.btn.ghost{background:transparent;color:inherit;border-color:var(--line)}
.btn.ghost:hover{border-color:var(--gold);background:rgba(184,147,90,.08)}
.btn.sm{padding:5px 12px;min-height:34px;font-size:13px;font-weight:600}
.btn.danger{border-color:#E6C9C3;color:var(--err);background:transparent}
.btn[disabled]{opacity:.45;cursor:not-allowed}
/* login */
.login{min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--ink)}
.login form{width:min(380px,100%);background:var(--paper);border-radius:22px;padding:34px 28px;display:grid;gap:16px}
.login h1{font-size:22px}
.brand{display:flex;align-items:center;gap:12px}
.brand svg{width:40px;height:38px;transform:scaleX(-1)}
/* app */
header.top{position:sticky;top:0;z-index:20;background:var(--ink);color:var(--cream);display:flex;align-items:center;gap:14px;padding:10px 20px;flex-wrap:wrap}
header.top .brand b{font-size:16px}
header.top .brand small{display:block;font-size:12px;color:#A9A293}
.status{font-size:13px;color:#C9C2B2;margin-inline-start:auto}
.status.dirty{color:var(--gold2)}
header.top .btn.ghost{color:var(--cream);border-color:rgba(241,236,223,.25)}
nav.tabs{position:sticky;top:62px;z-index:15;background:var(--paper);border-bottom:1px solid var(--line);display:flex;gap:4px;overflow-x:auto;padding:8px 16px;scrollbar-width:none}
nav.tabs button{border:0;background:none;padding:9px 16px;border-radius:999px;cursor:pointer;white-space:nowrap;font-weight:600;color:var(--sub)}
nav.tabs button[aria-selected="true"]{background:var(--ink);color:var(--cream)}
main{max-width:1000px;margin:0 auto;padding:24px 20px 120px}
.panel-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:18px;flex-wrap:wrap}
.panel-head h2{font-size:24px}
.panel-head p{color:var(--sub);font-size:14px;max-width:60ch}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px;display:grid;gap:14px;margin-bottom:14px}
.card-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.card-head h3{font-size:17px}
.tools{display:flex;gap:6px;flex-wrap:wrap}
.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.f{display:grid;gap:4px}
.f > span{font-size:13px;font-weight:600;color:var(--sub);display:flex;justify-content:space-between;gap:8px}
.f > span em{font-style:normal;font-weight:400;color:var(--mute)}
.f > span em.over{color:var(--err);font-weight:700}
.f input[type=text],.f input[type=url],.f input[type=email],.f input[type=tel],.f textarea,.f select{width:100%;border:1px solid var(--line);border-radius:12px;padding:9px 12px;background:var(--paper)}
.f textarea{min-height:90px;resize:vertical;line-height:1.7}
.f input:focus,.f textarea:focus,.f select:focus{outline:none;border-color:var(--gold);background:#fff}
.f small{font-size:12px;color:var(--mute)}
.check{display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer}
.check input{width:18px;height:18px;accent-color:var(--gold)}
.color{display:flex;align-items:center;gap:8px}
.color input[type=color]{width:46px;height:40px;border:1px solid var(--line);border-radius:10px;padding:2px;background:#fff;cursor:pointer}
.color input[type=text]{direction:ltr;text-align:left;max-width:120px}
.imgpick{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.imgpick .thumb{width:84px;height:84px;border-radius:14px;border:1px dashed var(--line);background:var(--cream) center/contain no-repeat;display:grid;place-items:center;font-size:11px;color:var(--mute);overflow:hidden}
.imgpick .thumb img{max-width:100%;max-height:100%;object-fit:contain}
.preview-card{border-radius:14px;padding:14px 16px;min-height:120px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.preview-card .pname{font-family:Marcellus,Georgia,serif;font-size:22px;letter-spacing:.08em;direction:ltr}
.preview-card .pdisc{width:62px;height:62px;border-radius:50%;display:grid;place-items:center;padding:8px;flex-shrink:0}
.preview-card .pdisc img{max-width:100%;max-height:100%;object-fit:contain}
.subtabs{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
.subtabs button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 16px;cursor:pointer;font-weight:600}
.subtabs button[aria-selected="true"]{border-color:var(--gold);background:rgba(184,147,90,.12)}
.add{width:100%;border:1px dashed var(--gold);background:transparent;border-radius:16px;padding:14px;font-weight:700;color:var(--ink);cursor:pointer}
.add:hover{background:rgba(184,147,90,.08)}
.errors{background:#FBEDEA;border:1px solid #E6C9C3;color:var(--err);border-radius:14px;padding:14px 18px;margin-bottom:16px}
.errors ul{margin:8px 18px 0 0;font-size:14px}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--ink);color:var(--cream);padding:12px 22px;border-radius:999px;z-index:50;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.toast.bad{background:var(--err)}
.muted{color:var(--mute);font-size:13px}
.hist{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid var(--line);padding:12px 0}
.empty{color:var(--mute);text-align:center;padding:30px}
.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}
.kpi{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 18px;display:grid;gap:2px}
.kpi small{color:var(--sub);font-size:13px;font-weight:600}
.kpi b{font-size:30px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums;direction:ltr;text-align:right}
.kpi em{font-style:normal;font-size:12.5px;color:var(--mute)}
.kpi em.up{color:var(--ok)}.kpi em.down{color:var(--err)}
.chart{width:100%;height:170px;display:block}
.chart rect.bar{fill:var(--gold2)}.chart rect.bar.today{fill:var(--gold)}.chart rect.bar:hover{fill:var(--ink)}
.chart text{font-size:10px;fill:var(--mute);font-family:inherit}
.hbar{display:grid;grid-template-columns:110px 1fr 46px;gap:10px;align-items:center;font-size:14px;margin:6px 0}
.hbar i{display:block;height:8px;border-radius:8px;background:var(--cream);overflow:hidden}
.hbar i u{display:block;height:100%;background:var(--gold);border-radius:8px}
.hbar b{font-variant-numeric:tabular-nums;text-align:left;direction:ltr;font-size:13px}
.bk{display:flex;gap:14px;align-items:center;border:1px solid var(--line);border-radius:16px;padding:12px 14px;background:var(--paper);flex-wrap:wrap}
.bk .when{min-width:96px;text-align:center;background:var(--ink);color:var(--cream);border-radius:12px;padding:8px 10px;line-height:1.3}
.bk .when b{display:block;font-size:18px}.bk .when small{font-size:12px;opacity:.75}
.bk .who{flex:1;min-width:160px}.bk .who b{display:block}.bk .who small{color:var(--sub);font-size:13px}
.lead{border:1px solid var(--line);border-radius:16px;padding:14px;background:#fff;display:grid;gap:10px}
.lead .top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:flex-start}
.lead .top b{font-size:16px}.lead .meta{color:var(--mute);font-size:12.5px}
.lead dl{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px 14px;font-size:13.5px;margin:0}
.lead dt{color:var(--mute);font-size:12px}.lead dd{margin:0}
.lead .row{display:grid;grid-template-columns:170px 150px 1fr;gap:10px;align-items:start}
.pill{display:inline-block;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:700;background:var(--cream)}
.pill.s0{background:#FCEBD6;color:#8A5A12}.pill.s1{background:#E3EEF9;color:#24548A}.pill.s2{background:#EFE6F7;color:#5B3A86}.pill.s3{background:#E2F2E7;color:#2E6B44}.pill.s4{background:#EEE;color:#555}.pill.s5{background:#F7E3E0;color:#9A3B30}
.share{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border-bottom:1px solid var(--line);padding:8px 0;font-size:14px}
.share code{direction:ltr;text-align:left;font-size:12.5px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lead.crm .chips{display:flex;gap:6px;flex-wrap:wrap}.chip{display:inline-block;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600;background:var(--paper);border:1px solid var(--line)}.chip.warn{background:#FCEBD6;border-color:#F1D6B0;color:#8A5A12}.chip.late{background:#FBEDEA;border-color:#E6C9C3;color:var(--err)}
.lead.crm.late{border-color:#E6C9C3;box-shadow:inset 3px 0 0 var(--err)}.acts{display:flex;gap:6px;flex-wrap:wrap}
.task{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;text-align:start;border:1px solid var(--line);background:#fff;border-radius:12px;padding:10px 12px;cursor:pointer;font:inherit;width:100%}.task .tl{grid-row:span 2;font-size:12.5px;font-weight:700;color:var(--gold);align-self:center;white-space:nowrap}.task.late .tl{color:var(--err)}.task b{font-size:14px}.task .muted{font-size:12.5px}
.sheet-bg{position:fixed;inset:0;background:rgba(14,14,17,.45);z-index:60;display:flex;align-items:flex-end;justify-content:center}.sheet{background:var(--paper);width:100%;max-width:620px;max-height:92vh;overflow:auto;border-radius:22px 22px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom));display:grid;gap:12px}
@media (min-width:760px){.sheet-bg{align-items:center}.sheet{border-radius:22px}}
dl.info{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px 14px;font-size:13.5px;margin:0;background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px}dl.info dt{color:var(--mute);font-size:12px}dl.info dd{margin:0;word-break:break-word}
ol.tlog{list-style:none;margin:0;padding:0 14px 0 0;border-right:2px solid var(--line);display:grid;gap:8px}ol.tlog li{position:relative;display:grid;font-size:13.5px}ol.tlog li::before{content:"";position:absolute;right:-20px;top:6px;width:10px;height:10px;border-radius:50%;background:var(--line)}ol.tlog li.note::before{background:var(--gold)}ol.tlog li.status::before{background:#24548A}ol.tlog li.contact::before{background:var(--ok)}ol.tlog small{color:var(--mute);font-size:11.5px}
table.stmt{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:13.5px}table.stmt td{padding:7px 10px;border-top:1px solid #F1EBDD}table.stmt td:last-child{text-align:left;direction:ltr;font-weight:600}table.stmt tr.hl td{background:#FBF4E4;font-weight:700}
@media (max-width:720px){.kpis{grid-template-columns:1fr 1fr}.lead .row{grid-template-columns:1fr}.hbar{grid-template-columns:90px 1fr 40px}}

@media (max-width:720px){.grid2,.grid3{grid-template-columns:1fr}header.top{padding:10px 14px}.status{order:3;width:100%;margin:0}nav.tabs{top:96px}main{padding:18px 14px 120px}}
.tplbox{border-top:1px solid #e6dcc9;padding-top:14px;margin-top:14px}.tplbox h4{margin:0 0 4px}pre.tpl{white-space:pre-wrap;background:#faf6ee;border:1px solid #e6dcc9;border-radius:10px;padding:12px;font:inherit;margin:8px 0}</style>
</head>
<body>

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><symbol id="falcon" viewBox="0 0 232 220"><g transform="translate(4,10)" fill-rule="evenodd"><path d="M 50 40 C 80 18 132 18 158 30 C 174 38 180 52 180 72 L 180 90 C 178 100 172 106 160 110 L 146 118 C 130 126 110 126 94 122 C 74 118 58 130 48 148 C 40 164 32 186 28 200 L 10 200 L 6 184 C 4 140 10 90 26 62 C 32 52 40 46 50 40 Z M 143.5 62 A 5.5 5.5 0 1 0 132.5 62 A 5.5 5.5 0 1 0 143.5 62 Z"/><path d="M 158 68 C 188 74 214 88 224 112 L 216 106 C 202 100 180 102 162 104 L 150 116 Z"/></g></symbol></defs></svg>

<section class="login" id="loginView" hidden>
  <form id="loginForm">
    <div class="brand"><svg aria-hidden="true"><use href="#falcon" fill="#B8935A"/></svg><div><b class="lat" style="letter-spacing:.2em">SHAHEEN</b><div class="muted">لوحة التحكم</div></div></div>
    <h1>تسجيل الدخول</h1>
    <label class="f"><span>اسم المستخدم أو الإيميل <small class="muted">(للموظفين، المالك يتركه فاضي)</small></span><input id="user" type="text" inputmode="email" autocomplete="username" dir="ltr" autocapitalize="none" spellcheck="false" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:11px 12px"></label>
    <label class="f"><span>كلمة السر</span><input id="pw" type="password" autocomplete="current-password" required style="width:100%;border:1px solid var(--line);border-radius:12px;padding:11px 12px"></label>
    <div class="muted" id="loginErr" role="alert" style="color:var(--err)"></div>
    <button class="btn" type="submit">دخول</button>
    <div id="installHint" hidden style="margin-top:14px;padding:12px;border:1px dashed var(--line);border-radius:12px;font-size:13px;line-height:1.7"></div>
  </form>
</section>

<div id="app" hidden>
  <header class="top">
    <div class="brand"><svg aria-hidden="true"><use href="#falcon" fill="#B8935A"/></svg><div><b>لوحة تحكم شاهين ديزاين</b><small id="verInfo"></small></div></div>
    <span class="status" id="status" role="status">كل التعديلات محفوظة</span>
    <a class="btn ghost sm" id="siteLink" target="_blank" rel="noopener" hidden>عرض الموقع</a>
    <button class="btn sm" id="saveBtn" disabled>حفظ ونشر</button>
    <button class="btn ghost sm" id="installBtn" hidden>ثبّت التطبيق</button>
    <button class="btn ghost sm" id="pushBtn" hidden>🔔 فعّل التنبيهات</button>
    <button class="btn ghost sm" id="logoutBtn">خروج</button>
  </header>
  <nav class="tabs" role="tablist" aria-label="أقسام اللوحة" id="tabs"></nav>
  <main id="main"></main>
</div>

<script>
(function(){
  'use strict';
  // تبويبات الموقع القديم (من أعمالنا، آراء العملاء، الأسئلة، الواجهة) مخفية لأن المتجر الجديد ما يستخدمها
  var OWNER_TABS=[['home','الرئيسية'],['leads','العملاء'],['projects','المشاريع'],['store','المتجر'],['booking','المواعيد'],['services','خدمات البوت'],['messages','رسائل الواتساب'],['team','الموظفين'],['settings','الإعدادات'],['history','النسخ السابقة']];
  var TABS=OWNER_TABS, ROLE='owner', MYNAME='عبدالرحمن';
  var C=null, siteUrl='', dirty=false, tab='home', SUM=null, leadF='الكل', leadQ='', svcGroup='brand', ST={products:{}}, DEF=[], prod='', C0='', S0='';
  var $=function(id){return document.getElementById(id);};

  // ---------- tiny DOM helpers (نستخدم textContent فقط، ما نحقن HTML) ----------
  function el(tag,attrs,kids){
    var e=document.createElement(tag);
    if(attrs) for(var k in attrs){ var v=attrs[k]; if(v==null||v===false) continue;
      if(k==='text') e.textContent=v; else if(k==='class') e.className=v; else if(k.slice(0,2)==='on') e.addEventListener(k.slice(2),v); else if(k==='style') e.setAttribute('style',v); else e.setAttribute(k,v===true?'':v); }
    (kids||[]).forEach(function(c){ if(c!=null) e.appendChild(typeof c==='string'?document.createTextNode(c):c); });
    return e;
  }
  function toast(msg,bad){ var t=el('div',{class:'toast'+(bad?' bad':''),role:'status',text:msg}); document.body.appendChild(t); setTimeout(function(){t.remove();},bad?5000:2600); }
  function markDirty(){ dirty=true; $('saveBtn').disabled=false; var s=$('status'); s.textContent='فيه تعديلات ما انحفظت'; s.className='status dirty'; }
  function api(method,path,body,type){
    var o={method:method,credentials:'same-origin',headers:{}};
    if(body!==undefined){ if(type){ o.headers['content-type']=type; o.body=body; } else { o.headers['content-type']='application/json'; o.body=JSON.stringify(body); } }
    return fetch(path,o).then(function(r){ return r.json().catch(function(){return {};}).then(function(j){ j.__status=r.status; return j; }); });
  }
  var len=function(s){ return Array.from(String(s||'')).length; };
  function resolveImg(v){ if(!v) return ''; if(/^images\//.test(v)) return siteUrl? siteUrl.replace(/\/$/,'')+'/'+v : ''; return v; }

  // field: label, get(), set(v), opts {type,max,hint,ph,rows,dir}
  function field(label,get,set,o){
    o=o||{}; var input, counter=o.max? el('em') : null;
    function upd(){ if(counter){ var n=len(input.value); counter.textContent=n+' / '+o.max; counter.className=n>o.max?'over':''; } }
    if(o.type==='textarea'){ input=el('textarea',{rows:o.rows||4,placeholder:o.ph||''}); }
    else if(o.type==='select'){ input=el('select'); o.options.forEach(function(op){ input.appendChild(el('option',{value:op[0],text:op[1]})); }); }
    else { input=el('input',{type:o.type||'text',placeholder:o.ph||'',dir:o.dir||null,inputmode:o.inputmode||null}); }
    input.value=get()==null?'':get();
    input.addEventListener('input',function(){ set(input.value); upd(); markDirty(); if(o.onchange) o.onchange(); });
    if(o.type==='select') input.addEventListener('change',function(){ set(input.value); markDirty(); if(o.onchange) o.onchange(); });
    upd();
    return el('label',{class:'f'},[el('span',null,[label,counter]),input,o.hint?el('small',{text:o.hint}):null]);
  }
  function check(label,get,set,onchange){
    var i=el('input',{type:'checkbox'}); i.checked=!!get();
    i.addEventListener('change',function(){ set(i.checked); markDirty(); if(onchange) onchange(); });
    return el('label',{class:'check'},[i,label]);
  }
  function colorField(label,get,set,onchange,allowNone){
    var wrap=el('div',{class:'f'}); var row=el('div',{class:'color'});
    var c=el('input',{type:'color','aria-label':label}); var t=el('input',{type:'text','aria-label':label+' (كود)'});
    function sync(v){ t.value=v; if(/^#[0-9a-f]{6}$/i.test(v)) c.value=v; }
    sync(get()==='none'?'#F7F2E7':get()||'#B8935A');
    c.addEventListener('input',function(){ t.value=c.value.toUpperCase(); set(t.value); markDirty(); onchange&&onchange(); if(none) none.checked=false; });
    t.addEventListener('input',function(){ if(/^#[0-9a-f]{6}$/i.test(t.value)){ c.value=t.value; set(t.value.toUpperCase()); markDirty(); onchange&&onchange(); } });
    row.appendChild(c); row.appendChild(t);
    var none=null;
    if(allowNone){ none=el('input',{type:'checkbox'}); none.checked=get()==='none';
      none.addEventListener('change',function(){ set(none.checked?'none':t.value); markDirty(); onchange&&onchange(); });
      row.appendChild(el('label',{class:'check'},[none,'بدون'])); }
    wrap.appendChild(el('span',{text:label})); wrap.appendChild(row); return wrap;
  }
  function imagePicker(label,get,set,maxW,onchange){
    var thumb=el('div',{class:'thumb'}); var file=el('input',{type:'file',accept:'image/png,image/jpeg,image/webp,image/svg+xml',hidden:true});
    function show(){ thumb.textContent=''; var v=resolveImg(get()); if(v){ thumb.appendChild(el('img',{src:v,alt:''})); } else thumb.textContent=get()?'صورة من الموقع':'بدون صورة'; }
    var up=el('button',{type:'button',class:'btn ghost sm',text:'رفع صورة',onclick:function(){file.click();}});
    var rm=el('button',{type:'button',class:'btn ghost sm',text:'إزالة',onclick:function(){ set(''); show(); markDirty(); onchange&&onchange(); }});
    file.addEventListener('change',function(){ var f=file.files[0]; if(!f) return; up.disabled=true; up.textContent='جاري الرفع…';
      prepare(f,maxW).then(function(b){ return api('POST','/api/media',b.blob,b.type); }).then(function(j){
        up.disabled=false; up.textContent='رفع صورة';
        if(j.__status!==200){ toast(j.error||'ما قدرت أرفع الصورة',true); return; }
        set(j.url); show(); markDirty(); onchange&&onchange(); toast('انرفعت الصورة، احفظ عشان تظهر في الموقع');
      }).catch(function(){ up.disabled=false; up.textContent='رفع صورة'; toast('ما قدرت أرفع الصورة',true); }); file.value=''; });
    show();
    return el('div',{class:'f'},[el('span',{text:label}),el('div',{class:'imgpick'},[thumb,up,rm,file])]);
  }
  // يصغّر الصورة قبل الرفع (SVG يرتفع مثل ما هو)
  function prepare(f,maxW){
    return new Promise(function(res,rej){
      if(f.type==='image/svg+xml') return res({blob:f,type:f.type});
      var img=new Image(), url=URL.createObjectURL(f);
      img.onload=function(){ var w=img.naturalWidth,h=img.naturalHeight,s=Math.min(1,maxW/w); var cv=document.createElement('canvas'); cv.width=Math.round(w*s); cv.height=Math.round(h*s);
        cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height); URL.revokeObjectURL(url);
        var type=(f.type==='image/jpeg')?'image/jpeg':'image/png';
        cv.toBlob(function(b){ if(!b) return rej(); if(type==='image/png' && b.size>f.size && s===1 && f.type==='image/png') return res({blob:f,type:f.type}); res({blob:b,type:type}); },type,.86); };
      img.onerror=function(){ URL.revokeObjectURL(url); rej(); }; img.src=url;
    });
  }
  function move(arr,i,d){ var j=i+d; if(j<0||j>=arr.length) return; var t=arr[i]; arr[i]=arr[j]; arr[j]=t; markDirty(); render(); }
  function del(arr,i,name){ if(!confirm('تحذف '+(name||'هذا العنصر')+'؟')) return; arr.splice(i,1); markDirty(); render(); }
  function tools(arr,i,name){ return el('div',{class:'tools'},[
    el('button',{type:'button',class:'btn ghost sm',text:'فوق','aria-label':'حرّك لفوق',onclick:function(){move(arr,i,-1);},disabled:i===0||null}),
    el('button',{type:'button',class:'btn ghost sm',text:'تحت','aria-label':'حرّك لتحت',onclick:function(){move(arr,i,1);},disabled:i===arr.length-1||null}),
    el('button',{type:'button',class:'btn danger sm',text:'حذف',onclick:function(){del(arr,i,name);}})]); }
  function slug(s){ var x=String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40); return x||('item-'+Math.random().toString(36).slice(2,7)); }
  function head(title,desc,extra){ return el('div',{class:'panel-head'},[el('div',null,[el('h2',{text:title}),desc?el('p',{text:desc}):null]),extra||null]); }

  // ---------- panels ----------
  var P={};
  P.works=function(m){
    m.appendChild(head('من أعمالنا','البطاقات اللي تظهر في قسم الأعمال وشريط "اشتغلنا مع". الترتيب هنا هو ترتيبها في الموقع.'));
    C.works.forEach(function(w,i){
      var pv=el('div',{class:'preview-card'}), pname=el('div',{class:'pname'}), pdisc=el('div',{class:'pdisc'}), meta=el('div',{style:'font-size:13px;opacity:.85'});
      function paint(){ pv.style.background=w.bg; var light=lum(w.bg)>150; pv.style.color=light?'#0E0E11':'#F1ECDF'; pname.textContent=w.name||'—'; meta.textContent=[w.kind,w.did].filter(Boolean).join(' · ');
        pdisc.textContent=''; var src=resolveImg(w.logo); if(src){ pdisc.hidden=false; pdisc.style.background=w.disc==='none'?'transparent':w.disc; pdisc.appendChild(el('img',{src:src,alt:''})); } else pdisc.hidden=true; }
      pv.appendChild(el('div',null,[pname,meta])); pv.appendChild(pdisc); paint();
      m.appendChild(el('div',{class:'card'},[
        el('div',{class:'card-head'},[el('h3',{text:w.name||'عمل جديد'}),tools(C.works,i,w.name)]), pv,
        el('div',{class:'grid2'},[
          field('اسم البراند',function(){return w.name;},function(v){w.name=v;},{max:40,onchange:paint}),
          field('النشاط',function(){return w.kind;},function(v){w.kind=v;},{max:60,ph:'مثال: عبايات فاخرة',onchange:paint}),
          field('وش سوينا له',function(){return w.did;},function(v){w.did=v;},{max:120,ph:'مثال: هوية بصرية وثيم سلة',onchange:paint}),
          field('رابط الموقع أو المتجر',function(){return w.site;},function(v){w.site=v.trim();},{type:'url',dir:'ltr',ph:'https://',hint:'إذا فاضي ما يظهر زر الزيارة'})]),
        imagePicker('الشعار',function(){return w.logo;},function(v){w.logo=v;},800,paint),
        el('div',{class:'grid2'},[colorField('لون البطاقة',function(){return w.bg;},function(v){w.bg=v;},paint),colorField('لون الدائرة ورا الشعار',function(){return w.disc;},function(v){w.disc=v;},paint,true)]),
        el('div',{class:'grid2'},[check('بطاقة كبيرة (مميزة)',function(){return w.featured;},function(v){w.featured=v;}),check('يظهر في شريط "اشتغلنا مع"',function(){return w.inStrip!==false;},function(v){w.inStrip=v;})]),
        field('المعرّف',function(){return w.id;},function(v){w.id=v.trim();},{dir:'ltr',max:40,hint:'بالإنجليزي، حروف صغيرة وشرطة. يُستخدم لملف الشعار في مجلد images/brands إذا ما رفعت شعار.'})
      ]));
    });
    m.appendChild(el('button',{type:'button',class:'add',text:'+ إضافة عمل',onclick:function(){ C.works.push({id:slug('brand-'+Date.now().toString(36)),name:'',kind:'',did:'',site:'',logo:'',bg:'#1A1A1F',disc:'#F7F2E7',featured:false,inStrip:true}); markDirty(); render(); window.scrollTo(0,document.body.scrollHeight); }}));
  };
  function lum(hex){ var h=String(hex||'').replace('#',''); if(h.length!==6) return 0; return .299*parseInt(h.substr(0,2),16)+.587*parseInt(h.substr(2,2),16)+.114*parseInt(h.substr(4,2),16); }

  P.services=function(m){
    m.appendChild(head('الخدمات','أي تعديل هنا يظهر في قسم الخدمات، ونموذج الطلب، وقوائم بوت الواتساب. أقصى عدد ٩ خدمات في كل قسم.'));
    var st=el('div',{class:'subtabs',role:'tablist'});
    Object.keys(C.groups).forEach(function(g){ st.appendChild(el('button',{type:'button',role:'tab','aria-selected':String(g===svcGroup),text:C.groups[g].label+' ('+C.services.filter(function(s){return s.group===g;}).length+')',onclick:function(){svcGroup=g;render();}})); });
    m.appendChild(st);
    var G=C.groups[svcGroup];
    m.appendChild(el('div',{class:'card'},[el('h3',{text:'القسم نفسه'}),el('div',{class:'grid3'},[
      field('اسم القسم',function(){return G.label;},function(v){G.label=v;},{max:24}),
      field('عنوانه في البوت',function(){return G.title;},function(v){G.title=v;},{max:24}),
      field('وصفه في البوت',function(){return G.desc;},function(v){G.desc=v;},{max:72})])]));
    C.services.forEach(function(s,i){
      if(s.group!==svcGroup) return;
      var gets=el('label',{class:'f'},[el('span',{text:'وش يستلم العميل (كل بند في سطر)'}),(function(){ var t=el('textarea',{rows:5}); t.value=(s.gets||[]).join('\n'); t.addEventListener('input',function(){ s.gets=t.value.split('\n').map(function(x){return x.trim();}).filter(Boolean); markDirty(); }); return t; })()]);
      m.appendChild(el('div',{class:'card'},[
        el('div',{class:'card-head'},[el('h3',{text:s.name||'خدمة جديدة'}),tools(C.services,i,s.name)]),
        el('div',{class:'grid2'},[
          field('اسم الخدمة',function(){return s.name;},function(v){s.name=v;},{max:60}),
          field('الاسم بالإنجليزي',function(){return s.en;},function(v){s.en=v;},{max:40,dir:'ltr'}),
          field('سطر مختصر',function(){return s.short;},function(v){s.short=v;},{max:90}),
          field('المدة المتوقعة',function(){return s.time;},function(v){s.time=v;},{max:80,ph:'مثال: المدة المتوقعة: من أسبوعين إلى ٤ أسابيع'})]),
        field('الشرح',function(){return s.body;},function(v){s.body=v;},{type:'textarea',max:700}), gets,
        el('div',{class:'grid3'},[
          field('اسمها في نموذج الطلب',function(){return s.formLabel;},function(v){s.formLabel=v;},{max:40}),
          field('عنوانها في البوت',function(){return s.botTitle;},function(v){s.botTitle=v;},{max:24,hint:'حد واتساب ٢٤ حرف'}),
          field('وصفها في البوت',function(){return s.botDesc;},function(v){s.botDesc=v;},{max:72})]),
        el('div',{class:'grid2'},[
          field('القسم',function(){return s.group;},function(v){s.group=v;},{type:'select',options:Object.keys(C.groups).map(function(g){return [g,C.groups[g].label];}),onchange:function(){render();}}),
          field('المعرّف',function(){return s.id;},function(v){s.id=v.trim();},{dir:'ltr',max:40,hint:'بالإنجليزي. لا تغيره بعد ما تستقبل طلبات عليه.'})])
      ]));
    });
    m.appendChild(el('button',{type:'button',class:'add',text:'+ إضافة خدمة في '+G.label,onclick:function(){ C.services.push({id:slug('service-'+Date.now().toString(36)),group:svcGroup,name:'',en:'',short:'',body:'',gets:[],time:'',formLabel:'',botTitle:'',botDesc:''}); markDirty(); render(); window.scrollTo(0,document.body.scrollHeight); }}));
  };

  P.testimonials=function(m){
    m.appendChild(head('آراء العملاء','القسم يظهر في الموقع أول ما تضيف رأي. خذ موافقة العميل قبل النشر.'));
    if(!C.testimonials.length) m.appendChild(el('div',{class:'empty',text:'ما فيه آراء للحين'}));
    C.testimonials.forEach(function(t,i){
      m.appendChild(el('div',{class:'card'},[el('div',{class:'card-head'},[el('h3',{text:t.name||'رأي جديد'}),tools(C.testimonials,i,t.name)]),
        el('div',{class:'grid2'},[field('اسم العميل',function(){return t.name;},function(v){t.name=v;},{max:60}),field('صفته أو البراند',function(){return t.role;},function(v){t.role=v;},{max:80})]),
        field('نص الرأي',function(){return t.text;},function(v){t.text=v;},{type:'textarea',max:600})]));
    });
    m.appendChild(el('button',{type:'button',class:'add',text:'+ إضافة رأي',onclick:function(){ C.testimonials.push({name:'',role:'',text:''}); markDirty(); render(); }}));
  };

  P.faq=function(m){
    m.appendChild(head('الأسئلة الشائعة','السؤال المعلّم بـ"تحته بيانات البنك" يظهر تحته الحساب البنكي ووسائل الدفع.'));
    C.faq.forEach(function(f,i){
      m.appendChild(el('div',{class:'card'},[el('div',{class:'card-head'},[el('h3',{text:f.q||'سؤال جديد'}),tools(C.faq,i,f.q)]),
        field('السؤال',function(){return f.q;},function(v){f.q=v;},{max:140}),
        field('الجواب',function(){return f.a;},function(v){f.a=v;},{type:'textarea',max:900}),
        check('تحته بيانات البنك ووسائل الدفع',function(){return f.payment;},function(v){ C.faq.forEach(function(x){x.payment=false;}); f.payment=v; },function(){render();})]));
    });
    m.appendChild(el('button',{type:'button',class:'add',text:'+ إضافة سؤال',onclick:function(){ C.faq.push({q:'',a:'',payment:false}); markDirty(); render(); }}));
  };

  P.pages=function(m){
    var H=C.hero, A=C.about;
    m.appendChild(head('الواجهة وعنّي','أول شي يشوفه الزائر، وقسم التعريف فيك.'));
    m.appendChild(el('div',{class:'card'},[el('h3',{text:'الواجهة'}),el('div',{class:'grid2'},[
      field('السطر الأول',function(){return H.line1;},function(v){H.line1=v;},{max:40}),field('السطر الثاني (عريض)',function(){return H.line2;},function(v){H.line2=v;},{max:40})]),
      field('الوصف',function(){return H.lead;},function(v){H.lead=v;},{type:'textarea',rows:3,max:220})]));
    var paras=el('label',{class:'f'},[el('span',{text:'الفقرات (افصل بين كل فقرة بسطر فاضي)'}),(function(){ var t=el('textarea',{rows:8}); t.value=(A.paragraphs||[]).join('\n\n'); t.addEventListener('input',function(){ A.paragraphs=t.value.split(/\n\s*\n/).map(function(x){return x.trim();}).filter(Boolean); markDirty(); }); return t; })()]);
    m.appendChild(el('div',{class:'card'},[el('h3',{text:'عنّي'}),
      imagePicker('صورتك',function(){return A.photo;},function(v){A.photo=v;},1400),
      field('العنوان',function(){return A.heading;},function(v){A.heading=v;},{max:60}),
      field('المقدمة',function(){return A.lead;},function(v){A.lead=v;},{type:'textarea',rows:3,max:400}), paras,
      field('التوقيع',function(){return A.signature;},function(v){A.signature=v;},{max:30,dir:'ltr'})]));
  };

  // ---------- الرئيسية ----------
  var STC=['جديد','تواصلت','عرض سعر','تم الاتفاق','مؤجل','ما تم'];
  function num(n){ return Number(n||0).toLocaleString('en-US'); }
  function when(slot){ var d=new Date(slot+':00+03:00'); return { day:d.toLocaleDateString('ar-SA-u-ca-gregory',{weekday:'long',day:'numeric',month:'long',timeZone:'Asia/Riyadh'}), time:d.toLocaleTimeString('ar-SA-u-ca-gregory',{hour:'numeric',minute:'2-digit',timeZone:'Asia/Riyadh'}) }; }
  function ago(iso){ if(!iso) return ''; return new Date(iso).toLocaleString('ar-SA-u-ca-gregory',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit',timeZone:'Asia/Riyadh'}); }
  function pname(id){ var d=DEF.filter(function(x){ return x.id===id; })[0]; var o=ST.products&&ST.products[id]; return (o&&o.name)||(d&&d.name)||id; }
  function loadSum(force){ if(SUM&&!force) return Promise.resolve(SUM); return api('GET','/api/owner/summary').then(function(j){ if(j.__status===200){ SUM=j; } return SUM; }); }
  function setLead(id,patch){ patch.id=id; return api('POST','/api/owner/lead',patch).then(function(j){ if(j.__status!==200){ toast(j.error||'ما انحفظ',true); return null; } SUM.leads=SUM.leads.map(function(l){ return l.id===id?j.lead:l; }); if(patch.status==='ملغي'||patch.status==='تمت') SUM.upcoming=SUM.upcoming.filter(function(l){ return l.id!==id; }); toast('انحفظ'); return j.lead; }); }
  function waLink(l,text){ return 'https://wa.me/'+l.wa+(text?'?text='+encodeURIComponent(text):''); }
  function copy(t){ (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){ toast('انسخ الرابط'); },function(){ prompt('انسخ الرابط:',t); }); }
  function svg(tag,attrs){ var e=document.createElementNS('http://www.w3.org/2000/svg',tag); for(var k in attrs) e.setAttribute(k,attrs[k]); return e; }
  function chart(days){
    var W=720,H=170,pb=22,max=Math.max(4,Math.max.apply(null,days.map(function(d){ return d.visitors||0; }))), bw=W/days.length;
    var g=svg('svg',{viewBox:'0 0 '+W+' '+H,class:'chart',preserveAspectRatio:'none',role:'img','aria-label':'الزوار آخر ٣٠ يوم'});
    days.forEach(function(d,i){ var v=d.visitors||0, h=Math.max(v?3:1,(H-pb-8)*v/max), x=W-(i+1)*bw;
      var r=svg('rect',{x:x+bw*0.18,y:H-pb-h,width:bw*0.64,height:h,rx:3,class:'bar'+(i===days.length-1?' today':'')});
      var t=svg('title',{}); t.textContent=d.day+': '+v+' زائر · '+(d.views||0)+' مشاهدة'; r.appendChild(t); g.appendChild(r);
      if(i%5===4||i===days.length-1){ var tx=svg('text',{x:x+bw/2,y:H-6,'text-anchor':'middle'}); tx.textContent=d.day.slice(8)+'/'+d.day.slice(5,7); g.appendChild(tx); } });
    return g;
  }
  function bars(obj,label,limit){ var keys=Object.keys(obj).sort(function(a,b){ return obj[b]-obj[a]; }).slice(0,limit||6), tot=keys.reduce(function(a,k){ return a+obj[k]; },0)||1, box=el('div');
    if(!keys.length) box.appendChild(el('div',{class:'muted',text:'ما فيه بيانات للحين'}));
    keys.forEach(function(k){ var u=el('u'); u.style.width=Math.round(obj[k]*100/tot)+'%'; box.appendChild(el('div',{class:'hbar'},[el('span',{text:label?label(k):k}),el('i',null,[u]),el('b',{text:num(obj[k])})])); });
    return box; }
  var REF={instagram:'انستقرام',tiktok:'تيك توك',snapchat:'سناب',google:'قوقل',x:'إكس',whatsapp:'واتساب',facebook:'فيسبوك',linkedin:'لينكدإن'};
  P.home=function(m){
    var site=(siteUrl||location.origin).replace(/[/]$/,'');
    m.appendChild(head('أهلًا عبدالرحمن 👋',new Date().toLocaleDateString('ar-SA-u-ca-gregory',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Riyadh'}),el('div',{class:'tools'},[el('a',{class:'btn ghost sm',href:site,target:'_blank',rel:'noopener',text:'افتح الموقع'}),el('button',{type:'button',class:'btn sm',text:'انسخ رابط الحجز',onclick:function(){ copy(site+'/book'); }})])));
    var box=el('div',null,[el('div',{class:'card'},[el('div',{class:'muted',text:'جاري التحميل…'})])]); m.appendChild(box);
    loadSum().then(function(S){ box.textContent=''; if(!S){ box.appendChild(el('div',{class:'card'},[el('div',{class:'empty',text:'ما قدرت أجيب البيانات. حدّث الصفحة.'})])); return; }
      var D=S.days, t=D[D.length-1]||{}, y=D[D.length-2]||{}, w=D.slice(-7).reduce(function(a,d){ return a+(d.visitors||0); },0), pw=D.slice(-14,-7).reduce(function(a,d){ return a+(d.visitors||0); },0);
      var newL=S.leads.filter(function(l){ return !l.status||l.status==='جديد'; }).length;
      function delta(a,b){ if(!b) return el('em',{text:a?'جديد':'—'}); var p=Math.round((a-b)*100/b); return el('em',{class:p>=0?'up':'down',text:(p>=0?'↑ ':'↓ ')+Math.abs(p)+'٪ عن قبل'}); }
      box.appendChild(el('div',{class:'kpis'},[
        el('div',{class:'kpi'},[el('small',{text:'زوار اليوم'}),el('b',{text:num(t.visitors)}),delta(t.visitors||0,y.visitors||0)]),
        el('div',{class:'kpi'},[el('small',{text:'زوار آخر ٧ أيام'}),el('b',{text:num(w)}),delta(w,pw)]),
        el('div',{class:'kpi'},[el('small',{text:'حجوزات جاية'}),el('b',{text:num(S.upcoming.length)}),el('em',{text:S.upcoming[0]?('أقربها '+when(S.upcoming[0].slot).day):'ما فيه حجوزات'})]),
        el('div',{class:'kpi'},[el('small',{text:'طلبات تحتاج رد'}),el('b',{text:num(newL)}),el('em',{text:'من '+num(S.leads.length)+' طلب'})])]));
      // الحجوزات
      var bkc=el('div',{class:'card'},[el('div',{class:'card-head'},[el('h3',{text:'حجوزاتك الجاية'}),el('button',{type:'button',class:'btn ghost sm',text:'تحديث',onclick:function(){ loadSum(true).then(render); }})])]);
      if(!S.upcoming.length) bkc.appendChild(el('div',{class:'muted',text:'ما فيه حجوزات جاية. انشر رابط الحجز في البايو 👆'}));
      S.upcoming.forEach(function(l){ var w2=when(l.slot);
        bkc.appendChild(el('div',{class:'bk'},[el('div',{class:'when'},[el('small',{text:w2.day}),el('b',{text:w2.time})]),
          el('div',{class:'who'},[el('b',{text:l.name}),el('small',{text:[l.serviceName,l.pref].filter(Boolean).join(' · ')}),l.details?el('small',{text:'«'+l.details+'»',style:'display:block'}):null]),
          el('div',{class:'tools'},[el('a',{class:'btn sm',href:waLink(l,'هلا '+l.name+'، معك عبدالرحمن من شاهين ديزاين. أأكد لك موعد الاستشارة '+w2.day+' الساعة '+w2.time+'.'),target:'_blank',rel:'noopener',text:'أكّد بالواتساب'}),
            el('a',{class:'btn ghost sm',href:'tel:+'+l.wa,text:'اتصال'}),
            el('button',{type:'button',class:'btn ghost sm',text:'تمت ✓',onclick:function(){ setLead(l.id,{status:'تمت'}).then(function(){ render(); }); }}),
            el('button',{type:'button',class:'btn ghost sm',text:'إلغاء',onclick:function(){ if(confirm('تلغي موعد '+l.name+'؟ الوقت بيرجع متاح للحجز.')) setLead(l.id,{status:'ملغي'}).then(function(){ render(); }); }})])])); });
      box.appendChild(bkc);
      // الزوار
      var refs={}, paths={}, bo=0, bd=0; D.forEach(function(d){ Object.keys(d.refs||{}).forEach(function(k){ refs[k]=(refs[k]||0)+d.refs[k]; }); Object.keys(d.paths||{}).forEach(function(k){ if(k.indexOf('p:')===0){ var id=k.slice(2); paths[id]=(paths[id]||0)+d.paths[k]; } if(k==='book:open') bo+=d.paths[k]; if(k==='book:done') bd+=d.paths[k]; }); });
      box.appendChild(el('div',{class:'card'},[el('div',{class:'card-head'},[el('h3',{text:'الزوار آخر ٣٠ يوم'}),el('span',{class:'muted',text:num(D.reduce(function(a,d){ return a+(d.visitors||0); },0))+' زائر · '+num(D.reduce(function(a,d){ return a+(d.views||0); },0))+' مشاهدة'})]),chart(D)]));
      box.appendChild(el('div',{class:'grid2'},[
        el('div',{class:'card'},[el('h3',{text:'من وين يجون'}),bars(refs,function(k){ return REF[k]||k; })]),
        el('div',{class:'card'},[el('h3',{text:'أكثر المنتجات مشاهدة'}),bars(paths,pname)])]));
      box.appendChild(el('div',{class:'card'},[el('h3',{text:'الحجز'}),el('div',{class:'grid3'},[
        el('div',{class:'kpi',style:'border:0;padding:0'},[el('small',{text:'فتحوا صفحة الحجز'}),el('b',{text:num(bo)})]),
        el('div',{class:'kpi',style:'border:0;padding:0'},[el('small',{text:'كمّلوا الحجز'}),el('b',{text:num(bd)})]),
        el('div',{class:'kpi',style:'border:0;padding:0'},[el('small',{text:'نسبة التحويل'}),el('b',{text:bo?Math.round(bd*100/bo)+'٪':'—'})])])]));
      // روابط سريعة
      var sh=el('div',{class:'card'},[el('h3',{text:'روابط جاهزة للمشاركة'}),el('p',{class:'muted',text:'كل رابط يطلع بصورة معاينة خاصة لما ترسله في الواتساب أو تحطه في البايو.'})]);
      [['الصفحة الرئيسية',site+'/'],['حجز استشارة',site+'/book']].concat(DEF.filter(function(d){ return !(ST.products[d.id]&&ST.products[d.id].hidden); }).map(function(d){ return [pname(d.id),site+'/'+d.id]; })).forEach(function(r){
        sh.appendChild(el('div',{class:'share'},[el('div',null,[el('b',{text:r[0]}),el('code',{text:r[1],style:'display:block'})]),el('div',{class:'tools'},[el('button',{type:'button',class:'btn ghost sm',text:'نسخ',onclick:function(){ copy(r[1]); }}),el('a',{class:'btn ghost sm',href:'https://wa.me/?text='+encodeURIComponent(r[1]),target:'_blank',rel:'noopener',text:'واتساب'})])])); });
      box.appendChild(sh);
    });
  };

  // ---------- العملاء ----------
  P.leads=function(m){
    var staffMode=ROLE==='staff';
    var box=el('div',null,[el('div',{class:'card'},[el('div',{class:'muted',text:'جاري التحميل…'})])]);
    m.appendChild(box);
    loadSum().then(function(S){ box.textContent=''; if(!S) return; paintCRM(box,S); });
  };
  var crmScope='mine', crmQ='', crmF='open';
  function ksaNow(){ return new Date(Date.now()+3*3600e3).toISOString().slice(0,16); }
  function teamName(id){ var t=(SUM.team||[]).filter(function(x){ return x.id===id; })[0]; return t?t.name:''; }
  function isOpen(l){ var s=l.status||'جديد'; return ['تم الاتفاق','ما تم','ملغي','تمت'].indexOf(s)<0; }
  function due(l){ return l.followUp&&isOpen(l)?(l.followUp<ksaNow()?'late':(l.followUp.slice(0,10)===ksaNow().slice(0,10)?'today':'later')):''; }
  function fmtF(f){ return when(f).day.replace(/^[^،]*،\s*/,'')+' · '+when(f).time; }
  function paintCRM(box,S){
    var L=S.leads, me=S.me, today=ksaNow().slice(0,10), month=today.slice(0,7);
    var mine=function(l){ return l.assignee===me; };
    var hello=el('div',{class:'panel-head'},[el('div',null,[el('h2',{text:'أهلًا '+MYNAME+' 👋'}),el('p',{text:new Date().toLocaleDateString('ar-SA-u-ca-gregory',{weekday:'long',day:'numeric',month:'long',timeZone:'Asia/Riyadh'})+' · طلبات العملاء من الموقع والبوت'})]),
      el('div',{style:'display:flex;gap:8px;flex-wrap:wrap'},[el('button',{type:'button',class:'btn',text:'+ طلب جديد',onclick:newLeadSheet}),el('button',{type:'button',class:'btn ghost',text:'تحديث',onclick:function(){ SUM=null; render(); }})])]);
    box.appendChild(hello);
    var needReply=L.filter(function(l){ return (l.status||'جديد')==='جديد'&&(!l.assignee||mine(l)); }).length;
    var dueN=L.filter(function(l){ var d=due(l); return (d==='late'||d==='today')&&(mine(l)||!l.assignee||!staffModeX()); }).length;
    var myOpen=L.filter(function(l){ return mine(l)&&isOpen(l); }).length;
    var won=L.filter(function(l){ return l.status==='تم الاتفاق'&&String(l.updatedAt||l.at).slice(0,7)===month; });
    box.appendChild(el('div',{class:'kpis'},[
      kpi('تحتاج رد',needReply,needReply?'ابدأ فيها الحين':'ممتاز، ما فيه متأخر'),
      kpi('متابعات اليوم',dueN,'مواعيد حان وقتها'),
      kpi('مسندة لي',myOpen,'طلبات مفتوحة باسمي'),
      ROLE==='owner'?kpi('اتفاقات الشهر',won.length,num(won.reduce(function(a,l){ return a+(l.value||0); },0))+' ر.س'):kpi('اتفاقات الشهر',won.length,'صفقات تمت هالشهر')]));
    // مهام اليوم
    var tasks=L.filter(function(l){ var d=due(l); return (d==='late'||d==='today')&&(mine(l)||!l.assignee||ROLE==='owner'); }).sort(function(a,b){ return a.followUp<b.followUp?-1:1; });
    var books=(S.upcoming||[]).filter(function(l){ return l.slot&&l.slot.slice(0,10)===today; });
    if(tasks.length||books.length){
      var tl=el('div',{class:'card'},[el('h3',{text:'مهام اليوم'})]);
      books.forEach(function(l){ tl.appendChild(taskRow(l,'📅 استشارة '+when(l.slot).time,'')); });
      tasks.forEach(function(l){ tl.appendChild(taskRow(l,(due(l)==='late'?'⏰ متأخرة · ':'🔔 ')+fmtF(l.followUp),due(l)==='late'?'late':'')); });
      box.appendChild(tl);
    }
    // فلاتر
    var scopes=[['mine','لي'],['free','غير مسندة'],['all','الكل']];
    var sc=el('div',{class:'subtabs',role:'tablist'}); scopes.forEach(function(s){ sc.appendChild(el('button',{type:'button',role:'tab','aria-selected':String(crmScope===s[0]),text:s[1],onclick:function(){ crmScope=s[0]; render(); }})); });
    var fs=[['open','المفتوحة'],['جديد','جديد'],['تواصلت','تواصلت'],['عرض سعر','عرض سعر'],['مؤجل','مؤجل'],['تم الاتفاق','تم الاتفاق'],['closed','المغلقة']];
    var st=el('div',{class:'subtabs',role:'tablist',style:'margin-top:-6px'}); fs.forEach(function(s){ st.appendChild(el('button',{type:'button',role:'tab','aria-selected':String(crmF===s[0]),text:s[1],onclick:function(){ crmF=s[0]; render(); }})); });
    var q=el('input',{type:'search',placeholder:'ابحث بالاسم أو الرقم أو الخدمة',style:'width:100%;border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin-bottom:12px;background:#fff'}); q.value=crmQ;
    var list=el('div',{style:'display:grid;gap:10px'});
    function paint(){ list.textContent=''; var qq=crmQ.trim();
      var R=L.filter(function(l){ var s=l.status||'جديد';
        if(crmScope==='mine'&&!mine(l)) return false; if(crmScope==='free'&&l.assignee) return false;
        if(crmF==='open'&&!isOpen(l)) return false; if(crmF==='closed'&&isOpen(l)) return false; if(crmF!=='open'&&crmF!=='closed'&&s!==crmF) return false;
        return !qq||[l.name,l.wa,l.id,l.serviceName,l.source,l.details].join(' ').indexOf(qq)>=0; });
      R.sort(function(a,b){ var da=due(a)==='late'?0:due(a)==='today'?1:2, db=due(b)==='late'?0:due(b)==='today'?1:2; return da-db||(b.at>a.at?1:-1); });
      if(!R.length) list.appendChild(el('div',{class:'card'},[el('div',{class:'empty',text:crmScope==='mine'?'ما فيه طلبات مسندة لك هنا. شوف «غير مسندة» أو «الكل».':'ما فيه طلبات هنا'})]));
      R.forEach(function(l){ list.appendChild(leadCard(l)); }); }
    q.addEventListener('input',function(){ crmQ=q.value; paint(); });
    box.appendChild(sc); box.appendChild(st); box.appendChild(q); box.appendChild(list); paint();
  }
  function staffModeX(){ return ROLE==='staff'; }
  function kpi(t,v,sub){ return el('div',{class:'kpi'},[el('small',{text:t}),el('b',{text:num(v)}),el('em',{text:sub})]); }
  function taskRow(l,label,cls){ return el('button',{type:'button',class:'task'+(cls?' '+cls:''),onclick:function(){ leadSheet(l.id); }},[el('span',{class:'tl',text:label}),el('b',{text:l.name||'بدون اسم'}),el('span',{class:'muted',text:l.serviceName||l.source||''})]); }
  function pillFor(s){ var i=STC.indexOf(s); return el('span',{class:'pill s'+(i<0?4:i),text:s}); }
  function leadCard(l){
    var s=l.status||'جديد', d=due(l);
    var chips=el('div',{class:'chips'},[pillFor(s),l.assignee?el('span',{class:'chip',text:'👤 '+teamName(l.assignee)}):el('span',{class:'chip warn',text:'غير مسند'}),
      l.followUp&&isOpen(l)?el('span',{class:'chip'+(d==='late'?' late':''),text:'🔔 '+fmtF(l.followUp)}):null,l.slot?el('span',{class:'chip',text:'📅 '+when(l.slot).day+' '+when(l.slot).time}):null]);
    return el('div',{class:'lead crm'+(d==='late'?' late':'')},[
      el('div',{class:'top',style:'cursor:pointer',onclick:function(){ leadSheet(l.id); }},[el('div',null,[el('b',{text:l.name||'بدون اسم'}),el('div',{class:'meta',text:[l.serviceName||l.services,l.source,ago(l.at)].filter(Boolean).join(' · ')})]),el('span',{class:'muted',style:'font-size:12px',text:l.id})]),
      chips,
      el('div',{class:'acts'},[l.wa?el('a',{class:'btn sm',href:waLink(l,tmpl('hello',l)),target:'_blank',rel:'noopener',text:'واتساب',onclick:function(){ upd(l.id,{contact:'whatsapp'}); }}):null,
        l.wa?el('a',{class:'btn ghost sm',href:'tel:+'+l.wa,text:'اتصال',onclick:function(){ upd(l.id,{contact:'call'}); }}):null,
        el('button',{type:'button',class:'btn ghost sm',text:'التفاصيل',onclick:function(){ leadSheet(l.id); }}),
        !l.assignee?el('button',{type:'button',class:'btn ghost sm',text:'خذه لي',onclick:function(){ upd(l.id,{assign:SUM.me},'صار الطلب باسمك'); }}):null])]);
  }
  function tmpl(k,l){ var n=(l.name||'').split(' ')[0], svc=l.serviceName||l.services||'طلبك';
    return {hello:'هلا '+n+'، معك '+MYNAME+' من شاهين ديزاين 👋 وصلنا طلبك ('+svc+') ويسعدنا نخدمك. متى يناسبك نتكلم؟',
      follow:'هلا '+n+'، معك '+MYNAME+' من شاهين ديزاين. حبيت أطمّن وأتابع معك بخصوص طلبك '+l.id+'، عندك أي استفسار؟',
      quote:'هلا '+n+'، جهّزنا لك عرض السعر لـ'+svc+'. أرسله لك هنا وأشرح لك التفاصيل؟',
      remind:l.slot?'هلا '+n+'، تذكير بموعد استشارتك مع شاهين ديزاين '+when(l.slot).day+' الساعة '+when(l.slot).time+'. نشوفك على خير 🌿':''}[k]; }
  function upd(id,patch,msg){ patch.id=id; return api('POST','/api/owner/lead',patch).then(function(j){ if(j.__status!==200){ toast(j.error||'ما انحفظ',true); return null; } SUM.leads=SUM.leads.map(function(x){ return x.id===id?j.lead:x; }); if(msg) toast(msg); var sh=document.getElementById('leadSheet'); if(sh) leadSheet(id); render(); return j.lead; }); }
  function closeSheet(){ var s=document.getElementById('leadSheet'); if(s) s.remove(); }
  function sheet(content){ closeSheet(); var bg=el('div',{class:'sheet-bg',id:'leadSheet',onclick:function(e){ if(e.target===bg) closeSheet(); }},[el('div',{class:'sheet',role:'dialog','aria-modal':'true'},content)]); document.body.appendChild(bg); return bg; }
  function leadSheet(id){
    var l=SUM.leads.filter(function(x){ return x.id===id; })[0]; if(!l) return; var s=l.status||'جديد';
    var stSel=el('select',{'aria-label':'الحالة'}); STC.concat(l.kind==='booking'?['تمت','ملغي']:[]).forEach(function(o){ var op=el('option',{value:o,text:o}); if(o===s) op.selected=true; stSel.appendChild(op); });
    stSel.addEventListener('change',function(){ upd(id,{status:stSel.value},'تغيرت الحالة'); });
    var asSel=el('select',{'aria-label':'مسند إلى'}); asSel.appendChild(el('option',{value:'',text:'غير مسند'})); (SUM.team||[]).forEach(function(t){ var op=el('option',{value:t.id,text:t.name+(t.id===SUM.me?' (أنا)':'')}); if(t.id===l.assignee) op.selected=true; asSel.appendChild(op); });
    asSel.addEventListener('change',function(){ upd(id,{assign:asSel.value},'تم الإسناد'); });
    var fu=el('input',{type:'datetime-local',value:l.followUp||''}); fu.addEventListener('change',function(){ upd(id,{followUp:fu.value},'انحفظ موعد المتابعة'); });
    function plus(h,label){ return el('button',{type:'button',class:'btn ghost sm',text:label,onclick:function(){ var t=new Date(Date.now()+3*3600e3+h*3600e3); if(h>=24){ t.setUTCHours(10,0,0,0); } upd(id,{followUp:t.toISOString().slice(0,16)},'انحفظ موعد المتابعة'); }}); }
    var note=el('textarea',{rows:2,placeholder:'اكتب ملاحظة عن المكالمة أو اللي اتفقتوا عليه'});
    var info=[['الجوال',l.wa?'+'+l.wa:''],['الخدمة',l.serviceName||l.services||l.reason],['المصدر',l.source],['الجهة',l.org],['الموعد',l.slot?(when(l.slot).day+' '+when(l.slot).time):l.timeline],['الميزانية',l.budget],['طريقة التواصل',l.pref],['التفاصيل',l.details],['ملاحظة قديمة',l.note]].filter(function(x){ return x[1]; });
    var log=(l.log||[]).slice().reverse();
    var waBtns=el('div',{class:'acts'},l.wa?[['hello','ترحيب'],['follow','متابعة'],['quote','عرض سعر']].concat(l.slot?[['remind','تذكير بالموعد']]:[]).map(function(t){ return el('a',{class:'btn ghost sm',href:waLink(l,tmpl(t[0],l)),target:'_blank',rel:'noopener',text:'واتساب: '+t[1],onclick:function(){ upd(id,{contact:'whatsapp'}); }}); }):[el('span',{class:'muted',text:'ما فيه رقم جوال'})]);
    sheet([
      el('div',{class:'top',style:'display:flex;justify-content:space-between;gap:10px;align-items:flex-start'},[el('div',null,[el('h2',{style:'margin:0;font-size:20px',text:l.name||'بدون اسم'}),el('div',{class:'meta',text:l.id+' · '+ago(l.at)})]),el('button',{type:'button',class:'btn ghost sm',text:'إغلاق',onclick:closeSheet})]),
      el('div',{class:'acts'},[l.wa?el('a',{class:'btn',href:'tel:+'+l.wa,text:'📞 اتصال',onclick:function(){ upd(id,{contact:'call'}); }}):null,l.wa?el('button',{type:'button',class:'btn ghost',text:'ما رد',onclick:function(){ upd(id,{contact:'noanswer'},'انسجلت المحاولة'); }}):null,
        l.wa?el('button',{type:'button',class:'btn ghost',text:'نسخ الرقم',onclick:function(){ copy('+'+l.wa); }}):null]),
      waBtns,
      info.length?el('dl',{class:'info'},[].concat.apply([],info.map(function(x){ return [el('div',null,[el('dt',{text:x[0]}),el('dd',{text:x[1]})])]; }))):null,
      el('div',{class:'grid2'},[el('label',{class:'f'},[el('span',{text:'الحالة'}),stSel]),el('label',{class:'f'},[el('span',{text:'مسند إلى'}),asSel])]),
      el('label',{class:'f'},[el('span',{text:'موعد المتابعة'}),fu]),
      el('div',{class:'acts'},[plus(1,'بعد ساعة'),plus(3,'بعد ٣ ساعات'),plus(24,'بكرة ١٠ص'),plus(72,'بعد ٣ أيام'),l.followUp?el('button',{type:'button',class:'btn ghost sm',text:'شيل الموعد',onclick:function(){ upd(id,{followUp:''}); }}):null]),
      ROLE==='owner'&&s==='تم الاتفاق'?el('button',{type:'button',class:'btn',text:'حوّله لمشروع',onclick:function(){ loadPrj().then(function(){ projectForm(null,{title:l.serviceName||'',client:l.name||'',clientWa:l.wa||'',partner:l.referredBy&&l.referredBy!=='owner'?l.referredBy:(l.assignee&&l.assignee!=='owner'?l.assignee:''),referred:!!(l.referredBy&&l.referredBy!=='owner'),value:l.value||'',leadId:l.id,start:new Date(Date.now()+3*3600e3).toISOString().slice(0,10)}); }); }}):null,
      ROLE==='owner'?(function(){ var v=el('input',{type:'text',inputmode:'numeric',dir:'ltr',placeholder:'قيمة الصفقة',value:l.value?String(l.value):''}); v.addEventListener('change',function(){ upd(id,{value:v.value},'انحفظت القيمة'); }); return el('label',{class:'f'},[el('span',{text:'قيمة الصفقة (ر.س)'}),v]); })():null,
      el('label',{class:'f'},[el('span',{text:'ملاحظة جديدة'}),note]),
      el('div',null,[el('button',{type:'button',class:'btn sm',text:'أضف الملاحظة',onclick:function(){ if(!note.value.trim()) return; upd(id,{addNote:note.value},'انحفظت الملاحظة'); }})]),
      el('div',null,[el('h3',{style:'margin:6px 0',text:'سجل الطلب'}),log.length?el('ol',{class:'tlog'},log.map(function(x){ return el('li',{class:x.type},[el('span',{text:x.text}),el('small',{text:x.by+' · '+ago(x.at)})]); })):el('div',{class:'muted',text:'ما فيه حركات لسا'})])
    ]);
  }
  function newLeadSheet(){
    var f={}; function inp(k,label,o){ o=o||{}; var i=el(o.tag||'input',{type:o.type||'text',dir:o.dir||'auto',placeholder:o.ph||'',rows:o.rows||null,inputmode:o.im||null}); f[k]=i; return el('label',{class:'f'},[el('span',{text:label}),i]); }
    var src=el('select',null,['اتصال','واتساب','انستقرام','تيك توك','زيارة','إحالة','أخرى'].map(function(x){ return el('option',{value:x,text:x}); }));
    var ref=el('input',{type:'checkbox'});
    sheet([el('div',{style:'display:flex;justify-content:space-between'},[el('h2',{style:'margin:0;font-size:20px',text:'طلب جديد'}),el('button',{type:'button',class:'btn ghost sm',text:'إغلاق',onclick:closeSheet})]),
      el('div',{class:'grid2'},[inp('name','اسم العميل'),inp('wa','الجوال',{dir:'ltr',ph:'05xxxxxxxx',im:'tel'})]),
      inp('service','الخدمة المطلوبة',{ph:'مثلًا: تطبيق حجوزات لصالون'}),
      el('div',{class:'grid2'},[el('label',{class:'f'},[el('span',{text:'المصدر'}),src]),inp('budget','الميزانية (اختياري)')]),
      inp('details','تفاصيل',{tag:'textarea',rows:3}),
      el('label',{class:'check'},[ref,el('span',{text:'العميل من إحالتي (تنحسب لي نسبته حسب الاتفاقية)'})]),
      el('button',{type:'button',class:'btn',text:'إضافة الطلب',onclick:function(){
        api('POST','/api/owner/lead/new',{name:f.name.value,wa:f.wa.value,service:f.service.value,budget:f.budget.value,details:f.details.value,source:src.value,referred:ref.checked}).then(function(j){
          if(j.__status!==200){ toast(j.error||'ما انحفظ',true); return; } SUM.leads.unshift(j.lead); closeSheet(); crmScope='mine'; crmF='open'; render(); toast('انضاف الطلب '+j.lead.id); }); }})]);
  }

  // ---------- المشاريع ----------
  var PRJ=null, prjPartner='all', prjF='all';
  function loadPrj(force){ if(PRJ&&!force) return Promise.resolve(PRJ); return api('GET','/api/owner/projects').then(function(j){ if(j.__status===200){ delete j.__status; PRJ=j; } return PRJ; }); }
  function sar(n){ return num(Math.round((n||0)*100)/100)+' ر.س'; }
  function pTeam(id){ var t=((PRJ&&PRJ.team)||[]).filter(function(x){ return x.id===id; })[0]; return t?t.name:''; }
  var PSC={'قيد التنفيذ':'s1','تم التسليم':'s3','متوقف':'s0','ملغي':'s4'};
  P.projects=function(m){
    var owner=ROLE==='owner';
    m.appendChild(head(owner?'المشاريع':'مشاريعي',owner?'كل مشروع: العميل والقيمة والتكاليف والضرائب ونسبة الشريك، والمحصّل من العميل والمصروف للشريك. النسبة تنحسب من الصافي حسب الاتفاقية.':'المشاريع اللي شاركتي فيها ونسبتك من كل مشروع. المستحق ينحسب من المبلغ المحصّل فعلًا بعد خصم التكاليف والضرائب.',owner?el('button',{type:'button',class:'btn',text:'+ مشروع جديد',onclick:function(){ projectForm(); }}):null));
    var box=el('div',null,[el('div',{class:'card'},[el('div',{class:'muted',text:'جاري التحميل…'})])]); m.appendChild(box);
    loadPrj().then(function(D){ box.textContent=''; if(!D) return;
      var L=D.projects, sum=function(a,f){ return a.reduce(function(t,x){ return t+f(x); },0); };
      var vis=L.filter(function(x){ return (prjPartner==='all'||x.partner===prjPartner)&&(prjF==='all'||x.status===prjF); });
      if(owner) box.appendChild(el('div',{class:'kpis'},[kpi('قيد التنفيذ',L.filter(function(x){ return x.status==='قيد التنفيذ'; }).length,'مشروع'),kpi('تم التسليم',L.filter(function(x){ return x.status==='تم التسليم'; }).length,'مشروع'),
        el('div',{class:'kpi'},[el('small',{text:'المحصّل'}),el('b',{text:num(sum(vis,function(x){ return x.calc.collected; }))}),el('em',{text:'ر.س من العملاء'})]),
        el('div',{class:'kpi'},[el('small',{text:'باقي للشركاء'}),el('b',{text:num(sum(vis,function(x){ return Math.max(0,x.calc.remaining); }))}),el('em',{text:'ر.س مستحقة ما انصرفت'})])]));
      else box.appendChild(el('div',{class:'kpis'},[kpi('مشاريعي',L.length,L.filter(function(x){ return x.referred; }).length+' منها من إحالتي'),kpi('تم التسليم',L.filter(function(x){ return x.status==='تم التسليم'; }).length,'مشروع'),
        el('div',{class:'kpi'},[el('small',{text:'مستحقاتي'}),el('b',{text:num(sum(L,function(x){ return x.calc.due; }))}),el('em',{text:'ر.س من المحصّل'})]),
        el('div',{class:'kpi'},[el('small',{text:'الباقي لي'}),el('b',{text:num(sum(L,function(x){ return Math.max(0,x.calc.remaining); }))}),el('em',{text:'ر.س ما انصرفت'})])]));
      if(owner){ var pt=el('div',{class:'subtabs',role:'tablist'}); [['all','كل الشركاء']].concat(D.team.filter(function(t){ return t.id!=='owner'; }).map(function(t){ return [t.id,t.name]; })).concat([['','بدون شريك']]).forEach(function(o){ pt.appendChild(el('button',{type:'button',role:'tab','aria-selected':String(prjPartner===o[0]),text:o[1],onclick:function(){ prjPartner=o[0]; render(); }})); }); box.appendChild(pt); }
      var sf=el('div',{class:'subtabs',role:'tablist'}); [['all','الكل']].concat(D.statuses.map(function(s){ return [s,s]; })).forEach(function(o){ sf.appendChild(el('button',{type:'button',role:'tab','aria-selected':String(prjF===o[0]),text:o[1],onclick:function(){ prjF=o[0]; render(); }})); }); box.appendChild(sf);
      var list=el('div',{style:'display:grid;gap:10px'}); box.appendChild(list);
      if(!vis.length) list.appendChild(el('div',{class:'card'},[el('div',{class:'empty',text:owner?'ما فيه مشاريع هنا. أضف مشروع جديد، أو حوّل طلب «تم الاتفاق» لمشروع من صفحته.':'ما فيه مشاريع مسجلة باسمك لسا.'})]));
      vis.forEach(function(x){ var c=x.calc;
        list.appendChild(el('div',{class:'lead crm',style:'cursor:pointer',onclick:function(){ projectSheet(x.id); }},[
          el('div',{class:'top'},[el('div',null,[el('b',{text:x.title}),el('div',{class:'meta',text:[x.client,x.type,x.start?('بدأ '+x.start):''].filter(Boolean).join(' · ')})]),el('span',{class:'muted',style:'font-size:12px',text:x.id})]),
          el('div',{class:'chips'},[el('span',{class:'pill '+(PSC[x.status]||'s4'),text:x.status}),x.partner?el('span',{class:'chip',text:'👤 '+pTeam(x.partner)+' · '+x.pct+'٪'}):null,x.referred?el('span',{class:'chip',text:'إحالة'}):null].concat((x.roles||[]).map(function(r){ return el('span',{class:'chip',text:r}); }))),
          el('div',{class:'meta',style:'font-size:13px;color:var(--sub)',text:owner?('القيمة '+sar(x.value)+' · المحصّل '+sar(c.collected)+(x.partner?' · باقي للشريك '+sar(c.remaining):'')):('مستحقك '+sar(c.due)+' · انصرف '+sar(c.paid)+' · الباقي '+sar(c.remaining)+(c.collected<x.value?' · المتوقع بعد اكتمال التحصيل '+sar(c.expected):''))})]));
      });
    });
  };
  function projectSheet(id){
    var x=PRJ.projects.filter(function(y){ return y.id===id; })[0]; if(!x) return; var c=x.calc, owner=ROLE==='owner';
    function moneyList(kind,title){ var arr=x[kind]||[]; return el('div',null,[el('h3',{style:'margin:4px 0',text:title}),arr.length?el('div',{style:'display:grid;gap:4px'},arr.map(function(r,i){ return el('div',{style:'display:flex;justify-content:space-between;gap:8px;font-size:13.5px;background:#fff;border:1px solid var(--line);border-radius:10px;padding:7px 10px'},[el('span',{text:r.date+(r.note?' · '+r.note:'')}),el('span',null,[el('b',{text:sar(r.amount)}),owner?el('button',{type:'button',class:'btn ghost sm',style:'margin-inline-start:8px;min-height:26px;padding:2px 8px',text:'حذف',onclick:function(){ if(confirm('حذف هذا القيد؟')) pAct('/api/owner/project/money',{id:id,kind:kind==='payouts'?'payout':'collect',remove:i}); }}):null])]); })):el('div',{class:'muted',style:'font-size:13px',text:'ما فيه'}),
      owner?(function(){ var a=el('input',{type:'text',inputmode:'decimal',placeholder:'المبلغ',dir:'ltr',style:'width:110px'}), d=el('input',{type:'date',value:new Date(Date.now()+3*3600e3).toISOString().slice(0,10)}), n=el('input',{type:'text',placeholder:'ملاحظة'});
        [a,d,n].forEach(function(i){ i.style.cssText+=';border:1px solid var(--line);border-radius:10px;padding:7px 9px;background:#fff;min-width:0'; });
        return el('div',{style:'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px'},[a,d,n,el('button',{type:'button',class:'btn sm',text:'إضافة',onclick:function(){ pAct('/api/owner/project/money',{id:id,kind:kind==='payouts'?'payout':'collect',amount:a.value,date:d.value,note:n.value}); }})]); })():null]); }
    var rows=[['المحصّل من العميل',c.collected],['− التكاليف التشغيلية',x.costs],['− الضرائب',x.taxes],['= الصافي',c.net],['× النسبة',null,x.pct+'٪'],['= المستحق للشريك',c.due],['− المصروف',c.paid],['= الباقي',c.remaining]];
    var stmt=x.partner?el('div',null,[el('h3',{style:'margin:4px 0',text:owner?'كشف الشريك: '+pTeam(x.partner):'كشف مستحقاتك'}),el('table',{class:'stmt'},rows.map(function(r,i){ return el('tr',{class:[3,5,7].indexOf(i)>=0?'hl':''},[el('td',{text:r[0]}),el('td',{text:r[2]||sar(r[1])})]); })),
      c.collected<x.value?el('div',{class:'muted',style:'font-size:12.5px;margin-top:4px',text:'باقي تحصيل '+sar(x.value-c.collected)+' من العميل. المتوقع لما يكتمل: '+sar(c.expected)+'.'}):null]):null;
    var note=el('textarea',{rows:2,placeholder:owner?'ملاحظة على المشروع':'اكتبي تحديث عن شغلك في المشروع'});
    sheet([el('div',{style:'display:flex;justify-content:space-between;gap:10px;align-items:flex-start'},[el('div',null,[el('h2',{style:'margin:0;font-size:20px',text:x.title}),el('div',{class:'meta',text:x.id+' · '+x.client+(x.annex?' · ملحق '+x.annex:'')})]),el('div',{class:'acts'},[owner?el('button',{type:'button',class:'btn ghost sm',text:'تعديل',onclick:function(){ projectForm(x); }}):null,el('button',{type:'button',class:'btn ghost sm',text:'إغلاق',onclick:closeSheet})])]),
      el('dl',{class:'info'},[['الحالة',x.status],['النوع',x.type],['الشريك',x.partner?pTeam(x.partner):'بدون'],['الدور',(x.roles||[]).join('، ')],['إحالة',x.referred?'نعم':'لا'],['البداية',x.start],['التسليم',x.delivered],['قيمة المشروع',sar(x.value)],['ملاحظات',x.notes]].filter(function(r){ return r[1]; }).map(function(r){ return el('div',null,[el('dt',{text:r[0]}),el('dd',{text:r[1]})]); })),
      stmt, owner?moneyList('collections','التحصيلات من العميل'):null, x.partner?moneyList('payouts',owner?'المصروف للشريك':'اللي انصرف لك'):null,
      el('label',{class:'f'},[el('span',{text:'ملاحظة / تحديث'}),note]),el('div',null,[el('button',{type:'button',class:'btn sm',text:'أضف',onclick:function(){ if(note.value.trim()) pAct('/api/owner/project/note',{id:id,text:note.value}); }})]),
      el('div',null,[el('h3',{style:'margin:6px 0',text:'سجل المشروع'}),el('ol',{class:'tlog'},(x.log||[]).slice().reverse().map(function(r){ return el('li',{class:'note'},[el('span',{text:r.text}),el('small',{text:r.by+' · '+ago(r.at)})]); }))]),
      owner?el('div',null,[el('button',{type:'button',class:'btn danger sm',text:'حذف المشروع',onclick:function(){ if(confirm('حذف المشروع نهائيًا؟')) api('POST','/api/owner/project/delete',{id:id}).then(function(j){ if(j.__status!==200) return toast(j.error,true); PRJ=null; closeSheet(); render(); toast('انحذف'); }); }})]):null]);
  }
  function pAct(path,body,msg){ return api('POST',path,body).then(function(j){ if(j.__status!==200){ toast(j.error||'ما انحفظ',true); return; } PRJ.projects=PRJ.projects.map(function(y){ return y.id===j.project.id?j.project:y; }); toast(msg||'انحفظ'); projectSheet(j.project.id); render(); }); }
  function projectForm(x,pre){
    x=x||{}; pre=pre||{}; var v=function(k,d){ return x[k]!=null&&x[k]!==''?x[k]:(pre[k]!=null?pre[k]:(d||'')); };
    function inp(k,label,o){ o=o||{}; var i=el('input',{type:o.type||'text',dir:o.dir||'auto',inputmode:o.im||null,placeholder:o.ph||''}); i.value=v(k); i.dataset.k=k; return el('label',{class:'f'},[el('span',{text:label}),i]); }
    function sel(k,label,opts){ var s=el('select'); opts.forEach(function(o){ var op=el('option',{value:o[0],text:o[1]}); if(String(v(k))===String(o[0])) op.selected=true; s.appendChild(op); }); s.dataset.k=k; return el('label',{class:'f'},[el('span',{text:label}),s]); }
    var D=PRJ||{team:[],statuses:['قيد التنفيذ'],types:['أخرى'],roles:[]};
    var roles=el('div',{class:'acts'},D.roles.map(function(r){ var c=el('input',{type:'checkbox',value:r}); if((v('roles')||[]).indexOf(r)>=0) c.checked=true; return el('label',{class:'check'},[c,el('span',{text:r})]); }));
    var ref=el('input',{type:'checkbox'}); ref.checked=!!v('referred');
    var form=el('div',{style:'display:grid;gap:10px'},[
      el('div',{class:'grid2'},[inp('title','اسم المشروع',{ph:'مثلًا: متجر عبايات على سلة'}),inp('client','العميل')]),
      el('div',{class:'grid2'},[sel('type','النوع',D.types.map(function(t){ return [t,t]; })),sel('status','الحالة',D.statuses.map(function(t){ return [t,t]; }))]),
      el('div',{class:'grid2'},[sel('partner','الشريك',[['','بدون شريك']].concat(D.team.filter(function(t){ return t.id!=='owner'; }).map(function(t){ return [t.id,t.name]; }))),inp('pct','النسبة من الصافي (٪)',{im:'decimal',dir:'ltr'})]),
      el('div',null,[el('span',{class:'muted',style:'font-size:13px;font-weight:600',text:'دور الشريك'}),roles]),
      el('label',{class:'check'},[ref,el('span',{text:'العميل من إحالة الشريك'})]),
      el('div',{class:'grid3'},[inp('value','قيمة المشروع شاملة الضريبة',{im:'decimal',dir:'ltr'}),inp('costs','التكاليف التشغيلية',{im:'decimal',dir:'ltr'}),inp('taxes','الضرائب',{im:'decimal',dir:'ltr'})]),
      el('div',{class:'grid3'},[inp('start','تاريخ البداية',{type:'date'}),inp('delivered','تاريخ التسليم',{type:'date'}),inp('annex','رقم الملحق',{dir:'ltr'})]),
      inp('notes','ملاحظات')]);
    sheet([el('div',{style:'display:flex;justify-content:space-between'},[el('h2',{style:'margin:0;font-size:20px',text:x.id?'تعديل المشروع':'مشروع جديد'}),el('button',{type:'button',class:'btn ghost sm',text:'إغلاق',onclick:closeSheet})]),form,
      el('button',{type:'button',class:'btn',text:'حفظ',onclick:function(){ var b={id:x.id,leadId:v('leadId'),clientWa:v('clientWa')}; form.querySelectorAll('[data-k]').forEach(function(i){ b[i.dataset.k]=i.value; }); b.roles=[].slice.call(roles.querySelectorAll('input:checked')).map(function(c){ return c.value; }); b.referred=ref.checked;
        api('POST','/api/owner/project',b).then(function(j){ if(j.__status!==200) return toast(j.error||'ما انحفظ',true); PRJ=null; loadPrj(true).then(function(){ tab='projects'; render(); projectSheet(j.project.id); toast('انحفظ المشروع'); }); }); }})]);
  }
  // ---------- المتجر ----------
  var DN=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  function fmt(n){ return Number(n||0).toLocaleString('en-US'); }
  function txt(obj,k,label,def,o){ o=o||{}; o.ph=o.ph||def||''; return field(label,function(){ return obj[k]||''; },function(v){ if(String(v).trim()) obj[k]=v; else delete obj[k]; },o); }
  function lines(obj,k,label,def,max){ return field(label,function(){ return (obj[k]||[]).join(String.fromCharCode(10)); },function(v){ var a=v.split(String.fromCharCode(10)).map(function(x){ return x.trim(); }).filter(Boolean); if(a.length) obj[k]=a; else delete obj[k]; },{type:'textarea',rows:5,ph:(def||[]).join(String.fromCharCode(10)),hint:'كل سطر ميزة. الخانة الفاضية تاخذ الأصل.'+(max?' حدها '+max+' أسطر.':'')}); }
  P.store=function(m){
    m.appendChild(head('المتجر','عدّل أسماء المنتجات ونصوصها وباقاتها وأسعارها. الخانة الفاضية تاخذ النص الأصلي اللي تشوفه باهت داخلها.'));
    if(!DEF.length){ m.appendChild(el('div',{class:'card'},[el('div',{class:'empty',text:'ما قدرت أقرأ منتجات الموقع.'})])); return; }
    if(!prod) prod=DEF[0].id;
    var st=el('div',{class:'subtabs',role:'tablist'});
    DEF.forEach(function(d){ var x=ST.products[d.id]||{}; st.appendChild(el('button',{type:'button',role:'tab','aria-selected':String(d.id===prod),text:(x.name||d.name)+(x.hidden?' · مخفي':'')+(Object.keys(x).length&&!x.hidden?' •':''),onclick:function(){ prod=d.id; render(); }})); });
    m.appendChild(st);
    var d=DEF.filter(function(z){ return z.id===prod; })[0]; var x=ST.products[prod]||(ST.products[prod]={});
    var link=siteUrl?el('a',{class:'btn ghost sm',href:siteUrl.replace(/[/]$/,'')+'/'+d.id,target:'_blank',rel:'noopener',text:'شوفه في الموقع'}):null;
    m.appendChild(el('div',{class:'card'},[el('div',{class:'card-head'},[el('h3',{text:x.full||d.full}),el('div',{class:'tools'},[link,el('button',{type:'button',class:'btn ghost sm',text:'رجّع الأصل',onclick:function(){ if(!confirm('ترجع كل نصوص وأسعار هذا المنتج للأصل؟')) return; delete ST.products[prod]; markDirty(); render(); }})])]),
      check('إخفاء المنتج من الموقع (ما ينحذف، تقدر ترجعه)',function(){ return !!x.hidden; },function(v){ if(v) x.hidden=true; else delete x.hidden; },render)]));
    m.appendChild(el('div',{class:'card'},[el('h3',{text:'النصوص'}),el('div',{class:'grid2'},[
      txt(x,'name','الاسم المختصر (في القوائم)',d.name,{max:30}),txt(x,'full','الاسم الكامل',d.full,{max:60}),
      txt(x,'tag','الشارة على البطاقة',d.tag,{max:30}),txt(x,'hook','الجملة الجذابة',d.hook,{max:80}),
      txt(x,'days','مدة التنفيذ',d.days,{max:30}),txt(x,'support','الدعم بعد التسليم',d.support,{max:30})]),
      txt(x,'short','الوصف القصير (تحت الاسم)',d.short,{max:120}),txt(x,'desc','الوصف الكامل (صفحة المنتج وقوقل)',d.desc,{type:'textarea',rows:3,max:400}),
      lines(x,'inc','وش يشمل',d.inc,12)]));
    var tl=x.tiers||[];
    d.tiers.forEach(function(t,i){
      var y=tl[i]||{};
      function keep(){ x.tiers=x.tiers||[]; x.tiers[i]=y; }
      var price=field('السعر (ر.س)',function(){ return y.price==null?'':String(y.price); },function(v){ var n=parseInt(String(v).replace(/[^0-9]/g,''),10); keep(); if(n>0&&n!==t.price) y.price=n; else delete y.price; },{dir:'ltr',inputmode:'numeric',ph:fmt(t.price)});
      function tf(k,label,max,o){ o=o||{}; o.max=max; o.ph=t[k]||''; return field(label,function(){ return y[k]||''; },function(v){ keep(); if(String(v).trim()) y[k]=v; else delete y[k]; },o); }
      var items=field('المزايا',function(){ return (y.items||[]).join(String.fromCharCode(10)); },function(v){ keep(); var a=v.split(String.fromCharCode(10)).map(function(z){ return z.trim(); }).filter(Boolean); if(a.length) y.items=a; else delete y.items; },{type:'textarea',rows:4,ph:(t.items||[]).join(String.fromCharCode(10)),hint:'كل سطر ميزة، حدها ١٠.'});
      m.appendChild(el('div',{class:'card'},[el('h3',{text:'الباقة '+(i+1)+': '+(y.name||t.name)+(i===1?' (الموصى فيها)':'')}),
        el('div',{class:'grid3'},[tf('name','اسم الباقة',24),price,tf('days','المدة',30)]),el('div',{class:'grid2'},[tf('sub','وصف قصير',120),tf('support','الدعم',30)]),items]));
    });
  };

  P.booking=function(m){
    var b=ST.book||(ST.book={});
    m.appendChild(head('المواعيد','متى يقدر العملاء يحجزون الاستشارة المجانية. الحجوزات نفسها تطلع في صفحة الطلبات.'));
    var days=el('div',{class:'tools'});
    DN.forEach(function(n,i){ days.appendChild(check(n,function(){ return (b.days||[0,1,2,3,4]).indexOf(i)>=0; },function(v){ var a=(b.days||[0,1,2,3,4]).filter(function(z){ return z!==i; }); if(v) a.push(i); a.sort(); b.days=a; })); });
    var hrs=[]; for(var h=0;h<=24;h++) hrs.push([String(h),(h%12||12)+':00 '+(h<12||h===24?'ص':'م')]);
    m.appendChild(el('div',{class:'card'},[el('h3',{text:'أيام الحجز'}),days,el('div',{class:'grid2'},[
      field('من الساعة',function(){ return String(b.from==null?17:b.from); },function(v){ b.from=parseInt(v,10); },{type:'select',options:hrs.slice(0,24)}),
      field('إلى الساعة',function(){ return String(b.to==null?22:b.to); },function(v){ b.to=parseInt(v,10); },{type:'select',options:hrs.slice(1)})]),
      el('p',{class:'muted',text:'المكالمة ١٥ دقيقة، والمواعيد كل نص ساعة، بتوقيت السعودية.'})]));
    var list=el('div',{class:'tools'}), inp=el('input',{type:'date','aria-label':'اليوم'});
    function paint(){ list.textContent=''; (b.closed||[]).slice().sort().forEach(function(d){ list.appendChild(el('button',{type:'button',class:'btn ghost sm',text:d+'  ×',title:'افتح هذا اليوم',onclick:function(){ b.closed=b.closed.filter(function(z){ return z!==d; }); markDirty(); paint(); }})); }); if(!(b.closed||[]).length) list.appendChild(el('span',{class:'muted',text:'ما فيه أيام مقفلة'})); }
    paint();
    m.appendChild(el('div',{class:'card'},[el('h3',{text:'أيام تقفلها (سفر، دوام، مشغول)'}),el('div',{class:'tools'},[inp,el('button',{type:'button',class:'btn sm',text:'أقفل هذا اليوم',onclick:function(){ var v=inp.value; if(!v) return; b.closed=(b.closed||[]).filter(function(z){ return z!==v; }).concat([v]); markDirty(); paint(); }})]),list]));
  };


  // ---------- رسائل الواتساب ----------
  var MSG_DEF={
    welcome:'هلا فيك في شاهين ديزاين يا {الاسم} 🦅\nأنا مساعد {المالك}، أرتب معك طلبك في أقل من دقيقة وأوصله له.\n\nوش يناسبك؟',
    welcomeAgain:'هلا فيك من جديد يا {الاسم} 🦅\nوش تحتاج اليوم؟',
    received:'هلا {الاسم}، استلمنا طلبك رقم {رقم_الطلب} ✅\n\n{الملخص}\n\nكيف تحب {المالك} يتواصل معك؟',
    done:'تم يا {الاسم}. طلبك رقم {رقم_الطلب} وصل إلى {المالك} ✅',
    human:'أبشر يا {الاسم}. حولتك إلى {المالك}، ورقم محادثتك {رقم_الطلب}.',
    online:'{المالك} متواجد الحين وبيرد عليك قريب.',
    offline:'{المالك} يرد في أوقات العمل (الأحد إلى الخميس، مساءً)، وطلبك محفوظ عندنا.'
  };
  var MSG_LIST=[
    ['welcome','الترحيب','أول رسالة يشوفها العميل، وتحتها قائمة الخدمات.'],
    ['welcomeAgain','الترحيب بعميل راجع','لما يرجع عميل كلمنا قبل.'],
    ['received','استلام الطلب','بعد ما يأكد طلبه، ويسأله كيف يتواصل معه. {الملخص} = ملخص الطلب.'],
    ['done','بعد تأكيد الطلب','آخر رسالة بعد ما يختار طريقة التواصل.'],
    ['human','التحويل لك','لما العميل يطلب يكلمك مباشرة.'],
    ['online','وقت الدوام','تنضاف تحت الرسالة إذا أنت في وقت الدوام.'],
    ['offline','خارج الدوام','تنضاف تحت الرسالة إذا أنت خارج الدوام.']
  ];
  var TPL_TEXT=[
    ['bookingConfirm','تأكيد موعد الاستشارة','booking_confirmation','يوصل للعميل أول ما يحجز من الموقع.','هلا {{1}} 👋\nتم تأكيد موعد استشارتك المجانية مع شاهين ديزاين.\n\n📅 الموعد: {{2}}\n\nبنتواصل معك في الوقت المحدد. إذا تبغى تغيّر الموعد، رد على هذي الرسالة.'],
    ['bookingReminder','تذكير بالموعد','booking_reminder','يوصل صباح يوم الموعد (٩ الصبح).','صباح الخير {{1}} ☀️\nنذكرك بموعد استشارتك مع شاهين ديزاين اليوم.\n\n📅 الموعد: {{2}}\n\nنشوفك على خير. إذا ما تقدر تحضر، رد على هذي الرسالة.'],
    ['invoice','الفاتورة','payment_invoice','بعد الدفع أونلاين (يشتغل لما نربط بوابة الدفع).','شكرًا {{1}} 🤍\nاستلمنا دفعتك بنجاح.\n\n🧾 رقم الفاتورة: {{2}}\n💳 المبلغ: {{3}}\n\nالفاتورة مرفقة. شاهين ديزاين']
  ];
  P.messages=function(m){
    function M(){ if(!C.messages) C.messages={}; return C.messages; }
    function T(){ if(!C.settings.templates) C.settings.templates={}; return C.settings.templates; }
    m.appendChild(head('رسائل الواتساب','نصوص ردود البوت، وقوالب الرسائل اللي يرسلها النظام للعميل.'));
    var vars=el('div',{class:'card'},[el('h3',{text:'المتغيرات'}),el('p',{class:'muted',text:'اكتبها بين { } في أي رسالة، وتتبدل وقت الإرسال: {الاسم} اسم العميل · {رقم_الطلب} · {المالك} اسمك · {الملخص} ملخص الطلب. إذا الاسم فاضي، تنشال كلمة "يا" اللي قبله لحالها.'})]);
    m.appendChild(vars);
    var box=el('div',{class:'card'},[el('h3',{text:'ردود البوت'}),el('p',{class:'muted',text:'اترك الخانة فاضية عشان يرجع للنص الأصلي.'})]);
    MSG_LIST.forEach(function(x){ var k=x[0];
      box.appendChild(field(x[1],function(){ return (C.messages&&C.messages[k])||''; },function(v){ if(String(v).trim()) M()[k]=v; else if(C.messages) delete C.messages[k]; },{type:'textarea',rows:k==='online'||k==='offline'?2:4,max:900,ph:MSG_DEF[k],hint:x[2]}));
    });
    m.appendChild(box);
    var tb=el('div',{class:'card'},[el('h3',{text:'قوالب الرسائل (يبدأها النظام)'}),
      el('p',{class:'muted',text:'واتساب ما يسمح للنظام يرسل للعميل أول إلا بقالب يوافق عليه Meta. سوّ القالب من مدير واتساب ← قوالب الرسائل ← إنشاء قالب: الفئة "خدمة" (Utility)، اللغة العربية، وانسخ النص اللي تحت. لما يتوافق عليه، اكتب اسمه هنا.'}),
      field('لغة القوالب',function(){ return (C.settings.templates&&C.settings.templates.lang)||'ar'; },function(v){ T().lang=v.trim(); },{dir:'ltr',hint:'ar للعربي'})]);
    TPL_TEXT.forEach(function(x){ var k=x[0];
      var pre=el('pre',{class:'tpl',text:x[4]});
      tb.appendChild(el('div',{class:'tplbox'},[el('h4',{text:x[1]}),el('p',{class:'muted',text:x[3]}),
        field('اسم القالب في Meta',function(){ return (C.settings.templates&&C.settings.templates[k])||''; },function(v){ v=v.trim().toLowerCase(); if(v) T()[k]=v; else if(C.settings.templates) delete C.settings.templates[k]; },{dir:'ltr',ph:x[2],hint:'اتركه فاضي إذا ما تبغى هالرسالة تنرسل'}),
        el('div',{class:'muted',text:'النص اللي تحطه في Meta (الاسم المقترح: '+x[2]+'):'}),pre,
        el('button',{type:'button',class:'btn ghost sm',text:'انسخ النص',onclick:function(){ (navigator.clipboard?navigator.clipboard.writeText(x[4]):Promise.reject()).then(function(){ toast('انسخ النص'); },function(){ prompt('انسخ النص:',x[4]); }); }})]));
    });
    m.appendChild(tb);
  };

  P.settings=function(m){
    var S=C.settings, B=S.bank;
    m.appendChild(head('الإعدادات','أرقام التواصل، البنك، السوشال، وخيارات نموذج الطلب والبوت.'));
    m.appendChild(el('div',{class:'card'},[el('h3',{text:'التواصل'}),el('div',{class:'grid2'},[
      field('رقم الواتساب',function(){return S.phone;},function(v){S.phone=v.replace(/\D/g,'');},{dir:'ltr',inputmode:'numeric',hint:'بالصيغة الدولية بدون + مثال 966582409776'}),
      field('رقم البوت (إذا مختلف)',function(){return S.orderPhone;},function(v){S.orderPhone=v.replace(/\D/g,'');},{dir:'ltr',inputmode:'numeric',hint:'اتركه فاضي إذا البوت على نفس رقمك'}),
      field('الإيميل',function(){return S.email;},function(v){S.email=v.trim();},{type:'email',dir:'ltr'}),
      field('رقم وثيقة العمل الحر',function(){return S.license;},function(v){S.license=v.trim();},{dir:'ltr',max:40}),
      field('أوقات الرد',function(){return S.hours;},function(v){S.hours=v;},{max:60}),
      field('المدينة',function(){return S.city;},function(v){S.city=v;},{max:60})])]));
    m.appendChild(el('div',{class:'card'},[el('h3',{text:'الحساب البنكي'}),el('p',{class:'muted',text:'يظهر تحت سؤال "كيف الدفع؟" لما تكتب الآيبان.'}),el('div',{class:'grid2'},[
      field('اسم البنك',function(){return B.name;},function(v){B.name=v;},{max:60}),field('اسم المستفيد',function(){return B.holder;},function(v){B.holder=v;},{max:80}),
      field('رقم الحساب',function(){return B.account;},function(v){B.account=v.replace(/\s/g,'');},{dir:'ltr',max:34}),field('الآيبان',function(){return B.iban;},function(v){B.iban=v.replace(/\s/g,'').toUpperCase();},{dir:'ltr',ph:'SA00 0000 0000 0000 0000 0000'})])]));
    var soc=el('div',{class:'grid2'});
    S.social.forEach(function(s){ soc.appendChild(field(s.label,function(){return s.url;},function(v){s.url=v.trim();},{type:'url',dir:'ltr',ph:'https://'})); });
    m.appendChild(el('div',{class:'card'},[el('h3',{text:'حسابات السوشال'}),el('p',{class:'muted',text:'الحساب اللي رابطه فاضي ما يظهر.'}),soc]));
    var tl=el('div',{class:'grid3'}); for(var i=0;i<3;i++)(function(i){ tl.appendChild(field('خيار '+(i+1),function(){return S.timelines[i]||'';},function(v){ S.timelines[i]=v; S.timelines=S.timelines.filter(function(x,j){return x||j<3;}); },{max:20})); })(i);
    var bd=el('label',{class:'f'},[el('span',{text:'الميزانيات (كل خيار في سطر، ٢٤ حرف كحد أقصى)'}),(function(){ var t=el('textarea',{rows:6}); t.value=(S.budgets||[]).join('\n'); t.addEventListener('input',function(){ S.budgets=t.value.split('\n').map(function(x){return x.trim();}).filter(Boolean); markDirty(); }); return t; })()]);
    m.appendChild(el('div',{class:'card'},[el('h3',{text:'خيارات نموذج الطلب والبوت'}),el('p',{class:'muted',text:'"متى تحتاجه" تظهر أزرار في الواتساب، فحدها ٣ خيارات و٢٠ حرف.'}),tl,bd]));
  };

  P.history=function(m){
    m.appendChild(head('النسخ السابقة','كل مرة تحفظ، نحتفظ بالنسخة اللي قبلها. آخر ١٥ نسخة.'));
    var sbox=el('div',{class:'card'},[el('h3',{text:'المتجر والمواعيد'})]); m.appendChild(sbox);
    api('GET','/api/store/history').then(function(list){
      if(!Array.isArray(list)||!list.length){ sbox.appendChild(el('div',{class:'muted',text:'ما فيه نسخ سابقة للحين'})); return; }
      list.forEach(function(h){ sbox.appendChild(el('div',{class:'hist'},[el('div',null,[el('b',{text:'نسخة '+h.version}),el('div',{class:'muted',text:h.at?new Date(h.at).toLocaleString('ar-SA-u-ca-gregory'):'الأصل'})]),
        el('button',{type:'button',class:'btn ghost sm',text:'استرجاع',onclick:function(){ api('POST','/api/store/restore',{ts:h.ts}).then(function(j){ if(j.__status!==200) return toast(j.error||'ما قدرت',true); delete j.__status; ST=j; ST.products=ST.products||{}; markDirty(); tab='store'; render(); toast('رجعت النسخة. راجعها واضغط "حفظ ونشر"'); }); }})])); });
    });
    m.appendChild(el('h3',{text:'محتوى البوت',style:'margin:18px 0 8px'}));
    var box=el('div',{class:'card'},[el('div',{class:'muted',text:'جاري التحميل…'})]); m.appendChild(box);
    api('GET','/api/history').then(function(list){
      box.textContent='';
      if(!Array.isArray(list)||!list.length){ box.appendChild(el('div',{class:'empty',text:'ما فيه نسخ سابقة للحين'})); return; }
      list.forEach(function(h){
        box.appendChild(el('div',{class:'hist'},[el('div',null,[el('b',{text:'نسخة '+h.version}),el('div',{class:'muted',text:h.at?new Date(h.at).toLocaleString('ar-SA-u-ca-gregory'):'النسخة الأولى'})]),
          el('button',{type:'button',class:'btn ghost sm',text:'استرجاع',onclick:function(){
            if(dirty && !confirm('عندك تعديلات ما انحفظت، بتضيع. تكمل؟')) return;
            api('POST','/api/history/restore',{ts:h.ts}).then(function(j){ if(j.__status!==200) return toast(j.error||'ما قدرت',true); delete j.__status; C=j; markDirty(); tab='works'; render(); toast('رجعت النسخة. راجعها واضغط "حفظ ونشر"'); });
          }})]));
      });
    });
  };



  // ---------- الموظفين ----------
  var shareMsg='';
  P.team=function(m){
    m.appendChild(head('الموظفين','حسابات لفريقك. الموظف يدخل من نفس صفحة اللوحة باسم المستخدم وكلمة المرور، ويشوف طلبات العملاء والحجوزات بس: يغيّر الحالة ويكتب ملاحظات. ما يقدر يعدّل الموقع ولا الأسعار ولا الإعدادات، وما يشوف قيمة الصفقات.'));
    var box=el('div',{class:'card'},[el('div',{class:'muted',text:'جاري التحميل…'})]); m.appendChild(box);
    function input(ph,o){ o=o||{}; var i=el('input',{type:o.type||'text',placeholder:ph,dir:o.dir||'auto',autocomplete:'off',style:'width:100%;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff'}); return i; }
    function act(body,msg){ return api('POST','/api/staff',body).then(function(j){ if(j.__status!==200){ toast(j.error||'ما قدرت',true); return null; } SUM=null; toast(msg); paint(j.list||j); return j; }); }
    function paint(list){
      if(list&&list.__status) delete list.__status; var L=Array.isArray(list)?list:Object.keys(list||{}).filter(function(k){return /^[0-9]+$/.test(k);}).map(function(k){return list[k];});
      box.textContent='';
      box.appendChild(el('h3',{text:'الحسابات ('+L.length+')'}));
      if(!L.length) box.appendChild(el('div',{class:'empty',text:'ما فيه موظفين لسا. أضف أول موظف من تحت.'}));
      L.forEach(function(a){
        box.appendChild(el('div',{style:'display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:12px 0;border-top:1px solid var(--line)'},[
          el('div',{style:'flex:1;min-width:180px'},[el('b',{text:a.name}),' ',el('span',{class:'pill '+(a.active?'s3':'s5'),text:a.active?'فعّال':'موقوف'}),el('div',{class:'meta',dir:'ltr',style:'text-align:right',text:a.user}),el('div',{class:'muted',style:'font-size:12px',text:a.lastLogin?'آخر دخول '+ago(a.lastLogin):'ما دخل لسا'})]),
          el('button',{type:'button',class:'btn ghost sm',text:'كلمة مرور جديدة',onclick:function(){ var p=prompt('كلمة المرور الجديدة لـ '+a.name+' (٨ أو أكثر). بيطلع من أجهزته على طول.'); if(p) act({action:'reset',id:a.id,password:p},'تغيّرت كلمة المرور'); }}),
          el('button',{type:'button',class:'btn ghost sm',text:a.active?'إيقاف':'تشغيل',onclick:function(){ act({action:a.active?'disable':'enable',id:a.id},a.active?'انوقف الحساب':'رجع الحساب'); }}),
          el('button',{type:'button',class:'btn ghost sm',style:'color:var(--err)',text:'حذف',onclick:function(){ if(confirm('حذف حساب '+a.name+'؟')) act({action:'delete',id:a.id},'انحذف'); }})]));
      });
      var nm=input('اسم الموظفة'), us=input('username أو الإيميل',{dir:'ltr'}), pw=input('كلمة المرور (٨ أو أكثر)',{type:'text',dir:'ltr'});
      var gen=el('button',{type:'button',class:'btn ghost sm',text:'توليد',onclick:function(){ var c='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=crypto.getRandomValues(new Uint8Array(12)),o=''; for(var i=0;i<12;i++) o+=c[r[i]%c.length]; pw.value=o; }});
      var out=el('div');
      box.appendChild(el('div',{style:'border-top:1px solid var(--line);padding-top:14px;margin-top:6px;display:grid;gap:10px'},[el('h3',{text:'إضافة موظف'}),
        el('div',{class:'grid3'},[el('label',{class:'f'},[el('span',{text:'الاسم'}),nm]),el('label',{class:'f'},[el('span',{text:'اسم المستخدم أو الإيميل'}),us]),el('label',{class:'f'},[el('span',{text:'كلمة المرور'}),el('div',{style:'display:flex;gap:6px'},[pw,gen])])]),
        el('div',null,[el('button',{type:'button',class:'btn',text:'إنشاء الحساب',onclick:function(){ var u=us.value.trim().toLowerCase(),p=pw.value,n=nm.value.trim();
          api('POST','/api/staff',{action:'add',name:n,user:u,password:p}).then(function(j){ if(j.__status!==200){ toast(j.error||'ما قدرت',true); return; } SUM=null; var link=(siteUrl||location.origin).replace(/[/]$/,'')+'/admin';
            shareMsg='هلا '+n+'، هذا حسابك في لوحة شاهين ديزاين لمتابعة طلبات العملاء:'+String.fromCharCode(10)+link+String.fromCharCode(10)+'اسم المستخدم: '+u+String.fromCharCode(10)+'كلمة المرور: '+p; toast('انضاف الحساب'); paint(j); }); }})]),out]));
      if(shareMsg){ var msg=shareMsg; out.appendChild(el('div',{class:'card',style:'background:#FBF7EF'},[el('b',{text:'أرسل البيانات للموظفة'}),el('pre',{dir:'rtl',style:'white-space:pre-wrap;font:inherit;margin:8px 0',text:msg}),
        el('div',{style:'display:flex;gap:8px;flex-wrap:wrap'},[el('button',{type:'button',class:'btn sm',text:'نسخ',onclick:function(){ try{ navigator.clipboard.writeText(msg); toast('انسخ'); }catch(e){} }}),
        el('a',{class:'btn ghost sm',href:'https://wa.me/?text='+encodeURIComponent(msg),target:'_blank',rel:'noopener',text:'أرسل بالواتساب'})]),
        el('p',{class:'muted',style:'font-size:12px;margin-top:8px',text:'كلمة المرور ما تنحفظ عندنا بشكل يقدر أحد يقراه، فانسخها الحين.'})])); shareMsg=''; }
    }
    api('GET','/api/staff').then(function(j){ if(j.__status!==200){ box.textContent=j.error||'ما قدرت أحمّل'; return; } paint(j); });
  };

  // ---------- shell ----------
  function render(){
    var nav=$('tabs'); nav.textContent='';
    TABS.forEach(function(t){ nav.appendChild(el('button',{role:'tab','aria-selected':String(t[0]===tab),text:t[1],onclick:function(){ tab=t[0]; render(); window.scrollTo(0,0); }})); });
    var m=$('main'); m.textContent=''; if(window.__errors) m.appendChild(window.__errors);
    P[tab](m);
  }
  function showErrors(list){
    if(!list||!list.length){ window.__errors=null; return; }
    window.__errors=el('div',{class:'errors',role:'alert'},[el('b',{text:'ما انحفظ، فيه حقول تحتاج تعديل:'}),el('ul',null,list.slice(0,30).map(function(e){return el('li',{text:e});}))]);
  }
  function cleanS(){ var P=ST.products||{}; Object.keys(P).forEach(function(k){ var x=P[k]; if(x.tiers){ x.tiers=x.tiers.map(function(t){ return t&&Object.keys(t).length?t:null; }); while(x.tiers.length&&!x.tiers[x.tiers.length-1]) x.tiers.pop(); if(!x.tiers.length) delete x.tiers; } if(!Object.keys(x).length) delete P[k]; }); var o={products:P}; if(ST.book&&Object.keys(ST.book).length) o.book=ST.book; return o; }
  function save(){
    $('saveBtn').disabled=true; $('status').textContent='جاري النشر…';
    var sObj=cleanS(), sJ=JSON.stringify(sObj), cJ=JSON.stringify(C);
    var step1=cJ!==C0?api('PUT','/api/content',C):Promise.resolve({__status:200,skip:1});
    step1.then(function(j){
      if(j.__status!==200) return j;
      if(!j.skip){ C.version=j.version; C.updatedAt=j.updatedAt; C0=JSON.stringify(C); }
      return sJ!==S0?api('PUT','/api/store',sObj).then(function(k){ if(k.__status===200){ S0=sJ; ST.version=k.version; ST.updatedAt=k.updatedAt; } return k; }):{__status:200};
    }).then(function(j){
      if(j.__status===200){ dirty=false; showErrors(null); $('status').textContent='انحفظ ونُشر'; $('status').className='status'; info(); render(); toast('تم النشر. يظهر في الموقع خلال دقيقة'); }
      else if(j.__status===401){ toast('انتهت الجلسة، سجّل دخول من جديد',true); boot(); }
      else { $('saveBtn').disabled=false; $('status').textContent='ما انحفظ'; showErrors(j.errors||[j.error||'خطأ غير معروف']); render(); window.scrollTo(0,0); toast(j.error||'ما انحفظ',true); }
    }).catch(function(){ $('saveBtn').disabled=false; toast('مشكلة في الاتصال، جرب مرة ثانية',true); });
  }
  function info(){ $('verInfo').textContent=C.updatedAt?('آخر نشر '+new Date(C.updatedAt).toLocaleString('ar-SA-u-ca-gregory')+' · نسخة '+C.version):'المحتوى الأصلي'; }
  function load(){
    return Promise.all([api('GET','/api/me'),fetch('/api/content',{cache:'no-store'}).then(function(r){return r.json();}),api('GET','/api/store'),api('GET','/api/store/defaults')]).then(function(r){
      siteUrl=r[0].siteUrl||''; C=r[1]; C0=JSON.stringify(C);
      ST=r[2]&&r[2].__status===200?r[2]:{}; delete ST.__status; ST.products=ST.products||{}; S0=JSON.stringify(cleanS());
      DEF=Array.isArray(r[3])?r[3]:(function(){ var a=[]; Object.keys(r[3]||{}).forEach(function(k){ if(/^[0-9]+$/.test(k)) a[+k]=r[3][k]; }); return a; })();
      C.testimonials=C.testimonials||[]; C.faq=C.faq||[]; C.works=C.works||[]; C.services=C.services||[];
      if(siteUrl){ $('siteLink').href=siteUrl; $('siteLink').hidden=false; }
      info(); render();
    });
  }
  function boot(){
    api('GET','/api/me').then(function(j){
      var ok=j.__status===200 && j.ok;
      $('loginView').hidden=ok; $('app').hidden=!ok;
      if(!ok){ $('pw').focus(); return; }
      ROLE=j.role||'owner';
      if(ROLE==='staff'){ // الموظف: الطلبات بس
        MYNAME=j.name||''; TABS=[['leads','طلبات العملاء'],['projects','مشاريعي']]; if(tab!=='projects') tab='leads'; siteUrl=j.siteUrl||'';
        $('saveBtn').hidden=true; $('status').hidden=true; $('verInfo').textContent='حساب موظف · '+MYNAME; render();
      } else { MYNAME='عبدالرحمن'; TABS=OWNER_TABS; $('saveBtn').hidden=false; $('status').hidden=false; load(); }
    });
  }
  function clearCookies(){ return Promise.all([api('POST','/api/logout'),api('POST','/api/logout?c=staff')]); }
  $('loginForm').addEventListener('submit',function(e){ e.preventDefault(); $('loginErr').textContent='';
    var u=$('user').value.trim(); try{ if('Notification' in window&&Notification.permission==='default'&&'PushManager' in window) Notification.requestPermission(); }catch(_){}
    clearCookies().then(function(){ return api('POST','/api/login',{user:u,password:$('pw').value}); }).then(function(j){ if(j.__status===200){ $('pw').value=''; SUM=null; tab=u?'leads':'home'; boot(); } else $('loginErr').textContent=j.error||'ما قدرت أدخل'; }); });
  $('saveBtn').addEventListener('click',save);
  $('logoutBtn').addEventListener('click',function(){ if(dirty && !confirm('عندك تعديلات ما انحفظت. تطلع؟')) return; dirty=false; SUM=null; clearCookies().then(boot); });
  document.addEventListener('keydown',function(e){ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&!$('app').hidden){ e.preventDefault(); if(dirty) save(); } });
  window.addEventListener('beforeunload',function(e){ if(dirty){ e.preventDefault(); e.returnValue=''; } });
  // ---------- تطبيق على الجوال ----------
  var deferredInstall=null, standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream;
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/admin-sw.js',{scope:'/admin'}).catch(function(){});
  function installUi(){
    var b=$('installBtn'), h=$('installHint'); if(standalone){ b.hidden=true; h.hidden=true; return; }
    if(deferredInstall){ b.hidden=false; h.hidden=false; h.textContent=''; h.appendChild(el('button',{type:'button',class:'btn ghost',style:'width:100%',text:'ثبّت اللوحة كتطبيق على جوالك',onclick:doInstall})); }
    else if(ios){ h.hidden=false; h.textContent='ثبّتها كتطبيق على الآيفون: من سفاري اضغط زر المشاركة ⬆︎ وبعدها «إضافة إلى الشاشة الرئيسية».'; b.hidden=false; }
  }
  function doInstall(){
    if(deferredInstall){ deferredInstall.prompt(); deferredInstall.userChoice.then(function(){ deferredInstall=null; installUi(); }); }
    else if(ios) alert('من سفاري: اضغط زر المشاركة ⬆︎ تحت الشاشة، وبعدها «إضافة إلى الشاشة الرئيسية».');
  }
  window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); deferredInstall=e; installUi(); });
  window.addEventListener('appinstalled',function(){ deferredInstall=null; toast('انضاف التطبيق لشاشتك'); installUi(); });
  $('installBtn').addEventListener('click',doInstall);
  installUi();

  // ---------- تنبيهات الطلبات الجديدة ----------
  var pushOk='serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  function b64(u){ var p='='.repeat((4-u.length%4)%4), s=atob((u+p).replace(/-/g,'+').replace(/_/g,'/')), a=new Uint8Array(s.length); for(var i=0;i<s.length;i++) a[i]=s.charCodeAt(i); return a; }
  function pushState(){ var b=$('pushBtn');
    if($('app').hidden){ b.hidden=true; return; }
    if(!pushOk){ b.hidden=!ios; b.textContent='🔔 التنبيهات'; return; }
    navigator.serviceWorker.ready.then(function(r){ return r.pushManager.getSubscription(); }).then(function(sub){
      b.hidden=false; b.textContent=sub&&Notification.permission==='granted'?'🔔 التنبيهات شغالة':'🔔 فعّل التنبيهات'; b.dataset.on=sub?'1':''; });
  }
  function enablePush(){
    if(!pushOk){ alert(ios&&!standalone?'على الآيفون: ثبّت اللوحة على الشاشة الرئيسية أول (زر المشاركة ⬆︎ ثم «إضافة إلى الشاشة الرئيسية»)، وافتحها من الأيقونة، وبعدها فعّل التنبيهات.':'جهازك ما يدعم التنبيهات من المتصفح هذا.'); return; }
    var b=$('pushBtn');
    if(b.dataset.on){ navigator.serviceWorker.ready.then(function(r){ return r.pushManager.getSubscription(); }).then(function(sub){ if(!sub) return; if(confirm('توقف التنبيهات على هذا الجهاز؟')){ api('POST','/api/push/unsubscribe',{endpoint:sub.endpoint}); sub.unsubscribe().then(function(){ toast('توقفت التنبيهات'); pushState(); }); } else api('POST','/api/push/test',{endpoint:sub.endpoint}).then(function(){ toast('أرسلنا إشعار تجربة'); }); }); return; }
    Notification.requestPermission().then(function(p){
      if(p!=='granted'){ toast('لازم تسمح بالإشعارات من إعدادات الجوال',true); return; }
      return Promise.all([navigator.serviceWorker.ready,api('GET','/api/push/key')]).then(function(r){
        return r[0].pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(r[1].key)});
      }).then(function(sub){ var j=sub.toJSON(); return api('POST','/api/push/subscribe',{sub:{endpoint:j.endpoint,keys:j.keys}}).then(function(x){ if(x.__status!==200) throw new Error(x.error||''); return api('POST','/api/push/test',{endpoint:j.endpoint}); }); })
      .then(function(){ toast('تمام، بيوصلك إشعار تجربة الحين'); pushState(); }, function(e){ toast('ما قدرت أفعّل التنبيهات '+(e&&e.message||''),true); });
    });
  }
  function subscribeNow(test){
    return Promise.all([navigator.serviceWorker.ready,api('GET','/api/push/key')]).then(function(r){
      return r[0].pushManager.getSubscription().then(function(old){ return old||r[0].pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(r[1].key)}); });
    }).then(function(sub){ var j=sub.toJSON(); return api('POST','/api/push/subscribe',{sub:{endpoint:j.endpoint,keys:j.keys}}).then(function(x){ if(x.__status!==200) throw new Error(x.error||''); if(test) return api('POST','/api/push/test',{endpoint:j.endpoint}); }); });
  }
  // تلقائي: لو الإذن موجود نشترك بصمت، ولو ما انسأل نعرض بطاقة بزر واحد
  function autoPush(){
    if(!pushOk||$('app').hidden) return;
    if(Notification.permission==='granted'){ var first=!localStorage.getItem('sd-push-on'); subscribeNow(first).then(function(){ try{ localStorage.setItem('sd-push-on','1'); }catch(_){} if(first) toast('التنبيهات شغالة، بيوصلك إشعار مع كل طلب جديد'); pushState(); },function(){}); return; }
    if(Notification.permission==='default'&&!document.getElementById('pushCard')){
      var card=el('div',{id:'pushCard',class:'card',style:'position:fixed;inset:auto 12px 12px 12px;z-index:50;max-width:460px;margin:0 auto;box-shadow:0 18px 40px -12px rgba(0,0,0,.35);display:flex;gap:10px;align-items:center'},[
        el('div',{style:'flex:1'},[el('b',{text:'🔔 فعّل تنبيهات الطلبات'}),el('div',{class:'muted',style:'font-size:13px',text:'يوصلك إشعار على جوالك مع كل طلب أو حجز جديد'})]),
        el('button',{type:'button',class:'btn sm',text:'سماح',onclick:function(){ card.remove(); Notification.requestPermission().then(function(p){ if(p==='granted') autoPush(); else toast('تقدر تفعّلها بعدين من زر 🔔',true); }); }}),
        el('button',{type:'button',class:'btn ghost sm',text:'لاحقًا',onclick:function(){ card.remove(); }})]);
      document.body.appendChild(card);
    }
  }
  $('pushBtn').addEventListener('click',enablePush);
  if('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message',function(e){ if(e.data&&e.data.type==='refresh'){ SUM=null; if(!$('app').hidden) render(); } });
  // تحديث قائمة الطلبات كل دقيقة لما تكون اللوحة مفتوحة
  setInterval(function(){ if(document.visibilityState==='visible'&&!$('app').hidden&&tab==='leads'&&!dirty&&!document.getElementById('leadSheet')&&!document.querySelector('textarea:focus,input:focus,select:focus')){ SUM=null; render(); } },60000);
  var _boot=boot; boot=function(){ _boot(); setTimeout(function(){ pushState(); autoPush(); },1200); };
  boot();
})();
</script>
</body>
</html>
`;
