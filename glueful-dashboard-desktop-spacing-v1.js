/* Glueful Dashboard Desktop Spacing V1
 * Presentation only. Reference dashboard spacing and alignment.
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

        /* Page shell */
        body.glueful-apple-dashboard .sidebar,
        body.glueful-apple-dashboard .side-nav,
        body.glueful-apple-dashboard .app-sidebar,
        body.glueful-apple-dashboard #glueful-drawer{
          width:326px!important;min-width:326px!important;max-width:326px!important;
          padding-left:24px!important;padding-right:24px!important;
          box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard{
          position:static!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;
          width:calc(100% - 406px)!important;max-width:none!important;
          margin-left:366px!important;margin-right:40px!important;margin-top:0!important;
          padding:40px 0 48px!important;box-sizing:border-box!important;
          overflow:visible!important;height:auto!important;max-height:none!important;
        }

        /* Sidebar nav rhythm */
        body.glueful-apple-dashboard .sidebar .section-label,
        body.glueful-apple-dashboard .side-nav .section-label,
        body.glueful-apple-dashboard #glueful-drawer .section-label{
          margin-top:24px!important;margin-bottom:8px!important;
        }
        body.glueful-apple-dashboard .sidebar .nav-item,
        body.glueful-apple-dashboard .side-nav .nav-item,
        body.glueful-apple-dashboard #glueful-drawer .nav-item{
          padding:12px 12px!important;gap:12px!important;
        }
        body.glueful-apple-dashboard .sidebar .nav-item + .nav-item,
        body.glueful-apple-dashboard .side-nav .nav-item + .nav-item,
        body.glueful-apple-dashboard #glueful-drawer .nav-item + .nav-item{margin-top:4px!important;}
        body.glueful-apple-dashboard .sidebar hr,
        body.glueful-apple-dashboard .side-nav hr,
        body.glueful-apple-dashboard #glueful-drawer hr{
          margin:20px 0!important;
        }

        /* Header row */
        body.glueful-apple-dashboard #view-dashboard .view-header{
          position:relative!important;box-sizing:border-box!important;
          margin:0 0 32px!important;padding:0!important;
          min-height:0!important;display:flex!important;align-items:flex-start!important;
          justify-content:space-between!important;gap:24px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-title{margin:0 0 4px!important;}
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{margin:0!important;}

        /* Application action: compact and aligned with the profile control. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions{
          position:fixed!important;top:23px!important;right:104px!important;
          width:136px!important;height:44px!important;margin:0!important;padding:0!important;
          z-index:1100!important;display:flex!important;align-items:center!important;
          justify-content:flex-end!important;gap:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions .glueful-approved-application{
          width:136px!important;min-width:136px!important;max-width:136px!important;
          height:44px!important;min-height:44px!important;margin:0!important;padding:0!important;
          border-radius:14px!important;box-sizing:border-box!important;font-size:14px!important;
        }

        /* Metrics: one unified bordered strip. */
        body.glueful-apple-dashboard #view-dashboard .stat-grid,
        body.glueful-apple-dashboard #view-dashboard .stats-grid{
          display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;
          gap:1px!important;margin:0 0 24px!important;padding:32px 0!important;
          background:#e5e5ea!important;border:1px solid #e5e5ea!important;
          border-radius:18px!important;overflow:hidden!important;box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1{
          min-height:0!important;height:auto!important;padding:0 32px!important;
          border:0!important;border-radius:0!important;box-shadow:none!important;
          background:#fff!important;display:flex!important;flex-direction:column!important;
          justify-content:flex-start!important;box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1:not(:last-child){border-right:1px solid #e5e5ea!important;}
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1 .stat-label{font-size:12px!important;font-weight:600!important;margin:0!important;}
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1 .stat-value{font-size:30px!important;line-height:1.05!important;margin:8px 0!important;}
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1 .stat-meta{font-size:10px!important;line-height:1.3!important;margin:0!important;}

        /* Two-column section */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1{
          display:grid!important;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)!important;
          gap:24px!important;margin:0!important;align-items:stretch!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 > *{
          min-width:0!important;height:100%!important;box-sizing:border-box!important;
        }

        /* Needs Attention */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention{
          padding:24px!important;border-radius:18px!important;box-shadow:0 10px 30px rgba(0,0,0,.045)!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-kicker{margin:0 0 8px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-heading{margin:0 0 8px!important;font-size:18px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-copy{margin:0!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-list{
          margin:16px -24px -24px!important;display:grid!important;gap:0!important;
          border-top:1px solid #f0f0f2!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-row{
          grid-template-columns:40px minmax(0,1fr) auto!important;gap:16px!important;
          padding:20px 24px!important;border:0!important;border-bottom:1px solid #f0f0f2!important;
          border-radius:0!important;background:#fff!important;box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-company-mark{
          width:40px!important;height:40px!important;border-radius:10px!important;font-size:12px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-company{font-size:12px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-role{font-size:11px!important;margin-top:3px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-action{font-size:10px!important;}

        /* Pipeline */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-search-health{
          padding:24px!important;border-radius:18px!important;box-shadow:0 10px 30px rgba(0,0,0,.045)!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-pipeline-top{
          margin:20px 0 24px!important;gap:24px!important;align-items:center!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-donut{
          width:140px!important;height:140px!important;flex:0 0 140px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-donut:after{inset:14px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-legend{
          margin-top:0!important;gap:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-legend-row{
          min-height:32px!important;display:grid!important;grid-template-columns:8px 1fr auto!important;
          gap:10px!important;align-items:center!important;font-size:11px!important;
        }

        /* Recent Applications */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1{margin:32px 0 32px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-head{margin:0 0 10px!important;}
      }
    `;
    document.head.appendChild(s);
  }
  function relaxDashboardAncestors(){
    const dashboard=document.getElementById('view-dashboard');if(!dashboard)return;
    let node=dashboard.parentElement,depth=0;
    while(node&&node!==document.body&&depth<4){node.style.setProperty('overflow-y','visible','important');node.style.setProperty('overflow-x','visible','important');depth++;node=node.parentElement;}
  }
  function sync(){
    install();
    const dashboard=document.getElementById('view-dashboard');
    const active=!!dashboard&&(dashboard.classList.contains('active')||dashboard.style.display==='block');
    if(active)relaxDashboardAncestors();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
