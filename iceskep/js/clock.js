/* ===========================================================
   CLOCK — the countdown behind every question, every full paper and
   the sixty-second challenge.

   One small timer: give it seconds and a tick callback and it counts
   down in real time, survives a slow frame, and can be given more
   seconds. Nothing is measured about the student: the app does not
   log minutes on the page.
   =========================================================== */
var CLOCK = (function(){

/* o: {secs, onTick(left), onEnd()} */
function timer(o){
  var end=Date.now()+o.secs*1000, iv=null, ended=false, stopped=false;
  function left(){ return (end-Date.now())/1000; }
  function step(){
    if(stopped) return;
    var l=left();
    if(o.onTick) o.onTick(l);
    if(l<=0 && !ended){
      ended=true;
      if(o.onEnd) o.onEnd();
    }
  }
  iv=setInterval(step, 250);
  step();
  return {
    left:left,
    /* more time; if the clock had already run out it starts again */
    add:function(s){ end+=s*1000; if(left()>0) ended=false; step(); },
    stop:function(){ stopped=true; if(iv){ clearInterval(iv); iv=null; } },
    over:function(){ return left()<=0; }
  };
}

return {timer:timer};
})();
