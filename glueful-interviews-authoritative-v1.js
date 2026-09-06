/* Glueful Interviews — Authoritative presentation shell V4
 * Reference presentation only; existing interview rendering and actions stay intact.
 */
(function(){
'use strict';
if(window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V4__)return;
window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V4__=true;
const VIEW='view-interviews',STYLE='glueful-interviews-authoritative-v4-style',UI='glueful-interviews-reference-v4';
function install(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
html,body{overflow-x:hidden!important}
@media(min-width:1280px){
body #${VIEW}{position:fixed!important;left:245px!important;right:0!important;top:0!important;bottom:0!important;width:auto!important;height:100vh!important;margin:0!important;padding:16px 44px 48px 64px!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;background:#f7f8fc!important}
body #${VIEW}>*{box-sizing:border-box!important;max-width:100%!important;min-width:0!important}
body #${VIEW} .${UI}-header{height:54px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;margin:0 0 22px!important}
body #${VIEW} .${UI}-brand{display:flex!important;align-items:center!important;gap:10px!important}
body #${VIEW} .${UI}-brand img{width:38px!important;height:38px!important;border-radius:10px!important;object-fit:cover!important;box-shadow:0 3px 12px rgba(73,42,180,.22)!important}
body #${VIEW} .${UI}-brand-name{font-size:20px!important;font-weight:760!important;color:#172033!important;line-height:1.05!important}
body #${VIEW} .${UI}-date{font-size:11px!important;color:#7b8497!important;margin-top:3px!important}
body #${VIEW} .${UI}-profile{width:38px!important;height:38px!important;border:0!important;border-radius:50%!important;background:#172033!important;color:#fff!important;display:grid!important;place-items:center!important;font-size:16px!important}
body #${VIEW} .${UI}-hero{position:relative!important;margin:0!important}
body #${VIEW} .${UI}-hero-title{font-size:34px!important;line-height:1.08!important;font-weight:760!important;letter-spacing:-1px!important;color:#172033!important;margin:0!important}
body #${VIEW} .${UI}-subtitle{font-size:15px!important;color:#66728a!important;margin-top:5px!important}
body #${VIEW} .${UI}-top-add{position:absolute!important;right:0!important;top:0!important;height:46px!important;padding:0 20px!important;border:0!important;border-radius:12px!important;background:linear-gradient(135deg,#6b38ee,#2f68ff)!important;color:#fff!important;font-weight:700!important;font-size:14px!important;cursor:pointer!important}
body #${VIEW} .${UI}-toolbar{display:flex!important;align-items:center!important;justify-content:space-between!important;margin-top:29px!important;margin-bottom:24px!important;gap:20px!important}
body #${VIEW} .${UI}-tabs{display:flex!important;align-items:center!important;gap:8px!important}
body #${VIEW} .${UI}-tab{height:42px!important;padding:0 18px!important;border:0!important;background:transparent!important;border-radius:10px!important;color:#1d2940!important;font-size:14px!important;font-weight:650!important;cursor:pointer!important}
body #${VIEW} .${UI}-tab.active{background:#e9edff!important;color:#2865ef!important}
body #${VIEW} .${UI}-tools{display:flex!important;align-items:center!important;gap:12px!important}
body #${VIEW} .${UI}-search-wrap{position:relative!important}
body #${VIEW} .${UI}-search-icon{position:absolute!important;left:14px!important;top:10px!important;color:#66728a!important;font-size:18px!important;pointer-events:none!important}
body #${VIEW} .${UI}-search{width:310px!important;height:42px!important;border:1px solid #d7dce7!important;border-radius:10px!important;background:#fff!important;padding:0 14px 0 42px!important;font-size:14px!important;outline:none!important}
body #${VIEW} .${UI}-filter{height:42px!important;padding:0 17px!important;border:1px solid #cfd6e4!important;border-radius:10px!important;background:#fff!important;color:#172033!important;font-weight:650!important;font-size:14px!important}
body #${VIEW} .${UI}-empty{height:305px!important;border:1px dashed #9aa3b4!important;border-radius:13px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;box-sizing:border-box!important}
body #${VIEW} .${UI}-empty-icon{font-size:38px!important;line-height:1!important;margin-bottom:17px!important}
body #${VIEW} .${UI}-empty-title{font-size:21px!important;font-weight:500!important;color:#243047!important}
body #${VIEW} .${UI}-empty-copy{font-size:14px!important;color:#718098!important;margin:12px 0 16px!important}
body #${VIEW} .${UI}-empty-add{height:46px!important;padding:0 20px!important;border:0!important;border-radius:11px!important;background:linear-gradient(135deg,#6b38ee,#2f68ff)!important;color:#fff!important;font-weight:700!important}
body #${VIEW} .${UI}-legacy-hidden{display:none!important}
}
@media(max-width:1279px){body #${VIEW} .${UI}-header{display:none!important}body #${VIEW} .${UI}-toolbar{flex-wrap:wrap!important}body #${VIEW} .${UI}-search{max-width:100%!important}}
`;
document.head.appendChild(s)}
function txt(e){return(e&&e.textContent||'').replace(/\s+/g,' ').trim()}
function title(v){return v.querySelector('.view-title')||v.querySelector('h1')}
function empty(v){for(const e of v.querySelectorAll('*'))if(txt(e)==='No interviews yet.')for(let p=e,i=0;p&&p!==v&&i<6;p=p.parentElement,i++){const c=getComputedStyle(p);if(c.borderStyle.includes('dashed')||/empty/i.test(p.className||''))return p}return null}
function add(v){return Array.from(v.querySelectorAll('button')).find(b=>/add/i.test(txt(b))&&!b.closest('.'+UI))}
function build(){
const v=document.getElementById(VIEW);if(!v||v.dataset.gfInterviewV4==='1')return;const t=title(v),e=empty(v),a=add(v);if(!t||!e)return;v.dataset.gfInterviewV4='1';
const oldSub=Array.from(v.querySelectorAll('p,div,span')).find(x=>/Never miss an interview/i.test(txt(x)));
[t,oldSub,e,a].forEach(x=>x&&x.classList.add(UI+'-legacy-hidden'));
const shell=document.createElement('section');shell.className=UI+'-shell';
const header=document.createElement('div');header.className=UI+'-header';const brand=document.createElement('div');brand.className=UI+'-brand';const logo=document.querySelector('aside img,nav img,img');if(logo)brand.appendChild(logo.cloneNode(true));const btxt=document.createElement('div');btxt.innerHTML='<div class="'+UI+'-brand-name">Glueful</div><div class="'+UI+'-date">Sunday, Sep 6</div>';brand.appendChild(btxt);header.appendChild(brand);const prof=document.createElement('button');prof.className=UI+'-profile';prof.type='button';prof.textContent='♙';header.appendChild(prof);shell.appendChild(header);
const hero=document.createElement('div');hero.className=UI+'-hero';hero.innerHTML='<h1 class="'+UI+'-hero-title">Interviews</h1><div class="'+UI+'-subtitle">Never miss an interview</div>';const top=document.createElement('button');top.className=UI+'-top-add';top.type='button';top.textContent='＋  Add Interview';top.onclick=()=>a&&a.click();hero.appendChild(top);shell.appendChild(hero);
const toolbar=document.createElement('div');toolbar.className=UI+'-toolbar';const tabs=document.createElement('div');tabs.className=UI+'-tabs';['All','Upcoming','Past','Today','This Week'].forEach((label,i)=>{const b=document.createElement('button');b.className=UI+'-tab'+(i?'':' active');b.type='button';b.textContent=label;b.onclick=()=>{tabs.querySelectorAll('.'+UI+'-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active')};tabs.appendChild(b)});const tools=document.createElement('div');tools.className=UI+'-tools';const sw=document.createElement('div');sw.className=UI+'-search-wrap';sw.innerHTML='<span class="'+UI+'-search-icon">⌕</span><input class="'+UI+'-search" placeholder="Search interviews...">';const filter=document.createElement('button');filter.className=UI+'-filter';filter.type='button';filter.textContent='▽  Filter';tools.append(sw,filter);toolbar.append(tabs,tools);shell.appendChild(toolbar);
const card=document.createElement('div');card.className=UI+'-empty';card.innerHTML='<div class="'+UI+'-empty-icon">▦</div><div class="'+UI+'-empty-title">No interviews yet.</div><div class="'+UI+'-empty-copy">Add your first interview to keep track of your upcoming rounds.</div>';const eb=document.createElement('button');eb.className=UI+'-empty-add';eb.type='button';eb.textContent='＋  Add Interview';eb.onclick=()=>a&&a.click();card.appendChild(eb);shell.appendChild(card);
if(e.parentNode)e.parentNode.insertBefore(shell,e);else v.appendChild(shell);
}
function start(){install();build();[200,600,1200].forEach(t=>setTimeout(build,t))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();