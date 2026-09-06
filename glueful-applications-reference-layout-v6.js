/* Glueful — Applications Reference Layout V6
 * Matches the supplied reference: 260px sidebar, left utility rail,
 * and Applications content column to the right.
 * Layout only; existing data, controls and handlers are untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_REFERENCE_LAYOUT_V6__)return;
  window.__GLUEFUL_APPLICATIONS_REFERENCE_LAYOUT_V6__=true;
  const STYLE_ID='glueful-applications-reference-layout-v6-style';

  function install(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1280px){
        body.glueful-applications-apple #view-applications{
          position:fixed!important;
          left:260px!important;right:0!important;top:0!important;bottom:0!important;
          width:auto!important;height:100vh!important;min-height:100vh!important;
          margin:0!important;padding:26px 32px 52px!important;
          box-sizing:border-box!important;display:block!important;
          overflow-x:hidden!important;overflow-y:auto!important;transform:none!important;
        }

        /* Left utility rail: Application Insights -> Upcoming -> Quick Actions. */
        body.glueful-applications-apple #glueful-applications-workspace-v1{
          position:absolute!important;
          left:16px!important;right:auto!important;top:22px!important;
          width:370px!important;max-width:370px!important;min-width:370px!important;
          margin:0!important;padding:0!important;
          display:flex!important;flex-direction:column!important;gap:16px!important;
          box-sizing:border-box!important;z-index:5!important;
          visibility:visible!important;opacity:1!important;
        }
        body.glueful-applications-apple #glueful-applications-workspace-v1>*{
          width:100%!important;max-width:370px!important;box-sizing:border-box!important;
        }

        /* Main Applications column begins at the same x-coordinate as the reference. */
        body.glueful-applications-apple #view-applications>.view-header,
        body.glueful-applications-apple #view-applications>.glueful-applications-main-wide,
        body.glueful-applications-apple #view-applications>.glueful-applications-main-centered{
          width:min(952px,calc(100% - 388px))!important;
          max-width:952px!important;min-width:0!important;
          margin-left:388px!important;margin-right:0!important;
          box-sizing:border-box!important;
        }

        body.glueful-applications-apple #view-applications>.view-header{
          min-height:72px!important;margin-top:0!important;margin-bottom:0!important;
          padding:0!important;display:flex!important;align-items:flex-start!important;
          justify-content:space-between!important;gap:22px!important;
        }
        body.glueful-applications-apple #view-applications>.view-header>button,
        body.glueful-applications-apple #view-applications>.view-header>a{
          position:static!important;inset:auto!important;transform:none!important;
          margin:0!important;flex:0 0 auto!important;
        }

        body.glueful-applications-apple #view-applications>.glueful-applications-main-wide{
          margin-top:14px!important;
        }
        body.glueful-applications-apple #view-applications>.glueful-applications-main-centered{
          margin-top:16px!important;
        }
        body.glueful-applications-apple #view-applications>.glueful-applications-main-wide + .glueful-applications-main-centered{
          margin-top:14px!important;
        }

        body.glueful-applications-apple #view-applications input[type="search"],
        body.glueful-applications-apple #view-applications input[placeholder*="Search"],
        body.glueful-applications-apple #view-applications input[placeholder*="search"]{
          width:100%!important;max-width:none!important;min-width:0!important;
          box-sizing:border-box!important;
        }

        body.glueful-applications-apple #view-applications .application-card,
        body.glueful-applications-apple #view-applications .job-application-card,
        body.glueful-applications-apple #view-applications [class*="application-card"]{
          width:100%!important;max-width:none!important;min-width:0!important;
          min-height:94px!important;box-sizing:border-box!important;
        }
      }

      @media(min-width:768px) and (max-width:1279px){
        body.glueful-applications-apple #glueful-applications-workspace-v1{display:none!important;}
        body.glueful-applications-apple #view-applications{width:calc(100vw - 260px)!important;margin:0!important;}
        body.glueful-applications-apple #view-applications>.view-header,
        body.glueful-applications-apple #view-applications>.glueful-applications-main-wide,
        body.glueful-applications-apple #view-applications>.glueful-applications-main-centered{
          width:min(100%,760px)!important;max-width:760px!important;
          margin-left:auto!important;margin-right:auto!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function sync(){
    const view=document.getElementById('view-applications');
    if(!view)return;
    const active=view.classList.contains('active')||view.style.display==='block';
    if(!active)return;
    document.body.classList.add('glueful-applications-apple');
    install();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
  [100,500,1200,2200].forEach(t=>setTimeout(sync,t));
  window.addEventListener('resize',sync,{passive:true});
})();
