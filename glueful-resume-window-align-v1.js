/* Glueful — Resume window alignment V1
 * Resume view only. The page shell/sidebar/navigation are untouched.
 * Uses the actual #view-resumes DOM id and aligns only the resume content canvas.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUME_WINDOW_ALIGN_V1__) return;
  window.__GLUEFUL_RESUME_WINDOW_ALIGN_V1__=true;

  const STYLE_ID='glueful-resume-window-align-v1-style';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1280px){
        body #view-resumes{
          position:fixed!important;
          left:260px!important;right:0!important;top:0!important;bottom:0!important;
          width:auto!important;height:100vh!important;min-height:100vh!important;
          margin:0!important;padding:20px 32px 48px!important;
          box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;
          transform:none!important;background:#f7f8fb!important;
        }
        body #view-resumes > *:not(.glueful-resumes-reference-shell){
          box-sizing:border-box!important;
        }
        body #view-resumes .glueful-resumes-reference-shell{
          width:min(1080px,100%)!important;
          min-width:0!important;
          max-width:1080px!important;
          margin:0 auto!important;
          padding-top:0!important;
        }
        body #view-resumes .glueful-resumes-reference-top{
          width:100%!important;height:58px!important;margin:0 0 30px!important;
          box-sizing:border-box!important;
        }
        body #view-resumes .glueful-resumes-title-row{
          width:100%!important;margin:0 0 22px!important;
          box-sizing:border-box!important;
        }
        body #view-resumes .glueful-resumes-card{
          width:100%!important;margin:0!important;box-sizing:border-box!important;
        }
      }
      @media(min-width:768px) and (max-width:1279px){
        body #view-resumes{
          margin-left:260px!important;
          width:calc(100vw - 260px)!important;
          box-sizing:border-box!important;
          padding:20px 26px 40px!important;
          background:#f7f8fb!important;
        }
        body #view-resumes .glueful-resumes-reference-shell{
          width:100%!important;max-width:900px!important;min-width:0!important;margin:0 auto!important;
        }
      }
      @media(max-width:767px){
        body #view-resumes{
          width:100%!important;margin:0!important;padding:18px!important;
          box-sizing:border-box!important;background:#f7f8fb!important;
        }
        body #view-resumes .glueful-resumes-reference-shell{width:100%!important;min-width:0!important;max-width:none!important;margin:0!important;}
      }
    `;
    (document.head||document.documentElement).appendChild(s);
  }
  function boot(){
    if(!document.getElementById('view-resumes')) return;
    install();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  setTimeout(boot,300);
  setTimeout(boot,1200);
})();
