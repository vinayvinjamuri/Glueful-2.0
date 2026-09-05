/* Glueful — Client Bootstrap V1
 * Runtime bootstrap. The legacy UI never paints before the active feature group is ready.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_CLIENT_BOOTSTRAP_V1__) return;
  window.__GLUEFUL_CLIENT_BOOTSTRAP_V1__ = true;
  (function installBootGate(){
    try{
      document.documentElement.classList.add('glueful-booting');
      var style=document.createElement('style');
      style.id='glueful-boot-gate';
      style.textContent='html.glueful-booting body > *{visibility:hidden!important}html.glueful-booting body{background:#F8F9FC!important;color:#141826!important}';
      (document.head||document.documentElement).appendChild(style);
      var reveal=function(){document.documentElement.classList.remove('glueful-booting');};
      window.addEventListener('glueful-initial-view-ready',reveal,{once:true});
      setTimeout(reveal,8000);
    }catch(error){console.warn('[Glueful] Boot gate unavailable:',error);}
  })();
  (function disableLegacySplash(){
    try{
      var style=document.createElement('style');
      style.id='glueful-no-splash';
      style.textContent='#glueful-splash{display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}';
      (document.head||document.documentElement).appendChild(style);
      var remove=function(){var splash=document.getElementById('glueful-splash');if(splash)splash.remove();};
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',remove,{once:true});else remove();
    }catch(error){console.warn('[Glueful] Legacy splash removal unavailable:',error);}
  })();
  function load(src){return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;(document.head||document.documentElement).appendChild(s);});}
  async function boot(){
    try{
      if('serviceWorker' in navigator){try{await navigator.serviceWorker.register('./sw.js?v=158',{updateViaCache:'none'});}catch(error){console.warn('[Glueful] Service Worker unavailable:',error);}}
      try{await load('./glueful-desktop-tablet-sidebar-persist-v2.js?v=6');}catch(error){console.warn('[Glueful] Persistent sidebar layer unavailable:',error);}
      try{await load('./glueful-feature-loader-v1.js?v=177');}catch(error){console.warn('[Glueful] Feature loader unavailable:',error);}
    }catch(error){console.warn('[Glueful] Client bootstrap failed:',error);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){void boot();},{once:true});else void boot();
})();
