/* Glueful Applications — Tablet Final V1
 * Final tablet geometry override.
 * Keeps the utility rail beside the Applications content without letting
 * the rail's height create a giant CSS-grid row above the search/list.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_TABLET_FINAL_V1__)return;
  window.__GLUEFUL_APPLICATIONS_TABLET_FINAL_V1__=true;

  const VIEW='view-applications';
  const RAIL='glueful-applications-clean-v6-rail';
  const STYLE='glueful-applications-tablet-final-v1-style';

  function install(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      @media(min-width:768px) and (max-width:1279px){
        body #${VIEW}{
          position:relative!important;
          display:block!important;
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
        }

        /* The rail is independent of document flow, so its height can never
           push the Applications header/search down. */
        body #${VIEW}>#${RAIL}{
          position:absolute!important;
          left:20px!important;
          top:22px!important;
          right:auto!important;
          bottom:auto!important;
          display:flex!important;
          flex-direction:column!important;
          gap:12px!important;
          width:31%!important;
          max-width:none!important;
          min-width:240px!important;
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

        /* Every Applications content block shares one clean second column. */
        body #${VIEW}>*:not(#${RAIL}){
          width:calc(69% - 18px)!important;
          max-width:none!important;
          min-width:0!important;
          margin-left:calc(31% + 18px)!important;
          margin-right:0!important;
          box-sizing:border-box!important;
          transform:none!important;
        }

        body #${VIEW}>.view-header{
          height:auto!important;
          min-height:66px!important;
          margin-top:0!important;
          margin-bottom:12px!important;
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
        body #${VIEW}>.view-header .view-subtitle{
          font-size:14px!important;
          line-height:19px!important;
        }

        body #${VIEW}>.view-header>button,
        body #${VIEW}>.view-header>a{
          min-height:40px!important;
          white-space:nowrap!important;
          flex:0 0 auto!important;
        }

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
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          box-sizing:border-box!important;
        }

        body #${VIEW} .application-card,
        body #${VIEW} .job-application-card,
        body #${VIEW} [class*="application-card"]{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          box-sizing:border-box!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function sync(){
    const v=document.getElementById(VIEW);
    if(!v)return;
    if(!(v.classList.contains('active')||v.style.display==='block'))return;
    install();
    const rail=document.getElementById(RAIL);
    if(rail){
      rail.style.removeProperty('display');
      rail.style.removeProperty('position');
      rail.style.removeProperty('left');
      rail.style.removeProperty('top');
      rail.style.removeProperty('width');
    }
  }

  function start(){
    sync();
    [100,500,1200,2500].forEach(function(t){setTimeout(sync,t);});
    window.addEventListener('resize',sync,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
