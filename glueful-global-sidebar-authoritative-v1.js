/* Glueful — Global Sidebar Authoritative V2
 * One desktop/tablet sidebar geometry for every section.
 * The sidebar is 248px wide; workspace views start at the same 248px boundary.
 * Never combine a 248px left offset with an additional 248px margin.
 * Mobile drawer behavior remains unchanged.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_GLOBAL_SIDEBAR_AUTHORITATIVE_V2__) return;
  window.__GLUEFUL_GLOBAL_SIDEBAR_AUTHORITATIVE_V2__=true;
  const STYLE_ID='glueful-global-sidebar-authoritative-v2-style';
  const SIDEBAR=248;
  const VIEWS='#view-dashboard,#view-applications,#view-interviews,#view-jobs,#view-resume,#view-gmail,#view-profile,#view-settings,#view-saved-jobs,#view-add-application';
  function install(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;(document.head||document.documentElement).appendChild(s);}
    s.textContent=`
      @media(min-width:768px){
        html body #glueful-drawer{
          width:${SIDEBAR}px!important;min-width:${SIDEBAR}px!important;max-width:${SIDEBAR}px!important;
          box-sizing:border-box!important;
        }
      }
      @media(min-width:1280px){
        /* One boundary only: fixed/absolute views use left:248 and margin-left:0. */
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
          width:calc(100vw - ${SIDEBAR}px)!important;
          max-width:none!important;
        }
      }
      @media(min-width:768px) and (max-width:1279px){
        /* Tablet layouts are flow/relative based; use one 248px margin, not left+margin. */
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
  function start(){install();[100,300,700,1400,2500,5000].forEach(function(t){setTimeout(install,t);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
