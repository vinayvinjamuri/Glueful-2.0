/* =========================================================
   GLUEFUL RESUME STUDIO — VECTOR DOCX EXPORT V1
   ---------------------------------------------------------
   Exports the live fixed-page layout model directly to DOCX.

   IMPORTANT:
   - Do NOT round-trip PDF -> DOCX for the download path.
   - Page artwork is rasterized only as the visual background.
   - Resume text is recreated as real WordprocessingML text boxes.
   - Therefore text remains selectable/searchable and renders sharply
     like native Microsoft Word text instead of becoming a blurry image.
   ========================================================= */
(function(){
'use strict';
const VERSION='20260820-vector-docx-v1';
const EDITOR_MODAL_ID='job-resume-editor-modal';
const state=()=>window.gluefulResumeFixedPageState||window.gluefulFixedPdfResumeState||null;
const $=id=>document.getElementById(id);

function hex(v, fallback='202124'){
  const s=String(v||'').trim();
  if(/^#[0-9a-f]{6}$/i.test(s))return s.slice(1).toUpperCase();
  if(/^#[0-9a-f]{3}$/i.test(s))return s.slice(1).split('').map(c=>c+c).join('').toUpperCase();
  return fallback;
}
function inches(px){return Math.max(0,Number(px||0)/96);}
function twips(px){return Math.max(1,Math.round(Number(px||0)*15));}
function emu(px){return Math.max(0,Math.round(Number(px||0)*9525));}
function halfPoints(px){return Math.max(2,Math.round(Number(px||14.67)*1.5));}
function safeName(){
  try{
    const job=window.findActiveJobById?.(window.gluefulJobResumeEditorId);
    const raw=job?.company||job?.title||'resume';
    return String(raw).replace(/[^a-z0-9._-]+/gi,'-').replace(/^-+|-+$/g,'')||'resume';
  }catch(_){return 'resume'}
}
function dataUrlBytes(src){
  const m=String(src||'').match(/^data:([^;,]+)?(?:;base64)?,(.*)$/s);
  if(!m)return null;
  const mime=m[1]||'image/png';
  const raw=m[2]||'';
  if(/;base64,/.test(String(src))){
    const bin=atob(raw); const out=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
    return {mime,data:out};
  }
  const text=decodeURIComponent(raw);
  return {mime,data:new TextEncoder().encode(text)};
}
function imageType(mime){
  const m=String(mime||'').toLowerCase();
  if(m.includes('jpeg')||m.includes('jpg'))return 'jpg';
  if(m.includes('gif'))return 'gif';
  if(m.includes('bmp'))return 'bmp';
  return 'png';
}
async function imageBytes(src){
  const direct=dataUrlBytes(src);
  if(direct)return {type:imageType(direct.mime),data:direct.data};
  const response=await fetch(src,{mode:'cors',credentials:'omit'});
  if(!response.ok)throw new Error(`Could not read resume artwork (${response.status}).`);
  const blob=await response.blob();
  return {type:imageType(blob.type),data:new Uint8Array(await blob.arrayBuffer())};
}
async function loadImage(img){
  if(img.complete&&img.naturalWidth)return img;
  await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',()=>reject(new Error('Resume artwork image failed to load.')),{once:true})});
  return img;
}
async function composePage(pageIndex,page,stateObj){
  const pages=stateObj.surface?.querySelectorAll?.('.glueful-fixed-page')||[];
  const pageEl=pages[pageIndex];
  const scale=2;
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(page.widthPx*scale));
  canvas.height=Math.max(1,Math.round(page.heightPx*scale));
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,canvas.width,canvas.height);
  const backgrounds=[...(page.backgrounds||[])];
  for(const bg of backgrounds){
    let img=null;
    if(pageEl)img=pageEl.querySelector(`.glueful-fixed-bg[src="${CSS.escape(bg.src||'')}"]`);
    if(!img&&pageEl)img=[...pageEl.querySelectorAll('.glueful-fixed-bg')].find(x=>x.src===bg.src);
    if(img){await loadImage(img);try{ctx.drawImage(img,Number(bg.x||0)*scale,Number(bg.y||0)*scale,Number(bg.width||0)*scale,Number(bg.height||0)*scale)}catch(e){throw new Error('Resume artwork could not be embedded because the source image blocks canvas access.')}}
    else if(bg.src){const b=await imageBytes(bg.src);const blob=new Blob([b.data],{type:b.type==='jpg'?'image/jpeg':`image/${b.type}`});const objectUrl=URL.createObjectURL(blob);try{const tmp=new Image();tmp.src=objectUrl;await loadImage(tmp);ctx.drawImage(tmp,Number(bg.x||0)*scale,Number(bg.y||0)*scale,Number(bg.width||0)*scale,Number(bg.height||0)*scale)}finally{URL.revokeObjectURL(objectUrl)}}
  }
  const masks=[...(page.masks||[])];
  for(const b of (page.blocks||[])){
    if(b.type!=='text')continue;
    masks.push({x:b.maskX??b.x,y:b.maskY??b.y,width:b.maskWidth??b.width,height:b.maskHeight??b.height,color:'#FFFFFF'});
  }
  for(const mask of masks){
    ctx.fillStyle=hex(mask.color||'#FFFFFF','FFFFFF');
    ctx.fillRect(Number(mask.x||0)*scale,Number(mask.y||0)*scale,Math.max(0,Number(mask.width||0))*scale,Math.max(0,Number(mask.height||0))*scale);
  }
  const png=await new Promise((resolve,reject)=>canvas.toBlob(resolve,'image/png',1));
  if(!png)throw new Error('Could not create the sharp resume page artwork.');
  return {type:'png',data:new Uint8Array(await png.arrayBuffer()),width:page.widthPx*scale,height:page.heightPx*scale};
}
function textRunsFromHtml(block){
  const html=String(block.html||'').trim();
  if(!html)return [new docx.TextRun({text:String(block.text||''),bold:String(block.fontWeight||'400')>='600',italics:block.fontStyle==='italic',underline:block.textDecoration==='underline',font:block.fontFamily,size:halfPoints(block.fontSizePx),color:hex(block.color)})];
  const root=document.createElement('div');root.innerHTML=html;
  const runs=[];
  const walk=(node,style={})=>{
    if(node.nodeType===Node.TEXT_NODE){
      const text=node.nodeValue||'';
      if(text)runs.push(new docx.TextRun({text,bold:!!style.bold,italics:!!style.italics,underline:style.underline?'single':undefined,font:style.font||block.fontFamily,size:halfPoints(style.size||block.fontSizePx),color:hex(style.color||block.color)}));
      return;
    }
    if(node.nodeType!==Node.ELEMENT_NODE)return;
    const tag=node.tagName.toLowerCase();
    const next={...style};
    if(tag==='strong'||tag==='b')next.bold=true;
    if(tag==='em'||tag==='i')next.italics=true;
    if(tag==='u')next.underline=true;
    if(tag==='br'){runs.push(new docx.TextRun({text:'',break:1}));return}
    if(/^h[1-6]$/.test(tag))next.bold=true;
    if(tag==='font'&&node.getAttribute('face'))next.font=node.getAttribute('face');
    if(node.style){if(node.style.color)next.color=node.style.color;if(node.style.fontFamily)next.font=node.style.fontFamily;if(node.style.fontSize)next.size=parseFloat(node.style.fontSize)||next.size}
    [...node.childNodes].forEach(child=>walk(child,next));
    if(['div','p','li'].includes(tag))runs.push(new docx.TextRun({text:'',break:1}));
  };
  [...root.childNodes].forEach(n=>walk(n));
  while(runs.length&&runs[runs.length-1].root?.length===0)runs.pop();
  return runs.length?runs:[new docx.TextRun({text:String(block.text||''),font:block.fontFamily,size:halfPoints(block.fontSizePx),color:hex(block.color)})];
}
function textBox(block){
  const width=Math.max(0.1,inches(block.width||40));
  const height=Math.max(0.08,inches(Math.max(Number(block.height||0),Number(block.fontSizePx||14.67)*1.2)));
  const style={
    width:`${width}in`,height:`${height}in`,position:'absolute',left:`${inches(block.x)}in`,top:`${inches(block.y)}in`,wrapStyle:'none'
  };
  return new docx.Textbox({children:textRunsFromHtml(block),style});
}
async function exportDocx(){
  const s=state();
  const model=s?.model;
  if(!model?.pages?.length)throw new Error('No editable resume layout is active. Open the resume editor first.');
  if(!window.docx?.Document||!window.docx?.Packer||!window.docx?.Textbox)throw new Error('The Word DOCX generator is not ready. Refresh Glueful and try again.');
  const sections=[];
  for(let i=0;i<model.pages.length;i++){
    const page=model.pages[i];
    const bg=await composePage(i,page,s);
    const children=[];
    const bgImage=new docx.ImageRun({type:'png',data:bg.data,transformation:{width:page.widthPx,height:page.heightPx},floating:{horizontalPosition:{relative:docx.HorizontalPositionRelativeFrom.PAGE,offset:0},verticalPosition:{relative:docx.VerticalPositionRelativeFrom.PAGE,offset:0},behindDocument:true,allowOverlap:true,lockAnchor:true,wrap:{type:docx.TextWrappingType.NONE,side:docx.TextWrappingSide.BOTH_SIDES},zIndex:0}});
    children.push(new docx.Paragraph({children:[bgImage]}));
    const blocks=[...(page.blocks||[])].filter(b=>b.type==='text'&&String(b.text??b.html??'').trim()!=='').sort((a,b)=>Number(a.y||0)-Number(b.y||0));
    for(const block of blocks)children.push(new docx.Paragraph({children:[textBox(block)],spacing:{before:0,after:0,line:0}}));
    sections.push({children,properties:{type:i===0?docx.SectionType.NEXT_PAGE:docx.SectionType.NEXT_PAGE,page:{margin:{top:0,right:0,bottom:0,left:0,header:0,footer:0},size:{width:twips(page.widthPx),height:twips(page.heightPx)}}}});
  }
  if(sections.length)sections[0].properties.type=docx.SectionType.NEXT_PAGE;
  const document=new docx.Document({creator:'Glueful Resume Studio',title:'Resume',sections});
  const blob=await docx.Packer.toBlob(document);
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${safeName()}-resume.docx`;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{},{docxExportVersion:VERSION,docxExportRenderer:'vector-textboxes',docxExportPages:model.pages.length});
  return true;
}
function isDownloadTarget(el){
  if(!el)return false;
  const modal=$(EDITOR_MODAL_ID);if(!modal||!modal.contains(el))return false;
  const text=String(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
  const aria=String(el.getAttribute?.('aria-label')||'').toLowerCase();
  const title=String(el.getAttribute?.('title')||'').toLowerCase();
  return /download.*(resume|docx|word)|(?:docx|word).*download|download resume/.test(`${text} ${aria} ${title}`);
}
function install(){
  if(window.__gluefulVectorDocxExportInstalled)return;
  window.__gluefulVectorDocxExportInstalled=true;
  window.gluefulVectorDocxExport=exportDocx;
  document.addEventListener('click',event=>{
    const target=event.target?.closest?.('button,a,[role="button"]');
    if(!isDownloadTarget(target))return;
    event.preventDefault();event.stopImmediatePropagation();
    exportDocx().catch(error=>{console.error('[Glueful Vector DOCX Export]',error);window.showError?.(error?.message||'Could not download the Word resume.')});
  },true);
  const addButton=()=>{
    const modal=$(EDITOR_MODAL_ID);if(!modal||modal.querySelector('[data-glueful-vector-docx]'))return;
    const controls=modal.querySelector('.job-resume-editor-actions,.job-resume-editor-toolbar,.job-resume-editor-header')||modal;
    const b=document.createElement('button');b.type='button';b.dataset.gluefulVectorDocx='1';b.textContent='Download DOCX';b.title='Download sharp, editable Microsoft Word resume';b.style.cssText='margin-left:8px;cursor:pointer';b.addEventListener('click',()=>exportDocx().catch(error=>{console.error('[Glueful Vector DOCX Export]',error);window.showError?.(error?.message||'Could not download the Word resume.')}));controls.appendChild(b);
  };
  const observer=new MutationObserver(addButton);observer.observe(document.documentElement,{childList:true,subtree:true});addButton();
  window.__GLUEFUL_RENDER_DEBUG__=Object.assign(window.__GLUEFUL_RENDER_DEBUG__||{},{docxExportVersion:VERSION});
  console.info('[Glueful Resume Studio] vector DOCX exporter loaded',VERSION);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
