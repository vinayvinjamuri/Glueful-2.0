/* Glueful Resume Studio Viewer V1 — isolated pages + zoom controls */
(function(){'use strict';
if(window.__GLUEFUL_RESUME_STUDIO_VIEWER_V1__)return;window.__GLUEFUL_RESUME_STUDIO_VIEWER_V1__=true;
function install(){
 const host=document.querySelector('[data-resume-studio],#resume-studio,.resume-studio')||document.body;
 if(host.dataset.gViewerInstalled)return;host.dataset.gViewerInstalled='1';
 const style=document.createElement('style');style.textContent=`
 .glueful-fixed-pages-host,.resume-pages,.resume-preview-pages{position:relative;display:flex;flex-direction:column;align-items:center;gap:24px;overflow:auto;transform:none!important}
 .glueful-fixed-page{position:relative!important;flex:0 0 auto!important;transform-origin:top center!important;isolation:isolate;box-sizing:border-box;overflow:hidden}
 .glueful-resume-zoom-layer{position:relative;transform-origin:top center;will-change:transform;display:flex;flex-direction:column;align-items:center;gap:24px}
 .glueful-resume-zoom-toolbar{display:flex;align-items:center;gap:6px;position:sticky;top:8px;z-index:1000;background:rgba(20,24,34,.94);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:5px;backdrop-filter:blur(8px)}
 .glueful-resume-zoom-toolbar button{border:0;background:transparent;color:inherit;width:34px;height:30px;border-radius:8px;font-weight:800;cursor:pointer}
 .glueful-resume-zoom-toolbar button:hover{background:rgba(255,255,255,.1)}
 .glueful-resume-zoom-value{min-width:54px;text-align:center;font-size:12px;font-weight:800}
 `;document.head.appendChild(style);
 const pages=()=>[...document.querySelectorAll('.glueful-fixed-page')];
 function normalize(){pages().forEach((p,i)=>{p.style.margin='0';p.style.zIndex='1';p.style.transform='none';p.dataset.viewerPage=String(i+1)})}
 let zoom=1;
 const toolbar=document.createElement('div');toolbar.className='glueful-resume-zoom-toolbar';toolbar.innerHTML='<button type="button" data-zminus aria-label="Zoom out">−</button><span class="glueful-resume-zoom-value">100%</span><button type="button" data-zplus aria-label="Zoom in">+</button><button type="button" data-zreset>Reset</button>';
 function apply(){const ps=pages();ps.forEach(p=>{p.style.transform=`scale(${zoom})`;p.style.marginBottom=`${(zoom-1)*Math.max(1,p.offsetHeight)+24}px`});toolbar.querySelector('.glueful-resume-zoom-value').textContent=Math.round(zoom*100)+'%'}
 toolbar.onclick=e=>{if(e.target.closest('[data-zminus]'))zoom=Math.max(.6,+(zoom-.1).toFixed(2));if(e.target.closest('[data-zplus]'))zoom=Math.min(1.6,+(zoom+.1).toFixed(2));if(e.target.closest('[data-zreset]'))zoom=1;apply()};
 const observer=new MutationObserver(()=>{normalize();apply()});observer.observe(document.body,{childList:true,subtree:true});normalize();
 const anchor=document.querySelector('.glueful-fixed-page')?.parentElement||host;anchor.parentElement?.insertBefore(toolbar,anchor);apply();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();