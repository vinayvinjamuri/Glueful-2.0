/* Glueful — Global Sidebar Typography V1
 * Shared sidebar readability layer. Geometry remains unchanged.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_GLOBAL_SIDEBAR_TYPOGRAPHY_V1__) return;
  window.__GLUEFUL_GLOBAL_SIDEBAR_TYPOGRAPHY_V1__=true;
  const STYLE_ID='glueful-global-sidebar-typography-v1-style';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:768px){
        body #glueful-drawer{font-size:13px!important;}
        body #glueful-drawer a,
        body #glueful-drawer button,
        body #glueful-drawer [role="button"]{font-size:13px!important;}
        body #glueful-drawer a span,
        body #glueful-drawer button span{line-height:1.25!important;}
        body #glueful-drawer a small,
        body #glueful-drawer a .subtitle,
        body #glueful-drawer a .description,
        body #glueful-drawer a [class*="subtitle"],
        body #glueful-drawer a [class*="description"]{
          font-size:11px!important;
          line-height:1.3!important;
          color:#526078!important;
          opacity:1!important;
        }
        body #glueful-drawer a:not(.active){color:#526078!important;}
        body #glueful-drawer a.active{color:#2457d6!important;}
        body #glueful-drawer a.active small,
        body #glueful-drawer a.active .subtitle,
        body #glueful-drawer a.active .description,
        body #glueful-drawer a.active [class*="subtitle"],
        body #glueful-drawer a.active [class*="description"]{color:#334b73!important;}
      }
    `;
    document.head.appendChild(s);
  }
  function start(){install();[100,500,1200,2500].forEach(function(t){setTimeout(install,t);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
