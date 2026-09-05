/* Glueful Dashboard Apple Layout V1
 * Visual-only layout correction. Does not replace dashboard markup or logic.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_APPLE_LAYOUT_V1__) return;
  window.__GLUEFUL_DASHBOARD_APPLE_LAYOUT_V1__=true;

  const STYLE_ID='glueful-dashboard-apple-layout-v1';
  const SHELL_CLASS='glueful-dashboard-wide-shell-v1';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Use a readable Apple-like content width instead of the old narrow shell. */
      @media (min-width:701px){
        body.glueful-apple-dashboard #view-dashboard{
          width:calc(100% - 48px)!important;
          max-width:1240px!important;
          margin-left:auto!important;
          margin-right:auto!important;
          box-sizing:border-box!important;
        }
        body.glueful-apple-dashboard .${SHELL_CLASS}{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          box-sizing:border-box!important;
          align-self:stretch!important;
        }
      }

      /* Desktop/tablet application summary stays balanced as the window grows. */
      @media (min-width:1101px){
        body.glueful-apple-dashboard #view-dashboard .stat-grid,
        body.glueful-apple-dashboard #view-dashboard .stats-grid{
          grid-template-columns:repeat(4,minmax(0,1fr))!important;
        }
      }

      /* Compact activity grid; existing cells/data remain untouched. */
      body.glueful-apple-dashboard #view-dashboard .heat-grid{
        display:grid!important;
        grid-template-columns:repeat(7,minmax(0,1fr))!important;
        grid-auto-rows:28px!important;
        grid-auto-flow:row!important;
        gap:5px!important;
        align-content:start!important;
        align-items:stretch!important;
        width:100%!important;
        height:auto!important;
        min-height:0!important;
        box-sizing:border-box!important;
      }
      body.glueful-apple-dashboard #view-dashboard .heat-grid > *{
        height:28px!important;
        min-height:28px!important;
        max-height:28px!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      body.glueful-apple-dashboard #view-dashboard .heat-cell{
        width:100%!important;
        height:28px!important;
        min-height:28px!important;
        max-height:28px!important;
        aspect-ratio:auto!important;
        border-radius:7px!important;
        box-sizing:border-box!important;
        margin:0!important;
      }

      body.glueful-apple-dashboard #view-dashboard .heat-card{
        padding:18px!important;
        overflow:hidden!important;
      }
      body.glueful-apple-dashboard #view-dashboard .heat-card .activity-label{
        font-size:10px!important;
        line-height:1.2!important;
      }
      body.glueful-apple-dashboard #view-dashboard .heat-card .activity-month{
        font-size:18px!important;
        line-height:1.15!important;
      }
      body.glueful-apple-dashboard #view-dashboard .heat-card .heat-legend,
      body.glueful-apple-dashboard #view-dashboard .heat-card .heat-hint{
        font-size:10px!important;
      }

      @media (max-width:700px){
        body.glueful-apple-dashboard #view-dashboard{
          width:100%!important;
          max-width:none!important;
          margin-left:0!important;
          margin-right:0!important;
        }
        body.glueful-apple-dashboard #view-dashboard .heat-grid{
          grid-auto-rows:29px!important;
          gap:4px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .heat-grid > *,
        body.glueful-apple-dashboard #view-dashboard .heat-cell{
          height:29px!important;
          min-height:29px!important;
          max-height:29px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function active(){
    const d=document.getElementById('view-dashboard');
    return !!d&&(d.classList.contains('active')||d.style.display==='block');
  }

  function widenShell(){
    if(window.matchMedia && !window.matchMedia('(min-width:701px)').matches) return;
    const d=document.getElementById('view-dashboard');
    if(!d) return;
    let node=d.parentElement;
    let depth=0;
    while(node && node !== document.body && depth < 5){
      const rect=node.getBoundingClientRect();
      if(rect.width < Math.min(window.innerWidth - 80, 1000)){
        node.classList.add(SHELL_CLASS);
        break;
      }
      node=node.parentElement;
      depth++;
    }
  }

  function sync(){
    install();
    const on=active();
    document.body.classList.toggle('glueful-apple-dashboard',on);
    if(on) widenShell();
  }

  function start(){
    sync();
    document.addEventListener('click',function(){setTimeout(sync,250);},true);
    window.addEventListener('resize',sync,{passive:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
