/* Glueful — Global Sidebar Authoritative V3
 * Dashboard is the single visual master for the sidebar.
 * Every desktop/tablet section uses the same sidebar geometry and typography.
 * Mobile drawer behavior remains unchanged.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_GLOBAL_SIDEBAR_AUTHORITATIVE_V3__) return;
  window.__GLUEFUL_GLOBAL_SIDEBAR_AUTHORITATIVE_V3__=true;

  const STYLE_ID='glueful-global-sidebar-authoritative-v3-style';
  const SIDEBAR=248;

  function install(){
    let s=document.getElementById(STYLE_ID);
    if(!s){
      s=document.createElement('style');
      s.id=STYLE_ID;
      (document.head||document.documentElement).appendChild(s);
    }
    s.textContent=`
      @media(min-width:768px){
        /* Exact Dashboard sidebar geometry — shared everywhere. */
        html body #glueful-drawer{
          width:${SIDEBAR}px!important;
          min-width:${SIDEBAR}px!important;
          max-width:${SIDEBAR}px!important;
          box-sizing:border-box!important;
          margin:0!important;
          padding:0!important;
        }

        /* Do not let individual pages resize or restyle the sidebar. */
        html body #glueful-drawer,
        html body #glueful-drawer *{
          box-sizing:border-box!important;
        }

        html body #glueful-drawer a,
        html body #glueful-drawer button{
          font-family:inherit!important;
        }

        /* Dashboard-matched navigation typography. */
        html body #glueful-drawer [class*="label"],
        html body #glueful-drawer [class*="title"],
        html body #glueful-drawer .nav-label{
          font-size:13px!important;
          line-height:1.2!important;
          font-weight:600!important;
        }
        html body #glueful-drawer [class*="description"],
        html body #glueful-drawer [class*="subtitle"],
        html body #glueful-drawer .nav-description,
        html body #glueful-drawer small{
          font-size:11px!important;
          line-height:1.25!important;
          font-weight:400!important;
        }
      }

      @media(min-width:1280px){
        /* One content boundary after the 248px Dashboard sidebar. */
        html body #view-dashboard,
        html body #view-applications,
        html body #view-interviews,
        html body #view-jobs,
        html body #view-resume,
        html body #view-gmail,
        html body #view-profile,
        html body #view-settings,
        html body #view-saved-jobs,
        html body #view-add-application{
          left:${SIDEBAR}px!important;
          margin-left:0!important;
          box-sizing:border-box!important;
        }
        html body #view-applications,
        html body #view-interviews,
        html body #view-jobs,
        html body #view-resume,
        html body #view-gmail,
        html body #view-profile,
        html body #view-settings,
        html body #view-saved-jobs,
        html body #view-add-application{
          width:calc(100vw - ${SIDEBAR}px)!important;
          max-width:none!important;
        }
        html body #view-dashboard{
          width:calc(100vw - ${SIDEBAR}px)!important;
          max-width:none!important;
        }
      }

      @media(min-width:768px) and (max-width:1279px){
        html body #view-dashboard,
        html body #view-applications,
        html body #view-interviews,
        html body #view-jobs,
        html body #view-resume,
        html body #view-gmail,
        html body #view-profile,
        html body #view-settings,
        html body #view-saved-jobs,
        html body #view-add-application{
          left:auto!important;
          margin-left:${SIDEBAR}px!important;
          width:calc(100vw - ${SIDEBAR}px)!important;
          box-sizing:border-box!important;
        }
      }
    `;
  }

  function start(){
    install();
    [100,300,700,1400,2500,5000].forEach(function(t){setTimeout(install,t);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
