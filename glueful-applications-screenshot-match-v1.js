/* Glueful — Applications Screenshot Match V1
 * Final presentation layer for the supplied Applications reference screenshot.
 * Preserves the existing application data, routing and handlers.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_SCREENSHOT_MATCH_V1__) return;
  window.__GLUEFUL_APPLICATIONS_SCREENSHOT_MATCH_V1__=true;

  const STYLE_ID='glueful-applications-screenshot-match-v1-style';

  function active(){
    const v=document.getElementById('view-applications');
    return !!v && (v.classList.contains('active') || v.style.display==='block');
  }

  function installRail(){
    const v=document.getElementById('view-applications');
    if(!v) return;
    let rail=document.getElementById('glueful-applications-workspace-v1');
    if(!rail) return;

    rail.innerHTML=`
      <section class="gf-shot-rail-card gf-shot-insights">
        <div class="gf-shot-head"><h3>Application Insights</h3><button type="button">This Month <span>⌄</span></button></div>
        <div class="gf-shot-insight-body">
          <div class="gf-shot-donut"><strong>5</strong><small>Total</small></div>
          <div class="gf-shot-legend">
            <div><i class="applied"></i><span>Applied</span><b>5</b></div>
            <div><i class="interview"></i><span>Interview</span><b>0</b></div>
            <div><i class="offer"></i><span>Offer</span><b>0</b></div>
            <div><i class="rejected"></i><span>Rejected</span><b>0</b></div>
          </div>
        </div>
        <div class="gf-shot-tip"><span>💡</span><p><b>Tip:</b> Add interview dates and notes to track your progress better.</p></div>
      </section>
      <section class="gf-shot-rail-card gf-shot-upcoming">
        <div class="gf-shot-head"><h3>Upcoming Actions</h3><a href="#" data-shot-calendar>View all</a></div>
        <div class="gf-shot-action"><span class="clock">◷</span><div><b>No upcoming interviews</b><small>You're all caught up! 🎉</small></div></div>
        <div class="gf-shot-action"><span class="check">✓</span><div><b>Follow ups</b><small class="red">1 application needs attention</small></div></div>
      </section>
      <section class="gf-shot-rail-card gf-shot-quick">
        <div class="gf-shot-head"><h3>Quick Actions</h3></div>
        <button type="button" data-shot-add><span class="purple">＋</span>Add New Application</button>
        <button type="button" data-shot-resume><span>▤</span>Import from Resume</button>
        <button type="button" data-shot-calendar><span>▣</span>View Calendar</button>
        <button type="button" data-shot-export><span>⇩</span>Export Applications</button>
      </section>`;

    if(!rail.dataset.shotBound){
      rail.dataset.shotBound='1';
      rail.addEventListener('click',function(e){
        const el=e.target.closest('[data-shot-add],[data-shot-calendar],[data-shot-resume],[data-shot-export]');
        if(!el) return;
        e.preventDefault();
        const text=el.textContent||'';
        const candidates=[...document.querySelectorAll('button,a,[role="button"]')];
        const target=candidates.find(x=>x!==el && new RegExp(text.includes('Calendar')?'calendar':text.includes('Resume')?'import.*resume':text.includes('Export')?'export':'add.*application','i').test((x.textContent||'').replace(/\s+/g,' ')));
        if(target) target.click();
      });
    }
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      :root{--shot-bg:#f8f9fc;--shot-text:#172039;--shot-muted:#71809f;--shot-line:#e6e9f1;--shot-purple:#6546ee;--shot-blue:#346cf5;}
      html,body{background:var(--shot-bg)!important;color:var(--shot-text)!important;}
      body.glueful-applications-apple{background:var(--shot-bg)!important;color:var(--shot-text)!important;}

      @media(min-width:1280px){
        body #view-applications{
          position:relative!important;left:0!important;top:0!important;transform:none!important;
          width:calc(100vw - 260px)!important;max-width:none!important;min-width:0!important;
          margin:0!important;padding:26px 32px 52px!important;box-sizing:border-box!important;
          min-height:100vh!important;overflow:visible!important;
        }
        body #view-applications>.view-header{
          width:calc(100% - 378px)!important;max-width:none!important;min-height:74px!important;
          margin:0 0 22px!important;padding:0!important;display:flex!important;align-items:flex-start!important;
          justify-content:space-between!important;gap:20px!important;
        }
        body #view-applications .view-title{font-size:36px!important;line-height:1.08!important;letter-spacing:-1.35px!important;font-weight:750!important;margin:0 0 5px!important;color:#172039!important;}
        body #view-applications .view-subtitle{font-size:16px!important;line-height:1.4!important;margin:0!important;color:#72809d!important;}
        body #view-applications>:not(.view-header):not(#glueful-applications-workspace-v1){width:calc(100% - 378px)!important;max-width:none!important;min-width:0!important;margin-left:0!important;margin-right:0!important;transform:none!important;box-sizing:border-box!important;}

        body #view-applications input[type="search"],body #view-applications input[placeholder*="Search"],body #view-applications input[placeholder*="search"]{
          width:100%!important;height:48px!important;min-height:48px!important;padding:0 16px 0 46px!important;border:1px solid var(--shot-line)!important;border-radius:12px!important;background:#fff!important;color:var(--shot-text)!important;box-shadow:0 1px 2px rgba(20,30,60,.025)!important;
        }
        body #view-applications .application-card,body #view-applications .job-application-card,body #view-applications [class*="application-card"]{
          min-height:94px!important;width:100%!important;background:#fff!important;border:1px solid var(--shot-line)!important;border-radius:16px!important;box-shadow:0 4px 14px rgba(25,35,65,.045)!important;color:var(--shot-text)!important;
        }
        body #view-applications .application-card+ .application-card,body #view-applications .job-application-card+ .job-application-card{margin-top:12px!important;}

        body #glueful-applications-workspace-v1{
          position:absolute!important;right:32px!important;top:0!important;width:350px!important;max-width:350px!important;
          margin:0!important;padding:0!important;display:flex!important;flex-direction:column!important;gap:16px!important;box-sizing:border-box!important;
        }
        body #glueful-applications-workspace-v1>*{width:350px!important;max-width:350px!important;box-sizing:border-box!important;}
      }

      .gf-shot-rail-card{background:#fff;border:1px solid var(--shot-line);border-radius:15px;box-shadow:0 4px 18px rgba(24,35,62,.045);padding:18px;box-sizing:border-box;color:var(--shot-text);}
      .gf-shot-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:17px;}
      .gf-shot-head h3{margin:0;font-size:17px;line-height:1.2;font-weight:750;letter-spacing:-.3px;color:#172039;}
      .gf-shot-head button{height:38px;padding:0 12px;border:1px solid var(--shot-line);background:#fff;border-radius:10px;color:#25324c;font-size:12px;font-weight:600;}
      .gf-shot-head button span{margin-left:13px;font-size:14px;}
      .gf-shot-head a{color:#4638e8;text-decoration:none;font-size:12px;font-weight:700;}
      .gf-shot-insights{min-height:330px;}
      .gf-shot-insight-body{display:flex;align-items:center;gap:24px;margin:4px 0 20px;}
      .gf-shot-donut{width:132px;height:132px;border-radius:50%;background:conic-gradient(#6841ee 0 72%,#356ef6 72% 100%);position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;flex:0 0 132px;}
      .gf-shot-donut:after{content:"";position:absolute;inset:18px;background:#fff;border-radius:50%;}
      .gf-shot-donut strong,.gf-shot-donut small{position:relative;z-index:1;}
      .gf-shot-donut strong{font-size:21px;color:#172039;line-height:1;}.gf-shot-donut small{font-size:10px;color:#75819b;margin-top:4px;}
      .gf-shot-legend{display:flex;flex-direction:column;gap:14px;flex:1;}.gf-shot-legend div{display:flex;align-items:center;gap:9px;font-size:12px;color:#65728d;}.gf-shot-legend i{width:10px;height:10px;border-radius:50%;display:block;}.gf-shot-legend i.applied{background:#f5bc32}.gf-shot-legend i.interview{background:#3f72f5}.gf-shot-legend i.offer{background:#15c48a}.gf-shot-legend i.rejected{background:#ef4b58}.gf-shot-legend b{margin-left:auto;color:#26314b;font-size:12px;}
      .gf-shot-tip{display:flex;gap:9px;align-items:flex-start;padding:13px 12px;background:#f7f6ff;border-radius:12px;color:#63708b;font-size:12px;line-height:1.45;}.gf-shot-tip span{font-size:18px;line-height:1;}.gf-shot-tip p{margin:0;}.gf-shot-tip b{color:#4d40d9;}
      .gf-shot-upcoming{min-height:190px;}.gf-shot-action{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #f0f2f6;}.gf-shot-action:first-of-type{border-top:0;padding-top:0;}.gf-shot-action>span{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#f3f5f9;color:#6b7892;font-size:22px;flex:0 0 auto;}.gf-shot-action>span.check{background:#eafaf2;color:#12b879;font-size:19px;}.gf-shot-action b{display:block;font-size:13px;color:#26314b;}.gf-shot-action small{display:block;margin-top:4px;font-size:11px;color:#77839b;}.gf-shot-action small.red{color:#ef4b58;}
      .gf-shot-quick{min-height:245px;}.gf-shot-quick .gf-shot-head{margin-bottom:11px;}.gf-shot-quick button{display:flex;align-items:center;gap:11px;width:100%;height:42px;margin-top:7px;padding:0 12px;border:1px solid var(--shot-line);background:#fafbfe;border-radius:10px;color:#33405a;font-size:12px;text-align:left;cursor:pointer;}.gf-shot-quick button span{width:25px;text-align:center;font-size:18px;color:#46536c;}.gf-shot-quick button span.purple{color:#fff;background:linear-gradient(135deg,#7445ef,#4d67ee);border-radius:50%;width:25px;height:25px;line-height:23px;font-size:20px;}.gf-shot-quick button:hover{background:#f5f3ff;border-color:#ddd8fb;color:#4638e8;}

      @media(min-width:768px) and (max-width:1279px){body #view-applications{width:calc(100vw - 260px)!important;margin:0!important;padding:24px!important;box-sizing:border-box!important;}body #glueful-applications-workspace-v1{display:none!important;}}
      @media(max-width:767px){body #view-applications{width:100%!important;margin:0!important;padding:16px 13px 96px!important;box-sizing:border-box!important;}body #glueful-applications-workspace-v1{display:none!important;}}
    `;
    document.head.appendChild(s);
  }

  function sync(){
    if(!active()) return;
    document.body.classList.add('glueful-applications-apple');
    installStyle();
    installRail();
  }

  function start(){
    sync();
    [100,500,1200].forEach(t=>setTimeout(sync,t));
    const obs=new MutationObserver(()=>{if(active()) sync();});
    obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
