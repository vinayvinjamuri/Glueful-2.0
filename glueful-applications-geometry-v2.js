/* Glueful — Applications Geometry V2
 * Final geometry correction for the Apple-style Applications shell.
 * Presentation only; existing data and handlers remain untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_GEOMETRY_V2__) return;
  window.__GLUEFUL_APPLICATIONS_GEOMETRY_V2__=true;

  const STYLE_ID='glueful-applications-geometry-v2-style';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      body.glueful-applications-apple #view-applications .view-header{box-sizing:border-box!important;}

      /* Remove the old centered/max-width geometry from the Applications content. */
      body.glueful-applications-apple #view-applications > *:not(#glueful-applications-workspace-v1){
        margin-left:0!important;
        margin-right:0!important;
        transform:none!important;
        box-sizing:border-box!important;
      }
      body.glueful-applications-apple #view-applications > *:not(#glueful-applications-workspace-v1) > *{
        box-sizing:border-box!important;
      }

      @media(min-width:1280px){
        body.glueful-applications-apple #view-applications{
          width:calc(100vw - 260px)!important;
          margin-left:260px!important;
          margin-right:0!important;
          padding:26px 32px 52px!important;
          display:grid!important;
          grid-template-columns:minmax(0,1fr) 350px!important;
          grid-template-rows:auto auto!important;
          column-gap:28px!important;
          row-gap:24px!important;
          align-items:start!important;
          overflow:visible!important;
        }
        body.glueful-applications-apple #view-applications > .view-header{
          grid-column:1/-1!important;
          grid-row:1!important;
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin:0!important;
          padding:0!important;
        }
        body.glueful-applications-apple #view-applications > #glueful-applications-workspace-v1{
          grid-column:2!important;
          grid-row:2!important;
          position:sticky!important;
          top:24px!important;
          width:350px!important;
          min-width:350px!important;
          max-width:350px!important;
          margin:0!important;
          padding:0!important;
          z-index:20!important;
        }
        body.glueful-applications-apple #view-applications > *:not(.view-header):not(#glueful-applications-workspace-v1){
          grid-column:1!important;
          grid-row:2!important;
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin:0!important;
          padding:0!important;
        }
        /* The actual Applications content is often wrapped one level deeper. */
        body.glueful-applications-apple #view-applications > *:not(.view-header):not(#glueful-applications-workspace-v1) > *{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin-left:0!important;
          margin-right:0!important;
          box-sizing:border-box!important;
          transform:none!important;
        }
        body.glueful-applications-apple #view-applications .view-title{
          text-align:left!important;
          margin-left:0!important;
          margin-right:0!important;
        }
        body.glueful-applications-apple #view-applications input[type="search"],
        body.glueful-applications-apple #view-applications input[placeholder*="Search"],
        body.glueful-applications-apple #view-applications input[placeholder*="search"]{
          width:100%!important;
          max-width:none!important;
          margin-left:0!important;
          margin-right:0!important;
        }
      }

      @media(min-width:768px) and (max-width:1279px){
        body.glueful-applications-apple #view-applications{
          width:calc(100vw - 260px)!important;
          margin-left:260px!important;
          padding:26px 26px 48px!important;
          box-sizing:border-box!important;
        }
        body.glueful-applications-apple #view-applications > *:not(#glueful-applications-workspace-v1){
          width:100%!important;
          max-width:none!important;
          margin-left:0!important;
          margin-right:0!important;
        }
      }

      @media(max-width:767px){
        body.glueful-applications-apple #view-applications{
          width:100%!important;
          margin:0!important;
          padding:18px 13px 96px!important;
          display:block!important;
        }
        body.glueful-applications-apple #view-applications > *:not(#glueful-applications-workspace-v1){
          width:100%!important;
          max-width:none!important;
          margin-left:0!important;
          margin-right:0!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function start(){install();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
