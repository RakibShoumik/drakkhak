/* ===========================================================
   GEN — GRE geometry: triangles, polygons, circles, solids, and the
   coordinate plane. No figures exist in this app, so every
   configuration is stated in full in words.
   =========================================================== */
(function(){
var F=GEN.F, PI='&pi;', RT='&radic;';
function W(t,why){ return {t:t, why:why}; }
function tb(t,w,e,h){ return t==='warm'?w:t==='exam'?e:h; }

/* exact forms and their numeric values */
function rad(c, k){                      /* c√k simplified */
  var out=c, inside=k;
  for(var f=2; f*f<=inside; f++){ while(inside%(f*f)===0){ inside/=f*f; out*=f; } }
  if(inside===1) return F.n(out,0);
  return (out===1?'':F.n(out,2))+RT+inside;
}
function pif(num, den){                  /* (num/den)π */
  var g=F.gcd(num,den); num/=g; den/=g;
  return (num===1?'':num)+PI+(den===1?'':'/'+den);
}
function val(s){
  var t=String(s).replace(/<[^>]+>/g,'').replace(/&minus;/g,'-').replace(/\s+/g,'').replace(/,/g,'');
  var m;
  if((m=t.match(/^(-?\d*\.?\d*)&radic;(\d+)(?:\/(\d+))?$/))) return (m[1]===''||m[1]==='-'?(m[1]==='-'?-1:1):parseFloat(m[1]))*Math.sqrt(+m[2])/(m[3]?+m[3]:1);
  if((m=t.match(/^(-?\d*\.?\d*)&pi;(?:\/(\d+))?$/))) return (m[1]===''?1:parseFloat(m[1]))*Math.PI/(m[2]?+m[2]:1);
  if((m=t.match(/^(-?\d+\.?\d*)-(\d*\.?\d*)&pi;$/))) return parseFloat(m[1])-(m[2]===''?1:parseFloat(m[2]))*Math.PI;
  if((m=t.match(/^(\d*\.?\d*)&pi;-(\d+\.?\d*)$/))) return (m[1]===''?1:parseFloat(m[1]))*Math.PI-parseFloat(m[2]);
  if((m=t.match(/^(-?\d+)\/(\d+)$/))) return m[1]/m[2];
  if((m=t.match(/^(-?\d*\.?\d+)(?:&deg;|degrees)?$/))) return parseFloat(m[1]);
  return NaN;
}
/* drop any wrong option whose value equals the answer or another option's */
function clean(correct, wrong){
  var seen=[val(correct.t)], out=[];
  wrong.forEach(function(w){
    var v=val(w.t);
    if(!isFinite(v)) return;
    for(var i=0;i<seen.length;i++) if(Math.abs(seen[i]-v)<1e-9) return;
    seen.push(v); out.push(w);
  });
  return out;
}
function close(a,b){ return Math.abs(a-b)<1e-6; }

/* ---------- special right triangles ---------- */
GEN.add({
  id:'gq.geo.special', topic:'gq.geo', n:30, trick:'g.geo.spec',
  make:function(r,k,n){
    var t=r.tier(k,n), kind=r.pick(['30','45']), x=r.int(2,12), ask=r.int(0,2), c, why, stem, wrong;
    if(kind==='30'){
      /* short leg x, long leg x√3, hypotenuse 2x */
      if(ask===0){ stem='In a right triangle with angles 30&deg;, 60&deg; and 90&deg;, the side opposite the 30&deg; angle is '+x+'. How long is the side opposite the 60&deg; angle?';
        c=W(rad(x,3),'Sides run x : x'+RT+'3 : 2x. Short leg '+x+' gives long leg '+rad(x,3)+'.');
        wrong=[W(F.n(2*x,0),'Gives the hypotenuse, 2x.'),W(rad(x,2),'Uses the 45-45-90 ratio.'),W(F.n(x*1.5,1),'Scales by 1.5 instead of '+RT+'3.'),W(rad(2*x,3),'Doubles before multiplying by '+RT+'3.'),W(rad(x,3)+'/2','Halves the long leg.')]; }
      else if(ask===1){ var h=2*x; stem='A right triangle has a 60&deg; angle and a hypotenuse of '+h+'. What is its area?';
        c=W(rad(x*x,3)+'/2'.replace('/2',''),'');
        var area=x*x*Math.sqrt(3)/2; c=W(x*x%2===0?rad(x*x/2,3):rad(x*x,3)+'/2','Legs are '+x+' and '+rad(x,3)+'; area = &frac12; &times; '+x+' &times; '+rad(x,3)+'.');
        wrong=[W(rad(x*x,3),'Forgets the &frac12; in the area formula.'),W(F.n(x*x,0),'Uses the short leg twice.'),W(F.n(h*x/2,0),'Uses the hypotenuse as a leg.'),W(rad(h*h/4,2),'Uses the 45-45-90 ratio.'),W(x*x%2===0?rad(x*x/4,3):rad(x*x,3)+'/4','Halves twice.')]; }
      else { var L=x; stem='In a 30-60-90 right triangle the longer leg measures '+rad(L,3)+'. What is the length of the hypotenuse?';
        c=W(F.n(2*L,0),'The longer leg is x'+RT+'3, so x = '+L+' and the hypotenuse is 2x = '+(2*L)+'.');
        wrong=[W(F.n(L,0),'Gives the short leg.'),W(rad(2*L,3),'Doubles the long leg.'),W(rad(L,6),'Multiplies by '+RT+'2.'),W(F.n(L*3,0),'Squares the root away but keeps the factor.'),W(rad(L,2),'Uses the 45-45-90 ratio.')]; }
    } else {
      if(ask===0){ stem='An isosceles right triangle has legs of length '+x+'. How long is the hypotenuse?';
        c=W(rad(x,2),'Sides are x : x : x'+RT+'2, so the hypotenuse is '+rad(x,2)+'.');
        wrong=[W(F.n(2*x,0),'Adds the legs.'),W(rad(x,3),'Uses the 30-60-90 ratio.'),W(F.n(x*x,0),'Multiplies the legs.'),W(rad(2*x,2),'Doubles as well as multiplying by '+RT+'2.'),W(rad(x,2)+'/2','Halves the hypotenuse.')]; }
      else if(ask===1){ var hy=2*x; stem='The hypotenuse of an isosceles right triangle is '+rad(hy,2)+'. What is its area?';
        c=W(F.n(2*x*x,0),'Each leg is '+(2*x)+'; area = &frac12; &times; '+(2*x)+' &times; '+(2*x)+' = '+(2*x*x)+'.');
        wrong=[W(F.n(4*x*x,0),'Forgets the &frac12;.'),W(F.n(4*x*x,0)+'', 'Forgets the &frac12;.'),W(rad(2*x*x,2),'Keeps a '+RT+'2 that cancels.'),W(F.n(x*x,0),'Halves the leg twice.'),W(F.n(hy*hy,0),'Squares the hypotenuse number and drops the root.'),W(F.n(8*x*x,0),'Squares the hypotenuse and keeps the factor 2 in the wrong place.')]; }
      else { var d=x; stem='A square has a diagonal of '+rad(d,2)+'. What is its perimeter?';
        c=W(F.n(4*d,0),'A diagonal splits a square into two 45-45-90 triangles, so each side is '+d+' and the perimeter '+(4*d)+'.');
        wrong=[W(rad(4*d,2),'Multiplies the diagonal by 4.'),W(F.n(d*d,0),'Gives the area.'),W(F.n(2*d,0),'Counts two sides.'),W(rad(2*d,2),'Doubles the diagonal.'),W(F.n(4*d*2,0),'Doubles the side first.')]; }
    }
    return {b:tb(t,-0.5,0.2,0.8)+(ask===1?0.2:0), stem:stem, correct:c, wrong:clean(c,wrong),
      fast: kind==='30' ? '30-60-90 is x : x'+RT+'3 : 2x. Find x from what you are given, then read off the side you need.'
                        : '45-45-90 is x : x : x'+RT+'2. Divide a hypotenuse by '+RT+'2 to get a leg.',
      p:{kind:kind,x:x,ask:ask}};
  },
  verify:function(q){
    var p=q.p, x=p.x, v=val(q.opts[q.ans]), want;
    if(p.kind==='30') want = p.ask===0? x*Math.sqrt(3) : p.ask===1? 0.5*x*x*Math.sqrt(3) : 2*x;
    else want = p.ask===0? x*Math.SQRT2 : p.ask===1? 2*x*x : 4*x;
    return close(v,want);
  }
});

/* ---------- the third side ---------- */
GEN.add({
  id:'gq.geo.third', topic:'gq.geo', n:26, trick:'g.geo.third',
  make:function(r,k,n){
    var t=r.tier(k,n), a=r.int(3,20), b=r.intNot(3,24,[a]), even=t==='hard'&&r.chance(0.5);
    var cnt=0; for(var c=1;c<a+b;c++) if(c>Math.abs(a-b) && (!even || c%2===0)) cnt++;
    var lo=Math.abs(a-b), hi=a+b;
    return {b:tb(t,-0.3,0.4,1.0),
      stem:'Two sides of a triangle measure '+a+' and '+b+'. How many '+(even?'even ':'')+'integer lengths are possible for the third side?',
      correct:W(cnt,'The third side must lie strictly between '+lo+' and '+hi+'. The '+(even?'even ':'')+'integers there number '+cnt+'.'),
      wrong:[W(hi-lo+1,'Includes both endpoints; a side equal to '+lo+' or '+hi+' collapses the triangle.'),
        W(hi-lo,'Includes one endpoint.'), W(even?hi-lo-1:Math.floor((hi-lo-1)/2),even?'Counts every integer, not just the even ones.':'Counts only one parity.'),
        W(hi-1,'Only checks that the side is less than the sum.'), W(Math.max(a,b)-1,'Only checks against the longer side.'),
        W(cnt+1,'Off by one at the edge.')],
      fast:'Strictly between |'+a+' &minus; '+b+'| and '+a+' + '+b+': from '+(lo+1)+' to '+(hi-1)+(even?', evens only':'')+'.',
      p:{a:a,b:b,even:even}};
  },
  verify:function(q){
    var p=q.p, c=0;
    for(var s=1;s<p.a+p.b+5;s++){ if(p.a+p.b>s && p.a+s>p.b && p.b+s>p.a && (!p.even||s%2===0)) c++; }
    return GEN.numOf(q.opts[q.ans])===c;
  }
});

/* ---------- polygon angles ---------- */
GEN.add({
  id:'gq.geo.polygon', topic:'gq.geo', n:26, trick:'g.geo.poly',
  make:function(r,k,n){
    var t=r.tier(k,n), N=r.pick([5,6,8,9,10,12,15,18,20,24,30,36]), ask=t==='hard'?r.pick(['n','ext']):r.pick(['int','sum']);
    var sum=(N-2)*180, inter=sum/N, ext=360/N, stem, c, wrong;
    if(ask==='int'){ stem='What is the measure, in degrees, of each interior angle of a regular polygon with '+N+' sides?';
      c=W(F.n(inter,2),'Interior angles sum to ('+N+' &minus; 2) &times; 180 = '+sum+'; divide by '+N+'.');
      wrong=[W(F.n(ext,2),'Gives the exterior angle.'),W(F.n(180*N/N,0)==='180'?F.n(360-inter,2):'180','Uses 180 for every angle.'),W(F.n((N-1)*180/N,2),'Uses (n &minus; 1) instead of (n &minus; 2).'),W(F.n(sum,0),'Gives the sum, not one angle.'),W(F.n(N*180/(N+2),2),'Divides by n + 2.')]; }
    else if(ask==='sum'){ stem='What is the sum of the interior angles, in degrees, of a polygon with '+N+' sides?';
      c=W(F.n(sum,0),'('+N+' &minus; 2) &times; 180 = '+sum+'.');
      wrong=[W(F.n(N*180,0),'Multiplies n by 180 without subtracting 2.'),W(F.n((N-1)*180,0),'Subtracts 1 instead of 2.'),W('360','Uses the exterior-angle sum.'),W(F.n(inter,2),'Gives one angle of the regular polygon.'),W(F.n((N-2)*90,0),'Uses 90 instead of 180.')]; }
    else if(ask==='n'){ stem='Each interior angle of a regular polygon measures '+F.n(inter,2)+'&deg;. How many sides does it have?';
      c=W(N,'Exterior angle = 180 &minus; '+F.n(inter,2)+' = '+F.n(ext,2)+'&deg;, and 360 &divide; '+F.n(ext,2)+' = '+N+'.');
      wrong=[W(Math.round(360/inter)||N+1,'Divides 360 by the interior angle.'),W(N+2,'Adds the 2 from the sum formula.'),W(N-2,'Subtracts the 2 from the sum formula.'),W(Math.round(inter/ext)||N*2,'Divides the interior angle by the exterior.'),W(N*2,'Doubles the count.')]; }
    else { stem='The interior angles of a regular polygon each exceed its exterior angles by '+F.n(inter-ext,2)+'&deg;. How many sides does it have?';
      c=W(N,'Interior + exterior = 180 and interior &minus; exterior = '+F.n(inter-ext,2)+', so exterior = '+F.n(ext,2)+'&deg; and n = 360/'+F.n(ext,2)+' = '+N+'.');
      wrong=[W(N+2,'Adds 2 from the interior-sum formula.'),W(Math.round(360/(inter-ext))||N-1,'Divides 360 by the difference.'),W(N-1,'Off by one.'),W(N*2,'Uses 180 instead of 360.'),W(Math.round(N/2)||3,'Uses 720 instead of 360.')]; }
    return {b:tb(t,-0.7,0.1,0.9), stem:stem, correct:c, wrong:wrong,
      fast:'Work with the exterior angle: it is 360/n, and interior = 180 &minus; exterior.', p:{N:N,ask:ask}};
  },
  verify:function(q){
    var p=q.p, v=GEN.numOf(q.opts[q.ans]), N=p.N;
    if(p.ask==='int') return close(v,(N-2)*180/N);
    if(p.ask==='sum') return v===(N-2)*180;
    return v===N;
  }
});

/* ---------- similar triangles from a parallel line ---------- */
GEN.add({
  id:'gq.geo.similar', topic:'gq.geo', n:26, trick:'g.geo.sim',
  make:function(r,k,n){
    var t=r.tier(k,n), p=r.int(2,9), q=r.int(1,9), x=p*r.int(1,4), area=t==='hard';
    var total=p+q, BC=x*total/p;
    if(BC!==Math.round(BC)) return null;
    var stem='In triangle ABC, point D lies on side AB and point E on side AC so that DE is parallel to BC. AD = '+p+', DB = '+q+
      (area ? ', and the area of triangle ADE is '+(p*p)+'. What is the area of triangle ABC?' : ', and DE = '+x+'. What is BC?');
    if(area){
      var ar=total*total;
      return {b:1.0, stem:stem,
        correct:W(ar,'Triangles ADE and ABC are similar with ratio '+p+' : '+total+'. Areas scale by the square: '+(p*p)+' &times; ('+total+'/'+p+')<sup>2</sup> = '+ar+'.'),
        wrong:[W(p*total,'Scales the area by the ratio of sides, not its square.'),W(p*p+q*q,'Adds the squares of AD and DB.'),
          W(total*total-p*p,'Gives the area of the trapezoid DBCE.'),W(q*q,'Uses DB as the scale.'),W(2*ar,'Doubles the area.')],
        fast:'Side ratio AD : AB = '+p+' : '+total+'; area ratio is its square.', p:{p:p,q:q,x:x,area:1}};
    }
    return {b:tb(t,-0.3,0.4,0.9), stem:stem,
      correct:W(BC,'Triangles ADE and ABC are similar, with AB/AD = '+total+'/'+p+'. BC = '+x+' &times; '+total+'/'+p+' = '+BC+'.'),
      wrong:[W(F.n(x*q/p,2),'Uses DB/AD instead of AB/AD.'),W(F.n(x*total/q,2),'Uses AB/DB.'),W(x+q,'Adds DB to DE.'),
        W(F.n(x*p/total,2),'Inverts the ratio.'),W(F.n(x*total*total/(p*p),2),'Squares the ratio, as for area.')],
      fast:'Scale factor = whole side / top piece = '+total+'/'+p+'. Multiply DE by it.', p:{p:p,q:q,x:x,area:0}};
  },
  verify:function(q){
    var p=q.p, v=GEN.numOf(q.opts[q.ans]);
    return p.area ? close(v,(p.p+p.q)*(p.p+p.q)) : close(v,p.x*(p.p+p.q)/p.p);
  }
});

/* ---------- a triangle whose third side can flex (QC) ---------- */
GEN.add({
  id:'gq.geo.qctri', topic:'gq.geo', type:'qc', n:28, trick:'g.geo.third',
  make:function(r,k){
    var want=GEN.want4(k);
    var trip=r.pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29],[9,40,41]]), sc=r.int(1,4);
    var a=trip[0]*sc, b=trip[1]*sc, hyp=trip[2]*sc, cond, angles, B, bText;
    function side(th){ return Math.sqrt(a*a+b*b-2*a*b*Math.cos(th*Math.PI/180)); }
    if(want===2){ cond='the angle between them is 90&deg;'; angles=[90]; B=hyp; bText=String(hyp); }
    else if(want===0){ cond='the angle between them is greater than 90&deg;'; angles=[91,100,120,150,179]; B=hyp; bText=String(hyp); }
    else if(want===1){ cond='the angle between them is less than 90&deg;'; angles=[1,30,60,89]; B=hyp; bText=String(hyp); }
    else { cond='nothing is known about the angle between them'; angles=[5,60,90,120,175]; B=hyp; bText=String(hyp); }
    var pts=angles.map(function(th){ return {a:side(th), b:B, s:'the angle is '+th+'&deg;'}; });
    var d=GEN.qc(pts, want===2?'With a right angle the third side is the hypotenuse: '+RT+'('+a*a+' + '+b*b+') = '+hyp+'.'
      : want===0?'An obtuse angle opens the triangle past the right-angled case, so the third side exceeds '+hyp+'.'
      : want===1?'An acute angle closes the triangle below the right-angled case, so the third side is less than '+hyp+'.'
      : 'The third side can be anything strictly between '+(b-a)+' and '+(a+b)+', which straddles '+hyp+'.');
    if(!d||d.ans!==want) return null;
    return {type:'qc', b:[0.6,0.6,0.2,0.8][want], pre:'Two sides of a triangle measure '+a+' and '+b+', and '+cond+'.',
      qa:'The length of the third side', qb:bText, ans:d.ans, why:d.why,
      fast:'Anchor on the right-angled case ('+a+'-'+b+'-'+hyp+'). Wider angle, longer side; narrower angle, shorter side; no angle given, no answer.',
      p:{a:a,b:b,angles:angles,B:B}};
  },
  verify:function(q){
    var p=q.p, pts=[];
    var list = p.angles.length===1 ? [90] : p.angles[0]===91 ? [90.5,95,110,135,170,179.5] : p.angles[0]===1 ? [0.5,10,45,80,89.5] : [1,45,90,135,179];
    list.forEach(function(th){ pts.push({a:Math.sqrt(p.a*p.a+p.b*p.b-2*p.a*p.b*Math.cos(th*Math.PI/180)), b:p.B}); });
    return GEN.qc(pts,'').ans===q.ans;
  }
});

