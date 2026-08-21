/* Glueful Jobs Discover V8 — paged inventory adapter */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_DISCOVER_V8__)return;
  window.__GLUEFUL_JOBS_DISCOVER_V8__=true;
  function load(){
    const p=window.GluefulJobsPagination;
    if(!p)return setTimeout(load,100);
    window.__GLUEFUL_JOBS_PAGE_API__={
      first:()=>p.first(),
      next:()=>p.next(),
      prefetch:()=>p.prefetch()
    };
    document.dispatchEvent(new CustomEvent('glueful:jobs-pagination-ready'));
  }
  load();
})();
