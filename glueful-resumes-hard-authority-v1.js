/* Glueful — Resumes Hard Authority V2
 * Presentation-only authority. It does not replace resume data or handlers.
 * V2 watches external style/class mutations so legacy renderers cannot
 * repaint the company library dark after the reference surface is applied.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUMES_HARD_AUTHORITY_V2__) return;
  window.__GLUEFUL_RESUMES_HARD_AUTHORITY_V2__=true;

  const STYLE='glueful-resumes-hard-authority-v2-style';
  const VIEW='view-resume';
  let painting=false;
  let repaintTimer=0;

  function install(){
    if(document.getElementById(STYLE)) return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      @media(min-width:1101px){
        html body #view-resume{
          position:relative!important;left:auto!important;right:auto!important;transform:none!important;
          margin-left:260px!important;margin-right:0!important;width:calc(100vw - 260px)!important;
          max-width:none!important;min-height:100vh!important;box-sizing:border-box!important;
          padding:22px 30px 52px!important;background:#f7f8fb!important;color:#111827!important;
        }
        html body #view-resume > *{max-width:none!important;}
        html body #view-resume .gf-hard-company-v2{
          background:#fff!important;background-color:#fff!important;color:#111827!important;
          border:1px solid #e1e6ef!important;border-radius:15px!important;
          box-shadow:0 4px 16px rgba(25,35,58,.045)!important;overflow:hidden!important;
        }
        html body #view-resume .gf-hard-company-v2 *{color:#111827!important;}
        html body #view-resume .gf-hard-company-v2 img,
        html body #view-resume .gf-hard-company-v2 svg,
        html body #view-resume .gf-hard-company-v2 canvas{background:transparent!important;}
        html body #view-resume .gf-hard-info-v2{
          background:#f4f7ff!important;color:#536b9d!important;border:1px solid #d9e4ff!important;
          border-radius:11px!important;box-shadow:none!important;
        }
        html body #view-resume .gf-hard-info-v2 *{color:#536b9d!important;}
        html body #view-resume .gf-hard-filter-v2{
          background:#fff!important;color:#1f2a3d!important;border:1px solid #dfe4ee!important;
          border-radius:11px!important;min-height:44px!important;
        }
        html body #view-resume .gf-hard-add-v2{
          display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;
          min-height:44px!important;padding:0 18px!important;border:0!important;border-radius:11px!important;
          background:linear-gradient(135deg,#7137e8,#4d72ff)!important;color:#fff!important;
          font-size:14px!important;font-weight:700!important;box-shadow:0 6px 18px rgba(93,76,220,.18)!important;
        }
        html body #view-resume .gf-hard-add-v2 *{color:#fff!important;}
      }
    `;
    (document.head||document.documentElement).appendChild(s);
  }

  function text(el){ return (el.textContent||'').replace(/\s+/g,' ').trim(); }

  function dark(el){
    try{
      const c=getComputedStyle(el).backgroundColor||'';
      const m=c.match(/rgba?\(([^)]+)\)/i);
      if(!m) return false;
      const p=m[1].split(',').map(x=>parseFloat(x.trim()));
      return p.length>=3 && p[0]<105 && p[1]<110 && p[2]<125;
    }catch(_){ return false; }
  }

  function markCompany(el){
    if(!el || el.id==='view-resume') return;
    el.classList.add('gf-hard-company-v2');
    el.style.setProperty('background','#fff','important');
    el.style.setProperty('background-color','#fff','important');
    el.style.setProperty('color','#111827','important');
    el.style.setProperty('border','1px solid #e1e6ef','important');
    el.style.setProperty('border-radius','15px','important');
    el.style.setProperty('box-shadow','0 4px 16px rgba(25,35,58,.045)','important');
    el.querySelectorAll('*').forEach(child=>{
      if(child.matches('img,svg,canvas,button,a,input')) return;
      child.style.setProperty('color','#111827','important');
    });
  }

  function findCompanyAncestor(node,view){
    let el=node;
    for(let i=0;el && el!==view && i<12;i++,el=el.parentElement){
      const r=el.getBoundingClientRect();
      if(r.width>=650 && r.width<=view.getBoundingClientRect().width+5 && r.height>=58 && r.height<=150) return el;
    }
    return null;
  }

  function paint(){
    const v=document.getElementById(VIEW);
    if(!v || painting) return;
    painting=true;
    try{
      install();
      v.style.setProperty('background','#f7f8fb','important');
      v.style.setProperty('color','#111827','important');

      // Company-name anchored detection is deterministic and independent of legacy class names.
      ['Qualcomm','Wells Fargo','Facebook'].forEach(name=>{
        Array.from(v.querySelectorAll('*')).filter(el=>{
          if(el.children.length>2) return false;
          const t=text(el);
          return t===name || new RegExp('^'+name.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')+'\\s+1\\s+resume$','i').test(t);
        }).forEach(node=>{
          const card=findCompanyAncestor(node,v);
          if(card) markCompany(card);
        });
      });

      // Geometry fallback: catches company rows even if their text is split across spans.
      Array.from(v.querySelectorAll('div,section,article,li')).forEach(el=>{
        if(el.matches('.view-header,header,input,button,a,img,svg,canvas')) return;
        const r=el.getBoundingClientRect();
        if(r.width<650 || r.height<58 || r.height>150 || !dark(el)) return;
        const t=text(el);
        if(/search company|search.*resume/i.test(t) || /resumes are grouped by the companies/i.test(t)) return;
        if(/\b1\s+resume\b/i.test(t) || /^(Qualcomm|Wells Fargo|Facebook)$/i.test(t)) markCompany(el);
      });

      // The explanatory strip is intentionally light blue, not a company card.
      Array.from(v.querySelectorAll('div,section,article,p')).forEach(el=>{
        const r=el.getBoundingClientRect();
        if(r.width<600 || r.height>115) return;
        if(!/resumes are grouped by the companies where you used them/i.test(text(el))) return;
        el.classList.add('gf-hard-info-v2');
        el.style.setProperty('background','#f4f7ff','important');
        el.style.setProperty('background-color','#f4f7ff','important');
        el.style.setProperty('color','#536b9d','important');
        el.style.setProperty('border','1px solid #d9e4ff','important');
        el.style.setProperty('border-radius','11px','important');
      });

      v.querySelectorAll('input[type=search],input[type=text]').forEach(i=>{
        i.style.setProperty('background','#fff','important');
        i.style.setProperty('background-color','#fff','important');
        i.style.setProperty('color','#172033','important');
        i.style.setProperty('border','1px solid #dfe4ee','important');
        i.style.setProperty('border-radius','11px','important');
      });

      v.querySelectorAll('button').forEach(b=>{
        const t=text(b);
        if(/filter/i.test(t)){
          b.classList.add('gf-hard-filter-v2');
          b.style.setProperty('background','#fff','important');
          b.style.setProperty('color','#1f2a3d','important');
          b.style.setProperty('border','1px solid #dfe4ee','important');
        }
        if(/add\s+resume|upload\s+resume|import\s+resume|new\s+resume/i.test(t)) b.classList.add('gf-hard-add-v2');
      });
    }finally{ painting=false; }
  }

  function schedule(){
    if(repaintTimer) return;
    repaintTimer=setTimeout(()=>{repaintTimer=0;paint();},30);
  }

  function start(){
    install();
    paint();
    [100,300,700,1200,2000,3500,5000,8000,12000].forEach(t=>setTimeout(paint,t));
    const root=document.getElementById(VIEW);
    if(!root){ setTimeout(start,200); return; }
    const observer=new MutationObserver(mutations=>{
      if(painting) return;
      if(mutations.some(m=>m.type==='childList'||m.type==='attributes')) schedule();
    });
    observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
