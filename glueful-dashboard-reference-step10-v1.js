/* Glueful Dashboard Reference Step 10 — responsive dashboard composition
 * Presentation only. Keeps existing dashboard data, navigation and handlers intact.
 * Desktop/tablet/mobile use the same reference design language with adaptive layout.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP10_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP10_V1__=true;
  const STYLE_ID='glueful-dashboard-reference-step10-v1-style';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style'); s.id=STYLE_ID;
    s.textContent=`
      /* Shared dashboard rhythm. */
      body.glueful-apple-dashboard #view-dashboard{
        box-sizing:border-box!important;
      }
      body.glueful-apple-dashboard #view-dashboard .view-header{
        margin-bottom:18px!important;
      }
      body.glueful-apple-dashboard #view-dashboard .view-title{
        letter-spacing:-.035em!important;
      }

      /* Tablet: preserve the drawer, but let the content breathe. */
      @media(min-width:701px) and (max-width:1100px){
        body.glueful-apple-dashboard #view-dashboard{
          width:calc(100vw - 252px)!important;
          max-width:none!important;
          margin-left:236px!important;
          margin-right:16px!important;
          padding-left:0!important;
          padding-right:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard .${'glueful-reference-stats-v1'}{
          grid-template-columns:repeat(3,minmax(0,1fr))!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1{
          grid-template-columns:minmax(0,1.7fr) minmax(240px,1fr)!important;
        }
      }

      /* Mobile: reference-style compact dashboard. */
      @media(max-width:700px){
        body.glueful-apple-dashboard #view-dashboard{
          width:100%!important;
          max-width:none!important;
          margin:0!important;
          padding:16px 14px 88px!important;
          box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header{
          margin:0 0 14px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-title,
        body.glueful-apple-dashboard #view-dashboard h1{
          font-size:27px!important;
          line-height:1.08!important;
          letter-spacing:-.04em!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{
          font-size:12px!important;
          margin-top:5px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .stat-grid,
        body.glueful-apple-dashboard #view-dashboard .stats-grid{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:9px!important;
          margin-bottom:12px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .stat-card{
          min-height:92px!important;
          padding:12px!important;
          border-radius:15px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .stat-card .stat-value{
          font-size:25px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1{
          display:grid!important;
          grid-template-columns:1fr!important;
          gap:10px!important;
          margin-bottom:14px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 > *{
          min-width:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #${'glueful-dashboard-recent-applications-v1'}{
          margin-top:12px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #${'glueful-dashboard-recent-applications-v1'} .gf-ra-card{
          border-radius:15px!important;
        }
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
