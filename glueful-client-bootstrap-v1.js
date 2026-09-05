/* Glueful — Client Bootstrap V1
 * Guarantees that every browser/WebView starts from the current deployed
 * application runtime instead of depending on Service Worker HTML injection.
 * No application feature logic is changed here.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_CLIENT_BOOTSTRAP_V1__) return;
  window.__GLUEFUL_CLIENT_BOOTSTRAP_V1__ = true;

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
          await navigator.serviceWorker.register('./sw.js?v=153',{updateViaCache:'none'});
        }catch(error){
          console.warn('[Glueful] Service Worker registration/update unavailable:',error);
        }
      }

      try{
        await load('./glueful-feature-loader-v1.js?v=153');
      }catch(error){
        console.warn('[Glueful] Direct feature-loader bootstrap failed:',error);
      }

      try{
        await load('./glueful-mobile-update-guard-v2.js?v=153');
      }catch(error){
        console.warn('[Glueful] Direct update-guard bootstrap failed:',error);
      }

      try{
        await load('./glueful-ui-premium-v1.js?v=153');
      }catch(error){
        console.warn('[Glueful] Premium UI bootstrap failed:',error);
      }

      try{
        await load('./glueful-ui-stability-v2.js?v=153');
      }catch(error){
        console.warn('[Glueful] UI stability bootstrap failed:',error);
      }
    }catch(error){
      console.warn('[Glueful] Client bootstrap failed:',error);
    }
  }

  void boot();
})();
