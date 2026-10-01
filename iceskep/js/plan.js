/* ===========================================================
   PLAN — everything there is to learn, in the order to learn it,
   and how much of it is left.

   The unit of progress is one question counted as DONE: answered
   right inside the paper's minute and, if you ever missed it, right
   again on a later day (see ability.js).

   The whole syllabus counts from the first day. A chapter whose
   questions are not written yet is costed from its page count (about
   one and a half questions a page, never fewer than 40 or more than
   80, the rule the question writers follow) and shows as "soon" on
   the map, so the number of questions left means the whole syllabus,
   not just the part that happens to be in the bank today.

   Time left is each unfinished question's minute plus a quarter
   minute to read the result, times the attempts your own hit-rate
   says it will take, divided by the study time per day.
   =========================================================== */
var PLAN = (function(){

var cache=null, cacheAgg=null, cacheKey='';
var STAR_AT=[1/3, 2/3, 1];
var SET_N=16;

function dailyMin(){ return Math.max(15, DB.state().settings.dailyMin||180); }

/* expected attempts before a question is done, from your own record */
function attempts(topicId){
  var a=AB.aggregate().topic[topicId];
  var hit = a && a.n>=6 ? U.clamp(a.cr/a.n, 0.25, 0.95) : 0.55;
  return U.clamp(1/hit, 1, 3);
}

/* questions a chapter will have once it is written, from its pages */
function estQuestions(tp){
  var p=Math.max(1, (tp.p1||0)-(tp.p0||0)+1);
  return U.clamp(Math.round(p*1.5), 40, 80);
}

function build(){
  var agg=AB.aggregate();
  var k=ICE.Q.length+'|'+dailyMin();
  if(cache && cacheAgg===agg && cacheKey===k) return cache;

  var topics={}, all={total:0, cleared:0, minutes:0, bank:0, est:0}, id, i, q, t;
  for(id in ICE.topics) topics[id]={topic:ICE.topics[id], total:0, cleared:0, minutes:0, bank:0, est:false};

  for(i=0;i<ICE.Q.length;i++){
    q=ICE.Q[i]; t=topics[q.topic];
    if(!t) continue;
    var done=AB.cleared(q.id);
    var cost=(AB.paceOf(q)/60 + 0.25)*attempts(q.topic);
    t.total++; t.bank++;
    all.total++; all.bank++;
    if(done){ t.cleared++; all.cleared++; } else { t.minutes+=cost; all.minutes+=cost; }
  }
  for(id in topics){
    var x=topics[id];
    if(!x.bank){
      /* not written yet: costed from its pages, at the default hit-rate */
      var cost2=(ICE.pace(x.topic.sec)/60 + 0.25)*attempts(id);
      x.est=true;
      x.total=estQuestions(x.topic);
      x.minutes=x.total*cost2;
      all.total+=x.total; all.minutes+=x.minutes; all.est+=x.total;
    }
  }
  cache={topics:topics, all:all};
  cacheAgg=agg; cacheKey=k;
  return cache;
}

/* ---------- read side ---------- */
function topic(id){ return build().topics[id]; }
function total(){ return build().all; }
function left(){ var a=build().all; return Math.max(0, a.total-a.cleared); }

function section(secKey){
  var out={total:0, cleared:0, minutes:0, est:0, chapters:0, written:0};
  ICE.topicsOf(secKey).forEach(function(tp){
    var x=build().topics[tp.id];
    out.total+=x.total; out.cleared+=x.cleared; out.minutes+=x.minutes; out.chapters++;
    if(x.est) out.est+=x.total; else out.written++;
  });
  return out;
}
/* the seven subjects: first and second papers added together */
function subject(sjId){
  var sj=ICE.subject(sjId), out={sj:sj, total:0, cleared:0, minutes:0, est:0};
  if(!sj) return out;
  sj.secs.forEach(function(sk){
    var s=section(sk);
    out.total+=s.total; out.cleared+=s.cleared; out.minutes+=s.minutes; out.est+=s.est;
  });
  return out;
}
function pct(x){ return x.total ? x.cleared/x.total : 0; }
/* a paper is finished when every chapter is written and every question done */
function paperDone(secKey){
  var s=section(secKey);
  return s.total>0 && s.est===0 && s.cleared>=s.total;
}

/* stars: a third of a chapter's questions done is one, two thirds two, all three */
function stars(topicId){
  var px=topic(topicId), out={n:0, done:0, total:0, soon:false};
  if(!px) return out;
  out.total=px.total; out.done=px.cleared; out.soon=!!px.est;
  if(px.est || !px.total) return out;
  var f=px.cleared/px.total;
  for(var i=0;i<STAR_AT.length;i++) if(f>=STAR_AT[i]-1e-9) out.n=i+1;
  return out;
}
function starTotal(){
  var n=0;
  for(var id in ICE.topics) n+=stars(id).n;
  return n;
}

/* the path, with a status on every step */
function path(){
  var ids=ICE.path.hsc||[], out=[], nowSet=false;
  for(var i=0;i<ids.length;i++){
    var x=build().topics[ids[i]];
    if(!x) continue;
    var pending=x.total-x.cleared, st;
    if(x.est) st='soon';                    /* questions not written yet */
    else if(!pending) st='done';
    else if(!nowSet){ st='now'; nowSet=true; }
    else st='open';
    out.push({id:ids[i], x:x, status:st, pending:pending});
  }
  return out;
}

/* ---------- the next set ----------
   New ground first: while any question in scope is still unanswered,
   more than three quarters of a set is new (13 of 16), taken from the
   first three unfinished chapters on the path and weighted toward the
   first. The rest is review: anything due back, and, once a chapter is
   finished, one question from it now and then so it does not decay.
   A question never appears twice in a set.
   inScope(topicId) limits the path to a subject or one chapter. */
function nextSet(inScope, n){
  n=n||SET_N;
  var taken={}, out=[], i;
  var steps=path().filter(function(s){ return !inScope || inScope(s.id); });
  var live=steps.filter(function(s){ return s.status!=='done' && s.status!=='soon'; });
  var done=steps.filter(function(s){ return s.status==='done'; });
  var scopeQ=function(qq){ return !inScope || inScope(qq.topic); };

  /* every unanswered question, in path order */
  var fresh=[];
  steps.forEach(function(s){ if(s.status!=='soon') AB.inTopic(s.id).forEach(function(q){ if(AB.untouched(q)) fresh.push(q); }); });
  var needNew=Math.min(AB.newShare(n), fresh.length);
  var room=n-needNew;                                   /* what review may use */

  AB.dueItems(Math.min(Math.ceil(n*0.25), room), scopeQ).forEach(function(d){
    if(!taken[d.q.id]){ taken[d.q.id]=1; out.push(d.q); }
  });
  var reviewSlots = done.length ? Math.min(Math.max(1, Math.round(n/8)), Math.max(0, room-out.length)) : 0;

  /* the new questions: front chapters by weight, then onward along the path */
  var front=live.filter(function(s){ return AB.inTopic(s.id).some(AB.untouched); }).slice(0,3);
  var weights=[0.55,0.28,0.17];
  var pools=front.map(function(s){ return AB.inTopic(s.id).filter(AB.untouched); });
  var got=0;
  while(got<needNew){
    var pick=null;
    if(pools.length){
      var r=Math.random(), acc=0, which=0, wsum=0, j;
      for(j=0;j<pools.length;j++) wsum+=weights[j];
      for(j=0;j<pools.length;j++){ acc+=weights[j]/wsum; if(r<=acc){ which=j; break; } }
      pick=AB.pickOne(pools[which], taken, 0.6) || AB.pickOne([].concat.apply([], pools), taken, 0.6);
    }
    if(!pick) pick=AB.pickOne(fresh.slice(0,400), taken, 0.6);
    if(!pick) break;
    taken[pick.id]=1; out.push(pick); got++;
  }
  for(i=0;i<reviewSlots;i++){
    var ds=done[Math.floor(Math.random()*done.length)];
    var rp=AB.pickOne(AB.inTopic(ds.id), taken, 0.7);
    if(rp){ taken[rp.id]=1; out.push(rp); }
  }
  /* anything still short: unfinished questions, then anything in scope */
  var scoped=[];
  steps.forEach(function(s){ if(s.status!=='soon') scoped=scoped.concat(AB.inTopic(s.id)); });
  while(out.length<n){
    var more=AB.pickOne(scoped.filter(function(q){ return !AB.cleared(q.id); }), taken, 0.6)
          || AB.pickOne(scoped, taken, 0.6);
    if(!more) break;
    taken[more.id]=1; out.push(more);
  }
  return AB.regroupPassages(AB.unique(out).slice(0,n));
}

/* ---------- days ----------
   Days of study left at the chosen hours a day, against days to the
   exam. Both are only shown as a quiet line on Start. */
function studyDays(){ return build().all.minutes/dailyMin(); }
function daysToExam(){
  var d=typeof CONFIG!=='undefined' && CONFIG.examDate;
  if(!d) return null;
  return Math.ceil((new Date(d+'T00:00:00').getTime()-Date.now())/864e5);
}
function paceLine(){
  var need=Math.ceil(studyDays()), toExam=daysToExam();
  return {need:need, toExam:toExam, enough: toExam===null ? null : need<=toExam, done:left()===0};
}

function invalidate(){ cache=null; }

return {build:build, topic:topic, total:total, left:left, section:section, subject:subject, pct:pct,
        paperDone:paperDone, stars:stars, starTotal:starTotal, path:path, nextSet:nextSet,
        paceLine:paceLine, invalidate:invalidate, SET_N:SET_N};
})();
