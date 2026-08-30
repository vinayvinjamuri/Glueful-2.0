/* Glueful dashboard header fix v1.
 * On the fixed dashboard only, hide the legacy global top chrome so it cannot
 * overlap the approved dashboard header. Restore it automatically on all other views.
 * Also removes leaked literal \\n text nodes that appear outside the dashboard.
 */
(function () {
  "use strict";
  if (window.__GLUEFUL_DASHBOARD_HEADER_FIX_V1__) return;
  window.__GLUEFUL_DASHBOARD_HEADER_FIX_V1__ = true;

  const HIDDEN_CLASS = "glueful-dashboard-global-chrome-hidden";
  const STYLE_ID = "glueful-dashboard-header-fix-style";

  function install() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        body.${HIDDEN_CLASS} .${HIDDEN_CLASS} { display:none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function isDashboardActive() {
    const dashboard = document.getElementById("view-dashboard");
    return !!dashboard && (
      dashboard.classList.contains("active") ||
      dashboard.style.display === "block"
    );
  }

  function findLegacyChrome() {
    const found = new Set();
    const brand = document.querySelector(".glueful-brand-image");

    if (brand && !brand.closest("#view-dashboard")) {
      let node = brand;
      for (let i = 0; i < 6 && node && node !== document.body; i += 1) {
        const rect = node.getBoundingClientRect();
        if (rect.width >= window.innerWidth * 0.65 && rect.height > 35 && rect.height < 180) {
          found.add(node);
          break;
        }
        node = node.parentElement;
      }
    }

    // Common global header/topbar names, but never anything inside the dashboard.
    document.querySelectorAll(
      "header, .app-header, .topbar, .navbar, .site-header, .main-header, [class*=\"app-header\"], [class*=\"topbar\"], [class*=\"navbar\"]"
    ).forEach(function (el) {
      if (el.closest("#view-dashboard")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < 180 && rect.height > 30 && rect.height < 180 && rect.width > window.innerWidth * 0.65) {
        found.add(el);
      }
    });

    return found;
  }

  function setHidden(active) {
    document.querySelectorAll("." + HIDDEN_CLASS).forEach(function (el) {
      el.classList.remove(HIDDEN_CLASS);
    });

    document.body.classList.toggle(HIDDEN_CLASS, active);
    if (!active) return;

    findLegacyChrome().forEach(function (el) {
      if (el.id === "view-dashboard" || el.closest("#view-dashboard")) return;
      el.classList.add(HIDDEN_CLASS);
    });
  }

  function cleanLiteralNewlines() {
    if (!document.createTreeWalker) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (textNode) {
      const value = String(textNode.nodeValue || "");
      if (!value.includes("\\n")) return;
      const cleaned = value.replace(/(?:\\n)+/g, "");
      if (cleaned !== value) textNode.nodeValue = cleaned;
    });
  }

  function sync() {
    install();
    setHidden(isDashboardActive());
    cleanLiteralNewlines();
  }

  function start() {
    sync();
    const observer = new MutationObserver(function () {
      window.requestAnimationFrame(sync);
    });
    observer.observe(document.body, {
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:["class", "style", "hidden"]
    });
    window.addEventListener("resize", sync, { passive:true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
