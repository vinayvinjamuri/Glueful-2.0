/* Glueful Jobs — mobile page scroll fix V2
 * Fixes the actual page scroll chain, not just the Jobs root.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_PAGE_SCROLL_FIX_V2__) return;
  window.__GLUEFUL_JOBS_PAGE_SCROLL_FIX_V2__=true;

  const STYLE_ID='glueful-jobs-page-scroll-fix-v2';

  function jobsVisible(root){
    if(!root) return false;
    const cs=getComputedStyle(root);
    if(cs.display==='none'||cs.visibility==='hidden') return false;
    return root.getBoundingClientRect().height>0;
  }

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      @media (max-width:700px){
        html:has(#glueful-jobs-v15){
          height:auto !important;
          min-height:100% !important;
          overflow-y:auto !important;
          overflow-x:hidden !important;
        }
        body:has(#glueful-jobs-v15){
          height:auto !important;
          min-height:100dvh !important;
          overflow-y:auto !important;
          overflow-x:hidden !important;
          position:relative !important;
          touch-action:pan-y !important;
        }
        body:has(#glueful-jobs-v15) #jobs-view,
        body:has(#glueful-jobs-v15) #glueful-jobs-v15{
          height:auto !important;
          min-height:100dvh !important;
          max-height:none !important;
          overflow:visible !important;
          touch-action:pan-y !important;
        }
        body:has(#glueful-jobs-v15) #glueful-jobs-v15 *{
          overscroll-behavior-y:auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function apply(){
    const root=document.getElementById('glueful-jobs-v15');
    if(!jobsVisible(root)) return false;
    install();
    const html=document.documentElement;
    const body=document.body;
    const jobsView=document.getElementById('jobs-view');
    for(const el of [html,body,jobsView,root]){
      if(!el) continue;
      el.style.height='auto';
      el.style.maxHeight='none';
      el.style.overflowY='visible';
      el.style.overflowX='hidden';
      el.style.touchAction='pan-y';
    }
    return true;
  }

  function boot(){
    apply();
    const observer=new MutationObserver(()=>apply());
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','hidden']});
    window.addEventListener('resize',apply,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(apply,50),{passive:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
