/* Glueful dashboard fixed layout v1. */
(function () {
  "use strict";

  const STYLE_ID = "glueful-dashboard-fixed-style";

  function install() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* Dashboard is a fixed overview surface; other views keep normal scrolling. */
      @media (max-width: 700px) {
        html.glueful-dashboard-fixed,
        body.glueful-dashboard-fixed {
          width:100%;
          height:100dvh;
          overflow:hidden !important;
          overscroll-behavior:none;
        }

        body.glueful-dashboard-fixed #view-dashboard {
          position:fixed !important;
          inset:0 0 calc(70px + env(safe-area-inset-bottom)) 0 !important;
          width:100% !important;
          height:auto !important;
          min-height:0 !important;
          max-height:none !important;
          overflow:hidden !important;
          overflow-x:hidden !important;
          box-sizing:border-box !important;
          padding:10px 12px 10px !important;
          margin:0 !important;
          overscroll-behavior:none !important;
          -webkit-overflow-scrolling:auto !important;
        }

        /* Keep the overview compact enough to fit the phone viewport. */
        body.glueful-dashboard-fixed #view-dashboard .view-header {
          margin-bottom:8px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .heat-card {
          margin-bottom:8px !important;
          padding:.65rem !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .heat-grid {
          gap:5px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .heat-cell {
          min-width:0 !important;
        }

        body.glueful-dashboard-fixed #view-dashboard #dashboard-interviews {
          gap:6px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard #dashboard-interviews .empty-state {
          min-height:92px !important;
          height:92px !important;
          padding:1rem !important;
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          box-sizing:border-box !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .section-title {
          margin-bottom:6px !important;
        }

        /* Prevent cards from creating their own accidental scroll surfaces. */
        body.glueful-dashboard-fixed #view-dashboard .card,
        body.glueful-dashboard-fixed #view-dashboard .dashboard-list {
          overflow:hidden !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function sync() {
    install();
    const dashboard = document.getElementById("view-dashboard");
    const active = !!dashboard && (
      dashboard.classList.contains("active") ||
      dashboard.hidden === false ||
      dashboard.style.display === "block"
    );
    document.documentElement.classList.toggle("glueful-dashboard-fixed", active);
    document.body.classList.toggle("glueful-dashboard-fixed", active);
  }

  function start() {
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
