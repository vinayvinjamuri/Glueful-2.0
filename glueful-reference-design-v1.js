/* Glueful — Reference Design V1
 * Visual system based on the supplied multi-screen reference.
 * Presentation only: keeps existing data, navigation, handlers and workflows.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_REFERENCE_DESIGN_V1__) return;
  window.__GLUEFUL_REFERENCE_DESIGN_V1__=true;

  const STYLE_ID='glueful-reference-design-v1-style';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      :root{
        --gfr-bg:#f7f8fb;
        --gfr-surface:#fff;
        --gfr-line:#e6e9f0;
        --gfr-text:#111827;
        --gfr-muted:#778196;
        --gfr-blue:#2457d6;
        --gfr-blue-soft:#eef3ff;
        --gfr-purple:#6759e8;
        --gfr-green:#20b77a;
        --gfr-red:#ef5962;
        --gfr-shadow:0 8px 24px rgba(24,32,52,.045);
      }

      html,body{background:var(--gfr-bg)!important;color:var(--gfr-text)!important;}
      body{font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif!important;-webkit-font-smoothing:antialiased!important;}
      body .sidebar,body .side-nav,body .app-sidebar,body #glueful-drawer{
        background:#fff!important;border-right:1px solid var(--gfr-line)!important;
      }
      body .sidebar *,body .side-nav *,body .app-sidebar *,body #glueful-drawer *{font-family:inherit!important;}
      body .sidebar a,body .side-nav a,body .app-sidebar a,body #glueful-drawer a{color:#4b5567!important;}
      body .sidebar a.active,body .side-nav a.active,body .app-sidebar a.active,body #glueful-drawer a.active,
      body .sidebar .active,body .side-nav .active,body .app-sidebar .active,body #glueful-drawer .active{
        color:var(--gfr-blue)!important;background:#eef3ff!important;border-radius:9px!important;
      }

      #view-dashboard,#view-applications,#view-interviews,#view-profile,#view-saved-jobs,#view-settings,#view-jobs,#view-resume,#view-add-application{
        box-sizing:border-box!important;color:var(--gfr-text)!important;
      }
      #view-dashboard input,#view-applications input,#view-interviews input,#view-profile input,#view-jobs input,
      #view-dashboard select,#view-applications select,#view-interviews select,#view-profile select,#view-jobs select,
      #view-dashboard textarea,#view-applications textarea,#view-interviews textarea,#view-profile textarea,#view-jobs textarea{
        border:1px solid var(--gfr-line)!important;background:#fff!important;color:var(--gfr-text)!important;border-radius:9px!important;box-shadow:none!important;
      }
      #view-dashboard input:focus,#view-applications input:focus,#view-interviews input:focus,#view-profile input:focus,#view-jobs input:focus,
      #view-dashboard select:focus,#view-applications select:focus,#view-interviews select:focus,#view-profile select:focus,#view-jobs select:focus{
        outline:none!important;border-color:#b9c7f6!important;box-shadow:0 0 0 3px rgba(36,87,214,.08)!important;
      }

      /* Shared desktop canvas */
      @media(min-width:1101px){
        #view-applications,#view-interviews,#view-profile,#view-saved-jobs,#view-settings,#view-jobs,#view-resume,#view-add-application{
          width:calc(100vw - 260px)!important;max-width:none!important;margin-left:260px!important;margin-right:0!important;
          padding:26px 32px 52px!important;min-height:100vh!important;background:transparent!important;
          transform:none!important;left:auto!important;right:auto!important;
        }
        #view-dashboard{background:transparent!important;}
      }

      /* Reference-style page headers */
      #view-applications .view-header,#view-interviews .view-header,#view-profile .view-header,#view-jobs .view-header,#view-resume .view-header{
        color:var(--gfr-text)!important;background:transparent!important;border:0!important;
      }
      #view-applications .view-title,#view-interviews .view-title,#view-profile .view-title,#view-jobs .view-title,#view-resume .view-title{
        color:var(--gfr-text)!important;font-size:34px!important;line-height:1.08!important;font-weight:760!important;letter-spacing:-1.1px!important;
      }
      #view-applications .view-subtitle,#view-interviews .view-subtitle,#view-profile .view-subtitle,#view-jobs .view-subtitle,#view-resume .view-subtitle{
        color:var(--gfr-muted)!important;font-size:14px!important;line-height:1.45!important;
      }

      /* Cards and content surfaces */
      #view-dashboard .card,#view-dashboard .panel,#view-dashboard .stat-card,
      #view-applications .card,#view-applications .panel,
      #view-interviews .card,#view-interviews .panel,
      #view-profile .card,#view-profile .panel,
      #view-jobs .card,#view-jobs .panel,
      #view-saved-jobs .card,#view-settings .card{
        background:#fff!important;border:1px solid var(--gfr-line)!important;border-radius:14px!important;box-shadow:var(--gfr-shadow)!important;
      }
      #view-applications .application-card,#view-applications .job-application-card,
      #view-interviews .interview-card,#view-interviews .interview-item,
      #view-jobs .job-card,#view-saved-jobs .job-card{
        background:#fff!important;border:1px solid var(--gfr-line)!important;border-radius:12px!important;box-shadow:none!important;
      }

      /* Compact reference controls */
      #view-applications button,#view-interviews button,#view-profile button,#view-jobs button,#view-resume button{
        border-radius:9px!important;font-family:inherit!important;
      }
      #view-applications .primary,#view-applications .btn-primary,
      #view-interviews .primary,#view-interviews .btn-primary,
      #view-profile .primary,#view-profile .btn-primary,
      #view-jobs .primary,#view-jobs .btn-primary{
        background:linear-gradient(180deg,#3568e2,#244fca)!important;color:#fff!important;border-color:#244fca!important;
      }

      /* Reference dashboard composition */
      body.glueful-apple-dashboard #view-dashboard{background:transparent!important;}
      body.glueful-apple-dashboard #view-dashboard .stat-card,
      body.glueful-apple-dashboard #view-dashboard .dashboard-card,
      body.glueful-apple-dashboard #view-dashboard .panel{
        border:1px solid var(--gfr-line)!important;border-radius:14px!important;box-shadow:var(--gfr-shadow)!important;background:#fff!important;
      }

      /* Application list/table rhythm */
      #view-applications table{border-collapse:separate!important;border-spacing:0!important;background:#fff!important;border:1px solid var(--gfr-line)!important;border-radius:12px!important;overflow:hidden!important;}
      #view-applications th{background:#f7f8fb!important;color:#7b8496!important;font-size:11px!important;font-weight:650!important;text-transform:none!important;border-bottom:1px solid var(--gfr-line)!important;}
      #view-applications td{font-size:12px!important;color:#394255!important;border-bottom:1px solid #eef0f4!important;background:#fff!important;}
      #view-applications tr:last-child td{border-bottom:0!important;}

      /* Right-side workspace cards from the reference */
      #glueful-applications-workspace-v1 .gf-app-side-card{border-radius:14px!important;box-shadow:var(--gfr-shadow)!important;border-color:var(--gfr-line)!important;}

      /* Mobile: mirror the compact phone reference */
      @media(max-width:767px){
        body{background:#fff!important;}
        body .sidebar,body .side-nav,body .app-sidebar,body #glueful-drawer{border-right:0!important;}
        #view-dashboard,#view-applications,#view-interviews,#view-profile,#view-saved-jobs,#view-settings,#view-jobs,#view-resume,#view-add-application{
          width:100%!important;max-width:none!important;margin:0!important;padding:16px 14px 92px!important;min-height:100vh!important;transform:none!important;
        }
        #view-applications .view-title,#view-interviews .view-title,#view-profile .view-title,#view-jobs .view-title,#view-resume .view-title{font-size:27px!important;letter-spacing:-.7px!important;}
        #view-applications .view-subtitle,#view-interviews .view-subtitle,#view-profile .view-subtitle,#view-jobs .view-subtitle,#view-resume .view-subtitle{font-size:12px!important;}
        #view-dashboard .card,#view-dashboard .panel,#view-dashboard .stat-card,
        #view-applications .card,#view-applications .panel,#view-interviews .card,#view-interviews .panel,
        #view-profile .card,#view-profile .panel,#view-jobs .card,#view-jobs .panel{border-radius:12px!important;}
        #view-applications table{font-size:11px!important;}
      }
    `;
    (document.head||document.documentElement).appendChild(s);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
