/* ===========================================================
   GAME — one currency, three power-ups.

   Coins come from answers and nowhere else: 1 for each right answer,
   2 more for winning back a mistake, 5 for finishing a set. The shop
   sells only the three power-ups, for coins. There is no money in this
   app and nothing that makes a question itself easier to know.
   =========================================================== */
var GAME = (function(){

var PAY={right:1, won:2, set:5};

var POWER=[
  {id:'fifty',  cost:30, en:'50:50',           bn:'৫০:৫০',
   noteEn:'Removes two wrong options.',                       noteBn:'দুটি ভুল অপশন সরিয়ে দেয়।'},
  {id:'second', cost:20, en:'Second chance',   bn:'দ্বিতীয় সুযোগ',
   noteEn:'If you miss, answer the same question again. The miss still goes to the mistake bank.',
   noteBn:'ভুল হলে একই প্রশ্নে আবার উত্তর দাও। ভুলটি তবু ভুলের খাতায় যায়।'},
  {id:'plus30', cost:15, en:'+30 seconds',     bn:'+৩০ সেকেন্ড',
   noteEn:'Thirty more seconds on this question.',            noteBn:'এই প্রশ্নে আরও ৩০ সেকেন্ড।'}
];
function power(id){ for(var i=0;i<POWER.length;i++) if(POWER[i].id===id) return POWER[i]; return null; }
function pname(p){ return L(p.en, p.bn); }

function coins(){ return DB.state().coins||0; }
function add(n){
  var s=DB.state();
  s.coins=Math.max(0, (s.coins||0)+n);
  DB.save();
}
/* a line in the wallet: one per set, one per purchase */
function note(entry){
  var s=DB.state();
  entry.t=Date.now();
  s.wallet.push(entry);
  if(s.wallet.length>40) s.wallet=s.wallet.slice(-30);
  DB.save();
}
function recent(n){ return DB.state().wallet.slice(-(n||10)).reverse(); }

function have(id){ return DB.state().power[id]||0; }
function use(id){
  var s=DB.state();
  if(!(s.power[id]>0)) return false;
  s.power[id]--; DB.save(); return true;
}
function buy(id){
  var p=power(id), s=DB.state();
  if(!p) return {ok:false};
  if(coins()<p.cost) return {ok:false, short:p.cost-coins()};
  s.coins-=p.cost;
  s.power[id]=(s.power[id]||0)+1;
  note({k:'buy', p:id, n:-p.cost});
  DB.save();
  return {ok:true};
}

/* ---------- the streak shield: covers one missed day, at most two held ---------- */
var SHIELD={id:'shield', cost:50, max:2, en:'Streak shield', bn:'স্ট্রিক শিল্ড',
  noteEn:'Covers one missed day so the streak survives. You can hold two.',
  noteBn:'একদিন না পড়লেও স্ট্রিক বাঁচিয়ে রাখে। সর্বোচ্চ দুটি রাখা যায়।'};
function buyShield(){
  var s=DB.state();
  if(s.shields>=SHIELD.max) return {ok:false, full:true};
  if(coins()<SHIELD.cost) return {ok:false, short:SHIELD.cost-coins()};
  s.coins-=SHIELD.cost; s.shields++;
  note({k:'buy', p:'shield', n:-SHIELD.cost});
  DB.save();
  return {ok:true};
}

/* ---------- levels: from right answers alone, quick at first ---------- */
var LEVELS=[0,10,40,90,160,260,400,580,820,1120,1500,2000,2700,3600,5000];
var LEVEL_NAMES=[['Beginner','নবিশ'],['Learner','শিক্ষার্থী'],['Steady','অধ্যবসায়ী'],['Hard-working','পরিশ্রমী'],
  ['Capable','দক্ষ'],['Skilled','পারদর্শী'],['Sharp','তুখোড়'],['Bright','মেধাবী'],['Brilliant','প্রতিভাবান'],
  ['A+ ready','A+ প্রস্তুত'],['Golden A+','গোল্ডেন A+'],['Topper','টপার'],['Board star','বোর্ড তারকা'],
  ['Legend','কিংবদন্তি'],['Board stand','বোর্ড স্ট্যান্ড']];
function level(c){
  if(c===undefined||c===null) c=DB.state().correct||0;
  var i=0;
  while(i+1<LEVELS.length && c>=LEVELS[i+1]) i++;
  var from=LEVELS[i], to=i+1<LEVELS.length ? LEVELS[i+1] : null;
  return {lv:i+1, name:L(LEVEL_NAMES[i][0], LEVEL_NAMES[i][1]), from:from, to:to,
          left: to ? to-c : 0, p: to ? (c-from)/(to-from) : 1};
}

/* ---------- the daily goal: sets of 16, +10 coins the first time it is met ---------- */
var GOAL_PAY=10;
function goal(){
  var s=DB.state(), target=(s.settings.goalSets||2)*16, done=DB.actsToday().q;
  return {target:target, done:done, p:Math.min(1, done/target), met:done>=target};
}
/* true the moment the goal is met today, once */
function checkGoal(){
  var s=DB.state(), g=goal();
  if(!g.met || s.goalDay===DB.today()) return false;
  s.goalDay=DB.today(); s.goalDays=(s.goalDays||0)+1;
  add(GOAL_PAY); note({k:'goal', n:GOAL_PAY});
  DB.save();
  return true;
}

return {PAY:PAY, POWER:POWER, SHIELD:SHIELD, buyShield:buyShield, level:level, goal:goal, checkGoal:checkGoal, GOAL_PAY:GOAL_PAY, power:power, pname:pname, coins:coins, add:add, note:note, recent:recent,
        have:have, use:use, buy:buy};
})();
