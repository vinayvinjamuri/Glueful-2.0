/* Glueful Interviews — Authoritative presentation shell V2
 * Desktop presentation now matches the approved wide Interviews reference.
 * Existing interview data, rendering, and actions remain untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V2__) return;
  window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V2__=true;

  const VIEW='view-interviews';
  const STYLE='glueful-interviews-authoritative-v2-style';

  function install(){
    if(document.getElementById(STYLE)) return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      html,body{overflow-x:hidden!important}

      /* ================================================================
         DESKTOP — wide Interviews workspace
         Sidebar ≈245px | content starts ≈309px | right edge ≈1620px
         ================================================================ */
      @media(min-width:1280px){
        body #${VIEW}{
          position:fixed!important;
          left:245px!important;
          right:0!important;
          top:0!important;
          bottom:0!important;
          width:auto!important;
          height:100vh!important;
          min-height:100vh!important;
          margin:0!important;
          padding:16px 44px 48px 64px!important;
          box-sizing:border-box!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          transform:none!important;
          background:#f7f8fc!important;
        }

        /* One wide content canvas. The old 430px left offset is removed. */
        body #${VIEW}>*{
          box-sizing:border-box!important;
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin-left:0!important;
          margin-right:0!important;
          transform:none!important;
        }

        /* Flatten common legacy centered wrappers so the whole Interviews
           presentation begins at the same left edge as the header. */
        body #${VIEW}>* > *{
          box-sizing:border-box!important;
          max-width:100%!important;
          min-width:0!important;
        }

        body #${VIEW} .view-title,
        body #${VIEW} h1{
          margin-left:0!important;
        }

        body #${VIEW} input,
        body #${VIEW} select,
        body #${VIEW} textarea,
        body #${VIEW} button{
          box-sizing:border-box!important;
        }

        body #${VIEW} .interview-card,
        body #${VIEW} .interview-item,
        body #${VIEW} [class*="interview-card"],
        body #${VIEW} [class*="interview-item"],
        body #${VIEW} [class*="empty-state"],
        body #${VIEW} [class*="empty"]{
          min-width:0!important;
          max-width:100%!important;
          box-sizing:border-box!important;
        }
      }

      /* ================================================================
         TABLET — keep the sidebar and fill the available workspace.
         ================================================================ */
      @media(min-width:768px) and (max-width:1279px){
        body #${VIEW}{
          position:relative!important;
          left:0!important;
          right:auto!important;
          top:auto!important;
          width:calc(100vw - 260px)!important;
          min-height:100vh!important;
          margin:0!important;
          padding:26px 24px 36px!important;
          box-sizing:border-box!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          transform:none!important;
          background:#f7f8fc!important;
        }
        body #${VIEW}>*{
          width:100%!important;
          max-width:100%!important;
          min-width:0!important;
          margin-left:0!important;
          margin-right:0!important;
          transform:none!important;
          box-sizing:border-box!important;
        }
      }

      /* ================================================================
         MOBILE — navigation drawer owns the sidebar.
         ================================================================ */
      @media(max-width:767px){
        body #${VIEW}{
          position:relative!important;
          left:0!important;
          right:auto!important;
          top:auto!important;
          width:100%!important;
          min-height:100vh!important;
          margin:0!important;
          padding:84px 16px 32px!important;
          box-sizing:border-box!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          transform:none!important;
          background:#f7f8fc!important;
        }
        body #${VIEW}>*{
          width:100%!important;
          max-width:100%!important;
          min-width:0!important;
          margin-left:0!important;
          margin-right:0!important;
          transform:none!important;
          box-sizing:border-box!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function normalize(){
    const v=document.getElementById(VIEW);
    if(!v) return;
    /* Remove only legacy shell geometry from the view's top-level wrappers.
       Nested component geometry is intentionally preserved. */
    Array.from(v.children).forEach(function(el){
      ['left','right','width','max-width','min-width','margin-left','margin-right','transform'].forEach(function(p){
        el.style.removeProperty(p);
      });
    });
  }

  function start(){
    install();
    normalize();
    [100,500,1200].forEach(function(t){setTimeout(function(){install();normalize();},t);});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();
