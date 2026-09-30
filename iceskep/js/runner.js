/* ===========================================================
   RUNNER — the question loop.

   A set opens with a short brief: how many questions, how long,
   what counts. Then the window belongs to the question — no
   sidebar, no header — with a slim bar on top that fills as you
   go and a counter of work left that ticks down with every right
   answer.

   Answer, and you know within a quarter second: the option lights
   green with a tick and a small burst, or shakes red with the right
   one marked. Then two buttons and nothing else — Next question and
   Explanation. Nothing moves on by itself, and when the set ends,
   the next one waits for you to ask for it.
   =========================================================== */
var RUN = (function(){

var R=null;
var tickT=null, armT=null, modeT=null;

/* ---------- lifecycle ---------- */
function start(o){
  stop();
  var queue = o.queue || (o.mode==='plan' ? PLAN.nextSet(o.track, o.n) : AB.buildSet(o));
  if(!queue.length){
    UI.toast(L('There are no questions in the bank for this yet.','এর জন্য এখনও ব্যাংকে কোনো প্রশ্ন নেই।'));
    return;
  }
  R={
    title:o.title||L('Practice','অনুশীলন'),
    back:o.back||'practice',
    backParam:o.backParam||null,
    track:o.track||(queue[0]&&queue[0]._track),
    sec:o.sec||null, topic:o.topic||null,
    mode:o.mode||'adaptive',
    code:o.code||null,                /* a duel carries its code */
    exam:!!o.exam,                    /* a mock: nothing marked until the end */
    n0:o.n||queue.length,
    queue:queue, i:0,
    phase: o.noBrief ? 'ask' : 'brief',
    view:null, resp:null, result:null, showWhy:false,
    startedAt:Date.now(), askedAt:0, elapsed:0,
    right:0, answered:0, times:[], marks:[],
    perTopic:{}, slow:0,
    alarmed:false, alarmOff:false,
    left0:PLAN.track(o.track||(queue[0]&&queue[0]._track)).minutes,
    /* the game layer, per run */
    combo:0, bestCombo:0, xp:0, coins:0, goldHit:0, beastRun:0,
    sure:null, fifty:null, hinted:false, pts:null, golden:false, ended:null
  };
  /* A first evening should end in a win. The first five questions anyone
     ever answers come from the gentle end of the draw — after that the
     ordinary rules apply and never move again. */
  if(DB.game().answered<5 && !o.queue) R.queue.sort(function(a,b){ return (a.b||0)-(b.b||0); });
  /* the stars of every chapter in this set, so the end of the set can say which ones grew */
  R.stars0={};
  R.queue.forEach(function(q){ if(R.stars0[q.topic]===undefined) R.stars0[q.topic]=GAME.stars(q.topic).n; });
  MODES.init(R);
  R.golden=MODES.rollGolden(R);
  R.view=AB.present(R.queue[0]);
  CLOCK.focus({track:R.track, sec:R.sec, topic:R.topic});
  QUEST.clearLoop();
  if(R.phase==='ask' && R.gm && R.gm.ends) R.gm.ends=Date.now()+R.gm.spec.secs*1000;
  UI.go('run');
}
/* from the brief to the first question: the clocks start now, not before */
function begin(){
  if(!R || R.phase!=='brief') return;
  R.phase='ask';
  R.startedAt=Date.now(); R.askedAt=0;
  if(R.gm && R.gm.ends) R.gm.ends=Date.now()+R.gm.spec.secs*1000;
  FX.play('next');
  UI.render();
  window.scrollTo(0,0);
}
function leave(){
  if(!R) return;
  UI.go(R.back, R.backParam);
}
function stop(){
  if(R && R.answered) PLAN.stamp();
  clearTimers();
  clearModeTimer();
  FX.alarmStop();
  disarmAdvance();
  document.removeEventListener('keydown', onKey, true);
  R=null;
}
function clearTimers(){
  if(tickT){ clearInterval(tickT); tickT=null; }
  if(armT){ clearTimeout(armT); armT=null; }
}
function clearModeTimer(){ if(modeT){ clearInterval(modeT); modeT=null; } }

/* Blitz runs against one clock for the whole session, not one per question. */
function modeTick(){
  if(!R || !R.gm || !R.gm.ends || R.phase==='brief') return clearModeTimer();
  var left=MODES.timeLeft(R), box=document.getElementById('modeClock');
  if(box){
    box.innerHTML='time <b>'+U.secs(left)+'</b>';
    box.className='qtime'+(left<10?' over':left<20?' warn':'');
  }
  if(left<=3 && left>0 && !R._cd){ R._cd=1; FX.play('countdown'); }
  if(left<=0){ clearModeTimer(); endRun({reason:L('Time is up.','সময় শেষ।')}); }
}
function active(){ return !!R; }
function current(){ return R && R.queue[R.i]; }       /* the original item */
function view(){ return R && R.view; }                /* the shuffled copy on screen */

/* ---------- the clock on one question ---------- */
function timerOn(){ return !!DB.state().timer && !(R && R.gm && R.gm.ends); }
function alarmOn(){ return timerOn() && DB.state().settings.alarm!==false; }

function tick(){
  if(!R || R.phase!=='ask') return;
  var q=view(); if(!q) return;
  var s=(Date.now()-R.askedAt)/1000, pace=AB.paceOf(q), left=pace-s;
  var box=document.getElementById('qTimer');
  if(box){
    box.innerHTML = left>=0 ? 'time <b>'+U.secs(left)+'</b>' : 'over <b>+'+U.secs(-left)+'</b>';
    box.className='qtime'+(left<0?' over':left<pace*0.25?' warn':'');
  }
  var pb=document.getElementById('paceFill');
  if(pb){
    pb.style.width=U.clamp(100*left/pace,0,100)+'%';
    pb.className = left<0?'over':left<pace*0.25?'warn':'';
  }
  if(left<=0 && !R.alarmed){
    R.alarmed=true;
    if(alarmOn()){ FX.alarmStart(); showAlarm(true); }
  }
}
function showAlarm(on){
  var a=document.getElementById('alarmBar');
  if(a) a.hidden=!on;
}
function stopAlarm(){
  FX.alarmStop();
  if(R) R.alarmOff=true;
  showAlarm(false);
}

/* ---------- answering ---------- */
function setResp(v){
  if(!R||R.phase!=='ask') return;
  R.resp=v;
  UI.repaintView();
}
/* a board MCQ is one mark: the tap is the answer */
function choose(i){
  if(!R||R.phase!=='ask') return;
  R.resp=i;
  submit();
}
function submit(){
  if(!R||R.phase!=='ask'||R.ended) return;   /* the mode has already called it */
  var q=view(), orig=current();
  if(R.resp===null||R.resp===undefined) return;

  clearTimers();
  FX.alarmStop();
  R.elapsed=(Date.now()-R.askedAt)/1000;
  var res=AB.check(q, R.resp);
  var pace=AB.paceOf(q);
  var timed=timerOn();

  R.result={ok:res.ok, partial:res.partial, secs:R.elapsed, slow:timed && R.elapsed>pace};
  R.answered++;
  R.times.push(R.elapsed);
  R.marks.push({q:orig, v:q, ok:res.ok, secs:R.elapsed, resp:R.resp});
  if(res.ok) R.right++;
  if(R.result.slow) R.slow++;

  var pt=R.perTopic[q.topic]||(R.perTopic[q.topic]={n:0,c:0,s:0});
  pt.n++; if(res.ok) pt.c++; pt.s+=R.elapsed;

  var prev=DB.state().items[orig.id];
  R._wasMissed=!!(prev && prev.miss && !prev.cl);

  AB.record(orig, {ok:res.ok, secs:R.elapsed, timed:timed});
  scoreAnswer(orig, q, res, timed);

  var over=MODES.afterAnswer(R, res.ok, q);
  if(!res.ok && DB.state().settings.redemption!==false) insertRedemption(orig);

  if(R.exam){
    R.i++; R.resp=null; R.result=null;
    if(R.i>=R.queue.length){ finish(); return; }
    R.view=AB.present(R.queue[R.i]);
    R.phase='ask'; R.alarmed=false; R.alarmOff=false;
    FX.play('tick');
    UI.repaintView();
    return;
  }

  R.phase='feedback'; R.showWhy=false;
  if(over && over.end) R.ended=over;
  UI.repaintView();

  var optEl=document.querySelector(res.ok?'.opt.right':'.opt.wrong')||document.querySelector('.qcard');
  if(res.ok){
    FX.verdictCorrect({el:optEl, streak:runStreak()});
    FX.burst(optEl, R.combo>=3?20:12, R.golden?'acc':'ok');
    payOut(optEl);
  } else {
    FX.verdictWrong({el:optEl});
  }

  if(R.ended){ setTimeout(function(){ if(R&&R.phase==='feedback') finish(); }, 1500); return; }
  if(MODES.auto(R)){ setTimeout(function(){ if(R&&R.phase==='feedback') next(); }, res.ok?560:1600); return; }
  armAdvance();
}

/* ---------- the payout you can see ----------
   The coins and the XP leave the answer you picked and fly into their
   boxes in the top bar. Until each one lands, the box keeps its old
   number; then it counts up and bumps, like a game paying out. */
function payOut(fromEl){
  var pts=R.pts, g=DB.game();
  if(!pts || (pts.xp<=0 && !pts.coins)) return;
  var xpBox=document.getElementById('xpBox'), coinBox=document.getElementById('coinBox');
  var before=R._before||{xp:g.xp, coins:g.coins};
  var target={xp:g.xp, coins:g.coins}, shown={xp:before.xp, coins:before.coins};
  var legs=0;
  function done(){ if(--legs<=0){ UI.holdChrome(null); } }
  UI.holdChrome({xp:shown.xp, coins:shown.coins});
  if(pts.coins>0){
    legs++;
    var n=Math.min(9, Math.max(3, pts.coins*2));
    FX.fly({from:fromEl, to:coinBox, kind:'coin', count:n,
      onLand:function(i, last){
        shown.coins = last ? target.coins : Math.min(target.coins, before.coins+Math.ceil((target.coins-before.coins)*(i+1)/n));
        var h=UI.holding(); if(h){ h.coins=shown.coins; UI.paintChrome(); }
      }, onDone:done});
  }
  if(pts.xp>0){
    legs++;
    FX.fly({from:fromEl, to:xpBox, kind:'xp', count:4, label:'+'+pts.xp+' XP',
      onLand:function(i, last){
        if(!last) return;
        shown.xp=target.xp;
        var h=UI.holding(); if(h){ h.xp=shown.xp; UI.paintChrome(); }
      }, onDone:done});
  }
  /* never leave the bar frozen, whatever happens to the animation */
  setTimeout(function(){ if(UI.holding()) UI.holdChrome(null); }, 2600);
}

/* ---------- what an answer is worth ----------
   Points follow the work: harder question, more; quick and right, more;
   a run of them, more. A wrong answer costs nothing at all unless you
   said you were sure, and then it costs a little. */
function scoreAnswer(orig, q, res, timed){
  var g=DB.game();
  g.answered++; if(res.ok) g.correct++;

  R.combo = res.ok ? R.combo+1 : 0;
  R.bestCombo = Math.max(R.bestCombo, R.combo);
  g.bestCombo = Math.max(g.bestCombo, R.bestCombo);

  R._before={xp:g.xp, coins:g.coins};
  var pts=GAME.points({q:q, ok:res.ok, secs:R.elapsed, timed:timed,
                       combo:R.combo, golden:R.golden, sure:R.sure});
  R.pts=pts;
  R.xp+=Math.max(0,pts.xp); R.coins+=pts.coins;
  GAME.addXP(pts.xp); GAME.addCoins(pts.coins);
  if(res.ok && R.golden){ R.goldHit++; FX.play('golden'); }

  QUEST.tick('q');
  if(res.ok){ QUEST.tick('right'); QUEST.tick('combo', R.combo); }
  if(res.ok && (pts.tier.id==='hard'||pts.tier.id==='beast')) QUEST.tick('hard');
  if(res.ok && R.golden) QUEST.tick('golden');
  if(res.ok && R.topic) QUEST.tick('topics');

  var now=DB.state().items[orig.id];
  if(res.ok && R._wasMissed && now && now.cl){ g.fixed++; QUEST.tick('fixed'); }

  if(R.sure===true) g.sureRun = res.ok ? (g.sureRun||0)+1 : 0;
  R.beastRun = (res.ok && pts.tier.id==='beast') ? (R.beastRun||0)+1 : 0;

  if(res.ok && orig.trick) GAME.unlockTrick(orig.trick);

  DB.save();
  GAME.check('answer', {ok:res.ok, golden:R.golden, beastRun:R.beastRun});
}

/* how sure are you? asked before you answer, and only if you asked for it */
function bet(v){
  if(!R||R.phase!=='ask') return;
  R.sure=v;
  UI.repaintView();
}

/* ---------- lifelines ---------- */
function useFifty(){
  if(!R||R.phase!=='ask') return;
  var g=DB.game(), q=view();
  if(R.fifty) return;
  if(g.lifelines.fifty<=0){ UI.toast(L('No 50:50 left. They come from chests.','৫০:৫০ আর নেই। ওগুলো সিন্দুক থেকে আসে।')); return; }
  var opts=AB.options(q), wrong=[], i;
  for(i=0;i<opts.length;i++) if(i!==q.ans) wrong.push(i);
  wrong=U.shuffle(wrong, Date.now()%997);
  R.fifty=wrong.slice(0, Math.max(0, wrong.length-1));   /* leave one wrong standing */
  g.lifelines.fifty--; DB.save();
  GAME.markHintUsed(q.topic);
  FX.play('whoosh');
  UI.repaintView();
}
function useTrick(){
  if(!R||R.phase!=='ask') return;
  var g=DB.game(), q=view();
  if(R.hinted) return;
  var tk=q.trick && AB.trick(q.trick);
  if(!tk){ UI.toast(L('No card is linked to this question.','এই প্রশ্নের সাথে কোনো কার্ড জোড়া নেই।')); return; }
  if(g.lifelines.trick<=0){ UI.toast(L('No card lifelines left. They come from chests.','কার্ড-লাইফলাইন আর নেই। ওগুলো সিন্দুক থেকে আসে।')); return; }
  g.lifelines.trick--; R.hinted=true; DB.save();
  GAME.markHintUsed(q.topic);
  FX.play('whoosh');
  UI.repaintView();
}

/* ---------- redemption ----------
   Miss one and the next question is the same idea a step easier, slipped
   into the queue. It is not a third button: the two buttons stay Next
   question and Explanation, and Next simply lands on the second chance. */
var FIXED_LEN={duel:1, skiptest:1, qotd:1, ghost:1, boss:1, admission:1, diag:1};
function fixedQueue(){ return !!(R.exam || FIXED_LEN[R.mode]); }

function insertRedemption(orig){
  if(R._redeemAt===R.i || fixedQueue()) return;
  var seen={}, i;
  for(i=0;i<R.queue.length;i++) seen[R.queue[i].id]=1;
  var easier=AB.inTopic(orig.topic).filter(function(x){
    return !seen[x.id] && (x.b||0) <= (orig.b||0)-0.15;
  });
  var pool=easier.length ? easier.sort(function(a,b){ return (b.b||0)-(a.b||0); })
                         : AB.inTopic(orig.topic).filter(function(x){ return !seen[x.id]; })
                             .sort(function(a,b){ return (a.b||0)-(b.b||0); });
  if(!pool.length) return;
  R.queue.splice(R.i+1, 0, pool[0]);
  R._redeemAt=R.i;
  R._redeemId=pool[0].id;
}

/* ---------- ending early, when a mode says so ---------- */
function endRun(info){
  if(!R) return;
  R.ended=info||{};
  finish();
}
function runStreak(){
  var n=0;
  for(var i=R.marks.length-1;i>=0;i--){ if(R.marks[i].ok) n++; else break; }
  return n;
}

/* ---------- moving on: only when you say so ---------- */
function armAdvance(){
  disarmAdvance();
  /* a short delay, so the click that answered is not also the click that moves on */
  armT=setTimeout(function(){ document.addEventListener('click', anywhere, true); }, 380);
}
function disarmAdvance(){
  if(armT){ clearTimeout(armT); armT=null; }
  document.removeEventListener('click', anywhere, true);
}
function anywhere(e){
  if(!R || R.phase!=='feedback') return disarmAdvance();
  var t=e.target;
  if(t.closest && t.closest('button,a,input,textarea,select,label,summary,details,.whybox,.fbar,.actions,.qhelp,.calc,.calcfab,.toast,.sheet,[data-noadvance]')) return;
  if(window.getSelection && String(window.getSelection()).length>0) return;   /* selecting text, not moving on */
  e.preventDefault(); e.stopPropagation();
  next();
}
function toggleWhy(){
  if(!R || R.phase!=='feedback') return;
  R.showWhy=!R.showWhy;
  UI.repaintView();
  armAdvance();
  if(R.showWhy){
    var w=document.getElementById('whyBox');
    if(w && w.scrollIntoView) w.scrollIntoView({block:'nearest', behavior:'smooth'});
  }
}

function next(){
  if(!R) return;
  if(R.ended) return finish();
  clearTimers();
  disarmAdvance();
  FX.alarmStop();
  FX.play('next');
  R.i++; R.resp=null; R.result=null; R.phase='ask'; R.showWhy=false;
  R.alarmed=false; R.alarmOff=false; R._blank=0;
  R.sure=null; R.fifty=null; R.hinted=false; R.pts=null;
  if(R.i>=R.queue.length && !liftEnd()) return finish();
  R.golden=MODES.rollGolden(R);
  R.view=AB.present(R.queue[R.i]);
  UI.repaintView();
  window.scrollTo({top:0, behavior:'smooth'});
}
/* Nobody should finish a set on a question they got wrong. If the last
   one went badly, one gentler question of the same kind is added so the
   set ends on something that worked. Switchable off in settings. */
function liftEnd(){
  if(!R || R._lifted || fixedQueue()) return false;
  if(R.gm && (R.gm.ends || R.gm.lives)) return false;   /* these end on their own terms */
  if(DB.state().settings.redemption===false) return false;
  var last=R.marks[R.marks.length-1];
  if(!last || last.ok) return false;
  var seen={}, i;
  for(i=0;i<R.queue.length;i++) seen[R.queue[i].id]=1;
  var scope = R.topic ? AB.inTopic(R.topic) : (R.sec ? AB.inSection(R.sec) : AB.inTrack(R.track));
  var pool=scope.filter(function(x){ return !seen[x.id] && (x.b||0) < AB.theta(x.topic); });
  if(!pool.length) return false;
  pool.sort(function(a,b){ return (b.b||0)-(a.b||0); });
  R.queue.push(pool[0]);
  R._lifted=true;
  return true;
}

function skip(){
  if(!R||R.phase!=='ask') return;
  R.marks.push({q:current(), v:view(), ok:false, secs:(Date.now()-R.askedAt)/1000, skipped:true});
  R.answered++;
  clearTimers();
  FX.alarmStop();
  R.i++; R.resp=null; R.phase='ask'; R.alarmed=false; R.alarmOff=false; R._blank=0;
  if(R.i>=R.queue.length) return finish();
  R.view=AB.present(R.queue[R.i]);
  UI.repaintView();
}
function finish(){
  clearTimers();
  clearModeTimer();
  disarmAdvance();
  FX.alarmStop();
  R.phase='done';
  R.finishedAt=Date.now();
  var s=DB.state();
  s.runs.push({
    t:Date.now(), track:R.track, sec:R.sec, topic:R.topic, mode:R.mode,
    n:R.answered, right:R.right, secs:Math.round(U.sum(R.times)),
    med:Math.round(U.median(R.times)||0)
  });
  if(s.runs.length>400) s.runs=s.runs.slice(-320);
  DB.bump('sets');
  DB.save();
  PREDICT.snapshot();
  wrapUp();
  PLAN.stamp();
  R.leftEnd=PLAN.track(R.track).minutes;
  FX.play('done');
  UI.render({enter:true});
  window.scrollTo(0,0);
  UI.flushCelebrations();
}

/* everything the run owes the game layer, paid once, at the end */
function wrapUp(){
  var g=DB.game(), n=R.marks.length, acc=n?R.right/n:0;
  var med=R.times.length?U.median(R.times):0;
  var perfect = n>=5 && R.right===n;

  QUEST.tick('sets');
  if(acc>=0.8 && n>=5) QUEST.tick('good');

  g.cleanRun = perfect ? (g.cleanRun||0)+1 : 0;
  if(perfect) GAME.record('clean', n);
  GAME.record('combo', g.bestCombo);
  if(n>=10 && med) GAME.record('setTime', med);
  GAME.record('day', DB.actsToday().q);
  if(R.mode==='blitz') GAME.record('blitz', R.right);
  if(R.mode==='survival') GAME.record('survival', n);

  var sets=DB.actsToday().sets;
  if(sets && sets%3===0) GAME.earnChest();
  if(perfect){ GAME.earnChest(); setTimeout(function(){ FX.confetti(90); }, 500); }

  if(R.mode==='skiptest') R.skipOut=MODES.skipResult(R);
  if(R.mode==='diag')     R.diagOut=MODES.diagResult(R);
  if(R.mode==='qotd')     QUEST.answerQotd(R.right>0);
  if(R.mode==='duel'){
    R.duelCode=MODES.resultCode(R);
    MODES.saveDuel({code:R.code, right:R.right, secs:Math.round(U.sum(R.times)), t:Date.now()});
  }
  if(R.mode==='boss' && R.ended && R.ended.won){ GAME.addXP(300,'boss down'); setTimeout(function(){ FX.confetti(110); }, 500); }
  if(R.mode==='ghost'){
    var gs=MODES.ghostState(R);
    R.ghostWon = !!(gs && gs.ahead && acc>=0.7);
  }

  PLAN.invalidate();
  if(R.topic){
    var px=PLAN.topic(R.topic);
    if(px.total && px.cleared>=px.total) GAME.unlockTopicCard(R.topic);
  }

  /* a new star is worth a moment of its own */
  var grew=[];
  for(var tid in (R.stars0||{})){ var sn=GAME.stars(tid).n; if(sn>R.stars0[tid]) grew.push({id:tid, n:sn}); }
  R.starsGrew=grew;
  if(grew.length){
    setTimeout(function(){
      FX.play('star'); FX.confetti(40);
      UI.toast('<b>'+'&#9733;'.repeat(grew[0].n)+'</b> &nbsp;'+L(grew[0].n+(grew[0].n===1?' star':' stars')+' in ',grew[0].n+' তারা: ')+U.h(ICE.tname(grew[0].id))+
        (grew.length>1?L(' (and '+(grew.length-1)+' more)',' (আরও '+(grew.length-1)+'টি)'):''), 4200);
    }, 700);
  }

  var gift=QUEST.streakGifts();
  if(gift) UI.toast('<b>'+gift.days+L(' days',' দিন')+'</b> &mdash; '+gift.gift+'.', 3800);

  GAME.check('set', {perfect:perfect, cleanRun:g.cleanRun, n:n, right:R.right,
                     mode:R.mode, won:!!(R.ended&&R.ended.won) || !!R.ghostWon,
                     hearts:R.gm?R.gm.hearts:0, allFast:allFast(),
                     comeback:DB.game().comebackDay===DB.today()});
  DB.save();
}
function allFast(){
  if(!R.marks.length) return false;
  return R.marks.every(function(m){ return m.ok && m.secs<=AB.paceOf(m.q); });
}

/* ---------- flagging a bad question ---------- */
function flag(){
  if(!R) return;
  var q=current();
  var why=window.prompt(L('What looks wrong with this question? (optional)','প্রশ্নটিতে কী ভুল মনে হচ্ছে? (না লিখলেও চলবে)'), '');
  if(why===null) return;
  SHARE.flag(q.id, why);
}

/* ---------- keyboard ---------- */
function onKey(e){
  if(!R) return;
  if(UI.sheetOpen()) return;
  if(e.key==='Escape' && FX.alarmOn()){ e.preventDefault(); stopAlarm(); return; }
  var t=e.target;
  if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable)){
    if(e.key==='Enter' && t.tagName==='INPUT'){ e.preventDefault(); if(R.phase==='ask') submit(); else if(R.phase==='feedback') next(); }
    return;
  }
  if(e.metaKey||e.ctrlKey||e.altKey) return;

  if(R.phase==='brief'){
    if(e.key===' '||e.key==='Enter'){ e.preventDefault(); begin(); }
    else if(e.key==='Escape'){ e.preventDefault(); leave(); }
    return;
  }
  if(R.phase==='feedback'){
    if(e.key===' '||e.key==='Enter'||e.key==='ArrowRight'){ e.preventDefault(); next(); }
    else if(e.key==='e'||e.key==='E'){ e.preventDefault(); toggleWhy(); }
    return;
  }
  if(R.phase==='done'){
    /* deliberately no key starts another set: that is always a click */
    if(e.key==='Escape'){ e.preventDefault(); leave(); }
    return;
  }
  var q=view(); if(!q) return;

  /* The options are printed ক খ গ ঘ, but they are answered A-D or 1-4:
     nobody switches keyboard layout mid-question. */
  var idx=-1;
  if(/^[a-dA-D]$/.test(e.key)) idx='abcd'.indexOf(e.key.toLowerCase());
  else if(/^[1-4]$/.test(e.key)) idx=parseInt(e.key,10)-1;

  if(idx>=0 && idx<AB.options(q).length){
    if(R.fifty && R.fifty.indexOf(idx)>=0) return;
    e.preventDefault(); choose(idx); return;
  }
  if(e.key==='s'||e.key==='S'){ e.preventDefault(); skip(); }
}

