/* ===========================================================
   GAME — one currency, three power-ups.

   Coins come from answers and nowhere else: 1 for each right answer,
   2 more for winning back a mistake, 5 for finishing a set. The shop
   sells only the three power-ups, for coins. There is no money in this
   app and nothing that makes a question itself easier to know.
   =========================================================== */
var GAME = (function(){

var PAY={right:1, won:2, set:5};

var POWER=[
  {id:'fifty',  cost:30, en:'50:50',           bn:'৫০:৫০',
   noteEn:'Removes two wrong options.',                       noteBn:'দুটি ভুল অপশন সরিয়ে দেয়।'},
  {id:'second', cost:20, en:'Second chance',   bn:'দ্বিতীয় সুযোগ',
   noteEn:'If you miss, answer the same question again. The miss still goes to the mistake bank.',
   noteBn:'ভুল হলে একই প্রশ্নে আবার উত্তর দাও। ভুলটি তবু ভুলের খাতায় যায়।'},
  {id:'plus30', cost:15, en:'+30 seconds',     bn:'+৩০ সেকেন্ড',
   noteEn:'Thirty more seconds on this question.',            noteBn:'এই প্রশ্নে আরও ৩০ সেকেন্ড।'}
];
function power(id){ for(var i=0;i<POWER.length;i++) if(POWER[i].id===id) return POWER[i]; return null; }
function pname(p){ return L(p.en, p.bn); }

function coins(){ return DB.state().coins||0; }
function add(n){
  var s=DB.state();
  s.coins=Math.max(0, (s.coins||0)+n);
  DB.save();
}
/* a line in the wallet: one per set, one per purchase */
function note(entry){
  var s=DB.state();
  entry.t=Date.now();
  s.wallet.push(entry);
  if(s.wallet.length>40) s.wallet=s.wallet.slice(-30);
  DB.save();
}
function recent(n){ return DB.state().wallet.slice(-(n||10)).reverse(); }

function have(id){ return DB.state().power[id]||0; }
function use(id){
  var s=DB.state();
  if(!(s.power[id]>0)) return false;
  s.power[id]--; DB.save(); return true;
}
function buy(id){
  var p=power(id), s=DB.state();
  if(!p) return {ok:false};
  if(coins()<p.cost) return {ok:false, short:p.cost-coins()};
  s.coins-=p.cost;
  s.power[id]=(s.power[id]||0)+1;
  note({k:'buy', p:id, n:-p.cost});
  DB.save();
  return {ok:true};
}

return {PAY:PAY, POWER:POWER, power:power, pname:pname, coins:coins, add:add, note:note, recent:recent,
        have:have, use:use, buy:buy};
})();
