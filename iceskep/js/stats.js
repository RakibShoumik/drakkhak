/* ===========================================================
   STATS — badges.

   A badge is earned once, by work already on record, and never
   taken away. They are checked after every set; a record carried
   over from an older version is checked silently at start-up, so
   nobody is greeted by a pile of toasts for work already done.
   =========================================================== */
var STATS = (function(){

/* mark: the short text inside the medal (digits go through N at paint) */
var BADGES=[
  {id:'c100',   mark:'100', en:'First 100 right',           bn:'প্রথম ১০০ ঠিক',
   noteEn:'Answer 100 questions correctly.',                 noteBn:'১০০টি প্রশ্নের ঠিক উত্তর দাও।',
   test:function(s){ return s.correct>=100; }},
  {id:'c500',   mark:'500', en:'500 right',                 bn:'৫০০ ঠিক',
   noteEn:'Answer 500 questions correctly.',                 noteBn:'৫০০টি প্রশ্নের ঠিক উত্তর দাও।',
   test:function(s){ return s.correct>=500; }},
  {id:'star3',  mark:'★',   en:'Three-star chapter',        bn:'তিন তারার অধ্যায়',
   noteEn:'Finish every question of one chapter.',           noteBn:'একটি অধ্যায়ের সব প্রশ্ন শেষ করো।',
   test:function(){ for(var id in ICE.topics) if(PLAN.stars(id).n===3) return true; return false; }},
  {id:'paper',  mark:'✓',   en:'A paper finished',          bn:'একটি পত্র শেষ',
   noteEn:'Finish every question of one paper.',             noteBn:'একটি পত্রের সব প্রশ্ন শেষ করো।',
   test:function(){
     return ICE.sectionsOf('hsc').some(function(sec){ return PLAN.paperDone('hsc/'+sec.id); });
   }},
  {id:'exam',   mark:'পত্র', en:'A full paper sat',         bn:'পুরো পরীক্ষা দেওয়া',
   noteEn:'Finish one full paper at board time.',            noteBn:'বোর্ডের সময়ে একটি পুরো পত্র শেষ করো।',
   test:function(s){ return Object.keys(s.examBest).length>0; }},
  {id:'exam80', mark:'80%', en:'Full paper, 80% or more',   bn:'পুরো পরীক্ষায় ৮০%+',
   noteEn:'Score 80% or more in a full paper.',              noteBn:'একটি পুরো পরীক্ষায় ৮০% বা তার বেশি পাও।',
   test:function(s){ for(var k in s.examBest) if(s.examBest[k]>=0.8) return true; return false; }},
  {id:'streak7',  mark:'7',  en:'7 days in a row',          bn:'টানা ৭ দিন',
   noteEn:'Practise 7 days in a row.',                       noteBn:'টানা ৭ দিন অনুশীলন করো।',
   test:function(s){ return Math.max(s.best||0, DB.liveStreak())>=7; }},
  {id:'streak30', mark:'30', en:'30 days in a row',         bn:'টানা ৩০ দিন',
   noteEn:'Practise 30 days in a row.',                      noteBn:'টানা ৩০ দিন অনুশীলন করো।',
   test:function(s){ return Math.max(s.best||0, DB.liveStreak())>=30; }},
  {id:'goal7',  mark:'7✓', en:'Daily goal ×7',            bn:'দৈনিক লক্ষ্য ×৭',
   noteEn:'Meet your daily goal on 7 days.',                 noteBn:'৭ দিন দৈনিক লক্ষ্য পূরণ করো।',
   test:function(s){ return (s.goalDays||0)>=7; }},
  {id:'daily10', mark:'৫×10', en:'Today\'s five ×10',       bn:'আজকের ৫ ×১০',
   noteEn:'Answer today\'s five on 10 days.',                noteBn:'১০ দিন "আজকের ৫" শেষ করো।',
   test:function(s){ return (s.dailyCount||0)>=10; }},
  {id:'level5', mark:'L5',  en:'Level 5',                   bn:'লেভেল ৫',
   noteEn:'Reach level 5.',                                  noteBn:'লেভেল ৫-এ পৌঁছাও।',
   test:function(){ return GAME.level().lv>=5; }},
  {id:'won50',  mark:'50',  en:'50 mistakes won back',      bn:'৫০টি ভুল ফিরিয়ে আনা',
   noteEn:'Answer 50 questions from the mistake bank correctly.', noteBn:'ভুলের খাতার ৫০টি প্রশ্নে ঠিক উত্তর দাও।',
   test:function(s){ return s.won>=50; }}
];

function badge(id){ for(var i=0;i<BADGES.length;i++) if(BADGES[i].id===id) return BADGES[i]; return null; }
function bname(b){ return L(b.en, b.bn); }
function bnote(b){ return L(b.noteEn, b.noteBn); }
function markText(b){ return N(b.mark); }

/* check them all; returns the ones earned just now */
function check(){
  var s=DB.state(), got=[];
  BADGES.forEach(function(b){
    if(s.badges[b.id]) return;
    var ok=false;
    try{ ok=!!b.test(s); }catch(e){}
    if(ok){ s.badges[b.id]=Date.now(); got.push(b); }
  });
  if(got.length) DB.save();
  return got;
}
function count(){ return Object.keys(DB.state().badges).length; }

return {BADGES:BADGES, badge:badge, bname:bname, bnote:bnote, markText:markText, check:check, count:count};
})();
