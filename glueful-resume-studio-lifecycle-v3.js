/* Glueful — Resume Studio Lifecycle V3
 * Ensures the Word-style Resume Studio overlay can open from hub actions.
 * Fixes inline display:none precedence on the overlay and keeps template clicks reliable.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUME_STUDIO_LIFECYCLE_V3__) return;
  window.__GLUEFUL_RESUME_STUDIO_LIFECYCLE_V3__=true;
  const OVERLAY='glueful-resume-studio-v3-overlay';
  function forceOpen(){
    const o=document.getElementById(OVERLAY);
    if(!o) return;
    o.classList.add('open');
    o.setAttribute('aria-hidden','false');
    o.style.setProperty('display','flex','important');
  }
  document.addEventListener('click',function(e){
    const trigger=e.target.closest('[data-template-card],[data-hub-profile],[data-hub-import]');
    if(!trigger) return;
    setTimeout(forceOpen,0);
    requestAnimationFrame(forceOpen);
  },true);
  const s=document.createElement('style');
  s.id='g4-lifecycle-v3-style';
  s.textContent='#'+OVERLAY+'.open{display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}';
  (document.head||document.documentElement).appendChild(s);
})();