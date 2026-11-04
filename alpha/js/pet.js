/* ===========================================================
   PET — a pixel cat who lives on the site.

   One small cat that walks along the bottom of the window, jumps up
   to sit on the cards, rides them as you scroll, naps when you stop,
   and cheers when you get a question right. It is the same cat on
   both halves of the site: Learn and the community are one origin,
   so its name, coat and place are kept in one localStorage key.

   It never gets in the way:
     · it never stands on a button, a link or a field, and walks off
       if something it is sitting on turns into one;
     · while a question is on screen it goes to a corner and keeps
       still, and it never speaks during one;
     · nothing is ever lost: it never gets hungry, ill or sad for
       long, and needs nothing from you;
     · tap it to pet it, drag it to move it, right-click or hold it
       for its menu (name, coat, stay put, quiet, hide);
     · with reduced motion (the system setting, or Learn's effects
       switched off) it stays in one place.

   The sprites are drawn here, from a few simple shapes on a 28 x 22
   grid with an outline added round the edge, so it costs no images.
   No other file is needed: the community side loads this same file.
   =========================================================== */
(function(){
'use strict';
if(window.DKPET) return;

var KEY='drakkhak.pet.v1';
var GW=30, GH=27;                       /* the sprite grid: poses are drawn on 28 x 22, with room for the outline and three rows for a hat */
var S=(window.innerWidth||0)>=1200 ? 3 : 2;   /* screen pixels per grid pixel: bigger on a wide screen */

/* ---------- coats ---------- */
var COATS={
  ginger:{name:'Ginger',     b:'#E99A4F', s:'#C9733A', l:'#FCE6C9', k:'#C46A30', m:'#C46A30', o:'#3B2417', e:'#3E6B34', n:'#E58A8A', stripes:1},
  tabby: {name:'Grey tabby', b:'#A6AAAE', s:'#7D8287', l:'#EEEEEC', k:'#5E6368', m:'#5E6368', o:'#24272A', e:'#5B8A36', n:'#D98C8C', stripes:1},
  black: {name:'Black',      b:'#37343D', s:'#26242B', l:'#55505D', k:'#26242B', m:'#26242B', o:'#0F0E12', e:'#D9E45A', n:'#9A7078'},
  cream: {name:'Cream',      b:'#F2E4C8', s:'#D9C39C', l:'#FFF9EE', k:'#DFC9A1', m:'#DFC9A1', o:'#5B4834', e:'#4F7FA8', n:'#E9A0A0'},
  calico:{name:'Calico',     b:'#F7F2EA', s:'#DED5C6', l:'#FFFFFF', k:'#E08A3E', m:'#3A3438', o:'#2E2620', e:'#3F7A4A', n:'#E79A9A', patches:1}
};
var FIXED={p:'#EBA3A3', w:'#FFFFFF', c:'#D97757', g:'#F0BE3C',
           r:'#D9483B', q:'#A3302A', u:'#3E7FD6', y:'#F6CF4A', d:'#2A2A30', f:'#F28DB5', v:'#FFFFFF'};

/* ============================================================
   DRAWING: shapes on the grid, then an outline
   ============================================================ */
function inEll(px,py,a){ var dx=(px-a.cx)/a.rx, dy=(py-a.cy)/a.ry; return dx*dx+dy*dy<=1; }
function sign(ax,ay,bx,by,cx,cy){ return (ax-cx)*(by-cy)-(bx-cx)*(ay-cy); }
function inTri(px,py,t){
  var p=t.p, d1=sign(px,py,p[0][0],p[0][1],p[1][0],p[1][1]), d2=sign(px,py,p[1][0],p[1][1],p[2][0],p[2][1]), d3=sign(px,py,p[2][0],p[2][1],p[0][0],p[0][1]);
  var neg=d1<0||d2<0||d3<0, pos=d1>0||d2>0||d3>0;
  return !(neg&&pos);
}
function segDist(px,py,ax,ay,bx,by){
  var vx=bx-ax, vy=by-ay, wx=px-ax, wy=py-ay, L=vx*vx+vy*vy, t=L?Math.max(0,Math.min(1,(wx*vx+wy*vy)/L)):0;
  var dx=ax+vx*t-px, dy=ay+vy*t-py; return {d:Math.sqrt(dx*dx+dy*dy), t:t};
}
function inLine(px,py,a){ var r=segDist(px,py,a.a[0],a.a[1],a.b[0],a.b[1]); return r.d<=a.w/2; }
/* a quadratic curve as a tapering stroke */
function curvePts(a){
  if(a._pts) return a._pts;
  var out=[], n=14, i, t, p=a.p;
  for(i=0;i<=n;i++){
    t=i/n;
    out.push([(1-t)*(1-t)*p[0][0]+2*(1-t)*t*p[1][0]+t*t*p[2][0], (1-t)*(1-t)*p[0][1]+2*(1-t)*t*p[1][1]+t*t*p[2][1], t]);
  }
  a._pts=out; return out;
}
function inCurve(px,py,a){
  var pts=curvePts(a), i;
  for(i=0;i<pts.length-1;i++){
    var r=segDist(px,py,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]);
    var t=pts[i][2]+(pts[i+1][2]-pts[i][2])*r.t, w=a.w0+(a.w1-a.w0)*t;
    if(r.d<=w/2) return true;
  }
  return false;
}
function hit(px,py,a){
  if(a.t==='e') return inEll(px,py,a);
  if(a.t==='tri') return inTri(px,py,a);
  if(a.t==='ln') return inLine(px,py,a);
  if(a.t==='cv') return inCurve(px,py,a);
  if(a.t==='px') return Math.floor(px)===a.x && Math.floor(py)===a.y;
  if(a.t==='ring') return inEll(px,py,{cx:a.cx,cy:a.cy,rx:a.rx+0.9,ry:a.ry+0.9});
  if(a.t==='rect') return px>=a.x && px<a.x+a.w && py>=a.y && py<a.y+a.h;
  return false;
}
/* layers paint over each other; "clip" paints only on the coat already there,
   "on" lists the colours it may paint over */
function raster(shapes, coat){
  var g=[], x, y, i;
  for(y=0;y<GH;y++){ g.push([]); for(x=0;x<GW;x++) g[y].push(''); }
  for(i=0;i<shapes.length;i++){
    var a=shapes[i];
    if(a.t==='stripes' || a.t==='patch'){
      if(a.t==='stripes' && !coat.stripes) continue;
      if(a.t==='patch' && !coat.patches) continue;
    }
    for(y=0;y<GH;y++) for(x=0;x<GW;x++){
      var cur=g[y][x], px=x-0.5, py=y-3.5;
      if(a.t==='stripes'){
        if((cur==='b') && px>=a.x0 && px<=a.x1 && py>=a.y0 && py<=a.y1 && ((x-1+(a.off||0))%3===0)) g[y][x]='k';
        continue;
      }
      if(a.t==='patch'){
        if((cur==='b'||cur==='s') && inEll(px,py,a)) g[y][x]=a.c;
        continue;
      }
      if(!hit(px,py,a)) continue;
      if(a.clip && !cur) continue;
      if(a.on && a.on.indexOf(cur)<0) continue;
      g[y][x]=a.c;
    }
  }
  /* the outline: every empty pixel touching the cat */
  var out=[];
  for(y=0;y<GH;y++){ out.push(g[y].slice()); }
  for(y=0;y<GH;y++) for(x=0;x<GW;x++){
    if(g[y][x]) continue;
    var n=(y>0&&g[y-1][x]&&g[y-1][x]!=='o')||(y<GH-1&&g[y+1][x]&&g[y+1][x]!=='o')||(x>0&&g[y][x-1]&&g[y][x-1]!=='o')||(x<GW-1&&g[y][x+1]&&g[y][x+1]!=='o');
    if(n) out[y][x]='O';
  }
  return out;
}
function hex(c){ var n=parseInt(c.slice(1),16); return [n>>16&255, n>>8&255, n&255]; }
function toImage(grid, coat){
  var cv=document.createElement('canvas'); cv.width=GW; cv.height=GH;
  var cx=cv.getContext('2d'), im=cx.createImageData(GW,GH), d=im.data, x, y, k, c;
  for(y=0;y<GH;y++) for(x=0;x<GW;x++){
    k=grid[y][x]; if(!k) continue;
    c = k==='O' ? coat.o : (coat[k] || FIXED[k] || coat.b);
    var rgb=hex(c), at=(y*GW+x)*4;
    d[at]=rgb[0]; d[at+1]=rgb[1]; d[at+2]=rgb[2]; d[at+3]=255;
  }
  cx.putImageData(im,0,0);
  return cv;
}

/* ============================================================
   THE POSES (facing right; the ground is the bottom row)
   ============================================================ */
function E(cx,cy,rx,ry,c,o){ var a={t:'e',cx:cx,cy:cy,rx:rx,ry:ry,c:c}; if(o) for(var k in o) a[k]=o[k]; return a; }
function T(p,c,o){ var a={t:'tri',p:p,c:c}; if(o) for(var k in o) a[k]=o[k]; return a; }
function Ln(a,b,w,c,o){ var r={t:'ln',a:a,b:b,w:w,c:c}; if(o) for(var k in o) r[k]=o[k]; return r; }
function Cv(p,w0,w1,c){ return {t:'cv',p:p,w0:w0,w1:w1,c:c}; }
function P(x,y,c){ return {t:'px',x:x,y:y,c:c}; }

/* a head, placed by its centre: ears, muzzle, eye, nose, mouth */
function head(hx,hy,o){
  o=o||{};
  var s=[{t:'head', hx:hx, hy:hy}], ears=o.ears||'up';
  if(ears==='up'){
    s.push(T([[hx-3.3,hy-1.6],[hx-2.0,hy-5.9],[hx+0.1,hy-2.9]],'b'));
    s.push(T([[hx+0.1,hy-2.9],[hx+2.1,hy-6.0],[hx+3.1,hy-1.4]],'b'));
    s.push(T([[hx-2.6,hy-2.2],[hx-1.9,hy-4.6],[hx-0.8,hy-2.6]],'p'));
  } else {        /* flat, a little sorry */
    s.push(T([[hx-3.6,hy-1.0],[hx-4.6,hy-3.4],[hx-0.4,hy-2.6]],'b'));
    s.push(T([[hx+0.2,hy-3.0],[hx+3.6,hy-4.4],[hx+3.4,hy-1.4]],'b'));
  }
  s.push(E(hx,hy,4.4,3.7,'b'));
  s.push(E(hx+3.1,hy+1.4,1.75,1.3,'l'));          /* muzzle */
  s.push(E(hx-0.6,hy+2.2,1.9,1.0,'l',{on:['b']}));  /* cheek */
  var ex=Math.floor(hx+0.5), ey=Math.floor(hy-0.8), eye=o.eye||'open';
  if(eye==='open'){ s.push(P(ex,ey,'e')); s.push(P(ex+1,ey,'w')); s.push(P(ex,ey+1,'e')); s.push(P(ex+1,ey+1,'e')); }
  else if(eye==='wide'){ s.push(P(ex,ey-1,'e')); s.push(P(ex+1,ey-1,'w')); s.push(P(ex,ey,'e')); s.push(P(ex+1,ey,'e')); s.push(P(ex,ey+1,'e')); s.push(P(ex+1,ey+1,'e')); }
  else if(eye==='closed'){ s.push(P(ex,ey+1,'o')); s.push(P(ex+1,ey+1,'o')); }
  else if(eye==='happy'){ s.push(P(ex-1,ey+1,'o')); s.push(P(ex,ey,'o')); s.push(P(ex+1,ey,'o')); s.push(P(ex+2,ey+1,'o')); }
  else if(eye==='half'){ s.push(P(ex,ey+1,'e')); s.push(P(ex+1,ey+1,'e')); s.push(P(ex,ey,'o')); s.push(P(ex+1,ey,'o')); }
  s.push(P(Math.floor(hx+4.4),Math.floor(hy+0.6),'n'));   /* nose */
  if(o.mouth!=='none') s.push(P(Math.floor(hx+3.6),Math.floor(hy+2.2),o.mouth==='open'?'p':'o'));
  return s;
}

/* standing / walking, side on */
function walkPose(f){
  var ph=[[1.7,-1.7],[0.5,-0.5],[-1.7,1.7],[-0.5,0.5]][f%4], bob=(f%2)?-0.5:0;
  var sw=[0,0.8,0,-0.8][f%4];
  var s=[];
  s.push(Cv([[6.5,10.5+bob],[1.6,9.5+bob],[2.6+sw,3.2+bob]],2.6,1.7,'b'));      /* tail */
  s.push(Ln([7.6,13+bob],[7.6-ph[1],20.3],2.5,'s'));                             /* far back leg */
  s.push(Ln([18.2,13+bob],[18.2-ph[0],20.3],2.5,'s'));                           /* far front leg */
  s.push(E(13,12.6+bob,8.0,4.6,'s'));
  s.push(E(13,11.8+bob,7.8,4.0,'b'));
  s.push(E(13.5,15.2+bob,5.4,1.5,'l',{on:['b','s']}));
  s.push({t:'stripes',x0:7,x1:18,y0:7.5+bob,y1:12+bob,off:1});
  s.push({t:'patch',cx:9.5,cy:10.5+bob,rx:3.2,ry:2.4,c:'k'});
  s.push({t:'patch',cx:16.5,cy:10+bob,rx:2.4,ry:2,c:'m'});
  s.push(Ln([10,13.4+bob],[10+ph[1],20.3],2.6,'b'));                             /* near back leg */
  s.push(E(10+ph[1]+0.4,20.5,1.5,0.9,'l'));
  s.push(Ln([19.6,13.2+bob],[19.6+ph[0],20.3],2.6,'b'));                         /* near front leg */
  s.push(E(19.6+ph[0]+0.4,20.5,1.5,0.9,'l'));
  s.push(E(19.6,10.2+bob,3.4,3.6,'b'));
  s.push(E(21.1,12.2+bob,1.5,2.0,'l',{on:['b']}));
  s.push(Ln([19.1,7.4+bob],[20.6,10.9+bob],1.5,'c',{clip:1}));                    /* collar */
  s.push(P(21,11+Math.round(bob),'g'));
  return s.concat(head(22.4,7.3+bob,{}));
}
/* sitting, side on; eye, ears and the tail tip vary */
function sitPose(o){
  o=o||{};
  var tip=o.tail||0, hy=o.headDown?7.2:6.4, s=[];
  s.push(Cv([[8.5,20.4],[2.6,21],[2+tip,15.6]],2.3,1.6,'b'));                    /* tail along the ground */
  s.push(E(10.5,15.6,6.0,5.2,'s'));                                               /* haunch */
  s.push(E(10.6,15.0,5.8,4.8,'b'));
  s.push({t:'stripes',x0:6,x1:15,y0:10.5,y1:15.5,off:0});
  s.push({t:'patch',cx:8.5,cy:13.5,rx:3.4,ry:3,c:'k'});
  s.push(E(14.6,20.3,2.3,1.0,'l'));                                               /* back paw */
  s.push(Ln([15.4,14],[15.5,20.3],2.3,'s'));                                       /* far front leg */
  s.push(E(15.6,11.6,3.8,5.4,'b'));                                               /* chest */
  s.push(E(17.3,13.2,1.8,3.2,'l',{on:['b']}));
  s.push({t:'patch',cx:14.8,cy:9.5,rx:2.2,ry:2,c:'m'});
  if(o.paw){                                                                       /* grooming: the paw comes up */
    s.push(Ln([17,13],o.paw,2.4,'b'));
    s.push(E(o.paw[0]+0.3,o.paw[1]-0.2,1.4,1.1,'l'));
  } else {
    s.push(Ln([17.1,13.2],[17.3,20.3],2.4,'b'));
    s.push(E(17.8,20.5,1.5,0.9,'l'));
  }
  s.push(Ln([15.2,7.6],[17.2,10.6],1.5,'c',{clip:1}));
  s.push(P(17,10,'g'));
  s=s.concat(head(o.headDown?18.8:18.5,hy,{eye:o.eye, ears:o.ears, mouth:o.mouth}));
  if(o.paw && o.lick) s.push(P(Math.floor(o.paw[0])+1,Math.floor(o.paw[1]),'p'));
  return s;
}
/* asleep, curled up */
function sleepPose(f){
  var br=f%2?0.35:0, s=[];
  s.push(E(13,16.9,9.0,4.4+br,'s'));
  s.push(E(13,16.3,8.8,4.0+br,'b'));
  s.push({t:'stripes',x0:6,x1:18,y0:12,y1:15.5,off:2});
  s.push({t:'patch',cx:9,cy:14.5,rx:3.6,ry:2.4,c:'k'});
  s.push({t:'patch',cx:15,cy:13.8,rx:2.6,ry:1.8,c:'m'});
  s.push(Cv([[4.6,18.6],[5.2,21.6],[15.5,21.0]],2.4,1.8,'s'));                     /* tail round the front */
  var hx=21.0, hy=16.0;
  s.push({t:'head', hx:hx, hy:hy+0.4});
  s.push(T([[hx-3.2,hy-1.2],[hx-2.1,hy-6.0],[hx+0.2,hy-2.4]],'b'));
  s.push(T([[hx+0.2,hy-2.4],[hx+2.2,hy-5.8],[hx+3.2,hy-1.0]],'b'));
  s.push(T([[hx-2.5,hy-1.8],[hx-2.0,hy-4.6],[hx-0.8,hy-2.2]],'p'));
  s.push({t:'ring',cx:hx,cy:hy,rx:4.1,ry:3.3,c:'o'});
  s.push(E(hx,hy,4.1,3.3,'b'));
  s.push(E(hx+2.8,hy+1.2,1.5,1.1,'l'));
  s.push(P(Math.floor(hx)-1,Math.floor(hy),'o')); s.push(P(Math.floor(hx),Math.floor(hy)+1,'o')); s.push(P(Math.floor(hx)+1,Math.floor(hy),'o'));
  s.push(P(Math.floor(hx+3.9),Math.floor(hy+0.4),'n'));
  return s;
}
/* in the air */
function jumpPose(){
  var s=[];
  s.push(Cv([[6,11],[1.8,11.6],[0.8,8.2]],2.4,1.6,'b'));
  s.push(Ln([7,12.6],[2.4,15.6],2.4,'s'));
  s.push(Ln([18,12.4],[23,16.2],2.4,'s'));
  s.push(E(13,12.2,8.4,3.8,'s'));
  s.push(E(13,11.6,8.2,3.3,'b'));
  s.push(E(13.5,14.2,5.4,1.3,'l',{on:['b','s']}));
  s.push({t:'stripes',x0:7,x1:18,y0:8,y1:11.5,off:1});
  s.push({t:'patch',cx:9.5,cy:10.8,rx:3,ry:2.2,c:'k'});
  s.push(Ln([8.6,13.2],[3.6,16.8],2.5,'b'));
  s.push(Ln([19.2,12.8],[24.3,15.2],2.5,'b'));
  s.push(E(24.6,15.3,1.4,1.0,'l'));
  s.push(E(19.4,10,3.2,3.2,'b'));
  s.push(Ln([19.2,7.6],[20.4,10.6],1.5,'c',{clip:1}));
  return s.concat(head(22.6,7.6,{eye:'wide'}));
}
/* a long stretch after a nap */
function stretchPose(){
  var s=[];
  s.push(Cv([[5.4,9],[2.6,4.4],[5,1.2]],2.3,1.6,'b'));
  s.push(Ln([6.6,12],[6.6,20.3],2.4,'s'));
  s.push(E(9,11.2,5.2,4.0,'s'));
  s.push(E(9,10.8,5.0,3.6,'b'));
  s.push(E(15.4,14.4,5.4,3.0,'s'));
  s.push(E(15.4,14.0,5.2,2.7,'b'));
  s.push({t:'stripes',x0:5,x1:18,y0:8,y1:13,off:0});
  s.push({t:'patch',cx:9,cy:9.5,rx:3,ry:2.2,c:'k'});
  s.push(Ln([8.4,12.6],[8.4,20.3],2.5,'b'));
  s.push(E(8.8,20.5,1.5,0.9,'l'));
  s.push(Ln([17.5,16.2],[24.5,20.2],2.3,'s'));
  s.push(Ln([18.6,16.4],[25.6,20.4],2.4,'b'));
  s.push(E(25.8,20.5,1.5,0.9,'l'));
  return s.concat(head(21.4,15.4,{eye:'closed', mouth:'open'}));
}
/* held up by the scruff, legs dangling */
function heldPose(f){
  var sw=f%2?0.5:-0.5, s=[];
  s.push(Cv([[12,17],[10.6,20.2],[12.8+sw,21.3]],2.2,1.6,'b'));
  s.push(Ln([11.8,16.6],[11.2+sw,21],2.4,'s'));
  s.push(Ln([15.6,13.6],[16.4+sw,19.4],2.3,'s'));
  s.push(E(14,12.8,4.7,5.8,'s'));
  s.push(E(14.1,12.3,4.5,5.4,'b'));
  s.push(E(15.4,13.2,1.5,3.0,'l',{on:['b']}));
  s.push({t:'patch',cx:13,cy:11,rx:2.4,ry:2.4,c:'k'});
  s.push(Ln([14.2,16.8],[14.4+sw,21.2],2.5,'b'));
  s.push(E(14.6+sw,21.2,1.4,0.9,'l'));
  s.push(Ln([17.4,13.6],[18.2+sw,19.4],2.4,'b'));
  s.push(E(18.4+sw,19.6,1.3,0.9,'l'));
  return s.concat(head(15.6,5,{eye:'wide'}));
}

/* hats, drawn round the head's centre; bought in Learn's shop */
var HATS={
  none:    {name:'No hat', short:'None'},
  bow:     {name:'Ribbon bow', short:'Bow', draw:function(x,y){ return [T([[x+1.0,y-3.0],[x+2.6,y-4.4],[x+2.4,y-2.2]],'r'), T([[x+4.3,y-4.8],[x+2.6,y-3.5],[x+4.1,y-2.1]],'r'), P(Math.floor(x+2.6),Math.floor(y-3.3),'q')]; }},
  flower:  {name:'Shapla flower', short:'Flower', draw:function(x,y){ var cx=Math.floor(x+2.5), cy=Math.floor(y-3.6); return [P(cx,cy,'y'),P(cx-1,cy,'f'),P(cx+1,cy,'f'),P(cx,cy-1,'f'),P(cx,cy+1,'f')]; }},
  gamchha: {name:'Boishakh gamchha', short:'Gamchha', draw:function(x,y){ return [Ln([x-4.4,y-1.6],[x+3.4,y-2.8],1.5,'r',{clip:1}), Ln([x-4.2,y-1.8],[x-5.8,y-0.2],1.1,'r'), Ln([x-4.2,y-1.6],[x-5.4,y+0.6],1.0,'q'),
                                                      P(Math.floor(x-2),Math.floor(y-2.2),'v'), P(Math.floor(x),Math.floor(y-2.5),'v'), P(Math.floor(x+2),Math.floor(y-2.8),'v')]; }},
  party:   {name:'Party hat', short:'Party', draw:function(x,y){ return [T([[x-1.8,y-3.2],[x+0.3,y-8.8],[x+2.2,y-3.2]],'u'), Ln([x-1.1,y-4.9],[x+1.6,y-5.4],1.0,'y',{on:['u']}), Ln([x-0.4,y-6.8],[x+1.0,y-7.0],0.9,'y',{on:['u']}), E(x+0.3,y-9.1,1.0,0.9,'y')]; }},
  cap:     {name:'Graduation cap', short:'Cap', draw:function(x,y){ return [{t:'rect',x:x-1.9,y:y-4.6,w:3.9,h:1.4,c:'d'}, {t:'rect',x:x-3.4,y:y-5.6,w:7.0,h:1.1,c:'d'}, Ln([x+3.3,y-5.1],[x+3.7,y-2.3],0.9,'y'), P(Math.floor(x+3.6),Math.floor(y-2.0),'y')]; }},
  crown:   {name:'Little crown', short:'Crown', draw:function(x,y){ return [{t:'rect',x:x-2.3,y:y-4.9,w:4.8,h:1.4,c:'y'}, T([[x-2.3,y-4.7],[x-2.1,y-6.8],[x-0.8,y-4.7]],'y'), T([[x-0.9,y-4.7],[x+0.1,y-7.4],[x+1.1,y-4.7]],'y'), T([[x+1.0,y-4.7],[x+2.4,y-6.8],[x+2.5,y-4.7]],'y'), P(Math.floor(x),Math.floor(y-4.4),'r')]; }}
};
var POSES={
  sit0:function(){ return sitPose({}); },
  sit1:function(){ return sitPose({tail:1.2}); },
  blink:function(){ return sitPose({eye:'closed'}); },
  happy:function(){ return sitPose({eye:'happy', mouth:'open'}); },
  sad:function(){ return sitPose({eye:'half', ears:'flat', tail:-0.6}); },
  groom0:function(){ return sitPose({eye:'closed', headDown:1, paw:[20.6,9.6]}); },
  groom1:function(){ return sitPose({eye:'closed', headDown:1, paw:[21.0,8.6], lick:1}); },
  walk0:function(){ return walkPose(0); }, walk1:function(){ return walkPose(1); },
  walk2:function(){ return walkPose(2); }, walk3:function(){ return walkPose(3); },
  sleep0:function(){ return sleepPose(0); }, sleep1:function(){ return sleepPose(1); },
  jump:function(){ return jumpPose(); },
  stretch:function(){ return stretchPose(); },
  held0:function(){ return heldPose(0); }, held1:function(){ return heldPose(1); }
};
var cache={};
function frame(name, coatId, hat){
  hat=HATS[hat]&&HATS[hat].draw ? hat : 'none';
  var k=coatId+':'+hat+':'+name;
  if(!cache[k]){
    var coat=COATS[coatId]||COATS.ginger, sh=POSES[name]();
    if(hat!=='none'){ for(var i=0;i<sh.length;i++) if(sh[i].t==='head'){ sh=sh.concat(HATS[hat].draw(sh[i].hx, sh[i].hy)); break; } }
    cache[k]=toImage(raster(sh, coat), coat);
  }
  return cache[k];
}

/* the little pictures that float up: a heart, a sparkle, a z */
var BITS={
  heart:['.##.##.','#######','#######','.#####.','..###..','...#...'],
  spark:['...#...','...#...','.#.#.#.','..###..','#######','..###..','.#.#.#.','...#...','...#...'],
  zed:['#####','...#.','..#..','.#...','#####']
};
var BITCOL={heart:'#E2566B', spark:'#F0BE3C', zed:'#7D8CC4'};
var bitURL={};
function bit(name){
  if(bitURL[name]) return bitURL[name];
  var rows=BITS[name], h=rows.length, w=rows[0].length, cv=document.createElement('canvas');
  cv.width=w; cv.height=h;
  var cx=cv.getContext('2d'); cx.fillStyle=BITCOL[name];
  for(var y=0;y<h;y++) for(var x=0;x<w;x++) if(rows[y].charAt(x)==='#') cx.fillRect(x,y,1,1);
  bitURL[name]=cv.toDataURL();
  return bitURL[name];
}

/* expose the drawing for previews */
window.DKPET_DRAW={frame:frame, POSES:POSES, COATS:COATS, HATS:HATS, GW:GW, GH:GH};

/* ============================================================
   WHAT IS KEPT: one record, shared by Learn and the community
   ============================================================ */
var DEF={v:1, on:true, name:'Mishti', coat:'ginger', hat:'none', hats:[], stay:false, quiet:false, x:0.82, love:0, seen:0, napping:false, met:0, played:0,
         day:'', mile:0, greeted:0, studied:'', mins:0, nudged:''};
var store=load();
function load(){
  var j=null;
  try{ j=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){}
  var o={}, k;
  for(k in DEF) o[k]=(j && j[k]!==undefined) ? j[k] : DEF[k];
  if(!COATS[o.coat]) o.coat='ginger';
  if(!Array.isArray(o.hats)) o.hats=[];
  o.hats=o.hats.filter(function(h){ return HATS[h] && h!=='none'; });
  if(!HATS[o.hat] || (o.hat!=='none' && o.hats.indexOf(o.hat)<0)) o.hat='none';
  o.name=String(o.name||DEF.name).slice(0,16);
  return o;
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(store)); }catch(e){} }

