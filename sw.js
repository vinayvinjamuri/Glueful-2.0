const CACHE_NAME = "glueful-cache-v102-orbit-runtime-restore";

const RUNTIME = [
  "./glueful-resume-render-diagnostics.js",
  "./glueful-resume-fixed-page-bootstrap.js",
  "./glueful-resume-layout-model.js",
  "./glueful-resume-pdf-layout-importer.js",
  "./glueful-resume-fixed-page-renderer.js",
  "./glueful-resume-fixed-page-ux-v6.js",
  "./glueful-resume-fixed-page-controller.js",
  "./glueful-resume-vector-docx-export-v2.js",
  "./glueful-resume-typography-patch-v1.js",
  "./glueful-resume-import-guard-v1.js",
  "./glueful-resume-pdf-export-fix-v1.js",
  "./glueful-resume-viewer-v1.js",
  "./glueful-jobs-auth-bootstrap-v1.js",
  "./glueful-jobs-discover-v15-authoritative.js",
  "./glueful-jobs-relevance-v1.js",
  "./glueful-resume-studio-supabase-bridge.js",
  "./glueful-jobs-resume-action-v1.js",
  "./glueful-jobs-logo-patch-v1.js",
  "./glueful-jobs-mobile-card-polish-v1.js",
  "./glueful-jobs-mobile-ux-v15.js",
  "./glueful-jobs-smooth-logos-v1.js",
  "./glueful-jobs-feed-recovery-v2.js",
  "./glueful-jobs-official-link-guard-v1.js",
  "./glueful-mobile-update-guard-v1.js",
  "./glueful-app-branding-v1.js",
  "./glueful-gmail-loader-v1.js",
  "./glueful-orbit-bootstrap-v1.js",
  "./glueful-orbit-v2.js",
  "./glueful-orbit-ui-v3.js",
  "./glueful-orbit-ui-v6.js",
  "./glueful-dashboard-fixed-v1.js",
  "./glueful-dashboard-header-fix-v1.js",
  "./glueful-dashboard-hamburger-v2.js",
  "./glueful-dashboard-approved-v1.js"
];

const LEGACY_RUNTIME_NAMES = [
  "glueful-resume-studio-adobe.js",
  "glueful-resume-studio-v41",
  "glueful-resume-docauth-v50.js",
  "glueful-jobs-auth-bootstrap-v1.js",
  "glueful-jobs-discover-v3.js",
  "glueful-jobs-discover-v4.js",
  "glueful-jobs-discover-v5.js",
  "glueful-jobs-discover-v6-hotfix.js",
  "glueful-jobs-discover-v7.js",
  "glueful-jobs-discover-v8-interaction.js",
  "glueful-jobs-discover-v9-relevance-logo-interaction.js",
  "glueful-jobs-discover-v10-authoritative.js",
  "glueful-jobs-discover-v11-stable.js",
  "glueful-jobs-discover-v12-stable.js",
  "glueful-jobs-discover-v13-authoritative.js",
  "glueful-jobs-discover-v14-force.js",
  "glueful-jobs-discover-v15-authoritative.js",
  "glueful-jobs-relevance-v1.js",
  "glueful-jobs-resume-action-v1.js",
  "glueful-jobs-logo-patch-v1.js",
  "glueful-jobs-mobile-card-polish-v1.js",
  "glueful-jobs-mobile-ux-v1.js",
  "glueful-jobs-mobile-ux-v15.js",
  "glueful-jobs-official-link-guard-v1.js",
  "glueful-jobs-infinite-feed-v1.js",
  "glueful-mobile-cleanup-v1.js"
];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

function stripCompetingRuntime(html) {
  let out = html;
  for (const name of LEGACY_RUNTIME_NAMES) {
    out = out.replace(
      new RegExp(`<script[^>]+src=[\"'][^\"']*${escapeRegExp(name)}(?:\\?[^\"']*)?[\"'][^>]*><\\/script>`, "gi"),
      ""
    );
  }
  return out;
}

function patchStartupSequence(html) {
  const blocking = `        await loadAll();\n\n        renderAll();\n\n        /*\n         * The authenticated app is now ready:\n         * session + user data + rendering are complete.\n         */\n        hideGluefulSplash();`;
  const fast = `        /* Paint the authenticated shell first; hydrate account data in background. */\n        renderAll();\n        hideGluefulSplash();\n\n        void loadAll()\n          .then(() => renderAll())\n          .catch(error => console.error("[Glueful] Background account hydration failed:", error));`;
  if (html.includes(blocking)) html = html.replace(blocking, fast);
  html = html.replace(
    "        await syncPlacementPortalFromCloud(user);",
    "        void syncPlacementPortalFromCloud(user).catch(error => console.warn(\"[Glueful] Placement portal background sync failed:\", error));"
  );
  return html;
}

async function buildIndex(request, preloadResponse) {
  const response = (await preloadResponse) || await fetch(request, { cache: "no-store" });
  if (!response?.ok) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  let html = await response.text();
  html = patchStartupSequence(stripCompetingRuntime(html));
  const scripts = RUNTIME.map(src => `<script src="${src}"></script>`).join("\n");
  html = html.includes("</body>") ? html.replace("</body>", `${scripts}\n</body>`) : `${html}\n${scripts}`;

  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
}

async function cacheIndex(request, response) {
  if (!response?.ok) return;
  try { await (await caches.open(CACHE_NAME)).put(request, response.clone()); }
  catch (error) { console.warn("[Glueful SW] cache write failed:", error); }
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(["./manifest.json", ...RUNTIME]))
      .catch(error => console.warn("[Glueful SW] precache failed:", error))
      .finally(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    if (self.registration.navigationPreload) { try { await self.registration.navigationPreload.enable(); } catch (_) {} }
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "GLUEFUL_SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method === "GET" && request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await buildIndex(request, event.preloadResponse);
        event.waitUntil(cacheIndex(request, response));
        return response;
      } catch (error) {
        console.warn("[Glueful SW] navigation failed:", error);
        return (await caches.match(request)) || Response.error();
      }
    })());
    return;
  }

  if (request.method === "GET" && RUNTIME.some(path => url.pathname.endsWith(path.slice(2)))) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: "no-store" });
        if (response.ok) event.waitUntil((async () => {
          try { await (await caches.open(CACHE_NAME)).put(request, response.clone()); } catch (_) {}
        })());
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
        const response = await fetch(request, { cache: "no-store" });
        if (response.ok) event.waitUntil((async () => {
          try { await (await caches.open(CACHE_NAME)).put(request, response.clone()); } catch (_) {}
        })());
        return response;
      } catch (_) {
        return cached || Response.error();
      }
    })());
  }
});