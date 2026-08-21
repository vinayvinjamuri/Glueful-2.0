/* Resume Studio Viewer Layout Test V1 — browser-run diagnostics */
(function(){'use strict';
window.runGluefulResumeViewerLayoutTest=function(){
 const pages=[...document.querySelectorAll('.glueful-fixed-page')],results={pages:pages.length,positiveSize:true,noOverlap:true,noTransforms:true,pass:true};
 pages.forEach((p,i)=>{const r=p.getBoundingClientRect();if(r.width<=0||r.height<=0)results.positiveSize=false;if(getComputedStyle(p).transform!=='none')results.noTransforms=false;if(i&&r.top<pages[i-1].getBoundingClientRect().bottom-1)results.noOverlap=false});
 results.pass=results.positiveSize&&results.noOverlap&&results.noTransforms;return results;
};
})();