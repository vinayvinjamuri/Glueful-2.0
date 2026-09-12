/* Glueful Applications — Tablet Final V2
 * Resize-safe Applications layout.
 * Only targets the Applications view.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_TABLET_FINAL_V2__)return;
  window.__GLUEFUL_APPLICATIONS_TABLET_FINAL_V2__=true;

  const VIEW='view-applications';
  const RAIL='glueful-applications-clean-v6-rail';
  const STYLE='glueful-applications-tablet-final-v2-style';

  function install(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      /* Desktop (1280+) is intentionally untouched. */

      /* Medium PC windows: keep the Applications pane anchored after the
         fixed 260px sidebar and reflow its two-column content safely. */
      @media(min-width:960px) and (max-width:1279px){
        body #${VIEW}{
          position:fixed!important;
          left:260px!important;
          right:0!important;
          top:0!important;
          bottom:0!important;
          width:auto!important;
          max-width:none!important;
          min-width:0!important;
          height:100vh!important;
          min-height:100vh!important;
          margin:0!important;
          padding:22px 20px 28px!important;
          box-sizing:border-box!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          transform:none!important;
          background:#f7f8fc!important;
        }

        body #${VIEW}>#${RAIL}{
          position:absolute!important;
          left:20px!important;
          top:22px!important;
          right:auto!important;
          bottom:auto!important;
          width:240px!important;
          max-width:240px!important;
          min-width:240px!important;
          margin:0!important;
          padding:0!important;
          box-sizing:border-box!important;
          display:flex!important;
          flex-direction:column!important;
          gap:12px!important;
          z-index:20!important;
        }

        body #${VIEW}>#${RAIL}>*{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          box-sizing:border-box!important;
        }

        body #${VIEW}>*:not(#${RAIL}){
          width:calc(100% - 258px)!important;
          max-width:none!important;
          min-width:0!important;
          margin-left:258px!important;
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

      /* Smaller PC windows: stop trying to squeeze the utility rail and give
         the Applications list a single stable column. */
      @media(min-width:768px) and (max-width:959px){
        body #${VIEW}{
          position:fixed!important;
          left:260px!important;
          right:0!important;
          top:0!important;
          bottom:0!important;
          width:auto!important;
          max-width:none!important;
          min-width:0!important;
          height:100vh!important;
          min-height:100vh!important;
          margin:0!important;
          padding:22px 20px 28px!important;
          box-sizing:border-box!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          transform:none!important;
          background:#f7f8fc!important;
        }

        body #${VIEW}>#${RAIL}{
          display:none!important;
        }

        body #${VIEW}>*:not(#${RAIL}){
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin-left:0!important;
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
        }

        body #${VIEW}>.view-header .view-title{
          margin:0 0 4px!important;
          font-size:30px!important;
          line-height:33px!important;
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
  }

  function start(){
    sync();
    [100,500,1200,2500].forEach(function(t){setTimeout(sync,t);});
    window.addEventListener('resize',sync,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
