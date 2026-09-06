/* Glueful Applications — List Scroll Only V2
 * Presentation-only behavior: keep the existing Applications sizing/layout
 * untouched and make only the application-card list internally scrollable.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_LIST_SCROLL_V2__)return;
  window.__GLUEFUL_APPLICATIONS_LIST_SCROLL_V2__=true;

  const VIEW='view-applications';
  const RAIL='glueful-applications-clean-v6-rail';
  const STYLE='glueful-applications-list-scroll-v2-style';
  const CLASS='glueful-applications-scroll-container-v2';

  function getView(){return document.getElementById(VIEW);}
  function active(v){return !!v&&(v.classList.contains('active')||v.style.display==='block');}

  function install(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      @media(min-width:1280px){
        /* The page itself must never create a second scrollbar. */
        html,body{overflow:hidden!important;}
        body #${VIEW}{overflow:hidden!important;}
        body #${VIEW}.${CLASS}{overflow:hidden!important;}

        /* The application list is the single scrollable region in the main column. */
        body #${VIEW} .${CLASS}{
          overflow-y:auto!important;
          overflow-x:hidden!important;
          max-height:calc(100vh - var(--gf-app-scroll-top, 300px) - 24px)!important;
          scrollbar-gutter:stable!important;
          overscroll-behavior:contain!important;
        }
        body #${VIEW} .${CLASS}::-webkit-scrollbar{width:8px!important;}
        body #${VIEW} .${CLASS}::-webkit-scrollbar-thumb{background:#cbd2df!important;border-radius:8px!important;}
        body #${VIEW} .${CLASS}::-webkit-scrollbar-track{background:transparent!important;}
      }
    `;
    document.head.appendChild(s);
  }

  function cardListContainer(view){
    const cards=[...view.querySelectorAll('.application-card,.job-application-card,[class*="application-card"]')]
      .filter(el=>!el.closest('#'+RAIL));
    if(cards.length<2)return null;

    let p=cards[0].parentElement;
    while(p&&p!==view){
      if(cards.every(c=>p.contains(c))){
        const hasSearch=p.querySelector('input[type="search"],input[placeholder*="Search"],input[placeholder*="search"]');
        const hasFilter=p.querySelector('button,select');
        if(!hasSearch&&!hasFilter)return p;
      }
      p=p.parentElement;
    }

    /* Fallback: choose the nearest ancestor shared by all cards. */
    p=cards[0].parentElement;
    while(p&&p!==view&&!cards.every(c=>p.contains(c)))p=p.parentElement;
    return p&&p!==view?p:null;
  }

  function sync(){
    const view=getView();
    if(!active(view))return;
    install();

    const old=view.querySelectorAll('.'+CLASS);
    old.forEach(el=>el.classList.remove(CLASS));

    const list=cardListContainer(view);
    if(!list)return;

    list.classList.add(CLASS);
    const top=Math.max(0,Math.round(list.getBoundingClientRect().top));
    view.style.setProperty('--gf-app-scroll-top',top+'px');
  }

  function start(){
    sync();
    [150,500,1200,2500].forEach(t=>setTimeout(sync,t));
    window.addEventListener('resize',sync,{passive:true});
    new MutationObserver(function(){
      clearTimeout(window.__gfAppListScrollTimer);
      window.__gfAppListScrollTimer=setTimeout(sync,30);
    }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
