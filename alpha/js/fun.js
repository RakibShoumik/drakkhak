/* ===========================================================
   FUN — Captivating mode, the owner's one switch in the admin panel.

   Everything here keeps the rules in game.js: rewards come from
   answers, nothing is taken away, and every figure shown is real.
   The daily spin opens after five answers, not for turning up. The
   burst you bought from the shop works with this mode off too.
   =========================================================== */
var FUN = (function(){

var pulse={at:0, now:0};
var SPIN_NEEDS=5;

function h(s){ return U.h(s); }

/* ---------- the strip above Start ---------- */
function spinLeft(){ return Math.max(0, SPIN_NEEDS-(DB.actsToday().q||0)); }
function spinDone(){ return DB.game().spinDay===DB.today(); }
function spinBtn(){
  if(!SITE.fun('spin')) return '';
  var done=spinDone(), left=spinLeft();
  return '<button type="button" class="fs-cell fs-spin'+(done?' done':left?'':' ready')+'" data-act="funSpin"'+(done||left?' disabled':'')+'>'+
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/></svg>'+
    '<span><b>'+L('Daily spin','দৈনিক স্পিন')+'</b><small>'+(done?L('Back tomorrow','আবার আগামীকাল'):left?L(left+' more answers to open','আরও '+left+'টি উত্তর দিলে খুলবে'):L('Ready. Tap to spin','প্রস্তুত। ঘোরান'))+'</small></span></button>';
}
function questCell(){
  var list=QUEST.daily(), done=list.filter(function(q){ return q.done; }).length, open=list.filter(function(q){ return q.done&&!q.claimed; }).length;
  var rings=list.map(function(q){ return UI.donut(q.n?q.got/q.n:0, 22, q.done?'':'mini'); }).join('');
  return '<a class="fs-cell fs-q'+(open?' ready':'')+'" href="#/quests" data-go="quests"><span class="fs-rings">'+rings+'</span><span><b>'+L(done+' of '+list.length+' quests','কোয়েস্ট '+list.length+'-এ '+done)+'</b><small>'+
    (open?L(open+' reward ready',open+'টি পুরস্কার প্রস্তুত'):L('A chest for all three','তিনটিতেই সিন্দুক'))+'</small></span></a>';
}
function streakCell(){
  var n=DB.liveStreak(), dots='';
  DB.lastNDays(7).forEach(function(d){ dots+='<i class="'+(DB.DAY_MET(d.date)?'on':'')+(d.date===DB.today()?' now':'')+'"></i>'; });
  return '<div class="fs-cell fs-streak"><span class="fs-flame'+(n?' lit':'')+'" aria-hidden="true">&#128293;</span><span><b>'+L(n+'-day streak',n+' দিনের ধারা')+'</b><span class="fs-dots" aria-hidden="true">'+dots+'</span></span></div>';
}
function chestCell(){
  var c=DB.game().chests; if(!c) return '';
  return '<button type="button" class="fs-cell fs-chest ready" data-act="openChest"><span class="fs-art" aria-hidden="true">&#127873;</span><span><b>'+L(c+(c===1?' chest':' chests'),c+'টি সিন্দুক')+'</b><small>'+L('Open now','এখনই খুলুন')+'</small></span></button>';
}
function leagueCell(){
  if(!SITE.fun('league')) return '';
  return '<a class="fs-cell fs-league" href="#/league" data-go="league"><span class="fs-art" aria-hidden="true">&#127942;</span><span><b>'+L('Weekly league','সাপ্তাহিক লিগ')+'</b><small id="funRank">'+(DB.game().inLeague?L('See your place','আপনার স্থান দেখুন'):L('Join under any name','যেকোনো নামে যোগ দিন'))+'</small></span></a>';
}
function startStrip(){
  if(!SITE.fun('today')) return '';
  return '<section class="fstrip" aria-label="'+h(L('Today','আজ'))+'">'+streakCell()+questCell()+spinBtn()+chestCell()+leagueCell()+
    (SITE.fun('crowd')?'<div class="fs-cell fs-live" id="funLive" hidden><span class="fs-pulse" aria-hidden="true"></span><span><b></b><small>'+L('studying right now','এই মুহূর্তে পড়ছে')+'</small></span></div>':'')+'</section>';
}
function paintPulse(){
  var box=document.getElementById('funLive'); if(!box) return;
  /* one person alone is not a crowd, and the number is always the real one */
  box.hidden=pulse.now<2;
  box.querySelector('b').textContent=L(pulse.now+' students',pulse.now+' জন');
}
function afterStart(){
  if(!SITE.fun('crowd') || !SITE.fun('today') || SITE.preview || location.protocol.indexOf('http')!==0) return;
  paintPulse();
  if(Date.now()-pulse.at<30000) return;
  pulse.at=Date.now();
  fetch('api/pulse.php',{credentials:'omit'}).then(function(r){ return r.ok?r.json():null; }).then(function(o){ if(o){ pulse.now=o.now||0; paintPulse(); } }).catch(function(){});
}
function resultsRow(){
  if(!SITE.fun('today')) return '';
  return '<section class="fstrip fres">'+questCell()+spinBtn()+chestCell()+'</section>';
}

/* ---------- the daily spin ---------- */
var PRIZES=[
  {w:26, t:function(){ return L('10 coins','১০ কয়েন'); }, give:function(){ GAME.addCoins(10); }},
  {w:18, t:function(){ return '30 XP'; },                 give:function(){ GAME.addXP(30,'spin'); }},
  {w:22, t:function(){ return L('20 coins','২০ কয়েন'); }, give:function(){ GAME.addCoins(20); }},
  {w:4,  t:function(){ return L('A streak freeze','ধারা-ফ্রিজ'); }, rare:1, give:function(){ var s=DB.state(); if(s.freezes<5) s.freezes++; else GAME.addCoins(40); }},
  {w:12, t:function(){ return L('40 coins','৪০ কয়েন'); }, give:function(){ GAME.addCoins(40); }},
  {w:10, t:function(){ return '60 XP'; },                 give:function(){ GAME.addXP(60,'spin'); }},
  {w:6,  t:function(){ return L('Double XP 30 min','দ্বিগুণ XP'); }, rare:1, give:function(){ var g=DB.game(); g.doubleUntil=Math.max(Date.now(),g.doubleUntil||0)+18e5; }},
  {w:2,  t:function(){ return L('A chest','সিন্দুক'); }, rare:1, give:function(){ GAME.earnChest(); }}
];
function wheel(){
  var n=PRIZES.length, R=150, c=160, o='';
  PRIZES.forEach(function(p,i){
    var a0=(i/n)*2*Math.PI-Math.PI/2-Math.PI/n, a1=((i+1)/n)*2*Math.PI-Math.PI/2-Math.PI/n, mid=(a0+a1)/2;
    o+='<path class="w'+(p.rare?'r':i%2)+'" d="M'+c+' '+c+'L'+(c+R*Math.cos(a0)).toFixed(1)+' '+(c+R*Math.sin(a0)).toFixed(1)+'A'+R+' '+R+' 0 0 1 '+(c+R*Math.cos(a1)).toFixed(1)+' '+(c+R*Math.sin(a1)).toFixed(1)+'Z"/>';
    var tx=c+R*0.62*Math.cos(mid), ty=c+R*0.62*Math.sin(mid), deg=mid*180/Math.PI+90;
    var parts=String(p.t()).split(' '), half=Math.ceil(parts.length/2);
    o+='<text x="'+tx.toFixed(1)+'" y="'+ty.toFixed(1)+'" text-anchor="middle" transform="rotate('+deg.toFixed(1)+' '+tx.toFixed(1)+' '+ty.toFixed(1)+')"><tspan x="'+tx.toFixed(1)+'" dy="-3">'+h(parts.slice(0,half).join(' '))+'</tspan><tspan x="'+tx.toFixed(1)+'" dy="14">'+h(parts.slice(half).join(' '))+'</tspan></text>';
  });
  return '<div class="spinwrap"><span class="spinpin" aria-hidden="true"></span><svg class="spinwheel" id="spinWheel" viewBox="0 0 320 320" role="img" aria-label="'+h(L('Prize wheel','পুরস্কারের চাকা'))+'">'+o+'<circle cx="160" cy="160" r="22" class="wc"/></svg></div>';
}
function openSpin(){
  if(!SITE.fun('spin') || spinDone() || spinLeft()) return;
  UI.sheet('<div class="celebrate spinsheet"><span class="kicker acc">'+L('Daily spin','দৈনিক স্পিন')+'</span>'+wheel()+
    '<div id="spinOut" class="small">'+L('You earned this one by answering. Tap to spin.','উত্তর দিয়ে এটি অর্জন করেছেন। ঘোরান।')+'</div>'+
    '<div class="btns" style="justify-content:center"><button class="btn" id="spinGo" data-act="funSpinGo">'+L('Spin','ঘোরান')+'</button></div></div>');
}
function spinGo(){
  if(spinDone() || spinLeft()) return;
  var g=DB.game(); g.spinDay=DB.today(); DB.save();  /* one a day, even if the page closes mid-spin */
  var total=0, i; PRIZES.forEach(function(p){ total+=p.w; });
  var r=Math.random()*total, at=0;
  for(i=0;i<PRIZES.length;i++){ r-=PRIZES[i].w; if(r<=0){ at=i; break; } }
  var prize=PRIZES[at];
  var w=document.getElementById('spinWheel'), go=document.getElementById('spinGo'), out=document.getElementById('spinOut');
  if(go) go.disabled=true;
  var land=function(){
    prize.give(); DB.save();
    FX.play('chest'); if(prize.rare) FX.confetti(60);
    if(out) out.innerHTML='<b>'+h(prize.t())+'</b>';
    if(go){ go.textContent=L('Lovely','দারুণ'); go.disabled=false; go.removeAttribute('data-act'); go.setAttribute('data-close',''); }
    UI.paintChrome();
  };
  if(!w || !FX.effectsOn()){ land(); return; }
  w.style.transform='rotate('+(360*5-at*(360/PRIZES.length))+'deg)';
  setTimeout(land, 3700);
}

/* ---------- a run of right answers ---------- */
var MILES={3:['Three in a row','পরপর তিন'],5:['On a roll','দারুণ চলছে'],10:['On fire','আগুন'],15:['Unstoppable','অপ্রতিরোধ্য'],20:['Legend','কিংবদন্তি']};
function banner(text, big){
  if(!FX.effectsOn()) return;
  var b=document.createElement('div');
  b.className='funbanner'+(big?' big':''); b.textContent=text; b.setAttribute('aria-hidden','true');
  document.body.appendChild(b);
  setTimeout(function(){ if(b.parentNode) b.parentNode.removeChild(b); }, 1500);
}
function emojiBurst(el, art){
  if(!FX.effectsOn() || !el || !el.animate) return;
  var LY=document.getElementById('fxlayer'); if(!LY) return;
  var r=el.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
  for(var i=0;i<12;i++){
    var s=document.createElement('span');
    s.className='funbit'; s.innerHTML=art;
    s.style.left=cx+'px'; s.style.top=cy+'px';
    LY.appendChild(s);
    var a=Math.random()*Math.PI*2, d=60+Math.random()*130;
    s.animate([{transform:'translate(-50%,-50%) scale(.5)',opacity:1},
               {transform:'translate(calc(-50% + '+(Math.cos(a)*d).toFixed(0)+'px),calc(-50% + '+(Math.sin(a)*d-40).toFixed(0)+'px)) scale(1.1) rotate('+(Math.random()*180-90).toFixed(0)+'deg)',opacity:0}],
              {duration:750+Math.random()*350, easing:'cubic-bezier(.2,.8,.2,1)'}).onfinish=(function(n){ return function(){ if(n.parentNode) n.parentNode.removeChild(n); }; })(s);
  }
}
function heat(n){ if(document.body) document.body.setAttribute('data-heat', String(n)); }
function answered(ok, combo, el, auto){
  if(ok && SITE.on('shop.more')){
    var b=GAME.worn('burst');
    if(b && b.id!=='sparks') emojiBurst(el, b.art);
  }
  if(SITE.fun('combo')){
    heat(!ok?0:combo>=10?3:combo>=5?2:combo>=3?1:0);
    if(ok && MILES[combo]){
      banner(L(MILES[combo][0],MILES[combo][1]), combo>=10);
      FX.play('star');
      if(combo>=10) FX.confetti(50);
    }
  }
  /* a small surprise now and then, only ever for a right answer */
  if(ok && !auto && SITE.fun('lucky') && Math.random()<1/14){
    var n=5+Math.floor(Math.random()*11);
    GAME.addCoins(n);
    setTimeout(function(){ UI.toast('<b>'+L('Lucky drop','ভাগ্যের উপহার')+'</b> &middot; +'+n+L(' coins',' কয়েন')); UI.paintChrome(); }, 700);
  }
}
function finished(right, n){
  heat(0);
  report();
  if(!SITE.fun('finish') || n<5) return;
  var p=right/n;
  if(p===1){ FX.confetti(120); banner(L('A clean set','নির্ভুল সেট'), true); }
  else if(p>=0.8){ FX.confetti(60); banner(L('Great set','দারুণ সেট')); }
}

/* ---------- the weekly league: only those who joined, under a name they chose ---------- */
function myXP(){ var w=DB.game().weekXP; return w && w.wk===GAME.weekKey() ? w.xp : 0; }
function identity(){
  return {id:SITE.deviceId(), n:DB.game().handle||(L('Student ','শিক্ষার্থী ')+(1000+parseInt(SITE.deviceId().slice(0,4),16)%9000)),
    av:GAME.worn('avatar').id, fr:GAME.worn('frame').id, ti:GAME.worn('title').id, xp:myXP(), wk:GAME.weekKey()};
}
function send(body){
  return fetch('api/league.php',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify(body)}).then(function(r){ return r.json(); });
}
function report(){
  if(!SITE.fun('league') || !DB.game().inLeague || SITE.preview || location.protocol.indexOf('http')!==0) return;
  send(identity()).catch(function(){});
}
function leaguePage(){
  var g=DB.game();
  return '<div class="phead"><span class="kicker">'+L('Week '+GAME.weekKey().slice(-2),'সপ্তাহ '+GAME.weekKey().slice(-2))+'</span><h1>'+L('Weekly league','সাপ্তাহিক লিগ')+'</h1>'+
    '<p class="lede muted">'+L('The XP you earn from Monday to Sunday. Everyone starts level again each week, so a beginner can win.','সোমবার থেকে রবিবার পর্যন্ত অর্জিত XP। প্রতি সপ্তাহে সবাই আবার সমান থেকে শুরু করে, তাই নতুনরাও জিততে পারে।')+'</p></div>'+
    (g.inLeague?'':
      '<form class="card lgjoin" id="lgForm"><label class="fld">'+L('Name to show. Not your real name, if you prefer.','যে নাম দেখাবে। চাইলে আসল নাম নয়।')+
      '<input id="lgName" class="field" maxlength="24" value="'+h(identity().n)+'"></label><button class="btn" type="submit">'+L('Join this week','এই সপ্তাহে যোগ দিন')+'</button><p class="sc-err" id="lgErr" hidden></p></form>')+
    '<div class="card lgbox" id="lgBox"><p class="small">'+L('Loading&hellip;','লোড হচ্ছে&hellip;')+'</p></div>'+
    (g.inLeague?'<button class="link quiet" data-act="funLeave">'+L('Leave the league','লিগ ছেড়ে দিন')+'</button>':'');
}
function paintBoard(o){
  var b=document.getElementById('lgBox'); if(!b) return;
  if(o.error){ b.innerHTML='<p class="small">'+h(o.error)+'</p>'; return; }
  var row=function(r){
    var av=GAME.cosmetic(r.av), ti=r.ti&&r.ti!=='none'?GAME.cosmetic(r.ti):null;
    return '<div class="lgr'+(r.me?' me':'')+(r.rank<=3?' top':'')+'"><span class="lgn">'+(r.rank<=3?['&#129351;','&#129352;','&#129353;'][r.rank-1]:r.rank)+'</span><span class="scav ring-'+h(r.fr||'plain')+'">'+(av&&av.art||'&#129417;')+'</span>'+
      '<span class="lgw"><b>'+h(r.n)+'</b>'+(ti?'<i>'+h(ti.name)+'</i>':'')+'</span><span class="lgx">'+U.num(r.xp)+' XP</span></div>';
  };
  var out=o.top.map(row).join('');
  if(o.me && !o.top.some(function(r){ return r.me; })) out+='<div class="lggap"></div>'+row(o.me);
  b.innerHTML=out||'<p class="small">'+L('Nobody has joined this week yet. The first name on the board could be yours.','এই সপ্তাহে এখনও কেউ যোগ দেয়নি। বোর্ডের প্রথম নামটি আপনার হতে পারে।')+'</p>';
}
function afterLeague(){
  if(location.protocol.indexOf('http')!==0 || SITE.preview){ paintBoard({top:[]}); return; }
  var form=document.getElementById('lgForm');
  if(form) form.addEventListener('submit', function(e){
    e.preventDefault();
    var g=DB.game(), err=document.getElementById('lgErr');
    g.handle=document.getElementById('lgName').value.trim();
    err.hidden=true;
    send(identity()).then(function(o){
      if(o.error){ err.textContent=o.error; err.hidden=false; return; }
      g.inLeague=1; DB.save(); UI.render();
    }).catch(function(){ err.textContent=L('Could not reach the server.','সার্ভারে পৌঁছানো গেল না।'); err.hidden=false; });
  });
  var run=DB.game().inLeague ? send(identity()) : fetch('api/league.php?id='+SITE.deviceId(),{credentials:'omit'}).then(function(r){ return r.json(); });
  run.then(paintBoard).catch(function(){ paintBoard({error:L('The league needs the internet.','লিগের জন্য ইন্টারনেট লাগে।')}); });
}
function start(){
  setInterval(function(){ if(!document.hidden && CLOCK.isActive()) report(); }, 180000);
}

UI.act('funSpin', openSpin);
UI.act('funSpinGo', spinGo);
UI.act('funLeave', function(){
  send({id:SITE.deviceId(), leave:1}).then(function(){ DB.game().inLeague=0; DB.save(); UI.render(); });
});
UI.act('buyPower', function(id){ if(GAME.buyPower(id)){ UI.paintChrome(); UI.render(); } });

return {startStrip:startStrip, afterStart:afterStart, resultsRow:resultsRow, answered:answered, finished:finished,
        leaguePage:leaguePage, afterLeague:afterLeague, start:start};
})();