/* ============================================================
   THE PAGE AROUND IT
   ============================================================ */
var W=GW*S, H=GH*S;
var root=null, cat=null, shadow=null, bubble=null, handle=null, menuEl=null;
var INTER='a,button,input,textarea,select,label,summary,details,[role="button"],[onclick],[contenteditable="true"],.opt,video,iframe';
var PERCH='.card,.t-hero,.t-road,.t-card,.shopitem,.mx,.stat,.medal,.shelf,.mhead,.qcard,.bdg-sum .bs,.l-numstrip,.badge,'+
          '.wow_content,.post,.panel-white,.wow_side_loggd_usr,.list-group,.setting-panel,.sidebar-conatnier .panel,.profile-container .card';
var env={top:0, floor:innerHeight, minX:20, maxX:innerWidth-20, night:false, question:false, still:false, typing:false, community:false};
var perches=[], lastScan=0, lastEnv=0;

function isFixed(el){
  for(var e=el; e && e!==document.body && e!==document.documentElement; e=e.parentElement){
    var p=getComputedStyle(e).position;
    if(p==='fixed'||p==='sticky') return e;
  }
  return null;
}
function topAt(x,y){
  var els=document.elementsFromPoint ? document.elementsFromPoint(x,y) : [];
  for(var i=0;i<els.length;i++) if(!root || !root.contains(els[i])) return els[i];
  return null;
}
function measure(now){
  lastEnv=now;
  var w=innerWidth, h=innerHeight, e, f;
  env.community=!!document.querySelector('.navbar-default,#wo_home_btns,.header-container');
  /* the bar along the top, and anything fixed along the bottom (a tab bar) */
  env.top=0;
  e=topAt(w/2, 2); f=e && isFixed(e);
  if(f){ var r=f.getBoundingClientRect(); if(r.height<h*0.4) env.top=Math.max(0, r.bottom); }
  env.floor=h-4;                               /* room for its shadow */
  e=topAt(w/2, h-3); f=e && isFixed(e);
  if(f){ var r2=f.getBoundingClientRect(); if(r2.height<h*0.3 && r2.top>h*0.6) env.floor=r2.top-1; }
  /* a rail fixed down one side (Learn's sidebar) is not floor to walk on */
  env.minX=W*0.5+6; env.maxX=w-W*0.5-6;
  e=topAt(8, env.floor-30); f=e && isFixed(e);
  if(f && f!==document.body){ var r3=f.getBoundingClientRect(); if(r3.left<=4 && r3.width<w*0.4 && r3.height>h*0.4) env.minX=Math.max(env.minX, r3.right+W*0.5+4); }
  if(env.maxX<env.minX+40){ env.minX=W*0.5+6; env.maxX=w-W*0.5-6; }
  var de=document.documentElement;
  env.night = de.getAttribute('data-theme')==='night' || !!document.getElementById('night-mode-css');
  env.still = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || de.classList.contains('still');
  env.question = !!(document.body && document.body.getAttribute('data-route')==='run' && document.querySelector('.qcard .opt:not([disabled])'));
  var a=document.activeElement;
  env.typing = !!(a && (a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable) && !(menuEl && menuEl.contains(a)));
  if(root){
    root.classList.toggle('night', env.night);
    root.style.zIndex = env.community ? 990 : 58;
  }
}
/* the cards it can sit on: tops in view, wide enough, nothing to press above them */
function scan(now){
  lastScan=now;
  perches=[];
  var list=document.querySelectorAll(PERCH), n=0;
  for(var i=0;i<list.length && n<40;i++){
    var el=list[i];
    if(root && root.contains(el)) continue;
    if(el.closest && el.closest('.sheet,#sheetHost,.modal,.dropdown-menu,.dkp-menu')) continue;
    var r=el.getBoundingClientRect();
    if(r.width<W+60 || r.height<24) continue;
    if(r.top<env.top+H+10 || r.top>env.floor-24) continue;
    if(r.right<0 || r.left>innerWidth) continue;
    perches.push(el); n++;
  }
}
function ext(surf){
  if(!surf) return [env.minX, env.maxX];
  var r=surf.getBoundingClientRect();
  return [Math.max(r.left+W*0.5+2, W*0.5), Math.min(r.right-W*0.5-2, innerWidth-W*0.5)];
}
function surfY(surf){ return surf ? surf.getBoundingClientRect().top+2 : env.floor; }
function blocked(x,y){
  var pts=[[x,y-6],[x-W*0.34,y-14],[x+W*0.34,y-14],[x,y-H*0.62],[x+W*0.2,y-H*0.85]];
  for(var i=0;i<pts.length;i++){
    var px=pts[i][0], py=pts[i][1];
    if(px<0||py<0||px>innerWidth||py>innerHeight) continue;
    var e=topAt(px,py);
    if(e && e.closest && e.closest(INTER)) return true;
  }
  return false;
}
/* is there reading under it? text, a picture, an icon */
var TEXTY={P:1,SPAN:1,B:1,I:1,STRONG:1,EM:1,H1:1,H2:1,H3:1,H4:1,H5:1,H6:1,LI:1,TD:1,TH:1,SMALL:1,IMG:1,SVG:1,CANVAS:1,CODE:1,PRE:1,PATH:1,CIRCLE:1,RECT:1,TEXT:1};
function busy(x,y){
  var pts=[[x,y-H*0.5],[x-W*0.25,y-H*0.25],[x+W*0.25,y-H*0.25]];
  for(var i=0;i<pts.length;i++){
    var e=topAt(pts[i][0],pts[i][1]);
    if(!e) continue;
    if(TEXTY[e.tagName.toUpperCase()]) return true;
    for(var n=e.firstChild;n;n=n.nextSibling) if(n.nodeType===3 && /\S/.test(n.nodeValue)) return true;
  }
  return false;
}
/* somewhere to go on this surface: free of buttons, and empty if possible */
function calmX(surf){
  var e=ext(surf), y=surfY(surf), first=null;
  for(var k=0;k<10;k++){
    var x=rnd(e[0],e[1]);
    if(blocked(x,y)) continue;
    if(!busy(x,y)) return x;
    if(first===null) first=x;
  }
  return first;
}
function clearX(surf, want){
  var e=ext(surf), y=surfY(surf), tries=[want], k;
  for(k=1;k<=7;k++){ tries.push(want+k*46); tries.push(want-k*46); }
  for(k=0;k<tries.length;k++){
    var x=Math.max(e[0], Math.min(e[1], tries[k]));
    if(!blocked(x,y)) return x;
  }
  return null;
}

