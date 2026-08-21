/* Glueful Jobs V7 visual + Quick Actions / Plug-ins patch.
 * Loaded by the authoritative service worker after Jobs V15.
 * Keeps existing job/application/resume behavior intact.
 * Phase 1: the observer disconnects while this patch mutates the drawer,
 * preventing self-triggered mutation churn on mobile.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_QUICK_ACTIONS_PLUGINS_V2__) return;
  window.__GLUEFUL_QUICK_ACTIONS_PLUGINS_V2__=true;

  const STYLE_ID='glueful-jobs-v7-quick-actions-style';
  const MODAL_ID='glueful-plugins-v2-modal';

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #glueful-drawer .gq-brand-title{font-family:'Space Grotesk','Inter',sans-serif;font-weight:800}
      #glueful-drawer .gq-plugin-section{margin-top:2px}
      #glueful-drawer .gq-plugin-badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;padding:4px 8px;border-radius:999px;background:linear-gradient(135deg,#7B36FF,#286DFF);color:#fff;font-size:9px;font-weight:800;letter-spacing:.02em}
      #${MODAL_ID}{position:fixed;inset:0;z-index:100000;display:none;align-items:flex-end;justify-content:center;background:rgba(3,5,9,.76);backdrop-filter:blur(9px)}
      #${MODAL_ID}.open{display:flex}
      #${MODAL_ID} .gq-panel{width:min(680px,100%);max-height:min(88vh,760px);overflow:auto;background:linear-gradient(180deg,#111722,#0B0F16);border:1px solid rgba(150,130,255,.18);border-bottom:0;border-radius:24px 24px 0 0;box-shadow:0 -30px 90px rgba(0,0,0,.5);padding:20px 18px calc(20px + env(safe-area-inset-bottom));color:#F5F7FF}
      #${MODAL_ID} .gq-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}
      #${MODAL_ID} .gq-kicker{color:#A98BFF;font:800 10px 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
      #${MODAL_ID} h2{font:700 25px 'Space Grotesk','Inter',sans-serif;margin:0}
      #${MODAL_ID} .gq-sub{color:#8993A5;font-size:12px;margin-top:5px;line-height:1.45}
      #${MODAL_ID} .gq-close{width:38px;height:38px;border-radius:11px;border:1px solid #293141;background:#171D27;color:#D8DEEA;font-size:22px;cursor:pointer}
      #${MODAL_ID} .gq-tabs{display:flex;gap:8px;overflow:auto;padding:2px 0 14px}
      #${MODAL_ID} .gq-tab{border:1px solid #293141;background:#111722;color:#9DA7B8;border-radius:999px;padding:8px 13px;font-size:11px;font-weight:700;white-space:nowrap}
      #${MODAL_ID} .gq-tab.active{border-color:#7047EA;background:linear-gradient(135deg,rgba(123,54,255,.28),rgba(40,109,255,.18));color:#F4F0FF}
      #${MODAL_ID} .gq-card{border:1px solid #293141;background:linear-gradient(145deg,#141A24,#0F141D);border-radius:16px;padding:15px;margin-top:10px}
      #${MODAL_ID} .gq-row{display:flex;align-items:center;gap:12px}
      #${MODAL_ID} .gq-icon{width:44px;height:44px;flex:0 0 44px;border-radius:12px;background:#F5F5F1;color:#20242B;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px}
      #${MODAL_ID} .gq-name{font-size:15px;font-weight:800;color:#F4F6FB}
      #${MODAL_ID} .gq-meta{font-size:10px;color:#8E98AA;margin-top:4px;line-height:1.4}
      #${MODAL_ID} .gq-status{margin-left:auto;padding:5px 8px;border-radius:999px;background:rgba(55,211,153,.10);border:1px solid rgba(55,211,153,.20);color:#55D9A3;font-size:9px;font-weight:800;white-space:nowrap}
      #${MODAL_ID} .gq-desc{margin:13px 0 0;color:#A9B2C2;font-size:11px;line-height:1.5}
      #${MODAL_ID} .gq-actions{display:flex;gap:8px;margin-top:13px}
      #${MODAL_ID} .gq-action{flex:1;border:1px solid #30394A;background:#141A24;color:#E5E9F2;border-radius:11px;padding:10px 12px;font-size:11px;font-weight:800;cursor:pointer}
      #${MODAL_ID} .gq-action.primary{border-color:rgba(123,54,255,.45);background:linear-gradient(135deg,#7B36FF,#286DFF);color:#fff}
      #${MODAL_ID} .gq-note{margin-top:12px;color:#667185;font-size:9px;line-height:1.45}
      html[data-theme="light"] #${MODAL_ID} .gq-panel{background:linear-gradient(180deg,#FFFFFF,#F6F8FC);color:#172033;border-color:#D9DFE8}
      html[data-theme="light"] #${MODAL_ID} .gq-card{background:#fff;border-color:#D9DFE8}
      html[data-theme="light"] #${MODAL_ID} .gq-name{color:#172033}
      html[data-theme="light"] #${MODAL_ID} .gq-desc,html[data-theme="light"] #${MODAL_ID} .gq-meta{color:#5D6A7D}
      @media(min-width:701px){#${MODAL_ID}{align-items:center;padding:24px}#${MODAL_ID} .gq-panel{border-bottom:1px solid rgba(150,130,255,.18);border-radius:24px}}
    `;
    document.head.appendChild(style);
  }

  function renameBrand(){
    const drawer=document.getElementById('glueful-drawer');
    if(!drawer) return false;
    drawer.setAttribute('aria-label','Quick Actions navigation');
    const explicit=drawer.querySelector('.drawer-brand-name');
    if(explicit){if(explicit.textContent!=='Quick Actions')explicit.textContent='Quick Actions';explicit.classList.add('gq-brand-title');return true;}
    const brand=drawer.querySelector('.drawer-brand');
    if(!brand) return false;
    const walker=document.createTreeWalker(brand,NodeFilter.SHOW_TEXT);
    const matches=[];let node;
    while(node=walker.nextNode()){
      if(String(node.nodeValue||'').trim().toLowerCase()==='glueful') matches.push(node);
    }
    if(matches.length&&matches[0].nodeValue!=='Quick Actions')matches[0].nodeValue='Quick Actions';
    return matches.length>0;
  }

  function openPlugins(){
    injectStyle();
    let modal=document.getElementById(MODAL_ID);
    if(!modal) buildModal();
    modal=document.getElementById(MODAL_ID);
    if(!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }

  function closePlugins(){
    const modal=document.getElementById(MODAL_ID);
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }

  function refreshBranding(button){
    try{window.gluefulJobsLogoRefresh?.()}catch(_){ }
    try{window.gluefulJobsResumeActionV1?.refresh?.()}catch(_){ }
    try{window.dispatchEvent(new CustomEvent('glueful-brand-fetch-refresh'))}catch(_){ }
    if(button){const old=button.textContent;button.textContent='Branding refreshed ✓';setTimeout(()=>{button.textContent=old},1200)}
  }

  function buildModal(){
    if(document.getElementById(MODAL_ID)) return;
    const modal=document.createElement('div');
    modal.id=MODAL_ID;
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<section class="gq-panel"><div class="gq-head"><div><div class="gq-kicker">Glueful extensions</div><h2>Plug-ins</h2><div class="gq-sub">Supercharge your career workflow with useful integrations.</div></div><button type="button" class="gq-close" aria-label="Close plug-ins">×</button></div><div class="gq-tabs"><button type="button" class="gq-tab active">All</button><button type="button" class="gq-tab">Active</button><button type="button" class="gq-tab">Recommended</button></div><div class="gq-card"><div class="gq-row"><div class="gq-icon">✦</div><div><div class="gq-name">Brand Fetch</div><div class="gq-meta">Company identity &amp; logo enrichment</div></div><span class="gq-status">ACTIVE</span></div><p class="gq-desc">Uses the existing Glueful company-branding pipeline wherever a job exposes a company logo. Existing job and application data are not replaced.</p><div class="gq-actions"><button type="button" class="gq-action primary" data-refresh>Refresh branding</button><button type="button" class="gq-action" data-done>Done</button></div><div class="gq-note">Plug-ins are additive. Jobs, Applications, Resumes, Placement Portal and Resume Studio keep their existing handlers.</div></div><div class="gq-card"><div class="gq-row"><div class="gq-icon">+</div><div><div class="gq-name">More plug-ins</div><div class="gq-meta">Future career integrations can be added here.</div></div><span class="gq-status" style="background:rgba(123,54,255,.10);border-color:rgba(123,54,255,.20);color:#B79AFF">SOON</span></div></div></section>`;
    modal.addEventListener('click',e=>{if(e.target===modal)closePlugins()});
    modal.querySelector('.gq-close').addEventListener('click',closePlugins);
    modal.querySelector('[data-done]').addEventListener('click',closePlugins);
    modal.querySelector('[data-refresh]').addEventListener('click',e=>refreshBranding(e.currentTarget));
    document.body.appendChild(modal);
  }

  function addDrawerItem(){
    const drawer=document.getElementById('glueful-drawer');
    if(!drawer) return false;
    if(drawer.querySelector('[data-glueful-plugin-item="v2"]')) return true;
    const labels=[...drawer.querySelectorAll('.drawer-section-label')];
    const account=labels.find(el=>el.textContent.trim().toLowerCase()==='account');
    if(!account) return false;

    const divider=document.createElement('div');
    divider.className='drawer-divider';
    divider.dataset.gluefulPluginItem='v2';
    const label=document.createElement('div');
    label.className='drawer-section-label gq-plugin-section';
    label.textContent='Plug-ins';
    label.dataset.gluefulPluginItem='v2';
    const button=document.createElement('button');
    button.type='button';
    button.className='drawer-item';
    button.dataset.gluefulPluginItem='v2';
    button.innerHTML=`<span class="drawer-item-icon"><svg class="premium-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6v3h3a3 3 0 0 1 3 3v3h-3a3 3 0 0 0 0 6h3v3h-3a3 3 0 0 1-3-3v-3H9v3a3 3 0 0 1-3 3H3v-3h3a3 3 0 0 0 0-6H3V9a3 3 0 0 1 3-3h3z"></path></svg></span><span class="drawer-item-copy"><span class="drawer-item-title">Plug-ins</span><span class="drawer-item-subtitle">Explore and manage integrations</span></span><span class="gq-plugin-badge">New</span><span class="drawer-item-chevron">›</span>`;
    button.addEventListener('click',()=>{try{window.toggleGluefulDrawer?.(false)}catch(_){ }try{window.gluefulOpenPlugins?.()}catch(_){openPlugins()}});

    drawer.insertBefore(divider,account);
    drawer.insertBefore(label,account);
    drawer.insertBefore(button,account);
    return true;
  }

  function ensure(){
    injectStyle();
    buildModal();
    renameBrand();
    addDrawerItem();
  }

  window.gluefulOpenPlugins=openPlugins;
  window.gluefulClosePlugins=closePlugins;
  window.gluefulJobsLogoRefresh=refreshBranding;

  function boot(){
    ensure();
    if(window.__GLUEFUL_QA_OBSERVER__) return;
    const target=document.body;
    if(!target) return;
    const observer=new MutationObserver(()=>{
      observer.disconnect();
      try{ensure();}finally{observer.observe(target,{childList:true,subtree:true});}
    });
    observer.observe(target,{childList:true,subtree:true});
    window.__GLUEFUL_QA_OBSERVER__=observer;
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
