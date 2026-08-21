/* Glueful Jobs V16 — relevance-first discovery layer.
 * Keeps the agreed Jobs UX (swipe rails, search, companies, details) but derives
 * recommendations from the signed-in user's master resume/profile instead of
 * treating the first 1000 jobs as equally relevant.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_V16__) return;
  window.__GLUEFUL_JOBS_V16__=true;

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const lower=v=>clean(v).toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const title=j=>clean(j?.title||j?.job_title||j?.position||'Untitled role');
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'Company');
  const location=j=>clean(j?.location||j?.city||j?.job_location||'');
  const desc=j=>clean(j?.description||j?.job_description||j?.summary||j?.snippet||'');
  const url=j=>j?.employer_job_url||j?.application_url||j?.apply_url||j?.job_url||j?.url||j?.source_url||j?.external_url||'';
  const text=j=>lower(`${title(j)} ${company(j)} ${desc(j)} ${location(j)}`);
  const initials=n=>clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  const major=['google','microsoft','amazon','meta','apple','nvidia','qualcomm','amd','intel','nxp','arm','broadcom','texas instruments','renesas','stmicroelectronics','samsung','ibm','oracle','adobe','salesforce','bosch','siemens','synopsys','cadence','jp morgan','jpmorgan'];
  const companyDomains={'nxp':'nxp.com','qualcomm':'qualcomm.com','nvidia':'nvidia.com','amd':'amd.com','intel':'intel.com','google':'google.com','microsoft':'microsoft.com','amazon':'amazon.com','meta':'meta.com','apple':'apple.com','arm':'arm.com','broadcom':'broadcom.com','texas instruments':'ti.com','renesas':'renesas.com','stmicroelectronics':'st.com','samsung':'samsung.com','ibm':'ibm.com','oracle':'oracle.com','adobe':'adobe.com','salesforce':'salesforce.com','bosch':'bosch.com','siemens':'siemens.com','synopsys':'synopsys.com','cadence':'cadence.com','jp morgan':'jpmorganchase.com','jpmorgan':'jpmorganchase.com'};
  const genericNoise=['talent assistant','customer support','customer service','recruiter','recruiting','human resources','hr manager','marketing specialist','content producer','copywriter','account executive','business development representative','administrative assistant'];

  let jobs=[];
  let profile={text:'',terms:[],families:[]};
  let booted=false;

  function readProfileText(){
    const bits=[];
    try{if(typeof window.gluefulMasterResumeText!=='undefined')bits.push(window.gluefulMasterResumeText||'')}catch(_){ }
    try{if(typeof window.gluefulCandidateProfile!=='undefined')bits.push(JSON.stringify(window.gluefulCandidateProfile||{}))}catch(_){ }
    try{if(typeof window.candidateProfile!=='undefined')bits.push(JSON.stringify(window.candidateProfile||{}))}catch(_){ }
    try{if(typeof window.currentUserProfile!=='undefined')bits.push(JSON.stringify(window.currentUserProfile||{}))}catch(_){ }
    try{['glueful_profile','glueful_candidate_profile','resume_profile','candidate_profile'].forEach(k=>{const v=localStorage.getItem(k);if(v)bits.push(v)})}catch(_){ }
    return clean(bits.join(' '));
  }
  function buildProfile(){
    const raw=readProfileText(),t=lower(raw); profile.text=t;
    const vocab=['hardware','embedded','firmware','validation','verification','post-silicon','silicon','soc','semiconductor','pmic','asic','fpga','rtl','verilog','i2c','spi','uart','python','c','c++','linux','android','camera','isp','board bring-up','power integrity','signal integrity','software engineer','backend','frontend','full stack','java','javascript','typescript','react','node','cloud','devops','data scientist','machine learning','ai','cybersecurity','finance','accounting','marketing','sales'];
    profile.terms=vocab.filter(k=>t.includes(k));
    const fam=[];
    if(profile.terms.some(k=>['hardware','embedded','firmware','validation','verification','post-silicon','silicon','soc','semiconductor','pmic','asic','fpga','rtl','verilog','i2c','spi','uart','camera','isp','board bring-up','power integrity','signal integrity'].includes(k)))fam.push('hardware');
    if(profile.terms.some(k=>['software engineer','backend','frontend','full stack','java','javascript','typescript','react','node','cloud','devops'].includes(k)))fam.push('software');
    if(profile.terms.some(k=>['data scientist','machine learning','ai'].includes(k)))fam.push('ai');
    if(profile.terms.some(k=>['finance','accounting'].includes(k)))fam.push('finance');
    if(profile.terms.some(k=>['marketing','sales'].includes(k)))fam.push('business');
    profile.families=fam;
  }
  function getLoadedJobs(){
    try{if(window.gluefulJobsV15?.getJobs){const a=window.gluefulJobsV15.getJobs();if(Array.isArray(a)&&a.length)return a}}catch(_){ }
    try{if(typeof window.getActiveJobData==='function'){const a=window.getActiveJobData();if(Array.isArray(a)&&a.length)return a}}catch(_){ }
    return [];
  }
  async function ensureJobs(){
    const existing=getLoadedJobs(); if(existing.length){jobs=existing;return jobs}
    try{
      const c=window.supabaseClient||window.gluefulResumeSupabaseClient;
      if(c){const r=await c.from('job_listings').select('*').eq('is_active',true).order('posted_at',{ascending:false}).limit(1000);if(!r.error&&Array.isArray(r.data))jobs=r.data}
    }catch(e){console.warn('[Glueful V16] job load failed',e)}
    return jobs;
  }
  function score(j){
    let s=Number(j?.match_score??j?.score??j?._score??0); if(!Number.isFinite(s))s=0;
    const t=text(j), c=lower(company(j));
    if(profile.terms.length){
      profile.terms.forEach(k=>{if(t.includes(k))s+=9});
      profile.families.forEach(f=>{
        const familyHit=f==='hardware'?/hardware|embedded|firmware|validation|verification|silicon|soc|semiconductor|pmic|asic|fpga|rtl|verilog|test/i.test(t):f==='software'?/software|backend|frontend|full.?stack|java|javascript|typescript|react|node|cloud|devops|platform/i.test(t):f==='ai'?/ai|machine learning|ml|data scientist/i.test(t):f==='finance'?/finance|accounting|fintech|bank/i.test(t):/marketing|sales|business development/i.test(t);
        if(familyHit)s+=18;
      });
    }
    if(major.some(x=>c.includes(x)))s+=8;
    if(/engineer|developer|scientist|architect|validation|verification|firmware|hardware|embedded|software|silicon|soc|semiconductor|pmic|asic|fpga|rtl|verilog|test/i.test(title(j)))s+=4;
    if(profile.families.length){
      const noise=genericNoise.some(x=>t.includes(x));
      if(noise&&!/software|hardware|engineering|validation|embedded|firmware|semiconductor/.test(t))s-=55;
    }
    if(j?.posted_at){const d=(Date.now()-new Date(j.posted_at).getTime())/86400000;if(d<1)s+=4;else if(d<3)s+=3;else if(d<7)s+=1}
    return Math.max(0,Math.min(99,Math.round(s)));
  }
  function ranked(list){return [...list].sort((a,b)=>score(b)-score(a)||(new Date(b?.posted_at||0)-new Date(a?.posted_at||0)))}
  function matchLabel(s){return s>=88?'Great match':s>=72?'Strong match':s>=55?'Good match':s>=35?'Worth a look':'Low match'}
  function logo(j){
    if(j?.company_logo_url)return j.company_logo_url;
    const key=lower(company(j)); const hit=Object.keys(companyDomains).find(k=>key===k||key.includes(k));
    const domain=hit?companyDomains[hit]:'';
    return domain?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`:'';
  }
  function save(id){try{const a=new Set(JSON.parse(localStorage.getItem('glueful_saved_jobs')||'[]').map(String)),k=String(id);a.has(k)?a.delete(k):a.add(k);localStorage.setItem('glueful_saved_jobs',JSON.stringify([...a]));return a.has(k)}catch{return false}}
  function isSaved(id){try{return JSON.parse(localStorage.getItem('glueful_saved_jobs')||'[]').map(String).includes(String(id))}catch{return false}}
  function card(j){const s=score(j),img=logo(j);return `<article class="g16-card" data-job-id="${esc(j.id)}"><button class="g16-save" data-save aria-label="Save job">${isSaved(j.id)?'♥':'♡'}</button><div class="g16-head"><div class="g16-logo">${img?`<img src="${esc(img)}" alt="">`:esc(initials(company(j)))}</div><div class="g16-main"><strong>${esc(title(j))}</strong><span>${esc(company(j))}</span><small>${esc(location(j)||'Location not specified')}</small></div></div><div class="g16-meta"><span class="g16-badge">${esc(matchLabel(s))}</span><span class="g16-score">${s}% match</span></div><button class="g16-open" data-open>Open role →</button></article>`}
  function row(j){const s=score(j),img=logo(j);return `<button class="g16-row" type="button" data-job-id="${esc(j.id)}"><div class="g16-row-logo">${img?`<img src="${esc(img)}" alt="">`:esc(initials(company(j)))}</div><div><strong>${esc(title(j))}</strong><span>${esc(company(j))}</span><small>${esc(location(j)||'Location not specified')} · ${s}% match</small></div></button>`}
  function openDetails(j){
    const old=document.querySelector('.g16-layer');if(old)old.remove();const layer=document.createElement('div');layer.className='g16-layer';const u=String(url(j)||'');const img=logo(j);layer.innerHTML=`<div class="g16-panel"><header><button type="button" data-close>← Back</button></header><div class="g16-detail-logo">${img?`<img src="${esc(img)}" alt="">`:esc(initials(company(j)))}</div><h1>${esc(title(j))}</h1><h3>${esc(company(j))}</h3><p class="g16-loc">${esc(location(j)||'Location not specified')}</p><div class="g16-match">${esc(matchLabel(score(j)))} · ${score(j)}% match</div><main>${esc(desc(j)||'Full job description is not available.').replace(/\n/g,'<br>')}</main><div class="g16-detail-actions"><button type="button" data-edit-resume>✎ Edit resume for this job</button><button type="button" data-save>${isSaved(j.id)?'♥ Saved':'♡ Save'}</button>${/^https?:\/\//i.test(u)?`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Apply now ↗</a>`:''}</div></div>`;document.body.appendChild(layer);document.body.style.overflow='hidden';layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow');return}if(e.target.closest('[data-save]'))e.target.textContent=save(j.id)?'♥ Saved':'♡ Save';if(e.target.closest('[data-edit-resume]')){layer.remove();document.body.style.removeProperty('overflow');window.gluefulResumeJobContext={id:String(j.id),title:title(j),company:company(j),location:location(j),source:j};try{window.openJobResumeEditor?.(j.id)}catch(err){console.error('[Glueful V16] Resume Studio opener failed',err)}}})
  }
  function companies(list){const map=new Map();ranked(list).forEach(j=>{const n=company(j);if(!n)return;const x=map.get(n)||{name:n,count:0,best:score(j),job:j};x.count++;if(score(j)>x.best){x.best=score(j);x.job=j}map.set(n,x)});return [...map.values()].sort((a,b)=>b.best-a.best||b.count-a.count).slice(0,24)}
  function searchModal(){const layer=document.createElement('div');layer.className='g16-layer';layer.innerHTML='<div class="g16-panel"><header><input id="g16-q" type="search" placeholder="Search jobs, skills or companies…" autofocus><button data-close>Cancel</button></header><div id="g16-results"></div></div>';document.body.appendChild(layer);document.body.style.overflow='hidden';const q=layer.querySelector('#g16-q'),r=layer.querySelector('#g16-results');const draw=()=>{const term=lower(q.value);const out=term?ranked(jobs.filter(j=>text(j).includes(term))).slice(0,300):[];r.innerHTML=term?`<div class="g16-result-count">${out.length} matching results</div>${out.map(row).join('')}`:'<div class="g16-empty">Type a role, skill or company name.</div>'};q.addEventListener('input',draw);layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow');return}const b=e.target.closest('[data-job-id]');if(b){const j=jobs.find(x=>String(x.id)===String(b.dataset.jobId));if(j){layer.remove();document.body.style.removeProperty('overflow');openDetails(j)}}});draw()}
  function allModal(){const layer=document.createElement('div');layer.className='g16-layer';layer.innerHTML=`<div class="g16-panel"><header><h2 style="margin:0;flex:1">All jobs <span style="color:#a98bff">${jobs.length}</span></h2><button data-close>×</button></header><div id="g16-all"></div></div>`;document.body.appendChild(layer);document.body.style.overflow='hidden';const r=layer.querySelector('#g16-all');r.innerHTML=ranked(jobs).slice(0,500).map(row).join('');layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow');return}const b=e.target.closest('[data-job-id]');if(b){const j=jobs.find(x=>String(x.id)===String(b.dataset.jobId));if(j){layer.remove();document.body.style.removeProperty('overflow');openDetails(j)}}})}
  function companyModal(c){const list=ranked(jobs.filter(j=>lower(company(j))===lower(c)));const layer=document.createElement('div');layer.className='g16-layer';layer.innerHTML=`<div class="g16-panel"><header><h2 style="margin:0;flex:1">${esc(c)} <span style="color:#a98bff">${list.length}</span></h2><button data-close>×</button></header><div>${list.slice(0,500).map(row).join('')}</div></div>`;document.body.appendChild(layer);document.body.style.overflow='hidden';layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow');return}const b=e.target.closest('[data-job-id]');if(b){const j=list.find(x=>String(x.id)===String(b.dataset.jobId));if(j){layer.remove();document.body.style.removeProperty('overflow');openDetails(j)}}})}
  function render(){
    const view=document.getElementById('jobs-view');if(!view)return; const root=view.querySelector('#glueful-jobs-v16')||document.createElement('div');root.id='glueful-jobs-v16';root.className='g16-root';if(!root.parentNode)view.appendChild(root); [...view.children].forEach(n=>{if(n!==root)n.style.setProperty('display','none','important')});
    const top=ranked(jobs).slice(0,30), comps=companies(jobs); const matched=top.filter(j=>score(j)>=35); const curated=matched.length?matched:top.slice(0,12);
    root.innerHTML=`<div class="g16-page"><div class="g16-top"><div><div class="g16-kicker">YOUR NEXT MOVE · V16</div><h1>Find your next big move</h1><p>Fresh roles, smart matches &amp; company radar.</p></div></div><button class="g16-search" type="button" data-search>⌕&nbsp;&nbsp; Search roles, skills, companies…</button><div class="g16-tabs"><button class="active" type="button">For You</button><button type="button" data-all>All jobs ${jobs.length}</button><button type="button" data-companies>Companies</button></div><section><div class="g16-head"><div><h2>Curated for you <span>${curated.length}</span></h2><p>Personalized from your profile, skills, experience &amp; activity</p></div><button class="g16-see" data-curated>See all →</button></div><div class="g16-rail">${curated.map(card).join('')}</div></section><section><div class="g16-head"><div><h2>Top companies hiring</h2><p>Swipe to explore employers with your strongest matches</p></div><button class="g16-see" data-companies>See all →</button></div><div class="g16-company-rail">${comps.map(c=>{const img=logo(c.job);return `<button class="g16-company" type="button" data-company="${esc(c.name)}"><div>${img?`<img src="${esc(img)}" alt="">`:esc(initials(c.name))}</div><strong>${esc(c.name)}</strong><b>${c.count}</b><small>roles · best ${c.best}%</small></button>`}).join('')}</div></section><section class="g16-explore"><button type="button" data-all>✦ Discover more roles</button><button type="button" data-search>⌕ Search everything</button></section></div>`;
    root.querySelector('[data-search]')?.addEventListener('click',searchModal);
    root.querySelectorAll('[data-all]').forEach(b=>b.addEventListener('click',allModal));
    root.querySelectorAll('[data-curated]').forEach(b=>b.addEventListener('click',allModal));
    root.querySelectorAll('[data-companies]').forEach(b=>b.addEventListener('click',()=>allModal()));
    root.querySelectorAll('[data-company]').forEach(b=>b.addEventListener('click',()=>companyModal(b.dataset.company)));
    root.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const j=jobs.find(x=>String(x.id)===String(b.closest('[data-job-id]')?.dataset.jobId));if(j)openDetails(j)}));
    root.querySelectorAll('.g16-card').forEach(c=>c.addEventListener('click',e=>{if(e.target.closest('[data-save]')||e.target.closest('[data-open]'))return;const j=jobs.find(x=>String(x.id)===String(c.dataset.jobId));if(j)openDetails(j)}));
    root.querySelectorAll('[data-save]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const c=e.target.closest('[data-job-id]');b.textContent=save(c?.dataset.jobId)?'♥':'♡'}));
    try{window.loadCompanyLogos?.();window.gluefulJobsLogoRefresh?.()}catch(_){ }
    window.__GLUEFUL_JOBS_V16_RENDERED__=true;
  }
  async function boot(){buildProfile();await ensureJobs();if(!jobs.length){setTimeout(boot,800);return}render();booted=true;window.gluefulJobsV16={getJobs:()=>jobs,refresh:render,score};}
  const css=document.createElement('style');css.id='g16-css';css.textContent=`#glueful-jobs-v16{font-family:Inter,system-ui,sans-serif;color:#f5f7ff}#glueful-jobs-v16 *{box-sizing:border-box}.g16-page{max-width:1080px;margin:0 auto;padding:18px 12px 120px}.g16-kicker{font-size:10px;letter-spacing:1.7px;color:#a98bff;font-weight:900}.g16-top h1{margin:4px 0;font-size:28px}.g16-top p{margin:5px 0;color:#8f98aa;font-size:12px}.g16-search{width:100%;margin:18px 0 14px;padding:15px 16px;border:1px solid rgba(255,255,255,.1);background:#111620;border-radius:15px;color:#8f98aa;text-align:left;font-size:14px}.g16-tabs{display:flex;gap:8px;overflow:auto;margin-bottom:22px}.g16-tabs button{border:1px solid rgba(255,255,255,.1);background:#111620;color:#9aa2b2;border-radius:999px;padding:9px 14px;white-space:nowrap;font-weight:800}.g16-tabs .active{background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;border-color:transparent}.g16-head{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-bottom:10px}.g16-head h2{margin:0;font-size:18px}.g16-head h2 span{color:#a98bff}.g16-head p{margin:4px 0 0;color:#697184;font-size:10px}.g16-see{border:0;background:none;color:#a98bff;font-weight:900}.g16-rail,.g16-company-rail{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 10px;scrollbar-width:none}.g16-rail::-webkit-scrollbar,.g16-company-rail::-webkit-scrollbar{display:none}.g16-card{flex:0 0 min(82vw,330px);min-height:205px;position:relative;padding:14px;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,#151a25,#111620);border-radius:17px;scroll-snap-align:start;cursor:pointer}.g16-head{margin-bottom:0}.g16-card .g16-head{justify-content:flex-start;align-items:flex-start}.g16-head .g16-main{min-width:0}.g16-logo,.g16-detail-logo{background:#fff;color:#4d38b8;border-radius:12px;overflow:hidden;display:grid;place-items:center;font-weight:900}.g16-logo{width:46px;height:46px;flex:0 0 46px}.g16-logo img,.g16-company img,.g16-detail-logo img{width:100%;height:100%;object-fit:contain}.g16-main{min-width:0;flex:1}.g16-main strong,.g16-main span,.g16-main small{display:block}.g16-main strong{font-size:14px;line-height:1.35}.g16-main span,.g16-main small{color:#9aa2b2;font-size:10px;margin-top:4px}.g16-main strong,.g16-main span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.g16-meta{display:flex;justify-content:space-between;align-items:center;margin-top:18px}.g16-badge,.g16-match{display:inline-flex;padding:6px 9px;border-radius:999px;background:rgba(71,211,157,.1);color:#61d8a7;font-size:9px;font-weight:900}.g16-score{color:#a98bff;font-size:10px}.g16-open{position:absolute;left:14px;right:14px;bottom:14px;border:0;background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;padding:10px;border-radius:11px;font-weight:900}.g16-save{position:absolute;right:12px;top:12px;border:0;background:rgba(255,255,255,.08);color:#e5ddff;border-radius:999px;width:30px;height:30px;z-index:2}.g16-company{flex:0 0 132px;padding:13px 10px;border:1px solid rgba(255,255,255,.09);background:#111620;border-radius:15px;color:#fff;text-align:left}.g16-company>div{width:42px;height:42px;border-radius:11px;background:#fff;color:#4d38b8;display:grid;place-items:center;overflow:hidden}.g16-company strong,.g16-company b,.g16-company small{display:block;margin-top:7px}.g16-company strong{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.g16-company b{color:#a98bff;font-size:12px}.g16-company small{color:#697184;font-size:9px}.g16-explore{display:flex;gap:10px;margin-top:12px}.g16-explore button{flex:1;border:1px solid rgba(255,255,255,.09);background:#111620;color:#e9ecf3;border-radius:13px;padding:14px;font-weight:800}.g16-layer{position:fixed;inset:0;z-index:100000;background:rgba(3,5,10,.86);display:flex;align-items:flex-end;justify-content:center}.g16-panel{width:100%;max-width:860px;max-height:92vh;overflow:auto;background:#151a25;border-radius:20px 20px 0 0;padding:18px}.g16-panel header{display:flex;align-items:center;gap:10px}.g16-panel header button{border:0;background:#111620;color:#fff;border-radius:10px;padding:10px 12px}.g16-panel input{flex:1;border:1px solid rgba(255,255,255,.1);background:#111620;color:#fff;border-radius:12px;padding:12px}.g16-row{display:flex;align-items:center;gap:10px;width:100%;padding:11px;margin-top:8px;border:1px solid rgba(255,255,255,.1);background:#111620;color:#fff;border-radius:13px;text-align:left}.g16-row-logo{width:42px;height:42px;flex:0 0 42px;border-radius:10px;background:#fff;color:#4d38b8;display:grid;place-items:center;overflow:hidden}.g16-row strong,.g16-row span,.g16-row small{display:block}.g16-row strong{font-size:12px}.g16-row span,.g16-row small{color:#9aa2b2;font-size:10px;margin-top:3px}.g16-empty{padding:24px;color:#8f98aa}.g16-result-count{margin:12px 0;color:#a98bff;font-size:11px}.g16-detail-logo{width:60px;height:60px;margin:14px 0}.g16-panel h1{font-size:23px;margin:8px 0 4px}.g16-panel h3{margin:0;color:#c3b9e8}.g16-loc{color:#9aa2b2}.g16-panel main{border-top:1px solid rgba(255,255,255,.1);margin-top:16px;padding-top:16px;color:#c5cbd7;line-height:1.7;font-size:13px}.g16-detail-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.g16-detail-actions button,.g16-detail-actions a{display:flex;align-items:center;justify-content:center;padding:13px;border-radius:13px;font-weight:900}.g16-detail-actions button{border:1px solid rgba(255,255,255,.1);background:#111620;color:#fff}.g16-detail-actions button:first-child{grid-column:1/-1;border-color:rgba(157,126,255,.35);background:linear-gradient(135deg,rgba(123,54,255,.18),rgba(62,117,255,.18))}.g16-detail-actions a{background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;text-decoration:none}.g16-detail-actions button:nth-child(2){grid-column:1}.g16-detail-actions a{grid-column:2}@media(max-width:600px){.g16-page{padding:16px 10px 120px}.g16-top h1{font-size:25px}.g16-card{flex-basis:calc(100vw - 44px)}}`;document.head.appendChild(css);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();