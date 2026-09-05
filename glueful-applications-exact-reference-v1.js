/* Glueful — Applications Exact Reference V2
 * Source-of-truth desktop/tablet Applications layout.
 * Uses one coherent content geometry: persistent sidebar + list + 32px gap + right rail.
 * Presentation only; existing application data and handlers remain untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_EXACT_REFERENCE_V2__) return;
  window.__GLUEFUL_APPLICATIONS_EXACT_REFERENCE_V2__=true;

  function install(){
    const id='glueful-applications-exact-reference-v2-style';
    if(document.getElementById(id)) return;
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`
      html,body{background:#f7f7f9!important;color:#16161a!important;}
      body{color-scheme:light!important;}

      @media(min-width:1280px){
        /* Desktop source-of-truth geometry. */
        body #view-applications{
          position:relative!important;
          left:0!important;
          top:0!important;
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          min-width:0!important;
          margin:0!important;
          padding:24px 32px 48px!important;
          box-sizing:border-box!important;
          transform:none!important;
          overflow:visible!important;
          height:auto!important;
          max-height:none!important;
        }

        /* Reserve the right rail from the main application column without
           arbitrary transforms or fixed-position cards. */
        body #view-applications > *:not(#glueful-applications-workspace-v1){
          width:min(840px,calc(100% - 352px))!important;
          max-width:min(840px,calc(100% - 352px))!important;
          box-sizing:border-box!important;
        }

        body #view-applications .view-header{
          position:relative!important;
          display:flex!important;
          align-items:flex-start!important;
          justify-content:space-between!important;
          width:min(840px,calc(100% - 352px))!important;
          min-height:72px!important;
          margin:0 0 24px!important;
          padding:0!important;
          box-sizing:border-box!important;
        }
        body #view-applications .view-title{
          margin:0 0 5px!important;
          font-size:34px!important;
          line-height:1.08!important;
          letter-spacing:-1.1px!important;
          font-weight:700!important;
          color:#16161a!important;
        }
        body #view-applications .view-subtitle{
          margin:0!important;
          font-size:16px!important;
          line-height:1.4!important;
          color:#6b6b76!important;
        }

        body #view-applications input,
        body #view-applications select,
        body #view-applications textarea{
          min-height:48px!important;
          border:1px solid #e7e7ea!important;
          border-radius:12px!important;
          background:#fff!important;
          color:#16161a!important;
          box-sizing:border-box!important;
        }

        body #view-applications .application-card,
        body #view-applications .job-application-card,
        body #view-applications .card{
          width:100%!important;
          min-height:92px!important;
          background:#fff!important;
          color:#16161a!important;
          border:1px solid #e7e7ea!important;
          border-radius:16px!important;
          box-shadow:0 1px 2px rgba(0,0,0,.03),0 4px 12px rgba(0,0,0,.04)!important;
          box-sizing:border-box!important;
        }

        /* Search/filter/list spacing. */
        body #view-applications .application-card + .application-card,
        body #view-applications .job-application-card + .job-application-card{margin-top:12px!important;}

        /* Right rail participates in the page flow and scrolls with it. */
        body #glueful-applications-workspace-v1{
          position:absolute!important;
          top:0!important;
          right:32px!important;
          width:320px!important;
          max-width:320px!important;
          margin:0!important;
          padding:0!important;
          display:flex!important;
          flex-direction:column!important;
          gap:20px!important;
          z-index:10!important;
          box-sizing:border-box!important;
        }
        body #glueful-applications-workspace-v1 > *{
          width:320px!important;
          max-width:320px!important;
          box-sizing:border-box!important;
        }
        body #glueful-applications-workspace-v1 > :first-child{order:1!important;}
        body #glueful-applications-workspace-v1 > :nth-child(2){order:2!important;}
        body #glueful-applications-workspace-v1 > :nth-child(3){order:3!important;}
        body #glueful-applications-workspace-v1 > :nth-child(4){order:4!important;}

        /* Keep the existing rail card designs, only normalize outer geometry. */
        body #glueful-applications-workspace-v1 .gf-insight-card{
          width:320px!important;
          box-sizing:border-box!important;
        }
        body #glueful-applications-workspace-v1 .gf-progress-card{min-height:160px!important;}

        /* Desktop/tablet navigation is persistent; hamburger belongs only to mobile. */
        body #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{
          display:none!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }

        body #glueful-applications-left-v1,
        body #view-applications .glueful-applications-search-progress,
        body #view-applications .glueful-applications-focus-today,
        body #view-applications [data-glueful-applications-left-rail]{
          display:none!important;
          visibility:hidden!important;
        }
      }

      @media(min-width:768px) and (max-width:1279px){
        body #view-applications{
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          margin:0!important;
          padding:24px 24px 40px!important;
          left:0!important;
          transform:none!important;
          box-sizing:border-box!important;
        }
        body #view-applications > *:not(#glueful-applications-workspace-v1){
          width:100%!important;
          max-width:none!important;
          box-sizing:border-box!important;
        }
        body #glueful-applications-workspace-v1{display:none!important;}
        body #glueful-dashboard-hamburger{display:none!important;visibility:hidden!important;}
      }

      @media(max-width:767px){
        body #glueful-applications-workspace-v1{display:none!important;}
        body #view-applications{
          width:100%!important;
          max-width:none!important;
          margin:0!important;
          padding:16px 12px 96px!important;
          left:0!important;
          transform:none!important;
          box-sizing:border-box!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
