/* ===========================================================
   LEARN — the study sheet in front of every chapter's drill.

   A chapter page has two halves: Learn, then Drill. Learn is built
   from the chapter itself, so it can never drift from the questions:
   every question carries a one-line "fast route" (the thing to
   remember) and a page tag, and its sub-topic tag says where in the
   chapter it belongs. Grouped by sub-topic and put in the book's page
   order, those lines are a compact revision sheet; each group also
   shows one worked example — a real question with its answer and the
   reason — because an example teaches faster than a rule on its own.

   A group is marked learnt by the student ("Got it"). That is a
   promise to themselves, not a test; the test is the Drill.
   =========================================================== */
var LEARN = (function(){

var cache={}, ver=0;
var PER_POINT=0.5;          /* minutes to read one key point properly */

function pageOf(q){
  var tags=q.tags||[];
  for(var i=0;i<tags.length;i++){ var m=/^p(\d+)$/.exec(tags[i]); if(m) return +m[1]; }
  return 9999;
}
function subOf(q){
  var tags=q.tags||[];
  for(var i=0;i<tags.length;i++) if(!/^p\d+$/.test(tags[i])) return tags[i];
  return '';
}

/* A chapter's questions carry fine sub-topic tags ("binary to decimal",
   "decimal to binary" ...). Neighbouring small ones are joined, in page
   order, so a chapter reads as about nine sections rather than forty. */
function merge(list){
  var total=0; list.forEach(function(g){ if(!g.cards) total+=g.points.length; });
  var target=Math.max(5, Math.round(total/9));
  var out=[], cur=null;
  list.forEach(function(g){
    if(g.cards){ out.push(g); return; }
    if(cur && cur.points.length<target){
      cur.titles.push(g.title); cur.points=cur.points.concat(g.points); cur.qs=cur.qs.concat(g.qs);
      cur.key+='+'+g.key; cur.page=Math.min(cur.page, g.page);
    } else {
      if(cur) out.push(cur);
      cur={key:g.key, titles:[g.title], page:g.page, points:g.points.slice(), qs:g.qs.slice(), seen:{}};
    }
  });
  if(cur){
    /* a short tail joins the section before it */
    var prev=out[out.length-1];
    if(prev && !prev.cards && cur.points.length<Math.ceil(target/2)){
      prev.titles=prev.titles.concat(cur.titles); prev.points=prev.points.concat(cur.points); prev.qs=prev.qs.concat(cur.qs); prev.key+='+'+cur.key;
    } else out.push(cur);
  }
  out.forEach(function(g){
    if(g.cards) return;
    g.title=g.titles.slice(0,3).join(' · ')+(g.titles.length>3?' …':'');
  });
  return out;
}

/* [{key, title, page, points:[{text, q}], example:q}] in book order */
function groups(topicId){
  if(cache[topicId]) return cache[topicId];
  var qs=AB.inTopic(topicId).filter(function(q){ return !q._gen; });
  var by={}, list=[];
  qs.forEach(function(q){
    var key=subOf(q)||'—';
    var g=by[key];
    if(!g){ g=by[key]={key:key, title:key, page:pageOf(q), points:[], seen:{}, qs:[]}; list.push(g); }
    g.page=Math.min(g.page, pageOf(q));
    g.qs.push(q);
    if(q.fast && !g.seen[q.fast]){ g.seen[q.fast]=1; g.points.push({text:q.fast, q:q, page:pageOf(q)}); }
  });
  /* the chapter's formula and memory cards, when it has any, come first */
  var tricks=AB.tricksFor(topicId);
  if(tricks.length){
    list.unshift({key:'__cards', title:null, page:0, cards:true, seen:{}, qs:[],
      points:tricks.map(function(tk){ return {text:'<b>'+U.h(tk.name)+'</b> — '+tk.one, q:null, page:0}; })});
  }
  list.sort(function(a,b){ return a.page-b.page; });
  list=list.filter(function(g){ return g.points.length; });
  list=merge(list);
  list.forEach(function(g){
    g.points.sort(function(a,b){ return a.page-b.page; });
    /* the example: a simple question from the middle of the difficulty range */
    var mc=g.qs.filter(function(q){ return q.type==='mc' && !q.passage; });
    mc.sort(function(a,b){ return Math.abs(a.b||0)-Math.abs(b.b||0); });
    g.example=mc[0]||g.qs[0]||null;
    delete g.seen;
  });
  cache[topicId]=list;
  return list;
}

function marks(topicId){
  var s=DB.state();
  return (s.learn && s.learn[topicId]) || {};
}
function isLearnt(topicId, key){ return !!marks(topicId)[key]; }
function mark(topicId, key, on){
  var s=DB.state();
  if(!s.learn) s.learn={};
  var m=s.learn[topicId]||(s.learn[topicId]={});
  if(on===false) delete m[key]; else m[key]=Date.now();
  ver++;
  DB.save();
}

/* how much of the sheet is behind you */
function progress(topicId){
  var gs=groups(topicId), m=marks(topicId), out={groups:gs.length, learnt:0, points:0, pointsLeft:0};
  gs.forEach(function(g){
    out.points+=g.points.length;
    if(m[g.key]) out.learnt++; else out.pointsLeft+=g.points.length;
  });
  return out;
}
function minutesLeft(topicId){ return progress(topicId).pointsLeft*PER_POINT; }
function version(){ return ver; }

return {groups:groups, progress:progress, minutesLeft:minutesLeft, isLearnt:isLearnt, mark:mark,
        version:version, PER_POINT:PER_POINT};
})();
