/* Glueful dashboard hamburger v1: restore the mobile menu affordance without restoring the legacy header. */
(function () {
  "use strict";
  if (window.__GLUEFUL_DASHBOARD_HAMBURGER_V1__) return;
  window.__GLUEFUL_DASHBOARD_HAMBURGER_V1__ = true;

  const STYLE_ID = "glueful-dashboard-hamburger-style";
  const BUTTON_ID = "glueful-dashboard-hamburger";

  function dashboardActive() {
    const el = document.getElementById("view-dashboard");
    return !!el && (el.classList.contains("active") || el.style.display === "block");
  }

  function findExistingMenuButton() {
    const candidates = Array.from(document.querySelectorAll(
      'button, [role="button"], a, [onclick], [data-action], [aria-label], [title]'
    ));
    const own = document.getElementById(BUTTON_ID);
    const score = (el) => {
      if (!el || el === own || el.closest("#view-dashboard")) return -1;
      const text = `${el.getAttribute("aria-label") || ""} ${el.getAttribute("title") || ""} ${el.textContent || ""} ${el.className || ""}`.toLowerCase();
      if (/hamburger|menu|navigation|sidebar|open menu|toggle menu/.test(text)) return 10;
      return -1;
    };
    let best = null, bestScore = -1;
    candidates.forEach((el) => {
      const s = score(el);
      if (s > bestScore) { best = el; bestScore = s; }
    });
    return best;
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        #${BUTTON_ID} {
          display:inline-flex !important;
          align-items:center !important;
          justify-content:center !important;
          width:40px !important;
          height:40px !important;
          min-width:40px !important;
          border:1px solid rgba(255,255,255,.08) !important;
          border-radius:12px !important;
          background:rgba(18,22,32,.92) !important;
          color:#e7e9ef !important;
          font-size:22px !important;
          line-height:1 !important;
          padding:0 !important;
          margin:0 8px 0 0 !important;
          box-sizing:border-box !important;
          z-index:20 !important;
        }
        #${BUTTON_ID}[hidden] { display:none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function wire(button) {
    if (!button || button.dataset.gluefulHamburgerWired === "1") return;
    button.dataset.gluefulHamburgerWired = "1";
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      const target = findExistingMenuButton();
      if (target && target !== button) target.click();
    }, true);
  }

  function ensureButton() {
    installStyle();
    const dashboard = document.getElementById("view-dashboard");
    if (!dashboard || !dashboardActive()) {
      const old = document.getElementById(BUTTON_ID);
      if (old) old.remove();
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
      header.insertBefore(button, header.firstChild);
    }
    wire(button);

    const target = findExistingMenuButton();
    if (!target) {
      button.setAttribute("aria-disabled", "true");
      button.title = "Navigation menu";
    } else {
      button.removeAttribute("aria-disabled");
    }
  }

  function start() {
    ensureButton();
    const observer = new MutationObserver(() => window.requestAnimationFrame(ensureButton));
    observer.observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:["class","style","hidden"] });
    window.addEventListener("resize", ensureButton, { passive:true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
