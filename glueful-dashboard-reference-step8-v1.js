/* Glueful Dashboard Reference Step 8 — Needs Attention polish
 * Visual/data presentation only. Uses existing application data and navigation.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP8_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP8_V1__=true;
  const STYLE_ID='glueful-dashboard-reference-step8-style';
  const HOST_ID='glueful-dashboard-attention-v1';
  function active(){const d=document.getElementById('view-dashboard');return !!d&&(d.classList.contains('active')||d.style.display==='block');}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function pick(row,names){for(const n of names)if(row&&row[n]!=null&&String(row[n]).trim()!=='')return row[n];return '';}
  function date(v){if(!v)return '';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);return d.toLocaleDateString(undefined,{month:'short',day:'numeric'});}
  function logo(row,company){return pick(row,['logo_url','logoUrl','company_logo_url','companyLogoUrl','company_logo','companyLogo','logo'])||'';}
  function install(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
    body.glueful-apple-dashboard #${HOST_ID} .gf-attention{padding:18px!important}
    body.glueful-apple-dashboard #${HOST_ID} .gf-attention .gf-copy{margin-bottom:10px!important}
    body.glueful-apple-dashboard #${HOST_ID} .gf-attention-list{display:grid;gap:6px}
    body.glueful-apple-dashboard #${HOST_ID} .gf-attention-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;align-items:center;gap:10px;min-height:46px;padding:7px 9px;border:1px solid #ececf0;border-radius:12px;background:#fff;box-sizing:border-box}
    body.glueful-apple-dashboard #${HOST_ID} .gf-attention-logo{width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#f2f2f7;color:#1d1d1f;font:700 11px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    body.glueful-apple-dashboard #${HOST_ID} .gf-attention-logo img{width:100%;height:100%;object-fit:contain;background:#fff}
    body.glueful-apple-dashboard #${HOST_ID} .gf-attention-company{font:700 11px/1.2 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1d1d1f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    body.glueful-apple-dashboard #${HOST_ID} .gf-attention-meta{margin-top:2px;font:500 9px/1.25 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#6e6e73;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    body.glueful-apple-dashboard #${HOST_ID} .gf-attention-action{display:flex;flex-direction:column;align-items:flex-end;gap:2px}
    body.glueful-apple-dashboard #${HOST_ID} .gf-attention-action button{border:0;background:transparent;color:#0071e3;font:700 9px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;padding:3px}
    body.glueful-apple-dashboard #${HOST_ID} .gf-attention-date{font:500 8px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#6e6e73}
    @media(max-width:700px){body.glueful-apple-dashboard #${HOST_ID} .gf-attention{padding:15px!important}.gf-attention-row{grid-template-columns:30px minmax(0,1fr) auto!important;min-height:43px!important;padding:6px 7px!important}}
  `;document.head.appendChild(s);}
  async function fetchRows(){try{const sb=window.supabaseClient;if(!sb?.auth)return[];const session=await sb.auth.getSession();if(!session?.data?.session?.user)return[];const r=await sb.from('applications').select('*');if(r.error||!Array.isArray(r.data))return[];return r.data.filter(x=>{const st=String(pick(x,['status','application_status','applicationStatus'])).toLowerCase();return ['applied','screening','assessment','interview'].includes(st)}).sort((a,b)=>{const da=new Date(pick(a,['applied_date','appliedDate','created_at','createdAt'])).getTime()||0;const db=new Date(pick(b,['applied_date','appliedDate','created_at','createdAt'])).getTime()||0;return db-da}).slice(0,4);}catch(_){return[]}}
  function render(rows){const d=document.getElementById('view-dashboard');if(!d||!active())return;const host=d.querySelector('#'+HOST_ID);if(!host)return;const box=host.querySelector('.gf-attention');if(!box)return;const old=box.querySelector('.gf-attention-list');if(old)old.remove();const list=document.createElement('div');list.className='gf-attention-list';if(!rows.length){list.innerHTML='<div class="gf-copy">No applications currently need attention.</div>';box.appendChild(list);return;}list.innerHTML=rows.map(row=>{const company=pick(row,['company','company_name','companyName'])||'Unknown company';const role=pick(row,['job_title','jobTitle','role','position'])||'Application';const st=pick(row,['status','application_status','applicationStatus'])||'Applied';const next=pick(row,['next_action','nextAction'])||'Follow up';const when=date(pick(row,['applied_date','appliedDate','created_at','createdAt']));const src=logo(row,company);const media=src?`<img src="${esc(src)}" alt="" loading="lazy" onerror="this.style.display='none'">`:esc(company.trim().charAt(0).toUpperCase()||'?');return `<div class="gf-attention-row"><div class="gf-attention-logo">${media}</div><div><div class="gf-attention-company">${esc(company)}</div><div class="gf-attention-meta">${esc(role)} · ${esc(st)}</div></div><div class="gf-attention-action"><button type="button" data-gf-company="${esc(company)}">${esc(next)}</button><span class="gf-attention-date">${esc(when)}</span></div></div>`;}).join('');box.appendChild(list);list.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{const c=btn.getAttribute('data-gf-company');const d=document.getElementById('view-dashboard');const row=Array.from(d.querySelectorAll('.gf-ra-company')).find(x=>(x.textContent||'').trim()===c);if(row){row.scrollIntoView({behavior:'smooth',block:'center'});return;}if(typeof window.drawerNavigate==='function')window.drawerNavigate('applications');}));}
  async function sync(){install();if(!active())return;const rows=await fetchRows();if(active())render(rows);}
  function start(){install();sync();document.addEventListener('click',()=>setTimeout(sync,500),true);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
