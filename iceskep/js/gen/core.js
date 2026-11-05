/* ===========================================================
   GEN — question generators.

   A generator is a question with its numbers left out. Each one
   draws its own parameters from a seeded random stream, computes the
   answer, and builds every wrong option from a specific, named
   mistake — so the key is right by construction, and "why is this
   wrong" always has a real answer.

   Seeds are fixed, so variant 7 of a template is the same question
   every time the page loads. That is what lets the study plan track
   which questions are done.

   The contract for writing one is in DATA-SCHEMA.md, section 5.
   =========================================================== */
var GEN = (function(){

/* ---------- a seeded random stream (mulberry32) ---------- */
function hash(s){
  var h=2166136261>>>0;
  for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; }
  return h>>>0;
}
function rng(seed){
  var a=seed>>>0;
  function next(){
    a=(a+0x6D2B79F5)>>>0;
    var t=a;
    t=Math.imul(t^(t>>>15), t|1);
    t^=t+Math.imul(t^(t>>>7), t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  }
  var r={
    next:next,
    /* integer in [a, b], both ends included */
    int:function(lo,hi){ return lo+Math.floor(next()*(hi-lo+1)); },
    /* an integer in [lo,hi] that is not in the excluded list */
    intNot:function(lo,hi,ex){
      for(var i=0;i<60;i++){ var v=r.int(lo,hi); if(ex.indexOf(v)<0) return v; }
      return lo;
    },
    pick:function(arr){ return arr[Math.floor(next()*arr.length)]; },
    chance:function(p){ return next()<p; },
    sign:function(){ return next()<0.5?-1:1; },
    shuffle:function(arr){
      var b=arr.slice();
      for(var i=b.length-1;i>0;i--){ var j=Math.floor(next()*(i+1)), t=b[i]; b[i]=b[j]; b[j]=t; }
      return b;
    },
    sample:function(arr,k){ return r.shuffle(arr).slice(0,k); },
    /* difficulty tier for variant k of n: roughly 10% warm-up,
       45% exam level, 45% harder than the exam */
    tier:function(k,n){
      var f=(k+0.5)/n;
      return f<0.10 ? 'warm' : f<0.55 ? 'exam' : 'hard';
    }
  };
  return r;
}

/* ---------- formatting ---------- */
var F = {
  gcd:function(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ var t=b; b=a%b; a=t; } return a||1; },
  lcm:function(a,b){ return Math.abs(a*b)/F.gcd(a,b); },
  /* a number the way a test prints it: no float noise, no trailing zeros,
     thousands separated, a real minus sign */
  n:function(x, dp){
    if(typeof x!=='number' || !isFinite(x)) return String(x);
    dp = dp===undefined ? 2 : dp;
    var m=Math.pow(10,dp), v=Math.round(x*m)/m;
    if(Object.is(v,-0)) v=0;
    var neg=v<0, s=Math.abs(v).toFixed(dp);
    if(dp>0) s=s.replace(/\.?0+$/,'');
    var parts=s.split('.');
    if(parts[0].length>4) parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg?'&minus;':'')+parts.join('.');
  },
  money:function(x, sym, dp){
    sym = sym===undefined ? '$' : sym;
    var s=F.n(Math.abs(x), dp===undefined?2:dp);
    if(dp===undefined && /\.\d$/.test(s)) s+='0';
    return (x<0?'&minus;':'')+(sym==='Tk'?'Tk ':sym)+s;
  },
  pct:function(x, dp){ return F.n(x, dp===undefined?2:dp)+'%'; },
  /* a reduced fraction; whole numbers print as whole numbers */
  frac:function(n,d){
    if(d<0){ n=-n; d=-d; }
    var g=F.gcd(n,d); n/=g; d/=g;
    if(d===1) return F.n(n,0);
    return (n<0?'&minus;':'')+Math.abs(n)+'/'+d;
  },
  /* k&radic;m in simplest form */
  root:function(x){
    if(x<0) return 'i&radic;'+(-x);
    var out=1, inside=x;
    for(var f=2; f*f<=inside; f++){ while(inside%(f*f)===0){ inside/=f*f; out*=f; } }
    if(inside===1) return String(out);
    return (out===1?'':out)+'&radic;'+inside;
  },
  pow:function(b,e){ return b+'<sup>'+e+'</sup>'; },
  /* plain text, for comparing two options for sameness */
  plain:function(s){
    return String(s).replace(/<[^>]+>/g,'').replace(/&minus;/g,'-').replace(/&[a-z]+;/g,'#')
      .replace(/\s+/g,' ').trim().toLowerCase();
  },
  ordinal:function(n){ var s=['th','st','nd','rd'], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); },
  list:function(a){ return a.length<2 ? a.join('') : a.slice(0,-1).join(', ')+' and '+a[a.length-1]; }
};

