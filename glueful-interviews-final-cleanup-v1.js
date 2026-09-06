/* Glueful Interviews — Final presentation cleanup V2
 * Keeps one authoritative shell and hides the legacy empty presentation.
 * Existing interview data/actions are never deleted.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_INTERVIEWS_FINAL_CLEANUP_V2__) return;
  window.__GLUEFUL_INTERVIEWS_FINAL_CLEANUP_V2__=true;
  const VIEW_ID='view-interviews';
  const SHELLS=['.glueful-interviews-reference-v6-shell','.glueful-interviews-final-v1-shell'];
  const STYLE_ID='glueful-interviews-final-cleanup-v2-style';
  function install(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;(document.head||document.documentElement).appendChild(s);}
    s.textContent='@media(min-width:1280px){html body #'+VIEW_ID+'{left:248px!important;right:0!important;width:auto!important;margin-left:0!important;box-sizing:border-box!important}}';
  }
  function isCard(el){return !!(el&&el.querySelector&&el.querySelector('.interview-card,.interview-item,[class*="interview-card"],[data-interview-id]'));}
  function cleanup(){
    const v=document.getElementById(VIEW_ID);if(!v)return;
    const shells=[];SHELLS.forEach(sel=>v.querySelectorAll(sel).forEach(x=>shells.push(x)));
    if(!shells.length)return;
    const keep=shells[shells.length-1];
    shells.forEach(x=>{if(x!==keep)x.remove();});
    const hasCards=v.querySelector('.interview-card,.interview-item,[class*="interview-card"],[data-interview-id]');
    if(!hasCards){
      Array.from(v.children).forEach(el=>{
        if(el===keep)return;
        el.style.setProperty('display','none','important');
      });
    }else{
      Array.from(v.children).forEach(el=>{
        if(el===keep)return;
        if(el.matches('.view-title,[class*="interview-empty"],[class*="empty-state"]'))el.style.setProperty('display','none','important');
      });
    }
    install();
  }
  function start(){
    cleanup();
    [50,150,350,750,1500,3000,5000].forEach(ms=>setTimeout(cleanup,ms));
    if(document.documentElement)new MutationObserver(cleanup).observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
