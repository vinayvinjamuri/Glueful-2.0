/* Glueful Dashboard Desktop Header Polish V1
 * Presentation only. Fixes desktop header clipping and vertical rhythm.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_DESKTOP_HEADER_POLISH_V1__) return;
  window.__GLUEFUL_DASHBOARD_DESKTOP_HEADER_POLISH_V1__=true;
  const STYLE_ID='glueful-dashboard-desktop-header-polish-v1-style';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      @media(min-width:1101px){
        body.glueful-apple-dashboard #view-dashboard .view-header{
          display:flex!important;
          align-items:flex-start!important;
          justify-content:space-between!important;
          gap:24px!important;
          margin-top:0!important;
          margin-bottom:28px!important;
          min-height:82px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header > *:first-child{
          min-width:0!important;
          flex:1 1 auto!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-header button,
        body.glueful-apple-dashboard #view-dashboard .view-header a{
          flex:0 0 auto!important;
          max-width:180px!important;
          margin-top:4px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-title,
        body.glueful-apple-dashboard #view-dashboard h1{
          margin-top:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{
          margin-bottom:0!important;
        }
      }
      @media(min-width:701px) and (max-width:1100px){
        body.glueful-apple-dashboard #view-dashboard .view-header{
          gap:16px!important;
          margin-bottom:22px!important;
        }
      }
    `;document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
