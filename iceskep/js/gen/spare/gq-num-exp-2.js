/* ===========================================================
   GEN — GRE number properties and exponents.
   Divisor counts, LCM/GCD, consecutive integers, primes in a range,
   prime powers in a factorial, divisibility digits; same-base
   equations, power simplification, comparing powers, radicals,
   doubling growth.
   =========================================================== */
(function(){
var F=GEN.F;
function W(t,why){ return {t:t, why:why}; }
function tb(t,w,e,h){ return t==='warm'?w:t==='exam'?e:h; }
function divisors(n){ var c=0; for(var i=1;i*i<=n;i++){ if(n%i===0){ c+= (i*i===n)?1:2; } } return c; }
function properDiv(g){ for(var d=g-1; d>1; d--) if(g%d===0) return d; return 1; }
function isPrime(n){ if(n<2) return false; for(var i=2;i*i<=n;i++) if(n%i===0) return false; return true; }

/* ---------- number of divisors ---------- */
GEN.add({
  id:'gq.num.divcount', topic:'gq.num', n:28, trick:'g.num.cnt',
  make:function(r,k,n){
    var t=r.tier(k,n);
    var primes=r.sample([2,3,5,7,11], t==='warm'?2:3).sort(function(a,b){return a-b;});
    var ex=primes.map(function(){ return r.int(1, t==='hard'?4:3); });
    var N=1; primes.forEach(function(p,i){ N*=Math.pow(p,ex[i]); });
    if(N>200000 || N<20) return null;
    var odd = t==='hard' && primes[0]===2 && r.chance(0.6);
    var ans=1, prodE=1, sumE=0;
    primes.forEach(function(p,i){ if(!(odd&&p===2)) ans*=ex[i]+1; prodE*=ex[i]; sumE+=ex[i]; });
    var total=1; ex.forEach(function(e){ total*=e+1; });
    var fact=primes.map(function(p,i){ return ex[i]>1?F.pow(p,ex[i]):String(p); }).join(' &times; ');
    var stem=r.pick(['How many positive '+(odd?'odd ':'')+'divisors does '+F.n(N,0)+' have?',
      F.n(N,0)+' = '+fact+'. How many positive '+(odd?'odd ':'')+'integers divide it exactly?',
      'How many '+(odd?'odd ':'')+'positive factors, including 1 and itself, does '+F.n(N,0)+' have?']);
    var wrong=[
      W(prodE, 'Multiplies the exponents instead of multiplying (exponent + 1).'),
      W(sumE+1, 'Adds the exponents and adds one &mdash; that is not how divisor counts combine.'),
      W(odd?total:ans-2, odd?'Counts every divisor, even ones included.':'Leaves out 1 and the number itself; the question counts both.'),
      W(odd?total/2:ans*2, odd?'Assumes exactly half the divisors are odd.':'Doubles, as if negative divisors counted.'),
      W(primes.length, 'Counts only the distinct primes.'),
      W(ans+1, 'Adds one for the number itself twice.')
    ];
    return {b:tb(t,-0.6,0.2,odd?1.1:0.8), stem:stem,
      correct:W(ans, 'Prime factorisation '+fact+'. Each exponent gives (exponent + 1) choices'+(odd?' and the 2 must be left out, so its choice is fixed at 2<sup>0</sup>':'')+': '+ans+'.'),
      wrong:wrong,
      fast:'Factorise to '+fact+', then multiply (each exponent + 1)'+(odd?', skipping the power of 2':'')+'. No listing.',
      p:{N:N, odd:odd}};
  },
  verify:function(q){
    var c=0; for(var d=1; d<=q.p.N; d++) if(q.p.N%d===0 && (!q.p.odd || d%2===1)) c++;
    return GEN.numOf(q.opts[q.ans])===c;
  }
});

/* ---------- LCM and GCD in context ---------- */
GEN.add({
  id:'gq.num.lcmgcd', topic:'gq.num', n:28, trick:'g.num.div',
  make:function(r,k,n){
    var t=r.tier(k,n), kind=r.pick(['bells','tiles','packs']);
    var a,b,c,ans,stem,how,wrong;
    if(kind==='bells'){
      a=r.int(4,18); b=r.intNot(4,24,[a]); c= t==='hard'? r.intNot(5,30,[a,b]) : 0;
      ans=F.lcm(a,b); if(c) ans=F.lcm(ans,c);
      if(ans>600 || ans===a*b*(c||1) && t!=='warm') return null;
      stem='Three signals flash every '+a+', '+b+(c?' and '+c:'')+' seconds. They flash together now. After how many seconds will they next flash together?';
      if(!c) stem=stem.replace('Three','Two').replace(', '+b+' and',' and '+b).replace('every '+a+' and '+b+' and','every '+a+' and '+b);
      if(!c) stem='Two lights flash every '+a+' and '+b+' seconds. They flash together now. After how many seconds will they next flash together?';
      wrong=[W(a*b*(c||1),'Multiplies the intervals. That is a common time, not the first one unless they share no factor.'),
        W(F.gcd(a,b),'Takes the greatest common divisor; the question wants the least common multiple.'),
        W(a+b+(c||0),'Adds the intervals.'),
        W(c?F.lcm(a,b):ans*2, c?'Ignores the third light.':'Doubles the answer.'),
        W(Math.max(a,b,c), 'Takes the longest interval.'), W(ans/2,'Halves the common multiple.')];
      how='LCM('+a+', '+b+(c?', '+c:'')+') = '+ans;
    } else if(kind==='tiles'){
      var g=r.int(3,12); a=g*r.int(3,11); b=g*r.intNot(3,13,[a/g]);
      if(F.gcd(a,b)!==g) return null;
      ans=g;
      stem='A floor '+a+' cm by '+b+' cm is to be covered exactly with identical square tiles, none cut. What is the largest possible side of a tile, in cm?';
      wrong=[W(F.lcm(a,b),'Takes the least common multiple; a tile cannot be bigger than the floor.'),
        W(Math.min(a,b),'Uses the shorter side; it does not divide the longer one.'),
        W(g*2,'Doubles the common factor; that no longer divides both sides.'),
        W(Math.abs(a-b),'Subtracts the sides.'), W(properDiv(g), 'A common factor, but not the greatest one.')];
      how='GCD('+a+', '+b+') = '+g;
    } else {
      a=r.int(6,16); b=r.intNot(8,20,[a]);
      ans=F.lcm(a,b);
      if(ans===a*b || ans>240) return null;
      var packs=ans/a+ans/b;
      stem='Pens come in packs of '+a+' and caps in packs of '+b+'. What is the smallest number of packs in total that gives the same number of pens as caps?';
      wrong=[W(a+b,'Adds the pack sizes.'), W((a*b)/a+(a*b)/b,'Uses the product '+a*b+' instead of the least common multiple.'),
        W(ans,'Gives the number of pens, not the number of packs.'), W(ans/a,'Counts only the pen packs.'),
        W(packs+2,'Off by a pack of each.')];
      ans=packs; how='LCM = '+F.lcm(a,b)+': '+F.lcm(a,b)/a+' packs of pens and '+F.lcm(a,b)/b+' of caps';
    }
    return {b:tb(t,-0.7,0.1,0.7), stem:stem, correct:W(ans,'Right: '+how+'.'), wrong:wrong,
      fast:(kind==='tiles'?'Largest piece that fits both = GCD. ':'Next time together = LCM. ')+'Factorise each number and take '+(kind==='tiles'?'the shared primes':'the highest power of every prime')+'.',
      p:{kind:kind,a:a,b:b,c:c}};
  },
  verify:function(q){
    var p=q.p, v=GEN.numOf(q.opts[q.ans]), x;
    if(p.kind==='bells'){ for(x=1;x<100000;x++) if(x%p.a===0&&x%p.b===0&&(!p.c||x%p.c===0)) break; return v===x; }
    if(p.kind==='tiles'){ for(x=Math.min(p.a,p.b);x>0;x--) if(p.a%x===0&&p.b%x===0) break; return v===x; }
    for(x=1;x<100000;x++) if(x%p.a===0&&x%p.b===0) break;
    return v===x/p.a+x/p.b;
  }
});

/* ---------- consecutive integers ---------- */
GEN.add({
  id:'gq.num.consec', topic:'gq.num', n:26, trick:'g.stat.even',
  make:function(r,k,n){
    var t=r.tier(k,n), even=t!=='warm'&&r.chance(0.5), cnt=r.pick(t==='hard'?[6,8,9,10]:[4,5,7]);
    var step=even?2:1, first=(even?2:1)*r.int(3,40);
    var terms=[], i; for(i=0;i<cnt;i++) terms.push(first+i*step);
    var S=U_sum(terms), last=terms[cnt-1], ask=r.pick(['largest','smallest']);
    var ans= ask==='largest'?last:first;
    var mean=S/cnt;
    var stem='The sum of '+cnt+' consecutive '+(even?'even ':'')+'integers is '+S+'. What is the '+ask+' of them?';
    return {b:tb(t,-0.6,0.2,0.8), stem:stem,
      correct:W(ans,'The average is '+S+' &divide; '+cnt+' = '+F.n(mean,1)+', the middle of an evenly spaced list. The '+ask+' is '+ans+'.'),
      wrong:[W(F.n(mean,1),'Stops at the average; that is the middle, not the '+ask+'.'),
        W(ask==='largest'?first:last,'Gives the '+(ask==='largest'?'smallest':'largest')+' instead.'),
        W(ask==='largest'?last+step:first-step,'Off by one step at the end of the list.'),
        W(ask==='largest'?last-step:first+step,'Off by one step the other way.'),
        W(ask==='largest'?Math.round(mean)+cnt*step/2:Math.round(mean)-cnt*step/2,'Counts half the list from the middle without allowing for the middle itself.')],
      fast:'Evenly spaced: middle = sum &divide; count = '+F.n(mean,1)+'. Step out '+((cnt-1)*step/2)+' to reach the '+ask+'.',
      p:{S:S,cnt:cnt,step:step,ask:ask}};
  },
  verify:function(q){
    var p=q.p, f=(p.S - p.step*p.cnt*(p.cnt-1)/2)/p.cnt;
    return GEN.numOf(q.opts[q.ans])===(p.ask==='largest'?f+(p.cnt-1)*p.step:f);
  }
});
function U_sum(a){ var s=0; for(var i=0;i<a.length;i++) s+=a[i]; return s; }

/* ---------- a prime in a range, compared (QC) ---------- */
GEN.add({
  id:'gq.num.qcprime', topic:'gq.num', type:'qc', n:28, trick:'g.qc.must',
  make:function(r,k){
    var want=GEN.want4(k)===3?3:GEN.want4(k);
    var lo=r.int(10,90), hi=lo+r.int(4,12);
    var ps=[]; for(var x=lo+1;x<hi;x++) if(isPrime(x)) ps.push(x);
    if(!ps.length) return null;
    var B;
    if(want===0) B=ps[0]-r.int(1,3);
    else if(want===1) B=ps[ps.length-1]+r.int(1,3);
    else if(want===2){ if(ps.length!==1) return null; B=ps[0]; }
    else { if(ps.length<2) return null; B=ps[0]+1; if(B>=ps[ps.length-1]) return null; }
    var pts=ps.map(function(p){ return {a:p, b:B, s:'p = '+p}; });
    var d=GEN.qc(pts, 'The primes strictly between '+lo+' and '+hi+' are '+ps.join(', ')+'; compare each with '+B+'.');
    if(!d || d.ans!==want) return null;
    return {type:'qc', b:[0.1,0.3,0.6,0.7][want], pre:'p is a prime number and '+lo+' &lt; p &lt; '+hi+'.',
      qa:'p', qb:String(B), ans:d.ans, why:d.why,
      fast:'List the primes in the range first: '+ps.join(', ')+'. Then compare the whole list with '+B+'.',
      p:{lo:lo,hi:hi,B:B}};
  },
  verify:function(q){
    var ps=[]; for(var x=q.p.lo+1;x<q.p.hi;x++) if(isPrime(x)) ps.push(x);
    var d=GEN.qc(ps.map(function(p){ return {a:p,b:q.p.B}; }), '');
    return d.ans===q.ans;
  }
});

/* ---------- prime powers in a factorial ---------- */
GEN.add({
  id:'gq.num.factpow', topic:'gq.num', n:26, trick:'g.num.pf',
  make:function(r,k,n){
    var t=r.tier(k,n), zeros=t==='hard'&&r.chance(0.5);
    var p=zeros?5:r.pick([2,3,5,7]), N=r.int(t==='warm'?10:20, t==='warm'?30:t==='exam'?60:125);
    var ans=0, q=p; while(q<=N){ ans+=Math.floor(N/q); q*=p; }
    var first=Math.floor(N/p);
    if(first===ans) return null;               /* make the higher powers matter */
    var stem= zeros ? 'How many zeros are at the end of '+N+'! when it is written out in full?'
                    : 'What is the greatest integer k for which '+p+'<sup>k</sup> divides '+N+'!?';
    return {type: r.chance(0.3)&&!zeros ? 'ne' : 'mc', b:tb(t,-0.3,0.5,1.1), stem:stem,
      ans:{v:ans}, why:['Count the multiples of '+p+', then of '+(p*p)+(p*p*p<=N?', then '+(p*p*p):'')+': '+ans+'.'],
      correct:W(ans,'Every multiple of '+p+' gives one '+p+', every multiple of '+(p*p)+' one more'+(p*p*p<=N?', and so on':'')+': '+ans+'.'),
      wrong:[W(first,'Counts multiples of '+p+' only, forgetting that '+(p*p)+' contributes two.'),
        W(Math.floor(N/p)+Math.floor(N/(p*p))*2,'Counts each multiple of '+(p*p)+' twice on top of the first pass.'),
        W(zeros?Math.floor(N/2):N-first,zeros?'Counts factors of 2; the 5s run out first.':'Counts the numbers that are not multiples.'),
        W(ans+1,'Adds one for '+p+'<sup>0</sup>.'), W(Math.floor(N/10),'Counts multiples of 10 only.'), W(ans-1,'Stops one power too early.')],
      fast:'&lfloor;'+N+'/'+p+'&rfloor; + &lfloor;'+N+'/'+(p*p)+'&rfloor;'+(p*p*p<=N?' + &lfloor;'+N+'/'+(p*p*p)+'&rfloor;':'')+' = '+ans+'.'+(zeros?' Trailing zeros are limited by the 5s.':''),
      p:{p:p,N:N}};
  },
  verify:function(q){
    var c=0; for(var i=2;i<=q.p.N;i++){ var x=i; while(x%q.p.p===0){ c++; x/=q.p.p; } }
    return (q.type==='ne' ? q.ans.v : GEN.numOf(q.opts[q.ans]))===c;
  }
});

/* ---------- a missing digit and divisibility ---------- */
GEN.add({
  id:'gq.num.digit', topic:'gq.num', n:26, trick:'g.num.div',
  make:function(r,k,n){
    var t=r.tier(k,n), dv=r.pick(t==='hard'?[11,12,36]:[3,4,6,9]);
    var len=r.int(4,6), digs=[], i;
    for(i=0;i<len;i++) digs.push(r.int(i===0?1:0,9));
    var pos=r.int(1,len-1);
    var count=0, list=[];
    for(var d=0;d<=9;d++){ var s=digs.slice(); s[pos]=d; var v=parseInt(s.join(''),10); if(v%dv===0){ count++; list.push(d); } }
    if(!count) return null;
    var shown=digs.map(function(x,j){ return j===pos?'&#9633;':String(x); }).join('');
    var wrongCount3=0;
    for(d=0;d<=9;d++){ var s3=digs.slice(); s3[pos]=d; if(parseInt(s3.join(''),10)%3===0) wrongCount3++; }
    return {b:tb(t,-0.4,0.3,1.0),
      stem:'In the '+len+'-digit number '+shown+', the box stands for a single digit from 0 to 9. For how many values of that digit is the number divisible by '+dv+'?',
      correct:W(count,'The digits that work are '+list.join(', ')+': '+count+' of them.'),
      wrong:[W(count+1,'Counts one digit that fails the test &mdash; usually 0 or 9 at the edge.'),
        W(Math.max(0,count-1),'Leaves out 0 as a possible digit.'),
        W(dv===3?10-count:wrongCount3, dv===3?'Counts the digits that fail.':'Uses the test for 3 alone.'),
        W(Math.floor(10/dv)+1,'Assumes the digits that work are spread evenly, one every '+dv+'.'),
        W(count*2,'Counts each working digit twice.'), W(0,'Assumes no digit can work.')],
      fast: dv===9||dv===3 ? 'Add the known digits, then ask which extra digit makes a multiple of '+dv+'.'
          : dv===4 ? 'Only the last two digits matter for 4.'
          : dv===11 ? 'Alternate plus and minus across the digits; the total must be a multiple of 11.'
          : 'Split '+dv+' into coprime parts ('+(dv===6?'2 and 3':dv===12?'3 and 4':'4 and 9')+') and test both.',
      p:{digs:digs,pos:pos,dv:dv}};
  },
  verify:function(q){
    var c=0; for(var d=0;d<=9;d++){ var s=q.p.digs.slice(); s[q.p.pos]=d; if(parseInt(s.join(''),10)%q.p.dv===0) c++; }
    return GEN.numOf(q.opts[q.ans])===c;
  }
});

/* ---------- same-base exponential equations ---------- */
GEN.add({
  id:'gq.exp.samebase', topic:'gq.exp', n:28, trick:'g.exp.rule',
  make:function(r,k,n){
    var t=r.tier(k,n), base=r.pick([2,3,5]);
    var u=r.int(1,3), v=r.intNot(1,3,[u]), x=r.int(-4,6), p=r.int(1,3), rr=r.intNot(1,3,[p]), q=r.int(-5,5);
    /* base^u^(p x + q) = base^v^(rr x + s)  =>  u(p x + q) = v(rr x + s) */
    var num=u*(p*x+q)-v*rr*x;
    if(num%v!==0) return null;
    var s=num/v;
    if(u*p===v*rr) return null;
    var A=Math.pow(base,u), B=Math.pow(base,v);
    function lin(a,c){ return (a===1?'':a)+'x'+(c>0?' + '+c:c<0?' &minus; '+(-c):''); }
    var stem='If '+F.pow(A,lin(p,q))+' = '+F.pow(B,lin(rr,s))+', what is the value of x?';
    var naive=(s-q)/(p-rr);
    return {type:r.chance(0.25)?'ne':'mc', b:tb(t,-0.3,0.4,1.0), stem:stem, ans:{v:x},
      why:['Write both sides as powers of '+base+': '+u+'('+lin(p,q)+') = '+v+'('+lin(rr,s)+'), so x = '+x+'.'],
      correct:W(x,'Rewrite '+A+' as '+F.pow(base,u)+' and '+B+' as '+F.pow(base,v)+'. Then '+u+'('+lin(p,q)+') = '+v+'('+lin(rr,s)+') gives x = '+x+'.'),
      wrong:[W(isFinite(naive)&&naive===Math.round(naive)?naive:x+2,'Sets the exponents equal without first putting both sides on the same base.'),
        W(-x,'Sign slip when collecting the x terms.'),
        W(x+1,'Multiplies only the x term by the outer power and forgets the constant.'),
        W(x-1,'Drops a sign on the constant.'), W(2*x||3,'Doubles the result when dividing.'), W(x+3,'Arithmetic slip.')],
      fast:'Same base first: '+A+' = '+F.pow(base,u)+', '+B+' = '+F.pow(base,v)+'. Then it is a linear equation in the exponents.',
      p:{base:base,u:u,v:v,p:p,rr:rr,q:q,s:s}};
  },
  verify:function(q){
    var p=q.p, got=q.type==='ne'?q.ans.v:GEN.numOf(q.opts[q.ans]);
    return Math.abs(p.u*(p.p*got+p.q) - p.v*(p.rr*got+p.s))<1e-9;
  }
});

/* ---------- factoring sums and differences of powers ---------- */
GEN.add({
  id:'gq.exp.factor', topic:'gq.exp', n:26, trick:'g.exp.rule',
  make:function(r,k,n){
    var t=r.tier(k,n), b=r.pick([2,3,5]), m=r.int(6,20), j=r.int(1,t==='hard'?3:2), sign=t==='warm'?1:r.sign();
    /* (b^(m+j) +/- b^m) / b^m  =  b^j +/- 1 */
    var ans=Math.pow(b,j)+sign;
    if(ans<=0) return null;
    var stem='What is the value of ('+F.pow(b,m+j)+' '+(sign>0?'+':'&minus;')+' '+F.pow(b,m)+') &divide; '+F.pow(b,m)+'?';
    return {b:tb(t,-0.5,0.3,0.9), stem:stem,
      correct:W(ans,'Factor '+F.pow(b,m)+' out of the top: '+F.pow(b,m)+'('+F.pow(b,j)+' '+(sign>0?'+':'&minus;')+' 1). Cancel to get '+ans+'.'),
      wrong:[W(Math.pow(b,j),'Cancels '+F.pow(b,m)+' from one term only.'),
        W(sign>0?Math.pow(b,j+1):Math.pow(b,j)+1,'Combines the two powers as if the exponents added.'),
        W(F.pow(b,j),'Leaves the answer as a power without the '+(sign>0?'+ 1':'&minus; 1')+'.'),
        W(Math.pow(b,j)-sign,'Gets the sign of the 1 wrong.'),
        W(b*j+sign,'Multiplies base by exponent instead of raising it.'), W(2*Math.pow(b,j),'Doubles instead of adding one.')],
      fast:'Never expand a big power. Pull out the smaller power: it leaves '+F.pow(b,j)+' '+(sign>0?'+':'&minus;')+' 1.',
      p:{b:b,m:m,j:j,sign:sign}};
  },
  verify:function(q){ var p=q.p; return GEN.numOf(q.opts[q.ans])===Math.pow(p.b,p.j)+p.sign; }
});

/* ---------- comparing big powers (QC) ---------- */
GEN.add({
  id:'gq.exp.qcpow', topic:'gq.exp', type:'qc', n:27, trick:'g.qc.strip',
  make:function(r,k){
    var want=k%3;                             /* two fixed numbers can never be D */
    var pairs=[[2,3],[2,5],[3,5],[4,5],[2,7],[3,7]];
    var pr=r.pick(pairs), a=pr[0], b=pr[1];
    var e=r.int(3,9), ma=r.int(2,6), mb=r.int(2,6);
    var A, B, la, lb;
    if(want===2){
      /* equal: (a^2)^x vs a^(2x) style */
      var base=r.pick([2,3]), p1=r.int(2,4), p2=r.intNot(2,4,[p1]), L=F.lcm(p1,p2)*r.int(2,5);
      A=F.pow(Math.pow(base,p1), L/p1); B=F.pow(Math.pow(base,p2), L/p2);
      la=Math.log(base)*L; lb=la;
    } else {
      A=F.pow(a, ma*e); B=F.pow(b, mb*e);
      la=ma*e*Math.log(a); lb=mb*e*Math.log(b);
      if(Math.abs(la-lb)<1e-9) return null;
      if((la>lb?0:1)!==want) return null;
    }
    var d=GEN.qc([{a:la,b:lb,s:''}], want===2?'Both are the same power of '+base+'.':
      'Take the common root: compare '+F.pow(a,ma)+' with '+F.pow(b,mb)+', that is '+Math.pow(a,ma)+' against '+Math.pow(b,mb)+'.');
    if(d.ans!==want) return null;
    return {type:'qc', b:want===2?0.4:0.7, qa:A, qb:B, ans:d.ans, why:d.why,
      fast: want===2 ? 'Rewrite both on the smallest base; the exponents turn out equal.'
                     : 'Pull out the common exponent '+e+': compare '+F.pow(a,ma)+' = '+Math.pow(a,ma)+' with '+F.pow(b,mb)+' = '+Math.pow(b,mb)+'. The larger base-power wins.',
      p:{la:la, lb:lb}};
  },
  verify:function(q){
    var c = Math.abs(q.p.la-q.p.lb)<1e-9 ? 2 : q.p.la>q.p.lb ? 0 : 1;
    return c===q.ans;
  }
});

/* ---------- adding radicals ---------- */
GEN.add({
  id:'gq.exp.radical', topic:'gq.exp', n:28, trick:'g.exp.rad',
  make:function(r,k,n){
    var t=r.tier(k,n), core=r.pick([2,3,5,6,7]), m1=r.int(2,t==='warm'?4:7), m2=r.intNot(2,t==='warm'?5:9,[m1]);
    var a=m1*m1*core, b=m2*m2*core, sub=t==='hard'&&r.chance(0.5);
    var coef=sub?Math.abs(m1-m2):m1+m2;
    if(!coef) return null;
    var stem='&radic;'+a+' '+(sub?'&minus;':'+')+' &radic;'+b+' =';
    return {b:tb(t,-0.4,0.3,0.8), stem:stem.replace('&radic;'+a+' &minus; &radic;'+b, m1>m2?'&radic;'+a+' &minus; &radic;'+b:'&radic;'+b+' &minus; &radic;'+a),
      correct:W(coef+'&radic;'+core,'&radic;'+a+' = '+m1+'&radic;'+core+' and &radic;'+b+' = '+m2+'&radic;'+core+'. Like radicals combine: '+coef+'&radic;'+core+'.'),
      wrong:[W(F.root(sub?Math.abs(a-b):a+b),(sub?'Subtracts':'Adds')+' under one root; &radic;a '+(sub?'&minus;':'+')+' &radic;b is not &radic;(a '+(sub?'&minus;':'+')+' b).'),
        W((m1*m2)+'&radic;'+core,'Multiplies the outside numbers instead of '+(sub?'subtracting':'adding')+' them.'),
        W(coef+'&radic;'+(core*2),'Combines the insides as well as the outsides.'),
        W(String(coef*core),'Drops the root sign.'),
        W((sub?m1+m2:Math.abs(m1-m2)||1)+'&radic;'+core,(sub?'Adds':'Subtracts')+' the outside numbers.'),
        W(coef+'&radic;'+(core*core),'Squares the core by mistake.')],
      fast:'Pull the largest square out of each: '+a+' = '+(m1*m1)+' &times; '+core+', '+b+' = '+(m2*m2)+' &times; '+core+'. Then it is just '+m1+(sub?' &minus; ':' + ')+m2+'.',
      p:{core:core,m1:m1,m2:m2,sub:sub}};
  },
  verify:function(q){
    var p=q.p, v=p.sub?Math.abs(Math.sqrt(p.m1*p.m1*p.core)-Math.sqrt(p.m2*p.m2*p.core)):Math.sqrt(p.m1*p.m1*p.core)+Math.sqrt(p.m2*p.m2*p.core);
    var m=String(q.opts[q.ans]).match(/^(\d+)&radic;(\d+)$/);
    return !!m && Math.abs(m[1]*Math.sqrt(m[2]*1)-v)<1e-9;
  }
});

/* ---------- doubling growth ---------- */
GEN.add({
  id:'gq.exp.growth', topic:'gq.exp', n:26, trick:'g.exp.rule',
  make:function(r,k,n){
    var t=r.tier(k,n), P=r.pick([50,80,120,150,250,400,500]), per=r.pick([2,3,4,5,6,8,12]), steps=r.int(3,t==='hard'?9:6);
    var T=per*steps, ans=P*Math.pow(2,steps), thing=r.pick(['bacteria in a dish','users of an app','copies of a rumour']);
    var reverse = t==='hard' && r.chance(0.5);
    if(reverse){
      return {b:1.0, stem:'A colony of '+P+' '+thing+' doubles every '+per+' hours. After how many hours will it first reach '+F.n(ans,0)+'?',
        correct:W(T,F.n(ans,0)+' &divide; '+P+' = '+Math.pow(2,steps)+' = 2<sup>'+steps+'</sup>, so '+steps+' doublings of '+per+' hours: '+T+'.'),
        wrong:[W(steps,'Gives the number of doublings, not the hours.'),W(per*Math.pow(2,steps)/2,'Treats the growth factor as hours.'),
          W(T+per,'Counts one doubling too many.'),W(T-per,'Counts one doubling too few.'),W(per*(ans/P),'Multiplies the period by the growth factor.')],
        fast:'Divide target by start ('+Math.pow(2,steps)+'), write it as a power of 2 ('+steps+'), multiply by '+per+'.', p:{P:P,per:per,steps:steps,rev:1}};
    }
    return {b:tb(t,-0.5,0.2,0.7), stem:'A population of '+P+' '+thing+' doubles every '+per+' hours. How many will there be after '+T+' hours?',
      correct:W(F.n(ans,0),T+' hours is '+steps+' doublings: '+P+' &times; 2<sup>'+steps+'</sup> = '+F.n(ans,0)+'.'),
      wrong:[W(F.n(P*2*steps,0),'Doubles once per period and adds, as if growth were linear.'),
        W(F.n(P*Math.pow(2,steps-1),0),'Counts one doubling too few.'),
        W(F.n(P*Math.pow(2,steps+1),0),'Counts one doubling too many.'),
        W(F.n(P*Math.pow(2,T),0).length<12?F.n(P*Math.pow(2,T),0):F.n(P*T*2,0),'Doubles every hour instead of every '+per+' hours.'),
        W(F.n(P+Math.pow(2,steps),0),'Adds 2<sup>'+steps+'</sup> instead of multiplying.')],
      fast:'Hours &divide; period = '+steps+' doublings. Start &times; 2<sup>'+steps+'</sup>.', p:{P:P,per:per,steps:steps,rev:0}};
  },
  verify:function(q){
    var p=q.p, v=GEN.numOf(q.opts[q.ans]);
    return p.rev ? v===p.per*p.steps : v===p.P*Math.pow(2,p.steps);
  }
});

})();
