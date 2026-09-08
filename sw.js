/* Glueful Service Worker V160
 * Current-runtime freshness policy.
 * Every same-origin GET is network-first so a newly deployed Glueful build
 * cannot be replaced by an older cached shell or feature asset.
 * When a new worker activates, controlled pages are reloaded once so the
 * newest deployed runtime is actually displayed.
 */
const CACHE_NAME = "glueful-cache-v160-current";

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

    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    await Promise.all(
      clients.map(client => {
        try {
          return client.navigate(client.url);
        } catch (error) {
          return Promise.resolve();
        }
      })
    );
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin || request.method !== "GET") return;

  // Online: always use the deployed files. Offline: use the current cache.
  event.respondWith(
    fetch(new Request(request, { cache: "no-store" }))
      .then(response => response)
      .catch(() => caches.match(request).then(cached => cached || Response.error()))
  );
});
