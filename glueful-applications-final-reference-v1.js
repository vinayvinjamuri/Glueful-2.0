/* Glueful — Applications Final Reference Override V1
 * Final desktop geometry for the supplied reference screenshot.
 * This is intentionally loaded last in the Applications feature group so
 * older right-rail/grid presentation layers cannot win the cascade.
 */
(function(){
  'use strict';
  const STYLE_ID='glueful-applications-final-reference-v1-style';
  function install(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1280px){
        html,body{overflow-x:hidden!important;}
        body #view-applications{
          position:fixed!important;left:260px!important;right:0!important;top:0!important;bottom:0!important;
          width:auto!important;height:100vh!important;min-height:100vh!important;margin:0!important;
          padding:26px 32px 52px!important;box-sizing:border-box!important;display:block!important;
          overflow-x:hidden!important;overflow-y:auto!important;transform:none!important;
        }
        body #view-applications>.view-header{
          width:952px!important;max-width:952px!important;min-width:0!important;
          margin:0 0 0 383px!important;padding:0!important;min-height:72px!important;
          display:flex!important;align-items:flex-start!important;justify-content:space-between!important;
          gap:22px!important;box-sizing:border-box!important;
        }
        body #view-applications>.view-header>button,body #view-applications>.view-header>a{
          position:static!important;inset:auto!important;transform:none!important;margin:0!important;flex:0 0 auto!important;
        }
        body #view-applications>#glueful-applications-rail-v2,
        body #view-applications>#glueful-applications-workspace-v1{
          position:absolute!important;left:12px!important;right:auto!important;top:22px!important;
          width:370px!important;max-width:370px!important;min-width:370px!important;
          margin:0!important;padding:0!important;box-sizing:border-box!important;
          display:flex!important;flex-direction:column!important;gap:16px!important;
          z-index:1000!important;visibility:visible!important;opacity:1!important;
        }
        body #view-applications>#glueful-applications-rail-v2>#glueful-applications-workspace-v1{
          position:static!important;left:auto!important;right:auto!important;top:auto!important;
          width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding:0!important;
          display:flex!important;flex-direction:column!important;gap:16px!important;box-sizing:border-box!important;
        }
        body #view-applications>#glueful-applications-rail-v2>* ,
        body #view-applications>#glueful-applications-workspace-v1>*{
          width:100%!important;max-width:370px!important;box-sizing:border-box!important;
        }
        body #view-applications>:not(.view-header):not(#glueful-applications-rail-v2):not(#glueful-applications-workspace-v1){
          width:952px!important;max-width:952px!important;min-width:0!important;
          margin-left:383px!important;margin-right:0!important;box-sizing:border-box!important;
          transform:none!important;
        }
        body #view-applications input[type="search"],
        body #view-applications input[placeholder*="Search"],
        body #view-applications input[placeholder*="search"]{
          width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important;
        }
        body #view-applications .application-card,
        body #view-applications .job-application-card,
        body #view-applications [class*="application-card"]{
          width:100%!important;max-width:none!important;min-width:0!important;min-height:94px!important;
          box-sizing:border-box!important;
        }
      }
      @media(min-width:768px) and (max-width:1279px){
        body #view-applications>#glueful-applications-rail-v2,body #view-applications>#glueful-applications-workspace-v1{display:none!important;}
        body #view-applications{width:calc(100vw - 260px)!important;margin:0!important;padding:26px!important;box-sizing:border-box!important;}
      }
      @media(max-width:767px){
        body #view-applications>#glueful-applications-rail-v2,body #view-applications>#glueful-applications-workspace-v1{display:none!important;}
      }
    `;
    document.head.appendChild(s);
  }
  function sync(){
    const v=document.getElementById('view-applications');
    if(!v)return;
    if(v.classList.contains('active')||v.style.display==='block')install();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
  [100,500,1200,2500,4000].forEach(t=>setTimeout(sync,t));
  window.addEventListener('resize',sync,{passive:true});
})();