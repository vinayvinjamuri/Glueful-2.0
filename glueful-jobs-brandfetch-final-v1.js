/* Jobs BrandFetch final v2 — fill actual logo boxes after asynchronous Jobs rendering. */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_BRANDFETCH_FINAL_V2__)return;
  window.__GLUEFUL_JOBS_BRANDFETCH_FINAL_V2__=true;
  const CLIENT='1id_c53sjhZ8vJteGbe',ROOT='#glueful-jobs-v15';
  const known={bosch:'bosch.com',qualcomm:'qualcomm.com',reddit:'reddit.com',freshworks:'freshworks.com','alpha sense':'alpha-sense.com',jumio:'jumio.com','j.s. held':'jsheld.com','red stone':'redstone.com',apple:'apple.com',google:'google.com',microsoft:'microsoft.com',amazon:'amazon.com',meta:'meta.com',nvidia:'nvidia.com',intel:'intel.com',amd:'amd.com',arm:'arm.com',nxp:'nxp.com',renesas:'renesas.com','texas instruments':'ti.com',broadcom:'broadcom.com',samsung:'samsung.com',ibm:'ibm.com',oracle:'oracle.com',adobe:'adobe.com',salesforce:'salesforce.com',siemens:'siemens.com',synopsys:'synopsys.com',cadence:'cadence.com'};
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const domain=name=>{const n=clean(name).toLowerCase();const hit=Object.keys(known).find(k=>n===k||n.includes(k));if(hit)return known[hit];const first=n.replace(/\b(inc|ltd|llc|corp|corporation|company|co|plc)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)[0];return first?first+'.com':''};
  const url=name=>{const d=domain(name);return d?`https://cdn.brandfetch.io/domain/${encodeURIComponent(d)}/icon.png?c=${CLIENT}`:''};
  const initials=name=>clean(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  function fill(host,name){if(!host||host.dataset.bfFinal==='loading'||host.dataset.bfFinal==='ok')return;const u=url(name);if(!u)return;host.dataset.bfFinal='loading';const img=document.createElement('img');img.src=u;img.alt=name+' logo';img.loading='eager';img.decoding='async';img.referrerPolicy='strict-origin-when-cross-origin';img.style.cssText='display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;border-radius:8px!important;';img.onload=()=>{host.dataset.bfFinal='ok';host.replaceChildren(img)};img.onerror=()=>{host.dataset.bfFinal='fallback';host.textContent=initials(name)};host.replaceChildren(img)}
  function companyName(host){
    const card=host.closest('.g15-card,.g15-company,.g15-row,.g15-latest-card')||host.parentElement;
    return clean(card?.dataset?.recoveryCompany||card?.dataset?.company||card?.querySelector('.g15-main span,.g15-company strong,.g15-row span,.g15-latest-company')?.textContent||'');
  }
  function scan(){const root=document.querySelector(ROOT);if(!root)return;root.querySelectorAll('.g15-logo,.g15-company>div,.g15-row-logo,.g15-latest-logo').forEach(host=>{const name=companyName(host);if(name&&!host.querySelector('img'))fill(host,name)})}
  function boot(){
    scan();
    const bodyObserver=new MutationObserver(()=>requestAnimationFrame(scan));
    bodyObserver.observe(document.body,{childList:true,subtree:true});
    [150,300,600,1200,2500,5000,8000].forEach(t=>setTimeout(scan,t));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
