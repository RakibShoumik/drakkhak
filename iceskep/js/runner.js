/* ===========================================================
   RUNNER — the question loop.

   The window belongs to the question: no sidebar, no tabs, a slim
   bar on top, and the coin box above it so a coin has somewhere to
   land. Answer, and within a quarter second the option lights green
   or shakes red with the right one marked. Then two buttons and
   nothing else: পরের প্রশ্ন and ব্যাখ্যা. Nothing moves on by
   itself (except the 60-second challenge, which has no time for
   that), and when a set ends the next one waits for a tap.

   Three kinds of run:
     set    every practice set (continue, scope, mistakes, weak chapters):
            one minute a question, three power-ups;
     exam   one whole paper on board time, nothing marked until the end,
            no power-ups;
     blitz  sixty seconds for as many as you can, no power-ups.
   =========================================================== */
var RUN = (function(){

var R=null;

/* ---------- lifecycle ---------- */
function start(o){
  stop();
  var queue=AB.unique(o.queue||[]);
  if(!queue.length){ UI.toast(L('There are no questions here yet.','এখানে এখনও কোনো প্রশ্ন নেই।')); return; }
  /* a first evening should end in a win: the first five answers anyone
     gives come from the gentle end of the draw */
  if(DB.state().answered<5 && o.mode==='set'){
    queue=AB.regroupPassages(queue.slice().sort(function(a,b){ return (a.b||0)-(b.b||0); }));
  }
  R={
    mode:o.mode, title:o.title||L('Practice','অনুশীলন'), back:o.back||'practice',
    exam:!!o.exam, blitz:!!o.blitz, sec:o.sec||null, again:o.again||null,
    queue:queue, i:0, phase:'ask',
    view:null, resp:null, result:null, showWhy:false,
    right:0, answered:0, marks:[], times:[], run:0,
    coins:0, pending:0, won:0, second:0, bonus:0,
    tags:[], newN:0, reviewN:0,
    askedAt:0, timer:null, paper:null, late:false,
    fifty:null, armed:false, retry:false, struck:null, first:null, wasBank:false,
    t0:Date.now(), secsUsed:0, ended:null, lastCoins:0, lastWon:false
  };
  queue.forEach(function(q){
    var k=AB.kind(q); R.tags.push(k);
    if(k==='new') R.newN++; else R.reviewN++;
  });
  if(R.exam){
    R.paper=CLOCK.timer({secs:queue.length*ICE.pace(R.sec), onTick:tickPaper, onEnd:function(){ if(R && R.phase!=='done') finish('time'); }});
  } else if(R.blitz){
    R.paper=CLOCK.timer({secs:60, onTick:tickPaper, onEnd:function(){ if(R && R.phase!=='done') finish('time'); }});
  }
  present();
  UI.go('run');
  FX.play('next');
}
function active(){ return !!R; }
function stop(){
  stopQ();
  if(R && R.paper){ R.paper.stop(); }
  document.removeEventListener('keydown', onKey, true);
  R=null;
}
function stopQ(){ if(R && R.timer){ R.timer.stop(); R.timer=null; } }

/* leave, keeping what was done. A full paper asks first, because leaving
   it drops the results. */
function leave(){
  if(!R) return;
  if(R.phase!=='done'){
    if(R.exam && R.answered>0 && !window.confirm(L('Leave the paper? Your results will not be shown.','পরীক্ষা ছেড়ে যাবে? ফল দেখানো হবে না।'))) return;
    payUnpaid(false);
  }
  var back=R.back;
  stop();
  UI.go(back);
}
/* coins are paid as you go, except in a full paper (paid at the end);
   leaving early writes what was earned into the wallet */
function payUnpaid(finished){
  var pay=R.pending;
  if(pay>0){ GAME.add(pay); R.pending=0; }
  if(R.coins>0 || R.bonus>0) GAME.note({k:'set', mode:R.mode, n:R.coins, right:R.right, won:R.won, set:R.bonus});
  R.coins=0;
  return finished;
}

function cur(){ return R && R.queue[R.i]; }
function present(){
  var q=cur();
  stopQ();
  R.view=AB.present(q);
  R.phase='ask'; R.resp=null; R.result=null; R.showWhy=false;
  R.fifty=null; R.armed=false; R.retry=false; R.struck=null; R.first=null; R.late=false;
  R.askedAt=Date.now();
  if(!R.exam && !R.blitz){
    R.timer=CLOCK.timer({secs:AB.paceOf(q), onTick:tickQ, onEnd:function(){
      if(!R || R.phase!=='ask' || R.retry) return;
      R.late=true; FX.play('alarm');
      var n=document.getElementById('lateNote'); if(n) n.hidden=false;
    }});
  }
}

/* ---------- clocks ---------- */
function tickQ(left){
  if(!R) return;
  var pace=AB.paceOf(cur()), box=document.getElementById('qTime'), fill=document.getElementById('qFill');
  if(box){
    box.textContent = left>=0 ? U.secs(left) : '+'+U.secs(-left);
    box.className='qtime'+(left<0?' over':left<pace*0.25?' warn':'');
  }
  if(fill){
    fill.style.width=U.clamp(100*left/pace,0,100)+'%';
    fill.className = left<0?'over':left<pace*0.25?'warn':'';
  }
  if(left>0){ var n=document.getElementById('lateNote'); if(n && !n.hidden) n.hidden=true; }
}
function tickPaper(left){
  var box=document.getElementById('paperTime');
  if(box){
    box.textContent=U.secs(Math.max(0,left));
    box.className='qtime'+(left<20?' over':left<60?' warn':'');
  }
  if(R && R.blitz && left<=3 && left>0 && !R._cd){ R._cd=1; FX.play('tick'); }
}

/* ---------- answering ---------- */
function choose(i){
  if(!R || R.phase!=='ask') return;
  if(R.fifty && R.fifty.indexOf(i)>=0) return;
  if(R.struck && R.struck.indexOf(i)>=0) return;
  if(R.retry) return retryAnswer(i);
  answer(i);
}
function answer(i){
  var orig=cur(), q=R.view;
  var secs=(Date.now()-R.askedAt)/1000;
  var late=!!(R.timer && R.timer.over());
  var ok=AB.check(q,i).ok;
  var wasBank=AB.inBank(orig.id);
  stopQ();
  AB.record(orig, {ok:ok, secs:secs, late:late});
  R.resp=i;

  /* the second chance: armed beforehand, spent only on a miss. The miss
     is already on record; the student answers the same question again. */
  if(!ok && R.armed && GAME.have('second')>0){
    GAME.use('second');
    R.retry=true; R.armed=false; R.struck=[i];
    R.first={i:i, secs:secs, late:late, wasBank:wasBank};
    FX.verdictWrong();
    UI.repaintView();
    return;
  }
  settle(ok, i, secs, late, wasBank, false);
}
function retryAnswer(j){
  var f=R.first, ok=(j===R.view.ans);
  R.resp=j;
  if(ok) R.second++;
  settle(false, j, f.secs, f.late, f.wasBank, true, ok);
}

/* one question is finished: tally it, pay it, and show or move on */
function settle(ok, i, secs, late, wasBank, viaSecond, secondOk){
  var orig=cur(), q=R.view;
  R.answered++; R.times.push(secs);
  R.marks.push({q:orig, v:q, ok:ok, secs:secs, resp:i, late:late, second:!!secondOk});
  R.run = ok ? R.run+1 : 0;
  if(ok) R.right++;

  var c=0, won=false;
  if(ok){
    c=GAME.PAY.right;
    if(wasBank){ c+=GAME.PAY.won; won=true; R.won++; DB.state().won++; }
  } else if(secondOk){
    c=GAME.PAY.right;                         /* a second-chance right pays like any right */
  }
  R.lastCoins=c; R.lastWon=won;
  if(c){
    R.coins+=c;
    if(R.exam) R.pending+=c; else GAME.add(c);
  }
  DB.save();

  R.result={ok:ok, late:late, secs:secs, second:!!viaSecond, secondOk:!!secondOk};

  if(R.exam){
    FX.play('tick');
    if(R.i+1>=R.queue.length) return finish();
    R.i++; present(); UI.repaintView();
    return;
  }
  R.phase='feedback'; R.showWhy=false;
  UI.repaintView();
  var shown = ok || secondOk;
  var optEl=document.querySelector(shown?'.opt.right':'.opt.wrong')||document.querySelector('.qcard');
  if(shown) FX.verdictCorrect(R.run||1); else FX.verdictWrong();
  if(shown && optEl) FX.burst(optEl, 12);
  if(c && !R.exam) payOut(optEl, c);
  if(R.blitz){
    var at=R.i;
    setTimeout(function(){ if(R && R.phase==='feedback' && R.i===at) next(); }, 420);
  }
}

/* the coins leave the answer and land in the coin box, which counts up */
function payOut(fromEl, c){
  var after=GAME.coins(), before=after-c, n=Math.min(9, Math.max(3, c*2));
  UI.holdChrome(before);
  FX.fly({from:fromEl, to:document.querySelector('#coinBox .fly-target'), count:n,
    onLand:function(i, last){
      var shown = last ? after : before+Math.ceil(c*(i+1)/n);
      UI.holdChrome(last ? null : shown);
    }});
  setTimeout(function(){ UI.holdChrome(null); }, 2600);      /* never leave the box frozen */
}

/* ---------- power-ups: practice sets only ---------- */
function pw(id){
  if(!R || R.exam || R.blitz || R.phase!=='ask' || R.retry) return;
  var p=GAME.power(id);
  if(GAME.have(id)<=0){
    UI.toast(L(GAME.pname(p)+' is finished. Buy more with coins: tap the coin box.', GAME.pname(p)+' শেষ। কয়েন দিয়ে কেনো: ওপরের কয়েন বাক্সে ট্যাপ করো।'));
    return;
  }
  if(id==='fifty'){
    if(R.fifty) return;
    var q=R.view, opts=AB.options(q), wrong=[], i;
    for(i=0;i<opts.length;i++) if(i!==q.ans) wrong.push(i);
    R.fifty=U.shuffle(wrong, Date.now()%997).slice(0,2);      /* two wrong options go */
    GAME.use('fifty'); FX.play('whoosh');
  } else if(id==='second'){
    R.armed=!R.armed;                                          /* spent only if you miss */
  } else if(id==='plus30'){
    if(!R.timer) return;
    GAME.use('plus30'); R.timer.add(30); R.late=false; FX.play('whoosh');
  }
  UI.repaintView();
}

/* ---------- moving on ---------- */
function next(){
  if(!R || R.phase==='done') return;
  R.i++;
  if(R.i>=R.queue.length) return finish();
  FX.play('next');
  present();
  UI.repaintView();
  window.scrollTo(0,0);
}
function skip(){
  if(!R || !R.exam || R.phase!=='ask') return;
  R.marks.push({q:cur(), v:R.view, ok:false, secs:(Date.now()-R.askedAt)/1000, resp:null, skipped:true});
  R.answered++;
  if(R.i+1>=R.queue.length) return finish();
  R.i++; present(); UI.repaintView();
}
function toggleWhy(){
  if(!R || R.phase!=='feedback' || R.blitz) return;
  R.showWhy=!R.showWhy;
  UI.repaintView();
  if(R.showWhy){ var w=document.getElementById('whyBox'); if(w && w.scrollIntoView) w.scrollIntoView({block:'nearest', behavior:'smooth'}); }
}

function finish(reason){
  if(!R || R.phase==='done') return;
  stopQ(); if(R.paper) R.paper.stop();
  R.phase='done'; R.ended=reason||null;
  R.secsUsed=Math.round((Date.now()-R.t0)/1000);
  var n=R.queue.length;
  /* finishing a set pays five; the 60-second challenge is not a set */
  if(!R.blitz){ R.bonus=GAME.PAY.set; R.coins+=R.bonus; GAME.add(R.bonus); }
  if(R.exam && R.pending){ GAME.add(R.pending); R.pending=0; }
  GAME.note({k:'set', mode:R.mode, n:R.coins, right:R.right, won:R.won, set:R.bonus});
  var s=DB.state();
  if(R.exam){
    var p=n?R.right/n:0;
    if(!(s.examBest[R.sec]>=p)) s.examBest[R.sec]=p;
  }
  DB.bump('sets'); DB.touchStreak(); DB.save();
  PLAN.invalidate();
  var got=STATS.check();
  FX.play('done');
  if(n && R.right/n>=0.8) FX.confetti(50);
  UI.repaintView();
  window.scrollTo(0,0);
  UI.badgeToast(got);
}

/* ---------- keyboard ---------- */
function onKey(e){
  if(!R || UI.sheetOpen()) return;
  var t=e.target;
  if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable)) return;
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  if(R.phase==='done'){ if(e.key==='Escape'){ e.preventDefault(); leave(); } return; }
  if(R.phase==='feedback'){
    if(e.key===' '||e.key==='Enter'||e.key==='ArrowRight'){ e.preventDefault(); next(); }
    else if(e.key==='e'||e.key==='E'){ e.preventDefault(); toggleWhy(); }
    return;
  }
  var q=R.view; if(!q) return;
  var idx=-1;
  if(/^[a-dA-D]$/.test(e.key)) idx='abcd'.indexOf(e.key.toLowerCase());
  else if(/^[1-4]$/.test(e.key)) idx=parseInt(e.key,10)-1;
  if(idx>=0 && idx<AB.options(q).length){ e.preventDefault(); choose(idx); return; }
  if(e.key==='s'||e.key==='S'){ e.preventDefault(); skip(); }
}

