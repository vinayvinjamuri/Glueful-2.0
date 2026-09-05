/* Glueful — Client Bootstrap V1
 * Runtime bootstrap only. Never hide the document while feature layers load.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_CLIENT_BOOTSTRAP_V1__) return;
  window.__GLUEFUL_CLIENT_BOOTSTRAP_V1__ = true;

  /* Splash screen removed: keep it invisible from the first paint and
     remove any legacy splash node as soon as the DOM is available. */
  (function disableLegacySplash(){
    try{
      var style=document.createElement('style');
      style.id='glueful-no-splash';
      style.textContent='#glueful-splash{display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}';
      (document.head||document.documentElement).appendChild(style);
      var remove=function(){
        var splash=document.getElementById('glueful-splash');
        if(splash) splash.remove();
      };
      if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded',remove,{once:true});
      }else{
        remove();
      }
    }catch(error){
      console.warn('[Glueful] Legacy splash removal unavailable:',error);
    }
  })();

  function load(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=src;
      s.async=false;
      s.onload=resolve;
      s.onerror=reject;
      (document.head||document.documentElement).appendChild(s);
    });
  }

  async function boot(){
    try{
      if('serviceWorker' in navigator){
        try{await navigator.serviceWorker.register('./sw.js?v=158',{updateViaCache:'none'});}
        catch(error){console.warn('[Glueful] Service Worker unavailable:',error);}
      }
      try{await load('./glueful-desktop-tablet-sidebar-persist-v2.js?v=6');}
      catch(error){console.warn('[Glueful] Persistent sidebar layer unavailable:',error);}
      try{await load('./glueful-feature-loader-v1.js?v=175');}
      catch(error){console.warn('[Glueful] Feature loader unavailable:',error);}
      try{await load('./glueful-dashboard-apple-v1.js?v=1');}
      catch(error){console.warn('[Glueful] Dashboard visual layer unavailable:',error);}
    }catch(error){
      console.warn('[Glueful] Client bootstrap failed:',error);
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){void boot();},{once:true});
  }else{
    void boot();
  }
})();
