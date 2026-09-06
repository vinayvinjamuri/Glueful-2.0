/* Glueful — Dashboard Readability V1
 * Desktop readability and header-action spacing only.
 * Does not alter dashboard data or handlers.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_READABILITY_V1__) return;
  window.__GLUEFUL_DASHBOARD_READABILITY_V1__=true;
  const STYLE='glueful-dashboard-readability-v1-style';
  function install(){
    if(document.getElementById(STYLE)) return;
    const s=document.createElement('style'); s.id=STYLE;
    s.textContent=`
      @media(min-width:1101px){
        body.glueful-apple-dashboard #view-dashboard{font-size:15px!important;}
        body.glueful-apple-dashboard #view-dashboard .view-title{font-size:28px!important;line-height:1.15!important;}
        body.glueful-apple-dashboard #view-dashboard .view-title::before{font-size:28px!important;line-height:1.15!important;}
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{font-size:15px!important;line-height:1.4!important;}
        body.glueful-apple-dashboard #view-dashboard .view-header button,
        body.glueful-apple-dashboard #view-dashboard .view-header a{font-size:14px!important;}

        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-label{font-size:14px!important;line-height:1.3!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-value{font-size:32px!important;line-height:1.05!important;margin:6px 0 5px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-meta{font-size:13px!important;line-height:1.3!important;}

        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-kicker{font-size:13px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-heading{font-size:20px!important;line-height:1.25!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-copy{font-size:13px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-company{font-size:14px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-meta{font-size:13px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-action button{font-size:13px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-date{font-size:12px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-pipeline-total{font-size:32px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-pipeline-sub{font-size:13px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-legend-row{font-size:13px!important;}

        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-title{font-size:20px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-viewall{font-size:13px!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 th{font-size:12px!important;line-height:1.3!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 td{font-size:13px!important;line-height:1.35!important;}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-status{font-size:12px!important;}

        /* Keep Sync Gmail and + Application clearly separated. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions{
          width:auto!important;min-width:0!important;height:48px!important;
          display:flex!important;align-items:center!important;justify-content:flex-end!important;
          gap:14px!important;right:0!important;top:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions #glueful-dashboard-gmail-sync{
          position:relative!important;right:auto!important;bottom:auto!important;
          display:flex!important;align-items:center!important;justify-content:center!important;
          width:145px!important;min-width:145px!important;height:44px!important;min-height:44px!important;
          margin:0!important;padding:0 16px!important;border-radius:12px!important;
          font-size:14px!important;white-space:nowrap!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions .glueful-approved-application{
          position:relative!important;width:170px!important;min-width:170px!important;max-width:170px!important;
          height:44px!important;min-height:44px!important;margin:0!important;padding:0 18px!important;
          border-radius:12px!important;font-size:14px!important;white-space:nowrap!important;
        }
      }
    `;
    document.head.appendChild(s);
  }
  function sync(){install();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
