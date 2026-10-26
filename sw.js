const CACHE='rezepte-shell-v4-1';
const BASE=new URL('./',self.location.href);
const ASSETS=['./','./index.html','./app.js','./style.css','./recipe.css','./icon.svg','./IMG_0526.png','./manifest.webmanifest','./config.json','./Read.txt','./ei.html','./impressum.html'].map(p=>new URL(p,BASE).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('rezepte-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET'||!ASSETS.includes(req.url))return;
 event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;}).catch(()=>caches.match(req)));
});
self.addEventListener('message',event=>{if(event.data?.type==='GARDEN_REQUEST_ACTIVATION')self.skipWaiting();});
