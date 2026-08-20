/* Glueful Jobs V8 interaction guard — handles dynamically-created job rows outside the root */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_V8_INTERACTION__) return;
  window.__GLUEFUL_JOBS_V8_INTERACTION__=true;
  document.addEventListener('click',function(e){
    const row=e.target.closest('.g7-row');
    if(row && window.__GLUEFUL_JOBS_V7_STATE__?.openId){
      e.preventDefault(); e.stopPropagation();
      window.__GLUEFUL_JOBS_V7_STATE__.openId(row.dataset.id);
      return;
    }
    const card=e.target.closest('.g7-card');
    if(card && window.__GLUEFUL_JOBS_V7_STATE__?.openId){
      e.preventDefault(); e.stopPropagation();
      window.__GLUEFUL_JOBS_V7_STATE__.openId(card.dataset.id);
    }
  },true);
})();
