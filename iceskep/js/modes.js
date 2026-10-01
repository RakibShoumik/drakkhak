/* ===========================================================
   MODES — how a set is put together.

   Five ways in, all over the scope Practice is pointed at (every
   subject, one subject, or one chapter):

     set       an ordinary set. New ground first: while any question in
               scope is unseen, 13 of the 16 are new.
     mistakes  the mistake bank: questions whose latest answer was wrong.
     weak      the chapters with the lowest mastery, newest questions first.
     exam      one whole paper on board time, nothing marked until the end.
     blitz     sixty seconds, as many as you can.

   Start's "continue" is the ordinary set over everything, following
   the study path. A question never appears twice in one set.
   =========================================================== */
var MODES = (function(){

var setN=function(){ return PLAN.SET_N; };

function scope(){ return DB.state().scope; }
function setScope(sc){ DB.state().scope=sc; DB.save(); }

/* the test a chapter id must pass to be in scope */
function inScope(sc){
  sc=sc||scope();
  if(sc.kind==='subject'){
    var sj=ICE.subject(sc.sj), secs=sj?sj.secs:[];
    return function(tid){ var t=ICE.topics[tid]; return !!t && secs.indexOf(t.sec)>=0; };
  }
  if(sc.kind==='chapter') return function(tid){ return tid===sc.ch; };
  if(sc.kind==='paper') return function(tid){ var t=ICE.topics[tid]; return !!t && t.sec===sc.sec; };
  return function(){ return true; };
}
/* every written question in scope */
function pool(sc){
  var f=inScope(sc), out=[];
  for(var id in ICE.topics) if(f(id)) out=out.concat(AB.inTopic(id));
  return out;
}
function scopeLabel(sc){
  sc=sc||scope();
  if(sc.kind==='subject' && ICE.subject(sc.sj)) return ICE.subjname(sc.sj);
  if(sc.kind==='chapter' && ICE.topics[sc.ch]) return ICE.tname(sc.ch);
  if(sc.kind==='paper' && ICE.sections[sc.sec]) return ICE.sname(sc.sec);
  return L('All subjects mixed','সব বিষয় মিশিয়ে');
}
/* can a set be made from this scope? (a chapter not written yet cannot) */
function hasQuestions(sc){ return pool(sc).length>0; }

/* ---------- the builders ---------- */
function ordinary(sc){ return PLAN.nextSet(inScope(sc), setN()); }

function mistakeSet(sc){
  var f=inScope(sc);
  var list=AB.mistakes(function(q){ return f(q.topic); });
  list=U.shuffle(list, Date.now()%9973).slice(0, setN());
  return AB.regroupPassages(list);
}

/* the weakest chapters in scope, only those you have answered in */
function weakSet(sc){
  var f=inScope(sc), n=setN();
  var tops=Object.keys(ICE.topics).filter(function(id){ return f(id) && AB.inTopic(id).length && AB.seen(id)>0; });
  if(!tops.length) return [];
  tops.sort(function(a,b){ return AB.mastery(a).p-AB.mastery(b).p; });
  var weakest=tops.slice(0,3);
  var all=[]; weakest.forEach(function(id){ all=all.concat(AB.inTopic(id)); });
  var fresh=all.filter(AB.untouched), taken={}, out=[], q;
  var need=Math.min(AB.newShare(n), fresh.length);
  while(out.length<need){ q=AB.pickOne(fresh, taken, 0.55); if(!q) break; taken[q.id]=1; out.push(q); }
  var rest=all.filter(function(x){ return !AB.cleared(x.id); });
  while(out.length<n){ q=AB.pickOne(rest, taken, 0.55) || AB.pickOne(all, taken, 0.55); if(!q) break; taken[q.id]=1; out.push(q); }
  return AB.regroupPassages(AB.unique(out).slice(0,n));
}

/* A real paper is not tuned to you. Its mix follows each chapter's share
   of the paper, and difficulty is drawn from fixed bands (never a warm-up,
   about half at board level, the rest harder) whatever your record says. */
function examSet(secKey){
  var sec=ICE.sections[secKey];
  if(!sec) return [];
  var tops=ICE.topicsOf(secKey), taken={}, out=[], i;
  var all=AB.inSection(secKey);
  if(!all.length) return [];
  var want=Math.min(sec.n, all.length), totalW=0;
  tops.forEach(function(t){ if(AB.inTopic(t.id).length) totalW+=t.w; });
  function band(list, lo, hi){
    var c=list.filter(function(q){ var b=AB.itemB(q); return !taken[q.id] && b>=lo && b<hi; });
    return c.length ? c[AB.rand(c.length)] : null;
  }
  tops.forEach(function(t){
    var list=AB.inTopic(t.id);
    if(!list.length) return;
    var k=Math.round(want*t.w/totalW);
    for(var j=0;j<k;j++){
      var pk = j%2===0 ? (band(list, ICE.EXAM_B, ICE.HARD_B)||band(list, ICE.HARD_B, 9))
                       : (band(list, ICE.HARD_B, 9)||band(list, ICE.EXAM_B, ICE.HARD_B));
      if(!pk) pk=band(list, -9, 9);
      if(pk){ taken[pk.id]=1; out.push(pk); }
    }
  });
  while(out.length<want){
    var extra=band(all, ICE.EXAM_B, 9)||band(all, -9, 9);
    if(!extra) break;
    taken[extra.id]=1; out.push(extra);
  }
  return AB.regroupPassages(AB.unique(U.shuffle(out, Date.now()%9973)).slice(0,want));
}

/* sixty seconds: short, single-answer questions first */
function blitzSet(sc){
  var list=pool(sc);
  var fast=list.filter(function(q){ return q.type==='mc'; });
  if(fast.length<40) fast=list;
  return AB.unique(U.shuffle(fast, Date.now()%9973)).slice(0,120);
}

/* the daily five: the same five questions for everyone today, from across
   every written chapter, drawn by the date */
function dailySet(){
  var pool=ICE.Q.filter(function(q){ return !q.passage && AB.q(q.id); })
                .sort(function(a,b){ return a.id<b.id?-1:a.id>b.id?1:0; });
  if(!pool.length) return [];
  var r=DB.dayNum(DB.today())*7919+17, out=[], seen={};
  while(out.length<Math.min(5,pool.length)){
    r=(r*1103515245+12345)&0x7fffffff;
    var q=pool[r%pool.length];
    if(!seen[q.id]){ seen[q.id]=1; out.push(q); }
  }
  return out;
}
function dailyDone(){ return DB.state().daily.day===DB.today(); }

/* ---------- what each card can say ---------- */
function counts(sc){
  var f=inScope(sc);
  return {
    mistakes: AB.mistakes(function(q){ return f(q.topic); }).length,
    weak: Object.keys(ICE.topics).some(function(id){ return f(id) && AB.inTopic(id).length && AB.seen(id)>0; }),
    written: pool(sc).length
  };
}
/* the papers a scope covers, for the full-paper picker */
function papersIn(sc){
  sc=sc||scope();
  var keys=ICE.sectionsOf('hsc').map(function(s){ return 'hsc/'+s.id; });
  if(sc.kind==='subject' && ICE.subject(sc.sj)) keys=ICE.subject(sc.sj).secs.slice();
  if(sc.kind==='chapter' && ICE.topics[sc.ch]) keys=[ICE.topics[sc.ch].sec];
  return keys;
}

/* ---------- starting ---------- */
function start(kind, o){
  o=o||{};
  var sc=o.scope||scope(), queue=[], opt={back:o.back||'practice', scope:sc};
  switch(kind){
    case 'continue':
      queue=PLAN.nextSet(null, setN());
      opt.mode='set'; opt.title=L('Continue','চালিয়ে যাও'); opt.back='start';
      opt.again=function(){ start('continue'); };
      break;
    case 'set':
      queue=ordinary(sc);
      opt.mode='set'; opt.title=scopeLabel(sc);
      opt.again=function(){ start('set', {scope:sc, back:opt.back}); };
      break;
    case 'mistakes':
      queue=mistakeSet(sc);
      opt.mode='mistakes'; opt.title=L('Mistake bank','ভুলের খাতা');
      if(o.back) opt.back=o.back;
      opt.again=function(){ start('mistakes', {scope:sc, back:opt.back}); };
      break;
    case 'weak':
      queue=weakSet(sc);
      opt.mode='weak'; opt.title=L('Weak chapters','দুর্বল অধ্যায়');
      opt.again=function(){ start('weak', {scope:sc, back:opt.back}); };
      break;
    case 'exam':
      queue=examSet(o.sec);
      opt.mode='exam'; opt.exam=true; opt.sec=o.sec; opt.title=ICE.sname(o.sec);
      opt.again=function(){ start('exam', {sec:o.sec}); };
      break;
    case 'daily':
      if(dailyDone()){ UI.toast(L('Today\'s five are done. New ones tomorrow.','আজকের ৫টি শেষ। কাল নতুন ৫টি।')); return false; }
      queue=dailySet();
      opt.mode='daily'; opt.daily=true; opt.back='start'; opt.title=L('Today\'s five','আজকের ৫');
      opt.again=null;
      break;
    case 'blitz':
      queue=blitzSet(sc);
      opt.mode='blitz'; opt.blitz=true; opt.title=L('60-second challenge','৬০ সেকেন্ড চ্যালেঞ্জ');
      opt.again=function(){ start('blitz', {scope:sc, back:opt.back}); };
      break;
  }
  if(!queue.length){
    UI.toast(kind==='mistakes' ? L('The mistake bank is empty here.','এখানে ভুলের খাতা খালি।')
           : kind==='weak' ? L('Answer a few questions first, then the weak chapters show up.','আগে কিছু প্রশ্নের উত্তর দাও, তারপর দুর্বল অধ্যায় ধরা পড়বে।')
           : L('There are no questions here yet.','এখানে এখনও কোনো প্রশ্ন নেই।'));
    return false;
  }
  opt.queue=queue;
  RUN.start(opt);
  return true;
}

return {scope:scope, setScope:setScope, inScope:inScope, pool:pool, scopeLabel:scopeLabel,
        hasQuestions:hasQuestions, dailyDone:dailyDone, counts:counts, papersIn:papersIn, start:start};
})();