/* ============================================================
   RENDER
   ============================================================ */
function render(){
  if(!R) return '<div class="empty">Nothing running.</div>';
  if(R.phase==='brief') return brief();
  if(R.phase==='done') return results();
  var q=view();
  if(!q) return results();

  var body = qmeta(q) + modeBar() + card(q) + after(q) + omr();
  /* an উদ্দীপক is a scenario two questions share: it stays on screen beside
     both of them, so nobody reads the same scenario twice. */
  if(q.passage){
    var p=AB.passage(q.passage);
    if(p){
      body='<div class="rcsplit"><div class="rcpassage" lang="bn"><span class="plbl">'+L('Stimulus (উদ্দীপক)','উদ্দীপক')+(p.note?' &middot; '+U.h(p.note):'')+'</span>'+p.text+'</div><div>'+body+'</div></div>';
    }
  }
  return fbar() + body + actions();
}

/* ---------- the slim bar on top ---------- */
function fbar(){
  var n=R.queue.length, at=Math.min(R.i+1, n), o='<div class="fbar">'+
    '<button class="x" type="button" onclick="RUN.leave()" aria-label="'+L('Leave the set','সেট থেকে বেরিয়ে যান')+'" title="'+L('Leave (what you did is kept)','বেরিয়ে যান (যা করেছেন তা জমা থাকবে)')+'">&times;</button>';
  var open = R.gm && (R.gm.ends || R.gm.lives);
  if(open){
    o+='<span class="cnt"><b>'+R.answered+'</b> '+L('answered','উত্তর')+'</span>';
    if(R.gm.lives) o+='<span class="hearts">'+hearts(R.gm.lives,3)+'</span>';
  } else {
    o+='<span class="cnt"><b>'+at+'</b> / '+n+'</span><span class="segs" aria-hidden="true">';
    for(var i=0;i<n;i++){
      var m=R.marks[i], cls='';
      if(m) cls = (R.exam ? 'ink' : (m.ok?'ok':'no')) + (i===R.marks.length-1 && R._fbFor!==R.i && R.phase==='feedback' ? ' new':'');
      else if(i===R.i) cls='now';
      o+='<i class="'+cls+'"'+(cls==='ink'?' style="background:var(--ink-3)"':'')+'></i>';
    }
    o+='</span>';
    if(R.mode==='boss') o+='<span class="hearts">'+hearts(R.gm.hearts,3)+'</span>';
  }
  o+='<span class="grow"></span>';
  var now=PLAN.track(R.track).minutes, cut=R.left0-now;
  if(cut>=0.5 && !R.exam) o+='<span class="delta" id="cutChip" title="'+L('Cut from your days left in this set','এই সেটে বাকি দিন থেকে যতটা কাটা গেল')+'">&minus;'+cutText(cut)+'</span>';
  o+='<span class="work desk-only" title="'+L('Work left, at the paper\'s own pace','বাকি কাজ, প্রশ্নপত্রের নিজের গতিতে')+'">'+U.mins(now)+' <small>'+L('left','বাকি')+'</small></span>';
  /* the timer switch lives in the top bar now, in reach on every screen */
  return o+'</div>';
}
function cutText(m){ return m<60 ? Math.round(m)+L(' min',' মিনিট') : U.mins(m); }
function hearts(n, of){
  var o='', i;
  for(i=0;i<of;i++) o+='<i class="'+(i<n?'':'gone')+'">&#9829;</i>';
  return o;
}
function toggleTimer(){
  var s=DB.state(); s.timer=!s.timer; DB.save();
  UI.toast(s.timer ? L('Timer on. Every answer is measured on the real paper\'s clock.','টাইমার চালু। প্রতিটি উত্তর আসল প্রশ্নপত্রের ঘড়িতে মাপা হবে।') : L('Timer off. Answers are now recorded as untimed.','টাইমার বন্ধ। এখন থেকে উত্তর সময়-ছাড়া হিসেবে জমা হবে।'));
  UI.paintChrome();
  UI.repaintView();
}

