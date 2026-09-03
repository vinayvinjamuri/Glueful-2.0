/* Glueful — Automatic Update Guard V7
 * Keeps every installed browser/WebView on the newest deployed Glueful build.
 * Updates happen silently: check -> activate -> reload once.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_AUTO_UPDATE_GUARD_V7__)return;
  window.__GLUEFUL_AUTO_UPDATE_GUARD_V7__=true;

  let reloading=false;
  let checking=false;

  function removeLegacyUpdatePrompts(root=document){
    if(!root?.querySelectorAll)return;
    root.querySelectorAll('body *,[role="dialog"],dialog,.modal,.alert,.popup').forEach(function(el){
      const text=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(!text)return;
      const legacy=text.includes('a new version of glueful is available') ||
        (text.includes('update available') && text.includes('later') && text.includes('update'));
      if(!legacy)return;
      const box=el.closest?.('[role="dialog"],dialog,.modal,.alert,.popup')||el;
      if(box!==document.body)box.remove();
    });
  }

  function reloadOnce(){
    if(reloading)return;
    reloading=true;
    location.reload();
  }

  async function activateWaiting(registration){
    if(!registration?.waiting)return false;
    registration.waiting.postMessage({type:'GLUEFUL_SKIP_WAITING'});
    return true;
  }

  async function checkForLatest(){
    if(checking || !('serviceWorker' in navigator))return;
    checking=true;
    try{
      const registration=await navigator.serviceWorker.getRegistration();
      if(!registration)return;
      await registration.update();
      await activateWaiting(registration);
    }catch(error){
      console.warn('[Glueful update] latest-version check failed:',error);
    }finally{
      checking=false;
    }
  }

  function boot(){
    removeLegacyUpdatePrompts();

    if('serviceWorker' in navigator){
      navigator.serviceWorker.addEventListener('controllerchange',reloadOnce);
      navigator.serviceWorker.addEventListener('message',function(event){
        if(event.data?.type==='GLUEFUL_SW_ACTIVATED')reloadOnce();
      });

      void checkForLatest();
      setInterval(function(){void checkForLatest()},5*60*1000);
      document.addEventListener('visibilitychange',function(){
        if(document.visibilityState==='visible')void checkForLatest();
      });
      window.addEventListener('focus',function(){void checkForLatest()});
    }

    if(document.body){
      const observer=new MutationObserver(function(){removeLegacyUpdatePrompts()});
      observer.observe(document.body,{childList:true,subtree:true});
      setTimeout(function(){observer.disconnect()},15000);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
