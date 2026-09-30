/* ===========================================================
   GEN — IBA analytical ability.

   Series are checked against every rule family in the library, so a
   series that two rules could explain is thrown away. Arrangement
   puzzles are built by a solver: clues are added until exactly one
   arrangement survives, then trimmed until none is redundant.
   Syllogisms are checked against all 256 ways three sets can overlap,
   and an answer that is valid only if every group is assumed to be
   non-empty is never used as a key or as a trap.
   =========================================================== */
(function(){
var F=GEN.F;
function W(t,why){ return {t:t, why:why}; }
function tb(t,w,e,h){ return t==='warm'?w:t==='exam'?e:h; }
function isPrime(n){ if(n<2) return false; for(var i=2;i*i<=n;i++) if(n%i===0) return false; return true; }
var PRIMES=[]; for(var pp=2;PRIMES.length<30;pp++) if(isPrime(pp)) PRIMES.push(pp);

/* ===================== number series ===================== */
var FAMILIES={
  arith:function(t){ var d=t[1]-t[0]; for(var i=2;i<t.length;i++) if(t[i]-t[i-1]!==d) return null; return t[t.length-1]+d; },
  geo:function(t){ if(!t[0]) return null; var q=t[1]/t[0]; if(q===1||q!==Math.round(q)) return null; for(var i=2;i<t.length;i++) if(t[i]!==t[i-1]*q) return null; return t[t.length-1]*q; },
  quad:function(t){ var e=(t[2]-t[1])-(t[1]-t[0]); if(!e) return null; for(var i=3;i<t.length;i++) if((t[i]-t[i-1])-(t[i-1]-t[i-2])!==e) return null; var L=t.length; return t[L-1]+(t[L-1]-t[L-2])+e; },
  cubic:function(t){ if(t.length<5) return null; function d(a){ var o=[]; for(var i=1;i<a.length;i++) o.push(a[i]-a[i-1]); return o; }
    var d3=d(d(d(t))); if(!d3[0]) return null; for(var i=1;i<d3.length;i++) if(d3[i]!==d3[0]) return null;
    var d1=d(t), d2=d(d1); return t[t.length-1]+d1[d1.length-1]+d2[d2.length-1]+d3[0]; },
  alt:function(t){ if(t.length<6) return null; var a=[],b=[],i; for(i=0;i<t.length;i++) (i%2?b:a).push(t[i]);
    var da=a[1]-a[0], db=b[1]-b[0]; if(da===db) return null;
    for(i=2;i<a.length;i++) if(a[i]-a[i-1]!==da) return null; for(i=2;i<b.length;i++) if(b[i]-b[i-1]!==db) return null;
    return t.length%2 ? b[b.length-1]+db : a[a.length-1]+da; },
  fib:function(t){ for(var i=2;i<t.length;i++) if(t[i]!==t[i-1]+t[i-2]) return null; return t[t.length-1]+t[t.length-2]; },
  muladd:function(t){ if(!t[0]) return null; var m=t[1]/t[0], c=t[2]-t[1]; if(m!==Math.round(m)||m<2||!c) return null;
    for(var i=1;i<t.length;i++){ var ok = i%2 ? t[i]===t[i-1]*m : t[i]===t[i-1]+c; if(!ok) return null; }
    return t.length%2 ? t[t.length-1]*m : t[t.length-1]+c; },
  primeadd:function(t){ var d=[]; for(var i=1;i<t.length;i++) d.push(t[i]-t[i-1]); var s=PRIMES.indexOf(d[0]); if(s<0) return null;
    for(i=0;i<d.length;i++) if(PRIMES[s+i]!==d[i]) return null; return t[t.length-1]+PRIMES[s+d.length]; },
  mulinc:function(t){ var m=t[1]/t[0]; if(!t[0]||m!==Math.round(m)||m<1) return null;
    for(var i=1;i<t.length;i++) if(t[i]!==t[i-1]*(m+i-1)) return null; return t[t.length-1]*(m+t.length-1); }
};
var FAMILY_TEXT={arith:'a constant difference', geo:'a constant ratio', quad:'differences that grow by a constant step',
  cubic:'third differences that are constant', alt:'two interleaved series, each with its own step', fib:'each term the sum of the two before',
  muladd:'multiply, then add, alternately', primeadd:'differences that are consecutive primes', mulinc:'multipliers that go up by one each step'};
function makeSeries(r, fam, hard){
  var t=[], i, L=hard?7:6;
  if(fam==='arith'){ var a=r.int(2,60), d=r.pick([3,4,6,7,9,11,13,-4,-7]); for(i=0;i<L;i++) t.push(a+i*d); }
  else if(fam==='geo'){ var g=r.int(1,5), q=r.pick([2,3,4]); for(i=0;i<L;i++) t.push(g*Math.pow(q,i)); if(t[L-1]>5000) return null; }
  else if(fam==='quad'){ var s=r.int(1,20), d0=r.int(1,6), e=r.pick([1,2,3,4]); t.push(s); for(i=1;i<L;i++) t.push(t[i-1]+d0+(i-1)*e); }
  else if(fam==='cubic'){ var o=r.int(-3,5); for(i=0;i<L;i++) t.push(Math.pow(i+1+o+3,3)+r.int(0,0)); if(Math.max.apply(null,t)>3000) return null; }
  else if(fam==='alt'){ var a1=r.int(1,30), b1=r.int(30,80), s1=r.pick([2,3,5]), s2=r.pick([-2,-3,-4,4,6]); for(i=0;i<L;i++) t.push(i%2? b1+((i-1)/2)*s2 : a1+(i/2)*s1); }
  else if(fam==='fib'){ t.push(r.int(1,6)); t.push(r.int(2,9)); for(i=2;i<L;i++) t.push(t[i-1]+t[i-2]); }
  else if(fam==='muladd'){ var x=r.int(1,6), m=r.pick([2,3]), c=r.pick([1,2,3,4,5,-1,-2]); t.push(x); for(i=1;i<L;i++) t.push(i%2? t[i-1]*m : t[i-1]+c); if(Math.max.apply(null,t)>5000) return null; }
  else if(fam==='primeadd'){ var st=r.int(0,6), base=r.int(1,40); t.push(base); for(i=1;i<L;i++) t.push(t[i-1]+PRIMES[st+i-1]); }
  else if(fam==='mulinc'){ var m0=r.pick([1,2]), z=r.int(1,4); t.push(z); for(i=1;i<L;i++) t.push(t[i-1]*(m0+i-1)); if(t[L-1]>20000||m0===1&&false) return null; }
  return t;
}
GEN.add({
  id:'ia.series.number', topic:'ia.series', n:40, trick:'i.series.ladder',
  make:function(r,k,n){
    var tier=r.tier(k,n), hard=tier==='hard';
    var fam=r.pick(tier==='warm'?['arith','geo','quad']:tier==='exam'?['quad','alt','fib','muladd','geo','primeadd']:['cubic','alt','muladd','primeadd','mulinc','fib']);
    var t=makeSeries(r, fam, hard);
    if(!t) return null;
    var next=FAMILIES[fam](t);
    if(next===null) return null;
    /* uniqueness: no other family may also explain the shown terms */
    for(var f in FAMILIES){ if(f===fam) continue; var alt=FAMILIES[f](t); if(alt!==null) return null; }
    var shown=t.join(', ');
    var dLast=t[t.length-1]-t[t.length-2];
    var wrong=[
      W(t[t.length-1]+dLast,'Repeats the last difference ('+dLast+') instead of following the pattern.'),
      W(t[t.length-1]+(t[1]-t[0]),'Uses the first difference throughout.'),
      W(next+1,'Right idea, arithmetic slip.'),
      W(next-1,'Right idea, arithmetic slip.'),
      W(t[t.length-1]*2,'Doubles the last term.'),
      W(next+dLast,'Applies the step one time too many.')
    ];
    return {b:tb(tier,-0.4,0.4,1.0), stem:'What number comes next?<br><br><b>'+shown+', ?</b>',
      correct:W(next,'The rule is '+FAMILY_TEXT[fam]+'. The next term is '+next+'.'),
      wrong:wrong,
      fast:'Ladder: first differences, then second differences, then ratios, then split odd and even positions. Stop at the first rung that works &mdash; here, '+FAMILY_TEXT[fam]+'.',
      p:{t:t,fam:fam}};
  },
  verify:function(q){
    var p=q.p, fits=[], f;
    for(f in FAMILIES){ var v=FAMILIES[f](p.t); if(v!==null) fits.push(v); }
    return fits.length===1 && GEN.numOf(q.opts[q.ans])===fits[0];
  }
});

/* ===================== letter series ===================== */
var AZ='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function L(i){ return AZ.charAt(((i%26)+26)%26); }
GEN.add({
  id:'ia.series.letter', topic:'ia.series', n:30, trick:'i.series.ladder',
  make:function(r,k,n){
    var tier=r.tier(k,n), kind=tier==='warm'?'const':r.pick(['grow','alt','pair']), s=r.int(0,25), out=[], i, nx, why;
    if(kind==='const'){ var d=r.pick([2,3,4,5]); for(i=0;i<5;i++) out.push(L(s+i*d)); nx=L(s+5*d); why='Each letter moves '+d+' places forward.'; }
    else if(kind==='grow'){ var pos=s, st=r.int(1,2); out.push(L(pos)); for(i=1;i<5;i++){ pos+=st+i-1; out.push(L(pos)); } nx=L(pos+st+4); why='The gaps grow by one each time: +'+st+', +'+(st+1)+', +'+(st+2)+'...'; }
    else if(kind==='alt'){ var up=r.pick([2,3]), dn=r.pick([1,2]), q=s; out.push(L(q)); for(i=1;i<6;i++){ q+= i%2?up:-dn; out.push(L(q)); } nx=L(q+(6%2?up:-dn)); why='Alternately forward '+up+' and back '+dn+'.'; }
    else { var a=s, b=r.int(0,25), d1=r.pick([1,2,3]), d2=r.pick([-1,-2,1,3]); for(i=0;i<4;i++) out.push(L(a+i*d1)+L(b+i*d2)); nx=L(a+4*d1)+L(b+4*d2); why='The first letters step '+(d1>0?'+':'')+d1+' and the second letters '+(d2>0?'+':'')+d2+', independently.'; }
    var last=out[out.length-1];
    function shift(str,dd){ return str.split('').map(function(c){ return L(AZ.indexOf(c)+dd); }).join(''); }
    return {b:tb(tier,-0.5,0.3,0.9), stem:'Which letter group comes next?<br><br><b>'+out.join(', ')+', ?</b>',
      correct:W(nx, why),
      wrong:[W(shift(nx,1),'One place too far.'),W(shift(nx,-1),'One place short.'),W(shift(last,1),'Moves one place from the last term, ignoring the pattern.'),
        W(shift(nx,2),'Two places too far.'),W(nx.split('').reverse().join('')===nx?shift(nx,-2):nx.split('').reverse().join(''),'Right letters, wrong order.')],
      fast:'Turn letters into numbers (A = 1 ... Z = 26), work the number series, turn back.',
      p:{out:out,kind:kind}};
  },
  verify:function(q){
    /* recompute from the shown terms with the declared kind */
    var p=q.p, o=p.out, nx, idx=function(c){ return AZ.indexOf(c); };
    if(p.kind==='const'){ var d=idx(o[1])-idx(o[0]); nx=L(idx(o[4])+d); }
    else if(p.kind==='grow'){ var g1=((idx(o[1])-idx(o[0]))%26+26)%26; nx=L(idx(o[4])+g1+4); }
    else if(p.kind==='alt'){ var dn=((idx(o[1])-idx(o[2]))%26+26)%26; nx=L(idx(o[5])-dn); }
    else { var d1=((idx(o[1][0])-idx(o[0][0]))%26+26)%26, d2=((idx(o[1][1])-idx(o[0][1]))%26+26)%26; nx=L(idx(o[3][0])+d1)+L(idx(o[3][1])+d2); }
    return GEN.F.plain(q.opts[q.ans])===nx.toLowerCase();
  }
});

/* ===================== coding and decoding ===================== */
var WORDS=['PENCIL','GARDEN','RIVER','MARKET','TABLE','WINTER','PLANET','SILVER','BRIDGE','CANDLE','FOREST','ORANGE','TICKET','MIRROR','DOCTOR','SCHOOL','BASKET','MOTHER','ISLAND','LADDER'];
function code(w, kind, k){
  var s=w;
  if(kind==='rev'||kind==='revshift') s=s.split('').reverse().join('');
  if(kind==='shift'||kind==='revshift') s=s.split('').map(function(c){ return L(AZ.indexOf(c)+k); }).join('');
  if(kind==='alt') s=s.split('').map(function(c,i){ return L(AZ.indexOf(c)+(i%2?-k:k)); }).join('');
  return s;
}
GEN.add({
  id:'ia.series.code', topic:'ia.series', n:30, trick:'i.series.ladder',
  make:function(r,k,n){
    var tier=r.tier(k,n), kind=tier==='warm'?'shift':r.pick(['shift','revshift','alt','rev']), kk=r.pick([1,2,3,-1,-2]);
    if(kind==='rev') kk=0;
    var pair=r.sample(WORDS,2), a=pair[0], b=pair[1];
    var ans=code(b,kind,kk);
    var desc={shift:'each letter moves '+(kk>0?kk+' forward':(-kk)+' back'), rev:'the word is written backwards', revshift:'the word is reversed and then each letter moves '+(kk>0?kk+' forward':(-kk)+' back'), alt:'letters move alternately '+Math.abs(kk)+' '+(kk>0?'forward and back':'back and forward')}[kind];
    return {b:tb(tier,-0.5,0.3,0.9), stem:'In a certain code, <b>'+a+'</b> is written as <b>'+code(a,kind,kk)+'</b>. How is <b>'+b+'</b> written in that code?',
      correct:W(ans,'Here '+desc+'.'),
      wrong:[W(code(b,kind==='rev'?'shift':kind,kind==='rev'?1:-kk),kind==='rev'?'Shifts letters instead of reversing.':'Moves the letters the wrong way.'),
        W(code(b,kind==='revshift'?'shift':kind==='shift'?'revshift':'rev',kk||1),kind==='revshift'?'Forgets to reverse.':'Reverses when the code does not.'),
        W(code(b,kind==='rev'?'revshift':kind,(kk||1)+(kk>=0?1:-1)),'Off by one place.'),
        W(b,'Leaves the word uncoded.'),
        W(code(b,'shift',1).split('').reverse().join(''),'Mixes two different codes.')],
      fast:'Compare only the first letter pair and one more to confirm the rule. Do not decode the whole example.',
      p:{a:a,b:b,kind:kind,kk:kk}};
  },
  verify:function(q){ var p=q.p; return GEN.F.plain(q.opts[q.ans])===code(p.b,p.kind,p.kk).toLowerCase(); }
});

/* ===================== odd one out ===================== */
var PROPS=[
  {name:'perfect squares', f:function(x){ var s=Math.round(Math.sqrt(x)); return s*s===x; }, gen:function(r){ var v=r.int(3,25); return v*v; }},
  {name:'perfect cubes', f:function(x){ var c=Math.round(Math.cbrt(x)); return c*c*c===x; }, gen:function(r){ var v=r.int(2,12); return v*v*v; }},
  {name:'prime numbers', f:isPrime, gen:function(r){ return r.pick(PRIMES.slice(4)); }},
  {name:'multiples of 7', f:function(x){ return x%7===0; }, gen:function(r){ return 7*r.int(3,30); }},
  {name:'multiples of 13', f:function(x){ return x%13===0; }, gen:function(r){ return 13*r.int(3,20); }}
];
GEN.add({
  id:'ia.series.odd', topic:'ia.series', n:30, trick:'i.num.div',
  make:function(r,k,n){
    var tier=r.tier(k,n), P=r.pick(PROPS), set={}, xs=[];
    while(xs.length<4){ var v=P.gen(r); if(!set[v]){ set[v]=1; xs.push(v); } }
    var odd;
    for(var tries=0;tries<50;tries++){ var c=xs[r.int(0,3)]+r.pick([1,2,-1,-2,3,4]); if(c>1&&!P.f(c)&&!set[c]){ odd=c; break; } }
    if(odd===undefined) return null;
    /* no other property in the library may single out a different number */
    for(var j=0;j<PROPS.length;j++){ if(PROPS[j]===P) continue;
      var all=xs.concat([odd]), holds=all.filter(PROPS[j].f);
      if(holds.length===4 && !PROPS[j].f(odd)) return null;
      if(holds.length===1 && holds[0]!==odd) return null; }
    var shownNums=xs.concat([odd]).sort(function(a,b){ return a-b; });
    return {b:tb(tier,-0.4,0.3,0.8), stem:'Which number does not belong with the others?<br><br><b>'+shownNums.join(', ')+'</b>',
      correct:W(odd,'All the others are '+P.name+'; '+odd+' is not.'),
      wrong:xs.map(function(x){ return W(x, x+' is one of the '+P.name+', like the rest.'); }),
      fast:'Test the most distinctive property first: squares, cubes, primes, then small divisors.',
      p:{prop:PROPS.indexOf(P), odd:odd, xs:xs}};
  },
  verify:function(q){ var p=q.p, P=PROPS[p.prop]; return GEN.numOf(q.opts[q.ans])===p.odd && !P.f(p.odd) && p.xs.every(P.f); }
});

/* ===================== sets and Venn counting ===================== */
GEN.add({
  id:'ia.logic.venn', topic:'ia.logic', n:30, trick:'i.logic.two',
  make:function(r,k,n){
    var tier=r.tier(k,n), N=r.int(8,40)*5;
    if(tier!=='hard'){
      var both=r.int(5,40), onlyA=r.int(5,60), onlyB=r.int(5,60), none=N-both-onlyA-onlyB;
      if(none<0) return null;
      var A=onlyA+both, B=onlyB+both, things=r.pick([['tea','coffee'],['cricket','football'],['English newspapers','Bangla newspapers'],['bKash','Nagad']]);
      var ask=r.pick(['none','onlyA','exactly']), ans={none:none, onlyA:onlyA, exactly:onlyA+onlyB}[ask];
      var wd={none:'like neither', onlyA:'like only '+things[0], exactly:'like exactly one of the two'}[ask];
      return {b:tb(tier,-0.5,0.2,0.7), stem:'In a survey of '+N+' people, '+A+' like '+things[0]+', '+B+' like '+things[1]+', and '+both+' like both. How many '+wd+'?',
        correct:W(ans,'Only '+things[0]+': '+A+' &minus; '+both+' = '+onlyA+'. Only '+things[1]+': '+onlyB+'. At least one: '+(A+B-both)+'. Neither: '+none+'.'),
        wrong:[W(N-A-B<0?none+both:N-A-B,'Subtracts both groups from the total without adding back the overlap.'),
          W(A,'Counts everyone who likes '+things[0]+', including those who like both.'),
          W(A+B,'Adds the groups, counting the overlap twice.'),
          W(onlyA+onlyB+both,'Gives the number who like at least one.'),
          W(ans+both,'Adds the overlap once too often.'),
          W(Math.abs(A-B),'Subtracts the group sizes.')],
        fast:'Draw two circles, write the overlap ('+both+') first, then fill outwards.',
        p:{N:N,A:A,B:B,both:both,ask:ask}};
    }
    var ab=r.int(3,15), ac=r.int(3,15), bc=r.int(3,15), abc=r.int(1,Math.min(ab,ac,bc));
    var oA=r.int(5,30), oB=r.int(5,30), oC=r.int(5,30);
    var tot=oA+oB+oC+(ab-abc)+(ac-abc)+(bc-abc)+abc, none=N-tot;
    if(none<0) return null;
    var A3=oA+ab+ac-abc, B3=oB+ab+bc-abc, C3=oC+ac+bc-abc;
    return {b:1.1, stem:'Of '+N+' students, '+A3+' study French, '+B3+' Spanish and '+C3+' German. '+ab+' study French and Spanish, '+ac+' French and German, '+bc+' Spanish and German, and '+abc+' study all three. How many study none of the three?',
      correct:W(none,'At least one = '+A3+' + '+B3+' + '+C3+' &minus; '+ab+' &minus; '+ac+' &minus; '+bc+' + '+abc+' = '+tot+'; none = '+N+' &minus; '+tot+' = '+none+'.'),
      wrong:[W(N-(A3+B3+C3-ab-ac-bc),'Forgets to add back the students in all three.'),
        W(N-(A3+B3+C3-ab-ac-bc+2*abc),'Adds the triple overlap back twice.'),
        W(Math.max(0,N-(A3+B3+C3)),'Ignores every overlap.'),
        W(tot,'Gives the number who study at least one.'),
        W(none+abc,'Adds the triple overlap to the answer.')],
      fast:'Inclusion&ndash;exclusion: add singles, subtract pairs, add the triple back once.',
      p:{N:N,A3:A3,B3:B3,C3:C3,ab:ab,ac:ac,bc:bc,abc:abc,ask:'three'}};
  },
  verify:function(q){
    var p=q.p, v=GEN.numOf(q.opts[q.ans]);
    if(p.ask==='three') return v===p.N-(p.A3+p.B3+p.C3-p.ab-p.ac-p.bc+p.abc);
    var onlyA=p.A-p.both, onlyB=p.B-p.both, none=p.N-onlyA-onlyB-p.both;
    return v===({none:none, onlyA:onlyA, exactly:onlyA+onlyB})[p.ask];
  }
});

/* ===================== pigeonhole ===================== */
GEN.add({
  id:'ia.logic.pigeon', topic:'ia.logic', n:26, trick:'i.count.least',
  make:function(r,k,n){
    var tier=r.tier(k,n), colors=r.int(2,6), want=tier==='warm'?2:r.int(2,5), counts=[], i;
    for(i=0;i<colors;i++) counts.push(r.int(want+1,15));
    var ans=colors*(want-1)+1;
    var names=['red','blue','green','black','white','yellow'].slice(0,colors);
    return {b:tb(tier,-0.3,0.4,0.9),
      stem:'A drawer holds '+F.list(counts.map(function(c,j){ return c+' '+names[j]; }))+' socks, all mixed up. In the dark, what is the least number of socks you must take out to be sure of getting '+want+' of the same colour?',
      correct:W(ans,'Worst case: '+(want-1)+' of every colour ('+(colors*(want-1))+' socks) with no match yet; the next sock completes a set.'),
      wrong:[W(want,'Assumes the first '+want+' match.'),W(colors+1,'Uses the rule for a pair only.'),W(colors*want,'Takes '+want+' of every colour.'),
        W(ans-1,'Stops one sock short of the guarantee.'),W(Math.max.apply(null,counts)+1,'Plans around the largest colour.')],
      fast:'Worst case = (want &minus; 1) of each colour, plus one.', p:{colors:colors,want:want,counts:counts}};
  },
  verify:function(q){
    var p=q.p, v=GEN.numOf(q.opts[q.ans]);
    /* v draws guarantee it, v-1 do not (worst case) */
    var worst=0; p.counts.forEach(function(c){ worst+=Math.min(c,p.want-1); });
    return v===worst+1;
  }
});

/* ===================== arrangement puzzles ===================== */
function perms(n){
  var out=[], a=[]; for(var i=0;i<n;i++) a.push(i);
  (function go(k){ if(k===n){ out.push(a.slice()); return; }
    for(var i=k;i<n;i++){ var t=a[k]; a[k]=a[i]; a[i]=t; go(k+1); t=a[k]; a[k]=a[i]; a[i]=t; } })(0);
  return out;
}
var PERMS={5:perms(5), 6:perms(6)};
/* an arrangement p: p[person] = position (0 = left / ground / first) */
var THEMES=[
  {name:'row', intro:function(N,ppl){ return F.list(ppl)+' sit in a row of '+N+' seats facing north, numbered 1 to '+N+' from left to right.'; },
   end:'at one end of the row', notEnd:'does not sit at either end', left:'somewhere to the left of', imm:'immediately to the left of',
   pos:function(i){ return 'in seat '+(i+1); }, between:'sit between', adj:'sit next to each other', verb:'sits'},
  {name:'floors', intro:function(N,ppl){ return F.list(ppl)+' each live on a different floor of a '+N+'-storey building, floors numbered 1 (bottom) to '+N+' (top).'; },
   end:'on either the top or the bottom floor', notEnd:'lives on neither the top nor the bottom floor', left:'on a lower floor than', imm:'on the floor immediately below',
   pos:function(i){ return 'on floor '+(i+1); }, between:'live between', adj:'live on adjacent floors', verb:'lives'},
  {name:'days', intro:function(N,ppl){ return F.list(ppl)+' each give a talk on a different day, one per day, over '+N+' consecutive days numbered 1 to '+N+'.'; },
   end:'on the first or the last day', notEnd:'speaks on neither the first nor the last day', left:'on an earlier day than', imm:'on the day immediately before',
   pos:function(i){ return 'on day '+(i+1); }, between:'speak between', adj:'speak on consecutive days', verb:'speaks'}
];
function clueText(c, th, ppl, N){
  var X=ppl[c[1]], Y=ppl[c[2]];
  switch(c[0]){
    case 'end': return X+' '+th.verb+' '+th.end+'.';
    case 'notend': return X+' '+th.notEnd+'.';
    case 'left': return X+' '+th.verb+' '+th.left+' '+Y+'.';
    case 'imm': return X+' '+th.verb+' '+th.imm+' '+Y+'.';
    case 'gap': return 'Exactly '+c[3]+' '+(c[3]===1?'person':'people')+' '+th.between+' '+X+' and '+Y+'.';
    case 'notadj': return X+' and '+Y+' do not '+th.adj.replace(/^sit |^live |^speak /, function(m){ return m; })+'.';
    case 'at': return X+' '+th.verb+' '+th.pos(c[3])+'.';
    case 'notat': return X+' does not '+th.verb.replace(/s$/,'')+' '+th.pos(c[3])+'.';
  }
}
function clueOK(c, p, N){
  var a=p[c[1]], b=p[c[2]];
  switch(c[0]){
    case 'end': return a===0||a===N-1;
    case 'notend': return a!==0&&a!==N-1;
    case 'left': return a<b;
    case 'imm': return b===a+1;
    case 'gap': return Math.abs(a-b)===c[3]+1;
    case 'notadj': return Math.abs(a-b)!==1;
    case 'at': return a===c[3];
    case 'notat': return a!==c[3];
  }
  return false;
}
function solutions(clues, N){
  var out=[], P=PERMS[N];
  for(var i=0;i<P.length;i++){ var ok=true; for(var j=0;j<clues.length;j++) if(!clueOK(clues[j],P[i],N)){ ok=false; break; } if(ok) out.push(P[i]); }
  return out;
}
GEN.add({
  id:'ia.puzzle.order', topic:'ia.puzzle', n:48, trick:'i.puz.grid',
  make:function(r,k,n){
    var tier=r.tier(k,n), N=tier==='hard'?6:5, th=r.pick(THEMES), ppl=r.sample(GEN.NAMES,N);
    var truth=r.pick(PERMS[N]);                     /* truth[person] = position */
    var types=['end','notend','left','imm','gap','notadj','at','notat'];
    var clues=[], guard=0, alive=PERMS[N];
    while(alive.length>1 && guard++<200){
      var ty=r.pick(types), x=r.int(0,N-1), y=r.intNot(0,N-1,[x]), c;
      if(ty==='gap'){ var g=Math.abs(truth[x]-truth[y])-1; if(g<1) continue; c=[ty,x,y,g]; }
      else if(ty==='at'){ if(r.chance(0.6)) continue; c=[ty,x,0,truth[x]]; }
      else if(ty==='notat'){ var pos=r.intNot(0,N-1,[truth[x]]); c=[ty,x,0,pos]; }
      else c=[ty,x,y,0];
      if(!clueOK(c,truth,N)) continue;
      /* narrow the surviving arrangements instead of re-solving from scratch */
      var next=alive.filter(function(pm){ return clueOK(c,pm,N); });
      if(next.length===alive.length) continue;                         /* adds nothing */
      clues.push(c); alive=next;
    }
    if(alive.length!==1) return null;
    /* trim: drop any clue the puzzle does not need */
    for(var i=clues.length-1;i>=0;i--){
      var without=clues.slice(0,i).concat(clues.slice(i+1));
      if(solutions(without,N).length===1) clues=without;
    }
    if(clues.length<3) return null;
    var who=[]; for(var pI=0;pI<N;pI++) who[truth[pI]]=ppl[pI];
    var askKind=r.pick(['who','between','nextto']), stem, correct, wrong=[];
    var intro=th.intro(N,ppl)+'<br><br>'+clues.map(function(c){ return clueText(c,th,ppl,N); }).join('<br>')+'<br><br>';
    if(askKind==='who'){
      var slot=r.int(0,N-1);
      stem=intro+'Who '+th.verb+' '+th.pos(slot)+'?';
      correct=W(who[slot],'The only arrangement that fits every clue, in order, is '+who.join(', ')+'.');
      wrong=ppl.filter(function(x){ return x!==who[slot]; }).map(function(x){ return W(x, x+' '+th.verb+' '+th.pos(truth[ppl.indexOf(x)])+' in the only arrangement that fits.'); });
    } else if(askKind==='between'){
      var a2=r.int(0,N-1), b2=r.intNot(0,N-1,[a2]), cnt=Math.abs(truth[a2]-truth[b2])-1;
      stem=intro+'How many people '+th.between+' '+ppl[a2]+' and '+ppl[b2]+'?';
      correct=W(String(cnt),'In the only arrangement that fits ('+who.join(', ')+'), '+cnt+' '+th.between.split(' ')[0]+' between them.');
      for(var g2=0; g2<=N-2; g2++) if(g2!==cnt) wrong.push(W(String(g2),'That count does not match the one arrangement the clues allow ('+who.join(', ')+').'));
      if(wrong.length<4) wrong.push(W(String(N-1),'Counts every other person.'));
    } else {
      var at=r.int(0,N-2), X=who[at], Y=who[at+1];
      stem=intro+'Who '+th.verb+' '+(th.name==='row'?'immediately to the right of':th.name==='floors'?'on the floor immediately above':'on the day immediately after')+' '+X+'?';
      correct=W(Y,'The arrangement is '+who.join(', ')+'; '+Y+' comes straight after '+X+'.');
      wrong=ppl.filter(function(x){ return x!==Y&&x!==X; }).map(function(x){ return W(x, x+' is not next in the only arrangement that fits ('+who.join(', ')+').'); });
      if(wrong.length<4) wrong.push(W('No one','Someone does come next.'));
    }
    return {b:tb(tier,-0.2,0.5,1.1)+clues.length*0.03, stem:stem, correct:correct, wrong:wrong,
      fast:'Place the fixed clues first (ends, exact positions), then the "immediately" pairs as blocks, then test the rest. Write one row of '+N+' boxes.',
      p:{N:N, clues:clues, truth:truth, ppl:ppl, ask:askKind}};
  },
  verify:function(q){
    var p=q.p, sols=solutions(p.clues,p.N);
    if(sols.length!==1) return false;
    var s=sols[0], who=[]; for(var i=0;i<p.N;i++) who[s[i]]=p.ppl[i];
    var key=GEN.F.plain(q.opts[q.ans]), m;
    if(p.ask==='between'){ m=q.stem.match(/between ([A-Za-z]+) and ([A-Za-z]+)\?/); return +key===Math.abs(s[p.ppl.indexOf(m[1])]-s[p.ppl.indexOf(m[2])])-1; }
    if(p.ask==='who'){ m=GEN.F.plain(q.stem).match(/(?:seat|floor|day) (\d+)\?$/); return key===who[+m[1]-1].toLowerCase(); }
    m=q.stem.match(/ ([A-Za-z]+)\?$/); return key===who[s[p.ppl.indexOf(m[1])]+1].toLowerCase();
  }
});

/* ===================== syllogisms ===================== */
/* regions of three sets A, B, C: bit 1 = in A, 2 = in B, 4 = in C (0..7) */
function holds(form, X, Y, model){
  var bx=X, by=Y, anyXY=false, anyXnotY=false;
  for(var reg=0;reg<8;reg++){ if(!(model&(1<<reg))) continue;
    var inX=!!(reg&bx), inY=!!(reg&by);
    if(inX&&inY) anyXY=true; if(inX&&!inY) anyXnotY=true; }
  if(form==='all') return !anyXnotY;
  if(form==='no') return !anyXY;
  if(form==='some') return anyXY;
  if(form==='somenot') return anyXnotY;
}
function nonEmpty(bit, model){ for(var reg=0;reg<8;reg++) if((model&(1<<reg)) && (reg&bit)) return true; return false; }
function valid(prem, concl, withImport){
  for(var m=0;m<256;m++){
    var ok=prem.every(function(pr){ return holds(pr[0],pr[1],pr[2],m); });
    if(!ok) continue;
    if(withImport && !prem.every(function(pr){ return nonEmpty(pr[1],m); })) continue;
    if(!holds(concl[0],concl[1],concl[2],m)) return false;
  }
  return true;
}
function sText(form, X, Y){
  return form==='all' ? 'All '+X+' are '+Y+'.' : form==='no' ? 'No '+X+' are '+Y+'.' : form==='some' ? 'Some '+X+' are '+Y+'.' : 'Some '+X+' are not '+Y+'.';
}
var NOUNS=['doctors','painters','cyclists','teachers','singers','engineers','farmers','poets','chess players','swimmers','bankers','pilots'];
GEN.add({
  id:'ia.deduce.syllogism', topic:'ia.deduce', n:40, trick:'i.deduce.must',
  make:function(r,k,n){
    var tier=r.tier(k,n), names=r.sample(NOUNS,3), bit={A:1,B:2,C:4};
    var forms=['all','no','some','somenot'];
    var p1=[r.pick(forms),1,2], p2=[r.pick(tier==='warm'?['all','no']:forms),2,4];
    if(r.chance(0.5)) p2=[p2[0],4,2];
    var prem=[p1,p2];
    var cands=[], seenTxt={};
    [[1,4],[4,1],[1,2],[2,4],[4,2],[2,1]].forEach(function(pr){ forms.forEach(function(f){
      var c=[f,pr[0],pr[1]], txt=sText(f, names[Math.log2(pr[0])], names[Math.log2(pr[1])]);
      if(seenTxt[txt]) return; seenTxt[txt]=1;
      var isPremise=prem.some(function(pp){ return pp[0]===f&&pp[1]===pr[0]&&pp[2]===pr[1]; });
      if(isPremise) return;
      cands.push({c:c, txt:txt, v:valid(prem,c,false), vi:valid(prem,c,true)});
    }); });
    /* the key: valid with no assumption; traps: invalid even if every group is non-empty */
    var keys=cands.filter(function(x){ return x.v && (x.c[1]===1&&x.c[2]===4 || x.c[1]===4&&x.c[2]===1); });
    if(!keys.length) return null;
    var key=r.pick(keys);
    var traps=cands.filter(function(x){ return !x.vi; });
    if(traps.length<4) return null;
    traps=r.shuffle(traps);
    var map={}; map[key.txt]=key.c; traps.slice(0,6).forEach(function(x){ map[x.txt]=x.c; });
    var pT=sText(p1[0],names[0],names[1]), qT=sText(p2[0],names[Math.log2(p2[1])],names[Math.log2(p2[2])]);
    return {b:tb(tier,-0.2,0.5,1.0),
      stem:'Statements:<br>1. '+pT+'<br>2. '+qT+'<br><br>Which of the following conclusions <b>must</b> be true?',
      correct:W(key.txt,'Every way of drawing the three groups that satisfies both statements makes this true.'),
      wrong:traps.slice(0,6).map(function(x){ return W(x.txt,'It is possible to draw the groups so that both statements hold and this one does not &mdash; it could be true, but it need not be.'); }),
      fast:'Link the two statements through the shared middle term ('+names[1]+'). A conclusion must survive every drawing, not just the obvious one.',
      p:{prem:prem, map:map}};
  },
  verify:function(q){
    var p=q.p;
    return q.opts.every(function(o,i){
      var c=p.map[o]; if(!c) return false;
      return i===q.ans ? valid(p.prem,c,false) : !valid(p.prem,c,true);
    });
  }
});

})();
