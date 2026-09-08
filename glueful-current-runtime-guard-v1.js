/* Glueful — Current Runtime Guard V1
 * Startup-only freshness guard.
 * Keeps SPA section switches in-page; only a real application startup
 * checks the deployed runtime marker and reloads once when a newer build exists.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_CURRENT_RUNTIME_GUARD_V1__) return;
  window.__GLUEFUL_CURRENT_RUNTIME_GUARD_V1__=true;

  var KEY='glueful-runtime-version';
  var VERSION_URL='./version.json?glueful_runtime='+Date.now();

  function startupOnly(){
    try{
      if(window.__GLUEFUL_RUNTIME_STARTUP_CHECK_DONE__) return;
      window.__GLUEFUL_RUNTIME_STARTUP_CHECK_DONE__=true;

      fetch(VERSION_URL,{cache:'no-store',credentials:'same-origin'})
        .then(function(r){return r.ok?r.json():null;})
        .then(function(remote){
          if(!remote || remote.version==null) return;
          var remoteVersion=String(remote.version);
          var localVersion='';
          try{localVersion=String(localStorage.getItem(KEY)||'');}catch(e){}

          if(localVersion!==remoteVersion){
            try{localStorage.setItem(KEY,remoteVersion);}catch(e){}
            /* The guard only reloads the document during actual startup.
             * In-app navigation never calls this function again. */
            if(document.readyState==='complete'){
              window.location.reload();
            }else{
              window.addEventListener('load',function(){window.location.reload();},{once:true});
            }
          }
        })
        .catch(function(){ /* Freshness is best-effort; never block startup. */ });
    }catch(e){}
  }

  startupOnly();
})();