/* ---------- the brief ---------- */
function brief(){
  var t=R.track, mins=PLAN.track(t).minutes, days=PLAN.days(mins);
  var total=0, i;
  for(i=0;i<R.queue.length;i++) total+=AB.paceOf(R.queue[i]);
  var where = R.topic && ICE.topics[R.topic] ? ICE.sname(ICE.topics[R.topic].sec)
            : R.sec && ICE.sections[R.sec] ? ICE.sname(R.sec)
            : ({plan:L('Your path','আপনার পথ'), weak:L('Weakest chapters','সবচেয়ে দুর্বল অধ্যায়'), due:L('Due back today','আজ ফেরত এসেছে'), redo:L('Mistake bank','ভুলের ব্যাংক'), speed:L('Speed','গতি'),
                blitz:L('Against the clock','ঘড়ির সাথে পাল্লা'), survival:L('Survival','সারভাইভাল'), duel:L('Duel','দ্বৈরথ'), diag:L('Starting line','শুরুর রেখা'),
                qotd:L('Question of the day','আজকের প্রশ্ন')})[R.mode] || L('Practice','অনুশীলন');
  var title = R.topic && ICE.topics[R.topic] && R.mode!=='trick' ? ICE.tname(R.topic) : R.title;
  var b=briefFor(R, total, days);
  var o='<div class="fbar"><button class="x" type="button" onclick="RUN.leave()" aria-label="'+L('Back','ফিরে যান')+'">&times;</button>'+
    '<span class="cnt">'+L('Back','ফিরে যান')+'</span><span class="grow"></span></div>'+
    '<div class="brief"><span class="kicker">'+L('HSC','এইচএসসি')+' &middot; '+U.h(where)+'</span>'+
    '<h1>'+U.h(title)+'</h1>'+
    '<div class="grid3 stagger">'+b.boxes.map(function(x){
      return '<div class="stat"><div class="label">'+x[0]+'</div><div class="v">'+x[1]+'</div><div class="s">'+x[2]+'</div></div>';
    }).join('')+'</div>'+
    '<p class="rules">'+b.rules+'</p>'+
    '<div class="btns two"><button class="btn" type="button" onclick="RUN.begin()">'+L('Start','শুরু')+' <kbd>space</kbd></button>'+
    '<button class="btn ghost" type="button" data-go="practice">'+L('Change set','সেট বদলান')+'</button></div></div>';
  return o;
}
function briefFor(R, total, days){
  var n=R.queue.length, d=(days<10?U.round(days,1):Math.round(days));
  var fresh=R.queue.filter(function(q){ return AB.untouched(q); }).length;
  var dl=[L('Days left','বাকি দিন'), String(d), L('drops with every right answer','প্রতিটি ঠিক উত্তরে কমে')];
  var qs=[L('Questions','প্রশ্ন'), String(n), (R.mode==='plan'||R.mode==='adaptive')&&fresh ? L(fresh+' of them new',n+'টির '+fresh+'টি নতুন') : L('at board level','বোর্ডের মানে')];
  var tm=[L('Time','সময়'), U.secs(total), L('the paper\'s own clock','প্রশ্নপত্রের নিজের ঘড়ি')];
  switch(R.mode){
    case 'blitz': return {boxes:[[L('Time','সময়'),'1:00',L('one clock for the whole set','পুরো সেটে একটিই ঘড়ি')],[L('Questions','প্রশ্ন'),L('as many as you can','যত পারেন'),L('no fixed number','সংখ্যা বাঁধা নেই')],dl],
      rules:L('Sixty seconds on one clock. Answer and the next question arrives by itself, so do not stop.','একটিই ঘড়িতে ষাট সেকেন্ড। উত্তর দিলেই পরের প্রশ্ন নিজে এসে যায়, তাই থামবেন না।')};
    case 'survival': return {boxes:[[L('Lives','জীবন'),'3',L('three misses and it ends','তিনটি ভুলে শেষ')],[L('Questions','প্রশ্ন'),L('as many as you can','যত পারেন'),L('harder as you go','যত এগোবেন তত কঠিন')],dl],
      rules:L('Runs until your third wrong answer, and every question moves on by itself.','তৃতীয় ভুল উত্তর পর্যন্ত চলে, আর প্রতিটি প্রশ্ন নিজে থেকেই পরেরটিতে চলে যায়।')};
    case 'boss': return {boxes:[[L('Health','হেলথ'),'100',L('each right answer bites','প্রতিটি ঠিক উত্তরে কামড়')],[L('Hearts','হৃদয়'),'3',L('each miss costs one','প্রতিটি ভুলে একটি যায়')],qs],
      rules:L('Every right answer takes a bite out of the chapter\'s health &mdash; a bigger bite for a harder question. Lose three hearts and the chapter survives.','প্রতিটি ঠিক উত্তর অধ্যায়ের হেলথ থেকে এক কামড় নেয় &mdash; প্রশ্ন কঠিন হলে কামড় বড়। তিনটি হৃদয় হারালে অধ্যায়টি টিকে যায়।')};
    case 'ghost':
      var gh=R.gm&&R.gm.ghost;
      return {boxes:[qs,[L('To beat','হারাতে হবে'), gh?U.secs(gh.per):'&mdash;', gh?L('your best, per question','আপনার সেরা, প্রতি প্রশ্নে'):L('this run sets the time','এই দৌড়ই সময় ঠিক করবে')],tm],
        rules:L('Ten questions against your own best time in this chapter. The bar shows whether you are ahead.','এই অধ্যায়ে নিজের সেরা সময়ের সাথে দশটি প্রশ্ন। বারটি দেখায় আপনি এগিয়ে আছেন কি না।')};
    case 'mock': return {boxes:[qs,[L('Time','সময়'), ICE.sections[R.sec]?ICE.paperMinutes(R.sec)+':00':U.secs(total),L('the real paper\'s time','আসল পত্রের সময়')],[L('Checked','দেখা হবে'),L('at the end','শেষে'),L('no results before then','তার আগে কোনো ফল নয়')]],
      rules:L('The real mix, the real length, the real clock. Nothing is shown until the end &mdash; only the answer sheet fills up.','আসল মিশ্রণ, আসল দৈর্ঘ্য, আসল ঘড়ি। শেষ হওয়ার আগে কিছুই দেখানো হয় না &mdash; কেবল উত্তরপত্র ভরতে থাকে।')};
    case 'diag': return {boxes:[qs,tm,[L('Checked','দেখা হবে'),L('at the end','শেষে'),L('your starting line','আপনার শুরুর রেখা')]],
      rules:L('Real-standard questions from across the papers, checked together at the end.','সব পত্র থেকে আসল মানের প্রশ্ন, শেষে একসাথে দেখা হবে।')};
    case 'admission': return {boxes:[qs,tm,[L('For a miss','ভুলে'),'0',L('nothing is taken off','ভুলে কিছু কাটা যায় না')]],
      rules:L('The board\'s arithmetic: one mark per right answer, nothing off for a wrong one. So there is never a reason to leave one blank.','বোর্ডের হিসাব: প্রতিটি ঠিক উত্তরে এক নম্বর, ভুলে কিছুই কাটা যায় না। তাই খালি রাখার কোনো কারণ নেই।')};
    case 'skiptest': return {boxes:[qs,[L('Pass mark','পাস নম্বর'),L('4 of 5','৫-এ ৪'),L('then the chapter leaves the count','তাহলে অধ্যায়টি হিসাবের বাইরে')],tm],
      rules:L('The five hardest questions of this chapter. Get four right and the chapter leaves your days left.','এই অধ্যায়ের সবচেয়ে কঠিন পাঁচটি প্রশ্ন। চারটি ঠিক হলে অধ্যায়টি বাকি দিনের হিসাব থেকে বাদ যায়।')};
    case 'duel': return {boxes:[qs,[L('Code','কোড'), U.h(R.code||''), L('your friend gets the same ten','বন্ধুও একই দশটি পাবে')],tm],
      rules:L('Exactly the ten questions your friend will answer. Send them your result code afterwards.','আপনার বন্ধু যে দশটি প্রশ্নের উত্তর দেবে, ঠিক সেগুলোই। পরে নিজের ফলাফলের কোড পাঠিয়ে দিন।')};
    case 'weak': return {boxes:[qs,tm,dl], rules:L('Your lowest chapters first, the ones that weigh most in their paper first of all.','আগে আপনার সবচেয়ে নিচু অধ্যায়গুলো, পত্রে যার ওজন বেশি তাকে আগে।')};
    case 'due': return {boxes:[qs,tm,dl], rules:L('Questions you missed before, back on the day they were due. Get them right now and they are cleared.','আগে যেগুলো ভুল করেছিলেন, ফেরার দিনে ফিরে এসেছে। এখন ঠিক করলেই সেগুলো মুছে যায়।')};
    case 'redo': return {boxes:[qs,tm,dl], rules:L('Questions you missed and have not won back yet. Get one right on a later day and it is cleared.','যেগুলো ভুল করেছেন আর এখনও ফিরিয়ে আনেননি। পরের কোনো দিনে ঠিক করলেই একটি করে মিটে যায়।')};
    case 'speed': return {boxes:[qs,tm,dl], rules:L('Short, familiar questions on the real clock. Here speed is the point.','ছোট, হাতের কাছের প্রশ্ন আসল ঘড়িতে। এখানে গতিটাই আসল কথা।')};
    case 'trick': return {boxes:[qs,tm,dl], rules:L('Every question here is fastest with this one card.','এখানের প্রতিটি প্রশ্নই এই একটি কার্ড দিয়ে সবচেয়ে দ্রুত হয়।')};
  }
  return {boxes:[qs,tm,dl], rules:L('A question is done when you get it right inside the paper\'s time, and each one comes straight off your days left. While you still have unseen questions, at least '+AB.newShare(n)+' of these '+n+' are new.',
    'একটি প্রশ্ন শেষ হয় তখনই, যখন প্রশ্নপত্রের বাঁধা সময়ের ভিতরে সেটি ঠিক করেন, আর প্রতিটি এমন উত্তর সোজা আপনার বাকি দিন থেকে কাটা যায়। না-দেখা প্রশ্ন থাকলে এই '+n+'টির অন্তত '+AB.newShare(n)+'টি নতুন।')};
}

