#!/usr/bin/env node
/* ===========================================================
   IceSkep HSC — content integrity check.

       node tools/check-data.js

   Loads every data file the way the browser does and audits it
   against DATA-SCHEMA.md. Run it after editing or adding any bank;
   a bad answer key or a chapter id that does not exist is not the
   sort of bug you want to discover while practising.

   Exit code 1 if anything is broken, 0 otherwise. Warnings never
   fail the run.
   =========================================================== */
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.join(__dirname, '..');
var DATA = path.join(ROOT, 'js', 'data');
var GENDIR = path.join(ROOT, 'js', 'gen');

/* ---------- load, in the order index.html loads them ---------- */
var sandbox = { console: console };
vm.createContext(sandbox);

var errors = [], warnings = [];
function fail(kind, where, msg){ errors.push('[' + kind + '] ' + where + ' — ' + msg); }
function warn(kind, where, msg){ warnings.push('[' + kind + '] ' + where + ' — ' + msg); }

function runAt(dir, file){
  var src = fs.readFileSync(path.join(dir, file), 'utf8');
  try { vm.runInContext(src, sandbox, {filename:file}); }
  catch(e){ fail('LOAD', file, e.message); }
}
function run(file){ runAt(DATA, file); }

run('registry.js');
runAt(GENDIR, 'core.js');
fs.readdirSync(DATA)
  .filter(function(f){ return /\.js$/.test(f) && f !== 'registry.js'; })
  .sort()
  .forEach(run);
/* js/gen/spare/ is deliberately not loaded: those are the IBA/GRE maths
   families, kept to be adapted for Higher Math and Physics numericals.
   They are not part of this app until a template is moved up a level. */
fs.readdirSync(GENDIR)
  .filter(function(f){ return /\.js$/.test(f) && f !== 'core.js'; })
  .sort()
  .forEach(function(f){ runAt(GENDIR, f); });

var ICE = sandbox.ICE, GEN = sandbox.GEN;
if(!ICE){ console.error('registry.js did not define ICE'); process.exit(1); }

/* expand the generators exactly as boot does */
var t0 = Date.now(), FIN = {};
try { FIN = ICE.finalize(); } catch(e){ fail('FINALIZE', 'ICE.finalize', e.stack || e.message); }
var finMs = Date.now() - t0;

/* every generator variant is re-solved by the template's own verify() */
var genStats = [];
(ICE.G || []).forEach(function(t){
  var made = ICE.Q.filter(function(q){ return q.tpl === t.id; });
  var bad = 0;
  if(!ICE.topics[t.topic]) return;                 /* parked, not shipped */
  if(t.id.indexOf(t.topic + '.') !== 0) fail('GEN', t.id, 'template id must start with its chapter id');
  if((t._made||0) < (t.n||24)) warn('GEN', t.id, 'produced ' + (t._made||0) + ' of ' + (t.n||24) + ' variants — too many draws rejected');
  if(typeof t.verify !== 'function') warn('GEN', t.id, 'has no verify() — its answers are unchecked');
  else made.forEach(function(q){
    var ok;
    try { ok = t.verify(q); } catch(e){ ok = false; }
    if(!ok){ bad++; if(bad <= 3) fail('GENKEY', q.id, 'verify() disagrees with the key: ' + String(q.stem).replace(/<[^>]+>/g,'').slice(0,90)); }
  });
  genStats.push({id:t.id, n:made.length, bad:bad});
});

/* ---------- audit ---------- */
var TYPES = ['mc','mcomp'];
var ids = {}, passageIds = {}, trickIds = {};
var perTopic = {}, perType = {}, perSec = {}, bAll = [], passageUse = {};

ICE.P.forEach(function(p){
  if(passageIds[p.id]) fail('DUP', p.id, 'উদ্দীপক id used twice');
  passageIds[p.id] = p;
  if(!p.text) fail('PASSAGE', p.id, 'no text');
  if(!ICE.topics[p.topic]) fail('TOPIC', p.id, 'unknown chapter "' + p.topic + '"');
  passageUse[p.id] = 0;
});
ICE.T.forEach(function(t){
  if(trickIds[t.id]) fail('DUP', t.id, 'card id used twice');
  trickIds[t.id] = t;
  if(!ICE.topics[t.topic]) fail('TOPIC', t.id, 'unknown chapter "' + t.topic + '"');
  (t.also||[]).forEach(function(a){
    if(!ICE.topics[a]) warn('TOPIC', t.id, 'unknown "also" chapter "' + a + '"');
  });
  if(!t.one) fail('CARD', t.id, 'no one-line statement');
  if(!t.name) fail('CARD', t.id, 'no name');
});

/* A board MCQ is written from a specific page of a specific chapter, and
   the page number is the only way an audit session can check it. */
