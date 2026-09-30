/* ===========================================================
   ABILITY — what you can do, in one number per chapter, and what you
   have and have not won back.

   Each question carries b, the ability in standard deviations at which
   you have an even chance on it. Answering updates a running estimate
   of your ability on that chapter, with a step size that shrinks as
   evidence accumulates. That estimate feeds the prediction and the
   "weak chapters" mode, and is allowed to go down as well as up.

   The mistake bank is every question whose latest answer was wrong.
   Answer one right and it leaves the bank and comes back later to be
   checked (যাচাই), on a schedule that stretches each time.
   =========================================================== */
var AB = (function(){

var PRIOR = -0.35;      /* an untouched chapter is assumed slightly below average */
var SLOPE = 1.15;       /* discrimination                                          */
var DECAY_HALFLIFE = 45;/* days for an untouched chapter's estimate to drift back  */

/* ---------- index ---------- */
var IX = {byId:{}, byTopic:{}, bySec:{}, passage:{}};

function build(){
  if(ICE.finalize) ICE.finalize();       /* generator templates into variants */
  IX.byId={}; IX.byTopic={}; IX.bySec={}; IX.passage={};
  var i, q;
  for(i=0;i<ICE.P.length;i++) IX.passage[ICE.P[i].id]=ICE.P[i];
  for(i=0;i<ICE.Q.length;i++){
    q=ICE.Q[i];
    var top=ICE.topics[q.topic];
    if(!top) continue;
    q._sec=top.sec;
    /* the clock on every question is the blueprint's own allowance for
       that paper: one minute, as the board's 25-in-25 arithmetic gives */
    q._pace=ICE.pace(top.sec);
    IX.byId[q.id]=q;
    (IX.byTopic[q.topic]=IX.byTopic[q.topic]||[]).push(q);
    (IX.bySec[top.sec]=IX.bySec[top.sec]||[]).push(q);
  }
  return IX;
}

function q(id){ return IX.byId[id]; }
function inTopic(t){ return IX.byTopic[t]||[]; }
function inSection(s){ return IX.bySec[s]||[]; }
function passage(id){ return IX.passage[id]; }

/* ---------- the estimate ---------- */
function pCorrect(th, b, a){ return 1/(1+Math.exp(-(a||SLOPE)*(th-b))); }
function itemB(qq){ return (qq.b||0) + (DB.state().itemB[qq.id]||0); }

/* what an estimate is worth today: one earned in June is not the same
   estimate in September, so it slides back toward the prior */
function theta(topic){
  var s=DB.state(), v=s.theta[topic];
  if(v===undefined) return PRIOR;
  var last=s.lastSeen[topic];
  if(!last) return v;
  var days=(Date.now()-last)/864e5;
  if(days<7) return v;
  var f=Math.pow(0.5, (days-7)/DECAY_HALFLIFE);
  return PRIOR + (v-PRIOR)*f;
}
function seen(topic){ return DB.state().nseen[topic]||0; }
function stepSize(n){ return 0.85/(1+n*0.15)+0.09; }

/* standard error of the estimate — the prediction leans on this heavily */
function se(topic){
  var n=seen(topic);
  if(!n) return 1.2;
  var p=pCorrect(theta(topic), 0, SLOPE);
  var info=Math.max(0.09, SLOPE*SLOPE*p*(1-p));
  return U.clamp(1/Math.sqrt(info*n), 0.16, 1.2);
}

/* ---------- recording one answer ----------
   res: {ok, secs, late}. A late answer (after the clock ran out) is right
   or wrong as usual but does not count the question as done. */
function record(qq, res){
  var s=DB.state(), topic=qq.topic, n=seen(topic);
  var th=theta(topic), b=itemB(qq), p=pCorrect(th,b,SLOPE), k=stepSize(n);
  var y=res.ok?1:0;

  s.theta[topic]=U.clamp(th + k*(y-p), -3.2, 3.2);
  s.nseen[topic]=n+1;
  s.lastSeen[topic]=Date.now();
  /* the question drifts too: one everybody gets right is easier than labelled */
  s.itemB[qq.id]=U.clamp((s.itemB[qq.id]||0) + 0.035*(y-p), -0.9, 0.9);

  var st=s.itemStat[qq.id]||(s.itemStat[qq.id]={n:0,c:0,ms:0,last:0});
  st.n++; if(res.ok) st.c++;
  st.ms=Math.round((st.ms*(st.n-1) + (res.secs||0)*1000)/st.n);
  st.last=Date.now();

  DB.pushLog({
    t:Date.now(), q:qq.id, k:topic, s:qq._sec,
    ok:res.ok?1:0, sec:Math.round(res.secs||0), tm:1,
    b:U.round(b,2), pace:qq._pace
  });

  DB.bump('q');
  DB.bump(res.ok?'right':'wrong');
  s.answered++; if(res.ok) s.correct++;

  schedule(qq.id, res.ok);
  progress(qq, res);
  DB.touchStreak();
  DB.save();
}

/* ---------- when a question counts as done ----------
   Right, inside the paper's time (with a quarter of slack), and, if it
   was ever missed, right again at least sixteen hours after the miss.
   A question you got right five minutes after seeing the answer is
   remembered, not learnt. */
var CLEAR_GAP=16*3600*1000;
var version=0;
function progress(qq, res){
  var s=DB.state(), now=Date.now();
  var it=s.items[qq.id]||(s.items[qq.id]={n:0, ok:0, miss:0, okT:0, cl:0});
  it.k=qq.topic;
  it.b=U.round(qq.b||0,2);
  it.n++;
  if(res.ok){
    it.ok++; it.okT=now; it.l=1;
    var inTime = !res.late && (res.secs||0) <= paceOf(qq)*1.25;
    if(inTime && (!it.miss || now-it.miss>=CLEAR_GAP)) it.cl=1;
  } else {
    it.miss=now; it.cl=0; it.l=0;
  }
  version++;
}
function touch(){ version++; }
function itemState(id){ return DB.state().items[id]||null; }
function cleared(id){ var it=DB.state().items[id]; return !!(it&&it.cl); }
/* never answered */
function untouched(qq){ var it=DB.state().items[qq.id]; return !it || !it.n; }
/* the tag on a question: new, back from the bank, or a check */
function kind(qq){
  var it=DB.state().items[qq.id];
  if(!it || !it.n) return 'new';
  return DB.lastOk(it) ? 'check' : 'again';
}

/* ---------- the score: 0 to 100, and it has to be earned ----------
   Right answers divided by (answers + K). K is a handful of imaginary
   wrong answers every record starts with, so five out of five is not a
   hundred. A right answer on a warm-up question counts 0.7. */
var K={topic:10, sec:20, all:40};
var AGG=null, aggV=-1;
function aggregate(){
  if(AGG && aggV===version) return AGG;
  var items=DB.state().items, out={topic:{}, sec:{}, all:{n:0, cr:0, cl:0}};
  function add(map, key, n, cr, cl){
    var b=map[key]||(map[key]={n:0, cr:0, cl:0});
    b.n+=n; b.cr+=cr; b.cl+=cl;
  }
  for(var id in items){
    var it=items[id], top=ICE.topics[it.k];
    if(!top) continue;
    var cr=it.ok*((it.b||0)>=ICE.EXAM_B ? 1 : 0.7), cl=it.cl?1:0;
    add(out.topic, it.k, it.n, cr, cl);
    add(out.sec, top.sec, it.n, cr, cl);
    out.all.n+=it.n; out.all.cr+=cr; out.all.cl+=cl;
  }
  AGG=out; aggV=version;
  return out;
}
function score(scope){
  var A=aggregate(), b, k;
  if(scope && scope.topic){ b=A.topic[scope.topic]; k=K.topic; }
  else if(scope && scope.sec){ b=A.sec[scope.sec]; k=K.sec; }
  else { b=A.all; k=K.all; }
  if(!b||!b.n) return {score:0, n:0, right:0};
  return {score:Math.round(100*b.cr/(b.n+k)), n:b.n, right:Math.round(b.cr)};
}

/* ---------- showing a question: options in a fresh random order ----------
   The order is drawn once when the question appears and kept until it
   is answered. The copy carries remapped keys and explanations; marking
   and recording work on the copy exactly as they would on the original. */
function rand(n){
  if(window.crypto && window.crypto.getRandomValues){
    var a=new Uint32Array(1); window.crypto.getRandomValues(a); return a[0]%n;
  }
  return Math.floor(Math.random()*n);
}
function perm(n){
  var p=[], i; for(i=0;i<n;i++) p.push(i);
  for(i=n-1;i>0;i--){ var j=rand(i+1), t=p[i]; p[i]=p[j]; p[j]=t; }
  return p;
}
function present(qq){
  var v={}, k;
  for(k in qq) v[k]=qq[k];
  v._orig=qq;
  if(!qq.opts || !ICE.shuffleable(qq)) return v;
  var p=perm(qq.opts.length);
  v.opts=p.map(function(o){ return qq.opts[o]; });
  v.why=p.map(function(o){ return (qq.why||[])[o]; });
  v.ans = Array.isArray(qq.ans) ? qq.ans.map(function(a){ return p.indexOf(a); }) : p.indexOf(qq.ans);
  return v;
}

/* ---------- bringing a question back ----------
   A miss returns soon, a second miss sooner; each right answer pushes
   the next visit further out (1, 4, 12, 30 days). Deliberately cruder
   than a full scheduler: these are questions, not cards. */
function schedule(id, ok){
  var s=DB.state(), c=s.cards[id]||(s.cards[id]={r:0,due:0,lapse:0});
  if(ok){
    c.r++;
    var iv = c.lapse===0 ? [1,4,12,30][Math.min(3,c.r)] : [0.7,2,6,16][Math.min(3,c.r)];
    c.due = Date.now() + iv*864e5;
    if(c.r>=3 && c.lapse<=1) c.done=1;
  } else {
    c.lapse++; c.r=0; c.done=0;
    c.due = Date.now() + (c.lapse>=3 ? 0.35 : 0.9)*864e5;
  }
}
/* questions that are due back today (a check, or a mistake that has cooled) */
function dueItems(limit, inScope){
  var s=DB.state(), now=Date.now(), out=[];
  for(var id in s.cards){
    var c=s.cards[id]; if(c.done||c.due>now) continue;
    var qq=IX.byId[id]; if(!qq) continue;
    if(inScope && !inScope(qq)) continue;
    out.push({q:qq, over:(now-c.due)/864e5, lapse:c.lapse});
  }
  out.sort(function(a,b){ return (b.lapse-a.lapse)||(b.over-a.over); });
  return limit? out.slice(0,limit) : out;
}
/* the mistake bank: latest answer wrong */
function mistakes(inScope){
  var items=DB.state().items, out=[];
  for(var id in items){
    var it=items[id];
    if(DB.lastOk(it)!==false) continue;
    var qq=IX.byId[id]; if(!qq) continue;
    if(inScope && !inScope(qq)) continue;
    out.push(qq);
  }
  return out;
}
/* true if this question is in the bank right now */
function inBank(id){ return DB.lastOk(DB.state().items[id])===false; }

/* ---------- mastery ---------- */
function mastery(topic){
  var n=seen(topic);
  if(!n) return {p:0, n:0, unknown:true};
  var th=theta(topic);
  return {p: pCorrect(th, 0.25, SLOPE), n:n, unknown:false};
}
function sectionTheta(secKey){
  var tops=ICE.topicsOf(secKey), sw=0, st=0, sv=0, cov=0, nTot=0;
  for(var i=0;i<tops.length;i++){
    var t=tops[i], w=t.w, e=se(t.id);
    st += w*theta(t.id);
    sv += w*w*e*e;
    sw += w;
    nTot += seen(t.id);
    if(seen(t.id)>=3) cov += w;
  }
  if(!sw) return {th:PRIOR, se:1.2, cov:0, n:0};
  return {th:st/sw, se:Math.sqrt(sv)/sw, cov:cov/sw, n:nTot};
}

/* ---------- choosing one question ----------
   Aim at a hit-rate: hard enough that a miss is informative, easy
   enough that a set is not demoralising. Warm-ups are allowed only
   while you are new; by 120 answers in, nothing below the real paper's
   level is picked unless the pool has nothing else. */
function floorB(){
  var n=aggregate().all.n;
  return -1.4 + U.clamp(n/120,0,1)*(1.4+ICE.EXAM_B);
}
function pickOne(pool, taken, target){
  var best=null, bd=99, fl=floorB(), pass;
  for(pass=0; pass<2 && !best; pass++){
    for(var i=0;i<pool.length;i++){
      var qq=pool[i];
      if(taken && taken[qq.id]) continue;
      if(pass===0 && itemB(qq)<fl) continue;
      var d=Math.abs(pCorrect(theta(qq.topic), itemB(qq), SLOPE) - (target||0.6));
      var it=DB.state().items[qq.id];
      if(it){ d += it.cl ? 0.6 : Math.min(0.2, it.n*0.05); }   /* done ones come last */
      d += Math.random()*0.04;                                  /* break ties differently each time */
      if(d<bd){ bd=d; best=qq; }
    }
  }
  return best;
}
/* "more than 75%": the smallest count strictly over three quarters */
function newShare(n){ return Math.min(n, Math.floor(n*0.75)+1); }

/* an উদ্দীপক must not be split across a set, or you read the same
   scenario twice and answer its pair an hour apart */
function regroupPassages(list){
  var withP=[], without=[], seenP={}, i;
  for(i=0;i<list.length;i++){
    if(list[i].passage){
      if(!seenP[list[i].passage]){ seenP[list[i].passage]=[]; withP.push(list[i].passage); }
      seenP[list[i].passage].push(list[i]);
    } else without.push(list[i]);
  }
  if(!withP.length) return list;
  var out=[];
  for(i=0;i<withP.length;i++) out=out.concat(seenP[withP[i]]);
  return out.concat(without);
}
/* a set never repeats a question */
function unique(list){
  var seenId={}, out=[];
  for(var i=0;i<list.length;i++){ if(!seenId[list[i].id]){ seenId[list[i].id]=1; out.push(list[i]); } }
  return out;
}

/* ---------- marking ----------
   A board MCQ is one mark, right or wrong. A multiple-completion item
   is one mark for the whole combination. */
function check(qq, res){ return {ok: res===qq.ans}; }
function options(qq){
  if(qq.type==='mcomp') return ICE.FIXED.mcomp;
  return qq.opts||[];
}
/* how the right answer reads, for the line after a miss */
function answerText(qq){ return U.letter(qq.ans)+'. '+options(qq)[qq.ans]; }

/* ---------- pace ---------- */
function paceOf(qq){ return qq._pace || ICE.pace(qq._sec) || 60; }
function medianPace(scope, days){
  var since=Date.now() - (days||14)*864e5;
  var rows=DB.logFor(function(r){
    if(r.t<since || !r.tm) return false;
    if(scope.sec) return r.s===scope.sec;
    return true;
  });
  if(!rows.length) return null;
  return U.median(rows.map(function(r){ return r.sec; }));
}

return {
  build:build, IX:IX, PRIOR:PRIOR, SLOPE:SLOPE,
  q:q, inTopic:inTopic, inSection:inSection, passage:passage,
  pCorrect:pCorrect, itemB:itemB, theta:theta, seen:seen, se:se,
  record:record, dueItems:dueItems, mistakes:mistakes, inBank:inBank,
  mastery:mastery, sectionTheta:sectionTheta,
  pickOne:pickOne, newShare:newShare, regroupPassages:regroupPassages, unique:unique,
  check:check, answerText:answerText, options:options,
  paceOf:paceOf, medianPace:medianPace,
  present:present, itemState:itemState, cleared:cleared, score:score, aggregate:aggregate,
  untouched:untouched, kind:kind, touch:touch, floorB:floorB, rand:rand
};
})();
