/* ===========================================================
   PREDICT — a number built to be beaten.

   Most practice apps flatter you. The mark they print is the middle
   of their guess, so half the time the real paper comes in below it,
   and the one day it matters you are short.

   This one prints the LOW end: the tenth percentile, as a mark out of
   the MCQ half. It starts from the ability your answers imply, then
   charges you for every reason that estimate might be optimistic:
   how little evidence there is, how much of the syllabus you have
   never been asked about, whether your pace would actually reach the
   last question, and a flat charge for the exam hall itself. Sit the
   real paper and you should come in above it about nine times in ten.

   It is always cautious; there is no setting for that. HSC MCQ carry
   no negative marking, so a wrong answer costs nothing, but a question
   you never reach scores zero. That is why pace is charged heavily.
   =========================================================== */
var PREDICT = (function(){

var Z = 1.28;            /* the tenth percentile of the estimate's own error */
var NEED = 120;          /* answers in a paper before the volume charge ends */
var READY = 20;          /* answers in a paper before its figure counts      */

/* the charges, all in standard deviations of ability */
function charge(secKey){
  var st=AB.sectionTheta(secKey), allowed=ICE.pace(secKey), total=0;
  function add(amount){ total+=Math.max(0, amount); }

  add(Z*st.se);                                   /* the estimate's own error bar */
  add((1-st.cov)*0.40);                           /* chapters never asked about   */

  var since=Date.now()-45*864e5;
  var rows=DB.logFor(function(r){ return r.s===secKey && r.t>=since && r.tm; });
  if(rows.length>=8){
    var med=U.median(rows.map(function(r){ return r.sec; }));
    if(med>allowed) add(Math.min(0.65, (med/allowed-1)*0.85));   /* too slow to reach the end */
  } else add(0.22);                               /* too few answers to judge speed */

  if(st.n<NEED) add((1-st.n/NEED)*0.42);          /* sheer volume */
  add(0.18);                                      /* the exam hall */
  return {st:st, total:total, allowed:allowed};
}

/* one paper: how often you are right, and how many of the n you reach */
function paper(secKey){
  var c=charge(secKey), sec=ICE.sections[secKey];
  var th=c.st.th-c.total;

  /* the difficulty of a real paper for this subject, from the bank */
  var pool=AB.inSection(secKey), bs=pool.map(AB.itemB);
  var bAvg = bs.length ? U.median(bs) : 0.1;
  var p = AB.pCorrect(th, bAvg, AB.SLOPE);

  var reach=0.88, med=AB.medianPace({sec:secKey}, 45);
  if(med){
    reach=U.clamp(sec.n*c.allowed/(med*sec.n), 0.35, 1);
    if(reach>0.995) reach=1;
  }
  var marks=Math.max(0, sec.n*reach*p);      /* one mark each, nothing off for a miss */
  return {key:secKey, n:sec.n, marks:marks, answers:c.st.n, ready:c.st.n>=READY};
}

/* the whole MCQ half */
function all(){
  var papers=ICE.sectionsOf('hsc').map(function(s){ return paper('hsc/'+s.id); });
  var marks=0, n=0, answers=0, i;
  for(i=0;i<papers.length;i++){ marks+=papers[i].marks; n+=papers[i].n; answers+=papers[i].answers; }
  var target=(typeof CONFIG!=='undefined' && CONFIG.mcqTarget) || 88;
  return {
    papers:papers, marks:Math.round(marks), outOf:n, pct:n?marks/n:0,
    ready:answers>=READY,                       /* enough answers to show a figure at all */
    target:target, gap:Math.round(target - 100*(n?marks/n:0))
  };
}

return {paper:paper, all:all};
})();
