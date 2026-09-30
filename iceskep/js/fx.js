/* ===========================================================
   FX — the verdict, in sound and in colour.

   Every tone is synthesised with WebAudio. Nothing is downloaded,
   it works offline, and it adds no bytes to the page.

   The green and the red are the only decorative colour in the app,
   and they are spent entirely here: a wash across the question card,
   a flash at the edges of the screen so the answer registers before
   you have read a word, and one sound that means yes and one that
   means no.
   =========================================================== */
var FX = (function(){

var ctx=null, master=null, muted=false;

/* Sound packs. A cosmetic you buy with coins you studied for: it
   changes the voice of the app, never what anything is worth. */
var PACKS={
  journal:{gain:0.42, wave:null,     tilt:1},
  arcade: {gain:0.30, wave:'square', tilt:1.06},
  soft:   {gain:0.26, wave:'sine',   tilt:0.94}
};
var pack=PACKS.journal;
function setPack(id){ pack=PACKS[id]||PACKS.journal; if(master) master.gain.value=muted?0:pack.gain; }

function ready(){
  if(ctx) return ctx;
  try{
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return null;
    ctx=new AC();
    master=ctx.createGain(); master.gain.value=muted?0:pack.gain;
    master.connect(ctx.destination);
  }catch(e){ ctx=null; }
  return ctx;
}
function unlock(){ var c=ready(); if(c&&c.state==='suspended') c.resume(); }
document.addEventListener('pointerdown', unlock, {passive:true});
document.addEventListener('keydown', unlock, {passive:true});

function setMuted(m){ muted=!!m; if(master) master.gain.value=muted?0:pack.gain; }
function isMuted(){ return muted; }

/* one shaped tone */
function tone(freq, at, dur, type, vol, slideTo){
  var c=ready(); if(!c||muted) return;
  var o=c.createOscillator(), g=c.createGain();
  o.type=pack.wave||type||'sine';
  freq=freq*pack.tilt; if(slideTo) slideTo=slideTo*pack.tilt;
  o.frequency.setValueAtTime(freq, at);
  if(slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20,slideTo), at+dur);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol||0.2), at+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, at+dur);
  o.connect(g); g.connect(master);
  o.start(at); o.stop(at+dur+0.03);
}
function noise(at, dur, vol, hp){
  var c=ready(); if(!c||muted) return;
  var n=Math.max(1,Math.floor(c.sampleRate*dur));
  var buf=c.createBuffer(1,n,c.sampleRate), d=buf.getChannelData(0);
  for(var i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);
  var s=c.createBufferSource(); s.buffer=buf;
  var f=c.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp||2400;
  var g=c.createGain(); g.gain.value=vol||0.06;
  s.connect(f); f.connect(g); g.connect(master); s.start(at);
}

var SFX={
  /* YES. A major arpeggio that lands on the octave, with a breath of
     air on top. Bright, short, and over before it wears out. */
  correct:function(){
    var c=ready(); if(!c) return; var t=c.currentTime;
    [[659.25,0],[830.61,0.062],[987.77,0.124],[1318.5,0.196]].forEach(function(n){
      tone(n[0], t+n[1], 0.28, 'triangle', 0.24);
      tone(n[0]*2, t+n[1], 0.13, 'sine', 0.055);
    });
    tone(329.6, t, 0.42, 'sine', 0.09);
    noise(t+0.196, 0.20, 0.045, 3200);
  },
  /* YES, again, and again, and again. Higher, with a lift at the end. */
  streak:function(){
    var c=ready(); if(!c) return; var t=c.currentTime;
    [880,1108.7,1318.5,1760].forEach(function(f,i){ tone(f, t+i*0.055, 0.32, 'triangle', 0.2); });
    tone(440, t, 0.5, 'sine', 0.09);
    noise(t+0.16, 0.30, 0.055, 3600);
  },
  /* NO. A falling minor third with a rough edge underneath — clearly
     negative, deliberately not a buzzer. You will hear this a lot at the
     start, and a scolding sound is why people stop opening an app. */
  wrong:function(){
    var c=ready(); if(!c) return; var t=c.currentTime;
    tone(311.13, t, 0.17, 'square', 0.075, 261.63);
    tone(155.56, t, 0.30, 'sine', 0.13, 130.81);
    tone(233.08, t+0.13, 0.26, 'triangle', 0.10, 196);
  },
  /* the quiet click that means "moving on" */
  next:function(){ var c=ready(); if(!c) return; tone(880, c.currentTime, 0.045, 'sine', 0.045); },
  tick:function(){ var c=ready(); if(!c) return; tone(1200, c.currentTime, 0.03, 'sine', 0.03); },
  /* time is nearly up on this question */
  pace:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    tone(660, t, 0.09, 'sine', 0.05); tone(560, t+0.1, 0.12, 'sine', 0.04); },
  /* a set is finished */
  done:function(){
    var c=ready(); if(!c) return; var t=c.currentTime;
    [523.25,659.25,783.99,1046.5].forEach(function(f,i){ tone(f, t+i*0.1, 0.55, 'triangle', 0.19); });
    tone(261.6, t, 0.9, 'sine', 0.1);
    noise(t+0.36, 0.45, 0.04, 3000);
  },
  /* a new best, a streak day banked, a target met */
  reward:function(){
    var c=ready(); if(!c) return; var t=c.currentTime;
    [523.25,659.25,783.99,1046.5,1318.5].forEach(function(f,i){ tone(f, t+i*0.07, 0.5, 'triangle', 0.2); });
    noise(t+0.3, 0.5, 0.05, 2800);
  },
  calc:function(){ var c=ready(); if(!c) return; tone(1400, c.currentTime, 0.022, 'square', 0.022); }
};
function play(n){ if(SFX[n]) try{ SFX[n](); }catch(e){} }

