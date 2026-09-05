/* Glueful — Applications Wide Main V15
 * Final reference geometry for the desktop Applications view.
 * Presentation only; application data and existing handlers are untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_WIDE_MAIN_V15__) return;
  window.__GLUEFUL_APPLICATIONS_WIDE_MAIN_V15__=true;

  function install(){
    const id='glueful-applications-wide-main-v15-style';
    if(document.getElementById(id)) return;
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`
      @media(min-width:1101px){
        /* Reference desktop geometry: persistent sidebar, wide center list,
           dedicated right rail. */
        body #view-applications{
          position:relative!important;
          left:auto!important;
          top:auto!important;
          width:auto!important;
          max-width:none!important;
          min-width:0!important;
          margin:0 0 0 264px!important;
          padding:24px 28px 48px!important;
          transform:none!important;
          box-sizing:border-box!important;
          overflow:visible!important;
        }

        body #view-applications .view-header{
          width:100%!important;
          min-height:70px!important;
          margin:0 0 28px!important;
          padding:0!important;
        }

        /* The main Applications content owns the space to the left of the
           fixed 358px reference rail. */
        body #view-applications > *:not(#glueful-applications-workspace-v1){
          max-width:calc(100% - 386px)!important;
          box-sizing:border-box!important;
        }

        body #glueful-applications-workspace-v1{
          position:fixed!important;
          top:14px!important;
          right:28px!important;
          width:358px!important;
          max-width:358px!important;
          z-index:900!important;
          display:flex!important;
          flex-direction:column!important;
          gap:16px!important;
          box-sizing:border-box!important;
        }

        body #glueful-applications-workspace-v1 > *{
          width:100%!important;
          max-width:none!important;
          box-sizing:border-box!important;
        }

        /* Reference order: Search Progress, Application Insights,
           Upcoming Actions, Quick Actions. */
        body #glueful-applications-workspace-v1 > :first-child{order:1!important;}
        body #glueful-applications-workspace-v1 > :nth-child(2){order:2!important;}
        body #glueful-applications-workspace-v1 > :nth-child(3){order:3!important;}
        body #glueful-applications-workspace-v1 > :nth-child(4){order:4!important;}

        body #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{
          display:none!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }

        body #view-applications .glueful-applications-search-progress,
        body #view-applications .glueful-applications-focus-today,
        body #view-applications [data-glueful-applications-left-rail]{
          display:none!important;
        }
      }

      @media(min-width:701px) and (max-width:1100px){
        body #view-applications{
          margin-left:244px!important;
          margin-right:20px!important;
          padding:24px 0 40px!important;
          width:auto!important;
          max-width:none!important;
          min-width:0!important;
          transform:none!important;
          box-sizing:border-box!important;
        }
        body #glueful-applications-workspace-v1{
          position:static!important;
          width:100%!important;
          max-width:none!important;
          margin-top:20px!important;
        }
        body #glueful-dashboard-hamburger{display:none!important;}
      }
    `;
    document.head.appendChild(s);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
