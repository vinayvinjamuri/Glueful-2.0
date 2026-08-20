/* Glueful Resume Studio — PDF export fix V1
 *
 * The fixed-page editor uses a visual PDF background plus editable text overlays.
 * The old print path cloned the whole surface wrapper, which could create an
 * extra blank page. It could also print the browser text selection highlight.
 *
 * This exporter prints each fixed page as a direct page sibling, clears the
 * active selection before cloning, and restores the selection after print.
 */
(function(){
'use strict';
const VERSION='20260820-pdf-export-fix-v1';
const PAGE_SEL='.glueful-fixed-page';
const STUDIO_KEY='gluefulFixedPdfResumeStudio';

function state(){return window.gluefulResumeFixedPageState||window.gluefulFixedPdfResumeState||null}

function pageSizePx(page){
  return {
    width:Math.max(1,Number(page?.widthPx||794)),
    height:Math.max(1,Number(page?.heightPx||1123))
  };
}

function makePrintPage(sourcePage,page,index){
  const clone=sourcePage.cloneNode(true);
  clone.classList.add('glueful-fixed-print-page');
  clone.removeAttribute('contenteditable');
  const size=pageSizePx(page);
  clone.style.setProperty('width',`${size.width}px`,'important');
  clone.style.setProperty('height',`${size.height}px`,'important');
  clone.style.setProperty('min-width',`${size.width}px`,'important');
  clone.style.setProperty('min-height',`${size.height}px`,'important');
  clone.style.setProperty('max-width','none','important');
  clone.style.setProperty('max-height','none','important');
  clone.style.setProperty('margin','0','important');
  clone.style.setProperty('padding','0','important');
  clone.style.setProperty('box-shadow','none','important');
  clone.style.setProperty('transform','none','important');
  clone.style.setProperty('break-after',index===0?'page':'page','important');
  clone.style.setProperty('page-break-after','always','important');
  return clone;
}

function printPdf(){
  const s=state(),model=s?.model;
  if(!model?.pages?.length)throw new Error('No fixed-page resume is active.');
  const source=s.surface||window.gluefulResumeFixedPageRenderer?.getState?.()?.surface;
  if(!source)throw new Error('Fixed-page renderer surface is unavailable.');
  const sourcePages=[...source.querySelectorAll(PAGE_SEL)];
  if(sourcePages.length!==model.pages.length)throw new Error(`Resume page count mismatch (${sourcePages.length}/${model.pages.length}).`);

  const selection=window.getSelection?.();
  const ranges=[];
  if(selection){
    for(let i=0;i<selection.rangeCount;i++)ranges.push(selection.getRangeAt(i).cloneRange());
    selection.removeAllRanges();
  }

  const oldPrintSheet=document.getElementById('glueful-fixed-print-sheet');
  if(oldPrintSheet)oldPrintSheet.remove();

  const sheet=document.createElement('div');
  sheet.id='glueful-fixed-print-sheet';
  const pages=document.createElement('div');
  pages.className='glueful-fixed-print-pages-v1';
  pages.style.cssText='display:block!important;width:auto!important;min-width:0!important;margin:0!important;padding:0!important;transform:none!important;';

  model.pages.forEach((page,index)=>{
    const clone=makePrintPage(sourcePages[index],page,index);
    pages.appendChild(clone);
  });
  sheet.appendChild(pages);

  const first=pageSizePx(model.pages[0]);
  const css=document.createElement('style');
  css.textContent=`
@page{size:${(first.width/96).toFixed(4)}in ${(first.height/96).toFixed(4)}in;margin:0!important}
html,body{margin:0!important;padding:0!important;background:#fff!important}
body>#__glueful_app_root,body>#app,body>main{display:none!important}
#glueful-fixed-print-sheet{display:block!important;position:static!important;width:auto!important;height:auto!important;margin:0!important;padding:0!important;background:#fff!important}
.glueful-fixed-print-pages-v1{display:block!important;width:auto!important;min-width:0!important;margin:0!important;padding:0!important;transform:none!important}
.glueful-fixed-print-pages-v1 .glueful-fixed-print-page{display:block!important;position:relative!important;float:none!important;box-sizing:border-box!important;overflow:hidden!important;break-after:page!important;page-break-after:always!important;transform:none!important;box-shadow:none!important;margin:0!important}
.glueful-fixed-print-pages-v1 .glueful-fixed-print-page:last-child{break-after:auto!important;page-break-after:auto!important}
.glueful-fixed-print-pages-v1 .glueful-fixed-bg{position:absolute!important}
.glueful-fixed-print-pages-v1 .glueful-fixed-text{position:absolute!important}
.glueful-fixed-print-pages-v1 *::selection{background:transparent!important;color:inherit!important}
`;
  sheet.appendChild(css);
  document.body.appendChild(sheet);

  const restore=()=>{
    if(sheet.isConnected)sheet.remove();
    if(selection&&ranges.length){try{selection.removeAllRanges();ranges.forEach(r=>selection.addRange(r))}catch(_){} }
  };
  window.addEventListener('afterprint',restore,{once:true});
  try{
    window.print();
    setTimeout(restore,15000);
  }catch(error){restore();throw error}

  window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{},{
    pdfExportVersion:VERSION,
    pdfExportPages:model.pages.length,
    pdfExportRenderer:'direct-fixed-pages',
    pdfExportSelectionCleared:true,
    pdfExportBlankPageFix:true
  });
}

function install(){
  const studio=window[STUDIO_KEY];
  if(!studio||typeof studio.printPdf!=='function')return false;
  if(studio.__pdfExportFixVersion===VERSION)return true;
  studio.printPdf=printPdf;
  studio.__pdfExportFixVersion=VERSION;
  window.gluefulFixedPdfPrint=printPdf;
  console.info('[Glueful] PDF export fix loaded',VERSION);
  return true;
}

function boot(){
  if(install())return;
  let attempts=0;
  const timer=setInterval(()=>{
    attempts++;
    if(install()||attempts>=120)clearInterval(timer);
  },250);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
