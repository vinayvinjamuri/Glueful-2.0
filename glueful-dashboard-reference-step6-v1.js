/* Glueful Dashboard Reference Step 6
 * Removes duplicate dashboard stats rendering and the leftover dashboard interview shell.
 * The actual Interviews view remains untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP6_V2__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP6_V2__=true;

  const STYLE_ID='glueful-dashboard-reference-step6-v2-style';

  function active(){
    const d=document.getElementById('view-dashboard');
    return !!d&&(d.classList.contains('active')||d.style.display==='block');
  }

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      body.glueful-apple-dashboard #view-dashboard #dashboard-interviews{display:none!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important}
      body.glueful-apple-dashboard #view-dashboard .glueful-reference-duplicate-stats{display:none!important}
    `;
    document.head.appendChild(s);
  }

  function cleanup(){
    const d=document.getElementById('view-dashboard');
    if(!d||!active()) return;

    const grids=Array.from(d.querySelectorAll('.stat-grid,.stats-grid'));
    grids.forEach((grid,index)=>{
      if(index>0) grid.classList.add('glueful-reference-duplicate-stats');
    });

    const interviews=d.querySelector('#dashboard-interviews');
    if(interviews){
      interviews.style.display='none';
      interviews.style.height='0';
      interviews.style.minHeight='0';
      interviews.style.margin='0';
      interviews.style.padding='0';
    }

    /* The legacy heading is sometimes outside #dashboard-interviews and is
       rendered as a div rather than h1/h2/h3. Hide only an exact dashboard
       heading match, never arbitrary text containing these words. */
    d.querySelectorAll('*').forEach(el=>{
      if(el===d || el.id===STYLE_ID || el.closest('#'+STYLE_ID)) return;
      const text=(el.textContent||'').trim().replace(/\s+/g,' ').toUpperCase();
      if(text==='UPCOMING INTERVIEWS' && !el.querySelector('*')){
        el.style.display='none';
        el.style.height='0';
        el.style.margin='0';
        el.style.padding='0';
      }
    });
  }

  function sync(){install();if(active())cleanup();}

  function start(){
    install();
    sync();
    document.addEventListener('click',function(){setTimeout(sync,350)},true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
