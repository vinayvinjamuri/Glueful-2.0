/* Glueful Dashboard Reference Step 6
 * Removes duplicate dashboard stats rendering and the leftover dashboard interview shell.
 * The actual Interviews view remains untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP6_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP6_V1__=true;

  const STYLE_ID='glueful-dashboard-reference-step6-v1-style';

  function active(){
    const d=document.getElementById('view-dashboard');
    return !!d&&(d.classList.contains('active')||d.style.display==='block');
  }

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-duplicate-stats{display:none!important}
      }
      body.glueful-apple-dashboard #view-dashboard #dashboard-interviews{display:none!important}
    `;
    document.head.appendChild(s);
  }

  function cleanup(){
    const d=document.getElementById('view-dashboard');
    if(!d||!active()) return;

    const grids=Array.from(d.querySelectorAll('.stat-grid,.stats-grid'))
      .filter(el=>!el.closest('#'+STYLE_ID));

    // Keep the first dashboard stats surface and suppress later duplicate surfaces.
    grids.forEach((grid,index)=>{
      if(index===0) grid.classList.remove('glueful-reference-duplicate-stats');
      else grid.classList.add('glueful-reference-duplicate-stats');
    });

    const interviews=d.querySelector('#dashboard-interviews');
    if(interviews) interviews.style.display='none';

    d.querySelectorAll('h1,h2,h3').forEach(el=>{
      const text=(el.textContent||'').trim().replace(/\s+/g,' ').toUpperCase();
      if(text==='UPCOMING INTERVIEWS' && !el.closest('#dashboard-interviews')){
        el.style.display='none';
      }
    });
  }

  function sync(){
    install();
    if(active()) cleanup();
  }

  function start(){
    install();
    sync();
    document.addEventListener('click',function(){setTimeout(sync,350)},true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
