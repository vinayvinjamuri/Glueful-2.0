/* Glueful — Client Bootstrap V1
 * Boots the current deployed runtime before the application is allowed to paint.
 * This prevents legacy patch layers from visibly rendering before the final UI.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_CLIENT_BOOTSTRAP_V1__) return;
  window.__GLUEFUL_CLIENT_BOOTSTRAP_VV1__ = true;

  (function installPrepaintGate(){
    var root=document.documentElement;
    if(root) root.classList.add('glueful-booting');
    var style=document.createElement('style');
    style.id='glueful-prepaint-gate-v1';
    style.textContent=`
      html.glueful-booting body{visibility:hidden!important;}
      html.glueful-booting #glueful-splash{display:none!important;}
    `;
    (document.head||root).appendChild(style);
    window.__GLUEFUL_RELEASE_PAINT__=function(){
      if(root) root.classList.remove('glueful-booting');
    };
  })();

  (function removeLegacySplash(){
    var style=document.createElement('style');
    style.id='glueful-no-startup-splash-v1';
    style.textContent='#glueful-splash{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}';
    (document.head||document.documentElement).appendChild(style);
    function remove(){var splash=document.getElementById('glueful-splash');if(splash)splash.remove();}
    remove();
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',remove,{once:true});
  })();

  function load(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;(document.head||document.documentElement).appendChild(s);
    });
  }

  function waitForFinalRuntime(timeout){
    return new Promise(function(resolve){
      var done=false,start=Date.now();
      function finish(){if(done)return;done=true;resolve();}
      window.addEventListener('glueful-dashboard-ready',finish,{once:true});
      (function check(){
        if(done)return;
        if(window.__GLUEFUL_DASHBOARD_READY__)return finish();
        if(Date.now()-start>timeout)return finish();
        setTimeout(check,25);
      })();
    });
  }

  async function boot(){
    try{
      if('serviceWorker' in navigator){try{await navigator.serviceWorker.register('./sw.js?v=158',{updateViaCache:'none'});}catch(error){console.warn('[Glueful] Service Worker registration/update unavailable:',error);}}
      try{await load('./glueful-desktop-tablet-sidebar-persist-v2.js?v=1');}catch(error){console.warn('[Glueful] Persistent sidebar layer unavailable:',error);}
      try{await load('./glueful-feature-loader-v1.js?v=164');}catch(error){console.warn('[Glueful] Direct feature-loader bootstrap failed:',error);}
      try{await load('./glueful-dashboard-apple-v1.js?v=1');}catch(error){console.warn('[Glueful] Dashboard visual layer unavailable:',error);}
      await waitForFinalRuntime(5000);
    }catch(error){console.warn('[Glueful] Client bootstrap failed:',error);}
    finally{
      if(typeof window.__GLUEFUL_RELEASE_PAINT__==='function')window.__GLUEFUL_RELEASE_PAINT__();
    }
  }
  void boot();
})();
