/* Glueful Jobs — infinite feed and company explorer */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_INFINITE_FEED_V1__) return;
  window.__GLUEFUL_JOBS_INFINITE_FEED_V1__=true;

  const URL='https://xztbhheexianejsvwpva.supabase.co';
  const KEY='sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';
  const PAGE=60;
  let offset=0, loading=false, exhausted=false, total=null;
  const seen=new Set();
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const company=j=>clean(j?.company||j?.company_name||'Company');
  const title=j=>clean(j?.title||j?.job_title||j?.position||'Untitled role');
  const loc=j=>clean(j?.location||j?.city||j?.job_location||'');
  const desc=j=>clean(j?.description||j?.job_description||j?.summary||j?.snippet||'');
  const text=j=>(title(j)+' '+company(j)+' '+desc(j)+' '+loc(j)).toLowerCase();
  const good=['embedded','firmware','hardware','validation','verification','post-silicon','pre-silicon','soc','silicon','asic','fpga','rtl','verilog','vlsi','bms','pmic','electronics','device validation','system validation','platform validation','bring-up','debug','i2c','spi','uart','usb','can','jtag','oscilloscope','semiconductor','chip','clock','reset','power sequencing','test engineer','automation engineer','software engineer','systems engineer','platform engineer','python','c','c++','linux','arm'];
  const bad=['talent assistant','customer support','customer service','sales representative','sales associate','recruiter','recruiting','human resources','hr manager','marketing specialist','content producer','copywriter','account executive','business development representative','finance analyst','administrative assistant'];
  const score=j=>{const t=text(j);let s=0;good.forEach(x=>{if(t.includes(x))s+=4});bad.forEach(x=>{if(t.includes(x))s-=45});if(/engineer|developer|scientist|validation|verification|firmware|hardware|embedded|silicon|soc|semiconductor/i.test(title(j)))s+=12;return s};
  const client=()=>window.supabaseClient||window.supabase?.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  function logo(j){
    if(j?.company_logo_url)return j.company_logo_url;
    const icons={google:'google',microsoft:'microsoft',apple:'apple',amazon:'amazon',meta:'meta',nvidia:'nvidia',qualcomm:'qualcomm',amd:'amd',intel:'intel',nxp:'nxp',arm:'arm',broadcom:'broadcom',ibm:'ibm',oracle:'oracle',samsung:'samsung',bosch:'bosch',siemens:'siemens',renesas:'renesas',tesla:'tesla'};
    const c=company(j).toLowerCase().replace(/[^a-z0-9]+/g,'');
    const k=Object.keys(icons).find(x=>c===x||c.includes(x)||x.includes(c));
    if(k)return 'https://cdn.simpleicons.org/'+icons[k];
    return '';
  }
  function verifiedUrl(j){
    if(j?.apply_ready===true&&j?.source_status==='verified_employer_link'){
      const u=j.employer_job_url||j.application_url||j.apply_url||'';
      if(/^https?:\/\//i.test(u)&&!/(adzuna\.|indeed\.|linkedin\.com\/jobs|ziprecruiter\.)/i.test(u))return u;
    }
    return '';
  }
  function sourceUrl(j){return j?.source_listing_url||j?.job_url||j?.url||j?.source_url||j?.external_url||''}
  function card(j){
    const l=logo(j),c=company(j),u=verifiedUrl(j),s=score(j);
    return `<article class="g-inf-card" data-inf-id="${esc(j.id)}"><div class="g-inf-top"><div class="g-inf-logo">${l?`<img src="${esc(l)}" alt="${esc(c)} logo" loading="lazy">`:`<b>${esc(c[0]||'?')}</b>`}</div><div><strong>${esc(title(j))}</strong><span>${esc(c)}</span><small>${esc(loc(j)||'Location not specified')}</small></div></div><div class="g-inf-tag">${s>=60?'Strong match':s>=30?'Relevant':'New option'}</div><button class="g-inf-open" type="button">Open role →</button><span class="g-inf-link-state">${u?'Official employer link verified':'Source link available'}</span></article>`;
  }
  function modal(j){
    const old=document.querySelector('.g-inf-modal');if(old)old.remove();
    const c=company(j),l=logo(j),u=verifiedUrl(j),src=sourceUrl(j),s=document.createElement('div');s.className='g-inf-modal';
    const action=u?`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer" class="g-inf-action">Open official employer job →</a>`:(/^https?:\/\//i.test(src)?`<a href="${esc(src)}" target="_blank" rel="noopener noreferrer" class="g-inf-action secondary">View source →</a>`:'');
    s.innerHTML=`<div class="g-inf-modal-box"><header><div class="g-inf-head"><div class="g-inf-logo">${l?`<img src="${esc(l)}" alt="">`:`<b>${esc(c[0]||'?')}</b>`}</div><div><small>${esc(c)}</small><h2>${esc(title(j))}</h2><p>${esc(loc(j)||'Location not specified')}</p></div></div><button class="g-inf-x" type="button">×</button></header><main>${esc(desc(j)).replace(/\n/g,'<br>')||'Full job description is not available.'}</main>${action}</div>`;
    document.body.appendChild(s);document.body.style.overflow='hidden';
    const close=()=>{s.remove();document.body.style.removeProperty('overflow')};s.querySelector('.g-inf-x').onclick=close;s.onclick=e=>{if(e.target===s)close()};
  }
  const css=`.g-inf-sec{margin:30px 0}.g-inf-headline{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:12px}.g-inf-headline h2{margin:0;font-size:20px}.g-inf-headline p{margin:5px 0 0;color:var(--text-muted,#9aa2b2);font-size:11px}.g-inf-count{color:#9b7cff;font-weight:900}.g-inf-company-rail{display:flex;gap:8px;overflow-x:auto;padding:2px 0 10px;scroll-snap-type:x mandatory}.g-inf-company{flex:0 0 145px;padding:10px;border:1px solid var(--border,rgba(255,255,255,.1));background:var(--surface,#111620);color:var(--text,#fff);border-radius:14px;text-align:center;scroll-snap-align:start}.g-inf-company b{display:block;font-size:17px;color:#9b7cff}.g-inf-company span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px}.g-inf-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.g-inf-card{position:relative;min-height:175px;background:linear-gradient(180deg,#151a25,#111620);border:1px solid rgba(255,255,255,.09);border-radius:17px;padding:14px;box-sizing:border-box}.g-inf-top{display:flex;gap:10px}.g-inf-logo{width:46px;height:46px;flex:0 0 46px;background:#fff;color:#4d38b8;border-radius:12px;display:grid;place-items:center;overflow:hidden}.g-inf-logo img{width:100%;height:100%;object-fit:contain}.g-inf-top strong{display:block;font-size:13px;line-height:1.3}.g-inf-top span,.g-inf-top small{display:block;color:var(--text-muted,#9aa2b2);font-size:10px;margin-top:4px}.g-inf-tag{display:inline-block;margin-top:15px;padding:5px 8px;border-radius:999px;background:rgba(71,211,157,.1);color:#61d8a7;font-size:9px;font-weight:900}.g-inf-open{float:right;margin-top:14px;border:0;background:none;color:#a98bff;font-weight:900;cursor:pointer}.g-inf-link-state{display:block;clear:both;margin-top:11px;color:var(--text-faint,#697184);font-size:8px}.g-inf-sentinel{height:60px;display:grid;place-items:center;color:var(--text-faint,#697184);font-size:10px}.g-inf-modal{position:fixed;inset:0;z-index:100001;background:rgba(3,5,10,.84);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}.g-inf-modal-box{width:100%;max-width:820px;max-height:90vh;overflow:auto;background:var(--card,#151a25);color:var(--text,#fff);border-radius:20px;padding:18px;box-sizing:border-box}.g-inf-modal header{display:flex;justify-content:space-between;gap:12px}.g-inf-head{display:flex;gap:10px}.g-inf-head h2{margin:3px 0;font-size:20px}.g-inf-head small,.g-inf-head p{color:var(--text-muted,#9aa2b2);font-size:11px;margin:4px 0}.g-inf-x{width:38px;height:38px;border:0;border-radius:11px;background:var(--surface,#111620);color:var(--text,#fff);font-size:25px}.g-inf-modal main{border-top:1px solid var(--border,rgba(255,255,255,.1));margin-top:16px;padding-top:16px;color:var(--text-muted,#9aa2b2);font-size:13px;line-height:1.65}.g-inf-action{display:block;text-align:center;margin-top:18px;padding:13px;border-radius:13px;background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;text-decoration:none;font-weight:900}.g-inf-action.secondary{background:var(--surface,#111620);border:1px solid var(--border,rgba(255,255,255,.1))}@media(max-width:700px){.g-inf-grid{grid-template-columns:1fr}.g-inf-modal{align-items:flex-end;padding:0}.g-inf-modal-box{max-height:92vh;border-radius:20px 20px 0 0}}
`;
  function injectCss(){if(document.getElementById('g-inf-css'))return;const s=document.createElement('style');s.id='g-inf-css';s.textContent=css;document.head.appendChild(s)}
  function ensureSection(){
    if(document.getElementById('g-inf-sec'))return document.getElementById('g-inf-sec');
    const view=document.getElementById('jobs-view');if(!view)return null;
    const sec=document.createElement('section');sec.id='g-inf-sec';sec.className='g-inf-sec';sec.innerHTML='<div class="g-inf-headline"><div><h2>Explore more jobs <span class="g-inf-count" id="g-inf-count"></span></h2><p>Keep scrolling — more roles and companies load automatically.</p></div></div><div class="g-inf-company-rail" id="g-inf-companies"></div><div class="g-inf-grid" id="g-inf-grid"></div><div class="g-inf-sentinel" id="g-inf-sentinel">Loading more roles…</div>';
    view.appendChild(sec);return sec;
  }
  function addCompanies(rows){
    const rail=document.getElementById('g-inf-companies');if(!rail)return;
    const map=new Map([...rail.querySelectorAll('[data-inf-company]')].map(x=>[x.dataset.infCompany,Number(x.dataset.infCount||0)]));
    rows.forEach(j=>{const c=company(j);map.set(c,(map.get(c)||0)+1)});
    rail.innerHTML=[...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,100).map(([c,n])=>`<button type="button" class="g-inf-company" data-inf-company="${esc(c)}" data-inf-count="${n}"><span>${esc(c)}</span><b>${n}</b><small>${n===1?'role':'roles'}</small></button>`).join('');
    rail.querySelectorAll('[data-inf-company]').forEach(b=>b.onclick=()=>{const c=b.dataset.infCompany;document.getElementById('g-inf-grid').querySelectorAll('.g-inf-card').forEach(card=>{card.hidden=card.querySelector('.g-inf-top span')?.textContent!==c})});
  }
  function addRows(rows){
    const grid=document.getElementById('g-inf-grid');if(!grid)return;
    rows.sort((a,b)=>score(b)-score(a));rows.forEach(j=>{const id=String(j.id);if(seen.has(id))return;seen.add(id);const wrap=document.createElement('div');wrap.innerHTML=card(j);const node=wrap.firstElementChild;node.querySelector('.g-inf-open').onclick=()=>modal(j);grid.appendChild(node)});
    addCompanies(rows);
  }
  async function loadMore(){
    if(loading||exhausted)return;
    loading=true;const s=document.getElementById('g-inf-sentinel');if(s)s.textContent='Loading more roles…';
    try{
      const c=client();if(!c)throw new Error('Supabase client unavailable');
      if(total===null){const count=await c.from('job_listings').select('id',{count:'exact',head:true});if(!count.error)total=count.count}
      const r=await c.from('job_listings').select('*').range(offset,offset+PAGE-1);
      if(r.error)throw r.error;
      const rows=Array.isArray(r.data)?r.data:[];offset+=PAGE;
      if(!rows.length||rows.length<PAGE)exhausted=true;
      addRows(rows);
      const count=document.getElementById('g-inf-count');if(count&&Number.isFinite(total))count.textContent=`· ${total.toLocaleString()}+`;
      if(s)s.textContent=exhausted?'You’ve reached the end of the current job database. New jobs will appear after the next refresh.':'Scroll for more…';
    }catch(err){console.error('[Glueful Infinite Jobs]',err);if(s)s.textContent='Could not load more jobs. Try again.'}finally{loading=false}
  }
  function boot(){injectCss();const sec=ensureSection();if(!sec)return;const observer=new MutationObserver(()=>{if(document.getElementById('g-inf-sec')){observer.disconnect();loadMore();const sentinel=document.getElementById('g-inf-sentinel');const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))loadMore()},{rootMargin:'900px'});if(sentinel)io.observe(sentinel)}});observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>{if(!document.getElementById('g-inf-grid')?.children.length)loadMore()},1500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