function pageTags(q){
  return (q.tags||[]).filter(function(x){ return /^p\d+$/.test(String(x)); })
                     .map(function(x){ return parseInt(String(x).slice(1),10); });
}

ICE.Q.forEach(function(q){
  var at = q.id || '(no id)';

  if(!q.id) fail('ID', at, 'missing id');
  else if(ids[q.id]) fail('DUP', q.id, 'question id used twice');
  ids[q.id] = q;

  var top = ICE.topics[q.topic];
  if(!top){ fail('TOPIC', at, 'unknown chapter "' + q.topic + '"'); return; }
  perTopic[q.topic] = (perTopic[q.topic]||0) + 1;
  perType[q.type] = (perType[q.type]||0) + 1;
  perSec[top.sec] = (perSec[top.sec]||0) + 1;

  if(q.id && q.id.indexOf(q.topic + '.') !== 0)
    warn('ID', at, 'does not start with its chapter id');

  if(TYPES.indexOf(q.type) < 0) fail('TYPE', at, 'unknown type "' + q.type + '" — this edition has mc and mcomp');
  if(typeof q.b !== 'number') fail('B', at, 'difficulty b is not a number');
  else { bAll.push(q.b); if(q.b < -3 || q.b > 3) warn('B', at, 'b = ' + q.b + ' is off the scale'); }
  if(!q.stem) fail('STEM', at, 'no stem');
  if(!q.fast) warn('FAST', at, 'no fast line — how to get there quickly, or what to remember');
  if(!q.why) warn('WHY', at, 'no why array');
  if(q.trick && !trickIds[q.trick]) warn('CARD', at, 'card "' + q.trick + '" does not exist');
  if(q.passage){
    if(!passageIds[q.passage]) fail('PASSAGE', at, 'উদ্দীপক "' + q.passage + '" does not exist');
    else {
      passageUse[q.passage]++;
      if(passageIds[q.passage].topic !== q.topic)
        fail('PASSAGE', at, 'উদ্দীপক "' + q.passage + '" belongs to another chapter');
    }
  }

  /* the page the fact came from */
  if(!q.gen){
    var pages = pageTags(q);
    if(!pages.length) warn('PAGE', at, 'no page tag (e.g. p' + top.p0 + ') — an audit cannot find the fact');
    else pages.forEach(function(p){
      if(p < top.p0 || p > top.p1)
        fail('PAGE', at, 'page p' + p + ' is outside this chapter (' + top.p0 + '–' + top.p1 + ')');
    });
  }

  /* options and key */
  var opts = q.type === 'mcomp' ? ICE.FIXED.mcomp : (q.opts || []);
  if(q.type === 'mcomp'){
    if(q.opts) warn('MCOMP', at, 'has its own opts — the four combinations are fixed');
    if(!Array.isArray(q.sts) || q.sts.length !== 3)
      fail('MCOMP', at, 'needs exactly three statements in sts');
    else q.sts.forEach(function(x, i){
      if(!x || !String(x).trim()) fail('MCOMP', at, 'statement ' + ['i','ii','iii'][i] + ' is empty');
    });
  } else {
    if(opts.length !== ICE.OPTS) fail('OPTS', at, 'has ' + opts.length + ' options; a board MCQ has ' + ICE.OPTS);
    if(opts.length !== new Set(opts.map(String)).size)
      fail('MC', at, 'two options are identical — one of them cannot be marked');
  }
  checkIndex(at, q.ans, opts.length);
  checkWhy(at, q.why, opts.length, q.ans);

  /* questions are written, not copied */
  if(/[A-Za-z]/.test(String(q.stem)) && top.sec !== 'hsc/english1' && !q.gen){
    var latin = String(q.stem).replace(/<[^>]+>/g,'').replace(/&[a-z]+;/g,'')
                              .match(/[A-Za-z]{4,}/g) || [];
    if(latin.length > 6) warn('LANG', at, 'a lot of English in a Bangla paper’s stem');
  }
});

function checkIndex(at, ans, n){
  if(typeof ans !== 'number' || ans < 0 || ans >= n || ans !== Math.floor(ans))
    fail('ANS', at, 'ans = ' + JSON.stringify(ans) + ' is not a valid index into ' + n + ' options');
}
/* The correct option's line is allowed to be terse — after a miss the app
   shows the fast-route box underneath it, which carries the real
   explanation. A terse line on a WRONG option is a genuine gap: that line
   exists to name the specific mistake that made the distractor tempting. */
function checkWhy(at, why, n, ans){
  if(!Array.isArray(why)) return;
  if(why.length !== n) warn('WHY', at, 'has ' + why.length + ' lines for ' + n + ' options');
  why.forEach(function(w, i){
    if(i === ans) return;
    if(!w || String(w).trim().length < 12)
      warn('WHY', at, 'option ' + (ICE.KEYS[i]||i) + ' has no real explanation');
  });
}

