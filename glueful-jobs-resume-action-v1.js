/* Glueful Jobs Resume Action V1
 * Adds the existing Resume Studio to the authoritative Jobs detail view
 * without replacing or rewriting the existing Resume Studio lifecycle.
 * Also fills missing company logos using stable website favicons.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_RESUME_ACTION_V1__) return;
  window.__GLUEFUL_JOBS_RESUME_ACTION_V1__=true;

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const initials=n=>clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  const title=j=>clean(j?.title||j?.job_title||j?.position||'');
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'');
  const logoDomains={
    'nxp':'nxp.com',
    'nxp semiconductors':'nxp.com',
    'qualcomm':'qualcomm.com',
    'nvidia':'nvidia.com',
    'apple':'apple.com',
    'microsoft':'microsoft.com',
    'amazon':'amazon.com',
    'google':'google.com',
    'intel':'intel.com',
    'amd':'amd.com',
    'arm':'arm.com',
    'broadcom':'broadcom.com',
    'texas instruments':'ti.com',
    'renesas':'renesas.com',
    'stmicroelectronics':'st.com',
    'samsung':'samsung.com',
    'ibm':'ibm.com',
    'oracle':'oracle.com',
    'adobe':'adobe.com',
    'salesforce':'salesforce.com',
    'bosch':'bosch.com',
    'siemens':'siemens.com',
    'synopsys':'synopsys.com',
    'cadence':'cadence.com'
  };

  function domainFor(name){
    const key=clean(name).toLowerCase();
    if(logoDomains[key]) return logoDomains[key];
    const hit=Object.keys(logoDomains).find(k=>key.includes(k)||k.includes(key));
    if(hit) return logoDomains[hit];
    const simple=key.replace(/\b(inc|inc\.|ltd|ltd\.|llc|corp|corporation|company|co\.|semiconductors)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)[0];
    return simple ? `${simple}.com` : '';
  }

  function logoUrl(name){
    const domain=domainFor(name);
    return domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : '';
  }

  function getJobs(){
    try{
      return typeof window.gluefulJobsV15?.getJobs==='function' ? window.gluefulJobsV15.getJobs() : [];
    }catch(_){return []}
  }

  function findJobFromDetail(panel){
    const h=panel.querySelector('.g15-detail h1');
    const c=panel.querySelector('.g15-detail h3');
    const t=clean(h?.textContent||'');
    const co=clean(c?.textContent||'');
    if(!t) return null;
    const jobs=getJobs();
    return jobs.find(j=>title(j)===t&&(!co||company(j)===co)) || jobs.find(j=>title(j)===t) || null;
  }

  function addLogo(holder,name){
    if(!holder||holder.querySelector('img')||!name) return;
    const url=logoUrl(name);
    if(!url) return;
    const fallback=initials(name);
    const img=document.createElement('img');
    img.alt='';
    img.src=url;
    img.dataset.fallback=fallback;
    img.onerror=function(){
      const parent=this.parentElement;
      if(!parent) return;
      this.remove();
      parent.textContent=this.dataset.fallback||fallback;
    };
    holder.textContent='';
    holder.appendChild(img);
  }

  function patchLogos(){
    document.querySelectorAll('.g15-card').forEach(card=>{
      const name=clean(card.querySelector('.g15-main span')?.textContent||'');
      addLogo(card.querySelector('.g15-logo'),name);
    });
    document.querySelectorAll('.g15-row').forEach(row=>{
      const name=clean(row.querySelector('span')?.textContent||'');
      addLogo(row.querySelector('.g15-row-logo'),name);
    });
    document.querySelectorAll('.g15-company').forEach(card=>{
      const name=clean(card.querySelector('strong')?.textContent||'');
      addLogo(card.querySelector(':scope > div'),name);
    });
    document.querySelectorAll('.g15-detail').forEach(panel=>{
      const name=clean(panel.querySelector('h3')?.textContent||'');
      addLogo(panel.querySelector('.g15-logo'),name);
    });
  }

  function editResumeForJob(job){
    if(!job?.id) return;
    const id=String(job.id);
    window.gluefulResumeJobContext={
      id,
      title:title(job),
      company:company(job),
      location:clean(job.location||job.city||job.job_location||''),
      source:job
    };

    const layer=document.querySelector('.g15-layer');
    if(layer) layer.remove();
    document.body.style.removeProperty('overflow');

    if(typeof window.openJobResumeEditor!=='function'){
      console.error('[Glueful Jobs] Existing Resume Studio opener is unavailable.');
      return;
    }

    try{
      /* The existing Resume Studio API takes the active job ID. */
      const result=window.openJobResumeEditor(id);
      if(result && typeof result.catch==='function'){
        result.catch(error=>console.error('[Glueful Jobs] Resume Studio failed to open:',error));
      }
    }catch(error){
      console.error('[Glueful Jobs] Resume Studio failed to open:',error);
    }
  }

  function ensureEditButton(panel){
    if(!panel||panel.querySelector('[data-g15-edit-resume]')) return;
    const job=findJobFromDetail(panel);
    if(!job?.id) return;

    const button=document.createElement('button');
    button.type='button';
    button.className='g15-edit-resume';
    button.dataset.g15EditResume='1';
    button.textContent='✎  Edit resume for this job';
    button.addEventListener('click',()=>editResumeForJob(job));

    const footer=panel.querySelector('.g15-footer');
    if(footer) footer.parentElement.insertBefore(button,footer);
    else panel.appendChild(button);
  }

  function patch(){
    patchLogos();
    document.querySelectorAll('.g15-detail').forEach(ensureEditButton);
  }

  const css=document.createElement('style');
  css.id='g15-resume-action-css';
  css.textContent=`
.g15-edit-resume{width:100%;margin-top:18px;border:1px solid rgba(157,126,255,.30);background:linear-gradient(135deg,rgba(123,54,255,.18),rgba(62,117,255,.18));color:#eee9ff;padding:13px 14px;border-radius:13px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(255,255,255,.02)}
.g15-edit-resume:active{transform:translateY(1px)}
.g15-logo img,.g15-row-logo img,.g15-company>div img{display:block;width:100%;height:100%;object-fit:contain}
`;
  document.head.appendChild(css);

  let observer=null;
  function boot(){
    patch();
    if(observer) return;
    observer=new MutationObserver(()=>patch());
    const target=document.getElementById('jobs-view')||document.body;
    observer.observe(target,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.gluefulJobsResumeActionV1={editResumeForJob,refresh:patch};
})();
