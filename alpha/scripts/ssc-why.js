#!/usr/bin/env node
/* Writes explanations into the SSC question files, a batch at a time.
   Run from the iceskep folder. scripts/ never goes into upload.zip.

     node scripts/ssc-why.js next [n]      print the next n questions with no explanation
     node scripts/ssc-why.js status        how many are done, per subject
     node scripts/ssc-why.js merge < file  read lines and save them, then print the next batch

   Merge lines:
     @ssc.sphy.ch1
     001|the explanation of the correct answer
     002?|why the key looks wrong (no explanation is saved; logged for the owner)

   The line goes in why[ans]; the other three stay empty, and the runner
   shows nothing for an empty line. */
var fs = require('fs'), path = require('path');
var DIR = 'js/data/', FLAGS = 'scripts/ssc-why-flags.tsv';
var ORDER = ['sphy', 'schem', 'sbio', 'smath', 'shm', 'sict', 'sbgs'];
var COMBO = ['i ও ii', 'i ও iii', 'ii ও iii', 'i, ii ও iii'];
var LINE = /^(\s*)(\{.*"id":"ssc\..*\})(,?)\s*$/;

function files(sj) {
  return fs.readdirSync(DIR).map(function (f) {
    var m = f.match(/^q-ssc-([a-z0-9]+)-ch(\d+)\.js$/);
    return m && m[1] === sj ? { f: DIR + f, n: +m[2] } : null;
  }).filter(Boolean).sort(function (a, b) { return a.n - b.n; }).map(function (x) { return x.f; });
}
function flags() {
  var o = {};
  if (fs.existsSync(FLAGS)) fs.readFileSync(FLAGS, 'utf8').split('\n').forEach(function (l) {
    if (l) o[l.split('\t')[0]] = 1;
  });
  return o;
}
function questions(f) {
  return fs.readFileSync(f, 'utf8').split('\n').map(function (l) { return l.match(LINE); }).filter(Boolean)
    .map(function (m) { return JSON.parse(m[2]); });
}
function show(q) {
  var id = q.id.split('.').pop();
  if (q.type === 'mcomp') {
    return id + ' ' + q.stem + ' | i. ' + q.sts[0] + ' | ii. ' + q.sts[1] + ' | iii. ' + q.sts[2] + ' => ' + COMBO[q.ans];
  }
  return id + ' ' + q.stem + ' | ' + q.opts.map(function (o, i) { return o + (i === q.ans ? ' *' : ''); }).join(' | ');
}
function next(n) {
  var fl = flags();
  for (var s = 0; s < ORDER.length; s++) {
    var fs_ = files(ORDER[s]);
    for (var i = 0; i < fs_.length; i++) {
      var left = questions(fs_[i]).filter(function (q) { return !q.why && !fl[q.id]; });
      if (left.length) {
        console.log('=== ' + left[0].topic + ' · ' + left.length + ' left in this chapter');
        left.slice(0, n).forEach(function (q) { console.log(show(q)); });
        return;
      }
    }
  }
  console.log('ALL DONE');
}
function status() {
  var fl = flags(), all = 0, done = 0;
  ORDER.forEach(function (sj) {
    var t = 0, d = 0, x = 0;
    files(sj).forEach(function (f) { questions(f).forEach(function (q) { t++; if (q.why) d++; else if (fl[q.id]) x++; }); });
    console.log(sj + ': ' + d + '/' + t + (x ? ' (' + x + ' flagged)' : ''));
    all += t; done += d;
  });
  console.log('total: ' + done + '/' + all + ' · flagged ' + Object.keys(fl).length);
}
function clean(s) {
  return s.trim().replace(/<(?!\/?(sup|sub|br)\b)/g, '&lt;').replace(/(^|[^a-z"\/])>/g, '$1&gt;');
}
function merge(text) {
  var byFile = {}, saved = 0, flagged = 0, prefix = '';
  text.split('\n').forEach(function (l) {
    if (!l.trim()) return;
    if (l.charAt(0) === '@') { prefix = l.slice(1).trim() + '.'; return; }
    var m = (prefix + l).match(/^(ssc\.([a-z0-9]+)\.ch(\d+)\.\d+)(\?)?\|(.+)$/);
    if (!m) { console.log('BAD LINE: ' + l.slice(0, 80)); process.exitCode = 1; return; }
    if (m[4]) { fs.appendFileSync(FLAGS, m[1] + '\t' + m[5].trim() + '\n'); flagged++; return; }
    var f = DIR + 'q-ssc-' + m[2] + '-ch' + m[3] + '.js';
    (byFile[f] = byFile[f] || {})[m[1]] = clean(m[5]);
  });
  Object.keys(byFile).forEach(function (f) {
    var want = byFile[f], hit = {};
    var out = fs.readFileSync(f, 'utf8').split('\n').map(function (l) {
      var m = l.match(LINE);
      if (!m) return l;
      var q = JSON.parse(m[2]);
      if (!want[q.id]) return l;
      hit[q.id] = 1;
      var why = ['', '', '', ''];
      why[q.ans] = want[q.id];
      q.why = why;
      saved++;
      return m[1] + JSON.stringify(q) + m[3];
    });
    fs.writeFileSync(f, out.join('\n'));
    Object.keys(want).forEach(function (id) {
      if (!hit[id]) { console.log('NOT FOUND: ' + id); process.exitCode = 1; }
    });
  });
  console.log('saved ' + saved + (flagged ? ', flagged ' + flagged : ''));
}

var cmd = process.argv[2];
if (cmd === 'next') next(+process.argv[3] || 70);
else if (cmd === 'status') status();
else if (cmd === 'merge') { merge(fs.readFileSync(0, 'utf8')); next(+process.argv[3] || 70); }
else console.log('next | status | merge');
