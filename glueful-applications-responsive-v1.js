/* Glueful Applications — Responsive V1
 * Keeps the approved desktop layout untouched.
 * Reflows the same Applications experience for tablet and mobile:
 * fixed navigation behavior, no horizontal overflow, stacked utility rail,
 * full-width main column, and a scrollable application list only.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_RESPONSIVE_V1__)return;
  window.__GLUEFUL_APPLICATIONS_RESPONSIVE_V1__=true;

  const VIEW='view-applications';
  const RAIL='glueful-applications-clean-v6-rail';
  const STYLE='glueful-applications-responsive-v1-style';
  const SCROLL='glueful-applications-scroll-container-v1';

  function view(){return document.getElementById(VIEW);}
  function active(v){return !!v&&(v.classList.contains('active')||v.style.display==='block');}

  function install(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      html,body{overflow-x:hidden!important;}

      /* Tablet: preserve the desktop information hierarchy while stacking
         the utility workspace above the full-width Applications column. */
      @media(min-width:768px) and (max-width:1279px){
        body #${VIEW}{
          overflow-x:hidden!important;
          overflow-y:hidden!important;
          box-sizing:border-box!important;
        }
        body #${VIEW}>.view-header{
          order:1!important;
          width:100%!important;max-width:none!important;min-width:0!important;
          margin-left:0!important;margin-right:0!important;box-sizing:border-box!important;
        }
        body #${VIEW}>#${RAIL}{
          order:2!important;position:relative!important;inset:auto!important;
          display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:14px!important;width:100%!important;max-width:none!important;min-width:0!important;
          margin:0 0 16px!important;padding:0!important;box-sizing:border-box!important;
          z-index:2!important;
        }
        body #${VIEW}>#${RAIL}>*{
          width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important;
        }
        body #${VIEW}>#${RAIL}>.insights{grid-column:1 / -1!important;}
        body #${VIEW}>#${RAIL} .insights,
        body #${VIEW}>#${RAIL} .upcoming,
        body #${VIEW}>#${RAIL} .quick{min-height:0!important;}
        body #${VIEW}>*:not(.view-header):not(#${RAIL}){
          order:3!important;width:100%!important;max-width:none!important;min-width:0!important;
          margin-left:0!important;margin-right:0!important;box-sizing:border-box!important;transform:none!important;
        }
        body #${VIEW} .glueful-applications-main-wide,
        body #${VIEW} .glueful-applications-main-centered{
          width:100%!important;max-width:none!important;min-width:0!important;
          margin-left:0!important;margin-right:0!important;box-sizing:border-box!important;
        }
        body #${VIEW} .${SCROLL}{
          max-height:max(220px,calc(100vh - var(--gf-app-scroll-top, 400px) - 20px))!important;
          overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;
          scrollbar-gutter:stable!important;
        }
      }

      /* Phone: single-column, touch-friendly layout. All existing utility
         panels remain available and the application list remains the only
         independently scrolling region. */
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
      clearTimeout(window.__gfAppResponsiveTimer);
      window.__gfAppResponsiveTimer=setTimeout(sync,40);
    }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
