// Este módulo agora usa o service worker principal do site (../sw.js), que guarda tudo para uso offline.
// Este arquivo só remove o service worker antigo do módulo, sem apagar o cache principal.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('aw139-rto-')).map((k) => caches.delete(k)));
    await self.registration.unregister();
  })());
});