/* ---------- visuals ---------- */
function layer(){ return document.getElementById('fxlayer'); }

/* the wash and the shake, applied to the question card itself */
function stageFlash(ok){
  var el=document.querySelector('.qcard');
  if(!el) return;
  el.classList.remove('fx-ok','fx-no');
  void el.offsetWidth;                    /* force the animation to restart */
  el.classList.add(ok?'fx-ok':'fx-no');
}
/* the flash at the edges of the screen, so the verdict lands in
   peripheral vision a beat before you read anything */
function edgeFlash(ok){
  var e=document.getElementById('edgeflash');
  if(!e) return;
  e.className='edgeflash '+(ok?'ok':'no');
  void e.offsetWidth;
  e.classList.add('on');
}
function floatText(text, el, kind){
  var LY=layer(); if(!LY) return;
  var r = el && el.getBoundingClientRect ? el.getBoundingClientRect()
        : {left:innerWidth/2, top:innerHeight/2, width:0, height:0};
  var d=document.createElement('div');
  d.className='floatpt';
  d.textContent=text;
  var css=getComputedStyle(document.documentElement);
  d.style.color = css.getPropertyValue(kind==='no'?'--no':kind==='acc'?'--accent':'--ok').trim()||'#4C7A4E';
  d.style.left=(r.left+r.width/2)+'px';
  d.style.top=(r.top+6)+'px';
  LY.appendChild(d);
  var t0=performance.now(), dur=1050;
  (function step(now){
    var p=(now-t0)/dur;
    if(p>=1){ d.remove(); return; }
    d.style.transform='translate(-50%,'+(-54*p)+'px)';
    d.style.opacity=String(1-p*p);
    requestAnimationFrame(step);
  })(t0);
}

/* the two calls the rest of the app makes */
function verdictCorrect(opts){
  opts=opts||{};
  stageFlash(true); edgeFlash(true);
  /* the ladder: each answer in a run comes back a semitone higher, so a
     good run is audible before you have read anything */
  if(opts.streak>=2) combo(opts.streak); else play('correct');
  buzz(12);
  if(opts.label) floatText(opts.label, opts.el, 'ok');
}
function verdictWrong(opts){
  opts=opts||{};
  stageFlash(false); edgeFlash(false);
  play('wrong');
  buzz([26,50,26]);
  if(opts.label) floatText(opts.label, opts.el, 'no');
}

/* ===========================================================
   THE GAME LAYER'S OWN VOICE

   Every event gets a sound of its own, so the ear learns what
   happened before the eye reads it. The combo ladder climbs one note
   for each correct answer in a row, which is the single cheapest way
   to make a run feel like a run.
   =========================================================== */
var SEMI=Math.pow(2,1/12);
function up(n){ return Math.pow(SEMI, Math.min(n,14)); }

