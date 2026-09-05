/* Glueful Dashboard Mobile Reference V1
 * Presentation/data synchronization only. Keeps existing mobile navigation and
 * all application behavior intact. Mobile uses the same dashboard data model
 * and reference surfaces as desktop.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_MOBILE_REFERENCE_V1__) return;
  window.__GLUEFUL_DASHBOARD_MOBILE_REFERENCE_V1__=true;

  const STYLE_ID='glueful-dashboard-mobile-reference-v1-style';

  function active(){
    const d=document.getElementById('view-dashboard');
    return !!d&&(d.classList.contains('active')||d.style.display==='block');
  }
  function pick(row,names){for(const n of names){if(row&&row[n]!=null&&String(row[n]).trim()!=='')return row[n]}return ''}
  function norm(v){return String(v||'').trim().toLowerCase()}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
  function date(v){if(!v)return '—';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}

  function install(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      @media(max-width:700px){
        body.glueful-apple-dashboard{background:#f5f5f7!important;color:#1d1d1f!important}
        body.glueful-apple-dashboard #view-dashboard{background:#f5f5f7!important;color:#1d1d1f!important}
        body.glueful-apple-dashboard #view-dashboard .view-header{padding:4px 0 14px!important;margin:0!important}
        body.glueful-apple-dashboard #view-dashboard .view-title{color:#1d1d1f!important}
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{color:#6e6e73!important}
        body.glueful-apple-dashboard #view-dashboard .stat-card{background:#fff!important;color:#1d1d1f!important;border:1px solid #e5e5ea!important;box-shadow:0 8px 24px rgba(0,0,0,.045)!important}
        body.glueful-apple-dashboard #view-dashboard .stat-card .stat-label{color:#6e6e73!important}
        body.glueful-apple-dashboard #view-dashboard .stat-card .stat-value{color:#1d1d1f!important}
        body.glueful-apple-dashboard #view-dashboard .stat-card .stat-meta{color:#6e6e73!important}
        body.glueful-apple-dashboard #view-dashboard .stat-card.gf-rejected .stat-value{color:#e5484d!important}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1{display:grid!important;grid-template-columns:1fr!important;gap:9px!important;margin:0 0 12px!important}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-attention-v1>*{min-width:0!important}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1{display:block!important;color:#1d1d1f!important}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-title{color:#1d1d1f!important}
        body.glueful-apple-dashboard #view-dashboard #glueful-dashboard-recent-applications-v1 .gf-ra-card{background:#fff!important;color:#1d1d1f!important}
      }
    `;document.head.appendChild(s);
  }

  async function fetchRows(){
    try{const sb=window.supabaseClient;if(!sb?.auth)return [];const session=await sb.auth.getSession();if(!session?.data?.session?.user)return [];const r=await sb.from('applications').select('*');return r.error||!Array.isArray(r.data)?[]:r.data}catch(_){return []}
  }

  function counts(rows){
    const c={applied:0,screening:0,assessment:0,interview:0,offer:0,rejected:0};
    rows.forEach(r=>{const s=norm(pick(r,['status','application_status','applicationStatus']));if(Object.prototype.hasOwnProperty.call(c,s))c[s]++});
    return c;
  }

  function syncStats(d,c){
    const grid=d.querySelector('.stat-grid,.stats-grid');if(!grid)return;
    const cards=Array.from(grid.querySelectorAll('.stat-card')).slice(0,5);if(cards.length<5)return;
    const total=c.applied+c.screening+c.assessment+c.interview+c.offer+c.rejected;
    const values=[['Total Applications',total,'All applications in your dashboard'],['Active',c.applied+c.screening+c.assessment,'Applied, screening + assessment'],['Interviews',c.interview,'Interview stage'],['Offers',c.offer,'Offers received'],['Rejections',c.rejected,'Rejected applications']];
    cards.forEach((card,i)=>{const label=card.querySelector('.stat-label')||card.firstElementChild;const value=card.querySelector('.stat-value')||card.querySelector('[class*=value]');const meta=card.querySelector('.stat-meta,.stat-description')||card.lastElementChild;if(label)label.textContent=values[i][0];if(value)value.textContent=String(values[i][1]);if(meta)meta.textContent=values[i][2];card.classList.toggle('gf-rejected',i===4)});
  }

  function syncAttention(d,rows,c){
    let host=d.querySelector('#glueful-dashboard-attention-v1');if(!host)return;
    const activeRows=rows.filter(r=>['applied','screening','assessment','interview'].includes(norm(pick(r,['status','application_status','applicationStatus']))));
    activeRows.sort((a,b)=>(new Date(pick(b,['applied_date','appliedDate','created_at','createdAt'])).getTime()||0)-(new Date(pick(a,['applied_date','appliedDate','created_at','createdAt'])).getTime()||0));
    const attention=activeRows.slice(0,4);
    const total=rows.length;const vals=[c.applied,c.screening,c.assessment,c.interview,c.offer,c.rejected];const colors=['#5b8def','#9b8afb','#e3a63f','#6bcbad','#2f9e71','#e85b68'];let cursor=0,stops=[];vals.forEach((v,i)=>{const deg=total?(v/total)*360:0;stops.push(`${colors[i]} ${cursor}deg ${cursor+deg}deg`);cursor+=deg});const bg=total?`conic-gradient(${stops.join(',')})`:'#e5e5ea';
    host.innerHTML=`<section class="gf-attention"><div class="gf-kicker">NEEDS ATTENTION</div><h2 class="gf-heading">${attention.length?`${attention.length} applications need your attention`:'Your pipeline is up to date'}</h2><p class="gf-copy">Focus on the applications that need your next action.</p><div class="gf-attention-list">${attention.map(r=>{const company=pick(r,['company','company_name','companyName'])||'Unknown company';const role=pick(r,['job_title','jobTitle','role','position'])||'—';const status=pick(r,['status','application_status','applicationStatus'])||'';const next=pick(r,['next_action','nextAction'])||({interview:'Prepare for interview',assessment:'Complete assessment',screening:'Follow up',applied:'Follow up'}[norm(status)]||'Review application');return `<div class="gf-attention-row"><div class="gf-company-mark">${esc(company.slice(0,1).toUpperCase())}</div><div><div class="gf-company">${esc(company)}</div><div class="gf-role">${esc(role)} · ${esc(status)}</div></div><div class="gf-attention-action">${esc(next)}<small>${esc(date(pick(r,['applied_date','appliedDate','created_at','createdAt'])))}</small></div></div>`}).join('')||'<div class="gf-empty">No applications currently require attention.</div>'}</div></section><section class="gf-search-health"><div class="gf-kicker">APPLICATION PIPELINE</div><div class="gf-pipeline-top"><div class="gf-donut" style="background:${bg}"><div class="gf-donut-center">${total}<small>Total</small></div></div><div><div class="gf-pipeline-total">${total}</div><div class="gf-pipeline-sub">Applications in your pipeline</div></div></div><div class="gf-legend"><div class="gf-legend-row"><i class="gf-dot applied"></i><span>Applied</span><b>${c.applied}</b></div><div class="gf-legend-row"><i class="gf-dot screening"></i><span>Screening</span><b>${c.screening}</b></div><div class="gf-legend-row"><i class="gf-dot interview"></i><span>Interview</span><b>${c.interview}</b></div><div class="gf-legend-row"><i class="gf-dot offer"></i><span>Offer</span><b>${c.offer}</b></div><div class="gf-legend-row"><i class="gf-dot rejected"></i><span>Rejected</span><b>${c.rejected}</b></div></div></section>`;
  }

  function hideLegacy(d){
    ['dashboard-interviews'].forEach(id=>{const e=d.querySelector('#'+id);if(e)e.style.display='none'});
  }

  async function sync(){
    if(window.innerWidth>700||!active())return;
    const d=document.getElementById('view-dashboard');if(!d)return;
    document.body.classList.add('glueful-apple-dashboard');
    hideLegacy(d);
    const rows=await fetchRows();if(!active()||window.innerWidth>700)return;
    const c=counts(rows);syncStats(d,c);syncAttention(d,rows,c);
  }

  function start(){install();setTimeout(sync,700);window.addEventListener('resize',()=>setTimeout(sync,200),{passive:true});document.addEventListener('click',()=>setTimeout(sync,700),true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
