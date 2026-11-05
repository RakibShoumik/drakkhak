/* ===========================================================
   উচ্চতর গণিত ১ম পত্র — সপ্তম অধ্যায়
   সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত

   উৎস: Higher Math 1st (এনসিটিবি), পিডিএফ পৃষ্ঠা ১৭৩–২০৯।
   OCR-এর সূত্র এলোমেলো, তাই প্রমিত ত্রিকোণমিতির সূত্র ও বইয়ের বর্ণনা মিলিয়ে নেওয়া হয়েছে।
   প্রতিটি সংখ্যাগত প্রশ্নের মান দুই ভিন্ন পথে (সূত্র এবং বিকল্প অভেদ বা দশমিক মান) মিলানো হয়েছে।
   বইয়ের নিজস্ব উদাহরণ ও প্রশ্নমালার সংখ্যা ব্যবহার করা হয়নি।
   =========================================================== */

ICE.P.push({
  id:"hmath1.ch7.u01", topic:"hmath1.ch7", note:"যৌগিক কোণ",
  text:"<p>A ও B দুটি সূক্ষ্মকোণ। sin A = 3/5 এবং cos B = 5/13।</p>"
});

ICE.P.push({
  id:"hmath1.ch7.u02", topic:"hmath1.ch7", note:"চতুর্ভাগ ও ঋণাত্মক কোণ",
  text:"<p>&theta; কোণটি দ্বিতীয় চতুর্ভাগে অবস্থিত (90&deg; &lt; &theta; &lt; 180&deg;) এবং sin &theta; = 5/13।</p>"
});

ICE.P.push({
  id:"hmath1.ch7.u03", topic:"hmath1.ch7", note:"দ্বিগুণ ও তিনগুণ কোণ",
  text:"<p>&theta; একটি সূক্ষ্মকোণ এবং tan &theta; = 3/4।</p>"
});

ICE.P.push({
  id:"hmath1.ch7.u04", topic:"hmath1.ch7", note:"ত্রিভুজের সমাধান",
  text:"<p>ABC ত্রিভুজের বাহু a = 7 cm, b = 15 cm ও c = 20 cm।</p>"
});

ICE.P.push({
  id:"hmath1.ch7.u05", topic:"hmath1.ch7", note:"দ্ব্যর্থক ক্ষেত্র",
  text:"<p>ABC ত্রিভুজে B = 30&deg;, c = 10 cm এবং b = 6 cm দেওয়া আছে। C কোণটি নির্ণয় করতে হবে।</p>"
});

