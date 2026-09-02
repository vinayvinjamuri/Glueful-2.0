/* Glueful Orbit keyboard fix v1 — keep the Orbit shell pinned to the visible viewport on Android. */
(function(){
  'use strict';
  var ROOT='glueful-orbit-v2-root', STYLE='glueful-orbit-keyboard-fix-v1-style';
  function install(){
    if(document.getElementById(STYLE))return;
    var s=document.createElement('style');s.id=STYLE;
    s.textContent='#'+ROOT+'.open{position:fixed!important;left:0!important;right:0!important;top:0!important;bottom:auto!important;width:100%!important;max-width:100%!important;height:100dvh!important;max-height:100dvh!important;transform:none!important;margin:0!important;overflow:hidden!important}#'+ROOT+'.open .orbit5-app{position:relative!important;width:100%!important;height:100%!important;min-height:0!important;max-height:100%!important;overflow:hidden!important}#'+ROOT+'.open .orbit5-messages{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:16px!important}#'+ROOT+'.open .orbit5-composer{position:absolute!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;z-index:50!important;box-sizing:border-box!important}';document.head.appendChild(s)
  }
  function sync(){
    var r=document.getElementById(ROOT);if(!r||!r.classList.contains('open'))return;
    r.style.setProperty('top','0px','important');
    r.style.setProperty('left','0px','important');
    r.style.setProperty('right','0px','important');
    r.style.setProperty('bottom','auto','important');
    r.style.setProperty('transform','none','important');
    var vv=window.visualViewport;
    if(vv&&vv.height){r.style.setProperty('height',Math.max(1,Math.round(vv.height))+'px','important');r.style.setProperty('max-height',Math.max(1,Math.round(vv.height))+'px','important')}
  }
  function bind(){
    install();sync();
    if(window.visualViewport&&!window.__GLUEFUL_ORBIT_KB_BOUND__){window.__GLUEFUL_ORBIT_KB_BOUND__=true;window.visualViewport.addEventListener('resize',sync,{passive:true});window.visualViewport.addEventListener('scroll',sync,{passive:true})}
    document.addEventListener('focusin',function(e){if(e.target&&e.target.matches&&e.target.matches('#'+ROOT+' textarea.orbit5-input')){window.setTimeout(sync,0);window.setTimeout(sync,80);window.setTimeout(sync,250)}},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
