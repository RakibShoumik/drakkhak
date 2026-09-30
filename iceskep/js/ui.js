/* ===========================================================
   UI — the shell.

   Five places to go: Start, Map, Practice, Progress, Settings — and,
   at the foot of the sidebar, Research, the page that explains why
   the app works the way it does. Every other screen is one tap
   inside one of them, and says so with a back link. A set of
   questions takes the whole window except the top bar, which stays
   so that the three switches (Sound, Timer, Night) are always in
   reach and the XP and coins have somewhere to fly to.

   The interface is English by default and Bangla is one switch away
   in Settings. Every string is written L('English', 'বাংলা'); the
   questions themselves never go through that — they stay in the
   language they were written in.

   Screens are plain functions that return HTML. Buttons carry
   data-go (a place) or data-act (an action); one listener handles
   them all.
   =========================================================== */
var UI = (function(){

var viewEl=null, route='today', param=null, built=false;
var lastNums={}, ownHash=false, cameBack=null;
var hold=null;          /* what the top bar keeps showing while a reward is in flight */
var lastDays=null;      /* the days box bumps when its number moves */

var TABS=[
  {id:'today',    code:'GO', en:'Start',    bn:'শুরু'},
  {id:'map',      code:'MP', en:'Map',      bn:'ম্যাপ'},
  {id:'practice', code:'PR', en:'Practice', bn:'অনুশীলন'},
  {id:'progress', code:'PG', en:'Progress', bn:'অগ্রগতি'},
  {id:'settings', code:'SE', en:'Settings', bn:'সেটিংস'}
];
/* every inner page belongs to one of the places, and that one stays lit */
var PARENT={
  today:'today', welcome:'today',
  map:'map', topic:'map',
  practice:'practice', modes:'practice', tricks:'practice', trick:'practice',
  mock:'practice', quests:'practice', section:'practice', run:'practice',
  progress:'progress', plan:'progress', stats:'progress', predict:'progress', wrapped:'progress',
  record:'progress', badges:'progress', collection:'progress', shop:'progress', social:'progress',
  settings:'settings', research:'research'
};
/* older names for places still arrive from the engine and old links */
var ALIAS={home:'today', start:'today', track:'practice', chapter:'topic'};

function h(s){ return U.h(s); }
function el(id){ return document.getElementById(id); }
function track(){ return DB.state().track; }
function tname(t){ return L('HSC','এইচএসসি'); }

/* ---------- dates, the way people say them ---------- */
var MON_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONTH_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
var MON_BN=['জানু','ফেব্রু','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগ','সেপ্ট','অক্টো','নভে','ডিসে'];
var MONTH_BN=['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
function dShort(d){ return d.getDate()+' '+(LBN()?MON_BN:MON_EN)[d.getMonth()]; }
function dLong(d){ return d.getDate()+' '+(LBN()?MONTH_BN:MONTH_EN)[d.getMonth()]+' '+d.getFullYear(); }
function plural(n, one, many){ return LBN() ? n+' '+one : n+' '+(n===1?one:(many||one+'s')); }

/* ============================================================
   NAVIGATION
   ============================================================ */
function setTrack(t){ render({enter:true}); }
function focusFor(r,p){
  if(r==='run') return;                       /* RUN.start already did it */
  if(r==='section') return CLOCK.focus({sec:p});
  if(r==='topic')   return CLOCK.focus({topic:p});
  if(r==='stats'||r==='settings'||r==='research') return CLOCK.focus({});
  CLOCK.focus({track:track()});
}
function go(r,p){
  r=ALIAS[r]||r||'today';
  if(!VIEWS[r]) r='today';
  if(route==='run' && r!=='run'){
    var Rs=RUN.state();
    if(Rs && Rs.phase!=='done' && Rs.phase!=='brief' && Rs.answered>0 && Rs.queue && Rs.i<Rs.queue.length){
      QUEST.setLoop({title:Rs.title, topic:Rs.topic, left:Rs.queue.length-Rs.i});
    }
    RUN.stop();
  }
  if(r==='run' && !RUN.active()) r='today';
  route=r; param=(p===undefined||p===null||p==='null')?null:p;
  focusFor(route,param);
  writeHash();
  closeSheet(true);
  window.scrollTo(0,0);
  render({enter:true});
}
function current(){ return route; }
function writeHash(){
  var hsh='#/'+route+(param?'/'+encodeURIComponent(param):'');
  if(location.hash===hsh) return;
  ownHash=true;
  try{ location.hash=hsh; }catch(e){}
  setTimeout(function(){ ownHash=false; }, 0);
}
function readHash(){
  var m=String(location.hash||'').match(/^#\/([a-z]+)(?:\/(.+))?$/);
  if(!m) return null;
  return {r:m[1], p:m[2]?decodeURIComponent(m[2]):null};
}
window.addEventListener('hashchange', function(){
  if(ownHash) return;
  var x=readHash();
  if(x && (x.r!==route || x.p!==param)) go(x.r, x.p);
});

/* ============================================================
   RENDERING
   ============================================================ */
var VIEWS={
  welcome:welcome, today:today, practice:practice, progress:progress, settings:settings,
  map:function(p){ return MAP.view(p); },
  research:function(){ return RESEARCH.view(); },
  run:function(){ return RUN.render(); },
  plan:function(){ return PAGES.plan(); },
  stats:function(){ return STATS.view(); },
  predict:function(){ return PAGES.predict(); },
  wrapped:function(){ return PAGES.wrapped(); },
  record:function(){ return PAGES.record(); },
  badges:function(){ return PAGES.badges(); },
  collection:function(){ return PAGES.collection(); },
  shop:function(){ return PAGES.shop(); },
  social:function(){ return PAGES.social(); },
  modes:function(){ return PAGES.modes(); },
  quests:function(){ return PAGES.quests(); },
  tricks:function(p){ return PAGES.tricks(p); },
  trick:function(p){ return PAGES.trick(p); },
  mock:function(){ return PAGES.mock(); },
  section:function(p){ return PAGES.section(p); },
  topic:function(p){ return PAGES.topic(p); }
};

function render(o){
  o=o||{};
  if(!built) build();
  if(!DB.state().onboarded && route!=='run') route='welcome';
  var focus = route==='run' || route==='welcome';
  document.body.classList.toggle('focus', focus);
  document.body.classList.toggle('welcoming', route==='welcome');
  document.body.setAttribute('data-route', route);
  paint(o.enter);
  refreshNav();
  paintChrome();
  if(route==='run') RUN.afterPaint();
  if(route==='map') MAP.afterPaint(param, o.enter);
  I18N.apply(document.body);
  after();
}
/* the runner repaints the view on every answer: no entrance, just the change */
function repaintView(){
  paint(false);
  paintChrome();
  if(route==='run') RUN.afterPaint();
  I18N.apply(viewEl);
  after();
}
function paint(enter){
  viewEl=el('view');
  var f=VIEWS[route]||today, html;
  try{ html=f(param); }
  catch(e){
    html='<div class="card"><h2>'+L('Something went wrong on this screen','এই পাতায় কিছু একটা গোলমাল হয়েছে')+'</h2>'+
         '<p class="small" style="margin:8px 0 16px">'+h(String(e&&e.message||e))+'</p>'+
         '<button class="btn ghost" data-go="today">'+L('Back to Start','শুরুর পাতায় ফিরুন')+'</button></div>';
    if(window.console) console.error(e);
  }
  viewEl.className='view'+(rcWide()?' rc':'')+(route==='settings'?' narrow':'')+(route==='map'?' wide':'')+(route==='research'?' paper':'');
  viewEl.innerHTML=html;
  /* a question brings its own entrance; the rest of the screens rise into place */
  var st=route==='run' && RUN.active() ? RUN.state() : null;
  if(st && (st.phase==='ask' || st.phase==='feedback')) enter=false;
  if(enter && FX.effectsOn()){ void viewEl.offsetWidth; viewEl.classList.add('enter'); }
}
function rcWide(){
  if(route!=='run' || !RUN.active()) return false;
  var q=RUN.current(), st=RUN.state();
  return !!(q && q.passage && st && st.phase!=='done' && st.phase!=='brief');
}
/* numbers that count to their value, and cards that notice being read */
function after(){
  var nodes=viewEl.querySelectorAll('[data-count]');
  for(var i=0;i<nodes.length;i++){
    var n=nodes[i], to=parseFloat(n.getAttribute('data-count')), dec=+(n.getAttribute('data-dec')||0);
    var key=n.getAttribute('data-key'), from = key && lastNums[key]!==undefined ? lastNums[key] : 0;
    if(n.getAttribute('data-from')!==null) from=parseFloat(n.getAttribute('data-from'));
    if(key) lastNums[key]=to;
    if(!isFinite(to) || from===to) continue;
    var comma=n.hasAttribute('data-comma');
    (function(n, to, dec, from, comma){
      FX.countUp(n, to, 1100, function(v){ return dec? v.toFixed(dec) : comma? U.num(v) : String(Math.round(v)); }, from);
    })(n, to, dec, from, comma);
  }
  observeTricks();
}

/* ---------- the pieces of the shell that stay put ---------- */
function build(){
  built=true;
  document.addEventListener('click', onClick);
  window.addEventListener('resize', moveInd);
  buildNav();
}
/* the nav is rebuilt when the language changes, so it is its own step */
function buildNav(){
  var nav='<span class="ind" id="navInd"></span>', tab='<span class="ind" id="tabInd"></span>';
  TABS.forEach(function(t){
    var nm=L(t.en, t.bn);
    nav+='<a href="#/'+t.id+'" data-go="'+t.id+'" data-tab="'+t.id+'"><span class="code">'+t.code+'</span>'+
         '<span class="nm">'+nm+'</span><span class="tk"></span></a>';
    tab+='<a href="#/'+t.id+'" data-go="'+t.id+'" data-tab="'+t.id+'"><span class="code">'+t.code+'</span>'+
         '<span>'+nm+'</span><span class="tk" hidden></span></a>';
  });
  el('nav').innerHTML=nav;
  el('tabbar').innerHTML=tab;
  var rl=el('researchLink');
  if(rl) rl.innerHTML='<svg class="rl-ico" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13"/><path d="M16 5v4M16 23v4M5 16h4M23 16h4"/><path d="M12 20l2.5-6.5L21 11l-2.5 6.5z"/></svg>'+
    '<span><b>'+L('Research-backed','গবেষণাভিত্তিক')+'</b><small>'+L('How Drakkhak teaches, and why','দ্রাক্ষাক কীভাবে শেখায়, আর কেন')+'</small></span>';
  var sf=el('sideFoot');
  if(sf) sf.textContent=L('Everything is kept in this browser. Export a copy from Settings now and then.',
                          'সবকিছু এই ব্রাউজারেই জমা থাকে। মাঝে মাঝে সেটিংস থেকে একটি কপি রেখে দিন।');
  var side=el('side'); if(side) side.setAttribute('aria-label', L('Main','প্রধান'));
}
function onClick(e){
  var t=e.target.closest ? e.target.closest('[data-go],[data-act]') : null;
  if(!t) return;
  if(t.hasAttribute('data-go')){
    e.preventDefault();
    go(t.getAttribute('data-go'), t.getAttribute('data-p'));
    return;
  }
  var f=ACT[t.getAttribute('data-act')];
  if(f){ e.preventDefault(); f(t.getAttribute('data-arg'), t, e); }
}
function refreshNav(){
  var t=track(), cur=PARENT[route]||'today';
  var due=AB.dueItems(t).length, px=PLAN.track(t);
  var ticks={today:PLAN.daysText(px.minutes), map:MAP.starTotal()+'&#9733;', practice:due?due+L(' due',' ফেরত'):'',
             progress:'L'+GAME.level().level, settings:''};
  ['nav','tabbar'].forEach(function(id){
    var links=el(id).querySelectorAll('a[data-tab]');
    for(var i=0;i<links.length;i++){
      var a=links[i], k=a.getAttribute('data-tab'), tk=a.querySelector('.tk');
      a.classList.toggle('on', k===cur);
      if(id==='nav'){ tk.innerHTML=ticks[k]; tk.className='tk'+(k==='practice'&&due?' acc':''); }
      else { tk.hidden=!(k==='practice'&&due); tk.textContent=due>99?'99+':due; }
    }
  });
  var rl=el('researchLink'); if(rl) rl.classList.toggle('on', route==='research');
  paintSubjects();
  moveInd();
}
function moveInd(){
  var cur=PARENT[route]||'today';
  var a=el('nav').querySelector('a[data-tab="'+cur+'"]'), ind=el('navInd');
  if(a && ind){ ind.style.transform='translateY('+(a.offsetTop+8)+'px)'; ind.style.opacity='1'; }
  else if(ind) ind.style.opacity='0';
  var idx=-1; TABS.forEach(function(t,i){ if(t.id===cur) idx=i; });
  var ti=el('tabInd'); if(ti){ ti.style.opacity=idx<0?'0':'1'; ti.style.transform='translateX('+(Math.max(0,idx)*100)+'%)'; }
}

/* ---------- a small ring: how much of something is done ---------- */
function donut(pct, size, cls){
  var R=size/2-3, C=2*Math.PI*R, c=size/2;
  pct=U.clamp(pct||0,0,1);
  return '<svg class="donut'+(cls?' '+cls:'')+'" viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'" aria-hidden="true">'+
    '<circle class="bg" cx="'+c+'" cy="'+c+'" r="'+R+'"/>'+
    '<circle class="fg" cx="'+c+'" cy="'+c+'" r="'+R+'" stroke-dasharray="'+C.toFixed(2)+'" stroke-dashoffset="'+(C*(1-pct)).toFixed(2)+
    '" transform="rotate(-90 '+c+' '+c+')"/></svg>';
}
/* the seven subjects: each one's days left, and a ring for how much is done */
function subjectRows(compact){
  var o='';
  PLAN.subjects().forEach(function(x){
    var pct=x.total ? x.cleared/x.total : 0;
    var d=PLAN.daysShort(x.minutes);
    o+='<button class="subj" type="button" data-go="map" data-p="'+x.sj.id+'" style="--sc:var(--s-'+x.sj.id+')" title="'+
       h(ICE.subjname(x.sj)+' · '+U.num(x.cleared)+' / '+U.num(x.total)+L(' questions done',' টি প্রশ্ন শেষ')+' · '+PLAN.daysText(x.minutes)+L(' of study left',' পড়া বাকি'))+'">'+
       donut(pct, compact?30:28)+
       '<span class="sn">'+ICE.subjname(x.sj)+'</span>'+
       '<span class="sd"><b>'+(x.minutes<1?'&#10003;':d)+'</b> '+(x.minutes<1?L('done','শেষ'):L(d==='1'?'day left':'days left','দিন বাকি'))+'</span></button>';
  });
  return o;
}
function paintSubjects(){
  var box=el('subjBox'); if(!box) return;
  box.innerHTML='<div class="side-label">'+L('Subjects','বিষয়')+'<span>'+L('days left','বাকি দিন')+'</span></div>'+subjectRows(false);
}

/* ---------- the top bar: today's minutes, XP, coins, days left, three switches ---------- */
function paintChrome(){
  var s=DB.state(), t=track(), g=DB.game();
  var c=el('clock');
  if(c){
    var pct=CLOCK.goalPct()/100, R=7, C=2*Math.PI*R;
    c.innerHTML='<span class="live"></span>'+
      '<svg class="ringlet" viewBox="0 0 18 18"><circle class="bg" cx="9" cy="9" r="'+R+'"/>'+
      '<circle class="fg" cx="9" cy="9" r="'+R+'" stroke-dasharray="'+C.toFixed(2)+'" stroke-dashoffset="'+
      (C*(1-U.clamp(pct,0,1))).toFixed(2)+'" transform="rotate(-90 9 9)"/></svg>'+
      '<b>'+U.mins(CLOCK.todayMins())+'</b>'+L('today','আজ');
    c.title=L('Studied today: ','আজ পড়া হয়েছে: ')+U.mins(CLOCK.todayMins())+' ('+CLOCK.goalPct()+L('% of your usual day)','% আপনার চেনা দিনের)');
    c.setAttribute('data-go','stats');
  }
  var xp = hold && hold.xp!==undefined ? hold.xp : g.xp;
  var coins = hold && hold.coins!==undefined ? hold.coins : g.coins;
  var LV=GAME.levelOf(xp);
  var xb=el('xpBox');
  if(xb){
    xb.innerHTML='<span class="lvl fly-target"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8l8.8 5.1v10.2L12 22.2l-8.8-5.1V6.9z"/></svg><b>'+LV.level+'</b></span>'+
      '<span class="xpcol"><span class="xpbar"><i style="width:'+U.round(100*LV.into/LV.need,1)+'%"></i></span>'+
      '<span class="xpn"><b>'+U.num(LV.into)+'</b> / '+U.num(LV.need)+' XP</span></span>';
    xb.title=L('Level '+LV.level+' · '+LV.into+' of '+LV.need+' XP to the next level · open Progress',
               'লেভেল '+LV.level+' · পরের লেভেলে যেতে '+LV.need+'-এর মধ্যে '+LV.into+' XP · অগ্রগতি খুলুন');
  }
  var cb=el('coinBox');
  if(cb){
    cb.innerHTML='<span class="coin fly-target"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#coinSym"/></svg></span>'+
      '<b>'+U.num(coins)+'</b>'+(g.chests?'<span class="dot" title="'+h(L(g.chests+' chest(s) to open',g.chests+'টি সিন্দুক খোলা বাকি'))+'">'+g.chests+'</span>':'');
    cb.title=L(coins+' coins · earned by answering, spent in the shop', coins+'টি কয়েন · উত্তর দিয়ে অর্জিত, দোকানে খরচ');
  }
  var db=el('daysBox');
  if(db){
    var px=PLAN.track(t), ur=GAME.urgency(t);
    db.innerHTML=donut(PLAN.pct(px), 20, 'mini')+'<b>'+(px.minutes<1?'&#10003;':PLAN.daysShort(px.minutes))+'</b><span class="lbl-long">'+
      (px.minutes<1?L('all done','সব শেষ'):L(' days left',' দিন বাকি'))+'</span>'+
      (ur.days!==null?'<span class="cd'+(ur.behind?' behind':'')+'">'+L('exam in ','পরীক্ষা ')+Math.max(0,ur.days)+L('d',' দিন')+'</span>':'');
    var dnow=PLAN.daysShort(px.minutes);
    if(lastDays!==null && lastDays!==dnow) FX.pop(db, 'fx-bump');
    lastDays=dnow;
    db.title=L('The whole syllabus: '+U.num(px.cleared)+' of '+U.num(px.total)+' questions done, '+U.mins(px.minutes)+' of work left at '+U.mins(PLAN.dailyMin())+' a day. Open the map.',
               'পুরো সিলেবাস: '+U.num(px.total)+'টির মধ্যে '+U.num(px.cleared)+'টি প্রশ্ন শেষ, দিনে '+U.mins(PLAN.dailyMin())+' হিসাবে বাকি '+U.mins(px.minutes)+' কাজ। ম্যাপ খুলুন।');
  }
  toggle('soundBtn', s.sound); toggle('timerBtn', s.timer); toggle('nightBtn', s.theme==='night');
}
function toggle(id, on){ var b=el(id); if(b){ b.classList.toggle('on', !!on); b.setAttribute('aria-pressed', on?'true':'false'); } }
/* the top bar keeps its old numbers until the coins and XP have landed */
function holdChrome(o){ hold=o||null; paintChrome(); }
function holding(){ return hold; }
function applyTheme(){
  var s=DB.state();
  document.documentElement.setAttribute('data-theme', s.theme==='night'?'night':'day');
  document.documentElement.classList.toggle('still', s.settings.effects===false);
  var m=document.querySelector('meta[name="theme-color"]');
  if(m) m.setAttribute('content', s.theme==='night'?'#16150F':'#F5F4ED');
}

/* ============================================================
   TOASTS AND SHEETS
   ============================================================ */
var toastT=null;
function toast(msg, ms){
  var host=el('toastHost'); if(!host) return;
  host.innerHTML='';
  var t=document.createElement('div');
  t.className='toast'; t.setAttribute('role','status'); t.innerHTML=msg;
  host.appendChild(t);
  if(I18N.on()) I18N.apply(t);
  clearTimeout(toastT);
  toastT=setTimeout(function(){
    t.classList.add('out');
    setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 260);
  }, ms||2800);
}
function sheet(inner, opts){
  opts=opts||{};
  closeSheet(true);
  var host=el('sheetHost');
  var d=document.createElement('div');
  d.className='sheet';
  d.innerHTML='<div class="panel" role="dialog" aria-modal="true">'+
    (opts.noClose?'':'<button class="close" type="button" data-close aria-label="'+L('Close','বন্ধ করুন')+'">&times;</button>')+inner+'</div>';
  d.addEventListener('click', function(e){
    if(opts.noClose && e.target===d) return;
    if(e.target===d || (e.target.closest && e.target.closest('[data-close]'))) closeSheet();
  });
  host.appendChild(d);
  if(I18N.on()) I18N.apply(d);
  var f=d.querySelector('.btn'); if(f) setTimeout(function(){ try{ f.focus({preventScroll:true}); }catch(e){} }, 60);
  return d;
}
function closeSheet(instant){
  var host=el('sheetHost'); if(!host) return;
  var d=host.firstChild; if(!d) return;
  if(instant){ host.innerHTML=''; return; }
  d.classList.add('out');
  setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 220);
}
function sheetOpen(){ var host=el('sheetHost'); return !!(host && host.firstChild); }

/* ---------- celebrations: a proper moment, never in the middle of a question ---------- */
var pending=[];
function celebrate(o){
  var st=RUN.active() ? RUN.state() : null;
  if(st && (st.phase==='ask' || st.phase==='feedback')){
    pending.push(o);
    if(o.kind==='level') toast('<b>'+L('Level ','লেভেল ')+o.level+'</b>'+(o.unlock?' &mdash; '+h(o.unlock.name)+L(' unlocked',' খুলল'):''), 2600);
    return true;
  }
  show(o);
  return true;
}
function flushCelebrations(){
  if(!pending.length) return;
  var best=pending[pending.length-1];
  pending=[];
  setTimeout(function(){ show(best); }, 900);
}
function show(o){
  if(o.kind!=='level') return;
  FX.confetti(90);
  sheet('<div class="celebrate"><span class="kicker acc">'+L('Level up','লেভেল আপ')+'</span>'+
    '<div class="ring"><svg viewBox="0 0 140 140"><circle class="bg" cx="70" cy="70" r="62"/>'+
    '<circle class="fg" cx="70" cy="70" r="62" pathLength="1"/></svg><b>'+o.level+'</b></div>'+
    '<h2>'+L('Level ','লেভেল ')+o.level+'</h2><p class="small">'+L('Earned one right answer at a time.','একটি একটি সঠিক উত্তর দিয়ে অর্জিত।')+'</p>'+
    (o.unlock?'<div class="unl"><b>'+h(o.unlock.name)+'</b> '+L('is open now. ','এখন খোলা। ')+h(o.unlock.note)+'</div>':'')+
    '<div class="btns" style="margin-top:10px;justify-content:center"><button class="btn" data-close>'+L('Keep going','চালিয়ে যান')+'</button>'+
    (o.unlock?'<button class="btn ghost" data-close data-go="modes">'+L('Have a look','দেখে নিন')+'</button>':'')+'</div></div>');
}

/* ============================================================
   FIRST VISIT — five questions, no sign-up, no settings
   ============================================================ */
var welcomeMore=false;
function welcome(){
  var o='<div class="welcome">'+
    '<div class="wbar"><span class="brand" style="border:0;margin:0;padding:0;width:auto">'+
      '<svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><use href="#logoSym"/></svg>'+
      '<span><span class="brand-name">Drakkhak</span><span class="brand-sub">HSC</span></span></span>'+
      '<button class="link quiet" data-act="welcomeMore">'+L('I have used it before','আগে ব্যবহার করেছি')+'</button></div>'+
    '<div class="stack s">'+
    '<span class="kicker">'+L('First visit &middot; no sign-up','প্রথম আসা &middot; কোনো সাইন-আপ নেই')+'</span>'+
    '<h1>'+L('Five questions first.','আগে পাঁচটি প্রশ্ন।')+'</h1>'+
    '<p class="lede muted" style="font-size:19px;max-width:48ch">'+L('No sign-up and no settings. Your answers decide where you should start, and your plan comes straight after.',
      'সাইন-আপ নেই, সেটিংসও নেই। আপনার উত্তর দেখেই ঠিক হবে কোথা থেকে শুরু করা উচিত, আর তার পরেই আপনার পরিকল্পনা।')+'</p>'+
    '<div class="card pad-s" style="margin-top:18px"><div class="label">'+L('What you will practise','যা অনুশীলন করবেন')+'</div>'+
      '<p class="ui" style="font-size:15px;margin-top:6px">'+L('The MCQ of all eleven papers &mdash; ','এগারোটি পত্রের বহুনির্বাচনি &mdash; ')+
      h(ICE.sectionsOf('hsc').map(function(x){ return ICE.sname(x); }).join('  ·  '))+'.</p>'+
      '<p class="small" style="margin-top:8px">'+L('Questions come from the NCTB textbooks, chapter by chapter, and are in Bangla as in the exam. Four options, one minute each, and nothing is taken off for a wrong answer.',
        'প্রশ্ন আসে এনসিটিবির পাঠ্যবই থেকে, অধ্যায় ধরে ধরে। চারটি অপশন, প্রতি প্রশ্নে এক মিনিট, ভুলে কিছু কাটা যায় না।')+'</p></div>'+
    '<div class="row" style="flex-wrap:wrap;margin-top:12px">'+
      '<button class="btn" data-act="startWelcome">'+L('Start five questions','পাঁচটি প্রশ্ন শুরু করুন')+'</button>'+
      '<span class="small">'+L('About five minutes. Everything stays on this device.','প্রায় পাঁচ মিনিট। সবকিছু এই ডিভাইসেই থাকে।')+'</span></div>';
  if(welcomeMore){
    o+='<div class="card pad-s" style="margin-top:8px"><div class="spread" style="align-items:center">'+
       '<span class="ui" style="font-size:14px">'+L('Restore a copy you exported, or go straight in.','আগে রাখা কপি ফিরিয়ে আনুন, বা সোজা ভিতরে চলে যান।')+'</span>'+
       '<span class="btns"><button class="btn sm ghost" data-act="importData">'+L('Restore a copy','কপি ফেরান')+'</button>'+
       '<button class="btn sm ghost" data-act="skipWelcome">'+L('Straight in','সোজা অ্যাপে')+'</button></span></div></div>';
  }
  return o+'</div></div>';
}

/* ============================================================
   START — the first place, and the main one: one number, one
   count, one card, one button
   ============================================================ */
function daysNum(mins){
  var d=PLAN.days(mins);
  if(mins<1) return {v:0, dec:0};
  return d<10 ? {v:U.round(d,1), dec:1} : {v:Math.round(d), dec:0};
}
function ticks(daysLeft, cutDays){
  var cut=cutDays>=0.5?Math.round(cutDays):0, left=Math.ceil(daysLeft);
  var f=Math.max(1, Math.ceil((cut+left)/64));
  if(f>1){ cut=cut?Math.max(1,Math.round(cut/f)):0; left=Math.ceil(left/f); }
  var o='<div class="ticks" aria-hidden="true">', i, k=0;
  for(i=0;i<cut;i++) o+='<i class="cut" style="--i:'+(k++)+'"></i>';
  for(i=0;i<left;i++) o+='<i style="--i:'+(k++)+'"></i>';
  return o+'</div>';
}
function today(){
  var t=track(), px=PLAN.track(t), mins=px.minutes, st=DB.state(), set=st.settings.setSize;
  var dn=daysNum(mins), daysLeft=PLAN.days(mins), dmin=PLAN.dailyMin();
  var cw=PLAN.cutWeek(t), ct=PLAN.cutToday(t), cwDays=cw/dmin;
  var o='';

  /* the number that matters, and three facts beside it */
  o+='<section class="hero"><div class="left">'+
    '<span class="kicker">'+L('HSC &middot; Start','এইচএসসি &middot; শুরু')+'</span>'+
    '<div class="bigrow"><div class="bignum" data-count="'+dn.v+'" data-dec="'+dn.dec+'" data-key="days.'+t+'">'+dn.v+'</div>'+
      '<div class="bigtext"><div class="bigunit">'+(mins<1?L('nothing left to learn','শেখার আর কিছু বাকি নেই'):L('days of study left','দিনের পড়া বাকি'))+'</div>'+
      '<div class="bigsub">'+L('For the whole syllabus, at '+U.mins(dmin)+' a day. '+U.mins(mins)+' of work left.',
        'পুরো সিলেবাসের জন্য, দিনে '+U.mins(dmin)+' পড়ার হিসাবে। বাকি কাজ '+U.mins(mins)+'।')+'</div></div></div>'+
    (mins>=1?ticks(daysLeft, cwDays):'')+
    qcount(px)+
    '<div class="metas">'+
      (cwDays>=0.05?'<span class="acc">'+L(U.round(cwDays,1)+' days cut this week','এই সপ্তাহে '+U.round(cwDays,1)+' দিন কাটা গেছে')+'</span>'
                   :'<span>'+L('Every right answer brings the number down','প্রতিটি ঠিক উত্তর সংখ্যাটি কমায়')+'</span>')+
      (ct>=1?'<span>'+L('Cut today: ','আজ কাটা গেছে ')+U.mins(ct)+'</span>':'')+
      (mins>=1?'<span>'+L('Finishes ','শেষ হবে ')+dShort(PLAN.finishDate(t))+'</span>':'')+
    '</div></div>'+
    '<aside>'+examBox(t)+streakBox(t)+paceBox(t, daysLeft, mins)+'</aside></section>';

  /* on a phone the sidebar is gone, so the seven subjects come here */
  o+='<section class="subjstrip phone-only" aria-label="'+L('Subjects','বিষয়')+'">'+subjectRows(true)+'</section>';

  var nd=nudge(t);
  if(nd) o+=nd;

  o+=nextCard(t, set);
  return o;
}
/* the plain count: questions done, questions left */
function qcount(px){
  var left=px.total-px.cleared, pct=PLAN.pct(px);
  return '<div class="qcount"><div class="qc-line">'+
      '<b class="qc-done" data-count="'+px.cleared+'" data-comma data-key="qdone">'+U.num(px.cleared)+'</b>'+
      '<span class="qc-of">'+L(' of '+U.num(px.total)+' questions done',' / '+U.num(px.total)+'টি প্রশ্ন শেষ')+'</span>'+
      '<span class="qc-left"><b>'+U.num(left)+'</b>'+L(' left',' বাকি')+'</span></div>'+
    '<div class="bar thin qc-bar"><i style="width:'+Math.max(0.6,U.round(100*pct,2))+'%"></i></div>'+
    (px.est?'<div class="qc-note">'+L(U.num(px.bank)+' are in the bank today; the rest arrive chapter by chapter and are already counted.',
      'আজ ব্যাংকে '+U.num(px.bank)+'টি আছে; বাকিগুলো অধ্যায় ধরে ধরে আসবে, আর হিসাবে আগেই ধরা আছে।')+'</div>':'')+
    '</div>';
}
function examBox(t){
  var d=PREDICT.daysTo(t), ds=DB.state().examDate[t];
  if(d===null) return '<div class="stat"><div class="label">'+L('Exam in','পরীক্ষা বাকি')+'</div><div class="v">'+L('Not set','ঠিক করা হয়নি')+'</div>'+
    '<div class="s"><a href="#/settings" data-go="settings">'+L('Add the date in Settings','সেটিংসে তারিখ দিন')+'</a></div></div>';
  return '<div class="stat"><div class="label">'+L('Exam in','পরীক্ষা বাকি')+'</div><div class="v"><span data-count="'+Math.max(0,d)+'" data-key="exam.'+t+'">'+
    Math.max(0,d)+'</span> '+L('days','দিন')+'</div><div class="s">'+dLong(new Date(ds+'T00:00:00'))+'</div></div>';
}
function streakBox(t){
  var s=DB.state(), live=DB.liveStreak(), due=AB.dueItems(t).length, a=DB.actsToday();
  var days=DB.lastNDays(7), wd='<div class="weekdots">';
  days.forEach(function(d,i){
    var hit=DB.DAY_MET(d.date), fz=s.frozen[d.date];
    wd+='<i style="--i:'+i+'" class="'+(hit?'hit':fz?'freeze':'')+(d.date===DB.today()?' today':'')+'" title="'+d.date+'"></i>';
  });
  wd+='</div>';
  return '<div class="stat"><div class="label">'+L('Streak','ধারা')+'</div><div class="v"><span data-count="'+live+'" data-key="streak">'+live+'</span> '+L(live===1?'day':'days','দিন')+'</div>'+
    '<div class="s">'+L('Best '+s.best+(due?', '+due+' due back':'')+' &middot; today '+a.q+' of '+s.settings.dailyQ,
      'সর্বোচ্চ '+s.best+(due?', '+due+'টি ফেরত এসেছে':'')+' &middot; আজ '+s.settings.dailyQ+'-এর মধ্যে '+a.q)+'</div>'+wd+'</div>';
}
function paceBox(t, daysLeft, mins){
  var d=PREDICT.daysTo(t), text;
  if(mins<1) text=L('The whole syllabus is done. Keep it warm with reviews and a full paper now and then.','পুরো পড়া শেষ। মাঝে মাঝে রিভিউ আর একটি পূর্ণ পত্র দিয়ে গরম রাখুন।');
  else if(d===null) text=L('Add your exam date to see whether you finish in time.','সময়ে শেষ হবে কি না দেখতে পরীক্ষার তারিখ দিন।');
  else{
    var gap=d-Math.ceil(daysLeft);
    if(gap>=0) text=L('You finish '+gap+' days before the exam.','পরীক্ষার '+gap+' দিন আগেই শেষ হচ্ছে।');
    else text=L('You finish '+(-gap)+' days after the exam. '+U.mins(d>0?mins/d:mins)+' a day closes the gap.',
                'পরীক্ষার '+(-gap)+' দিন পরে শেষ হচ্ছে। দিনে '+U.mins(d>0?mins/d:mins)+' পড়লে ফাঁক মিটে যায়।');
  }
  return '<div class="stat acc"><div class="label">'+L('At this pace','এই গতিতে')+'</div><div class="t">'+text+'</div></div>';
}
function nextCard(t, set){
  var steps=PLAN.path(t), now=null, i;
  for(i=0;i<steps.length;i++) if(steps[i].status==='now'){ now=steps[i]; break; }
  if(!now){
    return '<section class="card next"><span class="kicker">'+L('Next up','এর পরে')+'</span><h2>'+L('Every written chapter is done','লেখা প্রতিটি অধ্যায় শেষ')+'</h2>'+
      '<p class="why">'+L('One job now &mdash; keeping the edge: a full paper, and whatever comes back.','এখন কাজ একটাই &mdash; ধার ধরে রাখা: একটি পূর্ণ পত্র, আর যা যা ফেরত আসে।')+'</p>'+
      '<div class="btns two"><button class="btn" data-go="mock">'+L('Sit a full paper','একটি পূর্ণ পত্র দিন')+'</button>'+
      '<button class="btn ghost" data-go="map">'+L('Open the map','ম্যাপ খুলুন')+'</button></div></section>';
  }
  var x=now.x, tp=x.topic, sc=AB.score({topic:now.id}).score, stars=GAME.stars(now.id).n;
  return '<section class="card next">'+
    '<div class="spread"><span class="kicker">'+L('Next up','এর পরে')+' &middot; '+h(ICE.sname(tp.sec))+'</span>'+
      '<span class="kicker" style="letter-spacing:.06em;text-transform:none">'+PLAN.daysText(x.minutes)+'</span></div>'+
    '<div style="display:flex;flex-direction:column;gap:4px"><h2>'+chNo(now.id)+h(ICE.tname(tp))+'</h2>'+
      '<div class="meta"><span>'+L(x.cleared+' of '+x.total+' questions done &middot; score '+sc, x.total+'-এ '+x.cleared+'টি প্রশ্ন শেষ &middot; স্কোর '+sc)+'</span>'+
      starMarks(stars)+'</div></div>'+
    '<p class="why">'+whyLine(t, now)+'</p>'+
    '<div class="btns two"><button class="btn" data-act="quickStart">'+L('Start','শুরু')+' &middot; '+L(set+' questions',set+'টি প্রশ্ন')+'</button>'+
      '<button class="btn ghost" data-go="topic" data-p="'+h(now.id)+'">'+L('Learn this chapter first','আগে অধ্যায়টি শিখুন')+'</button></div></section>';
}
function whyLine(t, step){
  var id=step.id, x=step.x;
  var due=AB.dueItems(t).filter(function(d){ return d.q.topic===id; }).length;
  var since=Date.now()-7*864e5;
  var missed=DB.logFor(function(r){ return r.k===id && r.t>=since && !r.ok; }).length;
  if(missed && due) return L(missed+' missed here last week, and '+due+' came back today.','গত সপ্তাহে এখানে '+missed+'টি ভুল হয়েছিল, আর আজ '+due+'টি ফেরত এসেছে।');
  if(missed) return L(missed+' missed here last week. They are coming back today.','গত সপ্তাহে এখানে '+missed+'টি ভুল হয়েছিল। আজ সেগুলো ফিরে আসছে।');
  if(due) return L(due+' from here came back today.','এখান থেকে '+due+'টি আজ ফেরত এসেছে।');
  if(!x.cleared) return L('The next chapter on your path. Anything due back comes first, and at least 13 of every 16 are questions you have never seen.',
                          'আপনার পথের পরের অধ্যায়। যা ফেরত এসেছে সেগুলো আগে, আর প্রতি ১৬টির অন্তত ১৩টি একেবারে নতুন প্রশ্ন।');
  return L((x.total-x.cleared)+' questions left here &mdash; about '+PLAN.daysText(x.minutes)+' of work.','এখানে আর '+(x.total-x.cleared)+'টি প্রশ্ন বাকি &mdash; প্রায় '+PLAN.daysText(x.minutes)+' কাজ।');
}
/* chapters are learnt in order, so the number is part of the name */
function chNo(id){ var t=ICE.topics[id]; return t? (L('Chapter ','অধ্যায় ')+t.n+' &middot; ') : ''; }
function starMarks(n, big){
  var o='<span class="stars'+(big?' big':'')+'" title="'+h(L(n+' of 3 stars','৩-এ '+n+' তারা'))+'">';
  for(var i=0;i<3;i++) o+='<i class="'+(i<n?'on':'')+'" style="--i:'+i+'">&#9733;</i>';
  return o+'</span>';
}

/* one nudge at a time, and only when it is true */
function nudge(t){
  var s=DB.state(), g=DB.game(), off=(s.nudgeOff && s.nudgeOff.day===DB.today()) ? s.nudgeOff.ids : {};
  var list=[];
  if(cameBack) list.push({id:'back', cls:'ok', kick:L('Welcome back','আবার স্বাগতম'),
    text:L(cameBack.days+' days away, and nothing was lost. Your best streak of '+cameBack.best+' days is still on record, and a chest is waiting.',
           cameBack.days+' দিন দূরে ছিলেন, কিছুই হারায়নি। আপনার সর্বোচ্চ '+cameBack.best+' দিনের ধারা রেকর্ডেই আছে, আর একটি সিন্দুক অপেক্ষা করছে।'),
    btn:L('Open the chest','সিন্দুক খুলুন'), act:'openChest'});
  var loop=QUEST.loop();
  if(loop && loop.left>0) list.push({id:'loop', kick:L('Unfinished','অসমাপ্ত'), text:L(h(loop.title)+' had '+loop.left+' questions left.', h(loop.title)+' শেষ হতে আর '+loop.left+'টি প্রশ্ন বাকি ছিল।'),
    btn:L('Finish it','শেষ করুন'), act:'resumeLoop'});
  var ev=QUEST.event();
  if(ev) list.push({id:'ev', cls:'gold', kick:ev.name, text:h(ev.note), btn:null});
  var rp=QUEST.streak().repair;
  if(rp) list.push({id:'repair', kick:L('Streak','ধারা'), text:L('Your '+rp.streak+'-day streak can be repaired for '+rp.cost+' coins.','আপনার '+rp.streak+' দিনের ধারা '+rp.cost+'টি কয়েনে ফিরিয়ে আনা যায়।'), btn:L('Repair it','মেরামত করুন'), act:'repair'});
  var bank=GAME.mistakeBank(t).length;
  if(bank>=5) list.push({id:'bank', kick:L('Mistake bank','ভুলের ব্যাংক'), text:L(bank+' questions you missed are waiting to be won back.','ভুল করা '+bank+'টি প্রশ্ন ফিরিয়ে আনার অপেক্ষায়।'), btn:L('Start','শুরু করুন'), act:'revenge'});
  var near=nearlyDone(t);
  if(near.length) list.push({id:'near', kick:L('Within reach','হাতের নাগালে'), text:L(h(ICE.tname(near[0].id))+' is '+near[0].left+' questions from done.', h(ICE.tname(near[0].id))+' শেষ হতে আর '+near[0].left+'টি প্রশ্ন।'),
    btn:L('Finish it','শেষ করুন'), act:'topicSet', arg:near[0].id});
  var qd=QUEST.qotd();
  if(qd.q && qd.ok===null) list.push({id:'qotd', kick:L('Question of the day','আজকের প্রশ্ন'), text:L('One question, the same all day, a step above the board.','একটি প্রশ্ন, সারাদিন একই, বোর্ডের চেয়ে এক ধাপ ওপরে।'),
    btn:L('Open','খুলুন'), act:'qotd'});
  var claim=QUEST.daily().filter(function(q){ return q.done && !q.claimed; }).length;
  if(claim) list.push({id:'quest', cls:'ok', kick:L('Quest done','কোয়েস্ট শেষ'), text:L(claim+(claim===1?' quest is':' quests are')+' done and waiting to be claimed.',claim+'টি কোয়েস্ট শেষ, নেওয়ার অপেক্ষায়।'),
    btn:L('Claim','নিন'), go:'quests'});
  if(g.chests) list.push({id:'chest', cls:'gold', kick:L('Chest','সিন্দুক'), text:L(g.chests+(g.chests===1?' chest':' chests')+' to open.',g.chests+'টি সিন্দুক খোলা বাকি।'), btn:L('Open','খুলুন'), act:'openChest'});
  for(var i=0;i<list.length;i++){
    var n=list[i];
    if(off[n.id]) continue;
    return '<div class="nudge '+(n.cls||'')+'"><div class="nb"><div class="kicker acc">'+h(n.kick)+'</div><div class="nt">'+n.text+'</div></div>'+
      (n.btn?'<button class="btn sm'+(n.cls==='gold'?' ghost':'')+'" '+(n.go?'data-go="'+n.go+'"':'data-act="'+n.act+'"'+(n.arg?' data-arg="'+h(n.arg)+'"':''))+'>'+n.btn+'</button>':'')+
      '<button class="nx" data-act="dismiss" data-arg="'+n.id+'" aria-label="'+L('Not now','এখন নয়')+'">&times;</button></div>';
  }
  return '';
}
function nearlyDone(t){
  var out=[];
  for(var id in ICE.topics){
    if(ICE.topics[id].track!==t) continue;
    var x=PLAN.topic(id);
    if(!x || x.est || !x.total || x.cleared===x.total) continue;
    var left=x.total-x.cleared;
    if(x.cleared/x.total>=0.8 && left<=8) out.push({id:id, left:left, total:x.total});
  }
  out.sort(function(a,b){ return a.left-b.left; });
  return out.slice(0,3);
}

/* ============================================================
   PRACTICE
   ============================================================ */
function practice(){
  var t=track(), st=DB.state().settings, set=st.setSize;
  var steps=PLAN.path(t), now=null, i;
  for(i=0;i<steps.length;i++) if(steps[i].status==='now'){ now=steps[i]; break; }
  var due=AB.dueItems(t).length, bank=GAME.mistakeBank(t).length;
  var blitzOpen=GAME.has('blitz');
  var o='<div class="phead"><span class="kicker">'+L('HSC &middot; Practice','এইচএসসি &middot; অনুশীলন')+'</span><h1>'+L('Practice','অনুশীলন')+'</h1></div>';

  o+='<section class="card" style="display:flex;flex-direction:column;gap:14px">'+
    '<h3 style="font-size:21px">'+L('Continue the plan','পরিকল্পনা চালিয়ে যান')+'</h3>'+
    '<p class="muted" style="font-size:17px">'+(now?L('Next chapter: '+h(ICE.tname(now.x.topic))+'. ','পরের অধ্যায় '+h(ICE.tname(now.x.topic))+'। '):'')+
      L('Anything due back comes first, finished chapters return now and then so they are not forgotten, and at least 13 of every 16 questions are new until you have seen them all.',
        'যা ফেরত এসেছে সেগুলো আগে আসে, শেষ করা অধ্যায় মাঝে মাঝে ফিরে আসে যাতে ভুলে না যান, আর সব দেখা না হওয়া পর্যন্ত প্রতি ১৬টির অন্তত ১৩টি নতুন প্রশ্ন।')+
      (due?' <a href="#" data-act="reviewDue">'+L('See the '+due+' due today on their own','আজ ফেরত আসা '+due+'টি আলাদা করে দেখুন')+'</a>.':'')+'</p>'+
    '<div class="btns two"><button class="btn" data-act="quickStart">'+L('Continue the plan','পরিকল্পনা চালিয়ে যান')+' &middot; '+set+'</button>'+
      '<button class="btn ghost" data-act="weakSet">'+L('Weak spots first','আগে দুর্বল জায়গা')+'</button></div></section>';

  o+='<div><div class="seclabel">'+L('Ways to practise','অনুশীলনের উপায়')+'</div><div class="ways stagger" style="margin-top:12px">'+
    way(L(set+' questions',set+'টি প্রশ্ন'), L('Weak spots','দুর্বল জায়গা'), L('Your lowest chapters, weighted by the paper.','আপনার সবচেয়ে নিচু অধ্যায়, পত্রের ওজন ধরে।'), 'weakSet')+
    way(blitzOpen?L('60 seconds','৬০ সেকেন্ড'):L('Opens at level 3','লেভেল ৩-এ খোলে'), L('Against the clock','ঘড়ির সাথে পাল্লা'), L('As many as you can before the bell.','ঘণ্টা বাজার আগে যতগুলো পারেন।'), 'blitz', !blitzOpen)+
    way(L('Whole paper','পুরো পত্র'), L('Full paper','পূর্ণ পত্র'), L('One paper\'s MCQ on the real clock, checked at the end.','একটি পত্রের এমসিকিউ আসল ঘড়িতে, শেষে দেখা।'), null, false, 'mock')+
    way(bank?L(bank+' owed',bank+'টি পাওনা'):L('Nothing owed','কিছু পাওনা নেই'), L('Mistake bank','ভুলের ব্যাংক'), L('Get one right on a later day and it is cleared.','পরের কোনো দিনে ঠিক করলেই একটি মিটে যায়।'), 'revenge', false, null, bank>0)+
    '</div></div>';

  o+='<div><div class="seclabel">'+L('Paper &middot; score','পত্র &middot; স্কোর')+'</div>';
  ICE.sectionsOf(t).forEach(function(sec, k){
    var sk=sec.track+'/'+sec.id, sc=AB.score({sec:sk}).score, pass=st.passLine;
    o+='<div class="srow"><span class="code">'+(k+1)+'</span>'+
      '<button class="nm" data-go="section" data-p="'+h(sk)+'">'+h(ICE.sname(sec))+'</button>'+
      '<span class="sub">'+L(sec.n+' in the paper','পত্রে '+sec.n+'টি')+'</span>'+
      '<span class="bar thin"><i class="'+(sc>=pass?'ok':'')+'" style="width:'+Math.max(1,sc)+'%"></i></span>'+
      '<span class="sc" data-count="'+sc+'" data-key="sec.'+sk+'">'+sc+'</span>'+
      '<span class="go"><a href="#" class="link" data-act="secSet" data-arg="'+h(sk)+'">'+L('Practise','অনুশীলন')+'</a></span></div>';
  });
  o+='</div>';

  var modes=MODES.list(), open=modes.filter(function(m){ return m.open; }).length;
  var tricks=AB.allTricks(t), read=tricks.filter(function(x){ return DB.state().readTricks[x.id]; }).length;
  var qd=QUEST.daily(), qdone=qd.filter(function(q){ return q.done; }).length;
  o+='<div><div class="seclabel">'+L('More','আরও')+'</div><div class="links">'+
    link('modes', null, L('More ways to practise','অনুশীলনের আরও উপায়'), L('Survival, boss battles, ghost race, duels, board MCQ','সারভাইভাল, বস লড়াই, ঘোস্ট রেস, দ্বৈরথ, বোর্ড এমসিকিউ'), L(open+' of '+modes.length+' open',modes.length+'-এ '+open+'টি খোলা'))+
    link('tricks', null, L('Formula and memory cards','সূত্র ও মনে রাখার কার্ড'), L('One thing per card','প্রতি কার্ডে একটি করে কথা'), L(read+' of '+tricks.length+' read',tricks.length+'-এ '+read+'টি পড়া'))+
    link('quests', null, L('Quests and the question of the day','কোয়েস্ট ও আজকের প্রশ্ন'), L('Three small goals a day, one a week','দিনে তিনটি ছোট লক্ষ্য, সপ্তাহে একটি'), L(qdone+' of '+qd.length+' today',qd.length+'-এ আজ '+qdone+'টি'))+
    '</div></div>';
  return '<div class="stack">'+o+'</div>';
}
function way(top, title, sub, act, locked, goTo, hot){
  return '<button class="way'+(locked?' locked':'')+'" '+(goTo?'data-go="'+goTo+'"':'data-act="'+act+'"')+'>'+
    '<span class="label'+(hot?' acc':'')+'" style="'+(hot?'color:var(--accent)':'')+'">'+top+'</span>'+
    '<span class="wt">'+title+'</span><span class="ws">'+sub+'</span></button>';
}
function link(goTo, p, title, sub, val, hot){
  return '<a href="#/'+goTo+'" data-go="'+goTo+'"'+(p?' data-p="'+h(p)+'"':'')+'><span class="grow"><span class="lt">'+title+'</span>'+
    (sub?'<span class="ls">'+sub+'</span>':'')+'</span>'+(val?'<span class="lv'+(hot?' acc':'')+'">'+val+'</span>':'')+
    '<span class="chev">&rsaquo;</span></a>';
}

/* ============================================================
   PROGRESS
   ============================================================ */
function progress(){
  var t=track(), st=DB.state().settings, px=PLAN.track(t), sc=AB.score({track:t});
  var dn=daysNum(px.minutes), pct=Math.round(100*PLAN.pct(px));
  var o='<div class="phead"><span class="kicker">'+L('HSC &middot; Progress','এইচএসসি &middot; অগ্রগতি')+'</span><h1>'+L('Progress','অগ্রগতি')+'</h1></div>';

  o+='<div class="grid4 stagger">'+
    stat(L('Days left','বাকি দিন'), '<span data-count="'+dn.v+'" data-dec="'+dn.dec+'" data-key="pdays.'+t+'">'+dn.v+'</span> '+L('days','দিন'),
         L('All seven subjects, at '+U.mins(PLAN.dailyMin())+' a day','সাতটি বিষয় মিলিয়ে, দিনে '+U.mins(PLAN.dailyMin())+' হিসাবে'))+
    stat(L('Questions a day','দৈনিক প্রশ্ন'), '<span data-count="'+PLAN.perDay(t)+'">'+PLAN.perDay(t)+'</span>', L('to keep this pace','এই গতি ধরে রাখতে'))+
    stat(L('Score','স্কোর'), '<span data-count="'+sc.score+'" data-key="pscore.'+t+'">'+sc.score+'</span>', L('pass '+st.passLine+' &middot; goal '+st.goalLine,'পাস '+st.passLine+' &middot; লক্ষ্য '+st.goalLine))+
    stat(L('Done','শেষ'), '<span data-count="'+pct+'">'+pct+'</span>%', L(U.num(px.cleared)+' of '+U.num(px.total),U.num(px.total)+'-এ '+U.num(px.cleared)))+
    '</div>';

  /* the days left, subject by subject: the headline is exactly their sum */
  var rows='', subs=PLAN.subjects(), maxM=1;
  subs.forEach(function(x){ maxM=Math.max(maxM, x.minutes); });
  subs.forEach(function(x){
    rows+='<button class="sdrow" type="button" data-go="map" data-p="'+x.sj.id+'" style="--sc:var(--s-'+x.sj.id+')">'+
      '<span class="sw"></span><span class="sn">'+h(ICE.subjname(x.sj))+'</span>'+
      '<span class="bar thin"><i style="width:'+Math.max(1,U.round(100*x.minutes/maxM,1))+'%;background:var(--sc)"></i></span>'+
      '<span class="sd">'+PLAN.daysText(x.minutes)+'</span></button>';
  });
  o+='<section class="card"><div class="spread" style="margin-bottom:6px"><h3 style="font-size:21px">'+L('Days left, by subject','বিষয় অনুযায়ী বাকি দিন')+'</h3>'+
     '<span class="label">'+L('adds up to ','মোট ')+PLAN.daysText(px.minutes)+'</span></div>'+rows+'</section>';

  o+='<div class="pgrid">'+
    '<section class="card"><div class="spread" style="margin-bottom:10px"><h3 style="font-size:21px">'+L('Days of study left','পড়া বাকি (দিন)')+'</h3>'+
      '<span class="label">'+L('last 30 days','শেষ ৩০ দিন')+'</span></div>'+daysChart(t)+'</section>'+
    '<div class="stack s">'+predCard(t)+bankCard(t)+'</div></div>';

  var LV=GAME.level(), g=DB.game();
  o+='<div><div class="seclabel">'+L('More','আরও')+'</div><div class="links">'+
    link('map', null, L('The map','ম্যাপ'), L('Every chapter of every paper, with its stars and time left','প্রতিটি পত্রের প্রতিটি অধ্যায়, তারা আর বাকি সময়সহ'), MAP.starTotal()+' &#9733;')+
    link('plan', null, L('The whole plan','পুরো পরিকল্পনা'), L('Every chapter in order, and what is left in each','সব অধ্যায় ক্রম অনুযায়ী, প্রতিটিতে কী বাকি'), PLAN.daysText(px.minutes))+
    link('stats', null, L('Statistics','পরিসংখ্যান'), L('Time at the desk, every chapter, when you study, whether it works','টেবিলে কাটানো সময়, প্রতিটি অধ্যায়, কখন পড়েন, কাজ হচ্ছে কি না'), U.mins(DB.totalMins())+L(' logged',' জমা'))+
    link('predict', null, L('The prediction, line by line','পূর্বাভাস, লাইন ধরে'), L('How the number came about, and what would move it','সংখ্যাটি কীভাবে এলো আর কী সেটিকে নাড়াবে'))+
    link('wrapped', null, L('This week','এই সপ্তাহ'), L('How the week went, against the week before','সপ্তাহটি যেমন গেল, আগের সপ্তাহের সাথে মিলিয়ে'))+
    link('record', null, L('Your record','আপনার রেকর্ড'), L('Level, badges, collection, shop, duels, certificate','লেভেল, ব্যাজ, সংগ্রহ, দোকান, দ্বৈরথ, সনদ'),
         'L'+LV.level+(g.chests?' &middot; '+L(g.chests+(g.chests===1?' chest':' chests'),g.chests+'টি সিন্দুক'):''), g.chests>0)+
    '</div></div>';
  return '<div class="stack">'+o+'</div>';
}
function stat(label, v, s, cls){
  return '<div class="stat '+(cls||'')+'"><div class="label">'+label+'</div><div class="v">'+v+'</div>'+(s?'<div class="s">'+s+'</div>':'')+'</div>';
}
function daysChart(t){
  var hist=PLAN.history(t, 30), dmin=PLAN.dailyMin();
  var pts=hist.map(function(p){ return {label:p.date, v:p.min===null?null:p.min/dmin}; });
  var known=pts.filter(function(p){ return p.v!==null; });
  if(known.length<2) return '<div class="empty" style="padding:36px 0">'+L('The line starts after two days of study. Every right answer pulls it down.',
    'দুই দিন পড়লেই রেখাটি শুরু হবে। প্রতিটি ঠিক উত্তর এটিকে নিচের দিকে নামায়।')+'</div>';
  return lineChart(pts, {fmt:function(v){ return Math.round(v); }, start:L('30 days ago','৩০ দিন আগে'), end:L('today','আজ')});
}
/* a line that draws itself, with a soft area under it */
function lineChart(points, opts){
  opts=opts||{};
  var W=640, H=opts.h||200, pad={l:34,r:12,t:12,b:24};
  var vals=points.filter(function(p){ return p.v!==null && p.v!==undefined; });
  var lo=opts.lo!==undefined?opts.lo:Math.min.apply(null, vals.map(function(p){ return p.v; }));
  var hi=opts.hi!==undefined?opts.hi:Math.max.apply(null, vals.map(function(p){ return p.v; }));
  if(hi===lo){ hi=lo+1; lo=Math.max(0,lo-1); }
  var pv=(hi-lo)*0.15; lo=Math.max(0,lo-pv); hi+=pv;
  var x=function(i){ return pad.l+(W-pad.l-pad.r)*(i/Math.max(1,points.length-1)); };
  var y=function(v){ return pad.t+(H-pad.t-pad.b)*(1-(v-lo)/(hi-lo)); };
  var o='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+h(opts.aria||L('trend','ধারা'))+'">', i;
  [0,0.5,1].forEach(function(g){
    var gv=lo+(hi-lo)*g;
    o+='<line class="grid" x1="'+pad.l+'" y1="'+y(gv).toFixed(1)+'" x2="'+(W-pad.r)+'" y2="'+y(gv).toFixed(1)+'"/>'+
       '<text x="'+(pad.l-8)+'" y="'+(y(gv)+3).toFixed(1)+'" text-anchor="end">'+h(opts.fmt?opts.fmt(gv):Math.round(gv))+'</text>';
  });
  var d='', area='', first=null, last=null;
  for(i=0;i<points.length;i++){
    if(points[i].v===null||points[i].v===undefined) continue;
    var px=x(i).toFixed(1), py=y(points[i].v).toFixed(1);
    d+=(first===null?'M':' L')+px+' '+py;
    if(first===null) first=i;
    last=i;
  }
  area=d+' L'+x(last).toFixed(1)+' '+(H-pad.b)+' L'+x(first).toFixed(1)+' '+(H-pad.b)+' Z';
  o+='<path class="area" d="'+area+'" fill="var(--accent-soft)" opacity=".6"/>';
  o+='<path class="draw" pathLength="1" d="'+d+'" fill="none" stroke="'+(opts.color||'var(--accent)')+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
  var lv=points[last].v;
  o+='<circle class="dot" style="animation-delay:1.3s" cx="'+x(last).toFixed(1)+'" cy="'+y(lv).toFixed(1)+'" r="4" fill="'+(opts.color||'var(--accent)')+'"/>'+
     '<text x="'+(x(last)-8).toFixed(1)+'" y="'+(y(lv)-10).toFixed(1)+'" text-anchor="end" style="fill:var(--ink);font-weight:600">'+
       h(opts.fmt?opts.fmt(lv):U.round(lv,1))+'</text>';
  o+='<text x="'+pad.l+'" y="'+(H-6)+'">'+h(opts.start||'')+'</text>'+
     '<text x="'+(W-pad.r)+'" y="'+(H-6)+'" text-anchor="end">'+h(opts.end||'')+'</text>';
  return o+'</svg>';
}
function predCard(t){
  var hard=DB.state().settings.hardPredict;
  var o='<section class="card pred"><div class="label">'+L('Prediction','পূর্বাভাস')+(hard?' &middot; '+L('hard','কঠিন'):'')+'</div>';
  var b=PREDICT.hsc(), by={};
  o+= b.ready ? '<div class="pn"><b data-count="'+U.round(b.marks,1)+'" data-dec="1" data-key="pred.hsc">'+U.round(b.marks,1)+'</b><span>/ '+b.outOf+'</span></div>'+
        '<div class="small" style="margin-top:4px">'+L(b.ready+' of '+b.readyOf+' papers have 20 answers on record.',b.readyOf+'টি পত্রের মধ্যে '+b.ready+'টিতে ২০টি উত্তর জমা হয়েছে।')+'</div>'
     : '<div class="pn"><b>&mdash;</b><span>/ '+b.outOf+'</span></div>'+
       '<div class="small" style="margin-top:4px">'+L('A paper\'s prediction shows once it has 20 answers on record.','কোনো পত্রের পূর্বাভাস দেখানো হয় সেখানে ২০টি উত্তর জমা হলে।')+'</div>';
  b.papers.forEach(function(sec){ (sec.ledger.charges||[]).forEach(function(c){ by[c.label]=(by[c.label]||0)+c.amount; }); });
  var list=Object.keys(by).map(function(k){ return {label:k, a:by[k]}; }).sort(function(x,y){ return y.a-x.a; });
  var top=list.length?list[0].a:0;
  o+='<p class="t">'+L('The number is held low on purpose. Sit the real exam and you should beat it about nine times in ten.','সংখ্যাটি ইচ্ছে করেই নিচে ধরা। আসল পরীক্ষা দিলে দশবারে প্রায় নয়বার এটিকে ছাড়িয়ে যাওয়া উচিত।')+'</p>';
  if(list.length){
    o+='<div class="label" style="margin-bottom:4px">'+L('What holds it down most','যা সবচেয়ে বেশি টেনে নামায়')+'</div>';
    list.slice(0,2).forEach(function(c){
      o+='<div class="charge"><span>'+h(c.label)+'</span><span class="bar thin" style="width:70px;margin-top:6px">'+
         '<i class="no" style="width:'+Math.max(8,Math.round(100*c.a/top))+'%"></i></span></div>';
    });
  }
  return o+'<div style="margin-top:12px"><a href="#/predict" class="link" data-go="predict">'+L('Why this number','এই সংখ্যা কেন')+' &rsaquo;</a></div></section>';
}
function bankCard(t){
  var n=GAME.mistakeBank(t).length;
  return '<section class="card pad-s"><div class="spread" style="align-items:center"><div><div class="label">'+L('Mistake bank','ভুলের ব্যাংক')+'</div>'+
    '<div class="row" style="gap:8px;margin-top:4px"><b class="mono" style="font-size:28px" data-count="'+n+'">'+n+'</b>'+
    '<span class="small">'+(n?L('waiting to be won back','ফিরিয়ে আনার অপেক্ষায়'):L('nothing owed','কিছু পাওনা নেই'))+'</span></div></div>'+
    (n?'<button class="btn sm" data-act="revenge">'+L('Clear them','মিটিয়ে ফেলুন')+'</button>':'')+'</div></section>';
}

/* ============================================================
   SETTINGS
   ============================================================ */
function settings(){
  var s=DB.state(), st=s.settings, dm=PLAN.dailyMin();
  var o='<div class="phead"><span class="kicker">'+L('Settings','সেটিংস')+'</span><h1>'+L('Settings','সেটিংস')+'</h1></div>';
  o+='<div class="setlist">'+
    row(L('Study time per day','দিনে পড়ার সময়'),
      L('Every "days left" in the app is worked out from this. At <b>'+U.mins(dm)+'</b> a day the rest takes '+PLAN.daysText(PLAN.track(track()).minutes)+'.',
        'অ্যাপের প্রতিটি "বাকি দিন" এখান থেকেই হিসাব হয়। দিনে <b>'+U.mins(dm)+'</b> হিসাবে বাকি পড়া লাগবে '+PLAN.daysText(PLAN.track(track()).minutes)+'।'),
      '<span class="timeset"><input class="field num" type="number" min="0" max="15" value="'+Math.floor(dm/60)+'" data-study="h" aria-label="'+L('hours','ঘণ্টা')+'">'+
      '<span>'+L('hr','ঘণ্টা')+'</span><input class="field num" type="number" min="0" max="59" value="'+(dm%60)+'" data-study="m" aria-label="'+L('minutes','মিনিট')+'">'+
      '<span>'+L('min','মিনিট')+'</span></span>')+
    row(L('Exam date','পরীক্ষার তারিখ'), L('The countdown on Start and in the top bar runs from here.','শুরুর পাতা আর ওপরের বারের কাউন্টডাউন এখান থেকেই চলে।'),
      '<input class="field" type="date" value="'+h(s.examDate.hsc||'')+'" data-change="examDate.hsc">')+
    row(L('Sound','শব্দ'), L('A chime when right, a low tone when wrong, coins as they land.','ঠিক হলে একটি টোকা, ভুল হলে নিচু সুর, কয়েন পৌঁছালে ঝনঝন।'), onoff('sound', s.sound))+
    row(L('Question timer','প্রশ্নের টাইমার'), L('Each question gets the paper\'s own time.','প্রতিটি প্রশ্নে প্রশ্নপত্রের নিজের সময়।'), onoff('timer', s.timer))+
    row(L('Night mode','রাতের মোড'), L('Warm dark colours for late study. The app always opens in day mode for a new visitor.','দেরি করে পড়ার জন্য উষ্ণ অন্ধকার রং।'), onoff('night', s.theme==='night'))+
    row(L('Hard prediction','কঠিন পূর্বাভাস'), L('Shows the mark you should beat nine times in ten.','যে নম্বর দশবারে নয়বার ছাড়িয়ে যাওয়া উচিত, সেটিই দেখায়।'), onoff('hardPredict', st.hardPredict))+
    row(L('Language','ভাষা'), L('Menus and buttons. Questions stay in the language of the book.','মেনু আর বাটনের ভাষা। প্রশ্ন বইয়ের ভাষাতেই থাকে।'),
        '<span class="seg2"><button type="button" class="'+(st.lang==='bn'?'':'on')+'" data-act="lang" data-arg="en">English</button>'+
        '<button type="button" lang="bn" class="'+(st.lang==='bn'?'on':'')+'" data-act="lang" data-arg="bn">বাংলা</button></span>')+
    row(L('Keyboard shortcuts','কিবোর্ড শর্টকাট'), L('For fast practice on a laptop.','ল্যাপটপে দ্রুত অনুশীলনের জন্য।'), '<button class="btn xs ghost" data-act="shortcuts">'+L('Show','দেখুন')+'</button>')+
    '</div>';

  o+='<div class="card pad-s" style="background:var(--quiet)"><div class="spread" style="align-items:center;flex-wrap:wrap">'+
    '<div><div class="ui" style="font-size:14.5px;font-weight:600">'+L('Your data','আপনার তথ্য')+'</div>'+
    '<div class="small" style="margin-top:2px">'+L('Everything is kept only in this browser. Clearing site data clears it too, so export a copy now and then.',
      'সব কিছু কেবল এই ব্রাউজারে রাখা। সাইট ডেটা মুছলে এটিও মুছে যাবে, তাই মাঝে মাঝে একটি কপি রাখুন।')+'</div></div>'+
    '<div class="btns"><button class="btn xs ghost" data-act="exportData">'+L('Export a copy','একটি কপি রাখুন')+'</button>'+
    '<button class="btn xs ghost" data-act="importData">'+L('Restore','ফিরিয়ে আনুন')+'</button>'+
    '<button class="link" style="color:var(--no);font-size:13px" data-act="wipe">'+L('Erase everything','সব মুছে ফেলুন')+'</button></div></div></div>';

  o+='<details class="more"><summary>'+L('More settings','আরও সেটিংস')+'</summary><div class="inner">'+moreSettings()+'</div></details>';
  o+='<a href="#/research" class="card research-card" data-go="research"><span class="kicker acc">'+L('Research-backed','গবেষণাভিত্তিক')+'</span>'+
     '<b>'+L('How Drakkhak teaches, and why','দ্রাক্ষাক কীভাবে শেখায়, আর কেন')+' &rsaquo;</b>'+
     '<span class="small">'+L('Every method in the app, the study behind it, and what it cannot do for you.','অ্যাপের প্রতিটি পদ্ধতি, তার পেছনের গবেষণা, আর যা এটি আপনার জন্য করতে পারে না।')+'</span></a>';
  return '<div class="stack s">'+o+'</div>';
}
function row(title, sub, ctl){
  return '<div class="setrow"><div><div class="st">'+title+'</div>'+(sub?'<div class="ss">'+sub+'</div>':'')+'</div><div class="ctl">'+ctl+'</div></div>';
}
function onoff(key, on){ return '<button type="button" class="onoff'+(on?' on':'')+'" data-act="flip" data-arg="'+key+'" aria-pressed="'+(on?'true':'false')+'">'+(on?L('On','চালু'):L('Off','বন্ধ'))+'</button>'; }
function seg(path, cur, list){
  return '<span class="seg2">'+list.map(function(x){
    return '<button type="button" class="'+(String(cur)===String(x[0])?'on':'')+'" data-act="setv" data-arg="'+path+'|'+x[0]+'">'+x[1]+'</button>';
  }).join('')+'</span>';
}
function moreSettings(){
  var s=DB.state(), st=s.settings, o='';
  o+='<div class="subhead">'+L('Sessions','সেশন')+'</div><div class="setlist">'+
    row(L('Questions per set','এক সেটে প্রশ্ন'), L('Every ordinary set started from Start and Practice. More than three quarters of each set is new questions until you have seen them all.',
        'শুরু আর অনুশীলন থেকে চালু করা প্রতিটি সাধারণ সেট। সব দেখা না হওয়া পর্যন্ত প্রতিটি সেটের তিন-চতুর্থাংশের বেশি নতুন প্রশ্ন।'), seg('settings.setSize', st.setSize, [[8,'8'],[12,'12'],[16,'16'],[20,'20'],[30,'30']]))+
    row(L('Your daily goal','আপনার দৈনিক লক্ষ্য'), L('Five questions or five minutes count the day for your streak; this is your own target.','পাঁচটি প্রশ্ন বা পাঁচ মিনিটেই দিনটি গোনা হয়; এটি আপনার নিজের লক্ষ্য।'),
        seg('settings.dailyQ', st.dailyQ, [[10,'10'],[20,'20'],[40,'40'],[60,'60']]))+
    row(L('How hard a set is','সেট কত কঠিন হবে'), L('A full paper ignores this: it is always built like the real paper.','পূর্ণ পত্র এটি মানে না: সেটি সবসময় আসল প্রশ্নপত্রের মতোই বাঁধা হয়।'),
        seg('settings.challenge', st.challenge||'exam', [['flow',L('Easy flow','সহজ স্রোত')],['exam',L('Board level','বোর্ড মান')],['brutal',L('Brutal','নির্দয়')]]))+
    row(L('Time-up alarm','সময় শেষের অ্যালার্ম'), L('Rings when a question\'s time runs out, until you stop it.','প্রশ্নের সময় শেষ হলে বাজে, যতক্ষণ না বন্ধ করেন।'), onoff('alarm', st.alarm!==false))+
    row(L('Second chance after a miss','ভুলের পরে দ্বিতীয় সুযোগ'), L('The next question is the same idea, one step easier.','পরের প্রশ্নটি একই বিষয়, এক ধাপ সহজ।'), onoff('redemption', st.redemption!==false))+
    row(L('Ask how sure I am','কতটা নিশ্চিত, জিজ্ঞেস করুন'), L('Say it before answering: a quarter more XP when right, 8 XP less when wrong.','উত্তরের আগে বলে দিন: ঠিক হলে এক-চতুর্থাংশ বেশি, ভুল হলে ৮ XP কম।'), onoff('confidence', !!st.confidence))+
    '</div>';
  o+='<div class="subhead">'+L('Feel','অনুভূতি')+'</div><div class="setlist">'+
    row(L('Animations','অ্যানিমেশন'), L('Screens rising, numbers counting, coins flying, confetti on a clean set.','পর্দা উঠে আসা, সংখ্যা গোনা, কয়েন ওড়া, নির্ভুল সেটে কনফেটি।'), onoff('effects', st.effects!==false))+
    row(L('Vibration','কম্পন'), L('A short tap when right, a longer one when wrong. Phones only.','ঠিক হলে ছোট টোকা, ভুল হলে একটু লম্বা। কেবল ফোনে।'), onoff('haptics', st.haptics!==false))+
    row(L('Break reminders','বিরতির কথা মনে করিয়ে দেওয়া'), L('After forty-five minutes you are reminded once to stand up.','পঁয়তাল্লিশ মিনিট পরে একবার উঠে দাঁড়ানোর কথা বলা হবে।'), onoff('breaks', st.breaks!==false))+
    row(L('Calm mode','শান্ত মোড'), L('Sound, animations and vibration off together.','শব্দ, অ্যানিমেশন আর কম্পন একসাথে বন্ধ।'), '<button class="btn xs ghost" data-act="calm">'+L('Turn them all off','সব বন্ধ করে দিন')+'</button>')+
    '</div>';
  var hours='<option value="-1"'+(st.reminderHour<0?' selected':'')+'>'+L('No reminder','মনে করানোর দরকার নেই')+'</option>';
  for(var i=5;i<24;i++){
    var hl = LBN() ? (i<12 ? (i+'টা সকাল') : i===12 ? '১২টা দুপুর' : (i-12)+'টা '+(i<16?'দুপুর':i<19?'বিকাল':'রাত'))
                   : (i<12 ? i+' am' : i===12 ? '12 noon' : (i-12)+' pm');
    hours+='<option value="'+i+'"'+(st.reminderHour===i?' selected':'')+'>'+hl+'</option>';
  }
  o+='<div class="subhead">'+L('You','আপনি')+'</div><div class="setlist">'+
    row(L('Reminder time','মনে করিয়ে দেওয়ার সময়'), L('Only rings while this page is open. There is no server to push anything.','কেবল এই পাতা খোলা থাকলেই বাজে। ঠেলে পাঠানোর কোনো সার্ভার নেই।'), '<select class="field" data-change-num="settings.reminderHour">'+hours+'</select>')+
    row(L('Your name','আপনার নাম'), L('Printed only on your certificate, nowhere else.','কেবল আপনার সনদে ছাপা হয়, আর কোথাও নয়।'), '<input class="field" type="text" style="width:170px" value="'+h(s.name||'')+'" data-change="name">')+
    row(L('What this study is for','এই পড়া কিসের জন্য'), L('Written on your record.','আপনার রেকর্ডে লেখা থাকবে।'), '<select class="field" data-change-dream>'+
        '<option value="">'+L('Not set','ঠিক করা হয়নি')+'</option>'+GAME.DREAMS.map(function(d){ return '<option value="'+d.id+'"'+(DB.game().dream===d.id?' selected':'')+'>'+h(d.name)+'</option>'; }).join('')+'</select>')+
    '</div>';
  o+='<div class="subhead">'+L('Scores and targets','স্কোর ও লক্ষ্য')+'</div><div class="setlist">'+
    row(L('Pass line','পাস রেখা'), L('Drawn on every score bar.','প্রতিটি স্কোর বারে আঁকা হয়।'), '<input class="field num" type="number" min="1" max="100" value="'+st.passLine+'" data-change-num="settings.passLine">')+
    row(L('Goal line','লক্ষ্য রেখা'), L('About 90% on board-level questions, with enough of them.','বোর্ড মানের প্রশ্নে প্রায় ৯০%, সাথে যথেষ্ট সংখ্যা।'), '<input class="field num" type="number" min="1" max="100" value="'+st.goalLine+'" data-change-num="settings.goalLine">')+
    row(L('MCQ target (%)','এমসিকিউ লক্ষ্য (%)'), L('The share of each paper\'s MCQ you are aiming for. The prediction is measured against it.','প্রতি পত্রের বহুনির্বাচনিতে আপনি যে শতাংশ চান। পূর্বাভাসের সাথে এটিই মিলিয়ে দেখা হয়।'),
        '<input class="field num" type="number" min="0" max="100" value="'+s.goal.hsc.pct+'" data-change-num="goal.hsc.pct">')+
    '</div>';
  /* The blueprint is the only place the per-question clock comes from, so
     it is editable: if a board notice changes the count or the minutes,
     nothing else in the app has to be touched. */
  o+='<div class="subhead">'+L('Exam blueprint','প্রশ্নপত্রের নকশা')+'</div><p class="small" style="margin-bottom:8px">'+
    L('Every question\'s clock comes from here. Check it against the board\'s latest notice, and change it here if it changes.',
      'প্রতিটি প্রশ্নের ঘড়ি এখান থেকেই আসে। বোর্ডের সর্বশেষ নির্দেশনার সাথে মিলিয়ে নিন, বদলে গেলে এখানেই বদলান।')+
    '</p><div class="setlist"><div class="scrollx"><table class="tbl" style="margin:0">'+
    '<tr><th style="padding-left:18px">'+L('Paper','পত্র')+'</th><th class="n">'+L('Questions','প্রশ্ন')+'</th><th class="n">'+L('Seconds each','প্রতি প্রশ্নে সেকেন্ড')+'</th><th class="n" style="padding-right:18px">'+L('Total','মোট')+'</th></tr>';
  for(var sk in ICE.sections){
    var sec=ICE.sections[sk];
    o+='<tr><td style="padding-left:18px">'+h(ICE.sname(sec))+'</td>'+
      '<td class="n"><input class="field num" type="number" value="'+sec.n+'" data-blueprint="'+h(sk)+'|n"></td>'+
      '<td class="n"><input class="field num" type="number" value="'+ICE.pace(sk)+'" data-blueprint="'+h(sk)+'|spq"></td>'+
      '<td class="n" style="padding-right:18px">'+ICE.paperMinutes(sk)+L(' min',' মিনিট')+'</td></tr>';
  }
  o+='</table></div></div>';
  var fin=ICE._stats||{};
  o+='<p class="small" style="margin-top:18px">'+L(U.num(ICE.Q.length)+' questions loaded ('+(fin.generated||0)+' generated and checked), '+
    ICE.T.length+' cards, '+Object.keys(ICE.topics).length+' chapters. First opened '+h(s.firstOpen)+', '+U.mins(DB.totalMins())+' logged, '+
    U.num(s.log.length)+' answers on record.',
    ICE.Q.length+'টি প্রশ্ন লোড হয়েছে ('+(fin.generated||0)+'টি জেনারেট করা ও যাচাই করা), '+
    ICE.T.length+'টি কার্ড, '+Object.keys(ICE.topics).length+'টি অধ্যায়। প্রথম খোলা হয় '+h(s.firstOpen)+', '+U.mins(DB.totalMins())+' জমা, '+
    s.log.length+'টি উত্তর রেকর্ডে আছে।')+'</p>';
  return o;
}

/* ============================================================
   ACTIONS — everything a button can do
   ============================================================ */
function quickStart(){
  RUN.start({track:track(), mode:'plan', n:DB.state().settings.setSize, title:L('The plan','পরিকল্পনা'), back:'today'});
}
function reviewDue(){
  var due=AB.dueItems(track(), 20).map(function(d){ return d.q; });
  if(!due.length) return toast(L('Nothing came back today. Everything you missed is still resting.','আজ কিছু ফেরত আসেনি। যা ভুল করেছেন সব এখনও বিশ্রামে।'));
  RUN.start({queue:due, track:track(), mode:'due', title:L('Due back today','যা আজ ফেরত এসেছে'), back:'practice'});
}
function weakSet(){
  RUN.start({track:track(), mode:'weak', n:DB.state().settings.setSize, title:L('Weak spots','দুর্বল জায়গা'), back:'practice'});
}
function speedDrill(sk){
  RUN.start({track:track(), sec:sk||null, mode:'speed', n:DB.state().settings.setSize, title:L('Speed drill','গতির অনুশীলন'), back:sk?'section':'practice', backParam:sk||null});
}
function secSet(sk, mode){
  var sec=ICE.sections[sk];
  RUN.start({track:sec.track, sec:sk, mode:mode||'adaptive', n:DB.state().settings.setSize,
             title:ICE.sname(sec), back:'section', backParam:sk});
}
function topicSet(id){
  var tp=ICE.topics[id];
  RUN.start({track:tp.track, sec:tp.sec, topic:id, mode:'adaptive',
             n:Math.min(DB.state().settings.setSize, AB.inTopic(id).length),
             title:ICE.tname(tp), back:'topic', backParam:id});
}
function revenge(){
  var qs=GAME.mistakeBank(track());
  if(!qs.length) return toast(L('Nothing owed. Every question you missed has been won back.','কিছু পাওনা নেই। যা ভুল করেছিলেন সব ফিরিয়ে এনেছেন।'));
  RUN.start({queue:U.sample(qs, Math.min(qs.length, DB.state().settings.setSize)),
             track:track(), mode:'redo', title:L('Mistake bank','ভুলের ব্যাংক'), back:'practice'});
}
function resumeLoop(){
  var loop=QUEST.loop(); if(!loop) return;
  QUEST.clearLoop();
  if(loop.topic) topicSet(loop.topic); else quickStart();
}
function openChest(){
  var g=DB.game();
  if(cameBack){ cameBack=null; }
  if(g.chests<=0){ toast(L('No chest is waiting.','অপেক্ষায় কোনো সিন্দুক নেই।')); render(); return; }
  var d=sheet('<div class="celebrate"><span class="kicker acc">'+L('A chest','একটি সিন্দুক')+'</span><span class="chest shake" id="chestArt">&#127873;</span>'+
    '<div id="chestOut" class="small">'+L('Opening&hellip;','খুলছে&hellip;')+'</div></div>');
  setTimeout(function(){
    var r=GAME.openChest(), art=d.querySelector('#chestArt'), out=d.querySelector('#chestOut');
    if(!r){ closeSheet(); return; }
    if(art){ art.classList.remove('shake'); art.classList.add('open'); FX.burst(art, 22, r.rare?'acc':'ok'); }
    if(out) out.outerHTML='<div class="reward">'+h(r.text)+'</div>'+(r.rare?'<span class="kicker acc">'+L('Rare','দুর্লভ')+'</span>':'')+
      '<div class="btns" style="justify-content:center;margin-top:10px">'+
      (DB.game().chests?'<button class="btn" data-act="openChest">'+L('Open another','আরেকটি খুলুন')+' ('+DB.game().chests+')</button>':'')+
      '<button class="btn ghost" data-close>'+L('Done','শেষ')+'</button></div>';
    refreshNav(); paintChrome();
  }, 950);
}
function dismissNudge(id){
  var s=DB.state();
  if(!s.nudgeOff || s.nudgeOff.day!==DB.today()) s.nudgeOff={day:DB.today(), ids:{}};
  s.nudgeOff.ids[id]=1;
  if(id==='back') cameBack=null;
  DB.save(); render();
}
function flip(key){
  var s=DB.state();
  if(key==='night'){ s.theme = s.theme==='night'?'day':'night'; }
  else if(key==='sound'){ s.sound=!s.sound; FX.setMuted(!s.sound); if(s.sound) FX.play('correct'); }
  else if(key==='timer'){ s.timer=!s.timer; }
  else s.settings[key]=!s.settings[key];
  DB.save(); applyTheme();
  if(key==='effects' && s.settings.effects===false) toast(L('Animations off.','অ্যানিমেশন বন্ধ।'));
  /* during a question the switches must not throw the question away: repaint in place */
  if(route==='run' && RUN.active()){ paintChrome(); if(key!=='sound') repaintView(); return; }
  render();
}
function setPath(path, val){
  var s=DB.state(), parts=path.split('.'), o=s;
  for(var i=0;i<parts.length-1;i++) o=o[parts[i]];
  o[parts[parts.length-1]] = /^-?\d+(\.\d+)?$/.test(val) ? Number(val) : val;
  DB.save(); PLAN.invalidate();
  if(path==='settings.reminderHour'){ if(Number(val)>=0){ QUEST.askNotify(); } QUEST.armReminder(); }
  render(); toast(L('Saved.','সংরক্ষিত।'));
}
/* study time comes in as hours and minutes, and is kept as minutes */
function setStudy(){
  var hEl=document.querySelector('[data-study="h"]'), mEl=document.querySelector('[data-study="m"]');
  var hh=Math.max(0, parseInt(hEl&&hEl.value,10)||0), mm=Math.max(0, parseInt(mEl&&mEl.value,10)||0);
  var st=DB.state().settings;
  st.dailyMin=U.clamp(hh*60+mm, 15, 900);
  DB.save(); PLAN.invalidate(); render();
  toast(L('Study time: '+U.mins(st.dailyMin)+' a day.','পড়ার সময়: দিনে '+U.mins(st.dailyMin)+'।'));
}
function calm(){
  var s=DB.state();
  s.sound=false; s.settings.effects=false; s.settings.haptics=false;
  FX.setMuted(true); DB.save(); applyTheme(); render();
  toast(L('Sound, animations and vibration are off. Nothing you earned was touched.','শব্দ, অ্যানিমেশন আর কম্পন বন্ধ। আপনার অর্জিত কিছুই ছোঁয়া হয়নি।'));
}
function pickDream(id){
  if(!id) return;
  GAME.setDream(id);
  render(); toast(L('Saved.','সংরক্ষিত।'));
}
function uncredit(id){ MODES.dropCredit(id); toast(L('Back in the plan.','আবার পরিকল্পনায় ফিরল।')); render(); }
/* The blueprint is what puts the clock on every question, so a change
   here has to reach the items that were already indexed. */
function setBlueprint(sk, field, val){
  var v=parseInt(val,10); if(!isFinite(v)||v<1) return;
  if(field==='spq' && v>600) return;
  ICE.sections[sk][field]=v;
  var s=DB.state(); if(!s.blueprint) s.blueprint={};
  (s.blueprint[sk]=s.blueprint[sk]||{})[field]=v;
  DB.save();
  if(field==='spq'){
    var pace=ICE.pace(sk);
    for(var i=0;i<ICE.Q.length;i++) if(ICE.Q[i]._sec===sk) ICE.Q[i]._pace=pace;
  }
  PLAN.invalidate(); render(); toast(L('Blueprint saved.','নকশা সংরক্ষিত।'));
}
function exportData(){
  var blob=new Blob([DB.exportJSON()], {type:'application/json'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='drakkhak-hsc-'+DB.today()+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  toast(L('A copy is in your downloads.','একটি কপি আপনার ডাউনলোডে রাখা হলো।'));
}
function importData(){
  var inp=document.createElement('input'); inp.type='file'; inp.accept='application/json,.json';
  inp.onchange=function(){
    var f=inp.files&&inp.files[0]; if(!f) return;
    var r=new FileReader();
    r.onload=function(){
      var ok=false;
      try{ ok=DB.importJSON(String(r.result)); }catch(e){ ok=false; }
      if(ok){ DB.state().onboarded=true; DB.save(); applyTheme(); FX.setMuted(!DB.state().sound); buildNav(); toast(L('Restored.','ফিরিয়ে আনা হয়েছে।')); go('today'); }
      else toast(L('That file is not a copy from this app.','ফাইলটি এই অ্যাপের কপি নয়।'));
    };
    r.readAsText(f);
  };
  inp.click();
}
function wipe(){
  sheet('<span class="kicker" style="color:var(--no)">'+L('Erase everything','সব মুছে ফেলুন')+'</span><h2>'+L('Start again from nothing?','একেবারে শূন্য থেকে আবার শুরু করবেন?')+'</h2>'+
    '<p class="small" style="margin-bottom:16px">'+L('Every answer, minute, streak, badge and coin goes, and cannot be brought back. If there is any chance you want it, export a copy first.',
      'প্রতিটি উত্তর, মিনিট, ধারা, ব্যাজ আর কয়েন চলে যাবে, আর ফেরানো যাবে না। সামান্যও সম্ভাবনা থাকলে আগে একটি কপি রেখে দিন।')+'</p>'+
    '<div class="btns two"><button class="btn ghost" data-close>'+L('Keep it','রেখে দিন')+'</button>'+
    '<button class="btn" style="background:var(--no);border-color:var(--no)" data-act="wipeNow">'+L('Erase','মুছে ফেলুন')+'</button></div>');
}
function shortcuts(){
  sheet('<span class="kicker">'+L('Keyboard','কিবোর্ড')+'</span><h2>'+L('Shortcuts','শর্টকাট')+'</h2>'+
    '<p class="small" style="margin:-6px 0 12px">'+L('Options are printed ক খ গ ঘ, as on the board\'s paper, but you answer with A&ndash;D or 1&ndash;4 &mdash; nobody changes keyboard layout in the middle of a question.',
      'অপশন ছাপা হয় ক খ গ ঘ, কিন্তু উত্তর দিতে হয় A&ndash;D বা 1&ndash;4 &mdash; প্রশ্নের মাঝে কেউ কিবোর্ডের লেআউট বদলায় না।')+'</p><div class="kbdlist">'+
    '<span><kbd>A</kbd>&ndash;<kbd>D</kbd></span><span>'+L('ক খ গ ঘ (or 1&ndash;4)','ক খ গ ঘ (বা 1&ndash;4)')+'</span>'+
    '<span><kbd>space</kbd></span><span>'+L('Next question, or start a set','পরের প্রশ্ন, বা সেট শুরু')+'</span>'+
    '<span><kbd>E</kbd></span><span>'+L('Explanation','ব্যাখ্যা')+'</span>'+
    '<span><kbd>S</kbd></span><span>'+L('Skip the question','প্রশ্ন বাদ দিন')+'</span>'+
    '<span><kbd>Esc</kbd></span><span>'+L('Stop the alarm, close a window','অ্যালার্ম বন্ধ, উইন্ডো বন্ধ')+'</span>'+
    '<span><kbd>T</kbd></span><span>'+L('Timer on or off','টাইমার চালু বা বন্ধ')+'</span>'+
    '<span><kbd>N</kbd></span><span>'+L('Night mode','রাতের মোড')+'</span>'+
    '<span><kbd>M</kbd></span><span>'+L('Sound','শব্দ')+'</span>'+
    '<span><kbd>R</kbd></span><span>'+L('Your record','আপনার রেকর্ড')+'</span>'+
    '<span><kbd>?</kbd></span><span>'+L('This list','এই তালিকা')+'</span></div>');
}

var ACT={
  track:function(t){ setTrack(t); },
  quickStart:quickStart, reviewDue:reviewDue, weakSet:weakSet, revenge:revenge, resumeLoop:resumeLoop,
  secSet:function(sk){ secSet(sk,'adaptive'); },
  secWeak:function(sk){ secSet(sk,'weak'); },
  secSpeed:function(sk){ speedDrill(sk); },
  topicSet:function(id){ topicSet(id); },
  blitz:function(){ MODES.start('blitz', {track:track(), back:'practice'}); },
  mode:function(arg){ var p=String(arg).split('|'); var o={track:track()}; if(p[1]) o[p[0]==='admission'?'sec':'topic']=p[1]; MODES.start(p[0], o); },
  qotd:function(){ PAGES.doQotd(); },
  repair:function(){ QUEST.repair(); render(); },
  openChest:openChest, dismiss:dismissNudge, flip:flip, calm:calm,
  setv:function(arg){ var p=arg.split('|'); setPath(p[0], p[1]); },
  lang:function(l){ I18N.set(l); buildNav(); render(); },
  shortcuts:shortcuts, exportData:exportData, importData:importData, wipe:wipe,
  wipeNow:function(){ DB.reset(); closeSheet(true); applyTheme(); FX.setMuted(!DB.state().sound); buildNav(); go('welcome'); toast(L('Erased.','মুছে ফেলা হয়েছে।')); },
  welcomeMore:function(){ welcomeMore=!welcomeMore; render(); },
  startWelcome:function(){
    var s=DB.state();
    s.onboarded=true; DB.save();
    MODES.start('diag', {track:'hsc', n:5, noBrief:true, title:L('Five questions','পাঁচটি প্রশ্ন'), back:'today'});
  },
  skipWelcome:function(){ DB.state().onboarded=true; DB.save(); go('today'); },
  uncredit:uncredit
};
function act(name, fn){ ACT[name]=fn; }

/* inputs that save themselves when they change */
document.addEventListener('change', function(e){
  var t=e.target;
  if(t.hasAttribute('data-study')) return setStudy();
  if(t.hasAttribute('data-change')) return setPath(t.getAttribute('data-change'), t.value);
  if(t.hasAttribute('data-change-num')) return setPath(t.getAttribute('data-change-num'), String(Number(t.value)));
  if(t.hasAttribute('data-change-dream')) return pickDream(t.value);
  if(t.hasAttribute('data-blueprint')){ var p=t.getAttribute('data-blueprint').split('|'); return setBlueprint(p[0], p[1], t.value); }
  if(t.hasAttribute('data-note')) return PAGES.saveNote(t.getAttribute('data-note'), t.value);
  if(t.hasAttribute('data-change-scope')) return STATS.setScope(t.value);
});

/* ---------- a card counts as read when it has actually been in front of you ---------- */
var tkObs=null, tkTimers={};
function observeTricks(){
  if(tkObs){ tkObs.disconnect(); tkObs=null; }
  for(var k in tkTimers) clearTimeout(tkTimers[k]);
  tkTimers={};
  if(!window.IntersectionObserver || !viewEl) return;
  var nodes=viewEl.querySelectorAll('.trick[data-tk]');
  if(!nodes.length) return;
  tkObs=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      var id=en.target.getAttribute('data-tk');
      if(en.isIntersecting && en.intersectionRatio>=0.5){
        if(!tkTimers[id]) tkTimers[id]=setTimeout(function(){ markTrickRead(id); }, 2200);
      } else if(tkTimers[id]){ clearTimeout(tkTimers[id]); tkTimers[id]=null; }
    });
  }, {threshold:[0.5]});
  for(var i=0;i<nodes.length;i++) tkObs.observe(nodes[i]);
}
function markTrickRead(id){
  var s=DB.state();
  if(s.readTricks[id]) return;
  s.readTricks[id]=Date.now(); DB.save(); DB.bump('tricks');
  GAME.check('trick');
}

/* called once at boot: a long gap earns a warm welcome, said once */
function noteComeback(){ cameBack=QUEST.comeback(); }

return {
  go:go, render:render, repaintView:repaintView, current:current, toast:toast,
  sheet:sheet, closeSheet:closeSheet, sheetOpen:sheetOpen,
  celebrate:celebrate, flushCelebrations:flushCelebrations,
  applyTheme:applyTheme, paintChrome:paintChrome, holdChrome:holdChrome, holding:holding,
  setTrack:setTrack, readHash:readHash, buildNav:buildNav,
  quickStart:quickStart, reviewDue:reviewDue, weakSet:weakSet, secSet:secSet, topicSet:topicSet,
  speedDrill:speedDrill, revenge:revenge, openChest:openChest, flip:flip, markTrickRead:markTrickRead,
  act:act, h:h, stat:stat, link:link, starMarks:starMarks, lineChart:lineChart, plural:plural,
  dShort:dShort, dLong:dLong, noteComeback:noteComeback, shortcuts:shortcuts, donut:donut,
  subjectRows:subjectRows, chNo:chNo
};
})();
