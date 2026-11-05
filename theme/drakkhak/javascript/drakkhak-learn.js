/* ===========================================================
   Drakkhak: the /learn page of the community.

   The site's own header stays on top (search, bell, messages, your
   photo, night mode). Learn runs below it in a frame from /learn-app/.
   This file is the glue between the two, all on one origin:
     · the header gets Learn's level, coins, days left, Sound and Timer;
     · the header search finds chapters here, and opens them in Learn;
     · night mode is one switch for both;
     · "Message" in Learn opens the site's own chat box;
     · the address bar follows Learn (/learn#/map, /learn#/ranks ...).
   =========================================================== */
(function(){
'use strict';
var frame=document.getElementById('dkLearnFrame'), wrap=document.getElementById('dkLearn');
if(!frame || !wrap) return;
document.documentElement.classList.add('dk-on-learn');
if(document.body) document.body.classList.add('dk-on-learn');

function $q(s){ return document.querySelector(s); }
function header(){ return $q('.navbar-default') || $q('.header-container') || $q('header'); }
function fit(){
  var h=header(), top=h ? Math.max(0, Math.round(h.getBoundingClientRect().bottom)) : 0;
  wrap.style.top=top+'px';
  /* the site's chat rail down the right edge: Learn stops short of it (folded, it is a thin strip) */
  var cc=$q('.chat-container'), right=0;
  if(cc && cc.getClientRects().length && getComputedStyle(cc).position==='fixed' && getComputedStyle(cc).visibility!=='hidden'){
    var r=cc.getBoundingClientRect();
    if(r.width>0 && r.width<140 && r.right>=window.innerWidth-2) right=Math.round(r.width);
  }
  wrap.style.right=right+'px';
}
fit(); window.addEventListener('resize', fit); setTimeout(fit, 400); setTimeout(fit, 1500);

/* /learn#/map opens Learn on the map */
if(location.hash && location.hash.indexOf('#/')===0) frame.src=frame.src.split('#')[0]+location.hash;
function app(){ try{ return frame.contentWindow; }catch(e){ return null; } }
function go(route, param){ var w=app(); if(w && w.UI && w.UI.go) w.UI.go(route, param||null); }
/* a link to /learn#/ranks while already here (a notification, say) */
window.addEventListener('hashchange', function(){
  var m=String(location.hash||'').match(/^#\/([a-z]+)(?:\/(.+))?$/);
  if(m) go(m[1], m[2] ? decodeURIComponent(m[2]) : null);
});

/* ---------- Learn's numbers in the site's header ---------- */
var chips=null;
function makeChips(){
  if(chips) return chips;
  var host=$q('.navbar-default .navbar-right') || $q('.navbar-default .nav.navbar-nav:last-child') || $q('.navbar-default .container-fluid');
  if(!host) return null;
  chips=document.createElement(host.tagName==='UL'?'li':'div');
  chips.className='dk-lchips';
  chips.innerHTML=
    '<button type="button" class="dk-lc dk-lv" data-go="progress" title="Your level"><i></i><b>1</b><span class="dk-lc-bar"><em></em></span></button>'+
    '<button type="button" class="dk-lc dk-coins" data-go="shop" title="Coins: spend them in the shop"><i></i><b>0</b></button>'+
    '<button type="button" class="dk-lc dk-days" data-go="map" title="Days of study left for the whole syllabus"><b>0</b><span>days left</span></button>'+
    '<button type="button" class="dk-lc dk-tog" data-flip="sound" title="Sound (M)"><i></i>Sound</button>'+
    '<button type="button" class="dk-lc dk-tog" data-flip="timer" title="Question timer (T)"><i></i>Timer</button>';
  host.insertBefore(chips, host.firstChild);
  chips.addEventListener('click', function(e){
    var b=e.target.closest('[data-go],[data-flip]'); if(!b) return;
    e.preventDefault();
    var w=app();
    if(b.hasAttribute('data-go')) go(b.getAttribute('data-go'));
    else if(w && w.UI && w.UI.flip) w.UI.flip(b.getAttribute('data-flip'));
  });
  fit();
  return chips;
}
function paintChips(d){
  var c=makeChips(); if(!c || !d) return;
  c.querySelector('.dk-lv b').textContent=d.level;
  c.querySelector('.dk-lv em').style.width=Math.max(2, Math.round(100*d.into/Math.max(1,d.need)))+'%';
  c.querySelector('.dk-lv').title='Level '+d.level+' · '+d.into+' of '+d.need+' XP to the next level';
  c.querySelector('.dk-coins b').textContent=Number(d.coins||0).toLocaleString('en');
  c.querySelector('.dk-days b').textContent=d.days;
  var t=c.querySelectorAll('.dk-tog');
  t[0].classList.toggle('on', !!d.sound); t[1].classList.toggle('on', !!d.timer);
}

/* ---------- the search box finds chapters here ---------- */
function searchBox(){ return $q('.search-container .search-input'); }
function chapterResults(q){
  var res=$q('.search-dropdown-result'), cont=$q('.search-container');
  if(!res || !cont) return;
  if(!String(q||'').trim()){ cont.classList.remove('open'); return; }
  if(window.DkSearch) DkSearch.load();
  var html=window.DkSearch ? DkSearch.html(q) : '';
  res.innerHTML = html || '<span class="center-text">No chapter by that name.</span>';
  cont.classList.add('open');
  var adv=$q('.search-advanced-container'); if(adv) adv.style.display='none';
}
window.Wo_DetectSearchType=function(v){ chapterResults(v); };
window.Wo_SearchResult=function(v){ chapterResults(v); };
window.Wo_GetRecentSearchs=function(){ if(window.DkSearch) DkSearch.load(); };
function chapterFrom(a){ var m=String(a.getAttribute('href')||'').match(/#\/topic\/([^#?]+)/); return m ? decodeURIComponent(m[1]) : null; }
document.addEventListener('click', function(e){
  var a=e.target.closest && e.target.closest('.dk-sres-i'); if(!a) return;
  var id=chapterFrom(a); if(!id) return;
  e.preventDefault(); e.stopPropagation();
  var cont=$q('.search-container'); if(cont) cont.classList.remove('open');
  var box=searchBox(); if(box){ box.value=''; box.blur(); }
  go('topic', id);
}, true);
document.addEventListener('keydown', function(e){
  var box=searchBox(); if(e.target!==box) return;
  if(e.key==='Enter'){
    e.preventDefault(); e.stopImmediatePropagation();
    var first=$q('.search-dropdown-result .dk-sres-i'); if(first) first.click();
  }
}, true);
var box=searchBox(); if(box) box.setAttribute('placeholder', 'Find a chapter');

/* ---------- night mode: one switch ---------- */
function isNight(){ return !!document.getElementById('night-mode-css'); }
var night=isNight();
new MutationObserver(function(){
  var n=isNight(); if(n===night) return; night=n;
  var w=app(); if(w && w.DKEMBED) w.DKEMBED.night(n);
}).observe(document.head, {childList:true, subtree:true});
function setNight(on){
  if(!!on===isNight()) return;
  var t=document.getElementById('night_mode_toggle');
  if(t){ t.click(); return; }
  document.cookie='mode='+(on?'night':'day')+'; path=/; max-age=31536000; SameSite=Lax';
  location.reload();
}

/* ---------- what Learn calls ---------- */
window.DKLEARN={
  chrome: paintChips,
  route: function(r, p){
    var h='#/'+r+(p?'/'+encodeURIComponent(p):'');
    if(location.hash!==h) try{ history.replaceState(null, '', location.pathname+location.search+h); }catch(e){}
  },
  night: setNight,
  isNight: isNight,
  /* the site's own chat box, opened over Learn */
  chat: function(userId, username){
    if(typeof window.Wo_OpenChatTab==='function'){ try{ Wo_OpenChatTab(userId, 0); return true; }catch(e){} }
    location.href='/messages/'+encodeURIComponent(username||'');
    return false;
  },
  open: function(url){ location.href=url; }
};
frame.addEventListener('load', function(){
  var w=app(); if(w && w.DKEMBED){ w.DKEMBED.night(isNight()); w.DKEMBED.ready(); }
  try{ frame.contentWindow.focus(); }catch(e){}
});
})();
