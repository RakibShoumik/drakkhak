/* ===========================================================
   CHARTS — the small drawn pieces: the two logos, the bars, the
   medals and the icons.

   The logo sprites (#bubblesSym, #logoSym) live in index.html, so the
   browser draws them once. Colours come from CSS variables, so both
   follow day and night.
   =========================================================== */
var CHARTS = (function(){

/* the default logo is four answer bubbles with the third ticked; the old
   one is the stacked-cards দ্র. Settings → Logo chooses. */
function logo(kind, cls){
  kind = kind || DB.state().logo || 'bubbles';
  return kind==='cards'
    ? '<svg class="logo logo-cards '+(cls||'')+'" viewBox="0 0 64 64" aria-hidden="true"><use href="#logoSym"/></svg>'
    : '<svg class="logo logo-bubbles '+(cls||'')+'" viewBox="0 0 112 28" aria-hidden="true"><use href="#bubblesSym"/></svg>';
}

/* a thin or thick progress bar; p is 0..1 */
function bar(p, cls, colour){
  var w=Math.round(U.clamp(p,0,1)*1000)/10;
  if(p>0 && w<1.5) w=1.5;
  return '<span class="bar '+(cls||'')+'"><i style="width:'+w+'%'+(colour?';background:'+colour:'')+'"></i></span>';
}

/* three small stars, n of them lit */
function stars(n){
  var o='<span class="stars" aria-label="'+N(n)+'/'+N(3)+'">';
  for(var i=0;i<3;i++) o+='<i class="'+(i<n?'on':'')+'" style="--i:'+i+'">&#9733;</i>';
  return o+'</span>';
}

/* a badge medal: earned ones are filled */
function medal(b, earned){
  return '<span class="medal'+(earned?' on':'')+'" aria-hidden="true"><b>'+U.h(STATS.markText(b))+'</b></span>';
}

/* 24px line icons for the tab bar */
var ICONS={
  start:'<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/>',
  practice:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12.5 3 3 5-6"/>',
  map:'<path d="M5 20c0-5 14-4 14-9s-9-3-9-7"/><circle cx="5" cy="20" r="1.6"/><circle cx="10" cy="4" r="1.6"/>',
  progress:'<path d="M5 20V11M12 20V5M19 20v-6"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>'
};
function icon(name){
  return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+(ICONS[name]||'')+'</svg>';
}

/* a progress ring; p is 0..1. The centre is left for the caller's text. */
function ring(p, size, cls, inner){
  size=size||64;
  var r=(size-8)/2, c=2*Math.PI*r, off=c*(1-U.clamp(p,0,1));
  return '<span class="ring '+(cls||'')+'" style="width:'+size+'px;height:'+size+'px">'+
    '<svg viewBox="0 0 '+size+' '+size+'"><circle class="rb" cx="'+size/2+'" cy="'+size/2+'" r="'+r+'"/>'+
    '<circle class="rf" cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/></svg>'+
    (inner?'<span class="ri">'+inner+'</span>':'')+'</span>';
}

/* a landmark for each subject: a book, a letter, a screen, an atom,
   a flask, a leaf and a sigma. The map and the subject tiles share them. */
var LANDMARK={
  bangla:'<path d="M4 6c3-1.5 6-1.5 8 .5 2-2 5-2 8-.5v12c-3-1.5-6-1.5-8 .5-2-2-5-2-8-.5Z"/><path d="M12 6.5v12"/>',
  english:'<path d="M5 19 12 5l7 14M8 14h8"/>',
  ict:'<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M9 20h6M12 16v4"/>',
  phy:'<ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.4"/>',
  chem:'<path d="M9 4h6M10 4v6l-4.5 8a1.6 1.6 0 0 0 1.4 2.4h10.2a1.6 1.6 0 0 0 1.4-2.4L14 10V4"/><path d="M8 15h8"/>',
  bio:'<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14Z"/><path d="M5 19 13 11"/>',
  hmath:'<path d="M18 5H8l5 7-5 7h10"/>'
};
function landmark(sj, cls){
  return '<svg class="'+(cls||'lm')+'" viewBox="0 0 24 24" aria-hidden="true">'+(LANDMARK[sj]||'')+'</svg>';
}

return {ring:ring, landmark:landmark, logo:logo, bar:bar, stars:stars, medal:medal, icon:icon};
})();