/* ---------- the line above the question ---------- */
function qmeta(q){
  var top=ICE.topics[q.topic], o='<div class="qmeta"><span class="l"><span class="qtopic">'+U.h(top?ICE.tname(top):q.topic)+'</span>';
  if(!R.exam){
    var t=GAME.tierOf(q.b);
    o+='<span class="tier '+t.cls+'">'+t.name+'</span>';
    if(R.golden && R.phase==='ask') o+='<span class="tag gold">'+L('Golden &times;5','সোনালি &times;৫')+'</span>';
    if(GAME.doubleNow() && R.phase==='ask') o+='<span class="tag gold">'+L('Double XP','দ্বিগুণ XP')+'</span>';
    if(R.combo>=3) o+='<span class="tag combo" id="comboTag">'+L('Streak','পরপর')+' &times;'+R.combo+'</span>';
  }
  if(R.mode==='admission') o+='<span class="tag">'+U.round(R.gm.score,2)+L(' marks',' নম্বর')+'</span>';
  o+='</span>';
  if(R.gm && R.gm.ends) o+='<span class="qtime" id="modeClock">time <b>'+U.secs(MODES.timeLeft(R))+'</b></span>';
  else if(timerOn() && R.phase==='ask') o+='<span class="qtime" id="qTimer">time <b>'+U.secs(AB.paceOf(q))+'</b></span>';
  o+='</div>';
  o+='<div class="pace"><i id="paceFill" style="width:'+(R.phase==='ask'&&timerOn()?100:0)+'%"></i></div>';
  if(timerOn() && R.phase==='ask'){
    o+='<div class="alarm" id="alarmBar" hidden data-noadvance><span class="d"></span><span class="al">'+L('Time is up &mdash; in the real exam you would be on the next question by now.','সময় শেষ &mdash; আসল পরীক্ষায় এতক্ষণে পরের প্রশ্নে যেতে হতো।')+'</span>'+
       '<button type="button" class="btn xs ghost" onclick="RUN.stopAlarm()">'+L('Stop alarm','অ্যালার্ম বন্ধ')+'</button></div>';
  }
  return o;
}
function modeBar(){
  var g=R.gm; if(!g) return '';
  if(R.mode==='boss'){
    return '<div class="bossbar"><span class="label">'+U.h(ICE.tname(R.topic))+'</span>'+
           '<div class="hp"><i style="width:'+g.hp+'%"></i></div><span class="bn">'+g.hp+'</span></div>';
  }
  if(R.mode==='ghost'){
    var gs=MODES.ghostState(R);
    if(!gs) return '<div class="ghostbar">'+L('No earlier run to race. This run sets the time.','দৌড়ানোর মতো আগের কোনো রেকর্ড নেই। এই দৌড়টিই সময় ঠিক করবে।')+'</div>';
    var lead=gs.theirs-gs.mine;
    return '<div class="ghostbar '+(gs.ahead?'ahead':'behind')+'"><i style="width:'+U.clamp(50+lead*2,4,96)+'%"></i>'+
      '<span>'+(gs.ahead?L('Ahead of your best by ','নিজের সেরার চেয়ে এগিয়ে '):L('Behind your best by ','নিজের সেরার চেয়ে পিছিয়ে '))+U.secs(Math.abs(lead))+'</span></div>';
  }
  return '';
}

