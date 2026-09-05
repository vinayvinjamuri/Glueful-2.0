/* Glueful — Desktop/Tablet Sidebar Persist V5
 * Non-dashboard desktop/tablet views use the existing navigation drawer as
 * the persistent sidebar. Mobile drawer behavior remains unchanged.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DESKTOP_TABLET_SIDEBAR_PERSIST_V5__) return;
  window.__GLUEFUL_DESKTOP_TABLET_SIDEBAR_PERSIST_V5__=true;
  const STYLE_ID='glueful-desktop-tablet-sidebar-persist-v5-style';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1280px){
        body:not(.glueful-apple-dashboard) #glueful-drawer{
          display:flex!important;visibility:visible!important;opacity:1!important;
          position:fixed!important;left:0!important;top:0!important;bottom:0!important;
          width:260px!important;min-width:260px!important;max-width:260px!important;
          height:100vh!important;z-index:1000!important;box-sizing:border-box!important;
          flex-direction:column!important;transform:none!important;background:#fff!important;
          border-right:1px solid #e7e7ea!important;box-shadow:none!important;border-radius:0!important;
          overflow-y:auto!important;overflow-x:hidden!important;padding:24px 20px!important;
        }
      }
      @media(min-width:768px) and (max-width:1279px){
        body:not(.glueful-apple-dashboard) #glueful-drawer{
          display:flex!important;visibility:visible!important;opacity:1!important;
          position:fixed!important;left:0!important;top:0!important;bottom:0!important;
          width:260px!important;min-width:260px!important;max-width:260px!important;
          height:100vh!important;z-index:1000!important;box-sizing:border-box!important;
          flex-direction:column!important;transform:none!important;background:#fff!important;
          border-right:1px solid #e7e7ea!important;box-shadow:none!important;border-radius:0!important;
          overflow-y:auto!important;overflow-x:hidden!important;padding:24px 20px!important;
        }
      }
      @media(min-width:768px){
        body:not(.glueful-apple-dashboard) .drawer-overlay,
        body:not(.glueful-apple-dashboard) .sidebar-overlay,
        body:not(.glueful-apple-dashboard) #drawer-overlay{
          display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;
        }
        body:not(.glueful-apple-dashboard) #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{
          display:none!important;visibility:hidden!important;pointer-events:none!important;
        }
        body:not(.glueful-apple-dashboard) #glueful-drawer .drawer-close,
        body:not(.glueful-apple-dashboard) #glueful-drawer .close{display:none!important;}
      }
      @media(max-width:767px){
        /* Mobile navigation remains controlled by the existing drawer logic. */
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
