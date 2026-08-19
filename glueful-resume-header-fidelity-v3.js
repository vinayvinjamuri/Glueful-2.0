/* GLUEFUL Resume Studio — Header Fidelity V3
 * Word-master geometry and embedded logo restoration.
 */
(function () {
  'use strict';
  const EDITOR_ID = 'job-resume-editor-text';
  const JSZIP_URL = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  const STYLE_ID = 'glueful-resume-header-fidelity-v3-style';
  const PAGE_WIDTH = 794;
  const PAGE_HEIGHT = 1123;
  const BODY_MARGIN = 24;
  const LOGO_SIZE = 82;
  const HEADER_TEXT_LEFT = BODY_MARGIN + LOGO_SIZE + 14;
  const norm = (v) => String(v || '').replace(/\s+/g, ' ').trim();
  const editor = () => document.getElementById(EDITOR_ID);

  async function loadZip(buffer) {
    if (window.JSZip) return window.JSZip.loadAsync(buffer);
    const id = 'glueful-header-v3-jszip';
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement('script'); script.id = id; script.src = JSZIP_URL;
      document.head.appendChild(script);
    }
    await new Promise((resolve, reject) => {
      if (window.JSZip) return resolve();
      script.addEventListener('load', resolve, { once:true });
      script.addEventListener('error', reject, { once:true });
    });
    return window.JSZip.loadAsync(buffer);
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style'); style.id = STYLE_ID;
    style.textContent = `
      #${EDITOR_ID} .glueful-header-v3-page { position:relative!important; width:${PAGE_WIDTH}px!important; min-width:${PAGE_WIDTH}px!important; max-width:${PAGE_WIDTH}px!important; min-height:${PAGE_HEIGHT}px!important; box-sizing:border-box!important; padding-left:${BODY_MARGIN}px!important; padding-right:${BODY_MARGIN}px!important; padding-top:${BODY_MARGIN}px!important; }
      #${EDITOR_ID} .glueful-header-v3-logo { position:absolute!important; z-index:100!important; pointer-events:none!important; width:${LOGO_SIZE}px!important; height:${LOGO_SIZE}px!important; margin:0!important; padding:0!important; line-height:0!important; }
      #${EDITOR_ID} .glueful-header-v3-logo img { display:block!important; width:100%!important; height:100%!important; max-width:none!important; object-fit:contain!important; margin:0!important; padding:0!important; border:0!important; }
      #${EDITOR_ID} .glueful-header-v3-text { margin-left:${HEADER_TEXT_LEFT}px!important; width:calc(100% - ${HEADER_TEXT_LEFT}px)!important; box-sizing:border-box!important; }
      #${EDITOR_ID} .glueful-header-v3-text p { margin-top:0!important; margin-bottom:2px!important; padding-top:0!important; padding-bottom:0!important; }
    `;
    document.head.appendChild(style);
  }

  function relPath(part) {
    const file = part.slice(part.lastIndexOf('/') + 1);
    const dir = part.slice(0, part.lastIndexOf('/'));
    return `${dir}/_rels/${file}.rels`;
  }
  function resolveTarget(sourcePath, target) {
    const clean = String(target || '').replace(/\\/g, '/');
    const base = sourcePath.slice(0, sourcePath.lastIndexOf('/') + 1);
    const out = [];
    for (const part of (base + clean).split('/')) { if (!part || part === '.') continue; if (part === '..') out.pop(); else out.push(part); }
    return out.join('/');
  }
  function mime(name) {
    const ext = String(name).split('.').pop().toLowerCase();
    return ({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',bmp:'image/bmp',svg:'image/svg+xml',tif:'image/tiff',tiff:'image/tiff'})[ext] || '';
  }
  function attr(node, local, ns) { return node?.getAttribute(`r:${local}`) || (ns ? node?.getAttributeNS(ns, local) : '') || ''; }
  function paragraphText(p) { return norm(Array.from(p?.getElementsByTagName('t') || []).map(t => t.textContent || '').join(' ')); }
  function nearestParagraph(node) { let n=node; while(n){ if(String(n.localName||n.nodeName).toLowerCase()==='p') return n; n=n.parentNode; } return null; }
  function emu(v, fallback) { const n=Number(v); return Number.isFinite(n)&&n>0?n/9525:fallback; }
  function vmlPt(style,key,fallback) { const m=String(style||'').match(new RegExp(`(?:^|;)\\s*${key}\\s*:\\s*([0-9.]+)pt`,'i')); return m?Number(m[1])*96/72:fallback; }

  async function extractModel(buffer) {
    const zip=await loadZip(buffer);
    const names=Object.keys(zip.files).filter(n=>!zip.files[n].dir);
    const parts=names.filter(n=>/^word\/(document|header\d+)\.xml$/i.test(n));
    const imageCandidates=[]; const paragraphs=[];
    for(const part of parts){
      const xml=await zip.files[part].async('text');
      const doc=new DOMParser().parseFromString(xml,'application/xml');
      const ps=Array.from(doc.getElementsByTagName('p'));
      paragraphs.push(...ps.map(paragraphText).filter(Boolean));
      const drawings=[];
      for(const d of Array.from(doc.getElementsByTagName('wp:inline')).concat(Array.from(doc.getElementsByTagName('wp:anchor')))){
        const blip=d.getElementsByTagName('a:blip')[0]; const rid=attr(blip,'embed','http://schemas.openxmlformats.org/officeDocument/2006/relationships'); if(!rid) continue;
        const e=d.getElementsByTagName('wp:extent')[0]; const p=nearestParagraph(d);
        drawings.push({rid,width:emu(e?.getAttribute('cx'),LOGO_SIZE),height:emu(e?.getAttribute('cy'),LOGO_SIZE),text:paragraphText(p),vml:false});
      }
      for(const shape of Array.from(doc.getElementsByTagName('v:shape'))){
        const im=shape.getElementsByTagName('v:imagedata')[0]; const rid=attr(im,'id','http://schemas.openxmlformats.org/officeDocument/2006/relationships'); if(!rid) continue;
        const p=nearestParagraph(shape), s=shape.getAttribute('style')||'';
        drawings.push({rid,width:vmlPt(s,'width',LOGO_SIZE),height:vmlPt(s,'height',LOGO_SIZE),text:paragraphText(p),vml:true});
      }
      const relFile=zip.files[relPath(part)]; if(!relFile) continue;
      const relDoc=new DOMParser().parseFromString(await relFile.async('text'),'application/xml');
      const rels=new Map(Array.from(relDoc.getElementsByTagName('Relationship')).map(r=>[r.getAttribute('Id'),r.getAttribute('Target')]));
      for(const d of drawings){
        const target=resolveTarget(part,rels.get(d.rid)||''); const file=zip.files[target]; const type=mime(target); if(!file||!type) continue;
        const header=/^word\/header\d+\.xml$/i.test(part); const square=Math.abs(d.width-d.height)<=24; const plausible=d.width>=35&&d.width<=180&&d.height>=35&&d.height<=180; const textHit=/VINJAMURI|Hyderabad|MTech|Jalandhar|@gmail|\+91/i.test(d.text||'');
        let score=header?150:0; if(plausible)score+=60; if(square)score+=35; if(textHit)score+=100; if(d.width>220||d.height>220)score-=100;
        imageCandidates.push({part,target,type,dataUrl:`data:${type};base64,${await file.async('base64')}`,score,vml:d.vml,width:d.width,height:d.height});
      }
    }
    const logo=imageCandidates.sort((a,b)=>b.score-a.score)[0]||null;
    const headerTexts=Array.from(new Set(paragraphs.filter(t=>/VINJAMURI\s+VINAY|Hyderabad\s*,?\s*India|MTech\s*[–-]\s*National Institute of Technology|\+91[-\s]|@gmail/i.test(t))));
    console.info('[Glueful Resume Header V3] model', {logoPart:logo?.part, target:logo?.target, vml:!!logo?.vml, score:logo?.score, headerTexts});
    return {logo,headerTexts};
  }

  function leaves(root){ return Array.from(root.querySelectorAll('p,li,div,span,td')).filter(n=>{const t=norm(n.textContent);return t&&!n.querySelector('p,li,td');}); }
  function findText(section,text){ const target=norm(text); return leaves(section).find(n=>norm(n.textContent)===target)||null; }
  function headerNodes(section,texts){
    const wanted=[texts.find(t=>/VINJAMURI\s+VINAY/i.test(t)),texts.find(t=>/Hyderabad/i.test(t)),texts.find(t=>/MTech/i.test(t)),texts.find(t=>/\+91|@gmail/i.test(t))].filter(Boolean); const out=[];
    wanted.forEach(t=>{const n=findText(section,t);if(n&&!out.includes(n))out.push(n);}); return out;
  }
  function removeOld(ed){ ed.querySelectorAll('.glueful-header-v2-logo,.glueful-header-v2-text,.glueful-header-v3-logo,.glueful-header-v3-text').forEach(n=>n.remove()); }

  function applySection(section,model,first){
    section.classList.add('glueful-header-v3-page');
    if(!first||!model.logo)return;
    const nodes=headerNodes(section,model.headerTexts); const pageRect=section.getBoundingClientRect();
    const top=nodes[0]?Math.max(BODY_MARGIN,nodes[0].getBoundingClientRect().top-pageRect.top-4):BODY_MARGIN;
    if(nodes.length){
      const parent=nodes[0].parentElement;
      if(parent){ const wrapper=document.createElement('div'); wrapper.className='glueful-header-v3-text'; wrapper.contentEditable='true'; parent.insertBefore(wrapper,nodes[0]); nodes.forEach(n=>wrapper.appendChild(n)); }
    }
    const logo=document.createElement('div'); logo.className='glueful-header-v3-logo'; logo.style.left=`${BODY_MARGIN}px`; logo.style.top=`${Math.round(top)}px`;
    const img=document.createElement('img'); img.src=model.logo.dataUrl; img.alt='NIT Jalandhar logo'; logo.appendChild(img); section.appendChild(logo);
    console.info('[Glueful Resume Header V3] applied',{headerNodes:nodes.length,logoTop:top,logoPart:model.logo.part,target:model.logo.target,vml:model.logo.vml});
  }

  async function apply(){
    const ed=editor(); if(!ed||!window.gluefulLastAdobeDocxBuffer||!ed.classList.contains('glueful-docx-layout-mode'))return;
    if(ed.dataset.gluefulHeaderV3Busy==='1')return; ed.dataset.gluefulHeaderV3Busy='1';
    try{installStyles();removeOld(ed);const model=await extractModel(window.gluefulLastAdobeDocxBuffer);const pages=Array.from(ed.querySelectorAll('.docx-wrapper > section,.docx > section'));pages.forEach((p,i)=>applySection(p,model,i===0));ed.dataset.gluefulHeaderV3Applied=model.logo?'1':'0';}
    catch(e){console.warn('[Glueful Resume Header V3] skipped',e);} finally{ed.dataset.gluefulHeaderV3Busy='0';}
  }
  function boot(){ const ed=editor(); if(!ed)return; const run=()=>{if(ed.querySelector('.docx-wrapper > section,.docx > section')){clearTimeout(boot.timer);boot.timer=setTimeout(()=>void apply(),120);}}; new MutationObserver(run).observe(ed,{childList:true,subtree:true}); run(); }
  window.gluefulResumeHeaderFidelityV3={apply};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();