/* Glueful Orbit navigation v3 — exact mobile tab-bar integration. */
(function(){
  'use strict';
  if(window.__GLUEFUL_ORBIT_NAV_V3__)return;
  window.__GLUEFUL_ORBIT_NAV_V3__=true;
  const ITEM_ID='glueful-orbit-nav-item',STYLE_ID='glueful-orbit-nav-style-v3';
  const text=e=>[e?.textContent||'',e?.getAttribute?.('aria-label')||'',e?.getAttribute?.('title')||'',e?.dataset?.page||'',e?.dataset?.view||''].join(' ').replace(/\s+/g,' ').trim().toLowerCase();
  function style(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
    #${ITEM_ID}{-webkit-tap-highlight-color:transparent!important;appearance:none!important;-webkit-appearance:none!important;background:transparent!important;background-image:none!important;border:0!important;box-shadow:none!important;outline:0!important;color:inherit!important;cursor:pointer!important;margin:0!important;padding:0!important;font:inherit!important;text-align:center!important;text-decoration:none!important;}
    #${ITEM_ID},#${ITEM_ID} *{box-sizing:border-box!important;}
    #${ITEM_ID}{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;line-height:1!important;}
    #${ITEM_ID} .orbit-nav-icon{width:26px!important;height:26px!important;display:grid!important;place-items:center!important;font-size:19px!important;line-height:1!important;border-radius:9px!important;}
    #${ITEM_ID} .orbit-nav-label{font-size:11px!important;line-height:1.1!important;font-weight:500!important;}
    #${ITEM_ID}.glueful-orbit-active{color:#8b5cf6!important;}
    #${ITEM_ID}.glueful-orbit-active .orbit-nav-icon{background:linear-gradient(135deg,#7440ee,#5731c7)!important;color:#fff!important;}
    @media(max-width:700px){#${ITEM_ID}{flex:1 1 0!important;min-width:0!important;height:100%!important;min-height:56px!important;max-width:none!important;}}
  `;document.head.appendChild(s)}
  function navItems(){return Array.from(document.querySelectorAll('button,a,[role="button"]')).filter(e=>{const t=text(e);return (/^dashboard$/.test(t)||/^jobs$/.test(t)||/^jobs\s/.test(t))&&!e.closest('#'+ITEM_ID)})}
  function findNav(){const items=navItems();const dash=items.find(e=>/^dashboard$/.test(text(e)));const jobs=items.find(e=>/^jobs$/.test(text(e)));if(!dash||!jobs)return null;if(dash.parentElement===jobs.parentElement)return dash.parentElement;let a=dash.parentElement;for(let i=0;i<8&&a;i++,a=a.parentElement){let b=jobs.parentElement;for(let j=0;j<8&&b;j++,b=b.parentElement){if(a===b)return a}}return null}
  function open(){if(typeof window.gluefulOpenOrbit==='function'){Promise.resolve(window.gluefulOpenOrbit()).catch(e=>console.warn('[Glueful] Orbit open failed',e));return}document.getElementById('glueful-orbit-v2-root')?.classList.add('open')}
  function ensure(){style();const nav=findNav();if(!nav)return false;let item=document.getElementById(ITEM_ID);if(!item){const sample=navItems()[0];item=document.createElement(sample?.tagName?.toLowerCase()==='a'?'a':'button');item.id=ITEM_ID;if(item.tagName==='BUTTON')item.type='button';else item.href='#';item.setAttribute('aria-label','Orbit AI');item.setAttribute('title','Orbit AI');item.innerHTML='<span class="orbit-nav-icon" aria-hidden="true">✦</span><span class="orbit-nav-label">Orbit</span>';item.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();item.classList.add('glueful-orbit-active');open()},true)}if(item.parentElement!==nav)nav.appendChild(item);return true}
  function start(){ensure();[300,800,1600,3000,6000].forEach(t=>setTimeout(ensure,t));new MutationObserver(()=>requestAnimationFrame(ensure)).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden']})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();