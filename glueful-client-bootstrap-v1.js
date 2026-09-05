/* Glueful — Client Bootstrap V1
 * Guarantees that every browser/WebView starts from the current deployed
 * application runtime instead of depending on Service Worker HTML injection.
 * No application feature logic is changed here.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_CLIENT_BOOTSTRAP_V1__) return;
  window.__GLUEFUL_CLIENT_BOOTSTRAP_V1__ = true;

  /* Remove the legacy startup splash before the application paints. */
  (function removeLegacySplash(){
    var style=document.createElement('style');
    style.id='glueful-no-startup-splash-v1';
    style.textContent='#glueful-splash{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}';
    (document.head||document.documentElement).appendChild(style);

    function remove(){
      var splash=document.getElementById('glueful-splash');
      if(splash) splash.remove();
    }

    remove();
    if(document.readyState==='loading'){
      document.addEventListener('DOMContentLoaded',remove,{once:true});
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
        try{
          await navigator.serviceWorker.register('./sw.js?v=156',{updateViaCache:'none'});
        }catch(error){
          console.warn('[Glueful] Service Worker registration/update unavailable:',error);
        }
      }

      try{
        await load('./glueful-feature-loader-v1.js?v=156');
      }catch(error){
        console.warn('[Glueful] Direct feature-loader bootstrap failed:',error);
      }

      try{
        await load('./glueful-dashboard-apple-v1.js?v=1');
      }catch(error){
        console.warn('[Glueful] Dashboard visual layer unavailable:',error);
      }
    }catch(error){
      console.warn('[Glueful] Client bootstrap failed:',error);
    }
  }

  void boot();
})();
