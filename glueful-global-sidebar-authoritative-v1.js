/* Glueful — Global Sidebar Authoritative V1
 * One desktop/tablet sidebar geometry for every section.
 * Mobile drawer behavior remains unchanged.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_GLOBAL_SIDEBAR_AUTHORITATIVE_V1__) return;
  window.__GLUEFUL_GLOBAL_SIDEBAR_AUTHORITATIVE_V1__=true;

  const STYLE_ID='glueful-global-sidebar-authoritative-v1-style';
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
        /* ONE authoritative sidebar */
        html body #glueful-drawer{
          width:${SIDEBAR}px!important;
          min-width:${SIDEBAR}px!important;
          max-width:${SIDEBAR}px!important;
          box-sizing:border-box!important;
        }
      }
      @media(min-width:1280px){
        /* Every desktop workspace begins at the same 248px boundary. */
        html body #view-dashboard,
        html body.glueful-apple-dashboard #view-dashboard,
        html body #view-applications,
        html body #view-interviews,
        html body #view-jobs,
        html body #view-resume,
        html body #view-gmail,
        html body #view-profile,
        html body #view-settings,
        html body #view-saved-jobs,
        html body #view-add-application{
          margin-left:248px!important;
        }
        html body.glueful-apple-dashboard #view-dashboard,
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
          left:248px!important;
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
          width:calc(100vw - 248px)!important;
        }
        html body.glueful-apple-dashboard #view-dashboard{
          width:calc(100vw - 248px)!important;
        }
      }
      @media(min-width:768px) and (max-width:1279px){
        html body #view-dashboard,
        html body.glueful-apple-dashboard #view-dashboard,
        html body #view-applications,
        html body #view-interviews,
        html body #view-jobs,
        html body #view-resume,
        html body #view-gmail,
        html body #view-profile,
        html body #view-settings,
        html body #view-saved-jobs,
        html body #view-add-application{
          margin-left:248px!important;
          width:calc(100vw - 248px)!important;
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
