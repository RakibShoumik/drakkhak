/* ===========================================================
   GEN — IBA English analogies.

   Twelve relationship families, each a list of word pairs written in
   the same direction. A question takes one pair as the stem; the key is
   another pair from the same family, in the same direction. The traps
   are the classic ones: a pair from the same family written backwards,
   and pairs from families that look similar but name a different
   relationship.
   =========================================================== */
(function(){
function W(t,why){ return {t:t, why:why}; }
var FAM=[
  {id:'tool', bridge:function(a,b){ return 'a '+a+' is the tool a '+b+' works with'; },
   pairs:[['SCALPEL','SURGEON'],['GAVEL','JUDGE'],['BATON','CONDUCTOR'],['CHISEL','SCULPTOR'],['TROWEL','MASON'],['STETHOSCOPE','DOCTOR'],['NEEDLE','TAILOR'],['BRUSH','PAINTER'],['AXE','WOODCUTTER'],['PLOUGH','FARMER'],['SPANNER','MECHANIC'],['CAMERA','PHOTOGRAPHER'],['SCISSORS','BARBER'],['OAR','ROWER']]},
  {id:'product', bridge:function(a,b){ return 'a '+a+' produces '+(/^[AEIOU]/.test(b)?'an ':'a ')+b; },
   pairs:[['POET','POEM'],['BAKER','LOAF'],['ARCHITECT','BLUEPRINT'],['COBBLER','SHOE'],['SPIDER','WEB'],['AUTHOR','NOVEL'],['COMPOSER','SYMPHONY'],['POTTER','VASE'],['CARPENTER','CABINET'],['WEAVER','FABRIC'],['SILKWORM','COCOON'],['SCULPTOR','STATUE'],['BLACKSMITH','HORSESHOE'],['PLAYWRIGHT','SCRIPT']]},
  {id:'young', bridge:function(a,b){ return 'a '+a+' is a young '+b; },
   pairs:[['CUB','LION'],['CALF','COW'],['KID','GOAT'],['FOAL','HORSE'],['PUPPY','DOG'],['KITTEN','CAT'],['TADPOLE','FROG'],['FAWN','DEER'],['OWLET','OWL'],['GOSLING','GOOSE'],['SAPLING','TREE'],['DUCKLING','DUCK'],['LAMB','SHEEP'],['JOEY','KANGAROO']]},
  {id:'part', bridge:function(a,b){ return 'a '+a+' is one part of a '+b; },
   pairs:[['PAGE','BOOK'],['PETAL','FLOWER'],['KEY','PIANO'],['SPOKE','WHEEL'],['BRICK','WALL'],['STANZA','POEM'],['ROOM','HOUSE'],['CHAPTER','NOVEL'],['LENS','CAMERA'],['FIN','FISH'],['BLADE','KNIFE'],['RUNG','LADDER'],['STRING','GUITAR'],['FRAME','FILM']]},
  {id:'degree', bridge:function(a,b){ return 'to be '+b+' is to be extremely '+a; },
   pairs:[['WARM','SCORCHING'],['TIRED','EXHAUSTED'],['HAPPY','ECSTATIC'],['COOL','FREEZING'],['DAMP','SOAKED'],['PLEASED','DELIGHTED'],['HUNGRY','STARVING'],['ANNOYED','FURIOUS'],['SMALL','MINUSCULE'],['DIRTY','FILTHY'],['SCARED','TERRIFIED'],['SURPRISED','ASTOUNDED'],['UNWISE','FOOLHARDY'],['CAREFUL','METICULOUS']]},
  {id:'syn', bridge:function(a,b){ return a+' and '+b+' mean the same'; },
   pairs:[['BRAVE','COURAGEOUS'],['OBSTINATE','STUBBORN'],['CANDID','FRANK'],['FRAGILE','BRITTLE'],['AMIABLE','FRIENDLY'],['LETHARGIC','SLUGGISH'],['CONCISE','BRIEF'],['LUCID','CLEAR'],['OBSOLETE','OUTDATED'],['DILIGENT','HARDWORKING'],['HOSTILE','UNFRIENDLY'],['AMBIGUOUS','UNCLEAR'],['FRUGAL','THRIFTY'],['LENIENT','TOLERANT']]},
  {id:'ant', bridge:function(a,b){ return a+' is the opposite of '+b; },
   pairs:[['ARID','HUMID'],['TIMID','BOLD'],['ASCEND','DESCEND'],['OPTIMIST','PESSIMIST'],['VERBOSE','TERSE'],['TRANSPARENT','OPAQUE'],['ZENITH','NADIR'],['MODEST','ARROGANT'],['VICTORY','DEFEAT'],['GENEROUS','STINGY'],['EXPAND','CONTRACT'],['ANCIENT','MODERN'],['PRAISE','CRITICISE'],['VAGUE','PRECISE']]},
  {id:'store', bridge:function(a,b){ return 'a '+a+' is where '+b.toLowerCase()+' are kept'; },
   pairs:[['QUIVER','ARROWS'],['WALLET','NOTES'],['GRANARY','GRAIN'],['HANGAR','AIRCRAFT'],['ARMOURY','WEAPONS'],['ARCHIVE','RECORDS'],['LIBRARY','BOOKS'],['VAULT','VALUABLES'],['CELLAR','CASKS'],['GARAGE','CARS'],['WARDROBE','CLOTHES'],['FOLDER','DOCUMENTS'],['AQUARIUM','FISH'],['ATLAS','MAPS']]},
  {id:'home', bridge:function(a,b){ return 'a '+a+' is the home of a '+b; },
   pairs:[['KENNEL','DOG'],['STABLE','HORSE'],['STY','PIG'],['BURROW','RABBIT'],['NEST','BIRD'],['DEN','FOX'],['HIVE','BEE'],['COOP','HEN'],['EYRIE','EAGLE'],['LAIR','WOLF'],['DREY','SQUIRREL'],['HOLT','OTTER'],['WEB','SPIDER'],['SHELL','TORTOISE']]},
  {id:'cause', bridge:function(a,b){ return a+' leads to '+b; },
   pairs:[['VIRUS','INFECTION'],['DROUGHT','FAMINE'],['EXERCISE','FITNESS'],['FRICTION','HEAT'],['EARTHQUAKE','TSUNAMI'],['NEGLIGENCE','ACCIDENT'],['STUDY','KNOWLEDGE'],['OVEREATING','OBESITY'],['JOKE','LAUGHTER'],['INSOMNIA','FATIGUE'],['POLLUTION','SMOG'],['INFLATION','HARDSHIP'],['PRACTICE','SKILL'],['HEAT','EVAPORATION']]},
  {id:'member', bridge:function(a,b){ return 'a '+a+' is a kind of '+b; },
   pairs:[['MANGO','FRUIT'],['COBRA','SNAKE'],['OAK','TREE'],['SPARROW','BIRD'],['VIOLIN','INSTRUMENT'],['COPPER','METAL'],['WHALE','MAMMAL'],['TULIP','FLOWER'],['SONNET','POEM'],['DIAMOND','GEMSTONE'],['CRICKET','SPORT'],['SAREE','GARMENT'],['HILSA','FISH'],['BENGALI','LANGUAGE']]},
  {id:'place', bridge:function(a,b){ return 'a '+a+' works in a '+b; },
   pairs:[['CHEF','KITCHEN'],['PILOT','COCKPIT'],['JUDGE','COURTROOM'],['MONK','MONASTERY'],['MINER','MINE'],['ACTOR','STAGE'],['SCIENTIST','LABORATORY'],['CASHIER','BANK'],['NURSE','WARD'],['SAILOR','SHIP'],['TEACHER','CLASSROOM'],['ASTRONAUT','SPACECRAFT'],['LIBRARIAN','LIBRARY'],['FARMER','FIELD']]}
];
function lower(s){ return s.toLowerCase(); }
function pairText(p){ return p[0]+' : '+p[1]; }
function familyOf(a,b){
  for(var i=0;i<FAM.length;i++) for(var j=0;j<FAM[i].pairs.length;j++){
    var p=FAM[i].pairs[j];
    if(p[0]===a&&p[1]===b) return {fam:i, rev:false};
    if(p[0]===b&&p[1]===a) return {fam:i, rev:true};
  }
  return null;
}

GEN.add({
  id:'ie.analogy.pairs', topic:'ie.analogy', n:150, trick:'i.analogy.bridge',
  make:function(r,k,n){
    var tier=r.tier(k,n), fi=r.int(0,FAM.length-1), fam=FAM[fi];
    var two=r.sample(fam.pairs,3), stem=two[0], key=two[1], back=two[2];
    /* a word that appears in two families would blur the bridge */
    var words={}; FAM.forEach(function(f){ f.pairs.forEach(function(p){ words[p[0]]=(words[p[0]]||0)+1; words[p[1]]=(words[p[1]]||0)+1; }); });
    if(words[stem[0]]>1||words[stem[1]]>1||words[key[0]]>1||words[key[1]]>1) return null;
    var others=r.sample(FAM.filter(function(f,i){ return i!==fi; }), 4);
    var wrong=[W(back[1]+' : '+back[0],'The right relationship, written backwards: '+fam.bridge(lower(back[0]),lower(back[1]))+', not the other way round. Order matters.')];
    others.forEach(function(f){
      var p=r.pick(f.pairs);
      if(words[p[0]]>1||words[p[1]]>1) return;
      wrong.push(W(pairText(p), f.bridge(lower(p[0]),lower(p[1]))+' &mdash; a different relationship.'));
    });
    return {b: tier==='warm'?-0.4 : tier==='exam'?0.3 : 0.8,
      stem:'Choose the pair that best expresses a relationship similar to the one in the capitalised pair.<br><br><b>'+pairText(stem)+'</b>',
      correct:W(pairText(key),'Bridge: '+fam.bridge(lower(stem[0]),lower(stem[1]))+'. Likewise, '+fam.bridge(lower(key[0]),lower(key[1]))+'.'),
      wrong:wrong,
      fast:'Say the bridge as a sentence before reading the options: "'+fam.bridge(lower(stem[0]),lower(stem[1]))+'." Then test each pair in that exact sentence, in that order.',
      p:{fam:fi}};
  },
  verify:function(q){
    var fi=q.p.fam, ok=true;
    var stemPair=GEN.F.plain(q.stem).split(/\s+/).slice(-3);
    q.opts.forEach(function(o,i){
      var ab=o.split(' : '), f=familyOf(ab[0],ab[1]);
      if(!f){ ok=false; return; }
      var isKey = f.fam===fi && !f.rev;
      if(i===q.ans ? !isKey : isKey) ok=false;
    });
    return ok;
  }
});
})();
