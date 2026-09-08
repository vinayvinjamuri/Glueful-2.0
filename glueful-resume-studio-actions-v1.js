/* Glueful — Resume Studio Hub actions V1
 * Wires every visible Resume Hub action without replacing the existing
 * resume/PDF Studio runtime. Uses the existing legacy resume controls as
 * the source of truth for opening/importing resumes.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUME_STUDIO_ACTIONS_V1__) return;
  window.__GLUEFUL_RESUME_STUDIO_ACTIONS_V1__=true;

  const VIEW='view-resumes', HUB='glueful-resume-studio-hub', LEGACY='glueful-resume-legacy-library';
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
  const textEl=e=>clean(e?.textContent||'');

  function view(){return document.getElementById(VIEW)}
  function hub(){return document.getElementById(HUB)}
  function legacy(){return document.getElementById(LEGACY)}

  function importResume(){
    const input=document.getElementById('cp-resume-file');
    if(input){input.click();return true}
    const label=document.querySelector('label[for="cp-resume-file"]');
    if(label){label.click();return true}
    if(typeof window.handleCandidateResumeUpload==='function'){
      window.handleCandidateResumeUpload();
      return true;
    }
    return false;
  }

  function openStudio(){
    const overlay=document.getElementById('glueful-resume-studio-overlay');
    if(overlay){
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden','false');
      const first=overlay.querySelector('input,textarea,button');
      if(first&&overlay.dataset.focused!=='1'){
        overlay.dataset.focused='1';
        setTimeout(()=>first.focus(),0);
      }
      return true;
    }
    if(typeof window.gluefulOpenResumeStudio==='function'){
      window.gluefulOpenResumeStudio();
      return true;
    }
    return false;
  }

  function closeStudio(){
    const overlay=document.getElementById('glueful-resume-studio-overlay');
    if(!overlay)return false;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    return true;
  }

  function companyFromCard(card){
    const el=card?.querySelector('.grs-card-name');
    return clean(el?.textContent||'');
  }

  function findLegacyAction(company){
    const root=legacy();
    if(!root||!company)return null;
    const wanted=clean(company).replace(/^\S+\s+/,'');
    const candidates=[...root.querySelectorAll('button,a,[role="button"],[onclick]')];
    for(const el of candidates){
      const handler=String(el.getAttribute('onclick')||'');
      if(!/openJobResumeEditor|resetJobResumeToMaster|resume/i.test(handler)&&!el.closest('[data-resume-id]'))continue;
      let p=el;
      for(let depth=0;p&&depth<7&&p!==root;depth++,p=p.parentElement){
        const t=textEl(p);
        if(t&&((t.includes(company)&&company.length>2)||(wanted.length>2&&t.includes(wanted))))return el;
      }
    }
    return null;
  }

  function openCompanyResume(card){
    const company=companyFromCard(card);
    const action=findLegacyAction(company);
    if(action){action.click();return true}

    const root=legacy();
    if(root&&company){
      const matches=[...root.querySelectorAll('*')].filter(el=>{
        const t=textEl(el);
        return t===company||t.includes(company)||t.includes(company.replace(/^\S+\s+/,''));
      });
      const match=matches.sort((a,b)=>textEl(a).length-textEl(b).length)[0];
      const target=match?.closest('button,a,[role="button"],summary')||match;
      if(target){target.click();return true}
    }
    return openStudio();
  }

  function downloadActiveResume(){
    const directFns=['downloadJobResume','downloadCandidateResume','exportResumePdf','downloadResumePdf'];
    for(const name of directFns){
      if(typeof window[name]==='function'){try{window[name]();return true}catch(_) {}}
    }
    const studio=document.getElementById('glueful-resume-studio-overlay');
    const text=[...document.querySelectorAll('button,a,[role="button"]')]
      .find(el=>!studio?.contains(el)&&/download.*pdf|pdf.*download|download.*resume/i.test(textEl(el)));
    if(text){text.click();return true}
    const fixed=window.gluefulFixedPdfResumeStudio;
    if(fixed&&typeof fixed.printPdf==='function'){try{fixed.printPdf();return true}catch(_) {}}
    return false;
  }

  function wireStudioClose(){
    const overlay=document.getElementById('glueful-resume-studio-overlay');
    if(!overlay||overlay.dataset.actionsWired==='1')return;
    overlay.dataset.actionsWired='1';
    overlay.addEventListener('click',e=>{
      if(e.target===overlay){e.preventDefault();closeStudio();return}
      const b=e.target.closest('button');
      if(!b)return;
      const t=textEl(b);
      if(/^(close|cancel|back)$/.test(t)||/close/i.test(t)&&!/(download|save)/i.test(t)){
        if(/close|cancel|back/.test(t)){
          e.preventDefault();
          closeStudio();
        }
      }
      if(/download/i.test(t)&&/(pdf|resume)/i.test(t)){
        e.preventDefault();
        downloadActiveResume();
      }
    },true);
  }

  function bind(){
    const v=view();
    if(!v||v.dataset.resumeActionsV1==='1')return;
    v.dataset.resumeActionsV1='1';
    v.addEventListener('click',e=>{
      const b=e.target.closest('button,a,[role="button"]');
      if(!b||!v.contains(b))return;
      const t=textEl(b);

      if(b.matches('.grs-tab')){
        e.preventDefault();
        v.querySelectorAll('.grs-tab').forEach(x=>x.classList.toggle('active',x===b));
        const mode=t;
        const cards=[...v.querySelectorAll('.grs-card')];
        cards.forEach(c=>{
          if(mode==='all resumes'||mode==='by company') c.style.display='';
          else if(mode==='recent') c.style.display='';
        });
        return;
      }

      if(b.matches('.grs-actions [data-action="import"]')||b.matches('[data-action="import"]')){
        e.preventDefault();e.stopPropagation();importResume();return;
      }
      if(b.matches('[data-action="create"]')||b.matches('[data-action="studio"]')){
        e.preventDefault();e.stopPropagation();openStudio();wireStudioClose();return;
      }

      const card=b.closest('.grs-card');
      if(card&&v.contains(card)){
        if(/\b(edit|open)\b/i.test(t)){
          e.preventDefault();e.stopPropagation();openCompanyResume(card);return;
        }
      }
    },true);

    const search=v.querySelector('.grs-search');
    if(search&&!search.dataset.actionsV1){
      search.dataset.actionsV1='1';
      search.addEventListener('input',()=>{
        const q=clean(search.value);
        v.querySelectorAll('.grs-card').forEach(card=>{card.style.display=!q||textEl(card).includes(q)?'':'none'});
      });
    }
    wireStudioClose();
  }

  function start(){
    bind();
    wireStudioClose();
    const observer=new MutationObserver(()=>{bind();wireStudioClose()});
    const v=view();
    if(v)observer.observe(v,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