/* ============================================================
   THE CAT
   ============================================================ */
var C={x:innerWidth*0.8, y:innerHeight, face:-1, st:'idle', t:0, until:0, surf:null, dx:0,
       tx:0, speed:42, next:null, jump:null, vy:0, blinkAt:0, blinking:0, tail:0, tailAt:0,
       squash:0, hop:0, held:null, fade:1, zAt:0, lastBubble:0, wakeAt:0};
var lastAct=Date.now(), raf=0, lastT=0;

function setState(st, ms){ C.st=st; C.t=0; C.until = ms ? now()+ms : 0; if(typeof kick==='function') kick(); }
function now(){ return Date.now(); }
function rnd(a,b){ return a+Math.random()*(b-a); }
function chance(p){ return Math.random()<p; }

function land(surf){
  C.surf=surf||null;
  if(surf) C.dx=C.x-surf.getBoundingClientRect().left;
  C.y=surfY(C.surf); C.vy=0; C.squash=0.14;
  if(ball && !ball.done && !C.surf){ setState('chase'); return; }
  setState('idle', rnd(2500,6000));
  remember();
}
function remember(){
  if(!C.surf){ store.x=Math.max(0, Math.min(1, C.x/innerWidth)); }
  store.seen=now(); save();
}
function walkTo(x, then){
  var e=ext(C.surf);
  C.tx=Math.max(e[0], Math.min(e[1], x));
  if(Math.abs(C.tx-C.x)<4){ C.next=null; if(then) then(); else setState('idle', rnd(2000,5000)); return; }
  C.face=C.tx>C.x?1:-1;
  C.speed = Math.abs(C.tx-C.x)>380 ? 92 : 44;
  C.next=then||null;
  setState('walk');
}
function jumpTo(surf, x){
  var y1=surf===null ? env.floor : surfY(surf);
  var dy=C.y-y1, dist=Math.sqrt((x-C.x)*(x-C.x)+dy*dy);
  C.face=x>=C.x?1:-1;
  C.jump={x0:C.x, y0:C.y, x1:x, surf:surf, T:0.42+Math.min(0.42, dist/1300), A:dy>0 ? Math.max(40, dy*0.55+34) : 26, t:0, crouch:0.16};
  setState('jump');
}
function fall(){ C.surf=null; C.vy=-60; setState('fall'); }

