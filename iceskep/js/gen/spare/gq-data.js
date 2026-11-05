/* ===========================================================
   GEN — GRE data analysis: statistics, probability, counting, and
   data interpretation from tables.
   =========================================================== */
(function(){
var F=GEN.F;
function W(t,why){ return {t:t, why:why}; }
function tb(t,w,e,h){ return t==='warm'?w:t==='exam'?e:h; }
function sum(a){ var s=0; for(var i=0;i<a.length;i++) s+=a[i]; return s; }
function mean(a){ return sum(a)/a.length; }
function median(a){ var b=a.slice().sort(function(x,y){return x-y;}), m=b.length>>1; return b.length%2?b[m]:(b[m-1]+b[m])/2; }
function sd(a){ var m=mean(a), s=0; for(var i=0;i<a.length;i++) s+=(a[i]-m)*(a[i]-m); return Math.sqrt(s/a.length); }
function range(a){ return Math.max.apply(null,a)-Math.min.apply(null,a); }
function choose(n,k){ if(k<0||k>n) return 0; var r=1; for(var i=1;i<=k;i++) r=r*(n-k+i)/i; return Math.round(r); }
function fact(n){ var r=1; for(var i=2;i<=n;i++) r*=i; return r; }
function close(a,b){ return Math.abs(a-b)<1e-9; }
function fracVal(s){ var t=GEN.F.plain(s), m=t.match(/^(-?\d+)\/(\d+)$/); return m? m[1]/m[2] : parseFloat(t); }

/* ---------- the missing value for a target average ---------- */
GEN.add({
  id:'gq.stat.missing', topic:'gq.stat', n:28, trick:'g.stat.seesaw',
  make:function(r,k,n){
    var t=r.tier(k,n), cnt=r.int(4,t==='hard'?9:6), vals=[], i;
    for(i=0;i<cnt-1;i++) vals.push(r.int(40,99));
    var target=r.int(55,90), need=target*cnt-sum(vals);
    if(need<0||need>100) return null;
    var what=r.pick(['test scores','daily sales','weights in kg','race times in seconds']);
    var stem='The first '+(cnt-1)+' of '+cnt+' '+what+' are '+F.list(vals.map(String))+'. What must the last one be for the average of all '+cnt+' to be '+target+'?';
    return {type:r.chance(0.25)?'ne':'mc', b:tb(t,-0.5,0.2,0.7), stem:stem, ans:{v:need},
      why:['The total must be '+target+' &times; '+cnt+' = '+(target*cnt)+'; the known values sum to '+sum(vals)+'.'],
      correct:W(need,'Needed total '+(target*cnt)+' minus the known '+sum(vals)+' = '+need+'.'),
      wrong:[W(target,'Assumes the last value simply equals the target average.'),
        W(target*(cnt-1)-sum(vals)+target, 'Uses '+(cnt-1)+' in the total, then adds the target back.'),
        W(Math.round(mean(vals)),'Gives the average of the known values.'),
        W(target*cnt-sum(vals)+cnt,'Arithmetic slip adding '+cnt+'.'),
        W(Math.abs(target*(cnt-1)-sum(vals)),'Uses a total of '+(cnt-1)+' values instead of '+cnt+'.'),
        W(need+10,'Slip in the total.')],
      fast:'Seesaw: add up how far each known value sits from '+target+' ('+F.n(sum(vals)-target*(cnt-1),0)+' in all); the last value must cancel it.',
      p:{vals:vals,target:target}};
  },
  verify:function(q){ var p=q.p, v=q.type==='ne'?q.ans.v:GEN.numOf(q.opts[q.ans]); return close(mean(p.vals.concat([v])), p.target); }
});

/* ---------- median of an unsorted list ---------- */
GEN.add({
  id:'gq.stat.median', topic:'gq.stat', n:26, trick:'g.stat.even',
  make:function(r,k,n){
    var t=r.tier(k,n), cnt=t==='warm'?r.pick([5,7]):r.pick([6,8,10]), vals=[], i;
    for(i=0;i<cnt;i++) vals.push(r.int(1,60));
    var med=median(vals), sorted=vals.slice().sort(function(a,b){return a-b;});
    var unsortedMid = cnt%2 ? vals[cnt>>1] : (vals[cnt/2-1]+vals[cnt/2])/2;
    if(close(unsortedMid,med) || close(mean(vals),med)) return null;
    return {b:tb(t,-0.6,0.1,0.5), stem:'What is the median of: '+vals.join(', ')+'?',
      correct:W(F.n(med,1),'Sorted: '+sorted.join(', ')+'. '+(cnt%2?'The middle value':'The average of the two middle values')+' is '+F.n(med,1)+'.'),
      wrong:[W(F.n(unsortedMid,1),'Takes the middle of the list without sorting it first.'),
        W(F.n(mean(vals),2),'Gives the mean.'),
        W(F.n(sorted[cnt>>1],1),cnt%2?'Off by one position.':'Takes only one of the two middle values.'),
        W(F.n(range(vals),1),'Gives the range.'),
        W(F.n(sorted[(cnt>>1)-1],1),'Takes the lower middle value only.'),
        W(F.n((sorted[0]+sorted[cnt-1])/2,1),'Averages the smallest and largest.')],
      fast:'Sort first, always. With '+cnt+' values the median is '+(cnt%2?'value number '+((cnt+1)/2):'the average of values '+(cnt/2)+' and '+(cnt/2+1))+'.',
      p:{vals:vals}};
  },
  verify:function(q){ return close(parseFloat(GEN.F.plain(q.opts[q.ans])), median(q.p.vals)); }
});

/* ---------- combined average of two groups ---------- */
GEN.add({
  id:'gq.stat.weighted', topic:'gq.stat', n:26, trick:'g.stat.seesaw',
  make:function(r,k,n){
    var t=r.tier(k,n), n1=r.int(5,40), n2=r.intNot(5,40,[n1]), m1=r.int(50,95), m2=r.intNot(40,95,[m1]);
    var reverse=t==='hard'&&r.chance(0.5), comb=(n1*m1+n2*m2)/(n1+n2);
    if(Math.abs(comb*10-Math.round(comb*10))>1e-9) return null;
    if(reverse){
      return {b:1.0, stem:'Class A has an average score of '+m1+' and class B an average of '+m2+'. Together their average is '+F.n(comb,1)+'. If class A has '+n1+' students, how many does class B have?',
        correct:W(n2,'Seesaw: A sits '+F.n(Math.abs(m1-comb),1)+' from the combined mean and B sits '+F.n(Math.abs(m2-comb),1)+'. Sizes are in the inverse ratio, so B = '+n1+' &times; '+F.n(Math.abs(m1-comb),1)+'/'+F.n(Math.abs(m2-comb),1)+' = '+n2+'.'),
        wrong:[W(n1,'Assumes equal class sizes.'),W(Math.round(n1*Math.abs(m2-comb)/Math.abs(m1-comb))||n1+1,'Uses the distances the wrong way round.'),W(n1+n2,'Gives the total.'),W(Math.round(n2/2)||1,'Halves the answer.'),W(n2+5,'Arithmetic slip.')],
        fast:'Distances from the combined mean are inversely proportional to the group sizes.', p:{n1:n1,n2:n2,m1:m1,m2:m2,rev:1}};
    }
    return {b:tb(t,-0.4,0.3,0.8), stem:'A group of '+n1+' workers averages '+m1+' units a day and a group of '+n2+' workers averages '+m2+'. What is the average for all '+(n1+n2)+' workers?',
      correct:W(F.n(comb,1),'Total output '+(n1*m1)+' + '+(n2*m2)+' = '+(n1*m1+n2*m2)+', divided by '+(n1+n2)+'.'),
      wrong:[W(F.n((m1+m2)/2,1),'Averages the two averages, ignoring that the groups differ in size.'),
        W(F.n((n2*m1+n1*m2)/(n1+n2),1),'Swaps the weights.'),
        W(F.n((n1*m1+n2*m2)/2,1),'Divides the total by 2 instead of by the number of workers.'),
        W(F.n(Math.max(m1,m2),1),'Takes the larger average.'), W(F.n(comb+1,1),'Rounding slip.')],
      fast:'The answer sits closer to the bigger group\'s average. Total &divide; headcount, or seesaw from '+Math.min(m1,m2)+'.',
      p:{n1:n1,n2:n2,m1:m1,m2:m2,rev:0}};
  },
  verify:function(q){
    var p=q.p, v=parseFloat(GEN.F.plain(q.opts[q.ans]));
    return p.rev ? v===p.n2 : Math.abs(v-(p.n1*p.m1+p.n2*p.m2)/(p.n1+p.n2))<0.05;
  }
});

/* ---------- what changes when data are transformed (select all) ---------- */
GEN.add({
  id:'gq.stat.shift', topic:'gq.stat', type:'ms', n:28, trick:'g.stat.shift',
  make:function(r,k,n){
    var t=r.tier(k,n), cnt=r.int(5,7), vals=[], i;
    for(i=0;i<cnt;i++) vals.push(r.int(2,40));
    var op=r.pick(['add','mul','addmean','addmin','neg']), c=r.int(2,9), after, desc;
    var m=mean(vals);
    if(op==='add'){ after=vals.map(function(v){return v+c;}); desc=c+' is added to every value'; }
    else if(op==='mul'){ after=vals.map(function(v){return v*c;}); desc='every value is multiplied by '+c; }
    else if(op==='addmean'){ if(m!==Math.round(m)) return null; after=vals.concat([m]); desc='one more value, equal to the current mean ('+m+'), is added to the list'; }
    else if(op==='addmin'){ var mn=Math.min.apply(null,vals); after=vals.concat([mn]); desc='one more value, equal to the current smallest value ('+mn+'), is added'; }
    else { after=vals.map(function(v){return 50-v;}); desc='every value v is replaced by 50 &minus; v'; }
    var measures=[['The mean',mean],['The median',median],['The range',range],['The standard deviation',sd]];
    var opts=[], ans=[], why=[];
    measures.forEach(function(mm, idx){
      var b0=mm[1](vals), b1=mm[1](after), changed=!close(b0,b1);
      opts.push(mm[0]); if(changed) ans.push(idx);
      why.push(mm[0]+' goes from '+F.n(b0,2)+' to '+F.n(b1,2)+(changed?' &mdash; it changes.':' &mdash; unchanged.'));
    });
    if(!ans.length) return null;
    return {type:'ms', b:tb(t,0.1,0.6,1.1),
      stem:'The list is '+vals.join(', ')+'. If '+desc+', which of the following change? Select all that apply.',
      opts:opts, ans:ans, why:why,
      fast: op==='add' ? 'Adding a constant moves the centre (mean, median) but not the spread (range, SD).'
          : op==='mul' ? 'Multiplying scales everything: centre and spread both change.'
          : op==='addmean' ? 'A value at the mean leaves the mean alone but squeezes the SD; the range cannot grow.'
          : op==='neg' ? '50 &minus; v flips and shifts the list: the centre moves, the spread does not.'
          : 'A new minimum repeat leaves the range alone but drags the mean down.',
      p:{vals:vals,after:after}};
  },
  verify:function(q){
    var p=q.p, fns=[mean,median,range,sd], exp=[];
    fns.forEach(function(f,i){ if(!close(f(p.vals),f(p.after))) exp.push(i); });
    return JSON.stringify(exp)===JSON.stringify(q.ans.slice().sort());
  }
});

/* ---------- comparing standard deviations (QC, including D) ---------- */
GEN.add({
  id:'gq.stat.qcsd', topic:'gq.stat', type:'qc', n:28, trick:'g.stat.sd',
  make:function(r,k){
    var want=GEN.want4(k), a=r.int(1,20), d1=r.int(1,6), d2=r.intNot(1,6,[d1]), pre, qa, qb, pts;
    function set(s){ return '{'+s.join(', ')+'}'; }
    if(want===3){
      var lo=r.int(1,15), gap=r.int(3,8);
      var fixed=[lo, lo+gap, lo+2*gap];
      pre='x is an integer with '+(lo-gap*3)+' &lt; x &lt; '+(lo+gap*5)+'. Set S is '+set([lo, lo+gap, 'x'])+' and set T is '+set(fixed)+'.';
      pts=[];
      for(var x=lo-gap*3+1; x<lo+gap*5; x++) pts.push({a:sd([lo,lo+gap,x]), b:sd(fixed), s:'x = '+x});
      qa='The standard deviation of S'; qb='The standard deviation of T';
      var d=GEN.qc(pts,'S\'s spread depends on x: near the other two it is tight, far away it is wide, while T is fixed.');
      if(d.ans!==3) return null;
      return {type:'qc', b:0.9, pre:pre, qa:qa, qb:qb, ans:3, why:d.why,
        fast:'Try x inside the other two values and x far outside: the spread of S swings either side of T.', p:{kind:'x',lo:lo,gap:gap}};
    }
    var S, T;
    if(want===2){ S=[a,a+d1,a+2*d1,a+3*d1]; var sh=r.int(5,40); T=S.map(function(v){return v+sh;}); }
    else { S=[a,a+d1,a+2*d1,a+3*d1]; T=[a,a+d2,a+2*d2,a+3*d2]; if((d1>d2?0:1)!==want) { var tmp=S; S=T; T=tmp; } }
    var dd=GEN.qc([{a:sd(S),b:sd(T),s:''}], want===2?'T is S shifted by a constant, which moves the centre but not the spread.':'Both sets are evenly spaced with four values; the one with the wider gap is more spread out.');
    if(dd.ans!==want) return null;
    return {type:'qc', b:want===2?0.5:0.3, qa:'The standard deviation of '+set(S), qb:'The standard deviation of '+set(T), ans:dd.ans, why:dd.why,
      fast:'Do not compute. Same count and even spacing: compare the gaps. A constant shift never changes SD.', p:{kind:'fixed',S:S,T:T}};
  },
  verify:function(q){
    var p=q.p;
    if(p.kind==='fixed') return GEN.qc([{a:sd(p.S),b:sd(p.T)}],'').ans===q.ans;
    var pts=[], fixed=[p.lo,p.lo+p.gap,p.lo+2*p.gap];
    for(var x=p.lo-p.gap*3+1; x<p.lo+p.gap*5; x++) pts.push({a:sd([p.lo,p.lo+p.gap,x]), b:sd(fixed)});
    return GEN.qc(pts,'').ans===q.ans;
  }
});

/* ---------- the normal distribution ---------- */
GEN.add({
  id:'gq.stat.normal', topic:'gq.stat', n:26, trick:'g.stat.norm',
  make:function(r,k,n){
    var t=r.tier(k,n), mu=r.int(40,80)*5, s=r.int(2,12)*5, N=r.pick([200,400,500,1000,2000]);
    /* bands in SD units from the mean: -2,-1,0,1,2 ; percents 2,14,34,34,14,2 */
    var cuts=[-9,-2,-1,0,1,2,9], pct=[2,14,34,34,14,2];
    var i=r.int(0,4), j=r.int(i+1,6);
    if(j-i<1 || (i===0&&j===6)) return null;
    var share=0; for(var z=i;z<j;z++) share+=pct[z];
    var lo=cuts[i], hi=cuts[j];
    function at(zz){ return zz===-9||zz===9 ? null : mu+zz*s; }
    var desc = lo===-9 ? 'below '+at(hi) : hi===9 ? 'above '+at(lo) : 'between '+at(lo)+' and '+at(hi);
    var cnt=N*share/100;
    return {b:tb(t,-0.3,0.3,0.8),
      stem:'The heights of '+N+' plants are approximately normally distributed with mean '+mu+' mm and standard deviation '+s+' mm. About how many plants have heights '+desc+' mm?',
      correct:W(F.n(cnt,0),'That band covers about '+share+'% of a normal distribution (34% each side of the mean within one SD, 14% in each next band, 2% in each tail): '+share+'% of '+N+'.'),
      wrong:[W(F.n(N*(share===68?95:68)/100,0),'Uses the wrong rule of thumb: '+(share===68?'95%':'68%')+'.'),
        W(F.n(N*Math.min(100,share*2)/100,0),'Counts the band twice, on both sides of the mean.'),
        W(F.n(N*Math.max(1,share/2)/100,0),'Takes half the band.'),
        W(F.n(N*(100-share)/100,0),'Gives everything outside the band.'),
        W(F.n(N*(share+14)/100,0),'Adds one band too many.'),
        W(F.n(N*50/100,0),'Assumes half.')],
      fast:'Convert the cut-offs to SDs from the mean ('+(lo===-9?'':lo+' to ')+(hi===9?'up':hi)+'), then add 34 / 14 / 2 for each band crossed.',
      p:{N:N,share:share}};
  },
  verify:function(q){ return close(GEN.numOf(q.opts[q.ans]), q.p.N*q.p.share/100); }
});

/* ---------- independent events ---------- */
GEN.add({
  id:'gq.prob.indep', topic:'gq.prob', n:28, trick:'g.prob.comp',
  make:function(r,k,n){
    var t=r.tier(k,n), da=r.pick([2,3,4,5,6,8,10]), na=r.int(1,da-1), db=r.pick([2,3,4,5,6,10]), nb=r.int(1,db-1);
    var a=na/da, b=nb/db, ask=t==='warm'?'both':r.pick(['both','least','exactly','neither']);
    var ans, how;
    var D=da*db, both=na*nb, least=D-(da-na)*(db-nb), exactly=na*(db-nb)+(da-na)*nb, neither=(da-na)*(db-nb);
    if(ask==='both'){ ans=[both,D]; how=F.frac(na,da)+' &times; '+F.frac(nb,db); }
    else if(ask==='least'){ ans=[least,D]; how='1 &minus; P(neither) = 1 &minus; '+F.frac(da-na,da)+' &times; '+F.frac(db-nb,db); }
    else if(ask==='exactly'){ ans=[exactly,D]; how='P(A only) + P(B only)'; }
    else { ans=[neither,D]; how=F.frac(da-na,da)+' &times; '+F.frac(db-nb,db); }
    var wd={both:'both happen', least:'at least one happens', exactly:'exactly one happens', neither:'neither happens'}[ask];
    var stem='Events A and B are independent, with P(A) = '+F.frac(na,da)+' and P(B) = '+F.frac(nb,db)+'. What is the probability that '+wd+'?';
    return {b:tb(t,-0.5,0.3,0.9), stem:stem,
      correct:W(F.frac(ans[0],ans[1]),'For independent events: '+how+' = '+F.frac(ans[0],ans[1])+'.'),
      wrong:[W(F.frac(na*db+nb*da,D),'Adds the probabilities, which double-counts the overlap.'),
        W(F.frac(both,D),'Gives P(both).'),
        W(F.frac(least,D),'Gives P(at least one).'),
        W(F.frac(exactly,D),'Gives P(exactly one).'),
        W(F.frac(neither,D),'Gives P(neither).'),
        W(F.frac(D-both,D),'Takes 1 &minus; P(both), which is "not both", not what was asked.')],
      fast: ask==='least' ? '"At least one" is 1 minus "neither".' : ask==='exactly' ? 'Exactly one = at least one &minus; both.' : 'Independent: multiply.',
      p:{na:na,da:da,nb:nb,db:db,ask:ask}};
  },
  verify:function(q){
    var p=q.p, c=0, D=p.da*p.db;
    for(var i=0;i<p.da;i++) for(var j=0;j<p.db;j++){ var A=i<p.na, B=j<p.nb;
      if((p.ask==='both'&&A&&B)||(p.ask==='least'&&(A||B))||(p.ask==='exactly'&&A!==B)||(p.ask==='neither'&&!A&&!B)) c++; }
    return close(fracVal(q.opts[q.ans]), c/D);
  }
});

/* ---------- drawing without replacement ---------- */
GEN.add({
  id:'gq.prob.draw', topic:'gq.prob', n:28, trick:'g.prob.chain',
  make:function(r,k,n){
    var t=r.tier(k,n), R=r.int(2,8), B=r.int(2,8), T=R+B, ask=t==='warm'?'rr':r.pick(['rr','mix','atleast']);
    var rr=[R*(R-1), T*(T-1)], mix=[2*R*B, T*(T-1)], at=[T*(T-1)-B*(B-1), T*(T-1)];
    var ans= ask==='rr'?rr : ask==='mix'?mix : at;
    var wd={rr:'both are red', mix:'one is red and one is blue', atleast:'at least one is red'}[ask];
    return {b:tb(t,-0.3,0.4,0.9),
      stem:'A bag holds '+R+' red and '+B+' blue marbles. Two are drawn at random without replacement. What is the probability that '+wd+'?',
      correct:W(F.frac(ans[0],ans[1]),ask==='rr'?'('+R+'/'+T+')('+(R-1)+'/'+(T-1)+')':ask==='mix'?'Red then blue plus blue then red: 2 &times; ('+R+'/'+T+')('+B+'/'+(T-1)+')':'1 &minus; P(both blue) = 1 &minus; ('+B+'/'+T+')('+(B-1)+'/'+(T-1)+')'),
      wrong:[W(F.frac(ask==='rr'?R*R:ask==='mix'?2*R*B:T*T-B*B, T*T),'Draws with replacement: the second draw should come from '+(T-1)+'.'),
        W(F.frac(ask==='mix'?R*B:rr[0],ask==='mix'?T*(T-1):rr[1]),ask==='mix'?'Counts only one order (red first).':'Gives P(both red).'),
        W(F.frac(mix[0],mix[1]),'Gives P(one of each).'),
        W(F.frac(R,T),'Gives the chance for a single draw.'),
        W(F.frac(at[0],at[1]),'Gives P(at least one red).'),
        W(F.frac(B*(B-1),T*(T-1)),'Gives P(both blue).')],
      fast: ask==='atleast' ? '1 minus the chance of none.' : ask==='mix' ? 'One order, then double it.' : 'Multiply along the draws, taking one away each time.',
      p:{R:R,B:B,ask:ask}};
  },
  verify:function(q){
    var p=q.p, balls=[], i, j, c=0, tot=0;
    for(i=0;i<p.R;i++) balls.push('r'); for(i=0;i<p.B;i++) balls.push('b');
    for(i=0;i<balls.length;i++) for(j=0;j<balls.length;j++){ if(i===j) continue; tot++;
      var nr=(balls[i]==='r')+(balls[j]==='r');
      if((p.ask==='rr'&&nr===2)||(p.ask==='mix'&&nr===1)||(p.ask==='atleast'&&nr>=1)) c++; }
    return close(fracVal(q.opts[q.ans]), c/tot);
  }
});

/* ---------- two dice ---------- */
GEN.add({
  id:'gq.prob.dice', topic:'gq.prob', n:23, trick:'g.prob.comp',
  make:function(r,k,n){
    var t=r.tier(k,n), kind=r.pick(['eq','ge','diff']), v=kind==='diff'?r.int(0,4):r.int(3,11), c=0;
    for(var a=1;a<=6;a++) for(var b=1;b<=6;b++){ var s=a+b; if((kind==='eq'&&s===v)||(kind==='ge'&&s>=v)||(kind==='diff'&&Math.abs(a-b)===v)) c++; }
    if(!c||c===36) return null;
    var wd={eq:'the sum is exactly '+v, ge:'the sum is at least '+v, diff:'the two numbers differ by exactly '+v}[kind];
    var cGt=0; for(a=1;a<=6;a++) for(b=1;b<=6;b++) if(a+b>v) cGt++;
    return {b:tb(t,-0.5,0.2,0.7), stem:'Two fair six-sided dice are rolled. What is the probability that '+wd+'?',
      correct:W(F.frac(c,36),c+' of the 36 equally likely ordered pairs work.'),
      wrong:[W(F.frac(kind==='diff'&&v>0?c/2:Math.ceil(c/2),kind==='diff'&&v>0?36:21),'Counts unordered pairs, which are not equally likely.'),
        W(F.frac(c,11),'Divides by the 11 possible sums, which are not equally likely.'),
        W(F.frac(36-c,36),'Gives the complement.'),
        W(F.frac(kind==='ge'?cGt:c+1,36),kind==='ge'?'Uses "greater than" instead of "at least".':'Off by one pair.'),
        W(F.frac(1,6),'Assumes a one-in-six chance.')],
      fast:'Count ordered pairs out of 36. For sums, the counts run 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1 from 2 to 12.',
      p:{kind:kind,v:v}};
  },
  verify:function(q){
    var p=q.p, c=0; for(var a=1;a<=6;a++) for(var b=1;b<=6;b++){ var s=a+b;
      if((p.kind==='eq'&&s===p.v)||(p.kind==='ge'&&s>=p.v)||(p.kind==='diff'&&Math.abs(a-b)===p.v)) c++; }
    return close(fracVal(q.opts[q.ans]), c/36);
  }
});

/* ---------- arrangements with repeated letters ---------- */
GEN.add({
  id:'gq.comb.letters', topic:'gq.comb', n:19, trick:'g.comb.rep',
  make:function(r,k,n){
    var t=r.tier(k,n), word=r.pick(t==='warm'?['LEVEL','RADAR','APPLE','CIVIC','TOOTH','SHEEP','GEESE','ERROR','ALPHA','DADDY']
      :['BANANA','COFFEE','LETTER','PEPPER','BALLOON','SUCCESS','COOKIE','ASSESS','GOOGLE','TATTOO','CANNON','BOOKKEEP','COMMITTEE','ADDRESS','PARALLEL','REFERRER','STATISTIC','INNING']);
    if(word.length>9) return null;
    var counts={}, i; for(i=0;i<word.length;i++) counts[word[i]]=(counts[word[i]]||0)+1;
    var denom=1, reps=[]; for(var ch in counts){ denom*=fact(counts[ch]); if(counts[ch]>1) reps.push(counts[ch]); }
    var ans=fact(word.length)/denom;
    return {b:tb(t,-0.4,0.3,0.8), stem:'How many distinct arrangements can be made of all the letters of the word '+word+'?',
      correct:W(ans,word.length+'! divided by the factorial of each repeat count ('+reps.map(function(x){return x+'!';}).join(' &times; ')+') = '+ans+'.'),
      wrong:[W(fact(word.length),'Treats every letter as different.'),
        W(fact(word.length)/fact(reps[0]),'Divides out only one of the repeated letters.'),
        W(fact(Object.keys(counts).length),'Arranges only the distinct letters.'),
        W(ans*2,'Doubles the count.'),
        W(fact(word.length)/(reps.reduce(function(a,b){return a+b;},0)),'Divides by the number of repeats rather than their factorials.'),
        W(Math.pow(word.length,2),'Squares the length.')],
      fast:'n! over (repeat count)! for each letter that repeats.', p:{word:word}};
  },
  verify:function(q){
    var w=q.p.word.split(''), seen={};
    (function perm(arr, pre){ if(!arr.length){ seen[pre]=1; return; }
      var used={}; for(var i=0;i<arr.length;i++){ if(used[arr[i]]) continue; used[arr[i]]=1;
        perm(arr.slice(0,i).concat(arr.slice(i+1)), pre+arr[i]); } })(w,'');
    return GEN.numOf(q.opts[q.ans])===Object.keys(seen).length;
  }
});

/* ---------- committees with a restriction ---------- */
GEN.add({
  id:'gq.comb.committee', topic:'gq.comb', n:28, trick:'g.comb.rest',
  make:function(r,k,n){
    var t=r.tier(k,n), N=r.int(6,12), K=r.int(2,Math.min(5,N-2)), kind=t==='warm'?'plain':r.pick(['must','notboth','mixed']);
    var ans, how, stem;
    if(kind==='plain'){ ans=choose(N,K); stem='In how many ways can a committee of '+K+' be chosen from '+N+' people?'; how='C('+N+', '+K+')'; }
    else if(kind==='must'){ ans=choose(N-1,K-1); stem='A committee of '+K+' is chosen from '+N+' people, and Rafi must be on it. How many committees are possible?'; how='Rafi is placed; choose the other '+(K-1)+' from '+(N-1)+': C('+(N-1)+', '+(K-1)+')'; }
    else if(kind==='notboth'){ ans=choose(N,K)-choose(N-2,K-2); stem='A committee of '+K+' is chosen from '+N+' people. Two of them, Anika and Omar, refuse to serve together. How many committees are possible?'; how='All C('+N+', '+K+') minus those with both, C('+(N-2)+', '+(K-2)+')'; }
    else { var men=r.int(3,N-3), women=N-men, km=r.int(1,Math.min(K-1,men)), kw=K-km; if(kw>women||kw<1) return null;
      ans=choose(men,km)*choose(women,kw); stem='From '+men+' men and '+women+' women, a committee of '+km+' men and '+kw+' women is to be chosen. How many committees are possible?'; how='C('+men+', '+km+') &times; C('+women+', '+kw+')'; }
    return {b:tb(t,-0.5,0.4,0.9), stem:stem,
      correct:W(ans,how+' = '+ans+'.'),
      wrong:[W(choose(N,K),'Ignores the condition.'),
        W(fact(N)/fact(N-K),'Counts ordered selections; a committee has no order.'),
        W(kind==='notboth'?choose(N-2,K-2):choose(N-1,K),kind==='notboth'?'Gives the committees with both of them.':'Leaves the named person out instead of putting them in.'),
        W(kind==='mixed'?choose(N,K)-ans||ans+1:ans*K,kind==='mixed'?'Takes the complement.':'Multiplies by the committee size.'),
        W(choose(N,K-1),'Chooses one person too few.'),
        W(ans+1,'Off by one.')],
      fast: kind==='must' ? 'Put the fixed person in first, then choose the rest.' : kind==='notboth' ? 'Total minus the forbidden cases.' : kind==='mixed' ? 'Choose each group separately and multiply.' : 'Order does not matter: C(n, k).',
      p:{N:N,K:K,kind:kind,stem:stem}};
  },
  verify:function(q){
    var p=q.p, v=GEN.numOf(q.opts[q.ans]);
    if(p.kind==='plain') return v===choose(p.N,p.K);
    if(p.kind==='must') return v===choose(p.N-1,p.K-1);
    if(p.kind==='notboth'){ var c=0; for(var m=0;m<(1<<p.N);m++){ var bits=0,x=m; while(x){bits+=x&1;x>>=1;} if(bits===p.K && !((m&1)&&(m&2))) c++; } return v===c; }
    var mm=p.stem.match(/From (\d+) men and (\d+) women, a committee of (\d+) men and (\d+) women/);
    return v===choose(+mm[1],+mm[3])*choose(+mm[2],+mm[4]);
  }
});

/* ---------- people in a row, together or apart ---------- */
GEN.add({
  id:'gq.comb.row', topic:'gq.comb', n:26, trick:'g.comb.slot',
  make:function(r,k,n){
    var t=r.tier(k,n), N=r.int(4,7), apart=t!=='warm'&&r.chance(0.5), ends=t==='hard'&&r.chance(0.5);
    var together=2*fact(N-1), ans, stem;
    var nm=r.sample(GEN.NAMES,2), set=r.pick([
      [N+' people stand in a row. ', nm[0]+' and '+nm[1], 'stand'],
      [N+' different books are placed on a shelf. ', 'The atlas and the dictionary', 'be placed'],
      [N+' cars park in a row of '+N+' bays. ', 'The red car and the blue car', 'park'],
      [N+' speakers are scheduled one after another. ', nm[0]+' and '+nm[1], 'speak']]);
    if(ends){ ans=2*fact(N-2); stem=set[0]+set[1]+' must '+set[2]+' at the two ends. How many arrangements are possible?'; }
    else if(apart){ ans=fact(N)-together; stem=set[0]+set[1]+' must not '+set[2]+' next to each other. How many arrangements are possible?'; }
    else { ans=together; stem=set[0]+set[1]+' must '+set[2]+' next to each other. How many arrangements are possible?'; }
    return {b:tb(t,-0.3,0.4,0.8), stem:stem,
      correct:W(ans, ends ? 'Sadia and Kabir take the ends in 2 ways; the other '+(N-2)+' fill the middle in '+(N-2)+'! ways.' : apart ? 'All '+N+'! = '+fact(N)+' minus the '+together+' with them together.' : 'Glue them into one block: '+(N-1)+' units in '+(N-1)+'! ways, times 2 for their order inside the block.'),
      wrong:[W(fact(N-1),'Glues them together but forgets they can swap places.'),
        W(fact(N),'Ignores the condition.'),
        W(apart?together:fact(N)-together, apart?'Gives the arrangements with them together.':'Gives the arrangements with them apart.'),
        W(ends?fact(N-2):2*fact(N-2),ends?'Forgets they can swap ends.':'Treats them as fixed at the ends.'),
        W(N*(N-1),'Counts only where the two stand.'), W(ans/2,'Halves the count.')],
      fast: ends ? '2 &times; '+(N-2)+'!.' : apart ? 'Apart = all &minus; together.' : 'Block them: 2 &times; '+(N-1)+'!.',
      p:{N:N,apart:apart,ends:ends}};
  },
  verify:function(q){
    var p=q.p, c=0, idx=[]; for(var i=0;i<p.N;i++) idx.push(i);
    (function perm(arr, pre){
      if(!arr.length){ var a=pre.indexOf(0), b=pre.indexOf(1);
        var ok = p.ends ? ((a===0&&b===p.N-1)||(b===0&&a===p.N-1)) : p.apart ? Math.abs(a-b)!==1 : Math.abs(a-b)===1;
        if(ok) c++; return; }
      for(var j=0;j<arr.length;j++) perm(arr.slice(0,j).concat(arr.slice(j+1)), pre.concat([arr[j]]));
    })(idx, []);
    return GEN.numOf(q.opts[q.ans])===c;
  }
});

/* ---------- handshakes, games, diagonals (numeric entry) ---------- */
GEN.add({
  id:'gq.comb.pairs', topic:'gq.comb', type:'ne', n:24, trick:'g.comb.slot',
  make:function(r,k,n){
    var t=r.tier(k,n), N=r.int(5,30), kind=r.pick(['hands','league','diag']), ans, stem, why;
    if(kind==='hands'){ ans=choose(N,2); stem='At a meeting of '+N+' people, everyone shakes hands with everyone else exactly once. How many handshakes are there?'; why='C('+N+', 2) = '+N+' &times; '+(N-1)+'/2 = '+ans+'.'; }
    else if(kind==='league'){ ans=N*(N-1); stem='In a league of '+N+' teams, each team plays every other team twice, once at home and once away. How many games are played?'; why='Ordered pairs: '+N+' &times; '+(N-1)+' = '+ans+'.'; }
    else { if(N>20) return null; ans=N*(N-3)/2; stem='How many diagonals does a convex polygon with '+N+' sides have?'; why='Each vertex joins '+(N-3)+' non-neighbours; '+N+' &times; '+(N-3)+'/2 = '+ans+'.'; }
    return {type:'ne', b:tb(t,-0.5,0.1,0.6), stem:stem, ans:{v:ans}, why:[why],
      fast: kind==='league' ? 'Home and away means order matters: n(n &minus; 1).' : kind==='diag' ? 'n(n &minus; 3)/2 &mdash; pairs of vertices minus the sides.' : 'n(n &minus; 1)/2.',
      p:{N:N,kind:kind}};
  },
  verify:function(q){
    var p=q.p, c=0, i, j;
    for(i=0;i<p.N;i++) for(j=0;j<p.N;j++){ if(i===j) continue;
      if(p.kind==='league') c++; else if(i<j){ if(p.kind==='hands') c++; else if(!((j-i)===1||(i===0&&j===p.N-1))) c++; } }
    return q.ans.v===c;
  }
});

/* ===========================================================
   DATA INTERPRETATION — a table is drawn, then one question.
   =========================================================== */
var SERIES=[
  {title:'Revenue by division ($ millions)', rows:['Retail','Online','Wholesale']},
  {title:'Students enrolled by faculty', rows:['Arts','Science','Business']},
  {title:'Exports by product (thousand tonnes)', rows:['Tea','Jute','Leather']},
  {title:'Visitors by month (thousands)', rows:['Museum','Zoo','Park']},
  {title:'Units sold by region', rows:['North','South','East']}
];
function makeTable(r){
  var s=r.pick(SERIES), y0=r.int(2016,2019), cols=[y0,y0+1,y0+2,y0+3,y0+4], data=[];
  for(var i=0;i<s.rows.length;i++){
    var v=r.int(40,300), row=[];
    for(var j=0;j<cols.length;j++){ row.push(v); v=Math.max(10, Math.round(v*(1+r.pick([-0.2,-0.1,0,0.1,0.15,0.2,0.25,0.3,0.5])))); }
    data.push(row);
  }
  return {title:s.title, rows:s.rows, cols:cols, data:data};
}
function tableHTML(T){
  var h='<p style="margin:0 0 6px"><b>'+T.title+'</b></p><table class="qtbl"><tr><th></th>';
  T.cols.forEach(function(c){ h+='<th>'+c+'</th>'; }); h+='</tr>';
  T.rows.forEach(function(rn,i){ h+='<tr><td>'+rn+'</td>'; T.data[i].forEach(function(v){ h+='<td>'+v+'</td>'; }); h+='</tr>'; });
  return h+'</table>';
}

GEN.add({
  id:'gq.di.change', topic:'gq.di', n:30, trick:'g.di.frame',
  make:function(r,k,n){
    var t=r.tier(k,n), T=makeTable(r), i=r.int(0,2), a=r.int(0,3), b=r.int(a+1,4);
    var v0=T.data[i][a], v1=T.data[i][b], ch=100*(v1-v0)/v0;
    if(v0===v1 || Math.abs(ch*10-Math.round(ch*10))>1e-9) return null;
    return {b:tb(t,-0.4,0.3,0.8),
      stem:tableHTML(T)+'<br>By approximately what percent did the figure for <b>'+T.rows[i]+'</b> change from '+T.cols[a]+' to '+T.cols[b]+'?',
      correct:W((ch>0?'Increase of ':'Decrease of ')+F.n(Math.abs(ch),1)+'%','('+v1+' &minus; '+v0+') / '+v0+' = '+F.n(ch,1)+'%.'),
      wrong:[W((ch>0?'Increase of ':'Decrease of ')+F.n(Math.abs(100*(v1-v0)/v1),1)+'%','Divides by the later value instead of the earlier one.'),
        W((ch>0?'Increase of ':'Decrease of ')+F.n(Math.abs(v1-v0),1)+'%','Treats the raw difference as a percent.'),
        W((ch>0?'Decrease of ':'Increase of ')+F.n(Math.abs(ch),1)+'%','Right size, wrong direction.'),
        W((ch>0?'Increase of ':'Decrease of ')+F.n(Math.abs(100*v1/v0),1)+'%','Gives the later value as a percent of the earlier.'),
        W((ch>0?'Increase of ':'Decrease of ')+F.n(Math.abs(ch)/(b-a),1)+'%','Divides by the number of years.')],
      fast:'Change &divide; starting value. '+v0+' to '+v1+' is a change of '+(v1-v0)+' on '+v0+'.',
      p:{v0:v0,v1:v1}};
  },
  verify:function(q){ var p=q.p, t=GEN.F.plain(q.opts[q.ans]), ch=100*(p.v1-p.v0)/p.v0;
    return (t.indexOf('increase')===0)===(ch>0) && Math.abs(parseFloat(t.replace(/^[a-z ]+/,''))-Math.abs(ch))<0.05; }
});

GEN.add({
  id:'gq.di.share', topic:'gq.di', n:30, trick:'g.di.frame',
  make:function(r,k,n){
    var t=r.tier(k,n), T=makeTable(r), j=r.int(0,4), i=r.int(0,2);
    var col=T.data.map(function(row){ return row[j]; }), tot=sum(col), share=100*col[i]/tot;
    return {b:tb(t,-0.3,0.3,0.7),
      stem:tableHTML(T)+'<br>In '+T.cols[j]+', approximately what percent of the three-way total came from <b>'+T.rows[i]+'</b>?',
      correct:W(F.n(share,1)+'%',col[i]+' of a total '+tot+' = '+F.n(share,1)+'%.'),
      wrong:[W(F.n(100*col[i]/(tot-col[i]),1)+'%','Divides by the other two only.'),
        W(F.n(100/3,1)+'%','Assumes an equal three-way split.'),
        W(F.n(100*col[i]/sum(T.data[i]),1)+'%','Divides by the row total across years instead of the year\'s column.'),
        W(F.n(100-share,1)+'%','Gives the share of the other two.'),
        W(F.n(share*2,1)+'%','Doubles the share.')],
      fast:'Add the '+T.cols[j]+' column ('+tot+'), then '+col[i]+'/'+tot+'. Check against 1/3 &asymp; 33% to eliminate fast.',
      p:{part:col[i],tot:tot}};
  },
  verify:function(q){ return Math.abs(parseFloat(GEN.F.plain(q.opts[q.ans]))-100*q.p.part/q.p.tot)<0.05; }
});

GEN.add({
  id:'gq.di.growth', topic:'gq.di', n:28, trick:'g.di.frame',
  make:function(r,k,n){
    var t=r.tier(k,n), T=makeTable(r), i=r.int(0,2), row=T.data[i], best=-1, bestJ=-1, pctMode=t!=='warm'&&r.chance(0.5);
    for(var j=1;j<5;j++){ var g= pctMode ? (row[j]-row[j-1])/row[j-1] : row[j]-row[j-1]; if(g>best){ best=g; bestJ=j; } }
    var gains=[]; for(j=1;j<5;j++) gains.push(pctMode?(row[j]-row[j-1])/row[j-1]:row[j]-row[j-1]);
    var sorted=gains.slice().sort(function(a,b){return b-a;});
    if(close(sorted[0],sorted[1]) || best<=0) return null;
    /* make the absolute and percent leaders differ, so the trap is real */
    var absBest=-1, absJ=-1, pctBest=-1, pctJ=-1;
    for(j=1;j<5;j++){ if(row[j]-row[j-1]>absBest){ absBest=row[j]-row[j-1]; absJ=j; } if((row[j]-row[j-1])/row[j-1]>pctBest){ pctBest=(row[j]-row[j-1])/row[j-1]; pctJ=j; } }
    var opts=[], why=[];
    for(j=1;j<5;j++){ opts.push(T.cols[j-1]+' to '+T.cols[j]); why.push((j===bestJ?'Right. ':'')+(pctMode?F.n(100*(row[j]-row[j-1])/row[j-1],1)+'%':(row[j]-row[j-1]>=0?'+':'&minus;')+Math.abs(row[j]-row[j-1]))+' in that year.'+(j!==bestJ&&j===(pctMode?absJ:pctJ)?(pctMode?' The largest rise in raw terms, but not in percent.':' The largest in percent, but not in raw terms.'):'')); }
    opts.push('The change was the same in every year'); why.push('The yearly changes differ.');
    return {type:'mc', b:tb(t,-0.2,0.4,0.9)+(pctMode&&absJ!==pctJ?0.2:0),
      stem:tableHTML(T)+'<br>For <b>'+T.rows[i]+'</b>, between which two consecutive years was the '+(pctMode?'percent increase':'increase')+' greatest?',
      correct:W(opts[bestJ-1], why[bestJ-1]),
      wrong:opts.map(function(o,idx){ return idx===bestJ-1?null:W(o, why[idx]); }).filter(Boolean),
      fast: pctMode ? 'Percent, not raw: a small base can win with a smaller rise. Estimate each ratio.' : 'Subtract neighbours along the row and pick the biggest.',
      p:{row:row,cols:T.cols,pct:pctMode}};
  },
  verify:function(q){
    var p=q.p, best=-Infinity, bj=0;
    for(var j=1;j<5;j++){ var g=p.pct?(p.row[j]-p.row[j-1])/p.row[j-1]:p.row[j]-p.row[j-1]; if(g>best){best=g;bj=j;} }
    return GEN.F.plain(q.opts[q.ans])===GEN.F.plain(p.cols[bj-1]+' to '+p.cols[bj]);
  }
});

GEN.add({
  id:'gq.di.exceed', topic:'gq.di', type:'ms', n:28, trick:'g.fmt.ms',
  make:function(r,k,n){
    var t=r.tier(k,n), T=makeTable(r), a=r.int(0,2), b=(a+r.int(1,2))%3;
    var opts=[], ans=[], why=[];
    for(var j=0;j<5;j++){
      var x=T.data[a][j], y=T.data[b][j], ok = t==='hard' ? x>=1.1*y : x>y;
      opts.push(String(T.cols[j]));
      if(ok) ans.push(j);
      why.push(T.cols[j]+': '+x+' vs '+y+(t==='hard'?' (110% of '+y+' is '+F.n(1.1*y,1)+')':'')+(ok?' &mdash; yes.':' &mdash; no.'));
    }
    if(!ans.length || ans.length===5) return null;
    return {type:'ms', b:tb(t,0,0.4,0.9),
      stem:tableHTML(T)+'<br>In which years was the figure for <b>'+T.rows[a]+'</b> '+(t==='hard'?'at least 10% greater than':'greater than')+' the figure for <b>'+T.rows[b]+'</b>? Select all that apply.',
      opts:opts, ans:ans, why:why,
      fast: t==='hard' ? 'For each year, add a tenth to the '+T.rows[b]+' figure and compare.' : 'Scan the two rows column by column; do not total anything.',
      p:{x:T.data[a],y:T.data[b],hard:t==='hard'}};
  },
  verify:function(q){
    var p=q.p, exp=[]; for(var j=0;j<5;j++) if(p.hard ? p.x[j]>=1.1*p.y[j] : p.x[j]>p.y[j]) exp.push(j);
    return JSON.stringify(exp)===JSON.stringify(q.ans.slice().sort());
  }
});

GEN.add({
  id:'gq.di.average', topic:'gq.di', type:'ne', n:26, trick:'g.di.frame',
  make:function(r,k,n){
    var t=r.tier(k,n), T=makeTable(r), i=r.int(0,2), row=T.data[i], avg=mean(row);
    if(Math.abs(avg*10-Math.round(avg*10))>1e-9) return null;
    return {type:'ne', b:tb(t,-0.5,0.1,0.5),
      stem:tableHTML(T)+'<br>What was the average yearly figure for <b>'+T.rows[i]+'</b> over the five years shown?',
      ans:{v:avg}, tol:0.05,
      why:['('+row.join(' + ')+') &divide; 5 = '+sum(row)+' &divide; 5 = '+F.n(avg,1)+'.'],
      fast:'Pick a round middle value and add up how far each year sits from it; divide that by 5 and adjust.',
      p:{row:row}};
  },
  verify:function(q){ return Math.abs(q.ans.v-mean(q.p.row))<0.05; }
});

})();