/* ---------- equilateral triangles ---------- */
GEN.add({
  id:'gq.geo.equil', topic:'gq.geo', n:24, trick:'g.geo.spec',
  make:function(r,k,n){
    var t=r.tier(k,n), s=2*r.int(1,16), ask=t==='hard'?'side':r.pick(['area','height']);
    var c, stem, wrong;
    if(ask==='area'){ stem='What is the area of an equilateral triangle with side '+s+'?';
      c=W(rad(s*s/4,3),'Area = (s<sup>2</sup>'+RT+'3)/4 = '+rad(s*s/4,3)+'.');
      wrong=[W(rad(s*s/2,3),'Uses /2 instead of /4.'),W(F.n(s*s/2,0),'Uses &frac12; base &times; side, as if the height were the side.'),W(rad(s/2,3),'Gives the height.'),W(rad(s*s/4,2),'Uses '+RT+'2 instead of '+RT+'3.'),W(F.n(s*s,0),'Squares the side.')]; }
    else if(ask==='height'){ stem='What is the height of an equilateral triangle with side '+s+'?';
      c=W(rad(s/2,3),'The height splits it into two 30-60-90 triangles; height = (s/2)'+RT+'3 = '+rad(s/2,3)+'.');
      wrong=[W(rad(s,3),'Uses s'+RT+'3 without halving.'),W(F.n(s/2,0),'Gives half the side.'),W(rad(s/2,2),'Uses '+RT+'2.'),W(rad(s*s/4,3),'Gives the area.'),W(F.n(s,0),'Assumes the height equals the side.')]; }
    else { var A=s*s/4; stem='An equilateral triangle has area '+rad(A,3)+'. What is its perimeter?';
      c=W(F.n(3*s,0),'(s<sup>2</sup>'+RT+'3)/4 = '+rad(A,3)+' gives s<sup>2</sup> = '+(s*s)+', s = '+s+', perimeter '+(3*s)+'.');
      wrong=[W(F.n(s,0),'Gives one side.'),W(F.n(2*s,0),'Counts two sides.'),W(rad(3*s,3),'Keeps a '+RT+'3 that cancels.'),W(F.n(3*s*s/4,0),'Forgets to take the square root.'),W(F.n(6*s,0),'Doubles the perimeter.')]; }
    return {b:tb(t,-0.3,0.3,1.0), stem:stem, correct:c, wrong:clean(c,wrong),
      fast:'Area of an equilateral triangle: s<sup>2</sup>'+RT+'3/4. Height: s'+RT+'3/2.', p:{s:s,ask:ask}};
  },
  verify:function(q){
    var p=q.p, v=val(q.opts[q.ans]);
    return close(v, p.ask==='area'? p.s*p.s*Math.sqrt(3)/4 : p.ask==='height'? p.s*Math.sqrt(3)/2 : 3*p.s);
  }
});

