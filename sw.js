/* Glueful Service Worker V155
 * Stability recovery: the worker manages lifecycle/cache cleanup only.
 * It does not intercept page/resource fetches or inject runtime scripts.
 */
const CACHE_NAME = "glueful-cache-v155-stable";

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});
