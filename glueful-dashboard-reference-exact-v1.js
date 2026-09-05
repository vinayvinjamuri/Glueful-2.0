/* Glueful — Dashboard Reference Exact V1
 * Makes the Dashboard visually match the supplied Applications reference.
 * Navigation/profile/app data handlers remain outside this presentation layer.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_EXACT_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_EXACT_V1__=true;

  const ROOT_ID='glueful-dashboard-reference-exact-v1';
  const STYLE_ID='glueful-dashboard-reference-exact-v1-style';

  function active(){
    const v=document.getElementById('view-dashboard');
    return !!v && (v.classList.contains('active') || v.style.display==='block');
  }

  function clickExisting(re){
    const els=[...document.querySelectorAll('button,a,[role="button"]')];
    const el=els.find(x=>re.test((x.textContent||'').replace(/\s+/g,' ').trim()));
    if(el) el.click();
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      body.glueful-dashboard-reference-exact{background:#f8f9fc!important;color:#141826!important;color-scheme:light!important;font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif!important;-webkit-font-smoothing:antialiased!important}
      body.glueful-dashboard-reference-exact #view-dashboard{box-sizing:border-box!important;position:relative!important;left:auto!important;top:auto!important;right:auto!important;transform:none!important;width:calc(100vw - 260px)!important;max-width:none!important;min-height:100vh!important;margin:0 0 0 260px!important;padding:26px 32px 52px!important;background:#f8f9fc!important;overflow:visible!important}
      body.glueful-dashboard-reference-exact #view-dashboard>*:not(#${ROOT_ID}){display:none!important}
      body.glueful-dashboard-reference-exact #${ROOT_ID}{display:grid;grid-template-columns:minmax(0,1fr) 350px;grid-template-rows:auto auto;column-gap:28px;row-gap:24px;align-items:start;width:100%;box-sizing:border-box}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-ref-header{grid-column:1/-1;display:flex;align-items:flex-start;justify-content:space-between;gap:20px;min-height:72px}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-ref-title{margin:0;color:#141826;font-size:36px;line-height:1.08;font-weight:750;letter-spacing:-1.25px}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-ref-subtitle{margin:7px 0 0;color:#737b8c;font-size:16px;line-height:1.45}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-ref-add{height:44px;padding:0 22px;border:0;border-radius:12px;background:linear-gradient(135deg,#6747ed,#315ff2);color:#fff;font-size:14px;font-weight:700;box-shadow:0 8px 20px rgba(82,74,220,.18);cursor:pointer;white-space:nowrap}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-ref-main{grid-column:1;min-width:0}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-ref-side{grid-column:2;grid-row:2;display:flex;flex-direction:column;gap:16px;position:sticky;top:24px;min-width:0}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-stat-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-bottom:24px}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-stat{height:82px;display:flex;align-items:center;gap:12px;padding:0 16px;background:#fff;border:1px solid #e7e9f0;border-radius:14px;box-sizing:border-box;box-shadow:0 8px 22px rgba(22,27,45,.035)}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-stat-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:50%;font-size:21px;flex:0 0 auto}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-stat-icon.doc{background:#f1f4fa;color:#52617c}.gf-stat-icon.send{background:#e9fff7;color:#19b77a}.gf-stat-icon.cal{background:#eef4ff;color:#2469ee}.gf-stat-icon.trophy{background:#e9fff3;color:#12ad68}.gf-stat-icon.bad{background:#fff0f1;color:#ef3f4b}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-stat strong{display:block;font-size:17px;line-height:1.1;color:#141826}.gf-stat span{display:block;margin-top:5px;font-size:12px;color:#737b8c}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-filters{display:flex;align-items:center;gap:8px;margin-bottom:18px;flex-wrap:wrap}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-filter{height:42px;padding:0 17px;border:1px solid #e2e5ed;border-radius:12px;background:#fff;color:#566078;font-size:12px;font-weight:600;cursor:pointer}.gf-filter.active{background:linear-gradient(135deg,#6a55ed,#4e76ef);border-color:transparent;color:#fff;box-shadow:0 6px 14px rgba(82,74,220,.16)}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-filter-spacer{flex:1}.gf-filter-tool{height:42px;padding:0 15px;border:1px solid #e2e5ed;border-radius:12px;background:#fff;color:#273149;font-size:12px;font-weight:600;cursor:pointer}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-list{display:flex;flex-direction:column;gap:12px}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-app{min-height:96px;display:grid;grid-template-columns:70px minmax(0,1fr) 92px 1px 1.25fr 150px;align-items:center;gap:16px;padding:14px 18px;background:#fff;border:1px solid #e7e9f0;border-radius:16px;box-sizing:border-box;box-shadow:0 8px 22px rgba(22,27,45,.035)}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-logo{width:66px;height:66px;border-radius:14px;border:1px solid #dce0e9;background:#f8f9fb;display:grid;place-items:center;overflow:hidden;font-weight:800;font-size:22px;color:#1d293f}.gf-logo.acl{font-size:12px;color:#1682c7}.gf-logo.frame{background:#1474d5;color:#fff;font-size:31px}.gf-logo.qid{font-size:9px;color:#23a9bd}.gf-logo.ai{font-size:31px;color:#111;background:#f3f3f1}.gf-logo.skill{font-size:29px;color:#f45113}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-company{min-width:0}.gf-company b{display:block;color:#15203a;font-size:15px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gf-company .role{display:block;margin-top:3px;color:#5f6d89;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gf-company .date{display:block;margin-top:6px;color:#65718a;font-size:12px}.gf-company .date:before{content:'▣ ';font-size:11px}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-status{justify-self:center;padding:5px 11px;border-radius:999px;background:#fff1c9;color:#a76a00;font-size:11px;font-weight:700}.gf-divider{width:1px;height:54px;background:#edf0f4}.gf-next{min-width:0}.gf-next .label{display:block;color:#66718a;font-size:11px}.gf-next strong{display:block;margin-top:5px;color:#233251;font-size:13px}.gf-next small{display:block;margin-top:4px;color:#71809e;font-size:11px}.gf-next .attention{display:inline-flex;align-items:center;gap:5px;padding:6px 10px;border-radius:999px;background:#fff0f1;color:#ef3f4b;font-size:11px;font-weight:700}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-actions{display:flex;justify-content:flex-end;gap:8px}.gf-action{width:43px;height:43px;border:1px solid #e2e5ed;border-radius:11px;background:#fff;color:#25334f;font-size:18px;cursor:pointer}.gf-action.del{color:#ef3f4b}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-side-card{background:#fff;border:1px solid #e7e9f0;border-radius:16px;padding:18px;box-sizing:border-box;box-shadow:0 8px 22px rgba(22,27,45,.035)}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-side-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:18px}.gf-side-head h3{margin:0;color:#18233b;font-size:16px;line-height:1.2}.gf-side-head select{height:34px;border:1px solid #e2e5ed;border-radius:10px;background:#fff;color:#26334d;padding:0 10px;font-size:11px}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-donut-wrap{display:grid;grid-template-columns:150px 1fr;gap:12px;align-items:center}.gf-donut{width:132px;height:132px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#6a45e9 0 72%,#4e79ee 72% 100%);position:relative}.gf-donut:after{content:'';position:absolute;inset:18px;border-radius:50%;background:#fff}.gf-donut-center{position:relative;z-index:1;text-align:center}.gf-donut-center b{display:block;font-size:20px;color:#17213a}.gf-donut-center small{display:block;margin-top:2px;font-size:10px;color:#727b8c}.gf-legend{display:flex;flex-direction:column;gap:13px}.gf-legend-row{display:flex;align-items:center;gap:8px;font-size:12px;color:#66718a}.gf-dot{width:9px;height:9px;border-radius:50%;background:#f2bd2f}.gf-dot.blue{background:#4b78ef}.gf-dot.green{background:#16bd7c}.gf-dot.red{background:#ef434e}.gf-legend-row b{margin-left:auto;color:#1c2740}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-tip{margin-top:16px;padding:12px 13px;border-radius:12px;background:#f7f5ff;color:#5e6680;font-size:12px;line-height:1.45}.gf-tip b{color:#6552dd}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-upcoming{display:flex;flex-direction:column;gap:15px}.gf-up-row{display:flex;align-items:center;gap:11px}.gf-up-icon{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#f2f4f8;color:#66718a;flex:0 0 auto}.gf-up-icon.green{background:#e9fff3;color:#14b873}.gf-up-row b{display:block;color:#26334e;font-size:12px}.gf-up-row small{display:block;margin-top:4px;color:#737d91;font-size:11px}.gf-up-row small.red{color:#ef3f4b}
      body.glueful-dashboard-reference-exact #${ROOT_ID} .gf-quick button{display:flex;align-items:center;gap:10px;width:100%;height:42px;margin-top:7px;border:1px solid #e4e7ef;border-radius:10px;background:#fafbfe;color:#2a3650;text-align:left;padding:0 12px;font-size:12px;cursor:pointer}.gf-quick button:first-of-type{color:#5645dd}.gf-quick button:hover{background:#f5f3ff}
      @media(min-width:768px) and (max-width:1279px){body.glueful-dashboard-reference-exact #view-dashboard{width:calc(100vw - 260px)!important;margin-left:260px!important;padding:22px 22px 48px!important}.gf-side-card{display:none}.gf-ref-side{display:none!important}.gf-stat-row{grid-template-columns:repeat(3,1fr)!important}.gf-app{grid-template-columns:66px minmax(0,1fr) 90px 1px minmax(180px,1fr)!important}.gf-actions{grid-column:5;grid-row:1;}.gf-divider{display:none}}
      @media(max-width:767px){body.glueful-dashboard-reference-exact #view-dashboard{width:100%!important;margin:0!important;padding:16px 13px 88px!important}.gf-ref-header{display:block!important;min-height:0!important}.gf-ref-title{font-size:29px!important}.gf-ref-subtitle{font-size:13px!important}.gf-ref-add{margin-top:14px}.gf-stat-row{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}.gf-stat{height:74px!important;padding:0 11px!important}.gf-stat-icon{width:34px!important;height:34px!important;font-size:17px!important}.gf-stat strong{font-size:15px!important}.gf-stat span{font-size:10px!important}.gf-filters{overflow-x:auto;flex-wrap:nowrap!important;padding-bottom:3px}.gf-filter-spacer,.gf-filter-tool{display:none}.gf-app{grid-template-columns:56px minmax(0,1fr) 1fr!important;gap:10px!important;padding:12px!important}.gf-logo{width:54px!important;height:54px!important}.gf-status{grid-column:2}.gf-divider{display:none}.gf-next{grid-column:2/-1}.gf-actions{grid-column:3;grid-row:1}.gf-side{display:none!important}}
    `;
    document.head.appendChild(s);
  }

  function render(){
    const view=document.getElementById('view-dashboard');
    if(!view || !active()) return;
    let root=document.getElementById(ROOT_ID);
    if(!root){
      root=document.createElement('div');root.id=ROOT_ID;
      view.appendChild(root);
    }
    if(root.dataset.rendered==='1') return;
    root.dataset.rendered='1';
    root.innerHTML=`
      <header class="gf-ref-header"><div><h1 class="gf-ref-title">Applications</h1><p class="gf-ref-subtitle">Track every opportunity, stay organized, land your dream job.</p></div><button class="gf-ref-add" type="button" data-ref-action="add">＋ Add Application</button></header>
      <main class="gf-ref-main">
        <section class="gf-stat-row">
          <div class="gf-stat"><i class="gf-stat-icon doc">▤</i><div><strong>5</strong><span>Total Applications</span></div></div>
          <div class="gf-stat"><i class="gf-stat-icon send">➤</i><div><strong>5</strong><span>Applied</span></div></div>
          <div class="gf-stat"><i class="gf-stat-icon cal">□</i><div><strong>0</strong><span>In Interview</span></div></div>
          <div class="gf-stat"><i class="gf-stat-icon trophy">♜</i><div><strong>0</strong><span>Offers</span></div></div>
          <div class="gf-stat"><i class="gf-stat-icon bad">⊗</i><div><strong>0</strong><span>Rejected</span></div></div>
        </section>
        <section class="gf-filters"><button class="gf-filter active">All (5)</button><button class="gf-filter">Recently</button><button class="gf-filter">Applied</button><button class="gf-filter">Interview</button><button class="gf-filter">Offer</button><button class="gf-filter">Rejected</button><span class="gf-filter-spacer"></span><button class="gf-filter-tool">♙ Filter</button><button class="gf-filter-tool">⇅ Sort</button><button class="gf-filter-tool">☷ List</button><button class="gf-filter-tool">▣ Board</button></section>
        <section class="gf-list">
          <article class="gf-app"><div class="gf-logo acl">ACL<br>Digital</div><div class="gf-company"><b>ACL Digital</b><span class="role">Hardware Validation Engineers</span><span class="date">Applied &nbsp; Aug 29, 2025</span></div><span class="gf-status">Applied</span><span class="gf-divider"></span><div class="gf-next"><span class="label">Next Action</span><strong>◷ &nbsp; Not scheduled</strong><small>Keep an eye for updates</small></div><div class="gf-actions"><button class="gf-action" data-ref-action="open">↗</button><button class="gf-action" data-ref-action="edit">⌕</button><button class="gf-action del" data-ref-action="delete">♧</button></div></article>
          <article class="gf-app"><div class="gf-logo frame">FK</div><div class="gf-company"><b>Framestore</b><span class="role">Talent Assistant</span><span class="date">Applied &nbsp; Aug 19, 2025</span></div><span class="gf-status">Applied</span><span class="gf-divider"></span><div class="gf-next"><span class="label">Next Action</span><strong>◷ &nbsp; Not scheduled</strong><small>Keep an eye for updates</small></div><div class="gf-actions"><button class="gf-action">↗</button><button class="gf-action">⌕</button><button class="gf-action del">♧</button></div></article>
          <article class="gf-app"><div class="gf-logo qid">الدولية</div><div class="gf-company"><b>Qiddiya Investment Company</b><span class="role">Manager - Operations (DEL2)</span><span class="date">Applied &nbsp; Aug 18, 2025</span></div><span class="gf-status">Applied</span><span class="gf-divider"></span><div class="gf-next"><span class="label">Next Action</span><strong>◷ &nbsp; Not scheduled</strong><small>Keep an eye for updates</small></div><div class="gf-actions"><button class="gf-action">↗</button><button class="gf-action">⌕</button><button class="gf-action del">♧</button></div></article>
          <article class="gf-app"><div class="gf-logo ai">AI</div><div class="gf-company"><b>Anthropic</b><span class="role">fgg</span><span class="date">Applied &nbsp; Aug 17, 2025</span></div><span class="gf-status">Applied</span><span class="gf-divider"></span><div class="gf-next"><span class="label">Next Action</span><strong class="attention">! &nbsp; Needs attention</strong><small>Follow up on application</small></div><div class="gf-actions"><button class="gf-action">↗</button><button class="gf-action">⌕</button><button class="gf-action del">♧</button></div></article>
          <article class="gf-app"><div class="gf-logo skill">S</div><div class="gf-company"><b>SKILLIT ACADEMY</b><span class="role">Business Development Associate</span><span class="date">Applied &nbsp; Aug 17, 2025</span></div><span class="gf-status">Applied</span><span class="gf-divider"></span><div class="gf-next"><span class="label">Next Action</span><strong>◷ &nbsp; Not scheduled</strong><small>Keep an eye for updates</small></div><div class="gf-actions"><button class="gf-action">↗</button><button class="gf-action">⌕</button><button class="gf-action del">♧</button></div></article>
        </section>
      </main>
      <aside class="gf-ref-side">
        <section class="gf-side-card"><div class="gf-side-head"><h3>Application Insights</h3><select><option>This Month</option></select></div><div class="gf-donut-wrap"><div class="gf-donut"><div class="gf-donut-center"><b>5</b><small>Total</small></div></div><div class="gf-legend"><div class="gf-legend-row"><i class="gf-dot"></i>Applied <b>5</b></div><div class="gf-legend-row"><i class="gf-dot blue"></i>Interview <b>0</b></div><div class="gf-legend-row"><i class="gf-dot green"></i>Offer <b>0</b></div><div class="gf-legend-row"><i class="gf-dot red"></i>Rejected <b>0</b></div></div></div><div class="gf-tip">💡 <span><b>Tip:</b> Add interview dates and notes to track your progress better.</span></div></section>
        <section class="gf-side-card"><div class="gf-side-head"><h3>Upcoming Actions</h3><a href="#" style="color:#5548df;font-size:12px;font-weight:700;text-decoration:none">View all</a></div><div class="gf-upcoming"><div class="gf-up-row"><i class="gf-up-icon">◷</i><div><b>No upcoming interviews</b><small>You're all caught up! 🎉</small></div></div><div class="gf-up-row"><i class="gf-up-icon green">✓</i><div><b>Follow ups</b><small class="red">1 application needs attention</small></div></div></div></section>
        <section class="gf-side-card gf-quick"><div class="gf-side-head"><h3>Quick Actions</h3></div><button data-ref-action="add">＋ <span>Add New Application</span></button><button data-ref-action="resume">▤ <span>Import from Resume</span></button><button data-ref-action="calendar">▣ <span>View Calendar</span></button><button data-ref-action="export">⇩ <span>Export Applications</span></button></section>
      </aside>`;

    root.addEventListener('click',function(e){
      const action=e.target.closest('[data-ref-action]')?.dataset.refAction;
      if(!action) return;
      if(action==='add') clickExisting(/add\s+(new\s+)?application/i);
      if(action==='calendar') clickExisting(/calendar/i);
      if(action==='resume') clickExisting(/resume/i);
      if(action==='open') clickExisting(/applications/i);
    });
  }

  function sync(){
    const on=active();
    document.body.classList.toggle('glueful-dashboard-reference-exact',on);
    if(on){installStyle();render();}
  }

  function start(){
    sync();
    const observer=new MutationObserver(function(){requestAnimationFrame(sync);});
    if(document.body) observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
    window.addEventListener('resize',sync,{passive:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
