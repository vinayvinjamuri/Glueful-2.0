/* Glueful — Resumes reference empty-state V2
 * Resume-window only. Uses the existing resume window/data and fixes its
 * desktop geometry. Does not touch sidebar or any other application view.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUMES_REFERENCE_EMPTY_V2__) return;
  window.__GLUEFUL_RESUMES_REFERENCE_EMPTY_V2__=true;

  function boot(){
    const view=document.getElementById('view-resumes');
    if(!view) return;

    const styleId='glueful-resumes-reference-empty-style-v2';
    if(!document.getElementById(styleId)){
      const style=document.createElement('style');
      style.id=styleId;
      style.textContent=`
        /* Resume view only: the sidebar is already persistent at 260px. */
        @media(min-width:1280px){
          body #view-resumes{
            display:block!important;
            position:fixed!important;
            left:260px!important;right:0!important;top:0!important;bottom:0!important;
            width:calc(100vw - 260px)!important;height:100vh!important;min-height:100vh!important;
            margin:0!important;padding:0 32px 48px!important;box-sizing:border-box!important;
            overflow-x:hidden!important;overflow-y:auto!important;transform:none!important;
            background:#f7f8fb!important;color:#141826!important;
          }
          body #view-resumes .glueful-resumes-reference-shell{
            display:block!important;
            width:100%!important;max-width:none!important;min-width:0!important;
            margin:0!important;padding:20px 0 0!important;box-sizing:border-box!important;
          }
          body #view-resumes .glueful-resumes-reference-top,
          body #view-resumes .glueful-resumes-title-row,
          body #view-resumes .glueful-resumes-card{
            width:100%!important;max-width:none!important;box-sizing:border-box!important;
          }
          body #view-resumes .glueful-resumes-reference-top{
            height:58px!important;margin:0 0 30px!important;
          }
          body #view-resumes .glueful-resumes-title-row{
            margin:0 0 22px!important;
          }
        }

        @media(min-width:768px) and (max-width:1279px){
          body #view-resumes{
            display:block!important;
            margin-left:260px!important;width:calc(100vw - 260px)!important;
            box-sizing:border-box!important;padding:20px 26px 40px!important;
            background:#f7f8fb!important;color:#141826!important;
          }
          body #view-resumes .glueful-resumes-reference-shell{
            width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;
          }
        }

        @media(max-width:767px){
          body #view-resumes{
            display:block!important;width:100%!important;margin:0!important;
            padding:18px!important;box-sizing:border-box!important;
            background:#f7f8fb!important;color:#141826!important;
          }
          body #view-resumes .glueful-resumes-reference-shell{
            width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;
          }
        }
      `;
      (document.head||document.documentElement).appendChild(style);
    }

    /* Never rebuild a populated Resume view. Existing resume data/editor stays intact. */
    const hasResumeData=!!view.querySelector('[data-resume-id],.resume-card,.resume-item,.company-card,[class*="resume-card"],[class*="resume-item"]');
    if(hasResumeData) return;
    if(view.querySelector('.glueful-resumes-reference-shell')) return;

    const originalInput=document.getElementById('cp-resume-file');
    const originalLabel=document.querySelector('label[for="cp-resume-file"]');
    const openUpload=function(){
      if(originalInput){originalInput.click();return;}
      if(originalLabel){originalLabel.click();return;}
      const fn=window.handleCandidateResumeUpload;
      if(typeof fn==='function') fn();
    };

    const shell=document.createElement('div');
    shell.className='glueful-resumes-reference-shell';
    shell.innerHTML=`
      <div class="glueful-resumes-reference-top">
        <div class="glueful-resumes-brand">
          <img src="./icons/icon-192.png" alt="Glueful">
          <div>
            <div class="glueful-resumes-brand-name">Glueful</div>
            <div class="glueful-resumes-brand-date">${new Date().toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})}</div>
          </div>
        </div>
        <div class="glueful-resumes-profile" aria-label="Profile">♙</div>
      </div>
      <div class="glueful-resumes-title-row">
        <div>
          <h1 class="glueful-resumes-title">Resumes</h1>
          <p class="glueful-resumes-subtitle">Manage your resume library</p>
        </div>
        <button type="button" class="glueful-resumes-add">＋&nbsp; Add Resume</button>
      </div>
      <div class="glueful-resumes-card">
        <div class="glueful-resumes-empty">
          <div class="glueful-resumes-file-icon">♧</div>
          <h2 class="glueful-resumes-empty-title">No resumes yet.</h2>
          <p class="glueful-resumes-empty-copy">Upload your first resume to get started.</p>
          <button type="button" class="glueful-resumes-add glueful-resumes-empty-add">＋&nbsp; Add Your Resume</button>
        </div>
      </div>
    `;
    view.replaceChildren(shell);
    shell.querySelectorAll('.glueful-resumes-add').forEach(function(button){button.addEventListener('click',openUpload)});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  setTimeout(boot,400);
  setTimeout(boot,1200);
})();