/* Glueful Jobs Discover V3 compatibility loader. */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_DISCOVER_V4_LOADED__) return;
  window.__GLUEFUL_JOBS_DISCOVER_V4_LOADED__=true;
  var s=document.createElement('script');
  s.src='./glueful-jobs-discover-v4.js?v=20260820';
  s.defer=true;
  s.onload=function(){console.log('[Glueful Jobs] V4 multi-source personalized feed loaded');};
  s.onerror=function(){console.error('[Glueful Jobs] V4 feed failed to load');};
  document.head.appendChild(s);
})();
