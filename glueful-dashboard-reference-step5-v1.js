/* Glueful Dashboard Reference Step 5 — stable cleanup
 * Keeps one reference stats row and removes the obsolete dashboard interview shell.
 * Existing application/interview functionality remains untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP5_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP5_V1__=true;
  const STYLE_ID='glueful-dashboard-reference-step5-v1-style';
  const HOST_ID='glueful-reference-stats-v1';
  function active(){const d=document.getElementById('view-dashboard');return !!d&&(d.classList.contains('active')||d.style.display==='block');}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      body.glueful-apple-dashboard #view-dashboard .${HOST_ID}{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:12px!important;margin:0 0 18px!important}
      body.glueful-apple-dashboard #view-dashboard .${HOST_ID} .gf-ref-card{min-width:0;min-height:112px;padding:16px;background:#fff;border:1px solid #e5e5ea;border-radius:16px;box-sizing:border-box;box-shadow:0 10px 30px rgba(0,0,0,.045)}
      body.glueful-apple-dashboard #view-dashboard .${HOST_ID} .gf-ref-label{font:600 12px Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#3a3a3c}
      body.glueful-apple-dashboard #view-dashboard .${HOST_ID} .gf-ref-value{margin:10px 0 5px;font:700 30px/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:-.03em;color:#111}
      body.glueful-apple-dashboard #view-dashboard .${HOST_ID} .gf-ref-meta{font:500 10px/1.25 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#6e6e73}
      body.glueful-apple-dashboard #view-dashboard .${HOST_ID} .gf-ref-card:last-child .gf-ref-value{color:#e5484d}
      body.glueful-apple-dashboard #view-dashboard #dashboard-interviews{display:none!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important}
      @media(max-width:1100px){body.glueful-apple-dashboard #view-dashboard .${HOST_ID}{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
      @media(max-width:700px){body.glueful-apple-dashboard #view-dashboard .${HOST_ID}{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}body.glueful-apple-dashboard #view-dashboard .${HOST_ID} .gf-ref-card{min-height:88px;padding:12px}body.glueful-apple-dashboard #view-dashboard .${HOST_ID} .gf-ref-value{font-size:24px}}
    `;document.head.appendChild(s);
  }
  async function getCounts(){
    const c={applied:0,screening:0,assessment:0,interview:0,offer:0,rejected:0};
    try{const sb=window.supabaseClient;if(!sb?.auth)return c;const session=await sb.auth.getSession();if(!session?.data?.session?.user)return c;const r=await sb.from('applications').select('status');if(!r.error&&Array.isArray(r.data))r.data.forEach(row=>{const st=String(row?.status||'').trim().toLowerCase();if(Object.prototype.hasOwnProperty.call(c,st))c[st]++;});}catch(_){ }return c;
  }
  function removeLegacy(d){
    const old=d.querySelector('.stat-grid,.stats-grid');
    if(old) old.style.setProperty('display','none','important');
    const interviews=d.querySelector('#dashboard-interviews');
    if(interviews) interviews.style.setProperty('display','none','important');
    d.querySelectorAll('.section-title').forEach(el=>{
      if(/upcoming\s+interviews/i.test((el.textContent||'').trim()) && !el.closest('#dashboard-interviews')) el.style.setProperty('display','none','important');
    });
  }
  function render(c){
    const d=document.getElementById('view-dashboard');if(!d||!active())return;
    removeLegacy(d);
    let host=d.querySelector('#'+HOST_ID);
    if(!host){host=document.createElement('section');host.id=HOST_ID;host.className=HOST_ID;const old=d.querySelector('.stat-grid,.stats-grid');if(old&&old.parentElement)old.parentElement.insertBefore(host,old);else d.prepend(host);}
    const total=c.applied+c.screening+c.assessment+c.interview+c.offer+c.rejected;
    const activeCount=c.applied+c.screening+c.assessment;
    const cards=[['Total Applications',total,'All applications in your dashboard'],['Active',activeCount,'Applied, screening + assessment'],['Interviews',c.interview,'Interview stage'],['Offers',c.offer,'Offers received'],['Rejections',c.rejected,'Rejected applications']];
    host.innerHTML=cards.map(x=>`<div class="gf-ref-card"><div class="gf-ref-label">${esc(x[0])}</div><div class="gf-ref-value">${esc(x[1])}</div><div class="gf-ref-meta">${esc(x[2])}</div></div>`).join('');
    removeLegacy(d);
  }
  async function sync(){install();if(!active())return;const c=await getCounts();if(active())render(c);}
  function start(){install();sync();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
