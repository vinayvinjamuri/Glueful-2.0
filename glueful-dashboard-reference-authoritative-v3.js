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

        /* Never allow a historical centered shell to shrink the five-card row. */
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

        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1{
          width:100%!important;
          max-width:none!important;
          box-sizing:border-box!important;
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
