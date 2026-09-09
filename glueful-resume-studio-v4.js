/* Glueful — Resume Studio V4
 * Direct, Word-style resume editing.
 * Template changes keep the same document content.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUME_STUDIO_V4__) return;
  window.__GLUEFUL_RESUME_STUDIO_V4__=true;

  const VIEW='view-resumes', HUB='glueful-resume-studio-v3', OVERLAY='glueful-resume-studio-v3-overlay', EDITOR='glueful-word-editor';
  const T={
    minimal:{name:'Minimal',tag:'ATS',accent:'#374151'},
    modern:{name:'Modern',tag:'Popular',accent:'#2563eb'},
    technical:{name:'Technical',tag:'Engineering',accent:'#0f766e'},
    academic:{name:'Academic',tag:'Research',accent:'#7c2d12'},
    traditional:{name:'Traditional',tag:'Classic',accent:'#111827'},
    executive:{name:'Executive',tag:'Premium',accent:'#6d28d9'}
  };
  let model=blank(),template='minimal',dirty=false,importInput=null;
  const $=id=>document.getElementById(id);
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  function blank(){return{ name:'Your Name', headline:'Software / Firmware Engineer', email:'email@example.com', phone:'+91 00000 00000', location:'Hyderabad, India', linkedin:'linkedin.com/in/yourname', summary:'Write a concise, job-focused summary that highlights your strongest experience and measurable impact.', experience:'Role — Company | 2025 — Present\n• Describe a measurable achievement and the technology you used.\n• Highlight validation, development or research impact.', education:'M.Tech Integrated Program — Computer Science & Engineering / Electronics', skills:'Python · C/C++ · Linux · Embedded Systems · Firmware · Validation', projects:'', certifications:'' }}
  function toast(msg){let n=$('g4-toast');if(!n){n=document.createElement('div');n.id='g4-toast';n.className='g4-toast';document.body.appendChild(n)}n.textContent=msg;clearTimeout(n._t);n._t=setTimeout(()=>n.remove(),2600)}

  function profileObjects(){
    const out=[];
    for(const k of ['glueful_profile','glueful_user_profile','profile','userProfile']){try{const x=JSON.parse(localStorage.getItem(k)||'');if(x)out.push(x)}catch(_){}}
    for(const x of [window.gluefulProfile,window.userProfile,window.candidateProfile,window.currentUser?.user_metadata])if(x)out.push(x);
    return out;
  }
  function flat(x,out=[],d=0){
    if(!x||d>5)return out;
    if(typeof x==='string'){out.push({key:'text',value:x});return out}
    if(Array.isArray(x)){x.forEach(v=>flat(v,out,d+1));return out}
    for(const [k,v] of Object.entries(x)){if(v==null)continue;if(typeof v==='string')out.push({key:k,value:v});else if(typeof v==='object')flat(v,out,d+1)}
    return out;
  }
  function fromProfile(){
    const m=blank(), entries=profileObjects().flatMap(x=>flat(x));
    const find=tests=>{const e=entries.find(x=>tests.some(t=>new RegExp(t,'i').test(x.key)));return e?.value||''};
    const first=(a,b)=>clean(a)?a:b;
    m.name=first(find(['full.?name$','^name$','display.?name']),m.name);m.headline=first(find(['headline','title','role','position']),m.headline);m.email=first(find(['email']),m.email);m.phone=first(find(['phone','mobile','contact.?number']),m.phone);m.location=first(find(['location','city']),m.location);m.linkedin=first(find(['linkedin']),m.linkedin);m.summary=first(find(['summary','objective','professional.?summary']),m.summary);m.experience=first(find(['experience','work.?experience','employment']),m.experience);m.education=first(find(['education','academic']),m.education);m.skills=first(find(['skills','technical.?skills']),m.skills);m.projects=first(find(['projects','project']),m.projects);m.certifications=first(find(['certifications','certificates']),m.certifications);
    return m;
  }
  function sourceFromProfile(){
    const entries=profileObjects().flatMap(x=>flat(x));
    const url=entries.find(e=>/(resume|cv).*(url|uri|link|file)|^(resume|cv)$/i.test(e.key)&&/^https?:\/\//i.test(e.value));
    if(url)return url.value;
    const text=entries.find(e=>/(resume|cv).*(text|content|data)|resumeText|cvText/i.test(e.key)&&clean(e.value).length>80);
    return text?text.value:null;
  }
  async function parseFile(file){
    const name=String(file?.name||'resume'), type=String(file?.type||'').toLowerCase();
    if(/\.docx$/i.test(name)||type.includes('wordprocessingml')){if(!window.mammoth?.extractRawText)throw Error('Word reader unavailable. Refresh once and try again.');const r=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return parseText(r.value)}
    if(/\.pdf$/i.test(name)||type==='application/pdf'){if(!window.pdfjsLib)throw Error('PDF reader unavailable. Refresh once and try again.');const pdf=await window.pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise,parts=[];for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p),tc=await page.getTextContent();parts.push(tc.items.map(x=>x.str||'').join('\n'))}return parseText(parts.join('\n'))}
    return parseText(await file.text());
  }
  function parseText(text){
    const lines=String(text||'').split(/\r?\n/).map(clean).filter(Boolean),m=blank();if(!lines.length)return m;
    m.name=lines[0].slice(0,90);if(lines[1]&&!/@/.test(lines[1])&&!/\+?\d[\d\s().-]{7,}/.test(lines[1]))m.headline=lines[1].slice(0,110);
    const joined=lines.join(' · ');m.email=(joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)||[])[0]||m.email;m.phone=(joined.match(/(?:\+?\d[\d\s().-]{8,}\d)/)||[])[0]||m.phone;
    const H={summary:['summary','professional summary','profile','objective'],experience:['experience','work experience','employment'],education:['education','academic background'],skills:['skills','technical skills'],projects:['projects','selected projects'],certifications:['certifications','certificates']};
    const sec=k=>{const i=lines.findIndex(x=>H[k].includes(x.toLowerCase()));if(i<0)return'';const out=[];for(let j=i+1;j<lines.length;j++){if(Object.values(H).flat().includes(lines[j].toLowerCase()))break;out.push(lines[j])}return out.join('\n')};
    m.summary=sec('summary')||m.summary;m.experience=sec('experience')||lines.slice(2,Math.min(lines.length,14)).join('\n');m.education=sec('education')||m.education;m.skills=sec('skills')||m.skills;m.projects=sec('projects');m.certifications=sec('certifications');return m;
  }
  async function loadProfile(){
    const src=sourceFromProfile(), pm=fromProfile();
    if(!src){model=pm;return false}
    if(/^https?:\/\//i.test(src)){try{const r=await fetch(src,{credentials:'include'});if(!r.ok)throw Error('Resume file could not be read.');const b=await r.blob();const f=new File([b],'resume.pdf',{type:b.type||'application/pdf'});model={...pm,...await parseFile(f)};return true}catch(e){model=pm;return false}}
    model={...pm,...parseText(src)};return true;
  }

  function htmlFromModel(m){
    const block=(k,title,tag='div')=>m[k]?`<section data-section="${k}"><h2>${title}</h2><${tag} class="g4-content" data-field="${k}">${esc(m[k]).replace(/\n/g,'<br>')}</${tag}></section>`:'';
    return `<div class="g4-name" data-field="name">${esc(m.name)}</div><div class="g4-headline" data-field="headline">${esc(m.headline)}</div><div class="g4-contact" data-field="contact">${esc([m.email,m.phone,m.location,m.linkedin].filter(Boolean).join(' · '))}</div>${block('summary','PROFESSIONAL SUMMARY','p')}${block('experience','EXPERIENCE')}${block('education','EDUCATION','p')}${block('skills','SKILLS','p')}${block('projects','PROJECTS')}${block('certifications','CERTIFICATIONS','p')}`;
  }
  function currentText(){
    syncModel();return [model.name,model.headline,[model.email,model.phone,model.location,model.linkedin].filter(Boolean).join(' | '),'','PROFESSIONAL SUMMARY',model.summary,'','EXPERIENCE',model.experience,'','EDUCATION',model.education,'','SKILLS',model.skills,'','PROJECTS',model.projects,'','CERTIFICATIONS',model.certifications].filter(Boolean).join('\n');
  }
  function syncModel(){
    const e=$(EDITOR);if(!e)return;
    for(const k of ['name','headline','summary','experience','education','skills','projects','certifications']){const n=e.querySelector(`[data-field="${k}"]`);if(n)model[k]=(n.innerText||'').trim()}
    const c=clean(e.querySelector('[data-field="contact"]')?.innerText||'');const p=c.split(/\s+·\s+/).map(clean).filter(Boolean);model.email=p.find(x=>/@/.test(x))||model.email;model.phone=p.find(x=>/^\+?[\d\s().-]{8,}$/.test(x))||model.phone;model.linkedin=p.find(x=>/linkedin/i.test(x))||model.linkedin;model.location=p.find(x=>x!==model.email&&x!==model.phone&&x!==model.linkedin)||model.location;
  }
  function dirtyState(v=true){dirty=v;document.querySelectorAll('.g4-status').forEach(x=>x.textContent=v?'Unsaved changes':'Ready to edit');document.querySelector('.g4-savebar')?.classList.toggle('show',v)}
  function command(c,v=null){const e=$(EDITOR);if(!e)return;e.focus();try{document.execCommand(c,false,v)}catch(_){}dirtyState(true)}
  function addLink(){const u=prompt('Enter link URL');if(u)command('createLink',u)}
  function pageBreak(){command('insertHTML','<div class="g4-page-break"><span>Page Break</span></div><p><br></p>');toast('Page break inserted.');}

  function applyTemplate(k){if(!T[k])return;syncModel();template=k;const e=$(EDITOR);if(e){e.className='g4-page '+k;e.style.setProperty('--accent',T[k].accent)}document.querySelector('[data-template-select]')?.setAttribute('value',k);document.querySelectorAll('[data-template-card]').forEach(x=>x.classList.toggle('active',x.dataset.templateCard===k));dirtyState(true);toast(`${T[k].name} template applied. Your resume content was preserved.`)}
  function close(){if(dirty&&!confirm('You have unsaved changes. Close without saving?'))return;dirty=false;const o=$(OVERLAY);o?.classList.remove('open');o?.setAttribute('aria-hidden','true')}
  function open(){const o=$(OVERLAY);if(!o)return;const e=$(EDITOR);if(e&&!e.innerHTML.trim())e.innerHTML=htmlFromModel(model);if(e){e.className='g4-page '+template;e.style.setProperty('--accent',T[template].accent)}o.classList.add('open');o.setAttribute('aria-hidden','false');setTimeout(()=>e?.focus(),0)}
  function importResume(){
    if(!importInput){importInput=document.createElement('input');importInput.type='file';importInput.accept='.pdf,.docx,.txt';importInput.style.display='none';document.body.appendChild(importInput);importInput.addEventListener('change',async()=>{const f=importInput.files?.[0];importInput.value='';if(!f)return;try{model=await parseFile(f);template='minimal';open();$(EDITOR).innerHTML=htmlFromModel(model);dirtyState(true);toast('Resume imported. Edit it directly like a Word document.')}catch(e){toast(e?.message||'Could not import the resume.')}})}importInput.click();
  }

  function exportTxt(){downloadBlob(new Blob([currentText()],{type:'text/plain;charset=utf-8'}),fileName('txt'));dirtyState(false);toast('TXT saved.')}
  function fileName(ext){syncModel();const n=(clean(model.name)||'resume').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'resume';return n+'.'+ext}
  function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1200)}
  function exportPdf(){const e=$(EDITOR);if(!e)return;syncModel();const clone=e.cloneNode(true);clone.contentEditable='false';const root=document.createElement('div');root.id='g4-print-root';root.appendChild(clone);document.body.appendChild(root);setTimeout(()=>{window.print();root.remove()},60);dirtyState(false);toast('Print dialog opened. Choose Save as PDF.')}
  async function exportDocx(){
    if(!window.docx){toast('Word export engine unavailable. Refresh once and try again.');return}syncModel();const d=window.docx,children=[];const e=$(EDITOR);
    const addText=async n=>{const runs=[];for(const child of n.childNodes){if(child.nodeType===3){runs.push(new d.TextRun({text:child.nodeValue||''}))}else if(child.nodeName==='BR'){runs.push(new d.TextRun({text:'\n'}))}else if(child.nodeType===1){runs.push(new d.TextRun({text:child.innerText||child.textContent||'',bold:child.tagName==='STRONG'||child.tagName==='B',italics:child.tagName==='EM'||child.tagName==='I',underline:child.tagName==='U'}))}}return new d.Paragraph({children:runs})};
    for(const n of [...e.children]){if(n.matches('.g4-name'))children.push(new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.TextRun({text:n.innerText,bold:true,size:34})]}));else if(n.matches('.g4-headline'))children.push(new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.TextRun({text:n.innerText,bold:true,size:20,color:T[template].accent.replace('#','')})]}));else if(n.matches('.g4-contact'))children.push(new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.TextRun({text:n.innerText,size:16,color:'65718A'})]}));else if(n.matches('section')){const h=n.querySelector('h2'),b=n.querySelector('[data-field]');if(h)children.push(new d.Paragraph({text:h.innerText,heading:d.HeadingLevel.HEADING_2}));if(b)children.push(await addText(b))}}
    try{downloadBlob(await d.Packer.toBlob(new d.Document({sections:[{children}]})),fileName('docx'));dirtyState(false);toast('Word file saved.')}catch(e){toast(e?.message||'Could not create Word file.')}
  }

  const css=`
    #g4-style{display:none}
    #${HUB}{font-family:Inter,system-ui,sans-serif;max-width:1440px;margin:0 auto;padding:22px 26px 52px;color:#182033;box-sizing:border-box}
    .g4-hub-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}.g4-title{margin:0;font-size:30px;letter-spacing:-.8px}.g4-sub{margin:6px 0 0;color:#71809a;font-size:13px}.g4-hub-actions{display:flex;gap:8px}.g4-btn{border:1px solid #dbe2ed;background:#fff;color:#243149;border-radius:9px;padding:9px 13px;font:700 11px Inter;cursor:pointer}.g4-btn.primary{border:0;color:#fff;background:linear-gradient(135deg,#733cff,#286dff)}
    .g4-template-strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px;margin-top:16px}.g4-template-card{border:1px solid #dfe5ef;background:#fff;border-radius:11px;padding:8px;cursor:pointer}.g4-template-card.active{border-color:#7658ef;box-shadow:0 0 0 2px rgba(118,88,239,.1)}.g4-template-card b{display:block;font-size:10px}.g4-template-card small{display:block;color:#7b879d;font-size:8px;margin-top:3px}.g4-thumb{height:105px;border:1px solid #e1e7ef;border-radius:7px;position:relative;background:#fff;overflow:hidden}.g4-thumb:before{content:"";position:absolute;left:10px;right:10px;top:10px;height:5px;background:#dfe4eb;border-radius:5px}.g4-thumb:after{content:"";position:absolute;left:10px;right:24px;top:23px;height:3px;background:#edf0f4;border-radius:5px;box-shadow:0 10px 0 #edf0f4,0 20px 0 #edf0f4,0 30px 0 #edf0f4,0 40px 0 #edf0f4}.g4-thumb.modern{border-top:8px solid #2563eb}.g4-thumb.technical{border-left:7px solid #0f766e}.g4-thumb.academic,.g4-thumb.traditional{font-family:Georgia,serif}.g4-thumb.executive{background:#faf7ff;border-top:18px solid #eee8ff}.g4-editor{margin-top:14px;border:1px solid #d8dfe8;border-radius:13px;overflow:hidden;background:#eef1f4}.g4-ribbon{display:flex;flex-wrap:wrap;gap:5px;align-items:center;background:#fff;border-bottom:1px solid #d8dfe8;padding:8px}.g4-tool{min-width:32px;height:30px;padding:0 8px;border:1px solid transparent;border-radius:6px;background:#fff;color:#29354b;font:700 11px Inter;cursor:pointer}.g4-tool:hover{background:#f4f1ff;border-color:#dfd8ff}.g4-select{height:30px;border:1px solid #dbe2eb;border-radius:6px;background:#fff;color:#29354b;padding:0 7px;font:600 11px Inter}.g4-sep{width:1px;height:21px;background:#dfe4eb;margin:0 2px}.g4-status{font-size:9px;color:#7b879d;margin-left:8px}.g4-ruler{height:27px;background:#f6f7f9;border-bottom:1px solid #dde2e8}.g4-workspace{display:grid;grid-template-columns:175px minmax(0,1fr);min-height:740px}.g4-outline{background:#fff;border-right:1px solid #dde3ea;padding:14px;overflow:auto}.g4-outline h4{margin:0 0 9px;color:#8a95a9;font-size:8px;text-transform:uppercase;letter-spacing:.08em}.g4-outline button{display:block;width:100%;border:0;background:transparent;text-align:left;padding:7px 8px;border-radius:6px;color:#58667d;font:650 10px Inter;cursor:pointer}.g4-outline button:hover{background:#f3f1ff;color:#5b43df}.g4-canvas{background:#e8edf3;overflow:auto;padding:30px;display:flex;justify-content:center}.g4-page{width:794px;min-height:1123px;background:#fff;box-sizing:border-box;padding:64px 66px;box-shadow:0 12px 38px rgba(31,43,68,.17);outline:0;color:#263149;--accent:#374151}.g4-name{font-size:30px;font-weight:800;text-align:center;letter-spacing:-.35px}.g4-headline{font-size:12px;font-weight:750;text-align:center;color:var(--accent);margin:6px 0 10px}.g4-contact{font-size:9px;color:#6e7c91;text-align:center}.g4-page section{margin-top:23px}.g4-page section h2{font-size:10px;color:var(--accent);border-bottom:1px solid #dce2ea;padding-bottom:6px;margin:0 0 8px;letter-spacing:.07em}.g4-content{font-size:10px;line-height:1.58;color:#526078;margin:0;white-space:normal}.g4-page ul,.g4-page ol{font-size:10px;line-height:1.58;color:#526078}.g4-page.modern{border-top:9px solid #2563eb;padding-top:55px}.g4-page.modern .g4-name,.g4-page.modern .g4-headline,.g4-page.modern .g4-contact{text-align:left}.g4-page.technical{border-left:11px solid #0f766e;padding-left:55px}.g4-page.technical .g4-name,.g4-page.technical .g4-headline,.g4-page.technical .g4-contact{text-align:left}.g4-page.academic{font-family:Georgia,serif}.g4-page.traditional{font-family:Georgia,serif}.g4-page.traditional .g4-name{text-transform:uppercase;letter-spacing:.08em;font-size:25px}.g4-page.executive .g4-name,.g4-page.executive .g4-headline,.g4-page.executive .g4-contact{text-align:left}.g4-page-break{height:24px;margin:16px -25px;border-top:2px dashed #aeb7c5;position:relative;text-align:center;color:#7d8899;font:700 8px Inter}.g4-page-break span{position:relative;top:-7px;background:#eef1f4;padding:2px 8px;border-radius:99px}.g4-savebar{display:none;align-items:center;gap:8px;background:#fff;border-top:1px solid #d8dfe8;padding:8px}.g4-savebar.show{display:flex}.g4-savebar .spacer{flex:1}.g4-toast{position:fixed;right:20px;bottom:20px;z-index:200000;background:#182033;color:#fff;padding:10px 13px;border-radius:9px;font:650 11px Inter;box-shadow:0 10px 30px rgba(0,0,0,.24)}#g4-print-root{display:none}@media print{body>*:not(#g4-print-root){display:none!important}#g4-print-root{display:block!important}.g4-page{width:210mm!important;min-height:297mm!important;margin:0!important;padding:18mm!important;box-shadow:none!important}}
    @media(max-width:1050px){.g4-template-strip{grid-template-columns:repeat(3,minmax(0,1fr))}.g4-workspace{grid-template-columns:1fr}.g4-outline{display:none}.g4-page{width:720px;min-height:1018px}}
    @media(max-width:700px){#${HUB}{padding:15px}.g4-hub-head{flex-direction:column}.g4-template-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.g4-canvas{padding:12px}.g4-page{width:100%;min-height:900px;padding:35px 24px}.g4-ribbon{overflow-x:auto;flex-wrap:nowrap}.g4-workspace{min-height:650px}}
  `;

  function installCss(){if($('g4-style'))return;const s=document.createElement('style');s.id='g4-style';s.textContent=css;document.head.appendChild(s)}
  function ensureOverlay(){
    if($(OVERLAY))return;const o=document.createElement('div');o.id=OVERLAY;o.setAttribute('aria-hidden','true');o.style.cssText='position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;background:rgba(10,14,23,.62);backdrop-filter:blur(5px);padding:18px;box-sizing:border-box';
    o.innerHTML=`<div class="g4-panel" style="width:min(1450px,99vw);height:min(930px,96vh);background:#f2f4f7;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 30px 100px rgba(0,0,0,.42)"><div class="g4-top" style="height:55px;background:#fff;border-bottom:1px solid #dde3ea;display:flex;align-items:center;justify-content:space-between;padding:0 14px 0 18px"><div><strong style="font-size:15px">Resume Studio</strong><span class="g4-status">Ready to edit</span></div><div class="g4-hub-actions"><button class="g4-btn" data-close>Close</button><button class="g4-btn primary" data-save>Save to device</button></div></div><div style="padding:9px;background:#fff;border-bottom:1px solid #dfe4eb;display:flex;align-items:center;gap:10px"><label style="font:800 9px Inter;color:#7d899d">TEMPLATE</label><select class="g4-select" data-template-select>${Object.entries(T).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select><span class="g4-status">Type directly on the page — like Microsoft Word.</span><div style="flex:1"></div><button class="g4-btn" data-import>Import</button><button class="g4-btn" data-profile>Load current resume</button></div><div class="g4-editor"><div class="g4-ribbon"><button class="g4-tool" data-cmd="undo">↶</button><button class="g4-tool" data-cmd="redo">↷</button><span class="g4-sep"></span><select class="g4-select" data-cmd-select="fontName"><option>Inter</option><option>Arial</option><option>Georgia</option><option>Times New Roman</option><option>Courier New</option></select><select class="g4-select" data-cmd-select="fontSize"><option value="2">10</option><option value="3" selected>12</option><option value="4">14</option><option value="5">18</option><option value="6">24</option><option value="7">32</option></select><button class="g4-tool" data-cmd="bold"><b>B</b></button><button class="g4-tool" data-cmd="italic"><i>I</i></button><button class="g4-tool" data-cmd="underline"><u>U</u></button><button class="g4-tool" data-cmd="strikeThrough"><s>S</s></button><span class="g4-sep"></span><button class="g4-tool" data-cmd="justifyLeft">Left</button><button class="g4-tool" data-cmd="justifyCenter">Center</button><button class="g4-tool" data-cmd="justifyRight">Right</button><button class="g4-tool" data-cmd="justifyFull">Justify</button><span class="g4-sep"></span><button class="g4-tool" data-cmd="insertUnorderedList">• List</button><button class="g4-tool" data-cmd="insertOrderedList">1. List</button><button class="g4-tool" data-cmd="outdent">←</button><button class="g4-tool" data-cmd="indent">→</button><span class="g4-sep"></span><button class="g4-tool" data-cmd="removeFormat">Clear</button><button class="g4-tool" data-link>Link</button><button class="g4-tool" data-pagebreak>Page break</button><label class="g4-tool" style="position:relative">A<input type="color" value="#263149" data-color="foreColor" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label><label class="g4-tool" style="position:relative">▰<input type="color" value="#fff59d" data-color="hiliteColor" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label></div><div class="g4-ruler"></div><div class="g4-workspace"><aside class="g4-outline"><h4>Document</h4>${[['name','Personal Information'],['headline','Headline'],['summary','Summary'],['experience','Experience'],['education','Education'],['skills','Skills'],['projects','Projects'],['certifications','Certifications']].map(x=>`<button data-outline="${x[0]}">${x[1]}</button>`).join('')}</aside><main class="g4-canvas"><div id="${EDITOR}" class="g4-page minimal" contenteditable="true" spellcheck="true" style="--accent:${T.minimal.accent}"></div></main></div><div class="g4-savebar"><span class="g4-status">Changes made.</span><span class="spacer"></span><button class="g4-btn" data-discard>Discard</button><button class="g4-btn primary" data-save>Save</button></div></div></div>`;
    document.head.appendChild(Object.assign(document.createElement('style'),{textContent:`#${OVERLAY}.open{display:flex}.g4-panel{font-family:Inter,system-ui,sans-serif}.g4-top{font-family:Inter,system-ui,sans-serif}` ,id:'g4-overlay-style'}));document.body.appendChild(o);
    o.addEventListener('input',e=>{if(e.target.closest('#'+EDITOR))dirtyState(true)});
    o.addEventListener('click',async e=>{
      const c=e.target.closest('[data-cmd]');if(c){command(c.dataset.cmd);return}
      const link=e.target.closest('[data-link]');if(link){addLink();return}
      const pb=e.target.closest('[data-pagebreak]');if(pb){pageBreak();return}
      const ol=e.target.closest('[data-outline]');if(ol){$(EDITOR).querySelector(`[data-field="${ol.dataset.outline}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});return}
      const closeBtn=e.target.closest('[data-close]');if(closeBtn){close();return}
      const save=e.target.closest('[data-save]');if(save){chooseFormat();return}
      const disc=e.target.closest('[data-discard]');if(disc){dirty=false;open();return}
      const imp=e.target.closest('[data-import]');if(imp){importResume();return}
      const prof=e.target.closest('[data-profile]');if(prof){await openProfile();return}
    });
    o.addEventListener('change',e=>{const s=e.target.closest('[data-template-select]');if(s)applyTemplate(s.value);const c=e.target.closest('[data-color]');if(c)command(c.dataset.color,c.value);const fs=e.target.closest('[data-cmd-select]');if(fs)command(fs.dataset.cmdSelect,fs.value)});
    o.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }
  async function openProfile(){try{const ok=await loadProfile();template='minimal';open();$(EDITOR).innerHTML=htmlFromModel(model);dirtyState(true);toast(ok?'Current resume loaded.':'Profile details loaded. Import a PDF/Word file to bring in full content.')}catch(e){toast(e?.message||'Could not load your resume.')}}
  function chooseFormat(){const old=$('g4-format');if(old)old.remove();const d=document.createElement('div');d.id='g4-format';d.style.cssText='position:fixed;inset:0;z-index:100005;display:flex;align-items:center;justify-content:center;background:rgba(10,14,23,.45)';d.innerHTML='<div style="width:min(430px,92vw);background:#fff;border-radius:14px;padding:20px;font-family:Inter,system-ui;box-shadow:0 25px 80px rgba(0,0,0,.3)"><strong style="font-size:17px">Save resume</strong><p style="font-size:11px;color:#71809a">Choose the format to keep on your device.</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><button data-f="pdf" style="padding:13px;background:#fff;border:1px solid #dfe5ef;border-radius:9px">PDF</button><button data-f="docx" style="padding:13px;background:#fff;border:1px solid #dfe5ef;border-radius:9px">Word</button><button data-f="txt" style="padding:13px;background:#fff;border:1px solid #dfe5ef;border-radius:9px">TXT</button></div><button data-c style="width:100%;margin-top:10px;padding:9px;background:#fff;border:1px solid #dfe5ef;border-radius:8px">Cancel</button></div>';document.body.appendChild(d);d.addEventListener('click',async e=>{if(e.target===d||e.target.closest('[data-c]')){d.remove();return}const f=e.target.closest('[data-f]');if(!f)return;d.remove();if(f.dataset.f==='pdf')exportPdf();else if(f.dataset.f==='docx')await exportDocx();else exportTxt()})}

  function renderHub(){const v=$(VIEW);if(!v)return;installCss();$(HUB)?.remove();const h=document.createElement('div');h.id=HUB;h.innerHTML=`<div class="g4-hub-head"><div><h1 class="g4-title">Resumes</h1><p class="g4-sub">Build and edit your resume directly in a Microsoft Word-style editor.</p></div><div class="g4-hub-actions"><button class="g4-btn" data-hub-import>↥ Import Resume</button><button class="g4-btn primary" data-hub-profile>Edit Current Resume</button></div></div><div class="g4-template-strip">${Object.entries(T).map(([k,t])=>`<div class="g4-template-card ${k===template?'active':''}" data-template-card="${k}"><div class="g4-thumb ${k}"></div><b>${t.name}</b><small>${t.tag}</small></div>`).join('')}</div>`;v.appendChild(h);h.addEventListener('click',e=>{const t=e.target.closest('[data-template-card]');if(t){open();applyTemplate(t.dataset.templateCard);return}const i=e.target.closest('[data-hub-import]');if(i)importResume();const p=e.target.closest('[data-hub-profile]');if(p)openProfile()})}
  function start(){installCss();ensureOverlay();renderHub();window.addEventListener('glueful-initial-view-ready',e=>{if(e.detail?.view===VIEW){ensureOverlay();renderHub()}})}
  window.gluefulResumeStudioV4={open,close,applyTemplate,importResume,exportPdf,exportDocx};
  start();
})();