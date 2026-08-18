/* =========================================================
   GLUEFUL V41 — WORD-STYLE RESUME STUDIO OVERRIDES
   Loaded after index.html by the service worker.
   ========================================================= */
(function(){
  'use strict';

  const $ = (id)=>document.getElementById(id);
  const editor = ()=>$('job-resume-editor-text');
  const modal = ()=>$('job-resume-editor-modal');

  function escapeHtml(value){
    return String(value??'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function command(cmd,value=null){
    const el=editor(); if(!el) return;
    el.focus();
    try{
      document.execCommand(cmd,false,value);
      el.dispatchEvent(new Event('input',{bubbles:true}));
      if(typeof window.updateJobResumeEditorAts==='function') window.updateJobResumeEditorAts();
    }catch(error){console.warn('[Glueful Resume Studio V41] command failed',cmd,error);}
  }

  function pointSize(size){
    const el=editor(); if(!el||!size) return;
    el.focus();
    try{
      document.execCommand('fontSize',false,'7');
      const nodes=el.querySelectorAll('font[size="7"]');
      nodes.forEach(node=>{node.removeAttribute('size');node.style.fontSize=`${Number(size)}pt`;});
      el.dispatchEvent(new Event('input',{bubbles:true}));
    }catch(error){console.warn('[Glueful Resume Studio V41] size failed',error);}
  }

  function formatBlock(tag){ if(tag&&typeof window.resumeEditorFormatBlock==='function') window.resumeEditorFormatBlock(tag); }

  function insertLink(){
    const el=editor(); if(!el) return;
    el.focus();
    const url=window.prompt('Enter the URL:'); if(!url) return;
    try{
      const parsed=new URL(url,window.location.href);
      if(!/^https?:$/.test(parsed.protocol)) throw new Error('Invalid protocol');
      document.execCommand('createLink',false,parsed.href);
    }catch(e){ if(typeof window.showError==='function') window.showError('Please enter a valid http(s) URL.'); }
  }

  function toolbarHtml(){
    return `
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('undo')" title="Undo">↶</button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('redo')" title="Redo">↷</button>
      <span class="job-resume-tool-divider"></span>
      <select class="job-resume-tool-select" data-v41="1" onchange="window.gluefulV41Command('fontName',this.value);this.value=''" aria-label="Font family">
        <option value="">Font</option><option value="Times New Roman">Times New Roman</option><option value="Arial">Arial</option><option value="Calibri">Calibri</option><option value="Georgia">Georgia</option><option value="Courier New">Courier New</option>
      </select>
      <select class="job-resume-tool-select" data-v41="1" onchange="window.gluefulV41PointSize(this.value);this.value=''" aria-label="Font size">
        <option value="">Size</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="14">14</option><option value="16">16</option><option value="18">18</option><option value="20">20</option><option value="24">24</option>
      </select>
      <span class="job-resume-tool-divider"></span>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('bold')" title="Bold"><strong>B</strong></button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('italic')" title="Italic"><em>I</em></button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('underline')" title="Underline"><u>U</u></button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('strikeThrough')" title="Strikethrough">S̶</button>
      <input class="glueful-editor-color" type="color" data-v41="1" value="#202124" title="Text color" aria-label="Text color" oninput="window.gluefulV41Command('foreColor',this.value)">
      <button class="job-resume-tool glueful-editor-highlight" type="button" data-v41="1" onclick="window.gluefulV41Command('hiliteColor','#FFF2A8')" title="Highlight">▰</button>
      <span class="job-resume-tool-divider"></span>
      <select class="job-resume-tool-select" data-v41="1" onchange="window.gluefulV41FormatBlock(this.value);this.value=''" aria-label="Paragraph style">
        <option value="">Style</option><option value="P">Normal</option><option value="H1">Title</option><option value="H2">Heading 1</option><option value="H3">Heading 2</option><option value="BLOCKQUOTE">Quote</option>
      </select>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('justifyLeft')" title="Align left">≡←</button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('justifyCenter')" title="Center">≡</button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('justifyRight')" title="Align right">→≡</button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('justifyFull')" title="Justify">≡≡</button>
      <span class="job-resume-tool-divider"></span>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('insertUnorderedList')" title="Bulleted list">•</button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('insertOrderedList')" title="Numbered list">1.</button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('outdent')" title="Decrease indent">↤</button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('indent')" title="Increase indent">↦</button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('subscript')" title="Subscript">x₂</button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('superscript')" title="Superscript">x²</button>
      <span class="job-resume-tool-divider"></span>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41InsertLink()" title="Insert link">Link</button>
      <button class="job-resume-tool" type="button" data-v41="1" onclick="window.gluefulV41Command('removeFormat')" title="Clear formatting">Clear</button>`;
  }

  function installToolbar(){
    const t=modal()?.querySelector('.job-resume-toolbar');
    if(!t||t.dataset.v41Installed==='1') return;
    t.dataset.v41Installed='1'; t.innerHTML=toolbarHtml();
  }

  function installViewControls(){
    const actions=modal()?.querySelector('.job-resume-editor-actions');
    if(!actions||actions.querySelector('.glueful-editor-view-controls')) return;
    const controls=document.createElement('div');
    controls.className='glueful-editor-view-controls';
    controls.setAttribute('aria-label','Document view controls');
    controls.innerHTML=`
      <span class="glueful-view-label">View</span>
      <button class="glueful-view-btn" type="button" onclick="window.gluefulV41Zoom(-10)" title="Zoom out">−</button>
      <span id="glueful-zoom-value" class="glueful-zoom-value">100%</span>
      <button class="glueful-view-btn" type="button" onclick="window.gluefulV41Zoom(10)" title="Zoom in">+</button>
      <button class="glueful-view-btn" type="button" onclick="window.gluefulV41FitWidth()" title="Fit width">Fit width</button>
      <button class="glueful-view-btn" type="button" onclick="window.gluefulV41FitPage()" title="Fit page">Fit page</button>`;
    const download=actions.querySelector('.job-resume-download-wrap');
    if(download) actions.insertBefore(controls,download); else actions.appendChild(controls);
  }

  function polishHeader(){
    const m=modal(); if(!m) return;
    const title=m.querySelector('.modal-title');
    const subtitle=m.querySelector('.modal-subtitle');
    if(title) title.textContent='Resume Studio';
    if(subtitle) subtitle.textContent='Temporary tailored copy · your master resume is protected';
  }

  function enhance(){ installToolbar();installViewControls();polishHeader(); }

  window.gluefulV41Command=command;
  window.gluefulV41PointSize=pointSize;
  window.gluefulV41FormatBlock=formatBlock;
  window.gluefulV41InsertLink=insertLink;

  function setZoom(value){
    const el=editor(); if(!el) return;
    const next=Math.max(70,Math.min(160,Math.round(value)));
    el.dataset.v41Zoom=String(next); el.style.zoom=(next/100).toFixed(2);
    const label=$('glueful-zoom-value'); if(label) label.textContent=`${next}%`;
  }
  window.gluefulV41Zoom=(delta)=>{const el=editor();setZoom((Number(el?.dataset.v41Zoom)||100)+Number(delta||0));};
  window.gluefulV41FitWidth=()=>{
    const el=editor(),scroll=modal()?.querySelector('.job-resume-editor-scroll'); if(!el||!scroll)return;
    setZoom(Math.max(70,Math.min(160,Math.floor(((scroll.clientWidth-32)/794)*100))));
  };
  window.gluefulV41FitPage=()=>{
    const el=editor(),scroll=modal()?.querySelector('.job-resume-editor-scroll'); if(!el||!scroll)return;
    setZoom(Math.max(70,Math.min(120,Math.floor(((scroll.clientHeight-36)/1123)*100))));
  };

  function pdfFont(fontName){
    const n=String(fontName||'').toLowerCase();
    if(n.includes('times'))return '"Times New Roman", Times, serif';
    if(n.includes('courier'))return '"Courier New", Courier, monospace';
    if(n.includes('georgia'))return 'Georgia, serif';
    if(n.includes('calibri'))return 'Calibri, Arial, sans-serif';
    if(n.includes('helvetica')||n.includes('arial'))return 'Arial, Helvetica, sans-serif';
    return '"Times New Roman", Times, serif';
  }

  async function pdfToEditableHtml(buffer){
    if(!window.pdfjsLib) throw new Error('PDF parser is still loading.');
    if(window.pdfjsLib.GlobalWorkerOptions)window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf=await window.pdfjsLib.getDocument({data:buffer}).promise;
    const output=[];
    for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){
      const page=await pdf.getPage(pageNo),viewport=page.getViewport({scale:1});
      const content=await page.getTextContent({includeMarkedContent:true});
      const raw=content.items.filter(it=>String(it.str||'').trim()).map(it=>{
        const t=it.transform||[1,0,0,1,0,0];
        const fontSize=Math.max(6,Math.abs(Number(t[3]||t[0]||it.height||10)));
        const x=Number(t[4]||0),y=Number(t[5]||0);let font=String(it.fontName||'');
        try{const f=page.commonObjs.get(it.fontName);font=f?.name||f?.fallbackName||font;}catch(e){}
        return {text:String(it.str),x,y,width:Math.max(0,Number(it.width||0)),fontSize,bold:/bold|black|heavy|semibold|demi/i.test(font),italic:/italic|oblique/i.test(font),font};
      });
      if(!raw.length)continue;
      const avg=raw.reduce((a,b)=>a+b.fontSize,0)/raw.length;
      const tol=Math.max(2.5,avg*.28),lines=[];
      raw.sort((a,b)=>b.y-a.y||a.x-b.x);
      raw.forEach(item=>{let line=lines.find(l=>Math.abs(l.y-item.y)<=tol);if(!line){line={y:item.y,items:[]};lines.push(line);}line.items.push(item);});
      lines.sort((a,b)=>b.y-a.y);lines.forEach(l=>l.items.sort((a,b)=>a.x-b.x));
      const bodySize=raw.slice().sort((a,b)=>a.fontSize-b.fontSize)[Math.floor(raw.length*.45)]?.fontSize||11;
      const pageWidth=viewport.width||595;let bullets=[];const parts=[];
      const flush=()=>{if(bullets.length)parts.push(`<ul>${bullets.map(v=>`<li>${v}</li>`).join('')}</ul>`);bullets=[];};
      lines.forEach((line,idx)=>{
        const first=line.items[0];
        const text=line.items.map((item,j)=>{
          const prev=line.items[j-1],gap=prev?item.x-(prev.x+prev.width):0,space=gap>Math.max(2,item.fontSize*.28)?' ':'';
          const c=escapeHtml(item.text);return space+(item.bold?'<strong>':'')+(item.italic?'<em>':'')+c+(item.italic?'</em>':'')+(item.bold?'</strong>':'');
        }).join('').trim();
        if(!text)return;
        const avgSize=line.items.reduce((a,b)=>a+b.fontSize,0)/line.items.length,maxSize=Math.max(...line.items.map(i=>i.fontSize));
        const isBullet=/^(?:[•●▪◦‣*-]|\u2022)\s*/.test(text),clean=text.replace(/^(?:[•●▪◦‣*-]|\u2022)\s*/,'');
        const letters=text.replace(/[^A-Za-z]/g,'').length,upper=letters>4&&text===text.toUpperCase(),heading=maxSize>=bodySize*1.22||(first.bold&&upper&&text.length<=70);
        const totalWidth=line.items.reduce((a,b)=>a+b.width,0),centered=Math.abs((first.x+totalWidth/2)-pageWidth/2)<pageWidth*.13&&text.length<90;
        if(isBullet){bullets.push(clean);return;} flush();
        if(idx===0&&centered&&maxSize>=bodySize*1.15)parts.push(`<p class="resume-import-name" style="font-family:${pdfFont(first.font)};font-size:${Math.max(16,Math.round(maxSize*1.15))}pt">${text}</p>`);
        else if(heading)parts.push(`<p class="resume-import-section" style="font-family:${pdfFont(first.font)}">${text}</p>`);
        else parts.push(`<p style="font-family:${pdfFont(first.font)};font-size:${Math.max(10,Math.round(avgSize))}pt">${text}</p>`);
      });
      flush();if(pageNo<pdf.numPages)parts.push('<div class="resume-import-page-break"></div>');output.push(parts.join(''));
    }
    return output.join('');
  }

  async function getMasterResumeEditorHtml(masterText){
    try{
      if(typeof window.ensureCandidateResumeCloudFile==='function'){
        const file=await window.ensureCandidateResumeCloudFile(),name=String(file?.name||'').toLowerCase();
        if(file&&name.endsWith('.docx')&&window.mammoth){
          const result=await window.mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()});
          if(String(result?.value||'').trim())return {html:result.value,imported:true};
        }
        if(file&&name.endsWith('.pdf')&&window.pdfjsLib){
          const html=await pdfToEditableHtml(await file.arrayBuffer());
          if(String(html||'').trim())return {html,imported:true};
        }
      }
    }catch(error){console.warn('[Glueful Resume Studio V41] master import failed',error);}
    const safe=escapeHtml(String(masterText||'').replace(/\r\n/g,'\n').replace(/\r/g,'\n'));
    return {html:safe.split('\n').map(line=>line.trim()?`<p>${line}</p>`:'<p><br></p>').join(''),imported:false};
  }
  window.getMasterResumeEditorHtml=getMasterResumeEditorHtml;

  async function openJobResumeEditor(id){
    const job=typeof window.findActiveJobById==='function'?window.findActiveJobById(id):null;if(!job)return;
    window.gluefulJobResumeEditorId=String(job.id);
    const el=editor(),jobEl=$('job-resume-editor-job'),ats=$('job-resume-editor-ats'),note=$('job-resume-editor-ats-note');
    if(typeof window.openModal==='function')window.openModal('job-resume-editor-modal');
    if(jobEl){jobEl.innerHTML=`${typeof window.renderCompanyLogo==='function'?window.renderCompanyLogo(job):''}<div class="job-resume-editor-job-copy"><div class="job-resume-editor-job-title">${escapeHtml(job.title)}</div><div class="job-resume-editor-job-company">${escapeHtml(job.company)} · ${escapeHtml(job.location)}</div></div>`;if(typeof window.loadCompanyLogos==='function')window.loadCompanyLogos();}
    if(ats)ats.textContent='…';if(note)note.textContent='Loading your master resume from Candidate Profile…';
    let master=String(window.gluefulMasterResumeText||'').trim();if(!master&&typeof window.ensureMasterResumeText==='function'){try{master=String(await window.ensureMasterResumeText()||'').trim();}catch(e){}}
    const base=master||(typeof window.buildProfileResumeFallback==='function'?window.buildProfileResumeFallback():'');
    if(el){const imported=await getMasterResumeEditorHtml(base);el.innerHTML=imported.html;el.classList.remove('pdf-structured-canvas');el.classList.toggle('job-resume-master-imported',!!imported.imported);el.contentEditable='true';el.dataset.v41Zoom='100';el.style.zoom='1';}
    if(note)note.textContent=master?'Loaded from your Candidate Profile master resume. This job-specific copy is temporary and is never written back to the master.':'No readable master resume is available yet. Upload one in Candidate Profile.';
    if(typeof window.updateJobResumeEditorAts==='function')window.updateJobResumeEditorAts();
    enhance();
    if(window.matchMedia?.('(max-width:700px)').matches)setTimeout(window.gluefulV41FitWidth,50);
  }
  window.openJobResumeEditor=openJobResumeEditor;

  async function resetJobResumeToMaster(){
    const el=editor();if(!el)return;
    let master=String(window.gluefulMasterResumeText||'').trim();if(!master&&typeof window.buildProfileResumeFallback==='function')master=window.buildProfileResumeFallback();
    const imported=await getMasterResumeEditorHtml(master);el.innerHTML=imported.html;el.classList.remove('pdf-structured-canvas');el.classList.toggle('job-resume-master-imported',!!imported.imported);el.dataset.v41Zoom='100';el.style.zoom='1';
    if(typeof window.updateJobResumeEditorAts==='function')window.updateJobResumeEditorAts();enhance();el.focus();
  }
  window.resetJobResumeToMaster=resetJobResumeToMaster;

  // Make the existing export pipeline see a semantic document, never the
  // old absolute-positioned PDF canvas.
  window.resumeEditorCreateExportSheet=function(){
    const el=editor();if(!el)return null;
    const sheet=document.createElement('div');sheet.id='glueful-resume-export-sheet';
    sheet.style.cssText='position:fixed;left:-100000px;top:0;width:794px;min-height:1123px;padding:56px 58px;box-sizing:border-box;background:#fff;color:#202124;font-family:"Times New Roman",Times,serif;font-size:11pt;line-height:1.18;overflow:visible;z-index:-1;';
    const style=document.createElement('style');style.textContent=`
      #glueful-resume-export-sheet p{margin:0 0 7px}#glueful-resume-export-sheet h1,#glueful-resume-export-sheet h2,#glueful-resume-export-sheet h3{font-family:"Times New Roman",Times,serif;line-height:1.12;margin:12px 0 6px;color:#111318}#glueful-resume-export-sheet h1{font-size:18pt}#glueful-resume-export-sheet h2{font-size:13pt}#glueful-resume-export-sheet h3{font-size:11.5pt}#glueful-resume-export-sheet ul,#glueful-resume-export-sheet ol{margin:2px 0 8px;padding-left:24px}#glueful-resume-export-sheet li{margin:0 0 3px}.resume-import-page-break{height:0;break-after:page;page-break-after:always}`;
    sheet.appendChild(style);const content=document.createElement('div');content.innerHTML=el.innerHTML;sheet.appendChild(content);document.body.appendChild(sheet);return sheet;
  };

  // Existing PDF/DOCX download functions call the export-sheet helper above,
  // so the user's temporary edits are exported without altering the master.
  window.gluefulResumeStudioEnhance=enhance;

  function boot(){
    enhance();
    window.addEventListener('resize',()=>{if(modal()?.classList.contains('open')){const el=editor();if(el&&Number(el.dataset.v41Zoom||100)<80)setZoom(Number(el.dataset.v41Zoom));}}, {passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
