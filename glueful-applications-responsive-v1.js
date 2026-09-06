/* Glueful Applications — Responsive V2
 * Keeps the approved desktop and mobile experience intact.
 * Tablet uses a compact two-column workspace so the utility rail stays
 * beside Applications instead of dropping below the application list.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_RESPONSIVE_V2__)return;
  window.__GLUEFUL_APPLICATIONS_RESPONSIVE_V2__=true;

  const VIEW='view-applications';
  const RAIL='glueful-applications-clean-v6-rail';
  const STYLE='glueful-applications-responsive-v2-style';
  const SCROLL='glueful-applications-scroll-container-v1';

  function view(){return document.getElementById(VIEW);}
  function active(v){return !!v&&(v.classList.contains('active')||v.style.display==='block');}

  function install(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      html,body{overflow-x:hidden!important;}

      /* ================================================================
         TABLET: compact two-column Applications workspace
         The available content area is shared between the utility rail and
         Applications. This is intentionally separate from the large
         desktop geometry so browser zoom / tablet widths do not collapse
         the rail underneath the application list.
         ================================================================ */
      @media(min-width:768px) and (max-width:1279px){
        body #${VIEW}{
          position:relative!important;
          left:0!important;right:auto!important;top:auto!important;bottom:auto!important;
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          min-width:0!important;
          height:100vh!important;
          min-height:100vh!important;
          margin:0!important;
          padding:22px 20px 28px!important;
          box-sizing:border-box!important;
          overflow-x:hidden!important;
          overflow-y:hidden!important;
          transform:none!important;
          display:grid!important;
          grid-template-columns:minmax(240px,31%) minmax(0,1fr)!important;
          column-gap:18px!important;
          align-items:start!important;
        }

        /* Utility rail owns the first column and remains visible. */
        body #${VIEW}>#${RAIL}{
          position:relative!important;
          left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
          grid-column:1!important;
          grid-row:1 / span 2!important;
          display:flex!important;
          flex-direction:column!important;
          gap:12px!important;
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin:0!important;
          padding:0!important;
          box-sizing:border-box!important;
          z-index:20!important;
        }
        body #${VIEW}>#${RAIL}>*{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          box-sizing:border-box!important;
        }
        body #${VIEW}>#${RAIL} .card{
          padding:14px!important;
          border-radius:14px!important;
        }
        body #${VIEW}>#${RAIL} .insights{min-height:250px!important;}
        body #${VIEW}>#${RAIL} .upcoming{min-height:154px!important;}
        body #${VIEW}>#${RAIL} .quick{min-height:220px!important;}
        body #${VIEW}>#${RAIL} .head{margin-bottom:11px!important;}
        body #${VIEW}>#${RAIL} h3{font-size:15px!important;line-height:19px!important;}
        body #${VIEW}>#${RAIL} .month{height:34px!important;line-height:34px!important;padding:0 9px!important;font-size:11px!important;}
        body #${VIEW}>#${RAIL} .body{gap:12px!important;margin:3px 0 13px!important;}
        body #${VIEW}>#${RAIL} .donut{width:100px!important;height:100px!important;flex-basis:100px!important;}
        body #${VIEW}>#${RAIL} .donut:after{inset:14px!important;}
        body #${VIEW}>#${RAIL} .legend{gap:9px!important;}
        body #${VIEW}>#${RAIL} .legend div{font-size:11px!important;line-height:14px!important;}
        body #${VIEW}>#${RAIL} .tip{padding:10px!important;font-size:10px!important;line-height:14px!important;}
        body #${VIEW}>#${RAIL} .action{padding:8px 0!important;gap:9px!important;}
        body #${VIEW}>#${RAIL} .action-icon{width:32px!important;height:32px!important;flex-basis:32px!important;font-size:18px!important;}
        body #${VIEW}>#${RAIL} .action b{font-size:11px!important;line-height:14px!important;}
        body #${VIEW}>#${RAIL} .action small{font-size:10px!important;line-height:13px!important;}
        body #${VIEW}>#${RAIL} .quick button{height:38px!important;min-height:38px!important;margin-top:6px!important;font-size:11px!important;line-height:38px!important;padding:0 9px!important;}

        /* Every other direct child becomes the second column. */
        body #${VIEW}>*:not(#${RAIL}){
          grid-column:2!important;
          box-sizing:border-box!important;
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin-left:0!important;
          margin-right:0!important;
          transform:none!important;
        }
        body #${VIEW}>.view-header{
          grid-row:1!important;
          height:auto!important;
          min-height:66px!important;
          margin:0 0 12px!important;
          padding:0!important;
          display:flex!important;
          align-items:flex-start!important;
          justify-content:space-between!important;
          gap:12px!important;
          position:relative!important;
        }
        body #${VIEW}>.view-header .view-title{
          margin:0 0 4px!important;
          font-size:31px!important;
          line-height:34px!important;
          letter-spacing:-1px!important;
        }
        body #${VIEW}>.view-header .view-subtitle{font-size:14px!important;line-height:19px!important;}
        body #${VIEW}>.view-header>button,
        body #${VIEW}>.view-header>a{min-height:40px!important;white-space:nowrap!important;flex:0 0 auto!important;}

        /* Main Applications wrappers share the second column. */
        body #${VIEW} .glueful-applications-main-wide,
        body #${VIEW} .glueful-applications-main-centered{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin-left:0!important;
          margin-right:0!important;
          box-sizing:border-box!important;
        }
        body #${VIEW} input[type="search"],
        body #${VIEW} input[placeholder*="Search"],
        body #${VIEW} input[placeholder*="search"]{
          width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important;
        }
        body #${VIEW} .application-card,
        body #${VIEW} .job-application-card,
        body #${VIEW} [class*="application-card"]{
          width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important;
        }
        body #${VIEW} .${SCROLL}{
          max-height:calc(100vh - 205px)!important;
          overflow-y:auto!important;
          overflow-x:hidden!important;
          overscroll-behavior:contain!important;
          scrollbar-gutter:stable!important;
        }
      }

      /* ================================================================
         PHONE: single-column touch layout
         ================================================================ */
      @media(max-width:767px){
        body #${VIEW}{
          position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
          width:100%!important;max-width:100%!important;min-width:0!important;
          height:100dvh!important;min-height:100dvh!important;margin:0!important;
          padding:14px 12px 18px!important;box-sizing:border-box!important;
          overflow-x:hidden!important;overflow-y:hidden!important;transform:none!important;
          display:flex!important;flex-direction:column!important;gap:0!important;
        }
        body #${VIEW}>.view-header{
          order:1!important;width:100%!important;max-width:none!important;min-width:0!important;
          min-height:0!important;height:auto!important;margin:0 0 14px!important;padding:0!important;
          box-sizing:border-box!important;display:flex!important;align-items:flex-start!important;
          justify-content:space-between!important;gap:10px!important;
        }
        body #${VIEW}>.view-header .view-title{font-size:30px!important;line-height:34px!important;letter-spacing:-.7px!important;}
        body #${VIEW}>.view-header .view-subtitle{font-size:14px!important;line-height:19px!important;}
        body #${VIEW}>.view-header>button,
        body #${VIEW}>.view-header>a{flex:0 0 auto!important;min-height:42px!important;white-space:nowrap!important;}

        body #${VIEW}>#${RAIL}{
          order:2!important;position:relative!important;inset:auto!important;display:flex!important;
          flex-direction:column!important;gap:10px!important;width:100%!important;max-width:none!important;
          min-width:0!important;margin:0 0 14px!important;padding:0!important;box-sizing:border-box!important;z-index:2!important;
        }
        body #${VIEW}>#${RAIL}>*{
          width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important;
        }
        body #${VIEW}>#${RAIL} .insights,
        body #${VIEW}>#${RAIL} .upcoming,
        body #${VIEW}>#${RAIL} .quick{
          min-height:0!important;padding:14px!important;
        }
        body #${VIEW}>#${RAIL} .body{gap:12px!important;margin-bottom:12px!important;}
        body #${VIEW}>#${RAIL} .donut{width:96px!important;height:96px!important;flex-basis:96px!important;}
        body #${VIEW}>#${RAIL} .donut:after{inset:14px!important;}
        body #${VIEW}>#${RAIL} .legend{gap:8px!important;}
        body #${VIEW}>#${RAIL} .action{padding:9px 0!important;}
        body #${VIEW}>#${RAIL} .quick button{min-height:44px!important;}

        body #${VIEW}>*:not(.view-header):not(#${RAIL}){
          order:3!important;width:100%!important;max-width:none!important;min-width:0!important;
          margin-left:0!important;margin-right:0!important;box-sizing:border-box!important;transform:none!important;
        }
        body #${VIEW} .glueful-applications-main-wide,
        body #${VIEW} .glueful-applications-main-centered{
          width:100%!important;max-width:none!important;min-width:0!important;
          margin-left:0!important;margin-right:0!important;box-sizing:border-box!important;
        }
        body #${VIEW} input[type="search"],
        body #${VIEW} input[placeholder*="Search"],
        body #${VIEW} input[placeholder*="search"]{
          width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important;
        }
        body #${VIEW} .application-card,
        body #${VIEW} .job-application-card,
        body #${VIEW} [class*="application-card"]{
          width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important;
        }
        body #${VIEW} .${SCROLL}{
          max-height:max(180px,calc(100dvh - var(--gf-app-scroll-top, 300px) - 16px))!important;
          overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;
          scrollbar-gutter:stable!important;
        }
        body #${VIEW} .${SCROLL}::-webkit-scrollbar{width:7px!important;}
        body #${VIEW} .${SCROLL}::-webkit-scrollbar-thumb{background:#cbd2df!important;border-radius:8px!important;}
        body #${VIEW} .${SCROLL}::-webkit-scrollbar-track{background:transparent!important;}
      }
    `;
    document.head.appendChild(s);
  }

  function sync(){
    const v=view();
    if(!active(v))return;
    install();
    const rail=document.getElementById(RAIL);
    if(rail)rail.style.removeProperty('display');
  }

  function start(){
    sync();
    [100,400,900,1800].forEach(t=>setTimeout(sync,t));
    window.addEventListener('resize',sync,{passive:true});
    new MutationObserver(function(){
      clearTimeout(window.__gfAppResponsiveV2Timer);
      window.__gfAppResponsiveV2Timer=setTimeout(sync,40);
    }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
