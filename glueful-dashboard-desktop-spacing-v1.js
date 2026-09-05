/* Glueful Dashboard Desktop Spacing V1
 * Presentation only. Tightens the desktop dashboard composition without
 * changing data, navigation, or feature behavior.
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
        body.glueful-apple-dashboard #view-dashboard{
          padding-top:56px!important;
          margin-top:0!important;
          margin-left:254px!important;
          margin-right:24px!important;
          width:min(1240px,calc(100vw - 278px))!important;
          box-sizing:border-box!important;
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
