/* Glueful — Smooth UX foundation V1
 * Non-invasive runtime improvements for the existing fixed-page Resume Studio:
 * - prevents accidental double render-wrapper work
 * - enables compositor-friendly scrolling
 * - batches low-priority image decoding hints
 * - avoids injecting duplicate style tags
 */
(function(){
'use strict';
const VERSION='20260821-smooth-ux-v1';
if(window.__gluefulSmoothUxV1)return;
window.__gluefulSmoothUxV1=true;
window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{}, {smoothUxVersion:VERSION});

function optimizeHost(host){
  if(!host || host.dataset.gluefulSmoothUx==='1')return;
  host.dataset.gluefulSmoothUx='1';
  host.style.overscrollBehavior='contain';
  host.style.webkitOverflowScrolling='touch';
  host.style.scrollBehavior='smooth';
}

function optimizeSurface(root){
  if(!root)return;
  root.querySelectorAll('.glueful-fixed-pages').forEach(surface=>{
    surface.style.willChange='scroll-position';
    surface.style.transform='translateZ(0)';
  });
  root.querySelectorAll('.glueful-fixed-page').forEach(page=>{
    page.style.backfaceVisibility='hidden';
    page.style.webkitBackfaceVisibility='hidden';
  });
  root.querySelectorAll('.glueful-fixed-bg').forEach((img,index)=>{
    img.decoding='async';
    if(index>0)img.loading='lazy';
  });
}

function installRendererHook(){
  const renderer=window.gluefulResumeFixedPageRenderer;
  if(!renderer || renderer.__smoothUxV1)return false;
  const original=renderer.render;
  renderer.render=function(model,host,options){
    optimizeHost(host);
    const result=original.call(this,model,host,options);
    const apply=()=>optimizeSurface(host);
    if(typeof requestIdleCallback==='function')requestIdleCallback(apply,{timeout:300});
    else setTimeout(apply,0);
    return result;
  };
  renderer.__smoothUxV1=true;
  return true;
}

if(!installRendererHook()){
  const timer=setInterval(()=>{if(installRendererHook())clearInterval(timer)},50);
  setTimeout(()=>clearInterval(timer),30000);
}
})();
