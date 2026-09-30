/* ===========================================================
   I18N — a safety net for the English interface.

   Since the Drakkhak build the interface is written English-first:
   every string in the code is L('English', 'বাংলা'), and Settings →
   Language picks one. This file is what is left of the older,
   Bangla-first edition: a dictionary that turns any stray Bangla
   chrome into English when English is on, so a string that was
   missed never shows up half-translated.

   It never touches anything inside a question — the stem, the
   options, the statements, the উদ্দীপক, the explanation, the Learn
   sheet — or anything marked lang="bn". Those are content, not chrome.
   =========================================================== */
var I18N = (function(){

var EN={
  /* the four places and the shell */
  'আজ':'Today', 'অনুশীলন':'Practice', 'অগ্রগতি':'Progress', 'সেটিংস':'Settings',
  'এইচএসসি':'HSC', 'পরিসংখ্যান':'Statistics', 'পূর্বাভাস':'Prediction',
  'পুরো পরিকল্পনা':'The whole plan', 'আপনার রেকর্ড':'Your record',
  'এই সপ্তাহ':'This week', 'পড়ার পরিকল্পনা':'Study plan',
  'কার্ডগুলো':'The cards', 'সূত্র ও মনে রাখার কার্ড':'Formula and memory cards',
  'ফিরে যান':'Back', 'বেরিয়ে যান':'Leave', 'শেষ':'Done', 'বন্ধ করুন':'Close',
  'পূর্ণ পত্র':'A full paper', 'গতির অনুশীলন':'Speed drill',
  'দুর্বল জায়গা':'Weak spots', 'যা আজ ফেরত এসেছে':'Everything due',
  'ভুলের ব্যাংক':'Mistake bank', 'অন্য কিছু বেছে নিন':'Choose something else',

  /* numbers and labels */
  'স্কোর':'Score', 'প্রশ্ন':'Questions', 'মধ্যক':'Median', 'মধ্যক সময়':'Median time',
  'মিনিট':'Minutes', 'বাকি দিন':'Days left', 'সময়ের বেশি':'Over time',
  'অধ্যায় অনুযায়ী':'By topic', 'শুদ্ধতা':'Accuracy', 'ধারা':'Streak',
  'সর্বোচ্চ':'Best', 'লেভেল':'Level', 'কয়েন':'Coins', 'ব্যাজ':'Badges',
  'অবস্থান':'Rank', 'রেটিং':'Rating', 'তারা':'Stars', 'পত্র':'Paper',
  'শেষ':'Done', 'বাকি':'Left', 'সময়':'Time', 'দৈনিক প্রশ্ন':'Questions a day',
  'উত্তর':'Answers', 'ফল':'Result', 'মান':'Level', 'কখন':'When',
  'পত্র · স্কোর':'Paper · score', 'অনুশীলনের উপায়':'Ways to practise',
  'অনুশীলনের আরও উপায়':'More ways to practise', 'আরও':'More',
  'প্রতিটি অধ্যায়':'Every topic', 'সব পত্র':'All papers',
  'পত্র অনুযায়ী স্কোর':'Score by paper', 'টেবিলে কাটানো সময়':'Time at the desk',

  /* settings */
  'রাতের মোড':'Night mode', 'শব্দ':'Sound', 'প্রশ্নের টাইমার':'Question timer',
  'সময় শেষের অ্যালার্ম':'Time-up alarm', 'কঠিন পূর্বাভাস':'Hard prediction',
  'পাস রেখা':'Pass line', 'লক্ষ্য রেখা':'Goal line', 'এক সেটে প্রশ্ন':'Questions per set',
  'দিনে পড়ার সময়':'Study time per day', 'অ্যানিমেশন':'Animations',
  'কম্পন':'Vibration', 'ভাষা':'Language', 'আপনার দৈনিক লক্ষ্য':'Your daily goal',
  'বিরতির কথা মনে করিয়ে দেওয়া':'Break reminders', 'শান্ত মোড':'Calm mode',
  'পরীক্ষার তারিখ':'Exam date', 'আপনার নাম':'Your name', 'আপনার তথ্য':'Your data',
  'একটি কপি রাখুন':'Export a copy', 'ফিরিয়ে আনুন':'Restore',
  'সব মুছে ফেলুন':'Erase everything', 'আরও সেটিংস':'More settings',
  'কিবোর্ড শর্টকাট':'Keyboard shortcuts', 'শর্টকাট':'Shortcuts',
  'প্রশ্নপত্রের নকশা':'Exam blueprint', 'প্রতি প্রশ্নে সেকেন্ড':'Seconds per question',
  'এমসিকিউ লক্ষ্য (%)':'MCQ target (%)', 'স্কোর ও লক্ষ্য':'Scores and targets',
  'সেশন':'Sessions', 'অনুভূতি':'Feel', 'আপনি':'You',
  'সংরক্ষিত।':'Saved.', 'নকশা সংরক্ষিত।':'Blueprint saved.',
  'ফিরিয়ে আনা হয়েছে।':'Restored.', 'মুছে ফেলা হয়েছে।':'Erased.',
  'চালু':'On', 'বন্ধ':'Off', 'দেখুন':'Show', 'বাংলা':'Bangla',

  /* the loop */
  'পরের প্রশ্ন':'Next question', 'ব্যাখ্যা':'Explanation', 'ফলাফল দেখুন':'See the result',
  'ব্যাখ্যা লুকান':'Hide explanation', 'অ্যালার্ম বন্ধ':'Stop alarm',
  'ঠিক':'Right', 'হয়নি':'Not right', 'সঠিক উত্তর':'Correct answer',
  'আপনার উত্তর':'Your answer', 'মনে রাখার সহজ পথ':'The fast route',
  'কেন এটিই ঠিক:':'Why it is right:', 'আপনার পছন্দ:':'Your choice:',
  'আমি নিশ্চিত':'I am sure', 'আন্দাজ করছি':'I am guessing', 'আন্দাজ':'guessing',
  'আগেই বলেছিলেন':'Called it', 'শুরু':'Start', 'সেট বদলান':'Change set',
  'বিস্তারিত দেখুন':'See the details', 'এই সেটে পেলেন':'This set paid',
  'ছবি হিসেবে রাখুন':'Save as an image', 'কার্ড দেখুন':'Show the card',
  'নিচের কোনটি সঠিক?':'Which of the following is correct?',

  /* the game layer */
  'কোয়েস্ট':'Quests', 'আজকের প্রশ্ন':'Question of the day', 'সংগ্রহ':'Collection',
  'দোকান':'Shop', 'অর্জন':'Achievements', 'সিন্দুক':'Chests', 'খুলুন':'Open',
  'নিন':'Claim', 'নেওয়া হয়েছে':'Claimed', 'মৌসুম':'Season',
  'পড়ার বাগান':'Study garden', 'সনদ':'Certificate', 'রিপোর্ট':'Report',
  'দ্বৈরথ':'Duel', 'দ্বৈরথ ও কার্ড':'Duels and cards', 'নিজের রেকর্ড':'Personal records',
  'সহজ':'Easy', 'বোর্ড মান':'Board level', 'কঠিন':'Hard', 'দানব':'Beast',
  'ব্লিটজ':'Blitz', 'সারভাইভাল':'Survival', 'বস':'Boss', 'বস লড়াই':'Boss battles',
  'ঘোস্ট রেস':'Ghost race', 'বোর্ড এমসিকিউ':'Board MCQ',
  'বাদ দেওয়ার পরীক্ষা':'Skip test', 'শুরুর পরীক্ষা':'Diagnostic',
  'পরপর':'in a row', 'দ্বিগুণ XP':'Double XP', 'ধারা মেরামত':'Repair streak',
  'আপনার নোট':'Your notes', 'আপনার নিজের নোট':'Your own note',

  /* the quiet edition */
  'এর পরে':'Next up', 'পরীক্ষা বাকি':'Exam in', 'এই গতিতে':'At this pace',
  'ঠিক করা হয়নি':'Not set', 'সেটিংসে তারিখ দিন':'Add the date in Settings',
  'পরিকল্পনা চালিয়ে যান':'Continue the plan', 'আগে দুর্বল জায়গা':'Weak spots first',
  'ঘড়ির সাথে পাল্লা':'Against the clock', 'পড়া বাকি (দিন)':'Days of content left',
  'পূর্বাভাস, লাইন ধরে':'The prediction, line by line',
  'এই সংখ্যা কেন':'Why this number', 'যা সবচেয়ে বেশি টেনে নামায়':'What holds it down most',
  'মিটিয়ে ফেলুন':'Clear them', 'শেষ ৩০ দিন':'Last 30 days', 'শেষ ৬০ দিন':'Last 60 days',
  'পড়ার সময় বদলান':'Change study time', 'আপনার পথ':'Your path',
  'এখন':'now', 'সব':'All', 'পড়া হয়েছে':'Read', 'অনুশীলন করুন':'Drill it',
  'আজকের পাতায় ফিরুন':'Back to Today', 'আপনার পরিকল্পনা দেখুন':'See your plan',
  'আবার স্বাগতম':'Welcome back', 'অসমাপ্ত':'Unfinished', 'হাতের নাগালে':'Within reach',
  'কোয়েস্ট শেষ':'Quest done', 'শেষ করুন':'Finish it', 'মেরামত করুন':'Repair it',
  'লেভেল আপ':'Level up', 'চালিয়ে যান':'Keep going', 'দেখে নিন':'Have a look',
  'রেকর্ড যা বলছে':'What the record says', 'ঠান্ডা হয়ে আসছে':'Going cold',
  'ঝালিয়ে নিন':'Refresh', 'এটি কীভাবে হিসাব হয়?':'How is this worked out?',
  'অধ্যায় · বইয়ের ক্রম অনুযায়ী':'Chapters · in the book’s order',
  'প্রশ্নের ধরন অনুযায়ী':'Every question type', 'কোনটিকে শেষ বলা হয়':'What counts as done',
  'এই প্রশ্নগুলো কোথা থেকে':'Where these questions come from',
  'স্কোর কীভাবে কাজ করে':'How the score works',
  'কী সবচেয়ে বেশি নাড়াবে':'What would move it most'
};

/* nothing inside these is ever touched */
var SKIP='.qstem,.stlist,.stask,.qcpre,.opt,.whybox,.fastbox,.hintbox,.rcpassage,.trick,.omr,'+
         '.missed,.mbody,.lgroups,.lex,code,kbd,pre,input,textarea,[data-bn],[lang="bn"]';

function on(){ return DB.state().settings.lang==='en'; }
/* t() takes the Bangla the source is written in and gives back whatever
   the interface is set to. Chrome that has no entry stays Bangla. */
function t(s){ return on() ? (EN[s]||s) : s; }

function apply(root){
  if(!on() || !root) return;
  var skip=root.querySelectorAll?root.querySelectorAll(SKIP):[];
  var blocked=[];
  for(var i=0;i<skip.length;i++) blocked.push(skip[i]);
  var w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false), n;
  var jobs=[];
  while((n=w.nextNode())){
    var v=n.nodeValue;
    if(!v || !/\S/.test(v)) continue;
    if(inside(n, blocked)) continue;
    var key=v.trim(), hit=EN[key];
    if(hit) jobs.push([n, v.replace(key, hit)]);
  }
  for(i=0;i<jobs.length;i++) jobs[i][0].nodeValue=jobs[i][1];

  /* labels a screen reader or a tooltip would read */
  var els=root.querySelectorAll('[title],[aria-label],[placeholder]');
  for(i=0;i<els.length;i++){
    var e=els[i];
    if(inside(e, blocked)) continue;
    ['title','aria-label','placeholder'].forEach(function(a){
      var val=e.getAttribute(a);
      if(val && EN[val.trim()]) e.setAttribute(a, EN[val.trim()]);
    });
  }
}
function inside(node, blocked){
  var e=node.nodeType===1?node:node.parentNode;
  while(e && e!==document.body){
    for(var i=0;i<blocked.length;i++) if(blocked[i]===e) return true;
    e=e.parentNode;
  }
  return false;
}
function set(lang){
  DB.state().settings.lang = lang==='bn'?'bn':'en';
  DB.save();
  document.documentElement.setAttribute('lang', DB.state().settings.lang);
}

return {t:t, apply:apply, on:on, set:set, EN:EN};
})();
