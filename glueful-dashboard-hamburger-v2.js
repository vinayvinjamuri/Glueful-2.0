/* Glueful dashboard hamburger v2: standalone mobile menu affordance without restoring legacy chrome. */
(function () {
  "use strict";
  if (window.__GLUEFUL_DASHBOARD_HAMBURGER_V2__) return;
  window.__GLUEFUL_DASHBOARD_HAMBURGER_V2__ = true;

  const STYLE_ID = "glueful-dashboard-hamburger-style-v2";
  const BUTTON_ID = "glueful-dashboard-hamburger";
  const LEGACY_CLASS = "glueful-dashboard-global-chrome-hidden";

  function dashboardActive() {
    const el = document.getElementById("view-dashboard");
    return !!el && (el.classList.contains("active") || el.style.display === "block");
  }

  function findExistingMenuButton() {
    const own = document.getElementById(BUTTON_ID);
    const scoped = Array.from(document.querySelectorAll("." + LEGACY_CLASS + " button, ." + LEGACY_CLASS + " [role=\"button\"], ." + LEGACY_CLASS + " a"));
    const all = scoped.length ? scoped : Array.from(document.querySelectorAll("button, [role=\"button\"], a"));
    const candidates = all.map((el) => {
      if (!el || el === own) return { el, score: -1 };
      const text = `${el.getAttribute("aria-label") || ""} ${el.getAttribute("title") || ""} ${el.textContent || ""} ${el.className || ""}`.toLowerCase();
      let score = 0;
      if (/hamburger|open menu|toggle menu|navigation|sidebar/.test(text)) score += 100;
      if (/menu/.test(text)) score += 20;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.width < 90 && r.height > 0 && r.height < 90) score += 5;
      if (r.left < window.innerWidth * 0.35) score += 3;
      return { el, score };
    }).sort((a,b) => b.score - a.score);
    return candidates.length && candidates[0].score > 0 ? candidates[0].el : null;
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        body.glueful-dashboard-fixed #view-dashboard .view-header {
          position:relative !important;
          padding-left:50px !important;
          box-sizing:border-box !important;
        }
        body.glueful-dashboard-fixed #${BUTTON_ID} {
          position:absolute !important;
          left:0 !important;
          top:0 !important;
          display:inline-flex !important;
          align-items:center !important;
          justify-content:center !important;
          width:40px !important;
          height:40px !important;
          min-width:40px !important;
          margin:0 !important;
          padding:0 !important;
          border:1px solid rgba(255,255,255,.08) !important;
          border-radius:12px !important;
          background:rgba(18,22,32,.92) !important;
          color:#e7e9ef !important;
          font-size:22px !important;
          line-height:1 !important;
          box-sizing:border-box !important;
          z-index:50 !important;
          -webkit-tap-highlight-color:transparent !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function wire(button) {
    if (!button || button.dataset.gluefulHamburgerWired === "2") return;
    button.dataset.gluefulHamburgerWired = "2";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      const target = findExistingMenuButton();
      if (target && target !== button) target.click();
      else console.warn("[Glueful] navigation menu button not found");
    }, true);
  }

  function ensureButton() {
    installStyle();
    const dashboard = document.getElementById("view-dashboard");
    if (!dashboard || !dashboardActive()) {
      document.getElementById(BUTTON_ID)?.remove();
      return;
    }
    const header = dashboard.querySelector(".view-header") || dashboard.firstElementChild;
    if (!header) return;
    let button = document.getElementById(BUTTON_ID);
    if (!button) {
      button = document.createElement("button");
      button.id = BUTTON_ID;
      button.type = "button";
      button.setAttribute("aria-label", "Open navigation menu");
      button.setAttribute("title", "Open navigation menu");
      button.textContent = "☰";
    }
    if (button.parentElement !== header) header.insertBefore(button, header.firstChild);
    wire(button);
  }

  function start() {
    ensureButton();
    const observer = new MutationObserver(() => requestAnimationFrame(ensureButton));
    observer.observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:["class","style","hidden"] });
    window.addEventListener("resize", ensureButton, { passive:true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
