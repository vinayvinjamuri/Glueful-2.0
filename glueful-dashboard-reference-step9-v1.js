/* Glueful Dashboard Reference Step 9 — responsive navigation polish
 * Presentation only. Keeps existing navigation handlers and mobile bottom-nav behavior.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP9_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP9_V1__=true;
  const STYLE_ID='glueful-dashboard-reference-step9-style';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style'); s.id=STYLE_ID;
    s.textContent=`
      /* Desktop: compact reference sidebar. */
      @media(min-width:1101px){
        body.glueful-apple-dashboard .sidebar,
        body.glueful-apple-dashboard .side-nav,
        body.glueful-apple-dashboard .app-sidebar,
        body.glueful-apple-dashboard #glueful-drawer{
          width:210px!important;min-width:210px!important;max-width:210px!important;
        }
        body.glueful-apple-dashboard #view-dashboard,
        body.glueful-apple-dashboard #view-jobs,
        body.glueful-apple-dashboard #view-applications,
        body.glueful-apple-dashboard #view-interviews,
        body.glueful-apple-dashboard #view-profile,
        body.glueful-apple-dashboard #view-saved-jobs,
        body.glueful-apple-dashboard #view-settings{
          width:min(1200px,calc(100vw - 258px))!important;
          margin-left:234px!important;margin-right:24px!important;
        }
      }

      /* Tablet: the existing drawer remains the navigation model, but uses the
         same compact spacing and typography as the desktop reference. */
      @media(min-width:701px) and (max-width:1100px){
        body.glueful-apple-dashboard .sidebar,
        body.glueful-apple-dashboard .side-nav,
        body.glueful-apple-dashboard .app-sidebar,
        body.glueful-apple-dashboard #glueful-drawer{
          width:220px!important;max-width:220px!important;
        }
      }

      /* Shared navigation density. Mobile keeps its existing drawer/bottom-nav
         behavior; only the visual density changes. */
      body.glueful-apple-dashboard .sidebar,
      body.glueful-apple-dashboard .side-nav,
      body.glueful-apple-dashboard .app-sidebar,
      body.glueful-apple-dashboard #glueful-drawer{
        box-sizing:border-box!important;
      }
      body.glueful-apple-dashboard .sidebar a,
      body.glueful-apple-dashboard .side-nav a,
      body.glueful-apple-dashboard .app-sidebar a,
      body.glueful-apple-dashboard #glueful-drawer a{
        min-height:42px!important;padding-top:7px!important;padding-bottom:7px!important;
      }
      body.glueful-apple-dashboard .sidebar .nav-item,
      body.glueful-apple-dashboard .side-nav .nav-item,
      body.glueful-apple-dashboard .app-sidebar .nav-item,
      body.glueful-apple-dashboard #glueful-drawer .nav-item{
        margin-bottom:2px!important;
      }
      @media(max-width:700px){
        body.glueful-apple-dashboard .sidebar a,
        body.glueful-apple-dashboard .side-nav a,
        body.glueful-apple-dashboard .app-sidebar a,
        body.glueful-apple-dashboard #glueful-drawer a{
          min-height:40px!important;
        }
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
