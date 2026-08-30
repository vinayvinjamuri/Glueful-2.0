/* Glueful dashboard mobile layout v3: scrollable dashboard so Upcoming Interviews remains reachable. */
(function () {
  "use strict";

  const STYLE_ID = "glueful-dashboard-fixed-style";

  function install() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        html.glueful-dashboard-fixed,
        body.glueful-dashboard-fixed {
          width:100%;
          height:100dvh;
          min-height:100dvh;
          overflow:hidden !important;
          overscroll-behavior:none !important;
        }

        /* Dashboard owns the scroll area above the fixed bottom navigation. */
        body.glueful-dashboard-fixed #view-dashboard {
          position:fixed !important;
          top:0 !important;
          left:0 !important;
          right:0 !important;
          bottom:calc(72px + env(safe-area-inset-bottom)) !important;
          width:100% !important;
          min-height:0 !important;
          max-height:none !important;
          height:auto !important;
          box-sizing:border-box !important;
          overflow-x:hidden !important;
          overflow-y:auto !important;
          padding:
            calc(env(safe-area-inset-top) + 8px)
            12px
            20px !important;
          margin:0 !important;
          overscroll-behavior-y:contain !important;
          -webkit-overflow-scrolling:touch !important;
          scrollbar-width:none !important;
        }

        body.glueful-dashboard-fixed #view-dashboard::-webkit-scrollbar {
          display:none !important;
        }

        /* Header: clean top hierarchy, no status-bar collision. */
        body.glueful-dashboard-fixed #view-dashboard .view-header {
          margin:0 0 8px !important;
          min-height:42px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .view-title {
          font-size:24px !important;
          line-height:1.05 !important;
          margin:0 !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .view-subtitle {
          font-size:12px !important;
          line-height:1.25 !important;
          margin-top:4px !important;
        }

        /* Compact two-by-two summary cards. */
        body.glueful-dashboard-fixed #view-dashboard .stat-grid,
        body.glueful-dashboard-fixed #view-dashboard .stats-grid {
          gap:9px !important;
          margin-bottom:9px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .stat-card {
          min-height:0 !important;
          padding:11px !important;
          border-radius:16px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-label {
          font-size:12px !important;
          line-height:1.15 !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-value {
          font-size:30px !important;
          line-height:1 !important;
          margin:6px 0 !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-meta,
        body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-description {
          font-size:10px !important;
          line-height:1.25 !important;
        }

        /* Activity calendar. */
        body.glueful-dashboard-fixed #view-dashboard .heat-card {
          margin:0 0 8px !important;
          padding:10px !important;
          border-radius:17px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .heat-grid {
          gap:4px !important;
          margin-top:5px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .heat-cell {
          width:auto !important;
          height:34px !important;
          min-height:34px !important;
          max-height:34px !important;
          aspect-ratio:auto !important;
          border-radius:8px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .heat-card .activity-nav {
          width:34px !important;
          height:34px !important;
          min-width:34px !important;
          min-height:34px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .heat-card .activity-month {
          font-size:18px !important;
          line-height:1.1 !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .heat-card .activity-label,
        body.glueful-dashboard-fixed #view-dashboard .heat-card .heat-legend,
        body.glueful-dashboard-fixed #view-dashboard .heat-card .heat-hint {
          font-size:9px !important;
        }

        /* Upcoming Interviews remains part of the same scrollable dashboard. */
        body.glueful-dashboard-fixed #view-dashboard #dashboard-interviews {
          gap:5px !important;
          margin-top:0 !important;
          margin-bottom:8px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .section-title {
          font-size:11px !important;
          line-height:1.15 !important;
          margin:0 0 5px !important;
        }

        body.glueful-dashboard-fixed #view-dashboard #dashboard-interviews .empty-state {
          min-height:92px !important;
          height:92px !important;
          padding:10px !important;
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          box-sizing:border-box !important;
        }

        /* Do not create nested scrolling surfaces inside the dashboard. */
        body.glueful-dashboard-fixed #view-dashboard .card,
        body.glueful-dashboard-fixed #view-dashboard .dashboard-list {
          scrollbar-width:none !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .card::-webkit-scrollbar,
        body.glueful-dashboard-fixed #view-dashboard .dashboard-list::-webkit-scrollbar {
          display:none !important;
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
      dashboard.style.display === "block"
    );

    document.documentElement.classList.toggle("glueful-dashboard-fixed", active);
    document.body.classList.toggle("glueful-dashboard-fixed", active);

    if (active) {
      dashboard.style.zoom = "1";
      dashboard.style.width = "100%";
    }
  }

  function start() {
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      subtree:true,
      attributes:true,
      attributeFilter:["class", "style", "hidden"]
    });

    window.addEventListener("resize", sync, { passive:true });
    window.visualViewport?.addEventListener("resize", sync, { passive:true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
