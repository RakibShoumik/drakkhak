/* ===========================================================
   RANKS — the rankings, the daily duel and the weekly contest.

   Everything here is about effort: active study minutes, the ones
   Learn measures while you work. Nothing here can be bought except a
   seat or a highlight; the minutes themselves only come from study.

     · Students  this week's active minutes, Monday to Sunday;
     · Colleges  the average score of their students, once five study;
     · Duel      today, 1 v 1 or 2 v 2, against people who study about
                 as much as you; most active minutes by midnight wins;
     · Contest   this week's board, for those who took a seat.

   The site keeps the numbers (drakkhak/lib.php); this file only asks.
   =========================================================== */
var RANKS = (function(){

var TABS=[
  {id:'students', en:'Students'},
  {id:'colleges', en:'Colleges'},
  {id:'duel',     en:'Today\'s duel'},
  {id:'contest',  en:'Contest'}
];
var cache={}, busy={}, MAXAGE=30000;
function h(s){ return U.h(s); }

/* ---------- the competitive shop items: coins are spent here, the effect is kept by the site ---------- */
var ITEMS=[
  {id:'contest',   art:'&#127942;',          cost:300, name:'Weekly contest entry',  note:'A seat in this week\'s contest, ranked on active study time. Monday to Sunday.'},
  {id:'challenge', art:'&#9876;&#65039;',    cost:120, name:'Challenge a friend',    note:'A study duel today with someone you follow. Most active minutes by midnight wins.'},
  {id:'spotlight', art:'&#128226;',          cost:200, name:'Leaderboard spotlight', note:'Your name highlighted on the rankings for 24 hours.'},
  {id:'shield',    art:'&#128737;&#65039;',  cost:250, name:'Rank shield',           note:'Keeps the place you hold on this week\'s board for 24 hours, through one bad day.'}
];
function item(id){ for(var i=0;i<ITEMS.length;i++) if(ITEMS[i].id===id) return ITEMS[i]; return null; }
function coins(n){ return '<svg class="ci" viewBox="0 0 32 32" aria-hidden="true"><use href="#coinSym"/></svg>'+U.num(n); }

/* ---------- asking the site ---------- */
function key(tab){ return tab==='duel' ? 'duel' : 'board:'+tab; }
function load(tab, force){
  var k=key(tab), c=cache[k];
  if(busy[k]) return;
  if(c && !force && Date.now()-c.t<MAXAGE) return;
  busy[k]=1;
  var req = tab==='duel' ? ACCOUNT.call('duel') : ACCOUNT.call('board&type='+encodeURIComponent(tab));
  req.then(function(d){ cache[k]={t:Date.now(), d:d}; })
     .catch(function(){ cache[k]={t:Date.now(), d:{error:L('Could not reach the site. Check the connection and try again.')}}; })
     .then(function(){ busy[k]=0; if(UI.current()==='ranks') UI.render(); });
}
function post(s, body){
  return ACCOUNT.call(s, body||{}).then(function(d){
    if(d && d.state!==undefined) cache.duel={t:Date.now(), d:d};
    return d;
  });
}

/* ---------- the page ---------- */
function view(p){
  var tab=TABS.some(function(t){ return t.id===p; }) ? p : 'students';
  var o='<div class="phead"><span class="kicker">'+L('Ranks')+'</span><h1>'+L('Ranks')+'</h1>'+
    '<p class="lede">'+L('Ranked on effort: the active minutes Learn measures while you study. A page left open does not count, and nothing in the shop buys minutes.')+'</p></div>';
  if(!ACCOUNT.live()){
    return o+'<section class="card"><p class="muted">'+L('The rankings live on the website. Open Drakkhak online to see them.')+'</p></section>';
  }
  if(!ACCOUNT.has()){
    return o+'<section class="card acc-card"><h3 style="font-size:21px">'+L('Sign in to join the rankings')+'</h3>'+
      '<p class="muted" style="font-size:16px">'+L('One account for Learn and Community. Your practice so far comes with you: it is kept on the account the moment you sign in.')+'</p>'+
      '<div class="btns"><a class="btn" href="'+h(ACCOUNT.signInUrl())+'" target="_top">'+L('Sign in')+'</a><a class="btn ghost" href="'+h(ACCOUNT.signUpUrl())+'" target="_top">'+L('Create an account')+'</a></div></section>';
  }
  o+='<nav class="rk-tabs" role="tablist">'+TABS.map(function(t){
    return '<a href="#/ranks/'+t.id+'" data-go="ranks" data-p="'+t.id+'" role="tab" class="mchip'+(t.id===tab?' on':'')+'" aria-selected="'+(t.id===tab)+'">'+L(t.en)+'</a>';
  }).join('')+'<button type="button" class="link quiet rk-refresh" data-act="rkRefresh" data-arg="'+tab+'">'+L('Refresh')+'</button></nav>';
  load(tab);
  var c=cache[key(tab)];
  if(!c) return o+'<section class="card rk-box"><p class="small">'+L('Loading&hellip;')+'</p></section>';
  var d=c.d||{};
  if(d.loggedin===false) return o+'<section class="card"><p class="muted">'+L('You were signed out. Sign in again to see the rankings.')+'</p></section>';
  if(d.error) return o+'<section class="card"><p class="muted">'+h(d.error)+'</p></section>';
  if(tab==='students') o+=students(d, false);
  else if(tab==='colleges') o+=colleges(d);
  else if(tab==='duel') o+=duel(d);
  else o+=contest(d);
  return o;
}

/* ---------- a person on a board ---------- */
function face(u, cls){ return '<img class="rk-av'+(cls?' '+cls:'')+'" src="'+h(u.avatar)+'" alt="" loading="lazy">'; }
function who(u){ return '<a class="rk-name" href="'+h(u.url)+'" target="_top">'+h(u.name)+(u.verified?' <i class="rk-ver" title="'+h(L('Verified'))+'">&#10003;</i>':'')+'</a>'; }
function msgBtn(u){ return '<button type="button" class="btn xs ghost" data-act="rkMsg" data-arg="'+u.id+'" data-name="'+h(u.username)+'" title="'+h(L('Message'))+'">'+L('Message')+'</button>'; }
function medal(n){ return n<=3 ? ['&#129351;','&#129352;','&#129353;'][n-1] : String(n); }
function row(r){
  var u=r.user||{};
  return '<div class="rk-row'+(r.me?' me':'')+(r.spot?' spot':'')+(r.rank<=3?' podium':'')+'">'+
    '<span class="rk-n">'+medal(r.rank)+'</span>'+face(u, 'ring-'+(r.frame||'plain'))+
    '<span class="rk-who">'+who(u)+'<small>'+L('Level ')+r.level+(r.streak?' &middot; '+L(r.streak+'-day streak'):'')+
      (r.spot?' &middot; <b class="rk-tag">'+L('spotlight')+'</b>':'')+(r.shield?' &middot; <b class="rk-tag sh" title="'+h(L('This place is shielded for a day'))+'">&#128737;&#65039; '+L('shield')+'</b>':'')+'</small></span>'+
    '<span class="rk-v"><b>'+U.mins(r.mins)+'</b><small>'+L('this week')+'</small></span>'+
    (r.me ? '<span class="rk-me">'+L('you')+'</span>' : msgBtn(u))+'</div>';
}
function students(d, isContest){
  var rows=d.rows||[], o='<section class="card rk-box">';
  if(!rows.length) o+='<p class="small">'+(isContest ? L('Nobody has taken a seat this week yet. The first name on the board could be yours.')
                                               : L('No study counted this week yet. Answer a few questions and your name goes up.'))+'</p>';
  o+=rows.map(row).join('');
  if(d.me && !rows.some(function(r){ return r.me; })) o+='<div class="rk-gap"></div>'+row(d.me);
  if(!d.me && rows.length) o+='<p class="small rk-foot">'+L('You are not on this week\'s board yet: it counts from Monday.')+'</p>';
  o+='</section>';
  o+='<p class="small">'+L('Week from ')+h(UI.dLong(new Date((d.week||DB.today())+'T00:00:00')))+' &middot; '+U.num(d.total||0)+L(' studying')+'</p>';
  return o;
}
function colleges(d){
  var rows=d.rows||[], me=d.me, o='';
  o+='<section class="card rk-box">';
  if(!rows.length) o+='<p class="small">'+L('No college has '+(d.min||5)+' students studying yet. Bring your classmates: a college is ranked once '+(d.min||5)+' of its students have answered '+(d.min_answers||50)+' questions each.')+'</p>';
  o+=rows.map(function(c){
    var mine=me && me.id===c.id;
    return '<div class="rk-row'+(mine?' me':'')+(c.rank<=3?' podium':'')+'"><span class="rk-n">'+medal(c.rank)+'</span>'+
      '<span class="rk-col" aria-hidden="true">'+h(String(c.name||'?').charAt(0).toUpperCase())+'</span>'+
      '<span class="rk-who"><b class="rk-name">'+h(c.name)+'</b><small>'+U.num(c.students)+L(' students')+' &middot; '+U.mins(c.week_min)+L(' this week')+'</small></span>'+
      '<span class="rk-v"><b>'+c.avg+'</b><small>'+L('average score')+'</small></span>'+(mine?'<span class="rk-me">'+L('yours')+'</span>':'')+'</div>';
  }).join('');
  o+='</section>';
  if(me && !me.ranked) o+='<p class="small">'+L('Your college, ')+'<b>'+h(me.name)+'</b>'+L(', is not ranked yet: ')+
      L(U.num(me.students)+' of '+(d.min||5)+' students with '+(d.min_answers||50)+' answers or more.')+'</p>';
  else if(!me) o+='<p class="small">'+L('Add your college in ')+'<a href="#/settings" data-go="settings">'+L('Settings')+'</a>'+L(' to count for it.')+'</p>';
  o+='<p class="small">'+L('The score is Learn\'s ability score out of 100, averaged over students with at least '+(d.min_answers||50)+' answers.')+'</p>';
  return o;
}
function contest(d){
  var g=DB.game(), it=item('contest'), o='';
  if(!d.in_contest){
    o+='<section class="card rk-cta"><span class="art">'+it.art+'</span><div><b>'+L('This week\'s contest')+'</b>'+
      '<p class="small">'+L(it.note)+'</p></div>'+
      '<button class="btn sm" data-act="rkBuy" data-arg="contest"'+(g.coins<it.cost?' disabled title="'+h(L('Not enough coins yet'))+'"':'')+'>'+coins(it.cost)+'</button></section>';
  }
  return o+students(d, true);
}

/* ---------- the daily duel ---------- */
function untilMidnight(){
  /* the site counts days in Bangladesh time (UTC+6) */
  var now=Date.now(), dhaka=new Date(now+6*3600e3), left=86400e3-((dhaka.getUTCHours()*3600+dhaka.getUTCMinutes()*60+dhaka.getUTCSeconds())*1000);
  return Math.max(0, Math.round(left/60000));
}
function side(list, mine){
  return list.map(function(p){
    var u=p.user||{}, me=ACCOUNT.user() && u.id===ACCOUNT.user().id;
    return '<div class="dl-p">'+face(u)+'<span class="rk-who">'+(me?'<b class="rk-name">'+L('You')+'</b>':who(u))+'<small>'+U.mins(p.mins)+L(' today')+'</small></span>'+
      (me?'':msgBtn(u))+'</div>';
  }).join('');
}
function lastLine(x){
  if(!x) return '';
  var res = x.winner==='us' ? L('You won') : x.winner==='them' ? L('The other side won') : L('A tie');
  return '<p class="small">'+L('Last duel (')+h(x.day)+'): <b>'+res+'</b>, '+U.mins(x.us_min)+L(' to ')+U.mins(x.them_min)+'.</p>';
}
function duel(d){
  var o='', st=d.state;
  if(st==='none' || st==='waiting'){
    o+='<section class="card dl-card"><h3 style="font-size:21px">'+L('A duel for today')+'</h3>'+
      '<p class="muted" style="font-size:16px">'+L('You are matched with people who study about as much as you'+(d.avg?' (you average '+U.mins(d.avg)+' a day)':'')+'. Whoever has more active minutes by midnight wins. In 2 v 2, a team adds its minutes together.')+'</p>';
    if(st==='waiting'){
      o+='<div class="dl-wait"><span class="dl-pulse"></span>'+L('Looking for '+(d.size===2?'three people':'someone')+' to duel&hellip; You can keep studying: your minutes count from the start of the day.')+'</div>'+
         '<div class="btns"><button class="btn ghost sm" data-act="rkLeave">'+L('Stop looking')+'</button></div>';
    } else {
      o+='<div class="btns"><button class="btn" data-act="rkJoin" data-arg="1">'+L('Find a 1 v 1 duel')+'</button>'+
         '<button class="btn ghost" data-act="rkJoin" data-arg="2">'+L('Find a 2 v 2 duel')+'</button></div>'+
         '<p class="small">'+L('Or challenge someone you follow from the ')+'<a href="#/shop" data-go="shop">'+L('shop')+'</a>.</p>';
    }
    o+=lastLine(d.last)+'</section>';
    return o;
  }
  if(st==='invited'){
    var them=(d.them[0]||{}).user||{}, us=(d.us[0]||{}).user||{};
    if(d.invited_me){
      var from=d.mine==='b' ? them : us;
      return '<section class="card dl-card"><h3 style="font-size:21px">'+h(from.name||L('A friend'))+L(' challenged you')+'</h3>'+
        '<p class="muted" style="font-size:16px">'+L('A study duel for today. Whoever has more active minutes by midnight wins.')+'</p>'+
        '<div class="btns"><button class="btn" data-act="rkAnswer" data-arg="1">'+L('Accept')+'</button><button class="btn ghost" data-act="rkAnswer" data-arg="0">'+L('Not today')+'</button></div></section>';
    }
    return '<section class="card dl-card"><h3 style="font-size:21px">'+L('Waiting for ')+h(them.name||L('your friend'))+'</h3>'+
      '<p class="muted" style="font-size:16px">'+L('They have the invitation in their notifications. Your minutes count from the start of the day either way.')+'</p>'+
      (them.id?'<div class="btns">'+msgBtn(them)+'</div>':'')+'</section>';
  }
  /* open: the scoreboard */
  var lead=d.us_min-d.them_min, left=untilMidnight();
  o+='<section class="card dl-card"><div class="spread" style="align-items:baseline;flex-wrap:wrap;gap:8px"><h3 style="font-size:21px">'+
     (d.size===2?L('2 v 2 today'):d.friend?L('A duel with a friend'):L('1 v 1 today'))+'</h3>'+
     '<span class="kicker">'+L(U.mins(left)+' to midnight')+'</span></div>'+
     '<div class="dl-board"><div class="dl-side us"><span class="kicker">'+L(d.size===2?'Your team':'You')+'</span><b class="dl-tot">'+U.mins(d.us_min)+'</b>'+side(d.us)+'</div>'+
     '<span class="dl-vs">'+L('vs')+'</span>'+
     '<div class="dl-side them"><span class="kicker">'+L(d.size===2?'Their team':'Them')+'</span><b class="dl-tot">'+U.mins(d.them_min)+'</b>'+side(d.them)+'</div></div>'+
     '<div class="dl-bar"><i style="width:'+(d.us_min+d.them_min ? Math.round(100*d.us_min/(d.us_min+d.them_min)) : 50)+'%"></i></div>'+
     '<p class="muted" style="font-size:16px">'+(lead>0 ? L('You are '+U.mins(lead)+' ahead. Keep going.') : lead<0 ? L(U.mins(-lead)+' behind. One good set closes that.') : L('Level. The next minutes decide it.'))+'</p>'+
     '<div class="btns"><button class="btn" data-act="quickStart">'+L('Study now')+'</button></div>'+
     '<p class="small">'+L('Minutes reach the site about once a minute while you study.')+'</p></section>';
  return o;
}

/* ---------- actions ---------- */
UI.act('rkRefresh', function(tab){ ACCOUNT.sync({force:true}); delete cache[key(tab||'students')]; UI.render(); });
UI.act('rkMsg', function(id, b){ ACCOUNT.chat({id:+id, username:b.getAttribute('data-name')}); });
UI.act('rkJoin', function(size){
  post('duel_join', {size:+size||1}).then(function(d){
    UI.toast(d && d.state==='open' ? L('Matched. Your duel is on.') : L('Looking for someone to duel&hellip;'));
    UI.render();
  }).catch(function(){ UI.toast(L('Could not reach the site.')); });
});
UI.act('rkLeave', function(){ post('duel_leave').then(function(){ UI.render(); }); });
UI.act('rkAnswer', function(yes){
  post('duel_answer', {yes:yes==='1'}).then(function(d){
    if(d && d.error) UI.toast(h(d.error)); else UI.toast(yes==='1' ? L('Duel accepted. Game on.') : L('Declined.'));
    UI.render();
  });
});

/* buying one: check the coins, let the site do it, then take the coins */
function buy(id, extra){
  var it=item(id), g=DB.game();
  if(!it) return;
  if(!ACCOUNT.has()){ UI.toast(L('Sign in to Community to use this.')); return; }
  if(g.coins<it.cost){ UI.toast(L('Not enough coins yet: '+U.num(it.cost-g.coins)+' to go.')); return; }
  var req = id==='challenge' ? ACCOUNT.call('challenge', {to:extra}) : ACCOUNT.item(id);
  req.then(function(r){
    if(!r || !r.ok){ UI.toast(h((r && r.error) || L('Could not do that now.'))); return; }
    GAME.spend(it.cost);
    if(id==='contest'){ var m=ACCOUNT.me(); if(m) m.contest=true; delete cache['board:contest']; }
    if(id==='challenge') delete cache.duel;
    if(id==='spotlight' || id==='shield'){ delete cache['board:students']; delete cache['board:contest']; }
    ACCOUNT.sync({force:true});
    UI.closeSheet();
    UI.toast('<b>'+h(L(it.name))+'</b> &middot; '+
      (id==='contest' ? L('you are in this week\'s contest.') : id==='challenge' ? L('the invitation is in their notifications.')
       : id==='spotlight' ? L('your name is highlighted for 24 hours.') : L('your place #'+r.rank+' is held for 24 hours.')), 4200);
    UI.render();
  }).catch(function(){ UI.toast(L('Could not reach the site.')); });
}
UI.act('rkBuy', function(id){
  if(id==='challenge') return pickFriend();
  var it=item(id);
  UI.sheet('<h2>'+h(L(it.name))+'</h2><p class="muted" style="font-size:16px;margin:8px 0 16px">'+h(L(it.note))+'</p>'+
    '<div class="btns"><button class="btn" data-act="rkBuyNow" data-arg="'+id+'">'+L('Buy for ')+coins(it.cost)+'</button>'+
    '<button class="btn ghost" type="button" data-close>'+L('Not now')+'</button></div>');
});
UI.act('rkBuyNow', function(id){ buy(id); });
function pickFriend(){
  var it=item('challenge');
  UI.sheet('<h2>'+L('Challenge a friend')+'</h2><p class="muted" style="font-size:16px;margin:8px 0 12px">'+h(L(it.note))+' '+L('Costs ')+coins(it.cost)+'.</p>'+
    '<div class="rk-friends" id="rkFriends"><p class="small">'+L('Loading the people you follow&hellip;')+'</p></div>');
  ACCOUNT.call('friends').then(function(r){
    var box=document.getElementById('rkFriends'); if(!box) return;
    var list=(r && r.list) || [];
    box.innerHTML = list.length ? list.map(function(u){
      return '<button type="button" class="rk-fr" data-act="rkChallenge" data-arg="'+u.id+'">'+face(u)+'<span class="rk-who"><b class="rk-name">'+h(u.name)+'</b><small>@'+h(u.username)+'</small></span>'+
        '<span class="kicker acc">'+L('Challenge')+'</span></button>';
    }).join('') : '<p class="small">'+L('You do not follow anyone yet. Follow friends in Community and they appear here.')+'</p>';
  }).catch(function(){ var box=document.getElementById('rkFriends'); if(box) box.innerHTML='<p class="small">'+L('Could not reach the site.')+'</p>'; });
}
UI.act('rkChallenge', function(id){ buy('challenge', +id); });

/* ---------- the shop's Compete shelf ---------- */
function shopCards(){
  var g=DB.game(), on=ACCOUNT.live() && ACCOUNT.has(), m=ACCOUNT.me()||{};
  return ITEMS.map(function(it){
    var owned = it.id==='contest' && m.contest;
    var foot = !ACCOUNT.live() ? '<span class="lvtag">'+L('On the website')+'</span>'
      : !on ? '<a class="btn xs ghost" href="'+h(ACCOUNT.signInUrl())+'" target="_top">'+L('Sign in')+'</a>'
      : owned ? '<span class="kicker ok">'+L('you are in this week')+'</span>'
      : '<button class="btn xs" data-act="rkBuy" data-arg="'+it.id+'"'+(g.coins<it.cost?' disabled':'')+'>'+coins(it.cost)+'</button>';
    return '<div class="shopitem'+(on?'':' locked')+(owned?' on':'')+'"><span class="art">'+it.art+'</span><b>'+L(it.name)+'</b><span class="small note">'+L(it.note)+'</span>'+foot+'</div>';
  }).join('');
}

/* the duel and the boards move while you study: look again now and then */
setInterval(function(){
  if(document.hidden || UI.current()!=='ranks' || !ACCOUNT.has()) return;
  var t=(UI.readHash()||{}).p||'students';
  if(t==='duel' || t==='students' || t==='contest') load(t, true);
}, 90000);

return {view:view, shopCards:shopCards, ITEMS:ITEMS, buy:buy};
})();
