const CACHE_NAME = "glueful-cache-v144-critical-navigation";

/*
 * Only lightweight global scripts are injected globally.
 * Jobs / Resume / Orbit / Gmail / Dashboard code is loaded on demand
 * after its corresponding view becomes active.
 *
 * Critical navigation is global because hamburger/profile interaction must
 * never wait for the lazy dashboard feature group to finish booting.
 */
const RUNTIME = [
  "./glueful-feature-loader-v1.js",
  "./glueful-app-branding-v1.js",
  "./glueful-mobile-update-guard-v1.js",
  "./glueful-resume-studio-supabase-bridge.js",
  "./glueful-critical-navigation-v1.js"
];

const LEGACY_RUNTIME_NAMES=[
  "glueful-resume-studio-adobe.js",
  "glueful-resume-studio-v41",
  "glueful-resume-docauth-v50.js",
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
  "glueful-jobs-mobile-ux-v1.js",
  "glueful-jobs-infinite-feed-v1.js",
  "glueful-mobile-cleanup-v1.js",
  "glueful-orbit-keyboard-fix-v1.js",
  "glueful-orbit-keyboard-fix-v2.js",
  "glueful-orbit-keyboard-fix-v3.js",
  "glueful-smooth-runtime-v1.js",
  "glueful-jobs-scroll-recovery-v1.js",
  "glueful-jobs-page-scroll-fix-v1.js",
  "glueful-jobs-page-scroll-fix-v2.js",
  "glueful-jobs-page-scroll-fix-v3.js"
];

function escapeRegExp(v){return String(v).replace(/[.*+?^${}()|[\\]\\]/g,"\\$&")}
function stripCompetingRuntime(html){let out=html;for(const name of LEGACY_RUNTIME_NAMES)out=out.replace(new RegExp(`<script[^>]+src=[\\"'][^\\"']*${escapeRegExp(name)}(?:\\?[^\\"']*)?[\\"'][^>]*><\\/script>`,"gi"),"");return out}
function patchStartupSequence(html){
  const blocking=`        await loadAll();\n\n        renderAll();\n\n        /*\n         * The authenticated app is now ready:\n         * session + user data + rendering are complete.\n         */\n        hideGluefulSplash();`;
  const fast=`        renderAll();\n        hideGluefulSplash();\n        void loadAll().then(() => renderAll()).catch(error => console.error("[Glueful] Background account hydration failed:", error));`;
  if(html.includes(blocking))html=html.replace(blocking,fast);
  html=html.replace("        await syncPlacementPortalFromCloud(user);","        void syncPlacementPortalFromCloud(user).catch(error => console.warn(\"[Glueful] Placement portal background sync failed:\", error));");
  html=html.replace(/<meta\\s+name=[\\"']viewport[\\"']\\s+content=[\\"']([^\\"']*)[\\"']\\s*\\/?>/i,(_,c)=>/interactive-widget\\s*=\\s*[^,\\s]+/i.test(c)?`<meta name="viewport" content="${c}" />`:`<meta name="viewport" content="${c}, interactive-widget=resizes-content" />`);
  return html;
}
async function injectRuntimeScripts(html){const tags=RUNTIME.map(src=>`<script src="${src}"></script>`).join("\n");return html.includes("</body>")?html.replace("</body>",`${tags}\n</body>`):`${html}\n${tags}`}

self.addEventListener("install",e=>e.waitUntil((async()=>{const c=await caches.open(CACHE_NAME);await c.addAll(RUNTIME);await self.skipWaiting()})()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{const k=await caches.keys();await Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)));await self.clients.claim()})()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.mode==="navigate"){e.respondWith((async()=>{const n=await fetch(e.request);const t=await n.text();const p=await injectRuntimeScripts(patchStartupSequence(stripCompetingRuntime(t)));return new Response(p,{status:n.status,statusText:n.statusText,headers:n.headers})})());return}e.respondWith((async()=>{const c=await caches.match(e.request);if(c)return c;try{const r=await fetch(e.request);if(r.ok)e.waitUntil((async()=>{const x=await caches.open(CACHE_NAME);await x.put(e.request,r.clone())})());return r}catch(err){return c||Response.error()}})())});