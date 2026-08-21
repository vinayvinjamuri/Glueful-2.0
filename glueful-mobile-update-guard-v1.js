(function(){
  'use strict';
  if(window.__GLUEFUL_MOBILE_UPDATE_GUARD_V2__) return;
  window.__GLUEFUL_MOBILE_UPDATE_GUARD_V2__=true;

  const norm=v=>String(v||'').replace(/\s+/g,' ').trim().toLowerCase();

  async function applyUpdate(button){
    if(window.__GLUEFUL_UPDATE_RUNNING__) return;
    window.__GLUEFUL_UPDATE_RUNNING__=true;
    if(button){
      button.disabled=true;
      button.dataset.gluefulOriginalText=button.textContent;
      button.textContent='UPDATING…';
    }

    let reloaded=false;
    const reloadOnce=()=>{
      if(reloaded) return;
      reloaded=true;
      location.reload();
    };

    try{
      if('serviceWorker' in navigator){
        const registration=await navigator.serviceWorker.getRegistration();

        if(registration){
          try{ await registration.update(); }catch(e){
            console.warn('[Glueful update] service worker update check failed:',e);
          }

          if(registration.waiting){
            registration.waiting.postMessage({type:'GLUEFUL_SKIP_WAITING'});
            navigator.serviceWorker.addEventListener('controllerchange',()=>reloadOnce(),{once:true});
            setTimeout(reloadOnce,1600);
            return;
          }
        }
      }
    }catch(e){
      console.warn('[Glueful update] update handoff failed:',e);
    }

    /* No waiting worker: the page itself is the newest network version.
       Reload once without unregistering the service worker or destroying
       every cache. This avoids the blank-screen failure seen on Android. */
    setTimeout(reloadOnce,250);
  }

  function bindUpdateButton(){
    if(document.documentElement.dataset.gluefulUpdateBound==='2') return;
    document.addEventListener('click',function(e){
      const el=e.target.closest?.('button,a,[role="button"]');
      if(!el || norm(el.textContent)!=='update' || el.offsetParent===null) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      void applyUpdate(el);
    },true);
    document.documentElement.dataset.gluefulUpdateBound='2';
  }

  function drawer(){
    return document.querySelector('#glueful-drawer') ||
      document.querySelector('.glueful-drawer') ||
      document.querySelector('[data-drawer]') || null;
  }

  function replaceBrand(d){
    if(!d) return false;
    d.setAttribute('aria-label','Quick Actions navigation');
    const explicit=d.querySelector('.drawer-brand-name');
    if(explicit){explicit.textContent='Quick Actions';return true;}
    const scope=d.querySelector('.drawer-brand,.drawer-header,.brand')||d;
    const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
    let n;
    while(n=walker.nextNode()){
      if(norm(n.nodeValue)==='glueful'){
        n.nodeValue='Quick Actions';
        return true;
      }
    }
    return false;
  }

  function openPlugins(){
    let m=document.getElementById('glueful-mobile-plugins-modal');
    if(!m){
      m=document.createElement('div');
      m.id='glueful-mobile-plugins-modal';
      m.innerHTML='<div class="gmp-panel" role="dialog" aria-modal="true"><button class="gmp-close" type="button">×</button><div class="gmp-kicker">QUICK ACTIONS</div><h2>Plug-ins</h2><p>Extend Glueful with useful integrations and career tools.</p><div class="gmp-card"><b>Brand Fetch</b><span>Company logos and branding for job listings.</span><em>ACTIVE</em><button type="button" data-gmp-refresh>Refresh branding</button></div><div class="gmp-card"><b>Resume Studio</b><span>Edit and tailor your resume for the selected job.</span><em>ACTIVE</em></div><div class="gmp-card"><b>More plug-ins</b><span>Additional integrations will appear here.</span><em>COMING SOON</em></div></div>';
      const s=document.createElement('style');
      s.textContent='#glueful-mobile-plugins-modal{position:fixed;inset:0;z-index:100001;background:rgba(3,5,10,.78);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center}#glueful-mobile-plugins-modal .gmp-panel{width:100%;max-width:680px;max-height:88vh;overflow:auto;background:#111722;color:#f5f7ff;border:1px solid rgba(150,130,255,.2);border-radius:24px 24px 0 0;padding:22px 18px calc(22px + env(safe-area-inset-bottom));position:relative;font-family:Inter,system-ui,sans-serif}#glueful-mobile-plugins-modal h2{margin:2px 0 5px;font-size:25px}#glueful-mobile-plugins-modal p{margin:0 0 16px;color:#8993a5;font-size:12px}#glueful-mobile-plugins-modal .gmp-kicker{color:#a98bff;font-size:10px;font-weight:800;letter-spacing:.1em}#glueful-mobile-plugins-modal .gmp-close{position:absolute;right:16px;top:16px;width:38px;height:38px;border:1px solid #293141;border-radius:11px;background:#171d27;color:#fff;font-size:24px}#glueful-mobile-plugins-modal .gmp-card{position:relative;border:1px solid #293141;background:#151b26;border-radius:15px;padding:15px;margin-top:10px}#glueful-mobile-plugins-modal .gmp-card b,#glueful-mobile-plugins-modal .gmp-card span{display:block}#glueful-mobile-plugins-modal .gmp-card b{font-size:14px}#glueful-mobile-plugins-modal .gmp-card span{font-size:11px;color:#8f98aa;margin-top:5px;padding-right:65px}#glueful-mobile-plugins-modal .gmp-card em{position:absolute;right:12px;top:13px;font-style:normal;font-size:8px;color:#61d8a7;font-weight:900}#glueful-mobile-plugins-modal .gmp-card button{margin-top:12px;border:1px solid rgba(123,54,255,.35);background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;border-radius:10px;padding:9px 11px;font-weight:800;font-size:10px}';
      document.head.appendChild(s);
      document.body.appendChild(m);
      m.addEventListener('click',e=>{if(e.target===m||e.target.closest('.gmp-close'))m.remove()});
      m.querySelector('[data-gmp-refresh]')?.addEventListener('click',()=>{
        try{window.gluefulJobsLogoRefresh?.()}catch(_){}
        try{window.gluefulJobsResumeActionV1?.refresh?.()}catch(_){}
      });
    }
  }

  function ensurePlugin(d){
    if(!d || d.querySelector('[data-glueful-mobile-plugin="v2"]')) return;

    const items=[...d.querySelectorAll('button,a,[role="button"],.drawer-item,.nav-item,.menu-item')];
    const placement=items.find(x=>norm(x.textContent).includes('placement portal'));
    const account=items.find(x=>norm(x.textContent).includes('profile')||norm(x.textContent).includes('settings'));

    const b=document.createElement('button');
    b.type='button';
    b.dataset.gluefulMobilePlugin='v2';
    b.className='gmp-nav-item';
    b.innerHTML='<span class="gmp-nav-icon">✦</span><span><strong>Plug-ins</strong><small>Explore and manage integrations</small></span><i>New</i>';
    b.onclick=openPlugins;

    if(placement?.parentNode) placement.parentNode.insertBefore(b,placement.nextSibling);
    else if(account?.parentNode) account.parentNode.insertBefore(b,account);
    else d.appendChild(b);

    if(!document.getElementById('gmp-nav-style')){
      const s=document.createElement('style');
      s.id='gmp-nav-style';
      s.textContent='.gmp-nav-item{width:100%;display:flex;align-items:center;gap:12px;text-align:left;border:0;background:transparent;color:#f5f7ff;padding:11px 12px;border-radius:12px;margin:3px 0;cursor:pointer}.gmp-nav-item:hover{background:rgba(123,54,255,.12)}.gmp-nav-icon{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:#171d27;color:#b89cff;font-size:17px}.gmp-nav-item strong,.gmp-nav-item small{display:block}.gmp-nav-item strong{font-size:13px}.gmp-nav-item small{font-size:10px;color:#8993a5;margin-top:3px}.gmp-nav-item i{margin-left:auto;font-style:normal;font-size:8px;font-weight:900;color:#fff;background:linear-gradient(135deg,#7b36ff,#3e75ff);padding:4px 7px;border-radius:999px}';
      document.head.appendChild(s);
    }
  }

  function patch(){
    bindUpdateButton();
    const d=drawer();
    if(d){replaceBrand(d);ensurePlugin(d)}
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',patch,{once:true});
  else patch();
  new MutationObserver(patch).observe(document.documentElement,{childList:true,subtree:true});
})();
