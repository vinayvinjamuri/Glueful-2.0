/* Glueful shared company branding V1.
 * Additive only: does not touch Jobs rendering or gesture behavior.
 * Reuses the existing BrandFetch convention used by the Jobs/application pipeline.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APP_BRANDING_V1__) return;
  window.__GLUEFUL_APP_BRANDING_V1__=true;

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const known={apple:'apple.com',google:'google.com',microsoft:'microsoft.com',amazon:'amazon.com',meta:'meta.com',nvidia:'nvidia.com',qualcomm:'qualcomm.com',intel:'intel.com',amd:'amd.com',arm:'arm.com',nxp:'nxp.com',renesas:'renesas.com',broadcom:'broadcom.com',samsung:'samsung.com',ibm:'ibm.com',oracle:'oracle.com',adobe:'adobe.com',salesforce:'salesforce.com',bosch:'bosch.com',siemens:'siemens.com',synopsys:'synopsys.com',cadence:'cadence.com',figma:'figma.com',udemy:'udemy.com',britive:'britive.com',cloudflare:'cloudflare.com',reddit:'reddit.com',dialpad:'dialpad.com',chainguard:'chainguard.dev'};
  function domain(name){
    const n=clean(name).toLowerCase();
    const hit=Object.keys(known).find(k=>n===k||n.includes(k));
    return hit?known[hit]:'';
  }
  function logo(name){
    const d=domain(name);
    return d?`https://cdn.brandfetch.io/${encodeURIComponent(d)}/w/128/h/128`:'';
  }
  function nameFrom(el){return clean(el?.dataset?.company||el?.dataset?.companyName||el?.dataset?.employer||el?.getAttribute?.('data-company-name')||'');}
  function apply(host,name){
    if(!host||!name||host.dataset.gluefulBrandApplied==='1')return;
    const url=logo(name);if(!url)return;
    host.dataset.gluefulBrandApplied='1';
    const img=document.createElement('img');
    img.src=url;img.alt=`${name} logo`;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
    img.style.cssText='display:block;width:100%;height:100%;object-fit:contain;border-radius:inherit;';
    img.addEventListener('error',()=>{host.dataset.gluefulBrandApplied='error';img.remove()},{once:true});
    host.replaceChildren(img);
  }
  function scan(root){
    if(!root?.querySelectorAll)return;
    root.querySelectorAll('[data-company],[data-company-name],[data-employer]').forEach(card=>{
      const name=nameFrom(card);if(!name)return;
      const host=card.querySelector('[class*="logo"],[class*="Logo"],[class*="brand"],[class*="Brand"],img');
      if(host?.tagName==='IMG'){const box=host.parentElement;if(box)apply(box,name)}else if(host)apply(host,name);
    });
  }
  let queued=false,pending=[];
  function queue(root){
    if(root)pending.push(root);
    if(queued)return;
    queued=true;
    const work=()=>{queued=false;const roots=pending.splice(0);if(!roots.length)return;roots.forEach(scan)};
    if('requestIdleCallback' in window)window.requestIdleCallback(work,{timeout:700});else setTimeout(work,120);
  }
  function boot(){
    queue(document);
    const observer=new MutationObserver(mutations=>mutations.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)queue(n)})));
    observer.observe(document.body,{childList:true,subtree:true});
    window.gluefulBrandFetch={logo,domain,refresh:()=>queue(document)};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
