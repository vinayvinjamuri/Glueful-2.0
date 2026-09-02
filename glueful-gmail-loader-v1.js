/* Glueful runtime loader v39 */
(function(){
  "use strict";

  function load(src,onload){
    const existing=document.querySelector(`script[data-glueful-runtime-src="${src}"]`);
    if(existing){ if(typeof onload==='function' && existing.dataset.gluefulRuntimeLoaded==='1') onload(); return existing; }
    const s=document.createElement('script');
    s.src=src;
    s.async=true;
    s.dataset.gluefulRuntimeSrc=src;
    s.onload=()=>{s.dataset.gluefulRuntimeLoaded='1';if(typeof onload==='function')onload();};
    s.onerror=e=>console.warn('[Glueful] runtime failed:',src,e);
    document.head.appendChild(s);
    return s;
  }

  function isMobile(){ return matchMedia('(max-width:700px)').matches; }

  function guard(){
    const id='glueful-sync-control-guard-v3';
    if(!document.getElementById(id)){
      const s=document.createElement('style');
      s.id=id;
      s.textContent='@media(max-width:700px){#glueful-dashboard-gmail-sync{display:none!important;visibility:hidden!important;pointer-events:none!important}}';
      document.head.appendChild(s);
    }
    const remove=()=>{
      if(!isMobile()) return;
      document.getElementById('glueful-dashboard-gmail-sync')?.remove();
    };
    remove();
    new MutationObserver(remove).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class','hidden']});
    addEventListener('resize',remove,{passive:true});
  }

  function normalizeText(value){
    return String(value||'').replace(/\s+/g,' ').trim().toLowerCase();
  }

  /*
   * The account sheet is created dynamically and its exact row element can
   * vary between dashboard revisions. Match the visible row by its exact
   * label instead of requiring a particular CSS class/tag.
   */
  function gmailEntry(node){
    if(!(node instanceof Element)) return false;
    if(node.closest('.glueful-gmail-modal-backdrop')) return false;
    const text=normalizeText(node.innerText || node.textContent);
    return text==='connected services' || text==='gmail integration';
  }

  let gmailLoading=null;
  function ensureGmailOpen(){
    if(typeof window.openGmailIntegration==='function'){
      window.openGmailIntegration();
      return;
    }
    if(!gmailLoading){
      gmailLoading=new Promise(resolve=>{
        const s=load('./glueful-gmail-integration-v1.js?v=13',resolve);
        if(s?.dataset.gluefulRuntimeLoaded==='1') resolve();
      });
    }
    gmailLoading.then(()=>{
      if(typeof window.openGmailIntegration==='function') window.openGmailIntegration();
    });
  }

  function installEntryGuard(){
    if(window.__gluefulGmailInstantEntry) return;
    window.__gluefulGmailInstantEntry=true;
    document.addEventListener('click',event=>{
      let node=event.target instanceof Element?event.target:event.target?.parentElement;
      for(let i=0;node&&i<12;i++,node=node.parentElement){
        if(!gmailEntry(node)) continue;
        event.preventDefault();
        event.stopPropagation();
        if(event.stopImmediatePropagation) event.stopImmediatePropagation();
        ensureGmailOpen();
        return;
      }
    },true);
  }

  function start(){
    guard();
    installEntryGuard();
    /* Gmail is critical for the Connected Services entry, so load it immediately. */
    load('./glueful-gmail-integration-v1.js?v=13');
    load('./glueful-dashboard-fixed-v1.js?v=8');
    load('./glueful-dashboard-header-fix-v1.js?v=5');
    load('./glueful-dashboard-hamburger-v2.js?v=5');
    load('./glueful-dashboard-approved-v1.js?v=3');
    load('./glueful-orbit-bootstrap-v1.js?v=2',()=>load('./glueful-orbit-v2.js?v=6',()=>load('./glueful-orbit-ui-v3.js?v=11',()=>load('./glueful-orbit-ui-v16.js?v=2',()=>load('./glueful-orbit-ui-v17.js?v=1',()=>load('./glueful-orbit-ai-bridge-v1.js?v=1',()=>load('./glueful-orbit-navigation-v1.js?v=4')))))));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
