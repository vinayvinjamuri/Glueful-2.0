/* Glueful Jobs Feed Recovery V2
 * Data-only recovery: fetch active jobs directly from Supabase REST, expose
 * them through the same getActiveJobData contract used by V15, then ask V15
 * to render normally. This keeps one authoritative UI instead of a second renderer.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_FEED_RECOVERY_V2__) return;
  window.__GLUEFUL_JOBS_FEED_RECOVERY_V2__=true;

  const API='https://xztbhheexianejsvwpva.supabase.co/rest/v1/job_listings';
  const KEY='sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';

  async function fetchJobs(){
    const url=`${API}?select=*&is_active=eq.true&order=posted_at.desc&limit=1000`;
    const headers={
      apikey:KEY,
      Authorization:`Bearer ${KEY}`,
      Accept:'application/json',
      'Content-Type':'application/json',
      'Accept-Profile':'public'
    };
    const r=await fetch(url,{method:'GET',headers,cache:'no-store',credentials:'omit'});
    if(!r.ok)throw new Error(`jobs REST ${r.status}`);
    const data=await r.json();
    if(!Array.isArray(data)||!data.length)throw new Error('jobs REST returned no active rows');
    return data;
  }

  async function boot(){
    try{
      const api=window.gluefulJobsV15;
      const current=api?.getJobs?.()||[];
      if(Array.isArray(current)&&current.length)return true;
      const jobs=await fetchJobs();
      window.getActiveJobData=()=>jobs;
      window.__GLUEFUL_RECOVERY_JOBS__=jobs;
      if(window.gluefulJobsV15?.refresh){
        await window.gluefulJobsV15.refresh();
      }
      console.info(`[Glueful Jobs Recovery V2] loaded ${jobs.length} active jobs`);
      return true;
    }catch(error){
      console.error('[Glueful Jobs Recovery V2] load failed',error);
      return false;
    }
  }

  window.gluefulJobsFeedRecoveryV2={refresh:boot};
  const start=()=>setTimeout(boot,900);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
