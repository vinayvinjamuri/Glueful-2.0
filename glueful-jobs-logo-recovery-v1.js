/* Glueful Jobs logo recovery v1 — resilient image fallback for mobile/desktop. */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_LOGO_RECOVERY_V1__)return;
  window.__GLUEFUL_JOBS_LOGO_RECOVERY_V1__=true;
  const known={bosch:'bosch.com','qualcomm':'qualcomm.com','google':'google.com','microsoft':'microsoft.com','amazon':'amazon.com','meta':'meta.com','apple':'apple.com','nvidia':'nvidia.com','intel':'intel.com','amd':'amd.com','arm':'arm.com','nxp':'nxp.com','renesas':'renesas.com','samsung':'samsung.com','ibm':'ibm.com','oracle':'oracle.com','adobe':'adobe.com','salesforce':'salesforce.com','siemens':'siemens.com','synopsys':'synopsys.com','cadence':'cadence.com','reddit':'reddit.com','dialpad':'dialpad.com','figma':'figma.com','udemy':'udemy.com'};
  const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
  const domain=name=>{const n=clean(name).toLowerCase();const hit=Object.keys(known).find(k=>n===k||n.includes(k));if(hit)return known[hit];const first=n.replace(/\b(inc|ltd|llc|corp|corporation|company|co|plc)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)[0];return first?first+'.com':''};
  const initials=name=>clean(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  function companyFor(img){
    const card=img.closest('.g15-card,.g15-company,.g15-row,.g15-latest-card,.g15-detail');
    if(!card)return 'Company';
    return clean(card.querySelector('.g15-main span,.g15-company strong,.g15-row span,.g15-latest-company,.g15-detail h3')?.textContent||'Company');
  }
  function recover(img){
    if(!img||img.dataset.gluefulLogoRecovery==='done')return;
    const name=companyFor(img),d=domain(name),favicon=d?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`:'';
    const state=img.dataset.gluefulLogoState||'0';
    if(state==='0'&&favicon){img.dataset.gluefulLogoState='1';img.src=favicon;return;}
    img.dataset.gluefulLogoRecovery='done';
    const host=img.parentElement;if(!host)return;
    const span=document.createElement('span');span.textContent=initials(name);span.setAttribute('aria-hidden','true');span.style.cssText='display:grid;place-items:center;width:100%;height:100%;font:900 15px Inter,system-ui,sans-serif;color:#5140b5;background:#f3f5fa;';host.replaceChildren(span);
  }
  function wire(root=document){
    root.querySelectorAll?.('.g15-logo img,.g15-company img,.g15-row-logo img,.g15-latest-logo img').forEach(img=>{
      if(img.dataset.gluefulLogoWired==='1')return;
      img.dataset.gluefulLogoWired='1';img.loading='eager';img.decoding='async';img.referrerPolicy='no-referrer';img.addEventListener('error',()=>recover(img),{passive:true});
      if(img.complete&&img.naturalWidth===0)recover(img);
    });
  }
  function boot(){
    wire(document);const obs=new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)wire(n)})));obs.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
