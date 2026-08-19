/* Glueful Resume Studio — early fixed-PDF authority gate.
 * Prevents a click from opening the legacy DOCX editor while the fixed-page
 * renderer is still loading. This file intentionally contains no layout CSS.
 */
(function(){
  'use strict';

  let fixedRoute=false;
  try{ fixedRoute=new URLSearchParams(location.search).get('resumeRenderer')==='fixed-pdf'; }catch(_){ }
  if(!fixedRoute || window.__gluefulFixedPdfAuthorityGateInstalled)return;

  window.__gluefulFixedPdfAuthorityGateInstalled=true;
  window.__gluefulFixedPdfScheduled=true;

  const legacyOpen=window.openJobResumeEditor;
  const legacyReset=window.resetJobResumeToMaster;

  function waitFor(kind){
    return new Promise((resolve,reject)=>{
      const started=Date.now();
      const timer=setInterval(()=>{
        const studio=window.gluefulFixedPdfResumeStudio;
        const fn=studio && studio[kind];
        if(typeof fn==='function'){
          clearInterval(timer);
          resolve(fn);
          return;
        }
        if(Date.now()-started>30000){
          clearInterval(timer);
          reject(new Error('Fixed-PDF Resume Studio did not become ready. Legacy DOCX renderer was intentionally blocked.'));
        }
      },25);
    });
  }

  window.openJobResumeEditor=async function(id){
    const fn=await waitFor('open');
    return fn(id);
  };

  window.resetJobResumeToMaster=async function(id){
    const fn=await waitFor('reset');
    return fn(id);
  };

  window.__gluefulFixedPdfLegacyOpen=legacyOpen||null;
  window.__gluefulFixedPdfLegacyReset=legacyReset||null;
  console.info('[Glueful Resume Studio] early fixed-PDF authority gate installed. Legacy DOCX editor blocked for this route.');
})();