/* Glueful Applications — Reference V5
 * Final desktop geometry for the supplied Applications screenshot.
 * This is presentation-only: existing data, navigation and CRUD handlers remain untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_REFERENCE_V5__) return;
  window.__GLUEFUL_APPLICATIONS_REFERENCE_V5__=true;

  const VIEW='view-applications';
  const RAIL='gf-app-reference-rail-v5';
  const STYLE='gf-app-reference-v5-style';
  const view=()=>document.getElementById(VIEW);
  const active=()=>{const v=view();return !!v&&(v.classList.contains('active')||v.style.display==='block');};

  function installStyle(){
    if(document.getElementById(STYLE)) return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      html,body{overflow-x:hidden!important}
      @media(min-width:1280px){
        /* Canvas: 260px navigation + 32px inset. */
        body #${VIEW}{
          position:fixed!important;left:260px!important;right:0!important;top:0!important;bottom:0!important;
          width:auto!important;height:100vh!important;min-height:100vh!important;margin:0!important;
          padding:24px 32px 52px!important;box-sizing:border-box!important;
          overflow-x:hidden!important;overflow-y:auto!important;transform:none!important;
          background:#f7f8fc!important;color:#172039!important;
        }

        /* The reference utility rail is 370px wide and begins at x≈292px. */
        body #${RAIL}{
          position:absolute!important;left:12px!important;top:0!important;width:370px!important;max-width:370px!important;
          display:flex!important;flex-direction:column!important;gap:16px!important;
          margin:0!important;padding:0!important;z-index:10!important;box-sizing:border-box!important;
        }
        body #${RAIL}>.gf-card{width:370px!important;max-width:370px!important;box-sizing:border-box!important}

        /* IMPORTANT: the real application content is not only the named main wrappers.
           Move EVERY visible direct child except the rail into the right-hand 952px column.
           This prevents cards from sitting underneath the utility rail. */
        body #${VIEW}>:not(#${RAIL}){
          width:952px!important;max-width:952px!important;min-width:0!important;
          margin-left:383px!important;margin-right:0!important;box-sizing:border-box!important;
          transform:none!important;
        }

        body #${VIEW}>.view-header{
          position:relative!important;height:70px!important;min-height:70px!important;
          margin-top:0!important;margin-bottom:22px!important;padding:0!important;
          display:block!important;box-sizing:border-box!important;
        }

        body #${VIEW} .view-title{
          margin:0 0 5px!important;font-size:36px!important;line-height:39px!important;
          letter-spacing:-1.35px!important;font-weight:750!important;color:#172039!important;
        }
        body #${VIEW} .view-subtitle{
          margin:0!important;font-size:16px!important;line-height:22px!important;color:#72809d!important;
        }

        /* Keep the real Add handler, but put the button exactly in the reference header. */
        body #${VIEW}>.view-header>button:first-of-type,
        body #${VIEW}>.view-header>a:first-of-type{
          position:absolute!important;left:445px!important;top:0!important;margin:0!important;transform:none!important;
        }

        /* Hide any old/orphan profile control. V5 supplies the correctly positioned one. */
        body #${VIEW} button[aria-label*="Profile" i]:not(#gf-profile-v5),
        body #${VIEW} button[title*="Profile" i]:not(#gf-profile-v5),
        body #${VIEW} button[aria-label*="Settings" i]:not(#gf-profile-v5),
        body #${VIEW} .profile-button:not(#gf-profile-v5){display:none!important}

        /* Search/list descendants fill the new main column, never the rail. */
        body #${VIEW}>:not(#${RAIL}) input[type="search"],
        body #${VIEW}>:not(#${RAIL}) input[placeholder*="Search"],
        body #${VIEW}>:not(#${RAIL}) input[placeholder*="search"]{
          width:100%!important;max-width:none!important;min-width:0!important;
          height:48px!important;min-height:48px!important;box-sizing:border-box!important;
          border:1px solid #e1e6ef!important;border-radius:12px!important;background:#fff!important;
          color:#25324c!important;padding:0 16px 0 46px!important;
        }

        body #${VIEW}>:not(#${RAIL}) .application-card,
        body #${VIEW}>:not(#${RAIL}) .job-application-card,
        body #${VIEW}>:not(#${RAIL}) [class*="application-card"]{
          width:100%!important;max-width:none!important;min-width:0!important;min-height:90px!important;
          box-sizing:border-box!important;background:#fff!important;border:1px solid #e2e7ef!important;
          border-radius:16px!important;box-shadow:0 4px 14px rgba(25,35,65,.045)!important;
        }
        body #${VIEW}>:not(#${RAIL}) .application-card+.application-card,
        body #${VIEW}>:not(#${RAIL}) .job-application-card+.job-application-card,
        body #${VIEW}>:not(#${RAIL}) [class*="application-card"]+[class*="application-card"]{margin-top:18px!important}
      }

      #${RAIL} .gf-card{
        background:#fff!important;border:1px solid #e5e9f1!important;border-radius:15px!important;
        box-shadow:0 4px 18px rgba(24,35,62,.045)!important;color:#172039!important;padding:18px!important;
      }
      #${RAIL} .insights{height:316px!important}.upcoming{height:197px!important}.quick{height:292px!important}
      #${RAIL} .gf-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px}
      #${RAIL} h3{margin:0;font:750 17px/21px Inter,system-ui,sans-serif;letter-spacing:-.3px;color:#172039}
      #${RAIL} .month{height:38px;padding:0 12px;border:1px solid #e3e7ef;border-radius:10px;background:#fff;color:#25324c;font:600 12px/38px Inter,sans-serif}
      #${RAIL} .month span{margin-left:12px}
      #${RAIL} .insight-body{display:flex;align-items:center;gap:24px;margin:4px 0 20px}
      #${RAIL} .donut{position:relative;width:132px;height:132px;flex:0 0 132px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:conic-gradient(#6841ee 0 72%,#356ef6 72% 100%)}
      #${RAIL} .donut:after{content:'';position:absolute;inset:18px;border-radius:50%;background:#fff}
      #${RAIL} .donut strong,#${RAIL} .donut small{position:relative;z-index:1}#${RAIL} .donut strong{font:700 21px/22px Inter,sans-serif}#${RAIL} .donut small{margin-top:4px;font:500 10px/12px Inter,sans-serif;color:#75819b}
      #${RAIL} .legend{flex:1;display:flex;flex-direction:column;gap:14px}#${RAIL} .legend div{display:flex;align-items:center;gap:9px;font:500 12px/15px Inter,sans-serif;color:#65728d}#${RAIL} .legend i{width:10px;height:10px;border-radius:50%;flex:0 0 10px}#${RAIL} .legend .a{background:#f5bc32}#${RAIL} .legend .i{background:#3f72f5}#${RAIL} .legend .o{background:#15c48a}#${RAIL} .legend .r{background:#ef4b58}#${RAIL} .legend b{margin-left:auto;color:#26314b}
      #${RAIL} .tip{display:flex;gap:9px;padding:13px 12px;border-radius:12px;background:#f7f6ff;color:#63708b;font:500 12px/17px Inter,sans-serif}.tip p{margin:0}.tip b{color:#4d40d9}
      #${RAIL} .link{color:#4638e8;font:700 12px/16px Inter,sans-serif;text-decoration:none}
      #${RAIL} .action{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #f0f2f6}#${RAIL} .action:first-of-type{border-top:0;padding-top:0}
      #${RAIL} .action-icon{width:38px;height:38px;flex:0 0 38px;display:grid;place-items:center;border-radius:50%;background:#f3f5f9;color:#6b7892;font-size:22px}#${RAIL} .action-icon.check{background:#eafaf2;color:#12b879;font-size:19px}#${RAIL} .action b{display:block;font:600 13px/16px Inter,sans-serif}#${RAIL} .action small{display:block;margin-top:4px;font:500 11px/14px Inter,sans-serif;color:#77839b}#${RAIL} .action small.red{color:#ef4b58}
      #${RAIL} .quick button{width:100%;height:42px;display:flex;align-items:center;gap:11px;margin-top:7px;padding:0 12px;border:1px solid #e4e8f0;border-radius:10px;background:#fafbfe;color:#33405a;font:500 12px/42px Inter,sans-serif;text-align:left;cursor:pointer;box-sizing:border-box}#${RAIL} .quick button span{width:25px;text-align:center;font-size:18px}#${RAIL} .quick .purple{width:25px;height:25px;line-height:23px;border-radius:50%;color:#fff;background:linear-gradient(135deg,#7445ef,#4d67ee);font-size:20px}

      #gf-brand-v5{position:absolute!important;left:-155px!important;top:-9px!important;width:190px!important;height:48px!important;display:flex!important;align-items:center!important;gap:9px!important;pointer-events:none!important;z-index:200!important}
      #gf-brand-v5 img{width:42px!important;height:42px!important;border-radius:12px!important;object-fit:cover!important;box-shadow:0 5px 16px rgba(79,48,210,.18)!important}
      #gf-brand-v5 strong{display:block!important;font:700 18px/21px Inter,sans-serif!important;color:#15213a!important}#gf-brand-v5 small{display:block!important;margin-top:3px!important;font:500 11px/14px Inter,sans-serif!important;color:#66738d!important}
      #gf-profile-v5{position:absolute!important;left:670px!important;top:-1px!important;width:40px!important;height:40px!important;border:0!important;border-radius:50%!important;background:#18212d!important;color:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;margin:0!important;cursor:pointer!important;z-index:220!important}
      #gf-profile-v5 svg{width:16px!important;height:16px!important}

      @media(min-width:768px) and (max-width:1279px){body #${VIEW}{width:calc(100vw - 245px)!important;margin:0!important;padding:24px 28px 48px!important;box-sizing:border-box!important}body #${RAIL}{display:none!important}body #${VIEW}>:not(#${RAIL}){width:100%!important;max-width:none!important;margin-left:0!important}}
      @media(max-width:767px){body #${VIEW}{width:100%!important;margin:0!important;padding:16px 13px 96px!important;box-sizing:border-box!important}body #${RAIL}{display:none!important}body #${VIEW}>:not(#${RAIL}){width:100%!important;max-width:none!important;margin-left:0!important}}
    `;
    document.head.appendChild(s);
  }

  function buildRail(){
    const v=view(); if(!v||document.getElementById(RAIL))return;
    const r=document.createElement('aside');r.id=RAIL;
    r.innerHTML=`
      <section class="gf-card insights"><div class="gf-head"><h3>Application Insights</h3><button class="month">This Month <span>⌄</span></button></div><div class="insight-body"><div class="donut"><strong>5</strong><small>Total</small></div><div class="legend"><div><i class="a"></i><span>Applied</span><b>5</b></div><div><i class="i"></i><span>Interview</span><b>0</b></div><div><i class="o"></i><span>Offer</span><b>0</b></div><div><i class="r"></i><span>Rejected</span><b>0</b></div></div></div><div class="tip"><span>💡</span><p><b>Tip:</b> Add interview dates and notes to track your progress better.</p></div></section>
      <section class="gf-card upcoming"><div class="gf-head"><h3>Upcoming Actions</h3><a class="link" href="#" data-v5-action="calendar">View all</a></div><div class="action"><span class="action-icon">◷</span><div><b>No upcoming interviews</b><small>You're all caught up! 🎉</small></div></div><div class="action"><span class="action-icon check">✓</span><div><b>Follow ups</b><small class="red">1 application needs attention</small></div></div></section>
      <section class="gf-card quick"><div class="gf-head"><h3>Quick Actions</h3></div><div><button data-v5-action="add"><span class="purple">＋</span>Add New Application</button><button data-v5-action="resume"><span>▤</span>Import from Resume</button><button data-v5-action="calendar"><span>▣</span>View Calendar</button><button data-v5-action="export"><span>⇩</span>Export Applications</button></div></section>`;
    v.appendChild(r);
    r.addEventListener('click',function(e){const b=e.target.closest('[data-v5-action]');if(!b)return;e.preventDefault();const t=b.dataset.v5Action;const re=t==='calendar'?/calendar|interview/i:t==='resume'?/import.*resume|resume/i:t==='export'?/export/i:/add.*application|new application/i;const target=[...document.querySelectorAll('button,a,[role="button"]')].find(x=>x!==b&&re.test((x.textContent||'')+' '+(x.getAttribute('aria-label')||'')));if(target)target.click();});
  }

  function buildHeader(){
    const v=view(),h=v&&v.querySelector(':scope > .view-header');if(!h)return;
    if(!document.getElementById('gf-brand-v5')){const b=document.createElement('div');b.id='gf-brand-v5';b.innerHTML='<img src="./icons/icon-192.png" alt="Glueful"><div><strong>Glueful</strong><small>Sunday, Sep 6</small></div>';h.appendChild(b)}
    if(!document.getElementById('gf-profile-v5')){const p=document.createElement('button');p.id='gf-profile-v5';p.type='button';p.setAttribute('aria-label','Profile and settings');p.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="3.2"/><path d="M5.8 19c.9-3.1 3.1-4.7 6.2-4.7s5.3 1.6 6.2 4.7"/></svg>';h.appendChild(p);p.addEventListener('click',function(){const t=[...document.querySelectorAll('button,a,[role="button"]')].find(x=>x!==p&&/profile|settings|account/i.test((x.textContent||'')+' '+(x.getAttribute('aria-label')||'')));if(t)t.click()})}
  }

  function sync(){if(!active())return;installStyle();buildRail();buildHeader();}
  function start(){sync();[100,400,1000,1800].forEach(t=>setTimeout(sync,t));new MutationObserver(function(){if(active())sync()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();