/* GLUEFUL Resume Studio — Word Fidelity V4
 * Keep docx-preview authoritative. Only repair features docx-preview cannot reliably
 * reproduce from PDF->DOCX: legacy embedded logo, top artifact, and missing paragraph rules.
 */
(function(){
  'use strict';

  const EDITOR_ID='job-resume-editor-text';
  const PAGE_WIDTH=794;
  const PAGE_HEIGHT=1123;
  const DEFAULT_LOGO_SIZE=64;
  const JSZIP_URL='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  const STYLE_ID='glueful-resume-word-fidelity-v4';
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const editor=()=>document.getElementById(EDITOR_ID);

  async function loadZip(buffer){
    if(window.JSZip) return window.JSZip.loadAsync(buffer);
    let script=document.getElementById('glueful-word-fidelity-jszip');
    if(!script){
      script=document.createElement('script');
      script.id='glueful-word-fidelity-jszip';
      script.src=JSZIP_URL;
      document.head.appendChild(script);
    }
    await new Promise((resolve,reject)=>{
      if(window.JSZip) return resolve();
      script.addEventListener('load',resolve,{once:true});
      script.addEventListener('error',reject,{once:true});
    });
    return window.JSZip.loadAsync(buffer);
  }

  function installStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${EDITOR_ID}.glueful-docx-layout-mode{
        width:${PAGE_WIDTH}px!important;
        min-width:${PAGE_WIDTH}px!important;
        max-width:${PAGE_WIDTH}px!important;
        box-sizing:border-box!important;
        padding:0!important;
      }
      #${EDITOR_ID} .docx-wrapper{
        width:${PAGE_WIDTH}px!important;
        min-width:${PAGE_WIDTH}px!important;
        margin:0!important;
        padding:0!important;
        box-sizing:border-box!important;
      }
      #${EDITOR_ID} .glueful-word-fidelity-page{
        position:relative!important;
        width:${PAGE_WIDTH}px!important;
        min-width:${PAGE_WIDTH}px!important;
        max-width:${PAGE_WIDTH}px!important;
        min-height:${PAGE_HEIGHT}px!important;
        box-sizing:border-box!important;
      }
      #${EDITOR_ID} .glueful-word-logo{
        position:absolute!important;
        z-index:100!important;
        pointer-events:none!important;
        line-height:0!important;
        margin:0!important;
        padding:0!important;
      }
      #${EDITOR_ID} .glueful-word-logo img{
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:none!important;
        object-fit:contain!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
      }
      #${EDITOR_ID} .glueful-word-artifact{display:none!important;}
      #${EDITOR_ID} .glueful-word-rule-repair{box-sizing:border-box!important;}
    `;
    document.head.appendChild(style);
  }

  function relPath(part){
    const slash=part.lastIndexOf('/');
    return `${part.slice(0,slash)}/_rels/${part.slice(slash+1)}.rels`;
  }

  function resolveTarget(sourcePath,target){
    const clean=String(target||'').replace(/\\/g,'/');
    const base=sourcePath.slice(0,sourcePath.lastIndexOf('/')+1);
    const out=[];
    for(const p of (base+clean).split('/')){
      if(!p||p==='.') continue;
      if(p==='..') out.pop();
      else out.push(p);
    }
    return out.join('/');
  }

  function mime(name){
    const ext=String(name||'').split('.').pop().toLowerCase();
    return {
      png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',
      webp:'image/webp',bmp:'image/bmp',svg:'image/svg+xml',
      tif:'image/tiff',tiff:'image/tiff'
    }[ext]||'';
  }

  function attr(node,local,ns){
    return node?.getAttribute(`r:${local}`) ||
      (ns ? node?.getAttributeNS(ns,local) : '') || '';
  }

  function paragraphText(p){
    return norm(Array.from(p?.getElementsByTagName('t')||[])
      .map(t=>t.textContent||'').join(' '));
  }

  function nearestParagraph(node){
    let n=node;
    while(n){
      if(String(n.localName||n.nodeName).toLowerCase()==='p') return n;
      n=n.parentNode;
    }
    return null;
  }

  function emu(v,fallback){
    const n=Number(v);
    return Number.isFinite(n)&&n>0?n/9525:fallback;
  }

  function vmlPt(style,key,fallback){
    const m=String(style||'').match(
      new RegExp(`(?:^|;)\\s*${key}\\s*:\\s*([0-9.]+)pt`,'i')
    );
    return m?Number(m[1])*96/72:fallback;
  }

  function twipPx(v,fallback){
    const n=Number(v);
    return Number.isFinite(n)&&n>0?n/15:fallback;
  }

  function borderCss(node){
    if(!node) return null;
    const val=(node.getAttribute('val')||'').toLowerCase();
    if(!val||val==='nil'||val==='none') return null;
    const px=Math.max(.5,twipPx(node.getAttribute('sz')||'6',.8));
    const color=(node.getAttribute('color')||'000000').replace(/^auto$/i,'000000');
    return `${px}px solid #${color}`;
  }

  async function extractModel(buffer){
    const zip=await loadZip(buffer);
    const names=Object.keys(zip.files).filter(n=>!zip.files[n].dir);
    const parts=names.filter(n=>/^word\/(document|header\d+)\.xml$/i.test(n));
    const candidates=[];
    const rules=[];

    for(const part of parts){
      const xml=await zip.files[part].async('text');
      const doc=new DOMParser().parseFromString(xml,'application/xml');

      for(const p of Array.from(doc.getElementsByTagName('p'))){
        const text=paragraphText(p);
        if(text){
          const pBdr=p.getElementsByTagName('pBdr')[0];
          const bottom=pBdr?.getElementsByTagName('bottom')[0];
          const css=borderCss(bottom);
          if(css) rules.push({text,css,part});
        }
      }

      const relFile=zip.files[relPath(part)];
      if(!relFile) continue;
      const relDoc=new DOMParser().parseFromString(
        await relFile.async('text'),'application/xml'
      );
      const rels=new Map(
        Array.from(relDoc.getElementsByTagName('Relationship'))
          .map(r=>[r.getAttribute('Id'),r.getAttribute('Target')])
      );

      const drawings=[];
      for(const d of Array.from(doc.getElementsByTagName('wp:inline'))
        .concat(Array.from(doc.getElementsByTagName('wp:anchor')))){
        const blip=d.getElementsByTagName('a:blip')[0];
        const rid=attr(blip,'embed',
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships');
        if(!rid) continue;
        const ext=d.getElementsByTagName('wp:extent')[0];
        const p=nearestParagraph(d);
        drawings.push({
          rid,
          width:emu(ext?.getAttribute('cx'),DEFAULT_LOGO_SIZE),
          height:emu(ext?.getAttribute('cy'),DEFAULT_LOGO_SIZE),
          text:paragraphText(p),
          vml:false
        });
      }

      for(const shape of Array.from(doc.getElementsByTagName('v:shape'))){
        const im=shape.getElementsByTagName('v:imagedata')[0];
        const rid=attr(im,'id',
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships');
        if(!rid) continue;
        const p=nearestParagraph(shape);
        const s=shape.getAttribute('style')||'';
        drawings.push({
          rid,
          width:vmlPt(s,'width',DEFAULT_LOGO_SIZE),
          height:vmlPt(s,'height',DEFAULT_LOGO_SIZE),
          text:paragraphText(p),
          vml:true
        });
      }

      for(const d of drawings){
        const target=resolveTarget(part,rels.get(d.rid)||'');
        const file=zip.files[target];
        const type=mime(target);
        if(!file||!type) continue;

        const header=/^word\/header\d+\.xml$/i.test(part);
        const square=Math.abs(d.width-d.height)<=24;
        const plausible=d.width>=25&&d.width<=180&&d.height>=25&&d.height<=180;
        const textHit=/VINJAMURI|Hyderabad|MTech|Jalandhar|@gmail|\+91/i.test(d.text||'');
        let score=header?150:0;
        if(plausible) score+=60;
        if(square) score+=35;
        if(textHit) score+=100;
        if(d.width>220||d.height>220) score-=100;
        candidates.push({
          part,target,type,
          dataUrl:`data:${type};base64,${await file.async('base64')}`,
          score,vml:d.vml,width:d.width,height:d.height
        });
      }
    }

    candidates.sort((a,b)=>b.score-a.score);
    return {
      logo:candidates[0]||null,
      rules:Array.from(new Map(rules.map(r=>[r.text+'|'+r.css,r])).values())
    };
  }

  function renderedLeaves(section){
    return Array.from(section.querySelectorAll('p,li,div,span,td')).filter(n=>{
      const text=norm(n.textContent);
      return text&&!n.querySelector('p,li,td');
    });
  }

  function findRenderedParagraph(section,text){
    const wanted=norm(text);
    return renderedLeaves(section).find(n=>norm(n.textContent)===wanted)||null;
  }

  function repairWordRules(section,rules){
    for(const rule of rules){
      const node=findRenderedParagraph(section,rule.text);
      if(!node) continue;
      const cs=getComputedStyle(node);
      if(cs.borderBottomStyle!=='none') continue;
      node.classList.add('glueful-word-rule-repair');
      node.style.borderBottom=rule.css;
      node.style.paddingBottom=node.style.paddingBottom||'2px';
    }
  }

  function removeGrayArtifacts(editorEl){
    const pages=Array.from(editorEl.querySelectorAll('.docx-wrapper>section,.docx>section'));
    for(const page of pages){
      const pr=page.getBoundingClientRect();
      const nodes=Array.from(page.querySelectorAll('div,p,span,table,td'));
      for(const node of nodes){
        if(node.classList.contains('docx-wrapper')) continue;
        const r=node.getBoundingClientRect();
        const top=r.top-pr.top;
        const empty=!norm(node.textContent)&&!node.querySelector('img,svg,canvas');
        const wide=r.width>=pr.width*.65;
        const short=r.height>=6&&r.height<=70;
        if(empty&&wide&&short&&top>=-8&&top<=120){
          const cs=getComputedStyle(node);
          const painted=cs.backgroundColor!=='rgba(0, 0, 0, 0)' ||
            cs.backgroundImage!=='none' ||
            cs.borderTopStyle!=='none' ||
            cs.borderBottomStyle!=='none' ||
            cs.boxShadow!=='none';
          if(painted) node.classList.add('glueful-word-artifact');
        }
      }
    }
  }

  function logoPosition(page){
    const pageRect=page.getBoundingClientRect();
    const candidates=renderedLeaves(page)
      .filter(n=>/^(VINJAMURI\s+VINAY|Hyderabad,?\s+India|MTech\s*[–-])/i.test(norm(n.textContent)));
    const first=candidates[0];
    if(!first) return {
      left:Math.max(18,page.clientWidth*.075),
      top:Math.max(18,page.clientHeight*.025),
      size:DEFAULT_LOGO_SIZE
    };

    const r=first.getBoundingClientRect();
    const size=Math.min(DEFAULT_LOGO_SIZE,Math.max(48,r.height*3.6));
    return {
      left:Math.max(18,r.left-pageRect.left-size-14),
      top:Math.max(18,r.top-pageRect.top),
      size
    };
  }

  async function apply(){
    const ed=editor();
    if(!ed||!window.gluefulLastAdobeDocxBuffer||
       !ed.classList.contains('glueful-docx-layout-mode')) return;
    if(ed.dataset.gluefulWordFidelityBusy==='1') return;
    ed.dataset.gluefulWordFidelityBusy='1';

    try{
      installStyles();

      ed.querySelectorAll(
        '.glueful-header-v2-logo,.glueful-header-v3-logo,'+
        '.glueful-header-v2-text,.glueful-header-v3-text,'+
        '.glueful-word-logo'
      ).forEach(n=>n.remove());

      const model=await extractModel(window.gluefulLastAdobeDocxBuffer);
      const pages=Array.from(ed.querySelectorAll(
        '.docx-wrapper>section,.docx>section'
      ));

      pages.forEach((page,i)=>{
        page.classList.add('glueful-word-fidelity-page');
        if(i===0&&model.logo){
          const pos=logoPosition(page);
          const logo=document.createElement('div');
          logo.className='glueful-word-logo';
          logo.style.left=`${pos.left}px`;
          logo.style.top=`${pos.top}px`;
          logo.style.width=`${pos.size}px`;
          logo.style.height=`${pos.size}px`;
          const img=document.createElement('img');
          img.src=model.logo.dataUrl;
          img.alt='NIT Jalandhar logo';
          logo.appendChild(img);
          page.appendChild(logo);
        }
        repairWordRules(page,model.rules);
      });

      removeGrayArtifacts(ed);

      window.gluefulResumeHeaderV3Report={
        version:'4',
        logoFound:!!model.logo,
        logoPart:model.logo?.part||null,
        logoTarget:model.logo?.target||null,
        rulesFound:model.rules.length,
        pageWidth:PAGE_WIDTH,
        pageHeight:PAGE_HEIGHT,
        renderer:'docx-preview-authoritative'
      };
      console.info('[Glueful Resume Word Fidelity V4] applied',
        window.gluefulResumeHeaderV3Report);
    }catch(e){
      console.warn('[Glueful Resume Word Fidelity V4] skipped',e);
    }finally{
      ed.dataset.gluefulWordFidelityBusy='0';
    }
  }

  function boot(){
    const ed=editor();
    if(!ed) return;
    const run=()=>{
      if(ed.querySelector('.docx-wrapper>section,.docx>section')){
        clearTimeout(boot.timer);
        boot.timer=setTimeout(()=>void apply(),180);
      }
    };
    new MutationObserver(run).observe(ed,{childList:true,subtree:true});
    run();
  }

  window.gluefulResumeHeaderFidelityV3={apply};
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();