/* ---------- arcs and sectors ---------- */
GEN.add({
  id:'gq.circ.sector', topic:'gq.circ', n:28, trick:'g.circ.slice',
  make:function(r,k,n){
    var t=r.tier(k,n), R=r.int(2,15), th=r.pick([30,40,45,60,72,80,90,100,120,135,150,210,240,270]), ask=r.pick(['arc','area']);
    var diam=t==='hard'&&r.chance(0.5);
    var arc=[th*2*R,360], area=[th*R*R,360];
    var c = ask==='arc' ? W(pif(arc[0],arc[1]),'Arc = ('+th+'/360) &times; 2'+PI+'('+R+') = '+pif(arc[0],arc[1])+'.')
                        : W(pif(area[0],area[1]),'Sector = ('+th+'/360) &times; '+PI+'('+R+')<sup>2</sup> = '+pif(area[0],area[1])+'.');
    var stem='A circle has '+(diam?'diameter '+(2*R):'radius '+R)+'. What is the '+(ask==='arc'?'length of the arc':'area of the sector')+' cut off by a central angle of '+th+'&deg;?';
    var wrong=[
      W(ask==='arc'?pif(area[0],area[1]):pif(arc[0],arc[1]), ask==='arc'?'Computes the sector area instead.':'Computes the arc length instead.'),
      W(ask==='arc'?pif(th*4*R,360):pif(th*4*R*R,360), diam?'Uses the diameter as the radius.':'Doubles the radius.'),
      W(ask==='arc'?pif(th*2*R,180):pif(th*R*R,180),'Divides by 180 instead of 360.'),
      W(ask==='arc'?pif(2*R,1):pif(R*R,1),'Gives the whole '+(ask==='arc'?'circumference':'area')+'.'),
      W(ask==='arc'?pif(th*R,360):pif(th*2*R,360),ask==='arc'?'Leaves out the 2 in 2'+PI+'r.':'Uses 2'+PI+'r instead of '+PI+'r<sup>2</sup>.'),
      W(ask==='arc'?pif((360-th)*2*R,360):pif((360-th)*R*R,360),'Takes the rest of the circle.')];
    return {b:tb(t,-0.5,0.2,0.8), stem:stem, correct:c, wrong:clean(c,wrong),
      fast:'Fraction of the circle = '+th+'/360 = '+F.frac(th,360)+'. Take that fraction of the '+(ask==='arc'?'circumference, '+pif(2*R,1):'area, '+pif(R*R,1))+'.',
      p:{R:R,th:th,ask:ask}};
  },
  verify:function(q){
    var p=q.p, v=val(q.opts[q.ans]);
    return close(v, p.ask==='arc' ? p.th/360*2*Math.PI*p.R : p.th/360*Math.PI*p.R*p.R);
  }
});