/* the numeric value of an option, if it has exactly one */
function numOf(s){
  var t=F.plain(s).replace(/[$,%]|tk\s*/g,'').replace(/\s*[a-z]+\.?$/,'');
  if(/^-?\d*\.?\d+$/.test(t)) return parseFloat(t);
  var fr=t.match(/^(-?\d+)\/(\d+)$/);
  if(fr) return parseInt(fr[1],10)/parseInt(fr[2],10);
  return null;
}
function same(a,b){
  var na=numOf(a), nb=numOf(b);
  if(na!==null && nb!==null) return Math.abs(na-nb)<1e-9;
  return F.plain(a)===F.plain(b);
}

/* ---------- people, places and things for word problems ---------- */
var NAMES=['Anika','Rafi','Tahmid','Nusrat','Farhan','Sadia','Imran','Mehjabin','Arif','Laila',
  'Priya','Daniel','Maria','Kenji','Omar','Chloe','Ravi','Sofia','Ethan','Zara','Hasan','Tania',
  'Rohan','Leila','Marcus','Ayesha','Kabir','Nadia','Samir','Elena'];
var SHOPS=['a bookshop','a pharmacy','an electronics store','a clothing shop','a bakery',
  'a furniture store','a stationery shop','a shoe shop','a grocery','a sports store'];

/* ---------- building one question ---------- */
var TEMPLATES=[];
function add(t){ TEMPLATES.push(t); ICE.G.push(t); }

/* Four options from one correct answer and a list of named mistakes.
   The mistakes are taken in the order given, skipping any that
   collide with the answer or with each other, so list the most
   tempting first. Four distinct values are needed; with fewer the
   draw is rejected and the generator is asked again. */
function assembleMC(r, spec){
  var correct=spec.correct, pool=spec.wrong||[], chosen=[], i, j, dup;
  for(i=0;i<pool.length && chosen.length<ICE.OPTS-1;i++){
    var w=pool[i];
    if(!w || w.t===undefined || w.t===null || w.t==='' || /NaN|Infinity|undefined/.test(String(w.t))) continue;
    if(same(w.t, correct.t)) continue;
    dup=false;
    for(j=0;j<chosen.length;j++) if(same(chosen[j].t, w.t)){ dup=true; break; }
    if(!dup) chosen.push(w);
  }
  if(chosen.length<ICE.OPTS-1) return null;
  var all=[{t:correct.t, why:correct.why, ok:1}].concat(chosen);
  all=r.shuffle(all);
  var opts=[], why=[], ans=0;
  for(i=0;i<all.length;i++){ opts.push(all[i].t); why.push(all[i].why||''); if(all[i].ok) ans=i; }
  return {opts:opts, why:why, ans:ans};
}

function build(t, r, k){
  var it=t.make(r, k, t.n);
  if(!it) return null;
  var type=it.type||t.type||'mc';
  var q={
    topic:t.topic, type:type, gen:1, tpl:t.id,
    b: typeof it.b==='number' ? it.b : (t.b||0.3),
    stem:it.stem||'', fast:it.fast||'', trick:it.trick||t.trick,
    tags:it.tags||t.tags, p:it.p
  };
  if(it.passage) q.passage=it.passage;
  if(type==='mc'){
    var mc=assembleMC(r, it);
    if(!mc) return null;
    q.opts=mc.opts; q.why=mc.why; q.ans=mc.ans;
  } else if(type==='mcomp'){
    /* three statements and one of the four fixed combinations */
    q.sts=it.sts; q.ans=it.ans; q.why=it.why;
    if(!q.sts || q.sts.length!==3 || typeof q.ans!=='number') return null;
  } else {
    return null;
  }
  return q;
}

