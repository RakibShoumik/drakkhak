/* ===========================================================
   EDITION — HSC or SSC, chosen in Settings and remembered in
   localStorage 'iceskep.edition'. Runs after the data files and
   before the engine: it keeps only the chosen edition's content
   and, for SSC, swaps in the SSC papers, chapters and subjects.
   =========================================================== */
(function(){
  var ed=SITE.edition();
  ICE.edition=ed;
  function isS(id){ return /^ssc\./.test(String(id||'')); }
  function keep(list){ return list.filter(function(x){ return (ed==='ssc')===isS(x.topic); }); }
  ICE.Q=keep(ICE.Q); ICE.P=keep(ICE.P); ICE.T=keep(ICE.T);
  if(ed==='ssc' && ICE.SSC){
    ICE.sections=ICE.SSC.sections; ICE.topics=ICE.SSC.topics;
    ICE.subjects=ICE.SSC.subjects; ICE.path={hsc:ICE.SSC.path};
    ICE.meta.edition='SSC';
    ICE.tracks.hsc.name='এসএসসি'; ICE.tracks.hsc.mark='SSC';
    ICE.tracks.hsc.full='মাধ্যমিক স্কুল সার্টিফিকেট পরীক্ষা — বহুনির্বাচনি';
    document.title='Drakkhak SSC';
    var bs=document.querySelectorAll('.brand-sub'); for(var i=0;i<bs.length;i++) bs[i].textContent='SSC';
  }
  SITE.pruneSubjects(ICE);
  ICE.setEdition=function(e){
    try{ localStorage.setItem('iceskep.edition', e==='ssc'?'ssc':'hsc'); }catch(x){}
    location.reload();
  };
})();
