const CACHE_NAME = "glueful-cache-v95-startup-shell";

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
  "./glueful-mobile-cleanup-v1.js",
  "./glueful-gmail-loader-v1.js",
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
  "glueful-jobs-infinite-feed-v1.js"
];

const EARLY_STARTUP_BLOCK = `
<style id="glueful-early-startup-paint">
  html, body { margin:0 !important; padding:0 !important; min-height:100% !important; background:#070A10 !important; color-scheme:dark !important; }
  #glueful-early-splash { position:fixed; inset:0; z-index:2147483646; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 50% 45%,rgba(92,63,220,.16),transparent 28%),radial-gradient(circle at 20% 20%,rgba(47,111,255,.08),transparent 22%),#070A10; color:#fff; font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
  #glueful-early-splash .early-logo { width:86px; height:86px; border-radius:24px; display:flex; align-items:center; justify-content:center; background:linear-gradient(145deg,#7B36FF,#286DFF); font:700 47px/1 "Space Grotesk",Inter,system-ui,sans-serif; box-shadow:0 0 22px rgba(112,61,255,.65),0 0 65px rgba(47,111,255,.28); }
</style>
<div id="glueful-early-splash" aria-hidden="true"><div class="early-logo">G</div></div>
<script>
(function(){
  function handoff(){var early=document.getElementById("glueful-early-splash");var real=document.getElementById("glueful-splash");if(early&&real)early.remove();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",handoff,{once:true});else handoff();
  var observer=new MutationObserver(function(){if(document.getElementById("glueful-splash"))handoff();});
  observer.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(function(){observer.disconnect();},15000);
})();
</script>
`;

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
  /* Do not make the authenticated shell wait for cloud data. The existing
     renderDashboard() already paints the Job Network monitor with Loading…
     placeholders, while refreshIngestionMonitor() runs independently. */
  html = html.replace(
    '        await syncPlacementPortalFromCloud(user);',
    '        void syncPlacementPortalFromCloud(user).catch(error => console.warn("[Glueful] Placement portal background sync failed:", error));'
  );

  const blockingSequence = `        await loadAll();\n\n        renderAll();\n\n        /*\n         * The authenticated app is now ready:\n         * session + user data + rendering are complete.\n         */\n        hideGluefulSplash();`;

  const fastSequence = `        /*\n         * FAST STARTUP: paint the authenticated shell immediately.\n         * Dashboard/Job Network starts with its existing Loading… state.\n         * Cloud-backed applications/interviews/resumes hydrate in the\n         * background and render again when the data is available.\n         */\n        renderAll();\n        hideGluefulSplash();\n\n        void loadAll()\n          .then(() => {\n            renderAll();\n          })\n          .catch(error => {\n            console.error("[Glueful] Background account hydration failed:", error);\n          });`;

  if (html.includes(blockingSequence)) {
    html = html.replace(blockingSequence, fastSequence);
  }

  return html;
}

async function networkResponse(request, preloadResponse) {
  return (await preloadResponse) || fetch(request, { cache: "no-store" });
}

async function buildAuthoritativeIndex(request, preloadResponse) {
  const response = await networkResponse(request, preloadResponse);
  if (!response?.ok) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  let html = await response.text();
  html = stripCompetingRuntime(html);
  html = patchStartupSequence(html);

  /* Put the startup shell before the first external CDN script so the WebView
     cannot show a white frame while the parser waits for Supabase/fonts. */
  const headMarker = "<head>";
  if (html.includes(headMarker) && !html.includes("glueful-early-startup-paint")) {
    html = html.replace(headMarker, `${headMarker}\n${EARLY_STARTUP_BLOCK}`);
  }

  const scripts = RUNTIME.map((src) => `<script src="${src}"></script>`);
  const marker = "</body>";
  const block = scripts.join("\n");
  const injected = html.includes(marker) ? html.replace(marker, `${block}\n${marker}`) : `${html}\n${block}`;
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return new Response(injected, { status: response.status, statusText: response.statusText, headers });
}

async function cacheIndexResponse(request, response) {
  if (!response?.ok) return;
  try { const cache = await caches.open(CACHE_NAME); await cache.put(request, response.clone()); }
  catch (error) { console.warn("[Glueful SW] index cache write failed:", error); }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(["./manifest.json", ...RUNTIME]))
      .catch((error) => console.warn("[Glueful SW] precache failed:", error))
      .finally(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    if (self.registration.navigationPreload) { try { await self.registration.navigationPreload.enable(); } catch (_) {} }
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "GLUEFUL_SKIP_WAITING") self.skipWaiting();
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
        console.warn("[Glueful SW] navigation failed:", error);
        return (await caches.match(request)) || Response.error();
      }
    })());
    return;
  }
  if (request.method === "GET" && RUNTIME.some((path) => url.pathname.endsWith(path.slice(2)))) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: "no-store" });
        if (response.ok) event.waitUntil((async () => { try { const cache = await caches.open(CACHE_NAME); await cache.put(request, response.clone()); } catch (_) {} })());
        return response;
      } catch (_) { return (await caches.match(request)) || Response.error(); }
    })());
    return;
  }
  if (request.method === "GET") {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      try {
        const response = await fetch(request, { cache: "no-store" });
        if (response.ok) event.waitUntil((async () => { try { const cache = await caches.open(CACHE_NAME); await cache.put(request, response.clone()); } catch (_) {} })());
        return response;
      } catch (_) { return cached || Response.error(); }
    })());
  }
});
