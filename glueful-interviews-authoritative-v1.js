/* Glueful Interviews — Authoritative presentation shell V1
 * Layout-only layer. Existing interview data, rendering, and actions remain untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V1__) return;
  window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V1__=true;

  const VIEW='view-interviews';
  const STYLE='glueful-interviews-authoritative-v1-style';

  function install(){
    if(document.getElementById(STYLE)) return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      html,body{overflow-x:hidden!important}

      /* ================================================================
         DESKTOP — one authoritative Interviews canvas
         Sidebar ≈245px | content starts ≈675px | content ≈952px
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
          padding:24px 32px 52px 0!important;
          box-sizing:border-box!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          transform:none!important;
          background:#f7f8fc!important;
        }

        /* Every top-level Interviews wrapper gets the same authoritative
           content column. This removes the legacy centered/oversized shell. */
        body #${VIEW}>*{
          box-sizing:border-box!important;
          width:952px!important;
          max-width:952px!important;
          min-width:0!important;
          margin-left:430px!important;
          margin-right:0!important;
          transform:none!important;
        }

        body #${VIEW}>* .view-title,
        body #${VIEW}>* h1{
          margin-left:0!important;
        }

        body #${VIEW}>* input,
        body #${VIEW}>* select,
        body #${VIEW}>* textarea,
        body #${VIEW}>* button,
        body #${VIEW}>* [class*="interview"],
        body #${VIEW}>* [class*="empty"]{
          max-width:100%!important;
          box-sizing:border-box!important;
        }

        /* Do not allow the legacy empty-state panel to establish a wider
           min-content width than the authoritative content column. */
        body #${VIEW}>* .interview-card,
        body #${VIEW}>* .interview-item,
        body #${VIEW}>* [class*="interview-card"],
        body #${VIEW}>* [class*="interview-item"]{
          width:100%!important;
          min-width:0!important;
          max-width:100%!important;
          box-sizing:border-box!important;
        }
      }

      /* ================================================================
         TABLET — sidebar remains authoritative; content fills the right
         workspace without creating a centered desktop-width overflow.
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
         MOBILE — the navigation drawer owns the sidebar; Interviews is
         a normal single-column page underneath the mobile header.
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
    v.querySelectorAll('[style]').forEach(function(el){
      /* Remove only geometry declarations that can resurrect the legacy
         centered Interviews shell. All other inline styles stay intact. */
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