/* ============================================================
   RENDER
   ============================================================ */
function render(){
  if(!R) return '<div class="empty">'+L('Nothing running.','কিছু চলছে না।')+'</div>';
  if(R.phase==='done') return results();
  var q=R.view;
  var body=qmeta(q)+card(q)+help(q)+after(q);
  /* an উদ্দীপক is a scenario two questions share: it stays on screen
     beside both of them, so nobody reads the same scenario twice */
  if(q.passage){
    var p=AB.passage(q.passage);
    if(p) body='<div class="rcsplit"><div class="rcpassage" lang="bn"><span class="plbl">'+L('Stimulus','উদ্দীপক')+
      (p.note?' &middot; '+U.h(p.note):'')+'</span>'+p.text+'</div><div>'+body+'</div></div>';
  }
  return fbar()+body+actions();
}

function fbar(){
  var n=R.queue.length, o='<div class="fbar"><button class="x" type="button" onclick="RUN.leave()" aria-label="'+L('Leave','বেরিয়ে যাও')+'">&times;</button>';
  if(R.blitz){
    o+='<span class="cnt"><b>'+N(R.right)+'</b> '+L('right','ঠিক')+'</span><span class="grow"></span>'+
       '<span class="qtime big" id="paperTime">'+U.secs(R.paper?R.paper.left():60)+'</span>';
  } else {
    var at=Math.min(R.i+1, n);
    o+='<span class="cnt"><b>'+N(at)+'</b> / '+N(n)+'</span>';
    if(n<=40){
      o+='<span class="segs" aria-hidden="true">';
      for(var i=0;i<n;i++){
        var m=R.marks[i], cls='';
        if(m) cls = R.exam ? 'ink' : (m.ok||m.second?'ok':'no');
        else if(i===R.i) cls='now';
        o+='<i class="'+cls+'"></i>';
      }
      o+='</span>';
    }
    o+='<span class="grow"></span>';
    if(R.exam) o+='<span class="qtime big" id="paperTime">'+U.secs(R.paper?R.paper.left():0)+'</span>';
  }
  return o+'</div>';
}

