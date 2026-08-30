/* Glueful runtime loader v20: centralized runtime + mobile regression guard. */
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
    script.onload = function () {
      if (typeof onload === "function") onload();
    };
    script.onerror = function (error) {
      console.warn("[Glueful] runtime failed to load:", src, error);
    };
    document.head.appendChild(script);
  }

  /*
   * Regression guard:
   * Gmail sync is automatic and can still be triggered from the Gmail
   * integration modal. The floating mobile sync control must never cover
   * the bottom navigation or reappear after navigation/DOM updates.
   */
  function installMobileRegressionGuard() {
    const STYLE_ID = "glueful-mobile-regression-guard-v1";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        @media (max-width:700px) {
          #glueful-dashboard-gmail-sync {
            display:none !important;
            position:static !important;
            right:auto !important;
            bottom:auto !important;
            pointer-events:none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const hide = () => {
      const button = document.getElementById("glueful-dashboard-gmail-sync");
      if (button && window.matchMedia("(max-width:700px)").matches) {
        button.style.setProperty("display", "none", "important");
      }
    };

    hide();
    const observer = new MutationObserver(hide);
    observer.observe(document.body, {
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:["style", "class", "hidden"]
    });
    window.addEventListener("resize", hide, { passive:true });
  }

  function start() {
    window.setTimeout(function () {
      load("./glueful-dashboard-fixed-v1.js?v=8");
      load("./glueful-dashboard-header-fix-v1.js?v=5");
      load("./glueful-dashboard-hamburger-v2.js?v=5");
      load("./glueful-gmail-integration-v1.js?v=5");
      load("./glueful-dashboard-approved-v1.js?v=3");
      installMobileRegressionGuard();

      /* Orbit: shared Supabase client -> real runtime -> direct-chat UI. */
      load("./glueful-orbit-bootstrap-v1.js?v=2", function () {
        load("./glueful-orbit-v2.js?v=4", function () {
          load("./glueful-orbit-ui-v3.js?v=10", function () {
            load("./glueful-orbit-ui-v6.js?v=9");
          });
        });
      });
    }, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
