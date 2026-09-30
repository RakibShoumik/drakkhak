/* ===========================================================
   UI — the shell.

   Four places and a gear: Start, Practice, Map, Progress, and
   Settings. A bottom tab bar on phones, a sidebar on a desk. The top
   bar carries two numbers only, coins and streak. A set takes the
   window (no sidebar, no tabs) but the top bar stays, so the coins
   have somewhere to land.

   The pages themselves live in ui-pages.js, map.js, research.js and
   runner.js; this file owns routing, the chrome, sheets and toasts.
   =========================================================== */
var UI = (function(){

var route='start', param=null, viewEl=null, built=false;
var ownHash=false;
var holdCoins=null;           /* what the coin box keeps showing while coins fly in */
var ACT={};

var TABS=[
  {id:'start',    en:'Start',    bn:'শুরু'},
  {id:'practice', en:'Practice', bn:'অনুশীলন'},
  {id:'map',      en:'Map',      bn:'ম্যাপ'},
  {id:'progress', en:'Progress', bn:'অগ্রগতি'}
];
/* routes that belong to a tab, for highlighting */
var PARENT={research:'settings', run:'practice'};
var HASHED={start:1, practice:1, map:1, progress:1, settings:1, research:1};

function h(s){ return U.h(s); }
function el(id){ return document.getElementById(id); }
function views(){
  return {start:PAGES.start, welcome:PAGES.welcome, practice:PAGES.practice, map:MAP.view,
          progress:PAGES.progress, settings:PAGES.settings, research:RESEARCH.view, run:RUN.render};
}

/* ---------- moving about ---------- */
function go(r, p){
  if(r==='today'||r==='home') r='start';
  if(!views()[r]) r='start';
  if(RUN.active() && r!=='run') RUN.stop();
  if(!DB.state().onboarded && r!=='run' && r!=='welcome' && r!=='research') r='welcome';
  closeSheet(true);
  route=r; param=(p===undefined?null:p);
  if(HASHED[r]) writeHash();
  render({enter:true});
  window.scrollTo(0,0);
}
function current(){ return route; }
function writeHash(){
  var want='#/'+route+(param?'/'+encodeURIComponent(param):'');
  if(location.hash!==want){ ownHash=true; location.hash=want; }
}
function readHash(){
  var m=/^#\/([a-z]+)(?:\/(.*))?$/.exec(location.hash||'');
  return m ? {r:m[1], p:m[2]?decodeURIComponent(m[2]):null} : null;
}

/* ---------- painting ---------- */
function build(){
  viewEl=el('view');
  built=true;
  el('brand').innerHTML=CHARTS.logo(null,'brand-logo')+
    '<span class="brand-txt"><span class="brand-name">Drakkhak</span>'+
    '<span class="brand-sub">'+L('Board-level MCQ practice from the NCTB books','NCTB বই থেকে বোর্ড-মানের MCQ অনুশীলন')+'</span></span>';
  el('brandPhone').innerHTML=CHARTS.logo(null,'brand-logo')+'<span class="brand-name">Drakkhak</span>';
  el('brand').onclick=el('brandPhone').onclick=function(){ go('start'); };
  el('sideGear').innerHTML=CHARTS.icon('settings')+'<span>'+L('Settings','সেটিংস')+'</span>';
  el('sideGear').onclick=function(){ go('settings'); };
  el('coinBox').onclick=function(){ PAGES.wallet(); };
  el('coinBox').setAttribute('aria-label', L('Wallet','ওয়ালেট'));
  el('nav').innerHTML=TABS.map(function(t){
    return '<button type="button" class="tab" data-go="'+t.id+'" data-tab="'+t.id+'">'+CHARTS.icon(t.id)+'<span>'+L(t.en,t.bn)+'</span></button>';
  }).join('');
  el('tabbar').innerHTML=TABS.map(function(t){
    return '<button type="button" class="tab" data-go="'+t.id+'" data-tab="'+t.id+'">'+CHARTS.icon(t.id)+'<span>'+L(t.en,t.bn)+'</span></button>';
  }).join('')+
    '<button type="button" class="tab tab-gear" data-go="settings" data-tab="settings" aria-label="'+L('Settings','সেটিংস')+'">'+CHARTS.icon('settings')+'</button>';
}

function render(o){
  if(!built) build();
  var v=views()[route];
  viewEl.className='view v-'+route+(o&&o.enter?' enter':'');
  viewEl.innerHTML=v(param);
  var focus = route==='run' || route==='welcome';
  document.body.classList.toggle('focus', focus);
  document.body.classList.toggle('bare', route==='welcome');
  refreshNav();
  paintChrome();
  if(route==='run') RUN.afterPaint();
  else if(route==='map') MAP.afterPaint(param, !!(o&&o.enter));
  else if(PAGES.afterPaint) PAGES.afterPaint(route);
}
/* repaint without a fresh entrance, for the question screen */
function repaintView(){
  if(!built) return;
  var v=views()[route];
  viewEl.innerHTML=v(param);
  paintChrome();
  if(route==='run') RUN.afterPaint();
}

function refreshNav(){
  var cur=PARENT[route]||route;
  var btns=document.querySelectorAll('[data-tab]');
  for(var i=0;i<btns.length;i++){
    var on=btns[i].getAttribute('data-tab')===cur;
    btns[i].classList.toggle('on', on);
    if(on) btns[i].setAttribute('aria-current','page'); else btns[i].removeAttribute('aria-current');
  }
  var g=el('sideGear'); if(g) g.classList.toggle('on', cur==='settings');
}

/* the subjects under the tabs on a desk: a name, a thin bar, its % done */
function paintSubjects(){
  var box=el('subjBox'); if(!box) return;
  var sc=DB.state().scope;
  box.innerHTML='<div class="label">'+L('Subjects','বিষয়')+'</div>'+ICE.subjects.map(function(sj){
    var x=PLAN.subject(sj.id), p=PLAN.pct(x);
    return '<button type="button" class="sj'+(route==='practice'&&sc.kind==='subject'&&sc.sj===sj.id?' on':'')+'" data-act="openSubject" data-arg="'+sj.id+'" style="--sc:var(--s-'+sj.id+')">'+
      '<span class="sj-top"><span class="sj-n">'+h(ICE.subjname(sj))+'</span><span class="sj-p">'+N(Math.floor(p*100))+'%</span></span>'+
      CHARTS.bar(p,'thin sc')+'</button>';
  }).join('');
}

/* the top bar: coins and streak, nothing else */
var lastCoins=null;
function paintChrome(){
  if(!built) return;
  var c = holdCoins!==null ? holdCoins : GAME.coins();
  var cb=el('coinBox'), sb=el('streakBox');
  /* only the number is rewritten, so a coin in flight keeps its target */
  var cn=cb.querySelector('b');
  if(cn) cn.textContent=U.num(c);
  else cb.innerHTML='<svg class="ci fly-target" viewBox="0 0 32 32"><use href="#coinSym"/></svg><b>'+U.num(c)+'</b>';
  if(lastCoins!==null && c!==lastCoins && holdCoins===null) FX.pop(cb, 'fx-bump');
  lastCoins=c;
  var st=DB.liveStreak();
  sb.innerHTML='<span class="flame'+(st?' on':'')+'" aria-hidden="true">'+
    '<svg viewBox="0 0 24 24"><path d="M12.5 3c.4 3.2-1.3 4.6-2.8 6.3C8.3 10.8 7 12.4 7 14.8 7 18 9.2 21 12 21s5-2.3 5-5.4c0-2.5-1.3-4-2.3-5.2-.5 1.2-1.1 1.9-1.9 2.2.5-2.4.5-6.3-.3-9.6Z"/></svg></span>'+
    '<b>'+N(st)+'</b><span class="sl">'+L(st===1?'day':'days','দিন')+'</span>';
  sb.setAttribute('title', L('Days in a row','টানা দিন'));
  if(route!=='run') paintSubjects();
}
function holdChrome(n){ holdCoins=(n===null||n===undefined)?null:n; paintChrome(); }

/* ---------- theme ---------- */
function applyTheme(){
  var night=DB.state().theme==='night';
  document.documentElement.setAttribute('data-theme', night?'night':'day');
  var m=document.querySelector('meta[name="theme-color"]');
  if(m) m.setAttribute('content', night?'#16150F':'#F5F4ED');
}
function flip(key){
  var s=DB.state();
  if(key==='night'){ s.theme = s.theme==='night' ? 'day' : 'night'; applyTheme(); }
  else if(key==='sound'){ s.sound=!s.sound; FX.setMuted(!s.sound); if(s.sound) FX.play('next'); }
  else if(key==='calm'){ s.settings.calm=!s.settings.calm; document.documentElement.classList.toggle('calm', s.settings.calm); }
  DB.save();
  if(route==='settings') render();
}

/* ---------- toasts ---------- */
var toastT=null;
function toast(msg, ms){
  var host=el('toastHost'); if(!host) return;
  host.innerHTML='<div class="toast" role="status">'+msg+'</div>';
  if(toastT) clearTimeout(toastT);
  toastT=setTimeout(function(){
    var t=host.firstChild;
    if(t){ t.classList.add('out'); setTimeout(function(){ host.innerHTML=''; }, 260); }
  }, ms||3200);
}

/* ---------- sheets ---------- */
function sheet(inner){
  var host=el('sheetHost');
  host.innerHTML='<div class="sheet" data-act="sheetBg"><div class="panel" role="dialog" aria-modal="true">'+
    '<button type="button" class="close" data-act="closeSheet" aria-label="'+L('Close','বন্ধ করো')+'">&times;</button>'+inner+'</div></div>';
  var f=host.querySelector('button.btn,button:not(.close)');
  if(f && f.focus) try{ f.focus({preventScroll:true}); }catch(e){}
}
function closeSheet(instant){
  var host=el('sheetHost'); if(!host||!host.firstChild) return;
  if(instant){ host.innerHTML=''; return; }
  var s=host.firstChild; s.classList.add('out');
  setTimeout(function(){ if(host.firstChild===s) host.innerHTML=''; }, 220);
}
function sheetOpen(){ var host=el('sheetHost'); return !!(host && host.firstChild); }

/* a newly earned badge: a toast and a chime */
function badgeToast(list){
  if(!list || !list.length) return;
  FX.play('badge');
  toast('<b>'+L('New badge','নতুন ব্যাজ')+'</b> &middot; '+h(STATS.bname(list[0]))+
    (list.length>1?L(' (and '+(list.length-1)+' more)',' (আরও '+N(list.length-1)+'টি)'):''), 4200);
}

/* ---------- clicks ---------- */
function onClick(e){
  var t=e.target, a=t.closest ? t.closest('[data-act],[data-go]') : null;
  if(!a) return;
  if(a.hasAttribute('data-act')){
    var name=a.getAttribute('data-act');
    if(name==='sheetBg' && e.target!==a) return;            /* only a click on the backdrop */
    if(ACT[name]){ e.preventDefault(); ACT[name](a.getAttribute('data-arg'), a, e); }
    return;
  }
  e.preventDefault();
  go(a.getAttribute('data-go'), a.getAttribute('data-p'));
}
function onChange(e){
  var t=e.target, a=t.closest ? t.closest('[data-change]') : null;
  if(!a) return;
  var fn=ACT[a.getAttribute('data-change')];
  if(fn) fn(a.value, a, e);
}
function act(name, fn){ ACT[name]=fn; }

act('closeSheet', function(){ closeSheet(); });
act('sheetBg', function(){ closeSheet(); });
act('openSubject', function(id){
  var s=DB.state(); s.scope={kind:'subject', sj:id, ch:''}; DB.save();
  go('practice');
});

function init(){
  build();
  document.addEventListener('click', onClick);
  document.addEventListener('change', onChange);
  window.addEventListener('hashchange', function(){
    if(ownHash){ ownHash=false; return; }
    var r=readHash();
    if(r && r.r!=='run') go(r.r, r.p);
  });
}

/* the keys that work on every screen */
function shortcuts(){
  var rows=[
    ['A B C D · 1–4', L('Answer a question','প্রশ্নের উত্তর দাও')],
    ['Space', L('Next question','পরের প্রশ্ন')],
    ['E', L('Show the explanation','ব্যাখ্যা দেখাও')],
    ['S', L('Skip (in a full paper)','বাদ দাও (পুরো পরীক্ষায়)')],
    ['N', L('Night mode','রাতের মোড')],
    ['M', L('Sound on or off','শব্দ চালু বা বন্ধ')],
    ['?', L('This list','এই তালিকা')]
  ];
  sheet('<h2>'+L('Keyboard shortcuts','কীবোর্ড শর্টকাট')+'</h2><div class="kbdlist">'+
    rows.map(function(r){ return '<span><kbd>'+h(r[0])+'</kbd></span><span>'+h(r[1])+'</span>'; }).join('')+'</div>');
}

return {init:init, go:go, current:current, readHash:readHash, render:render, repaintView:repaintView,
        paintChrome:paintChrome, holdChrome:holdChrome, applyTheme:applyTheme, flip:flip,
        toast:toast, sheet:sheet, closeSheet:closeSheet, sheetOpen:sheetOpen, badgeToast:badgeToast,
        act:act, shortcuts:shortcuts, rebuild:function(){ built=false; build(); }};
})();
