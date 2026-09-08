/* Glueful — Applications Insights & Actions V1
 * Data layer for the existing Applications utility rail.
 * Reads the authenticated user's applications and updates the existing UI
 * without replacing the visual layout or creating a second presentation layer.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_INSIGHTS_ACTIONS_V1__) return;
  window.__GLUEFUL_APPLICATIONS_INSIGHTS_ACTIONS_V1__=true;

  const VIEW='view-applications';
  const RAIL='glueful-applications-clean-v6-rail';
  let monthMode='month';
  let rows=[];

  function view(){return document.getElementById(VIEW)}
  function active(){const v=view();return !!v&&(v.classList.contains('active')||v.style.display==='block')}
  function dateOf(r){
    const keys=['applied_date','appliedDate','application_date','applicationDate','created_at','createdAt'];
    for(const k of keys){const v=r&&r[k];if(v){const d=new Date(v);if(!isNaN(d))return d}}
    return null;
  }
  function pickDate(r,keys){
    for(const k of keys){const v=r&&r[k];if(v){const d=new Date(v);if(!isNaN(d))return d}}
    return null;
  }
  function norm(s){return String(s||'').trim().toLowerCase().replace(/[_-]+/g,' ')}
  function status(r){return norm(r&& (r.status||r.application_status||r.applicationStatus))}
  function inPeriod(d,mode){
    if(!d)return false;
    const now=new Date();
    if(mode==='all')return true;
    if(mode==='year')return d.getFullYear()===now.getFullYear();
    return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth();
  }
  function countPeriod(){
    const period=rows.filter(r=>inPeriod(dateOf(r),monthMode));
    const c={total:period.length,applied:0,interview:0,offer:0,rejected:0};
    period.forEach(r=>{
      const s=status(r);
      if(['applied','submitted','application sent'].includes(s))c.applied++;
      else if(s==='interview'||s==='interviewing')c.interview++;
      else if(s==='offer'||s==='offered')c.offer++;
      else if(s==='rejected'||s==='declined')c.rejected++;
      else if(s==='screening'||s==='assessment')c.applied++;
    });
    return c;
  }
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
  function fmt(d){return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}
  function company(r){return r.company||r.company_name||r.companyName||r.employer||'Application'}
  function role(r){return r.role||r.job_title||r.jobTitle||r.position||r.title||''}

  async function fetchRows(){
    try{
      const sb=window.supabaseClient;
      if(!sb?.auth)return [];
      const session=await sb.auth.getSession();
      if(!session?.data?.session?.user)return [];
      const result=await sb.from('applications').select('*');
      return result.error||!Array.isArray(result.data)?[]:result.data;
    }catch(_){return []}
  }

  function renderInsights(){
    const rail=document.getElementById(RAIL);if(!rail)return;
    const card=rail.querySelector('.insights');if(!card)return;
    const c=countPeriod();
    const total=c.total;
    const donut=card.querySelector('.donut strong');if(donut)donut.textContent=total;
    const vals=card.querySelectorAll('.legend b');
    if(vals[0])vals[0].textContent=c.applied;
    if(vals[1])vals[1].textContent=c.interview;
    if(vals[2])vals[2].textContent=c.offer;
    if(vals[3])vals[3].textContent=c.rejected;
    const subtitle=card.querySelector('.head h3')?.nextElementSibling;
    if(subtitle)subtitle.textContent=monthMode==='all'?'All time':monthMode==='year'?'This year':'This month';
    const month=card.querySelector('.month');
    if(month){month.textContent=monthMode==='all'?'All Time':monthMode==='year'?'This Year':'This Month';month.setAttribute('aria-label','Change insight period')}
    const denom=Math.max(total,1);
    const appliedDeg=Math.round(c.applied/denom*360);
    const interviewDeg=Math.round(c.interview/denom*360);
    const offerDeg=Math.round(c.offer/denom*360);
    const stop1=appliedDeg,stop2=stop1+interviewDeg,stop3=stop2+offerDeg;
    const donutEl=card.querySelector('.donut');
    if(donutEl)donutEl.style.background=`conic-gradient(#6841ee 0 ${stop1}deg,#356ef6 ${stop1}deg ${stop2}deg,#15c48a ${stop2}deg ${stop3}deg,#ef4b58 ${stop3}deg 360deg)`;
  }

  function renderActions(){
    const rail=document.getElementById(RAIL);if(!rail)return;
    const card=rail.querySelector('.upcoming');if(!card)return;
    const now=new Date();
    const interviewKeys=['interview_date','interviewDate','interview_at','interviewAt','scheduled_interview_at','scheduledInterviewAt'];
    const followKeys=['follow_up_date','followUpDate','followup_date','followupDate','next_action_date','nextActionDate','next_follow_up','nextFollowUp'];
    const interviews=rows.map(r=>({r,d:pickDate(r,interviewKeys)})).filter(x=>x.d&&x.d>=now&&['interview','interviewing'].includes(status(x.r))).sort((a,b)=>a.d-b.d);
    const followups=rows.map(r=>({r,d:pickDate(r,followKeys)})).filter(x=>x.d&&!['rejected','offer','offered','declined'].includes(status(x.r))).sort((a,b)=>a.d-b.d);
    const actions=card.querySelectorAll('.action');
    const i=actions[0],f=actions[1];
    if(i){
      const b=i.querySelector('b'),s=i.querySelector('small');
      if(interviews.length){const x=interviews[0];if(b)b.textContent=`Interview — ${company(x.r)}`;if(s)s.textContent=`${fmt(x.d)}${role(x.r)?' · '+role(x.r):''}`;i.dataset.applicationId=x.r.id||''}
      else{if(b)b.textContent='No upcoming interviews';if(s)s.textContent="You're all caught up! 🎉";i.dataset.applicationId=''}
    }
    if(f){
      const b=f.querySelector('b'),s=f.querySelector('small');
      if(followups.length){const x=followups[0];if(b)b.textContent='Follow-ups';if(s)s.textContent=`${followups.length} application${followups.length===1?'':'s'} need${followups.length===1?'s':''} attention · next ${fmt(x.d)}`}
      else{if(b)b.textContent='Follow-ups';if(s)s.textContent='No follow-ups due'}
    }
    const link=card.querySelector('.link');
    if(link){link.onclick=function(e){e.preventDefault();const cal=[...document.querySelectorAll('button,a,[role="button"]')].find(el=>/calendar/i.test((el.textContent||'').trim()));if(cal&&cal!==link)cal.click();else if(window.drawerNavigate)window.drawerNavigate('interviews')}}
  }

  function setupPeriodMenu(){
    const rail=document.getElementById(RAIL);const button=rail?.querySelector('.month');if(!button||button.dataset.gfBound)return;
    button.dataset.gfBound='1';
    button.addEventListener('click',function(e){
      e.preventDefault();
      const current=monthMode==='month'?'month':monthMode==='year'?'year':'all';
      const next=current==='month'?'year':current==='year'?'all':'month';
      monthMode=next;renderInsights();
    });
  }

  async function sync(){
    if(!active())return;
    rows=await fetchRows();
    if(!active())return;
    renderInsights();renderActions();setupPeriodMenu();
  }
  function start(){
    if(active())sync();
    document.addEventListener('click',function(e){
      if(!active())return;
      const target=e.target.closest('#glueful-applications-clean-v6-rail');
      if(target&&!target.dataset.gfRefreshBound){target.dataset.gfRefreshBound='1';setupPeriodMenu()}
    },true);
    window.addEventListener('glueful-initial-view-ready',function(e){if(e.detail?.view===VIEW)sync()});
    window.addEventListener('glueful-applications-refresh',sync);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();