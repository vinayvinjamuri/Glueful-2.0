/* Glueful — Resume Studio V3 interaction fixes
 * 1) Close actually closes, with a discard confirmation for unsaved edits.
 * 2) Imported/profile resume content is kept as a session draft.
 * 3) Choosing a template from the hub carries that session draft forward
 *    instead of replacing the resume with blank placeholder data.
 *
 * The draft is sessionStorage-only: it survives navigation/re-renders in the
 * current browser tab but is not a persistent recent-resume history.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUME_STUDIO_V3_FIXES_V1__) return;
  window.__GLUEFUL_RESUME_STUDIO_V3_FIXES_V1__=true;

  const VIEW='view-resumes';
  const HUB='glueful-resume-studio-v3';
  const OVERLAY='glueful-resume-studio-v3-overlay';
  const DRAFT_KEY='glueful_resume_studio_v3_session_draft_v1';
  const FIELDS=['name','headline','email','phone','location','linkedin','summary','experience','education','skills','projects','certifications'];

  function overlay(){return document.getElementById(OVERLAY)}
  function clean(v){return String(v??'').replace(/\s+/g,' ').trim()}
  function hasUnsavedChanges(o){
    if(!o) return false;
    const bar=o.querySelector('.g3-savebar');
    const status=o.querySelector('.g3-status');
    return !!(bar?.classList.contains('show') || /unsaved changes/i.test(status?.textContent||''));
  }

  function readDraft(){
    try{
      const raw=sessionStorage.getItem(DRAFT_KEY);
      if(!raw)return null;
      const parsed=JSON.parse(raw);
      if(!parsed||typeof parsed!=='object'||!parsed.model)return null;
      return parsed;
    }catch(_){return null}
  }

  function writeDraft(o){
    if(!o)return;
    const model={};
    FIELDS.forEach(k=>{
      const el=o.querySelector(`[data-field="${k}"]`);
      model[k]=el?.value??'';
    });
    const select=o.querySelector('[data-studio="template"]');
    const payload={
      model,
      template:select?.value||'minimal',
      updatedAt:Date.now()
    };
    try{sessionStorage.setItem(DRAFT_KEY,JSON.stringify(payload))}catch(_){}
    window.__gluefulResumeStudioDraft=payload;
  }

  function clearDraft(){
    try{sessionStorage.removeItem(DRAFT_KEY)}catch(_){}
    delete window.__gluefulResumeStudioDraft;
  }

  function setOpen(o,open){
    if(!o)return;
    o.classList.toggle('open',!!open);
    o.setAttribute('aria-hidden',open?'false':'true');
  }

  function dispatchInput(el){
    if(!el)return;
    el.dispatchEvent(new Event('input',{bubbles:true}));
  }

  function applyDraftToStudio(draft,templateKey){
    const o=overlay();
    if(!o||!draft?.model)return false;
    setOpen(o,true);
    FIELDS.forEach(k=>{
      const el=o.querySelector(`[data-field="${k}"]`);
      if(el){el.disabled=false;el.readOnly=false;el.value=String(draft.model[k]??'');el.style.pointerEvents='auto';dispatchInput(el)}
    });
    const select=o.querySelector('[data-studio="template"]');
    if(select){
      select.value=templateKey||draft.template||'minimal';
      select.dispatchEvent(new Event('change',{bubbles:true}));
    }
    const status=o.querySelector('.g3-status');
    if(status)status.textContent='Unsaved changes';
    o.querySelector('.g3-savebar')?.classList.add('show');
    setTimeout(()=>o.querySelector('[data-field="name"]')?.focus(),0);
    writeDraft(o);
    return true;
  }

  function applyTemplateAfterProfileLoad(templateKey){
    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      const o=overlay();
      const select=o?.querySelector('[data-studio="template"]');
      if(o?.classList.contains('open')&&select){
        select.value=templateKey;
        select.dispatchEvent(new Event('change',{bubbles:true}));
        writeDraft(o);
        clearInterval(timer);
      }else if(tries>30){
        clearInterval(timer);
      }
    },50);
  }

  function handleTemplateCard(e){
    if(e.defaultPrevented)return;
    const t=e.target?.closest?.(`#${HUB} [data-template]`);
    if(!t)return;
    const key=t.getAttribute('data-template');
    if(!key)return;

    /* Stop V3's original hub handler before it executes model=blank(). */
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();

    const draft=readDraft()||window.__gluefulResumeStudioDraft;
    if(draft?.model){
      if(applyDraftToStudio(draft,key))return;
    }

    /* No session draft exists: use the profile as the starting resume. */
    const profileBtn=document.querySelector(`#${HUB} [data-g3="profile"]`);
    if(profileBtn){
      profileBtn.click();
      applyTemplateAfterProfileLoad(key);
      return;
    }

    /* Final fallback: open the existing studio and select the template. */
    const o=overlay();
    if(o){
      setOpen(o,true);
      const select=o.querySelector('[data-studio="template"]');
      if(select){
        select.value=key;
        select.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }
  }

  function handleClose(e){
    const b=e.target?.closest?.(`#${OVERLAY} [data-studio="close"]`);
    if(!b)return;
    const o=overlay();
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    if(!o)return;

    if(hasUnsavedChanges(o)){
      const discard=window.confirm('You have unsaved changes. Close without saving?');
      if(!discard)return;
      /* Let V3's own discard path reset its private dirty flag as well. */
      const del=o.querySelector('[data-studio="delete"]');
      if(del){del.click();return}
      setOpen(o,false);
      o.querySelector('.g3-savebar')?.classList.remove('show');
      clearDraft();
      return;
    }

    const del=o.querySelector('[data-studio="delete"]');
    if(del){del.click();return}
    setOpen(o,false);
    clearDraft();
  }

  function handleEscape(e){
    if(e.key!=='Escape')return;
    const o=overlay();
    if(!o?.classList.contains('open'))return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    const close=o.querySelector('[data-studio="close"]');
    if(close)close.click();
  }

  function handleStudioState(e){
    const o=e.target?.closest?.(`#${OVERLAY}`);
    if(!o)return;
    if(e.type==='input' || (e.type==='change' && e.target?.matches?.('[data-studio="template"]'))){
      writeDraft(o);
      return;
    }
    const action=e.target?.closest?.(`#${OVERLAY} [data-studio]`);
    if(!action)return;
    const name=action.getAttribute('data-studio');
    if(name==='delete')clearDraft();
    else if(name==='save' || name==='pdf' || name==='docx' || name==='txt')writeDraft(o);
  }

  function start(){
    document.addEventListener('click',handleClose,true);
    document.addEventListener('click',handleTemplateCard,true);
    document.addEventListener('keydown',handleEscape,true);
    document.addEventListener('input',handleStudioState,true);
    document.addEventListener('change',handleStudioState,true);

    const o=overlay();
    if(o)writeDraft(o);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
