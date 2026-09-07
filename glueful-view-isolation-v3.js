/* Glueful — Global View Isolation V3
 * Final authority for desktop/tablet view visibility.
 * The active navigation item is the source of truth; stale views cannot
 * remain in normal document flow underneath the selected page.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_VIEW_ISOLATION_V3__) return;
  window.__GLUEFUL_VIEW_ISOLATION_V3__=true;

  const IDS=['view-dashboard','view-applications','view-interviews','view-profile','view-saved-jobs','view-settings','view-jobs','view-resume','view-add-application','view-gmail'];
  const STYLE_ID='glueful-view-isolation-v3-style';
  let syncing=false;
  let preferredId=null;

  function normalize(value){
    if(!value)return null;
    let s=String(value).trim().replace(/^#/,'');
    if(IDS.includes(s))return s;
    const map={dashboard:'view-dashboard',home:'view-dashboard',applications:'view-applications',application:'view-applications',interviews:'view-interviews',interview:'view-interviews',resume:'view-resume',resumes:'view-resume',profile:'view-profile',settings:'view-settings',jobs:'view-jobs','saved-jobs':'view-saved-jobs',savedjobs:'view-saved-jobs',gmail:'view-gmail','add-application':'view-add-application'};
    return map[s]||null;
  }

  function installCSS(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent='@media(min-width:768px){'+IDS.map(id=>'body #'+id+'{display:none!important;}body #'+id+'.glueful-view-isolation-active{display:block!important;}').join('')+'}';
    (document.head||document.documentElement).appendChild(style);
  }

  function elementView(el){
    if(!el)return null;
    let cur=el;
    for(let i=0;i<7&&cur;i++,cur=cur.parentElement){
      for(const attr of ['data-view','data-target','data-route','href']){
        const raw=cur.getAttribute&&cur.getAttribute(attr);
        const id=normalize(raw);
        if(id)return id;
      }
      const onclick=cur.getAttribute&&cur.getAttribute('onclick');
      if(onclick){
        const m=onclick.match(/(?:drawerNavigate|navigateTo|switchView)\s*\(\s*["']([^"']+)["']/i);
        const id=normalize(m&&m[1]);
        if(id)return id;
      }
    }
    return null;
  }

  function activeNavigation(){
    const selectors=['a.active','button.active','[role="button"].active','.nav-item.active','.sidebar-item.active','.menu-item.active','[aria-current="page"]','[aria-current="true"]'];
    for(const node of document.querySelectorAll(selectors.join(','))){
      const id=elementView(node);
      if(id)return id;
    }
    return null;
  }

  function activeView(){
    const all=IDS.map(id=>document.getElementById(id)).filter(Boolean);
    const cls=all.find(v=>v.classList.contains('active'));
    if(cls)return cls.id;
    const aria=all.find(v=>v.getAttribute('aria-hidden')==='false');
    if(aria)return aria.id;
    return null;
  }

  function sync(id){
    if(syncing)return;
    syncing=true;
    try{
      installCSS();
      const all=IDS.map(x=>document.getElementById(x)).filter(Boolean);
      if(!all.length)return;
      const targetId=normalize(id)||activeNavigation()||activeView()||preferredId||'view-dashboard';
      const target=document.getElementById(targetId);
      if(!target)return;
      preferredId=targetId;
      all.forEach(v=>{
        const on=v===target;
        v.classList.toggle('glueful-view-isolation-active',on);
        v.style.setProperty('display',on?'block':'none','important');
        v.style.setProperty('visibility',on?'visible':'hidden','important');
        v.style.setProperty('pointer-events',on?'auto':'none','important');
        v.setAttribute('aria-hidden',on?'false':'true');
      });
    }finally{syncing=false;}
  }

  function installNavigationCapture(){
    document.addEventListener('click',function(event){
      const node=event.target&&event.target.closest?event.target.closest('a,button,[role="button"],.nav-item,.sidebar-item,.menu-item'):null;
      const id=elementView(node);
      if(id){preferredId=id;sync(id);setTimeout(function(){sync(id);},0);setTimeout(function(){sync(id);},150);setTimeout(function(){sync(id);},600);}
    },true);
  }

  function wrapDrawer(){
    const original=window.drawerNavigate;
    if(typeof original!=='function')return false;
    if(original.__gluefulViewIsolationV3Wrapped)return true;
    function wrapped(view){
      const id=normalize(view);
      if(id){preferredId=id;sync(id);}
      const result=original.apply(this,arguments);
      if(id){setTimeout(function(){sync(id);},0);setTimeout(function(){sync(id);},150);setTimeout(function(){sync(id);},600);}
      return result;
    }
    wrapped.__gluefulViewIsolationV3Wrapped=true;
    wrapped.__gluefulOriginal=original;
    window.drawerNavigate=wrapped;
    return true;
  }

  function boot(){
    installCSS();
    sync();
    installNavigationCapture();
    wrapDrawer();
    setInterval(function(){wrapDrawer();sync(activeNavigation()||preferredId);},1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
