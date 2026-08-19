const CACHE_NAME = "glueful-cache-v16-resume-fixed-pdf-default";
const AUTHORITATIVE_RESUME_SCRIPT = "./glueful-resume-studio-adobe.js";
const DOCX_FORENSICS_SCRIPT = "./glueful-resume-docx-forensics.js";
const MOBILE_LAYOUT_SCRIPT = "./glueful-resume-studio-mobile-layout.js";
const HEADER_FIDELITY_SCRIPT = "./glueful-resume-header-fidelity.js";
const HEADER_ALIGNMENT_SCRIPT = "./glueful-resume-header-alignment.js";
const HEADER_FIDELITY_V2_SCRIPT = "./glueful-resume-header-fidelity-v2.js";
const HEADER_FIDELITY_V3_SCRIPT = "./glueful-resume-header-fidelity-v3.js";
const RENDER_DIAGNOSTICS_SCRIPT = "./glueful-resume-render-diagnostics.js";
const FIXED_PDF_BOOTSTRAP = "./glueful-resume-fixed-page-bootstrap.js";
const FIXED_PDF_MODEL = "./glueful-resume-layout-model.js";
const FIXED_PDF_IMPORTER = "./glueful-resume-pdf-layout-importer.js";
const FIXED_PDF_RENDERER = "./glueful-resume-fixed-page-renderer.js";
const FIXED_PDF_CONTROLLER = "./glueful-resume-fixed-page-controller.js";
const FIXED_PDF_ASSETS = [FIXED_PDF_BOOTSTRAP,FIXED_PDF_MODEL,FIXED_PDF_IMPORTER,FIXED_PDF_RENDERER,FIXED_PDF_CONTROLLER];
const ASSETS = [
  "./manifest.json",
  AUTHORITATIVE_RESUME_SCRIPT,
  DOCX_FORENSICS_SCRIPT,
  MOBILE_LAYOUT_SCRIPT,
  HEADER_FIDELITY_SCRIPT,
  HEADER_ALIGNMENT_SCRIPT,
  HEADER_FIDELITY_V2_SCRIPT,
  HEADER_FIDELITY_V3_SCRIPT,
  RENDER_DIAGNOSTICS_SCRIPT,
  ...FIXED_PDF_ASSETS,
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
  "./icons/icon-maskable-512.png"
];
async function networkResponse(request, preloadResponse){const preloaded=await preloadResponse;if(preloaded)return preloaded;return fetch(request)}
async function buildAuthoritativeIndex(request, preloadResponse){
  const response=await networkResponse(request,preloadResponse);if(!response||!response.ok)return response;
  const contentType=response.headers.get("content-type")||"";if(!contentType.includes("text/html"))return response;
  const html=await response.text(),scripts=[];
  const add=(src,v,data)=>{if(!html.includes(src))scripts.push(`<script src="${src}?v=${v}" data-glueful-runtime="${data}"></script>`)};
  if(!html.includes(DOCX_FORENSICS_SCRIPT))add(DOCX_FORENSICS_SCRIPT,"20260819-7","docx-forensics");
  if(!html.includes(AUTHORITATIVE_RESUME_SCRIPT))add(AUTHORITATIVE_RESUME_SCRIPT,"20260819-7","authoritative-resume-studio");
  if(!html.includes(MOBILE_LAYOUT_SCRIPT))add(MOBILE_LAYOUT_SCRIPT,"20260819-8","mobile-layout");
  if(!html.includes(HEADER_FIDELITY_SCRIPT))add(HEADER_FIDELITY_SCRIPT,"20260819-5","header-fidelity");
  if(!html.includes(HEADER_ALIGNMENT_SCRIPT))add(HEADER_ALIGNMENT_SCRIPT,"20260819-4","header-alignment");
  if(!html.includes(`${HEADER_FIDELITY_V3_SCRIPT}?v=`))add(HEADER_FIDELITY_V3_SCRIPT,"20260819-2","header-fidelity-v4");
  if(!html.includes(RENDER_DIAGNOSTICS_SCRIPT))add(RENDER_DIAGNOSTICS_SCRIPT,"20260819-7","render-diagnostics");
  add(FIXED_PDF_BOOTSTRAP,"20260819-fixedpdf3","fixed-pdf-bootstrap");
  add(FIXED_PDF_MODEL,"20260819-fixedpdf3","fixed-pdf-model");
  add(FIXED_PDF_IMPORTER,"20260819-fixedpdf3","fixed-pdf-importer");
  add(FIXED_PDF_RENDERER,"20260819-fixedpdf3","fixed-pdf-renderer");
  add(FIXED_PDF_CONTROLLER,"20260819-fixedpdf3","fixed-pdf-controller");
  if(!scripts.length)return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
  const block=scripts.join("\n"),marker="</body>",injected=html.includes(marker)?html.replace(marker,`${block}\n${marker}`):`${html}\n${block}`,headers=new Headers(response.headers);headers.set("Content-Type","text/html; charset=UTF-8");
  return new Response(injected,{status:response.status,statusText:response.statusText,headers});
}
async function cacheIndexResponse(request,response){if(!response||!response.ok)return;try{const cache=await caches.open(CACHE_NAME);await cache.put(request,response.clone())}catch(error){console.warn("[Glueful SW] index cache write failed:",error)}}
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()).catch(error=>{console.warn("[Glueful SW] asset precache failed; continuing with network startup:",error);return self.skipWaiting()}))});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)));if(self.registration.navigationPreload){try{await self.registration.navigationPreload.enable()}catch(_){}}await self.clients.claim()})())});
self.addEventListener("fetch",event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method==="GET"&&request.mode==="navigate"){
    event.respondWith((async()=>{try{const response=await buildAuthoritativeIndex(request,event.preloadResponse);event.waitUntil(cacheIndexResponse(request,response));return response}catch(error){console.warn("[Glueful SW] navigation network fetch failed:",error);return(await caches.match(request))||Response.error()}})());return;
  }
  const runtimeAssets=[AUTHORITATIVE_RESUME_SCRIPT,DOCX_FORENSICS_SCRIPT,MOBILE_LAYOUT_SCRIPT,HEADER_FIDELITY_SCRIPT,HEADER_ALIGNMENT_SCRIPT,HEADER_FIDELITY_V2_SCRIPT,HEADER_FIDELITY_V3_SCRIPT,RENDER_DIAGNOSTICS_SCRIPT,...FIXED_PDF_ASSETS];
  if(request.method==="GET"&&runtimeAssets.some(p=>url.pathname.endsWith(p.replace('./','/')))){
    event.respondWith((async()=>{try{const response=await fetch(request,{cache:"no-store"});if(response.ok)event.waitUntil((async()=>{try{const cache=await caches.open(CACHE_NAME);await cache.put(request,response.clone())}catch(_){}})());return response}catch(_){return(await caches.match(request))||Response.error()}})());return;
  }
  if(request.method==="GET")event.respondWith((async()=>{const cached=await caches.match(request);try{const response=await fetch(request);if(response.ok)event.waitUntil((async()=>{try{const cache=await caches.open(CACHE_NAME);await cache.put(request,response.clone())}catch(_){}})());return response}catch(_){return cached||Response.error()}})());
});