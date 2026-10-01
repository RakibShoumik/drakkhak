/* ===========================================================
   RESEARCH — how Drakkhak works, and why.

   The honesty note first, then one short section for each method
   the app really uses, with the published evidence behind it, and
   what the app cannot do. No drawings: the page has to open fast on
   a slow connection.
   =========================================================== */
var RESEARCH = (function(){

function S(en, bn, src){ return {en:en, bn:bn, src:src}; }
var SECTIONS=[
  S({t:'Questions first: retrieval practice',
     what:'Every screen leads to a question. You answer before you are told anything, and see the verdict within a quarter of a second.',
     why:'Pulling a fact out of memory strengthens it far more than reading it again. In the classic study, students who were tested on a passage remembered much more of it a week later than students who spent the same time re-reading it.'},
    {t:'আগে প্রশ্ন: স্মৃতি থেকে তুলে আনা',
     what:'প্রতিটি পাতা একটি প্রশ্নের দিকে নিয়ে যায়। কিছু বলার আগেই তুমি উত্তর দাও, আর সেকেন্ডের এক-চতুর্থাংশে ফল দেখো।',
     why:'স্মৃতি থেকে কোনো তথ্য টেনে আনা সেটিকে আবার পড়ার চেয়ে অনেক বেশি পাকা করে। পরীক্ষা দিয়ে পড়া শিক্ষার্থীরা এক সপ্তাহ পরে অনেক বেশি মনে রাখে।'},
    ['Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. <i>Psychological Science</i>, 17(3).',
     'Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. <i>Psychological Science in the Public Interest</i>, 14(1).']),
  S({t:'The mistake bank: coming back just before you forget',
     what:'A question you miss goes into the mistake bank and comes back: first after about a day, then after longer and longer gaps (roughly 1, 4, 12 and 30 days once you get it right). When it returns right it is tagged "Check".',
     why:'Memories fade on a curve, and each well-timed return makes the next fade slower. Across hundreds of experiments, spreading practice out beats cramming the same amount into one sitting.'},
    {t:'ভুলের খাতা: ভুলে যাওয়ার ঠিক আগে ফিরে আসা',
     what:'যে প্রশ্নে ভুল করো তা ভুলের খাতায় যায় এবং ফিরে আসে: প্রথমে প্রায় এক দিন পরে, তারপর ক্রমশ লম্বা বিরতিতে। ঠিক উত্তর দিলে ফেরার সময় "যাচাই" ট্যাগ থাকে।',
     why:'স্মৃতি একটি বাঁকা রেখায় মুছে যায়, আর ঠিক সময়ে প্রতিটি ফেরা পরের মুছে যাওয়াকে ধীর করে। একবারে গাদাগাদি পড়ার চেয়ে ছড়িয়ে পড়া অনেক ভালো কাজ করে।'},
    ['Ebbinghaus, H. (1885). <i>Über das Gedächtnis</i> (Memory: A Contribution to Experimental Psychology).',
     'Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. <i>Psychological Bulletin</i>, 132(3).']),
  S({t:'"Done" means right on a later day',
     what:'A question only counts as done when you get it right inside its minute. If you ever missed it, it must be right again at least 16 hours later.',
     why:'Getting something right straight after seeing the answer measures short-term memory, not learning. Relearning a fact across separate sessions is what makes it last.'},
    {t:'"শেষ" মানে পরের দিনেও ঠিক',
     what:'একটি প্রশ্ন শেষ বলে গোনা হয় কেবল তখনই, যখন সেটি তার এক মিনিটের ভিতরে ঠিক হয়; কখনও ভুল হয়ে থাকলে অন্তত ১৬ ঘণ্টা পরে আবার ঠিক হতে হবে।',
     why:'উত্তর দেখার সাথে সাথে পারা মানে স্বল্পমেয়াদি স্মৃতি, শেখা নয়। আলাদা আলাদা দিনে একাধিকবার ঠিক করাই তথ্যকে টেকসই করে।'},
    ['Rawson, K. A., & Dunlosky, J. (2011). Optimizing schedules of retrieval practice for durable and efficient learning: How much is enough? <i>Journal of Experimental Psychology: General</i>, 140(3).',
     'Bjork, R. A., & Bjork, E. L. (1992). A new theory of disuse and an old theory of stimulus fluctuation. In <i>From Learning Processes to Cognitive Processes</i>.']),
  S({t:'Desirable difficulty: board level, not easier',
     what:'For every chapter the app keeps an estimate of your ability and picks questions you should get right about 60% of the time, at board level. One question in four is a stretch.',
     why:'Practice that feels easy is often the least useful; conditions that slow you down a little tend to produce stronger, more transferable learning.'},
    {t:'কাজের কাঠিন্য: বোর্ডের মান, তার চেয়ে সহজ নয়',
     what:'প্রতিটি অধ্যায়ে অ্যাপ তোমার মানের একটি হিসাব রাখে, আর এমন প্রশ্ন বাছে যেগুলো বোর্ড মানে প্রায় ৬০% বার ঠিক হওয়ার কথা। প্রতি চারটির একটি একটু কঠিন।',
     why:'যে অনুশীলন সহজ লাগে তা প্রায়ই সবচেয়ে কম কাজের; একটু কঠিন অবস্থাই শেখাকে বেশি টেকসই করে।'},
    ['Bjork, R. A. (1994). Memory and metamemory considerations in the training of human beings. In <i>Metacognition: Knowing about Knowing</i>. MIT Press.',
     'Wilson, R. C., Shenhav, A., Straccia, M., & Cohen, J. D. (2019). The Eighty Five Percent Rule for optimal learning. <i>Nature Communications</i>, 10.']),
  S({t:'Interleaving: the chapters are woven, not stacked',
     what:'An ordinary set mixes up to three chapters from the front of your path, plus reviews. The path itself weaves the eleven papers together rather than finishing one before starting the next.',
     why:'Mixing kinds of problems forces you to decide which idea each one needs, which is exactly what the exam demands. Shuffled practice felt harder during practice but beat blocked practice clearly on the later test.'},
    {t:'মিশিয়ে পড়া: অধ্যায়গুলো বোনা, স্তূপ করা নয়',
     what:'একটি সাধারণ সেটে পথের সামনের তিনটি পর্যন্ত অধ্যায় মেশানো থাকে, সাথে রিভিউ। পথটিও এগারোটি পত্রকে বুনে নেয়।',
     why:'মেশানো প্রশ্নে প্রতিবার ঠিক করতে হয় কোন ধারণা লাগবে — পরীক্ষাও ঠিক এটাই চায়। অনুশীলনে কঠিন লাগলেও পরের পরীক্ষায় এটি স্পষ্টভাবে এগিয়ে থাকে।'},
    ['Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. <i>Instructional Science</i>, 35.',
     'Kornell, N., & Bjork, R. A. (2008). Learning concepts and categories: Is spacing the "enemy of induction"? <i>Psychological Science</i>, 19(6).']),
  S({t:'New ground first: more than three quarters new',
     what:'While you still have questions you have never seen, at least 13 of every 16 in a set are new, and a question never appears twice in a set. The rest is review.',
     why:'The exam samples the whole syllabus, so coverage comes before polish. Repeating what you already know well brings rapidly shrinking returns, while every unseen question is new ground.'},
    {t:'আগে নতুন জমি: তিন-চতুর্থাংশের বেশি নতুন',
     what:'না-দেখা প্রশ্ন থাকলে প্রতি ১৬টির অন্তত ১৩টি নতুন, আর একটি সেটে একই প্রশ্ন দুবার আসে না। বাকিগুলো রিভিউ।',
     why:'পরীক্ষা পুরো সিলেবাস থেকে প্রশ্ন নেয়, তাই আগে সবটা ছোঁয়া, পরে ঘষামাজা। যা ভালো জানো তা বারবার করা দ্রুত কম ফল দেয়।'},
    ['Rohrer, D., Taylor, K., Pashler, H., Wixted, J. T., & Cepeda, N. J. (2005). The effect of overlearning on long-term retention. <i>Applied Cognitive Psychology</i>, 19(3).',
     'Kornell, N., Hays, M. J., & Bjork, R. A. (2009). Unsuccessful retrieval attempts enhance subsequent learning. <i>Journal of Experimental Psychology: Learning, Memory, and Cognition</i>, 35(4).']),
  S({t:'Feedback you can act on, and explanations only when asked',
     what:'Right is a chime and green; wrong is a low tone with the right option marked. The explanation (why your choice tempted you, why the right one is right, and one line to remember) opens only if you ask.',
     why:'Feedback works best when it tells you where you stand and arrives right after the attempt. Errors corrected after a confident wrong answer are remembered especially well.'},
    {t:'কাজে লাগানোর মতো ফলাফল — আর ব্যাখ্যা কেবল চাইলে',
     what:'ঠিক হলে চাইম আর সবুজ; ভুল হলে নিচু সুর, সাথে সঠিকটি চিহ্নিত। ব্যাখ্যা খোলে কেবল তুমি চাইলে।',
     why:'চেষ্টার ঠিক পরে পাওয়া ফলাফল সবচেয়ে বেশি কাজ করে। নিশ্চিত হয়ে করা ভুল একবার শোধরালে বিশেষভাবে মনে থাকে।'},
    ['Hattie, J., & Timperley, H. (2007). The power of feedback. <i>Review of Educational Research</i>, 77(1).',
     'Butterfield, B., & Metcalfe, J. (2001). Errors committed with high confidence are hypercorrected. <i>Journal of Experimental Psychology: Learning, Memory, and Cognition</i>, 27(6).']),
  S({t:'The paper\'s own clock',
     what:'Every question gets exactly the time the board allows: one minute. At zero an alarm sounds once, and an answer that comes late does not count the question as done. A full paper runs on the real paper\'s total time.',
     why:'We remember best under conditions like those in which we will need the memory. Practising at exam pace trains what the exam measures: recall inside a minute, not recall eventually.'},
    {t:'প্রশ্নপত্রের নিজের ঘড়ি',
     what:'প্রতিটি প্রশ্নে ঠিক ততটুকু সময়, যতটুকু বোর্ড দেয়: এক মিনিট। সময় শেষ হলে একবার অ্যালার্ম বাজে, আর দেরিতে দেওয়া উত্তরে প্রশ্নটি "শেষ" গোনা হয় না। পুরো পরীক্ষা চলে আসল পত্রের মোট সময়ে।',
     why:'যে অবস্থায় মনে করতে হবে, সেই অবস্থায় অনুশীলন করলেই সবচেয়ে ভালো মনে থাকে।'},
    ['Morris, C. D., Bransford, J. D., & Franks, J. J. (1977). Levels of processing versus transfer appropriate processing. <i>Journal of Verbal Learning and Verbal Behavior</i>, 16(5).',
     'Tulving, E., & Thomson, D. M. (1973). Encoding specificity and retrieval processes in episodic memory. <i>Psychological Review</i>, 80(5).']),
  S({t:'A prediction built to be beaten',
     what:'The predicted MCQ mark starts from what your answers say, then charges for every reason it might flatter you: thin evidence, untested chapters, slow pace, the exam hall. It reports the 10th percentile, so you should beat it nine times in ten.',
     why:'People reliably underestimate how long work takes and overestimate how well they know material, and students who overrate their learning stop studying too early. A deliberately cautious number protects against both.'},
    {t:'ছাড়িয়ে যাওয়ার জন্য বানানো পূর্বাভাস',
     what:'পূর্বাভাস তোমার উত্তর থেকে শুরু করে, তারপর প্রতিটি সম্ভাব্য বাড়িয়ে বলার দাম কাটে: কম প্রমাণ, না-ছোঁয়া অধ্যায়, ধীর গতি, পরীক্ষার হল। এটি দশম পার্সেন্টাইল দেখায়, তাই ১০ বারের ৯ বার তুমি এর বেশি পাবে।',
     why:'মানুষ কাজের সময় কম আর নিজের জানা বেশি ধরে নেয়। ইচ্ছে করে সাবধানী একটি সংখ্যা দুটোর বিরুদ্ধেই সুরক্ষা।'},
    ['Buehler, R., Griffin, D., & Ross, M. (1994). Exploring the "planning fallacy". <i>Journal of Personality and Social Psychology</i>, 67(3).',
     'Dunlosky, J., & Rawson, K. A. (2012). Overconfidence produces underachievement: Inaccurate self evaluations undermine students’ learning and retention. <i>Learning and Instruction</i>, 22(4).']),
  S({t:'Coins that follow the work',
     what:'One currency. A coin for each right answer, two more for winning back a mistake, five for finishing a set, and they buy only three power-ups. Nothing expires and there is no money in the app.',
     why:'Game elements help when they reward the behaviour that matters and hurt when they reward something else. Rewards tied to answers, not to time on the page, do not teach you to sit in front of the screen.'},
    {t:'কাজের পেছনে পেছনে কয়েন',
     what:'একটিই মুদ্রা। প্রতিটি ঠিক উত্তরে একটি কয়েন, ভুল ফিরিয়ে আনলে আরও দুটি, সেট শেষ করলে পাঁচটি; আর এটি দিয়ে শুধু তিনটি পাওয়ার-আপ কেনা যায়। কিছুই মেয়াদোত্তীর্ণ হয় না, অ্যাপে কোনো টাকা নেই।',
     why:'খেলার উপাদান কাজে দেয় যখন তা আসল কাজকে পুরস্কৃত করে। উত্তরের সাথে বাঁধা পুরস্কার পর্দার সামনে বসে থাকতে শেখায় না।'},
    ['Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness: Defining "gamification". <i>Proceedings of MindTrek</i>.',
     'Lepper, M. R., Greene, D., & Nisbett, R. E. (1973). Undermining children’s intrinsic interest with extrinsic reward. <i>Journal of Personality and Social Psychology</i>, 28(1).'])
];

function view(){
  var bn=LBN();
  var o='<div class="page rsx"><h1>'+L('How Drakkhak works','Drakkhak কীভাবে কাজ করে')+'</h1>'+PAGES.honesty(false)+
    '<p class="lede">'+L('Each part below is a method with published evidence behind it: what the app does, why, and where the evidence comes from.',
      'নিচের প্রতিটি অংশ প্রকাশিত গবেষণাভিত্তিক একটি পদ্ধতি: অ্যাপ কী করে, কেন করে, আর প্রমাণ কোথা থেকে।')+'</p>';
  SECTIONS.forEach(function(s, i){
    var x=bn?s.bn:s.en;
    o+='<section class="rs-sec"><h2><span>'+N(i+1)+'</span>'+U.h(x.t)+'</h2>'+
      '<p>'+x.what+'</p><p class="why"><b>'+L('Why','কেন')+':</b> '+x.why+'</p>'+
      '<details class="rs-src"><summary>'+L('The evidence','প্রমাণ')+' ('+N(s.src.length)+')</summary><ul>'+
      s.src.map(function(r){ return '<li>'+r+'</li>'; }).join('')+'</ul></details></section>';
  });
  o+='<section class="rs-sec limits"><h2>'+L('What it cannot do','যা এটি পারে না')+'</h2><ul>'+
    '<li>'+L('It does not teach a subject from the ground up. Its questions cover what the board asks, not everything a chapter says.','এটি কোনো বিষয় গোড়া থেকে শেখায় না। এর প্রশ্ন বোর্ড যা জিজ্ঞেস করে তা-ই ধরে, অধ্যায়ের সবকিছু নয়।')+'</li>'+
    '<li>'+L('It does not measure the creative (written) half of the exam at all.','এটি পরীক্ষার সৃজনশীল অংশ একেবারেই মাপে না।')+'</li>'+
    '<li>'+L('Its numbers are estimates from your own answers on this phone. They get better with volume and are deliberately cautious.','এর সংখ্যাগুলো এই ফোনে তোমার নিজের উত্তর থেকে অনুমান। উত্তর বাড়লে এগুলো ভালো হয়, আর ইচ্ছে করেই সাবধানী।')+'</li>'+
    '<li>'+L('The research above is about average effects across many learners. Your own progress is the better guide to what works for you.','ওপরের গবেষণা অনেক শিক্ষার্থীর গড় ফল নিয়ে। তোমার জন্য কী কাজ করে, তার ভালো নির্দেশক তোমার নিজের অগ্রগতি।')+'</li>'+
    '</ul></section>'+
    '<div class="btns"><button type="button" class="btn" data-go="start">'+L('Back to work','কাজে ফিরে যাও')+'</button></div></div>';
  return o;
}

return {view:view};
})();