/* correct, pitched by how long the run is */
function combo(step){
  var c=ready(); if(!c) return; var t=c.currentTime, k=up(Math.max(0,step-1));
  [[659.25,0],[830.61,0.055],[987.77,0.11],[1318.5,0.17]].forEach(function(nn){
    tone(nn[0]*k, t+nn[1], 0.26, 'triangle', 0.22);
    tone(nn[0]*2*k, t+nn[1], 0.12, 'sine', 0.05);
  });
  tone(329.6*k, t, 0.38, 'sine', 0.08);
  if(step>=5) noise(t+0.17, 0.22, 0.05, 3400);
}
var EXTRA={
  levelup:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    [392,523.25,659.25,783.99,1046.5,1318.5].forEach(function(f,i){ tone(f, t+i*0.08, 0.6, 'triangle', 0.22); });
    tone(196, t, 1.1, 'sine', 0.12); noise(t+0.45, 0.6, 0.05, 2600); },
  chest:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    tone(220, t, 0.18, 'square', 0.07, 180);           /* the latch */
    noise(t+0.12, 0.3, 0.05, 1800);                    /* the lid */
    [784,988,1175,1568,1976].forEach(function(f,i){ tone(f, t+0.22+i*0.06, 0.5, 'triangle', 0.17); }); },
  badge:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    [1046.5,1318.5,1568,2093].forEach(function(f,i){ tone(f, t+i*0.07, 0.55, 'sine', 0.16); });
    noise(t+0.25, 0.4, 0.045, 4000); },
  star:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    tone(1318.5, t, 0.22, 'triangle', 0.16); tone(1976, t+0.08, 0.3, 'sine', 0.12); },
  coin:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    tone(1318.5, t, 0.07, 'square', 0.07); tone(1760, t+0.06, 0.12, 'square', 0.06); },
  golden:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    [1046.5,1396.9,1760,2349].forEach(function(f,i){ tone(f, t+i*0.05, 0.4, 'triangle', 0.18); });
    noise(t, 0.5, 0.05, 5000); },
  heart:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    tone(196, t, 0.3, 'sine', 0.16, 110); tone(146.8, t+0.16, 0.4, 'triangle', 0.10, 90); },
  hit:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    tone(150, t, 0.12, 'square', 0.12, 80); noise(t, 0.16, 0.08, 900); },
  clear:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    [659.25,987.77,1318.5].forEach(function(f,i){ tone(f, t+i*0.06, 0.4, 'triangle', 0.2); });
    tone(329.6, t, 0.5, 'sine', 0.09); },
  countdown:function(){ var c=ready(); if(!c) return; tone(1046.5, c.currentTime, 0.05, 'sine', 0.05); },
  whoosh:function(){ var c=ready(); if(!c) return; noise(c.currentTime, 0.28, 0.05, 700); }
};
for(var _k in EXTRA) SFX[_k]=EXTRA[_k];

/* ---------- haptics: a tap for right, a double buzz for wrong ---------- */
function buzz(pattern){
  try{
    if(!DB.state().settings.haptics) return;
    if(navigator.vibrate) navigator.vibrate(pattern);
  }catch(e){}
}

/* ---------- confetti, for the moments that deserve it ---------- */
function effectsOn(){ try{ return DB.state().settings.effects!==false; }catch(e){ return true; } }
function confetti(count){
  if(!effectsOn()) return;
  var LY=layer(); if(!LY) return;
  var css=getComputedStyle(document.documentElement);
  var colours=['--accent','--ok','--accent-press','--ok-line','--ink-2'].map(function(v){
    return css.getPropertyValue(v).trim()||'#D97757'; });
  count=count||70;
  var bits=[], i;
  for(i=0;i<count;i++){
    var d=document.createElement('i');
    d.className='confetti';
    d.style.background=colours[i%colours.length];
    d.style.left=(10+Math.random()*80)+'%';
    d.style.width=(5+Math.random()*6)+'px';
    d.style.height=(8+Math.random()*8)+'px';
    LY.appendChild(d);
    bits.push({el:d, x:0, y:-20-Math.random()*80, vx:(Math.random()-0.5)*2.4,
               vy:2+Math.random()*3.5, rot:Math.random()*360, vr:(Math.random()-0.5)*18});
  }
  var t0=performance.now();
  (function step(now){
    var done=true;
    for(var j=0;j<bits.length;j++){
      var b=bits[j];
      b.vy+=0.12; b.x+=b.vx; b.y+=b.vy; b.rot+=b.vr;
      if(b.y<innerHeight+60) done=false;
      b.el.style.transform='translate('+b.x.toFixed(1)+'px,'+b.y.toFixed(1)+'px) rotate('+b.rot.toFixed(0)+'deg)';
      b.el.style.opacity=String(Math.max(0, 1-(now-t0)/2600));
    }
    if(done || now-t0>2800){ bits.forEach(function(b){ b.el.remove(); }); return; }
    requestAnimationFrame(step);
  })(t0);
}

