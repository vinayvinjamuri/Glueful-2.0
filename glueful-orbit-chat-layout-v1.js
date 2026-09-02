/* Glueful Orbit chat layout v2: chat-first home, applications drawer, stable mobile header. */
(function(){
  'use strict';
  var ROOT='glueful-orbit-v2-root', STYLE='glueful-orbit-chat-layout-v2';
  function install(){
    if(document.getElementById(STYLE)) return;
    var s=document.createElement('style'); s.id=STYLE;
    s.textContent='#'+ROOT+'.open{overflow:hidden!important}#'+ROOT+'.open .orbit5-app{position:relative!important;height:100%!important;min-height:0!important;overflow:hidden!important}#'+ROOT+'.open .orbit5-head{height:calc(64px + env(safe-area-inset-top))!important;min-height:calc(64px + env(safe-area-inset-top))!important;padding:env(safe-area-inset-top) 14px 0!important;align-items:center!important;box-sizing:border-box!important;overflow:hidden!important}#'+ROOT+'.open .orbit5-main,#'+ROOT+'.open .orbit5-messages{padding-bottom:92px!important}#'+ROOT+'.open .orbit5-composer{position:absolute!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;z-index:20!important}#orbit-app-drawer{position:absolute;inset:calc(64px + env(safe-area-inset-top)) 0 0 0;z-index:30;background:#070b12;overflow:auto;padding:14px}#orbit-app-drawer .orbit5-section{margin-top:0!important}#orbit-app-drawer .orbit5-job{display:flex!important}#orbit-app-drawer .orbit-drawer-close{position:absolute;right:12px;top:10px;width:38px;height:38px;border:0;border-radius:11px;background:#172235;color:#fff;font-size:22px}#orbit-app-drawer .orbit-drawer-title{font-size:18px;font-weight:800;padding:8px 50px 16px 2px}#orbit-applications-button{border:1px solid #33445e;background:#17253a;color:#eef3fb;border-radius:13px;padding:10px 14px;font:700 13px inherit;cursor:pointer;white-space:nowrap;flex:0 0 auto}';
    document.head.appendChild(s);
  }
  function transform(){
    var r=document.getElementById(ROOT); if(!r||!r.classList.contains('open')) return;
    var app=r.querySelector('.orbit5-app'); if(!app) return;
    var section=Array.from(app.querySelectorAll('.orbit5-section')).find(function(x){return /your applications/i.test(x.textContent||'')});
    var jobs=Array.from(app.querySelectorAll('.orbit5-job'));
    var header=app.querySelector('.orbit5-head');
    if(section && jobs.length && !r.querySelector('#orbit-app-drawer')){
      var drawer=document.createElement('div'); drawer.id='orbit-app-drawer'; drawer.hidden=true;
      var title=document.createElement('div'); title.className='orbit-drawer-title'; title.textContent='Your applications';
      var close=document.createElement('button'); close.className='orbit-drawer-close'; close.type='button'; close.textContent='×'; close.setAttribute('aria-label','Close applications');
      close.onclick=function(){drawer.hidden=true};
      drawer.appendChild(title); drawer.appendChild(close); jobs.forEach(function(j){drawer.appendChild(j)}); r.appendChild(drawer);
      section.remove();
    }
    if(header && !header.querySelector('#orbit-applications-button')){
      var b=document.createElement('button'); b.id='orbit-applications-button'; b.type='button'; b.textContent='Applications';
      b.onclick=function(){var d=r.querySelector('#orbit-app-drawer');if(d)d.hidden=false};
      var closeBtn=header.querySelector('[data-action="close"]');
      header.insertBefore(b,closeBtn||null);
    }
  }
  function start(){install();transform();[200,600,1200,2500,5000].forEach(function(t){setTimeout(transform,t)});new MutationObserver(function(){requestAnimationFrame(transform)}).observe(document.body,{subtree:true,childList:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start); else start();
})();
