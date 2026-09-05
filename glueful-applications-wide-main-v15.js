/* Glueful — Applications Wide Main V15
 * Gives the Applications list more usable width while keeping the right rail
 * separated and visible. Presentation only; application data/handlers untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_WIDE_MAIN_V15__) return;
  window.__GLUEFUL_APPLICATIONS_WIDE_MAIN_V15__=true;

  function install(){
    const id='glueful-applications-wide-main-v15-style';
    if(document.getElementById(id)) return;
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`
      @media(min-width:1051px){
        /* Persistent 230px sidebar + 20px gap + main workspace + 24px gap + right rail. */
        body #view-applications{
          position:relative!important;
          left:0!important;
          margin-left:250px!important;
          margin-right:0!important;
          width:calc(100vw - 250px - 320px)!important;
          max-width:1000px!important;
          min-width:520px!important;
          padding:28px 0 48px!important;
          box-sizing:border-box!important;
          transform:none!important;
          overflow:visible!important;
          height:auto!important;
          max-height:none!important;
        }

        /* Make the actual application controls/cards use the full main column. */
        body #view-applications > *:not(#glueful-applications-workspace-v1),
        body #view-applications .applications-list,
        body #view-applications .application-list,
        body #view-applications .applications-grid,
        body #view-applications .application-grid{
          max-width:100%!important;
          box-sizing:border-box!important;
        }

        body #view-applications .view-header{
          width:100%!important;
          min-height:82px!important;
          margin:0 0 28px!important;
          padding:0!important;
        }

        /* Right rail: compact enough to sit beside the wider main column. */
        body #glueful-applications-workspace-v1{
          position:fixed!important;
          top:160px!important;
          right:28px!important;
          width:280px!important;
          max-width:280px!important;
          display:flex!important;
          flex-direction:column!important;
          gap:16px!important;
          z-index:20!important;
        }

        body #view-applications .view-header > button:not(:first-child),
        body #view-applications .view-header > a{
          position:fixed!important;
          top:23px!important;
          right:290px!important;
          z-index:1001!important;
        }

        body #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{
          display:none!important;
          visibility:hidden!important;
          pointer-events:none!important;
        }
      }

      @media(min-width:701px) and (max-width:1050px){
        body #glueful-applications-workspace-v1{display:none!important;}
        body #view-applications{
          width:calc(100% - 274px)!important;
          max-width:none!important;
          min-width:0!important;
          margin-left:250px!important;
          margin-right:24px!important;
          left:0!important;
          transform:none!important;
          box-sizing:border-box!important;
        }
        body #glueful-dashboard-hamburger{display:none!important;}
      }
    `;
    document.head.appendChild(s);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
