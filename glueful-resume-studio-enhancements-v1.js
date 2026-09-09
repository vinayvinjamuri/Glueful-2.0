/* Glueful — Resume Studio Enhancements V1
 * Adds Word-like selection fidelity, keyboard shortcuts, paragraph styles,
 * safe discard/recovery, autosave draft recovery, zoom, document metrics,
 * and a more reliable editing experience without replacing Resume Studio V4.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUME_STUDIO_ENHANCEMENTS_V1__) return;
  window.__GLUEFUL_RESUME_STUDIO_ENHANCEMENTS_V1__=true;

  const OVERLAY='glueful-resume-studio-v3-overlay';
  const EDITOR='glueful-word-editor';
  const DRAFT_KEY='glueful_resume_studio_draft_v1';
  let savedRange=null;
  let baselineHtml='';
  let baselineTemplate='minimal';
  let baselineReady=false;
  let autosaveTimer=null;
  let zoom=1;

  const byId=id=>document.getElementById(id);
  const editor=()=>byId(EDITOR);
  const overlay=()=>byId(OVERLAY);
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();

  function insideEditor(node){
    const e=editor();
    return !!(e&&node&&e.contains(node));
  }

  function captureSelection(){
    const e=editor();
    const s=window.getSelection?.();
    if(!e||!s||s.rangeCount===0||!insideEditor(s.anchorNode)||!insideEditor(s.focusNode)) return;
    savedRange=s.getRangeAt(0).cloneRange();
  }

  function restoreSelection(){
    const e=editor();
    const s=window.getSelection?.();
    if(!e||!s||!savedRange) return false;
    try{
      if(!insideEditor(savedRange.startContainer)||!insideEditor(savedRange.endContainer)) return false;
      s.removeAllRanges();
      s.addRange(savedRange);
      e.focus({preventScroll:true});
      return true;
    }catch(_){return false}
  }

  function saveBaseline(){
    const e=editor();
    const sel=overlay()?.querySelector('[data-template-select]');
    if(!e) return;
    baselineHtml=e.innerHTML;
    baselineTemplate=sel?.value||e.className.match(/\bg4-page\s+(\w+)/)?.[1]||'minimal';
    baselineReady=true;
  }

  function ensureBaseline(){
    if(!baselineReady&&editor()?.innerHTML.trim()) saveBaseline();
  }

  function setDirty(){
    const api=window.gluefulResumeStudioV4;
    if(!api) return;
    const statuses=overlay()?.querySelectorAll('.g4-status')||[];
    statuses.forEach(x=>x.textContent='Unsaved changes');
    overlay()?.querySelector('.g4-savebar')?.classList.add('show');
  }

  function clearDirty(){
    const statuses=overlay()?.querySelectorAll('.g4-status')||[];
    statuses.forEach(x=>x.textContent='Saved');
    overlay()?.querySelector('.g4-savebar')?.classList.remove('show');
  }

  function toast(msg){
    let n=byId('g4-enhance-toast');
    if(!n){
      n=document.createElement('div');
      n.id='g4-enhance-toast';
      n.style.cssText='position:fixed;right:20px;bottom:20px;z-index:200010;background:#182033;color:#fff;padding:10px 13px;border-radius:9px;font:650 11px Inter,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.24);opacity:0;transform:translateY(6px);transition:.18s ease';
      document.body.appendChild(n);
    }
    n.textContent=msg;n.style.opacity='1';n.style.transform='translateY(0)';
    clearTimeout(n._t);n._t=setTimeout(()=>{n.style.opacity='0';n.style.transform='translateY(6px)';setTimeout(()=>n.remove(),220)},2200);
  }

  function currentTemplate(){
    return overlay()?.querySelector('[data-template-select]')?.value || editor()?.className.match(/\bg4-page\s+(\w+)/)?.[1] || 'minimal';
  }

  function draftData(){
    const e=editor();
    if(!e||!e.innerHTML.trim()) return null;
    return {version:1,html:e.innerHTML,template:currentTemplate(),savedAt:new Date().toISOString()};
  }

  function queueAutosave(){
    clearTimeout(autosaveTimer);
    autosaveTimer=setTimeout(()=>{
      try{
        const d=draftData();
        if(d) sessionStorage.setItem(DRAFT_KEY,JSON.stringify(d));
      }catch(_){ }
      updateMetrics();
    },700);
  }

  function readDraft(){
    try{
      const raw=sessionStorage.getItem(DRAFT_KEY);
      if(!raw) return null;
      const d=JSON.parse(raw);
      if(d?.version!==1||!d.html) return null;
      return d;
    }catch(_){return null}
  }

  function clearDraft(){try{sessionStorage.removeItem(DRAFT_KEY)}catch(_){}}

  function restoreDraft(){
    const d=readDraft();
    const e=editor();
    if(!d||!e) return false;
    e.innerHTML=d.html;
    e.className='g4-page '+(d.template||'minimal');
    const sel=overlay()?.querySelector('[data-template-select]');
    if(sel) sel.value=d.template||'minimal';
    baselineReady=false;
    ensureBaseline();
    setDirty();
    updateMetrics();
    toast('Recovered your unsaved resume draft.');
    return true;
  }

  function installRecoveryButton(){
    const o=overlay();
    if(!o||o.querySelector('[data-recover-draft]')) return;
    if(!readDraft()) return;
    const save=o.querySelector('[data-save]');
    if(!save) return;
    const b=document.createElement('button');
    b.className='g4-btn';
    b.type='button';
    b.dataset.recoverDraft='1';
    b.textContent='Recover draft';
    save.parentElement?.insertBefore(b,save);
  }

  function updateMetrics(){
    const e=editor();
    if(!e) return;
    let bar=overlay()?.querySelector('.g4-doc-metrics');
    if(!bar){
      const root=overlay()?.querySelector('.g4-editor');
      if(!root) return;
      bar=document.createElement('div');
      bar.className='g4-doc-metrics';
      bar.innerHTML='<span data-metric="words">0 words</span><span data-metric="chars">0 characters</span><span data-metric="pages">1 page</span><span class="metric-spacer"></span><span data-metric="draft">Draft saved locally</span>';
      root.appendChild(bar);
    }
    const text=clean(e.innerText||'');
    const words=text?text.split(/\s+/).length:0;
    const chars=(e.innerText||'').length;
    const pageHeight=Math.max(900,e.clientHeight||900);
    const pages=Math.max(1,Math.ceil((e.scrollHeight||pageHeight)/pageHeight));
    const w=bar.querySelector('[data-metric="words"]');
    const c=bar.querySelector('[data-metric="chars"]');
    const p=bar.querySelector('[data-metric="pages"]');
    if(w)w.textContent=words+' '+(words===1?'word':'words');
    if(c)c.textContent=chars+' '+(chars===1?'character':'characters');
    if(p)p.textContent=pages+' '+(pages===1?'page':'pages');
  }

  function setZoom(next){
    zoom=Math.min(1.25,Math.max(.8,next));
    const e=editor();
    if(e)e.style.zoom=String(zoom);
    const out=overlay()?.querySelector('[data-zoom-value]');
    if(out)out.textContent=Math.round(zoom*100)+'%';
  }

  function execCommand(cmd,value){
    const e=editor();
    if(!e) return;
    restoreSelection();
    try{document.execCommand(cmd,false,value)}catch(_){ }
    setDirty();
    queueAutosave();
    updateMetrics();
    captureSelection();
  }

  function addLink(){
    restoreSelection();
    const u=prompt('Enter link URL');
    if(!u) return;
    execCommand('createLink',u.trim());
  }

  function paragraphStyle(value){
    const map={normal:'P',heading:'H2',subheading:'H3',quote:'BLOCKQUOTE'};
    execCommand('formatBlock',map[value]||'P');
  }

  function installToolbarExtras(){
    const o=overlay();
    const ribbon=o?.querySelector('.g4-ribbon');
    if(!ribbon||ribbon.querySelector('[data-enhance-style]')) return;
    const marker=ribbon.querySelector('[data-cmd="bold"]');
    const select=document.createElement('select');
    select.className='g4-select';
    select.dataset.enhanceStyle='1';
    select.title='Paragraph style';
    select.innerHTML='<option value="normal">Normal</option><option value="heading">Heading</option><option value="subheading">Subheading</option><option value="quote">Quote</option>';
    marker?.parentElement?.insertBefore(select,marker) || ribbon.appendChild(select);

    const sep=document.createElement('span');sep.className='g4-sep';sep.dataset.enhanceStyle='1';
    ribbon.appendChild(sep);

    const zmMinus=document.createElement('button');zmMinus.className='g4-tool';zmMinus.type='button';zmMinus.dataset.zoomMinus='1';zmMinus.textContent='−';zmMinus.title='Zoom out';
    const zm=document.createElement('button');zm.className='g4-tool';zm.type='button';zm.dataset.zoomReset='1';zm.title='Reset zoom';zm.innerHTML='<span data-zoom-value>100%</span>';
    const zmPlus=document.createElement('button');zmPlus.className='g4-tool';zmPlus.type='button';zm.dataset.zoomPlus='1';zm.textContent='+';zmPlus.title='Zoom in';
    ribbon.append(zmMinus,zm,zmPlus);
  }

  function installStyles(){
    if(byId('g4-enhancement-style')) return;
    const s=document.createElement('style');
    s.id='g4-enhancement-style';
    s.textContent=`
      .g4-doc-metrics{display:flex;align-items:center;gap:14px;border-top:1px solid #d8dfe8;background:#fff;color:#76839a;padding:6px 9px;font:600 8px Inter,system-ui,sans-serif}
      .g4-doc-metrics .metric-spacer{flex:1}.g4-doc-metrics [data-metric="draft"]{color:#637092}
      #${EDITOR}{caret-color:#5b43df;transition:box-shadow .12s ease}
      #${EDITOR} blockquote{margin:8px 0;padding:8px 12px;border-left:3px solid var(--accent);background:#f7f8fb;color:#65718a}
      #${EDITOR} h2,#${EDITOR} h3{outline:0}
      #${EDITOR} ul,#${EDITOR} ol{padding-left:22px}
      .g4-page-break{break-before:page;page-break-before:always}
      @media print{#${EDITOR}{zoom:1!important}.g4-doc-metrics{display:none!important}}
      @media(max-width:700px){.g4-doc-metrics{overflow:auto;white-space:nowrap}.g4-doc-metrics .metric-spacer{display:none}}
    `;
    document.head.appendChild(s);
  }

  function interceptToolbar(){
    const o=overlay();
    if(!o||o.dataset.g4EnhanceBound) return;
    o.dataset.g4EnhanceBound='1';

    o.addEventListener('mousedown',e=>{
      const tool=e.target.closest('.g4-tool');
      if(tool && !tool.querySelector('input[type="color"]')){
        captureSelection();
        e.preventDefault();
      }
    },true);

    o.addEventListener('click',async e=>{
      const style=e.target.closest('[data-enhance-style]');
      if(style&&style.matches('select')) return;

      const recover=e.target.closest('[data-recover-draft]');
      if(recover){
        e.preventDefault();e.stopImmediatePropagation();
        restoreDraft();return;
      }

      const zmin=e.target.closest('[data-zoom-minus]');
      if(zmin){e.preventDefault();e.stopImmediatePropagation();setZoom(zoom-.1);return}
      const zreset=e.target.closest('[data-zoom-reset]');
      if(zreset){e.preventDefault();e.stopImmediatePropagation();setZoom(1);return}
      const zplus=e.target.closest('[data-zoom-plus]');
      if(zplus){e.preventDefault();e.stopImmediatePropagation();setZoom(zoom+.1);return}

      const color=e.target.closest('[data-color]');
      if(color) return;

      const cmd=e.target.closest('[data-cmd]');
      if(cmd){
        e.preventDefault();e.stopImmediatePropagation();
        if(cmd.dataset.cmd==='undo'||cmd.dataset.cmd==='redo'){restoreSelection();try{document.execCommand(cmd.dataset.cmd)}catch(_){ }setDirty();queueAutosave();updateMetrics();return}
        execCommand(cmd.dataset.cmd);return;
      }

      const link=e.target.closest('[data-link]');
      if(link){e.preventDefault();e.stopImmediatePropagation();addLink();return}

      const pb=e.target.closest('[data-pagebreak]');
      if(pb){e.preventDefault();e.stopImmediatePropagation();execCommand('insertHTML','<div class="g4-page-break"><span>Page Break</span></div><p><br></p>');return}

      const templateCard=e.target.closest('[data-template-card]');
      if(templateCard){
        ensureBaseline();
        return;
      }

      const discard=e.target.closest('[data-discard]');
      if(discard){
        e.preventDefault();e.stopImmediatePropagation();
        if(baselineReady){
          const ed=editor();
          if(ed){ed.innerHTML=baselineHtml;ed.className='g4-page '+baselineTemplate;ed.style.setProperty('--accent',getComputedStyle(ed).getPropertyValue('--accent'))}
          const sel=overlay()?.querySelector('[data-template-select]');if(sel)sel.value=baselineTemplate;
          clearDirty();clearDraft();updateMetrics();toast('Unsaved changes discarded.');
        }else{
          clearDraft();clearDirty();
        }
        return;
      }
    },true);

    o.addEventListener('change',e=>{
      const font=e.target.closest('[data-cmd-select]');
      if(font){
        e.preventDefault();e.stopImmediatePropagation();
        restoreSelection();
        try{document.execCommand(font.dataset.cmdSelect,false,font.value)}catch(_){ }
        setDirty();queueAutosave();updateMetrics();captureSelection();return;
      }
      const style=e.target.closest('[data-enhance-style]');
      if(style){
        e.preventDefault();e.stopImmediatePropagation();paragraphStyle(style.value);return;
      }
      const template=e.target.closest('[data-template-select]');
      if(template){
        ensureBaseline();
        return;
      }
      const color=e.target.closest('[data-color]');
      if(color){
        restoreSelection();
        try{document.execCommand(color.dataset.color,false,color.value)}catch(_){ }
        setDirty();queueAutosave();updateMetrics();captureSelection();
      }
    },true);

    o.addEventListener('keydown',e=>{
      const ed=editor();
      if(!ed) return;
      if(e.target===ed||ed.contains(e.target)){
        if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){
          e.preventDefault();e.stopPropagation();o.querySelector('[data-save]')?.click();return;
        }
        if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
          e.preventDefault();e.stopPropagation();addLink();return;
        }
        if(e.key==='Tab'){
          e.preventDefault();document.execCommand('insertHTML',false,'&nbsp;&nbsp;&nbsp;&nbsp;');setDirty();queueAutosave();return;
        }
      }
      if(e.key==='Escape'&&overlay()?.classList.contains('open')){
        const close=overlay()?.querySelector('[data-close]');
        if(close){e.preventDefault();close.click()}
      }
    },true);
  }

  function patchOpenLifecycle(){
    const api=window.gluefulResumeStudioV4;
    if(!api||api.__enhancedWrapped) return;
    const originalOpen=api.open;
    api.open=function(){
      const result=originalOpen.apply(this,arguments);
      setTimeout(()=>{
        installToolbarExtras();installRecoveryButton();
        ensureBaseline();updateMetrics();
        zoom=1;setZoom(1);
      },0);
      return result;
    };
    api.__enhancedWrapped=true;
  }

  function watchOverlay(){
    const o=overlay();
    if(!o||o.dataset.g4EnhanceWatch) return;
    o.dataset.g4EnhanceWatch='1';
    interceptToolbar();
    const e=editor();
    if(e){
      e.addEventListener('input',()=>{captureSelection();setDirty();queueAutosave();updateMetrics()});
      document.addEventListener('selectionchange',captureSelection);
      e.addEventListener('focus',captureSelection);
    }
  }

  function boot(){
    installStyles();patchOpenLifecycle();
    const o=overlay();
    if(o)watchOverlay();
    const mo=new MutationObserver(()=>{
      patchOpenLifecycle();
      const ov=overlay();
      if(ov){installToolbarExtras();installRecoveryButton();watchOverlay();}
    });
    mo.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>{installToolbarExtras();installRecoveryButton();watchOverlay();updateMetrics()},250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();