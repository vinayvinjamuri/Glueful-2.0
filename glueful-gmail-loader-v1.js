/* Glueful runtime loader v25: centralized runtime + mobile Gmail regression guard + Orbit keyboard layout fix. */
(function () {
  "use strict";

  function load(src, onload) {
    const existing = document.querySelector(`script[data-glueful-runtime-src="${src}"]`);
    if (existing) {
      if (typeof onload === "function") onload();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.gluefulRuntimeSrc = src;
    script.onload = function () { if (typeof onload === "function") onload(); };
    script.onerror = function (error) { console.warn("[Glueful] runtime failed to load:", src, error); };
    document.head.appendChild(script);
  }

  /* Gmail sync remains available on desktop. On mobile, the dashboard sync
   * control is intentionally absent because it must never overlay navigation. */
  function installSyncControlGuard() {
    const STYLE_ID = "glueful-sync-control-guard-v3";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        @media (max-width:700px) {
          #glueful-dashboard-gmail-sync {
            display:none !important;
            visibility:hidden !important;
            pointer-events:none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const isMobile = () => window.matchMedia("(max-width:700px)").matches;
    const removeOnMobile = () => {
      if (!isMobile()) return;
      const button = document.getElementById("glueful-dashboard-gmail-sync");
      if (button) button.remove();
    };

    removeOnMobile();
    const observer = new MutationObserver(removeOnMobile);
    observer.observe(document.body, {
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:["style", "class", "hidden"]
    });
    window.addEventListener("resize", removeOnMobile, { passive:true });
  }

  function start() {
    window.setTimeout(function () {
      installSyncControlGuard();
      load("./glueful-dashboard-fixed-v1.js?v=8");
      load("./glueful-dashboard-header-fix-v1.js?v=5");
      load("./glueful-dashboard-hamburger-v2.js?v=5");
      load("./glueful-gmail-integration-v1.js?v=7");
      load("./glueful-dashboard-approved-v1.js?v=3");
      load("./glueful-orbit-bootstrap-v1.js?v=2", function () {
        load("./glueful-orbit-v2.js?v=4", function () {
          load("./glueful-orbit-ui-v3.js?v=11", function () {
            load("./glueful-orbit-ui-v6.js?v=9", function () {
              load("./glueful-orbit-ui-v9.js?v=2");
              load("./glueful-orbit-ui-v14.js?v=1");
            });
          });
        });
      });
    }, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
