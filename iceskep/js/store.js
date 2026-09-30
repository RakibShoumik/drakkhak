/* ===========================================================
   STORE — one localStorage object, and the small helpers that
   everything else is built on.

   No account, no server, no network call. If you clear the
   browser's data for this page, the record is gone; Settings has
   an export for exactly that reason.
   =========================================================== */
var DB = (function(){

var KEY='iceskep.hsc.v1';          /* unchanged, so nobody's record is lost */
var S=null, _t=null;
var MIG=3;                         /* one-time changes already applied to a record */
var HOURS=[60,120,180,240];        /* study minutes a day a student can pick */

function fresh(){
  return {
    v:1, mig:MIG,
    theme:'day',
    sound:true,
    firstOpen:'',
    onboarded:false,            /* the first-visit screen has been passed */
    noteClosed:false,           /* the honesty note on Start was dismissed */
    logo:'bubbles',             /* 'bubbles' or 'cards' */
    scope:{kind:'all', sj:'', ch:''},   /* what Practice is pointed at */

    /* ability, per topic id */
    theta:{}, nseen:{}, lastSeen:{},
    itemB:{}, itemStat:{},

    /* the mistake schedule: {r, due, lapse, done} per question */
    cards:{},

    /* per-question progress: {n attempts, ok correct, miss last-miss ms,
       okT last-correct ms, l 1 if the latest answer was right, cl 1 once
       the question counts as done} */
    items:{},

    /* streak: days in a row with five questions answered */
    streak:0, best:0, lastDay:'',

    /* per-day counters, 'YYYY-MM-DD' -> {q, right, wrong, sets} */
    acts:{},

    /* rolling answer log: the raw material for the prediction */
    log:[],

    /* rewards: one currency */
    coins:0,
    wallet:[],                  /* recent earnings and purchases, newest last */
    power:{fifty:1, second:1, plus30:1},
    badges:{},                  /* id -> when it was earned */
    answered:0, correct:0, won:0,
    examBest:{},                /* paper -> best full-paper share (0..1) */

    settings:{
      dailyMin:180,             /* study minutes a day, one of HOURS */
      lang:'bn',                /* 'bn' or 'en' for the interface */
      calm:false                /* animations and vibration off */
    }
  };
}

function nearestHours(m){
  var best=HOURS[2], d=1e9;
  for(var i=0;i<HOURS.length;i++){ var x=Math.abs(HOURS[i]-m); if(x<d){ d=x; best=HOURS[i]; } }
  return best;
}

/* An older record carries features that no longer exist. Keep what still
   means something, carry over what has a new home, and drop the rest. */
function migrate(o){
  var g=o.game||{}, k;
  var n={};
  var f=fresh();
  for(k in f) n[k]=o[k]!==undefined ? o[k] : f[k];
  var st=o.settings||{};
  n.settings={
    dailyMin: st.dailyMin===119 ? 180 : nearestHours(st.dailyMin||180),
    lang: 'bn',
    calm: st.effects===false
  };
  n.coins=+g.coins||0;
  n.answered=+g.answered||0; n.correct=+g.correct||0; n.won=+g.fixed||0;
  var lf=g.lifelines||{};
  n.power={fifty:Math.max(1, Math.min(9, +lf.fifty||0)), second:1, plus30:1};
  n.wallet=[]; n.badges={};
  if(!o.acts) n.acts={};
  /* full-paper results: the old mock runs, as a best share per paper */
  n.examBest={};
  (o.runs||[]).forEach(function(r){
    if((r.mode==='mock'||r.mode==='admission') && r.sec && r.n){
      var p=r.right/r.n; if(!(n.examBest[r.sec]>=p)) n.examBest[r.sec]=p;
    }
  });
  n.noteClosed=false;
  n.onboarded=!!(o.onboarded || (o.log&&o.log.length));
  n.scope={kind:'all', sj:'', ch:''};
  n.logo='bubbles';
  n.mig=MIG;
  return n;
}

function load(){
  var raw=null;
  try{ raw=JSON.parse(localStorage.getItem(KEY)); }catch(e){ raw=null; }
  if(raw && typeof raw==='object' && raw.mig>=MIG){
    S=raw;
    var f=fresh(), k;
    for(k in f) if(!(k in S)) S[k]=f[k];
    for(k in f.settings) if(!(k in S.settings)) S.settings[k]=f.settings[k];
    for(k in f.power) if(!(k in S.power)) S.power[k]=f.power[k];
    for(k in f.scope) if(!(k in S.scope)) S.scope[k]=f.scope[k];
  } else if(raw && typeof raw==='object' && ('theta' in raw)){
    S=migrate(raw);
    saveNow();
  } else {
    S=fresh();
  }
  if(!S.firstOpen) S.firstOpen=today();
  return S;
}
function state(){ return S||load(); }
function save(){ if(_t) clearTimeout(_t); _t=setTimeout(saveNow,160); }
function saveNow(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }

/* ---------- dates ---------- */
function ymd(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function today(){ return ymd(new Date()); }
function dayNum(s){ return Math.floor(new Date(s+'T00:00:00').getTime()/864e5); }
function daysBetween(a,b){ return dayNum(b)-dayNum(a); }

/* ---------- per-day counters ---------- */
function blankAct(){ return {q:0,right:0,wrong:0,sets:0}; }
function actsOn(k){ return state().acts[k]||blankAct(); }
function actsToday(){
  var s=state(), k=today();
  var a=s.acts[k];
  if(!a){
    a=s.acts[k]=blankAct();
    var keys=Object.keys(s.acts).sort();
    while(keys.length>90) delete s.acts[keys.shift()];
  }
  return a;
}
function bump(kind, n){
  var a=actsToday(); a[kind]=(a[kind]||0)+(n===undefined?1:n); save();
}

/* ---------- streak: simple days in a row ----------
   A day counts once five questions are answered. Opening the page is
   not studying. Miss a whole day and it starts again. */
function DAY_MET(k){ return actsOn(k).q>=5; }
function touchStreak(){
  var s=state(), t=today();
  if(!DAY_MET(t) || s.lastDay===t) return false;
  var gap = s.lastDay ? daysBetween(s.lastDay, t) : 999;
  s.streak = gap===1 ? s.streak+1 : 1;
  s.best=Math.max(s.best, s.streak);
  s.lastDay=t; save();
  return true;
}
function liveStreak(){
  var s=state(); if(!s.lastDay) return 0;
  return daysBetween(s.lastDay, today())<=1 ? s.streak : 0;
}

/* ---------- the answer log ---------- */
function pushLog(rec){
  var s=state();
  s.log.push(rec);
  if(s.log.length>9000) s.log=s.log.slice(-7000);
  save();
}
function logFor(pred, limit){
  var s=state(), out=[];
  for(var i=s.log.length-1;i>=0;i--){
    if(pred(s.log[i])){ out.push(s.log[i]); if(limit&&out.length>=limit) break; }
  }
  return out;
}

/* a question's latest answer, right or wrong. Records written before the
   flag existed are read from the two timestamps. */
function lastOk(it){
  if(!it || !it.n) return null;
  if(it.l!==undefined) return !!it.l;
  return (it.okT||0) > (it.miss||0);
}

/* ---------- import / export ---------- */
function exportJSON(){ return JSON.stringify(state()); }
function importJSON(txt){
  var o=JSON.parse(txt);
  if(!o||typeof o!=='object'||!('theta' in o)) throw new Error('Not a Drakkhak backup.');
  /* write it first: load() reads from storage */
  localStorage.setItem(KEY, JSON.stringify(o));
  load(); saveNow(); return true;
}
function reset(){ S=fresh(); S.firstOpen=today(); saveNow(); }

return {
  load:load, state:state, save:save, saveNow:saveNow, HOURS:HOURS,
  ymd:ymd, today:today, dayNum:dayNum, daysBetween:daysBetween,
  actsOn:actsOn, actsToday:actsToday, bump:bump, blankAct:blankAct,
  touchStreak:touchStreak, liveStreak:liveStreak, DAY_MET:DAY_MET,
  pushLog:pushLog, logFor:logFor, lastOk:lastOk,
  exportJSON:exportJSON, importJSON:importJSON, reset:reset
};
})();

/* ===========================================================
   L(english, bangla) — the interface string in the language chosen
   in Settings. Bangla is the default; English is one switch away.
   Question content (stems, options, explanations) never goes
   through this: a question stays in the language it was written in.
   =========================================================== */
function L(en, bn){
  return (DB.state().settings.lang==='en' || bn===undefined || bn===null) ? en : bn;
}
function LBN(){ return DB.state().settings.lang!=='en'; }

/* ===========================================================
   U — formatting and small pure helpers, used everywhere.
   =========================================================== */
var U = (function(){
function h(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function clamp(x,a,b){ return x<a?a:x>b?b:x; }
function round(x,n){ var m=Math.pow(10,n||0); return Math.round(x*m)/m; }

/* 6619 -> 6,619 (in the interface's own digits) */
function num(n){ return N(String(Math.round(n||0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')); }
/* 75 -> 1:15 */
function secs(s){
  s=Math.max(0,Math.round(s||0));
  return N(Math.floor(s/60)+':'+String(s%60).padStart(2,'0'));
}
function median(a){
  if(!a.length) return 0;
  var b=a.slice().sort(function(x,y){return x-y;}), m=b.length>>1;
  return b.length%2 ? b[m] : (b[m-1]+b[m])/2;
}

/* a deterministic shuffle, so a set is reproducible within a session */
function shuffle(a, seed){
  var r=seed||1, b=a.slice();
  for(var i=b.length-1;i>0;i--){
    r=(r*1103515245+12345)&0x7fffffff;
    var j=r%(i+1), t=b[i]; b[i]=b[j]; b[j]=t;
  }
  return b;
}

/* the letter shown beside an option. The board prints ক খ গ ঘ; the
   keyboard still answers A–D or 1–4. */
var LETTERS=['ক','খ','গ','ঘ'];
function letter(i){ return LETTERS[i]||String(i+1); }

return {h:h, clamp:clamp, round:round, num:num, secs:secs, median:median, shuffle:shuffle, letter:letter};
})();
