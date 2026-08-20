/* Glueful Quick Actions + Plug-ins V1
 * Adds the requested navigation naming and a functional Plug-ins entry.
 * Brand Fetch is represented from the existing deployed logo integration;
 * this layer does not replace or alter the existing Brand Fetch implementation.
 */
(function () {
  'use strict';
  if (window.__GLUEFUL_QUICK_ACTIONS_PLUGINS_V1__) return;
  window.__GLUEFUL_QUICK_ACTIONS_PLUGINS_V1__ = true;

  const PLUGINS = [
    { name: 'Brand Fetch', badge: 'Official', description: 'Fetch company logos and brand assets for jobs and applications.', state: 'Active' },
    { name: 'Skill Radar', description: 'Surface skill signals and role recommendations.', state: 'Coming soon' },
    { name: 'Resume Score', description: 'Score your resume against a selected role.', state: 'Coming soon' },
    { name: 'Interview Prep', description: 'Prepare with role-focused interview practice.', state: 'Coming soon' }
  ];

  function ensureStyles() {
    if (document.getElementById('glueful-plugins-v1-css')) return;
    const style = document.createElement('style');
    style.id = 'glueful-plugins-v1-css';
    style.textContent = `
      #glueful-plugins-v1{position:fixed;inset:0;z-index:100000;display:none;background:#080b12;color:#f5f7ff;font-family:inherit;overflow:auto}
      #glueful-plugins-v1.gp-open{display:block}
      #glueful-plugins-v1 .gp-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:14px;padding:18px 20px;background:rgba(8,11,18,.94);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.08)}
      #glueful-plugins-v1 .gp-back{border:0;border-radius:12px;background:#151b27;color:#fff;font-size:22px;width:42px;height:42px;cursor:pointer}
      #glueful-plugins-v1 .gp-title{font-size:22px;font-weight:750}
      #glueful-plugins-v1 .gp-wrap{max-width:760px;margin:0 auto;padding:24px 20px 48px}
      #glueful-plugins-v1 .gp-hero{padding:22px;border-radius:20px;background:linear-gradient(135deg,#17102f,#111827);border:1px solid rgba(145,92,255,.35);margin-bottom:22px}
      #glueful-plugins-v1 .gp-hero h2{margin:0 0 7px;font-size:24px}.gp-hero p{margin:0;color:#aeb5c8;line-height:1.5}
      #glueful-plugins-v1 .gp-tabs{display:flex;gap:8px;overflow:auto;margin:0 0 22px;padding-bottom:3px}
      #glueful-plugins-v1 .gp-tab{border:1px solid #282f3d;background:#10151f;color:#d8dbea;border-radius:999px;padding:9px 15px;white-space:nowrap;cursor:pointer}.gp-tab.active{background:linear-gradient(90deg,#7c35e8,#4169ff);border-color:transparent;color:#fff}
      #glueful-plugins-v1 .gp-section{font-size:18px;font-weight:700;margin:18px 0 10px}
      #glueful-plugins-v1 .gp-card{display:flex;align-items:center;gap:14px;padding:16px;border:1px solid #252c39;background:#10151f;border-radius:16px;margin:9px 0}
      #glueful-plugins-v1 .gp-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:12px;background:#f7f7f3;color:#18202d;font-weight:800;flex:0 0 46px}
      #glueful-plugins-v1 .gp-info{flex:1;min-width:0}.gp-name{font-weight:700;font-size:16px}.gp-desc{color:#9ca5b8;font-size:13px;margin-top:4px;line-height:1.35}
      #glueful-plugins-v1 .gp-state{font-size:12px;color:#65e6a8;margin-top:6px}.gp-btn{border:1px solid #5b3b9b;background:#171329;color:#c9aaff;border-radius:10px;padding:9px 13px;white-space:nowrap;cursor:pointer}.gp-btn[disabled]{opacity:.55;cursor:default}
      @media(max-width:600px){#glueful-plugins-v1 .gp-wrap{padding:20px 16px 40px}}
    `;
    document.head.appendChild(style);
  }

  function render() {
    let root = document.getElementById('glueful-plugins-v1');
    if (root) return root;
    ensureStyles();
    root = document.createElement('div');
    root.id = 'glueful-plugins-v1';
    root.innerHTML = `<div class="gp-head"><button class="gp-back" aria-label="Back">‹</button><div class="gp-title">Plug-ins</div></div><main class="gp-wrap"><section class="gp-hero"><h2>Extend Glueful</h2><p>Connect tools and services that make your career journey smarter.</p></section><div class="gp-tabs"><button class="gp-tab active">All</button><button class="gp-tab">Active</button><button class="gp-tab">Recommended</button><button class="gp-tab">New</button></div><div class="gp-section">Plug-ins</div><div id="gp-list"></div></main>`;
    document.body.appendChild(root);
    root.querySelector('.gp-back').addEventListener('click', () => root.classList.remove('gp-open'));
    root.querySelectorAll('.gp-tab').forEach(tab => tab.addEventListener('click', () => {
      root.querySelectorAll('.gp-tab').forEach(x => x.classList.remove('active')); tab.classList.add('active');
      const mode = tab.textContent.toLowerCase();
      root.querySelector('#gp-list').innerHTML = PLUGINS.filter(p => mode === 'all' || (mode === 'active' ? p.state === 'Active' : mode === 'recommended' ? p.name !== 'Brand Fetch' : p.state === 'Coming soon')).map(p => `<article class="gp-card"><div class="gp-icon">${p.name === 'Brand Fetch' ? '✦' : '✚'}</div><div class="gp-info"><div class="gp-name">${p.name}${p.badge ? ` <small style="color:#c6a6ff">${p.badge}</small>` : ''}</div><div class="gp-desc">${p.description}</div><div class="gp-state">${p.state}</div></div><button class="gp-btn" ${p.state !== 'Active' ? 'disabled' : ''}>${p.state === 'Active' ? 'Active' : 'Soon'}</button></article>`).join('');
    }));
    root.querySelector('.gp-tab').click();
    return root;
  }

  window.GluefulOpenPlugins = function () { render().classList.add('gp-open'); };
  window.GluefulQuickActionsPlugins = { open: window.GluefulOpenPlugins, plugins: PLUGINS };
})();
