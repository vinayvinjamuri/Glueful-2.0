const CACHE_NAME = "glueful-cache-v151-premium-ui";

const RUNTIME = [
  "./glueful-feature-loader-v1.js",
  "./glueful-app-branding-v1.js",
  "./glueful-mobile-update-guard-v2.js",
  "./glueful-resume-studio-supabase-bridge.js",
  "./glueful-critical-navigation-v1.js",
  "./glueful-ui-premium-v1.js"
];

const LEGACY_RUNTIME_NAMES = [
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
  html=html.replace(/<meta\s+name=["']viewport["']\s+content=["']([^"']*)["']\s*\/?>/i,(_,c)=>/interactive-widget\s*=\s*[^,\s]+/i.test(c)?`<meta name="viewport" content="${c}" />`:`<meta name="viewport" content="${c}, interactive-widget=resizes-content" />`);
  return html;
}
function injectRuntimeScripts(html){
  const tags=RUNTIME.map(src=>`<script src="${src}?v=151"></script>`).join("\n");
  return html.includes("</body>")?html.replace("</body>",`${tags}\n</body>`):`${html}\n${tags}`;
}
function noStoreRequest(request){
  try{return new Request(request,{cache:"no-store"})}catch(_){return request}
}

self.addEventListener("install",event=>{
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("message",event=>{
  if(event.data?.type==="GLUEFUL_SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate",event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
  for(const client of clients) client.postMessage({type:"GLUEFUL_SW_ACTIVATED",cache:CACHE_NAME});
})()));

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;

  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const network=await fetch(noStoreRequest(event.request));
        const text=await network.text();
        const patched=injectRuntimeScripts(patchStartupSequence(stripCompetingRuntime(text)));
        const headers=new Headers(network.headers);
        headers.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");
        return new Response(patched,{status:network.status,statusText:network.statusText,headers});
      }catch(error){
        const cached=await caches.match(event.request);
        if(cached)return cached;
        throw error;
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    try{
      const response=await fetch(noStoreRequest(event.request));
      if(response.ok){
        const copy=response.clone();
        event.waitUntil((async()=>{
          const cache=await caches.open(CACHE_NAME);
          await cache.put(event.request,copy);
        })());
      }
      return response;
    }catch(error){
      const cached=await caches.match(event.request);
      if(cached)return cached;
      throw error;
    }
  })());
});
