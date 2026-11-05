/* ===========================================================
   GEN — GRE Quant: number properties (gq.num).
   Part 1 of 2; exponents and roots (gq.exp) are in gq-num-exp-2.js.

     gq.num.units    units digit of large powers, products, sums   mc
     gq.num.fcount   positive-divisor counts from the exponents     mc
     gq.num.divdig   divisibility tests and digit sums              ms
     gq.num.lcmgcd   LCM / GCD word problems                        mc
     gq.num.consec   consecutive integers and evenly spaced sums    mc
     gq.num.qcint    parity, sign and consecutive-integer QC        qc
     gq.num.primes   primes in a range, prime factors               ne
     gq.num.qcfac    factorial zeros, prime powers in n!, divisors  qc

   Every key is computed; every verify() recomputes it by brute force.
   =========================================================== */
(function(){
var F=GEN.F;

/* ---------- shared helpers ---------- */
var BAND={warm:[-0.9,-0.4], exam:[-0.3,0.5], hard:[0.6,1.4]};
/* a difficulty inside the tier's band; w (0..1) says how far up the band */
function bOf(r, tier, w){
  var lo=BAND[tier][0], hi=BAND[tier][1];
  if(w===undefined) w=0.5;
  var v=lo+(hi-lo)*(0.15+0.7*w)+(r.next()-0.5)*0.25*(hi-lo);
  v=Math.max(lo, Math.min(hi, v));
  return Math.round(v*20)/20;
}
function S(x){ return String(x); }
function nm(x){ return F.n(x,0); }
function isPrime(n){ if(n<2) return false; if(n%2===0) return n===2; for(var i=3;i*i<=n;i+=2) if(n%i===0) return false; return true; }
function mod(a,m){ return ((a%m)+m)%m; }
function factor(n){ var f={}, p=2; while(p*p<=n){ while(n%p===0){ f[p]=(f[p]||0)+1; n/=p; } p++; } if(n>1) f[n]=(f[n]||0)+1; return f; }
function primesOf(n){ return Object.keys(factor(n)).map(Number).sort(function(a,b){ return a-b; }); }
function pfText(n){
  var f=factor(n);
  return primesOf(n).map(function(p){ return f[p]===1 ? S(p) : F.pow(p,f[p]); }).join(' &times; ');
}
function dcountF(n){ var f=factor(n), t=1; for(var p in f) t*=f[p]+1; return t; }
function dcountB(n){ var c=0; for(var i=1;i*i<=n;i++) if(n%i===0) c+=(i*i===n?1:2); return c; }
function uniq(a){ var o=[]; a.forEach(function(x){ if(o.indexOf(x)<0) o.push(x); }); return o; }
function sortN(a){ return a.slice().sort(function(x,y){ return x-y; }); }
function fmtV(v){ return Math.abs(v-Math.round(v))<1e-9 ? F.n(v,0) : F.n(v,3); }

/* ---------- quantitative comparison engine ----------
   A family instance supplies the allowed points, the two quantities as
   functions, and text. The class is PROVEN by evaluating every allowed
   point, never asserted. */
function qcProve(pts, A, B){
  var pos=0, neg=0, zero=0, w={}, i;
  for(i=0;i<pts.length;i++){
    var a=A(pts[i]), b=B(pts[i]);
    if(typeof a!=='number' || typeof b!=='number' || !isFinite(a) || !isFinite(b)) continue;
    var d=a-b, tol=1e-9*Math.max(1, Math.abs(a), Math.abs(b)), c={pt:pts[i], a:a, b:b};
    if(Math.abs(d)<=tol){ zero++; if(!w.z) w.z=c; }
    else if(d>0){ pos++; if(!w.a) w.a=c; }
    else { neg++; if(!w.b) w.b=c; }
  }
  if(!(pos+neg+zero)) return null;
  var cls = pos&&!neg&&!zero ? 0 : neg&&!pos&&!zero ? 1 : zero&&!pos&&!neg ? 2 : 3;
  return {c:cls, w:w, first:pointClass(pts, A, B)};
}
function pointClass(pts, A, B){
  for(var i=0;i<pts.length;i++){
    var a=A(pts[i]), b=B(pts[i]);
    if(!isFinite(a) || !isFinite(b)) continue;
    var tol=1e-9*Math.max(1, Math.abs(a), Math.abs(b));
    return {pt:pts[i], a:a, b:b, c: Math.abs(a-b)<=tol ? 2 : a>b ? 0 : 1};
  }
  return null;
}
var NEVER=['A is never the larger here','B is never the larger here','The two are never equal here'];
/* four why-lines: the right one, the planted trap, and a named reason for the rest */
function qcWhy(ans, pr, always, wt, trap){
  var w=pr.w, out=[], o, line;
  var cases=[w.a,w.b,w.z].filter(Boolean);
  for(o=0;o<4;o++){
    if(o===ans) line = ans===3 ? 'Right. '+wt(cases[0])+', but '+wt(cases[1])+'. Two allowed cases disagree.' : 'Right. '+always;
    else if(trap && trap.o===o) line=trap.t;
    else if(ans===3) line='Only sometimes: '+wt(o===0 ? (w.b||w.z) : o===1 ? (w.a||w.z) : (w.a||w.b))+'.';
    else if(o===3) line='It is determined. '+always+' No allowed case breaks that.';
    else line=NEVER[o]+'. '+always;
    out.push(line);
  }
  return out;
}
/* the classic D trap: stopping after the first case that comes to mind */
function oneCase(pr, wt){
  var f=pr.first, w=pr.w;
  if(!f) return null;
  var other = f.c===0 ? (w.b||w.z) : f.c===1 ? (w.a||w.z) : (w.a||w.b);
  if(!other) return null;
  return {o:f.c, t:'Stops after one case: '+wt(f)+', but '+wt(other)+'.'};
}
function valTxt(c, names){
  return names(c.pt)+' gives A = '+fmtV(c.a)+' and B = '+fmtV(c.b);
}

/* ===============================================================
   1. Units digit of large powers, products, sums and differences
   =============================================================== */
var CYC={0:[0,0,0,0],1:[1,1,1,1],2:[2,4,8,6],3:[3,9,7,1],4:[4,6,4,6],5:[5,5,5,5],
         6:[6,6,6,6],7:[7,9,3,1],8:[8,4,2,6],9:[9,1,9,1]};
function ud(base,e){ return e===0 ? 1 : CYC[base%10][(e-1)%4]; }
function cycWords(d){
  var c=CYC[d];
  if(d===4||d===9) return 'powers of '+d+' end in '+c[0]+', '+c[1]+', repeating every 2';
  if([0,1,5,6].indexOf(d)>=0) return 'powers of '+d+' always end in '+d;
  return 'powers of '+d+' end in '+c.join(', ')+', repeating every 4';
}
function posWords(base,e){
  var d=base%10, rem=e%4, v=ud(base,e);
  if([0,1,5,6].indexOf(d)>=0) return F.pow(base,e)+' ends in '+d;
  if(d===4||d===9) return e+' is '+(e%2?'odd':'even')+', so '+F.pow(base,e)+' ends in '+v;
  return e+' = 4 &times; '+Math.floor(e/4)+' + '+rem+(rem===0?' (remainder 0 means the 4th entry)':'')+
         ', so '+F.pow(base,e)+' ends in '+v;
}
/* one place forward / back in the cycle, the common counting slips */
function udFwd(base,e){ return CYC[base%10][e%4]; }
function udBack(base,e){ return CYC[base%10][(e+2)%4]; }
function udZero(base,e){ return e%4===0 ? CYC[base%10][0] : null; }
function udLoop(base,e){ var v=1, d=base%10; for(var i=0;i<e;i++) v=(v*d)%10; return v; }

var UNIT_ASK=[
  function(x){ return 'What is the units digit of '+x+'?'; },
  function(x){ return 'When '+x+' is written out in full, what is its last digit?'; },
  function(x){ return 'What is the remainder when '+x+' is divided by 10?'; },
  function(x){ return 'Which digit is in the ones place of '+x+'?'; }
];
function twoDig(r, ds){ return 10*r.int(1,9)+r.pick(ds); }

GEN.add({
  id:'gq.num.units', topic:'gq.num', n:20, trick:'g.num.unit',
  make:function(r, k, n){
    var tier=r.tier(k,n), kind;
    if(tier==='warm') kind='one';
    else if(tier==='exam') kind=r.pick(['prod','sum','tower']);
    else kind=r.pick(['diff','tri','series','mixed']);
    var ask=r.pick(UNIT_ASK), expr, ans, wrong=[], fast, why, t=[], p;
    function W(v, txt){ if(v!==null && v!==undefined && v>=0 && v<=9) wrong.push({t:S(v), why:txt}); }

    if(kind==='one'){
      var b=twoDig(r,[2,3,7,8]), e=r.int(21,99);
      t=[[b,e]]; ans=ud(b,e); expr=F.pow(b,e);
      why=cycWords(b%10)+'; '+posWords(b,e)+'.';
      W(udFwd(b,e), 'Goes one place too far round the cycle '+CYC[b%10].join(', ')+'.');
      W(udZero(b,e), 'Reads remainder 0 as the 1st entry; '+e+' is a multiple of 4, which means the 4th entry, '+CYC[b%10][3]+'.');
      W(udBack(b,e), 'Stops one place short in the cycle '+CYC[b%10].join(', ')+'.');
      W(e%10 ? ud(b%10, e%10) : null, 'Uses the last digit of the exponent, '+(e%10)+'. The cycle has length 4, not 10.');
      W((b%10)*e%10, 'Multiplies '+(b%10)+' by '+e+' instead of raising it to that power.');
      W(b%10, 'Assumes the units digit stays '+(b%10)+'; '+cycWords(b%10)+'.');
      W(e%4, 'Gives the remainder of '+e+' &divide; 4 instead of the cycle entry it points to.');
      fast='Only the 7-style last digit matters: '+cycWords(b%10)+'. '+posWords(b,e)+'.';
      fast=fast.replace('7-style ','');
    }
    else if(kind==='prod' || kind==='sum'){
      var b1=twoDig(r,[2,3,7,8]), b2=twoDig(r,[2,3,4,7,8,9]), e1=r.int(13,89), e2=r.int(13,89);
      if(b1===b2) return null;
      var u1=ud(b1,e1), u2=ud(b2,e2), op=kind==='prod'?' &times; ':' + ';
      t=[[b1,e1],[b2,e2]]; expr=F.pow(b1,e1)+op+F.pow(b2,e2);
      ans = kind==='prod' ? (u1*u2)%10 : (u1+u2)%10;
      why=posWords(b1,e1)+'; '+posWords(b2,e2)+'. '+(kind==='prod' ? u1+' &times; '+u2+' = '+(u1*u2) : u1+' + '+u2+' = '+(u1+u2))+', which ends in '+ans+'.';
      if(kind==='prod'){
        W((u1+u2)%10, 'Adds the two units digits ('+u1+' + '+u2+') instead of multiplying them.');
        W((udFwd(b1,e1)*u2)%10, 'Right for '+F.pow(b2,e2)+', but one place too far in the cycle of '+(b1%10)+'.');
        W((u1*udFwd(b2,e2))%10, 'Right for '+F.pow(b1,e1)+', but one place too far in the cycle of '+(b2%10)+'.');
        W(ud((b1*b2)%10, e1+e2), 'Multiplies the bases and adds the exponents; that rule needs a common base.');
        W(u1, 'Finds the units digit of '+F.pow(b1,e1)+' and forgets to multiply by the second factor.');
        W(((b1%10)*(b2%10))%10, 'Multiplies the last digits of the bases and ignores the exponents.');
      } else {
        W((u1*u2)%10, 'Multiplies the two units digits ('+u1+' &times; '+u2+') instead of adding them.');
        W((udFwd(b1,e1)+u2)%10, 'Right for '+F.pow(b2,e2)+', but one place too far in the cycle of '+(b1%10)+'.');
        W((u1+udFwd(b2,e2))%10, 'Right for '+F.pow(b1,e1)+', but one place too far in the cycle of '+(b2%10)+'.');
        W(((b1%10)+(b2%10))%10, 'Adds the last digits of the bases and ignores the exponents.');
        W(u1, 'Finds the units digit of '+F.pow(b1,e1)+' and drops the second term.');
        W(u2, 'Finds the units digit of '+F.pow(b2,e2)+' and drops the first term.');
      }
      W(udZero(b1,e1)!==null ? (kind==='prod' ? (udZero(b1,e1)*u2)%10 : (udZero(b1,e1)+u2)%10) : null,
        'Reads '+e1+' &divide; 4, remainder 0, as the 1st entry of the cycle instead of the 4th.');
      fast='Keep only last digits and cycles: '+posWords(b1,e1)+'; '+posWords(b2,e2)+'. Then '+
           (kind==='prod'?u1+' &times; '+u2:u1+' + '+u2)+' ends in '+ans+'.';
    }
    else if(kind==='tower'){
      var bt=twoDig(r,[2,3,7,8]), i1=r.int(3,9), i2=r.int(5,15), E=i1*i2;
      if((i1+i2)%4===E%4) return null;
      t=[[bt,i1,i2]]; ans=ud(bt,E);
      expr='('+F.pow(bt,i1)+')<sup>'+i2+'</sup>';
      why='A power of a power multiplies: the exponent is '+i1+' &times; '+i2+' = '+E+'. '+posWords(bt,E)+'.';
      W(ud(bt,i1+i2), 'Adds the exponents ('+i1+' + '+i2+' = '+(i1+i2)+'); a power of a power multiplies them.');
      W(ud(bt,i2), 'Uses only the outer exponent '+i2+'.');
      W(ud(bt,i1), 'Uses only the inner exponent '+i1+'.');
      W(udFwd(bt,E), 'Right exponent, '+E+', but one place too far round the cycle.');
      W(udZero(bt,E), 'Reads remainder 0 as the 1st entry of the cycle instead of the 4th.');
      W(ud(bt, Math.pow(i1%4||4, 1)*i2%4||4), 'Reduces only the inner exponent mod 4 and mishandles the outer power.');
      W((bt%10)*E%10, 'Multiplies '+(bt%10)+' by the exponent '+E+' instead of raising it.');
      fast='Multiply the exponents first: '+E+'. '+posWords(bt,E)+'.';
    }
    else if(kind==='diff'){
      var d1=r.int(2,9), bd1=10*d1+r.pick([2,3,7,8,4,9]), bd2=10*r.int(1,d1-1)+r.pick([2,3,7,8,4,9]);
      var ed1=r.int(30,89), ed2=r.int(12,ed1-5);
      var v1=ud(bd1,ed1), v2=ud(bd2,ed2);
      if(v1===v2) return null;
      if(v1>v2 && r.chance(0.75)) return null;               /* mostly the borrow case */
      t=[[bd1,ed1],[bd2,ed2]]; ans=(v1-v2+10)%10;
      expr=F.pow(bd1,ed1)+' &minus; '+F.pow(bd2,ed2);
      why=posWords(bd1,ed1)+'; '+posWords(bd2,ed2)+'. The first is far larger, so the result is positive and ends in '+
          (v1<v2 ? '1'+v1+' &minus; '+v2 : v1+' &minus; '+v2)+' = '+ans+'.';
      W(Math.abs(v1-v2), 'Subtracts the smaller last digit from the larger ('+Math.max(v1,v2)+' &minus; '+Math.min(v1,v2)+') and ignores the borrow.');
      W((v1+v2)%10, 'Adds the two units digits instead of subtracting.');
      W((udFwd(bd1,ed1)-v2+10)%10, 'One place too far round the cycle for '+F.pow(bd1,ed1)+'.');
      W((v1-udFwd(bd2,ed2)+10)%10, 'One place too far round the cycle for '+F.pow(bd2,ed2)+'.');
      W(ud(Math.abs(bd1-bd2)%10||10, ed1-ed2), 'Subtracts the bases and the exponents, as if '+F.pow(bd1,ed1)+' &minus; '+F.pow(bd2,ed2)+' were ('+(bd1-bd2)+')<sup>'+(ed1-ed2)+'</sup>.');
      W(v1, 'Finds the units digit of '+F.pow(bd1,ed1)+' only.');
      fast=posWords(bd1,ed1)+'; '+posWords(bd2,ed2)+'. Borrow if needed: '+(v1<v2?'1'+v1:v1)+' &minus; '+v2+' = '+ans+'.';
    }
    else if(kind==='tri'){
      var bs=[twoDig(r,[2,3,7,8]), twoDig(r,[3,7,9]), twoDig(r,[2,4,8])], es=[r.int(11,79), r.int(11,79), r.int(11,79)];
      if(uniq(bs).length<3) return null;
      var us=[ud(bs[0],es[0]), ud(bs[1],es[1]), ud(bs[2],es[2])];
      t=[[bs[0],es[0]],[bs[1],es[1]],[bs[2],es[2]]]; ans=(us[0]*us[1]*us[2])%10;
      expr=F.pow(bs[0],es[0])+' &times; '+F.pow(bs[1],es[1])+' &times; '+F.pow(bs[2],es[2]);
      why=posWords(bs[0],es[0])+'; '+posWords(bs[1],es[1])+'; '+posWords(bs[2],es[2])+'. '+us.join(' &times; ')+' = '+(us[0]*us[1]*us[2])+', ending in '+ans+'.';
      W((us[0]+us[1]+us[2])%10, 'Adds the three units digits instead of multiplying.');
      W((us[0]*us[1])%10, 'Multiplies the first two and drops '+F.pow(bs[2],es[2])+'.');
      W((udFwd(bs[0],es[0])*us[1]*us[2])%10, 'One place too far round the cycle for '+F.pow(bs[0],es[0])+'.');
      W((us[0]*udFwd(bs[1],es[1])*us[2])%10, 'One place too far round the cycle for '+F.pow(bs[1],es[1])+'.');
      W((us[0]*us[1]*udBack(bs[2],es[2]))%10, 'One place short in the cycle for '+F.pow(bs[2],es[2])+'.');
      W(((bs[0]%10)*(bs[1]%10)*(bs[2]%10))%10, 'Multiplies the last digits of the bases and ignores every exponent.');
      fast='Three short cycles, then multiply last digits only: '+us.join(' &times; ')+' &rarr; '+ans+'.';
    }
    else if(kind==='series'){
      var d=r.pick([2,3,7,8]), nn=r.int(21,99), rem=nn%4, c=CYC[d], part=0, j;
      if(rem===0) return null;
      for(j=0;j<rem;j++) part+=c[j];
      t=[[d,nn]]; ans=part%10;
      expr=d+' + '+F.pow(d,2)+' + '+F.pow(d,3)+' + &hellip; + '+F.pow(d,nn);
      var q4=Math.floor(nn/4);
      why='Every four consecutive powers end in '+c.join(' + ')+' = 20, which ends in 0. '+nn+' = 4 &times; '+q4+' + '+rem+
          ', so only the '+rem+' leftover term'+(rem>1?'s':'')+' matter'+(rem>1?'':'s')+': '+c.slice(0,rem).join(' + ')+' = '+part+', ending in '+ans+'.';
      var part2=0; for(j=0;j<=rem && j<4;j++) part2+=c[j];
      var part0=0; for(j=0;j<rem-1;j++) part0+=c[j];
      W(ud(d,nn), 'Gives the units digit of the last term, '+F.pow(d,nn)+', not of the whole sum.');
      W(0, 'Sees that each block of four sums to 20 but forgets the '+rem+' leftover term'+(rem>1?'s':'')+'.');
      W(part2%10, 'Counts one leftover term too many.');
      W(part0%10, 'Counts one leftover term too few.');
      W((d*nn)%10, 'Treats the sum as '+nn+' copies of '+d+'.');
      W(rem, 'Gives the number of leftover terms instead of their sum.');
      W((ud(d,nn)*nn)%10, 'Multiplies the last term\'s units digit by the number of terms.');
      fast='Blocks of four powers of '+d+' add to 20, ending in 0. Only the first '+rem+' of the cycle survive: '+c.slice(0,rem).join(' + ')+' &rarr; '+ans+'.';
    }
    else { /* mixed: a product plus a power */
      var m1=twoDig(r,[2,3,7,8]), m2=twoDig(r,[3,4,7,9]), m3=twoDig(r,[2,3,7,8]);
      var f1=r.int(11,69), f2=r.int(11,69), f3=r.int(11,69);
      if(m1===m3 || m1===m2) return null;
      var w1=ud(m1,f1), w2=ud(m2,f2), w3=ud(m3,f3);
      t=[[m1,f1],[m2,f2],[m3,f3]]; ans=(w1*w2+w3)%10;
      expr=F.pow(m1,f1)+' &times; '+F.pow(m2,f2)+' + '+F.pow(m3,f3);
      why=posWords(m1,f1)+'; '+posWords(m2,f2)+'; '+posWords(m3,f3)+'. '+w1+' &times; '+w2+' + '+w3+' = '+(w1*w2+w3)+', ending in '+ans+'.';
      W((w1*(w2+w3))%10, 'Multiplies '+w1+' by ('+w2+' + '+w3+'); the multiplication comes before the addition.');
      W((w1+w2+w3)%10, 'Adds all three units digits.');
      W((w1*w2*w3)%10, 'Multiplies all three units digits.');
      W((w1*w2)%10, 'Handles the product and forgets to add '+F.pow(m3,f3)+'.');
      W((w1*w2+udFwd(m3,f3))%10, 'One place too far round the cycle for '+F.pow(m3,f3)+'.');
      W((udFwd(m1,f1)*w2+w3)%10, 'One place too far round the cycle for '+F.pow(m1,f1)+'.');
      fast='Last digits only: '+w1+' &times; '+w2+' + '+w3+' &rarr; '+ans+'. Keep the order of operations.';
    }
    return {type:'mc',
      b: bOf(r, tier, kind==='series'||kind==='mixed' ? 0.75 : kind==='tower' ? 0.6 : 0.4),
      stem: ask(expr),
      correct:{t:S(ans), why:why},
      wrong:wrong, fast:fast,
      p:{kind:kind, t:t}};
  },
  verify:function(q){
    var p=q.p, t=p.t, v, i, x;
    function lp(b,e){ var y=1; for(var j=0;j<e;j++) y=(y*(b%10))%10; return y; }
    if(p.kind==='one') v=lp(t[0][0],t[0][1]);
    else if(p.kind==='prod') v=(lp(t[0][0],t[0][1])*lp(t[1][0],t[1][1]))%10;
    else if(p.kind==='sum') v=(lp(t[0][0],t[0][1])+lp(t[1][0],t[1][1]))%10;
    else if(p.kind==='tower'){ x=lp(t[0][0],t[0][1]); v=1; for(i=0;i<t[0][2];i++) v=(v*x)%10; }
    else if(p.kind==='diff'){
      if(!(t[0][0]>t[1][0] && t[0][1]>t[1][1])) return false;
      v=(lp(t[0][0],t[0][1])-lp(t[1][0],t[1][1])+10)%10;
    }
    else if(p.kind==='tri') v=(lp(t[0][0],t[0][1])*lp(t[1][0],t[1][1])*lp(t[2][0],t[2][1]))%10;
    else if(p.kind==='series'){ v=0; x=1; for(i=1;i<=t[0][1];i++){ x=(x*t[0][0])%10; v=(v+x)%10; } }
    else v=(lp(t[0][0],t[0][1])*lp(t[1][0],t[1][1])+lp(t[2][0],t[2][1]))%10;
    return GEN.numOf(q.opts[q.ans])===v;
  }
});
})();
