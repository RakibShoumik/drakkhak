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
   START — today first: the goal ring, the streak week, one big
   button; then today's five, the mistake bank, the subjects and
   the whole syllabus
   ============================================================ */
var DAYS_BN=['র','সো','ম','বু','বৃ','শু','শ'], DAYS_EN=['S','M','T','W','T','F','S'];
function greeting(){
  var h=new Date().getHours();
  return h<5 ? L('Up late','রাত জেগে পড়ছ') : h<12 ? L('Good morning','শুভ সকাল') : h<17 ? L('Good afternoon','শুভ দুপুর')
       : h<20 ? L('Good evening','শুভ সন্ধ্যা') : L('Good night','শুভ রাত্রি');
}
function flameSvg(cls){
  return '<svg class="'+(cls||'fl')+'" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.5 3c.4 3.2-1.3 4.6-2.8 6.3C8.3 10.8 7 12.4 7 14.8 7 18 9.2 21 12 21s5-2.3 5-5.4c0-2.5-1.3-4-2.3-5.2-.5 1.2-1.1 1.9-1.9 2.2.5-2.4.5-6.3-.3-9.6Z"/></svg>';
}
function shieldSvg(){
  return '<svg class="sh" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.4 3 8.2 7 10 4-1.8 7-5.6 7-10V6z"/></svg>';
}
function start(){
  var all=PLAN.total(), left=PLAN.left(), p=all.total?all.cleared/all.total:0;
  var s=DB.state(), bank=AB.mistakes().length, g=GAME.goal(), lv=GAME.level(), st=DB.liveStreak();
  var o='<div class="page start">';

  /* the greeting and the level */
  o+='<div class="greet"><div><span class="hello">'+greeting()+'</span>'+
     '<h1>'+(g.met?L('Goal met. One more?','লক্ষ্য পূরণ। আরেকটা?'):L('Ready for today?','আজ শুরু করবে?'))+'</h1></div>'+
     '<button type="button" class="lvchip" data-go="progress"><b>'+N(lv.lv)+'</b><span>'+U.h(lv.name)+'</span></button></div>';

  /* today: the goal ring, the streak and its week, the one big button */
  var wk=DB.week(7);
  o+='<section class="today'+(g.met?' met':'')+'">'+
     '<div class="today-top">'+
       CHARTS.ring(g.p, 104, 'goal', '<b>'+N(Math.min(g.done,g.target))+'</b><small>/ '+N(g.target)+'</small>')+
       '<div class="today-r">'+
         '<div class="streakline">'+flameSvg(st?'fl on':'fl')+'<b>'+N(st)+'</b><span>'+L(st===1?'day in a row':'days in a row','দিন টানা')+'</span>'+
           (s.shields?'<span class="shields" title="'+L('Streak shields','স্ট্রিক শিল্ড')+'">'+shieldSvg()+N(s.shields)+'</span>':'')+'</div>'+
         '<div class="week">'+wk.map(function(d){
            var day=new Date(d.date+'T00:00:00').getDay();
            return '<span class="wd'+(d.met?' met':d.shield?' shield':'')+(d.today?' now':'')+'"><i>'+(d.met?'&#10003;':d.shield?shieldSvg():'')+'</i><em>'+(LBN()?DAYS_BN:DAYS_EN)[day]+'</em></span>';
          }).join('')+'</div>'+
         '<div class="goal-t">'+(g.met ? L('Daily goal met: +'+GAME.GOAL_PAY+' coins earned.','আজকের লক্ষ্য পূরণ: +'+N(GAME.GOAL_PAY)+' কয়েন পেয়েছ।')
                                       : L((g.target-g.done)+' more questions to today\'s goal (+'+GAME.GOAL_PAY+' coins).','আজকের লক্ষ্যে আর '+N(g.target-g.done)+'টি প্রশ্ন (+'+N(GAME.GOAL_PAY)+' কয়েন)।'))+'</div>'+
       '</div></div>'+
     (left>0 ? '<button type="button" class="btn big go light" data-act="continue">'+L('Continue · '+PLAN.SET_N+' questions','চালিয়ে যাও · '+N(PLAN.SET_N)+'টি প্রশ্ন')+'</button>'
             : '<p class="alldone">'+L('Every question is done. Well done!','সব প্রশ্ন শেষ। সাবাস!')+'</p>')+
     '</section>';

  /* today's five and the mistake bank, side by side on a desk */
  var dd=MODES.dailyDone(), dr=s.daily;
  o+='<div class="duo">';
  o+='<button type="button" class="card tile daily'+(dd?' done':'')+'" data-act="dailyGo">'+
     '<span class="tile-ico">'+(dd?'&#10003;':'<b>'+N(5)+'</b>')+'</span>'+
     '<span class="tile-t">'+L('Today\'s five','আজকের ৫')+'</span>'+
     '<span class="tile-s">'+(dd ? L(dr.right+' of '+dr.n+' right · new five tomorrow', N(dr.n)+'-এ '+N(dr.right)+' ঠিক · কাল নতুন ৫টি')
                                 : L('The same five for everyone today · +10 coins','আজ সবার জন্য একই ৫টি · +১০ কয়েন'))+'</span></button>';
  o+='<button type="button" class="card tile bank'+(bank?' has':'')+'" data-act="bankGo"'+(bank?'':' disabled')+'>'+
     '<span class="tile-ico">'+N(bank)+'</span>'+
     '<span class="tile-t">'+L('Mistake bank','ভুলের খাতা')+'</span>'+
     '<span class="tile-s">'+(bank?L(bank+' waiting · +2 coins each to win back', N(bank)+' টি অপেক্ষায় · ফিরিয়ে আনলে প্রতিটিতে +২')
                               :L('Empty. A miss lands here.','খালি। ভুল করলে এখানে জমবে।'))+'</span></button>';
  o+='</div>';

  /* the subjects */
  o+='<div class="label sec">'+L('Subjects','বিষয়')+'</div><div class="sjgrid">'+ICE.subjects.map(function(sj){
    var x=PLAN.subject(sj.id), q=PLAN.pct(x), soon=x.total===x.est;
    return '<button type="button" class="sjtile'+(soon?' soon':'')+'" data-act="openSubject" data-arg="'+sj.id+'" style="--sc:var(--s-'+sj.id+')">'+
      '<span class="sj-ico">'+CHARTS.landmark(sj.id,'lmk')+'</span>'+
      '<span class="sj-name">'+U.h(ICE.subjname(sj))+'</span>'+
      '<span class="sj-pc">'+(soon?L('soon','শিগগির'):N(Math.floor(q*100))+'%')+'</span>'+
      CHARTS.bar(q,'thin sc')+'</button>';
  }).join('')+'</div>';

  /* the whole syllabus, and the pace */
  o+='<section class="card syll"><div class="syll-top"><div><div class="label">'+L('The whole syllabus','পুরো সিলেবাস')+'</div>'+
     '<div class="syll-num"><b>'+U.num(left)+'</b> '+L('questions left · of '+U.num(all.total),'প্রশ্ন বাকি · '+U.num(all.total)+'-এর মধ্যে')+'</div></div>'+
     '<span class="syll-pc">'+N(Math.floor(p*100))+'%</span></div>'+CHARTS.bar(p,'thick')+
     '<p class="quiet">'+paceLine()+'</p></section>';

  /* the honesty note, until it is closed */
  if(!s.noteClosed) o+=honesty(true);
  return o+'</div>';
}
UIact('dailyGo', function(){ MODES.start('daily'); });
UIact('continueFromRun', function(){ MODES.start('continue'); });
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

  /* the level: from right answers alone */
  var lv=GAME.level(), S=DB.state();
  o+='<section class="card lvcard"><div class="lvmedal sm"><span>'+L('Level','লেভেল')+'</span><b>'+N(lv.lv)+'</b></div>'+
     '<div class="lv-r"><div class="lv-name">'+U.h(lv.name)+'</div>'+CHARTS.bar(lv.p,'thick')+
     '<div class="small">'+(lv.to?L(lv.left+' more right answers to level '+(lv.lv+1)+'.','লেভেল '+N(lv.lv+1)+'-এ যেতে আরও '+N(lv.left)+'টি ঠিক উত্তর।'):L('The top level. Board stand!','সর্বোচ্চ লেভেল। বোর্ড স্ট্যান্ড!'))+
     ' &middot; '+L(S.correct+' right in all',L('','মোট ')+N(S.correct)+'টি ঠিক')+'</div></div></section>';

  /* five weeks of practice, one square a day */
  var days=DB.week(35);
  o+='<section class="card heat"><div class="heat-top"><div class="label">'+L('The last five weeks','গত পাঁচ সপ্তাহ')+'</div>'+
     '<span class="small">'+L('Best streak ','সেরা স্ট্রিক ')+N(Math.max(S.best||0, DB.liveStreak()))+L(' days',' দিন')+'</span></div><div class="heatgrid">'+
     days.map(function(d){
       var lvl = d.q>=48?4 : d.q>=32?3 : d.q>=16?2 : d.q>=5?1 : 0;
       return '<i class="h'+lvl+(d.shield?' sh':'')+(d.today?' now':'')+'" title="'+d.date+' · '+N(d.q)+'"></i>';
     }).join('')+'</div>'+
     '<div class="heat-key small">'+L('Less','কম')+'<i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i>'+L('More','বেশি')+'</div></section>';

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
  o+=row(L('Daily goal','দৈনিক লক্ষ্য'),
    '<div class="seg">'+[1,2,3,4].map(function(n){
      return '<button type="button" class="'+((st.goalSets||2)===n?'on':'')+'" data-act="goalSets" data-arg="'+n+'">'+L(n*16+' q',N(n*16)+'টি')+'</button>';
    }).join('')+'</div>', L('Questions a day. Meeting it pays +'+GAME.GOAL_PAY+' coins.','দিনে কতটি প্রশ্ন। পূরণ করলে +'+N(GAME.GOAL_PAY)+' কয়েন।'));
  if(installEvt) o+=row(L('Install the app','অ্যাপ হিসেবে ইনস্টল'),
    '<button type="button" class="btn sm" data-act="install">'+L('Install','ইনস্টল')+'</button>',
    L('An icon on your home screen. Works offline.','হোম স্ক্রিনে আইকন। ইন্টারনেট ছাড়াও চলে।'));
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
UIact('goalSets', function(n){ DB.state().settings.goalSets=+n; DB.save(); UI.render(); });
var installEvt=null;
window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); installEvt=e; });
UIact('install', function(){
  if(!installEvt) return;
  installEvt.prompt();
  installEvt.userChoice.then(function(){ installEvt=null; UI.render(); }, function(){});
});
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
    }).join('')+(function(){
      var sh=GAME.SHIELD, have=DB.state().shields, can=GAME.coins()>=sh.cost && have<sh.max;
      return '<div class="item shield"><div class="it"><b>'+shieldSvg()+h(L(sh.en,sh.bn))+'</b><span>'+h(L(sh.noteEn,sh.noteBn))+'</span><em>'+L('You have ','আছে ')+N(have)+' / '+N(sh.max)+'</em></div>'+
        '<button type="button" class="btn sm'+(can?'':' ghost')+'" data-act="buyShield"'+(can?'':' disabled')+'><svg class="ci" viewBox="0 0 32 32"><use href="#coinSym"/></svg>'+N(sh.cost)+'</button></div>';
    })()+'</div>';
  var rec=GAME.recent(8);
  o+='<div class="label" style="margin-top:18px">'+L('Recent','সাম্প্রতিক')+'</div>';
  if(!rec.length) o+='<p class="small">'+L('Nothing earned yet. Answer a question.','এখনও কিছু জমেনি। একটি প্রশ্নের উত্তর দাও।')+'</p>';
  else o+='<ul class="recent">'+rec.map(function(e){
    if(e.k==='buy') return '<li><span>'+L('Bought ','কিনেছ ')+h(e.p==='shield'?L(GAME.SHIELD.en,GAME.SHIELD.bn):GAME.pname(GAME.power(e.p)))+'</span><b class="neg">'+N(e.n)+'</b></li>';
    if(e.k==='goal') return '<li><span>'+L('Daily goal met','আজকের লক্ষ্য পূরণ')+'</span><b>+'+N(e.n)+'</b></li>';
    return '<li><span>'+U.h(L('Set: '+e.right+' right'+(e.won?', '+e.won+' won back':'')+(e.set?', finished':''),
        'সেট: '+N(e.right)+' ঠিক'+(e.won?', '+N(e.won)+'টি ফিরিয়ে আনা':'')+(e.set?', শেষ করা':'')))+'</span><b>+'+N(e.n)+'</b></li>';
  }).join('')+'</ul>';
  UI.sheet(o);
}
UIact('buyShield', function(){
  var r=GAME.buyShield();
  if(!r.ok){ UI.toast(r.full?L('You already hold two shields.','তোমার কাছে আগে থেকেই দুটি শিল্ড আছে।'):L('Not enough coins yet.','কয়েন এখনও যথেষ্ট নয়।')); return; }
  FX.play('coin'); UI.paintChrome(); wallet();
  if(UI.current()==='start') UI.render();
});
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
