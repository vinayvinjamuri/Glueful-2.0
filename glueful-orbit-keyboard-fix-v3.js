/* Glueful Orbit Android IME fix v3 — lock page scrolling while Orbit owns the viewport. */
(function(){
  'use strict';
  const ROOT='glueful-orbit-v2-root',STYLE='glueful-orbit-keyboard-fix-v3-style';
  let savedY=0,locked=false;
  function install(){
    if(!document.getElementById(STYLE)){
      const s=document.createElement('style');s.id=STYLE;s.textContent=`
        #${ROOT}.open{position:fixed!important;inset:0!important;width:100%!important;height:100dvh!important;max-height:100dvh!important;transform:none!important;margin:0!important;overflow:hidden!important;overscroll-behavior:none!important}
        #${ROOT}.open .orbit5-app{position:relative!important;width:100%!important;height:100%!important;min-height:0!important;max-height:100%!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
        #${ROOT}.open .orbit5-head{flex:0 0 auto!important;position:relative!important;z-index:60!important}
        #${ROOT}.open .orbit5-messages,#${ROOT}.open .orbit5-main{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important}
        #${ROOT}.open .orbit5-composer{flex:0 0 auto!important;position:absolute!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;z-index:100!important}
        html.glueful-orbit-ime,body.glueful-orbit-ime{overflow:hidden!important;overscroll-behavior:none!important}
      `;document.head.appendChild(s);
    }
  }
  function lock(){
    if(locked)return;locked=true;savedY=window.scrollY||document.documentElement.scrollTop||0;
    document.documentElement.classList.add('glueful-orbit-ime');document.body.classList.add('glueful-orbit-ime');
    window.scrollTo(0,0);
  }
  function unlock(){
    if(!locked)return;locked=false;document.documentElement.classList.remove('glueful-orbit-ime');document.body.classList.remove('glueful-orbit-ime');
    if(savedY)window.scrollTo(0,savedY);
  }
  function sync(){
    install();const r=document.getElementById(ROOT);if(!r)return;
    if(r.classList.contains('open')){
      lock();
      r.style.setProperty('top','0','important');r.style.setProperty('left','0','important');r.style.setProperty('right','0','important');r.style.setProperty('bottom','auto','important');r.style.setProperty('height','100dvh','important');r.style.setProperty('transform','none','important');
    }else unlock();
  }
  function boot(){
    install();
    const observer=new MutationObserver(sync);observer.observe(document.body,{attributes:true,attributeFilter:['class'],subtree:true});
    document.addEventListener('focusin',e=>{if(e.target.closest?.('#'+ROOT+' .orbit5-input'))lock()},true);
    document.addEventListener('focusout',e=>{if(e.target.closest?.('#'+ROOT+' .orbit5-input'))setTimeout(sync,50)},true);
    window.addEventListener('resize',sync,{passive:true});
    sync();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
