/* Glueful Jobs Pagination Runtime V1 — non-invasive integration */
(function(){'use strict';
if(window.__GLUEFUL_JOBS_PAGINATION_RUNTIME_V1__)return;window.__GLUEFUL_JOBS_PAGINATION_RUNTIME_V1__=true;
function boot(){if(!window.GluefulJobsPaginationV2){setTimeout(boot,100);return}window.GluefulJobsPagination={first:window.GluefulJobsPaginationV2.first,next:window.GluefulJobsPaginationV2.next,prefetch:window.GluefulJobsPaginationV2.prefetch,get state(){return window.GluefulJobsPaginationV2.state}};document.dispatchEvent(new CustomEvent('glueful:pagination-v2-ready'))}
boot();
})();