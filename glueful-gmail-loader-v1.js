/* Glueful Gmail loader v1: load Gmail integration after app startup. */
(function () {
  "use strict";

  function load(src) {
    if (document.querySelector('script[data-glueful-gmail-loader="1"]')) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.gluefulGmailLoader = "1";
    script.onerror = function (error) {
      console.warn("[Glueful] Gmail integration failed to load:", error);
    };
    document.head.appendChild(script);
  }

  function start() {
    // Give the core app a chance to finish its normal startup first.
    window.setTimeout(function () {
      load("./glueful-gmail-integration-v1.js");
    }, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
