/* Glueful Resume Studio Viewer V1
 * Viewer-only layer: never transforms individual resume pages.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUME_VIEWER_V1__) return;
  window.__GLUEFUL_RESUME_VIEWER_V1__=true;
  const MIN=.6,MAX=1.6,STEP=.1;
  let zoom=1, host=null, toolbar=null;
  const pageSelector='.glueful-fixed-page';
  function findHost(){
    const page=document.querySelector(pageSelector);
    if(!page) return null;
    let p=page.parentElement;
    while(p&&p!==document.body){
      const pages=p.querySelectorAll(pageSelector);
      if(pages.length>1) return p;
      p=p.parentElement;
    }
    return page.parentElement;
  }
  function ensureHost(){
    const h=findHost(); if(!h)return null;
    if(host!==h){host=h;host.classList.add('glueful-resume-viewer-host');host.style.transform='none';host.style.transformOrigin='initial';host.style.overflow='auto';host.style.boxSizing='border-box';}
    return host;
  }
  function renderToolbar(){
    const h=ensureHost(); if(!h)return;
    if(toolbar&&toolbar.isConnected)return;
    toolbar=document.createElement('div');toolbar.className='glueful-resume-viewer-toolbar';toolbar.innerHTML='<button type="button" data-rv-minus aria-label="Zoom out">−</button><span data-rv-value>100%</span><button type="button" data-rv-plus aria-label="Zoom in">+</button><button type="button" data-rv-reset>Reset</button>';
    toolbar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-rv-minus'))zoom=Math.max(MIN,+(zoom-STEP).toFixed(2));else if(b.hasAttribute('data-rv-plus'))zoom=Math.min(MAX,+(zoom+STEP).toFixed(2));else if(b.hasAttribute('data-rv-reset'))zoom=1;apply()});
    h.parentElement.insertBefore(toolbar,h);
  }
  function apply(){
    const h=ensureHost();if(!h)return;
    h.style.zoom=String(zoom);
    const v=toolbar?.querySelector('[data-rv-value]');if(v)v.textContent=Math.round(zoom*100)+'%';
    h.dataset.viewerZoom=String(zoom);
  }
  function install(){
    const h=ensureHost();if(!h)return false;
    renderToolbar();apply();return true;
  }
  const css=document.createElement('style');css.textContent='.glueful-resume-viewer-toolbar{position:sticky;top:8px;z-index:10000;display:flex;align-items:center;gap:4px;width:max-content;margin:8px auto;padding:5px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(20,24,34,.94);backdrop-filter:blur(8px);box-shadow:0 8px 24px rgba(0,0,0,.2)}.glueful-resume-viewer-toolbar button{min-width:32px;height:30px;border:0;border-radius:8px;background:transparent;color:inherit;font:800 13px/1 Inter,Arial,sans-serif;cursor:pointer}.glueful-resume-viewer-toolbar button:hover{background:rgba(255,255,255,.1)}.glueful-resume-viewer-toolbar [data-rv-value]{min-width:50px;text-align:center;font:800 12px/1 Inter,Arial,sans-serif}.glueful-resume-viewer-host{display:flex!important;flex-direction:column!important;align-items:center!important;gap:24px!important;transform:none!important}.glueful-resume-viewer-host>.glueful-fixed-page{position:relative!important;flex:0 0 auto!important;margin:0!important;transform:none!important;isolation:isolate!important}';document.head.appendChild(css);
  const observer=new MutationObserver(()=>{if(!install())return});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{install();observer.observe(document.body,{childList:true,subtree:true})},{once:true});else{install();observer.observe(document.body,{childList:true,subtree:true})}
  window.gluefulResumeViewer={getZoom:()=>zoom,setZoom:v=>{zoom=Math.max(MIN,Math.min(MAX,Number(v)||1));apply()}};
})();