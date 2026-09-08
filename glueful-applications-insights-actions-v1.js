/* Glueful — Applications Insights & Actions V4 */
(function(){
'use strict';
if(window.__GLUEFUL_APPLICATIONS_INSIGHTS_ACTIONS_V4__)return;
window.__GLUEFUL_APPLICATIONS_INSIGHTS_ACTIONS_V4__=true;
const VIEW='view-applications',RAIL='glueful-applications-clean-v6-rail';
let mode='month',rows=[];
const modes={today:'Today',week:'This Week',month:'This Month',year:'This Year'};
function view(){return document.getElementById(VIEW)}
function active(){const v=view();return !!v&&(v.classList.contains('active')||v.style.display==='block'||v.classList.contains('glueful-single-view-visible'))}
function dateOf(r){for(const k of ['applied_date','appliedDate','application_date','applicationDate','created_at','createdAt']){const d=r?.[k]?new Date(r[k]):null;if(d&&!isNaN(d))return d}return null}
function pick(r,ks){for(const k of ks){const d=r?.[k]?new Date(r[k]):null;if(d&&!isNaN(d))return d}return null}
function norm(s){return String(s||'').trim().toLowerCase().replace(/[_-]+/g,' ')}
function status(r){return norm(r?.status||r?.application_status||r?.applicationStatus)}
function inPeriod(d,m){if(!d)return false;const n=new Date();if(m==='today')return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()&&d.getDate()===n.getDate();if(m==='week'){const day=(n.getDay()+6)%7,start=new Date(n);start.setHours(0,0,0,0);start.setDate(n.getDate()-day);const end=new Date(start);end.setDate(start.getDate()+7);return d>=start&&d<end}if(m==='year')return d.getFullYear()===n.getFullYear();return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()}
function counts(){const a=rows.filter(r=>inPeriod(dateOf(r),mode)),c={total:a.length,applied:0,interview:0,offer:0,rejected:0};a.forEach(r=>{const s=status(r);if(['applied','submitted','application sent','screening','assessment'].includes(s))c.applied++;else if(['interview','interviewing'].includes(s))c.interview++;else if(['offer','offered'].includes(s))c.offer++;else if(['rejected','declined'].includes(s))c.rejected++});return c}
function fmt(d){return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}
function company(r){return r?.company||r?.company_name||r?.companyName||r?.employer||'Application'}
function role(r){return r?.role||r?.job_title||r?.jobTitle||r?.position||r?.title||''}
async function fetchRows(){try{const sb=window.supabaseClient;if(!sb?.auth)return[];const s=await sb.auth.getSession();if(!s?.data?.session?.user)return[];const r=await sb.from('applications').select('*');return r.error||!Array.isArray(r.data)?[]:r.data}catch(_){return[]}}
function render(){
  const rail=document.getElementById(RAIL);
  if(!rail)return;
  const insights=rail.querySelector('.insights');
  if(insights){
    const c=counts(),d=insights.querySelector('.donut strong'),v=insights.querySelectorAll('.legend b'),sel=insights.querySelector('.month');
    if(d)d.textContent=c.total;
    if(v[0])v[0].textContent=c.applied;
    if(v[1])v[1].textContent=c.interview;
    if(v[2])v[2].textContent=c.offer;
    if(v[3])v[3].textContent=c.rejected;
    if(sel)sel.value=mode;
    const t=Math.max(c.total,1),a=c.applied/t*360,i=c.interview/t*360,o=c.offer/t*360,el=insights.querySelector('.donut');
    if(el)el.style.background=`conic-gradient(#6841ee 0 ${a}deg,#356ef6 ${a}deg ${a+i}deg,#15c48a ${a+i}deg ${a+i+o}deg,#ef4b58 ${a+i+o}deg 360deg)`;
  }
  const upcoming=rail.querySelector('.upcoming');
  if(upcoming){
    const now=new Date(),ik=['interview_date','interviewDate','interview_at','interviewAt','scheduled_interview_at','scheduledInterviewAt'],fk=['follow_up_date','followUpDate','followup_date','followupDate','next_action_date','nextActionDate','next_follow_up','nextFollowUp'],ints=rows.map(r=>({r,d:pick(r,ik)})).filter(x=>x.d&&x.d>=now&&['interview','interviewing'].includes(status(x.r))).sort((a,b)=>a.d-b.d),fus=rows.map(r=>({r,d:pick(r,fk)})).filter(x=>x.d&&!['rejected','offer','offered','declined'].includes(status(x.r))).sort((a,b)=>a.d-b.d),as=upcoming.querySelectorAll('.action');
    if(as[0]){const b=as[0].querySelector('b'),s=as[0].querySelector('small');if(ints[0]){b.textContent=`Interview — ${company(ints[0].r)}`;s.textContent=`${fmt(ints[0].d)}${role(ints[0].r)?' · '+role(ints[0].r):''}`}else{b.textContent='No upcoming interviews';s.textContent="You're all caught up! 🎉"}}
    if(as[1]){const b=as[1].querySelector('b'),s=as[1].querySelector('small');if(fus.length){b.textContent='Follow-ups';s.textContent=`${fus.length} application${fus.length===1?'':'s'} need${fus.length===1?'s':''} attention · next ${fmt(fus[0].d)}`}else{s.textContent='No follow-ups due'}}
  }
}
function findOutside(rail,rx){return [...document.querySelectorAll('button,a,[role="button"]')].find(x=>!rail.contains(x)&&rx.test((x.textContent||'').replace(/\s+/g,' ').trim()))}
function csvExport(){if(!rows.length)return;const keys=[...new Set(rows.flatMap(r=>Object.keys(r)))];const esc=v=>`"${String(v??'').replace(/"/g,'""')}"`;const csv=[keys.map(esc).join(','),...rows.map(r=>keys.map(k=>esc(r[k])).join(','))].join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='glueful-applications.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0)}
function go(viewName){if(typeof window.drawerNavigate==='function'){window.drawerNavigate(viewName);return true}return false}
function setup(){
  const rail=document.getElementById(RAIL);
  if(!rail)return;
  const insights=rail.querySelector('.insights');
  if(insights&&!insights.dataset.v4Bound){
    const old=insights.querySelector('.month');
    if(old){
      const sel=document.createElement('select');
      sel.className='month';
      sel.setAttribute('aria-label','Application insight period');
      Object.entries(modes).forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sel.appendChild(o)});
      old.replaceWith(sel);
      sel.value=mode;
      sel.addEventListener('change',()=>{mode=sel.value;render()});
    }
    insights.dataset.v4Bound='1';
  }
  if(!rail.dataset.actionsV4){
    rail.dataset.actionsV4='1';
    rail.addEventListener('click',e=>{
      const b=e.target.closest('.quick button,.upcoming .link');
      if(!b||!rail.contains(b))return;
      e.preventDefault();
      e.stopPropagation();
      const text=(b.textContent||'').replace(/\s+/g,' ').trim();
      if(/view all/i.test(text)){go('interviews');return}
      if(/add new application/i.test(text)){if(!go('add-application'))findOutside(rail,/^\+?\s*add\b|add\s+(new\s+)?application/i)?.click();return}
      if(/resume/i.test(text)){if(!go('resumes'))findOutside(rail,/import.*resume|resume/i)?.click();return}
      if(/calendar/i.test(text)){if(!go('interviews'))findOutside(rail,/calendar|interview/i)?.click();return}
      if(/export/i.test(text)){const target=findOutside(rail,/export.*application|export/i);if(target)target.click();else csvExport();}
    },true);
  }
}
async function sync(){if(!active())return;rows=await fetchRows();if(!active())return;setup();render()}
function start(){sync();window.addEventListener('glueful-initial-view-ready',e=>{if(e.detail?.view===VIEW)sync()});window.addEventListener('glueful-applications-refresh',sync)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();