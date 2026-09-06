/* Glueful — Interviews Final Layout V1
 * Final presentation guard. Runs after feature loading and corrects the legacy
 * Interviews empty state without deleting interview data or action handlers.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_INTERVIEWS_FINAL_LAYOUT_V1__) return;
  window.__GLUEFUL_INTERVIEWS_FINAL_LAYOUT_V1__=true;
  const STYLE='glueful-interviews-final-layout-v1-style';
  const UI='glueful-interviews-final-v1';
  function txt(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim();}
  function originalAdd(v){return Array.from(v.querySelectorAll('button')).find(b=>!b.closest('.'+UI+'-shell')&&/add/i.test(txt(b)))||null;}
  function legacyEmpty(v){
    const hit=Array.from(v.querySelectorAll('*')).find(e=>txt(e)==='No interviews yet.');
    if(!hit)return null;
    let p=hit;
    for(let i=0;p&&p!==v&&i<8;i++,p=p.parentElement){
      const c=getComputedStyle(p);
      if(c.borderStyle.indexOf('dashed')>=0||/empty/i.test(String(p.className||'')))return p;
    }
    return hit;
  }
  function installStyle(){
    let s=document.getElementById(STYLE); if(s)return;
    s=document.createElement('style');s.id=STYLE;
    s.textContent=`
      @media(min-width:768px){
        #view-interviews.${UI}-owned{box-sizing:border-box!important;}
        #view-interviews .${UI}-shell{display:block!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;box-sizing:border-box!important;}
        #view-interviews .${UI}-shell *{box-sizing:border-box!important;}
      }
      @media(min-width:1280px){
        #view-interviews.${UI}-owned{position:fixed!important;left:260px!important;right:0!important;top:0!important;bottom:0!important;width:auto!important;height:100vh!important;margin:0!important;padding:16px 64px 48px!important;background:#f7f8fc!important;overflow-x:hidden!important;overflow-y:auto!important;}
        #view-interviews .${UI}-header{height:54px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;margin:0 0 34px!important;}
        #view-interviews .${UI}-brand{display:flex!important;align-items:center!important;gap:10px!important;}
        #view-interviews .${UI}-brand img{width:38px!important;height:38px!important;border-radius:10px!important;object-fit:cover!important;}
        #view-interviews .${UI}-brand-name{font-size:20px!important;font-weight:760!important;line-height:1.05!important;color:#172033!important;}
        #view-interviews .${UI}-date{font-size:11px!important;line-height:1.2!important;color:#7b8497!important;margin-top:3px!important;}
        #view-interviews .${UI}-profile{width:38px!important;height:38px!important;border:0!important;border-radius:50%!important;background:#172033!important;color:#fff!important;display:grid!important;place-items:center!important;font-size:16px!important;}
        #view-interviews .${UI}-hero{position:relative!important;display:block!important;width:100%!important;}
        #view-interviews .${UI}-title{margin:0!important;font-size:34px!important;line-height:1.08!important;font-weight:760!important;letter-spacing:-1px!important;color:#172033!important;}
        #view-interviews .${UI}-subtitle{margin:5px 0 0!important;font-size:15px!important;line-height:1.45!important;color:#66728a!important;}
        #view-interviews .${UI}-add{position:absolute!important;right:0!important;top:0!important;height:46px!important;padding:0 20px!important;border:0!important;border-radius:12px!important;background:linear-gradient(135deg,#6b38ee,#2f68ff)!important;color:#fff!important;font-size:14px!important;font-weight:700!important;cursor:pointer!important;}
        #view-interviews .${UI}-toolbar{display:flex!important;align-items:center!important;justify-content:space-between!important;width:100%!important;min-height:42px!important;margin:29px 0 24px!important;gap:20px!important;}
        #view-interviews .${UI}-tabs{display:flex!important;align-items:center!important;gap:8px!important;}
        #view-interviews .${UI}-tab{height:42px!important;padding:0 18px!important;border:0!important;border-radius:10px!important;background:transparent!important;color:#1d2940!important;font-size:14px!important;font-weight:650!important;cursor:pointer!important;white-space:nowrap!important;}
        #view-interviews .${UI}-tab.active{background:#e9edff!important;color:#2865ef!important;}
        #view-interviews .${UI}-tools{display:flex!important;align-items:center!important;gap:12px!important;margin-left:auto!important;}
        #view-interviews .${UI}-search{width:310px!important;height:42px!important;padding:0 14px!important;border:1px solid #d7dce7!important;border-radius:10px!important;background:#fff!important;font-size:14px!important;outline:none!important;}
        #view-interviews .${UI}-filter{height:42px!important;padding:0 17px!important;border:1px solid #cfd6e4!important;border-radius:10px!important;background:#fff!important;font-size:14px!important;font-weight:650!important;cursor:pointer!important;}
        #view-interviews .${UI}-empty{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;width:100%!important;height:305px!important;border:1px dashed #9aa3b4!important;border-radius:13px!important;background:transparent!important;text-align:center!important;}
        #view-interviews .${UI}-empty-icon{font-size:38px!important;line-height:1!important;margin-bottom:17px!important;}
        #view-interviews .${UI}-empty-title{font-size:21px!important;line-height:1.25!important;font-weight:500!important;color:#243047!important;}
        #view-interviews .${UI}-empty-copy{margin:12px 0 16px!important;font-size:14px!important;line-height:1.45!important;color:#718098!important;}
        #view-interviews .${UI}-empty-add{height:46px!important;padding:0 20px!important;border:0!important;border-radius:11px!important;background:linear-gradient(135deg,#6b38ee,#2f68ff)!important;color:#fff!important;font-size:14px!important;font-weight:700!important;cursor:pointer!important;}
        #view-interviews .${UI}-legacy-hidden{display:none!important;}
      }
      @media(min-width:768px) and (max-width:1279px){
        #view-interviews.${UI}-owned{margin-left:260px!important;width:calc(100vw - 260px)!important;padding:26px!important;box-sizing:border-box!important;overflow-x:hidden!important;}
      }
      @media(max-width:767px){#view-interviews .${UI}-tabs{overflow-x:auto!important;}#view-interviews .${UI}-toolbar{flex-wrap:wrap!important;}#view-interviews .${UI}-tools{width:100%!important;}#view-interviews .${UI}-search{width:100%!important;}}
    `;
    document.head.appendChild(s);
  }
  function build(v){
    if(v.querySelector('.'+UI+'-shell'))return;
    const empty=legacyEmpty(v); if(!empty)return;
    const add=originalAdd(v);
    const shell=document.createElement('section');shell.className=UI+'-shell';
    const header=document.createElement('div');header.className=UI+'-header';
    const brand=document.createElement('div');brand.className=UI+'-brand';
    const img=document.querySelector('#glueful-drawer img, aside img, nav img');if(img)brand.appendChild(img.cloneNode(true));
    const bt=document.createElement('div');const now=new Date();
    bt.innerHTML='<div class="'+UI+'-brand-name">Glueful</div><div class="'+UI+'-date">'+new Intl.DateTimeFormat(undefined,{weekday:'long',month:'short',day:'numeric'}).format(now)+'</div>';
    brand.appendChild(bt);header.appendChild(brand);
    const profile=document.querySelector('#glueful-drawer ~ button, body > button[aria-label*="profile" i], .profile-button');
    const pb=document.createElement('button');pb.type='button';pb.className=UI+'-profile';pb.textContent='♙';header.appendChild(pb);shell.appendChild(header);
    const hero=document.createElement('div');hero.className=UI+'-hero';
    const h=document.createElement('h1');h.className=UI+'-title';h.textContent='Interviews';
    const sub=document.createElement('div');sub.className=UI+'-subtitle';sub.textContent='Never miss an interview';
    const top=document.createElement('button');top.type='button';top.className=UI+'-add';top.textContent='＋  Add Interview';top.onclick=function(){if(add)add.click();};
    hero.append(h,sub,top);shell.appendChild(hero);
    const toolbar=document.createElement('div');toolbar.className=UI+'-toolbar';
    const tabs=document.createElement('div');tabs.className=UI+'-tabs';
    ['All','Upcoming','Past','Today','This Week'].forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.className=UI+'-tab'+(i===0?' active':'');b.textContent=name;b.onclick=function(){tabs.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');};tabs.appendChild(b);});
    const tools=document.createElement('div');tools.className=UI+'-tools';
    const search=document.createElement('input');search.type='search';search.className=UI+'-search';search.placeholder='Search interviews...';
    const filter=document.createElement('button');filter.type='button';filter.className=UI+'-filter';filter.textContent='▽  Filter';tools.append(search,filter);toolbar.append(tabs,tools);shell.appendChild(toolbar);
    const es=document.createElement('div');es.className=UI+'-empty';
    es.innerHTML='<div class="'+UI+'-empty-icon">▦</div><div class="'+UI+'-empty-title">No interviews yet.</div><div class="'+UI+'-empty-copy">Add your first interview to keep track of your upcoming rounds.</div>';
    const ea=document.createElement('button');ea.type='button';ea.className=UI+'-empty-add';ea.textContent='＋  Add Interview';ea.onclick=function(){if(add)add.click();};es.appendChild(ea);shell.appendChild(es);
    empty.classList.add(UI+'-legacy-hidden');
    v.querySelectorAll('.view-title').forEach(e=>e.classList.add(UI+'-legacy-hidden'));
    v.querySelectorAll('button').forEach(b=>{if(b!==top&&b!==ea&&!b.closest('.'+UI+'-shell')&&/add/i.test(txt(b)))b.classList.add(UI+'-legacy-hidden');});
    v.insertBefore(shell,v.firstChild);v.classList.add(UI+'-owned');
  }
  function run(){installStyle();const v=document.getElementById('view-interviews');if(v)build(v);}
  run();
  const mo=new MutationObserver(function(){run();});
  mo.observe(document.documentElement,{childList:true,subtree:true});
  [250,750,1500,3000,6000].forEach(t=>setTimeout(run,t));
})();
