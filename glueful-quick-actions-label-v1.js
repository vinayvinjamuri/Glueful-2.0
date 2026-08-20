/* Rename the navigation drawer brand label to Quick Actions without touching the app header. */
(function(){
  'use strict';
  if(window.__GLUEFUL_QUICK_ACTIONS_LABEL_V1__) return;
  window.__GLUEFUL_QUICK_ACTIONS_LABEL_V1__=true;

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  function patch(){
    const portal=[...document.querySelectorAll('*')].find(el=>clean(el.textContent)==='Placement Portal');
    if(!portal) return;
    let panel=portal;
    for(let i=0;i<7&&panel;i++,panel=panel.parentElement){
      const text=clean(panel.textContent);
      if(text.includes('Profile & Settings')&&text.includes('Placement Portal')) break;
    }
    if(!panel) return;
    [...panel.querySelectorAll('h1,h2,h3,h4,strong,b,span,div')].forEach(el=>{
      if(clean(el.textContent)==='Glueful' && !el.closest('#jobs-view')){
        el.textContent='Quick Actions';
        el.dataset.gluefulQuickActionsLabel='1';
      }
    });
  }
  const observer=new MutationObserver(patch);
  function boot(){patch();observer.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
