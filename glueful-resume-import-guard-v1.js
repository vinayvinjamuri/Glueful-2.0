/* Glueful Resume Studio — resume import guard V1
   Keeps the profile resume picker reliable on touch/mobile browsers and
   ensures the selected File reaches the existing parser/import pipeline. */
(function(){
'use strict';
const VERSION='20260820-importguard1';
function bind(){
  const input=document.getElementById('cp-resume-file');
  const label=document.querySelector('label[for="cp-resume-file"]');
  const importButton=document.getElementById('cp-resume-import-btn');
  if(input && !input.dataset.gluefulImportGuard){
    input.dataset.gluefulImportGuard=VERSION;
    input.addEventListener('change',function(event){
      const fn=window.handleCandidateResumeUpload;
      if(typeof fn==='function'){
        Promise.resolve(fn(event)).catch(error=>console.error('[Glueful] resume upload failed:',error));
      }
    });
  }
  if(label && !label.dataset.gluefulImportGuard){
    label.dataset.gluefulImportGuard=VERSION;
    label.addEventListener('click',function(){
      if(input) setTimeout(function(){try{input.focus({preventScroll:true})}catch(_){ }},0);
    });
  }
  if(importButton && !importButton.dataset.gluefulImportGuard){
    importButton.dataset.gluefulImportGuard=VERSION;
    importButton.addEventListener('click',function(){
      if(importButton.disabled){
        const status=document.getElementById('cp-resume-status');
        if(status && !status.textContent.trim()) status.textContent='Choose a PDF, DOCX or TXT resume first.';
      }
    });
  }
}
function boot(){bind();setTimeout(bind,300);setTimeout(bind,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.gluefulResumeImportGuard={bind,version:VERSION};
})();