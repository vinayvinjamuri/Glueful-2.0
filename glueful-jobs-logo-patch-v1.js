/* Glueful Jobs V6 visual compatibility patch — fix company-name/card CSS collision */
(function(){'use strict';
const style=document.createElement('style');
style.id='glueful-jobs-v6-visual-fix';
style.textContent=`#glueful-discover-root-v6 .g6-card .g6-company{box-sizing:content-box;flex:none;min-height:0;width:auto;border:0;background:transparent;border-radius:0;color:var(--text-muted);padding:0;text-align:left;font-size:11px;font-weight:400;margin-top:4px;display:block}#glueful-discover-root-v6 .g6-card .g6-company strong,#glueful-discover-root-v6 .g6-card .g6-company b,#glueful-discover-root-v6 .g6-card .g6-company small{display:inline;font-size:inherit;min-height:0;margin:0;color:inherit}`;
document.head.appendChild(style);
window.__GLUEFUL_JOBS_LOGO_PATCH__={version:'20260820-jobs-logo-patch-v1'};
})();

/*
 * Glueful Quick Actions / Plug-ins V1
 * -----------------------------------
 * Layered on top of the existing drawer. It does not replace drawer
 * navigation or any existing job/application/resume behavior.
 * Brand Fetch remains the existing branding pipeline already used by Jobs.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_QUICK_ACTIONS_PLUGINS_V1__) return;
  window.__GLUEFUL_QUICK_ACTIONS_PLUGINS_V1__=true;

  const PLUGIN_STYLE_ID='glueful-plugins-v1-style';
  const PLUGIN_MODAL_ID='glueful-plugins-v1-modal';

  function injectStyle(){
    if(document.getElementById(PLUGIN_STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=PLUGIN_STYLE_ID;
    s.textContent=`
      .gq-plugin-section{margin-top:2px}
      .gq-plugin-badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;padding:4px 8px;border-radius:999px;background:linear-gradient(135deg,#7B36FF,#286DFF);color:#fff;font-size:9px;font-weight:800;letter-spacing:.02em}
      #${PLUGIN_MODAL_ID}{position:fixed;inset:0;z-index:100000;display:none;align-items:flex-end;justify-content:center;background:rgba(3,5,9,.72);backdrop-filter:blur(8px)}
      #${PLUGIN_MODAL_ID}.open{display:flex}
      .gq-plugin-panel{width:min(680px,100%);max-height:min(86vh,760px);overflow:auto;background:linear-gradient(180deg,#111722,#0B0F16);border:1px solid rgba(150,130,255,.18);border-bottom:0;border-radius:24px 24px 0 0;box-shadow:0 -30px 90px rgba(0,0,0,.5);padding:20px 18px calc(20px + env(safe-area-inset-bottom));color:#F5F7FF}
      .gq-plugin-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}
      .gq-plugin-kicker{color:#A98BFF;font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
      .gq-plugin-title{font-family:'Space Grotesk',sans-serif;font-size:25px;font-weight:700;margin:0}
      .gq-plugin-subtitle{color:#8993A5;font-size:12px;margin-top:5px;line-height:1.45}
      .gq-plugin-close{width:38px;height:38px;border-radius:11px;border:1px solid #293141;background:#171D27;color:#D8DEEA;font-size:22px;cursor:pointer}
      .gq-plugin-tabs{display:flex;gap:8px;overflow:auto;padding:2px 0 14px}
      .gq-plugin-tab{border:1px solid #293141;background:#111722;color:#9DA7B8;border-radius:999px;padding:8px 13px;font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer}
      .gq-plugin-tab.active{border-color:#7047EA;background:linear-gradient(135deg,rgba(123,54,255,.28),rgba(40,109,255,.18));color:#F4F0FF}
      .gq-plugin-card{border:1px solid #293141;background:linear-gradient(145deg,#141A24,#0F141D);border-radius:16px;padding:15px;margin-top:10px}
      .gq-plugin-row{display:flex;align-items:center;gap:12px}
      .gq-plugin-icon{width:44px;height:44px;flex:0 0 44px;border-radius:12px;background:#F5F5F1;color:#20242B;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px}
      .gq-plugin-name{font-size:15px;font-weight:800;color:#F4F6FB}
      .gq-plugin-meta{font-size:10px;color:#8E98AA;margin-top:4px;line-height:1.4}
      .gq-plugin-status{margin-left:auto;padding:5px 8px;border-radius:999px;background:rgba(55,211,153,.10);border:1px solid rgba(55,211,153,.20);color:#55D9A3;font-size:9px;font-weight:800;white-space:nowrap}
      .gq-plugin-desc{margin:13px 0 0;color:#A9B2C2;font-size:11px;line-height:1.5}
      .gq-plugin-actions{display:flex;gap:8px;margin-top:13px}
      .gq-plugin-action{flex:1;border:1px solid #30394A;background:#141A24;color:#E5E9F2;border-radius:11px;padding:10px 12px;font-size:11px;font-weight:800;cursor:pointer}
      .gq-plugin-action.primary{border-color:rgba(123,54,255,.45);background:linear-gradient(135deg,#7B36FF,#286DFF);color:#fff}
      .gq-plugin-note{margin-top:12px;color:#667185;font-size:9px;line-height:1.45}
      @media(min-width:701px){#${PLUGIN_MODAL_ID}{align-items:center;padding:24px}.gq-plugin-panel{border-bottom:1px solid rgba(150,130,255,.18);border-radius:24px}}
      html[data-theme="light"] .gq-plugin-panel{background:linear-gradient(180deg,#FFFFFF,#F6F8FC);color:#172033;border-color:#D9DFE8}
      html[data-theme="light"] .gq-plugin-card{background:#fff;border-color:#D9DFE8}
      html[data-theme="light"] .gq-plugin-name{color:#172033}
      html[data-theme="light"] .gq-plugin-desc,html[data-theme="light"] .gq-plugin-meta{color:#5D6A7D}
    `;
    document.head.appendChild(s);
  }

  function openPlugins(){
    injectStyle();
    const modal=document.getElementById(PLUGIN_MODAL_ID);
    if(!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closePlugins(){
    const modal=document.getElementById(PLUGIN_MODAL_ID);
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  function buildModal(){
    if(document.getElementById(PLUGIN_MODAL_ID)) return;
    const modal=document.createElement('div');
    modal.id=PLUGIN_MODAL_ID;
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<section class="gq-plugin-panel"><div class="gq-plugin-head"><div><div class="gq-plugin-kicker">Glueful extensions</div><h2 class="gq-plugin-title">Plug-ins</h2><div class="gq-plugin-subtitle">Supercharge your career workflow with useful integrations.</div></div><button type="button" class="gq-plugin-close" aria-label="Close plug-ins">×</button></div><div class="gq-plugin-tabs" role="tablist"><button type="button" class="gq-plugin-tab active">All</button><button type="button" class="gq-plugin-tab">Active</button><button type="button" class="gq-plugin-tab">Recommended</button><button type="button" class="gq-plugin-tab">New</button></div><div class="gq-plugin-card"><div class="gq-plugin-row"><div class="gq-plugin-icon">✦</div><div><div class="gq-plugin-name">Brand Fetch</div><div class="gq-plugin-meta">Company identity &amp; logo enrichment</div></div><span class="gq-plugin-status">ACTIVE</span></div><p class="gq-plugin-desc">Keeps company branding consistent across job cards, company views and application-related surfaces using the existing Glueful branding pipeline.</p><div class="gq-plugin-actions"><button type="button" class="gq-plugin-action primary" data-plugin-refresh>Refresh branding</button><button type="button" class="gq-plugin-action" data-plugin-close>Done</button></div><div class="gq-plugin-note">This does not replace existing job, application, placement portal or resume logic.</div></div><div class="gq-plugin-card"><div class="gq-plugin-row"><div class="gq-plugin-icon">+</div><div><div class="gq-plugin-name">More plug-ins coming</div><div class="gq-plugin-meta">Connect future career tools here</div></div><span class="gq-plugin-status" style="background:rgba(123,54,255,.10);border-color:rgba(123,54,255,.20);color:#B79AFF">SOON</span></div></div></section>`;
    modal.addEventListener('click',e=>{if(e.target===modal)closePlugins()});
    modal.querySelector('.gq-plugin-close').addEventListener('click',closePlugins);
    modal.querySelector('[data-plugin-close]').addEventListener('click',closePlugins);
    modal.querySelector('[data-plugin-refresh]').addEventListener('click',()=>{
      try{window.gluefulJobsLogoRefresh?.()}catch(_){ }
      try{window.gluefulJobsResumeActionV1?.refresh?.()}catch(_){ }
      const b=modal.querySelector('[data-plugin-refresh]');
      if(b){const old=b.textContent;b.textContent='Branding refreshed ✓';setTimeout(()=>{b.textContent=old},1200)}
    });
    document.body.appendChild(modal);
  }
  function addDrawerItem(){
    const drawer=document.getElementById('glueful-drawer');
    if(!drawer || drawer.querySelector('[data-glueful-plugin-item]')) return;
    const accountLabel=[...drawer.querySelectorAll('.drawer-section-label')].find(el=>el.textContent.trim().toLowerCase()==='account');
    if(!accountLabel) return;
    const divider=document.createElement('div');
    divider.className='drawer-divider';
    divider.dataset.gluefulPluginItem='1';
    const label=document.createElement('div');
    label.className='drawer-section-label gq-plugin-section';
    label.textContent='Plug-ins';
    label.dataset.gluefulPluginItem='1';
    const button=document.createElement('button');
    button.type='button';
    button.className='drawer-item';
    button.dataset.gluefulPluginItem='1';
    button.innerHTML=`<span class="drawer-item-icon"><svg class="premium-svg-icon" viewBox="0 0 24 24"><path d="M9 3h6v3h3a3 3 0 0 1 3 3v3h-3a3 3 0 0 0 0 6h3v3h-3a3 3 0 0 1-3-3v-3H9v3a3 3 0 0 1-3 3H3v-3h3a3 3 0 0 0 0-6H3V9a3 3 0 0 1 3-3h3z"></path></svg></span><span class="drawer-item-copy"><span class="drawer-item-title">Plug-ins</span><span class="drawer-item-subtitle">Explore and manage integrations</span></span><span class="gq-plugin-badge">New</span><span class="drawer-item-chevron">›</span>`;
    button.addEventListener('click',()=>{try{toggleGluefulDrawer(false)}catch(_){ }openPlugins()});
    drawer.insertBefore(divider,accountLabel);
    drawer.insertBefore(label,accountLabel);
    drawer.insertBefore(button,accountLabel);
  }
  function renameDrawerBrand(){
    const drawer=document.getElementById('glueful-drawer');
    if(!drawer) return;
    const name=drawer.querySelector('.drawer-brand-name');
    if(name){name.textContent='Quick Actions'}
    else{
      const brand=drawer.querySelector('.drawer-brand');
      if(brand){
        const walker=document.createTreeWalker(brand,NodeFilter.SHOW_TEXT);
        let n;while(n=walker.nextNode()){if(n.nodeValue.trim()==='Glueful'){n.nodeValue=n.nodeValue.replace('Glueful','Quick Actions');break}}
      }
    }
    drawer.setAttribute('aria-label','Quick Actions navigation');
  }
  function boot(){injectStyle();buildModal();renameDrawerBrand();addDrawerItem()}
  window.gluefulOpenPlugins=openPlugins;
  window.gluefulClosePlugins=closePlugins;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  const observer=new MutationObserver(()=>{renameDrawerBrand();addDrawerItem();if(!document.getElementById(PLUGIN_MODAL_ID))buildModal()});
  observer.observe(document.body,{childList:true,subtree:true});
})();
