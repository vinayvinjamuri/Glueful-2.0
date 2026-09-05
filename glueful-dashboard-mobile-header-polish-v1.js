/* Glueful Dashboard Mobile Header Polish V1
 * Presentation only. Keeps dashboard behavior and navigation unchanged.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_MOBILE_HEADER_POLISH_V1__) return;
  window.__GLUEFUL_DASHBOARD_MOBILE_HEADER_POLISH_V1__=true;
  const STYLE_ID='glueful-dashboard-mobile-header-polish-v1-style';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(max-width:800px){
        body.glueful-apple-dashboard #view-dashboard .view-header{
          display:flex!important;
          align-items:center!important;
          gap:10px!important;
          min-height:72px!important;
          padding:8px 0 14px!important;
          box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header .view-title{
          flex:1 1 auto!important;
          min-width:0!important;
          max-width:none!important;
          margin-left:82px!important;
          margin-right:0!important;
          font-size:25px!important;
          line-height:1.08!important;
          letter-spacing:-.035em!important;
          white-space:nowrap!important;
          overflow:hidden!important;
          text-overflow:ellipsis!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header .view-subtitle{
          position:absolute!important;
          left:82px!important;
          right:145px!important;
          margin:30px 0 0!important;
          max-width:none!important;
          font-size:12px!important;
          line-height:1.2!important;
          white-space:nowrap!important;
          overflow:hidden!important;
          text-overflow:ellipsis!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header button,
        body.glueful-apple-dashboard #view-dashboard .view-header .primary-btn,
        body.glueful-apple-dashboard #view-dashboard .view-header .add-application,
        body.glueful-apple-dashboard #view-dashboard .view-header [class*="add-application"]{
          flex:0 0 auto!important;
          width:auto!important;
          min-width:140px!important;
          height:48px!important;
          padding:0 16px!important;
          border-radius:15px!important;
          font-size:15px!important;
          white-space:nowrap!important;
        }
      }
      @media(max-width:420px){
        body.glueful-apple-dashboard #view-dashboard .view-header .view-title{
          margin-left:78px!important;
          font-size:23px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header .view-subtitle{
          left:78px!important;
          right:132px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header button,
        body.glueful-apple-dashboard #view-dashboard .view-header .primary-btn,
        body.glueful-apple-dashboard #view-dashboard .view-header .add-application,
        body.glueful-apple-dashboard #view-dashboard .view-header [class*="add-application"]{
          min-width:126px!important;
          height:46px!important;
          padding:0 12px!important;
          font-size:14px!important;
          border-radius:14px!important;
        }
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