/* the line above the question: its tag, its chapter, its clock */
var TAGS={
  'new':  {en:'New',      bn:'নতুন'},
  again:  {en:'Seen again', bn:'আবার দেখা'},
  check:  {en:'Check',    bn:'যাচাই'}
};
function qmeta(q){
  var k=R.tags[R.i], t=TAGS[k], top=ICE.topics[q.topic];
  var o='<div class="qmeta"><span class="qtag t-'+k+'">'+L(t.en,t.bn)+'</span><span class="qtopic">'+U.h(top?ICE.tname(top):q.topic)+'</span>';
  if(!R.exam && !R.blitz && R.phase==='ask' && !R.retry){
    o+='<span class="grow"></span><span class="qtime" id="qTime">'+U.secs(AB.paceOf(q))+'</span></div>'+
       '<div class="pace"><i id="qFill" style="width:100%"></i></div>'+
       '<div class="lateline" id="lateNote" '+(R.late?'':'hidden ')+'role="status">'+L('Time is up: a late answer does not count as done.','সময় শেষ: দেরির উত্তর "শেষ" গোনা হয় না।')+'</div>';
  } else o+='</div>';
  return o;
}

function card(q){
  var fb = R.phase==='feedback';
  var cls = R.phase==='ask' ? (R._drawn!==R.i ? ' enter' : ' settled') : ' settled';
  R._drawn=R.i;
  var o='<div class="qcard'+cls+'" lang="'+(q._sec==='hsc/english1'?'en':'bn')+'">';
  if(q.pre) o+='<div class="qcpre">'+q.pre+'</div>';
  o+='<div class="qstem">'+q.stem+'</div>';
  /* a multiple-completion item prints its three statements, then asks
     which combination holds. Once marked, the true statements are ticked. */
  if(q.type==='mcomp' && q.sts){
    var truth = fb ? (ICE.MCOMP_SETS[q.ans]||[]) : null;
    o+='<ol class="stlist'+(fb?' marked':'')+'">';
    for(var si=0;si<q.sts.length;si++){
      var isTrue = truth && truth.indexOf(si)>=0;
      o+='<li'+(fb?(isTrue?' class="yes"':' class="no"'):'')+'><b>'+['i','ii','iii'][si]+'.</b><span>'+q.sts[si]+'</span>'+
         (fb?'<i class="stm">'+(isTrue?L('true','সঠিক'):L('not true','সঠিক নয়'))+'</i>':'')+'</li>';
    }
    o+='</ol><div class="stask">'+(q.ask||ICE.MCOMP_ASK)+'</div>';
  }
  return o+optBody(q, fb)+'</div>';
}
function optBody(q, fb){
  var opts=AB.options(q), o='', i, k=0, struck=R.struck||[];
  if(R.retry && R.phase==='ask') o+='<div class="retryline">'+L('Second chance: answer again.','দ্বিতীয় সুযোগ: আবার উত্তর দাও।')+'</div>';
  for(i=0;i<opts.length;i++){
    var isRight=q.ans===i, isPicked=R.resp===i, wasFirst=struck.indexOf(i)>=0;
    if(R.fifty && R.fifty.indexOf(i)>=0 && !fb) continue;
    var cls='opt', mark='';
    if(fb){
      if(isRight){ cls+=' right'; mark='<span class="opt-mark">'+(isPicked?L('Right','ঠিক'):L('Correct answer','সঠিক উত্তর'))+'</span>'+
        (isPicked?'<svg class="tick" viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9"/></svg>':''); }
      else if(isPicked || wasFirst){ cls+=' wrong'; mark='<span class="opt-mark">'+L('Your answer','তোমার উত্তর')+'</span>'; }
      else cls+=' faded';
    } else if(R.retry && wasFirst) cls+=' struck';
    var dis = fb || (R.retry && wasFirst);
    o+='<button type="button" class="'+cls+'" style="--i:'+(k++)+'"'+(dis?' disabled':'')+' onclick="RUN.choose('+i+')">'+
       '<span class="key">'+U.letter(i)+'</span><span class="txt">'+opts[i]+'</span>'+mark+'</button>';
  }
  return o;
}