/* a number that climbs to its value, for results screens */
function countUp(el, to, ms, fmt, from){
  if(!el) return;
  if(!effectsOn()){ el.textContent=fmt?fmt(to):String(Math.round(to)); return; }
  from=from||0;
  var t0=performance.now();
  ms=ms||900;
  (function step(now){
    var p=Math.min(1,(now-t0)/ms), e=1-Math.pow(1-p,3), v=from+(to-from)*e;
    el.textContent=fmt?fmt(v):String(Math.round(v));
    if(p<1) requestAnimationFrame(step);
  })(t0);
}

/* the two calls the game layer makes on a right and a wrong answer */
/* A small burst of particles from the middle of an element: the right
   answer, a claimed quest, a star. Short, light, and gone in under a
   second, so it rewards without getting in the way of the next question. */
function burst(el, count, kind){
  if(!effectsOn() || !el) return;
  var LY=layer(); if(!LY) return;
  var r=el.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
  var css=getComputedStyle(document.documentElement);
  var cols = (kind==='acc' ? ['--accent','--accent-press','--ink-3'] : ['--ok','--ok-line','--accent'])
    .map(function(v){ return css.getPropertyValue(v).trim()||'#4C7A4E'; });
  count=count||14;
  var bits=[], i;
  for(i=0;i<count;i++){
    var d=document.createElement('i');
    d.className='spark';
    var sz=3+Math.random()*4;
    d.style.width=d.style.height=sz+'px';
    d.style.background=cols[i%cols.length];
    d.style.left=cx+'px'; d.style.top=cy+'px';
    LY.appendChild(d);
    var ang=(Math.PI*2*i/count)+(Math.random()-.5)*.5, sp=2.6+Math.random()*3.2;
    bits.push({el:d, x:0, y:0, vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp-1.2});
  }
  var t0=performance.now();
  (function step(now){
    var p=(now-t0)/720;
    for(var j=0;j<bits.length;j++){
      var b=bits[j];
      b.vx*=0.93; b.vy=b.vy*0.93+0.12; b.x+=b.vx; b.y+=b.vy;
      b.el.style.transform='translate('+b.x.toFixed(1)+'px,'+b.y.toFixed(1)+'px) scale('+(1-p*0.6).toFixed(2)+')';
      b.el.style.opacity=String(Math.max(0,1-p));
    }
    if(p>=1){ bits.forEach(function(b){ b.el.remove(); }); return; }
    requestAnimationFrame(step);
  })(t0);
}
/* ---------- the reward flight ----------
   A right answer pays out where you can see it. Coins and an XP token
   burst out of the answer you chose, hang for a beat, then zip up into
   their boxes in the top bar one after another — and each box counts up
   as its payment lands, not before. o: {from, to, kind:'coin'|'xp',
   count, label, onLand(i, last), onDone} */
