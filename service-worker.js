// LabOS 1.0.97 deployment reset worker.
// No offline runtime cache: rapid GitHub Pages updates must never be masked by stale assets.
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => /protolab|labos/i.test(k)).map(k => caches.delete(k)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});
