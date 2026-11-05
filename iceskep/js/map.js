/* ===========================================================
   MAP — the whole syllabus as one road, from the bottom up.

   Every chapter of every paper is a stop on a winding road that
   climbs the page: Bangla first at the bottom, Higher Math 2nd paper
   at the top. Each paper sits on its own island in its subject's
   colour and begins at a landmark (a book, an atom, a flask...).
   A road that has been walked glows in its subject's colour, all the
   way to the last finished chapter; a finished paper glows to the
   next landmark.

   A stop shows its stars (a third, two thirds, all of its questions
   done) and how many it has done. Tap a chapter and its set starts.

   The "3D" is plain CSS and SVG: raised islands with a visible edge,
   a shadow under the road, stops that press down when touched. No
   perspective transform is applied to the page, so text stays sharp
   and every tap lands where the eye expects.
   =========================================================== */
var MAP = (function(){

var STEP=118, GATE=196, PAD_TOP=150, PAD_BOT=120, AMP=27;

function h(s){ return U.h(s); }
function papers(){ return ICE.sectionsOf('hsc'); }
/* a small deterministic scatter, so the scenery never jumps between visits */
function rnd(seed){ var x=Math.sin(seed*9301+49297)*233280; return x-Math.floor(x); }

/* ---------- layout: every stop's place, bottom to top ---------- */
function layout(){
  var status={}, steps=PLAN.path();
  steps.forEach(function(s){ status[s.id]=s.status; });
  var items=[], y=PAD_BOT;
  papers().forEach(function(sec, pi){
    var sk='hsc/'+sec.id, tops=ICE.topicsOf(sk);
    var band={sec:sec, sk:sk, y0:y-40};
    items.push({kind:'gate', sec:sec, sk:sk, x:50, y:y+40, band:band, pi:pi});
    y+=GATE;
    tops.forEach(function(tp, j){
      var x=50+AMP*Math.sin(j*1.05+pi*0.9+0.6);
      items.push({kind:'ch', tp:tp, x:x, y:y, st:status[tp.id]||'open', j:j, pi:pi, sec:sec});
      y+=STEP;
    });
    band.y1=y-STEP+56;
    items.push({kind:'band', band:band, sec:sec, pi:pi});
  });
  return {items:items, H:y-STEP+PAD_TOP+PAD_BOT};
}

/* the road through the stops: Catmull-Rom, drawn as cubic Béziers */
function X(p){ return (p.x*10).toFixed(1); }
function segment(pts, i, H){
  var p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
  var c1x=p1.x*10+(p2.x-p0.x)*10/6, c1y=(H-p1.y)-((p2.y-p0.y)/6);
  var c2x=p2.x*10-(p3.x-p1.x)*10/6, c2y=(H-p2.y)+((p3.y-p1.y)/6);
  return ' C'+c1x.toFixed(1)+' '+c1y.toFixed(1)+' '+c2x.toFixed(1)+' '+c2y.toFixed(1)+' '+X(p2)+' '+(H-p2.y).toFixed(1);
}
function roadPath(pts, H, from, to){
  from=from||0; to=(to===undefined?pts.length-1:to);
  if(to<=from) return '';
  var d='M'+X(pts[from])+' '+(H-pts[from].y).toFixed(1);
  for(var i=from;i<to;i++) d+=segment(pts, i, H);
  return d;
}

/* ---------- the pieces ---------- */
function subjOf(sec){ return sec.subj || sec.id; }
function chapterNode(it, H){
  var tp=it.tp, x=PLAN.topic(tp.id), s=PLAN.stars(tp.id);
  var st = x.est ? 'soon' : (s.n===3 ? 'done' : it.st==='now' ? 'now' : 'open');
  var side = it.x>50 ? 'l' : 'r';
  var name = ICE.tname(tp);
  var prog = x.est ? L('soon','শিগগির') : N(x.cleared)+'/'+N(x.total);
  var title = name+' · '+(x.est ? L('questions coming soon','প্রশ্ন শিগগির আসছে') : L(x.cleared+' of '+x.total+' done', N(x.total)+'-এর '+N(x.cleared)+'টি শেষ'));
  return '<button type="button" class="mnode st-'+st+' side-'+side+'" style="left:'+it.x.toFixed(2)+'%;top:'+(H-it.y)+'px;--sc:var(--s-'+subjOf(it.sec)+')" '+
    'data-act="mapChapter" data-arg="'+h(tp.id)+'" title="'+h(title)+'" aria-label="'+h(title)+'">'+
    (st==='now'?'<span class="here">'+L('You are here','তুমি এখানে')+'</span>':'')+
    (x.est?'':CHARTS.stars(s.n))+
    '<span class="disc"><b>'+N(tp.n)+'</b></span>'+
    '<span class="mlabel"><span class="mt">'+h(name)+'</span><span class="mtime">'+prog+'</span></span>'+
  '</button>';
}

function landmark(sj){ return CHARTS.landmark(sj); }
function gateNode(it, H){
  var sec=it.sec, ps=PLAN.section(it.sk);
  return '<button type="button" class="mgate" id="gate-'+sec.id+'" style="left:50%;top:'+(H-it.y)+'px;--sc:var(--s-'+subjOf(sec)+')" '+
    'data-act="mapPaper" data-arg="'+h(it.sk)+'">'+
    '<span class="gpost"></span>'+
    '<span class="gflag">'+landmark(subjOf(sec))+
      '<span class="gn">'+h(ICE.sname(sec))+'</span>'+
      '<span class="gs">'+N(ps.cleared)+' / '+N(ps.total)+' &middot; '+N(Math.floor(PLAN.pct(ps)*100))+'%</span></span>'+
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

/* one short line for each thing on the road */
function legend(){
  return '<ul class="mlegend">'+
    '<li><span class="mini st-now"></span>'+L('You are here','তুমি এখানে')+'</li>'+
    '<li><span class="mini st-open"></span>'+L('Open to practise','অনুশীলনের জন্য খোলা')+'</li>'+
    '<li><span class="mini st-done"></span>'+L('Chapter finished','অধ্যায় শেষ')+'</li>'+
    '<li><span class="mini st-soon"></span>'+L('Questions coming soon','প্রশ্ন শিগগির আসছে')+'</li>'+
    '<li><span class="stars"><i class="on">&#9733;</i></span>'+L('A star for every third done','প্রতি তিন ভাগের এক ভাগে একটি তারা')+'</li>'+
  '</ul>';
}

/* ---------- the page ---------- */
function view(){
  var lay=layout(), H=lay.H, items=lay.items;
  var pts=items.filter(function(it){ return it.kind!=='band'; });
  var o='<div class="page mapwrap"><div class="phead"><h1>'+L('Map','ম্যাপ')+'</h1>'+
    '<div class="stars-total"><span>&#9733;</span> <b>'+N(PLAN.starTotal())+'</b></div></div>'+
    legend()+
    '<div class="mjump">'+ICE.subjects.map(function(sj){
        return '<button type="button" class="mchip" data-act="mapJump" data-arg="'+sj.id+'" style="--sc:var(--s-'+sj.id+')"><i></i>'+h(ICE.subjname(sj))+'</button>';
      }).join('')+
      '<button type="button" class="mchip here" data-act="mapJump" data-arg="now">'+L('Where I am','আমি কোথায়')+'</button></div>'+
    '<div class="scene" id="mapScene" style="height:'+H+'px">';
  items.forEach(function(it){ if(it.kind==='band') o+=bandEl(it, H); });

  /* the road, and the glow over the part of it that has been walked */
  var road=roadPath(pts, H), glow='', pi, idx=0;
  var starts={}, counts={};
  pts.forEach(function(it, k){
    if(it.kind==='gate'){ starts[it.pi]=k; counts[it.pi]={n:0, total:0, run:true}; }
    else { var c=counts[it.pi]; c.total++; if(c.run && PLAN.stars(it.tp.id).n===3) c.n++; else c.run=false; }
  });
  for(pi in starts){
    var c=counts[pi], a=starts[pi];
    if(!c.n) continue;
    var b=a+c.n;
    if(c.n===c.total && pts[b+1] && pts[b+1].kind==='gate') b++;       /* a finished paper glows on to the next landmark */
    var sec=papers()[+pi];
    var d=roadPath(pts, H, a, b);
    if(d) glow+='<g style="--sc:var(--s-'+subjOf(sec)+')"><path class="r-glow-w" d="'+d+'" vector-effect="non-scaling-stroke"/>'+
                '<path class="r-glow" d="'+d+'" vector-effect="non-scaling-stroke"/></g>';
  }
  o+='<svg class="road" viewBox="0 0 1000 '+H+'" preserveAspectRatio="none" aria-hidden="true">'+
       '<path class="r-shadow" d="'+road+'" vector-effect="non-scaling-stroke" transform="translate(0 9)"/>'+
       '<path class="r-edge" d="'+road+'" vector-effect="non-scaling-stroke"/>'+
       '<path class="r-top" d="'+road+'" vector-effect="non-scaling-stroke"/>'+
       '<path class="r-line" d="'+road+'" vector-effect="non-scaling-stroke"/>'+glow+
     '</svg>';
  o+='<div class="mend top" style="top:'+(PAD_TOP-110)+'px"><span>'+L('The exam hall','পরীক্ষার হল')+'</span></div>';
  o+='<div class="mend bottom" style="top:'+(H-PAD_BOT+40)+'px"><span>'+L('Start here','এখান থেকে শুরু')+'</span></div>';
  items.forEach(function(it){
    if(it.kind==='gate') o+=gateNode(it, H);
    else if(it.kind==='ch') o+=chapterNode(it, H);
  });
  return o+'</div></div>';
}

/* after the page is on screen: glide to where you are */
var lastParam=null;
function afterPaint(param, enter){
  if(!enter && param===lastParam) return;
  lastParam=param;
  setTimeout(function(){ jump(param||'now', true); }, 120);
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
  var calm=FX.calm();
  try{ window.scrollTo({top:Math.max(0,top), behavior:(smooth&&!calm)?'smooth':'auto'}); }catch(e){ window.scrollTo(0, Math.max(0,top)); }
  if(smooth) FX.pop(el, 'fx-pop');
}

UI.act('mapJump', function(w){ jump(w, true); });
/* a chapter starts its set; one that is not written yet says so */
UI.act('mapChapter', function(id){
  if(!AB.inTopic(id).length) return UI.toast(L('Questions for this chapter are coming soon.','এই অধ্যায়ের প্রশ্ন শিগগির আসছে।'));
  MODES.start('set', {scope:{kind:'chapter', sj:'', ch:id}, back:'map'});
});
UI.act('mapPaper', function(sk){
  if(!AB.inSection(sk).length) return UI.toast(L('Questions for this paper are coming soon.','এই পত্রের প্রশ্ন শিগগির আসছে।'));
  MODES.start('set', {scope:{kind:'paper', sec:sk}, back:'map'});
});

return {view:view, afterPaint:afterPaint, jump:jump};
})();
