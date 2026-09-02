/* Glueful Orbit stability patch v1 */
(function(){
  'use strict';
  var NAV='glueful-orbit-nav-item', ROOT='glueful-orbit-v2-root';
  function nav(){
    var bar=document.getElementById('bottom-nav');
    if(!bar) return;
    var item=document.getElementById(NAV);
    if(!item){
      item=document.createElement('button'); item.id=NAV; item.type='button'; item.className='nav-btn';
      item.innerHTML='<span class="orbit-nav-icon">✦</span><span class="orbit-nav-label">Orbit</span>';
      item.onclick=function(e){e.preventDefault(); if(typeof window.gluefulOpenOrbit==='function') window.gluefulOpenOrbit(); setTimeout(fallback,1200); setTimeout(fallback,2500);};
    }
    if(item.parentElement!==bar) bar.appendChild(item);
    item.classList.add('nav-btn');
  }
  function hideNetwork(){
    var all=document.querySelectorAll('h1,h2,h3,h4,h5,div,span');
    for(var i=0;i<all.length;i++){
      var el=all[i];
      if(el.children.length===0 && (el.textContent||'').trim().toLowerCase()==='job network'){
        var p=el;
        for(var j=0;j<6 && p;j++,p=p.parentElement){
          var t=(p.textContent||'').toLowerCase();
          if(t.indexOf('company discovery')>=0 && t.indexOf('active jobs')>=0){p.style.setProperty('display','none','important');break;}
        }
        break;
      }
    }
  }
  function fallback(){
    var r=document.getElementById(ROOT);
    if(!r || !r.classList.contains('open') || r.querySelector('.orbit5-app')) return;
    r.innerHTML='<div class="orbit5-app"><header class="orbit5-head"><div class="orbit5-brand">✦</div><div class="orbit5-head-main"><div class="orbit5-title">Orbit AI</div><div class="orbit5-sub">Your career copilot</div></div><button class="orbit5-icon" id="orbit-stability-close">×</button></header><main class="orbit5-main"><section class="orbit5-welcome"><h1>What are we working on?</h1><p>Ask Orbit about a job, your resume, interview preparation, technical topics, or your career plan.</p></section><div class="orbit5-card"><div class="orbit5-card-title">Ready to help</div><div class="orbit5-card-text">Orbit is ready. Ask a career question below.</div></div></main><form class="orbit5-composer" id="orbit-stability-form"><textarea class="orbit5-input" placeholder="Ask Orbit anything…"></textarea><button class="orbit5-send" type="submit">➤</button></form></div>';
    document.getElementById('orbit-stability-close').onclick=function(){r.classList.remove('open');};
    document.getElementById('orbit-stability-form').onsubmit=function(e){e.preventDefault();var input=this.querySelector('textarea'),msg=input.value.trim();if(!msg)return;input.value='';var main=r.querySelector('main'),u=document.createElement('div');u.className='orbit5-message user';u.textContent=msg;main.appendChild(u);var t=document.createElement('div');t.className='orbit5-thinking';t.textContent='Orbit is thinking';main.appendChild(t);if(window.__GLUEFUL_ORBIT_ASK__) window.__GLUEFUL_ORBIT_ASK__(msg,r,t);};
  }
  function start(){
    nav(); hideNetwork();
    [300,800,1600,3000,6000,10000].forEach(function(t){setTimeout(function(){nav();hideNetwork();},t);});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
