/* Glueful Dashboard Apple V1
 * Visual-only dashboard redesign. Existing feature logic, navigation,
 * data sources, and controls remain untouched.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_DASHBOARD_APPLE_V1__) return;
  window.__GLUEFUL_DASHBOARD_APPLE_V1__=true;

  const STYLE_ID='glueful-dashboard-apple-style-v1';

  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      :root{
        --gf-a-bg:#f5f5f7;
        --gf-a-surface:#ffffff;
        --gf-a-text:#1d1d1f;
        --gf-a-muted:#6e6e73;
        --gf-a-line:#e5e5ea;
        --gf-a-blue:#0071e3;
        --gf-a-shadow:0 10px 30px rgba(0,0,0,.045);
      }

      body.glueful-apple-dashboard{
        background:var(--gf-a-bg)!important;
        color:var(--gf-a-text)!important;
        font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif!important;
        -webkit-font-smoothing:antialiased!important;
      }

      /* Desktop/tablet: never impose a second fixed shell. Existing navigation
         owns its geometry; this layer only styles the dashboard content. */
      body.glueful-apple-dashboard #view-dashboard{
        box-sizing:border-box!important;
        color:var(--gf-a-text)!important;
      }

      body.glueful-apple-dashboard #view-dashboard .view-header{
        display:flex!important;
        align-items:flex-end!important;
        justify-content:space-between!important;
        gap:20px!important;
        padding:8px 0 20px!important;
        margin:0!important;
        border:0!important;
      }
      body.glueful-apple-dashboard #view-dashboard .view-title{
        margin:0!important;
        color:var(--gf-a-text)!important;
        font-size:34px!important;
        line-height:1.08!important;
        font-weight:700!important;
        letter-spacing:-.045em!important;
      }
      body.glueful-apple-dashboard #view-dashboard .view-subtitle{
        margin:7px 0 0!important;
        color:var(--gf-a-muted)!important;
        font-size:14px!important;
        line-height:1.4!important;
      }

      body.glueful-apple-dashboard #view-dashboard .stat-grid,
      body.glueful-apple-dashboard #view-dashboard .stats-grid{
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        gap:14px!important;
        margin:0 0 18px!important;
      }
      body.glueful-apple-dashboard #view-dashboard .stat-card{
        min-width:0!important;
        min-height:128px!important;
        padding:20px!important;
        box-sizing:border-box!important;
        background:var(--gf-a-surface)!important;
        color:var(--gf-a-text)!important;
        border:1px solid var(--gf-a-line)!important;
        border-radius:20px!important;
        box-shadow:var(--gf-a-shadow)!important;
      }
      body.glueful-apple-dashboard #view-dashboard .stat-card *{
        color:inherit;
      }
      body.glueful-apple-dashboard #view-dashboard .stat-card .stat-label{
        color:var(--gf-a-muted)!important;
        font-size:13px!important;
        font-weight:600!important;
        line-height:1.2!important;
      }
      body.glueful-apple-dashboard #view-dashboard .stat-card .stat-value{
        margin:12px 0 6px!important;
        color:var(--gf-a-text)!important;
        font-size:34px!important;
        line-height:1!important;
        font-weight:700!important;
        letter-spacing:-.045em!important;
      }
      body.glueful-apple-dashboard #view-dashboard .stat-card .stat-meta,
      body.glueful-apple-dashboard #view-dashboard .stat-card .stat-description{
        color:var(--gf-a-muted)!important;
        font-size:11px!important;
        line-height:1.3!important;
      }

      body.glueful-apple-dashboard #view-dashboard .heat-card,
      body.glueful-apple-dashboard #view-dashboard .card{
        background:var(--gf-a-surface)!important;
        color:var(--gf-a-text)!important;
        border:1px solid var(--gf-a-line)!important;
        border-radius:20px!important;
        box-shadow:var(--gf-a-shadow)!important;
      }
      body.glueful-apple-dashboard #view-dashboard .heat-card{
        padding:20px!important;
        margin-bottom:18px!important;
      }
      body.glueful-apple-dashboard #view-dashboard .heat-card .activity-month,
      body.glueful-apple-dashboard #view-dashboard .heat-card .section-title{
        color:var(--gf-a-text)!important;
      }

      /* Existing dashboard sections become clean Apple-like content blocks. */
      body.glueful-apple-dashboard #view-dashboard #dashboard-interviews{
        margin-top:18px!important;
        margin-bottom:30px!important;
      }
      body.glueful-apple-dashboard #view-dashboard .section-title{
        color:var(--gf-a-text)!important;
        font-size:20px!important;
        line-height:1.2!important;
        font-weight:700!important;
        letter-spacing:-.025em!important;
      }
      body.glueful-apple-dashboard #view-dashboard .empty-state{
        background:var(--gf-a-surface)!important;
        border:1px solid var(--gf-a-line)!important;
        border-radius:18px!important;
        color:var(--gf-a-muted)!important;
      }

      /* Keep all existing buttons/links usable while giving them one visual language. */
      body.glueful-apple-dashboard #view-dashboard button,
      body.glueful-apple-dashboard #view-dashboard .button,
      body.glueful-apple-dashboard #view-dashboard [role="button"]{
        border-radius:12px!important;
        transition:background-color .15s ease,box-shadow .15s ease,transform .15s ease!important;
      }
      body.glueful-apple-dashboard #view-dashboard input,
      body.glueful-apple-dashboard #view-dashboard select,
      body.glueful-apple-dashboard #view-dashboard textarea{
        background:#fff!important;
        color:var(--gf-a-text)!important;
        border:1px solid #d2d2d7!important;
        border-radius:12px!important;
        box-shadow:none!important;
      }
      body.glueful-apple-dashboard #view-dashboard input:focus,
      body.glueful-apple-dashboard #view-dashboard select:focus,
      body.glueful-apple-dashboard #view-dashboard textarea:focus{
        outline:none!important;
        border-color:#8ab8e8!important;
        box-shadow:0 0 0 3px rgba(0,113,227,.12)!important;
      }

      /* A compact attention strip is generated only when the dashboard has
         actionable counts; it never replaces or alters existing controls. */
      #glueful-dashboard-attention-v1{
        display:grid;
        grid-template-columns:minmax(0,1.6fr) minmax(220px,.7fr);
        gap:14px;
        margin:0 0 18px;
      }
      #glueful-dashboard-attention-v1 .gf-attention,
      #glueful-dashboard-attention-v1 .gf-search-health{
        min-width:0;
        box-sizing:border-box;
        padding:20px;
        background:#fff;
        border:1px solid var(--gf-a-line);
        border-radius:20px;
        box-shadow:var(--gf-a-shadow);
      }
      #glueful-dashboard-attention-v1 .gf-kicker{
        color:var(--gf-a-muted);
        font-size:12px;
        font-weight:600;
        margin-bottom:7px;
      }
      #glueful-dashboard-attention-v1 .gf-heading{
        color:var(--gf-a-text);
        font-size:19px;
        font-weight:700;
        letter-spacing:-.025em;
        margin:0 0 5px;
      }
      #glueful-dashboard-attention-v1 .gf-copy{
        color:var(--gf-a-muted);
        font-size:12px;
        line-height:1.45;
        margin:0;
      }
      #glueful-dashboard-attention-v1 .gf-health-value{
        color:var(--gf-a-text);
        font-size:28px;
        line-height:1;
        font-weight:700;
        letter-spacing:-.04em;
        margin:5px 0 7px;
      }
      #glueful-dashboard-attention-v1 .gf-pill{
        display:inline-flex;
        align-items:center;
        min-height:28px;
        padding:0 10px;
        border-radius:999px;
        background:#f2f2f7;
        color:#3a3a3c;
        font-size:11px;
        font-weight:600;
      }

      @media(max-width:1100px){
        body.glueful-apple-dashboard #view-dashboard .stat-grid,
        body.glueful-apple-dashboard #view-dashboard .stats-grid{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
        }
        #glueful-dashboard-attention-v1{grid-template-columns:1fr 1fr}
      }

      @media(max-width:700px){
        body.glueful-apple-dashboard #view-dashboard .view-header{
          display:block!important;
          padding:4px 0 14px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-title{
          font-size:25px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .view-subtitle{
          font-size:12px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .stat-grid,
        body.glueful-apple-dashboard #view-dashboard .stats-grid{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:9px!important;
          margin-bottom:12px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .stat-card{
          min-height:104px!important;
          padding:14px!important;
          border-radius:17px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .stat-card .stat-label{font-size:11px!important}
        body.glueful-apple-dashboard #view-dashboard .stat-card .stat-value{
          font-size:27px!important;
          margin:9px 0 5px!important;
        }
        body.glueful-apple-dashboard #view-dashboard .heat-card{padding:14px!important;border-radius:17px!important}
        #glueful-dashboard-attention-v1{
          grid-template-columns:1fr;
          gap:9px;
          margin-bottom:12px;
        }
        #glueful-dashboard-attention-v1 .gf-attention,
        #glueful-dashboard-attention-v1 .gf-search-health{
          padding:15px;
          border-radius:17px;
        }
      }

      @media(prefers-reduced-motion:reduce){
        body.glueful-apple-dashboard #view-dashboard button,
        body.glueful-apple-dashboard #view-dashboard .button,
        body.glueful-apple-dashboard #view-dashboard [role="button"]{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function dashboard(){
    return document.getElementById('view-dashboard');
  }

  function active(){
    const d=dashboard();
    return !!d&&(d.classList.contains('active')||d.style.display==='block');
  }

  function number(text){
    const m=String(text||'').replace(/,/g,'').match(/\b(\d+(?:\.\d+)?)\b/);
    return m?Number(m[1]):0;
  }

  function renderAttention(){
    const d=dashboard();
    if(!d||!active()) return;

    let host=d.querySelector('#glueful-dashboard-attention-v1');
    if(!host){
      host=document.createElement('div');
      host.id='glueful-dashboard-attention-v1';
      const grid=d.querySelector('.stat-grid,.stats-grid');
      if(grid&&grid.parentElement) grid.parentElement.insertBefore(host,grid.nextSibling);
      else return;
    }

    const cards=Array.from(d.querySelectorAll('.stat-card'));
    let total=0,activeCount=0,interviews=0,offers=0;
    cards.forEach(card=>{
      const text=(card.textContent||'').replace(/\s+/g,' ').toLowerCase();
      const n=number(text);
      if(/total|application/.test(text)&&total===0) total=n;
      if(/active/.test(text)) activeCount=n;
      if(/interview/.test(text)) interviews=n;
      if(/offer/.test(text)) offers=n;
    });

    const attention=interviews>0?`${interviews} interview${interviews===1?'':'s'} to prepare for`:activeCount>0?`${activeCount} active application${activeCount===1?'':'s'} in progress`:'Keep your pipeline moving';
    const health=total>0?Math.round(((activeCount+interviews+offers)/Math.max(1,total))*100):0;

    host.innerHTML=`
      <section class="gf-attention">
        <div class="gf-kicker">NEEDS ATTENTION</div>
        <h2 class="gf-heading">${attention}</h2>
        <p class="gf-copy">Stay focused on the applications that need your next action.</p>
      </section>
      <section class="gf-search-health">
        <div class="gf-kicker">APPLICATION PIPELINE</div>
        <div class="gf-health-value">${health}%</div>
        <p class="gf-copy">${total?`Based on ${total} application${total===1?'':'s'} in your current dashboard.`:'Add an application to start tracking your pipeline.'}</p>
        <span class="gf-pill">Live from your existing data</span>
      </section>`;
  }

  function sync(){
    install();
    const on=active();
    document.body.classList.toggle('glueful-apple-dashboard',on);
    if(on) renderAttention();
  }

  function start(){
    install();
    sync();
    document.addEventListener('click',function(){setTimeout(sync,250);},true);
    window.addEventListener('resize',sync,{passive:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
