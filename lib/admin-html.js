// واجهة لوحة التحكم (/admin)
export default String.raw`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
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
@media (max-width:720px){.kpis{grid-template-columns:1fr 1fr}.lead .row{grid-template-columns:1fr}.hbar{grid-template-columns:90px 1fr 40px}}

@media (max-width:720px){.grid2,.grid3{grid-template-columns:1fr}header.top{padding:10px 14px}.status{order:3;width:100%;margin:0}nav.tabs{top:96px}main{padding:18px 14px 120px}}
</style>
</head>
<body>

<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><symbol id="falcon" viewBox="0 0 232 220"><g transform="translate(4,10)" fill-rule="evenodd"><path d="M 50 40 C 80 18 132 18 158 30 C 174 38 180 52 180 72 L 180 90 C 178 100 172 106 160 110 L 146 118 C 130 126 110 126 94 122 C 74 118 58 130 48 148 C 40 164 32 186 28 200 L 10 200 L 6 184 C 4 140 10 90 26 62 C 32 52 40 46 50 40 Z M 143.5 62 A 5.5 5.5 0 1 0 132.5 62 A 5.5 5.5 0 1 0 143.5 62 Z"/><path d="M 158 68 C 188 74 214 88 224 112 L 216 106 C 202 100 180 102 162 104 L 150 116 Z"/></g></symbol></defs></svg>

<section class="login" id="loginView" hidden>
  <form id="loginForm">
    <div class="brand"><svg aria-hidden="true"><use href="#falcon" fill="#B8935A"/></svg><div><b class="lat" style="letter-spacing:.2em">SHAHEEN</b><div class="muted">لوحة التحكم</div></div></div>
    <h1>أهلًا عبدالرحمن</h1>
    <label class="f"><span>كلمة السر</span><input id="pw" type="password" autocomplete="current-password" required style="width:100%;border:1px solid var(--line);border-radius:12px;padding:11px 12px"></label>
    <div class="muted" id="loginErr" role="alert" style="color:var(--err)"></div>
    <button class="btn" type="submit">دخول</button>
  </form>
</section>

<div id="app" hidden>
  <header class="top">
    <div class="brand"><svg aria-hidden="true"><use href="#falcon" fill="#B8935A"/></svg><div><b>لوحة تحكم شاهين ديزاين</b><small id="verInfo"></small></div></div>
    <span class="status" id="status" role="status">كل التعديلات محفوظة</span>
    <a class="btn ghost sm" id="siteLink" target="_blank" rel="noopener" hidden>عرض الموقع</a>
    <button class="btn sm" id="saveBtn" disabled>حفظ ونشر</button>
    <button class="btn ghost sm" id="logoutBtn">خروج</button>
  </header>
  <nav class="tabs" role="tablist" aria-label="أقسام اللوحة" id="tabs"></nav>
  <main id="main"></main>
</div>

<script>
(function(){
  'use strict';
  // تبويبات الموقع القديم (من أعمالنا، آراء العملاء، الأسئلة، الواجهة) مخفية لأن المتجر الجديد ما يستخدمها
  var TABS=[['home','الرئيسية'],['leads','العملاء'],['store','المتجر'],['booking','المواعيد'],['services','خدمات البوت'],['settings','الإعدادات'],['history','النسخ السابقة']];
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
    m.appendChild(head('العملاء','كل الطلبات والحجوزات اللي وصلت من الموقع والبوت. غيّر الحالة وسجّل ملاحظاتك وقيمة الصفقة.',el('a',{class:'btn ghost sm',href:'/leads',target:'_blank',rel:'noopener',text:'جدول كامل'})));
    var box=el('div',null,[el('div',{class:'card'},[el('div',{class:'muted',text:'جاري التحميل…'})])]); m.appendChild(box);
    loadSum().then(function(S){ box.textContent=''; if(!S) return;
      var L=S.leads, cnt={}; L.forEach(function(l){ var st=l.status||'جديد'; cnt[st]=(cnt[st]||0)+1; });
      var won=L.filter(function(l){ return l.status==='تم الاتفاق'; }).reduce(function(a,l){ return a+(l.value||0); },0);
      box.appendChild(el('div',{class:'kpis'},[
        el('div',{class:'kpi'},[el('small',{text:'كل الطلبات'}),el('b',{text:num(L.length)})]),
        el('div',{class:'kpi'},[el('small',{text:'تحتاج رد'}),el('b',{text:num(cnt['جديد']||0)})]),
        el('div',{class:'kpi'},[el('small',{text:'تم الاتفاق'}),el('b',{text:num(cnt['تم الاتفاق']||0)})]),
        el('div',{class:'kpi'},[el('small',{text:'قيمة الصفقات (ر.س)'}),el('b',{text:num(won)})])]));
      var st=el('div',{class:'subtabs',role:'tablist'});
      ['الكل'].concat(STC,['تمت','ملغي']).forEach(function(k){ var n=k==='الكل'?L.length:(cnt[k]||0); if(k!=='الكل'&&!n&&STC.indexOf(k)<0) return;
        st.appendChild(el('button',{type:'button',role:'tab','aria-selected':String(leadF===k),text:k+' ('+n+')',onclick:function(){ leadF=k; render(); }})); });
      box.appendChild(st);
      var q=el('input',{type:'search',placeholder:'ابحث بالاسم أو الرقم أو الخدمة',style:'width:100%;border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin-bottom:12px;background:#fff'}); q.value=leadQ;
      var list=el('div',{style:'display:grid;gap:10px'});
      function paint(){ list.textContent=''; var qq=leadQ.trim();
        var R=L.filter(function(l){ var s2=l.status||'جديد'; return (leadF==='الكل'||s2===leadF)&&(!qq||[l.name,l.wa,l.id,l.serviceName,l.org,l.details].join(' ').indexOf(qq)>=0); });
        if(!R.length) list.appendChild(el('div',{class:'card'},[el('div',{class:'empty',text:'ما فيه طلبات هنا'})]));
        R.forEach(function(l){ var s2=l.status||'جديد', si=STC.indexOf(s2);
          var sel=el('select',{'aria-label':'الحالة'}); STC.concat(l.kind==='booking'?['تمت','ملغي']:[]).forEach(function(o){ var op=el('option',{value:o,text:o}); if(o===s2) op.selected=true; sel.appendChild(op); });
          sel.addEventListener('change',function(){ setLead(l.id,{status:sel.value}).then(function(){ render(); }); });
          var val=el('input',{type:'text',inputmode:'numeric',dir:'ltr',placeholder:'قيمة الصفقة',value:l.value?String(l.value):''}); val.addEventListener('change',function(){ setLead(l.id,{value:val.value}); });
          var note=el('textarea',{rows:2,placeholder:'ملاحظاتك عن العميل (تنحفظ لحالها)'}); note.value=l.note||''; note.addEventListener('blur',function(){ if(note.value!==(l.note||'')) setLead(l.id,{note:note.value}).then(function(n){ if(n) l.note=n.note; }); });
          var info=[['الخدمة',l.serviceName||l.services||l.reason],['الجهة',l.org],['الموعد',l.slot?(when(l.slot).day+' '+when(l.slot).time):l.timeline],['الميزانية',l.budget],['التواصل',l.pref],['التفاصيل',l.details]].filter(function(x){ return x[1]; });
          list.appendChild(el('div',{class:'lead'},[
            el('div',{class:'top'},[el('div',null,[el('b',{text:l.name||'بدون اسم'}),' ',el('span',{class:'pill s'+(si<0?4:si),text:s2}),el('div',{class:'meta',text:[l.id,ago(l.at),l.source].filter(Boolean).join(' · ')})]),
              el('div',{class:'tools'},[l.wa?el('a',{class:'btn sm',href:waLink(l,'هلا '+(l.name||'')+'، معك عبدالرحمن من شاهين ديزاين بخصوص طلبك '+l.id+'.'),target:'_blank',rel:'noopener',text:'واتساب'}):null,l.wa?el('a',{class:'btn ghost sm',href:'tel:+'+l.wa,text:'اتصال'}):null])]),
            info.length?el('dl',null,[].concat.apply([],info.map(function(x){ return [el('div',null,[el('dt',{text:x[0]}),el('dd',{text:x[1]})])]; }))):null,
            el('div',{class:'row'},[el('label',{class:'f'},[el('span',{text:'الحالة'}),sel]),el('label',{class:'f'},[el('span',{text:'القيمة (ر.س)'}),val]),el('label',{class:'f'},[el('span',{text:'ملاحظات'}),note])])])); }); }
      q.addEventListener('input',function(){ leadQ=q.value; paint(); });
      box.appendChild(q); box.appendChild(list); paint();
    });
  };

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
      if(ok) load(); else $('pw').focus();
    });
  }
  $('loginForm').addEventListener('submit',function(e){ e.preventDefault(); $('loginErr').textContent='';
    api('POST','/api/login',{password:$('pw').value}).then(function(j){ if(j.__status===200){ $('pw').value=''; boot(); } else $('loginErr').textContent=j.error||'ما قدرت أدخل'; }); });
  $('saveBtn').addEventListener('click',save);
  $('logoutBtn').addEventListener('click',function(){ if(dirty && !confirm('عندك تعديلات ما انحفظت. تطلع؟')) return; dirty=false; api('POST','/api/logout').then(boot); });
  document.addEventListener('keydown',function(e){ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&!$('app').hidden){ e.preventDefault(); if(dirty) save(); } });
  window.addEventListener('beforeunload',function(e){ if(dirty){ e.preventDefault(); e.returnValue=''; } });
  boot();
})();
</script>
</body>
</html>
`;
