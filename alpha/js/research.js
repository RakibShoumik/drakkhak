/* ===========================================================
   RESEARCH — how Drakkhak works, and the evidence behind each part.

   The page is laid out like a technical specification: a caution
   first (what the app cannot do), then one numbered section per
   mechanism, each with a plate. The plates come in two hands:
   patent drawings (black line on white, numbered parts, FIG. n) for
   the mechanical parts of the method, and notebook sketches (sepia
   ink, handwritten notes) for the ideas about memory underneath them.

   Every study cited is real and is listed with its year and journal.
   The drawings are illustrations of the idea, not data.
   =========================================================== */
var RESEARCH = (function(){

var PINK='#111', SEPIA='#6B4423';

/* ---------- drawing helpers ---------- */
function plate(kind, fig, title, inner, w, hgt){
  w=w||600; hgt=hgt||360;
  var o='<figure class="plate '+kind+'"><svg viewBox="0 0 '+w+' '+hgt+'" role="img" aria-label="'+U.h(title)+'">';
  if(kind==='patent'){
    o+='<rect x="6" y="6" width="'+(w-12)+'" height="'+(hgt-12)+'" class="pframe"/>'+inner+
       '<text x="24" y="'+(hgt-20)+'" class="pfig">FIG. '+fig+'</text>'+
       '<text x="'+(w-24)+'" y="'+(hgt-20)+'" class="psheet" text-anchor="end">'+U.h(title)+'</text></svg>';
  } else {
    o+='<rect x="0" y="0" width="'+w+'" height="'+hgt+'" class="sbg"/>'+
       '<rect x="10" y="10" width="'+(w-20)+'" height="'+(hgt-20)+'" class="sframe"/>'+inner+'</svg>'+
       '<figcaption class="hand-cap">fol. '+fig+' &mdash; '+U.h(title)+'</figcaption>';
  }
  return o+'</figure>';
}
/* a numbered part: a leader with a small curl, the italic number, and its
   name beside it ("|" breaks the name onto a second line) */
function part(x1,y1,x2,y2,n,anchor,label){
  var end = anchor==='end';
  var mx=(x1+x2)/2+(y2-y1)*0.12, my=(y1+y2)/2-(x2-x1)*0.12;
  var nx = end ? x2-4 : x2+4, ny=y2+4;
  var o='<path d="M'+x1+' '+y1+' Q'+mx.toFixed(1)+' '+my.toFixed(1)+' '+x2+' '+y2+'" class="lead"/>'+
        '<circle cx="'+x1+'" cy="'+y1+'" r="1.8" class="dot"/>'+
        '<text x="'+nx+'" y="'+ny+'" class="pnum"'+(end?' text-anchor="end"':'')+'>'+n+'</text>';
  if(label){
    var lx = end ? nx-String(n).length*8.5-6 : nx+String(n).length*8.5+6;
    var lines=String(label).split('|');
    o+='<text x="'+lx+'" y="'+(ny-1)+'" class="plab"'+(end?' text-anchor="end"':'')+'>';
    lines.forEach(function(t, i){ o+='<tspan x="'+lx+'" dy="'+(i?13:0)+'">'+t+'</tspan>'; });
    o+='</text>';
  }
  return o;
}
function hatch(id, ang, gap, cls){
  return '<defs><pattern id="'+id+'" patternUnits="userSpaceOnUse" width="'+(gap||6)+'" height="'+(gap||6)+'" patternTransform="rotate('+(ang||45)+')">'+
    '<line x1="0" y1="0" x2="0" y2="'+(gap||6)+'" class="'+(cls||'hl')+'"/></pattern></defs>';
}
/* a gear: a toothed rim drawn as a thick dashed circle, a hub and spokes */
function gear(cx,cy,r,teeth){
  var c=2*Math.PI*(r+3), dash=(c/teeth/2).toFixed(2);
  var o='<circle cx="'+cx+'" cy="'+cy+'" r="'+(r+3)+'" class="teeth" stroke-dasharray="'+dash+' '+dash+'"/>'+
        '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" class="pl"/><circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.28).toFixed(1)+'" class="pl"/>';
  for(var i=0;i<5;i++){ var a=i*Math.PI*2/5; o+='<line x1="'+(cx+Math.cos(a)*r*0.28).toFixed(1)+'" y1="'+(cy+Math.sin(a)*r*0.28).toFixed(1)+'" x2="'+(cx+Math.cos(a)*r*0.92).toFixed(1)+'" y2="'+(cy+Math.sin(a)*r*0.92).toFixed(1)+'" class="pl"/>'; }
  return o;
}
function note(x,y,t,cls,rot){ return '<text x="'+x+'" y="'+y+'" class="hand'+(cls?' '+cls:'')+'"'+(rot?' transform="rotate('+rot+' '+x+' '+y+')"':'')+'>'+t+'</text>'; }
/* Leonardo wrote his notes backwards; one line on each sketch does too */
function mirror(x,y,t){ return '<text x="'+x+'" y="'+y+'" class="hand mirror" transform="translate('+(2*x)+' 0) scale(-1 1)">'+t+'</text>'; }

/* ---------- the thirteen plates ---------- */
var FIG={};

FIG[1]=function(){ return plate('patent',1,'Retrieval engine',
  hatch('h1')+
  '<path d="M60 40 L190 40 L158 112 L92 112 Z" class="pl"/>'+
  '<rect x="84" y="52" width="34" height="22" class="pl" transform="rotate(-12 101 63)"/><rect x="118" y="58" width="34" height="22" class="pl" transform="rotate(9 135 69)"/>'+
  '<path d="M110 112 L110 150 L140 168" class="pl"/><path d="M140 112 L140 140" class="pl"/>'+
  gear(185,200,40,18)+gear(262,168,26,12)+
  '<line x1="185" y1="200" x2="120" y2="262" class="pl thick"/><circle cx="120" cy="262" r="8" class="pl"/>'+
  '<path d="M288 168 L352 168 L352 232" class="pl"/>'+
  '<path d="M330 232 L480 232 L470 258 L340 258 Z" class="pl"/><rect x="372" y="214" width="44" height="26" class="pl" transform="rotate(-6 394 227)"/>'+
  '<path d="M480 245 L520 245 L520 146" class="pl"/>'+
  '<circle cx="520" cy="122" r="22" class="pl"/><path d="M510 128 L516 136 L532 112" class="pl"/>'+
  '<line x1="520" y1="88" x2="520" y2="76" class="pl"/><line x1="548" y1="100" x2="557" y2="92" class="pl"/><line x1="492" y1="100" x2="483" y2="92" class="pl"/>'+
  '<rect x="40" y="292" width="520" height="12" fill="url(#h1)" class="pl"/>'+
  '<line x1="185" y1="244" x2="185" y2="292" class="pl"/><line x1="352" y1="258" x2="352" y2="292" class="pl"/><line x1="520" y1="258" x2="520" y2="292" class="pl"/>'+
  part(172,50,212,30,'10','start','question bank')+
  part(214,186,262,108,'12','start','recall: the effort|of remembering')+
  part(120,262,160,322,'18','start','the student turns the crank')+
  part(440,250,452,284,'14','start','answer')+
  part(540,122,560,174,'16','end','verdict lamp'));
};
FIG[2]=function(){ return plate('sketch',2,'Of memory and its fading',
  '<path d="M70 44 C69 120 71 220 70 300 L566 301" class="ink"/>'+
  '<path d="M72 64 C120 170 200 262 560 290" class="ink faint dash"/>'+
  '<path d="M72 62 C98 120 124 170 150 196 L151 64 C190 118 230 142 270 152 L271 64 C330 96 380 108 420 112 L421 64 C480 76 520 82 560 86" class="ink bold"/>'+
  note(158,56,'day 1')+note(276,56,'day 4')+note(426,56,'day 12')+note(512,54,'day 30')+
  note(120,284,'no return: gone within the week','',4)+
  note(84,332,'each return comes a little later, and the trace fades a little slower','sm')+
  mirror(470,150,'memoria')+
  '<path d="M504 168 C476 168 460 186 460 210 L454 222 L448 234 L456 238 L455 246 L459 250 L456 256 C458 266 466 270 474 270 L478 288 M504 168 C532 168 550 188 550 212 C550 232 542 246 532 254 L530 288" class="ink"/>'+
  '<path d="M478 196 C492 186 512 188 522 198 M474 212 C488 204 506 206 516 214 M492 226 C504 220 520 224 528 232" class="ink faint"/>');
};
FIG[3]=function(){ return plate('patent',3,'Two-key release',
  hatch('h3',45,5)+
  '<path d="M190 80 L410 80 L440 60 L220 60 Z" class="pl"/><path d="M410 80 L440 60 L440 270 L410 290 Z" fill="url(#h3)" class="pl"/>'+
  '<rect x="190" y="80" width="220" height="210" class="pl"/>'+
  '<rect x="276" y="52" width="48" height="10" class="pl"/><rect x="282" y="18" width="36" height="40" class="pl"/><text x="300" y="44" class="plab" text-anchor="middle">DONE</text>'+
  '<circle cx="250" cy="185" r="12" class="pl"/><rect x="246" y="185" width="8" height="18" class="pl"/>'+
  '<circle cx="350" cy="185" r="12" class="pl"/><rect x="346" y="185" width="8" height="18" class="pl"/>'+
  '<line x1="214" y1="150" x2="386" y2="150" class="pl thick"/>'+
  '<circle cx="110" cy="190" r="20" class="pl"/><rect x="128" y="186" width="100" height="8" class="pl"/><path d="M200 194 L200 204 L210 204 L210 194" class="pl"/>'+
  '<circle cx="492" cy="190" r="20" class="pl"/><rect x="372" y="186" width="100" height="8" class="pl"/><path d="M390 194 L390 204 L400 204 L400 194" class="pl"/>'+
  '<circle cx="520" cy="96" r="24" class="pl"/><line x1="520" y1="96" x2="520" y2="80" class="pl"/><line x1="520" y1="96" x2="532" y2="104" class="pl"/>'+
  part(110,210,176,262,'20','end','key A: right,|inside the minute')+
  part(492,210,584,304,'22','end','key B: right again|on a later day')+
  part(300,150,304,124,'24','start','latch')+
  part(318,36,352,32,'26','start','the question is done')+
  part(520,120,560,150,'28','end','at least|16 hours'));
};
FIG[4]=function(){ return plate('patent',4,'Difficulty governor',
  hatch('h4',-45,5)+
  '<line x1="300" y1="30" x2="300" y2="300" class="pl thick"/>'+
  '<line x1="300" y1="70" x2="222" y2="160" class="pl"/><line x1="300" y1="70" x2="378" y2="160" class="pl"/>'+
  '<circle cx="222" cy="160" r="20" fill="url(#h4)" class="pl"/><circle cx="378" cy="160" r="20" fill="url(#h4)" class="pl"/>'+
  '<line x1="222" y1="160" x2="292" y2="210" class="pl"/><line x1="378" y1="160" x2="308" y2="210" class="pl"/>'+
  '<rect x="286" y="204" width="28" height="22" class="pl"/>'+
  '<path d="M314 216 L430 216 L430 236" class="pl"/><rect x="410" y="236" width="80" height="34" class="pl"/><path d="M430 253 L470 253" class="pl"/><circle cx="450" cy="253" r="9" class="pl"/>'+
  gear(300,286,16,12)+
  '<text x="500" y="250" class="plab">&larr; easy</text><text x="500" y="264" class="plab">&rarr; hard</text>'+
  part(206,150,178,98,'30','end','flyballs: your|ability estimate')+
  part(290,222,236,262,'32','end','set point: about 60%|right (85% in easy flow)')+
  part(470,236,560,196,'34','end','difficulty valve')+
  part(300,120,344,92,'36','start','turned by your answers'));
};
FIG[5]=function(){
  var s='', ph=[0, 2.094, 4.188], names=['chapter A','chapter B','chapter C'], i, x;
  for(i=0;i<3;i++){
    var d='';
    for(x=60;x<=540;x+=6){ var y=150+34*Math.sin(x/34+ph[i]); d+=(x===60?'M':' L')+x+' '+y.toFixed(1); }
    s+='<path d="'+d+'" class="ink strand s'+i+'"/>';
  }
  var blk='';
  for(i=0;i<3;i++){ blk+='<line x1="'+(80+i*160)+'" y1="270" x2="'+(210+i*160)+'" y2="270" class="ink strand s'+i+'"/>'+note(112+i*160,258,names[i],'sm'); }
  return plate('sketch',5,'Of weaving the chapters', s+
    note(70,80,'woven: A, B, C, A, C, B &hellip;')+note(360,80,'harder today, stronger on exam day','sm',-3)+
    blk+note(66,322,'blocked: all of A, then all of B &mdash; easier today, weaker later','sm')+mirror(510,222,'intrecciare'));
};
FIG[6]=function(){
  var slots='';
  for(var i=0;i<16;i++) slots+='<rect x="'+(92+i*26)+'" y="262" width="20" height="26" class="pl'+(i<13?'':' fillh')+'"/>';
  return plate('patent',6,'Set composer',
    hatch('h6',45,5)+
    '<path d="M70 50 L250 50 L220 160 L100 160 Z" class="pl"/><path d="M360 70 L480 70 L462 150 L378 150 Z" fill="url(#h6)" class="pl"/>'+
    '<path d="M160 160 L200 230 M420 150 L380 230" class="pl"/><path d="M180 230 L400 230 L380 252 L200 252 Z" class="pl"/>'+
    gear(300,120,30,13)+gear(300,58,14,5)+
    slots+
    part(120,70,44,28,'40','start','never seen')+
    part(470,90,560,40,'42','end','due back, to review')+
    part(328,124,380,196,'46','start','ratio gear 13 : 3')+
    part(500,276,560,318,'44','end','a set of 16: 13 new'));
};
FIG[7]=function(){ return plate('sketch',7,'Of the lamp that answers',
  '<path d="M250 70 L350 70 L338 92 L262 92 Z M262 92 C240 120 240 210 262 240 L338 240 C360 210 360 120 338 92 M270 240 L330 240 L322 268 L278 268 Z" class="ink"/>'+
  '<path d="M300 52 L300 70 M284 40 C290 30 310 30 316 40" class="ink"/>'+
  '<path d="M292 200 C280 176 296 160 300 140 C306 160 322 176 308 200 C304 208 296 208 292 200 Z" class="ink bold"/>'+
  '<path d="M300 114 L300 98 M364 150 L384 142 M236 150 L216 142 M360 204 L380 212 M240 204 L220 212" class="ink faint"/>'+
  note(52,118,'right: a chime and green')+note(52,144,'wrong: a low tone,')+note(52,168,'and the right one shown')+
  note(396,110,'why &mdash; only when asked','sm')+note(396,136,'a confident error','sm')+note(396,158,'is corrected hardest','sm')+
  note(96,322,'the answer, then the reason; never a lecture first','sm')+mirror(470,250,'lume'));
};
FIG[8]=function(){
  var ticks='';
  for(var i=0;i<12;i++){ var a=i*Math.PI/6; ticks+='<line x1="'+(230+Math.cos(a)*84).toFixed(1)+'" y1="'+(196+Math.sin(a)*84).toFixed(1)+'" x2="'+(230+Math.cos(a)*96).toFixed(1)+'" y2="'+(196+Math.sin(a)*96).toFixed(1)+'" class="pl"/>'; }
  return plate('patent',8,'Paper-pace clock',
    '<circle cx="230" cy="196" r="104" class="pl"/><circle cx="230" cy="196" r="96" class="pl"/>'+ticks+
    '<rect x="220" y="72" width="20" height="18" class="pl"/><rect x="214" y="58" width="32" height="14" class="pl"/>'+
    '<line x1="230" y1="196" x2="290" y2="140" class="pl thick"/><circle cx="230" cy="196" r="6" class="pl"/>'+
    gear(230,196,26,10)+
    '<path d="M334 180 L420 150" class="pl"/><path d="M430 110 C430 84 480 84 480 110 L490 150 L420 150 Z" class="pl"/><circle cx="455" cy="160" r="7" class="pl"/>'+
    '<line x1="412" y1="120" x2="400" y2="104" class="pl"/><line x1="500" y1="120" x2="512" y2="104" class="pl"/>'+
    part(252,178,344,250,'56','start','escapement')+
    part(268,154,330,40,'50','start','sixty-second train')+
    part(470,98,560,62,'52','end','time-up bell')+
    part(222,64,204,30,'54','end','crown: the Timer switch'));
};
FIG[9]=function(){ return plate('sketch',9,'Of the worked example',
  '<path d="M60 90 C160 70 240 76 296 96 L296 300 C240 282 160 276 60 296 Z M296 96 C352 76 440 70 540 90 L540 296 C440 276 352 282 296 300" class="ink"/>'+
  '<path d="M296 96 L296 300" class="ink bold"/>'+
  note(84,122,'the key point, in one line')+'<path d="M84 136 L260 132 M84 158 L250 154 M84 180 L236 177" class="ink faint"/>'+
  '<rect x="84" y="200" width="180" height="70" class="ink faint"/>'+note(94,222,'example:','sm')+note(94,246,'(37)&#8321;&#8320; = (100101)&#8322;','sm')+
  note(318,122,'answer, and the reason')+'<path d="M318 140 L500 144 M318 162 L490 166" class="ink faint"/>'+
  '<path d="M330 214 L352 238 L396 186" class="ink bold"/>'+note(408,232,'then do it yourself','sm')+
  note(110,332,'first see it done; then do it, again and again','sm')+mirror(480,272,'esempio'));
};
FIG[10]=function(){
  var st='', nums=[126,125,124,123,122,121,120];
  for(var i=0;i<7;i++){ var x=60+i*62, y=80+i*30; st+='<path d="M'+x+' '+y+' L'+(x+62)+' '+y+' L'+(x+62)+' '+(y+30)+'" class="pl"/><text x="'+(x+18)+'" y="'+(y-6)+'" class="plab">'+nums[i]+'</text>'; }
  return plate('patent',10,'Days-left counter', st+
    '<circle cx="160" cy="92" r="7" class="pl"/><path d="M160 99 L160 118 M150 106 L170 106 M160 118 L152 132 M160 118 L168 132" class="pl"/>'+
    '<rect x="420" y="30" width="140" height="56" class="pl"/><rect x="432" y="40" width="36" height="36" class="pl"/><rect x="472" y="40" width="36" height="36" class="pl"/><rect x="512" y="40" width="36" height="36" class="pl"/>'+
    '<text x="450" y="66" class="pbig" text-anchor="middle">1</text><text x="490" y="66" class="pbig" text-anchor="middle">2</text><text x="530" y="66" class="pbig" text-anchor="middle">6</text>'+
    '<path d="M430 118 l8 16 18 3 -13 12 3 18 -16 -9 -16 9 3 -18 -13 -12 18 -3 z" class="pl"/><path d="M480 118 l8 16 18 3 -13 12 3 18 -16 -9 -16 9 3 -18 -13 -12 18 -3 z" class="pl"/><path d="M530 118 l8 16 18 3 -13 12 3 18 -16 -9 -16 9 3 -18 -13 -12 18 -3 z" class="pl fillh"/>'+
    part(418,58,370,26,'60','end','days left')+
    part(214,166,254,236,'62','end','each done question:|one step down')+
    part(530,168,560,206,'64','end','stars at 1/3,|2/3 and all'));
};
FIG[11]=function(){ return plate('patent',11,'Cautious balance',
  hatch('h11',45,5)+
  '<path d="M300 300 L300 90" class="pl thick"/><path d="M270 300 L330 300 L316 286 L284 286 Z" fill="url(#h11)" class="pl"/>'+
  '<line x1="140" y1="112" x2="460" y2="76" class="pl thick"/><circle cx="300" cy="94" r="7" class="pl"/>'+
  '<path d="M300 94 L300 60 L292 70 M300 60 L308 70" class="pl"/>'+
  '<line x1="150" y1="111" x2="120" y2="190" class="pl"/><line x1="150" y1="111" x2="182" y2="190" class="pl"/><path d="M104 190 L198 190 C196 206 106 206 104 190 Z" class="pl"/>'+
  '<line x1="450" y1="77" x2="418" y2="156" class="pl"/><line x1="450" y1="77" x2="482" y2="156" class="pl"/><path d="M402 156 L498 156 C496 172 404 172 402 156 Z" class="pl"/>'+
  '<rect x="128" y="160" width="46" height="30" class="pl fillh"/>'+
  '<rect x="408" y="140" width="16" height="16" class="pl"/><rect x="428" y="134" width="16" height="22" class="pl"/><rect x="448" y="142" width="14" height="14" class="pl"/><rect x="466" y="136" width="16" height="20" class="pl"/>'+
  part(150,176,214,246,'70','end','what your answers say')+
  part(460,168,560,212,'72','end','charges: uncertainty,|untested chapters, speed,|untimed answers, the hall')+
  part(300,62,344,30,'74','start','reads the 10th percentile'));
};
FIG[12]=function(){ return plate('sketch',12,'Of rest and a good ending',
  '<path d="M180 50 L300 50 M180 300 L300 300 M192 50 C192 130 286 150 240 175 C194 200 192 220 192 300 M288 50 C288 130 194 150 240 175 C286 200 288 220 288 300" class="ink"/>'+
  '<path d="M214 96 C228 120 252 120 266 96 Z M204 290 C220 256 260 256 276 290 Z" class="ink bold"/><path d="M240 175 L240 255" class="ink faint dash"/>'+
  '<circle cx="430" cy="100" r="14" class="ink"/><path d="M430 114 L430 186 M430 130 L400 100 M430 130 L460 100 M430 186 L410 240 M430 186 L450 240" class="ink"/>'+
  note(360,268,'after 45 minutes:')+note(360,292,'stand, look far away')+
  note(40,120,'sixteen at a time','sm')+note(40,146,'the set never','sm')+note(40,168,'starts by itself','sm')+
  note(40,332,'never end on a miss: one gentler question closes the set','sm')+mirror(520,64,'riposo'));
};
FIG[13]=function(){ return plate('patent',13,'Honest mint',
  hatch('h13',45,5)+
  '<rect x="200" y="200" width="200" height="90" class="pl"/><rect x="200" y="290" width="200" height="12" fill="url(#h13)" class="pl"/>'+
  '<rect x="270" y="80" width="60" height="120" class="pl"/><line x1="300" y1="80" x2="300" y2="40" class="pl thick"/><line x1="300" y1="40" x2="400" y2="30" class="pl thick"/><circle cx="410" cy="29" r="10" class="pl"/>'+
  '<ellipse cx="300" cy="206" rx="22" ry="6" class="pl"/>'+
  '<path d="M60 170 L200 230" class="pl"/><path d="M60 158 L200 218" class="pl"/>'+
  '<ellipse cx="470" cy="276" rx="26" ry="7" class="pl"/><ellipse cx="470" cy="266" rx="26" ry="7" class="pl"/><ellipse cx="470" cy="256" rx="26" ry="7" class="pl"/>'+
  '<rect x="60" y="252" width="44" height="36" class="pl"/><path d="M70 252 L70 238 C70 222 94 222 94 238 L94 252" class="pl"/><line x1="52" y1="296" x2="112" y2="244" class="pl"/>'+
  '<path d="M430 120 m-14 0 a14 9 0 1 0 28 0 a14 9 0 1 0 -28 0 M452 120 m-14 0 a14 9 0 1 0 28 0 a14 9 0 1 0 -28 0 M474 120 m-14 0 a14 9 0 1 0 28 0 a14 9 0 1 0 -28 0" class="pl"/>'+
  part(90,172,150,124,'80','end','right answers in')+
  part(470,256,560,228,'82','end','coins')+
  part(104,272,130,322,'84','start','money: not accepted')+
  part(474,112,560,82,'86','end','streak, with freezes')+
  part(300,140,346,160,'88','start','die: pays by difficulty'));
};

/* ---------- the text ---------- */
function S(n, fig, en, bn){ return {n:n, fig:fig, en:en, bn:bn}; }
var SECTIONS=[
  S(1,1,{t:'Questions first: retrieval practice',
     what:'Every screen leads to a question. You answer before you are told anything, and you see the verdict within a quarter of a second.',
     why:'Pulling a fact out of memory strengthens it far more than reading it again. In the classic study, students who were tested on a passage remembered much more of it a week later than students who spent the same time re-reading it. Practice testing is one of only two techniques rated "high utility" in the largest review of study methods.',
     src:['Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. <i>Psychological Science</i>, 17(3).','Karpicke, J. D., & Blunt, J. R. (2011). Retrieval practice produces more learning than elaborative studying with concept mapping. <i>Science</i>, 331.','Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. <i>Psychological Science in the Public Interest</i>, 14(1).']},
    {t:'আগে প্রশ্ন: স্মৃতি থেকে তুলে আনা',
     what:'প্রতিটি পাতা একটি প্রশ্নের দিকে নিয়ে যায়। কিছু বলার আগেই আপনি উত্তর দেন, আর সেকেন্ডের এক-চতুর্থাংশে ফল দেখেন।',
     why:'স্মৃতি থেকে কোনো তথ্য টেনে আনা সেটিকে আবার পড়ার চেয়ে অনেক বেশি পাকা করে। পরীক্ষা দিয়ে পড়া শিক্ষার্থীরা এক সপ্তাহ পরে অনেক বেশি মনে রাখে।'}),
  S(2,2,{t:'Spaced repetition: coming back just before you forget',
     what:'A question you miss is scheduled to return: first after about a day, then after longer and longer gaps (roughly 1, 4, 12 and 30 days once you get it right). Finished chapters also return now and then.',
     why:'Memories fade on a curve, and each well-timed return makes the next fade slower. Across hundreds of experiments, spreading practice out beats cramming the same amount into one sitting, and the best gap grows with how long you need to remember.',
     src:['Ebbinghaus, H. (1885). <i>Über das Gedächtnis</i> (Memory: A Contribution to Experimental Psychology).','Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. <i>Psychological Bulletin</i>, 132(3).','Leitner, S. (1972). <i>So lernt man lernen</i>.']},
    {t:'ফিরে ফিরে আসা: ভুলে যাওয়ার ঠিক আগে',
     what:'ভুল করা প্রশ্ন নির্দিষ্ট দিনে ফিরে আসে: প্রথমে প্রায় এক দিন পরে, তারপর ক্রমশ লম্বা বিরতিতে। শেষ করা অধ্যায়ও মাঝে মাঝে ফেরে।',
     why:'স্মৃতি একটি বাঁকা রেখায় মুছে যায়, আর ঠিক সময়ে প্রতিটি ফেরা পরের মুছে যাওয়াকে ধীর করে। একবারে গাদাগাদি পড়ার চেয়ে ছড়িয়ে পড়া অনেক ভালো কাজ করে।'}),
  S(3,3,{t:'"Done" means right on a later day',
     what:'A question only counts as done — and only then shortens your days left — when you get it right inside its minute. If you ever missed it, it must be right again at least 16 hours later.',
     why:'Getting something right straight after seeing the answer measures short-term memory, not learning. Relearning a fact across separate sessions, until you recall it correctly more than once, is what makes it last; the extra sessions cost little and pay back heavily weeks later.',
     src:['Rawson, K. A., & Dunlosky, J. (2011). Optimizing schedules of retrieval practice for durable and efficient learning: How much is enough? <i>Journal of Experimental Psychology: General</i>, 140(3).','Bjork, R. A., & Bjork, E. L. (1992). A new theory of disuse and an old theory of stimulus fluctuation. In <i>From Learning Processes to Cognitive Processes</i>.']},
    {t:'"শেষ" মানে পরের দিনেও ঠিক',
     what:'একটি প্রশ্ন শেষ বলে গোনা হয় কেবল তখনই, যখন সেটি তার বাঁধা সময়ের ভিতরে ঠিক হয়; কখনও ভুল হয়ে থাকলে অন্তত ১৬ ঘণ্টা পরে আবার ঠিক হতে হবে।',
     why:'উত্তর দেখার সাথে সাথে পারা মানে স্বল্পমেয়াদি স্মৃতি, শেখা নয়। আলাদা আলাদা দিনে একাধিকবার ঠিক করাই তথ্যকে টেকসই করে।'}),
  S(4,4,{t:'Desirable difficulty: questions pitched just above you',
     what:'For every chapter the app keeps an estimate of your ability (an item-response model), and picks questions you should get right about 60% of the time at board level — or about 85% in the "easy flow" setting. One question in four is a stretch.',
     why:'Practice that feels easy is often the least useful; conditions that slow you down a little tend to produce stronger, more transferable learning. A mathematical analysis of learning systems found that training is fastest when success runs at roughly 85%.',
     src:['Bjork, R. A. (1994). Memory and metamemory considerations in the training of human beings. In <i>Metacognition: Knowing about Knowing</i>. MIT Press.','Wilson, R. C., Shenhav, A., Straccia, M., & Cohen, J. D. (2019). The Eighty Five Percent Rule for optimal learning. <i>Nature Communications</i>, 10.','Rasch, G. (1960). <i>Probabilistic Models for Some Intelligence and Attainment Tests</i>.']},
    {t:'কাজের কাঠিন্য: আপনার একটু ওপরে বাঁধা প্রশ্ন',
     what:'প্রতিটি অধ্যায়ে অ্যাপ আপনার মানের একটি হিসাব রাখে, আর এমন প্রশ্ন বাছে যেগুলো বোর্ড মানে প্রায় ৬০% বার ঠিক হওয়ার কথা (সহজ স্রোতে প্রায় ৮৫%)।',
     why:'যে অনুশীলন সহজ লাগে তা প্রায়ই সবচেয়ে কম কাজের; একটু কঠিন অবস্থাই শেখাকে বেশি টেকসই করে।'}),
  S(5,5,{t:'Interleaving: the chapters are woven, not stacked',
     what:'An ordinary set mixes up to three chapters from the front of your path, plus reviews. The path itself weaves the eleven papers together rather than finishing one before starting the next.',
     why:'Mixing kinds of problems forces you to decide which idea each one needs — exactly what the exam demands. In controlled studies, shuffled practice felt harder and scored lower during practice, but beat blocked practice clearly on the later test.',
     src:['Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. <i>Instructional Science</i>, 35.','Kornell, N., & Bjork, R. A. (2008). Learning concepts and categories: Is spacing the "enemy of induction"? <i>Psychological Science</i>, 19(6).']},
    {t:'মিশিয়ে পড়া: অধ্যায়গুলো বোনা, স্তূপ করা নয়',
     what:'একটি সাধারণ সেটে পথের সামনের তিনটি পর্যন্ত অধ্যায় মেশানো থাকে, সাথে রিভিউ। পথটিও এগারোটি পত্রকে বুনে নেয়।',
     why:'মেশানো প্রশ্নে প্রতিবার ঠিক করতে হয় কোন ধারণা লাগবে — পরীক্ষাও ঠিক এটাই চায়। অনুশীলনে কঠিন লাগলেও পরের পরীক্ষায় এটি স্পষ্টভাবে এগিয়ে থাকে।'}),
  S(6,6,{t:'New ground first: more than three quarters new',
     what:'While you still have questions you have never seen, at least 13 of every 16 in a set are new. Review and retries share the remaining three or so.',
     why:'The exam samples the whole syllabus, so coverage comes before polish. Repeating what you already know well brings rapidly shrinking returns — extra practice beyond mastery in a single session adds little that lasts — while every unseen question is new ground. Spaced review still happens, just in its proper share.',
     src:['Rohrer, D., Taylor, K., Pashler, H., Wixted, J. T., & Cepeda, N. J. (2005). The effect of overlearning on long-term retention. <i>Applied Cognitive Psychology</i>, 19(3).','Kornell, N., Hays, M. J., & Bjork, R. A. (2009). Unsuccessful retrieval attempts enhance subsequent learning. <i>Journal of Experimental Psychology: Learning, Memory, and Cognition</i>, 35(4).']},
    {t:'আগে নতুন জমি: তিন-চতুর্থাংশের বেশি নতুন',
     what:'না-দেখা প্রশ্ন থাকলে প্রতি ১৬টির অন্তত ১৩টি নতুন। রিভিউ আর আবার চেষ্টা বাকিটুকু ভাগ করে নেয়।',
     why:'পরীক্ষা পুরো সিলেবাস থেকে প্রশ্ন নেয়, তাই আগে সবটা ছোঁয়া, পরে ঘষামাজা। যা ভালো জানেন তা বারবার করা দ্রুত কম ফল দেয়।'}),
  S(7,7,{t:'Feedback you can act on — and why only when asked',
     what:'Right is a chime and green; wrong is a low tone with the right option marked. The explanation — why your choice tempted you, why the right one is right, and one line to remember — opens only if you ask. If you said you were sure and were wrong, that is marked.',
     why:'Feedback works best when it tells you where you stand and what to do next, and when it arrives right after the attempt. Errors made with high confidence, once corrected, are remembered especially well; feedback also rescues right answers you were unsure of.',
     src:['Hattie, J., & Timperley, H. (2007). The power of feedback. <i>Review of Educational Research</i>, 77(1).','Butterfield, B., & Metcalfe, J. (2001). Errors committed with high confidence are hypercorrected. <i>Journal of Experimental Psychology: Learning, Memory, and Cognition</i>, 27(6).','Butler, A. C., Karpicke, J. D., & Roediger, H. L. (2008). Correcting a metacognitive error: Feedback increases retention of low-confidence correct responses. <i>JEP: Learning, Memory, and Cognition</i>, 34(4).']},
    {t:'কাজে লাগানোর মতো ফলাফল — আর ব্যাখ্যা কেবল চাইলে',
     what:'ঠিক হলে টোকা আর সবুজ; ভুল হলে নিচু সুর, সাথে সঠিকটি চিহ্নিত। ব্যাখ্যা খোলে কেবল আপনি চাইলে।',
     why:'চেষ্টার ঠিক পরে পাওয়া ফলাফল সবচেয়ে বেশি কাজ করে। নিশ্চিত হয়ে করা ভুল একবার শোধরালে বিশেষভাবে মনে থাকে।'}),
  S(8,8,{t:'The paper\'s own clock',
     what:'Every question gets exactly the time the board allows: one minute. An alarm rings when it runs out, and the Timer switch in the top bar turns it off and on. Answers given with the timer off are recorded as untimed, and the prediction charges for them.',
     why:'We remember best under conditions like those in which we will need the memory. Practising at exam pace trains the thing the exam measures: recall inside a minute, not recall eventually.',
     src:['Morris, C. D., Bransford, J. D., & Franks, J. J. (1977). Levels of processing versus transfer appropriate processing. <i>Journal of Verbal Learning and Verbal Behavior</i>, 16(5).','Tulving, E., & Thomson, D. M. (1973). Encoding specificity and retrieval processes in episodic memory. <i>Psychological Review</i>, 80(5).']},
    {t:'প্রশ্নপত্রের নিজের ঘড়ি',
     what:'প্রতিটি প্রশ্নে ঠিক ততটুকু সময়, যতটুকু বোর্ড দেয়: এক মিনিট। সময় শেষ হলে অ্যালার্ম বাজে; ওপরের বারের টাইমার সুইচ দিয়ে এটি চালু-বন্ধ হয়।',
     why:'যে অবস্থায় মনে করতে হবে, সেই অবস্থায় অনুশীলন করলেই সবচেয়ে ভালো মনে থাকে।'}),
  S(9,9,{t:'Learn, then drill: worked examples',
     what:'Every chapter opens with a revision sheet built from its own questions: the key points of each sub-topic in the book\'s page order, each with one worked example — a real question, its answer and the reason. Then the drill.',
     why:'For a new topic, studying a worked solution before solving problems yourself reduces wasted effort and speeds learning; the benefit fades as you become expert, which is why the sheet is short and the drill is long.',
     src:['Sweller, J., & Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. <i>Cognition and Instruction</i>, 2(1).','Atkinson, R. K., Derry, S. J., Renkl, A., & Wortham, D. (2000). Learning from examples: Instructional principles from the worked examples research. <i>Review of Educational Research</i>, 70(2).']},
    {t:'আগে শেখা, পরে অনুশীলন: উদাহরণসহ',
     what:'প্রতিটি অধ্যায় শুরু হয় তার নিজের প্রশ্ন থেকে বানানো একটি রিভিশন শিট দিয়ে: প্রতিটি অংশের মূল কথা আর একটি উদাহরণ। তারপর অনুশীলন।',
     why:'নতুন বিষয়ে আগে একটি সমাধান করা উদাহরণ দেখলে অপচয় কমে, শেখা দ্রুত হয়।'}),
  S(10,10,{t:'An honest countdown: days left, stars and the map',
     what:'The top bar shows the days of study left for the whole syllabus at your daily time (1 hr 59 min unless you change it). Each done question takes a step off it. Chapters earn stars at one third, two thirds and all of their questions done, and the map shows the whole climb.',
     why:'People work harder as a goal comes into view, and progress that is visible and measured in real work keeps effort going. A countdown only helps if it is honest, so it is built from the work itself — not from minutes on the page.',
     src:['Hull, C. L. (1932). The goal-gradient hypothesis and maze learning. <i>Psychological Review</i>, 39(1).','Kivetz, R., Urminsky, O., & Zheng, Y. (2006). The goal-gradient hypothesis resurrected. <i>Journal of Marketing Research</i>, 43(1).']},
    {t:'সৎ কাউন্টডাউন: বাকি দিন, তারা আর ম্যাপ',
     what:'ওপরের বার পুরো সিলেবাসের বাকি দিন দেখায়, আপনার দৈনিক সময় ধরে। প্রতিটি শেষ প্রশ্ন এক ধাপ কমায়। অধ্যায়ের এক-তৃতীয়াংশ, দুই-তৃতীয়াংশ আর পুরোটা শেষ হলে তারা।',
     why:'লক্ষ্য চোখের সামনে এলে মানুষ বেশি খাটে। তবে কাউন্টডাউন কাজে দেয় কেবল সৎ হলে — তাই এটি কাজ থেকেই বানানো।'}),
  S(11,11,{t:'A prediction built to be beaten',
     what:'The predicted MCQ mark starts from what your answers say, then charges for every reason it might flatter you: thin evidence, untested chapters, slow pace, untimed answers, the exam hall. In hard mode it reports the 10th percentile — you should beat it nine times in ten.',
     why:'People reliably underestimate how long work takes and overestimate how well they know material, and students who overrate their learning stop studying too early. A deliberately cautious number protects against both.',
     src:['Buehler, R., Griffin, D., & Ross, M. (1994). Exploring the "planning fallacy". <i>Journal of Personality and Social Psychology</i>, 67(3).','Dunlosky, J., & Rawson, K. A. (2012). Overconfidence produces underachievement: Inaccurate self evaluations undermine students’ learning and retention. <i>Learning and Instruction</i>, 22(4).']},
    {t:'ছাড়িয়ে যাওয়ার জন্য বানানো পূর্বাভাস',
     what:'পূর্বাভাস আপনার উত্তর থেকে শুরু করে, তারপর প্রতিটি সম্ভাব্য বাড়িয়ে বলার দাম কাটে। কঠিন মোডে এটি দশম পার্সেন্টাইল দেখায়।',
     why:'মানুষ কাজের সময় কম আর নিজের জানা বেশি ধরে নেয়। ইচ্ছে করে সাবধানী একটি সংখ্যা দুটোর বিরুদ্ধেই সুরক্ষা।'}),
  S(12,12,{t:'Short sets, real breaks, a good ending',
     what:'Sets are sixteen questions, the next one never starts by itself, and after forty-five minutes you are reminded once to stand up. A set never ends on a miss: one gentler question on the same idea closes it.',
     why:'Brief breaks restore attention that drifts during long, unbroken work. And how an experience ends shapes how it is remembered — a set that ends on a success is one you are more willing to start again tomorrow.',
     src:['Ariga, A., & Lleras, A. (2011). Brief and rare mental "breaks" keep you focused: Deactivation and reactivation of task goals preempt vigilance decrements. <i>Cognition</i>, 118(3).','Kahneman, D., Fredrickson, B. L., Schreiber, C. A., & Redelmeier, D. A. (1993). When more pain is preferred to less: Adding a better end. <i>Psychological Science</i>, 4(6).']},
    {t:'ছোট সেট, সত্যিকারের বিরতি, ভালো শেষ',
     what:'প্রতিটি সেট ষোলোটি প্রশ্নের, পরেরটি নিজে থেকে শুরু হয় না, আর পঁয়তাল্লিশ মিনিট পরে একবার উঠে দাঁড়ানোর কথা বলা হয়। কোনো সেট ভুলে শেষ হয় না।',
     why:'ছোট বিরতি মনোযোগ ফিরিয়ে আনে। আর যে অভিজ্ঞতা ভালোভাবে শেষ হয়, সেটি আবার শুরু করতে ইচ্ছে করে।'}),
  S(13,13,{t:'Rewards that follow the work',
     what:'XP, coins, badges and chests come only from right answers, and a harder question pays more. Nothing can be bought, nothing expires, and a streak can be frozen or repaired, because one missed day should not undo a month.',
     why:'Game elements help when they reward the behaviour that matters and hurt when they reward something else. Rewards tied to performance, not to time spent, avoid teaching you to sit in front of the page; habits form over weeks, and a single lapse does not break them — so the app does not pretend it does.',
     src:['Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness: Defining "gamification". <i>Proceedings of MindTrek</i>.','Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. <i>European Journal of Social Psychology</i>, 40(6).','Lepper, M. R., Greene, D., & Nisbett, R. E. (1973). Undermining children’s intrinsic interest with extrinsic reward. <i>Journal of Personality and Social Psychology</i>, 28(1).']},
    {t:'কাজের পেছনে পেছনে পুরস্কার',
     what:'XP, কয়েন, ব্যাজ আর সিন্দুক আসে কেবল ঠিক উত্তর থেকে; কঠিন প্রশ্নে বেশি। কিছুই কেনা যায় না, কিছুই মেয়াদোত্তীর্ণ হয় না, আর ধারা ফ্রিজ বা মেরামত করা যায়।',
     why:'খেলার উপাদান কাজে দেয় যখন তা আসল কাজকে পুরস্কৃত করে। অভ্যাস তৈরি হয় সপ্তাহের পর সপ্তাহে, আর একদিনের ফাঁকে তা ভাঙে না।'})
];

/* ---------- the page ---------- */
function caution(){
  return '<section class="caution" role="note"><div class="c-head"><span class="c-mark" aria-hidden="true">!</span><b>'+L('Caution','সতর্কতা')+':</b></div>'+
    '<p>'+L('This web application builds exam intuition, not knowledge.','এই ওয়েব অ্যাপ্লিকেশন পরীক্ষার অনুমানশক্তি গড়ে, জ্ঞান নয়।')+'</p>'+
    '<p>'+L('It can help you score higher in the exam, but it cannot give you real understanding of a subject.','এটি আপনাকে পরীক্ষায় বেশি নম্বর পেতে সাহায্য করতে পারে, কিন্তু কোনো বিষয়ের সত্যিকারের বোঝাপড়া দিতে পারে না।')+'</p>'+
    '<p>'+L('There is no substitute for the textbooks.','পাঠ্যবইয়ের কোনো বিকল্প নেই।')+'</p>'+
    '<p>'+L('It was built to win you the most marks in college exams and admission tests in the least time. Your textbooks are what will serve you in the real world.',
      'কলেজের পরীক্ষা আর ভর্তি পরীক্ষায় সবচেয়ে কম সময়ে সবচেয়ে বেশি নম্বর তোলার জন্যই এটি বানানো। বাস্তব জীবনে কাজে আসবে আপনার পাঠ্যবই।')+'</p></section>';
}
function view(){
  var bn=LBN();
  var o='<div class="rsx">'+caution()+
    '<header class="rs-head"><div class="rs-meta"><span>'+L('Specification','বিবরণী')+'</span><span>'+L('Sheet 1 of ','শিট ১ / ')+(SECTIONS.length+1)+'</span></div>'+
    '<span class="kicker acc">'+L('Research-backed','গবেষণাভিত্তিক')+'</span>'+
    '<h1>'+L('How Drakkhak works, and why','দ্রাক্ষাক কীভাবে কাজ করে, আর কেন')+'</h1>'+
    '<p class="lede">'+L('Drakkhak is a study engine made of thirteen parts. Each one below is a method with published evidence behind it, drawn as a plate and explained in plain words: what the app does, why it does it, and where the evidence comes from. The drawings illustrate the idea; they are not data.',
      'দ্রাক্ষাক তেরোটি অংশে গড়া একটি পড়ার যন্ত্র। নিচের প্রতিটি অংশ একটি প্রকাশিত গবেষণাভিত্তিক পদ্ধতি: অ্যাপ কী করে, কেন করে, আর প্রমাণ কোথা থেকে। ছবিগুলো ধারণা বোঝানোর জন্য, তথ্য নয়।')+'</p>'+
    '<ol class="rs-toc">'+SECTIONS.map(function(s){ var x=bn?s.bn:s.en; return '<li><a href="#" data-act="rsJump" data-arg="'+s.n+'">'+U.h(x.t)+'</a></li>'; }).join('')+'</ol></header>';
  SECTIONS.forEach(function(s, i){
    var e=s.en, x=bn?s.bn:s.en;
    o+='<section class="rs-sec" id="rs-'+s.n+'"><div class="rs-num">&para; '+s.n+'</div>'+
      '<div class="rs-body'+(i%2?' flip':'')+'">'+
        '<div class="rs-text"><h2>'+U.h(x.t)+'</h2>'+
          '<div class="rs-what"><span class="label">'+L('What Drakkhak does','দ্রাক্ষাক যা করে')+'</span><p>'+x.what+'</p></div>'+
          '<div class="rs-why"><span class="label">'+L('Why','কেন')+'</span><p>'+x.why+'</p></div>'+
          '<details class="rs-src"><summary>'+L('The evidence','প্রমাণ')+' ('+e.src.length+')</summary><ul>'+e.src.map(function(r){ return '<li>'+r+'</li>'; }).join('')+'</ul></details>'+
        '</div>'+
        '<div class="rs-fig">'+FIG[s.fig]()+'</div>'+
      '</div></section>';
  });
  o+='<section class="rs-limits"><div class="rs-num">&para; '+(SECTIONS.length+1)+'</div><h2>'+L('What it cannot do','যা এটি পারে না')+'</h2>'+
    '<ul>'+
      '<li>'+L('It does not teach a subject from the ground up. The Learn sheets are built from the questions, so they cover what the board asks, not everything a chapter says.','এটি কোনো বিষয় গোড়া থেকে শেখায় না। শেখার শিট প্রশ্ন থেকে বানানো, তাই বোর্ড যা জিজ্ঞেস করে তা-ই আছে, অধ্যায়ের সবকিছু নয়।')+'</li>'+
      '<li>'+L('It does not measure the creative (written) half of the exam at all.','এটি পরীক্ষার সৃজনশীল অংশ একেবারেই মাপে না।')+'</li>'+
      '<li>'+L('Its numbers are estimates from your own answers on this device. They get better with volume and are deliberately cautious.','এর সংখ্যাগুলো এই যন্ত্রে আপনার নিজের উত্তর থেকে অনুমান। উত্তর বাড়লে এগুলো ভালো হয়, আর ইচ্ছে করেই সাবধানী।')+'</li>'+
      '<li>'+L('The research above is about average effects across many learners. Your own record — on the Statistics page — is the better guide to what works for you.','ওপরের গবেষণা অনেক শিক্ষার্থীর গড় ফল নিয়ে। আপনার জন্য কী কাজ করে, তার ভালো নির্দেশক আপনার নিজের রেকর্ড — পরিসংখ্যান পাতায়।')+'</li>'+
    '</ul>'+
    '<div class="btns" style="margin-top:18px"><button class="btn" data-act="quickStart">'+L('Back to work','কাজে ফিরুন')+'</button><button class="btn ghost" data-go="map">'+L('Open the map','ম্যাপ খুলুন')+'</button></div>'+
  '</section></div>';
  return o;
}

UI.act('rsJump', function(n){
  var el=document.getElementById('rs-'+n); if(!el) return;
  var top=window.pageYOffset+el.getBoundingClientRect().top-70;
  try{ window.scrollTo({top:top, behavior:'smooth'}); }catch(e){ window.scrollTo(0, top); }
});

return {view:view, SECTIONS:SECTIONS};
})();
