/* Glueful Jobs Interactions V1 — instant UI response with safe persistence hooks */
(function(){'use strict';
if(window.__GLUEFUL_JOBS_INTERACTIONS_V1__)return;window.__GLUEFUL_JOBS_INTERACTIONS_V1__=true;
const KEY='glueful_saved_jobs_v1';
function read(){try{return new Set(JSON.parse(localStorage.getItem(KEY)||'[]').map(String))}catch(_){return new Set()}}
function write(s){try{localStorage.setItem(KEY,JSON.stringify([...s]))}catch(_){} }
function saved(id){return read().has(String(id))}
function paint(btn,on){if(!btn)return;btn.textContent=on?'♥':'♡';btn.setAttribute('aria-pressed',on?'true':'false');btn.classList.toggle('g15-save-active',on)}
async function persist(id,on){
  const fn=window.gluefulSaveJob||window.saveJob;
  if(typeof fn!=='function')return;
  const result=fn(String(id),on);
  if(result&&typeof result.then==='function')await result;
}
async function toggle(btn){
  const id=String(btn.dataset.save||'');if(!id||btn.dataset.pending==='1')return;
  const before=saved(id),after=!before;const s=read();after?s.add(id):s.delete(id);write(s);paint(btn,after);btn.dataset.pending='1';
  try{await persist(id,after);document.dispatchEvent(new CustomEvent('glueful:job-save-changed',{detail:{id,saved:after}}))}
  catch(e){const rollback=read();before?rollback.add(id):rollback.delete(id);write(rollback);paint(btn,before);console.debug('[Jobs save] persistence failed; rolled back',e)}
  finally{delete btn.dataset.pending}
}
function patch(root=document){root.querySelectorAll('[data-save]').forEach(btn=>{if(btn.dataset.g8InteractionBound==='1')return;btn.dataset.g8InteractionBound='1';paint(btn,saved(btn.dataset.save));btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggle(btn)})})}
function adaptivePrefetch(){const p=window.GluefulJobsPagination;if(!p)return;const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;const type=String(c?.effectiveType||'4g');if(c?.saveData||type==='2g')return;if(type==='3g')setTimeout(()=>p.prefetch(),500);else p.prefetch()}
function boot(){patch();adaptivePrefetch();const target=document.getElementById('jobs-view')||document.body;new MutationObserver(()=>patch(target)).observe(target,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.gluefulJobsInteractionsV1={refresh:patch,saved};
})();