/* an উদ্দীপক is shared by two questions: one alone wastes the scenario,
   three is not the board's habit */
Object.keys(passageUse).forEach(function(id){
  var n = passageUse[id];
  if(n === 0) warn('PASSAGE', id, 'no questions use this উদ্দীপক');
  else if(n !== 2) warn('PASSAGE', id, n + ' questions use it — the board sets two');
});

/* chapters with nothing in them */
var empty = 0;
Object.keys(ICE.topics).forEach(function(k){
  if(!perTopic[k]) empty++;
});

/* ---------- report ---------- */
function pad(s, n){ s = String(s); while(s.length < n) s += ' '; return s; }

var shuf = ICE.Q.filter(function(q){ return q.type === 'mc' && ICE.shuffleable(q); }).length;
var mcAll = ICE.Q.filter(function(q){ return q.type === 'mc'; }).length;
var keyDist = [0,0,0,0];
ICE.Q.forEach(function(q){ if(typeof q.ans === 'number' && q.ans < 4) keyDist[q.ans]++; });

console.log('\nIceSkep HSC content check');
console.log('=========================\n');
console.log('  questions   ' + ICE.Q.length);
console.log('  উদ্দীপক      ' + ICE.P.length);
console.log('  cards       ' + ICE.T.length);
console.log('  chapters    ' + Object.keys(ICE.topics).length + ' (' + empty + ' still empty)');

console.log('\n  by type');
Object.keys(perType).sort().forEach(function(t){
  console.log('    ' + pad(t, 8) + pad(perType[t], 6) + Math.round(100*perType[t]/Math.max(1,ICE.Q.length)) + '%');
});

console.log('\n  by paper');
ICE.sectionsOf('hsc').forEach(function(sec){
  var sk = 'hsc/' + sec.id, tops = ICE.topicsOf(sk), done = 0;
  tops.forEach(function(t){ if(perTopic[t.id]) done++; });
  console.log('    ' + pad(sec.name, 26) + pad(perSec[sk]||0, 6) + 'questions, ' + done + ' of ' + tops.length + ' chapters written');
});

console.log('\n  expanded at start-up in ' + finMs + ' ms');
console.log('    generated questions      ' + (FIN.generated||0) + ' from ' + (ICE.G||[]).length + ' templates');
console.log('    templates parked         ' + (FIN.parked||0) + ' (js/gen/spare, not in this edition)');
var genBad = genStats.filter(function(g){ return g.bad; });
console.log('    generator keys verified  ' + (genBad.length ? genBad.length + ' TEMPLATES FAILING' : 'all'));

console.log('\n  answer position');
console.log('    options shuffled on screen: ' + shuf + ' of ' + mcAll + ' simple items');
var tot = keyDist.reduce(function(a,b){ return a+b; },0) || 1;
console.log('    keys as written  ' + keyDist.map(function(v,i){
  return (ICE.KEYS[i]||i) + ' ' + Math.round(100*v/tot) + '%'; }).join('  '));

if(bAll.length){
  var easy = bAll.filter(function(b){ return b < ICE.EXAM_B; }).length;
  var mid  = bAll.filter(function(b){ return b >= ICE.EXAM_B && b < ICE.HARD_B; }).length;
  var hard = bAll.filter(function(b){ return b >= ICE.HARD_B; }).length;
  var n = bAll.length;
  console.log('\n  difficulty (policy: warm-ups about 10%, the rest at or above the board)');
  console.log('    warm-up       b < ' + ICE.EXAM_B + '       ' + pad(easy, 6) + Math.round(100*easy/n) + '%');
  console.log('    board level   ' + ICE.EXAM_B + ' to ' + ICE.HARD_B + '   ' + pad(mid, 6) + Math.round(100*mid/n) + '%');
  console.log('    harder        b >= ' + ICE.HARD_B + '     ' + pad(hard, 6) + Math.round(100*hard/n) + '%');
  if(easy/n > 0.2) warnings.push('[SPREAD] whole bank — ' + Math.round(100*easy/n) +
    '% of items are warm-ups; the policy is about 10%');
}

if(warnings.length){
  console.log('\n' + warnings.length + ' warning' + (warnings.length===1?'':'s'));
  warnings.slice(0, 40).forEach(function(w){ console.log('  ' + w); });
  if(warnings.length > 40) console.log('  ...and ' + (warnings.length-40) + ' more');
}
if(errors.length){
  console.log('\n' + errors.length + ' ERROR' + (errors.length===1?'':'S'));
  errors.forEach(function(e){ console.log('  ' + e); });
  console.log('');
  process.exit(1);
}
console.log('\nNo errors.\n');
