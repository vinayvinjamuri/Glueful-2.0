/* Glueful — Applications Reference UI V7
 * Presentation-only layer for the Applications page.
 * Adds useful workspace panels without changing application data or handlers.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_REFERENCE_V7__) return;
  window.__GLUEFUL_APPLICATIONS_REFERENCE_V7__=true;
  const STYLE_ID='glueful-applications-reference-v7-style';

  function addWorkspace(){
    if(document.getElementById('glueful-applications-workspace-v1')) return;
    const view=document.getElementById('view-applications');
    if(!view) return;

    const left=document.createElement('aside');
    left.id='glueful-applications-left-v1';
    left.innerHTML=`
      <section class="gf-left-card">
        <div class="gf-left-title">Search Progress</div>
        <div class="gf-goal"><span>Weekly goal</span><b>5 / 10</b></div>
        <div class="gf-progress"><span></span></div>
        <p>Keep building momentum. Every application is another opportunity.</p>
      </section>
      <section class="gf-left-card gf-focus-card">
        <div class="gf-left-title">Focus today</div>
        <div class="gf-focus-row"><span>1</span><div><b>Follow up</b><small>Anthropic</small></div></div>
        <div class="gf-focus-row"><span>0</span><div><b>Interviews</b><small>Nothing scheduled</small></div></div>
      </section>`;
    view.parentNode.insertBefore(left,view);

    const aside=document.createElement('aside');
    aside.id='glueful-applications-workspace-v1';
    aside.innerHTML=`
      <section class="gf-insight-card">
        <div class="gf-card-head"><div><h3>Application Insights</h3><p>This month</p></div><span class="gf-donut"><b>5</b><small>Total</small></span></div>
        <div class="gf-legend"><span><i></i>Applied <b>5</b></span><span><i></i>Interview <b>0</b></span><span><i></i>Offer <b>0</b></span><span><i></i>Rejected <b>0</b></span></div>
        <div class="gf-tip">💡 <span><b>Tip:</b> Add interview dates and notes to keep your progress organized.</span></div>
      </section>
      <section class="gf-insight-card gf-actions-card">
        <div class="gf-card-head"><div><h3>Upcoming Actions</h3><p>Stay on top of your search</p></div><a href="#">View all</a></div>
        <div class="gf-action-row"><span class="gf-action-icon">◷</span><div><b>No upcoming interviews</b><small>You're all caught up! 🎉</small></div></div>
        <div class="gf-action-row"><span class="gf-action-icon green">✓</span><div><b>Follow-ups</b><small class="attention">1 application needs attention</small></div></div>
      </section>
      <section class="gf-insight-card gf-quick-card">
        <div class="gf-card-head"><div><h3>Quick Actions</h3><p>Common tasks</p></div></div>
        <button type="button" data-gf-action="add">＋ Add New Application</button>
        <button type="button" data-gf-action="calendar">▣ View Calendar</button>
        <button type="button" data-gf-action="export">⇩ Export Applications</button>
      </section>`;
    view.parentNode.insertBefore(aside,view.nextSibling);

    aside.querySelector('[data-gf-action="add"]')?.addEventListener('click',()=>{
      const target=[...document.querySelectorAll('button,a')].find(b=>/add application/i.test((b.textContent||'').trim()));
      if(target) target.click();
    });
    aside.querySelector('[data-gf-action="calendar"]')?.addEventListener('click',()=>{
      const target=[...document.querySelectorAll('button,a')].find(b=>/calendar/i.test((b.textContent||'').trim()));
      if(target) target.click();
    });
    aside.querySelector('[data-gf-action="export"]')?.addEventListener('click',()=>{
      const target=[...document.querySelectorAll('button,a')].find(b=>/export/i.test((b.textContent||'').trim()));
      if(target) target.click();
    });
  }

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style'); s.id=STYLE_ID;
    s.textContent=`
      html,body{background:#f5f5f7!important;color:#1d1d1f!important;}body{color-scheme:light!important;}
      @media(min-width:1101px){
        body #view-applications{position:relative!important;left:-430px!important;width:960px!important;max-width:960px!important;margin-left:405px!important;margin-right:0!important;padding:32px 0 48px!important;box-sizing:border-box!important;overflow:visible!important;height:auto!important;}
        body #view-applications .view-header{position:relative!important;display:flex!important;align-items:flex-start!important;justify-content:space-between!important;width:100%!important;min-height:82px!important;margin:0 0 28px!important;padding:0!important;}
        body #view-applications .view-title{margin:0 0 6px!important;font-size:36px!important;line-height:1.08!important;letter-spacing:-1.2px!important;color:#1d1d1f!important;}
        body #view-applications .view-subtitle{margin:0!important;font-size:16px!important;color:#6e6e73!important;}
        body #view-applications input,body #view-applications select,body #view-applications textarea{min-height:44px!important;border:1px solid #e5e5ea!important;border-radius:12px!important;background:#fff!important;color:#1d1d1f!important;box-sizing:border-box!important;}
        body #view-applications .application-card,body #view-applications .job-application-card,body #view-applications .card{background:#fff!important;color:#1d1d1f!important;border:1px solid #e5e5ea!important;border-radius:16px!important;box-shadow:0 8px 24px rgba(0,0,0,.035)!important;}
        body #view-applications .view-header > button,body #view-applications .view-header > a{position:fixed!important;top:23px!important;right:290px!important;z-index:1000!important;margin:0!important;}
        body #glueful-applications-left-v1{position:fixed!important;top:208px!important;left:28px!important;width:300px!important;display:flex!important;flex-direction:column!important;gap:16px!important;z-index:20!important;}
        .gf-left-card{background:#fff;border:1px solid #e5e5ea;border-radius:18px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.045);box-sizing:border-box;}.gf-left-title{font-size:17px;font-weight:600;color:#1d1d1f;margin-bottom:16px;}.gf-goal{display:flex;justify-content:space-between;font-size:12px;color:#6e6e73;margin-bottom:9px;}.gf-goal b{color:#1d1d1f;}.gf-progress{height:8px;border-radius:99px;background:#eeeef4;overflow:hidden;}.gf-progress span{display:block;width:50%;height:100%;border-radius:99px;background:linear-gradient(90deg,#6d3df5,#3578ff);}.gf-left-card p{margin:12px 0 0;font-size:12px;line-height:1.5;color:#86868b;}.gf-focus-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #f0f0f2;}.gf-focus-row>span{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:#f3f1ff;color:#5d43dd;font-size:12px;font-weight:700;}.gf-focus-row b{display:block;font-size:12px;color:#1d1d1f;}.gf-focus-row small{display:block;margin-top:3px;font-size:11px;color:#86868b;}
        body #glueful-applications-workspace-v1{position:fixed!important;top:208px!important;right:28px!important;width:300px!important;display:flex!important;flex-direction:column!important;gap:16px!important;z-index:20!important;}
        .gf-insight-card{background:#fff;border:1px solid #e5e5ea;border-radius:18px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.045);box-sizing:border-box;}.gf-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px;}.gf-card-head h3{margin:0;font-size:17px;letter-spacing:-.25px;color:#1d1d1f;}.gf-card-head p{margin:4px 0 0;font-size:12px;color:#86868b;}.gf-card-head a{font-size:12px;color:#5146e5;text-decoration:none;font-weight:600;}.gf-donut{width:92px;height:92px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:conic-gradient(#6d3df5 0 72%,#e8e3ff 72% 100%);position:relative;flex:0 0 auto;}.gf-donut:after{content:"";position:absolute;inset:11px;background:#fff;border-radius:50%;}.gf-donut b,.gf-donut small{position:relative;z-index:1;}.gf-donut b{font-size:22px;color:#1d1d1f;}.gf-donut small{font-size:10px;color:#6e6e73;}.gf-legend{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px;margin-top:-2px;}.gf-legend span{font-size:11px;color:#6e6e73;display:flex;align-items:center;gap:7px;}.gf-legend i{width:7px;height:7px;border-radius:50%;background:#f2b632;display:inline-block;}.gf-legend span:nth-child(2) i{background:#4d73f8;}.gf-legend span:nth-child(3) i{background:#19c37d;}.gf-legend span:nth-child(4) i{background:#ef4444;}.gf-legend b{margin-left:auto;color:#1d1d1f;}.gf-tip{display:flex;gap:8px;margin-top:16px;padding:11px 12px;border-radius:12px;background:#f7f5ff;color:#5146e5;font-size:12px;line-height:1.4;}.gf-tip span{color:#5f6470;}.gf-tip b{color:#5146e5;}.gf-action-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #f0f0f2;}.gf-action-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#f4f5f8;color:#65708a;font-size:17px;flex:0 0 auto;}.gf-action-icon.green{background:#eafaf2;color:#12a76a;}.gf-action-row b{display:block;font-size:12px;color:#1d1d1f;}.gf-action-row small{display:block;margin-top:3px;font-size:11px;color:#86868b;}.gf-action-row small.attention{color:#ef4444;}.gf-quick-card button{width:100%;height:40px;margin-top:8px;border:1px solid #e5e5ea;border-radius:11px;background:#fafafd;color:#30343b;text-align:left;padding:0 12px;font-size:12px;cursor:pointer;}.gf-quick-card button:hover{background:#f3f1ff;border-color:#d9d2ff;color:#5146e5;}
      }
      @media(min-width:701px) and (max-width:1100px){body #glueful-applications-left-v1,body #glueful-applications-workspace-v1{display:none!important;}body #view-applications{width:calc(100% - 254px)!important;margin-left:230px!important;margin-right:24px!important;padding:28px 0 40px!important;box-sizing:border-box!important;left:0!important;}}
      @media(max-width:700px){body #glueful-applications-left-v1,body #glueful-applications-workspace-v1{display:none!important;}body #view-applications{width:100%!important;margin:0!important;padding:16px 12px 96px!important;box-sizing:border-box!important;left:0!important;}}
    `; document.head.appendChild(s); addWorkspace();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
