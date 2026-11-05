/* ===========================================================
   GEN — reference templates.

   Four generators written as the pattern for every other file in
   js/gen/. Each shows one of the things a generator must get right:

     gq.frac.chain   five options, every wrong one a named mistake
     gq.alg.qcsign   quantitative comparison with all four answers
                     equally common, and the answer PROVEN by testing
                     values rather than asserted
     im.rate.pipes   IBA work-rate, answer in hours and minutes
     gq.num.remain   numeric entry

   A `verify` function recomputes the answer by a different route. The
   content checker runs it on every variant.
   =========================================================== */
(function(){
var F=GEN.F;

/* ---------------------------------------------------------------
   Successive percent changes
   --------------------------------------------------------------- */
GEN.add({
  id:'gq.frac.chain', topic:'gq.frac', n:30, trick:'g.pct.mult',
  make:function(r, k, n){
    var tier=r.tier(k,n);
    var start=r.pick(tier==='warm'?[80,120,200,400,500]:[240,360,480,625,750,840,1250,1600]);
    var steps=tier==='hard'?3:2;
    var ch=[], i;
    for(i=0;i<steps;i++) ch.push(r.sign()*r.pick([5,10,12,15,20,25,30,40]));
    if(ch.every(function(c){ return c===ch[0]; })) return null;
    var f=1; for(i=0;i<steps;i++) f*=1+ch[i]/100;
    var fin=start*f;
    if(Math.abs(fin*100-Math.round(fin*100))>1e-6) return null;      /* cents only */
    var sum=0; for(i=0;i<steps;i++) sum+=ch[i];
    var added=start*(1+sum/100);
    var lastOnly=start*(1+ch[steps-1]/100);
    var flip=ch.slice(); flip[0]=-flip[0];
    var ff=1; for(i=0;i<steps;i++) ff*=1+flip[i]/100;
    var descr=ch.map(function(c){ return (c>0?'rises ':'falls ')+Math.abs(c)+'%'; });
    var net=(f-1)*100;
    var ask=r.chance(0.5)?'price':'net';
    var stem='A product priced at '+F.money(start,'$',0)+' '+F.list(descr.map(function(d,j){
      return j===0?d:'then '+d; }))+'. ';
    var why0='Each change multiplies: '+ch.map(function(c){ return F.n(1+c/100,2); }).join(' &times; ')+
             ' = '+F.n(f,4)+'.';
    if(ask==='price'){
      return {b: tier==='warm'?-0.6:tier==='exam'?0.2:0.9,
        stem:stem+'What is the final price?',
        correct:{t:F.money(fin), why:why0+' '+F.money(start,'$',0)+' &times; '+F.n(f,4)+' = '+F.money(fin)+'.'},
        wrong:[
          {t:F.money(added), why:'Adds the percentages ('+F.n(sum,0)+'%) as if every change were taken on the original price.'},
          {t:F.money(start*ff), why:'Reverses the direction of the first change.'},
          {t:F.money(lastOnly), why:'Applies only the last change and forgets the earlier ones.'},
          {t:F.money(start*(1-sum/100)), why:'Adds the percentages and then gets the sign backwards as well.'},
          {t:F.money(fin+start*0.01*Math.abs(ch[0])), why:'Slip in the last multiplication.'},
          {t:F.money(start), why:'Assumes the changes cancel. Percentages of different bases never cancel.'}
        ],
        fast:'Turn each change into a multiplier and chain them: '+ch.map(function(c){
          return F.n(1+c/100,2); }).join(' &times; ')+'. Never add percentages.',
        p:{start:start, ch:ch, ask:ask}};
    }
    return {b: tier==='warm'?-0.4:tier==='exam'?0.35:1.05,
      stem:stem+'By what percent has the price changed overall?',
      correct:{t:(net<0?'Down ':'Up ')+F.pct(Math.abs(net)), why:why0+' That is '+(net<0?'a fall':'a rise')+' of '+F.pct(Math.abs(net))+'.'},
      wrong:[
        {t:(sum<0?'Down ':sum>0?'Up ':'No change, ')+(sum===0?'0%':F.pct(Math.abs(sum))), why:'Adds the percentages ('+F.n(sum,0)+'%). Each change acts on a different base.'},
        {t:(net<0?'Up ':'Down ')+F.pct(Math.abs(net)), why:'Right size, wrong direction.'},
        {t:(ff<1?'Down ':'Up ')+F.pct(Math.abs((ff-1)*100)), why:'Reverses the first change.'},
        {t:'No change', why:'Percentages of different bases do not cancel.'},
        {t:(net<0?'Down ':'Up ')+F.pct(Math.abs(net)*2), why:'Doubles the net change.'}
      ],
      fast:'Chain the multipliers ('+ch.map(function(c){ return F.n(1+c/100,2); }).join(' &times; ')+
           ' = '+F.n(f,4)+') and read the change off the decimal.',
      p:{start:start, ch:ch, ask:ask}};
  },
  verify:function(q){
    var p=q.p, v=p.start;
    p.ch.forEach(function(c){ v=v+v*c/100; });
    var shown=GEN.F.plain(q.opts[q.ans]);
    if(p.ask==='price') return Math.abs(GEN.numOf(q.opts[q.ans])-v)<0.006;
    var pct=(v/p.start-1)*100;
    return shown.indexOf(pct<0?'down':'up')===0 && Math.abs(parseFloat(shown.replace(/[^0-9.]/g,''))-Math.abs(pct))<0.006;
  }
});

/* ---------------------------------------------------------------
   Quantitative comparison under a constraint.
   The answer class is chosen by k, so across the 36 variants A, B,
   equal and cannot-be-determined each appear nine times. The class is
   then PROVEN by testing values that satisfy the constraint — if the
   test disagrees with the family's declared class, the draw is thrown
   away rather than shipped.
   --------------------------------------------------------------- */
var TEST=[-12,-5,-3,-2,-1.5,-1,-0.75,-0.5,-0.25,-0.1,0,0.1,0.25,0.5,0.75,1,1.5,2,3,5,12];
function klass(fam, m){
  var xs=TEST.concat([m,-m,m+0.5,m-0.5,m/2,-m/2,m*3]).filter(function(x){ return fam.ok(x,m); });
  var pos=0, neg=0, zero=0, w={};
  xs.forEach(function(x){
    var d=fam.A(x,m)-fam.B(x,m);
    if(Math.abs(d)<1e-9){ zero++; if(w.z===undefined) w.z=x; }
    else if(d>0){ pos++; if(w.a===undefined) w.a=x; }
    else { neg++; if(w.b===undefined) w.b=x; }
  });
  if(!xs.length) return null;
  var c = pos&&!neg&&!zero ? 0 : neg&&!pos&&!zero ? 1 : zero&&!pos&&!neg ? 2 : 3;
  return {c:c, w:w};
}
function wtxt(x){ return 'x = '+F.n(x,2); }
var FAMS=[
  {c:0, con:function(m){ return 'x &gt; '+m; }, ok:function(x,m){ return x>m; },
   A:function(x){ return x*x; }, B:function(x,m){ return m*x; },
   at:function(){ return 'x<sup>2</sup>'; }, bt:function(m){ return m+'x'; }},
  {c:1, con:function(m){ return '0 &lt; x &lt; '+m; }, ok:function(x,m){ return x>0&&x<m; },
   A:function(x){ return x*x; }, B:function(x,m){ return m*x; },
   at:function(){ return 'x<sup>2</sup>'; }, bt:function(m){ return m+'x'; }},
  {c:3, con:function(){ return 'x &gt; 0'; }, ok:function(x){ return x>0; },
   A:function(x){ return x*x; }, B:function(x,m){ return m*x; },
   at:function(){ return 'x<sup>2</sup>'; }, bt:function(m){ return m+'x'; }},
  {c:0, con:function(){ return 'x &gt; 0'; }, ok:function(x){ return x>0; },
   A:function(x,m){ return (x+m)*(x+m); }, B:function(x,m){ return x*x+m*m; },
   at:function(m){ return '(x + '+m+')<sup>2</sup>'; }, bt:function(m){ return 'x<sup>2</sup> + '+(m*m); }},
  {c:1, con:function(){ return 'x &lt; 0'; }, ok:function(x){ return x<0; },
   A:function(x,m){ return (x+m)*(x+m); }, B:function(x,m){ return x*x+m*m; },
   at:function(m){ return '(x + '+m+')<sup>2</sup>'; }, bt:function(m){ return 'x<sup>2</sup> + '+(m*m); }},
  {c:3, con:function(){ return 'x is an integer'; }, ok:function(x){ return x===Math.round(x); },
   A:function(x,m){ return (x+m)*(x+m); }, B:function(x,m){ return x*x+m*m; },
   at:function(m){ return '(x + '+m+')<sup>2</sup>'; }, bt:function(m){ return 'x<sup>2</sup> + '+(m*m); }},
  {c:2, con:function(){ return 'x is a real number'; }, ok:function(){ return true; },
   A:function(x,m){ return (x+m)*(x-m); }, B:function(x,m){ return x*x-m*m; },
   at:function(m){ return '(x + '+m+')(x &minus; '+m+')'; }, bt:function(m){ return 'x<sup>2</sup> &minus; '+(m*m); }},
  {c:2, con:function(){ return 'x &ne; 0'; }, ok:function(x){ return x!==0; },
   A:function(x,m){ return m*x*x/x; }, B:function(x,m){ return m*x; },
   at:function(m){ return m+'x<sup>2</sup> &divide; x'; }, bt:function(m){ return m+'x'; }},
  {c:1, con:function(m){ return '&minus;1 &lt; x &lt; 0'; }, ok:function(x){ return x>-1&&x<0; },
   A:function(x,m){ return m*x; }, B:function(x,m){ return m*x*x*x; },
   at:function(m){ return m+'x'; }, bt:function(m){ return m+'x<sup>3</sup>'; }},
  {c:3, con:function(){ return 'x &lt; 0'; }, ok:function(x){ return x<0; },
   A:function(x){ return x*x; }, B:function(x,m){ return -m*x; },
   at:function(){ return 'x<sup>2</sup>'; }, bt:function(m){ return '&minus;'+m+'x'; }},
  {c:0, con:function(){ return 'x &lt; &minus;1'; }, ok:function(x){ return x<-1; },
   A:function(x){ return x*x; }, B:function(x){ return -x; },
   at:function(){ return 'x<sup>2</sup>'; }, bt:function(){ return '&minus;x'; }},
  {c:3, con:function(){ return 'x &ne; 0'; }, ok:function(x){ return x!==0; },
   A:function(x,m){ return m/x; }, B:function(x){ return x; },
   at:function(m){ return m+'/x'; }, bt:function(){ return 'x'; }}
];
GEN.add({
  id:'gq.alg.qcsign', topic:'gq.alg', type:'qc', n:36, trick:'g.qc.plug',
  make:function(r, k){
    var want=k%4;
    var fams=FAMS.filter(function(f){ return f.c===want; });
    var fam=r.pick(fams), m=r.int(2,9);
    var got=klass(fam, m);
    if(!got || got.c!==want) return null;
    var w=got.w, why;
    var lines={
      a: w.a!==undefined ? wtxt(w.a)+' makes A larger' : null,
      b: w.b!==undefined ? wtxt(w.b)+' makes B larger' : null,
      z: w.z!==undefined ? wtxt(w.z)+' makes them equal' : null
    };
    var every=['A is larger','B is larger','they are equal'][want];
    if(want===3){
      var shown=[lines.a,lines.b,lines.z].filter(Boolean);
      why=[
        'True for some values only: '+shown.join('; ')+'.',
        'True for some values only: '+shown.join('; ')+'.',
        'Equal only by coincidence, if at all: '+shown.join('; ')+'.',
        'Right. '+shown.slice(0,2).join(', while ')+'. Two plugs that disagree settle it.'
      ];
    } else {
      why=[0,1,2,3].map(function(o){
        if(o===want) return 'Right. For every x allowed by the condition, '+every+'.';
        if(o===3) return 'Cannot be determined only if two allowed values disagree. Here none do &mdash; test the edges of the condition, not just x = 2.';
        return ['A is never the larger here.','B is never the larger here.','They are never equal here.'][o]+
               ' Plug a value just inside the condition to see it.';
      });
    }
    var b = want===3 ? r.pick([0.4,0.7,0.9]) : want===2 ? r.pick([0.1,0.5]) : r.pick([0.3,0.6,1.0]);
    return {type:'qc', b:b, pre:fam.con(m), qa:fam.at(m), qb:fam.bt(m), ans:want, why:why,
      fast: want===3
        ? 'Plug the edges: a value just inside the condition and a large one. '+[lines.a,lines.b,lines.z].filter(Boolean).slice(0,2).join('; ')+'. Disagreement means D.'
        : 'Subtract: A &minus; B, then ask what the condition does to its sign. Test one value near each edge to confirm.',
      p:{fam:FAMS.indexOf(fam), m:m}};
  },
  verify:function(q){
    var fam=FAMS[q.p.fam], m=q.p.m;
    var xs=[], i;
    for(i=-400;i<=400;i++) xs.push(i/20);
    xs=xs.concat([0.01,-0.01,0.99,-0.99,1.01,-1.01,m+0.01,m-0.01,-m+0.01]);
    xs=xs.filter(function(x){ return fam.ok(x,m); });
    var pos=0,neg=0,zero=0;
    xs.forEach(function(x){ var d=fam.A(x,m)-fam.B(x,m);
      if(Math.abs(d)<1e-9) zero++; else if(d>0) pos++; else neg++; });
    var c = pos&&!neg&&!zero ? 0 : neg&&!pos&&!zero ? 1 : zero&&!pos&&!neg ? 2 : 3;
    return c===q.ans;
  }
});

/* ---------------------------------------------------------------
   IBA: two pipes (or workers), sometimes with a leak
   --------------------------------------------------------------- */
function hm(mins){
  var h=Math.floor(mins/60), m=Math.round(mins-h*60);
  if(m===60){ h++; m=0; }
  return (h? h+' hour'+(h===1?'':'s') : '')+(h&&m?' ':'')+(m? m+' minute'+(m===1?'':'s') : '')||'0 minutes';
}
GEN.add({
  id:'im.rate.pipes', topic:'im.rate', n:30, trick:'i.rate.lcm',
  make:function(r, k, n){
    var tier=r.tier(k,n);
    var a=r.int(3,15), b=r.intNot(3,20,[a]);
    var leak = tier==='hard' ? r.int(Math.max(a,b)+2, 40) : 0;
    var rate=1/a+1/b-(leak?1/leak:0);
    if(rate<=0) return null;
    var mins=60/rate;
    if(Math.abs(mins-Math.round(mins))>1e-6) return null;       /* whole minutes only */
    mins=Math.round(mins);
    var who=r.pick([['Pipe A','Pipe B','fill the tank'],['Karim','Rahim','paint the wall'],
                    ['Machine X','Machine Y','print the order']]);
    var stem=who[0]+' can '+who[2]+' in '+a+' hours and '+who[1]+' can do it in '+b+' hours.'+
      (leak?' A leak in the bottom would, on its own, empty the full tank in '+leak+' hours.':'')+
      ' Working together'+(leak?' with the leak open':'')+', how long do they take?';
    if(leak) stem=stem.replace(who[2],'fill the tank').replace('do it','fill it');
    var avg=(a+b)/2*60, sum=(a+b)*60;
    var noLeak=60/(1/a+1/b);
    var hmean=2*a*b/(a+b)*60;
    return {b: tier==='warm'?-0.5:tier==='exam'?0.2:0.85,
      stem:stem,
      correct:{t:hm(mins), why:'Rates add: 1/'+a+' + 1/'+b+(leak?' &minus; 1/'+leak:'')+' = '+F.n(rate,4)+
        ' of the job per hour, so the whole job takes 1 &divide; that = '+hm(mins)+'.'},
      wrong:[
        {t:hm(avg), why:'Averages the two times. Times do not add or average &mdash; rates do.'},
        {t:hm(hmean), why:'Uses 2ab/(a + b), the average-speed formula, which is twice the right answer.'},
        {t:leak?hm(noLeak):hm(sum), why:leak?'Forgets to subtract the leak.':'Adds the times, as if one worked after the other.'},
        {t:hm(Math.abs(a-b)*60||30), why:'Subtracts the times &mdash; there is no reason to.'},
        {t:hm(mins+30), why:'Converts the decimal part of the hour to minutes incorrectly.'},
        {t:hm(Math.min(a,b)*60), why:'Takes the faster worker alone; working together must be quicker than that.'}
      ],
      fast:'Make the tank '+F.lcm(F.lcm(a,b),leak||1)+' units (the LCM). Then the rates are whole numbers per hour: add them'+
           (leak?', subtract the leak,':'')+' and divide.',
      p:{a:a, b:b, leak:leak}};
  },
  verify:function(q){
    var p=q.p, rate=1/p.a+1/p.b-(p.leak?1/p.leak:0), mins=Math.round(60/rate);
    var t=GEN.F.plain(q.opts[q.ans]);
    var h=(t.match(/(\d+) hour/)||[0,0])[1]*1, m=(t.match(/(\d+) minute/)||[0,0])[1]*1;
    return h*60+m===mins;
  }
});

/* ---------------------------------------------------------------
   Remainders, numeric entry
   --------------------------------------------------------------- */
GEN.add({
  id:'gq.num.remain', topic:'gq.num', type:'ne', n:24, trick:'g.num.div',
  make:function(r, k, n){
    var tier=r.tier(k,n);
    var d=r.int(5,13), rem=r.int(1,d-1);
    var kind=tier==='hard' ? r.pick(['sq','prod']) : r.pick(['mult','add']);
    var c=r.int(2,9), ans, stem, how;
    if(kind==='mult'){ ans=(c*rem)%d; stem='What is the remainder when '+c+'n is divided by '+d+'?';
      how=c+' &times; '+rem+' = '+c*rem+', and '+c*rem+' leaves '+ans+' when divided by '+d+'.'; }
    else if(kind==='add'){ ans=(rem+c*d+c)%d; stem='What is the remainder when n + '+(c*d+c)+' is divided by '+d+'?';
      how=rem+' + '+(c*d+c)+' leaves the same remainder as '+rem+' + '+c+' = '+(rem+c)+', which is '+ans+'.'; }
    else if(kind==='sq'){ ans=(rem*rem)%d; stem='What is the remainder when n<sup>2</sup> is divided by '+d+'?';
      how=rem+'<sup>2</sup> = '+rem*rem+', which leaves '+ans+'.'; }
    else { var rem2=r.int(1,d-1); ans=(rem*rem2)%d;
      stem='When m is divided by '+d+' the remainder is '+rem2+'. What is the remainder when mn is divided by '+d+'?';
      how=rem+' &times; '+rem2+' = '+rem*rem2+', which leaves '+ans+'.'; }
    return {type:'ne', b: tier==='warm'?-0.4:tier==='exam'?0.3:0.95,
      stem:'When the positive integer n is divided by '+d+', the remainder is '+rem+'. '+stem,
      ans:{v:ans}, why:['Work with the remainders only. '+how],
      fast:'Replace n with the smallest number that fits &mdash; n = '+rem+' &mdash; and compute directly. '+how,
      p:{d:d, rem:rem, kind:kind, c:c, ans:ans}};
  },
  verify:function(q){
    /* brute force over many actual n */
    var p=q.p, ok=true;
    for(var t=0;t<30;t++){
      var nn=p.rem+t*p.d, v;
      if(p.kind==='mult') v=(p.c*nn)%p.d;
      else if(p.kind==='add') v=(nn+p.c*p.d+p.c)%p.d;
      else if(p.kind==='sq') v=(nn*nn)%p.d;
      else { var mm=(q.stem.match(/remainder is (\d+)\. What/)||[0,0])[1]*1 + t*p.d; v=(mm*nn)%p.d; }
      if(v!==q.ans.v) ok=false;
    }
    return ok;
  }
});

})();
