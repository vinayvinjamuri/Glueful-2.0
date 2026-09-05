/* Glueful — Applications Layout V8
 * Final desktop alignment for the persistent sidebar layout.
 * Presentation only; application data and handlers are untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_LAYOUT_V8__) return;
  window.__GLUEFUL_APPLICATIONS_LAYOUT_V8__=true;

  function install(){
    const id='glueful-applications-layout-v8-style';
    if(document.getElementById(id)) return;
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`
      @media(min-width:1101px){
        /* Preserve the existing Applications workspace anchor, then place the
           persistent-sidebar side panels in the newly available left rail. */
        body #view-applications{
          position:relative!important;
          left:-430px!important;
          width:960px!important;
          max-width:960px!important;
          margin-left:405px!important;
          margin-right:0!important;
          padding:32px 0 48px!important;
          box-sizing:border-box!important;
        }
        body #view-applications .view-header{
          position:relative!important;
          width:100%!important;
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
        body:not(.glueful-apple-dashboard) #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{
          display:none!important;
        }
        body #glueful-applications-left-v1{
          left:239px!important;
          top:208px!important;
          width:276px!important;
        }
        body #glueful-applications-workspace-v1{
          right:28px!important;
          top:208px!important;
          width:286px!important;
        }
      }
      @media(min-width:701px) and (max-width:1100px){
        body:not(.glueful-apple-dashboard) #glueful-dashboard-hamburger,
        body:not(.glueful-apple-dashboard) [aria-label="Open navigation menu"],
        body:not(.glueful-apple-dashboard) [title="Open navigation menu"]{
          display:none!important;
        }
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
