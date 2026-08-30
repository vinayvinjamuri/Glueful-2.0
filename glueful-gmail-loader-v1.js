/* Glueful runtime loader v11: dashboard runtime + direct Gmail integration. */
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
      load("./glueful-dashboard-fixed-v1.js?v=6");
      load("./glueful-dashboard-header-fix-v1.js?v=4");
      load("./glueful-dashboard-hamburger-v2.js?v=4");
      // Gmail integration owns its own exact entry-point click handler.
      // Do not load the legacy document-level Gmail bridge here: it can
      // intercept clicks from parent containers/sheets and reopen the modal.
      load("./glueful-gmail-integration-v1.js?v=4");
      load("./glueful-dashboard-approved-v1.js?v=2");
    }, 1500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
