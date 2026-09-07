/* Glueful Service Worker V158
 * Hard freshness recovery for the current Glueful shell and all Glueful-owned assets.
 */
const CACHE_NAME = "glueful-cache-v158-stable";

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
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  // Never let an old cached shell/bootstrap win over the latest deployment.
  if (
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/glueful-client-bootstrap-v1.js") ||
    (url.pathname.includes("/glueful-") && url.pathname.endsWith(".js"))
  ) {
    event.respondWith(
      fetch(new Request(event.request, { cache: "no-store" }))
        .catch(() => fetch(event.request))
    );
  }
});