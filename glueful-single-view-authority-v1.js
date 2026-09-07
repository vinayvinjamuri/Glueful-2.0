/* Glueful — Single View Authority V1
 * Keeps exactly one top-level application view visible at a time.
 * Presentation/layout untouched: this only fixes view isolation.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_SINGLE_VIEW_AUTHORITY_V1__) return;
  window.__GLUEFUL_SINGLE_VIEW_AUTHORITY_V1__=true;

  const IDS=[
    'view-dashboard','view-applications','view-interviews','view-profile',
    'view-saved-jobs','view-settings','view-jobs','view-resumes',
    'view-add-application','view-gmail'
  ];
  const MAP={
    dashboard:'view-dashboard',home:'view-dashboard',
    applications:'view-applications',application:'view-applications',
    interviews:'view-interviews',interview:'view-interviews',
    profile:'view-profile',settings:'view-settings',
    jobs:'view-jobs','saved-jobs':'view-saved-jobs',savedjobs:'view-saved-jobs',
    resume:'view-resumes',resumes:'view-resumes',
    'add-application':'view-add-application',addapplication:'view-add-application',
    gmail:'view-gmail'
  };
  let currentId=null;

  function normalize(value){
    if(!value) return null;
    let s=String(value).trim().replace(/^#/,'').toLowerCase();
    if(IDS.indexOf(s)!==-1) return s;
    return MAP[s]||null;
  }

  function targetFromElement(el){
    if(!el) return null;
    const direct=normalize(el.getAttribute&&el.getAttribute('data-view'));
    if(direct) return direct;
    const href=el.getAttribute&&el.getAttribute('href');
    const fromHref=normalize(href);
    if(fromHref) return fromHref;
    const onclick=el.getAttribute&&el.getAttribute('onclick');
    if(onclick){
      const m=onclick.match(/(?:drawerNavigate|navigateTo|switchView)\s*\(\s*["']([^"']+)["']/i);
      const fromClick=normalize(m&&m[1]);
      if(fromClick) return fromClick;
    }
    return null;
  }

  function activeNavTarget(){
    const roots=document.querySelectorAll('.sidebar,.side-nav,.app-sidebar,#glueful-drawer,nav');
    for(const root of roots){
      const items=root.querySelectorAll('[data-view],[href],[onclick]');
      for(const item of items){
        if(!item.classList.contains('active') && item.getAttribute('aria-current')!=='page' && item.getAttribute('aria-current')!=='true') continue;
        const id=targetFromElement(item);
        if(id) return id;
      }
    }
    return null;
  }

  function activeViewTarget(){
    for(const id of IDS){
      const el=document.getElementById(id);
      if(el && (el.classList.contains('active') || el.getAttribute('aria-hidden')==='false')) return id;
    }
    return null;
  }

  function installStyle(){
    if(document.getElementById('glueful-single-view-authority-style')) return;
    const s=document.createElement('style');
    s.id='glueful-single-view-authority-style';
    s.textContent=IDS.map(function(id){return 'body #'+id+'{display:none!important;}'}).join('')+
      IDS.map(function(id){return 'body #'+id+'.glueful-single-view-visible{display:block!important;}'}).join('');
    (document.head||document.documentElement).appendChild(s);
  }

  function sync(id){
    const target=normalize(id)||activeNavTarget()||activeViewTarget()||currentId||'view-dashboard';
    if(!document.getElementById(target)) return;
    currentId=target;
    IDS.forEach(function(viewId){
      const el=document.getElementById(viewId);
      if(!el) return;
      if(viewId===target) el.classList.add('glueful-single-view-visible');
      else el.classList.remove('glueful-single-view-visible');
    });
  }

  function wrapNavigation(){
    const original=window.drawerNavigate;
    if(typeof original!=='function') return false;
    if(original.__gluefulSingleViewWrapped) return true;
    function wrapped(view){
      const requested=normalize(view);
      if(requested) sync(requested);
      const result=original.apply(this,arguments);
      if(requested){
        sync(requested);
        setTimeout(function(){sync(requested);},0);
        setTimeout(function(){sync(requested);},120);
      }else{
        setTimeout(function(){sync();},0);
      }
      return result;
    }
    wrapped.__gluefulSingleViewWrapped=true;
    wrapped.__gluefulOriginal=original;
    window.drawerNavigate=wrapped;
    return true;
  }

  function install(){
    installStyle();
    sync(activeNavTarget()||activeViewTarget()||'view-dashboard');
    wrapNavigation();
    document.addEventListener('click',function(event){
      const item=event.target&&event.target.closest ? event.target.closest('.sidebar [data-view],.sidebar [href],.sidebar [onclick],.side-nav [data-view],.side-nav [href],.side-nav [onclick],.app-sidebar [data-view],.app-sidebar [href],.app-sidebar [onclick],#glueful-drawer [data-view],#glueful-drawer [href],#glueful-drawer [onclick],nav [data-view],nav [href],nav [onclick]') : null;
      const id=targetFromElement(item);
      if(id) sync(id);
    },true);
    let tries=0;
    const retry=setInterval(function(){
      if(wrapNavigation() || ++tries>80) clearInterval(retry);
    },50);
    const observer=new MutationObserver(function(mutations){
      for(const mutation of mutations){
        if(mutation.type==='childList'){
          sync();
          break;
        }
      }
    });
    if(document.body) observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