/* ---------- inscribed and central angles ---------- */
GEN.add({
  id:'gq.circ.inscribed', topic:'gq.circ', n:26, trick:'g.circ.ang',
  make:function(r,k,n){
    var t=r.tier(k,n), kind=t==='hard'?r.pick(['tri','semi']):r.pick(['ins','cen']);
    var x=r.int(10,80), stem, c, wrong;
    if(kind==='ins'){ var cen=2*x; stem='Points A, B and C lie on a circle with centre O. Angle AOB, at the centre, measures '+cen+'&deg;, and C is on the major arc. What is the measure of angle ACB?';
      c=W(x,'An inscribed angle is half the central angle on the same arc: '+cen+'/2 = '+x+'.');
      wrong=[W(cen,'Treats the inscribed angle as equal to the central angle.'),W(180-cen,'Subtracts from 180.'),W(4*x,'Doubles instead of halving.'),W(90-x,'Uses the complement.'),W(360-cen,'Uses the reflex angle.')]; }
    else if(kind==='cen'){ stem='Points A, B and C lie on a circle with centre O, C on the major arc, and angle ACB measures '+x+'&deg;. What is the measure of angle AOB?';
      c=W(2*x,'The central angle is twice the inscribed angle on the same arc: '+(2*x)+'.');
      wrong=[W(x,'Takes them as equal.'),W(F.n(x/2,1),'Halves instead of doubling.'),W(180-2*x,'Subtracts from 180.'),W(360-2*x,'Uses the reflex angle.'),W(180-x,'Uses the supplement.')]; }
    else if(kind==='semi'){ stem='AB is a diameter of a circle and C is another point on the circle. Angle CAB measures '+x+'&deg;. What is the measure of angle CBA?';
      c=W(90-x,'An angle in a semicircle is 90&deg;, so angle ACB = 90 and the remaining angle is 90 &minus; '+x+' = '+(90-x)+'.');
      wrong=[W(180-x,'Subtracts from 180, forgetting the right angle at C.'),W(x,'Assumes the triangle is isosceles.'),W(2*x,'Doubles the inscribed angle.'),W(90,'Gives angle ACB.'),W(F.n(x/2,1),'Halves it.')]; }
    else { var y=r.int(20,70); if(x+y>=170) return null; stem='In triangle ABC inscribed in a circle, angle A measures '+x+'&deg; and angle B measures '+y+'&deg;. What is the measure of the central angle subtending the arc AB that does not contain C?';
      var C=180-x-y; c=W(2*C,'Angle C = 180 &minus; '+x+' &minus; '+y+' = '+C+'; the central angle on arc AB is twice that: '+(2*C)+'.');
      wrong=[W(C,'Gives angle C itself.'),W(2*(x+y),'Doubles the other two angles.'),W(360-2*C,'Takes the other arc.'),W(x+y,'Adds the given angles.'),W(F.n(C/2,1),'Halves angle C.')]; }
    return {b:tb(t,-0.4,0.2,0.9), stem:stem, correct:c, wrong:wrong,
      fast:'Inscribed angle = half the central angle on the same arc; an angle in a semicircle is 90&deg;.', p:{kind:kind,x:x,stem:stem}};
  },
  verify:function(q){
    var p=q.p, v=GEN.numOf(q.opts[q.ans]);
    if(p.kind==='ins') return v===p.x;
    if(p.kind==='cen') return v===2*p.x;
    if(p.kind==='semi') return v===90-p.x;
    var m=p.stem.match(/angle B measures (\d+)/); return v===2*(180-p.x-(+m[1]));
  }
});

