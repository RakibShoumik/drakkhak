/* ===========================================================
   GEN - GRE Quantitative: algebra (gq.alg).
   Word problems (gq.word) are in gq-alg-word-2.js.

     gq.alg.lin2     mc  two equations, ask a combination (add or subtract them)
     gq.alg.quad     mc  sum and product of roots, identities, x + 1/x
     gq.alg.absval   mc  absolute value: integer counts, sums, extraneous roots
     gq.alg.funcop   mc  f(g(x)), f(x + h), operations defined in the stem
     gq.alg.ineqqc   qc  linear inequality ranges, integer boundaries
     gq.alg.qc2var   qc  two variables under a condition, defined operations
     gq.alg.solveqc  qc  finite solution sets (factoring, absolute value)
     gq.alg.mustms   ms  what must be true, one or two variables

   Every key is computed; every verify() re-derives it by brute force
   or by a different algebraic route.
   =========================================================== */
(function(){
var F=GEN.F;
var X2='x<sup>2</sup>', Y2='y<sup>2</sup>';

/* ---------- helpers ---------- */
/* b inside the tier band; lean 0 = easy end, 1 = hard end */
function band(r, tier, lean){
  var lo=tier==='warm'?-0.9:tier==='exam'?-0.3:0.6, hi=tier==='warm'?-0.4:tier==='exam'?0.5:1.4;
  var f=Math.max(0, Math.min(1, lean+(r.next()-0.5)*0.3));
  return Math.round((lo+(hi-lo)*f)*10)/10;
}
/* one signed term: term(-3,'x',false) gives ' - 3x' */
function term(c, v, first){
  var a=Math.abs(c), body=v ? (a===1?'':F.n(a))+v : F.n(a);
  if(first) return (c<0?'&minus;':'')+body;
  return (c<0?' &minus; ':' + ')+body;
}
/* ex([3,'x'],[-2,'y'],[5,'']) gives '3x - 2y + 5' */
function ex(){
  var out='', first=true;
  for(var i=0;i<arguments.length;i++){ var p=arguments[i]; if(!p[0]) continue; out+=term(p[0],p[1],first); first=false; }
  return out||'0';
}
function N(x){ return F.n(x,2); }
/* ' + 5' or ' - 5' as the next term of a sum, and the same for a subtraction */
function pm(x, f){ f=f||N; return x<0 ? ' &minus; '+f(-x) : ' + '+f(x); }
function mn(x, f){ f=f||N; return x<0 ? ' + '+f(-x) : ' &minus; '+f(x); }
function par(t){ return /^&minus;/.test(t) ? '('+t+')' : t; }
/* a rational value printed as a reduced fraction (denominators up to 840) */
function Q(v){
  for(var d=1; d<=840; d++){ var nn=v*d; if(Math.abs(nn-Math.round(nn))<1e-7) return F.frac(Math.round(nn), d); }
  return null;
}
/* a wrong option, dropped when its value is not a clean rational */
function W(v, why){ if(typeof v!=='number' || !isFinite(v)) return null; var t=Q(v); return t===null?null:{t:t, why:why}; }
function WN(v, why){ if(typeof v!=='number' || !isFinite(v) || Math.abs(v*100-Math.round(v*100))>1e-7) return null; return {t:N(v), why:why}; }
function val(s){ return GEN.numOf(s); }
function eq(a,b){ return Math.abs(a-b)<1e-6; }
function opT(op){ return {'<':'&lt;','<=':'&le;','>':'&gt;','>=':'&ge;'}[op]; }
function cmp(u, op, v){ return op==='<'?u<v : op==='<='?u<=v : op==='>'?u>v : u>=v; }
function flipOp(op){ return {'<':'>','<=':'>=','>':'<','>=':'<='}[op]; }
function absT(s){ return '|'+s+'|'; }
function sgn(d){ return Math.abs(d)<1e-9?0:d>0?1:-1; }
/* the QC class from a list of A - B differences */
function klass(diffs){
  var pos=0, neg=0, zero=0;
  diffs.forEach(function(d){ var s=sgn(d); if(s>0) pos++; else if(s<0) neg++; else zero++; });
  if(!diffs.length) return -1;
  return pos&&!neg&&!zero?0 : neg&&!pos&&!zero?1 : zero&&!pos&&!neg?2 : 3;
}
var CLS=['A is always greater','B is always greater','the two are always equal','the relationship changes'];

/* ===============================================================
   Two linear equations: the question asks for a combination
   =============================================================== */
var GOODS=[['coffee','coffees','sandwich','sandwiches','a caf&eacute;'],
           ['notebook','notebooks','calculator','calculators','a stationery shop'],
           ['adult ticket','adult tickets','child ticket','child tickets','a museum'],
           ['bag of rice','bags of rice','tin of oil','tins of oil','a grocery']];
function qty(c, s, p){ return c===1 ? 'one '+s : c+' '+p; }
function det3(m){
  return m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0]) + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
}
GEN.add({
  id:'gq.alg.lin2', topic:'gq.alg', n:22, trick:'g.sp.tag',
  make:function(r, k, n){
    var tier=r.tier(k,n);
    var kind = tier==='warm' ? r.pick(['sum','cafe']) :
               tier==='exam' ? r.pick(['sum','diff','cafe','diff','sum']) : r.pick(['gsum','gdiff','sq','cyc','gsum']);
    var a,b,c,d,x0,y0,P,Q2,s,g,ask,v,wrong,right,fast,stem,e1,e2;
    var say=r.int(0,2);
    function sys(t1,t2,what){
      return say===0 ? 'If '+t1+' and '+t2+', what is the value of '+what+'?' :
             say===1 ? 'The numbers x and y satisfy both equations below.<br><br>'+t1+'<br>'+t2+'<br><br>What is '+what+'?' :
                       'For the system<br><br>'+t1+'<br>'+t2+'<br><br>which of the following equals '+what+'?';
    }
    if(kind==='cyc'){
      var dg=r.pick([2,3,1]), z0;
      x0=r.int(-4,9); y0=r.int(-4,9); z0=r.int(-4,9);
      if(x0===y0 || y0===z0 || x0===z0) return null;
      var M = dg===1 ? [[1,1,0],[0,1,1],[1,0,1]] : [[dg,1,1],[1,dg,1],[1,1,dg]];
      var names=['x','y','z'], R=M.map(function(row){ return row[0]*x0+row[1]*y0+row[2]*z0; });
      var eqs=M.map(function(row,i){ return ex([row[0],'x'],[row[1],'y'],[row[2],'z'])+' = '+N(R[i]); });
      var cs = dg===1 ? 2 : dg+2, T=R[0]+R[1]+R[2];
      v=x0+y0+z0;
      if(v===0) return null;
      return {type:'mc', b:band(r,tier,dg===1?0.2:0.7),
        stem:'If '+eqs[0]+', '+eqs[1]+', and '+eqs[2]+', what is the value of x + y + z?',
        correct:{t:N(v), why:'Add all three equations: every variable appears with total coefficient '+cs+', so '+cs+'(x + y + z) = '+N(T)+' and x + y + z = '+N(v)+'.'},
        wrong:[
          WN(T/3,'Divides '+N(T)+' by 3 because there are three equations; each variable appears '+cs+' times in the total, so divide by '+cs+'.'),
          WN(T,'Adds the equations and stops at '+N(T)+', which is '+cs+'(x + y + z).'),
          WN(T/2,'Divides by 2 as if each variable appeared twice; here each appears '+cs+' times.'),
          {t:N(z0), why:'That is z alone. Solving for one variable wastes time and still does not answer the question.'},
          {t:N(x0), why:'That is x alone; y and z are still missing.'},
          WN(T/(cs+1),'Divides by '+(cs+1)+', miscounting how often each variable appears in the sum.'),
          {t:N(v+cs), why:'Arithmetic slip after adding the three equations.'}
        ],
        fast:'Never solve a symmetric system. Add everything: '+cs+'(x + y + z) = '+N(T)+', so x + y + z = '+N(v)+'.',
        p:{kind:'cyc', M:M, R:R}};
    }
    x0=r.intNot(-6,12,[0]); y0=r.intNot(-6,12,[0,x0]);
    if(kind==='cafe'){ x0=r.pick([2,2.5,3,3.5,4,4.5,5,6]); y0=r.pick([5,5.5,6,7,7.5,8,9]); if(x0===y0) return null; }
    if(kind==='sum' || kind==='cafe'){
      if(tier==='warm'){ a=r.int(2,5); b=r.intNot(2,6,[a]); c=b; d=a; }
      else { s=r.int(8,14); a=r.int(2,s-2); c=s-a; b=r.intNot(1,s-1,[a,c]); d=s-b; }
      s=a+c; ask='sum';
    } else if(kind==='diff'){
      g=r.int(2,5); c=r.int(1,6); a=c+g; b=r.intNot(-5,6,[0,-g]); d=b+g; ask='diff';
      if(a===b || c===d) return null;
    } else if(kind==='gsum'){
      g=r.int(2,6); c=r.int(1,7); d=r.intNot(1,7,[c]); a=c+g; b=d+g; ask='sum';
    } else if(kind==='gdiff'){
      g=r.int(5,11); a=r.int(1,g-1); c=g-a; b=-r.intNot(1,g-1,[a]); d=-g-b; ask='diff';
    } else { /* sq */
      a=r.int(2,9); b=r.intNot(2,9,[a]); c=b; d=a; ask='sq';
      if(x0*x0===y0*y0) return null;
    }
    if(a*d-b*c===0) return null;
    P=a*x0+b*y0; Q2=c*x0+d*y0;
    if(x0+y0===0 || x0-y0===0) return null;
    e1=ex([a,'x'],[b,'y'])+' = '+N(P); e2=ex([c,'x'],[d,'y'])+' = '+N(Q2);
    if(kind==='cafe'){
      var G=r.pick(GOODS), mo=function(x){ return F.money(x); };
      v=x0+y0;
      return {type:'mc', b:band(r,tier,0.3),
        stem:'At '+G[4]+', '+qty(a,G[0],G[1])+' and '+qty(b,G[2],G[3])+' cost '+mo(P)+' in total, while '+
             qty(c,G[0],G[1])+' and '+qty(d,G[2],G[3])+' cost '+mo(Q2)+'. What is the combined price of one '+G[0]+' and one '+G[2]+'?',
        correct:{t:mo(v), why:'Add the two bills: '+s+' of each item cost '+mo(P+Q2)+', so one of each costs '+mo(P+Q2)+' &divide; '+s+' = '+mo(v)+'.'},
        wrong:[
          {t:mo(P+Q2), why:'Adds the two bills but forgets that '+mo(P+Q2)+' buys '+s+' of each item, not one.'},
          {t:mo((P+Q2)/2), why:'Halves the combined bill, as if the two bills together bought two of each item. They bought '+s+' of each.'},
          {t:mo(Math.abs(y0-x0)), why:'That is the difference between the two prices, not their sum.'},
          {t:mo(y0), why:'That is the price of one '+G[2]+' alone.'},
          {t:mo(x0), why:'That is the price of one '+G[0]+' alone.'},
          {t:mo((P+Q2)/(2*s)), why:'Divides by '+(2*s)+', the count of all items in both bills, instead of '+s+' of each.'}
        ],
        fast:'Do not find either price. Add the bills: '+s+' of each item cost '+mo(P+Q2)+', so one of each costs '+mo(v)+'.',
        p:{kind:kind, a:a,b:b,c:c,d:d,P:P,Q:Q2, ask:'sum'}};
    }
    if(ask==='sum'){
      v=x0+y0;
      var add = kind==='sum';
      var comb = add ? P+Q2 : P-Q2, cf = add ? a+c : a-c;
      right={t:N(v), why:(add?'Add':'Subtract the second equation from the first')+': '+cf+'x + '+cf+'y = '+N(comb)+', so x + y = '+N(comb)+' &divide; '+cf+' = '+N(v)+'.'};
      wrong=[
        {t:N(comb), why:(add?'Adds':'Subtracts')+' the equations to reach '+cf+'(x + y) = '+N(comb)+' and forgets to divide by '+cf+'.'},
        add ? WN((P+Q2)/2,'Divides '+N((P+Q2))+' by 2 as if each variable had coefficient 1; after adding, both coefficients are '+cf+'.')
            : W((P+Q2)/(a+c),'Adds the equations out of habit and divides by the x-coefficient '+(a+c)+'; the y-coefficient is '+(b+d)+', so adding does not isolate x + y here.'),
        {t:N(x0-y0), why:'That is x &minus; y = '+N(x0-y0)+'. The question asks for the sum.'},
        {t:N(x0), why:'That is x alone ('+N(x0)+'); y = '+N(y0)+' still has to be added.'},
        {t:N(y0), why:'That is y alone ('+N(y0)+'); x = '+N(x0)+' still has to be added.'},
        WN(comb/(2*cf),'Divides by '+(2*cf)+', double the shared coefficient.'),
        {t:N(-v), why:'Sign slip: '+(add?'adding':'subtracting')+' the constants in the wrong order.'}
      ];
      fast = add ? 'The x-coefficients ('+a+', '+c+') and the y-coefficients ('+b+', '+d+') both total '+cf+'. Add the equations: '+cf+'(x + y) = '+N(comb)+', so x + y = '+N(v)+'.'
                 : 'Adding gives nothing useful, but '+a+' &minus; '+c+' = '+b+' &minus; '+d+' = '+cf+'. Subtract: '+cf+'(x + y) = '+N(comb)+', so x + y = '+N(v)+'.';
      stem=sys(e1,e2,'x + y');
    } else if(ask==='diff'){
      v=x0-y0;
      var sub = kind==='diff';
      var comb2 = sub ? P-Q2 : P+Q2;
      right={t:N(v), why:(sub?'Subtract the second equation from the first':'Add the equations')+': '+g+'x &minus; '+g+'y = '+N(comb2)+', so x &minus; y = '+N(v)+'.'};
      wrong=[
        {t:N(y0-x0), why:sub ? 'Subtracts the first equation from the second, which gives y &minus; x = '+N(y0-x0)+', the negative of what is asked.'
                             : 'Sign slip: the combined equation is '+g+'x &minus; '+g+'y, so the result is x &minus; y, not y &minus; x.'},
        {t:N(comb2), why:'Reaches '+g+'(x &minus; y) = '+N(comb2)+' and forgets to divide by '+g+'.'},
        {t:N(x0+y0), why:'That is x + y = '+N(x0+y0)+'. The question asks for the difference.'},
        {t:N(x0), why:'That is x alone; subtract y = '+N(y0)+' as well.'},
        {t:N(y0), why:'That is y alone; the question asks for x &minus; y.'},
        sub ? W((P-Q2)/(a+c),'Divides '+N((P-Q2))+' by '+(a+c)+', the sum of the x-coefficients, instead of their difference '+g+'.')
            : W((P-Q2)/(a-c),'Subtracts the equations out of habit; that does not isolate x &minus; y here.'),
        WN(comb2/(2*g),'Divides by '+(2*g)+' instead of '+g+'.')
      ];
      fast = sub ? 'Line the equations up: '+a+' &minus; '+c+' = '+g+' and '+b+' &minus; '+d+' = &minus;'+g+'. Subtract once: '+g+'(x &minus; y) = '+N(comb2)+'.'
                 : 'The x-coefficients add to '+g+' and the y-coefficients add to &minus;'+g+'. Add the equations: '+g+'(x &minus; y) = '+N(comb2)+'.';
      stem=sys(e1,e2,'x &minus; y');
    } else {
      var sm=(P+Q2)/(a+b), df=(P-Q2)/(a-b);
      v=sm*df;
      right={t:N(v), why:'Add: '+(a+b)+'(x + y) = '+N((P+Q2))+', so x + y = '+N(sm)+'. Subtract: '+N((a-b))+'(x &minus; y) = '+N((P-Q2))+', so x &minus; y = '+N(df)+'. Multiply: '+N(v)+'.'};
      wrong=[
        {t:N(df*df), why:'Squares x &minus; y ('+N(df)+'). (x &minus; y)<sup>2</sup> is not x<sup>2</sup> &minus; y<sup>2</sup>.'},
        {t:N(sm*sm), why:'Squares x + y ('+N(sm)+') instead of multiplying it by x &minus; y.'},
        {t:N(x0*x0+y0*y0), why:'That is x<sup>2</sup> + y<sup>2</sup>; the question has a minus sign.'},
        {t:N(-v), why:'Uses y &minus; x = '+N(-df)+' from subtracting in the wrong order, which flips the sign.'},
        {t:N(sm+df), why:'Adds x + y and x &minus; y instead of multiplying them.'},
        {t:N((P+Q2)*(P-Q2)), why:'Multiplies '+N((P+Q2))+' by '+N((P-Q2))+' without first dividing by '+(a+b)+' and '+N((a-b))+'.'}
      ];
      fast='x<sup>2</sup> &minus; y<sup>2</sup> = (x + y)(x &minus; y). Add the equations for one factor ('+N(sm)+'), subtract for the other ('+N(df)+'), multiply.';
      stem=r.chance(0.5) ? 'If '+e1+' and '+e2+', what is the value of x<sup>2</sup> &minus; y<sup>2</sup>?'
                         : 'The numbers x and y satisfy '+e1+' and '+e2+'. What is x<sup>2</sup> &minus; y<sup>2</sup>?';
    }
    return {type:'mc', b:band(r,tier,kind==='sum'||kind==='diff'?0.4:0.7), stem:stem, correct:right, wrong:wrong, fast:fast,
      p:{kind:kind, a:a,b:b,c:c,d:d,P:P,Q:Q2, ask:ask}};
  },
  verify:function(q){
    var p=q.p, v;
    if(p.kind==='cyc'){
      var D=det3(p.M), sol=[0,1,2].map(function(j){
        var m=p.M.map(function(row,i){ var rr=row.slice(); rr[j]=p.R[i]; return rr; });
        return det3(m)/D; });
      v=sol[0]+sol[1]+sol[2];
    } else {
      var dt=p.a*p.d-p.b*p.c, x=(p.P*p.d-p.b*p.Q)/dt, y=(p.a*p.Q-p.c*p.P)/dt;
      v = p.ask==='sum' ? x+y : p.ask==='diff' ? x-y : x*x-y*y;
    }
    return Math.abs(GEN.numOf(q.opts[q.ans])-v)<1e-6;
  }
});