/* ---------- the question card ---------- */
function card(q){
  var fb = R.phase==='feedback';
  /* a new question slides in; a repaint of the same one stays still */
  var cls='';
  if(R.phase==='ask') cls = R._drawnQ!==R.i ? ' enter' : ' settled';
  else if(R.phase==='feedback') cls = R._fbFor===R.i ? ' settled' : '';
  var o='<div class="qcard'+cls+'" lang="'+(q._sec==='hsc/english1'?'en':'bn')+'">';
  if(q.pre) o+='<div class="qcpre">'+q.pre+'</div>';
  o+='<div class="qstem">'+q.stem+'</div>';
  /* a multiple-completion item prints its three statements, then asks
     which combination holds. The four options never move.
     Once it is marked, the true statements are ticked: the whole point of
     the type is which of the three hold, and a letter alone does not say. */
  if(q.type==='mcomp' && q.sts){
    var truth = fb ? (ICE.MCOMP_SETS[q.ans]||[]) : null;
    o+='<ol class="stlist'+(fb?' marked':'')+'">';
    for(var si=0;si<q.sts.length;si++){
      var isTrue = truth && truth.indexOf(si)>=0;
      o+='<li'+(fb?(isTrue?' class="yes"':' class="no"'):'')+'><b>'+['i','ii','iii'][si]+'.</b>'+
         '<span>'+q.sts[si]+'</span>'+
         (fb?'<i class="stm">'+(isTrue?L('true','সঠিক'):L('not true','সঠিক নয়'))+'</i>':'')+'</li>';
    }
    o+='</ol><div class="stask">'+(q.ask||ICE.MCOMP_ASK)+'</div>';
  }
  o+=optBody(q, fb);
  if(!fb) o+=help(q);
  return o+'</div>';
}
function optBody(q, fb){
  var opts=AB.options(q), o='', i, k=0;
  for(i=0;i<opts.length;i++){
    var isRight = q.ans===i, isPicked = R.resp===i;
    if(R.fifty && R.fifty.indexOf(i)>=0 && !fb) continue;
    var cls='opt', mark='';
    if(fb){
      if(isRight){ cls+=' right'; mark='<span class="opt-mark">'+(isPicked?L('Right','ঠিক'):L('Correct answer','সঠিক উত্তর'))+'</span>'+
        (isPicked?'<svg class="tick" viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9"/></svg>':''); }
      else if(isPicked){ cls+=' wrong'; mark='<span class="opt-mark">'+L('Your answer','আপনার উত্তর')+'</span>'; }
      else cls+=' faded';
    } else if(isPicked) cls+=' picked';
    o+='<button type="button" class="'+cls+'" style="--i:'+(k++)+'"'+(fb?' disabled':'')+' onclick="RUN.choose('+i+')">'+
       '<span class="key">'+U.letter(i)+'</span>'+
       '<span class="txt">'+opts[i]+'</span>'+mark+'</button>';
  }
  return o;
}
/* the quiet row under the options: calling your shot, lifelines, keys */
function help(q){
  var g=DB.game(), o='';
  if(DB.state().settings.confidence && !R.exam){
    if(R.sure===null){
      o+='<div class="bet" data-noadvance><span>'+L('Before you answer &mdash;','উত্তর দেওয়ার আগে &mdash;')+'</span>'+
        '<button type="button" class="btn xs" onclick="RUN.bet(true)">'+L('I am sure','আমি নিশ্চিত')+'</button>'+
        '<button type="button" class="btn xs ghost" onclick="RUN.bet(false)">'+L('I am guessing','আন্দাজ করছি')+'</button></div>';
    } else {
      o+='<div class="bet" data-noadvance><span class="tag'+(R.sure?' combo':'')+'">'+(R.sure?L('Called it','আগেই বলেছিলেন'):L('Guessing','আন্দাজ'))+'</span></div>';
    }
  }
  if(R.exam) return o+'<div class="qhelp"><span class="hint desk-only">'+L('A&ndash;D answer &middot; S skip','A&ndash;D উত্তর &middot; S বাদ')+'</span></div>';
  var canFifty = !R.fifty;
  var tk=q.trick && AB.trick(q.trick);
  o+='<div class="qhelp" data-noadvance>';
  if(canFifty) o+='<button type="button" class="life" onclick="RUN.useFifty()"'+(g.lifelines.fifty>0?'':' disabled')+
    ' title="'+L('Removes all but one wrong option','একটি ভুল অপশন ছাড়া বাকিগুলো সরিয়ে দেয়')+'">50:50<i>'+g.lifelines.fifty+'</i></button>';
  if(tk && !R.hinted) o+='<button type="button" class="life" onclick="RUN.useTrick()"'+(g.lifelines.trick>0?'':' disabled')+
    ' title="'+L('Shows this question\'s card','এই প্রশ্নের কার্ডটি দেখায়')+'">'+L('Show the card','কার্ড দেখুন')+'<i>'+g.lifelines.trick+'</i></button>';
  o+='<span class="grow"></span><span class="hint">'+L('A&ndash;D answer &middot; S skip','A&ndash;D উত্তর &middot; S বাদ')+'</span></div>';
  if(R.hinted && tk) o+='<div class="hintbox"><span class="k">'+U.h(tk.name)+'</span>'+(tk.one||'')+'</div>';
  return o;
}

