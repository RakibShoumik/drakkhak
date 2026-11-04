/* ===========================================================
   SOCIAL — love and comments on each answer option, and the share
   of students who chose it. All of it appears only after you have
   answered, because a count beside an option would give the answer
   away. Offline it simply is not there; the question works the same.
   =========================================================== */
var SOCIAL = (function(){

var cache={}, cur=null, pending=null, thread={o:0, box:null};
var HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.8-4.7-7.8-10.3A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.8 2.8c0 5.6-7.8 10.3-7.8 10.3z"/></svg>';
var BUBBLE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5z"/></svg>';

function live(){ return location.protocol.indexOf('http')===0 && !SITE.preview; }
function loveOn(){ return SITE.on('social.love'); }
function comOn(){ return SITE.on('social.comment'); }
function crowdOn(){ return SITE.fun('crowd'); }
function qid(q){ return (q._orig||q).id; }
/* options can be shuffled on screen; what is loved is the option itself */
function orig(q,i){
  if(!q._orig || !q._orig.opts || !q.opts) return i;
  var at=q._orig.opts.indexOf(q.opts[i]);
  return at<0 ? i : at;
}
function post(body){
  return fetch('api/social.php',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify(body)}).then(function(r){
    if(r.status===204) return {};
    return r.json().catch(function(){ return {error:L('Could not reach the server.','সার্ভারে পৌঁছানো গেল না।')}; });
  });
}
function blank(){ return {l:[0,0,0,0], me:[false,false,false,false], c:[0,0,0,0], p:[0,0,0,0]}; }

/* ---------- the line under an option ---------- */
function row(q,i){
  if(!live() || !(loveOn()||comOn()||crowdOn())) return '';
  cur=q;
  var o=orig(q,i), d=cache[qid(q)]||blank();
  var out='<div class="osoc" data-o="'+o+'">';
  if(crowdOn()) out+='<span class="oscrowd" hidden><i></i><b></b></span>';
  out+='<span class="osgrow"></span>';
  if(loveOn()) out+='<button type="button" class="oslove'+(d.me[o]?' on':'')+'" data-act="sLove" data-arg="'+i+'" aria-pressed="'+!!d.me[o]+'" aria-label="'+U.h(L('Love this option','এই অপশনটি ভালোবাসুন'))+'">'+HEART+'<b>'+d.l[o]+'</b></button>';
  if(comOn()) out+='<button type="button" class="oscom" data-act="sOpen" data-arg="'+i+'" aria-label="'+U.h(L('Comments on this option','এই অপশনের মন্তব্য'))+'">'+BUBBLE+'<b>'+d.c[o]+'</b></button>';
  return out+'</div>';
}
function paint(){
  if(!cur) return;
  var d=cache[qid(cur)]; if(!d) return;
  var total=d.p[0]+d.p[1]+d.p[2]+d.p[3];
  var rows=document.querySelectorAll('.osoc');
  for(var k=0;k<rows.length;k++){
    var r=rows[k], o=+r.getAttribute('data-o');
    var lv=r.querySelector('.oslove');
    if(lv){ lv.classList.toggle('on',!!d.me[o]); lv.setAttribute('aria-pressed',d.me[o]?'true':'false'); lv.querySelector('b').textContent=d.l[o]; }
    var cm=r.querySelector('.oscom'); if(cm) cm.querySelector('b').textContent=d.c[o];
    var cw=r.querySelector('.oscrowd');
    /* a share of two answers means nothing, so it waits for a few */
    if(cw && total>=5){
      var pc=Math.round(100*d.p[o]/total);
      cw.hidden=false;
      cw.querySelector('i').style.width=pc+'%';
      cw.querySelector('b').textContent=L(pc+'% chose this', pc+'% এটি বেছেছে');
    }
  }
}
/* the first answer to a question is counted once, unless the student opted out */
function pick(q,resp,first){
  pending=null;
  if(!first || !live() || !window.fetch || DB.state().settings.shareStats===false) return;
  pending=post({a:'pick', q:qid(q), o:orig(q,resp), id:SITE.deviceId()}).catch(function(){});
}
function answered(q){
  if(!live() || !(loveOn()||comOn()||crowdOn()) || !window.fetch) return;
  cur=q;
  var id=qid(q), go=function(){
    return fetch('api/social.php?q='+encodeURIComponent(id)+'&id='+SITE.deviceId(),{credentials:'omit'}).then(function(r){ return r.ok?r.json():null; }).then(function(d){
      if(d && d.l){ cache[id]=d; if(cur && qid(cur)===id) paint(); }
    }).catch(function(){});
  };
  if(pending) pending.then(go); else go();
}
function love(i, btn){
  if(!cur) return;
  var id=qid(cur), o=orig(cur,+i), d=cache[id]||(cache[id]=blank()), was=d.me[o];
  d.me[o]=!was; d.l[o]=Math.max(0,d.l[o]+(was?-1:1)); paint();
  if(!was && btn) FX.pop(btn);
  FX.play('tick');
  post({a:'love', q:id, o:o, id:SITE.deviceId()}).then(function(r){
    if(r.error){ d.me[o]=was; d.l[o]=Math.max(0,d.l[o]+(was?1:-1)); paint(); UI.toast(U.h(r.error)); return; }
    if(r.l){ cache[id]=r; paint(); }
  }).catch(function(){ d.me[o]=was; d.l[o]=Math.max(0,d.l[o]+(was?1:-1)); paint(); });
}

/* ---------- the thread ---------- */
function handle(){
  var g=DB.game();
  if(g.handle) return g.handle;
  return L('Student ','শিক্ষার্থী ')+(1000+parseInt(SITE.deviceId().slice(0,4),16)%9000);
}
function open(i){
  if(!cur) return;
  var opts=AB.options(cur), o='';
  thread.q=cur;
  o+='<div class="sc"><div class="sc-tabs" role="tablist">';
  for(var k=0;k<opts.length;k++){
    o+='<button type="button" role="tab" data-act="sOpen" data-arg="'+k+'" class="'+(k===+i?'on':'')+'" aria-selected="'+(k===+i)+'">'+U.letter(k)+'</button>';
  }
  o+='</div><div class="sc-opt" lang="bn"><span class="key">'+U.letter(+i)+'</span><span>'+opts[+i]+'</span></div>'+
    '<div class="sc-list" id="scList"><p class="small">'+L('Loading&hellip;','লোড হচ্ছে&hellip;')+'</p></div>';
  if(comOn()){
    o+='<form class="sc-form" id="scForm"><textarea id="scText" maxlength="280" rows="2" placeholder="'+U.h(L('Why did you pick it, or how do you remember it?','কেন এটি বেছেছেন, বা কীভাবে মনে রাখেন?'))+'" aria-label="'+U.h(L('Your comment','আপনার মন্তব্য'))+'"></textarea>'+
      '<div class="sc-send"><input id="scName" maxlength="24" value="'+U.h(handle())+'" aria-label="'+U.h(L('Name to show','যে নাম দেখাবে'))+'"><button class="btn sm" type="submit">'+L('Post','পোস্ট')+'</button></div>'+
      '<p class="sc-err" id="scErr" hidden></p>'+
      '<p class="small">'+L('Everyone who answers this can read it. Never share your phone number or real address.','এই প্রশ্নের উত্তর দেওয়া সবাই এটি পড়তে পারবে। ফোন নম্বর বা ঠিকানা কখনও দেবেন না।')+'</p></form>';
  }
  o+='</div>';
  var sheetEl=UI.sheet(o);
  thread.o=orig(cur,+i);
  var form=sheetEl.querySelector('#scForm');
  if(form) form.addEventListener('submit', function(e){ e.preventDefault(); send(+i); });
  loadThread();
}
function loadThread(){
  var id=qid(thread.q);
  fetch('api/social.php?q='+encodeURIComponent(id)+'&id='+SITE.deviceId()+'&o='+thread.o,{credentials:'omit'}).then(function(r){ return r.json(); }).then(function(d){
    if(d.l){ cache[id]={l:d.l,me:d.me,c:d.c,p:d.p}; paint(); }
    paintList(d.list||[]);
  }).catch(function(){
    var b=document.getElementById('scList'); if(b) b.innerHTML='<p class="small">'+L('Comments need the internet.','মন্তব্যের জন্য ইন্টারনেট লাগে।')+'</p>';
  });
}
function paintList(list){
  var b=document.getElementById('scList'); if(!b) return;
  if(!list.length){ b.innerHTML='<p class="small">'+L('Nothing yet. Be the first to explain this option.','এখনও কিছু নেই। এই অপশনটি প্রথম আপনিই বুঝিয়ে দিন।')+'</p>'; return; }
  b.innerHTML=list.map(function(c){
    var av=GAME.cosmetic(c.av), ti=c.ti&&c.ti!=='none'?GAME.cosmetic(c.ti):null;
    return '<div class="scm"><span class="scav ring-'+U.h(c.fr||'plain')+'">'+(av&&av.art||'&#129417;')+'</span><div class="scb">'+
      '<div class="scw"><b>'+U.h(c.n)+'</b>'+(ti?'<i>'+U.h(ti.name)+'</i>':'')+'<span>'+U.ago(c.t*1000)+'</span>'+(c.wait?'<em>'+L('waiting for approval','অনুমোদনের অপেক্ষায়')+'</em>':'')+'</div>'+
      '<p>'+U.h(c.x)+'</p>'+
      (c.mine?'<button type="button" class="sca" data-act="sDel" data-arg="'+U.h(c.i)+'">'+L('Delete','মুছুন')+'</button>'
             :'<button type="button" class="sca" data-act="sReport" data-arg="'+U.h(c.i)+'">'+L('Report','রিপোর্ট')+'</button>')+'</div></div>';
  }).join('');
}
function send(i){
  var t=document.getElementById('scText'), n=document.getElementById('scName'), err=document.getElementById('scErr');
  var w=GAME.worn('avatar').id, f=GAME.worn('frame').id, ti=GAME.worn('title').id;
  err.hidden=true;
  post({a:'comment', q:qid(thread.q), o:thread.o, id:SITE.deviceId(), x:t.value, n:n.value, av:w, fr:f, ti:ti}).then(function(r){
    if(r.error){ err.textContent=r.error; err.hidden=false; return; }
    var g=DB.game(); g.handle=n.value.trim(); DB.save();
    t.value='';
    FX.play('coin');
    if(r.held) UI.toast(L('Posted. It appears once approved.','পোস্ট হয়েছে। অনুমোদনের পর দেখা যাবে।'));
    loadThread();
  }).catch(function(){ err.textContent=L('Could not reach the server.','সার্ভারে পৌঁছানো গেল না।'); err.hidden=false; });
}
UI.act('sLove', function(i,t){ love(i,t); });
UI.act('sOpen', function(i){ open(i); });
UI.act('sReport', function(c,t){
  post({a:'report', q:qid(thread.q), c:c, id:SITE.deviceId()}).then(function(){ t.textContent=L('Reported. Thank you.','রিপোর্ট হয়েছে। ধন্যবাদ।'); t.disabled=true; });
});
UI.act('sDel', function(c){
  post({a:'del', q:qid(thread.q), c:c, id:SITE.deviceId()}).then(function(){ loadThread(); });
});

return {row:row, pick:pick, answered:answered};
})();
