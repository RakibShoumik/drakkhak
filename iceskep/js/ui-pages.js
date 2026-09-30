/* ===========================================================
   PAGES — Start, the first visit, Practice, Progress, Settings
   and the Wallet. The map is in map.js, the question screen in
   runner.js, the research page in research.js.

   Every page answers "what do I do next?" at a glance, and every
   string is written L('English','বাংলা').
   =========================================================== */
var PAGES = (function(){

function h(s){ return U.h(s); }
var UIact=function(name, fn){ UI.act(name, fn); };

/* ---------- the honesty note ---------- */
function honesty(closable){
  return '<aside class="honesty" role="note"><p><b>'+L('Caution:','সতর্কতা:')+'</b> '+
    L('This website builds exam intuition, not knowledge. It can help you score higher in the exam, but it cannot give you real understanding of a subject. There is no substitute for the NCTB textbooks.',
      'এই ওয়েবসাইট পরীক্ষার ইনটুইশন তৈরি করে, জ্ঞান নয়। এটি পরীক্ষায় নম্বর বাড়াতে সাহায্য করতে পারে, কিন্তু কোনো বিষয়ে প্রকৃত জ্ঞান দিতে পারে না। NCTB পাঠ্যবইয়ের কোনো বিকল্প নেই।')+'</p>'+
    (closable?'<button type="button" class="x" data-act="closeNote" aria-label="'+L('Close','বন্ধ করো')+'">&times;</button>':'')+'</aside>';
}
function tagline(){ return L('Board-level MCQ practice from the NCTB books','NCTB বই থেকে বোর্ড-মানের MCQ অনুশীলন'); }

/* ============================================================
   START — the number, the button, the mistake bank
   ============================================================ */
function start(){
  var all=PLAN.total(), left=PLAN.left(), p=all.total?all.cleared/all.total:0;
  var bank=AB.mistakes().length;
  var o='<div class="page start">';

  /* 1. the central number */
  o+='<section class="hero"><div class="hero-num">'+U.num(left)+'</div>'+
     '<div class="hero-lbl">'+L('questions left · of '+U.num(all.total), 'প্রশ্ন বাকি · '+U.num(all.total)+'-এর মধ্যে')+'</div>'+
     CHARTS.bar(p,'thick')+'</section>';

  /* 2. one big button */
  o+= left>0
    ? '<button type="button" class="btn big go" data-act="continue">'+L('Continue · '+PLAN.SET_N+' questions','চালিয়ে যাও · '+N(PLAN.SET_N)+'টি প্রশ্ন')+'</button>'
    : '<p class="alldone">'+L('Every question is done. Well done!','সব প্রশ্ন শেষ। সাবাস!')+'</p>';

  /* 3. the mistake bank */
  o+='<section class="card bankcard'+(bank?' has':'')+'"><div><div class="bank-t">'+L('Mistake bank','ভুলের খাতা')+' &middot; <b>'+
     L(bank+' waiting', N(bank)+' টি অপেক্ষায়')+'</b></div>'+
     '<div class="bank-s">'+(bank?L('Win back the questions you missed.','যে প্রশ্নগুলো ভুল করেছ, সেগুলো জিতে নাও।')
                               :L('Nothing here yet. A miss lands here.','এখনও কিছু নেই। ভুল করলে এখানে জমবে।'))+'</div></div>'+
     '<button type="button" class="btn'+(bank?'':' ghost')+'" data-act="bankGo"'+(bank?'':' disabled')+'>'+L('Win them back','ফিরিয়ে আনো')+'</button></section>';

  /* 4. one quiet line */
  o+='<p class="quiet">'+paceLine()+'</p>';

  /* 5. the honesty note, until it is closed */
  if(!DB.state().noteClosed) o+=honesty(true);
  return o+'</div>';
}
/* the exam countdown, and whether studying at the chosen hours is enough */
function paceLine(){
  var pl=PLAN.paceLine(), hrs=DB.state().settings.dailyMin/60;
  var hrTxt=L(hrs+' hr', N(hrs)+' ঘণ্টা');
  if(pl.done) return L('Nothing left to finish.','শেষ করার মতো আর কিছু বাকি নেই।');
  var at=L('At '+hrTxt+' a day it finishes in '+pl.need+' days', 'দিনে '+hrTxt+' পড়লে শেষ হবে '+N(pl.need)+' দিনে');
  if(pl.toExam===null || pl.toExam<=0) return at+L('.','।');
  var head=L(pl.toExam+' days to the exam · ', 'পরীক্ষার আর '+N(pl.toExam)+' দিন · ');
  return head+at+(pl.enough ? L(' — enough.',' — যথেষ্ট।')
                            : L(' — not enough: read more each day.',' — যথেষ্ট নয়: রোজ আরও পড়ো।'));
}

/* ============================================================
   THE FIRST VISIT — one screen, one button
   ============================================================ */
function welcome(){
  return '<div class="page welcome">'+CHARTS.logo('bubbles','hero-logo')+
    '<h1>Drakkhak</h1><p class="tagline">'+tagline()+'</p>'+honesty(false)+
    '<button type="button" class="btn big" data-act="begin">'+L('Begin','শুরু করো')+'</button>'+
    '<button type="button" class="linkbtn" data-act="restoreOpen">'+L('I have used this before','আগে ব্যবহার করেছি')+'</button></div>';
}

/* ============================================================
   PRACTICE — pick the scope, then a mode, then a paper
   ============================================================ */
function practice(){
  var sc=MODES.scope(), cnt=MODES.counts(sc), ok=cnt.written>0;
  var o='<div class="page practice"><h1>'+L('Practice','অনুশীলন')+'</h1>';

  /* the scope first */
  o+='<div class="label">'+L('What to practise','কী নিয়ে অনুশীলন')+'</div><div class="seg" role="group">'+
    [['all',L('All subjects mixed','সব বিষয় মিশিয়ে')],['subject',L('One subject','একটি বিষয়')],['chapter',L('One chapter','একটি অধ্যায়')]].map(function(k){
      return '<button type="button" class="'+(sc.kind===k[0]?'on':'')+'" data-act="scopeKind" data-arg="'+k[0]+'">'+k[1]+'</button>';
    }).join('')+'</div>';
  if(sc.kind==='subject' || sc.kind==='chapter'){
    o+='<div class="chips">'+ICE.subjects.map(function(sj){
      return '<button type="button" class="chip'+(sc.sj===sj.id?' on':'')+'" data-act="scopeSj" data-arg="'+sj.id+'" style="--sc:var(--s-'+sj.id+')"><i></i>'+h(ICE.subjname(sj))+'</button>';
    }).join('')+'</div>';
  }
  if(sc.kind==='chapter') o+=chapterSelect(sc);

  /* the ordinary set */
  o+='<button type="button" class="btn big go" data-act="mode" data-arg="set"'+(ok?'':' disabled')+'>'+
     L('Start · '+PLAN.SET_N+' questions','শুরু করো · '+N(PLAN.SET_N)+'টি প্রশ্ন')+'</button>'+
     '<p class="scopenote">'+(ok?h(MODES.scopeLabel(sc)):L('No questions here yet. They are being written.','এখানে এখনও প্রশ্ন নেই। লেখা চলছে।'))+'</p>';

  /* four modes */
  o+='<div class="modes">'+
    mode('mistakes', L('Mistakes again','ভুলগুলো আবার'),
      cnt.mistakes ? L(cnt.mistakes+' in the bank','খাতায় '+N(cnt.mistakes)+'টি') : L('None here','এখানে কিছু নেই'), cnt.mistakes>0)+
    mode('weak', L('Weak chapters','দুর্বল অধ্যায়'), L('The lowest-scoring chapters first','সবচেয়ে কম নম্বরের অধ্যায় আগে'), cnt.weak)+
    mode('exam', L('Full paper','পুরো পরীক্ষা'), L('One paper, board time, checked at the end','একটি পত্র, বোর্ডের সময়, শেষে দেখা হবে'), ok)+
    mode('blitz', L('60-second challenge','৬০ সেকেন্ড চ্যালেঞ্জ'), L('As many as you can in a minute','এক মিনিটে যত পারো'), ok)+
    '</div>';

  /* the papers, with their scores */
  o+='<div class="label" style="margin-top:28px">'+L('Papers','পত্র')+'</div><div class="papers">';
  MODES.papersIn(sc).forEach(function(sk){
    var sec=ICE.sections[sk], has=AB.inSection(sk).length>0, sco=AB.score({sec:sk}).score;
    o+='<button type="button" class="paper" data-act="paper" data-arg="'+sk+'"'+(has?'':' disabled')+' style="--sc:var(--s-'+sec.subj+')">'+
      '<span class="pn">'+h(ICE.sname(sk))+'</span>'+
      (has ? scoreBar(sco)+'<span class="ps">'+N(sco)+'</span>' : '<span class="psoon">'+L('soon','শিগগির')+'</span>')+'</button>';
  });
  return o+'</div></div>';
}
function mode(id, title, sub, on){
  return '<button type="button" class="mode" data-act="mode" data-arg="'+id+'"'+(on?'':' disabled')+'><b>'+title+'</b><span>'+sub+'</span></button>';
}
/* a 0–100 score bar with the pass and goal lines from config.js */
function scoreBar(v){
  var pass=(typeof CONFIG!=='undefined'&&CONFIG.passLine)||70, goal=(typeof CONFIG!=='undefined'&&CONFIG.goalLine)||85;
  return '<span class="bar scorebar">'+
    '<i style="width:'+Math.max(v>0?2:0, v)+'%"></i>'+
    '<u class="mk" style="left:'+pass+'%" title="'+L('pass','পাস')+'"></u><u class="mk g" style="left:'+goal+'%" title="'+L('goal','লক্ষ্য')+'"></u></span>';
}
function chapterSelect(sc){
  var sj=ICE.subject(sc.sj), o='<select class="sel" data-change="scopeCh" aria-label="'+L('Chapter','অধ্যায়')+'">';
  (sj?sj.secs:[]).forEach(function(sk){
    o+='<optgroup label="'+h(ICE.sname(sk))+'">';
    ICE.topicsOf(sk).forEach(function(tp){
      var has=AB.inTopic(tp.id).length>0;
      o+='<option value="'+tp.id+'"'+(sc.ch===tp.id?' selected':'')+(has?'':' disabled')+'>'+N(tp.n)+'. '+h(ICE.tname(tp))+(has?'':L(' (soon)',' (শিগগির)'))+'</option>';
    });
    o+='</optgroup>';
  });
  return o+'</select>';
}
function firstWritten(sjId){
  var sj=ICE.subject(sjId); if(!sj) return '';
  for(var i=0;i<sj.secs.length;i++){
    var tops=ICE.topicsOf(sj.secs[i]);
    for(var j=0;j<tops.length;j++) if(AB.inTopic(tops[j].id).length) return tops[j].id;
  }
  return '';
}

UIact('scopeKind', function(k){
  var sc=MODES.scope(), sj=sc.sj||'bangla';
  if(k==='all') MODES.setScope({kind:'all', sj:'', ch:''});
  else if(k==='subject') MODES.setScope({kind:'subject', sj:sj, ch:''});
  else MODES.setScope({kind:'chapter', sj:sj, ch:firstWritten(sj)});
  UI.render();
});
UIact('scopeSj', function(id){
  var sc=MODES.scope();
  MODES.setScope({kind:sc.kind, sj:id, ch:sc.kind==='chapter'?firstWritten(id):''});
  UI.render();
});
UIact('scopeCh', function(id){
  var sc=MODES.scope();
  MODES.setScope({kind:'chapter', sj:sc.sj, ch:id});
  UI.render();
});
UIact('mode', function(id){
  var sc=MODES.scope();
  if(id==='exam') return pickPaper(sc);
  MODES.start(id, {scope:sc});
});
UIact('paper', function(sk){
  MODES.start('set', {scope:{kind:'paper', sec:sk}});
});
UIact('continue', function(){ MODES.start('continue'); });
UIact('bankGo', function(){ MODES.start('mistakes', {scope:{kind:'all', sj:'', ch:''}, back:'start'}); });
UIact('closeNote', function(){ DB.state().noteClosed=true; DB.save(); UI.render(); });
UIact('startExam', function(sk){ UI.closeSheet(true); MODES.start('exam', {sec:sk}); });

/* a full paper needs a paper: one scope paper goes straight in, else ask */
function pickPaper(sc){
  var keys=MODES.papersIn(sc).filter(function(sk){ return AB.inSection(sk).length>0; });
  if(!keys.length) return UI.toast(L('No questions here yet.','এখানে এখনও প্রশ্ন নেই।'));
  if(keys.length===1) return MODES.start('exam', {sec:keys[0]});
  UI.sheet('<h2>'+L('Which paper?','কোন পত্র?')+'</h2><p class="small">'+L('Board time, nothing marked until the end.','বোর্ডের সময়, শেষের আগে কিছু দেখানো হবে না।')+'</p><div class="pick">'+
    keys.map(function(sk){
      var sec=ICE.sections[sk], n=Math.min(sec.n, AB.inSection(sk).length);
      return '<button type="button" class="paper" data-act="startExam" data-arg="'+sk+'" style="--sc:var(--s-'+sec.subj+')"><span class="pn">'+h(ICE.sname(sk))+'</span>'+
        '<span class="pm">'+L(n+' questions · '+Math.round(n*ICE.pace(sk)/60)+' min', N(n)+'টি প্রশ্ন · '+N(Math.round(n*ICE.pace(sk)/60))+' মিনিট')+'</span></button>';
    }).join('')+'</div>');
}

/* ============================================================
   PROGRESS — done, score, the cautious mark, subjects, badges
   ============================================================ */
function progress(){
  var all=PLAN.total(), p=all.total?all.cleared/all.total:0, sco=AB.score({});
  var o='<div class="page progress"><h1>'+L('Progress','অগ্রগতি')+'</h1>';

  o+='<div class="grid2">'+
    '<div class="card stat"><div class="label">'+L('Done','শেষ হয়েছে')+'</div><div class="v">'+N(Math.floor(p*100))+'<small>%</small></div>'+CHARTS.bar(p,'')+'</div>'+
    '<div class="card stat"><div class="label">'+L('Score','স্কোর')+'</div><div class="v">'+N(sco.score)+'<small>/'+N(100)+'</small></div>'+scoreBar(sco.score)+
      '<div class="s">'+L('pass '+((CONFIG&&CONFIG.passLine)||70)+' · goal '+((CONFIG&&CONFIG.goalLine)||85),'পাস '+N((CONFIG&&CONFIG.passLine)||70)+' · লক্ষ্য '+N((CONFIG&&CONFIG.goalLine)||85))+'</div></div></div>';

  /* the prediction: always the cautious one */
  var P=PREDICT.all();
  o+='<section class="card pred"><div class="label">'+L('The cautious mark to beat','যে নম্বরটি ছাড়িয়ে যেতে হবে')+'</div>';
  if(P.ready){
    var need=Math.max(0, Math.round(P.gap/100*P.outOf));
    o+='<div class="v">'+N(P.marks)+'<small> / '+N(P.outOf)+'</small></div>'+
       '<p class="small">'+L('You should beat this mark 9 times in 10. It is cautious on purpose.','১০ বারের ৯ বারই তুমি এর বেশি পাবে। ইচ্ছে করেই সাবধানী।')+'</p>'+
       '<p class="small">'+(P.gap>0 ? L('Target '+P.target+'%: about '+need+' more marks.','লক্ষ্য '+N(P.target)+'%: আরও প্রায় '+N(need)+' নম্বর দরকার।')
                                     : L('You are on the target of '+P.target+'%.','তুমি '+N(P.target)+'% লক্ষ্যে পৌঁছে গেছ।'))+'</p>';
  } else {
    o+='<div class="v dash">&mdash;</div><p class="small">'+L('Answer at least 20 questions and it appears.','অন্তত ২০টি প্রশ্নের উত্তর দিলে এটি দেখা যাবে।')+'</p>';
  }
  o+='</section>';

  /* one bar per subject */
  o+='<div class="label" style="margin-top:26px">'+L('Subjects','বিষয়')+'</div><div class="sjbars">'+ICE.subjects.map(function(sj){
    var x=PLAN.subject(sj.id), q=PLAN.pct(x);
    return '<div class="sjbar" style="--sc:var(--s-'+sj.id+')"><span class="n">'+h(ICE.subjname(sj))+'</span>'+CHARTS.bar(q,'sc')+'<span class="pc">'+N(Math.floor(q*100))+'%</span></div>';
  }).join('')+'</div>';

  /* the badges */
  var have=DB.state().badges;
  o+='<div class="label" style="margin-top:26px">'+L('Badges','ব্যাজ')+' &middot; '+N(STATS.count())+'/'+N(STATS.BADGES.length)+'</div><div class="badges">'+
    STATS.BADGES.map(function(b){
      var on=!!have[b.id];
      return '<div class="badge'+(on?' on':'')+'">'+CHARTS.medal(b,on)+'<b>'+h(STATS.bname(b))+'</b><span>'+h(STATS.bnote(b))+'</span></div>';
    }).join('')+'</div>';
  return o+'</div>';
}

/* ============================================================
   SETTINGS — the few things a student may change
   ============================================================ */
function settings(){
  var s=DB.state(), st=s.settings;
  function row(title, ctl, sub){
    return '<div class="srow"><div class="st"><b>'+title+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</div><div class="sc">'+ctl+'</div></div>';
  }
  function sw(key, on, label){
    return '<button type="button" class="sw'+(on?' on':'')+'" role="switch" aria-checked="'+(on?'true':'false')+'" aria-label="'+label+'" data-act="flip" data-arg="'+key+'"><i></i></button>';
  }
  var o='<div class="page settings"><h1>'+L('Settings','সেটিংস')+'</h1>';

  o+=row(L('Study time a day','দিনে পড়ার সময়'),
    '<div class="seg">'+DB.HOURS.map(function(m){
      return '<button type="button" class="'+(st.dailyMin===m?'on':'')+'" data-act="hours" data-arg="'+m+'">'+L(m/60+' hr', N(m/60)+' ঘণ্টা')+'</button>';
    }).join('')+'</div>');
  o+=row(L('Language','ভাষা'),
    '<div class="seg"><button type="button" class="'+(st.lang==='bn'?'on':'')+'" data-act="lang" data-arg="bn">বাংলা</button>'+
    '<button type="button" class="'+(st.lang==='en'?'on':'')+'" data-act="lang" data-arg="en">English</button></div>',
    L('Questions stay in the language of the book.','প্রশ্ন বইয়ের ভাষাতেই থাকে।'));
  o+=row(L('Sound','শব্দ'), sw('sound', s.sound, L('Sound','শব্দ')));
  o+=row(L('Night mode','রাতের মোড'), sw('night', s.theme==='night', L('Night mode','রাতের মোড')));
  o+=row(L('Calm mode','শান্ত মোড'), sw('calm', st.calm, L('Calm mode','শান্ত মোড')), L('No animations, no vibration.','কোনো অ্যানিমেশন নেই, কম্পন নেই।'));
  o+=row(L('Logo','লোগো'),
    '<div class="logos">'+['bubbles','cards'].map(function(k){
      return '<button type="button" class="logopick'+(s.logo===k?' on':'')+'" data-act="logo" data-arg="'+k+'" aria-label="'+(k==='bubbles'?L('Bubbles','বুদবুদ'):L('Cards','কার্ড'))+'">'+CHARTS.logo(k,'pic')+'</button>';
    }).join('')+'</div>');

  o+='<div class="label" style="margin-top:26px">'+L('Your data','তোমার তথ্য')+'</div><div class="data">'+
    '<button type="button" class="btn ghost" data-act="exportData">'+L('Export','এক্সপোর্ট')+'</button>'+
    '<button type="button" class="btn ghost" data-act="restoreOpen">'+L('Restore','রিস্টোর')+'</button>'+
    '<button type="button" class="btn ghost danger" data-act="eraseOpen">'+L('Erase','মুছে ফেলো')+'</button></div>'+
    '<p class="small">'+L('Everything is saved on this phone only. Export a copy now and then.','সবকিছু শুধু এই ফোনে সংরক্ষিত। মাঝে মাঝে একটি কপি এক্সপোর্ট করে রাখো।')+'</p>';

  o+='<p class="small desk-only" style="margin-top:18px">'+L('Keyboard shortcuts: press ','কীবোর্ড শর্টকাট: চাপো ')+'<kbd>?</kbd></p>';
  o+='<p class="foot"><a href="#/research" data-go="research">'+L('How Drakkhak works','Drakkhak কীভাবে কাজ করে')+'</a></p>';
  return o+'</div>';
}

UIact('hours', function(m){ DB.state().settings.dailyMin=+m; DB.save(); PLAN.invalidate(); UI.render(); });
UIact('lang', function(l){ I18N.setLang(l); I18N.apply(); UI.rebuild(); UI.render(); });
UIact('flip', function(k){ UI.flip(k); });
UIact('logo', function(k){ DB.state().logo=k; DB.save(); UI.rebuild(); UI.render(); });
UIact('exportData', function(){ SHARE.exportFile(); UI.toast(L('Saved a copy to your downloads.','একটি কপি ডাউনলোডে সংরক্ষিত হলো।')); });
UIact('restoreOpen', function(){
  UI.sheet('<h2>'+L('Restore','রিস্টোর')+'</h2><p class="small">'+L('Choose the file you exported earlier.','আগে এক্সপোর্ট করা ফাইলটি বেছে নাও।')+'</p>'+
    '<input type="file" accept=".json,application/json" class="file" data-change="restoreFile" aria-label="'+L('Backup file','ব্যাকআপ ফাইল')+'">'+
    '<p class="small" id="restoreMsg" role="status"></p>');
});
UIact('restoreFile', function(v, el){
  var f=el.files && el.files[0]; if(!f) return;
  SHARE.restoreFile(f, function(err){
    var m=document.getElementById('restoreMsg');
    if(err){ if(m) m.textContent=L('That is not a Drakkhak backup.','এটি Drakkhak-এর ব্যাকআপ নয়।'); return; }
    var s=DB.state(); s.onboarded=true; DB.save();
    AB.touch(); PLAN.invalidate(); I18N.apply(); UI.applyTheme(); FX.setMuted(!s.sound);
    document.documentElement.classList.toggle('calm', !!s.settings.calm);
    UI.closeSheet(true); UI.rebuild(); UI.go('start');
    UI.toast(L('Restored.','ফিরিয়ে আনা হয়েছে।'));
  });
});
UIact('eraseOpen', function(){
  UI.sheet('<h2>'+L('Erase everything?','সব মুছে ফেলবে?')+'</h2><p class="small">'+L('Your answers, coins and badges on this phone are deleted. This cannot be undone.','এই ফোনে তোমার উত্তর, কয়েন আর ব্যাজ মুছে যাবে। আর ফেরানো যাবে না।')+'</p>'+
    '<div class="btns two"><button type="button" class="btn danger" data-act="eraseDo">'+L('Erase','মুছে ফেলো')+'</button>'+
    '<button type="button" class="btn ghost" data-act="closeSheet">'+L('Cancel','থাক')+'</button></div>');
});
UIact('eraseDo', function(){
  SHARE.erase(); AB.touch(); I18N.apply(); UI.applyTheme(); FX.setMuted(false);
  document.documentElement.classList.remove('calm');
  UI.closeSheet(true); UI.rebuild(); UI.go('welcome');
});
UIact('begin', function(){
  var s=DB.state(); s.onboarded=true; DB.save();
  MODES.start('continue');
});
UIact('walletOpen', function(){ wallet(); });

/* ============================================================
   WALLET — the balance, recent earnings, and the shop
   ============================================================ */
function wallet(){
  var o='<h2>'+L('Wallet','ওয়ালেট')+'</h2>'+
    '<div class="balance"><svg class="ci" viewBox="0 0 32 32"><use href="#coinSym"/></svg><b>'+U.num(GAME.coins())+'</b></div>'+
    '<p class="small">'+L('1 coin for each right answer, 2 more for winning back a mistake, 5 for finishing a set.','প্রতিটি ঠিক উত্তরে ১ কয়েন, ভুল ফিরিয়ে আনলে আরও ২, সেট শেষ করলে ৫।')+'</p>'+
    '<div class="label" style="margin-top:18px">'+L('Shop','দোকান')+'</div><div class="shop">'+
    GAME.POWER.map(function(p){
      var can=GAME.coins()>=p.cost;
      return '<div class="item"><div class="it"><b>'+h(GAME.pname(p))+'</b><span>'+h(L(p.noteEn,p.noteBn))+'</span><em>'+L('You have ','আছে ')+N(GAME.have(p.id))+'</em></div>'+
        '<button type="button" class="btn sm'+(can?'':' ghost')+'" data-act="buy" data-arg="'+p.id+'"'+(can?'':' disabled')+'><svg class="ci" viewBox="0 0 32 32"><use href="#coinSym"/></svg>'+N(p.cost)+'</button></div>';
    }).join('')+'</div>';
  var rec=GAME.recent(8);
  o+='<div class="label" style="margin-top:18px">'+L('Recent','সাম্প্রতিক')+'</div>';
  if(!rec.length) o+='<p class="small">'+L('Nothing earned yet. Answer a question.','এখনও কিছু জমেনি। একটি প্রশ্নের উত্তর দাও।')+'</p>';
  else o+='<ul class="recent">'+rec.map(function(e){
    if(e.k==='buy') return '<li><span>'+L('Bought ','কিনেছ ')+h(GAME.pname(GAME.power(e.p)))+'</span><b class="neg">'+N(e.n)+'</b></li>';
    return '<li><span>'+U.h(L('Set: '+e.right+' right'+(e.won?', '+e.won+' won back':'')+(e.set?', finished':''),
        'সেট: '+N(e.right)+' ঠিক'+(e.won?', '+N(e.won)+'টি ফিরিয়ে আনা':'')+(e.set?', শেষ করা':'')))+'</span><b>+'+N(e.n)+'</b></li>';
  }).join('')+'</ul>';
  UI.sheet(o);
}
UIact('buy', function(id){
  var r=GAME.buy(id);
  if(!r.ok){ UI.toast(L('Not enough coins yet.','কয়েন এখনও যথেষ্ট নয়।')); return; }
  FX.play('coin');
  UI.paintChrome();
  wallet();
});

return {start:start, welcome:welcome, practice:practice, progress:progress, settings:settings,
        wallet:wallet, honesty:honesty, tagline:tagline, afterPaint:function(){}};
})();
