/* Glueful Resume Studio — deterministic PDF download V2
 *
 * The old exporter delegated PDF creation to window.print(). That made the
 * browser print pipeline responsible for selections, page breaks, and the
 * download destination. This version creates the PDF directly from the
 * fixed-page renderer and uses showSaveFilePicker when supported, so Chrome /
 * Edge ask the user where to save instead of silently using Downloads.
 */
(function(){
'use strict';
const VERSION='20260820-pdf-download-v2';
const PAGE_SEL='.glueful-fixed-page';
const STUDIO_KEY='gluefulFixedPdfResumeStudio';
const MODAL_ID='job-resume-editor-modal';

function state(){return window.gluefulResumeFixedPageState||window.gluefulFixedPdfResumeState||null}
function pageSizePx(page){return{width:Math.max(1,Number(page?.widthPx||794)),height:Math.max(1,Number(page?.heightPx||1123))}}
function safeName(){try{const j=window.findActiveJobById?.(window.gluefulJobResumeEditorId);return String(j?.company||j?.title||'resume').replace(/[^a-z0-9._-]+/gi,'-').replace(/^-+|-+$/g,'')||'resume'}catch(_){return'resume'}}
function clearSelection(){try{window.getSelection?.()?.removeAllRanges()}catch(_){}try{document.activeElement?.blur?.()}catch(_){}
}
function hasRealText(page){return(page?.blocks||[]).some(b=>b?.type==='text'&&String(b.text??b.html??'').replace(/<[^>]*>/g,'').trim()!=='')}
function makeExportClone(sourcePage,page){
 const clone=sourcePage.cloneNode(true),size=pageSizePx(page);
 clone.style.cssText=`position:relative!important;display:block!important;width:${size.width}px!important;height:${size.height}px!important;min-width:${size.width}px!important;min-height:${size.height}px!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;overflow:hidden!important;transform:none!important;box-shadow:none!important;`;
 clone.removeAttribute('contenteditable');
 clone.querySelectorAll('.glueful-fixed-editing-warning').forEach(n=>n.style.setProperty('display','none','important'));
 const blocks=new Map((page.blocks||[]).map(b=>[String(b.id),b]));
 clone.querySelectorAll('.glueful-fixed-text').forEach(n=>{
   const b=blocks.get(String(n.dataset.blockId));
   n.removeAttribute('contenteditable');
   n.classList.remove('glueful-fixed-editing');
   n.style.setProperty('caret-color','transparent','important');
   n.style.setProperty('outline','none','important');
   n.style.setProperty('box-shadow','none','important');
   n.style.setProperty('background','transparent','important');
   if(b?.dirty){
     n.style.setProperty('color',String(b.color||'#202124'),'important');
     n.style.setProperty('opacity','1','important');
     n.style.setProperty('overflow','visible','important');
     const mask=n.parentElement?.querySelector?.(`.glueful-fixed-mask[data-source-block-id="${CSS.escape(String(b.id))}"]`);
     if(mask){mask.style.setProperty('visibility','visible','important');mask.style.setProperty('display','block','important')}
   }else{
     n.style.setProperty('color','transparent','important');
   }
 });
 clone.querySelectorAll('.glueful-fixed-mask').forEach(n=>{
   const id=n.dataset.sourceBlockId,b=id?blocks.get(String(id)):null;
   if(b?.dirty){n.style.setProperty('visibility','visible','important');n.style.setProperty('display','block','important')}
   else n.style.setProperty('visibility','hidden','important');
 });
 return clone;
}
async function buildPdfBlob(){
 const s=state(),model=s?.model,source=s?.surface||window.gluefulResumeFixedPageRenderer?.getState?.()?.surface;
 if(!model?.pages?.length)throw new Error('No editable resume layout is active. Open Resume Studio first.');
 if(!source)throw new Error('Fixed-page renderer surface is unavailable.');
 if(!window.html2canvas)throw new Error('PDF renderer is not ready. Refresh Glueful once.');
 const pages=[...source.querySelectorAll(PAGE_SEL)];
 if(pages.length!==model.pages.length)throw new Error(`Resume page count mismatch (${pages.length}/${model.pages.length}).`);
 const originalSelection=window.getSelection?.();
 const hadSelection=!!originalSelection?.rangeCount;
 clearSelection();
 const host=document.createElement('div');
 host.id='glueful-pdf-export-host-v2';
 host.style.cssText='position:fixed!important;left:-100000px!important;top:0!important;width:1px!important;height:1px!important;overflow:visible!important;pointer-events:none!important;z-index:-2147483648!important;background:#fff!important;';
 document.body.appendChild(host);
 const rendered=[];
 try{
   for(let i=0;i<model.pages.length;i++){
     const page=model.pages[i];
     /* A completely empty model page is not a real resume page. */
     if(!hasRealText(page)&&(!page.backgrounds||page.backgrounds.length===0))continue;
     const clone=makeExportClone(pages[i],page);
     host.replaceChildren(clone);
     await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
     const canvas=await window.html2canvas(clone,{scale:2,useCORS:true,allowTaint:false,backgroundColor:'#fff',logging:false,removeContainer:true,foreignObjectRendering:false,width:pageSizePx(page).width,height:pageSizePx(page).height,scrollX:0,scrollY:0});
     rendered.push({page,canvas});
   }
 }finally{host.remove()}
 if(!rendered.length)throw new Error('The resume contains no printable pages.');
 const JsPDF=window.jspdf?.jsPDF;
 if(!JsPDF)throw new Error('PDF engine is not ready. Refresh Glueful once.');
 const first=pageSizePx(rendered[0].page);
 const pdf=new JsPDF({orientation:first.width>=first.height?'landscape':'portrait',unit:'pt',format:[first.width*72/96,first.height*72/96],compress:true});
 rendered.forEach(({page,canvas},i)=>{
   const size=pageSizePx(page),w=size.width*72/96,h=size.height*72/96;
   if(i>0)pdf.addPage([w,h],size.width>=size.height?'landscape':'portrait');
   pdf.addImage(canvas.toDataURL('image/jpeg',0.98),'JPEG',0,0,w,h,undefined,'FAST');
 });
 const blob=pdf.output('blob');
 window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{},{pdfExportVersion:VERSION,pdfExportRenderer:'html2canvas-fixed-pages',pdfExportSelectionCleared:true,pdfExportBlankPageFix:true,pdfExportPages:rendered.length,pdfExportSkippedEmptyPages:model.pages.length-rendered.length});
 if(hadSelection)clearSelection();
 return blob;
}
function pickSaveHandle(ext,mime,description){
 if(typeof window.showSaveFilePicker!=='function')return null;
 return window.showSaveFilePicker({suggestedName:`${safeName()}-resume.${ext}`,types:[{description,accept:{[mime]:[`.${ext}`]}}],excludeAcceptAllOption:false});
}
async function saveBlob(blob,handle,filename){
 if(handle){const w=await handle.createWritable();await w.write(blob);await w.close();return true}
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return true;
}
async function exportPdf(){
 /* IMPORTANT: picker is requested before the first await, while click activation is alive. */
 const handle=pickSaveHandle('pdf','application/pdf','PDF document');
 const blob=await buildPdfBlob();
 await saveBlob(blob,handle,`${safeName()}-resume.pdf`);
 return true;
}
async function exportDocx(){
 if(typeof window.gluefulVectorDocxExport==='function')return window.gluefulVectorDocxExport();
 throw new Error('Word export is not ready. Refresh Glueful once.');
}
function textOf(el){return String(el?.innerText||el?.textContent||el?.getAttribute?.('aria-label')||el?.getAttribute?.('title')||'').replace(/\s+/g,' ').trim().toLowerCase()}
function insideModal(el){const m=document.getElementById(MODAL_ID);return!!m&&m.contains(el)}
function showFormatMenu(anchor){
 let old=document.getElementById('glueful-download-format-menu-v2');if(old)old.remove();
 const menu=document.createElement('div');menu.id='glueful-download-format-menu-v2';menu.style.cssText='position:fixed;z-index:2147483000;min-width:190px;padding:6px;background:#202124;border:1px solid #4a4d55;border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,.35);font:600 13px Inter,Arial,sans-serif;';
 const r=anchor.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(window.innerWidth-205,r.left))+'px';menu.style.top=Math.max(8,r.top-100)+'px';
 const item=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='display:block;width:100%;padding:10px 12px;border:0;border-radius:7px;background:transparent;color:#fff;text-align:left;cursor:pointer;font:inherit;';b.addEventListener('mouseenter',()=>b.style.background='#343741');b.addEventListener('mouseleave',()=>b.style.background='transparent');b.addEventListener('click',async e=>{e.preventDefault();e.stopPropagation();menu.remove();try{await fn()}catch(err){console.error('[Glueful download]',err);window.showError?.(err?.message||'Could not save the resume.')}});menu.appendChild(b)};
 item('Download PDF',exportPdf);item('Download DOCX',exportDocx);document.body.appendChild(menu);
 const close=e=>{if(!menu.contains(e.target)&&e.target!==anchor){menu.remove();document.removeEventListener('pointerdown',close,true)}};setTimeout(()=>document.addEventListener('pointerdown',close,true),0);
}
function install(){
 if(window.__gluefulResumeDownloadV2Installed)return;
 window.__gluefulResumeDownloadV2Installed=true;
 window.gluefulResumePdfExport=exportPdf;
 document.addEventListener('click',e=>{
   const target=e.target?.closest?.('button,a,[role="button"]');
   if(!target||!insideModal(target))return;
   const t=textOf(target);
   const isPdf=/download\s*pdf|pdf\s*(download|export|save)/.test(t);
   const isDocx=/download\s*(docx|word)|(?:docx|word)\s*(download|export|save)/.test(t);
   const isMain=/^(download|save|download resume|save resume)$/.test(t);
   if(isPdf){e.preventDefault();e.stopImmediatePropagation();exportPdf().catch(err=>{console.error('[Glueful PDF export]',err);window.showError?.(err?.message||'Could not save the PDF.')});return}
   if(isDocx){e.preventDefault();e.stopImmediatePropagation();exportDocx().catch(err=>{console.error('[Glueful DOCX export]',err);window.showError?.(err?.message||'Could not save the Word resume.')});return}
   if(isMain){e.preventDefault();e.stopImmediatePropagation();showFormatMenu(target)}
 },true);
 window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{},{pdfExportVersion:VERSION,downloadSavePicker:true,downloadMenuVersion:VERSION});
 console.info('[Glueful] deterministic resume download installed',VERSION);
}
function installStudio(){
 const studio=window[STUDIO_KEY];
 if(studio&&typeof studio.printPdf==='function'){studio.printPdf=exportPdf;studio.__pdfExportFixVersion=VERSION;window.gluefulFixedPdfPrint=exportPdf;return true}
 return false;
}
function boot(){install();if(installStudio())return;let n=0;const timer=setInterval(()=>{n++;if(installStudio()||n>=120)clearInterval(timer)},250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();