/* ---------- reuse a question family in another topic ----------
   Two papers often test the same family — Higher Math 1st and
   Physics 1st both want vectors, both Higher Math papers want
   trigonometry. An alias gets its own id and seed (so its own
   numbers), keeps only single-answer variants, and is verified by
   the source family's own verify(). */
function alias(id, topic, srcId, o){
  o=o||{};
  var src=null;
  for(var i=0;i<TEMPLATES.length;i++) if(TEMPLATES[i].id===srcId) src=TEMPLATES[i];
  if(!src){ warn(id, 'alias source '+srcId+' not found'); return; }
  function tk(s){ return typeof s==='string' ? s.replace(/\$(?=\d)/g,'Tk ').replace(/&minus;\$/g,'&minus;Tk ') : s; }
  add({
    id:id, topic:topic, n:o.n||src.n||24, trick:o.trick||src.trick,
    make:function(r,k,n){
      var it=src.make(r,k,n);
      if(!it || (it.type && it.type!=='mc')) return null;
      if(!it.correct || !it.wrong) return null;
      it.stem=tk(it.stem); it.fast=tk(it.fast);
      it.correct={t:tk(it.correct.t), why:tk(it.correct.why)};
      it.wrong=it.wrong.filter(Boolean).map(function(w){ return {t:tk(w.t), why:tk(w.why)}; });
      if(typeof it.b==='number' && o.db) it.b+=o.db;
      it.trick=o.trick||it.trick;
      return it;
    },
    verify:src.verify ? function(q){ return src.verify(q); } : undefined
  });
}

/* ---------- expanding everything into the bank ---------- */
var PARKED=[];
function materialize(){
  var made=0, i;
  PARKED.length=0;
  for(i=0;i<TEMPLATES.length;i++){
    var t=TEMPLATES[i], n=t.n||24, seen={}, got=0, tries=0, base=hash(t.id), miss=0, skew=0;
    /* a template for a topic this edition does not have is PARKED, not
       shipped: the spare families under js/gen/spare/ are kept to be
       adapted, and must never leak questions into the bank. */
    if(!ICE.topics[t.topic]){ PARKED.push(t.id); t._made=0; continue; }
    while(got<n && tries<n*25){
      var r=rng((base + Math.imul(tries+1, 2654435761))>>>0);
      tries++;
      var q;
      try{ q=build(t, r, got+skew); }catch(e){ warn(t.id, e.message); q=null; }
      /* a variant slot that keeps failing (an impossible tier or answer
         class) must not stall the whole template: move to the next slot */
      if(!q){ if(++miss>=12){ skew++; miss=0; } continue; }
      miss=0;
      /* everything that makes two variants different questions */
      var key=F.plain([q.stem, (q.sts||[]).join('~')].join('|'));
      if(seen[key]) continue;
      seen[key]=1;
      q.id=t.id+'.'+(got<10?'0':'')+got;
      ICE.Q.push(q);
      got++; made++;
    }
    t._made=got;
  }
  return made;
}
function warn(id, msg){ if(typeof console!=='undefined') console.warn('[gen '+id+'] '+msg); }

return {add:add, alias:alias, rng:rng, hash:hash, F:F, numOf:numOf, same:same,
        NAMES:NAMES, SHOPS:SHOPS, materialize:materialize, assembleMC:assembleMC,
        build:build, TEMPLATES:TEMPLATES, parked:function(){ return PARKED.slice(); }};
})();

/* ===========================================================
   ICE.finalize — runs once, before the ability index is built.

   There is only one thing left to expand: every generator template
   into its variants. Authored questions arrive complete, because a
   board MCQ is four options and there is nothing to patch on.
   =========================================================== */
ICE.finalize = function(){
  if(ICE._finalized) return ICE._stats;
  ICE._finalized=true;
  ICE._stats={ generated: GEN.materialize(), parked: GEN.parked().length };
  return ICE._stats;
};
