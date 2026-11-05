/* ===========================================================
   উচ্চতর গণিত ১ম পত্র — দশম অধ্যায়
   যোগজীকরণ

   উৎস: Higher Math 1st, পিডিএফ পৃষ্ঠা ২৮১–৩১৭। প্রতিটি প্রশ্নের ট্যাগে পৃষ্ঠা আছে।
   গাণিতিক অধ্যায়: প্রতিটি সংখ্যাগত উত্তর সূত্র ও সংখ্যাভিত্তিক সমাকলনের (midpoint rule)
   দুই পদ্ধতিতে মিলিয়ে নেওয়া হয়েছে। বইয়ের উদাহরণ ও অনুশীলনীর সংখ্যা সরাসরি নেওয়া হয়নি।
   =========================================================== */

ICE.P.push({
  id:"hmath1.ch10.u01", topic:"hmath1.ch10", note:"অংশায়নে যোগজ",
  text:"<p>একজন শিক্ষার্থী অংশায়ন পদ্ধতিতে &int; x cos x dx নির্ণয় করছে। সে x কে প্রথম ফাংশন এবং cos x কে দ্বিতীয় ফাংশন ধরেছে।</p>"
});

ICE.P.push({
  id:"hmath1.ch10.u02", topic:"hmath1.ch10", note:"লব হরের অন্তরজ",
  text:"<p>একটি ফাংশন g(x) = 2x/(x<sup>2</sup> + 4)। z = x<sup>2</sup> + 4 প্রতিস্থাপন করে এর যোগজ নির্ণয় করা হবে।</p>"
});

ICE.P.push({
  id:"hmath1.ch10.u03", topic:"hmath1.ch10", note:"সরলরেখা ও পরাবৃত্ত",
  text:"<p>y = x<sup>2</sup> বক্ররেখা এবং y = x সরলরেখা দুটি বিন্দুতে ছেদ করে এবং একটি ক্ষেত্র আবদ্ধ করে।</p>"
});

ICE.P.push({
  id:"hmath1.ch10.u04", topic:"hmath1.ch10", note:"ট্রাপিজিয়াম সূত্র",
  text:"<p>y = x<sup>2</sup> বক্ররেখা, x-অক্ষ এবং x = 0, x = 4 রেখা দ্বারা আবদ্ধ ক্ষেত্রের ক্ষেত্রফল ট্রাপিজিয়াম সূত্রে নির্ণয় করা হবে। ব্যবধিকে সমান দৈর্ঘ্যের চারটি অংশে ভাগ করা হলো (h = 1)।</p>"
});

ICE.P.push({
  id:"hmath1.ch10.u05", topic:"hmath1.ch10", note:"আংশিক ভগ্নাংশের যোগজ",
  text:"<p>একটি যোগজ &int; dx/(x<sup>2</sup> &minus; 1)। হরকে (x &minus; 1)(x + 1) আকারে লেখা যায়।</p>"
});

ICE.P.push({
  id:"hmath1.ch10.u06", topic:"hmath1.ch10", note:"ত্রিকোণমিতিক ঘাতের যোগজ",
  text:"<p>&int;<sub>0</sub><sup>&pi;/2</sup> sin<sup>3</sup>x cos x dx নির্ণয়ে z = sin x প্রতিস্থাপন করা হলো।</p>"
});

ICE.Q.push({
  id:"hmath1.ch10.001", topic:"hmath1.ch10", type:'mc', b:-1.4,
  stem:"যোগজীকরণের প্রতীক &int; কোন ইংরেজি শব্দের প্রথম অক্ষর থেকে এসেছে?",
  opts:["Subtraction","Substitution","Summation","Sequence"],
  ans:2,
  why:[
    "বিয়োগের ধারণা প্রতীকটির উৎস নয়; এটি যোগফলের ধারণা বোঝায়।",
    "প্রতিস্থাপন একটি পদ্ধতির নাম, প্রতীকের উৎস নয়।",
    "ঠিক — যোগ করার ধারণা থেকেই S-এর লম্বা রূপ &int; নেওয়া হয়েছে।",
    "অনুক্রমের নাম প্রতীকটির উৎস নয়।"
  ],
  fast:"&int; চিহ্নটি Summation শব্দের S-এর বিস্তৃত রূপ; যোগজীকরণ অন্তরীকরণের বিপরীত প্রক্রিয়া।",
  tags:["p282","যোগজের ধারণা"]
});

ICE.Q.push({
  id:"hmath1.ch10.002", topic:"hmath1.ch10", type:'mc', b:-1.2,
  stem:"d/dx (sin x) = cos x হলে, ধ্রুবক বাদে cos x এর যোজিত ফল কোনটি?",
  opts:["sin x","&minus;sin x","cos x","&minus;cos x"],
  ans:0,
  why:[
    "ঠিক — যার অন্তরজ cos x, সেটিই cos x এর যোজিত ফল।",
    "&minus;sin x এর অন্তরজ হয় &minus;cos x, cos x নয়।",
    "cos x এর অন্তরজ &minus;sin x; তাই এটি নিজের যোজিত ফল নয়।",
    "&minus;cos x এর অন্তরজ sin x, cos x নয়।"
  ],
  fast:"যোগজীকরণ অন্তরীকরণের উল্টো: &int; cos x dx = sin x + c।",
  tags:["p282","যোগজের ধারণা"]
});

ICE.Q.push({
  id:"hmath1.ch10.003", topic:"hmath1.ch10", type:'mc', b:-0.9,
  stem:"&int; f(x) dx রাশিতে f(x) কে কী বলা হয়?",
  opts:["যোগজীকরণ ধ্রুবক","উর্ধ্বপ্রান্ত","প্রতিঅন্তরজ","যোজ্য রাশি (Integrand)"],
  ans:3,
  why:[
    "ধ্রুবক বলা হয় c কে, যা ফলের সাথে যুক্ত হয়।",
    "উর্ধ্বপ্রান্ত নির্দিষ্ট যোগজের উপরের সীমা (b)।",
    "প্রতিঅন্তরজ হলো যোগজীকরণের ফল F(x), যোজ্য রাশি নয়।",
    "ঠিক — চিহ্নের ভেতরের ফাংশনটিই যোজ্য রাশি।"
  ],
  fast:"যোগজ চিহ্নের ভেতরের ফাংশন f(x) হলো যোজ্য রাশি; dx জানায় কোন চলকের সাপেক্ষে যোগজীকরণ।",
  tags:["p282","যোগজের ধারণা"]
});

