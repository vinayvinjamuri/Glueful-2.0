/* Glueful — Mobile Update Guard V2
 * Single update surface. Removes the legacy "A new version of Glueful is available"
 * prompt even when another startup path creates it after this script boots.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_MOBILE_UPDATE_GUARD_V6__) return;
  window.__GLUEFUL_MOBILE_UPDATE_GUARD_V6__=true;

  let pendingRegistration=null;
  let updateSheet=null;

  const css=`
    #glueful-update-banner{position:fixed;left:16px;right:16px;top:calc(env(safe-area-inset-top,0px) + 14px);z-index:2147483000;display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid rgba(145,91,255,.55);border-radius:18px;background:rgba(12,12,22,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 12px 36px rgba(0,0,0,.38),0 0 28px rgba(115,55,255,.16);color:#fff;font-family:inherit;transform:translateY(-130%);opacity:0;pointer-events:none;transition:transform .28s ease,opacity .28s ease}
    #glueful-update-banner.glueful-show{transform:translateY(0);opacity:1;pointer-events:auto}
    #glueful-update-banner .gub-icon{width:38px;height:38px;display:grid;place-items:center;flex:0 0 38px;border-radius:13px;background:linear-gradient(135deg,#8d2cff,#245dff);font-size:20px;box-shadow:0 0 20px rgba(116,55,255,.3)}
    #glueful-update-banner .gub-copy{min-width:0;flex:1}.gub-title{font-size:14px;font-weight:700}.gub-sub{font-size:12px;opacity:.62;margin-top:2px}
    #glueful-update-banner button{border:0;background:transparent;color:#a96cff;font:inherit;font-size:13px;font-weight:700;padding:8px 4px;white-space:nowrap}.gub-close{font-size:22px!important;font-weight:300!important;color:#aaa!important;padding:5px!important}
    #glueful-update-sheet{position:fixed;inset:0;z-index:2147483001;display:flex;align-items:flex-end;justify-content:center;padding:0 14px calc(14px + env(safe-area-inset-bottom,0px));background:rgba(0,0,0,.52);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);opacity:0;pointer-events:none;transition:opacity .24s ease;font-family:inherit}
    #glueful-update-sheet.glueful-open{opacity:1;pointer-events:auto}#glueful-update-sheet .gus-card{width:min(560px,100%);box-sizing:border-box;border:1px solid rgba(255,255,255,.10);border-radius:28px;background:linear-gradient(180deg,rgba(25,24,38,.98),rgba(12,13,22,.99));box-shadow:0 -18px 70px rgba(0,0,0,.48),0 0 45px rgba(91,47,220,.12);padding:22px 20px 18px;color:#fff;transform:translateY(35px);transition:transform .3s cubic-bezier(.2,.8,.2,1)}#glueful-update-sheet.glueful-open .gus-card{transform:translateY(0)}
    .gus-grabber{width:38px;height:4px;border-radius:99px;background:rgba(255,255,255,.18);margin:0 auto 22px}.gus-head{display:flex;align-items:center;gap:13px}.gus-logo{width:50px;height:50px;display:grid;place-items:center;border-radius:16px;background:linear-gradient(135deg,#8d2cff,#245dff);font-size:25px;box-shadow:0 0 28px rgba(116,55,255,.28)}.gus-title{font-size:23px;font-weight:750;letter-spacing:-.02em}.gus-version{font-size:13px;opacity:.55;margin-top:3px}.gus-x{margin-left:auto;border:0;background:rgba(255,255,255,.07);color:#aaa;width:36px;height:36px;border-radius:50%;font-size:21px}
    .gus-list{display:grid;gap:11px;margin:22px 0}.gus-item{display:flex;gap:12px;align-items:center;padding:12px;border-radius:17px;background:rgba(255,255,255,.045)}.gus-item-icon{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;background:rgba(139,62,255,.16);font-size:19px}.gus-item strong{display:block;font-size:14px}.gus-item span{display:block;font-size:12px;opacity:.55;margin-top:3px;line-height:1.35}.gus-primary{width:100%;border:0;border-radius:16px;padding:14px;background:linear-gradient(100deg,#8b22e8,#245dff);color:#fff;font:inherit;font-size:15px;font-weight:750;box-shadow:0 10px 28px rgba(77,54,220,.28)}.gus-later{display:block;width:100%;border:0;background:transparent;color:#a96cff;padding:14px 8px 4px;font:inherit;font-size:14px;font-weight:650}.gus-progress{height:5px;border-radius:99px;background:rgba(255,255,255,.10);overflow:hidden;margin-top:14px;display:none}.gus-progress i{display:block;width:30%;height:100%;border-radius:inherit;background:linear-gradient(90deg,#8b22e8,#245dff);animation:gup 1.1s ease-in-out infinite}@keyframes gup{0%{transform:translateX(-120%)}100%{transform:translateX(360%)}}
  `;

  function injectStyles(){if(document.getElementById('glueful-update-v6-css'))return;const s=document.createElement('style');s.id='glueful-update-v6-css';s.textContent=css;(document.head||document.documentElement).appendChild(s)}

  function isLegacyUpdateNode(el){
    if(!el || el.id==='glueful-update-banner' || el.id==='glueful-update-sheet') return false;
    const text=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(!text) return false;
    return text.includes('a new version of glueful is available') ||
      (text.includes('update available') && text.includes('later') && text.includes('update'));
  }

  function removeLegacyUpdatePrompts(root=document){
    const candidates=[];
    if(root.nodeType===1 && isLegacyUpdateNode(root)) candidates.push(root);
    if(root.querySelectorAll) root.querySelectorAll('body *,[role="dialog"],dialog,.modal,.alert,.popup').forEach(el=>{if(isLegacyUpdateNode(el))candidates.push(el)});
    candidates.forEach(el=>{
      const box=el.closest?.('[role="dialog"],dialog,.modal,.alert,.popup')||el;
      if(box!==document.body && box.id!=='glueful-update-sheet' && box.id!=='glueful-update-banner') box.remove();
    });
  }

  function watchForLegacyPrompt(){
    removeLegacyUpdatePrompts();
    if(!document.body)return;
    const observer=new MutationObserver(mutations=>{
      for(const m of mutations){
        for(const n of m.addedNodes){
          if(n.nodeType===1) removeLegacyUpdatePrompts(n);
        }
      }
    });
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),15000);
  }

  function createUI(){
    if(updateSheet)return;
    injectStyles();
    const banner=document.createElement('div');banner.id='glueful-update-banner';banner.innerHTML='<div class="gub-icon">✦</div><div class="gub-copy"><div class="gub-title">New version available</div><div class="gub-sub">A faster, smoother Glueful is ready</div></div><button class="gub-more" type="button">See what’s new&nbsp; ›</button><button class="gub-close" type="button" aria-label="Dismiss">×</button>';document.body.appendChild(banner);
    const sheet=document.createElement('div');sheet.id='glueful-update-sheet';sheet.innerHTML='<div class="gus-card"><div class="gus-grabber"></div><div class="gus-head"><div class="gus-logo">✦</div><div><div class="gus-title">What’s New</div><div class="gus-version">A new Glueful update is ready</div></div><button class="gus-x" type="button" aria-label="Close">×</button></div><div class="gus-list"><div class="gus-item"><div class="gus-item-icon">⚡</div><div><strong>Faster experience</strong><span>Smoother navigation and quicker loading.</span></div></div><div class="gus-item"><div class="gus-item-icon">✦</div><div><strong>Better job discovery</strong><span>Improved relevance and a cleaner experience.</span></div></div><div class="gus-item"><div class="gus-item-icon">◈</div><div><strong>Polished mobile UI</strong><span>Refined interactions across Glueful.</span></div></div></div><button class="gus-primary" type="button">Update Now ↓</button><button class="gus-later" type="button">Maybe Later</button><div class="gus-progress"><i></i></div></div>';document.body.appendChild(sheet);updateSheet=sheet;
    const open=()=>{banner.classList.remove('glueful-show');sheet.classList.add('glueful-open')};const close=()=>{sheet.classList.remove('glueful-open');banner.classList.add('glueful-show')};banner.querySelector('.gub-more').onclick=open;banner.querySelector('.gub-close').onclick=()=>banner.classList.remove('glueful-show');sheet.querySelector('.gus-x').onclick=close;sheet.querySelector('.gus-later').onclick=close;sheet.querySelector('.gus-primary').onclick=()=>applyUpdate(sheet.querySelector('.gus-primary'));requestAnimationFrame(()=>banner.classList.add('glueful-show'));
  }

  function showUpdateUI(){if(!document.body){setTimeout(showUpdateUI,30);return}createUI()}

  async function syncServiceWorker(){
    if(!('serviceWorker' in navigator))return false;
    try{const registration=await navigator.serviceWorker.getRegistration();if(!registration)return false;await registration.update();if(registration.waiting){pendingRegistration=registration;showUpdateUI();return true}}catch(e){console.warn('[Glueful update] service worker check failed:',e)}
    return false;
  }

  async function applyUpdate(button){
    if(window.__GLUEFUL_UPDATE_RUNNING__)return;window.__GLUEFUL_UPDATE_RUNNING__=true;if(button){button.disabled=true;button.textContent='Updating…'}
    const reload=()=>location.reload();
    try{const registration=pendingRegistration||await navigator.serviceWorker.getRegistration();if(registration){pendingRegistration=registration;try{await registration.update()}catch(e){}if(registration.waiting){const progress=updateSheet?.querySelector('.gus-progress');if(progress)progress.style.display='block';registration.waiting.postMessage({type:'GLUEFUL_SKIP_WAITING'});navigator.serviceWorker.addEventListener('controllerchange',reload,{once:true});setTimeout(reload,2200);return}}}catch(e){console.warn('[Glueful update] update handoff failed:',e)}
    setTimeout(reload,300);
  }

  function bindUpdateButton(){
    if(document.documentElement.dataset.gluefulUpdateBound==='6')return;
    document.addEventListener('click',e=>{const el=e.target.closest?.('button,a,[role="button"]');if(!el||el.offsetParent===null)return;const text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(text!=='update')return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();void applyUpdate(el)},true);
    document.documentElement.dataset.gluefulUpdateBound='6';
  }

  function boot(){bindUpdateButton();watchForLegacyPrompt();void syncServiceWorker()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
