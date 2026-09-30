/* ===========================================================
   SHARE — the parts of this that leave the machine, and only
   because you asked them to.

   A picture you can save and send, a certificate and a report you
   can print, a note you wrote yourself, and a way to tell me a
   question is wrong. Nothing is uploaded, nothing is posted, and
   there is no feed for anyone to compare you against.
   =========================================================== */
var SHARE = (function(){

/* ---------- the card ---------- */
var PAL={
  day:  {bg:'#f4ecd8', ink:'#33291c', soft:'#7b6a52', rule:'#d9cbae', good:'#4a7c59'},
  night:{bg:'#1c1710', ink:'#efe3cc', soft:'#a2917a', rule:'#3a3024', good:'#7fae8a'}
};
function card(o){
  var W=1080, H=1080, c=document.createElement('canvas');
  c.width=W; c.height=H;
  var x=c.getContext('2d');
  var p=PAL[DB.state().theme==='night'?'night':'day'];

  x.fillStyle=p.bg; x.fillRect(0,0,W,H);
  /* a faint grain, the same idea as the paper the app is printed on */
  x.globalAlpha=0.05;
  for(var i=0;i<2600;i++){
    x.fillStyle=i%2?'#000':'#fff';
    x.fillRect(Math.random()*W, Math.random()*H, 1.6, 1.6);
  }
  x.globalAlpha=1;

  x.strokeStyle=p.rule; x.lineWidth=3;
  x.strokeRect(46,46,W-92,H-92);
  x.lineWidth=1; x.strokeRect(60,60,W-120,H-120);

  x.fillStyle=p.soft;
  x.font='500 30px Georgia, serif';
  x.fillText('DRAKKHAK', 96, 132);
  x.font='italic 26px Georgia, serif';
  x.fillText(o.kicker||'', 96, 176);

  x.fillStyle=p.ink;
  x.font='700 132px Georgia, serif';
  wrap(x, o.big||'', 96, 360, W-192, 132);

  x.fillStyle=p.soft;
  x.font='30px Georgia, serif';
  wrap(x, o.line||'', 96, 470, W-192, 44);

  var rows=o.rows||[], y=640;
  rows.forEach(function(r){
    x.fillStyle=p.rule; x.fillRect(96, y, W-192, 1);
    x.fillStyle=p.soft; x.font='28px Georgia, serif';
    x.fillText(r[0], 96, y+52);
    x.fillStyle=p.ink; x.font='600 34px Georgia, serif';
    x.textAlign='right'; x.fillText(String(r[1]), W-96, y+52);
    x.textAlign='left';
    y+=86;
  });

  x.fillStyle=p.soft; x.font='24px Georgia, serif';
  x.fillText(niceDate(new Date()), 96, H-110);
  x.textAlign='right';
  x.fillText(o.foot||'kept offline, on one machine', W-96, H-110);
  x.textAlign='left';
  return c;
}
function wrap(x, text, left, top, width, lh){
  var words=String(text).split(' '), line='', y=top, i;
  for(i=0;i<words.length;i++){
    var test=line?line+' '+words[i]:words[i];
    if(x.measureText(test).width>width && line){ x.fillText(line, left, y); line=words[i]; y+=lh; }
    else line=test;
  }
  if(line) x.fillText(line, left, y);
  return y;
}
function niceDate(d){
  var M=LBN() ? ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই',
         'আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
       : ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return d.getDate()+' '+M[d.getMonth()]+' '+d.getFullYear();
}

function save(canvas, name){
  try{
    var a=document.createElement('a');
    a.download=name||'drakkhak.png';
    a.href=canvas.toDataURL('image/png');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    UI.toast(L('Saved as an image. Whether you send it is up to you.','ছবি হিসেবে রাখা হলো। পাঠাবেন কি না, আপনার ইচ্ছা।'));
  }catch(e){ UI.toast(L('The image could not be made here.','এখানে ছবিটি বানানো গেল না।')); }
}

/* the four cards worth making */
function streakCard(){
  var s=QUEST.streak(), v=GAME.storedValue();
  return card({
    kicker:L('A streak','একটি ধারা'), big:s.live+L(' days',' দিন'),
    line:L(s.live+' days of study in a row. Best so far '+s.best+'.','পরপর '+s.live+' দিন পড়া হয়েছে। এ পর্যন্ত সেরা '+s.best+'।'),
    rows:[[L('Questions answered','উত্তর দেওয়া প্রশ্ন'), v.answered], [L('Real hours of study','সত্যিকারের পড়ার ঘণ্টা'), U.round(v.minutes/60,1)],
          [L('Level','লেভেল'), v.level]]
  });
}
function levelCard(){
  var LV=GAME.level(), v=GAME.storedValue();
  return card({
    kicker:L('A level','একটি লেভেল'), big:L('Level ','লেভেল ')+LV.level,
    line:GAME.dream()? L('On the way to '+GAME.dream().name+'.',GAME.dream().name+'-এর পথে।') : L('Earned one question at a time.','একটি একটি প্রশ্ন দিয়ে অর্জিত।'),
    rows:[[L('Right answers','ঠিক উত্তর'), v.correct], [L('Old mistakes fixed','শোধরানো পুরোনো ভুল'), v.fixed], [L('Badges','ব্যাজ'), v.badges]]
  });
}
function scoreCard(track){
  var sc=AB.score({track:'hsc'}), pr=PREDICT.hsc();
  return card({
    kicker:L('HSC MCQ','এইচএসসি বহুনির্বাচনি'), big:String(sc.score),
    line:L('Out of a hundred, on '+sc.n+' answers. The cautious prediction for the real exam is '+pr.marks+' / '+pr.outOf+'.',
           sc.n+'টি উত্তরের ওপর, একশোর মধ্যে। আসল পরীক্ষার জন্য সাবধানী পূর্বাভাস '+pr.marks+' / '+pr.outOf+'।'),
    rows:[[L('Answers counted','যত উত্তর গোনা হলো'), sc.n], [L('Pass line','পাস রেখা'), DB.state().settings.passLine],
          [L('Study left','পড়া বাকি'), PLAN.daysText(PLAN.track('hsc').minutes)]]
  });
}
function setCard(R){
  return card({
    kicker:R.title, big:R.right+' / '+R.marks.length,
    line: R.mode==='blitz' ? L('Sixty seconds.','ষাট সেকেন্ড।') :
          R.mode==='survival' ? L('Until three misses.','তিন ভুল পর্যন্ত।') :
          R.mode==='boss' ? L('A boss battle.','একটি বস লড়াই।') : L('A practice set.','একটি অনুশীলন সেট।'),
    rows:[[L('Median time','মধ্যক সময়'), U.secs(U.median(R.times)||0)],
          [L('Longest run of right answers','পরপর ঠিক উত্তরের ধারা'), String(R.bestCombo||0)],
          [L('Level','লেভেল'), GAME.level().level]]
  });
}

/* ---------- print: a certificate, and a report for someone else ---------- */
function printPage(title, html){
  var w=window.open('', '_blank', 'width=900,height=1200');
  if(!w){ UI.toast(L('Your browser blocked the print window.','আপনার ব্রাউজার প্রিন্ট উইন্ডোটি আটকে দিয়েছে।')); return; }
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+U.h(title)+'</title>'+
    '<style>'+PRINT_CSS+'</style></head><body>'+html+
    '<script>window.onload=function(){setTimeout(function(){window.print();},300);};<\/script>'+
    '</body></html>');
  w.document.close();
}
var PRINT_CSS=
 'body{font:16px/1.6 Georgia,serif;color:#2a2118;background:#fff;margin:0;padding:46px 54px;}'+
 'h1{font-size:34px;margin:0 0 6px;letter-spacing:-.4px}'+
 'h2{font-size:19px;margin:28px 0 10px;border-bottom:1px solid #ddd2ba;padding-bottom:6px}'+
 '.kick{letter-spacing:.22em;text-transform:uppercase;font-size:11px;color:#7b6a52;margin:0 0 20px}'+
 '.frame{border:3px double #b9a882;padding:40px 44px;min-height:840px;position:relative}'+
 'table{width:100%;border-collapse:collapse;margin:8px 0 4px}'+
 'td,th{text-align:left;padding:7px 4px;border-bottom:1px solid #e7dfcc;font-size:15px}'+
 'th{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7b6a52;font-weight:600}'+
 'td.n{text-align:right;font-variant-numeric:tabular-nums}'+
 '.big{font-size:52px;margin:18px 0 4px}'+
 '.muted{color:#6d5f4b}.tiny{font-size:12.5px;color:#7b6a52}'+
 '.sig{margin-top:60px;display:flex;justify-content:space-between;gap:40px}'+
 '.sig div{flex:1;border-top:1px solid #b9a882;padding-top:8px;font-size:12.5px;color:#7b6a52}'+
 '.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin:12px 0}'+
 '.box{border:1px solid #e0d6bf;padding:12px 14px}'+
 '.box b{display:block;font-size:26px;margin-bottom:2px}'+
 '.box span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7b6a52}'+
 '@media print{body{padding:0}.frame{border-color:#000}}';

function certificate(track){
  var v=GAME.storedValue(), sc=AB.score({track:track}), r=GAME.rankOf(sc.score);
  var first=DB.state().firstOpen||DB.today();
  var name=DB.state().name||'';
  printPage(L('Drakkhak certificate','দ্রাক্ষাক সনদ'),
    '<div class="frame"><p class="kick">Drakkhak &middot; '+L('Certificate of practice','অনুশীলনের সনদ')+'</p>'+
    '<h1>'+(name?U.h(name):L('This student','এই শিক্ষার্থী'))+'</h1>'+
    '<p class="muted">'+L('practised HSC MCQ from '+niceDate(new Date(first+'T00:00:00'))+' to '+niceDate(new Date())+'.',
      niceDate(new Date(first+'T00:00:00'))+' থেকে '+niceDate(new Date())+' পর্যন্ত এইচএসসির বহুনির্বাচনি অনুশীলন করেছে।')+'</p>'+
    '<div class="grid">'+
      box(v.answered, L('questions answered','প্রশ্নের উত্তর'))+
      box(U.round(v.minutes/60,1), L('measured hours','মাপা পড়ার ঘণ্টা'))+
      box(sc.score, L('score out of 100','একশোর মধ্যে স্কোর'))+
      box(r.name, L('rank','অবস্থান'))+
      box(v.streak, L('day streak','দিনের ধারা'))+
      box(v.fixed, L('mistakes fixed','শোধরানো ভুল'))+
    '</div>'+
    '<h2>'+L('What this means','এর মানে কী')+'</h2>'+
    '<p>'+L('The score counts volume as well as accuracy: it is right answers divided by (attempts + a constant), so a few lucky answers cannot make a big number. Hours are measured only while the app was in front of the student and in use &mdash; never while it sat open.',
      'স্কোর শুদ্ধতার সাথে সংখ্যাকেও গোনে: এটি ঠিক উত্তর ভাগ (চেষ্টা + একটি ধ্রুবক), তাই ভাগ্যের জোরে কয়েকটি ঠিক উত্তর দিয়ে বড় সংখ্যা বানানো যায় না। ঘণ্টা মাপা হয় কেবল তখনই, যখন অ্যাপটি শিক্ষার্থীর সামনে ছিল আর ব্যবহার হচ্ছিল &mdash; খুলে ফেলে রাখা অবস্থায় নয়।')+'</p>'+
    '<div class="sig"><div>'+L('Student','শিক্ষার্থী')+'</div><div>'+L('Teacher or parent','শিক্ষক বা অভিভাবক')+'</div><div>'+L('Date','তারিখ')+'</div></div>'+
    '<p class="tiny" style="position:absolute;bottom:18px;left:44px">'+L('Made with Drakkhak on this device. A certificate of practice, not of results.','এই যন্ত্রেই দ্রাক্ষাক দিয়ে তৈরি। এটি অনুশীলনের সনদ, ফলাফলের নয়।')+'</p></div>');
}
function box(v, k){ return '<div class="box"><b>'+U.h(String(v))+'</b><span>'+k+'</span></div>'; }

function report(track){
  var w=QUEST.wrapped(), v=GAME.storedValue();
  var days=DB.lastNDays(28), rows='', i;
  var sc=AB.score({track:'hsc'});
  var pr=PREDICT.hsc(), byKey={};
  pr.papers.forEach(function(x){ byKey[x.key]=x; });
  var secs=ICE.sectionsOf('hsc').map(function(s){
    var key=s.track+'/'+s.id, a=AB.score({sec:key}), p2=byKey[key];
    return '<tr><td>'+U.h(ICE.sname(s))+'</td><td class="n">'+a.n+'</td><td class="n">'+a.score+'</td>'+
           '<td class="n">'+GAME.rating(key)+'</td>'+
           '<td class="n">'+(p2 && p2.ready ? U.round(p2.marks,1)+' / '+p2.n : '&mdash;')+'</td></tr>';
  }).join('');
  for(i=0;i<days.length;i++){
    var d=days[i], t=DB.state().time[d.date], a=DB.actsOn(d.date);
    if(!a.q && !(t&&t.tot)) continue;
    rows+='<tr><td>'+d.date+'</td><td class="n">'+Math.round(t?t.tot:0)+'</td><td class="n">'+a.q+
          '</td><td class="n">'+(a.q?Math.round(100*a.right/a.q):0)+'%</td></tr>';
  }
  printPage(L('Drakkhak report','দ্রাক্ষাক রিপোর্ট'),
    '<p class="kick">Drakkhak &middot; '+L('Progress report','অগ্রগতির রিপোর্ট')+'</p>'+
    '<h1>'+L('HSC MCQ preparation','এইচএসসি বহুনির্বাচনি প্রস্তুতি')+'</h1>'+
    '<p class="muted">'+L('Four weeks to '+niceDate(new Date())+'. Every number here was measured by the app; none is the student\'s own claim.',
      niceDate(new Date())+' পর্যন্ত চার সপ্তাহ। এখানের প্রতিটি সংখ্যা অ্যাপ নিজে মেপেছে; কোনোটিই শিক্ষার্থীর নিজের বলা নয়।')+'</p>'+
    '<div class="grid">'+
      box(v.answered,L('questions answered','প্রশ্নের উত্তর'))+
      box(U.round(v.minutes/60,1),L('measured hours','মাপা ঘণ্টা'))+
      box(sc.score,L('score /100','স্কোর /১০০'))+
      box(v.streak,L('day streak','দিনের ধারা'))+
      box(U.round(pr.marks,1)+' / '+pr.outOf,L('predicted marks','পূর্বাভাসিত নম্বর'))+
      box(PLAN.daysText(PLAN.track('hsc').minutes),L('study left','পড়া বাকি'))+
    '</div>'+
    '<h2>'+L('By paper','পত্র অনুযায়ী')+'</h2><table><tr><th>'+L('Paper','পত্র')+'</th><th>'+L('Answers','উত্তর')+'</th><th>'+L('Score','স্কোর')+'</th><th>'+L('Rating','রেটিং')+'</th><th>'+L('Prediction','পূর্বাভাস')+'</th></tr>'+
      secs+'</table>'+
    '<h2>'+L('This week','এই সপ্তাহ')+'</h2><p>'+L(w.q+' questions on '+w.days+' days, '+Math.round(w.acc*100)+'% right, '+Math.round(w.mins)+' minutes.',
      w.days+' দিনে '+w.q+'টি প্রশ্ন, '+Math.round(w.acc*100)+'% ঠিক, '+Math.round(w.mins)+' মিনিট।')+
      (w.worst? L(' The weakest chapter was '+U.h(ICE.tname(w.worst.id))+'.',' সবচেয়ে দুর্বল অধ্যায় ছিল '+U.h(ICE.tname(w.worst.id))+'।'):'')+
      '</p>'+
    '<h2>'+L('Day by day','দিন ধরে')+'</h2><table><tr><th>'+L('Date','তারিখ')+'</th><th>'+L('Minutes','মিনিট')+'</th><th>'+L('Questions','প্রশ্ন')+'</th><th>'+L('Right','ঠিক')+'</th></tr>'+
      (rows||'<tr><td colspan="4" class="muted">'+L('No work recorded yet.','এখনও কোনো কাজ জমা হয়নি।')+'</td></tr>')+'</table>'+
    '<p class="tiny">'+L('The prediction is cautious on purpose &mdash; it reports the low end of the range, so the real exam should land above it, not below. It covers the MCQ half only; the creative half is not measured by this app.',
      'পূর্বাভাস ইচ্ছে করেই সাবধানী &mdash; এটি পরিসরের নিচের দিকটি বলে, তাই আসল পরীক্ষা এর নিচে নয়, ওপরে আসা উচিত। এটি কেবল বহুনির্বাচনি অংশের হিসাব; সৃজনশীল অংশ এই অ্যাপ মাপে না।')+'</p>');
}

/* ---------- the error bounty ----------
   If a question is wrong, saying so is worth something. */
function flag(qid, why){
  var g=DB.game();
  if(g.reports.some(function(r){ return r.q===qid; })){
    UI.toast(L('You have already flagged this one.','এটি আপনি আগেই চিহ্নিত করেছেন।'));
    return false;
  }
  g.reports.unshift({q:qid, why:why||'', t:Date.now()});
  if(g.reports.length>200) g.reports=g.reports.slice(0,200);
  DB.save();
  GAME.addCoins(15);
  FX.play('coin');
  UI.toast(L('<b>Flagged</b> &middot; +15 coins. It is listed under Your record &rsaquo; Duels and cards.','<b>চিহ্নিত করা হলো</b> &middot; +১৫ কয়েন। এটি আপনার রেকর্ড &rsaquo; দ্বৈরথ ও কার্ড পাতায় আছে।'));
  return true;
}
function unflag(qid){
  var g=DB.game();
  g.reports=g.reports.filter(function(r){ return r.q!==qid; });
  DB.save();
}
function reportsText(){
  var g=DB.game();
  return g.reports.map(function(r){
    var q=AB.q(r.q);
    return '['+r.q+'] '+(q?strip(q.stem||''):L('(gone)','(নেই)'))+'\n  '+(r.why||L('no reason given','কারণ লেখা হয়নি'));
  }).join('\n\n');
}
function strip(s){ return String(s).replace(/<[^>]*>/g,'').slice(0,160); }

/* ---------- your own notes on a trick ---------- */
function note(id, text){
  var g=DB.game();
  if(text && text.trim()) g.notes[id]={t:text.trim().slice(0,600), at:Date.now()};
  else delete g.notes[id];
  DB.save();
}
function noteOf(id){ return DB.game().notes[id]; }

return {card:card, save:save, streakCard:streakCard, levelCard:levelCard,
        scoreCard:scoreCard, setCard:setCard,
        certificate:certificate, report:report, printPage:printPage,
        flag:flag, unflag:unflag, reportsText:reportsText,
        note:note, noteOf:noteOf, niceDate:niceDate};
})();
