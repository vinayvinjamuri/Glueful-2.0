/* Glueful — Applications Final Alignment V11
 * Uses the real page canvas anchor and resets the actual SPA scroll container.
 * Presentation/navigation only; application data and handlers are untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_FINAL_ALIGNMENT_V11__) return;
  window.__GLUEFUL_APPLICATIONS_FINAL_ALIGNMENT_V11__=true;

  function install(){
    const id='glueful-applications-final-alignment-v11-style';
    if(document.getElementById(id)) return;
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`
      @media(min-width:1101px){
        /* The Applications view lives inside the app canvas, which already has
           the legacy content offset. Cancel that offset and anchor the page at
           the intended 373px desktop position. */
        body #view-applications{
          position:relative!important;
          left:-380px!important;
          width:916px!important;
          max-width:916px!important;
          margin-left:373px!important;
          margin-right:0!important;
          padding:32px 0 48px!important;
          box-sizing:border-box!important;
          overflow:visible!important;
          height:auto!important;
          transform:none!important;
        }
        body #view-applications .view-header{
          position:relative!important;
          top:0!important;
          width:100%!important;
          margin:0 0 28px!important;
          padding:0!important;
        }
        body #glueful-applications-left-v1{
          position:fixed!important;
          left:239px!important;
          top:208px!important;
          width:276px!important;
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
        body:not(.glueful-apple-dashboard) #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"],
        body:not(.glueful-apple-dashboard) #bottom-nav,
        body:not(.glueful-apple-dashboard) .bottom-nav{
          display:none!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }
      }
      @media(min-width:701px) and (max-width:1100px){
        body:not(.glueful-apple-dashboard) #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"],
        body:not(.glueful-apple-dashboard) #bottom-nav,
        body:not(.glueful-apple-dashboard) .bottom-nav{
          display:none!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function resetScroll(){
    try{
      history.scrollRestoration='manual';
      const view=document.getElementById('view-applications');
      const roots=[document.scrollingElement,document.documentElement,document.body,view];
      for(const el of roots){ if(el) el.scrollTop=0; }
      window.scrollTo(0,0);
      if(view){
        let node=view.parentElement;
        let depth=0;
        while(node && depth<12){
          try{
            const cs=getComputedStyle(node);
            if((cs.overflowY==='auto'||cs.overflowY==='scroll'||cs.overflowY==='overlay') && node.scrollHeight>node.clientHeight){
              node.scrollTop=0;
            }
            node.scrollTop=0;
          }catch(ignore){}
          node=node.parentElement;
          depth++;
        }
      }
    }catch(e){ try{window.scrollTo(0,0);}catch(ignore){} }
  }

  function active(){
    const view=document.getElementById('view-applications');
    return !!view&&(view.classList.contains('active')||view.style.display==='block');
  }

  function start(){
    install();
    if(active()){
      resetScroll();
      requestAnimationFrame(()=>{resetScroll();requestAnimationFrame(resetScroll);});
      setTimeout(resetScroll,50);
      setTimeout(resetScroll,150);
      setTimeout(resetScroll,400);
      setTimeout(resetScroll,800);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  document.addEventListener('click',function(e){
    const t=e.target&&e.target.closest?e.target.closest('button,a,[role="button"]'):null;
    if(!t) return;
    const text=(t.textContent||'').trim();
    if(/applications/i.test(text)&&!/add application/i.test(text)){
      setTimeout(()=>{if(active())resetScroll();},0);
      setTimeout(()=>{if(active())resetScroll();},120);
      setTimeout(()=>{if(active())resetScroll();},300);
    }
  },true);
})();
