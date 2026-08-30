const CACHE_NAME = "glueful-cache-v100-orbit-keyboard-fix";

const RUNTIME = [
  "./glueful-resume-render-diagnostics.js",
  "./glueful-resume-fixed-page-bootstrap.js",
  "./glueful-orbit-v2.js",
  "./glueful-orbit-ui-v6.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(RUNTIME))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isRuntime = RUNTIME.some(path => url.pathname.endsWith(path.replace("./", "/")));

  if (!isRuntime) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});