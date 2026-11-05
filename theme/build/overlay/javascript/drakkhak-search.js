/* Drakkhak: one search box for the whole site.
   The header search keeps WoWonder's own results (people, pages, groups)
   and puts Learn's chapters on top, from dk/chapters.json (written by
   alpha/tools/export-chapters.js). A chapter opens in Learn at /learn/. */
(function(){
'use strict';
if(window.DkSearch) return;
var list=null, loading=false;
var learn=window.DK_LEARN_URL||'/learn/', theme=window.DK_THEME_URL||'';
function load(){
  if(list||loading||!window.fetch) return;
  loading=true;
  fetch(theme+'/dk/chapters.json',{credentials:'omit'}).then(function(r){ return r.ok?r.json():[]; })
    .then(function(j){ list=Array.isArray(j)?j:[]; }).catch(function(){ list=[]; });
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function hits(q){
  q=String(q||'').trim().toLowerCase();
  if(q.length<2 || !list) return [];
  var out=[];
  list.forEach(function(c){
    var hay=[c.en,c.bn,c.p].join(' ').toLowerCase(), at=hay.indexOf(q);
    if(at>=0) out.push({c:c, at:at});
  });
  out.sort(function(a,b){ return a.at-b.at; });
  return out.slice(0,4).map(function(x){ return x.c; });
}
function html(q){
  var h=hits(q);
  if(!h.length) return '';
  return '<div class="dk-sres"><div class="dk-sres-h">Chapters in Learn</div>'+h.map(function(c){
    return '<a class="dk-sres-i" href="'+esc(learn)+'#/topic/'+encodeURIComponent(c.id)+'"><span class="dk-sres-ic" aria-hidden="true"></span>'+
      '<span class="dk-sres-t"><b>'+esc(c.en)+'</b><small>'+esc(c.p)+' &middot; Chapter '+c.n+'</small></span></a>';
  }).join('')+'</div>';
}
document.addEventListener('focusin', function(e){ if(e.target && e.target.classList && e.target.classList.contains('search-input')) load(); });
setTimeout(load, 4000);
window.DkSearch={html:html, load:load, hits:hits};
})();
