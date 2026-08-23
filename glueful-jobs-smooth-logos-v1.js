/* Glueful Jobs V15 — mobile smooth scrolling + shared BrandFetch logo layer + latest company jobs rail.
 * Touch/scroll path is intentionally passive and does no rendering work.
 * Company-logo enrichment is resilient to asynchronous Jobs rendering.
 * The latest-jobs rail is derived from the same authoritative Jobs data and is rendered
 * only after the Top Companies rail exists, so it cannot block the primary feed.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_SMOOTH_LOGOS_V4__) return;
  window.__GLUEFUL_JOBS_SMOOTH_LOGOS_V4__=true;

  const STYLE_ID='g15-smooth-logos-v4-style';
  const LATEST_ID='g15-latest-company-jobs';
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'Company');
  const title=j=>clean(j?.title||j?.job_title||j?.position||j?.role||'Open role');
  const location=j=>clean(j?.location||j?.job_location||[j?.city,j?.state,j?.country].filter(Boolean).join(', ')||'Location not specified');
  const posted=j=>clean(j?.posted_at||j?.created_at||j?.published_at||'');
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
      #glueful-jobs-v15 .g15-logo,#glueful-jobs-v15 .g15-company>div,#glueful-jobs-v15 .g15-row-logo,#glueful-jobs-v15 .g15-latest-logo{
        display:grid!important;place-items:center!important;overflow:hidden!important;background:linear-gradient(145deg,#f8f9fc,#e7ebf3)!important;
        color:#5140b5!important;border:1px solid rgba(255,255,255,.12)!important;
      }
      #glueful-jobs-v15 .g15-logo img,#glueful-jobs-v15 .g15-company>div img,#glueful-jobs-v15 .g15-row-logo img,#glueful-jobs-v15 .g15-latest-logo img{
        display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;border-radius:8px!important;
      }
      #glueful-jobs-v15 .g15-latest-wrap{position:relative;margin:4px 0 18px;width:100%;min-width:0;contain:layout style}
      #glueful-jobs-v15 .g15-latest-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:0 0 4px;padding:0 2px}
      #glueful-jobs-v15 .g15-latest-title{margin:0;color:#f3f5fb;font:700 24px/1.15 'Space Grotesk','Inter',system-ui,sans-serif;letter-spacing:-.02em}
      #glueful-jobs-v15 .g15-latest-subtitle{margin:0 0 12px;color:#737b8e;font:500 12px/1.4 Inter,system-ui,sans-serif}
      #glueful-jobs-v15 .g15-latest-rail{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;width:100%!important;gap:12px!important;padding:2px 32px 8px 2px!important;box-sizing:border-box!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain!important;scroll-snap-type:x proximity!important;touch-action:pan-x pan-y!important;scrollbar-width:none!important}
      #glueful-jobs-v15 .g15-latest-rail::-webkit-scrollbar{display:none!important}
      #glueful-jobs-v15 .g15-latest-card{flex:0 0 245px!important;width:245px!important;min-width:245px!important;min-height:218px!important;box-sizing:border-box!important;padding:14px!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:18px!important;background:linear-gradient(145deg,#111722,#0d121b)!important;scroll-snap-align:start!important;display:flex!important;flex-direction:column!important;gap:9px!important;cursor:pointer!important;transition:transform .16s ease,border-color .16s ease!important}
      #glueful-jobs-v15 .g15-latest-card:active{transform:scale(.985)!important}
      #glueful-jobs-v15 .g15-latest-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
      #glueful-jobs-v15 .g15-latest-logo{width:44px!important;height:44px!important;min-width:44px!important;border-radius:12px!important}
      #glueful-jobs-v15 .g15-latest-bookmark{color:#aeb6c7;font-size:20px;line-height:1;background:transparent;border:0;padding:2px}
      #glueful-jobs-v15 .g15-latest-job-title{color:#f1f3f8;font:700 16px/1.25 'Space Grotesk','Inter',system-ui,sans-serif;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;min-height:40px}
      #glueful-jobs-v15 .g15-latest-company{color:#a9b1c2;font:600 12px/1.2 Inter,system-ui,sans-serif}
      #glueful-jobs-v15 .g15-latest-location{color:#8d96a8;font:500 11px/1.25 Inter,system-ui,sans-serif;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden}
      #glueful-jobs-v15 .g15-latest-bottom{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8px}
      #glueful-jobs-v15 .g15-latest-badge{display:inline-flex;align-items:center;padding:5px 8px;border-radius:999px;background:rgba(39,202,157,.12);color:#5be1bb;font:700 10px/1 Inter,system-ui,sans-serif}
      #glueful-jobs-v15 .g15-latest-age{color:#777f91;font:500 10px/1 Inter,system-ui,sans-serif}
      #glueful-jobs-v15 .g15-latest-dots{display:flex;justify-content:center;gap:5px;margin:1px 0 0;min-height:7px}
      #glueful-jobs-v15 .g15-latest-dot{width:5px;height:5px;border-radius:999px;background:#454c5b;transition:width .14s ease,background .14s ease}
      #glueful-jobs-v15 .g15-latest-dot.active{width:16px;background:linear-gradient(90deg,#7b36ff,#4b7cff)}
      @media(max-width:600px){#glueful-jobs-v15 .g15-latest-card{flex-basis:238px!important;width:238px!important;min-width:238px!important}#glueful-jobs-v15 .g15-latest-title{font-size:23px}}
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
  function polish(root){root.querySelectorAll('.g15-logo img,.g15-company img,.g15-row-logo img,.g15-latest-logo img').forEach(img=>{img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';});}

  function openJob(job){
    const url=job?.apply_url||job?.job_url||job?.url||job?.application_url||'';
    if(url){window.open(url,'_blank','noopener,noreferrer');return}
    try{
      const card=[...document.querySelectorAll('#glueful-jobs-v15 .g15-card')].find(el=>clean(el.dataset.jobId)===clean(job?.id||job?.job_id));
      if(card){card.querySelector('button,[role="button"],a')?.click();return;}
    }catch{}
  }
  function ageLabel(value){
    if(!value)return 'Recently posted';
    const t=Date.parse(value);if(!Number.isFinite(t))return 'Recently posted';
    const h=Math.max(1,Math.floor((Date.now()-t)/3600000));if(h<24)return `${h}h ago`;
    const d=Math.floor(h/24);return `${d}d ago`;
  }
  function uniqueCompanyJobs(jobs){
    const out=[],seen=new Set();
    for(const j of jobs){const key=company(j).toLowerCase();if(!key||seen.has(key))continue;seen.add(key);out.push(j);if(out.length>=12)break}
    return out;
  }
  function renderLatest(root){
    const jobs=data();if(!Array.isArray(jobs)||jobs.length<2)return;
    const companyRail=root.querySelector('.g15-company-rail');if(!companyRail)return;
    const companyWrap=companyRail.closest('.g15-mobile-rail-wrap')||companyRail.parentElement;if(!companyWrap)return;
    let section=root.querySelector(`#${LATEST_ID}`);
    if(!section){
      section=document.createElement('section');section.id=LATEST_ID;section.className='g15-latest-wrap';
      companyWrap.insertAdjacentElement('afterend',section);
    }
    const selected=uniqueCompanyJobs(jobs);
    const signature=selected.map(j=>`${j?.id||j?.job_id||title(j)}|${company(j)}`).join('||');
    if(section.dataset.signature===signature)return;
    section.dataset.signature=signature;
    section.innerHTML=`<div class="g15-latest-heading"><h2 class="g15-latest-title">Latest jobs from top companies</h2></div><div class="g15-latest-subtitle">Swipe horizontally to explore more opportunities</div><div class="g15-latest-rail" aria-label="Latest jobs from top companies"></div><div class="g15-latest-dots"></div>`;
    const rail=section.querySelector('.g15-latest-rail');
    selected.forEach(job=>{
      const name=company(job),card=document.createElement('article');card.className='g15-latest-card';card.tabIndex=0;
      const host=document.createElement('div');host.className='g15-latest-logo';
      const logo=job?.company_logo_url||brandLogo(name);if(logo)put(host,logo,name);else fallback(host,name);
      card.innerHTML=`<div class="g15-latest-top"></div><div class="g15-latest-job-title"></div><div class="g15-latest-company"></div><div class="g15-latest-location"></div><div class="g15-latest-bottom"><span class="g15-latest-badge">${clean(job?.match_label||'Good match')}</span><span class="g15-latest-age">${ageLabel(posted(job))}</span></div>`;
      card.querySelector('.g15-latest-top').append(host,(()=>{const b=document.createElement('button');b.className='g15-latest-bookmark';b.type='button';b.textContent='♡';b.setAttribute('aria-label','Save job');b.addEventListener('click',e=>{e.stopPropagation();b.textContent=b.textContent==='♡'?'♥':'♡'});return b})());
      card.querySelector('.g15-latest-job-title').textContent=title(job);card.querySelector('.g15-latest-company').textContent=name;card.querySelector('.g15-latest-location').textContent=`📍 ${location(job)}`;
      card.addEventListener('click',()=>openJob(job));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openJob(job)}});
      rail.appendChild(card);
    });
    const dots=section.querySelector('.g15-latest-dots'),count=Math.min(selected.length,8);
    dots.replaceChildren(...Array.from({length:count},(_,i)=>{const d=document.createElement('span');d.className='g15-latest-dot'+(i===0?' active':'');return d}));
    const updateDots=()=>{const max=Math.max(0,rail.scrollWidth-rail.clientWidth),ratio=max?rail.scrollLeft/max:0,idx=Math.max(0,Math.min(count-1,Math.round(ratio*(count-1))));[...dots.children].forEach((d,i)=>d.classList.toggle('active',i===idx))};
    rail.addEventListener('scroll',updateDots,{passive:true});window.addEventListener('resize',updateDots,{passive:true});updateDots();
    polish(section);
  }
  function run(){
    queued=false;const root=document.getElementById('glueful-jobs-v15');if(!root)return;
    enrich(root);renderLatest(root);polish(root);
  }
  function queue(){if(queued)return;queued=true;const work=()=>run();if('requestIdleCallback' in window)window.requestIdleCallback(work,{timeout:900});else setTimeout(work,180)}
  function attachRoot(root){
    if(rootObserver)return;run();
    rootObserver=new MutationObserver(queue);rootObserver.observe(root,{childList:true,subtree:true});
  }
  function boot(){
    injectStyle();run();
    const existingRoot=document.getElementById('glueful-jobs-v15');
    if(existingRoot){attachRoot(existingRoot);return}
    if(documentObserver)return;
    documentObserver=new MutationObserver(()=>{const root=document.getElementById('glueful-jobs-v15');if(root){documentObserver.disconnect();documentObserver=null;attachRoot(root)}});
    if(document.body)documentObserver.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.gluefulJobsLogoResolverV1={logoUrl:j=>j?.company_logo_url||brandLogo(company(j)),brandLogo,domainForName:fallbackDomain};
})();
