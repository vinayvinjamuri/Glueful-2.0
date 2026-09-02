/* Glueful Jobs logo recovery v4 — BrandFetch client id + resilient fallback. */
(function(){
  'use strict';
  const FLAG='__GLUEFUL_JOBS_LOGO_RECOVERY_V4__';
  if(window[FLAG])return;
  window[FLAG]=true;
  const BRANDFETCH_ID='1id_c53sjhZ8vJteGbe';
  const root=()=>document.getElementById('glueful-jobs-v15');
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const company=el=>clean(el?.dataset?.recoveryCompany||el?.dataset?.company||el?.querySelector('.g15-main span')?.textContent||el?.querySelector('.g15-company-name')?.textContent||'Company');
  const domains={bosch:'bosch.com',reddit:'reddit.com','j.s. held':'jsheld.com','red stone':'redstone.com',qualcomm:'qualcomm.com',google:'google.com',microsoft:'microsoft.com',amazon:'amazon.com',apple:'apple.com',nvidia:'nvidia.com',intel:'intel.com',samsung:'samsung.com',ibm:'ibm.com',oracle:'oracle.com',adobe:'adobe.com',salesforce:'salesforce.com',siemens:'siemens.com',synopsys:'synopsys.com',cadence:'cadence.com',arm:'arm.com',nxp:'nxp.com',renesas:'renesas.com',amd:'amd.com'};
  function domain(name){const n=clean(name).toLowerCase();const hit=Object.keys(domains).find(k=>n===k||n.includes(k));if(hit)return domains[hit];const first=n.replace(/\b(inc|ltd|llc|corp|corporation|company|co|plc)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)[0];return first?first+'.com':''}
  function initials(name){return clean(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?'}
  function fallback(host,name){host.replaceChildren();const s=document.createElement('span');s.textContent=initials(name);s.style.cssText='display:grid;place-items:center;width:100%;height:100%;font:900 15px Inter,system-ui,sans-serif;color:#5140b5';host.appendChild(s)}
  function tryLogo(host,name){if(!host||host.dataset.logoV4==='loading'||host.dataset.logoV4==='ready')return;const d=domain(name);if(!d){fallback(host,name);return}host.dataset.logoV4='loading';const img=document.createElement('img');img.alt=name+' logo';img.loading='eager';img.decoding='async';img.referrerPolicy='no-referrer';const urls=[`https://cdn.brandfetch.io/${encodeURIComponent(d)}/w/128/h/128?c=${encodeURIComponent(BRANDFETCH_ID)}`,`https://cdn.brandfetch.io/${encodeURIComponent(d)}/w/128/h/128`,`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`];let i=0;img.onerror=()=>{if(i<urls.length)img.src=urls[i++];else{host.dataset.logoV4='fallback';fallback(host,name)}};img.onload=()=>{host.dataset.logoV4='ready'};host.replaceChildren(img);img.src=urls[i++]}
  function scan(){const r=root();if(!r)return;r.querySelectorAll('.g15-logo,.g15-company>div,.g15-row-logo,.g15-latest-logo').forEach(host=>{const card=host.closest('.g15-card,.g15-company,.g15-row,.g15-latest-card')||host.parentElement;const name=company(card||host);const img=host.querySelector('img');if(img){img.loading='eager';img.decoding='async';img.referrerPolicy='no-referrer';if(img.complete&&img.naturalWidth)host.dataset.logoV4='ready';else if(!img.dataset.logoV4Bound){img.dataset.logoV4Bound='1';img.addEventListener('error',()=>{host.dataset.logoV4='';tryLogo(host,name)},{once:true})}}else{tryLogo(host,name)}})}
  function boot(){scan();const r=root();if(r&&!r.dataset.logoV4Observer){r.dataset.logoV4Observer='1';new MutationObserver(()=>requestAnimationFrame(scan)).observe(r,{childList:true,subtree:true)}}[200,600,1200,2500,5000].forEach(t=>setTimeout(scan,t))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
