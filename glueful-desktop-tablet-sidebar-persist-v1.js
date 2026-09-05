/* Glueful — Desktop/Tablet Sidebar Persist V1
 * Keeps the existing navigation drawer permanently open on desktop/tablet
 * for every view except Dashboard. Mobile behavior remains unchanged.
 * Presentation only; existing navigation handlers are preserved.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DESKTOP_TABLET_SIDEBAR_PERSIST_V1__) return;
  window.__GLUEFUL_DESKTOP_TABLET_SIDEBAR_PERSIST_V1__=true;

  const STYLE_ID='glueful-desktop-tablet-sidebar-persist-v1-style';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media (min-width:701px){
        /* Dashboard keeps its approved sidebar behavior. Every other view
           uses the existing drawer as a persistent navigation rail. */
        body:not(.glueful-apple-dashboard) .sidebar,
        body:not(.glueful-apple-dashboard) .side-nav,
        body:not(.glueful-apple-dashboard) .app-sidebar,
        body:not(.glueful-apple-dashboard) #glueful-drawer{
          display:flex!important;
          visibility:visible!important;
          opacity:1!important;
          position:fixed!important;
          left:0!important;
          top:0!important;
          bottom:0!important;
          width:230px!important;
          min-width:230px!important;
          max-width:230px!important;
          height:100vh!important;
          z-index:1000!important;
          transform:none!important;
          background:#fff!important;
          border-right:1px solid #e5e5ea!important;
          box-shadow:none!important;
          border-radius:0!important;
          overflow-y:auto!important;
          overflow-x:hidden!important;
        }

        body:not(.glueful-apple-dashboard) .drawer-overlay,
        body:not(.glueful-apple-dashboard) .sidebar-overlay,
        body:not(.glueful-apple-dashboard) #drawer-overlay{
          display:none!important;
          visibility:hidden!important;
          opacity:0!important;
          pointer-events:none!important;
        }

        /* A persistent rail does not need its open/close control on desktop/tablet. */
        body:not(.glueful-apple-dashboard) #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) #glueful-drawer .drawer-close,
        body:not(.glueful-apple-dashboard) #glueful-drawer .close{
          display:none!important;
        }
      }

      @media(max-width:700px){
        /* Mobile remains exactly as before. */
      }
    `;
    document.head.appendChild(s);
  }

  install();
})();
