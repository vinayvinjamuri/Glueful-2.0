/* Glueful runtime loader v17: dashboard runtime + direct Gmail integration + Orbit AI v2 + Orbit UI v5. */
(function () {
  "use strict";

  /*
   * Runtime fan-out is intentionally centralized here so Orbit is loaded
   * by the same startup path already used by Glueful's Gmail/dashboard code.
   *
   * Complexity:
   * - Time: O(k), where k is the number of runtime scripts loaded.
   * - Space: O(k) for script elements held by the document.
   */
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

  function start() {
    window.setTimeout(function () {
      load("./glueful-dashboard-fixed-v1.js?v=7");
      load("./glueful-dashboard-header-fix-v1.js?v=4");
      load("./glueful-dashboard-hamburger-v2.js?v=4");

      /* Gmail integration owns its own exact entry-point click handler. */
      load("./glueful-gmail-integration-v1.js?v=4");
      load("./glueful-dashboard-approved-v1.js?v=2");

      /* Orbit: bootstrap the existing Supabase client, then load Orbit, then its UI polish. */
      load("./glueful-orbit-bootstrap-v1.js?v=1", function () {
        load("./glueful-orbit-v2.js?v=3", function () {
          load("./glueful-orbit-ui-v3.js?v=5");
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
