/* Glueful — Client Bootstrap V1
 * Runtime bootstrap only. Never hide the document while feature layers load.
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
