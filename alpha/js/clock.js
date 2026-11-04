/* ===========================================================
   CLOCK — the only honest number on the Statistics page.

   Time is billed to whatever you currently have open, in real
   minutes, and only while you are actually there: the tab has to be
   visible and you have to have touched something in the last ninety
   seconds. Leaving the page open on a desk earns you nothing.

   Nothing here can be typed in or edited. That is the whole point.
   =========================================================== */
var CLOCK = (function(){

var IDLE_MS   = 90000;   /* a gesture buys ninety seconds of "present" */
var BEAT_MS   = 10000;
var MAX_STEP  = 0.35;    /* minutes credited by one beat, hard ceiling */

var ctxTrack=null, ctxSec=null, ctxTopic=null;
var activeUntil=0, lastBeat=0, sessionStart=0, sessionSecs=0;
var listeners=[];

function markActive(){
  activeUntil=Date.now()+IDLE_MS;
  if(!sessionStart) sessionStart=Date.now();
}
function isActive(){ return !document.hidden && Date.now()<=activeUntil; }

/* what the minutes are being billed to right now */
function focus(o){
  o=o||{};
  ctxTrack = o.track || null;
  ctxSec   = o.sec   || (o.topic ? ICE.secKey(o.topic) : null);
  ctxTopic = o.topic || null;
  if(!ctxTrack && ctxSec) ctxTrack=ICE.sections[ctxSec] && ICE.sections[ctxSec].track;
  markActive();
}
function context(){ return {track:ctxTrack, sec:ctxSec, topic:ctxTopic}; }

function beat(){
  var now=Date.now();
  if(!isActive()){ lastBeat=now; notify(); return; }
  if(!lastBeat){ lastBeat=now; return; }
  var mins=Math.min(MAX_STEP, (now-lastBeat)/60000);
  lastBeat=now;
  if(mins<=0) return;

  var d=new Date(), key=DB.ymd(d), hour=d.getHours();
  var day=DB.dayTime(key);
  day.tot += mins;
  day.byHour[hour] = (day.byHour[hour]||0) + mins;
  /* Bill the widest bucket you can. A minute on the trick library belongs to
     the track even though it belongs to no section, and a minute on a topic
     belongs to all three. Only genuinely track-less screens — settings, the
     statistics page itself — land in the daily total alone. */
  if(ctxTrack) day.byTrack[ctxTrack] = (day.byTrack[ctxTrack]||0) + mins;
  if(ctxSec)   day.bySec[ctxSec]     = (day.bySec[ctxSec]||0) + mins;
  if(ctxTopic) day.byTopic[ctxTopic] = (day.byTopic[ctxTopic]||0) + mins;

  sessionSecs += mins*60;
  DB.touchStreak();
  DB.save();
  notify();
}

function start(){
  markActive();
  ['pointerdown','keydown','wheel','touchstart'].forEach(function(ev){
    window.addEventListener(ev, markActive, {passive:true});
  });
  document.addEventListener('visibilitychange', function(){
    lastBeat=Date.now();
    if(!document.hidden) markActive();
    notify();
  });
  window.addEventListener('beforeunload', function(){ beat(); DB.saveNow(); });
  setInterval(beat, BEAT_MS);
  setInterval(notify, 1000);
}

/* ---------- the live chip in the top bar ---------- */
function onTick(fn){ listeners.push(fn); }
function notify(){
  var info={
    active:isActive(),
    today:DB.minsOn(DB.today()),
    session:sessionSecs,
    ctx:context()
  };
  for(var i=0;i<listeners.length;i++){ try{ listeners[i](info); }catch(e){} }
}

/* ---------- read-side helpers used by the Statistics page ---------- */
function todayMins(){ return DB.minsOn(DB.today()); }
function sessionMinutes(){ return sessionSecs/60; }

/* the target is derived from your own habit, never typed:
   the median of the days you actually studied, floored and capped. */
function autoTarget(){
  var d=DB.lastNDays(21).filter(function(x){ return x.mins>2; }).map(function(x){ return x.mins; });
  if(d.length<3) return DB.state().goal.mins;
  return Math.round(U.clamp(U.median(d)*1.1, 20, 180));
}
function goalPct(){ return U.clamp(Math.round(100*todayMins()/autoTarget()), 0, 100); }
function consistency(days){
  days=days||14;
  var d=DB.lastNDays(days);
  var hit=0; for(var i=0;i<d.length;i++) if(DB.DAY_MET(d[i].date)) hit++;
  return hit/days;
}
function peakHour(days){
  var agg={}, best={h:null, mins:0};
  var list=DB.lastNDays(days||60);
  for(var i=0;i<list.length;i++){
    var t=DB.state().time[list[i].date]; if(!t) continue;
    for(var hh in t.byHour) agg[hh]=(agg[hh]||0)+t.byHour[hh];
  }
  for(var k in agg) if(agg[k]>best.mins) best={h:+k, mins:agg[k]};
  return best;
}
function hourAgg(days){
  var agg=new Array(24), i;
  for(i=0;i<24;i++) agg[i]=0;
  var list=DB.lastNDays(days||60);
  for(i=0;i<list.length;i++){
    var t=DB.state().time[list[i].date]; if(!t) continue;
    for(var hh in t.byHour) agg[+hh]+=t.byHour[hh];
  }
  return agg;
}
/* minutes spent per topic over a window, sorted heaviest first */
function topicSpend(track, days){
  var keys=DB.lastNDays(days||90).map(function(x){ return x.date; });
  var out=[];
  for(var id in ICE.topics){
    var t=ICE.topics[id];
    if(track && t.track!==track) continue;
    out.push({topic:t, mins:DB.minsOnTopic(id, keys)});
  }
  return out.sort(function(a,b){ return b.mins-a.mins; });
}

return {start:start, focus:focus, context:context, markActive:markActive, isActive:isActive,
        onTick:onTick, beat:beat, todayMins:todayMins, sessionMinutes:sessionMinutes,
        autoTarget:autoTarget, goalPct:goalPct, consistency:consistency,
        peakHour:peakHour, hourAgg:hourAgg, topicSpend:topicSpend};
})();
