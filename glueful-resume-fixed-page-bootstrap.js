/* Glueful Resume Studio fixed-PDF bootstrap. Loaded by the service worker. */
(function(){
'use strict';
window.__gluefulFixedPdfScheduled = true;
const VERSION='20260819-fixedpdf9';
const ASSETS=[
 ['./glueful-resume-layout-model.js','glueful-fixed-layout-model-runtime'],
 ['./glueful-resume-pdf-layout-importer.js','glueful-fixed-pdf-importer-runtime'],
 ['./glueful-resume-fixed-page-renderer.js','glueful-fixed-page-renderer-runtime'],
 ['./glueful-resume-fixed-page-controller.js','glueful-fixed-page-controller-runtime']
];
function load(src,id){return new Promise((resolve,reject)=>{const existing=document.getElementById(id);if(existing){if(existing.dataset.loaded==='true')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(new Error(`Failed to load ${src}`)),{once:true});return}const s=document.createElement('script');s.id=id;s.src=src+'?v='+VERSION;s.async=false;s.dataset.gluefulFixedPdfRuntime='1';s.onload=()=>{s.dataset.loaded='true';resolve()};s.onerror=()=>reject(new Error(`Failed to load ${src}`));document.body.appendChild(s)})}
async function boot(){for(const [src,id] of ASSETS)await load(src,id);window.__gluefulFixedPdfReady=true;window.gluefulFixedPdfResumeStudio?.activate?.();console.info('[Glueful Resume Studio] fixed-PDF controller bootstrap loaded; PDF masters use fixed-page renderer',VERSION)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void boot(),{once:true});else void boot();
})();