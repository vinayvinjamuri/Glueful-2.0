/* Glueful — Lazy Runtime V1
 * Loads feature runtimes only when their UI is actually requested.
 * Intentionally tiny: no full-DOM scans and no permanent subtree observer.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_LAZY_RUNTIME_V1__) return;
  window.__GLUEFUL_LAZY_RUNTIME_V1__=true;

  const GROUPS={
    jobs:[
      './glueful-jobs-discover-v15-authoritative.js','./glueful-jobs-relevance-v1.js','./glueful-resume-studio-supabase-bridge.js','./glueful-jobs-resume-action-v1.js','./glueful-jobs-logo-patch-v1.js','./glueful-jobs-mobile-card-polish-v1.js','./glueful-jobs-mobile-ux-v15.js','./glueful-jobs-smooth-logos-v1.js','./glueful-jobs-feed-recovery-v2.js','./glueful-jobs-official-link-guard-v1.js','./glueful-jobs-logo-recovery-v1.js','./glueful-jobs-logo-recovery-v2.js','./glueful-jobs-logo-recovery-v3.js','./glueful-jobs-brandfetch-final-v1.js','./glueful-jobs-page-scroll-fix-v4.js'
    ],
    resume:['./glueful-resume-fixed-page-bootstrap.js'],
    gmail:['./glueful-gmail-loader-v1.js']
  };
  const loaded=new Set(),loading=new Map();
  function load(src){
    if(loaded.has(src))return Promise.resolve();
    if(loading.has(src))return loading.get(src);
    const p=new Promise((resolve,reject)=>{
      const id='glueful-lazy-'+src.replace(/[^a-z0-9]/gi,'-');
      if(document.getElementById(id)){loaded.add(src);resolve();return;}
      const s=document.createElement('script');s.id=id;s.src=src;s.async=false;
      s.onload=()=>{loaded.add(src);resolve()};s.onerror=()=>reject(new Error('Failed to load '+src));
      document.body.appendChild(s);
    }).finally(()=>loading.delete(src));
    loading.set(src,p);return p;
  }
  function loadGroup(name){
    if(!GROUPS[name]||window.__GLUEFUL_LAZY_GROUPS__?.[name])return Promise.resolve();
    window.__GLUEFUL_LAZY_GROUPS__=window.__GLUEFUL_LAZY_GROUPS__||{};
    window.__GLUEFUL_LAZY_GROUPS__[name]=true;
    return GROUPS[name].reduce((p,src)=>p.then(()=>load(src)),Promise.resolve()).catch(error=>{
      delete window.__GLUEFUL_LAZY_GROUPS__[name];console.error('[Glueful] Lazy runtime failed:',name,error);
    });
  }
  function onClick(event){
    const el=event.target?.closest?.('button,a,[role="button"]');if(!el)return;
    const text=((el.textContent||'')+' '+(el.id||'')+' '+(el.getAttribute('data-view')||'')).toLowerCase();
    if(/\bjobs?\b/.test(text))void loadGroup('jobs');
    else if(/resume|cv|curriculum/.test(text))void loadGroup('resume');
    else if(/gmail|mail|inbox/.test(text))void loadGroup('gmail');
  }
  document.addEventListener('click',onClick,true);
  window.gluefulLazyRuntime={loadGroup,version:'1.0.1'};
})();
