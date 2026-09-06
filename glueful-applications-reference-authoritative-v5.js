/* Glueful — Applications Main Column Authoritative V5
 * Keep the existing 260px sidebar exactly as-is.
 * Use a simple vertical flow for the Applications main column so
 * search -> filters -> applications remain tightly stacked.
 * The right rail is independently anchored on the right.
 * Existing data, controls, navigation and handlers are preserved.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_REFERENCE_AUTHORITATIVE_V5__)return;
  window.__GLUEFUL_APPLICATIONS_REFERENCE_AUTHORITATIVE_V5__=true;

  const STYLE_ID='glueful-applications-reference-authoritative-v5-style';

  function install(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1280px){
        html,body{overflow-x:hidden!important;}

        /* Sidebar remains exactly 260px. Only the Applications content changes. */
        body.glueful-applications-apple #view-applications{
          position:fixed!important;
          left:260px!important;
          right:0!important;
          top:0!important;
          bottom:0!important;
          width:auto!important;
          max-width:none!important;
          min-width:0!important;
          height:100vh!important;
          min-height:100vh!important;
          margin:0!important;
          padding:26px 32px 52px!important;
          box-sizing:border-box!important;
          display:block!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          transform:none!important;
        }

        body.glueful-applications-apple #view-applications>.view-header{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          min-height:72px!important;
          margin:0!important;
          padding:0!important;
          display:flex!important;
          align-items:flex-start!important;
          justify-content:space-between!important;
          gap:22px!important;
          box-sizing:border-box!important;
        }

        body.glueful-applications-apple #view-applications>.view-header>button,
        body.glueful-applications-apple #view-applications>.view-header>a{
          position:static!important;
          inset:auto!important;
          transform:none!important;
          margin:0!important;
          flex:0 0 auto!important;
        }

        /* Search occupies the main column and sits directly under the header. */
        body.glueful-applications-apple #view-applications>.glueful-applications-main-wide{
          width:calc(100% - 378px)!important;
          max-width:none!important;
          min-width:0!important;
          margin:14px 378px 0 0!important;
          box-sizing:border-box!important;
        }

        body.glueful-applications-apple #view-applications>.glueful-applications-main-wide input[type="search"],
        body.glueful-applications-apple #view-applications>.glueful-applications-main-wide input[placeholder*="Search"],
        body.glueful-applications-apple #view-applications>.glueful-applications-main-wide input[placeholder*="search"]{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          box-sizing:border-box!important;
        }

        /* Filters + application list form one centered 760px column below search. */
        body.glueful-applications-apple #view-applications>.glueful-applications-main-centered{
          width:min(calc(100% - 378px),760px)!important;
          max-width:760px!important;
          min-width:0!important;
          margin-left:auto!important;
          margin-right:378px!important;
          box-sizing:border-box!important;
        }

        body.glueful-applications-apple #view-applications>.glueful-applications-main-wide + .glueful-applications-main-centered{
          margin-top:18px!important;
        }

        body.glueful-applications-apple #view-applications>.glueful-applications-main-centered + .glueful-applications-main-centered{
          margin-top:16px!important;
        }

        body.glueful-applications-apple #view-applications .application-card,
        body.glueful-applications-apple #view-applications .job-application-card,
        body.glueful-applications-apple #view-applications [class*="application-card"]{
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          min-height:94px!important;
          box-sizing:border-box!important;
        }

        /* Right rail is independent of the vertical main flow, so it cannot create blank space. */
        body.glueful-applications-apple #view-applications>#glueful-applications-workspace-v1{
          position:absolute!important;
          top:110px!important;
          right:32px!important;
          left:auto!important;
          width:350px!important;
          max-width:350px!important;
          min-width:350px!important;
          margin:0!important;
          padding:0!important;
          display:flex!important;
          flex-direction:column!important;
          gap:16px!important;
          box-sizing:border-box!important;
          visibility:visible!important;
          opacity:1!important;
        }

        body.glueful-applications-apple #view-applications>#glueful-applications-workspace-v1>*{
          width:100%!important;
          max-width:none!important;
          box-sizing:border-box!important;
        }

        body.glueful-applications-apple #view-applications [style*="position: fixed"],
        body.glueful-applications-apple #view-applications [style*="position:fixed"]{
          position:static!important;
        }
      }

      @media(min-width:768px) and (max-width:1279px){
        body.glueful-applications-apple #view-applications{
          position:relative!important;
          left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
          transform:none!important;
          width:calc(100vw - 260px)!important;
          max-width:none!important;
          min-width:0!important;
          margin:0!important;
          padding:26px 26px 48px!important;
          box-sizing:border-box!important;
        }
        body.glueful-applications-apple #view-applications>.glueful-applications-main-centered{
          width:min(100%,760px)!important;
          max-width:760px!important;
          margin-left:auto!important;
          margin-right:auto!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function directChild(view,el){
    let node=el;
    while(node&&node.parentElement!==view)node=node.parentElement;
    return node&&node.parentElement===view?node:null;
  }

  function classify(view){
    [...view.children].forEach(function(el){
      if(el.id==='glueful-applications-workspace-v1'||el.classList.contains('view-header'))return;
      el.classList.remove('glueful-applications-main-wide','glueful-applications-main-centered');
      el.style.setProperty('min-width','0','important');
      el.style.setProperty('transform','none','important');
    });

    const search=view.querySelector('input[type="search"],input[placeholder*="Search"],input[placeholder*="search"]');
    const searchOwner=search?directChild(view,search):null;
    if(searchOwner)searchOwner.classList.add('glueful-applications-main-wide');

    const cards=view.querySelectorAll('.application-card,.job-application-card,[class*="application-card"]');
    const centered=new Set();
    cards.forEach(function(card){
      const owner=directChild(view,card);
      if(owner)centered.add(owner);
    });

    /* Center the filter row with the application list. */
    [...view.children].forEach(function(el){
      const text=(el.textContent||'').replace(/\\s+/g,' ').trim();
      if(/Recently.*All.*Applied.*Interview.*Offer.*Rejected/i.test(text))centered.add(el);
    });

    centered.forEach(function(el){
      if(el!==searchOwner)el.classList.add('glueful-applications-main-centered');
    });

    [...view.children].forEach(function(el){
      if(el.id==='glueful-applications-workspace-v1'||el.classList.contains('view-header')||el===searchOwner)return;
      if(!el.classList.contains('glueful-applications-main-centered'))el.classList.add('glueful-applications-main-centered');
    });
  }

  function normalize(){
    const view=document.getElementById('view-applications');
    if(!view)return;
    const active=view.classList.contains('active')||view.style.display==='block';
    if(!active)return;
    document.body.classList.add('glueful-applications-apple');
    install();
    classify(view);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalize,{once:true});
  else normalize();
  [120,500,1200,2200].forEach(function(t){setTimeout(normalize,t);});
  window.addEventListener('resize',normalize,{passive:true});
  document.addEventListener('click',function(){setTimeout(normalize,50);},true);
})();
