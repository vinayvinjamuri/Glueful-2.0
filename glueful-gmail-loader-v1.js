/* Glueful Gmail loader v3: load Gmail integration and safe bridge after app startup. */
(function () {
  "use strict";

  function load(src, onload) {
    const existing = document.querySelector(`script[data-glueful-gmail-src="${src}"]`);
    if (existing) {
      if (typeof onload === "function") onload();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.gluefulGmailSrc = src;
    script.onload = function () {
      if (typeof onload === "function") onload();
    };
    script.onerror = function (error) {
      console.warn("[Glueful] Gmail runtime failed to load:", src, error);
    };
    document.head.appendChild(script);
  }

  function start() {
    // Let the core app finish startup, then install the Gmail integration and safe bridge.
    window.setTimeout(function () {
      load("./glueful-gmail-integration-v1.js", function () {
        load("./glueful-gmail-bridge-v7.js");
      });
    }, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