/* ---------- after answering: one line, what it paid, the explanation ---------- */
function after(q){
  if(R.phase!=='feedback') return '';
  var ok=R.result.ok, slow=R.result.slow;
  var o='<div class="vrow"><span class="v '+(ok?'good':'bad')+'">'+(ok?L('Right','ঠিক'):L('Not right','হয়নি'))+
    '<span>'+(ok ? (slow?L('but outside the paper\'s time','তবে প্রশ্নপত্রের বাঁধা সময়ের বাইরে'):'') : L('answer ','উত্তর ')+shortAnswer(q))+'</span></span>'+
    '<span class="t">'+U.secs(R.result.secs)+(timerOn()?' / '+U.secs(AB.paceOf(q)):'')+'</span></div>';
  if(R.pts && !R.exam){
    if(R.pts.xp>0){
      var bits=R.pts.parts.map(function(x){ return x.v===null?x.k:x.k+' +'+x.v; });
      o+='<div class="xpline"><b>+'+R.pts.xp+' XP</b>'+bits.join(' &middot; ')+(R.pts.coins?'<span class="coins"><svg class="ci" viewBox="0 0 32 32"><use href="#coinSym"/></svg>+'+R.pts.coins+L(' coins',' কয়েন')+'</span>':'')+'</div>';
    } else if(R.pts.xp<0){
      o+='<div class="xpline"><b class="neg">'+R.pts.xp+' XP</b>'+L('you said you were sure','আপনি বলেছিলেন নিশ্চিত')+'</div>';
    }
  }
  if(!ok && R._redeemAt===R.i) o+='<div class="redeem">'+L('The next question is the same idea, one step easier.','পরের প্রশ্নটি একই বিষয়, এক ধাপ সহজ।')+'</div>';
  if(R.showWhy) o+=explanation(q);
  return '<div class="'+(R._fbFor===R.i?'settled':'')+'">'+o+'</div>';
}
function actions(){
  if(R.phase!=='feedback') return '';
  var last = R.i+1>=R.queue.length;
  return '<div class="actions'+(R._fbFor===R.i?' settled':'')+'">'+
    '<button type="button" class="btn" onclick="RUN.next()">'+(R.ended||last?L('See the result','ফলাফল দেখুন'):L('Next question','পরের প্রশ্ন'))+'</button>'+
    '<button type="button" class="btn ghost" onclick="RUN.toggleWhy()">'+(R.showWhy?L('Hide explanation','ব্যাখ্যা লুকান'):L('Explanation','ব্যাখ্যা'))+'</button></div>';
}
function shortAnswer(q){ return '<b>'+U.letter(q.ans)+'</b>'; }
function explanation(q){
  var ok=R.result.ok;
  var o='<div class="whybox" id="whyBox"><div class="wa" lang="bn"><span class="label">'+L('Correct answer','সঠিক উত্তর')+'</span>'+AB.answerText(q)+'</div>';
  if(!ok){ var mine=whyMine(q); if(mine) o+='<p><b>'+L('Your choice:','আপনার পছন্দ:')+'</b> <span lang="bn">'+mine+'</span></p>'; }
  var theirs=whyRight(q);
  if(theirs) o+='<p><b>'+L('Why it is right:','কেন এটিই ঠিক:')+'</b> <span lang="bn">'+theirs+'</span></p>';
  if(q.fast){
    var tr = q.trick && AB.trick(q.trick);
    o+='<div class="fastbox"><span class="k">'+L('The fast route','মনে রাখার সহজ পথ')+'</span><div lang="bn">'+q.fast+'</div>'+
       (tr?'<a href="#/trick" data-go="trick" data-p="'+U.h(tr.id)+'">'+U.h(tr.name)+' &rsaquo;</a>':'')+'</div>';
  }
  o+='<div class="flagrow"><a href="#" onclick="RUN.flag();return false">'+L('Something wrong with this question?','প্রশ্নটিতে কিছু ভুল আছে?')+'</a>'+
     '<span class="small">'+L('15 coins for flagging one','একটি চিহ্নিত করলে ১৫টি কয়েন')+'</span></div>';
  return o+'</div>';
}
function whyMine(q){
  var w=q.why; if(!w) return '';
  return w[R.resp]||'';
}
function trimLead(s){
  return String(s||'').replace(/^\s*(ঠিক|সঠিক|হ্যাঁ|right|correct|yes|this is (?:the )?(?:right|correct))[\s:,।.—–-]*/i,'')
                      .replace(/^(&mdash;|&ndash;)\s*/,'')
                      .replace(/^./, function(c){ return c.toUpperCase(); });
}
function whyRight(q){
  var w=q.why; if(!w) return '';
  return trimLead(w[q.ans]||'');
}

/* The answer sheet. In a mock or a marathon nothing is marked until the
   end, so the only feedback is the sheet filling up — which is exactly
   what the real hall gives you. */
function omr(){
  if(!R.exam) return '';
  var o='<div class="omr" data-noadvance><span class="label">'+L('Answer sheet &middot; '+R.marks.length+' of '+R.queue.length+' marked','উত্তরপত্র &middot; '+R.queue.length+'-এ '+R.marks.length+'টি দাগানো')+'</span><div class="osheet">';
  for(var i=0;i<R.queue.length;i++){
    var m=R.marks[i];
    o+='<div class="orow'+(i===R.i?' now':'')+'"><b>'+(i+1)+'</b>';
    for(var j=0;j<ICE.OPTS;j++){
      o+='<i class="obub'+(m && m.resp===j?' on':'')+'">'+U.letter(j)+'</i>';
    }
    o+='</div>';
  }
  return o+'</div></div>';
}

/* ============================================================
   RESULTS — what happened, what it paid, and a choice
   ============================================================ */
