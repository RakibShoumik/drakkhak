/* ===========================================================
   QUEST — the reasons to come back tomorrow.

   Daily and weekly goals, the question of the day, the streak and
   its repairs, the four days of the year worth marking, and the
   weekly account of what actually happened.

   Two things this file will not do, on purpose:
     · it will never punish you for a day you could not study —
       the streak can be frozen, repaired, and its record kept;
     · it will never nag. One reminder, at an hour you chose, and
       nothing at all if you chose no hour.
   =========================================================== */
var QUEST = (function(){

/* ---------- a stable random per day ---------- */
function seed(str){
  var h=2166136261>>>0;
  for(var i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619)>>>0; }
  return h>>>0;
}
function rng(s){
  return function(){ s|=0; s=s+0x6D2B79F5|0;
    var t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296; };
}
function pick(r, arr){ return arr[Math.floor(r()*arr.length)]; }

/* ---------- today's counters ----------
   A small bag that resets at midnight. The runner pushes into it;
   the quests read from it. */
function day(){
  var g=DB.game(), t=DB.today();
  if(!g.today || g.today.day!==t){
    g.today={day:t, q:0, right:0, combo:0, hard:0, fixed:0, golden:0,
             sets:0, good:0, topics:0, sure:0, breaks:0};
    DB.save();
  }
  return g.today;
}
function tick(k, n){
  var d=day();
  if(k==='combo') d.combo=Math.max(d.combo, n||0);
  else d[k]=(d[k]||0)+(n===undefined?1:n);
  DB.save();
}

/* ---------- the quest catalogue ----------
   Every goal is something the app can see you do. Nothing here can be
   satisfied by leaving a tab open. */
var POOL=[
  {id:'answer', size:[12,18,25], coins:20, xp:40,
   text:function(n){ return L('Answer '+n+' questions',n+'টি প্রশ্নের উত্তর দিন'); },
   prog:function(){ return day().q; }},

  {id:'right', size:[10,15,20], coins:25, xp:50,
   text:function(n){ return L('Get '+n+' right',n+'টি ঠিক করুন'); },
   prog:function(){ return day().right; }},

  {id:'combo', size:[5,7,10], coins:30, xp:60,
   text:function(n){ return L(n+' right in a row','পরপর '+n+'টি ঠিক'); },
   prog:function(){ return day().combo; }},

  {id:'fix', size:[3,5,8], coins:35, xp:70,
   text:function(n){ return L('Fix '+n+' from the mistake bank','ভুলের ব্যাংক থেকে '+n+'টি শুধরান'); },
   need:function(){ return GAME.mistakeBank().length>=3; },
   prog:function(){ return day().fixed; }},

  {id:'mins', size:[20,30,45], coins:20, xp:40,
   text:function(n){ return L('Study for '+n+' minutes',n+' মিনিট পড়ুন'); },
   prog:function(){ return Math.round(CLOCK.todayMins()); }},

  {id:'hard', size:[4,6,10], coins:35, xp:70,
   text:function(n){ return L('Get '+n+' Hard or Beast questions right','কঠিন বা দানব মানের '+n+'টি প্রশ্ন ঠিক'); },
   prog:function(){ return day().hard; }},

  {id:'sets', size:[1,2,3], coins:25, xp:50,
   text:function(n){ return L('Finish '+n+' practice sets',n+'টি অনুশীলন সেট শেষ করুন'); },
   prog:function(){ return day().sets; }},

  {id:'good', size:[1,2], coins:30, xp:60,
   text:function(n){ return L('Finish '+n+' sets at 80% or better','৮০% বা বেশি নিয়ে '+n+'টি সেট শেষ করুন'); },
   prog:function(){ return day().good; }},

  {id:'tricks', size:[2,3], coins:20, xp:40,
   text:function(n){ return L('Read '+n+' formula cards',n+'টি সূত্র-কার্ড পড়ুন'); },
   prog:function(){ return DB.actsToday().tricks; }},

  {id:'qotd', size:[1], coins:25, xp:50,
   text:function(){ return L('Answer the question of the day','আজকের প্রশ্নের উত্তর দিন'); },
   prog:function(){ var q=DB.game().qotd; return (q.day===DB.today() && q.ok!==null)?1:0; }},

  {id:'weak', size:[5,8], coins:30, xp:60,
   text:function(n, extra){ var nm=ICE.topics[extra]?ICE.tname(extra):extra; return L('Finish '+n+' questions in '+nm, nm+'-এ '+n+'টি প্রশ্ন শেষ করুন'); },
   need:function(){ return !!weakest(); },
   extra:function(){ var w=weakest(); return w||''; },
   prog:function(){ return day().topics; }}
];

function weakest(){
  var best=null, bs=101;
  for(var id in ICE.topics){
    if(ICE.topics[id].track!==DB.state().track) continue;
    if(AB.seen(id)<3) continue;
    var sc=AB.score({topic:id}).score;
    if(sc<bs){ bs=sc; best=id; }
  }
  return best;
}

/* difficulty of the day's goals scales with what this student actually does */
function tier(){
  var recent=DB.lastNDays(7).map(function(d){ return DB.actsOn(d.date).q; });
  var avg=U.mean(recent)||0;
  return avg>=30?2:avg>=12?1:0;
}

function daily(){
  var g=DB.game(), t=DB.today();
  if(g.quests.day!==t){
    var r=rng(seed(t+'|q')), usable=POOL.filter(function(p){ return !p.need || p.need(); });
    var chosen=[], tries=0;
    while(chosen.length<3 && tries++<60){
      var p=pick(r, usable);
      if(chosen.some(function(c){ return c.id===p.id; })) continue;
      var lvl=Math.min(p.size.length-1, tier());
      chosen.push({id:p.id, n:p.size[lvl], extra:p.extra?p.extra():''});
    }
    g.quests.day=t; g.quests.list=chosen; g.quests.claimed={};
    DB.save();
  }
  return g.quests.list.map(function(c, i){
    var p=byId(c.id); if(!p) return null;
    var got=p.prog(), done=got>=c.n;
    return {i:i, id:c.id, text:p.text(c.n, c.extra), n:c.n, got:Math.min(got,c.n),
            done:done, claimed:!!g.quests.claimed[i], coins:p.coins, xp:p.xp,
            chest:i===2};
  }).filter(Boolean);
}
function byId(id){ for(var i=0;i<POOL.length;i++) if(POOL[i].id===id) return POOL[i]; return null; }

function claim(i){
  var g=DB.game(), list=daily(), qq=list[i];
  if(!qq || !qq.done || qq.claimed) return false;
  g.quests.claimed[i]=1; DB.save();
  GAME.addCoins(qq.coins); GAME.addXP(qq.xp, 'quest');
  if(qq.chest) GAME.earnChest();
  FX.play('coin'); FX.confetti(40);
  UI.toast('<b>'+L('Quest done','কোয়েস্ট শেষ')+'</b> &middot; +'+qq.xp+' XP, +'+qq.coins+L(' coins',' কয়েন')+(qq.chest?L(', and a chest',', সাথে একটি সিন্দুক'):''), 3600);
  if(list.every(function(x,k){ return k===i || x.claimed; })) allThree();
  return true;
}
function allThree(){
  GAME.earnChest();
  FX.play('chest');
  UI.toast(L('<b>All three quests done</b> &mdash; a whole day. An extra chest.','<b>তিনটি কোয়েস্টই শেষ</b> &mdash; পুরো একটি দিন। বাড়তি একটি সিন্দুক।'), 4200);
}

/* ---------- the weekly ---------- */
function weekKey(d){
  d=d||new Date();
  var x=new Date(d.getTime()); x.setHours(0,0,0,0);
  x.setDate(x.getDate()-((x.getDay()+6)%7));      /* weeks start Monday */
  return DB.ymd(x);
}
var WEEKLY=[
  {id:'w-q',    n:[80,150,250], text:function(n){ return L('Answer '+n+' questions this week','এই সপ্তাহে '+n+'টি প্রশ্নের উত্তর দিন'); },
   prog:function(){ return weekSum('q'); }},
  {id:'w-days', n:[4,5,6],      text:function(n){ return L('Study on '+n+' days this week','এই সপ্তাহে '+n+' দিন পড়ুন'); },
   prog:function(){ return weekDays(); }},
  {id:'w-mins', n:[120,240,400],text:function(n){ return L('Study for '+Math.round(n/60)+' hours this week','এই সপ্তাহে '+Math.round(n/60)+' ঘণ্টা পড়ুন'); },
   prog:function(){ return Math.round(weekMins()); }},
  {id:'w-clear',n:[30,60,100],  text:function(n){ return L('Finish '+n+' questions for good','পাকাপাকিভাবে '+n+'টি প্রশ্ন শেষ করুন'); },
   prog:function(){ return weekCleared(); }}
];
function weekDates(){
  var k=weekKey(), out=[], i;
  for(i=0;i<7;i++){ var d=new Date(new Date(k+'T00:00:00').getTime()+i*864e5); out.push(DB.ymd(d)); }
  return out;
}
function weekSum(kind){
  return weekDates().reduce(function(a,d){ return a+DB.actsOn(d)[kind]; },0);
}
function weekDays(){
  return weekDates().filter(function(d){ return DB.DAY_MET(d); }).length;
}
function weekMins(){
  return weekDates().reduce(function(a,d){ var t=DB.state().time[d]; return a+(t?t.tot:0); },0);
}
function weekCleared(){
  var since=new Date(weekKey()+'T00:00:00').getTime(), s=DB.state(), n=0;
  for(var id in s.items){ var it=s.items[id]; if(it.cl && it.okT>=since) n++; }
  return n;
}
function weekly(){
  var g=DB.game(), k=weekKey();
  if(g.quests.wk!==k){
    var r=rng(seed(k+'|w')), w=pick(r, WEEKLY);
    g.quests.wk=k; g.quests.weekly={id:w.id, n:w.n[Math.min(2,tier())]}; g.quests.wclaimed=0;
    DB.save();
  }
  var def=null, i;
  for(i=0;i<WEEKLY.length;i++) if(WEEKLY[i].id===g.quests.weekly.id) def=WEEKLY[i];
  if(!def) return null;
  var n=g.quests.weekly.n, got=def.prog();
  return {text:def.text(n), n:n, got:Math.min(got,n), done:got>=n, claimed:!!g.quests.wclaimed};
}
function claimWeekly(){
  var w=weekly(); if(!w || !w.done || w.claimed) return false;
  DB.game().quests.wclaimed=1; DB.save();
  GAME.addCoins(120); GAME.addXP(250,'weekly'); GAME.earnChest(); GAME.earnChest();
  FX.play('chest'); FX.confetti(80);
  UI.toast(L('<b>Week complete</b> &middot; +250 XP, +120 coins, two chests.','<b>সপ্তাহ সম্পূর্ণ</b> &middot; +250 XP, +120 কয়েন, দুটি সিন্দুক।'), 4600);
  return true;
}

/* ---------- question of the day ----------
   One question, the same one for the whole day, a notch above your
   level. Fourteen days of results make a little grid. */
function qotd(){
  var g=DB.game(), t=DB.today();
  if(g.qotd.day!==t){
    var grid=(g.qotd.grid||[]).slice(-13);
    if(g.qotd.day && g.qotd.ok===null) grid.push(0);        /* a day skipped */
    g.qotd={day:t, ok:null, grid:grid, id:pickQotd(t)};
    DB.save();
  }
  if(!g.qotd.id){ g.qotd.id=pickQotd(t); DB.save(); }
  return {q:AB.q(g.qotd.id), ok:g.qotd.ok, grid:g.qotd.grid||[]};
}
function pickQotd(t){
  var track=DB.state().track;
  var pool=ICE.Q.filter(function(q){ return q._track===track && (q.b||0)>=ICE.EXAM_B; });
  if(!pool.length) pool=ICE.Q.filter(function(q){ return q._track===track; });
  if(!pool.length) return null;
  var r=rng(seed(t+'|qotd'));
  return pool[Math.floor(r()*pool.length)].id;
}
function answerQotd(ok){
  var g=DB.game();
  if(g.qotd.ok!==null) return;
  g.qotd.ok=ok?1:0;
  g.qotd.grid=(g.qotd.grid||[]).concat([ok?2:1]);
  g.qotdCount=(g.qotdCount||0)+1;
  DB.save();
  if(ok){ GAME.addXP(60,'question of the day'); GAME.addCoins(20); GAME.earnChest(); }
  else { GAME.addXP(15,'question of the day'); }
  GAME.check('qotd');
}
function gridText(){
  var g=(DB.game().qotd.grid||[]).slice(-14);
  return g.map(function(x){ return x===2?'■':x===1?'□':'·'; }).join('');
}

/* ---------- the streak, and how to keep it ---------- */
function streak(){
  var s=DB.state();
  return {live:DB.liveStreak(), best:s.best, freezes:s.freezes,
          met:DB.DAY_MET(DB.today()), repair:repairable()};
}
function repairable(){
  var s=DB.state();
  if(!s.lastDay || s.streak<2) return null;
  var gap=DB.daysBetween(s.lastDay, DB.today());
  if(gap<2 || gap>3) return null;                 /* only the day just lost */
  var wk=weekKey();
  if(s.repairWeek===wk) return null;              /* once a week, no more */
  return {days:gap-1, cost:40*(gap-1), streak:s.streak};
}
function repair(){
  var r=repairable(); if(!r) return false;
  if(!GAME.spend(r.cost)){ UI.toast(L('A repair costs '+r.cost+' coins. Earn them and come back.','মেরামতের দাম '+r.cost+'টি কয়েন। অর্জন করে ফিরে আসুন।')); return false; }
  var s=DB.state(), t=DB.today(), i;
  for(i=1;i<=r.days;i++){
    var d=new Date(new Date(t+'T00:00:00').getTime()-i*864e5);
    s.frozen[DB.ymd(d)]=1;
  }
  s.lastDay=DB.ymd(new Date(new Date(t+'T00:00:00').getTime()-864e5));
  s.repairWeek=weekKey();
  DB.save();
  FX.play('heart');
  UI.toast(L('<b>Streak repaired</b> &mdash; '+r.streak+' days, still alive.','<b>ধারা মেরামত হলো</b> &mdash; '+r.streak+' দিন, এখনও টিকে আছে।'), 4000);
  return true;
}
/* one earned freeze every seventh day of a live streak */
function streakGifts(){
  var s=DB.state(), n=DB.liveStreak(), g=DB.game();
  if(!n || n%7 || g.gaveFreeze===n) return null;
  g.gaveFreeze=n; s.freezes=Math.min(5, s.freezes+1); DB.save();
  FX.play('star');
  return {days:n, gift:L('a streak freeze','একটি ধারা-ফ্রিজ')};
}

/* ---------- days worth marking ---------- */
var EVENTS=[
  {md:'02-21', id:'ekushey',  name:'একুশে ফেব্রুয়ারি', en:'Ekushey February', note:'আন্তর্জাতিক মাতৃভাষা দিবস। সারাদিন দ্বিগুণ XP।', noteEn:'International Mother Language Day. Double XP all day.'},
  {md:'03-26', id:'indep',    name:'স্বাধীনতা দিবস',    en:'Independence Day', note:'সারাদিন দ্বিগুণ XP।', noteEn:'Double XP all day.'},
  {md:'04-14', id:'boishakh', name:'পহেলা বৈশাখ',      en:'Pohela Boishakh', note:'নতুন বছর। দ্বিগুণ XP, আর লক্ষ্য শেষ করলে একটি সিন্দুক।', noteEn:'The new year. Double XP, and a chest for meeting your goal.'},
  {md:'12-16', id:'victory',  name:'বিজয় দিবস',        en:'Victory Day', note:'সারাদিন দ্বিগুণ XP।', noteEn:'Double XP all day.'}
];
function event(){
  var t=DB.today().slice(5);
  for(var i=0;i<EVENTS.length;i++) if(EVENTS[i].md===t){ var e=EVENTS[i]; return {id:e.id, md:e.md, name:L(e.en,e.name), note:L(e.noteEn,e.note)}; }
  var d=PREDICT.daysTo('hsc'), days=(d===null||d<0)?9999:d;
  if(days<=7) return {id:'examweek', name:L('Exam week','পরীক্ষার সপ্তাহ'), note:L('Seven days or fewer to go. Everything counts double.','সাত দিন বা কম বাকি। সবকিছু দ্বিগুণ গোনা হচ্ছে।')};
  return null;
}
function eventDouble(){ return !!event(); }

/* ---------- the week, told back to you ---------- */
function wrapped(){
  var dates=weekDates(), prev=[], i;
  var pk=DB.ymd(new Date(new Date(weekKey()+'T00:00:00').getTime()-7*864e5));
  for(i=0;i<7;i++) prev.push(DB.ymd(new Date(new Date(pk+'T00:00:00').getTime()+i*864e5)));
  function sum(list, kind){ return list.reduce(function(a,d){ return a+DB.actsOn(d)[kind]; },0); }
  function mins(list){ return list.reduce(function(a,d){ var t=DB.state().time[d]; return a+(t?t.tot:0); },0); }
  var q=sum(dates,'q'), r=sum(dates,'right'), pq=sum(prev,'q'), pr=sum(prev,'right');
  var since=new Date(weekKey()+'T00:00:00').getTime();
  var log=DB.logSince(since), byTopic={};
  log.forEach(function(x){
    var b=byTopic[x.k]||(byTopic[x.k]={n:0,c:0});
    b.n++; if(x.ok) b.c++;
  });
  var best=null, worst=null;
  for(var k in byTopic){
    var b=byTopic[k]; if(b.n<5) continue;
    var acc=b.c/b.n;
    if(!best||acc>best.acc) best={id:k, acc:acc, n:b.n};
    if(!worst||acc<worst.acc) worst={id:k, acc:acc, n:b.n};
  }
  return {
    q:q, right:r, acc:q?r/q:0, mins:mins(dates), days:weekDays(),
    cleared:weekCleared(),
    prevQ:pq, prevAcc:pq?pr/pq:0, prevMins:mins(prev),
    best:best, worst:worst,
    week:weekKey()
  };
}

/* ---------- the gentle machinery ---------- */

/* An open loop: what you were in the middle of. */
function setLoop(loop){ DB.game().openLoop=loop; DB.save(); }
function loop(){ return DB.game().openLoop; }
function clearLoop(){ DB.game().openLoop=null; DB.save(); }

/* Coming back after a while away. No guilt, no lost record. */
function comeback(){
  var s=DB.state(), g=DB.game(), t=DB.today();
  if(!s.lastDay || g.lastOpen===t) return null;
  var gap=DB.daysBetween(s.lastDay, t);
  g.lastOpen=t; DB.save();
  if(gap<5) return null;
  g.comebackDay=t; DB.save();
  GAME.earnChest();
  return {days:gap, best:s.best};
}

/* A break, after three quarters of an hour at it. Suggested once. */
function breakDue(){
  if(DB.state().settings.breaks===false) return false;
  var m=CLOCK.sessionMinutes(), g=DB.game();
  var mark=Math.floor(m/45);
  if(mark>0 && mark>g.breakShown){ g.breakShown=mark; DB.save(); return true; }
  return false;
}

/* The reminder. Local only: it can fire while the app is open, and the
   settings copy says exactly that rather than pretending otherwise. */
var remTimer=null;
function armReminder(){
  if(remTimer) clearTimeout(remTimer);
  var h=DB.state().settings.reminderHour;
  if(h<0) return;
  var now=new Date(), at=new Date();
  at.setHours(h,0,0,0);
  if(at<=now) at=new Date(at.getTime()+864e5);
  remTimer=setTimeout(function(){
    if(!DB.DAY_MET(DB.today())) fire();
    armReminder();
  }, Math.min(at-now, 2147480000));
}
function fire(){
  var msg=L('Your usual time. '+PLAN.daysText(PLAN.track(DB.state().track).minutes)+' of study left.','আপনার চেনা সময়। '+PLAN.daysText(PLAN.track(DB.state().track).minutes)+' পড়া বাকি।');
  try{
    if(window.Notification && Notification.permission==='granted')
      new Notification('Drakkhak', {body:msg});
  }catch(e){}
  UI.toast('<b>'+msg+'</b>', 6000);
}
function askNotify(){
  try{ if(window.Notification && Notification.permission==='default') Notification.requestPermission(); }catch(e){}
}

return {
  day:day, tick:tick,
  daily:daily, claim:claim, weekly:weekly, claimWeekly:claimWeekly, weekKey:weekKey,
  qotd:qotd, answerQotd:answerQotd, gridText:gridText,
  streak:streak, repairable:repairable, repair:repair, streakGifts:streakGifts,
  EVENTS:EVENTS, event:event, eventDouble:eventDouble,
  wrapped:wrapped, weekDates:weekDates, weekMins:weekMins, weekDays:weekDays,
  setLoop:setLoop, loop:loop, clearLoop:clearLoop,
  comeback:comeback, breakDue:breakDue,
  armReminder:armReminder, askNotify:askNotify
};
})();
