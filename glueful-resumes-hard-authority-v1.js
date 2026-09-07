/* Glueful — Resumes Hard Authority V3
 * Presentation-only authority. Existing resume data and handlers are untouched.
 */
(function(){
'use strict';
if(window.__GLUEFUL_RESUMES_HARD_AUTHORITY_V3__)return;
window.__GLUEFUL_RESUMES_HARD_AUTHORITY_V3__=true;
const VIEW='view-resume',STYLE='glueful-resumes-hard-authority-v3-style';
let busy=false,timer=0;
function txt(e){return(e.textContent||'').replace(/\s+/g,' ').trim()}
function rgb(e){try{const n=getComputedStyle(e).backgroundColor,m=n.match(/[0-9.]+/g);return m?m.slice(0,3).map(Number):null}catch(_){return null}}
function dark(e){const p=rgb(e);return!!p&&p[0]<115&&p[1]<120&&p[2]<135}
function addStyle(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
@media(min-width:1101px){
html body #view-resume{position:relative!important;left:auto!important;right:auto!important;transform:none!important;margin-left:260px!important;margin-right:0!important;width:calc(100vw - 260px)!important;max-width:none!important;min-height:100vh!important;box-sizing:border-box!important;padding:22px 30px 52px!important;background:#f7f8fb!important;color:#111827!important;overflow-x:hidden!important}
html body #view-resume .gf-resume-wide-v3{width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important;transform:none!important;box-sizing:border-box!important}
html body #view-resume .gf-resume-company-v3{background:#fff!important;background-color:#fff!important;color:#111827!important;border:1px solid #e1e6ef!important;border-radius:15px!important;box-shadow:0 4px 16px rgba(25,35,58,.045)!important;box-sizing:border-box!important;overflow:hidden!important}
html body #view-resume .gf-resume-company-v3 *{color:#111827!important}
html body #view-resume .gf-resume-info-v3{background:#f4f7ff!important;background-color:#f4f7ff!important;color:#536b9d!important;border:1px solid #d9e4ff!important;border-radius:11px!important;box-shadow:none!important}
html body #view-resume .gf-resume-info-v3 *{color:#536b9d!important}
html body #view-resume input[type=search],html body #view-resume input[type=text]{background:#fff!important;background-color:#fff!important;color:#172033!important;border:1px solid #dfe4ee!important;border-radius:11px!important;box-shadow:0 2px 8px rgba(24,34,56,.04)!important}
html body #view-resume input::placeholder{color:#8790a2!important;opacity:1!important}
html body #view-resume .gf-resume-filter-v3{background:#fff!important;color:#1f2a3d!important;border:1px solid #dfe4ee!important;border-radius:11px!important;min-height:44px!important}
html body #view-resume .gf-resume-add-v3{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;min-height:44px!important;padding:0 18px!important;border:0!important;border-radius:11px!important;background:linear-gradient(135deg,#7137e8,#4d72ff)!important;color:#fff!important;font-size:14px!important;font-weight:700!important;box-shadow:0 6px 18px rgba(93,76,220,.18)!important}
html body #view-resume .gf-resume-add-v3 *{color:#fff!important}
}
@media(max-width:1100px){html body #view-resume{background:#f7f8fb!important;color:#111827!important}html body #view-resume .gf-resume-company-v3{background:#fff!important;color:#111827!important;border-color:#e1e6ef!important}}
`;document.head.appendChild(s)}
function wideShell(v){
let anchors=[];
const title=v.querySelector('.view-title');
if(title)anchors.push(title);
['Qualcomm','Wells Fargo','Facebook'].forEach(n=>{Array.from(v.querySelectorAll('*')).filter(e=>e.children.length===0&&txt(e).toLowerCase()===n.toLowerCase()).forEach(e=>anchors.push(e))});
anchors.forEach(node=>{let p=node.parentElement;for(let i=0;p&&p!==v&&i<8;i++,p=p.parentElement){const r=p.getBoundingClientRect();if(r.width>=650&&r.width<Math.max(1100,v.clientWidth-80)){p.classList.add('gf-resume-wide-v3');p.style.setProperty('width','100%','important');p.style.setProperty('max-width','none','important');p.style.setProperty('margin-left','0','important');p.style.setProperty('margin-right','0','important');p.style.setProperty('transform','none','important');break}}});
}
function mark(e,info){if(!e||e===document.getElementById(VIEW))return;e.classList.add(info?'gf-resume-info-v3':'gf-resume-company-v3');e.style.setProperty('background',info?'#f4f7ff':'#fff','important');e.style.setProperty('background-color',info?'#f4f7ff':'#fff','important');e.style.setProperty('color',info?'#536b9d':'#111827','important');e.style.setProperty('border','1px solid '+(info?'#d9e4ff':'#e1e6ef'),'important');e.style.setProperty('border-radius',info?'11px':'15px','important');if(!info)e.querySelectorAll('*').forEach(c=>{if(!c.matches('img,svg,canvas,input,button,a'))c.style.setProperty('color','#111827','important')})}
function paint(){const v=document.getElementById(VIEW);if(!v||busy)return;busy=true;try{addStyle();v.style.setProperty('background','#f7f8fb','important');v.style.setProperty('color','#111827','important');wideShell(v);
Array.from(v.querySelectorAll('div,section,article,li')).forEach(e=>{if(e.matches('.view-header,header,input,button,a,img,svg,canvas'))return;const r=e.getBoundingClientRect(),t=txt(e);if(r.width<600||r.height<55||r.height>180||!dark(e))return;if(/search company|search.*resume/i.test(t))return;if(/resumes are grouped by the companies where you used them/i.test(t))mark(e,true);else if(/\b1\s+resume\b/i.test(t)||/^(qualcomm|wells fargo|facebook)$/i.test(t))mark(e,false)});
Array.from(v.querySelectorAll('*')).forEach(e=>{const t=txt(e);if(!t)return;if(/^(qualcomm|wells fargo|facebook)\s+1\s+resume$/i.test(t)){let p=e;for(let i=0;p&&p!==v&&i<8;i++,p=p.parentElement){const r=p.getBoundingClientRect();if(r.width>=650&&r.height>=55&&r.height<=160){mark(p,false);break}}}});
v.querySelectorAll('input[type=search],input[type=text]').forEach(i=>{i.style.setProperty('background','#fff','important');i.style.setProperty('background-color','#fff','important');i.style.setProperty('color','#172033','important');i.style.setProperty('border','1px solid #dfe4ee','important');i.style.setProperty('border-radius','11px','important')});
v.querySelectorAll('button').forEach(b=>{const t=txt(b);if(/filter/i.test(t)){b.classList.add('gf-resume-filter-v3');b.style.setProperty('background','#fff','important');b.style.setProperty('color','#1f2a3d','important');b.style.setProperty('border','1px solid #dfe4ee','important')}if(/add\s+resume|upload\s+resume|import\s+resume|new\s+resume/i.test(t))b.classList.add('gf-resume-add-v3')});
}finally{busy=false}}
function schedule(){if(timer)return;timer=setTimeout(()=>{timer=0;paint()},40)}
function start(){addStyle();paint();[100,300,700,1200,2000,3500,5000,8000,12000].forEach(t=>setTimeout(paint,t));const v=document.getElementById(VIEW);if(!v){setTimeout(start,200);return}new MutationObserver(m=>{if(!busy&&m.some(x=>x.type==='childList'||x.type==='attributes'))schedule()}).observe(v,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();