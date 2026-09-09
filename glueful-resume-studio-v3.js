/* Glueful — Resume Studio V3 compatibility shim
 * The authoritative editor now lives in glueful-resume-studio-v4.js.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUME_STUDIO_V4_SHIM__) return;
  window.__GLUEFUL_RESUME_STUDIO_V4_SHIM__=true;
  function load(){
    if(window.__GLUEFUL_RESUME_STUDIO_V4__) return;
    if(document.querySelector('script[data-glueful-resume-v4]')) return;
    const s=document.createElement('script');
    s.src='./glueful-resume-studio-v4.js?v=1';
    s.async=false;
    s.dataset.gluefulResumeV4='1';
    document.body.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();