/* Glueful Jobs — mobile page scroll fix V3
 * Unlocks the actual ancestor scroll chain used by the SPA shell.
 * Jobs-only: does not change Orbit/dashboard/composer behavior.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_PAGE_SCROLL_FIX_V3__) return;
  window.__GLUEFUL_JOBS_PAGE_SCROLL_FIX_V3__=true;

  const STYLE_ID='glueful-jobs-page-scroll-fix-v3';
  const ROOT_ID='glueful-jobs-v15';

  function visible(root){
    if(!root) return false;
    const cs=getComputedStyle(root);
    return cs.display!=='none' && cs.visibility!=='hidden' && root.getBoundingClientRect().height>0;
  }

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media (max-width:700px){
        html:has(#${ROOT_ID}), body:has(#${ROOT_ID}){
          overflow-x:hidden !important;
          overflow-y:auto !important;
          height:auto !important;
          max-height:none !important;
          min-height:100% !important;
          position:relative !important;
          touch-action:pan-y !important;
        }
        body:has(#${ROOT_ID}) #jobs-view,
        body:has(#${ROOT_ID}) #${ROOT_ID}{
          overflow:visible !important;
          overflow-x:hidden !important;
          overflow-y:visible !important;
          height:auto !important;
          max-height:none !important;
          min-height:100dvh !important;
          position:relative !important;
          touch-action:pan-y !important;
        }
        body:has(#${ROOT_ID}) #${ROOT_ID} *{overscroll-behavior-y:auto !important}
      }
    `;
    document.head.appendChild(s);
  }

  function unlockAncestorChain(root){
    let el=root.parentElement;
    let depth=0;
    while(el && el!==document.body && depth++<12){
      const cs=getComputedStyle(el);
      const r=el.getBoundingClientRect();
      const constrainedHeight=(cs.height!=='auto' || cs.maxHeight!=='none') && r.height>0;
      const clipped=/hidden|clip|scroll|auto/.test(cs.overflowY||'');
      if(constrainedHeight || clipped){
        el.style.setProperty('height','auto','important');
        el.style.setProperty('max-height','none','important');
        el.style.setProperty('overflow-y','visible','important');
        el.style.setProperty('overflow-x','hidden','important');
        el.style.setProperty('touch-action','pan-y','important');
      }
      el=el.parentElement;
    }
  }

  function apply(){
    const root=document.getElementById(ROOT_ID);
    if(!visible(root)) return;
    install();

    const html=document.documentElement;
    const body=document.body;
    const view=document.getElementById('jobs-view');
    for(const el of [html,body,view,root]){
      if(!el) continue;
      el.style.setProperty('height','auto','important');
      el.style.setProperty('max-height','none','important');
      el.style.setProperty('overflow-y','visible','important');
      el.style.setProperty('overflow-x','hidden','important');
      el.style.setProperty('touch-action','pan-y','important');
      el.style.setProperty('position','relative','important');
    }
    unlockAncestorChain(root);
  }

  function boot(){
    apply();
    const observer=new MutationObserver(()=>apply());
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','hidden']});
    window.addEventListener('resize',apply,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(apply,100),{passive:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
