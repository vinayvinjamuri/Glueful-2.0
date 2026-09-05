/* Glueful — Dashboard Reference Authoritative V2
 * Final presentation layer for the supplied Dashboard reference.
 * Keeps existing dashboard data, navigation, Supabase queries and handlers.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_AUTHORITATIVE_V2__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_AUTHORITATIVE_V2__=true;

  const STYLE_ID='glueful-dashboard-reference-authoritative-v2-style';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      body.glueful-apple-dashboard{
        background:#f7f8fb!important;
        color:#111827!important;
        font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif!important;
        -webkit-font-smoothing:antialiased!important;
      }

      @media(min-width:1101px){
        body.glueful-apple-dashboard #view-dashboard{
          width:calc(100vw - 260px)!important;
          margin-left:260px!important;
          padding:22px 30px 48px!important;
          box-sizing:border-box!important;
          background:#f7f8fb!important;
          overflow:visible!important;
        }

        body.glueful-apple-dashboard #view-dashboard .view-header{
          min-height:58px!important;
          display:flex!important;
          align-items:center!important;
          justify-content:space-between!important;
          gap:18px!important;
          margin:0 0 18px!important;
          padding:0!important;
          border:0!important;
          background:transparent!important;
        }

        /* Reference header: greeting on the left, compact controls on the right. */
        body.glueful-apple-dashboard #view-dashboard .view-title{
          font-size:0!important;
          line-height:1!important;
          margin:0!important;
          color:#111827!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-title::before{
          content:"Good morning, Vinay! 👋";
          display:block!important;
          font-size:20px!important;
          line-height:1.2!important;
          font-weight:750!important;
          letter-spacing:-.45px!important;
          color:#111827!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{
          margin:5px 0 0!important;
          font-size:11px!important;
          line-height:1.35!important;
          color:#7a8190!important;
        }

        body.glueful-apple-dashboard #view-dashboard .view-header button,
        body.glueful-apple-dashboard #view-dashboard .view-header a{
          border-radius:10px!important;
          min-height:36px!important;
          box-sizing:border-box!important;
        }

        /* Reference stats row: five compact cards. */
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1{
          display:grid!important;
          grid-template-columns:repeat(5,minmax(0,1fr))!important;
          gap:10px!important;
          margin:0 0 16px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-card{
          min-height:82px!important;
          padding:13px 14px!important;
          border-radius:13px!important;
          border:1px solid #e6e9f0!important;
          background:#fff!important;
          box-shadow:0 4px 14px rgba(22,27,45,.035)!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-label{
          font-size:10px!important;
          color:#687183!important;
          font-weight:650!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-value{
          margin:7px 0 3px!important;
          font-size:24px!important;
          line-height:1!important;
          color:#111827!important;
          font-weight:760!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-meta{
          font-size:8px!important;
          color:#8b92a0!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-card:last-child .gf-ref-value{
          color:#e5484d!important;
        }

        /* Two-column Needs Attention + Application Pipeline composition. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1{
          display:grid!important;
          grid-template-columns:minmax(0,1.58fr) minmax(270px,.82fr)!important;
          gap:12px!important;
          margin:0 0 18px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention,
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-search-health{
          min-width:0!important;
          min-height:174px!important;
          box-sizing:border-box!important;
          padding:15px!important;
          border:1px solid #e6e9f0!important;
          border-radius:14px!important;
          background:#fff!important;
          box-shadow:0 4px 14px rgba(22,27,45,.035)!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-kicker{
          margin:0 0 5px!important;
          font-size:9px!important;
          line-height:1.2!important;
          letter-spacing:.02em!important;
          color:#81899a!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-heading{
          margin:0 0 3px!important;
          font-size:14px!important;
          line-height:1.2!important;
          color:#111827!important;
          letter-spacing:-.2px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-copy{
          font-size:9px!important;
          color:#7a8190!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-list{
          margin-top:9px!important;
          gap:4px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-row{
          grid-template-columns:27px minmax(0,1fr) auto!important;
          min-height:34px!important;
          padding:5px 7px!important;
          gap:7px!important;
          border-radius:9px!important;
          border:1px solid #eef0f4!important;
          background:#fff!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-logo{
          width:25px!important;
          height:25px!important;
          border-radius:7px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-company{
          font-size:9px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-meta{
          margin-top:1px!important;
          font-size:8px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-action button{
          font-size:8px!important;
          padding:2px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention-date{
          font-size:7px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-pipeline-top{
          margin:3px 0 7px!important;
          gap:10px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-donut{
          width:76px!important;
          height:76px!important;
          flex-basis:76px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-donut:after{
          inset:11px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-donut-center{
          font-size:18px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-pipeline-total{
          font-size:23px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-pipeline-sub{
          font-size:8px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-legend{
          gap:3px!important;
          margin-top:3px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-legend-row{
          min-height:19px!important;
          font-size:8px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-dot{
          width:6px!important;
          height:6px!important;
        }

        /* Recent Applications table. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1{
          margin:0 0 20px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-head{
          margin:0 0 8px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-title{
          font-size:14px!important;
          color:#111827!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-viewall{
          font-size:9px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-card{
          border-radius:12px!important;
          border:1px solid #e6e9f0!important;
          box-shadow:0 4px 14px rgba(22,27,45,.035)!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 th{
          padding:8px 10px!important;
          font-size:8px!important;
          background:#fafbfc!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 td{
          padding:9px 10px!important;
          font-size:9px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-status{
          padding:3px 6px!important;
          font-size:8px!important;
        }

        /* Remove legacy dashboard-only surfaces already replaced by the reference composition. */
        body.glueful-apple-dashboard #view-dashboard .heat-card,
        body.glueful-apple-dashboard #view-dashboard #dashboard-interviews{
          display:none!important;
        }
      }

      @media(min-width:701px) and (max-width:1100px){
        body.glueful-apple-dashboard #view-dashboard{
          width:calc(100vw - 260px)!important;
          margin-left:260px!important;
          padding:20px 22px 42px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1{
          grid-template-columns:repeat(3,minmax(0,1fr))!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1{
          grid-template-columns:1fr 1fr!important;
        }
      }

      @media(max-width:700px){
        body.glueful-apple-dashboard #view-dashboard{
          width:100%!important;
          margin:0!important;
          padding:16px 14px 88px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header{
          min-height:48px!important;
          margin:0 0 12px!important;
          padding:0!important;
          display:block!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-title{
          font-size:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-title::before{
          content:"Good morning, Vinay! 👋";
          display:block!important;
          font-size:19px!important;
          line-height:1.2!important;
          font-weight:750!important;
          color:#111827!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{
          margin-top:4px!important;
          font-size:10px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:8px!important;
          margin-bottom:11px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-card{
          min-height:78px!important;
          padding:11px!important;
          border-radius:12px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-reference-stats-v1 .gf-ref-value{
          font-size:22px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1{
          grid-template-columns:1fr!important;
          gap:8px!important;
          margin-bottom:12px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-attention,
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1 .gf-search-health{
          min-height:0!important;
          padding:13px!important;
          border-radius:13px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1{
          margin-top:0!important;
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
