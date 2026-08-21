/* Glueful Jobs Smooth Runtime V1
 * Cache-first personalized feed: paint from a recent response immediately,
 * refresh silently in the background, then ask the existing V7 renderer to refresh.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_SMOOTH_RUNTIME_V1__) return;
  window.__GLUEFUL_JOBS_SMOOTH_RUNTIME_V1__=true;

  const FEED='https://xztbhheexianejsvwpva.supabase.co/functions/v1/get-personalized-jobs';
  const KEY=window.SUPABASE_KEY||'sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';
  const CACHE_KEY='glueful_jobs_feed_v1';
  const MAX_AGE=5*60*1000;
  const originalFetch=window.fetch.bind(window);
  let refreshInFlight=false;

  function read(){
    try{
      const x=JSON.parse(sessionStorage.getItem(CACHE_KEY)||'null');
      return x&&x.body&&x.at ? x : null;
    }catch{return null}
  }
  function save(body){
    try{sessionStorage.setItem(CACHE_KEY,JSON.stringify({at:Date.now(),body}))}catch{}
  }
  function isFeed(input){
    try{return new URL(typeof input==='string'?input:input.url,location.href).href.startsWith(FEED)}catch{return false}
  }
  function response(body){
    return new Response(JSON.stringify(body),{status:200,headers:{'Content-Type':'application/json','X-Glueful-Feed-Cache':'hit'}})
  }

  // The existing V7 renderer remains the source of truth. This only changes
  // when its network request is satisfied; it does not duplicate rendering.
  window.fetch=async function(input,init){
    if(!isFeed(input)) return originalFetch(input,init);
    const cached=read();
    if(cached && Date.now()-cached.at<MAX_AGE){
      // Keep the request responsive immediately, then refresh behind it.
      queueMicrotask(()=>refresh());
      return response(cached.body);
    }
    const r=await originalFetch(input,init);
    try{
      const clone=r.clone();
      const body=await clone.json();
      if(body?.ok)save(body);
    }catch{}
    return r;
  };

  async function token(){
    try{
      if(window.supabaseClient){
        const x=await window.supabaseClient.auth.getSession();
        return x.data?.session?.access_token||'';
      }
    }catch{}
    return '';
  }

  async function refresh(){
    if(refreshInFlight)return;
    refreshInFlight=true;
    try{
      const t=await token();
      if(!t)return;
      const r=await originalFetch(FEED,{headers:{Authorization:`Bearer ${t}`,apikey:KEY,Accept:'application/json'},cache:'no-store'});
      if(!r.ok)return;
      const body=await r.json();
      if(!body?.ok)return;
      const old=read();
      save(body);
      if(old && JSON.stringify(old.body.jobs||[])===JSON.stringify(body.jobs||[]))return;
      const refreshButton=document.querySelector('#g7-refresh');
      if(refreshButton && document.visibilityState==='visible'){
        setTimeout(()=>refreshButton.click(),80);
      }
    }catch(e){console.debug('[Glueful Jobs Smooth] background refresh skipped',e)}
    finally{refreshInFlight=false}
  }

  // If there is no cache, let the normal V7 request populate it. If there is
  // cache, warm the server-side session without blocking first paint.
  setTimeout(()=>{if(read())refresh()},1200);
})();
