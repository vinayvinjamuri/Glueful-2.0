/* Glueful Resume Studio V53 bootstrap patch. */
(function(){
  'use strict';

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

  const STYLE_ID = 'glueful-resume-studio-v53-fix';
  const EDITOR_ID = 'job-resume-editor-text';
  let editorObserver = null;
  let normalizeQueued = false;

  function installV53Styles(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #job-resume-editor-modal .job-resume-editor-scroll{overflow:auto!important;align-items:flex-start!important;justify-content:flex-start!important;padding:20px 24px 40px!important;box-sizing:border-box!important;}
      #job-resume-editor-modal #job-resume-editor-text{flex:0 0 794px!important;width:794px!important;min-width:794px!important;max-width:794px!important;min-height:1123px!important;box-sizing:border-box!important;margin:0 auto!important;padding:58px 58px 64px!important;background:#fff!important;color:#202124!important;border:1px solid #d8dce4!important;border-radius:2px!important;box-shadow:0 12px 34px rgba(15,23,42,.18)!important;overflow:visible!important;text-align:left!important;word-break:normal!important;overflow-wrap:break-word!important;font-family:"Times New Roman",Times,serif!important;font-size:11pt!important;line-height:1.18!important;}
      #job-resume-editor-modal #job-resume-editor-text p{margin:0 0 7px!important;padding:0!important;}
      #job-resume-editor-modal #job-resume-editor-text h1,#job-resume-editor-modal #job-resume-editor-text h2,#job-resume-editor-modal #job-resume-editor-text h3{line-height:1.12!important;margin-top:12px!important;margin-bottom:7px!important;}
      #job-resume-editor-modal #job-resume-editor-text img{max-width:100%!important;height:auto!important;object-fit:contain!important;vertical-align:top!important;}
      #job-resume-editor-modal #job-resume-editor-text > p.glueful-import-header img,#job-resume-editor-modal #job-resume-editor-text > div.glueful-import-header img,#job-resume-editor-modal #job-resume-editor-text > table.glueful-import-header img{width:82px!important;height:82px!important;max-width:82px!important;min-width:82px!important;object-fit:contain!important;flex:0 0 82px!important;}
      #job-resume-editor-modal #job-resume-editor-text > p.glueful-import-header,#job-resume-editor-modal #job-resume-editor-text > div.glueful-import-header{display:flex!important;align-items:flex-start!important;gap:14px!important;margin-bottom:12px!important;}
      #job-resume-editor-modal #job-resume-editor-text > p.glueful-import-header > img,#job-resume-editor-modal #job-resume-editor-text > div.glueful-import-header > img{display:block!important;flex:0 0 82px!important;}
      #job-resume-editor-modal #job-resume-editor-text .glueful-import-header-text{min-width:0!important;flex:1 1 auto!important;}
      #job-resume-editor-modal #job-resume-editor-text table{max-width:100%!important;border-collapse:collapse!important;}
      #job-resume-editor-modal #job-resume-editor-text td,#job-resume-editor-modal #job-resume-editor-text th{vertical-align:top!important;}
      @media(max-width:900px){#job-resume-editor-modal .job-resume-editor-scroll{align-items:flex-start!important;justify-content:flex-start!important;padding:12px 12px 150px!important;}#job-resume-editor-modal #job-resume-editor-text{margin-left:0!important;margin-right:0!important;}}
    `;
    document.head.appendChild(style);
  }

  function markHeaderImage(editor){
    if(editor.classList.contains('glueful-docx-layout-mode')) return;
    const images=Array.from(editor.querySelectorAll('img'));
    if(!images.length) return;
    const first=images[0];
    const parent=first.closest('p,div,td');
    if(!parent || parent.parentElement!==editor) return;
    parent.classList.add('glueful-import-header');
    if(parent.tagName==='P'&&!parent.querySelector('.glueful-import-header-text')){
      const textNodes=[];
      Array.from(parent.childNodes).forEach(node=>{
        if(node===first) return;
        if(node.nodeType===Node.TEXT_NODE&&node.nodeValue.trim()) textNodes.push(node);
        else if(node.nodeType===Node.ELEMENT_NODE&&node.tagName.toLowerCase()!=='img') textNodes.push(node);
      });
      if(textNodes.length){
        const wrapper=document.createElement('span');
        wrapper.className='glueful-import-header-text';
        parent.insertBefore(wrapper,textNodes[0]);
        textNodes.forEach(node=>wrapper.appendChild(node));
      }
    }
  }

  function normalizeImportedResume(){
    const editor=document.getElementById(EDITOR_ID);
    if(!editor||!editor.innerHTML.trim()||editor.classList.contains('glueful-docx-layout-mode')) return;
    markHeaderImage(editor);
    const firstImage=editor.querySelector('img');
    if(firstImage){firstImage.removeAttribute('width');firstImage.removeAttribute('height');}
  }

  function queueNormalize(){
    if(normalizeQueued) return;
    normalizeQueued=true;
    requestAnimationFrame(()=>{normalizeQueued=false;normalizeImportedResume();});
  }

  function attachEditorObserver(){
    const editor=document.getElementById(EDITOR_ID);
    if(!editor) return false;
    if(editorObserver) return true;
    editorObserver=new MutationObserver(()=>queueNormalize());
    editorObserver.observe(editor,{childList:true,subtree:true});
    queueNormalize();
    return true;
  }

  function boot(){
    installV53Styles();
    if(!attachEditorObserver()){
      const timer=setInterval(()=>{if(attachEditorObserver()) clearInterval(timer);},250);
      setTimeout(()=>clearInterval(timer),30000);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  /*
   * The previous fix relied on sw.js to inject the authoritative controller.
   * A service worker is inert until the page registers it, so that dependency
   * made the live application capable of silently running the legacy V41/V50
   * PDF reconstruction path. This bootstrap is already part of the Resume
   * Studio runtime, therefore it deterministically loads the Adobe controller
   * after DOMContentLoaded, after the normal app scripts have finished loading.
   */
  const FORENSICS_SRC = './glueful-resume-docx-forensics.js';
  const CONTROLLER_SRC = './glueful-resume-studio-adobe.js';

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

  async function installAuthoritativeResumeStudio(){
    if(window.gluefulAdobeResumeStudio?.openJobResumeEditor) return;
    try{
      await loadResumeStudioAsset(FORENSICS_SRC,'glueful-resume-docx-forensics-runtime');
      await loadResumeStudioAsset(CONTROLLER_SRC,'glueful-resume-studio-adobe-runtime');
      console.info('[Glueful Resume Studio] deterministic authoritative loader installed:',window.gluefulAdobeResumeStudio?.version||'unknown');
    }catch(error){
      console.error('[Glueful Resume Studio] authoritative controller failed to load:',error);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>void installAuthoritativeResumeStudio(),{once:true});
  else setTimeout(()=>void installAuthoritativeResumeStudio(),0);
})();
