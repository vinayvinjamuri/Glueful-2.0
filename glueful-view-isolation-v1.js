/* Glueful — Global View Isolation V1 */
(function(){
  'use strict';
  if(window.__GLUEFUL_VIEW_ISOLATION_V1__) return;
  window.__GLUEFUL_VIEW_ISOLATION_V1__=true;

  const IDS=['view-dashboard','view-applications','view-interviews','view-profile','view-saved-jobs','view-settings','view-jobs','view-resume','view-add-application','view-gmail'];
  const STYLE_ID='glueful-view-isolation-v1-style';

  function installCSS(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent='@media(min-width:768px){'+IDS.map(id=>'body #'+id+'{display:none!important;} body #'+id+'.active,body #'+id+'.glueful-view-isolation-active{display:block!important;}').join('')+'}';
    (document.head||document.documentElement).appendChild(s);
  }

  function views(){return IDS.map(id=>document.getElementById(id)).filter(Boolean);}

  function current(){
    const all=views();
    let v=all.find(x=>x.classList.contains('active'));
    if(v) return v;
    v=all.find(x=>x.getAttribute('aria-hidden')==='false');
    if(v) return v;
    return all.find(x=>x.style.display==='block')||null;
  }

  function sync(){
    installCSS();
    const all=views();
    if(!all.length) return;
    const active=current();
    if(!active) return;
    all.forEach(v=>{
      const on=v===active;
      v.classList.toggle('glueful-view-isolation-active',on);
      v.style.setProperty('display',on?'block':'none','important');
    });
  }

  window.gluefulSyncViewIsolation=sync;
  installCSS();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();

  const observer=new MutationObserver(function(mutations){
    if(mutations.some(m=>m.type==='attributes' && ['class','style','aria-hidden'].includes(m.attributeName))) sync();
  });
  function observe(){
    if(document.body) observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','style','aria-hidden']});
    else setTimeout(observe,50);
  }
  observe();
})();