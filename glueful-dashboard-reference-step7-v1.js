/* Glueful Dashboard Reference Step 7
 * Rebuilds only the dashboard Needs Attention and Application Pipeline surfaces
 * from the existing applications data. Existing application/interview behavior
 * and the actual Interviews page remain untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP7_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP7_V1__=true;

  const STYLE_ID='glueful-dashboard-reference-step7-v1-style';
  const HOST_ID='glueful-dashboard-attention-v1';

  function active(){const d=document.getElementById('view-dashboard');return !!d&&(d.classList.contains('active')||d.style.display==='block');}
  function pick(row,names){for(const n of names){if(row&&row[n]!=null&&String(row[n]).trim()!=='')return row[n]}return ''}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
  function date(v){if(!v)return '—';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}
  function norm(v){return String(v||'').trim().toLowerCase()}
  function install(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      body.glueful-apple-dashboard #${HOST_ID}{display:grid!important;grid-template-columns:minmax(0,1.55fr) minmax(300px,.7fr)!important;gap:14px!important;margin:0 0 18px!important}
      body.glueful-apple-dashboard #${HOST_ID} .gf-attention,body.glueful-apple-dashboard #${HOST_ID} .gf-search-health{min-width:0;background:#fff;border:1px solid #e5e5ea;border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.045);box-sizing:border-box}
      body.glueful-apple-dashboard #${HOST_ID} .gf-attention{padding:18px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-kicker{color:#6e6e73;font:600 11px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.01em;margin-bottom:7px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-heading{color:#1d1d1f;font:700 18px/1.2 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:-.025em;margin:0 0 5px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-copy{color:#6e6e73;font:500 11px/1.4 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0}
      body.glueful-apple-dashboard #${HOST_ID} .gf-attention-list{display:grid;gap:6px;margin-top:13px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-attention-row{display:grid;grid-template-columns:28px minmax(0,1fr) auto;align-items:center;gap:9px;padding:8px 9px;border:1px solid #f0f0f2;border-radius:12px;background:#fff}
      body.glueful-apple-dashboard #${HOST_ID} .gf-company-mark{width:28px;height:28px;border-radius:8px;background:#f2f2f7;display:grid;place-items:center;color:#1d1d1f;font:700 11px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      body.glueful-apple-dashboard #${HOST_ID} .gf-company{font:700 11px/1.2 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1d1d1f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      body.glueful-apple-dashboard #${HOST_ID} .gf-role{font:500 10px/1.2 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#6e6e73;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-attention-action{text-align:right;font:600 9px/1.25 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#0071e3;max-width:105px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-attention-action small{display:block;color:#6e6e73;font-weight:500;margin-top:2px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-empty{padding:18px 0;color:#6e6e73;font-size:11px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-search-health{padding:18px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-pipeline-top{display:flex;align-items:center;gap:15px;margin:5px 0 12px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-donut{width:92px;height:92px;flex:0 0 92px;border-radius:50%;display:grid;place-items:center;position:relative;background:conic-gradient(#5b8def 0deg 90deg,#6bcbad 90deg 180deg,#9b8afb 180deg 270deg,#e85b68 270deg 360deg)}
      body.glueful-apple-dashboard #${HOST_ID} .gf-donut:after{content:"";position:absolute;inset:14px;border-radius:50%;background:#fff}
      body.glueful-apple-dashboard #${HOST_ID} .gf-donut-center{position:relative;z-index:1;text-align:center;color:#1d1d1f;font:700 20px/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      body.glueful-apple-dashboard #${HOST_ID} .gf-donut-center small{display:block;color:#6e6e73;font:500 8px/1.2 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin-top:3px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-pipeline-total{font:700 28px/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1d1d1f;letter-spacing:-.04em}
      body.glueful-apple-dashboard #${HOST_ID} .gf-pipeline-sub{font:500 10px/1.35 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#6e6e73;margin-top:5px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-legend{display:grid;gap:6px;margin-top:6px}
      body.glueful-apple-dashboard #${HOST_ID} .gf-legend-row{display:grid;grid-template-columns:8px 1fr auto;gap:7px;align-items:center;font:500 10px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#6e6e73}
      body.glueful-apple-dashboard #${HOST_ID} .gf-dot{width:8px;height:8px;border-radius:50%}.gf-dot.applied{background:#5b8def}.gf-dot.screening{background:#9b8afb}.gf-dot.interview{background:#6bcbad}.gf-dot.offer{background:#2f9e71}.gf-dot.rejected{background:#e85b68}
      body.glueful-apple-dashboard #${HOST_ID} .gf-legend-row b{color:#1d1d1f;font-weight:700}
      @media(max-width:1100px){body.glueful-apple-dashboard #${HOST_ID}{grid-template-columns:1fr 1fr!important}}
      @media(max-width:700px){body.glueful-apple-dashboard #${HOST_ID}{grid-template-columns:1fr!important;gap:9px!important}body.glueful-apple-dashboard #${HOST_ID} .gf-attention,body.glueful-apple-dashboard #${HOST_ID} .gf-search-health{padding:15px;border-radius:16px}body.glueful-apple-dashboard #${HOST_ID} .gf-attention-row{grid-template-columns:26px minmax(0,1fr) auto;padding:7px}body.glueful-apple-dashboard #${HOST_ID} .gf-company-mark{width:26px;height:26px}}
    `;document.head.appendChild(s);
  }
  async function fetchRows(){
    try{const sb=window.supabaseClient;if(!sb?.auth)return [];const session=await sb.auth.getSession();if(!session?.data?.session?.user)return [];const r=await sb.from('applications').select('*');return r.error||!Array.isArray(r.data)?[]:r.data}catch(_){return []}
  }
  function render(rows){
    const d=document.getElementById('view-dashboard');if(!d||!active())return;
    let host=d.querySelector('#'+HOST_ID);if(!host)return;
    const activeRows=rows.filter(r=>['applied','screening','assessment','interview'].includes(norm(pick(r,['status','application_status','applicationStatus']))));
    activeRows.sort((a,b)=>{const na=pick(a,['next_action','nextAction'])?0:1;const nb=pick(b,['next_action','nextAction'])?0:1;if(na!==nb)return na-nb;return (new Date(pick(b,['applied_date','appliedDate','created_at','createdAt'])).getTime()||0)-(new Date(pick(a,['applied_date','appliedDate','created_at','createdAt'])).getTime()||0)});
    const attention=activeRows.slice(0,4);
    const counts={applied:0,screening:0,assessment:0,interview:0,offer:0,rejected:0};rows.forEach(r=>{const s=norm(pick(r,['status','application_status','applicationStatus']));if(Object.prototype.hasOwnProperty.call(counts,s))counts[s]++});
    const total=rows.length;
    const colors=['#5b8def','#9b8afb','#e3a63f','#6bcbad','#2f9e71','#e85b68'];
    const vals=[counts.applied,counts.screening,counts.assessment,counts.interview,counts.offer,counts.rejected];
    let cursor=0;const stops=[];vals.forEach((v,i)=>{const deg=total?(v/total)*360:0;stops.push(`${colors[i]} ${cursor}deg ${cursor+deg}deg`);cursor+=deg});
    const bg=total?`conic-gradient(${stops.join(',')})`:'#e5e5ea';
    host.innerHTML=`
      <section class="gf-attention">
        <div class="gf-kicker">NEEDS ATTENTION</div>
        <h2 class="gf-heading">${attention.length?`${attention.length} applications need your attention`:'Your pipeline is up to date'}</h2>
        <p class="gf-copy">Focus on the applications that need your next action.</p>
        <div class="gf-attention-list">${attention.length?attention.map(r=>{const company=pick(r,['company','company_name','companyName'])||'Unknown company';const role=pick(r,['job_title','jobTitle','role','position'])||'—';const status=pick(r,['status','application_status','applicationStatus'])||'';const next=pick(r,['next_action','nextAction'])||({interview:'Prepare for interview',assessment:'Complete assessment',screening:'Follow up',applied:'Follow up'}[norm(status)]||'Review application');const applied=pick(r,['applied_date','appliedDate','created_at','createdAt']);return `<div class="gf-attention-row"><div class="gf-company-mark">${esc(company.slice(0,1).toUpperCase())}</div><div><div class="gf-company">${esc(company)}</div><div class="gf-role">${esc(role)} · ${esc(status)}</div></div><div class="gf-attention-action">${esc(next)}<small>${esc(date(applied))}</small></div></div>`}).join(''):'<div class="gf-empty">No applications currently require attention.</div>'}</div>
      </section>
      <section class="gf-search-health">
        <div class="gf-kicker">APPLICATION PIPELINE</div>
        <div class="gf-pipeline-top"><div class="gf-donut" style="background:${bg}"><div class="gf-donut-center">${total}<small>Total</small></div></div><div><div class="gf-pipeline-total">${total}</div><div class="gf-pipeline-sub">Applications in your pipeline</div></div></div>
        <div class="gf-legend">
          <div class="gf-legend-row"><i class="gf-dot applied"></i><span>Applied</span><b>${counts.applied}</b></div>
          <div class="gf-legend-row"><i class="gf-dot screening"></i><span>Screening</span><b>${counts.screening}</b></div>
          <div class="gf-legend-row"><i class="gf-dot interview"></i><span>Interview</span><b>${counts.interview}</b></div>
          <div class="gf-legend-row"><i class="gf-dot offer"></i><span>Offer</span><b>${counts.offer}</b></div>
          <div class="gf-legend-row"><i class="gf-dot rejected"></i><span>Rejected</span><b>${counts.rejected}</b></div>
        </div>
      </section>`;
  }
  async function sync(){install();if(!active())return;const rows=await fetchRows();if(active())render(rows)}
  function start(){install();setTimeout(sync,350);document.addEventListener('click',()=>setTimeout(sync,500),true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