/* choose what to do next */
function decide(){
  if(!store.on) return;
  if(store.napping){ setState('sleep'); return; }
  if(env.question){ goQuiet(); return; }
  var hr=new Date().getHours(), sleepy=(hr>=23||hr<5)?0.18:0.05;
  if(store.stay || env.still || env.typing){
    if(chance(0.15)) setState('groom', 2600); else setState('idle', rnd(4000,9000));
    return;
  }
  var r=Math.random();
  if(r<sleepy){ setState('sleep', rnd(25000,60000)); return; }
  r=Math.random();
  if(r<0.30){ var gx=calmX(C.surf); if(gx!==null){ walkTo(gx); return; } }
  if(r<0.58 && tryPerch()) return;
  if(r<0.66 && C.surf){ hopDown(); return; }
  if(r<0.78){ setState('groom', rnd(2400,3600)); return; }
  if(r<0.83){ zoomies(3); return; }
  setState('idle', rnd(3000,7000));
}
function tryPerch(){
  if(!perches.length) return false;
  var opts=perches.filter(function(el){
    if(el===C.surf || !document.body.contains(el)) return false;
    var r=el.getBoundingClientRect(), y=r.top+2, dy=C.y-y;
    return Math.abs(dy)>=36 && Math.abs(dy)<=380 && r.top>env.top+H+6 && r.top<env.floor-20;
  });
  if(!opts.length) return false;
  var el=opts[Math.floor(Math.random()*opts.length)], e=ext(el);
  if(e[1]<e[0]) return false;
  var lx=clearX(el, Math.max(e[0], Math.min(e[1], C.x + rnd(-160,160))));
  if(lx===null) return false;
  /* close enough to jump from here? otherwise walk under it first */
  var me=ext(C.surf), from=Math.max(me[0], Math.min(me[1], lx-(lx>C.x?90:-90)));
  if(Math.abs(from-C.x)>40) walkTo(from, function(){ jumpTo(el, lx); });
  else jumpTo(el, lx);
  return true;
}
function hopDown(){
  var x=clearX(null, C.x+(chance(0.5)?70:-70));
  if(x===null) return setState('idle', 3000);
  jumpTo(null, x);
}
function zoomies(n){
  if(n<=0) return setState('idle', 2500);
  var e=ext(C.surf);
  walkTo(rnd(e[0],e[1]), function(){ zoomies(n-1); });
  C.speed=150;
}
/* while a question is on screen: a corner, and stillness */
function goQuiet(){
  var x=clearX(null, C.x>innerWidth/2 ? env.maxX : env.minX);
  if(x===null) x=clearX(null, C.x>innerWidth/2 ? env.minX : env.maxX);
  if(x===null){ C.fade=0; setState('quiet'); return; }
  var far=Math.abs(x-C.x)>40 || C.surf;
  if(far){
    C.fade=0;                                  /* slip away rather than cross the question */
    setTimeout(function(){ C.surf=null; C.x=x; C.y=env.floor; C.face=x>innerWidth/2?-1:1; C.fade=1; }, 220);
  }
  setState('quiet');
}

