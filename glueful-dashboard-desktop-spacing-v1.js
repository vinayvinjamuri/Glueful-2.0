/* Glueful — Dashboard Desktop Spacing V1
 * Authoritative desktop reference layout.
 * Presentation only; does not change dashboard data or navigation behavior.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_DESKTOP_SPACING_V1__)return;
  window.__GLUEFUL_DASHBOARD_DESKTOP_SPACING_V1__=true;

  const STYLE_ID='glueful-dashboard-desktop-spacing-v1-style';

  function install(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        html,body{overflow-y:auto!important;overflow-x:hidden!important;}

        body.glueful-apple-dashboard .sidebar,
        body.glueful-apple-dashboard .side-nav,
        body.glueful-apple-dashboard .app-sidebar,
        body.glueful-apple-dashboard #glueful-drawer{
          width:230px!important;min-width:230px!important;max-width:230px!important;
          box-sizing:border-box!important;
        }

        body.glueful-apple-dashboard #view-dashboard{
          position:static!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;
          width:calc(100% - 294px)!important;max-width:1240px!important;
          margin-left:270px!important;margin-right:24px!important;margin-top:0!important;
          padding:32px 0 48px!important;box-sizing:border-box!important;
          overflow:visible!important;height:auto!important;min-height:0!important;max-height:none!important;
        }

        body.glueful-apple-dashboard #view-dashboard .view-header{
          position:relative!important;display:flex!important;align-items:flex-start!important;
          justify-content:space-between!important;gap:24px!important;width:100%!important;
          min-height:0!important;margin:0 0 24px!important;padding:0!important;box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-title{margin:0 0 4px!important;}
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{margin:0!important;}

        /* Add Application belongs to the dashboard header, so it scrolls away with the header. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions{
          position:absolute!important;top:0!important;right:0!important;
          width:160px!important;height:44px!important;margin:0!important;padding:0!important;
          z-index:10!important;display:flex!important;align-items:center!important;
          justify-content:flex-end!important;gap:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions .glueful-approved-application{
          width:160px!important;min-width:160px!important;max-width:160px!important;
          height:44px!important;min-height:44px!important;margin:0!important;padding:0 18px!important;
          border-radius:14px!important;box-sizing:border-box!important;white-space:nowrap!important;
        }

        body.glueful-apple-dashboard #view-dashboard .stat-grid,
        body.glueful-apple-dashboard #view-dashboard .stats-grid{
          display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:0!important;
          width:100%!important;margin:0 0 24px!important;padding:0!important;background:#fff!important;
          border:1px solid #e5e5ea!important;border-radius:18px!important;overflow:hidden!important;box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1{
          min-width:0!important;min-height:150px!important;height:auto!important;padding:24px 24px!important;
          border:0!important;border-radius:0!important;box-shadow:none!important;background:#fff!important;
          display:flex!important;flex-direction:column!important;justify-content:flex-start!important;box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1:not(:last-child){border-right:1px solid #e5e5ea!important;}
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1 .stat-label{margin:0!important;font-size:12px!important;line-height:1.3!important;font-weight:600!important;}
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1 .stat-value{margin:8px 0!important;font-size:30px!important;line-height:1.05!important;}
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1 .stat-meta{margin:0!important;font-size:11px!important;line-height:1.3!important;}

        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1{
          display:grid!important;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)!important;gap:24px!important;
          width:100%!important;margin:0!important;align-items:stretch!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 > *{min-width:0!important;height:auto!important;min-height:0!important;box-sizing:border-box!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention,
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-search-health{
          min-height:0!important;padding:24px!important;border-radius:18px!important;box-shadow:0 10px 30px rgba(0,0,0,.045)!important;overflow:visible!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-kicker{margin:0 0 8px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-heading{margin:0 0 8px!important;font-size:18px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-copy{margin:0!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-list{margin:16px -24px -24px!important;display:grid!important;gap:0!important;border-top:1px solid #f0f0f2!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-row{display:grid!important;grid-template-columns:40px minmax(0,1fr) auto!important;gap:16px!important;padding:18px 24px!important;border:0!important;border-bottom:1px solid #f0f0f2!important;border-radius:0!important;background:#fff!important;box-sizing:border-box!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-company-mark{width:40px!important;height:40px!important;border-radius:10px!important;font-size:12px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-company{font-size:12px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-role{font-size:11px!important;margin-top:3px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-action{font-size:10px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-pipeline-top{margin:20px 0 24px!important;gap:24px!important;align-items:center!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-donut{width:140px!important;height:140px!important;flex:0 0 140px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-donut:after{inset:14px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-legend{margin-top:0!important;gap:0!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-legend-row{min-height:32px!important;display:grid!important;grid-template-columns:8px 1fr auto!important;gap:10px!important;align-items:center!important;font-size:11px!important;}

        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1{margin:32px 0 32px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-head{margin:0 0 10px!important;}
      }
    `;
    document.head.appendChild(s);
  }

  function relaxDashboardAncestors(){
    const dashboard=document.getElementById('view-dashboard');if(!dashboard)return;
    let node=dashboard.parentElement;
    while(node && node!==document.body && node!==document.documentElement){
      node.style.setProperty('overflow-y','visible','important');
      node.style.setProperty('overflow-x','visible','important');
      node.style.setProperty('height','auto','important');
      node.style.setProperty('max-height','none','important');
      node=node.parentElement;
    }
  }

  function sync(){
    install();
    const dashboard=document.getElementById('view-dashboard');
    const active=!!dashboard && (dashboard.classList.contains('active') || dashboard.style.display==='block');
    if(active)relaxDashboardAncestors();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
