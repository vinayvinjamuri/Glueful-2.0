const CACHE_NAME='glueful-cache-v83-phase1-runtime';
const RUNTIME_BOOTSTRAP='./glueful-runtime-bootstrap-v1.js';
const ASSETS=['./manifest.json',RUNTIME_BOOTSTRAP,'./icons/icon-192.svg','./icons/icon-512.svg','./icons/icon-180.svg','./icons/icon-maskable-512.svg'];
const LEGACY_RUNTIME_NAMES=[
'glueful-runtime-bootstrap-v1.js','glueful-resume-studio-adobe.js','glueful-resume-studio-v41','glueful-resume-docauth-v50.js',
'glueful-resume-render-diagnostics.js','glueful-resume-fixed-page-bootstrap.js','glueful-resume-viewer-v1.js','glueful-jobs-auth-bootstrap-v1.js',
'glueful-jobs-discover-v3.js','glueful-jobs-discover-v4.js','glueful-jobs-discover-v5.js','glueful-jobs-discover-v6-hotfix.js',
'glueful-jobs-discover-v7.js','glueful-jobs-discover-v8-interaction.js','glueful-jobs-discover-v9-relevance-logo-interaction.js',
'glueful-jobs-discover-v10-authoritative.js','glueful-jobs-discover-v11-stable.js','glueful-jobs-discover-v12-stable.js',
'glueful-jobs-discover-v13-authoritative.js','glueful-jobs-discover-v14-force.js','glueful-jobs-discover-v15-authoritative.js',
'glueful-jobs-relevance-v1.js','glueful-resume-studio-supabase-bridge.js','glueful-jobs-resume-action-v1.js','glueful-jobs-logo-patch-v1.js',
'glueful-jobs-mobile-card-polish-v1.js','glueful-jobs-mobile-ux-v1.js','glueful-jobs-mobile-ux-v15.js','glueful-jobs-smooth-logos-v1.js',
'glueful-jobs-feed-recovery-v2.js','glueful-jobs-official-link-guard-v1.js','glueful-mobile-update-guard-v1.js','glueful-app-branding-v1.js',
'glueful-jobs-infinite-feed-v1.js'];
function escapeRegExp(value){return value.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}
function stripCompetingRuntime(html){let out=html;for(const name of LEGACY_RUNTIME_NAMES){out=out.replace(new RegExp('<script[^>]+src=["\\\'][^"\\\']*'+escapeRegExp(name)+'(?:\\\\?[^"\\\']*)?["\\\'][^>]*><\\\\/script>','gi'),'')}return out}
async function networkResponse(request,preload){return (await preload)||fetch(request,{cache:'no-store'})}
async function buildIndex(request,preload){const response=await networkResponse(request,preload);if(!response?.ok)return response;const type=response.headers.get('content-type')||'';if(!type.includes('text/html'))return response;let html=await response.text();html=stripCompetingRuntime(html);const tag='<script src="'+RUNTIME_BOOTSTRAP+'?v=20260823-phase1-runtime1" data-glueful-runtime="phase1-bootstrap"></script>';html=html.includes('</body>')?html.replace('</body>',tag+'\n</body>'):html+'\n'+tag;const headers=new Headers(response.headers);headers.set('Content-Type','text/html; charset=UTF-8');headers.set('Cache-Control','no-store, no-cache, must-revalidate');return new Response(html,{status:response.status,statusText:response.statusText,headers})}
async function cacheIndex(request,response){if(!response?.ok)return;try{const c=await caches.open(CACHE_NAME);await c.put(request,response.clone())}catch(error){console.warn('[Glueful SW] cache write failed',error)}}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()).catch(error=>{console.warn('[Glueful SW] precache failed',error);return self.skipWaiting()})));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)));try{await self.registration.navigationPreload?.enable()}catch(_){}await self.clients.claim()})()));
self.addEventListener('message',event=>{if(event.data?.type==='GLUEFUL_SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;if(request.mode==='navigate'){event.respondWith((async()=>{try{const response=await buildIndex(request,event.preloadResponse);event.waitUntil(cacheIndex(request,response));return response}catch(error){console.warn('[Glueful SW] navigation failed',error);return (await caches.match(request))||Response.error()}})());return}event.respondWith((async()=>{const cached=await caches.match(request);try{const response=await fetch(request,{cache:'no-store'});if(response.ok)event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,response.clone())).catch(()=>{}));return response}catch(_){return cached||Response.error()}})())});