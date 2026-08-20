/* Glueful Jobs V12 — authoritative discovery-first Jobs UI
 * Replaces the legacy Matching jobs renderer inside #jobs-view.
 * Features: personalized curated rail, horizontal company rail, search,
 * full details, save/recent, See All, filter handoff, responsive touch scroll.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_V12_LOADED__) return;
  window.__GLUEFUL_JOBS_V12_LOADED__ = true;

  const SUPABASE_URL='https://xztbhheexianejsvwpva.supabase.co';
  const SUPABASE_KEY='sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';
  const FEED_URL=SUPABASE_URL+'/functions/v1/get-personalized-jobs';
  const TOP_COMPANIES=['google','microsoft','apple','amazon','meta','nvidia','qualcomm','amd','intel','nxp','arm','broadcom','texas instruments','renesas','stmicroelectronics','samsung','ibm','oracle','bosch','siemens','honeywell','synopsys','cadence','micron','marvell','sony','dell','tesla','jpmorgan','jp morgan','goldman sachs'];
  const POSITIVE=['engineer','developer','scientist','architect','validation','verification','firmware','hardware','embedded','software','silicon','soc','semiconductor','pmic','asic','fpga','rtl','verilog','vlsi','bms','electronics','device','platform','systems','python','c','c++','linux','arm','test','automation','design'];
  const NEGATIVE=['talent assistant','customer support','customer service','sales representative','sales associate','recruiter','recruiting','human resources','hr manager','marketing specialist','content producer','copywriter','account executive','business development representative','finance analyst','administrative assistant'];
  const ICONS={google:'google',microsoft:'microsoft',apple:'apple',amazon:'amazon',meta:'meta',nvidia:'nvidia',qualcomm:'qualcomm',amd:'amd',intel:'intel',nxp:'nxp',arm:'arm',broadcom:'broadcom',ibm:'ibm',oracle:'oracle',samsung:'samsung',anthropic:'anthropic',cloudflare:'cloudflare',bosch:'bosch',siemens:'siemens',honeywell:'honeywell',renesas:'renesas',tesla:'tesla',jpmorgan:'jpmorgan',goldmansachs:'goldmansachs'};

  let jobs=[];
  let applications=[];
  let root=null;
  let searchTimer=null;
  let activeSearch='';

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const lower=v=>clean(v).toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'Company');
  const title=j=>clean(j?.title||j?.job_title||j?.position||'Untitled role');
  const location=j=>clean(j?.location||j?.city||j?.job_location||'');
  const description=j=>clean(j?.description||j?.job_description||j?.summary||j?.snippet||'');
  const url=j=>j?.employer_job_url||j?.application_url||j?.apply_url||j?.job_url||j?.url||j?.source_url||j?.external_url||'';
  const text=j=>lower(`${title(j)} ${company(j)} ${description(j)} ${location(j)}`);
  const isHttp=u=>/^https?:\/\//i.test(String(u||''));

  function logo(j){
    if(j?.company_logo_url) return j.company_logo_url;
    const c=lower(company(j)).replace(/[^a-z0-9]+/g,'');
    const key=Object.keys(ICONS).find(k=>c===k||c.includes(k)||k.includes(c));
    if(key) return `https://cdn.simpleicons.org/${ICONS[key]}`;
    return '';
  }
  function initials(name){return clean(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';}
  function applied(j){return applications.some(a=>String(a?.job_id??a?.id)===String(j?.id));}
  function saved(j){try{return JSON.parse(localStorage.getItem('glueful_saved_jobs')||'[]').map(String).includes(String(j.id));}catch(_){return false;}}
  function toggleSaved(j){try{const ids=new Set(JSON.parse(localStorage.getItem('glueful_saved_jobs')||'[]').map(String));const id=String(j.id);ids.has(id)?ids.delete(id):ids.add(id);localStorage.setItem('glueful_saved_jobs',JSON.stringify([...ids]));return ids.has(id);}catch(_){return false;}}
  function remember(id){try{const ids=JSON.parse(localStorage.getItem('glueful_recent_jobs')||'[]').map(String);localStorage.setItem('glueful_recent_jobs',JSON.stringify([String(id),...ids.filter(x=>x!==String(id))].slice(0,60)));}catch(_){} }
  function recent(){try{const ids=JSON.parse(localStorage.getItem('glueful_recent_jobs')||'[]').map(String);return ids.map(id=>jobs.find(j=>String(j.id)===id)).filter(Boolean);}catch(_){return[];}}
  function posted(j){if(!j?.posted_at)return '';const dt=Date.now()-new Date(j.posted_at).getTime();if(!Number.isFinite(dt))return '';const d=Math.max(0,Math.floor(dt/86400000));return d===0?'Today':d===1?'1 day ago':d<30?`${d} days ago`:`${Math.floor(d/30)} mo ago`;}
  function score(j){
    let s=Number(j?.match_score??j?.score??j?._score??0);if(!Number.isFinite(s))s=0;
    const t=text(j),c=lower(company(j));
    POSITIVE.forEach(k=>{if(t.includes(k))s+=2;});
    NEGATIVE.forEach(k=>{if(t.includes(k))s-=35;});
    if(TOP_COMPANIES.some(k=>c.includes(k)))s+=8;
    if(applied(j))s+=5;
    return Math.max(0,Math.min(99,Math.round(s)));
  }
  function rank(list){return [...(list||[])].sort((a,b)=>score(b)-score(a)||new Date(b?.posted_at||0)-new Date(a?.posted_at||0));}
  function label(j){const s=score(j);return s>=85?'Great match':s>=70?'Strong match':s>=50?'Good match':'Relevant';}

  function client(){try{return window.supabaseClient||window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});}catch(_){return null;}}
  async function getToken(){try{const c=client();const r=await c?.auth.getSession();return r?.data?.session?.access_token||'';}catch(_){return '';}}
  async function loadJobs(){
    try{
      const t=await getToken();
      if(t){
        const r=await fetch(FEED_URL,{headers:{Authorization:`Bearer ${t}`,apikey:SUPABASE_KEY,Accept:'application/json'},cache:'no-store'});
        if(r.ok){const d=await r.json();if(Array.isArray(d?.jobs)&&d.jobs.length){jobs=d.jobs;applications=Array.isArray(d.applications)?d.applications:[];return true;}}
      }
    }catch(e){console.warn('[Glueful Jobs V12] personalized feed failed',e);}
    try{
      const c=client();if(!c)throw new Error('Supabase unavailable');
      const r=await c.from('job_listings').select('*').eq('is_active',true).order('posted_at',{ascending:false}).limit(1000);
      if(r.error)throw r.error;jobs=Array.isArray(r.data)?r.data:[];applications=[];return jobs.length>0;
    }catch(e){console.error('[Glueful Jobs V12] fallback feed failed',e);return false;}
  }

  function card(j){
    const l=logo(j),c=company(j),s=score(j),sv=saved(j);
    return `<article class="g12-card" data-job-id="${esc(j.id)}" tabindex="0"><div class="g12-card-head"><div class="g12-logo">${l?`<img src="${esc(l)}" alt="${esc(c)} logo" loading="lazy" onerror="this.remove()">`:`<span>${esc(initials(c))}</span>`}</div><div class="g12-card-main"><strong>${esc(title(j))}</strong><span>${esc(c)}</span><small>${esc(location(j)||'Location not specified')}</small></div><button class="g12-save" data-save="${esc(j.id)}" type="button" aria-label="Save job">${sv?'♥':'♡'}</button></div><div class="g12-tags"><span>${esc(label(j))}</span>${posted(j)?`<small>${esc(posted(j))}</small>`:''}</div><div class="g12-card-foot"><span class="g12-score">${s}% match</span><button class="g12-open" data-open="${esc(j.id)}" type="button">Open role →</button></div></article>`;
  }
  function dots(n){return n>1?`<div class="g12-dots">${Array.from({length:Math.min(8,n)},(_,i)=>`<i class="${i===0?'on':''}"></i>`).join('')}</div>`:'';}
  function rail(list,empty='No matching roles found yet.'){return `<div class="g12-rail">${list.length?list.slice(0,30).map(card).join(''):`<div class="g12-empty">${esc(empty)}</div>`}</div>${dots(list.length)}`;}
  function section(id,name,note,list){return `<section class="g12-section" id="${id}"><div class="g12-section-head"><div><h2>${esc(name)} <b>${list.length}</b></h2><p>${esc(note)}</p></div><button class="g12-see" data-see="${id}" type="button">See all →</button></div>${rail(list)}</section>`;}

  function companyCounts(list){const m=new Map();list.forEach(j=>m.set(company(j),(m.get(company(j))||0)+1));return [...m].sort((a,b)=>{const at=TOP_COMPANIES.some(k=>lower(a[0]).includes(k)),bt=TOP_COMPANIES.some(k=>lower(b[0]).includes(k));return at===bt?b[1]-a[1]:(bt?1:-1);}).slice(0,30);}
  function companyRail(){const counts=companyCounts(jobs);return `<section class="g12-section" id="g12-companies"><div class="g12-section-head"><div><h2>Top companies hiring</h2><p>Company radar · swipe to explore</p></div><button class="g12-see" data-companies-all type="button">See all →</button></div><div class="g12-company-rail">${counts.map(([n,c])=>{const l=logo({company:n});return `<button class="g12-company" data-company="${esc(n)}" type="button"><div class="g12-company-logo">${l?`<img src="${esc(l)}" alt="">`:`<span>${esc(initials(n))}</span>`}</div><strong>${esc(n)}</strong><b>${c}</b><small>${c===1?'role':'roles'}</small></button>`;}).join('')}</div>${dots(counts.length)}</section>`;}

  function closeLayer(selector){document.querySelectorAll(selector).forEach(x=>x.remove());if(!document.querySelector('.g12-layer'))document.body.classList.remove('g12-lock');}
  function openList(titleText,list){
    closeLayer('.g12-list-layer');
    const layer=document.createElement('div');layer.className='g12-layer g12-list-layer';layer.innerHTML=`<div class="g12-panel"><header><div><h2>${esc(titleText)}</h2><p>Tap a role to open the full job description.</p></div><button data-close type="button">×</button></header><div class="g12-list">${list.length?list.map(j=>`<button class="g12-list-row" data-id="${esc(j.id)}" type="button"><div class="g12-list-logo">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:`<span>${esc(initials(company(j)))}</span>`}</div><div><strong>${esc(title(j))}</strong><span>${esc(company(j))}${location(j)?' · '+esc(location(j)):''}</span><small>${score(j)}% match${posted(j)?' · '+esc(posted(j)):''}</small></div></button>`).join(''):`<div class="g12-empty">No roles available in this view yet.</div>`}</div></div>`;document.body.appendChild(layer);document.body.classList.add('g12-lock');
    layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){closeLayer('.g12-list-layer');return;}const row=e.target.closest('.g12-list-row[data-id]');if(row){const j=jobs.find(x=>String(x.id)===String(row.dataset.id));if(j){closeLayer('.g12-list-layer');openDetails(j);}}});
  }

  function openSearch(){
    closeLayer('.g12-search-layer');
    const layer=document.createElement('div');layer.className='g12-layer g12-search-layer';layer.innerHTML=`<div class="g12-panel g12-search-panel"><header><button data-back type="button">←</button><input id="g12-search-input" type="search" value="${esc(activeSearch)}" placeholder="Search jobs, skills or companies..." autocomplete="off"><button data-close type="button">Cancel</button></header><div class="g12-search-tabs"><button class="active" type="button">All</button><button type="button">Jobs</button><button type="button">Companies</button></div><div id="g12-results"></div></div>`;document.body.appendChild(layer);document.body.classList.add('g12-lock');
    const input=layer.querySelector('#g12-search-input');input.focus();
    const render=()=>{activeSearch=input.value.trim();const q=lower(activeSearch);const matches=q?rank(jobs.filter(j=>text(j).includes(q))):[];layer.querySelector('#g12-results').innerHTML=q?`<div class="g12-result-title">${esc(activeSearch)} <b>${matches.length} results</b></div>${matches.slice(0,200).map(j=>`<button class="g12-result-row" data-id="${esc(j.id)}" type="button"><div class="g12-list-logo">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:`<span>${esc(initials(company(j)))}</span>`}</div><div><strong>${esc(title(j))}</strong><span>${esc(company(j))}</span><small>${esc(location(j)||'Location not specified')} · ${score(j)}% match</small></div></button>`).join('')||'<div class="g12-empty">No matching roles yet. Try another company, skill or title.</div>`:'<div class="g12-empty">Start typing a role, skill or company.</div>';};
    input.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(render,80);});
    layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')||e.target.closest('[data-back]')){closeLayer('.g12-search-layer');return;}const row=e.target.closest('.g12-result-row[data-id]');if(row){const j=jobs.find(x=>String(x.id)===String(row.dataset.id));if(j){closeLayer('.g12-search-layer');openDetails(j);}}});
    render();
  }

  function openDetails(j){
    remember(j.id);closeLayer('.g12-list-layer,.g12-search-layer');
    const l=logo(j),c=company(j),u=url(j);let safe=isHttp(u)?u:'';
    const layer=document.createElement('div');layer.className='g12-layer g12-detail-layer';layer.innerHTML=`<div class="g12-panel g12-detail-panel"><header><button data-back type="button">←</button><div class="g12-detail-actions"><button data-save type="button">${saved(j)?'♥':'♡'}</button><button data-close type="button">×</button></div></header><div class="g12-detail-brand"><div class="g12-detail-logo">${l?`<img src="${esc(l)}" alt="${esc(c)} logo">`:`<span>${esc(initials(c))}</span>`}</div><h1>${esc(title(j))}</h1><h3>${esc(c)}</h3><p>${esc(location(j)||'Location not specified')}${posted(j)?' · '+esc(posted(j)):''}</p><div class="g12-detail-tags"><span>${esc(label(j))}</span><span>${score(j)}% match</span>${applied(j)?'<span>Applied</span>':''}</div></div><main><h2>About the role</h2><p>${esc(description(j)||'Job description is not available yet.').replace(/\n/g,'<br>')}</p></main><footer><button data-save-footer type="button">${saved(j)?'♥ Saved':'♡ Save'}</button>${safe?`<a class="g12-apply j11-apply" data-job-id="${esc(j.id)}" href="${esc(safe)}" target="_blank" rel="noopener noreferrer">Apply Now ↗</a>`:''}</footer></div>`;document.body.appendChild(layer);document.body.classList.add('g12-lock');
    layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')||e.target.closest('[data-back]')){closeLayer('.g12-detail-layer');return;}if(e.target.closest('[data-save], [data-save-footer]')){const state=toggleSaved(j);layer.querySelector('[data-save]').textContent=state?'♥':'♡';layer.querySelector('[data-save-footer]').textContent=state?'♥ Saved':'♡ Save';}});
  }

  const CSS=`
  #glueful-jobs-v12{font-family:Inter,system-ui,sans-serif;color:var(--text,#f5f7ff)}
  #glueful-jobs-v12 .g12-page{max-width:1080px;margin:auto;padding:18px 16px calc(130px + env(safe-area-inset-bottom));}
  #glueful-jobs-v12 .g12-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.g12-kicker{font-size:10px;letter-spacing:1.7px;color:#a98bff;font-weight:900}.g12-head h1{margin:4px 0;font-size:28px}.g12-head p{margin:4px 0;color:var(--text-muted,#9aa2b2);font-size:12px}.g12-refresh{border:1px solid rgba(139,99,255,.4);background:rgba(109,59,232,.12);color:#b99cff;border-radius:12px;padding:10px 12px;font-weight:850}.g12-searchbar{margin:18px 0 12px;display:flex;align-items:center;gap:8px;padding:4px 13px;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);border-radius:15px}.g12-searchbar button{border:0;background:transparent;color:var(--text-muted,#9aa2b2);font-size:20px}.g12-searchbar input{width:100%;border:0!important;outline:0!important;background:transparent!important;color:var(--text,#fff)!important;padding:11px 0!important}.g12-filter{border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:var(--text);border-radius:12px;padding:10px 12px;font-weight:850}.g12-tabs{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-bottom:20px}.g12-tab{border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:var(--text-muted,#9aa2b2);padding:9px 15px;border-radius:999px;font-weight:850;white-space:nowrap}.g12-tab.active{background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;border-color:transparent}.g12-section{margin:25px 0}.g12-section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-bottom:10px}.g12-section-head h2{margin:0;font-size:18px}.g12-section-head h2 b{color:#9b7cff;font-size:12px}.g12-section-head p{margin:4px 0 0;color:var(--text-faint,#697184);font-size:10px}.g12-see{border:0;background:none;color:#a98bff;font-weight:900;white-space:nowrap}.g12-rail,.g12-company-rail{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:2px 2px 8px;overscroll-behavior-x:contain}.g12-rail::-webkit-scrollbar,.g12-company-rail::-webkit-scrollbar{display:none}.g12-card{position:relative;flex:0 0 min(78vw,310px);min-height:180px;scroll-snap-align:start;background:linear-gradient(180deg,#151a25,#111620);border:1px solid rgba(255,255,255,.09);border-radius:17px;padding:14px;box-sizing:border-box;cursor:pointer}.g12-card-head{display:flex;gap:10px;align-items:flex-start}.g12-logo,.g12-list-logo,.g12-detail-logo,.g12-company-logo{background:#fff;color:#4d38b8;display:grid;place-items:center;overflow:hidden;border-radius:12px}.g12-logo{width:48px;height:48px;flex:0 0 48px}.g12-logo img,.g12-list-logo img,.g12-detail-logo img,.g12-company-logo img{width:100%;height:100%;object-fit:contain}.g12-card-main{min-width:0;flex:1}.g12-card-main strong{display:block;font-size:14px;line-height:1.3}.g12-card-main span,.g12-card-main small{display:block;color:var(--text-muted,#9aa2b2);font-size:10.5px;margin-top:4px}.g12-card-main small{font-size:9.5px}.g12-save{border:0;background:none;color:#b99cff;font-size:20px;padding:0 0 0 5px}.g12-tags{display:flex;gap:7px;align-items:center;margin-top:16px}.g12-tags span{padding:5px 8px;border-radius:999px;background:rgba(71,211,157,.1);color:#61d8a7;font-size:9px;font-weight:900}.g12-tags small{color:var(--text-faint);font-size:9px}.g12-card-foot{display:flex;justify-content:space-between;align-items:center;margin-top:18px}.g12-score{font-size:9px;color:#a98bff}.g12-open{border:0;background:none;color:#a98bff;font-weight:900}.g12-dots{text-align:center;margin-top:6px}.g12-dots i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#343b49;margin:0 3px}.g12-dots i.on{width:18px;border-radius:5px;background:#9b5cff}.g12-company{flex:0 0 140px;min-height:150px;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:var(--text);border-radius:16px;padding:12px;text-align:center;scroll-snap-align:start}.g12-company-logo{width:46px;height:46px;margin:auto}.g12-company strong{display:block;font-size:11px;line-height:1.2;min-height:28px;margin-top:8px}.g12-company b{display:block;color:#9b7cff;font-size:19px;margin-top:5px}.g12-company small{font-size:9px;color:var(--text-faint)}.g12-empty{min-width:100%;padding:28px 18px;border:1px dashed rgba(255,255,255,.12);border-radius:16px;color:var(--text-muted);text-align:center;box-sizing:border-box}.g12-explore h2{font-size:18px}.g12-explore button{width:100%;display:flex;align-items:center;gap:12px;margin-top:8px;padding:14px;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:var(--text);border-radius:14px;text-align:left}.g12-explore button span{flex:1}.g12-explore small{display:block;color:var(--text-faint);margin-top:3px}.g12-layer{position:fixed;inset:0;z-index:100000;background:rgba(3,5,10,.84);display:flex;align-items:flex-end;justify-content:center;box-sizing:border-box}.g12-panel{width:100%;max-width:860px;max-height:92vh;overflow:auto;background:var(--card,#151a25);color:var(--text);border-radius:22px 22px 0 0;padding:18px 16px;box-sizing:border-box}.g12-panel header{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.g12-panel header button,.g12-detail-actions button{border:0;background:var(--surface);color:var(--text);font-size:20px;width:38px;height:38px;border-radius:11px}.g12-panel header h2{margin:0;font-size:21px}.g12-panel header p{margin:5px 0;color:var(--text-muted);font-size:11px}.g12-list,.g12-results{display:grid;gap:8px;margin-top:14px}.g12-list-row,.g12-result-row{display:flex;align-items:center;gap:10px;width:100%;padding:11px;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:var(--text);border-radius:13px;text-align:left}.g12-list-logo{width:44px;height:44px;flex:0 0 44px}.g12-list-row div:last-child,.g12-result-row div:last-child{min-width:0}.g12-list-row strong,.g12-list-row span,.g12-list-row small,.g12-result-row strong,.g12-result-row span,.g12-result-row small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.g12-list-row span,.g12-result-row span{font-size:10px;color:var(--text-muted);margin-top:4px}.g12-list-row small,.g12-result-row small{font-size:9px;color:var(--text-faint);margin-top:4px}.g12-search-panel{height:100%;max-height:100vh;border-radius:0;padding-top:14px}.g12-search-panel header{align-items:center}.g12-search-panel input{flex:1;min-width:0;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:12px;padding:11px 12px;outline:none}.g12-search-tabs{display:flex;gap:22px;border-bottom:1px solid var(--border);margin-top:14px}.g12-search-tabs button{border:0;background:none;color:var(--text-muted);padding:11px 2px;font-weight:800}.g12-search-tabs button.active{color:#a98bff;border-bottom:2px solid #8c5cff}.g12-result-title{font-size:13px;font-weight:900;margin-bottom:9px}.g12-result-title b{float:right;color:#9b7cff}.g12-detail-layer{align-items:center;padding:18px}.g12-detail-panel{border-radius:22px;max-height:94vh}.g12-detail-actions{display:flex;gap:7px}.g12-detail-brand{text-align:center;padding:12px 8px 18px}.g12-detail-logo{width:72px;height:72px;margin:auto}.g12-detail-brand h1{font-size:22px;margin:12px 0 4px}.g12-detail-brand h3{font-size:14px;margin:0;color:var(--text-muted)}.g12-detail-brand p{font-size:11px;color:var(--text-faint)}.g12-detail-tags{display:flex;justify-content:center;gap:7px;flex-wrap:wrap}.g12-detail-tags span{padding:6px 8px;border-radius:999px;background:rgba(71,211,157,.1);color:#61d8a7;font-size:9px;font-weight:900}.g12-detail-panel main{border-top:1px solid var(--border);padding-top:15px;color:var(--text-muted);line-height:1.65;font-size:13px}.g12-detail-panel footer{display:flex;gap:9px;margin-top:16px}.g12-detail-panel footer button,.g12-apply{flex:1;padding:13px;border-radius:13px;font-weight:900;border:1px solid var(--border);background:var(--surface);color:var(--text);text-decoration:none;text-align:center}.g12-apply{background:linear-gradient(135deg,#7b36ff,#3e75ff);border-color:transparent;color:#fff}.g12-lock{overflow:hidden}.g12-error{padding:20px;border:1px solid rgba(255,100,100,.25);border-radius:14px;background:rgba(255,60,60,.05);color:#ffb0b0}
  @media(min-width:800px){.g12-layer{align-items:center;padding:20px}.g12-panel{border-radius:20px}.g12-detail-panel{border-radius:20px}}
  @media(max-width:600px){#glueful-jobs-v12 .g12-page{padding-left:10px;padding-right:10px}.g12-head h1{font-size:25px}.g12-card{flex-basis:calc(100vw - 72px)}.g12-layer{align-items:flex-end}.g12-detail-layer{align-items:flex-end;padding:0}.g12-detail-panel{border-radius:20px 20px 0 0;max-height:94vh}}
  `;

  function installCSS(){if(document.getElementById('g12-css'))return;const s=document.createElement('style');s.id='g12-css';s.textContent=CSS;document.head.appendChild(s);}

  function mount(){
    const view=document.getElementById('jobs-view');
    if(!view)return false;
    if(view.dataset.gluefulJobsV12==='mounted' && root && document.body.contains(root))return true;
    const rendered=rank(jobs), curated=rendered.slice(0,30), appliedRoles=rendered.filter(applied).slice(0,30), recentRoles=recent().slice(0,20);
    const shell=document.createElement('div');shell.id='glueful-jobs-v12';shell.innerHTML=`<div class="g12-page"><header class="g12-head"><div><div class="g12-kicker">YOUR NEXT MOVE</div><h1>Find your next big move</h1><p>Fresh roles, smart matches & company radar.</p></div><button class="g12-refresh" id="g12-refresh" type="button">Refresh feed</button></header><div class="g12-searchbar"><button id="g12-search-button" type="button">⌕</button><input id="g12-search-inline" type="search" placeholder="Search jobs, skills or companies..." autocomplete="off"><button id="g12-filter-button" class="g12-filter" type="button">☷ Filter</button></div><div class="g12-tabs"><button class="g12-tab active" data-tab="for-you" type="button">For You</button><button class="g12-tab" data-tab="applied" type="button">Applied</button><button class="g12-tab" data-tab="curated" type="button">Curated</button><button class="g12-tab" data-tab="companies" type="button">Companies</button></div>${section('g12-applied','Roles you've applied to','Your application trail',appliedRoles)}${section('g12-curated','Curated for you','Personalized matches from your profile, skills & activity',curated)}${companyRail()}<section class="g12-section g12-explore"><h2>Explore more</h2><button data-explore="discover" type="button">✨ <span><strong>Discover more like this</strong><small>Fresh roles picked for you</small></span>›</button><button data-explore="saved" type="button">🔖 <span><strong>Saved for later</strong><small>Open your saved roles</small></span>›</button><button data-explore="recent" type="button">👁 <span><strong>Recently seen</strong><small>Browse roles you've opened</small></span>›</button></section></div>`;
    view.replaceChildren(shell);view.dataset.gluefulJobsV12='mounted';root=shell;
    bind(shell);
    return true;
  }

  function refreshMount(){if(root){root.remove();root=null;}const view=document.getElementById('jobs-view');if(view)view.dataset.gluefulJobsV12='';mount();}

  function bind(scope){
    scope.addEventListener('click',e=>{
      const save=e.target.closest('[data-save]');if(save){e.stopPropagation();const j=jobs.find(x=>String(x.id)===String(save.dataset.save));if(j)save.textContent=toggleSaved(j)?'♥':'♡';return;}
      const open=e.target.closest('[data-open],.g12-card');if(open){const id=open.dataset.open||open.dataset.jobId;if(id){const j=jobs.find(x=>String(x.id)===String(id));if(j)openDetails(j);}return;}
      const see=e.target.closest('[data-see]');if(see){const id=see.dataset.see;const list=id==='g12-applied'?jobs.filter(applied):id==='g12-curated'?rank(jobs).slice(0,500):rank(jobs);openList(id==='g12-applied'?'Your applications':id==='g12-curated'?'Curated for you':'All matching roles',list);return;}
      const comp=e.target.closest('[data-company]');if(comp){openList(comp.dataset.company,jobs.filter(j=>company(j)===comp.dataset.company));return;}
      const allComp=e.target.closest('[data-companies-all]');if(allComp){openList('Top companies hiring',jobs);return;}
      const explore=e.target.closest('[data-explore]');if(explore){const k=explore.dataset.explore;const list=k==='saved'?jobs.filter(saved):k==='recent'?recent():rank(jobs);openList(k==='saved'?'Saved for later':k==='recent'?'Recently seen':'Discover more like this',list);return;}
      const refresh=e.target.closest('#g12-refresh');if(refresh){refreshMount();return;}
      const search=e.target.closest('#g12-search-button');if(search){openSearch();return;}
      const filter=e.target.closest('#g12-filter-button');if(filter){try{window.openJobsFilterModal?.();}catch(_){}return;}
      const tab=e.target.closest('[data-tab]');if(tab){const id=tab.dataset.tab==='applied'?'g12-applied':tab.dataset.tab==='curated'?'g12-curated':tab.dataset.tab==='companies'?'g12-companies':'g12-curated';scope.querySelectorAll('.g12-tab').forEach(x=>x.classList.remove('active'));tab.classList.add('active');document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
    });
    scope.addEventListener('keydown',e=>{const c=e.target.closest('.g12-card');if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();const j=jobs.find(x=>String(x.id)===String(c.dataset.jobId));if(j)openDetails(j);}});
    const inline=scope.querySelector('#g12-search-inline');inline?.addEventListener('focus',openSearch);
  }

  function start(){
    installCSS();
    const tryMount=()=>{if(root&&document.body.contains(root))return true;return mount();};
    const observer=new MutationObserver(()=>{tryMount();});
    observer.observe(document.body,{childList:true,subtree:true});
    loadJobs().then(ok=>{if(ok)mount();else{const view=document.getElementById('jobs-view');if(view){view.innerHTML='<div id="glueful-jobs-v12"><div class="g12-page"><div class="g12-error">We could not load jobs right now. Please refresh and try again.</div></div></div>';}}});
    tryMount();
    window.__GLUEFUL_JOBS_V12__={refresh:refreshMount,openJobById:id=>{const j=jobs.find(x=>String(x.id)===String(id));if(j)openDetails(j);},getJobs:()=>jobs.slice()};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
