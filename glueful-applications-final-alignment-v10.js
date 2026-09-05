/* Glueful — Applications Final Alignment V10
 * Desktop/tablet layout correction for the persistent sidebar.
 * Presentation/navigation only; no application data or handlers are changed.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_FINAL_ALIGNMENT_V10__) return;
  window.__GLUEFUL_APPLICATIONS_FINAL_ALIGNMENT_V10__=true;
  const STYLE_ID='glueful-applications-final-alignment-v10-style';

  function resetScroll(){
    try{ history.scrollRestoration='manual'; }catch(e){}
    const view=document.getElementById('view-applications');
    const nodes=[document.scrollingElement,document.documentElement,document.body,view];
    nodes.forEach(function(el){if(el) el.scrollTop=0;});
    try{window.scrollTo(0,0);}catch(e){}
  }

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        body #view-applications{
          position:relative!important;
          left:0!important;
          width:916px!important;
          max-width:916px!important;
          margin-left:373px!important;
          margin-right:0!important;
          padding:32px 0 48px!important;
          box-sizing:border-box!important;
          overflow:visible!important;
          height:auto!important;
          max-height:none!important;
        }
        body #view-applications .view-header{
          position:relative!important;
          display:flex!important;
          width:100%!important;
          min-height:82px!important;
          margin:0 0 28px!important;
          padding:0!important;
        }
        body #view-applications .view-header > button,
        body #view-applications .view-header > a{
          position:fixed!important;
          top:23px!important;
          right:290px!important;
          z-index:1001!important;
        }
        body #glueful-dashboard-hamburger,
        body #view-applications [aria-label="Open navigation menu"],
        body #view-applications [title="Open navigation menu"]{display:none!important;}
        body #glueful-applications-left-v1{
          position:fixed!important;
          top:208px!important;
          left:239px!important;
          width:276px!important;
          display:flex!important;
          z-index:20!important;
        }
        body #glueful-applications-workspace-v1{
          position:fixed!important;
          top:208px!important;
          right:28px!important;
          width:286px!important;
          display:flex!important;
          z-index:20!important;
        }
      }
      @media(min-width:701px) and (max-width:1100px){
        body #glueful-dashboard-hamburger,
        body #view-applications [aria-label="Open navigation menu"],
        body #view-applications [title="Open navigation menu"]{display:none!important;}
        body #view-applications{
          position:relative!important;left:0!important;
          width:calc(100% - 254px)!important;
          max-width:none!important;
          margin-left:230px!important;margin-right:24px!important;
          padding:28px 0 40px!important;box-sizing:border-box!important;
        }
        body #glueful-applications-left-v1,body #glueful-applications-workspace-v1{display:none!important;}
      }
      @media(max-width:700px){
        body #glueful-dashboard-hamburger{display:block!important;}
      }
    `;
    document.head.appendChild(s);
  }

  function active(){
    const v=document.getElementById('view-applications');
    return !!v&&(v.classList.contains('active')||v.style.display==='block');
  }
  function boot(){
    install();
    if(active()){
      resetScroll();
      requestAnimationFrame(function(){resetScroll();setTimeout(resetScroll,100);setTimeout(resetScroll,400);});
    }
    const v=document.getElementById('view-applications');
    if(v){
      new MutationObserver(function(ms){
        for(const m of ms){
          if(m.type==='attributes'&&(m.attributeName==='class'||m.attributeName==='style')&&active()){
            resetScroll();setTimeout(resetScroll,80);setTimeout(resetScroll,300);break;
          }
        }
      }).observe(v,{attributes:true,attributeFilter:['class','style']});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
