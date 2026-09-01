/* Glueful Orbit navigation v2: robust mobile destination injection. */
(function () {
  "use strict";
  if (window.__GLUEFUL_ORBIT_NAV_V2__) return;
  window.__GLUEFUL_ORBIT_NAV_V2__ = true;

  const ITEM_ID = "glueful-orbit-nav-item";
  const STYLE_ID = "glueful-orbit-nav-style-v2";

  function textOf(el) {
    return [el?.textContent || "", el?.getAttribute?.("aria-label") || "", el?.getAttribute?.("title") || "", el?.getAttribute?.("data-page") || "", el?.getAttribute?.("data-view") || ""].join(" ").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      #${ITEM_ID}{-webkit-tap-highlight-color:transparent;cursor:pointer;}
      #${ITEM_ID} .orbit-nav-icon{font-size:20px;line-height:1;display:block;}
      #${ITEM_ID}.glueful-orbit-active{color:var(--accent,#7b36ff)!important;}
      @media(max-width:700px){#${ITEM_ID}{display:flex!important;flex:1 1 0!important;min-width:0!important;}}
    `;
    document.head.appendChild(s);
  }

  function knownItems(root) {
    return Array.from(root?.querySelectorAll?.("button,a,[role='button']") || []).filter(el => /dashboard|jobs|applications|resume/.test(textOf(el)));
  }

  function score(el) {
    const items = knownItems(el);
    if (items.length < 2 || items.length > 8) return -1;
    const text = textOf(el);
    let score = items.length * 20;
    if (/dashboard/.test(text)) score += 35;
    if (/jobs/.test(text)) score += 25;
    if (/applications|resume/.test(text)) score += 20;
    const r = el.getBoundingClientRect?.();
    if (r && r.width > innerWidth * .45 && r.height >= 40 && r.height <= 150) score += 20;
    if (r && r.bottom >= innerHeight - 30) score += 30;
    return score;
  }

  function findNav() {
    let best = null;
    let bestScore = -1;
    const candidates = new Set();
    document.querySelectorAll("nav,footer,[role='navigation'],button,a,[role='button']").forEach(el => {
      if (/dashboard|jobs|applications|resume/.test(textOf(el))) {
        let p = el;
        for(let i=0;i<8 && p;i++,p=p.parentElement) candidates.add(p);
      }
      if (/nav|navigation|bottom|tabbar|mobile/i.test(`${el.id||""} ${el.className||""}`)) candidates.add(el);
    });
    for(const el of candidates){
      const s=score(el);
      if(s>bestScore){bestScore=s;best=el;}
    }
    return bestScore>=55?best:null;
  }

  function openOrbit() {
    if(typeof window.gluefulOpenOrbit === "function") {
      Promise.resolve(window.gluefulOpenOrbit()).catch(e=>console.warn("[Glueful] Orbit open failed",e));
      return;
    }
    const root=document.getElementById("glueful-orbit-v2-root");
    if(root) root.classList.add("open");
    else console.warn("[Glueful] Orbit runtime is not ready yet");
  }

  function ensure() {
    installStyle();
    const nav=findNav();
    if(!nav) return false;
    let item=document.getElementById(ITEM_ID);
    if(!item){
      const sample=knownItems(nav)[0];
      item=document.createElement(sample?.tagName?.toLowerCase()==="a"?"a":"button");
      item.id=ITEM_ID;
      item.type="button";
      if(item.tagName==="A") item.href="#";
      item.setAttribute("aria-label","Orbit AI");
      item.setAttribute("title","Orbit AI");
      item.innerHTML='<span class="orbit-nav-icon" aria-hidden="true">✦</span><span>Orbit</span>';
      item.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();item.classList.add("glueful-orbit-active");openOrbit();},true);
    }
    if(item.parentElement!==nav) nav.appendChild(item);
    for(const el of knownItems(nav)){
      if(el===item || el.dataset.gluefulOrbitBound==="2") continue;
      el.dataset.gluefulOrbitBound="2";
      el.addEventListener("click",()=>item.classList.remove("glueful-orbit-active"),{passive:true});
    }
    return true;
  }

  function start(){
    ensure();
    [250,750,1500,3000,5000,8000].forEach(t=>setTimeout(ensure,t));
    new MutationObserver(()=>requestAnimationFrame(ensure)).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","style","hidden"]});
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true}); else start();
})();
