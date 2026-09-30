/* ===========================================================
   GEN — GRE fractions/percents, ratios, and word problems.
   =========================================================== */
(function(){
var F=GEN.F;
function W(t,why){ return {t:t, why:why}; }
function tb(t,w,e,h){ return t==='warm'?w:t==='exam'?e:h; }
/* a percent as a test prints it: 20%, 37.5%, 33 1/3% */
function pctOf(num, den){
  var g=F.gcd(num,den); num/=g; den/=g;
  if(den===1) return num+'%';
  if(den===2||den===4||den===8) return F.n(num/den,3)+'%';
  var whole=Math.floor(num/den), rem=num-whole*den;
  return (whole?whole+' ':'')+rem+'/'+den+'%';
}
function pctVal(s){ var m=String(s).match(/^(\d+)(?: (\d+)\/(\d+))?%$/); if(m) return m[1]*1+(m[2]?m[2]/m[3]:0);
  var d=parseFloat(s); return d; }

/* ---------- more than / less than, reversed ---------- */
GEN.add({
  id:'gq.frac.pctmore', topic:'gq.frac', n:28, trick:'g.pct.mult',
  make:function(r,k,n){
    var t=r.tier(k,n), more=r.chance(0.5);
    var p=r.pick(more?[20,25,50,60,100,150,300,400,33]:[20,25,40,50,60,75,80,10]);
    if(p===33) return null;
    var num=more?100*p:100*p, den=more?100+p:100-p;
    var ans=pctOf(num,den);
    var X=r.pick(['the price of a laptop','the salary of Rafi','the population of Town X','the length of rope A']);
    var Y=r.pick(['the price of a phone','the salary of Nadia','the population of Town Y','the length of rope B']);
    var stem= more ? X.charAt(0).toUpperCase()+X.slice(1)+' is '+p+'% more than '+Y+'. By what percent is '+Y+' less than '+X+'?'
                   : X.charAt(0).toUpperCase()+X.slice(1)+' is '+p+'% less than '+Y+'. By what percent is '+Y+' greater than '+X+'?';
    var rev = more ? pctOf(100*p,100-p>0?100-p:1) : pctOf(100*p,100+p);
    return {b:tb(t,-0.2,0.5,1.0), stem:stem,
      correct:W(ans,'Let '+Y+' be 100. Then '+X+' is '+(more?100+p:100-p)+', and the gap of '+p+' measured against '+(more?100+p:100-p)+' is '+ans+'.'),
      wrong:[W(p+'%','Assumes the percentage is the same in both directions; the base changes.'),
        W(more&&p<100?rev:rev,'Measures the gap against the wrong base.'),
        W((100-p>0?100-p:p/2)+'%','Subtracts the percentage from 100.'),
        W(F.n(p/2,1)+'%','Halves the percentage.'),
        W(pctOf(p*100+100, 100+p),'Adds the base to the gap before dividing.'),
        W(F.n(p*1.1,1)+'%','Rounds the percentage up without reason.')],
      fast:'Plug in 100 for '+Y+': '+X+' = '+(more?100+p:100-p)+'. Gap &divide; new base = '+p+'/'+(more?100+p:100-p)+'.',
      p:{p:p, more:more}};
  },
  verify:function(q){
    var p=q.p.p, v=q.p.more ? 100*p/(100+p) : 100*p/(100-p);
    return Math.abs(pctVal(q.opts[q.ans])-v)<0.01;
  }
});

/* ---------- a fraction of what remains ---------- */
GEN.add({
  id:'gq.frac.remain', topic:'gq.frac', n:28, trick:'g.pick.lcm',
  make:function(r,k,n){
    var t=r.tier(k,n);
    var f1=r.pick([[1,3],[1,4],[2,5],[1,5],[3,8],[1,6],[2,7]]), f2=r.pick([[1,2],[1,3],[1,4],[2,3],[3,5],[1,5]]);
    var f3 = t==='hard' ? r.pick([[1,2],[1,3],[1,4]]) : null;
    var denom=f1[1]*f2[1]*(f3?f3[1]:1), M=denom*r.int(2,t==='warm'?6:15)*10;
    var left=M*(1-f1[0]/f1[1]); var afterB=left*(1-f2[0]/f2[1]); var L=f3?afterB*(1-f3[0]/f3[1]):afterB;
    if(L!==Math.round(L) || L<=0) return null;
    var who=r.pick(GEN.NAMES);
    var stem=who+' spent '+f1[0]+'/'+f1[1]+' of a sum on rent, then '+f2[0]+'/'+f2[1]+' of what remained on food'+
      (f3?', then '+f3[0]+'/'+f3[1]+' of what was left after that on books':'')+', and had '+F.money(L,'$',0)+' left. How much was the original sum?';
    var naiveFrac=1-f1[0]/f1[1]-f2[0]/f2[1]-(f3?f3[0]/f3[1]:0);
    var naive=naiveFrac>0?L/naiveFrac:null;
    return {b:tb(t,-0.3,0.4,1.0), stem:stem,
      correct:W(F.money(M,'$',0),'What is left each time is a fraction of what was left before: '+F.money(M,'$',0)+' &times; '+
        (f1[1]-f1[0])+'/'+f1[1]+' &times; '+(f2[1]-f2[0])+'/'+f2[1]+(f3?' &times; '+(f3[1]-f3[0])+'/'+f3[1]:'')+' = '+F.money(L,'$',0)+'.'),
      wrong:[W(naive&&naive===Math.round(naive)?F.money(naive,'$',0):F.money(L*f1[1],'$',0),'Takes each fraction of the original sum instead of the remainder.'),
        W(F.money(L*f2[1],'$',0),'Undoes only the last step.'),
        W(F.money(left,'$',0),'Stops after undoing the first step; that was the amount after rent.'),
        W(F.money(M*f1[0]/f1[1],'$',0),'Gives the rent, not the original sum.'),
        W(F.money(M+L,'$',0),'Adds what was left to the answer.'), W(F.money(2*M,'$',0),'Doubles the sum.')],
      fast:'Work backwards with the multipliers of what is kept: '+F.money(L,'$',0)+' &divide; '+(f3?((f3[1]-f3[0])+'/'+f3[1]+' &divide; '):'')+
        (f2[1]-f2[0])+'/'+f2[1]+' &divide; '+(f1[1]-f1[0])+'/'+f1[1]+'.',
      p:{f1:f1,f2:f2,f3:f3,L:L}};
  },
  verify:function(q){
    var p=q.p, M=GEN.numOf(q.opts[q.ans]);
    var v=M*(1-p.f1[0]/p.f1[1])*(1-p.f2[0]/p.f2[1])*(p.f3?1-p.f3[0]/p.f3[1]:1);
    return Math.abs(v-p.L)<1e-6;
  }
});

/* ---------- comparing fractions and decimals (QC) ---------- */
GEN.add({
  id:'gq.frac.qcfrac', topic:'gq.frac', type:'qc', n:27, trick:'g.frac.table',
  make:function(r,k){
    var want=k%3, den=r.pick([6,7,8,9,11,12,16,24]), num=r.int(1,den-1);
    if(F.gcd(num,den)!==1) return null;
    var v=num/den, B, bText;
    if(want===2){
      var m=r.int(2,5); bText=(num*m)+'/'+(den*m);
      if(r.chance(0.5) && (den===8||den===16)) bText=String(v);
      B=v;
    } else {
      var off=(want===0?-1:1)*r.pick([0.001,0.004,0.01,0.02]);
      var dec=Math.round((v+off)*1000)/1000;
      if(dec<=0||dec>=1) return null;
      B=dec; bText=String(dec);
      if(Math.abs(B-v)<1e-9) return null;
    }
    var d=GEN.qc([{a:v,b:B,s:''}], num+'/'+den+' = '+F.n(v,4)+(want===2?', exactly the same value.':', against '+bText+'.'));
    if(d.ans!==want) return null;
    return {type:'qc', b:want===2?0.2:0.6, qa:num+'/'+den, qb:bText, ans:d.ans, why:d.why,
      fast:want===2?'Reduce both before comparing.':'Divide to three decimal places, or cross-multiply '+num+'/'+den+' against the decimal as a fraction over 1000.',
      p:{v:v,B:B}};
  },
  verify:function(q){ var c=Math.abs(q.p.v-q.p.B)<1e-9?2:q.p.v>q.p.B?0:1; return c===q.ans; }
});

/* ---------- percent change versus percentage points ---------- */
GEN.add({
  id:'gq.frac.points', topic:'gq.frac', n:26, trick:'g.pct.mult',
  make:function(r,k,n){
    var t=r.tier(k,n), a=r.pick([4,5,8,10,12,15,16,20,25,40]), ch=r.pick([25,50,20,75,40,60,-20,-25,-50,-40]);
    var b=a*(1+ch/100);
    if(b!==Math.round(b*10)/10 || b<=0) return null;
    var what=r.pick(['unemployment rate','interest rate','share of votes','dropout rate']);
    var ask=r.pick(['percent','points']);
    var stem='A country\'s '+what+' went from '+a+'% to '+F.n(b,1)+'%. '+(ask==='percent'
      ? 'By what percent did the rate change?' : 'By how many percentage points did the rate change?');
    var pctText=(ch>0?'up ':'down ')+Math.abs(ch)+'%', ptsText=(b>a?'up ':'down ')+F.n(Math.abs(b-a),1)+' points';
    return {b:tb(t,-0.3,0.3,0.8), stem:stem,
      correct:W(ask==='percent'?pctText:ptsText, ask==='percent'?'The change of '+F.n(Math.abs(b-a),1)+' points, measured against the starting '+a+'%, is '+Math.abs(ch)+'%.':'Percentage points are a plain subtraction: '+F.n(b,1)+' &minus; '+a+' = '+F.n(b-a,1)+'.'),
      wrong:[W(ask==='percent'?(b>a?'up ':'down ')+F.n(Math.abs(b-a),1)+'%':(ch>0?'up ':'down ')+Math.abs(ch)+' points', ask==='percent'?'Reports the change in percentage points as a percent.':'Reports the percent change as points.'),
        W(ask==='percent'?(ch>0?'up ':'down ')+F.n(100*Math.abs(b-a)/b,1)+'%':(b>a?'up ':'down ')+F.n(Math.abs(b-a)*2,1)+' points', ask==='percent'?'Divides by the new rate instead of the old.':'Doubles the gap.'),
        W(ask==='percent'?(ch>0?'down ':'up ')+Math.abs(ch)+'%':(b>a?'down ':'up ')+F.n(Math.abs(b-a),1)+' points','Right size, wrong direction.'),
        W(ask==='percent'?(ch>0?'up ':'down ')+F.n(Math.abs(ch)/2,1)+'%':(b>a?'up ':'down ')+F.n(b,1)+' points', ask==='percent'?'Halves the change.':'Gives the new rate, not the change.'),
        W(ask==='percent'?(ch>0?'up ':'down ')+F.n(b,1)+'%':(b>a?'up ':'down ')+F.n(a,1)+' points','Gives one of the rates, not the change.')],
      fast: ask==='percent' ? 'Gap &divide; start: '+F.n(Math.abs(b-a),1)+' &divide; '+a+'.' : 'Points means subtract. Nothing to divide.',
      p:{a:a,b:b,ask:ask}};
  },
  verify:function(q){
    var p=q.p, t=GEN.F.plain(q.opts[q.ans]), up=t.indexOf('up')===0, v=parseFloat(t.replace(/[^0-9.]/g,''));
    if(up!==(p.b>p.a)) return false;
    return p.ask==='percent' ? Math.abs(v-100*Math.abs(p.b-p.a)/p.a)<0.05 && /%/.test(t) : Math.abs(v-Math.abs(p.b-p.a))<0.05 && /points/.test(t);
  }
});

/* ---------- splitting a total by a ratio ---------- */
GEN.add({
  id:'gq.ratio.split', topic:'gq.ratio', n:28, trick:'g.ratio.k',
  make:function(r,k,n){
    var t=r.tier(k,n), parts=t==='warm'?2:3, rs=[], i;
    for(i=0;i<parts;i++) rs.push(r.int(1,9));
    if(parts===3 && (rs[0]===rs[1]||rs[1]===rs[2])) return null;
    var S=0; rs.forEach(function(x){ S+=x; });
    var unit=r.int(3,40), T=S*unit;
    var names=r.sample(GEN.NAMES, parts);
    var diff = parts===3 && r.chance(0.5);
    var ans = diff ? Math.abs(rs[0]-rs[2])*unit : rs[1%parts]*unit;
    var askWho=names[1%parts];
    var stem=F.money(T,'$',0)+' is shared among '+F.list(names)+' in the ratio '+rs.join(' : ')+'. '+
      (diff ? 'How much more does '+(rs[0]>rs[2]?names[0]:names[2])+' receive than '+(rs[0]>rs[2]?names[2]:names[0])+'?' : 'How much does '+askWho+' receive?');
    if(diff && rs[0]===rs[2]) return null;
    return {b:tb(t,-0.7,0.1,0.6), stem:stem,
      correct:W(F.money(ans,'$',0),'There are '+S+' parts, so one part is '+F.money(T,'$',0)+' &divide; '+S+' = '+F.money(unit,'$',0)+'. '+(diff?'The gap is '+Math.abs(rs[0]-rs[2])+' parts':askWho+' has '+rs[1%parts]+' parts')+'.'),
      wrong:[W(F.money(T/rs[1%parts]===Math.round(T/rs[1%parts])?T/rs[1%parts]:unit*S/2,'$',0),'Divides the total by the share\'s number instead of by the total number of parts.'),
        W(F.money(unit,'$',0),'Stops at the value of one part.'),
        W(F.money(diff?Math.abs(rs[0]-rs[2])*T/S+unit:rs[0]*unit,'$',0),diff?'Adds a part too many.':'Takes the first share in the ratio instead.'),
        W(F.money(diff?rs[0]*unit:T-ans,'$',0),diff?'Gives one share, not the difference.':'Gives what everyone else receives.'),
        W(F.money(Math.round(T*rs[1%parts]/(S-rs[1%parts])),'$',0),'Divides by the other parts only.'),
        W(F.money(ans*2,'$',0),'Doubles the share.')],
      fast:'One part = total &divide; sum of the ratio = '+F.money(unit,'$',0)+'. Multiply by the parts you need.',
      p:{rs:rs,T:T,diff:diff}};
  },
  verify:function(q){
    var p=q.p, S=p.rs.reduce(function(a,b){return a+b;},0), u=p.T/S;
    var v=p.diff?Math.abs(p.rs[0]-p.rs[2])*u:p.rs[1%p.rs.length]*u;
    return GEN.numOf(q.opts[q.ans])===v;
  }
});

/* ---------- chaining two ratios ---------- */
GEN.add({
  id:'gq.ratio.chain', topic:'gq.ratio', n:28, trick:'g.ratio.k',
  make:function(r,k,n){
    var t=r.tier(k,n), p=r.int(1,7), q=r.intNot(2,8,[p]), rr=r.int(1,7), s=r.intNot(2,9,[rr]);
    var A=p*rr, C=q*s, g=F.gcd(A,C); A/=g; C/=g;
    if(A===C) return null;
    var things=r.pick([['cats','dogs','rabbits'],['red','blue','green marbles'],['managers','engineers','interns']]);
    var three = t==='hard';
    var L=F.lcm(q,rr), abc=[p*L/q, L, s*L/rr], gg=F.gcd(F.gcd(abc[0],abc[1]),abc[2]);
    abc=abc.map(function(x){ return x/gg; });
    var stem='The ratio of '+things[0]+' to '+things[1]+' is '+p+' : '+q+', and the ratio of '+things[1]+' to '+things[2]+' is '+rr+' : '+s+'. '+
      (three?'Which is the ratio of '+things[0]+' to '+things[1]+' to '+things[2]+'?':'What is the ratio of '+things[0]+' to '+things[2]+'?');
    function R(x,y){ var h=F.gcd(x,y); return (x/h)+' : '+(y/h); }
    if(three){
      return {b:1.0, stem:stem,
        correct:W(abc.join(' : '),'Make the shared term match: '+things[1]+' becomes '+L+' in both ratios, giving '+abc.join(' : ')+'.'),
        wrong:[W(p+' : '+q+' : '+s,'Writes the two ratios side by side without matching the middle term.'),
          W([p*rr,q*rr,q*s].join(' : '),'Scales only one of the ratios.'),
          W([p,q+rr,s].join(' : '),'Adds the two middle terms.'),
          W([q,L,rr].join(' : '),'Mixes up which term sits where.'),
          W([s,L,p].join(' : '),'Reverses the order of the three.')],
        fast:'LCM of the two '+things[1]+' numbers ('+q+' and '+rr+') is '+L+'. Scale each ratio to it and read across.',
        p:{p:p,q:q,rr:rr,s:s,three:1}};
    }
    return {b:tb(t,-0.4,0.4,0.9), stem:stem,
      correct:W(R(p*rr,q*s),'Multiply across: ('+p+'/'+q+') &times; ('+rr+'/'+s+') = '+(p*rr)+'/'+(q*s)+', which is '+R(p*rr,q*s)+'.'),
      wrong:[W(R(p,s),'Joins the outer numbers directly without matching the middle term.'),
        W(R(p*s,q*rr),'Multiplies the wrong pairs.'),
        W(R(p+rr,q+s),'Adds the ratios term by term.'),
        W(R(q*s,p*rr),'Right numbers, reversed order.'),
        W(R(p*q,rr*s),'Multiplies within each ratio.')],
      fast:'a/c = (a/b)(b/c) = '+p+'/'+q+' &times; '+rr+'/'+s+'. Cancel before multiplying.',
      p:{p:p,q:q,rr:rr,s:s,three:0}};
  },
  verify:function(q){
    var p=q.p, parts=GEN.F.plain(q.opts[q.ans]).split(':').map(function(x){return parseFloat(x);});
    if(p.three) return Math.abs(parts[0]/parts[1]-p.p/p.q)<1e-9 && Math.abs(parts[1]/parts[2]-p.rr/p.s)<1e-9;
    return Math.abs(parts[0]/parts[1]-(p.p*p.rr)/(p.q*p.s))<1e-9;
  }
});

/* ---------- changing a ratio by adding ---------- */
GEN.add({
  id:'gq.ratio.change', topic:'gq.ratio', n:26, trick:'g.ratio.k',
  make:function(r,k,n){
    var t=r.tier(k,n), a=r.int(1,6), b=r.intNot(2,9,[a]), m=r.int(2,12), x=r.int(2,20);
    if(F.gcd(a,b)!==1) return null;
    var red=a*m, blue=b*m, nr=red+x, g=F.gcd(nr,blue), c=nr/g, d=blue/g;
    if(c*b===d*a || d===blue) return null;
    var stem='A jar holds red and blue beads in the ratio '+a+' : '+b+'. After '+x+' red beads are added, the ratio becomes '+c+' : '+d+'. How many blue beads are in the jar?';
    return {type:t==='hard'&&r.chance(0.4)?'ne':'mc', b:tb(t,-0.2,0.5,1.0), stem:stem, ans:{v:blue},
      why:['Red = '+a+'m, blue = '+b+'m. ('+a+'m + '+x+') : '+b+'m = '+c+' : '+d+' gives m = '+m+', so blue = '+blue+'.'],
      correct:W(blue,'Write red = '+a+'m and blue = '+b+'m. Then '+d+'('+a+'m + '+x+') = '+c+'('+b+'m), so m = '+m+' and blue = '+blue+'.'),
      wrong:[W(red,'Gives the original number of red beads.'), W(nr,'Gives the red beads after the addition.'),
        W(m,'Stops at the multiplier.'), W(blue+x,'Adds the new beads to the blue count.'),
        W(red+blue,'Gives the original total.'), W(d,'Reads the blue count straight off the new ratio.')],
      fast:'Blue does not change, so it must be a multiple of both '+b+' and '+d+'. Test those multiples against the red count.',
      p:{a:a,b:b,x:x,c:c,d:d}};
  },
  verify:function(q){
    var p=q.p, v=q.type==='ne'?q.ans.v:GEN.numOf(q.opts[q.ans]);
    if(v%p.b) return false;
    var m=v/p.b; return (p.a*m+p.x)*p.d===p.c*v;
  }
});

/* ---------- concentration of a mixture ---------- */
GEN.add({
  id:'gq.ratio.mix', topic:'gq.ratio', n:26, trick:'g.stat.seesaw',
  make:function(r,k,n){
    var t=r.tier(k,n), V=r.pick([10,12,20,24,30,40,50,60]), c=r.pick([10,15,20,25,30,40,50,60]);
    var solute=V*c/100, mode=t==='warm'?'water':r.pick(['water','target']);
    if(mode==='water'){
      var w=r.pick([5,6,10,15,20,30]), nc=100*solute/(V+w);
      if(Math.abs(nc*10-Math.round(nc*10))>1e-9) return null;
      return {b:tb(t,-0.5,0.2,0.6),
        stem:V+' litres of a '+c+'% salt solution are mixed with '+w+' litres of pure water. What is the salt concentration now?',
        correct:W(F.n(nc,1)+'%','The salt stays at '+F.n(solute,2)+' litres; the volume becomes '+(V+w)+'. '+F.n(solute,2)+'/'+(V+w)+' = '+F.n(nc,1)+'%.'),
        wrong:[W(F.n(c/2,1)+'%','Averages '+c+'% with 0% as if the volumes were equal.'),
          W(F.n(100*solute/w,1)+'%','Divides the salt by the water added instead of the new total.'),
          W(F.n(c-w,1)+'%','Subtracts the litres from the percentage.'),
          W(F.n(100*solute/V*(V/(V+w))*2,1)+'%','Doubles the new concentration.'),
          W(F.n(c*w/(V+w),1)+'%','Weights the old percentage by the water share instead of the solution share.')],
        fast:'Amount of salt is fixed at '+F.n(solute,2)+'. Divide by the new volume, '+(V+w)+'.', p:{V:V,c:c,w:w,mode:mode}};
    }
    var target=r.pick([c/2, c*2/3, c*3/4, c*4/5]), total=100*solute/target, add=total-V;
    if(add<=0 || add!==Math.round(add)) return null;
    return {b:0.9, stem:V+' litres of a '+c+'% acid solution are to be diluted to '+F.n(target,2)+'% by adding pure water. How many litres of water are needed?',
      correct:W(add,'Acid stays at '+F.n(solute,2)+' litres, which must be '+F.n(target,2)+'% of the new total: '+F.n(total,2)+' litres. Add '+add+'.'),
      wrong:[W(total,'Gives the new total volume, not the water to add.'), W(V*(c-target)/100,'Subtracts the percentages and applies them to the volume.'),
        W(V*c/target/2,'Halves the required volume.'), W(Math.round(V*target/c),'Scales the volume the wrong way.'),
        W(add*2,'Doubles the water.'), W(V,'Assumes you must double the volume.')],
      fast:'Acid amount / target percent = new total. Subtract the '+V+' already there.', p:{V:V,c:c,target:target,mode:mode}};
  },
  verify:function(q){
    var p=q.p;
    if(p.mode==='water') return Math.abs(parseFloat(GEN.F.plain(q.opts[q.ans]))-100*(p.V*p.c/100)/(p.V+p.w))<0.05;
    var v=GEN.numOf(q.opts[q.ans]); return Math.abs(100*(p.V*p.c/100)/(p.V+v)-p.target)<1e-6;
  }
});

/* ---------- a ratio with an unknown total (QC) ---------- */
GEN.add({
  id:'gq.ratio.qc', topic:'gq.ratio', type:'qc', n:28, trick:'g.qc.must',
  make:function(r,k){
    var want=GEN.want4(k), a=r.int(2,7), b=r.intNot(2,9,[a]);
    if(F.gcd(a,b)!==1) return null;
    var lo=r.int(20,80), hi=lo+r.int(10,40), S=a+b, ks=[];
    for(var m=1; S*m<=hi; m++) if(S*m>=lo) ks.push(m);
    if(!ks.length) return null;
    var girls=ks.map(function(m){ return b*m; });
    var B;
    if(want===0) B=girls[0]-r.int(1,3);
    else if(want===1) B=girls[girls.length-1]+r.int(1,3);
    else if(want===2){ if(girls.length!==1) return null; B=girls[0]; }
    else { if(girls.length<2) return null; B=girls[0]+1; }
    var pts=ks.map(function(m){ return {a:b*m, b:B, s:(S*m)+' students'}; });
    var d=GEN.qc(pts, 'The class size must be a multiple of '+S+' between '+lo+' and '+hi+': '+ks.map(function(m){return S*m;}).join(' or ')+', so the girls number '+girls.join(' or ')+'.');
    if(!d||d.ans!==want) return null;
    return {type:'qc', b:[0.4,0.4,0.6,0.8][want], pre:'In a class the ratio of boys to girls is '+a+' : '+b+', and the class has at least '+lo+' and at most '+hi+' students.',
      qa:'The number of girls', qb:String(B), ans:d.ans, why:d.why,
      fast:'List the multiples of '+S+' in the range first ('+ks.map(function(m){return S*m;}).join(', ')+'). Every one of them decides the comparison.',
      p:{a:a,b:b,lo:lo,hi:hi,B:B}};
  },
  verify:function(q){
    var p=q.p, S=p.a+p.b, pts=[];
    for(var n=p.lo;n<=p.hi;n++) if(n%S===0) pts.push({a:p.b*n/S, b:p.B});
    return GEN.qc(pts,'').ans===q.ans;
  }
});

/* ---------- workers and days (inverse proportion) ---------- */
GEN.add({
  id:'gq.ratio.inverse', topic:'gq.ratio', n:26, trick:'g.rate.add',
  make:function(r,k,n){
    var t=r.tier(k,n), m1=r.int(4,24), d1=r.int(6,40), m2=r.intNot(3,36,[m1]);
    var h1=t==='hard'?r.pick([6,8,10]):1, h2=t==='hard'?r.pick([4,5,6,8,12]):1;
    var total=m1*d1*h1, ans=total/(m2*h2);
    if(ans!==Math.round(ans) || h1===h2&&t==='hard') return null;
    var stem= t==='hard'
      ? m1+' workers, working '+h1+' hours a day, finish a job in '+d1+' days. How many days would '+m2+' workers take, working '+h2+' hours a day at the same rate?'
      : m1+' workers can build a wall in '+d1+' days. How many days would '+m2+' workers take, working at the same rate?';
    return {b:tb(t,-0.6,0.1,0.8), stem:stem,
      correct:W(ans,'Total work = '+m1+' &times; '+d1+(t==='hard'?' &times; '+h1:'')+' = '+total+' worker-'+(t==='hard'?'hours':'days')+'. Divide by '+m2+(t==='hard'?' &times; '+h2:'')+': '+ans+'.'),
      wrong:[W(F.n(d1*m2/m1,1),'Treats it as direct proportion: more workers, more days.'),
        W(Math.abs(d1-(m2-m1))||d1+1,'Subtracts one day per extra worker.'),
        W(t==='hard'?F.n(m1*d1/m2,1):F.n(ans*2,1),t==='hard'?'Ignores the change in hours per day.':'Doubles the answer.'),
        W(F.n(d1*m1/m2*h2/h1,1),'Inverts the hours ratio.'), W(ans+1,'Adds a day for rounding that is not needed.')],
      fast:'Work is fixed: workers &times; days'+(t==='hard'?' &times; hours':'')+' stays constant. '+total+' &divide; '+(m2*h2)+'.',
      p:{m1:m1,d1:d1,m2:m2,h1:h1,h2:h2}};
  },
  verify:function(q){ var p=q.p; return Math.abs(GEN.numOf(q.opts[q.ans])-p.m1*p.d1*p.h1/(p.m2*p.h2))<1e-9; }
});

/* ---------- two travellers ---------- */
GEN.add({
  id:'gq.word.meet', topic:'gq.word', n:28, trick:'g.rate.add',
  make:function(r,k,n){
    var t=r.tier(k,n), v1=5*r.int(6,18), v2=5*r.intNot(4,16,[v1/5]), mins=r.pick([30,40,45,60,72,75,80,90,96,100,120,150]);
    var toward = t!=='hard' || r.chance(0.5);
    var rel=toward?v1+v2:Math.abs(v1-v2);
    if(!toward && v1===v2) return null;
    var D=rel*mins/60;
    if(D!==Math.round(D)) return null;
    var stem= toward
      ? 'Two cars start '+D+' km apart and drive toward each other at '+v1+' km/h and '+v2+' km/h. After how many minutes do they meet?'
      : 'A cyclist is '+D+' km ahead of a car. The cyclist rides at '+Math.min(v1,v2)+' km/h and the car follows at '+Math.max(v1,v2)+' km/h. After how many minutes does the car catch up?';
    var wrong=[W(Math.round(60*D/(toward?Math.abs(v1-v2)||1:v1+v2)),toward?'Uses the difference of the speeds; closing toward each other adds them.':'Adds the speeds; one chasing the other closes at the difference.'),
      W(Math.round(60*D/((v1+v2)/2)),'Uses the average of the two speeds.'),
      W(Math.round(60*D/Math.max(v1,v2)),'Uses only the faster speed.'),
      W(F.n(mins/60,2),'Gives the time in hours, not minutes.'),
      W(mins*2,'Doubles the time, as if each covered the whole distance.'),
      W(mins+15,'Arithmetic slip in the conversion to minutes.')];
    return {b:tb(t,-0.5,0.2,0.8), stem:stem,
      correct:W(mins,'The gap closes at '+rel+' km/h. '+D+' &divide; '+rel+' = '+F.n(mins/60,3)+' h = '+mins+' minutes.'),
      wrong:wrong, fast:(toward?'Add':'Subtract')+' the speeds to get the closing speed, '+rel+' km/h, then distance &divide; closing speed.',
      p:{D:D,v1:v1,v2:v2,toward:toward}};
  },
  verify:function(q){ var p=q.p, rel=p.toward?p.v1+p.v2:Math.abs(p.v1-p.v2); return Math.abs(GEN.numOf(q.opts[q.ans])-60*p.D/rel)<1e-6; }
});

/* ---------- average speed over equal distances ---------- */
GEN.add({
  id:'gq.word.avgspeed', topic:'gq.word', n:24, trick:'g.rate.harm',
  make:function(r,k,n){
    var t=r.tier(k,n), a=r.int(20,90), b=r.intNot(20,90,[a]);
    var three=t==='hard'&&r.chance(0.5), c=three?r.intNot(20,90,[a,b]):0;
    var ans=three?3/(1/a+1/b+1/c):2*a*b/(a+b);
    if(Math.abs(ans*100-Math.round(ans*100))>1e-9) return null;
    ans=Math.round(ans*100)/100;
    var stem=three
      ? 'A courier covers three equal stretches of road at '+a+', '+b+' and '+c+' km/h. What is the average speed for the whole journey, in km/h?'
      : 'A bus goes from town P to town Q at '+a+' km/h and returns along the same road at '+b+' km/h. What is its average speed for the round trip, in km/h?';
    var arith=three?(a+b+c)/3:(a+b)/2;
    return {type:r.chance(0.2)?'ne':'mc', b:tb(t,-0.1,0.6,1.1), stem:stem, ans:{v:ans},
      why:['Average speed = total distance &divide; total time, which for equal distances is the harmonic mean: '+F.n(ans,2)+'.'],
      correct:W(F.n(ans,2),'Take each stretch as the LCM distance. Total distance over total time gives '+F.n(ans,2)+' km/h, the harmonic mean.'),
      wrong:[W(F.n(arith,1),'Averages the speeds. More time is spent at the slower speed, so the true average is lower.'),
        W(F.n(Math.sqrt(a*b),1),'Uses the geometric mean.'),
        W(F.n(three?Math.max(a,b,c)-Math.min(a,b,c):Math.abs(a-b),1),'Subtracts the speeds.'),
        W(F.n(three?a+b+c:a+b,1),'Adds the speeds.'),
        W(F.n(ans*2,1),'Doubles the harmonic mean.')],
      fast:three?'Equal distances: 3 &divide; (1/'+a+' + 1/'+b+' + 1/'+c+').':'Equal distances: 2ab/(a + b) = 2 &times; '+a+' &times; '+b+' / '+(a+b)+'. It is always below the plain average.',
      p:{a:a,b:b,c:c}};
  },
  verify:function(q){
    var p=q.p, v=p.c?3/(1/p.a+1/p.b+1/p.c):2*p.a*p.b/(p.a+p.b);
    var got=q.type==='ne'?q.ans.v:parseFloat(GEN.F.plain(q.opts[q.ans]));
    return Math.abs(got-v)<0.006;
  }
});

/* ---------- simple and compound interest ---------- */
GEN.add({
  id:'gq.word.interest', topic:'gq.word', n:26, trick:'g.pct.mult',
  make:function(r,k,n){
    var t=r.tier(k,n), P=r.pick([1000,2000,2500,4000,5000,8000,10000,20000]), rate=r.pick([5,10,20,4,8]), yrs=t==='warm'?2:r.int(2,3);
    var ci=P*Math.pow(1+rate/100,yrs)-P, si=P*rate*yrs/100;
    if(Math.abs(ci*100-Math.round(ci*100))>1e-6) return null;
    var ask=t==='warm'?'ci':r.pick(['ci','diff']);
    var ans=ask==='ci'?ci:ci-si;
    var stem=F.money(P,'$',0)+' is invested at '+rate+'% a year, compounded annually. '+
      (ask==='ci'?'How much interest has it earned after '+yrs+' years?':'By how much does the interest after '+yrs+' years exceed the simple interest on the same terms?');
    return {b:tb(t,-0.4,0.3,0.9), stem:stem,
      correct:W(F.money(ans),'Compound: '+F.money(P,'$',0)+' &times; '+F.n(1+rate/100,2)+'<sup>'+yrs+'</sup> = '+F.money(P+ci)+', so interest '+F.money(ci)+
        (ask==='diff'?'; simple interest is '+F.money(si)+', a difference of '+F.money(ans)+'.':'.')),
      wrong:[W(F.money(ask==='ci'?si:ci),ask==='ci'?'Uses simple interest, ignoring interest on interest.':'Gives the compound interest itself, not the difference.'),
        W(F.money(P+ci),'Gives the final balance, not the interest.'),
        W(F.money(ask==='ci'?P*rate/100:si),ask==='ci'?'Stops after one year.':'Gives the simple interest.'),
        W(F.money(P*Math.pow(rate/100,yrs)),'Raises the rate alone to the power, not 1 + rate.'),
        W(F.money(ans*2),'Doubles the result.'), W(F.money(ans+P*rate/100),'Adds one extra year of simple interest.')],
      fast: ask==='diff' ? 'For '+yrs+' years the gap is interest on interest: P(r/100)<sup>2</sup>'+(yrs===3?'(3 + r/100)':'')+' = '+F.money(ans)+'.' : 'Multiplier '+F.n(1+rate/100,2)+'<sup>'+yrs+'</sup>, subtract 1, times '+F.money(P,'$',0)+'.',
      p:{P:P,rate:rate,yrs:yrs,ask:ask}};
  },
  verify:function(q){
    var p=q.p, ci=p.P*Math.pow(1+p.rate/100,p.yrs)-p.P, si=p.P*p.rate*p.yrs/100;
    return Math.abs(GEN.numOf(q.opts[q.ans])-(p.ask==='ci'?ci:ci-si))<0.006;
  }
});

/* ---------- ages ---------- */
GEN.add({
  id:'gq.word.age', topic:'gq.word', n:26, trick:'g.back.mid',
  make:function(r,k,n){
    var t=r.tier(k,n), b0=r.int(3,15), m=r.int(2,5), yrs=r.int(3,12);
    var a0=m*b0, A=a0+yrs, B=b0+yrs, S=A+B;
    var who=r.sample(GEN.NAMES,2);
    var stem=yrs+' years ago '+who[0]+' was '+m+' times as old as '+who[1]+'. Today their ages add up to '+S+'. How old is '+who[0]+' today?';
    return {b:tb(t,-0.3,0.4,0.9), stem:stem,
      correct:W(A,who[1]+' was x and '+who[0]+' was '+m+'x. Today: '+m+'x + '+yrs+' + x + '+yrs+' = '+S+', so x = '+b0+' and '+who[0]+' is '+A+'.'),
      wrong:[W(a0,'Gives '+who[0]+'\'s age '+yrs+' years ago.'), W(B,'Gives '+who[1]+'\'s age today.'),
        W(Math.round(S*m/(m+1)),'Splits today\'s total in the ratio '+m+' : 1, which only held '+yrs+' years ago.'),
        W(A+yrs,'Adds the years twice.'), W(Math.round(S/2),'Halves the total.')],
      fast:'Back-solve: take an option for '+who[0]+', subtract '+yrs+', check it is '+m+' times the other person\'s age then.',
      p:{m:m,yrs:yrs,S:S}};
  },
  verify:function(q){
    var p=q.p, A=GEN.numOf(q.opts[q.ans]), B=p.S-A;
    return (A-p.yrs)===p.m*(B-p.yrs) && B-p.yrs>0;
  }
});

/* ---------- three workers together (numeric entry) ---------- */
GEN.add({
  id:'gq.word.three', topic:'gq.word', type:'ne', n:24, trick:'g.pick.lcm',
  make:function(r,k,n){
    var t=r.tier(k,n), a=r.int(2,12), b=r.intNot(3,15,[a]), c=r.intNot(4,20,[a,b]);
    var mins=60/(1/a+1/b+1/c);
    if(mins!==Math.round(mins)) return null;
    var L=F.lcm(F.lcm(a,b),c);
    return {type:'ne', b:tb(t,0,0.5,0.9), unit:' minutes',
      stem:'Three printers can each finish a job alone in '+a+', '+b+' and '+c+' hours. Working together, how many minutes do they take?',
      ans:{v:mins},
      why:['Rates add: 1/'+a+' + 1/'+b+' + 1/'+c+' of the job per hour, so '+F.n(mins/60,3)+' hours = '+mins+' minutes.'],
      fast:'Call the job '+L+' pages: the printers do '+L/a+', '+L/b+' and '+L/c+' pages an hour, '+(L/a+L/b+L/c)+' in all. '+L+' &divide; '+(L/a+L/b+L/c)+' hours, times 60.',
      p:{a:a,b:b,c:c}};
  },
  verify:function(q){ var p=q.p; return Math.abs(q.ans.v-60/(1/p.a+1/p.b+1/p.c))<1e-9; }
});

})();
