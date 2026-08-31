/* Glueful Orbit shell v3. The consolidated v16 runtime owns mobile IME behavior and chat submission. */
(function () {
  'use strict';
  const ROOT_ID = 'glueful-orbit-v2-root';
  const STYLE_ID = 'glueful-orbit-v3-style';
  const state = { jobs: [], job: null };
  const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  const client = () => window.supabaseClient || window.gluefulResumeSupabaseClient || null;
  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`#${ROOT_ID}{display:none}.ov2-app{height:100dvh;display:flex;flex-direction:column}.ov2-body{flex:1;min-height:0;overflow:auto}.ov2-chat{height:100%;display:flex;flex-direction:column}.ov2-chat-messages{flex:1;min-height:0;overflow:auto}.ov2-composer{flex:0 0 auto;display:flex;gap:8px}.ov2-input{flex:1;min-width:0}`;document.head.appendChild(s);
  }
  async function load(){
    const c=client();if(!c?.auth?.getUser||!c?.from)return;
    try{const {data:u}=await c.auth.getUser();if(!u?.user)return;const {data}=await c.from('applications').select('id,user_id,company,role,date,status,link,jd,resume_id,resume_name,resume_url,job_id').eq('user_id',u.user.id).order('date',{ascending:false,nullsFirst:false}).limit(12);state.jobs=data||[];}catch(e){console.warn('[Orbit] application load failed',e)}
  }
  function render(){
    const root=document.getElementById(ROOT_ID);if(!root)return;
    root.classList.add('open');
    const title=state.job?`${state.job.company} · ${state.job.role}`:'Orbit AI';
    const chooser=state.job?'':`<div class="ov2-label">Choose an application</div>${state.jobs.map(j=>`<button class="ov2-job" data-action="select-job" data-job-id="${esc(j.id)}"><span class="ov2-logo">${esc(String(j.company||'G').slice(0,2).toUpperCase())}</span><span class="ov2-job-main"><b>${esc(j.company)}</b><small>${esc(j.role)}</small></span></button>`).join('')}`;
    root.innerHTML=`<div class="ov2-app ov2-chat"><header class="ov2-head"><div class="ov2-title">${esc(title)}</div><button class="ov2-icon" data-action="close">×</button></header><main class="ov2-chat-messages"><div class="ov2-card"><div style="font-size:18px;font-weight:800">Your career copilot.</div><p class="ov2-muted">Ask about this job, interview preparation, technical topics, study plans, resume fit, or career decisions.</p></div>${state.job?`<div class="ov2-label">Active application</div><div class="ov2-card"><b>${esc(state.job.company)}</b><div class="ov2-muted">${esc(state.job.role)} · ${esc(state.job.status)}</div></div>`:chooser}</main>${state.job?`<form class="ov2-composer" data-action="send"><input class="ov2-input" name="message" autocomplete="off" placeholder="Ask Orbit anything…"><button class="ov2-send" type="submit">➤</button></form>`:''}</div>`;
  }
  async function open(){styles();await load();render();}
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='close'){document.getElementById(ROOT_ID)?.classList.remove('open');return;}if(a==='select-job'){state.job=state.jobs.find(j=>String(j.id)===String(b.dataset.jobId))||null;const r=document.getElementById(ROOT_ID);if(r)r.dataset.orbitApplicationId=state.job?.id||'';render();}},true);
  window.gluefulOpenOrbit=window.gluefulOpenOrbit||open;
  styles();
})();
