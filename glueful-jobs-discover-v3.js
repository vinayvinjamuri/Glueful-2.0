/* Glueful Jobs Discover V3 compatibility loader. */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_DISCOVER_V4_LOADED__) return;
  window.__GLUEFUL_JOBS_DISCOVER_V4_LOADED__=true;
  var s=document.createElement('script');
  s.src='./glueful-jobs-discover-v4.js?v=20260820';
  s.defer=true;
  s.onload=function(){
    console.log('[Glueful Jobs] V4 multi-source personalized feed loaded');
    var p=document.createElement('script');
    p.src='./glueful-plugins-nav-v1.js?v=20260821';
    p.defer=true;
    p.onload=function(){console.log('[Glueful] Plug-ins navigation loaded');};
    p.onerror=function(){console.error('[Glueful] Plug-ins navigation failed to load');};
    document.head.appendChild(p);
  };
  s.onerror=function(){
    console.error('[Glueful Jobs] V4 feed failed to load');
    /* The plug-ins surface is independent of the feed; still load it. */
    var p=document.createElement('script');
    p.src='./glueful-plugins-nav-v1.js?v=20260821';
    p.defer=true;
    document.head.appendChild(p);
  };
  document.head.appendChild(s);
})();
