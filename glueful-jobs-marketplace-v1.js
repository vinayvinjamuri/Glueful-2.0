/* Glueful Jobs Marketplace V1
 * Adds a large-inventory browsing layer without replacing the existing
 * personalized Jobs renderer. Curated feed remains the primary experience;
 * this layer exposes the broader job/company inventory behind it.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_MARKETPLACE_V1__) return;
  window.__GLUEFUL_JOBS_MARKETPLACE_V1__=true;

  const SUPABASE_URL='https://xztbhheexianejsvwpva.supabase.co';
  const SUPABASE_KEY='sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';
  const PAGE=500, MAX=5000;
  let inventory=[];
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const lower=v=>clean(v).toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'Company');
  const title=j=>clean(j?.title||j?.job_title||j?.position||'Untitled role');
  const location=j=>clean(j?.location||j?.city||j?.job_location||'');
  const description=j=>clean(j?.description||j?.job_description||j?.summary||j?.snippet||'');
  const text=j=>lower(`${title(j)} ${company(j)} ${location(j)} ${description(j)}`);
  const logo=j=>j?.company_logo_url||'';
  const initials=n=>clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';

  function profileText(){
    const parts=[];
    try{['glueful_profile','glueful_user_profile','profile','userProfile'].forEach(k=>{const v=localStorage.getItem(k);if(v)parts.push(v)});}catch(_){ }
    try{if(window.gluefulProfile)parts.push(JSON.stringify(window.gluefulProfile))}catch(_){ }
    try{if(window.userProfile)parts.push(JSON.stringify(window.userProfile))}catch(_){ }
    try{if(window.currentUser?.user_metadata)parts.push(JSON.stringify(window.currentUser.user_metadata))}catch(_){ }
    return lower(parts.join(' '));
  }
  function score(j){
    let s=Number(j?.match_score??j?.score??j?._score??0);if(!Number.isFinite(s))s=0;
    const p=profileText();
    if(p){const pt=new Set(p.split(/[^a-z0-9+#.]+/).filter(w=>w.length>=3));const jt=new Set(text(j).split(/[^a-z0-9+#.]+/).filter(w=>w.length>=3));let overlap=0;jt.forEach(w=>{if(pt.has(w))overlap++});s+=Math.min(45,overlap*3)}
    if(/engineer|developer|scientist|architect|validation|verification|firmware|hardware|embedded|software|silicon|soc|semiconductor|pmic|asic|fpga|rtl|verilog|test/i.test(title(j)))s+=10;
    if(j?.posted_at){const age=(Date.now()-new Date(j.posted_at).getTime())/86400000;if(age<3)s+=5;else if(age<7)s+=2}
    return Math.max(0,Math.min(99,Math.round(s)));
  }
  function client(){return window.supabaseClient||window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})||null}
  async function loadInventory(){
    if(inventory.length)return inventory;
    try{
      const c=client();if(!c)return [];
      const rows=[];
      for(let from=0;from<MAX;from+=PAGE){
        const to=Math.min(from+PAGE-1,MAX-1);
        const r=await c.from('job_listings').select('*').eq('is_active',true).order('posted_at',{ascending:false}).range(from,to);
        if(r.error)throw r.error;
        const batch=Array.isArray(r.data)?r.data:[];rows.push(...batch);if(batch.length<PAGE)break;
      }
      const seen=new Set();
      inventory=rows.filter(j=>{const key=String(j.id||j.job_id||`${title(j)}|${company(j)}|${location(j)}|${j.application_url||j.job_url||''}`);if(seen.has(key))return false;seen.add(key);return true});
      window.gluefulJobsMarketplace={getJobs:()=>inventory.slice(),getCompanies:()=>companyRows(),refresh:async()=>{inventory=[];return loadInventory()}};
      return inventory;
    }catch(e){console.warn('[Glueful Marketplace] inventory load failed',e);return []}
  }
  function companyRows(){const map=new Map();inventory.forEach(j=>{const c=company(j);map.set(c,(map.get(c)||0)+1)});return [...map].sort((a,b)=>b[1]-a[1]);}
  function openJob(j){
    if(typeof window.openJobDetails==='function'){window.openJobDetails(j.id||j.job_id);return}
    if(typeof window.showJobDetails==='function'){window.showJobDetails(j);return}
    if(typeof window.openJobResumeEditor==='function'){window.openJobResumeEditor(j.id||j.job_id)}
  }
  function sheet(titleText,items,mode){
    const old=document.querySelector('.gmkt-layer');if(old)old.remove();
    const layer=document.createElement('div');layer.className='gmkt-layer';const isCompanies=mode==='companies';
    const renderCompanies=rows=>rows.map(([name,count])=>`<button class="gmkt-company" data-company="${esc(name)}" type="button"><div class="gmkt-logo">${esc(initials(name))}</div><div><strong>${esc(name)}</strong><span>${count} ${count===1?'open role':'open roles'}</span></div><b>›</b></button>`).join('');
    const renderJobs=rows=>rows.map(j=>`<button class="gmkt-row" data-job="${esc(j.id||j.job_id)}" type="button"><div class="gmkt-logo">${logo(j)?`<img src="${esc(logo(j))}" alt="">`:esc(initials(company(j)))}</div><div><strong>${esc(title(j))}</strong><span>${esc(company(j))}${location(j)?' · '+esc(location(j)):''}</span><small>${score(j)}% match${j.posted_at?' · '+esc(new Date(j.posted_at).toLocaleDateString()):''}</small></div></button>`).join('');
    layer.innerHTML=`<div class="gmkt-panel"><header><div><h2>${esc(titleText)}</h2><p>${isCompanies?companyRows().length+' companies':items.length+' jobs'} · full active inventory</p></div><button data-close type="button">×</button></header><div class="gmkt-search"><input id="gmkt-q" type="search" placeholder="Search ${isCompanies?'companies':'jobs, skills or roles'}…"></div><div class="gmkt-body">${isCompanies?renderCompanies(companyRows()):renderJobs(items)}</div></div>`;
    document.body.appendChild(layer);document.body.style.overflow='hidden';const bodyEl=layer.querySelector('.gmkt-body');
    layer.addEventListener('click',e=>{
      if(e.target===layer||e.target.closest('[data-close]')){layer.remove();document.body.style.removeProperty('overflow');return}
      const jb=e.target.closest('[data-job]');if(jb){const j=inventory.find(x=>String(x.id||x.job_id)===String(jb.dataset.job));if(j){layer.remove();document.body.style.removeProperty('overflow');openJob(j)}return}
      const cb=e.target.closest('[data-company]');if(cb){const name=cb.dataset.company;sheet(name,inventory.filter(j=>company(j)===name).sort((a,b)=>score(b)-score(a)),'jobs')}
    });
    layer.querySelector('#gmkt-q').addEventListener('input',e=>{const q=lower(e.target.value);if(isCompanies){bodyEl.innerHTML=renderCompanies(companyRows().filter(([n])=>lower(n).includes(q)))||'<div class="gmkt-empty">No companies found.</div>'}else{const rows=inventory.filter(j=>!q||text(j).includes(q)).sort((a,b)=>score(b)-score(a));bodyEl.innerHTML=renderJobs(rows)||'<div class="gmkt-empty">No matching jobs.</div>'}});
  }
  function inject(){
    const root=document.querySelector('#glueful-jobs-v13,#glueful-jobs-v14,#glueful-jobs-v15,#glueful-discover-root');
    if(!root||root.querySelector('.gmkt-marketplace'))return;
    const host=root.querySelector('.g13-page,.g14-page,.gd4-page')||root;const section=document.createElement('section');section.className='gmkt-marketplace';
    section.innerHTML=`<div class="gmkt-market-head"><div><h2>Explore the full market</h2><p>Browse beyond your personalized feed</p></div></div><div class="gmkt-actions"><button data-all-jobs type="button"><strong>All jobs</strong><span>Browse the full job inventory</span></button><button data-all-companies type="button"><strong>All companies</strong><span>Explore every employer with open roles</span></button></div>`;
    host.appendChild(section);
    section.querySelector('[data-all-jobs]').onclick=()=>sheet('All jobs',inventory.slice().sort((a,b)=>score(b)-score(a)),'jobs');
    section.querySelector('[data-all-companies]').onclick=()=>sheet('All companies',[],'companies');
  }
  function style(){if(document.getElementById('gmkt-style'))return;const s=document.createElement('style');s.id='gmkt-style';s.textContent=`.gmkt-marketplace{margin:28px 0 0;padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:linear-gradient(180deg,rgba(21,26,37,.9),rgba(14,18,27,.9))}.gmkt-market-head h2{margin:0;font-size:16px}.gmkt-market-head p{margin:4px 0 12px;color:#7f889a;font-size:10px}.gmkt-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.gmkt-actions button{border:1px solid rgba(139,99,255,.2);background:#111620;color:#fff;border-radius:13px;padding:12px;text-align:left}.gmkt-actions strong,.gmkt-actions span{display:block}.gmkt-actions strong{font-size:12px}.gmkt-actions span{margin-top:4px;color:#8d96a8;font-size:9px}.gmkt-layer{position:fixed;inset:0;z-index:100001;background:rgba(2,4,9,.84);display:flex;align-items:flex-end;justify-content:center}.gmkt-panel{width:100%;max-width:820px;max-height:92vh;overflow:hidden;background:#111620;border-radius:20px 20px 0 0;padding:16px;box-sizing:border-box}.gmkt-panel header{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.gmkt-panel header h2{margin:0;font-size:18px}.gmkt-panel header p{margin:4px 0 0;color:#7f889a;font-size:10px}.gmkt-panel header button{border:0;background:#1a2030;color:#fff;border-radius:10px;padding:8px 12px;font-size:18px}.gmkt-search{margin:12px 0}.gmkt-search input{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.1);background:#0c1018;color:#fff;border-radius:12px;padding:12px}.gmkt-body{overflow:auto;max-height:70vh}.gmkt-row,.gmkt-company{width:100%;display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.07);background:#151a25;color:#fff;border-radius:13px;padding:10px;margin-bottom:7px;text-align:left}.gmkt-logo{width:40px;height:40px;flex:0 0 40px;border-radius:10px;background:#fff;color:#4d38b8;display:grid;place-items:center;font-weight:900;overflow:hidden}.gmkt-logo img{width:100%;height:100%;object-fit:contain}.gmkt-row>div:nth-child(2),.gmkt-company>div:nth-child(2){min-width:0;flex:1}.gmkt-row strong,.gmkt-row span,.gmkt-row small,.gmkt-company strong,.gmkt-company span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gmkt-row strong,.gmkt-company strong{font-size:11px}.gmkt-row span,.gmkt-row small,.gmkt-company span{margin-top:3px;color:#8d96a8;font-size:9px}.gmkt-company>b{color:#a98bff;font-size:18px}.gmkt-empty{padding:24px;text-align:center;color:#7f889a}.gmkt-actions button:active,.gmkt-row:active,.gmkt-company:active{transform:scale(.99)}@media(max-width:600px){.gmkt-actions{grid-template-columns:1fr}.gmkt-panel{padding:14px}.gmkt-body{max-height:68vh}}`;document.head.appendChild(s)}
  async function boot(){style();await loadInventory();let tries=0;const timer=setInterval(()=>{inject();if(document.querySelector('#glueful-jobs-v13,#glueful-jobs-v14,#glueful-jobs-v15,#glueful-discover-root'))clearInterval(timer);else if(++tries>30)clearInterval(timer)},300)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();