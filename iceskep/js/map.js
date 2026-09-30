/* ===========================================================
   MAP — the whole syllabus as one road, from the bottom up.

   Every chapter of every paper is a stop on a winding road that
   climbs the page: Bangla first at the bottom, Higher Math 2nd paper
   at the top. Before each paper's chapters there is a milestone —
   the paper's name, its chapters, its stars, and the days left for
   all of its chapters together. Each chapter stop shows its three
   stars and the time it still needs; tapping it opens the chapter
   (Learn, then Drill).

   The "3D" is plain CSS and SVG: every paper sits on its own raised
   island with a visible edge, the road carries a shadow under it, and
   the stops are raised discs that press down when touched. No
   perspective transform is applied to the page itself, so text stays
   sharp and every tap lands where the eye expects.

   The star rules sit in a panel on the right that stays in view the
   whole time (on a phone, one tap away).
   =========================================================== */
var MAP = (function(){

var STEP=118, GATE=196, PAD_TOP=150, PAD_BOT=120, AMP=27;

function h(s){ return U.h(s); }

/* the order of the climb: the papers as the registry lists them */
function papers(){ return ICE.sectionsOf('hsc'); }

/* total stars earned so far, for the nav */
function starTotal(){
  var n=0;
  for(var id in ICE.topics) n+=GAME.stars(id).n;
  return n;
}
function starsAvailable(){
  var n=0;
  for(var id in ICE.topics){ var x=PLAN.topic(id); if(x && !x.est) n+=3; }
  return n;
}

/* a small deterministic scatter, so the scenery never jumps between visits */
function rnd(seed){ var x=Math.sin(seed*9301+49297)*233280; return x-Math.floor(x); }

/* ---------- layout: every stop's place, bottom to top ---------- */
function layout(){
  var status={}, steps=PLAN.path('hsc');
  steps.forEach(function(s){ status[s.id]=s.status; });
  var items=[], y=PAD_BOT, k=0;
  papers().forEach(function(sec, pi){
    var sk=sec.track+'/'+sec.id, tops=ICE.topicsOf(sk);
    var band={sec:sec, sk:sk, y0:y-40};
    items.push({kind:'gate', sec:sec, sk:sk, x:50, y:y+40, band:band, pi:pi});
    y+=GATE;
    tops.forEach(function(tp, j){
      var x=50+AMP*Math.sin(j*1.05+pi*0.9+0.6);
      items.push({kind:'ch', tp:tp, x:x, y:y, st:status[tp.id]||'later', j:j, pi:pi, sec:sec});
      y+=STEP;
      k++;
    });
    band.y1=y-STEP+56;
    items.push({kind:'band', band:band, sec:sec, pi:pi});
  });
  return {items:items, H:y-STEP+PAD_TOP+PAD_BOT};
}

/* a smooth road through the stops (Catmull-Rom, drawn as cubic Béziers) */
function roadPath(pts, H){
  if(pts.length<2) return '';
  function X(p){ return (p.x*10).toFixed(1); }
  function Y(p){ return (H-p.y).toFixed(1); }
  var d='M'+X(pts[0])+' '+Y(pts[0]);
  for(var i=0;i<pts.length-1;i++){
    var p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
    var c1x=p1.x*10+(p2.x-p0.x)*10/6, c1y=(H-p1.y)-((p2.y-p0.y)/6);
    var c2x=p2.x*10-(p3.x-p1.x)*10/6, c2y=(H-p2.y)+((p3.y-p1.y)/6);
    d+=' C'+c1x.toFixed(1)+' '+c1y.toFixed(1)+' '+c2x.toFixed(1)+' '+c2y.toFixed(1)+' '+X(p2)+' '+Y(p2);
  }
  return d;
}

/* ---------- the pieces ---------- */
function starRow(n, soon){
  var o='<span class="mstars'+(soon?' soon':'')+'" aria-label="'+h(L(n+' of 3 stars','৩-এ '+n+' তারা'))+'">';
  for(var i=0;i<3;i++) o+='<i class="'+(i<n?'on':'')+'" style="--i:'+i+'">&#9733;</i>';
  return o+'</span>';
}
function chapterNode(it, H){
  var tp=it.tp, x=PLAN.topic(tp.id), s=GAME.stars(tp.id);
  var st = x.est ? 'soon' : (s.n===3 ? 'done' : it.st==='now' ? 'now' : 'open');
  var side = it.x>50 ? 'l' : 'r';
  var time = x.est ? '~'+PLAN.daysText(x.minutes) : PLAN.daysText(x.minutes);
  var name = ICE.tname(tp);
  var title = name+' · '+(x.est?L('questions coming soon','প্রশ্ন শিগগির আসছে'):L(x.cleared+' of '+x.total+' questions done',x.total+'-এ '+x.cleared+'টি প্রশ্ন শেষ'))+' · '+time+L(' left',' বাকি');
  return '<button type="button" class="mnode st-'+st+' side-'+side+'" style="left:'+it.x.toFixed(2)+'%;top:'+(H-it.y)+'px;--sc:var(--s-'+subjOf(ICE.sections[tp.sec])+')" '+
    'data-go="topic" data-p="'+h(tp.id)+'" title="'+h(title)+'">'+
    (st==='now'?'<span class="here">'+L('You are here','আপনি এখানে')+'</span>':'')+
    starRow(s.n, x.est)+
    '<span class="disc"><b>'+tp.n+'</b></span>'+
    '<span class="mlabel"><span class="mt">'+h(name)+'</span>'+
      '<span class="mtime">'+(x.est?'<i class="soon-tag">'+L('soon','শিগগির')+'</i> ':'')+time+'</span></span>'+
  '</button>';
}
function subjOf(sec){ return sec.subj || sec.id; }
function gateNode(it, H){
  var sec=it.sec, ps=PLAN.section(it.sk), tops=ICE.topicsOf(it.sk);
  var got=0, avail=0, written=0;
  tops.forEach(function(tp){ var x=PLAN.topic(tp.id); got+=GAME.stars(tp.id).n; if(!x.est){ avail+=3; written++; } });
  return '<button type="button" class="mgate" id="gate-'+sec.id+'" data-subj="'+subjOf(sec)+'" style="left:50%;top:'+(H-it.y)+'px;--sc:var(--s-'+subjOf(sec)+')" '+
    'data-go="section" data-p="'+h(it.sk)+'">'+
    '<span class="gpost"></span>'+
    '<span class="gflag"><span class="gk">'+L('Paper','পত্র')+' '+(it.pi+1)+' &middot; '+tops.length+L(' chapters',' অধ্যায়')+'</span>'+
      '<span class="gn">'+h(ICE.sname(sec))+'</span>'+
      '<span class="gs"><b>'+PLAN.daysText(ps.minutes)+'</b>'+L(' left for all its chapters',' বাকি, সব অধ্যায় মিলিয়ে')+'</span>'+
      '<span class="gs2">&#9733; '+got+' / '+(avail||tops.length*3)+(written<tops.length?' &middot; '+L(written+' of '+tops.length+' written',tops.length+'-এর '+written+'টি লেখা হয়েছে'):'')+'</span></span>'+
  '</button>';
}
function bandEl(it, H){
  var b=it.band, top=H-b.y1, height=b.y1-b.y0;
  var o='<div class="mband" style="top:'+top+'px;height:'+height+'px;--sc:var(--s-'+subjOf(it.sec)+')" aria-hidden="true">';
  /* scenery on the edges of the island, away from the road */
  var n=Math.max(3, Math.round(height/260));
  for(var i=0;i<n;i++){
    var r1=rnd(it.pi*31+i*7), r2=rnd(it.pi*17+i*13+5), r3=rnd(it.pi*7+i*3+11);
    var left = r1<0.5 ? 2+r2*9 : 89+r2*8;
    var yy = 40+ (height-80)*((i+0.5)/n) + (r3-0.5)*60;
    var kind = r3<0.62 ? 'tree' : r3<0.85 ? 'rock' : 'flag';
    o+='<span class="decor d-'+kind+'" style="left:'+left.toFixed(1)+'%;top:'+yy.toFixed(0)+'px;--s:'+(0.8+r2*0.5).toFixed(2)+'">'+decorSvg(kind)+'</span>';
  }
  return o+'</div>';
}
function decorSvg(kind){
  if(kind==='tree') return '<svg viewBox="0 0 30 40"><ellipse cx="15" cy="37" rx="10" ry="2.6" class="shd"/><rect x="13" y="26" width="4" height="10" class="trunk"/>'+
    '<path d="M15 3 L26 20 H4 Z" class="leaf"/><path d="M15 10 L28 29 H2 Z" class="leaf2"/></svg>';
  if(kind==='rock') return '<svg viewBox="0 0 34 22"><ellipse cx="17" cy="19" rx="14" ry="2.6" class="shd"/><path d="M4 18 L9 7 L18 4 L28 9 L31 18 Z" class="rock"/><path d="M9 7 L18 4 L20 12 L10 14 Z" class="rockhi"/></svg>';
  return '<svg viewBox="0 0 24 40"><ellipse cx="6" cy="37" rx="6" ry="2" class="shd"/><rect x="5" y="4" width="2" height="33" class="trunk"/><path d="M7 5 L22 10 L7 15 Z" class="pennant"/></svg>';
}

/* ---------- the star rules: the same words wherever they appear ---------- */
function rules(){
  var dm=PLAN.dailyMin();
  return '<section class="card rules">'+
    '<div class="label">'+L('How stars are earned','তারা যেভাবে পাওয়া যায়')+'</div>'+
    '<ul class="rulelist">'+
      '<li>'+starRow(1)+'<span><b>'+L('One star','এক তারা')+'</b> &mdash; '+L('a third of the chapter\'s questions done.','অধ্যায়ের এক-তৃতীয়াংশ প্রশ্ন শেষ।')+'</span></li>'+
      '<li>'+starRow(2)+'<span><b>'+L('Two stars','দুই তারা')+'</b> &mdash; '+L('two thirds done.','দুই-তৃতীয়াংশ শেষ।')+'</span></li>'+
      '<li>'+starRow(3)+'<span><b>'+L('Three stars','তিন তারা')+'</b> &mdash; '+L('every question done.','প্রতিটি প্রশ্ন শেষ।')+'</span></li>'+
    '</ul>'+
    '<p class="small"><b>'+L('"Done"','"শেষ"')+'</b> '+L('means answered right inside the question\'s time (a quarter of slack is allowed). A question you once got wrong counts only when you get it right again on a later day &mdash; at least 16 hours after the miss. Right straight after seeing the answer is memory, not learning.',
      'মানে প্রশ্নের বাঁধা সময়ের ভিতরে ঠিক উত্তর (এক-চতুর্থাংশ বাড়তি সময় ধরা হয়)। যে প্রশ্ন একবার ভুল হয়েছে, সেটি গোনা হয় কেবল পরের কোনো দিনে আবার ঠিক করলে &mdash; ভুলের অন্তত ১৬ ঘণ্টা পরে। উত্তর দেখার সাথে সাথে পারা মানে স্মৃতি, শেখা নয়।')+'</p>'+
    '<p class="small">'+L('Nothing else moves a star: not speed, not lifelines, not coins. A star is earned by exactly the work that shortens your days left.',
      'আর কিছুতেই তারা নড়ে না: গতি, লাইফলাইন বা কয়েন নয়। তারা আসে ঠিক সেই কাজ থেকে, যা আপনার বাকি দিন কমায়।')+'</p>'+
    '<div class="label" style="margin-top:14px">'+L('The time under each chapter','প্রতিটি অধ্যায়ের নিচের সময়')+'</div>'+
    '<p class="small">'+L('Its unfinished questions at your own hit-rate, plus its unread Learn points, in days of '+U.mins(dm)+'. Chapters marked <i class="soon-tag">soon</i> are not written yet and are costed from their page count.',
      'অসমাপ্ত প্রশ্ন আপনার নিজের হিট-রেটে, সাথে না-পড়া শেখার পয়েন্ট, দিনে '+U.mins(dm)+' হিসাবে। <i class="soon-tag">শিগগির</i> চিহ্নিত অধ্যায় এখনও লেখা হয়নি; তার হিসাব পৃষ্ঠাসংখ্যা থেকে।')+'</p>'+
  '</section>';
}
function legend(){
  return '<section class="card mlegend"><div class="label">'+L('On the road','রাস্তায়')+'</div>'+
    '<div class="lg"><span class="mini st-now"><i></i></span>'+L('where you are now','আপনি এখন যেখানে')+'</div>'+
    '<div class="lg"><span class="mini st-open"><i></i></span>'+L('open to practise','অনুশীলনের জন্য খোলা')+'</div>'+
    '<div class="lg"><span class="mini st-done"><i></i></span>'+L('three stars','তিন তারা')+'</div>'+
    '<div class="lg"><span class="mini st-soon"><i></i></span>'+L('questions coming soon','প্রশ্ন শিগগির আসছে')+'</div>'+
    '<div class="lg"><span class="mini gate"><i></i></span>'+L('a paper begins: its days left for all chapters','একটি পত্র শুরু: সব অধ্যায় মিলিয়ে বাকি দিন')+'</div>'+
  '</section>';
}
function summary(){
  var px=PLAN.track('hsc'), got=starTotal(), av=starsAvailable();
  return '<section class="card msum">'+
    '<div class="spread"><span class="label">'+L('Stars','তারা')+'</span><b class="mono">'+got+' / '+av+'</b></div>'+
    '<div class="bar thin" style="margin:8px 0 12px"><i style="width:'+Math.max(1,av?100*got/av:0)+'%;background:var(--gold)"></i></div>'+
    '<div class="spread"><span class="label">'+L('Days left, all subjects','বাকি দিন, সব বিষয়')+'</span><b class="mono">'+PLAN.daysShort(px.minutes)+'</b></div>'+
    '<p class="small" style="margin-top:8px">'+L(av/3+' of '+Object.keys(ICE.topics).length+' chapters have questions today; each new one adds three stars to win.',
      'আজ '+Object.keys(ICE.topics).length+'টির মধ্যে '+(av/3)+'টি অধ্যায়ে প্রশ্ন আছে; প্রতিটি নতুন অধ্যায় জেতার মতো আরও তিনটি তারা আনে।')+'</p>'+
  '</section>';
}

/* ---------- the page ---------- */
function view(param){
  var lay=layout(), H=lay.H, items=lay.items;
  var road=roadPath(items.filter(function(it){ return it.kind!=='band'; }), H);
  var o='<div class="mapwrap">'+
    '<div class="mapmain">'+
      '<div class="phead"><span class="kicker">'+L('HSC &middot; Map','এইচএসসি &middot; ম্যাপ')+'</span><h1>'+L('The map','ম্যাপ')+'</h1>'+
      '<p class="lede">'+L('All '+Object.keys(ICE.topics).length+' chapters of the eleven papers, climbing from the first page at the bottom to the last at the top. Each stop shows its stars and the time it still needs. Tap one to learn it and drill it.',
        'এগারোটি পত্রের '+Object.keys(ICE.topics).length+'টি অধ্যায়, নিচে প্রথম পাতা থেকে ওপরে শেষ পাতা পর্যন্ত। প্রতিটি থামায় তার তারা আর বাকি সময়। ছুঁয়ে দেখুন, শিখুন, অনুশীলন করুন।')+'</p>'+
      '<div class="mjump">'+ICE.subjects.map(function(sj){
          return '<button type="button" class="mchip" data-act="mapJump" data-arg="'+sj.id+'" style="--sc:var(--s-'+sj.id+')"><i></i>'+h(ICE.subjname(sj))+'</button>';
        }).join('')+
        '<button type="button" class="mchip here" data-act="mapJump" data-arg="now">'+L('Where I am','আমি কোথায়')+'</button>'+
        '<button type="button" class="mchip rules-btn phone-only" data-act="mapRules">&#9733; '+L('Star rules','তারার নিয়ম')+'</button></div></div>'+
      '<div class="scene" id="mapScene" style="height:'+H+'px">';
  items.forEach(function(it){ if(it.kind==='band') o+=bandEl(it, H); });
  o+='<svg class="road" viewBox="0 0 1000 '+H+'" preserveAspectRatio="none" aria-hidden="true">'+
       '<path class="r-shadow" d="'+road+'" vector-effect="non-scaling-stroke" transform="translate(0 9)"/>'+
       '<path class="r-edge" d="'+road+'" vector-effect="non-scaling-stroke"/>'+
       '<path class="r-top" d="'+road+'" vector-effect="non-scaling-stroke"/>'+
       '<path class="r-line" d="'+road+'" vector-effect="non-scaling-stroke"/>'+
     '</svg>';
  o+='<div class="mend top" style="top:'+(PAD_TOP-110)+'px"><span>'+L('The exam hall','পরীক্ষার হল')+'</span></div>';
  o+='<div class="mend bottom" style="top:'+(H-PAD_BOT+40)+'px"><span>'+L('Start here','এখান থেকে শুরু')+'</span></div>';
  items.forEach(function(it){
    if(it.kind==='gate') o+=gateNode(it, H);
    else if(it.kind==='ch') o+=chapterNode(it, H);
  });
  o+='</div></div>'+
    '<aside class="maprules" id="mapRules">'+rules()+legend()+summary()+'</aside>'+
  '</div>';
  return o;
}

/* after the page is on screen: take the reader to where they are */
var lastParam=null;
function afterPaint(param, enter){
  if(!enter && param===lastParam) return;
  lastParam=param;
  setTimeout(function(){ jump(param||'now', false); }, 30);
}
function jump(where, smooth){
  var el=null;
  if(where==='now') el=document.querySelector('.mnode.st-now') || document.querySelector('.mnode.st-open') || document.querySelector('.mend.bottom');
  else {
    var sj=ICE.subject(where);
    if(sj){ var first=ICE.sections[sj.secs[0]]; el=document.getElementById('gate-'+first.id); }
  }
  if(!el) return;
  var r=el.getBoundingClientRect();
  var top=window.pageYOffset+r.top-window.innerHeight*0.5;
  try{ window.scrollTo({top:Math.max(0,top), behavior:smooth?'smooth':'auto'}); }catch(e){ window.scrollTo(0, Math.max(0,top)); }
  if(smooth) FX.pop(el, 'fx-pop');
}

UI.act('mapJump', function(w){ jump(w, true); });
UI.act('mapRules', function(){ UI.sheet('<div class="maprules in-sheet">'+rules()+legend()+'</div>'); });

return {view:view, afterPaint:afterPaint, starTotal:starTotal, starsAvailable:starsAvailable, rules:rules, jump:jump};
})();
