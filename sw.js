const C='ironlog-v21';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.json','./icon.svg'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>clients.claim())));
// Seite: Netz zuerst (max. 2,5 s), sonst Speicher. Bilder und Rest: sofort aus dem Speicher, im Hintergrund erneuern.
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||/\.mp4$/.test(u.pathname))return;
  const doc=r.mode==='navigate'||/(^|\/)(index\.html)?$/.test(u.pathname);
  const keep=!u.search;
  if(doc){
    e.respondWith(new Promise(res=>{
      let done=false;const fall=()=>caches.match(r,{ignoreSearch:true}).then(m=>{if(m&&!done){done=true;res(m)}});
      const t=setTimeout(fall,2500);
      fetch(r).then(n=>{clearTimeout(t);if(keep){const cp=n.clone();caches.open(C).then(c=>c.put(r,cp))}if(!done){done=true;res(n)}}).catch(()=>{clearTimeout(t);fall().then(()=>{if(!done){done=true;res(new Response('offline',{status:503}))}})});
    }));
    return;
  }
  e.respondWith(caches.match(r).then(m=>{
    const n=fetch(r).then(x=>{if(x.ok&&keep){const cp=x.clone();caches.open(C).then(c=>c.put(r,cp))}return x}).catch(()=>m);
    return m||n;
  }));
});
self.addEventListener('push',e=>{
  let d={title:'Iron Log',body:''};
  try{d=e.data.json()}catch(_){}
  e.waitUntil(self.registration.showNotification(d.title,{body:d.body,tag:d.tag,icon:'icon-192.png',badge:'icon-192.png',vibrate:[400,150,400,150,800],renotify:true,requireInteraction:true,silent:false}));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow('./index.html'))});
