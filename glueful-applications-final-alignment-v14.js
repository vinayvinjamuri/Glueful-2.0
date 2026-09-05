/* Glueful — Applications Final Alignment V14
 * Responsive desktop/tablet layout for the persistent sidebar.
 * Presentation/navigation only; application data and handlers are untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_FINAL_ALIGNMENT_V14__) return;
  window.__GLUEFUL_APPLICATIONS_FINAL_ALIGNMENT_V14__=true;
  function install(){
    const id='glueful-applications-final-alignment-v14-style';
    if(document.getElementById(id)) return;
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`
      @media(min-width:1301px){
        body #view-applications{position:relative!important;left:0!important;width:720px!important;max-width:720px!important;margin-left:570px!important;margin-right:0!important;padding:32px 0 48px!important;box-sizing:border-box!important;overflow:visible!important;height:auto!important;max-height:none!important;transform:none!important;}
        body #view-applications .view-header{position:relative!important;display:flex!important;align-items:flex-start!important;justify-content:space-between!important;width:100%!important;min-height:82px!important;margin:0 0 28px!important;padding:0!important;}
        body #view-applications .view-header > button:first-child,body #view-applications .view-header > [aria-label*="menu" i],body #view-applications .view-header > [title*="menu" i],body #view-applications .view-header > .menu,body #view-applications .view-header > .hamburger,body #view-applications .view-header > .menu-button,body #view-applications .view-header > .hamburger-button,body #glueful-dashboard-hamburger,body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{display:none!important;visibility:hidden!important;pointer-events:none!important;}
        body #view-applications .view-header > button:not(:first-child),body #view-applications .view-header > a{position:fixed!important;top:23px!important;right:290px!important;z-index:1001!important;}
        body #glueful-applications-left-v1{position:fixed!important;top:208px!important;left:239px!important;width:276px!important;display:flex!important;flex-direction:column!important;gap:16px!important;z-index:20!important;}
        body #glueful-applications-workspace-v1{position:fixed!important;top:208px!important;right:28px!important;width:272px!important;display:flex!important;flex-direction:column!important;gap:16px!important;z-index:20!important;}
      }
      @media(min-width:1051px) and (max-width:1300px){
        body #glueful-applications-left-v1{display:none!important;}
        body #view-applications{position:relative!important;left:0!important;width:calc(100% - 574px)!important;max-width:none!important;margin-left:250px!important;margin-right:0!important;padding:28px 0 40px!important;box-sizing:border-box!important;transform:none!important;overflow:visible!important;}
        body #view-applications .view-header{position:relative!important;width:100%!important;min-height:82px!important;margin:0 0 24px!important;padding:0!important;}
        body #view-applications .view-header > button:first-child,body #glueful-dashboard-hamburger,body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{display:none!important;visibility:hidden!important;pointer-events:none!important;}
        body #view-applications .view-header > button:not(:first-child),body #view-applications .view-header > a{position:fixed!important;top:23px!important;right:290px!important;z-index:1001!important;}
        body #glueful-applications-workspace-v1{position:fixed!important;top:208px!important;right:28px!important;width:300px!important;display:flex!important;flex-direction:column!important;gap:16px!important;z-index:20!important;}
      }
      @media(min-width:701px) and (max-width:1050px){
        body #glueful-applications-left-v1,body #glueful-applications-workspace-v1{display:none!important;}
        body #view-applications{position:relative!important;left:0!important;width:calc(100% - 274px)!important;max-width:none!important;margin-left:250px!important;margin-right:24px!important;padding:28px 0 40px!important;box-sizing:border-box!important;transform:none!important;overflow:visible!important;}
        body #view-applications .view-header > button:first-child,body #glueful-dashboard-hamburger,body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{display:none!important;visibility:hidden!important;pointer-events:none!important;}
        body #view-applications .view-header > button:not(:first-child),body #view-applications .view-header > a{position:fixed!important;top:23px!important;right:24px!important;z-index:1001!important;}
      }
      @media(max-width:700px){body #view-applications .view-header > button:first-child{display:block!important;}}
    `;
    document.head.appendChild(s);
  }
  function resetScroll(){try{history.scrollRestoration='manual';const view=document.getElementById('view-applications');const roots=[document.scrollingElement,document.documentElement,document.body,view];for(const el of roots){if(el)el.scrollTop=0;}window.scrollTo(0,0);}catch(e){try{window.scrollTo(0,0);}catch(ignore){}}}
  function start(){install();resetScroll();requestAnimationFrame(()=>{resetScroll();setTimeout(resetScroll,100);setTimeout(resetScroll,400);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
