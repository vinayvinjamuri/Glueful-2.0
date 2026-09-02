/* Jobs scroll recovery v1 — restore page scrolling after Orbit closes. */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_SCROLL_RECOVERY_V1__)return;
  window.__GLUEFUL_JOBS_SCROLL_RECOVERY_V1__=true;
  const ROOT='glueful-jobs-v15';
  function restore(){
    const jobs=document.getElementById(ROOT);
    const orbit=document.getElementById('glueful-orbit-v2-root');
    if(!jobs||orbit?.classList.contains('open'))return;
    document.documentElement.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('overflow-y');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow-y');
  }
  function boot(){
    restore();
    const mo=new MutationObserver(()=>requestAnimationFrame(restore));
    mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
    [250,750,1500,3000].forEach(t=>setTimeout(restore,t));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
