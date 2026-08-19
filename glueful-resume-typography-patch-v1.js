/* Glueful Resume Studio — editable typography safety patch V1
   Prevents accidentally editing a PDF text run at an unreadably tiny size.
   The original PDF artwork remains unchanged; only the active editable
   overlay is normalized. */
(function(){
'use strict';
const VERSION='20260820-resume-typography-v1';
const MIN_EDITABLE_PX=12.67; // 9.5pt at 96dpi
function normalize(block,node){
  if(!block||!node||block.editable===false)return;
  const current=Number(block.fontSizePx||0);
  if(current>=MIN_EDITABLE_PX)return;
  block.fontSizePx=MIN_EDITABLE_PX;
  node.style.fontSize=MIN_EDITABLE_PX+'px';
  block.lineHeight=Math.max(Number(block.lineHeight||1.12),1.12);
  node.style.lineHeight=String(block.lineHeight);
}
function patch(){
  const renderer=window.gluefulResumeFixedPageRenderer;
  if(!renderer||renderer.__typographyV1)return false;
  const original=renderer.render;
  renderer.render=function(model,host,options){
    const result=original(model,host,options);
    requestAnimationFrame(()=>host?.querySelectorAll('.glueful-fixed-page').forEach(page=>{
      page.querySelectorAll('.glueful-fixed-text[contenteditable="true"]').forEach(node=>{
        const id=node.dataset.blockId;
        const block=model.pages.flatMap(p=>p.blocks||[]).find(b=>b.id===id);
        if(!block)return;
        node.addEventListener('focus',()=>{normalize(block,node);},true);
        node.addEventListener('input',()=>{normalize(block,node);},true);
        normalize(block,node);
      });
    }));
    return result;
  };
  renderer.__typographyV1=true;
  window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{}, {typographyPatchVersion:VERSION,minEditableFontPx:MIN_EDITABLE_PX});
  return true;
}
if(!patch()){
  const timer=setInterval(()=>{if(patch())clearInterval(timer)},25);
  setTimeout(()=>clearInterval(timer),30000);
}
})();
