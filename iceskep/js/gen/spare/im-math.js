/* ===========================================================
   GEN — IBA mathematics.

   Part 1 reuses the arithmetic families IBA shares with GRE quant,
   each with its own seed, Taka prices and five options, under IBA's
   one-minute clock.
   Part 2 is the IBA-only material: trains, boats, clocks, calendars,
   marked price and discount, partnership, alligation, and data
   sufficiency decided by enumeration.
   =========================================================== */
(function(){
var F=GEN.F;
function W(t,why){ return {t:t, why:why}; }
function tb(t,w,e,h){ return t==='warm'?w:t==='exam'?e:h; }

/* ---------- part 1: shared families ---------- */
[
  ['im.num.divcount','im.num','gq.num.divcount','i.num.div'],
  ['im.num.lcmgcd','im.num','gq.num.lcmgcd','i.num.div'],
  ['im.num.consec','im.num','gq.num.consec','i.alg.pick'],
  ['im.num.digit','im.num','gq.num.digit','i.num.div'],
  ['im.num.units','im.num','gq.num.units','i.num.div'],
  ['im.num.factpow','im.num','gq.num.factpow','i.num.div'],
  ['im.pct.chain','im.pct','gq.frac.chain','i.pct.chain'],
  ['im.pct.more','im.pct','gq.frac.pctmore','i.pct.chain'],
  ['im.pct.remain','im.pct','gq.frac.remain','i.pct.ofof'],
  ['im.pct.points','im.pct','gq.frac.points','i.pct.chain'],
  ['im.pct.ofpct','im.pct','gq.frac.ofpct','i.pct.ofof'],
  ['im.pct.undo','im.pct','gq.frac.undo','i.pct.chain'],
  ['im.pct.interest','im.pct','gq.word.interest','i.pct.chain'],
  ['im.ratio.split','im.ratio','gq.ratio.split','i.ratio.allig'],
  ['im.ratio.chain','im.ratio','gq.ratio.chain','i.ratio.allig'],
  ['im.ratio.change','im.ratio','gq.ratio.change','i.alg.plug'],
  ['im.ratio.mix','im.ratio','gq.ratio.mix','i.ratio.allig'],
  ['im.ratio.inverse','im.ratio','gq.ratio.inverse','i.rate.lcm'],
  ['im.ratio.weighted','im.ratio','gq.stat.weighted','i.ratio.allig'],
  ['im.ratio.missing','im.ratio','gq.stat.missing','i.ratio.allig'],
  ['im.ratio.age','im.ratio','gq.word.age','i.alg.plug'],
  ['im.alg.quad','im.alg','gq.alg.quad','i.alg.plug'],
  ['im.alg.absval','im.alg','gq.alg.absval','i.alg.plug'],
  ['im.alg.funcop','im.alg','gq.alg.funcop','i.alg.pick'],
  ['im.alg.lin2','im.alg','gq.alg.lin2','i.alg.plug'],
  ['im.alg.samebase','im.alg','gq.exp.samebase','i.alg.plug'],
  ['im.alg.factor','im.alg','gq.exp.factor','i.num.diffsq'],
  ['im.alg.radical','im.alg','gq.exp.radical','i.num.diffsq'],
  ['im.rate.meet','im.rate','gq.word.meet','i.rate.relative'],
  ['im.rate.avgspeed','im.rate','gq.word.avgspeed','i.rate.avg',19],
  ['im.geo.special','im.geo','gq.geo.special','i.geo.triple'],
  ['im.geo.third','im.geo','gq.geo.third','i.geo.triple'],
  ['im.geo.polygon','im.geo','gq.geo.polygon','i.geo.scale'],
  ['im.geo.similar','im.geo','gq.geo.similar','i.geo.scale'],
  ['im.geo.equil','im.geo','gq.geo.equil','i.geo.triple'],
  ['im.geo.sector','im.geo','gq.circ.sector','i.geo.scale'],
  ['im.geo.solid','im.geo','gq.circ.solid','i.geo.triple'],
  ['im.geo.shaded','im.geo','gq.circ.shaded','i.geo.scale'],
  ['im.count.letters','im.count','gq.comb.letters','i.count.slots',19],
  ['im.count.committee','im.count','gq.comb.committee','i.count.slots'],
  ['im.count.row','im.count','gq.comb.row','i.count.slots'],
  ['im.count.draw','im.count','gq.prob.draw','i.count.least'],
  ['im.count.dice','im.count','gq.prob.dice','i.count.least',23],
  ['im.count.indep','im.count','gq.prob.indep','i.count.least'],
  ['im.di.change','im.di','gq.di.change','i.di.round'],
  ['im.di.share','im.di','gq.di.share','i.di.round'],
  ['im.di.growth','im.di','gq.di.growth','i.di.round']
].forEach(function(a){ GEN.alias(a[0], a[1], a[2], {trick:a[3], n:a[4]}); });

/* ---------- part 2: IBA-only families ---------- */

/* trains */
GEN.add({
  id:'im.rate.train', topic:'im.rate', n:30, trick:'i.rate.relative',
  make:function(r,k,n){
    var t=r.tier(k,n), kind=t==='warm'?'pole':r.pick(['platform','cross','overtake']);
    var v=r.pick([36,45,54,60,72,90,108]), L=r.int(8,40)*10, ms=v*5/18, secs, stem, wrong, how;
    if(kind==='pole'){ secs=L/ms; stem='A train '+L+' m long runs at '+v+' km/h. How many seconds does it take to pass a signal post?'; how=L+' m &divide; '+F.n(ms,2)+' m/s';
      wrong=[W(F.n(L/v,2),'Divides by the speed in km/h without converting to m/s.'),W(F.n(2*L/ms,2),'Counts the length twice.'),W(F.n(L*18/(v*5)*3.6,2),'Converts twice.'),W(F.n(secs+10,0),'Arithmetic slip.'),W(F.n(L/(v*18/5),2),'Converts the wrong way (&times;18/5).')]; }
    else if(kind==='platform'){ var P=r.int(10,50)*10; secs=(L+P)/ms; stem='A train '+L+' m long, running at '+v+' km/h, crosses a platform '+P+' m long. How many seconds does it take?'; how='('+L+' + '+P+') m &divide; '+F.n(ms,2)+' m/s';
      wrong=[W(F.n(L/ms,2),'Covers only the train\'s own length; it must clear the platform too.'),W(F.n(P/ms,2),'Covers only the platform.'),W(F.n((L+P)/v,2),'Forgets to convert km/h to m/s.'),W(F.n((P-L)/ms,2),'Subtracts the lengths.'),W(F.n((L+P)*18/(v*5)+5,0),'Arithmetic slip.')]; }
    else { var v2=r.pick([18,27,36,45,54]), L2=r.int(8,30)*10, rel=kind==='cross'?v+v2:v-v2;
      if(rel<=0) return null; secs=(L+L2)/(rel*5/18);
      stem='Two trains, '+L+' m and '+L2+' m long, run on parallel tracks '+(kind==='cross'?'towards each other':'in the same direction')+' at '+v+' km/h and '+v2+' km/h. How many seconds do they take to pass each other completely?';
      how='('+L+' + '+L2+') m &divide; '+(kind==='cross'?'(':'(')+v+(kind==='cross'?' + ':' &minus; ')+v2+') km/h in m/s';
      wrong=[W(F.n((L+L2)/((kind==='cross'?v-v2:v+v2)*5/18),2),kind==='cross'?'Subtracts the speeds; trains moving towards each other close at the sum.':'Adds the speeds; same direction closes at the difference.'),
        W(F.n(L/(rel*5/18),2),'Uses only one train\'s length.'),W(F.n((L+L2)/rel,2),'Forgets to convert km/h to m/s.'),W(F.n((L+L2)/(v*5/18),2),'Ignores the other train\'s speed.'),W(F.n(secs*2,2),'Doubles the time.')]; }
    if(Math.abs(secs-Math.round(secs*100)/100)>1e-9) return null;
    return {b:tb(t,-0.5,0.2,0.8), stem:stem,
      correct:W(F.n(secs,2),how+' = '+F.n(secs,2)+' seconds. (km/h &times; 5/18 = m/s.)'),
      wrong:wrong, fast:'Convert once: '+v+' km/h = '+F.n(ms,2)+' m/s. Distance is the total length that has to go past.',
      p:{secs:secs}};
  },
  verify:function(q){ return Math.abs(GEN.numOf(q.opts[q.ans])-q.p.secs)<0.006; }
});

/* boats and streams */
GEN.add({
  id:'im.rate.boat', topic:'im.rate', n:28, trick:'i.rate.relative',
  make:function(r,k,n){
    var t=r.tier(k,n), b=r.int(6,24), s=r.intNot(1,6,[b]), dn=b+s, up=b-s;
    if(up<=0) return null;
    var ask=t==='hard'?'time':r.pick(['boat','stream']), stem, c, wrong;
    if(ask==='boat'||ask==='stream'){
      stem='A boat goes downstream at '+dn+' km/h and upstream at '+up+' km/h. What is the speed of the '+(ask==='boat'?'boat in still water':'stream')+'?';
      var ans=ask==='boat'?b:s;
      c=W(ans+' km/h','Still-water speed is the average of the two, ('+dn+' + '+up+')/2 = '+b+'; the stream is half the difference, ('+dn+' &minus; '+up+')/2 = '+s+'.');
      wrong=[W((ask==='boat'?s:b)+' km/h','Gives the '+(ask==='boat'?'stream':'boat')+' speed instead.'),W((dn-up)+' km/h','Forgets to halve the difference.'),W((dn+up)+' km/h','Forgets to halve the sum.'),W(dn+' km/h','Takes the downstream speed.'),W(up+' km/h','Takes the upstream speed.')];
    } else {
      var D=dn*up*r.int(1,3);
      var total=D/dn+D/up;
      stem='A boat\'s speed in still water is '+b+' km/h and the stream flows at '+s+' km/h. How many hours does it take to go '+D+' km downstream and come back?';
      c=W(F.n(total,2)+' hours',D+'/'+dn+' + '+D+'/'+up+' = '+F.n(D/dn,2)+' + '+F.n(D/up,2)+' = '+F.n(total,2)+'.');
      wrong=[W(F.n(2*D/b,2)+' hours','Ignores the stream, as if it helped and hindered equally.'),W(F.n(D/dn,2)+' hours','Counts only the trip downstream.'),W(F.n(2*D/dn,2)+' hours','Uses the downstream speed both ways.'),W(F.n(2*D/up,2)+' hours','Uses the upstream speed both ways.'),W(F.n(D/(dn+up),2)+' hours','Adds the two speeds.')];
    }
    return {b:tb(t,-0.5,0.1,0.8), stem:stem, correct:c, wrong:wrong,
      fast:'Down = b + s, up = b &minus; s. Boat = average, stream = half the gap.', p:{b:b,s:s,ask:ask,stem:stem}};
  },
  verify:function(q){
    var p=q.p, v=parseFloat(GEN.F.plain(q.opts[q.ans]));
    if(p.ask==='boat') return v===p.b; if(p.ask==='stream') return v===p.s;
    var D=+p.stem.match(/go (\d+) km/)[1]; return Math.abs(v-(D/(p.b+p.s)+D/(p.b-p.s)))<0.006;
  }
});

/* clock angles */
GEN.add({
  id:'im.rate.clock', topic:'im.rate', n:28, trick:'i.rate.relative',
  make:function(r,k,n){
    var t=r.tier(k,n), h=r.int(1,12), m=t==='warm'?r.pick([0,15,30,45]):r.int(1,59);
    var raw=Math.abs(30*(h%12)-5.5*m), ang=raw>180?360-raw:raw;
    if(Math.abs(ang*2-Math.round(ang*2))>1e-9 || ang===0) return null;
    var naive=Math.abs(30*(h%12)-6*m); naive=naive>180?360-naive:naive;
    var hourOnly=Math.abs(30*(h%12)-6*m*0);
    return {b:tb(t,-0.3,0.4,0.9),
      stem:'What is the smaller angle between the hour and minute hands of a clock at '+h+':'+(m<10?'0':'')+m+'?',
      correct:W(F.n(ang,1)+'&deg;','Minute hand at 6 &times; '+m+' = '+(6*m)+'&deg;; hour hand at 30 &times; '+(h%12)+' + 0.5 &times; '+m+' = '+F.n(30*(h%12)+0.5*m,1)+'&deg;. Difference '+F.n(raw,1)+'&deg;'+(raw>180?', so the smaller angle is '+F.n(ang,1)+'&deg;':'')+'.'),
      wrong:[W(F.n(naive,1)+'&deg;','Forgets that the hour hand also moves, half a degree a minute.'),
        W(F.n(360-ang,1)+'&deg;','Gives the larger (reflex) angle.'),
        W(F.n(Math.abs(30*(h%12)-5*m)%360,1)+'&deg;','Moves the minute hand 5&deg; a minute instead of 6&deg;.'),
        W(F.n(ang+15,1)+'&deg;','Adds a quarter hour of hour-hand movement.'),
        W(F.n(Math.abs(ang-30),1)+'&deg;','Off by one hour mark.')],
      fast:'Angle = |30H &minus; 5.5M|; if over 180, take 360 minus it. Here |'+(30*(h%12))+' &minus; '+F.n(5.5*m,1)+'| = '+F.n(raw,1)+'.',
      p:{h:h,m:m}};
  },
  verify:function(q){ var p=q.p, mh=6*p.m, hh=(30*(p.h%12)+0.5*p.m)%360, d=Math.abs(mh-hh); d=Math.min(d,360-d);
    return Math.abs(parseFloat(GEN.F.plain(q.opts[q.ans]))-d)<1e-6; }
});

/* calendars */
var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
GEN.add({
  id:'im.rate.calendar', topic:'im.rate', n:28, trick:'i.num.div',
  make:function(r,k,n){
    var t=r.tier(k,n), d0=r.int(0,6), N=r.int(t==='warm'?20:60, t==='hard'?1000:365), back=t==='hard'&&r.chance(0.5);
    var d1=((d0+(back?-N:N))%7+7)%7;
    var off=[d1, (d1+1)%7, (d1+6)%7, (d0+N)%7, d0, (d1+2)%7];
    var why=['','Counts one day too many &mdash; day 0 is today.','Counts one day too few.','Moves forward when the question goes back.','Assumes the week lines up exactly.','Off by two days.'];
    var wrong=[]; for(var i=1;i<off.length;i++) wrong.push(W(DAYS[off[i]], why[i]));
    return {b:tb(t,-0.5,0.1,0.7),
      stem:'Today is '+DAYS[d0]+'. What day of the week '+(back?'was it '+N+' days ago':'will it be '+N+' days from today')+'?',
      correct:W(DAYS[d1],N+' = '+Math.floor(N/7)+' weeks and '+(N%7)+' days; '+(back?'go back ':'go forward ')+(N%7)+' days from '+DAYS[d0]+'.'),
      wrong:wrong, fast:'Only the remainder on dividing by 7 matters: '+N+' leaves '+(N%7)+'.', p:{d0:d0,N:N,back:back}};
  },
  verify:function(q){ var p=q.p, d=((p.d0+(p.back?-p.N:p.N))%7+7)%7; return GEN.F.plain(q.opts[q.ans])===DAYS[d].toLowerCase(); }
});

/* marked price, discount, profit */
GEN.add({
  id:'im.pct.markup', topic:'im.pct', n:30, trick:'i.pct.mpcp',
  make:function(r,k,n){
    var t=r.tier(k,n), mu=r.pick([20,25,30,40,50,60]), d=r.pick([10,15,20,25,30,40]), ask=t==='hard'?'discount':'profit';
    var f=(1+mu/100)*(1-d/100), pr=(f-1)*100;
    if(Math.abs(pr*100-Math.round(pr*100))>1e-9) return null;
    if(ask==='profit'){
      return {b:tb(t,-0.3,0.3,0.8),
        stem:'A shopkeeper marks goods '+mu+'% above cost price and then allows a discount of '+d+'% on the marked price. What is the profit or loss percent?',
        correct:W((pr>=0?'Profit ':'Loss ')+F.n(Math.abs(pr),2)+'%','Cost 100 &rarr; marked '+(100+mu)+' &rarr; sold at '+F.n(100*f,2)+'. '+(pr>=0?'Profit':'Loss')+' of '+F.n(Math.abs(pr),2)+'%.'),
        wrong:[W((mu-d>=0?'Profit ':'Loss ')+Math.abs(mu-d)+'%','Subtracts the discount from the mark-up; the discount is taken on the higher marked price.'),
          W((pr>=0?'Loss ':'Profit ')+F.n(Math.abs(pr),2)+'%','Right size, wrong direction.'),
          W('Profit '+mu+'%','Ignores the discount.'), W('Loss '+d+'%','Ignores the mark-up.'),
          W((pr>=0?'Profit ':'Loss ')+F.n(Math.abs(pr)*2,2)+'%','Doubles the result.')],
        fast:'Multiply: '+F.n(1+mu/100,2)+' &times; '+F.n(1-d/100,2)+' = '+F.n(f,4)+'.', p:{mu:mu,d:d,ask:ask}};
    }
    var target=r.pick([5,8,10,12,20]), dd=100*(1-(1+target/100)/(1+mu/100));
    if(dd<=0 || Math.abs(dd*100-Math.round(dd*100))>1e-9) return null;
    return {b:1.0, stem:'Goods are marked '+mu+'% above cost. What discount on the marked price still leaves a profit of '+target+'%?',
      correct:W(F.n(dd,2)+'%','Cost 100, marked '+(100+mu)+', must sell at '+(100+target)+'. Discount '+F.n(100+mu-100-target,2)+' on '+(100+mu)+' = '+F.n(dd,2)+'%.'),
      wrong:[W((mu-target)+'%','Subtracts the percentages; the discount is measured on the marked price, not the cost.'),
        W(F.n(100*(mu-target)/(100+target),2)+'%','Measures the discount against the selling price.'),
        W(target+'%','Uses the profit figure.'), W(mu+'%','Uses the mark-up figure.'),
        W(F.n(dd+5,2)+'%','Arithmetic slip.')],
      fast:'Cost = 100. Discount = (marked &minus; wanted selling price) &divide; marked.', p:{mu:mu,target:target,ask:ask}};
  },
  verify:function(q){
    var p=q.p, t=GEN.F.plain(q.opts[q.ans]), v=parseFloat(t.replace(/^[a-z ]+/,''));
    if(p.ask==='profit'){ var pr=((1+p.mu/100)*(1-p.d/100)-1)*100; return (t.indexOf('profit')===0)===(pr>=0) && Math.abs(v-Math.abs(pr))<0.006; }
    return Math.abs(v-100*(1-(1+p.target/100)/(1+p.mu/100)))<0.006;
  }
});

/* cost price from a sale */
GEN.add({
  id:'im.pct.cost', topic:'im.pct', n:28, trick:'i.pct.mpcp',
  make:function(r,k,n){
    var t=r.tier(k,n), p=r.pick([10,12,15,20,25,-10,-20,-25,-5,-8]), C=r.int(4,90)*50, S=C*(1+p/100);
    if(S!==Math.round(S)) return null;
    var item=r.pick(['a bicycle','a mobile phone','a sewing machine','a cricket bat','a rice cooker']);
    var hard=t==='hard', q2=r.pick([10,20,25,30]);
    if(hard){
      var S2=C*(1+q2/100);
      if(S2!==Math.round(S2)) return null;
      return {b:0.9, stem:'By selling '+item+' for Tk '+F.n(S,0)+', a trader '+(p>=0?'gains':'loses')+' '+Math.abs(p)+'%. For how much should it be sold to gain '+q2+'%?',
        correct:W(F.money(S2,'Tk',0),'Cost = '+F.n(S,0)+' &divide; '+F.n(1+p/100,2)+' = '+F.n(C,0)+'; &times; '+F.n(1+q2/100,2)+' = '+F.n(S2,0)+'.'),
        wrong:[W(F.money(S*(1+q2/100),'Tk',0),'Applies the new gain to the old selling price instead of the cost.'),
          W(F.money(S*(1+(q2-p)/100),'Tk',0),'Adjusts the selling price by the difference in percentages.'),
          W(F.money(C,'Tk',0),'Gives the cost price.'), W(F.money(C*(1+(q2+Math.abs(p))/100),'Tk',0),'Adds the two percentages.'),
          W(F.money(S2+100,'Tk',0),'Arithmetic slip.')],
        fast:'Cost = sale &divide; '+F.n(1+p/100,2)+'; then &times; '+F.n(1+q2/100,2)+'. Or scale directly: '+F.n(S,0)+' &times; '+F.n(1+q2/100,2)+'/'+F.n(1+p/100,2)+'.',
        p:{S:S,p:p,q2:q2}};
    }
    return {b:tb(t,-0.4,0.3,0.8), stem:'A trader sells '+item+' for Tk '+F.n(S,0)+' at a '+(p>=0?'profit':'loss')+' of '+Math.abs(p)+'%. What did it cost?',
      correct:W(F.money(C,'Tk',0),F.n(S,0)+' is '+(100+p)+'% of the cost, so cost = '+F.n(S,0)+' &divide; '+F.n(1+p/100,2)+' = '+F.n(C,0)+'.'),
      wrong:[W(F.money(Math.round(S*(1-p/100)),'Tk',0),'Takes '+Math.abs(p)+'% of the selling price; the percentage is of the cost.'),
        W(F.money(S,'Tk',0),'Gives the selling price.'),
        W(F.money(Math.round(S*(1+p/100)),'Tk',0),'Applies the percentage in the wrong direction.'),
        W(F.money(Math.round(S/(1-p/100)),'Tk',0),'Divides by the wrong factor.'),
        W(F.money(C+50,'Tk',0),'Arithmetic slip.')],
      fast:'Selling price &divide; '+F.n(1+p/100,2)+'. Never subtract the percent from the selling price.', p:{S:S,p:p}};
  },
  verify:function(q){
    var p=q.p, v=GEN.numOf(q.opts[q.ans]), C=p.S/(1+p.p/100);
    return p.q2!==undefined ? Math.abs(v-C*(1+p.q2/100))<0.5 : Math.abs(v-C)<0.5;
  }
});

/* partnership */
GEN.add({
  id:'im.ratio.partner', topic:'im.ratio', n:28, trick:'i.ratio.allig',
  make:function(r,k,n){
    var t=r.tier(k,n), a=r.int(2,20)*5000, b=r.intNot(2,20,[a/5000])*5000, ta=r.int(3,12), tb2=r.intNot(3,12,[ta]);
    var wa=a*ta, wb=b*tb2, g=F.gcd(wa,wb), P=(wa+wb)/g*r.int(2,20)*100, sa=P*wa/(wa+wb);
    if(sa!==Math.round(sa)) return null;
    var nm=r.sample(GEN.NAMES,2);
    return {b:tb(t,-0.4,0.3,0.8),
      stem:nm[0]+' invests Tk '+F.n(a,0)+' for '+ta+' months and '+nm[1]+' invests Tk '+F.n(b,0)+' for '+tb2+' months in a business. The profit is Tk '+F.n(P,0)+'. What is '+nm[0]+'\'s share?',
      correct:W(F.money(sa,'Tk',0),'Shares follow capital &times; time: '+F.n(wa,0)+' : '+F.n(wb,0)+'. '+nm[0]+' gets '+F.n(wa/g,0)+'/'+F.n((wa+wb)/g,0)+' of '+F.n(P,0)+'.'),
      wrong:[W(F.money(Math.round(P*a/(a+b)),'Tk',0),'Splits by capital only, ignoring how long each invested.'),
        W(F.money(Math.round(P*ta/(ta+tb2)),'Tk',0),'Splits by time only.'),
        W(F.money(P-sa,'Tk',0),'Gives '+nm[1]+'\'s share.'),
        W(F.money(P/2,'Tk',0),'Splits the profit equally.'),
        W(F.money(Math.round(P*wb/(wa+wb))+100,'Tk',0),'Uses the other partner\'s weight.')],
      fast:'Weights = money &times; months. Reduce the ratio before multiplying by the profit.', p:{wa:wa,wb:wb,P:P}};
  },
  verify:function(q){ var p=q.p; return Math.abs(GEN.numOf(q.opts[q.ans])-p.P*p.wa/(p.wa+p.wb))<0.5; }
});

/* alligation */
GEN.add({
  id:'im.ratio.allig', topic:'im.ratio', n:28, trick:'i.ratio.allig',
  make:function(r,k,n){
    var t=r.tier(k,n), a=r.int(40,90), b=r.int(a+10,a+60), m=r.int(a+1,b-1);
    var x=b-m, y=m-a, g=F.gcd(x,y); x/=g; y/=g;
    if(x===y) return null;
    var item=r.pick(['rice','tea','lentils','sugar']);
    var hard=t==='hard', W1=hard?r.int(2,20)*x:0;
    if(hard){
      var W2=W1/x*y;
      return {b:0.9, stem:'How many kg of '+item+' at Tk '+b+' per kg must be mixed with '+W1+' kg of '+item+' at Tk '+a+' per kg so that the mixture is worth Tk '+m+' per kg?',
        correct:W(W2+' kg','Alligation: cheap : dear = ('+b+' &minus; '+m+') : ('+m+' &minus; '+a+') = '+x+' : '+y+'. '+W1+' kg of the cheap kind needs '+W2+' kg of the dear.'),
        wrong:[W((W1/y*x)+' kg','Crosses the ratio the wrong way.'),W(W1+' kg','Assumes equal amounts.'),W((W1+W2)+' kg','Gives the total mixture.'),W(F.n(W1*m/b,2)+' kg','Scales by the prices directly.'),W((W2+x)+' kg','Arithmetic slip.')],
        fast:'Differences cross over: dear share = '+m+' &minus; '+a+', cheap share = '+b+' &minus; '+m+'.', p:{a:a,b:b,m:m,W1:W1}};
    }
    return {b:tb(t,-0.3,0.3,0.8),
      stem:'In what ratio must '+item+' costing Tk '+a+' per kg be mixed with '+item+' costing Tk '+b+' per kg to get a mixture worth Tk '+m+' per kg?',
      correct:W(x+' : '+y,'Alligation: (dear &minus; mean) : (mean &minus; cheap) = ('+b+' &minus; '+m+') : ('+m+' &minus; '+a+') = '+x+' : '+y+'.'),
      wrong:[W(y+' : '+x,'Right numbers, crossed the wrong way.'),W(a+' : '+b,'Uses the prices as the ratio.'),
        W((m-a)+' : '+(b-a),'Measures against the price range.'),W('1 : 1','Assumes equal amounts.'),W((x+1)+' : '+y,'Arithmetic slip.')],
      fast:'Write cheap and dear on top, the mean in the middle, and cross-subtract: '+(b-m)+' : '+(m-a)+'.', p:{a:a,b:b,m:m}};
  },
  verify:function(q){
    var p=q.p, t=GEN.F.plain(q.opts[q.ans]);
    if(p.W1){ var w2=parseFloat(t); return Math.abs((p.W1*p.a+w2*p.b)/(p.W1+w2)-p.m)<1e-9; }
    var parts=t.split(':').map(function(x){ return parseFloat(x); });
    return Math.abs((parts[0]*p.a+parts[1]*p.b)/(parts[0]+parts[1])-p.m)<1e-9;
  }
});

/* ---------- data sufficiency, decided by enumeration ---------- */
var DOMAIN=[]; (function(){ for(var x=1;x<=20;x++) for(var y=1;y<=20;y++) DOMAIN.push([x,y]); })();
function isPrime(n){ if(n<2) return false; for(var i=2;i*i<=n;i++) if(n%i===0) return false; return true; }
var STATEMENTS=[
  function(x,y,r){ var s=x+y; return {txt:'x + y = '+s, f:function(a,b){ return a+b===s; }}; },
  function(x,y,r){ var d=x-y; return {txt:'x &minus; y = '+F.n(d,0), f:function(a,b){ return a-b===d; }}; },
  function(x,y,r){ var c=r.int(2,4), e=r.int(2,5), s=c*x+e*y; return {txt:c+'x + '+e+'y = '+s, f:function(a,b){ return c*a+e*b===s; }}; },
  function(x,y,r){ var p=x*y; return {txt:'xy = '+p, f:function(a,b){ return a*b===p; }}; },
  function(x,y,r){ return {txt:'x is '+(x>y?'greater':'less')+' than y', f: x>y ? function(a,b){ return a>b; } : function(a,b){ return a<b; }}; },
  function(x,y,r){ return {txt:'x is '+(isPrime(x)?'':'not ')+'a prime number', f: isPrime(x) ? function(a){ return isPrime(a); } : function(a){ return !isPrime(a); }}; },
  function(x,y,r){ var m=r.int(2,5); return {txt:'x is a multiple of '+m, f:function(a){ return a%m===0; }, ok:x%m===0}; },
  function(x,y,r){ var c=r.int(2,5); return {txt:'x = '+c+'y', f:function(a,b){ return a===c*b; }, ok:x===c*y}; },
  function(x,y,r){ var s=x*x; return {txt:'x<sup>2</sup> = '+s, f:function(a){ return a*a===s; }}; },
  function(x,y,r){ return {txt:'y = '+y, f:function(a,b){ return b===y; }}; }
];
var ASKS=[
  {txt:'What is the value of x?', v:function(a,b){ return a; }},
  {txt:'What is the value of x + y?', v:function(a,b){ return a+b; }},
  {txt:'Is x greater than 10?', v:function(a,b){ return a>10; }},
  {txt:'What is the value of y?', v:function(a,b){ return b; }}
];
function decides(fs, ask){
  var vals={}, any=false;
  for(var i=0;i<DOMAIN.length;i++){
    var a=DOMAIN[i][0], b=DOMAIN[i][1], ok=true;
    for(var j=0;j<fs.length;j++) if(!fs[j](a,b)){ ok=false; break; }
    if(!ok) continue;
    any=true; vals[String(ask.v(a,b))]=1;
  }
  return any && Object.keys(vals).length===1;
}
function dsClass(f1, f2, ask){
  var s1=decides([f1],ask), s2=decides([f2],ask), both=decides([f1,f2],ask);
  if(s1&&s2) return 3; if(s1) return 0; if(s2) return 1; if(both) return 2; return 4;
}
var DSWHY=[
  function(s1,s2){ return s1?'Right: (1) alone pins the answer, and (2) alone does not.':'(1) alone leaves more than one possibility.'; },
  function(s1,s2){ return s2?'Right: (2) alone pins the answer, and (1) alone does not.':'(2) alone leaves more than one possibility.'; }
];
GEN.add({
  id:'im.ds.enum', topic:'im.ds', type:'ds', n:40, trick:'i.ds.decide',
  make:function(r,k){
    var want=k%5, x=r.int(1,20), y=r.int(1,20), ask=r.pick(ASKS);
    for(var tries=0; tries<40; tries++){
      var g1=r.pick(STATEMENTS)(x,y,r), g2=r.pick(STATEMENTS)(x,y,r);
      if(g1.ok===false||g2.ok===false||g1.txt===g2.txt) continue;
      if(!g1.f(x,y)||!g2.f(x,y)) continue;
      var c=dsClass(g1.f,g2.f,ask);
      if(c!==want) continue;
      var s1=decides([g1.f],ask), s2=decides([g2.f],ask), both=decides([g1.f,g2.f],ask);
      var why=[
        c===0?'Right: (1) alone settles it; (2) alone does not.' : s1?'(1) alone is enough, but so is (2), so this is not the best answer.':'(1) alone still allows more than one answer.',
        c===1?'Right: (2) alone settles it; (1) alone does not.' : s2?'(2) alone is enough, but so is (1).':'(2) alone still allows more than one answer.',
        c===2?'Right: neither statement alone settles it, but together they do.' : (s1||s2)?'One statement is already enough on its own, so combining is not needed.':'Even together they allow more than one answer.',
        c===3?'Right: each statement on its own settles it.' : 'At least one statement alone does not settle it.',
        c===4?'Right: even together, more than one answer is still possible.' : 'Together (or alone) they do settle it.'
      ];
      return {type:'ds', b:[0.3,0.3,0.7,0.6,0.8][c], stem:'x and y are positive integers, each at most 20. '+ask.txt,
        st1:g1.txt, st2:g2.txt, ans:c, why:why,
        fast:'Test (1) alone, then (2) alone, and only then together &mdash; and never carry what (1) told you into (2).',
        p:{x:x,y:y,ask:ASKS.indexOf(ask),s1:g1.txt,s2:g2.txt}};
    }
    return null;
  },
  verify:function(q){
    /* rebuild the statements from their text and re-enumerate */
    function parse(t){
      var s=GEN.F.plain(t), m;
      if((m=s.match(/^x \+ y = (\d+)$/))) return function(a,b){ return a+b===+m[1]; };
      if((m=s.match(/^x - y = (-?\d+)$/))) return function(a,b){ return a-b===+m[1]; };
      if((m=s.match(/^(\d)x \+ (\d)y = (\d+)$/))) return function(a,b){ return m[1]*a+m[2]*b===+m[3]; };
      if((m=s.match(/^xy = (\d+)$/))) return function(a,b){ return a*b===+m[1]; };
      if(s==='x is greater than y') return function(a,b){ return a>b; };
      if(s==='x is less than y') return function(a,b){ return a<b; };
      if(s==='x is a prime number') return function(a){ return isPrime(a); };
      if(s==='x is not a prime number') return function(a){ return !isPrime(a); };
      if((m=s.match(/^x is a multiple of (\d)$/))) return function(a){ return a%(+m[1])===0; };
      if((m=s.match(/^x = (\d)y$/))) return function(a,b){ return a===m[1]*b; };
      if((m=s.match(/^x2 = (\d+)$/))) return function(a){ return a*a===+m[1]; };
      if((m=s.match(/^y = (\d+)$/))) return function(a,b){ return b===+m[1]; };
      return null;
    }
    var f1=parse(q.st1), f2=parse(q.st2), ask=ASKS[q.p.ask];
    if(!f1||!f2) return false;
    return dsClass(f1,f2,ask)===q.ans;
  }
});

})();
