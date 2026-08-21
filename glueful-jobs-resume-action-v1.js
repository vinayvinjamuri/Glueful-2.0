/* Glueful Jobs Resume Action V2
 * Restores the authoritative Resume Studio controller when Jobs is loaded
 * and normalizes escaped job-description HTML without changing the data layer.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_RESUME_ACTION_V2__) return;
  window.__GLUEFUL_JOBS_RESUME_ACTION_V2__=true;

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const initials=n=>clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  const title=j=>clean(j?.title||j?.job_title||j?.position||'');
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'');
  const logoDomains={nxp:'nxp.com','nxp semiconductors':'nxp.com',qualcomm:'qualcomm.com',nvidia:'nvidia.com',apple:'apple.com',microsoft:'microsoft.com',amazon:'amazon.com',google:'google.com',intel:'intel.com',amd:'amd.com',arm:'arm.com',broadcom:'broadcom.com','texas instruments':'ti.com',renesas:'renesas.com',stmicroelectronics:'st.com',samsung:'samsung.com',ibm:'ibm.com',oracle:'oracle.com',adobe:'adobe.com',salesforce:'salesforce.com',bosch:'bosch.com',siemens:'siemens.com',synopsys:'synopsys.com',cadence:'cadence.com'};
  function domainFor(name){const key=clean(name).toLowerCase();if(logoDomains[key])return logoDomains[key];const hit=Object.keys(logoDomains).find(k=>key.includes(k)||k.includes(key));if(hit)return logoDomains[hit];const simple=key.replace(/\b(inc|inc\.|ltd|ltd\.|llc|corp|corporation|company|co\.|semiconductors)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)[0];return simple?`${simple}.com`:'';}
  function logoUrl(name){const d=domainFor(name);return d?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`:'';}
  function getJobs(){try{return typeof window.gluefulJobsV15?.getJobs==='function'?window.gluefulJobsV15.getJobs():[]}catch(_){return[]}}
  function findJobFromDetail(panel){const h=panel.querySelector('.g15-detail h1'),c=panel.querySelector('.g15-detail h3');const t=clean(h?.textContent||''),co=clean(c?.textContent||'');if(!t)return null;const jobs=getJobs();return jobs.find(j=>title(j)===t&&(!co||company(j)===co))||jobs.find(j=>title(j)===t)||null;}
  function addLogo(holder,name){if(!holder||holder.querySelector('img')||!name)return;const url=logoUrl(name);if(!url)return;const fallback=initials(name),img=document.createElement('img');img.alt='';img.src=url;img.dataset.fallback=fallback;img.onerror=function(){const p=this.parentElement;if(!p)return;this.remove();p.textContent=this.dataset.fallback||fallback};holder.textContent='';holder.appendChild(img);}
  function patchLogos(){document.querySelectorAll('.g15-card').forEach(card=>addLogo(card.querySelector('.g15-logo'),clean(card.querySelector('.g15-main span')?.textContent||'')));document.querySelectorAll('.g15-row').forEach(row=>addLogo(row.querySelector('.g15-row-logo'),clean(row.querySelector('span')?.textContent||'')));document.querySelectorAll('.g15-company').forEach(card=>addLogo(card.querySelector(':scope > div'),clean(card.querySelector('strong')?.textContent||'')));document.querySelectorAll('.g15-detail').forEach(panel=>addLogo(panel.querySelector('.g15-logo'),clean(panel.querySelector('h3')?.textContent||'')));}

  function loadResumeStudio(){
    if(typeof window.openJobResumeEditor==='function') return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const id='glueful-resume-studio-adobe-runtime';
      const existing=document.getElementById(id);
      if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(new Error('Resume Studio controller failed to load.')),{once:true});setTimeout(()=>typeof window.openJobResumeEditor==='function'?resolve():reject(new Error('Resume Studio controller did not expose openJobResumeEditor.')),1500);return;}
      const s=document.createElement('script');s.id=id;s.src='./glueful-resume-studio-adobe.js?v=20260822-resume-action2';s.async=false;s.onload=()=>typeof window.openJobResumeEditor==='function'?resolve():reject(new Error('Resume Studio controller did not expose openJobResumeEditor.'));s.onerror=()=>reject(new Error('Resume Studio controller failed to load.'));document.head.appendChild(s);
    });
  }

  function editResumeForJob(job){
    if(!job?.id)return;
    const id=String(job.id);
    window.gluefulResumeJobContext={id,title:title(job),company:company(job),location:clean(job.location||job.city||job.job_location||''),source:job};
    const layer=document.querySelector('.g15-layer');if(layer)layer.remove();document.body.style.removeProperty('overflow');
    loadResumeStudio().then(()=>{
      const result=window.openJobResumeEditor(id);
      if(result&&typeof result.catch==='function')result.catch(error=>console.error('[Glueful Jobs] Resume Studio failed to open:',error));
    }).catch(error=>{console.error('[Glueful Jobs] Resume Studio opener unavailable:',error);if(typeof window.showError==='function')window.showError('Resume Studio could not be loaded. Please refresh and try again.');});
  }

  function ensureEditButton(panel){if(!panel||panel.querySelector('[data-g15-edit-resume]'))return;const job=findJobFromDetail(panel);if(!job?.id)return;const button=document.createElement('button');button.type='button';button.className='g15-edit-resume';button.dataset.g15EditResume='1';button.textContent='✎  Edit resume for this job';button.addEventListener('click',()=>editResumeForJob(job));const footer=panel.querySelector('.g15-footer');if(footer)footer.parentElement.insertBefore(button,footer);else panel.appendChild(button);}

  function decodeEntities(value){let out=String(value??'');for(let i=0;i<3;i++){const ta=document.createElement('textarea');ta.innerHTML=out;const next=ta.value;if(next===out)break;out=next;}return out;}
  function sanitizeDescriptionHtml(value){
    const raw=decodeEntities(value);if(!/<[a-z][\s\S]*>/i.test(raw))return null;
    const doc=new DOMParser().parseFromString(raw,'text/html');
    const allowed=new Set(['P','BR','UL','OL','LI','STRONG','B','EM','I','H2','H3','H4','DIV','SPAN','A']);
    doc.body.querySelectorAll('*').forEach(el=>{
      if(!allowed.has(el.tagName)){el.replaceWith(...Array.from(el.childNodes));return;}
      [...el.attributes].forEach(a=>{if(el.tagName==='A'&&a.name==='href'&&/^https?:\/\//i.test(a.value))return;el.removeAttribute(a.name)});
      if(el.tagName==='A'){el.setAttribute('target','_blank');el.setAttribute('rel','noopener noreferrer');}
    });
    return doc.body.innerHTML;
  }
  function patchDescription(panel){
    const main=panel.querySelector('.g15-detail main');if(!main||main.dataset.g15DescriptionFixed==='1')return;
    const raw=main.textContent||'';const html=sanitizeDescriptionHtml(raw);if(!html)return;
    main.innerHTML=html.replace(/\n/g,'<br>');main.dataset.g15DescriptionFixed='1';
  }
  function patch(){patchLogos();document.querySelectorAll('.g15-detail').forEach(panel=>{ensureEditButton(panel);patchDescription(panel)});}

  const css=document.createElement('style');css.id='g15-resume-action-css';css.textContent='.g15-edit-resume{width:100%;margin-top:18px;border:1px solid rgba(157,126,255,.30);background:linear-gradient(135deg,rgba(123,54,255,.18),rgba(62,117,255,.18));color:#eee9ff;padding:13px 14px;border-radius:13px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(255,255,255,.02)}.g15-edit-resume:active{transform:translateY(1px)}.g15-logo img,.g15-row-logo img,.g15-company>div img{display:block;width:100%;height:100%;object-fit:contain}';document.head.appendChild(css);
  let observer=null;function boot(){patch();if(observer)return;observer=new MutationObserver(()=>{observer.disconnect();try{patch()}finally{observer.observe(document.body,{childList:true,subtree:true})}});observer.observe(document.getElementById('jobs-view')||document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.gluefulJobsResumeActionV1={editResumeForJob,refresh:patch};
})();