/* the power-ups, under the options: practice sets only */
function help(q){
  if(R.phase!=='ask' || R.exam || R.blitz) return '<div class="qhelp"><span class="hint desk-only">'+hintKeys()+'</span></div>';
  if(R.retry) return '';
  function b(id, label, extra){
    var n=GAME.have(id);
    return '<button type="button" class="pw'+(n<=0?' zero':'')+(extra?' '+extra:'')+'" onclick="RUN.pw(\''+id+'\')">'+label+'<i>'+N(n)+'</i></button>';
  }
  var fiftyOff=!!R.fifty, plusOff=!R.timer;
  return '<div class="powers">'+
    b('fifty', L('50:50','৫০:৫০'), fiftyOff?'used':'')+
    b('second', L('Second chance','দ্বিতীয় সুযোগ'), R.armed?'armed':'')+
    b('plus30', L('+30 sec','+৩০ সেকেন্ড'), plusOff?'used':'')+
    '</div>'+(R.armed?'<div class="armline">'+L('Second chance is on. It is used only if you miss.','দ্বিতীয় সুযোগ চালু। ভুল হলেই খরচ হবে।')+'</div>':'')+
    '<div class="qhelp"><span class="hint desk-only">'+hintKeys()+'</span></div>';
}
function hintKeys(){
  return R.exam ? L('A–D answer · S skip','A–D উত্তর · S বাদ দাও') : L('A–D answer','A–D উত্তর');
}

