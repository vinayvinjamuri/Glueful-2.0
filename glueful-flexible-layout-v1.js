/* Glueful — Flexible Layout V1
 * App-wide layout-only responsiveness.
 * Keeps the 260px desktop sidebar stable and lets every main view adapt
 * fluidly to available width. Does not change data, navigation, handlers,
 * or feature behavior.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_FLEXIBLE_LAYOUT_V1__) return;
  window.__GLUEFUL_FLEXIBLE_LAYOUT_V1__=true;

  const STYLE_ID='glueful-flexible-layout-v1-style';
  const css=`
    :root{
      --glueful-sidebar-width:260px;
      --glueful-page-gutter:clamp(16px,2.15vw,32px);
      --glueful-page-top:clamp(18px,2vw,30px);
      --glueful-page-bottom:clamp(34px,4vw,56px);
    }

    html,body{
      max-width:100%;
      overflow-x:hidden!important;
    }

    /* Stable desktop/tablet canvas: exactly 260px is reserved for the sidebar. */
    @media(min-width:768px){
      body #view-dashboard,
      body #view-applications,
      body #view-interviews,
      body #view-profile,
      body #view-saved-jobs,
      body #view-settings,
      body #view-jobs,
      body #view-resume,
      body #view-resumes,
      body #view-add-application,
      body #view-gmail{
        box-sizing:border-box!important;
        width:calc(100vw - var(--glueful-sidebar-width))!important;
        max-width:none!important;
        margin-left:var(--glueful-sidebar-width)!important;
        margin-right:0!important;
        min-width:0!important;
        overflow-x:hidden!important;
      }

      /* Normalize only the outer canvas geometry; inner feature layouts keep ownership. */
      body #view-dashboard,
      body #view-interviews,
      body #view-profile,
      body #view-saved-jobs,
      body #view-settings,
      body #view-jobs,
      body #view-resume,
      body #view-resumes,
      body #view-add-application,
      body #view-gmail{
        padding-left:var(--glueful-page-gutter)!important;
        padding-right:var(--glueful-page-gutter)!important;
        padding-top:var(--glueful-page-top)!important;
        padding-bottom:var(--glueful-page-bottom)!important;
      }

      body #view-dashboard > *,
      body #view-applications > *,
      body #view-interviews > *,
      body #view-profile > *,
      body #view-saved-jobs > *,
      body #view-settings > *,
      body #view-jobs > *,
      body #view-resume > *,
      body #view-resumes > *,
      body #view-add-application > *,
      body #view-gmail > *{
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }

      body #view-dashboard img,
      body #view-applications img,
      body #view-interviews img,
      body #view-profile img,
      body #view-saved-jobs img,
      body #view-settings img,
      body #view-jobs img,
      body #view-resume img,
      body #view-resumes img,
      body #view-add-application img,
      body #view-gmail img,
      body #view-dashboard video,
      body #view-applications video,
      body #view-interviews video,
      body #view-profile video,
      body #view-saved-jobs video,
      body #view-settings video,
      body #view-jobs video,
      body #view-resume video,
      body #view-resumes video,
      body #view-add-application video,
      body #view-gmail video{
        max-width:100%!important;
        height:auto;
      }

      body #view-dashboard input,
      body #view-dashboard select,
      body #view-dashboard textarea,
      body #view-applications input,
      body #view-applications select,
      body #view-applications textarea,
      body #view-interviews input,
      body #view-interviews select,
      body #view-interviews textarea,
      body #view-profile input,
      body #view-profile select,
      body #view-profile textarea,
      body #view-saved-jobs input,
      body #view-saved-jobs select,
      body #view-saved-jobs textarea,
      body #view-settings input,
      body #view-settings select,
      body #view-settings textarea,
      body #view-jobs input,
      body #view-jobs select,
      body #view-jobs textarea,
      body #view-resume input,
      body #view-resume select,
      body #view-resume textarea,
      body #view-resumes input,
      body #view-resumes select,
      body #view-resumes textarea,
      body #view-add-application input,
      body #view-add-application select,
      body #view-add-application textarea,
      body #view-gmail input,
      body #view-gmail select,
      body #view-gmail textarea{
        max-width:100%!important;
        box-sizing:border-box!important;
      }

      body #view-applications table,
      body #view-interviews table,
      body #view-profile table,
      body #view-jobs table,
      body #view-resume table,
      body #view-resumes table{
        max-width:100%!important;
      }
    }

    /* Phones: full-width content with compact fluid gutters; sidebar remains owned by its native drawer. */
    @media(max-width:767px){
      body #view-dashboard,
      body #view-applications,
      body #view-interviews,
      body #view-profile,
      body #view-saved-jobs,
      body #view-settings,
      body #view-jobs,
      body #view-resume,
      body #view-resumes,
      body #view-add-application,
      body #view-gmail{
        box-sizing:border-box!important;
        width:100%!important;
        max-width:100%!important;
        margin-left:0!important;
        margin-right:0!important;
        min-width:0!important;
        padding-left:clamp(12px,4vw,18px)!important;
        padding-right:clamp(12px,4vw,18px)!important;
        padding-top:14px!important;
        padding-bottom:86px!important;
        overflow-x:hidden!important;
      }

      body #view-dashboard > *,
      body #view-applications > *,
      body #view-interviews > *,
      body #view-profile > *,
      body #view-saved-jobs > *,
      body #view-settings > *,
      body #view-jobs > *,
      body #view-resume > *,
      body #view-resumes > *,
      body #view-add-application > *,
      body #view-gmail > *{
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }

      body #view-dashboard img,
      body #view-applications img,
      body #view-interviews img,
      body #view-profile img,
      body #view-saved-jobs img,
      body #view-settings img,
      body #view-jobs img,
      body #view-resume img,
      body #view-resumes img,
      body #view-add-application img,
      body #view-gmail img{
        max-width:100%!important;
        height:auto;
      }
    }

    /* The existing Resume reference shell had a desktop minimum width.
       Remove that constraint so the same design can fluidly shrink. */
    @media(min-width:768px){
      body #view-resumes .glueful-resumes-reference-shell{
        width:min(1040px,100%)!important;
        max-width:100%!important;
        min-width:0!important;
        margin-left:auto!important;
        margin-right:auto!important;
        box-sizing:border-box!important;
      }

      body #view-resumes .glueful-resumes-title-row,
      body #view-resumes .glueful-resumes-reference-top{
        max-width:100%!important;
      }
    }

    /* Interviews: keep the reference shell fully fluid instead of allowing
       a fixed desktop rail/search width to push content off-screen. */
    @media(min-width:768px){
      body #view-interviews .glueful-interviews-reference-v6-shell,
      body #view-interviews .glueful-interviews-reference-v5-shell,
      body #view-interviews .glueful-interviews-reference-v4-shell,
      body #view-interviews .glueful-interviews-reference-v3-shell{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      body #view-interviews .glueful-interviews-reference-v6-search-wrap,
      body #view-interviews .glueful-interviews-reference-v6-search,
      body #view-interviews .glueful-interviews-reference-v5-search-wrap,
      body #view-interviews .glueful-interviews-reference-v5-search,
      body #view-interviews .glueful-interviews-reference-v4-search-wrap,
      body #view-interviews .glueful-interviews-reference-v4-search{
        max-width:100%!important;
      }
    }

    /* Narrow desktop/tablet: allow rows/toolbars to wrap instead of overflow. */
    @media(min-width:768px) and (max-width:1279px){
      body #view-dashboard .view-header,
      body #view-applications .view-header,
      body #view-interviews .view-header,
      body #view-profile .view-header,
      body #view-jobs .view-header,
      body #view-resume .view-header,
      body #view-resumes .view-header{
        flex-wrap:wrap!important;
      }
      body #view-dashboard .toolbar,
      body #view-applications .toolbar,
      body #view-interviews .toolbar,
      body #view-profile .toolbar,
      body #view-jobs .toolbar,
      body #view-resume .toolbar,
      body #view-resumes .toolbar{
        max-width:100%!important;
      }
    }
  `;

  function install(){
    let style=document.getElementById(STYLE_ID);
    if(!style){
      style=document.createElement('style');
      style.id=STYLE_ID;
      style.textContent=css;
      (document.head||document.documentElement).appendChild(style);
    }
    // Keep this layout layer last in the cascade without modifying page content.
    if(document.head && style.parentNode===document.head && document.head.lastElementChild!==style){
      document.head.appendChild(style);
    }
  }

  function boot(){
    install();
    [250,800,1800,3500,6000].forEach(function(t){setTimeout(install,t);});
    if(document.head){
      new MutationObserver(function(mutations){
        for(const mutation of mutations){
          if(mutation.type==='childList' && Array.from(mutation.addedNodes||[]).some(function(n){return n!==document.getElementById(STYLE_ID) && n.nodeType===1 && (n.tagName==='STYLE'||n.tagName==='LINK'||n.tagName==='SCRIPT');})){
            install();
            break;
          }
        }
      }).observe(document.head,{childList:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
