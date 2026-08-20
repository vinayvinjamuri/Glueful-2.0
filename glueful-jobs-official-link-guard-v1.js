/* Glueful Jobs — verified employer-link guard v2
   Resolves the exact job record first so aggregator URLs never become the
   primary "Open original job" destination when an employer URL exists.
*/
(function(){
  'use strict';
  if(window.__GLUEFUL_OFFICIAL_LINK_GUARD_V2__) return;
  window.__GLUEFUL_OFFICIAL_LINK_GUARD_V2__=true;

  const SUPABASE_URL='https://xztbhheexianejsvwpva.supabase.co';
  const SUPABASE_KEY='sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';
  const AGG=/(adzuna\.|indeed\.|ziprecruiter\.|linkedin\.com\/jobs)/i;
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const client=()=>window.supabaseClient||window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});

  function usable(u){
    return /^https?:\/\//i.test(String(u||'')) && !AGG.test(String(u||''));
  }

  async function resolveById(id){
    if(!id) return null;
    const c=client(); if(!c) return null;
    try{
      const r=await c.from('job_listings')
        .select('id,company,title,location,employer_job_url,application_url,apply_url,job_url,url,source_url,external_url,source_listing_url,source_status,apply_ready,official_source')
        .eq('id',id)
        .limit(1);
      if(r.error) throw r.error;
      const j=r.data?.[0];
      if(!j) return null;
      const verified=[j.employer_job_url,j.application_url,j.apply_url,j.job_url,j.url,j.source_url,j.external_url]
        .find(usable);
      if(j.apply_ready===true && j.source_status==='verified_employer_link' && verified) return verified;
      if(usable(j.employer_job_url)) return j.employer_job_url;
      if(usable(j.application_url)) return j.application_url;
      return null;
    }catch(e){
      console.warn('[Glueful] exact employer-link resolution failed',e);
      return null;
    }
  }

  async function resolveByIdentity(company,title,location){
    const c=client(); if(!c) return null;
    try{
      const r=await c.from('job_listings')
        .select('id,employer_job_url,application_url,apply_url,job_url,url,source_url,external_url,source_status,apply_ready,company,title,location')
        .eq('apply_ready',true)
        .eq('source_status','verified_employer_link')
        .ilike('company',company)
        .ilike('title',title)
        .limit(50);
      if(r.error) throw r.error;
      const q=clean(location).toLowerCase();
      const rows=(r.data||[]).sort((a,b)=>{
        const al=clean(a.location).toLowerCase();
        const bl=clean(b.location).toLowerCase();
        return Number(bl.includes(q))-Number(al.includes(q));
      });
      for(const row of rows){
        const u=[row.employer_job_url,row.application_url,row.apply_url,row.job_url,row.url,row.source_url,row.external_url].find(usable);
        if(u) return u;
      }
    }catch(e){console.warn('[Glueful] employer identity resolution failed',e)}
    return null;
  }

  async function handle(a){
    const href=a.getAttribute('href')||'';
    if(!AGG.test(href)) return false;

    const box=a.closest('.j11-sheet-box');
    const id=a.dataset.jobId||a.getAttribute('data-job-id')||'';
    const company=clean(box?.querySelector('.j11-detail h2')?.previousElementSibling?.textContent||'');
    const title=clean(box?.querySelector('.j11-detail h2')?.textContent||'');
    const location=clean(box?.querySelector('.j11-detail h2')?.nextElementSibling?.textContent||'');

    a.textContent='Resolving official job…';
    a.style.pointerEvents='none';

    const resolved=await resolveById(id)||await resolveByIdentity(company,title,location);
    a.style.pointerEvents='auto';

    if(resolved){
      a.textContent='Open official employer job →';
      window.open(resolved,'_blank','noopener,noreferrer');
      return true;
    }

    /* Never pretend an aggregator URL is an employer URL. */
    a.textContent='Source listing →';
    a.setAttribute('target','_blank');
    a.setAttribute('rel','noopener noreferrer');
    return false;
  }

  document.addEventListener('click',async ev=>{
    const a=ev.target.closest('.j11-apply');
    if(!a) return;
    const href=a.getAttribute('href')||'';
    if(!AGG.test(href)) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    await handle(a);
  },true);

  const observer=new MutationObserver(()=>{
    document.querySelectorAll('.j11-apply').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(AGG.test(href)) a.textContent='Resolve official job →';
    });
  });
  observer.observe(document.documentElement,{subtree:true,childList:true});
})();
