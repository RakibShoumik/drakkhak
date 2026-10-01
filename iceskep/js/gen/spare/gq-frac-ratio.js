/* ===========================================================
   GEN - GRE quant: fractions, decimals and percents (gq.frac)

     gq.frac.ofpct    percent of a percent, and undoing one        mc
     gq.frac.undo     reversing a percent change                   mc
     gq.frac.qcmore   percent more / less than, different bases    qc
     gq.frac.change   percent change between two values           mc
     gq.frac.mixed    mixed-number arithmetic                      ne
     gq.frac.qcord    comparing fractions and decimals             qc
     gq.frac.rest     part-of-the-remainder chains                 mc
     gq.frac.recur    repeating decimals, fraction conversion      ms

   Ratio templates live in gq-frac-ratio-2.js.
   =========================================================== */
(function(){
var F=GEN.F;

/* ---------- shared helpers ---------- */
function bOf(r, tier, c){
  var u=r.next(), x=(c===undefined?0.5:c)*0.6+u*0.4;
  var lo= tier==='warm'?-0.9: tier==='exam'?-0.3:0.6;
  var hi= tier==='warm'?-0.4: tier==='exam'?0.5:1.4;
  return Math.round((lo+(hi-lo)*x)*100)/100;
}
function isInt(x){ return typeof x==='number' && isFinite(x) && Math.abs(x-Math.round(x))<1e-9; }
function clean(x, dp){ if(typeof x!=='number' || !isFinite(x)) return false; var m=Math.pow(10,dp); return Math.abs(x*m-Math.round(x*m))<1e-6; }
/* a positive whole number as an option, or null so the mistake is skipped */
function wh(x){ return (x>0 && isInt(x)) ? F.n(Math.round(x),0) : null; }
function cash(x){ return (x>0 && clean(x,2)) ? F.money(Math.round(x*100)/100) : null; }
function cash0(x){ return (x>0 && isInt(x)) ? F.money(Math.round(x),'$',0) : null; }
/* a positive percent: two decimals at most, or a mixed number over a small denominator */
function pctS(x){
  if(typeof x!=='number' || !isFinite(x) || x<=1e-9) return null;
  if(clean(x,2)) return F.pct(Math.round(x*100)/100,2);
  var ds=[3,6,7,9,11,12], i;
  for(i=0;i<ds.length;i++){
    var v=x*ds[i];
    if(Math.abs(v-Math.round(v))<1e-6){
      var nn=Math.round(v), w=Math.floor(nn/ds[i]), m=nn%ds[i], g=F.gcd(m,ds[i]);
      return (w? w+' ' : '')+(m/g)+'/'+(ds[i]/g)+'%';
    }
  }
  return null;
}
/* the number an option shows, including mixed numbers like "33 1/3%" */
function valOf(s){
  var t=F.plain(s).replace(/[$,%]|tk\s*/g,'').replace(/[a-z]+/g,'').replace(/\s+/g,' ').trim();
  var m=t.match(/^(-?)(\d+) (\d+)\/(\d+)$/);
  if(m) return (m[1]?-1:1)*(parseInt(m[2],10)+parseInt(m[3],10)/parseInt(m[4],10));
  m=t.match(/^(-?\d+)\/(\d+)$/);
  if(m) return parseInt(m[1],10)/parseInt(m[2],10);
  if(/^-?\d*\.?\d+$/.test(t)) return parseFloat(t);
  return NaN;
}
function near(a,b,tol){ return Math.abs(a-b)<=(tol||1e-6)*Math.max(1,Math.abs(b)); }
/* exact rationals */
function R(n,d){ if(d<0){ n=-n; d=-d; } var g=F.gcd(n,d); return {n:n/g, d:d/g}; }
function radd(a,b){ return R(a.n*b.d+b.n*a.d, a.d*b.d); }
function rsub(a,b){ return R(a.n*b.d-b.n*a.d, a.d*b.d); }
function rmul(a,b){ return R(a.n*b.n, a.d*b.d); }
function rdiv(a,b){ return R(a.n*b.d, a.d*b.n); }
function fs(a){ return F.frac(a.n,a.d); }
function mixS(a){
  if(a.d===1) return F.n(a.n,0);
  var neg=a.n<0, nn=Math.abs(a.n), w=Math.floor(nn/a.d), m=nn%a.d;
  return (neg?'&minus;':'')+(w? w+' ' : '')+m+'/'+a.d;
}
/* the friendly fraction behind a percent, when there is one */
function pfrac(p){ var g=F.gcd(Math.round(p*10),1000), d=1000/g; return d<=12 && isInt(p*10) ? F.frac(Math.round(p*10),1000) : null; }
/* quantitative comparison: the class a set of [A,B] value pairs proves */
function qcOf(pairs){
  var pos=0,neg=0,zero=0,i;
  for(i=0;i<pairs.length;i++){
    var a=pairs[i][0], b=pairs[i][1], d=a-b, tol=1e-9*Math.max(1,Math.abs(a),Math.abs(b));
    if(Math.abs(d)<=tol) zero++; else if(d>0) pos++; else neg++;
  }
  if(!pairs.length) return -1;
  return pos&&!neg&&!zero?0 : neg&&!pos&&!zero?1 : zero&&!pos&&!neg?2 : 3;
}
function between(lo, hi, steps){
  var out=[], i;
  for(i=1;i<steps;i++) out.push(lo+(hi-lo)*i/steps);
  out.push(lo+(hi-lo)*1e-4, hi-(hi-lo)*1e-4);
  return out;
}

/* ---------------------------------------------------------------
   Percent of a percent
   --------------------------------------------------------------- */
var OF_CTX=[
  {t:function(N,p,q){ return 'A company has '+F.n(N,0)+' employees. Of these, '+p+'% work remotely, and '+q+'% of the remote workers live outside the country. How many of the company&rsquo;s employees are remote workers living outside the country?'; },
   money:false, comp:'remote workers who live inside the country', other:'employees who do not work remotely'},
  {t:function(N,p,q){ return 'In a survey of '+F.n(N,0)+' voters, '+p+'% said they had heard of a proposed transit plan. Of the voters who had heard of it, '+q+'% said they support it. How many of the voters surveyed support the plan?'; },
   money:false, comp:'voters who had heard of the plan but do not support it', other:'voters who had not heard of the plan'},
  {t:function(N,p,q){ return 'A charity raised '+F.money(N,'$',0)+'. It spent '+p+'% of the money on its school program, and '+q+'% of the school-program money paid for textbooks. How much was spent on textbooks?'; },
   money:true, comp:'school-program money not spent on textbooks', other:'money spent outside the school program'},
  {t:function(N,p,q){ return 'A school has '+F.n(N,0)+' students. Exactly '+p+'% of the students play a team sport, and '+q+'% of the students who play a team sport play cricket. How many students play cricket?'; },
   money:false, comp:'team-sport players who do not play cricket', other:'students who play no team sport'}
];
var OF_LINK=[
  function(p,q){ return 'If <i>x</i> is '+p+'% of <i>y</i>, and <i>y</i> is '+q+'% of <i>z</i>, then <i>x</i> is what percent of <i>z</i>?'; },
  function(p,q){ return 'The population of town A is '+p+'% of the population of town B, and the population of town B is '+q+'% of the population of town C. The population of town A is what percent of the population of town C?'; },
  function(p,q){ return 'A laptop costs '+p+'% as much as a television, and the television costs '+q+'% as much as a sofa. The price of the laptop is what percent of the price of the sofa?'; }
];
GEN.add({
  id:'gq.frac.ofpct', topic:'gq.frac', n:22, trick:'g.pick.100',
  make:function(r, k, n){
    var tier=r.tier(k,n), kind, p, q, s, N, ans, W, stem, fast, b, cor;
    kind = tier==='warm' ? 'count' : tier==='exam' ? r.pick(['count','count','count','link','link']) : r.pick(['link3','back','same','link']);

    if(kind==='count'){
      N=r.pick(tier==='warm'?[400,500,800,1000,1200,2000]:[1200,1500,1600,2400,2500,3200,3600,4000,4800,7500]);
      p=r.pick(tier==='warm'?[10,20,25,40,50,60]:[12,15,24,35,36,45,55,64,72,85]);
      q=r.pick(tier==='warm'?[10,20,25,50,80]:[15,25,35,40,45,60,65,85]);
      if(p===q) return null;
      ans=N*p*q/10000; if(!isInt(ans)) return null;
      var bare = tier==='warm' && r.chance(0.5), cx = bare ? null : r.pick(OF_CTX);
      var money = !!(cx && cx.money);
      var fmt = money ? cash0 : wh, show=function(x){ return money ? F.money(x,'$',0) : F.n(x,0); };
      var g1=N*p/100;
      stem = bare ? 'What is '+p+'% of '+q+'% of '+F.n(N,0)+'?' : cx.t(N,p,q);
      cor={t:show(ans), why:F.n(p/100,2)+' &times; '+F.n(q/100,2)+' &times; '+F.n(N,0)+' = '+show(ans)+'.'};
      W=[
        {t:fmt(N*(p+q)/100), why:'Adds the percents, '+p+' + '+q+' = '+(p+q)+'%, and takes that of all '+F.n(N,0)+'. The '+q+'% is a share of a smaller group.'},
        {t:fmt(N*p*(100-q)/10000), why: bare ? 'Reads &ldquo;'+q+'% of&rdquo; as &ldquo;'+q+'% off&rdquo;, so takes '+p+'% of '+(100-q)+'% of '+F.n(N,0)+'.'
                                             : 'Counts the '+cx.comp+' &mdash; the other '+(100-q)+'% of the group.'},
        {t:fmt(N*q/100), why:'Takes '+q+'% of all '+F.n(N,0)+' instead of '+q+'% of the '+F.n(g1,2)+' in the group.'},
        {t:fmt(g1), why:'Stops after one step: '+p+'% of '+F.n(N,0)+' is '+F.n(g1,2)+', and '+q+'% of that is still to be taken.'},
        {t:fmt(ans*10), why:'Decimal slip: '+F.n(p/100,2)+' &times; '+F.n(q/100,2)+' is '+F.n(p*q/10000,4)+', not '+F.n(p*q/1000,4)+'.'},
        {t:fmt(N*(100-p)*q/10000), why: bare ? 'Takes '+q+'% of the wrong part: the '+(100-p)+'% of '+F.n(N,0)+' that is left over.'
                                             : 'Applies '+q+'% to the '+cx.other+' ('+(100-p)+'% of the total).'},
        {t:fmt(N*Math.abs(p-q)/100), why:'Subtracts the percents ('+Math.abs(p-q)+'%) and takes that of the total.'}
      ];
      var fr=pfrac(q)||pfrac(p);
      fast='One chain, no running totals: '+F.n(N,0)+' &times; '+F.n(p/100,2)+' &times; '+F.n(q/100,2)+'.'+
           (fr ? ' Use the friendly factor first: '+(pfrac(q)?q:p)+'% is '+fr+'.' : ' Multiply the decimals ('+F.n(p*q/10000,4)+') before touching '+F.n(N,0)+'.');
      b = tier==='warm' ? bOf(r,'warm') : bOf(r,'exam',0.2);
      return {b:b, stem:stem, correct:cor, wrong:W, fast:fast, p:{kind:kind, N:N, p:p, q:q}};
    }

    if(kind==='link'){
      p=r.pick(tier==='hard'?[40,60,75,80,120,125,150,160,250]:[20,25,40,50,60,75,80]);
      q=r.pick(tier==='hard'?[30,45,64,80,120,140,150,175,240]:[20,25,30,40,50,60,80]);
      if(p===q) return null;
      ans=p*q/100; if(!clean(ans,1) || ans===p || ans===q) return null;
      stem=r.pick(OF_LINK)(p,q);
      cor={t:pctS(ans), why:'Chain the decimals: '+F.n(p/100,2)+' &times; '+F.n(q/100,2)+' = '+F.n(ans/100,4)+', which is '+pctS(ans)+'.'};
      W=[
        {t:pctS(p+q), why:'Adds the percents ('+p+' + '+q+'). A percent of a percent multiplies.'},
        {t:pctS(100*p/q), why:'Divides '+p+' by '+q+' instead of multiplying the two percents.'},
        {t:pctS(1000000/(p*q)), why:'Answers the reverse question: the last quantity as a percent of the first.'},
        {t:pctS(100*q/p), why:'Divides '+q+' by '+p+' instead of multiplying the two percents.'},
        {t:pctS(Math.abs(p-q)), why:'Subtracts the percents ('+Math.max(p,q)+' &minus; '+Math.min(p,q)+').'},
        {t:pctS(p*q), why:'Multiplies '+p+' &times; '+q+' = '+(p*q)+' but never divides by 100 again.'},
        {t:pctS(ans*10), why:'Decimal slip: '+F.n(p/100,2)+' &times; '+F.n(q/100,2)+' is '+F.n(ans/100,4)+', not '+F.n(ans/10,4)+'.'}
      ];
      fast='Set the last quantity to 100. Then the middle one is '+F.n(q,2)+' and the first is '+F.n(p/100,2)+' &times; '+F.n(q,2)+' = '+F.n(ans,2)+'. Read the percent straight off.';
      b = tier==='hard' ? bOf(r,'hard',0.15) : bOf(r,'exam',0.6);
      return {b:b, stem:stem, correct:cor, wrong:W, fast:fast, p:{kind:kind, p:p, q:q}};
    }

    if(kind==='link3'){
      p=r.pick([40,50,60,75,80,120,150]); q=r.pick([20,25,50,60]); s=r.pick([40,60,80,125,150,200]);
      var dir=r.sign(); if(dir<0 && q>=100) return null;
      ans=p*(100+dir*q)*s/10000;
      if(!clean(ans,1) || ans<=0) return null;
      var wd=dir>0?'greater':'less', mul=1+dir*q/100;
      stem = r.chance(0.5)
        ? '<i>a</i> is '+p+'% of <i>b</i>, <i>b</i> is '+q+'% '+wd+' than <i>c</i>, and <i>c</i> is '+s+'% of <i>d</i>. <i>a</i> is what percent of <i>d</i>?'
        : 'A phone costs '+p+'% of the price of a tablet. The tablet costs '+q+'% '+(dir>0?'more':'less')+' than a watch, and the watch costs '+s+'% of the price of a laptop. The phone&rsquo;s price is what percent of the laptop&rsquo;s price?';
      cor={t:pctS(ans), why:'Three multipliers: '+F.n(p/100,2)+' &times; '+F.n(mul,2)+' &times; '+F.n(s/100,2)+' = '+F.n(ans/100,4)+', so '+pctS(ans)+'.'};
      W=[
        {t:pctS(p*q*s/10000), why:'Treats &ldquo;'+q+'% '+wd+' than&rdquo; as &ldquo;'+q+'% of&rdquo;: the multiplier is '+F.n(mul,2)+', not '+F.n(q/100,2)+'.'},
        {t:pctS(p*(100-dir*q)*s/10000), why:'Applies the '+q+'% in the wrong direction (&times;'+F.n(1-dir*q/100,2)+' instead of &times;'+F.n(mul,2)+').'},
        {t:pctS(p*s/100), why:'Skips the '+q+'% step altogether.'},
        {t:pctS(p+dir*q+s), why:'Adds and subtracts the percents ('+p+(dir>0?' + ':' &minus; ')+q+' + '+s+') instead of multiplying.'},
        {t:pctS(1000000/ans), why:'Answers the reverse question: the last price as a percent of the first.'},
        {t:pctS(ans*10), why:'Decimal slip in the chain: the product is '+F.n(ans/100,4)+', not '+F.n(ans/10,4)+'.'}
      ];
      fast='Start the last item at 100 and walk backwards: '+F.n(s,2)+', then &times;'+F.n(mul,2)+' = '+F.n(s*mul,2)+', then &times;'+F.n(p/100,2)+' = '+F.n(ans,2)+'. &ldquo;'+q+'% '+wd+'&rdquo; is &times;'+F.n(mul,2)+'.';
      return {b:bOf(r,'hard',0.75), stem:stem, correct:cor, wrong:W, fast:fast, p:{kind:kind, p:p, q:q, s:s, dir:dir}};
    }

    if(kind==='back'){
      var M=r.pick([1200,1600,2000,2400,3000,3200,4000,4800,6000,8000]);
      p=r.pick([15,20,25,30,40,60,75]); q=r.intNot(0,0,[]) || r.pick([20,25,40,60,75]);
      s=r.pick([5,15,35,45,65,125,150]);
      if(p===q) return null;
      var K=M*p*q/10000; ans=M*s/100;
      if(!isInt(K) || !isInt(ans)) return null;
      stem = r.chance(0.5)
        ? p+'% of '+q+'% of a number is '+F.n(K,0)+'. What is '+s+'% of the number?'
        : 'After spending '+p+'% of a grant on equipment, a lab gave '+q+'% of the equipment money, '+F.money(K,'$',0)+', to a supplier as a deposit. What amount is '+s+'% of the whole grant?';
      var money2 = stem.indexOf('grant')>=0, f2 = money2 ? cash0 : wh, sh2=function(x){ return money2?F.money(x,'$',0):F.n(x,0); };
      cor={t:sh2(ans), why:'The number is '+F.n(K,0)+' &divide; ('+F.n(p/100,2)+' &times; '+F.n(q/100,2)+') = '+F.n(M,0)+', and '+s+'% of it is '+sh2(ans)+'.'};
      W=[
        {t:f2(M), why:'Finds the whole ('+F.n(M,0)+') and stops before taking '+s+'% of it.'},
        {t:f2(K*s/100), why:'Takes '+s+'% of '+F.n(K,0)+' instead of '+s+'% of the whole.'},
        {t:f2(K*s/(p+q)), why:'Undoes the two percents by adding them to '+(p+q)+'%; they multiply to '+F.n(p*q/100,2)+'%.'},
        {t:f2(K*s/p), why:'Undoes only the '+p+'% and leaves the '+q+'% in place.'},
        {t:f2(K*s/q), why:'Undoes only the '+q+'% and leaves the '+p+'% in place.'},
        {t:f2(ans*10), why:'Decimal slip: '+s+'% is '+F.n(s/100,2)+', not '+F.n(s/10,2)+'.'},
        {t:f2(ans/10), why:'Decimal slip: divides by 1,000 instead of 100 when taking '+s+'%.'}
      ];
      fast='Skip the whole number: '+s+'% of it is '+F.n(K,0)+' &times; '+s+' &divide; '+F.n(p*q/100,2)+' (because '+F.n(K,0)+' is '+F.n(p*q/100,2)+'% of it) = '+F.n(ans,0)+'.';
      return {b:bOf(r,'hard',0.45), stem:stem, correct:cor, wrong:W, fast:fast, p:{kind:kind, p:p, q:q, s:s, K:K}};
    }

    /* same: p% of x equals q% of y */
    var PQ=[12,15,16,20,24,25,30,32,36,40,45,48,50,60,64,75,80];
    p=r.pick(PQ); q=r.pick(PQ);
    if(q<=p) return null;
    var ratio=100*q/p; if(!clean(ratio,1) || ratio>250) return null;
    var ask=r.pick(['pct','more']), nm=r.sample(GEN.NAMES,2);
    var named=r.chance(0.5);
    var X= named ? nm[0]+'&rsquo;s savings' : '<i>x</i>', Y= named ? nm[1]+'&rsquo;s savings' : '<i>y</i>';
    stem = named
      ? p+' percent of '+nm[0]+'&rsquo;s savings equals '+q+' percent of '+nm[1]+'&rsquo;s savings. '
      : 'If '+p+'% of <i>x</i> is equal to '+q+'% of <i>y</i>, where <i>x</i> and <i>y</i> are positive, ';
    if(ask==='pct'){
      ans=ratio;
      stem += named ? nm[0]+'&rsquo;s savings are what percent of '+nm[1]+'&rsquo;s savings?' : 'then <i>x</i> is what percent of <i>y</i>?';
      cor={t:pctS(ans), why:'x/y = '+q+'/'+p+', so x is '+pctS(ans)+' of y.'};
      W=[
        {t:pctS(100*p/q), why:'Flips the ratio: the smaller percent goes with the larger amount, so x/y = '+q+'/'+p+', not '+p+'/'+q+'.'},
        {t:pctS(100+q-p), why:'Adds the gap between the percents ('+(q-p)+') to 100.'},
        {t:pctS(100*(q-p)/p), why:'Gives how much greater x is than y, not x as a percent of y.'},
        {t:pctS(p*q/100), why:'Multiplies the percents as if it were a percent of a percent.'},
        {t:pctS(100*(q-p)/q), why:'Divides the gap '+(q-p)+' by '+q+'; that is not a ratio of x to y.'}
      ];
    } else {
      ans=ratio-100;
      stem += named ? 'By what percent are '+nm[0]+'&rsquo;s savings greater than '+nm[1]+'&rsquo;s?' : 'then <i>x</i> is what percent greater than <i>y</i>?';
      cor={t:pctS(ans), why:'x/y = '+q+'/'+p+' = '+F.n(ratio/100,4)+', so x is '+pctS(ans)+' greater.'};
      W=[
        {t:pctS(100*(q-p)/q), why:'Measures the gap against x instead of y: that is the percent by which y is less than x.'},
        {t:pctS(q-p), why:'Subtracts the percents ('+q+' &minus; '+p+'), which ignores that they are of different amounts.'},
        {t:pctS(ratio), why:'Gives x as a percent of y, not how much greater it is.'},
        {t:pctS(100*p/q), why:'Flips the ratio: the smaller percent goes with the larger amount.'},
        {t:pctS(100-100*p/q), why:'Flips the ratio and then measures the shortfall.'}
      ];
    }
    fast='Equal amounts: '+F.n(p/100,2)+'x = '+F.n(q/100,2)+'y, so x/y = '+q+'/'+p+' = '+F.n(ratio/100,4)+'. The smaller percent must belong to the bigger number.';
    return {b:bOf(r,'hard',ask==='more'?0.7:0.4), stem:stem, correct:cor, wrong:W, fast:fast, p:{kind:'same', p:p, q:q, ask:ask}};
  },
  verify:function(q){
    var p=q.p, v=valOf(q.opts[q.ans]), want;
    if(p.kind==='count') want=(p.N/100*p.q)/100*p.p;
    else if(p.kind==='link'){ var z=1000, y=z*p.q/100, x=y*p.p/100; want=100*x/z; }
    else if(p.kind==='link3'){ var w=1000, c=w*p.s/100, bb=c+c*p.dir*p.q/100, a=bb*p.p/100; want=100*a/w; }
    else if(p.kind==='back'){ var whole=p.K/(p.q/100)/(p.p/100); want=whole*p.s/100; }
    else { var yy=240, xx=(p.q/100*yy)/(p.p/100); want= p.ask==='pct' ? 100*xx/yy : 100*(xx-yy)/yy; }
    return near(v, want, 1e-6);
  }
});

/* ---------------------------------------------------------------
   Reversing a percent change
   --------------------------------------------------------------- */
GEN.add({
  id:'gq.frac.undo', topic:'gq.frac', n:22, trick:'g.pct.mult',
  make:function(r, k, n){
    var tier=r.tier(k,n), kind, O, p, Fv, stem, W, cor, fast;
    kind = tier==='warm' ? r.pick(['disc','rise']) : tier==='exam' ? r.pick(['disc','rise','rise']) : r.pick(['two','two','profit']);

    if(kind==='disc'){
      O=r.pick([48,60,64,72,80,96,120,125,140,160,180,200,240,250,320,360,400,450,480,640,800]);
      p=r.pick(tier==='warm'?[10,20,25,50]:[15,20,25,30,35,40,60,75]);
      Fv=O*(100-p)/100; if(!clean(Fv,2)) return null;
      var m=F.money(Fv);
      stem=r.pick([
        'During a sale, a jacket is marked '+p+'% off its original price and now sells for '+m+'. What was the original price?',
        'After a '+p+'% discount, a desk lamp costs '+m+'. What was the price of the lamp before the discount?',
        'A share price fell '+p+'% in one week, closing at '+m+'. What was the price at the start of the week?',
        'An online course costs '+m+' after a '+p+'% scholarship is applied to the full fee. What is the full fee?'
      ]);
      cor={t:F.money(O), why:m+' is the '+(100-p)+'% that remains, so the original is '+m+' &divide; '+F.n(1-p/100,2)+' = '+F.money(O)+'.'};
      W=[
        {t:cash(Fv*(100+p)/100), why:'Adds '+p+'% of '+m+' back on. The '+p+'% was taken of the original price, which is larger than '+m+'.'},
        {t:cash(Fv*100/(100+p)), why:'Divides by '+F.n(1+p/100,2)+', as if the price had risen '+p+'%; undoing a fall means dividing by '+F.n(1-p/100,2)+'.'},
        {t:cash(Fv*(100-p)/100), why:'Takes the '+p+'% off a second time.'},
        {t:cash(O-Fv), why:'That is the size of the discount ('+p+'% of the original), not the original price.'},
        {t:cash(Fv*100/p), why:'Divides by '+F.n(p/100,2)+', the share taken off, instead of by '+F.n(1-p/100,2)+', the share still paid.'},
        {t:cash(Fv+p), why:'Adds '+p+' dollars back, treating the percent as a dollar amount.'}
      ];
      fast=m+' is '+(100-p)+'% of the original, so divide by '+F.n(1-p/100,2)+(pfrac(100-p)?' &mdash; that is, multiply by the flip of '+pfrac(100-p):'')+'. Check: '+F.money(O)+' &times; '+F.n(1-p/100,2)+' = '+m+'.';
      return {b:bOf(r,tier,0.3), stem:stem, correct:cor, wrong:W, fast:fast, p:{kind:kind, p:p, F:Fv}};
    }

    if(kind==='rise'){
      O=r.pick([400,480,560,640,720,800,960,1200,1500,1600,2000,2400,2500,3200,4000,4800,6400]);
      p=r.pick(tier==='warm'?[10,20,25,50]:[5,8,12,15,20,25,30,35,40,60]);
      Fv=O*(100+p)/100; if(!isInt(Fv)) return null;
      var cx=r.pick(['rent','pop','units','bill']), money=(cx==='rent'||cx==='bill');
      if(cx==='pop'){ O*=10; Fv*=10; }
      var show=function(x){ return money? F.money(x,'$',0) : F.n(x,0); };
      var fm = money ? cash0 : wh;
      var S=show(Fv);
      stem = cx==='rent' ? 'After a '+p+'% increase, the monthly rent on an apartment is '+S+'. What was the monthly rent before the increase?'
           : cx==='pop' ? 'The population of a town grew by '+p+'% over ten years to '+S+'. What was the population at the start of the ten years?'
           : cx==='units' ? 'A factory made '+p+'% more units this year than last year. If it made '+S+' units this year, how many units did it make last year?'
           : 'A restaurant bill of '+S+' includes a '+p+'% service charge added to the price of the food. What was the price of the food?';
      cor={t:show(O), why:S+' is '+(100+p)+'% of the original, so the original is '+S+' &divide; '+F.n(1+p/100,2)+' = '+show(O)+'.'};
      W=[
        {t:fm(Fv*(100-p)/100), why:'Takes '+p+'% off '+S+'. The '+p+'% was of the old, smaller figure, so this removes too much.'},
        {t:fm(Fv*100/(100-p)), why:'Divides by '+F.n(1-p/100,2)+', as if the figure had fallen '+p+'%.'},
        {t:fm(Fv*(100+p)/100), why:'Applies the '+p+'% increase a second time.'},
        {t:fm(Fv-O), why:'That is the size of the increase, not the figure before it.'},
        {t:fm(Fv*100/p), why:'Divides by '+F.n(p/100,2)+' instead of by '+F.n(1+p/100,2)+'.'},
        {t:fm(Fv-p), why:'Subtracts '+p+' as if the percent were a plain amount.'}
      ];
      fast='New = old &times; '+F.n(1+p/100,2)+', so old = '+S+' &divide; '+F.n(1+p/100,2)+'.'+(pfrac(p)?' With '+p+'% = '+pfrac(p)+', the new figure is '+F.frac(100+p,100)+' of the old: divide by the top, multiply by the bottom.':'')+' Never subtract '+p+'% of the new figure.';
      return {b:bOf(r,tier,0.4), stem:stem, correct:cor, wrong:W, fast:fast, p:{kind:kind, p:p, F:Fv}};
    }

    if(kind==='two'){
      var C=r.pick([80,120,160,200,240,250,320,360,400,480,500,640,800,960,1200,1500,1600,2400]);
      var cxs=r.pick(['markup','coupon','stock','salary']), s1, s2, n1, n2;
      var up=r.pick([20,25,30,40,50,60,75]), dn=r.pick([10,15,20,25,30,40]), tax=r.pick([5,8,10,15]);
      if(cxs==='markup'){ s1=up; s2=-dn; n1='markup'; n2='discount'; }
      else if(cxs==='coupon'){ s1=-dn; s2=tax; n1='coupon'; n2='tax'; }
      else if(cxs==='stock'){ s1=up; s2=-dn; n1='increase'; n2='decrease'; }
      else { s1=-dn; s2=r.pick([10,15,20,25,30]); n1='cut'; n2='raise'; }
      Fv=C*(1+s1/100)*(1+s2/100);
      if(!clean(Fv,2)) return null;
      var M2=F.money(Fv);
      stem = cxs==='markup' ? 'A retailer marks up the cost of a bicycle by '+s1+'% to set its list price, then sells the bicycle at '+(-s2)+'% off the list price for '+M2+'. What did the bicycle cost the retailer?'
           : cxs==='coupon' ? 'A coupon takes '+(-s1)+'% off the price of a pair of headphones, and then a '+s2+'% sales tax is added to the reduced price. The total paid is '+M2+'. What was the price of the headphones before the coupon and the tax?'
           : cxs==='stock' ? 'The price of a share rose '+s1+'% on Monday and then fell '+(-s2)+'% on Tuesday, closing at '+M2+'. What was the price before Monday&rsquo;s rise?'
           : 'A company cut an employee&rsquo;s weekly pay by '+(-s1)+'% and later raised the reduced pay by '+s2+'%. The weekly pay is now '+M2+'. What was it before the cut?';
      var f1=1+s1/100, f2=1+s2/100, net=s1+s2;
      cor={t:F.money(C), why:'Final = original &times; '+F.n(f1,2)+' &times; '+F.n(f2,2)+' = original &times; '+F.n(f1*f2,4)+', so the original is '+M2+' &divide; '+F.n(f1*f2,4)+' = '+F.money(C)+'.'};
      W=[
        {t:cash(Fv/(1+net/100)), why:'Nets the two changes to '+(net>=0?'+':'&minus;')+Math.abs(net)+'% and undoes that. Changes on different bases multiply, they do not add.'},
        {t:cash(Fv*(1-s2/100)*(1-s1/100)), why:'Undoes each change by applying the opposite percent to the later price; each percent was of a different, earlier base.'},
        {t:cash(Fv/f1), why:'Undoes only the '+n1+' and forgets the '+n2+'.'},
        {t:cash(Fv/f2), why:'Undoes only the '+n2+' and forgets the '+n1+'.'},
        {t:cash(Fv*(1-net/100)), why:'Nets the changes to '+Math.abs(net)+'% and applies the opposite to '+M2+'.'},
        {t:Math.abs(net)<=5 ? cash(Fv) : null, why:'Assumes the '+n1+' and the '+n2+' cancel out; they are percents of different amounts.'}
      ];
      fast='One multiplier for the whole story: '+F.n(f1,2)+' &times; '+F.n(f2,2)+' = '+F.n(f1*f2,4)+'. Divide once: '+M2+' &divide; '+F.n(f1*f2,4)+'. Backsolve check: '+F.money(C)+' &rarr; '+F.money(C*f1)+' &rarr; '+M2+'.';
      return {b:bOf(r,'hard',0.4), stem:stem, correct:cor, wrong:W, fast:fast, p:{kind:kind, s1:s1, s2:s2, F:Fv}};
    }

    /* profit */
    var Cp=r.pick([40,60,80,120,160,200,240,250,320,400,500]);
    p=r.pick([20,25,30,40,50,60]);
    var p2=r.pick([10,15,35,45,55,70,75,80,90,100]);
    if(p2===p) return null;
    var S0=Cp*(1+p/100), T=Cp*(1+p2/100);
    if(!clean(S0,2) || !clean(T,2)) return null;
    var item=r.pick(['lamp','rug','wall clock','kettle','backpack']);
    stem = r.chance(0.5)
      ? 'A shopkeeper sells a '+item+' for '+F.money(S0)+' and makes a profit of '+p+'% on the cost. If the '+item+' were sold for '+F.money(T)+' instead, what would the profit be, as a percent of the cost?'
      : 'Selling a '+item+' for '+F.money(S0)+' earns a trader a '+p+'% profit on cost. What percent profit on cost would the trader earn by selling it for '+F.money(T)+'?';
    var Cw=S0*(1-p/100);
    cor={t:pctS(p2), why:'Cost = '+F.money(S0)+' &divide; '+F.n(1+p/100,2)+' = '+F.money(Cp)+'. Profit at '+F.money(T)+' is '+F.money(T-Cp)+', which is '+pctS(p2)+' of '+F.money(Cp)+'.'};
    W=[
      {t:pctS(p+100*(T-S0)/S0), why:'Adds the '+F.n(100*(T-S0)/S0,2)+'% change in selling price to the old '+p+'%; both profits must be measured on the cost.'},
      {t:pctS(100*(T-Cp)/T), why:'Measures the profit against the selling price '+F.money(T)+' instead of the cost '+F.money(Cp)+'.'},
      {t:pctS(100*(T-S0)/S0), why:'Gives only the percent change in the selling price.'},
      {t:pctS(p2-p), why:'Finds only the extra profit, '+(p2-p)+'% of cost, and forgets the original '+p+'%.'},
      {t:pctS(100*(T-Cw)/Cw), why:'Finds the cost by taking '+p+'% off '+F.money(S0)+' ('+F.money(Cw)+'); a '+p+'% profit is undone by dividing by '+F.n(1+p/100,2)+'.'},
      {t:pctS(p*T/S0), why:'Scales the '+p+'% by the ratio of the prices, as if profit percent were proportional to price.'}
    ];
    fast='Recover the cost first: '+F.money(S0)+' &divide; '+F.n(1+p/100,2)+' = '+F.money(Cp)+'. Then '+F.money(T)+' &divide; '+F.money(Cp)+' = '+F.n(1+p2/100,2)+', so the profit is '+p2+'%.';
    return {b:bOf(r,'hard',0.7), stem:stem, correct:cor, wrong:W, fast:fast, p:{kind:'profit', p:p, S:S0, T:T}};
  },
  verify:function(q){
    var p=q.p, sat=function(v){
      if(p.kind==='disc') return near(v-v*p.p/100, p.F, 1e-7);
      if(p.kind==='rise') return near(v+v*p.p/100, p.F, 1e-7);
      if(p.kind==='two'){ var x=v+v*p.s1/100; x=x+x*p.s2/100; return near(x, p.F, 1e-7); }
      var cost=p.S; for(var i=0;i<60;i++){} cost=p.S/(1+p.p/100);
      return near(cost+cost*v/100, p.T, 1e-7);
    };
    if(!sat(valOf(q.opts[q.ans]))) return false;
    for(var i=0;i<q.opts.length;i++) if(i!==q.ans && sat(valOf(q.opts[i]))) return false;
    return true;
  }
});
})();
