/* Glueful Jobs V15 — index-mounted authoritative renderer.
   Purpose: make the Jobs UI authoritative even when an older renderer or stale
   service-worker response is present. It owns #jobs-view and hides legacy
   children instead of relying on another renderer to disappear.
*/
(function(){
  'use strict';
  if (window.__GLUEFUL_JOBS_V15__) return;
  window.__GLUEFUL_JOBS_V15__ = true;

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const lower=v=>clean(v).toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'Company');
  const title=j=>clean(j?.title||j?.job_title||j?.position||'Untitled role');
  const location=j=>clean(j?.location||j?.city||j?.job_location||'');
  const description=j=>clean(j?.description||j?.job_description||j?.summary||j?.snippet||'');
  const applyUrl=j=>j?.employer_job_url||j?.application_url||j?.apply_url||j?.job_url||j?.url||j?.source_url||j?.external_url||'';
  const text=j=>lower(`${title(j)} ${company(j)} ${description(j)} ${location(j)}`);
  const major=['google','microsoft','amazon','meta','apple','nvidia','qualcomm','amd','intel','nxp','arm','broadcom','texas instruments','renesas','stmicroelectronics','samsung','ibm','oracle','adobe','salesforce','bosch','siemens','synopsys','cadence'];
  const bad=['talent assistant','customer support','customer service','sales representative','sales associate','recruiter','recruiting','human resources','hr manager','marketing specialist','content producer','copywriter','account executive','business development representative','finance analyst','administrative assistant'];
  let jobs=[];

  const score=j=>{
    let s=Number(j?.match_score??j?.score??j?._score??0); if(!Number.isFinite(s)) s=0;
    const t=text(j), c=lower(company(j));
    if(major.some(x=>c.includes(x))) s+=10;
    bad.forEach(x=>{if(t.includes(x))s-=50;});
    if(/engineer|developer|scientist|architect|validation|verification|firmware|hardware|embedded|software|silicon|soc|semiconductor|pmic|asic|fpga|rtl|verilog|test/i.test(title(j)))s+=10;
    if(j?.posted_at){const d=(Date.now()-new Date(j.posted_at).getTime())/86400000;if(d<3)s+=5;else if(d<7)s+=2;}
    return Math.max(0,Math.min(99,Math.round(s)));
  };
  const ranked=a=>[...(a||[])].sort((x,y)=>score(y)-score(x)||(new Date(y?.posted_at||0)-new Date(x?.posted_at||0)));
  const label=j=>{const s=score(j);return s>=85?'Great match':s>=70?'Strong match':s>=50?'Good match':'Relevant'};
  const initials=n=>clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  const logo=j=>j?.company_logo_url||'';
  const http=u=>/^https?:\/\//i.test(String(u||''));
  const saved=id=>{try{return JSON.parse(localStorage.getItem('glueful_saved_jobs')||'[]').map(String).includes(String(id))}catch{return false}};
  const toggleSaved=id=>{try{const a=new Set(JSON.parse(localStorage.getItem('glueful_saved_jobs')||'[]').map(String));const k=String(id);a.has(k)?a.delete(k):a.add(k);localStorage.setItem('glueful_saved_jobs',JSON.stringify([...a]));return a.has(k)}catch{return false}};

  function existing(){
    try{if(typeof window.getActiveJobData==='function'){const d=window.getActiveJobData();if(Array.isArray(d)&&d.length)return d;}}catch(e){console.warn('[Glueful V15] existing job data unavailable',e)}
    return [];
  }
  async function load(){
    const d=existing(); if(d.length){jobs=d;return true;}
    try{
      const c=window.supabaseClient||window.supabase?.createClient?.('https://xztbhheexianejsvwpva.supabase.co','sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      if(c){const r=await c.from('job_listings').select('*').eq('is_active',true).order('posted_at',{ascending:false}).limit(1000);if(!r.error&&Array.isArray(r.data)&&r.data.length){jobs=r.data;return true;}}
    }catch(e){console.warn('[Glueful V15] Supabase load failed',e)}
    return false;
  }

  const css=`
#glueful-jobs-v15{font-family:Inter,system-ui,sans-serif;color:var(--text,#f5f7ff);display:block}
#glueful-jobs-v15 *{box-sizing:border-box}.g15-page{max-width:1080px;margin:0 auto;padding:18px 12px 120px}
.g15-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.g15-kicker{font-size:10px;letter-spacing:1.7px;color:#a98bff;font-weight:900}.g15-top h1{margin:4px 0;font-size:28px;line-height:1.15}.g15-top p{margin:5px 0;color:#8f98aa;font-size:12px}
.g15-search{width:100%;margin:18px 0 14px;padding:14px 16px;border:1px solid rgba(255,255,255,.10);background:#111620;border-radius:15px;color:#9ba4b7;text-align:left;font-size:14px}
.g15-tabs{display:flex;gap:8px;overflow:auto;margin-bottom:22px;scrollbar-width:none}.g15-tabs::-webkit-scrollbar{display:none}.g15-tabs button{border:1px solid rgba(255,255,255,.10);background:#111620;color:#9aa2b2;border-radius:999px;padding:9px 14px;white-space:nowrap;font-weight:800}.g15-tabs button.active{background:linear-gradient(135deg,#7b36ff,#3e75ff);border-color:transparent;color:#fff}
.g15-section{margin:0 0 26px}.g15-head{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-bottom:10px}.g15-head h2{margin:0;font-size:17px}.g15-head p{margin:4px 0 0;color:#697184;font-size:10px}.g15-see{border:0;background:none;color:#a98bff;font-weight:900;white-space:nowrap}
.g15-rail{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 8px;scrollbar-width:none}.g15-rail::-webkit-scrollbar{display:none}.g15-card{flex:0 0 min(82vw,330px);min-height:196px;position:relative;padding:14px;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,#151a25,#111620);border-radius:17px;scroll-snap-align:start}.g15-card-head{display:flex;gap:10px}.g15-logo{width:46px;height:46px;flex:0 0 46px;background:#fff;color:#4d38b8;border-radius:12px;overflow:hidden;display:grid;place-items:center;font-weight:900}.g15-logo img{width:100%;height:100%;object-fit:contain}.g15-main{min-width:0;flex:1}.g15-main strong{display:block;font-size:14px;line-height:1.3}.g15-main span,.g15-main small{display:block;color:#9aa2b2;font-size:10px;margin-top:4px}.g15-main strong,.g15-main span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.g15-meta{display:flex;justify-content:space-between;align-items:center;margin-top:16px}.g15-badge{padding:5px 8px;border-radius:999px;background:rgba(71,211,157,.10);color:#61d8a7;font-size:9px;font-weight:900}.g15-score{color:#9c87e8;font-size:10px}.g15-open{position:absolute;left:14px;right:14px;bottom:14px;border:0;background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;padding:10px;border-radius:11px;font-weight:900}.g15-save{position:absolute;right:12px;top:12px;border:0;background:rgba(255,255,255,.06);color:#d7caff;border-radius:999px;width:30px;height:30px}.g15-company-rail{display:flex;gap:10px;overflow-x:auto;padding:2px 2px 8px;scrollbar-width:none}.g15-company-rail::-webkit-scrollbar{display:none}.g15-company{flex:0 0 126px;padding:14px 10px;border:1px solid rgba(255,255,255,.09);background:#111620;border-radius:15px;color:#fff;text-align:left}.g15-company>div{width:42px;height:42px;background:#fff;color:#4d38b8;border-radius:11px;display:grid;place-items:center;overflow:hidden;font-weight:900}.g15-company img{width:100%;height:100%;object-fit:contain}.g15-company strong,.g15-company b,.g15-company small{display:block;margin-top:7px}.g15-company strong{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.g15-company b{font-size:10px;color:#a98bff}.g15-company small{font-size:9px;color:#697184}.g15-empty{padding:22px;border:1px dashed rgba(255,255,255,.12);border-radius:14px;color:#8f98aa}.g15-layer{position:fixed;inset:0;z-index:100000;background:rgba(3,5,10,.86);display:flex;align-items:flex-end;justify-content:center}.g15-panel{width:100%;max-width:860px;max-height:92vh;overflow:auto;background:#151a25;border-radius:20px 20px 0 0;padding:18px}.g15-panel header{display:flex;gap:10px;align-items:center}.g15-panel header button{border:0;background:#111620;color:#fff;border-radius:10px;padding:9px 12px}.g15-panel input{flex:1;border:1px solid rgba(255,255,255,.1);background:#111620;color:#fff;border-radius:12px;padding:12px}.g15-row{display:flex;align-items:center;gap:10px;width:100%;padding:11px;margin-top:8px;border:1px solid rgba(255,255,255,.1);background:#111620;color:#fff;border-radius:13px;text-align:left}.g15-row-logo{width:42px;height:42px;flex:0 0 42px;background:#fff;color:#4d38b8;border-radius:10px;display:grid;place-items:center;overflow:hidden;font-weight:900}.g15-row-logo img{width:100%;height:100%;object-fit:contain}.g15-row>div:last-child{min-width:0}.g15-row strong,.g15-row span,.g15-row small{display:block}.g15-row strong{font-size:12px}.g15-row span,.g15-row small{color:#9aa2b2;font-size:10px;margin-top:3px}.g15-detail h1{font-size:22px;margin:16px 0 5px}.g15-detail h3{margin:0;color:#c3b9e8}.g15-detail main{border-top:1px solid rgba(255,255,255,.1);margin-top:16px;padding-top:16px;color:#c5cbd7;line-height:1.7;font-size:13px}.g15-footer{display:flex;gap:10px;margin-top:18px}.g15-footer button,.g15-footer a{flex:1;text-align:center;padding:13px;border-radius:13px;font-weight:900}.g15-footer button{border:1px solid rgba(255,255,255,.1);background:#111620;color:#fff}.g15-footer a{background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;text-decoration:none}
@media(max-width:600px){.g15-page{padding:16px 10px 120px}.g15-top h1{font-size:25px}.g15-card{flex-basis:calc(100vw - 44px)}}`;
  function style(){if(document.getElementById('g15-css'))return;const s=document.createElement('style');s.id='g15-css';s.textContent=css;document.head.appendChild(s)}
  function hideLegacy(view,root){[...view.children].forEach(n=>{if(n!==root)n.style.setProperty('display','none','important')});}
  function openDetails(j){
    const old=document.querySelector('.g15-layer');if(old)old.remove();const layer=document.createElement('div');layer.className='g15-layer';const u=http(applyUrl(j))?applyUrl(j):'';
    layer.innerHTML=`<div class="g15-panel g15-detail"><header><button type="button" data-close>← Back</button></header><div class="g15-logo" style="margin-top:14px">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:esc(initials(company(j)))}</div><h1>${esc(title(j))}</h1><h3>${esc(company(j))}</h3><p>${esc(location(j)||'Location not specified')}</p><div class="g15-badge">${esc(label(j))} · ${score(j)}% match</div><main>${esc(description(j)||'Full job description is not available.').replace(/\n/g,'<br>')}</main><div class="g15-footer"><button type="button" data-save>${saved(j.id)?'♥ Saved':'♡ Save'}</button>${u?`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Apply now ↗</a>`:''}</div></div>`;
    document.body.appendChild(layer);document.body.style.overflow='hidden';layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow')}});const b=layer.querySelector('[data-save]');if(b)b.onclick=()=>b.textContent=toggleSaved(j.id)?'♥ Saved':'♡ Save';
  }
  function search(){const layer=document.createElement('div');layer.className='g15-layer';layer.innerHTML='<div class="g15-panel"><header><input id="g15-q" type="search" placeholder="Search jobs, skills or companies…" autofocus><button data-close>Cancel</button></header><div id="g15-results"></div></div>';document.body.appendChild(layer);document.body.style.overflow='hidden';const q=layer.querySelector('#g15-q'),r=layer.querySelector('#g15-results');const draw=()=>{const x=lower(q.value),list=x?ranked(jobs.filter(j=>text(j).includes(x))):[];r.innerHTML=x?`<div style="color:#a98bff;font-size:11px;margin:12px 0">${list.length} results</div>${list.slice(0,500).map(row).join('')}`:'<div class="g15-empty">Search any job title, company or skill.</div>'};q.addEventListener('input',draw);draw();layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow');return}const b=e.target.closest('[data-row]');if(b){const j=jobs.find(x=>String(x.id)===String(b.dataset.row));if(j){layer.remove();document.body.style.removeProperty('overflow');openDetails(j)}}})}
  function row(j){return `<button type="button" class="g15-row" data-row="${esc(j.id)}"><div class="g15-row-logo">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:esc(initials(company(j)))}</div><div><strong>${esc(title(j))}</strong><span>${esc(company(j))}</span><small>${esc(location(j)||'Location not specified')} · ${score(j)}% match</small></div></button>`}
  function allList(name,list){const layer=document.createElement('div');layer.className='g15-layer';layer.innerHTML=`<div class="g15-panel"><header><div style="flex:1"><h2 style="margin:0">${esc(name)} <span style="color:#a98bff">${list.length}</span></h2></div><button data-close>Close</button></header><div>${list.slice(0,500).map(row).join('')||'<div class="g15-empty">No roles found.</div>'}</div></div>`;document.body.appendChild(layer);document.body.style.overflow='hidden';layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow');return}const b=e.target.closest('[data-row]');if(b){const j=jobs.find(x=>String(x.id)===String(b.dataset.row));if(j){layer.remove();document.body.style.removeProperty('overflow');openDetails(j)}}})}
  function render(view){
    style();
    let root=document.getElementById('glueful-jobs-v15');
    if(!root){root=document.createElement('div');root.id='glueful-jobs-v15';view.appendChild(root)}
    hideLegacy(view,root);
    const sorted=ranked(jobs),curated=sorted.filter(j=>score(j)>=35).slice(0,30),companyMap=new Map();sorted.forEach(j=>companyMap.set(company(j),(companyMap.get(company(j))||0)+1));
    const companies=[...companyMap].sort((a,b)=>b[1]-a[1]).slice(0,30);
    root.innerHTML=`<div class="g15-page"><header class="g15-top"><div><div class="g15-kicker">YOUR NEXT MOVE · V15</div><h1>Find your next big move</h1><p>Fresh roles, smart matches & company radar.</p></div></header><button class="g15-search" type="button" data-search>⌕ &nbsp; Search jobs, skills or companies…</button><nav class="g15-tabs"><button class="active" type="button">For You</button><button type="button" data-all>All jobs <b>${sorted.length}</b></button><button type="button" data-companies>Companies</button></nav><section class="g15-section"><div class="g15-head"><div><h2>Curated for you <span style="color:#a98bff">${curated.length}</span></h2><p>Personalized matches from your available job data</p></div><button class="g15-see" data-see>See all →</button></div><div class="g15-rail">${curated.map(card).join('')||'<div class="g15-empty">No matching roles found yet.</div>'}</div></section><section class="g15-section"><div class="g15-head"><div><h2>Top companies hiring</h2><p>Swipe to explore employers</p></div><button class="g15-see" data-companies>See all →</button></div><div class="g15-company-rail">${companies.map(([n,c])=>`<button type="button" class="g15-company" data-company="${esc(n)}"><div>${logo({company:n})?`<img src="${esc(logo({company:n}))}" alt="">`:esc(initials(n))}</div><strong>${esc(n)}</strong><b>${c}</b><small>${c===1?'role':'roles'}</small></button>`).join('')}</div></section></div>`;
    root.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.search!==undefined)return search();if(b.dataset.all!==undefined)return allList('All jobs',sorted);if(b.dataset.see!==undefined)return allList('Curated for you',curated);if(b.dataset.companies!==undefined)return allList('Companies',sorted);if(b.dataset.open!==undefined){const j=jobs.find(x=>String(x.id)===String(b.dataset.open));if(j)return openDetails(j)}if(b.dataset.save!==undefined){const j=jobs.find(x=>String(x.id)===String(b.dataset.save));if(j){b.textContent=toggleSaved(j.id)?'♥':'♡';}}if(b.dataset.company!==undefined){allList(b.dataset.company,sorted.filter(j=>company(j)===b.dataset.company))}};
    root.querySelectorAll('[data-save]').forEach(()=>{});
  }
  function card(j){return `<article class="g15-card"><div class="g15-card-head"><div class="g15-logo">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:esc(initials(company(j)))}</div><div class="g15-main"><strong>${esc(title(j))}</strong><span>${esc(company(j))}</span><small>📍 ${esc(location(j)||'Location not specified')}</small></div><button class="g15-save" type="button" data-save="${esc(j.id)}">${saved(j.id)?'♥':'♡'}</button></div><div class="g15-meta"><span class="g15-badge">${esc(label(j))}</span><span class="g15-score">${score(j)}% match</span></div><button class="g15-open" type="button" data-open="${esc(j.id)}">Open role →</button></article>`}

  let lastView=null,observer=null;
  function mount(){
    const view=document.getElementById('jobs-view');
    if(!view)return false;
    lastView=view;render(view);
    if(!observer){observer=new MutationObserver(()=>{const v=document.getElementById('jobs-view');if(v&&v===lastView){const r=document.getElementById('glueful-jobs-v15');if(!r||!r.isConnected){render(v)}else hideLegacy(v,r)}});observer.observe(view,{childList:true});}
    return true;
  }
  async function boot(){
    const ok=await load();
    if(!ok)console.warn('[Glueful V15] No jobs available to render');
    mount();
    setTimeout(mount,250);setTimeout(mount,1000);setTimeout(mount,2500);
  }
  window.gluefulJobsV15={mount,refresh:boot,getJobs:()=>jobs};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