function after(q){
  if(R.phase!=='feedback' || R.blitz) return '';
  var r=R.result, good=r.ok||r.secondOk;
  var o='<div class="vrow"><span class="v '+(good?'good':'bad')+'">'+(good?L('Right','ঠিক'):L('Not right','হয়নি'))+
    '<span>'+(r.secondOk?L('on the second chance','দ্বিতীয় সুযোগে')
      : good ? (r.late?L('but late: not counted as done','তবে দেরিতে: "শেষ" গোনা হবে না'):'')
      : L('answer ','উত্তর ')+'<b>'+U.letter(q.ans)+'</b>')+'</span></span>'+
    '<span class="t">'+U.secs(r.secs)+' / '+U.secs(AB.paceOf(q))+'</span></div>';
  if(R.lastCoins){
    o+='<div class="coinline"><svg class="ci" viewBox="0 0 32 32"><use href="#coinSym"/></svg><b>+'+N(R.lastCoins)+'</b> '+L('coins','কয়েন')+
       (R.lastWon?' &middot; '+L('mistake won back (+2)','ভুল ফিরিয়ে আনলে (+২)'):'')+'</div>';
  }
  if(R.showWhy) o+=explanation(q);
  return o;
}
function actions(){
  if(R.phase==='ask'){
    if(R.exam) return '<div class="actions one"><button type="button" class="btn ghost" onclick="RUN.skip()">'+L('Skip','বাদ দাও')+'</button></div>';
    return '';
  }
  if(R.phase!=='feedback' || R.blitz) return '';
  var last=R.i+1>=R.queue.length;
  return '<div class="actions">'+
    '<button type="button" class="btn" onclick="RUN.next()">'+(last?L('See the result','ফলাফল দেখো'):L('Next question','পরের প্রশ্ন'))+'</button>'+
    '<button type="button" class="btn ghost" onclick="RUN.toggleWhy()">'+(R.showWhy?L('Hide explanation','ব্যাখ্যা লুকাও'):L('Explanation','ব্যাখ্যা'))+'</button></div>';
}

