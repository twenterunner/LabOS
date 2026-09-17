// LabOS REV 1.0.179 emergency reset worker.
// LabOS does not rely on offline caching. If this worker is registered by an older installation,
// navigations are network-first and all LabOS/ProtoLab Cache Storage entries are removed.
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => /protolab|labos/i.test(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request, { cache: 'no-store' }).catch(() => fetch('./index.html?labos_rev=1.0.179', { cache: 'no-store' })));
  }
});
