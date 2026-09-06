/* Glueful — Resumes Reference UI V2
 * Presentation-only layer for the Resumes library.
 * Preserves existing resume data, navigation, search/filter behavior and editor/viewer handlers.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUMES_REFERENCE_V2__) return;
  window.__GLUEFUL_RESUMES_REFERENCE_V2__=true;
  const STYLE_ID='glueful-resumes-reference-v2-style';
  const VIEW_ID='view-resume';
  function install(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      @media(min-width:1101px){
        body #view-resume{background:#f7f8fb!important;color:#111827!important;width:calc(100vw - 260px)!important;margin-left:260px!important;padding:22px 30px 52px!important;box-sizing:border-box!important;min-height:100vh!important;font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif!important;}
        body #view-resume .view-header{min-height:62px!important;margin:0 0 18px!important;padding:0!important;border:0!important;background:transparent!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:20px!important;}
        body #view-resume .view-title{font-size:28px!important;line-height:1.15!important;font-weight:750!important;letter-spacing:-.5px!important;color:#111827!important;margin:0!important;}
        body #view-resume .view-subtitle{font-size:14px!important;line-height:1.4!important;color:#70798a!important;margin:5px 0 0!important;}
        body #view-resume input[type="search"],body #view-resume input[type="text"]{background:#fff!important;color:#172033!important;border:1px solid #dfe4ee!important;border-radius:11px!important;min-height:44px!important;font-size:14px!important;box-shadow:0 2px 8px rgba(24,34,56,.025)!important;}
        body #view-resume input::placeholder{color:#8790a2!important;opacity:1!important;}
        body #view-resume button{font-family:inherit!important;}
        body #view-resume .gf-resumes-add-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;min-height:44px!important;padding:0 18px!important;border:0!important;border-radius:11px!important;background:linear-gradient(135deg,#7137e8,#4d72ff)!important;color:#fff!important;font-size:14px!important;font-weight:700!important;box-shadow:0 6px 18px rgba(93,76,220,.18)!important;cursor:pointer!important;white-space:nowrap!important;}
        body #view-resume .gf-resumes-toolbar{display:flex!important;align-items:center!important;gap:10px!important;width:100%!important;margin:0 0 14px!important;padding:0!important;background:transparent!important;border:0!important;}
        body #view-resume .gf-resumes-search-wrap{flex:1 1 auto!important;min-width:0!important;}
        body #view-resume .gf-resumes-toolbar > button,body #view-resume .gf-resumes-filter-btn{min-height:44px!important;border-radius:11px!important;padding:0 16px!important;background:#fff!important;color:#1f2a3d!important;border:1px solid #dfe4ee!important;font-size:13px!important;font-weight:650!important;}
        body #view-resume .gf-resumes-info{display:flex!important;align-items:center!important;gap:9px!important;min-height:44px!important;margin:0 0 14px!important;padding:0 14px!important;box-sizing:border-box!important;border:1px solid #d9e4ff!important;border-radius:11px!important;background:#f4f7ff!important;color:#536b9d!important;font-size:12px!important;}
        body #view-resume .gf-resumes-company-card{position:relative!important;width:100%!important;box-sizing:border-box!important;margin:0 0 14px!important;padding:0!important;border:1px solid #e1e6ef!important;border-radius:15px!important;background:#fff!important;color:#111827!important;box-shadow:0 4px 16px rgba(25,35,58,.035)!important;overflow:hidden!important;}
        body #view-resume .gf-resumes-company-card > *{color:#111827!important;}
        body #view-resume .gf-resumes-company-card *{max-width:100%;}
        body #view-resume .gf-resumes-company-card img{background:transparent!important;}
        body #view-resume .gf-resumes-company-card button{color:#24314a!important;}
        body #view-resume .gf-resumes-company-card .gf-resume-company-name{font-size:16px!important;font-weight:700!important;color:#111827!important;}
        body #view-resume .gf-resumes-company-card .gf-resume-count{font-size:12px!important;color:#5f6d84!important;}
        body #view-resume .gf-resumes-company-card .gf-resume-name{font-size:13px!important;color:#34445f!important;}
        body #view-resume .gf-resumes-company-card .gf-resume-meta{font-size:12px!important;color:#7b8799!important;}
        body #view-resume .gf-resumes-company-card .gf-resume-actions button{min-height:38px!important;border-radius:9px!important;border:1px solid #dfe5ef!important;background:#fff!important;font-size:12px!important;font-weight:650!important;}
        body #view-resume .gf-resumes-company-card .gf-resume-actions button:last-child{color:#d63b4a!important;border-color:#f0d7db!important;}
        body #view-resume .gf-resumes-light-surface{background:#fff!important;color:#111827!important;border:1px solid #e1e6ef!important;border-radius:15px!important;box-shadow:0 4px 16px rgba(25,35,58,.035)!important;box-sizing:border-box!important;}
        body #view-resume .gf-resumes-light-surface *{color:inherit;}
        body #view-resume .gf-resumes-search-surface{background:transparent!important;color:#111827!important;border:0!important;box-shadow:none!important;}
        body #view-resume .gf-resumes-search-surface input{background:#fff!important;color:#172033!important;border-color:#dfe4ee!important;}
      }
      @media(max-width:1100px){body #view-resume .gf-resumes-add-btn{min-height:42px!important;border-radius:10px!important;}body #view-resume .gf-resumes-company-card,body #view-resume .gf-resumes-light-surface{background:#fff!important;color:#111827!important;border-color:#e1e6ef!important;}}
      @media(max-width:700px){body #view-resume{background:#f7f8fb!important;padding:16px 14px 88px!important;}body #view-resume .view-title{font-size:24px!important;}body #view-resume .view-subtitle{font-size:12px!important;}body #view-resume .gf-resumes-toolbar{flex-wrap:wrap!important;}body #view-resume .gf-resumes-search-wrap{flex-basis:100%!important;}body #view-resume .gf-resumes-company-card{border-radius:13px!important;}}
    `;
    document.head.appendChild(s);
  }
  function isResumeView(){const v=document.getElementById(VIEW_ID);return !!v&&(v.classList.contains('active')||v.style.display==='block');}
  function looksDark(el){try{const bg=getComputedStyle(el).backgroundColor||'';const m=bg.match(/rgba?\(([^)]+)\)/i);if(!m)return false;const p=m[1].split(',').map(x=>parseFloat(x.trim()));return p.length>=3&&p[0]<70&&p[1]<75&&p[2]<90;}catch(_){return false;}}
  function addHeaderAction(v){
    if(v.querySelector('.gf-resumes-add-btn'))return;
    const header=v.querySelector('.view-header,header');
    const existing=Array.from(v.querySelectorAll('button,a')).find(x=>/add\s+resume|upload\s+resume|import\s+resume/i.test((x.textContent||'').trim()));
    if(existing){existing.classList.add('gf-resumes-add-btn');return;}
    const b=document.createElement('button');b.type='button';b.className='gf-resumes-add-btn';b.textContent='+  Add Resume';
    b.addEventListener('click',function(){const candidates=Array.from(v.querySelectorAll('button,a,label')).filter(x=>x!==b);const target=candidates.find(x=>/add\s+resume|upload\s+resume|import\s+resume|new\s+resume/i.test((x.textContent||'').trim()));if(target){target.click();return;}const file=v.querySelector('input[type="file"]');if(file){file.click();return;}console.warn('[Glueful Resumes] No existing add/import resume action found.');});
    if(header){header.appendChild(b);}else{b.style.position='absolute';b.style.top='22px';b.style.right='30px';v.appendChild(b);}
  }
  function decorate(){
    const v=document.getElementById(VIEW_ID);if(!v||!isResumeView())return;install();
    /* The existing library is nested more deeply than the old V1 selector assumed.
       Promote only large dark content surfaces; never alter buttons, inputs, icons or the viewer/editor. */
    Array.from(v.querySelectorAll('*')).forEach(el=>{
      if(el.matches('input,textarea,select,button,a,img,svg,canvas,.view-header,header'))return;
      const r=el.getBoundingClientRect();
      if(r.width<420||r.height<48)return;
      if(looksDark(el)){
        const cls=String(el.className||'').toLowerCase();
        if(/search|filter|toolbar/.test(cls))el.classList.add('gf-resumes-search-surface');
        else el.classList.add('gf-resumes-light-surface','gf-resumes-company-card');
      }
    });
    const inputs=Array.from(v.querySelectorAll('input[type="search"],input[type="text"]'));
    const filterButtons=Array.from(v.querySelectorAll('button')).filter(b=>/filter/i.test((b.textContent||'').trim()));
    if(inputs.length){let toolbar=inputs[0].closest('.toolbar,.search-bar,.filter-bar,[class*="toolbar"],[class*="search"],[class*="filter"]');if(!toolbar)toolbar=inputs[0].parentElement;if(toolbar&&!toolbar.classList.contains('view-header'))toolbar.classList.add('gf-resumes-toolbar');if(toolbar&&!inputs[0].parentElement.classList.contains('gf-resumes-search-wrap'))inputs[0].parentElement.classList.add('gf-resumes-search-wrap');filterButtons.forEach(b=>b.classList.add('gf-resumes-filter-btn'));}
    addHeaderAction(v);
  }
  function start(){install();decorate();[150,500,1000,1800,3000].forEach(ms=>setTimeout(decorate,ms));document.addEventListener('click',()=>setTimeout(decorate,80),true);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
