/* ===========================================================
   CHARTS — hand-rolled SVG. No library, no dependency, no network.
   Everything scales to its container and reads in both themes,
   because every colour comes from a CSS custom property.
   =========================================================== */
var CH = (function(){

function esc(s){ return U.h(s); }

/* ---------- daily bars, with a target line ---------- */
function bars(days, target, opts){
  opts=opts||{};
  var W=720, H=opts.h||150, pad={l:6,r:6,t:12,b:20};
  var n=days.length||1;
  var gap = n>60?1:n>30?2:3;
  var bw = Math.max(1,(W-pad.l-pad.r-gap*(n-1))/n);
  var max = Math.max(target||1, 1);
  for(var i=0;i<n;i++) max=Math.max(max, days[i].mins);
  max=max*1.12;
  var y=function(v){ return pad.t+(H-pad.t-pad.b)*(1-v/max); };

  var o='<svg class="chart" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img">';
  o+='<line class="axis" x1="'+pad.l+'" y1="'+(H-pad.b)+'" x2="'+(W-pad.r)+'" y2="'+(H-pad.b)+'"/>';
  if(target){
    o+='<line x1="'+pad.l+'" y1="'+y(target)+'" x2="'+(W-pad.r)+'" y2="'+y(target)+
       '" stroke="var(--ink-3)" stroke-width="1" stroke-dasharray="4 4"/>';
  }
  for(i=0;i<n;i++){
    var d=days[i], x=pad.l+i*(bw+gap);
    var hgt=Math.max(d.mins>0?1.5:0, (H-pad.t-pad.b)*d.mins/max);
    var fill = d.mins<=0 ? 'var(--warm)' : d.mins>=target ? 'var(--accent)' : 'var(--ink-3)';
    o+='<rect x="'+U.round(x,1)+'" y="'+U.round(H-pad.b-hgt,1)+'" width="'+U.round(bw,1)+
       '" height="'+U.round(Math.max(hgt,1),1)+'" fill="'+fill+'" rx="1"><title>'+
       esc(d.date)+' — '+U.mins(d.mins)+'</title></rect>';
  }
  o+='<text x="'+pad.l+'" y="'+(H-5)+'">'+esc(days[0]?days[0].date.slice(5):'')+'</text>';
  o+='<text x="'+(W-pad.r)+'" y="'+(H-5)+'" text-anchor="end">TODAY</text>';
  o+='</svg>';
  return o;
}

/* ---------- a line, for a trend ---------- */
function line(points, opts){
  opts=opts||{};
  var W=720, H=opts.h||140, pad={l:30,r:8,t:12,b:20};
  var vals=points.filter(function(p){ return p.v!==null&&p.v!==undefined; });
  if(vals.length<2) return '<div class="empty">Not enough days yet to draw a line.</div>';
  var lo = opts.lo!==undefined?opts.lo:Math.min.apply(null, vals.map(function(p){return p.v;}));
  var hi = opts.hi!==undefined?opts.hi:Math.max.apply(null, vals.map(function(p){return p.v;}));
  if(hi===lo){ hi=lo+1; lo=lo-1; }
  var padv=(hi-lo)*0.12; lo-=padv; hi+=padv;
  var x=function(i){ return pad.l+(W-pad.l-pad.r)*(i/Math.max(1,points.length-1)); };
  var y=function(v){ return pad.t+(H-pad.t-pad.b)*(1-(v-lo)/(hi-lo)); };

  var o='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img">';
  var g=[0,0.5,1], i;
  for(i=0;i<g.length;i++){
    var gv=lo+(hi-lo)*g[i];
    o+='<line class="grid" x1="'+pad.l+'" y1="'+y(gv)+'" x2="'+(W-pad.r)+'" y2="'+y(gv)+'"/>';
    o+='<text x="'+(pad.l-6)+'" y="'+(y(gv)+3)+'" text-anchor="end">'+
       esc(opts.fmt?opts.fmt(gv):U.round(gv,0))+'</text>';
  }
  if(opts.mark!==undefined){
    o+='<line x1="'+pad.l+'" y1="'+y(opts.mark)+'" x2="'+(W-pad.r)+'" y2="'+y(opts.mark)+
       '" stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>';
  }
  var d='', started=false;
  for(i=0;i<points.length;i++){
    if(points[i].v===null||points[i].v===undefined) continue;
    d += (started?' L ':'M ')+U.round(x(i),1)+' '+U.round(y(points[i].v),1);
    started=true;
  }
  o+='<path d="'+d+'" fill="none" stroke="'+(opts.color||'var(--accent)')+
     '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>';
  for(i=0;i<points.length;i++){
    if(points[i].v===null||points[i].v===undefined) continue;
    o+='<circle cx="'+U.round(x(i),1)+'" cy="'+U.round(y(points[i].v),1)+'" r="2.4" fill="'+
       (opts.color||'var(--accent)')+'"><title>'+esc(points[i].label||'')+' '+
       esc(U.round(points[i].v,1))+'</title></circle>';
  }
  o+='</svg>';
  return o;
}

/* ---------- horizontal bars, for "where the hours went" ---------- */
function hbars(rows, opts){
  opts=opts||{};
  if(!rows.length) return '<div class="empty">Nothing logged yet.</div>';
  var max=1, i;
  for(i=0;i<rows.length;i++) max=Math.max(max, rows[i].v);
  var o='<div>';
  for(i=0;i<rows.length;i++){
    var r=rows[i], w=100*r.v/max;
    o+='<div style="display:flex;align-items:center;gap:12px;padding:6px 0">'+
       '<span style="flex:0 0 '+(opts.labelW||150)+'px;font-family:var(--ui);font-size:13.5px;'+
       'overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+esc(r.k)+'">'+esc(r.k)+'</span>'+
       '<span style="flex:1;min-width:40px"><span class="bar" style="display:block"><i class="'+
       (r.cls||'acc')+'" style="width:'+U.round(w,1)+'%"></i></span></span>'+
       /* the label is escaped, the value is not: callers author it with
          entities and it never contains user input */
       '<span class="num" style="flex:0 0 '+(opts.valW||58)+'px;text-align:right;font-size:12px;'+
       'color:var(--ink-3)">'+(r.t!==undefined?r.t:r.v)+'</span></div>';
  }
  return o+'</div>';
}

/* ---------- a ring, for one proportion ---------- */
function ring(p, label, sub, size){
  size=size||104;
  var r=(size-12)/2, c=2*Math.PI*r, off=c*(1-U.clamp(p,0,1));
  return '<svg class="chart" viewBox="0 0 '+size+' '+size+'" style="width:'+size+'px;flex:none" role="img">'+
    '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="var(--warm)" stroke-width="6"/>'+
    '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="var(--accent)" stroke-width="6"'+
    ' stroke-linecap="round" stroke-dasharray="'+U.round(c,1)+'" stroke-dashoffset="'+U.round(off,1)+'"'+
    ' transform="rotate(-90 '+size/2+' '+size/2+')"/>'+
    '<text x="'+size/2+'" y="'+(size/2+2)+'" text-anchor="middle" style="font-size:19px;fill:var(--ink)">'+
      esc(label)+'</text>'+
    (sub?'<text x="'+size/2+'" y="'+(size/2+17)+'" text-anchor="middle" style="font-size:8.5px">'+
      esc(sub)+'</text>':'')+
    '</svg>';
}

/* ---------- the contribution calendar ---------- */
function calendar(weeks, target){
  weeks=weeks||18;
  var days=DB.lastNDays(weeks*7);
  /* pad so the grid starts on a Sunday */
  var lead=days[0].d.getDay();
  var o='<div class="cal">';
  for(var i=0;i<lead;i++) o+='<i style="visibility:hidden"></i>';
  var today=DB.today();
  for(i=0;i<days.length;i++){
    var d=days[i], lvl=0;
    if(d.mins>=target*1.35) lvl=4;
    else if(d.mins>=target) lvl=3;
    else if(d.mins>=target*0.5) lvl=2;
    else if(d.mins>=3) lvl=1;
    var frozen=DB.state().frozen[d.date];
    o+='<i class="'+(lvl?'l'+lvl:'')+(d.date===today?' today':'')+'" title="'+
       esc(d.date+' — '+U.mins(d.mins)+(frozen?' (streak freeze)':''))+'"></i>';
  }
  return o+'</div>';
}

/* ---------- hour-of-day heat ---------- */
function hours(agg){
  var max=1, i;
  for(i=0;i<24;i++) max=Math.max(max, agg[i]);
  var o='<div class="heat24">';
  for(i=0;i<24;i++){
    var p=agg[i]/max, lvl=p<=0?0:p<0.25?1:p<0.5?2:p<0.78?3:4;
    var lab=(i===0?'12 AM':i<12?i+' AM':i===12?'12 PM':(i-12)+' PM');
    o+='<i class="'+(lvl?'l'+lvl:'')+'" title="'+esc(lab+' — '+U.mins(agg[i]))+'"></i>';
  }
  return o+'</div>';
}

/* ---------- the last seven days, as dots ---------- */
function weekDots(){
  var days=DB.lastNDays(7), names=LBN()?['রঃ','সোঃ','মঃ','বুঃ','বৃঃ','শুঃ','শঃ']:['Su','Mo','Tu','We','Th','Fr','Sa'], today=DB.today();
  var o='<div class="weekdots">';
  for(var i=0;i<days.length;i++){
    var d=days[i], hit=DB.DAY_MET(d.date), fz=DB.state().frozen[d.date];
    o+='<div><i class="'+(hit?'hit':fz?'freeze':'')+(d.date===today?' today':'')+'" title="'+
       esc(d.date+' — '+U.mins(d.mins))+'"></i>'+names[d.d.getDay()]+'</div>';
  }
  return o+'</div>';
}

/* ---------- a tiny inline sparkline ---------- */
function spark(vals, w, h){
  w=w||70; h=h||18;
  if(!vals.length) return '';
  var lo=Math.min.apply(null,vals), hi=Math.max.apply(null,vals);
  if(hi===lo){ hi=lo+1; }
  var d='';
  for(var i=0;i<vals.length;i++){
    var x=w*i/Math.max(1,vals.length-1), y=h-1-(h-2)*(vals[i]-lo)/(hi-lo);
    d+=(i?' L ':'M ')+U.round(x,1)+' '+U.round(y,1);
  }
  return '<svg viewBox="0 0 '+w+' '+h+'" style="width:'+w+'px;height:'+h+'px;overflow:visible">'+
    '<path d="'+d+'" fill="none" stroke="var(--accent)" stroke-width="1.4" stroke-linejoin="round"/></svg>';
}

/* ---------- a mastery gauge with an honest error bar ---------- */
function gauge(m, target){
  if(m.unknown) return '<div class="gauge"><i style="left:0;width:0"></i></div>';
  var lo=U.clamp(m.lo,0,1)*100, hi=U.clamp(m.hi,0,1)*100, p=U.clamp(m.p,0,1)*100;
  return '<div class="gauge">'+
    '<i style="left:'+U.round(lo,1)+'%;width:'+U.round(Math.max(1,hi-lo),1)+'%"></i>'+
    '<b style="left:calc('+U.round(p,1)+'% - 1.5px)"></b>'+
    (target!==undefined?'<u style="left:calc('+U.round(target*100,1)+'% - 1.5px)"></u>':'')+
    '</div>';
}

/* ---------- a 0–100 score with the pass line and the goal line on it ---------- */
function scoreBar(score, mini){
  var st=DB.state().settings, pass=st.passLine||70, goal=st.goalLine||85;
  var v=U.clamp(score||0,0,100);
  var cls = v>=goal ? 'goal' : v>=pass ? 'pass' : '';
  return '<div class="sbar'+(mini?' mini':'')+'" title="Score '+v+' &middot; pass '+pass+' &middot; goal '+goal+'">'+
    '<i class="'+cls+'" style="width:'+v+'%"></i>'+
    '<u style="left:calc('+pass+'% - 1px)"></u><s style="left:calc('+goal+'% - 1px)"></s></div>';
}
function scoreLegend(){
  var st=DB.state().settings;
  return '<div class="sbarlbl"><span>0</span><span style="color:var(--accent)">'+L('pass ','পাস ')+(st.passLine||70)+
    '</span><span style="color:var(--ok)">'+L('goal ','লক্ষ্য ')+(st.goalLine||85)+'</span><span>100</span></div>';
}

return {scoreBar:scoreBar, scoreLegend:scoreLegend,
        bars:bars, line:line, hbars:hbars, ring:ring, calendar:calendar,
        hours:hours, weekDots:weekDots, spark:spark, gauge:gauge};
})();
