/* Glueful — Smooth Runtime V1
 * App-wide, non-invasive rendering pass.
 * Keeps feature logic untouched and only improves compositor behavior,
 * image decoding, and touch scrolling.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_SMOOTH_RUNTIME_V1__) return;
  window.__GLUEFUL_SMOOTH_RUNTIME_V1__=true;

  function mark(el){
    if(!el || el.nodeType!==1 || el.dataset.gluefulSmooth==='1') return;
    el.dataset.gluefulSmooth='1';
    const cs=getComputedStyle(el);
    const oy=cs.overflowY;
    const ox=cs.overflowX;
    if(oy==='auto'||oy==='scroll'||ox==='auto'||ox==='scroll'){
      el.style.webkitOverflowScrolling='touch';
      el.style.overscrollBehavior='contain';
    }
  }

  function optimizeImages(root){
    root.querySelectorAll?.('img').forEach(img=>{
      if(!img.hasAttribute('decoding')) img.decoding='async';
      if(!img.hasAttribute('fetchpriority') && !img.complete) img.fetchPriority='low';
    });
  }

  function scan(root=document){
    if(root.nodeType!==1 && root!==document) return;
    if(root.nodeType===1) mark(root);
    root.querySelectorAll?.('*').forEach(mark);
    optimizeImages(root);
  }

  function installStyle(){
    if(document.getElementById('glueful-smooth-runtime-style')) return;
    const s=document.createElement('style');
    s.id='glueful-smooth-runtime-style';
    s.textContent=`
      button,a,[role="button"],input,textarea,select{ -webkit-tap-highlight-color:transparent; }
    `;
    document.head.appendChild(s);
  }

  function boot(){
    installStyle();
    scan(document);
    if(document.body && !window.__GLUEFUL_SMOOTH_OBSERVER__){
      window.__GLUEFUL_SMOOTH_OBSERVER__=new MutationObserver(mutations=>{
        for(const m of mutations){
          for(const n of m.addedNodes){
            if(n.nodeType===1) scan(n);
          }
        }
      });
      window.__GLUEFUL_SMOOTH_OBSERVER__.observe(document.body,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