function trimLead(s){
  return String(s||'').replace(/^\s*(ঠিক|সঠিক|হ্যাঁ|right|correct|yes|this is (?:the )?(?:right|correct))[\s:,।.—–-]*/i,'')
                      .replace(/^(&mdash;|&ndash;)\s*/,'')
                      .replace(/^./, function(c){ return c.toUpperCase(); });
}
function explanation(q){
  var o='<div class="whybox" id="whyBox"><div class="wa" lang="bn"><span class="label">'+L('Correct answer','সঠিক উত্তর')+'</span>'+AB.answerText(q)+'</div>';
  var why=q.why||[];
  if(!R.result.ok && R.resp!==null && why[R.resp]) o+='<p><b>'+L('Your choice:','তোমার পছন্দ:')+'</b> <span lang="bn">'+why[R.resp]+'</span></p>';
  if(why[q.ans]) o+='<p><b>'+L('Why it is right:','কেন এটিই ঠিক:')+'</b> <span lang="bn">'+trimLead(why[q.ans])+'</span></p>';
  if(q.fast) o+='<div class="fastbox"><span class="k">'+L('Remember this','মনে রাখো')+'</span><div lang="bn">'+q.fast+'</div></div>';
  return o+'</div>';
}

/* ============================================================
   RESULTS — the score, what it paid, and one button
   ============================================================ */
