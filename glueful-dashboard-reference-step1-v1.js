/* Glueful Dashboard Reference Step 1
 * Aligns the existing dashboard with the approved reference direction.
 * Step 1 removes the legacy activity calendar from the dashboard and
 * gives Upcoming Interviews the visual priority used by the reference.
 * Existing data, navigation, and interview/application behavior remain intact.
 */
(function(){
  'use strict';
  const STYLE_ID='glueful-dashboard-reference-step1-v1';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP1_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP1_V1__=true;

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* The approved reference dashboard does not use the large activity
         calendar. Keep its underlying data/handlers intact, but remove the
         visual block so the dashboard can prioritize applications/interviews. */
      body.glueful-apple-dashboard #view-dashboard .heat-card{
        display:none!important;
      }

      /* Upcoming Interviews becomes the next primary dashboard section. */
      body.glueful-apple-dashboard #view-dashboard #dashboard-interviews{
        margin:18px 0 30px!important;
        padding:0!important;
      }

      body.glueful-apple-dashboard #view-dashboard #dashboard-interviews .section-title{
        margin:0 0 10px!important;
        font-size:18px!important;
        line-height:1.2!important;
        font-weight:700!important;
        letter-spacing:-.02em!important;
      }

      body.glueful-apple-dashboard #view-dashboard #dashboard-interviews .empty-state{
        min-height:88px!important;
        padding:18px!important;
        box-sizing:border-box!important;
        border-radius:16px!important;
      }

      @media(max-width:700px){
        body.glueful-apple-dashboard #view-dashboard #dashboard-interviews{
          margin:12px 0 22px!important;
        }
        body.glueful-apple-dashboard #view-dashboard #dashboard-interviews .section-title{
          font-size:15px!important;
          margin-bottom:8px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function active(){
    const d=document.getElementById('view-dashboard');
    return !!d&&(d.classList.contains('active')||d.style.display==='block');
  }

  function sync(){
    install();
    document.body.classList.toggle('glueful-dashboard-reference-step1',active());
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',sync,{once:true});
  }else{
    sync();
  }
})();
