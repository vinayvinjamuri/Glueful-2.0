/* Glueful — Global shell and typography standard V1
 * One desktop sidebar size and one typography scale across sections.
 * Visual-only: does not change navigation or feature behavior.
 */
(function(){
'use strict';
if(window.__GLUEFUL_GLOBAL_SHELL_STANDARD_V1__)return;
window.__GLUEFUL_GLOBAL_SHELL_STANDARD_V1__=true;
const STYLE_ID='glueful-global-shell-standard-v1';
function install(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
/* Global desktop shell */
@media (min-width:1101px){
  body.glueful-premium-ui .sidebar,
  body.glueful-premium-ui .side-nav,
  body.glueful-premium-ui .app-sidebar,
  .sidebar,
  .side-nav,
  .app-sidebar{
    width:248px!important;
    min-width:248px!important;
    max-width:248px!important;
    box-sizing:border-box!important;
  }
  body.glueful-premium-ui #view-dashboard,
  body.glueful-premium-ui #view-jobs,
  body.glueful-premium-ui #view-applications,
  body.glueful-premium-ui #view-interviews,
  body.glueful-premium-ui #view-profile,
  body.glueful-premium-ui #view-saved-jobs,
  body.glueful-premium-ui #view-settings{
    margin-left:278px!important;
    margin-right:30px!important;
    width:calc(100vw - 308px)!important;
    max-width:none!important;
    box-sizing:border-box!important;
  }
}

/* One Glueful typography scale */
body.glueful-premium-ui{
  font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
  -webkit-font-smoothing:antialiased!important;
}
body.glueful-premium-ui .sidebar,
body.glueful-premium-ui .side-nav,
body.glueful-premium-ui .app-sidebar{
  font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
}
body.glueful-premium-ui .sidebar a,
body.glueful-premium-ui .side-nav a,
body.glueful-premium-ui .app-sidebar a,
body.glueful-premium-ui .sidebar button,
body.glueful-premium-ui .side-nav button,
body.glueful-premium-ui .app-sidebar button{
  font-family:inherit!important;
}

/* Main section hierarchy: identical across Dashboard / Applications / Interviews / Jobs */
body.glueful-premium-ui #view-dashboard .view-title,
body.glueful-premium-ui #view-jobs .view-title,
body.glueful-premium-ui #view-applications .view-title,
body.glueful-premium-ui #view-interviews .view-title,
body.glueful-premium-ui #view-profile .view-title,
body.glueful-premium-ui #view-saved-jobs .view-title,
body.glueful-premium-ui #view-settings .view-title,
body.glueful-premium-ui #view-dashboard h1,
body.glueful-premium-ui #view-jobs h1,
body.glueful-premium-ui #view-applications h1,
body.glueful-premium-ui #view-interviews h1{
  font-size:28px!important;
  line-height:1.15!important;
  font-weight:750!important;
  letter-spacing:-.035em!important;
  margin-bottom:6px!important;
}
body.glueful-premium-ui #view-dashboard .view-subtitle,
body.glueful-premium-ui #view-jobs .view-subtitle,
body.glueful-premium-ui #view-applications .view-subtitle,
body.glueful-premium-ui #view-interviews .view-subtitle,
body.glueful-premium-ui #view-profile .view-subtitle,
body.glueful-premium-ui #view-saved-jobs .view-subtitle,
body.glueful-premium-ui #view-settings .view-subtitle{
  font-size:13px!important;
  line-height:1.4!important;
}

/* Sidebar scale */
body.glueful-premium-ui .sidebar .nav-item,
body.glueful-premium-ui .side-nav .nav-item,
body.glueful-premium-ui .app-sidebar .nav-item{
  min-height:58px!important;
}
body.glueful-premium-ui .sidebar .nav-item .title,
body.glueful-premium-ui .sidebar .nav-item .label,
body.glueful-premium-ui .side-nav .nav-item .title,
body.glueful-premium-ui .side-nav .nav-item .label,
body.glueful-premium-ui .app-sidebar .nav-item .title,
body.glueful-premium-ui .app-sidebar .nav-item .label{
  font-size:13px!important;
  line-height:1.2!important;
  font-weight:650!important;
}
body.glueful-premium-ui .sidebar .nav-item small,
body.glueful-premium-ui .sidebar .nav-item .description,
body.glueful-premium-ui .side-nav .nav-item small,
body.glueful-premium-ui .side-nav .nav-item .description,
body.glueful-premium-ui .app-sidebar .nav-item small,
body.glueful-premium-ui .app-sidebar .nav-item .description{
  font-size:11px!important;
  line-height:1.25!important;
}

/* Common content scale */
body.glueful-premium-ui #view-dashboard .card h2,
body.glueful-premium-ui #view-jobs .card h2,
body.glueful-premium-ui #view-applications .card h2,
body.glueful-premium-ui #view-interviews .card h2,
body.glueful-premium-ui #view-dashboard .section-title,
body.glueful-premium-ui #view-jobs .section-title,
body.glueful-premium-ui #view-applications .section-title,
body.glueful-premium-ui #view-interviews .section-title{
  font-size:16px!important;
  line-height:1.25!important;
}
body.glueful-premium-ui #view-dashboard p,
body.glueful-premium-ui #view-jobs p,
body.glueful-premium-ui #view-applications p,
body.glueful-premium-ui #view-interviews p,
body.glueful-premium-ui #view-dashboard td,
body.glueful-premium-ui #view-jobs td,
body.glueful-premium-ui #view-applications td,
body.glueful-premium-ui #view-interviews td{
  font-size:12px;
  line-height:1.45;
}
body.glueful-premium-ui #view-dashboard button,
body.glueful-premium-ui #view-jobs button,
body.glueful-premium-ui #view-applications button,
body.glueful-premium-ui #view-interviews button{
  font-size:12px;
}
@media(max-width:1100px){
  body.glueful-premium-ui #view-dashboard .view-title,
  body.glueful-premium-ui #view-jobs .view-title,
  body.glueful-premium-ui #view-applications .view-title,
  body.glueful-premium-ui #view-interviews .view-title,
  body.glueful-premium-ui #view-dashboard h1,
  body.glueful-premium-ui #view-jobs h1,
  body.glueful-premium-ui #view-applications h1,
  body.glueful-premium-ui #view-interviews h1{font-size:26px!important}
}
`;
  (document.head||document.documentElement).appendChild(s);
}
function start(){install()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.gluefulGlobalShellStandard={install};
})();