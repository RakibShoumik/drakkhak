/* ===========================================================
   GAME — the layer that makes the work feel like something.

   Nothing here can be bought, faked or typed in. Every point, coin,
   star and badge comes from a question answered correctly, and the
   clock behind it still only counts minutes you were actually there
   for. That is the whole reason a reward means anything.

   Three rules this file keeps:
     · a reward is never worth more than the work behind it —
       harder questions pay more, fast guesses pay nothing;
     · nothing is ever taken away for being human (no lost streaks
       for a power cut, no timers that block practice);
     · a hard win should feel like one.
   =========================================================== */
var GAME = (function(){

/* ---------- levels: quick at first, slower later ---------- */
function need(L){ return 80 + (L-1)*30 + (L-1)*(L-1)*6; }
function levelOf(xp){
  var L=1, acc=0;
  while(L<200 && xp>=acc+need(L)){ acc+=need(L); L++; }
  return {level:L, into:xp-acc, need:need(L), floor:acc};
}
function level(){ return levelOf(DB.game().xp); }

/* ---------- how hard was that question ---------- */
var TIERS=[
  {id:'easy',  name:'সহজ', en:'Easy',  mult:0.6, cls:'t-easy'},
  {id:'exam',  name:'বোর্ড মান', en:'Board level',  mult:1.0, cls:'t-exam'},
  {id:'hard',  name:'কঠিন', en:'Hard',  mult:1.6, cls:'t-hard'},
  {id:'beast', name:'দানব', en:'Beast', mult:2.4, cls:'t-beast'}
];
function tierOf(b){
  b = typeof b==='number' ? b : 0;
  if(b < ICE.EXAM_B) return TIERS[0];
  if(b < ICE.HARD_B) return TIERS[1];
  if(b < 1.2) return TIERS[2];
  return TIERS[3];
}

/* ---------- is this a double-XP hour? ----------
   Friday morning for everyone, plus one personal hour: the hour of
   the day this student usually lets slip. */
function slackHour(){
  var agg=CLOCK.hourAgg(60), best=null, i;
  var awake=[8,9,10,11,14,15,16,17,20,21,22];
  for(i=0;i<awake.length;i++){ var h=awake[i]; if(best===null || agg[h]<agg[best]) best=h; }
  return best===null?16:best;
}
function doubleNow(){
  var d=new Date(), h=d.getHours();
  var ev=(typeof QUEST!=='undefined') ? QUEST.event() : null;
  if(ev) return ev.name;
  if(d.getDay()===5 && h>=6 && h<10) return L('Friday morning','শুক্রবার সকাল');
  if(h===slackHour()) return L('Your quiet hour','আপনার চুপচাপ ঘণ্টা');
  return null;
}

/* ---------- what one answer is worth ----------
   ctx: {q, ok, secs, timed, combo, golden, sure} */
function points(ctx){
  var q=ctx.q, t=tierOf(q.b), pace=AB.paceOf(q);
  if(!ctx.ok) return {xp: ctx.sure===true ? -8 : 0, coins:0, tier:t, parts:[]};
  var parts=[], xp=Math.round(10*t.mult);
  parts.push({k:t.name, v:xp});
  if(ctx.timed && ctx.secs<=pace*0.5){ var q1=Math.round(xp*0.5); xp+=q1; parts.push({k:L('Quick','দ্রুত'), v:q1}); }
  else if(ctx.timed && ctx.secs<=pace*0.75){ var q2=Math.round(xp*0.25); xp+=q2; parts.push({k:L('Brisk','ঝটপট'), v:q2}); }
  if(ctx.combo>1){ var cb=Math.min(20,(ctx.combo-1)*2); xp+=cb; parts.push({k:L('Streak','ধারা')+' &times;'+ctx.combo, v:cb}); }
  if(ctx.sure===true){ var sb=Math.round(xp*0.25); xp+=sb; parts.push({k:L('Called it','আগেই বলেছিলেন'), v:sb}); }
  if(ctx.sure===false){ xp=Math.round(xp*0.9); }
  if(ctx.golden){ xp*=5; parts.push({k:L('Golden &times;5','সোনালি &times;৫'), v:null}); }
  if(doubleNow()){ xp*=2; parts.push({k:L('Double XP','দ্বিগুণ XP'), v:null}); }
  return {xp:xp, coins: 1 + (ctx.golden?4:0) + (t.id==='beast'?2:t.id==='hard'?1:0), tier:t, parts:parts};
}

/* ---------- the ledger ---------- */
function addXP(n, why){
  if(!n) return null;
  var g=DB.game(), before=levelOf(g.xp).level;
  g.xp=Math.max(0, g.xp+n);
  if(g.season && g.season.id===seasonId() && n>0) g.season.xp+=n;
  DB.save();
  var after=levelOf(g.xp).level;
  if(after>before){ onLevel(after, why); return {leveled:true, level:after}; }
  return {leveled:false, level:after};
}
function addCoins(n){ var g=DB.game(); g.coins=Math.max(0, g.coins+(n||0)); DB.save(); }
function spend(n){ var g=DB.game(); if(g.coins<n) return false; g.coins-=n; DB.save(); return true; }

function onLevel(L, why){
  FX.play('levelup');
  var un=unlockedAt(L);
  if(un){ DB.game().unlocked[un.id]=Date.now(); DB.save(); }
  /* the shell shows a proper moment for it — straight away, or at the end
     of the set if a question is on screen */
  if(UI.celebrate) UI.celebrate({kind:'level', level:L, unlock:un, why:why});
  else UI.toast('<b>'+window.L('Level ','লেভেল ')+L+'</b>'+(un?' &mdash; '+un.name+window.L(' unlocked',' খুলল'):'' ), 4200);
  check('level');
}

/* ---------- features that arrive as you go ---------- */
var UNLOCKS=[
  {id:'blitz',    at:3,  name:'ব্লিটজ', en:'Blitz',          note:'ষাট সেকেন্ড, যতগুলো পারেন।'},
  {id:'survival', at:4,  name:'সারভাইভাল', en:'Survival',       note:'তিনটি ভুল উত্তর পর্যন্ত চলে।'},
  {id:'boss',     at:5,  name:'বস লড়াই', en:'Boss battles',        note:'হেলথ বার আর তিনটি হৃদয় নিয়ে একটি অধ্যায়ের পরীক্ষা।'},
  {id:'marathon', at:6,  name:'পূর্ণ পত্র', en:'Full paper',       note:'পুরো একটি পত্রের এমসিকিউ, আসল ঘড়িতে, উত্তরপত্রে দাগানো।'},
  {id:'ghost',    at:7,  name:'ঘোস্ট রেস', en:'Ghost race',       note:'কোনো অধ্যায়ে নিজের সেরা সময়ের সাথে দৌড়।'},
  {id:'duel',     at:8,  name:'দ্বৈরথ', en:'Duel',          note:'বন্ধুকে একই দশটি প্রশ্ন পাঠান।'},
  {id:'newgame',  at:10, name:'বোর্ড এমসিকিউ', en:'Board MCQ',    note:'শেষ করা একটি পত্র আবার, বোর্ডের হিসাবে।'}
];
function unlockedAt(L){ for(var i=0;i<UNLOCKS.length;i++) if(UNLOCKS[i].at===L) return UNLOCKS[i]; return null; }
function has(id){
  var u=null, i;
  for(i=0;i<UNLOCKS.length;i++) if(UNLOCKS[i].id===id) u=UNLOCKS[i];
  if(!u) return true;
  return level().level>=u.at;
}
function nextUnlock(){
  var L=level().level;
  for(var i=0;i<UNLOCKS.length;i++) if(UNLOCKS[i].at>L) return UNLOCKS[i];
  return null;
}

/* ---------- the rank ladder, in grades everyone here knows ---------- */
var RANKS=[
  {at:0,  name:'অবস্থান নেই', en:'Unranked'}, {at:33, name:'পাস', en:'Pass'}, {at:40, name:'C', en:'C'}, {at:50, name:'B', en:'B'},
  {at:60, name:'A', en:'A'}, {at:70, name:'A+', en:'A+'}, {at:85, name:'গোল্ডেন A+', en:'Golden A+'}, {at:95, name:'বোর্ড স্ট্যান্ড', en:'Board stand'}
];
function rankOf(score){
  var r=RANKS[0];
  for(var i=0;i<RANKS.length;i++) if(score>=RANKS[i].at) r=RANKS[i];
  return r;
}
function nextRank(score){
  for(var i=0;i<RANKS.length;i++) if(score<RANKS[i].at) return RANKS[i];
  return null;
}

/* ---------- a rating you can watch move ---------- */
function rating(secKey){
  var st=AB.sectionTheta(secKey);
  return Math.round(U.clamp(1000+st.th*180, 600, 2200));
}

/* ---------- records ---------- */
var RECORDS={
  combo:{name:'সবচেয়ে লম্বা ধারা', en:'Longest streak', unit:'পরপর', unitEn:'in a row', up:true},
  setTime:{name:'দ্রুততম সেট', en:'Fastest set', unit:'প্রতি প্রশ্নে', unitEn:'per question', up:false},
  blitz:{name:'সেরা ব্লিটজ', en:'Best blitz', unit:'৬০ সেকেন্ডে', unitEn:'in 60 seconds', up:true},
  survival:{name:'দীর্ঘতম সারভাইভাল', en:'Longest survival', unit:'তিন ভুলের আগে', unitEn:'before three misses', up:true},
  day:{name:'সেরা দিন', en:'Best day', unit:'প্রশ্ন', unitEn:'questions', up:true},
  clean:{name:'দীর্ঘতম নির্ভুল সেট', en:'Longest clean set', unit:'প্রশ্ন, একটিও ভুল নয়', unitEn:'questions, none wrong', up:true}
};
function record(id, v){
  var g=DB.game(), cur=g.records[id], meta=RECORDS[id];
  if(!meta || !isFinite(v)) return false;
  var better = !cur || (meta.up ? v>cur.v : v<cur.v);
  if(!better) return false;
  var first=!cur;
  g.records[id]={v:v, t:Date.now()}; DB.save();
  if(!first){ FX.play('star'); UI.toast('<b>'+L('New record','নতুন রেকর্ড')+'</b> &middot; '+meta.name+': '+fmtRecord(id,v), 3600); }
  return true;
}
function fmtRecord(id, v){
  if(id==='setTime') return U.secs(v)+L(' per question',' প্রতি প্রশ্নে');
  return String(Math.round(v))+' '+RECORDS[id].unit;
}

/* ---------- stars, three to a chapter ----------
   Stars measure one thing: how much of the chapter is DONE (answered
   right inside its minute, and — after any miss — right again on a
   later day). A third done is one star, two thirds two, all of it
   three. Nothing else moves them, so a star can only be earned by
   the same work that shortens the days left. A chapter whose
   questions are not written yet has no stars to give. */
var STAR_AT=[1/3, 2/3, 1];
function stars(topicId){
  var px=PLAN.topic(topicId);
  var out={n:0, done:0, total:0, soon:false, next:null};
  if(!px) return out;
  out.total=px.total; out.done=px.cleared; out.soon=!!px.est;
  if(px.est || !px.total) return out;
  var f=px.cleared/px.total, i;
  for(i=0;i<STAR_AT.length;i++) if(f>=STAR_AT[i]-1e-9) out.n=i+1;
  if(out.n<3) out.next=Math.ceil(STAR_AT[out.n]*px.total)-px.cleared;   /* questions to the next star */
  return out;
}
function markHintUsed(topicId){
  var g=DB.game(); (g.stars[topicId]=g.stars[topicId]||{}).hint=1; DB.save();
}

/* ---------- collections ---------- */
function unlockTrick(id){
  var g=DB.game();
  if(!id || g.cards.tricks[id]) return false;
  g.cards.tricks[id]=Date.now(); DB.save();
  var t=AB.trick(id);
  if(t){ FX.play('badge'); UI.toast('<b>'+L('Card unlocked','কার্ড খুলল')+'</b> &middot; '+U.h(t.name), 3600); }
  return true;
}
function unlockTopicCard(topicId){
  var g=DB.game();
  if(g.cards.topics[topicId]) return false;
  g.cards.topics[topicId]=Date.now(); DB.save();
  FX.play('badge');
  UI.toast('<b>'+L('Chapter card earned','অধ্যায়ের কার্ড পেলেন')+'</b> &middot; '+U.h(ICE.tname(topicId)), 3600);
  return true;
}
function collection(track){
  var tricks=AB.allTricks(track), g=DB.game();
  var tops=[]; for(var id in ICE.topics) if(ICE.topics[id].track===track) tops.push(ICE.topics[id]);
  return {
    tricks:{total:tricks.length, got:tricks.filter(function(t){ return g.cards.tricks[t.id]; }).length, list:tricks},
    topics:{total:tops.length, got:tops.filter(function(t){ return g.cards.topics[t.id]; }).length, list:tops}
  };
}

/* ---------- chests: earned only, never sold ---------- */
var CHEST=[
  {id:'coins',  w:44, rare:0, give:function(){ var n=10+Math.floor(Math.random()*25); addCoins(n); return n+L(' coins','টি কয়েন'); }},
  {id:'xp',     w:26, rare:0, give:function(){ var n=40+Math.floor(Math.random()*60); addXP(n,'chest'); return n+' XP'; }},
  {id:'fifty',  w:12, rare:1, give:function(){ DB.game().lifelines.fifty++; DB.save(); return L('A 50:50 lifeline','একটি ৫০:৫০ লাইফলাইন'); }},
  {id:'trickL', w:10, rare:1, give:function(){ DB.game().lifelines.trick++; DB.save(); return L('A card lifeline','একটি কার্ড-লাইফলাইন'); }},
  {id:'freeze', w:6,  rare:1, give:function(){ var s=DB.state(); s.freezes++; DB.save(); return L('A streak freeze','একটি ধারা-ফ্রিজ'); }},
  {id:'skin',   w:2,  rare:2, give:function(){ var c=randomLockedCosmetic(); if(!c) { addCoins(60); return L('60 coins','৬০টি কয়েন'); }
                                               DB.game().own[c.id]=1; DB.save(); return c.name; }}
];
function earnChest(){ var g=DB.game(); g.chests++; DB.save(); }
function openChest(){
  var g=DB.game();
  if(g.chests<=0) return null;
  g.chests--; g.opened++;
  /* pity: five plain chests in a row and the next one is guaranteed rare */
  var pool = g.dry>=4 ? CHEST.filter(function(c){ return c.rare; }) : CHEST;
  var total=0, i; for(i=0;i<pool.length;i++) total+=pool[i].w;
  var r=Math.random()*total, pick=pool[0];
  for(i=0;i<pool.length;i++){ r-=pool[i].w; if(r<=0){ pick=pool[i]; break; } }
  g.dry = pick.rare ? 0 : g.dry+1;
  var text=pick.give();
  DB.save();
  FX.play('chest'); if(pick.rare) FX.confetti(50);
  check('chest');
  return {rare:pick.rare, text:text};
}

/* ---------- cosmetics, bought with coins you studied for ---------- */
var COSMETICS=[
  {id:'owl',    kind:'avatar', name:'পেঁচা', en:'Owl',       cost:0,   art:'&#129417;'},
  {id:'tiger',  kind:'avatar', name:'বাঘ', en:'Tiger',        cost:120, art:'&#128005;'},
  {id:'rocket', kind:'avatar', name:'রকেট', en:'Rocket',       cost:180, art:'&#128640;'},
  {id:'lamp',   kind:'avatar', name:'হারিকেন', en:'Hurricane lamp',     cost:150, art:'&#129684;'},
  {id:'boat',   kind:'avatar', name:'নৌকা', en:'Boat',       cost:220, art:'&#128676;'},
  {id:'plain',  kind:'frame',  name:'সাদামাটা ফ্রেম', en:'Plain frame',cost:0},
  {id:'brass',  kind:'frame',  name:'পিতলের ফ্রেম', en:'Brass frame',cost:200},
  {id:'jade',   kind:'frame',  name:'জেড ফ্রেম', en:'Jade frame', cost:320},
  {id:'ember',  kind:'frame',  name:'অঙ্গার ফ্রেম', en:'Ember frame',cost:450},
  {id:'journal',kind:'pack',   name:'খাতার শব্দ', en:'Notebook sounds', cost:0},
  {id:'arcade', kind:'pack',   name:'আর্কেড শব্দ', en:'Arcade sounds',  cost:260},
  {id:'soft',   kind:'pack',   name:'নরম শব্দ', en:'Soft sounds',    cost:260}
];
function owns(id){ var c=byId(id); return !!(c && (c.cost===0 || DB.game().own[id])); }
function byId(id){ for(var i=0;i<COSMETICS.length;i++) if(COSMETICS[i].id===id) return COSMETICS[i]; return null; }
function randomLockedCosmetic(){
  var locked=COSMETICS.filter(function(c){ return c.cost>0 && !DB.game().own[c.id]; });
  return locked.length ? locked[Math.floor(Math.random()*locked.length)] : null;
}
function buy(id){
  var c=byId(id); if(!c || owns(id)) return false;
  if(!spend(c.cost)){ UI.toast(L('Not enough coins &mdash; you need '+(c.cost-DB.game().coins)+' more.','কয়েন যথেষ্ট নয় &mdash; আরও '+(c.cost-DB.game().coins)+'টি দরকার।')); return false; }
  DB.game().own[id]=1; DB.save(); FX.play('coin');
  UI.toast('<b>'+U.h(c.name)+'</b>'+L(' is yours now.',' এখন আপনার।'));
  return true;
}
function wear(id){
  var c=byId(id); if(!c || !owns(id)) return false;
  DB.game().wear[c.kind]=id; DB.save();
  if(c.kind==='pack') FX.setPack(id);
  return true;
}
function worn(kind){ return byId(DB.game().wear[kind]) || byId({avatar:'owl', frame:'plain', pack:'journal'}[kind]); }

/* ---------- what you have built ---------- */
function storedValue(){
  var g=DB.game(), s=DB.state();
  var fixed=0; for(var id in s.items){ var it=s.items[id]; if(it.miss && it.cl) fixed++; }
  var badges=Object.keys(g.badges).length;
  return {
    answered:g.answered, correct:g.correct, fixed:fixed, badges:badges,
    minutes:DB.totalMins(), streak:DB.liveStreak(), best:s.best,
    level:level().level, coins:g.coins,
    cards:Object.keys(g.cards.tricks).length+Object.keys(g.cards.topics).length
  };
}

/* ---------- badges ----------
   Rarity is about how much work each one takes, never about luck. */
var BADGES=[
  {id:'first',    r:'common', name:'প্রথম রক্ত', en:'First blood',        note:'প্রথম প্রশ্নের উত্তর দিন।', noteEn:'Answer your first question.',            test:function(s,g){ return g.answered>=1; }},
  {id:'ten',      r:'common', name:'দশ শেষ', en:'Ten down',           note:'দশটি প্রশ্নের উত্তর দিন।', noteEn:'Answer ten questions.',                  test:function(s,g){ return g.answered>=10; }},
  {id:'hundred',  r:'common', name:'শতক', en:'Century',            note:'একশোটি প্রশ্নের উত্তর দিন।', noteEn:'Answer a hundred questions.',            test:function(s,g){ return g.answered>=100; }},
  {id:'fiveC',    r:'rare',   name:'পাঁচশো', en:'Five hundred',       note:'পাঁচশোটি প্রশ্নের উত্তর দিন।', noteEn:'Answer five hundred questions.',         test:function(s,g){ return g.answered>=500; }},
  {id:'thousand', r:'epic',   name:'হাজারের ক্লাব', en:'The thousand club',      note:'এক হাজার প্রশ্নের উত্তর দিন।', noteEn:'Answer a thousand questions.',           test:function(s,g){ return g.answered>=1000; }},
  {id:'combo5',   r:'common', name:'ধারায় আছেন', en:'On a roll',           note:'পরপর পাঁচটি ঠিক।', noteEn:'Five right in a row.',                 test:function(s,g){ return g.bestCombo>=5; }},
  {id:'combo10',  r:'rare',   name:'পরপর দশ', en:'Ten in a row',       note:'পরপর দশটি ঠিক।', noteEn:'Ten right in a row.',                  test:function(s,g){ return g.bestCombo>=10; }},
  {id:'combo20',  r:'epic',   name:'পরপর বিশ', en:'Twenty in a row',    note:'পরপর বিশটি ঠিক।', noteEn:'Twenty right in a row.',               test:function(s,g){ return g.bestCombo>=20; }},
  {id:'perfect',  r:'rare',   name:'নির্ভুল সেট', en:'Clean set',        note:'একটি সেট একটিও ভুল ছাড়া শেষ করুন।', noteEn:'Finish a set without a single mistake.',    test:function(s,g,c){ return c.e==='set' && c.perfect; }},
  {id:'perfect3', r:'epic',   name:'পরপর তিন', en:'Three clean',     note:'পরপর তিনটি নির্ভুল সেট।', noteEn:'Three clean sets in a row.',             test:function(s,g,c){ return c.e==='set' && c.cleanRun>=3; }},
  {id:'beast5',   r:'epic',   name:'দানব বশে', en:'Beast tamer',        note:'পরপর দশটি দানব প্রশ্ন ঠিক।', noteEn:'Ten Beast questions right in a row.',    secret:true, test:function(s,g,c){ return c.e==='answer' && c.beastRun>=10; }},
  {id:'speed',    r:'rare',   name:'ঘড়ির নিচে', en:'Under the clock',    note:'এমন একটি সেট যেখানে প্রতিটি উত্তরই সময়ের ভিতরে।', noteEn:'A set where every answer is inside its time.', test:function(s,g,c){ return c.e==='set' && c.allFast && c.n>=8; }},
  {id:'level5',   r:'common', name:'লেভেল পাঁচ', en:'Level five',         note:'লেভেল ৫-এ পৌঁছান।', noteEn:'Reach level 5.',                         test:function(s,g){ return levelOf(g.xp).level>=5; }},
  {id:'level10',  r:'rare',   name:'লেভেল দশ', en:'Level ten',          note:'লেভেল ১০-এ পৌঁছান।', noteEn:'Reach level 10.',                        test:function(s,g){ return levelOf(g.xp).level>=10; }},
  {id:'level20',  r:'epic',   name:'লেভেল বিশ', en:'Level twenty',       note:'লেভেল ২০-এ পৌঁছান।', noteEn:'Reach level 20.',                        test:function(s,g){ return levelOf(g.xp).level>=20; }},
  {id:'streak7',  r:'common', name:'এক সপ্তাহ টানা', en:'A week straight',     note:'সাত দিনের ধারা।', noteEn:'A seven-day streak.',                    test:function(s){ return s.best>=7; }},
  {id:'streak30', r:'rare',   name:'এক মাস টানা', en:'A month straight',    note:'ত্রিশ দিনের ধারা।', noteEn:'A thirty-day streak.',                   test:function(s){ return s.best>=30; }},
  {id:'streak100',r:'legend', name:'একশো দিন', en:'A hundred days',     note:'একশো দিনের ধারা।', noteEn:'A hundred-day streak.',                  test:function(s){ return s.best>=100; }},
  {id:'fix10',    r:'common', name:'পাওনা আদায়', en:'Debts collected',     note:'আগে ভুল করা দশটি প্রশ্ন শুধরে নিন।', noteEn:'Correct ten questions you once got wrong.',      test:function(s,g,c){ return storedValue().fixed>=10; }},
  {id:'fix100',   r:'epic',   name:'আর কিছু বাকি নেই', en:'Nothing owed', note:'একশোটি পুরোনো ভুল শুধরান।', noteEn:'Correct a hundred old mistakes.',            test:function(s,g,c){ return storedValue().fixed>=100; }},
  {id:'empty',    r:'legend', name:'প্রতিশোধ সম্পূর্ণ', en:'Revenge complete',   note:'ভুলের ব্যাংক একেবারে খালি করুন।', noteEn:'Empty the mistake bank completely.',       test:function(s,g,c){ return c.e==='set' && mistakeBank().length===0 && g.answered>50; }},
  {id:'hour',     r:'common', name:'এক ঘণ্টা হলো', en:'An hour in',         note:'মাপা এক ঘণ্টার পড়া।', noteEn:'One measured hour of study.',            test:function(){ return DB.totalMins()>=60; }},
  {id:'tenhours', r:'rare',   name:'দশ ঘণ্টা', en:'Ten hours',          note:'মাপা দশ ঘণ্টার পড়া।', noteEn:'Ten measured hours of study.',           test:function(){ return DB.totalMins()>=600; }},
  {id:'fifty',    r:'legend', name:'পঞ্চাশ ঘণ্টা', en:'Fifty hours',        note:'মাপা পঞ্চাশ ঘণ্টার পড়া।', noteEn:'Fifty measured hours of study.',         test:function(){ return DB.totalMins()>=3000; }},
  {id:'tricks10', r:'common', name:'পাঠক', en:'Reader',             note:'দশটি কার্ড পড়ুন।', noteEn:'Read ten cards.',                  test:function(s){ return Object.keys(s.readTricks).length>=10; }},
  {id:'tricksAll',r:'epic',   name:'সব কার্ড', en:'Every card',     note:'একটি পত্রের সব কার্ড পড়ুন।', noteEn:'Read every card for one paper.',           test:function(s){
     /* one paper's worth is the badge: 122 chapters of cards is a year, not an achievement */
     return ICE.sectionsOf('hsc').some(function(sec){
       var all=AB.allTricks('hsc').filter(function(x){
         var tp=ICE.topics[x.topic]; return tp && tp.sec==='hsc/'+sec.id; });
       return all.length>=5 && all.every(function(x){ return s.readTricks[x.id]; });
     }); }},
  {id:'cards25',  r:'rare',   name:'সংগ্রাহক', en:'Collector',          note:'ব্যবহার করে পঁচিশটি কার্ড খুলুন।', noteEn:'Unlock twenty-five cards by using them.', test:function(s,g){ return Object.keys(g.cards.tricks).length>=25; }},
  {id:'topic1',   r:'common', name:'প্রথম অধ্যায় শেষ', en:'First chapter done',   note:'একটি অধ্যায়ের সব প্রশ্ন শেষ করুন।', noteEn:'Finish every question in a chapter.',      test:function(s,g){ return Object.keys(g.cards.topics).length>=1; }},
  {id:'topic5',   r:'rare',   name:'পাঁচ অধ্যায় শেষ', en:'Five chapters done',   note:'পাঁচটি অধ্যায় শেষ করুন।', noteEn:'Finish five chapters.',                    test:function(s,g){ return Object.keys(g.cards.topics).length>=5; }},
  {id:'section',  r:'legend', name:'পত্র শেষ', en:'Paper done',    note:'একটি পূর্ণ পত্রের সব প্রশ্ন শেষ করুন।', noteEn:'Finish every question in a whole paper.', test:function(){
     for(var k in ICE.sections){ var p=PLAN.section(k); if(p.total>20 && p.cleared===p.total) return true; } return false; }},
  {id:'boss1',    r:'rare',   name:'বস কুপোকাত', en:'Boss down',          note:'একটি বস লড়াই জিতুন।', noteEn:'Win a boss battle.',                     test:function(s,g,c){ return c.e==='set' && c.mode==='boss' && c.won; }},
  {id:'bossNoHit',r:'epic',   name:'অক্ষত', en:'Untouched',          note:'একটি হৃদয়ও না হারিয়ে বস লড়াই জিতুন।', noteEn:'Win a boss battle without losing a heart.', secret:true, test:function(s,g,c){ return c.e==='set' && c.mode==='boss' && c.won && c.hearts===3; }},
  {id:'blitz20',  r:'rare',   name:'ব্লিটজে বিশ', en:'Twenty in a blitz',       note:'এক ব্লিটজে বিশটি ঠিক।', noteEn:'Twenty right in one blitz.',        test:function(s,g,c){ return c.e==='set' && c.mode==='blitz' && c.right>=20; }},
  {id:'survive25',r:'epic',   name:'টিকে গেছেন', en:'Survivor',           note:'সারভাইভালে পঁচিশটি প্রশ্ন।', noteEn:'Twenty-five questions in survival.',     test:function(s,g,c){ return c.e==='set' && c.mode==='survival' && c.n>=25; }},
  {id:'marathon', r:'epic',   name:'পূর্ণ পত্র', en:'Full paper',         note:'একটি পূর্ণ পত্র শেষ করুন।', noteEn:'Finish a full paper.',             test:function(s,g,c){ return c.e==='set' && c.mode==='mock' && c.n>=20; }},
  {id:'ghostWin', r:'rare',   name:'ঘোস্টকে হারানো', en:'Ghost beaten',     note:'কোনো অধ্যায়ে নিজের সেরা সময় ছাড়িয়ে যান।', noteEn:'Beat your own best time in a chapter.',    test:function(s,g,c){ return c.e==='set' && c.mode==='ghost' && c.won; }},
  {id:'duel',     r:'rare',   name:'প্রতিদ্বন্দ্বী', en:'Rival',         note:'একটি দ্বৈরথ শেষ করুন।', noteEn:'Finish a duel.',                         test:function(s,g,c){ return c.e==='set' && c.mode==='duel'; }},
  {id:'qotd',     r:'common', name:'আজকের প্রশ্ন', en:'Question of the day',note:'আজকের প্রশ্নের উত্তর দিন।', noteEn:'Answer the question of the day.',        test:function(s,g){ return g.qotd && g.qotd.ok!==null && g.qotd.day===DB.today(); }},
  {id:'qotd7',    r:'epic',   name:'সাত দিন ধরে', en:'Seven of them',   note:'আজকের প্রশ্নের উত্তর সাতবার দিন।', noteEn:'Answer the question of the day seven times.', test:function(s,g){ return (g.qotdCount||0)>=7; }},
  {id:'night',    r:'rare',   name:'ভোরের পালা', en:'Dawn shift',         note:'সকাল ছয়টার আগে পড়ুন।', noteEn:'Study before six in the morning.',       secret:true, test:function(){ return new Date().getHours()<6 && CLOCK.todayMins()>=5; }},
  {id:'comeback', r:'rare',   name:'আবার কাজে', en:'Back at it',         note:'এক সপ্তাহ পর ফিরে একটি সেট শেষ করুন।', noteEn:'Come back after a week and finish a set.', secret:true, test:function(s,g,c){ return c.e==='set' && c.comeback; }},
  {id:'goldHit',  r:'rare',   name:'সোনার খনি', en:'Gold mine',          note:'একটি সোনালি প্রশ্ন ঠিক করুন।', noteEn:'Get a golden question right.',    test:function(s,g,c){ return c.e==='answer' && c.golden && c.ok; }},
  {id:'sure20',   r:'epic',   name:'ভালো বিচারবুদ্ধি', en:'Good judgement',     note:'পরপর বিশবার "নিশ্চিত" বলে ঠিক করুন।', noteEn:'Say "sure" and be right twenty times in a row.',    secret:true, test:function(s,g){ return (g.sureRun||0)>=20; }},
  {id:'thousandth',r:'legend',name:'হাজারতম', en:'The thousandth',            note:'আপনার হাজারতম সঠিক উত্তর।', noteEn:'Your thousandth correct answer.',        secret:true, test:function(s,g){ return g.correct>=1000; }},
  {id:'allstars', r:'legend', name:'তিন তারা', en:'Three stars',           note:'দশটি অধ্যায়ে তিন তারা।', noteEn:'Three stars in ten chapters.',             test:function(){
     var n=0; for(var id in ICE.topics){ if(stars(id).n===3) n++; } return n>=10; }}
];
function badge(id){ for(var i=0;i<BADGES.length;i++) if(BADGES[i].id===id) return BADGES[i]; return null; }
function rarityRank(r){ return {common:0, rare:1, epic:2, legend:3}[r]||0; }
function check(ev, ctx){
  ctx=ctx||{}; ctx.e=ev;
  var s=DB.state(), g=DB.game(), earned=[];
  for(var i=0;i<BADGES.length;i++){
    var b=BADGES[i];
    if(g.badges[b.id]) continue;
    var ok=false;
    try{ ok=b.test(s,g,ctx); }catch(e){ ok=false; }
    if(ok){ g.badges[b.id]=Date.now(); earned.push(b); }
  }
  if(earned.length){
    DB.save();
    FX.play('badge');
    if(earned.some(function(b){ return rarityRank(b.r)>=2; })) FX.confetti(70);
    earned.forEach(function(b, i){
      setTimeout(function(){
        UI.toast('<b>'+(b.secret?L('Secret badge','গোপন ব্যাজ'):L('Badge','ব্যাজ'))+'</b> &middot; '+U.h(b.name)+' &mdash; '+U.h(b.note), 4200);
      }, i*900);
    });
  }
  return earned;
}

/* ---------- the mistake bank ---------- */
function mistakeBank(track){
  var s=DB.state(), out=[];
  for(var id in s.items){
    var it=s.items[id];
    if(!it.miss || it.cl) continue;
    var q=AB.q(id); if(!q) continue;
    if(track && q._track!==track) continue;
    out.push(q);
  }
  return out;
}

/* ---------- how fresh a topic is (the decay the plan already implies) ---------- */
function freshness(topicId){
  var last=DB.state().lastSeen[topicId];
  if(!last) return null;
  var days=(Date.now()-last)/864e5;
  return U.clamp(1-(days-3)/30, 0, 1);       /* full for three days, then fades over a month */
}
function stale(track, limit){
  var out=[];
  for(var id in ICE.topics){
    if(track && ICE.topics[id].track!==track) continue;
    var f=freshness(id);
    if(f!==null && f<0.6 && AB.seen(id)>=5) out.push({id:id, f:f});
  }
  out.sort(function(a,b){ return a.f-b.f; });
  return limit? out.slice(0,limit) : out;
}

/* ---------- seasons, four weeks at a time ---------- */
function seasonId(){
  var d=new Date(DB.state().firstOpen+'T00:00:00');
  if(isNaN(d.getTime())) d=new Date();
  var weeks=Math.floor((Date.now()-d.getTime())/(7*864e5));
  return 'S'+(Math.floor(weeks/4)+1);
}
var SEASON_TRACK=[
  {at:200,  give:'৮০টি কয়েন', en:'80 coins',      act:function(){ addCoins(80); }},
  {at:600,  give:'একটি সিন্দুক', en:'A chest',     act:function(){ earnChest(); }},
  {at:1200, give:'একটি ৫০:৫০', en:'A 50:50',      act:function(){ DB.game().lifelines.fifty++; }},
  {at:2000, give:'২০০টি কয়েন', en:'200 coins',      act:function(){ addCoins(200); }},
  {at:3200, give:'দুটি সিন্দুক', en:'Two chests',      act:function(){ earnChest(); earnChest(); }},
  {at:5000, give:'একটি দুর্লভ ফ্রেম', en:'A rare frame',  act:function(){ DB.game().own.jade=1; }}
];
function season(){
  var g=DB.game(), id=seasonId();
  if(g.season.id!==id){ g.season={id:id, xp:0, claimed:{}}; DB.save(); }
  return {id:id, xp:g.season.xp, track:SEASON_TRACK, claimed:g.season.claimed};
}
function claimSeason(i){
  var g=DB.game(), s=season(), step=SEASON_TRACK[i];
  if(!step || g.season.claimed[i] || s.xp<step.at) return false;
  g.season.claimed[i]=1; step.act(); DB.save();
  FX.play('chest'); UI.toast('<b>'+L('Season reward','মৌসুমের পুরস্কার')+'</b> &middot; '+step.give);
  return true;
}

/* ---------- identity ---------- */
var DREAMS=[
  {id:'aplus',  name:'সব পত্রে A+', en:'A+ in every paper',              title:'A+ প্রার্থী', titleEn:'A+ candidate',      track:'hsc'},
  {id:'medical',name:'মেডিকেল ভর্তি পরীক্ষা', en:'Medical admission test',     title:'ভাবী ডাক্তার', titleEn:'Future doctor',     track:'hsc'},
  {id:'buet',   name:'বুয়েট বা প্রকৌশল ভর্তি', en:'BUET or engineering admission',    title:'ভাবী ইঞ্জিনিয়ার', titleEn:'Future engineer',  track:'hsc'},
  {id:'varsity',name:'বিশ্ববিদ্যালয় ভর্তি পরীক্ষা', en:'University admission test', title:'ভাবী বিশ্ববিদ্যালয় শিক্ষার্থী', titleEn:'Future university student', track:'hsc'}
];
function dream(){ var d=DB.game().dream; for(var i=0;i<DREAMS.length;i++) if(DREAMS[i].id===d) return DREAMS[i]; return null; }
function setDream(id){ DB.game().dream=id; var d=dream(); if(d) DB.game().title=d.title; DB.save(); }

/* ---------- honest urgency: the exam date against days of content ---------- */
function urgency(track){
  var days=PREDICT.daysTo(track);
  var left=PLAN.days(PLAN.track(track).minutes);
  if(days===null) return {days:null, left:left};
  var gap=left-days;
  var hoursNeeded = days>0 ? (PLAN.track(track).minutes/days)/60 : null;
  return {days:days, left:left, gap:gap, behind:gap>0, hoursNeeded:hoursNeeded};
}

/* Every table above carries its Bangla name and an English one. These
   getters make .name (and .note, .unit, .give, .title) answer in whatever
   language the interface is set to, so a switch in Settings reaches every
   badge and record without a reload. */
function bilingual(list, pairs){
  list.forEach(function(o){
    pairs.forEach(function(pr){
      var bn=o[pr[0]], en=o[pr[1]];
      if(bn===undefined || en===undefined) return;
      Object.defineProperty(o, pr[0], {get:function(){ return L(en, bn); }, enumerable:true, configurable:true});
    });
  });
}
bilingual(TIERS, [['name','en']]);
bilingual(UNLOCKS, [['name','en'],['note','noteEn']]);
bilingual(RANKS, [['name','en']]);
bilingual(Object.keys(RECORDS).map(function(k){ return RECORDS[k]; }), [['name','en'],['unit','unitEn']]);
bilingual(COSMETICS, [['name','en']]);
bilingual(BADGES, [['name','en'],['note','noteEn']]);
bilingual(SEASON_TRACK, [['give','en']]);
bilingual(DREAMS, [['name','en'],['title','titleEn']]);

return {
  need:need, levelOf:levelOf, level:level,
  TIERS:TIERS, tierOf:tierOf, points:points, doubleNow:doubleNow, slackHour:slackHour,
  addXP:addXP, addCoins:addCoins, spend:spend,
  UNLOCKS:UNLOCKS, has:has, nextUnlock:nextUnlock,
  RANKS:RANKS, rankOf:rankOf, nextRank:nextRank, rating:rating,
  RECORDS:RECORDS, record:record, fmtRecord:fmtRecord,
  stars:stars, STAR_AT:STAR_AT, markHintUsed:markHintUsed,
  unlockTrick:unlockTrick, unlockTopicCard:unlockTopicCard, collection:collection,
  earnChest:earnChest, openChest:openChest,
  COSMETICS:COSMETICS, owns:owns, buy:buy, wear:wear, worn:worn, cosmetic:byId,
  storedValue:storedValue,
  BADGES:BADGES, badge:badge, rarityRank:rarityRank, check:check,
  mistakeBank:mistakeBank, freshness:freshness, stale:stale,
  season:season, seasonId:seasonId, claimSeason:claimSeason,
  DREAMS:DREAMS, dream:dream, setDream:setDream, urgency:urgency
};
})();