/* ---------- a ball of yarn to chase ---------- */
var ball=null, BR=5*S;                          /* the ball's radius on screen */
function yarnCanvas(){
  var n=11, cv=document.createElement('canvas'); cv.width=n; cv.height=n;
  var cx=cv.getContext('2d'), x, y;
  for(y=0;y<n;y++) for(x=0;x<n;x++){
    var dx=x-5, dy=y-5, d=Math.sqrt(dx*dx+dy*dy);
    if(d>5.2) continue;
    cx.fillStyle = d>4.3 ? '#5A1E2A' : ((x+y*2)%5===0 || (x*2-y)%7===0) ? '#F28DA0' : '#D9485E';
    cx.fillRect(x,y,1,1);
  }
  cx.fillStyle='#FFD3DB'; cx.fillRect(3,3,1,1); cx.fillRect(4,2,1,1);
  return cv;
}
function play(){
  if(!root || env.question) return;
  if(env.still){ say('I am resting: reduced motion is on.', true); return; }
  closeMenu();
  removeBall(true);
  var el=yarnCanvas();
  el.className='dkp-ball'; el.setAttribute('data-noadvance','');
  el.style.zIndex=root.style.zIndex;
  document.body.appendChild(el);
  var side = C.x<innerWidth/2 ? 1 : -1;
  ball={el:el, x:Math.max(BR+4, Math.min(innerWidth-BR-4, C.x+side*rnd(140,220))), y:env.top+BR+30, vx:-side*rnd(40,90), vy:0, rot:0, t0:now(), bats:0, done:0};
  el.addEventListener('pointerdown', function(e){
    e.preventDefault(); e.stopPropagation(); lastAct=now();
    if(!ball) return;
    ball.vx=(ball.x>=e.clientX?1:-1)*rnd(260,460); ball.vy=-rnd(240,380); ball.t0=now()-2000; ball.done=0;
  });
  store.played=(store.played||0)+1; save();
  if(C.surf || C.st==='sleep' || C.st==='quiet'){ C.surf=null; fall(); }
  if(C.st!=='fall') setState('chase');
  say(chance(0.5)?'Yarn!':'Mine!', true);
}
function removeBall(now_){
  if(!ball) return;
  var el=ball.el; ball=null;
  if(now_){ if(el.parentNode) el.parentNode.removeChild(el); return; }
  el.style.transition='opacity .5s'; el.style.opacity='0';
  setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 520);
}
function ballTick(dt){
  if(!ball) return;
  var b=ball, fl=env.floor;
  b.vy+=1700*dt; b.x+=b.vx*dt; b.y+=b.vy*dt;
  if(b.y>fl-BR){ b.y=fl-BR; b.vy = Math.abs(b.vy)>90 ? -b.vy*0.42 : 0; b.vx-=b.vx*Math.min(1,1.5*dt); }
  if(b.x<BR+2){ b.x=BR+2; b.vx=Math.abs(b.vx)*0.6; }
  if(b.x>innerWidth-BR-2){ b.x=innerWidth-BR-2; b.vx=-Math.abs(b.vx)*0.6; }
  b.rot+=b.vx*dt/BR;
  b.el.style.transform='translate3d('+Math.round(b.x-BR)+'px,'+Math.round(b.y-BR)+'px,0) rotate('+b.rot.toFixed(2)+'rad)';
  /* the game ends after six bats, or fifteen seconds */
  if(!b.done && (b.bats>=6 || now()-b.t0>15000)){
    b.done=now();
    if(C.st==='chase'||C.st==='bat'){ happy(1300); hearts(2); say(['That was fun!','Again tomorrow?','I win.'][Math.floor(Math.random()*3)], true); }
  }
  if(b.done && now()-b.done>4000) removeBall();
}
function chaseTick(dt){
  if(!ball || ball.done){ setState('idle', rnd(2000,4000)); return; }
  var b=ball, side = C.x<=b.x ? 1 : -1, target=b.x - side*(W*0.42+BR*0.6);
  C.face=side;
  var gap=target-C.x, onFloor=b.y>env.floor-BR-14;
  if(Math.abs(gap)<10 && onFloor && Math.abs(b.vx)<160){
    setState('bat', 320);
    b.vx=side*rnd(240,470); b.vy=-rnd(150,330); b.bats++;
    if(chance(0.3)) hearts(1);
    return;
  }
  var sp=Math.min(Math.abs(gap), 170*dt);
  C.x+=sp*(gap>0?1:-1);
  C.x=Math.max(W/2, Math.min(innerWidth-W/2, C.x));
  C.speed=170;
}

/* ---------- what it notices ----------
   In Learn: minutes studied today (real minutes from the study clock) and
   the day streak. On the community side, at most once a day after four in
   the afternoon, one friendly word if nothing has been practised today. */
