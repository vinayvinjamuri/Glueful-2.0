/* Glueful — Applications Final Alignment V11
 * Corrects the remaining desktop/tablet workspace offset and removes the
 * dashboard hamburger from non-dashboard views. Presentation only.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_FINAL_ALIGNMENT_V11__) return;
  window.__GLUEFUL_APPLICATIONS_FINAL_ALIGNMENT_V11__=true;
  const STYLE_ID='glueful-applications-final-alignment-v11-style';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        body #view-applications{
          position:relative!important;left:-380px!important;
          width:916px!important;max-width:916px!important;
          margin-left:373px!important;margin-right:0!important;
          padding:32px 0 48px!important;box-sizing:border-box!important;
          overflow:visible!important;height:auto!important;max-height:none!important;
          transform:none!important;
        }
        body #view-applications .view-header{
          position:relative!important;top:0!important;width:100%!important;
          margin:0 0 28px!important;padding:0!important;
        }
        body #glueful-applications-left-v1{
          position:fixed!important;left:239px!important;top:208px!important;
          width:276px!important;display:flex!important;flex-direction:column!important;
          gap:16px!important;z-index:20!important;
        }
        body #glueful-applications-workspace-v1{
          position:fixed!important;right:28px!important;top:208px!important;
          width:286px!important;display:flex!important;flex-direction:column!important;
          gap:16px!important;z-index:20!important;
        }
        body:has(#view-applications.active) #glueful-dashboard-hamburger,
        body:has(#view-applications.active) [aria-label="Open navigation menu"],
        body:has(#view-applications.active) [title="Open navigation menu"],
        body:has(#view-applications.active) #bottom-nav,
        body:has(#view-applications.active) .bottom-nav{
          display:none!important;visibility:hidden!important;pointer-events:none!important;
        }
      }
      @media(min-width:701px) and (max-width:1100px){
        body:has(#view-applications.active) #glueful-dashboard-hamburger,
        body:has(#view-applications.active) [aria-label="Open navigation menu"],
        body:has(#view-applications.active) [title="Open navigation menu"],
        body:has(#view-applications.active) #bottom-nav,
        body:has(#view-applications.active) .bottom-nav{
          display:none!important;visibility:hidden!important;pointer-events:none!important;
        }
      }
    `;
    document.head.appendChild(s);
  }
  function active(){const v=document.getElementById('view-applications');return !!v&&(v.classList.contains('active')||v.style.display==='block');}
  function removeMenu(){if(!active())return;const b=document.getElementById('glueful-dashboard-hamburger');if(b)b.remove();document.querySelectorAll('[aria-label="Open navigation menu"],[title="Open navigation menu"]').forEach(function(el){if(el.id!=='glueful-dashboard-hamburger')el.style.setProperty('display','none','important');});}
  function resetScroll(){if(!active())return;try{history.scrollRestoration='manual';}catch(e){};[document.scrollingElement,document.documentElement,document.body,document.getElementById('view-applications')].forEach(function(el){if(el)el.scrollTop=0;});try{window.scrollTo(0,0);}catch(e){}}
  function boot(){install();removeMenu();resetScroll();requestAnimationFrame(function(){removeMenu();resetScroll();});setTimeout(function(){removeMenu();resetScroll();},100);setTimeout(function(){removeMenu();resetScroll();},400);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
