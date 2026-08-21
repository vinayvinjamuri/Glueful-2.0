/* Glueful Jobs Discover V3 compatibility loader. */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_DISCOVER_V4_LOADED__) return;
  window.__GLUEFUL_JOBS_DISCOVER_V4_LOADED__=true;

  function loadScript(src,id,onload){
    if(id&&document.getElementById(id)){onload&&onload();return;}
    var s=document.createElement('script');
    if(id)s.id=id;
    s.src=src;
    s.defer=true;
    if(onload)s.onload=onload;
    s.onerror=function(){console.error('[Glueful Jobs] failed to load '+src);};
    document.head.appendChild(s);
  }

  function loadEnhancements(){
    loadScript('./glueful-plugins-nav-v1.js?v=20260821','glueful-plugins-nav-v1',function(){
      console.log('[Glueful] Plug-ins navigation loaded');
    });
    loadScript('./glueful-jobs-marketplace-v1.js?v=20260821','glueful-jobs-marketplace-v1',function(){
      console.log('[Glueful Jobs] Large inventory marketplace loaded');
    });
  }

  var s=document.createElement('script');
  s.src='./glueful-jobs-discover-v4.js?v=20260820';
  s.defer=true;
  s.onload=function(){
    console.log('[Glueful Jobs] V4 multi-source personalized feed loaded');
    loadEnhancements();
  };
  s.onerror=function(){
    console.error('[Glueful Jobs] V4 feed failed to load');
    /* The plug-ins and marketplace surfaces remain useful independently. */
    loadEnhancements();
  };
  document.head.appendChild(s);
})();
