/* Glueful — Resumes reference empty-state V1
 * Resume-window only. Does not touch sidebar or any other application view.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUMES_REFERENCE_EMPTY_V1__) return;
  window.__GLUEFUL_RESUMES_REFERENCE_EMPTY_V1__=true;

  function boot(){
    const view=document.getElementById('view-resumes');
    if(!view) return;

    const styleId='glueful-resumes-reference-empty-style';
    if(!document.getElementById(styleId)){
      const style=document.createElement('style');
      style.id=styleId;
      style.textContent=`
        @media(min-width:1280px){
          body #view-resumes{
            position:fixed!important;
            left:260px!important;right:0!important;top:0!important;bottom:0!important;
            width:auto!important;height:100vh!important;min-height:100vh!important;
            margin:0!important;padding:0 32px 48px!important;box-sizing:border-box!important;
            overflow-x:hidden!important;overflow-y:auto!important;
            background:#f7f8fb!important;color:#141826!important;
          }
          body #view-resumes .glueful-resumes-reference-shell{
            width:min(878px,calc(100% - 510px))!important;
            min-width:700px!important;
            margin:0 auto!important;
            padding-top:20px!important;
          }
        }
        @media(min-width:768px) and (max-width:1279px){
          body #view-resumes{
            margin-left:260px!important;width:calc(100vw - 260px)!important;
            box-sizing:border-box!important;padding:20px 26px 40px!important;
            background:#f7f8fb!important;color:#141826!important;
          }
          body #view-resumes .glueful-resumes-reference-shell{max-width:900px!important;margin:0 auto!important;}
        }
        @media(max-width:767px){
          body #view-resumes{
            background:#f7f8fb!important;color:#141826!important;
            padding:18px!important;box-sizing:border-box!important;
          }
        }
        body #view-resumes .glueful-resumes-reference-top{
          display:flex!important;align-items:center!important;justify-content:space-between!important;
          height:58px!important;margin-bottom:48px!important;
        }
        body #view-resumes .glueful-resumes-brand{
          display:flex!important;align-items:center!important;gap:10px!important;
        }
        body #view-resumes .glueful-resumes-brand img{
          width:38px!important;height:38px!important;border-radius:10px!important;object-fit:cover!important;
          box-shadow:0 2px 8px rgba(35,36,80,.16)!important;
        }
        body #view-resumes .glueful-resumes-brand-name{
          font:700 21px/1.05 Inter,system-ui,sans-serif!important;color:#111827!important;
        }
        body #view-resumes .glueful-resumes-brand-date{
          margin-top:3px!important;font:500 11px/1 Inter,system-ui,sans-serif!important;color:#8790a3!important;
        }
        body #view-resumes .glueful-resumes-profile{
          width:40px!important;height:40px!important;border-radius:50%!important;
          display:flex!important;align-items:center!important;justify-content:center!important;
          background:#171d29!important;color:#fff!important;font-size:18px!important;
        }
        body #view-resumes .glueful-resumes-title-row{
          display:flex!important;align-items:flex-start!important;justify-content:space-between!important;
          gap:20px!important;margin-bottom:28px!important;
        }
        body #view-resumes .glueful-resumes-title{
          margin:0!important;font:760 34px/1.08 Inter,system-ui,sans-serif!important;
          letter-spacing:-1.1px!important;color:#111827!important;
        }
        body #view-resumes .glueful-resumes-subtitle{
          margin:7px 0 0!important;font:500 15px/1.35 Inter,system-ui,sans-serif!important;color:#68738a!important;
        }
        body #view-resumes .glueful-resumes-add{
          border:0!important;border-radius:9px!important;padding:11px 18px!important;
          display:inline-flex!important;align-items:center!important;gap:9px!important;
          background:linear-gradient(135deg,#5364ef,#3d6df2)!important;color:#fff!important;
          font:700 14px/1 Inter,system-ui,sans-serif!important;cursor:pointer!important;
          box-shadow:0 5px 14px rgba(67,89,235,.20)!important;
        }
        body #view-resumes .glueful-resumes-card{
          border:1px solid #e4e7ef!important;border-radius:14px!important;background:#fff!important;
          padding:12px!important;box-shadow:0 1px 2px rgba(20,24,38,.02)!important;
        }
        body #view-resumes .glueful-resumes-empty{
          min-height:340px!important;border:1px dashed #aeb5c2!important;border-radius:10px!important;
          display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;
          text-align:center!important;background:#fff!important;
        }
        body #view-resumes .glueful-resumes-file-icon{
          width:62px!important;height:62px!important;border-radius:50%!important;
          display:flex!important;align-items:center!important;justify-content:center!important;
          background:#eef0ff!important;color:#4961e9!important;font-size:28px!important;margin-bottom:17px!important;
        }
        body #view-resumes .glueful-resumes-empty-title{
          margin:0!important;font:650 20px/1.2 Inter,system-ui,sans-serif!important;color:#69738a!important;
        }
        body #view-resumes .glueful-resumes-empty-copy{
          margin:7px 0 21px!important;font:500 14px/1.4 Inter,system-ui,sans-serif!important;color:#7d879b!important;
        }
        body #view-resumes .glueful-resumes-empty-add{padding:12px 24px!important;font-size:14px!important;}
        @media(max-width:767px){
          body #view-resumes .glueful-resumes-reference-shell{width:100%!important;min-width:0!important;}
          body #view-resumes .glueful-resumes-top{margin-bottom:30px!important;}
          body #view-resumes .glueful-resumes-title-row{flex-direction:column!important;}
          body #view-resumes .glueful-resumes-add{align-self:flex-start!important;}
        }
      `;
      (document.head||document.documentElement).appendChild(style);
    }

    // Only replace the resume view when it contains no actual resume items.
    // Existing resume data/editor elements are left intact.
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