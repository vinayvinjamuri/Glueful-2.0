/* Glueful universal dashboard V1
 * Applies the approved mobile dashboard structure at every screen width.
 * This is intentionally global: phone, tablet and desktop use one dashboard UI.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_UNIVERSAL_DASHBOARD_V1__) return;
  window.__GLUEFUL_UNIVERSAL_DASHBOARD_V1__=true;

  const STYLE_ID='glueful-universal-dashboard-style-v1';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* One dashboard structure at every viewport width. */
      html.glueful-dashboard-fixed,
      body.glueful-dashboard-fixed{
        width:100%;
        min-height:100dvh;
      }

      body.glueful-dashboard-fixed #view-dashboard{
        position:fixed !important;
        top:0 !important;
        left:0 !important;
        right:0 !important;
        bottom:calc(72px + env(safe-area-inset-bottom)) !important;
        width:100% !important;
        min-height:0 !important;
        max-height:none !important;
        height:auto !important;
        box-sizing:border-box !important;
        overflow-x:hidden !important;
        overflow-y:auto !important;
        padding:calc(env(safe-area-inset-top) + 8px) 12px 20px !important;
        margin:0 !important;
        overscroll-behavior-y:contain !important;
        -webkit-overflow-scrolling:touch !important;
        scrollbar-width:none !important;
      }
      body.glueful-dashboard-fixed #view-dashboard::-webkit-scrollbar{display:none !important}

      body.glueful-dashboard-fixed #view-dashboard .view-header{
        position:relative !important;
        display:block !important;
        width:100% !important;
        min-height:58px !important;
        height:58px !important;
        margin:0 0 9px !important;
        padding:0 0 0 52px !important;
        box-sizing:border-box !important;
        overflow:visible !important;
      }
      body.glueful-dashboard-fixed #view-dashboard .view-title{
        display:block !important;
        width:calc(100% - 205px) !important;
        max-width:calc(100% - 205px) !important;
        font-size:18px !important;
        line-height:1.08 !important;
        margin:0 !important;
        padding:5px 0 0 !important;
        white-space:nowrap !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
      }
      body.glueful-dashboard-fixed #view-dashboard .view-subtitle{
        display:block !important;
        width:calc(100% - 205px) !important;
        max-width:calc(100% - 205px) !important;
        margin:4px 0 0 !important;
        font-size:10px !important;
        line-height:1.15 !important;
        white-space:nowrap !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
      }

      body.glueful-dashboard-fixed #view-dashboard .stat-grid,
      body.glueful-dashboard-fixed #view-dashboard .stats-grid{
        display:grid !important;
        grid-template-columns:repeat(2,minmax(0,1fr)) !important;
        gap:7px !important;
        margin-bottom:8px !important;
      }
      body.glueful-dashboard-fixed #view-dashboard .stat-card{
        min-width:0 !important;
        min-height:0 !important;
        padding:9px !important;
        border-radius:15px !important;
        box-sizing:border-box !important;
      }
      body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-label{font-size:12px !important;line-height:1.15 !important}
      body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-value{font-size:27px !important;line-height:1 !important;margin:4px 0 !important}
      body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-meta,
      body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-description{font-size:10px !important;line-height:1.2 !important}

      body.glueful-dashboard-fixed #view-dashboard .heat-card{
        width:100% !important;
        box-sizing:border-box !important;
        padding:8px !important;
        margin:0 0 8px !important;
        border-radius:16px !important;
        overflow:hidden !important;
      }
      body.glueful-dashboard-fixed #view-dashboard .heat-grid{
        display:grid !important;
        grid-template-columns:repeat(7,minmax(0,1fr)) !important;
        grid-auto-rows:29px !important;
        grid-template-rows:repeat(6,29px) !important;
        align-content:start !important;
        align-items:start !important;
        justify-items:stretch !important;
        gap:3px !important;
        margin-top:4px !important;
        margin-bottom:0 !important;
        padding:0 !important;
        width:100% !important;
        min-height:0 !important;
        height:189px !important;
        box-sizing:border-box !important;
      }
      body.glueful-dashboard-fixed #view-dashboard .heat-grid > *{
        min-height:0 !important;max-height:29px !important;height:29px !important;align-self:start !important;box-sizing:border-box !important;
      }
      body.glueful-dashboard-fixed #view-dashboard .heat-cell{
        width:100% !important;height:29px !important;min-height:29px !important;max-height:29px !important;aspect-ratio:auto !important;border-radius:7px !important;box-sizing:border-box !important;margin:0 !important;
      }

      body.glueful-dashboard-fixed #view-dashboard #dashboard-interviews{gap:5px !important;margin-top:0 !important;margin-bottom:12px !important}
      body.glueful-dashboard-fixed #view-dashboard .section-title{font-size:11px !important;line-height:1.15 !important;margin:0 0 5px !important}
      body.glueful-dashboard-fixed #view-dashboard #dashboard-interviews .empty-state{min-height:76px !important;height:76px !important;padding:7px !important;display:flex !important;align-items:center !important;justify-content:center !important;box-sizing:border-box !important;overflow:hidden !important}

      /* Keep the same bottom navigation on all screen sizes. */
      #bottom-nav.authenticated{
        position:fixed !important;
        left:0 !important;
        right:0 !important;
        bottom:0 !important;
        z-index:10000 !important;
        display:flex !important;
        width:100% !important;
        height:72px !important;
        min-height:72px !important;
        box-sizing:border-box !important;
        padding:8px 12px calc(8px + env(safe-area-inset-bottom)) !important;
        gap:4px !important;
        align-items:stretch !important;
        justify-content:stretch !important;
      }
      #bottom-nav.authenticated .nav-btn{
        flex:1 1 0 !important;
        width:0 !important;
        min-width:0 !important;
        height:100% !important;
        min-height:56px !important;
      }
    `;
    document.head.appendChild(s);
  }

  function sync(){
    const d=document.getElementById('view-dashboard');
    const active=!!d&&(d.classList.contains('active')||d.style.display==='block');
    if(!active) return;
    install();
    document.documentElement.classList.add('glueful-dashboard-fixed');
    document.body.classList.add('glueful-dashboard-fixed');
    d.style.zoom='1';
    d.style.width='100%';
  }

  function start(){
    sync();
    [300,800,1600,3000].forEach(t=>setTimeout(sync,t));
    const o=new MutationObserver(()=>requestAnimationFrame(sync));
    o.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden']});
    addEventListener('resize',sync,{passive:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
