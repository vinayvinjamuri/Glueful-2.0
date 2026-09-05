/* Glueful Dashboard Reference Step 3
 * Desktop stats row only. Reuses the existing applications data source.
 * No existing navigation or application behavior is replaced.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_REFERENCE_STEP3_V1__) return;
  window.__GLUEFUL_DASHBOARD_REFERENCE_STEP3_V1__=true;

  const STYLE_ID='glueful-dashboard-reference-step3-v1-style';
  const CARD_CLASS='glueful-reference-stat-v1';

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
          grid-template-columns:repeat(5,minmax(0,1fr))!important;
          gap:12px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .${CARD_CLASS}{
          min-height:112px!important;
          padding:16px!important;
          border-radius:16px!important;
          display:flex!important;
          flex-direction:column!important;
          justify-content:flex-start!important;
          overflow:hidden!important;
        }
        body.glueful-apple-dashboard #view-dashboard .${CARD_CLASS} .stat-label{
          font-size:12px!important;
          font-weight:600!important;
        }
        body.glueful-apple-dashboard #view-dashboard .${CARD_CLASS} .stat-value{
          font-size:30px!important;
          margin:10px 0 5px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .${CARD_CLASS} .stat-meta{
          font-size:10px!important;
          line-height:1.25!important;
        }
        body.glueful-apple-dashboard #view-dashboard .${CARD_CLASS}.gf-rejected .stat-value{color:#e5484d!important}
      }
      @media(max-width:1100px){
        body.glueful-apple-dashboard #view-dashboard .${CARD_CLASS}.gf-active-ref{display:none!important}
      }
    `;
    document.head.appendChild(s);
  }

  function number(text){
    const m=String(text||'').replace(/,/g,'').match(/\b(\d+(?:\.\d+)?)\b/);
    return m?Number(m[1]):0;
  }

  function currentTotal(d){
    let total=0;
    d.querySelectorAll('.stat-card').forEach(c=>{
      const t=(c.textContent||'').replace(/\s+/g,' ').toLowerCase();
      if(/total/.test(t)) total=number(t);
    });
    return total;
  }

  function countFromApplicationView(){
    const v=document.getElementById('view-applications');
    if(!v) return null;
    const text=(v.textContent||'').replace(/\s+/g,' ').toLowerCase();
    const counts={applied:0,screening:0,assessment:0,interview:0,offer:0,rejected:0};
    Object.keys(counts).forEach(k=>{
      const re=new RegExp('\\b'+k+'\\b','g');
      const m=text.match(re);
      counts[k]=m?m.length:0;
    });
    return counts;
  }

  async function fetchCounts(){
    try{
      if(!window.supabaseClient||!window.supabaseClient.auth) return null;
      const sessionResult=await window.supabaseClient.auth.getSession();
      const user=sessionResult&&sessionResult.data&&sessionResult.data.session&&sessionResult.data.session.user;
      if(!user) return null;
      const result=await window.supabaseClient
        .from('applications')
        .select('status');
      if(result.error||!Array.isArray(result.data)) return null;
      const counts={applied:0,screening:0,assessment:0,interview:0,offer:0,rejected:0};
      result.data.forEach(row=>{
        const status=String(row&&row.status||'').trim().toLowerCase();
        if(status==='applied') counts.applied++;
        else if(status==='screening') counts.screening++;
        else if(status==='assessment') counts.assessment++;
        else if(status==='interview') counts.interview++;
        else if(status==='offer') counts.offer++;
        else if(status==='rejected') counts.rejected++;
      });
      return counts;
    }catch(_){return null;}
  }

  function render(d,counts){
    const grid=d.querySelector('.stat-grid,.stats-grid');
    if(!grid) return;
    let cards=Array.from(grid.querySelectorAll('.stat-card'));
    if(!cards.length) return;

    const total=currentTotal(d);
    const c=counts||countFromApplicationView()||{applied:0,screening:0,assessment:0,interview:0,offer:0,rejected:0};
    const derivedTotal=(c.applied+c.screening+c.assessment+c.interview+c.offer+c.rejected)||total;
    const active=c.applied+c.screening+c.assessment;
    const values=[
      ['Total Applications',derivedTotal,'All applications in your dashboard',''],
      ['Active',active,'Applied, screening + assessment','gf-active-ref'],
      ['Interviews',c.interview,'Interview stage',''],
      ['Offers',c.offer,'Offers received',''],
      ['Rejections',c.rejected,'Rejected applications','gf-rejected']
    ];

    while(cards.length<5){
      const clone=cards[0].cloneNode(true);
      grid.appendChild(clone);
      cards.push(clone);
    }

    cards.slice(0,5).forEach((card,i)=>{
      card.classList.add(CARD_CLASS);
      card.classList.toggle('gf-rejected',i===4);
      card.classList.toggle('gf-active-ref',i===1);
      const label=card.querySelector('.stat-label')||card.firstElementChild;
      const value=card.querySelector('.stat-value')||card.querySelector('[class*=value]');
      const meta=card.querySelector('.stat-meta,.stat-description')||card.lastElementChild;
      if(label) label.textContent=values[i][0];
      if(value) value.textContent=String(values[i][1]);
      if(meta) meta.textContent=values[i][2];
    });

    cards.slice(5).forEach(card=>card.style.display='none');
  }

  async function sync(){
    install();
    if(!active()) return;
    const d=document.getElementById('view-dashboard');
    if(!d) return;
    render(d,null);
    const counts=await fetchCounts();
    if(active()) render(d,counts);
  }

  function start(){
    install();
    sync();
    document.addEventListener('click',function(){setTimeout(sync,350);},true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
