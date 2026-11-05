/* ===========================================================
   ACCOUNT — one account for Learn and the community.

   The account is the community's (WoWonder) account. Learn asks the
   site who is signed in (requests.php?f=drakkhak&s=me). Signed out,
   Learn works exactly as before: the record lives in this browser.
   Signed in:
     · the record is kept on the account too, so it follows you to any
       device (the bigger record wins the first time a device links,
       and the other is kept as a backup in this browser);
     · a short summary (level, streak, minutes per day) goes to the
       site for the rankings, the duels, your profile and a parent's
       nightly report;
     · badges, levels and strong sets reach the site's one bell;
     · Share sends a card to your Community timeline;
     · Message opens the site's own chat box.
   Learn lives at /learn-app/; the site's root is one level up.
   =========================================================== */
var ACCOUNT = (function(){

var EMBED = document.documentElement.classList.contains('embedded');
var ROOT = (function(){ try{ return new URL('../', location.href).href; }catch(e){ return '/'; } })();
var API = ROOT+'requests.php?f=drakkhak&s=';
var me=null, checked=false, timer=null, lastSig='', lastSaveSig='', lastSave=0;

function live(){ return location.protocol.indexOf('http')===0 && SITE.on('bar.community') && !SITE.preview; }
function has(){ return !!(me && me.user); }
function user(){ return me && me.user; }
function call(s, body, opts){
  var h={'X-Requested-With':'XMLHttpRequest'};
  if(body) h['Content-Type']='application/json';
  return fetch(API+s, {method:body?'POST':'GET', credentials:'same-origin', headers:h,
                       body:body?JSON.stringify(body):undefined, keepalive:!!(opts&&opts.keepalive)})
    .then(function(r){
      if((r.headers.get('content-type')||'').indexOf('json')<0) return {loggedin:false, offline:true};
      return r.json().then(function(j){ if(r.status===401) j.loggedin=false; return j; });
    });
}

/* ---------- who is here ---------- */
function check(){
  if(!live()) { checked=true; return Promise.resolve(null); }
  return call('me').then(function(d){
    checked=true;
    me = d && d.loggedin ? d : null;
    if(me){
      /* signed in but opened on its own: come inside the site, so there is one header */
      if(!EMBED && window.top===window && !/[?&]alone=1/.test(location.search)){ location.replace(ROOT+'learn'+location.hash); return me; }
      link();
    }
    paint();
    return me;
  }).catch(function(){ checked=true; return null; });
}
function signInUrl(){ return ROOT+'welcome?last_url='+encodeURIComponent(ROOT+'learn'+location.hash); }
function signUpUrl(){ return ROOT+'register'; }

/* ---------- the record follows the account ---------- */
function backup(tag){ try{ localStorage.setItem('iceskep.hsc.v1.backup.'+tag, DB.exportJSON()); }catch(e){} }
function link(){
  var s=DB.state(), id=me.user.id;
  if(s.account===id){ start(); return; }
  call('load').then(function(r){
    var local=DB.game().answered||0, other=s.account && s.account!==id;
    if(r && r.data){
      var server=r.answered||0;
      if(other || !local || server>=local){
        if(local) backup(other ? 'account-'+s.account : 'before-'+id);
        try{ DB.importJSON(r.data); }catch(e){ return start(); }
        DB.state().account=id; DB.saveNow();
        location.reload();
        return;
      }
    } else if(other){
      backup('account-'+s.account);
      DB.reset();
    }
    s=DB.state(); s.account=id;
    var g=DB.game(); if(!g.handle) g.handle=me.user.name;
    DB.saveNow();
    save(true);
    start();
  }).catch(function(){ start(); });
}
function save(force){
  if(!has()) return;
  var txt=DB.exportJSON();
  if(txt.length>7.5*1024*1024) return;
  var sig=txt.length+':'+(DB.game().answered||0)+':'+DB.game().xp;
  if(!force && sig===lastSaveSig) return;
  lastSaveSig=sig; lastSave=Date.now();
  call('save', {data:txt, answered:DB.game().answered||0}).catch(function(){ lastSaveSig=''; });
}

/* ---------- the summary the site needs ---------- */
function summary(){
  var s=DB.state(), g=DB.game(), days={}, studied=0, k;
  DB.lastNDays(14).forEach(function(d){
    var a=DB.actsOn(d.date), m=Math.round(DB.minsOn(d.date)||0);
    if(m>0 || a.q>0) days[d.date]={m:m, a:a.q||0, c:a.right||0};
  });
  for(k in s.time) if(s.time[k] && s.time[k].tot>0) studied++;
  var ti=GAME.worn('title');
  return {sum:{xp:g.xp, level:GAME.level().level, coins:g.coins, streak:DB.liveStreak(), best:s.best||0,
               answered:g.answered||0, correct:g.correct||0, score:AB.score({track:s.track}).score,
               minutes:Math.round(DB.totalMins()||0), days:studied, badges:Object.keys(g.badges||{}).length,
               frame:GAME.worn('frame').id, title:ti && ti.id!=='none' ? ti.name : '', flair:GAME.worn('flair').id, edition:ICE.edition},
          days:days};
}
function sync(opts){
  if(!has()) return Promise.resolve();
  var b=summary(), sig=JSON.stringify(b);
  if(sig===lastSig && !(opts&&opts.force)) return Promise.resolve();
  lastSig=sig;
  return call('sync', b, opts).catch(function(){ lastSig=''; });
}
function start(){
  if(timer) return;
  sync({force:true});
  timer=setInterval(function(){
    sync();
    if(Date.now()-lastSave>180000) save();
  }, 60000);
  window.addEventListener('pagehide', function(){ sync({keepalive:true}); });
  document.addEventListener('visibilitychange', function(){ if(document.hidden){ sync({keepalive:true}); save(); } });
}

/* ---------- the one bell ---------- */
function notify(kind, text, path){ if(has()) call('notify', {kind:kind, text:text, path:path||'/learn'}).catch(function(){}); }
window.addEventListener('dk:badge', function(e){ var d=e.detail||{}; notify('badge', 'You earned a badge in Learn: '+(d.name||'a new badge')+'.', '/learn#/badges'); });
window.addEventListener('dk:level', function(e){ var d=e.detail||{}; notify('level', 'You reached level '+(d.level||'up')+' in Learn.', '/learn#/progress'); });
window.addEventListener('dk:setdone', function(e){
  var d=e.detail||{};
  if(has()){ sync({force:true}); save(); }
  if(d.n>=10 && d.right/d.n>=0.8) notify('set', 'A strong set in Learn: '+d.right+' of '+d.n+' right.', '/learn');
});

/* ---------- share to the feed ---------- */
function share(canvas, text){
  if(!has()) { UI.toast(L('Sign in to share to Community.')); return; }
  var img=''; try{ img=canvas ? canvas.toDataURL('image/png') : ''; }catch(e){}
  UI.toast(L('Posting to your Community timeline&hellip;'));
  call('share', {text:text, image:img}).then(function(r){
    if(r && r.ok) UI.toast('<b>'+L('Shared')+'</b> &middot; <a href="'+U.h(r.url)+'" target="_top">'+L('See the post')+'</a>', 4200);
    else UI.toast(U.h((r && r.error) || L('Could not post.')));
  }).catch(function(){ UI.toast(L('Could not reach Community.')); });
}

/* ---------- the site's own chat box ---------- */
function chat(u){
  if(!u) return;
  if(EMBED){ try{ if(window.parent.DKLEARN){ window.parent.DKLEARN.chat(u.id, u.username); return; } }catch(e){} }
  window.open(ROOT+'messages/'+encodeURIComponent(u.username), '_top');
}
function profileUrl(u){ return u && u.url ? u.url : ROOT; }

/* ---------- the parts of Learn that show the account ---------- */
function paint(){
  var c=UI.current && UI.current();
  if(c==='run') { UI.paintChrome(); return; }
  if(c==='settings' || c==='ranks' || c==='shop' || c==='today' || c==='welcome' || c==='social') UI.render(); else UI.paintChrome();
}
function settingsCard(){
  if(!live()) return '';
  if(!checked) return '<section class="card acc-card"><h3 style="font-size:21px">'+L('Your account')+'</h3><p class="small">'+L('Checking&hellip;')+'</p></section>';
  if(!has()){
    return '<section class="card acc-card"><h3 style="font-size:21px">'+L('One account for Learn and Community')+'</h3>'+
      '<p class="muted" style="font-size:16px">'+L('Practise without an account as long as you like. Sign in to keep your progress on every device, join the rankings and daily duels, message friends, and put your study on your profile.')+'</p>'+
      '<div class="btns"><a class="btn" href="'+U.h(signInUrl())+'" target="_top">'+L('Sign in')+'</a><a class="btn ghost" href="'+U.h(signUpUrl())+'" target="_top">'+L('Create an account')+'</a></div></section>';
  }
  var p=me.profile||{};
  return '<section class="card acc-card">'+
    '<div class="acc-head"><img src="'+U.h(me.user.avatar)+'" alt=""><div><b>'+U.h(me.user.name)+'</b><small>@'+U.h(me.user.username)+' &middot; '+L('progress kept on your account')+'</small></div>'+
      '<a class="link" href="'+U.h(profileUrl(me.user))+'" target="_top">'+L('Profile')+' &rsaquo;</a></div>'+
    '<form class="acc-row" data-acc="college"><label>'+L('College or school')+'<input class="field" name="college" maxlength="120" value="'+U.h(p.college||'')+'" placeholder="'+U.h(L('e.g. Notre Dame College, Dhaka'))+'" autocomplete="off"></label>'+
      '<button class="btn sm ghost" type="submit">'+L('Save')+'</button></form>'+
    '<p class="small">'+L('Colleges are ranked by the average score of their students once five of them study.')+'</p>'+
    '<div class="seclabel" style="margin-top:14px">'+L('A parent\'s nightly report')+'</div>'+
    '<form class="acc-par" data-acc="parent">'+
      '<label>'+L('Parent\'s email')+'<input class="field" type="email" name="email" maxlength="160" value="'+U.h(p.parent_email||'')+'" placeholder="name@example.com"></label>'+
      '<label>'+L('Parent\'s phone (optional)')+'<input class="field" type="tel" name="phone" maxlength="32" value="'+U.h(p.parent_phone||'')+'" placeholder="+8801..."></label>'+
      '<label class="acc-ok"><input type="checkbox" name="consent"'+(p.parent_email?' checked':'')+'> '+L('I agree that this parent gets a short email each night with my active study time and questions answered. Nothing else is shared.')+'</label>'+
      '<div class="btns"><button class="btn sm" type="submit">'+L(p.parent_email?'Update':'Add')+'</button>'+(p.parent_email?'<button class="btn sm ghost" type="button" data-act="accParentOff">'+L('Stop the reports')+'</button>':'')+'</div>'+
      (p.parent_email ? '<p class="small">'+(p.parent_ok ? L('Reports go out each night at about 9:30 pm.') : L('Waiting for the parent to confirm from the email we sent.'))+'</p>' : '')+
    '</form></section>';
}
document.addEventListener('submit', function(e){
  var f=e.target; if(!f.getAttribute || !f.getAttribute('data-acc')) return;
  e.preventDefault();
  var kind=f.getAttribute('data-acc');
  if(kind==='college'){
    call('college', {name:f.college.value}).then(function(r){ if(r && r.ok){ me.profile.college=r.college; UI.toast(L('College saved.')); } });
  } else if(kind==='parent'){
    call('parent', {email:f.email.value, phone:f.phone.value, consent:f.consent.checked}).then(function(r){
      if(r && r.ok){ me.profile.parent_email=f.email.value; me.profile.parent_phone=f.phone.value; me.profile.parent_ok=0;
        UI.toast(r.pending ? L('Saved. We emailed the parent to confirm.') : L('Saved.')); UI.render(); }
      else UI.toast(U.h((r && r.error) || L('Could not save.')));
    });
  }
}, true);
UI.act('accParentOff', function(){
  call('parent', {email:'', phone:'', consent:false}).then(function(){ me.profile.parent_email=''; me.profile.parent_phone=''; UI.toast(L('No more reports will be sent.')); UI.render(); });
});

/* the competitive shop items: coins are spent here, the effect is kept by the site */
function item(name){ return call('item', {item:name}); }

return {check:check, has:has, user:user, call:call, share:share, chat:chat, settingsCard:settingsCard, paint:paint,
        signInUrl:signInUrl, signUpUrl:signUpUrl, item:item, sync:sync, save:save, live:live, root:function(){ return ROOT; },
        embedded:function(){ return EMBED; }, me:function(){ return me; }};
})();
