/* Glueful — Applications Layout Spec V1
 * Implements the approved Applications page composition as one responsive layout.
 * Presentation/layout only; application data and existing handlers are preserved.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_LAYOUT_SPEC_V1__) return;
  window.__GLUEFUL_APPLICATIONS_LAYOUT_SPEC_V1__=true;

  const STYLE_ID='glueful-applications-layout-spec-v1-style';
  const WRAP_ID='glueful-applications-main-column-v1';

  function active(){
    const v=document.getElementById('view-applications');
    return !!v && (v.classList.contains('active') || v.style.display==='block');
  }

  function structure(){
    const view=document.getElementById('view-applications');
    const rail=document.getElementById('glueful-applications-workspace-v1');
    if(!view || !rail || document.getElementById(WRAP_ID)) return;

    const main=document.createElement('main');
    main.id=WRAP_ID;
    main.setAttribute('data-glueful-applications-main','true');
    const children=Array.from(view.children);
    children.forEach(el=>{
      if(el!==rail) main.appendChild(el);
    });
    view.appendChild(main);
    main.parentNode.appendChild(rail);
  }

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      html,body{background:#F7F7F9!important;color:#16161A!important;}

      @media(min-width:1280px){
        body #view-applications{
          position:relative!important;
          display:grid!important;
          grid-template-columns:minmax(0,1fr) 320px!important;
          column-gap:32px!important;
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          min-width:0!important;
          margin:0 0 0 260px!important;
          padding:24px 32px 48px!important;
          box-sizing:border-box!important;
          transform:none!important;
          left:auto!important;
          overflow:visible!important;
          height:auto!important;
          max-height:none!important;
        }
        body #glueful-applications-main-column-v1{
          grid-column:1!important;
          width:100%!important;
          max-width:840px!important;
          min-width:0!important;
          margin:0!important;
          padding:0!important;
          box-sizing:border-box!important;
        }
        body #glueful-applications-workspace-v1{
          grid-column:2!important;
          grid-row:1!important;
          position:static!important;
          width:320px!important;
          max-width:320px!important;
          margin:0!important;
          padding:0!important;
          display:flex!important;
          flex-direction:column!important;
          gap:20px!important;
          align-self:start!important;
          box-sizing:border-box!important;
          z-index:2!important;
        }
        body #glueful-applications-workspace-v1 > *{width:100%!important;max-width:none!important;box-sizing:border-box!important;}
        body #view-applications .view-header{
          position:relative!important;
          display:flex!important;
          align-items:flex-start!important;
          justify-content:space-between!important;
          width:100%!important;
          min-height:72px!important;
          margin:0 0 24px!important;
          padding:0!important;
          box-sizing:border-box!important;
        }
        body #view-applications .view-title{font-size:34px!important;line-height:1.08!important;font-weight:700!important;letter-spacing:-1px!important;margin:0 0 5px!important;}
        body #view-applications .view-subtitle{font-size:16px!important;line-height:1.4!important;margin:0!important;color:#6B6B76!important;}
        body #view-applications .view-header > button,
        body #view-applications .view-header > a{position:fixed!important;top:24px!important;right:352px!important;z-index:1001!important;margin:0!important;}

        body #view-applications input[type="search"],
        body #view-applications input:not([type]),
        body #view-applications input[type="text"]{
          width:100%!important;height:48px!important;min-height:48px!important;
          border:1px solid #E7E7EA!important;border-radius:12px!important;background:#fff!important;
          box-sizing:border-box!important;padding:0 16px!important;font-size:15px!important;color:#16161A!important;
        }
        body #view-applications .application-card,
        body #view-applications .job-application-card,
        body #view-applications .card{
          width:100%!important;min-height:92px!important;box-sizing:border-box!important;
          background:#fff!important;color:#16161A!important;border:1px solid #E7E7EA!important;
          border-radius:16px!important;box-shadow:0 1px 2px rgba(0,0,0,.03),0 4px 12px rgba(0,0,0,.04)!important;
        }
        body #glueful-applications-left-v1,
        body #view-applications .glueful-applications-search-progress,
        body #view-applications .glueful-applications-focus-today,
        body #view-applications [data-glueful-applications-left-rail]{display:none!important;}
      }

      @media(min-width:768px) and (max-width:1279px){
        body #view-applications{
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          min-width:0!important;
          margin:0 0 0 260px!important;
          padding:24px 24px 40px!important;
          box-sizing:border-box!important;
          transform:none!important;
          left:auto!important;
          overflow:visible!important;
        }
        body #view-applications .view-header{margin:0 0 24px!important;min-height:64px!important;}
        body #view-applications .view-title{font-size:30px!important;}
        body #glueful-applications-workspace-v1{position:static!important;width:100%!important;max-width:none!important;margin-top:20px!important;display:flex!important;flex-direction:column!important;gap:16px!important;}
      }

      @media(max-width:767px){
        body #view-applications{width:100%!important;margin:0!important;padding:16px 12px 96px!important;box-sizing:border-box!important;left:auto!important;transform:none!important;}
        body #glueful-applications-workspace-v1{display:none!important;}
      }
    `;
    document.head.appendChild(s);
  }

  function boot(){
    install();
    if(!active()) return;
    structure();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  document.addEventListener('click',()=>setTimeout(boot,0),true);
  window.addEventListener('popstate',()=>setTimeout(boot,0));
  window.addEventListener('hashchange',()=>setTimeout(boot,0));
})();