var inFlight=0;
function fly(o){
  o=o||{};
  var LY=layer();
  var to=o.to, from=o.from;
  var visible = to && to.getBoundingClientRect && to.offsetParent!==null;
  if(!effectsOn() || !LY || !from || !visible){
    if(o.onLand) o.onLand(0, true);
    if(o.onDone) o.onDone();
    return;
  }
  var fr=from.getBoundingClientRect(), tr=to.getBoundingClientRect();
  var icon=to.querySelector('.fly-target')||to, ir=icon.getBoundingClientRect();
  var tx=ir.left+ir.width/2, ty=ir.top+ir.height/2;
  var n=Math.max(1, o.count||1), done=0, t0=performance.now();
  inFlight++;
  for(var i=0;i<n;i++) (function(i){
    var d=document.createElement(o.kind==='xp' && i===0 ? 'b' : 'i');
    if(o.kind==='coin') d.className='fly-coin';
    else if(i===0){ d.className='fly-xp'; d.textContent=o.label||'XP'; }
    else d.className='fly-gem';
    var sx=fr.left+fr.width*(0.25+Math.random()*0.5), sy=fr.top+fr.height*(0.3+Math.random()*0.4);
    var ang=Math.random()*Math.PI*2, pushR=24+Math.random()*34;
    var hx=sx+Math.cos(ang)*pushR, hy=sy+Math.sin(ang)*pushR*0.7-18;   /* where it hangs */
    var delay=i*65, burstT=210, hang=90+i*20, travel=560+Math.random()*120;
    d.style.left='0px'; d.style.top='0px';
    d.style.transform='translate('+sx+'px,'+sy+'px) translate(-50%,-50%) scale(.2)';
    LY.appendChild(d);
    /* a control point above and to the side makes every path a clean arc */
    var cx=(hx+tx)/2+(Math.random()-0.5)*160, cy=Math.min(hy,ty)-80-Math.random()*60;
    function step(now){
      var t=now-t0-delay;
      if(t<0){ requestAnimationFrame(step); return; }
      var x, y, sc=1;
      if(t<burstT){
        var p=t/burstT, e=1-Math.pow(1-p,3);
        x=sx+(hx-sx)*e; y=sy+(hy-sy)*e; sc=0.2+0.95*e;
      } else if(t<burstT+hang){
        x=hx; y=hy+Math.sin((t-burstT)/hang*Math.PI)*-3; sc=1.15;
      } else {
        var q=Math.min(1,(t-burstT-hang)/travel), k=q*q*(3-2*q), kk=k*k;   /* slow start, fast finish */
        kk = q<1 ? (0.35*k+0.65*kk) : 1;
        x=(1-kk)*(1-kk)*hx+2*(1-kk)*kk*cx+kk*kk*tx;
        y=(1-kk)*(1-kk)*hy+2*(1-kk)*kk*cy+kk*kk*ty;
        sc=1.15-0.55*kk;
        if(q>=1){
          d.remove(); done++;
          pop(to, 'fx-bump');
          if(o.kind==='coin') play('coin');
          if(o.onLand) o.onLand(i, done===n);
          if(done===n){ inFlight--; if(o.onDone) o.onDone(); }
          return;
        }
      }
      d.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) translate(-50%,-50%) scale('+sc.toFixed(2)+')';
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  })(i);
}
function flying(){ return inFlight>0; }

/* restart a one-shot CSS animation on an element */
function pop(el, cls){
  if(!el) return;
  cls=cls||'fx-pop';
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
}

function tapRight(step, el, label){
  stageFlash(true); edgeFlash(true);
  combo(step||1);
  buzz(12);
  if(label) floatText(label, el, 'ok');
}
function tapWrong(el){
  stageFlash(false); edgeFlash(false);
  play('wrong');
  buzz([26,50,26]);
}

/* ---------- the time-up alarm ----------
   A plain two-tone beep, repeated until it is switched off, the
   question is answered, or forty-five seconds pass — whichever is
   first. It is meant to be heard across a room, not to startle. */
var alarmT=null, alarmStop=0;
function alarmBeep(){
  var c=ready(); if(!c) return; var t=c.currentTime;
  tone(988, t, 0.13, 'square', 0.10);
  tone(784, t+0.17, 0.13, 'square', 0.10);
  tone(988, t+0.34, 0.13, 'square', 0.10);
}
function alarmStart(){
  alarmEnd();
  alarmStop=Date.now()+45000;
  alarmBeep();
  alarmT=setInterval(function(){
    if(Date.now()>alarmStop){ alarmEnd(); return; }
    alarmBeep();
  }, 1100);
}
function alarmEnd(){ if(alarmT){ clearInterval(alarmT); alarmT=null; } }
function alarmOn(){ return !!alarmT; }

return {play:play, setMuted:setMuted, isMuted:isMuted, unlock:unlock,
        alarmStart:alarmStart, alarmStop:alarmEnd, alarmOn:alarmOn,
        stageFlash:stageFlash, edgeFlash:edgeFlash, floatText:floatText,
        verdictCorrect:verdictCorrect, verdictWrong:verdictWrong,
        combo:combo, buzz:buzz, confetti:confetti, countUp:countUp,
        tapRight:tapRight, tapWrong:tapWrong, effectsOn:effectsOn, setPack:setPack,
        burst:burst, pop:pop, fly:fly, flying:flying};
})();