/* ---------- shaded regions ---------- */
GEN.add({
  id:'gq.circ.shaded', topic:'gq.circ', n:24, trick:'g.geo.shade',
  make:function(r,k,n){
    var t=r.tier(k,n), kind=t==='hard'?'squareIn':'circleIn', s=2*r.int(2,24), R=s/2;
    var stem, c, wrong;
    if(kind==='circleIn'){
      stem='A circle is inscribed in a square of side '+s+', touching all four sides. What is the area of the region inside the square but outside the circle?';
      c=W(F.n(s*s,0)+' &minus; '+(R*R===1?'':R*R)+PI,'Square '+(s*s)+' minus circle '+PI+'('+R+')<sup>2</sup> = '+(s*s)+' &minus; '+(R*R)+PI+'.');
      wrong=[W(F.n(s*s,0)+' &minus; '+(2*R)+PI,'Subtracts the circumference instead of the area.'),
        W((R*R===1?'':R*R)+PI,'Gives the area of the circle, not the region outside it.'),
        W(F.n(s*s,0)+' &minus; '+F.n(R*R/2,1)+PI,'Halves the circle\'s area.'),
        W(F.n(s*s-R*R,0),'Drops the '+PI+' from the circle\'s area.'),
        W(F.n(s*s,0),'Gives the area of the square alone.'),
        W(F.n(s*s,0)+' &minus; '+(s*s)+PI,'Uses the side as the radius.')];
    } else {
      var side2=2*R*R;       /* square inscribed in circle radius R: diagonal 2R, area 2R^2 */
      stem='A square is inscribed in a circle of radius '+R+', with all four corners on the circle. What is the area of the region inside the circle but outside the square?';
      c=W((R*R)+PI+' &minus; '+F.n(side2,0),'Circle '+(R*R)+PI+'. The square\'s diagonal is the diameter '+(2*R)+', so its area is '+(2*R)+'<sup>2</sup>/2 = '+side2+'.');
      wrong=[W((R*R)+PI,'Gives the area of the circle alone.'),W(F.n(side2,0),'Gives the area of the square alone.'),
        W((R*R)+PI+' &minus; '+F.n(4*R*R,0),'Takes the square\'s side as the diameter.'),W((R*R)+PI+' &minus; '+F.n(R*R,0),'Takes the square\'s side as the radius.'),
        W((4*R*R)+PI+' &minus; '+F.n(side2,0),'Uses the diameter as the radius.'),W(F.n(side2,0)+' &minus; '+(R*R)+PI,'Subtracts the wrong way round.'),W((R*R)+PI+' &minus; '+F.n(2*R,0),'Subtracts the diagonal, not the area.')];
    }
    wrong=wrong.filter(function(w){ return isFinite(val(w.t)) && val(w.t)>0; });
    return {b:tb(t,0,0.4,1.0), stem:stem, correct:c, wrong:clean(c,wrong),
      fast: kind==='circleIn' ? 'Radius is half the side ('+R+'). Square minus circle.' : 'The square\'s diagonal is the diameter; area of a square = diagonal<sup>2</sup>/2.',
      p:{s:s,kind:kind}};
  },
  verify:function(q){
    var p=q.p, R=p.s/2, v=val(q.opts[q.ans]);
    return close(v, p.kind==='circleIn' ? p.s*p.s-Math.PI*R*R : Math.PI*R*R-2*R*R);
  }
});

