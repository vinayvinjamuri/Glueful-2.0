/* Glueful — Applications Grid V2
 * Structural desktop/tablet composition for the Applications page.
 * Presentation/layout only; application data and existing handlers are preserved.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_GRID_V2__) return;
  window.__GLUEFUL_APPLICATIONS_GRID_V2__=true;

  function active(){
    const view=document.getElementById('view-applications');
    return !!view && (view.classList.contains('active') || view.style.display==='block');
  }

  function mount(){
    const view=document.getElementById('view-applications');
    if(!view || !active()) return;
    const workspace=document.getElementById('glueful-applications-workspace-v1');
    if(!workspace) return;
    let layout=document.getElementById('glueful-applications-layout-v2');
    let main=document.getElementById('glueful-applications-main-v2');
    let rail=document.getElementById('glueful-applications-rail-v2');
    if(!layout){
      layout=document.createElement('div'); layout.id='glueful-applications-layout-v2';
      main=document.createElement('main'); main.id='glueful-applications-main-v2';
      rail=document.createElement('aside'); rail.id='glueful-applications-rail-v2';
      layout.appendChild(main); layout.appendChild(rail);
      const children=Array.from(view.children);
      const header=children.find(el=>el.classList && el.classList.contains('view-header'));
      children.forEach(el=>{if(el===header || el===workspace) return; main.appendChild(el);});
      if(header) view.insertBefore(layout,header.nextSibling); else view.insertBefore(layout,view.firstChild);
      rail.appendChild(workspace);
    } else if(workspace.parentElement!==rail){ rail.appendChild(workspace); }
  }

  function install(){
    const id='glueful-applications-grid-v2-style';
    if(document.getElementById(id)) return;
    const s=document.createElement('style'); s.id=id;
    s.textContent=`
      html,body{background:#f7f7f9!important;color:#16161a!important;}
      @media(min-width:1280px){
        body #view-applications{position:relative!important;left:0!important;width:calc(100vw - 260px)!important;max-width:none!important;min-width:0!important;margin:0 0 0 260px!important;padding:0 32px 48px!important;box-sizing:border-box!important;transform:none!important;overflow:visible!important;height:auto!important;max-height:none!important;}
        body #view-applications .view-header{position:sticky!important;top:0!important;z-index:50!important;width:100%!important;height:72px!important;min-height:72px!important;margin:0 0 24px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:space-between!important;background:#f7f7f9!important;box-sizing:border-box!important;}
        body #view-applications .view-header > button,body #view-applications .view-header > a{position:static!important;top:auto!important;right:auto!important;}
        body #view-applications .view-title{font-size:32px!important;line-height:1.08!important;font-weight:700!important;letter-spacing:-.8px!important;margin:0 0 4px!important;}
        body #view-applications .view-subtitle{font-size:16px!important;line-height:1.4!important;margin:0!important;color:#6b6b76!important;}
        body #glueful-applications-layout-v2{display:grid!important;grid-template-columns:minmax(0,1fr) 320px!important;gap:32px!important;align-items:start!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;box-sizing:border-box!important;}
        body #glueful-applications-main-v2{min-width:0!important;width:min(100%,840px)!important;max-width:840px!important;display:flex!important;flex-direction:column!important;gap:16px!important;}
        body #glueful-applications-main-v2 > *{width:100%!important;max-width:none!important;box-sizing:border-box!important;}
        body #glueful-applications-main-v2 input[type="search"],body #glueful-applications-main-v2 input[placeholder*="Search"],body #glueful-applications-main-v2 input{height:48px!important;min-height:48px!important;border:1px solid #e7e7ea!important;border-radius:12px!important;background:#fff!important;box-sizing:border-box!important;}
        body #glueful-applications-main-v2 .application-card,body #glueful-applications-main-v2 .job-application-card,body #glueful-applications-main-v2 .card{width:100%!important;min-height:88px!important;background:#fff!important;border:1px solid #e7e7ea!important;border-radius:16px!important;box-shadow:0 1px 2px rgba(0,0,0,.03),0 4px 12px rgba(0,0,0,.04)!important;box-sizing:border-box!important;}
        body #glueful-applications-rail-v2{width:320px!important;min-width:320px!important;max-width:320px!important;display:flex!important;flex-direction:column!important;gap:20px!important;align-self:start!important;}
        body #glueful-applications-workspace-v1{position:static!important;top:auto!important;right:auto!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;display:flex!important;flex-direction:column!important;gap:20px!important;box-sizing:border-box!important;z-index:auto!important;}
        body #glueful-applications-workspace-v1 > *{width:100%!important;max-width:none!important;box-sizing:border-box!important;}
        body #glueful-applications-workspace-v1 .gf-insight-card{border-radius:18px!important;border:1px solid #e7e7ea!important;background:#fff!important;box-shadow:0 1px 2px rgba(0,0,0,.03),0 4px 12px rgba(0,0,0,.04)!important;}
        body #glueful-applications-workspace-v1 .gf-progress-card{min-height:150px!important;}
        body #glueful-dashboard-hamburger,body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{display:none!important;visibility:hidden!important;pointer-events:none!important;}
        body #view-applications .glueful-applications-search-progress,body #view-applications .glueful-applications-focus-today,body #view-applications [data-glueful-applications-left-rail]{display:none!important;}
      }
      @media(min-width:768px) and (max-width:1279px){
        body #view-applications{position:relative!important;left:0!important;width:calc(100vw - 260px)!important;max-width:none!important;margin:0 0 0 260px!important;padding:0 24px 40px!important;box-sizing:border-box!important;transform:none!important;overflow:visible!important;}
        body #view-applications .view-header{width:100%!important;height:64px!important;min-height:64px!important;margin:0 0 20px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:space-between!important;box-sizing:border-box!important;}
        body #view-applications .view-header > button,body #view-applications .view-header > a{position:static!important;}
        body #glueful-applications-layout-v2{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:20px!important;width:100%!important;}
        body #glueful-applications-main-v2{width:100%!important;max-width:900px!important;min-width:0!important;display:flex!important;flex-direction:column!important;gap:16px!important;}
        body #glueful-applications-main-v2 > *{width:100%!important;box-sizing:border-box!important;}
        body #glueful-applications-rail-v2{width:100%!important;min-width:0!important;display:block!important;}
        body #glueful-applications-workspace-v1{position:static!important;width:100%!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px!important;}
        body #glueful-applications-workspace-v1 > *{width:100%!important;}
        body #glueful-dashboard-hamburger{display:none!important;}
      }
      @media(max-width:767px){
        body #glueful-applications-layout-v2{display:block!important;}
        body #glueful-applications-main-v2{width:100%!important;display:flex!important;flex-direction:column!important;gap:12px!important;}
        body #glueful-applications-rail-v2{width:100%!important;margin-top:16px!important;}
        body #glueful-applications-workspace-v1{position:static!important;width:100%!important;display:block!important;}
        body #glueful-applications-workspace-v1 > *{width:100%!important;margin-bottom:12px!important;}
      }
    `;
    document.head.appendChild(s);
  }
  function boot(){install();mount();[250,800].forEach(delay=>setTimeout(mount,delay));document.addEventListener('click',()=>setTimeout(mount,0),true);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
