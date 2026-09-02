const CACHE_NAME = "glueful-cache-v112-orbit-stability-v1";

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
  "./glueful-orbit-ui-v16.js",
  "./glueful-orbit-ui-v17.js",
  "./glueful-orbit-ai-bridge-v1.js",
  "./glueful-orbit-career-engine-v1.js",
  "./glueful-orbit-navigation-v1.js",
  "./glueful-orbit-stability-v1.js",
  "./glueful-dashboard-fixed-v1.js",
  "./glueful-dashboard-header-fix-v1.js",
  "./glueful-dashboard-hamburger-v2.js",
  "./glueful-dashboard-approved-v1.js"
];

const LEGACY_RUNTIME_NAMES = [
  "glueful-resume-studio-adobe.js","glueful-resume-studio-v41","glueful-resume-docauth-v50.js",
  "glueful-jobs-discover-v3.js","glueful-jobs-discover-v4.js","glueful-jobs-discover-v5.js",
  "glueful-jobs-discover-v6-hotfix.js","glueful-jobs-discover-v7.js","glueful-jobs-discover-v8-interaction.js",
  "glueful-jobs-discover-v9-relevance-logo-interaction.js","glueful-jobs-discover-v10-authoritative.js",
  "glueful-jobs-discover-v11-stable.js","glueful-jobs-discover-v12-stable.js","glueful-jobs-discover-v13-authoritative.js",
  "glueful-jobs-discover-v14-force.js","glueful-jobs-mobile-ux-v1.js","glueful-jobs-infinite-feed-v1.js","glueful-mobile-cleanup-v1.js"
];
function escapeRegExp(value){return String(value).replace(/[.*+?^${}()|[\\]\\]/g,"\\$&")}
function stripCompetingRuntime(html){let out=html;for(const name of LEGACY_RUNTIME_NAMES){out=out.replace(new RegExp(`<script[^>]+src=[\"'][^\"']*${escapeRegExp(name)}(?:\\?[^\"']*)?[\"'][^>]*><\\/script>`,"gi"),"")}return out}
function patchStartupSequence(html){
  const blocking=`        await loadAll();\n\n        renderAll();\n\n        /*\n         * The authenticated app is now ready:\n         * session + user data + rendering are complete.\n         */\n        hideGluefulSplash();`;
  const fast=`        renderAll();\n        hideGluefulSplash();\n        void loadAll().then(() => renderAll()).catch(error => console.error("[Glueful] Background account hydration failed:", error));`;
  if(html.includes(blocking))html=html.replace(blocking,fast);
  html=html.replace("        await syncPlacementPortalFromCloud(user);","        void syncPlacementPortalFromCloud(user).catch(error => console.warn(\"[Glueful] Placement portal background sync failed:\", error));");
  html=html.replace(/<meta\s+name=[\"']viewport[\"']\s+content=[\"']([^\"']*)[\"']\s*\/?>/i,(_,content)=>/interactive-widget\s*=\s*[^,\s]+/i.test(content)?`<meta name="viewport" content="${content}" />`:`<meta name="viewport" content="${content}, interactive-widget=resizes-content" />`);
  return html;
}
async function injectRuntimeScripts(html){const tags=RUNTIME.map(src=>`<script src="${src}"></script>`).join("\n");return html.includes("</body>")?html.replace("</body>",`${tags}\n</body>`):`${html}\n${tags}`}
self.addEventListener("install",event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);await cache.addAll(RUNTIME);await self.skipWaiting()})()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;const url=new URL(event.request.url);if(url.origin!==location.origin)return;if(event.request.mode==="navigate"){event.respondWith((async()=>{const network=await fetch(event.request);const text=await network.text();const patched=await injectRuntimeScripts(patchStartupSequence(stripCompetingRuntime(text)));return new Response(patched,{status:network.status,statusText:network.statusText,headers:network.headers})})());return}event.respondWith((async()=>{const cached=await caches.match(event.request);if(cached)return cached;try{const response=await fetch(event.request);if(response.ok)event.waitUntil((async()=>{const c=await caches.open(CACHE_NAME);await c.put(event.request,response.clone())})());return response}catch(e){return cached||Response.error()}})())});