/* ---------- cylinders and boxes ---------- */
GEN.add({
  id:'gq.circ.solid', topic:'gq.circ', n:26, trick:'g.geo.trip',
  make:function(r,k,n){
    var t=r.tier(k,n), kind=t==='hard'?r.pick(['diag','sa']):r.pick(['vol','sa','diag']), stem, c, wrong;
    if(kind==='vol'){ var R=r.int(2,8), h=r.int(3,15);
      stem='A cylinder has radius '+R+' and height '+h+'. What is its volume?';
      c=W(pif(R*R*h,1),PI+'r<sup>2</sup>h = '+PI+' &times; '+(R*R)+' &times; '+h+' = '+pif(R*R*h,1)+'.');
      wrong=[W(pif(2*R*h,1),'Uses the curved surface area, 2'+PI+'rh.'),W(pif(R*h*h,1),'Squares the height instead of the radius.'),W(pif(4*R*R*h,1),'Uses the diameter as the radius.'),W(pif(R*R*h,3),'Uses the cone formula.'),W(pif(2*R*R*h,1),'Doubles for the two ends.')];
      return {b:tb(t,-0.6,0,0.5), stem:stem, correct:c, wrong:clean(c,wrong), fast:'Volume = base area &times; height = '+PI+'('+R+')<sup>2</sup> &times; '+h+'.', p:{kind:kind,R:R,h:h}}; }
    if(kind==='sa'){ var R2=r.int(2,8), h2=r.int(2,12);
      stem='What is the total surface area of a closed cylinder with radius '+R2+' and height '+h2+'?';
      c=W(pif(2*R2*R2+2*R2*h2,1),'Two ends 2'+PI+'r<sup>2</sup> = '+pif(2*R2*R2,1)+' plus curved side 2'+PI+'rh = '+pif(2*R2*h2,1)+'.');
      wrong=[W(pif(2*R2*h2,1),'Counts only the curved side.'),W(pif(R2*R2+2*R2*h2,1),'Counts only one end.'),W(pif(R2*R2*h2,1),'Gives the volume.'),W(pif(2*R2*R2+R2*h2,1),'Uses '+PI+'rh for the side.'),W(pif(4*R2*R2+2*R2*h2,1),'Doubles the ends twice.')];
      return {b:tb(t,-0.3,0.3,0.7), stem:stem, correct:c, wrong:clean(c,wrong), fast:'Total = 2'+PI+'r(r + h) = 2'+PI+'('+R2+')('+(R2+h2)+').', p:{kind:kind,R:R2,h:h2}}; }
    var tr=r.pick([[1,2,2,3],[2,3,6,7],[1,4,8,9],[2,6,9,11],[4,4,7,9],[2,10,11,15],[3,4,12,13]]), m=r.int(1,3);
    var l=tr[0]*m, w=tr[1]*m, hh=tr[2]*m, d=tr[3]*m;
    stem='A rectangular box measures '+l+' by '+w+' by '+hh+'. What is the length of the longest straight rod that fits inside it?';
    c=W(F.n(d,0),'Space diagonal = '+RT+'('+l+'<sup>2</sup> + '+w+'<sup>2</sup> + '+hh+'<sup>2</sup>) = '+RT+(d*d)+' = '+d+'.');
    wrong=[W(rad(1,l*l+w*w),'Gives the diagonal of the base only.'),W(F.n(l+w+hh,0),'Adds the edges.'),W(rad(1,w*w+hh*hh),'Gives the diagonal of one face.'),W(F.n(hh,0),'Takes the longest edge.'),W(rad(1,l*l+w*w+hh*hh+2*l*w),'Adds a cross term that does not belong.')];
    return {b:tb(t,0,0.4,0.9), stem:stem, correct:c, wrong:clean(c,wrong), fast:RT+'(l<sup>2</sup> + w<sup>2</sup> + h<sup>2</sup>) &mdash; often a hidden triple, so check for a whole number first.', p:{kind:'diag',d:d}};
  },
  verify:function(q){
    var p=q.p, v=val(q.opts[q.ans]);
    if(p.kind==='vol') return close(v,Math.PI*p.R*p.R*p.h);
    if(p.kind==='sa') return close(v,2*Math.PI*p.R*p.R+2*Math.PI*p.R*p.h);
    return close(v,p.d);
  }
});