function results(){
  var n=R.marks.length, right=R.right, pctv=n?right/n:0;
  var med=R.times.length?U.median(R.times):0;
  var totalPace=0, i;
  for(i=0;i<R.marks.length;i++) totalPace+=AB.paceOf(R.marks[i].q);
  var avgPace=n?totalPace/n:60;
  var wrong=R.marks.filter(function(m){ return !m.ok; });
  var cut=Math.max(0, R.left0-(R.leftEnd!==undefined?R.leftEnd:PLAN.track(R.track).minutes));
  var LV=GAME.level();
  var backLabel={today:L('Start','শুরু'), home:L('Start','শুরু'), practice:L('Practice','অনুশীলন'), track:L('Practice','অনুশীলন'), topic:L('the chapter','অধ্যায়'), section:L('the paper','পত্র'),
    mock:L('Full paper','পূর্ণ পত্র'), quests:L('Quests','কোয়েস্ট'), trick:L('the card','কার্ড'), social:L('Duels','দ্বৈরথ'), map:L('the map','ম্যাপ')}[R.back]||L('Practice','অনুশীলন');

  var o='<div class="fbar"><button class="x" type="button" onclick="RUN.leave()" aria-label="'+L('Close','বন্ধ করুন')+'">&times;</button>'+
    '<span class="cnt">'+U.h(R.title)+' &middot; '+L('done','শেষ')+'</span><span class="grow"></span></div>';
  o+='<div class="res stagger">';
  o+='<div><span class="kicker">'+L('HSC','এইচএসসি')+' &middot; '+U.h(R.title)+'</span>'+
     '<div class="score" style="margin-top:12px"><b data-count="'+right+'">'+right+'</b><span>/ '+n+'</span>'+
     (R.topic?'<span style="margin-left:auto;padding-bottom:10px">'+UI.starMarks(GAME.stars(R.topic).n, true)+'</span>':'')+'</div></div>';
  o+='<p class="verdict">'+verdictLine(pctv, med, avgPace)+(cut>=1?L(' <b style="color:var(--ink)">'+U.mins(cut)+'</b> came off your work left.',' বাকি কাজ থেকে <b style="color:var(--ink)">'+U.mins(cut)+'</b> কাটা গেল।'):'')+'</p>';
  o+=modeResult();
  if(!R.exam || R.mode==='diag'){
    o+='<div class="card xpcard"><div><div class="label">'+L('This set paid','এই সেটে পেলেন')+'</div><div class="xpv"><span data-count="'+R.xp+'">'+R.xp+'</span> <small>XP</small>'+
       (R.coins?' &nbsp;<span class="coinv"><svg class="ci" viewBox="0 0 32 32"><use href="#coinSym"/></svg><span data-count="'+R.coins+'">'+R.coins+'</span> <small>'+L('coins','কয়েন')+'</small></span>':'')+'</div></div>'+
       '<div class="lvl"><div class="spread"><span class="label">'+L('Level ','লেভেল ')+LV.level+'</span><span class="small mono">'+LV.into+' / '+LV.need+'</span></div>'+
       '<div class="bar" style="margin-top:6px"><i style="width:'+Math.max(1,U.round(100*LV.into/LV.need,1))+'%"></i></div>'+
       (R.goldHit?'<div class="small" style="margin-top:6px;color:var(--gold)">'+L(R.goldHit+' golden question(s) caught.',R.goldHit+'টি সোনালি প্রশ্ন ধরে ফেলেছেন।')+'</div>':'')+
       (DB.game().chests?'<div class="small" style="margin-top:6px">'+L(DB.game().chests+' chest(s) waiting in your record.','আপনার রেকর্ডে '+DB.game().chests+'টি সিন্দুক অপেক্ষা করছে।')+'</div>':'')+
       '</div></div>';
  }
  var againN = R.mode==='plan'||R.mode==='adaptive'||R.mode==='weak'||R.mode==='speed' ? DB.state().settings.setSize : R.queue.length;
  var canAgain = ['qotd','diag','skiptest','duel'].indexOf(R.mode)<0;
  var homeBack = R.back==='today'||R.back==='home';
  if(canAgain){
    o+='<div class="btns two"><button class="btn" type="button" onclick="RUN.again()">'+(R.gm&&(R.gm.ends||R.gm.lives)?L('Another round','আরেক দফা'):L(againN+' more','আরও '+againN+'টি'))+'</button>'+
       '<button class="btn ghost" type="button" onclick="RUN.leave()">'+L('Back to '+backLabel,backLabel+'-এ ফিরুন')+'</button></div>';
  } else {
    o+='<div class="btns two"><button class="btn" type="button" data-go="today">'+(R.mode==='diag'?L('See your plan','আপনার পরিকল্পনা দেখুন'):L('Back to Start','শুরুর পাতায় ফিরুন'))+'</button>'+
       (homeBack?'':'<button class="btn ghost" type="button" onclick="RUN.leave()">'+L('Back to '+backLabel,backLabel+'-এ ফিরুন')+'</button>')+'</div>';
  }

  /* the rest, folded */
  var d='<div class="grid2" style="margin-bottom:16px">'+
    UI.stat(L('Median time','মধ্যক সময়'), U.secs(med), L('allowed ','বাঁধা সময় ')+U.secs(avgPace))+
    UI.stat(L('Over time','সময়ের বেশি'), String(R.slow), R.slow?L('went past the clock','ঘড়ি ছাড়িয়ে গেছে'):L('not one','একটিও নয়'))+'</div>';
  var rows=[];
  for(var k in R.perTopic){
    var p=R.perTopic[k], tp=ICE.topics[k];
    rows.push({k:tp?ICE.tname(tp):k, v:p.c/p.n, t:p.c+'/'+p.n});
  }
  rows.sort(function(a,b){ return a.v-b.v; });
  if(rows.length>1){
    d+='<div class="label" style="margin:6px 0 4px">'+L('By chapter','অধ্যায় অনুযায়ী')+'</div>';
    rows.forEach(function(r){
      d+='<div style="display:grid;grid-template-columns:minmax(0,1fr) 110px 44px;gap:12px;align-items:center;padding:6px 0">'+
        '<span class="ui" style="font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+U.h(r.k)+'</span>'+
        '<span class="bar thin"><i class="'+(r.v>=0.75?'ok':r.v<0.5?'no':'')+'" style="width:'+Math.max(3,Math.round(r.v*100))+'%"></i></span>'+
        '<span class="mono small" style="text-align:right">'+r.t+'</span></div>';
    });
  }
  if(wrong.length){
    d+='<div class="label" style="margin:16px 0 4px">'+L('The '+wrong.length+' you missed','যে '+wrong.length+'টি ভুল হলো')+'</div><div class="missed">';
    wrong.forEach(function(m){
      var q=m.v||m.q;
      d+='<details><summary>'+U.h(ICE.topics[q.topic]?ICE.tname(q.topic):'')+' &middot; '+U.secs(m.secs)+(m.skipped?' &middot; '+L('skipped','বাদ দেওয়া'):'')+'</summary><div class="mbody" lang="bn">'+
        '<div style="margin-bottom:8px">'+(q.stem||'')+'</div>'+
        (q.type==='mcomp'&&q.sts?'<ol class="stlist mini"><li><b>i.</b><span>'+q.sts[0]+'</span></li>'+
          '<li><b>ii.</b><span>'+q.sts[1]+'</span></li><li><b>iii.</b><span>'+q.sts[2]+'</span></li></ol>':'')+
        '<div style="font-weight:600;margin-bottom:8px">'+AB.answerText(q)+'</div>'+
        (q.fast?'<div class="fastbox"><span class="k">'+L('The fast route','মনে রাখার সহজ পথ')+'</span>'+q.fast+'</div>':'')+'</div></details>';
    });
    d+='</div><p class="small" style="margin-top:10px">'+L('Each one comes back on a later day. Get it right then and it counts as done.','প্রতিটি পরের কোনো দিনে ফিরে আসবে। সেদিন ঠিক করলেই সেটি শেষ বলে গোনা হবে।')+'</p>';
  }
  d+='<div class="btns" style="margin-top:16px">'+
     (wrong.length?'<button class="btn sm ghost" type="button" onclick="RUN.redoWrong()">'+L('The '+wrong.length+' wrong ones again','ভুল '+wrong.length+'টি আবার')+'</button>':'')+
     '<button class="btn sm ghost" type="button" onclick="RUN.shareSet()">'+L('Save as an image','ছবি হিসেবে রাখুন')+'</button></div>';
  o+='<details class="more"><summary>'+L('See the details','বিস্তারিত দেখুন')+'</summary><div class="inner">'+d+'</div></details>';
  o+='</div>';
  return o;
}
function verdictLine(p, med, pace){
  var speed = med<=pace*0.8 ? L('and quickly','আর তা দ্রুতই করেছেন')
            : med<=pace ? L('and inside the clock','আর ঘড়ির ভিতরেই থেকেছেন')
            : med<=pace*1.35 ? L('but running over the clock','তবে ঘড়ি ছাড়িয়ে যাচ্ছেন')
            : L('and the problem is speed, not accuracy','আর সমস্যা শুদ্ধতায় নয়, গতিতে');
  var acc = p>=0.9 ? L('Nearly all right','প্রায় সবগুলোই ঠিক') : p>=0.75 ? L('Mostly right','বেশির ভাগই ঠিক')
          : p>=0.55 ? L('A little over half right','অর্ধেকের কিছু বেশি ঠিক') : p>=0.35 ? L('Under half right','অর্ধেকের কম ঠিক') : L('Very few right','খুব কমই ঠিক');
  return acc+' &mdash; '+speed+L('.','।');
}
function modeResult(){
  var g=R.gm;
  function box(title, text, cls){ return '<div class="card'+(cls?' '+cls:'')+'"><h3 style="font-size:21px">'+title+'</h3>'+(text?'<p class="small" style="margin-top:6px;font-size:14px">'+text+'</p>':'')+'</div>'; }
  if(R.mode==='boss'){
    var won=R.ended&&R.ended.won;
    return box(won?L('The chapter is down.','অধ্যায়টি কুপোকাত।'):L('The chapter survived.','অধ্যায়টি টিকে গেল।'), won ? L('Three hundred XP, and '+(g.hearts===3?'not one heart lost.':g.hearts+' of three hearts left.'),'তিনশো XP, আর '+(g.hearts===3?'একটিও হৃদয় যায়নি।':'তিনটির মধ্যে '+g.hearts+'টি হৃদয় বাকি।'))
      : L(g.hp+'% health left. Come back with a sharper method, not more time.','হেলথ বাকি '+g.hp+'%। বেশি সময় নিয়ে নয়, ধারালো পদ্ধতি নিয়ে ফিরে আসুন।'), won?'accent':'');
  }
  if(R.mode==='survival') return box(L(R.answered+' before the third miss','তৃতীয় ভুলের আগে '+R.answered+'টি'), L('Best so far: ','এ পর্যন্ত সেরা: ')+(DB.game().records.survival?DB.game().records.survival.v:R.answered)+L('.','।'));
  if(R.mode==='blitz') return box(L(R.right+' right in sixty seconds','ষাট সেকেন্ডে '+R.right+'টি ঠিক'), L('Best so far: ','এ পর্যন্ত সেরা: ')+(DB.game().records.blitz?DB.game().records.blitz.v:R.right)+L('.','।'));
  if(R.mode==='ghost'){
    var gs=MODES.ghostState(R);
    return box(R.ghostWon?L('You beat your ghost.','নিজের ঘোস্টকে হারিয়েছেন।'):L('The ghost stayed ahead.','ঘোস্টই এগিয়ে থাকল।'), gs? U.secs(gs.mine)+L(' against ',' বনাম ')+U.secs(gs.theirs)+L('.','।') : L('From now on, this run\'s time is the one to beat.','এখন থেকে এই দৌড়ের সময়টাই হারাতে হবে।'), R.ghostWon?'accent':'');
  }
  if(R.mode==='admission') return box(U.round(g.score,2)+L(' marks',' নম্বর'), L(R.right+' right, '+(R.marks.length-R.right)+' wrong &mdash; nothing is taken off for a miss; this is exactly how the board adds up.',R.right+'টি ঠিক, '+(R.marks.length-R.right)+'টি ভুল &mdash; ভুলে কিছু কাটা যায় না, বোর্ড ঠিক এভাবেই যোগ করে।'));
  if(R.mode==='skiptest' && R.skipOut) return box(R.skipOut.pass?L('Pass &mdash; you can skip this chapter','পাস &mdash; এই অধ্যায়টি বাদ দিতে পারেন'):L('Not yet','এখনও নয়'),
    R.skipOut.pass ? L('It is out of your days left. Bring it back from the chapter page any time.','এটি আপনার বাকি দিনের হিসাব থেকে বাদ গেল। অধ্যায়ের পাতা থেকে যখন খুশি আবার ফেরাতে পারবেন।')
                   : L(R.skipOut.right+' of five. The bar is four. Nothing is wasted &mdash; those answers count.','পাঁচটির মধ্যে '+R.skipOut.right+'টি। বার হলো চারটি। কিছুই নষ্ট হয়নি &mdash; ওই উত্তরগুলো গোনা হয়েছে।'), R.skipOut.pass?'accent':'');
  if(R.mode==='diag' && R.diagOut){
    var rows=Object.keys(R.diagOut.by).map(function(k){ var b=R.diagOut.by[k]; return U.h(ICE.sname(k))+' '+b.c+'/'+b.n; }).join(' &middot; ');
    return box(L('This is your starting line','এটাই আপনার শুরুর রেখা'), L(R.diagOut.right+' of '+R.diagOut.n+' right. For that, '+R.diagOut.xp+' XP up front and a chest. ',R.diagOut.n+'টির মধ্যে '+R.diagOut.right+'টি ঠিক। এর জন্য আগেভাগে '+R.diagOut.xp+' XP আর একটি সিন্দুক। ')+rows, 'accent');
  }
  if(R.mode==='duel' && R.duelCode){
    return '<div class="card"><h3 style="font-size:21px">'+L('Your result code','আপনার ফলাফলের কোড')+'</h3><p class="codebox" style="margin:12px 0" data-noadvance>'+U.h(R.duelCode)+'</p>'+
      '<p class="small">'+L('Send it to whoever called the duel. Enter their code under Your record &rsaquo; Duels to see who won.','যে দ্বৈরথ ডেকেছে তাকে এটি পাঠিয়ে দিন। তার কোডটি আপনার রেকর্ড &rsaquo; দ্বৈরথ-এ বসালে কে জিতল দেখা যাবে।')+'</p></div>';
  }
  if(R.mode==='qotd') return box(R.right?L('You got it.','পেরেছেন।'):L('Not today.','আজ হলো না।'), R.right?L('Sixty XP and a chest. A new one tomorrow.','ষাট XP আর একটি সিন্দুক। কাল নতুন একটি।'):L('A new one tomorrow. The grid remembers which days you answered.','কাল নতুন একটি। কোন কোন দিন দিয়েছেন, গ্রিড মনে রাখে।'));
  if(R.ended && R.ended.reason) return box(U.h(R.ended.reason), '');
  return '';
}
function shareSet(){ SHARE.save(SHARE.setCard(R), 'drakkhak-set.png'); }

