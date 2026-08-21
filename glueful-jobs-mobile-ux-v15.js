/* Glueful Jobs V15 — mobile swipe UX layer.
 * Presentation only. Keeps V15 data, ranking, saves and links unchanged.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_MOBILE_UX_V15__) return;
  window.__GLUEFUL_JOBS_MOBILE_UX_V15__=true;

  const STYLE='g15-mobile-ux-v15-style';
  const safe=s=>String(s||'').replace(/\s+/g,' ').trim();

  function injectStyle(){
    if(document.getElementById(STYLE)) return;
    const s=document.createElement('style'); s.id=STYLE;
    s.textContent=`
      #glueful-jobs-v15 .g15-rail,
      #glueful-jobs-v15 .g15-company-rail{
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior-x:contain!important;
        scroll-snap-type:x mandatory!important;
        scroll-behavior:smooth!important;
        touch-action:pan-x pan-y!important;
        scrollbar-width:none!important;
        padding-left:2px!important;padding-right:18px!important;
      }
      #glueful-jobs-v15 .g15-rail::-webkit-scrollbar,
      #glueful-jobs-v15 .g15-company-rail::-webkit-scrollbar{display:none!important}
      #glueful-jobs-v15 .g15-rail > .g15-card{
        scroll-snap-align:start!important;
        scroll-snap-stop:always!important;
      }
      #glueful-jobs-v15 .g15-company-rail > .g15-company{
        scroll-snap-align:start!important;
        scroll-snap-stop:always!important;
      }
      #glueful-jobs-v15 .g15-mobile-rail-wrap{position:relative;margin:0}
      #glueful-jobs-v15 .g15-mobile-dots{display:flex;justify-content:center;gap:5px;margin:-1px 0 12px;min-height:7px}
      #glueful-jobs-v15 .g15-mobile-dot{width:5px;height:5px;border-radius:999px;background:#454c5b;transition:all .18s ease}
      #glueful-jobs-v15 .g15-mobile-dot.active{width:16px;background:linear-gradient(90deg,#7b36ff,#4b7cff)}
      #glueful-jobs-v15 .g15-mobile-swipe-hint{display:none;color:#697184;font-size:9px;font-weight:700;margin:-3px 0 8px;text-align:right}
      #glueful-jobs-v15 .g15-card .g15-main strong{display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;overflow:hidden!important;white-space:normal!important;line-height:1.28!important}
      #glueful-jobs-v15 .g15-card .g15-main span,
      #glueful-jobs-v15 .g15-card .g15-main small{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #glueful-jobs-v15 .g15-company strong{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      @media(max-width:600px){
        #glueful-jobs-v15 .g15-mobile-swipe-hint{display:block}
        #glueful-jobs-v15 .g15-card{flex-basis:calc(100vw - 44px)!important;width:calc(100vw - 44px)!important}
        #glueful-jobs-v15 .g15-company{flex-basis:118px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function railLabel(rail,isCompanies){
    const parent=rail.parentElement;
    if(!parent) return;
    if(!parent.classList.contains('g15-mobile-rail-wrap')){
      parent.classList.add('g15-mobile-rail-wrap');
    }
    if(!parent.querySelector('.g15-mobile-swipe-hint')){
      const hint=document.createElement('div');
      hint.className='g15-mobile-swipe-hint';
      hint.textContent=isCompanies?'Swipe to explore companies':'Swipe to explore relevant jobs';
      parent.insertBefore(hint,rail);
    }
  }

  function dotsFor(rail){
    const parent=rail.parentElement;
    if(!parent) return;
    const children=[...rail.children];
    if(children.length<2) return;
    let dots=parent.querySelector('.g15-mobile-dots');
    if(!dots){dots=document.createElement('div');dots.className='g15-mobile-dots';parent.appendChild(dots)}
    const count=Math.min(children.length,8);
    dots.innerHTML='';
    for(let i=0;i<count;i++){
      const d=document.createElement('span');d.className='g15-mobile-dot'+(i===0?' active':'');dots.appendChild(d)
    }
    const update=()=>{
      const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
      const ratio=max?rail.scrollLeft/max:0;
      const idx=Math.max(0,Math.min(count-1,Math.round(ratio*(count-1))));
      [...dots.children].forEach((d,i)=>d.classList.toggle('active',i===idx));
    };
    if(rail.dataset.g15DotsBound!=='1'){
      rail.dataset.g15DotsBound='1';
      rail.addEventListener('scroll',update,{passive:true});
      window.addEventListener('resize',update,{passive:true});
      update();
    }
  }

  function bindKeyboard(rail){
    if(rail.dataset.g15SwipeKeyboard==='1') return;
    rail.dataset.g15SwipeKeyboard='1';
    rail.setAttribute('tabindex','0');
    rail.addEventListener('keydown',e=>{
      if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft') return;
      e.preventDefault();
      rail.scrollBy({left:(e.key==='ArrowRight'?1:-1)*Math.max(220,rail.clientWidth*.78),behavior:'smooth'});
    });
  }

  function polishRail(rail,isCompanies){
    rail.classList.add('g15-mobile-swipe-rail');
    rail.setAttribute('aria-label',isCompanies?'Top companies hiring — swipe horizontally':'Curated jobs — swipe horizontally');
    railLabel(rail,isCompanies);
    dotsFor(rail);
    bindKeyboard(rail);
  }

  function run(){
    const root=document.getElementById('glueful-jobs-v15');
    if(!root) return false;
    injectStyle();
    root.querySelectorAll('.g15-rail').forEach(r=>polishRail(r,false));
    root.querySelectorAll('.g15-company-rail').forEach(r=>polishRail(r,true));
    return true;
  }

  function boot(){
    run();
    if(window.__GLUEFUL_JOBS_MOBILE_UX_OBSERVER__) return;
    const observer=new MutationObserver(()=>{
      observer.disconnect();
      try{run()}finally{observer.observe(document.body,{childList:true,subtree:true})}
    });
    observer.observe(document.body,{childList:true,subtree:true});
    window.__GLUEFUL_JOBS_MOBILE_UX_OBSERVER__=observer;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();