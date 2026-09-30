/* ===========================================================
   ABILITY — what you can do, in one number per topic.

   Each item carries b, the ability in standard deviations at which
   you have an even chance on it. Answering updates a running estimate
   of your ability on that item's topic, with a step size that shrinks
   as evidence accumulates: the tenth answer moves the number far less
   than the first.

   That estimate is the only input to the score prediction, which is
   why the estimate is also allowed to go DOWN, and why a topic you
   have never touched is not silently treated as average.
   =========================================================== */
var AB = (function(){

var PRIOR = -0.35;      /* an untouched topic is assumed slightly below average */
var SLOPE = 1.15;       /* discrimination                                       */
var DECAY_HALFLIFE = 45;/* days for an untouched topic's estimate to drift back */

/* ---------- index ---------- */
var IX = {
  byId:{}, byTopic:{}, bySec:{}, byTrack:{},
  passage:{}, tricks:{}, tricksById:{}, trickByTopic:{}
};

function build(){
  if(ICE.finalize) ICE.finalize();       /* generator templates into variants */
  IX.byId={}; IX.byTopic={}; IX.bySec={}; IX.byTrack={hsc:[]};
  IX.passage={}; IX.tricksById={}; IX.trickByTopic={};

  var i, q, t;
  for(i=0;i<ICE.P.length;i++) IX.passage[ICE.P[i].id]=ICE.P[i];

  for(i=0;i<ICE.Q.length;i++){
    q=ICE.Q[i];
    var top=ICE.topics[q.topic];
    if(!top) continue;                       /* an unknown topic is dropped, loudly in the console */
    q._sec=top.sec; q._track=top.track;
    /* the clock on every question is the blueprint's own allowance for
       that paper — one minute, as the board's 25-in-25 arithmetic gives.
       Nothing shorter, nothing more generous. */
    q._pace=ICE.pace(top.sec);
    IX.byId[q.id]=q;
    (IX.byTopic[q.topic]=IX.byTopic[q.topic]||[]).push(q);
    (IX.bySec[top.sec]=IX.bySec[top.sec]||[]).push(q);
    (IX.byTrack[top.track]=IX.byTrack[top.track]||[]).push(q);
  }
  for(i=0;i<ICE.T.length;i++){
    t=ICE.T[i];
    IX.tricksById[t.id]=t;
    var homes=[t.topic].concat(t.also||[]);
    for(var j=0;j<homes.length;j++){
      if(!ICE.topics[homes[j]]) continue;
      (IX.trickByTopic[homes[j]]=IX.trickByTopic[homes[j]]||[]).push(t);
    }
  }
  return IX;
}

function q(id){ return IX.byId[id]; }
function inTopic(t){ return IX.byTopic[t]||[]; }
function inSection(s){ return IX.bySec[s]||[]; }
function inTrack(t){ return IX.byTrack[t]||[]; }
function passage(id){ return IX.passage[id]; }
function tricksFor(topic){ return IX.trickByTopic[topic]||[]; }
function trick(id){ return IX.tricksById[id]; }
function allTricks(track){
  return ICE.T.filter(function(t){
    var top=ICE.topics[t.topic]; return top && (!track || top.track===track);
  });
}

/* ---------- the estimate ---------- */
function pCorrect(th, b, a){ return 1/(1+Math.exp(-(a||SLOPE)*(th-b))); }
function itemB(qq){ return (qq.b||0) + (DB.state().itemB[qq.id]||0); }

/* raw, undecayed */
function thetaRaw(topic){
  var v=DB.state().theta[topic];
  return v===undefined ? PRIOR : v;
}
/* what it is worth today. An estimate you earned in June is not the
   same estimate in September, so it slides back toward the prior. */
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

function record(qq, res){
  /* res: {ok, secs, timed, chosen, partial} */
  var s=DB.state(), topic=qq.topic, n=seen(topic);
  var th=theta(topic), b=itemB(qq), p=pCorrect(th,b,SLOPE), k=stepSize(n);
  var y=res.ok?1:0;

  s.theta[topic]=U.clamp(th + k*(y-p), -3.2, 3.2);
  s.nseen[topic]=n+1;
  s.lastSeen[topic]=Date.now();
  /* the item drifts too: an item everybody gets right is easier than labelled */
  s.itemB[qq.id]=U.clamp((s.itemB[qq.id]||0) + 0.035*(y-p), -0.9, 0.9);

  var st=s.itemStat[qq.id]||(s.itemStat[qq.id]={n:0,c:0,ms:0,last:0});
  st.n++; if(res.ok) st.c++;
  st.ms=Math.round((st.ms*(st.n-1) + (res.secs||0)*1000)/st.n);
  st.last=Date.now();

  DB.pushLog({
    t:Date.now(), q:qq.id, k:topic, s:qq._sec, tr:qq._track,
    ok:res.ok?1:0, sec:Math.round(res.secs||0), tm:res.timed?1:0,
    b:U.round(b,2), pace:qq._pace
  });

  DB.bump('q');
  DB.bump(res.ok?'right':'wrong');
  if(res.timed){ DB.bump('timed'); DB.bump('secs', Math.round(res.secs||0)); }

  schedule(qq.id, res.ok);
  progress(qq, res);
  DB.touchStreak();
  DB.save();
}

/* ---------- when a question counts as done ----------
   Right, inside the real paper's time (with a quarter of slack), and —
   if it was ever missed — right again at least sixteen hours after the
   miss. A question you got right five minutes after seeing the answer
   is remembered, not learnt. With the timer switched off, time is not
   held against you. */
var CLEAR_GAP=16*3600*1000;
var version=0;
function progress(qq, res){
  var s=DB.state(), now=Date.now();
  var it=s.items[qq.id]||(s.items[qq.id]={n:0, ok:0, miss:0, okT:0, cl:0});
  it.k=qq.topic;
  it.b=U.round(qq.b||0,2);
  it.n++;
  if(res.ok){
    it.ok++; it.okT=now;
    var inTime = !res.timed || (res.secs||0) <= paceOf(qq)*1.25;
    if(inTime && (!it.miss || now-it.miss>=CLEAR_GAP)) it.cl=1;
  } else {
    it.miss=now; it.cl=0;
  }
  version++;
}
function itemState(id){ return DB.state().items[id]||null; }
function cleared(id){ var it=DB.state().items[id]; return !!(it&&it.cl); }
function touch(){ version++; }

/* ---------- the score: 0 to 100, and it has to be earned ----------
   Right answers divided by (answers + K). K is a handful of imaginary
   wrong answers every record starts with, so five out of five is 20,
   not 100, while 450 out of 500 is 87. Volume has to push the phantom
   misses out before a score can climb.

   A right answer on a warm-up question (easier than the real paper)
   counts as 0.7. Everything starts at zero. */
var K={topic:10, sec:20, track:30, all:40};
var AGG=null, aggV=-1;
function aggregate(){
  if(AGG && aggV===version) return AGG;
  var items=DB.state().items, out={topic:{}, sec:{}, track:{}, all:{n:0, cr:0, cl:0}};
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
    add(out.track, top.track, it.n, cr, cl);
    out.all.n+=it.n; out.all.cr+=cr; out.all.cl+=cl;
  }
  AGG=out; aggV=version;
  return out;
}
function score(scope){
  var A=aggregate(), b, k;
  if(scope.topic){ b=A.topic[scope.topic]; k=K.topic; }
  else if(scope.sec){ b=A.sec[scope.sec]; k=K.sec; }
  else if(scope.track){ b=A.track[scope.track]; k=K.track; }
  else { b=A.all; k=K.all; }
  if(!b||!b.n) return {score:0, n:0, right:0};
  return {score:Math.round(100*b.cr/(b.n+k)), n:b.n, right:Math.round(b.cr)};
}

/* ---------- showing a question: options in a fresh random order ----------
   The order is drawn once when the question appears and kept until it
   is answered, so repainting never moves an option under the cursor.
   The copy carries remapped keys and explanations; marking and
   recording work on the copy exactly as they would on the original. */
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

/* ---------- bringing a missed item back ----------
   A miss returns soon. A second miss returns sooner. Getting it right
   twice running retires it. This is deliberately cruder than a full
   spaced-repetition scheduler, because these are questions, not cards —
   the bank has to keep feeling fresh. */
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
function dueItems(track, limit){
  var s=DB.state(), now=Date.now(), out=[];
  for(var id in s.cards){
    var c=s.cards[id]; if(c.done||c.due>now) continue;
    var qq=IX.byId[id]; if(!qq) continue;
    if(track && qq._track!==track) continue;
    out.push({q:qq, over:(now-c.due)/864e5, lapse:c.lapse});
  }
  out.sort(function(a,b){ return (b.lapse-a.lapse)||(b.over-a.over); });
  return limit? out.slice(0,limit) : out;
}
function missedIds(track){
  var s=DB.state(), out=[];
  for(var id in s.cards){
    var c=s.cards[id]; if(!c.lapse||c.done) continue;
    var qq=IX.byId[id]; if(!qq||(track&&qq._track!==track)) continue;
    out.push(qq);
  }
  return out;
}

/* ---------- mastery ---------- */
function mastery(topic){
  var n=seen(topic);
  if(!n) return {p:0, n:0, unknown:true, lo:0, hi:0, th:theta(topic)};
  var th=theta(topic), e=se(topic);
  /* the chance you get a question of average difficulty for this topic right */
  var mid=0.25;
  return {
    p: pCorrect(th, mid, SLOPE),
    lo: pCorrect(th-1.28*e, mid, SLOPE),
    hi: pCorrect(th+1.28*e, mid, SLOPE),
    n: n, th: th, se: e, unknown:false
  };
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
function trackCoverage(track){
  var secs=ICE.sectionsOf(track), c=0;
  for(var i=0;i<secs.length;i++) c+=sectionTheta(track+'/'+secs[i].id).cov;
  return secs.length? c/secs.length : 0;
}

/* ---------- choosing what to ask ----------
   The target hit-rate is 0.72: hard enough that a miss is informative,
   easy enough that a session is not demoralising. Every fifth item is
   softened to 0.86, because a run of near-misses is how people quit. */
/* The easiest question you can be served. New to a track, warm-ups are
   allowed; by 120 answers in, nothing below the real paper's level is
   picked unless the pool has nothing else. */
function floorB(track){
  var n=(aggregate().track[track]||{n:0}).n;
  return -1.4 + U.clamp(n/120,0,1)*(1.4+ICE.EXAM_B);
}
function pickOne(pool, taken, target){
  var best=null, bd=99, floors={}, pass;
  for(pass=0; pass<2 && !best; pass++){
    for(var i=0;i<pool.length;i++){
      var qq=pool[i];
      if(taken && taken[qq.id]) continue;
      var tr=qq._track;
      if(floors[tr]===undefined) floors[tr]=floorB(tr);
      if(pass===0 && itemB(qq)<floors[tr]) continue;
      var d=Math.abs(pCorrect(theta(qq.topic), itemB(qq), SLOPE) - target);
      /* questions not yet done come first; repeats of done ones are rare */
      var it=DB.state().items[qq.id];
      if(it){ d += it.cl ? 0.6 : Math.min(0.2, it.n*0.05); }
      d += Math.random()*0.04;                    /* break ties differently each time */
      if(d<bd){ bd=d; best=qq; }
    }
  }
  return best;
}

/* never answered (a skipped question still counts as new) */
function untouched(qq){ var it=DB.state().items[qq.id]; return !it || !it.n; }
/* "more than 75%": the smallest count that is strictly over three quarters */
function newShare(n){ return Math.min(n, Math.floor(n*0.75)+1); }

/* opts: {track, sec, topic, n, mode}
   mode: 'adaptive' | 'weak' | 'due' | 'speed' | 'mock' | 'trick' */
function buildSet(opts){
  var n=opts.n||DB.state().settings.setSize||12;
  var pool;

  if(opts.topic) pool=inTopic(opts.topic).slice();
  else if(opts.sec) pool=inSection(opts.sec).slice();
  else if(opts.track) pool=inTrack(opts.track).slice();
  else pool=ICE.Q.slice();

  if(opts.trick) pool=pool.filter(function(x){ return x.trick===opts.trick; });
  if(opts.types) pool=pool.filter(function(x){ return opts.types.indexOf(x.type)>=0; });
  if(!pool.length) return [];

  var taken={}, out=[], i;

  /* New ground first. While this scope still has questions you have never
     seen, more than three quarters of an ordinary set is made of them
     (13 of 16); review and retries share what is left. */
  var ordinary = !opts.mode || opts.mode==='adaptive' || opts.mode==='trick';
  var newPool = ordinary ? pool.filter(untouched) : [];
  var needNew = Math.min(newShare(n), newPool.length);

  /* whatever the mode, anything genuinely due comes first — at most a third
     of the set, and never into the room kept for new questions */
  if(opts.mode!=='mock'){
    var due=dueItems(opts.track, Math.min(Math.ceil(n/3), n-needNew));
    for(i=0;i<due.length;i++){
      var dq=due[i].q;
      if(opts.topic && dq.topic!==opts.topic) continue;
      if(opts.sec && dq._sec!==opts.sec) continue;
      taken[dq.id]=1; out.push(dq);
    }
  }

  if(opts.mode==='weak'){
    /* the weakest topics in this scope, hardest-hit first */
    var byTopic=U.groupBy(pool, function(x){ return x.topic; });
    var ranked=Object.keys(byTopic).sort(function(a,b){
      var ma=mastery(a), mb=mastery(b);
      var va=ma.unknown?0.3:ma.p, vb=mb.unknown?0.3:mb.p;
      return va-vb;
    });
    var r=0;
    while(out.length<n && r<ranked.length*4){
      var tk=ranked[r%ranked.length]; r++;
      var pick=pickOne(byTopic[tk], taken, 0.55);
      if(pick){ taken[pick.id]=1; out.push(pick); }
    }
  } else if(opts.mode==='speed'){
    /* short, confident items only — this drill is about the clock */
    var fast=pool.filter(function(x){
      return x.type==='mc' && itemB(x) < theta(x.topic)+0.45;
    });
    if(fast.length<n) fast=pool;
    var sh=U.shuffle(fast, Date.now()%9973);
    for(i=0;i<sh.length&&out.length<n;i++){ if(!taken[sh[i].id]){ taken[sh[i].id]=1; out.push(sh[i]); } }
  } else if(opts.mode==='mock'){
    out=mockSet(opts);
    return out;
  } else {
    var ch0=DB.state().settings.challenge||'exam';
    var t0 = opts.hard ? 0.45 : ch0==='flow' ? 0.82 : ch0==='brutal' ? 0.45 : 0.6;
    for(var nw=0; nw<needNew && out.length<n; nw++){
      var np=pickOne(newPool, taken, t0);
      if(!np) break;
      taken[np.id]=1; out.push(np);
    }
    while(out.length<n){
      /* aim at a 60% hit rate: hard enough that practice is harder than the
         paper, with one stretch question in every four. A mode that asks for
         hard (a boss, admission mode) draws from further up still. */
      var ch=DB.state().settings.challenge||'exam';
      var base = opts.hard ? 0.45 : ch==='flow' ? 0.82 : ch==='brutal' ? 0.45 : 0.6;
      var stretch = opts.hard ? 0.3 : ch==='flow' ? 0.6 : ch==='brutal' ? 0.3 : 0.45;
      var target=(out.length%4===3)?stretch:base;
      var pk=pickOne(pool, taken, target);
      if(!pk) break;
      taken[pk.id]=1; out.push(pk);
    }
  }

  /* keep the two questions of an উদ্দীপক together, and in order */
  return regroupPassages(out.slice(0,n));
}

/* a mock reproduces the real paper's topic mix, not your weak spots */
function mockSet(opts){
  var secKey=opts.sec, sec=ICE.sections[secKey];
  if(!sec) return [];
  var want=opts.n||sec.n, tops=ICE.topicsOf(secKey), taken={}, out=[];
  var totalW=0, i;
  for(i=0;i<tops.length;i++) totalW+=tops[i].w;
  /* A real paper is not tuned to you. Difficulty is drawn from fixed bands —
     never a warm-up, about half at exam level, the rest harder — whatever
     your record says. */
  function band(pool, lo, hi){
    var c=pool.filter(function(q){ var b=itemB(q); return !taken[q.id] && b>=lo && b<hi; });
    return c.length ? c[rand(c.length)] : null;
  }
  for(i=0;i<tops.length;i++){
    var k=Math.round(want*tops[i].w/totalW);
    var pool=inTopic(tops[i].id);
    for(var j=0;j<k;j++){
      var pk = j%2===0 ? (band(pool, ICE.EXAM_B, ICE.HARD_B)||band(pool, ICE.HARD_B, 9))
                       : (band(pool, ICE.HARD_B, 9)||band(pool, ICE.EXAM_B, ICE.HARD_B));
      if(!pk) pk=band(pool, -9, 9);
      if(pk){ taken[pk.id]=1; out.push(pk); }
    }
  }
  var all=inSection(secKey);
  while(out.length<want){
    var extra=band(all, ICE.EXAM_B, 9)||band(all, -9, 9);
    if(!extra) break;
    taken[extra.id]=1; out.push(extra);
  }
  return regroupPassages(U.shuffle(out, 7).slice(0,want));
}

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

/* ---------- marking ----------
   A board MCQ is one mark, right or wrong, and a multiple-completion
   item is one mark for the whole combination — getting two of the
   three statements right is still a wrong answer on the sheet. */
function check(qq, res){
  return {ok: res===qq.ans, partial: res===qq.ans?1:0};
}
/* how the right answer reads, for the line after a miss */
function answerText(qq){
  return U.letter(qq.ans)+'. '+options(qq)[qq.ans];
}
function options(qq){
  if(qq.type==='mcomp') return ICE.FIXED.mcomp;
  return qq.opts||[];
}

/* ---------- pace ---------- */
function paceOf(qq){ return qq._pace || ICE.pace(qq._sec) || 60; }
function medianPace(scope, days){
  var since=Date.now() - (days||14)*864e5;
  var rows=DB.logFor(function(r){
    if(r.t<since || !r.tm) return false;
    if(scope.topic) return r.k===scope.topic;
    if(scope.sec) return r.s===scope.sec;
    if(scope.track) return r.tr===scope.track;
    return true;
  });
  if(!rows.length) return null;
  return U.median(rows.map(function(r){ return r.sec; }));
}
/* One pass over the log, bucketed every way the statistics page needs.
   Asking accuracy() and medianPace() per topic meant eighty full scans of a
   six-thousand-row log every time that page painted; this is one. */
function digest(days){
  var since=Date.now() - (days||30)*864e5;
  var out={topic:{}, sec:{}, track:{}, all:{n:0, ok:0, timed:0, secs:[]}};
  function bucket(map, key){
    return map[key] || (map[key]={n:0, ok:0, timed:0, secs:[]});
  }
  var log=DB.state().log;
  for(var i=log.length-1;i>=0;i--){
    var r=log[i];
    if(r.t<since) break;                 /* the log is in time order */
    var b=[bucket(out.topic, r.k), bucket(out.sec, r.s), bucket(out.track, r.tr), out.all];
    for(var j=0;j<b.length;j++){
      b[j].n++;
      b[j].ok+=r.ok;
      if(r.tm){ b[j].timed++; b[j].secs.push(r.sec); }
    }
  }
  return out;
}
function digestAcc(d){ return d && d.n ? {p:d.ok/d.n, n:d.n} : null; }
function digestPace(d){ return d && d.secs.length ? U.median(d.secs) : null; }

function accuracy(scope, days){
  var since=Date.now() - (days||30)*864e5;
  var rows=DB.logFor(function(r){
    if(r.t<since) return false;
    if(scope.topic) return r.k===scope.topic;
    if(scope.sec) return r.s===scope.sec;
    if(scope.track) return r.tr===scope.track;
    return true;
  });
  if(!rows.length) return null;
  var c=0; for(var i=0;i<rows.length;i++) c+=rows[i].ok;
  return {p:c/rows.length, n:rows.length};
}

return {
  build:build, IX:IX, PRIOR:PRIOR, SLOPE:SLOPE,
  q:q, inTopic:inTopic, inSection:inSection, inTrack:inTrack, passage:passage,
  tricksFor:tricksFor, trick:trick, allTricks:allTricks,
  pCorrect:pCorrect, itemB:itemB, theta:theta, thetaRaw:thetaRaw, seen:seen, se:se,
  record:record, dueItems:dueItems, missedIds:missedIds,
  mastery:mastery, sectionTheta:sectionTheta, trackCoverage:trackCoverage,
  buildSet:buildSet, mockSet:mockSet, pickOne:pickOne,
  check:check, answerText:answerText, options:options,
  paceOf:paceOf, medianPace:medianPace, accuracy:accuracy,
  digest:digest, digestAcc:digestAcc, digestPace:digestPace,
  present:present, itemState:itemState, cleared:cleared, score:score, aggregate:aggregate,
  touch:touch, floorB:floorB, K:K, regroupPassages:regroupPassages,
  untouched:untouched, newShare:newShare
};
})();