/* ===============================================================
   Quadratics: sum and product of roots, identities
   =============================================================== */
function polyT(a,B,C,form){
  if(form===1) return ex([a,X2],[C,''])+' = '+ex([-B,'x']);
  if(form===2) return ex([a,X2],[B,'x'])+' = '+N(-C);
  return ex([a,X2],[B,'x'],[C,''])+' = 0';
}
GEN.add({
  id:'gq.alg.quad', topic:'gq.alg', n:24, trick:'g.alg.ident',
  make:function(r, k, n){
    var tier=r.tier(k,n);
    var kind = tier==='warm' ? r.pick(['sum','prod','ident']) :
               tier==='exam' ? r.pick(['sumlead','sq','recip','ident','sumlead','sq']) :
                               r.pick(['diff','oneroot','xinv','ratio','diff','oneroot']);
    var lead = kind!=='sum' && kind!=='prod' && (tier!=='exam' || r.chance(0.6)) && kind!=='ratio';
    var a=lead?r.pick([2,3,4,5,6]):1, r1=r.intNot(-7,9,[0]), m;
    if(a===1) m=r.intNot(-9,9,[0,r1,-r1]); else { m=r.intNot(-11,11,[0]); if(F.gcd(m,a)!==1) return null; }
    if(tier==='warm'){ r1=r.int(1,9); m=r.intNot(1,9,[r1]); }
    var B=-(a*r1+m), C=r1*m;
    if(B===0) return null;
    var S=-B/a, Pp=C/a, form=tier==='warm'?0:r.int(0,2), eqT=polyT(a,B,C,form);
    var rr=[r1, m/a], stem, right, wrong, fast, v, lean=0.5, ask=kind;
    var intro=r.pick(['The equation '+eqT+' has two roots, r and s.', 'Let r and s be the two solutions of '+eqT+'.',
                      'The solutions of '+eqT+' are r and s.']);
    var norm = form===0 ? '' : ' First put it in standard form: '+polyT(a,B,C,0)+'.';
    if(kind==='sum' || (kind==='sumlead' && r.chance(0.5))){
      v=S; ask='sum';
      stem=r.pick(['What is the sum of the solutions of '+eqT+'?', intro+' What is r + s?']);
      right={t:Q(v), why:(a===1?'Sum of roots = &minus;b = ':'Sum of roots = &minus;b/a = '+Q(-B)+'/'+a+' = ')+Q(v)+'.'+norm};
      wrong=[
        W(B/a,'Takes the sum as b/a instead of &minus;b/a: the sign is wrong.'),
        W(-B,a===1?'':'Uses &minus;b = '+N((-B))+' and forgets to divide by a = '+a+'.'),
        W(Pp,'That is the product of the roots, c/a.'),
        W(S/2,'That is &minus;b/(2a), the x-value of the vertex: half the sum.'),
        W(Math.max(rr[0],rr[1]),'That is only the larger root.'),
        W(-Pp,'Uses &minus;c/a, mixing up the sum and product formulas.'),
        W(a*S+1,'Arithmetic slip reading b off the equation.')
      ];
      if(a===1) wrong[1]=W(C+B,'Adds the coefficients b and c together; the sum of the roots is &minus;b alone.');
      fast='Never solve for the roots. Sum = &minus;b/a = '+Q(v)+'.'+(form?' Move every term to one side first, or the sign of b will betray you.':'');
      lean=tier==='warm'?0.3:0.3;
    } else if(kind==='prod' || kind==='sumlead'){
      v=Pp; ask='prod';
      stem=r.pick(['What is the product of the solutions of '+eqT+'?', intro+' What is rs?']);
      right={t:Q(v), why:(a===1?'Product of roots = c = ':'Product of roots = c/a = '+N(C)+'/'+a+' = ')+Q(v)+'.'+norm};
      wrong=[
        W(-Pp,'Takes the product as &minus;c/a; the sign belongs to the sum formula, not the product.'),
        W(a===1?-B:C,a===1?'That is the sum of the roots, &minus;b.':'Uses c = '+N(C)+' and forgets to divide by a = '+a+'.'),
        W(S,'That is the sum of the roots, &minus;b/a.'),
        W(B/a,'Uses b/a, which is neither the sum nor the product.'),
        W(Math.min(rr[0],rr[1]),'That is just the smaller root.'),
        W(Pp*a*a,'Multiplies by a instead of dividing.'),
        W(Pp+1,'Arithmetic slip moving the constant across the equals sign.')
      ];
      fast='Product = c/a = '+Q(v)+'. No solving, no factoring.';
      lean=0.3;
    } else if(kind==='sq'){
      v=S*S-2*Pp;
      stem=intro+' What is r<sup>2</sup> + s<sup>2</sup>?';
      right={t:Q(v), why:'r + s = '+Q(S)+' and rs = '+Q(Pp)+', so r<sup>2</sup> + s<sup>2</sup> = (r + s)<sup>2</sup> &minus; 2rs = '+Q(S*S)+mn(2*Pp,Q)+' = '+Q(v)+'.'};
      wrong=[
        W(S*S,'Squares the sum and stops: (r + s)<sup>2</sup> still contains 2rs = '+Q(2*Pp)+'.'),
        W(S*S+2*Pp,'Adds 2rs instead of subtracting it.'),
        W(S*S-4*Pp,'Subtracts 4rs, which gives (r &minus; s)<sup>2</sup>.'),
        W(S*S-Pp,'Subtracts rs once instead of twice.'),
        W(S*S-2*C,'Uses c = '+N(C)+' as the product instead of c/a = '+Q(Pp)+'.'),
        W(-B*-B-2*C,'Forgets to divide b and c by a = '+a+'.')
      ];
      fast='r<sup>2</sup> + s<sup>2</sup> = (sum)<sup>2</sup> &minus; 2(product) = ('+Q(S)+')<sup>2</sup> &minus; 2('+Q(Pp)+') = '+Q(v)+'. Never find r and s.';
      lean=0.5;
    } else if(kind==='recip'){
      v=S/Pp;
      stem=intro+' What is 1/r + 1/s?';
      right={t:Q(v), why:'1/r + 1/s = (r + s)/(rs) = '+par(Q(S))+' &divide; '+par(Q(Pp))+' = '+Q(v)+'.'};
      wrong=[
        W(Pp/S,'Inverts the fraction: that is rs/(r + s).'),
        W(1/S,'Takes 1/(r + s); reciprocals do not add that way.'),
        W(-S/Pp,'Sign slip: the sum is &minus;b/a = '+Q(S)+'.'),
        W(S*Pp,'Multiplies the sum by the product instead of dividing.'),
        W(1/Pp,'Takes 1/(rs) and forgets the sum in the numerator.'),
        W(S,'That is r + s, not 1/r + 1/s.')
      ];
      fast='1/r + 1/s = (r + s)/(rs) = &minus;b/c = '+Q(v)+'. The a cancels, so you never need it.';
      lean=0.6;
    } else if(kind==='ident'){
      var x0=r.intNot(-6,9,[0]), y0=r.intNot(-6,9,[0,x0]), sv=x0+y0, pv=x0*y0, dv=x0-y0, which=tier==='warm'?'sq':r.pick(['sq','dsq','fromd']);
      if(sv===0) return null;
      if(which==='sq'){
        v=sv*sv-2*pv;
        stem=r.pick(['If x + y = '+sv+' and xy = '+pv+', what is the value of '+X2+' + '+Y2+'?',
                     'The numbers x and y have a sum of '+sv+' and a product of '+pv+'. What is '+X2+' + '+Y2+'?']);
        right={t:N(v), why:X2+' + '+Y2+' = (x + y)<sup>2</sup> &minus; 2xy = '+(sv*sv)+mn(2*pv)+' = '+N(v)+'.'};
        wrong=[{t:N(sv*sv), why:'Squares the sum and stops: (x + y)<sup>2</sup> = '+N((sv*sv))+' still contains 2xy.'},
               {t:N(sv*sv+2*pv), why:'Adds 2xy instead of subtracting it.'},
               {t:N(sv*sv-pv), why:'Subtracts xy once instead of twice.'},
               {t:N(sv*sv-4*pv), why:'Subtracts 4xy, which gives (x &minus; y)<sup>2</sup>.'},
               {t:N(2*sv-pv), why:'Doubles the sum and subtracts the product; there is no such identity.'},
               {t:N(sv*sv/2), why:'Halves (x + y)<sup>2</sup>, which only works if x = y.'}];
        fast='(x + y)<sup>2</sup> &minus; 2xy = '+(sv*sv)+mn(2*pv)+'. Never look for x and y.';
      } else if(which==='dsq'){
        v=sv*sv-4*pv;
        stem='If x + y = '+sv+' and xy = '+pv+', what is the value of (x &minus; y)<sup>2</sup>?';
        right={t:N(v), why:'(x &minus; y)<sup>2</sup> = (x + y)<sup>2</sup> &minus; 4xy = '+(sv*sv)+mn(4*pv)+' = '+N(v)+'.'};
        wrong=[{t:N(sv*sv-2*pv), why:'Subtracts 2xy, which gives '+X2+' + '+Y2+', not (x &minus; y)<sup>2</sup>.'},
               {t:N(sv*sv), why:'Assumes (x &minus; y)<sup>2</sup> = (x + y)<sup>2</sup>; the cross terms differ by 4xy.'},
               {t:N(sv*sv+4*pv), why:'Adds 4xy instead of subtracting it.'},
               {t:N(dv), why:'That is x &minus; y itself; it still has to be squared.'},
               {t:N(sv*sv-pv), why:'Subtracts xy once; the cross terms differ by 4xy.'},
               {t:N(Math.abs(sv-pv)), why:'Subtracts the product from the sum, which is not an identity.'}];
        fast='(x &minus; y)<sup>2</sup> = (x + y)<sup>2</sup> &minus; 4xy = '+(sv*sv)+mn(4*pv)+'.';
      } else {
        v=dv*dv+2*pv;
        stem='If x &minus; y = '+N(dv)+' and xy = '+N(pv)+', what is the value of '+X2+' + '+Y2+'?';
        right={t:N(v), why:X2+' + '+Y2+' = (x &minus; y)<sup>2</sup> + 2xy = '+(dv*dv)+pm(2*pv)+' = '+N(v)+'.'};
        wrong=[{t:N(dv*dv-2*pv), why:'Subtracts 2xy; with x &minus; y the cross term comes back with a plus sign.'},
               {t:N(dv*dv), why:'Squares x &minus; y and stops; (x &minus; y)<sup>2</sup> = '+X2+' + '+Y2+' &minus; 2xy.'},
               {t:N(dv*dv+pv), why:'Adds xy once instead of twice.'},
               {t:N(dv*dv+4*pv), why:'Adds 4xy, mixing this identity up with (x + y)<sup>2</sup>.'},
               {t:N(sv*sv), why:'That is (x + y)<sup>2</sup>.'},
               {t:N(2*pv), why:'Uses only 2xy and drops the square.'}];
        fast='(x &minus; y)<sup>2</sup> + 2xy = '+(dv*dv)+pm(2*pv)+'.';
      }
      return {type:'mc', b:band(r,tier,which==='sq'?0.3:0.6), stem:stem, correct:right, wrong:wrong, fast:fast,
        p:{kind:'ident', which:which, s:sv, pr:pv, d:dv}};
    } else if(kind==='diff'){
      v=Math.abs(rr[0]-rr[1]);
      stem=intro+' What is the positive difference between r and s?';
      var disc=B*B-4*a*C;
      right={t:Q(v), why:'(r &minus; s)<sup>2</sup> = (r + s)<sup>2</sup> &minus; 4rs = '+Q(S*S)+mn(4*Pp,Q)+' = '+Q(v*v)+', so |r &minus; s| = '+Q(v)+'.'};
      wrong=[
        W(v*v,'Stops at (r &minus; s)<sup>2</sup> = '+Q(v*v)+' and forgets the square root.'),
        W(Math.sqrt(disc),'Takes &radic;(b<sup>2</sup> &minus; 4ac) = '+Q(Math.sqrt(disc))+' and forgets to divide by a = '+a+'.'),
        W(v/2,'Uses &radic;(b<sup>2</sup> &minus; 4ac)/(2a), which is half the gap: the roots sit that far either side of the vertex.'),
        W(Math.abs(S),'That is the sum of the roots, not their difference.'),
        W(Math.abs(Pp),'That is the size of the product of the roots.'),
        W(Math.sqrt(Math.abs(S*S-2*Pp)),'Uses (r + s)<sup>2</sup> &minus; 2rs, which is r<sup>2</sup> + s<sup>2</sup>, then takes the root.')
      ];
      fast='|r &minus; s| = &radic;(b<sup>2</sup> &minus; 4ac)/|a| = &radic;'+disc+'/'+a+' = '+Q(v)+'.';
      lean=0.7;
    } else if(kind==='oneroot'){
      var askK=r.chance(0.4);
      eqT=ex([a,X2],[1,'kx'],[C,''])+' = 0';
      if(askK){
        v=B; ask='k';
        stem='In the equation '+eqT+', k is a constant. If x = '+N(r1)+' is one solution, what is the value of k?';
        right={t:N(v), why:'Substitute x = '+N(r1)+': '+ex([a*r1*r1,''],[r1,'k'],[C,''])+' = 0, so k = '+N(v)+'. (The other root is '+Q(m/a)+'.)'};
        wrong=[
          W(-B,'Sign slip when moving '+N((a*r1*r1+C))+' to the other side.'),
          W((a*r1*r1-C)/r1,'Moves the constant '+N(C)+' across without changing its sign.'),
          W(m/a,'That is the other root, not k.'),
          W(-(r1+m/a),'Uses k = &minus;(sum of roots) and forgets the leading coefficient '+a+'.'),
          W(-(a*r1*r1+C),'Forgets to divide by '+N(r1)+' at the last step.'),
          W(C/a/r1,'Finds the other root from the product and stops.')
        ];
        fast='Plug the known root straight in: '+ex([a*r1*r1,''],[r1,'k'],[C,''])+' = 0, then solve for k.';
      } else {
        v=m/a; ask='root';
        stem='In the equation '+eqT+', k is a constant. If x = '+N(r1)+' is one solution, what is the other solution?';
        right={t:Q(v), why:'The product of the roots is c/a = '+Q(Pp)+', so the other root is '+Q(Pp)+' &divide; '+par(N(r1))+' = '+Q(v)+'. k never needs to be found.'};
        wrong=[
          W(C/r1,'Uses c = '+N(C)+' as the product of the roots and forgets to divide by a = '+a+'.'),
          W(-v,'Takes the product of the roots as &minus;c/a; the sign is wrong.'),
          W(-r1,'Assumes the roots are opposites, which only happens when the x-term vanishes.'),
          W(B,'That is k, not the other root.'),
          W(Pp,'That is the product of the roots, not the missing root.'),
          W(r1*a,'Multiplies the known root by the leading coefficient; nothing justifies that.')
        ];
        fast='Product of roots = c/a = '+Q(Pp)+'. Divide by the known root '+N(r1)+'. Skip k entirely.';
      }
      lean=0.7;
    } else if(kind==='xinv'){
      var t=r.int(3,8), minus=r.chance(0.4), four=!minus && t<=5 && r.chance(0.4);
      v = minus ? t*t+2 : four ? (t*t-2)*(t*t-2)-2 : t*t-2;
      var sym = minus ? '&minus;' : '+';
      var askT = four ? 'x<sup>4</sup> + 1/x<sup>4</sup>' : X2+' + 1/'+X2;
      stem=r.pick(['If x '+sym+' 1/x = '+t+', what is the value of '+askT+'?','A nonzero number x satisfies x '+sym+' 1/x = '+t+'. What is '+askT+'?']);
      right={t:N(v), why: four ? 'Square once: '+X2+' + 1/'+X2+' = '+t*t+' &minus; 2 = '+(t*t-2)+'. Square again: '+(t*t-2)*(t*t-2)+' &minus; 2 = '+N(v)+'.'
                               : 'Square both sides: '+X2+' '+(minus?'&minus;':'+')+' 2 + 1/'+X2+' = '+t*t+', so '+X2+' + 1/'+X2+' = '+N(v)+'.'};
      wrong = four ? [
        {t:N((t*t-2)*(t*t-2)), why:'Squares twice but only subtracts the cross term 2 the first time.'},
        {t:N(t*t*t*t-2), why:'Raises '+t+' to the fourth power and subtracts 2 once; the middle step is skipped.'},
        {t:N(t*t-2), why:'That is '+X2+' + 1/'+X2+'; one more squaring is needed.'},
        {t:N(t*t*t*t), why:'Treats (x + 1/x)<sup>4</sup> as if it had no cross terms.'},
        {t:N((t*t+2)*(t*t+2)-2), why:'Adds the cross term 2 in the first squaring instead of subtracting it.'},
        {t:N(t*t*t*t-4), why:'Subtracts both cross terms at the end instead of squaring in between.'}
      ] : [
        {t:N(t*t), why:'Squares both sides but forgets the cross term: (x '+sym+' 1/x)<sup>2</sup> has a '+(minus?'&minus;2':'+2')+' in the middle.'},
        {t:N(minus?t*t-2:t*t+2), why:'Right cross term, wrong sign: x &times; 1/x = 1, doubled, is '+(minus?'subtracted':'added')+' in the square.'},
        {t:N(2*t), why:'Doubles '+t+' instead of squaring it.'},
        {t:N(minus?t*t+1:t*t-1), why:'Takes the cross term as 1 instead of 2.'},
        {t:N(t*t-4), why:'Subtracts 4, mixing this up with (x &minus; 1/x)<sup>2</sup> = (x + 1/x)<sup>2</sup> &minus; 4.'},
        {t:N(t*t*2), why:'Squares and then doubles; there is no factor of 2 on the square.'}
      ];
      fast = four ? 'Square, subtract 2, square again, subtract 2: '+t+' &rarr; '+(t*t-2)+' &rarr; '+N(v)+'.'
                  : 'Square it: the middle term is 2 &times; x &times; 1/x = 2. So the answer is '+t*t+' '+(minus?'+':'&minus;')+' 2 = '+N(v)+'.';
      return {type:'mc', b:band(r,tier,four?1:minus?0.6:0.4), stem:stem, correct:right, wrong:wrong, fast:fast,
        p:{kind:'xinv', t:t, minus:minus, four:four}};
    } else { /* ratio */
      v=(S*S-2*Pp)/Pp;
      stem=intro+' What is r/s + s/r?';
      right={t:Q(v), why:'r/s + s/r = (r<sup>2</sup> + s<sup>2</sup>)/(rs) = ((r + s)<sup>2</sup> &minus; 2rs)/(rs) = ('+Q(S*S)+mn(2*Pp,Q)+')/'+par(Q(Pp))+' = '+Q(v)+'.'};
      wrong=[
        W(S*S/Pp,'Uses (r + s)<sup>2</sup> in the numerator and forgets to subtract 2rs.'),
        W(2,'Assumes r/s + s/r is always 2; that only happens when r = s.'),
        W(S/Pp,'That is 1/r + 1/s = (r + s)/(rs).'),
        W((S*S+2*Pp)/Pp,'Adds 2rs instead of subtracting it.'),
        W(S*S-2*Pp,'Finds r<sup>2</sup> + s<sup>2</sup> and forgets to divide by rs.'),
        W((S*S-4*Pp)/Pp,'Subtracts 4rs, which is (r &minus; s)<sup>2</sup> over rs.')
      ];
      fast='r/s + s/r = (sum<sup>2</sup> &minus; 2&middot;product)/product = ('+Q(S*S)+mn(2*Pp,Q)+')/'+par(Q(Pp))+'.';
      lean=0.9;
    }
    if(!right.t) return null;
    return {type:'mc', b:band(r,tier,lean), stem:stem, correct:right, wrong:wrong, fast:fast,
      p:{kind:kind, a:a, B:B, C:C, r1:r1, ask:ask}};
  },
  verify:function(q){
    var p=q.p, got=GEN.numOf(q.opts[q.ans]), v;
    if(p.kind==='ident'){
      var x, y;
      if(p.which==='fromd'){ y=(-p.d+Math.sqrt(p.d*p.d+4*p.pr))/2; x=y+p.d; }
      else { var dd=Math.sqrt(p.s*p.s-4*p.pr); x=(p.s+dd)/2; y=(p.s-dd)/2; }
      v = p.which==='dsq' ? (x-y)*(x-y) : x*x+y*y;
      return Math.abs(got-v)<1e-6;
    }
    if(p.kind==='xinv'){
      var t=p.t, x1 = p.minus ? (t+Math.sqrt(t*t+4))/2 : (t+Math.sqrt(t*t-4))/2;
      v = p.four ? Math.pow(x1,4)+Math.pow(x1,-4) : x1*x1+1/(x1*x1);
      return Math.abs(got-v)<1e-6;
    }
    var disc=p.B*p.B-4*p.a*p.C, ra=(-p.B+Math.sqrt(disc))/(2*p.a), rb=(-p.B-Math.sqrt(disc))/(2*p.a);
    if(p.kind==='oneroot'){
      if(p.ask==='k') v=-(p.a*p.r1*p.r1+p.C)/p.r1;
      else v = Math.abs(ra-p.r1)<1e-9 ? rb : ra;
    }
    else if(p.ask==='sum') v=ra+rb;
    else if(p.ask==='prod') v=ra*rb;
    else if(p.kind==='sq') v=ra*ra+rb*rb;
    else if(p.kind==='recip') v=1/ra+1/rb;
    else if(p.kind==='diff') v=Math.abs(ra-rb);
    else v=ra/rb+rb/ra;
    return Math.abs(got-v)<1e-6;
  }
});