/* ---------- slopes and lines ---------- */
GEN.add({
  id:'gq.coord.line', topic:'gq.coord', n:28, trick:'g.coord.slope',
  make:function(r,k,n){
    var t=r.tier(k,n), x1=r.int(-8,8), y1=r.int(-8,8), x2=r.intNot(-8,9,[x1]), y2=r.int(-9,9);
    if(y1===y2) return null;
    var dy=y2-y1, dx=x2-x1, ask=t==='warm'?'slope':r.pick(['slope','perp','yint']);
    var stem, c, wrong, slope=F.frac(dy,dx);
    var P='('+F.n(x1,0)+', '+F.n(y1,0)+')', Q='('+F.n(x2,0)+', '+F.n(y2,0)+')';
    if(ask==='slope'){ stem='What is the slope of the line through '+P+' and '+Q+'?';
      c=W(slope,'Rise over run: ('+F.n(y2,0)+' &minus; '+F.n(y1,0)+')/('+F.n(x2,0)+' &minus; '+F.n(x1,0)+') = '+slope+'.');
      wrong=[W(F.frac(dx,dy),'Run over rise.'),W(F.frac(-dy,dx),'Sign slip in one of the subtractions.'),W(F.frac(-dx,dy),'Gives the perpendicular slope.'),W(F.frac(y2+y1,x2+x1||1),'Adds the coordinates instead of subtracting.'),W(F.frac(dy+1,dx),'Off by one in the rise.')]; }
    else if(ask==='perp'){ stem='A line is perpendicular to the line through '+P+' and '+Q+'. What is its slope?';
      c=W(F.frac(-dx,dy),'The slope through the points is '+slope+'; perpendicular slopes are negative reciprocals: '+F.frac(-dx,dy)+'.');
      wrong=[W(slope,'Gives the original slope.'),W(F.frac(dx,dy),'Takes the reciprocal but forgets the sign.'),W(F.frac(-dy,dx),'Changes the sign but forgets to flip.'),W(F.frac(dy,-dx*2||1),'Halves the negative slope.'),W(F.frac(dx+1,dy),'Arithmetic slip.')]; }
    else { var b0=y1*dx-dy*x1; stem='The line through '+P+' and '+Q+' crosses the y-axis at what y-value?';
      c=W(F.frac(b0,dx),'Slope '+slope+'; b = y &minus; mx = '+F.n(y1,0)+' &minus; ('+slope+')('+F.n(x1,0)+') = '+F.frac(b0,dx)+'.');
      wrong=[W(F.frac(y1*dx+dy*x1,dx),'Adds mx instead of subtracting it.'),W(F.frac(-b0,dx),'Sign slip on the intercept.'),W(slope,'Gives the slope.'),W(F.frac(-b0,dy),'Gives the x-intercept.'),W(F.frac(b0+dx,dx),'Off by one.')]; }
    return {b:tb(t,-0.5,0.3,0.8), stem:stem, correct:c, wrong:wrong,
      fast: ask==='perp' ? 'Find the slope, flip it, change its sign.' : ask==='yint' ? 'y = mx + b with one point plugged in; solve for b.' : 'Rise over run &mdash; keep the same point first in both subtractions.',
      p:{x1:x1,y1:y1,x2:x2,y2:y2,ask:ask}};
  },
  verify:function(q){
    var p=q.p, m=(p.y2-p.y1)/(p.x2-p.x1), v=GEN.numOf(q.opts[q.ans]);
    if(p.ask==='slope') return close(v,m);
    if(p.ask==='perp') return close(v,-1/m);
    return close(v,p.y1-m*p.x1);
  }
});

/* ---------- distance and midpoint ---------- */
GEN.add({
  id:'gq.coord.dist', topic:'gq.coord', n:26, trick:'g.coord.dist',
  make:function(r,k,n){
    var t=r.tier(k,n), tr=r.pick([[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15],[7,24,25],[12,16,20],[20,21,29]]);
    var x1=r.int(-9,9), y1=r.int(-9,9), sx=r.sign(), sy=r.sign(), x2=x1+sx*tr[0], y2=y1+sy*tr[1];
    var ask=t==='hard'?r.pick(['dist','end']):r.pick(['dist','mid']);
    var P='('+F.n(x1,0)+', '+F.n(y1,0)+')', Q='('+F.n(x2,0)+', '+F.n(y2,0)+')', stem, c, wrong;
    if(ask==='dist'){ stem='What is the distance between '+P+' and '+Q+'?';
      c=W(tr[2],'Horizontal gap '+tr[0]+', vertical gap '+tr[1]+': a '+tr.join('-')+' right triangle, so '+tr[2]+'.');
      wrong=[W(tr[0]+tr[1],'Adds the gaps instead of using Pythagoras.'),W(rad(1,(x1+x2)*(x1+x2)+(y1+y2)*(y1+y2))==='0'?tr[2]+1:rad(1,(x1+x2)*(x1+x2)+(y1+y2)*(y1+y2)),'Adds the coordinates before squaring.'),W(tr[2]*tr[2],'Forgets the square root.'),W(Math.abs(tr[1]-tr[0]),'Subtracts the gaps.'),W(tr[2]+1,'Arithmetic slip.')]; }
    else if(ask==='mid'){ stem='What is the midpoint of the segment joining '+P+' and '+Q+'?';
      var mx=(x1+x2)/2, my=(y1+y2)/2;
      c=W('('+F.n(mx,1)+', '+F.n(my,1)+')','Average the x-coordinates and the y-coordinates.');
      wrong=[W('('+F.n((x2-x1)/2,1)+', '+F.n((y2-y1)/2,1)+')','Halves the differences instead of averaging.'),W('('+F.n(x1+x2,0)+', '+F.n(y1+y2,0)+')','Forgets to halve.'),W('('+F.n(my,1)+', '+F.n(mx,1)+')','Swaps x and y.'),W('('+F.n(mx,1)+', '+F.n(-my,1)+')','Sign slip on y.'),W('('+F.n(-mx,1)+', '+F.n(my,1)+')','Sign slip on x.')]; }
    else { stem='M = '+'('+F.n((x1+x2)/2,1)+', '+F.n((y1+y2)/2,1)+') is the midpoint of segment PQ, and P = '+P+'. What are the coordinates of Q?';
      c=W(Q,'Q = 2M &minus; P = ('+F.n(x2,0)+', '+F.n(y2,0)+').');
      wrong=[W('('+F.n((x1+(x1+x2)/2)/2,1)+', '+F.n((y1+(y1+y2)/2)/2,1)+')','Averages P and M instead of extending past M.'),W('('+F.n(x1-(x2-x1),0)+', '+F.n(y1-(y2-y1),0)+')','Extends the wrong way, past P.'),W('('+F.n(y2,0)+', '+F.n(x2,0)+')','Swaps the coordinates.'),W('('+F.n((x1+x2)/2+x1,1)+', '+F.n((y1+y2)/2+y1,1)+')','Adds M and P.'),W('('+F.n(-x2,0)+', '+F.n(-y2,0)+')','Sign slip.')]; }
    return {b:tb(t,-0.6,0.1,0.7), stem:stem, correct:c, wrong:wrong,
      fast: ask==='dist' ? 'Find the two gaps ('+tr[0]+' and '+tr[1]+') and recognise the triple.' : ask==='mid' ? 'Average each coordinate.' : 'Step from P to M, then take the same step again.',
      p:{x1:x1,y1:y1,x2:x2,y2:y2,ask:ask}};
  },
  verify:function(q){
    var p=q.p, t=GEN.F.plain(q.opts[q.ans]);
    if(p.ask==='dist') return close(GEN.numOf(q.opts[q.ans]),Math.hypot(p.x2-p.x1,p.y2-p.y1));
    var m=t.match(/\((-?[\d.]+), (-?[\d.]+)\)/); if(!m) return false;
    if(p.ask==='mid') return close(+m[1],(p.x1+p.x2)/2) && close(+m[2],(p.y1+p.y2)/2);
    return close(+m[1],p.x2) && close(+m[2],p.y2);
  }
});

