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

        /* Page shell: 230px sidebar + 30px horizontal / 22px vertical content padding. */
        body.glueful-apple-dashboard #view-dashboard{
          position:static!important;
          top:auto!important;
          left:auto!important;
          right:auto!important;
          bottom:auto!important;
          width:calc(100% - 230px)!important;
          max-width:none!important;
          margin-left:230px!important;
          margin-right:0!important;
          margin-top:0!important;
          padding:22px 30px!important;
          box-sizing:border-box!important;
          overflow:visible!important;
          height:auto!important;
          max-height:none!important;
        }

        /* Topbar rhythm. */
        body.glueful-apple-dashboard #view-dashboard .view-header{
          position:relative!important;
          margin:0 0 18px!important;
          padding:0!important;
          box-sizing:border-box!important;
          min-height:52px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-title{
          margin-top:0!important;
          margin-bottom:2px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{
          margin-top:0!important;
        }

        /* Add Application: beside the profile control in the top chrome row. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions{
          position:absolute!important;
          top:0!important;
          right:76px!important;
          width:auto!important;
          height:52px!important;
          margin:0!important;
          padding:0!important;
          z-index:1100!important;
          display:flex!important;
          align-items:center!important;
          justify-content:flex-end!important;
          gap:12px!important;
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

        /* Metric strip: one bordered block with hairline cell dividers. */
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1{
          display:grid!important;
          grid-template-columns:repeat(5,minmax(0,1fr))!important;
          gap:1px!important;
          margin:0 0 16px!important;
          padding:1px!important;
          background:#e5e5ea!important;
          border:1px solid #e5e5ea!important;
          border-radius:14px!important;
          overflow:hidden!important;
          box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-card{
          min-width:0!important;
          min-height:0!important;
          padding:12px 16px!important;
          border:0!important;
          border-radius:0!important;
          background:#fff!important;
          box-shadow:none!important;
          box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-label{
          margin:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-value{
          margin:2px 0 2px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-meta{
          margin:0!important;
        }

        /* Needs Attention / Pipeline: 1.6fr / 1fr with a 16px column gap. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1{
          display:grid!important;
          grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)!important;
          gap:16px!important;
          margin:0 0 16px!important;
          align-items:stretch!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention,
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-search-health{
          min-width:0!important;
          background:#fff!important;
          border:1px solid #e5e5ea!important;
          border-radius:16px!important;
          box-shadow:none!important;
          box-sizing:border-box!important;
          overflow:hidden!important;
        }

        /* Attention card: compact header and 10px row padding with hairline separators. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention{
          padding:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention .gf-kicker{
          margin:0 0 2px!important;
          padding:14px 16px 0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention .gf-heading{
          margin:0!important;
          padding:0 16px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention .gf-copy{
          margin:0!important;
          padding:2px 16px 10px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-list{
          display:block!important;
          margin:0!important;
          padding:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-row{
          display:grid!important;
          grid-template-columns:32px minmax(0,1fr) auto!important;
          align-items:center!important;
          gap:12px!important;
          padding:10px 16px!important;
          border:0!important;
          border-top:1px solid #f0f0f2!important;
          border-radius:0!important;
          background:#fff!important;
          box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-company-mark{
          width:32px!important;
          height:32px!important;
          border-radius:8px!important;
        }

        /* Pipeline body: 6px 16px 16px; 74px donut; compact legend. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-search-health{
          padding:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-search-health .gf-kicker{
          margin:0!important;
          padding:14px 16px 0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-pipeline-top{
          margin:0!important;
          padding:6px 16px 0!important;
          gap:14px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-donut{
          width:74px!important;
          height:74px!important;
          flex:0 0 74px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-donut:after{
          inset:11px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-legend{
          gap:7px!important;
          margin:0!important;
          padding:10px 16px 16px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-legend-row{
          gap:8px!important;
        }

        /* Recent Applications follows the two-column grid with a 16px rhythm. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1{
          margin:0 0 22px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-head{
          margin:0 0 10px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-card{
          border-radius:16px!important;
          box-shadow:none!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 th{
          padding:10px 16px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 td{
          padding:10px 16px!important;
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
