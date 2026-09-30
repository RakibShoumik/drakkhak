/* ===========================================================
   BOOT — load the record, wire the few things that live outside
   the screens, and open on the right place.
   =========================================================== */
(function(){

  DB.load();
  var s=DB.state();

  /* the owner's blueprint (config.js) sets every paper's MCQ count and the
     seconds a question gets, before AB.build() puts the clock on every
     question */
  if(typeof CONFIG!=='undefined' && CONFIG.blueprint){
    for(var sk in CONFIG.blueprint){
      if(!ICE.sections[sk]) continue;
      for(var f in CONFIG.blueprint[sk]) ICE.sections[sk][f]=CONFIG.blueprint[sk][f];
    }
  }

  AB.build();                 /* expands generators and indexes every question */
  FX.setMuted(!s.sound);
  document.documentElement.classList.toggle('calm', !!s.settings.calm);
  UI.applyTheme();
  I18N.apply();
  /* a record carried over from an older version: badges already earned by
     work on record are granted quietly, with no toast */
  STATS.check();
  PLAN.invalidate();

  UI.init();

  /* keys that work everywhere */
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape' && UI.sheetOpen()){ e.preventDefault(); UI.closeSheet(); return; }
    var t=e.target;
    if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable)) return;
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    if(RUN.active() && 'abcd1234se '.indexOf(String(e.key).toLowerCase())>=0) return;
    switch(e.key){
      case 'n': case 'N': UI.flip('night'); break;
      case 'm': case 'M': UI.flip('sound'); break;
      case '?': UI.shortcuts(); break;
    }
  });

  /* open on the right place: a first visit gets the one-screen welcome */
  var start=UI.readHash();
  var first = s.onboarded && start && start.r!=='run' && start.r!=='welcome' ? start.r : (s.onboarded?'start':'welcome');
  UI.go(first, first===(start&&start.r)?start.p:null);

  if(!ICE.Q.length) UI.toast(L('No question bank loaded: check the script tags in index.html.','কোনো প্রশ্নের ব্যাংক লোড হয়নি: index.html-এর স্ক্রিপ্ট ট্যাগ দেখে নাও।'), 6000);

  if('serviceWorker' in navigator && location.protocol.indexOf('http')===0){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  }
})();
