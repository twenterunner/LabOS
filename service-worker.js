// ProtoLab OS 1.0.3 cache reset worker.
// The POC no longer keeps an offline asset cache because stale service-worker
// assets can mask newly deployed GitHub Pages files during rapid iteration.
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('protolab-os')).map(k => caches.delete(k)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});