/* ===============================================================
   Absolute value: counts of integer solutions, sums, extraneous roots
   =============================================================== */
function cntInt(lo, loIn, hi, hiIn){
  var first = loIn ? Math.ceil(lo-1e-9) : Math.floor(lo+1e-9)+1;
  var last  = hiIn ? Math.floor(hi+1e-9) : Math.ceil(hi-1e-9)-1;
  return Math.max(0, last-first+1);
}
GEN.add({
  id:'gq.alg.absval', topic:'gq.alg', n:22, trick:'g.fmt.ms',
  make:function(r, k, n){
    var tier=r.tier(k,n);
    var kind = tier==='warm' ? 'cnt' : tier==='exam' ? r.pick(['cnt','out','sumsol','cnt']) : r.pick(['between','eqlin','shift','cnt','eqlin']);
    var v, stem, right, wrong, fast, lean=0.5, vn=r.pick(['x','x','n']);
    if(kind==='cnt'){
      var a = tier==='warm' ? 1 : r.int(2,5), c=r.int(3, tier==='warm'?9:17), b=r.intNot(-12,15,[0]);
      var incl=r.chance(0.5), op=incl?'<=':'<';
      var inner = r.chance(0.5) ? ex([a,vn],[-b,'']) : ex([b,''],[-a,vn]);
      var lo=(b-c)/a, hi=(b+c)/a;
      v=cntInt(lo,incl,hi,incl);
      var loI=incl?Math.ceil(lo-1e-9):Math.floor(lo+1e-9)+1, hiI=incl?Math.floor(hi+1e-9):Math.ceil(hi-1e-9)-1;
      var ineq=absT(inner)+' '+opT(op)+' '+c;
      stem=r.pick(['How many integers '+vn+' satisfy '+ineq+'?',
                   'For how many integer values of '+vn+' is '+ineq+' true?',
                   'The set S consists of every integer '+vn+' for which '+ineq+'. How many members does S have?']);
      var rng=(a===1?N(lo):Q(lo))+' '+opT(op)+' '+vn+' '+opT(op)+' '+(a===1?N(hi):Q(hi));
      right={t:N(v), why:'Unfold the bars: '+N(b-c)+' '+opT(op)+' '+a+vn+' '+opT(op)+' '+N(b+c)+(a>1?', so '+rng:'')+'. The integers run from '+N(loI)+' to '+N(hiI)+': '+v+' of them.'};
      wrong=[
        {t:N(cntInt(lo,!incl,hi,!incl)), why: incl ? 'Drops the endpoints; &le; lets '+absT(inner)+' equal '+c+' exactly.' : 'Keeps the endpoints where '+absT(inner)+' = '+c+'; the inequality is strict.'},
        a>1 ? {t:N(cntInt(b-c,incl,b+c,incl)), why:'Forgets to divide by '+a+': counts integers from '+N(b-c)+' to '+N(b+c)+', which are values of '+a+vn+', not of '+vn+'.'} : null,
        {t:N(v-1), why:'Subtracts the endpoints ('+N(hiI)+' &minus; '+par(N(loI))+') and forgets to add 1 for the first integer.'},
        {t:N(cntInt(b/a,true,hi,incl)), why:'Solves only the positive case, '+a+vn+' &minus; '+par(N(b))+' '+opT(op)+' '+c+', and misses the values below '+Q(b/a)+'.'},
        {t:N(Math.floor(2*c/a)), why:'Takes the length of the interval, 2('+c+')/'+a+', as the number of integers in it.'},
        {t:N(v+1), why:'Counts one integer past the boundary at '+N(hiI+1)+', where '+absT(inner)+' is already '+(incl?'more than':'at least')+' '+c+'.'},
        {t:N(2*c+1), why:'Counts every integer within '+c+' of '+b+', ignoring the coefficient '+a+'.'}
      ];
      fast='Unfold into one double inequality, divide through by '+a+', then count: last &minus; first + 1 = '+N(hiI)+' &minus; '+par(N(loI))+' + 1.';
      lean = a===1 ? 0.3 : 0.6;
      return {type:'mc', b:band(r,tier,lean), stem:stem, correct:right, wrong:wrong, fast:fast, p:{kind:'cnt', a:a, b:b, c:c, incl:incl}};
    }
    if(kind==='out'){
      var M=r.int(8,20), cc=r.int(2,6), p=r.int(-M+cc, M-cc), ge=r.chance(0.5);
      var excl = ge ? 2*cc-1 : 2*cc+1, tot=2*M+1;
      v=tot-excl;
      var cond=absT(ex([1,'x'],[-p,'']))+' '+(ge?'&ge;':'&gt;')+' '+cc;
      stem=r.pick(['How many integers x with '+absT('x')+' &le; '+M+' satisfy '+cond+'?',
                   'Of the integers from &minus;'+M+' to '+M+' inclusive, how many satisfy '+cond+'?']);
      right={t:N(v), why:'There are '+tot+' integers from &minus;'+M+' to '+M+'. The ones that fail are within '+(ge?'less than ':'at most ')+cc+' of '+N(p)+': '+excl+' of them. '+tot+' &minus; '+excl+' = '+v+'.'};
      wrong=[
        {t:N(excl), why:'Counts the integers that fail ('+absT(ex([1,'x'],[-p,'']))+' '+(ge?'&lt;':'&le;')+' '+cc+') instead of those that pass.'},
        {t:N(tot-1-excl), why:'Takes 2 &times; '+M+' = '+(2*M)+' integers from &minus;'+M+' to '+M+', forgetting to count 0.'},
        {t:N(tot-(ge?2*cc+1:2*cc-1)), why: ge ? 'Throws out x = '+N(p-cc)+' and x = '+N(p+cc)+' as well; &ge; keeps them.' : 'Keeps x = '+N(p-cc)+' and x = '+N(p+cc)+'; the inequality is strict, so they fail.'},
        {t:N(M-(p+cc)+(ge?1:0)), why:'Counts only the integers above '+N(p)+' and forgets the ones below.'},
        {t:N(tot-2*cc), why:'Removes 2 &times; '+cc+' = '+(2*cc)+' integers; the band around '+N(p)+' actually holds '+excl+'.'},
        {t:N(v+2), why:'Counts x = '+N(p-cc)+' and x = '+N(p+cc)+' twice.'}
      ];
      fast='Count the complement. The band that fails has '+excl+' integers; '+tot+' &minus; '+excl+' = '+v+'.';
      return {type:'mc', b:band(r,tier,0.6), stem:stem, correct:right, wrong:wrong, fast:fast, p:{kind:'out', M:M, c:cc, p:p, ge:ge}};
    }
    if(kind==='sumsol' || kind==='shift'){
      var aa=r.int(2,6), bb=r.intNot(-13,13,[0]), c2=r.int(2,11), kk=1, e=0, f=c2;
      var x1=(bb+c2)/aa, x2=(bb-c2)/aa;
      if(kind==='shift'){ kk=r.int(2,5); e=r.intNot(-9,9,[0]); f=kk*c2+e; }
      var lhs=(kk>1?kk:'')+absT(ex([aa,'x'],[-bb,'']))+(e?pm(e):'');
      if(kind==='sumsol'){
        v=2*bb/aa;
        stem=r.pick(['What is the sum of all values of x for which '+lhs+' = '+f+'?','If '+lhs+' = '+f+', what is the sum of all possible values of x?']);
        right={t:Q(v), why:'Two cases: '+aa+'x &minus; '+par(N(bb))+' = '+f+' gives x = '+Q(x1)+'; '+aa+'x &minus; '+par(N(bb))+' = &minus;'+f+' gives x = '+Q(x2)+'. Sum: '+Q(v)+'.'};
        wrong=[
          W(x1,'Solves only the positive case and stops at x = '+Q(x1)+'.'),
          W(2*bb,'Forgets to divide by '+aa+': the solutions are centred on '+Q(bb/aa)+', not on '+N(bb)+'.'),
          W(0,'Assumes the two solutions are opposites. They are symmetric about '+Q(bb/aa)+', not about 0.'),
          W(2*c2/aa,'That is the distance between the two solutions, not their sum.'),
          W(x2,'Keeps only the negative case, x = '+Q(x2)+'.'),
          W(bb/aa,'Takes the midpoint '+Q(bb/aa)+' as the sum; the sum is twice the midpoint.'),
          W(x1*x2,'Multiplies the solutions instead of adding them.')
        ];
        fast='The two solutions sit symmetrically around the point where the inside is zero, x = '+Q(bb/aa)+'. Sum = 2 &times; '+Q(bb/aa)+' = '+Q(v)+'.';
        lean=0.5;
      } else {
        v=2*c2/aa;
        stem=r.pick(['What is the positive difference between the two solutions of '+lhs+' = '+f+'?',
                     'The equation '+lhs+' = '+f+' has two solutions. How far apart are they on the number line?']);
        right={t:Q(v), why:'Isolate the bars: '+absT(ex([aa,'x'],[-bb,'']))+' = ('+f+mn(e)+')/'+kk+' = '+c2+'. The solutions are '+Q(x1)+' and '+Q(x2)+', which differ by 2('+c2+')/'+aa+' = '+Q(v)+'.'};
        wrong=[
          W(2*(f-e)/aa,'Forgets to divide by '+kk+' when isolating the absolute value.'),
          W(2*(f+e)/(kk*aa),'Moves '+N(e)+' across without changing its sign.'),
          W(c2/aa,'That is how far each solution sits from the centre '+Q(bb/aa)+'; the gap is twice that.'),
          W(2*c2,'Forgets to divide by '+aa+' at the end.'),
          W(2*bb/aa,'That is the sum of the solutions, not their difference.'),
          W(Math.abs(x1),'That is just the larger solution.')
        ];
        fast='Isolate the bars first: '+absT(ex([aa,'x'],[-bb,'']))+' = '+c2+'. The two solutions are 2 &times; '+c2+'/'+aa+' apart. b never matters.';
        lean=0.7;
      }
      return {type:'mc', b:band(r,tier,lean), stem:stem, correct:right, wrong:wrong, fast:fast, p:{kind:kind, a:aa, b:bb, k:kk, e:e, f:f}};
    }
    if(kind==='between'){
      var p2=r.intNot(-9,9,[0]), c1=r.int(1,4), cB=c1+r.int(2,6), s1=r.chance(0.5), s2=r.chance(0.5);
      var dLo=s1?c1+1:c1, dHi=s2?cB-1:cB, nd=dHi-dLo+1;
      v=2*nd;
      var mid=absT(ex([1,'x'],[-p2,'']));
      stem='How many integers x satisfy '+c1+' '+(s1?'&lt;':'&le;')+' '+mid+' '+(s2?'&lt;':'&le;')+' '+cB+'?';
      right={t:N(v), why:'The distance d = '+mid+' can be '+dLo+' through '+dHi+' ('+nd+' values), and each distance happens on both sides of '+N(p2)+'. '+nd+' &times; 2 = '+v+'.'};
      wrong=[
        {t:N(nd), why:'Counts the distances ('+nd+') but forgets that each one occurs twice, once on each side of '+N(p2)+'.'},
        {t:N(2*(dHi-dLo)), why:'Takes '+dHi+' &minus; '+dLo+' = '+(dHi-dLo)+' distances without the +1, then doubles.'},
        {t:N(2*dHi+1), why:'Ignores the lower bound: counts every x with '+mid+' '+(s2?'&lt;':'&le;')+' '+cB+'.'},
        {t:N(2*(cB-c1+1)), why:'Includes both boundary distances, '+c1+' and '+cB+', although '+(s1&&s2?'both inequalities are strict':s1?'the left inequality is strict':'the right inequality is strict')+'.'},
        {t:N(2*(cB-c1-1)), why:'Excludes both boundary distances, although '+(!s1&&!s2?'both inequalities allow equality':!s1?'the left inequality allows equality':'the right inequality allows equality')+'.'},
        {t:N(2*nd+1), why:'Adds x = '+N(p2)+' itself, where the distance is 0 and fails the lower bound.'}
      ];
      fast='Count distances, then double: '+dLo+' to '+dHi+' is '+nd+' distances, so '+v+' integers.';
      return {type:'mc', b:band(r,tier,0.6), stem:stem, correct:right, wrong:wrong, fast:fast, p:{kind:'between', p:p2, c1:c1, c2:cB, s1:s1, s2:s2}};
    }
    /* eqlin: |px - q| = rx + s, with a root that fails the check */
    var pp=r.int(1,4), rr=r.pick([-2,-1,1,2,3]), qq=r.intNot(-9,12,[0]), ss=r.intNot(-9,9,[0]);
    if(pp===rr || pp===-rr) return null;
    var y1=(qq+ss)/(pp-rr), y2=(qq-ss)/(pp+rr);
    var ok1=rr*y1+ss>1e-9, ok2=rr*y2+ss>1e-9;
    if(!ok1 && !ok2) return null;
    if(Math.abs(y1)>20 || Math.abs(y2)>20 || eq(y1,y2)) return null;
    if(ok1 && ok2 && r.chance(0.65)) return null;
    v=(ok1?y1:0)+(ok2?y2:0);
    var L=absT(ex([pp,'x'],[-qq,''])), Rt=ex([rr,'x'],[ss,'']);
    var bad = !ok1 ? y1 : !ok2 ? y2 : null;
    stem=r.pick(['What is the sum of all solutions of '+L+' = '+Rt+'?','If '+L+' = '+Rt+', what is the sum of all possible values of x?']);
    right={t:Q(v), why:'Case '+ex([pp,'x'],[-qq,''])+' = '+Rt+' gives x = '+Q(y1)+(ok1?' (checks)':', but then '+Rt+' = '+Q(rr*y1+ss)+' is negative, so it is rejected')+'. Case '+
      ex([pp,'x'],[-qq,''])+' = &minus;('+Rt+') gives x = '+Q(y2)+(ok2?' (checks)':', but then '+Rt+' = '+Q(rr*y2+ss)+' is negative, so it is rejected')+'. Sum of survivors: '+Q(v)+'.'};
    var slip=-(qq+ss)/(pp+rr);
    wrong=[
      bad!==null ? W(y1+y2,'Keeps x = '+Q(bad)+' without checking it; there the right side is '+Q(rr*bad+ss)+', and an absolute value is never negative.') :
                   W(y1,'Stops after the first case, x = '+Q(y1)+'; the second case also checks.'),
      bad!==null ? W(bad,'Keeps only x = '+Q(bad)+', the root that fails the check, and throws away the good one.') :
                   W(y2,'Keeps only the second case, x = '+Q(y2)+'.'),
      W((ok1?y1:0)+slip,'In the negative case writes &minus;'+pp+'x &minus; '+par(N(qq))+' instead of &minus;'+pp+'x + '+par(N(qq))+': the minus sign must reach both terms.'),
      W((qq+ss)/(pp+rr)+(qq-ss)/(pp-rr),'Swaps the denominators of the two cases ('+(pp-rr)+' and '+(pp+rr)+').'),
      W(-v,'Sign slip when collecting the x-terms.'),
      W(0,'Assumes the two cases give opposite solutions, as they would for '+absT('x')+' = c.'),
      W(v+1,'Arithmetic slip in the surviving case.')
    ];
    fast='Solve both cases, then plug each answer into the right side, '+Rt+'. It must not be negative. '+(bad!==null?'x = '+Q(bad)+' fails; ':'Both pass; ')+'the sum is '+Q(v)+'.';
    return {type:'mc', b:band(r,tier,0.9), stem:stem, correct:right, wrong:wrong, fast:fast, p:{kind:'eqlin', p:pp, q:qq, r:rr, s:ss}};
  },
  verify:function(q){
    var p=q.p, got=GEN.numOf(q.opts[q.ans]), i, x, cnt=0, sum=0, sols=[];
    if(p.kind==='cnt'){
      for(i=-400;i<=400;i++){ var u=Math.abs(p.a*i-p.b); if(p.incl?u<=p.c:u<p.c) cnt++; }
      return got===cnt;
    }
    if(p.kind==='out'){
      for(i=-p.M;i<=p.M;i++){ var d=Math.abs(i-p.p); if(p.ge?d>=p.c:d>p.c) cnt++; }
      return got===cnt;
    }
    if(p.kind==='between'){
      for(i=-100;i<=100;i++){ var dd=Math.abs(i-p.p); if((p.s1?dd>p.c1:dd>=p.c1) && (p.s2?dd<p.c2:dd<=p.c2)) cnt++; }
      return got===cnt;
    }
    for(i=-4800;i<=4800;i++){
      x=i/120;
      var ok = p.kind==='eqlin' ? Math.abs(Math.abs(p.p*x-p.q)-(p.r*x+p.s))<1e-9
                                : Math.abs(p.k*Math.abs(p.a*x-p.b)+p.e-p.f)<1e-9;
      if(ok) sols.push(x);
    }
    if(p.kind==='shift') return sols.length===2 && Math.abs(got-(sols[1]-sols[0]))<1e-6;
    sols.forEach(function(s){ sum+=s; });
    return sols.length>0 && Math.abs(got-sum)<1e-6;
  }
});

