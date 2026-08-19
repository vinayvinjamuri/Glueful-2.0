const CACHE_NAME = "glueful-cache-v6-resume-alignment";
const AUTHORITATIVE_RESUME_SCRIPT = "./glueful-resume-studio-adobe.js";
const DOCX_FORENSICS_SCRIPT = "./glueful-resume-docx-forensics.js";

const ASSETS = [
  "./manifest.json",
  "./glueful-resume-studio-adobe.js",
  "./glueful-resume-docx-forensics.js",
  "./glueful-resume-studio-mobile-layout.js",
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

  if (html.includes(AUTHORITATIVE_RESUME_SCRIPT) && html.includes(DOCX_FORENSICS_SCRIPT)) {
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  const scripts = [
    `<script src="${DOCX_FORENSICS_SCRIPT}?v=20260819-2" data-glueful-docx-forensics="1"></script>`,
    `<script src="${AUTHORITATIVE_RESUME_SCRIPT}?v=20260819-2" data-glueful-authoritative-resume-studio="1"></script>`
  ].join("\n");
  const marker = "</body>";
  const injected = html.includes(marker)
    ? html.replace(marker, `${scripts}\n${marker}`)
    : `${html}\n${scripts}`;

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
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }

    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method === "GET" && request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await buildAuthoritativeIndex(request, event.preloadResponse);
        await cacheIndexResponse(request, response);
        return response;
      } catch (error) {
        console.warn("[Glueful SW] navigation network fetch failed:", error);
        return (await caches.match(request)) || Response.error();
      }
    })());
    return;
  }

  if (
    request.method === "GET" &&
    (url.pathname.endsWith("/glueful-resume-studio-adobe.js") ||
     url.pathname.endsWith("/glueful-resume-docx-forensics.js"))
  ) {
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
