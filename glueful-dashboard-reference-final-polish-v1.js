/* Glueful — Dashboard Reference Final Polish V2
 * Presentation only. Expands the approved desktop dashboard composition.
 * Keeps dashboard data, navigation, and existing feature behavior unchanged.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_FINAL_POLISH_V2__)return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_FINAL_POLISH_V2__=true;

  const STYLE_ID='glueful-dashboard-reference-final-polish-v2-style';

  function install(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        /* Keep the approved vertical position, but let the dashboard use the desktop width. */
        body.glueful-apple-dashboard #view-dashboard{
          transform:translate(-53px,-90px)!important;
          width:calc(100% - 254px)!important;
          max-width:none!important;
        }

        /* Keep the greeting/header compact like the reference. */
        body.glueful-apple-dashboard #view-dashboard .view-header{
          margin-bottom:24px!important;
        }

        /* + Application sits directly beside the fixed profile control. */
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions{
          position:fixed!important;
          top:23px!important;
          right:76px!important;
          width:160px!important;
          height:44px!important;
          margin:0!important;
          padding:0!important;
          z-index:1000!important;
        }
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-header-actions .glueful-approved-application{
          width:160px!important;
          min-width:160px!important;
          max-width:160px!important;
          height:44px!important;
          min-height:44px!important;
          margin:0!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
