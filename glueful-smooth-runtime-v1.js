/* Glueful — Smooth Runtime V2
 * App-wide, non-invasive rendering pass.
 * Performance-safe: never walks the entire DOM or calls getComputedStyle
 * on every element after a mutation.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_SMOOTH_RUNTIME_V2__) return;
  window.__GLUEFUL_SMOOTH_RUNTIME_V2__=true;

  const SCROLL_SELECTOR='[data-scroll],.g15-rail,.g15-company-rail,.g15-latest-rail,.g15-panel,.orbit5-messages,.ov2-chat-messages';

  function markScroll(el){
    if(!el || el.nodeType!==1 || el.dataset.gluefulSmooth==='1') return;
    const cs=getComputedStyle(el);
    if(cs.overflowY==='auto'||cs.overflowY==='scroll'||cs.overflowX==='auto'||cs.overflowX==='scroll'){
      el.dataset.gluefulSmooth='1';
      el.style.webkitOverflowScrolling='touch';
      el.style.overscrollBehavior='contain';
    }
  }

  function optimizeImages(root){
    if(!root) return;
    if(root.nodeType===1 && root.tagName==='IMG') optimizeImage(root);
    root.querySelectorAll?.('img').forEach(optimizeImage);
  }

  function optimizeImage(img){
    if(!img.hasAttribute('decoding')) img.decoding='async';
    if(!img.hasAttribute('fetchpriority') && !img.complete) img.fetchPriority='low';
  }

  function scan(root=document){
    if(root.nodeType!==1 && root!==document) return;
    if(root.nodeType===1) markScroll(root);
    root.querySelectorAll?.(SCROLL_SELECTOR).forEach(markScroll);
    optimizeImages(root);
  }

  function installStyle(){
    if(document.getElementById('glueful-smooth-runtime-style')) return;
    const s=document.createElement('style');
    s.id='glueful-smooth-runtime-style';
    s.textContent='button,a,[role="button"],input,textarea,select{-webkit-tap-highlight-color:transparent;}';
    document.head.appendChild(s);
  }

  function boot(){
    installStyle();
    scan(document);
    if(!document.body || window.__GLUEFUL_SMOOTH_OBSERVER__) return;

    let queued=false;
    let pending=[];
    const flush=()=>{
      queued=false;
      const nodes=pending;
      pending=[];
      nodes.forEach(n=>{if(n.nodeType===1)scan(n);});
    };

    window.__GLUEFUL_SMOOTH_OBSERVER__=new MutationObserver(mutations=>{
      for(const m of mutations){
        for(const n of m.addedNodes){
          if(n.nodeType===1) pending.push(n);
        }
      }
      if(pending.length&&!queued){
        queued=true;
        requestAnimationFrame(flush);
      }
    });
    window.__GLUEFUL_SMOOTH_OBSERVER__.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
