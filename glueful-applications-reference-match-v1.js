/* Glueful — Applications Reference Match V1
 * Reference-matching desktop layout for the Applications page.
 * Presentation only; existing application data and handlers remain untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_REFERENCE_MATCH_V1__) return;
  window.__GLUEFUL_APPLICATIONS_REFERENCE_MATCH_V1__=true;

  const STYLE_ID='glueful-applications-reference-match-v1-style';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      :root{--gf-ref-bg:#f7f7f9;--gf-ref-card:#fff;--gf-ref-text:#16161a;--gf-ref-muted:#6b6b76;--gf-ref-line:#e7e7ea;}
      html,body{background:var(--gf-ref-bg)!important;color:var(--gf-ref-text)!important;}

      @media(min-width:1200px){
        body #view-applications{
          position:relative!important;left:0!important;top:0!important;
          width:calc(100vw - 264px)!important;max-width:none!important;min-width:0!important;
          margin:0 0 0 264px!important;padding:24px 32px 48px!important;
          box-sizing:border-box!important;transform:none!important;overflow:visible!important;
          height:auto!important;max-height:none!important;
        }
        body #view-applications .view-header{
          width:920px!important;max-width:920px!important;min-height:76px!important;
          margin:0 0 24px!important;padding:0!important;display:flex!important;
          align-items:flex-start!important;justify-content:space-between!important;
        }
        body #view-applications .view-title{margin:0 0 4px!important;color:var(--gf-ref-text)!important;font-size:34px!important;line-height:1.08!important;font-weight:700!important;letter-spacing:-1px!important;}
        body #view-applications .view-subtitle{margin:0!important;color:var(--gf-ref-muted)!important;font-size:16px!important;line-height:1.35!important;}
        body #view-applications > *:not(.view-header):not(#glueful-applications-workspace-v1){width:920px!important;max-width:920px!important;box-sizing:border-box!important;}

        body #glueful-applications-workspace-v1{
          position:absolute!important;top:0!important;right:32px!important;width:320px!important;max-width:320px!important;
          margin:0!important;padding:0!important;display:flex!important;flex-direction:column!important;gap:16px!important;z-index:10!important;box-sizing:border-box!important;
        }
        body #glueful-applications-workspace-v1 > *{width:320px!important;max-width:320px!important;box-sizing:border-box!important;}
        body #glueful-applications-workspace-v1 .gf-insight-card{width:320px!important;box-sizing:border-box!important;border-radius:18px!important;border:1px solid var(--gf-ref-line)!important;background:#fff!important;box-shadow:0 1px 2px rgba(0,0,0,.03),0 4px 14px rgba(0,0,0,.04)!important;}
        body #glueful-applications-workspace-v1 .gf-progress-card{min-height:160px!important;}

        body #view-applications input[type="search"],body #view-applications input[placeholder*="Search"],body #view-applications input,body #view-applications select,body #view-applications textarea{
          min-height:48px!important;border:1px solid var(--gf-ref-line)!important;border-radius:12px!important;background:#fff!important;color:var(--gf-ref-text)!important;box-sizing:border-box!important;
        }
        body #view-applications .application-card,body #view-applications .job-application-card,body #view-applications .card{
          width:100%!important;min-height:92px!important;background:#fff!important;color:var(--gf-ref-text)!important;border:1px solid var(--gf-ref-line)!important;border-radius:16px!important;box-shadow:0 1px 2px rgba(0,0,0,.03),0 5px 14px rgba(0,0,0,.035)!important;box-sizing:border-box!important;
        }
        body #view-applications .application-card + .application-card,body #view-applications .job-application-card + .job-application-card{margin-top:12px!important;}
        body #glueful-applications-left-v1,body #view-applications .glueful-applications-search-progress,body #view-applications .glueful-applications-focus-today,body #view-applications [data-glueful-applications-left-rail]{display:none!important;visibility:hidden!important;}
        body #glueful-dashboard-hamburger,body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{display:none!important;visibility:hidden!important;pointer-events:none!important;}
      }

      @media(min-width:768px) and (max-width:1199px){
        body #view-applications{position:relative!important;left:0!important;top:0!important;width:calc(100vw - 260px)!important;max-width:none!important;margin:0 0 0 260px!important;padding:24px 24px 40px!important;box-sizing:border-box!important;transform:none!important;overflow:visible!important;}
        body #view-applications > *:not(.view-header){max-width:none!important;width:100%!important;box-sizing:border-box!important;}
        body #glueful-applications-workspace-v1{position:static!important;width:100%!important;max-width:none!important;margin-top:20px!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px!important;}
        body #glueful-applications-workspace-v1 > *{width:100%!important;max-width:none!important;}
        body #glueful-dashboard-hamburger{display:none!important;}
      }

      @media(max-width:767px){
        body #view-applications{width:100%!important;max-width:none!important;margin:0!important;padding:16px 12px 96px!important;box-sizing:border-box!important;}
        body #glueful-applications-workspace-v1{display:none!important;}
      }
    `;
    document.head.appendChild(s);
  }

  function normalize(){
    const view=document.getElementById('view-applications');
    if(!view) return;
    const workspace=document.getElementById('glueful-applications-workspace-v1');
    if(workspace && workspace.parentElement!==view) view.appendChild(workspace);
  }

  function boot(){install();normalize();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();