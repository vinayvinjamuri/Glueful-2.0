/* Glueful Jobs V15 — mobile smooth scrolling + company logo polish.
 * Presentation-only patch. Keeps job data, ranking, saves and links unchanged.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_SMOOTH_LOGOS_V1__) return;
  window.__GLUEFUL_JOBS_SMOOTH_LOGOS_V1__=true;

  const STYLE_ID='g15-smooth-logos-v1-style';
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const company=j=>clean(j?.company||j?.company_name||j?.employer||'Company');
  const initials=n=>clean(n).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
  const data=()=>{try{return window.getActiveJobData?.()||[]}catch{return[]}};

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* Do not let horizontal job rails hijack vertical page scrolling. */
      #glueful-jobs-v15 .g15-rail,
      #glueful-jobs-v15 .g15-company-rail{
        -webkit-overflow-scrolling:touch!important;
        touch-action:auto!important;
        overscroll-behavior-x:contain!important;
        overscroll-behavior-y:auto!important;
        scroll-snap-type:x proximity!important;
        scroll-snap-stop:normal!important;
        scroll-behavior:auto!important;
      }
      #glueful-jobs-v15 .g15-rail > .g15-card,
      #glueful-jobs-v15 .g15-company-rail > .g15-company{
        scroll-snap-stop:normal!important;
      }
      #glueful-jobs-v15 .g15-rail,
      #glueful-jobs-v15 .g15-company-rail{
        will-change:scroll-position;
      }
      #glueful-jobs-v15 .g15-company>div,
      #glueful-jobs-v15 .g15-logo,
      #glueful-jobs-v15 .g15-row-logo{
        display:grid!important;
        place-items:center!important;
        overflow:hidden!important;
      }
      #glueful-jobs-v15 .g15-company>div img,
      #glueful-jobs-v15 .g15-logo img,
      #glueful-jobs-v15 .g15-row-logo img{
        display:block!important;
        width:100%!important;
        height:100%!important;
        object-fit:contain!important;
        border-radius:8px!important;
      }
      #glueful-jobs-v15 .g15-logo,
      #glueful-jobs-v15 .g15-company>div,
      #glueful-jobs-v15 .g15-row-logo{
        background:linear-gradient(145deg,#f8f9fc,#e7ebf3)!important;
        color:#5140b5!important;
        border:1px solid rgba(255,255,255,.12)!important;
      }
    `;
    document.head.appendChild(s);
  }

  function setFallback(host,name){
    if(!host || host.dataset.g15LogoReady==='1') return;
    host.dataset.g15LogoReady='1';
    host.innerHTML='';
    const span=document.createElement('span');
    span.textContent=initials(name);
    span.setAttribute('aria-hidden','true');
    span.style.cssText='display:grid;place-items:center;width:100%;height:100%;font:900 15px Inter,system-ui,sans-serif;color:#5140b5;';
    host.appendChild(span);
  }

  function putLogo(host,url,name){
    if(!host || !url) return false;
    if(host.dataset.g15LogoUrl===url) return true;
    host.dataset.g15LogoUrl=url;
    host.dataset.g15LogoReady='1';
    host.innerHTML='';
    const img=document.createElement('img');
    img.src=url;
    img.alt=`${name} logo`;
    img.loading='lazy';
    img.decoding='async';
    img.referrerPolicy='no-referrer';
    img.addEventListener('error',()=>setFallback(host,name),{once:true});
    host.appendChild(img);
    return true;
  }

  function enrichCompanyCards(root){
    const jobs=data();
    if(!Array.isArray(jobs)||!jobs.length) return;
    const byCompany=new Map();
    jobs.forEach(j=>{
      const name=company(j).toLowerCase();
      if(!byCompany.has(name)) byCompany.set(name,j);
    });
    root.querySelectorAll('.g15-company[data-recovery-company]').forEach(card=>{
      const name=clean(card.dataset.recoveryCompany||card.querySelector('strong')?.textContent||'Company');
      const job=byCompany.get(name.toLowerCase());
      const host=card.querySelector(':scope > div');
      const url=job?.company_logo_url||'';
      if(host && url) putLogo(host,url,name);
      else if(host && !host.dataset.g15LogoReady) setFallback(host,name);
    });
  }

  function polishExistingImages(root){
    root.querySelectorAll('.g15-logo img,.g15-company img,.g15-row-logo img').forEach(img=>{
      img.loading='lazy';
      img.decoding='async';
      img.referrerPolicy='no-referrer';
    });
  }

  function run(){
    const root=document.getElementById('glueful-jobs-v15');
    if(!root) return false;
    injectStyle();
    enrichCompanyCards(root);
    polishExistingImages(root);
    return true;
  }

  function boot(){
    run();
    if(window.__GLUEFUL_JOBS_SMOOTH_LOGOS_OBSERVER__) return;
    const root=document.getElementById('glueful-jobs-v15');
    if(!root) return;
    let timer=0;
    const schedule=()=>{
      clearTimeout(timer);
      timer=setTimeout(run,80);
    };
    const observer=new MutationObserver(schedule);
    observer.observe(root,{childList:true,subtree:true});
    window.__GLUEFUL_JOBS_SMOOTH_LOGOS_OBSERVER__=observer;
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();