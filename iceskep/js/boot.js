/* ===========================================================
   BOOT — load the record, wire the few things that live outside
   the screens, and open on the right place.
   =========================================================== */
(function(){

  DB.load();

  /* a blueprint edited in Settings overrides the shipped one, and has to
     be applied before AB.build() puts the clock on every question */
  var s=DB.state();
  if(s.blueprint){
    for(var sk in s.blueprint){
      if(!ICE.sections[sk]) continue;
      for(var f in s.blueprint[sk]) ICE.sections[sk][f]=s.blueprint[sk][f];
    }
  }

  AB.build();                 /* expands generators, patches and idioms first */
  FX.setMuted(!s.sound);
  FX.setPack(s.game.wear.pack);
  s.game.breakShown=0;        /* break prompts are per sitting, not for ever */
  UI.applyTheme();
  document.documentElement.setAttribute('lang', s.settings.lang==='bn'?'bn':'en');
  QUEST.armReminder();
  PLAN.stamp();               /* where today's days-left count starts from */
  if(s.onboarded) UI.noteComeback();

  /* ---------- the three switches in the header ---------- */
  function flip(k){ UI.flip(k); }
  document.getElementById('soundBtn').onclick=function(){ flip('sound'); };
  document.getElementById('timerBtn').onclick=function(){
    flip('timer');
    UI.toast(DB.state().timer
      ? L('Timer on. Every answer is measured at the paper\'s own pace.','টাইমার চালু। প্রতিটি উত্তর প্রশ্নপত্রের বাঁধা গতিতে মাপা হবে।')
      : L('Timer off. Answers are recorded as untimed from now on, and the prediction charges for it.','টাইমার বন্ধ। এখন থেকে উত্তর সময়-ছাড়া হিসেবে জমা হবে, আর পূর্বাভাসে তার দাম কাটা যাবে।'));
  };
  document.getElementById('nightBtn').onclick=function(){ flip('night'); };
  document.getElementById('brand').onclick=function(){ UI.go('today'); };
  document.getElementById('brandPhone').onclick=function(){ UI.go('today'); };
  document.getElementById('clock').onclick=function(){ UI.go('stats'); };
  document.getElementById('clock').style.cursor='pointer';

  /* ---------- the live clock in the header, once a second ---------- */
  CLOCK.onTick(function(info){
    var c=document.getElementById('clock'); if(!c) return;
    c.classList.toggle('idle', !info.active);
    var b=c.querySelector('b'); if(b) b.textContent=U.mins(info.today);
  });
  CLOCK.start();
  CLOCK.focus({track:s.track});

  /* ---------- keys that work everywhere ---------- */
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape' && UI.sheetOpen()){ e.preventDefault(); UI.closeSheet(); return; }
    var t=e.target;
    if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable)) return;
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    if(RUN.active() && 'abcd1234se '.indexOf(String(e.key).toLowerCase())>=0) return;
    switch(e.key){
      case 'n': case 'N': flip('night'); break;
      case 't': case 'T': if(RUN.active()) RUN.toggleTimer(); else document.getElementById('timerBtn').click(); break;
      case 'm': case 'M': flip('sound'); break;
      case 'r': case 'R': if(!RUN.active()) UI.go('record'); break;
      case '?': UI.shortcuts(); break;
    }
  });

  /* ---------- open on the right place ---------- */
  var start=UI.readHash();
  UI.go(start && start.r!=='run' && start.r!=='welcome' ? start.r : 'today', start?start.p:null);

  if(!ICE.Q.length) UI.toast(L('No question bank loaded &mdash; check the script tags in index.html.','কোনো প্রশ্নের ব্যাংক লোড হয়নি &mdash; index.html-এর স্ক্রিপ্ট ট্যাগ দেখে নিন।'), 6000);

  if('serviceWorker' in navigator && location.protocol.indexOf('http')===0){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  }
})();
