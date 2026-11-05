/* ===========================================================
   SHARE — your data: take a copy, bring it back, or erase it.

   Everything lives in this browser and nowhere else. Clearing site
   data deletes the lot, so a copy now and then is the only backup.
   =========================================================== */
var SHARE = (function(){

/* a file named for today, saved by the browser */
function exportFile(){
  var blob=new Blob([DB.exportJSON()], {type:'application/json'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='drakkhak-'+DB.today()+'.json';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* a text copy, for phones that will not save a file */
function copyText(){
  var txt=DB.exportJSON();
  if(navigator.clipboard && navigator.clipboard.writeText){
    return navigator.clipboard.writeText(txt).then(function(){ return true; }, function(){ return false; });
  }
  return Promise.resolve(false);
}

/* bring a copy back: txt is the JSON; throws on anything that is not one */
function restore(txt){
  DB.importJSON(txt);
}
function restoreFile(file, done){
  var r=new FileReader();
  r.onload=function(){
    try{ restore(String(r.result)); done(null); }catch(e){ done(e); }
  };
  r.onerror=function(){ done(new Error('read')); };
  r.readAsText(file);
}

function erase(){
  DB.reset();
  PLAN.invalidate();
}

return {exportFile:exportFile, copyText:copyText, restore:restore, restoreFile:restoreFile, erase:erase};
})();
