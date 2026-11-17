// تطبيق الفريق (/admin للموظفين): واجهة جوال حديثة — الرئيسية، الطلبات، المشاريع، المستحقات، حسابي
export default String.raw`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>فريق شاهين</title>
<link rel="manifest" href="/admin.webmanifest">
<meta name="theme-color" content="#0E0E11">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="شاهين">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/admin-icon-192.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap">
<style>
:root{--bg:#F4F1EA;--card:#FFFFFF;--card2:#FBF9F4;--ink:#16151A;--sub:#5F5A52;--mute:#9A948A;--line:#E8E2D6;--gold:#B8935A;--gold-d:#8C6A36;--gold-s:#F5ECDD;--ok:#2F7A4F;--ok-s:#E3F2E8;--bad:#B4483C;--bad-s:#FBE9E6;--info:#2D5F9A;--info-s:#E6EEF8;--warn:#9A6412;--warn-s:#FCEFD9;--shadow:0 1px 2px rgba(22,21,26,.04),0 10px 30px -14px rgba(22,21,26,.18);--top:env(safe-area-inset-top);--bot:env(safe-area-inset-bottom);color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#0E0E11;--card:#1A1A1F;--card2:#141418;--ink:#F2EEE6;--sub:#BDB6AA;--mute:#8A847A;--line:#2A2930;--gold-s:#2A2318;--ok-s:#16271D;--bad-s:#2C1714;--info-s:#15202F;--warn-s:#2A1F0E;--shadow:0 1px 2px rgba(0,0,0,.3),0 12px 30px -14px rgba(0,0,0,.6);color-scheme:dark}}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html,body{margin:0;background:var(--bg);color:var(--ink);font-family:'IBM Plex Sans Arabic',system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.55}
button,input,select,textarea{font:inherit;color:inherit}button{cursor:pointer}[hidden]{display:none!important}a{color:inherit}
:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
#app{min-height:100vh;padding:calc(var(--top) + 8px) 16px calc(96px + var(--bot));max-width:640px;margin:0 auto}
.bar{position:sticky;top:0;z-index:20;margin:0 -16px 8px;padding:calc(var(--top) + 10px) 16px 10px;background:color-mix(in srgb,var(--bg) 86%,transparent);backdrop-filter:saturate(1.6) blur(14px);-webkit-backdrop-filter:saturate(1.6) blur(14px);display:flex;align-items:center;gap:10px;min-height:56px}
.bar h1{font-size:17px;margin:0;flex:1;text-align:center;font-weight:700}.bar .ib{width:40px}
.big{font-size:30px;font-weight:700;letter-spacing:-.01em;margin:6px 0 2px;line-height:1.25}.lede{color:var(--sub);margin:0 0 16px;font-size:14px}
.ib{width:40px;height:40px;border-radius:12px;border:0;background:transparent;display:grid;place-items:center;color:var(--ink)}.ib:active{background:var(--line)}
.ib svg,.ic svg{width:22px;height:22px}
.card{background:var(--card);border-radius:20px;box-shadow:var(--shadow);padding:16px;margin-bottom:12px}
.sec{display:flex;justify-content:space-between;align-items:baseline;margin:22px 2px 10px}.sec h2{font-size:17px;margin:0}.sec a,.sec button{border:0;background:none;color:var(--gold-d);font-weight:600;font-size:14px;padding:0}
.hero{background:linear-gradient(135deg,#17161B,#2A241B);color:#F4EEE3;border-radius:24px;padding:18px;box-shadow:0 18px 40px -20px rgba(0,0,0,.6);position:relative;overflow:hidden;margin-bottom:14px}
.hero .who{display:flex;align-items:center;gap:12px}.hero .av{background:var(--gold);color:#17161B}
.hero small{color:#CBBFA9}.hero h2{margin:2px 0 0;font-size:20px}
.hero .glow{position:absolute;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(184,147,90,.35),transparent 65%);left:-60px;top:-90px;pointer-events:none}
.hstats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}.hstats div{background:rgba(255,255,255,.07);border-radius:14px;padding:10px}.hstats b{display:block;font-size:22px;line-height:1.2}.hstats span{font-size:12px;color:#CBBFA9}
.av{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;font-weight:700;background:var(--gold-s);color:var(--gold-d);flex-shrink:0;font-size:17px}.av.sm{width:38px;height:38px;border-radius:12px;font-size:15px}
.qa{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.qa button{border:0;background:var(--card);box-shadow:var(--shadow);border-radius:18px;padding:12px 4px;display:grid;justify-items:center;gap:6px;font-size:12.5px;font-weight:600}.qa button span{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:var(--gold-s);color:var(--gold-d)}.qa svg{width:22px;height:22px}
.row{display:flex;align-items:center;gap:12px;padding:12px 2px;border-bottom:1px solid var(--line);background:none;border-left:0;border-right:0;border-top:0;width:100%;text-align:start}.row:last-child{border-bottom:0}
.row .t{flex:1;min-width:0}.row .t b{display:block;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.row .t span{display:block;color:var(--sub);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row .end{text-align:left;font-size:12.5px;color:var(--mute);flex-shrink:0}
.badge{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:3px 9px;font-size:12px;font-weight:600;background:var(--card2);color:var(--sub);white-space:nowrap}
.b-new{background:var(--warn-s);color:var(--warn)}.b-con{background:var(--info-s);color:var(--info)}.b-quo{background:#EFE6F7;color:#5B3A86}.b-won{background:var(--ok-s);color:var(--ok)}.b-hold{background:var(--card2);color:var(--sub)}.b-lost{background:var(--bad-s);color:var(--bad)}.b-late{background:var(--bad-s);color:var(--bad)}.b-gold{background:var(--gold-s);color:var(--gold-d)}
@media (prefers-color-scheme:dark){.b-quo{background:#241A30;color:#C9B2EA}}
.search{display:flex;align-items:center;gap:8px;background:var(--card);border-radius:14px;padding:0 12px;box-shadow:var(--shadow);margin-bottom:12px}.search input{border:0;background:transparent;flex:1;padding:12px 0;outline:none}.search svg{width:18px;height:18px;color:var(--mute)}
.seg{display:flex;background:var(--line);border-radius:12px;padding:3px;margin-bottom:10px}.seg button{flex:1;border:0;background:transparent;border-radius:10px;padding:8px 6px;font-weight:600;font-size:13.5px;color:var(--sub)}.seg button[aria-pressed=true]{background:var(--card);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.chips{display:flex;gap:6px;overflow-x:auto;margin:0 -16px 12px;padding:0 16px 2px;scrollbar-width:none}.chips::-webkit-scrollbar{display:none}
.chips button{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 14px;font-weight:600;font-size:13px;white-space:nowrap;color:var(--sub)}.chips button[aria-pressed=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.chips button i{font-style:normal;opacity:.7;margin-inline-start:4px}
.lc{display:block;background:var(--card);border-radius:18px;box-shadow:var(--shadow);padding:14px;margin-bottom:10px;border:0;width:100%;text-align:start;position:relative}
.lc.late{box-shadow:inset 3px 0 0 var(--bad),var(--shadow)}
.lc .h{display:flex;gap:12px;align-items:center}.lc .h .t{flex:1;min-width:0}.lc .h b{font-weight:700;display:block}.lc .h span{color:var(--sub);font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lc .f{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;align-items:center}.lc .q{display:flex;gap:6px;margin-inline-start:auto}
.qb{width:38px;height:38px;border-radius:12px;border:0;display:grid;place-items:center;background:var(--gold-s);color:var(--gold-d)}.qb.wa{background:#E3F5EA;color:#1F8A4C}.qb svg{width:19px;height:19px}
@media (prefers-color-scheme:dark){.qb.wa{background:#12271B;color:#5BD48E}}
.empty{text-align:center;color:var(--mute);padding:36px 16px}.empty svg{width:56px;height:56px;opacity:.5;margin-bottom:6px}
.tabs{position:fixed;bottom:0;left:0;right:0;z-index:30;background:color-mix(in srgb,var(--card) 88%,transparent);backdrop-filter:saturate(1.6) blur(16px);-webkit-backdrop-filter:saturate(1.6) blur(16px);border-top:1px solid var(--line);display:flex;justify-content:space-around;padding:6px 6px calc(6px + var(--bot))}
.tabs button{border:0;background:none;display:grid;justify-items:center;gap:2px;font-size:11px;font-weight:600;color:var(--mute);padding:4px 10px;position:relative;min-width:58px}
.tabs button svg{width:24px;height:24px}.tabs button[aria-current=page]{color:var(--gold-d)}.tabs .dot{position:absolute;top:0;inset-inline-end:10px;min-width:17px;height:17px;border-radius:9px;background:var(--bad);color:#fff;font-size:10.5px;display:grid;place-items:center;padding:0 4px}
.fab{position:fixed;inset-inline-start:max(16px,calc(50% - 304px));bottom:calc(82px + var(--bot));z-index:25;width:56px;height:56px;border-radius:18px;border:0;background:var(--ink);color:var(--bg);box-shadow:0 12px 26px -8px rgba(0,0,0,.45);display:grid;place-items:center}.fab svg{width:26px;height:26px}
.btn{text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:14px;padding:12px 18px;font-weight:700;background:var(--ink);color:var(--bg);min-height:48px}.btn.gold{background:var(--gold);color:#16151A}.btn.soft{background:var(--gold-s);color:var(--gold-d)}.btn.ghost{background:var(--card);color:var(--ink);box-shadow:var(--shadow)}.btn.bad{background:var(--bad-s);color:var(--bad)}.btn.block{width:100%}.btn.sm{min-height:38px;padding:7px 12px;font-size:13.5px;border-radius:11px}.btn svg{width:20px;height:20px}
.page{animation:in .28s cubic-bezier(.2,.8,.2,1)}@keyframes in{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:none}}
.pipe{display:flex;gap:4px;margin:6px 0 4px}.pipe span{flex:1;height:6px;border-radius:4px;background:var(--line)}.pipe span.on{background:var(--gold)}.pipe span.won{background:var(--ok)}
.steps{display:flex;justify-content:space-between;font-size:11.5px;color:var(--mute)}.steps b{color:var(--ink)}
.kv{display:grid;grid-template-columns:auto 1fr;gap:10px 14px;font-size:14px}.kv dt{color:var(--mute);display:flex;align-items:center;gap:6px}.kv dt svg{width:16px;height:16px}.kv dd{margin:0;word-break:break-word}
.act{position:fixed;bottom:0;left:0;right:0;z-index:35;background:color-mix(in srgb,var(--card) 92%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid var(--line);padding:10px 16px calc(10px + var(--bot));display:flex;gap:8px;justify-content:center}.act .btn{flex:1;max-width:200px}
.tl{list-style:none;margin:0;padding:0}.tl li{position:relative;padding:0 22px 14px 0;font-size:14px}.tl li::before{content:"";position:absolute;right:5px;top:7px;width:10px;height:10px;border-radius:50%;background:var(--line)}.tl li::after{content:"";position:absolute;right:9.5px;top:20px;bottom:0;width:1px;background:var(--line)}.tl li:last-child::after{display:none}
.tl li.note::before{background:var(--gold)}.tl li.status::before{background:var(--info)}.tl li.contact::before{background:var(--ok)}.tl li.assign::before{background:#7B5BB0}.tl small{display:block;color:var(--mute);font-size:12px}
.pre{display:flex;gap:6px;flex-wrap:wrap}.pre button{border:1px solid var(--line);background:var(--card2);border-radius:10px;padding:7px 11px;font-size:13px;font-weight:600}
.f{display:grid;gap:6px;margin-bottom:12px}.f>span{font-size:13px;font-weight:600;color:var(--sub)}
.f input,.f select,.f textarea{width:100%;border:1px solid var(--line);background:var(--card2);border-radius:12px;padding:12px;min-height:46px;outline:none}.f input:focus,.f select:focus,.f textarea:focus{border-color:var(--gold);background:var(--card)}
.sheet-bg{position:fixed;inset:0;z-index:60;background:rgba(10,10,12,.45);display:flex;align-items:flex-end;justify-content:center;animation:fade .2s}@keyframes fade{from{opacity:0}}
.sheet{background:var(--bg);width:100%;max-width:640px;max-height:90vh;overflow:auto;border-radius:26px 26px 0 0;padding:8px 16px calc(18px + var(--bot));animation:up .3s cubic-bezier(.2,.8,.2,1)}@keyframes up{from{transform:translateY(60px);opacity:.5}}
.sheet .grab{width:42px;height:5px;border-radius:3px;background:var(--line);margin:4px auto 12px}.sheet h3{margin:0 0 12px;font-size:18px}
.list-btn{text-decoration:none;color:inherit;display:flex;align-items:center;gap:12px;width:100%;border:0;background:var(--card);padding:14px;border-radius:14px;margin-bottom:8px;text-align:start;font-weight:600}.list-btn small{display:block;font-weight:400;color:var(--sub);font-size:12.5px}
.toast{position:fixed;left:50%;bottom:calc(96px + var(--bot));transform:translateX(-50%);z-index:80;background:var(--ink);color:var(--bg);padding:11px 18px;border-radius:14px;font-size:14px;font-weight:600;box-shadow:0 12px 30px rgba(0,0,0,.3);animation:up .25s;max-width:calc(100% - 32px)}.toast.bad{background:var(--bad);color:#fff}
.sk{background:linear-gradient(90deg,var(--line),var(--card),var(--line));background-size:200% 100%;animation:sk 1.1s infinite;border-radius:18px;height:84px;margin-bottom:10px}@keyframes sk{to{background-position:-200% 0}}
.ring{width:54px;height:54px;flex-shrink:0}.ring circle{fill:none;stroke-width:6}.ring .bg{stroke:var(--line)}.ring .fg{stroke:var(--gold);stroke-linecap:round;transition:stroke-dashoffset .6s}
table.st{width:100%;border-collapse:collapse;font-size:14px}table.st td{padding:9px 2px;border-bottom:1px solid var(--line)}table.st td:last-child{text-align:left;font-weight:600;direction:ltr}table.st tr.hl td{color:var(--gold-d);font-weight:700}
.chart{display:flex;align-items:flex-end;gap:8px;height:130px;padding-top:10px}.chart div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:100%}.chart i{display:block;width:100%;max-width:34px;border-radius:8px 8px 4px 4px;background:var(--gold);min-height:4px}.chart div:last-child i{background:var(--gold-d)}.chart span{font-size:11px;color:var(--mute)}.chart em{font-style:normal;font-size:11px;font-weight:600}
.money{font-size:34px;font-weight:700;letter-spacing:-.01em}.money small{font-size:15px;color:var(--mute);font-weight:600}
.ptr{height:0;overflow:hidden;display:grid;place-items:center;color:var(--mute);font-size:13px;transition:height .2s}
.mb{margin-bottom:12px}.muted{color:var(--mute)}.sm{font-size:13px}.ltr{direction:ltr;unicode-bidi:isolate}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
</head>
<body>
<div class="ptr" id="ptr">اسحب للتحديث</div>
<main id="app" aria-live="polite"><div class="sk" style="height:180px"></div><div class="sk"></div><div class="sk"></div></main>
<nav class="tabs" id="tabs" aria-label="القائمة"></nav>
<script>
(function(){
'use strict';
// ---------- أدوات ----------
var $=function(id){ return document.getElementById(id); };
function el(tag,a,kids){ var e=document.createElement(tag); if(a) for(var k in a){ var v=a[k]; if(v==null||v===false) continue; if(k==='text') e.textContent=v; else if(k==='html') e.innerHTML=v; else if(k==='class') e.className=v; else if(k.slice(0,2)==='on') e.addEventListener(k.slice(2),v); else e.setAttribute(k,v===true?'':v); } (kids||[]).forEach(function(c){ if(c!=null&&c!==false) e.appendChild(typeof c==='string'?document.createTextNode(c):c); }); return e; }
function api(m,p,b){ var o={method:m,credentials:'same-origin',headers:{}}; if(b!==undefined){ o.headers['content-type']='application/json'; o.body=JSON.stringify(b); } return fetch(p,o).then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ j.__s=r.status; if(r.status===401) location.reload(); return j; }); }); }
function toast(t,bad){ var x=document.querySelector('.toast'); if(x) x.remove(); x=el('div',{class:'toast'+(bad?' bad':''),role:'status',text:t}); document.body.appendChild(x); setTimeout(function(){ x.remove(); },bad?4500:2400); }
function buzz(){ try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){} }
var num=function(n){ return Number(n||0).toLocaleString('en-US'); };
var sar=function(n){ return num(Math.round((n||0)*100)/100)+' ر.س'; };
var ksa=function(){ return new Date(Date.now()+3*3600e3).toISOString().slice(0,16); };
function fmt(iso,o){ try{ return new Date(iso).toLocaleString('ar-SA-u-ca-gregory-nu-latn',Object.assign({timeZone:'Asia/Riyadh'},o)); }catch(e){ return iso; } }
function rel(iso){ var m=Math.round((Date.now()-Date.parse(iso))/60e3); if(m<1) return 'الحين'; if(m<60) return 'قبل '+m+' د'; var h=Math.round(m/60); if(h<24) return 'قبل '+h+' س'; var d=Math.round(h/24); return d<30?'قبل '+d+' يوم':fmt(iso,{day:'numeric',month:'short'}); }
function local(f){ return fmt(f+':00+03:00',{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}); }
function initial(s){ return String(s||'؟').trim().charAt(0)||'؟'; }
var IC={home:'<path d="M4 11l8-6.5 8 6.5"/><path d="M6 10v10h12V10"/>',inbox:'<path d="M4 13l2.5-7h11L20 13v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/>',folder:'<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',wallet:'<rect x="3.5" y="6" width="17" height="13" rx="3"/><path d="M16 12.5h4.5M3.5 9.5h17"/>',user:'<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5"/>',
 phone:'<path d="M6.5 4h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z"/>',wa:'<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8z"/><path d="M9 9.5c.3 2.4 2.2 4.6 5 5.3l1.3-1.3-1.8-1-1 .8a4.5 4.5 0 0 1-2-2l.8-1-1-1.8z"/>',plus:'<path d="M12 5v14M5 12h14"/>',back:'<path d="M9 6l6 6-6 6"/>',search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',note:'<path d="M5 4h10l4 4v12H5z"/><path d="M8 11h8M8 15h6"/>',bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',cal:'<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/>',tag:'<path d="M4 4h7l9 9-7 7-9-9z"/><circle cx="8.5" cy="8.5" r="1.3"/>',
 lock:'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',out:'<path d="M14 17l5-5-5-5"/><path d="M19 12H8"/><path d="M11 4H5v16h6"/>',dl:'<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',copy:'<rect x="8" y="8" width="11" height="12" rx="2"/><path d="M5 16V5a1 1 0 0 1 1-1h9"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',swap:'<path d="M7 7h11l-3-3M17 17H6l3 3"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>'};
function ic(n,s){ return el('span',{class:'ic',html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" '+(s?'style="width:'+s+'px;height:'+s+'px"':'')+'>'+IC[n]+'</svg>'}); }
function svgi(n){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+IC[n]+'</svg>'; }

// ---------- البيانات ----------
var ME=null, S=null, PJ=null, ROUTE=[], sc='mine', sf='open', sq='';
var STC=['جديد','تواصلت','عرض سعر','تم الاتفاق','مؤجل','ما تم'], PIPE=['جديد','تواصلت','عرض سعر','تم الاتفاق'];
var BCLS={'جديد':'b-new','تواصلت':'b-con','عرض سعر':'b-quo','تم الاتفاق':'b-won','مؤجل':'b-hold','ما تم':'b-lost','ملغي':'b-lost','تمت':'b-won'};
function load(force){ return Promise.all([S&&!force?S:api('GET','/api/owner/summary'),PJ&&!force?PJ:api('GET','/api/owner/projects')]).then(function(r){ if(r[0].__s===200||r[0].leads) S=r[0]; if(r[1].__s===200||r[1].projects) PJ=r[1]; }); }
var isOwner=function(){ return ME&&ME.role==='owner'; };
var meId=function(){ return S?S.me:''; };
var open=function(l){ return ['تم الاتفاق','ما تم','ملغي','تمت'].indexOf(l.status||'جديد')<0; };
function due(l){ if(!l.followUp||!open(l)) return ''; var n=ksa(); return l.followUp<n?'late':l.followUp.slice(0,10)===n.slice(0,10)?'today':'later'; }
function tname(id){ var t=((S&&S.team)||[]).filter(function(x){ return x.id===id; })[0]; return t?t.name:''; }
function lead(id){ return S.leads.filter(function(l){ return l.id===id; })[0]; }
function myLeads(){ return S.leads.filter(function(l){ return l.assignee===meId(); }); }
function badge(s){ return el('span',{class:'badge '+(BCLS[s]||''),text:s}); }
function tmpl(k,l){ var n=(l.name||'').split(' ')[0], svc=l.serviceName||l.services||'طلبك', me=ME.name||'';
  return {hello:'هلا '+n+'، معك '+me+' من شاهين ديزاين 👋 وصلنا طلبك ('+svc+') ويسعدنا نخدمك. متى يناسبك نتكلم؟',follow:'هلا '+n+'، معك '+me+' من شاهين ديزاين. حبيت أتابع معك بخصوص طلبك '+l.id+'، عندك أي استفسار؟',quote:'هلا '+n+'، جهّزنا لك عرض السعر لـ'+svc+'. أرسله لك هنا وأشرح لك التفاصيل؟',remind:l.slot?'هلا '+n+'، تذكير بموعد استشارتك مع شاهين ديزاين '+local(l.slot)+'. نشوفك على خير 🌿':'',thanks:'شكرًا '+n+' على ثقتك بشاهين ديزاين 🤍 أي شي تحتاجه أنا موجودة.'}[k]; }
function upd(id,patch,msg){ patch.id=id; buzz(); return api('POST','/api/owner/lead',patch).then(function(j){ if(j.__s!==200){ toast(j.error||'ما انحفظ',true); return; } S.leads=S.leads.map(function(x){ return x.id===id?j.lead:x; }); if(msg) toast(msg); render(); return j.lead; }); }

// ---------- التنقل ----------
var TABS=[['home','الرئيسية','home'],['leads','الطلبات','inbox'],['projects','المشاريع','folder'],['earn','مستحقاتي','wallet'],['me','حسابي','user']];
function go(r){ location.hash=r; }
function parse(){ ROUTE=(location.hash.slice(1)||'home').split('/'); }
window.addEventListener('hashchange',function(){ parse(); render(); window.scrollTo(0,0); });
function tabs(){ var t=$('tabs'); t.textContent=''; var late=S?S.leads.filter(function(l){ var d=due(l); return (d==='late'||d==='today')&&l.assignee===meId(); }).length+S.leads.filter(function(l){ return (l.status||'جديد')==='جديد'&&!l.assignee; }).length:0;
  TABS.forEach(function(x){ var on=ROUTE[0]===x[0]||(ROUTE[0]==='lead'&&x[0]==='leads')||(ROUTE[0]==='project'&&x[0]==='projects'); var b=el('button',{type:'button','aria-current':on?'page':null,onclick:function(){ buzz(); go(x[0]); }},[ic(x[2]),x[1]]); if(x[0]==='leads'&&late) b.appendChild(el('span',{class:'dot',text:String(late)})); t.appendChild(b); }); }

// ---------- الشاشات ----------
var V={};
V.home=function(m){
  var L=S.leads, me=meId(), today=ksa().slice(0,10), month=today.slice(0,7);
  var mine=myLeads(), lateN=mine.filter(function(l){ return due(l)==='late'; }).length;
  var won=mine.filter(function(l){ return l.status==='تم الاتفاق'&&String(l.updatedAt||l.at).slice(0,7)===month; }).length;
  var myP=(PJ&&PJ.projects)||[], dueSum=myP.reduce(function(a,x){ return a+Math.max(0,x.calc.remaining); },0);
  var h=new Date(Date.now()+3*3600e3).getUTCHours(), hi=h<12?'صباح الخير':h<18?'مساء الخير':'مساء النور';
  m.appendChild(el('div',{class:'hero'},[el('div',{class:'glow'}),el('div',{class:'who'},[el('div',{class:'av',text:initial(ME.name)}),el('div',null,[el('small',{text:fmt(new Date().toISOString(),{weekday:'long',day:'numeric',month:'long'})}),el('h2',{text:hi+'، '+(ME.name||'')+' 👋'})])]),
    el('div',{class:'hstats'},[el('div',null,[el('b',{text:num(mine.filter(open).length)}),el('span',{text:'طلباتي المفتوحة'})]),el('div',null,[el('b',{text:num(won)}),el('span',{text:'اتفاقات الشهر'})]),el('div',null,[el('b',{text:num(Math.round(dueSum))}),el('span',{text:'مستحق لي ر.س'})])])]));
  m.appendChild(el('div',{class:'qa'},[[ 'plus','طلب جديد',newLead],['search','بحث',function(){ go('leads'); setTimeout(function(){ var s=document.querySelector('.search input'); if(s) s.focus(); },60); }],['folder','مشاريعي',function(){ go('projects'); }],['wallet','مستحقاتي',function(){ go('earn'); }]].map(function(q){ return el('button',{type:'button',onclick:q[2]},[el('span',{html:svgi(q[0])}),q[1]]); })));
  // اليوم
  var agenda=[];
  L.forEach(function(l){ var d=due(l); if((d==='late'||d==='today')&&(l.assignee===me||!l.assignee||isOwner())) agenda.push({l:l,k:d,t:l.followUp,label:d==='late'?'متأخرة':'متابعة'}); if(l.slot&&l.slot.slice(0,10)===today&&open(l)) agenda.push({l:l,k:'book',t:l.slot,label:'استشارة'}); });
  agenda.sort(function(a,b){ return a.t<b.t?-1:1; });
  m.appendChild(el('div',{class:'sec'},[el('h2',{text:'اليوم'}),el('span',{class:'muted sm',text:agenda.length?agenda.length+' مهام':''})]));
  var c=el('div',{class:'card',style:'padding:4px 14px'});
  if(!agenda.length) c.appendChild(el('div',{class:'empty',style:'padding:22px'},[el('div',{html:svgi('check')}),el('div',{text:'ما عندك مهام متأخرة ولا متابعات اليوم 👌'})]));
  agenda.forEach(function(a){ c.appendChild(el('button',{type:'button',class:'row',onclick:function(){ go('lead/'+a.l.id); }},[el('div',{class:'av sm',text:initial(a.l.name)}),el('div',{class:'t'},[el('b',{text:a.l.name||'بدون اسم'}),el('span',{text:a.l.serviceName||a.l.source||''})]),el('div',{class:'end'},[el('span',{class:'badge '+(a.k==='late'?'b-late':a.k==='book'?'b-con':'b-gold'),text:a.label}),el('div',{style:'margin-top:4px',text:fmt(a.t+':00+03:00',{hour:'numeric',minute:'2-digit'})})])])); });
  m.appendChild(c);
  // جديد بدون إسناد
  var free=L.filter(function(l){ return (l.status||'جديد')==='جديد'&&!l.assignee; });
  if(free.length){ m.appendChild(el('div',{class:'sec'},[el('h2',{text:'طلبات جديدة تنتظر'}),el('button',{type:'button',text:'الكل',onclick:function(){ sc='free'; go('leads'); }})]));
    var fc=el('div',{class:'card',style:'padding:4px 14px'}); free.slice(0,4).forEach(function(l){ fc.appendChild(el('div',{class:'row'},[el('div',{class:'av sm',text:initial(l.name)}),el('button',{type:'button',class:'t',style:'border:0;background:none;text-align:start;padding:0',onclick:function(){ go('lead/'+l.id); }},[el('b',{text:l.name||'بدون اسم'}),el('span',{text:(l.serviceName||l.source||'')+' · '+rel(l.at)})]),el('button',{type:'button',class:'btn sm soft',text:'خذه',onclick:function(){ upd(l.id,{assign:me},'صار الطلب باسمك'); }})])); }); m.appendChild(fc); }
  // آخر الحركات
  var acts=[]; L.forEach(function(l){ (l.log||[]).forEach(function(x){ acts.push({l:l,x:x}); }); }); acts.sort(function(a,b){ return a.x.at<b.x.at?1:-1; });
  if(acts.length){ m.appendChild(el('div',{class:'sec'},[el('h2',{text:'آخر الحركات'})])); var ac=el('div',{class:'card'}); var ol=el('ol',{class:'tl'}); acts.slice(0,6).forEach(function(a){ ol.appendChild(el('li',{class:a.x.type},[el('span',{text:a.x.text+' · '+(a.l.name||'')}),el('small',{text:a.x.by+' · '+rel(a.x.at)})])); }); ac.appendChild(ol); m.appendChild(ac); }
};
V.leads=function(m){
  m.appendChild(el('h1',{class:'big',text:'الطلبات'}));
  m.appendChild(el('p',{class:'lede',text:'من الموقع والبوت واللي تضيفينه بنفسك'}));
  var srch=el('input',{type:'search',placeholder:'ابحث بالاسم أو الرقم أو الخدمة',value:sq,'aria-label':'بحث'}); m.appendChild(el('label',{class:'search'},[el('span',{html:svgi('search')}),srch]));
  m.appendChild(el('div',{class:'seg',role:'group'},[['mine','لي'],['free','غير مسندة'],['all','الكل']].map(function(x){ return el('button',{type:'button','aria-pressed':String(sc===x[0]),text:x[1],onclick:function(){ buzz(); sc=x[0]; render(); }}); })));
  var base=S.leads.filter(function(l){ return sc==='mine'?l.assignee===meId():sc==='free'?!l.assignee:true; });
  var cnt=function(f){ return base.filter(f).length; };
  var FS=[['open','المفتوحة',open],['late','متأخرة',function(l){ return due(l)==='late'; }]].concat(STC.map(function(s){ return [s,s,function(l){ return (l.status||'جديد')===s; }]; })).concat([['closed','المغلقة',function(l){ return !open(l); }]]);
  var ch=el('div',{class:'chips'}); FS.forEach(function(x){ var n=cnt(x[2]); if(!n&&sf!==x[0]&&x[0]!=='open') return; ch.appendChild(el('button',{type:'button','aria-pressed':String(sf===x[0]),onclick:function(){ buzz(); sf=x[0]; render(); }},[x[1],el('i',{text:String(n)})])); }); m.appendChild(ch);
  var list=el('div'); m.appendChild(list);
  function paint(){ list.textContent=''; var f=(FS.filter(function(x){ return x[0]===sf; })[0]||FS[0])[2], q=sq.trim();
    var R=base.filter(f).filter(function(l){ return !q||[l.name,l.wa,l.id,l.serviceName,l.source,l.details].join(' ').indexOf(q)>=0; });
    R.sort(function(a,b){ var r=function(l){ return due(l)==='late'?0:due(l)==='today'?1:(l.status||'جديد')==='جديد'?2:3; }; return r(a)-r(b)||(b.at>a.at?1:-1); });
    if(!R.length){ list.appendChild(el('div',{class:'empty'},[el('div',{html:svgi('inbox')}),el('div',{text:sc==='mine'?'ما عندك طلبات هنا. شوفي «غير مسندة» وخذي منها.':'ما فيه طلبات هنا'})])); return; }
    R.forEach(function(l){ list.appendChild(card(l)); }); }
  srch.addEventListener('input',function(){ sq=srch.value; paint(); }); paint();
  m.appendChild(el('button',{class:'fab',type:'button','aria-label':'طلب جديد',html:svgi('plus'),onclick:newLead}));
};
function card(l){ var s=l.status||'جديد', d=due(l);
  return el('div',{class:'lc'+(d==='late'?' late':''),role:'button',tabindex:'0',onclick:function(e){ if(e.target.closest('a,button')) return; go('lead/'+l.id); },onkeydown:function(e){ if(e.key==='Enter') go('lead/'+l.id); }},[
    el('div',{class:'h'},[el('div',{class:'av',text:initial(l.name)}),el('div',{class:'t'},[el('b',{text:l.name||'بدون اسم'}),el('span',{text:[l.serviceName||l.services,l.source].filter(Boolean).join(' · ')})]),el('span',{class:'muted sm',text:rel(l.at)})]),
    el('div',{class:'f'},[badge(s),l.followUp&&open(l)?el('span',{class:'badge '+(d==='late'?'b-late':'b-gold')},[ic('bell',13),local(l.followUp)]):null,l.slot&&open(l)?el('span',{class:'badge b-con'},[ic('cal',13),local(l.slot)]):null,
      l.assignee&&l.assignee!==meId()?el('span',{class:'badge',text:tname(l.assignee)}):(!l.assignee?el('span',{class:'badge b-new',text:'غير مسند'}):null),
      el('div',{class:'q'},[l.wa?el('a',{class:'qb',href:'tel:+'+l.wa,'aria-label':'اتصال',html:svgi('phone'),onclick:function(){ upd(l.id,{contact:'call'}); }}):null,l.wa?el('a',{class:'qb wa',href:'https://wa.me/'+l.wa+'?text='+encodeURIComponent(tmpl(s==='جديد'?'hello':'follow',l)),target:'_blank',rel:'noopener','aria-label':'واتساب',html:svgi('wa'),onclick:function(){ upd(l.id,{contact:'whatsapp'}); }}):null])])]); }
V.lead=function(m,id){
  var l=lead(id); if(!l){ m.appendChild(el('div',{class:'empty',text:'الطلب مو موجود'})); return; }
  var s=l.status||'جديد', pi=PIPE.indexOf(s);
  m.appendChild(el('div',{class:'bar'},[el('button',{class:'ib',type:'button','aria-label':'رجوع',html:svgi('back'),onclick:function(){ history.length>1?history.back():go('leads'); }}),el('h1',{text:l.id}),el('button',{class:'ib',type:'button','aria-label':'نسخ الرقم',html:svgi('copy'),onclick:function(){ copy('+'+l.wa,'انسخ الرقم'); }})]));
  m.appendChild(el('div',{class:'card'},[el('div',{style:'display:flex;gap:12px;align-items:center'},[el('div',{class:'av',style:'width:56px;height:56px;font-size:22px;border-radius:18px',text:initial(l.name)}),el('div',{style:'flex:1'},[el('div',{style:'font-size:20px;font-weight:700',text:l.name||'بدون اسم'}),el('div',{class:'muted sm',text:(l.serviceName||l.services||'')+' · '+rel(l.at)})]),badge(s)]),
    pi>=0?el('div',{style:'margin-top:14px'},[el('div',{class:'pipe'},PIPE.map(function(p,i){ return el('span',{class:i<=pi?(s==='تم الاتفاق'?'won':'on'):''}); })),el('div',{class:'steps'},PIPE.map(function(p,i){ return i===pi?el('b',{text:p}):el('span',{text:p}); }))]):null,
    el('div',{class:'pre',style:'margin-top:12px'},STC.concat(l.kind==='booking'?['تمت','ملغي']:[]).filter(function(x){ return x!==s; }).map(function(x){ return el('button',{type:'button',text:'← '+x,onclick:function(){ if(x==='ما تم'||x==='ملغي'){ if(!confirm('تغيّرين الحالة إلى «'+x+'»؟')) return; } upd(id,{status:x},'صارت الحالة: '+x).then(function(){ if(x==='تم الاتفاق') toast('مبروك! 🎉 المدير يحوّله لمشروع'); }); }}); }))]));
  // التفاصيل
  var rows=[['phone','الجوال',l.wa?'+'+l.wa:''],['tag','المصدر',l.source],['cal','الموعد',l.slot?local(l.slot):l.timeline],['wallet','الميزانية',l.budget],['user','الجهة',l.org],['note','التفاصيل',l.details],['note','ملاحظة',l.note]].filter(function(r){ return r[2]; });
  if(rows.length) m.appendChild(el('div',{class:'card'},[el('dl',{class:'kv'},[].concat.apply([],rows.map(function(r){ return [el('dt',null,[ic(r[0],16),r[1]]),el('dd',{class:r[0]==='phone'?'ltr':null,style:r[0]==='phone'?'text-align:right':null,text:r[2]})]; })))]));
  // المتابعة والإسناد
  var fu=el('input',{type:'datetime-local',value:l.followUp||''}); fu.addEventListener('change',function(){ upd(id,{followUp:fu.value},'انحفظ موعد المتابعة'); });
  function plus(h,t){ return el('button',{type:'button',text:t,onclick:function(){ var d=new Date(Date.now()+3*3600e3+h*3600e3); if(h>=24) d.setUTCHours(10,0,0,0); upd(id,{followUp:d.toISOString().slice(0,16)},'تذكير '+t); }}); }
  var as=el('select'); as.appendChild(el('option',{value:'',text:'غير مسند'})); (S.team||[]).forEach(function(t){ var o=el('option',{value:t.id,text:t.name+(t.id===meId()?' (أنا)':'')}); if(t.id===l.assignee) o.selected=true; as.appendChild(o); }); as.addEventListener('change',function(){ upd(id,{assign:as.value},'تم الإسناد'); });
  m.appendChild(el('div',{class:'sec'},[el('h2',{text:'المتابعة'})]));
  m.appendChild(el('div',{class:'card'},[el('label',{class:'f'},[el('span',{text:'ذكّرني'}),fu]),el('div',{class:'pre mb'},[plus(1,'بعد ساعة'),plus(3,'بعد ٣ ساعات'),plus(24,'بكرة ١٠ص'),plus(72,'بعد ٣ أيام'),l.followUp?el('button',{type:'button',text:'إلغاء التذكير',onclick:function(){ upd(id,{followUp:''},'انلغى التذكير'); }}):null]),el('label',{class:'f',style:'margin:0'},[el('span',{text:'المسؤول'}),as])]));
  // السجل
  m.appendChild(el('div',{class:'sec'},[el('h2',{text:'السجل'}),el('button',{type:'button',text:'+ ملاحظة',onclick:function(){ noteSheet(id); }})]));
  var log=(l.log||[]).slice().reverse();
  m.appendChild(el('div',{class:'card'},[log.length?el('ol',{class:'tl'},log.map(function(x){ return el('li',{class:x.type},[el('span',{text:x.text}),el('small',{text:x.by+' · '+rel(x.at)})]); })):el('div',{class:'muted sm',text:'ما فيه حركات لسا. أول تواصل ينسجل هنا.'})]));
  m.appendChild(el('div',{style:'height:70px'}));
  // شريط الإجراءات
  var bar=el('div',{class:'act'},[l.wa?el('a',{class:'btn',href:'tel:+'+l.wa,onclick:function(){ upd(id,{contact:'call'}); }},[ic('phone'),'اتصال']):null,l.wa?el('button',{type:'button',class:'btn gold',onclick:function(){ waSheet(l); }},[ic('wa'),'واتساب']):null,el('button',{type:'button',class:'btn ghost',onclick:function(){ noteSheet(id); }},[ic('note'),'ملاحظة'])]);
  m.appendChild(bar);
};
function sheet(title,kids){ close(); var bg=el('div',{class:'sheet-bg',id:'sh',onclick:function(e){ if(e.target===bg) close(); }},[el('div',{class:'sheet',role:'dialog','aria-modal':'true','aria-label':title},[el('div',{class:'grab'}),el('h3',{text:title})].concat(kids))]); document.body.appendChild(bg); var f=bg.querySelector('textarea,input'); if(f&&matchMedia('(min-width:700px)').matches) f.focus(); return bg; }
function close(){ var s=$('sh'); if(s) s.remove(); }
function waSheet(l){ var T=[['hello','ترحيب','أول تواصل بعد ما يوصل الطلب'],['follow','متابعة','لو مر وقت وما رد'],['quote','عرض سعر','لما يكون العرض جاهز']].concat(l.slot?[['remind','تذكير بالموعد','قبل الاستشارة']]:[]).concat([['thanks','شكر','بعد الاتفاق أو التسليم'],['free','رسالة فاضية','تكتبينها بنفسك']]);
  sheet('واتساب '+(l.name||''),T.map(function(t){ return el('a',{class:'list-btn',href:'https://wa.me/'+l.wa+(t[0]==='free'?'':'?text='+encodeURIComponent(tmpl(t[0],l))),target:'_blank',rel:'noopener',onclick:function(){ close(); upd(l.id,{contact:'whatsapp'}); }},[el('span',{class:'qb wa',html:svgi('wa')}),el('span',null,[t[1],el('small',{text:t[2]})])]); })); }
function noteSheet(id){ var t=el('textarea',{rows:4,placeholder:'وش صار في المكالمة؟ وش اتفقتوا عليه؟'}); var nr=el('label',{style:'display:flex;gap:8px;align-items:center;margin-bottom:12px;font-size:14px'},[el('input',{type:'checkbox',id:'nr'}),'اتصلت وما رد']);
  sheet('ملاحظة',[el('label',{class:'f'},[t]),nr,el('button',{type:'button',class:'btn block',text:'حفظ',onclick:function(){ var p={}; if(t.value.trim()) p.addNote=t.value.trim(); if($('nr').checked) p.contact='noanswer'; if(!p.addNote&&!p.contact) return; close(); upd(id,p,'انحفظ'); }})]); }
function newLead(){ var f={}; function inp(k,label,o){ o=o||{}; var i=el(o.tag||'input',{type:o.type||'text',placeholder:o.ph||'',inputmode:o.im||null,dir:o.dir||null,rows:o.rows||null}); f[k]=i; return el('label',{class:'f'},[el('span',{text:label}),i]); }
  var src=el('select',null,['اتصال','واتساب','انستقرام','تيك توك','سناب','زيارة','إحالة','أخرى'].map(function(x){ return el('option',{text:x}); })); var ref=el('input',{type:'checkbox'});
  sheet('طلب جديد',[inp('name','اسم العميل'),inp('wa','الجوال',{ph:'05xxxxxxxx',im:'tel',dir:'ltr'}),inp('service','وش يبغى؟',{ph:'مثلًا: تطبيق حجوزات لصالون'}),el('label',{class:'f'},[el('span',{text:'من وين جا؟'}),src]),inp('details','تفاصيل',{tag:'textarea',rows:3}),
    el('label',{style:'display:flex;gap:8px;align-items:center;margin-bottom:14px;font-size:14px'},[ref,'العميل من إحالتي (تنحسب لي نسبته)']),
    el('button',{type:'button',class:'btn block gold',text:'إضافة',onclick:function(){ api('POST','/api/owner/lead/new',{name:f.name.value,wa:f.wa.value,service:f.service.value,details:f.details.value,source:src.value,referred:ref.checked}).then(function(j){ if(j.__s!==200) return toast(j.error||'ما انحفظ',true); S.leads.unshift(j.lead); close(); buzz(); toast('انضاف الطلب'); go('lead/'+j.lead.id); }); }})]); }
function copy(t,msg){ (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){ toast(msg||'انسخ'); },function(){ prompt('انسخ:',t); }); }

V.projects=function(m){
  var P=(PJ&&PJ.projects)||[];
  m.appendChild(el('h1',{class:'big',text:isOwner()?'المشاريع':'مشاريعي'}));
  m.appendChild(el('p',{class:'lede',text:isOwner()?'كل المشاريع ونسب الشركاء':'المشاريع اللي شاركتي فيها ونسبتك من كل واحد'}));
  if(!P.length){ m.appendChild(el('div',{class:'empty'},[el('div',{html:svgi('folder')}),el('div',{text:'ما فيه مشاريع مسجلة باسمك لسا. لما يتحول عميل جبتيه لمشروع، يطلع هنا.'})])); return; }
  P.forEach(function(x){ var c=x.calc, pct=c.due?Math.min(1,c.paid/c.due):0, R=22, L=2*Math.PI*R;
    m.appendChild(el('button',{type:'button',class:'lc',onclick:function(){ go('project/'+x.id); }},[el('div',{class:'h'},[
      el('span',{html:'<svg class="ring" viewBox="0 0 54 54"><circle class="bg" cx="27" cy="27" r="'+R+'"/><circle class="fg" cx="27" cy="27" r="'+R+'" stroke-dasharray="'+L+'" stroke-dashoffset="'+(L*(1-pct))+'" transform="rotate(-90 27 27)"/></svg>'}),
      el('div',{class:'t'},[el('b',{text:x.title}),el('span',{text:x.client+' · '+x.type})]),el('span',{class:'badge '+(x.status==='تم التسليم'?'b-won':x.status==='قيد التنفيذ'?'b-con':'b-hold'),text:x.status})]),
      el('div',{class:'f'},[el('span',{class:'badge b-gold',text:'نسبتك '+x.pct+'٪'}),x.referred?el('span',{class:'badge',text:'إحالة'}):null,el('span',{class:'muted sm',style:'margin-inline-start:auto',text:'مستحقك '+sar(c.due)+' · الباقي '+sar(c.remaining)})])])); });
};
V.project=function(m,id){
  var x=((PJ&&PJ.projects)||[]).filter(function(y){ return y.id===id; })[0]; if(!x){ m.appendChild(el('div',{class:'empty',text:'المشروع مو موجود'})); return; } var c=x.calc;
  m.appendChild(el('div',{class:'bar'},[el('button',{class:'ib',type:'button','aria-label':'رجوع',html:svgi('back'),onclick:function(){ history.length>1?history.back():go('projects'); }}),el('h1',{text:x.title}),el('span',{class:'ib'})]));
  m.appendChild(el('div',{class:'card'},[el('div',{class:'muted sm',text:'مستحقك من المشروع'}),el('div',{class:'money'},[num(c.due),el('small',{text:' ر.س'})]),el('div',{class:'muted sm',text:'انصرف '+sar(c.paid)+' · الباقي '+sar(c.remaining)}),
    c.collected<x.value?el('div',{class:'badge b-gold',style:'margin-top:8px',text:'لما يكتمل التحصيل يصير '+sar(c.expected)}):null]));
  m.appendChild(el('div',{class:'card'},[el('dl',{class:'kv'},[['user','العميل',x.client],['tag','النوع',x.type],['clock','الحالة',x.status],['spark','دورك',(x.roles||[]).join('، ')],['cal','البداية',x.start],['check','التسليم',x.delivered]].filter(function(r){ return r[2]; }).reduce(function(a,r){ return a.concat([el('dt',null,[ic(r[0],16),r[1]]),el('dd',{text:r[2]})]); },[]))]));
  m.appendChild(el('div',{class:'sec'},[el('h2',{text:'كشف الحساب'})]));
  var rows=[['المحصّل من العميل',sar(c.collected)],['− التكاليف التشغيلية',sar(x.costs)],['− الضرائب',sar(x.taxes)],['= الصافي',sar(c.net),1],['× نسبتك',x.pct+'٪'],['= مستحقك',sar(c.due),1],['− انصرف لك',sar(c.paid)],['= الباقي',sar(c.remaining),1]];
  m.appendChild(el('div',{class:'card'},[el('table',{class:'st'},rows.map(function(r){ return el('tr',{class:r[2]?'hl':''},[el('td',{text:r[0]}),el('td',{text:r[1]})]); }))]));
  if((x.payouts||[]).length){ m.appendChild(el('div',{class:'sec'},[el('h2',{text:'اللي انصرف لك'})])); var pc=el('div',{class:'card',style:'padding:4px 14px'}); x.payouts.forEach(function(p){ pc.appendChild(el('div',{class:'row'},[el('div',{class:'av sm',html:svgi('check')}),el('div',{class:'t'},[el('b',{text:sar(p.amount)}),el('span',{text:p.note||'تحويل'})]),el('div',{class:'end',text:p.date})])); }); m.appendChild(pc); }
  m.appendChild(el('div',{class:'sec'},[el('h2',{text:'التحديثات'}),el('button',{type:'button',text:'+ تحديث',onclick:function(){ var t=el('textarea',{rows:4,placeholder:'وش خلصتي في المشروع؟'}); sheet('تحديث على المشروع',[el('label',{class:'f'},[t]),el('button',{type:'button',class:'btn block',text:'حفظ',onclick:function(){ if(!t.value.trim()) return; api('POST','/api/owner/project/note',{id:id,text:t.value}).then(function(j){ if(j.__s!==200) return toast(j.error,true); PJ.projects=PJ.projects.map(function(y){ return y.id===id?j.project:y; }); close(); toast('انحفظ'); render(); }); }})]); }})]));
  m.appendChild(el('div',{class:'card'},[el('ol',{class:'tl'},(x.log||[]).slice().reverse().map(function(r){ return el('li',{class:'note'},[el('span',{text:r.text}),el('small',{text:r.by+' · '+rel(r.at)})]); }))]));
};
V.earn=function(m){
  var P=(PJ&&PJ.projects)||[], tot=function(f){ return P.reduce(function(a,x){ return a+f(x); },0); };
  var dueT=tot(function(x){ return x.calc.due; }), paidT=tot(function(x){ return x.calc.paid; }), remT=tot(function(x){ return Math.max(0,x.calc.remaining); }), expT=tot(function(x){ return Math.max(0,x.calc.expected-x.calc.due); });
  m.appendChild(el('h1',{class:'big',text:'مستحقاتي'}));
  m.appendChild(el('p',{class:'lede',text:'نسبتك من صافي المشاريع حسب الاتفاقية'}));
  m.appendChild(el('div',{class:'hero'},[el('div',{class:'glow'}),el('small',{text:'الباقي لك'}),el('div',{class:'money',style:'color:#F4EEE3'},[num(Math.round(remT)),el('small',{style:'color:#CBBFA9',text:' ر.س'})]),
    el('div',{class:'hstats'},[el('div',null,[el('b',{text:num(Math.round(dueT))}),el('span',{text:'إجمالي المستحق'})]),el('div',null,[el('b',{text:num(Math.round(paidT))}),el('span',{text:'انصرف لك'})]),el('div',null,[el('b',{text:num(Math.round(expT))}),el('span',{text:'متوقع قادم'})])])]));
  // حسب الشهر: المستحق موزّع على تواريخ التحصيل
  var months=[]; for(var i=5;i>=0;i--){ var d=new Date(Date.now()+3*3600e3); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth()-i); months.push([d.toISOString().slice(0,7),0]); }
  P.forEach(function(x){ var c=x.calc; if(!c.collected) return; (x.collections||[]).forEach(function(col){ var mo=months.filter(function(mm){ return mm[0]===String(col.date).slice(0,7); })[0]; if(mo) mo[1]+=c.due*col.amount/c.collected; }); });
  var mx=Math.max.apply(null,months.map(function(x){ return x[1]; }).concat([1]));
  m.appendChild(el('div',{class:'sec'},[el('h2',{text:'آخر ٦ أشهر'})]));
  m.appendChild(el('div',{class:'card'},[el('div',{class:'chart'},months.map(function(x){ return el('div',null,[el('em',{text:x[1]?num(Math.round(x[1])):''}),el('i',{style:'height:'+Math.max(4,Math.round(86*x[1]/mx))+'px'}),el('span',{text:fmt(x[0]+'-15T12:00:00Z',{month:'short'})})]); }))]));
  var pays=[]; P.forEach(function(x){ (x.payouts||[]).forEach(function(p){ pays.push({p:p,x:x}); }); }); pays.sort(function(a,b){ return a.p.date<b.p.date?1:-1; });
  m.appendChild(el('div',{class:'sec'},[el('h2',{text:'التحويلات'})]));
  var pc=el('div',{class:'card',style:'padding:4px 14px'}); if(!pays.length) pc.appendChild(el('div',{class:'muted sm',style:'padding:14px 0',text:'ما فيه تحويلات لسا'}));
  pays.forEach(function(a){ pc.appendChild(el('button',{type:'button',class:'row',onclick:function(){ go('project/'+a.x.id); }},[el('div',{class:'av sm',html:svgi('check')}),el('div',{class:'t'},[el('b',{text:sar(a.p.amount)}),el('span',{text:a.x.title})]),el('div',{class:'end',text:a.p.date})])); }); m.appendChild(pc);
};
V.me=function(m){
  m.appendChild(el('h1',{class:'big',text:'حسابي'}));
  m.appendChild(el('div',{class:'card',style:'display:flex;gap:14px;align-items:center'},[el('div',{class:'av',style:'width:60px;height:60px;font-size:24px;border-radius:20px',text:initial(ME.name)}),el('div',null,[el('div',{style:'font-size:19px;font-weight:700',text:ME.name||''}),el('div',{class:'muted sm',text:isOwner()?'المالك (معاينة تطبيق الفريق)':'شريكة أعمال · شاهين ديزاين'})])]));
  var nb=el('button',{type:'button',class:'list-btn',onclick:pushToggle},[el('span',{class:'qb',html:svgi('bell')}),el('span',{id:'pushLbl'},['التنبيهات',el('small',{text:'إشعار مع كل طلب جديد أو إسناد'})])]);
  var items=[nb,
    !isOwner()?el('button',{type:'button',class:'list-btn',onclick:pwSheet},[el('span',{class:'qb',html:svgi('lock')}),el('span',null,['تغيير كلمة المرور',el('small',{text:'لحماية حسابك'})])]):null,
    !standalone?el('button',{type:'button',class:'list-btn',onclick:install},[el('span',{class:'qb',html:svgi('dl')}),el('span',null,['ثبّت التطبيق على الجوال',el('small',{text:'يفتح بشاشة كاملة من الأيقونة'})])]):null,
    isOwner()?el('a',{class:'list-btn',href:'/admin',style:'text-decoration:none'},[el('span',{class:'qb',html:svgi('swap')}),el('span',null,['ارجع للوحة التحكم',el('small',{text:'إدارة الموقع والمتجر والموظفين'})])]):null,
    el('button',{type:'button',class:'list-btn',style:'color:var(--bad)',onclick:logout},[el('span',{class:'qb',style:'background:var(--bad-s);color:var(--bad)',html:svgi('out')}),el('span',null,['تسجيل خروج'])])];
  m.appendChild(el('div',null,items));
  m.appendChild(el('p',{class:'muted sm',style:'text-align:center;margin-top:24px',text:'فريق شاهين ديزاين · بياناتك محمية ودخولك ينتهي بعد ٢٤ ساعة'}));
  pushLabel();
};
function pwSheet(){ var o=el('input',{type:'password',autocomplete:'current-password'}), n=el('input',{type:'password',autocomplete:'new-password'}), n2=el('input',{type:'password',autocomplete:'new-password'});
  sheet('تغيير كلمة المرور',[el('label',{class:'f'},[el('span',{text:'الحالية'}),o]),el('label',{class:'f'},[el('span',{text:'الجديدة (٨ أو أكثر)'}),n]),el('label',{class:'f'},[el('span',{text:'أعيدي الجديدة'}),n2]),
    el('button',{type:'button',class:'btn block',text:'حفظ',onclick:function(){ if(n.value!==n2.value) return toast('الكلمتين مو متطابقة',true); api('POST','/api/me/password',{old:o.value,password:n.value}).then(function(j){ if(j.__s!==200) return toast(j.error||'ما تغيّرت',true); close(); toast('تغيّرت كلمة المرور ✓'); }); }})]); }
function logout(){ if(!confirm('تسجيل خروج؟')) return; Promise.all([api('POST','/api/logout?c=staff'),isOwner()?api('POST','/api/logout'):null]).then(function(){ location.href='/admin'; }); }

// ---------- التثبيت والتنبيهات ----------
var standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true, ios=/iphone|ipad|ipod/i.test(navigator.userAgent), deferred=null;
window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); deferred=e; });
function install(){ if(deferred){ deferred.prompt(); deferred=null; } else alert(ios?'من سفاري: زر المشاركة ⬆︎ ثم «إضافة إلى الشاشة الرئيسية».':'من قائمة المتصفح اختاري «تثبيت التطبيق».'); }
var pushOk='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
if('serviceWorker' in navigator) navigator.serviceWorker.register('/admin-sw.js',{scope:'/admin'}).catch(function(){});
function b64(u){ var p='='.repeat((4-u.length%4)%4), s=atob((u+p).replace(/-/g,'+').replace(/_/g,'/')), a=new Uint8Array(s.length); for(var i=0;i<s.length;i++) a[i]=s.charCodeAt(i); return a; }
function subscribe(test){ return Promise.all([navigator.serviceWorker.ready,api('GET','/api/push/key')]).then(function(r){ return r[0].pushManager.getSubscription().then(function(o){ return o||r[0].pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(r[1].key)}); }); }).then(function(sub){ var j=sub.toJSON(); return api('POST','/api/push/subscribe',{sub:{endpoint:j.endpoint,keys:j.keys}}).then(function(){ if(test) return api('POST','/api/push/test',{endpoint:j.endpoint}); }); }); }
function pushLabel(){ var l=$('pushLbl'); if(!l) return; var st=!pushOk?'غير مدعومة هنا'+(ios&&!standalone?' (ثبّتي التطبيق أول)':''):Notification.permission==='granted'?'شغالة ✓':Notification.permission==='denied'?'مقفلة من إعدادات الجوال':'اضغطي للتفعيل'; l.lastChild.textContent=st; }
function pushToggle(){ if(!pushOk) return toast(ios&&!standalone?'ثبّتي التطبيق على الشاشة الرئيسية أول':'جهازك ما يدعمها',true); if(Notification.permission==='denied') return toast('فعّليها من الإعدادات ← الإشعارات',true); Notification.requestPermission().then(function(p){ if(p!=='granted') return; subscribe(true).then(function(){ toast('بيوصلك إشعار تجربة'); pushLabel(); },function(){ toast('ما قدرت أفعّلها',true); }); }); }
function autoPush(){ if(pushOk&&Notification.permission==='granted') subscribe(false).catch(function(){}); }
if('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message',function(e){ if(e.data&&e.data.type==='refresh') refresh(); });

// ---------- الرسم ----------
function render(){ var m=$('app'); var y=ROUTE[0]==='lead'||ROUTE[0]==='project'?0:null; m.textContent=''; var page=el('div',{class:'page'}); m.appendChild(page);
  var v=V[ROUTE[0]]||V.home; v(page,ROUTE[1]); tabs(); $('tabs').hidden=y===0; if(y===0) window.scrollTo(0,0); }
document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
function refresh(){ return load(true).then(render); }
// اسحب للتحديث
(function(){ var y0=null, p=$('ptr'); document.addEventListener('touchstart',function(e){ y0=window.scrollY===0?e.touches[0].clientY:null; },{passive:true});
  document.addEventListener('touchmove',function(e){ if(y0==null) return; var d=e.touches[0].clientY-y0; if(d>0){ p.style.height=Math.min(60,d/2)+'px'; p.textContent=d>110?'اتركي للتحديث':'اسحب للتحديث'; } },{passive:true});
  document.addEventListener('touchend',function(){ if(y0==null) return; var go2=parseInt(p.style.height||0,10)>=55; p.style.height='0'; y0=null; if(go2){ buzz(); refresh().then(function(){ toast('تحدّث'); }); } }); })();
setInterval(function(){ if(document.visibilityState==='visible'&&!$('sh')&&!document.querySelector('input:focus,textarea:focus,select:focus')) refresh(); },60000);
document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible'&&!$('sh')) refresh(); });

api('GET','/api/me').then(function(me){ ME=me; if(!me.ok) return; if(me.role==='owner') ME.name='عبدالرحمن'; parse(); return load(true).then(function(){ render(); autoPush(); }); });
})();
</script>
</body>
</html>`;
