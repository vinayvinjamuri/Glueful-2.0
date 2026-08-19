/* =========================================================
   GLUEFUL RESUME STUDIO — ARCHITECTURE E BOOTSTRAP
   Canonical model + Word importer + fixed-page renderer + editing + export.
   ========================================================= */
(function () {
  'use strict';
  window.GLUEFUL_RESUME_CANONICAL_RENDERER = true;
  const assets = [
    ['./glueful-resume-canonical-model.js', 'glueful-canonical-model-runtime'],
    ['./glueful-resume-docx-importer-v2.js', 'glueful-canonical-docx-importer-runtime'],
    ['./glueful-resume-canonical-renderer-v2.js', 'glueful-canonical-renderer-runtime'],
    ['./glueful-resume-canonical-editing.js', 'glueful-canonical-editing-runtime'],
    ['./glueful-resume-canonical-export.js', 'glueful-canonical-export-runtime'],
    ['./glueful-resume-studio-canonical-controller.js', 'glueful-canonical-controller-runtime']
  ];
  function load(src,id){return new Promise((resolve,reject)=>{const existing=document.getElementById(id);if(existing){if(existing.dataset.loaded==='true')return resolve();existing.addEventListener('load',()=>resolve(),{once:true});existing.addEventListener('error',()=>reject(new Error(`Failed to load ${src}`)),{once:true});return;}const s=document.createElement('script');s.id=id;s.src=`${src}?v=20260819-e5`;s.async=false;s.dataset.gluefulCanonicalRuntime='1';s.onload=()=>{s.dataset.loaded='true';resolve()};s.onerror=()=>reject(new Error(`Failed to load ${src}`));document.body.appendChild(s)})}
  async function boot(){try{for(const [src,id] of assets)await load(src,id);window.gluefulCanonicalEditing?.attach?.();window.gluefulCanonicalResumeStudio={...(window.gluefulCanonicalResumeStudio||{}),getModel:()=>window.gluefulResumeCanonicalRenderer?.getActiveModel?.()||null,exportDocx:()=>window.gluefulCanonicalExport?.exportDocx?.(),exportPdf:()=>window.gluefulCanonicalExport?.exportPdf?.()};console.info('[Glueful Resume Studio] Architecture E renderer v2 + Word sections ready.')}catch(error){console.error('[Glueful Resume Studio] Architecture E bootstrap failed:',error)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else void boot();
})();