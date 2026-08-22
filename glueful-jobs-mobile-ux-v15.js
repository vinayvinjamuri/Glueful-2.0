/* Glueful Jobs V15 — native mobile carousel UX.
 * Keeps the Jobs renderer/data/ranking unchanged. No JS touch interception.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_MOBILE_UX_NATIVE_V1__) return;
  window.__GLUEFUL_JOBS_MOBILE_UX_NATIVE_V1__=true;
  const STYLE='g15-mobile-ux-native-v1';
  function injectStyle(){
    if(document.getElementById(STYLE)) return;
    const s=document.createElement('style'); s.id=STYLE;
    s.textContent=`
      #glueful-jobs-v15 .g15-rail,
      #glueful-jobs-v15 .g15-company-rail{
        display:flex!important;
        flex-wrap:nowrap!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior-x:contain!important;
        overscroll-behavior-y:auto!important;
        scroll-snap-type:x proximity!important;
        scroll-behavior:auto!important;
        touch-action:pan-x!important;
        scrollbar-width:none!important;
        -ms-overflow-style:none!important;
        gap:14px!important;
        padding-left:2px!important;
        padding-right:24px!important;
        cursor:grab!important;
      }
      #glueful-jobs-v15 .g15-rail::-webkit-scrollbar,
      #glueful-jobs-v15 .g15-company-rail::-webkit-scrollbar{display:none!important}
      #glueful-jobs-v15 .g15-rail>* ,
      #glueful-jobs-v15 .g15-company-rail>*{
        flex:0 0 auto!important;
        scroll-snap-align:start!important;
      }
      @media(max-width:600px){
        #glueful-jobs-v15 .g15-rail{padding-right:28px!important}
        #glueful-jobs-v15 .g15-card{
          flex:0 0 calc(100vw - 72px)!important;
          width:calc(100vw - 72px)!important;
          max-width:none!important;
        }
        #glueful-jobs-v15 .g15-company{
          flex:0 0 132px!important;
          width:132px!important;
        }
      }
      #glueful-jobs-v15 .g15-mobile-rail-wrap{position:relative;margin:0}
      #glueful-jobs-v15 .g15-mobile-dots{display:flex;justify-content:center;gap:5px;margin:-1px 0 12px;min-height:7px}
      #glueful-jobs-v15 .g15-mobile-dot{width:5px;height:5px;border-radius:999px;background:#454c5b;transition:width .14s ease,background .14s ease}
      #glueful-jobs-v15 .g15-mobile-dot.active{width:16px;background:linear-gradient(90deg,#7b36ff,#4b7cff)}
      #glueful-jobs-v15 .g15-mobile-swipe-hint{display:none;color:#697184;font-size:9px;font-weight:700;margin:-3px 0 8px;text-align:right}
      @media(max-width:600px){#glueful-jobs-v15 .g15-mobile-swipe-hint{display:block}}
    `;
    document.head.appendChild(s);
  }
  function dotsFor(rail){
    const parent=rail.parentElement;if(!parent)return;
    if(!parent.classList.contains('g15-mobile-rail-wrap'))parent.classList.add('g15-mobile-rail-wrap');
    if(!parent.querySelector('.g15-mobile-swipe-hint')){
      const hint=document.createElement('div');hint.className='g15-mobile-swipe-hint';
      hint.textContent=rail.classList.contains('g15-company-rail')?'Swipe to explore companies':'Swipe to explore relevant jobs';
      parent.insertBefore(hint,rail);
    }
    const children=[...rail.children];if(children.length<2)return;
    let dots=parent.querySelector('.g15-mobile-dots');
    if(!dots){dots=document.createElement('div');dots.className='g15-mobile-dots';parent.appendChild(dots)}
    const count=Math.min(children.length,8);
    if(dots.childElementCount!==count){dots.replaceChildren(...Array.from({length:count},(_,i)=>{const d=document.createElement('span');d.className='g15-mobile-dot'+(i===0?' active':'');return d;}));}
    const update=()=>{
      const max=Math.max(0,rail.scrollWidth-rail.clientWidth),ratio=max?rail.scrollLeft/max:0;
      const idx=Math.max(0,Math.min(count-1,Math.round(ratio*(count-1))));
      [...dots.children].forEach((d,i)=>d.classList.toggle('active',i===idx));
    };
    if(rail.dataset.g15DotsBound!=='1'){
      rail.dataset.g15DotsBound='1';rail.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update,{passive:true});
    }
    update();
  }
  function run(){
    const root=document.getElementById('glueful-jobs-v15');if(!root)return false;injectStyle();
    root.querySelectorAll('.g15-rail').forEach(dotsFor);root.querySelectorAll('.g15-company-rail').forEach(dotsFor);return true;
  }
  function boot(){
    if(!run())return;
    if(window.__GLUEFUL_JOBS_MOBILE_UX_OBSERVER_NATIVE_V1__)return;
    const root=document.getElementById('glueful-jobs-v15');if(!root)return;
    let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(run,100)};
    const observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true});
    window.__GLUEFUL_JOBS_MOBILE_UX_OBSERVER_NATIVE_V1__=observer;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();