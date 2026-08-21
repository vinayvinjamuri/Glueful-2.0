/* Resume Studio Viewer Validation V1 — diagnostics only, no layout mutation */
(function(){'use strict';
if(window.__GLUEFUL_RESUME_VIEWER_VALIDATION_V1__)return;window.__GLUEFUL_RESUME_VIEWER_VALIDATION_V1__=true;
function validate(){
 const pages=[...document.querySelectorAll('.glueful-fixed-page')];
 const issues=[];
 pages.forEach((p,i)=>{const r=p.getBoundingClientRect();if(r.width<=0||r.height<=0)issues.push(`page ${i+1}: invalid dimensions`);if(getComputedStyle(p).position==='absolute')issues.push(`page ${i+1}: absolute positioning may cause overlap`);if(getComputedStyle(p).transform!=='none')issues.push(`page ${i+1}: transform is active`);if(i){const prev=pages[i-1].getBoundingClientRect();if(r.top<prev.bottom-1)issues.push(`page ${i+1}: overlaps previous page`)}});
 window.__GLUEFUL_RESUME_VIEWER_VALIDATION__={pages:pages.length,issues,valid:issues.length===0};
 if(issues.length)console.warn('[Resume Studio validation]',issues);else console.info('[Resume Studio validation] PASS',pages.length,'pages');
 return window.__GLUEFUL_RESUME_VIEWER_VALIDATION__;
}
window.validateGluefulResumeViewer=validate;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(validate,500),{once:true});else setTimeout(validate,500);
})();