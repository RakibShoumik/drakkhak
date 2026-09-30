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

return {logo:logo, bar:bar, stars:stars, medal:medal, icon:icon};
})();
