/* Glueful — Desktop/Tablet Sidebar Persist V6
 * Dashboard is the visual master. Non-dashboard desktop/tablet views use the
 * same fixed sidebar geometry; mobile drawer behavior remains unchanged.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DESKTOP_TABLET_SIDEBAR_PERSIST_V6__) return;
  window.__GLUEFUL_DESKTOP_TABLET_SIDEBAR_PERSIST_V6__=true;
  const STYLE_ID='glueful-desktop-tablet-sidebar-persist-v6-style';
  const SIDEBAR=260;
  function install(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s);}
    s.textContent=`
      @media(min-width:768px){
        body:not(.glueful-apple-dashboard) #glueful-drawer{
          display:flex!important;visibility:visible!important;opacity:1!important;
          position:fixed!important;left:0!important;top:0!important;bottom:0!important;
          width:${SIDEBAR}px!important;min-width:${SIDEBAR}px!important;max-width:${SIDEBAR}px!important;
          height:100vh!important;z-index:1000!important;box-sizing:border-box!important;
          flex-direction:column!important;transform:none!important;background:#fff!important;
          border-right:1px solid #e7e7ea!important;box-shadow:none!important;border-radius:0!important;
          overflow-y:auto!important;overflow-x:hidden!important;padding:0!important;margin:0!important;
        }
        body:not(.glueful-apple-dashboard) .drawer-overlay,
        body:not(.glueful-apple-dashboard) .sidebar-overlay,
        body:not(.glueful-apple-dashboard) #drawer-overlay{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}
        body:not(.glueful-apple-dashboard) #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{display:none!important;visibility:hidden!important;pointer-events:none!important;}
        body:not(.glueful-apple-dashboard) #glueful-drawer .drawer-close,
        body:not(.glueful-apple-dashboard) #glueful-drawer .close{display:none!important;}
      }
    `;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  [100,500,1500,3000].forEach(t=>setTimeout(install,t));
})();
