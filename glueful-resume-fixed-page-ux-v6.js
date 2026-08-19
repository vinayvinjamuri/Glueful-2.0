/* Glueful Resume Studio — Word-like editing UX patch V6.0 */
(function(){
'use strict';
const VERSION='20260820-resume-ux6';
function pageWidth(page){return Number(page?.clientWidth||parseFloat(page?.style?.width)||794)}
function applyToPage(page){
  if(!page)return;
  const pw=pageWidth(page);
  page.querySelectorAll('.glueful-fixed-text[contenteditable="true"]').forEach(node=>{
    const x=Math.max(0,Number(parseFloat(node.style.left)||0));
    const width=Math.max(40,pw-x-36);
    node.dataset.uxWidth=String(width);
    node.style.width=width+'px';
    node.style.maxWidth=width+'px';
    node.style.overflowWrap='break-word';
    node.style.wordBreak='normal';
    node.style.letterSpacing='normal';
    node.style.boxSizing='border-box';
    node._editorWidth=width;
    const id=node.dataset.blockId;
    const mask=page.querySelector(`.glueful-fixed-mask[data-source-block-id="${id}"]`);
    if(mask){mask.style.left=x+'px';mask.style.width=width+'px';}
    if(node.dataset.uxBound==='1')return;
    node.dataset.uxBound='1';
    node.addEventListener('focus',()=>{
      node.classList.add('glueful-fixed-editing');
      node.style.whiteSpace='pre-wrap';
      node.style.overflow='visible';
      const block=window.gluefulResumeFixedPageState?.model?.pages?.flatMap(p=>p.blocks||[]).find(b=>b.id===id);
      const m=page.querySelector(`.glueful-fixed-mask[data-source-block-id="${id}"]`);
      if(m){m.style.left=x+'px';m.style.width=width+'px';m.style.height=Math.max(node.offsetHeight,Number(block?.height||0))+4+'px';m.classList.add('glueful-fixed-mask-visible');}
    });
    node.addEventListener('input',()=>{
      const block=window.gluefulResumeFixedPageState?.model?.pages?.flatMap(p=>p.blocks||[]).find(b=>b.id===id);
      if(!block)return;
      block.editorWidth=width;
      node.style.width=width+'px';node.style.maxWidth=width+'px';
      node.style.height='auto';
      const minH=Math.max(Number(block.baseHeight||0),Number(block.fontSizePx||14.67)*Number(block.lineHeight||1.12));
      const h=Math.max(minH,node.scrollHeight+2);
      node.style.height=h+'px';block.height=h;
      const m=page.querySelector(`.glueful-fixed-mask[data-source-block-id="${id}"]`);
      if(m){m.style.left=x+'px';m.style.width=width+'px';m.style.height=(h+4)+'px';m.classList.add('glueful-fixed-mask-visible');}
      const nodes=[...page.querySelectorAll('.glueful-fixed-text[data-block-id]')];
      const blocks=(window.gluefulResumeFixedPageState?.model?.pages?.find(p=>p.id===page.dataset.pageId)?.blocks||[])
        .filter(b=>b.type==='text').sort((a,b)=>Number(a.baseY??a.y??0)-Number(b.baseY??b.y??0));
      let shift=0;
      for(const b of blocks){b.y=Number(b.baseY??b.y??0)+shift;const n=nodes.find(el=>el.dataset.blockId===b.id);if(n)n.style.top=b.y+'px';const mm=page.querySelector(`.glueful-fixed-mask[data-source-block-id="${b.id}"]`);if(mm)mm.style.top=b.y+'px';shift+=Math.max(0,Number(b.height||0)-Number(b.baseHeight||b.height||0));}
    });
  });
}
function patch(){
  const renderer=window.gluefulResumeFixedPageRenderer;
  if(!renderer||renderer.__ux6)return false;
  const original=renderer.render;
  renderer.render=function(model,host,options){
    const result=original(model,host,options);
    requestAnimationFrame(()=>host?.querySelectorAll('.glueful-fixed-page').forEach(applyToPage));
    setTimeout(()=>host?.querySelectorAll('.glueful-fixed-page').forEach(applyToPage),50);
    return result;
  };
  renderer.__ux6=true;
  window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{}, {editorUxVersion:VERSION});
  return true;
}
if(!patch()){
  const timer=setInterval(()=>{if(patch())clearInterval(timer)},25);
  setTimeout(()=>clearInterval(timer),30000);
}
})();
