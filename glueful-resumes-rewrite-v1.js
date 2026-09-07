/* Glueful — Resume Library Rewrite V2
 * Standalone light-theme library UI. Reuses the rendered resume-company nodes
 * so existing expand/open/edit/delete behavior remains attached.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_RESUMES_REWRITE_V2__) return;
  window.__GLUEFUL_RESUMES_REWRITE_V2__=true;

  var VIEW_ID='view-resume';
  var STYLE_ID='glueful-resumes-rewrite-v2-style';
  var built=false;

  function addStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=''
      +'html body #view-resume.gf-resumes-rewrite{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;width:calc(100vw - 260px)!important;min-height:100vh!important;margin:0 0 0 260px!important;padding:0!important;box-sizing:border-box!important;background:#f7f8fb!important;color:#172033!important;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;overflow:auto!important;transform:none!important;}'
      +'#view-resume.gf-resumes-rewrite .gfr-shell{min-height:100vh;padding:22px 30px 56px;box-sizing:border-box;}'
      +'#view-resume.gf-resumes-rewrite .gfr-top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:26px;}'
      +'#view-resume.gf-resumes-rewrite .gfr-brand{display:flex;align-items:center;gap:12px;}'
      +'#view-resume.gf-resumes-rewrite .gfr-brand img{width:46px;height:46px;object-fit:contain;border-radius:13px;}'
      +'#view-resume.gf-resumes-rewrite .gfr-brand-title{font-size:21px;font-weight:750;line-height:1.05;color:#172033;}'
      +'#view-resume.gf-resumes-rewrite .gfr-date{font-size:12px;color:#8090ad;margin-top:3px;}'
      +'#view-resume.gf-resumes-rewrite .gfr-profile{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#172033;color:#fff;border:0;cursor:pointer;box-shadow:0 4px 12px rgba(23,32,51,.12);}'
      +'#view-resume.gf-resumes-rewrite .gfr-profile svg{width:18px;height:18px;}'
      +'#view-resume.gf-resumes-rewrite .gfr-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:22px;}'
      +'#view-resume.gf-resumes-rewrite .gfr-title{font-size:34px;font-weight:760;letter-spacing:-.7px;color:#172033;margin:0;}'
      +'#view-resume.gf-resumes-rewrite .gfr-subtitle{font-size:15px;color:#71809d;margin:6px 0 0;}'
      +'#view-resume.gf-resumes-rewrite .gfr-add{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 20px;border:0;border-radius:11px;background:linear-gradient(135deg,#7137e8,#4d72ff);color:#fff;font-size:14px;font-weight:750;box-shadow:0 7px 18px rgba(86,76,220,.18);cursor:pointer;white-space:nowrap;}'
      +'#view-resume.gf-resumes-rewrite .gfr-toolbar{display:flex;align-items:center;gap:12px;margin-bottom:22px;}'
      +'#view-resume.gf-resumes-rewrite .gfr-search{flex:1;min-width:0;position:relative;}'
      +'#view-resume.gf-resumes-rewrite .gfr-search-icon{position:absolute;left:17px;top:50%;transform:translateY(-50%);color:#71809d;pointer-events:none;}'
      +'#view-resume.gf-resumes-rewrite .gfr-search-icon svg{width:18px;height:18px;}'
      +'#view-resume.gf-resumes-rewrite .gfr-search input{width:100%!important;height:48px!important;box-sizing:border-box!important;padding:0 16px 0 50px!important;background:#fff!important;color:#172033!important;border:1px solid #dce3ef!important;border-radius:11px!important;outline:none!important;box-shadow:0 2px 8px rgba(24,34,56,.035)!important;font-size:14px!important;}'
      +'#view-resume.gf-resumes-rewrite .gfr-search input::placeholder{color:#8a96ad!important;}'
      +'#view-resume.gf-resumes-rewrite .gfr-filter{height:48px;min-width:122px;padding:0 16px;border:1px solid #dce3ef;border-radius:11px;background:#fff;color:#33415c;font-weight:650;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;}'
      +'#view-resume.gf-resumes-rewrite .gfr-filter svg{width:16px;height:16px;}'
      +'#view-resume.gf-resumes-rewrite .gfr-info{display:flex;align-items:center;gap:12px;padding:13px 16px;margin-bottom:28px;border:1px solid #d7e3ff;border-radius:11px;background:#f1f6ff;color:#5270b0;font-size:14px;line-height:1.4;}'
      +'#view-resume.gf-resumes-rewrite .gfr-info svg{width:21px;height:21px;flex:0 0 auto;}'
      +'#view-resume.gf-resumes-rewrite .gfr-list{display:flex;flex-direction:column;gap:18px;}'
      +'#view-resume.gf-resumes-rewrite .gfr-company{background:#fff!important;border:1px solid #e0e6f0!important;border-radius:15px!important;box-shadow:0 4px 16px rgba(25,35,58,.045)!important;overflow:hidden!important;color:#172033!important;}'
      +'#view-resume.gf-resumes-rewrite .gfr-company *{color:#172033!important;}'
      +'#view-resume.gf-resumes-rewrite .gfr-company img{background:transparent!important;}'
      +'#view-resume.gf-resumes-rewrite .gfr-company button,#view-resume.gf-resumes-rewrite .gfr-company a{cursor:pointer;}'
      +'@media(max-width:700px){#view-resume.gf-resumes-rewrite .gfr-shell{padding:14px 14px 32px;}#view-resume.gf-resumes-rewrite .gfr-top{margin-bottom:18px;}#view-resume.gf-resumes-rewrite .gfr-toolbar{flex-direction:column;align-items:stretch;}#view-resume.gf-resumes-rewrite .gfr-filter{width:100%;}#view-resume.gf-resumes-rewrite .gfr-title{font-size:28px;}}';
    document.head.appendChild(s);
  }

  function icon(kind){
    var p={plus:'<path d="M12 5v14M5 12h14"/>',search:'<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>',filter:'<path d="M4 6h16M7 12h10M10 18h4"></path>',info:'<circle cx="12" cy="12" r="9"></circle><path d="M12 10v6M12 7h.01"></path>',user:'<circle cx="12" cy="8" r="3"></circle><path d="M5 20c.8-3.5 3.1-5 7-5s6.2 1.5 7 5"></path>'};
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+p[kind]+'</svg>';
  }

  function text(el){return (el.textContent||'').replace(/\s+/g,' ').trim();}

  function isCompanyLike(el){
    if(!el || el===document.body) return false;
    var r=el.getBoundingClientRect();
    if(r.width<500 || r.height<70) return false;
    var t=text(el);
    if(!/\bresume\b/i.test(t)) return false;
    var imgs=el.querySelectorAll('img');
    return imgs.length>0;
  }

  function findCompanies(v){
    var marked=Array.prototype.slice.call(v.querySelectorAll('.gf-final-resume-company,.gf-resumes-v3-card'));
    var pool=Array.prototype.slice.call(v.querySelectorAll('div,section,article,li'));
    var found=marked.slice();
    pool.forEach(function(el){if(isCompanyLike(el))found.push(el);});
    var unique=[];
    found.forEach(function(el){if(unique.indexOf(el)<0)unique.push(el);});
    unique=unique.filter(function(el){return !unique.some(function(other){return other!==el && other.contains(el);});});
    unique.sort(function(a,b){return a.getBoundingClientRect().top-b.getBoundingClientRect().top;});
    return unique;
  }

  function firstButton(v,patterns){
    var all=Array.prototype.slice.call(v.querySelectorAll('button,a,label'));
    for(var i=0;i<all.length;i++){var t=text(all[i]);for(var j=0;j<patterns.length;j++){if(patterns[j].test(t))return all[i];}}
    return null;
  }

  function findSearch(v){return v.querySelector('input[type="search"],input[type="text"],input[placeholder*="Search" i]');}
  function findFile(v){return v.querySelector('input[type="file"]');}

  function stripPresentation(el){
    el.classList.add('gfr-company');
    el.removeAttribute('id');
    el.style.removeProperty('background');
    el.style.removeProperty('background-color');
    el.style.removeProperty('box-shadow');
    el.style.removeProperty('border');
    el.style.removeProperty('border-color');
    el.querySelectorAll('[style]').forEach(function(x){
      var keep=['width','height','object-fit','display','position','cursor','flex','flex-direction','align-items','justify-content','gap','padding','margin','grid-template-columns'];
      var parts=(x.getAttribute('style')||'').split(';');
      var kept=parts.filter(function(part){var p=part.trim().split(':')[0];return keep.indexOf(p)>=0;});
      if(kept.length)x.setAttribute('style',kept.join(';'));else x.removeAttribute('style');
    });
  }

  function build(){
    if(built)return;
    var v=document.getElementById(VIEW_ID);
    if(!v)return;
    var companies=findCompanies(v);
    if(!companies.length){setTimeout(build,500);return;}

    var oldSearch=findSearch(v);
    var oldFilter=firstButton(v,[/filter/i]);
    var oldAdd=firstButton(v,[/add\s+resume/i,/upload\s+resume/i,/import\s+resume/i,/new\s+resume/i]);
    var oldProfile=firstButton(v,[/profile/i]);

    addStyle();
    built=true;
    v.classList.add('gf-resumes-rewrite');

    var shell=document.createElement('div');shell.className='gfr-shell';
    var top=document.createElement('div');top.className='gfr-top';
    var brand=document.createElement('div');brand.className='gfr-brand';
    var logo=document.createElement('img');logo.src='./icons/icon-192.png';logo.alt='Glueful';brand.appendChild(logo);
    var bt=document.createElement('div');bt.innerHTML='<div class="gfr-brand-title">Glueful</div><div class="gfr-date">Monday, Sep 7</div>';brand.appendChild(bt);top.appendChild(brand);
    var profile=document.createElement('button');profile.type='button';profile.className='gfr-profile';profile.innerHTML=icon('user');
    if(oldProfile)profile.addEventListener('click',function(){oldProfile.click();});
    top.appendChild(profile);shell.appendChild(top);

    var heading=document.createElement('div');heading.className='gfr-heading';
    heading.innerHTML='<div><h1 class="gfr-title">Resumes</h1><p class="gfr-subtitle">Your resumes, organized by company</p></div>';
    var add=document.createElement('button');add.type='button';add.className='gfr-add';add.innerHTML=icon('plus')+'<span>Add Resume</span>';
    if(oldAdd)add.addEventListener('click',function(){oldAdd.click();});else{var file=findFile(v);if(file)add.addEventListener('click',function(){file.click();});}
    heading.appendChild(add);shell.appendChild(heading);

    var toolbar=document.createElement('div');toolbar.className='gfr-toolbar';
    var searchWrap=document.createElement('div');searchWrap.className='gfr-search';searchWrap.innerHTML='<span class="gfr-search-icon">'+icon('search')+'</span>';
    var search=oldSearch;
    if(search){search.removeAttribute('style');search.className='';search.type='search';search.placeholder='Search company or resume name...';searchWrap.appendChild(search);}else{search=document.createElement('input');search.type='search';search.placeholder='Search company or resume name...';searchWrap.appendChild(search);}
    toolbar.appendChild(searchWrap);
    var filter=document.createElement('button');filter.type='button';filter.className='gfr-filter';filter.innerHTML=icon('filter')+'<span>Filter</span><span>⌄</span>';if(oldFilter)filter.addEventListener('click',function(){oldFilter.click();});toolbar.appendChild(filter);shell.appendChild(toolbar);

    var info=document.createElement('div');info.className='gfr-info';info.innerHTML=icon('info')+'<span>Resumes are grouped by the companies where you used them. Search by company or resume name.</span>';shell.appendChild(info);
    var list=document.createElement('div');list.className='gfr-list';companies.forEach(function(c){stripPresentation(c);list.appendChild(c);});shell.appendChild(list);

    while(v.firstChild)v.removeChild(v.firstChild);
    v.appendChild(shell);

    search.addEventListener('input',function(){
      var q=(search.value||'').trim().toLowerCase();
      Array.prototype.forEach.call(list.children,function(card){card.style.display=!q||text(card).toLowerCase().indexOf(q)>=0?'':'none';});
    });
  }

  function start(){
    addStyle();
    [250,700,1400,2500,4000,6500].forEach(function(ms){setTimeout(build,ms);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
