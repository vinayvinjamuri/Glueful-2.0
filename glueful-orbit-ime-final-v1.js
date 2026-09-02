/* Orbit IME final v1 — targets the actual orbit5 shell only. */
(function(){
  'use strict';
  if(window.__GLUEFUL_ORBIT_IME_FINAL_V1__)return;
  window.__GLUEFUL_ORBIT_IME_FINAL_V1__=true;
  const ROOT='glueful-orbit-v2-root',STYLE='glueful-orbit-ime-final-style';
  function install(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement('style');s.id=STYLE;s.textContent=`
      #${ROOT}.open{position:fixed!important;inset:0!important;width:100%!important;height:var(--orbit-visible-height,100dvh)!important;max-height:var(--orbit-visible-height,100dvh)!important;transform:none!important;overflow:hidden!important}
      #${ROOT}.open .orbit5-app{position:relative!important;width:100%!important;height:100%!important;min-height:0!important;max-height:100%!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;transform:none!important}
      #${ROOT}.open .orbit5-head{flex:0 0 calc(64px + env(safe-area-inset-top))!important;height:calc(64px + env(safe-area-inset-top))!important;min-height:calc(64px + env(safe-area-inset-top))!important;position:relative!important;z-index:100!important;transform:none!important;align-self:stretch!important;display:flex!important;align-items:center!important;gap:10px!important;padding:env(safe-area-inset-top) 14px 0!important;box-sizing:border-box!important}
      #${ROOT}.open .orbit5-head > *{transform:translateY(-4px)!important}
      #${ROOT}.open .orbit5-messages{flex:1 1 auto!important;min-height:0!important;height:auto!important;overflow-y:auto!important;overflow-x:hidden!important;transform:none!important}
      #${ROOT}.open .orbit5-composer{flex:0 0 auto!important;position:relative!important;left:auto!important;right:auto!important;bottom:auto!important;width:100%!important;z-index:101!important;transform:none!important}
      #${ROOT}.open .orbit5-input{font-size:16px!important;transform:none!important}
    `;document.head.appendChild(s)
  }
  function sync(){
    const r=document.getElementById(ROOT);if(!r?.classList.contains('open'))return;
    const vv=window.visualViewport;const h=Math.max(320,Math.round(vv?.height||window.innerHeight));const top=Math.max(0,Math.round(vv?.offsetTop||0));
    r.style.setProperty('--orbit-visible-height',h+'px');r.style.setProperty('top',top+'px','important');r.style.setProperty('bottom','auto','important');r.style.setProperty('height',h+'px','important');
  }
  function lockPage(){
    const r=document.getElementById(ROOT);if(!r?.classList.contains('open'))return;
    document.documentElement.style.setProperty('overflow','hidden','important');document.body.style.setProperty('overflow','hidden','important');window.scrollTo(0,0);
    requestAnimationFrame(sync);setTimeout(sync,180);setTimeout(sync,420);
  }
  function boot(){
    install();
    document.addEventListener('focusin',e=>{if(e.target?.closest?.('#'+ROOT+' .orbit5-input'))lockPage()},{passive:true});
    window.visualViewport?.addEventListener('resize',()=>{const r=document.getElementById(ROOT);if(r?.classList.contains('open'))sync()},{passive:true});
    window.addEventListener('resize',()=>{const r=document.getElementById(ROOT);if(r?.classList.contains('open'))sync()},{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
