/* Glueful approved dashboard V2: greeting header, top Gmail sync control, compact single-screen layout. */
(function () {
  "use strict";
  if (window.__GLUEFUL_APPROVED_DASHBOARD_V2__) return;
  window.__GLUEFUL_APPROVED_DASHBOARD_V2__ = true;

  const STYLE_ID = "glueful-approved-dashboard-style-v2";
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
          min-height:58px !important;
          height:58px !important;
          margin:0 0 7px !important;
          padding:0 0 0 52px !important;
          box-sizing:border-box !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .view-title {
          display:block !important;
          width:calc(100% - 145px) !important;
          max-width:calc(100% - 145px) !important;
          font-size:23px !important;
          line-height:1.05 !important;
          margin:0 !important;
          padding:1px 0 0 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }
        body.glueful-dashboard-fixed #view-dashboard .view-subtitle {
          display:block !important;
          width:calc(100% - 145px) !important;
          max-width:calc(100% - 145px) !important;
          margin:4px 0 0 !important;
          font-size:11px !important;
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
          gap:7px !important;
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
          flex:0 0 auto !important;
          width:auto !important;
          min-width:118px !important;
          height:42px !important;
          min-height:42px !important;
          margin:0 !important;
          padding:0 14px !important;
          border-radius:13px !important;
          white-space:nowrap !important;
        }
        @keyframes gluefulSyncSpin { to { transform:rotate(360deg); } }

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
