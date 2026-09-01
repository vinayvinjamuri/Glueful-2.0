/* Glueful Orbit navigation v1.
 * Adds Orbit as a first-class destination to the existing mobile navigation.
 * Does not replace or duplicate the app navigation; it discovers the existing
 * bottom navigation and inserts one Orbit item beside the existing destinations.
 */
(function () {
  "use strict";
  if (window.__GLUEFUL_ORBIT_NAV_V1__) return;
  window.__GLUEFUL_ORBIT_NAV_V1__ = true;

  const ITEM_ID = "glueful-orbit-nav-item";
  const STYLE_ID = "glueful-orbit-nav-style-v1";

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      #${ITEM_ID} { -webkit-tap-highlight-color:transparent; }
      #${ITEM_ID} .orbit-nav-icon { font-size:20px; line-height:1; display:block; }
      #${ITEM_ID}.glueful-orbit-active { color:var(--accent,#7b36ff) !important; }
      #${ITEM_ID}.glueful-orbit-active .orbit-nav-icon { transform:translateY(-1px); }
      @media (max-width:700px) {
        #${ITEM_ID} { display:flex !important; flex:1 1 0 !important; min-width:0 !important; }
      }
    `;
    document.head.appendChild(s);
  }

  function textOf(el) {
    return [el?.textContent || "", el?.getAttribute?.("aria-label") || "", el?.getAttribute?.("title") || "", el?.getAttribute?.("data-page") || "", el?.getAttribute?.("data-view") || ""].join(" ").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isBottomFixed(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width >= window.innerWidth * 0.55 && r.height >= 45 && r.height <= 130 && r.bottom >= window.innerHeight - 18 && /fixed|sticky/.test(cs.position);
  }

  function scoreContainer(el) {
    const t = textOf(el);
    let score = 0;
    if (/dashboard/.test(t)) score += 40;
    if (/jobs|applications|resume|profile/.test(t)) score += 25;
    if (/nav|navigation|bottom|tabbar|tab-bar|mobile/.test((el.className || "") + " " + (el.id || ""))) score += 20;
    if (isBottomFixed(el)) score += 45;
    const children = el.querySelectorAll?.("button,a,[role='button']") || [];
    if (children.length >= 3 && children.length <= 8) score += 20;
    return score;
  }

  function findNav() {
    const candidates = [];
    const all = document.querySelectorAll("nav, [role='navigation'], footer, .bottom-nav, .bottom-navigation, .mobile-nav, .mobile-navigation, .tab-bar, .tabbar, [class*='bottom-nav'], [class*='bottom-navigation'], [class*='mobile-nav']");
    all.forEach(el => candidates.push(el));
    document.querySelectorAll("button,a,[role='button']").forEach(item => {
      const t = textOf(item);
      if (!/dashboard|jobs|applications|resume/.test(t)) return;
      let p = item.parentElement;
      for (let i = 0; p && i < 5; i++, p = p.parentElement) {
        if (!candidates.includes(p)) candidates.push(p);
      }
    });
    candidates.sort((a,b) => scoreContainer(b) - scoreContainer(a));
    return candidates[0] && scoreContainer(candidates[0]) >= 35 ? candidates[0] : null;
  }

  function openOrbit() {
    const root = document.getElementById("glueful-orbit-v2-root");
    if (typeof window.gluefulOpenOrbit === "function") {
      Promise.resolve(window.gluefulOpenOrbit()).catch(err => console.warn("[Glueful] Orbit open failed", err));
      return;
    }
    if (root) {
      root.classList.add("open");
      return;
    }
    console.warn("[Glueful] Orbit runtime is not ready yet");
  }

  function setActive(active) {
    const item = document.getElementById(ITEM_ID);
    if (!item) return;
    item.classList.toggle("glueful-orbit-active", !!active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  }

  function makeItem(nav) {
    let item = document.getElementById(ITEM_ID);
    if (item) return item;

    const sample = Array.from(nav.querySelectorAll("button,a,[role='button']")).find(el => /dashboard|jobs|applications|resume/.test(textOf(el)));
    item = document.createElement(sample?.tagName?.toLowerCase() === "a" ? "a" : "button");
    item.id = ITEM_ID;
    item.type = "button";
    if (item.tagName === "A") item.href = "#";
    item.setAttribute("aria-label", "Orbit AI");
    item.setAttribute("title", "Orbit AI");
    item.innerHTML = `<span class="orbit-nav-icon" aria-hidden="true">✦</span><span>Orbit</span>`;
    item.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setActive(true);
      openOrbit();
    }, true);
    return item;
  }

  function ensure() {
    installStyle();
    const nav = findNav();
    if (!nav) return false;
    let item = document.getElementById(ITEM_ID);
    if (!item) item = makeItem(nav);
    if (item.parentElement !== nav) {
      const children = Array.from(nav.querySelectorAll("button,a,[role='button']"));
      const anchor = children.find(el => /profile|settings|more|menu/.test(textOf(el)));
      if (anchor) nav.insertBefore(item, anchor);
      else nav.appendChild(item);
    }
    const existing = Array.from(nav.querySelectorAll("button,a,[role='button']")).filter(el => el !== item);
    existing.forEach(el => {
      if (el.dataset.gluefulOrbitBound === "1") return;
      el.dataset.gluefulOrbitBound = "1";
      el.addEventListener("click", () => setActive(false), { passive:true });
    });
    return true;
  }

  function start() {
    ensure();
    [250, 750, 1500, 3000, 5000].forEach(t => setTimeout(ensure, t));
    const observer = new MutationObserver(() => requestAnimationFrame(ensure));
    observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["class","style","hidden"] });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
