/* Glueful approved dashboard V1: greeting header, top Gmail sync control, and compact interview section. */
(function () {
  "use strict";
  if (window.__GLUEFUL_APPROVED_DASHBOARD_V1__) return;
  window.__GLUEFUL_APPROVED_DASHBOARD_V1__ = true;

  const STYLE_ID = "glueful-approved-dashboard-style-v1";
  const SYNC_ID = "glueful-dashboard-gmail-sync";

  function dashboardActive() {
    const d = document.getElementById("view-dashboard");
    return !!d && (d.classList.contains("active") || d.style.display === "block");
  }

  function firstName() {
    try {
      const client = window.supabaseClient;
      if (client?.auth?.getUser) {
        client.auth.getUser().then(({ data }) => {
          const user = data?.user;
          const meta = user?.user_metadata || {};
          const raw = meta.full_name || meta.name || meta.first_name || "";
          const name = String(raw).trim().split(/\s+/)[0];
          const title = document.querySelector("#view-dashboard .view-title");
          if (title && name) title.textContent = `Hi ${name} 👋`;
        }).catch(() => {});
      }
    } catch (_) {}

    try {
      const email = window.gluefulAuthSession?.user?.email || "";
      if (email) return email.split("@")[0].split(/[._-]+/)[0];
    } catch (_) {}
    return "there";
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        body.glueful-dashboard-fixed #view-dashboard .view-header {
          display:flex !important;
          align-items:flex-start !important;
          gap:8px !important;
          padding-left:52px !important;
          padding-right:0 !important;
          box-sizing:border-box !important;
          min-height:42px !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .view-title {
          flex:1 1 auto !important;
          min-width:0 !important;
          font-size:23px !important;
          line-height:1.05 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .view-subtitle {
          flex-basis:100% !important;
        }
        body.glueful-dashboard-fixed #${SYNC_ID} {
          position:relative !important;
          right:auto !important;
          bottom:auto !important;
          flex:0 0 42px !important;
          width:42px !important;
          height:42px !important;
          min-width:42px !important;
          min-height:42px !important;
          margin:0 0 0 2px !important;
          padding:0 !important;
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          border:1px solid rgba(255,255,255,.12) !important;
          border-radius:13px !important;
          background:rgba(16,21,33,.94) !important;
          color:#e7e9ef !important;
          font-size:0 !important;
          box-shadow:none !important;
          backdrop-filter:blur(10px) !important;
          z-index:10 !important;
        }
        body.glueful-dashboard-fixed #${SYNC_ID}::before {
          content:"↻" !important;
          font:700 25px/1 Arial,sans-serif !important;
        }
        body.glueful-dashboard-fixed #${SYNC_ID}.syncing::before {
          content:"↻" !important;
          animation:gluefulSyncSpin .9s linear infinite !important;
        }
        @keyframes gluefulSyncSpin { to { transform:rotate(360deg); } }

        /* Keep the approved single-screen dashboard compact enough to show interviews. */
        body.glueful-dashboard-fixed #view-dashboard .stat-grid,
        body.glueful-dashboard-fixed #view-dashboard .stats-grid { gap:7px !important; margin-bottom:7px !important; }
        body.glueful-dashboard-fixed #view-dashboard .stat-card { padding:9px !important; border-radius:15px !important; }
        body.glueful-dashboard-fixed #view-dashboard .stat-card .stat-value { font-size:27px !important; margin:4px 0 !important; }
        body.glueful-dashboard-fixed #view-dashboard .heat-card { padding:8px !important; margin-bottom:6px !important; border-radius:16px !important; }
        body.glueful-dashboard-fixed #view-dashboard .heat-grid { gap:3px !important; margin-top:3px !important; }
        body.glueful-dashboard-fixed #view-dashboard .heat-cell { height:29px !important; min-height:29px !important; max-height:29px !important; border-radius:7px !important; }
        body.glueful-dashboard-fixed #view-dashboard .heat-card .activity-nav { width:32px !important; height:32px !important; min-width:32px !important; min-height:32px !important; }
        body.glueful-dashboard-fixed #view-dashboard .heat-card .activity-month { font-size:17px !important; }
        body.glueful-dashboard-fixed #view-dashboard #dashboard-interviews .empty-state { min-height:70px !important; height:70px !important; padding:7px !important; }
        body.glueful-dashboard-fixed #view-dashboard #dashboard-interviews .empty-state > * { margin-top:2px !important; margin-bottom:2px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function moveSyncButton() {
    const dashboard = document.getElementById("view-dashboard");
    const header = dashboard?.querySelector(".view-header");
    const button = document.getElementById(SYNC_ID);
    if (!header || !button) return;
    if (button.parentElement !== header) header.appendChild(button);
  }

  function setGreeting() {
    const title = document.querySelector("#view-dashboard .view-title");
    if (!title) return;
    if (!title.dataset.gluefulGreetingSet) {
      title.dataset.gluefulGreetingSet = "1";
      const fallback = firstName();
      if (fallback && fallback !== "there") title.textContent = `Hi ${fallback} 👋`;
      else title.textContent = "Hi there 👋";
    }
  }

  function sync() {
    if (!dashboardActive()) return;
    installStyle();
    setGreeting();
    moveSyncButton();
    if (typeof window.__GLUEFUL_DASHBOARD_HAMBURGER_ENSURE__ === "function") {
      window.__GLUEFUL_DASHBOARD_HAMBURGER_ENSURE__();
    }
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