ICE.Q.push({
  id:"hmath1.ch10.004", topic:"hmath1.ch10", type:'mc', b:-0.4,
  stem:"নিচের কোনটি 3x<sup>2</sup> এর প্রতিঅন্তরজ নয়?",
  opts:["x<sup>3</sup> + 7","x<sup>2</sup> + 3","x<sup>3</sup> &minus; 4","x<sup>3</sup>"],
  ans:1,
  why:[
    "এর অন্তরজ 3x<sup>2</sup>, তাই এটি প্রতিঅন্তরজ; প্রশ্নে যেটি নয় সেটি খোঁজা হচ্ছে।",
    "ঠিক — এর অন্তরজ 2x, 3x<sup>2</sup> নয়।",
    "এর অন্তরজও 3x<sup>2</sup>, তাই এটি প্রতিঅন্তরজ।",
    "এর অন্তরজ 3x<sup>2</sup>, তাই এটিও প্রতিঅন্তরজ।"
  ],
  fast:"একই ফাংশনের প্রতিঅন্তরজ অসংখ্য, তারা কেবল ধ্রুবকে ভিন্ন হয়; তাই অনির্দিষ্ট যোগজে + c লাগে।",
  tags:["p283","অনির্দিষ্ট যোগজ ও সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.005", topic:"hmath1.ch10", type:'mc', b:0,
  stem:"নির্দিষ্ট যোগজ নির্ণয়ে যোগজীকরণ ধ্রুবক c লিখতে হয় না কেন?",
  opts:["c এর মান সব সময় শূন্য","উর্ধ্বসীমা ও নিম্নসীমার মান বিয়োগের সময় c কাটা যায়","ধ্রুবকের অন্তরজ অশূন্য","নির্দিষ্ট যোগজে কোনো ধ্রুবক থাকতে পারে না"],
  ans:1,
  why:[
    "c শূন্য হতেই হবে এমন নয়; যেকোনো ধ্রুবক হতে পারে।",
    "ঠিক — {G(b)+c} &minus; {G(a)+c} = G(b) &minus; G(a)।",
    "ধ্রুবকের অন্তরজ শূন্য; এ কারণেই c যুক্ত হয়।",
    "প্রতিঅন্তরজে ধ্রুবক থাকে, বিয়োগের পর কেটে যায়।"
  ],
  fast:"নির্দিষ্ট যোগজ = G(b) &minus; G(a); c দুই জায়গায় থাকায় বিয়োগে কেটে যায়, তাই লেখার দরকার নেই।",
  tags:["p303","নির্দিষ্ট যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.006", topic:"hmath1.ch10", type:'mc', b:-1.1,
  stem:"&int; x<sup>7</sup> dx = কত?",
  opts:["7x<sup>6</sup> + c","x<sup>8</sup> + c","x<sup>6</sup>/6 + c","x<sup>8</sup>/8 + c"],
  ans:3,
  why:[
    "এটি অন্তরীকরণ করা হয়েছে, যোগজীকরণ নয়।",
    "নতুন ঘাত 8 দিয়ে ভাগ করা হয়নি।",
    "ঘাত এক কমানো হয়েছে; যোগজে বাড়াতে হয়।",
    "ঠিক — ঘাত এক বাড়িয়ে নতুন ঘাত দিয়ে ভাগ।"
  ],
  fast:"&int; x<sup>n</sup> dx = x<sup>n+1</sup>/(n+1) + c, যেখানে n &ne; &minus;1।",
  tags:["p284","অনির্দিষ্ট যোগজ ও সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.007", topic:"hmath1.ch10", type:'mc', b:-0.3,
  stem:"&int; (6x<sup>2</sup> &minus; 4x + 3) dx = কত?",
  opts:["2x<sup>3</sup> &minus; 2x<sup>2</sup> + 3x + c","2x<sup>3</sup> &minus; 4x<sup>2</sup> + 3x + c","6x<sup>3</sup> &minus; 4x<sup>2</sup> + 3x + c","2x<sup>3</sup> &minus; 2x<sup>2</sup> + 3 + c"],
  ans:0,
  why:[
    "ঠিক — প্রতিটি পদের যোগজ আলাদা করে নিয়ে যোগ।",
    "&minus;4x এর যোগজ &minus;2x<sup>2</sup>; 2 দিয়ে ভাগ করা হয়নি।",
    "প্রতি পদে নতুন ঘাত দিয়ে ভাগ করা হয়নি।",
    "ধ্রুবক পদ 3 এর যোগজ 3x, শুধু 3 নয়।"
  ],
  fast:"যোগজ যোগ-বিয়োগের ওপর ভাগ হয়: প্রতিটি পদ আলাদা যোগজ করে ধ্রুবক শেষে একবার বসে।",
  tags:["p284","অনির্দিষ্ট যোগজ ও সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.008", topic:"hmath1.ch10", type:'mc', b:0.4,
  stem:"&int; 2<sup>x</sup> dx = কত?",
  opts:["2<sup>x</sup> ln 2 + c","2<sup>x</sup> + c","2<sup>x</sup>/ln 2 + c","x &middot; 2<sup>x&minus;1</sup> + c"],
  ans:2,
  why:[
    "এটি 2<sup>x</sup> এর অন্তরজের রূপ; যোগজে ln a দিয়ে ভাগ হয়।",
    "e<sup>x</sup> এর সূত্র এখানে খাটে না, কারণ ভিত্তি e নয়।",
    "ঠিক — &int; a<sup>x</sup> dx = a<sup>x</sup>/ln a + c।",
    "ঘাতের সূত্র ব্যবহার করা হয়েছে, অথচ ঘাত x চলক, সূচকীয় ফাংশন।"
  ],
  fast:"&int; a<sup>x</sup> dx = a<sup>x</sup>/ln a + c; ভিত্তি e হলে ln e = 1 বলে ফল e<sup>x</sup> + c।",
  tags:["p284","অনির্দিষ্ট যোগজ ও সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.009", topic:"hmath1.ch10", type:'mc', b:-0.4,
  stem:"&int; sec x tan x dx = কত?",
  opts:["tan x + c","sec<sup>2</sup>x + c","sec x + c","&minus;cosec x + c"],
  ans:2,
  why:[
    "tan x এর অন্তরজ sec<sup>2</sup>x, sec x tan x নয়।",
    "এটি অন্তরজের রূপ; যোগজ নয়।",
    "ঠিক — d/dx(sec x) = sec x tan x।",
    "এটি &int; cosec x cot x dx এর ফল।"
  ],
  fast:"&int; sec x tan x dx = sec x + c এবং &int; cosec x cot x dx = &minus;cosec x + c।",
  tags:["p284","অনির্দিষ্ট যোগজ ও সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.010", topic:"hmath1.ch10", type:'mc', b:-0.8,
  stem:"&int; dx/(1 + x<sup>2</sup>) = কত?",
  opts:["tan<sup>&minus;1</sup>x + c","sin<sup>&minus;1</sup>x + c","ln(1 + x<sup>2</sup>) + c","sec<sup>&minus;1</sup>x + c"],
  ans:0,
  why:[
    "ঠিক — d/dx(tan<sup>&minus;1</sup>x) = 1/(1 + x<sup>2</sup>)।",
    "এটি &int; dx/&radic;(1 &minus; x<sup>2</sup>) এর ফল।",
    "লবে 2x থাকলে এটি হতো; এখানে লব 1।",
    "এটি &int; dx/(x&radic;(x<sup>2</sup> &minus; 1)) এর ফল।"
  ],
  fast:"&int; dx/(1 + x<sup>2</sup>) = tan<sup>&minus;1</sup>x + c এবং &int; dx/&radic;(1 &minus; x<sup>2</sup>) = sin<sup>&minus;1</sup>x + c।",
  tags:["p285","অনির্দিষ্ট যোগজ ও সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.011", topic:"hmath1.ch10", type:'mc', b:-0.3,
  stem:"&int; e<sup>3x</sup> dx = কত?",
  opts:["3e<sup>3x</sup> + c","e<sup>3x</sup> + c","e<sup>3x</sup>/(3x) + c","e<sup>3x</sup>/3 + c"],
  ans:3,
  why:[
    "এটি অন্তরীকরণের নিয়ম; যোগজে সহগ দিয়ে ভাগ হয়।",
    "সহগ 3 দিয়ে ভাগ করা হয়নি।",
    "ঘাতের সূত্র ভুলভাবে প্রয়োগ করা হয়েছে; ভাগ হবে শুধু 3 দিয়ে।",
    "ঠিক — x এর সহগ 3 দিয়ে ভাগ করতে হয়।"
  ],
  fast:"অন্তরীকরণে x এর সহগ m গুণ হয়, যোগজীকরণে m দিয়ে ভাগ: &int; e<sup>mx</sup> dx = e<sup>mx</sup>/m + c।",
  tags:["p287","প্রতিস্থাপন"]
});

ICE.Q.push({
  id:"hmath1.ch10.012", topic:"hmath1.ch10", type:'mc', b:0,
  stem:"&int; sin 5x dx = কত?",
  opts:["(cos 5x)/5 + c","&minus;(cos 5x)/5 + c","&minus;cos 5x + c","5 cos 5x + c"],
  ans:1,
  why:[
    "চিহ্ন ভুল; sin এর যোগজ ঋণাত্মক cos।",
    "ঠিক — sin এর যোগজ &minus;cos, তারপর 5 দিয়ে ভাগ।",
    "5 দিয়ে ভাগ করা হয়নি।",
    "ভাগের বদলে গুণ করা হয়েছে, চিহ্নও ভুল।"
  ],
  fast:"&int; sin mx dx = &minus;(cos mx)/m + c এবং &int; cos mx dx = (sin mx)/m + c।",
  tags:["p287","প্রতিস্থাপন"]
});

ICE.Q.push({
  id:"hmath1.ch10.013", topic:"hmath1.ch10", type:'mc', b:0.6,
  stem:"sin 3x cos 5x কে যোগজীকরণের উপযোগী করতে কোন রূপে লিখতে হবে?",
  opts:["(sin 8x + sin 2x)/2","(sin 8x &minus; sin 2x)/2","sin 8x &minus; sin 2x","(cos 8x &minus; cos 2x)/2"],
  ans:1,
  why:[
    "sin(3x &minus; 5x) = &minus;sin 2x; চিহ্ন ধনাত্মক নেওয়া ভুল।",
    "ঠিক — sin A cos B = &frac12;{sin(A + B) + sin(A &minus; B)}, আর sin(&minus;2x) = &minus;sin 2x।",
    "&frac12; গুণক বাদ পড়েছে।",
    "এটি cos A cos B বা sin A sin B ধরনের রূপ; sin A cos B এর নয়।"
  ],
  fast:"গুণফল সরল করতে হলে sin A cos B = &frac12;{sin(A + B) + sin(A &minus; B)} দিয়ে যোগফল বানান, তারপর যোগজ করুন।",
  tags:["p287","প্রতিস্থাপন"]
});

ICE.Q.push({
  id:"hmath1.ch10.014", topic:"hmath1.ch10", type:'mc', b:-0.4,
  stem:"&int; tan x dx = কত?",
  opts:["ln|cos x| + c","ln|sin x| + c","&frac12; tan<sup>2</sup>x + c","ln|sec x| + c"],
  ans:3,
  why:[
    "চিহ্ন ভুল; সঠিক ফল &minus;ln|cos x|।",
    "এটি &int; cot x dx এর ফল।",
    "এর অন্তরজ tan x sec<sup>2</sup>x, tan x নয়।",
    "ঠিক — z = cos x ধরলে &minus;ln|cos x| = ln|sec x|।"
  ],
  fast:"&int; tan x dx = ln|sec x| + c = &minus;ln|cos x| + c।",
  tags:["p289","ত্রিকোণমিতিক ও বিশেষ যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.015", topic:"hmath1.ch10", type:'mc', b:0,
  stem:"&int; cot x dx = কত?",
  opts:["ln|sin x| + c","ln|cos x| + c","&minus;ln|sin x| + c","ln|sec x| + c"],
  ans:0,
  why:[
    "ঠিক — z = sin x ধরলে dz = cos x dx।",
    "এটি &int; tan x dx এর ঋণাত্মক রূপ; cot x এর নয়।",
    "চিহ্ন ভুল; এটি ln|cosec x|, যার অন্তরজ &minus;cot x।",
    "এটি &int; tan x dx এর ফল।"
  ],
  fast:"&int; cot x dx = ln|sin x| + c, আর &int; tan x dx = ln|sec x| + c।",
  tags:["p289","ত্রিকোণমিতিক ও বিশেষ যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.016", topic:"hmath1.ch10", type:'mc', b:0.1,
  stem:"&int; sec x dx = কত?",
  opts:["ln|sec x &minus; tan x| + c","tan x + c","ln|sec x + tan x| + c","sec x tan x + c"],
  ans:2,
  why:[
    "এটি উল্টো চিহ্নের ফল; এর মান &minus;ln|sec x + tan x|।",
    "এটি &int; sec<sup>2</sup>x dx এর ফল।",
    "ঠিক — লব ও হরকে (sec x + tan x) দিয়ে গুণ করে এই ফল আসে।",
    "এটি sec x এর অন্তরজ; যোগজ নয়।"
  ],
  fast:"&int; sec x dx = ln|sec x + tan x| + c = ln|tan(x/2 + &pi;/4)| + c।",
  tags:["p290","ত্রিকোণমিতিক ও বিশেষ যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.017", topic:"hmath1.ch10", type:'mc', b:0.3,
  stem:"&int; dx/(9 + x<sup>2</sup>) = কত?",
  opts:["tan<sup>&minus;1</sup>(x/3) + c","(1/9) tan<sup>&minus;1</sup>(x/9) + c","(1/3) tan<sup>&minus;1</sup>(x/3) + c","3 tan<sup>&minus;1</sup>(x/3) + c"],
  ans:2,
  why:[
    "1/a গুণক বাদ পড়েছে।",
    "a<sup>2</sup> নেওয়া হয়েছে; সূত্রে a নেয়।",
    "ঠিক — &int; dx/(a<sup>2</sup> + x<sup>2</sup>) = (1/a) tan<sup>&minus;1</sup>(x/a) + c, এখানে a = 3।",
    "1/a এর বদলে a গুণ করা হয়েছে।"
  ],
  fast:"&int; dx/(a<sup>2</sup> + x<sup>2</sup>) = (1/a) tan<sup>&minus;1</sup>(x/a) + c।",
  tags:["p290","ত্রিকোণমিতিক ও বিশেষ যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.018", topic:"hmath1.ch10", type:'mc', b:0.9,
  stem:"&int; dx/(25 &minus; x<sup>2</sup>) (যেখানে |x| &lt; 5) = কত?",
  opts:["(1/10) ln|(5 + x)/(5 &minus; x)| + c","(1/5) ln|(5 + x)/(5 &minus; x)| + c","(1/10) ln|(5 &minus; x)/(5 + x)| + c","(1/5) tan<sup>&minus;1</sup>(x/5) + c"],
  ans:0,
  why:[
    "ঠিক — &int; dx/(a<sup>2</sup> &minus; x<sup>2</sup>) = (1/2a) ln|(a + x)/(a &minus; x)| + c, a = 5।",
    "গুণক 1/2a = 1/10; 1/a নেওয়া ভুল।",
    "লব-হর উল্টে গেছে; এতে চিহ্ন বদলে যায়।",
    "এটি a<sup>2</sup> + x<sup>2</sup> হরের সূত্র; এখানে হরে বিয়োগ।"
  ],
  fast:"&int; dx/(a<sup>2</sup> &minus; x<sup>2</sup>) = (1/2a) ln|(a + x)/(a &minus; x)| + c, আর x<sup>2</sup> &minus; a<sup>2</sup> হলে লব-হর উল্টো।",
  tags:["p290","ত্রিকোণমিতিক ও বিশেষ যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.019", topic:"hmath1.ch10", type:'mc', b:0.3,
  stem:"&int; dx/&radic;(16 &minus; x<sup>2</sup>) = কত?",
  opts:["sin<sup>&minus;1</sup>x + c","(1/4) sin<sup>&minus;1</sup>(x/4) + c","cos<sup>&minus;1</sup>(x/4) + c","sin<sup>&minus;1</sup>(x/4) + c"],
  ans:3,
  why:[
    "x এর বদলে x/a লিখতে হয়; a = 4 বাদ পড়েছে।",
    "অতিরিক্ত 1/a গুণক বসেছে; এটি tan<sup>&minus;1</sup> সূত্রের গুণক।",
    "cos<sup>&minus;1</sup> এর অন্তরজ ঋণাত্মক, তাই এটি ভুল।",
    "ঠিক — x = 4 sin &theta; ধরলে dx = 4 cos &theta; d&theta; এবং ফল &theta;।"
  ],
  fast:"&int; dx/&radic;(a<sup>2</sup> &minus; x<sup>2</sup>) = sin<sup>&minus;1</sup>(x/a) + c; x = a sin &theta; প্রতিস্থাপনে পাওয়া যায়।",
  tags:["p291","প্রতিস্থাপন"]
});

ICE.Q.push({
  id:"hmath1.ch10.020", topic:"hmath1.ch10", type:'mc', b:0.1,
  stem:"&int; 2x/(x<sup>2</sup> + 1) dx = কত?",
  opts:["tan<sup>&minus;1</sup>x + c","ln(x<sup>2</sup> + 1) + c","2 ln(x<sup>2</sup> + 1) + c","ln(2x) + c"],
  ans:1,
  why:[
    "লব 1 হলে এটি হতো; এখানে লব 2x।",
    "ঠিক — লব হরের অন্তরজ, তাই z = x<sup>2</sup> + 1 ধরলে &int; dz/z।",
    "2x ইতিমধ্যে dz (= 2x dx) এ চলে গেছে, বাড়তি 2 গুণ নয়।",
    "হরের অন্তরজ লবে থাকলেও ফল ln(হর), ln(লব) নয়।"
  ],
  fast:"&int; f&prime;(x)/f(x) dx = ln|f(x)| + c; লব হরের অন্তরজ হলে হরের লগারিদম।",
  tags:["p291","প্রতিস্থাপন"]
});

ICE.Q.push({
  id:"hmath1.ch10.021", topic:"hmath1.ch10", type:'mc', b:0.5,
  stem:"&int; cos x &middot; e<sup>sin x</sup> dx = কত?",
  opts:["e<sup>cos x</sup> + c","e<sup>sin x</sup> + c","sin x &middot; e<sup>sin x</sup> + c","&minus;e<sup>sin x</sup> + c"],
  ans:1,
  why:[
    "সঠিক ভাবে চলক বসেনি; e এর ঘাত sin x।",
    "ঠিক — z = sin x ধরলে dz = cos x dx, ফল &int; e<sup>z</sup> dz।",
    "গুণফলের অন্তরজের আকার ধরা হয়েছে, অথচ সরল প্রতিস্থাপনেই হয়।",
    "dz = +cos x dx, ঋণাত্মক চিহ্ন আসে না।"
  ],
  fast:"যোজ্য রাশিতে f(x) ও তার অন্তরজ f&prime;(x) একসাথে থাকলে f(x) = z ধরে প্রতিস্থাপন করুন।",
  tags:["p291","প্রতিস্থাপন"]
});

ICE.Q.push({
  id:"hmath1.ch10.022", topic:"hmath1.ch10", type:'mc', b:0.9,
  stem:"&int; sin<sup>3</sup>x dx = কত?",
  opts:["cos x &minus; (cos<sup>3</sup>x)/3 + c","&minus;cos x &minus; (cos<sup>3</sup>x)/3 + c","(sin<sup>4</sup>x)/4 + c","&minus;cos x + (cos<sup>3</sup>x)/3 + c"],
  ans:3,
  why:[
    "dz = &minus;sin x dx; ঋণাত্মক চিহ্ন বাদ পড়েছে।",
    "&minus;(1 &minus; z<sup>2</sup>) এর দ্বিতীয় পদ ধনাত্মক হয়, ঋণাত্মক নয়।",
    "ঘাতের সূত্র ব্যবহার হয়েছে, কিন্তু sin x এর অন্তরজ cos x হ্রাস করেনি।",
    "ঠিক — sin<sup>3</sup>x = (1 &minus; cos<sup>2</sup>x) sin x, z = cos x ধরলে &minus;&int;(1 &minus; z<sup>2</sup>)dz।"
  ],
  fast:"sin x এর বিজোড় ঘাত হলে একটি sin x রেখে বাকিটা cos x এর রাশিতে লিখে z = cos x ধরুন।",
  tags:["p292","প্রতিস্থাপন"]
});

ICE.Q.push({
  id:"hmath1.ch10.023", topic:"hmath1.ch10", type:'mc', b:0.3,
  stem:"1/((x &minus; 1)(x + 2)) = A/(x &minus; 1) + B/(x + 2) হলে A ও B এর মান কত?",
  opts:["A = 1/3, B = &minus;1/3","A = &minus;1/3, B = 1/3","A = 1/3, B = 1/3","A = 1, B = &minus;1"],
  ans:0,
  why:[
    "ঠিক — x = 1 বসালে 3A = 1; x = &minus;2 বসালে &minus;3B = 1।",
    "দুটি মানের স্থান পাল্টে গেছে।",
    "B এর চিহ্ন ভুল; x = &minus;2 এ (x &minus; 1) = &minus;3।",
    "হর 3 দিয়ে ভাগ করা হয়নি।"
  ],
  fast:"আংশিক ভগ্নাংশে ধ্রুবক বের করতে প্রতিটি উৎপাদক শূন্য করা মান বসান (যেমন x = 1, x = &minus;2)।",
  tags:["p297","আংশিক ভগ্নাংশ"]
});

ICE.Q.push({
  id:"hmath1.ch10.024", topic:"hmath1.ch10", type:'mc', b:-0.3,
  stem:"অংশায়ন সূত্র কোনটি?",
  opts:["&int; uv dx = u &int; v dx + &int;{(du/dx) &int; v dx} dx","&int; uv dx = (&int; u dx)(&int; v dx)","&int; uv dx = u &int; v dx &minus; &int;{(du/dx) &int; v dx} dx","&int; uv dx = uv &minus; &int;(du/dx)(dv/dx) dx"],
  ans:2,
  why:[
    "দ্বিতীয় পদের আগে বিয়োগ হবে, যোগ নয়।",
    "দুই ফাংশনের গুণফলের যোগজ আলাদা যোগজের গুণফল নয়।",
    "ঠিক — গুণফলের অন্তরজ থেকে এই সূত্র আসে।",
    "প্রথম অংশে v এর যোগজ এবং দ্বিতীয় অংশে v এর যোগজ থাকবে, অন্তরজ নয়।"
  ],
  fast:"অংশায়ন: &int; uv dx = u &int; v dx &minus; &int;{(du/dx) &int; v dx} dx; সহজে যোগজযোগ্য নয় এমন ফাংশন u।",
  tags:["p299","অংশায়ন"]
});

ICE.Q.push({
  id:"hmath1.ch10.025", topic:"hmath1.ch10", type:'mc', b:0.3,
  stem:"&int; x ln x dx এ অংশায়নে প্রথম ফাংশন কোনটি ধরতে হবে?",
  opts:["x","x ln x","ln x","dx"],
  ans:2,
  why:[
    "x সহজে যোগজযোগ্য, তাই এটি দ্বিতীয় ফাংশন হওয়া উচিত।",
    "পুরো গুণফল প্রথম ফাংশন হয় না; দুটি অংশে ভাগ করতে হয়।",
    "ঠিক — ln x কে সরাসরি যোগজ করা যায় না, তাই এটি প্রথম ফাংশন।",
    "dx কোনো ফাংশন নয়, চলকের সংকেত।"
  ],
  fast:"যে ফাংশন সহজে যোগজ করা যায় না (যেমন ln x, tan<sup>&minus;1</sup>x) তাকে অংশায়নে প্রথম ফাংশন ধরুন।",
  tags:["p299","অংশায়ন"]
});

ICE.Q.push({
  id:"hmath1.ch10.026", topic:"hmath1.ch10", type:'mc', b:0.6,
  stem:"&int; x ln x dx = কত?",
  opts:["(x<sup>2</sup>/2) ln x &minus; x<sup>2</sup>/4 + c","(x<sup>2</sup>/2) ln x + x<sup>2</sup>/4 + c","(x<sup>2</sup>/2) ln x &minus; x<sup>2</sup>/2 + c","x ln x &minus; x + c"],
  ans:0,
  why:[
    "ঠিক — ln x &middot; x<sup>2</sup>/2 &minus; &int;(1/x)(x<sup>2</sup>/2)dx।",
    "দ্বিতীয় অংশ বিয়োগ হবে, যোগ নয়।",
    "&int;(x/2)dx = x<sup>2</sup>/4, x<sup>2</sup>/2 নয়।",
    "এটি &int; ln x dx এর ফল।"
  ],
  fast:"অংশায়নে &int; x ln x dx = (x<sup>2</sup>/2) ln x &minus; x<sup>2</sup>/4 + c।",
  tags:["p300","অংশায়ন"]
});

ICE.Q.push({
  id:"hmath1.ch10.027", topic:"hmath1.ch10", type:'mc', b:0.3,
  stem:"&int; x e<sup>x</sup> dx = কত?",
  opts:["e<sup>x</sup>(x + 1) + c","x e<sup>x</sup> + c","(x<sup>2</sup>/2) e<sup>x</sup> + c","e<sup>x</sup>(x &minus; 1) + c"],
  ans:3,
  why:[
    "দ্বিতীয় অংশ বিয়োগ হবে, তাই e<sup>x</sup> বিয়োগ।",
    "অংশায়নের দ্বিতীয় পদ বাদ পড়েছে।",
    "x কে ঘাতের সূত্রে যোগজ করে e<sup>x</sup> গুণ করা হয়েছে, যা অংশায়ন নয়।",
    "ঠিক — x e<sup>x</sup> &minus; &int; e<sup>x</sup> dx = x e<sup>x</sup> &minus; e<sup>x</sup>।"
  ],
  fast:"অংশায়নে x ও e<sup>x</sup> থাকলে x কে প্রথম ধরুন: &int; x e<sup>x</sup> dx = e<sup>x</sup>(x &minus; 1) + c।",
  tags:["p301","অংশায়ন"]
});

ICE.Q.push({
  id:"hmath1.ch10.028", topic:"hmath1.ch10", type:'mc', b:0.7,
  stem:"&int; e<sup>x</sup>(sin x + cos x) dx = কত?",
  opts:["e<sup>x</sup> cos x + c","e<sup>x</sup> sin x + c","e<sup>x</sup>(sin x &minus; cos x) + c","e<sup>x</sup>(sin x + cos x)/2 + c"],
  ans:1,
  why:[
    "এর অন্তরজ e<sup>x</sup>(cos x &minus; sin x)।",
    "ঠিক — f(x) = sin x হলে f&prime;(x) = cos x, তাই &int; e<sup>x</sup>{f + f&prime;}dx = e<sup>x</sup> f।",
    "এর অন্তরজ 2e<sup>x</sup> sin x।",
    "এর অন্তরজ e<sup>x</sup> cos x, যোজ্য রাশি নয়।"
  ],
  fast:"&int; e<sup>x</sup>{f(x) + f&prime;(x)} dx = e<sup>x</sup> f(x) + c।",
  tags:["p301","অংশায়ন"]
});

ICE.Q.push({
  id:"hmath1.ch10.029", topic:"hmath1.ch10", type:'mc', b:-0.3,
  stem:"&int;<sub>1</sub><sup>3</sup> (2x + 1) dx এর মান কত?",
  opts:["8","10","12","14"],
  ans:1,
  why:[
    "শুধু 2x এর যোগজ নেওয়া হয়েছে (9 &minus; 1); +1 অংশ বাদ গেছে।",
    "ঠিক — [x<sup>2</sup> + x] এ (9 + 3) &minus; (1 + 1) = 12 &minus; 2।",
    "শুধু উর্ধ্বসীমার মান বসেছে, নিম্নসীমার মান বিয়োগ হয়নি।",
    "নিম্নসীমার মান বিয়োগের বদলে যোগ হয়েছে (12 + 2)।"
  ],
  fast:"নির্দিষ্ট যোগজ = (উর্ধ্বসীমায় প্রতিঅন্তরজ) &minus; (নিম্নসীমায় প্রতিঅন্তরজ)।",
  tags:["p303","নির্দিষ্ট যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.030", topic:"hmath1.ch10", type:'mc', b:0.1,
  stem:"&int;<sub>0</sub><sup>&pi;/2</sup> sin 2x dx এর মান কত?",
  opts:["1/2","2","0","1"],
  ans:3,
  why:[
    "শুধু উর্ধ্বসীমার মান নেওয়া হয়েছে; নিম্নসীমার (&minus;1/2) বিয়োগ বাদ পড়েছে।",
    "2 দিয়ে ভাগ না করে গুণ করা হয়েছে।",
    "cos &pi; ও cos 0 এর যোগফল নেওয়া হয়েছে; সঠিক হলো বিয়োগ।",
    "ঠিক — [&minus;(cos 2x)/2] এ 1/2 &minus; (&minus;1/2) = 1।"
  ],
  fast:"sin mx এর যোগজ &minus;(cos mx)/m; সীমা বসাতে উর্ধ্বমান থেকে নিম্নমান বিয়োগ করুন।",
  tags:["p304","নির্দিষ্ট যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.031", topic:"hmath1.ch10", type:'mc', b:0.7,
  stem:"&int;<sub>0</sub><sup>1</sup> x e<sup>x<sup>2</sup></sup> dx এর মান কত?",
  opts:["(e &minus; 1)/2","e &minus; 1","(e + 1)/2","e/2"],
  ans:0,
  why:[
    "ঠিক — z = x<sup>2</sup> ধরলে (1/2)&int;<sub>0</sub><sup>1</sup> e<sup>z</sup> dz।",
    "2x এর জন্য আসা 1/2 গুণক বাদ পড়েছে।",
    "নিম্নসীমার মান e<sup>0</sup> = 1 বিয়োগ না করে যোগ করা হয়েছে।",
    "নিম্নসীমার মান (1) বিয়োগ করা হয়নি।"
  ],
  fast:"নির্দিষ্ট যোগজে প্রতিস্থাপন করলে সীমাও নতুন চলকে বদলে নিন, অথবা ফল আবার x-এ এনে সীমা বসান।",
  tags:["p304","নির্দিষ্ট যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.032", topic:"hmath1.ch10", type:'mc', b:-0.3,
  stem:"y = x<sup>2</sup> বক্ররেখা, x-অক্ষ এবং x = 0, x = 3 রেখা দ্বারা আবদ্ধ ক্ষেত্রের ক্ষেত্রফল কত বর্গ একক?",
  opts:["27","18","9","6"],
  ans:2,
  why:[
    "x<sup>3</sup> এর মান বসেছে; 3 দিয়ে ভাগ করা হয়নি।",
    "x<sup>2</sup> এর অন্তরজ 2x ধরে 3-এর বদলে 6 × 3 হিসাব হয়েছে।",
    "ঠিক — &int;<sub>0</sub><sup>3</sup> x<sup>2</sup> dx = 27/3।",
    "অন্তরজ 2x এ x = 3 বসিয়ে ফল নেওয়া হয়েছে।"
  ],
  fast:"y = f(x), x-অক্ষ, x = a ও x = b দ্বারা আবদ্ধ ক্ষেত্রের ক্ষেত্রফল = &int;<sub>a</sub><sup>b</sup> y dx।",
  tags:["p283","ক্ষেত্রফল"]
});

ICE.Q.push({
  id:"hmath1.ch10.033", topic:"hmath1.ch10", type:'mc', b:0.3,
  stem:"ট্রাপিজিয়াম সূত্রে h = 1 এবং চারটি কোটি 2, 3, 5, 8 হলে আসন্ন ক্ষেত্রফল কত?",
  opts:["26","18","13","9"],
  ans:2,
  why:[
    "&frac12; গুণক বাদ পড়েছে।",
    "সব কোটি একবার করে যোগ করে h দিয়ে গুণ করা হয়েছে (2 + 3 + 5 + 8)।",
    "ঠিক — &frac12;{2 + 2(3 + 5) + 8} = &frac12; &times; 26।",
    "সব কোটি একবার করে যোগ করে &frac12; দিয়ে গুণ করা হয়েছে; মাঝের কোটি দুবার ধরতে হয়।"
  ],
  fast:"ট্রাপিজিয়াম সূত্র: A = (h/2){y<sub>0</sub> + 2(y<sub>1</sub> + ... + y<sub>n&minus;1</sub>) + y<sub>n</sub>}।",
  tags:["p314","ট্রাপিজিয়াম সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.034", topic:"hmath1.ch10", type:'mc', b:-0.3,
  stem:"ট্রাপিজিয়াম সূত্রে ব্যবধির দৈর্ঘ্য h সম্পর্কে কোনটি সঠিক?",
  opts:["h যত ছোট, আসন্ন মান তত শুদ্ধ","h যত বড়, আসন্ন মান তত শুদ্ধ","h এর মান আসন্ন মানকে প্রভাবিত করে না","h = 1 হলেই কেবল সূত্র খাটে"],
  ans:0,
  why:[
    "ঠিক — ছোট ব্যবধি মানে বক্ররেখার সাথে বেশি মিল।",
    "বড় h এ ট্রাপিজিয়াম বক্ররেখা থেকে দূরে সরে যায়।",
    "h ছোট-বড় হলে ট্রাপিজিয়ামের সংখ্যা ও ফল বদলায়।",
    "h যেকোনো সমান মান হতে পারে, 1 হওয়া বাধ্যতামূলক নয়।"
  ],
  fast:"ট্রাপিজিয়াম সূত্রে h যত ছোট (কোটি যত বেশি), আসন্নীকরণ তত শুদ্ধ।",
  tags:["p314","ট্রাপিজিয়াম সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.035", topic:"hmath1.ch10", type:'mc', b:0.2,
  passage:"hmath1.ch10.u01",
  stem:"নির্ণেয় যোগজটির মান কত?",
  opts:["x sin x &minus; cos x + c","x cos x + sin x + c","(x<sup>2</sup>/2) sin x + c","x sin x + cos x + c"],
  ans:3,
  why:[
    "&minus;&int; sin x dx = +cos x; চিহ্ন ভুল হয়েছে।",
    "দুই ফাংশনের ভূমিকা উল্টে গেছে।",
    "x কে ঘাতের সূত্রে যোগজ করে sin x এর সাথে গুণ করা হয়েছে, যা অংশায়ন নয়।",
    "ঠিক — x sin x &minus; &int; sin x dx = x sin x + cos x।"
  ],
  fast:"অংশায়নে &int; x cos x dx = x sin x + cos x + c।",
  tags:["p300","অংশায়ন"]
});

ICE.Q.push({
  id:"hmath1.ch10.036", topic:"hmath1.ch10", type:'mc', b:0.6,
  passage:"hmath1.ch10.u01",
  stem:"উদ্দীপকের যোগজে নিম্নসীমা 0 ও উর্ধ্বসীমা &pi;/2 বসালে মান কত?",
  opts:["&pi;/2 + 1","&pi;/2 &minus; 1","&pi;/2","1 &minus; &pi;/2"],
  ans:1,
  why:[
    "নিম্নসীমার মান (1) বিয়োগের বদলে যোগ হয়েছে।",
    "ঠিক — [x sin x + cos x] এ (&pi;/2 + 0) &minus; (0 + 1)।",
    "নিম্নসীমায় cos 0 = 1 এর বিয়োগ বাদ পড়েছে।",
    "উর্ধ্ব ও নিম্নসীমার বিয়োগ উল্টো দিকে হয়েছে।"
  ],
  fast:"নির্দিষ্ট সীমায় অংশায়ন: [x sin x + cos x] এ সীমা বসিয়ে উর্ধ্ব থেকে নিম্ন বিয়োগ করুন।",
  tags:["p304","নির্দিষ্ট যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.037", topic:"hmath1.ch10", type:'mc', b:-0.2,
  passage:"hmath1.ch10.u02",
  stem:"&int; g(x) dx = কত?",
  opts:["(1/2) tan<sup>&minus;1</sup>(x/2) + c","ln(x<sup>2</sup> + 4) + c","2 ln(x<sup>2</sup> + 4) + c","x<sup>2</sup> + 4 + c"],
  ans:1,
  why:[
    "এটি &int; dx/(x<sup>2</sup> + 4) এর ফল; এখানে লব 2x।",
    "ঠিক — লব হরের অন্তরজ, তাই ফল ln(হর)।",
    "2x ইতিমধ্যে dz এ চলে গেছে; বাড়তি গুণক নেই।",
    "লব হরের অন্তরজ হলেও ফল হর নিজে নয়, তার লগারিদম।"
  ],
  fast:"লব হরের অন্তরজ হলে &int; f&prime;/f dx = ln|f| + c।",
  tags:["p291","প্রতিস্থাপন"]
});

ICE.Q.push({
  id:"hmath1.ch10.038", topic:"hmath1.ch10", type:'mc', b:0.5,
  passage:"hmath1.ch10.u02",
  stem:"0 থেকে 2 সীমায় &int; g(x) dx এর মান কত?",
  opts:["ln 8","ln 4","(1/2) ln 2","ln 2"],
  ans:3,
  why:[
    "নিম্নসীমার ln 4 বিয়োগ বাদ পড়েছে।",
    "ln এর ভেতরে 8 &minus; 4 নেওয়া হয়েছে; ln 8 &minus; ln 4 = ln(8/4)।",
    "2x থেকে আসা 2 কে আবার ভাগ করে অকারণে 1/2 গুণক বসেছে।",
    "ঠিক — z এর সীমা 4 থেকে 8, তাই ln 8 &minus; ln 4 = ln 2।"
  ],
  fast:"প্রতিস্থাপনের পর সীমা নতুন চলকে বদলে নিলে ln এর সীমার পার্থক্য ln(উর্ধ্ব/নিম্ন) হয়।",
  tags:["p304","নির্দিষ্ট যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.039", topic:"hmath1.ch10", type:'mc', b:-0.4,
  passage:"hmath1.ch10.u03",
  stem:"বক্ররেখা ও সরলরেখার ছেদবিন্দু দুটির x-স্থানাঙ্ক কত?",
  opts:["0 ও 1","0 ও 2","1 ও &minus;1","1 ও 2"],
  ans:0,
  why:[
    "ঠিক — x<sup>2</sup> = x থেকে x(x &minus; 1) = 0।",
    "x<sup>2</sup> = 2x ধরলে এটি আসত; সরলরেখা y = x।",
    "x<sup>2</sup> = 1 ধরা হয়েছে, যা y = x এর সাথে সমাধান নয়।",
    "x = 0 বাদ পড়েছে; ছেদবিন্দুর একটি মূল শূন্য।"
  ],
  fast:"দুটি বক্ররেখার ছেদবিন্দু সমীকরণ মিলিয়ে বের করে সেগুলোই ক্ষেত্রফলের সীমা।",
  tags:["p309","ক্ষেত্রফল"]
});

ICE.Q.push({
  id:"hmath1.ch10.040", topic:"hmath1.ch10", type:'mc', b:0.5,
  passage:"hmath1.ch10.u03",
  stem:"আবদ্ধ ক্ষেত্রের ক্ষেত্রফল কত বর্গ একক?",
  opts:["1/3","1/2","1/6","5/6"],
  ans:2,
  why:[
    "শুধু &int; x<sup>2</sup> dx (বক্ররেখার নিচের ক্ষেত্র) নেওয়া হয়েছে।",
    "শুধু &int; x dx (সরলরেখার নিচের ক্ষেত্র) নেওয়া হয়েছে।",
    "ঠিক — &int;<sub>0</sub><sup>1</sup> (x &minus; x<sup>2</sup>) dx = 1/2 &minus; 1/3।",
    "দুই ক্ষেত্র বিয়োগের বদলে যোগ করা হয়েছে (1/2 + 1/3)।"
  ],
  fast:"দুই বক্ররেখার মধ্যবর্তী ক্ষেত্রফল = &int;(উপরের &minus; নিচের) dx; ত্রিভুজ (1/2) থেকে 1/3 বাদ দিলেও 1/6।",
  tags:["p309","ক্ষেত্রফল"]
});

ICE.Q.push({
  id:"hmath1.ch10.041", topic:"hmath1.ch10", type:'mc', b:0.4,
  passage:"hmath1.ch10.u04",
  stem:"ট্রাপিজিয়াম সূত্রে আসন্ন ক্ষেত্রফল কত বর্গ একক?",
  opts:["44","30","22","64/3"],
  ans:2,
  why:[
    "&frac12; গুণক বাদ পড়েছে।",
    "সব কোটি একবার করে যোগ করা হয়েছে (0 + 1 + 4 + 9 + 16)।",
    "ঠিক — কোটি 0, 1, 4, 9, 16; &frac12;{0 + 2(1 + 4 + 9) + 16} = &frac12; &times; 44।",
    "এটি যোগজের প্রকৃত মান; ট্রাপিজিয়াম সূত্র আসন্ন মান দেয়।"
  ],
  fast:"x-এর সমান ব্যবধিতে কোটি বের করে সূত্র: (h/2){প্রথম + 2(মাঝেরগুলো) + শেষ}।",
  tags:["p314","ট্রাপিজিয়াম সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.042", topic:"hmath1.ch10", type:'mc', b:1,
  passage:"hmath1.ch10.u04",
  stem:"যোগজের প্রকৃত মান ও ট্রাপিজিয়াম সূত্রের আসন্ন মানের পার্থক্য কত?",
  opts:["2/3","1/3","4/3","0"],
  ans:0,
  why:[
    "ঠিক — প্রকৃত মান &int;<sub>0</sub><sup>4</sup> x<sup>2</sup> dx = 64/3, আর 22 &minus; 64/3 = 2/3।",
    "পার্থক্য হিসাবে 64/3 এর ভগ্নাংশ অংশ (1/3) নেওয়া হয়েছে।",
    "পার্থক্যকে দ্বিগুণ করা হয়েছে।",
    "ট্রাপিজিয়াম সূত্র আসন্ন মান দেয়; সবসময় প্রকৃত মানের সমান নয়।"
  ],
  fast:"ট্রাপিজিয়াম সূত্র আসন্ন মান দেয়; ব্যবধি ছোট করলে প্রকৃত যোগজের কাছাকাছি যায়।",
  tags:["p314","ট্রাপিজিয়াম সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.043", topic:"hmath1.ch10", type:'mc', b:0.6,
  passage:"hmath1.ch10.u05",
  stem:"&int; dx/(x<sup>2</sup> &minus; 1) = কত?",
  opts:["(1/2) ln|(x + 1)/(x &minus; 1)| + c","ln|(x &minus; 1)/(x + 1)| + c","(1/2) tan<sup>&minus;1</sup>x + c","(1/2) ln|(x &minus; 1)/(x + 1)| + c"],
  ans:3,
  why:[
    "লব-হর উল্টে গেছে।",
    "1/2a গুণক বাদ পড়েছে।",
    "হরে বিয়োগ থাকায় tan<sup>&minus;1</sup> সূত্র খাটে না।",
    "ঠিক — &int; dx/(x<sup>2</sup> &minus; a<sup>2</sup>) = (1/2a) ln|(x &minus; a)/(x + a)| + c, a = 1।"
  ],
  fast:"&int; dx/(x<sup>2</sup> &minus; a<sup>2</sup>) = (1/2a) ln|(x &minus; a)/(x + a)| + c।",
  tags:["p290","ত্রিকোণমিতিক ও বিশেষ যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.044", topic:"hmath1.ch10", type:'mc', b:0.9,
  passage:"hmath1.ch10.u05",
  stem:"2 থেকে 3 সীমায় &int; dx/(x<sup>2</sup> &minus; 1) এর মান কত?",
  opts:["(1/2) ln(2/3)","(1/2) ln(3/2)","ln(3/2)","&minus;(1/2) ln 2"],
  ans:1,
  why:[
    "উর্ধ্ব ও নিম্ন মানের বিয়োগ উল্টো দিকে হয়েছে।",
    "ঠিক — (1/2){ln(1/2) &minus; ln(1/3)} = (1/2) ln(3/2)।",
    "(1/2) গুণক বাদ পড়েছে।",
    "শুধু উর্ধ্বসীমার মান (1/2)ln(1/2) নেওয়া হয়েছে।"
  ],
  fast:"সীমা বসাতে প্রতিঅন্তরজে উর্ধ্বমান &minus; নিম্নমান; ln এর বিয়োগ লগারিদমের ভাগ হয়ে যায়।",
  tags:["p297","আংশিক ভগ্নাংশ"]
});

ICE.Q.push({
  id:"hmath1.ch10.045", topic:"hmath1.ch10", type:'mc', b:-0.3,
  passage:"hmath1.ch10.u06",
  stem:"z = sin x প্রতিস্থাপনে z এর সীমা কত হবে?",
  opts:["0 থেকে &pi;/2","0 থেকে 1","0 থেকে &minus;1","1 থেকে 0"],
  ans:1,
  why:[
    "পুরোনো সীমা রেখে দেওয়া হয়েছে; নতুন চলকে বদলাতে হয়।",
    "ঠিক — x = 0 এ z = 0 এবং x = &pi;/2 এ z = 1।",
    "sin(&pi;/2) = 1, &minus;1 নয়।",
    "উর্ধ্ব ও নিম্নসীমা উল্টে গেছে।"
  ],
  fast:"প্রতিস্থাপন করলে সীমাও নতুন চলকে বদলাতে হয়: x = a এ z = f(a), x = b এ z = f(b)।",
  tags:["p304","নির্দিষ্ট যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.046", topic:"hmath1.ch10", type:'mc', b:0.2,
  passage:"hmath1.ch10.u06",
  stem:"যোগজটির মান কত?",
  opts:["1/3","1/2","1","1/4"],
  ans:3,
  why:[
    "ঘাত 3 কে 3 দিয়ে ভাগ করা হয়েছে; ভাগ হবে নতুন ঘাত 4 দিয়ে।",
    "z<sup>3</sup> এর যোগজ z<sup>2</sup>/2 ধরা হয়েছে।",
    "z<sup>3</sup> এ z = 1 বসিয়ে যোগজীকরণ বাদ দেওয়া হয়েছে।",
    "ঠিক — &int;<sub>0</sub><sup>1</sup> z<sup>3</sup> dz = 1/4।"
  ],
  fast:"sin<sup>n</sup>x cos x dx তে z = sin x ধরলে ফল z<sup>n+1</sup>/(n+1); সীমা 0 ও 1 হলে 1/(n+1)।",
  tags:["p304","নির্দিষ্ট যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.047", topic:"hmath1.ch10", type:'mcomp', b:-0.3,
  stem:"অনির্দিষ্ট যোগজ সম্পর্কে নিচের উক্তিগুলো লক্ষ করো",
  sts:["একটি ফাংশনের প্রতিঅন্তরজ অসংখ্য হতে পারে","অনির্দিষ্ট যোগজের ফলে যোগজীকরণ ধ্রুবক c যুক্ত থাকে","নির্দিষ্ট যোগজের ফলেও c লিখতে হয়"],
  ans:0,
  why:[
    "ঠিক — প্রথম দুটি সত্য; iii সত্য নয়।",
    "iii ভুল, তাই i ও iii একসাথে সঠিক নয়।",
    "i বাদ দেওয়া যায় না; তা না হলে c-এর প্রয়োজন বোঝা যায় না।",
    "iii ভুল: নির্দিষ্ট যোগজে c কেটে যায়।"
  ],
  fast:"অনির্দিষ্ট যোগজ অনন্য নয়, তাই + c লাগে; নির্দিষ্ট যোগজে c কেটে যায়।",
  tags:["p283","অনির্দিষ্ট যোগজ ও সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.048", topic:"hmath1.ch10", type:'mcomp', b:0.1,
  stem:"যোগজের ধর্ম সম্পর্কে নিচের উক্তিগুলো লক্ষ করো",
  sts:["k ধ্রুবক হলে &int; k f(x) dx = k &int; f(x) dx","দুই ফাংশনের গুণফলের যোগজ আলাদা যোগজের গুণফলের সমান","দুই ফাংশনের যোগফলের যোগজ আলাদা যোগজের যোগফলের সমান"],
  ans:1,
  why:[
    "ii ভুল, তাই i ও ii সঠিক জোড় নয়।",
    "ঠিক — i ও iii যোগজের ধর্ম; ii সত্য নয়।",
    "i বাদ গেছে; ধ্রুবক বাইরে আনা যায়।",
    "ii ভুল: গুণফলের যোগজের জন্য অংশায়ন লাগে।"
  ],
  fast:"ধ্রুবক বাইরে আনা যায় এবং যোগফলের যোগজ ভাগ করা যায়; গুণফলের যোগজ ভাগ করা যায় না।",
  tags:["p284","অনির্দিষ্ট যোগজ ও সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.049", topic:"hmath1.ch10", type:'mcomp', b:0.2,
  stem:"কয়েকটি সূত্র সম্পর্কে নিচের উক্তিগুলো লক্ষ করো",
  sts:["&int; sec<sup>2</sup>x dx = &minus;tan x + c","&int; cosec<sup>2</sup>x dx = &minus;cot x + c","&int; sec x tan x dx = sec x + c"],
  ans:2,
  why:[
    "i ভুল, তাই i ও ii সঠিক নয়।",
    "i ভুল, তাই i ও iii সঠিক নয়।",
    "ঠিক — ii ও iii সঠিক; i ভুল (সঠিক ফল +tan x)।",
    "i ভুল, তাই তিনটি একসাথে সঠিক নয়।"
  ],
  fast:"&int; sec<sup>2</sup>x dx = tan x + c এবং &int; cosec<sup>2</sup>x dx = &minus;cot x + c।",
  tags:["p284","অনির্দিষ্ট যোগজ ও সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.050", topic:"hmath1.ch10", type:'mcomp', b:-0.1,
  stem:"বিপরীত ত্রিকোণমিতিক সূত্র সম্পর্কে নিচের উক্তিগুলো লক্ষ করো",
  sts:["&int; dx/(1 + x<sup>2</sup>) = tan<sup>&minus;1</sup>x + c","&int; dx/&radic;(1 &minus; x<sup>2</sup>) = sin<sup>&minus;1</sup>x + c","&int; dx/(x&radic;(x<sup>2</sup> &minus; 1)) = sec<sup>&minus;1</sup>x + c"],
  ans:3,
  why:[
    "iii-ও সঠিক, তাই শুধু i ও ii নয়।",
    "ii-ও সঠিক, তাই শুধু i ও iii নয়।",
    "i-ও সঠিক, তাই শুধু ii ও iii নয়।",
    "ঠিক — তিনটিই বইয়ের সূত্র।"
  ],
  fast:"tan<sup>&minus;1</sup>, sin<sup>&minus;1</sup>, sec<sup>&minus;1</sup> এর অন্তরজ থেকে তিনটি মৌলিক যোগজ সূত্র পাওয়া যায়।",
  tags:["p285","অনির্দিষ্ট যোগজ ও সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.051", topic:"hmath1.ch10", type:'mcomp', b:0.2,
  stem:"সহগযুক্ত চলকের যোগজ সম্পর্কে নিচের উক্তিগুলো লক্ষ করো",
  sts:["&int; sin mx dx = (cos mx)/m + c","&int; cos mx dx = (sin mx)/m + c","&int; e<sup>mx</sup> dx = e<sup>mx</sup>/m + c"],
  ans:2,
  why:[
    "i ভুল, তাই i ও ii নয়।",
    "i ভুল, তাই i ও iii নয়।",
    "ঠিক — ii ও iii সঠিক; i এ চিহ্ন ঋণাত্মক হবে।",
    "i ভুল, তাই তিনটি নয়।"
  ],
  fast:"&int; sin mx dx = &minus;(cos mx)/m + c; cos mx ও e<sup>mx</sup> এর যোগজে চিহ্ন বদলায় না, শুধু m দিয়ে ভাগ।",
  tags:["p287","প্রতিস্থাপন"]
});

ICE.Q.push({
  id:"hmath1.ch10.052", topic:"hmath1.ch10", type:'mcomp', b:0.3,
  stem:"কিছু যোগজ সম্পর্কে নিচের উক্তিগুলো লক্ষ করো",
  sts:["&int; tan x dx = ln|sec x| + c","&int; cot x dx = ln|sin x| + c","&int; sec x dx = ln|sec x &minus; tan x| + c"],
  ans:0,
  why:[
    "ঠিক — i ও ii সঠিক; iii এ সঠিক ফল ln|sec x + tan x|।",
    "iii ভুল, তাই i ও iii নয়।",
    "i বাদ দেওয়া যায় না; ln|sec x| ঠিক।",
    "iii ভুল, তাই তিনটি নয়।"
  ],
  fast:"&int; sec x dx = ln|sec x + tan x| + c, &int; tan x dx = ln|sec x| + c, &int; cot x dx = ln|sin x| + c।",
  tags:["p289","ত্রিকোণমিতিক ও বিশেষ যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.053", topic:"hmath1.ch10", type:'mcomp', b:0,
  stem:"অংশায়ন পদ্ধতি সম্পর্কে নিচের উক্তিগুলো লক্ষ করো",
  sts:["এটি দুই ফাংশনের গুণফলের যোগজ নির্ণয়ে ব্যবহৃত হয়","সহজে যোগজযোগ্য নয় এমন ফাংশনকে প্রথম ফাংশন ধরা হয়","এটি গুণফলের অন্তরজ নির্ণয়ের নিয়মের ওপর ভিত্তি করে গঠিত"],
  ans:3,
  why:[
    "iii-ও সঠিক, তাই শুধু i ও ii নয়।",
    "ii-ও সঠিক, তাই শুধু i ও iii নয়।",
    "i-ও সঠিক, তাই শুধু ii ও iii নয়।",
    "ঠিক — তিনটি উক্তিই সত্য।"
  ],
  fast:"অংশায়ন গুণফলের অন্তরজ থেকে তৈরি; সহজে যোগজ করা যায় না এমন ফাংশন প্রথম।",
  tags:["p299","অংশায়ন"]
});

ICE.Q.push({
  id:"hmath1.ch10.054", topic:"hmath1.ch10", type:'mcomp', b:-0.2,
  stem:"নির্দিষ্ট যোগজ সম্পর্কে নিচের উক্তিগুলো লক্ষ করো",
  sts:["&int;<sub>a</sub><sup>b</sup> f(x) dx = G(b) &minus; G(a), যেখানে G হলো f এর একটি প্রতিঅন্তরজ","নির্দিষ্ট যোগজের মান নির্ণয়ে যোগজীকরণ ধ্রুবক c লিখতে হয় না","a কে উর্ধ্বপ্রান্ত এবং b কে নিম্নপ্রান্ত বলা হয়"],
  ans:0,
  why:[
    "ঠিক — i ও ii সত্য; iii ভুল (a নিম্ন, b উর্ধ্ব)।",
    "iii ভুল, তাই i ও iii নয়।",
    "i সত্য, তাই ii ও iii একসাথে সঠিক হতে পারে না।",
    "iii ভুল, তাই তিনটি নয়।"
  ],
  fast:"&int;<sub>a</sub><sup>b</sup> এ a নিম্নপ্রান্ত, b উর্ধ্বপ্রান্ত; মান = G(b) &minus; G(a)।",
  tags:["p282","নির্দিষ্ট যোগজ"]
});

ICE.Q.push({
  id:"hmath1.ch10.055", topic:"hmath1.ch10", type:'mcomp', b:0.1,
  stem:"ট্রাপিজিয়াম সূত্র সম্পর্কে নিচের উক্তিগুলো লক্ষ করো",
  sts:["n সংখ্যক সমান ব্যবধি নিলে কোটির সংখ্যা n + 1","ব্যবধি যত বড় হবে আসন্ন মান তত শুদ্ধ হবে","সূত্রে প্রথম ও শেষ কোটি একবার করে এবং মাঝের কোটিগুলো দুবার করে ধরা হয়"],
  ans:1,
  why:[
    "ii ভুল, তাই i ও ii নয়।",
    "ঠিক — i ও iii সঠিক; ii উল্টো কথা।",
    "ii ভুল, তাই ii ও iii নয়।",
    "ii ভুল, তাই তিনটি নয়।"
  ],
  fast:"n ব্যবধির জন্য n + 1 কোটি; সূত্রে মাঝের কোটি দুবার, প্রান্তের কোটি একবার।",
  tags:["p314","ট্রাপিজিয়াম সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch10.056", topic:"hmath1.ch10", type:'mcomp', b:0.5,
  stem:"ক্ষেত্রফল সম্পর্কে নিচের উক্তিগুলো লক্ষ করো",
  sts:["x<sup>2</sup> + y<sup>2</sup> = 16 বৃত্তের ক্ষেত্রফল 8&pi; বর্গ একক","x<sup>2</sup>/9 + y<sup>2</sup>/4 = 1 উপবৃত্তের ক্ষেত্রফল 6&pi; বর্গ একক","প্রথম চতুর্ভাগের ক্ষেত্রফল বের করে 4 দিয়ে গুণ করে বৃত্ত বা উপবৃত্তের মোট ক্ষেত্রফল পাওয়া যায়"],
  ans:2,
  why:[
    "i ভুল (সঠিক 16&pi;), তাই i ও ii নয়।",
    "i ভুল, তাই i ও iii নয়।",
    "ঠিক — ii ও iii সঠিক; i এ সঠিক মান 16&pi;।",
    "i ভুল, তাই তিনটি নয়।"
  ],
  fast:"বৃত্ত x<sup>2</sup> + y<sup>2</sup> = 16 এর ক্ষেত্রফল 16&pi; এবং x<sup>2</sup>/9 + y<sup>2</sup>/4 = 1 এর 6&pi; বর্গ একক।",
  tags:["p310","ক্ষেত্রফল"]
});

ICE.Q.push({
  id:"hmath1.ch10.057", topic:"hmath1.ch10", type:'mcomp', b:0.6,
  stem:"y<sup>2</sup> = 4ax ও x<sup>2</sup> = 4ay পরাবৃত্ত দুটি সম্পর্কে নিচের উক্তিগুলো লক্ষ করো",
  sts:["এরা মূলবিন্দু ও (4a, 4a) বিন্দুতে ছেদ করে","আবদ্ধ ক্ষেত্রের ক্ষেত্রফল 8a<sup>2</sup>/3 বর্গ একক","ক্ষেত্রফল নির্ণয়ে যোগজের সীমা x = 0 থেকে x = 4a"],
  ans:1,
  why:[
    "ii ভুল (সঠিক 16a<sup>2</sup>/3), তাই i ও ii নয়।",
    "ঠিক — i ও iii সঠিক; ii এ ক্ষেত্রফল 16a<sup>2</sup>/3।",
    "ii ভুল, তাই ii ও iii নয়।",
    "ii ভুল, তাই তিনটি নয়।"
  ],
  fast:"y<sup>2</sup> = 4ax ও x<sup>2</sup> = 4ay আবদ্ধ ক্ষেত্রের ক্ষেত্রফল 16a<sup>2</sup>/3 বর্গ একক; সীমা 0 থেকে 4a।",
  tags:["p309","ক্ষেত্রফল"]
});

