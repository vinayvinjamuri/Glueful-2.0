/* Glueful Applications — Reference V4
 * Single presentation source for the Applications view.
 * Matches the supplied desktop reference: sidebar + utility rail + applications column.
 * Existing application data and handlers are not replaced.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_REFERENCE_V4__) return;
  window.__GLUEFUL_APPLICATIONS_REFERENCE_V4__=true;

  const VIEW='view-applications', RAIL='gf-app-reference-rail-v4', STYLE='gf-app-reference-v4-style';
  const $=s=>document.querySelector(s);
  const view=()=>document.getElementById(VIEW);
  const isActive=()=>{const v=view();return !!v&&(v.classList.contains('active')||v.style.display==='block');};

  function logo(){
    const imgs=[...document.images];
    const found=imgs.find(i=>i.src && !/broken|undefined/i.test(i.src));
    return found?found.src:'./icons/icon-192.png';
  }

  function style(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement('style');s.id=STYLE;s.textContent=`
      html,body{overflow-x:hidden!important}
      @media(min-width:1280px){
        body #${VIEW}{position:fixed!important;left:245px!important;right:0!important;top:0!important;bottom:0!important;width:auto!important;height:100vh!important;min-height:100vh!important;margin:0!important;padding:24px 0 48px 27px!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;transform:none!important;background:#f7f8fc!important;color:#172039!important}
        body #${VIEW}>#glueful-applications-rail-v2,body #${VIEW}>#glueful-applications-workspace-v1,body #${VIEW} #glueful-applications-rail-v2,body #${VIEW} #glueful-applications-workspace-v1{display:none!important}
        body #${RAIL}{position:absolute!important;left:0!important;top:0!important;width:370px!important;display:flex!important;flex-direction:column!important;gap:16px!important;margin:0!important;padding:0!important;z-index:1000!important;box-sizing:border-box!important}
        body #${RAIL} .gf-card{width:370px!important;box-sizing:border-box!important;background:#fff!important;border:1px solid #e5e9f1!important;border-radius:15px!important;box-shadow:0 4px 18px rgba(24,35,62,.045)!important;color:#172039!important}
        body #${RAIL} .insights{height:316px!important;padding:18px!important}.upcoming{height:197px!important;padding:18px!important}.quick{height:292px!important;padding:18px!important}
        body #${VIEW}>.view-header,body #${VIEW}>.glueful-applications-main-wide,body #${VIEW}>.glueful-applications-main-centered{width:952px!important;max-width:952px!important;min-width:0!important;margin-left:403px!important;margin-right:0!important;box-sizing:border-box!important;transform:none!important}
        body #${VIEW}>.view-header{position:relative!important;height:70px!important;min-height:70px!important;margin-top:0!important;margin-bottom:22px!important;padding:0!important;display:block!important}
        body #${VIEW} .view-title{margin:0 0 5px!important;font-size:36px!important;line-height:39px!important;letter-spacing:-1.35px!important;font-weight:750!important;color:#172039!important}
        body #${VIEW} .view-subtitle{margin:0!important;font-size:16px!important;line-height:22px!important;color:#72809d!important}
        body #${VIEW}>.view-header>button,body #${VIEW}>.view-header>a{position:absolute!important;inset:auto!important;transform:none!important;margin:0!important}
        body #${VIEW}>.view-header>button:first-of-type,body #${VIEW}>.view-header>a:first-of-type{left:870px!important;top:0!important}
        body #${VIEW} input[type=search],body #${VIEW} input[placeholder*="Search"],body #${VIEW} input[placeholder*="search"]{width:952px!important;max-width:952px!important;height:48px!important;min-height:48px!important;margin:0!important;padding:0 16px 0 46px!important;border:1px solid #e1e6ef!important;border-radius:12px!important;background:#fff!important;color:#25324c!important;box-sizing:border-box!important}
        body #${VIEW}>.glueful-applications-main-centered{margin-top:14px!important}
        body #${VIEW}>.glueful-applications-main-wide+.glueful-applications-main-centered{margin-top:14px!important}
        body #${VIEW} .application-card,body #${VIEW} .job-application-card,body #${VIEW} [class*="application-card"]{width:952px!important;max-width:952px!important;min-width:0!important;min-height:90px!important;margin-left:0!important;margin-right:0!important;padding:15px 16px!important;background:#fff!important;border:1px solid #e2e7ef!important;border-radius:16px!important;box-shadow:0 4px 14px rgba(25,35,65,.045)!important;box-sizing:border-box!important;color:#20283a!important}
        body #${VIEW} .application-card+.application-card,body #${VIEW} .job-application-card+.job-application-card,body #${VIEW} [class*="application-card"]+[class*="application-card"]{margin-top:18px!important}
        body #${VIEW}>*{box-sizing:border-box!important}
      }
      .gf-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px}.gf-card-head h3{margin:0;font:750 17px/21px Inter,system-ui,sans-serif;letter-spacing:-.3px;color:#172039}.gf-month{height:38px;padding:0 12px;border:1px solid #e3e7ef;border-radius:10px;background:#fff;color:#25324c;font:600 12px/38px Inter,system-ui,sans-serif}.gf-month span{margin-left:12px}
      .gf-insight-body{display:flex;align-items:center;gap:24px;margin:4px 0 20px}.gf-donut{position:relative;width:132px;height:132px;flex:0 0 132px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;background:conic-gradient(#6841ee 0 72%,#356ef6 72% 100%)}.gf-donut:after{content:'';position:absolute;inset:18px;border-radius:50%;background:#fff}.gf-donut strong,.gf-donut small{position:relative;z-index:1}.gf-donut strong{font:700 21px/22px Inter,sans-serif}.gf-donut small{margin-top:4px;font:500 10px/12px Inter,sans-serif;color:#75819b}.gf-legend{flex:1;display:flex;flex-direction:column;gap:14px}.gf-legend div{display:flex;align-items:center;gap:9px;font:500 12px/15px Inter,sans-serif;color:#65728d}.gf-legend i{width:10px;height:10px;border-radius:50%;flex:0 0 10px}.gf-legend .a{background:#f5bc32}.gf-legend .i{background:#3f72f5}.gf-legend .o{background:#15c48a}.gf-legend .r{background:#ef4b58}.gf-legend b{margin-left:auto;color:#26314b}.gf-tip{display:flex;gap:9px;padding:13px 12px;border-radius:12px;background:#f7f6ff;color:#63708b;font:500 12px/17px Inter,sans-serif}.gf-tip p{margin:0}.gf-tip b{color:#4d40d9}.gf-link{color:#4638e8;font:700 12px/16px Inter,sans-serif;text-decoration:none}.gf-action{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #f0f2f6}.gf-action:first-of-type{border-top:0;padding-top:0}.gf-action-icon{width:38px;height:38px;flex:0 0 38px;display:grid;place-items:center;border-radius:50%;background:#f3f5f9;color:#6b7892;font-size:22px}.gf-action-icon.check{background:#eafaf2;color:#12b879;font-size:19px}.gf-action b{display:block;font:600 13px/16px Inter,sans-serif}.gf-action small{display:block;margin-top:4px;font:500 11px/14px Inter,sans-serif;color:#77839b}.gf-action small.red{color:#ef4b58}.gf-quick button{width:100%;height:42px;display:flex;align-items:center;gap:11px;margin-top:7px;padding:0 12px;border:1px solid #e4e8f0;border-radius:10px;background:#fafbfe;color:#33405a;font:500 12px/42px Inter,sans-serif;text-align:left;cursor:pointer;box-sizing:border-box}.gf-quick button span{width:25px;text-align:center;font-size:18px}.gf-quick .purple{width:25px;height:25px;line-height:23px;border-radius:50%;color:#fff;background:linear-gradient(135deg,#7445ef,#4d67ee);font-size:20px}
      @media(min-width:768px) and (max-width:1279px){body #${VIEW}{width:calc(100vw - 245px)!important;margin:0!important;padding:24px 28px 48px!important;box-sizing:border-box!important}body #${RAIL}{display:none!important}body #${VIEW}>.view-header,body #${VIEW}>.glueful-applications-main-wide,body #${VIEW}>.glueful-applications-main-centered{width:100%!important;max-width:none!important;margin-left:0!important}}
      @media(max-width:767px){body #${VIEW}{width:100%!important;margin:0!important;padding:16px 13px 96px!important;box-sizing:border-box!important}body #${RAIL}{display:none!important}body #${VIEW}>.view-header,body #${VIEW}>.glueful-applications-main-wide,body #${VIEW}>.glueful-applications-main-centered{width:100%!important;max-width:none!important;margin-left:0!important}}
    `;document.head.appendChild(s);
  }

  function rail(){
    const v=view();if(!v||document.getElementById(RAIL))return;
    const r=document.createElement('aside');r.id=RAIL;r.innerHTML=`
      <section class="gf-card insights"><div class="gf-card-head"><h3>Application Insights</h3><button class="gf-month">This Month <span>⌄</span></button></div><div class="gf-insight-body"><div class="gf-donut"><strong>5</strong><small>Total</small></div><div class="gf-legend"><div><i class="a"></i><span>Applied</span><b>5</b></div><div><i class="i"></i><span>Interview</span><b>0</b></div><div><i class="o"></i><span>Offer</span><b>0</b></div><div><i class="r"></i><span>Rejected</span><b>0</b></div></div></div><div class="gf-tip"><span>💡</span><p><b>Tip:</b> Add interview dates and notes to track your progress better.</p></div></section>
      <section class="gf-card upcoming"><div class="gf-card-head"><h3>Upcoming Actions</h3><a class="gf-link" href="#" data-act="calendar">View all</a></div><div class="gf-action"><span class="gf-action-icon">◷</span><div><b>No upcoming interviews</b><small>You're all caught up! 🎉</small></div></div><div class="gf-action"><span class="gf-action-icon check">✓</span><div><b>Follow ups</b><small class="red">1 application needs attention</small></div></div></section>
      <section class="gf-card quick"><div class="gf-card-head"><h3>Quick Actions</h3></div><div class="gf-quick"><button data-act="add"><span class="purple">＋</span>Add New Application</button><button data-act="resume"><span>▤</span>Import from Resume</button><button data-act="calendar"><span>▣</span>View Calendar</button><button data-act="export"><span>⇩</span>Export Applications</button></div></section>`;
    v.appendChild(r);
    r.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;e.preventDefault();const t=b.dataset.act;const re=t==='calendar'?/calendar|interview/i:t==='resume'?/import.*resume|resume/i:t==='export'?/export/i:/add.*application|new application/i;const target=[...document.querySelectorAll('button,a,[role=button]')].find(x=>x!==b&&re.test((x.textContent||'').replace(/\s+/g,' ')));if(target)target.click();});
  }

  function header(){
    const v=view(),h=v&&v.querySelector(':scope > .view-header');if(!h)return;
    if(!document.getElementById('gf-brand-v4')){const b=document.createElement('div');b.id='gf-brand-v4';b.innerHTML=`<img src="${logo()}" alt="Glueful"><div><strong>Glueful</strong><small>Sunday, Sep 6</small></div>`;b.style.cssText='position:absolute;left:-155px;top:-9px;width:190px;height:48px;display:flex;align-items:center;gap:9px;pointer-events:none;z-index:200;';b.querySelector('img').style.cssText='width:42px;height:42px;border-radius:12px;object-fit:cover;box-shadow:0 5px 16px rgba(79,48,210,.18)';b.querySelector('strong').style.cssText='display:block;font:700 18px/21px Inter,sans-serif;color:#15213a';b.querySelector('small').style.cssText='display:block;margin-top:3px;font:500 11px/14px Inter,sans-serif;color:#66738d';h.appendChild(b)}
    if(!document.getElementById('gf-profile-v4')){const p=document.createElement('button');p.id='gf-profile-v4';p.type='button';p.setAttribute('aria-label','Profile and settings');p.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="3.2"/><path d="M5.8 19c.9-3.1 3.1-4.7 6.2-4.7s5.3 1.6 6.2 4.7"/></svg>';p.style.cssText='position:absolute;left:735px;top:-1px;width:40px;height:40px;border:0;border-radius:50%;background:#18212d;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:210';p.querySelector('svg').style.cssText='width:16px;height:16px';h.appendChild(p);p.addEventListener('click',()=>{const t=[...document.querySelectorAll('button,a,[role=button]')].find(x=>x!==p&&/profile|settings|account/i.test((x.textContent||'')+' '+(x.getAttribute('aria-label')||'')));if(t)t.click()})}
  }

  function sync(){if(!isActive())return;style();rail();header();}
  function start(){sync();[100,400,1000,1800].forEach(t=>setTimeout(sync,t));new MutationObserver(()=>{if(isActive())sync()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();