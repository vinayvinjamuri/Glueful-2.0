/* Glueful — Dashboard Reference Authoritative V3
 * Final desktop geometry correction for the supplied reference.
 * Presentation only. Existing dashboard data/navigation/handlers stay intact.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_AUTHORITATIVE_V3__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_AUTHORITATIVE_V3__=true;

  const STYLE_ID='glueful-dashboard-reference-authoritative-v3-style';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        /* Reference geometry: sidebar is the only left offset. The dashboard
           itself is taken out of the legacy centered/main-wrapper flow. */
        body.glueful-apple-dashboard #glueful-drawer,
        body.glueful-apple-dashboard .sidebar,
        body.glueful-apple-dashboard .side-nav,
        body.glueful-apple-dashboard .app-sidebar{
          position:fixed!important;
          left:0!important;
          top:0!important;
          bottom:0!important;
          width:260px!important;
          min-width:260px!important;
          max-width:260px!important;
          height:100vh!important;
          margin:0!important;
          padding:0!important;
          box-sizing:border-box!important;
          transform:none!important;
          z-index:10000!important;
          overflow-y:auto!important;
          overflow-x:hidden!important;
          background:#fff!important;
          border-right:1px solid #e7e9ef!important;
        }

        body.glueful-apple-dashboard #view-dashboard{
          position:fixed!important;
          left:260px!important;
          right:0!important;
          top:0!important;
          bottom:0!important;
          width:auto!important;
          height:auto!important;
          max-width:none!important;
          min-width:0!important;
          margin:0!important;
          padding:26px 32px 52px!important;
          box-sizing:border-box!important;
          transform:none!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          background:#f7f8fb!important;
          z-index:2!important;
        }

        body.glueful-apple-dashboard #view-dashboard .glueful-dashboard-wide-shell-v1,
        body.glueful-apple-dashboard #view-dashboard > .dashboard-shell,
        body.glueful-apple-dashboard #view-dashboard > .main-content,
        body.glueful-apple-dashboard #view-dashboard > .content-shell{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin:0!important;
          padding:0!important;
          box-sizing:border-box!important;
        }

        /* Header actions belong to the scrolling dashboard header. Some older
           layers made this group fixed; force it back into normal header flow. */
        body.glueful-apple-dashboard #view-dashboard .view-header{
          position:relative!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions{
          position:absolute!important;
          top:0!important;
          right:0!important;
          left:auto!important;
          bottom:auto!important;
          margin:0!important;
          transform:none!important;
          z-index:10!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions .glueful-approved-application{
          position:relative!important;
          top:auto!important;
          right:auto!important;
          left:auto!important;
          transform:none!important;
        }

        /* Keep the five-card row fully inside the dashboard viewport. */
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1{
          width:100%!important;
          max-width:none!important;
          box-sizing:border-box!important;
        }

        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1{
          width:100%!important;
          max-width:none!important;
          box-sizing:border-box!important;
        }

        /* Attention rows stay inside the card instead of using the old
           full-bleed negative margins. This keeps every row aligned with the
           card edges while preserving the existing data and actions. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-list{
          margin:16px 0 0!important;
          display:grid!important;
          gap:0!important;
          border-top:1px solid #f0f0f2!important;
          width:100%!important;
          box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-row{
          display:grid!important;
          grid-template-columns:40px minmax(0,1fr) auto!important;
          gap:16px!important;
          width:100%!important;
          min-width:0!important;
          padding:14px 0!important;
          border:0!important;
          border-bottom:1px solid #f0f0f2!important;
          border-radius:0!important;
          background:#fff!important;
          box-sizing:border-box!important;
          position:relative!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-company-mark{
          width:40px!important;
          height:40px!important;
          border-radius:10px!important;
          font-size:12px!important;
        }
      }

      @media(min-width:701px) and (max-width:1100px){
        body.glueful-apple-dashboard #glueful-drawer,
        body.glueful-apple-dashboard .sidebar,
        body.glueful-apple-dashboard .side-nav,
        body.glueful-apple-dashboard .app-sidebar{
          width:260px!important;
          min-width:260px!important;
          max-width:260px!important;
          margin:0!important;
          box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard{
          position:relative!important;
          left:auto!important;
          right:auto!important;
          top:auto!important;
          bottom:auto!important;
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          margin:0 0 0 260px!important;
          padding:24px 26px 48px!important;
          box-sizing:border-box!important;
          transform:none!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header{
          position:relative!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions{
          position:absolute!important;
          top:0!important;
          right:0!important;
          left:auto!important;
          bottom:auto!important;
          transform:none!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-list{
          margin:16px 0 0!important;
          width:100%!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-row{
          width:100%!important;
          padding:14px 0!important;
          box-sizing:border-box!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function sync(){
    install();
    const d=document.getElementById('view-dashboard');
    const active=!!d&&(d.classList.contains('active')||d.style.display==='block');
    document.body.classList.toggle('glueful-apple-dashboard',active);
  }

  function start(){
    install();
    sync();
    window.addEventListener('resize',sync,{passive:true});
    document.addEventListener('click',function(){setTimeout(sync,50);},true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
