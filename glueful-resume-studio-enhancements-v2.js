/* Glueful — Resume Studio Enhancements V2
 * Lifecycle hardening for the Word-style editor.
 * Keeps the last loaded resume as the discard baseline, makes Close deterministic,
 * and coordinates hub/import/profile/template actions with the editor state.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUME_STUDIO_ENHANCEMENTS_V2__) return;
  window.__GLUEFUL_RESUME_STUDIO_ENHANCEMENTS_V2__=true;

  const OVERLAY='glueful-resume-studio-v3-overlay';
  const EDITOR='glueful-word-editor';
  let baselineHtml='';
  let baselineTemplate='minimal';
  let baselineReady=false;
  let observed=false;

  const ov=()=>document.getElementById(OVERLAY);
  const ed=()=>document.getElementById(EDITOR);
  const templateValue=()=>ov()?.querySelector('[data-template-select]')?.value||ed()?.className.match(/\bg4-page\s+(\w+)/)?.[1]||'minimal';
  const accent={minimal:'#374151',modern:'#2563eb',technical:'#0f766e',academic:'#7c2d12',traditional:'#111827',executive:'#6d28d9'};

  function toast(msg){
    let n=document.getElementById('g4-lifecycle-toast');
    if(!n){n=document.createElement('div');n.id='g4-lifecycle-toast';n.style.cssText='position:fixed;right:20px;bottom:20px;z-index:200020;background:#182033;color:#fff;padding:10px 13px;border-radius:9px;font:650 11px Inter,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.24)';document.body.appendChild(n)}
    n.textContent=msg;clearTimeout(n._t);n._t=setTimeout(()=>n.remove(),2200);
  }

  function captureBaseline(){
    const e=ed();
    if(!e||!e.innerHTML.trim()) return false;
    baselineHtml=e.innerHTML;
    baselineTemplate=templateValue();
    baselineReady=true;
    return true;
  }

  function scheduleBaseline(){setTimeout(()=>{if(captureBaseline())syncUi()},180)}

  function syncUi(){
    const o=ov();if(!o)return;
    o.querySelectorAll('.g4-status').forEach(x=>x.textContent='Unsaved changes');
  }

  function clearUi(){
    const o=ov();if(!o)return;
    o.querySelectorAll('.g4-status').forEach(x=>x.textContent='Saved');
    o.querySelector('.g4-savebar')?.classList.remove('show');
  }

  function hardClose(){
    const o=ov();
    if(!o)return;
    o.classList.remove('open');
    o.setAttribute('aria-hidden','true');
    const e=ed();if(e)e.blur();
  }

  function closeWithGuard(){
    const o=ov();if(!o)return;
    const dirtyVisible=o.querySelector('.g4-savebar.show')||/Unsaved changes/i.test(o.querySelector('.g4-status')?.textContent||'');
    if(dirtyVisible&&!confirm('You have unsaved changes. Close without saving?')) return;
    hardClose();
  }

  function discard(){
    const e=ed();
    if(baselineReady&&e){
      e.innerHTML=baselineHtml;
      e.className='g4-page '+baselineTemplate;
      e.style.setProperty('--accent',accent[baselineTemplate]||accent.minimal);
      const s=ov()?.querySelector('[data-template-select]');if(s)s.value=baselineTemplate;
    }
    clearUi();
    try{sessionStorage.removeItem('glueful_resume_studio_draft_v1')}catch(_){ }
    toast(baselineReady?'Unsaved changes discarded.':'No saved baseline was available.');
  }

  function handleLifecycleActions(e){
    const close=e.target.closest('[data-close]');
    if(close&&ov()?.contains(close)){
      e.preventDefault();e.stopImmediatePropagation();closeWithGuard();return true;
    }
    const disc=e.target.closest('[data-discard]');
    if(disc&&ov()?.contains(disc)){
      e.preventDefault();e.stopImmediatePropagation();discard();return true;
    }
    const hubCard=e.target.closest('[data-template-card]');
    if(hubCard){captureBaseline();return false}
    const profile=e.target.closest('[data-profile],[data-hub-profile]');
    if(profile){scheduleBaseline();return false}
    const imp=e.target.closest('[data-import],[data-hub-import]');
    if(imp){scheduleBaseline();return false}
    return false;
  }

  function bind(){
    if(observed)return;
    observed=true;
    document.addEventListener('click',handleLifecycleActions,true);
    document.addEventListener('change',e=>{
      if(e.target.closest('[data-template-select]')){
        if(!baselineReady)captureBaseline();
      }
    },true);
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&ov()?.classList.contains('open')){
        e.preventDefault();e.stopImmediatePropagation();ov().querySelector('[data-save]')?.click();
      }
    },true);
  }

  function watch(){
    bind();
    const o=ov();if(!o)return;
    if(!o.dataset.g4V2Observer){
      o.dataset.g4V2Observer='1';
      const m=new MutationObserver(()=>{
        const e=ed();
        if(e&&e.innerHTML.trim()&&!baselineReady&&!o.querySelector('.g4-savebar.show')) captureBaseline();
      });
      m.observe(o,{childList:true,subtree:true});
    }
  }

  function boot(){
    watch();
    const mo=new MutationObserver(()=>watch());
    mo.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>{watch();if(ed()&&!baselineReady)captureBaseline()},300);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();