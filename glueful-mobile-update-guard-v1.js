(function(){
  'use strict';
  if(window.__GLUEFUL_MOBILE_UPDATE_GUARD_V4__) return;
  window.__GLUEFUL_MOBILE_UPDATE_GUARD_V4__=true;

  const norm=v=>String(v||'').replace(/\s+/g,' ').trim().toLowerCase();
  let startupUpdatePromise=null;

  async function syncServiceWorker(){
    if(!('serviceWorker' in navigator)) return false;
    if(startupUpdatePromise) return startupUpdatePromise;
    startupUpdatePromise=(async()=>{
      try{
        const registration=await navigator.serviceWorker.getRegistration();
        if(!registration) return false;
        await registration.update();
        if(registration.waiting){
          registration.waiting.postMessage({type:'GLUEFUL_SKIP_WAITING'});
          await new Promise(resolve=>{
            let done=false;
            const finish=()=>{if(done)return;done=true;resolve()};
            navigator.serviceWorker.addEventListener('controllerchange',finish,{once:true});
            setTimeout(finish,1800);
          });
          return true;
        }
        return false;
      }catch(e){
        console.warn('[Glueful update] startup service worker check failed:',e);
        return false;
      }
    })();
    return startupUpdatePromise;
  }

  async function applyUpdate(button){
    if(window.__GLUEFUL_UPDATE_RUNNING__) return;
    window.__GLUEFUL_UPDATE_RUNNING__=true;
    if(button){
      button.disabled=true;
      button.dataset.gluefulOriginalText=button.textContent;
      button.textContent='UPDATING…';
    }

    let reloaded=false;
    const reloadOnce=()=>{
      if(reloaded) return;
      reloaded=true;
      location.reload();
    };

    try{
      if('serviceWorker' in navigator){
        const registration=await navigator.serviceWorker.getRegistration();
        if(registration){
          try{ await registration.update(); }catch(e){
            console.warn('[Glueful update] service worker update check failed:',e);
          }
          if(registration.waiting){
            registration.waiting.postMessage({type:'GLUEFUL_SKIP_WAITING'});
            navigator.serviceWorker.addEventListener('controllerchange',()=>reloadOnce(),{once:true});
            setTimeout(reloadOnce,1600);
            return;
          }
        }
      }
    }catch(e){
      console.warn('[Glueful update] update handoff failed:',e);
    }

    /* No waiting worker: the page itself is the newest network version.
       Reload once without unregistering the service worker or destroying
       every cache. This avoids the blank-screen failure seen on Android. */
    setTimeout(reloadOnce,250);
  }

  function bindUpdateButton(){
    if(document.documentElement.dataset.gluefulUpdateBound==='4') return;
    document.addEventListener('click',function(e){
      const el=e.target.closest?.('button,a,[role="button"]');
      if(!el || norm(el.textContent)!=='update' || el.offsetParent===null) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      void applyUpdate(el);
    },true);
    document.documentElement.dataset.gluefulUpdateBound='4';
  }

  /* Quick Actions / Plug-ins are intentionally NOT implemented here.
   * glueful-jobs-logo-patch-v1.js is the single authoritative owner for:
   *   - Quick Actions branding
   *   - Plug-ins navigation
   *   - Plug-ins modal
   *   - Brand Fetch refresh action
   * Keeping those features in one runtime prevents duplicate drawers,
   * duplicate observers, and competing click handlers on mobile. */

  function boot(){
    bindUpdateButton();
    void syncServiceWorker();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
