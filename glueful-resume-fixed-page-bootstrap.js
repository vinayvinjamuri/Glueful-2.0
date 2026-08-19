/* Glueful Resume Studio fixed-PDF bootstrap. Loaded by the service worker. */
(function(){
'use strict';

/*
 * Fixed-PDF must become the authority BEFORE its async renderer assets finish
 * loading. Previously there was a window during which the legacy DOCX editor
 * could still be opened. Once that happened, later authority watchdogs could
 * replace the function but could not replace the already-rendered editor.
 */
window.__gluefulFixedPdfScheduled = true;
const VERSION='20260819-fixedpdf11';
const ASSETS=[
 ['./glueful-resume-layout-model.js','glueful-fixed-layout-model-runtime'],
 ['./glueful-resume-pdf-layout-importer.js','glueful-fixed-pdf-importer-runtime'],
 ['./glueful-resume-fixed-page-renderer.js','glueful-fixed-page-renderer-runtime'],
 ['./glueful-resume-fixed-page-controller.js','glueful-fixed-page-controller-runtime']
];
let realOpen=null;
let realReset=null;
let runtimePromise=null;

function waitForRuntime(kind){
  return new Promise((resolve,reject)=>{
    const started=Date.now();
    const timer=setInterval(()=>{
      const studio=window.gluefulFixedPdfResumeStudio;
      const fn=studio?.[kind];
      if(typeof fn==='function'){
        clearInterval(timer);
        resolve(fn);
        return;
      }
      if(Date.now()-started>30000){
        clearInterval(timer);
        reject(new Error(`Fixed-PDF ${kind} controller did not become ready.`));
      }
    },25);
  });
}

function installAuthorityGate(){
  if(window.__gluefulFixedPdfAuthorityGateInstalled)return;
  window.__gluefulFixedPdfAuthorityGateInstalled=true;
  realOpen=window.openJobResumeEditor||null;
  realReset=window.resetJobResumeToMaster||null;
  window.openJobResumeEditor=async function(id){
    try{
      const fn=await waitForRuntime('open');
      return await fn(id);
    }catch(error){
      console.error('[Glueful Resume Studio] fixed-PDF open gate failed:',error);
      if(typeof realOpen==='function')return realOpen(id);
      throw error;
    }
  };
  window.resetJobResumeToMaster=async function(id){
    try{
      const fn=await waitForRuntime('reset');
      return await fn(id);
    }catch(error){
      console.error('[Glueful Resume Studio] fixed-PDF reset gate failed:',error);
      if(typeof realReset==='function')return realReset(id);
      throw error;
    }
  };
}

function load(src,id){
  return new Promise((resolve,reject)=>{
    const existing=document.getElementById(id);
    if(existing){
      if(existing.dataset.loaded==='true')return resolve();
      existing.addEventListener('load',resolve,{once:true});
      existing.addEventListener('error',()=>reject(new Error(`Failed to load ${src}`)),{once:true});
      return;
    }
    const s=document.createElement('script');
    s.id=id;
    s.src=src+'?v='+VERSION;
    s.async=false;
    s.dataset.gluefulFixedPdfRuntime='1';
    s.onload=()=>{s.dataset.loaded='true';resolve()};
    s.onerror=()=>reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s)
  })
}

async function boot(){
  installAuthorityGate();
  try{
    for(const [src,id] of ASSETS)await load(src,id);
    window.__gluefulFixedPdfReady=true;
    window.gluefulFixedPdfResumeStudio?.activate?.();
    console.info('[Glueful Resume Studio] fixed-PDF controller bootstrap loaded; PDF masters use fixed-page renderer',VERSION);
  }catch(error){
    console.error('[Glueful Resume Studio] fixed-PDF bootstrap failed:',error);
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void boot(),{once:true});
else void boot();
})();