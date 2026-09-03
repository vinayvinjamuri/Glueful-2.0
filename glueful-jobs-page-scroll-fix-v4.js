/* Glueful Jobs — mobile page scroll fix V4
 * One-shot Jobs-only scroll-chain unlock.
 * Intentionally avoids permanent MutationObservers and style feedback loops.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_PAGE_SCROLL_FIX_V4__) return;
  window.__GLUEFUL_JOBS_PAGE_SCROLL_FIX_V4__=true;

  const ROOT_ID='glueful-jobs-v15';
  const STYLE_ID='glueful-jobs-page-scroll-fix-v4';

  function installStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media (max-width:700px){
        html:has(#${ROOT_ID}),body:has(#${ROOT_ID}){
          overflow-x:hidden!important;overflow-y:auto!important;
          height:auto!important;max-height:none!important;
          min-height:100%!important;touch-action:pan-y!important;
        }
        body:has(#${ROOT_ID}) #jobs-view,
        body:has(#${ROOT_ID}) #${ROOT_ID}{
          overflow:visible!important;overflow-x:hidden!important;overflow-y:visible!important;
          height:auto!important;max-height:none!important;
          min-height:100dvh!important;touch-action:pan-y!important;
        }
      }
    `;
    (document.head||document.documentElement).appendChild(s);
  }

  function apply(){
    const root=document.getElementById(ROOT_ID);
    if(!root) return false;
    installStyle();
    const view=document.getElementById('jobs-view');
    for(const el of [document.documentElement,document.body,view,root]){
      if(!el) continue;
      el.style.setProperty('height','auto','important');
      el.style.setProperty('max-height','none','important');
      el.style.setProperty('overflow-y','visible','important');
      el.style.setProperty('overflow-x','hidden','important');
      el.style.setProperty('touch-action','pan-y','important');
    }
    let el=root.parentElement,depth=0;
    while(el&&el!==document.body&&depth++<10){
      const cs=getComputedStyle(el),r=el.getBoundingClientRect();
      const constrained=(cs.height!=='auto'||cs.maxHeight!=='none')&&r.height>0;
      const clipped=/hidden|clip|scroll|auto/.test(cs.overflowY||'');
      if(constrained||clipped){
        el.style.setProperty('height','auto','important');
        el.style.setProperty('max-height','none','important');
        el.style.setProperty('overflow-y','visible','important');
        el.style.setProperty('overflow-x','hidden','important');
        el.style.setProperty('touch-action','pan-y','important');
      }
      el=el.parentElement;
    }
    return true;
  }

  function boot(){
    installStyle();
    if(apply()) return;
    const observer=new MutationObserver(()=>{
      if(apply()) observer.disconnect();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),5000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
