/* Glueful — Applications Grid Spec V1
 * Structural presentation layer for the approved Applications specification.
 * Keeps existing application data and handlers intact.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_GRID_SPEC_V1__) return;
  window.__GLUEFUL_APPLICATIONS_GRID_SPEC_V1__=true;

  const STYLE_ID='glueful-applications-grid-spec-v1-style';

  function moveWorkspaceIntoView(){
    const view=document.getElementById('view-applications');
    const rail=document.getElementById('glueful-applications-workspace-v1');
    if(view && rail && rail.parentElement!==view) view.appendChild(rail);
  }

  function install(){
    moveWorkspaceIntoView();
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      html,body{background:#f8f8fa!important;color:#16161a!important;}

      @media(min-width:1280px){
        body #view-applications{
          position:relative!important;left:0!important;top:0!important;
          width:calc(100vw - 260px)!important;max-width:none!important;min-width:0!important;
          margin:0 0 0 260px!important;padding:0 32px 48px!important;
          box-sizing:border-box!important;transform:none!important;overflow:visible!important;
          height:auto!important;max-height:none!important;display:grid!important;
          grid-template-columns:minmax(0,840px) 320px!important;
          grid-template-rows:72px auto!important;column-gap:32px!important;row-gap:0!important;
          align-items:start!important;justify-content:space-between!important;
        }
        body #view-applications .view-header{
          grid-column:1 / -1!important;grid-row:1!important;position:sticky!important;top:0!important;z-index:50!important;
          width:100%!important;height:72px!important;min-height:72px!important;margin:0!important;padding:0!important;
          display:flex!important;align-items:center!important;justify-content:space-between!important;
          background:#f8f8fa!important;box-sizing:border-box!important;
        }
        body #view-applications .view-title{font-size:34px!important;line-height:1.08!important;font-weight:700!important;letter-spacing:-1px!important;margin:24px 0 4px!important;}
        body #view-applications .view-subtitle{font-size:16px!important;line-height:1.35!important;margin:0 0 24px!important;color:#6b6b76!important;}
        body #view-applications > *:not(.view-header):not(#glueful-applications-workspace-v1){grid-column:1!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;}
        body #view-applications #glueful-applications-workspace-v1{
          grid-column:2!important;grid-row:2!important;position:static!important;top:auto!important;right:auto!important;
          width:320px!important;max-width:320px!important;min-width:320px!important;margin:0!important;padding:0!important;
          display:flex!important;flex-direction:column!important;gap:20px!important;z-index:1!important;box-sizing:border-box!important;
        }
        body #view-applications #glueful-applications-workspace-v1 > *{width:320px!important;max-width:320px!important;box-sizing:border-box!important;}
        body #view-applications input[type="text"],body #view-applications input[type="search"],body #view-applications input,body #view-applications select,body #view-applications textarea{
          box-sizing:border-box!important;min-height:48px!important;border:1px solid #e7e7ea!important;border-radius:12px!important;background:#fff!important;
        }
        body #view-applications .application-card,body #view-applications .job-application-card,body #view-applications .card{
          width:100%!important;min-height:88px!important;box-sizing:border-box!important;background:#fff!important;
          border:1px solid #e7e7ea!important;border-radius:16px!important;box-shadow:0 1px 2px rgba(0,0,0,.03),0 4px 12px rgba(0,0,0,.04)!important;
        }
        body #view-applications .glueful-applications-search-progress,body #view-applications .glueful-applications-focus-today,body #view-applications [data-glueful-applications-left-rail],body #glueful-applications-left-v1{display:none!important;visibility:hidden!important;}
        body #view-applications .view-header > button,body #view-applications .view-header > a{position:static!important;top:auto!important;right:auto!important;margin:0!important;}
        body #glueful-dashboard-hamburger,body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{display:none!important;visibility:hidden!important;pointer-events:none!important;}
      }

      @media(min-width:768px) and (max-width:1279px){
        body #view-applications{position:relative!important;left:0!important;top:0!important;width:calc(100vw - 220px)!important;max-width:none!important;min-width:0!important;margin:0 0 0 220px!important;padding:0 24px 40px!important;box-sizing:border-box!important;transform:none!important;overflow:visible!important;display:block!important;}
        body #view-applications .view-header{position:relative!important;width:100%!important;height:72px!important;min-height:72px!important;margin:0 0 24px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:space-between!important;background:#f8f8fa!important;box-sizing:border-box!important;}
        body #view-applications > *:not(.view-header):not(#glueful-applications-workspace-v1){max-width:100%!important;box-sizing:border-box!important;}
        body #view-applications #glueful-applications-workspace-v1{position:static!important;width:100%!important;max-width:none!important;margin-top:20px!important;display:flex!important;gap:16px!important;}
        body #view-applications #glueful-applications-workspace-v1 > *{width:100%!important;max-width:none!important;}
        body #glueful-dashboard-hamburger{display:none!important;}
      }

      @media(max-width:767px){
        body #view-applications{width:100%!important;margin:0!important;padding:0 12px 96px!important;display:block!important;box-sizing:border-box!important;}
        body #view-applications .view-header{position:relative!important;height:72px!important;min-height:72px!important;margin:0!important;padding:0!important;}
        body #view-applications #glueful-applications-workspace-v1{position:static!important;width:100%!important;max-width:none!important;margin-top:20px!important;display:none!important;}
      }
    `;
    document.head.appendChild(s);
  }

  function boot(){install();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
