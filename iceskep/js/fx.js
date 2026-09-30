/* ===========================================================
   FX — the verdict, in sound and in colour.

   Every tone is synthesised with WebAudio: nothing is downloaded, it
   works offline, and it adds no bytes to the page. Green and red are
   the only decorative colour in the app and they are spent here: a
   wash across the question card, a flash at the edges of the screen
   so the answer registers before you have read a word, and one sound
   that means yes and one that means no.

   Calm mode (Settings) switches off every animation and every
   vibration. The Sound switch is separate.
   =========================================================== */
var FX = (function(){

var ctx=null, master=null, muted=false, GAIN=0.42;

function ready(){
  if(ctx) return ctx;
  try{
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return null;
    ctx=new AC();
    master=ctx.createGain(); master.gain.value=muted?0:GAIN;
    master.connect(ctx.destination);
  }catch(e){ ctx=null; }
  return ctx;
}
function unlock(){ var c=ready(); if(c&&c.state==='suspended') c.resume(); }
document.addEventListener('pointerdown', unlock, {passive:true});
document.addEventListener('keydown', unlock, {passive:true});

function setMuted(m){ muted=!!m; if(master) master.gain.value=muted?0:GAIN; }
function isMuted(){ return muted; }

/* one shaped tone */
function tone(freq, at, dur, type, vol, slideTo){
  var c=ready(); if(!c||muted) return;
  var o=c.createOscillator(), g=c.createGain();
  o.type=type||'sine';
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

var SEMI=Math.pow(2,1/12);
var SFX={
  /* YES: a major arpeggio that lands on the octave */
  correct:function(step){
    var c=ready(); if(!c) return; var t=c.currentTime, k=Math.pow(SEMI, Math.min(Math.max(0,(step||1)-1),14));
    [[659.25,0],[830.61,0.058],[987.77,0.116],[1318.5,0.184]].forEach(function(n){
      tone(n[0]*k, t+n[1], 0.27, 'triangle', 0.23);
      tone(n[0]*2*k, t+n[1], 0.12, 'sine', 0.05);
    });
    tone(329.6*k, t, 0.4, 'sine', 0.08);
    if(step>=5) noise(t+0.18, 0.22, 0.05, 3400);
  },
  /* NO: a falling minor third. Clearly negative, deliberately not a buzzer:
     a scolding sound is why people stop opening an app. */
  wrong:function(){
    var c=ready(); if(!c) return; var t=c.currentTime;
    tone(311.13, t, 0.17, 'square', 0.075, 261.63);
    tone(155.56, t, 0.30, 'sine', 0.13, 130.81);
    tone(233.08, t+0.13, 0.26, 'triangle', 0.10, 196);
  },
  next:function(){ var c=ready(); if(!c) return; tone(880, c.currentTime, 0.045, 'sine', 0.045); },
  done:function(){
    var c=ready(); if(!c) return; var t=c.currentTime;
    [523.25,659.25,783.99,1046.5].forEach(function(f,i){ tone(f, t+i*0.1, 0.55, 'triangle', 0.19); });
    tone(261.6, t, 0.9, 'sine', 0.1);
    noise(t+0.36, 0.45, 0.04, 3000);
  },
  coin:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    tone(1318.5, t, 0.07, 'square', 0.07); tone(1760, t+0.06, 0.12, 'square', 0.06); },
  badge:function(){ var c=ready(); if(!c) return; var t=c.currentTime;
    [1046.5,1318.5,1568,2093].forEach(function(f,i){ tone(f, t+i*0.07, 0.55, 'sine', 0.16); });
    noise(t+0.25, 0.4, 0.045, 4000); },
  whoosh:function(){ var c=ready(); if(!c) return; noise(c.currentTime, 0.28, 0.05, 700); },
  /* the time-up alarm: three short beeps, once */
  alarm:function(){
    var c=ready(); if(!c) return; var t=c.currentTime;
    tone(988, t, 0.13, 'square', 0.10);
    tone(784, t+0.17, 0.13, 'square', 0.10);
    tone(988, t+0.34, 0.13, 'square', 0.10);
  },
  tick:function(){ var c=ready(); if(!c) return; tone(1046.5, c.currentTime, 0.05, 'sine', 0.05); }
};
function play(n, a){ if(SFX[n]) try{ SFX[n](a); }catch(e){} }

/* ---------- visuals ---------- */
function calm(){ try{ return !!DB.state().settings.calm; }catch(e){ return false; } }
function effectsOn(){ return !calm(); }
function layer(){ return document.getElementById('fxlayer'); }

/* the wash and the shake, applied to the question card itself */
function stageFlash(ok){
  if(calm()) return;
  var el=document.querySelector('.qcard');
  if(!el) return;
  el.classList.remove('fx-ok','fx-no');
  void el.offsetWidth;
  el.classList.add(ok?'fx-ok':'fx-no');
}
/* the flash at the edges of the screen, so the verdict lands in
   peripheral vision a beat before you read anything */
function edgeFlash(ok){
  if(calm()) return;
  var e=document.getElementById('edgeflash');
  if(!e) return;
  e.className='edgeflash '+(ok?'ok':'no');
  void e.offsetWidth;
  e.classList.add('on');
}
/* a tap on the phone for right, a double buzz for wrong */
function buzz(pattern){
  if(calm()) return;
  try{ if(navigator.vibrate) navigator.vibrate(pattern); }catch(e){}
}

function verdictCorrect(step){
  stageFlash(true); edgeFlash(true);
  play('correct', step);
  buzz(12);
}
function verdictWrong(){
  stageFlash(false); edgeFlash(false);
  play('wrong');
  buzz([26,50,26]);
}

/* confetti, for the moments that deserve it */
function confetti(count){
  if(calm()) return;
  var LY=layer(); if(!LY) return;
  var css=getComputedStyle(document.documentElement);
  var colours=['--accent','--ok','--accent-press','--ok-line','--ink-2'].map(function(v){
    return css.getPropertyValue(v).trim()||'#D97757'; });
  count=count||60;
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

/* a small burst of particles from the middle of an element */
function burst(el, count){
  if(calm() || !el) return;
  var LY=layer(); if(!LY) return;
  var r=el.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
  var css=getComputedStyle(document.documentElement);
  var cols=['--ok','--ok-line','--accent'].map(function(v){ return css.getPropertyValue(v).trim()||'#4C7A4E'; });
  count=count||12;
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

/* a number that climbs to its value, for the results screen */
function countUp(el, to, ms){
  if(!el) return;
  if(calm()){ el.textContent=N(Math.round(to)); return; }
  var t0=performance.now();
  ms=ms||800;
  (function step(now){
    var p=Math.min(1,(now-t0)/ms), e=1-Math.pow(1-p,3);
    el.textContent=N(Math.round(to*e));
    if(p<1) requestAnimationFrame(step);
  })(t0);
}

/* the coin flight: coins leave the answer you picked and land in the
   coin box in the top bar, which counts up as they arrive.
   o: {from, to, count, onLand(i,last)} */
function fly(o){
  var LY=layer(), to=o.to, from=o.from;
  var visible = to && to.getBoundingClientRect && to.offsetParent!==null;
  if(calm() || !LY || !from || !visible){ if(o.onLand) o.onLand(0, true); return; }
  var fr=from.getBoundingClientRect(), ir=to.getBoundingClientRect();
  var tx=ir.left+ir.width/2, ty=ir.top+ir.height/2;
  var n=Math.max(1, Math.min(9, o.count||1)), done=0, t0=performance.now();
  for(var i=0;i<n;i++) (function(i){
    var d=document.createElement('i');
    d.className='fly-coin';
    var sx=fr.left+fr.width*(0.25+Math.random()*0.5), sy=fr.top+fr.height*(0.3+Math.random()*0.4);
    var cx=(sx+tx)/2+(Math.random()-0.5)*120, cy=Math.min(sy,ty)-60-Math.random()*50;
    var delay=i*70, travel=620+Math.random()*120;
    d.style.left='0px'; d.style.top='0px';
    LY.appendChild(d);
    (function step(now){
      var t=now-t0-delay;
      if(t<0){ requestAnimationFrame(step); return; }
      var q=Math.min(1,t/travel), k=q*q*(3-2*q);
      var x=(1-k)*(1-k)*sx+2*(1-k)*k*cx+k*k*tx, y=(1-k)*(1-k)*sy+2*(1-k)*k*cy+k*k*ty;
      d.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) translate(-50%,-50%) scale('+(1-0.4*k).toFixed(2)+')';
      if(q>=1){
        d.remove(); done++;
        pop(to, 'fx-bump'); play('coin');
        if(o.onLand) o.onLand(i, done===n);
        return;
      }
      requestAnimationFrame(step);
    })(t0);
  })(i);
}

/* restart a one-shot CSS animation on an element */
function pop(el, cls){
  if(!el || calm()) return;
  cls=cls||'fx-pop';
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
}

return {play:play, setMuted:setMuted, isMuted:isMuted, unlock:unlock, calm:calm, effectsOn:effectsOn,
        verdictCorrect:verdictCorrect, verdictWrong:verdictWrong, buzz:buzz,
        confetti:confetti, burst:burst, countUp:countUp, fly:fly, pop:pop};
})();
