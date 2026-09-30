/* ===========================================================
   STORE — one localStorage object, and the small helpers that
   everything else is built on.

   No account, no server, no network call. If you clear the
   browser's data for this page, the record is gone; Settings has
   an export for exactly that reason.
   =========================================================== */
var DB = (function(){

/* The HSC edition keeps its own drawer. The IBA/GRE edition used
   'iceskep.v1'; nothing from it should ever mix with this record. */
var KEY='iceskep.hsc.v1';
var S=null, _t=null;

function fresh(){
  return {
    v:1,
    mig:2,                      /* one-time changes already applied to this record */
    track:'hsc',
    theme:'day',
    sound:true,
    timer:true,                 /* the top-right stopwatch */
    firstOpen:'',
    onboarded:false,            /* the five-question first visit has been seen */
    leftLog:{},                 /* 'YYYY-MM-DD' -> {hsc:{a,z}} content minutes left */
    name:'',                    /* only ever printed on your own certificate */

    /* ability, per topic id */
    theta:{}, nseen:{}, lastSeen:{},
    itemB:{}, itemStat:{},

    /* spaced repetition, for items you have missed */
    cards:{},

    /* measured time. 'YYYY-MM-DD' -> {tot, byTopic:{}, byHour:{}, bySec:{}} */
    time:{},

    /* streak */
    streak:0, best:0, lastDay:'', freezes:2, freezeMonth:'', frozen:{}, repairWeek:'',

    /* per-day activity counters */
    acts:{},

    /* rolling answer log — the raw material for every chart */
    log:[],

    /* finished practice sets */
    runs:[],

    /* what you have read */
    readTricks:{},
    learn:{},                   /* topic -> {sub-topic: when it was marked learnt} */

    /* goals — one figure: the share of a paper's MCQ you are aiming at */
    goal:{ mins:45, hsc:{pct:88} },
    examDate:{ hsc:'' },

    /* per-question progress: {n attempts, ok correct, miss last-miss ms,
       okT last-correct ms, cl 1 once the question counts as done} */
    items:{},

    /* ---- the game layer: everything earned rather than measured ---- */
    game:{
      xp:0, level:1, coins:0,
      bestCombo:0, answered:0, correct:0, fixed:0,
      badges:{},                 /* id -> when it was earned            */
      seen:{},                   /* one-time moments already shown      */
      chests:0, dry:0, opened:0, /* pending chests, pity counter        */
      records:{},                /* name -> {v, t}                      */
      stars:{},                  /* topic -> {acc, speed, clean}        */
      cards:{tricks:{}, topics:{}},
      own:{}, wear:{avatar:'owl', frame:'plain', pack:'journal'},
      pet:{stage:0, fedDay:'', name:''},
      lifelines:{fifty:1, trick:1},
      unlocked:{},
      dream:'', title:'',
      credit:{},                 /* topic -> questions credited by a test */
      diag:0,
      qotd:{day:'', ok:null, grid:[]},
      qotdCount:0, sureRun:0, cleanRun:0, today:null, gaveFreeze:0,
      season:{id:'', xp:0, claimed:{}},
      quests:{day:'', list:[], claimed:{}, wk:'', weekly:null, wclaimed:0},
      events:{},
      duels:[], reports:[], notes:{},
      lastOpen:'', breakShown:0, doubleUntil:0,
      openLoop:null              /* a set left unfinished                */
    },

    settings:{
      setSize:16,                /* questions in an ordinary set */
      alarm:true,                /* ring when a question's real-exam time runs out */
      dailyMin:119,              /* study minutes per day — drives "days left"   */
      dailyQ:20,                 /* questions a day you chose for yourself       */
      passLine:70,               /* score lines on every 0–100 bar               */
      goalLine:85,
      hardPredict:true,          /* the conservative prediction. see predict.js */
      challenge:'exam',          /* how far above your level a set aims:         */
                                 /* flow ~85% right · exam ~60% · brutal ~45%    */
      effects:true,              /* animations, confetti, floating points        */
      haptics:true,              /* a tap on the phone for right and wrong       */
      confidence:false,          /* ask "sure or guessing" before the verdict    */
      redemption:true,           /* a second question on the same idea after a miss */
      breaks:true,               /* suggest a break after an hour                */
      reminderHour:-1,           /* -1 = off; otherwise the hour to nudge at     */
      lang:'en'                  /* 'en' or 'bn' for the interface; English by default */
    }
  };
}

function load(){
  try{ S=JSON.parse(localStorage.getItem(KEY))||fresh(); }catch(e){ S=fresh(); }
  var f=fresh(), k, oldRecord=!(S.mig>=2);
  for(k in f) if(!(k in S)) S[k]=f[k];
  for(k in f.settings) if(!(k in S.settings)) S.settings[k]=f.settings[k];
  /* retired: the app no longer moves on by itself or opens the explanation unasked */
  delete S.settings.autoAdvance; delete S.settings.autoAdvanceMs;
  delete S.settings.revealFast; delete S.settings.mixTypes; delete S.settings.strictPace;
  for(k in f.goal) if(!(k in S.goal)) S.goal[k]=f.goal[k];
  /* the game layer arrived after the first release: fill in what is missing,
     one level deep, so an older record keeps everything it had */
  if(!S.game) S.game=f.game;
  for(k in f.game) if(!(k in S.game)) S.game[k]=f.game[k];
  for(k in f.game.wear) if(!(k in S.game.wear)) S.game.wear[k]=f.game.wear[k];
  if(!S.firstOpen) S.firstOpen=today();
  /* retired: the next set never starts by itself any more */
  delete S.settings.autoplay;
  /* this edition has one track and one exam date */
  S.track='hsc';
  if(!S.examDate || typeof S.examDate!=='object') S.examDate={hsc:''};
  if(S.examDate.hsc===undefined) S.examDate.hsc='';
  if(!S.goal.hsc) S.goal.hsc={pct:88};
  /* Drakkhak: the interface opens in English and in daylight, and a day of
     study is 1 hr 59 min unless you set it. Applied once to older records. */
  if(oldRecord){
    S.settings.lang='en'; S.theme='day';
    if(S.settings.dailyMin===180) S.settings.dailyMin=119;
    S.mig=2;
  }
  if(!S.learn) S.learn={};
  /* anyone with answers on record has already met the app */
  if(!S.onboarded && S.log && S.log.length) S.onboarded=true;
  return S;
}
function game(){ return state().game; }
function state(){ return S||load(); }
function save(){ if(_t) clearTimeout(_t); _t=setTimeout(saveNow,160); }
function saveNow(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }

/* ---------- dates ---------- */
function ymd(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function today(){ return ymd(new Date()); }
function dayNum(s){ return Math.floor(new Date(s+'T00:00:00').getTime()/864e5); }
function daysBetween(a,b){ return dayNum(b)-dayNum(a); }
function lastNDays(n){
  var out=[], now=new Date();
  for(var i=n-1;i>=0;i--){
    var d=new Date(now.getTime()-i*864e5), k=ymd(d);
    out.push({date:k, d:d, mins:minsOn(k), acts:actsOn(k)});
  }
  return out;
}

/* ---------- time ledger ---------- */
function dayTime(k){
  var s=state();
  var d = s.time[k] || (s.time[k]={tot:0, byTopic:{}, byHour:{}, bySec:{}, byTrack:{}});
  if(!d.byTrack) d.byTrack={};        /* records written before byTrack existed */
  return d;
}
function minsOn(k){ var t=state().time[k]; return t?t.tot:0; }
function minsOnTopic(topicId, days){
  var s=state(), tot=0, list=days||Object.keys(s.time);
  for(var i=0;i<list.length;i++){
    var t=s.time[list[i]]; if(t&&t.byTopic[topicId]) tot+=t.byTopic[topicId];
  }
  return tot;
}
function minsOnSection(secKey, days){
  var s=state(), tot=0, list=days||Object.keys(s.time);
  for(var i=0;i<list.length;i++){
    var t=s.time[list[i]]; if(t&&t.bySec[secKey]) tot+=t.bySec[secKey];
  }
  return tot;
}
/* Time spent on a track is billed directly, not summed from its sections:
   plenty of screens (the overview, the trick library, the prediction) belong
   to a track without belonging to any one section, and those minutes are
   real study time that would otherwise vanish from the ledger. */
function minsOnTrack(track, days){
  var s=state(), tot=0, list=days||Object.keys(s.time);
  for(var i=0;i<list.length;i++){
    var t=s.time[list[i]];
    if(t && t.byTrack && t.byTrack[track]) tot+=t.byTrack[track];
  }
  return tot;
}
function totalMins(){
  var s=state(), tot=0; for(var k in s.time) tot+=s.time[k].tot; return tot;
}

/* ---------- activity counters ---------- */
function blankAct(){ return {q:0,right:0,wrong:0,timed:0,secs:0,tricks:0,vocab:0,sets:0}; }
function actsOn(k){ return state().acts[k]||blankAct(); }
function actsToday(){
  var s=state(), k=today();
  return s.acts[k]||(s.acts[k]=blankAct());
}
function bump(kind, n){
  var a=actsToday(); a[kind]=(a[kind]||0)+(n===undefined?1:n); save();
}

/* ---------- streak ----------
   A day counts once you have answered five questions or logged five
   minutes. Opening the page is not studying. */
function DAY_MET(k){
  var a=actsOn(k); return (a.q>=5) || (minsOn(k)>=5);
}
function touchStreak(){
  var s=state(), t=today();
  if(!DAY_MET(t)) return false;
  if(s.lastDay===t) return false;
  var gap = s.lastDay ? daysBetween(s.lastDay, t) : 999;
  var mon = t.slice(0,7);
  if(s.freezeMonth!==mon){ s.freezeMonth=mon; s.freezes=Math.max(2, s.freezes); }
  if(gap===1){ s.streak++; }
  else if(gap===2 && s.freezes>0){
    s.freezes--; s.streak+=1;
    var missed=new Date(new Date(t+'T00:00:00').getTime()-864e5);
    s.frozen[ymd(missed)]=1;
  }
  else { s.streak=1; }
  s.best=Math.max(s.best, s.streak);
  s.lastDay=t; save();
  return true;
}
/* a streak only stays alive while the gap is small — report it honestly */
function liveStreak(){
  var s=state(); if(!s.lastDay) return 0;
  var gap=daysBetween(s.lastDay, today());
  if(gap<=0) return s.streak;
  if(gap===1) return s.streak;      /* today is still open */
  if(gap===2 && s.freezes>0) return s.streak;
  return 0;
}

/* ---------- the answer log ---------- */
function pushLog(rec){
  var s=state();
  s.log.push(rec);
  if(s.log.length>9000) s.log=s.log.slice(-7000);
  save();
}
function logSince(ms){
  var s=state(), out=[], i;
  for(i=s.log.length-1;i>=0;i--){ if(s.log[i].t<ms) break; out.push(s.log[i]); }
  return out.reverse();
}
function logFor(pred, limit){
  var s=state(), out=[];
  for(var i=s.log.length-1;i>=0;i--){
    if(pred(s.log[i])){ out.push(s.log[i]); if(limit&&out.length>=limit) break; }
  }
  return out;
}

/* ---------- import / export ---------- */
function exportJSON(){ return JSON.stringify(state()); }
function importJSON(txt){
  var o=JSON.parse(txt);
  if(!o||typeof o!=='object'||!('theta' in o)) throw new Error('Not a Drakkhak backup.');
  if(o.goal && (o.goal.gre || o.goal.iba)) throw new Error('That copy is from the IBA/GRE edition.');
  /* write it first: load() reads from storage, so assigning S alone was undone */
  localStorage.setItem(KEY, JSON.stringify(o));
  load(); saveNow(); return true;
}
function reset(){ S=fresh(); saveNow(); }

return {
  load:load, state:state, game:game, save:save, saveNow:saveNow,
  ymd:ymd, today:today, dayNum:dayNum, daysBetween:daysBetween, lastNDays:lastNDays,
  dayTime:dayTime, minsOn:minsOn, minsOnTopic:minsOnTopic, minsOnSection:minsOnSection,
  minsOnTrack:minsOnTrack, totalMins:totalMins,
  actsOn:actsOn, actsToday:actsToday, bump:bump, blankAct:blankAct,
  touchStreak:touchStreak, liveStreak:liveStreak, DAY_MET:DAY_MET,
  pushLog:pushLog, logSince:logSince, logFor:logFor,
  exportJSON:exportJSON, importJSON:importJSON, reset:reset
};
})();

/* ===========================================================
   L(english, bangla) — the interface string in the language chosen
   in Settings. English is the default and Bangla is one switch away.
   Question content (stems, options, explanations) never goes
   through this: a question stays in the language it was written in.
   =========================================================== */
function L(en, bn){
  return (DB.state().settings.lang==='bn' && bn!==undefined && bn!==null) ? bn : en;
}
function LBN(){ return DB.state().settings.lang==='bn'; }

/* ===========================================================
   U — formatting and small pure helpers, used everywhere.
   =========================================================== */
var U = (function(){
function h(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function clamp(x,a,b){ return x<a?a:x>b?b:x; }
function pct(x){ return Math.round(x*100); }
function round(x,n){ var m=Math.pow(10,n||0); return Math.round(x*m)/m; }

/* spelt out, so "1 hr 59 min" reads as time at a glance */
function mins(m){
  m=Math.round(m||0);
  var H=L('hr','ঘণ্টা'), M=L('min','মিনিট');
  if(m<1) return '0 '+M;
  if(m<60) return m+' '+M;
  var hh=Math.floor(m/60), mm=m%60;
  return mm? hh+' '+H+' '+mm+' '+M : hh+' '+H;
}
function minsLong(m){
  m=Math.round(m||0);
  if(m<60) return m+' '+L('minutes','মিনিট');
  return U.round(m/60,1)+' '+L('hours','ঘণ্টা');
}
/* 6619 -> 6,619 */
function num(n){ return String(Math.round(n||0)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function secs(s){
  s=Math.max(0,Math.round(s||0));
  var m=Math.floor(s/60);
  return m+':'+String(s%60).padStart(2,'0');
}
function ago(ts){
  var d=(Date.now()-ts)/1000;
  if(d<60) return L('just now','এইমাত্র');
  if(d<3600) return Math.floor(d/60)+L(' min ago',' মিনিট আগে');
  if(d<86400) return Math.floor(d/3600)+L(' hr ago',' ঘণ্টা আগে');
  var days=Math.floor(d/86400);
  return days===1?L('yesterday','গতকাল'):days+L(' days ago',' দিন আগে');
}
function median(a){
  if(!a.length) return 0;
  var b=a.slice().sort(function(x,y){return x-y;}), m=b.length>>1;
  return b.length%2 ? b[m] : (b[m-1]+b[m])/2;
}
function mean(a){ if(!a.length) return 0; var s=0; for(var i=0;i<a.length;i++) s+=a[i]; return s/a.length; }
function sum(a){ var s=0; for(var i=0;i<a.length;i++) s+=a[i]; return s; }

/* a deterministic shuffle, so a set is reproducible within a session */
function shuffle(a, seed){
  var r=seed||1, b=a.slice();
  for(var i=b.length-1;i>0;i--){
    r=(r*1103515245+12345)&0x7fffffff;
    var j=r%(i+1), t=b[i]; b[i]=b[j]; b[j]=t;
  }
  return b;
}
function sample(a,n,seed){ return shuffle(a,seed).slice(0,n); }
function uniq(a){ var s={},o=[]; for(var i=0;i<a.length;i++) if(!s[a[i]]){s[a[i]]=1;o.push(a[i]);} return o; }
function groupBy(a,f){ var o={}; for(var i=0;i<a.length;i++){ var k=f(a[i]); (o[k]=o[k]||[]).push(a[i]); } return o; }

/* the letter shown beside an option. The board prints ক খ গ ঘ, so the
   app does too; the keyboard still answers A-D, because nobody changes
   keyboard layout in the middle of a question. */
var LETTERS=['ক','খ','গ','ঘ','ঙ'];
function letter(i){ return LETTERS[i]||String(i+1); }
function keyLetter(i){ return 'ABCD'.charAt(i)||String(i+1); }

/* Bangla has no ordinal suffix to add: 'তম' does the whole job */
function ord(n){ return n+'তম'; }
/* Bangla nouns do not take a plural for a counted quantity */
function plural(n,one,many){ return n+' '+one; }

return {h:h, clamp:clamp, pct:pct, round:round, mins:mins, minsLong:minsLong, num:num, secs:secs, ago:ago,
        median:median, mean:mean, sum:sum, shuffle:shuffle, sample:sample, uniq:uniq, groupBy:groupBy,
        letter:letter, keyLetter:keyLetter, ord:ord, plural:plural};
})();
