/* Glueful Orbit shell v4 — real full-screen mobile career copilot. */
(function () {
  'use strict';
  const ROOT_ID = 'glueful-orbit-v2-root';
  const STYLE_ID = 'glueful-orbit-v4-style';
  const state = { jobs: [], job: null };
  const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  const client = () => window.supabaseClient || window.gluefulResumeSupabaseClient || window.gluefulSupabaseClient || null;

  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style'); s.id=STYLE_ID; s.textContent=`
      #${ROOT_ID}{display:none!important;position:fixed;inset:0;z-index:2147483000;background:#070b12;color:#edf2f8;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      #${ROOT_ID}.open{display:block!important}
      #${ROOT_ID},#${ROOT_ID} *{box-sizing:border-box}
      #${ROOT_ID}.open .orbit4-app{width:100%;height:100dvh;display:flex;flex-direction:column;background:#070b12}
      #${ROOT_ID} .orbit4-head{height:64px;min-height:64px;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top) + 8px) 14px 8px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(7,11,18,.96);backdrop-filter:blur(18px)}
      #${ROOT_ID} .orbit4-brand{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#7444ff,#4e2dc4);font-size:19px;font-weight:800;box-shadow:0 7px 22px rgba(116,68,255,.24)}
      #${ROOT_ID} .orbit4-head-main{min-width:0;flex:1}.orbit4-title{font-size:16px;font-weight:800;letter-spacing:-.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.orbit4-sub{font-size:10px;color:#8491a5;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #${ROOT_ID} .orbit4-close{width:38px;height:38px;border:0;border-radius:11px;background:transparent;color:#aab5c5;font-size:27px;line-height:1;display:grid;place-items:center;cursor:pointer}
      #${ROOT_ID} .orbit4-close:active{background:rgba(255,255,255,.08)}
      #${ROOT_ID} .orbit4-main{flex:1;min-height:0;overflow:auto;padding:18px 14px 16px;-webkit-overflow-scrolling:touch}
      #${ROOT_ID} .orbit4-welcome{padding:4px 2px 18px}.orbit4-welcome h1{font-size:25px;line-height:1.1;letter-spacing:-.7px;margin:0 0 7px}.orbit4-welcome p{font-size:13px;line-height:1.5;color:#8e9bad;margin:0;max-width:520px}
      #${ROOT_ID} .orbit4-section{font-size:10px;font-weight:800;letter-spacing:1.25px;text-transform:uppercase;color:#657287;margin:17px 2px 9px}
      #${ROOT_ID} .orbit4-job{width:100%;display:flex;align-items:center;gap:11px;padding:12px;border:1px solid #202c40;background:#0d1420;color:#eef3fa;border-radius:15px;margin:0 0 8px;text-align:left;cursor:pointer}
      #${ROOT_ID} .orbit4-job:active{transform:scale(.99);background:#111a29}.orbit4-logo{width:40px;height:40px;flex:0 0 40px;border-radius:11px;display:grid;place-items:center;background:#17223a;color:#a983ff;font-size:12px;font-weight:850}.orbit4-job-main{min-width:0;flex:1}.orbit4-job-main b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.orbit4-job-main small{display:block;color:#7f8da2;font-size:10px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.orbit4-chevron{color:#59677d;font-size:21px}
      #${ROOT_ID} .orbit4-card{border:1px solid #202c40;background:#0d1420;border-radius:17px;padding:14px;margin-bottom:10px}.orbit4-card-title{font-size:13px;font-weight:800;margin-bottom:5px}.orbit4-card-text{font-size:11px;line-height:1.5;color:#8794a7}
      #${ROOT_ID} .orbit4-prompts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.orbit4-prompt{border:1px solid #202c40;background:#0d1420;color:#dce4ef;border-radius:13px;padding:11px;text-align:left;font-size:11px;line-height:1.35;cursor:pointer}.orbit4-prompt:active{background:#131d2d}
      #${ROOT_ID} .orbit4-chat{flex:1;min-height:0;display:flex;flex-direction:column}.orbit4-messages{flex:1;min-height:0;overflow:auto;padding:16px 14px 12px;-webkit-overflow-scrolling:touch}.orbit4-message{max-width:86%;padding:11px 13px;border-radius:16px;margin:7px 0;font-size:13px;line-height:1.52;white-space:pre-wrap;overflow-wrap:anywhere}.orbit4-message.user{margin-left:auto;background:linear-gradient(135deg,#7140ed,#5736d9);color:#fff;border-bottom-right-radius:6px}.orbit4-message.assistant{background:#0e1725;border:1px solid #202d43;color:#e8eef7;border-bottom-left-radius:6px}.orbit4-thinking{color:#8e9caf;font-size:12px;padding:8px 3px}.orbit4-thinking:after{content:"";display:inline-block;width:4px;height:4px;margin-left:6px;border-radius:50%;background:currentColor;box-shadow:7px 0 currentColor,14px 0 currentColor;animation:orbit4dots 1s infinite ease-in-out}@keyframes orbit4dots{0%,100%{opacity:.2}45%{opacity:1}}
      #${ROOT_ID} .orbit4-composer{flex:0 0 auto;display:flex;gap:8px;align-items:flex-end;padding:9px 12px calc(env(safe-area-inset-bottom) + 9px);border-top:1px solid rgba(255,255,255,.08);background:#090e17}.orbit4-input{flex:1;min-width:0;min-height:44px;max-height:120px;border:1px solid #27344a;border-radius:18px;background:#101927;color:#f4f7fb;padding:11px 13px;outline:0;font:16px/21px inherit;resize:none}.orbit4-input:focus{border-color:#7650ee;box-shadow:0 0 0 3px rgba(118,80,238,.13)}.orbit4-send{width:44px;height:44px;flex:0 0 44px;border:0;border-radius:14px;background:#7442ee;color:#fff;font-size:18px;cursor:pointer}.orbit4-send:disabled{opacity:.4}
      @media(min-width:701px){#${ROOT_ID}.open{inset:auto;right:22px;top:50%;left:auto;bottom:auto;width:440px;height:min(820px,92vh);transform:translateY(-50%);border:1px solid #26334a;border-radius:24px;overflow:hidden;box-shadow:0 30px 100px rgba(0,0,0,.58)}}
      @media(max-width:420px){#${ROOT_ID} .orbit4-prompts{grid-template-columns:1fr}.orbit4-message{max-width:91%}}
      @media(prefers-reduced-motion:reduce){#${ROOT_ID} .orbit4-thinking:after{animation:none}}
    `;document.head.appendChild(s);
  }

  async function load(){
    const c=client(); state.jobs=[]; if(!c?.auth?.getUser||!c?.from)return;
    try{const {data:u}=await c.auth.getUser();const uid=u?.user?.id;if(!uid)return;const {data}=await c.from('applications').select('id,user_id,company,role,date,status,link,jd,resume_id,resume_name,resume_url,job_id').eq('user_id',uid).order('date',{ascending:false,nullsFirst:false}).limit(20);state.jobs=Array.isArray(data)?data:[];}catch(e){console.warn('[Orbit] application load failed',e)}
  }

  function ensureRoot(){let r=document.getElementById(ROOT_ID);if(!r){r=document.createElement('div');r.id=ROOT_ID;document.body.appendChild(r)}return r}
  function jobButton(j){return `<button class="orbit4-job" data-action="select-job" data-job-id="${esc(j.id)}"><span class="orbit4-logo">${esc(String(j.company||'G').replace(/[^a-z0-9]/gi,'').slice(0,2).toUpperCase()||'G')}</span><span class="orbit4-job-main"><b>${esc(j.company||'Company')}</b><small>${esc(j.role||'Job application')}</small></span><span class="orbit4-chevron">›</span></button>`}

  function renderHome(){
    const r=ensureRoot(); r.innerHTML=`<div class="orbit4-app"><header class="orbit4-head"><div class="orbit4-brand">✦</div><div class="orbit4-head-main"><div class="orbit4-title">Orbit AI</div><div class="orbit4-sub">Your career copilot</div></div><button class="orbit4-close" data-action="close" aria-label="Close Orbit">×</button></header><main class="orbit4-main"><section class="orbit4-welcome"><h1>What are we working on?</h1><p>Ask Orbit about a job, your resume, interview preparation, technical topics, or your career plan.</p></section><div class="orbit4-section">Choose a job</div>${state.jobs.length?state.jobs.slice(0,8).map(jobButton).join(''):`<div class="orbit4-card"><div class="orbit4-card-title">No applications yet</div><div class="orbit4-card-text">You can still chat with Orbit. Add an application later and Orbit will use its job description and application context.</div></div>`}<div class="orbit4-section">Quick start</div><div class="orbit4-prompts"><button class="orbit4-prompt" data-action="general-prompt" data-prompt="Help me prepare for my next job interview.">🎯 Prepare for an interview</button><button class="orbit4-prompt" data-action="general-prompt" data-prompt="Analyze my strengths and skill gaps for my target roles.">🧠 Find my skill gaps</button><button class="orbit4-prompt" data-action="general-prompt" data-prompt="Create a practical study plan for my target role.">📚 Build a study plan</button><button class="orbit4-prompt" data-action="general-prompt" data-prompt="Ask me realistic technical interview questions. Do not reveal answers unless I ask.">🎤 Start a mock interview</button></div></main><form class="orbit4-composer" data-action="send"><textarea class="orbit4-input" name="message" rows="1" placeholder="Ask Orbit anything…"></textarea><button class="orbit4-send" type="submit">➤</button></form></div>`;r.classList.add('open');
  }

  function renderChat(){
    const r=ensureRoot();const title=state.job?`${state.job.company||'Company'} · ${state.job.role||'Job'}`:'Orbit AI';r.innerHTML=`<div class="orbit4-app orbit4-chat"><header class="orbit4-head"><button class="orbit4-close" data-action="home" aria-label="Back">‹</button><div class="orbit4-brand">✦</div><div class="orbit4-head-main"><div class="orbit4-title">${esc(title)}</div><div class="orbit4-sub">${state.job?'Job-focused career copilot':'Career copilot'}</div></div><button class="orbit4-close" data-action="close" aria-label="Close Orbit">×</button></header><main class="orbit4-messages"><div class="orbit4-message assistant">I'm Orbit. I can help you understand this job, compare it with your resume, identify skill gaps, build a study plan, and practice the interview.</div>${state.job?`<div class="orbit4-card"><div class="orbit4-card-title">Active job</div><div class="orbit4-card-text">${esc(state.job.company||'')} · ${esc(state.job.role||'')} · ${esc(state.job.status||'')}</div></div>`:''}</main><form class="orbit4-composer" data-action="send"><textarea class="orbit4-input" name="message" rows="1" placeholder="Ask Orbit anything…"></textarea><button class="orbit4-send" type="submit">➤</button></form></div>`;r.classList.add('open');
  }

  async function open(){styles();const r=ensureRoot();r.classList.add('open');await load();renderHome()}

  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='close'){ensureRoot().classList.remove('open');return}if(a==='home'){renderHome();return}if(a==='select-job'){state.job=state.jobs.find(j=>String(j.id)===String(b.dataset.jobId))||null;const r=ensureRoot();r.dataset.orbitApplicationId=state.job?.id||'';renderChat();return}if(a==='general-prompt'){state.job=null;const r=ensureRoot();r.dataset.orbitApplicationId='';renderChat();requestAnimationFrame(()=>{const i=r.querySelector('.orbit4-input');if(i){i.value=b.dataset.prompt||'';i.focus()}})}} ,true);

  document.addEventListener('submit',e=>{const f=e.target.closest?.('form[data-action="send"]');if(!f)return;e.preventDefault();e.stopImmediatePropagation();const input=f.querySelector('.orbit4-input');if(!input?.value.trim())return;const r=ensureRoot();if(!r.classList.contains('open'))return;state.pendingMessage=input.value.trim();input.value='';renderChat();requestAnimationFrame(()=>{const m=r.querySelector('.orbit4-messages');if(m&&state.pendingMessage){const u=document.createElement('div');u.className='orbit4-message user';u.textContent=state.pendingMessage;m.appendChild(u);const t=document.createElement('div');t.className='orbit4-thinking';t.textContent='Orbit is thinking';m.appendChild(t);m.scrollTop=m.scrollHeight;void window.__GLUEFUL_ORBIT_ASK__?.(state.pendingMessage,r,t)}})},true);

  window.gluefulOpenOrbit=window.gluefulOpenOrbit||open;
  styles();
})();