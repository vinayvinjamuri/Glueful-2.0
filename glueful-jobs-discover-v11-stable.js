/* Glueful Jobs V11 — stable renderer and resilient feed */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_V11_LOADED__) return;
  window.__GLUEFUL_JOBS_V11_LOADED__ = true;

  const SUPABASE_URL='https://xztbhheexianejsvwpva.supabase.co';
  const SUPABASE_KEY='sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';
  const PERSONALIZED=SUPABASE_URL+'/functions/v1/get-personalized-jobs';
  const TOP=['google','microsoft','apple','amazon','meta','nvidia','qualcomm','amd','intel','nxp','arm','broadcom','texas instruments','renesas','stmicroelectronics','samsung','ibm','oracle','bosch','siemens','honeywell','synopsys','cadence','micron','marvell','sony','dell','tesla','jpmorgan','jp morgan'];
  const GOOD=['embedded','firmware','hardware','validation','verification','post-silicon','pre-silicon','soc','silicon','asic','fpga','rtl','verilog','vlsi','bms','pmic','power electronics','electronics','device validation','system validation','platform validation','bring-up','bring up','debug','i2c','spi','uart','usb','can','jtag','oscilloscope','logic analyzer','signal integrity','power integrity','semiconductor','chip','clock','reset','power sequencing','test engineer','automation engineer','software engineer','systems engineer','platform engineer','python','c','c++','linux','arm','design verification'];
  const BAD=['talent assistant','customer support','customer service','sales representative','sales associate','recruiter','recruiting','human resources','hr manager','marketing specialist','content producer','copywriter','account executive','business development representative','finance analyst','administrative assistant'];
  const ICON={google:'google',microsoft:'microsoft',apple:'apple',amazon:'amazon',meta:'meta',nvidia:'nvidia',qualcomm:'qualcomm',amd:'amd',intel:'intel',nxp:'nxp',arm:'arm',broadcom:'broadcom',ibm:'ibm',oracle:'oracle',samsung:'samsung',anthropic:'anthropic',cloudflare:'cloudflare',bosch:'bosch',siemens:'siemens',honeywell:'honeywell',renesas:'renesas',tesla:'tesla'};
  let jobs=[],applications=[];
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const lower=v=>clean(v).toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const company=j=>clean(j?.company||j?.company_name||'Company');
  const title=j=>clean(j?.title||j?.job_title||j?.position||'Untitled role');
  const location=j=>clean(j?.location||j?.city||j?.job_location||'');
  const description=j=>clean(j?.description||j?.job_description||j?.summary||j?.snippet||'');
  const applyUrl=j=>j?.apply_url||j?.application_url||j?.job_url||j?.url||j?.source_url||j?.external_url||'';
  function text(j){return lower(title(j)+' '+company(j)+' '+description(j)+' '+location(j));}
  function logo(j){
    if(j?.company_logo_url) return j.company_logo_url;
    const c=lower(company(j)).replace(/[^a-z0-9]+/g,'');
    const key=Object.keys(ICON).find(k=>c===k||c.includes(k)||k.includes(c));
    if(key) return 'https://cdn.simpleicons.org/'+ICON[key];
    try{const u=applyUrl(j);if(u){const h=new URL(u).hostname.replace(/^www\./,'');return 'https://www.google.com/s2/favicons?domain='+encodeURIComponent(h)+'&sz=128';}}catch(_){ }
    return '';
  }
  function score(j){
    let s=Number(j?._score); if(!Number.isFinite(s)) s=0;
    const t=text(j), c=lower(company(j));
    GOOD.forEach(x=>{if(t.includes(x))s+=5});
    BAD.forEach(x=>{if(t.includes(x))s-=55});
    if(TOP.some(x=>c.includes(x)))s+=35;
    if(/engineer|developer|scientist|validation|verification|firmware|hardware|embedded|silicon|soc|semiconductor|architect/i.test(title(j)))s+=18;
    return s;
  }
  const rank=list=>[...(list||[])].sort((a,b)=>score(b)-score(a));
  function supa(){try{return window.supabaseClient||window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}})}catch(_){return null}}
  async function loadJobs(){
    const c=supa();
    try{
      const session=await c?.auth.getSession();
      const token=session?.data?.session?.access_token;
      if(token){
        const r=await fetch(PERSONALIZED,{method:'GET',headers:{Authorization:'Bearer '+token,apikey:SUPABASE_KEY,Accept:'application/json'},cache:'no-store'});
        if(r.ok){const d=await r.json();if(Array.isArray(d?.jobs)&&d.jobs.length){jobs=d.jobs;applications=Array.isArray(d.applications)?d.applications:[];return true;}}
      }
    }catch(err){console.warn('[Glueful Jobs V11] personalized feed failed',err)}
    try{
      if(!c) throw new Error('Supabase client unavailable');
      const r=await c.from('job_listings').select('*').limit(1000);
      if(r.error) throw r.error;
      jobs=Array.isArray(r.data)?r.data:[];
      applications=[];
      return jobs.length>0;
    }catch(err){console.error('[Glueful Jobs V11] direct job feed failed',err);return false}
  }
  function isApplied(j){return applications.some(a=>String(a.job_id??a.id)===String(j?.id))}
  function recentIds(){try{return JSON.parse(localStorage.getItem('glueful_recent_jobs')||'[]')}catch(_){return[]}}
  function remember(id){try{localStorage.setItem('glueful_recent_jobs',JSON.stringify([id,...recentIds().filter(x=>String(x)!==String(id))].slice(0,50)))}catch(_){}}
  function recent(){return recentIds().map(id=>jobs.find(j=>String(j.id)===String(id))).filter(Boolean)}
  function saved(j){try{return JSON.parse(localStorage.getItem('glueful_saved_jobs')||'[]').map(String).includes(String(j.id))}catch(_){return false}}

  const css=`
  #glueful-jobs-v11{font-family:Inter,system-ui,sans-serif;color:var(--text,#f5f7ff)}
  .j11-page{max-width:1080px;margin:auto;padding:22px 16px 130px}.j11-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.j11-kicker{font-size:10px;letter-spacing:1.6px;color:#a98bff;font-weight:900}.j11-head h1{margin:4px 0;font-size:28px}.j11-head p{margin:4px 0;color:var(--text-muted,#9aa2b2);font-size:12px}.j11-refresh{border:1px solid rgba(139,99,255,.45);background:rgba(109,59,232,.14);color:#b99cff;border-radius:12px;padding:10px 13px;font-weight:900}.j11-search{margin:18px 0 12px;display:flex;align-items:center;gap:8px;padding:4px 13px;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);border-radius:15px}.j11-search input{width:100%;border:0!important;outline:0!important;background:transparent!important;color:var(--text,#fff);padding:11px 0!important}.j11-tabs{display:flex;gap:8px;overflow-x:auto;margin-bottom:22px}.j11-tab{border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:var(--text-muted,#9aa2b2);padding:9px 15px;border-radius:999px;font-weight:850;white-space:nowrap}.j11-tab.active{background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff}.j11-sec{margin:25px 0}.j11-section-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:10px}.j11-section-head h2{margin:0;font-size:18px}.j11-section-head h2 b{color:#9b7cff;font-size:12px}.j11-section-head p{margin:4px 0 0;color:var(--text-faint,#697184);font-size:10px}.j11-see{border:0;background:none;color:#a98bff;font-weight:900}.j11-rail,.j11-companies{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:3px}.j11-card{position:relative;flex:0 0 min(78vw,310px);min-height:185px;scroll-snap-align:start;background:linear-gradient(180deg,#151a25,#111620);border:1px solid rgba(255,255,255,.09);border-radius:17px;padding:14px;box-sizing:border-box}.j11-card-top{display:flex;gap:10px}.j11-logo{width:48px;height:48px;flex:0 0 48px;background:#fff;border-radius:12px;display:grid;place-items:center;overflow:hidden;color:#4d38b8;font-weight:900}.j11-logo img{width:100%;height:100%;object-fit:contain}.j11-card strong{display:block;font-size:14px;line-height:1.3}.j11-card span,.j11-card small{display:block;color:var(--text-muted,#9aa2b2);font-size:11px;margin-top:4px}.j11-card small{font-size:9px;margin-top:7px}.j11-match{display:inline-block;margin-top:17px;padding:5px 8px;border-radius:999px;background:rgba(71,211,157,.1);color:#61d8a7;font-size:9px;font-weight:900}.j11-open{float:right;margin-top:16px;border:0;background:none;color:#a98bff;font-weight:900}.j11-dots{text-align:center;margin-top:6px}.j11-dots i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#39404f;margin:0 3px}.j11-dots i.on{width:18px;border-radius:5px;background:#9b5cff}.j11-company{flex:0 0 145px;min-height:145px;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:var(--text,#fff);border-radius:16px;padding:12px;text-align:center}.j11-company .j11-logo{margin:auto;width:42px;height:42px}.j11-company strong{display:block;font-size:11px;min-height:28px;margin-top:7px}.j11-company b{display:block;color:#9b7cff;font-size:19px}.j11-company small{font-size:9px;color:var(--text-faint,#697184)}.j11-explore button{width:100%;display:flex;gap:12px;align-items:center;margin-top:8px;padding:14px;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:var(--text,#fff);border-radius:14px;text-align:left}.j11-explore span{flex:1}.j11-explore small{display:block;color:var(--text-faint,#697184);margin-top:3px}.j11-error{margin-top:20px;padding:18px;border:1px solid rgba(255,100,100,.25);border-radius:14px;background:rgba(255,60,60,.05);color:#ffb0b0}.j11-sheet{position:fixed;inset:0;z-index:100000;background:rgba(3,5,10,.82);display:flex;align-items:flex-end;justify-content:center}.j11-sheet-box{width:100%;max-width:820px;max-height:90vh;overflow:auto;background:var(--card,#151a25);color:var(--text,#fff);border-radius:22px 22px 0 0;padding:18px 16px;box-sizing:border-box}.j11-sheet-head{display:flex;justify-content:space-between;gap:10px}.j11-x{width:38px;height:38px;border:0;border-radius:11px;background:var(--surface,#111620);color:var(--text,#fff);font-size:25px}.j11-rows{display:grid;gap:8px;margin-top:14px}.j11-row{display:flex;align-items:center;gap:10px;width:100%;padding:11px;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:var(--text,#fff);border-radius:13px;text-align:left}.j11-row .j11-logo{width:40px;height:40px;flex-basis:40px}.j11-row span{flex:1;min-width:0}.j11-row strong,.j11-row small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.j11-row small{font-size:10px;color:var(--text-muted,#9aa2b2);margin-top:4px}.j11-detail main{border-top:1px solid var(--border,rgba(255,255,255,.1));margin-top:16px;padding-top:16px;color:var(--text-muted,#9aa2b2);line-height:1.65;font-size:13px;white-space:normal}.j11-apply{display:block;text-align:center;margin-top:18px;padding:13px;border-radius:13px;background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;text-decoration:none;font-weight:900}
  @media(min-width:800px){.j11-sheet{align-items:center;padding:20px}.j11-sheet-box{border-radius:20px}}@media(max-width:600px){.j11-page{padding-left:10px;padding-right:10px}.j11-head h1{font-size:25px}.j11-card{flex-basis:calc(100vw - 72px)}}`;

  function card(j){const l=logo(j),c=company(j),s=score(j);return `<article class="j11-card" data-id="${esc(j.id)}"><div class="j11-card-top"><div class="j11-logo">${l?`<img src="${esc(l)}" alt="${esc(c)} logo" loading="lazy">`:`${esc(c.charAt(0)||'?')}`}</div><div><strong>${esc(title(j))}</strong><span>${esc(c)}</span><small>${esc(location(j)||'Location not specified')}</small></div></div><div class="j11-match">${isApplied(j)?'Applied':s>=90?'Strong match':s>=55?'Good match':'Relevant'}</div><button class="j11-open" data-open="${esc(j.id)}">Open role →</button></article>`}
  function section(name,note,list,id){return `<section class="j11-sec" id="${id}"><div class="j11-section-head"><div><h2>${esc(name)} <b>${list.length}</b></h2><p>${esc(note)}</p></div><button class="j11-see" data-see="${id}">See all →</button></div><div class="j11-rail">${list.slice(0,30).map(card).join('')||'<div class="j11-error">No matching roles found yet.</div>'}</div><div class="j11-dots">${list.slice(0,8).map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div></section>`}
  function companyCounts(list){const m=new Map();list.forEach(j=>m.set(company(j),(m.get(company(j))||0)+1));return [...m].sort((a,b)=>{const at=TOP.some(x=>lower(a[0]).includes(x)),bt=TOP.some(x=>lower(b[0]).includes(x));return at===bt?b[1]-a[1]:(bt?1:-1)}).slice(0,30)}
  function companies(list){return `<section class="j11-sec" id="j11-companies"><div class="j11-section-head"><div><h2>Top companies hiring</h2><p>Company radar · swipe to explore</p></div><button class="j11-see" data-see="j11-companies">See all →</button></div><div class="j11-companies">${companyCounts(list).map(([c,count])=>{const j=list.find(x=>company(x)===c),l=j&&logo(j);return `<button class="j11-company" data-company="${esc(c)}"><div class="j11-logo">${l?`<img src="${esc(l)}" alt="${esc(c)}">`:`${esc(c.charAt(0)||'?')}`}</div><strong>${esc(c)}</strong><b>${count}</b><small>${count===1?'role':'roles'}</small></button>`}).join('')}</div></section>`}
  function detail(j){if(!j)return;remember(j.id);const old=document.querySelector('.j11-sheet');if(old)old.remove();const l=logo(j),c=company(j),u=applyUrl(j),box=document.createElement('div');box.className='j11-sheet';box.innerHTML=`<div class="j11-sheet-box j11-detail"><div class="j11-sheet-head"><div style="display:flex;gap:10px"><div class="j11-logo">${l?`<img src="${esc(l)}" alt="">`:`${esc(c.charAt(0)||'?')}`}</div><div><small>${esc(c)}</small><h2>${esc(title(j))}</h2><p>${esc(location(j)||'Location not specified')}</p></div></div><button class="j11-x">×</button></div><main>${esc(description(j)).replace(/\n/g,'<br>')||'Full job description is not available in the feed.'}</main>${/^https?:\/\//i.test(u)?`<a class="j11-apply" href="${esc(u)}" target="_blank" rel="noopener noreferrer">Open original job →</a>`:''}</div>`;document.body.appendChild(box);document.body.style.overflow='hidden';const close=()=>{box.remove();document.body.style.removeProperty('overflow')};box.querySelector('.j11-x').onclick=close;box.onclick=e=>{if(e.target===box)close()}}
  function listSheet(name,list){const rows=rank(list),box=document.createElement('div');box.className='j11-sheet';box.innerHTML=`<div class="j11-sheet-box"><div class="j11-sheet-head"><div><h2>${esc(name)} <b>${rows.length}</b></h2><p>Tap a role to open the full job details.</p></div><button class="j11-x">×</button></div><div class="j11-rows">${rows.map(j=>`<button class="j11-row" data-row="${esc(j.id)}"><div class="j11-logo">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:esc(company(j).charAt(0)||'?')}</div><span><strong>${esc(title(j))}</strong><small>${esc(company(j))}${location(j)?' · '+esc(location(j)):''}</small></span>→</button>`).join('')||'<div class="j11-error">No roles found.</div>'}</div></div>`;document.body.appendChild(box);document.body.style.overflow='hidden';const close=()=>{box.remove();document.body.style.removeProperty('overflow')};box.querySelector('.j11-x').onclick=close;box.onclick=e=>{if(e.target===box)close()};box.querySelectorAll('[data-row]').forEach(r=>r.onclick=()=>{const j=jobs.find(x=>String(x.id)===String(r.dataset.row));close();detail(j)})}

  async function start(){
    const view=document.getElementById('jobs-view');
    if(!view)return;
    view.style.display='block';
    view.replaceChildren();
    const loading=document.createElement('div');loading.style.cssText='padding:50px 20px;text-align:center;color:var(--text-muted,#9aa2b2)';loading.textContent='Loading your job feed…';view.appendChild(loading);
    const ok=await loadJobs();
    if(!ok){loading.className='j11-error';loading.innerHTML='<strong>Jobs could not be loaded.</strong><br>Please check your connection and refresh.';return}
    if(!document.getElementById('glueful-jobs-v11-css')){const st=document.createElement('style');st.id='glueful-jobs-v11-css';st.textContent=css;document.head.appendChild(st)}
    const curated=rank(jobs).slice(0,30),appliedRoles=jobs.filter(isApplied).slice(0,30);
    const root=document.createElement('div');root.id='glueful-jobs-v11';
    root.innerHTML=`<div class="j11-page"><header class="j11-head"><div><div class="j11-kicker">YOUR NEXT MOVE</div><h1>Find your next big move</h1><p>Fresh roles, smart matches & company radar.</p></div><button class="j11-refresh" id="j11-refresh">Refresh feed</button></header><div class="j11-search">⌕<input id="j11-search" placeholder="Search roles, skills, companies…"></div><nav class="j11-tabs"><button class="j11-tab active" data-tab="for">For You</button><button class="j11-tab" data-tab="applied">Applied</button><button class="j11-tab" data-tab="curated">Curated</button><button class="j11-tab" data-tab="companies">Companies</button></nav>${section("Roles you've applied to",'Your application trail',appliedRoles,'j11-applied')}${section('Curated for you','Personalized matches from your profile, skills & activity',curated,'j11-curated')}${companies(curated)}<section class="j11-explore"><h2>Explore more</h2><button data-explore="discover">✨ <span><strong>Discover more like this</strong><small>Fresh roles picked for you</small></span>›</button><button data-explore="saved">🔖 <span><strong>Saved for later</strong><small>Open your saved roles</small></span>›</button><button data-explore="recent">👁 <span><strong>Recently seen</strong><small>Jump back into roles you’ve viewed</small></span>›</button></section></div>`;
    view.replaceChildren(root);
    const openList=(name,list)=>listSheet(name,list);
    root.onclick=e=>{const o=e.target.closest('[data-open]');if(o){detail(jobs.find(j=>String(j.id)===String(o.dataset.open)));return}const s=e.target.closest('[data-see]');if(s){const id=s.dataset.see;openList(id==='j11-applied'?'Your applications':id==='j11-curated'?'Curated for you':'Top companies hiring',id==='j11-applied'?appliedRoles:curated);return}const c=e.target.closest('[data-company]');if(c){listSheet(c.dataset.company,curated.filter(j=>company(j)===c.dataset.company));return}const z=e.target.closest('[data-explore]');if(z){const t=z.dataset.explore;listSheet(t==='saved'?'Saved for later':t==='recent'?'Recently seen':'Discover more like this',t==='saved'?jobs.filter(saved):t==='recent'?recent():curated)}};
    document.getElementById('j11-refresh').onclick=()=>start();
    document.getElementById('j11-search').oninput=e=>{const q=lower(e.target.value);root.querySelectorAll('.j11-card').forEach(c=>{const j=jobs.find(j=>String(j.id)===String(c.dataset.id));c.hidden=!!q&&!text(j).includes(q)})};
    root.querySelectorAll('.j11-tab').forEach(b=>b.onclick=()=>{const target={applied:'j11-applied',curated:'j11-curated',companies:'j11-companies'}[b.dataset.tab];if(target)document.getElementById(target)?.scrollIntoView({behavior:'smooth',block:'start'});root.querySelectorAll('.j11-tab').forEach(x=>x.classList.toggle('active',x===b))});
  }
  function boot(){start().catch(err=>{console.error('[Glueful Jobs V11] startup error',err);const v=document.getElementById('jobs-view');if(v)v.innerHTML='<div class="j11-error">Jobs failed to start. Please refresh the page.</div>'})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.__GLUEFUL_JOBS_V11__={start,version:'20260820-jobs-v11-stable'};
})();
