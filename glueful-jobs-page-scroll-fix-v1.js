/* Glueful Jobs — mobile vertical page scroll fix V1 */
(function () {
  "use strict";

  if (window.__GLUEFUL_JOBS_PAGE_SCROLL_FIX_V1__) return;
  window.__GLUEFUL_JOBS_PAGE_SCROLL_FIX_V1__ = true;

  const STYLE_ID = "glueful-jobs-page-scroll-fix-v1";

  function install() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      @media (max-width: 700px) {
        #glueful-jobs-v15 {
          position: relative !important;
          width: 100% !important;
          min-height: 100dvh !important;
          height: auto !important;
          max-height: none !important;
          overflow-x: hidden !important;
          overflow-y: visible !important;
          touch-action: pan-y !important;
          -webkit-overflow-scrolling: touch !important;
        }

        #glueful-jobs-v15 > * {
          max-height: none !important;
        }

        #glueful-jobs-v15 .g15-rail,
        #glueful-jobs-v15 .g15-company-rail {
          touch-action: pan-x pan-y !important;
        }

        #glueful-jobs-v15 #g15-latest-company-jobs {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }

        #glueful-jobs-v15 #g15-latest-company-jobs .g15-latest-rail {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          touch-action: pan-y !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function run() {
    install();

    const root = document.getElementById("glueful-jobs-v15");
    if (!root) return false;

    root.style.height = "auto";
    root.style.maxHeight = "none";
    root.style.overflowY = "visible";
    root.style.overflowX = "hidden";

    return true;
  }

  function boot() {
    if (run()) return;

    const observer = new MutationObserver(() => {
      if (run()) observer.disconnect();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
