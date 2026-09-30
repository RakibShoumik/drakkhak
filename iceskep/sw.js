/* ===========================================================
   Drakkhak service worker.

   Network first, cache second, for everything on this origin. The
   content banks are plain script files that get added to and
   corrected over time, and a cache-first worker would happily serve
   last month's questions forever. So: try the network, put whatever
   comes back in the cache, and fall back to the cache only when the
   network is not there. Everything the app needs is on this origin
   (the Bangla fonts included), so after one visit it runs offline.
   =========================================================== */
var CACHE = 'drakkhak-v128';
var CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './fonts/hind-siliguri-400.woff2',
  './fonts/hind-siliguri-500.woff2',
  './fonts/hind-siliguri-600.woff2',
  './fonts/hind-siliguri-700.woff2',
  './fonts/noto-serif-bengali.woff2',
  './img/favicon.svg',
  './img/icon-180.png',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/icon-64.png',
  './js/data/registry.js',
  './js/gen/core.js',
  './js/data/q-hsc-bangla1-ch1.js',
  './js/data/q-hsc-bangla1-ch10.js',
  './js/data/q-hsc-bangla1-ch11.js',
  './js/data/q-hsc-bangla1-ch12.js',
  './js/data/q-hsc-bangla1-ch13.js',
  './js/data/q-hsc-bangla1-ch14.js',
  './js/data/q-hsc-bangla1-ch15.js',
  './js/data/q-hsc-bangla1-ch16.js',
  './js/data/q-hsc-bangla1-ch17.js',
  './js/data/q-hsc-bangla1-ch18.js',
  './js/data/q-hsc-bangla1-ch19.js',
  './js/data/q-hsc-bangla1-ch2.js',
  './js/data/q-hsc-bangla1-ch20.js',
  './js/data/q-hsc-bangla1-ch21.js',
  './js/data/q-hsc-bangla1-ch22.js',
  './js/data/q-hsc-bangla1-ch23.js',
  './js/data/q-hsc-bangla1-ch24.js',
  './js/data/q-hsc-bangla1-ch25.js',
  './js/data/q-hsc-bangla1-ch26.js',
  './js/data/q-hsc-bangla1-ch3.js',
  './js/data/q-hsc-bangla1-ch4.js',
  './js/data/q-hsc-bangla1-ch5.js',
  './js/data/q-hsc-bangla1-ch6.js',
  './js/data/q-hsc-bangla1-ch7.js',
  './js/data/q-hsc-bangla1-ch8.js',
  './js/data/q-hsc-bangla1-ch9.js',
  './js/data/q-hsc-bio1-ch1.js',
  './js/data/q-hsc-bio1-ch10.js',
  './js/data/q-hsc-bio1-ch11.js',
  './js/data/q-hsc-bio1-ch12.js',
  './js/data/q-hsc-bio1-ch2.js',
  './js/data/q-hsc-bio1-ch3.js',
  './js/data/q-hsc-bio1-ch4.js',
  './js/data/q-hsc-bio1-ch5.js',
  './js/data/q-hsc-bio1-ch6.js',
  './js/data/q-hsc-bio1-ch7.js',
  './js/data/q-hsc-bio1-ch8.js',
  './js/data/q-hsc-bio1-ch9.js',
  './js/data/q-hsc-bio2-ch1.js',
  './js/data/q-hsc-bio2-ch10.js',
  './js/data/q-hsc-bio2-ch11.js',
  './js/data/q-hsc-bio2-ch12.js',
  './js/data/q-hsc-bio2-ch2.js',
  './js/data/q-hsc-bio2-ch3.js',
  './js/data/q-hsc-bio2-ch4.js',
  './js/data/q-hsc-bio2-ch5.js',
  './js/data/q-hsc-bio2-ch6.js',
  './js/data/q-hsc-bio2-ch7.js',
  './js/data/q-hsc-bio2-ch8.js',
  './js/data/q-hsc-bio2-ch9.js',
  './js/data/q-hsc-chem1-ch1.js',
  './js/data/q-hsc-chem1-ch2.js',
  './js/data/q-hsc-chem1-ch3.js',
  './js/data/q-hsc-chem1-ch4.js',
  './js/data/q-hsc-chem1-ch5.js',
  './js/data/q-hsc-chem2-ch1.js',
  './js/data/q-hsc-chem2-ch2.js',
  './js/data/q-hsc-chem2-ch3.js',
  './js/data/q-hsc-chem2-ch4.js',
  './js/data/q-hsc-chem2-ch5.js',
  './js/data/q-hsc-ict-ch1.js',
  './js/data/q-hsc-ict-ch2.js',
  './js/data/q-hsc-ict-ch3.js',
  './js/data/q-hsc-ict-ch4.js',
  './js/data/q-hsc-ict-ch5.js',
  './js/data/q-hsc-ict-ch6.js',
  './js/store.js',
  './js/fx.js',
  './js/ability.js',
  './js/learn.js',
  './js/plan.js',
  './js/clock.js',
  './js/predict.js',
  './js/charts.js',
  './js/game.js',
  './js/quests.js',
  './js/modes.js',
  './js/share.js',
  './js/i18n.js',
  './js/runner.js',
  './js/ui.js',
  './js/ui-pages.js',
  './js/map.js',
  './js/research.js',
  './js/stats.js',
  './js/boot.js'
];
/* the owner's settings file is not in the tool's list, so it is added here */
var EXTRA = ['./js/config.js'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    /* a data file that does not exist yet must not fail the install */
    return Promise.all(CORE.concat(EXTRA).map(function(u){ return c.add(u).catch(function(){}); }));
  }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ return k===CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;

  if(new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req).then(function(res){
      if(res && res.status===200 && res.type==='basic'){
        var copy=res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(req, {ignoreSearch:true}).then(function(hit){
        return hit || caches.match('./index.html');
      });
    })
  );
});

/* let the page force an update without a reload dance */
self.addEventListener('message', function(e){
  if(e.data === 'skipWaiting') self.skipWaiting();
});
