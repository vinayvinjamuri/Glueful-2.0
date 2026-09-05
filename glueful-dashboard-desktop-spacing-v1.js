/* Glueful Dashboard Desktop Spacing V1
 * Presentation only. Desktop dashboard alignment and scroll behavior.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_DESKTOP_SPACING_V1__)return;
  window.__GLUEFUL_DASHBOARD_DESKTOP_SPACING_V1__=true;
  const STYLE_ID='glueful-dashboard-desktop-spacing-v1-style';
  function install(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        html,body{overflow-y:auto!important;overflow-x:hidden!important;}
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
          margin-top:-45px!important;
          padding:0 0 48px!important;
          box-sizing:border-box!important;
          overflow:visible!important;
          height:auto!important;
          max-height:none!important;
        }
        /* Add Application sits beside Profile at the top, but scrolls with the dashboard content. */
        body.glueful-apple-dashboard #view-dashboard .view-header{
          position:relative!important;
          padding-right:150px!important;
          box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions{
          position:absolute!important;
          top:32px!important;
          right:0!important;
          width:auto!important;
          height:auto!important;
          margin:0!important;
          padding:0!important;
          z-index:1100!important;
          display:flex!important;
          align-items:center!important;
          justify-content:flex-end!important;
          gap:8px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions .glueful-approved-application{
          position:relative!important;
          flex:0 0 auto!important;
          width:160px!important;
          min-width:160px!important;
          max-width:160px!important;
          height:52px!important;
          min-height:52px!important;
          margin:0!important;
          box-sizing:border-box!important;
          white-space:nowrap!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header button,
        body.glueful-apple-dashboard #view-dashboard .view-header a{
          margin-right:0!important;
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
  function relaxDashboardAncestors(){
    const dashboard=document.getElementById('view-dashboard');
    if(!dashboard)return;
    let node=dashboard.parentElement;
    let depth=0;
    while(node&&node!==document.body&&depth<4){
      node.style.setProperty('overflow-y','visible','important');
      node.style.setProperty('overflow-x','visible','important');
      depth++;
      node=node.parentElement;
    }
  }
  function sync(){
    install();
    const dashboard=document.getElementById('view-dashboard');
    const active=!!dashboard&&(dashboard.classList.contains('active')||dashboard.style.display==='block');
    if(active)relaxDashboardAncestors();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
})();
