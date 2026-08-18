const CACHE_NAME = "glueful-cache-v2-resume-adobe";
const AUTHORITATIVE_RESUME_SCRIPT = "./glueful-resume-studio-adobe.js";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./glueful-resume-studio-adobe.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
  "./icons/icon-maskable-512.png"
];

async function networkResponse(request, preloadResponse) {
  const preloaded = await preloadResponse;
  if (preloaded) return preloaded;
  return fetch(request);
}

async function buildAuthoritativeIndex(request, preloadResponse) {
  const response = await networkResponse(request, preloadResponse);
  if (!response || !response.ok) return response;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();

  /* The controller is injected after the entire existing index runtime.
     This makes it the final open/reset Resume Studio controller without
     deleting V41/V50 code that may still be referenced by older clients. */
  if (html.includes(AUTHORITATIVE_RESUME_SCRIPT)) {
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  const script = `<script src="${AUTHORITATIVE_RESUME_SCRIPT}" data-glueful-authoritative-resume-studio="1"></script>`;
  const marker = "</body>";
  const injected = html.includes(marker)
    ? html.replace(marker, `${script}\n${marker}`)
    : `${html}\n${script}`;

  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");

  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function cacheIndexResponse(request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );

    if (self.registration.navigationPreload) {
      try {
        await self.registration.navigationPreload.enable();
      } catch (_) {}
    }

    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  /* HTML is network-first so deployments are not masked by an old index.
     A cached transformed index remains the offline fallback. */
  if (request.method === "GET" && request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await buildAuthoritativeIndex(request, event.preloadResponse);
        await cacheIndexResponse(request, response);
        return response;
      } catch (error) {
        console.warn("[Glueful SW] navigation network fetch failed:", error);
        return (await caches.match(request)) || (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  /* The authoritative controller is a normal versioned static asset. */
  if (request.method === "GET" && url.pathname.endsWith("/glueful-resume-studio-adobe.js")) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: "no-store" });
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) || Response.error();
      }
    })());
    return;
  }

  /* Other static resources use cache-first with a network refresh. */
  if (request.method === "GET") {
    event.respondWith((async () => {
      const cached = await caches.match(request);

      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return cached || Response.error();
      }
    })());
  }
});