/* ===============================================================
   Functions and operations defined in the stem
   =============================================================== */
var OPS=[
  {t:'ab &minus; a + b',       f:function(a,b){ return a*b-a+b; },     s:function(a,b){ return a*b+a-b; }, st:'ab + a &minus; b'},
  {t:'a<sup>2</sup> &minus; b', f:function(a,b){ return a*a-b; },       s:function(a,b){ return b*b-a; },   st:'b<sup>2</sup> &minus; a'},
  {t:'2a &minus; 3b',          f:function(a,b){ return 2*a-3*b; },     s:function(a,b){ return 3*a-2*b; }, st:'3a &minus; 2b'},
  {t:'a<sup>2</sup> &minus; ab', f:function(a,b){ return a*a-a*b; },    s:function(a,b){ return b*b-a*b; }, st:'b<sup>2</sup> &minus; ab'},
  {t:'3a + b &minus; ab',      f:function(a,b){ return 3*a+b-a*b; },   s:function(a,b){ return 3*a+b+a*b; }, st:'3a + b + ab'},
  {t:'a &minus; b<sup>2</sup>', f:function(a,b){ return a-b*b; },       s:function(a,b){ return (a-b)*(a-b); }, st:'(a &minus; b)<sup>2</sup>'}
];
var SYM=['&diams;','&otimes;','&oplus;','#','&loz;'];
GEN.add({
  id:'gq.alg.funcop', topic:'gq.alg', n:24, trick:'g.sp.tag',
  make:function(r, k, n){
    var tier=r.tier(k,n);
    var kind = tier==='warm' ? r.pick(['comp','op']) : tier==='exam' ? r.pick(['comp','op','fsym','op','comp']) : r.pick(['shift','scale','opsolve','compsolve','opsym']);
    var v, stem, right, wrong, fast, lean=0.5, P={kind:kind};
    if(kind==='comp'){
      var a=r.int(2,5), b=r.intNot(-9,9,[0]), c=r.intNot(-9,9,[0]), neg=r.chance(0.5), kx=tier==='warm'?r.int(2,4):r.intNot(-4,4,[0,1,-1]);
      var gf = neg ? function(x){ return c-x*x; } : function(x){ return x*x+c; };
      var ff = function(x){ return a*x+b; };
      var gT = neg ? ex([c,''],[-1,X2]) : ex([1,X2],[c,'']);
      var outer=r.chance(0.6)?'fg':'gf';
      v = outer==='fg' ? ff(gf(kx)) : gf(ff(kx));
      var name = outer==='fg' ? 'f(g('+N(kx)+'))' : 'g(f('+N(kx)+'))';
      stem=r.pick(['If f(x) = '+ex([a,'x'],[b,''])+' and g(x) = '+gT+', what is the value of '+name+'?',
                   'The functions f and g are defined by f(x) = '+ex([a,'x'],[b,''])+' and g(x) = '+gT+' for all x. What is '+name+'?']);
      var inner = outer==='fg' ? gf(kx) : ff(kx);
      right={t:N(v), why:'Work from the inside out: '+(outer==='fg'?'g':'f')+'('+N(kx)+') = '+N(inner)+', then '+(outer==='fg'?'f':'g')+'('+N(inner)+') = '+N(v)+'.'};
      var sq = neg ? function(x){ return c+x*x; } : function(x){ return -x*x+c; };
      wrong=[
        {t:N(outer==='fg'?gf(ff(kx)):ff(gf(kx))), why:'Applies the functions in the wrong order: that is '+(outer==='fg'?'g(f('+N(kx)+'))':'f(g('+N(kx)+'))')+'. The inner function acts first.'},
        {t:N(ff(kx)*gf(kx)), why:'Multiplies f('+N(kx)+') = '+N(ff(kx))+' by g('+N(kx)+') = '+N(gf(kx))+'. Composition is not multiplication.'},
        {t:N(ff(kx)+gf(kx)), why:'Adds f('+N(kx)+') and g('+N(kx)+') instead of feeding one into the other.'},
        kx<0 ? {t:N(outer==='fg'?ff(sq(kx)):sq(ff(kx))), why:'Squares the negative number wrongly: ('+N(kx)+')<sup>2</sup> is '+(kx*kx)+', not &minus;'+(kx*kx)+'.'} :
               {t:N(outer==='fg'?ff(ff(kx)):gf(gf(kx))), why:'Applies the outer function twice and never uses the inner one.'},
        {t:N(outer==='fg'?a*(inner+b):(function(y){ return neg?c-y*y:y*y+c; })(a*(kx+b))), why:'Distributes wrongly: computes '+a+'('+N(outer==='fg'?inner:kx)+' + '+par(N(b))+') instead of '+a+' &times; '+N(outer==='fg'?inner:kx)+' + '+par(N(b))+'.'},
        {t:N(inner), why:'Stops after the inner function.'}
      ];
      fast='Inside first: '+(outer==='fg'?'g':'f')+'('+N(kx)+') = '+N(inner)+'. Then one more substitution. Write the middle number down; do not build a formula.';
      lean = tier==='warm'?0.3:kx<0?0.6:0.4;
      P={kind:kind, a:a, b:b, c:c, neg:neg, x:kx, outer:outer};
    } else if(kind==='op' || kind==='opsolve' || kind==='opsym'){
      var oi=r.int(0,OPS.length-1), O=OPS[oi], sy=r.pick(SYM);
      var defn='For all numbers a and b, the operation '+sy+' is defined by a '+sy+' b = '+O.t+'.';
      if(kind==='op'){
        var pa=r.intNot(tier==='warm'?1:-3,5,[0]), pb=r.intNot(tier==='warm'?1:-3,5,[0,pa]), pc=r.intNot(-3,5,[0]);
        var left=r.chance(0.6);
        var e1=left ? O.f(O.f(pa,pb),pc) : O.f(pa,O.f(pb,pc));
        if(Math.abs(e1)>600) return null;
        v=e1;
        var inT = left ? N(pa)+' '+sy+' '+N(pb) : N(pb)+' '+sy+' '+N(pc), inV = left ? O.f(pa,pb) : O.f(pb,pc);
        var exprT = left ? '('+inT+') '+sy+' '+N(pc) : N(pa)+' '+sy+' ('+inT+')';
        stem=defn+' What is the value of '+exprT+'?';
        right={t:N(v), why:'Brackets first: '+inT+' = '+N(inV)+'. Then '+(left?N(inV)+' '+sy+' '+N(pc):N(pa)+' '+sy+' '+N(inV))+' = '+N(v)+'.'};
        wrong=[
          {t:N(left?O.f(pa,O.f(pb,pc)):O.f(O.f(pa,pb),pc)), why:'Groups the wrong pair: works '+(left?N(pb)+' '+sy+' '+N(pc):N(pa)+' '+sy+' '+N(pb))+' first. This operation is not associative, so the brackets matter.'},
          {t:N(left?O.f(pc,inV):O.f(inV,pa)), why:'Puts the bracket result, '+N(inV)+', in the wrong slot. Order matters: a is the left number, b the right one.'},
          {t:N(left?O.f(O.f(pb,pa),pc):O.f(pa,O.f(pc,pb))), why:'Swaps a and b inside the brackets; '+inT+' is not the same as the reverse.'},
          {t:N(inV), why:'Stops after the brackets: '+inT+' = '+N(inV)+'.'},
          {t:N(left?O.s(O.s(pa,pb),pc):O.s(pa,O.s(pb,pc))), why:'Misreads the definition as a '+sy+' b = '+O.st+'.'},
          {t:N(left?inV+pc:pa+inV), why:'Combines the bracket result with the last number by plain addition instead of applying '+sy+' again.'}
        ];
        fast='Substitute slowly, one bracket at a time, and write the middle result: '+inT+' = '+N(inV)+'.';
        lean=tier==='warm'?0.3:(pa<0||pb<0||pc<0)?0.6:0.4;
        P={kind:'op', oi:oi, a:pa, b:pb, c:pc, left:left};
      } else if(kind==='opsolve'){
        var qv=r.intNot(-4,6,[0,1]), xv=r.intNot(-6,9,[0,qv]), slot=r.chance(0.5)?'L':'R';
        if(oi===1 && slot==='L' || oi===3 || oi===5 && slot==='R') return null;   /* keep it linear in x */
        v=xv;
        var V = slot==='L' ? O.f(xv,qv) : O.f(qv,xv);
        if(slot==='L' && O.f(xv+1,qv)-O.f(xv,qv)===0) return null;
        if(slot==='R' && O.f(qv,xv+1)-O.f(qv,xv)===0) return null;
        var lhsT = slot==='L' ? 'x '+sy+' '+N(qv) : N(qv)+' '+sy+' x';
        stem=defn+' If '+lhsT+' = '+N(V)+', what is the value of x?';
        var lin = function(g){ var c0=g(0), c1=g(1)-c0; return c1===0?null:(V-c0)/c1; };
        right={t:N(v), why:'Write it out: '+lhsT+' is linear in x, and setting it equal to '+N(V)+' gives x = '+N(v)+'. Check: '+(slot==='L'?N(xv)+' '+sy+' '+N(qv):N(qv)+' '+sy+' '+N(xv))+' = '+N(V)+'.'};
        wrong=[
          W(lin(slot==='L'?function(x){ return O.f(qv,x); }:function(x){ return O.f(x,qv); }),'Solves '+(slot==='L'?N(qv)+' '+sy+' x':'x '+sy+' '+N(qv))+' = '+N(V)+' instead: x is in the '+(slot==='L'?'left':'right')+' slot, so it plays the role of '+(slot==='L'?'a':'b')+'.'),
          W(lin(slot==='L'?function(x){ return O.s(x,qv); }:function(x){ return O.s(qv,x); }),'Misreads the definition as a '+sy+' b = '+O.st+'.'),
          W(V,'Stops at the right-hand side: '+N(V)+' is the value of the operation, not x.'),
          W(-v,'Sign slip when moving the constant term across.'),
          W(lin(function(x){ return slot==='L'?O.f(x,qv)+2*qv:O.f(qv,x)+2*qv; }),'Drops a sign on the '+N(qv)+' term while expanding.'),
          W(v+1,'Arithmetic slip in the last division.')
        ];
        fast='Expand the definition with x in the '+(slot==='L'?'a':'b')+' slot and solve the linear equation, or backsolve: try the choices in '+lhsT+'.';
        lean=0.7;
        P={kind:'opsolve', oi:oi, q:qv, slot:slot, V:V};
      } else {
        var qs=r.intNot(-4,6,[0]);
        var dfun=function(x){ return O.f(x,qs)-O.f(qs,x); };
        var roots=[], xi;
        for(xi=-60;xi<=60;xi++){ if(Math.abs(dfun(xi/4))<1e-9) roots.push(xi/4); }
        var nonQ=roots.filter(function(x){ return !eq(x,qs); });
        if(nonQ.length!==1) return null;
        v=nonQ[0];
        stem=defn+' For which value of x, other than x = '+N(qs)+', is x '+sy+' '+N(qs)+' equal to '+N(qs)+' '+sy+' x?';
        right={t:Q(v), why:'Set the two expansions equal and solve: x = '+N(qs)+' is one solution by symmetry, and the other is x = '+Q(v)+'.'};
        wrong=[
          W(-qs,'Guesses the opposite of '+N(qs)+'; that only works when the operation is odd in both slots.'),
          W(0,'Takes x = 0, which makes both sides simpler but not equal.'),
          W(-v,'Sign slip when collecting terms.'),
          W(2*v,'Forgets to divide by 2 when solving.'),
          W(v/2,'Divides by 2 one time too many.'),
          W(v+qs,'Adds '+N(qs)+' to the solution; it is not a shift.')
        ];
        fast='Expand both sides once, cancel what matches, and solve. Plugging the choices in is just as fast.';
        lean=0.9;
        P={kind:'opsym', oi:oi, q:qs};
      }
    } else if(kind==='fsym'){
      var bq=r.intNot(-6,6,[0]), cq=r.intNot(-10,10,[0]), px=r.intNot(-4,5,[0]), sx=r.intNot(-5,6,[0,px]);
      var fq=function(x){ return x*x+bq*x+cq; }, Vp=fq(px);
      v=fq(sx);
      if(v===Vp) return null;
      stem='The function f is defined by f(x) = '+ex([1,X2],[bq,'x'],[1,'c'])+', where c is a constant. If f('+N(px)+') = '+N(Vp)+', what is f('+N(sx)+')?';
      right={t:N(v), why:'From f('+N(px)+') = '+N(Vp)+': '+N(px*px+bq*px)+' + c = '+N(Vp)+', so c = '+N(cq)+'. Then f('+N(sx)+') = '+N(sx*sx+bq*sx)+pm(cq)+' = '+N(v)+'.'};
      wrong=[
        {t:N(sx*sx+bq*sx), why:'Forgets the constant c = '+N(cq)+'.'},
        {t:N(sx*sx+bq*sx+Vp), why:'Uses f('+N(px)+') = '+N(Vp)+' as if it were c.'},
        {t:N(sx*sx+bq*sx+Vp+(px*px+bq*px)), why:'Moves '+N(px*px+bq*px)+' across without changing its sign, so c comes out as '+N(Vp+px*px+bq*px)+'.'},
        W(Vp*sx/px,'Treats f as proportional, scaling '+N(Vp)+' by '+N(sx)+'/'+N(px)+'. A quadratic does not scale.'),
        {t:N(Vp), why:'Assumes f('+N(sx)+') = f('+N(px)+'); the graph is only symmetric about x = '+Q(-bq/2)+'.'},
        {t:N(sx*sx-bq*sx+cq), why:'Sign slip on the bx term.'}
      ];
      fast='Find c from the given value first ('+N(Vp)+' &minus; '+par(N(px*px+bq*px))+' = '+N(cq)+'), then substitute.';
      lean=0.5;
      P={kind:'fsym', b:bq, px:px, V:Vp, sx:sx};
    } else if(kind==='shift'){
      var h=r.intNot(-5,6,[0]), m=r.intNot(-4,5,[0,1]), c3=r.intNot(-9,9,[0]), t=r.intNot(-6,12,[0,h]);
      v=m*(t-h)+c3;
      stem=r.pick(['The function f satisfies f(x '+pm(h)+') = '+ex([m,'x'],[c3,''])+' for every number x. What is f('+N(t)+')?',
                   'For all x, f(x '+pm(h)+') = '+ex([m,'x'],[c3,''])+'. What is the value of f('+N(t)+')?']);
      right={t:N(v), why:'f('+N(t)+') needs x '+pm(h)+' = '+N(t)+', so x = '+N(t-h)+'. Then '+ex([m,'x'],[c3,''])+' at x = '+N(t-h)+' is '+N(v)+'.'};
      wrong=[
        {t:N(m*t+c3), why:'Plugs '+N(t)+' straight into '+ex([m,'x'],[c3,''])+', treating f(x '+pm(h)+') as if it were f(x).'},
        {t:N(m*(t+h)+c3), why:'Solves x '+pm(h)+' = '+N(t)+' the wrong way, getting x = '+N(t+h)+'.'},
        {t:N(m*t-h+c3), why:'Replaces x by '+N(t)+' &minus; '+par(N(h))+' but forgets to multiply the '+par(N(h))+' by '+N(m)+'.'},
        {t:N(t-h), why:'Stops at x = '+N(t-h)+', the input that is needed, and never evaluates.'},
        {t:N(m*(t-h)-c3), why:'Sign slip on the constant '+N(c3)+'.'},
        {t:N(m*t+c3-h), why:'Evaluates at '+N(t)+' and then subtracts '+par(N(h))+' from the output.'}
      ];
      fast='Ask what x makes the input '+N(t)+': x = '+N(t-h)+'. Evaluate the right side there. Never plug '+N(t)+' in directly.';
      lean=0.6;
      P={kind:'shift', h:h, m:m, c:c3, t:t};
    } else if(kind==='scale'){
      var sc=r.pick([2,3]), c4=r.intNot(-9,9,[0]), t2=sc*r.intNot(-5,6,[0,1]);
      v=(t2/sc)*(t2/sc)+c4;
      stem='For every number x, f('+sc+'x) = '+ex([1,X2],[c4,''])+'. What is f('+N(t2)+')?';
      right={t:N(v), why:'f('+N(t2)+') needs '+sc+'x = '+N(t2)+', so x = '+N(t2/sc)+'. Then ('+N(t2/sc)+')<sup>2</sup>'+pm(c4)+' = '+N(v)+'.'};
      wrong=[
        {t:N(t2*t2+c4), why:'Plugs '+N(t2)+' in as if it were x; the input to f is '+sc+'x, not x.'},
        {t:N(sc*t2*sc*t2+c4), why:'Multiplies by '+sc+' instead of dividing: uses x = '+N(sc*t2)+'.'},
        W(t2*t2/sc+c4,'Squares '+N(t2)+' first and then divides by '+sc+'; the division belongs inside the square.'),
        {t:N((t2/sc)*(t2/sc)), why:'Finds x = '+N(t2/sc)+' and squares it but drops the '+pm(c4).replace(/^ /,'')+'.'},
        W(t2*t2/(sc*sc)*sc+c4,'Divides by '+sc+' once too few after squaring.'),
        {t:N(t2/sc+c4), why:'Forgets to square x = '+N(t2/sc)+'.'}
      ];
      fast='Solve '+sc+'x = '+N(t2)+' for x first (x = '+N(t2/sc)+'), then use the rule.';
      lean=0.5;
      P={kind:'scale', sc:sc, c:c4, t:t2};
    } else { /* compsolve */
      var p1=r.intNot(-4,5,[0,1]), q1=r.intNot(-9,9,[0]), u1=r.intNot(-3,4,[0,1]), w1=r.intNot(-8,8,[0]), tv=r.intNot(-6,8,[0]);
      var fx=function(x){ return p1*x+q1; }, gx=function(x){ return u1*x+w1; };
      var Vt=fx(gx(tv));
      v=tv;
      stem='Let f(x) = '+ex([p1,'x'],[q1,''])+' and g(x) = '+ex([u1,'x'],[w1,''])+'. If f(g(t)) = '+N(Vt)+', what is t?';
      var gt=gx(tv);
      right={t:N(v), why:'Peel from the outside: f(g(t)) = '+N(Vt)+' means g(t) = ('+N(Vt)+mn(q1)+')/'+par(N(p1))+' = '+N(gt)+'. Then '+ex([u1,'t'],[w1,''])+' = '+N(gt)+' gives t = '+N(tv)+'.'};
      wrong=[
        W(((Vt-w1)/u1-q1)/p1,'Solves g(f(t)) = '+N(Vt)+' instead: peels the functions in the wrong order.'),
        W((Vt-q1)/p1,'Solves f(t) = '+N(Vt)+' and ignores g.'),
        {t:N(gt), why:'Stops at g(t) = '+N(gt)+'; that is the input to f, not t.'},
        W(((Vt+q1)/p1-w1)/u1,'Moves '+N(q1)+' across without changing its sign.'),
        W((Vt-q1-w1)/(p1*u1),'Undoes both constants first and both coefficients second; the inner constant is not multiplied by '+N(p1)+' that way.'),
        W(fx(gx(Vt)),'Evaluates f(g('+N(Vt)+')) instead of solving for t.')
      ];
      fast='Undo f, then undo g: ('+N(Vt)+mn(q1)+') &divide; '+par(N(p1))+' = '+N(gt)+', then solve '+ex([u1,'t'],[w1,''])+' = '+N(gt)+'. Or backsolve from the choices.';
      lean=0.8;
      P={kind:'compsolve', p:p1, q:q1, u:u1, w:w1, V:Vt};
    }
    if(!right || right.t===null) return null;
    return {type:'mc', b:band(r,tier,lean), stem:stem, correct:right, wrong:wrong, fast:fast, p:P};
  },
  verify:function(q){
    var p=q.p, got=GEN.numOf(q.opts[q.ans]), v, i, x;
    function scan(fn){ var out=[]; for(i=-2400;i<=2400;i++){ x=i/24; if(Math.abs(fn(x))<1e-9) out.push(x); } return out; }
    if(p.kind==='comp'){
      var f=function(x){ return p.a*x+p.b; }, g=function(x){ return p.neg ? p.c-Math.pow(x,2) : Math.pow(x,2)+p.c; };
      v = p.outer==='fg' ? f(g(p.x)) : g(f(p.x));
    } else if(p.kind==='op'){
      var O=OPS[p.oi].f; v = p.left ? O(O(p.a,p.b),p.c) : O(p.a,O(p.b,p.c));
    } else if(p.kind==='opsolve'){
      var O2=OPS[p.oi].f, s=scan(function(x){ return (p.slot==='L'?O2(x,p.q):O2(p.q,x))-p.V; });
      return s.length===1 && Math.abs(s[0]-got)<1e-9;
    } else if(p.kind==='opsym'){
      var O3=OPS[p.oi].f, s2=scan(function(x){ return O3(x,p.q)-O3(p.q,x); }).filter(function(x){ return Math.abs(x-p.q)>1e-9; });
      return s2.length===1 && Math.abs(s2[0]-got)<1e-9;
    } else if(p.kind==='fsym'){
      var c=p.V-p.px*p.px-p.b*p.px; v=p.sx*p.sx+p.b*p.sx+c;
    } else if(p.kind==='shift'){
      /* tabulate f from its definition and look the input up */
      v=null; for(i=-400;i<=400;i++){ x=i/2; if(Math.abs(x+p.h-p.t)<1e-9) v=p.m*x+p.c; }
    } else if(p.kind==='scale'){
      v=null; for(i=-400;i<=400;i++){ x=i/6; if(Math.abs(p.sc*x-p.t)<1e-9) v=x*x+p.c; }
    } else {
      var s3=scan(function(t){ return p.p*(p.u*t+p.w)+p.q-p.V; });
      return s3.length===1 && Math.abs(s3[0]-got)<1e-9;
    }
    return v!==null && Math.abs(got-v)<1e-9;
  }
});
})();
