const CACHE_NAME = "glueful-cache-v10-resume-header-regression";
const AUTHORITATIVE_RESUME_SCRIPT = "./glueful-resume-studio-adobe.js";
const DOCX_FORENSICS_SCRIPT = "./glueful-resume-docx-forensics.js";
const MOBILE_LAYOUT_SCRIPT = "./glueful-resume-studio-mobile-layout.js";
const HEADER_FIDELITY_SCRIPT = "./glueful-resume-header-fidelity.js";
const HEADER_ALIGNMENT_SCRIPT = "./glueful-resume-header-alignment.js";
const RENDER_DIAGNOSTICS_SCRIPT = "./glueful-resume-render-diagnostics.js";

const ASSETS = [
  "./manifest.json",
  "./glueful-resume-studio-adobe.js",
  "./glueful-resume-docx-forensics.js",
  "./glueful-resume-studio-mobile-layout.js",
  "./glueful-resume-header-fidelity.js",
  "./glueful-resume-header-alignment.js",
  "./glueful-resume-render-diagnostics.js",
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
  const scripts = [];
  if (!html.includes(DOCX_FORENSICS_SCRIPT)) scripts.push(`<script src="${DOCX_FORENSICS_SCRIPT}?v=20260819-5" data-glueful-docx-forensics="1"></script>`);
  if (!html.includes(AUTHORITATIVE_RESUME_SCRIPT)) scripts.push(`<script src="${AUTHORITATIVE_RESUME_SCRIPT}?v=20260819-5" data-glueful-authoritative-resume-studio="1"></script>`);
  if (!html.includes(MOBILE_LAYOUT_SCRIPT)) scripts.push(`<script src="${MOBILE_LAYOUT_SCRIPT}?v=20260819-6" data-glueful-mobile-layout="1"></script>`);
  if (!html.includes(HEADER_FIDELITY_SCRIPT)) scripts.push(`<script src="${HEADER_FIDELITY_SCRIPT}?v=20260819-3" data-glueful-header-fidelity="1"></script>`);
  if (!html.includes(HEADER_ALIGNMENT_SCRIPT)) scripts.push(`<script src="${HEADER_ALIGNMENT_SCRIPT}?v=20260819-2" data-glueful-header-alignment="1"></script>`);
  if (!html.includes(RENDER_DIAGNOSTICS_SCRIPT)) scripts.push(`<script src="${RENDER_DIAGNOSTICS_SCRIPT}?v=20260819-5" data-glueful-render-diagnostics="1"></script>`);

  if (!scripts.length) return new Response(html, { status: response.status, statusText: response.statusText, headers: response.headers });

  const marker = "</body>";
  const scriptBlock = scripts.join("\n");
  const injected = html.includes(marker) ? html.replace(marker, `${scriptBlock}\n${marker}`) : `${html}\n${scriptBlock}`;
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");
  return new Response(injected, { status: response.status, statusText: response.statusText, headers });
}

async function cacheIndexResponse(request, response) {
  if (!response || !response.ok) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  } catch (error) {
    console.warn("[Glueful SW] index cache write failed:", error);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.warn("[Glueful SW] asset precache failed; continuing with network startup:", error);
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
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
        event.waitUntil(cacheIndexResponse(request, response));
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
     url.pathname.endsWith("/glueful-resume-docx-forensics.js") ||
     url.pathname.endsWith("/glueful-resume-studio-mobile-layout.js") ||
     url.pathname.endsWith("/glueful-resume-header-fidelity.js") ||
     url.pathname.endsWith("/glueful-resume-header-alignment.js") ||
     url.pathname.endsWith("/glueful-resume-render-diagnostics.js"))
  ) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: "no-store" });
        if (response.ok) {
          event.waitUntil((async () => {
            try {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(request, response.clone());
            } catch (_) {}
          })());
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
          event.waitUntil((async () => {
            try {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(request, response.clone());
            } catch (_) {}
          })());
        }
        return response;
      } catch (_) {
        return cached || Response.error();
      }
    })());
  }
});