function localDay(){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
var newsAt=0;
function news(t){
  if(t-newsAt<15000 || env.question) return;
  newsAt=t;
  var day=localDay();
  if(store.day!==day){ store.day=day; store.mile=0; store.greeted=0; save(); }
  try{
    if(window.CLOCK && CLOCK.todayMins && window.DB && DB.state){
      var m=Math.floor(CLOCK.todayMins()||0);
      if(m>0 && (store.studied!==day || store.mins!==m)){ store.studied=day; store.mins=m; save(); }
      var marks=[15,30,60,90,120,180,240], i;
      for(i=marks.length-1;i>=0;i--){
        if(m>=marks[i] && store.mile<marks[i]){
          store.mile=marks[i]; save();
          say(m>=60 ? Math.floor(m/60)+' hr '+(m%60?(m%60)+' min ':'')+'today. Proud of you.' : marks[i]+' minutes today!', true);
          sparkle(2);
          return;
        }
      }
      var sk=DB.liveStreak ? DB.liveStreak() : 0;
      if(!store.greeted && sk>=2 && document.body.getAttribute('data-route')==='today'){
        store.greeted=1; save(); say('Day '+sk+' in a row!', true); return;
      }
    } else if(env.community && !store.quiet && store.nudged!==day && store.studied!==day && new Date().getHours()>=16 && t-lastAct<20000){
      store.nudged=day; save();
      say('Five questions in Learn? I will watch.', true);
    }
  }catch(e){}
}

/* ---------- reactions ---------- */
function happy(ms){ if(C.st==='held'||C.st==='jump'||C.st==='fall') return; C.hop=0.0001; setState('happy', ms||900); hearts(1); }
function sad(){ if(C.st==='held'||C.st==='jump'||C.st==='fall') return; setState('sad', 1500); }
function wake(){
  if(C.st!=='sleep' && C.st!=='quiet') return;
  if(C.st==='sleep'){ setState('stretch', 1100); if(chance(0.3)) say('Yawn...'); }
}

/* ============================================================
   EVERY FRAME
   ============================================================ */
var inTick=false;
function tick(ts){
  raf=0;
  if(!store.on || !root){ return; }
  inTick=true;
  var dt=Math.min(0.05, lastT ? (ts-lastT)/1000 : 0.016); lastT=ts;
  var t=now();
  if(t-lastEnv>500) measure(t);
  if(t-lastScan>2500) scan(t);

  /* riding a card: follow it, or fall when it leaves */
  if(C.surf && C.st!=='jump' && C.st!=='held'){
    if(!document.body.contains(C.surf)) fall();
    else {
      var r=C.surf.getBoundingClientRect();
      if(r.top<env.top+8 || r.width<W) fall();
      else if(r.top>env.floor-6){ C.surf=null; C.y=env.floor; }
      else { C.y=r.top+2; C.x=Math.max(r.left+W*0.5, Math.min(r.right-W*0.5, r.left+C.dx)); }
    }
  }
  if(!C.surf && C.st!=='jump' && C.st!=='held' && C.st!=='fall'){
    C.y=env.floor;
    if(C.x<env.minX-2 && C.st!=='walk' && C.st!=='enter') C.x=env.minX;
    if(C.x>env.maxX+2 && C.st!=='walk' && C.st!=='enter') C.x=env.maxX;
  }

  /* a question has appeared or gone */
  if(env.question && C.st!=='quiet' && C.st!=='held' && C.st!=='happy' && C.st!=='sad'){ removeBall(true); goQuiet(); }
  if(!env.question && C.st==='quiet'){ C.fade=1; setState('idle', 1200); }

  var idleLong = t-lastAct>75000;
  switch(C.st){
    case 'enter':
    case 'walk':
      var step=C.speed*dt*(env.still?0:1);
      if(Math.abs(C.tx-C.x)<=step){ C.x=C.tx; var nx=C.next; C.next=null; if(nx) nx(); else setState('idle', rnd(2500,6000)); remember(); }
      else C.x+=step*(C.tx>C.x?1:-1);
      if(C.surf) C.dx=C.x-C.surf.getBoundingClientRect().left;
      break;
    case 'jump':
      var J=C.jump;
      if(J.crouch>0){ J.crouch-=dt; break; }
      J.t+=dt/J.T;
      var k=Math.min(1,J.t), y1=J.surf ? surfY(J.surf) : env.floor;
      C.x=J.x0+(J.x1-J.x0)*k;
      C.y=J.y0+(y1-J.y0)*k-J.A*4*k*(1-k);
      if(k>=1){ C.x=J.x1; land(J.surf); }
      break;
    case 'fall':
      var py=C.y;
      C.vy+=2000*dt; C.y+=C.vy*dt;
      var hitEl=null;
      for(var i=0;i<perches.length;i++){
        var pr=perches[i].getBoundingClientRect(), top=pr.top+2;
        if(top>=py-1 && top<=C.y && C.x>=pr.left+W*0.3 && C.x<=pr.right-W*0.3 && top>env.top+H){ hitEl=perches[i]; break; }
      }
      if(hitEl){ C.y=surfY(hitEl); land(hitEl); }
      else if(C.y>=env.floor){ C.x=Math.max(env.minX, Math.min(env.maxX, C.x)); land(null); }
      break;
    case 'held':
      break;
    case 'chase':
      chaseTick(dt);
      break;
    case 'bat':
      if(t>C.until) setState('chase');
      break;
    case 'sleep':
      if(!store.napping && C.until && t>C.until && !idleLong) setState('stretch', 1100);
      if(t-C.zAt>1800){ C.zAt=t; particle('zed'); }
      break;
    case 'quiet':
      if(idleLong && chance(dt*0.05)) setState('sleep');
      break;
    case 'stretch': case 'groom': case 'happy': case 'sad':
      if(t>C.until) setState('idle', rnd(2000,5000));
      break;
    default: /* idle */
      if(idleLong && !store.stay && chance(dt*0.2)) { setState('sleep'); break; }
      if(C.until && t>C.until) decide();
      /* never sit on something that can be pressed */
      if(C.t>1.2 && Math.floor(C.t*2)!==Math.floor((C.t-dt)*2) && blocked(C.x, C.y)){
        var cx=clearX(C.surf, C.x);
        if(cx!==null && Math.abs(cx-C.x)>3) walkTo(cx); else if(C.surf) hopDown();
      }
  }
  ballTick(dt);
  news(t);
  if(ball && env.question){ removeBall(true); }
  C.t+=dt;
  if(C.squash>0) C.squash-=dt;
  if(C.st==='happy') C.hop+=dt;
  draw(t);
  inTick=false;
  /* sitting, sleeping or grooming does not need sixty frames a second */
  var calm=(C.st==='idle'||C.st==='sleep'||C.st==='quiet'||C.st==='groom'||C.st==='sad') && !ball && C.squash<=0 && !press;
  if(calm) slowT=setTimeout(function(){ slowT=0; raf=requestAnimationFrame(tick); }, C.surf?60:110), raf=-1;
  else raf=requestAnimationFrame(tick);
}
var slowT=0;
/* anything that happens wakes the full-speed loop at once */
function kick(){
  if(inTick || !root || !store.on || document.hidden) return;
  if(slowT){ clearTimeout(slowT); slowT=0; raf=0; }
  if(!raf){ lastT=0; raf=requestAnimationFrame(tick); }
}

/* which picture, and where */
var shown='';
function pick(t){
  switch(C.st){
    case 'walk': case 'enter': return 'walk'+(Math.floor(t/(C.speed>80?90:150))%4);
    case 'chase': return 'walk'+(Math.floor(t/80)%4);
    case 'bat': return 'jump';
    case 'jump': return C.jump && C.jump.crouch>0 ? 'sit0' : 'jump';
    case 'fall': return 'jump';
    case 'held': return 'held'+(Math.floor(t/260)%2);
    case 'sleep': return 'sleep'+(Math.floor(t/1400)%2);
    case 'stretch': return 'stretch';
    case 'groom': return 'groom'+(Math.floor(t/380)%2);
    case 'happy': return 'happy';
    case 'sad': return 'sad';
  }
  if(t>C.blinkAt){ C.blinking=t+150; C.blinkAt=t+rnd(2500,6500); }
  if(t<C.blinking) return 'blink';
  if(t>C.tailAt){ C.tail=1-C.tail; C.tailAt=t+rnd(700,1800); }
  return C.tail ? 'sit1' : 'sit0';
}
function draw(t){
  var name=pick(t), key=store.coat+':'+store.hat+':'+name;
  if(key!==shown){
    shown=key;
    var cx=cat.getContext('2d');
    cx.clearRect(0,0,GW,GH);
    cx.drawImage(frame(name, store.coat, store.hat),0,0);
  }
  var hop = C.st==='happy' ? Math.max(0, Math.sin(Math.min(1,C.hop/0.45)*Math.PI))*14 : 0;
  var sq = C.squash>0 ? 0.9 : (C.st==='jump' && C.jump && C.jump.crouch>0 ? 0.88 : 1);
  root.style.transform='translate3d('+Math.round(C.x-W/2)+'px,'+Math.round(C.y-H-hop)+'px,0)';
  cat.style.transform='scale('+(C.face*(sq<1?1.06:1))+','+sq+')';
  root.style.opacity=String(C.fade);
  cat.style.pointerEvents = C.fade<0.5 ? 'none' : 'auto';
  var air = C.st==='jump'||C.st==='fall'||C.st==='held';
  shadow.style.opacity = air ? '0.25' : (hop ? '0.35' : '0.55');
  shadow.style.transform = 'translateY('+(air?0:hop)+'px) scaleX('+(hop||air?0.7:1)+')';
}
function loop(){ if(!raf && store.on && !document.hidden){ lastT=0; raf=requestAnimationFrame(tick); } }
function stopLoop(){ if(slowT){ clearTimeout(slowT); slowT=0; } if(raf>0) cancelAnimationFrame(raf); raf=0; }

/* ============================================================
   WORDS, HEARTS, ZZZ
   ============================================================ */
function say(text, important){
  if(!bubble || store.quiet || env.question) return;
  var t=now();
  if(!important && t-C.lastBubble<25000) return;
  C.lastBubble=t;
  bubble.textContent=text;
  bubble.hidden=false;
  bubble.classList.remove('out');
  var left=C.x-W/2;
  bubble.style.left = (left<40 ? 4 : left>innerWidth-W-120 ? -96 : -40)+'px';
  clearTimeout(say._t);
  say._t=setTimeout(function(){ bubble.classList.add('out'); setTimeout(function(){ bubble.hidden=true; }, 300); }, important?3600:2600);
}
function particle(kind){
  if(!root || env.still) return;
  var im=document.createElement('img');
  im.src=bit(kind); im.alt=''; im.className='dkp-bit '+kind;
  var hx=W/2+(C.face>0?W*0.22:-W*0.22)+rnd(-6,6);
  im.style.left=hx+'px'; im.style.top=(C.st==='sleep'?H*0.45:H*0.12)+'px';
  root.appendChild(im);
  setTimeout(function(){ if(im.parentNode) im.parentNode.removeChild(im); }, 1500);
}
function hearts(n){ for(var i=0;i<n;i++) setTimeout(function(){ particle('heart'); }, i*180); }
function sparkle(n){ for(var i=0;i<n;i++) setTimeout(function(){ particle('spark'); }, i*140); }

/* a soft "mrrp" — only where the site's own sound is switched on */
var actx=null;
function soundOn(){ try{ return !!(window.DB && DB.state && DB.state().sound); }catch(e){ return false; } }
function mrrp(){
  if(!soundOn()) return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    var t=actx.currentTime, o=actx.createOscillator(), g=actx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(520,t); o.frequency.exponentialRampToValueAtTime(760,t+0.09); o.frequency.exponentialRampToValueAtTime(600,t+0.2);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.09,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+0.24);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+0.26);
  }catch(e){}
}

/* ============================================================
   TOUCH: pet it, drag it, hold it for the menu
   ============================================================ */
var press=null;
function onDown(e){
  if(e.button!==undefined && e.button!==0) return;
  e.preventDefault();
  lastAct=now();
  press={x:e.clientX, y:e.clientY, t:now(), moved:false, id:e.pointerId};
  try{ cat.setPointerCapture(e.pointerId); }catch(x){}
  clearTimeout(press.lp);
  press.lp=setTimeout(function(){ if(press && !press.moved){ press.menu=true; openMenu(); } }, 600);
}
function onMove(e){
  if(!press) return;
  var dx=e.clientX-press.x, dy=e.clientY-press.y;
  if(!press.moved && dx*dx+dy*dy>49){ press.moved=true; clearTimeout(press.lp); C.surf=null; setState('held'); }
  if(press.moved){
    C.x=Math.max(W/2, Math.min(innerWidth-W/2, e.clientX));
    C.y=Math.max(H, Math.min(innerHeight, e.clientY+H*0.78));
  }
}
function onUp(e){
  if(!press) return;
  clearTimeout(press.lp);
  var p=press; press=null;
  if(p.moved){ fall(); if(chance(0.35)) say('Mrrp.'); return; }
  if(p.menu) return;
  if(now()-p.t<500){
    /* a double tap brings out the yarn */
    if(now()-(onUp.last||0)<380 && !ball){ onUp.last=0; play(); return; }
    onUp.last=now();
    pet();
  }
}
function pet(){
  store.love=(store.love||0)+1; save();
  if(C.st==='sleep'){ store.napping=false; setState('stretch', 1000); }
  else happy(1200);
  hearts(2+(store.love%3===0?1:0));
  mrrp();
  if(store.love===1) say('Purr... I am '+store.name+'. Hold me for my menu, or tap twice for yarn.', true);
  else if(store.love%12===0) say(store.name+' likes you a lot.', true);
  else if(chance(0.25)) say(['Purr...','Mrrp!','More, please.','Again!'][Math.floor(Math.random()*4)]);
  showHandle();
}
function showHandle(){
  if(!handle) return;
  handle.hidden=false;
  clearTimeout(showHandle._t);
  showHandle._t=setTimeout(function(){ handle.hidden=true; }, 4000);
}

/* ============================================================
   THE CAT'S MENU
   ============================================================ */
