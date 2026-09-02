/* Glueful Orbit keyboard fix v3 — lock document scroll on IME focus without visualViewport loops. */
(function(){
  'use strict';
  var ROOT='glueful-orbit-v2-root', STYLE='glueful-orbit-keyboard-fix-v3-style';
  function install(){
    if(document.getElementById(STYLE))return;
    var s=document.createElement('style');s.id=STYLE;
    s.textContent='#'+ROOT+'.open{position:fixed!important;left:0!important;right:0!important;top:0!important;bottom:auto!important;width:100%!important;max-width:100%!important;height:100dvh!important;max-height:100dvh!important;transform:none!important;margin:0!important;overflow:hidden!important;contain:layout paint!important}#'+ROOT+'.open .orbit5-app{position:relative!important;width:100%!important;height:100%!important;min-height:0!important;max-height:100%!important;overflow:hidden!important}#'+ROOT+'.open .orbit5-head{position:relative!important;top:auto!important;transform:none!important;z-index:60!important;flex:0 0 auto!important}#'+ROOT+'.open .orbit5-main{position:relative!important;min-height:0!important;overflow:hidden!important}#'+ROOT+'.open .orbit5-messages{min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important}#'+ROOT+'.open .orbit5-composer{position:absolute!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;z-index:100!important;box-sizing:border-box!important}#'+ROOT+'.open .orbit5-input{font-size:16px!important;line-height:21px!important;touch-action:manipulation!important}';document.head.appendChild(s)
  }
  function lock(){
    var r=document.getElementById(ROOT);if(!r||!r.classList.contains('open'))return;
    r.style.setProperty('position','fixed','important');r.style.setProperty('top','0','important');r.style.setProperty('left','0','important');r.style.setProperty('right','0','important');r.style.setProperty('transform','none','important');
    window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;
  }
  function boot(){
    install();
    document.addEventListener('focusin',function(e){if(e.target?.closest?.('#'+ROOT+' .orbit5-input'))requestAnimationFrame(lock)},{passive:true});
    window.addEventListener('resize',function(){var r=document.getElementById(ROOT);if(r?.classList.contains('open'))requestAnimationFrame(lock)},{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
