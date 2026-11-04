/* ===========================================================
   MODES — the same bank of questions, played differently.

   Every mode draws on the same items and records the same honest
   result: an answer in blitz counts exactly as much towards your
   ability estimate as an answer in ordinary practice. What changes
   is the shape of the session — a minute against the clock, a run
   that ends at three mistakes, a topic with a health bar, a race
   against your own best time, or the same ten questions sent to a
   friend.

   Modes arrive as you go, because a student on their first evening
   does not need nine ways to practise; they need one.
   =========================================================== */
var MODES = (function(){

var SPEC={
  adaptive:{name:'অনুশীলন', en:'Practice',  note:'আপনার মানের একটু ওপরে বাঁধা একটি সেট।', noteEn:'A set pitched just above your level.', lock:null},
  blitz:   {name:'ব্লিটজ', en:'Blitz',     note:'ষাট সেকেন্ড। যতগুলো পারেন।', noteEn:'Sixty seconds. As many as you can.', lock:'blitz',
            secs:60, auto:true},
  survival:{name:'সারভাইভাল', en:'Survival',  note:'তিনটি ভুল পর্যন্ত চলে, আর ক্রমশ কঠিন হয়।', noteEn:'Runs until three misses, and gets harder as it goes.', lock:'survival',
            lives:3, auto:true},
  boss:    {name:'বস', en:'Boss',      note:'একটি অধ্যায়, একটি হেলথ বার আর তিনটি হৃদয়।', noteEn:'One chapter, a health bar and three hearts.', lock:'boss',
            hearts:3},
  ghost:   {name:'ঘোস্ট রেস', en:'Ghost race', note:'নিজের সেরা সময়ের সাথে দশটি প্রশ্ন।', noteEn:'Ten questions against your own best time.', lock:'ghost'},
  duel:    {name:'দ্বৈরথ', en:'Duel',     note:'বন্ধুর সাথে একই দশটি প্রশ্ন।', noteEn:'The same ten questions as a friend.', lock:'duel'},
  /* the board takes nothing off for a wrong MCQ, so this mode is the
     real sheet's arithmetic: one mark right, nothing off wrong, and
     the mark visible as it builds. */
  admission:{name:'বোর্ড এমসিকিউ', en:'Board MCQ', note:'শেষ করা একটি পত্র আবার, বোর্ডের হিসাবে — ভুলে কিছু কাটা যায় না।', noteEn:'A finished paper again, marked the board\'s way — nothing off for a miss.',
            lock:'newgame', neg:0},
  mock:    {name:'পূর্ণ পত্র', en:'Full paper',  note:'পুরো একটি পত্রের এমসিকিউ, আসল ঘড়িতে, শেষে দেখা।', noteEn:'A whole paper\'s MCQ on the real clock, checked at the end.', lock:'marathon'},
  skiptest:{name:'বাদ দেওয়ার পরীক্ষা', en:'Skip test', note:'পাঁচটি কঠিন প্রশ্ন। পাস করলে অধ্যায়টি হিসাবের বাইরে।', noteEn:'Five hard questions. Pass and the chapter leaves the count.', lock:null},
  diag:    {name:'শুরুর পরীক্ষা', en:'Diagnostic', note:'নিজের মান বুঝতে কয়েকটি প্রশ্ন।', noteEn:'A few questions to see where you stand.', lock:null}
};
/* .name and .note answer in the interface language */
Object.keys(SPEC).forEach(function(k){
  var o=SPEC[k], bn=o.name, en=o.en, nb=o.note, ne=o.noteEn;
  Object.defineProperty(o,'name',{get:function(){ return L(en,bn); }, enumerable:true, configurable:true});
  Object.defineProperty(o,'note',{get:function(){ return L(ne,nb); }, enumerable:true, configurable:true});
});
function spec(id){ return SPEC[id]||SPEC.adaptive; }
function available(id){ var s=spec(id); return !s.lock || GAME.has(s.lock); }
function list(){
  var out=[];
  for(var k in SPEC){
    if(k==='adaptive'||k==='skiptest'||k==='diag') continue;
    var s=SPEC[k];
    out.push({id:k, name:s.name, note:s.note, open:available(k),
              at:s.lock?lockLevel(s.lock):0});
  }
  return out;
}
function lockLevel(id){
  for(var i=0;i<GAME.UNLOCKS.length;i++) if(GAME.UNLOCKS[i].id===id) return GAME.UNLOCKS[i].at;
  return 0;
}

/* ---------- starting one ---------- */
function start(id, o){
  o=o||{};
  if(!available(id)){
    UI.toast(L(spec(id).name+' opens at level '+lockLevel(spec(id).lock)+'.',spec(id).name+' খোলে লেভেল '+lockLevel(spec(id).lock)+'-এ।'));
    return;
  }
  var f=({blitz:blitz, survival:survival, boss:boss, ghost:ghost,
          admission:admission, skiptest:skiptest, diag:diag})[id];
  if(f) f(o); else RUN.start(o);
}

function blitz(o){
  var track=o.track||DB.state().track;
  RUN.start({
    track:track, sec:o.sec||null, topic:o.topic||null, mode:'blitz',
    n:60, title:L('Blitz','ব্লিটজ'), back:o.back||'track', backParam:o.backParam||track
  });
}
function survival(o){
  var track=o.track||DB.state().track;
  RUN.start({
    track:track, sec:o.sec||null, topic:o.topic||null, mode:'survival',
    n:80, title:L('Survival','সারভাইভাল'), back:o.back||'track', backParam:o.backParam||track
  });
}
function boss(o){
  var topic=o.topic;
  if(!topic){ UI.toast(L('Choose a chapter to fight.','কোন অধ্যায়ের সাথে লড়বেন বেছে নিন।')); return; }
  RUN.start({
    track:ICE.topics[topic].track, topic:topic, mode:'boss', n:18, hard:true,
    title:ICE.tname(topic)+' &mdash; '+L('boss','বস'), back:'topic', backParam:topic
  });
}
function ghost(o){
  var topic=o.topic;
  if(!topic){ UI.toast(L('Choose a chapter to race in.','কোন অধ্যায়ে দৌড়াবেন বেছে নিন।')); return; }
  RUN.start({
    track:ICE.topics[topic].track, topic:topic, mode:'ghost', n:10,
    title:ICE.tname(topic)+' &mdash; '+L('ghost race','ঘোস্ট রেস'), back:'topic', backParam:topic
  });
}
function admission(o){
  var sec=o.sec;
  if(!sec){ UI.toast(L('Choose a paper.','একটি পত্র বেছে নিন।')); return; }
  RUN.start({
    track:sec.split('/')[0], sec:sec, mode:'admission', n:20, hard:true,
    title:ICE.sname(sec)+' &mdash; '+L('board MCQ','বোর্ড এমসিকিউ'), back:'section', backParam:sec
  });
}
function skiptest(o){
  var topic=o.topic, pool=AB.inTopic(topic).slice();
  if(pool.length<5){ UI.toast(L('Not enough questions in this chapter for a skip test.','এই অধ্যায়ে বাদ দেওয়ার পরীক্ষা দেওয়ার মতো যথেষ্ট প্রশ্ন নেই।')); return; }
  pool.sort(function(a,b){ return (b.b||0)-(a.b||0); });
  var queue=U.sample(pool.slice(0, Math.min(18, pool.length)), 5);
  RUN.start({
    queue:queue, track:ICE.topics[topic].track, topic:topic, mode:'skiptest',
    title:L('Skip test','বাদ দেওয়ার পরীক্ষা')+' &mdash; '+ICE.tname(topic), back:'topic', backParam:topic
  });
}
function diag(o){
  var track=o.track||DB.state().track, want=o.n||12;
  var secs=ICE.sectionsOf(track), queue=[], per=Math.max(2, Math.round(want/secs.length));
  secs.forEach(function(sec){
    queue=queue.concat(AB.mockSet({sec:sec.track+'/'+sec.id, n:per}));
  });
  queue=U.shuffle(queue, 11).slice(0,want);
  if(!queue.length){ UI.toast(L('No questions are loaded yet.','এখনও কোনো প্রশ্ন লোড হয়নি।')); return; }
  RUN.start({queue:queue, track:track, mode:'diag', exam:true, noBrief:!!o.noBrief,
             title:o.title||L('Where you stand','আপনি কোথায় আছেন'), back:o.back||'today'});
}

/* ---------- per-run state ---------- */
function init(R){
  var s=spec(R.mode);
  R.gm={
    spec:s,
    lives:s.lives||0, hearts:s.hearts||0,
    hp:R.mode==='boss'?100:0,
    ends:s.secs?Date.now()+s.secs*1000:0,
    neg:s.neg||0, score:0,
    ghost:R.mode==='ghost'?ghostTarget(R.topic):null,
    combo:0, best:0, golden:null, beastRun:0
  };
  return R.gm;
}
function auto(R){
  return !!(R.gm && R.gm.spec.auto);      /* blitz and survival keep moving: that is the mode */
}
function timeLeft(R){
  if(!R.gm||!R.gm.ends) return null;
  return Math.max(0,(R.gm.ends-Date.now())/1000);
}

/* one question in twenty-five is worth five times as much */
function rollGolden(R){
  if(!R || R.exam || R.mode==='skiptest') return false;
  return Math.random()<0.04;
}

/* ---------- what an answer does to the mode ---------- */
function afterAnswer(R, ok, q){
  var g=R.gm; if(!g) return null;
  if(R.mode==='survival'){
    if(!ok){ g.lives--; FX.play('hit');
      if(g.lives<=0) return {end:true, reason:L('Three misses. '+R.right+' right before that.','তিনটি ভুল। তার আগে '+R.right+'টি ঠিক।')}; }
    return null;
  }
  if(R.mode==='boss'){
    if(ok){
      var bite=Math.round(100/9 * (1+Math.max(0,(q.b||0))*0.4));
      g.hp=Math.max(0, g.hp-bite);
      if(g.hp<=0) return {end:true, won:true, reason:L('The chapter is down.','অধ্যায়টি কুপোকাত।')};
    } else {
      g.hearts--; FX.play('hit');
      if(g.hearts<=0) return {end:true, won:false, reason:L('Out of hearts.','হৃদয় শেষ।')};
    }
    return null;
  }
  if(R.mode==='admission'){
    g.score += ok ? 1 : -g.neg;
    return null;
  }
  if(R.mode==='blitz'){
    if(timeLeft(R)<=0) return {end:true, reason:L('Time is up.','সময় শেষ।')};
    return null;
  }
  return null;
}

/* ---------- ghosts: your own past, as a pace bar ---------- */
function ghostTarget(topic){
  var runs=DB.state().runs.filter(function(r){ return r.topic===topic && r.n>=8; });
  if(!runs.length) return null;
  var best=null;
  runs.forEach(function(r){
    var per=r.secs/r.n;
    if(!best || (r.right/r.n>=0.7 && per<best.per)) best={per:per, acc:r.right/r.n, t:r.t};
  });
  return best;
}
function ghostState(R){
  var g=R.gm; if(!g||!g.ghost) return null;
  var mine=(Date.now()-R.startedAt)/1000;
  var theirs=g.ghost.per*(R.answered||0);
  return {mine:mine, theirs:theirs, ahead:mine<theirs, per:g.ghost.per};
}

/* ---------- duels: a code, not a server ----------
   The code carries a seed. Both sides build the same ten questions
   from it, so nothing has to be sent but a handful of characters. */
function makeDuel(o){
  var track=o.track||DB.state().track;
  var seed=Math.floor(Math.random()*1679615);            /* 36^4 */
  return 'H'+seed.toString(36).toUpperCase();
}
function duelQueue(code){
  var track='hsc';
  var seed=parseInt(code.slice(1),36);
  if(!isFinite(seed)) return null;
  var pool=ICE.Q.filter(function(q){ return q._track===track && (q.b||0)>=ICE.EXAM_B; });
  if(pool.length<10) pool=ICE.Q.filter(function(q){ return q._track===track; });
  if(pool.length<10) return null;
  var s=seed>>>0, out=[], used={};
  function rnd(){ s|=0; s=s+0x6D2B79F5|0;
    var t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296; }
  var guard=0;
  while(out.length<10 && guard++<500){
    var i=Math.floor(rnd()*pool.length);
    if(used[i]) continue;
    used[i]=1; out.push(pool[i]);
  }
  return {track:track, queue:out};
}
function startDuel(code){
  code=String(code||'').trim().toUpperCase();
  var d=duelQueue(code);
  if(!d){ UI.toast(L('That code does not look right.','কোডটি ঠিক মনে হচ্ছে না।')); return; }
  RUN.start({queue:d.queue, track:d.track, mode:'duel', code:code,
             title:L('Duel ','দ্বৈরথ ')+code, back:'social'});
}
/* a result is its own short code: code, right, and seconds */
function resultCode(R){
  return R.code+'-'+R.right+'-'+Math.round(U.sum(R.times));
}
function readResult(str){
  var p=String(str||'').trim().toUpperCase().split('-');
  if(p.length<3) return null;
  var right=parseInt(p[1],10), secs=parseInt(p[2],10);
  if(!isFinite(right)||!isFinite(secs)) return null;
  return {code:p[0], right:right, secs:secs};
}
function saveDuel(rec){
  var g=DB.game();
  g.duels.unshift(rec);
  if(g.duels.length>40) g.duels=g.duels.slice(0,40);
  DB.save();
}
function duelWinner(mine, theirs){
  if(mine.right!==theirs.right) return mine.right>theirs.right?'you':'them';
  if(Math.abs(mine.secs-theirs.secs)<3) return 'tie';
  return mine.secs<theirs.secs?'you':'them';
}

/* ---------- the skip test's verdict ---------- */
function skipResult(R){
  var pass=R.right>=4;
  if(pass){
    var g=DB.game();
    g.credit[R.topic]=Date.now();
    DB.save();
    PLAN.invalidate();
    GAME.addXP(120,'skip test');
    GAME.unlockTopicCard(R.topic);
    FX.confetti(70);
  }
  return {pass:pass, right:R.right};
}
function credited(topic){ return !!DB.game().credit[topic]; }
function dropCredit(topic){ delete DB.game().credit[topic]; DB.save(); PLAN.invalidate(); }

/* ---------- the diagnostic: start with something already done ----------
   Endowed progress, honestly earned: the twelve questions are real and
   the credit is for the ones you actually got right. */
function diagResult(R){
  var g=DB.game();
  g.diag=1;
  /* enough to arrive somewhere rather than nowhere — about level three —
     without skipping the ladder the rest of the app is built on */
  var xp=60+R.right*20;
  DB.save();
  GAME.addXP(xp,'diagnostic');
  GAME.addCoins(60);
  GAME.earnChest();
  var by={};
  R.marks.forEach(function(m){
    var k=ICE.topics[m.q.topic]?ICE.topics[m.q.topic].sec:null;
    if(!k) return;
    var b=by[k]||(by[k]={n:0,c:0}); b.n++; if(m.ok) b.c++;
  });
  return {xp:xp, right:R.right, n:R.marks.length, by:by};   /* a head start, on top of what the answers paid */
}

return {
  SPEC:SPEC, spec:spec, available:available, list:list, lockLevel:lockLevel,
  start:start, init:init, auto:auto, timeLeft:timeLeft, afterAnswer:afterAnswer,
  rollGolden:rollGolden, ghostTarget:ghostTarget, ghostState:ghostState,
  makeDuel:makeDuel, duelQueue:duelQueue, startDuel:startDuel,
  resultCode:resultCode, readResult:readResult, saveDuel:saveDuel, duelWinner:duelWinner,
  skipResult:skipResult, credited:credited, dropCredit:dropCredit,
  diagResult:diagResult
};
})();
