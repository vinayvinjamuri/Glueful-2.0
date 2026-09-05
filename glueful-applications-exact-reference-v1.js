/* Glueful — Applications Exact Reference V1
 * Matches the approved Applications reference composition:
 * persistent sidebar, main applications column, and Search Progress at the top of the right rail.
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
        /* Reference geometry: 264px navigation, 52px breathing room,
           872px applications workspace, 44px gap, 358px right rail. */
        body #view-applications{
          position:relative!important;
          left:316px!important;
          width:872px!important;
          max-width:872px!important;
          margin:0!important;
          padding:18px 0 48px!important;
          box-sizing:border-box!important;
          transform:none!important;
          overflow:visible!important;
          height:auto!important;
          max-height:none!important;
        }
        body #view-applications .view-header{
          min-height:82px!important;
          margin:0 0 28px!important;
          padding:0!important;
        }
        body #view-applications .view-title{
          font-size:36px!important;
          line-height:1.08!important;
          letter-spacing:-1.2px!important;
          margin:0 0 6px!important;
        }
        body #view-applications .view-subtitle{font-size:16px!important;margin:0!important;}
        body #view-applications input,body #view-applications select,body #view-applications textarea{
          min-height:44px!important;border:1px solid #e5e5ea!important;border-radius:12px!important;
          background:#fff!important;color:#1d1d1f!important;box-sizing:border-box!important;
        }
        body #view-applications .application-card,body #view-applications .job-application-card,body #view-applications .card{
          background:#fff!important;color:#1d1d1f!important;border:1px solid #e5e5ea!important;
          border-radius:16px!important;box-shadow:0 8px 24px rgba(0,0,0,.035)!important;
        }
        /* Desktop/tablet persistent navigation: no hamburger. */
        body #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{
          display:none!important;visibility:hidden!important;pointer-events:none!important;
        }
        /* Keep the top Add control in the header rather than over the list. */
        body #view-applications .view-header > button:not(:first-child),
        body #view-applications .view-header > a{
          position:fixed!important;top:16px!important;right:350px!important;z-index:1001!important;margin:0!important;
        }
        /* Old left-side workspace is intentionally gone. */
        body #glueful-applications-left-v1{display:none!important;visibility:hidden!important;}
        /* Exact right rail: Search Progress first. */
        body #glueful-applications-workspace-v1{
          position:fixed!important;
          top:88px!important;
          right:42px!important;
          width:358px!important;
          display:flex!important;
          flex-direction:column!important;
          gap:16px!important;
          z-index:20!important;
        }
        .gf-insight-card{
          background:#fff;border:1px solid #e5e5ea;border-radius:18px;padding:20px;
          box-shadow:0 10px 30px rgba(0,0,0,.045);box-sizing:border-box;
        }
        .gf-progress-card{min-height:172px!important;}
        .gf-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px;}
        .gf-card-head h3{margin:0;font-size:17px;letter-spacing:-.25px;color:#1d1d1f;}
        .gf-card-head p{margin:4px 0 0;font-size:12px;color:#86868b;}
        .gf-goal-value{font-size:12px;color:#1d1d1f;align-self:flex-start;margin-top:2px;}
        .gf-progress{height:8px;border-radius:99px;background:#eeeef4;overflow:hidden;}
        .gf-progress span{display:block;width:50%;height:100%;border-radius:99px;background:linear-gradient(90deg,#6d3df5,#3578ff);}
        .gf-progress-copy{margin:12px 0 0;font-size:12px;line-height:1.5;color:#86868b;}
        .gf-donut{width:92px;height:92px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:conic-gradient(#6d3df5 0 72%,#e8e3ff 72% 100%);position:relative;flex:0 0 auto;}
        .gf-donut:after{content:"";position:absolute;inset:11px;background:#fff;border-radius:50%;}
        .gf-donut b,.gf-donut small{position:relative;z-index:1;}.gf-donut b{font-size:22px;color:#1d1d1f;}.gf-donut small{font-size:10px;color:#6e6e73;}
        .gf-legend{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px;margin-top:-2px;}
        .gf-legend span{font-size:11px;color:#6e6e73;display:flex;align-items:center;gap:7px;}.gf-legend i{width:7px;height:7px;border-radius:50%;background:#f2b632;display:inline-block;}.gf-legend span:nth-child(2) i{background:#4d73f8;}.gf-legend span:nth-child(3) i{background:#19c37d;}.gf-legend span:nth-child(4) i{background:#ef4444;}.gf-legend b{margin-left:auto;color:#1d1d1f;}
        .gf-tip{display:flex;gap:8px;margin-top:16px;padding:11px 12px;border-radius:12px;background:#f7f5ff;color:#5146e5;font-size:12px;line-height:1.4;}.gf-tip span{color:#5f6470;}.gf-tip b{color:#5146e5;}
        .gf-action-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #f0f0f2;}.gf-action-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#f4f5f8;color:#65708a;font-size:17px;flex:0 0 auto;}.gf-action-icon.green{background:#eafaf2;color:#12a76a;}.gf-action-row b{display:block;font-size:12px;color:#1d1d1f;}.gf-action-row small{display:block;margin-top:3px;font-size:11px;color:#86868b;}.gf-action-row small.attention{color:#ef4444;}.gf-quick-card button{width:100%;height:40px;margin-top:8px;border:1px solid #e5e5ea;border-radius:11px;background:#fafafd;color:#30343b;text-align:left;padding:0 12px;font-size:12px;cursor:pointer;}
      }
      @media(min-width:701px) and (max-width:1100px){
        body #glueful-applications-left-v1,body #glueful-applications-workspace-v1{display:none!important;}
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
