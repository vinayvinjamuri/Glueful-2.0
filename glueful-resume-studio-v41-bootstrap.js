/* Glueful Resume Studio V54 bootstrap patch. */
(function(){
  'use strict';

  const DIRECT_FIXED_BOOTSTRAP = './glueful-resume-fixed-page-bootstrap.js?v=20260819-fixedpdf10';
  const DIRECT_FIXED_ID = 'glueful-resume-fixed-page-bootstrap-direct';

  function fixedPdfScheduled(){
    return window.__gluefulFixedPdfScheduled === true || window.__gluefulFixedPdfReady === true;
  }

  function forceFixedPdf(){
    try{return new URLSearchParams(window.location.search).get('resumeRenderer') === 'fixed-pdf';}
    catch(_){return false;}
  }

  try{
    if(!window.__gluefulV41BodyObserverGuard){
      const NativeObserve = MutationObserver.prototype.observe;
      MutationObserver.prototype.observe = function(target, options){
        if(target === document.body && options && options.childList && options.subtree) return;
        return NativeObserve.call(this, target, options);
      };
      window.__gluefulV41BodyObserverGuard = true;
    }
  }catch(error){
    console.warn('[Glueful Resume Studio V41] bootstrap guard failed:', error);
  }

  const STYLE_ID = 'glueful-resume-studio-v54-fix';
  const EDITOR_ID = 'job-resume-editor-text';
  let editorObserver = null;
  let normalizeQueued = false;
  let fixedAuthorityTimer = null;

  function enforceFixedPdfAuthority(){
    if(!fixedPdfScheduled()) return;
    const fixed=window.gluefulFixedPdfResumeStudio;
    if(!fixed || typeof fixed.open !== 'function') return;
    if(window.openJobResumeEditor !== fixed.open){
      window.openJobResumeEditor = fixed.open;
    }
    if(typeof fixed.reset === 'function' && typeof window.resetJobResumeToMaster === 'function' && window.resetJobResumeToMaster !== fixed.reset){
      window.resetJobResumeToMaster = () => fixed.reset(window.gluefulJobResumeEditorId);
    }
    const legacyStyle=document.getElementById(STYLE_ID);
    if(legacyStyle) legacyStyle.remove();
    if(editorObserver){
      try{ editorObserver.disconnect(); }catch(_){ }
      editorObserver=null;
    }
  }

  function startFixedAuthorityWatchdog(){
    if(fixedAuthorityTimer) return;
    fixedAuthorityTimer=setInterval(enforceFixedPdfAuthority,250);
    enforceFixedPdfAuthority();
  }

  function installV54Styles(){
    if(fixedPdfScheduled()) return;
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #job-resume-editor-modal .job-resume-editor-scroll{overflow:auto!important;align-items:flex-start!important;justify-content:flex-start!important;padding:20px 24px 40px!important;box-sizing:border-box!important;}
      #job-resume-editor-modal #job-resume-editor-text{flex:0 0 794px!important;width:794px!important;min-width:794px!important;max-width:794px!important;min-height:1123px!important;box-sizing:border-box!important;margin:0 auto!important;padding:0!important;background:#fff!important;color:#202124!important;border:1px solid #d8dce4!important;border-radius:2px!important;box-shadow:0 12px 34px rgba(15,23,42,.18)!important;overflow:visible!important;text-align:left!important;word-break:normal!important;overflow-wrap:break-word!important;font-family:"Times New Roman",Times,serif!important;font-size:11pt!important;line-height:1.18!important;}
      #job-resume-editor-modal #job-resume-editor-text p{margin:0 0 7px!important;padding:0!important;}
      #job-resume-editor-modal #job-resume-editor-text h1,#job-resume-editor-modal #job-resume-editor-text h2,#job-resume-editor-modal #job-resume-editor-text h3{line-height:1.12!important;margin-top:12px!important;margin-bottom:7px!important;}
      #job-resume-editor-modal #job-resume-editor-text img{max-width:100%!important;height:auto!important;object-fit:contain!important;vertical-align:top!important;}
      @media(max-width:900px){#job-resume-editor-modal .job-resume-editor-scroll{align-items:flex-start!important;justify-content:flex-start!important;padding:12px 12px 150px!important;}#job-resume-editor-modal #job-resume-editor-text{margin-left:0!important;margin-right:0!important;}}
    `;
    document.head.appendChild(style);
  }

  function normalizeImportedResume(){
    if(fixedPdfScheduled()) return;
    const editor=document.getElementById(EDITOR_ID);
    if(!editor||!editor.innerHTML.trim()||editor.classList.contains('glueful-docx-layout-mode')) return;
    const firstImage=editor.querySelector('img');
    if(firstImage){firstImage.removeAttribute('width');firstImage.removeAttribute('height');}
  }

  function queueNormalize(){
    if(fixedPdfScheduled()) return;
    if(normalizeQueued) return;
    normalizeQueued=true;
    requestAnimationFrame(()=>{normalizeQueued=false;normalizeImportedResume();});
  }

  function attachEditorObserver(){
    if(fixedPdfScheduled()) return true;
    const editor=document.getElementById(EDITOR_ID);
    if(!editor) return false;
    if(editorObserver) return true;
    editorObserver=new MutationObserver(()=>queueNormalize());
    editorObserver.observe(editor,{childList:true,subtree:true});
    queueNormalize();
    return true;
  }

  function loadResumeStudioAsset(src,id){
    return new Promise((resolve,reject)=>{
      const existing=document.getElementById(id);
      if(existing){
        if(existing.dataset.loaded==='true') return resolve();
        existing.addEventListener('load',()=>resolve(),{once:true});
        existing.addEventListener('error',()=>reject(new Error(`Failed to load ${src}`)),{once:true});
        return;
      }
      const script=document.createElement('script');
      script.id=id;
      script.src=src;
      script.async=false;
      script.dataset.gluefulRuntime='1';
      script.onload=()=>{script.dataset.loaded='true';resolve();};
      script.onerror=()=>reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  }

  async function ensureDirectFixedPdfRuntime(){
    if(!forceFixedPdf() || fixedPdfScheduled()) return;
    try{
      await loadResumeStudioAsset(DIRECT_FIXED_BOOTSTRAP,DIRECT_FIXED_ID);
      console.info('[Glueful Resume Studio] fixed-PDF runtime loaded directly from Resume Studio route.');
    }catch(error){
      console.error('[Glueful Resume Studio] direct fixed-PDF bootstrap failed:',error);
    }
  }

  async function boot(){
    await ensureDirectFixedPdfRuntime();
    if(fixedPdfScheduled()){
      startFixedAuthorityWatchdog();
      return;
    }
    installV54Styles();
    if(!attachEditorObserver()){
      const timer=setInterval(()=>{if(fixedPdfScheduled()){clearInterval(timer);startFixedAuthorityWatchdog();return;}if(attachEditorObserver()) clearInterval(timer);},250);
      setTimeout(()=>clearInterval(timer),30000);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>void boot(),{once:true});
  else void boot();

  const FORENSICS_SRC = './glueful-resume-docx-forensics.js';
  const CONTROLLER_SRC = './glueful-resume-studio-adobe.js';
  const HEADER_V3_SRC = './glueful-resume-header-fidelity-v3.js';

  async function installAuthoritativeResumeStudio(){
    if(forceFixedPdf()){
      await ensureDirectFixedPdfRuntime();
      if(fixedPdfScheduled()){
        startFixedAuthorityWatchdog();
        console.info('[Glueful Resume Studio] fixed-PDF route is authoritative; legacy DOCX controller skipped.');
        return;
      }
    }
    if(fixedPdfScheduled()){
      startFixedAuthorityWatchdog();
      console.info('[Glueful Resume Studio] V54 legacy bootstrap skipped; fixed-PDF runtime owns Resume Studio.');
      return;
    }
    try{
      await loadResumeStudioAsset(FORENSICS_SRC,'glueful-resume-docx-forensics-runtime');
      if(fixedPdfScheduled()){startFixedAuthorityWatchdog();return;}
      await loadResumeStudioAsset(CONTROLLER_SRC,'glueful-resume-studio-adobe-runtime');
      if(fixedPdfScheduled()){startFixedAuthorityWatchdog();return;}
      await loadResumeStudioAsset(HEADER_V3_SRC,'glueful-resume-header-fidelity-v3-runtime');
      if(fixedPdfScheduled()){startFixedAuthorityWatchdog();return;}
      console.info('[Glueful Resume Studio] deterministic authoritative loader installed:',window.gluefulAdobeResumeStudio?.version||'unknown','header-v3=',!!window.gluefulResumeHeaderFidelityV3);
    }catch(error){
      console.error('[Glueful Resume Studio] authoritative controller failed to load:',error);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>void installAuthoritativeResumeStudio(),{once:true});
  else setTimeout(()=>void installAuthoritativeResumeStudio(),0);

  window.addEventListener('glueful:fixed-pdf-ready',startFixedAuthorityWatchdog);
  startFixedAuthorityWatchdog();
})();