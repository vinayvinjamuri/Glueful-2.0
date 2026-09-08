/* Glueful — Resume Studio V3 visual authority
 * The Resume Studio hub is the only visible content inside the Resumes view.
 * Legacy resume-library markup remains available to underlying editor helpers,
 * but is never allowed to render alongside the new hub.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUMES_V3_AUTHORITY__) return;
  window.__GLUEFUL_RESUMES_V3_AUTHORITY__=true;
  const VIEW='view-resumes', HUB='glueful-resume-studio-v3', STYLE='glueful-resumes-v3-authority-style';
  function install(){
    if(!document.getElementById(STYLE)){
      const s=document.createElement('style');
      s.id=STYLE;
      s.textContent=`
        #${VIEW} > :not(#${HUB}){display:none !important;}
        #${VIEW} > #${HUB}{display:block !important;}
      `;
      (document.head||document.documentElement).appendChild(s);
    }
    const v=document.getElementById(VIEW);
    if(!v)return;
    [...v.children].forEach(el=>{if(el.id!==HUB)el.setAttribute('data-glueful-resume-legacy-hidden','1')});
  }
  function boot(){install();setTimeout(install,0);setTimeout(install,300)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('glueful-initial-view-ready',e=>{if(e.detail?.view===VIEW)install()});
})();
