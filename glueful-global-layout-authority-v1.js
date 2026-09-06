/* Glueful — Global Layout Authority V1
 * One desktop/tablet sidebar boundary for every section.
 * Dashboard and content canvases use the same 248px visual sidebar boundary.
 * Presentation-only: existing data, navigation and handlers remain intact.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_GLOBAL_LAYOUT_AUTHORITY_V1__) return;
  window.__GLUEFUL_GLOBAL_LAYOUT_AUTHORITY_V1__=true;
  const STYLE_ID='glueful-global-layout-authority-v1-style';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      :root{--glueful-sidebar-width:248px!important;}
      @media(min-width:1101px){
        html,body{overflow-x:hidden!important;}
        body #glueful-drawer,
        body .sidebar,body .side-nav,body .app-sidebar{
          left:0!important;top:0!important;bottom:0!important;
          width:248px!important;min-width:248px!important;max-width:248px!important;
          height:100vh!important;box-sizing:border-box!important;margin:0!important;
        }
        body #glueful-drawer{position:fixed!important;z-index:10000!important;}

        /* Every normal page starts immediately after the same sidebar. */
        body #view-applications,
        body #view-interviews,
        body #view-profile,
        body #view-saved-jobs,
        body #view-settings,
        body #view-jobs,
        body #view-resume,
        body #view-add-application{
          width:calc(100vw - 248px)!important;
          max-width:none!important;
          margin-left:248px!important;margin-right:0!important;
          box-sizing:border-box!important;
        }

        /* Dashboard gets the same boundary, with no second hidden left offset. */
        body.glueful-apple-dashboard #view-dashboard{
          position:fixed!important;left:248px!important;right:0!important;top:0!important;bottom:0!important;
          width:auto!important;height:100vh!important;max-width:none!important;min-width:0!important;
          margin:0!important;padding:26px 32px 52px!important;box-sizing:border-box!important;
          transform:none!important;overflow-x:hidden!important;overflow-y:auto!important;
        }
        body.glueful-apple-dashboard #view-dashboard > .glueful-dashboard-wide-shell-v1,
        body.glueful-apple-dashboard #view-dashboard > .dashboard-shell,
        body.glueful-apple-dashboard #view-dashboard > .main-content,
        body.glueful-apple-dashboard #view-dashboard > .content-shell{
          width:100%!important;max-width:none!important;min-width:0!important;
          margin:0!important;padding:0!important;box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard > *{box-sizing:border-box!important;}

        /* Interviews is allowed to use its own reference shell, but never a different sidebar boundary. */
        body #view-interviews{
          left:248px!important;right:0!important;margin-left:0!important;width:auto!important;
        }

        /* Preserve Applications' dedicated utility rail; only its outer canvas follows 248px. */
        body #view-applications > #glueful-applications-rail-v2,
        body #view-applications > #glueful-applications-workspace-v1{box-sizing:border-box!important;}
      }
      @media(min-width:768px) and (max-width:1100px){
        body #glueful-drawer,body .sidebar,body .side-nav,body .app-sidebar{
          width:248px!important;min-width:248px!important;max-width:248px!important;
          box-sizing:border-box!important;
        }
        body #view-dashboard,
        body #view-applications,body #view-interviews,body #view-profile,body #view-saved-jobs,
        body #view-settings,body #view-jobs,body #view-resume,body #view-add-application{
          width:calc(100vw - 248px)!important;margin-left:248px!important;margin-right:0!important;
          box-sizing:border-box!important;
        }
      }
    `;
    (document.head||document.documentElement).appendChild(s);
  }
  function enforce(){
    install();
    document.documentElement.style.setProperty('--glueful-sidebar-width','248px');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enforce,{once:true});else enforce();
  [100,500,1200,2500].forEach(function(t){setTimeout(enforce,t);});
  if(document.body){new MutationObserver(function(){install();}).observe(document.body,{childList:true,subtree:true});}
})();
