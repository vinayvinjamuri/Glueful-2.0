/* Glueful Jobs V15 — mobile card + logo polish.
 * Loaded after the authoritative V15 renderer and the logo/Quick Options patch.
 * Visual-only: does not change job ranking, data, links, or save behavior.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_MOBILE_CARD_POLISH_V1__) return;
  window.__GLUEFUL_JOBS_MOBILE_CARD_POLISH_V1__=true;

  const STYLE_ID='g15-mobile-card-polish-v1';
  const initials=name=>String(name||'Company').trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #glueful-jobs-v15 .g15-card{min-height:0!important;height:214px!important;padding:13px!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
      #glueful-jobs-v15 .g15-card-head{align-items:flex-start!important;min-height:0!important;flex:1 1 auto!important;overflow:hidden!important}
      #glueful-jobs-v15 .g15-logo{width:50px!important;height:50px!important;flex:0 0 50px!important;border-radius:13px!important;border:1px solid rgba(255,255,255,.10)!important;background:linear-gradient(145deg,#f7f8fc,#e9edf5)!important;color:#5140b5!important;box-shadow:0 3px 12px rgba(0,0,0,.16)!important;padding:4px!important}
      #glueful-jobs-v15 .g15-logo img{width:100%!important;height:100%!important;display:block!important;object-fit:contain!important;border-radius:9px!important}
      #glueful-jobs-v15 .g15-main{padding-right:28px!important;min-width:0!important;overflow:hidden!important}
      #glueful-jobs-v15 .g15-main strong{white-space:normal!important;display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.28!important;max-height:2.56em!important;font-size:14px!important}
      #glueful-jobs-v15 .g15-main span,#glueful-jobs-v15 .g15-main small{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #glueful-jobs-v15 .g15-meta{margin-top:8px!important;gap:8px!important}
      #glueful-jobs-v15 .g15-badge{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:68%!important}
      #glueful-jobs-v15 .g15-open{position:static!important;left:auto!important;right:auto!important;bottom:auto!important;width:100%!important;flex:0 0 auto!important;margin-top:10px!important;padding:11px 12px!important;border-radius:11px!important}
      #glueful-jobs-v15 .g15-save{top:10px!important;right:10px!important}
      #glueful-jobs-v15 .g15-company>div,#glueful-jobs-v15 .g15-row-logo{border:1px solid rgba(255,255,255,.10)!important;background:linear-gradient(145deg,#f7f8fc,#e9edf5)!important;color:#5140b5!important;box-shadow:0 2px 10px rgba(0,0,0,.13)!important;padding:4px!important}
      #glueful-jobs-v15 .g15-company img,#glueful-jobs-v15 .g15-row-logo img{object-fit:contain!important;width:100%!important;height:100%!important;border-radius:8px!important}
      @media(max-width:600px){
        #glueful-jobs-v15 .g15-rail{gap:10px!important;padding-bottom:8px!important}
        #glueful-jobs-v15 .g15-card{flex:0 0 calc(100vw - 44px)!important;width:calc(100vw - 44px)!important}
      }
    `;
    document.head.appendChild(s);
  }

  function fallbackLogo(img,name){
    const host=img?.parentElement;
    if(!host || host.dataset.g15LogoFallback==='1') return;
    host.dataset.g15LogoFallback='1';
    const span=document.createElement('span');
    span.textContent=initials(name);
    span.setAttribute('aria-hidden','true');
    span.style.cssText='display:grid;place-items:center;width:100%;height:100%;font:900 14px Inter,system-ui,sans-serif;color:#5140b5;background:linear-gradient(145deg,#f7f8fc,#e9edf5);border-radius:8px;';
    img.replaceWith(span);
  }

  function polishImages(root){
    root.querySelectorAll('.g15-logo img,.g15-company img,.g15-row-logo img').forEach(img=>{
      img.loading='lazy';
      img.decoding='async';
      img.referrerPolicy='no-referrer';
      const wrapper=img.parentElement;
      let name='Company';
      const card=img.closest('.g15-card,.g15-company,.g15-row');
      if(card){
        const company=card.querySelector('.g15-company strong,.g15-main span,.g15-row span');
        if(company?.textContent?.trim()) name=company.textContent.trim();
      }
      img.alt=`${name} logo`;
      if(img.dataset.g15LogoBound==='1') return;
      img.dataset.g15LogoBound='1';
      img.addEventListener('error',()=>fallbackLogo(img,name),{once:true});
      const src=String(img.currentSrc||img.src||'').toLowerCase();
      if(/placeholder|default[-_]?logo|generic[-_]?logo|logo[-_]?placeholder/.test(src)) fallbackLogo(img,name);
      if(wrapper) wrapper.setAttribute('aria-label',`${name} logo`);
    });
  }

  function run(){
    const root=document.getElementById('glueful-jobs-v15');
    if(!root) return false;
    injectStyle();
    polishImages(root);
    return true;
  }

  function boot(){
    run();
    if(window.__GLUEFUL_G15_MOBILE_POLISH_OBSERVER__) return;
    const root=document.getElementById('glueful-jobs-v15')||document.body;
    const observer=new MutationObserver(()=>{observer.disconnect();try{run()}finally{observer.observe(root,{childList:true,subtree:true})}});
    observer.observe(root,{childList:true,subtree:true});
    window.__GLUEFUL_G15_MOBILE_POLISH_OBSERVER__=observer;
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();