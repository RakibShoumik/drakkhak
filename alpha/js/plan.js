/* ===========================================================
   PLAN — everything there is to learn, in the order to learn it,
   and how many days of it are left.

   The unit of progress is one question counted as DONE: answered
   right inside the paper's minute, and — if you ever missed it —
   right again on a later day. Finishing the syllabus means every
   question in it is done, every key point on its Learn sheet has
   been read, and every formula card has been read. Nothing less.

   "Days left" is the honest time that remains: each unfinished
   question costs its minute plus a quarter-minute to read the result,
   multiplied by how many attempts your own hit-rate says it will take;
   each unread key point costs half a minute and each unread card a
   minute and a half. That total, divided by the study time you set
   per day (1 hr 59 min unless you change it), is the number shown in
   the top bar.

   The whole syllabus counts from the first day. A chapter whose
   questions are not written yet is costed from its page count —
   about one and a half questions a page, never fewer than 40 or more
   than 80, the same rule the question writers follow — so the days
   left for Physics mean the whole of Physics, not just the part that
   happens to be in the bank today. Those chapters show as "soon".
   =========================================================== */
var PLAN = (function(){

var cache=null, cacheKey='';

function dailyMin(){ return Math.max(15, DB.state().settings.dailyMin||119); }

var cache_agg=null;

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
  var agg=AB.aggregate(), s=DB.state();
  var credit=(s.game&&s.game.credit)||{};
  var k=[Object.keys(s.readTricks).length, dailyMin(), ICE.Q.length, LEARN.version(),
         Object.keys(credit).join(',')].join('|');
  if(cache && cache_agg===agg && cacheKey===k) return cache;

  var topics={}, tracks={hsc:blank()}, types={hsc:{}};
  function blank(){ return {total:0, cleared:0, minutes:0, tricks:0, tricksRead:0, bank:0, bankCleared:0, est:0}; }

  for(var id in ICE.topics){
    topics[id]={topic:ICE.topics[id], total:0, cleared:0, minutes:0, tricks:0, tricksRead:0,
                bank:0, learnLeft:0, est:false};
  }
  var i, q, t;
  for(i=0;i<ICE.Q.length;i++){
    q=ICE.Q[i]; t=topics[q.topic];
    if(!t || !q._track) continue;
    /* a topic you tested out of is treated as finished: the skip test was
       five of its hardest questions, which is a fair price for the credit */
    var done=AB.cleared(q.id) || !!credit[q.topic];
    var cost=(AB.paceOf(q)/60 + 0.25)*attempts(q.topic);
    t.total++; t.bank++; if(done) t.cleared++; else t.minutes+=cost;
    var T=tracks[q._track];
    T.total++; T.bank++; if(done){ T.cleared++; T.bankCleared++; } else T.minutes+=cost;
    var ty=types[q._track][q.type]||(types[q._track][q.type]={type:q.type, total:0, cleared:0, minutes:0});
    ty.total++; if(done) ty.cleared++; else ty.minutes+=cost;
  }
  for(i=0;i<ICE.T.length;i++){
    var tk=ICE.T[i], tp=topics[tk.topic];
    if(!tp) continue;
    var read=!!s.readTricks[tk.id];
    tp.tricks++; if(read) tp.tricksRead++; else tp.minutes+=1.5;
    var TT=tracks[tp.topic.track];
    TT.tricks++; if(read) TT.tricksRead++; else TT.minutes+=1.5;
  }
  for(id in topics){
    var x=topics[id], TR=tracks[x.topic.track];
    if(!x.bank){
      /* not written yet: costed from its pages, at the default hit-rate */
      x.est=true;
      x.total=estQuestions(x.topic);
      x.minutes+=x.total*(ICE.pace(x.topic.sec)/60 + 0.25)*attempts(id);
      TR.total+=x.total; TR.minutes+=x.total*(ICE.pace(x.topic.sec)/60 + 0.25)*attempts(id); TR.est+=x.total;
    } else if(!credit[id]){
      x.learnLeft=LEARN.minutesLeft(id);
      x.minutes+=x.learnLeft; TR.minutes+=x.learnLeft;
    }
  }

  cache={topics:topics, tracks:tracks, types:types};
  cache_agg=agg; cacheKey=k;
  return cache;
}

/* ---------- read side ---------- */
function topic(id){ return build().topics[id]; }
function track(t){ return build().tracks[t]; }
function section(secKey){
  var out={total:0, cleared:0, minutes:0};
  ICE.topicsOf(secKey).forEach(function(tp){
    var x=build().topics[tp.id]; out.total+=x.total; out.cleared+=x.cleared; out.minutes+=x.minutes;
  });
  return out;
}
/* the seven subjects: first and second papers added together */
function subject(sjId){
  var sj=ICE.subject(sjId), out={sj:sj, total:0, cleared:0, minutes:0, bank:0, est:0, stars:0, chapters:0};
  if(!sj) return out;
  sj.secs.forEach(function(sk){
    ICE.topicsOf(sk).forEach(function(tp){
      var x=build().topics[tp.id];
      out.total+=x.total; out.cleared+=x.cleared; out.minutes+=x.minutes; out.bank+=x.bank;
      if(x.est) out.est+=x.total;
      out.chapters++;
    });
  });
  return out;
}
function subjects(){ return ICE.subjects.map(function(sj){ return subject(sj.id); }); }

function days(minutes){ return minutes/dailyMin(); }
/* "56 days", "2.4 days", "35 min", "done" */
function daysText(minutes){
  var d=days(minutes);
  if(minutes<1) return L('done','শেষ');
  if(d<0.1) return U.mins(minutes);
  var v=(d<10 ? U.round(d,1) : Math.round(d));
  return v+L(Math.abs(d-1)<0.05?' day':' days',' দিন');
}
/* the whole-number version for tight places: "56d" */
function daysShort(minutes){
  if(minutes<1) return '0';
  var d=days(minutes);
  return String(d<10 ? U.round(d,1) : Math.round(d));
}
function trackDays(t){ return days(track(t).minutes); }
function pct(x){ return x.total ? x.cleared/x.total : 0; }

/* the path, with a status on every step */
function path(t){
  var ids=ICE.path[t]||[], out=[], nowSet=false, nextSet=false;
  for(var i=0;i<ids.length;i++){
    var x=build().topics[ids[i]];
    if(!x) continue;
    var pending = (x.total-x.cleared) + (x.tricks-x.tricksRead);
    var st;
    if(x.est) st='soon';                    /* questions not written yet */
    else if(!pending) st='done';
    else if(!nowSet){ st='now'; nowSet=true; }
    else if(!nextSet){ st='next'; nextSet=true; }
    else st='later';
    out.push({id:ids[i], x:x, status:st, pending:pending});
  }
  return out;
}
function types(t){
  var m=build().types[t], out=[];
  for(var k in m) out.push(m[k]);
  return out.sort(function(a,b){ return b.total-a.total; });
}

/* which of the seven subjects a paper belongs to */
function subjOf(sec){
  for(var i=0;i<ICE.subjects.length;i++) if(ICE.subjects[i].secs.indexOf(sec)>=0) return ICE.subjects[i].id;
  return sec;
}
/* every subject's front: the first unfinished, written chapter of each */
function frontier(t, sjId){
  var seen={}, out=[];
  path(t).forEach(function(s){
    if(s.status==='done' || s.status==='soon') return;
    var k=subjOf(s.x.topic.sec);
    if(sjId && k!==sjId) return;
    if(seen[k]) return;
    if(!AB.inTopic(s.id).length) return;
    seen[k]=1; out.push({sj:ICE.subject(k)||{id:k, en:k, bn:k}, step:s});
  });
  return out;
}

/* ---------- the next set: the optimal order, made concrete ----------
   Every set mixes all the subjects (owner's rule since the merge with the
   community side): the new questions are dealt round the seven subjects
   in turn, each from that subject's first unfinished chapter (and the
   next one once that runs dry), so one set of 16 carries two or three
   questions of every subject. Inside a subject the book's chapter order
   still holds. While any question is unanswered, more than three quarters
   of a set is new (13 of 16). The rest is review: anything due back
   (questions you missed, returning on schedule), and — once a chapter is
   finished — one question from it now and then so it does not decay.
   o.subject keeps the whole set inside one subject (a subject's name on
   the map); a chapter of its own goes through AB.buildSet instead. */
function nextSet(t, n, o){
  o=o||{};
  n=n||DB.state().settings.setSize||16;
  var taken={}, out=[], i;
  var steps=path(t);
  if(o.subject) steps=steps.filter(function(s){ return subjOf(s.x.topic.sec)===o.subject; });
  var live=steps.filter(function(s){ return s.status!=='done' && s.status!=='soon'; });
  var done=steps.filter(function(s){ return s.status==='done'; });
  var inScope=function(q){ return !o.subject || subjOf(q._sec)===o.subject; };

  /* every unanswered question, in path order */
  var fresh=[];
  steps.forEach(function(s){ if(s.status!=='soon') AB.inTopic(s.id).forEach(function(q){ if(AB.untouched(q)) fresh.push(q); }); });
  var needNew=Math.min(AB.newShare(n), fresh.length);
  var room=n-needNew;                                   /* what review may use */

  AB.dueItems(t).filter(function(d){ return inScope(d.q); }).slice(0, Math.min(Math.ceil(n*0.25), room)).forEach(function(d){
    if(!taken[d.q.id]){ taken[d.q.id]=1; out.push(d.q); }
  });
  var reviewSlots = done.length ? Math.min(Math.max(1, Math.round(n/8)), Math.max(0, room-out.length)) : 0;

  /* the new questions: one lane per subject, its chapters in book order,
     dealt round the lanes from a random first subject */
  var lanes={}, order=[];
  live.forEach(function(s){
    var qs=AB.inTopic(s.id).filter(AB.untouched); if(!qs.length) return;
    var k=subjOf(s.x.topic.sec);
    if(!lanes[k]){ lanes[k]=[]; order.push(k); }
    if(lanes[k].length<2) lanes[k].push(qs);           /* the front chapter and the one after */
  });
  var fresh0=[], got=0, at=order.length?Math.floor(Math.random()*order.length):0, dry=0;
  while(got<needNew && order.length && dry<order.length){
    var k=order[at%order.length], chs=lanes[k], pick=null;
    for(var c=0;c<chs.length && !pick;c++) pick=AB.pickOne(chs[c], taken, 0.6);
    at++;
    if(!pick){ dry++; continue; }
    dry=0; taken[pick.id]=1; fresh0.push(pick); got++;
  }
  while(got<needNew){
    var fp=AB.pickOne(fresh.slice(0,400), taken, 0.6);
    if(!fp) break;
    taken[fp.id]=1; fresh0.push(fp); got++;
  }
  out=out.concat(fresh0);
  for(i=0;i<reviewSlots;i++){
    var ds=done[Math.floor(Math.random()*done.length)];
    var rp=AB.pickOne(AB.inTopic(ds.id), taken, 0.7);
    if(rp){ taken[rp.id]=1; out.push(rp); }
  }
  /* anything still short: unfinished questions, then anything at all */
  var scope=AB.inTrack(t).filter(inScope);
  while(out.length<n){
    var more=AB.pickOne(scope.filter(function(q){ return !AB.cleared(q.id); }), taken, 0.6)
          || AB.pickOne(scope, taken, 0.6);
    if(!more) break;
    taken[more.id]=1; out.push(more);
  }
  return AB.regroupPassages ? AB.regroupPassages(out) : out;
}

/* how many questions a day of study covers, at your own pace */
function perDay(t){
  var x=track(t);
  var left=x.total-x.cleared;
  if(!left) return 0;
  var avg=(x.minutes)/Math.max(1,left+ (x.tricks-x.tricksRead)*0.1);
  return Math.max(1, Math.round(dailyMin()/Math.max(0.5,avg)));
}

function invalidate(){ cache=null; }

/* ---------- the days-left record ----------
   One entry a day for each track: the content minutes left when the day
   began (a) and now (z). It draws the line on Progress, and it is where
   "3 days cut this week" on Today comes from. */
function stamp(){
  var s=DB.state(), k=DB.today();
  if(!s.leftLog) s.leftLog={};
  var hsc=track('hsc').minutes, e=s.leftLog[k];
  if(!e) e=s.leftLog[k]={hsc:{a:hsc,z:hsc}};
  else if(e.hsc) e.hsc.z=hsc;
  else e.hsc={a:hsc, z:hsc};
  var keys=Object.keys(s.leftLog).sort();
  while(keys.length>400) delete s.leftLog[keys.shift()];
  DB.save();
}
function entry(t, key){
  var s=DB.state(), log=s.leftLog||{};
  if(log[key]) return log[key][t]||null;
  return null;
}
/* minutes left at the end of each of the last n days, carried forward over gaps */
function history(t, days){
  var s=DB.state(), log=s.leftLog||{}, out=[], last=null;
  var keys=Object.keys(log).sort(), list=DB.lastNDays(days||30);
  for(var i=0;i<keys.length && keys[i]<list[0].date;i++) if(log[keys[i]][t]) last=log[keys[i]][t].z;
  list.forEach(function(d){
    if(log[d.date] && log[d.date][t]) last=log[d.date][t].z;
    out.push({date:d.date, min:last});
  });
  if(out.length) out[out.length-1].min=track(t).minutes;
  return out;
}
/* content minutes cut since the start of a given day (never negative) */
function cutSince(t, key){
  var s=DB.state(), log=s.leftLog||{}, keys=Object.keys(log).sort(), start=null;
  for(var i=0;i<keys.length;i++){ if(keys[i]>=key && log[keys[i]][t]){ start=log[keys[i]][t].a; break; } }
  if(start===null) return 0;
  return Math.max(0, start-track(t).minutes);
}
function cutToday(t){ return cutSince(t, DB.today()); }
function cutWeek(t){
  var d=new Date(); d.setHours(0,0,0,0);
  d.setDate(d.getDate()-((d.getDay()+6)%7));
  return cutSince(t, DB.ymd(d));
}
/* the calendar day the content runs out, at the current daily minutes */
function finishDate(t){
  var d=days(track(t).minutes);
  return new Date(Date.now()+Math.ceil(d)*864e5);
}

return {build:build, topic:topic, track:track, section:section, path:path, types:types,
        subject:subject, subjects:subjects, estQuestions:estQuestions,
        nextSet:nextSet, frontier:frontier, subjOf:subjOf, days:days, daysText:daysText, daysShort:daysShort, trackDays:trackDays, pct:pct,
        perDay:perDay, dailyMin:dailyMin, invalidate:invalidate,
        stamp:stamp, entry:entry, history:history, cutSince:cutSince,
        cutToday:cutToday, cutWeek:cutWeek, finishDate:finishDate};
})();
