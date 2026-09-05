/* Glueful — Dashboard Layout Authoritative V1
 * Final desktop/tablet geometry correction.
 * Presentation only: preserves dashboard data, navigation, and handlers.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_LAYOUT_AUTHORITATIVE_V1__) return;
  window.__GLUEFUL_DASHBOARD_LAYOUT_AUTHORITATIVE_V1__=true;

  const STYLE_ID='glueful-dashboard-layout-authoritative-v1-style';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        /* One source of truth: 260px persistent sidebar, no dark gutter. */
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
          box-sizing:border-box!important;
          z-index:1000!important;
          background:#fff!important;
          border-right:1px solid #e7e9ef!important;
          box-shadow:none!important;
          transform:none!important;
          overflow-y:auto!important;
          overflow-x:hidden!important;
        }

        /* Cover the legacy dark strip that previously occupied the gap under
           the dashboard sidebar. */
        body.glueful-apple-dashboard::before{
          content:""!important;
          position:fixed!important;
          left:260px!important;
          top:0!important;
          right:0!important;
          bottom:0!important;
          background:#f5f5f7!important;
          z-index:1!important;
          pointer-events:none!important;
        }

        /* Cancel every historical dashboard offset/transform. */
        body.glueful-apple-dashboard #view-dashboard{
          position:relative!important;
          left:auto!important;
          right:auto!important;
          top:auto!important;
          transform:none!important;
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          min-width:0!important;
          margin:0 0 0 260px!important;
          padding:26px 32px 52px!important;
          box-sizing:border-box!important;
          z-index:2!important;
          background:transparent!important;
        }

        body.glueful-apple-dashboard .glueful-dashboard-wide-shell-v1{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin:0!important;
          padding:0!important;
          box-sizing:border-box!important;
          background:transparent!important;
        }

        body.glueful-apple-dashboard #view-dashboard .view-header{
          position:relative!important;
          left:auto!important;
          top:auto!important;
          transform:none!important;
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
          box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard{
          position:relative!important;
          left:auto!important;
          transform:none!important;
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          margin:0 0 0 260px!important;
          padding:24px 26px 48px!important;
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

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
