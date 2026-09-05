/* Glueful — Applications Reference Authoritative V2
 * Final presentation override for the Applications page.
 * Keeps existing data, controls, navigation and handlers intact.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_REFERENCE_AUTHORITATIVE_V2__)return;
  window.__GLUEFUL_APPLICATIONS_REFERENCE_AUTHORITATIVE_V2__=true;

  const STYLE_ID='glueful-applications-reference-authoritative-v2-style';

  function install(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1280px){
        html,body{overflow-x:hidden!important;}
        body.glueful-applications-apple #view-applications{
          position:relative!important;
          left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
          transform:none!important;
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          min-width:0!important;
          min-height:100vh!important;
          margin:0 0 0 260px!important;
          padding:26px 32px 52px!important;
          box-sizing:border-box!important;
          display:grid!important;
          grid-template-columns:minmax(0,1fr) 350px!important;
          grid-template-rows:auto auto!important;
          column-gap:28px!important;
          row-gap:22px!important;
          align-items:start!important;
          overflow:visible!important;
        }

        body.glueful-applications-apple #view-applications>.view-header{
          grid-column:1/-1!important;
          grid-row:1!important;
          width:100%!important;
          min-width:0!important;
          min-height:72px!important;
          margin:0 0 0!important;
          padding:0!important;
          display:flex!important;
          align-items:flex-start!important;
          justify-content:space-between!important;
          gap:22px!important;
          box-sizing:border-box!important;
        }
        body.glueful-applications-apple #view-applications .view-header>button,
        body.glueful-applications-apple #view-applications .view-header>a{
          position:static!important;inset:auto!important;transform:none!important;
          margin:0!important;flex:0 0 auto!important;
        }

        /* Every real Applications content block stays in the left column. */
        body.glueful-applications-apple #view-applications>:not(.view-header):not(#glueful-applications-workspace-v1){
          grid-column:1!important;
          min-width:0!important;
          width:100%!important;
          max-width:none!important;
          margin-left:0!important;margin-right:0!important;
          transform:none!important;
          box-sizing:border-box!important;
        }

        /* Search and filters should never be constrained by an old 378px rail rule. */
        body.glueful-applications-apple #view-applications input[type="search"],
        body.glueful-applications-apple #view-applications input[placeholder*="Search"],
        body.glueful-applications-apple #view-applications input[placeholder*="search"]{
          width:100%!important;
          max-width:none!important;
          box-sizing:border-box!important;
        }

        /* Right rail participates in normal page flow; it does not float over content. */
        body.glueful-applications-apple #view-applications>#glueful-applications-workspace-v1{
          grid-column:2!important;
          grid-row:2!important;
          position:static!important;
          top:auto!important;
          right:auto!important;
          left:auto!important;
          width:350px!important;
          max-width:350px!important;
          min-width:0!important;
          margin:0!important;
          padding:0!important;
          display:flex!important;
          flex-direction:column!important;
          align-self:start!important;
          gap:16px!important;
          box-sizing:border-box!important;
        }
        body.glueful-applications-apple #view-applications>#glueful-applications-workspace-v1>*{
          width:100%!important;max-width:none!important;box-sizing:border-box!important;
        }

        /* Stable card geometry. */
        body.glueful-applications-apple #view-applications .application-card,
        body.glueful-applications-apple #view-applications .job-application-card,
        body.glueful-applications-apple #view-applications [class*="application-card"]{
          width:100%!important;
          min-width:0!important;
          min-height:94px!important;
          box-sizing:border-box!important;
        }

        /* Remove historical fixed/sticky controls on the Applications page. */
        body.glueful-applications-apple #view-applications [style*="position: fixed"],
        body.glueful-applications-apple #view-applications [style*="position:fixed"]{
          position:static!important;
        }
      }

      @media(min-width:768px) and (max-width:1279px){
        body.glueful-applications-apple #view-applications{
          position:relative!important;left:auto!important;right:auto!important;transform:none!important;
          width:calc(100vw - 260px)!important;max-width:none!important;min-width:0!important;
          margin:0 0 0 260px!important;padding:26px 26px 48px!important;
          box-sizing:border-box!important;display:block!important;overflow:visible!important;
        }
        body.glueful-applications-apple #view-applications>#glueful-applications-workspace-v1{
          position:static!important;width:100%!important;max-width:none!important;margin:22px 0 0!important;
          display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function sync(){
    const v=document.getElementById('view-applications');
    if(!v)return;
    const active=v.classList.contains('active')||v.style.display==='block';
    if(active){document.body.classList.add('glueful-applications-apple');install();}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
  window.addEventListener('resize',sync,{passive:true});
  document.addEventListener('click',function(){setTimeout(sync,40)},true);
})();
