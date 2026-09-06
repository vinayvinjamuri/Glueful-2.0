/* Glueful — Applications Main Column Authoritative V4
 * Main Applications column only.
 * The existing 260px sidebar is intentionally untouched.
 * Existing data, controls, navigation and handlers are preserved.
 * V4 fix: #view-applications already lives in the post-sidebar shell,
 * so it must NOT receive a second 260px left margin.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_REFERENCE_AUTHORITATIVE_V4__)return;
  window.__GLUEFUL_APPLICATIONS_REFERENCE_AUTHORITATIVE_V4__=true;

  const STYLE_ID='glueful-applications-reference-authoritative-v4-style';

  function install(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1280px){
        html,body{overflow-x:hidden!important;}

        /* ONLY the Applications view is being sized here.
           The parent shell already starts after the fixed 260px sidebar. */
        body.glueful-applications-apple #view-applications{
          position:relative!important;
          left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
          transform:none!important;
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          min-width:0!important;
          min-height:100vh!important;
          margin:0!important;
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
          max-width:none!important;
          min-width:0!important;
          min-height:72px!important;
          margin:0!important;
          padding:0!important;
          display:flex!important;
          align-items:flex-start!important;
          justify-content:space-between!important;
          gap:22px!important;
          box-sizing:border-box!important;
        }

        body.glueful-applications-apple #view-applications>.view-header>button,
        body.glueful-applications-apple #view-applications>.view-header>a{
          position:static!important;
          inset:auto!important;
          transform:none!important;
          margin:0!important;
          flex:0 0 auto!important;
        }

        body.glueful-applications-apple #view-applications>:not(.view-header):not(#glueful-applications-workspace-v1){
          grid-column:1!important;
          grid-row:auto!important;
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin-left:0!important;
          margin-right:0!important;
          transform:none!important;
          box-sizing:border-box!important;
        }

        body.glueful-applications-apple #view-applications input[type="search"],
        body.glueful-applications-apple #view-applications input[placeholder*="Search"],
        body.glueful-applications-apple #view-applications input[placeholder*="search"]{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          box-sizing:border-box!important;
        }

        body.glueful-applications-apple #view-applications .application-card,
        body.glueful-applications-apple #view-applications .job-application-card,
        body.glueful-applications-apple #view-applications [class*="application-card"]{
          width:100%!important;
          min-width:0!important;
          min-height:94px!important;
          box-sizing:border-box!important;
        }

        /* Right rail belongs to Applications only; it does not alter the sidebar. */
        body.glueful-applications-apple #view-applications>#glueful-applications-workspace-v1{
          grid-column:2!important;
          grid-row:2!important;
          position:static!important;
          top:auto!important;
          right:auto!important;
          left:auto!important;
          width:350px!important;
          max-width:350px!important;
          min-width:350px!important;
          margin:0!important;
          padding:0!important;
          display:flex!important;
          flex-direction:column!important;
          align-self:start!important;
          gap:16px!important;
          box-sizing:border-box!important;
          visibility:visible!important;
          opacity:1!important;
        }

        body.glueful-applications-apple #view-applications>#glueful-applications-workspace-v1>*{
          width:100%!important;
          max-width:none!important;
          box-sizing:border-box!important;
        }

        body.glueful-applications-apple #view-applications [style*="position: fixed"],
        body.glueful-applications-apple #view-applications [style*="position:fixed"]{
          position:static!important;
        }
      }

      @media(min-width:768px) and (max-width:1279px){
        body.glueful-applications-apple #view-applications{
          position:relative!important;
          left:auto!important;right:auto!important;
          transform:none!important;
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          min-width:0!important;
          margin:0!important;
          padding:26px 26px 48px!important;
          box-sizing:border-box!important;
        }
        body.glueful-applications-apple #view-applications>*{
          box-sizing:border-box!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function normalize(){
    const view=document.getElementById('view-applications');
    if(!view)return;
    const active=view.classList.contains('active')||view.style.display==='block';
    if(!active)return;
    document.body.classList.add('glueful-applications-apple');
    install();
    [...view.children].forEach(function(el){
      if(el.id==='glueful-applications-workspace-v1'||el.classList.contains('view-header'))return;
      el.style.setProperty('width','100%','important');
      el.style.setProperty('max-width','none','important');
      el.style.setProperty('min-width','0','important');
      el.style.setProperty('margin-left','0','important');
      el.style.setProperty('margin-right','0','important');
      el.style.setProperty('transform','none','important');
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalize,{once:true});
  else normalize();
  [120,500,1200,2200].forEach(function(t){setTimeout(normalize,t);});
  window.addEventListener('resize',normalize,{passive:true});
  document.addEventListener('click',function(){setTimeout(normalize,50);},true);
})();
