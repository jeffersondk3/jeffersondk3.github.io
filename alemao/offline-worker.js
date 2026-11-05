'use strict';
const CACHE='deutsch-offline-v1';
const root=new URL('./',self.location.href);
const shell=new URL('offline.html',root).href;
const data=new URL('data.json',root).href;
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);try{await cache.addAll([new Request(shell,{cache:'reload'}),new Request(data,{cache:'reload'})]);await self.skipWaiting()}catch(error){await caches.delete(CACHE);throw error}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('deutsch-offline-')&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==root.origin)return;
 const isShell=url.pathname===new URL(shell).pathname,isData=url.href===data;
 const isHome=event.request.mode==='navigate'&&(url.pathname===root.pathname||url.pathname===root.pathname+'index.html');
 if(!isShell&&!isData&&!isHome)return;
 event.respondWith((async()=>{try{return await fetch(event.request)}catch(error){const cache=await caches.open(CACHE);const response=await cache.match(isData?data:shell);if(response)return response;throw error}})());
});
