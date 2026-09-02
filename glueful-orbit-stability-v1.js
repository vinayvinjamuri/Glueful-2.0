/* Glueful Orbit stability patch v1 */
(function(){
  'use strict';
  function start(){
    var nav=document.getElementById('bottom-nav');
    if(!nav) return;
    var item=document.getElementById('glueful-orbit-nav-item');
    if(!item){
      item=document.createElement('button');
      item.id='glueful-orbit-nav-item';
      item.type='button';
      item.className='nav-btn';
      item.innerHTML='<span class="orbit-nav-icon">✦</span><span class="orbit-nav-label">Orbit</span>';
      item.onclick=function(){ if(typeof window.gluefulOpenOrbit==='function') window.gluefulOpenOrbit(); };
      nav.appendChild(item);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
