const CACHE_NAME="glueful-cache-v70-phase1-runtime";
const RUNTIME_BOOTSTRAP="./glueful-runtime-bootstrap-v1.js";
const ASSETS=["./manifest.json",RUNTIME_BOOTSTRAP,"./icons/icon-192.png","./icons/icon-512.png","./icons/icon-180.png","./icons/icon-maskable-512.png"];
async function networkResponse(request,preloadResponse){return (await preloadResponse)||fetch(request,{cache:"no-store"})}
function stripCompetingRuntime(html){return html
.replace(/<script[^>]+src=["'][^"']*glueful-runtime-bootstrap-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
.replace(/<script[^>]+src=["'][^"']*glueful-resume-studio-adobe\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
.replace(/<script[^>]+src=["'][^"']*glueful-resume-studio-v41(?:-[^"']*)?\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
.replace(/<script[^>]+src=["'][^"']*glueful-resume-docauth-v50\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
.replace(/<script[^>]+src=["'][^"']*glueful-jobs-auth-bootstrap-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
.replace(/<script[^>]+src=["'][^"']*glueful-jobs-discover-v[0-9]+(?:-[^"']*)?\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
.replace(/<script[^>]+src=["'][^"']*glueful-jobs-relevance-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
.replace(/<script[^>]+src=["'][^"']*glueful-jobs-resume-action-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
.replace(/<script[^>]+src=["'][^"']*glueful-jobs-logo-patch-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
.replace(/<script[^>]+src=["'][^"']*glueful-jobs-official-link-guard-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
.replace(/<script[^>]+src=["'][^"']*glueful-mobile-update-guard-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"");}
async function buildAuthoritativeIndex(request,preloadResponse){const response=await networkResponse(request,preloadResponse);if(!response?.ok)return response;const type=response.headers.get("content-type")||"";if(!type.includes("text/html"))return response;let html=await response.text();html=stripCompetingRuntime(html);const block=`<script src="${RUNTIME_BOOTSTRAP}?v=20260821-phase1-runtime1" data-glueful-runtime="phase1-bootstrap"></script>`;const marker="</body>";const injected=html.includes(marker)?html.replace(marker,`${block}\n${marker}`):`${html}\n${block}`;const headers=new Headers(response.headers);headers.set("Content-Type","text/html; charset=UTF-8");headers.set("Cache-Control","no-store, no-cache, must-revalidate");return new Response(injected,{status:response.status,statusText:response.statusText,headers})}
async function cacheIndexResponse(request,response){if(!response?.ok)return;try{const c=await caches.open(CACHE_NAME);await c.put(request,response.clone())}catch(e){console.warn("[Glueful SW] index cache write failed:",e)}}
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()).catch(err=>{console.warn("[Glueful SW] precache failed:",err);return self.skipWaiting()})));
self.addEventListener("activate",e=>e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));if(self.registration.navigationPreload){try{await self.registration.navigationPreload.enable()}catch(_){}}await self.clients.claim()})()));
self.addEventListener("message",e=>{if(e.data?.type==="GLUEFUL_SKIP_WAITING")self.skipWaiting()});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;if(r.mode==="navigate"){e.respondWith((async()=>{try{const res=await buildAuthoritativeIndex(r,e.preloadResponse);e.waitUntil(cacheIndexResponse(r,res));return res}catch(err){console.warn("[Glueful SW] navigation failed:",err);return(await caches.match(r))||Response.error()}})());return}e.respondWith((async()=>{const cached=await caches.match(r);try{const res=await fetch(r,{cache:"no-store"});if(res.ok)e.waitUntil((async()=>{try{const c=await caches.open(CACHE_NAME);await c.put(r,res.clone())}catch(_){}})());return res}catch(_){return cached||Response.error()}})())});