function coatPreview(id, hat){
  var cv=document.createElement('canvas'); cv.width=GW; cv.height=GH;
  cv.getContext('2d').drawImage(frame('sit0', id, hat===undefined?store.hat:hat),0,0);
  cv.className='dkp-coatpic';
  return cv;
}
function openMenu(){
  closeMenu();
  var m=document.createElement('div');
  m.className='dkp-menu'+(env.night?' night':''); m.setAttribute('role','dialog'); m.setAttribute('aria-label','Your cat'); m.setAttribute('data-noadvance','');
  m.style.zIndex = env.community ? 2000 : 200;
  m.innerHTML='<div class="dkp-mh"><span class="dkp-mpic"></span><div><label class="dkp-l" for="dkpName">Name</label>'+
      '<input id="dkpName" maxlength="16" autocomplete="off" spellcheck="false"></div>'+
      '<button type="button" class="dkp-x" data-k="close" aria-label="Close">&times;</button></div>'+
    '<div class="dkp-l">Coat</div><div class="dkp-coats"></div>'+
    '<div class="dkp-l">Hat</div><div class="dkp-hats"></div>'+
    '<label class="dkp-row"><input type="checkbox" data-k="stay"> Stay in one place</label>'+
    '<label class="dkp-row"><input type="checkbox" data-k="quiet"> No speech bubbles</label>'+
    '<div class="dkp-btns"><button type="button" data-k="play">Play with yarn</button><button type="button" data-k="nap"></button></div>'+
    '<div class="dkp-btns"><button type="button" data-k="hide">Hide the cat</button><button type="button" data-k="close">Done</button></div>'+
    '<p class="dkp-foot"></p>';
  document.body.appendChild(m);
  menuEl=m;
  var nm=m.querySelector('#dkpName'); nm.value=store.name;
  nm.addEventListener('input', function(){ store.name=nm.value.trim().slice(0,16)||DEF.name; save(); });
  var box=m.querySelector('.dkp-coats');
  Object.keys(COATS).forEach(function(id){
    var b=document.createElement('button'); b.type='button'; b.className='dkp-coat'+(store.coat===id?' on':''); b.setAttribute('data-coat',id);
    b.appendChild(coatPreview(id)); var s=document.createElement('span'); s.textContent=COATS[id].name; b.appendChild(s);
    box.appendChild(b);
  });
  paintHats(m);
  m.querySelector('.dkp-mpic').appendChild(coatPreview(store.coat));
  m.querySelector('[data-k="stay"]').checked=!!store.stay;
  m.querySelector('[data-k="quiet"]').checked=!!store.quiet;
  paintMenu();
  m.addEventListener('click', function(e){
    var t=e.target.closest('[data-coat],[data-k]'); if(!t) return;
    var c=t.getAttribute('data-coat'), k=t.getAttribute('data-k');
    var hh=t.getAttribute('data-hat');
    if(c){ store.coat=c; save(); shown=''; var pic=m.querySelector('.dkp-mpic'); pic.innerHTML=''; pic.appendChild(coatPreview(c));
      var all=m.querySelectorAll('.dkp-coat'); for(var i=0;i<all.length;i++) all[i].classList.toggle('on', all[i].getAttribute('data-coat')===c); paintHats(m); happy(700); }
    else if(hh){ setHat(hh); var pic2=m.querySelector('.dkp-mpic'); pic2.innerHTML=''; pic2.appendChild(coatPreview(store.coat)); paintHats(m); }
    else if(k==='close') closeMenu();
    else if(k==='stay'){ store.stay=t.checked; save(); }
    else if(k==='quiet'){ store.quiet=t.checked; save(); }
    else if(k==='nap'){ store.napping=!store.napping; save(); if(store.napping) setState('sleep'); else setState('stretch', 1000); paintMenu(); }
    else if(k==='hide'){ closeMenu(); setOn(false); }
    else if(k==='play'){ closeMenu(); store.napping=false; save(); play(); }
  });
  /* place it beside the cat, inside the window */
  var mw=Math.min(300, innerWidth-24), mh=m.offsetHeight||320;
  var left=Math.max(12, Math.min(innerWidth-mw-12, C.x-mw/2)), top=Math.max(12, Math.min(innerHeight-mh-12, C.y-H-mh-10));
  m.style.width=mw+'px'; m.style.left=left+'px'; m.style.top=top+'px';
  setTimeout(function(){ document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', escKey, true); }, 0);
}
function paintHats(m){
  var box=m.querySelector('.dkp-hats'); if(!box) return;
  box.innerHTML='';
  var list=['none'].concat(store.hats);
  if(list.length<2){
    var p=document.createElement('p'); p.className='dkp-hint';
    p.innerHTML='Hats for '+esc(store.name)+' are in the <a href="'+shopLink()+'">Learn shop</a>.';
    box.appendChild(p); return;
  }
  list.forEach(function(h){
    var b=document.createElement('button'); b.type='button'; b.className='dkp-coat'+(store.hat===h?' on':''); b.setAttribute('data-hat',h); b.title=HATS[h].name;
    b.appendChild(coatPreview(store.coat, h)); var s=document.createElement('span'); s.textContent=HATS[h].short; b.appendChild(s);
    box.appendChild(b);
  });
}
function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
/* Learn's shop: here if this is Learn, otherwise Learn at /learn/ */
function shopLink(){ return window.UI && window.UI.go ? '#/shop' : '/learn/#/shop'; }
function setHat(h){
  if(!HATS[h]) return;
  if(h!=='none' && store.hats.indexOf(h)<0) return;
  store.hat=h; save(); shown='';
  if(root) happy(700);
}
function paintMenu(){
  if(!menuEl) return;
  menuEl.querySelector('[data-k="nap"]').textContent = store.napping ? 'Wake up' : 'Nap here';
  menuEl.querySelector('.dkp-foot').textContent = store.love ? store.name+' has been petted '+store.love+(store.love===1?' time.':' times.') : 'Tap '+store.name+' to pet. Drag to move.';
}
function outside(e){ if(menuEl && !menuEl.contains(e.target) && !(root && root.contains(e.target))) closeMenu(); }
function escKey(e){ if(e.key==='Escape') closeMenu(); }
function closeMenu(){
  if(!menuEl) return;
  if(menuEl.parentNode) menuEl.parentNode.removeChild(menuEl);
  menuEl=null;
  document.removeEventListener('pointerdown', outside, true);
  document.removeEventListener('keydown', escKey, true);
}

/* ============================================================
   SETTING UP
   ============================================================ */
var CSS=
'.dkpet{position:fixed;left:0;top:0;width:'+W+'px;height:'+H+'px;pointer-events:none;will-change:transform;transition:opacity .2s}'+
'.dkpet canvas.dkp-cat{position:absolute;left:0;top:0;width:'+W+'px;height:'+H+'px;image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:auto;cursor:grab;touch-action:none;transform-origin:50% 100%}'+
'.dkpet canvas.dkp-cat:active{cursor:grabbing}'+
'.dkpet,.dkpet *{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
'@media print{.dkpet,.dkp-ball,.dkp-menu{display:none!important}}'+
'.dkpet.night canvas.dkp-cat{filter:drop-shadow(0 0 1px rgba(255,240,220,.6))}'+
'.dkp-shadow{position:absolute;left:12%;right:12%;bottom:-3px;height:6px;border-radius:50%;background:rgba(20,20,19,.28);transition:opacity .15s}'+
'.dkpet.night .dkp-shadow{background:rgba(0,0,0,.55)}'+
'.dkp-bubble{position:absolute;bottom:'+(H+6)+'px;left:-40px;min-width:120px;max-width:220px;padding:7px 11px;border-radius:12px;'+
  'background:var(--card,#FAF9F5);color:var(--ink,#141413);border:1.5px solid var(--rule-2,#CFCBBE);font:600 13px/1.35 "Hind Siliguri",system-ui,sans-serif;'+
  'box-shadow:0 8px 20px -10px rgba(20,20,19,.45);text-align:center;animation:dkpIn .25s ease-out both;pointer-events:none;white-space:normal}'+
'.dkp-bubble.out{opacity:0;transform:translateY(4px);transition:all .3s}'+
'.dkpet.night .dkp-bubble{background:#1D1C16;color:#EDE9DC;border-color:#453F33}'+
'.dkp-handle{position:absolute;right:-14px;top:-6px;width:24px;height:24px;border-radius:12px;border:1.5px solid var(--rule-2,#CFCBBE);'+
  'background:var(--card,#FAF9F5);color:var(--ink,#141413);font:700 14px/1 system-ui;pointer-events:auto;cursor:pointer;padding:0}'+
'.dkpet:hover .dkp-handle{display:block!important}'+
'.dkp-ball{position:fixed;left:0;top:0;width:'+(BR*2)+'px;height:'+(BR*2)+'px;image-rendering:pixelated;cursor:pointer;touch-action:none;will-change:transform}'+
'.dkp-bit{position:absolute;width:14px;image-rendering:pixelated;pointer-events:none;animation:dkpUp 1.4s ease-out forwards}'+
'.dkp-bit.zed{width:10px;animation-name:dkpZ}'+
'@keyframes dkpUp{0%{opacity:0;transform:translate(-50%,6px) scale(.6)}15%{opacity:1}100%{opacity:0;transform:translate(-50%,-34px) scale(1.1)}}'+
'@keyframes dkpZ{0%{opacity:0;transform:translate(0,0) scale(.6)}20%{opacity:.9}100%{opacity:0;transform:translate(16px,-30px) scale(1.2)}}'+
'@keyframes dkpIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}'+
'.dkp-menu{position:fixed;padding:14px 14px 12px;border-radius:16px;background:var(--card,#FAF9F5);color:var(--ink,#141413);border:1px solid var(--rule,#E0DDD2);'+
  'box-shadow:0 24px 60px -24px rgba(20,20,19,.5);font:14px/1.45 "Hind Siliguri",system-ui,sans-serif;animation:dkpIn .2s ease-out both}'+
'.dkp-menu.night{background:#1D1C16;color:#EDE9DC;border-color:#332F26}'+
'.dkp-mh{display:flex;align-items:center;gap:10px;margin-bottom:10px}'+
'.dkp-mh>div{flex:1;min-width:0}'+
'.dkp-mpic canvas{width:60px;height:auto;image-rendering:pixelated;display:block}'+
'.dkp-l{display:block;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;opacity:.65;margin:0 0 4px}'+
'#dkpName{width:100%;height:34px;padding:0 10px;border-radius:9px;border:1.5px solid var(--rule,#E0DDD2);background:transparent;color:inherit;font:600 15px "Hind Siliguri",system-ui,sans-serif}'+
'.dkp-x{align-self:flex-start;width:28px;height:28px;border:0;background:none;color:inherit;font-size:22px;line-height:1;cursor:pointer;opacity:.7}'+
'.dkp-coats{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:10px}'+
'.dkp-coat{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 2px;border-radius:10px;border:1.5px solid transparent;background:none;color:inherit;cursor:pointer;font:600 10.5px/1.1 system-ui}'+
'.dkp-coat canvas{width:45px;height:auto;image-rendering:pixelated}'+
'.dkp-hats{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:10px}'+
'.dkp-hint{grid-column:1/-1;margin:0 0 4px;font-size:12.5px;opacity:.8}'+
'.dkp-hint a{color:var(--accent-press,#C6613F);font-weight:600}'+
'.dkp-coat.on{border-color:var(--accent,#D97757);background:var(--accent-soft,#F6E6DE)}'+
'.dkp-menu.night .dkp-coat.on{background:#2F241D}'+
'.dkp-row{display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer}'+
'.dkp-btns{display:flex;gap:6px;margin-top:8px}'+
'.dkp-btns button{flex:1;height:34px;border-radius:10px;border:1.5px solid var(--rule-2,#CFCBBE);background:transparent;color:inherit;font:600 13px system-ui;cursor:pointer}'+
'.dkp-btns button:hover{border-color:var(--accent,#D97757)}'+
'.dkp-foot{margin:8px 0 0;font-size:12px;opacity:.65}'+
'@media (prefers-reduced-motion:reduce){.dkp-bit{display:none}}';

function build(){
  if(root || !document.body) return;
  if(!document.getElementById('dkPetCss')){
    var st=document.createElement('style'); st.id='dkPetCss'; st.textContent=CSS; document.head.appendChild(st);
  }
  root=document.createElement('div'); root.className='dkpet'; root.id='dkPet'; root.setAttribute('aria-hidden','true');
  root.setAttribute('data-noadvance','');   /* petting the cat never moves Learn on to the next question */
  shadow=document.createElement('div'); shadow.className='dkp-shadow';
  cat=document.createElement('canvas'); cat.className='dkp-cat'; cat.width=GW; cat.height=GH; cat.title=store.name;
  bubble=document.createElement('div'); bubble.className='dkp-bubble'; bubble.hidden=true;
  handle=document.createElement('button'); handle.type='button'; handle.className='dkp-handle'; handle.hidden=true; handle.innerHTML='&hellip;'; handle.title='The cat\'s menu';
  handle.style.display='none';
  root.appendChild(shadow); root.appendChild(cat); root.appendChild(bubble); root.appendChild(handle);
  document.body.appendChild(root);
  cat.addEventListener('pointerdown', onDown);
  cat.addEventListener('pointermove', onMove);
  cat.addEventListener('pointerup', onUp);
  cat.addEventListener('pointercancel', function(){ if(press){ clearTimeout(press.lp); if(press.moved) fall(); press=null; } });
  cat.addEventListener('contextmenu', function(e){ e.preventDefault(); openMenu(); });
  handle.addEventListener('click', function(e){ e.stopPropagation(); openMenu(); });
  handle.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
  measure(now()); scan(now());
  arrive();
}
function teardown(){
  closeMenu();
  removeBall(true);
  if(root && root.parentNode) root.parentNode.removeChild(root);
  root=null; stopLoop();
}
/* coming onto the page: walk in after a long absence, otherwise be where it was */
function arrive(){
  var t=now(), away=t-(store.seen||0);
  C.surf=null; C.y=env.floor; C.fade=1;
  var home=Math.max(env.minX, Math.min(env.maxX, (store.x||0.82)*innerWidth));
  if(store.napping){ C.x=home; setState('sleep'); }
  else if(!store.seen || away>30*60000){
    var fromLeft=home<innerWidth/2;              /* in from the nearer side */
    C.x = fromLeft ? -W/2 : innerWidth+W/2;
    C.face = fromLeft ? 1 : -1;
    C.tx=home; C.speed=Math.max(70, Math.min(140, Math.abs(home-C.x)/3)); C.next=null; setState('enter');
    C.next=function(){
      setState('idle', rnd(2500,5000));
      if(!store.met){ store.met=1; save(); say('Hi! I\'m '+store.name+'. Tap me to say hello.', true); }
      else if(away>6*3600000) say(['Hi again!','Back to it?','I kept your seat warm.'][Math.floor(Math.random()*3)], true);
    };
  } else { C.x=home; setState('idle', rnd(1500,4000)); }
  store.seen=t; save();
  loop();
}
function setOn(on){
  store.on=!!on; save();
  if(store.on){ build(); loop(); } else teardown();
}

/* ---------- what happens on the page ---------- */
/* it turns to look at a pointer that comes close */
var lookT=0;
window.addEventListener('pointermove', function(e){
  if(!root || press || e.pointerType==='touch') return;
  var t=now(); if(t-lookT<400) return; lookT=t;
  if((C.st==='idle'||C.st==='quiet') && Math.abs(e.clientY-(C.y-H/2))<240 && Math.abs(e.clientX-C.x)>W*0.4 && Math.abs(e.clientX-C.x)<320){
    var f=e.clientX>C.x?1:-1;
    if(f!==C.face){ C.face=f; C.squash=0.06; }
  }
}, {passive:true});
['pointermove','pointerdown','keydown','scroll','touchstart','wheel'].forEach(function(ev){
  window.addEventListener(ev, function(){ lastAct=now(); if(C.st==='sleep' && !store.napping && root) wake(); }, {passive:true, capture:true});
});
window.addEventListener('resize', function(){ if(root){ measure(now()); scan(now()); if(!C.surf){ C.x=Math.max(env.minX, Math.min(env.maxX, C.x)); C.y=env.floor; } } });
var scrollT=0;
window.addEventListener('scroll', function(){ var t=now(); kick(); if(t-scrollT>300){ scrollT=t; scan(t); } }, {passive:true});
document.addEventListener('visibilitychange', function(){ if(document.hidden){ stopLoop(); remember(); } else loop(); });
window.addEventListener('pagehide', remember);
window.addEventListener('storage', function(e){
  if(e.key!==KEY) return;
  var was=store.on; store=load(); shown='';
  if(store.on && !was) setOn(true); else if(!store.on && was) teardown();
});

/* Learn tells the cat what happened; the community side has likes */
window.addEventListener('dk:answer', function(e){
  if(!root) return;
  var d=e.detail||{};
  if(d.ok){
    happy(800);
    if(d.combo>=3) sparkle(Math.min(4, Math.floor(d.combo/3)));
    if(d.combo && d.combo%5===0) say(d.combo+' in a row!', true);
    else if(chance(0.08)) say(['Nice!','You know this.','Easy for you.','Yes!'][Math.floor(Math.random()*4)]);
  } else {
    sad();
    if(chance(0.25)) say(['Next time.','Tricky one.','Shake it off.'][Math.floor(Math.random()*3)]);
  }
});
window.addEventListener('dk:setdone', function(e){
  if(!root) return;
  var d=e.detail||{}, r=d.n ? d.right/d.n : 0;
  setTimeout(function(){
    happy(1400); hearts(3); sparkle(r>=0.75?4:1);
    say(r>=0.9 ? 'Brilliant set! '+d.right+'/'+d.n : r>=0.6 ? 'Set done: '+d.right+'/'+d.n+'.' : 'Set done. The misses come back later.', true);
  }, 600);
});
window.addEventListener('dk:level', function(e){ if(!root) return; var d=e.detail||{}; sparkle(5); happy(1400); say('Level '+(d.level||'up')+'!', true); });
window.addEventListener('dk:badge', function(e){ if(!root) return; var d=e.detail||{}; sparkle(3); happy(1000); say('New badge'+(d.name?': '+d.name:'')+'!', true); });
document.addEventListener('click', function(e){
  if(!root || !env.community) return;
  var t=e.target.closest && e.target.closest('[class*="like"],[class*="reaction"],[id*="like"]');
  if(t && chance(0.6)) happy(700);
}, true);

/* ---------- the switch the rest of the site uses ---------- */
window.DKPET={
  on:function(){ return !!store.on; },
  setOn:setOn,
  menu:function(){ if(!store.on) setOn(true); setTimeout(openMenu, 50); },
  play:function(){ if(!store.on) setOn(true); setTimeout(play, 60); },
  name:function(){ return store.name; },
  hat:function(){ return store.hat; },
  setHat:setHat,
  addHat:function(h){ if(HATS[h] && h!=='none' && store.hats.indexOf(h)<0){ store.hats.push(h); save(); } },
  hats:HATS,
  preview:function(hat, coat){ return frame('sit0', coat||store.coat, hat).toDataURL(); },
  say:function(t){ say(t, true); },
  _state:function(){ return {st:C.st, x:Math.round(C.x), y:Math.round(C.y), surf:!!C.surf, face:C.face, fade:C.fade, floor:env.floor, top:env.top, minX:env.minX, maxX:env.maxX, perches:perches.length, question:env.question}; },
  _do:function(what){ if(what==='perch') return tryPerch(); if(what==='walk'){ var e=ext(C.surf); walkTo(rnd(e[0],e[1])); } if(what==='sleep') setState('sleep', 60000); if(what==='decide') decide(); }
};

function syncLearn(){
  try{
    if(!(window.GAME && GAME.COSMETICS && GAME.owns)) return;
    GAME.COSMETICS.forEach(function(c){ if(c.kind==='cathat' && c.hat && c.hat!=='none' && GAME.owns(c.id) && store.hats.indexOf(c.hat)<0) store.hats.push(c.hat); });
    save();
  }catch(e){}
}
function start(){ syncLearn(); if(store.on) build(); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', start); else start();

})();
