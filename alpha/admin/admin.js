/* ===========================================================
   DRAKKHAK CONTROL — the panel. Vanilla ES5 like the rest of the site.

   Every edit goes into a draft. The live preview shows the draft at once;
   students see nothing until Publish, and every publish can be undone from
   History.
   =========================================================== */
(function(){

var TOKEN=document.body.getAttribute('data-token');
var A={defaults:{}, saved:{}, draft:{}, rev:0, user:'', route:'overview', days:30, measure:'mins', stats:null, live:null, filter:'', pv:'desktop', pvRoute:'today', pvTheme:'day'};
var root=document.getElementById('root');

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function num(n){ return String(Math.round(n||0)).replace(/\B(?=(\d{3})+(?!\d))/g,','); }
function hrs(mins){ var h=(mins||0)/60; return h>=100?num(h):(Math.round(h*10)/10).toString(); }
function pct(a,b){ return b?Math.round(100*a/b):0; }
function same(a,b){ return JSON.stringify(a)===JSON.stringify(b); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dShort(d){ var p=d.split('-'); return (+p[2])+' '+MON[+p[1]-1]; }
function when(t){ var d=new Date(t*1000); return d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear()+', '+d.getHours()+':'+('0'+d.getMinutes()).slice(-2); }
function bytes(b){ return b>1048576?(Math.round(b/104857.6)/10)+' MB':(Math.round(b/102.4)/10)+' KB'; }

function api(a, body, qs){
  var o={credentials:'same-origin',headers:{}};
  if(body!==undefined){ o.method='POST'; o.headers['Content-Type']='application/json'; o.headers['X-Drk-Token']=TOKEN; o.body=JSON.stringify(body); }
  return fetch('api.php?a='+a+(qs||''),o).then(function(r){
    return r.json().catch(function(){ return {error:'The server sent something unreadable.'}; }).then(function(j){
      if(r.status===401 && j.error==='signed-out'){ location.reload(); throw new Error('signed out'); }
      if(!r.ok) throw new Error(j.error||'Something went wrong.');
      return j;
    });
  });
}
function toast(msg){
  var t=document.getElementById('toast'); if(t) t.parentNode.removeChild(t);
  t=document.createElement('div'); t.id='toast'; t.setAttribute('role','status'); t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 3200);
}

/* ---------- theme ---------- */
function theme(){ try{ return localStorage.getItem('drakkhak.adminTheme')||'day'; }catch(e){ return 'day'; } }
function setTheme(t){ document.documentElement.setAttribute('data-theme',t); try{ localStorage.setItem('drakkhak.adminTheme',t); }catch(e){} }
setTheme(theme());

/* ---------- the draft ---------- */
function val(k){ return A.draft[k]; }
function changedKeys(){
  var out=[]; for(var k in A.defaults) if(!same(A.draft[k],A.saved[k])) out.push(k);
  return out;
}
function overrides(){
  var o={}; for(var k in A.defaults) if(!same(A.draft[k],A.defaults[k])) o[k]=A.draft[k];
  return o;
}
function setVal(k,v,again){
  A.draft[k]=v;
  paintPub(); pushPreview();
  if(again) repaint();
}
function adopt(values, rev){
  var m=clone(A.defaults), k; for(k in values) m[k]=values[k];
  A.saved=m; A.draft=clone(m); A.rev=rev;
}

/* ---------- the words for every switch ---------- */
var LABELS={
  'maintenance.on':'Closed sign','maintenance.title':'Closed sign heading','maintenance.message':'Closed sign message',
  'notice.on':'Banner','notice.text':'Banner text','notice.link':'Banner link','notice.tone':'Banner colour','notice.dismiss':'Banner can be dismissed',
  'layout.nav':'Where the places sit','layout.start':'Start arrangement','layout.order':'Block order','layout.hide':'Hidden blocks',
  'layout.width':'Page width','layout.density':'Spacing','layout.corners':'Corners','layout.text':'Text size',
  'look.accent':'Accent colour','look.css':'Custom CSS',
  'bar.brand':'Name in the top bar','bar.community':'Learn / Community switch','bar.search':'Find a chapter','bar.xp':'XP and level','bar.coins':'Coins','bar.days':'Days left',
  'bar.sound':'Sound switch','bar.timer':'Timer switch','bar.night':'Night switch',
  'page.map':'Map','page.practice':'Practice','page.progress':'Progress','page.modes':'Ways to practise','page.mock':'Full papers','page.tricks':'Formula cards',
  'page.quests':'Quests','page.plan':'Study plan','page.stats':'Student statistics','page.predict':'Mark prediction','page.wrapped':'This week',
  'page.record':'Your record','page.badges':'Badges','page.collection':'Collection','page.shop':'Shop','page.social':'Duels and cards','page.research':'Research page',
  'game.effects':'Animations and confetti','game.cert':'Certificates and reports',
  'ed.hsc':'HSC','ed.ssc':'SSC','ed.default':'Edition for a new visitor','subj.hide':'Subjects switched off',
  'def.lang':'Language','def.theme':'Day or night','def.sound':'Sound','def.timer':'Question timer','def.setSize':'Questions in a set','def.dailyMin':'Study minutes a day',
  'def.dailyQ':'Questions a day','def.challenge':'Difficulty','def.alarm':'Ring when time runs out','def.redemption':'Second chance after a miss',
  'def.confidence':'Ask "sure or guessing"','def.breaks':'Suggest a break after an hour','def.pushAt':'Pushed to all students','rule.newShare':'Share of new questions',
  'social.love':'Love on options','social.comment':'Comments on options','social.hold':'Comments wait for approval','social.words':'Blocked words','shop.more':'New shop shelves',
  'fun.on':'Captivating mode','fun.today':'Today strip','fun.spin':'Daily spin','fun.combo':'Streak banners','fun.lucky':'Lucky drops','fun.crowd':'Live crowd','fun.league':'Weekly league','fun.finish':'Set celebrations','fun.motion':'Living pages',
  'stats.on':'Statistics'
};
var SWITCH_GROUPS=[
  {t:'Top bar',d:'What sits in the bar at the top of every page.',items:[
    ['bar.community','Between the app and /social/'],['bar.search','The search pill'],['bar.xp','The level hexagon and XP bar'],['bar.coins','The gold coin box'],
    ['bar.days','Days left for the whole syllabus'],['bar.sound','Stays visible during a question'],['bar.timer','Stays visible during a question'],['bar.night','Stays visible during a question']]},
  {t:'The main places',d:'Switch one off and it leaves the menu, and its links disappear.',items:[
    ['page.map','The road through every chapter'],['page.practice','Sets, modes and full papers'],['page.progress','Charts and records']]},
  {t:'Practice',items:[
    ['page.modes','The list of modes'],['page.mock','A paper on the real clock'],['page.tricks','Formula and memory cards'],['page.quests','Daily and weekly quests']]},
  {t:'Progress',items:[
    ['page.plan','The day-by-day plan'],['page.stats','The student\'s own statistics page'],['page.predict','The predicted mark per paper'],['page.wrapped','The weekly summary'],
    ['page.record','The full answer record'],['page.badges','Achievements'],['page.collection','Collected cards'],['page.shop','Spending coins'],['page.social','Challenge links and share cards']]},
  {t:'Everything else',items:[
    ['page.research','"How Drakkhak teaches"'],['game.effects','Off makes the whole site still for everyone'],['game.cert','The print buttons on Progress']]}
];

/* ---------- small builders ---------- */
function toggle(k,label,hint){
  return '<div class="rw'+(same(val(k),A.saved[k])?'':' changed')+'" data-row="'+esc((label+' '+(hint||'')).toLowerCase())+'"><div class="tx"><b>'+esc(label)+'</b>'+(hint?'<span>'+esc(hint)+'</span>':'')+'</div>'+
    '<label class="sw"><input type="checkbox" data-k="'+k+'" aria-label="'+esc(label)+'"'+(val(k)?' checked':'')+'><i></i></label></div>';
}
function seg(k,opts){
  return '<div class="seg" role="group">'+opts.map(function(o){
    return '<button type="button" data-set="'+k+'" data-v="'+esc(o[0])+'" class="'+(val(k)===o[0]?'on':'')+'" aria-pressed="'+(val(k)===o[0])+'">'+esc(o[1])+'</button>'; }).join('')+'</div>';
}
function segRow(k,label,hint,opts){
  return '<div class="rw"><div class="tx"><b>'+esc(label)+'</b>'+(hint?'<span>'+esc(hint)+'</span>':'')+'</div>'+seg(k,opts)+'</div>';
}
function numRow(k,label,hint,min,max){
  return '<div class="rw'+(same(val(k),A.saved[k])?'':' changed')+'"><div class="tx"><b>'+esc(label)+'</b>'+(hint?'<span>'+esc(hint)+'</span>':'')+'</div>'+
    '<input class="fld num" type="number" min="'+min+'" max="'+max+'" value="'+esc(val(k))+'" data-k="'+k+'" aria-label="'+esc(label)+'"></div>';
}
function card(title, inner, sub, extra){
  return '<section class="card"><div class="chead"><h2>'+esc(title)+'</h2><span class="sp"></span>'+(extra||'')+(sub?'<p>'+sub+'</p>':'')+'</div>'+inner+'</section>';
}

/* ---------- the frame ---------- */
var ICONS={
  overview:'M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z',
  stats:'M4 20V10M10 20V4M16 20v-7M21 20H3',
  layout:'M4 4h16v16H4zM4 10h16M10 10v10',
  switches:'M4 7h10M18 7h2M4 17h2M10 17h10M16 4.5v5M8 14.5v5',
  study:'M12 6v6l4 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z',
  notice:'M4 10v4l12 5V5zM16 9a3 3 0 0 1 0 6M7 15.3V20h3v-3.5',
  history:'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
  system:'M12 3l8 3v6c0 4.5-3.3 7.7-8 9-4.7-1.3-8-4.5-8-9V6z',
  fun:'M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4zM19 3v4M17 5h4',
  community:'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5z'
};
var NAV=[['overview','Overview'],['stats','Statistics'],['layout','Layout'],['fun','Captivating'],['community','Comments'],['switches','Switches'],['study','Study rules'],['notice','Banner and closing'],['history','History'],['system','Security']];
function shell(){
  var nav=NAV.map(function(n){
    return '<button type="button" class="nv" data-nav="'+n[0]+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+ICONS[n[0]]+'"/></svg><span>'+n[1]+'</span></button>'; }).join('');
  root.innerHTML='<div class="shell"><aside class="side"><div class="logo"><img src="../img/logo.svg" alt=""><div><b>Drakkhak</b><span>Control</span></div></div>'+nav+
    '<span class="grow"></span><div class="who"><b id="whoName"></b>Signed in as owner</div></aside>'+
    '<div class="mainp"><header class="bar"><h1 id="title"></h1>'+
      '<span class="livepill" id="livePill" title="Browsers active in the last 5 minutes"><span class="pulse"></span><b>0</b> studying now</span>'+
      '<a class="btn sm" href="../" target="_blank" rel="noopener">Open site</a>'+
      '<button type="button" class="btn sm" id="nightBtn">Night</button>'+
      '<button type="button" class="btn sm quiet" id="outBtn">Sign out</button></header>'+
      '<main class="page" id="page"></main></div></div><div id="pubHost"></div><div id="tip" hidden></div><div id="dlgHost"></div>';
  document.getElementById('whoName').textContent=A.user;
  document.getElementById('nightBtn').onclick=function(){ setTheme(theme()==='night'?'day':'night'); repaintCharts(); };
  document.getElementById('outBtn').onclick=function(){ api('logout',{}).then(function(){ location.reload(); }); };
}
function go(r){
  A.route=r;
  var bs=root.querySelectorAll('[data-nav]');
  for(var i=0;i<bs.length;i++){ var on=bs[i].getAttribute('data-nav')===r; bs[i].classList.toggle('on',on); if(on) bs[i].setAttribute('aria-current','page'); else bs[i].removeAttribute('aria-current'); }
  try{ history.replaceState(null,'','#'+r); }catch(e){}
  window.scrollTo(0,0);
  repaint(true);
}
var TITLES={fun:'Captivating mode',community:'Comments and league',overview:'Overview',stats:'Statistics',layout:'Layout studio',switches:'Switches',study:'Study rules',notice:'Banner and closing',history:'History',system:'Security and data'};
function repaint(full){
  document.getElementById('title').textContent=TITLES[A.route];
  var page=document.getElementById('page');
  if(A.route==='layout' && !full && document.getElementById('ctl')){ var y=window.scrollY; document.getElementById('ctl').innerHTML=layoutControls(); wireDrag(); window.scrollTo(0,y); paintPub(); return; }
  if(A.route==='fun' && !full && document.getElementById('ctl')){ document.getElementById('ctl').innerHTML=funControls(); paintPub(); return; }
  var out=PAGES[A.route]();
  page.innerHTML=out;
  page.style.animation='none'; void page.offsetWidth; page.style.animation='';
  if(AFTER[A.route]) AFTER[A.route]();
  paintPub();
}
function paintPub(){
  var host=document.getElementById('pubHost'), n=changedKeys().length;
  if(!n){ host.innerHTML=''; return; }
  var cur=host.querySelector('.t b');
  if(cur){ cur.textContent=n+(n===1?' change':' changes'); return; }
  host.innerHTML='<div class="pub" role="status"><span class="t"><b>'+n+(n===1?' change':' changes')+'</b> not live yet</span>'+
    '<button type="button" class="btn" id="pubPrev">Preview</button><button type="button" class="btn" id="pubDrop">Discard</button><button type="button" class="btn pri" id="pubGo">Publish</button></div>';
  document.getElementById('pubGo').onclick=publish;
  document.getElementById('pubDrop').onclick=function(){ A.draft=clone(A.saved); repaint(true); pushPreview(); toast('Changes discarded.'); };
  document.getElementById('pubPrev').onclick=fullPreview;
}
function publish(){
  var ch=changedKeys();
  var warn=[];
  if(val('maintenance.on') && !A.saved['maintenance.on']) warn.push('The site will show the closed sign to every student, and they cannot practise until you switch it off.');
  if(!val('stats.on') && A.saved['stats.on']) warn.push('Statistics stop being collected.');
  var doit=function(){
    return api('save',{values:A.draft, note:ch.slice(0,4).map(function(k){ return LABELS[k]||k; }).join(', ')+(ch.length>4?' and '+(ch.length-4)+' more':'')}).then(function(o){
      adopt(o.values,o.rev);
      repaint(true);
      toast('Published. Students get this the next time a page opens, or within 5 minutes.');
    }).catch(function(e){ toast(e.message); });
  };
  if(warn.length) confirmBox('Publish this?', warn.join(' '), 'Publish', doit);
  else doit();
}
function confirmBox(title, body, yes, fn, typed){
  var host=document.getElementById('dlgHost');
  host.innerHTML='<div class="overlay" role="dialog" aria-modal="true"><div class="dlg"><h2>'+esc(title)+'</h2><p class="muted">'+esc(body)+'</p>'+
    (typed?'<input class="fld wide" id="dlgType" placeholder="Type '+esc(typed)+'" autocomplete="off">':'')+
    '<div class="acts"><button type="button" class="btn" id="dlgNo">Cancel</button><button type="button" class="btn pri" id="dlgYes"'+(typed?' disabled':'')+'>'+esc(yes)+'</button></div></div></div>';
  var close=function(){ host.innerHTML=''; };
  document.getElementById('dlgNo').onclick=close;
  document.getElementById('dlgYes').onclick=function(){ var v=typed?document.getElementById('dlgType').value:''; close(); fn(v); };
  if(typed) document.getElementById('dlgType').oninput=function(){ document.getElementById('dlgYes').disabled=this.value!==typed; };
}

/* ---------- names for what the statistics count ---------- */
function sectionName(k){
  var s=(ICE.sections&&ICE.sections['hsc/'+k])||(ICE.SSC&&ICE.SSC.sections['hsc/'+k]);
  if(!s) return k;
  return s.en + (ICE.SSC&&ICE.SSC.sections['hsc/'+k]?' (SSC)':'');
}
function topicInfo(id){
  var t=(ICE.topics&&ICE.topics[id])||(ICE.SSC&&ICE.SSC.topics[id]);
  if(!t) return {name:id, paper:''};
  return {name:t.note||t.name||id, paper:sectionName(String(t.sec).replace(/^hsc\//,''))+' · ch '+t.n};
}
var ROUTE_NAMES={today:'Start',welcome:'First visit',map:'Map',topic:'A chapter',practice:'Practice',progress:'Progress',settings:'Settings',run:'In a set',modes:'Modes',quests:'Quests',tricks:'Formula cards',trick:'Formula cards',mock:'Full paper',plan:'Study plan',stats:'Own statistics',predict:'Prediction',wrapped:'This week',record:'Record',badges:'Badges',collection:'Collection',shop:'Shop',social:'Duels',research:'Research',section:'A paper'};

/* ---------- charts ---------- */
function niceMax(v){
  if(v<=0) return 1;
  var p=Math.pow(10,Math.floor(Math.log(v)/Math.LN10)), m=v/p;
  return (m<=1?1:m<=2?2:m<=5?5:10)*p;
}
function axis(w,h,pad,max,fmt){
  var o='', i;
  for(i=0;i<=4;i++){
    var y=pad.t+(h-pad.t-pad.b)*(1-i/4);
    o+='<line class="'+(i?'grid-l':'base')+'" x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+y+'" y2="'+y+'"/>';
    o+='<text x="'+(pad.l-8)+'" y="'+(y+4)+'" text-anchor="end">'+esc(fmt(max*i/4))+'</text>';
  }
  return o;
}
function xLabels(pts,w,h,pad,xf){
  var n=pts.length, step=Math.max(1,Math.ceil(n/Math.max(2,Math.floor((w-pad.l-pad.r)/70)))), o='';
  for(var i=(n-1)%step;i<n;i+=step) o+='<text x="'+xf(i)+'" y="'+(h-6)+'" text-anchor="middle">'+esc(dShort(pts[i].d))+'</text>';
  return o;
}
var drawn=[];
function lineChart(id, pts, fmt, unit){
  var box=document.getElementById(id); if(!box) return;
  var w=Math.max(280,box.clientWidth), h=250, pad={l:46,r:12,t:10,b:26};
  var top=0; pts.forEach(function(p){ if(p.y>top) top=p.y; });
  var max=niceMax(top), n=pts.length;
  var xf=function(i){ return n<2 ? (pad.l+w-pad.r)/2 : pad.l+(w-pad.l-pad.r)*i/(n-1); };
  var yf=function(v){ return pad.t+(h-pad.t-pad.b)*(1-v/max); };
  var line='', area='';
  pts.forEach(function(p,i){ line+=(i?'L':'M')+xf(i).toFixed(1)+' '+yf(p.y).toFixed(1); });
  area=line+'L'+xf(n-1).toFixed(1)+' '+yf(0)+'L'+xf(0).toFixed(1)+' '+yf(0)+'Z';
  box.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(unit)+' per day">'+axis(w,h,pad,max,fmt)+xLabels(pts,w,h,pad,xf)+
    '<path class="ar" d="'+area+'"/><path class="ln" d="'+line+'"/><line class="xh" y1="'+pad.t+'" y2="'+(h-pad.b)+'" x1="0" x2="0" visibility="hidden"/><circle class="pt" r="5" cx="0" cy="0" visibility="hidden"/></svg>';
  var svg=box.firstChild, xh=svg.querySelector('.xh'), pt=svg.querySelector('.pt');
  box.onmousemove=function(e){
    var r=svg.getBoundingClientRect(), x=(e.clientX-r.left)*w/r.width;
    var i=Math.round((x-pad.l)/((w-pad.l-pad.r)/Math.max(1,n-1)));
    i=Math.max(0,Math.min(n-1,i));
    var cx=xf(i), cy=yf(pts[i].y);
    xh.setAttribute('x1',cx); xh.setAttribute('x2',cx); pt.setAttribute('cx',cx); pt.setAttribute('cy',cy);
    xh.setAttribute('visibility','visible'); pt.setAttribute('visibility','visible');
    tip('<b>'+esc(fmt(pts[i].y))+'</b> '+esc(unit)+'<br>'+esc(dShort(pts[i].d)), r.left+cx*r.width/w, r.top+cy*r.height/h);
  };
  box.onmouseleave=function(){ hideTip(); xh.setAttribute('visibility','hidden'); pt.setAttribute('visibility','hidden'); };
}
function stackChart(id, pts){
  var box=document.getElementById(id); if(!box) return;
  var w=Math.max(280,box.clientWidth), h=230, pad={l:40,r:8,t:10,b:26};
  var top=0; pts.forEach(function(p){ if(p.a+p.b>top) top=p.a+p.b; });
  var max=Math.max(4,niceMax(top)), n=pts.length, slot=(w-pad.l-pad.r)/n, bw=Math.max(2,Math.min(26,slot-2));
  var xf=function(i){ return pad.l+slot*(i+.5); };
  var yf=function(v){ return pad.t+(h-pad.t-pad.b)*(1-v/max); };
  var o='';
  pts.forEach(function(p,i){
    var x=xf(i)-bw/2, y0=yf(0), ya=yf(p.a), yb=yf(p.a+p.b);
    var rad=Math.min(4,bw/2);
    if(p.a) o+='<rect x="'+x.toFixed(1)+'" y="'+ya.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1,y0-ya).toFixed(1)+'" fill="var(--c2)" rx="'+(p.b?0:rad)+'"/>';
    if(p.b) o+='<rect x="'+x.toFixed(1)+'" y="'+yb.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1,ya-yb-(p.a?2:0)).toFixed(1)+'" fill="var(--c1)" rx="'+rad+'"/>';
    o+='<rect x="'+(xf(i)-slot/2).toFixed(1)+'" y="'+pad.t+'" width="'+slot.toFixed(1)+'" height="'+(h-pad.t-pad.b)+'" fill="transparent" data-tip="<b>'+p.b+'</b> new, <b>'+p.a+'</b> returning<br>'+dShort(p.d)+'"/>';
  });
  box.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="New and returning browsers per day">'+axis(w,h,pad,max,function(v){ return num(v); })+xLabels(pts,w,h,pad,xf)+o+'</svg>';
}
function tip(html,x,y){
  var t=document.getElementById('tip'); t.innerHTML=html; t.hidden=false;
  t.style.left=Math.max(70,Math.min(window.innerWidth-70,x))+'px'; t.style.top=Math.max(50,y)+'px';
}
function hideTip(){ var t=document.getElementById('tip'); if(t) t.hidden=true; }
document.addEventListener('mousemove',function(e){
  var t=e.target.closest ? e.target.closest('[data-tip]') : null;
  if(t){ tip(t.getAttribute('data-tip'), e.clientX, e.clientY); return; }
  if(!(e.target.closest && e.target.closest('.chart.follow'))) hideTip();
});
function hbars(rows, unit){
  if(!rows.length) return '<div class="empty">Nothing yet.</div>';
  var top=0; rows.forEach(function(r){ if(r.v>top) top=r.v; });
  return rows.map(function(r){
    return '<div class="hb" data-tip="<b>'+esc(esc(r.show))+'</b> '+esc(esc(unit))+'<br>'+esc(esc(r.n))+'"><span class="nm">'+esc(r.n)+'</span><span class="tr"><i style="width:'+Math.max(2,100*r.v/top).toFixed(1)+'%"></i></span><span class="val">'+esc(r.show)+'</span></div>'; }).join('');
}
var DAYN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], WEEK=[6,0,1,2,3,4,5];
function hourName(h){ return h===0?'12 am':h<12?h+' am':h===12?'12 pm':(h-12)+' pm'; }
function heat(hm){
  var top=0; hm.forEach(function(r){ r.forEach(function(v){ if(v>top) top=v; }); });
  var o='<div class="heat"><span></span>';
  for(var h=0;h<24;h++) o+='<span class="hx">'+(h%6===0?hourName(h).replace(' ',''):'')+'</span>';
  WEEK.forEach(function(d){
    o+='<span>'+DAYN[d]+'</span>';
    for(var h2=0;h2<24;h2++){
      var v=hm[d][h2], lv=!v?0:Math.min(5,1+Math.floor(4.999*v/top));
      o+='<i class="h'+lv+'" data-tip="<b>'+hrs(v)+' hr</b><br>'+DAYN[d]+', '+hourName(h2)+'"></i>';
    }
  });
  o+='</div><div class="scale"><span style="margin-right:6px">Less</span><i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i><i class="h5"></i><span style="margin-left:6px">More</span></div>';
  return o;
}
function delta(cur,prev){
  if(!prev) return cur?'new in this stretch':'no change';
  var p=Math.round(100*(cur-prev)/prev);
  return (p>=0?'▲ ':'▼ ')+Math.abs(p)+'% on the stretch before';
}

/* ---------- Overview ---------- */
var RANGES=[[7,'7 days'],[30,'30 days'],[90,'90 days'],[0,'All time']];
function rangeSeg(){
  return '<div class="seg" role="group" aria-label="Date range">'+RANGES.map(function(r){
    return '<button type="button" data-range="'+r[0]+'" class="'+(A.days===r[0]?'on':'')+'">'+r[1]+'</button>'; }).join('')+'</div>';
}
function kpi(label,value,sub,lead){
  return '<div class="kpi'+(lead?' lead':'')+'"><span class="kl">'+label+'</span><span class="kv">'+value+'</span><span class="ks">'+esc(sub)+'</span></div>';
}
function overviewKpis(){
  var L=A.live||{now:0,today:{n:0,act:0,mins:0,q:0,r:0}}, t=L.today;
  var yest=A.stats&&A.stats.series.length>1 ? A.stats.series[A.stats.series.length-2] : null;
  return kpi('<span class="pulse'+(L.now?' live':'')+'"></span>Studying now', num(L.now), 'active in the last 5 minutes', true)+
    kpi('Students today', num(t.act), yest?yest.act+' yesterday':'studied at least a minute')+
    kpi('Hours today', hrs(t.mins), yest?hrs(yest.mins)+' yesterday':'real time, idle excluded')+
    kpi('Questions today', num(t.q), yest?num(yest.q)+' yesterday':'answered')+
    kpi('Right today', t.q?pct(t.r,t.q)+'<small>%</small>':'–', t.q?num(t.r)+' of '+num(t.q):'no answers yet');
}
var MEASURES={mins:['Hours','hours',function(p){ return p.mins/60; },function(v){ return hrs(v*60); }],
  act:['Students','students',function(p){ return p.act; },function(v){ return num(v); }],
  q:['Questions','questions',function(p){ return p.q; },function(v){ return num(v); }]};
function overview(){
  var S=A.stats;
  var ms=MEASURES[A.measure];
  var mainCard='<section class="card"><div class="chead"><h2>Study over time</h2><span class="sp"></span>'+
    '<div class="seg" role="group" aria-label="Measure">'+['mins','act','q'].map(function(m){ return '<button type="button" data-measure="'+m+'" class="'+(A.measure===m?'on':'')+'">'+MEASURES[m][0]+'</button>'; }).join('')+'</div>'+rangeSeg()+'</div>'+
    (S&&S.totals.n ? '<div class="chart follow" id="mainChart"></div><details style="margin-top:10px"><summary class="tiny" style="cursor:pointer">Show as a table</summary>'+dayTable(S)+'</details>' : emptyStats())+'</section>';
  var sec=[];
  if(S) for(var k in S.sec) sec.push({n:sectionName(k), v:S.sec[k], show:hrs(S.sec[k])});
  return '<div class="kpis" id="kpis">'+overviewKpis()+'</div>'+mainCard+
    '<div class="grid g53">'+card('When they study', S&&S.totals.mins?heat(S.heat):'<div class="empty">Appears once students have studied.</div>', 'Hours by day of the week and hour of the day, Bangladesh time.')+
      '<section class="card"><div class="chead"><h2>Right now</h2></div><div id="liveBox">'+liveBox()+'</div></section></div>'+
    '<div class="grid g53">'+card('Hours by paper', hbars(sec.slice(0,12),'hours'))+
      quickCard()+'</div>';
}
function emptyStats(){
  return '<div class="empty"><b>No study recorded yet</b>Counting starts once this version is live and students open the site.</div>';
}
function dayTable(S){
  var o='<div class="tblwrap"><table class="tbl"><thead><tr><th>Date</th><th class="n">Visitors</th><th class="n">Students</th><th class="n">Hours</th><th class="n">Questions</th><th class="n">Right</th></tr></thead><tbody>';
  S.series.slice().reverse().forEach(function(d){
    if(!d.n) return;
    o+='<tr><td>'+dShort(d.d)+'</td><td class="n">'+num(d.n)+'</td><td class="n">'+num(d.act)+'</td><td class="n">'+hrs(d.mins)+'</td><td class="n">'+num(d.q)+'</td><td class="n">'+(d.q?pct(d.r,d.q)+'%':'–')+'</td></tr>';
  });
  return o+'</tbody></table></div>';
}
function liveBox(){
  var L=A.live; if(!L) return '<div class="empty">Loading…</div>';
  if(!L.now) return '<div class="empty"><b>Quiet</b>Nobody is studying this minute.</div>';
  var rows=[]; for(var k in L.at) rows.push({n:ROUTE_NAMES[k]||k, v:L.at[k], show:String(L.at[k])});
  var o=hbars(rows,'now');
  var ts=[]; for(var t in L.topics) ts.push({id:t,n:L.topics[t]});
  if(ts.length){
    o+='<div class="kick" style="margin:14px 0 6px">Chapters open</div><table class="tbl"><tbody>'+ts.map(function(x){ var i=topicInfo(x.id);
      return '<tr><td>'+esc(i.name)+'<div class="tiny">'+esc(i.paper)+'</div></td><td class="n">'+x.n+'</td></tr>'; }).join('')+'</tbody></table>';
  }
  return o;
}
function quickCard(){
  return '<section class="card"><div class="chead"><h2>Quick switches</h2></div><div class="rows">'+
    toggle('fun.on','Captivating mode','Spin, league, live crowd, streak banners and more')+
    toggle('maintenance.on','Closed sign','Shows every student a "back soon" page')+
    toggle('notice.on','Banner', val('notice.text')||'Write the message under Banner and closing')+
    toggle('stats.on','Statistics','Count anonymous study totals')+
    '<div class="rw"><div class="tx"><b>Layout</b><span>'+esc(navName(val('layout.nav')))+', '+esc(startName(val('layout.start')))+'</span></div><button type="button" class="btn sm" data-nav="layout">Change</button></div>'+
    '</div></section>';
}
function navName(k){ for(var i=0;i<NAVS.length;i++) if(NAVS[i].id===k) return NAVS[i].n; return k; }
function startName(k){ for(var i=0;i<STARTS.length;i++) if(STARTS[i].id===k) return STARTS[i].n; return k; }

/* ---------- Statistics ---------- */
function statsPage(){
  var S=A.stats;
  if(!S) return '<div class="empty">Loading…</div>';
  var T=S.totals, P=S.prev, AT=S.allTime;
  var head='<div class="chead" style="margin:0"><span class="sp"></span>'+rangeSeg()+'<a class="btn sm" href="api.php?a=csv&days='+(A.days||1830)+'">Download CSV</a></div>';
  var kp='<div class="kpis">'+
    kpi('Browsers', num(T.uniq), delta(T.uniq,P.uniq), true)+
    kpi('Hours studied', hrs(T.mins), delta(T.mins,P.mins))+
    kpi('Questions', num(T.q), delta(T.q,P.q))+
    kpi('Right answers', T.q?pct(T.r,T.q)+'<small>%</small>':'–', T.q?num(T.r)+' of '+num(T.q):'no answers yet')+
    kpi('Per student, per day', T.act?Math.round(T.mins/T.act)+'<small> min</small>':'–', num(T.sets)+' sets finished')+'</div>';
  var R=S.retention, rate=function(x){ return x.base?pct(x.back,x.base)+'%':'–'; }, rsub=function(x){ return x.base?x.back+' of '+x.base:'too early'; };
  var bn=['under 5 min','5–15 min','15–30 min','30–60 min','1–2 hours','2 hours or more'];
  var buckets=S.buck.map(function(v,i){ return {n:bn[i], v:v, show:num(v)}; }).filter(function(){ return true; });
  var view=[]; for(var k in S.view) view.push({n:ROUTE_NAMES[k]||k, v:S.view[k], show:num(S.view[k])});
  view.sort(function(a,b){ return b.v-a.v; });
  var chapterRows=function(obj, hard){
    var o=[]; for(var id in obj) o.push([id,obj[id]]);
    if(!o.length) return '<div class="empty">'+(hard?'Needs 20 answers on a chapter before it can be judged.':'Nothing yet.')+'</div>';
    return '<div class="tblwrap"><table class="tbl"><thead><tr><th>Chapter</th><th class="n">Hours</th><th class="n">Answers</th><th class="n">Right</th></tr></thead><tbody>'+o.map(function(x){ var i=topicInfo(x[0]), v=x[1];
      return '<tr><td>'+esc(i.name)+'<div class="tiny">'+esc(i.paper)+'</div></td><td class="n">'+hrs(v[0])+'</td><td class="n">'+num(v[1])+'</td><td class="n">'+(v[1]?pct(v[2],v[1])+'%':'–')+'</td></tr>'; }).join('')+'</tbody></table></div>';
  };
  function split(title, rows){
    var tot=0; rows.forEach(function(r){ tot+=r[1]; });
    if(!tot) return '';
    return '<div><h3>'+title+'</h3><div class="split">'+rows.map(function(r){ return '<i style="width:'+(100*r[1]/tot).toFixed(1)+'%" data-tip="<b>'+pct(r[1],tot)+'%</b> '+esc(r[0])+'"></i>'; }).join('')+'</div>'+
      '<div class="splitk">'+rows.map(function(r){ return '<span>'+esc(r[0])+' '+pct(r[1],tot)+'%</span>'; }).join('')+'</div></div>';
  }
  var g=function(o,k){ return o[k]||0; };
  var splits=split('Edition',[['HSC',g(S.ed,'hsc')],['SSC',g(S.ed,'ssc')]])+
    split('Device',[['Phone',g(S.kind,'p')],['Tablet',g(S.kind,'t')],['Computer',g(S.kind,'d')]])+
    split('Language',[['English',g(S.lang,'en')],['Bangla',g(S.lang,'bn')]])+
    split('Mode',[['Day',S.night[0]],['Night',S.night[1]]]);
  return head+kp+
    '<div class="grid g53"><section class="card"><div class="chead"><h2>New and returning</h2></div><div class="legend"><span><i style="background:var(--c1)"></i>New browsers</span><span><i style="background:var(--c2)"></i>Returning</span></div><div class="chart" id="stackChart"></div></section>'+
    card('Do they come back?', '<div class="big3"><div><b>'+rate(R.d1)+'</b><span>next day<br>'+rsub(R.d1)+'</span></div><div><b>'+rate(R.d7)+'</b><span>within a week<br>'+rsub(R.d7)+'</span></div><div><b>'+rate(R.d30)+'</b><span>within a month<br>'+rsub(R.d30)+'</span></div></div>'+
      '<div class="note" style="margin-top:14px">All time: <b>'+num(AT.uniq)+'</b> browsers, <b>'+hrs(AT.mins)+'</b> hours and <b>'+num(AT.q)+'</b> questions since '+(S.first?dShort(S.first):'the start')+'.</div>','Of browsers first seen long enough ago.')+'</div>'+
    '<div class="grid g3">'+card('How long a day', hbars(buckets,'student-days'))+card('Pages opened', hbars(view.slice(0,9),'visits'))+card('Who', splits?'<div class="splits">'+splits+'</div>':'<div class="empty">Nothing yet.</div>')+'</div>'+
    '<div class="grid g2">'+card('Most studied chapters', chapterRows(S.most))+card('Hardest chapters', chapterRows(S.hard,true),'Lowest share of right answers, with at least 20 answers.')+'</div>'+
    '<p class="tiny">A browser is one student on one device: the same student on a phone and a laptop counts twice, and clearing browser data counts as new. These totals come from students\' browsers and carry no names.</p>';
}

/* ---------- Layout studio ---------- */
/* each thumbnail is a little drawing of where things go: [x,y,w,h,kind] */
function thumb(rects){
  return '<svg viewBox="0 0 120 76" aria-hidden="true">'+rects.map(function(r){
    return '<rect x="'+r[0]+'" y="'+r[1]+'" width="'+r[2]+'" height="'+r[3]+'" rx="1.5" class="m-'+(r[4]||'card')+'"/>'; }).join('')+'</svg>';
}
var BAR=[0,0,120,7,'rail'];
var NAVS=[
  {id:'top',n:'Top pill',d:'As it is now, centred in the bar',r:[BAR,[42,1.5,36,4,'dark'],[8,12,104,58]]},
  {id:'left',n:'Left rail',d:'Names and icons down the left',r:[BAR,[0,7,26,69,'rail'],[4,13,18,4,'dark'],[4,20,18,4],[4,27,18,4],[32,13,82,57]]},
  {id:'mini',n:'Slim rail',d:'Icons only, more room for the page',r:[BAR,[0,7,11,69,'rail'],[2.5,13,6,6,'dark'],[2.5,22,6,6],[2.5,31,6,6],[17,13,97,57]]},
  {id:'right',n:'Right rail',d:'Like the community side',r:[BAR,[94,7,26,69,'rail'],[98,13,18,4,'dark'],[98,20,18,4],[98,27,18,4],[6,13,82,57]]},
  {id:'dock',n:'Bottom dock',d:'A floating bar, thumb-friendly',r:[BAR,[8,12,104,48],[30,63,60,8,'dark']]}
];
var STARTS=[
  {id:'classic',n:'Classic',d:'Set and road, three cards, subjects',r:[[6,5,62,34,'hero'],[71,5,43,34,'dark'],[6,42,34,16],[43,42,34,16],[80,42,34,16],[6,61,108,10,'rail']]},
  {id:'list',n:'Today\'s list',d:'Numbered, one column',r:[[24,5,3,3,'dark'],[30,4,66,20,'hero'],[24,27,3,3,'dark'],[30,26,66,12],[24,41,3,3,'dark'],[30,40,66,12],[24,55,3,3,'dark'],[30,54,66,16]]},
  {id:'road',n:'Road on top',d:'The whole road comes first',r:[[6,5,108,20,'dark'],[6,28,66,24,'hero'],[75,28,39,24],[6,55,53,16],[62,55,52,16]]},
  {id:'subjects',n:'Subjects first',d:'The seven subjects lead',r:[[6,5,108,18,'rail'],[6,26,62,26,'hero'],[71,26,43,26,'dark'],[6,55,34,16],[43,55,34,16],[80,55,34,16]]},
  {id:'columns',n:'Three columns',d:'The set in the middle',r:[[6,5,28,28,'dark'],[6,36,28,24],[37,5,46,55,'hero'],[86,5,28,28],[86,36,28,24],[6,63,108,8,'rail']]},
  {id:'split',n:'Split screen',d:'Set stays put, the rest scrolls',r:[[6,5,52,66,'hero'],[62,5,52,18,'dark'],[62,26,52,14],[62,43,52,14],[62,60,52,11]]},
  {id:'tabs',n:'Tabs',d:'One thing under the set at a time',r:[[6,5,108,30,'hero'],[6,38,17,5,'dark'],[25,38,17,5,'rail'],[44,38,17,5,'rail'],[6,46,108,25]]},
  {id:'strip',n:'Number strip',d:'Six big figures across the top',r:[[6,5,108,11,'dark'],[6,19,62,26,'hero'],[71,19,43,26],[6,48,34,13],[43,48,34,13],[80,48,34,13],[6,64,108,7,'rail']]},
  {id:'focus',n:'One thing',d:'Only the next set, nothing else',r:[[26,14,68,48,'hero']]},
  {id:'custom',n:'Your own order',d:'Full-width blocks, in the order below',r:[[6,5,108,14,'hero'],[6,22,108,14,'dark'],[6,39,108,10],[6,52,108,10],[6,65,108,7,'rail']]}
];
var BLOCKS={hero:'Today\'s set',road:'Your road',nudge:'Reminders',mistakes:'Mistake book',ahead:'Next on your path',weeks:'Last 12 weeks',subjects:'Subjects'};
var SWATCHES=['','#C6613F','#2F7F86','#3E6A8A','#6E55A0','#3F8559','#B8832A','#B5523B'];
function thumbs(k, list){
  return '<div class="thumbs">'+list.map(function(x){
    return '<button type="button" class="thumb'+(val(k)===x.id?' on':'')+'" data-set="'+k+'" data-v="'+x.id+'" aria-pressed="'+(val(k)===x.id)+'">'+thumb(x.r)+'<span class="tn">'+esc(x.n)+'</span><span class="td">'+esc(x.d)+'</span></button>'; }).join('')+'</div>';
}
function layoutControls(){
  var order=val('layout.order'), hid=val('layout.hide');
  var blocks=order.map(function(b,i){
    var off=hid.indexOf(b)>=0;
    return '<div class="blk'+(off?' off':'')+'" draggable="true" data-blk="'+b+'"><span class="g" aria-hidden="true">⋮⋮</span><span class="nm">'+esc(BLOCKS[b])+'</span>'+
      '<button type="button" class="mv" data-move="'+b+'" data-dir="-1" aria-label="Move '+esc(BLOCKS[b])+' up"'+(i===0?' disabled':'')+'>↑</button>'+
      '<button type="button" class="mv" data-move="'+b+'" data-dir="1" aria-label="Move '+esc(BLOCKS[b])+' down"'+(i===order.length-1?' disabled':'')+'>↓</button>'+
      (b==='hero'?'<span class="tag">always on</span>':'<label class="sw"><input type="checkbox" data-hideblk="'+b+'" aria-label="Show '+esc(BLOCKS[b])+'"'+(off?'':' checked')+'><i></i></label>')+'</div>';
  }).join('');
  var a=val('look.accent');
  return card('Where the places sit', thumbs('layout.nav',NAVS), 'Computers and large tablets. Phones keep their tab bar at the bottom.')+
    card('How Start is arranged', thumbs('layout.start',STARTS))+
    card('Blocks on Start', blocks, 'Switch blocks on or off for any arrangement. Dragging switches to "Your own order".')+
    '<section class="card"><div class="chead"><h2>Feel</h2></div><div class="rows">'+
      segRow('layout.width','Page width','',[['normal','Normal'],['wide','Wide'],['full','Full']])+
      segRow('layout.density','Spacing','',[['compact','Tight'],['normal','Normal'],['roomy','Roomy']])+
      segRow('layout.corners','Corners','',[['sharp','Sharp'],['soft','Soft'],['round','Round']])+
      '<div class="rw"><div class="tx"><b>Text size</b><span id="textPct">'+val('layout.text')+'% of normal</span></div><input type="range" style="max-width:150px" min="85" max="125" step="5" value="'+val('layout.text')+'" data-range-k="layout.text" aria-label="Text size"></div>'+
    '</div></section>'+
    '<section class="card"><div class="chead"><h2>Accent colour</h2><p>The site\'s terracotta unless you pick another.</p></div><div class="swatches">'+
      SWATCHES.map(function(c){ return '<button type="button" class="swt'+(a===c?' on':'')+'" data-set="look.accent" data-v="'+c+'" style="background:'+(c||'#D97757')+'" aria-label="'+(c?'Accent '+c:'The original terracotta')+'" aria-pressed="'+(a===c)+'"></button>'; }).join('')+
      '<input type="color" value="'+(a||'#D97757')+'" data-color="look.accent" aria-label="Pick any colour" style="width:44px;height:34px;background:none;border:0;padding:0;cursor:pointer"></div></section>'+
    '<section class="card"><div class="chead"><h2>Name and custom CSS</h2></div><div class="fgrid">'+
      '<label class="field">Name in the top bar<input class="fld wide" data-k="bar.brand" value="'+esc(val('bar.brand'))+'" maxlength="40"></label>'+
      '<label class="field">Custom CSS, for anything the switches do not reach<textarea class="area code" data-k="look.css" spellcheck="false" placeholder=".t-hero { border-width: 2px }">'+esc(val('look.css'))+'</textarea></label></div></section>';
}
function previewPane(){
  return '<div class="pvhead"><div class="seg" role="group" aria-label="Screen size">'+[['desktop','Computer'],['tablet','Tablet'],['phone','Phone']].map(function(p){ return '<button type="button" data-pv="'+p[0]+'" class="'+(A.pv===p[0]?'on':'')+'">'+p[1]+'</button>'; }).join('')+'</div>'+
    '<div class="seg" role="group" aria-label="Page">'+[['today','Start'],['map','Map'],['practice','Practice'],['progress','Progress']].map(function(p){ return '<button type="button" data-pvr="'+p[0]+'" class="'+(A.pvRoute===p[0]?'on':'')+'">'+p[1]+'</button>'; }).join('')+'</div>'+
    '<div class="seg" role="group" aria-label="Day or night">'+[['day','Day'],['night','Night']].map(function(p){ return '<button type="button" data-pvt="'+p[0]+'" class="'+(A.pvTheme===p[0]?'on':'')+'">'+p[1]+'</button>'; }).join('')+'</div>'+
    '</div><div class="pvbox" id="pvbox"><iframe class="pvframe" id="pvframe" title="Live preview of the site with your changes" src="../index.html?adminpreview=1#/'+A.pvRoute+'"></iframe></div>';
}
var PVW={desktop:1400,tablet:820,phone:390};
function fitPreview(){
  var box=document.getElementById('pvbox'), f=document.getElementById('pvframe'); if(!box||!f) return;
  var w=PVW[A.pv], s=Math.min(1,box.clientWidth/w);
  f.style.width=w+'px';
  f.style.height=(box.clientHeight/s)+'px';
  f.style.marginLeft=(-w/2)+'px';
  f.style.transform='scale('+s+')';
}
var pvTimer=null;
function pushPreview(){
  clearTimeout(pvTimer);
  pvTimer=setTimeout(function(){
    var f=document.getElementById('pvframe');
    if(f && f.contentWindow){
      f.contentWindow.postMessage({type:'drk-preview',values:overrides()}, location.origin);
      f.contentWindow.postMessage({type:'drk-theme',theme:A.pvTheme}, location.origin);
    }
  },120);
}
window.addEventListener('message',function(e){
  if(e.origin!==location.origin) return;
  if(e.data && e.data.type==='drk-ready') pushPreview();
});
function fullPreview(){
  var host=document.getElementById('dlgHost');
  host.innerHTML='<div class="overlay" role="dialog" aria-modal="true"><div class="dlg pvfull">'+previewPane().replace('</div><div class="pvbox"','<span style="flex:1"></span><button type="button" class="btn sm" id="pvClose">Close preview</button></div><div class="pvbox"')+'</div></div>';
  document.getElementById('pvClose').onclick=function(){ host.innerHTML=''; };
  fitPreview();
}
function wireDrag(){
  var list=document.querySelectorAll('.blk'), from=null;
  Array.prototype.forEach.call(list,function(b){
    b.addEventListener('dragstart',function(e){ from=b.getAttribute('data-blk'); b.classList.add('drag'); e.dataTransfer.effectAllowed='move'; try{ e.dataTransfer.setData('text/plain',from); }catch(x){} });
    b.addEventListener('dragend',function(){ b.classList.remove('drag'); });
    b.addEventListener('dragover',function(e){ e.preventDefault(); b.classList.add('over'); });
    b.addEventListener('dragleave',function(){ b.classList.remove('over'); });
    b.addEventListener('drop',function(e){
      e.preventDefault(); b.classList.remove('over');
      var to=b.getAttribute('data-blk'); if(!from||from===to) return;
      var o=val('layout.order').slice(); o.splice(o.indexOf(from),1); o.splice(o.indexOf(to),0,from);
      A.draft['layout.start']='custom'; setVal('layout.order',o,true);
    });
  });
}

/* ---------- Switches ---------- */
function switchesPage(){
  var o='<input class="search" type="search" id="swSearch" placeholder="Find a switch" value="'+esc(A.filter)+'" aria-label="Find a switch">';
  o+='<div class="grid g2" id="swGrid">';
  SWITCH_GROUPS.forEach(function(g){
    o+='<section class="card" data-group><div class="chead"><h2>'+esc(g.t)+'</h2>'+(g.d?'<p>'+esc(g.d)+'</p>':'')+'</div><div class="rows">'+g.items.map(function(i){ return toggle(i[0],LABELS[i[0]],i[1]); }).join('')+'</div></section>';
  });
  return o+'</div>';
}
function applyFilter(){
  var q=A.filter.trim().toLowerCase(), gs=document.querySelectorAll('[data-group]');
  Array.prototype.forEach.call(gs,function(g){
    var any=false, rs=g.querySelectorAll('[data-row]');
    Array.prototype.forEach.call(rs,function(r){ var hit=!q||r.getAttribute('data-row').indexOf(q)>=0; r.hidden=!hit; if(hit) any=true; });
    g.hidden=!any;
  });
}

/* ---------- Study rules ---------- */
function studyPage(){
  var subj=[['bangla','Bangla'],['english','English'],['ict','ICT'],['phy','Physics'],['chem','Chemistry'],['bio','Biology'],['hmath','Higher Math'],['math','General Math (SSC)'],['bgs','Bangladesh and Global Studies (SSC)']];
  var off=val('subj.hide');
  var pushed=val('def.pushAt');
  return '<div class="grid g2">'+
    '<section class="card"><div class="chead"><h2>What a new student starts with</h2><p>Students can still change these in their own Settings.</p></div><div class="rows">'+
      numRow('def.setSize','Questions in a set','5 to 50. Your default is 16.',5,50)+
      numRow('def.dailyMin','Study minutes a day','Every "days left" comes from this. 119 is 1 hr 59 min.',15,600)+
      numRow('def.dailyQ','Questions a day','The daily target on Start.',5,200)+
      segRow('def.challenge','Difficulty','How hard a set aims',[['flow','Gentle'],['exam','Exam'],['brutal','Brutal']])+
      segRow('def.lang','Language','The interface. Questions stay in their own language.',[['en','English'],['bn','বাংলা']])+
      segRow('def.theme','Day or night','Your rule: the site opens in day.',[['day','Day'],['night','Night']])+
      toggle('def.sound','Sound')+toggle('def.timer','Question timer')+toggle('def.alarm','Ring when time runs out')+
      toggle('def.redemption','Second chance after a miss','A second question on the same idea')+
      toggle('def.confidence','Ask "sure or guessing"','Before the answer is shown')+
      toggle('def.breaks','Suggest a break after an hour')+
      '</div><div class="note" style="margin-top:14px">'+(pushed?'Marked to replace every student\'s settings on '+when(pushed)+'. ':'')+'These normally reach new students only. To change them for students already using the site too:'+
      '<div style="margin-top:8px"><button type="button" class="btn sm" id="pushBtn">Also apply to existing students</button></div></div></section>'+
    '<div style="display:flex;flex-direction:column;gap:20px">'+
    '<section class="card"><div class="chead"><h2>New questions in a set</h2><p>Your rule is more than 75%, which is 13 of 16. This rule reaches everyone.</p></div>'+
      '<input type="range" min="50" max="100" step="5" value="'+val('rule.newShare')+'" data-range-k="rule.newShare" aria-label="Share of new questions"><div class="tiny" id="newPct" style="margin-top:6px">'+newShareText()+'</div></section>'+
    '<section class="card"><div class="chead"><h2>Editions</h2></div><div class="rows">'+toggle('ed.hsc','HSC')+toggle('ed.ssc','SSC')+
      segRow('ed.default','For a new visitor','',[['hsc','HSC'],['ssc','SSC']])+'</div></section>'+
    '<section class="card"><div class="chead"><h2>Subjects</h2><p>Switch one off and it leaves the map, the sets and the "days left" count. Student progress in it is kept.</p></div><div class="rows">'+
      subj.map(function(s){ return '<div class="rw"><div class="tx"><b>'+esc(s[1])+'</b></div><label class="sw"><input type="checkbox" data-subj="'+s[0]+'" aria-label="'+esc(s[1])+'"'+(off.indexOf(s[0])<0?' checked':'')+'><i></i></label></div>'; }).join('')+
    '</div></section></div></div>';
}
function newShareText(){
  var n=16, k=Math.min(n,Math.floor(n*val('rule.newShare')/100)+1);
  return k+' of every 16 questions are new while a student has unseen ones.';
}

/* ---------- Banner and closing ---------- */
function bannerPreview(){
  if(!val('notice.on')||!val('notice.text')) return '<div class="bannerp none" id="bannerP">No banner is showing.</div>';
  return '<div class="bannerp tone-'+esc(val('notice.tone'))+'" id="bannerP"><span style="flex:1">'+esc(val('notice.text'))+'</span>'+(val('notice.link')?'<b>Open</b>':'')+(val('notice.dismiss')?'<span>×</span>':'')+'</div>';
}
function noticePage(){
  return '<div class="grid g2">'+
    '<section class="card"><div class="chead"><h2>Banner</h2><p>A strip above every page. It steps aside during a question.</p></div><div class="fgrid">'+bannerPreview()+
      '<div class="rows">'+toggle('notice.on','Show the banner')+toggle('notice.dismiss','Students can dismiss it')+segRow('notice.tone','Colour','',[['accent','Terracotta'],['info','Quiet'],['warn','Warning']])+'</div>'+
      '<label class="field">Message<textarea class="area" data-k="notice.text" maxlength="300" placeholder="HSC test papers added for Physics">'+esc(val('notice.text'))+'</textarea></label>'+
      '<label class="field">Link, if any<input class="fld wide" data-k="notice.link" value="'+esc(val('notice.link'))+'" placeholder="https://… or #/map"></label></div></section>'+
    '<section class="card"><div class="chead"><h2>Closed sign</h2><p>For when you are working on the site. Students see this instead of the app, and their progress stays safe.</p></div><div class="fgrid">'+
      '<div class="rows">'+toggle('maintenance.on','Close the site')+'</div>'+
      '<label class="field">Heading<input class="fld wide" data-k="maintenance.title" value="'+esc(val('maintenance.title'))+'" maxlength="120"></label>'+
      '<label class="field">Message<textarea class="area" data-k="maintenance.message" maxlength="400">'+esc(val('maintenance.message'))+'</textarea></label>'+
      '<p class="tiny">A browser picks this up the next time a page opens, or within 5 minutes. The community at /social/ has its own setting in WoWonder.</p></div></section></div>';
}

/* ---------- History ---------- */
var LOGW={login:'Signed in','login-failed':'Wrong password tried','login-locked':'Sign-in locked after too many tries',logout:'Signed out',publish:'Published','login-changed':'Username or password changed','comment-deleted':'Comment deleted','comment-ban':'Student blocked','password-refused':'Password change refused','stats-wiped':'Statistics deleted'};
function historyPage(){ return '<div class="grid g53"><div id="histBox"><div class="empty">Loading…</div></div><div id="logBox"></div></div>'; }
function paintHistory(o){
  var box=document.getElementById('histBox'); if(!box) return;
  box.innerHTML=card('Published versions', o.history.length ? o.history.map(function(h,i){
    return '<div class="hist"><span class="v">v'+h.rev+'</span><div class="b"><b>'+esc(h.note||(h.changed.length+' changes'))+'</b><span>'+when(h.at)+(h.changed.length?' · '+h.changed.length+(h.changed.length===1?' switch':' switches'):'')+'</span></div>'+
      (i===0?'<span class="tag">live</span>':'<button type="button" class="btn sm" data-restore="'+h.rev+'">Restore</button>')+'</div>'; }).join('') : '<div class="empty"><b>Nothing published yet</b>Every publish lands here and can be restored.</div>');
  document.getElementById('logBox').innerHTML=card('Activity', o.log.length ? o.log.map(function(l){
    return '<div class="hist"><div class="b"><b>'+esc(LOGW[l.w]||l.w)+'</b><span>'+when(l.t)+(l.d?' · '+esc(l.d):'')+'</span></div></div>'; }).join('') : '<div class="empty">Nothing yet.</div>');
}

/* ---------- Security ---------- */
function systemPage(){
  return '<div class="grid g2">'+
    '<section class="card"><div class="chead"><h2>Your login</h2><p>Leave the new password empty to change only the username.</p></div><form id="pwForm" class="fgrid" autocomplete="off">'+
      '<label class="field">Username<input class="fld wide" id="pwUser" value="'+esc(A.user)+'" autocomplete="username" required></label>'+
      '<label class="field">Current password<input class="fld wide" id="pwCur" type="password" autocomplete="current-password" required></label>'+
      '<label class="field">New password, at least 10 characters<input class="fld wide" id="pwNew" type="password" autocomplete="new-password" minlength="10"></label>'+
      '<div><button class="btn pri" type="submit">Save login</button></div></form></section>'+
    '<div style="display:flex;flex-direction:column;gap:20px"><section class="card"><div class="chead"><h2>Where your data lives</h2></div><div id="sysBox"><div class="empty">Loading…</div></div></section>'+
    '<section class="card"><div class="chead"><h2>Statistics</h2></div><div class="rows">'+toggle('stats.on','Collect anonymous study totals','Students can also opt out in their own Settings')+
      '<div class="rw"><div class="tx"><b>Delete all statistics</b><span>This cannot be undone. Student progress is not touched.</span></div><button type="button" class="btn sm danger" id="wipeBtn">Delete</button></div></div></section>'+
    '<section class="card"><div class="chead"><h2>Settings</h2></div><div class="rows"><div class="rw"><div class="tx"><b>Back to how the site came</b><span>Fills the draft with the original settings. Nothing changes until you publish.</span></div><button type="button" class="btn sm" id="resetBtn">Reset draft</button></div></div></section></div></div>';
}
function paintSystem(o){
  var b=document.getElementById('sysBox'); if(!b) return;
  b.innerHTML='<table class="tbl"><tbody><tr><td>Folder</td><td class="n" style="white-space:normal;word-break:break-all">'+esc(o.data)+'</td></tr>'+
    '<tr><td>Safe from re-uploads</td><td class="n">'+(o.inRoot?'Only if you keep api/data':'Yes')+'</td></tr>'+
    '<tr><td>Space used</td><td class="n">'+bytes(o.totalBytes)+'</td></tr><tr><td>Statistics since</td><td class="n">'+(o.first?dShort(o.first):'–')+'</td></tr>'+
    '<tr><td>PHP</td><td class="n">'+esc(o.php)+'</td></tr><tr><td>Server time</td><td class="n">'+esc(o.time)+'</td></tr></tbody></table>';
}

/* ---------- Captivating mode ---------- */
var FUN_ITEMS=[
  ['fun.today','&#128293;','Today strip','Streak, quests, chest and spin in one row above Start, and again after every set.'],
  ['fun.spin','&#127905;','Daily spin','A prize wheel that opens after 5 answers each day. Coins, XP, a freeze, double XP or a chest.'],
  ['fun.combo','&#9889;','Streak banners','The question card glows hotter with each right answer in a row. Big banners at 3, 5, 10, 15 and 20.'],
  ['fun.lucky','&#127808;','Lucky drops','About one right answer in 14 pays a surprise of 5 to 15 coins.'],
  ['fun.crowd','&#128101;','Live crowd','Real numbers: how many are studying now, and what share chose each option after you answer.'],
  ['fun.league','&#127942;','Weekly league','A top 30 by this week\'s XP. Students join by choice, under any name, and it resets every Monday.'],
  ['fun.finish','&#127881;','Set celebrations','Confetti and a banner for a set of 80% or better.'],
  ['fun.motion','&#10024;','Living pages','A slow glow behind today\'s set, a shine on the Start button, cards that lift, a flame that moves.']
];
function funControls(){
  var on=val('fun.on');
  return '<section class="funhero'+(on?' on':'')+'"><div><span class="kick">The one big switch</span><h2>'+(on?'Captivating is on':'Make the site captivating')+'</h2>'+
    '<p>'+(on?'Press Publish and every student gets all of this. Watch it in the preview first.':'One click turns on everything below. Nothing reaches students until you press Publish.')+'</p></div>'+
    '<button type="button" class="funbtn" id="funBtn" aria-pressed="'+!!on+'">'+(on?'Switch it off':'Captivating')+'</button></section>'+
    '<section class="card"><div class="chead"><h2>What it turns on</h2><p>Any you do not like can be switched off on its own.</p></div><div class="rows">'+
    FUN_ITEMS.map(function(i){
      return '<div class="rw'+(same(val(i[0]),A.saved[i[0]])?'':' changed')+'"><span class="funart" aria-hidden="true">'+i[1]+'</span><div class="tx"><b>'+esc(i[2])+'</b><span>'+esc(i[3])+'</span></div>'+
        '<label class="sw"><input type="checkbox" data-k="'+i[0]+'" aria-label="'+esc(i[2])+'"'+(val(i[0])?' checked':'')+'><i></i></label></div>'; }).join('')+
    '</div></section>'+
    '<section class="card"><div class="chead"><h2>Always on, with or without it</h2></div><div class="rows">'+
      toggle('social.love','Love on each answer option','Appears only after the student has answered')+
      toggle('social.comment','Comments on each answer option','Same rule. Manage them under Comments')+
      toggle('shop.more','New shop shelves','Colours, bursts, titles, power-ups and level-locked avatars')+
    '</div></section>'+
    '<p class="tiny">Kept on purpose: every number is real, rewards still come only from answering, no lifeline or chest can be bought, and nothing is taken away from a student who misses a day.</p>';
}
function funPage(){ return '<div class="studio"><div class="ctl" id="ctl">'+funControls()+'</div><section class="pvw" aria-label="Live preview">'+previewPane()+'</section></div>'; }

/* ---------- Comments and league ---------- */
var COM={f:'all', data:null};
function communityPage(){
  return '<div class="kpis" id="comKpis"><div class="kpi"><span class="kl">Loading…</span><span class="kv">–</span><span class="ks"></span></div></div>'+
    '<div class="grid g53"><section class="card"><div class="chead"><h2>Comments</h2><span class="sp"></span><div class="seg" role="group" aria-label="Filter">'+
      [['all','All'],['reported','Reported'],['wait','Waiting']].map(function(x){ return '<button type="button" data-comf="'+x[0]+'" class="'+(COM.f===x[0]?'on':'')+'">'+x[1]+'</button>'; }).join('')+'</div></div><div id="comList"></div></section>'+
    '<div style="display:flex;flex-direction:column;gap:20px"><section class="card"><div class="chead"><h2>Rules</h2></div><div class="rows">'+
      toggle('social.love','Love on each answer option')+toggle('social.comment','Comments on each answer option')+
      toggle('social.hold','Comments wait for your approval','Safest. Otherwise they appear at once')+'</div>'+
      '<label class="field" style="margin-top:12px">Blocked words. Separate with spaces. A * at the end also catches longer words.<textarea class="area code" data-k="social.words" spellcheck="false">'+esc(val('social.words'))+'</textarea></label>'+
      '<p class="tiny" style="margin-top:8px">Links and phone numbers are always refused. Three reports hide a comment until you decide.</p></section>'+
    '<section class="card"><div class="chead"><h2>League this week</h2></div><div id="comLeague"><div class="empty">Loading…</div></div></section></div></div>';
}
function loadCommunity(){
  api('comments',undefined,'&f='+COM.f).then(function(o){
    COM.data=o;
    var k=document.getElementById('comKpis'); if(!k) return;
    var t=o.totals;
    k.innerHTML=kpi('Comments',num(t.comments),'on all options',true)+kpi('Loves',num(t.loves),'on all options')+kpi('Waiting',num(t.wait),'for your approval')+kpi('Reported',num(t.reported),'by students')+kpi('Blocked students',num(o.bans),'cannot comment or join the league');
    document.getElementById('comList').innerHTML=o.list.length?o.list.map(function(c){
      return '<div class="cmt'+(c.hid?' hid':'')+'"><div class="cmeta"><b>'+esc(c.n)+'</b><span>'+when(c.t)+'</span><span class="tag">option '+'কখগঘ'.charAt(c.o)+'</span>'+
        (c.hold?'<span class="tag warn">waiting</span>':'')+(c.hid?'<span class="tag warn">hidden</span>':'')+(c.rep?'<span class="tag warn">'+c.rep+' reports</span>':'')+'</div>'+
        '<p class="ctext">'+esc(c.x)+'</p><p class="tiny">'+esc(c.stem||c.q)+'</p><div class="cacts">'+
        (c.hold||c.hid||c.rep?'<button type="button" class="btn sm" data-cdo="approve" data-q="'+esc(c.q)+'" data-c="'+esc(c.i)+'">Approve</button>':'')+
        (c.hid?'':'<button type="button" class="btn sm" data-cdo="hide" data-q="'+esc(c.q)+'" data-c="'+esc(c.i)+'">Hide</button>')+
        '<button type="button" class="btn sm" data-cdo="delete" data-q="'+esc(c.q)+'" data-c="'+esc(c.i)+'">Delete</button>'+
        (c.banned?'<span class="tag">author blocked</span>':'<button type="button" class="btn sm danger" data-cdo="ban" data-q="'+esc(c.q)+'" data-c="'+esc(c.i)+'">Delete and block author</button>')+'</div></div>';
    }).join(''):'<div class="empty"><b>Nothing here</b>Comments appear as students post them.</div>';
    var lg=o.league;
    document.getElementById('comLeague').innerHTML=lg.top.length?'<table class="tbl"><tbody>'+lg.top.map(function(r){
      return '<tr><td class="mono" style="width:30px">'+r.rank+'</td><td>'+esc(r.n)+'</td><td class="n">'+num(r.xp)+' XP</td><td class="n" style="width:70px"><button type="button" class="btn sm" data-lgrm="'+esc(r.k)+'" aria-label="Remove '+esc(r.n)+'">Remove</button></td></tr>'; }).join('')+'</tbody></table><p class="tiny" style="margin-top:8px">XP comes from students\' browsers, so a clever cheat is possible. Remove also blocks them.</p>'
      :'<div class="empty">Nobody has joined this week. The league only runs with Captivating on.</div>';
  }).catch(function(e){ toast(e.message); });
}

var PAGES={fun:funPage, community:communityPage, overview:overview, stats:statsPage, layout:function(){ return '<div class="studio"><div class="ctl" id="ctl">'+layoutControls()+'</div><section class="pvw" aria-label="Live preview">'+previewPane()+'</section></div>'; },
  switches:switchesPage, study:studyPage, notice:noticePage, history:historyPage, system:systemPage};
function repaintCharts(){
  if(A.route==='overview'&&A.stats&&A.stats.totals.n){
    var m=MEASURES[A.measure];
    lineChart('mainChart', A.stats.series.map(function(p){ return {d:p.d,y:m[2](p)}; }), m[3], m[1]);
  }
  if(A.route==='stats'&&A.stats) stackChart('stackChart', A.stats.series.map(function(p){ return {d:p.d,a:Math.max(0,p.n-p.nw),b:p.nw}; }));
}
var AFTER={
  fun:function(){ fitPreview(); pushPreview(); },
  community:loadCommunity,
  overview:repaintCharts, stats:repaintCharts,
  layout:function(){ wireDrag(); fitPreview(); pushPreview(); },
  switches:applyFilter,
  history:function(){ api('history').then(paintHistory).catch(function(e){ toast(e.message); }); },
  system:function(){ api('system').then(paintSystem).catch(function(e){ toast(e.message); }); }
};

/* ---------- every click and edit, in one place ---------- */
document.addEventListener('click',function(e){
  var t=e.target.closest ? e.target.closest('button,[data-nav]') : null; if(!t) return;
  var a;
  if((a=t.getAttribute('data-nav'))){ go(a); return; }
  if(t.hasAttribute('data-set')){
    var k=t.getAttribute('data-set'), v=t.getAttribute('data-v');
    setVal(k,v,true);
    if(A.route!=='layout'&&A.route!=='fun') repaint(false);
    return;
  }
  if(t.id==='funBtn'){ setVal('fun.on',!val('fun.on'),true); return; }
  if((a=t.getAttribute('data-comf'))){ COM.f=a; marks('data-comf',a); loadCommunity(); return; }
  if((a=t.getAttribute('data-cdo'))){
    var cdo=a, cq=t.getAttribute('data-q'), cc=t.getAttribute('data-c');
    var runIt=function(){ api('comment-do',{q:cq,c:cc,do:cdo}).then(function(){ toast('Done.'); loadCommunity(); }).catch(function(x){ toast(x.message); }); };
    if(cdo==='ban') confirmBox('Delete and block this student?','This browser can no longer comment or join the league. Their study is not affected.','Delete and block',runIt);
    else runIt();
    return;
  }
  if((a=t.getAttribute('data-lgrm'))){
    var lk=a;
    confirmBox('Remove from the league?','This also blocks this browser from commenting and rejoining.','Remove and block',function(){ api('league-remove',{k:lk}).then(function(){ loadCommunity(); }); });
    return;
  }
  if(t.hasAttribute('data-range')){ A.days=+t.getAttribute('data-range'); loadStats(true); return; }
  if((a=t.getAttribute('data-measure'))){ A.measure=a; repaint(true); return; }
  if((a=t.getAttribute('data-pv'))){ A.pv=a; marks('data-pv',a); fitPreview(); return; }
  if((a=t.getAttribute('data-pvr'))){ A.pvRoute=a; marks('data-pvr',a); var f=document.getElementById('pvframe'); if(f&&f.contentWindow) f.contentWindow.postMessage({type:'drk-route',route:a},location.origin); return; }
  if((a=t.getAttribute('data-pvt'))){ A.pvTheme=a; marks('data-pvt',a); pushPreview(); return; }
  if((a=t.getAttribute('data-move'))){
    var o=val('layout.order').slice(), i=o.indexOf(a), d=+t.getAttribute('data-dir'), j=i+d;
    if(j<0||j>=o.length) return;
    o[i]=o[j]; o[j]=a; A.draft['layout.start']='custom'; setVal('layout.order',o,true); return;
  }
  if((a=t.getAttribute('data-restore'))){
    var rev=a;
    confirmBox('Restore version '+rev+'?','It goes live straight away, and becomes a new version, so this too can be undone.','Restore',function(){
      api('restore',{rev:+rev}).then(function(r){ adopt(r.values,r.rev); toast('Restored.'); repaint(true); }).catch(function(x){ toast(x.message); });
    });
    return;
  }
  if(t.id==='pushBtn'){
    confirmBox('Replace every student\'s settings?','After you publish, each student\'s set size, daily time, language, sound, timer and the rest are replaced with the values on this page, once. They can change them back.','Yes, after publishing',function(){
      setVal('def.pushAt',Math.floor(Date.now()/1000)); repaint(false);
    });
    return;
  }
  if(t.id==='wipeBtn'){
    confirmBox('Delete all statistics?','Every count on this panel goes, for good. Student progress is not touched.','Delete for good',function(){
      api('wipe',{confirm:'DELETE'}).then(function(){ A.stats=null; toast('Statistics deleted.'); loadStats(false); api('system').then(paintSystem); }).catch(function(x){ toast(x.message); });
    },'DELETE');
    return;
  }
  if(t.id==='resetBtn'){ A.draft=clone(A.defaults); repaint(true); pushPreview(); toast('Draft reset. Publish to make it live.'); return; }
});
function marks(attr,v){
  var b=document.querySelectorAll('['+attr+']');
  Array.prototype.forEach.call(b,function(x){ x.classList.toggle('on',x.getAttribute(attr)===v); });
}
function onEdit(e){
  var t=e.target, k;
  if(t.id==='swSearch'){ A.filter=t.value; applyFilter(); return; }
  if((k=t.getAttribute('data-k'))){
    var v;
    if(t.type==='checkbox'){
      v=t.checked;
      if((k==='ed.hsc'&&!v&&!val('ed.ssc'))||(k==='ed.ssc'&&!v&&!val('ed.hsc'))){ t.checked=true; toast('At least one of HSC and SSC has to stay on.'); return; }
      setVal(k,v);
      var r=t.closest('.rw'); if(r) r.classList.toggle('changed',!same(v,A.saved[k]));
      if(/^notice\./.test(k)) refreshBanner();
      return;
    }
    if(t.type==='number'){
      if(e.type==='input') return;
      v=parseInt(t.value,10);
      var lo=+t.min, hi=+t.max;
      if(isNaN(v)) v=A.defaults[k];
      v=Math.max(lo,Math.min(hi,v)); t.value=v;
      setVal(k,v); return;
    }
    setVal(k,t.value);
    if(/^notice\./.test(k)) refreshBanner();
    return;
  }
  if((k=t.getAttribute('data-range-k'))){
    setVal(k,+t.value);
    var p=document.getElementById('textPct'); if(p&&k==='layout.text') p.textContent=t.value+'% of normal';
    var q=document.getElementById('newPct'); if(q&&k==='rule.newShare') q.textContent=newShareText();
    return;
  }
  if((k=t.getAttribute('data-color'))){ if(e.type==='change'){ setVal(k,t.value,true); } return; }
  if((k=t.getAttribute('data-hideblk'))){
    var h=val('layout.hide').filter(function(x){ return x!==k; });
    if(!t.checked) h.push(k);
    setVal('layout.hide',h,true); return;
  }
  if((k=t.getAttribute('data-subj'))){
    var s=val('subj.hide').filter(function(x){ return x!==k; });
    if(!t.checked) s.push(k);
    setVal('subj.hide',s); return;
  }
}
function refreshBanner(){
  var b=document.getElementById('bannerP'); if(!b) return;
  var tmp=document.createElement('div'); tmp.innerHTML=bannerPreview();
  b.parentNode.replaceChild(tmp.firstChild,b);
}
document.addEventListener('input',onEdit);
document.addEventListener('change',function(e){ var t=e.target; if(t.type==='number'||t.type==='color'||t.tagName==='SELECT') onEdit(e); });
document.addEventListener('submit',function(e){
  if(e.target.id!=='pwForm') return;
  e.preventDefault();
  api('password',{user:document.getElementById('pwUser').value,current:document.getElementById('pwCur').value,next:document.getElementById('pwNew').value}).then(function(o){
    A.user=o.user; document.getElementById('whoName').textContent=o.user;
    document.getElementById('pwCur').value=''; document.getElementById('pwNew').value='';
    toast('Login saved.');
  }).catch(function(x){ toast(x.message); });
});
window.addEventListener('hashchange',function(){
  var want=String(location.hash||'').replace('#','');
  if(PAGES[want] && want!==A.route) go(want);
});
var rs=null;
window.addEventListener('resize',function(){ clearTimeout(rs); rs=setTimeout(function(){ fitPreview(); repaintCharts(); },120); });

/* ---------- live numbers ---------- */
function paintLive(){
  var L=A.live; if(!L) return;
  var p=document.getElementById('livePill');
  if(p){ p.querySelector('b').textContent=num(L.now); p.querySelector('.pulse').className='pulse'+(L.now?' live':''); }
  if(A.route==='overview'){
    var k=document.getElementById('kpis'); if(k) k.innerHTML=overviewKpis();
    var b=document.getElementById('liveBox'); if(b) b.innerHTML=liveBox();
  }
}
function loadLive(){ return api('live').then(function(o){ A.live=o; paintLive(); }).catch(function(){}); }
function loadStats(again){
  return api('stats',undefined,'&days='+A.days).then(function(o){
    A.stats=o;
    if(A.route==='overview'||A.route==='stats') repaint(true);
  }).catch(function(e){ toast(e.message); });
}
setInterval(function(){ if(!document.hidden) loadLive(); },20000);
setInterval(function(){ if(!document.hidden && (A.route==='overview'||A.route==='stats') && !document.querySelector('details[open]')) loadStats(); },120000);

/* ---------- start ---------- */
api('boot').then(function(o){
  A.defaults=o.defaults; A.user=o.user;
  adopt(o.values,o.rev);
  shell();
  var want=String(location.hash||'').replace('#','');
  go(PAGES[want]?want:'overview');
  loadLive();
  loadStats();
}).catch(function(e){ root.innerHTML='<div class="empty"><b>Could not open the panel</b>'+esc(e.message)+'</div>'; });

})();
