/* Glueful Service Worker V156
 * Runtime freshness recovery: Glueful-owned JavaScript resources are always
 * fetched from the current Pages deployment instead of an older HTTP cache.
 */
const CACHE_NAME = "glueful-cache-v156-stable";

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

  // Force the app's own versioned/unversioned JS files to revalidate.
  // This specifically defeats stale browser/CDN responses for old query
  // strings such as ?v=149, ?v=177, or ?v=178 without touching third-party JS.
  if (
    url.origin === self.location.origin &&
    url.pathname.includes("/glueful-") &&
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      fetch(new Request(event.request, { cache: "no-store" }))
        .catch(() => fetch(event.request))
    );
  }
});
