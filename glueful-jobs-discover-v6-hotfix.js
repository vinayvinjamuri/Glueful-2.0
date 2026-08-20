/* Glueful Jobs Discover V6 compatibility bridge — V6 owns all job clicks */
(function(){'use strict';
const bridge=()=>{const api=window.__GLUEFUL_JOBS_DISCOVER__;if(api?.openJobById)window.__GLUEFUL_OPEN_JOB__=api.openJobById};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bridge,{once:true});else bridge();
window.addEventListener('pageshow',bridge);
})();
