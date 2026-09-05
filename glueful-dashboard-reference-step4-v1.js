/* Glueful Dashboard Reference Step 4
 * Adds the Recent Applications dashboard section from existing application data.
 * Existing application page, navigation, and database behavior remain intact.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP4_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP4_V1__=true;

  const STYLE_ID='glueful-dashboard-reference-step4-v1-style';
  const HOST_ID='glueful-dashboard-recent-applications-v1';

  function active(){
    const d=document.getElementById('view-dashboard');
    return !!d&&(d.classList.contains('active')||d.style.display==='block');
  }

  function escapeHtml(value){
    return String(value==null?'':value)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function pick(row,names){
    for(const name of names){
      if(row && row[name]!=null && String(row[name]).trim()!=='') return row[name];
    }
    return '';
  }

  function formatDate(value){
    if(!value) return '—';
    const d=new Date(value);
    if(Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
  }

  function statusClass(status){
    return String(status||'').toLowerCase().replace(/[^a-z0-9]+/g,'-') || 'unknown';
  }

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      body.glueful-apple-dashboard #${HOST_ID}{
        margin:18px 0 32px;
      }
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-head{
        display:flex;align-items:center;justify-content:space-between;gap:16px;
        margin:0 0 10px;
      }
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-title{
        margin:0;color:#1d1d1f;font-size:20px;line-height:1.2;font-weight:700;
        letter-spacing:-.025em;
      }
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-viewall{
        border:0;background:transparent;color:#0071e3;font:600 12px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        cursor:pointer;padding:6px 2px;
      }
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-card{
        overflow:hidden;background:#fff;border:1px solid #e5e5ea;border-radius:18px;
        box-shadow:0 10px 30px rgba(0,0,0,.045);
      }
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-table{
        width:100%;border-collapse:collapse;table-layout:fixed;
      }
      body.glueful-apple-dashboard #${HOST_ID} th{
        padding:10px 14px;text-align:left;color:#6e6e73;background:#fafafa;
        font:600 10px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        border-bottom:1px solid #e5e5ea;
      }
      body.glueful-apple-dashboard #${HOST_ID} td{
        padding:12px 14px;color:#1d1d1f;font:500 11px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        border-bottom:1px solid #f0f0f2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      }
      body.glueful-apple-dashboard #${HOST_ID} tr:last-child td{border-bottom:0}
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-company{font-weight:700}
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-role{color:#6e6e73}
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-status{
        display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;
        background:#f2f2f7;color:#3a3a3c;font-size:10px;font-weight:700;
      }
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-status.interview{background:#e6f7ef;color:#16834b}
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-status.offer{background:#e6f7ef;color:#16834b}
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-status.applied{background:#edf2ff;color:#315bdc}
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-status.screening{background:#f0edff;color:#6941d9}
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-status.assessment{background:#fff4df;color:#a56b00}
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-status.rejected{background:#ffe9eb;color:#d92d3d}
      body.glueful-apple-dashboard #${HOST_ID} .gf-ra-empty{
        padding:30px 20px;text-align:center;color:#6e6e73;font-size:12px;
      }
      @media(max-width:700px){
        body.glueful-apple-dashboard #${HOST_ID}{margin:12px 0 22px}
        body.glueful-apple-dashboard #${HOST_ID} .gf-ra-title{font-size:15px}
        body.glueful-apple-dashboard #${HOST_ID} th,
        body.glueful-apple-dashboard #${HOST_ID} td{padding:10px 9px;font-size:9px}
        body.glueful-apple-dashboard #${HOST_ID} th:nth-child(3),
        body.glueful-apple-dashboard #${HOST_ID} td:nth-child(3){display:none}
      }
    `;
    document.head.appendChild(s);
  }

  async function fetchApplications(){
    try{
      if(!window.supabaseClient||!window.supabaseClient.auth) return [];
      const session=await window.supabaseClient.auth.getSession();
      const user=session?.data?.session?.user;
      if(!user) return [];
      const result=await window.supabaseClient.from('applications').select('*');
      if(result.error||!Array.isArray(result.data)) return [];
      return result.data.slice().sort((a,b)=>{
        const da=new Date(pick(a,['applied_date','appliedDate','created_at','createdAt'])).getTime()||0;
        const db=new Date(pick(b,['applied_date','appliedDate','created_at','createdAt'])).getTime()||0;
        return db-da;
      }).slice(0,5);
    }catch(_){return []}
  }

  function render(rows){
    const d=document.getElementById('view-dashboard');
    if(!d||!active()) return;
    let host=d.querySelector('#'+HOST_ID);
    if(!host){
      host=document.createElement('section');
      host.id=HOST_ID;
      const interviews=d.querySelector('#dashboard-interviews');
      if(interviews && interviews.parentElement) interviews.parentElement.insertBefore(host,interviews);
      else d.appendChild(host);
    }

    host.innerHTML=`<div class="gf-ra-head"><h2 class="gf-ra-title">Recent Applications</h2><button class="gf-ra-viewall" type="button">View all</button></div><div class="gf-ra-card">${rows.length?`<table class="gf-ra-table"><thead><tr><th>Company</th><th>Role</th><th>Applied</th><th>Status</th><th>Next Action</th></tr></thead><tbody>${rows.map(row=>{
      const company=pick(row,['company','company_name','companyName'])||'Unknown company';
      const role=pick(row,['job_title','jobTitle','role','position'])||'—';
      const applied=pick(row,['applied_date','appliedDate','created_at','createdAt']);
      const status=pick(row,['status','application_status','applicationStatus'])||'—';
      const next=pick(row,['next_action','nextAction','notes'])||'—';
      return `<tr><td class="gf-ra-company">${escapeHtml(company)}</td><td class="gf-ra-role">${escapeHtml(role)}</td><td>${escapeHtml(formatDate(applied))}</td><td><span class="gf-ra-status ${statusClass(status)}">${escapeHtml(status)}</span></td><td>${escapeHtml(next)}</td></tr>`;
    }).join('')}</tbody></table>`:'<div class="gf-ra-empty">No applications to show yet.</div>'}</div>`;
    host.querySelector('.gf-ra-viewall')?.addEventListener('click',function(){
      if(typeof window.drawerNavigate==='function') window.drawerNavigate('applications');
      else if(typeof window.navigateTo==='function') window.navigateTo('applications');
    });
  }

  async function sync(){
    install();
    if(!active()) return;
    render([]);
    const rows=await fetchApplications();
    if(active()) render(rows);
  }

  function start(){
    install();
    sync();
    document.addEventListener('click',function(){setTimeout(sync,400)},true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
