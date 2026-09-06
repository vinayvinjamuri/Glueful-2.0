/* Glueful Interviews — Final presentation cleanup V1
 * Removes stale/duplicate Interviews presentation shells left by older cached
 * authoritative versions. Keeps the newest V6 shell and preserves data/actions.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_INTERVIEWS_FINAL_CLEANUP_V1__) return;
  window.__GLUEFUL_INTERVIEWS_FINAL_CLEANUP_V1__=true;

  const VIEW_ID='view-interviews';
  const CURRENT_SHELL='.glueful-interviews-reference-v6-shell';
  const STYLE_ID='glueful-interviews-final-cleanup-v1-style';

  function installStyle(){
    let s=document.getElementById(STYLE_ID);
    if(!s){
      s=document.createElement('style');
      s.id=STYLE_ID;
      document.head.appendChild(s);
    }
    s.textContent=`
      @media(min-width:1280px){
        html body #${VIEW_ID}{
          left:248px!important;
          right:0!important;
          width:auto!important;
          margin-left:0!important;
          box-sizing:border-box!important;
        }
      }
      html body #${VIEW_ID} > .glueful-interviews-reference-v6-shell{
        display:block!important;
      }
    `;
  }

  function cleanup(){
    const view=document.getElementById(VIEW_ID);
    if(!view) return false;

    const current=Array.from(view.querySelectorAll(CURRENT_SHELL));
    if(!current.length) return false;

    /* The newest authoritative shell is the last one rendered. */
    const keep=current[current.length-1];

    /* Remove every stale generated shell from V1-V5 and any duplicate V6. */
    Array.from(view.children).forEach(function(el){
      if(el===keep) return;
      const cls=String(el.className||'');
      if(/glueful-interviews-reference-v[1-6]-shell/.test(cls)) el.remove();
    });

    /* Also remove nested stale shells if an older version wrapped itself. */
    view.querySelectorAll('[class*="glueful-interviews-reference-"][class*="-shell"]').forEach(function(el){
      if(el!==keep && /glueful-interviews-reference-v[1-6]-shell/.test(String(el.className||''))) el.remove();
    });

    installStyle();
    return true;
  }

  function start(){
    cleanup();
    [50,150,350,750,1500,3000,5000].forEach(function(ms){setTimeout(cleanup,ms);});
    if(document.body){
      new MutationObserver(function(){cleanup();}).observe(document.body,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
