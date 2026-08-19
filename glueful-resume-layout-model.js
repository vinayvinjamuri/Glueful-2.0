/* =========================================================
   GLUEFUL RESUME STUDIO — LAYOUT CANONICAL MODEL
   Safe Architecture E prototype.
   Source of truth: imported fixed geometry, not editable HTML flow.
   ========================================================= */
(function(){
'use strict';
const VERSION=1;
const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
function createDocument(meta={}){return{model:'glueful-resume-layout-document',version:VERSION,metadata:{sourceType:meta.sourceType||'docx',sourceName:meta.sourceName||'',importedAt:new Date().toISOString()},pages:[]}}
function createPage(p={}){return{id:uid('page'),number:p.number||1,widthPx:Number(p.widthPx||794),heightPx:Number(p.heightPx||1123),blocks:[],backgrounds:[]}}
function createText(p={}){return{id:uid('text'),type:'text',x:Number(p.x||0),y:Number(p.y||0),width:Number(p.width||0),height:Number(p.height||0),text:String(p.text||''),html:String(p.html||''),fontFamily:p.fontFamily||'Times New Roman',fontSizePx:Number(p.fontSizePx||14.67),fontWeight:p.fontWeight||'400',fontStyle:p.fontStyle||'normal',textDecoration:p.textDecoration||'none',lineHeight:p.lineHeight||'normal',textAlign:p.textAlign||'left',color:p.color||'#202124',whiteSpace:p.whiteSpace||'pre-wrap',padding:p.padding||'0',margin:p.margin||'0',border:p.border||'',indent:Number(p.indent||0),editable:p.editable!==false}}
function createImage(p={}){return{id:uid('image'),type:'image',x:Number(p.x||0),y:Number(p.y||0),width:Number(p.width||0),height:Number(p.height||0),src:String(p.src||''),alt:String(p.alt||''),position:p.position||'absolute',zIndex:Number(p.zIndex||1)}}
function createBox(p={}){return{id:uid('box'),type:p.type||'box',x:Number(p.x||0),y:Number(p.y||0),width:Number(p.width||0),height:Number(p.height||0),border:p.border||'',background:p.background||'transparent',zIndex:Number(p.zIndex||0)}}
function clone(v){return JSON.parse(JSON.stringify(v))}
function validate(d){const errors=[];if(d?.model!=='glueful-resume-layout-document')errors.push('invalid model');if(!Array.isArray(d?.pages)||!d.pages.length)errors.push('no pages');(d.pages||[]).forEach((p,i)=>{if(!(p.widthPx>0&&p.heightPx>0))errors.push(`page ${i+1} invalid geometry`);(p.blocks||[]).forEach(b=>{if(!Number.isFinite(b.x)||!Number.isFinite(b.y)||!Number.isFinite(b.width)||!Number.isFinite(b.height))errors.push(`page ${i+1} invalid block geometry`)})});return{valid:!errors.length,errors}}
window.gluefulResumeLayoutModel={VERSION,createDocument,createPage,createText,createImage,createBox,clone,validate};
})();
