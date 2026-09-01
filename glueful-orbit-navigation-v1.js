/* Glueful Orbit navigation v4 — deterministic mobile tab-bar integration. */
(function(){
  'use strict';
  if(window.__GLUEFUL_ORBIT_NAV_V4__)return;
  window.__GLUEFUL_ORBIT_NAV_V4__=true;
  const ITEM_ID='glueful-orbit-nav-item',STYLE_ID='glueful-orbit-nav-style-v4';
  const clean=e=>[e?.textContent||'',e?.getAttribute?.('aria-label')||'',e?.getAttribute?.('title')||'',e?.dataset?.page||'',e?.dataset?.view||''].join(' ').replace(/\s+/g,' ').trim().toLowerCase();
  function style(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #${ITEM_ID}{-webkit-tap-highlight-color:transparent!important;appearance:none!important;-webkit-appearance:none!important;background:transparent!important;background-image:none!important;border:0!important;box-shadow:none!important;outline:0!important;color:inherit!important;cursor:pointer!important;margin:0!important;padding:0!important;font:inherit!important;text-align:center!important;text-decoration:none!important;}
      #${ITEM_ID},#${ITEM_ID} *{box-sizing:border-box!important;}
      #${ITEM_ID}{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;line-height:1!important;}
      #${ITEM_ID} .orbit-nav-icon{width:28px!important;height:28px!important;display:grid!important;place-items:center!important;font-size:20px!important;line-height:1!important;border-radius:9px!important;}
      #${ITEM_ID} .orbit-nav-label{font-size:11px!important;line-height:1.1!important;font-weight:500!important;}
      #${ITEM_ID}.glueful-orbit-active{color:#8b5cf6!important;}
      #${ITEM_ID}.glueful-orbit-active .orbit-nav-icon{background:linear-gradient(135deg,#7440ee,#5731c7)!important;color:#fff!important;}
      @media(max-width:700px){#${ITEM_ID}{flex:1 1 0!important;width:0!important;min-width:0!important;height:100%!important;min-height:56px!important;max-width:none!important;}}
    `;document.head.appendChild(s);
  }
  function clickable(label){
    const target=String(label).toLowerCase();
    return Array.from(document.querySelectorAll('button,a,[role="button"]')).find(e=>!e.closest('#'+ITEM_ID)&&clean(e)===target);
  }
  function ancestors(e){const out=[];for(let i=0;e&&i<14;i++,e=e.parentElement)out.push(e);return out;}
  function findNav(){
    const dash=clickable('dashboard'),jobs=clickable('jobs');if(!dash||!jobs)return null;
    const da=ancestors(dash),ja=new Set(ancestors(jobs));
    for(const node of da){
      if(!ja.has(node))continue;
      const r=node.getBoundingClientRect?.(),c=getComputedStyle(node);
      const nearBottom=!!r&&r.bottom>=innerHeight-80;
      const wide=!!r&&r.width>=innerWidth*.45;
      const layout=c.display==='flex'||c.display==='grid';
      if(nearBottom&&wide&&layout)return node;
    }
    return da.find(n=>ja.has(n)&&((getComputedStyle(n).display==='flex')||(getComputedStyle(n).display==='grid')))||null;
  }
  function ensure(){
    style();const nav=findNav();if(!nav)return false;
    let item=document.getElementById(ITEM_ID);
    if(!item){
      item=document.createElement('button');item.id=ITEM_ID;item.type='button';item.setAttribute('aria-label','Orbit AI');item.setAttribute('title','Orbit AI');
      item.innerHTML='<span class="orbit-nav-icon" aria-hidden="true">✦</span><span class="orbit-nav-label">Orbit</span>';
      item.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();item.classList.add('glueful-orbit-active');if(typeof window.gluefulOpenOrbit==='function')window.gluefulOpenOrbit();else document.getElementById('glueful-orbit-v2-root')?.classList.add('open')},true);
    }
    if(item.parentElement!==nav)nav.appendChild(item);
    const cs=getComputedStyle(nav);if(cs.display==='grid')nav.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';if(cs.display==='flex')nav.style.flexWrap='nowrap';
    return true;
  }
  function start(){ensure();[300,800,1600,3000,6000,10000].forEach(t=>setTimeout(ensure,t));new MutationObserver(()=>requestAnimationFrame(ensure)).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden']});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();