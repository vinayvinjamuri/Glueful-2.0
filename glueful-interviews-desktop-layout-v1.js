/* Glueful Interviews — desktop presentation layer
 * Keeps existing interview rendering and actions intact; only fixes the view shell.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_INTERVIEWS_DESKTOP_LAYOUT_V1__) return;
  window.__GLUEFUL_INTERVIEWS_DESKTOP_LAYOUT_V1__=true;

  const STYLE_ID='glueful-interviews-desktop-layout-v1-style';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1280px){
        body #view-interviews{
          position:relative!important;
          box-sizing:border-box!important;
          min-height:calc(100vh - 0px)!important;
          padding:34px 64px 48px 64px!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          background:#f7f8fc!important;
        }
        body #view-interviews .view-title,
        body #view-interviews h1{
          font-size:34px!important;
          line-height:1.08!important;
          font-weight:760!important;
          letter-spacing:-1px!important;
          margin:0!important;
          color:#172033!important;
        }
        body #view-interviews .view-subtitle,
        body #view-interviews .subtitle,
        body #view-interviews p.subtext{
          font-size:15px!important;
          line-height:1.45!important;
          color:#68738a!important;
        }
        body #view-interviews .interview-card,
        body #view-interviews .interview-item{
          background:#fff!important;
          border:1px solid #e5e9f0!important;
          border-radius:14px!important;
          box-shadow:0 2px 8px rgba(20,30,50,.04)!important;
        }
        body #view-interviews .interview-card * ,
        body #view-interviews .interview-item *{
          font-size:14px;
        }
        body #view-interviews button,
        body #view-interviews input,
        body #view-interviews select{
          font-size:14px!important;
        }
        body #view-interviews .interview-card h3,
        body #view-interviews .interview-item h3{
          font-size:17px!important;
          font-weight:700!important;
        }
      }
      @media(max-width:1279px){
        body #view-interviews{box-sizing:border-box!important;overflow-x:hidden!important;}
      }
    `;
    document.head.appendChild(s);
  }

  function start(){
    install();
    [100,500,1500].forEach(t=>setTimeout(install,t));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
