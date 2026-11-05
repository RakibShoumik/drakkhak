/* Writes the chapter list the community side searches, so one search box
   finds both people (WoWonder) and chapters (Learn).

     node tools/export-chapters.js

   Output: ../theme/build/overlay/dk/chapters.json, and the same file in the
   two built themes. Run it again when chapters are added or renamed. */
var fs=require('fs'), path=require('path'), vm=require('vm');
var root=path.join(__dirname,'..');
var ctx={console:console, L:function(en){ return en; }, LBN:function(){ return false; }, window:{}, document:{}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/data/registry.js'),'utf8')+';this.ICE=ICE;', ctx);
var ICE=ctx.ICE, out=[];
(ICE.path.hsc||Object.keys(ICE.topics)).forEach(function(id){
  var tp=ICE.topics[id]; if(!tp) return;
  var sec=ICE.sections[tp.sec]||{};
  out.push({id:id, n:tp.n, en:ICE.tname(tp), bn:tp.name||'', p:sec.en||sec.name||'', s:sec.subj||''});
});
var json=JSON.stringify(out);
var dests=['../theme/build/overlay/dk/chapters.json','../theme/drakkhak/dk/chapters.json','../theme/drakkhak-study/dk/chapters.json'];
dests.forEach(function(d){
  var p=path.join(root,d);
  if(!fs.existsSync(path.dirname(p))) return;
  fs.writeFileSync(p, json);
  console.log('wrote', path.relative(root,p), out.length, 'chapters');
});