ICE.Q.push({
  id:"hmath1.ch7.001", topic:"hmath1.ch7", type:'mc', b:-1.4,
  stem:"sin (360&deg; + &theta;) এর মান কোনটির সমান?",
  opts:["cos &theta;","sin &theta;","&minus;sin &theta;","tan &theta;"],
  ans:1,
  why:["sin অনুপাত cos হয়ে যায় না; 360&deg; জোড় গুণিতক, রূপান্তর ঘটায় না।","ঠিক — 360&deg; যোগ করলে ঘূর্ণায়মান রশ্মি একই স্থানে ফেরে, তাই অনুপাতের মান বদলায় না।","চিহ্ন বদলানোর কারণ নেই; পূর্ণ ঘূর্ণনে রশ্মি একই চতুর্ভাগে থাকে।","tan হয় না; ভিন্ন অনুপাত বসানো ভুল।"],
  fast:"n&times;360&deg; + &theta; কোণের যেকোনো অনুপাত &theta; কোণের একই অনুপাতের সমান।",
  tags:["p173","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.002", topic:"hmath1.ch7", type:'mc', b:-0.5,
  stem:"sin 1110&deg; এর মান কত?",
  opts:["1/2","&radic;3/2","&minus;1/2","1"],
  ans:0,
  why:["ঠিক — 1110&deg; = 3&times;360&deg; + 30&deg;, তাই sin 30&deg; = 1/2।","&radic;3/2 হলো sin 60&deg;; কোণটি 60&deg; ধরা ভুল।","ঋণাত্মক হওয়ার কারণ নেই; 30&deg; প্রথম চতুর্ভাগে।","1 হলো sin 90&deg;; 30&deg; এর সাইন 1 নয়।"],
  fast:"বড় কোণ থেকে 360&deg; এর গুণিতক বাদ দিয়ে ছোট কোণে নামিয়ে আনুন।",
  tags:["p173","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.003", topic:"hmath1.ch7", type:'mc', b:-0.9,
  stem:"নিচের কোনটি সঠিক?",
  opts:["cos(&minus;&theta;) = &minus;cos &theta;","sec(&minus;&theta;) = &minus;sec &theta;","cosec(&minus;&theta;) = cosec &theta;","cos(&minus;&theta;) = cos &theta;"],
  ans:3,
  why:["এটি sin বা tan এর ধর্ম; cos জোড় ফাংশন।","sec হলো cos এর অন্যোন্যক, তাই সেও জোড়; চিহ্ন বদলায় না।","cosec হলো sin এর অন্যোন্যক, তাই বিজোড়: cosec(&minus;&theta;) = &minus;cosec &theta;।","ঠিক — কোসাইন ও সেকেন্ট জোড় ফাংশন; ঋণাত্মক কোণে মান বদলায় না।"],
  fast:"ঋণাত্মক কোণে কেবল cos ও sec এর মান অপরিবর্তিত; বাকি চারটির চিহ্ন উল্টে যায়।",
  tags:["p174","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.004", topic:"hmath1.ch7", type:'mc', b:-1,
  stem:"tan (90&deg; &minus; &theta;) এর মান কত?",
  opts:["&minus;cot &theta;","tan &theta;","cot &theta;","&minus;tan &theta;"],
  ans:2,
  why:["রূপান্তর ঠিক, কিন্তু চিহ্ন ধনাত্মক; ঋণাত্মক নয়।","90&deg; বিজোড় গুণিতকে অনুপাত বদলায়; tan অপরিবর্তিত থাকে না।","ঠিক — 90&deg; বিজোড় গুণিতক, তাই tan রূপান্তরিত হয়ে cot হয়; প্রথম চতুর্ভাগে চিহ্ন ধনাত্মক।","অনুপাত ও চিহ্ন দুটিই ভুল।"],
  fast:"পরিপূরক কোণের নিয়ম: একটি অনুপাত = তার সহ-অনুপাত (tan 25&deg; = cot 65&deg;)।",
  tags:["p175","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.005", topic:"hmath1.ch7", type:'mc', b:-0.6,
  stem:"cos (90&deg; + &theta;) এর মান কত?",
  opts:["sin &theta;","&minus;sin &theta;","cos &theta;","&minus;cos &theta;"],
  ans:1,
  why:["রূপান্তর ঠিক, কিন্তু দ্বিতীয় চতুর্ভাগে cos ঋণাত্মক; ধনাত্মক নয়।","ঠিক — 90&deg; + &theta; দ্বিতীয় চতুর্ভাগে, সেখানে cos ঋণাত্মক, আর অনুপাত sin হয়।","90&deg; বিজোড় গুণিতক, তাই অনুপাত cos থাকে না।","অনুপাত ভুল; রূপান্তর হয়ে sin হয়, cos থাকে না।"],
  fast:"cos(90&deg; + &theta;) = &minus;sin &theta; এবং sin(90&deg; + &theta;) = cos &theta;।",
  tags:["p176","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.006", topic:"hmath1.ch7", type:'mc', b:-0.5,
  stem:"cos 120&deg; এর মান কত?",
  opts:["&minus;1/2","1/2","&minus;&radic;3/2","&radic;3/2"],
  ans:0,
  why:["ঠিক — cos(180&deg; &minus; 60&deg;) = &minus;cos 60&deg; = &minus;1/2।","ঋণাত্মক চিহ্ন বাদ পড়েছে; দ্বিতীয় চতুর্ভাগে cos ঋণাত্মক।","এটি &minus;cos 30&deg; এর মান; কোণ 60&deg; ধরতে হবে।","এটি cos 30&deg; এর মান।"],
  fast:"দ্বিতীয় চতুর্ভাগে কেবল sin ও cosec ধনাত্মক; cos 120&deg; = &minus;1/2।",
  tags:["p177","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.007", topic:"hmath1.ch7", type:'mc', b:0,
  stem:"cos (270&deg; &minus; &theta;) এর মান কত?",
  opts:["sin &theta;","&minus;cos &theta;","cos &theta;","&minus;sin &theta;"],
  ans:3,
  why:["অনুপাত ঠিক, কিন্তু তৃতীয় চতুর্ভাগে cos ঋণাত্মক।","270&deg; বিজোড় গুণিতক, তাই cos অনুপাত বজায় থাকে না।","অনুপাতও ভুল, চিহ্নও ভুল।","ঠিক — 270&deg; বিজোড় গুণিতকে cos হয় sin; তৃতীয় চতুর্ভাগে cos ঋণাত্মক।"],
  fast:"270&deg; &minus; &theta; এ sin, cos উভয়ই ঋণাত্মক হয় এবং অনুপাত সহ-অনুপাতে বদলায়।",
  tags:["p178","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.008", topic:"hmath1.ch7", type:'mc', b:0.2,
  stem:"tan (270&deg; + &theta;) এর মান কোনটি?",
  opts:["cot &theta;","tan &theta;","&minus;cot &theta;","&minus;tan &theta;"],
  ans:2,
  why:["অনুপাত ঠিক, কিন্তু চতুর্থ চতুর্ভাগে tan ঋণাত্মক।","বিজোড় গুণিতকে অনুপাত বদলায়, tan থাকে না।","ঠিক — 270&deg; + &theta; চতুর্থ চতুর্ভাগে, সেখানে tan ঋণাত্মক; আর অনুপাত cot হয়।","অনুপাত বদলানোর নিয়ম না মানলে এই ভুল হয়।"],
  fast:"sin(270&deg; + &theta;) = &minus;cos &theta;, cos(270&deg; + &theta;) = sin &theta;, tan(270&deg; + &theta;) = &minus;cot &theta;।",
  tags:["p178","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.009", topic:"hmath1.ch7", type:'mc', b:0,
  stem:"কোনটি অনুপাতের রূপ বদলে ভিন্ন অনুপাত তৈরি করে?",
  opts:["sin(180&deg; &minus; &theta;)","tan(270&deg; &minus; &theta;)","cos(360&deg; &minus; &theta;)","tan(180&deg; + &theta;)"],
  ans:1,
  why:["180&deg; জোড় গুণিতক; sin অনুপাত sin-ই থাকে।","ঠিক — 270&deg; হলো 90&deg; এর বিজোড় গুণিতক; tan(270&deg; &minus; &theta;) = cot &theta;।","360&deg; জোড় গুণিতক; cos অনুপাত cos-ই থাকে।","180&deg; জোড় গুণিতক; tan অনুপাত tan-ই থাকে।"],
  fast:"90&deg; এর জোড় গুণিতকে (180&deg;, 360&deg;) অনুপাত একই থাকে; বিজোড় গুণিতকে (90&deg;, 270&deg;) সহ-অনুপাত হয়।",
  tags:["p178","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.010", topic:"hmath1.ch7", type:'mc', b:0,
  stem:"cos (&minus;780&deg;) এর মান কত?",
  opts:["1/2","&minus;1/2","&radic;3/2","&minus;&radic;3/2"],
  ans:0,
  why:["ঠিক — cos জোড় ফাংশন, তাই cos 780&deg; = cos(2&times;360&deg; + 60&deg;) = cos 60&deg; = 1/2।","ঋণাত্মক কোণ হলেও cos এর চিহ্ন বদলায় না।","এটি cos 30&deg;; বাদ দেওয়ার পর অবশিষ্ট কোণ 60&deg;, 30&deg; নয়।","অবশিষ্ট কোণ ও চিহ্ন দুটিই ভুল।"],
  fast:"cos(&minus;x) = cos x; তারপর 360&deg; এর গুণিতক বাদ দিন।",
  tags:["p179","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.011", topic:"hmath1.ch7", type:'mc', b:0.5,
  stem:"sin 2025&deg; এর মান কত?",
  opts:["1/&radic;2","&minus;1","1","&minus;1/&radic;2"],
  ans:3,
  why:["225&deg; তৃতীয় চতুর্ভাগে, সেখানে sin ঋণাত্মক।","sin 45&deg; এর মান 1 নয়; 1/&radic;2।","225&deg; তে sin এর মান ঋণাত্মক, কিন্তু 1 হওয়ার কারণ নেই।","ঠিক — 2025&deg; = 5&times;360&deg; + 225&deg;, আর sin 225&deg; = &minus;sin 45&deg; = &minus;1/&radic;2।"],
  fast:"শেষ অবস্থান কোন চতুর্ভাগে তা দেখে চিহ্ন, আর 180&deg; এর সাথে পার্থক্য দেখে মান নির্ণয় করুন।",
  tags:["p179","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.012", topic:"hmath1.ch7", type:'mc', b:0.5,
  stem:"cos 10&deg; + cos 170&deg; + cos 190&deg; + cos 350&deg; এর মান কত?",
  opts:["1","2cos 10&deg;","0","&minus;2cos 10&deg;"],
  ans:2,
  why:["চারটি পদ কাটাকাটি হয়ে যায়; 1 আসে না।","cos 350&deg; ধনাত্মক; এটি ঠিক ধরে দুটি &minus;cos 10&deg; বাদ দিলে এই মান পাওয়া যায় না।","ঠিক — cos 170&deg; = cos 190&deg; = &minus;cos 10&deg; এবং cos 350&deg; = cos 10&deg;, তাই যোগফল 0।","দুটি ঋণাত্মক পদ আছে, তবু যোগফল ঋণাত্মক হয় না; তৃতীয় পদটি তা সামলায়।"],
  fast:"180&deg; &plusmn; x ও 360&deg; &minus; x আকারের কোণগুলোকে x এর অনুপাতে এনে কাটাকাটি করুন।",
  tags:["p179","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.013", topic:"hmath1.ch7", type:'mc', b:-1.2,
  stem:"sin(A &minus; B) এর সূত্র কোনটি?",
  opts:["sin A cos B + cos A sin B","sin A cos B &minus; cos A sin B","cos A cos B + sin A sin B","cos A cos B &minus; sin A sin B"],
  ans:1,
  why:["এটি sin(A + B) এর সূত্র।","ঠিক — বিয়োগের ক্ষেত্রে sin এর মাঝের চিহ্নও বিয়োগ।","এটি cos(A &minus; B) এর সূত্র।","এটি cos(A + B) এর সূত্র।"],
  fast:"sin(A &plusmn; B) = sinA cosB &plusmn; cosA sinB (চিহ্ন একই); cos(A &plusmn; B) = cosA cosB &#8723; sinA sinB (চিহ্ন উল্টো)।",
  tags:["p182","যৌগিক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.014", topic:"hmath1.ch7", type:'mc', b:0.3,
  stem:"cos 75&deg; এর মান কত?",
  opts:["(&radic;3 &minus; 1)/(2&radic;2)","(&radic;3 + 1)/(2&radic;2)","(&radic;3 &minus; 1)/2","&radic;3/2"],
  ans:0,
  why:["ঠিক — cos(45&deg; + 30&deg;) = cos45 cos30 &minus; sin45 sin30 = (&radic;3 &minus; 1)/(2&radic;2) &asymp; 0.2588।","এটি sin 75&deg; এর মান; cos(A + B) এ মাঝে বিয়োগ থাকে, যোগ নয়।","হরে &radic;2 বাদ পড়েছে; মান 0.366 হয়ে যায়, যা cos 75&deg; এর চেয়ে অনেক বড়।","এটি cos 30&deg;; 75&deg; এর মান অনেক ছোট।"],
  fast:"cos 75&deg; = (&radic;3 &minus; 1)/(2&radic;2) এবং sin 75&deg; = (&radic;3 + 1)/(2&radic;2)।",
  tags:["p184","যৌগিক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.015", topic:"hmath1.ch7", type:'mc', b:0.3,
  stem:"tan 15&deg; এর মান কত?",
  opts:["2 + &radic;3","&radic;3 &minus; 1","(&radic;3 &minus; 1)/2","2 &minus; &radic;3"],
  ans:3,
  why:["এটি tan 75&deg;; 15&deg; এর tan ছোট (1 এর কম) হবে।","এর মান 0.732, যা tan 15&deg; এর চেয়ে বড়।","এর মান 0.366; tan 15&deg; এর সঠিক মান নয়।","ঠিক — tan(45&deg; &minus; 30&deg;) = (1 &minus; 1/&radic;3)/(1 + 1/&radic;3) = 2 &minus; &radic;3 &asymp; 0.268।"],
  fast:"tan 15&deg; = 2 &minus; &radic;3 এবং tan 75&deg; = 2 + &radic;3; দুটির গুণফল 1।",
  tags:["p184","যৌগিক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.016", topic:"hmath1.ch7", type:'mc', b:0.4,
  stem:"cos(A + B) cos(A &minus; B) এর মান কোনটির সমান?",
  opts:["cos<sup>2</sup>A &minus; cos<sup>2</sup>B","sin<sup>2</sup>A &minus; sin<sup>2</sup>B","cos<sup>2</sup>A &minus; sin<sup>2</sup>B","cos<sup>2</sup>A + sin<sup>2</sup>B"],
  ans:2,
  why:["এটি &minus;sin(A + B)sin(A &minus; B) এর সমান; cos গুণফলের ফল নয়।","এটি sin(A + B)sin(A &minus; B) এর ফল।","ঠিক — (cosAcosB)<sup>2</sup> &minus; (sinAsinB)<sup>2</sup> সরলীকরণ করলে cos<sup>2</sup>A &minus; sin<sup>2</sup>B আসে (= cos<sup>2</sup>B &minus; sin<sup>2</sup>A)।","মাঝের চিহ্ন বিয়োগ, যোগ নয়।"],
  fast:"sin(A+B)sin(A&minus;B) = sin<sup>2</sup>A &minus; sin<sup>2</sup>B এবং cos(A+B)cos(A&minus;B) = cos<sup>2</sup>A &minus; sin<sup>2</sup>B।",
  tags:["p183","যৌগিক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.017", topic:"hmath1.ch7", type:'mc', b:0,
  stem:"2cos A sin B এর মান কোনটি?",
  opts:["sin(A + B) + sin(A &minus; B)","sin(A + B) &minus; sin(A &minus; B)","cos(A + B) + cos(A &minus; B)","cos(A &minus; B) &minus; cos(A + B)"],
  ans:1,
  why:["যোগ করলে 2sinA cosB আসে, 2cosA sinB নয়।","ঠিক — sin(A+B) থেকে sin(A&minus;B) বিয়োগ করলে 2cosA sinB থাকে।","এটি 2cosA cosB এর সূত্র।","এটি 2sinA sinB এর সূত্র।"],
  fast:"2sinAcosB = sin(A+B) + sin(A&minus;B); 2cosAsinB = sin(A+B) &minus; sin(A&minus;B)।",
  tags:["p186","রূপান্তর সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch7.018", topic:"hmath1.ch7", type:'mc', b:0.2,
  stem:"sin C &minus; sin D এর মান কোনটির সমান?",
  opts:["2cos((C + D)/2) sin((C &minus; D)/2)","2sin((C + D)/2) cos((C &minus; D)/2)","2cos((C + D)/2) cos((C &minus; D)/2)","2sin((C + D)/2) sin((C &minus; D)/2)"],
  ans:0,
  why:["ঠিক — বিয়োগের সূত্রে cos((C+D)/2) এর সঙ্গে sin((C&minus;D)/2) গুণ হয়।","এটি sin C + sin D এর সূত্র।","এটি cos C + cos D এর সূত্র।","cos C &minus; cos D এর সূত্রে sin sin থাকে (আর একটি ঋণাত্মক চিহ্ন)।"],
  fast:"sinC+sinD = 2sin((C+D)/2)cos((C&minus;D)/2); sinC&minus;sinD = 2cos((C+D)/2)sin((C&minus;D)/2)।",
  tags:["p186","রূপান্তর সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch7.019", topic:"hmath1.ch7", type:'mc', b:0.5,
  stem:"sin 75&deg; + sin 15&deg; এর মান কত?",
  opts:["&radic;3/2","&radic;2/2","1/2","&radic;6/2"],
  ans:3,
  why:["এটি sin 60&deg; বা cos 30&deg;; যোগফল তার চেয়ে বড়।","এটি 2sin 45&deg; cos 30&deg; এর বদলে sin 45&deg; ধরলে আসত; গুণক 2 বাদ পড়েছে।","sin 75&deg; একাই 0.96; যোগফল 1/2 হতে পারে না।","ঠিক — 2sin45&deg; cos30&deg; = 2&times;(1/&radic;2)&times;(&radic;3/2) = &radic;6/2 &asymp; 1.2247, আর 0.9659 + 0.2588 = 1.2247।"],
  fast:"sinC + sinD = 2sin((C+D)/2)cos((C&minus;D)/2), এখানে অর্ধ-যোগ 45&deg;, অর্ধ-বিয়োগ 30&deg;।",
  tags:["p186","রূপান্তর সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch7.020", topic:"hmath1.ch7", type:'mc', b:0,
  stem:"tan A = 1/2 হলে tan 2A এর মান কত?",
  opts:["1","3/4","4/3","2/3"],
  ans:2,
  why:["হর 1 &minus; 1/4 না নিয়ে 1 ধরলে এই মান পাওয়া যায়।","এটি 4/3 এর অন্যোন্যক, অর্থাৎ cot 2A।","ঠিক — 2&times;(1/2)/(1 &minus; 1/4) = 1/(3/4) = 4/3; অন্য পথে sin2A = 4/5, cos2A = 3/5।","হরে 1 &minus; tan<sup>2</sup>A এর বদলে 1 + ধরলে 4/5 আসে; এই মান আসে না।"],
  fast:"tan 2A = 2tanA/(1 &minus; tan<sup>2</sup>A); sin2A = 2t/(1+t<sup>2</sup>) এবং cos2A = (1&minus;t<sup>2</sup>)/(1+t<sup>2</sup>)।",
  tags:["p188","গুণিতক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.021", topic:"hmath1.ch7", type:'mc', b:0,
  stem:"cos A = 1/2 হলে cos 3A এর মান কত?",
  opts:["1","&minus;1","0","&minus;1/2"],
  ans:1,
  why:["এটি 3cosA &minus; 4cos<sup>3</sup>A দিলে আসত; সূত্রটি উল্টো বসেছে।","ঠিক — 4(1/8) &minus; 3(1/2) = &minus;1; A = 60&deg; ধরলে cos 180&deg; = &minus;1।","4cos<sup>3</sup>A = 1/2 ও 3cosA = 3/2 বিয়োগ করলে 0 আসে না; পার্থক্য &minus;1।","মান 1/2 এর কাছাকাছি নয়; 3A = 180&deg;।"],
  fast:"cos 3A = 4cos<sup>3</sup>A &minus; 3cosA এবং sin 3A = 3sinA &minus; 4sin<sup>3</sup>A।",
  tags:["p189","গুণিতক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.022", topic:"hmath1.ch7", type:'mc', b:0.3,
  stem:"tan A = 1 হলে tan 3A এর মান কত?",
  opts:["&minus;1","1","2","0"],
  ans:0,
  why:["ঠিক — (3 &minus; 1)/(1 &minus; 3) = &minus;1; A = 45&deg; হলে tan 135&deg; = &minus;1।","হরের চিহ্ন ঋণাত্মক (1 &minus; 3 = &minus;2), তাই ফল ঋণাত্মক।","লব 2 ঠিক, কিন্তু হর &minus;2 দিয়ে ভাগ করতে হবে।","লব 3 &minus; 1 = 2, শূন্য নয়।"],
  fast:"tan 3A = (3tanA &minus; tan<sup>3</sup>A)/(1 &minus; 3tan<sup>2</sup>A)।",
  tags:["p189","গুণিতক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.023", topic:"hmath1.ch7", type:'mc', b:0.4,
  stem:"cos 2A এর সমান নয় এমন রাশিটি কোনটি?",
  opts:["cos<sup>2</sup>A &minus; sin<sup>2</sup>A","1 &minus; 2sin<sup>2</sup>A","2cos<sup>2</sup>A &minus; 1","2cos<sup>2</sup>A + 1"],
  ans:3,
  why:["এটি cos 2A এর মূল সূত্র।","sin<sup>2</sup>A এ রূপান্তরিত এই রূপটিও সঠিক।","cos<sup>2</sup>A এ রূপান্তরিত এই রূপটিও সঠিক।","ঠিক — সঠিক সূত্র 2cos<sup>2</sup>A &minus; 1; এখানে চিহ্ন ভুল।"],
  fast:"cos2A = cos<sup>2</sup>A &minus; sin<sup>2</sup>A = 2cos<sup>2</sup>A &minus; 1 = 1 &minus; 2sin<sup>2</sup>A।",
  tags:["p188","গুণিতক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.024", topic:"hmath1.ch7", type:'mc', b:-0.2,
  stem:"1 + cos &theta; কোনটির সমান?",
  opts:["2sin<sup>2</sup>(&theta;/2)","2cos<sup>2</sup> &theta;","2cos<sup>2</sup>(&theta;/2)","2sin<sup>2</sup> &theta;"],
  ans:2,
  why:["এটি 1 &minus; cos &theta; এর সমান।","কোণটি &theta;/2 হবে, &theta; নয়।","ঠিক — cos2x = 2cos<sup>2</sup>x &minus; 1 এ x = &theta;/2 বসালে।","কোণ ও অনুপাত দুটিই বদলে গেছে।"],
  fast:"1 + cos&theta; = 2cos<sup>2</sup>(&theta;/2); 1 &minus; cos&theta; = 2sin<sup>2</sup>(&theta;/2)।",
  tags:["p191","উপগুণিতক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.025", topic:"hmath1.ch7", type:'mc', b:0.4,
  stem:"cos 36&deg; এর মান কত?",
  opts:["(&radic;5 &minus; 1)/4","(&radic;5 + 1)/4","&radic;(10 + 2&radic;5)/4","(&radic;5 + 1)/2"],
  ans:1,
  why:["এটি sin 18&deg; এর মান (&asymp; 0.309)।","ঠিক — cos36&deg; = 1 &minus; 2sin<sup>2</sup>18&deg; = (&radic;5 + 1)/4 &asymp; 0.809।","এটি cos 18&deg; এর মান (&asymp; 0.951)।","এর মান 1.618 (1 এর বেশি), cos কখনো 1 এর বেশি হয় না।"],
  fast:"sin 18&deg; = (&radic;5 &minus; 1)/4 এবং cos 36&deg; = (&radic;5 + 1)/4।",
  tags:["p192","উপগুণিতক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.026", topic:"hmath1.ch7", type:'mc', b:-0.1,
  stem:"ABC ত্রিভুজে a = 10 cm এবং A = 30&deg; হলে পরিব্যাসার্ধ R কত?",
  opts:["10 cm","5 cm","20 cm","10&radic;3 cm"],
  ans:0,
  why:["ঠিক — a/sin A = 2R থেকে R = 10/(2&times;1/2) = 10 cm।","R = a/(2sinA); a/2 নিলে ভুল।","2R = 20, R নয়।","sin 30&deg; এর বদলে cos 30&deg; বসালে এই ভুল হয়।"],
  fast:"সাইন সূত্রে a/sinA = b/sinB = c/sinC = 2R, যেখানে R পরিব্যাসার্ধ।",
  tags:["p196","সাইন ও কোসাইন সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch7.027", topic:"hmath1.ch7", type:'mc', b:0.3,
  stem:"একটি ত্রিভুজের বাহু 3 cm, 8 cm ও 7 cm হলে 7 cm বাহুর বিপরীত কোণ কত?",
  opts:["120&deg;","30&deg;","45&deg;","60&deg;"],
  ans:3,
  why:["cos এর মান ঋণাত্মক হলে 120&deg; হতো; এখানে ধনাত্মক।","cos 30&deg; = &radic;3/2, 1/2 নয়।","cos 45&deg; = 1/&radic;2, 1/2 নয়।","ঠিক — cos = (9 + 64 &minus; 49)/(2&times;3&times;8) = 24/48 = 1/2, তাই 60&deg;।"],
  fast:"কোসাইন সূত্র: cos C = (a<sup>2</sup> + b<sup>2</sup> &minus; c<sup>2</sup>)/(2ab); ফল 1/2 হলে কোণ 60&deg;।",
  tags:["p198","সাইন ও কোসাইন সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch7.028", topic:"hmath1.ch7", type:'mc', b:0.1,
  stem:"ABC ত্রিভুজে কোনটি সঠিক সম্পর্ক?",
  opts:["a = b cos B + c cos C","a = b sin C + c sin B","a = b cos C + c cos B","a = b cos A + c cos B"],
  ans:2,
  why:["b এর সঙ্গে B এর cos বসানো ভুল; b এর কাছে C আসে।","অভিক্ষেপ cos দিয়ে হয়, sin দিয়ে নয়।","ঠিক — BC কে লম্ব-অভিক্ষেপ দিয়ে ভাগ করলে b এর অভিক্ষেপ b cosC এবং c এর অভিক্ষেপ c cosB।","এখানে cos A নয়, cos C ও cos B আসে।"],
  fast:"a = b cosC + c cosB; b = c cosA + a cosC; c = a cosB + b cosA।",
  tags:["p198","সাইন ও কোসাইন সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch7.029", topic:"hmath1.ch7", type:'mc', b:-0.4,
  stem:"ABC ত্রিভুজে a = 8 cm, b = 5 cm ও C = 30&deg; হলে ক্ষেত্রফল কত?",
  opts:["20 cm<sup>2</sup>","10 cm<sup>2</sup>","10&radic;3 cm<sup>2</sup>","40 cm<sup>2</sup>"],
  ans:1,
  why:["1/2 গুণক বাদ পড়েছে; এটি 8&times;5&times;sin30&deg;।","ঠিক — (1/2)&times;8&times;5&times;sin30&deg; = 20&times;1/2 = 10।","sin 30&deg; এর বদলে sin 60&deg; বসালে এই ভুল হয়।","sin ও 1/2 কোনোটিই নেওয়া হয়নি; কেবল a&times;b।"],
  fast:"ক্ষেত্রফল = (1/2)&times;(দুই বাহুর গুণফল)&times;(অন্তর্ভুক্ত কোণের sin)।",
  tags:["p200","ত্রিভুজের ক্ষেত্রফল"]
});

ICE.Q.push({
  id:"hmath1.ch7.030", topic:"hmath1.ch7", type:'mc', b:0.7,
  stem:"একটি ত্রিভুজের বাহু 9 cm, 10 cm ও 17 cm। এর ক্ষেত্রফল কত?",
  opts:["36 cm<sup>2</sup>","45 cm<sup>2</sup>","72 cm<sup>2</sup>","90 cm<sup>2</sup>"],
  ans:0,
  why:["ঠিক — s = 18; &radic;(18&times;9&times;8&times;1) = &radic;1296 = 36; অন্য পথে cos C = &minus;3/5, sin C = 4/5, ক্ষেত্র = (1/2)&times;9&times;10&times;4/5 = 36।","এটি 9&times;10/2; ত্রিভুজটি সমকোণী নয়, তাই এই সরল সূত্র চলে না।","এটি 36 এর দ্বিগুণ; 1/2 গুণক বাদ গেলে এমন হয়।","এটি 9&times;10; অর্ধেক ও sin দুটিই বাদ পড়েছে।"],
  fast:"হেরনের সূত্র: ক্ষেত্রফল = &radic;[s(s&minus;a)(s&minus;b)(s&minus;c)], যেখানে s = পরিসীমার অর্ধেক।",
  tags:["p200","ত্রিভুজের ক্ষেত্রফল"]
});

ICE.Q.push({
  id:"hmath1.ch7.031", topic:"hmath1.ch7", type:'mc', b:0.4,
  stem:"ABC ত্রিভুজের tan(A/2) কোনটির সমান (s = অর্ধপরিসীমা)?",
  opts:["&radic;[s(s &minus; a)/((s &minus; b)(s &minus; c))]","&radic;[(s &minus; b)(s &minus; c)/(bc)]","&radic;[s(s &minus; a)/(bc)]","&radic;[(s &minus; b)(s &minus; c)/(s(s &minus; a))]"],
  ans:3,
  why:["লব ও হর উল্টে গেছে; এটি cot(A/2) এর সূত্র।","এটি sin(A/2) এর সূত্র।","এটি cos(A/2) এর সূত্র।","ঠিক — tan = sin/cos; দুই অর্ধকোণের সূত্র ভাগ করলে এটি আসে।"],
  fast:"sin(A/2) = &radic;[(s&minus;b)(s&minus;c)/bc], cos(A/2) = &radic;[s(s&minus;a)/bc], তাই tan(A/2) = &radic;[(s&minus;b)(s&minus;c)/(s(s&minus;a))]।",
  tags:["p199","ত্রিভুজের ক্ষেত্রফল"]
});

ICE.Q.push({
  id:"hmath1.ch7.032", topic:"hmath1.ch7", type:'mc', b:0.2,
  stem:"ত্রিভুজের তিনটি কোণই শুধু জানা থাকলে কী নির্ণয় করা যায়?",
  opts:["বাহুগুলোর প্রকৃত দৈর্ঘ্য","ক্ষেত্রফল","বাহুগুলোর অনুপাত","পরিব্যাসার্ধ"],
  ans:2,
  why:["একটি বাহুর দৈর্ঘ্য জানা না থাকলে প্রকৃত দৈর্ঘ্য মেলে না; একই কোণের অসংখ্য সদৃশ ত্রিভুজ আছে।","ক্ষেত্রফলের জন্য অন্তত একটি বাহু লাগে।","ঠিক — a : b : c = sin A : sin B : sin C; দৈর্ঘ্যের একক জানা না থাকলে কেবল অনুপাত মেলে।","পরিব্যাসার্ধ বের করতেও একটি বাহুর মান লাগে।"],
  fast:"তিন কোণ দেওয়া থাকলে সাইন সূত্র থেকে কেবল a : b : c = sinA : sinB : sinC পাওয়া যায়।",
  tags:["p206","ত্রিভুজের সমাধান"]
});

ICE.Q.push({
  id:"hmath1.ch7.033", topic:"hmath1.ch7", type:'mc', b:0.2,
  stem:"একটি ত্রিভুজের কোণ 30&deg;, 30&deg; ও 120&deg; হলে বাহুগুলোর অনুপাত কত?",
  opts:["1 : 1 : 2","1 : 1 : &radic;3","1 : &radic;3 : 2","1 : 2 : 3"],
  ans:1,
  why:["বৃহত্তম বাহুর অনুপাত 2 হলে sin এর মান 1 হতো, যা 120&deg; এ নয়।","ঠিক — sin30&deg; : sin30&deg; : sin120&deg; = 1/2 : 1/2 : &radic;3/2 = 1 : 1 : &radic;3।","এটি 30&deg;-60&deg;-90&deg; ত্রিভুজের অনুপাত।","এমন বাহুতে ত্রিভুজই হয় না (1 + 2 = 3)।"],
  fast:"বাহুর অনুপাত = বিপরীত কোণের sin এর অনুপাত।",
  tags:["p206","ত্রিভুজের সমাধান"]
});

ICE.Q.push({
  id:"hmath1.ch7.034", topic:"hmath1.ch7", type:'mc', b:0.9,
  stem:"ABC ত্রিভুজে B = 30&deg; ও c = 12 cm জানা আছে। কোন মানের b নিলে দুটি ভিন্ন ত্রিভুজ পাওয়া যায়?",
  opts:["b = 9 cm","b = 5 cm","b = 12 cm","b = 15 cm"],
  ans:0,
  why:["ঠিক — c sinB = 6 &lt; b = 9 &lt; c = 12 হলে দ্ব্যর্থক ক্ষেত্র হয়।","b = 5 &lt; c sinB = 6 হলে ত্রিভুজই হয় না।","b = c হলে অপর কোণটি সূক্ষ্মকোণেই একমাত্র সমাধান, সমদ্বিবাহু ত্রিভুজ হয়।","b &gt; c হলে অপর মানটি স্থূলকোণ হয়ে কোণসমষ্টি 180&deg; ছাড়িয়ে যায়; একটিই সমাধান।"],
  fast:"দ্ব্যর্থক ক্ষেত্র: c sinB &lt; b &lt; c।",
  tags:["p209","ত্রিভুজের সমাধান"]
});

ICE.Q.push({
  id:"hmath1.ch7.035", topic:"hmath1.ch7", type:'mc', b:0.6, passage:"hmath1.ch7.u01",
  stem:"উদ্দীপকের তথ্য অনুযায়ী sin(A + B) এর মান কত?",
  opts:["56/65","33/65","16/65","63/65"],
  ans:3,
  why:["এটি cos(A &minus; B) এর মান; ভিন্ন সূত্র।","এটি |sin(A &minus; B)| এর মান; বিয়োগের সূত্র ধরা হয়েছে।","এটি |cos(A + B)| এর মান।","ঠিক — cos A = 4/5, sin B = 12/13; (3/5)(5/13) + (4/5)(12/13) = 63/65।"],
  fast:"প্রথমে cos A ও sin B বের করে নিন, তারপর যৌগিক কোণের সূত্র বসান।",
  tags:["p182","যৌগিক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.036", topic:"hmath1.ch7", type:'mc', b:0.9, passage:"hmath1.ch7.u01",
  stem:"উদ্দীপকের তথ্য অনুযায়ী cos(A &minus; B) এর মান কত?",
  opts:["63/65","&minus;16/65","56/65","33/65"],
  ans:2,
  why:["এটি sin(A + B) এর মান।","এটি cos(A + B) এর মান; মাঝের চিহ্ন বিয়োগ নিলে এই মান আসে।","ঠিক — cosA cosB + sinA sinB = (4/5)(5/13) + (3/5)(12/13) = 56/65।","এটি |sin(A &minus; B)| এর মান।"],
  fast:"cos(A &minus; B) এ মাঝের চিহ্ন যোগ: cosAcosB + sinAsinB।",
  tags:["p182","যৌগিক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.037", topic:"hmath1.ch7", type:'mc', b:0.5, passage:"hmath1.ch7.u02",
  stem:"উদ্দীপক অনুযায়ী tan(&minus;&theta;) এর মান কত?",
  opts:["&minus;5/12","5/12","12/5","&minus;12/5"],
  ans:1,
  why:["এটি tan &theta; এর মান; ঋণাত্মক কোণের চিহ্ন উল্টানো হয়নি।","ঠিক — cos &theta; = &minus;12/13 (দ্বিতীয় চতুর্ভাগ), tan &theta; = &minus;5/12, তাই tan(&minus;&theta;) = 5/12।","এটি cot(&minus;&theta;) এর মান নয়, tan এর অন্যোন্যক ধরে ভুল।","এটি cot &theta; এর মান।"],
  fast:"দ্বিতীয় চতুর্ভাগে tan ঋণাত্মক, আর tan(&minus;x) = &minus;tan x, তাই ফল ধনাত্মক।",
  tags:["p175","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.038", topic:"hmath1.ch7", type:'mc', b:0.4, passage:"hmath1.ch7.u02",
  stem:"উদ্দীপক অনুযায়ী cos(90&deg; + &theta;) এর মান কত?",
  opts:["&minus;5/13","5/13","12/13","&minus;12/13"],
  ans:0,
  why:["ঠিক — cos(90&deg; + &theta;) = &minus;sin &theta; = &minus;5/13।","চিহ্ন ভুল; cos(90&deg; + &theta;) ঋণাত্মক হয়।","এটি |cos &theta;|; রূপান্তরের নিয়মে sin আসে।","এটি cos &theta; এর মান; রূপান্তর হয়নি।"],
  fast:"cos(90&deg; + x) = &minus;sin x; তাই cos &theta; বের না করে সরাসরি sin &theta; থেকেই মান মেলে।",
  tags:["p176","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.039", topic:"hmath1.ch7", type:'mc', b:0.5, passage:"hmath1.ch7.u03",
  stem:"উদ্দীপক অনুযায়ী sin 2&theta; এর মান কত?",
  opts:["7/25","24/7","12/25","24/25"],
  ans:3,
  why:["এটি cos 2&theta; এর মান।","এটি tan 2&theta; এর মান।","2 গুণক বাদ গিয়ে (3/5)(4/5) এর মান আসে।","ঠিক — sin2x = 2t/(1 + t<sup>2</sup>) = 1.5/(25/16) = 24/25; অন্য পথে 2(3/5)(4/5) = 24/25।"],
  fast:"sin 2x = 2tan x/(1 + tan<sup>2</sup>x); tan x = 3/4 হলে ত্রিভুজ 3-4-5।",
  tags:["p188","গুণিতক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.040", topic:"hmath1.ch7", type:'mc', b:1, passage:"hmath1.ch7.u03",
  stem:"উদ্দীপক অনুযায়ী sin 3&theta; এর মান কত?",
  opts:["81/125","9/5","117/125","107/125"],
  ans:2,
  why:["এটি (3/5)<sup>3</sup>&times;3 বা এমন ভুল গুণফলের ফল।","এটি কেবল 3 sin &theta;; 4sin<sup>3</sup> অংশ বাদ গেছে।","ঠিক — 3(3/5) &minus; 4(3/5)<sup>3</sup> = 225/125 &minus; 108/125 = 117/125; অন্য পথে sin2x cosx + cos2x sinx = (96 + 21)/125।","4sin<sup>3</sup>&theta; এর মান 108 এর বদলে 118 ধরলে এই ভুল হয়।"],
  fast:"sin 3A = 3sinA &minus; 4sin<sup>3</sup>A; sin A = 3/5 হলে মান 117/125।",
  tags:["p189","গুণিতক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.041", topic:"hmath1.ch7", type:'mc', b:0.3, passage:"hmath1.ch7.u04",
  stem:"উদ্দীপকের ত্রিভুজের বৃহত্তম কোণের cosine এর মান কত?",
  opts:["3/5","&minus;3/5","4/5","&minus;4/5"],
  ans:1,
  why:["ধনাত্মক হলে কোণ সূক্ষ্ম হতো; কিন্তু 7<sup>2</sup> + 15<sup>2</sup> &lt; 20<sup>2</sup>, তাই কোণ স্থূল।","ঠিক — বৃহত্তম বাহু 20 এর বিপরীত কোণে cos = (49 + 225 &minus; 400)/(2&times;7&times;15) = &minus;126/210 = &minus;3/5।","এটি sin এর মান; cos নয়।","এটি স্থূলকোণের sin এর ঋণাত্মক রূপ; sin ধনাত্মকই।"],
  fast:"কোসাইন সূত্র থেকে cos C = (a<sup>2</sup>+b<sup>2</sup>&minus;c<sup>2</sup>)/2ab; ঋণাত্মক হলে কোণ স্থূল।",
  tags:["p198","সাইন ও কোসাইন সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch7.042", topic:"hmath1.ch7", type:'mc', b:0.8, passage:"hmath1.ch7.u04",
  stem:"উদ্দীপকের ত্রিভুজের ক্ষেত্রফল কত?",
  opts:["42 cm<sup>2</sup>","52.5 cm<sup>2</sup>","84 cm<sup>2</sup>","105 cm<sup>2</sup>"],
  ans:0,
  why:["ঠিক — s = 21, &radic;(21&times;14&times;6&times;1) = 42; অন্য পথে (1/2)&times;7&times;15&times;(4/5) = 42।","এটি (1/2)&times;7&times;15 = 52.5; sin অংশ বাদ গেছে।","এটি 42 এর দ্বিগুণ।","এটি 7&times;15; অর্ধেক ও sin বাদ গেছে।"],
  fast:"হেরনের সূত্র, অথবা (1/2)ab sin C: দুটি পথ মিলিয়ে নেওয়া যায়।",
  tags:["p200","ত্রিভুজের ক্ষেত্রফল"]
});

ICE.Q.push({
  id:"hmath1.ch7.043", topic:"hmath1.ch7", type:'mc', b:0.6, passage:"hmath1.ch7.u05",
  stem:"উদ্দীপকে sin C এর মান কত?",
  opts:["3/5","6/5","5/12","5/6"],
  ans:3,
  why:["হর বা লব ভুল বসেছে; c sinB = 5, b = 6।","এটি b/(c sinB) অর্থাৎ উল্টো অনুপাত; sin 1 এর বেশি হতে পারে না।","sin30&deg; এর বদলে 1/4 ধরলে এই মান আসে।","ঠিক — sinC = c sinB / b = 10&times;(1/2)/6 = 5/6।"],
  fast:"সাইন সূত্র: sinC = c sinB / b।",
  tags:["p209","ত্রিভুজের সমাধান"]
});

ICE.Q.push({
  id:"hmath1.ch7.044", topic:"hmath1.ch7", type:'mc', b:0.9, passage:"hmath1.ch7.u05",
  stem:"উদ্দীপকে C এর সম্ভাব্য দুটি মানের যোগফল কত?",
  opts:["90&deg;","120&deg;","180&deg;","150&deg;"],
  ans:2,
  why:["90&deg; হতো যদি দুই মান পরস্পর পরিপূরক হতো; এখানে সম্পূরক।","কোনো সম্পর্কে এই যোগফল আসে না।","ঠিক — sin C = 5/6 থেকে C এবং 180&deg; &minus; C দুটিই সম্ভব, কারণ c sinB &lt; b &lt; c; যোগফল 180&deg;।","কোনো সম্পর্কে এই যোগফল আসে না।"],
  fast:"sin C সমান হলে C এবং (180&deg; &minus; C) দুটি সমাধান; দ্ব্যর্থক ক্ষেত্র।",
  tags:["p209","ত্রিভুজের সমাধান"]
});

ICE.Q.push({
  id:"hmath1.ch7.045", topic:"hmath1.ch7", type:'mcomp', b:-0.3,
  stem:"ঋণাত্মক কোণ সম্পর্কে নিচের তথ্যগুলো লক্ষ করো",
  sts:["sin(&minus;&theta;) = &minus;sin &theta;","cos(&minus;&theta;) = &minus;cos &theta;","cot(&minus;&theta;) = &minus;cot &theta;"],
  ans:1,
  why:["ii ভুল, তাই i ও ii একসাথে সঠিক হতে পারে না।","ঠিক — i ও iii সঠিক; ii ভুল, কারণ cos জোড় ফাংশন।","ii ভুল, তাই ii ও iii জোড়টি হয় না।","ii ভুল, তাই তিনটি একসাথে সঠিক নয়।"],
  fast:"ঋণাত্মক কোণে cos ও sec বাদে সব অনুপাতের চিহ্ন উল্টে যায়।",
  tags:["p174","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.046", topic:"hmath1.ch7", type:'mcomp', b:0.1,
  stem:"(180&deg; &minus; &theta;) কোণের অনুপাত সম্পর্কে নিচের তথ্যগুলো লক্ষ করো",
  sts:["sin(180&deg; &minus; &theta;) = &minus;sin &theta;","cos(180&deg; &minus; &theta;) = &minus;cos &theta;","tan(180&deg; &minus; &theta;) = &minus;tan &theta;"],
  ans:2,
  why:["i ভুল: sin(180&deg; &minus; &theta;) = sin &theta;, তাই i বাদ।","i ভুল, তাই i ও iii হয় না।","ঠিক — ii ও iii সঠিক; দ্বিতীয় চতুর্ভাগে sin ধনাত্মক হওয়ায় i ভুল।","i ভুল, তাই সবগুলো সঠিক নয়।"],
  fast:"দ্বিতীয় চতুর্ভাগে কেবল sin ও cosec ধনাত্মক।",
  tags:["p176","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.047", topic:"hmath1.ch7", type:'mcomp', b:0,
  stem:"(180&deg; + &theta;) কোণ সম্পর্কে নিচের তথ্যগুলো লক্ষ করো",
  sts:["sin(180&deg; + &theta;) = &minus;sin &theta;","cos(180&deg; + &theta;) = &minus;cos &theta;","tan(180&deg; + &theta;) = tan &theta;"],
  ans:3,
  why:["iii ও সঠিক, তাই কেবল i ও ii বললে অসম্পূর্ণ।","ii সঠিক, তাই i ও iii এর সাথে ii বাদ দেওয়া যায় না।","i সঠিক, তাই বাদ দেওয়া যায় না।","ঠিক — তৃতীয় চতুর্ভাগে কেবল tan ও cot ধনাত্মক, তাই তিনটিই সঠিক।"],
  fast:"180&deg; + &theta; তৃতীয় চতুর্ভাগে; কেবল tan ও cot ধনাত্মক।",
  tags:["p177","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.048", topic:"hmath1.ch7", type:'mcomp', b:0.3,
  stem:"নিচের তথ্যগুলো লক্ষ করো",
  sts:["sin(270&deg; + &theta;) = &minus;cos &theta;","cos(270&deg; + &theta;) = sin &theta;","tan(360&deg; &minus; &theta;) = cot &theta;"],
  ans:0,
  why:["ঠিক — i ও ii সঠিক; iii ভুল, কারণ tan(360&deg; &minus; &theta;) = &minus;tan &theta;।","iii ভুল, তাই i ও iii হয় না।","iii ভুল, তাই ii ও iii হয় না।","iii ভুল, তাই তিনটিই সঠিক নয়।"],
  fast:"360&deg; জোড় গুণিতক, তাই tan(360&deg; &minus; &theta;) = &minus;tan &theta;; অনুপাত বদলায় না।",
  tags:["p178","সংযুক্ত কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.049", topic:"hmath1.ch7", type:'mcomp', b:0.5,
  stem:"নিচের তথ্যগুলো লক্ষ করো",
  sts:["tan(A + B) = (tan A + tan B)/(1 + tan A tan B)","cos(A + B) cos(A &minus; B) = cos<sup>2</sup>A &minus; sin<sup>2</sup>B","sin(A + B) sin(A &minus; B) = sin<sup>2</sup>A &minus; sin<sup>2</sup>B"],
  ans:2,
  why:["i ভুল: হরে 1 &minus; tanA tanB হবে, তাই i বাদ।","i ভুল, তাই i ও iii হয় না।","ঠিক — ii ও iii সঠিক; tan(A + B) এর হরে বিয়োগ থাকে।","i ভুল, তাই সবগুলো সঠিক নয়।"],
  fast:"tan(A+B) = (tanA + tanB)/(1 &minus; tanA tanB); tan(A&minus;B) এর হরে যোগ।",
  tags:["p183","যৌগিক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.050", topic:"hmath1.ch7", type:'mcomp', b:0.2,
  stem:"নিচের তথ্যগুলো লক্ষ করো",
  sts:["sin 2A = 2 sin A cos A","cos 2A = 2cos<sup>2</sup>A + 1","tan 2A = 2tan A/(1 &minus; tan<sup>2</sup>A)"],
  ans:1,
  why:["ii ভুল: সঠিক রূপ 2cos<sup>2</sup>A &minus; 1, তাই i ও ii নয়।","ঠিক — i ও iii সঠিক, ii এর চিহ্ন ভুল।","ii ভুল, তাই ii ও iii নয়।","ii ভুল, তাই সবগুলো সঠিক নয়।"],
  fast:"cos 2A = 2cos<sup>2</sup>A &minus; 1 (যোগ নয়, বিয়োগ)।",
  tags:["p188","গুণিতক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.051", topic:"hmath1.ch7", type:'mcomp', b:0.6,
  stem:"নিচের তথ্যগুলো লক্ষ করো",
  sts:["sin 3A = 3 sin A &minus; 4 sin<sup>3</sup>A","cos 3A = 4cos<sup>3</sup>A &minus; 3 cos A","tan 3A = (3tan A &minus; tan<sup>3</sup>A)/(1 + 3tan<sup>2</sup>A)"],
  ans:0,
  why:["ঠিক — i ও ii সঠিক; iii এর হরে 1 &minus; 3tan<sup>2</sup>A হবে।","iii ভুল, তাই i ও iii হয় না।","iii ভুল, তাই ii ও iii হয় না।","iii ভুল, তাই তিনটিই সঠিক নয়।"],
  fast:"tan 3A এর হর 1 &minus; 3tan<sup>2</sup>A; লব 3tanA &minus; tan<sup>3</sup>A।",
  tags:["p189","গুণিতক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.052", topic:"hmath1.ch7", type:'mcomp', b:0.7,
  stem:"18&deg; ও 36&deg; কোণের অনুপাত সম্পর্কে নিচের তথ্যগুলো লক্ষ করো",
  sts:["sin 18&deg; = (&radic;5 &minus; 1)/4","cos 36&deg; = (&radic;5 + 1)/4","cos 36&deg; = 1 &minus; 2sin<sup>2</sup>18&deg;"],
  ans:3,
  why:["iii ও সঠিক, তাই কেবল i ও ii অসম্পূর্ণ।","ii ও সঠিক, বাদ দেওয়া যায় না।","i ও সঠিক, বাদ দেওয়া যায় না।","ঠিক — তিনটিই সঠিক; iii সূত্র থেকেই ii এর মান বের হয়।"],
  fast:"sin 18&deg; = (&radic;5 &minus; 1)/4 ও cos 36&deg; = (&radic;5 + 1)/4।",
  tags:["p192","উপগুণিতক কোণ"]
});

ICE.Q.push({
  id:"hmath1.ch7.053", topic:"hmath1.ch7", type:'mcomp', b:0.4,
  stem:"A + B + C = &pi; হলে নিচের তথ্যগুলো লক্ষ করো",
  sts:["sin(A + B) = &minus;sin C","cos((A + B)/2) = sin(C/2)","tan((A + B)/2) = cot(C/2)"],
  ans:2,
  why:["i ভুল: sin(A + B) = sin C, তাই i বাদ।","i ভুল, তাই i ও iii হয় না।","ঠিক — ii ও iii সঠিক; (A + B)/2 = 90&deg; &minus; C/2 বলে।","i ভুল, তাই সবগুলো সঠিক নয়।"],
  fast:"A + B + C = 180&deg; হলে sin(A+B) = sinC কিন্তু cos(A+B) = &minus;cosC।",
  tags:["p193","ত্রিভুজের কোণসম্পর্ক"]
});

ICE.Q.push({
  id:"hmath1.ch7.054", topic:"hmath1.ch7", type:'mcomp', b:0.5,
  stem:"ABC ত্রিভুজ সম্পর্কে নিচের তথ্যগুলো লক্ষ করো",
  sts:["a/sin A = 2R","a<sup>2</sup> = b<sup>2</sup> + c<sup>2</sup> + 2bc cos A","cos B = (c<sup>2</sup> + a<sup>2</sup> &minus; b<sup>2</sup>)/(2ca)"],
  ans:1,
  why:["ii ভুল: কোসাইন সূত্রে &minus;2bc cos A, তাই ii বাদ।","ঠিক — i ও iii সঠিক; ii এ চিহ্ন ভুল।","ii ভুল, তাই ii ও iii হয় না।","ii ভুল, তাই সবগুলো সঠিক নয়।"],
  fast:"কোসাইন সূত্র: a<sup>2</sup> = b<sup>2</sup> + c<sup>2</sup> &minus; 2bc cos A।",
  tags:["p197","সাইন ও কোসাইন সূত্র"]
});

ICE.Q.push({
  id:"hmath1.ch7.055", topic:"hmath1.ch7", type:'mcomp', b:0.3,
  stem:"ABC ত্রিভুজের ক্ষেত্রফল সম্পর্কে নিচের তথ্যগুলো লক্ষ করো",
  sts:["ক্ষেত্রফল = (1/2) bc sin A","ক্ষেত্রফল = &radic;[s(s &minus; a)(s &minus; b)(s &minus; c)]","ক্ষেত্রফল = (1/2) ab cos C"],
  ans:0,
  why:["ঠিক — i ও ii সঠিক; iii এ sin C হবে, cos C নয়।","iii ভুল, তাই i ও iii হয় না।","iii ভুল, তাই ii ও iii হয় না।","iii ভুল, তাই তিনটিই সঠিক নয়।"],
  fast:"ক্ষেত্রফলে অন্তর্ভুক্ত কোণের sin বসে: (1/2)ab sin C।",
  tags:["p200","ত্রিভুজের ক্ষেত্রফল"]
});
