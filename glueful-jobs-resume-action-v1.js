/* Glueful Jobs Resume Action V4
 * Uses the authoritative Resume Studio controller on demand and cleans
 * provider-encoded job descriptions in the Jobs detail surface.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_RESUME_ACTION_V4__) return;
  window.__GLUEFUL_JOBS_RESUME_ACTION_V1__=true;
  window.__GLUEFUL_JOBS_RESUME_ACTION_V4__=true;
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const title=j=>clean(j?.title||j?.job_title||j?.position||'');
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'');
  const initials=n=>clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  const logoDomains={nxp:'nxp.com','nxp semiconductors':'nxp.com',qualcomm:'qualcomm.com',nvidia:'nvidia.com',apple:'apple.com',microsoft:'microsoft.com',amazon:'amazon.com',google:'google.com',intel:'intel.com',amd:'amd.com',arm:'arm.com',broadcom:'broadcom.com','texas instruments':'ti.com',renesas:'renesas.com',stmicroelectronics:'st.com',samsung:'samsung.com',ibm:'ibm.com',oracle:'oracle.com',adobe:'adobe.com',salesforce:'salesforce.com',bosch:'bosch.com',siemens:'siemens.com',synopsys:'synopsys.com',cadence:'cadence.com'};
  function domainFor(name){const key=clean(name).toLowerCase();if(logoDomains[key])return logoDomains[key];const hit=Object.keys(logoDomains).find(k=>key.includes(k)||k.includes(key));if(hit)return logoDomains[hit];const simple=key.replace(/\b(inc|inc\.|ltd|ltd\.|llc|corp|corporation|company|co\.|semiconductors)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)[0];return simple?`${simple}.com`:'';}
  function logoUrl(name){const d=domainFor(name);return d?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`:'';}
  function getJobs(){try{return typeof window.gluefulJobsV15?.getJobs==='function'?window.gluefulJobsV15.getJobs():[]}catch(_){return[]}}
  function findJobFromDetail(panel){const h=panel.querySelector('.g15-detail h1'),c=panel.querySelector('.g15-detail h3');const t=clean(h?.textContent||''),co=clean(c?.textContent||'');if(!t)return null;const jobs=getJobs();return jobs.find(j=>title(j)===t&&(!co||company(j)===co))||jobs.find(j=>title(j)===t)||null;}
  function addLogo(holder,name){if(!holder||holder.querySelector('img')||!name)return;const d=logoUrl(name);if(!d)return;const img=document.createElement('img');img.alt='';img.src=d;img.onerror=function(){const p=this.parentElement;if(!p)return;this.remove();p.textContent=initials(name)};holder.textContent='';holder.appendChild(img);}
  function patchLogos(){document.querySelectorAll('.g15-card').forEach(c=>addLogo(c.querySelector('.g15-logo'),clean(c.querySelector('.g15-main span')?.textContent||'')));document.querySelectorAll('.g15-row').forEach(r=>addLogo(r.querySelector('.g15-row-logo'),clean(r.querySelector('span')?.textContent||'')));document.querySelectorAll('.g15-company').forEach(c=>addLogo(c.querySelector(':scope > div'),clean(c.querySelector('strong')?.textContent||'')));document.querySelectorAll('.g15-detail').forEach(p=>addLogo(p.querySelector('.g15-logo'),clean(p.querySelector('h3')?.textContent||'')));}
  function decodeEntities(value){let out=String(value??'');for(let i=0;i<4;i++){const ta=document.createElement('textarea');ta.innerHTML=out;const next=ta.value;if(next===out)break;out=next;}return out;}
  function readableDescription(value){let s=decodeEntities(value);s=s.replace(/<br\s*\/?>/gi,'\n').replace(/<\/p>/gi,'\n').replace(/<[^>]*>/g,' ');return s.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').replace(/[ \t]{2,}/g,' ').trim();}
  function patchDescription(){document.querySelectorAll('.g15-detail .job-description,.g15-detail .job-detail-block p,[data-job-description]').forEach(node=>{const raw=node.textContent||'';if(/&(?:lt|gt|amp|quot|#39|nbsp);/i.test(raw)||/<(?:span|p|div|br)\b/i.test(raw)){node.textContent=readableDescription(raw);node.style.whiteSpace='pre-line';}});}
  function ensureResumeJobResolver(){
    if(typeof window.findActiveJobById==='function')return;
    window.findActiveJobById=function(jobId){
      const wanted=String(jobId??'');
      const jobs=getJobs();
      return jobs.find(j=>String(j?.id??'')===wanted)||jobs.find(j=>String(j?.sourceJobId??'')===wanted)||jobs.find(j=>String(j?.job_id??'')===wanted)||null;
    };
  }
  function loadAuthoritativeResumeStudio(){
    if(typeof window.gluefulAdobeResumeStudio?.openJobResumeEditor==='function')return Promise.resolve(window.gluefulAdobeResumeStudio.openJobResumeEditor);
    return new Promise((resolve,reject)=>{
      const id='glueful-resume-studio-adobe-runtime',existing=document.getElementById(id);
      const done=()=>{if(typeof window.gluefulAdobeResumeStudio?.openJobResumeEditor==='function')resolve(window.gluefulAdobeResumeStudio.openJobResumeEditor);else if(typeof window.openJobResumeEditor==='function')resolve(window.openJobResumeEditor);else reject(new Error('Resume Studio controller did not expose an editor opener.'));};
      if(existing){if(existing.dataset.loaded==='true')return done();existing.addEventListener('load',done,{once:true});existing.addEventListener('error',()=>reject(new Error('Resume Studio controller failed to load.')),{once:true});setTimeout(done,1200);return;}
      const s=document.createElement('script');s.id=id;s.src='./glueful-resume-studio-adobe.js?v=20260822-resume-fix4';s.async=false;s.onload=done;s.onerror=()=>reject(new Error('Resume Studio controller failed to load.'));document.head.appendChild(s);
    });
  }
  function openResume(job){
    if(!job?.id)return;const id=String(job.id);window.gluefulResumeJobContext={id,title:title(job),company:company(job),location:clean(job.location||job.city||job.job_location||''),source:job};ensureResumeJobResolver();document.querySelector('.g15-layer')?.remove();document.body.style.removeProperty('overflow');
    loadAuthoritativeResumeStudio().then(fn=>{window.openJobResumeEditor=fn;const result=fn(id);if(result&&typeof result.catch==='function')result.catch(e=>console.error('[Glueful Jobs] Resume Studio failed:',e));}).catch(e=>console.error('[Glueful Jobs] Resume Studio unavailable:',e));
  }
  function editResumeForJob(job){openResume(job)}
  function ensureEditButton(panel){if(!panel||panel.querySelector('[data-g15-edit-resume]'))return;const job=findJobFromDetail(panel);if(!job?.id)return;const b=document.createElement('button');b.type='button';b.className='g15-edit-resume';b.dataset.g15EditResume='1';b.textContent='✎  Edit resume for this job';b.addEventListener('click',()=>editResumeForJob(job));const f=panel.querySelector('.g15-footer');if(f)f.parentElement.insertBefore(b,f);else panel.appendChild(b);}
  function captureInlineEdit(ev){const target=ev.target?.closest?.('[onclick*="openJobResumeEditor"]');if(!target)return;const onclick=String(target.getAttribute('onclick')||'');const m=onclick.match(/openJobResumeEditor\(['"]([^'"]+)['"]\)/);if(!m)return;const id=m[1],jobs=getJobs(),job=jobs.find(j=>String(j.id)===id)||jobs.find(j=>String(j.sourceJobId||'')===id)||null;if(!job)return;ev.preventDefault();ev.stopImmediatePropagation();openResume(job);}
  const css=document.createElement('style');css.id='g15-resume-action-css';css.textContent='.g15-edit-resume{width:100%;margin-top:18px;border:1px solid rgba(157,126,255,.30);background:linear-gradient(135deg,rgba(123,54,255,.18),rgba(62,117,255,.18));color:#eee9ff;padding:13px 14px;border-radius:13px;font-weight:900;font-size:14px;cursor:pointer}.g15-edit-resume:active{transform:translateY(1px)}.g15-logo img,.g15-row-logo img,.g15-company>div img{display:block;width:100%;height:100%;object-fit:contain}.g15-detail .job-description,.g15-detail .job-detail-block p{white-space:pre-line}';document.head.appendChild(css);
  document.addEventListener('click',captureInlineEdit,true);
  let observer=null;function patch(){patchLogos();patchDescription();document.querySelectorAll('.g15-detail').forEach(ensureEditButton)}
  function boot(){patch();if(observer)return;observer=new MutationObserver(()=>{observer.disconnect();try{patch()}finally{observer.observe(document.getElementById('jobs-view')||document.body,{childList:true,subtree:true})}});observer.observe(document.getElementById('jobs-view')||document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.gluefulJobsResumeActionV1={editResumeForJob,refresh:patch};
})();