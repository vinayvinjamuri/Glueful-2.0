/* Glueful — Resumes Final UI V2
 * Presentation-only authority for the resume library.
 * Preserves the existing renderer, data and handlers.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUMES_FINAL_UI_V2__) return;
  window.__GLUEFUL_RESUMES_FINAL_UI_V2__=true;
  const ID='glueful-resumes-final-ui-v2-style';
  const VIEW='#view-resume';

  function install(){
    if(document.getElementById(ID)) return;
    const s=document.createElement('style'); s.id=ID;
    s.textContent=`
      @media(min-width:1101px){
        html body #view-resume{
          position:relative!important;left:auto!important;right:auto!important;
          margin-left:260px!important;margin-right:0!important;
          width:calc(100vw - 260px)!important;max-width:none!important;
          min-height:100vh!important;box-sizing:border-box!important;
          background:#f7f8fb!important;color:#111827!important;
          padding:22px 30px 52px!important;
          font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
          transform:none!important;
        }
        html body #view-resume > *{max-width:none!important;}
        html body #view-resume .view-header{background:transparent!important;border:0!important;box-shadow:none!important;}
        html body #view-resume input[type=search],html body #view-resume input[type=text]{
          background:#fff!important;color:#172033!important;border:1px solid #dfe4ee!important;
          border-radius:11px!important;min-height:44px!important;box-shadow:0 2px 8px rgba(24,34,56,.04)!important;
        }
        html body #view-resume input::placeholder{color:#8790a2!important;opacity:1!important;}
        html body #view-resume .gf-final-resume-company{
          background:#fff!important;color:#111827!important;border:1px solid #e1e6ef!important;
          border-radius:15px!important;box-shadow:0 4px 16px rgba(25,35,58,.045)!important;
          box-sizing:border-box!important;overflow:hidden!important;
        }
        html body #view-resume .gf-final-resume-company *{color:#111827!important;}
        html body #view-resume .gf-final-resume-info{
          background:#f4f7ff!important;color:#536b9d!important;border:1px solid #d9e4ff!important;
          border-radius:11px!important;box-shadow:none!important;
        }
        html body #view-resume .gf-final-resume-info *{color:#536b9d!important;}
        html body #view-resume .gf-final-resume-filter{
          background:#fff!important;color:#1f2a3d!important;border:1px solid #dfe4ee!important;
          min-height:44px!important;border-radius:11px!important;
        }
        html body #view-resume .gf-final-resume-add{
          display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;
          min-height:44px!important;padding:0 18px!important;border:0!important;border-radius:11px!important;
          background:linear-gradient(135deg,#7137e8,#4d72ff)!important;color:#fff!important;
          font-size:14px!important;font-weight:700!important;box-shadow:0 6px 18px rgba(93,76,220,.18)!important;white-space:nowrap!important;
        }
        html body #view-resume .gf-final-resume-add *{color:#fff!important;}
        html body #view-resume .gf-final-resume-row{
          background:#fbfcff!important;border:1px solid #e4e9f2!important;border-radius:12px!important;
        }
        html body #view-resume .gf-final-resume-row *{color:#172033!important;}
        html body #view-resume .gf-final-resume-row button{
          background:#fff!important;border:1px solid #dfe5ef!important;color:#24314a!important;border-radius:9px!important;
        }
        html body #view-resume .gf-final-resume-row button:last-child{color:#d63b4a!important;border-color:#f0d7db!important;}
      }
      @media(max-width:1100px){
        html body #view-resume{background:#f7f8fb!important;}
        html body #view-resume .gf-final-resume-company{background:#fff!important;color:#111827!important;border-color:#e1e6ef!important;}
      }
    `;
    (document.head||document.documentElement).appendChild(s);
  }

  function dark(el){
    try{
      const c=getComputedStyle(el).backgroundColor||'';
      const m=c.match(/rgba?\(([^)]+)\)/i); if(!m)return false;
      const p=m[1].split(',').map(x=>parseFloat(x.trim()));
      return p.length>=3 && p[0]<90 && p[1]<95 && p[2]<110;
    }catch(_){return false;}
  }

  function paint(){
    const v=document.querySelector(VIEW); if(!v)return;
    install();
    v.style.setProperty('background','#f7f8fb','important');
    v.style.setProperty('color','#111827','important');

    Array.from(v.children).forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.width>600 && r.width<1100 && r.left>400){
        el.style.setProperty('width','100%','important');
        el.style.setProperty('max-width','none','important');
        el.style.setProperty('margin-left','0','important');
        el.style.setProperty('margin-right','0','important');
      }
    });

    Array.from(v.querySelectorAll('div,section,article,li')).forEach(el=>{
      if(el.matches('.view-header,header,input,button,a,img,svg,canvas')) return;
      const r=el.getBoundingClientRect();
      if(r.width<500 || r.height<55) return;
      if(!dark(el)) return;
      const text=(el.textContent||'').replace(/\s+/g,' ').trim();
      const search=/search company|search.*resume/i.test(text) && r.height<90;
      if(search)return;
      const info=/resumes are grouped|search by company|resume library/i.test(text) && r.height<110;
      el.classList.add(info?'gf-final-resume-info':'gf-final-resume-company');
      el.style.setProperty('background',info?'#f4f7ff':'#fff','important');
      el.style.setProperty('background-color',info?'#f4f7ff':'#fff','important');
      el.style.setProperty('color',info?'#536b9d':'#111827','important');
      el.style.setProperty('border-color',info?'#d9e4ff':'#e1e6ef','important');
      el.style.setProperty('box-shadow',info?'none':'0 4px 16px rgba(25,35,58,.045)','important');
      if(!info)el.querySelectorAll('*').forEach(c=>{if(!c.matches('img,svg,canvas,button,a,input'))c.style.setProperty('color','#111827','important');});
    });

    v.querySelectorAll('input[type=search],input[type=text]').forEach(i=>{
      i.style.setProperty('background','#fff','important');
      i.style.setProperty('color','#172033','important');
      i.style.setProperty('border','1px solid #dfe4ee','important');
      i.style.setProperty('border-radius','11px','important');
    });

    v.querySelectorAll('button').forEach(b=>{
      const t=(b.textContent||'').trim();
      if(/filter/i.test(t)){
        b.classList.add('gf-final-resume-filter');
        b.style.setProperty('background','#fff','important');b.style.setProperty('color','#1f2a3d','important');b.style.setProperty('border','1px solid #dfe4ee','important');
      }
      if(/add\s+resume|upload\s+resume|import\s+resume|new\s+resume/i.test(t))b.classList.add('gf-final-resume-add');
    });

    const existingAdd=Array.from(v.querySelectorAll('button,a,label')).find(x=>/add\s+resume|upload\s+resume|import\s+resume|new\s+resume/i.test((x.textContent||'').trim()));
    if(!existingAdd && !v.querySelector('.gf-final-resume-add')){
      const h=v.querySelector('.view-header,header');
      if(h){
        const b=document.createElement('button');b.type='button';b.className='gf-final-resume-add';b.textContent='+  Add Resume';
        b.addEventListener('click',function(){
          const target=Array.from(v.querySelectorAll('button,a,label')).find(x=>/add\s+resume|upload\s+resume|import\s+resume|new\s+resume/i.test((x.textContent||'').trim()));
          if(target&&target!==b){target.click();return;}
          const f=v.querySelector('input[type=file]');if(f)f.click();
        });
        h.appendChild(b);
      }
    }
  }

  function start(){
    install();paint();
    [100,300,700,1200,2000,3500,5000].forEach(t=>setTimeout(paint,t));
    const root=document.querySelector(VIEW);
    if(root)new MutationObserver(m=>{if(m.some(x=>x.type==='childList'))setTimeout(paint,0);}).observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();