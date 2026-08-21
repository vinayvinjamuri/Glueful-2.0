/* Glueful PWA Update Recovery V1
 * Makes the in-app UPDATE action reliable on installed mobile PWAs.
 * It takes control only when the user clicks the visible UPDATE button.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_PWA_UPDATE_FIX_V1__) return;
  window.__GLUEFUL_PWA_UPDATE_FIX_V1__=true;

  let reloading=false;

  function isUpdateButton(el){
    if(!el || !(el instanceof HTMLElement)) return false;
    const text=String(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    return text==='update' || text==='update now' || text.includes('update available');
  }

  function setBusy(button,busy){
    if(!button) return;
    if(busy){
      button.dataset.gluefulOriginalText=button.textContent;
      button.textContent='UPDATING…';
      button.setAttribute('aria-disabled','true');
      button.style.pointerEvents='none';
      button.style.opacity='.65';
    }else{
      button.textContent=button.dataset.gluefulOriginalText||'UPDATE';
      button.removeAttribute('aria-disabled');
      button.style.pointerEvents='';
      button.style.opacity='';
    }
  }

  async function clearRuntimeCaches(){
    try{
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>/^glueful-cache-/i.test(k)).map(k=>caches.delete(k)));
    }catch(e){console.warn('[Glueful PWA Update] cache cleanup skipped:',e)}
  }

  async function applyUpdate(button){
    if(reloading) return;
    reloading=true;
    setBusy(button,true);

    let registration=null;
    try{
      registration=await navigator.serviceWorker?.getRegistration();
      if(registration){
        try{ await registration.update(); }catch(e){ console.warn('[Glueful PWA Update] registration.update failed:',e); }

        if(registration.waiting){
          registration.waiting.postMessage({type:'GLUEFUL_SKIP_WAITING'});
          await new Promise(resolve=>setTimeout(resolve,250));
        }
      }
    }catch(e){
      console.warn('[Glueful PWA Update] service-worker update failed:',e);
    }

    if(navigator.serviceWorker){
      navigator.serviceWorker.addEventListener('controllerchange',function(){
        if(reloading){
          window.location.reload();
        }
      },{once:true});
    }

    /* Give a newly-installed worker a moment to claim the page. */
    await new Promise(resolve=>setTimeout(resolve,500));

    try{
      await clearRuntimeCaches();
    }catch(_){ }

    /* If there is no controller transition, force a clean network reload.
       The new service worker will install/claim again after index loads. */
    setTimeout(function(){
      if(reloading) window.location.reload();
    },900);
  }

  document.addEventListener('click',function(event){
    const target=event.target instanceof Element ? event.target.closest('button,a,[role="button"]') : null;
    if(!isUpdateButton(target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void applyUpdate(target);
  },true);

  console.info('[Glueful PWA Update] reliable mobile UPDATE handler loaded.');
})();
