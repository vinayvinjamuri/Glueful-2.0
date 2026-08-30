/* Glueful dashboard hamburger v3: standalone, visible mobile navigation control. */
(function () {
  "use strict";
  if (window.__GLUEFUL_DASHBOARD_HAMBURGER_V3__) return;
  window.__GLUEFUL_DASHBOARD_HAMBURGER_V3__ = true;

  const STYLE_ID = "glueful-dashboard-hamburger-style-v3";
  const BUTTON_ID = "glueful-dashboard-hamburger";

  function dashboardActive() {
    const d = document.getElementById("view-dashboard");
    return !!d && (d.classList.contains("active") || d.style.display === "block");
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        body.glueful-dashboard-fixed #view-dashboard .view-header {
          position:relative !important;
          padding-left:52px !important;
          box-sizing:border-box !important;
        }
        body.glueful-dashboard-fixed #${BUTTON_ID} {
          position:absolute !important;
          left:0 !important;
          top:0 !important;
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          width:40px !important;
          height:40px !important;
          min-width:40px !important;
          min-height:40px !important;
          padding:0 !important;
          margin:0 !important;
          border:1px solid rgba(255,255,255,.10) !important;
          border-radius:12px !important;
          background:rgba(18,22,32,.96) !important;
          color:#e7e9ef !important;
          font-family:Arial,sans-serif !important;
          font-size:23px !important;
          line-height:1 !important;
          z-index:9999 !important;
          pointer-events:auto !important;
          -webkit-tap-highlight-color:transparent !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function findMenuTarget() {
    const own = document.getElementById(BUTTON_ID);
    const candidates = Array.from(document.querySelectorAll("button, [role=button], a"))
      .filter(el => el && el !== own);
    const scored = candidates.map(el => {
      const text = [el.getAttribute("aria-label") || "", el.getAttribute("title") || "", el.getAttribute("data-action") || "", el.className || "", el.textContent || ""].join(" ").toLowerCase();
      let score = 0;
      if (/hamburger|toggle menu|open menu|navigation|sidebar/.test(text)) score += 100;
      else if (/menu/.test(text)) score += 40;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.width <= 90 && r.height > 0 && r.height <= 90) score += 10;
      if (r.left < window.innerWidth * .4) score += 5;
      return { el, score };
    }).sort((a,b) => b.score - a.score);
    return scored.length && scored[0].score >= 40 ? scored[0].el : null;
  }

  function wire(button) {
    if (button.dataset.gluefulHamburgerWired === "3") return;
    button.dataset.gluefulHamburgerWired = "3";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      const target = findMenuTarget();
      if (target) target.click();
      else console.warn("[Glueful] navigation menu control could not be located");
    }, true);
  }

  function ensureButton() {
    installStyle();
    const dashboard = document.getElementById("view-dashboard");
    if (!dashboard || !dashboardActive()) {
      document.getElementById(BUTTON_ID)?.remove();
      return;
    }
    const header = dashboard.querySelector(".view-header");
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
    [500, 1500, 3000].forEach(delay => window.setTimeout(ensureButton, delay));
    const observer = new MutationObserver(() => requestAnimationFrame(ensureButton));
    observer.observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:["class","style","hidden"] });
    window.addEventListener("resize", ensureButton, { passive:true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
