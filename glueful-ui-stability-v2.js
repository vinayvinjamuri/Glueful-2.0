/* Glueful UI Stability V2 — static visual stabilization only. No observers or feature logic. */
(function(){
  'use strict';
  const STYLE_ID='glueful-ui-stability-v2';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #view-dashboard .card,
      #view-dashboard .stat-card,
      #view-dashboard .heat-card,
      #glueful-application-analytics-v1 .gf-panel{
        animation:none !important;
      }

      @media (min-width:701px){
        html,body{overflow-x:hidden !important;}
        body.glueful-premium-ui #view-dashboard{
          position:fixed !important;
          top:76px !important;
          left:260px !important;
          right:24px !important;
          bottom:0 !important;
          width:auto !important;
          max-width:none !important;
          min-width:0 !important;
          height:auto !important;
          margin:0 !important;
          padding:24px 0 36px !important;
          box-sizing:border-box !important;
          overflow-x:hidden !important;
          overflow-y:auto !important;
          transform:none !important;
          zoom:1 !important;
          will-change:auto !important;
        }
        body.glueful-premium-ui #view-dashboard .stat-grid,
        body.glueful-premium-ui #view-dashboard .stats-grid{
          grid-template-columns:repeat(4,minmax(0,1fr)) !important;
          width:100% !important;
          min-width:0 !important;
        }
        body.glueful-premium-ui #view-dashboard .stat-card{
          min-width:0 !important;
          width:auto !important;
          box-sizing:border-box !important;
        }
        body.glueful-premium-ui #glueful-application-analytics-v1{
          width:100% !important;
          max-width:none !important;
          box-sizing:border-box !important;
        }
      }

      @media (min-width:701px) and (max-width:1100px){
        body.glueful-premium-ui #view-dashboard{
          left:24px !important;
          right:24px !important;
          top:76px !important;
        }
        body.glueful-premium-ui .bottom-nav{display:none !important;}
      }

      @media (max-width:700px){
        body.glueful-premium-ui #view-dashboard{
          transform:none !important;
          zoom:1 !important;
        }
      }
    `;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
