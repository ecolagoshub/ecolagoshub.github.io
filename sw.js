const C='eco-lagos-v2';
const FILES=['index.html','login.html','add.html','calendar.html','month.html','manifest.json','firebase-config.js',
 'css/base.css','css/login.css','css/add.css','css/calendar.css','css/month.css',
 'js/firebase.js','js/common.js','js/login.js','js/add.js','js/calendar.js','js/month.js',
 'icons/logo.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// Online: always fetch fresh files (so your edits show). Offline: use the saved copy.
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  const ok=u.origin===location.origin||/^(www\.gstatic\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname);
  if(e.request.method!=='GET'||!ok)return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r})
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
