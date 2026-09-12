/* Glueful Applications — Clean V7
 * Applications-only desktop geometry and supporting rail.
 * Keeps application data/handlers in the existing Applications implementation.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_CLEAN_V7__)return;
  window.__GLUEFUL_APPLICATIONS_CLEAN_V7__=true;

  const VIEW='view-applications';
  const RAIL='glueful-applications-clean-v6-rail';
  const STYLE='glueful-applications-clean-v7-style';

  function getView(){return document.getElementById(VIEW);}
  function isActive(v){return !!v&&(v.classList.contains('active')||v.style.display==='block');}

  function install(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      /* Applications-only overflow guard. */
      #${VIEW}{overflow-x:hidden!important;}

      /* ================================================================
         APPLICATIONS — STABLE DESKTOP LAYOUT
         Fixed sidebar: 260px | rail: 370px | gap: 24px | main: 952px.
         The Applications view itself begins exactly after the sidebar;
         the rail and main column are then laid out inside that canvas.
         ================================================================ */
      @media(min-width:1280px){
        #${VIEW}{
          position:fixed!important;
          left:260px!important;
          right:0!important;
          top:0!important;
          bottom:0!important;
          width:auto!important;
          height:100vh!important;
          min-height:100vh!important;
          margin:0!important;
          padding:24px 32px 52px 0!important;
          box-sizing:border-box!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          transform:none!important;
          background:#f7f8fb!important;
        }

        /* Supporting rail: 370px, immediately inside the Applications area. */
        #${VIEW}>#${RAIL}{
          position:absolute!important;
          left:0!important;
          top:24px!important;
          right:auto!important;
          width:370px!important;
          max-width:370px!important;
          min-width:370px!important;
          margin:0!important;
          padding:0!important;
          box-sizing:border-box!important;
          display:flex!important;
          flex-direction:column!important;
          gap:16px!important;
          z-index:20!important;
          pointer-events:auto!important;
        }
        #${VIEW}>#${RAIL}>*{
          width:370px!important;
          max-width:370px!important;
          box-sizing:border-box!important;
        }

        /* Remove obsolete Applications-only presentation layers. */
        #${VIEW}>#glueful-applications-rail-v2,
        #${VIEW}>#glueful-applications-workspace-v1,
        #${VIEW}>#gf-app-reference-rail-v5,
        #${VIEW}>#glueful-applications-reference-rail-v3{
          display:none!important;
        }

        /* Main Applications column: 370px rail + 24px gap = 394px. */
        #${VIEW}>*:not(#${RAIL}){
          box-sizing:border-box!important;
          width:952px!important;
          max-width:952px!important;
          min-width:0!important;
          margin-left:394px!important;
          margin-right:0!important;
          transform:none!important;
        }

        #${VIEW}>.view-header{
          height:72px!important;
          min-height:72px!important;
          margin-top:0!important;
          margin-bottom:14px!important;
          padding:0!important;
          display:flex!important;
          align-items:flex-start!important;
          justify-content:space-between!important;
          gap:22px!important;
          position:relative!important;
        }
        #${VIEW}>.view-header .view-title{
          margin:0 0 5px!important;
          font-size:36px!important;
          line-height:39px!important;
          letter-spacing:-1.35px!important;
          font-weight:750!important;
          color:#172039!important;
        }
        #${VIEW}>.view-header .view-subtitle{
          margin:0!important;
          font-size:16px!important;
          line-height:22px!important;
          color:#72809d!important;
        }
        #${VIEW}>.view-header>button,
        #${VIEW}>.view-header>a{
          position:static!important;
          inset:auto!important;
          transform:none!important;
          margin:0!important;
          flex:0 0 auto!important;
        }

        /* Existing search/filter/list wrappers all share the main column. */
        #${VIEW} .glueful-applications-main-wide,
        #${VIEW} .glueful-applications-main-centered{
          box-sizing:border-box!important;
          width:952px!important;
          max-width:952px!important;
          min-width:0!important;
          margin-left:394px!important;
          margin-right:0!important;
          transform:none!important;
        }
        #${VIEW} .glueful-applications-main-wide{margin-top:0!important;}
        #${VIEW} .glueful-applications-main-wide+.glueful-applications-main-centered{margin-top:14px!important;}
        #${VIEW} .glueful-applications-main-centered+.glueful-applications-main-centered{margin-top:16px!important;}

        #${VIEW} input[type="search"],
        #${VIEW} input[placeholder*="Search"],
        #${VIEW} input[placeholder*="search"]{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          box-sizing:border-box!important;
        }

        #${VIEW} .application-card,
        #${VIEW} .job-application-card,
        #${VIEW} [class*="application-card"]{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          box-sizing:border-box!important;
        }
      }

      /* Utility rail visual system — scoped to Applications only. */
      #${VIEW}>#${RAIL} .card{
        background:#fff;
        border:1px solid #e5e9f1;
        border-radius:15px;
        box-shadow:0 4px 18px rgba(24,35,62,.045);
        padding:18px;
        color:#172039;
      }
      #${VIEW}>#${RAIL} .insights{min-height:316px}
      #${VIEW}>#${RAIL} .upcoming{min-height:197px}
      #${VIEW}>#${RAIL} .quick{min-height:292px}
      #${VIEW}>#${RAIL} .head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
      #${VIEW}>#${RAIL} h3{margin:0;font:750 17px/21px Inter,system-ui,sans-serif}
      #${VIEW}>#${RAIL} .month{height:38px;padding:0 12px;border:1px solid #e3e7ef;border-radius:10px;background:#fff;color:#25324c;font:600 12px/38px Inter,sans-serif}
      #${VIEW}>#${RAIL} .body{display:flex;align-items:center;gap:24px;margin:4px 0 20px}
      #${VIEW}>#${RAIL} .donut{position:relative;width:132px;height:132px;flex:0 0 132px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:conic-gradient(#6841ee 0 72%,#356ef6 72%)}
      #${VIEW}>#${RAIL} .donut:after{content:'';position:absolute;inset:18px;border-radius:50%;background:#fff}
      #${VIEW}>#${RAIL} .donut>*{position:relative;z-index:1}
      #${VIEW}>#${RAIL} .donut strong{font:700 21px/22px Inter,sans-serif}
      #${VIEW}>#${RAIL} .donut small{margin-top:4px;font:500 10px/12px Inter,sans-serif;color:#75819b}
      #${VIEW}>#${RAIL} .legend{flex:1;display:flex;flex-direction:column;gap:14px}
      #${VIEW}>#${RAIL} .legend div{display:flex;align-items:center;gap:9px;font:500 12px/15px Inter,sans-serif;color:#65728d}
      #${VIEW}>#${RAIL} .legend i{width:10px;height:10px;border-radius:50%;flex:0 0 10px}
      #${VIEW}>#${RAIL} .legend .a{background:#f5bc32}
      #${VIEW}>#${RAIL} .legend .i{background:#3f72f5}
      #${VIEW}>#${RAIL} .legend .o{background:#15c48a}
      #${VIEW}>#${RAIL} .legend .r{background:#ef4b58}
      #${VIEW}>#${RAIL} .legend b{margin-left:auto;color:#26314b}
      #${VIEW}>#${RAIL} .tip{display:flex;gap:9px;padding:13px 12px;border-radius:12px;background:#f7f6ff;color:#63708b;font:500 12px/17px Inter,sans-serif}
      #${VIEW}>#${RAIL} .tip p{margin:0}
      #${VIEW}>#${RAIL} .tip b{color:#4d40d9}
      #${VIEW}>#${RAIL} .link{color:#4638e8;font:700 12px/16px Inter,sans-serif}
      #${VIEW}>#${RAIL} .action{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #f0f2f6}
      #${VIEW}>#${RAIL} .action:first-of-type{border-top:0;padding-top:0}
      #${VIEW}>#${RAIL} .action-icon{width:38px;height:38px;flex:0 0 38px;display:grid;place-items:center;border-radius:50%;background:#f3f5f9;color:#6b7892;font-size:22px}
      #${VIEW}>#${RAIL} .action-icon.check{background:#eafaf2;color:#12b879;font-size:19px}
      #${VIEW}>#${RAIL} .action b{display:block;font:600 13px/16px Inter,sans-serif}
      #${VIEW}>#${RAIL} .action small{display:block;margin-top:4px;font:500 11px/14px Inter,sans-serif;color:#77839b}
      #${VIEW}>#${RAIL} .action small.red{color:#ef4b58}
      #${VIEW}>#${RAIL} .quick button{width:100%;height:42px;display:flex;align-items:center;gap:11px;margin-top:7px;padding:0 12px;border:1px solid #e4e8f0;border-radius:10px;background:#fafbfe;color:#33405a;font:500 12px/42px Inter,sans-serif;text-align:left}
      #${VIEW}>#${RAIL} .quick button span{width:25px;text-align:center;font-size:18px}
      #${VIEW}>#${RAIL} .quick .purple{width:25px;height:25px;line-height:23px;border-radius:50%;color:#fff;background:linear-gradient(135deg,#7445ef,#4d67ee);font-size:20px}
    `;
    document.head.appendChild(s);
  }

  function removeOld(){
    const v=getView();
    if(!v)return;
    [
      'gf-app-reference-rail-v5',
      'glueful-applications-reference-rail-v3',
      'glueful-applications-rail-v2',
      'glueful-applications-workspace-v1',
      'glueful-applications-reference-brand-v3',
      'gf-brand-v5',
      'glueful-applications-reference-profile-v3',
      'gf-profile-v5'
    ].forEach(id=>document.getElementById(id)?.remove());
  }

  function build(){
    const v=getView();
    if(!v||!isActive(v))return;
    removeOld();
    let r=document.getElementById(RAIL);
    if(r)return;
    r=document.createElement('aside');
    r.id=RAIL;
    r.innerHTML=`
      <section class="card insights">
        <div class="head"><h3>Application Insights</h3><button class="month">This Month　⌄</button></div>
        <div class="body">
          <div class="donut"><strong>5</strong><small>Total</small></div>
          <div class="legend">
            <div><i class="a"></i><span>Applied</span><b>5</b></div>
            <div><i class="i"></i><span>Interview</span><b>0</b></div>
            <div><i class="o"></i><span>Offer</span><b>0</b></div>
            <div><i class="r"></i><span>Rejected</span><b>0</b></div>
          </div>
        </div>
        <div class="tip"><span>💡</span><p><b>Tip:</b> Add interview dates and notes to track your progress better.</p></div>
      </section>
      <section class="card upcoming">
        <div class="head"><h3>Upcoming Actions</h3><a class="link" href="#">View all</a></div>
        <div class="action"><span class="action-icon">◷</span><div><b>No upcoming interviews</b><small>You're all caught up! 🎉</small></div></div>
        <div class="action"><span class="action-icon check">✓</span><div><b>Follow ups</b><small class="red">1 application needs attention</small></div></div>
      </section>
      <section class="card quick">
        <div class="head"><h3>Quick Actions</h3></div>
        <button><span class="purple">＋</span>Add New Application</button>
        <button><span>▤</span>Import from Resume</button>
        <button><span>▣</span>View Calendar</button>
        <button><span>⇩</span>Export Applications</button>
      </section>`;
    v.appendChild(r);
  }

  function sync(){
    const v=getView();
    if(!isActive(v))return;
    install();
    build();
  }

  function start(){
    sync();
    [100,500,1200,2500].forEach(t=>setTimeout(sync,t));
    new MutationObserver(function(){sync();}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
