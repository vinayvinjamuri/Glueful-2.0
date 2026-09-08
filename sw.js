/* Glueful Service Worker V159
 * Current-runtime freshness policy.
 * Every same-origin GET is network-first so a newly deployed Glueful build
 * cannot be replaced by an older cached shell or feature asset.
 */
const CACHE_NAME = "glueful-cache-v159-current";

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
