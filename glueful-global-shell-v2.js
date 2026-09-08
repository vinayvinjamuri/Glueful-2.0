/* Glueful Global Shell V2 — one sidebar + one type scale across desktop sections. */
(function(){
'use strict';
if(window.__GLUEFUL_GLOBAL_SHELL_V2__)return;
window.__GLUEFUL_GLOBAL_SHELL_V2__=true;
const STYLE_ID='glueful-global-shell-v2-style';
function install(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;
  s.textContent=`
    :root{
      --glueful-sidebar-width:248px;
      --glueful-page-title:28px;
      --glueful-page-subtitle:13px;
      --glueful-section-heading:16px;
      --glueful-card-title:13px;
      --glueful-body:12px;
      --glueful-meta:11px;
      --glueful-button:12px;
    }
    @media(min-width:1101px){
      body #glueful-drawer,
      body .sidebar,
      body .side-nav,
      body .app-sidebar{
        width:var(--glueful-sidebar-width)!important;
        min-width:var(--glueful-sidebar-width)!important;
        max-width:var(--glueful-sidebar-width)!important;
        box-sizing:border-box!important;
      }
      body #glueful-drawer{
        left:0!important;right:auto!important;
        border-right:1px solid #e6e8ee!important;
      }
      body #glueful-drawer .nav-item,
      body #glueful-drawer .drawer-item,
      body #glueful-drawer .sidebar-item,
      body .sidebar .nav-item,
      body .side-nav .nav-item,
      body .app-sidebar .nav-item{
        font-size:13px!important;
        line-height:1.25!important;
      }
      body #glueful-drawer small,
      body #glueful-drawer .subtitle,
      body #glueful-drawer .nav-subtitle,
      body #glueful-drawer .description,
      body .sidebar small,
      body .side-nav small,
      body .app-sidebar small{
        font-size:11px!important;
        line-height:1.25!important;
      }
      body .view-title,
      body .page-title,
      body h1.view-title,
      body h1.page-title{
        font-size:28px!important;
        line-height:1.12!important;
        letter-spacing:-.02em!important;
      }
      body .view-subtitle,
      body .page-subtitle{
        font-size:13px!important;
        line-height:1.45!important;
      }
      body .section-title,
      body .view-section-title,
      body .card-title{
        font-size:16px!important;
        line-height:1.3!important;
      }
      body button,
      body .button,
      body [role="button"]{
        font-size:var(--glueful-button);
      }
    }
    @media(min-width:768px){
      body:not(.glueful-mobile) #glueful-drawer,
      body:not(.glueful-mobile) .sidebar,
      body:not(.glueful-mobile) .side-nav,
      body:not(.glueful-mobile) .app-sidebar{
        box-sizing:border-box!important;
      }
    }
  `;
  (document.head||document.documentElement).appendChild(s);
}
function start(){install();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();