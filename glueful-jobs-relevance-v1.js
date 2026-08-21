/* Glueful Jobs Relevance V1
 * Safe post-render layer for the stable V15 Jobs runtime.
 * It does not replace V15, Supabase loading, search, filters, Apply or Resume Studio.
 * Phase 1: observe Jobs DOM changes without observing mutations created by this
 * layer itself, preventing recursive render scheduling on mobile.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_RELEVANCE_V1__) return;
  window.__GLUEFUL_JOBS_RELEVANCE_V1__=true;

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const lower=v=>clean(v).toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'Company');
  const title=j=>clean(j?.title||j?.job_title||j?.position||'Untitled role');
  const location=j=>clean(j?.location||j?.city||j?.job_location||'');
  const description=j=>clean(j?.description||j?.job_description||j?.summary||j?.snippet||'');
  const text=j=>lower(`${title(j)} ${company(j)} ${description(j)} ${location(j)}`);
  const major=['google','microsoft','amazon','meta','apple','nvidia','qualcomm','amd','intel','nxp','arm','broadcom','texas instruments','renesas','stmicroelectronics','samsung','ibm','oracle','adobe','salesforce','bosch','siemens','synopsys','cadence'];
  const technical=/software|hardware|embedded|firmware|engineer|developer|validation|verification|test|qa|quality|silicon|soc|semiconductor|pmic|asic|fpga|rtl|verilog|systems|platform|cloud|devops|data|machine learning|ai|scientist|architect|security/i;
  const bad=/talent assistant|customer support|customer service|sales representative|sales associate|recruiter|recruiting|human resources|hr manager|marketing specialist|content producer|copywriter|account executive|business development representative|finance analyst|administrative assistant/i;

  function profileText(){
    const parts=[];
    try{['glueful_profile','glueful_user_profile','profile','userProfile'].forEach(k=>{const raw=localStorage.getItem(k);if(raw)parts.push(raw);});}catch(_){ }
    try{if(window.gluefulProfile)parts.push(JSON.stringify(window.gluefulProfile));}catch(_){ }
    try{if(window.userProfile)parts.push(JSON.stringify(window.userProfile));}catch(_){ }
    try{if(window.currentUser?.user_metadata)parts.push(JSON.stringify(window.currentUser.user_metadata));}catch(_){ }
    return lower(parts.join(' '));
  }
  function tokens(s){return new Set(lower(s).split(/[^a-z0-9+#.]+/).filter(w=>w.length>=3));}
  function score(j){
    const raw=Number(j?.match_score??j?.score??j?._score??0);let s=Number.isFinite(raw)?raw:0;
    const t=text(j),c=lower(company(j));
    if(major.some(x=>c.includes(x)))s+=8;
    if(technical.test(title(j)))s+=15;
    if(bad.test(t))s-=70;
    const p=profileText();
    if(p){const pt=tokens(p),jt=tokens(`${title(j)} ${description(j)} ${company(j)}`);let overlap=0;jt.forEach(w=>{if(pt.has(w))overlap++;});s+=Math.min(30,overlap*3);}
    else if(s<=0&&technical.test(title(j)))s=45;
    if(j?.posted_at){const d=(Date.now()-new Date(j.posted_at).getTime())/86400000;if(d<3)s+=5;else if(d<7)s+=2;}
    return Math.max(0,Math.min(99,Math.round(s)));
  }
  function label(s){return s>=85?'Great match':s>=70?'Strong match':s>=50?'Good match':'Relevant';}
  function initials(n){return clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';}
  function logoUrl(j){
    if(j?.company_logo_url)return j.company_logo_url;
    const name=lower(company(j));
    const known={qualcomm:'qualcomm.com',nxp:'nxp.com','nxp semiconductors':'nxp.com',nvidia:'nvidia.com',google:'google.com',microsoft:'microsoft.com',apple:'apple.com',amazon:'amazon.com',intel:'intel.com',amd:'amd.com',arm:'arm.com',renesas:'renesas.com','texas instruments':'ti.com',broadcom:'broadcom.com',samsung:'samsung.com',ibm:'ibm.com',oracle:'oracle.com',adobe:'adobe.com',salesforce:'salesforce.com',bosch:'bosch.com',siemens:'siemens.com',synopsys:'synopsys.com',cadence:'cadence.com'};
    const hit=Object.keys(known).find(k=>name.includes(k));
    const domain=hit?known[hit]:name.replace(/\b(inc|ltd|llc|corp|corporation|company|co)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)[0]+'.com';
    return domain&&domain!=='.com'?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`:'';
  }
  function card(j){
    const s=score(j),logo=logoUrl(j);
    return `<article class="g15-card"><div class="g15-card-head"><div class="g15-logo">${logo?`<img src="${esc(logo)}" alt="" data-rel-logo>`:esc(initials(company(j)))}</div><div class="g15-main"><strong>${esc(title(j))}</strong><span>${esc(company(j))}</span><small>📍 ${esc(location(j)||'Location not specified')}</small></div><button class="g15-save" type="button" data-save="${esc(j.id)}">♡</button></div><div class="g15-meta"><span class="g15-badge">${label(s)}</span><span class="g15-score">${s}% match</span></div><button class="g15-open" type="button" data-open="${esc(j.id)}">Open role →</button></article>`;
  }
  function patch(){
    const root=document.getElementById('glueful-jobs-v15'),api=window.gluefulJobsV15;
    if(!root||!api||typeof api.getJobs!=='function')return;
    const jobs=api.getJobs();if(!Array.isArray(jobs)||!jobs.length)return;
    const sorted=[...jobs].sort((a,b)=>score(b)-score(a));
    let curated=sorted.filter(j=>score(j)>=40&&!bad.test(text(j))).slice(0,30);
    if(!curated.length)curated=sorted.filter(j=>technical.test(title(j))&&!bad.test(text(j))).slice(0,30);
    const section=root.querySelector('.g15-section'),rail=section?.querySelector('.g15-rail');
    if(!section||!rail)return;
    const hash=curated.map(j=>String(j.id)).join('|');
    if(rail.dataset.relevanceHash===hash)return;
    rail.dataset.relevanceHash=hash;
    const count=section.querySelector('.g15-head h2 span');if(count)count.textContent=String(curated.length);
    const subtitle=section.querySelector('.g15-head p');if(subtitle)subtitle.textContent='Recommended from your profile, skills & job activity';
    rail.innerHTML=curated.map(card).join('')||'<div class="g15-empty">No strong matches yet. Try adding skills or searching for a role.</div>';
    rail.querySelectorAll('img[data-rel-logo]').forEach(img=>img.addEventListener('error',()=>{const p=img.parentElement;if(p){img.remove();p.textContent=initials(p.closest('.g15-card')?.querySelector('.g15-main span')?.textContent||'Company');}}));
    root.dataset.relevancePatched='1';
  }
  let timer=0;
  let observer=null;
  let observing=false;
  function schedule(){clearTimeout(timer);timer=setTimeout(()=>{
    if(!observer||observing===false)return;
    observing=false;
    try{observer.disconnect();}catch(_){ }
    try{patch();}finally{
      const root=document.getElementById('glueful-jobs-v15');
      if(root){try{observer.observe(root,{childList:true,subtree:true});}catch(_){ }}
      observing=true;
    }
  },120);}
  function boot(){
    schedule();setTimeout(schedule,500);setTimeout(schedule,1500);
    const root=document.getElementById('glueful-jobs-v15');
    if(!root){setTimeout(boot,500);return;}
    observer=new MutationObserver(schedule);
    observer.observe(root,{childList:true,subtree:true});
    observing=true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.gluefulJobsRelevanceV1={refresh:patch};
})();
