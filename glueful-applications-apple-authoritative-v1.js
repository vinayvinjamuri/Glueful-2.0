/* Glueful — Applications Apple Authoritative V1
 * One presentation layer for the Applications page.
 * Replaces the previous stacked layout/alignment patches while preserving
 * existing application data, controls, navigation, and event handlers.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_APPLE_AUTHORITATIVE_V1__) return;
  window.__GLUEFUL_APPLICATIONS_APPLE_AUTHORITATIVE_V1__=true;

  const STYLE_ID='glueful-applications-apple-authoritative-v1-style';
  const WORKSPACE_ID='glueful-applications-workspace-v1';

  function active(){
    const view=document.getElementById('view-applications');
    return !!view && (view.classList.contains('active') || view.style.display==='block');
  }

  function clickExisting(pattern){
    const candidates=[...document.querySelectorAll('button,a,[role="button"]')];
    const target=candidates.find(el=>pattern.test((el.textContent||'').replace(/\s+/g,' ').trim()));
    if(target) target.click();
  }

  function ensureWorkspace(){
    const view=document.getElementById('view-applications');
    if(!view) return null;
    let aside=document.getElementById(WORKSPACE_ID);
    if(!aside){
      aside=document.createElement('aside');
      aside.id=WORKSPACE_ID;
      aside.setAttribute('aria-label','Application insights and quick actions');
      aside.innerHTML=`
        <section class="gf-app-side-card gf-app-progress-card">
          <div class="gf-app-card-head"><div><h3>Search Progress</h3><p>Weekly goal</p></div><b class="gf-app-goal">5 / 10</b></div>
          <div class="gf-app-progress"><span></span></div>
          <p class="gf-app-progress-copy">Keep building momentum. Every application is another opportunity.</p>
        </section>
        <section class="gf-app-side-card gf-app-insights-card">
          <div class="gf-app-card-head"><div><h3>Application Insights</h3><p>This month</p></div><span class="gf-app-donut"><b>5</b><small>Total</small></span></div>
          <div class="gf-app-legend"><span><i></i>Applied <b>5</b></span><span><i></i>Interview <b>0</b></span><span><i></i>Offer <b>0</b></span><span><i></i>Rejected <b>0</b></span></div>
          <div class="gf-app-tip">💡 <span><b>Tip:</b> Add interview dates and notes to keep your progress organized.</span></div>
        </section>
        <section class="gf-app-side-card gf-app-actions-card">
          <div class="gf-app-card-head"><div><h3>Upcoming Actions</h3><p>Stay on top of your search</p></div><a href="#" data-gf-action="calendar">View all</a></div>
          <div class="gf-app-action-row"><span class="gf-app-action-icon">◷</span><div><b>No upcoming interviews</b><small>You're all caught up! 🎉</small></div></div>
          <div class="gf-app-action-row"><span class="gf-app-action-icon green">✓</span><div><b>Follow-ups</b><small class="attention">1 application needs attention</small></div></div>
        </section>
        <section class="gf-app-side-card gf-app-quick-card">
          <div class="gf-app-card-head"><div><h3>Quick Actions</h3><p>Common tasks</p></div></div>
          <button type="button" data-gf-action="add">＋ <span>Add New Application</span></button>
          <button type="button" data-gf-action="calendar">▣ <span>View Calendar</span></button>
        </section>`;
    }
    if(aside.parentElement!==view) view.appendChild(aside);
    if(!aside.dataset.gfBound){
      aside.dataset.gfBound='1';
      aside.addEventListener('click',e=>{
        const el=e.target.closest('[data-gf-action]');
        if(!el) return;
        e.preventDefault();
        if(el.dataset.gfAction==='add') clickExisting(/add\s+(new\s+)?application/i);
        if(el.dataset.gfAction==='calendar') clickExisting(/calendar/i);
      });
    }
    return aside;
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      :root{--gf-app-bg:#f8f9fc;--gf-app-surface:#fff;--gf-app-text:#141826;--gf-app-muted:#737b8c;--gf-app-line:#e7e9f0;--gf-app-purple:#6557e8;--gf-app-blue:#4b7cf3;--gf-app-shadow:0 10px 28px rgba(22,27,45,.045)}
      body.glueful-applications-apple{background:var(--gf-app-bg)!important;color:var(--gf-app-text)!important;color-scheme:light!important;font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif!important;-webkit-font-smoothing:antialiased!important;}
      body.glueful-applications-apple #view-applications{box-sizing:border-box!important;color:var(--gf-app-text)!important;background:transparent!important;}
      body.glueful-applications-apple #view-applications .view-header{box-sizing:border-box!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;}
      body.glueful-applications-apple #view-applications .view-title{margin:0 0 7px!important;color:var(--gf-app-text)!important;font-size:36px!important;line-height:1.08!important;font-weight:750!important;letter-spacing:-1.25px!important;}
      body.glueful-applications-apple #view-applications .view-subtitle{margin:0!important;color:var(--gf-app-muted)!important;font-size:16px!important;line-height:1.45!important;}
      body.glueful-applications-apple #view-applications input,
      body.glueful-applications-apple #view-applications select,
      body.glueful-applications-apple #view-applications textarea{box-sizing:border-box!important;min-height:42px!important;background:#fff!important;color:var(--gf-app-text)!important;border:1px solid var(--gf-app-line)!important;border-radius:12px!important;box-shadow:none!important;}
      body.glueful-applications-apple #view-applications input:focus,
      body.glueful-applications-apple #view-applications select:focus,
      body.glueful-applications-apple #view-applications textarea:focus{outline:none!important;border-color:#b9b3f7!important;box-shadow:0 0 0 3px rgba(101,87,232,.10)!important;}
      body.glueful-applications-apple #view-applications button,
      body.glueful-applications-apple #view-applications .button,
      body.glueful-applications-apple #view-applications [role="button"]{border-radius:12px!important;}
      body.glueful-applications-apple #view-applications .application-card,
      body.glueful-applications-apple #view-applications .job-application-card,
      body.glueful-applications-apple #view-applications [class*="application-card"],
      body.glueful-applications-apple #view-applications .card{box-sizing:border-box!important;background:#fff!important;color:var(--gf-app-text)!important;border:1px solid var(--gf-app-line)!important;border-radius:16px!important;box-shadow:var(--gf-app-shadow)!important;}
      body.glueful-applications-apple #view-applications .application-card,
      body.glueful-applications-apple #view-applications .job-application-card,
      body.glueful-applications-apple #view-applications [class*="application-card"]{min-height:94px!important;padding:16px 18px!important;}
      body.glueful-applications-apple #view-applications .application-card img,
      body.glueful-applications-apple #view-applications .job-application-card img{border-radius:14px!important;}
      body.glueful-applications-apple #glueful-dashboard-hamburger{display:none!important;}

      #glueful-applications-workspace-v1{box-sizing:border-box;min-width:0;display:flex;flex-direction:column;gap:16px;align-self:start;}
      .gf-app-side-card{box-sizing:border-box;background:#fff;border:1px solid var(--gf-app-line);border-radius:18px;padding:18px;box-shadow:var(--gf-app-shadow);}
      .gf-app-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:15px}.gf-app-card-head h3{margin:0;color:var(--gf-app-text);font-size:16px;line-height:1.2;letter-spacing:-.25px}.gf-app-card-head p{margin:4px 0 0;color:var(--gf-app-muted);font-size:12px;line-height:1.35}.gf-app-card-head a{color:var(--gf-app-purple);font-size:12px;font-weight:650;text-decoration:none}.gf-app-goal{color:var(--gf-app-text);font-size:12px}.gf-app-progress{height:8px;border-radius:999px;background:#eef0f6;overflow:hidden}.gf-app-progress span{display:block;width:50%;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--gf-app-purple),var(--gf-app-blue))}.gf-app-progress-copy{margin:11px 0 0;color:var(--gf-app-muted);font-size:12px;line-height:1.48}.gf-app-donut{position:relative;width:86px;height:86px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:conic-gradient(var(--gf-app-purple) 0 72%,#eeeafd 72% 100%);flex:0 0 auto}.gf-app-donut:after{content:"";position:absolute;inset:10px;border-radius:50%;background:#fff}.gf-app-donut b,.gf-app-donut small{position:relative;z-index:1}.gf-app-donut b{font-size:21px;color:var(--gf-app-text)}.gf-app-donut small{font-size:10px;color:var(--gf-app-muted)}.gf-app-legend{display:grid;grid-template-columns:1fr 1fr;gap:9px 12px}.gf-app-legend span{display:flex;align-items:center;gap:7px;color:var(--gf-app-muted);font-size:11px}.gf-app-legend i{width:7px;height:7px;border-radius:50%;background:#f2b632}.gf-app-legend span:nth-child(2) i{background:#4b7cf3}.gf-app-legend span:nth-child(3) i{background:#20bb78}.gf-app-legend span:nth-child(4) i{background:#ef5a63}.gf-app-legend b{margin-left:auto;color:var(--gf-app-text)}.gf-app-tip{display:flex;gap:8px;margin-top:15px;padding:11px 12px;border-radius:12px;background:#f7f5ff;color:var(--gf-app-purple);font-size:12px;line-height:1.42}.gf-app-tip span{color:#646b7a}.gf-app-tip b{color:var(--gf-app-purple)}.gf-app-action-row{display:flex;align-items:center;gap:11px;padding:10px 0;border-top:1px solid #f0f1f5}.gf-app-action-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#f4f5f8;color:#687187;flex:0 0 auto}.gf-app-action-icon.green{background:#eaf9f1;color:#14a66b}.gf-app-action-row b{display:block;color:var(--gf-app-text);font-size:12px}.gf-app-action-row small{display:block;margin-top:3px;color:var(--gf-app-muted);font-size:11px}.gf-app-action-row small.attention{color:#ef5a63}.gf-app-quick-card button{display:flex!important;align-items:center;gap:9px;width:100%;height:41px;margin-top:8px;padding:0 12px!important;background:#fafbfe!important;color:#313747!important;border:1px solid var(--gf-app-line)!important;border-radius:11px!important;text-align:left;font-size:12px;cursor:pointer}.gf-app-quick-card button:hover{background:#f5f3ff!important;border-color:#ddd8fb!important;color:var(--gf-app-purple)!important}

      @media(min-width:1280px){
        body.glueful-applications-apple #view-applications{position:relative!important;left:auto!important;right:auto!important;top:auto!important;transform:none!important;width:calc(100vw - 260px)!important;max-width:none!important;min-height:100vh!important;margin:0 0 0 260px!important;padding:26px 32px 52px!important;display:grid!important;grid-template-columns:minmax(0,1fr) 350px!important;grid-template-rows:auto auto!important;column-gap:28px!important;row-gap:24px!important;align-items:start!important;overflow:visible!important;}
        body.glueful-applications-apple #view-applications>.view-header{grid-column:1/-1!important;grid-row:1!important;min-height:72px!important;display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:22px!important;}
        body.glueful-applications-apple #view-applications>#glueful-applications-workspace-v1{grid-column:2!important;grid-row:2!important;position:sticky!important;top:24px!important;width:350px!important;max-width:350px!important;margin:0!important;}
        body.glueful-applications-apple #view-applications>:not(.view-header):not(#glueful-applications-workspace-v1){grid-column:1!important;min-width:0!important;max-width:none!important;width:100%!important;margin-left:0!important;margin-right:0!important;transform:none!important;}
        body.glueful-applications-apple #view-applications .view-header>button,
        body.glueful-applications-apple #view-applications .view-header>a{position:static!important;inset:auto!important;transform:none!important;margin:0!important;flex:0 0 auto!important;}
      }
      @media(min-width:768px) and (max-width:1279px){
        body.glueful-applications-apple #view-applications{position:relative!important;left:auto!important;transform:none!important;width:calc(100vw - 260px)!important;max-width:none!important;margin:0 0 0 260px!important;padding:26px 26px 48px!important;display:block!important;overflow:visible!important;}
        body.glueful-applications-apple #view-applications>.view-header{min-height:72px!important;margin-bottom:22px!important;display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:18px!important;}
        body.glueful-applications-apple #view-applications>#glueful-applications-workspace-v1{position:static!important;width:100%!important;max-width:none!important;margin:22px 0 0!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important;}
        body.glueful-applications-apple #view-applications>:not(.view-header):not(#glueful-applications-workspace-v1){width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important;transform:none!important;}
      }
      @media(max-width:767px){
        body.glueful-applications-apple #view-applications{position:relative!important;left:auto!important;transform:none!important;width:100%!important;max-width:none!important;margin:0!important;padding:18px 13px 96px!important;display:block!important;overflow:visible!important;}
        body.glueful-applications-apple #view-applications>.view-header{display:block!important;min-height:0!important;margin-bottom:18px!important;}
        body.glueful-applications-apple #view-applications .view-title{font-size:28px!important;letter-spacing:-.8px!important;}
        body.glueful-applications-apple #view-applications .view-subtitle{font-size:13px!important;}
        body.glueful-applications-apple #view-applications>#glueful-applications-workspace-v1{display:none!important;}
        body.glueful-applications-apple #glueful-dashboard-hamburger{display:flex!important;}
        body.glueful-applications-apple #view-applications>:not(.view-header):not(#glueful-applications-workspace-v1){width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important;transform:none!important;}
      }
      @media(prefers-reduced-motion:reduce){body.glueful-applications-apple #view-applications *{scroll-behavior:auto!important;transition:none!important}}
    `;
    document.head.appendChild(s);
  }

  function sync(){
    installStyle();
    const on=active();
    document.body.classList.toggle('glueful-applications-apple',on);
    if(on) ensureWorkspace();
  }

  function start(){
    installStyle();
    sync();
    const obs=new MutationObserver(()=>sync());
    obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
    document.addEventListener('click',()=>setTimeout(sync,60),true);
    window.addEventListener('resize',sync,{passive:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
