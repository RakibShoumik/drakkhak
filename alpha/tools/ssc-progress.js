#!/usr/bin/env node
/* Rewrites PROGRESS-SSC.md: questions written per SSC chapter vs the 100 target. */
var vm=require('vm'),fs=require('fs'),path=require('path');
var R=path.join(__dirname,'..'),sb={ICE:{Q:[]}};vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(R,'js/data/ssc-registry.js'),'utf8'),sb);
fs.readdirSync(path.join(R,'js/data')).filter(function(f){return /^q-ssc/.test(f);}).forEach(function(f){vm.runInContext(fs.readFileSync(path.join(R,'js/data',f),'utf8'),sb);});
var c={};sb.ICE.Q.forEach(function(q){c[q.topic]=(c[q.topic]||0)+1;});
var L=['# SSC question progress','','Target: 100+ questions per chapter.','','| Chapter | Name | Have | Need |','|---|---|---|---|'];
var tot=0,short=0,n=0;Object.keys(sb.ICE.SSC.topics).forEach(function(k){var t=sb.ICE.SSC.topics[k],h=c[k]||0;n++;tot+=h;if(h<100)short++;L.push('| '+k+' | '+t.note+' | '+h+' | '+Math.max(0,100-h)+' |');});
var s='Chapters: '+n+' · questions: '+tot+' · chapters under 100: '+short;L.splice(3,0,s,'');
fs.writeFileSync(path.join(R,'PROGRESS-SSC.md'),L.join('\n')+'\n');console.log(s);
