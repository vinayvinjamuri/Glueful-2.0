/* Glueful Jobs Discover V6 click/detail hotfix */
(function(){'use strict';
const FN='https://xztbhheexianejsvwpva.supabase.co/functions/v1/get-personalized-jobs';
const KEY=window.SUPABASE_KEY||'sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
let feedPromise=null;
function closeSheet(){document.querySelectorAll('.g6-sheet').forEach(x=>x.remove());}
async function getToken(){try{if(window.supabaseClient){const x=await window.supabaseClient.auth.getSession();return x.data?.session?.access_token||''}if(window.supabase?.createClient){const c=window.supabase.createClient('https://xztbhheexianejsvwpva.supabase.co',KEY);const x=await c.auth.getSession();return x.data?.session?.access_token||''}}catch{}return ''}
async function getJobs(){if(feedPromise)return feedPromise;feedPromise=(async()=>{const token=await getToken();if(!token)throw Error('No active session');const r=await fetch(FN,{headers:{Authorization:`Bearer ${token}`,apikey:KEY,Accept:'application/json'},cache:'no-store'});if(!r.ok)throw Error(`feed ${r.status}`);const d=await r.json();if(!d.ok)throw Error(d.error||'feed failed');return Array.isArray(d.jobs)?d.jobs:[]})().finally(()=>{feedPromise=null});return feedPromise}
function applyUrl(j){return j.apply_url||j.application_url||j.job_url||j.url||j.source_url||j.external_url||''}
function showDetails(j){
 closeSheet();
 const s=document.createElement('div');s.className='g6-detail-sheet';
 const desc=clean(j.description||j.job_description||j.summary||'');
 const url=applyUrl(j);
 s.innerHTML=`<div class="g6-detail-card" role="dialog" aria-modal="true"><header><div><div class="g6-detail-company">${esc(j.company||'Company')}</div><h2>${esc(j.title||'Untitled role')}</h2><p>${esc(loc(j))}</p></div><button class="g6-detail-close" type="button" aria-label="Close">×</button></header><div class="g6-detail-body">${desc?`<div class="g6-detail-description">${esc(desc).replace(/\n/g,'<br>')}</div>`:`<p class="g6-detail-empty">Full job description is not available in the feed.</p>`}</div><footer>${url?`<button class="g6-detail-apply" type="button" data-url="${esc(url)}">Apply / Open original posting →</button>`:''}</footer></div>`;
 document.body.appendChild(s);document.body.style.overflow='hidden';
 const close=()=>{s.remove();document.body.style.removeProperty('overflow')};
 s.querySelector('.g6-detail-close').onclick=close;
 s.addEventListener('click',e=>{if(e.target===s)close();const b=e.target.closest('[data-url]');if(b){const u=b.dataset.url;if(/^https?:\/\//i.test(u))window.open(u,'_blank','noopener,noreferrer')}});
 s.addEventListener('keydown',e=>{if(e.key==='Escape')close()});s.tabIndex=-1;s.focus();
}
function loc(j){return clean(j.location)}
async function handle(id){try{const jobs=await getJobs();const j=jobs.find(x=>String(x.id)===String(id));if(!j)throw Error('Role not found in live feed');try{localStorage.setItem('glueful_recent_jobs',JSON.stringify([j.id,...JSON.parse(localStorage.getItem('glueful_recent_jobs')||'[]').filter(x=>String(x)!==String(j.id))].slice(0,50)))}catch{}showDetails(j)}catch(e){console.warn('[Glueful Jobs click hotfix]',e);window.showToast?.('Unable to open this role right now. Please refresh the feed.')}}
document.addEventListener('click',function(e){const row=e.target.closest('.g6-list-row');if(row){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();void handle(row.dataset.id);return}const open=e.target.closest('.g6-open');if(open){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();void handle(open.dataset.openId);return}},true);
const style=document.createElement('style');style.textContent=`.g6-detail-sheet{position:fixed;inset:0;z-index:100001;background:rgba(3,5,10,.78);display:flex;align-items:flex-end;justify-content:center}.g6-detail-card{box-sizing:border-box;width:100%;max-width:820px;max-height:90vh;overflow:auto;background:var(--card,#151a25);color:var(--text,#f4f6fb);border:1px solid var(--border,rgba(255,255,255,.1));border-radius:22px 22px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -12px 40px rgba(0,0,0,.35)}.g6-detail-card header{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.g6-detail-card h2{margin:4px 0 0;font-size:20px;line-height:1.2}.g6-detail-company{font-size:13px;color:#a98bff;font-weight:800}.g6-detail-card header p{margin:6px 0 0;color:var(--text-muted,#aeb5c4);font-size:12px}.g6-detail-close{width:38px;height:38px;flex:0 0 38px;border:0;border-radius:12px;background:var(--surface,#1b2230);color:var(--text,#fff);font-size:26px;line-height:1}.g6-detail-body{margin-top:18px;padding-top:16px;border-top:1px solid var(--border,rgba(255,255,255,.08));font-size:13px;line-height:1.65;color:var(--text-muted,#d1d6e0)}.g6-detail-description{white-space:normal}.g6-detail-empty{color:var(--text-faint,#8d95a5)}.g6-detail-card footer{margin-top:18px}.g6-detail-apply{width:100%;border:0;border-radius:13px;padding:13px 16px;background:linear-gradient(135deg,#7b36ff,#3e75ff);color:#fff;font-weight:850}.g6-detail-sheet button{cursor:pointer}@media(min-width:700px){.g6-detail-card{border-radius:22px;margin:20px;max-height:86vh}}`;
document.head.appendChild(style);
window.addEventListener('pageshow',()=>{if(!document.querySelector('.g6-sheet'))document.body.style.removeProperty('overflow')});
})();