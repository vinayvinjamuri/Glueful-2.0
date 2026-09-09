/* Glueful — Resume Studio V4
 * Word-style resume editor.
 * The resume is edited directly on the document page instead of through
 * dozens of detached form fields. Template changes preserve the document.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUME_STUDIO_V4__) return;
  window.__GLUEFUL_RESUME_STUDIO_V4__=true;

  const VIEW='view-resumes';
  const HUB='glueful-resume-studio-v3';
  const OVERLAY='glueful-resume-studio-v3-overlay';
  const EDITOR='glueful-word-editor';
  const TEMPLATES={
    minimal:{name:'Minimal',tag:'ATS',accent:'#374151',className:'minimal'},
    modern:{name:'Modern',tag:'Popular',accent:'#2563eb',className:'modern'},
    technical:{name:'Technical',tag:'Engineering',accent:'#0f766e',className:'technical'},
    academic:{name:'Academic',tag:'Research',accent:'#7c2d12',className:'academic'},
    traditional:{name:'Traditional',tag:'Classic',accent:'#111827',className:'traditional'},
    executive:{name:'Executive',tag:'Premium',accent:'#6d28d9',className:'executive'}
  };
  const FIELDS=['name','headline','email','phone','location','linkedin','summary','experience','education','skills','projects','certifications'];
  let model=blankModel();
  let template='minimal';
  let dirty=false;
  let initialHtml='';
  let importInput=null;

  function blankModel(){
    return {
      name:'Your Name',
      headline:'Software / Firmware Engineer',
      email:'email@example.com',
      phone:'+91 00000 00000',
      location:'Hyderabad, India',
      linkedin:'linkedin.com/in/yourname',
      summary:'Write a concise, job-focused summary that highlights your strongest experience and measurable impact.',
      experience:'Role — Company | 2025 — Present\n• Describe a measurable achievement and the technology you used.\n• Highlight validation, development or research impact.\n• Keep bullets concise and ATS-friendly.',
      education:'M.Tech Integrated Program — Computer Science & Engineering / Electronics',
      skills:'Python · C/C++ · Linux · Embedded Systems · Firmware · Validation',
      projects:'',
      certifications:''
    };
  }
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const lineHtml=v=>String(v??'').split(/\r?\n/).map(esc).join('<br>');
  const toast=(msg)=>{let t=document.getElementById('g4-toast');if(!t){t=document.createElement('div');t.id='g4-toast';t.className='g4-toast';document.body.appendChild(t)}t.textContent=msg;clearTimeout(t._timer);t._timer=setTimeout(()=>t.remove(),2600)};

  function profileObjects(){
    const out=[];
    for(const key of ['glueful_profile','glueful_user_profile','profile','userProfile']){
      try{const x=JSON.parse(localStorage.getItem(key)||'');if(x)out.push(x)}catch(_){ }
    }
    for(const x of [window.gluefulProfile,window.userProfile,window.candidateProfile,window.candidateResume,window.currentUser?.user_metadata]) if(x) out.push(x);
    return out;
  }
  function flattenProfile(obj,out=[],depth=0){
    if(!obj||depth>5)return out;
    if(typeof obj==='string'){out.push({key:'text',value:obj});return out}
    if(Array.isArray(obj)){obj.forEach(x=>flattenProfile(x,out,depth+1));return out}
    for(const [k,v] of Object.entries(obj)){if(v==null)continue;if(typeof v==='string')out.push({key:k,value:v});else if(typeof v==='object')flattenProfile(v,out,depth+1)}
    return out;
  }
  function profileModel(){
    const m=blankModel(), entries=profileObjects().flatMap(x=>flattenProfile(x));
    const find=tests=>{const e=entries.find(x=>tests.some(t=>new RegExp(t,'i').test(x.key)));return e?.value||''};
    const first=(...vals)=>vals.find(x=>clean(x))||'';
    m.name=first(find(['full.?name$','^name$','display.?name']),m.name);
    m.headline=first(find(['headline','title','role','position']),m.headline);
    m.email=first(find(['email']),m.email);
    m.phone=first(find(['phone','mobile','contact.?number']),m.phone);
    m.location=first(find(['location','city']),m.location);
    m.linkedin=first(find(['linkedin']),m.linkedin);
    m.summary=first(find(['summary','objective','profile.?summary','professional.?summary']),m.summary);
    m.experience=first(find(['experience','work.?experience','employment']),m.experience);
    m.education=first(find(['education','academic']),m.education);
    m.skills=first(find(['skills','technical.?skills']),m.skills);
    m.projects=first(find(['projects','project']),m.projects);
    m.certifications=first(find(['certifications','certificates']),m.certifications);
    return m;
  }
  function resumeSource(){
    const entries=profileObjects().flatMap(x=>flattenProfile(x));
    const url=entries.find(e=>/(resume|cv).*(url|uri|link|file)|^(resume|cv)$/i.test(e.key)&&/^https?:\/\//i.test(e.value));
    if(url)return{type:'url',value:url.value};
    const domLink=[...document.querySelectorAll('a[href]')].map(a=>a.href).find(h=>/(resume|cv)/i.test(h)&&/\.(pdf|docx?|txt)(?:$|[?#])/i.test(h));
    if(domLink)return{type:'url',value:domLink};
    const text=entries.find(e=>/(resume|cv).*(text|content|data)|resumeText|cvText/i.test(e.key)&&clean(e.value).length>80);
    return text?{type:'text',value:text.value}:null;
  }
  async function parseFile(file){
    const name=String(file?.name||'resume'), type=String(file?.type||'').toLowerCase();
    if(/\.docx$/i.test(name)||type.includes('wordprocessingml')){
      if(!window.mammoth?.extractRawText)throw Error('DOCX reader is unavailable. Refresh once and try again.');
      const r=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});
      return parseText(r.value,name);
    }
    if(/\.pdf$/i.test(name)||type==='application/pdf'){
      if(!window.pdfjsLib)throw Error('PDF reader is unavailable. Refresh once and try again.');
      const pdf=await window.pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise,parts=[];
      for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p),tc=await page.getTextContent();parts.push(tc.items.map(x=>x.str||'').join('\n'))}
      return parseText(parts.join('\n'),name);
    }
    return parseText(await file.text(),name);
  }
  function parseText(text,fileName){
    const lines=String(text||'').split(/\r?\n/).map(clean).filter(Boolean),m=blankModel();
    if(!lines.length)return m;
    m.name=lines[0].slice(0,90);
    if(lines[1]&&!/@/.test(lines[1])&&!/+?[0-9][\\d\\s().-]{7,}/.test(lines[1]))m.headline=lines[1].slice(0,110);
    const joined=lines.join(' · ');
    m.email=(joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)||[])[0]||m.email;
    m.phone=(joined.match(/(?:\+?\d[\d\s().-]{8,}\d)/)||[])[0]||m.phone;
    const heads={summary:['summary','professional summary','profile','objective'],experience:['experience','work experience','employment'],education:['education','academic background'],skills:['skills','technical skills'],projects:['projects','selected projects'],certifications:['certifications','certificates']};
    const section=(name)=>{const i=lines.findIndex(x=>heads[name].some(k=>x.toLowerCase()===k));if(i<0)return'';const out=[];for(let j=i+1;j<lines.length;j++){const low=lines[j].toLowerCase();if(Object.values(heads).flat().includes(low))break;out.push(lines[j])}return out.join('\n')};
    m.summary=section('summary')||m.summary;m.experience=section('experience')||lines.slice(2,Math.min(lines.length,14)).join('\n');m.education=section('education')||m.education;m.skills=section('skills')||m.skills;m.projects=section('projects');m.certifications=section('certifications');m._source=fileName||'';return m;
  }
  async function loadCandidateProfile(){
    const src=resumeSource(), pm=profileModel();
    if(src?.type==='text'){model={...pm,...parseText(src.value,'Candidate profile resume')};return true}
    if(src?.type==='url'){
      try{const r=await fetch(src.value,{credentials:'include'});if(!r.ok)throw Error('Resume file could not be read from the candidate profile.');const b=await r.blob();const ext=/\.docx?(?:$|[?#])/i.test(src.value)?'.docx':/\.txt(?:$|[?#])/i.test(src.value)?'.txt':'.pdf';const f=new File([b],'candidate-profile-resume'+ext,{type:b.type||'application/octet-stream'});model={...pm,...await parseFile(f)};return true}catch(e){console.warn('[Glueful] candidate resume load failed',e);model=pm;return false}
    }
    model=pm;return false;
  }

  function contentHtmlFromModel(m){
    return `<div class="g4-name" data-field="name">${esc(m.name)}</div>
      <div class="g4-headline" data-field="headline">${esc(m.headline)}</div>
      <div class="g4-contact" data-field="contact">${esc([m.email,m.phone,m.location,m.linkedin].filter(Boolean).join(' · '))}</div>
      ${m.summary?`<section data-resume-section="summary"><h2>PROFESSIONAL SUMMARY</h2><p data-field="summary">${lineHtml(m.summary)}</p></section>`:''}
      ${m.experience?`<section data-resume-section="experience"><h2>EXPERIENCE</h2><div class="g4-body" data-field="experience">${lineHtml(m.experience)}</div></section>`:''}
      ${m.education?`<section data-resume-section="education"><h2>EDUCATION</h2><p data-field="education">${lineHtml(m.education)}</p></section>`:''}
      ${m.skills?`<section data-resume-section="skills"><h2>SKILLS</h2><p data-field="skills">${lineHtml(m.skills)}</p></section>`:''}
      ${m.projects?`<section data-resume-section="projects"><h2>PROJECTS</h2><div class="g4-body" data-field="projects">${lineHtml(m.projects)}</div></section>`:''}
      ${m.certifications?`<section data-resume-section="certifications"><h2>CERTIFICATIONS</h2><p data-field="certifications">${lineHtml(m.certifications)}</p></section>`:''}`;
  }

  function installCss(){
    if(document.getElementById('g4-style'))return;
    const s=document.createElement('style');s.id='g4-style';s.textContent=`
      #${HUB}{font-family:Inter,system-ui,sans-serif;max-width:1440px;margin:0 auto;padding:22px 26px 50px;color:#182033;box-sizing:border-box}
      .g4-hub-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:16px}.g4-title{margin:0;font-size:30px;letter-spacing:-.8px}.g4-sub{margin:6px 0 0;color:#71809a;font-size:13px}
      .g4-hub-actions{display:flex;gap:8px}.g4-btn{border:1px solid #dbe2ed;background:#fff;color:#243149;border-radius:9px;padding:9px 13px;font:700 11px Inter;cursor:pointer}.g4-btn.primary{border:0;color:#fff;background:linear-gradient(135deg,#733cff,#286dff);box-shadow:0 8px 20px rgba(91,67,235,.2)}
      .g4-template-strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px;margin-top:15px}.g4-template-card{border:1px solid #dfe5ef;background:#fff;border-radius:11px;padding:8px;cursor:pointer}.g4-template-card.active{border-color:#7759ef;box-shadow:0 0 0 2px rgba(119,89,239,.09)}.g4-template-card b{display:block;font-size:10px}.g4-template-card small{display:block;color:#7b879d;font-size:8px;margin-top:3px}.g4-thumb{height:112px;margin-bottom:7px;border:1px solid #e2e7ef;border-radius:7px;background:#fff;position:relative;overflow:hidden;padding:8px;box-sizing:border-box}.g4-thumb:before{content:"";position:absolute;left:9px;right:9px;top:9px;height:5px;background:#dfe4eb;border-radius:4px}.g4-thumb:after{content:"";position:absolute;left:9px;right:25px;top:22px;height:3px;background:#edf0f4;border-radius:4px;box-shadow:0 10px 0 #edf0f4,0 20px 0 #edf0f4,0 30px 0 #edf0f4,0 40px 0 #edf0f4}.g4-thumb.modern{border-top:7px solid #2563eb}.g4-thumb.technical{border-left:7px solid #0f766e}.g4-thumb.academic{font-family:Georgia,serif}.g4-thumb.traditional{font-family:Georgia,serif}.g4-thumb.executive{background:#faf7ff;border-top:20px solid #ede9fe}.g4-thumb.executive:before{top:29px;background:#c9b9ff}.g4-toolrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:16px;border:1px solid #dfe5ee;background:#fff;border-radius:11px;padding:9px;box-shadow:0 4px 14px rgba(31,48,88,.05)}
      .g4-editor-shell{margin-top:10px;background:#eef1f5;border:1px solid #d9dfe8;border-radius:14px;overflow:hidden}.g4-ribbon{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#fff;border-bottom:1px solid #d9dfe8;padding:7px 9px}.g4-tool{height:31px;min-width:31px;border:1px solid transparent;background:#fff;border-radius:6px;padding:0 8px;color:#29354b;font:700 11px Inter;cursor:pointer}.g4-tool:hover{background:#f4f2ff;border-color:#e4defe}.g4-tool.active{background:#eeeaff;border-color:#d9d0ff;color:#6043df}.g4-sep{width:1px;height:22px;background:#dfe4eb;margin:0 2px}.g4-select{height:31px;border:1px solid #dce2eb;border-radius:6px;background:#fff;padding:0 7px;color:#29354b;font:600 11px Inter}.g4-color{width:31px;padding:0;position:relative}.g4-color input{position:absolute;inset:0;opacity:0;cursor:pointer}.g4-format-label{font-size:8px;color:#8a95a9;text-transform:uppercase;letter-spacing:.05em;font-weight:800;margin-right:2px}.g4-ruler{height:30px;background:#f5f7f9;border-bottom:1px solid #dde3ea;position:relative}.g4-ruler:before{content:"";position:absolute;left:210px;right:210px;top:7px;height:14px;border-top:1px solid #cdd4de;background:repeating-linear-gradient(90deg,transparent 0 19px,#b9c1ce 19px 20px)}.g4-workspace{display:grid;grid-template-columns:180px minmax(0,1fr);min-height:760px}.g4-outline{background:#fff;border-right:1px solid #dde3ea;padding:14px;overflow:auto}.g4-outline h4{margin:0 0 9px;color:#8a95a9;font-size:8px;text-transform:uppercase;letter-spacing:.08em}.g4-outline button{display:block;width:100%;text-align:left;border:0;background:transparent;padding:7px 8px;border-radius:6px;color:#59677e;font:650 10px Inter;cursor:pointer}.g4-outline button:hover{background:#f5f3ff;color:#5b43df}.g4-canvas{padding:28px 34px 44px;overflow:auto;background:#e9edf3;display:flex;justify-content:center}.g4-page{position:relative;width:794px;min-height:1123px;background:#fff;box-shadow:0 12px 38px rgba(31,43,68,.16);padding:64px 66px;box-sizing:border-box;color:#263149;outline:0}.g4-page:focus{box-shadow:0 12px 38px rgba(31,43,68,.16),0 0 0 2px rgba(103,76,227,.18)}.g4-page[contenteditable="true"]{cursor:text}.g4-page .g4-name{font-size:30px;font-weight:800;text-align:center;letter-spacing:-.35px;outline:0}.g4-page .g4-headline{font-size:12px;font-weight:750;text-align:center;color:var(--accent);margin:6px 0 10px;outline:0}.g4-page .g4-contact{font-size:9px;color:#6e7c91;text-align:center;outline:0}.g4-page section{margin-top:23px}.g4-page section h2{font-size:10px;color:var(--accent);border-bottom:1px solid #dce2ea;padding-bottom:6px;margin:0 0 8px;letter-spacing:.07em}.g4-page p,.g4-page .g4-body{font-size:10px;line-height:1.56;color:#526078;margin:0;outline:0;white-space:normal}.g4-page .g4-body{white-space:pre-wrap}.g4-page.minimal{--accent:#374151}.g4-page.modern{--accent:#2563eb;border-top:9px solid #2563eb;padding-top:55px}.g4-page.modern .g4-name,.g4-page.modern .g4-headline,.g4-page.modern .g4-contact{text-align:left}.g4-page.technical{--accent:#0f766e;border-left:11px solid #0f766e;padding-left:55px}.g4-page.technical .g4-name,.g4-page.technical .g4-headline,.g4-page.technical .g4-contact{text-align:left}.g4-page.academic{--accent:#7c2d12;font-family:Georgia,serif}.g4-page.traditional{--accent:#111827;font-family:Georgia,serif}.g4-page.traditional .g4-name{text-transform:uppercase;letter-spacing:.08em;font-size:25px}.g4-page.executive{--accent:#6d28d9}.g4-page.executive .g4-name,.g4-page.executive .g4-headline,.g4-page.executive .g4-contact{text-align:left}.g4-page ul,.g4-page ol{margin:4px 0 6px 20px;padding:0;font-size:10px;line-height:1.56;color:#526078}.g4-page a{color:var(--accent)}
      .g4-template-menu{display:flex;align-items:center;gap:7px}.g4-template-menu label{font-size:9px;font-weight:800;color:#7d899d}.g4-status{font-size:9px;color:#7b879d}.g4-savebar{display:none;align-items:center;gap:9px;padding:7px 9px;background:#fff;border-top:1px solid #d9dfe8}.g4-savebar.show{display:flex}.g4-savebar span{font-size:9px;color:#536078}.g4-spacer{flex:1}.g4-toast{position:fixed;right:20px;bottom:20px;z-index:200000;background:#182033;color:#fff;padding:10px 13px;border-radius:9px;font:650 11px Inter;box-shadow:0 10px 30px rgba(0,0,0,.25)}
      @media(max-width:1100px){.g4-template-strip{grid-template-columns:repeat(3,minmax(0,1fr))}.g4-workspace{grid-template-columns:1fr}.g4-outline{display:none}.g4-page{width:720px;min-height:1018px}.g4-canvas{padding:20px}}
      @media(max-width:700px){#${HUB}{padding:15px}.g4-hub-head{flex-direction:column}.g4-template-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.g4-page{width:100%;min-height:1000px;padding:36px 25px}.g4-canvas{padding:12px}.g4-ruler{display:none}.g4-toolrow{align-items:flex-start;flex-direction:column}.g4-spacer{display:none}}
      #g4-print-root{display:none}
      @media print{body>*:not(#g4-print-root){display:none!important}#g4-print-root{display:block!important}.g4-page{box-shadow:none!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:18mm!important}}
    `;(document.head||document.documentElement).appendChild(s);
  }

  function computeModelFromEditor(){
    const e=document.getElementById(EDITOR);if(!e)return;
    const get=k=>clean(e.querySelector(`[data-field="${k}"]`)?.innerText||'');
    model.name=get('name')||model.name;model.headline=get('headline')||model.headline;
    const contact=clean(e.querySelector('.g4-contact')?.innerText||'');
    const parts=contact.split(/\s+·\s+/).map(clean).filter(Boolean);
    model.email=parts.find(x=>/@/.test(x))||model.email;model.phone=parts.find(x=>/\+?\d[\d\s().-]{7,}/.test(x)&&!/\./.test(x))||model.phone;model.location=parts.find(x=>x!==model.email&&x!==model.phone&&!/linkedin/i.test(x))||model.location;model.linkedin=parts.find(x=>/linkedin/i.test(x))||model.linkedin;
    for(const k of ['summary','experience','education','skills','projects','certifications']){const el=e.querySelector(`[data-field="${k}"]`);if(el)model[k]=el.innerText.trim()}
  }
  function markDirty(){dirty=true;const st=document.querySelector('.g4-status');if(st)st.textContent='Unsaved changes';document.querySelector('.g4-savebar')?.classList.add('show')}
  function exec(cmd,value=null){const ed=document.getElementById(EDITOR);if(!ed)return;ed.focus();try{document.execCommand(cmd,false,value)}catch(_){ }markDirty()}
  function selectionBlock(tag){exec('formatBlock',tag)}
  function insertPageBreak(){
    const ed=document.getElementById(EDITOR);if(!ed)return;ed.focus();
    const html='<div class="g4-page-break" data-page-break="1"><span>Page Break</span></div><p><br></p>';
    try{document.execCommand('insertHTML',false,html)}catch(_){ }
    markDirty();toast('Page break inserted.');
  }
  function addLink(){const url=prompt('Enter link URL');if(!url)return;exec('createLink',url)}
  function toggleCommand(cmd,b){exec(cmd);b?.classList.toggle('active')}

  function wireRibbon(){
    const o=document.getElementById(OVERLAY);if(!o||o.dataset.ribbon==='1')return;o.dataset.ribbon='1';
    o.addEventListener('mousedown',e=>{const b=e.target.closest('[data-cmd]');if(b)e.preventDefault()});
    o.addEventListener('click',e=>{
      const b=e.target.closest('[data-cmd]');
      if(b){const c=b.dataset.cmd; if(c==='link')addLink();else if(c==='pagebreak')insertPageBreak();else toggleCommand(c,b);return}
      const sec=e.target.closest('[data-outline]');if(sec){const target=document.querySelector(`#${EDITOR} [data-field="${sec.dataset.outline}"]`);target?.scrollIntoView({behavior:'smooth',block:'center'});target?.focus();return}
      const tpl=e.target.closest('[data-template]');if(tpl){applyTemplate(tpl.dataset.template);return}
      const s=e.target.closest('[data-template-select]');if(s){applyTemplate(s.value);return}
      const save=e.target.closest('[data-g4="save"]');if(save){chooseFormat();return}
      const close=e.target.closest('[data-g4="close"]');if(close){closeStudio();return}
      const imp=e.target.closest('[data-g4="import"]');if(imp){openImport();return}
      const profile=e.target.closest('[data-g4="profile"]');if(profile){openProfile();return}
      const b2=e.target.closest('[data-action]');if(b2){const a=b2.dataset.action;if(a==='undo')exec('undo');else if(a==='redo')exec('redo');else if(a==='clear')exec('removeFormat');else if(a==='font')return;}
    });
    o.addEventListener('change',e=>{
      const s=e.target.closest('[data-cmd-select]');if(s){exec(s.dataset.cmdSelect,s.value);return}
      const c=e.target.closest('[data-color]');if(c){exec(c.dataset.color,c.value);return}
      const t=e.target.closest('[data-template-select]');if(t){applyTemplate(t.value)}
    });
    o.addEventListener('input',e=>{if(e.target.closest(`#${EDITOR}`))markDirty()});
    o.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById(OVERLAY)?.classList.contains('open'))closeStudio()});
  }
  function applyTemplate(key){
    if(!TEMPLATES[key])return;
    computeModelFromEditor();
    template=key;dirty=true;
    const ed=document.getElementById(EDITOR);if(ed){ed.className='g4-page '+TEMPLATES[key].className;ed.style.setProperty('--accent',TEMPLATES[key].accent)}
    document.querySelectorAll('[data-template]').forEach(x=>x.classList.toggle('active',x.dataset.template===key));
    const sel=document.querySelector('[data-template-select]');if(sel)sel.value=key;
    const st=document.querySelector('.g4-status');if(st)st.textContent='Template changed — content preserved';
    updateSavebar();toast(`${TEMPLATES[key].name} template applied to your existing resume.`);
  }
  function updateSavebar(){document.querySelector('.g4-savebar')?.classList.toggle('show',dirty)}
  function editorHtml(){const e=document.getElementById(EDITOR);return e?.innerHTML||initialHtml||contentHtmlFromModel(model)}

  function ensureOverlay(){
    if(document.getElementById(OVERLAY))return;
    const o=document.createElement('div');o.id=OVERLAY;o.setAttribute('aria-hidden','true');
    o.innerHTML=`<div class="g4-panel">
      <div class="g4-top">
        <div><strong>Resume Studio</strong><span class="g4-status">Ready to edit</span></div>
        <div class="g4-hub-actions"><button class="g4-btn" data-g4="close">Close</button><button class="g4-btn" data-g4="save">Save to device</button></div>
      </div>
      <div class="g4-toolrow">
        <div class="g4-template-menu"><label>Template</label><select class="g4-select" data-template-select>${Object.entries(TEMPLATES).map(([k,t])=>`<option value="${k}">${t.name}</option>`).join('')}</select></div>
        <div class="g4-status">Click anywhere on the resume and type directly — just like Word.</div><div class="g4-spacer"></div>
        <button class="g4-btn" data-g4="import">Import</button><button class="g4-btn primary" data-g4="profile">Load profile resume</button>
      </div>
      <div class="g4-editor-shell">
        <div class="g4-ribbon">
          <span class="g4-format-label">Clipboard</span><button class="g4-tool" data-cmd="undo" title="Undo">↶</button><button class="g4-tool" data-cmd="redo" title="Redo">↷</button><span class="g4-sep"></span>
          <span class="g4-format-label">Font</span><select class="g4-select" data-cmd-select="fontName"><option value="Inter">Inter</option><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Times New Roman">Times New Roman</option><option value="Courier New">Courier New</option></select>
          <select class="g4-select" data-cmd-select="fontSize"><option value="2">10</option><option value="3" selected>12</option><option value="4">14</option><option value="5">18</option><option value="6">24</option><option value="7">32</option></select>
          <button class="g4-tool" data-cmd="bold"><b>B</b></button><button class="g4-tool" data-cmd="italic"><i>I</i></button><button class="g4-tool" data-cmd="underline"><u>U</u></button><button class="g4-tool" data-cmd="strikeThrough"><s>S</s></button><span class="g4-sep"></span>
          <button class="g4-tool" data-cmd="justifyLeft">≡</button><button class="g4-tool" data-cmd="justifyCenter">≡</button><button class="g4-tool" data-cmd="justifyRight">≡</button><button class="g4-tool" data-cmd="justifyFull">☰</button><span class="g4-sep"></span>
          <button class="g4-tool" data-cmd="insertUnorderedList">• List</button><button class="g4-tool" data-cmd="insertOrderedList">1. List</button><button class="g4-tool" data-cmd="outdent">←</button><button class="g4-tool" data-cmd="indent">→</button><span class="g4-sep"></span>
          <button class="g4-tool" data-cmd-select="formatBlock" value="p">Paragraph</button><button class="g4-tool" data-cmd="removeFormat">Clear format</button><button class="g4-tool" data-cmd="link">Link</button><button class="g4-tool" data-cmd="pagebreak">Page break</button>
          <label class="g4-tool g4-color" title="Text color">A<input type="color" data-color="foreColor" value="#263149"></label><label class="g4-tool g4-color" title="Highlight">▰<input type="color" data-color="hiliteColor" value="#fff59d"></label>
        </div>
        <div class="g4-ruler"></div>
        <div class="g4-workspace">
          <aside class="g4-outline"><h4>Document</h4>${FIELDS.filter(k=>k!=='contact').map(k=>`<button data-outline="${k}">${({name:'Personal Information',headline:'Headline',summary:'Summary',experience:'Experience',education:'Education',skills:'Skills',projects:'Projects',certifications:'Certifications'})[k]||k}</button>`).join('')}</aside>
          <main class="g4-canvas"><div id="${EDITOR}" class="g4-page ${TEMPLATES.minimal.className}" contenteditable="true" spellcheck="true" style="--accent:${TEMPLATES.minimal.accent}"></div></main>
        </div>
        <div class="g4-savebar"><span>Changes made. Save the resume or discard them.</span><div class="g4-spacer"></div><button class="g4-btn" data-cmd="discard">Discard</button><button class="g4-btn primary" data-g4="save">Save</button></div>
      </div>
    </div>`;
    o.style.cssText='position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;background:rgba(10,14,23,.62);backdrop-filter:blur(5px);padding:18px;box-sizing:border-box';
    const style=document.createElement('style');style.textContent=`#${OVERLAY}.open{display:flex}#${OVERLAY} .g4-panel{width:min(1450px,99vw);height:min(930px,96vh);background:#f2f4f7;border-radius:18px;overflow:hidden;box-shadow:0 30px 100px rgba(0,0,0,.42);display:flex;flex-direction:column;position:relative}#${OVERLAY} .g4-top{height:55px;background:#fff;border-bottom:1px solid #dde3ea;display:flex;align-items:center;justify-content:space-between;padding:0 14px 0 18px}#${OVERLAY} .g4-top strong{font-size:15px}#${OVERLAY} .g4-status{margin-left:9px;color:#7b879d;font-size:9px}`;o.appendChild(style);document.body.appendChild(o);wireRibbon();
  }

  function openStudio(html=null){ensureOverlay();const o=document.getElementById(OVERLAY),ed=document.getElementById(EDITOR);if(html!==null&&ed){ed.innerHTML=html} else if(ed&&!ed.innerHTML.trim()){ed.innerHTML=contentHtmlFromModel(model)}
    if(ed){ed.className='g4-page '+TEMPLATES[template].className;ed.style.setProperty('--accent',TEMPLATES[template].accent);ed.scrollTop=0}
    const sel=o.querySelector('[data-template-select]');if(sel)sel.value=template;o.classList.add('open');o.setAttribute('aria-hidden','false');updateSavebar();setTimeout(()=>ed?.focus(),0);
  }
  function closeStudio(){if(dirty){if(!confirm('You have unsaved changes. Close without saving?'))return;dirty=false}const o=document.getElementById(OVERLAY);if(o){o.classList.remove('open');o.setAttribute('aria-hidden','true')}updateSavebar()}

  async function openProfile(){
    try{toast('Loading your current resume…');await loadCandidateProfile();template='minimal';dirty=true;openStudio(contentHtmlFromModel(model));document.querySelector('.g4-status').textContent='Profile resume loaded — edit directly on the page';toast('Your existing resume is ready to edit.')}catch(e){toast(e?.message||'Could not load the profile resume.')}
  }
  function openImport(){
    if(!importInput){importInput=document.createElement('input');importInput.type='file';importInput.accept='.pdf,.docx,.txt';importInput.style.display='none';document.body.appendChild(importInput);importInput.addEventListener('change',async()=>{const f=importInput.files?.[0];importInput.value='';if(!f)return;try{model=await parseFile(f);template='minimal';dirty=true;openStudio(contentHtmlFromModel(model));toast('Resume imported. You can now edit the document directly.')}catch(e){toast(e?.message||'Could not import the resume.')}})}importInput.click();
  }

  function currentText(){computeModelFromEditor();return [model.name,model.headline,[model.email,model.phone,model.location,model.linkedin].filter(Boolean).join(' | '),'','PROFESSIONAL SUMMARY',model.summary,'','EXPERIENCE',model.experience,'','EDUCATION',model.education,'','SKILLS',model.skills,'','PROJECTS',model.projects,'','CERTIFICATIONS',model.certifications].filter(Boolean).join('\n')}
  function fileName(ext){const n=(clean(model.name)||'resume').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'resume';return `${n}.${ext}`}
  function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)}
  function exportTxt(){downloadBlob(new Blob([currentText()],{type:'text/plain;charset=utf-8'}),fileName('txt'));dirty=false;updateSavebar();toast('TXT saved to your device.')}
  function exportPdf(){
    computeModelFromEditor();const root=document.getElementById(EDITOR);if(!root)return;
    const clone=root.cloneNode(true);clone.contentEditable='false';
    const print=document.createElement('div');print.id='g4-print-root';print.appendChild(clone);document.body.appendChild(print);
    setTimeout(()=>{window.print();print.remove()},80);dirty=false;updateSavebar();toast('Print dialog opened — choose Save as PDF.');
  }
  async function exportDocx(){
    computeModelFromEditor();
    if(!window.docx){toast('Word export engine unavailable. Refresh once and try again.');return}
    const d=window.docx, children=[];
    const root=document.getElementById(EDITOR);
    const blocks=[...root.querySelectorAll('.g4-name,.g4-headline,.g4-contact,section')];
    for(const node of blocks){
      if(node.matches('.g4-name')) children.push(new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.TextRun({text:node.innerText.trim(),bold:true,size:32})]}));
      else if(node.matches('.g4-headline')) children.push(new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.TextRun({text:node.innerText.trim(),bold:true,size:20,color:TEMPLATES[template].accent.replace('#','')})]}));
      else if(node.matches('.g4-contact')) children.push(new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.TextRun({text:node.innerText.trim(),size:15,color:'65718A'})]}));
      else if(node.matches('section')){const h=node.querySelector('h2');if(h)children.push(new d.Paragraph({text:h.innerText.trim(),heading:d.HeadingLevel.HEADING_2}));const body=node.querySelector('[data-field]');if(body){for(const line of body.innerText.split(/\n/)){if(line.trim())children.push(new d.Paragraph({text:line.trim(),spacing:{after:90}}))}}}
    }
    try{const blob=await d.Packer.toBlob(new d.Document({sections:[{children}]}));downloadBlob(blob,fileName('docx'));dirty=false;updateSavebar();toast('Word document saved to your device.')}catch(e){toast(e?.message||'Could not create the Word file.')}
  }
  function chooseFormat(){
    const old=document.getElementById('g4-format');if(old)old.remove();const d=document.createElement('div');d.id='g4-format';d.style.cssText='position:fixed;inset:0;z-index:100005;display:flex;align-items:center;justify-content:center;background:rgba(10,14,23,.45)';d.innerHTML='<div style="width:min(430px,92vw);background:#fff;border-radius:14px;padding:20px;box-shadow:0 25px 80px rgba(0,0,0,.3);font-family:Inter,system-ui"><strong style="font-size:17px">Save resume</strong><p style="font-size:11px;color:#71809a;margin:6px 0 15px">Choose the file format to keep on your device.</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><button data-format="pdf" style="padding:13px;border:1px solid #dfe5ef;background:#fff;border-radius:9px;cursor:pointer"><b>PDF</b><small style="display:block;color:#7b879d;margin-top:4px">Print ready</small></button><button data-format="docx" style="padding:13px;border:1px solid #dfe5ef;background:#fff;border-radius:9px;cursor:pointer"><b>Word</b><small style="display:block;color:#7b879d;margin-top:4px">Editable .docx</small></button><button data-format="txt" style="padding:13px;border:1px solid #dfe5ef;background:#fff;border-radius:9px;cursor:pointer"><b>TXT</b><small style="display:block;color:#7b879d;margin-top:4px">Plain text</small></button></div><button data-cancel style="width:100%;margin-top:12px;padding:9px;border:1px solid #dfe5ef;background:#fff;border-radius:8px;cursor:pointer">Cancel</button></div>';
    document.body.appendChild(d);d.addEventListener('click',async e=>{if(e.target===d||e.target.closest('[data-cancel]')){d.remove();return}const f=e.target.closest('[data-format]');if(!f)return;d.remove();if(f.dataset.format==='pdf')exportPdf();else if(f.dataset.format==='docx')await exportDocx();else exportTxt()});
  }

  function renderHub(){
    const v=document.getElementById(VIEW);if(!v)return;installCss();document.getElementById(HUB)?.remove();
    const h=document.createElement('div');h.id=HUB;h.innerHTML=`<div class="g4-hub-head"><div><h1 class="g4-title">Resumes</h1><p class="g4-sub">A Word-style resume editor. Edit directly on the page, change templates without losing content, and save the finished file.</p></div><div class="g4-hub-actions"><button class="g4-btn" data-g4="import">↥ Import Resume</button><button class="g4-btn primary" data-g4="profile">Edit Current Resume</button></div></div><div class="g4-template-strip">${Object.entries(TEMPLATES).map(([k,t])=>`<div class="g4-template-card ${k===template?'active':''}" data-template="${k}"><div class="g4-thumb ${k}"></div><b>${t.name}</b><small>${t.tag}</small></div>`).join('')}</div>`;
    v.appendChild(h);
    h.addEventListener('click',e=>{const b=e.target.closest('[data-template]');if(b)openStudioWithTemplate(b.dataset.template);const a=e.target.closest('[data-g4]');if(a){if(a.dataset.g4==='import')openImport();else if(a.dataset.g4==='profile')openProfile()}});
  }
  function openStudioWithTemplate(key){template=key;openStudio();if(document.getElementById(EDITOR)?.innerHTML.trim())applyTemplate(key)}

  function start(){installCss();ensureOverlay();renderHub();window.addEventListener('glueful-initial-view-ready',e=>{if(e.detail?.view===VIEW){ensureOverlay();renderHub()}})}
  start();
})();