/* Glueful runtime loader v7: Gmail integration, approved dashboard layout, header cleanup, and stable mobile hamburger. */
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

  function start() {
    window.setTimeout(function () {
      load("./glueful-dashboard-fixed-v1.js?v=4");
      load("./glueful-dashboard-header-fix-v1.js?v=2");
      load("./glueful-dashboard-hamburger-v2.js?v=1");
      load("./glueful-gmail-integration-v1.js", function () {
        load("./glueful-gmail-bridge-v7.js");
      });
    }, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