/* ---------- a point against a line (QC) ---------- */
GEN.add({
  id:'gq.coord.qcline', topic:'gq.coord', type:'qc', n:27, trick:'g.qc.strip',
  make:function(r,k){
    /* two fixed numbers: A, B or equal, never D */
    var want=k%3, m=r.intNot(-4,4,[0]), c=r.int(-6,6), px=r.int(-5,5);
    var onLine=m*px+c, pts, pre, qa, qb, reason;
    function ln(){ return 'y = '+(m===1?'':m===-1?'&minus;':F.n(m,0))+'x'+(c>0?' + '+c:c<0?' &minus; '+(-c):''); }
    var off = want===0 ? r.int(1,5) : want===1 ? -r.int(1,5) : 0;
    var py=onLine+off;
    pre='Line &ell; has equation '+ln()+'. Point P is ('+F.n(px,0)+', '+F.n(py,0)+').';
    qa='The y-coordinate of P'; qb='The y-coordinate of the point on &ell; with x = '+F.n(px,0);
    pts=[{a:py, b:onLine, s:''}];
    reason='At x = '+px+' the line gives y = '+F.n(onLine,0)+'; P has y = '+F.n(py,0)+'.';
    var d=GEN.qc(pts, reason);
    if(d.ans!==want) return null;
    return {type:'qc', b:[0.2,0.2,0.4,0.8][want], pre:pre, qa:qa, qb:qb, ans:d.ans, why:d.why,
      fast:'Plug x = '+px+' into the line: '+F.n(onLine,0)+'. Compare with '+F.n(py,0)+'.', p:{m:m,c:c,px:px,py:py}};
  },
  verify:function(q){ var p=q.p, on=p.m*p.px+p.c, c=p.py===on?2:p.py>on?0:1; return c===q.ans; }
});

/* ---------- a line through a region, with D (QC) ---------- */
GEN.add({
  id:'gq.coord.qcslope', topic:'gq.coord', type:'qc', n:24, trick:'g.qc.plug',
  make:function(r,k){
    /* the slope can never be exactly 0 here, so the classes are A, B and D */
    var want=[0,1,3][k%3], x0=r.int(1,6), y0=r.int(1,6), cond, slopes, B=0;
    if(want===0){ cond='its x-intercept is less than 0'; slopes=[0.1,0.5,2,9]; }                   /* reaching the axis to the left: rising */
    else if(want===1){ cond='its x-intercept is greater than '+x0; slopes=[-0.2,-1,-5,-50]; }      /* reaching the axis to the right: falling */
    else { cond='its x-intercept is not equal to '+x0; slopes=[-2,-0.5,0.5,3]; }
    var pts=slopes.map(function(s){
      var xi=x0-y0/s;
      return {a:s, b:B, s:'slope '+F.n(s,2)+' (x-intercept '+F.n(xi,2)+')', xi:xi};
    }).filter(function(p){
      if(want===0) return p.xi<0; if(want===1) return p.xi>x0; return Math.abs(p.xi-x0)>1e-9;
    });
    if(pts.length<2) return null;
    var d=GEN.qc(pts, want===0?'The point ('+x0+', '+y0+') is above the axis; to meet the axis left of the origin the line must rise to the right, so its slope is positive.'
      : want===1?'To meet the x-axis to the right of x = '+x0+', the line must fall from ('+x0+', '+y0+'), so its slope is negative.'
      : 'The line can meet the x-axis on either side of x = '+x0+', so its slope can be positive or negative.');
    if(!d||d.ans!==want) return null;
    return {type:'qc', b:[0.8,0.8,0,1.1][want], pre:'Line k passes through the point ('+x0+', '+y0+'), and '+cond+'.',
      qa:'The slope of line k', qb:'0', ans:d.ans, why:d.why,
      fast:'Sketch it: the point is above the x-axis. Heading right to the axis means going down (negative slope); heading left means going up (positive).',
      p:{x0:x0,y0:y0,want:want}};
  },
  verify:function(q){
    var p=q.p, pts=[];
    for(var s=-20; s<=20; s+=0.25){ if(s===0) continue; var xi=p.x0-p.y0/s;
      var ok = p.want===0 ? xi<0 : p.want===1 ? xi>p.x0 : Math.abs(xi-p.x0)>1e-9;
      if(ok) pts.push({a:s,b:0}); }
    return GEN.qc(pts,'').ans===q.ans;
  }
});

})();
