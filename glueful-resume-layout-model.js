/* =========================================================
   GLUEFUL RESUME STUDIO — FIXED-PAGE LAYOUT MODEL
   Safe Architecture E prototype.
   The PDF remains the visual source of truth; editable text is a
   positioned overlay with an explicit knockout/mask rectangle.
   ========================================================= */
(function(){
'use strict';
const VERSION=2;
const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
function createDocument(meta={}){return{model:'glueful-resume-layout-document',version:VERSION,metadata:{sourceType:meta.sourceType||'pdf',sourceName:meta.sourceName||'',importedAt:new Date().toISOString(),renderer:'fixed-page-pdf-v2'},pages:[],settings:{defaultFontFamily:'Times New Roman',defaultFontSizePx:14.67}}}
function createPage(p={}){return{id:uid('page'),number:p.number||1,widthPx:Number(p.widthPx||794),heightPx:Number(p.heightPx||1123),blocks:[],masks:[],backgrounds:[]}}
function createText(p={}){return{id:uid('text'),type:'text',x:Number(p.x||0),y:Number(p.y||0),width:Number(p.width||0),height:Number(p.height||0),maskX:Number(p.maskX??p.x??0),maskY:Number(p.maskY??p.y??0),maskWidth:Number(p.maskWidth??p.width??0),maskHeight:Number(p.maskHeight??p.height??0),text:String(p.text||''),html:String(p.html||''),fontFamily:p.fontFamily||'Times New Roman',fontSizePx:Number(p.fontSizePx||14.67),fontWeight:p.fontWeight||'400',fontStyle:p.fontStyle||'normal',textDecoration:p.textDecoration||'none',lineHeight:Number(p.lineHeight||1.12),textAlign:p.textAlign||'left',color:p.color||'#202124',whiteSpace:p.whiteSpace||'pre-wrap',padding:p.padding||'0',margin:p.margin||'0',border:p.border||'',indent:Number(p.indent||0),editable:p.editable!==false,paragraphKey:p.paragraphKey||null,sourceItems:Array.isArray(p.sourceItems)?p.sourceItems.map(x=>({...x})):[]}}
function createImage(p={}){return{id:uid('image'),type:'image',x:Number(p.x||0),y:Number(p.y||0),width:Number(p.width||0),height:Number(p.height||0),src:String(p.src||''),alt:String(p.alt||''),position:p.position||'absolute',zIndex:Number(p.zIndex||1)}}
function createBox(p={}){return{id:uid('box'),type:p.type||'box',x:Number(p.x||0),y:Number(p.y||0),width:Number(p.width||0),height:Number(p.height||0),border:p.border||'',background:p.background||'transparent',zIndex:Number(p.zIndex||0)}}
function createMask(p={}){return{id:uid('mask'),type:'mask',x:Number(p.x||0),y:Number(p.y||0),width:Number(p.width||0),height:Number(p.height||0),color:p.color||'#fff',zIndex:Number(p.zIndex||2),sourceBlockId:p.sourceBlockId||null}}
function clone(v){return JSON.parse(JSON.stringify(v))}
function validate(d){const errors=[];if(d?.model!=='glueful-resume-layout-document')errors.push('invalid model');if(!Array.isArray(d?.pages)||!d.pages.length)errors.push('no pages');(d.pages||[]).forEach((p,i)=>{if(!(p.widthPx>0&&p.heightPx>0))errors.push(`page ${i+1} invalid geometry`);for(const b of [...(p.blocks||[]),...(p.masks||[])]){if(!Number.isFinite(b.x)||!Number.isFinite(b.y)||!Number.isFinite(b.width)||!Number.isFinite(b.height))errors.push(`page ${i+1} invalid block geometry`);}});return{valid:!errors.length,errors}}
window.gluefulResumeLayoutModel={VERSION,createDocument,createPage,createText,createImage,createBox,createMask,clone,validate};
})();