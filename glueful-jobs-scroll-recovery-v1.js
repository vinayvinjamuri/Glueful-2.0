/* Jobs scroll recovery v2 — restore page scrolling after Orbit closes. */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_SCROLL_RECOVERY_V2__)return;
  window.__GLUEFUL_JOBS_SCROLL_RECOVERY_V2__=true;
  const ROOT='glueful-jobs-v15';
  const LOCK_CLASS='glueful-orbit-scroll-locked';

  function restore(){
    const jobs=document.getElementById(ROOT);
    const orbit=document.getElementById('glueful-orbit-v2-root');
    if(!jobs||orbit?.classList.contains('open'))return;

    /*
     * Orbit locks the document with both overflow:hidden and
     * body position:fixed/top:-scrollY. Removing only overflow
     * is not enough on Android — the page can remain frozen.
     */
    document.documentElement.classList.remove(LOCK_CLASS);
    document.body.classList.remove(LOCK_CLASS);

    document.documentElement.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('overflow-y');
    document.documentElement.style.removeProperty('position');
    document.documentElement.style.removeProperty('top');
    document.documentElement.style.removeProperty('width');

    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow-y');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('width');
  }

  function boot(){
    restore();

    const mo=new MutationObserver(()=>requestAnimationFrame(restore));
    mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});

    [100,250,500,750,1500,3000].forEach(t=>setTimeout(restore,t));
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }
})();
