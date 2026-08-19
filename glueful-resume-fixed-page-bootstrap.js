/* Glueful Resume Studio fixed-PDF bootstrap. Loaded by the service worker. */
(function(){
'use strict';
window.__gluefulFixedPdfScheduled=true;
const VERSION='20260820-fixedpdf19';
const PDFJS=['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','glueful-fixed-pdfjs-runtime'];
const ASSETS=[
 PDFJS,
 ['./glueful-resume-layout-model.js','glueful-fixed-layout-model-runtime'],
 ['./glueful-resume-pdf-layout-importer.js','glueful-fixed-pdf-importer-runtime'],
 ['./glueful-resume-fixed-page-renderer.js','glueful-fixed-page-renderer-runtime'],
 ['./glueful-resume-fixed-page-controller.js','glueful-fixed-page-controller-runtime']
];
let realOpen=null,realReset=null,authorityWatchdog=null;
function waitForRuntime(kind){return new Promise((resolve,reject)=>{const started=Date.now();const timer=setInterval(()=>{const studio=window.gluefulFixedPdfResumeStudio,fn=studio?.[kind];if(typeof fn==='function'){clearInterval(timer);resolve(fn);return}if(Date.now()-started>30000){clearInterval(timer);reject(new Error(`Fixed-PDF ${kind} controller did not become ready.`))}},25)})}
function installAuthorityGate(){if(window.__gluefulFixedPdfAuthorityGateInstalled)return;if(typeof window.__gluefulLegacyResumeEditorOpen!=='function')window.__gluefulLegacyResumeEditorOpen=window.openJobResumeEditor||null;if(typeof window.__gluefulLegacyResumeEditorReset!=='function')window.__gluefulLegacyResumeEditorReset=window.resetJobResumeToMaster||null;realOpen=window.__gluefulLegacyResumeEditorOpen||null;realReset=window.__gluefulLegacyResumeEditorReset||null;window.__gluefulFixedPdfAuthorityGateInstalled=true;window.openJobResumeEditor=async function(id){try{return await(await waitForRuntime('open'))(id)}catch(error){console.error('[Glueful Resume Studio] fixed-PDF open gate failed:',error);if(typeof realOpen==='function')return realOpen(id);throw error}};window.resetJobResumeToMaster=async function(id){try{return await(await waitForRuntime('reset'))(id)}catch(error){console.error('[Glueful Resume Studio] fixed-PDF reset gate failed:',error);if(typeof realReset==='function')return realReset(id);throw error}}}
function enforceAuthority(){if(!window.__gluefulFixedPdfScheduled)return;const studio=window.gluefulFixedPdfResumeStudio;if(!studio||typeof studio.open!=='function')return;if(window.openJobResumeEditor!==studio.open)window.openJobResumeEditor=studio.open;if(typeof studio.reset==='function'&&window.resetJobResumeToMaster!==studio.reset)window.resetJobResumeToMaster=studio.reset;window.__gluefulFixedPdfAuthorityActive=true}
function startAuthorityWatchdog(){if(authorityWatchdog)return;enforceAuthority();authorityWatchdog=setInterval(enforceAuthority,100)}
function load(src,id){return new Promise((resolve,reject)=>{const existing=document.getElementById(id);if(existing){if(existing.dataset.loaded==='true')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(new Error(`Failed to load ${src}`)),{once:true});return}const s=document.createElement('script');s.id=id;s.src=src+'?v='+VERSION;s.async=false;s.dataset.gluefulFixedPdfRuntime='1';s.onload=()=>{s.dataset.loaded='true';resolve()};s.onerror=()=>reject(new Error(`Failed to load ${src}`));document.body.appendChild(s)})}
async function boot(){installAuthorityGate();startAuthorityWatchdog();try{for(const [src,id] of ASSETS)await load(src,id);if(!window.pdfjsLib)throw new Error('PDF.js runtime did not initialize.');window.__gluefulFixedPdfReady=true;window.gluefulFixedPdfResumeStudio?.activate?.();enforceAuthority();console.info('[Glueful Resume Studio] fixed-PDF runtime loaded:',VERSION)}catch(error){console.error('[Glueful Resume Studio] fixed-PDF bootstrap failed:',error)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void boot(),{once:true});else void boot();
})();