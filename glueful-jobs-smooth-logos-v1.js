/* Glueful Jobs V15 — mobile smooth scrolling + shared Brand Fetch logo layer.
 * Touch/scroll path is intentionally passive and does no rendering work.
 * Company-logo enrichment is resilient to asynchronous Jobs rendering.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_SMOOTH_LOGOS_V3__) return;
  window.__GLUEFUL_JOBS_SMOOTH_LOGOS_V3__=true;

  const STYLE_ID='g15-smooth-logos-v3-style';
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'Company');
  const initials=n=>clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  const data=()=>{try{return window.getActiveJobData?.()||window.gluefulJobsV15?.getJobs?.()||[]}catch{return[]}};
  const fallbackDomain=name=>{
    const n=clean(name).toLowerCase();
    const known={figma:'figma.com',udemy:'udemy.com',britive:'britive.com',apple:'apple.com',google:'google.com',microsoft:'microsoft.com',amazon:'amazon.com',meta:'meta.com',nvidia:'nvidia.com',qualcomm:'qualcomm.com',intel:'intel.com',amd:'amd.com',arm:'arm.com',nxp:'nxp.com',renesas:'renesas.com','texas instruments':'ti.com',broadcom:'broadcom.com',samsung:'samsung.com',ibm:'ibm.com',oracle:'oracle.com',adobe:'adobe.com',salesforce:'salesforce.com',bosch:'bosch.com',siemens:'siemens.com',synopsys:'synopsys.com',cadence:'cadence.com',cloudflare:'cloudflare.com',reddit:'reddit.com',dialpad:'dialpad.com',chainguard:'chainguard.dev'};
    const hit=Object.keys(known).find(k=>n===k||n.includes(k));if(hit)return known[hit];
    const first=n.replace(/\b(inc|ltd|llc|corp|corporation|company|co|plc)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)[0];
    return first?`${first}.com`:'';
  };
  const brandLogo=name=>{const d=fallbackDomain(name);return d?`https://cdn.brandfetch.io/${encodeURIComponent(d)}/w/128/h/128`:'';};

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #glueful-jobs-v15 .g15-rail,#glueful-jobs-v15 .g15-company-rail{
        -webkit-overflow-scrolling:touch!important;touch-action:pan-y!important;overscroll-behavior-x:contain!important;
        overscroll-behavior-y:auto!important;scroll-snap-type:x proximity!important;scroll-snap-stop:normal!important;
        scroll-behavior:auto!important;will-change:scroll-position!important;
      }
      #glueful-jobs-v15 .g15-rail>.g15-card,#glueful-jobs-v15 .g15-company-rail>.g15-company{scroll-snap-stop:normal!important}
      #glueful-jobs-v15 .g15-logo,#glueful-jobs-v15 .g15-company>div,#glueful-jobs-v15 .g15-row-logo{
        display:grid!important;place-items:center!important;overflow:hidden!important;background:linear-gradient(145deg,#f8f9fc,#e7ebf3)!important;
        color:#5140b5!important;border:1px solid rgba(255,255,255,.12)!important;
      }
      #glueful-jobs-v15 .g15-logo img,#glueful-jobs-v15 .g15-company>div img,#glueful-jobs-v15 .g15-row-logo img{
        display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;border-radius:8px!important;
      }
    `;document.head.appendChild(s);
  }
  function fallback(host,name){
    if(!host)return;
    host.dataset.g15LogoReady='1';host.dataset.g15LogoUrl='';host.innerHTML='';
    const span=document.createElement('span');span.textContent=initials(name);span.setAttribute('aria-hidden','true');
    span.style.cssText='display:grid;place-items:center;width:100%;height:100%;font:900 15px Inter,system-ui,sans-serif;color:#5140b5;';host.appendChild(span);
  }
  function put(host,url,name){
    if(!host||!url)return false;if(host.dataset.g15LogoUrl===url&&host.querySelector('img'))return true;
    host.dataset.g15LogoUrl=url;host.dataset.g15LogoReady='1';host.innerHTML='';
    const img=document.createElement('img');img.src=url;img.alt=`${name} logo`;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
    img.addEventListener('error',()=>fallback(host,name),{once:true});host.appendChild(img);return true;
  }
  let companyMap=null,mapSource=null,queued=false,rootObserver=null,documentObserver=null;
  function getMap(){
    const jobs=data();if(!Array.isArray(jobs)||!jobs.length)return null;if(companyMap&&mapSource===jobs)return companyMap;
    companyMap=new Map();mapSource=jobs;
    for(const j of jobs){const key=company(j).toLowerCase(),existing=companyMap.get(key);if(!existing?.company_logo_url&&j?.company_logo_url)companyMap.set(key,j);else if(!existing)companyMap.set(key,j);}
    return companyMap;
  }
  function enrich(root){
    const map=getMap();
    root.querySelectorAll('.g15-company').forEach(card=>{
      const name=clean(card.dataset.recoveryCompany||card.dataset.company||card.querySelector('strong')?.textContent||'Company');
      const host=card.querySelector(':scope > div');if(!host)return;
      const job=map?.get(name.toLowerCase()),url=job?.company_logo_url||brandLogo(name);if(url)put(host,url,name);else fallback(host,name);
    });
  }
  function polish(root){root.querySelectorAll('.g15-logo img,.g15-company img,.g15-row-logo img').forEach(img=>{img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';});}
  function run(){queued=false;const root=document.getElementById('glueful-jobs-v15');if(!root)return;enrich(root);polish(root);}
  function queue(){if(queued)return;queued=true;const work=()=>run();if('requestIdleCallback' in window)window.requestIdleCallback(work,{timeout:900});else setTimeout(work,180);}
  function attachRoot(root){
    if(rootObserver)return;
    run();
    rootObserver=new MutationObserver(queue);rootObserver.observe(root,{childList:true,subtree:true});
  }
  function boot(){
    injectStyle();run();
    const existingRoot=document.getElementById('glueful-jobs-v15');
    if(existingRoot){attachRoot(existingRoot);return;}
    if(documentObserver)return;
    documentObserver=new MutationObserver(()=>{
      const root=document.getElementById('glueful-jobs-v15');
      if(root){documentObserver.disconnect();documentObserver=null;attachRoot(root);}
    });
    if(document.body)documentObserver.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.gluefulJobsLogoResolverV1={logoUrl:j=>j?.company_logo_url||brandLogo(company(j)),brandLogo,domainForName:fallbackDomain};
})();
