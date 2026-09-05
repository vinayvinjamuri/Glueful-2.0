/* Glueful Dashboard Desktop Spacing V1
 * Presentation only. Desktop dashboard alignment and scroll behavior.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_DESKTOP_SPACING_V1__) return;
  window.__GLUEFUL_DASHBOARD_DESKTOP_SPACING_V1__=true;
  const STYLE_ID='glueful-dashboard-desktop-spacing-v1-style';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style'); s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        /* Let the browser/page own vertical scrolling instead of nesting a
           second scrollbar inside the dashboard window. */
        html,body{overflow-y:auto!important;}
        body.glueful-apple-dashboard #view-dashboard{
          position:static!important;
          top:auto!important;
          left:auto!important;
          right:auto!important;
          bottom:auto!important;
          width:calc(100% - 294px)!important;
          max-width:1240px!important;
          margin-left:270px!important;
          margin-right:24px!important;
          padding:40px 0 48px!important;
          box-sizing:border-box!important;
          overflow:visible!important;
        }
        /* Keep the primary action beside the profile control with a clear gap. */
        body.glueful-apple-dashboard #view-dashboard .view-header button,
        body.glueful-apple-dashboard #view-dashboard .view-header a{
          margin-right:48px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header{
          margin-top:0!important;
          margin-bottom:12px!important;
          padding-top:0!important;
          padding-bottom:12px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-title{
          margin-top:0!important;
          margin-bottom:4px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{
          margin-top:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stats-v1{
          margin-top:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard .stat-grid,
        body.glueful-apple-dashboard #view-dashboard .stats-grid{
          margin-top:0!important;
        }
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
