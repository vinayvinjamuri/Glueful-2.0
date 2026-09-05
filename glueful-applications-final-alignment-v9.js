/* Glueful — Applications Final Alignment V9
 * Corrects desktop workspace anchoring and restores the Applications view to top.
 * Presentation/navigation only; application data and handlers are untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_FINAL_ALIGNMENT_V9__) return;
  window.__GLUEFUL_APPLICATIONS_FINAL_ALIGNMENT_V9__=true;

  function installStyle(){
    const id='glueful-applications-final-alignment-v9-style';
    if(document.getElementById(id)) return;
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`
      @media(min-width:1101px){
        body #view-applications{
          position:relative!important;
          left:0!important;
          width:min(916px,calc(100vw - 748px))!important;
          max-width:916px!important;
          margin-left:373px!important;
          margin-right:0!important;
          padding:32px 0 48px!important;
          box-sizing:border-box!important;
          overflow:visible!important;
          height:auto!important;
        }
        body #view-applications .view-header{
          width:100%!important;
          margin:0 0 28px!important;
          padding:0!important;
        }
        body:not(.glueful-apple-dashboard) #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{
          display:none!important;
        }
        body:not(.glueful-apple-dashboard) #bottom-nav,
        body:not(.glueful-apple-dashboard) .bottom-nav{
          display:none!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }
        body #glueful-applications-left-v1{
          position:fixed!important;
          left:28px!important;
          top:208px!important;
          width:284px!important;
          display:flex!important;
          flex-direction:column!important;
          gap:16px!important;
          z-index:20!important;
        }
        body #glueful-applications-workspace-v1{
          position:fixed!important;
          right:28px!important;
          top:208px!important;
          width:286px!important;
          display:flex!important;
          flex-direction:column!important;
          gap:16px!important;
          z-index:20!important;
        }
      }
      @media(min-width:701px) and (max-width:1100px){
        body:not(.glueful-apple-dashboard) #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{
          display:none!important;
        }
        body:not(.glueful-apple-dashboard) #bottom-nav,
        body:not(.glueful-apple-dashboard) .bottom-nav{
          display:none!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function resetScroll(){
    try{
      history.scrollRestoration='manual';
      const view=document.getElementById('view-applications');
      const scroller=document.scrollingElement||document.documentElement;
      if(scroller) scroller.scrollTop=0;
      if(document.documentElement) document.documentElement.scrollTop=0;
      if(document.body) document.body.scrollTop=0;
      window.scrollTo(0,0);
      if(view){
        let node=view.parentElement;
        let depth=0;
        while(node && node!==document.documentElement && depth<6){
          const cs=getComputedStyle(node);
          if((cs.overflowY==='auto'||cs.overflowY==='scroll') && node.scrollHeight>node.clientHeight){
            node.scrollTop=0;
          }
          node=node.parentElement;
          depth++;
        }
      }
    }catch(e){}
  }

  function active(){
    const view=document.getElementById('view-applications');
    return !!view&&(view.classList.contains('active')||view.style.display==='block');
  }

  function start(){
    installStyle();
    if(active()){
      resetScroll();
      requestAnimationFrame(function(){resetScroll();});
      setTimeout(resetScroll,80);
      setTimeout(resetScroll,250);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  document.addEventListener('click',function(e){
    const t=e.target&&e.target.closest?e.target.closest('button,a,[role="button"]'):null;
    if(!t) return;
    const text=(t.textContent||'').trim();
    if(/applications/i.test(text)&&!/add application/i.test(text)){
      setTimeout(function(){if(active()) resetScroll();},0);
      setTimeout(function(){if(active()) resetScroll();},150);
    }
  },true);
})();