function results(){
  var n=R.queue.length, right=R.right, pct=n?right/n:0;
  var missed=R.marks.filter(function(m){ return !m.ok; });
  var o='<div class="fbar"><button class="x" type="button" onclick="RUN.leave()" aria-label="'+L('Close','বন্ধ করো')+'">&times;</button>'+
    '<span class="cnt">'+U.h(R.title)+'</span><span class="grow"></span></div><div class="res">';
  o+='<div class="score"><b id="scoreNum">'+N(right)+'</b><span>/ '+N(R.blitz?R.answered:n)+'</span></div>';
  o+='<p class="verdict">'+verdict(pct)+'</p>';

  /* what it paid */
  o+='<div class="card paid"><div class="label">'+L('This set paid','এই সেটে পেলে')+'</div>'+
     '<div class="paidv"><svg class="ci" viewBox="0 0 32 32"><use href="#coinSym"/></svg><b>+'+N(R.coins)+'</b> <span>'+L('coins','কয়েন')+'</span></div>'+
     '<ul class="paidlist">'+
       '<li>'+L('Right answers','ঠিক উত্তর')+' <b>'+N(R.right)+'</b></li>'+
       (R.won?'<li>'+L('Mistakes won back','ভুল ফিরিয়ে আনা')+' <b>+'+N(R.won*GAME.PAY.won)+'</b></li>':'')+
       (R.bonus?'<li>'+L('Finishing the set','সেট শেষ করা')+' <b>+'+N(R.bonus)+'</b></li>':'')+
     '</ul></div>';

  /* new against review */
  if(!R.blitz){
    o+='<div class="card mix"><div><b>'+N(R.newN)+'</b><span>'+L('new','নতুন')+'</span></div>'+
       '<div><b>'+N(R.reviewN)+'</b><span>'+L('seen before','আগে দেখা')+'</span></div>'+
       (R.second?'<div><b>'+N(R.second)+'</b><span>'+L('second chances','দ্বিতীয় সুযোগ')+'</span></div>':'')+'</div>';
  }

  /* the one button */
  var setLike = !R.exam && !R.blitz;
  var more = setLike ? L('Another '+PLAN.SET_N, 'আরও '+N(PLAN.SET_N)+'টি')
           : R.exam ? L('Sit it again','আবার পরীক্ষা দাও') : L('Another round','আরেক দফা');
  o+='<div class="btns two"><button class="btn big" type="button" onclick="RUN.again()">'+more+'</button>'+
     '<button class="btn ghost" type="button" onclick="RUN.leave()">'+backLabel()+'</button></div>';

  /* what was missed, folded */
  if(missed.length){
    o+='<div class="label" style="margin:24px 0 6px">'+L('The '+missed.length+' you missed','যে '+N(missed.length)+'টি ভুল হলো')+'</div><div class="missed">';
    missed.forEach(function(m){
      var q=m.v||m.q;
      o+='<details><summary>'+U.h(ICE.topics[q.topic]?ICE.tname(q.topic):'')+(m.skipped?' &middot; '+L('skipped','বাদ দেওয়া'):'')+'</summary><div class="mbody" lang="bn">'+
        '<div style="margin-bottom:8px">'+(q.stem||'')+'</div>'+
        (q.type==='mcomp'&&q.sts?'<ol class="stlist mini">'+q.sts.map(function(s,i){ return '<li><b>'+['i','ii','iii'][i]+'.</b><span>'+s+'</span></li>'; }).join('')+'</ol>':'')+
        '<div style="font-weight:600;margin-bottom:8px">'+AB.answerText(q)+'</div>'+
        (q.fast?'<div class="fastbox"><span class="k">'+L('Remember this','মনে রাখো')+'</span>'+q.fast+'</div>':'')+'</div></details>';
    });
    o+='</div><p class="small" style="margin-top:10px">'+L('They are in the mistake bank now. Win them back from Start or Practice.','এগুলো এখন ভুলের খাতায়। শুরু বা অনুশীলন থেকে ফিরিয়ে আনো।')+'</p>';
  }
  return o+'</div>';
}
function backLabel(){
  return R.back==='start' ? L('Back to Start','শুরুতে ফিরে যাও')
       : R.back==='map' ? L('Back to the map','ম্যাপে ফিরে যাও')
       : L('Back to Practice','অনুশীলনে ফিরে যাও');
}
function verdict(p){
  if(R.ended==='time' && R.exam) return L('Time is up. The paper is marked.','সময় শেষ। খাতা দেখা হলো।');
  return p>=0.9 ? L('Nearly all right. Well done.','প্রায় সবগুলোই ঠিক। সাবাস।')
       : p>=0.75 ? L('Mostly right.','বেশির ভাগই ঠিক।')
       : p>=0.55 ? L('A little over half right.','অর্ধেকের কিছু বেশি ঠিক।')
       : p>=0.35 ? L('Under half right. The mistakes are where the marks are.','অর্ধেকের কম ঠিক। নম্বর লুকিয়ে আছে ভুলগুলোতেই।')
       : L('Few right this time. Go through the mistakes below.','এবার কমই ঠিক হয়েছে। নিচের ভুলগুলো দেখে নাও।');
}

function again(){
  if(!R || !R.again) return leave();
  var f=R.again;
  stop();
  f();
}

/* after every paint: listen for keys, draw the clocks */
function afterPaint(){
  if(!R) return;
  document.removeEventListener('keydown', onKey, true);
  document.addEventListener('keydown', onKey, true);
  var v=document.getElementById('view');
  if(v) v.classList.toggle('wide', !!document.querySelector('.rcsplit'));
  if(R.phase==='ask' && R.timer) tickQ(R.timer.left());
  if(R.paper) tickPaper(R.paper.left());
  if(R.phase==='done'){
    var el=document.getElementById('scoreNum');
    if(el && !R._counted){ R._counted=1; FX.countUp(el, R.right); }
  }
}

return {start:start, stop:stop, leave:leave, active:active, render:render, afterPaint:afterPaint,
        choose:choose, next:next, skip:skip, toggleWhy:toggleWhy, pw:pw, again:again,
        state:function(){ return R; }};
})();
