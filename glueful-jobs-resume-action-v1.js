/* Glueful Jobs Resume Action V5
 * Passes the selected job object directly into Resume Studio.
 * This removes the fragile cross-runtime findActiveJobById dependency.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_RESUME_ACTION_V5__) return;
  window.__GLUEFUL_JOBS_RESUME_ACTION_V5__=true;

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const title=j=>clean(j?.title||j?.job_title||j?.position||'');
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'');
  const getJobs=()=>{
    try{
      if(typeof window.gluefulJobsV15?.getJobs==='function'){
        const list=window.gluefulJobsV15.getJobs();
        if(Array.isArray(list)&&list.length)return list;
      }
    }catch(_){}
    try{
      if(typeof window.getActiveJobData==='function'){
        const list=window.getActiveJobData();
        if(Array.isArray(list)&&list.length)return list;
      }
    }catch(_){}
    return [];
  };

  function findJobFromDetail(panel){
    const root=panel?.querySelector?.('.g15-detail')||panel;
    const t=clean(root?.querySelector?.('h1')?.textContent||'');
    const c=clean(root?.querySelector?.('h3')?.textContent||'');
    if(!t)return null;
    const jobs=getJobs();
    return jobs.find(j=>title(j)===t&&(!c||company(j)===c))||jobs.find(j=>title(j)===t)||null;
  }

  function loadResumeStudio(){
    if(typeof window.openJobResumeEditorForJob==='function')return Promise.resolve(window.openJobResumeEditorForJob);
    if(typeof window.gluefulAdobeResumeStudio?.openJobResumeEditorForJob==='function')return Promise.resolve(window.gluefulAdobeResumeStudio.openJobResumeEditorForJob);
    return new Promise((resolve,reject)=>{
      const id='glueful-resume-studio-adobe-runtime-v290';
      const existing=document.getElementById(id);
      const done=()=>{
        const fn=window.openJobResumeEditorForJob||window.gluefulAdobeResumeStudio?.openJobResumeEditorForJob;
        if(typeof fn==='function')resolve(fn);else reject(new Error('Resume Studio direct job editor is unavailable.'));
      };
      if(existing){
        if(existing.dataset.loaded==='true')return done();
        existing.addEventListener('load',done,{once:true});
        existing.addEventListener('error',()=>reject(new Error('Resume Studio failed to load.')),{once:true});
        setTimeout(done,1500);
        return;
      }
      const s=document.createElement('script');
      s.id=id;
      s.src='./glueful-resume-studio-adobe.js?v=20260823-direct-job2';
      s.async=false;
      s.onload=()=>{s.dataset.loaded='true';done()};
      s.onerror=()=>reject(new Error('Resume Studio failed to load.'));
      document.head.appendChild(s);
    });
  }

  function openResume(job){
    if(!job)return;
    const selected={...job};
    window.gluefulResumeJobContext={
      id:String(selected.id??selected.sourceJobId??selected.job_id??''),
      title:title(selected),
      company:company(selected),
      location:clean(selected.location||selected.city||selected.job_location||''),
      source:selected
    };
    document.querySelector('.g15-layer')?.remove();
    document.body.style.removeProperty('overflow');
    loadResumeStudio().then(fn=>{
      const result=fn(selected);
      if(result&&typeof result.catch==='function')result.catch(e=>console.error('[Glueful Jobs] Resume Studio failed:',e));
    }).catch(e=>{
      console.error('[Glueful Jobs] Resume Studio unavailable:',e);
      if(typeof window.showError==='function')window.showError(e.message||'Could not open Resume Studio.');
    });
  }

  function ensureEditButton(panel){
    if(!panel||panel.querySelector('[data-g15-edit-resume]'))return;
    const job=findJobFromDetail(panel);
    if(!job)return;
    const b=document.createElement('button');
    b.type='button';
    b.className='g15-edit-resume';
    b.dataset.g15EditResume='1';
    b.textContent='✎  Edit resume for this job';
    b.addEventListener('click',()=>openResume(job));
    const footer=panel.querySelector('.g15-footer');
    if(footer)footer.parentElement.insertBefore(b,footer);else panel.appendChild(b);
  }

  function captureInlineEdit(ev){
    const target=ev.target?.closest?.('[onclick*="openJobResumeEditor"]');
    if(!target)return;
    const onclick=String(target.getAttribute('onclick')||'');
    const m=onclick.match(/openJobResumeEditor\(['"]([^'"]+)['"]\)/);
    if(!m)return;
    const job=getJobs().find(j=>String(j?.id)===m[1]||String(j?.sourceJobId||'')===m[1]||String(j?.job_id||'')===m[1]);
    if(!job)return;
    ev.preventDefault();ev.stopImmediatePropagation();openResume(job);
  }

  const css=document.createElement('style');
  css.id='g15-resume-action-css-v5';
  css.textContent='.g15-edit-resume{width:100%;margin-top:18px;border:1px solid rgba(157,126,255,.30);background:linear-gradient(135deg,rgba(123,54,255,.18),rgba(62,117,255,.18));color:#eee9ff;padding:13px 14px;border-radius:13px;font-weight:900;font-size:14px;cursor:pointer}.g15-edit-resume:active{transform:translateY(1px)}';
  document.head.appendChild(css);

  document.addEventListener('click',captureInlineEdit,true);
  let observer=null;
  function patch(){document.querySelectorAll('.g15-detail').forEach(ensureEditButton)}
  function boot(){
    patch();
    if(observer)return;
    observer=new MutationObserver(()=>{observer.disconnect();try{patch()}finally{observer.observe(document.getElementById('jobs-view')||document.body,{childList:true,subtree:true})}});
    observer.observe(document.getElementById('jobs-view')||document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.gluefulJobsResumeActionV1={editResumeForJob:openResume,refresh:patch,version:'5.0.0'};
})();