/* Glueful — Dashboard Desktop Typography V1
 * Readability pass only. Desktop typography is enlarged without changing
 * dashboard structure, data, navigation, handlers, or responsive layouts.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_DESKTOP_TYPOGRAPHY_V1__) return;
  window.__GLUEFUL_DASHBOARD_DESKTOP_TYPOGRAPHY_V1__=true;

  const STYLE_ID='glueful-dashboard-desktop-typography-v1-style';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        body.glueful-apple-dashboard #view-dashboard{
          font-size:14px!important;
        }

        /* Header */
        body.glueful-apple-dashboard #view-dashboard .view-title::before{
          font-size:23px!important;
          line-height:1.22!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{
          font-size:13px!important;
          line-height:1.4!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header button,
        body.glueful-apple-dashboard #view-dashboard .view-header a{
          font-size:13px!important;
        }

        /* Stat cards */
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-label{
          font-size:12px!important;
          line-height:1.3!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-value{
          font-size:29px!important;
          line-height:1.05!important;
          margin:6px 0 4px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-meta{
          font-size:11px!important;
          line-height:1.3!important;
        }

        /* Needs Attention + Pipeline */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-kicker{
          font-size:11px!important;
          line-height:1.25!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-heading{
          font-size:17px!important;
          line-height:1.25!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-copy{
          font-size:11px!important;
          line-height:1.4!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-company{
          font-size:11px!important;
          line-height:1.3!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-meta{
          font-size:10px!important;
          line-height:1.3!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-action button{
          font-size:10px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-date{
          font-size:9px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-pipeline-total{
          font-size:27px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-pipeline-sub{
          font-size:10px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-legend-row{
          font-size:10px!important;
        }

        /* Recent Applications */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-title{
          font-size:17px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-viewall{
          font-size:11px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 th{
          font-size:10px!important;
          line-height:1.3!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 td{
          font-size:11px!important;
          line-height:1.35!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-status{
          font-size:10px!important;
        }

        /* Sidebar readability on desktop. */
        body.glueful-apple-dashboard #glueful-drawer,
        body.glueful-apple-dashboard .sidebar,
        body.glueful-apple-dashboard .side-nav,
        body.glueful-apple-dashboard .app-sidebar{
          font-size:14px!important;
        }
        body.glueful-apple-dashboard #glueful-drawer a,
        body.glueful-apple-dashboard .sidebar a,
        body.glueful-apple-dashboard .side-nav a,
        body.glueful-apple-dashboard .app-sidebar a{
          font-size:13px!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function sync(){
    install();
    const d=document.getElementById('view-dashboard');
    const active=!!d&&(d.classList.contains('active')||d.style.display==='block');
    document.body.classList.toggle('glueful-apple-dashboard',active);
  }

  function start(){
    install();
    sync();
    window.addEventListener('resize',sync,{passive:true});
    document.addEventListener('click',function(){setTimeout(sync,50);},true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
