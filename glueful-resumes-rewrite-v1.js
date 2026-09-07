/* Glueful — Resumes Rewrite V1
 * Rebuilds the resume-library screen from scratch while preserving
 * the existing resume cards and their event handlers.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUMES_REWRITE_V1__) return;
  window.__GLUEFUL_RESUMES_REWRITE_V1__=true;

  const VIEW_ID='view-resume';
  const STYLE_ID='glueful-resumes-rewrite-v1-style';
  let built=false;

  function style(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      html body #view-resume.gf-resumes-rewrite{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;width:calc(100vw - 260px)!important;min-height:100vh!important;margin:0 0 0 260px!important;padding:0!important;box-sizing:border-box!important;background:#f7f8fb!important;color:#172033!important;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;overflow:auto!important;transform:none!important;}
      #view-resume.gf-resumes-rewrite .gfr-shell{min-height:100vh;padding:22px 30px 56px;box-sizing:border-box;}
      #view-resume.gf-resumes-rewrite .gfr-top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:26px;}
      #view-resume.gf-resumes-rewrite .gfr-brand{display:flex;align-items:center;gap:12px;}
      #view-resume.gf-resumes-rewrite .gfr-brand img{width:46px;height:46px;object-fit:contain;border-radius:13px;}
      #view-resume.gf-resumes-rewrite .gfr-brand-title{font-size:21px;font-weight:750;line-height:1.05;color:#172033;}
      #view-resume.gf-resumes-rewrite .gfr-date{font-size:12px;color:#8090ad;margin-top:3px;}
      #view-resume.gf-resumes-rewrite .gfr-profile{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#172033;color:#fff;border:0;cursor:pointer;box-shadow:0 4px 12px rgba(23,32,51,.12);}
      #view-resume.gf-resumes-rewrite .gfr-profile svg{width:18px;height:18px;}
      #view-resume.gf-resumes-rewrite .gfr-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:22px;}
      #view-resume.gf-resumes-rewrite .gfr-title{font-size:34px;font-weight:760;letter-spacing:-.7px;color:#172033;margin:0;}
      #view-resume.gf-resumes-rewrite .gfr-subtitle{font-size:15px;color:#71809d;margin:6px 0 0;}
      #view-resume.gf-resumes-rewrite .gfr-add{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 20px;border:0;border-radius:11px;background:linear-gradient(135deg,#7137e8,#4d72ff);color:#fff;font-size:14px;font-weight:750;box-shadow:0 7px 18px rgba(86,76,220,.18);cursor:pointer;white-space:nowrap;}
      #view-resume.gf-resumes-rewrite .gfr-add svg{width:17px;height:17px;}
      #view-resume.gf-resumes-rewrite .gfr-toolbar{display:flex;align-items:center;gap:12px;margin-bottom:22px;}
      #view-resume.gf-resumes-rewrite .gfr-search{flex:1;min-width:0;position:relative;}
      #view-resume.gf-resumes-rewrite .gfr-search-icon{position:absolute;left:17px;top:50%;transform:translateY(-50%);color:#71809d;pointer-events:none;}
      #view-resume.gf-resumes-rewrite .gfr-search-icon svg{width:18px;height:18px;}
      #view-resume.gf-resumes-rewrite .gfr-search input{width:100%!important;height:48px!important;box-sizing:border-box!important;padding:0 16px 0 50px!important;background:#fff!important;color:#172033!important;border:1px solid #dce3ef!important;border-radius:11px!important;outline:none!important;box-shadow:0 2px 8px rgba(24,34,56,.035)!important;font-size:14px!important;}
      #view-resume.gf-resumes-rewrite .gfr-search input:focus{border-color:#8d78ef!important;box-shadow:0 0 0 3px rgba(113,55,232,.09)!important;}
      #view-resume.gf-resumes-rewrite .gfr-search input::placeholder{color:#8a96ad!important;}
      #view-resume.gf-resumes-rewrite .gfr-filter{height:48px;min-width:122px;padding:0 16px;border:1px solid #dce3ef;border-radius:11px;background:#fff;color:#33415c;font-weight:650;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;}
      #view-resume.gf-resumes-rewrite .gfr-filter svg{width:16px;height:16px;}
      #view-resume.gf-resumes-rewrite .gfr-info{display:flex;align-items:center;gap:12px;padding:13px 16px;margin-bottom:28px;border:1px solid #d7e3ff;border-radius:11px;background:#f1f6ff;color:#5270b0;font-size:14px;line-height:1.4;}
      #view-resume.gf-resumes-rewrite .gfr-info svg{width:21px;height:21px;flex:0 0 auto;}
      #view-resume.gf-resumes-rewrite .gfr-list{display:flex;flex-direction:column;gap:18px;}
      #view-resume.gf-resumes-rewrite .gfr-company{background:#fff!important;border:1px solid #e0e6f0!important;border-radius:15px!important;box-shadow:0 4px 16px rgba(25,35,58,.045)!important;overflow:hidden!important;color:#172033!important;}
      #view-resume.gf-resumes-rewrite .gfr-company *{color:#172033!important;}
      #view-resume.gf-resumes-rewrite .gfr-company button,#view-resume.gf-resumes-rewrite .gfr-company a{cursor:pointer;}
      #view-resume.gf-resumes-rewrite .gfr-company img{background:transparent!important;}
      #view-resume.gf-resumes-rewrite .gfr-empty{padding:48px 24px;text-align:center;background:#fff;border:1px dashed #d7deeb;border-radius:15px;color:#73809a;}
      @media(max-width:1100px){#view-resume.gf-resumes-rewrite{width:calc(100vw - 260px)!important;margin-left:260px!important;}#view-resume.gf-resumes-rewrite .gfr-shell{padding:18px 20px 40px;}#view-resume.gf-resumes-rewrite .gfr-heading{align-items:flex-start;flex-direction:column;}#view-resume.gf-resumes-rewrite .gfr-add{align-self:flex-start;}}
      @media(max-width:700px){#view-resume.gf-resumes-rewrite .gfr-shell{padding:14px 14px 32px;}#view-resume.gf-resumes-rewrite .gfr-top{margin-bottom:18px;}#view-resume.gf-resumes-rewrite .gfr-toolbar{flex-direction:column;align-items:stretch;}#view-resume.gf-resumes-rewrite .gfr-filter{width:100%;}#view-resume.gf-resumes-rewrite .gfr-title{font-size:28px;}}
    `;
    document.head.appendChild(s);
  }

  function svg(type){
    const paths={
      plus:'<path d="M12 5v14M5 12h14"/>',
      search:'<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>',
      filter:'<path d="M4 6h16M7 12h10M10 18h4"></path>',
      info:'<circle cx="12" cy="12" r="9"></circle><path d="M12 10v6M12 7h.01"></path>',
      user:'<circle cx="12" cy="8" r="3"></circle><path d="M5 20c.8-3.5 3.1-5 7-5s6.2 1.5 7 5"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths[type]+'</svg>';
  }

  function dark(el){
    try{
      const c=getComputedStyle(el).backgroundColor||'';
      const m=c.match(/rgba?\\(([^)]+)\\)/i); if(!m)return false;
      const p=m[1].split(',').map(x=>parseFloat(x.trim()));
      return p.length>=3 && p[0]<90 && p[1]<95 && p[2]<110;
    }catch(_){return false;}
  }

  function companyCandidates(v){
    const marked=[...v.querySelectorAll('.gf-final-resume-company,.gf-resumes-v3-card')];
    const generic=[...v.querySelectorAll('div,section,article,li')].filter(el=>{
      const r=el.getBoundingClientRect();
      if(r.width<650 || r.height<75)return false;
      const t=(el.textContent||'').replace(/\\s+/g,' ').trim();
      if(!/\\bresume\\b/i.test(t))return false;
      return dark(el);
    });
    const all=[...new Set([...marked,...generic])];
    const roots=all.filter(el=>!all.some(other=>other!==el && other.contains(el)));
    return roots.sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top);
  }

  function findInput(v){return v.querySelector('input[type="search"],input[type="text"]');}
  function findFilter(v){return [...v.querySelectorAll('button')].find(b=>/filter/i.test((b.textContent||'').trim()));}
  function findAdd(v){return [...v.querySelectorAll('button,a,label')].find(b=>/add\\s+resume|upload\\s+resume|import\\s+resume|new\\s+resume/i.test((b.textContent||'').trim()));}
  function findLogo(v){return [...v.querySelectorAll('img')].find(i=>i.getBoundingClientRect().width>=25 && i.getBoundingClientRect().width<=80);}

  function cleanCompany(el){
    el.classList.add('gfr-company');
    el.removeAttribute('id');
    el.style.removeProperty('background');
    el.style.removeProperty('background-color');
    el.style.removeProperty('box-shadow');
    el.style.removeProperty('border');
    el.style.removeProperty('border-color');
    el.querySelectorAll('[style]').forEach(x=>{
      const keep=['width','height','object-fit','display','position','cursor','flex','flex-direction','align-items','justify-content','gap','padding','margin','grid-template-columns'];
      const css=x.getAttribute('style')||'';
      const out=css.split(';').filter(part=>keep.some(k=>part.trim().startsWith(k+':'))).join(';');
      if(out)x.setAttribute('style',out);else x.removeAttribute('style');
    });
    el.querySelectorAll('*').forEach(x=>{
      if(!x.matches('img,svg,canvas,input,button,a')) x.style.setProperty('color','#172033','important');
    });
    return el;
  }

  function build(){
    if(built)return;
    const v=document.getElementById(VIEW_ID); if(!v)return;
    const companies=companyCandidates(v);
    if(!companies.length){setTimeout(build,350);return;}

    const oldInput=findInput(v);
    const oldFilter=findFilter(v);
    const oldAdd=findAdd(v);
    const logo=findLogo(v);
    const oldProfile=v.querySelector('[aria-label*="profile" i], [title*="profile" i]');

    style();
    built=true;
    v.classList.add('gf-resumes-rewrite');

    const shell=document.createElement('div');shell.className='gfr-shell';
    const top=document.createElement('div');top.className='gfr-top';
    const brand=document.createElement('div');brand.className='gfr-brand';
    if(logo){
      const l=logo.cloneNode(true);l.removeAttribute('style');l.className='gfr-logo';brand.appendChild(l);
    }
    const bt=document.createElement('div');
    bt.innerHTML='<div class="gfr-brand-title">Glueful</div><div class="gfr-date">Monday, Sep 7</div>';
    brand.appendChild(bt);top.appendChild(brand);
    const profile=document.createElement('button');profile.className='gfr-profile';profile.type='button';profile.innerHTML=svg('user');
    if(oldProfile)profile.addEventListener('click',()=>oldProfile.click());
    top.appendChild(profile);shell.appendChild(top);

    const heading=document.createElement('div');heading.className='gfr-heading';
    heading.innerHTML='<div><h1 class="gfr-title">Resumes</h1><p class="gfr-subtitle">Your resumes, organized by company</p></div>';
    const add=document.createElement('button');add.type='button';add.className='gfr-add';add.innerHTML=svg('plus')+'<span>Add Resume</span>';
    if(oldAdd)add.addEventListener('click',()=>oldAdd.click());
    else{const file=v.querySelector('input[type=file]');if(file)add.addEventListener('click',()=>file.click());}
    heading.appendChild(add);shell.appendChild(heading);

    const toolbar=document.createElement('div');toolbar.className='gfr-toolbar';
    const searchWrap=document.createElement('div');searchWrap.className='gfr-search';searchWrap.innerHTML='<span class="gfr-search-icon">'+svg('search')+'</span>';
    if(oldInput){oldInput.removeAttribute('style');oldInput.className='';oldInput.placeholder=oldInput.placeholder||'Search company or resume name...';searchWrap.appendChild(oldInput);}
    else{const inp=document.createElement('input');inp.type='search';inp.placeholder='Search company or resume name...';searchWrap.appendChild(inp);}
    toolbar.appendChild(searchWrap);
    const filter=document.createElement('button');filter.type='button';filter.className='gfr-filter';filter.innerHTML=svg('filter')+'<span>Filter</span><span>⌄</span>';
    if(oldFilter)filter.addEventListener('click',()=>oldFilter.click());
    toolbar.appendChild(filter);shell.appendChild(toolbar);

    const info=document.createElement('div');info.className='gfr-info';info.innerHTML=svg('info')+'<span>Resumes are grouped by the companies where you used them. Search by company or resume name.</span>';shell.appendChild(info);
    const list=document.createElement('div');list.className='gfr-list';
    companies.forEach(c=>list.appendChild(cleanCompany(c)));
    shell.appendChild(list);

    while(v.firstChild)v.removeChild(v.firstChild);
    v.appendChild(shell);

    // Keep search behavior working if the original input had no useful handler.
    const input=searchWrap.querySelector('input');
    if(input)input.addEventListener('input',()=>{
      const q=input.value.trim().toLowerCase();
      list.querySelectorAll('.gfr-company').forEach(card=>{card.style.display=!q||card.textContent.toLowerCase().includes(q)?'':'none';});
    });
  }

  function start(){
    style();
    [150,500,1000,1800,3000,5000].forEach(ms=>setTimeout(build,ms));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
