/* Glueful — Desktop/Tablet Sidebar Persist V2
 * Keeps the real desktop/tablet sidebar permanently open on non-Dashboard views.
 * Mobile drawer behavior remains untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DESKTOP_TABLET_SIDEBAR_PERSIST_V2__) return;
  window.__GLUEFUL_DESKTOP_TABLET_SIDEBAR_PERSIST_V2__=true;
  const STYLE_ID='glueful-desktop-tablet-sidebar-persist-v2-style';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        body:not(.glueful-apple-dashboard) .sidebar,
        body:not(.glueful-apple-dashboard) .side-nav,
        body:not(.glueful-apple-dashboard) .app-sidebar{
          display:flex!important;visibility:visible!important;opacity:1!important;
          position:fixed!important;left:0!important;top:0!important;bottom:0!important;
          width:188px!important;min-width:188px!important;max-width:188px!important;
          height:100vh!important;z-index:1000!important;box-sizing:border-box!important;
          transform:none!important;background:#fff!important;border-right:1px solid #e5e5ea!important;
          box-shadow:none!important;border-radius:0!important;overflow-y:auto!important;overflow-x:hidden!important;
        }
        body:not(.glueful-apple-dashboard) #glueful-drawer{display:none!important;visibility:hidden!important;pointer-events:none!important;}
        body:not(.glueful-apple-dashboard) .drawer-overlay,
        body:not(.glueful-apple-dashboard) .sidebar-overlay,
        body:not(.glueful-apple-dashboard) #drawer-overlay{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}
        body:not(.glueful-apple-dashboard) #glueful-dashboard-hamburger{display:none!important;}
      }
      @media(min-width:701px) and (max-width:1100px){
        body:not(.glueful-apple-dashboard) .sidebar,
        body:not(.glueful-apple-dashboard) .side-nav,
        body:not(.glueful-apple-dashboard) .app-sidebar{
          display:flex!important;visibility:visible!important;opacity:1!important;
          position:fixed!important;left:0!important;top:0!important;bottom:0!important;
          width:230px!important;min-width:230px!important;max-width:230px!important;height:100vh!important;
          z-index:1000!important;box-sizing:border-box!important;transform:none!important;
          background:#fff!important;border-right:1px solid #e5e5ea!important;overflow-y:auto!important;
        }
        body:not(.glueful-apple-dashboard) #glueful-drawer{display:none!important;}
        body:not(.glueful-apple-dashboard) #glueful-dashboard-hamburger{display:none!important;}
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
