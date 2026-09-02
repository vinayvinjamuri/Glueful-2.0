/* Glueful Jobs logo recovery v2 — resilient mobile logo loading. */
(function(){
  'use strict';
  const FLAG='__GLUEFUL_JOBS_LOGO_RECOVERY_V2__';if(window[FLAG])return;window[FLAG]=true;
  const root=()=>document.getElementById('glueful-jobs-v15');
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const company=el=>clean(el?.dataset?.recoveryCompany||el?.dataset?.company||el?.querySelector('.g15-main span')?.textContent||el?.querySelector('.g15-company-name')?.textContent||'Company');
  const domains={bosch:'bosch.com',reddit:'reddit.com','j.s. held':'jsheld.com','red stone':'redstone.com',qualcomm:'qualcomm.com',google:'google.com',microsoft:'microsoft.com',amazon:'amazon.com',apple:'apple.com',nvidia:'nvidia.com',intel:'intel.com',samsung:'samsung.com',ibm:'ibm.com',oracle:'oracle.com',adobe:'adobe.com',salesforce:'salesforce.com',siemens:'siemens.com',synopsys:'synopsys.com',cadence:'cadence.com',arm:'arm.com',nxp:'nxp.com',renesas:'renesas.com',amd:'amd.com'};
  function domain(name){const n=clean(name).toLowerCase();const hit=Object.keys(domains).find(k=>n===k||n.includes(k));if(hit)return domains[hit];const first=n.replace(/\b(inc|ltd|llc|corp|corporation|company|co|plc)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)[0];return first?first+'.com':''}
  function initials(name){return clean(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?'}
  function showFallback(host,name){host.innerHTML='';const s=document.createElement('span');s.textContent=initials(name);s.style.cssText='display:grid;place-items:center;width:100%;height:100%;font:900 15px Inter,system-ui,sans-serif;color:#5140b5';host.appendChild(s)}
  function load(host,name){if(!host||host.dataset.logoRecovery==='1')return;const d=domain(name);if(!d){showFallback(host,name);return}host.dataset.logoRecovery='1';host.innerHTML='';const img=document.createElement('img');img.alt=name+' logo';img.decoding='async';img.loading='eager';img.referrerPolicy='no-referrer';const urls=[`https://cdn.brandfetch.io/${encodeURIComponent(d)}/w/128/h/128`,`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`];let i=0;const next=()=>{if(i>=urls.length){showFallback(host,name);return}img.src=urls[i++];};img.addEventListener('error',next);host.appendChild(img);next()}
  function scan(){const r=root();if(!r)return;r.querySelectorAll('.g15-logo,.g15-company>div,.g15-row-logo,.g15-latest-logo').forEach(host=>{const img=host.querySelector('img');const name=company(host.closest('.g15-card,.g15-company,.g15-latest-card')||host.parentElement);if(img){img.loading='eager';img.decoding='async';img.referrerPolicy='no-referrer';if(!img.dataset.recoveryBound){img.dataset.recoveryBound='1';img.addEventListener('error',()=>{host.dataset.logoRecovery='';load(host,name)},{once:true})}}else if(!host.textContent.trim())load(host,name)})}
  function boot(){scan();const r=root();if(r&&!r.dataset.logoRecoveryObserver){r.dataset.logoRecoveryObserver='1';new MutationObserver(()=>requestAnimationFrame(scan)).observe(r,{childList:true,subtree:true)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  setTimeout(scan,500);setTimeout(scan,1500);setTimeout(scan,3000);
})();