function again(){
  var o={track:R.track, sec:R.sec, topic:R.topic, mode:R.mode,
         n:(R.mode==='plan'||R.mode==='adaptive'||R.mode==='weak'||R.mode==='speed')?DB.state().settings.setSize:R.n0,
         title:R.title, back:R.back, backParam:R.backParam, exam:R.exam, noBrief:true};
  if(R.mode==='redo'){ return UI.revenge(); }
  if(R.mode==='due'){ return UI.reviewDue(); }
  if(R.mode==='trick'){ var tb=R.backParam; return PAGES.trickDrill(tb); }
  if(R.mode==='blitz'||R.mode==='survival'){ return MODES.start(R.mode, {track:R.track, back:R.back}); }
  if(R.mode==='boss'||R.mode==='ghost'){ return MODES.start(R.mode, {topic:R.topic}); }
  if(R.mode==='admission'){ return MODES.start('admission', {sec:R.sec}); }
  start(o);
}
function redoWrong(){
  var qs=R.marks.filter(function(m){ return !m.ok; }).map(function(m){ return m.q; });
  start({queue:qs, track:R.track, sec:R.sec, topic:R.topic, mode:'redo', noBrief:true,
         title:L('Second try','দ্বিতীয় চেষ্টা'), back:R.back, backParam:R.backParam});
}

/* ---------- after every paint ---------- */
function afterPaint(){
  if(!R) return;
  document.removeEventListener('keydown', onKey, true);
  document.addEventListener('keydown', onKey, true);

  if(R.gm && R.gm.ends && R.phase!=='done' && R.phase!=='brief'){
    clearModeTimer(); modeTick();
    modeT=setInterval(modeTick, 250);
  }
  if(R.phase==='done'){
    clearModeTimer();
    if(QUEST.breakDue()) UI.toast(L('Forty-five minutes. Stand up, look at something far away, come back in five minutes &mdash; the cheapest way to keep the accuracy you just earned.','পৌনে এক ঘণ্টা হলো। উঠে দাঁড়ান, দূরের কিছুতে চোখ রাখুন, পাঁচ মিনিট পরে ফিরুন &mdash; '+
      'এইমাত্র যে শুদ্ধতা অর্জন করলেন, সেটি ধরে রাখার সবচেয়ে সস্তা উপায় এটাই।'), 7000);
  }
  /* the cut chip pops when it grows */
  var chip=document.getElementById('cutChip');
  if(chip){
    var key=chip.textContent;
    if(R._cutShown!==key){ R._cutShown=key; FX.pop(chip); }
  }
  var combo=document.getElementById('comboTag');
  if(combo && R._comboShown!==R.combo && R.phase==='feedback'){ R._comboShown=R.combo; FX.pop(combo); }
  if(R.phase==='feedback') R._fbFor=R.i;

  if(R.phase==='ask'){
    if(!R.askedAt || R._askedFor!==R.i){ R.askedAt=Date.now(); R._askedFor=R.i; }
    R._drawnQ=R.i;
      clearTimers();
    if(timerOn()){
      tick(); tickT=setInterval(tick, 500);
      if(R.alarmed && !R.alarmOff && FX.alarmOn()) showAlarm(true);
    }
  }
}

return {start:start, begin:begin, leave:leave, stop:stop, render:render, afterPaint:afterPaint, active:active,
        choose:choose, submit:submit, next:next, skip:skip,
        again:again, redoWrong:redoWrong, current:current, view:view, setResp:setResp,
        toggleWhy:toggleWhy, stopAlarm:stopAlarm, toggleTimer:toggleTimer,
        bet:bet, useFifty:useFifty, useTrick:useTrick, flag:flag, shareSet:shareSet,
        endRun:endRun, state:function(){ return R; }};
})();
