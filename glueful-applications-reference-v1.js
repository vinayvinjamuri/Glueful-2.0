/* Glueful — Applications Reference UI V2
 * Presentation-only layer for the Applications page.
 * Matches the locked light Apple-style dashboard shell without changing
 * application data, handlers, forms or navigation behavior.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_REFERENCE_V2__) return;
  window.__GLUEFUL_APPLICATIONS_REFERENCE_V2__=true;

  const STYLE_ID='glueful-applications-reference-v2-style';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      html,body{background:#f5f5f7!important;color:#1d1d1f!important;}
      body{color-scheme:light!important;}
      body #view-applications{color:#1d1d1f!important;background:transparent!important;}
      body #view-applications *{scrollbar-color:#c7c7cc transparent;}

      @media(min-width:1101px){
        body #view-applications{
          position:static!important;width:calc(100% - 294px)!important;max-width:1240px!important;
          margin-left:270px!important;margin-right:24px!important;margin-top:0!important;
          padding:32px 0 48px!important;box-sizing:border-box!important;
          overflow:visible!important;height:auto!important;min-height:0!important;max-height:none!important;
        }
        body #view-applications .view-header{
          position:relative!important;display:flex!important;align-items:flex-start!important;
          justify-content:space-between!important;gap:24px!important;width:100%!important;
          min-height:82px!important;margin:0 0 28px!important;padding:0!important;box-sizing:border-box!important;
        }
        body #view-applications .view-title{
          margin:0 0 6px!important;font-size:36px!important;line-height:1.08!important;
          letter-spacing:-1.2px!important;color:#1d1d1f!important;
        }
        body #view-applications .view-subtitle{
          margin:0!important;font-size:16px!important;line-height:1.45!important;color:#6e6e73!important;
        }
        body #view-applications input,body #view-applications select,body #view-applications textarea{
          min-height:44px!important;border:1px solid #e5e5ea!important;border-radius:12px!important;
          background:#fff!important;color:#1d1d1f!important;box-shadow:0 1px 2px rgba(0,0,0,.03)!important;
          box-sizing:border-box!important;
        }
        body #view-applications input::placeholder,body #view-applications textarea::placeholder{color:#86868b!important;}
        body #view-applications input:focus,body #view-applications select:focus,body #view-applications textarea:focus{
          outline:none!important;border-color:#b8c9ff!important;box-shadow:0 0 0 3px rgba(0,113,227,.10)!important;
        }
        body #view-applications button{border-radius:12px!important;min-height:42px!important;}
        body #view-applications .search-bar,body #view-applications .filters,body #view-applications .filter-bar,body #view-applications .toolbar{color:#1d1d1f!important;}
        body #view-applications .application-card,body #view-applications .job-application-card{
          background:#fff!important;color:#1d1d1f!important;border:1px solid #e5e5ea!important;
          border-radius:16px!important;box-shadow:0 8px 24px rgba(0,0,0,.035)!important;overflow:hidden!important;
          transition:box-shadow .16s ease,transform .16s ease!important;
        }
        body #view-applications .application-card:hover,body #view-applications .job-application-card:hover{
          box-shadow:0 12px 30px rgba(0,0,0,.07)!important;transform:translateY(-1px)!important;
        }
        body #view-applications .card{
          background:#fff!important;color:#1d1d1f!important;border:1px solid #e5e5ea!important;
          border-radius:18px!important;box-shadow:0 10px 30px rgba(0,0,0,.045)!important;overflow:hidden!important;
        }
        body #view-applications table{width:100%!important;border-collapse:separate!important;border-spacing:0!important;}
        body #view-applications th{
          height:48px!important;padding:0 18px!important;background:#f9f9fb!important;color:#6e6e73!important;
          border-bottom:1px solid #e5e5ea!important;font-size:11px!important;font-weight:600!important;
          text-transform:uppercase!important;letter-spacing:.04em!important;text-align:left!important;
        }
        body #view-applications td{
          padding:16px 18px!important;border-bottom:1px solid #f0f0f2!important;color:#1d1d1f!important;
          font-size:13px!important;vertical-align:middle!important;
        }
        body #view-applications tr:last-child td{border-bottom:0!important;}
        body #view-applications [class*="status"],body #view-applications .badge,body #view-applications .pill{border-radius:999px!important;}
      }

      @media(min-width:701px) and (max-width:1100px){
        body #view-applications{width:calc(100% - 254px)!important;margin-left:230px!important;margin-right:24px!important;padding:28px 0 40px!important;box-sizing:border-box!important;}
        body #view-applications .view-header{margin-bottom:22px!important;}
        body #view-applications .view-title{font-size:32px!important;}
      }

      @media(max-width:700px){
        body #view-applications{width:100%!important;margin:0!important;padding:16px 12px 96px!important;box-sizing:border-box!important;}
        body #view-applications .view-header{display:block!important;margin:0 0 18px!important;}
        body #view-applications .view-title{font-size:26px!important;line-height:1.08!important;letter-spacing:-.6px!important;margin:0 0 5px!important;}
        body #view-applications .view-subtitle{font-size:13px!important;line-height:1.35!important;}
        body #view-applications input,body #view-applications select{min-height:42px!important;border-radius:11px!important;}
        body #view-applications .application-card,body #view-applications .job-application-card,body #view-applications .card{border-radius:15px!important;}
        body #view-applications table{min-width:680px!important;}
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
