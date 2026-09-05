/* Glueful — Applications Exact Reference V1
 * Final desktop composition matching the approved Applications reference.
 * Presentation only; existing application data and handlers remain untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_EXACT_REFERENCE_V1__) return;
  window.__GLUEFUL_APPLICATIONS_EXACT_REFERENCE_V1__=true;

  function install(){
    const id='glueful-applications-exact-reference-v1-style';
    if(document.getElementById(id)) return;
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`
      @media(min-width:1101px){
        body #view-applications{
          position:relative!important;
          left:28px!important;
          width:min(620px,calc(100vw - 28px - 276px))!important;
          max-width:620px!important;
          min-width:0!important;
          margin:0!important;
          padding:12px 0 48px!important;
          box-sizing:border-box!important;
          transform:none!important;
          overflow:visible!important;
          height:auto!important;
          max-height:none!important;
        }
        body #view-applications .view-header{
          position:relative!important;
          display:flex!important;
          align-items:flex-start!important;
          justify-content:space-between!important;
          width:100%!important;
          min-height:54px!important;
          margin:0 0 20px!important;
          padding:0!important;
        }
        body #view-applications .view-title{font-size:32px!important;line-height:1.08!important;letter-spacing:-1.1px!important;margin:0 0 5px!important;}
        body #view-applications .view-subtitle{font-size:15px!important;margin:0!important;}
        body #view-applications input,body #view-applications select,body #view-applications textarea{min-height:34px!important;border:1px solid #e5e5ea!important;border-radius:10px!important;background:#fff!important;color:#1d1d1f!important;box-sizing:border-box!important;}
        body #view-applications .application-card,body #view-applications .job-application-card,body #view-applications .card{background:#fff!important;color:#1d1d1f!important;border:1px solid #e5e5ea!important;border-radius:14px!important;box-shadow:0 8px 24px rgba(0,0,0,.035)!important;}
        body #view-applications > *:not(#glueful-applications-workspace-v1){box-sizing:border-box!important;}
        body #view-applications .view-header > button,body #view-applications .view-header > a{position:fixed!important;top:16px!important;right:250px!important;z-index:1001!important;margin:0!important;}
        body #glueful-applications-workspace-v1{
          position:fixed!important;
          top:62px!important;
          right:12px!important;
          width:256px!important;
          max-width:256px!important;
          display:flex!important;
          flex-direction:column!important;
          gap:12px!important;
          z-index:900!important;
          box-sizing:border-box!important;
        }
        body #glueful-applications-workspace-v1 > *{width:100%!important;max-width:none!important;box-sizing:border-box!important;}
        body #glueful-applications-workspace-v1 > :first-child{order:1!important;}
        body #glueful-applications-workspace-v1 > :nth-child(2){order:2!important;}
        body #glueful-applications-workspace-v1 > :nth-child(3){order:3!important;}
        body #glueful-applications-workspace-v1 > :nth-child(4){order:4!important;}
        body #glueful-dashboard-hamburger,body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{display:none!important;visibility:hidden!important;pointer-events:none!important;}
        body #glueful-applications-left-v1,body #view-applications .glueful-applications-search-progress,body #view-applications .glueful-applications-focus-today,body #view-applications [data-glueful-applications-left-rail]{display:none!important;visibility:hidden!important;}
        .gf-insight-card{background:#fff;border:1px solid #e5e5ea;border-radius:16px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.045);box-sizing:border-box;}
        .gf-progress-card{min-height:128px!important;}
        .gf-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px;}
        .gf-card-head h3{margin:0;font-size:16px;letter-spacing:-.25px;color:#1d1d1f;}
        .gf-card-head p{margin:3px 0 0;font-size:11px;color:#86868b;}
        .gf-card-head a{font-size:11px;color:#5146e5;text-decoration:none;font-weight:600;}
        .gf-goal-value{font-size:11px;color:#1d1d1f;align-self:flex-start;margin-top:1px;}
        .gf-progress{height:7px;border-radius:99px;background:#eeeef4;overflow:hidden;}
        .gf-progress span{display:block;width:50%;height:100%;border-radius:99px;background:linear-gradient(90deg,#6d3df5,#3578ff);}
        .gf-progress-copy{margin:9px 0 0;font-size:11px;line-height:1.45;color:#86868b;}
        .gf-donut{width:82px;height:82px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:conic-gradient(#6d3df5 0 72%,#e8e3ff 72% 100%);position:relative;flex:0 0 auto;}
        .gf-donut:after{content:"";position:absolute;inset:10px;background:#fff;border-radius:50%;}
        .gf-donut b,.gf-donut small{position:relative;z-index:1;}.gf-donut b{font-size:20px;color:#1d1d1f;}.gf-donut small{font-size:9px;color:#6e6e73;}
        .gf-legend{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;margin-top:-1px;}
        .gf-legend span{font-size:10px;color:#6e6e73;display:flex;align-items:center;gap:6px;}.gf-legend i{width:7px;height:7px;border-radius:50%;background:#f2b632;display:inline-block;}.gf-legend span:nth-child(2) i{background:#4d73f8;}.gf-legend span:nth-child(3) i{background:#19c37d;}.gf-legend span:nth-child(4) i{background:#ef4444;}.gf-legend b{margin-left:auto;color:#1d1d1f;}
        .gf-tip{display:flex;gap:7px;margin-top:12px;padding:9px 10px;border-radius:10px;background:#f7f5ff;color:#5146e5;font-size:10px;line-height:1.35;}.gf-tip span{color:#5f6470;}.gf-tip b{color:#5146e5;}
        .gf-action-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #f0f0f2;}.gf-action-icon{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#f4f5f8;color:#65708a;font-size:15px;flex:0 0 auto;}.gf-action-icon.green{background:#eafaf2;color:#12a76a;}.gf-action-row b{display:block;font-size:11px;color:#1d1d1f;}.gf-action-row small{display:block;margin-top:2px;font-size:10px;color:#86868b;}.gf-action-row small.attention{color:#ef4444;}.gf-quick-card button{width:100%;height:36px;margin-top:7px;border:1px solid #e5e5ea;border-radius:10px;background:#fafafd;color:#30343b;text-align:left;padding:0 10px;font-size:10px;cursor:pointer;}
      }
      @media(min-width:701px) and (max-width:1100px){
        body #glueful-applications-workspace-v1{display:none!important;}
        body #view-applications{width:calc(100% - 254px)!important;max-width:none!important;margin-left:230px!important;margin-right:24px!important;padding:28px 0 40px!important;left:0!important;box-sizing:border-box!important;transform:none!important;}
        body #glueful-dashboard-hamburger{display:none!important;}
      }
      @media(max-width:700px){
        body #glueful-applications-workspace-v1{display:none!important;}
        body #view-applications{width:100%!important;margin:0!important;padding:16px 12px 96px!important;left:0!important;box-sizing:border-box!important;transform:none!important;}
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
