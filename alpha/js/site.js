/* ===========================================================
   SITE — what the owner set in the admin panel, applied here.

   Loads first, before the question files. It paints the last known
   settings straight away so nothing flickers, then asks the server
   for newer ones. No server, no network, a page opened from disk:
   everything falls back to the defaults below and the app works as
   it always has.

   It also sends the anonymous study totals the dashboard counts: a
   random id made by this browser, minutes and answer counts. No name,
   no answers. A student can turn this off in Settings.

   Keep DEFAULTS in step with api/_lib.php (php tools/check-site.php).
   =========================================================== */
var SITE = (function(){

var DEFAULTS={
  'maintenance.on':false,'maintenance.title':'We will be back soon',
  'maintenance.message':'Drakkhak is being improved. Your progress is safe in this browser.',
  'notice.on':false,'notice.text':'','notice.link':'','notice.tone':'accent','notice.dismiss':true,
  'layout.nav':'left','layout.start':'classic',
  'layout.order':['hero','road','nudge','mistakes','ahead','weeks','subjects'],'layout.hide':[],
  'layout.width':'normal','layout.density':'normal','layout.corners':'soft','layout.text':100,
  'look.accent':'','look.css':'',
  'bar.brand':'Drakkhak','bar.community':true,'bar.search':true,'bar.xp':true,'bar.coins':true,'bar.days':true,
  'bar.sound':true,'bar.timer':true,'bar.night':true,
  'page.map':true,'page.practice':true,'page.progress':true,'page.modes':true,'page.mock':true,'page.tricks':true,
  'page.quests':true,'page.plan':true,'page.stats':true,'page.predict':true,'page.wrapped':true,'page.record':true,
  'page.badges':true,'page.collection':true,'page.shop':true,'page.social':true,'page.research':true,
  'game.effects':true,'game.cert':true,
  'ed.hsc':true,'ed.ssc':true,'ed.default':'hsc','subj.hide':[],
  'def.lang':'en','def.theme':'day','def.sound':true,'def.timer':true,'def.setSize':16,'def.dailyMin':119,'def.dailyQ':20,
  'def.challenge':'exam','def.alarm':true,'def.redemption':true,'def.confidence':false,'def.breaks':true,'def.pushAt':0,
  'rule.newShare':75,
  'social.love':true,'social.comment':true,'social.hold':false,'shop.more':true,
  'fun.on':false,'fun.today':true,'fun.spin':false,'fun.combo':true,'fun.lucky':false,'fun.crowd':true,'fun.league':true,'fun.finish':true,'fun.motion':true,
  'stats.on':true
};
var CACHE='drakkhak.site', RELOADS=['ed.hsc','ed.ssc','ed.default','subj.hide'];
var preview=/[?&]adminpreview=1\b/.test(location.search);
var V={}, rev=0;

function load(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function keep(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

function get(k){ return Object.prototype.hasOwnProperty.call(V,k) ? V[k] : DEFAULTS[k]; }
function on(k){ return get(k)!==false; }
function fun(k){ return !!get('fun.on') && on('fun.'+k); }
function routeOn(r){ return DEFAULTS['page.'+r]===undefined ? true : on('page.'+r); }

/* which of HSC and SSC this browser gets, with the owner's switches respected */
function edition(){
  var saved=load('iceskep.edition'), ed=saved==='ssc'||saved==='hsc' ? saved : get('ed.default');
  if(ed==='hsc' && !on('ed.hsc')) ed='ssc';
  if(ed==='ssc' && !on('ed.ssc')) ed='hsc';
  if(saved!==ed && !preview) keep('iceskep.edition', ed);
  return ed;
}
function onlyEdition(){ return !(on('ed.hsc') && on('ed.ssc')); }

/* ---------- the whole page: attributes the stylesheet reads ---------- */
function shade(hex, f){
  var n=parseInt(hex.slice(1),16), c=[n>>16&255,n>>8&255,n&255].map(function(x){ return Math.round(x*f); });
  return '#'+c.map(function(x){ return ('0'+x.toString(16)).slice(-2); }).join('');
}
function paintRoot(){
  var r=document.documentElement;
  r.setAttribute('data-nav', get('layout.nav'));
  r.setAttribute('data-width', get('layout.width'));
  r.setAttribute('data-density', get('layout.density'));
  r.setAttribute('data-corners', get('layout.corners'));
  r.style.setProperty('--view-zoom', String((get('layout.text')||100)/100));
  var hide=[];
  ['community','search','xp','coins','days','sound','timer','night'].forEach(function(k){ if(!on('bar.'+k)) hide.push(k); });
  r.setAttribute('data-hide', hide.join(' '));
  if(get('fun.on')) r.setAttribute('data-fun', on('fun.motion')?'motion':'calm'); else r.removeAttribute('data-fun');
  var style=document.getElementById('siteStyle');
  if(!style){ style=document.createElement('style'); style.id='siteStyle'; document.head.appendChild(style); }
  var a=get('look.accent'), css='';
  if(a) css+=':root,html[data-theme="night"]{--accent:'+a+';--accent-press:'+shade(a,.86)+';--accent-soft:color-mix(in srgb,'+a+' 16%,var(--card))}'+
    '.t-roadsvg .rw.done,.t-roadsvg .rn.now{stroke:'+a+'}.t-roadsvg .rn.now{fill:'+a+'}';
  style.textContent=css+String(get('look.css')||'');
}

/* ---------- a banner, and the closed sign ---------- */
function safeLink(u){ return /^(https?:\/\/|\/(?!\/)|#\/)/i.test(u||'') ? u : ''; }
function text(s){ return document.createTextNode(String(s==null?'':s)); }
function noticeKey(){ return 'n'+String(get('notice.text')).length+':'+String(get('notice.text')).slice(0,40); }
function paintNotice(){
  var view=document.getElementById('view'); if(!view) return;
  var box=document.getElementById('siteNotice');
  var show=on('notice.on') && get('notice.on') && get('notice.text') && (preview || load('drakkhak.noticeDone')!==noticeKey());
  if(!show){ if(box) box.parentNode.removeChild(box); return; }
  if(!box){ box=document.createElement('div'); box.id='siteNotice'; view.parentNode.insertBefore(box,view); }
  box.className='snotice tone-'+get('notice.tone');
  box.setAttribute('role','status');
  box.innerHTML='';
  var msg=document.createElement('span'); msg.className='sn-t'; msg.appendChild(text(get('notice.text'))); box.appendChild(msg);
  var u=safeLink(get('notice.link'));
  if(u){ var a=document.createElement('a'); a.href=u; a.className='sn-a'; a.appendChild(text('Open')); box.appendChild(a); }
  if(get('notice.dismiss')){
    var x=document.createElement('button'); x.type='button'; x.className='sn-x'; x.setAttribute('aria-label','Dismiss'); x.innerHTML='&times;';
    x.onclick=function(){ keep('drakkhak.noticeDone', noticeKey()); paintNotice(); };
    box.appendChild(x);
  }
}
function paintClosed(){
  var box=document.getElementById('siteClosed');
  if(!get('maintenance.on')){ if(box) box.parentNode.removeChild(box); document.body.classList.remove('site-closed'); return; }
  if(!box){ box=document.createElement('div'); box.id='siteClosed'; box.setAttribute('role','alert'); document.body.appendChild(box); }
  box.innerHTML='<div class="sc-in"><img src="img/logo.svg" alt="" width="64" height="64"><h1></h1><p></p></div>';
  box.querySelector('h1').appendChild(text(get('maintenance.title')));
  box.querySelector('p').appendChild(text(get('maintenance.message')));
  document.body.classList.add('site-closed');
}
function paintBrand(){
  var names=document.querySelectorAll('.top .brand-name');
  for(var i=0;i<names.length;i++) names[i].textContent=get('bar.brand')||DEFAULTS['bar.brand'];
}

/* ---------- applying a set of values ---------- */
function paintAll(){
  paintRoot();
  if(document.body){ paintBrand(); paintNotice(); paintClosed(); }
}
function same(a,b){ return JSON.stringify(a)===JSON.stringify(b); }
function adopt(values, r){
  var old=V, needReload=false;
  V=values||{}; rev=r||0;
  RELOADS.forEach(function(k){
    var x=Object.prototype.hasOwnProperty.call(old,k)?old[k]:DEFAULTS[k];
    if(!same(x,get(k))) needReload=true;
  });
  return needReload;
}
function repaintApp(){
  paintAll();
  if(window.UI && UI.current && window.DB && DB.state()){
    UI.applyTheme();
    UI.buildNav();
    if(!routeOn(UI.current())) UI.go('today');
    else if(!(window.RUN && RUN.active())) UI.render();
  }
}
function fetchNew(){
  if(preview || location.protocol.indexOf('http')!==0 || !window.fetch) return;
  fetch('api/site.php',{cache:'no-cache',credentials:'omit'}).then(function(r){
    if(r.status!==200) return null;
    if((r.headers.get('content-type')||'').indexOf('json')<0) return null;
    return r.json();
  }).then(function(o){
    if(!o || typeof o.rev!=='number' || o.rev===rev) return;
    keep(CACHE, JSON.stringify({rev:o.rev, v:o.v}));
    var reload=adopt(o.v, o.rev);
    if(reload){ location.reload(); return; }
    repaintApp();
  }).catch(function(){});
}

/* ---------- the panel's live preview talks to this page ---------- */
function listen(){
  window.addEventListener('message', function(e){
    if(e.origin!==location.origin || e.source!==window.parent) return;
    var d=e.data||{};
    if(d.type==='drk-preview'){
      try{ sessionStorage.setItem('drakkhak.sitePreview', JSON.stringify(d.values||{})); }catch(x){}
      if(adopt(d.values||{}, 0)){ location.reload(); return; }
      repaintApp();
    }
    if(d.type==='drk-route' && window.UI && d.route){ UI.go(d.route); }
    if(d.type==='drk-theme'){ document.documentElement.setAttribute('data-theme', d.theme==='night'?'night':'day'); }
  });
  window.parent.postMessage({type:'drk-ready'}, location.origin);
}

/* ---------- a new record's first settings, and a pushed change ---------- */
function seed(f){
  f.theme=get('def.theme'); f.sound=on('def.sound'); f.timer=on('def.timer');
  var st=f.settings;
  st.lang=get('def.lang'); st.setSize=get('def.setSize'); st.dailyMin=get('def.dailyMin'); st.dailyQ=get('def.dailyQ');
  st.challenge=get('def.challenge'); st.alarm=on('def.alarm'); st.redemption=on('def.redemption');
  st.confidence=get('def.confidence'); st.breaks=on('def.breaks');
  st.shareStats=true;
  return f;
}
function reconcile(S){
  if(preview) S.onboarded=true;
  var at=get('def.pushAt')||0;
  if(at && (S.sitePush||0)<at){
    var f=seed({settings:{}});
    S.theme=f.theme; S.sound=f.sound; S.timer=f.timer;
    for(var k in f.settings) if(k!=='shareStats') S.settings[k]=f.settings[k];
    S.sitePush=at;
  }
}
/* the share of a set that is new. The owner's rule is more than 75% */
function newShare(n){ return Math.min(n, Math.floor(n*(get('rule.newShare')/100))+1); }

/* a paper or subject switched off simply stops existing for this visitor */
function pruneSubjects(ICE){
  var off=get('subj.hide'); if(!off || !off.length) return;
  var gone={}, k;
  for(k in ICE.sections) if(off.indexOf(ICE.sections[k].subj)>=0){ gone[k]=1; delete ICE.sections[k]; }
  var dead={};
  for(k in ICE.topics) if(gone[ICE.topics[k].sec]){ dead[k]=1; delete ICE.topics[k]; }
  ICE.subjects=ICE.subjects.filter(function(s){ return off.indexOf(s.id)<0; });
  for(k in ICE.path) ICE.path[k]=ICE.path[k].filter(function(id){ return !dead[id]; });
  function live(x){ return !dead[x.topic]; }
  ICE.Q=ICE.Q.filter(live); ICE.P=ICE.P.filter(live); ICE.T=ICE.T.filter(live);
}

/* ---------- Start: which blocks, in what arrangement ---------- */
function startLayout(){ return get('layout.start'); }
function startPage(b, L){
  var hidden=get('layout.hide')||[];
  function B(k){ return hidden.indexOf(k)>=0 ? '' : (b[k]||''); }
  function row(cls, keys){
    var parts=keys.map(B).filter(Boolean);
    return parts.length ? '<section class="'+cls+' n'+parts.length+'">'+parts.join('')+'</section>' : '';
  }
  var lay=startLayout(), o='';
  switch(lay){
    case 'list':
      var n=0;
      ['hero','mistakes','ahead','road','weeks','subjects'].forEach(function(k){
        var h=B(k); if(!h) return; n++;
        o+='<div class="l-step"><span class="l-no">'+n+'</span><div class="l-body">'+h+'</div></div>';
      });
      return '<div class="t-page l-list">'+B('nudge')+o+'</div>';
    case 'road':
      return '<div class="t-page l-road">'+B('road')+B('nudge')+row('t-top',['hero','mistakes'])+row('t-top even',['ahead','weeks'])+B('subjects')+'</div>';
    case 'subjects':
      return '<div class="t-page l-subjects">'+B('subjects')+B('nudge')+row('t-top',['hero','road'])+row('t-three',['mistakes','ahead','weeks'])+'</div>';
    case 'columns':
      return '<div class="t-page l-columns"><div class="l-col">'+B('road')+B('weeks')+'</div><div class="l-col mid">'+B('hero')+B('nudge')+'</div><div class="l-col">'+B('mistakes')+B('ahead')+'</div>'+B('subjects')+'</div>';
    case 'split':
      return '<div class="t-page l-split"><div class="l-left">'+B('hero')+'</div><div class="l-right">'+B('nudge')+B('road')+B('mistakes')+B('ahead')+B('weeks')+B('subjects')+'</div></div>';
    case 'tabs':
      var tabs=[['road',L('Your road','আপনার পথ')],['mistakes',L('Mistakes','ভুল')],['ahead',L('Next','পরে')],['weeks',L('12 weeks','১২ সপ্তাহ')],['subjects',L('Subjects','বিষয়')]]
        .filter(function(t){ return !!B(t[0]); });
      var cur=tabs.some(function(t){ return t[0]===startTab; }) ? startTab : (tabs[0]&&tabs[0][0]);
      o='<div class="l-tabs-bar" role="tablist">'+tabs.map(function(t){
        return '<button type="button" role="tab" data-stab="'+t[0]+'" aria-selected="'+(t[0]===cur)+'" class="'+(t[0]===cur?'on':'')+'">'+t[1]+'</button>'; }).join('')+'</div>';
      o+=tabs.map(function(t){ return '<div class="l-panel" data-spanel="'+t[0]+'"'+(t[0]===cur?'':' hidden')+'>'+B(t[0])+'</div>'; }).join('');
      return '<div class="t-page l-tabs">'+B('hero')+B('nudge')+o+'</div>';
    case 'strip':
      return '<div class="t-page l-strip">'+(b.strip||'')+B('nudge')+row('t-top',['hero','road'])+row('t-three',['mistakes','ahead','weeks'])+B('subjects')+'</div>';
    case 'focus':
      return '<div class="t-page l-focus">'+B('hero')+'</div>';
    case 'custom':
      (get('layout.order')||DEFAULTS['layout.order']).forEach(function(k){ o+=B(k); });
      return '<div class="t-page l-custom">'+o+'</div>';
  }
  return '<div class="t-page">'+row('t-top',['hero','road'])+B('nudge')+row('t-three',['mistakes','ahead','weeks'])+B('subjects')+'</div>';
}
var startTab='';
function onTabClick(e){
  var t=e.target.closest ? e.target.closest('[data-stab]') : null; if(!t) return;
  startTab=t.getAttribute('data-stab');
  var page=t.closest('.l-tabs'); if(!page) return;
  var bs=page.querySelectorAll('[data-stab]'), ps=page.querySelectorAll('[data-spanel]'), i;
  for(i=0;i<bs.length;i++){ var o=bs[i]===t; bs[i].classList.toggle('on',o); bs[i].setAttribute('aria-selected',o?'true':'false'); }
  for(i=0;i<ps.length;i++) ps[i].hidden=ps[i].getAttribute('data-spanel')!==startTab;
}

/* links to a page that is switched off go too. A subject row still shows its
   figures when the Map is off; it just stops being a link. */
function prune(root){
  if(!root || !root.querySelectorAll) return;
  var links=root.querySelectorAll('[data-go]');
  for(var i=0;i<links.length;i++){
    var a=links[i], r=a.getAttribute('data-go');
    if(routeOn(r)) continue;
    if(/\b(ts|subj|t-item|xpbox|coinbox|daysbox)\b/.test(a.className)){
      a.removeAttribute('data-go'); a.removeAttribute('href'); a.style.cursor='default'; continue;
    }
    if(a.parentNode) a.parentNode.removeChild(a);
  }
  if(!on('game.cert')){
    var c=root.querySelectorAll('[data-act="cert"],[data-act="report"]');
    for(var j=0;j<c.length;j++) if(c[j].parentNode) c[j].parentNode.removeChild(c[j]);
  }
}

/* ---------- the study totals ---------- */
var views={}, viewDay='';
function deviceId(){
  var id=load('drakkhak.did');
  if(/^[0-9a-f]{16}$/.test(id||'')) return id;
  var a=new Uint8Array(8), c=window.crypto||window.msCrypto;
  if(c && c.getRandomValues) c.getRandomValues(a);
  else for(var i=0;i<8;i++) a[i]=Math.floor(Math.random()*256);
  id=''; for(i=0;i<8;i++) id+=('0'+a[i].toString(16)).slice(-2);
  keep('drakkhak.did',id);
  return id;
}
function sharing(){
  return !preview && on('stats.on') && location.protocol.indexOf('http')===0 &&
    window.DB && DB.state().settings.shareStats!==false;
}
function round1(x){ return Math.round((x||0)*10)/10; }
function roundMap(m, drop){
  var o={}, k; for(k in m||{}){ var key=drop?String(k).replace(/^hsc\//,''):k; o[key]=round1(m[k]); } return o;
}
function dayRecord(day){
  var s=DB.state(), t=s.time[day]||{}, a=s.acts[day]||{};
  if(!t.tot && !a.q && day!==DB.today()) return null;
  var from=new Date(day+'T00:00:00').getTime(), to=from+864e5, tq={};
  DB.logSince(from).forEach(function(r){
    if(r.t>=to || !r.k) return;
    var x=tq[r.k]||(tq[r.k]=[0,0]); x[0]++; if(r.ok) x[1]++;
  });
  var rec={m:round1(t.tot),q:a.q||0,r:a.right||0,s:a.sets||0,h:roundMap(t.byHour),c:roundMap(t.bySec,true),tm:roundMap(t.byTopic),tq:tq,
    e:ICE.edition,l:s.settings.lang,n:s.theme==='night'?1:0,sk:DB.liveStreak(),lv:GAME.level().level,
    k:(function(){ var w=Math.min(screen.width,window.innerWidth||screen.width); return w<600?'p':w<1000?'t':'d'; })(),
    nw:s.firstOpen===day?1:0};
  if(day===DB.today()){
    rec.v=views;
    rec.a=CLOCK.isActive()?1:0;
    rec.at=UI.current();
    rec.ct=(CLOCK.context()||{}).topic||'';
  }
  return rec;
}
function report(leaving, back){
  if(!sharing()) return;
  var days={}, any=false, today=DB.today();
  for(var i=back||0;i>=0;i--){
    var k=DB.ymd(new Date(Date.now()-i*864e5)), r=dayRecord(k);
    if(r){ days[k]=r; any=true; }
  }
  if(!any) return;
  var body=JSON.stringify({id:deviceId(), days:days});
  if(body.length>30000 && days[today]){ var only={}; only[today]=days[today]; body=JSON.stringify({id:deviceId(), days:only}); }
  if(leaving && navigator.sendBeacon){
    try{ navigator.sendBeacon('api/track.php', new Blob([body],{type:'application/json'})); return; }catch(e){}
  }
  if(window.fetch) fetch('api/track.php',{method:'POST',headers:{'Content-Type':'application/json'},body:body,keepalive:body.length<60000,credentials:'omit'}).catch(function(){});
}
function noteView(r){
  var d=DB.today();
  if(d!==viewDay){ viewDay=d; try{ views=JSON.parse(load('drakkhak.views:'+d))||{}; }catch(e){ views={}; } }
  if(/^[a-z]{1,20}$/.test(r||'')) views[r]=(views[r]||0)+1;
  keep('drakkhak.views:'+d, JSON.stringify(views));
}
/* called by boot.js once the record is ready */
function start(){
  paintAll();
  document.addEventListener('click', onTabClick);
  if(preview) return;
  setTimeout(function(){ report(false, 3); }, 4000);
  setInterval(function(){ if(!document.hidden && CLOCK.isActive()) report(false, 0); }, 120000);
  setInterval(fetchNew, 300000);
  document.addEventListener('visibilitychange', function(){ if(document.hidden) report(true, 0); else fetchNew(); });
  window.addEventListener('pagehide', function(){ report(true, 0); });
}

/* ---------- first thing: last known values, right now ---------- */
(function(){
  var raw=preview ? null : load(CACHE), o=null;
  if(preview){ try{ V=JSON.parse(sessionStorage.getItem('drakkhak.sitePreview'))||{}; }catch(e){ V={}; } }
  else if(raw){ try{ o=JSON.parse(raw); }catch(e){ o=null; } if(o){ V=o.v||{}; rev=o.rev||0; } }
  paintAll();
  if(preview) listen(); else fetchNew();
})();

return {get:get, on:on, fun:fun, deviceId:deviceId, routeOn:routeOn, edition:edition, onlyEdition:onlyEdition, preview:preview, DEFAULTS:DEFAULTS,
  seed:seed, reconcile:reconcile, newShare:newShare, pruneSubjects:pruneSubjects, startPage:startPage, startLayout:startLayout,
  prune:prune, noteView:noteView, start:start, paintBrand:paintBrand, paintAll:paintAll, report:report};
})();
