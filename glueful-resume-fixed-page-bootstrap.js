/* Glueful Resume Studio fixed-PDF bootstrap. Loaded directly and defensively by the service worker. */
(function(){
'use strict';
const VERSION='20260820-fixedpdf22';
window.__gluefulFixedPdfScheduled=true;
window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{}, {
  renderer:'fixed-pdf', fixedLoaded:true, fixedReady:false, fixedScheduled:true,
  adobeLoaded:!!window.gluefulAdobeResumeStudio,
  serviceWorkerControlled:!!navigator.serviceWorker?.controller,
  bootstrapVersion:VERSION
});
const PDFJS=['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','glueful-fixed-pdfjs-runtime'];
const ASSETS=[
  PDFJS,
  ['./glueful-resume-layout-model.js','glueful-fixed-layout-model-runtime'],
  ['./glueful-resume-pdf-layout-importer.js','glueful-fixed-pdf-importer-runtime'],
  ['./glueful-resume-fixed-page-renderer.js','glueful-fixed-page-renderer-runtime'],
  ['./glueful-resume-fixed-page-ux-v6.js','glueful-fixed-page-ux-v6-runtime'],
  ['./glueful-resume-fixed-page-controller.js','glueful-fixed-page-controller-runtime']
];
let realOpen=null,realReset=null,authorityWatchdog=null;
let repairInFlight=null,repairCooldownUntil=0,repairAttempts=0;
function waitForRuntime(kind){
  return new Promise((resolve,reject)=>{
    const started=Date.now();
    const timer=setInterval(()=>{
      const studio=window.gluefulFixedPdfResumeStudio,fn=studio?.[kind];
      if(typeof fn==='function'){clearInterval(timer);resolve(fn);return;}
      if(Date.now()-started>30000){clearInterval(timer);reject(new Error(`Fixed-PDF ${kind} controller did not become ready.`));}
    },25);
  });
}
function installAuthorityGate(){
  if(window.__gluefulFixedPdfAuthorityGateInstalled)return;
  if(typeof window.__gluefulLegacyResumeEditorOpen!=='function')window.__gluefulLegacyResumeEditorOpen=window.openJobResumeEditor||null;
  if(typeof window.__gluefulLegacyResumeEditorReset!=='function')window.__gluefulLegacyResumeEditorReset=window.resetJobResumeToMaster||null;
  realOpen=window.__gluefulLegacyResumeEditorOpen||null; realReset=window.__gluefulLegacyResumeEditorReset||null;
  window.__gluefulFixedPdfAuthorityGateInstalled=true;
  window.openJobResumeEditor=async function(id){try{return await(await waitForRuntime('open'))(id)}catch(error){console.error('[Glueful Resume Studio] fixed-PDF open gate failed:',error);if(typeof realOpen==='function')return realOpen(id);throw error;}};
  window.resetJobResumeToMaster=async function(id){try{return await(await waitForRuntime('reset'))(id)}catch(error){console.error('[Glueful Resume Studio] fixed-PDF reset gate failed:',error);if(typeof realReset==='function')return realReset(id);throw error;}};
}
function enforceAuthority(){
  if(!window.__gluefulFixedPdfScheduled)return;
  const studio=window.gluefulFixedPdfResumeStudio;
  if(!studio||typeof studio.open!=='function')return;
  if(window.openJobResumeEditor!==studio.open)window.openJobResumeEditor=studio.open;
  if(typeof studio.reset==='function'&&window.resetJobResumeToMaster!==studio.reset)window.resetJobResumeToMaster=studio.reset;
  window.__gluefulFixedPdfAuthorityActive=true;
  window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{}, {
    renderer:'fixed-pdf', fixedLoaded:true, fixedReady:!!window.__gluefulFixedPdfReady,
    fixedScheduled:true, fixedAuthorityActive:true,
    adobeLoaded:!!window.gluefulAdobeResumeStudio,
    serviceWorkerControlled:!!navigator.serviceWorker?.controller,
    openJobResumeEditorSource:window.openJobResumeEditor?.name||'fixed-controller',
    controllerVersion:window.gluefulFixedPdfResumeStudio?.getState?.()?.renderer||null,
    editorUxVersion:window.__GLUEFUL_RENDER_DEBUG__?.editorUxVersion||null
  });
}
function getRememberedResumeEditorJob(){try{return sessionStorage.getItem('glueful.activeResumeEditorJobId')||''}catch(_){return ''}}
function fixedSurfaceIsAttached(){const surface=window.gluefulResumeFixedPageState?.surface;return !!surface&&document.contains(surface)&&!!document.querySelector('.glueful-fixed-pages')}
function repairDetachedResumeEditor(){
  if(repairInFlight||Date.now()<repairCooldownUntil||repairAttempts>=3)return;
  const modal=document.getElementById('job-resume-editor-modal'); if(!modal?.classList.contains('open'))return;
  const id=getRememberedResumeEditorJob(),studio=window.gluefulFixedPdfResumeStudio;
  if(!id||!studio||typeof studio.open!=='function'||fixedSurfaceIsAttached())return;
  if(typeof window.findActiveJobById!=='function')return; const job=window.findActiveJobById(id); if(!job)return;
  repairAttempts+=1; repairCooldownUntil=Date.now()+2000;
  console.info('[Glueful Resume Studio] repairing detached fixed-PDF surface after startup:',id);
  repairInFlight=Promise.resolve(studio.open(id)).catch(error=>console.warn('[Glueful Resume Studio] detached fixed-PDF repair deferred:',error)).finally(()=>{repairInFlight=null});
}
function startAuthorityWatchdog(){if(authorityWatchdog)return;enforceAuthority();authorityWatchdog=setInterval(()=>{enforceAuthority();repairDetachedResumeEditor()},100)}
function load(src,id){return new Promise((resolve,reject)=>{const existing=document.getElementById(id);if(existing){if(existing.dataset.loaded==='true')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(new Error(`Failed to load ${src}`)),{once:true});return}const s=document.createElement('script');s.id=id;s.src=src+'?v='+VERSION;s.async=false;s.dataset.gluefulFixedPdfRuntime='1';s.onload=()=>{s.dataset.loaded='true';resolve()};s.onerror=()=>reject(new Error(`Failed to load ${src}`));document.body.appendChild(s)})}
async function boot(){
  installAuthorityGate(); startAuthorityWatchdog();
  try{
    for(const [src,id] of ASSETS)await load(src,id);
    if(!window.pdfjsLib)throw new Error('PDF.js runtime did not initialize.');
    window.__gluefulFixedPdfReady=true;
    window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{}, {renderer:'fixed-pdf',fixedLoaded:true,fixedReady:true,fixedScheduled:true,serviceWorkerControlled:!!navigator.serviceWorker?.controller,bootstrapVersion:VERSION});
    window.gluefulFixedPdfResumeStudio?.activate?.(); enforceAuthority(); repairDetachedResumeEditor();
    console.info('[GLUEFUL] FIXED PDF RENDERER ACTIVE',VERSION);
  }catch(error){
    window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{}, {renderer:'fixed-pdf',fixedLoaded:true,fixedReady:false,fixedScheduled:true,error:String(error?.message||error),bootstrapVersion:VERSION});
    console.error('[Glueful Resume Studio] fixed-PDF bootstrap failed:',error);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void boot(),{once:true});else void boot();
})();
