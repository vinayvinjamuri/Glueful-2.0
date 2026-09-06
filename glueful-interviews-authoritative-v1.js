/* Glueful Interviews — Authoritative presentation shell V5
 * Reference presentation only; existing interview rendering and actions stay intact.
 */
(function(){
'use strict';
if(window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V5__)return;
window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V5__=true;
const VIEW='view-interviews',STYLE='glueful-interviews-authoritative-v5-style',UI='glueful-interviews-reference-v5';
function install(){
 if(document.getElementById(STYLE))return;
 const s=document.createElement('style');s.id=STYLE;
 s.textContent=`
html,body{overflow-x:hidden!important}
@media(min-width:1280px){
 body #${VIEW}{position:fixed!important;left:245px!important;right:0!important;top:0!important;bottom:0!important;width:auto!important;height:100vh!important;min-height:100vh!important;margin:0!important;padding:16px 44px 48px 48px!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;background:#f7f8fc!important;}
 body #${VIEW}>.${UI}-shell{display:block!important;width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding:0!important;box-sizing:border-box!important;}
 body #${VIEW} .${UI}-header{height:54px!important;width:100%!important;display:flex!important;align-items:center!important;justify-content:space-between!important;margin:0 0 34px!important;box-sizing:border-box!important;}
 body #${VIEW} .${UI}-brand{display:flex!important;align-items:center!important;gap:10px!important;}
 body #${VIEW} .${UI}-brand img{width:38px!important;height:38px!important;border-radius:10px!important;object-fit:cover!important;box-shadow:0 3px 12px rgba(73,42,180,.22)!important;}
 body #${VIEW} .${UI}-brand-name{font-size:20px!important;font-weight:760!important;color:#172033!important;line-height:1.05!important;}
 body #${VIEW} .${UI}-date{font-size:11px!important;color:#7b8497!important;margin-top:3px!important;}
 body #${VIEW} .${UI}-profile{width:38px!important;height:38px!important;border:0!important;border-radius:50%!important;background:#172033!important;color:#fff!important;display:grid!important;place-items:center!important;font-size:16px!important;}
 body #${VIEW} .${UI}-hero{position:relative!important;width:100%!important;margin:0!important;display:block!important;}
 body #${VIEW} .${UI}-hero-title{font-size:34px!important;line-height:1.08!important;font-weight:760!important;letter-spacing:-1px!important;color:#172033!important;margin:0!important;}
 body #${VIEW} .${UI}-subtitle{font-size:15px!important;line-height:1.45!important;color:#66728a!important;margin:5px 0 0!important;}
 body #${VIEW} .${UI}-top-add{position:absolute!important;right:0!important;top:0!important;height:46px!important;padding:0 20px!important;border:0!important;border-radius:12px!important;background:linear-gradient(135deg,#6b38ee,#2f68ff)!important;color:#fff!important;font-weight:700!important;font-size:14px!important;cursor:pointer!important;}
 body #${VIEW} .${UI}-toolbar{display:flex!important;width:100%!important;align-items:center!important;justify-content:space-between!important;margin:29px 0 24px!important;gap:20px!important;box-sizing:border-box!important;min-height:42px!important;}
 body #${VIEW} .${UI}-tabs{display:flex!important;align-items:center!important;gap:8px!important;}
 body #${VIEW} .${UI}-tab{height:42px!important;padding:0 18px!important;border:0!important;background:transparent!important;border-radius:10px!important;color:#1d2940!important;font-size:14px!important;font-weight:650!important;cursor:pointer!important;white-space:nowrap!important;}
 body #${VIEW} .${UI}-tab.active{background:#e9edff!important;color:#2865ef!important;}
 body #${VIEW} .${UI}-tools{display:flex!important;align-items:center!important;gap:12px!important;}
 body #${VIEW} .${UI}-search-wrap{position:relative!important;display:block!important;width:310px!important;height:42px!important;}
 body #${VIEW} .${UI}-search-icon{position:absolute!important;left:14px!important;top:10px!important;color:#66728a!important;font-size:18px!important;line-height:22px!important;pointer-events:none!important;z-index:2!important;}
 body #${VIEW} .${UI}-search{display:block!important;width:310px!important;height:42px!important;border:1px solid #d7dce7!important;border-radius:10px!important;background:#fff!important;padding:0 14px 0 42px!important;font-size:14px!important;outline:none!important;box-sizing:border-box!important;}
 body #${VIEW} .${UI}-filter{height:42px!important;padding:0 17px!important;border:1px solid #cfd6e4!important;border-radius:10px!important;background:#fff!important;color:#172033!important;font-weight:650!important;font-size:14px!important;white-space:nowrap!important;}
 body #${VIEW} .${UI}-empty{width:100%!important;height:305px!important;min-height:305px!important;border:1px dashed #9aa3b4!important;border-radius:13px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;box-sizing:border-box!important;}
 body #${VIEW} .${UI}-empty-icon{display:block!important;font-size:38px!important;line-height:1!important;margin:0 0 17px!important;}
 body #${VIEW} .${UI}-empty-title{display:block!important;font-size:21px!important;line-height:1.25!important;font-weight:500!important;color:#243047!important;}
 body #${VIEW} .${UI}-empty-copy{display:block!important;font-size:14px!important;line-height:1.45!important;color:#718098!important;margin:12px 0 16px!important;}
 body #${VIEW} .${UI}-empty-add{display:inline-flex!important;align-items:center!important;justify-content:center!important;height:46px!important;padding:0 20px!important;border:0!important;border-radius:11px!important;background:linear-gradient(135deg,#6b38ee,#2f68ff)!important;color:#fff!important;font-weight:700!important;font-size:14px!important;}
 body #${VIEW} .glueful-interviews-reference-v4-legacy-hidden,body #${VIEW} .${UI}-legacy-hidden{display:none!important;}
}
@media(max-width:1279px){body #${VIEW} .${UI}-shell{width:100%!important;max-width:none!important;}body #${VIEW} .${UI}-header{display:none!important;}body #${VIEW} .${UI}-toolbar{display:flex!important;flex-wrap:wrap!important;}body #${VIEW} .${UI}-tools{max-width:100%!important;}body #${VIEW} .${UI}-search{max-width:100%!important;}}
`;
 (document.head||document.documentElement).appendChild(s);
}
function txt(e){return(e&&e.textContent||'').replace(/\s+/g,' ').trim()}
function title(v){return v.querySelector('.view-title')||v.querySelector('h1')}
function empty(v){for(const e of v.querySelectorAll('*'))if(txt(e)==='No interviews yet.')for(let p=e,i=0;p&&p!==v&&i<8;p=p.parentElement,i++){const c=getComputedStyle(p);if(c.borderStyle.includes('dashed')||/empty/i.test(p.className||''))return p}return null}
function add(v){return Array.from(v.querySelectorAll('button')).find(b=>/add/i.test(txt(b))&&!b.closest('[class*="reference-v5"]')&&!b.closest('[class*="reference-v4"]'))}
function makeShell(v,t,e,a){
 const shell=document.createElement('section');shell.className=UI+'-shell';
 const header=document.createElement('div');header.className=UI+'-header';
 const brand=document.createElement('div');brand.className=UI+'-brand';
 const logo=document.querySelector('aside img,nav img');if(logo)brand.appendChild(logo.cloneNode(true));
 const btxt=document.createElement('div');btxt.innerHTML='<div class="'+UI+'-brand-name">Glueful</div><div class="'+UI+'-date">Sunday, Sep 6</div>';brand.appendChild(btxt);header.appendChild(brand);
 const prof=document.createElement('button');prof.className=UI+'-profile';prof.type='button';prof.textContent='♙';header.appendChild(prof);shell.appendChild(header);
 const hero=document.createElement('div');hero.className=UI+'-hero';hero.innerHTML='<h1 class="'+UI+'-hero-title">Interviews</h1><div class="'+UI+'-subtitle">Never miss an interview</div>';
 const top=document.createElement('button');top.className=UI+'-top-add';top.type='button';top.textContent='＋  Add Interview';top.onclick=()=>a&&a.click();hero.appendChild(top);shell.appendChild(hero);
 const toolbar=document.createElement('div');toolbar.className=UI+'-toolbar';
 const tabs=document.createElement('div');tabs.className=UI+'-tabs';
 ['All','Upcoming','Past','Today','This Week'].forEach((label,i)=>{const b=document.createElement('button');b.className=UI+'-tab'+(i?'':' active');b.type='button';b.textContent=label;b.onclick=()=>{tabs.querySelectorAll('.'+UI+'-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active')};tabs.appendChild(b)});
 const tools=document.createElement('div');tools.className=UI+'-tools';const sw=document.createElement('div');sw.className=UI+'-search-wrap';sw.innerHTML='<span class="'+UI+'-search-icon">⌕</span><input class="'+UI+'-search" placeholder="Search interviews...">';const filter=document.createElement('button');filter.className=UI+'-filter';filter.type='button';filter.textContent='▽  Filter';tools.append(sw,filter);toolbar.append(tabs,tools);shell.appendChild(toolbar);
 const card=document.createElement('div');card.className=UI+'-empty';card.innerHTML='<div class="'+UI+'-empty-icon">▦</div><div class="'+UI+'-empty-title">No interviews yet.</div><div class="'+UI+'-empty-copy">Add your first interview to keep track of your upcoming rounds.</div>';
 const eb=document.createElement('button');eb.className=UI+'-empty-add';eb.type='button';eb.textContent='＋  Add Interview';eb.onclick=()=>a&&a.click();card.appendChild(eb);shell.appendChild(card);
 if(e.parentNode)e.parentNode.insertBefore(shell,e);else v.appendChild(shell);
 return shell;
}
function forceLayout(v,shell){
 if(!v||!shell)return;
 const important=(el,p,val)=>el.style.setProperty(p,val,'important');
 if(window.innerWidth>=1280){
  important(v,'position','fixed');important(v,'left','245px');important(v,'right','0');important(v,'top','0');important(v,'bottom','0');important(v,'width','auto');important(v,'height','100vh');important(v,'margin','0');important(v,'padding','16px 44px 48px 48px');important(v,'box-sizing','border-box');important(v,'overflow-x','hidden');important(v,'overflow-y','auto');
  important(shell,'display','block');important(shell,'width','100%');important(shell,'max-width','none');important(shell,'min-width','0');important(shell,'margin','0');important(shell,'padding','0');
 }
}
function build(){
 const v=document.getElementById(VIEW);if(!v)return;
 let shell=v.querySelector('.'+UI+'-shell');
 if(shell){forceLayout(v,shell);return;}
 const t=title(v),e=empty(v),a=add(v);if(!t||!e)return;
 const oldSub=Array.from(v.querySelectorAll('p,div,span')).find(x=>/Never miss an interview/i.test(txt(x)));
 [t,oldSub,e,a].forEach(x=>x&&x.classList.add(UI+'-legacy-hidden'));
 shell=makeShell(v,t,e,a);forceLayout(v,shell);
}
function start(){install();build();[50,150,300,600,1000,1600,2500].forEach(t=>setTimeout(build,t));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();