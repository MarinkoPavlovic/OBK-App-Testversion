const CACHE_NAME='objektermittlungs-app-offline-v6';
const CORE=['./','./index.html','./config.js','./manifest.json'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('objektermittlungs-app-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Excel data and Microsoft tokens are deliberately not stored in the HTTP cache.
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
 // Silent Microsoft callback: never replace the app shell cache with an auth URL.
 if(url.searchParams.has('code')||url.searchParams.has('error')){event.respondWith(fetch(request).catch(()=>caches.match('./index.html')));return;}
 event.respondWith(fetch(request).then(response=>{
 if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy)))}return response;
 }).catch(()=>caches.match('./index.html')));return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
 if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(c=>c.put(request,copy)))}return response;
 })));
});
