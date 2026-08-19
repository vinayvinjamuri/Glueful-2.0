/* GLUEFUL Resume Studio — Header Fidelity V3
 * Word-master geometry calibration + deterministic embedded-logo recovery.
 */
(function(){
  'use strict';
  const EDITOR_ID='job-resume-editor-text';
  const PAGE_WIDTH=794;
  const PAGE_HEIGHT=1123;
  const BODY_MARGIN=64;
  const PAGE_TOP=44;
  const LOGO_SIZE=82;
  const HEADER_TEXT_LEFT=BODY_MARGIN+LOGO_SIZE+14;
  const JSZIP_URL='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  const STYLE_ID='glueful-resume-header-fidelity-v3-style';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const editor=()=>document.getElementById(EDITOR_ID);

  async function loadZip(buffer){
    if(window.JSZip) return window.JSZip.loadAsync(buffer);
    let script=document.getElementById('glueful-header-v3-jszip');
    if(!script){script=document.createElement('script');script.id='glueful-header-v3-jszip';script.src=JSZIP_URL;document.head.appendChild(script);}
    await new Promise((resolve,reject)=>{if(window.JSZip)return resolve();script.addEventListener('load',resolve,{once:true});script.addEventListener('error',reject,{once:true});});
    return window.JSZip.loadAsync(buffer);
  }

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;
    style.textContent=`
      #${EDITOR_ID}.glueful-docx-layout-mode{width:${PAGE_WIDTH}px!important;min-width:${PAGE_WIDTH}px!important;max-width:${PAGE_WIDTH}px!important;box-sizing:border-box!important;padding:0!important;}
      #${EDITOR_ID} .docx-wrapper{width:${PAGE_WIDTH}px!important;margin:0!important;padding:0!important;box-sizing:border-box!important;}
      #${EDITOR_ID} .glueful-header-v3-page{position:relative!important;width:${PAGE_WIDTH}px!important;min-width:${PAGE_WIDTH}px!important;max-width:${PAGE_WIDTH}px!important;min-height:${PAGE_HEIGHT}px!important;box-sizing:border-box!important;padding:${PAGE_TOP}px ${BODY_MARGIN}px 48px!important;margin:0 0 24px!important;}
      #${EDITOR_ID} .glueful-header-v3-logo{position:absolute!important;left:${BODY_MARGIN}px!important;top:${PAGE_TOP}px!important;width:${LOGO_SIZE}px!important;height:${LOGO_SIZE}px!important;z-index:100!important;pointer-events:none!important;line-height:0!important;margin:0!important;padding:0!important;}
      #${EDITOR_ID} .glueful-header-v3-logo img{display:block!important;width:${LOGO_SIZE}px!important;height:${LOGO_SIZE}px!important;max-width:none!important;object-fit:contain!important;margin:0!important;padding:0!important;border:0!important;}
      #${EDITOR_ID} .glueful-header-v3-text{display:block!important;margin-left:${HEADER_TEXT_LEFT}px!important;width:calc(100% - ${HEADER_TEXT_LEFT}px)!important;box-sizing:border-box!important;}
      #${EDITOR_ID} .glueful-header-v3-text p{margin:0!important;padding:0!important;line-height:1.18!important;}
      #${EDITOR_ID} .glueful-header-v3-summary{margin-top:54px!important;}
      #${EDITOR_ID} .glueful-header-v3-artifact{display:none!important;}
    `;
    document.head.appendChild(style);
  }

  function relPath(part){const slash=part.lastIndexOf('/');return `${part.slice(0,slash)}/_rels/${part.slice(slash+1)}.rels`;}
  function resolveTarget(sourcePath,target){const clean=String(target||'').replace(/\\/g,'/');const base=sourcePath.slice(0,sourcePath.lastIndexOf('/')+1);const out=[];for(const p of (base+clean).split('/')){if(!p||p==='.')continue;if(p==='..')out.pop();else out.push(p);}return out.join('/');}
  function mime(name){const ext=String(name||'').split('.').pop().toLowerCase();return({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',bmp:'image/bmp',svg:'image/svg+xml',tif:'image/tiff',tiff:'image/tiff'})[ext]||'';}
  function attr(node,local,ns){return node?.getAttribute(`r:${local}`)||(ns?node?.getAttributeNS(ns,local):'')||'';}
  function paragraphText(p){return norm(Array.from(p?.getElementsByTagName('t')||[]).map(t=>t.textContent||'').join(' '));}
  function nearestParagraph(node){let n=node;while(n){if(String(n.localName||n.nodeName).toLowerCase()==='p')return n;n=n.parentNode;}return null;}
  function emu(v,fallback){const n=Number(v);return Number.isFinite(n)&&n>0?n/9525:fallback;}
  function vmlPt(style,key,fallback){const m=String(style||'').match(new RegExp(`(?:^|;)\\s*${key}\\s*:\\s*([0-9.]+)pt`,'i'));return m?Number(m[1])*96/72:fallback;}

  async function extractModel(buffer){
    const zip=await loadZip(buffer);const names=Object.keys(zip.files).filter(n=>!zip.files[n].dir);const parts=names.filter(n=>/^word\/(document|header\d+)\.xml$/i.test(n));
    const candidates=[];const headerTexts=[];
    for(const part of parts){
      const xml=await zip.files[part].async('text');const doc=new DOMParser().parseFromString(xml,'application/xml');
      headerTexts.push(...Array.from(doc.getElementsByTagName('p')).map(paragraphText).filter(Boolean));
      const relFile=zip.files[relPath(part)];if(!relFile)continue;
      const relDoc=new DOMParser().parseFromString(await relFile.async('text'),'application/xml');
      const rels=new Map(Array.from(relDoc.getElementsByTagName('Relationship')).map(r=>[r.getAttribute('Id'),r.getAttribute('Target')]));
      const drawings=[];
      for(const d of Array.from(doc.getElementsByTagName('wp:inline')).concat(Array.from(doc.getElementsByTagName('wp:anchor')))){
        const blip=d.getElementsByTagName('a:blip')[0];const rid=attr(blip,'embed','http://schemas.openxmlformats.org/officeDocument/2006/relationships');if(!rid)continue;const ext=d.getElementsByTagName('wp:extent')[0];const p=nearestParagraph(d);drawings.push({rid,width:emu(ext?.getAttribute('cx'),LOGO_SIZE),height:emu(ext?.getAttribute('cy'),LOGO_SIZE),text:paragraphText(p),vml:false});
      }
      for(const shape of Array.from(doc.getElementsByTagName('v:shape'))){const im=shape.getElementsByTagName('v:imagedata')[0];const rid=attr(im,'id','http://schemas.openxmlformats.org/officeDocument/2006/relationships');if(!rid)continue;const p=nearestParagraph(shape),s=shape.getAttribute('style')||'';drawings.push({rid,width:vmlPt(s,'width',LOGO_SIZE),height:vmlPt(s,'height',LOGO_SIZE),text:paragraphText(p),vml:true});}
      for(const d of drawings){
        const target=resolveTarget(part,rels.get(d.rid)||'');const file=zip.files[target];const type=mime(target);if(!file||!type)continue;
        const header=/^word\/header\d+\.xml$/i.test(part);const square=Math.abs(d.width-d.height)<=24;const plausible=d.width>=35&&d.width<=180&&d.height>=35&&d.height<=180;const textHit=/VINJAMURI|Hyderabad|MTech|Jalandhar|@gmail|\+91/i.test(d.text||'');let score=header?150:0;if(plausible)score+=60;if(square)score+=35;if(textHit)score+=100;if(d.width>220||d.height>220)score-=100;
        candidates.push({part,target,type,dataUrl:`data:${type};base64,${await file.async('base64')}`,score,vml:d.vml,width:d.width,height:d.height});
      }
    }
    candidates.sort((a,b)=>b.score-a.score);const logo=candidates[0]||null;
    return {logo,headerTexts:Array.from(new Set(headerTexts))};
  }

  function leaves(root){return Array.from(root.querySelectorAll('p,li,div,span,td')).filter(n=>{const t=norm(n.textContent);return t&&!n.querySelector('p,li,td');});}
  function findText(section,re){return leaves(section).find(n=>re.test(norm(n.textContent)))||null;}

  function removeGrayArtifact(section){
    const page=section.getBoundingClientRect();
    Array.from(section.querySelectorAll('div,p,span,table')).forEach(node=>{const r=node.getBoundingClientRect();const top=r.top-page.top;const empty=!norm(node.textContent)&&!node.querySelector('img,svg,canvas');const wide=r.width>PAGE_WIDTH*.7;const short=r.height>=8&&r.height<=110;const cs=getComputedStyle(node);const painted=cs.backgroundColor!=='rgba(0, 0, 0, 0)'||cs.backgroundImage!=='none'||cs.borderTopStyle!=='none'||cs.borderBottomStyle!=='none'||cs.boxShadow!=='none';if(empty&&wide&&short&&top<130&&top>-5)node.classList.add('glueful-header-v3-artifact');});
  }

  function cleanHeaderWhitespace(section,summary,headerNodes){
    if(!summary||!headerNodes.length)return;
    let node=headerNodes[headerNodes.length-1].parentElement?.nextElementSibling;let guard=0;
    while(node&&node!==summary&&guard++<30){const next=node.nextElementSibling;if(!norm(node.textContent)&&!node.querySelector('img,table'))node.remove();node=next;}
  }

  function applyText(section){
    const nodes=[findText(section,/^VINJAMURI\s+VINAY$/i),findText(section,/^Hyderabad,?\s+India$/i),findText(section,/^MTech\s*[–-]/i),findText(section,/^\+91|@gmail/i)].filter(Boolean);
    const summary=findText(section,/^PROFESSIONAL\s+SUMMARY$/i);
    const uniq=[];nodes.forEach(n=>{if(!uniq.includes(n))uniq.push(n);});
    if(uniq.length){const parent=uniq[0].parentElement;const wrapper=document.createElement('div');wrapper.className='glueful-header-v3-text';wrapper.contentEditable='true';parent.insertBefore(wrapper,uniq[0]);uniq.forEach(n=>wrapper.appendChild(n));}
    if(summary)summary.classList.add('glueful-header-v3-summary');
    cleanHeaderWhitespace(section,summary,uniq);
    return {nodes:uniq,summary};
  }

  async function apply(){
    const ed=editor();if(!ed||!window.gluefulLastAdobeDocxBuffer||!ed.classList.contains('glueful-docx-layout-mode'))return;if(ed.dataset.gluefulHeaderV3Busy==='1')return;ed.dataset.gluefulHeaderV3Busy='1';
    try{installStyles();ed.querySelectorAll('.glueful-header-v2-logo,.glueful-header-v3-logo,.glueful-header-v2-text,.glueful-header-v3-text').forEach(n=>n.remove());const model=await extractModel(window.gluefulLastAdobeDocxBuffer);const pages=Array.from(ed.querySelectorAll('.docx-wrapper>section,.docx>section'));pages.forEach((section,i)=>{section.classList.add('glueful-header-v3-page');removeGrayArtifact(section);const header=applyText(section);if(i===0&&model.logo&&header.nodes.length){const logo=document.createElement('div');logo.className='glueful-header-v3-logo';const img=document.createElement('img');img.src=model.logo.dataUrl;img.alt='NIT Jalandhar logo';logo.appendChild(img);section.appendChild(logo);}});window.gluefulResumeHeaderV3Report={logoFound:!!model.logo,logoPart:model.logo?.part||null,logoTarget:model.logo?.target||null,pageWidth:PAGE_WIDTH,pageHeight:PAGE_HEIGHT,margin:BODY_MARGIN,headerTextLeft:HEADER_TEXT_LEFT};console.info('[Glueful Resume Header V3] applied',window.gluefulResumeHeaderV3Report);}catch(e){console.warn('[Glueful Resume Header V3] skipped',e);}finally{ed.dataset.gluefulHeaderV3Busy='0';}
  }

  function boot(){const ed=editor();if(!ed)return;const run=()=>{if(ed.querySelector('.docx-wrapper>section,.docx>section')){clearTimeout(boot.timer);boot.timer=setTimeout(()=>void apply(),120);}};new MutationObserver(run).observe(ed,{childList:true,subtree:true});run();}
  window.gluefulResumeHeaderFidelityV3={apply};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
