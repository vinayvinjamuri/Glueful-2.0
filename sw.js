const CACHE_NAME="glueful-cache-v53-jobs-v6-authoritative";
const RENDER_DIAGNOSTICS_SCRIPT="./glueful-resume-render-diagnostics.js";
const FIXED_PDF_BOOTSTRAP="./glueful-resume-fixed-page-bootstrap.js";
const FIXED_PDF_MODEL="./glueful-resume-layout-model.js";
const FIXED_PDF_IMPORTER="./glueful-resume-pdf-layout-importer.js";
const FIXED_PDF_RENDERER="./glueful-resume-fixed-page-renderer.js";
const FIXED_PDF_UX="./glueful-resume-fixed-page-ux-v6.js";
const FIXED_PDF_CONTROLLER="./glueful-resume-fixed-page-controller.js";
const FIXED_PDF_DOCX_EXPORT_V2="./glueful-resume-vector-docx-export-v2.js";
const FIXED_PDF_TYPOGRAPHY="./glueful-resume-typography-patch-v1.js";
const RESUME_IMPORT_GUARD="./glueful-resume-import-guard-v1.js";
const PDF_EXPORT_FIX="./glueful-resume-pdf-export-fix-v1.js";
const JOBS_AUTH="./glueful-jobs-auth-bootstrap-v1.js";
const JOBS_V6="./glueful-jobs-discover-v6.js";
const RUNTIME=[RENDER_DIAGNOSTICS_SCRIPT,FIXED_PDF_BOOTSTRAP,FIXED_PDF_MODEL,FIXED_PDF_IMPORTER,FIXED_PDF_RENDERER,FIXED_PDF_UX,FIXED_PDF_CONTROLLER,FIXED_PDF_DOCX_EXPORT_V2,FIXED_PDF_TYPOGRAPHY,RESUME_IMPORT_GUARD,PDF_EXPORT_FIX,JOBS_AUTH,JOBS_V6];
const ASSETS=["./manifest.json",...RUNTIME,"./icons/icon-192.png","./icons/icon-512.png","./icons/icon-180.png","./icons/icon-maskable-512.png"];
async function networkResponse(request,preloadResponse){return (await preloadResponse)||fetch(request,{cache:"no-store"})}
function stripCompetingRuntime(html){return html
 .replace(/<script[^>]+src=["'][^"']*glueful-jobs-auth-bootstrap-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
 .replace(/<script[^>]+src=["'][^"']*glueful-jobs-discover-v3\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
 .replace(/<script[^>]+src=["'][^"']*glueful-jobs-discover-v4\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
 .replace(/<script[^>]+src=["'][^"']*glueful-jobs-discover-v5\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
 .replace(/<script[^>]+src=["'][^"']*glueful-jobs-discover-v6(?:-hotfix)?\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
 .replace(/<script[^>]+src=["'][^"']*glueful-jobs-discover-v7\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
 .replace(/<script[^>]+src=["'][^"']*glueful-jobs-discover-v8-interaction\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
 .replace(/<script[^>]+src=["'][^"']*glueful-jobs-discover-v9-relevance-logo-interaction\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"")
 .replace(/<script[^>]+src=["'][^"']*glueful-jobs-logo-patch-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi,"");}
async function buildAuthoritativeIndex(request,preloadResponse){const response=await networkResponse(request,preloadResponse);if(!response?.ok)return response;const type=response.headers.get("content-type")||"";if(!type.includes("text/html"))return response;let html=await response.text();html=stripCompetingRuntime(html);const scripts=[`<script src="${RENDER_DIAGNOSTICS_SCRIPT}?v=20260820-12" data-glueful-runtime="render-diagnostics"></script>`,`<script src="${FIXED_PDF_BOOTSTRAP}?v=20260820-fixedpdf27" data-glueful-runtime="fixed-pdf-bootstrap"></script>`,`<script src="${JOBS_AUTH}?v=20260820-auth2" data-glueful-runtime="jobs-auth"></script>`,`<script src="${JOBS_V6}?v=20260820-jobs-discover-v6-authoritative" data-glueful-runtime="jobs-discover-v6"></script>`];const marker="</body>",block=scripts.join("\n"),injected=html.includes(marker)?html.replace(marker,`${block}\n${marker}`):`${html}\n${block}`;const headers=new Headers(response.headers);headers.set("Content-Type","text/html; charset=UTF-8");headers.set("Cache-Control","no-store, no-cache, must-revalidate");return new Response(injected,{status:response.status,statusText:response.statusText,headers})}
async function cacheIndexResponse(request,response){if(!response?.ok)return;try{const c=await caches.open(CACHE_NAME);await c.put(request,response.clone())}catch(e){console.warn("[Glueful SW] index cache write failed:",e)}}
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()).catch(err=>{console.warn("[Glueful SW] precache failed:",err);return self.skipWaiting()})));
self.addEventListener("activate",e=>e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));if(self.registration.navigationPreload){try{await self.registration.navigationPreload.enable()}catch(_){}}await self.clients.claim()})()));
self.addEventListener("fetch",e=>{const r=e.request,u=new URL(r.url);if(r.method==="GET"&&r.mode==="navigate"){e.respondWith((async()=>{try{const res=await buildAuthoritativeIndex(r,e.preloadResponse);e.waitUntil(cacheIndexResponse(r,res));return res}catch(err){console.warn("[Glueful SW] navigation failed:",err);return(await caches.match(r))||Response.error()}})());return}if(r.method==="GET"&&RUNTIME.some(p=>u.pathname.endsWith(p.slice(2)))){e.respondWith((async()=>{try{const res=await fetch(r,{cache:"no-store"});if(res.ok)e.waitUntil((async()=>{try{const c=await caches.open(CACHE_NAME);await c.put(r,res.clone())}catch(_){}})());return res}catch(_){return(await caches.match(r))||Response.error()}})());return}if(r.method==="GET")e.respondWith((async()=>{const cached=await caches.match(r);try{const res=await fetch(r,{cache:"no-store"});if(res.ok)e.waitUntil((async()=>{try{const c=await caches.open(CACHE_NAME);await c.put(r,res.clone())}catch(_){}})());return res}catch(_){return cached||Response.error()}})())});
