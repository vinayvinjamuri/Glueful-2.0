/* Glueful Jobs Relevance V2 — non-blocking mobile relevance + shared brand logos.
 * Keeps the existing V15 data, ranking intent, saves, links and Resume Studio flow.
 * Important: never performs the expensive relevance pass during the first paint.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_RELEVANCE_V2__) return;
  window.__GLUEFUL_JOBS_RELEVANCE_V2__=true;

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

  const knownDomains={figma:'figma.com',udemy:'udemy.com',britive:'britive.com',apple:'apple.com',google:'google.com',microsoft:'microsoft.com',amazon:'amazon.com',meta:'meta.com',nvidia:'nvidia.com',qualcomm:'qualcomm.com',intel:'intel.com',amd:'amd.com',arm:'arm.com',nxp:'nxp.com',renesas:'renesas.com','texas instruments':'ti.com',broadcom:'broadcom.com',samsung:'samsung.com',ibm:'ibm.com',oracle:'oracle.com',adobe:'adobe.com',salesforce:'salesforce.com',bosch:'bosch.com',siemens:'siemens.com',synopsys:'synopsys.com',cadence:'cadence.com'};
  const domainForName=name=>{
    const n=lower(name);const hit=Object.keys(knownDomains).find(k=>n===k||n.includes(k));
    if(hit)return knownDomains[hit];
    const first=n.replace(/\b(inc|ltd|llc|corp|corporation|company|co|plc)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)[0];
    return first?`${first}.com`:'';
  };
  const brandLogo=name=>{const d=domainForName(name);return d?`https://cdn.brandfetch.io/${encodeURIComponent(d)}/w/128/h/128`:'';};

  let profileCache=null;
  function profileText(){
    if(profileCache!==null)return profileCache;
    const parts=[];
    try{['glueful_profile','glueful_user_profile','profile','userProfile'].forEach(k=>{const raw=localStorage.getItem(k);if(raw)parts.push(raw);});}catch(_){ }
    try{if(window.gluefulProfile)parts.push(JSON.stringify(window.gluefulProfile));}catch(_){ }
    try{if(window.userProfile)parts.push(JSON.stringify(window.userProfile));}catch(_){ }
    try{if(window.currentUser?.user_metadata)parts.push(JSON.stringify(window.currentUser.user_metadata));}catch(_){ }
    profileCache=lower(parts.join(' '));return profileCache;
  }
  function tokens(s){return new Set(lower(s).split(/[^a-z0-9+#.]+/).filter(w=>w.length>=3));}
  function scoreJob(j,pTokens){
    const raw=Number(j?.match_score??j?.score??j?._score??0);let s=Number.isFinite(raw)?raw:0;
    const t=text(j),c=lower(company(j));
    if(major.some(x=>c.includes(x)))s+=8;if(technical.test(title(j)))s+=15;if(bad.test(t))s-=70;
    if(pTokens){const jt=tokens(`${title(j)} ${description(j)} ${company(j)}`);let overlap=0;jt.forEach(w=>{if(pTokens.has(w))overlap++;});s+=Math.min(30,overlap*3);}
    else if(s<=0&&technical.test(title(j)))s=45;
    if(j?.posted_at){const d=(Date.now()-new Date(j.posted_at).getTime())/86400000;if(d<3)s+=5;else if(d<7)s+=2;}
    return Math.max(0,Math.min(99,Math.round(s)));
  }
  const label=s=>s>=85?'Great match':s>=70?'Strong match':s>=50?'Good match':'Relevant';
  const initials=n=>clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  const logoUrl=j=>j?.company_logo_url||brandLogo(company(j));
  function card(j,s){
    const logo=logoUrl(j);
    return `<article class="g15-card"><div class="g15-card-head"><div class="g15-logo">${logo?`<img src="${esc(logo)}" alt="" data-rel-logo>`:esc(initials(company(j)))}</div><div class="g15-main"><strong>${esc(title(j))}</strong><span>${esc(company(j))}</span><small>📍 ${esc(location(j)||'Location not specified')}</small></div><button class="g15-save" type="button" data-save="${esc(j.id)}">♡</button></div><div class="g15-meta"><span class="g15-badge">${label(s)}</span><span class="g15-score">${s}% match</span></div><button class="g15-open" type="button" data-open="${esc(j.id)}">Open role →</button></article>`;
  }
  let patchQueued=false,observer=null;
  function patch(){
    patchQueued=false;const root=document.getElementById('glueful-jobs-v15'),api=window.gluefulJobsV15;
    if(!root||!api||typeof api.getJobs!=='function')return;
    const jobs=api.getJobs();if(!Array.isArray(jobs)||!jobs.length)return;
    const section=root.querySelector('.g15-section'),rail=section?.querySelector('.g15-rail');if(!section||!rail)return;
    const p=profileText(),pTokens=p?tokens(p):null;
    const scored=jobs.map((j,i)=>({j,s:scoreJob(j,pTokens),i}));
    scored.sort((a,b)=>b.s-a.s||b.i-a.i);
    let curated=scored.filter(x=>x.s>=40&&!bad.test(text(x.j))).slice(0,30);
    if(!curated.length)curated=scored.filter(x=>technical.test(title(x.j))&&!bad.test(text(x.j))).slice(0,30);
    const hash=curated.map(x=>String(x.j.id)).join('|');if(rail.dataset.relevanceHash===hash)return;
    rail.dataset.relevanceHash=hash;
    const count=section.querySelector('.g15-head h2 span');if(count)count.textContent=String(curated.length);
    const subtitle=section.querySelector('.g15-head p');if(subtitle)subtitle.textContent='Recommended from your profile, skills & job activity';
    rail.innerHTML=curated.map(x=>card(x.j,x.s)).join('')||'<div class="g15-empty">No strong matches yet. Try adding skills or searching for a role.</div>';
    rail.querySelectorAll('img[data-rel-logo]').forEach(img=>img.addEventListener('error',()=>{const p=img.parentElement;if(p){img.remove();p.textContent=initials(p.closest('.g15-card')?.querySelector('.g15-main span')?.textContent||'Company');}},{once:true}));
    root.dataset.relevancePatched='1';
  }
  function queuePatch(delay=450){
    if(patchQueued)return;patchQueued=true;const run=()=>patch();
    if('requestIdleCallback' in window)window.requestIdleCallback(run,{timeout:1200});else setTimeout(run,delay);
  }
  function boot(){
    const root=document.getElementById('glueful-jobs-v15');if(!root){setTimeout(boot,300);return;}
    queuePatch(700);observer=new MutationObserver(()=>queuePatch(500));observer.observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.gluefulJobsRelevanceV1={refresh:()=>queuePatch(0)};
  window.gluefulJobsLogoResolverV1={logoUrl,brandLogo,domainForName};
})();