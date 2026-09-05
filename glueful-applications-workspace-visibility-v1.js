/* Glueful — Applications Workspace Visibility V1
 * Keeps Applications-only workspace panels hidden on every other view.
 * Presentation-only; no application data or handlers are changed.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_WORKSPACE_VISIBILITY_V1__) return;
  window.__GLUEFUL_APPLICATIONS_WORKSPACE_VISIBILITY_V1__=true;

  function sync(){
    const view=document.getElementById('view-applications');
    const active=!!view && (view.classList.contains('active') || view.style.display==='block');
    const left=document.getElementById('glueful-applications-left-v1');
    const right=document.getElementById('glueful-applications-workspace-v1');
    [left,right].forEach(el=>{
      if(!el) return;
      el.style.setProperty('display',active?'flex':'none','important');
    });
  }

  function boot(){
    sync();
    const view=document.getElementById('view-applications');
    if(view){
      const observer=new MutationObserver(sync);
      observer.observe(view,{attributes:true,attributeFilter:['class','style']});
    }
    document.addEventListener('click',()=>setTimeout(sync,0),true);
    window.addEventListener('popstate',()=>setTimeout(sync,0));
    window.addEventListener('hashchange',()=>setTimeout(sync,0));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
