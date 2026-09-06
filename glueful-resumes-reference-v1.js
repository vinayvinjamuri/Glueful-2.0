/* Glueful — Resumes Reference UI V3
 * Presentation-only. V3 deliberately applies the reference surface styles
 * directly to the rendered library DOM because the legacy resume renderer
 * uses inline styles on its generated cards.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUMES_REFERENCE_V3__) return;
  window.__GLUEFUL_RESUMES_REFERENCE_V3__=true;

  const STYLE_ID='glueful-resumes-reference-v3-style';
  const VIEW_ID='view-resume';
  const PURPLE='#7137e8';

  function css(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        html body #view-resume{
          background:#f7f8fb!important;color:#111827!important;
          width:calc(100vw - 260px)!important;margin-left:260px!important;
          min-height:100vh!important;box-sizing:border-box!important;
          padding:22px 30px 52px!important;
          font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
        }
        html body #view-resume .view-header{background:transparent!important;border:0!important;box-shadow:none!important;}
        html body #view-resume input[type="search"],
        html body #view-resume input[type="text"]{
          background:#fff!important;color:#172033!important;border:1px solid #dfe4ee!important;
          border-radius:11px!important;box-shadow:0 2px 8px rgba(24,34,56,.04)!important;
        }
        html body #view-resume input::placeholder{color:#8790a2!important;opacity:1!important;}
        html body #view-resume .gf-resumes-v3-card{
          background:#fff!important;color:#111827!important;border:1px solid #e1e6ef!important;
          border-radius:15px!important;box-shadow:0 4px 16px rgba(25,35,58,.045)!important;
          box-sizing:border-box!important;overflow:hidden!important;
        }
        html body #view-resume .gf-resumes-v3-card *{color:#111827!important;}
        html body #view-resume .gf-resumes-v3-card img{background:transparent!important;}
        html body #view-resume .gf-resumes-v3-info{
          background:#f4f7ff!important;color:#536b9d!important;border:1px solid #d9e4ff!important;
          border-radius:11px!important;box-shadow:none!important;
        }
        html body #view-resume .gf-resumes-v3-info *{color:#536b9d!important;}
        html body #view-resume .gf-resumes-v3-toolbar{background:transparent!important;border:0!important;box-shadow:none!important;}
        html body #view-resume .gf-resumes-v3-filter{background:#fff!important;color:#1f2a3d!important;border:1px solid #dfe4ee!important;}
        html body #view-resume .gf-resumes-v3-add{
          display:inline-flex!important;align-items:center!important;justify-content:center!important;
          min-height:44px!important;padding:0 18px!important;border:0!important;border-radius:11px!important;
          background:linear-gradient(135deg,#7137e8,#4d72ff)!important;color:#fff!important;
          font-size:14px!important;font-weight:700!important;box-shadow:0 6px 18px rgba(93,76,220,.18)!important;
        }
        html body #view-resume .gf-resumes-v3-add *{color:#fff!important;}
      }
      @media(max-width:1100px){
        html body #view-resume{background:#f7f8fb!important;}
        html body #view-resume .gf-resumes-v3-card{background:#fff!important;color:#111827!important;border-color:#e1e6ef!important;}
      }
    `;
    (document.head||document.documentElement).appendChild(s);
  }

  function dark(el){
    try{
      const c=getComputedStyle(el).backgroundColor||'';
      const m=c.match(/rgba?\\(([^)]+)\\)/i);
      if(!m)return false;
      const p=m[1].split(',').map(v=>parseFloat(v.trim()));
      return p.length>=3 && p[0]<80 && p[1]<85 && p[2]<100;
    }catch(_){return false;}
  }

  function paint(el,info){
    el.classList.add(info?'gf-resumes-v3-info':'gf-resumes-v3-card');
    el.style.setProperty('background',info?'#f4f7ff':'#fff','important');
    el.style.setProperty('background-color',info?'#f4f7ff':'#fff','important');
    el.style.setProperty('color',info?'#536b9d':'#111827','important');
    el.style.setProperty('border-color',info?'#d9e4ff':'#e1e6ef','important');
    el.style.setProperty('box-shadow',info?'none':'0 4px 16px rgba(25,35,58,.045)','important');
    if(!info){
      el.querySelectorAll('*').forEach(child=>{
        if(child.matches('img,svg,canvas,input,button,a')) return;
        child.style.setProperty('color','#111827','important');
      });
    }
  }

  function decorate(){
    const v=document.getElementById(VIEW_ID);
    if(!v)return;
    css();

    // Force the page shell itself to the reference light surface.
    v.style.setProperty('background','#f7f8fb','important');
    v.style.setProperty('color','#111827','important');

    // The legacy renderer generates the dark company rows as nested divs with
    // inline backgrounds. Detect the actual painted geometry, not class names.
    Array.from(v.querySelectorAll('div,section,article,li')).forEach(el=>{
      if(el.matches('.view-header,header'))return;
      const r=el.getBoundingClientRect();
      if(r.width<500 || r.height<55) return;
      if(!dark(el)) return;
      const txt=(el.textContent||'').replace(/\\s+/g,' ').trim();
      const isInfo=/resumes are grouped|search by company|resume library/i.test(txt) && r.height<100;
      const isSearch=/search company|search.*resume/i.test(txt);
      if(isSearch)return;
      paint(el,isInfo);
    });

    // Search surface: override any legacy inline dark fill on the actual input.
    v.querySelectorAll('input[type="search"],input[type="text"]').forEach(input=>{
      input.style.setProperty('background','#fff','important');
      input.style.setProperty('background-color','#fff','important');
      input.style.setProperty('color','#172033','important');
      input.style.setProperty('border','1px solid #dfe4ee','important');
      input.style.setProperty('box-shadow','0 2px 8px rgba(24,34,56,.04)','important');
    });

    // Filter buttons should remain functional; only their presentation changes.
    v.querySelectorAll('button').forEach(b=>{
      const t=(b.textContent||'').trim();
      if(/filter/i.test(t)){
        b.classList.add('gf-resumes-v3-filter');
        b.style.setProperty('background','#fff','important');
        b.style.setProperty('background-color','#fff','important');
        b.style.setProperty('color','#1f2a3d','important');
        b.style.setProperty('border','1px solid #dfe4ee','important');
      }
    });

    // Existing Add/Upload/Import controls get the reference CTA treatment.
    const add=Array.from(v.querySelectorAll('button,a')).find(x=>/add\\s+resume|upload\\s+resume|import\\s+resume|new\\s+resume/i.test((x.textContent||'').trim()));
    if(add){
      add.classList.add('gf-resumes-v3-add');
      add.style.setProperty('background','linear-gradient(135deg,#7137e8,#4d72ff)','important');
      add.style.setProperty('color','#fff','important');
      add.style.setProperty('border','0','important');
    }
  }

  function start(){
    css();
    decorate();
    [100,300,700,1200,2000,3500,5000].forEach(ms=>setTimeout(decorate,ms));
    const observer=new MutationObserver(m=>{
      if(m.some(x=>x.type==='childList')) decorate();
    });
    const root=document.getElementById(VIEW_ID);
    if(root)observer.observe(root,{childList:true,subtree:true});
    else setTimeout(start,250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
