/* Glueful Plug-ins navigation V1
 * Adds a lightweight Plug-ins entry after Placement Portal and a functional
 * plug-in marketplace surface. This patch is intentionally isolated from
 * Jobs, Applications, Placement Portal and Resume Studio lifecycles.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_PLUGINS_NAV_V1__) return;
  window.__GLUEFUL_PLUGINS_NAV_V1__=true;

  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const ICON='🧩';

  function allTextElements(root=document){
    return [...root.querySelectorAll('a,button,[role="button"],div,span,p,strong')];
  }

  function findText(text){
    const needle=clean(text).toLowerCase();
    return allTextElements().find(el=>clean(el.textContent).toLowerCase()===needle);
  }

  function nearestBlock(el){
    let node=el;
    for(let i=0;i<5&&node;i++,node=node.parentElement){
      const cls=String(node.className||'');
      if(/item|menu|nav|row|card|link/i.test(cls)) return node;
    }
    return el?.parentElement||null;
  }

  function injectSidebarEntry(){
    if(document.querySelector('[data-glueful-plugin-entry]')) return true;
    const portal=findText('Placement Portal');
    if(!portal) return false;
    const block=nearestBlock(portal);
    if(!block||!block.parentElement) return false;

    const entry=document.createElement('button');
    entry.type='button';
    entry.dataset.gluefulPluginEntry='1';
    entry.className='glueful-plugin-nav-entry';
    entry.innerHTML=`<span class="gpn-icon">${ICON}</span><span class="gpn-copy"><strong>Plug-ins</strong><small>Explore and manage integrations</small></span><span class="gpn-badge">New</span><span class="gpn-chevron">›</span>`;
    entry.addEventListener('click',openMarketplace);
    block.parentElement.insertBefore(entry,block.nextSibling);
    return true;
  }

  function openMarketplace(){
    let panel=document.getElementById('glueful-plugins-marketplace-v1');
    if(panel){panel.classList.add('open');return;}

    panel=document.createElement('section');
    panel.id='glueful-plugins-marketplace-v1';
    panel.className='gpm-overlay open';
    panel.innerHTML=`
      <div class="gpm-shell" role="dialog" aria-modal="true" aria-label="Plug-ins">
        <header class="gpm-header">
          <button type="button" class="gpm-back" data-gpm-close aria-label="Back">‹</button>
          <div><h2>Plug-ins</h2><p>Supercharge your journey with useful integrations.</p></div>
          <button type="button" class="gpm-close" data-gpm-close aria-label="Close">×</button>
        </header>
        <div class="gpm-hero"><div><b>Extend Glueful</b><span>Connect tools and services that make your career journey smarter.</span></div><div class="gpm-puzzle">🧩</div></div>
        <nav class="gpm-tabs" aria-label="Plug-in filters">
          <button class="active" data-gpm-filter="all">All</button><button data-gpm-filter="active">Active</button><button data-gpm-filter="recommended">Recommended</button><button data-gpm-filter="new">New</button>
        </nav>
        <div class="gpm-list">
          <h3>Active plug-ins</h3>
          <article class="gpm-plugin" data-kind="active all">
            <div class="gpm-plugin-icon brand">✦</div><div class="gpm-plugin-copy"><b>Brand Fetch</b><em>Official</em><span>Company logos and brand assets used across Glueful.</span><small>Active</small></div><button class="gpm-status" type="button" disabled>Active</button>
          </article>
          <h3>Recommended</h3>
          <article class="gpm-plugin" data-kind="recommended all new"><div class="gpm-plugin-icon radar">◎</div><div class="gpm-plugin-copy"><b>Skill Radar</b><span>Turn your profile into smarter role recommendations.</span></div><button type="button" class="gpm-install">Install</button></article>
          <article class="gpm-plugin" data-kind="recommended all"><div class="gpm-plugin-icon score">✓</div><div class="gpm-plugin-copy"><b>Resume Score</b><span>Score a resume and surface improvement ideas.</span></div><button type="button" class="gpm-install">Install</button></article>
          <article class="gpm-plugin" data-kind="recommended all"><div class="gpm-plugin-icon prep">●</div><div class="gpm-plugin-copy"><b>Interview Prep</b><span>Prepare with role-specific interview practice.</span></div><button type="button" class="gpm-install">Install</button></article>
          <h3>All plug-ins</h3>
          <article class="gpm-plugin" data-kind="all"><div class="gpm-plugin-icon linkedin">in</div><div class="gpm-plugin-copy"><b>LinkedIn Sync</b><span>Bring profile and experience data into Glueful.</span></div><button type="button" class="gpm-install">Install</button></article>
          <article class="gpm-plugin" data-kind="all"><div class="gpm-plugin-icon jobs">↗</div><div class="gpm-plugin-copy"><b>Job Sources</b><span>Connect additional job discovery sources.</span></div><button type="button" class="gpm-install">Install</button></article>
          <article class="gpm-plugin" data-kind="all"><div class="gpm-plugin-icon calendar">31</div><div class="gpm-plugin-copy"><b>Calendar</b><span>Keep interviews and career events together.</span></div><button type="button" class="gpm-install">Install</button></article>
        </div>
      </div>`;
    document.body.appendChild(panel);

    panel.addEventListener('click',e=>{
      if(e.target.matches('[data-gpm-close]')||e.target===panel) closeMarketplace();
      const filter=e.target.closest('[data-gpm-filter]');
      if(filter){
        panel.querySelectorAll('[data-gpm-filter]').forEach(b=>b.classList.toggle('active',b===filter));
        const kind=filter.dataset.gpmFilter;
        panel.querySelectorAll('.gpm-plugin').forEach(card=>{
          card.style.display=(kind==='all'||card.dataset.kind.split(' ').includes(kind))?'grid':'none';
        });
      }
      const install=e.target.closest('.gpm-install');
      if(install){install.textContent='Coming soon';install.disabled=true;}
    });
    panel.querySelector('[data-gpm-close]').focus();
  }

  function closeMarketplace(){
    const panel=document.getElementById('glueful-plugins-marketplace-v1');
    if(panel) panel.classList.remove('open');
  }

  const style=document.createElement('style');
  style.id='glueful-plugins-nav-v1-css';
  style.textContent=`
.glueful-plugin-nav-entry{width:calc(100% - 32px);margin:14px 16px 4px;padding:12px 14px;display:flex;align-items:center;gap:12px;border:1px solid rgba(157,126,255,.20);border-radius:16px;background:rgba(18,23,34,.74);color:#eef0f7;text-align:left;cursor:pointer}.glueful-plugin-nav-entry:hover{border-color:rgba(157,126,255,.45);background:rgba(31,25,59,.72)}.gpn-icon{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:rgba(123,54,255,.12);font-size:20px}.gpn-copy{display:flex;flex-direction:column;gap:3px;flex:1}.gpn-copy strong{font-size:15px}.gpn-copy small{color:#858da1;font-size:12px}.gpn-badge{font-size:10px;font-weight:800;color:#fff;background:linear-gradient(135deg,#7b36ff,#3e75ff);padding:5px 8px;border-radius:999px}.gpn-chevron{font-size:24px;color:#858da1}.gpm-overlay{position:fixed;inset:0;z-index:100000;display:none;background:rgba(3,6,12,.72);backdrop-filter:blur(10px)}.gpm-overlay.open{display:flex;align-items:flex-end;justify-content:center}.gpm-shell{width:min(760px,100%);max-height:92vh;overflow:auto;background:#0b1019;border:1px solid rgba(255,255,255,.10);border-radius:28px 28px 0 0;box-shadow:0 -20px 80px rgba(0,0,0,.5);padding:22px}.gpm-header{display:flex;align-items:center;gap:14px}.gpm-header h2{margin:0;font-size:26px}.gpm-header p{margin:4px 0 0;color:#8d95a8}.gpm-back,.gpm-close{border:0;background:#151c29;color:#fff;border-radius:12px;width:42px;height:42px;font-size:28px;cursor:pointer}.gpm-close{margin-left:auto}.gpm-hero{margin:20px 0;padding:22px;border-radius:20px;background:linear-gradient(135deg,rgba(123,54,255,.24),rgba(40,109,255,.12));border:1px solid rgba(157,126,255,.25);display:flex;justify-content:space-between;align-items:center}.gpm-hero b,.gpm-hero span{display:block}.gpm-hero b{font-size:21px}.gpm-hero span{margin-top:6px;color:#b2b7c6;max-width:500px}.gpm-puzzle{font-size:48px}.gpm-tabs{display:flex;gap:8px;overflow:auto;margin-bottom:20px}.gpm-tabs button{border:1px solid #293142;background:#101722;color:#c5cada;padding:9px 15px;border-radius:999px;white-space:nowrap;cursor:pointer}.gpm-tabs button.active{background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;border-color:transparent}.gpm-list h3{margin:20px 0 10px}.gpm-plugin{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;padding:15px;border:1px solid #222b3b;background:#101621;border-radius:16px;margin:9px 0}.gpm-plugin-icon{width:48px;height:48px;border-radius:13px;display:grid;place-items:center;font-weight:900;font-size:20px;background:#182131}.gpm-plugin-icon.brand{background:#f4f4f0;color:#2f7c58}.gpm-plugin-icon.radar{color:#74ffbf}.gpm-plugin-icon.score{color:#8cff75}.gpm-plugin-icon.prep{color:#ffad5c}.gpm-plugin-icon.linkedin{background:#1666c5;color:#fff}.gpm-plugin-icon.jobs{color:#a88cff}.gpm-plugin-icon.calendar{background:#f5f5f2;color:#d24b42}.gpm-plugin-copy{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center}.gpm-plugin-copy b{font-size:16px}.gpm-plugin-copy em{font-style:normal;color:#a98cff;background:rgba(123,54,255,.12);padding:3px 7px;border-radius:999px;font-size:10px}.gpm-plugin-copy span{grid-column:1/-1;width:100%;color:#929bad;font-size:12px}.gpm-plugin-copy small{grid-column:1/-1;color:#4be6a4;font-weight:700}.gpm-install,.gpm-status{border:1px solid rgba(157,126,255,.35);background:#151125;color:#c7b5ff;border-radius:10px;padding:9px 13px;font-weight:700;cursor:pointer}.gpm-status{color:#4be6a4;border-color:rgba(75,230,164,.25);background:rgba(75,230,164,.08)}.gpm-install:disabled{opacity:.6;cursor:default}@media(max-width:520px){.gpm-shell{padding:18px}.gpm-plugin{grid-template-columns:auto 1fr}.gpm-install,.gpm-status{grid-column:2;justify-self:start}.gpm-hero{padding:17px}.gpm-puzzle{font-size:36px}}
`;
  document.head.appendChild(style);

  function boot(){
    injectSidebarEntry();
    if(!window.__GLUEFUL_PLUGINS_OBSERVER__){
      const observer=new MutationObserver(()=>injectSidebarEntry());
      observer.observe(document.body,{childList:true,subtree:true});
      window.__GLUEFUL_PLUGINS_OBSERVER__=observer;
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
  window.gluefulPluginsNavV1={open:openMarketplace,close:closeMarketplace,refresh:injectSidebarEntry};
})();
