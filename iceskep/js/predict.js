/* ===========================================================
   PREDICT — a number built to be beaten.

   Most practice apps flatter you. The mark they print is the middle
   of their guess, so half the time the real paper comes in below it,
   and the one day it matters you are short.

   This one prints the LOW end. It starts from the ability estimate,
   then charges you for every reason that estimate might be
   optimistic: how little evidence there is, how much of the chapter
   list you have never been asked about, how many answers you gave
   with the clock switched off, whether your pace would actually get
   you to the end of the twenty-five, and a flat charge for the exam
   hall itself.

   The result should be beaten roughly nine times in ten. If it says
   19 of 25 and you sit the real paper next week, the honest
   expectation is a mark above 19 — that is the design. Turn
   "hard prediction" off in Settings to see the ordinary
   middle-of-the-guess figure instead, and watch it jump.

   HSC MCQ carry no negative marking, so a guess costs nothing but
   the seconds it takes. That is why pace is charged so heavily here:
   a question you never reach is the only kind that scores zero.
   =========================================================== */
var PREDICT = (function(){

/* how far below the middle we quote. 1.28 sigma is the 10th percentile
   of the estimate's own error — beaten about nine times in ten. */
var Z_HARD = 1.28;
var Z_SOFT = 0.30;

function z(){ return DB.state().settings.hardPredict ? Z_HARD : Z_SOFT; }

/* ---------- the charges, all in theta (standard deviations) ---------- */
function charges(secKey){
  var st=AB.sectionTheta(secKey);
  var sec=ICE.sections[secKey];
  var hard=DB.state().settings.hardPredict;
  var allowed=ICE.pace(secKey);
  var out=[], total=0;

  function add(key, label, amount, note){
    amount=U.round(amount,3);
    if(amount<=0.0005) return;
    out.push({key:key, label:label, amount:amount, note:note});
    total+=amount;
  }

  /* 1. the estimate's own error bar */
  add('se', L('Uncertainty of the estimate','অনুমানের অনিশ্চয়তা'), z()*st.se,
      st.n<20 ? L('Only '+st.n+' answers on record in this paper. Thin evidence costs more.','এই পত্রে মাত্র '+st.n+'টি উত্তর জমা আছে। কম প্রমাণের দাম বেশি।')
              : L(Math.round(st.n)+' answers on record. The uncertainty shrinks as the number grows.',Math.round(st.n)+'টি উত্তর জমা আছে। সংখ্যা বাড়লে অনিশ্চয়তা কমবে।'));

  /* 2. chapters you have never been asked about */
  var gap=1-st.cov;
  add('cov', L('Chapters not tested yet','যে অধ্যায় এখনও পরীক্ষা হয়নি'), gap*0.40,
      L(Math.round(gap*100)+'% of this paper (by chapter weight) rests on fewer than three answers. Assuming average there is guessing in your own favour.',
        'এই পত্রের '+Math.round(gap*100)+'% (অধ্যায়ের ওজন হিসেবে) তিনটির কম উত্তরের ওপর দাঁড়িয়ে। '+
      'ওইটুকু গড় ধরে নেওয়া নিজের পক্ষে আন্দাজ করা।'));

  /* 3. answers given with the stopwatch off */
  var since=Date.now()-45*864e5;
  var rows=DB.logFor(function(r){ return r.s===secKey && r.t>=since; });
  if(rows.length>=8){
    var untimed=0, i;
    for(i=0;i<rows.length;i++) if(!rows[i].tm) untimed++;
    var share=untimed/rows.length;
    add('untimed', L('Answers given with the clock off','ঘড়ি বন্ধ রেখে দেওয়া উত্তর'), share*0.45,
        L(Math.round(share*100)+'% of recent answers were given with the timer off. The real exam never switches its clock off.',
          'সাম্প্রতিক উত্তরের '+Math.round(share*100)+'% টাইমার বন্ধ রেখে দেওয়া। '+
        'আসল পরীক্ষায় ঘড়ি বন্ধ থাকে না।'));

    /* 4. pace — would you actually reach the last question? */
    var timed=rows.filter(function(r){ return r.tm; });
    if(timed.length>=8){
      var med=U.median(timed.map(function(r){ return r.sec; }));
      var ratio=med/allowed;
      if(ratio>1){
        add('pace', L('Too slow','গতির ঘাটতি'), Math.min(0.65, (ratio-1)*0.85),
            L('Your median is '+Math.round(med)+' seconds; the paper allows '+Math.round(allowed)+'. At this pace the last questions are never reached, and an unread question scores zero.',
              'আপনার মধ্যক সময় '+Math.round(med)+' সেকেন্ড, অথচ প্রশ্নপত্র দেয় '+Math.round(allowed)+
            ' সেকেন্ড। এই গতিতে শেষ প্রশ্নগুলোতে পৌঁছানোই হয় না, আর না-পড়া প্রশ্নে শূন্য।'));
      }
    }
  } else {
    add('thin', L('Too few answers to judge speed','গতি বিচার করার মতো উত্তর নেই'), 0.22,
        L('Fewer than eight recent answers in this paper. Until then a fixed charge is made for speed.','এই পত্রে সাম্প্রতিক আটটির কম উত্তর। ততক্ষণ গতির জন্য একটি নির্দিষ্ট দাম কাটা হয়।'));
  }

  /* 5. sheer volume */
  var need=120;
  if(st.n<need) add('vol', L('Amount of practice','অনুশীলনের পরিমাণ'), (1-st.n/need)*0.42,
      L(st.n+' of '+need+' answers. A small sample flatters whoever it speaks for.',need+'টির মধ্যে '+st.n+'টি উত্তর। ছোট নমুনা যার হয়ে কথা বলে, তার পক্ষেই বাড়িয়ে বলে।'));

  /* 6. the exam hall itself */
  if(hard) add('day', L('The exam-hall charge','পরীক্ষার হলের দাম'), 0.18,
      L('A strange centre, a stranger beside you, and one chance. Nobody keeps their desk average in the hall.','অচেনা কেন্দ্র, পাশে অপরিচিত কেউ, আর একটিই সুযোগ। নিজের টেবিলের গড় কেউ হলে ধরে রাখে না।'));

  return {raw:st.th, se:st.se, cov:st.cov, n:st.n, charges:out, total:total,
          hardTheta:st.th-total, ceilTheta:st.th+Z_HARD*st.se, allowed:allowed};
}

/* ---------- one paper ----------
   Two things decide an MCQ mark: how often you are right, and how many
   of the twenty-five you physically reach. The second is what most
   people ignore, so it is priced here explicitly. There is no
   negative marking, so nothing is taken off for a wrong answer. */
function paper(secKey){
  var c=charges(secKey);
  var sec=ICE.sections[secKey];
  var th=c.hardTheta;

  /* the difficulty of a real paper for this subject, taken from the
     bank rather than assumed */
  var pool=AB.inSection(secKey), bs=[], i;
  for(i=0;i<pool.length;i++) bs.push(AB.itemB(pool[i]));
  var bAvg = bs.length ? U.median(bs) : 0.1;

  var p = AB.pCorrect(th, bAvg, AB.SLOPE);

  /* how much of the paper you would actually reach */
  var reach=1, medPace=AB.medianPace({sec:secKey}, 45);
  var allowed=c.allowed, total=sec.n*allowed;
  if(medPace){
    reach=U.clamp(total/(medPace*sec.n), 0.35, 1);
    if(reach>0.995) reach=1;
  } else {
    reach=0.88;   /* no timed evidence: assume you leave a few behind */
  }

  var reached=sec.n*reach;
  var right  = reached*p;
  var marks  = right;           /* one mark each, nothing off for a miss */

  return {
    key:secKey, name:sec.name, n:sec.n,
    p:p, reach:reach, reached:reached,
    right:right, wrong:reached*(1-p), unreached:sec.n-reached,
    marks:Math.max(0, marks), ledger:c, bAvg:bAvg,
    medPace:medPace, allowed:allowed,
    pct: marks/sec.n,
    band: band(marks/sec.n),
    ready: c.n>=20
  };
}

/* every paper, and the whole MCQ half added up */
function hsc(){
  var secs=ICE.sectionsOf('hsc').map(function(s){ return paper('hsc/'+s.id); });
  var marks=0, n=0, ready=0, i;
  for(i=0;i<secs.length;i++){
    marks+=secs[i].marks; n+=secs[i].n;
    if(secs[i].ready) ready++;
  }
  var goal=DB.state().goal.hsc.pct;
  return {
    papers:secs, sections:secs,
    marks:U.round(marks,1), outOf:n, pct: n? marks/n : 0,
    ready:ready, readyOf:secs.length,
    goal:goal, gap:U.round(goal - 100*(n?marks/n:0), 1),
    band:band(n?marks/n:0)
  };
}

/* An MCQ mark is not a grade — the written half decides that. So the
   band says where the MCQ half puts you, and nothing more. */
function band(pct){
  if(pct>=0.90) return {t:L('Where the MCQ half holds an A+','MCQ অংশে A+ ধরে রাখার মতো জায়গায়'), c:'ok'};
  if(pct>=0.76) return {t:L('Good &mdash; but still leaving a few marks behind','ভালো — তবু কয়েকটি নম্বর হাতে ফেলে আসছেন'), c:'ok'};
  if(pct>=0.60) return {t:L('Middling. This is where the most marks are to be won','মাঝামাঝি। এখান থেকেই সবচেয়ে বেশি নম্বর তোলা যায়'), c:'acc'};
  if(pct>=0.40) return {t:L('The MCQ half is still pulling you down','MCQ অংশ এখনও টেনে নামাচ্ছে'), c:'no'};
  return {t:L('Well behind. Volume first, speed after','অনেকটা পিছিয়ে। আগে পরিমাণ, পরে গতি'), c:'no'};
}

/* ---------- what would move the number most ----------
   Ranked by the marks a chapter is actually costing: its weight on the
   paper multiplied by how far below mastery it sits, with a bonus for
   chapters where a little work goes a long way (few answers on record). */
function leverage(track, limit){
  var out=[];
  var secs=ICE.sectionsOf(track||'hsc');
  var allN=0, s;
  for(s=0;s<secs.length;s++) allN+=secs[s].n;
  for(s=0;s<secs.length;s++){
    var secKey='hsc/'+secs[s].id;
    var tops=ICE.topicsOf(secKey);
    var secShare = allN ? secs[s].n/allN : 1/secs.length;
    for(var i=0;i<tops.length;i++){
      var t=tops[i], m=AB.mastery(t.id), n=AB.seen(t.id);
      var p = m.unknown ? 0.30 : m.p;
      var weight = t.w*secShare;
      var headroom = Math.max(0, 0.92-p);
      var cheap = n<8 ? 1.45 : n<20 ? 1.15 : 1;
      out.push({
        topic:t, sec:secs[s], mastery:m, n:n,
        cost: weight*headroom*100,
        gain: weight*headroom*cheap*100,
        mins: DB.minsOnTopic(t.id)
      });
    }
  }
  out.sort(function(a,b){ return b.gain-a.gain; });
  return limit? out.slice(0,limit) : out;
}

/* ---------- history, so the line can be drawn ---------- */
function snapshot(){
  var s=DB.state();
  if(!s.predLog) s.predLog={};
  var k=DB.today(), b=hsc(), by={};
  b.papers.forEach(function(p){ by[p.key]=U.round(p.marks,1); });
  s.predLog[k]={ hsc:U.round(b.marks,1), of:b.outOf, by:by };
  /* keep a year */
  var keys=Object.keys(s.predLog).sort();
  while(keys.length>370){ delete s.predLog[keys.shift()]; }
  DB.save();
  return s.predLog[k];
}
function history(days){
  var s=DB.state(); if(!s.predLog) return [];
  return DB.lastNDays(days||60).map(function(d){
    return {date:d.date, v:s.predLog[d.date]||null};
  });
}

/* ---------- days left ---------- */
function daysTo(track){
  var d=DB.state().examDate[track||'hsc'];
  if(!d) return null;
  return Math.ceil((new Date(d+'T00:00:00').getTime()-Date.now())/864e5);
}

return {hsc:hsc, paper:paper, charges:charges, band:band,
        leverage:leverage, snapshot:snapshot, history:history,
        daysTo:daysTo, Z_HARD:Z_HARD};
})();
