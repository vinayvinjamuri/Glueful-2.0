/* Glueful — Global View Isolation V2
 * One and only one app view is visible at a time.
 * Navigation is authoritative: drawerNavigate(view) selects the view
 * before the existing router runs, so layout scripts cannot leave stale
 * pages stacked underneath the destination.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_VIEW_ISOLATION_V2__) return;
  window.__GLUEFUL_VIEW_ISOLATION_V2__=true;

  const IDS=[
    'view-dashboard','view-applications','view-interviews','view-profile',
    'view-saved-jobs','view-settings','view-jobs','view-resume',
    'view-add-application','view-gmail'
  ];
  const STYLE_ID='glueful-view-isolation-v2-style';
  let preferredId=null;
  let syncing=false;
  let observer=null;

  function installCSS(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent='@media(min-width:768px){'+IDS.map(id=>
      'body #'+id+'{display:none!important;} body #'+id+'.glueful-view-isolation-active{display:block!important;}'
    ).join('')+'}';
    (document.head||document.documentElement).appendChild(s);
  }

  function views(){
    return IDS.map(id=>document.getElementById(id)).filter(Boolean);
  }

  function normalizeId(value){
    if(!value) return null;
    let s=String(value).trim().replace(/^#/,'');
    if(!s) return null;
    if(IDS.includes(s)) return s;
    if(s==='applications'||s==='application') return 'view-applications';
    if(s==='interviews'||s==='interview') return 'view-interviews';
    if(s==='resume'||s==='resumes') return 'view-resume';
    if(s==='dashboard'||s==='home') return 'view-dashboard';
    if(s==='jobs'||s==='saved-jobs'||s==='savedjobs') return s==='jobs'?'view-jobs':'view-saved-jobs';
    if(s==='profile'||s==='settings') return 'view-'+s;
    if(s==='gmail') return 'view-gmail';
    return null;
  }

  function viewFromElement(el){
    if(!el) return null;
    let cur=el;
    for(let i=0;i<5 && cur;i++,cur=cur.parentElement){
      for(const attr of ['data-view','data-target','data-route','href']){
        const raw=cur.getAttribute&&cur.getAttribute(attr);
        const id=normalizeId(raw);
        if(id) return id;
      }
      const onclick=cur.getAttribute&&cur.getAttribute('onclick');
      if(onclick){
        const m=onclick.match(/(?:drawerNavigate|navigateTo|switchView)\s*\(\s*['"]([^'"]+)['"]/i);
        const id=normalizeId(m&&m[1]);
        if(id) return id;
      }
    }
    return null;
  }

  function activeNavId(){
    const nodes=Array.from(document.querySelectorAll(
      'a.active,button.active,[role="button"].active,.nav-item.active,.sidebar-item.active,.menu-item.active,'+
      '[aria-current="page"],[aria-current="true"]'
    ));
    for(const node of nodes){
      const id=viewFromElement(node);
      if(id) return id;
    }
    return null;
  }

  function currentId(){
    if(preferredId && document.getElementById(preferredId)) return preferredId;
    const nav=activeNavId();
    if(nav) return nav;
    const all=views();
    const active=all.find(v=>v.classList.contains('active'));
    if(active) return active.id;
    const aria=all.find(v=>v.getAttribute('aria-hidden')==='false');
    if(aria) return aria.id;
    const visible=all.find(v=>getComputedStyle(v).display!=='none');
    return visible ? visible.id : null;
  }

  function sync(id){
    if(syncing) return;
    syncing=true;
    try{
      installCSS();
      const all=views();
      if(!all.length) return;
      const targetId=normalizeId(id)||currentId();
      if(!targetId) return;
      const target=document.getElementById(targetId);
      if(!target) return;
      preferredId=targetId;
      all.forEach(v=>{
        const on=v===target;
        v.classList.toggle('glueful-view-isolation-active',on);
        v.style.setProperty('display',on?'block':'none','important');
        if(!on) v.setAttribute('aria-hidden','true');
        else v.setAttribute('aria-hidden','false');
      });
      window.dispatchEvent(new CustomEvent('glueful-view-isolation-synced',{detail:{view:targetId}}));
    }finally{
      syncing=false;
    }
  }

  window.gluefulSyncViewIsolation=function(id){
    if(id) preferredId=normalizeId(id)||preferredId;
    sync(id);
  };

  function wrapNavigation(){
    const original=window.drawerNavigate;
    if(typeof original!=='function'){
      setTimeout(wrapNavigation,50);
      return;
    }
    if(original.__gluefulViewIsolationWrapped) return;
    function isolatedDrawerNavigate(view){
      const id=normalizeId(view);
      if(id) sync(id);
      try{
        const result=original.apply(this,arguments);
        setTimeout(function(){sync(id);},0);
        setTimeout(function(){sync(id);},100);
        setTimeout(function(){sync(id);},400);
        return result;
      }catch(error){
        console.error('[Glueful] Navigation failed:',error);
        sync(id);
        throw error;
      }
    }
    isolatedDrawerNavigate.__gluefulViewIsolationWrapped=true;
    isolatedDrawerNavigate.__gluefulOriginal=original;
    window.drawerNavigate=isolatedDrawerNavigate;
  }

  installCSS();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){sync();wrapNavigation();},{once:true});
  }else{
    sync();
    wrapNavigation();
  }

  observer=new MutationObserver(function(mutations){
    if(syncing) return;
    let navigationChanged=false;
    for(const m of mutations){
      if(m.type==='childList') navigationChanged=true;
      if(m.type==='attributes' && ['class','style','aria-hidden','href','data-view','data-target','data-route'].includes(m.attributeName)) navigationChanged=true;
    }
    if(navigationChanged) setTimeout(function(){sync();wrapNavigation();},0);
  });

  function observe(){
    if(document.body) observer.observe(document.body,{subtree:true,childList:true,attributes:true});
    else setTimeout(observe,50);
  }
  observe();
})();
