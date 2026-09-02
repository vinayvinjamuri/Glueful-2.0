/* Glueful Orbit keyboard fix v2 — CSS-only viewport ownership to avoid Android IME jank. */
(function(){
  'use strict';
  var ROOT='glueful-orbit-v2-root', STYLE='glueful-orbit-keyboard-fix-v2-style';
  function install(){
    if(document.getElementById(STYLE))return;
    var s=document.createElement('style');s.id=STYLE;
    s.textContent='#'+ROOT+'.open{position:fixed!important;left:0!important;right:0!important;top:0!important;bottom:auto!important;width:100%!important;max-width:100%!important;height:100dvh!important;max-height:100dvh!important;transform:none!important;margin:0!important;overflow:hidden!important}#'+ROOT+'.open .orbit5-app{position:relative!important;width:100%!important;height:100%!important;min-height:0!important;max-height:100%!important;overflow:hidden!important}#'+ROOT+'.open .orbit5-main,#'+ROOT+'.open .orbit5-messages{min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important}#'+ROOT+'.open .orbit5-composer{position:absolute!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;z-index:50!important;box-sizing:border-box!important}#'+ROOT+'.open .orbit5-input{font-size:16px!important;line-height:21px!important;touch-action:manipulation!important}';document.head.appendChild(s)
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
