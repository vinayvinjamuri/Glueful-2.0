/* Glueful Jobs — verified employer-link guard */
(function(){
  'use strict';
  if(window.__GLUEFUL_OFFICIAL_LINK_GUARD__) return;
  window.__GLUEFUL_OFFICIAL_LINK_GUARD__=true;
  const SUPABASE_URL='https://xztbhheexianejsvwpva.supabase.co';
  const SUPABASE_KEY='sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';
  const AGG=/adzuna\./i;
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const client=()=>window.supabaseClient||window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  async function resolve(company,title,location){
    const c=client(); if(!c) return null;
    try{
      const r=await c.from('job_listings')
        .select('employer_job_url,application_url,apply_url,source_listing_url,source_status,apply_ready,official_source,company,title,location')
        .eq('apply_ready',true)
        .eq('source_status','verified_employer_link')
        .ilike('company',company)
        .ilike('title',title)
        .limit(20);
      if(r.error) throw r.error;
      const q=clean(location).toLowerCase();
      const rows=(r.data||[]).sort((a,b)=>Number(clean(b.location).toLowerCase().includes(q))-Number(clean(a.location).toLowerCase().includes(q)));
      const row=rows[0];
      return row?.application_url||row?.employer_job_url||null;
    }catch(e){console.warn('[Glueful] verified employer link resolution failed',e);return null}
  }
  document.addEventListener('click',async ev=>{
    const a=ev.target.closest('.j11-apply');
    if(!a) return;
    const href=a.getAttribute('href')||'';
    if(!AGG.test(href)) return;
    ev.preventDefault();
    const box=a.closest('.j11-sheet-box');
    const company=clean(box?.querySelector('.j11-detail h2')?.previousElementSibling?.textContent||'');
    const title=clean(box?.querySelector('.j11-detail h2')?.textContent||'');
    const location=clean(box?.querySelector('.j11-detail h2')?.nextElementSibling?.textContent||'');
    a.textContent='Resolving official job…';
    a.style.pointerEvents='none';
    const resolved=await resolve(company,title,location);
    if(resolved){
      window.open(resolved,'_blank','noopener,noreferrer');
      a.textContent='Open official employer job →';
      a.style.pointerEvents='auto';
    }else{
      a.textContent='View source →';
      a.style.pointerEvents='auto';
      a.target='_blank';
      a.rel='noopener noreferrer';
    }
  },true);
  const observer=new MutationObserver(()=>{
    document.querySelectorAll('.j11-apply').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(AGG.test(href)){a.textContent='View source →';}
    });
  });
  observer.observe(document.documentElement,{subtree:true,childList:true});
})();
