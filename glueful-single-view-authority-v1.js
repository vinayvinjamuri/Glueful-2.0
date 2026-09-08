/* Glueful — Single View Navigation V2
 * Minimal SPA view isolation. No animation, timers, polling, or MutationObserver.
 * Navigation stays inside the existing document and switches views immediately.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_SINGLE_VIEW_AUTHORITY_V2__) return;
  window.__GLUEFUL_SINGLE_VIEW_AUTHORITY_V2__=true;

  const IDS=['view-dashboard','view-applications','view-interviews','view-profile','view-saved-jobs','view-settings','view-jobs','view-resumes','view-add-application','view-gmail'];
  const MAP={dashboard:'view-dashboard',home:'view-dashboard',applications:'view-applications',application:'view-applications',interviews:'view-interviews',interview:'view-interviews',profile:'view-profile',settings:'view-settings',jobs:'view-jobs','saved-jobs':'view-saved-jobs',savedjobs:'view-saved-jobs',resume:'view-resumes',resumes:'view-resumes','add-application':'view-add-application',addapplication:'view-add-application',gmail:'view-gmail'};
  let currentId='view-dashboard';

  function normalize(value){
    if(!value) return null;
    const s=String(value).trim().replace(/^#/,'').toLowerCase();
    return IDS.indexOf(s)!==-1?s:(MAP[s]||null);
  }

  function targetFromElement(el){
    if(!el) return null;
    const direct=normalize(el.getAttribute('data-view'));
    if(direct) return direct;
    const href=normalize(el.getAttribute('href'));
    if(href) return href;
    const onclick=el.getAttribute('onclick');
    if(onclick){
      const match=onclick.match(/(?:drawerNavigate|navigateTo|switchView)\s*\(\s*["']([^"']+)["']/i);
      if(match) return normalize(match[1]);
    }
    return null;
  }

  function sync(id){
    const target=normalize(id)||currentId;
    if(!document.getElementById(target)) return;
    currentId=target;
    IDS.forEach(function(viewId){
      const el=document.getElementById(viewId);
      if(el) el.classList.toggle('glueful-single-view-visible',viewId===target);
    });
  }

  function install(){
    if(!document.getElementById('glueful-single-view-navigation-style')){
      const style=document.createElement('style');
      style.id='glueful-single-view-navigation-style';
      style.textContent=IDS.map(function(id){return 'body #'+id+'{display:none!important;}'}).join('')+IDS.map(function(id){return 'body #'+id+'.glueful-single-view-visible{display:block!important;}'}).join('');
      (document.head||document.documentElement).appendChild(style);
    }
    sync(currentId);

    document.addEventListener('click',function(event){
      const item=event.target&&event.target.closest?event.target.closest('.sidebar [data-view],.sidebar [href],.sidebar [onclick],.side-nav [data-view],.side-nav [href],.side-nav [onclick],.app-sidebar [data-view],.app-sidebar [href],.app-sidebar [onclick],#glueful-drawer [data-view],#glueful-drawer [href],#glueful-drawer [onclick],nav [data-view],nav [href],nav [onclick]'):null;
      const target=targetFromElement(item);
      if(!target) return;
      if(item.getAttribute('href')&&normalize(item.getAttribute('href'))) event.preventDefault();
      sync(target);
    },true);

    const original=window.drawerNavigate;
    if(typeof original==='function'&&!original.__gluefulSingleViewWrapped){
      function drawerNavigation(view){
        const target=normalize(view);
        if(target) sync(target);
        const result=original.apply(this,arguments);
        if(target) sync(target);
        return result;
      }
      drawerNavigation.__gluefulSingleViewWrapped=true;
      drawerNavigation.__gluefulOriginal=original;
      window.drawerNavigate=drawerNavigation;
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
