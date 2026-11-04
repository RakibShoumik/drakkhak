/* ===========================================================
   STATS — the measured record.

   Every number on this page was taken while you worked. There is no
   field to type a figure into and no way to correct one, which is
   the only reason the page is worth opening.

   Three questions it answers: how long you actually sat down, where
   those minutes went, and whether the work is turning into accuracy
   and speed or only into hours.
   =========================================================== */
var STATS = (function(){

var range=30;
var scope='all';     /* 'all', or a section key like 'hsc/phy1' */

function setRange(r){ range=+r; UI.render(); }
function setScope(s){ scope=s; UI.render(); }
UI.act('statRange', setRange);
UI.act('statScope', setScope);

function h(s){ return U.h(s); }
function stat(l,v,s){ return UI.stat(l,v,s); }
function segBtns(act, cur, list){
  return '<span class="seg2">'+list.map(function(x){
    return '<button type="button" class="'+(String(cur)===String(x[0])?'on':'')+'" data-act="'+act+'" data-arg="'+x[0]+'">'+x[1]+'</button>';
  }).join('')+'</span>';
}

function view(){
  var s=DB.state(), days=DB.lastNDays(range), keys=days.map(function(d){ return d.date; });
  var total=U.sum(days.map(function(d){ return d.mins; })), target=CLOCK.autoTarget();
  var l7=U.sum(DB.lastNDays(7).map(function(d){ return d.mins; }));
  var p7=U.sum(DB.lastNDays(14).slice(0,7).map(function(d){ return d.mins; }));
  var delta = p7>0 ? Math.round(100*(l7-p7)/p7) : (l7>0?100:0);
  var studied=days.filter(function(d){ return DB.DAY_MET(d.date); }).length;
  var all=AB.score({track:'hsc'}), st=s.settings, px=PLAN.track('hsc');

  var o='<div class="phead"><a href="#/progress" class="back" data-go="progress">&lsaquo; '+L('Progress','অগ্রগতি')+'</a>'+
    '<span class="kicker">'+L('Counted while you worked','আপনি কাজ করার সময়েই গোনা')+'</span><h1>'+L('Statistics','পরিসংখ্যান')+'</h1>'+
    '<p class="lede">'+L('Real minutes &mdash; only while the page was in front of you and in use. Nothing here can be typed in.','সত্যিকারের মিনিট &mdash; কেবল তখনই, যখন পাতাটি আপনার সামনে ছিল আর আপনি সেটি ব্যবহার করছিলেন। এখানের কিছুই টাইপ করে বসানো যায় না।')+'</p></div>';

  o+='<div class="grid4 stagger">'+
    stat(L('Today','আজ'), U.mins(CLOCK.todayMins()), L('last 7 days ','শেষ ৭ দিনে ')+U.mins(l7)+' ('+(delta>=0?'+':'')+delta+'%)')+
    stat(L('Streak','ধারা'), DB.liveStreak()+' <small>'+L('days','দিন')+'</small>', L('best ','সর্বোচ্চ ')+s.best)+
    stat(L('Score','স্কোর'), '<span data-count="'+all.score+'">'+all.score+'</span>', L('pass ','পাস ')+st.passLine+' &middot; '+PLAN.daysText(px.minutes)+L(' left',' বাকি'))+
    stat(L('Done','শেষ'), U.num(px.cleared)+' <small>/ '+U.num(px.total)+'</small>', U.pct(PLAN.pct(px))+L('% of questions done','% প্রশ্ন শেষ'))+
    '</div>';

  /* time */
  o+='<section class="card"><div class="spread" style="align-items:center;flex-wrap:wrap;margin-bottom:6px"><h3 style="font-size:21px">'+L('Time at the desk','টেবিলে কাটানো সময়')+'</h3>'+
     segBtns('statRange', range, [[7,L('7 days','৭ দিন')],[30,L('30 days','৩০ দিন')],[90,L('90 days','৯০ দিন')]])+'</div>'+
     '<p class="small" style="margin-bottom:14px">'+L('You sat down on '+studied+' of the last '+days.length+' days, averaging '+U.mins(total/Math.max(1,studied))+' on those days &mdash; '+U.mins(total)+' in all. The dashed line is your usual day ('+U.mins(target)+').',
       'শেষ '+days.length+' দিনের মধ্যে '+studied+' দিন আপনি বসেছেন, আর সেই দিনগুলোতে গড়ে '+U.mins(total/Math.max(1,studied))+' &mdash; মোট '+U.mins(total)+'। ছেঁড়া রেখাটি আপনার চেনা দিন ('+U.mins(target)+')।')+'</p>'+
     bars(days, target)+
     '<div class="legend"><span><i style="background:var(--accent)"></i>'+L('your usual day or more','চেনা দিনের সমান বা বেশি')+'</span><span><i style="background:var(--ink-3)"></i>'+L('less','কম')+'</span></div></section>';

  /* the streak calendar */
  o+='<section class="card"><div class="spread" style="margin-bottom:12px"><h3 style="font-size:21px">'+L('Eighteen weeks','আঠারো সপ্তাহ')+'</h3>'+
     '<span class="small">'+L(s.freezes+' freezes left this month','এই মাসে '+s.freezes+'টি ফ্রিজ বাকি')+'</span></div>'+CH.calendar(18, target)+
     '<div class="legend"><span>'+L('oldest on the left, today on the right','বাঁয়ে সবচেয়ে পুরোনো, ডানে আজ')+'</span><span><i style="background:var(--warm)"></i>'+L('nothing','কিছু নয়')+'</span>'+
     '<span><i style="background:var(--accent)"></i>'+L('a full day','পূর্ণ একটি দিন')+'</span></div></section>';

  /* the two exams, section by section */
  o+='<section class="card"><h3 style="font-size:21px;margin-bottom:12px">'+L('Score by paper','পত্র অনুযায়ী স্কোর')+'</h3><div class="grid2">';
  ICE.sectionsOf('hsc').forEach(function(sec){
    var sk=sec.track+'/'+sec.id, sc=AB.score({sec:sk}), ps=PLAN.section(sk), m=DB.minsOnSection(sk, keys);
    o+='<div><div class="spread"><span class="ui" style="font-size:13.5px">'+h(ICE.sname(sec))+'</span>'+
       '<b class="mono" style="font-size:14px">'+sc.score+'</b></div>'+CH.scoreBar(sc.score)+
       '<div class="small" style="margin-top:6px">'+(sc.n?L(sc.right+' of '+sc.n+' right',sc.n+'-এ '+sc.right+'টি ঠিক'):L('no answers yet','এখনও কোনো উত্তর নেই'))+' &middot; '+L(ps.cleared+' of '+ps.total+' done',ps.total+'-এ '+ps.cleared+'টি শেষ')+' &middot; '+U.mins(m)+'</div></div>';
  });
  o+='</div><div style="margin-top:14px">'+CH.scoreLegend()+'</div></section>';

  o+=topicCard(keys);

  /* when */
  var peak=CLOCK.peakHour(90);
  o+='<section class="card"><h3 style="font-size:21px">'+L('When you really study','আপনি সত্যিই কখন পড়েন')+'</h3><p class="small" style="margin:6px 0 14px">'+
     (peak.h===null?L('Not enough recorded yet to say.','বলার মতো যথেষ্ট তথ্য এখনও জমা হয়নি।'):L('Your strongest time is <b>'+hourLabel(peak.h)+'</b>. Put the hard paper there.','আপনার সবচেয়ে জোরালো সময় <b>'+hourLabel(peak.h)+'</b>। কঠিন পত্রটি ওই সময়েই রাখুন।'))+'</p>'+
     CH.hours(CLOCK.hourAgg(90))+
     '<div class="spread" style="margin-top:6px"><span class="label">'+L('midnight','রাত ১২টা')+'</span><span class="label">'+L('6 am','ভোর ৬টা')+'</span><span class="label">'+L('noon','দুপুর')+'</span>'+
     '<span class="label">'+L('6 pm','সন্ধ্যা ৬টা')+'</span><span class="label">'+L('11 pm','রাত ১১টা')+'</span></div></section>';

  o+=trendCards();
  o+=insightCard();
  return '<div class="stack">'+o+'</div>';
}

/* daily bars, growing in */
function bars(days, target){
  var W=720, H=150, pad={l:4,r:4,t:10,b:20}, n=days.length||1;
  var gap=n>60?1:n>30?2:3, bw=Math.max(1,(W-pad.l-pad.r-gap*(n-1))/n);
  var max=Math.max(target||1,1), i;
  for(i=0;i<n;i++) max=Math.max(max, days[i].mins);
  max*=1.12;
  var y=function(v){ return pad.t+(H-pad.t-pad.b)*(1-v/max); };
  var o='<svg class="chart" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="'+L('minutes per day','দৈনিক মিনিট')+'">'+
    '<line class="axis" x1="'+pad.l+'" y1="'+(H-pad.b)+'" x2="'+(W-pad.r)+'" y2="'+(H-pad.b)+'"/>';
  if(target) o+='<line x1="'+pad.l+'" y1="'+y(target)+'" x2="'+(W-pad.r)+'" y2="'+y(target)+'" stroke="var(--ink-3)" stroke-dasharray="4 4"/>';
  for(i=0;i<n;i++){
    var d=days[i], x=pad.l+i*(bw+gap), hh=Math.max(d.mins>0?2:0,(H-pad.t-pad.b)*d.mins/max);
    var fill=d.mins<=0?'var(--warm)':d.mins>=target?'var(--accent)':'var(--ink-3)';
    o+='<rect class="b" style="--i:'+i+'" x="'+x.toFixed(1)+'" y="'+(H-pad.b-Math.max(hh,1)).toFixed(1)+'" width="'+bw.toFixed(1)+
       '" height="'+Math.max(hh,1).toFixed(1)+'" rx="1.5" fill="'+fill+'"><title>'+h(d.date)+' &mdash; '+U.mins(d.mins)+'</title></rect>';
  }
  o+='<text x="'+pad.l+'" y="'+(H-5)+'">'+h(days[0]?days[0].date.slice(5):'')+'</text><text x="'+(W-pad.r)+'" y="'+(H-5)+'" text-anchor="end">'+L('today','আজ')+'</text>';
  return o+'</svg>';
}

/* the per-topic ledger */
function topicCard(keys){
  var papers=[['all',L('All papers','সব পত্র')]].concat(ICE.sectionsOf('hsc').map(function(sec){ return ['hsc/'+sec.id, ICE.sname(sec)]; }));
  var o='<section class="card"><div class="spread" style="align-items:center;flex-wrap:wrap;margin-bottom:6px"><h3 style="font-size:21px">'+L('Every chapter','প্রতিটি অধ্যায়')+'</h3>'+
    '<select class="field" data-change-scope>'+papers.map(function(p2){
      return '<option value="'+h(p2[0])+'"'+(scope===p2[0]?' selected':'')+'>'+h(p2[1])+'</option>'; }).join('')+'</select></div>'+
    '<p class="small" style="margin-bottom:10px">'+L('A chapter with many hours and a low score is the most valuable line here. Tap to open it.','যে অধ্যায়ে ঘণ্টা ঢেলেছেন অথচ স্কোর নিচু, সেটিই এখানের সবচেয়ে দামি লাইন। খুলতে চাপ দিন।')+'</p>';
  var dg=AB.digest(range), rows=[], any=false;
  for(var id in ICE.topics){
    var t=ICE.topics[id];
    if(scope!=='all' && t.sec!==scope) continue;
    var mins=DB.minsOnTopic(id, keys), acc=AB.digestAcc(dg.topic[id]), pace=AB.digestPace(dg.topic[id]), n=acc?acc.n:0;
    if(mins>0.4||n>0) any=true;
    rows.push({t:t, mins:mins, pace:pace, n:n, target:ICE.pace(t.sec), sc:AB.score({topic:id}).score, px:PLAN.topic(id)});
  }
  if(!any) return o+'<p class="empty">'+L('Nothing yet. Finish a set and this fills in.','এখনও কিছু নেই। একটি সেট শেষ করলেই এটি ভরে যাবে।')+'</p></section>';
  rows.sort(function(a,b){ return (b.mins-a.mins)||(b.n-a.n); });
  o+='<div class="scrollx"><table class="tbl"><tr><th>'+L('Chapter','অধ্যায়')+'</th><th class="n">'+L('Time','সময়')+'</th><th class="n">'+L('Answers','উত্তর')+'</th><th class="n">'+L('Done','শেষ')+'</th>'+
     '<th class="n">'+L('Median','মধ্যক')+'</th><th class="n">'+L('Score','স্কোর')+'</th><th style="width:100px"></th></tr>';
  rows.forEach(function(r){
    if(r.mins<0.4 && !r.n) return;
    var pc = (r.pace&&r.pace>r.target*1.2) ? ' style="color:var(--no)"' : (r.pace&&r.pace<=r.target) ? ' style="color:var(--ok)"' : '';
    o+='<tr class="click" data-go="topic" data-p="'+h(r.t.id)+'"><td>'+r.t.n+'. '+h(ICE.tname(r.t))+'<div class="small">'+h(ICE.sname(r.t.sec))+'</div></td>'+
      '<td class="n">'+U.mins(r.mins)+'</td><td class="n">'+(r.n||'&mdash;')+'</td><td class="n">'+r.px.cleared+'/'+r.px.total+'</td>'+
      '<td class="n"'+pc+'>'+(r.pace?U.secs(r.pace):'&mdash;')+'</td><td class="n">'+r.sc+'</td><td style="padding-top:17px">'+CH.scoreBar(r.sc, true)+'</td></tr>';
  });
  return o+'</table></div></section>';
}
function hourLabel(hh){
  if(!LBN()) return hh===0?'midnight':hh<12?hh+' am':hh===12?'noon':(hh-12)+' pm';
  if(hh===0) return 'রাত ১২টা';
  if(hh<6) return 'রাত '+hh+'টা';
  if(hh<12) return 'সকাল '+hh+'টা';
  if(hh===12) return 'দুপুর ১২টা';
  if(hh<16) return 'দুপুর '+(hh-12)+'টা';
  if(hh<19) return 'বিকাল '+(hh-12)+'টা';
  return 'রাত '+(hh-12)+'টা';
}

/* is it working */
function trendCards(){
  var days=DB.lastNDays(Math.max(21,range));
  var byDay={}, log=DB.state().log, cutoff=new Date(days[0].date+'T00:00:00').getTime();
  for(var j=log.length-1;j>=0;j--){
    var r=log[j];
    if(r.t<cutoff) break;
    if(scope!=='all' && r.s!==scope) continue;
    var k=DB.ymd(new Date(r.t)), b=byDay[k]||(byDay[k]={secs:[]});
    if(r.tm) b.secs.push(r.sec);
  }
  var pacePts=days.map(function(d){ var x=byDay[d.date]; return {label:d.date, v:x&&x.secs.length>=3?U.median(x.secs):null}; });
  var sPts=scorePts(days);
  var o='<div class="grid2">';
  o+='<section class="card"><h3 style="font-size:19px;margin-bottom:10px">'+L('Score, day by day','স্কোর, দিন ধরে')+'</h3>'+
     (sPts.filter(function(p){ return p.v>0; }).length>=2 ? UI.lineChart(sPts, {lo:0, hi:100, fmt:function(v){ return Math.round(v); }, start:days[0].date.slice(5), end:L('today','আজ')})
       : '<p class="empty">'+L('The line is drawn once there are answers on two days.','দুই দিনের উত্তর হলেই রেখাটি আঁকা হবে।')+'</p>')+
     '<p class="small" style="margin-top:8px">'+L('A running total from zero, weighted by volume.','শূন্য থেকে জমা হিসাব, সংখ্যাকে ধরে।')+'</p></section>';
  o+='<section class="card"><h3 style="font-size:19px;margin-bottom:10px">'+L('Seconds per question','প্রতি প্রশ্নে সেকেন্ড')+'</h3>'+
     (pacePts.filter(function(p){ return p.v!==null; }).length>=2 ? UI.lineChart(pacePts, {color:'var(--ok)', fmt:function(v){ return Math.round(v)+L(' s',' সে'); }, start:days[0].date.slice(5), end:L('today','আজ')})
       : '<p class="empty">'+L('The line is drawn once there are timed answers on two days.','দুই দিনের সময়-মাপা উত্তর হলেই রেখাটি আঁকা হবে।')+'</p>')+
     '<p class="small" style="margin-top:8px">'+L('Timed answers only. This falling while accuracy holds is lasting improvement.','কেবল সময়-মাপা উত্তর। শুদ্ধতা ধরে রেখে এটি নিচে নামা মানেই টেকসই উন্নতি।')+'</p></section>';
  return o+'</div>';
}
function scorePts(days){
  var log=DB.state().log.filter(function(r){ return scope==='all'||r.s===scope; });
  var Kx = scope==='all' ? AB.K.all : AB.K.sec;
  var i=0, n=0, cr=0, out=[];
  for(var d=0; d<days.length; d++){
    var end=new Date(days[d].date+'T00:00:00').getTime()+864e5;
    while(i<log.length && log[i].t<end){ n++; if(log[i].ok) cr += (log[i].b>=ICE.EXAM_B ? 1 : 0.7); i++; }
    out.push({label:days[d].date, v: n ? 100*cr/(n+Kx) : 0});
  }
  return out;
}

/* what the data says, in plain words */
function insightCard(){
  var out=[];
  var l7=U.sum(DB.lastNDays(7).map(function(d){ return d.mins; }));
  var p7=U.sum(DB.lastNDays(14).slice(0,7).map(function(d){ return d.mins; }));
  if(l7<30) out.push(L('Not even half an hour in seven days. Until that changes, nothing else on this page matters.','সাত দিনে আধ ঘণ্টাও নয়। এটি না বদলালে এই পাতার আর কিছুরই মানে নেই।'));
  else if(p7>0 && l7<p7*0.65) out.push(L('This week is well below last week. Streaks break slowly, then all at once.','গত সপ্তাহের চেয়ে এই সপ্তাহ অনেক নিচে। ধারা ভাঙে ধীরে, তারপর হঠাৎ একেবারে।'));
  else if(l7>p7*1.3 && p7>0) out.push(L('Well ahead of last week. Hold it &mdash; the risk now is a two-day gap.','গত সপ্তাহের চেয়ে অনেক এগিয়ে আছেন। এটি ধরে রাখুন &mdash; এখন ঝুঁকি হলো দুই দিনের ফাঁক।'));
  var worst=null, keys=DB.lastNDays(30).map(function(d){ return d.date; }), dg=AB.digest(30);
  for(var id in ICE.topics){
    var mins=DB.minsOnTopic(id, keys), acc=AB.digestAcc(dg.topic[id]);
    if(mins<12||!acc||acc.n<8) continue;
    var cost=mins*(1-acc.p);
    if(!worst||cost>worst.cost) worst={id:id, cost:cost, mins:mins, acc:acc};
  }
  if(worst) out.push(L('<b>'+h(ICE.tname(worst.id))+'</b> took '+U.mins(worst.mins)+' this month and still stands at '+U.pct(worst.acc.p)+'%. Read its Learn sheet before drilling again &mdash; more of the same is not working.',
    '<b>'+h(ICE.tname(worst.id))+'</b>-এ এই মাসে '+U.mins(worst.mins)+' গেছে, তবু এটি '+U.pct(worst.acc.p)+
    '%-এ দাঁড়িয়ে। আবার অনুশীলনে নামার আগে এর শেখার পাতাটি পড়ুন &mdash; একই কাজ আরও বেশি করে কাজ দিচ্ছে না।'));
  var slow=null;
  for(var sk in ICE.sections){
    var p=AB.medianPace({sec:sk}, 30), allowed=ICE.pace(sk);
    if(!p) continue;
    var over=p/allowed;
    if(over>1.15 && (!slow||over>slow.over)) slow={sec:ICE.sections[sk], over:over, p:p, allowed:allowed};
  }
  if(slow) out.push(L('In <b>'+h(ICE.sname(slow.sec))+'</b> your median is '+Math.round(slow.p)+' seconds against '+Math.round(slow.allowed)+' allowed. At this pace about '+Math.round(slow.sec.n*(1-1/slow.over))+' questions would never be touched.',
    '<b>'+h(ICE.sname(slow.sec))+'</b>-এ আপনার মধ্যক '+Math.round(slow.p)+' সেকেন্ড, অথচ বাঁধা '+Math.round(slow.allowed)+
    ' সেকেন্ড। এই গতিতে প্রায় '+Math.round(slow.sec.n*(1-1/slow.over))+'টি প্রশ্ন ছোঁয়াই হবে না।'));
  var peak=CLOCK.peakHour(60);
  if(peak.h!==null && peak.mins>40) out.push(L('Most of your work happens around '+hourLabel(peak.h)+'. Sit the full paper then too.','আপনার বেশির ভাগ কাজ হয় '+hourLabel(peak.h)+'-র দিকে। পূর্ণ পত্রটিও ওই সময়েই দিন।'));
  var rows=DB.logFor(function(r){ return r.t>=Date.now()-30*864e5; });
  if(rows.length>=10){
    var u=rows.filter(function(r){ return !r.tm; }).length/rows.length;
    if(u>0.35) out.push(L(Math.round(u*100)+'% of recent answers were given with the timer off. The prediction charges for it, and so will the exam.','সাম্প্রতিক উত্তরের '+Math.round(u*100)+'% টাইমার বন্ধ রেখে দেওয়া। পূর্বাভাস এর দাম কাটে, পরীক্ষাও কাটবে।'));
  }
  if(!out.length) out.push(L('Not enough recorded yet to say anything new. Finish a few sets and come back.','নতুন কিছু বলার মতো যথেষ্ট তথ্য এখনও জমা হয়নি। কয়েকটি সেট শেষ করে আবার আসুন।'));
  return '<section class="card accent"><div class="label" style="color:var(--accent);margin-bottom:10px">'+L('What the record says','রেকর্ড যা বলছে')+'</div><ul class="insights">'+
    out.map(function(x){ return '<li>'+x+'</li>'; }).join('')+'</ul></section>';
}

return {view:view, setRange:setRange, setScope:setScope};
})();
