/* Glueful — Applications Reference Layout V8
 * Desktop reference geometry: 260px sidebar, 370px utility rail,
 * and 952px Applications main column. Data/handlers untouched.
 * This layer intentionally does NOT depend on a body class because several
 * older Applications presentation layers can run before this file.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_REFERENCE_LAYOUT_V8__)return;
  window.__GLUEFUL_APPLICATIONS_REFERENCE_LAYOUT_V8__=true;
  const STYLE_ID='glueful-applications-reference-layout-v8-style';
  function install(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1280px){
        html,body{overflow-x:hidden!important;}

        /* Exact desktop reference: sidebar 260px, utility rail 370px,
           Applications main begins at x=675px (260 + 32 + 383). */
        body #view-applications{
          position:fixed!important;left:260px!important;right:0!important;top:0!important;bottom:0!important;
          width:auto!important;height:100vh!important;min-height:100vh!important;margin:0!important;
          padding:26px 32px 52px!important;box-sizing:border-box!important;display:block!important;
          overflow-x:hidden!important;overflow-y:auto!important;transform:none!important;
        }

        /* Utility rail lives immediately beside the persistent sidebar. */
        body #view-applications > #glueful-applications-rail-v2,
        body #view-applications > #glueful-applications-workspace-v1{
          position:absolute!important;left:12px!important;right:auto!important;top:22px!important;
          width:370px!important;max-width:370px!important;min-width:370px!important;
          margin:0!important;padding:0!important;box-sizing:border-box!important;
          display:flex!important;flex-direction:column!important;gap:16px!important;
          z-index:100!important;visibility:visible!important;opacity:1!important;
        }
        body #view-applications > #glueful-applications-rail-v2 > #glueful-applications-workspace-v1{
          position:static!important;left:auto!important;right:auto!important;top:auto!important;
          width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding:0!important;
          display:flex!important;flex-direction:column!important;gap:16px!important;box-sizing:border-box!important;
          visibility:visible!important;opacity:1!important;
        }
        body #view-applications > #glueful-applications-rail-v2 > #glueful-applications-workspace-v1 > *,
        body #view-applications > #glueful-applications-workspace-v1 > *{
          width:100%!important;max-width:370px!important;box-sizing:border-box!important;
          visibility:visible!important;opacity:1!important;
        }

        /* Main header and Applications content. */
        body #view-applications > .view-header,
        body #view-applications > .glueful-applications-main-wide,
        body #view-applications > .glueful-applications-main-centered{
          width:min(952px,calc(100% - 383px))!important;max-width:952px!important;min-width:0!important;
          margin-left:383px!important;margin-right:0!important;box-sizing:border-box!important;
        }
        body #view-applications > .view-header{
          min-height:72px!important;margin-top:0!important;margin-bottom:0!important;padding:0!important;
          display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:22px!important;
        }
        body #view-applications > .view-header > button,
        body #view-applications > .view-header > a{
          position:static!important;inset:auto!important;transform:none!important;margin:0!important;flex:0 0 auto!important;
        }
        body #view-applications > .glueful-applications-main-wide{margin-top:14px!important;}
        body #view-applications > .glueful-applications-main-wide + .glueful-applications-main-centered{margin-top:14px!important;}
        body #view-applications > .glueful-applications-main-centered + .glueful-applications-main-centered{margin-top:16px!important;}

        body #view-applications input[type="search"],
        body #view-applications input[placeholder*="Search"],
        body #view-applications input[placeholder*="search"]{
          width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important;
        }
        body #view-applications .application-card,
        body #view-applications .job-application-card,
        body #view-applications [class*="application-card"]{
          width:100%!important;max-width:none!important;min-width:0!important;min-height:94px!important;
          box-sizing:border-box!important;
        }

        /* Neutralize the older right-rail positioning layers. */
        body #view-applications > #glueful-applications-rail-v2{
          right:auto!important;left:12px!important;top:22px!important;
        }
        body #view-applications > #glueful-applications-workspace-v1{
          right:auto!important;left:12px!important;top:22px!important;
        }
      }
      @media(min-width:768px) and (max-width:1279px){
        body #view-applications > #glueful-applications-rail-v2,
        body #view-applications > #glueful-applications-workspace-v1{display:none!important;}
        body #view-applications{width:calc(100vw - 260px)!important;margin:0!important;padding:26px!important;box-sizing:border-box!important;}
      }
      @media(max-width:767px){
        body #view-applications > #glueful-applications-rail-v2,
        body #view-applications > #glueful-applications-workspace-v1{display:none!important;}
      }
    `;
    document.head.appendChild(s);
  }
  function sync(){
    const view=document.getElementById('view-applications');
    if(!view)return;
    const active=view.classList.contains('active')||view.style.display==='block';
    if(!active)return;
    install();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
  [100,400,900,1800,3500].forEach(t=>setTimeout(sync,t));
  window.addEventListener('resize',sync,{passive:true});
  document.addEventListener('click',function(){setTimeout(sync,25);},true);
})();