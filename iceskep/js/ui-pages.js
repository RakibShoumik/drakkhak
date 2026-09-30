/* ===========================================================
   PAGES — everything one tap inside the main places.

   Each page opens with a back link to where it lives, a title,
   and a line saying what it is for. The long explanations are
   still here, folded under "How is this worked out?", for the
   people who want them and out of the way of those who do not.

   The chapter page is the heart of the map: Learn first (a revision
   sheet built from the chapter's own questions, with a worked example
   for every sub-topic), then Drill (sets of that chapter until every
   question is done and all three stars are won).
   =========================================================== */
var PAGES = (function(){

function h(s){ return U.h(s); }
function track(){ return DB.state().track; }
function back(to, label, p){
  return '<a href="#/'+to+'" class="back" data-go="'+to+'"'+(p?' data-p="'+h(p)+'"':'')+'>&lsaquo; '+label+'</a>';
}
function head(backTo, backLabel, kicker, title, lede, backP){
  return '<div class="phead">'+back(backTo, backLabel, backP)+'<span class="kicker">'+kicker+'</span><h1>'+title+'</h1>'+
    (lede?'<p class="lede">'+lede+'</p>':'')+'</div>';
}
function how(title, inner){
  return '<details class="more"><summary>'+(title||L('How is this worked out?','এটি কীভাবে হিসাব হয়?'))+'</summary><div class="inner small" style="font-size:14px;line-height:1.65">'+inner+'</div></details>';
}
function stat(l,v,s,c){ return UI.stat(l,v,s,c); }
function wrap(o){ return '<div class="stack">'+o+'</div>'; }
function scoreBar(sc, mini){ return CH.scoreBar(sc, mini); }
var PROG=function(){ return L('Progress','অগ্রগতি'); };
var PRAC=function(){ return L('Practice','অনুশীলন'); };
var REC=function(){ return L('Your record','আপনার রেকর্ড'); };

/* ============================================================
   THE WHOLE PLAN
   ============================================================ */
function plan(){
  var t=track(), px=PLAN.track(t), steps=PLAN.path(t), st=DB.state().settings;
  var o=head('progress',PROG(), L('The whole syllabus, in order','পুরো সিলেবাস, ক্রম অনুযায়ী'),
    L(PLAN.daysText(px.minutes)+' of study left',PLAN.daysText(px.minutes)+' পড়া বাকি'),
    L('At '+U.mins(PLAN.dailyMin())+' a day. '+U.num(px.cleared)+' of '+U.num(px.total)+' questions done, '+px.tricksRead+' of '+px.tricks+' cards read.',
      'দিনে '+U.mins(PLAN.dailyMin())+' হিসাবে। '+U.num(px.total)+'টির মধ্যে '+U.num(px.cleared)+'টি প্রশ্ন শেষ, '+px.tricks+'টির মধ্যে '+px.tricksRead+'টি কার্ড পড়া।'));
  o+='<div><div class="bar thick"><i style="width:'+Math.max(1,U.round(100*PLAN.pct(px),1))+'%"></i></div>'+
     '<div class="btns" style="margin-top:18px"><button class="btn" data-act="quickStart">'+L('Continue the plan','পরিকল্পনা চালিয়ে যান')+' &middot; '+st.setSize+'</button>'+
     '<button class="btn ghost" data-go="map">'+L('See it as a map','ম্যাপে দেখুন')+'</button>'+
     '<button class="btn ghost" data-go="settings">'+L('Change study time','পড়ার সময় বদলান')+'</button></div></div>';
  /* The path is long — a hundred and twenty-two chapters — so it is shown
     paper by paper, with each paper's own chapter order kept intact. */
  var bySec={}, order=[];
  steps.forEach(function(s2){
    var k=s2.x.topic.sec;
    if(!bySec[k]){ bySec[k]=[]; }
    bySec[k].push(s2);
  });
  ICE.sectionsOf(t).forEach(function(sec){ var k='hsc/'+sec.id; if(bySec[k]) order.push({sec:sec, key:k, list:bySec[k]}); });
  order.forEach(function(g){
    var ps=PLAN.section(g.key);
    var open = g.list.some(function(x){ return x.status==='now' || x.status==='next'; });
    o+='<details class="more"'+(open?' open':'')+'><summary>'+h(ICE.sname(g.sec))+
       ' &middot; '+L(ps.cleared+' of '+ps.total,ps.total+'-এ '+ps.cleared)+' &middot; '+PLAN.daysText(ps.minutes)+L(' left',' বাকি')+'</summary><div class="inner">';
    g.list.forEach(function(s2){
      var x=s2.x, sc=AB.score({topic:s2.id}).score;
      o+='<button class="step '+s2.status+'" data-go="topic" data-p="'+h(s2.id)+'">'+
        '<span class="n">'+(s2.status==='done'?'&#10003;':x.topic.n)+'</span>'+
        '<span><span class="t">'+h(ICE.tname(x.topic))+(s2.status==='now'?' <span class="kicker acc" style="font-size:9.5px">'+L('now','এখন')+'</span>':'')+
          (s2.status==='soon'?' <i class="soon-tag">'+L('soon','শিগগির')+'</i>':'')+'</span>'+
        '<span class="s" style="display:block">'+(x.est?L('about '+x.total+' questions, being written','প্রায় '+x.total+'টি প্রশ্ন, লেখা হচ্ছে'):L(x.cleared+' of '+x.total+' &middot; score '+sc,x.total+'-এ '+x.cleared+' &middot; স্কোর '+sc))+' '+
          UI.starMarks(GAME.stars(s2.id).n)+'</span></span>'+
        '<span class="bar thin"><i class="'+(s2.status==='done'?'ok':'')+'" style="width:'+Math.max(1,U.round(100*PLAN.pct(x),1))+'%"></i></span>'+
        '<span class="d">'+PLAN.daysText(x.minutes)+'</span></button>';
    });
    o+='</div></details>';
  });
  var types=PLAN.types(t), tn={mc:L('Simple (one answer)','সাধারণ (এক উত্তর)'), mcomp:L('Multiple completion (i, ii, iii)','একাধিক সম্পূর্ণকরণ (i, ii, iii)')};
  var rows='';
  types.forEach(function(ty){
    rows+='<tr><td>'+h(tn[ty.type]||ty.type)+'</td><td class="n">'+ty.cleared+'</td><td class="n">'+ty.total+'</td>'+
      '<td style="width:120px;padding-top:16px"><span class="bar thin"><i style="width:'+Math.max(1,U.round(100*PLAN.pct(ty),1))+'%"></i></span></td>'+
      '<td class="n">'+PLAN.daysText(ty.minutes)+'</td></tr>';
  });
  o+=how(L('Every question type','প্রশ্নের ধরন অনুযায়ী'), '<div class="scrollx"><table class="tbl"><tr><th>'+L('Type','ধরন')+'</th><th class="n">'+L('Done','শেষ')+'</th><th class="n">'+L('In the bank','ব্যাংকে')+'</th><th></th><th class="n">'+L('Left','বাকি')+'</th></tr>'+rows+'</table></div>');
  o+=how(L('What counts as done','কোনটিকে শেষ বলা হয়'),
    L('<p>A question is done when you get it right <b>inside the paper\'s own time</b>.</p>'+
      '<p>If you ever got it wrong, it counts as done only when you get it right again <b>on a later day</b> &mdash; right straight after seeing the answer is memory, not skill.</p>'+
      '<p>Days left = for every unfinished question, its time plus a quarter-minute to read the result, times the attempts your own hit-rate says it will take &mdash; plus unread Learn points and cards &mdash; divided by your study time per day. Chapters not written yet are costed from their page count.</p>',
      '<p>একটি প্রশ্ন শেষ হয় তখনই, যখন <b>প্রশ্নপত্রের বাঁধা সময়ের ভিতরে</b> সেটি ঠিক করেন।</p>'+
      '<p>কখনও ভুল করে থাকলে সেটি শেষ বলে গোনা হয় কেবল <b>পরের কোনো দিনে</b> আবার ঠিক করলে &mdash; উত্তর দেখার সাথে সাথে পারা মানে স্মৃতি, দক্ষতা নয়।</p>'+
      '<p>বাকি দিন = প্রতিটি অসমাপ্ত প্রশ্নের বাঁধা সময়, সাথে ফল পড়ার এক-চতুর্থাংশ মিনিট, গুণ আপনার নিজের হিট-রেট বলে দেওয়া চেষ্টার সংখ্যা &mdash; সাথে না-পড়া শেখার পয়েন্ট ও কার্ড &mdash; ভাগ দিনে আপনার পড়ার সময়। যে অধ্যায় এখনও লেখা হয়নি, তার হিসাব পৃষ্ঠাসংখ্যা থেকে।</p>'));
  return wrap(o);
}

/* ============================================================
   THE PREDICTION — one cautious MCQ mark per paper
   ============================================================ */
var MIN_ANS=20;
function predict(){
  var t=track(), s=DB.state(), hard=s.settings.hardPredict, b=PREDICT.hsc();
  var o=head('progress',PROG(), L('Where you will land in the MCQ','বহুনির্বাচনিতে আপনি কোথায় নামবেন'), L('Prediction','পূর্বাভাস'),
    L('Built to be beaten. It starts from what your answers say, then charges for every reason the estimate might be flattering. Sit the real exam and you should be above it about nine times in ten.',
      'সংখ্যাটি ছাড়িয়ে যাওয়ার জন্যই বানানো। আপনার উত্তর যা বলে সেখান থেকে শুরু করে, তারপর যে যে কারণে অনুমানটি বাড়িয়ে বলা হতে পারে তার প্রতিটির দাম কাটা হয়। আসল পরীক্ষা দিলে দশবারে প্রায় নয়বার এর ওপরে থাকা উচিত।'));
  o+='<div class="row" style="flex-wrap:wrap"><button type="button" class="onoff'+(hard?' on':'')+'" data-act="flip" data-arg="hardPredict">'+(hard?L('On','চালু'):L('Off','বন্ধ'))+'</button>'+
     '<span class="small">'+L('Hard mode &mdash; ','কঠিন মোড &mdash; ')+(hard?L('the estimate\'s 10th percentile','অনুমানের দশম পার্সেন্টাইল'):L('the middle of the estimate; do not plan on it','অনুমানের মাঝামাঝি; এটি ধরে পরিকল্পনা করবেন না'))+'</span>'+
     '<span class="grow"></span><a href="#/settings" class="link quiet" data-go="settings">'+L('Set your target','লক্ষ্য ঠিক করুন')+' &rsaquo;</a></div>';

  o+='<div class="card"><div class="label">'+L('The MCQ of all eleven papers, together','এগারোটি পত্রের বহুনির্বাচনি, একসাথে')+'</div>'+
    '<div class="pred"><div class="pn"><b data-count="'+U.round(b.marks,1)+'" data-dec="1">'+U.round(b.marks,1)+'</b>'+
    '<span>/ '+b.outOf+' &middot; '+L('target ','লক্ষ্য ')+b.goal+'%</span></div></div>'+
    '<p style="margin-top:10px;font-size:17px;color:var(--'+(b.band.c==='ok'?'ok':b.band.c==='no'?'no':'accent')+')">'+h(b.band.t)+'</p>'+
    '<p class="small" style="margin-top:6px">'+L('This is the MCQ half only. The creative (written) half is not measured here, and a grade needs both &mdash; so there is no grade promised here.',
      'এটি কেবল বহুনির্বাচনি অংশ। সৃজনশীল অংশ এই অ্যাপ মাপে না, আর গ্রেড ঠিক হয় দুটি মিলেই &mdash; তাই এখানে কোনো গ্রেডের প্রতিশ্রুতি নেই।')+'</p></div>';

  o+='<div class="card" style="padding:8px 16px"><div class="scrollx"><table class="tbl">'+
     '<tr><th>'+L('Paper','পত্র')+'</th><th class="n">'+L('Reached','যতদূর পৌঁছাবেন')+'</th><th class="n">'+L('Right','ঠিক')+'</th><th class="n">'+L('Marks','নম্বর')+'</th><th class="n">%</th></tr>';
  b.papers.forEach(function(sec){
    if(sec.ledger.n<MIN_ANS){
      o+='<tr><td>'+h(ICE.sname(sec.key)||sec.name)+'</td><td class="n" colspan="4" style="color:var(--ink-3)">'+
        L(sec.ledger.n+' of '+MIN_ANS+' answers &mdash; not enough evidence for a number yet',MIN_ANS+'টির মধ্যে '+sec.ledger.n+'টি উত্তর &mdash; সংখ্যা দেখানোর মতো প্রমাণ এখনও নেই')+'</td></tr>';
      return;
    }
    o+='<tr><td>'+h(ICE.sname(sec.key)||sec.name)+'</td><td class="n"'+(sec.reach<0.95?' style="color:var(--no)"':'')+'>'+U.pct(sec.reach)+'%</td>'+
      '<td class="n">'+U.round(sec.right,1)+'</td><td class="n"><b>'+U.round(sec.marks,1)+'</b> / '+sec.n+'</td>'+
      '<td class="n"'+(100*sec.pct>=b.goal?' style="color:var(--ok)"':'')+'>'+U.pct(sec.pct)+'%</td></tr>';
  });
  o+='</table></div></div>';

  var lev=PREDICT.leverage(t, 6);
  o+='<div><div class="seclabel">'+L('What would move it most','কী সবচেয়ে বেশি নাড়াবে')+'</div><div class="links">';
  lev.forEach(function(Lv){
    o+='<a href="#/topic" data-go="topic" data-p="'+h(Lv.topic.id)+'"><span class="grow"><span class="lt">'+h(ICE.tname(Lv.topic))+'</span>'+
      '<span class="ls">'+h(ICE.sname(Lv.sec))+' &middot; '+(Lv.n? L(Lv.n+' answers, '+U.pct(Lv.mastery.p)+'% right',Lv.n+'টি উত্তর, '+U.pct(Lv.mastery.p)+'% ঠিক') : L('never tested','কখনও পরীক্ষা হয়নি'))+'</span></span>'+
      '<span style="width:120px">'+CH.gauge(Lv.mastery)+'</span><span class="chev">&rsaquo;</span></a>';
  });
  o+='</div></div>';

  var hist=PREDICT.history(60);
  var pts=hist.map(function(x){ return {label:x.date, v:x.v?x.v.hsc:null}; });
  if(pts.filter(function(p){ return p.v!==null; }).length>=2){
    o+='<section class="card"><div class="spread" style="margin-bottom:10px"><h3 style="font-size:21px">'+L('Over time','সময়ের সাথে')+'</h3><span class="label">'+L('last 60 days','শেষ ৬০ দিন')+'</span></div>'+
       UI.lineChart(pts, {fmt:function(v){ return U.round(v,1); }, start:L('60 days ago','৬০ দিন আগে'), end:L('today','আজ')})+'</section>';
  }

  var led=L('<p>&ldquo;Reached&rdquo; is how far into the paper your median pace gets you in the time allowed. Questions after that score zero, and the board takes nothing off for a wrong answer &mdash; so an unreached question is the only certain zero.</p>',
    '<p>&ldquo;যতদূর পৌঁছাবেন&rdquo; মানে আপনার মধ্যক গতিতে বাঁধা সময়ে পত্রের কত অংশ পর্যন্ত পৌঁছানো যায়। তার পরের প্রশ্নগুলোতে শূন্য, আর বোর্ড ভুলের জন্য কিছু কাটে না &mdash; তাই না-পৌঁছানো প্রশ্নই একমাত্র নিশ্চিত শূন্য।</p>');
  b.papers.forEach(function(sc){
    if(sc.ledger.n<MIN_ANS) return;
    led+='<h3 style="font-size:17px;margin:14px 0 6px;color:var(--ink)">'+h(ICE.sname(sc.key)||sc.name)+'</h3><table class="ledger">'+
      '<tr><td>'+L('The hit-rate your answers say','আপনার উত্তর যে হিট-রেট বলে')+'<span class="sub">'+L('at this paper\'s average difficulty','এই পত্রের গড় কাঠিন্যে')+'</span></td><td>'+U.pct(sc.p)+'%</td></tr>';
    sc.ledger.charges.forEach(function(c){
      led+='<tr><td>'+h(c.label)+'<span class="sub">'+c.note+'</span></td><td class="minus">&minus;'+U.round(c.amount,2)+'&sigma;</td></tr>';
    });
    led+='<tr><td>'+L('Questions reached in '+ICE.paperMinutes(sc.key)+' minutes',ICE.paperMinutes(sc.key)+' মিনিটে যতটি প্রশ্নে পৌঁছাবেন')+'<span class="sub">'+
      (sc.medPace?L('median '+Math.round(sc.medPace)+' s, allowed '+Math.round(sc.allowed)+' s','মধ্যক '+Math.round(sc.medPace)+' সেকেন্ড, বাঁধা '+Math.round(sc.allowed)+' সেকেন্ড')
                 :L('no timed answers yet &mdash; 88% assumed','এখনও সময় মাপা উত্তর নেই &mdash; ৮৮% ধরা হয়েছে'))+
      '</span></td><td>'+U.round(sc.reached,1)+' / '+sc.n+'</td></tr>'+
      '<tr class="sum"><td>'+L('Marks from this paper','এই পত্র থেকে নম্বর')+'</td><td>'+U.round(sc.marks,1)+'</td></tr></table>';
  });
  o+=how(L('How each paper was worked out','প্রতিটি পত্রের হিসাব কীভাবে হলো'), led);
  return wrap(o);
}

/* ============================================================
   THIS WEEK
   ============================================================ */
function wrapped(){
  var w=QUEST.wrapped();
  var dq=w.q-w.prevQ, da=w.acc-w.prevAcc, dm=w.mins-w.prevMins;
  function arrow(x){ return x>0?'<span class="ok">&#9650;</span>':x<0?'<span class="no">&#9660;</span>':''; }
  var o=head('progress',PROG(), L('Week starting ','সপ্তাহ শুরু ')+UI.dShort(new Date(w.week+'T00:00:00')), L('This week','এই সপ্তাহ'),
    L('How the week really went, against the week before.','সপ্তাহটি সত্যিই যেমন গেল, আগের সপ্তাহের সাথে মিলিয়ে।'));
  o+='<div class="grid4 stagger">'+
    stat(L('Questions','প্রশ্ন'), '<span data-count="'+w.q+'">'+w.q+'</span>', arrow(dq)+L(' vs last week ',' গত সপ্তাহের চেয়ে ')+(dq>=0?'+':'')+dq)+
    stat(L('Accuracy','শুদ্ধতা'), '<span data-count="'+Math.round(w.acc*100)+'">'+Math.round(w.acc*100)+'</span>%', arrow(da)+' '+(da>=0?'+':'')+Math.round(da*100)+L(' points',' পয়েন্ট'))+
    stat(L('Study','পড়া'), U.mins(w.mins), arrow(dm)+' '+(dm>=0?'+':'&minus;')+U.mins(Math.abs(dm)))+
    stat(L('Days studied','পড়া হয়েছে'), w.days+L(' / 7 days',' / ৭ দিন'), L(w.cleared+' done for good',w.cleared+'টি পাকাপাকি শেষ'))+'</div>';
  var links='';
  if(w.best) links+=UI.link('topic', w.best.id, L('Best chapter: ','সেরা অধ্যায়: ')+h(ICE.tname(w.best.id)), L(Math.round(w.best.acc*100)+'% on '+w.best.n+' questions',w.best.n+'টি প্রশ্নে '+Math.round(w.best.acc*100)+'%'));
  if(w.worst) links+=UI.link('topic', w.worst.id, L('Where next week should go: ','পরের সপ্তাহ যেখানে যাওয়া উচিত: ')+h(ICE.tname(w.worst.id)), L(Math.round(w.worst.acc*100)+'% on '+w.worst.n+' questions',w.worst.n+'টি প্রশ্নে '+Math.round(w.worst.acc*100)+'%'), 'go', true);
  if(links) o+='<div class="links">'+links+'</div>';
  var stale=GAME.stale(track(), 5);
  if(stale.length){
    o+='<div><div class="seclabel">'+L('Going cold','ঠান্ডা হয়ে আসছে')+'</div><div class="links">';
    stale.forEach(function(s){
      o+='<button type="button" data-act="topicSet" data-arg="'+h(s.id)+'"><span class="grow"><span class="lt">'+h(ICE.tname(s.id))+'</span>'+
        '<span class="ls">'+L('not touched for a while','অনেকদিন ছোঁয়া হয়নি')+'</span></span><span style="width:90px" class="bar thin"><i class="ink" style="width:'+Math.round(s.f*100)+'%"></i></span>'+
        '<span class="lv acc">'+L('Refresh','ঝালিয়ে নিন')+'</span><span class="chev">&rsaquo;</span></button>';
    });
    o+='</div></div>';
  }
  if(!w.q) o+='<p class="empty">'+L('Nothing this week yet. The first set fills this page.','এই সপ্তাহে এখনও কিছু নেই। প্রথম সেটটিই এই পাতা ভরিয়ে দেবে।')+'</p>';
  return wrap(o);
}

/* ============================================================
   YOUR RECORD — the game layer, all in one place
   ============================================================ */
function crest(){
  var LV=GAME.level(), g=DB.game(), av=GAME.worn('avatar'), fr=GAME.worn('frame');
  var sc=AB.score({track:track()}), rank=GAME.rankOf(sc.score), dr=GAME.dream();
  return '<div class="crest frame-'+fr.id+'"><span class="ava">'+av.art+'</span><div class="grow">'+
    '<div class="spread"><b style="font-size:18px">'+L('Level ','লেভেল ')+LV.level+'</b><span class="small mono">'+LV.into+' / '+LV.need+' XP</span></div>'+
    '<div class="bar" style="margin:6px 0"><i style="width:'+Math.max(1,U.round(100*LV.into/LV.need,1))+'%"></i></div>'+
    '<div class="small">'+h(rank.name)+(dr?' &middot; '+h(dr.title):g.title?' &middot; '+h(g.title):'')+'</div></div>'+
    '<span class="coins"><span class="coin"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#coinSym"/></svg></span><span data-count="'+g.coins+'" data-key="coins">'+g.coins+'</span><i>'+L('coins','কয়েন')+'</i></span></div>';
}
function record(){
  var g=DB.game(), v=GAME.storedValue(), t=track();
  var o=head('progress',PROG(), L('What you have built','যা যা গড়ে তুলেছেন'), REC(),
    L('Nothing here is bought or typed in. Every number came from an answer you gave.','এখানের কিছুই কেনা নয়, টাইপ করাও নয়। প্রতিটি সংখ্যা এসেছে আপনার দেওয়া কোনো উত্তর থেকে।'));
  o+=crest();
  if(g.chests>0){
    o+='<div class="nudge gold"><div class="nb"><div class="kicker acc">'+L(g.chests+(g.chests===1?' chest':' chests')+' to open',g.chests+'টি সিন্দুক খোলা বাকি')+'</div>'+
       '<div class="nt">'+L('Earned by finishing sets, quests and clean sets.','সেট, কোয়েস্ট আর নির্ভুল সেট শেষ করে পাওয়া।')+(g.dry>=4?L(' The next one is certain to be rare.',' পরেরটি নিশ্চিতভাবেই দুর্লভ।'):'')+'</div></div>'+
       '<button class="btn sm" data-act="openChest">'+L('Open one','একটি খুলুন')+'</button></div>';
  }
  o+='<div class="grid4 stagger">'+
    stat(L('Answered','উত্তর দেওয়া'), '<span data-count="'+v.answered+'">'+v.answered+'</span>', L(v.correct+' right',v.correct+'টি ঠিক'))+
    stat(L('Measured study','মাপা পড়া'), U.mins(v.minutes), L('never idle time','অলস সময় কখনও নয়'))+
    stat(L('Mistakes fixed','শোধরানো ভুল'), '<span data-count="'+v.fixed+'">'+v.fixed+'</span>', L('missed once, earned later','ভুল করে, পরে অর্জন করে'))+
    stat(L('Badges','ব্যাজ'), v.badges+' <small>/ '+GAME.BADGES.length+'</small>', L('see them all','সবগুলো দেখুন'))+'</div>';
  var c=GAME.collection(t);
  o+='<div class="tiles stagger">'+
    tile('badges',L('Achievements','অর্জন'), L(v.badges+' of '+GAME.BADGES.length+' earned',GAME.BADGES.length+'-এ '+v.badges+'টি পাওয়া'))+
    tile('collection',L('Collection','সংগ্রহ'), L(c.tricks.got+' cards, '+c.topics.got+' chapters',c.tricks.got+'টি কার্ড, '+c.topics.got+'টি অধ্যায়'))+
    tile('shop',L('Shop','দোকান'), L(g.coins+' coins to spend',g.coins+'টি কয়েন খরচের মতো'))+
    tile('social',L('Duels and cards','দ্বৈরথ ও কার্ড'), L('nothing leaves unless you send it','আপনি না পাঠালে কিছুই বাইরে যায় না'))+
    tile('quests',L('Quests','কোয়েস্ট'), L(QUEST.streak().live+'-day streak',QUEST.streak().live+' দিনের ধারা'))+
    tile('modes',L('Ways to practise','অনুশীলনের উপায়'), L(MODES.list().filter(function(m){ return m.open; }).length+' of '+MODES.list().length+' open',MODES.list().length+'-এ '+MODES.list().filter(function(m){ return m.open; }).length+'টি খোলা'))+
    '</div>';
  var recs='';
  for(var id in GAME.RECORDS){
    var r=g.records[id]; if(!r) continue;
    recs+='<div class="spread" style="padding:10px 0;border-bottom:1px solid var(--rule)"><span class="ui" style="font-size:14px">'+h(GAME.RECORDS[id].name)+
      ' <span class="small">&middot; '+U.ago(r.t)+'</span></span><b class="mono" style="font-size:13px">'+GAME.fmtRecord(id, r.v)+'</b></div>';
  }
  o+='<div><div class="seclabel">'+L('Personal records','নিজের রেকর্ড')+'</div>'+(recs||'<p class="empty">'+L('Nothing yet. Finish your first set and several appear at once.','এখনও কিছু নেই। প্রথম সেট শেষ করলেই একসাথে কয়েকটি তৈরি হবে।')+'</p>')+'</div>';
  o+=seasonCard();
  o+='<div class="btns"><button class="btn ghost sm" data-act="cert">'+L('Print a certificate','সনদ প্রিন্ট করুন')+'</button>'+
     '<button class="btn ghost sm" data-act="report">'+L('Print a progress report','অগ্রগতির রিপোর্ট প্রিন্ট করুন')+'</button>'+
     '<button class="btn ghost sm" data-go="wrapped">'+L('This week','এই সপ্তাহ')+'</button></div>';
  return wrap(o);
}
function tile(go, name, sub){
  return '<button class="tile" data-go="'+go+'"><span class="tt">'+h(name)+'</span><span class="ts">'+sub+'</span></button>';
}
function seasonCard(){
  var s=GAME.season(), o='<section class="card"><div class="spread"><div><div class="label">'+L('Season ','মৌসুম ')+h(s.id)+'</div>'+
    '<p class="small" style="margin-top:4px">'+L('Four weeks at a time. The track starts again; everything you earned stays.','একবারে চার সপ্তাহ। ট্র্যাক আবার শুরু হয়; যা অর্জন করেছেন সব থেকে যায়।')+'</p></div>'+
    '<span class="mono small">'+s.xp+' XP</span></div><div class="season" style="margin-top:12px">';
  s.track.forEach(function(step, i){
    var got=s.xp>=step.at, taken=s.claimed[i];
    o+='<div class="sstep'+(got?' got':'')+(taken?' taken':'')+'"><b>'+step.at+'</b><span>'+step.give+'</span>'+
       (taken?'<span class="label">'+L('claimed','নেওয়া হয়েছে')+'</span>':got?'<button class="btn xs" data-act="season" data-arg="'+i+'">'+L('Claim','নিন')+'</button>':'<span class="label">&nbsp;</span>')+'</div>';
  });
  return o+'</div></section>';
}

function badges(){
  var g=DB.game(), order=['legend','epic','rare','common'];
  var RN={legend:L('legend','কিংবদন্তি'), epic:L('epic','অসাধারণ'), rare:L('rare','দুর্লভ'), common:L('common','সাধারণ')};
  var o=head('record',REC(), L(Object.keys(g.badges).length+' of '+GAME.BADGES.length+' earned',GAME.BADGES.length+'-এ '+Object.keys(g.badges).length+'টি পাওয়া'), L('Achievements','অর্জন'),
    L('The secret ones stay hidden until you stumble on them. Not one can be bought.','গোপনগুলো লুকিয়ে থাকে, হঠাৎ পেয়ে গেলেই দেখা যায়। একটিও কেনা যায় না।'));
  order.forEach(function(r){
    var list=GAME.BADGES.filter(function(b){ return b.r===r; });
    if(!list.length) return;
    o+='<div><div class="rar '+r+'">'+RN[r]+'</div><div class="grid-auto">';
    list.forEach(function(b, i){
      var got=g.badges[b.id], hide=b.secret && !got;
      o+='<div class="badge '+(got?'got ':'')+r+(hide?' secret':'')+'" style="--i:'+i+'"><span class="bi">'+(got?'&#9733;':hide?'?':'&#9734;')+'</span>'+
         '<b>'+(hide?L('Secret','গোপন'):h(b.name))+'</b><span class="small">'+(hide?L('Earned by doing something out of the ordinary.','অন্যরকম কিছু করে ফেললে পাওয়া যায়।'):h(b.note))+'</span>'+
         (got?'<span class="small" style="display:block;margin-top:6px">'+U.ago(got)+'</span>':'')+'</div>';
    });
    o+='</div></div>';
  });
  return wrap(o);
}
function collection(){
  var t=track(), c=GAME.collection(t), g=DB.game();
  var o=head('record',REC(), 'HSC', L('Collection','সংগ্রহ'),
    L('A card opens when you use it to get a question right. A chapter card arrives when every question in that chapter is done.','কোনো কার্ড খোলে যখন সেই কার্ড কাজে লাগিয়ে একটি প্রশ্ন ঠিক করেন। অধ্যায়ের কার্ড আসে যখন সেই অধ্যায়ের সব প্রশ্ন শেষ হয়।'));
  o+='<div><div class="seclabel">'+L('Formula and memory cards','সূত্র ও মনে রাখার কার্ড')+' &middot; '+L(c.tricks.got+' of '+c.tricks.total,c.tricks.total+'-এ '+c.tricks.got)+'</div><div class="grid-auto" style="margin-top:12px">';
  c.tricks.list.forEach(function(tk, i){
    var got=g.cards.tricks[tk.id];
    o+='<button class="ccard'+(got?' got':'')+'" style="--i:'+i+'" '+(got?'data-go="trick" data-p="'+h(tk.id)+'"':'disabled')+'>'+
       '<span class="ck">'+h(ICE.tname(tk.topic))+'</span><b>'+(got?h(tk.name):'&mdash;')+'</b>'+
       '<span class="small">'+(got?tk.one:L('Opens when you use it on a question.','কোনো প্রশ্নে কাজে লাগালেই খুলবে।'))+'</span></button>';
  });
  if(!c.tricks.list.length) o+='<p class="empty">'+L('No cards are written yet.','এখনও কোনো কার্ড লেখা হয়নি।')+'</p>';
  o+='</div></div><div><div class="seclabel">'+L('Chapter cards','অধ্যায়ের কার্ড')+' &middot; '+L(c.topics.got+' of '+c.topics.total,c.topics.total+'-এ '+c.topics.got)+'</div><div class="grid-auto" style="margin-top:12px">';
  c.topics.list.forEach(function(tp, i){
    var got=g.cards.topics[tp.id], px=PLAN.topic(tp.id);
    o+='<button class="ccard'+(got?' got':'')+'" style="--i:'+i+';opacity:'+(got?1:.7)+'" data-go="topic" data-p="'+h(tp.id)+'">'+
       '<span class="ck">'+h(ICE.sname(tp.sec))+'</span><b>'+h(ICE.tname(tp))+'</b>'+UI.starMarks(GAME.stars(tp.id).n)+
       '<span class="small" style="display:block;margin-top:4px">'+(px.est?L('questions coming soon','প্রশ্ন শিগগির আসছে'):L(px.cleared+' of '+px.total+' done',px.total+'-এ '+px.cleared+'টি শেষ'))+'</span></button>';
  });
  o+='</div></div>';
  var notes=Object.keys(g.notes);
  if(notes.length){
    o+='<div><div class="seclabel">'+L('Your notes','আপনার নোট')+'</div><div class="links">';
    notes.forEach(function(id){ var tk=AB.trick(id); o+=UI.link('trick', id, h(tk?tk.name:id), h(g.notes[id].t)); });
    o+='</div></div>';
  }
  return wrap(o);
}
function shop(){
  var g=DB.game();
  var o=head('record',REC(), L(g.coins+' coins',g.coins+'টি কয়েন'), L('Shop','দোকান'),
    L('Coins come from right answers, quests and chests. Nothing here costs money, and nothing makes any question easier.','কয়েন আসে ঠিক উত্তর, কোয়েস্ট আর সিন্দুক থেকে। এখানে কিছুতেই টাকা লাগে না, আর কিছুই কোনো প্রশ্ন সহজ করে দেয় না।'));
  ['avatar','frame','pack'].forEach(function(kind){
    var name={avatar:L('Avatars','অবতার'), frame:L('Frames','ফ্রেম'), pack:L('Sound packs','শব্দের সেট')}[kind];
    o+='<div><div class="seclabel">'+name+'</div><div class="grid-auto" style="margin-top:12px">';
    GAME.COSMETICS.filter(function(c){ return c.kind===kind; }).forEach(function(c){
      var owned=GAME.owns(c.id), on=g.wear[kind]===c.id;
      o+='<div class="shopitem'+(on?' on':'')+'"><span class="art">'+(c.art||(kind==='frame'?'&#9634;':'&#9835;'))+'</span><b>'+h(c.name)+'</b>'+
         (on?'<span class="kicker acc">'+L('wearing','পরা আছে')+'</span>'
            : owned?'<button class="btn xs ghost" data-act="wear" data-arg="'+c.id+'">'+L('Wear','পরুন')+'</button>'
                   :'<button class="btn xs" data-act="buy" data-arg="'+c.id+'">'+L(c.cost+' coins',c.cost+'টি কয়েন')+'</button>')+'</div>';
    });
    o+='</div></div>';
  });
  o+='<div class="grid2">'+stat(L('50:50 lifelines','৫০:৫০ লাইফলাইন'), String(g.lifelines.fifty), L('removes options','অপশন সরিয়ে দেয়'))+
     stat(L('Card lifelines','কার্ড লাইফলাইন'), String(g.lifelines.trick), L('shows the method','পদ্ধতিটি দেখায়'))+'</div>'+
     '<p class="small">'+L('Lifelines come from chests, never from the shop &mdash; a lifeline you can buy is no longer earned.','লাইফলাইন আসে সিন্দুক থেকে, দোকান থেকে কখনও নয় &mdash; যে লাইফলাইন কেনা যায়, সেটি আর অর্জন করা হয় না।')+'</p>';
  return wrap(o);
}
function social(){
  var g=DB.game(), t=track();
  var o=head('record',REC(), L('Only what you send','কেবল যা আপনি পাঠান'), L('Duels and cards','দ্বৈরথ ও কার্ড'),
    L('No leaderboard, no friends list, no feed. A duel is a code you give someone; a card is a picture you save.','কোনো লিডারবোর্ড নেই, বন্ধুতালিকা নেই, ফিডও নেই। দ্বৈরথ মানে একটি কোড, যা আপনি কাউকে দেন; কার্ড মানে একটি ছবি, যা আপনি সেভ করেন।'));
  o+='<section class="card" style="display:flex;flex-direction:column;gap:12px"><h3 style="font-size:21px">'+L('A duel with a friend','বন্ধুর সাথে দ্বৈরথ')+'</h3>'+
     '<p class="muted" style="font-size:16.5px">'+L('One code is ten questions. You both answer the same ten, then compare result codes. It works in any messaging app.','একটি কোড মানে দশটি প্রশ্ন। দুজনেই একই দশটির উত্তর দেন, তারপর ফলাফলের কোড মিলিয়ে দেখেন। যেকোনো মেসেজিং অ্যাপে চলে।')+'</p>'+
     (GAME.has('duel')?'<div class="btns"><button class="btn" data-act="newDuel">'+L('Make a code','একটি কোড বানান')+'</button><button class="btn ghost" data-act="joinDuel">'+L('Enter a code','কোড বসান')+'</button></div>'
                      :'<p class="small">'+L('Duels open at level '+MODES.lockLevel('duel')+'.','দ্বৈরথ খোলে লেভেল '+MODES.lockLevel('duel')+'-এ।')+'</p>');
  if(g.duels.length){
    o+='<div class="links" style="margin-top:6px">';
    g.duels.forEach(function(d, i){
      var res = d.theirs ? MODES.duelWinner(d, d.theirs) : null;
      o+='<button type="button" '+(d.theirs?'disabled':'data-act="theirResult" data-arg="'+i+'"')+'><span class="grow"><span class="lt mono">'+h(d.code)+'</span>'+
         '<span class="ls">'+U.ago(d.t)+' &middot; '+L('you: '+d.right+' in '+U.secs(d.secs),'আপনি '+U.secs(d.secs)+'-এ '+d.right+'টি')+'</span></span>'+
         '<span class="lv'+(res==='you'?' acc':'')+'">'+(res?(res==='you'?L('You won','আপনি জিতেছেন'):res==='tie'?L('Tie','সমান'):L('They won','ওরা জিতেছে')):L('Enter their code','ওদের কোড বসান'))+'</span></button>';
    });
    o+='</div>';
  }
  o+='</section>';
  o+='<section class="card" style="display:flex;flex-direction:column;gap:12px"><h3 style="font-size:21px">'+L('Cards you can save','যে কার্ড সেভ করতে পারেন')+'</h3>'+
     '<p class="muted" style="font-size:16.5px">'+L('A picture, drawn here and saved to your downloads. Whether you send it is up to you.','একটি ছবি, এখানেই আঁকা আর আপনার ডাউনলোডে রাখা। পাঠাবেন কি না, আপনার ইচ্ছা।')+'</p>'+
     '<div class="btns"><button class="btn ghost sm" data-act="card" data-arg="streak">'+L('Streak card','ধারার কার্ড')+'</button>'+
     '<button class="btn ghost sm" data-act="card" data-arg="level">'+L('Level card','লেভেলের কার্ড')+'</button>'+
     '<button class="btn ghost sm" data-act="card" data-arg="score">'+L('Score card','স্কোরের কার্ড')+'</button></div></section>';
  o+='<section class="card" style="display:flex;flex-direction:column;gap:12px"><h3 style="font-size:21px">'+L('For a teacher or parent','শিক্ষক বা অভিভাবকের জন্য')+'</h3>'+
     '<p class="muted" style="font-size:16.5px">'+L('A printable four-week report &mdash; measured minutes, questions, accuracy by paper and the cautious prediction.','চার সপ্তাহের একটি প্রিন্টযোগ্য রিপোর্ট &mdash; মাপা মিনিট, প্রশ্ন, পত্র অনুযায়ী শুদ্ধতা আর সাবধানী পূর্বাভাস।')+'</p>'+
     '<div class="btns"><button class="btn ghost sm" data-act="report">'+L('Print the report','রিপোর্ট প্রিন্ট করুন')+'</button><button class="btn ghost sm" data-act="cert">'+L('Print a certificate','সনদ প্রিন্ট করুন')+'</button></div></section>';
  if(g.reports.length) o+=how(L('Questions you have flagged ('+g.reports.length+')','আপনি যে প্রশ্নগুলো চিহ্নিত করেছেন ('+g.reports.length+')'), '<pre class="flagbox">'+h(SHARE.reportsText())+'</pre>');
  return wrap(o);
}

/* ============================================================
   MORE WAYS TO PRACTISE
   ============================================================ */
function modes(){
  var t=track(), LVn=GAME.level().level;
  var o=head('practice',PRAC(), L('Level ','লেভেল ')+LVn, L('More ways to practise','অনুশীলনের আরও উপায়'),
    L('Every mode uses the same questions and records the same honest result. They open as you level up, so the first week stays simple.',
      'প্রতিটি ধরন একই প্রশ্ন ব্যবহার করে আর একই সৎ ফল জমা রাখে। লেভেল বাড়ার সাথে এগুলো খোলে, যাতে প্রথম সপ্তাহটা সহজ থাকে।'));
  o+='<div class="links">';
  MODES.list().forEach(function(m){
    var inner='<span class="grow"><span class="lt">'+h(m.name)+'</span><span class="ls">'+h(m.note)+'</span></span>';
    if(!m.open){ o+='<button type="button" class="locked" disabled>'+inner+'<span class="lv">'+L('Level ','লেভেল ')+m.at+'</span></button>'; return; }
    if(m.id==='blitz'||m.id==='survival') o+='<button type="button" data-act="mode" data-arg="'+m.id+'">'+inner+'<span class="lv acc">'+L('Start','শুরু')+'</span><span class="chev">&rsaquo;</span></button>';
    else if(m.id==='mock') o+='<a href="#/mock" data-go="mock">'+inner+'<span class="lv acc">'+L('Choose','বেছে নিন')+'</span><span class="chev">&rsaquo;</span></a>';
    else if(m.id==='duel') o+='<a href="#/social" data-go="social">'+inner+'<span class="lv acc">'+L('Duel','দ্বৈরথ')+'</span><span class="chev">&rsaquo;</span></a>';
    else o+='<div style="display:flex;align-items:center;gap:14px;padding:12px 6px;border-bottom:1px solid var(--rule);flex-wrap:wrap">'+inner+picker(m.id)+'</div>';
  });
  o+='<button type="button" data-act="speed"><span class="grow"><span class="lt">'+L('Speed drill','গতির অনুশীলন')+'</span><span class="ls">'+L('Short, familiar questions on a tight clock.','ছোট, হাতের কাছের প্রশ্ন আঁটসাঁট ঘড়িতে।')+'</span></span>'+
     '<span class="lv acc">'+L('Start','শুরু')+'</span><span class="chev">&rsaquo;</span></button>';
  o+='</div>';
  o+='<section class="card" style="display:flex;flex-direction:column;gap:10px"><h3 style="font-size:21px">'+L('Skip a chapter you already know','যে অধ্যায় আপনার জানা, সেটি বাদ দিন')+'</h3>'+
     '<p class="muted" style="font-size:16.5px">'+L('The five hardest questions of that chapter. Get four right and it leaves your days left. You can bring it back any time.',
       'সেই অধ্যায়ের সবচেয়ে কঠিন পাঁচটি প্রশ্ন। চারটি ঠিক হলে অধ্যায়টি বাকি দিনের হিসাব থেকে বাদ যায়। যখন খুশি আবার ফেরাতে পারবেন।')+'</p>'+
     picker('skiptest', L('Take the skip test','বাদ দেওয়ার পরীক্ষা দিন'))+'</section>';
  o+='<section class="card" style="display:flex;flex-direction:column;gap:10px"><h3 style="font-size:21px">'+L('Measure yourself again','নিজের মান আবার মেপে নিন')+'</h3>'+
     '<p class="muted" style="font-size:16.5px">'+L('Twelve real questions from across the papers, at board level, checked together at the end.','সব পত্র থেকে বারোটি আসল প্রশ্ন, বোর্ডের মানে, শেষে একসাথে দেখা হবে।')+'</p>'+
     '<div><button class="btn ghost sm" data-act="mode" data-arg="diag">'+L('Answer twelve questions','বারোটি প্রশ্ন দিন')+'</button></div></section>';
  return wrap(o);
}
function picker(mode, label){
  var t=track(), o='<span class="row" style="flex-wrap:wrap;gap:8px"><select class="field" id="pick-'+mode+'" style="max-width:240px">';
  if(mode==='admission'){
    ICE.sectionsOf(t).forEach(function(s){ o+='<option value="'+h(s.track+'/'+s.id)+'">'+h(ICE.sname(s))+'</option>'; });
  } else {
    ICE.sectionsOf(t).forEach(function(s){
      var tops=ICE.topicsOf(s.track+'/'+s.id).filter(function(tp){ return AB.inTopic(tp.id).length; });
      if(!tops.length) return;
      o+='<optgroup label="'+h(ICE.sname(s))+'">';
      tops.forEach(function(tp){ o+='<option value="'+h(tp.id)+'">'+tp.n+'. '+h(ICE.tname(tp))+'</option>'; });
      o+='</optgroup>';
    });
  }
  return o+'</select><button class="btn sm" data-act="pickGo" data-arg="'+mode+'">'+(label||L('Start','শুরু'))+'</button></span>';
}

/* ============================================================
   QUESTS AND THE QUESTION OF THE DAY
   ============================================================ */
function quests(){
  var d=QUEST.daily(), w=QUEST.weekly(), st=QUEST.streak(), ev=QUEST.event(), qd=QUEST.qotd();
  var o=head('practice',PRAC(), L('Today and this week','আজ ও এই সপ্তাহ'), L('Quests','কোয়েস্ট'),
    L('Three small goals a day and one a week, set from what you actually do. None can be finished by leaving the page open.',
      'দিনে তিনটি ছোট লক্ষ্য আর সপ্তাহে একটি, আপনি সত্যিই যা করেন তা থেকেই বাঁধা। পাতা খুলে রেখে একটিও শেষ করা যায় না।'));
  if(ev) o+='<div class="nudge gold"><div class="nb"><div class="kicker acc">'+h(ev.name)+'</div><div class="nt">'+h(ev.note)+'</div></div></div>';
  o+='<section class="card"><div class="label" style="margin-bottom:6px">'+L('Today','আজ')+'</div>';
  d.forEach(function(q){
    o+='<div class="qrow'+(q.done?' done':'')+'"><span class="qt">'+q.text+(q.chest?' <span class="tag">'+L('chest','সিন্দুক')+'</span>':'')+'</span>'+
      '<span class="qb bar thin"><i class="'+(q.done?'ok':'')+'" style="width:'+Math.max(2,100*q.got/q.n)+'%"></i></span>'+
      '<span class="qn">'+q.got+' / '+q.n+'</span>'+
      (q.claimed?'<span class="kicker ok">'+L('claimed','নেওয়া হয়েছে')+'</span>':q.done?'<button class="btn xs" data-act="claim" data-arg="'+q.i+'">'+L('Claim','নিন')+' +'+q.xp+' XP</button>':
        '<span class="small">+'+q.xp+' XP</span>')+'</div>';
  });
  o+='</section>';
  if(w){
    o+='<section class="card"><div class="label" style="margin-bottom:6px">'+L('This week','এই সপ্তাহ')+'</div><div class="qrow'+(w.done?' done':'')+'"><span class="qt">'+w.text+'</span>'+
      '<span class="qb bar thin"><i class="'+(w.done?'ok':'')+'" style="width:'+Math.max(2,100*w.got/w.n)+'%"></i></span><span class="qn">'+w.got+' / '+w.n+'</span>'+
      (w.claimed?'<span class="kicker ok">'+L('claimed','নেওয়া হয়েছে')+'</span>':w.done?'<button class="btn xs" data-act="claimWeek">'+L('Claim','নিন')+'</button>':'<span class="small">'+L('two chests','দুটি সিন্দুক')+'</span>')+'</div></section>';
  }
  o+='<div class="grid2">'+
    '<section class="card"><div class="label">'+L('Question of the day','আজকের প্রশ্ন')+'</div><div style="margin:10px 0">'+grid()+'</div>'+
      (!qd.q?'<p class="small">'+L('No question yet.','এখনও কোনো প্রশ্ন নেই।')+'</p>':
        qd.ok===null?'<p class="small" style="margin-bottom:12px">'+L('The same question all day, a step above the board. Right first time pays sixty XP and a chest.','সারাদিন একই প্রশ্ন, বোর্ডের চেয়ে এক ধাপ ওপরে। প্রথমবারেই ঠিক হলে ষাট XP আর একটি সিন্দুক।')+'</p>'+
          '<button class="btn sm" data-act="qotd">'+L('Open','খুলুন')+'</button>'
        :'<p class="small">'+(qd.ok?L('You got it.','পেরেছেন।'):L('Not today. A new one tomorrow.','আজ হলো না। কাল নতুন একটি।'))+' '+L((DB.game().qotdCount||0)+' answered so far.','এ পর্যন্ত '+(DB.game().qotdCount||0)+'টি দিয়েছেন।')+'</p>')+'</section>'+
    '<section class="card"><div class="label">'+L('Streak','ধারা')+'</div><div class="stat" style="border:0;padding:0;background:none"><div class="v">'+st.live+' '+L(st.live===1?'day':'days','দিন')+'</div>'+
      '<div class="s">'+L('Best '+st.best+' &middot; '+st.freezes+' freezes in hand &middot; '+(st.met?'today is banked':'five questions bank today'),
        'সর্বোচ্চ '+st.best+' &middot; হাতে '+st.freezes+'টি ফ্রিজ &middot; '+(st.met?'আজকের দিন জমা হয়েছে':'পাঁচটি প্রশ্নেই আজকের দিন জমা হবে'))+'</div></div>'+
      (st.repair?'<div class="nudge" style="margin-top:12px"><div class="nb"><div class="nt" style="font-size:15px">'+
        L(st.repair.days+' days missed. The '+st.repair.streak+'-day streak can be brought back.',st.repair.days+' দিন হারিয়েছেন। '+st.repair.streak+' দিনের ধারাটি ফিরিয়ে আনা যায়।')+
        '</div></div><button class="btn sm" data-act="repair">'+L(st.repair.cost+' coins',st.repair.cost+'টি কয়েন')+'</button></div>'
        :'<p class="small" style="margin-top:12px">'+L('Once a week coins can repair one missed day, and two freezes a month cover the rest.','সপ্তাহে একবার কয়েন দিয়ে হারানো একটি দিন মেরামত করা যায়, আর মাসে দুটি ফ্রিজ বাকিটা সামলায়।')+'</p>')+
    '</section></div>';
  o+=seasonCard();
  return wrap(o);
}
function grid(){
  var g=(DB.game().qotd.grid||[]).slice(-14), o='';
  for(var i=0;i<g.length;i++) o+='<i class="sq s'+g[i]+'"></i>';
  return o||'<span class="small">'+L('No days yet.','এখনও কোনো দিন নেই।')+'</span>';
}
function doQotd(){
  var qd=QUEST.qotd();
  if(!qd.q) return UI.toast(L('No question of the day yet.','এখনও আজকের প্রশ্ন নেই।'));
  if(qd.ok!==null) return UI.toast(L('Today\'s is answered. A new one tomorrow.','আজকের উত্তর দেওয়া হয়ে গেছে। কাল নতুন একটি।'));
  RUN.start({queue:[qd.q], track:qd.q._track, mode:'qotd', title:L('Question of the day','আজকের প্রশ্ন'), back:UI.current()==='quests'?'quests':'today', noBrief:true});
}

/* ============================================================
   FORMULA AND MEMORY CARDS
   One card is one thing worth carrying into the exam hall: a formula,
   a unit, a date, a definition that the board keeps asking for.
   ============================================================ */
var trickFilter=null;
function tricks(focusTopic){
  var t=track(), all=AB.allTricks(t);
  var o=head('practice',PRAC(), L('Chapter by chapter','অধ্যায় ধরে ধরে'), L(all.length+' cards',all.length+'টি কার্ড'),
    L('Not theory: just what has to be remembered. One thing per card &mdash; something you can recall in the middle of a question.',
      'তত্ত্ব নয়, যেটুকু মনে রাখতে হয়। প্রতিটি কার্ডে একটি করে কথা &mdash; প্রশ্নের মাঝখানেই যা মনে করা যায়।'));
  if(!all.length) return wrap(o+'<p class="empty">'+L('No cards are written yet. Every chapter\'s Learn sheet already has its key points &mdash; open a chapter from the map.',
    'এখনও কোনো কার্ড লেখা হয়নি। প্রতিটি অধ্যায়ের শেখার পাতায় মূল কথাগুলো আছে &mdash; ম্যাপ থেকে একটি অধ্যায় খুলুন।')+'</p><div><button class="btn ghost" data-go="map">'+L('Open the map','ম্যাপ খুলুন')+'</button></div>');
  var active=focusTopic||trickFilter;
  var list=active ? all.filter(function(x){ return x.topic===active || (x.also||[]).indexOf(active)>=0; }) : all;
  var read=all.filter(function(x){ return DB.state().readTricks[x.id]; }).length;
  o+='<div class="row"><span class="label">'+L('Read','পড়া হয়েছে')+'</span><span class="mono" style="font-size:13px">'+read+' / '+all.length+'</span>'+
     '<span class="grow bar thin"><i style="width:'+Math.max(1,U.round(100*read/all.length,1))+'%"></i></span></div>';
  o+='<div class="chips"><button type="button" class="'+(!active?'on':'')+'" data-act="trickFilter" data-arg="all">'+L('All','সব')+'</button>';
  ICE.sectionsOf(t).forEach(function(sec){
    var sk=sec.track+'/'+sec.id;
    var tops=ICE.topicsOf(sk).filter(function(tp){
      return all.some(function(x){ return x.topic===tp.id || (x.also||[]).indexOf(tp.id)>=0; });
    });
    if(!tops.length) return;
    o+='<button type="button" class="'+(active===sk?'on':'')+'" data-act="trickFilter" data-arg="'+h(sk)+'">'+h(ICE.sname(sec))+'</button>';
  });
  o+='</div>';
  if(active && ICE.sections[active]){
    var ids={}; ICE.topicsOf(active).forEach(function(tp){ ids[tp.id]=1; });
    list=all.filter(function(x){ return ids[x.topic] || (x.also||[]).some(function(a2){ return ids[a2]; }); });
    o+='<div class="chips">';
    ICE.topicsOf(active).forEach(function(tp){
      var n=all.filter(function(x){ return x.topic===tp.id || (x.also||[]).indexOf(tp.id)>=0; }).length;
      if(n) o+='<button type="button" data-act="trickFilter" data-arg="'+h(tp.id)+'">'+tp.n+'. '+h(ICE.tname(tp))+' '+n+'</button>';
    });
    o+='</div>';
  }
  o+='<div>';
  list.forEach(function(tk){ o+=trickCard(tk, true); });
  if(!list.length) o+='<p class="empty">'+L('No cards in this paper yet.','এই পত্রে এখনও কোনো কার্ড নেই।')+'</p>';
  o+='</div>';
  return wrap(o);
}
function trickCard(tk, inList){
  var tp=ICE.topics[tk.topic];
  var drill=AB.inTopic(tk.topic).filter(function(q){ return q.trick===tk.id; }).length;
  var o='<div class="trick" data-tk="'+h(tk.id)+'"><div class="th"><h3>'+h(tk.name)+'</h3>'+
    (tk.saves?'<span class="saves">'+L('saves ~'+tk.saves+' s','~'+tk.saves+' সেকেন্ড বাঁচায়')+'</span>':'')+'</div>'+
    (inList&&tp?'<div class="kicker" style="margin-bottom:8px">'+h(ICE.sname(tp.sec))+' &middot; '+L('Chapter ','অধ্যায় ')+tp.n+'</div>':'')+
    '<div class="one">'+tk.one+'</div>';
  if(tk.lines&&tk.lines.length){ o+='<ul>'; tk.lines.forEach(function(l){ o+='<li>'+l+'</li>'; }); o+='</ul>'; }
  if(tk.ex) o+='<div class="ex"><div class="q">'+tk.ex.q+'</div><div class="a">'+tk.ex.a+'</div></div>';
  o+='<div class="btns" style="margin-top:14px">'+
    (drill?'<button class="btn sm ghost" data-act="trickDrill" data-arg="'+h(tk.id)+'">'+L('Drill it','অনুশীলন করুন')+' &middot; '+drill+'</button>':'')+
    (inList?'<a href="#/trick" class="link quiet" style="align-self:center" data-go="trick" data-p="'+h(tk.id)+'">'+L('Your note','আপনার নোট')+' &rsaquo;</a>':'')+'</div>';
  if(!inList){
    var n=SHARE.noteOf(tk.id);
    o+='<div style="margin-top:16px"><div class="label" style="margin-bottom:6px">'+L('Your own note','আপনার নিজের নোট')+'</div>'+
       '<textarea class="field" rows="2" placeholder="'+h(L('How you remember it, in your own words','নিজের ভাষায় যেভাবে মনে রাখেন'))+'" data-note="'+h(tk.id)+'">'+h(n?n.t:'')+'</textarea>'+
       (n?'<div class="small" style="margin-top:4px">'+L('saved ','সংরক্ষিত ')+U.ago(n.at)+'</div>':'')+'</div>';
  }
  return o+'</div>';
}
function trick(id){
  var tk=AB.trick(id);
  if(!tk) return tricks();
  UI.markTrickRead(id);
  var tp=ICE.topics[tk.topic];
  var o=head('tricks',L('The cards','কার্ডগুলো'), tp?h(ICE.sname(tp.sec))+' &middot; '+h(ICE.tname(tp)):'', h(tk.name));
  o+=trickCard(tk, false);
  var sibs=AB.tricksFor(tk.topic).filter(function(x){ return x.id!==id; });
  if(sibs.length){
    o+='<div><div class="seclabel">'+L('More cards from ','আরও কার্ড: ')+h(ICE.tname(tp))+'</div><div class="links">';
    sibs.forEach(function(s2){ o+=UI.link('trick', s2.id, h(s2.name), s2.one); });
    o+='</div></div>';
  }
  return wrap(o);
}
function saveNote(id, text){
  SHARE.note(id, text);
  UI.toast(text && text.trim() ? L('Note kept.','নোট রাখা হলো।') : L('Note removed.','নোট মুছে ফেলা হলো।'));
}
function trickDrill(id){
  var tk=AB.trick(id);
  var qs=AB.inTopic(tk.topic).filter(function(q){ return q.trick===id; });
  if(!qs.length) return UI.toast(L('No questions are linked to this card yet.','এই কার্ডের সাথে এখনও কোনো প্রশ্ন জোড়া নেই।'));
  RUN.start({queue:qs.slice(0, Math.max(DB.state().settings.setSize, 8)), track:ICE.topics[tk.topic].track, sec:ICE.topics[tk.topic].sec,
             topic:tk.topic, mode:'trick', title:tk.name, back:'trick', backParam:id});
}

/* ============================================================
   A FULL PAPER
   ============================================================ */
function mock(){
  var t=track();
  var o=head('practice',PRAC(), L('Eleven papers','এগারোটি পত্র'), L('Full paper','পূর্ণ পত্র'),
    L('The real mix, the real length, the real clock, and nothing shown until the end. It is the only thing here that measures exactly what the paper measures.',
      'আসল মিশ্রণ, আসল দৈর্ঘ্য, আসল ঘড়ি, আর শেষ হওয়ার আগে কিছুই দেখানো হয় না। প্রশ্নপত্র যা মাপে, এই অ্যাপে কেবল এটিই তা মাপে।'));
  o+='<div class="grid2">';
  ICE.sectionsOf(t).forEach(function(sec){
    var sk=t+'/'+sec.id, have=AB.inSection(sk).length;
    o+='<section class="card" style="display:flex;flex-direction:column;gap:10px"><div class="label">'+L(sec.n+' questions &middot; '+ICE.paperMinutes(sk)+' minutes',sec.n+'টি প্রশ্ন &middot; '+ICE.paperMinutes(sk)+' মিনিট')+'</div>'+
      '<h3 style="font-size:23px">'+h(ICE.sname(sec))+'</h3><p class="small">'+L(have+' in the bank'+(have<sec.n&&have?'; you get all '+have+' this time':'')+'.','ব্যাংকে '+have+'টি'+(have<sec.n?'; এবার '+have+'টিই পাবেন':'')+'।')+'</p>'+
      '<div><button class="btn" data-act="startMock" data-arg="'+h(sk)+'"'+(have<6?' disabled':'')+'>'+L('Sit ','দিন: ')+h(ICE.sname(sec))+'</button></div></section>';
  });
  o+='</div>';
  var runs=DB.state().runs.filter(function(r){ return r.mode==='mock'; }).slice(-8).reverse();
  if(runs.length){
    o+='<div><div class="seclabel">'+L('Papers you have sat','আপনার দেওয়া পত্র')+'</div><div class="scrollx"><table class="tbl"><tr><th>'+L('When','কখন')+'</th><th>'+L('Paper','পত্র')+'</th><th class="n">'+L('Marks','নম্বর')+'</th><th class="n">'+L('Median','মধ্যক')+'</th></tr>';
    runs.forEach(function(r){
      o+='<tr><td>'+h(U.ago(r.t))+'</td><td>'+h(ICE.sections[r.sec]?ICE.sname(r.sec):'&mdash;')+'</td><td class="n">'+r.right+' / '+r.n+'</td>'+
        '<td class="n">'+U.secs(r.med)+'</td></tr>';
    });
    o+='</table></div></div>';
  }
  return wrap(o);
}
function startMock(sk){
  var sec=ICE.sections[sk];
  RUN.start({track:sec.track, sec:sk, mode:'mock', exam:true, n:sec.n, title:ICE.sname(sec)+' &mdash; '+L('full paper','পূর্ণ পত্র'), back:'mock'});
}

/* ============================================================
   A PAPER
   ============================================================ */
function section(sk){
  var sec=ICE.sections[sk];
  if(!sec){ setTimeout(function(){ UI.go('practice'); }, 0); return ''; }
  var t=sec.track, ps=PLAN.section(sk), sc=AB.score({sec:sk}), st=DB.state().settings;
  var pace=AB.medianPace({sec:sk}, 60), target=ICE.pace(sk);
  var o=head('map',L('Map','ম্যাপ'), L('Rating ','রেটিং ')+GAME.rating(sk)+' &middot; '+h(GAME.rankOf(sc.score).name), h(ICE.sname(sec)),
    L('On the real paper: '+sec.n+' MCQ in '+ICE.paperMinutes(sk)+' minutes, '+U.secs(target)+' each. Every question here runs on that clock. Source book: '+h(sec.book)+'.',
      'আসল প্রশ্নপত্রে: '+ICE.paperMinutes(sk)+' মিনিটে '+sec.n+'টি বহুনির্বাচনি, প্রতিটিতে '+U.secs(target)+'। এখানের প্রতিটি প্রশ্নে সেই ঘড়িই চলে। উৎস বই: '+h(sec.book)+'।'));
  var hasQ=AB.inSection(sk).length>0;
  o+='<div class="btns"><button class="btn" data-act="secSet" data-arg="'+h(sk)+'"'+(hasQ?'':' disabled')+'>'+L('Practise this paper','এই পত্র অনুশীলন করুন')+'</button>'+
     '<button class="btn ghost" data-act="secWeak" data-arg="'+h(sk)+'"'+(hasQ?'':' disabled')+'>'+L('Weak chapters only','কেবল দুর্বল অধ্যায়')+'</button>'+
     '<button class="btn ghost" data-act="secSpeed" data-arg="'+h(sk)+'"'+(hasQ?'':' disabled')+'>'+L('Speed drill','গতির অনুশীলন')+'</button>'+
     '<button class="btn ghost" data-act="startMock" data-arg="'+h(sk)+'"'+(AB.inSection(sk).length>=6?'':' disabled')+'>'+L('Full paper','পূর্ণ পত্র')+'</button>'+
     (GAME.has('newgame') && ps.cleared>20 ? '<button class="btn ghost" data-act="mode" data-arg="admission|'+h(sk)+'">'+L('Board MCQ','বোর্ড এমসিকিউ')+'</button>' : '')+'</div>';
  o+='<div class="grid4 stagger">'+
    stat(L('Score','স্কোর'), '<span data-count="'+sc.score+'">'+sc.score+'</span>', sc.n?L(sc.n+' answers',sc.n+'টি উত্তর'):L('starting from zero','শূন্য থেকে শুরু'))+
    stat(L('Done','শেষ'), ps.cleared+' <small>/ '+ps.total+'</small>', U.pct(PLAN.pct(ps))+'%')+
    stat(L('Left','বাকি'), PLAN.daysText(ps.minutes), L('at '+U.mins(PLAN.dailyMin())+' a day','দিনে '+U.mins(PLAN.dailyMin())+' হিসাবে'))+
    stat(L('Median','মধ্যক'), pace?U.secs(pace):'&mdash;', L('allowed ','বাঁধা ')+U.secs(target))+'</div>';
  var rows=ICE.topicsOf(sk).map(function(tp){ return {tp:tp, sc:AB.score({topic:tp.id}).score, x:PLAN.topic(tp.id)}; });
  o+='<div><div class="seclabel">'+L('Chapters &middot; in the book\'s order','অধ্যায় &middot; বইয়ের ক্রম অনুযায়ী')+'</div><div class="links">';
  rows.forEach(function(r){
    o+='<a href="#/topic" data-go="topic" data-p="'+h(r.tp.id)+'"><span class="grow"><span class="lt">'+r.tp.n+'. '+h(ICE.tname(r.tp))+(r.x.est?' <i class="soon-tag">'+L('soon','শিগগির')+'</i>':'')+'</span>'+
      '<span class="ls">'+L(Math.round(r.tp.w*100)+'% of the paper','পত্রের '+Math.round(r.tp.w*100)+'%')+' &middot; '+(r.x.est?L('about '+r.x.total+' questions','প্রায় '+r.x.total+'টি প্রশ্ন'):L(r.x.cleared+' of '+r.x.total+' done',r.x.total+'-এ '+r.x.cleared+'টি শেষ'))+' &middot; '+PLAN.daysText(r.x.minutes)+L(' left',' বাকি')+'</span></span>'+
      '<span class="lv" style="width:62px">'+UI.starMarks(GAME.stars(r.tp.id).n)+'</span><span class="chev">&rsaquo;</span></a>';
  });
  o+='</div></div>';
  return wrap(o);
}

/* ============================================================
   A CHAPTER — Learn, then Drill
   ============================================================ */
var chTab={};
function trimLead(s){
  return String(s||'').replace(/^\s*(ঠিক|সঠিক|হ্যাঁ|right|correct|yes)[\s:,।.—–-]*/i,'').replace(/^(&mdash;|&ndash;)\s*/,'');
}
function starTrack(s){
  var pct = s.total ? 100*s.done/s.total : 0;
  var o='<div class="startrack" aria-hidden="true"><i style="width:'+Math.max(0.8,pct).toFixed(1)+'%"></i>';
  [1/3, 2/3, 1].forEach(function(f, i){
    o+='<span class="mk'+(s.n>i?' on':'')+'" style="left:'+(100*f).toFixed(2)+'%">&#9733;</span>';
  });
  return o+'</div>';
}
function topic(id){
  var tp=ICE.topics[id];
  if(!tp){ setTimeout(function(){ UI.go('map'); }, 0); return ''; }
  var x=PLAN.topic(id), s=GAME.stars(id), bank=AB.inTopic(id), st=DB.state().settings;
  var o=head('map',L('Map','ম্যাপ'), h(ICE.sname(tp.sec))+' &middot; '+L('Chapter ','অধ্যায় ')+tp.n, h(ICE.tname(tp)));
  if(!LBN() && tp.sec!=='hsc/english1') o+='<p class="ch-bn" lang="bn">'+h(tp.name)+'</p>';

  /* the strip every chapter opens with: stars, what is done, what is left */
  o+='<section class="card chsum" style="--sc:var(--s-'+(ICE.sections[tp.sec].subj||'ict')+')">'+
    '<div class="chsum-top"><div>'+UI.starMarks(s.n, true)+'<div class="small" style="margin-top:4px">'+L(s.n+' of 3 stars','৩-এ '+s.n+' তারা')+'</div></div>'+
    '<div class="chsum-facts">'+
      (x.est ? '<span><b>~'+x.total+'</b>'+L(' questions, being written','টি প্রশ্ন, লেখা হচ্ছে')+'</span>'
             : '<span><b>'+x.cleared+'</b> '+L('of '+x.total+' done','/ '+x.total+' শেষ')+'</span>')+
      '<span><b>'+PLAN.daysText(x.minutes)+'</b> '+L('left','বাকি')+'</span>'+
      (s.next!==null && !x.est ? '<span><b>'+s.next+'</b>'+L(' more for the next star','টি হলে পরের তারা')+'</span>' : '')+
    '</div></div>'+
    (x.est?'':starTrack(s))+
  '</section>';

  if(x.est || !bank.length){
    o+='<section class="card soon-card"><span class="kicker">'+L('Soon','শিগগির')+'</span><h3 style="font-size:21px">'+L('The questions for this chapter are being written','এই অধ্যায়ের প্রশ্ন লেখা হচ্ছে')+'</h3>'+
      '<p class="muted" style="font-size:16.5px">'+L('It will have about '+x.total+' questions, written from pages '+tp.p0+'&ndash;'+tp.p1+' of the '+h(tp.book)+' PDF. Its time is already counted in your days left, so the number you see is the honest one for the whole syllabus.',
        'প্রায় '+x.total+'টি প্রশ্ন থাকবে, '+h(tp.book)+' পিডিএফের '+tp.p0+'&ndash;'+tp.p1+' পৃষ্ঠা থেকে লেখা। এর সময় আগেই আপনার বাকি দিনে ধরা আছে, তাই যে সংখ্যাটি দেখছেন সেটিই পুরো সিলেবাসের সৎ হিসাব।')+'</p>'+
      '<div class="btns"><button class="btn" data-act="quickStart">'+L('Continue the plan instead','বরং পরিকল্পনা চালিয়ে যান')+'</button><button class="btn ghost" data-go="map">'+L('Back to the map','ম্যাপে ফিরুন')+'</button></div></section>';
    return wrap(o);
  }

  var lp=LEARN.progress(id);
  var tab=chTab[id] || ((lp.learnt<lp.groups && !x.cleared) ? 'learn' : 'drill');
  o+='<div class="chtabs" role="tablist">'+
    '<button type="button" role="tab" class="'+(tab==='learn'?'on':'')+'" data-act="chTab" data-arg="'+h(id)+'|learn"><i>1</i>'+L('Learn','শিখুন')+
      '<small>'+L(lp.learnt+' of '+lp.groups+' sections',lp.groups+'-এর '+lp.learnt+'টি অংশ')+'</small></button>'+
    '<button type="button" role="tab" class="'+(tab==='drill'?'on':'')+'" data-act="chTab" data-arg="'+h(id)+'|drill"><i>2</i>'+L('Drill','অনুশীলন')+
      '<small>'+L(x.cleared+' of '+x.total+' done',x.total+'-এর '+x.cleared+'টি শেষ')+'</small></button></div>';
  o+= tab==='learn' ? learnPanel(id, tp, lp) : drillPanel(id, tp, x, s, bank, st);
  return wrap(o);
}

/* ---------- Learn: the chapter's key points, sub-topic by sub-topic ---------- */
function learnPanel(id, tp, lp){
  var gs=LEARN.groups(id), openDone=false;
  var o='<section class="learnhead"><div class="spread"><span class="label">'+L('Revision sheet','রিভিশন শিট')+'</span>'+
    '<span class="small">'+L(lp.points+' key points &middot; about '+U.mins(lp.points*LEARN.PER_POINT)+' to read',lp.points+'টি মূল কথা &middot; পড়তে প্রায় '+U.mins(lp.points*LEARN.PER_POINT))+'</span></div>'+
    '<div class="bar thin" style="margin-top:8px"><i class="ok" style="width:'+Math.max(1,lp.groups?100*lp.learnt/lp.groups:0)+'%"></i></div>'+
    '<p class="small" style="margin-top:10px">'+L('Read a section, look at its worked example, and mark it <b>Got it</b>. Everything here comes from this chapter\'s own questions, in the book\'s page order. Then drill: the drill is the real test.',
      'একটি অংশ পড়ুন, তার উদাহরণটি দেখুন, তারপর <b>বুঝেছি</b> চাপুন। এখানের সবকিছু এই অধ্যায়ের নিজের প্রশ্ন থেকে, বইয়ের পৃষ্ঠার ক্রমে। তারপর অনুশীলন: আসল পরীক্ষা সেটিই।')+'</p></section>';
  o+='<div class="lgroups">';
  gs.forEach(function(g, i){
    var done=LEARN.isLearnt(id, g.key);
    var open=!done && !openDone; if(open) openDone=true;
    var title = g.cards ? L('Formula and memory cards','সূত্র ও মনে রাখার কার্ড') : h(g.title);
    o+='<details class="lgroup'+(done?' done':'')+'"'+(open?' open':'')+'>'+
      '<summary><span class="ln">'+(done?'&#10003;':(i+1))+'</span><span class="lt"'+(g.cards?'':' lang="bn"')+'>'+title+'</span>'+
      '<span class="lm">'+(g.page && g.page<9999?L('p.','পৃ.')+g.page+' &middot; ':'')+L(g.points.length+(g.points.length===1?' point':' points'),g.points.length+'টি কথা')+'</span></summary>'+
      '<div class="lbody"><ul class="lpoints" lang="bn">';
    g.points.forEach(function(p){ o+='<li>'+p.text+'</li>'; });
    o+='</ul>';
    var q=g.example;
    if(q){
      o+='<div class="lex"><div class="label">'+L('Worked example','উদাহরণ')+'</div><div class="lq" lang="bn">'+q.stem+'</div>';
      if(q.type==='mcomp' && q.sts){
        o+='<ol class="stlist mini" lang="bn">';
        q.sts.forEach(function(sx, k){ o+='<li><b>'+['i','ii','iii'][k]+'.</b><span>'+sx+'</span></li>'; });
        o+='</ol>';
      }
      o+='<div class="la" lang="bn"><b>'+L('Answer','উত্তর')+':</b> '+AB.answerText(q)+'</div>';
      var w=q.why && q.why[q.ans];
      if(w) o+='<div class="lw" lang="bn">'+trimLead(w)+'</div>';
      o+='</div>';
    }
    o+='<div class="btns" style="margin-top:12px">'+(done
        ? '<button class="btn sm ghost" data-act="learnMark" data-arg="'+h(id)+'|'+h(g.key)+'|0">'+L('Not yet &mdash; keep it open','এখনও নয় &mdash; খোলা থাকুক')+'</button>'
        : '<button class="btn sm" data-act="learnMark" data-arg="'+h(id)+'|'+h(g.key)+'|1">'+L('Got it','বুঝেছি')+' &#10003;</button>')+
      '</div></div></details>';
  });
  o+='</div>';
  var all=lp.learnt>=lp.groups;
  o+='<section class="card next-step'+(all?' ready':'')+'"><div><div class="kicker acc">'+(all?L('Sheet learnt','শিট শেখা শেষ'):L('When you are ready','প্রস্তুত হলে'))+'</div>'+
    '<div class="nt">'+(all?L('Now prove it. The drill decides what is really done.','এবার প্রমাণ করুন। কোনটি সত্যিই শেষ, তা ঠিক করে অনুশীলন।')
                          :L('You can drill at any time &mdash; trying first and checking after works too.','যেকোনো সময় অনুশীলন করতে পারেন &mdash; আগে চেষ্টা, পরে মিলিয়ে দেখাও কাজ করে।'))+'</div></div>'+
    '<button class="btn" data-act="chDrill" data-arg="'+h(id)+'">'+L('Drill this chapter','এই অধ্যায় অনুশীলন করুন')+' &rsaquo;</button></section>';
  return o;
}

/* ---------- Drill: sets from this chapter until every question is done ---------- */
function drillPanel(id, tp, x, s, bank, st){
  var n=Math.min(st.setSize, bank.length);
  var fresh=bank.filter(AB.untouched).length;
  var missed=GAME.mistakeBank(track()).filter(function(q){ return q.topic===id; }).length;
  var sc=AB.score({topic:id}), pace=AB.medianPace({topic:id}, 90), target=ICE.pace(tp.sec), tricks=AB.tricksFor(id), cred=MODES.credited(id);
  var o='<section class="card drillcard">'+
    '<div class="kicker acc">'+(x.cleared>=x.total?L('Every question done','প্রতিটি প্রশ্ন শেষ'):L('Until every question is done','প্রতিটি প্রশ্ন শেষ না হওয়া পর্যন্ত'))+'</div>'+
    '<h3 style="font-size:23px">'+(x.cleared>=x.total?L('Three stars. Keep it warm.','তিন তারা। এবার ধরে রাখুন।'):L('Drill this chapter','এই অধ্যায় অনুশীলন করুন'))+'</h3>'+
    '<p class="muted" style="font-size:16.5px">'+L('Sets of '+n+' from this chapter only. While any are unseen, at least '+AB.newShare(n)+' of them are new; the rest are questions you missed, back on a later day.',
      'কেবল এই অধ্যায় থেকে '+n+'টির সেট। না-দেখা প্রশ্ন থাকলে তার অন্তত '+AB.newShare(n)+'টি নতুন; বাকিগুলো ভুল করা প্রশ্ন, পরের কোনো দিনে ফিরে আসা।')+'</p>'+
    '<div class="drillstats">'+
      '<span><b>'+fresh+'</b>'+L(' never seen','টি দেখা হয়নি')+'</span>'+
      '<span><b>'+missed+'</b>'+L(' missed, waiting','টি ভুল, অপেক্ষায়')+'</span>'+
      '<span><b>'+sc.score+'</b>'+L(' score',' স্কোর')+'</span>'+
      '<span><b>'+(pace?U.secs(pace):'&mdash;')+'</b>'+L(' median (allowed ',' মধ্যক (বাঁধা ')+U.secs(target)+')</span>'+
    '</div>'+
    '<div class="btns"><button class="btn" data-act="topicSet" data-arg="'+h(id)+'">'+L('Drill '+n+' questions','অনুশীলন করুন &middot; '+n+'টি প্রশ্ন')+'</button>'+
      (missed?'<button class="btn ghost" data-act="chMistakes" data-arg="'+h(id)+'">'+L('Just my mistakes here ('+missed+')','কেবল এখানের ভুলগুলো ('+missed+')')+'</button>':'')+
      '<button class="btn ghost" data-act="chTab" data-arg="'+h(id)+'|learn">'+L('Back to the sheet','শিটে ফিরুন')+'</button></div>'+
  '</section>';

  o+='<section class="card"><div class="spread" style="align-items:center;flex-wrap:wrap;gap:10px"><div class="label">'+L('Stars in this chapter','এই অধ্যায়ের তারা')+'</div>'+
     '<a href="#" class="link quiet" data-act="mapRules">'+L('The star rules','তারার নিয়ম')+' &rsaquo;</a></div>'+
     '<div class="small" style="line-height:1.9;margin-top:8px">'+
       '<div class="'+(s.n>=1?'ok':'')+'">'+(s.n>=1?'&#9733;':'&#9734;')+' '+L('a third done &mdash; '+Math.ceil(s.total/3)+' questions','এক-তৃতীয়াংশ শেষ &mdash; '+Math.ceil(s.total/3)+'টি প্রশ্ন')+'</div>'+
       '<div class="'+(s.n>=2?'ok':'')+'">'+(s.n>=2?'&#9733;':'&#9734;')+' '+L('two thirds done &mdash; '+Math.ceil(2*s.total/3)+' questions','দুই-তৃতীয়াংশ শেষ &mdash; '+Math.ceil(2*s.total/3)+'টি প্রশ্ন')+'</div>'+
       '<div class="'+(s.n>=3?'ok':'')+'">'+(s.n>=3?'&#9733;':'&#9734;')+' '+L('every question done &mdash; '+s.total,'প্রতিটি প্রশ্ন শেষ &mdash; '+s.total+'টি')+'</div></div>'+
     (cred?'<p class="small" style="margin-top:12px">'+L('Passed the skip test, so this chapter is out of your days left.','বাদ দেওয়ার পরীক্ষায় পাস, তাই এটি বাকি দিনের হিসাবের বাইরে।')+' <a href="#" data-act="uncredit" data-arg="'+h(id)+'">'+L('Bring it back','আবার ফিরিয়ে আনুন')+'</a>.</p>'
          : bank.length>=5?'<p class="small" style="margin-top:12px">'+L('Know it already? ','এটি আগেই জানা? ')+'<a href="#" data-act="mode" data-arg="skiptest|'+h(id)+'">'+L('Take the skip test','বাদ দেওয়ার পরীক্ষা দিন')+'</a> &mdash; '+
            L('the five hardest; four right takes it out of the plan.','সবচেয়ে কঠিন পাঁচটি, চারটি ঠিক হলেই এটি পরিকল্পনা থেকে বাদ।')+'</p>':'')+
     '</section>';

  var extra=(tricks.length?'<button class="btn ghost sm" data-go="tricks" data-p="'+h(id)+'">'+L('Read '+tricks.length+' cards',tricks.length+'টি কার্ড পড়ুন')+'</button>':'')+
     (GAME.has('boss')?'<button class="btn ghost sm" data-act="mode" data-arg="boss|'+h(id)+'">'+L('Boss battle','বস লড়াই')+'</button>':'')+
     (GAME.has('ghost')?'<button class="btn ghost sm" data-act="mode" data-arg="ghost|'+h(id)+'">'+L('Ghost race','ঘোস্ট রেস')+'</button>':'');
  if(extra) o+='<div class="btns">'+extra+'</div>';

  var rows=DB.logFor(function(r){ return r.k===id; }, 12), tb='';
  rows.forEach(function(r){
    tb+='<tr><td>'+h(U.ago(r.t))+'</td><td class="'+(r.ok?'ok':'no')+'">'+(r.ok?L('right','ঠিক'):L('wrong','ভুল'))+'</td>'+
      '<td class="n"'+(r.sec>r.pace?' style="color:var(--no)"':'')+'>'+U.secs(r.sec)+'</td>'+
      '<td class="n">'+(r.b>=ICE.HARD_B?L('above board','বোর্ডের চেয়ে কঠিন'):r.b>=ICE.EXAM_B?L('board level','বোর্ড মান'):L('easy','সহজ'))+'</td></tr>';
  });
  if(tb) o+=how(L('Your last '+rows.length+' answers here','এখানে আপনার শেষ '+rows.length+'টি উত্তর'), '<div class="scrollx"><table class="tbl"><tr><th>'+L('When','কখন')+'</th><th>'+L('Result','ফল')+'</th><th class="n">'+L('Time','সময়')+'</th><th class="n">'+L('Level','মান')+'</th></tr>'+tb+'</table></div>');
  o+=how(L('How the score works','স্কোর কীভাবে কাজ করে'), L('<p>Right answers divided by (answers + '+AB.K.topic+'). Every chapter starts with '+AB.K.topic+' imaginary wrong answers on record, so five lucky right answers make '+Math.round(500/(5+AB.K.topic))+', not 100 &mdash; only volume lifts it. Right answers on easy questions count as 0.7. '+
    '<b>'+st.passLine+'</b> is a pass; <b>'+st.goalLine+'</b> is about 90% on board-level questions, with enough of them.</p>',
    '<p>ঠিক উত্তর ভাগ (উত্তর + '+AB.K.topic+')। প্রতিটি অধ্যায় শুরু হয় রেকর্ডে '+AB.K.topic+'টি কল্পিত ভুল নিয়ে, তাই ভাগ্যের জোরে পাঁচটি ঠিক মানে '+Math.round(500/(5+AB.K.topic))+', ১০০ নয় &mdash; কেবল সংখ্যাই এটিকে ওপরে তোলে। সহজ প্রশ্নে ঠিক উত্তর গোনা হয় ০.৭ হিসাবে। '+
    '<b>'+st.passLine+'</b> মানে পাস; <b>'+st.goalLine+'</b> মানে বোর্ড মানের প্রশ্নে প্রায় ৯০%, সাথে যথেষ্ট সংখ্যা।</p>')+
    '<div style="margin-top:10px">'+scoreBar(sc.score)+CH.scoreLegend()+'</div>');
  o+=how(L('Where these questions come from','এই প্রশ্নগুলো কোথা থেকে'), L('<p>Chapter '+tp.ch+' of '+h(tp.book)+', pages '+tp.p0+'&ndash;'+tp.p1+' of the PDF. Every question is tagged with the page its fact comes from.</p>',
    '<p>'+h(tp.book)+' বইয়ের '+tp.ch+' নম্বর অধ্যায়, পিডিএফের '+tp.p0+'&ndash;'+tp.p1+' পৃষ্ঠা। প্রতিটি প্রশ্নের ট্যাগে যে পৃষ্ঠা থেকে তথ্যটি নেওয়া হয়েছে তা লেখা থাকে।</p>'));
  return o;
}

/* ============================================================
   ACTIONS THESE PAGES ADD
   ============================================================ */
UI.act('claim', function(i){ QUEST.claim(+i); UI.render(); });
UI.act('claimWeek', function(){ QUEST.claimWeekly(); UI.render(); });
UI.act('season', function(i){ GAME.claimSeason(+i); UI.render(); });
UI.act('buy', function(id){ if(GAME.buy(id)) UI.render(); });
UI.act('wear', function(id){ GAME.wear(id); FX.play('coin'); UI.render(); });
UI.act('trickFilter', function(f){ trickFilter=f==='all'?null:f; UI.render(); });
UI.act('trickDrill', trickDrill);
UI.act('startMock', startMock);
UI.act('speed', function(){ UI.speedDrill(); });
UI.act('chTab', function(arg){ var p=String(arg).split('|'); chTab[p[0]]=p[1]; UI.render(); window.scrollTo({top:0, behavior:'smooth'}); });
UI.act('chDrill', function(id){ chTab[id]='drill'; UI.topicSet(id); });
UI.act('chMistakes', function(id){
  var qs=GAME.mistakeBank(track()).filter(function(q){ return q.topic===id; });
  if(!qs.length) return UI.toast(L('Nothing owed in this chapter.','এই অধ্যায়ে কিছু পাওনা নেই।'));
  var tp=ICE.topics[id];
  RUN.start({queue:qs.slice(0, DB.state().settings.setSize), track:tp.track, sec:tp.sec, topic:id, mode:'redo',
             title:ICE.tname(tp), back:'topic', backParam:id});
});
UI.act('learnMark', function(arg){
  var p=String(arg).split('|'), id=p[0], key=p[1], on=p[2]!=='0';
  LEARN.mark(id, key, on);
  PLAN.invalidate();
  if(on){ FX.play('star'); }
  UI.render();
});
UI.act('pickGo', function(mode){
  var sel=document.getElementById('pick-'+mode); if(!sel) return;
  if(mode==='admission') MODES.start('admission', {sec:sel.value});
  else MODES.start(mode, {topic:sel.value});
});
UI.act('cert', function(){ SHARE.certificate(track()); });
UI.act('report', function(){ SHARE.report(track()); });
UI.act('card', function(k){
  if(k==='streak') SHARE.save(SHARE.streakCard(),'drakkhak-streak.png');
  else if(k==='level') SHARE.save(SHARE.levelCard(),'drakkhak-level.png');
  else SHARE.save(SHARE.scoreCard(track()),'drakkhak-score.png');
});
UI.act('newDuel', function(){
  var code=MODES.makeDuel({track:track()});
  UI.toast('<b>'+code+'</b> &mdash; '+L('send the code, then answer the ten yourself.','কোডটি পাঠিয়ে দিন, তারপর নিজেও দশটির উত্তর দিন।'), 6000);
  MODES.startDuel(code);
});
UI.act('joinDuel', function(){
  var code=window.prompt(L('Enter the duel code','দ্বৈরথের কোড বসান'),''); if(code) MODES.startDuel(code);
});
UI.act('theirResult', function(i){
  var g=DB.game(), str=window.prompt(L('Enter their result code','ওদের ফলাফলের কোড বসান'),''); if(!str) return;
  var r=MODES.readResult(str);
  if(!r) return UI.toast(L('That result code does not look right.','ফলাফলের কোডটি ঠিক মনে হচ্ছে না।'));
  g.duels[+i].theirs={right:r.right, secs:r.secs}; DB.save();
  var who=MODES.duelWinner(g.duels[+i], g.duels[+i].theirs);
  if(who==='you'){ GAME.addCoins(40); FX.confetti(60); FX.play('levelup'); } else FX.play('next');
  UI.render();
});

return {plan:plan, predict:predict, wrapped:wrapped, record:record, badges:badges, collection:collection, shop:shop,
        social:social, modes:modes, quests:quests, tricks:tricks, trick:trick, mock:mock,
        section:section, topic:topic, doQotd:doQotd, saveNote:saveNote, trickDrill:trickDrill,
        startMock:startMock};
})();
