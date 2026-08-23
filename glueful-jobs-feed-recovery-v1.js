/* Glueful Jobs Feed Recovery V1
 * Fallback only: if the authoritative V15 renderer has zero jobs, load the
 * public job_listings table directly through Supabase REST and render a
 * useful feed. This avoids dependence on the Supabase JS SDK being present.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_FEED_RECOVERY_V1__) return;
  window.__GLUEFUL_JOBS_FEED_RECOVERY_V1__=true;

  const API='https://xztbhheexianejsvwpva.supabase.co/rest/v1/job_listings';
  const KEY='sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'Company');
  const title=j=>clean(j?.title||j?.job_title||j?.position||'Untitled role');
  const location=j=>clean(j?.location||j?.city||j?.job_location||'');
  const description=j=>clean(j?.description||j?.job_description||j?.summary||j?.snippet||'');
  const text=j=>`${title(j)} ${company(j)} ${location(j)} ${description(j)}`.toLowerCase();
  const major=['google','microsoft','amazon','meta','apple','nvidia','qualcomm','amd','intel','nxp','arm','broadcom','texas instruments','renesas','stmicroelectronics','samsung','ibm','oracle','adobe','salesforce','bosch','siemens','synopsys','cadence'];
  const technical=/engineer|developer|scientist|architect|validation|verification|firmware|hardware|embedded|software|silicon|soc|semiconductor|pmic|asic|fpga|rtl|verilog|test/i;
  const score=j=>{let s=Number(j?.match_score??j?.score??j?._score??0);if(!Number.isFinite(s))s=0;const c=company(j).toLowerCase(),t=text(j);if(major.some(x=>c.includes(x)))s+=18;if(technical.test(title(j)))s+=15;if(/bms|battery|power|embedded|hardware|validation|post.?silicon|soc/i.test(t))s+=8;return Math.max(0,Math.min(99,Math.round(s)))};
  const ranked=a=>[...a].sort((a,b)=>score(b)-score(a)||(new Date(b?.posted_at||0)-new Date(a?.posted_at||0)));
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const initials=n=>clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  const logo=j=>j?.company_logo_url||'';
  const getData=()=>{try{return window.getActiveJobData?.()||[]}catch{return[]}};
  async function fetchJobs(){
    const url=`${API}?select=*&is_active=eq.true&order=posted_at.desc&limit=1000`;
    const r=await fetch(url,{headers:{apikey:KEY},cache:'no-store'});
    if(!r.ok)throw new Error(`jobs REST ${r.status}`);
    const data=await r.json();
    if(!Array.isArray(data)||!data.length)throw new Error('jobs REST returned no active rows');
    return data;
  }
  function card(j){const s=score(j),c=company(j);return `<article class="g15-card" data-recovery-job="${esc(j.id)}"><button class="g15-save" type="button" aria-label="Save job">♡</button><div class="g15-card-head"><div class="g15-logo">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:esc(initials(c))}</div><div class="g15-main"><strong>${esc(title(j))}</strong><span>${esc(c)}</span><small>📍 ${esc(location(j)||'Location not specified')}</small></div></div><div class="g15-meta"><span class="g15-badge">${s>=85?'Great match':s>=70?'Strong match':s>=50?'Good match':'Relevant'}</span><span class="g15-score">${s}% match</span></div><button class="g15-open" type="button">Open role →</button></article>`}
  function companyCard(name,list){return `<button class="g15-company" type="button" data-recovery-company="${esc(name)}"><div>${esc(initials(name))}</div><strong>${esc(name)}</strong><b>${list.length}</b><small>roles</small></button>`}
  function render(jobs){
    const root=document.getElementById('glueful-jobs-v15');if(!root)return false;
    const sorted=ranked(jobs),companies=new Map();sorted.forEach(j=>{const c=company(j);if(!companies.has(c))companies.set(c,[]);companies.get(c).push(j)});
    const topCompanies=[...companies.entries()].sort((a,b)=>b[1].length-a[1].length).slice(0,20);
    root.innerHTML=`<div class="g15-page"><div class="g15-top"><div><div class="g15-kicker">YOUR NEXT MOVE · V15</div><h1>Find your next big move</h1><p>Fresh roles, smart matches & company radar.</p></div></div><button class="g15-search" id="g15-recovery-search" type="button">⌕ &nbsp; Search jobs, skills or companies…</button><div class="g15-tabs"><button class="active" type="button">For You</button><button type="button">All jobs ${sorted.length}</button><button type="button">Companies</button></div><section class="g15-section"><div class="g15-head"><div><h2>Curated for you <span style="color:#a98bff">${Math.min(30,sorted.length)}</span></h2><p>Recommended from your available job data</p></div><button class="g15-see" id="g15-recovery-see" type="button">See all →</button></div><div class="g15-rail">${sorted.slice(0,30).map(card).join('')}</div></section><section class="g15-section"><div class="g15-head"><div><h2>Top companies hiring</h2><p>Swipe to explore employers</p></div></div><div class="g15-company-rail">${topCompanies.map(([n,l])=>companyCard(n,l)).join('')}</div></section></div>`;
    window.__GLUEFUL_RECOVERY_JOBS__=sorted;
    window.getActiveJobData=()=>window.__GLUEFUL_RECOVERY_JOBS__;
    window.gluefulJobsV15=window.gluefulJobsV15||{};window.gluefulJobsV15.getJobs=()=>window.__GLUEFUL_RECOVERY_JOBS__;
    root.querySelector('#g15-recovery-see')?.addEventListener('click',()=>openList(sorted));
    root.querySelector('#g15-recovery-search')?.addEventListener('click',()=>openSearch(sorted));
    root.querySelectorAll('[data-recovery-job]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('.g15-save'))return;const j=sorted.find(x=>String(x.id)===String(el.dataset.recoveryJob));if(j)openRole(j)}));
    return true;
  }
  function openRole(j){const layer=document.createElement('div');layer.className='g15-layer';const url=j.employer_job_url||j.application_url||j.apply_url||j.job_url||j.url||'';layer.innerHTML=`<div class="g15-panel g15-detail"><header><button type="button" data-close>← Back</button></header><div class="g15-logo" style="margin-top:14px">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:esc(initials(company(j)))}</div><h1>${esc(title(j))}</h1><h3>${esc(company(j))}</h3><p>${esc(location(j)||'Location not specified')}</p><div class="g15-badge">${score(j)}% match</div><main>${esc(description(j)||'Full job description is not available.').replace(/\n/g,'<br>')}</main><div class="g15-footer"><button type="button" data-edit>✎ Edit resume for this job</button>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Apply now ↗</a>`:''}</div></div>`;document.body.appendChild(layer);document.body.style.overflow='hidden';layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow')}});layer.querySelector('[data-edit]')?.addEventListener('click',()=>{window.gluefulJobsResumeActionV1?.editResumeForJob?.(j)});}
  function openSearch(jobs){const layer=document.createElement('div');layer.className='g15-layer';layer.innerHTML='<div class="g15-panel"><header><input id="g15-recovery-q" type="search" placeholder="Search jobs, skills or companies…"><button data-close>Cancel</button></header><div id="g15-recovery-results"></div></div>';document.body.appendChild(layer);document.body.style.overflow='hidden';const q=layer.querySelector('#g15-recovery-q'),r=layer.querySelector('#g15-recovery-results');const draw=()=>{const x=q.value.trim().toLowerCase(),list=x?ranked(jobs.filter(j=>text(j).includes(x))):ranked(jobs);r.innerHTML=list.slice(0,200).map(j=>`<button class="g15-row" data-id="${esc(j.id)}"><div class="g15-row-logo">${esc(initials(company(j)))}</div><div><strong>${esc(title(j))}</strong><span>${esc(company(j))}</span><small>${esc(location(j))} · ${score(j)}% match</small></div></button>`).join('')||'<div class="g15-empty">No matching roles found.</div>';};q.addEventListener('input',draw);draw();layer.addEventListener('click',e=>{if(e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow');return}const b=e.target.closest('[data-id]');if(b){const j=jobs.find(x=>String(x.id)===String(b.dataset.id));if(j){layer.remove();document.body.style.removeProperty('overflow');openRole(j)}}});setTimeout(()=>q.focus(),0)}
  function openList(jobs){openSearch(jobs)}
  async function boot(){
    if(document.getElementById('glueful-jobs-v15')?.dataset.recoveryLoaded==='true')return;
    const v=window.gluefulJobsV15?.getJobs?.()||[];
    if(v.length)return;
    try{const jobs=await fetchJobs();const root=document.getElementById('glueful-jobs-v15');if(root)root.dataset.recoveryLoaded='true';render(jobs);}catch(e){console.error('[Glueful Jobs Recovery] load failed',e);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1800),{once:true});else setTimeout(boot,1800);
  window.gluefulJobsFeedRecoveryV1={refresh:boot};
})();