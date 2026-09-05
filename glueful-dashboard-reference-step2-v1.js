/* Glueful Dashboard Reference Step 2
 * Desktop navigation shell only. Reuses the existing sidebar/drawer and its
 * existing navigation handlers; this changes presentation, not behavior.
 */
(function(){
  'use strict';
  const STYLE_ID='glueful-dashboard-reference-step2-v1-style';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP2_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP2_V1__=true;

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      @media (min-width:1101px){
        body.glueful-apple-dashboard{
          overflow-x:hidden!important;
          background:#f5f5f7!important;
        }

        /* Turn the existing navigation surface into the reference sidebar. */
        body.glueful-apple-dashboard .sidebar,
        body.glueful-apple-dashboard .side-nav,
        body.glueful-apple-dashboard .app-sidebar,
        body.glueful-apple-dashboard #glueful-drawer{
          display:flex!important;
          visibility:visible!important;
          opacity:1!important;
          position:fixed!important;
          left:0!important;
          top:0!important;
          bottom:0!important;
          width:236px!important;
          min-width:236px!important;
          max-width:236px!important;
          height:100vh!important;
          z-index:1000!important;
          box-sizing:border-box!important;
          flex-direction:column!important;
          transform:none!important;
          background:#fff!important;
          border-right:1px solid #e5e5ea!important;
          box-shadow:none!important;
          border-radius:0!important;
          overflow-y:auto!important;
          overflow-x:hidden!important;
        }

        /* Existing drawer overlays/backdrops must not cover the application. */
        body.glueful-apple-dashboard .drawer-overlay,
        body.glueful-apple-dashboard .sidebar-overlay,
        body.glueful-apple-dashboard #drawer-overlay{
          display:none!important;
        }

        /* Desktop uses the sidebar; the mobile bottom navigation stays intact. */
        body.glueful-apple-dashboard .bottom-nav{
          display:none!important;
        }

        body.glueful-apple-dashboard #view-dashboard,
        body.glueful-apple-dashboard #view-jobs,
        body.glueful-apple-dashboard #view-applications,
        body.glueful-apple-dashboard #view-interviews,
        body.glueful-apple-dashboard #view-profile,
        body.glueful-apple-dashboard #view-saved-jobs,
        body.glueful-apple-dashboard #view-settings{
          width:min(1200px,calc(100vw - 284px))!important;
          max-width:1200px!important;
          margin-left:260px!important;
          margin-right:24px!important;
          box-sizing:border-box!important;
        }

        body.glueful-apple-dashboard #view-dashboard{
          padding-top:24px!important;
          padding-bottom:32px!important;
        }

        /* The desktop reference has no dashboard-local hamburger. */
        body.glueful-apple-dashboard #glueful-dashboard-hamburger{
          display:none!important;
        }
      }

      @media(max-width:1100px){
        body.glueful-apple-dashboard #glueful-dashboard-hamburger{
          display:flex!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function sync(){ install(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
})();
