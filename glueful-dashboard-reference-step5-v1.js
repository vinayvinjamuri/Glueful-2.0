/* Glueful Dashboard Reference Step 5
 * Stabilizes the reference dashboard presentation after Step 4.
 * Only fixes the dashboard stats row and removes the orphan interview heading.
 * Existing application/interview functionality remains untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP5_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP5_V1__=true;

  const STYLE_ID='glueful-dashboard-reference-step5-v1-style';
  const HOST_ID='glueful-dashboard-recent-applications-v1';

  function active(){
    const d=document.getElementById('view-dashboard');
    return !!d&&(d.classList.contains('active')||d.style.display==='block');
  }

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        body.glueful-apple-dashboard #view-dashboard .stat-grid,
        body.glueful-apple-dashboard #view-dashboard .stats-grid{
          display:grid!important;
          grid-template-columns:repeat(5,minmax(0,1fr))!important;
          gap:12px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1{
          display:flex!important;
          min-width:0!important;
          min-height:112px!important;
          padding:16px!important;
          box-sizing:border-box!important;
        }
      }
      @media(max-width:1100px){
        body.glueful-apple-dashboard #view-dashboard .glueful-reference-stat-v1.gf-active-ref{display:none!important}
      }
      body.glueful-apple-dashboard #view-dashboard .gf-orphan-interview-heading{display:none!important}
      @media(max-width:700px){
        body.glueful-apple-dashboard #view-dashboard .stat-grid,
        body.glueful-apple-dashboard #view-dashboard .stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      }
    `;
    document.head.appendChild(s);
  }

  function num(text){
    const m=String(text||'').replace(/,/g,'').match(/\b\d+(?:\.\d+)?\b/);
    return m?Number(m[0]):0;
  }

  async function counts(){
    try{
      const sb=window.supabaseClient;
      if(!sb?.auth) return null;
      const session=await sb.auth.getSession();
      if(!session?.data?.session?.user) return null;
      const r=await sb.from('applications').select('status');
      if(r.error||!Array.isArray(r.data)) return null;
      const c={applied:0,screening:0,assessment:0,interview:0,offer:0,rejected:0};
      r.data.forEach(row=>{
        const s=String(row?.status||'').trim().toLowerCase();
        if(Object.prototype.hasOwnProperty.call(c,s)) c[s]++;
      });
      return c;
    }catch(_){return null}
  }

  function render(c){
    const d=document.getElementById('view-dashboard');
    if(!d||!active()) return;
    const grid=d.querySelector('.stat-grid,.stats-grid');
    if(!grid) return;
    let cards=Array.from(grid.children).filter(el=>el.classList.contains('stat-card'));
    if(!cards.length) cards=Array.from(grid.querySelectorAll('.stat-card'));
    if(!cards.length) return;

    const fallbackTotal=cards.reduce((n,card)=>{
      const t=(card.textContent||'').toLowerCase();
      return /total/.test(t)?num(t):n;
    },0);
    const x=c||{applied:0,screening:0,assessment:0,interview:0,offer:0,rejected:0};
    const total=c?(x.applied+x.screening+x.assessment+x.interview+x.offer+x.rejected):fallbackTotal;
    const activeCount=x.applied+x.screening+x.assessment;
    const values=[
      ['Total Applications',total,'All applications in your dashboard',''],
      ['Active',activeCount,'Applied, screening + assessment','gf-active-ref'],
      ['Interviews',x.interview,'Interview stage',''],
      ['Offers',x.offer,'Offers received',''],
      ['Rejections',x.rejected,'Rejected applications','gf-rejected']
    ];

    while(cards.length<5){
      const source=cards[0];
      const clone=source.cloneNode(true);
      clone.classList.remove('gf-active-ref','gf-rejected');
      grid.appendChild(clone);
      cards.push(clone);
    }

    cards.slice(0,5).forEach((card,i)=>{
      card.classList.add('glueful-reference-stat-v1');
      card.classList.toggle('gf-active-ref',i===1);
      card.classList.toggle('gf-rejected',i===4);
      const label=card.querySelector('.stat-label')||card.firstElementChild;
      const value=card.querySelector('.stat-value')||card.querySelector('[class*=value]');
      const meta=card.querySelector('.stat-meta,.stat-description')||card.lastElementChild;
      if(label) label.textContent=values[i][0];
      if(value) value.textContent=String(values[i][1]);
      if(meta) meta.textContent=values[i][2];
      card.style.display='';
    });
    cards.slice(5).forEach(card=>card.style.display='none');
  }

  function removeOrphan(){
    const d=document.getElementById('view-dashboard');
    if(!d) return;
    d.querySelectorAll('h1,h2,h3,div').forEach(el=>{
      const t=(el.textContent||'').trim().replace(/\s+/g,' ').toUpperCase();
      if(t==='UPCOMING INTERVIEWS' && !el.closest('#dashboard-interviews')) el.classList.add('gf-orphan-interview-heading');
    });
  }

  async function sync(){
    install();
    if(!active()) return;
    removeOrphan();
    render(null);
    const c=await counts();
    if(active()) render(c);
  }

  function start(){
    install();
    sync();
    document.addEventListener('click',function(){setTimeout(sync,450)},true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
