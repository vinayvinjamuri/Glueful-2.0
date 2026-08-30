/* Glueful approved dashboard V5: mobile-safe greeting/header spacing, scrollable dashboard, and corrected activity grid sizing. */
(function () {
  "use strict";
  if (window.__GLUEFUL_APPROVED_DASHBOARD_V5__) return;
  window.__GLUEFUL_APPROVED_DASHBOARD_V5__ = true;

  const STYLE_ID = "glueful-approved-dashboard-style-v5";
  const SYNC_ID = "glueful-dashboard-gmail-sync";
  const ACTIONS_ID = "glueful-dashboard-header-actions";

  function dashboardActive() {
    const d = document.getElementById("view-dashboard");
    return !!d && (d.classList.contains("active") || d.style.display === "block");
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        body.glueful-dashboard-fixed #view-dashboard .view-header {
          position:relative !important;
          display:block !important;
          width:100% !important;
          min-height:58px !important;
          height:58px !important;
          margin:0 0 9px !important;
          padding:0 0 0 52px !important;
          box-sizing:border-box !important;
          overflow:visible !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .view-title {
          display:block !important;
          width:calc(100% - 205px) !important;
          max-width:calc(100% - 205px) !important;
          font-size:18px !important;
          line-height:1.08 !important;
          letter-spacing:-0.25px !important;
          margin:0 !important;
          padding:5px 0 0 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }

        body.glueful-dashboard-fixed #view-dashboard .view-subtitle {
          display:block !important;
          width:calc(100% - 205px) !important;
          max-width:calc(100% - 205px) !important;
          margin:4px 0 0 !important;
          font-size:10px !important;
          line-height:1.15 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }

        body.glueful-dashboard-fixed #${ACTIONS_ID} {
          position:absolute !important;
          top:0 !important;
          right:0 !important;
          display:flex !important;
          align-items:center !important;
          justify-content:flex-end !important;
          gap:6px !important;
          width:151px !important;
          height:42px !important;
          z-index:20 !important;
        }

        body.glueful-dashboard-fixed #${ACTIONS_ID} > #${SYNC_ID} {
          position:relative !important;
          right:auto !important;
          bottom:auto !important;
          display:none !important;
          flex:0 0 42px !important;
          width:42px !important;
          height:42px !important;
          min-width:42px !important;
          min-height:42px !important;
          margin:0 !important;
          padding:0 !important;
          align-items:center !important;
          justify-content:center !important;
          border:1px solid rgba(255,255,255,.12) !important;
          border-radius:13px !important;
          background:rgba(16,21,33,.94) !important;
          color:#e7e9ef !important;
          font-size:0 !important;
          box-shadow:none !important;
          backdrop-filter:blur(10px) !important;
          z-index:21 !important;
        }

        body.glueful-dashboard-fixed #${ACTIONS_ID} > #${SYNC_ID}.glueful-gmail-show { display:flex !important; }
        body.glueful-dashboard-fixed #${SYNC_ID}::before {
          content:"↻" !important;
          font:700 25px/1 Arial,sans-serif !important;
        }
        body.glueful-dashboard-fixed #${SYNC_ID}.syncing::before {
          content:"↻" !important;
          animation:gluefulSyncSpin .9s linear infinite !important;
        }

        body.glueful-dashboard-fixed #${ACTIONS_ID} .glueful-approved-application {
          position:relative !important;
          flex:0 0 103px !important;
          width:103px !important;
          min-width:103px !important;
          max-width:103px !important;
          height:42px !important;
          min-height:42px !important;
          margin:0 !important;
          padding:0 8px !important;
          border-radius:13px !important;
          white-space:nowrap !important;
          font-size:13px !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }

        @keyframes gluefulSyncSpin { to { transform:rotate(360deg); } }

        body.glueful-dashboard-fixed #view-dashboard .stat-grid,
        body.glueful-dashboard-fixed #view-dashboard .stats-grid {
          gap:7px !important;
          margin-bottom:8px !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .stat-card {
          padding:9px !important;
          border-radius:15px !important;
          min-width:0 !important;
          box-sizing:border-box !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-label {
          font-size:12px !important;
          line-height:1.15 !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-value {
          font-size:27px !important;
          line-height:1 !important;
          margin:4px 0 !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-meta,
        body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-description {
          font-size:10px !important;
          line-height:1.2 !important;
        }

        /* Activity calendar: every week is a fixed-height row. This prevents the
           final row from stretching and creating the large empty area highlighted
           in the mobile screenshot. */
        body.glueful-dashboard-fixed #view-dashboard .heat-card {
          width:100% !important;
          box-sizing:border-box !important;
          padding:8px !important;
          margin:0 0 8px !important;
          border-radius:16px !important;
          overflow:hidden !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .heat-grid {
          display:grid !important;
          grid-template-columns:repeat(7,minmax(0,1fr)) !important;
          grid-auto-rows:29px !important;
          grid-template-rows:repeat(6,29px) !important;
          align-content:start !important;
          align-items:start !important;
          justify-items:stretch !important;
          gap:3px !important;
          margin-top:4px !important;
          margin-bottom:0 !important;
          padding:0 !important;
          width:100% !important;
          min-height:0 !important;
          height:189px !important;
          box-sizing:border-box !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .heat-grid > * {
          min-height:0 !important;
          max-height:29px !important;
          height:29px !important;
          align-self:start !important;
          box-sizing:border-box !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .heat-cell {
          width:100% !important;
          height:29px !important;
          min-height:29px !important;
          max-height:29px !important;
          aspect-ratio:auto !important;
          border-radius:7px !important;
          box-sizing:border-box !important;
          margin:0 !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .heat-card .activity-nav {
          width:32px !important;
          height:32px !important;
          min-width:32px !important;
          min-height:32px !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .heat-card .activity-month {
          font-size:17px !important;
          line-height:1.1 !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .heat-card .activity-label {
          font-size:9px !important;
          line-height:1.15 !important;
          margin-bottom:3px !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .heat-card .heat-hint {
          display:block !important;
          margin-top:7px !important;
          margin-bottom:4px !important;
          font-size:9px !important;
          line-height:1.15 !important;
          text-align:center !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .heat-card .heat-legend {
          display:flex !important;
          align-items:center !important;
          min-height:18px !important;
          height:18px !important;
          margin-top:0 !important;
          font-size:9px !important;
          line-height:1.15 !important;
        }

        body.glueful-dashboard-fixed #view-dashboard #dashboard-interviews {
          gap:5px !important;
          margin-top:0 !important;
          margin-bottom:12px !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .section-title {
          font-size:11px !important;
          line-height:1.15 !important;
          margin:0 0 5px !important;
        }
        body.glueful-dashboard-fixed #view-dashboard #dashboard-interviews .empty-state {
          min-height:76px !important;
          height:76px !important;
          padding:7px !important;
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          box-sizing:border-box !important;
          overflow:hidden !important;
        }
        body.glueful-dashboard-fixed #view-dashboard #dashboard-interviews .empty-state > * {
          margin-top:2px !important;
          margin-bottom:2px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function findApplicationButton(header) {
    return Array.from(header.querySelectorAll("button, a, [role='button']"))
      .find(el => /\+?\s*application/i.test((el.textContent || "").replace(/\s+/g, " ").trim())) || null;
  }

  function arrangeHeaderActions() {
    const dashboard = document.getElementById("view-dashboard");
    const header = dashboard?.querySelector(".view-header");
    if (!header) return;

    let actions = header.querySelector(`#${ACTIONS_ID}`);
    if (!actions) {
      actions = document.createElement("div");
      actions.id = ACTIONS_ID;
      header.appendChild(actions);
    }

    const sync = document.getElementById(SYNC_ID);
    if (sync && sync.parentElement !== actions) actions.insertBefore(sync, actions.firstChild);

    const application = findApplicationButton(header);
    if (application && application !== actions && application.parentElement !== actions) {
      application.classList.add("glueful-approved-application");
      actions.appendChild(application);
    }

    if (sync) sync.classList.toggle("glueful-gmail-show", sync.style.display !== "none");
  }

  function setGreeting() {
    const title = document.querySelector("#view-dashboard .view-title");
    if (!title) return;
    if (!title.dataset.gluefulGreetingSet) title.dataset.gluefulGreetingSet = "1";

    try {
      const client = window.supabaseClient;
      if (client?.auth?.getUser) {
        client.auth.getUser().then(({ data }) => {
          const user = data?.user;
          const meta = user?.user_metadata || {};
          const raw = meta.full_name || meta.name || meta.first_name || "";
          const name = String(raw).trim().split(/\s+/)[0];
          if (name) title.textContent = `Hi ${name} 👋`;
        }).catch(() => {});
      }
    } catch (_) {}

    if (!title.textContent.trim() || /^dashboard$/i.test(title.textContent.trim())) {
      title.textContent = "Hi there 👋";
    }
  }

  function sync() {
    if (!dashboardActive()) return;
    installStyle();
    setGreeting();
    arrangeHeaderActions();
  }

  function start() {
    sync();
    [300, 800, 1600, 3000].forEach(t => setTimeout(sync, t));
    const observer = new MutationObserver(() => requestAnimationFrame(sync));
    observer.observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:["class","style","hidden"] });
    window.addEventListener("resize", sync, { passive:true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
