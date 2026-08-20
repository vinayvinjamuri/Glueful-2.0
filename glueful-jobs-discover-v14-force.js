/* Glueful Jobs V14 — authoritative runtime with legacy-data fallback.
   This file is intentionally independent of the old jobs renderer and can
   mount even when the service-worker-injected V13 data endpoint is unavailable. */
(function(){
  'use strict';
  if (window.__GLUEFUL_JOBS_V14__) return;
  window.__GLUEFUL_JOBS_V14__ = true;

  const clean = v => String(v ?? '').replace(/\s+/g,' ').trim();
  const lower = v => clean(v).toLowerCase();
  const esc = v => String(v ?? '').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const company = j => clean(j?.company || j?.company_name || j?.employer || 'Company');
  const title = j => clean(j?.title || j?.job_title || j?.position || 'Untitled role');
  const location = j => clean(j?.location || j?.city || j?.job_location || '');
  const description = j => clean(j?.description || j?.job_description || j?.summary || j?.snippet || '');
  const url = j => j?.employer_job_url || j?.application_url || j?.apply_url || j?.job_url || j?.url || j?.source_url || j?.external_url || '';
  const text = j => lower(`${title(j)} ${company(j)} ${description(j)} ${location(j)}`);
  const major = ['google','microsoft','amazon','meta','apple','nvidia','qualcomm','amd','intel','nxp','arm','broadcom','texas instruments','renesas','stmicroelectronics','samsung','ibm','oracle','adobe','salesforce','bosch','siemens','synopsys','cadence'];
  const bad = ['talent assistant','customer support','customer service','sales representative','sales associate','recruiter','recruiting','human resources','hr manager','marketing specialist','content producer','copywriter','account executive','business development representative','finance analyst','administrative assistant'];
  let jobs=[];

  function score(j){
    let s=Number(j?.match_score ?? j?.score ?? j?._score ?? 0);
    if(!Number.isFinite(s)) s=0;
    const t=text(j), c=lower(company(j));
    if(major.some(x=>c.includes(x))) s+=10;
    bad.forEach(x=>{if(t.includes(x)) s-=50;});
    if(/engineer|developer|scientist|architect|validation|verification|firmware|hardware|embedded|software|silicon|soc|semiconductor|pmic|asic|fpga|rtl|verilog|test/i.test(title(j))) s+=10;
    if(j?.posted_at){const d=(Date.now()-new Date(j.posted_at).getTime())/86400000;if(d<3)s+=5;else if(d<7)s+=2;}
    return Math.max(0,Math.min(99,Math.round(s)));
  }
  const ranked=list => [...(list||[])].sort((a,b)=>score(b)-score(a)||(new Date(b?.posted_at||0)-new Date(a?.posted_at||0)));
  const label=j=>{const s=score(j);return s>=85?'Great match':s>=70?'Strong match':s>=50?'Good match':'Relevant'};
  const logo=j=>j?.company_logo_url || '';
  const initials=n=>clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  const http=u=>/^https?:\/\//i.test(String(u||''));

  function getExistingJobs(){
    try{
      if(typeof window.getActiveJobData==='function'){
        const data=window.getActiveJobData();
        if(Array.isArray(data) && data.length) return data;
      }
    }catch(e){ console.warn('[Glueful V14] existing job data unavailable',e); }
    return [];
  }

  async function load(){
    const existing=getExistingJobs();
    if(existing.length){ jobs=existing; return true; }
    try{
      const c=window.supabaseClient || window.supabase?.createClient?.(
        'https://xztbhheexianejsvwpva.supabase.co',
        'sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN',
        {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
      );
      if(c){
        const r=await c.from('job_listings').select('*').eq('is_active',true).order('posted_at',{ascending:false}).limit(1000);
        if(!r.error && Array.isArray(r.data) && r.data.length){jobs=r.data;return true;}
      }
    }catch(e){ console.warn('[Glueful V14] Supabase fallback failed',e); }
    return false;
  }

  const css=`
#glueful-jobs-v14{font-family:Inter,system-ui,sans-serif;color:var(--text,#f5f7ff)}
.g14-page{max-width:1080px;margin:auto;padding:18px 16px 120px}
.g14-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.g14-kicker{font-size:10px;letter-spacing:1.6px;color:#a98bff;font-weight:900}
.g14-top h1{margin:4px 0;font-size:28px}.g14-top p{margin:4px 0;color:var(--text-muted,#9aa2b2);font-size:12px}
.g14-search{width:100%;margin:18px 0 14px;padding:14px 16px;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);border-radius:15px;color:#9ba4b7;text-align:left;font-size:14px}
.g14-tabs{display:flex;gap:8px;overflow:auto;margin-bottom:20px}.g14-tabs button,.g14-see{border:0;background:none;color:#a98bff;font-weight:900;white-space:nowrap}.g14-tabs button{padding:9px 14px;border:1px solid var(--border,rgba(255,255,255,.1));border-radius:999px;background:var(--surface,#111620);color:var(--text-muted,#9aa2b2)}.g14-tabs button.active{background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;border-color:transparent}
.g14-head{display:flex;justify-content:space-between;align-items:end;gap:10px;margin-bottom:10px}.g14-head h2{margin:0;font-size:17px}.g14-head p{margin:4px 0 0;color:var(--text-faint,#697184);font-size:10px}
.g14-rail{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 8px;scrollbar-width:none}.g14-rail::-webkit-scrollbar{display:none}
.g14-card{flex:0 0 min(82vw,330px);scroll-snap-align:start;min-height:190px;padding:14px;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,#151a25,#111620);border-radius:17px;position:relative;box-sizing:border-box}
.g14-headrow{display:flex;gap:10px}.g14-logo{width:46px;height:46px;flex:0 0 46px;background:#fff;color:#4d38b8;border-radius:12px;overflow:hidden;display:grid;place-items:center;font-weight:900}.g14-logo img{width:100%;height:100%;object-fit:contain}.g14-main{min-width:0;flex:1}.g14-main strong{display:block;font-size:14px;line-height:1.3}.g14-main span,.g14-main small{display:block;color:var(--text-muted,#9aa2b2);font-size:10px;margin-top:4px}.g14-meta{display:flex;justify-content:space-between;align-items:center;margin-top:16px}.g14-badge{padding:5px 8px;border-radius:999px;background:rgba(71,211,157,.1);color:#61d8a7;font-size:9px;font-weight:900}.g14-score{color:#9c87e8;font-size:10px}.g14-open{position:absolute;left:14px;right:14px;bottom:14px;border:0;background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;padding:10px;border-radius:11px;font-weight:900}.g14-count{color:#9b7cff;font-size:11px}.g14-empty{padding:24px;border:1px dashed var(--border,rgba(255,255,255,.1));border-radius:14px;color:var(--text-muted,#9aa2b2)}
.g14-layer{position:fixed;inset:0;z-index:100000;background:rgba(3,5,10,.84);display:flex;align-items:flex-end;justify-content:center}.g14-panel{width:100%;max-width:860px;max-height:92vh;overflow:auto;background:var(--card,#151a25);border-radius:20px 20px 0 0;padding:18px;box-sizing:border-box}.g14-panel header{display:flex;gap:10px;align-items:center}.g14-panel header button{border:0;background:var(--surface,#111620);color:#fff;border-radius:10px;padding:9px 12px}.g14-panel input{flex:1;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:#fff;border-radius:12px;padding:12px}.g14-row{display:flex;align-items:center;gap:10px;width:100%;padding:11px;margin-top:8px;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:#fff;border-radius:13px;text-align:left}.g14-row-logo{width:42px;height:42px;flex:0 0 42px;background:#fff;color:#4d38b8;border-radius:10px;display:grid;place-items:center;overflow:hidden}.g14-row-logo img{width:100%;height:100%;object-fit:contain}.g14-row div:last-child{flex:1}.g14-row strong,.g14-row span,.g14-row small{display:block}.g14-row strong{font-size:12px}.g14-row span,.g14-row small{color:#9aa2b2;font-size:10px;margin-top:3px}.g14-detail h1{font-size:22px;margin:16px 0 5px}.g14-detail h3{margin:0;color:#c3b9e8}.g14-detail main{border-top:1px solid var(--border,rgba(255,255,255,.1));margin-top:16px;padding-top:16px;color:#c5cbd7;line-height:1.7;font-size:13px}.g14-footer{display:flex;gap:10px;margin-top:18px}.g14-footer a{flex:1;text-align:center;padding:13px;border-radius:13px;background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;text-decoration:none;font-weight:900}
@media(max-width:600px){.g14-page{padding:16px 10px 120px}.g14-top h1{font-size:25px}.g14-card{flex-basis:calc(100vw - 44px)}}`;

  function installCss(){if(document.getElementById('g14-css'))return;const s=document.createElement('style');s.id='g14-css';s.textContent=css;document.head.appendChild(s)}
  function openDetails(j){
    const old=document.querySelector('.g14-layer');if(old)old.remove();
    const layer=document.createElement('div');layer.className='g14-layer';
    const u=http(url(j))?url(j):'';
    layer.innerHTML=`<div class="g14-panel g14-detail"><header><button type="button" data-close>← Back</button></header><div class="g14-logo" style="margin-top:14px">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:`${esc(initials(company(j)))}`}</div><h1>${esc(title(j))}</h1><h3>${esc(company(j))}</h3><p>${esc(location(j)||'Location not specified')}</p><div class="g14-badge">${esc(label(j))} · ${score(j)}% match</div><main>${esc(description(j)||'Full job description is not available.').replace(/\n/g,'<br>')}</main><div class="g14-footer">${u?`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Apply now ↗</a>`:''}</div></div>`;
    document.body.appendChild(layer);document.body.style.overflow='hidden';
    layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow')}});
  }
  function openSearch(){
    const layer=document.createElement('div');layer.className='g14-layer';
    layer.innerHTML='<div class="g14-panel"><header><input id="g14-q" type="search" placeholder="Search jobs, skills or companies…" autofocus><button data-close>Cancel</button></header><div id="g14-results"></div></div>';
    document.body.appendChild(layer);document.body.style.overflow='hidden';
    const input=layer.querySelector('#g14-q');
    const render=()=>{const q=lower(input.value);const list=q?ranked(jobs.filter(j=>text(j).includes(q))):[];layer.querySelector('#g14-results').innerHTML=q?`<div class="g14-count">${list.length} results</div>${list.slice(0,500).map(row).join('')}`:'<div class="g14-empty">Search any job title, company or skill.</div>';};
    input.addEventListener('input',render);render();
    layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow');return}const b=e.target.closest('[data-row]');if(b){const j=jobs.find(x=>String(x.id)===String(b.dataset.row));if(j){layer.remove();document.body.style.removeProperty('overflow');openDetails(j)}}});
  }
  function row(j){return `<button type="button" class="g14-row" data-row="${esc(j.id)}"><div class="g14-row-logo">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:esc(initials(company(j)))}</div><div><strong>${esc(title(j))}</strong><span>${esc(company(j))}</span><small>${esc(location(j)||'Location not specified')} · ${score(j)}% match</small></div></button>`}
  function render(){
    const view=document.getElementById('jobs-view');if(!view)return false;
    const sorted=ranked(jobs);const curated=sorted.filter(j=>score(j)>=35).slice(0,30);
    const companies=[...new Set(sorted.map(company))].slice(0,20);
    const root=document.createElement('div');root.id='glueful-jobs-v14';
    root.innerHTML=`<div class="g14-page"><header class="g14-top"><div><div class="g14-kicker">YOUR NEXT MOVE</div><h1>Find your next big move</h1><p>Fresh roles, smart matches & company radar.</p></div></header><button class="g14-search" type="button">⌕ &nbsp; Search jobs, skills or companies…</button><nav class="g14-tabs"><button class="active">For You</button><button type="button" data-all>All jobs <b>${sorted.length}</b></button><button type="button" data-companies>Companies</button></nav><section><div class="g14-head"><div><h2>Curated for you <span class="g14-count">${curated.length}</span></h2><p>Personalized matches from your available job data</p></div><button class="g14-see" type="button" data-all>See all →</button></div><div class="g14-rail">${curated.map(j=>`<article class="g14-card" data-id="${esc(j.id)}"><div class="g14-headrow"><div class="g14-logo">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:esc(initials(company(j)))}</div><div class="g14-main"><strong>${esc(title(j))}</strong><span>${esc(company(j))}</span><small>📍 ${esc(location(j)||'Location not specified')}</small></div></div><div class="g14-meta"><span class="g14-badge">${esc(label(j))}</span><span class="g14-score">${score(j)}% match</span></div><button class="g14-open" type="button" data-open="${esc(j.id)}">View details</button></article>`).join('') || '<div class="g14-empty">No matching roles found.</div>'}</div></section><section><div class="g14-head"><div><h2>Top companies</h2><p>${companies.length} employers in the current feed</p></div></div><div class="g14-rail">${companies.map(c=>{const j=sorted.find(x=>company(x)===c);return `<article class="g14-card" data-company="${esc(c)}"><div class="g14-main"><strong>${esc(c)}</strong><span>${sorted.filter(x=>company(x)===c).length} open roles</span></div><button class="g14-open" type="button" data-company-open="${esc(c)}">Explore company</button></article>`}).join('')}</div></section></div>`;
    view.replaceChildren(root);
    root.addEventListener('click',e=>{
      const o=e.target.closest('[data-open]');if(o){const j=jobs.find(x=>String(x.id)===String(o.dataset.open));if(j)openDetails(j);return;}
      const a=e.target.closest('[data-all]');if(a){openList('All jobs',sorted);return;}
      const c=e.target.closest('[data-company-open]');if(c){openList(c.dataset.companyOpen,sorted.filter(j=>company(j)===c.dataset.companyOpen));return;}
      if(e.target.closest('.g14-search'))openSearch();
      if(e.target.closest('[data-companies]'))openList('Companies',sorted);
      const card=e.target.closest('.g14-card[data-id]');if(card&&!e.target.closest('button')){const j=jobs.find(x=>String(x.id)===String(card.dataset.id));if(j)openDetails(j);}
    });
    return true;
  }
  function openList(name,list){
    const layer=document.createElement('div');layer.className='g14-layer';layer.innerHTML=`<div class="g14-panel"><header><h2>${esc(name)} <span class="g14-count">${list.length}</span></h2><button data-close>×</button></header>${list.slice(0,500).map(row).join('')||'<div class="g14-empty">No roles found.</div>'}</div>`;document.body.appendChild(layer);document.body.style.overflow='hidden';layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow');return}const b=e.target.closest('[data-row]');if(b){const j=jobs.find(x=>String(x.id)===String(b.dataset.row));if(j){layer.remove();document.body.style.removeProperty('overflow');openDetails(j)}}});
  }
  async function start(){
    installCss();
    const ok=await load();
    if(!ok){console.warn('[Glueful V14] No job data available; leaving legacy feed visible.');return;}
    render();
    console.log('[Glueful V14] authoritative Jobs mounted:',jobs.length);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.__GLUEFUL_JOBS_V14_API__={refresh:async()=>{await load();render()},getJobs:()=>jobs.slice()};
})();
