/* Glueful Jobs Discover V3 compatibility loader. */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_DISCOVER_V7_LOADER__) return;
  window.__GLUEFUL_JOBS_DISCOVER_V7_LOADER__=true;
  function load(src,id,onload){
    if(id&&document.getElementById(id)){onload&&onload();return;}
    var s=document.createElement('script');
    if(id)s.id=id;
    s.src=src;s.defer=true;
    if(onload)s.onload=onload;
    s.onerror=function(){console.error('[Glueful Jobs] failed to load '+src)};
    document.head.appendChild(s);
  }
  function startEnhancements(){
    load('./glueful-jobs-fast-shell-v1.js?v=20260821','glueful-jobs-fast-shell-v1');
    load('./glueful-jobs-ranking-v1.js?v=20260821','glueful-jobs-ranking-v1');
    load('./glueful-jobs-marketplace-lazy-v1.js?v=20260821','glueful-jobs-marketplace-lazy-v1');
    load('./glueful-plugins-nav-v1.js?v=20260821','glueful-plugins-nav-v1');
  }
  load('./glueful-jobs-discover-v7.js?v=20260821','glueful-jobs-discover-v7',function(){
    console.log('[Glueful Jobs] V7 personalized feed loaded');
    startEnhancements();
  });
  startEnhancements();
})();
