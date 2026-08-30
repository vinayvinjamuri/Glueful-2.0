/*
 * Glueful Orbit UI v3
 *
 * Keeps the existing Orbit data/actions intact while presenting a cleaner,
 * more focused mobile experience: two primary actions + compact application cards.
 *
 * Complexity:
 * - Time: O(n) per Orbit render observation, where n is the number of visible job cards.
 * - Space: O(1) extra JavaScript state; CSS/DOM nodes are owned by the existing Orbit UI.
 */
(function () {
  "use strict";

  const STYLE_ID = "glueful-orbit-ui-v3-style";
  const VIEW_ID = "glueful-orbit-v2-view";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* Orbit v3 — focused home screen */
      .ov3-home .ov2-hero {
        padding: 24px 16px 18px !important;
        margin-bottom: 12px !important;
      }

      .ov3-home .ov2-orbit {
        width: 126px !important;
        height: 126px !important;
        margin: 0 auto 14px !important;
      }

      .ov3-home .ov2-card:nth-of-type(2) {
        padding: 10px !important;
      }

      .ov3-home .ov2-action {
        margin-top: 0 !important;
        margin-bottom: 8px !important;
        padding: 15px !important;
        min-height: 72px !important;
      }

      .ov3-home .ov2-action:last-child {
        margin-bottom: 0 !important;
      }

      .ov3-home .ov2-label {
        margin-top: 18px !important;
      }

      /* Compact recent-application cards instead of a tall list. */
      .ov3-home .ov2-job,
      .ov3-prepare .ov2-job {
        min-height: 74px !important;
        margin-bottom: 0 !important;
        padding: 10px !important;
        border-radius: 16px !important;
      }

      .ov3-home .ov2-job {
        display: grid !important;
        grid-template-columns: 36px minmax(0, 1fr) auto !important;
        gap: 8px !important;
      }

      .ov3-home .ov2-logo,
      .ov3-prepare .ov2-logo {
        width: 36px !important;
        height: 36px !important;
        border-radius: 11px !important;
        font-size: 11px !important;
      }

      .ov3-home .ov2-job-main b,
      .ov3-prepare .ov2-job-main b {
        font-size: 12px !important;
      }

      .ov3-home .ov2-job-main small,
      .ov3-prepare .ov2-job-main small {
        font-size: 10px !important;
        line-height: 1.2 !important;
      }

      .ov3-home .ov2-pill,
      .ov3-prepare .ov2-pill {
        font-size: 8px !important;
        padding: 4px 7px !important;
      }

      .ov3-home .ov3-view-all {
        width: 100%;
        margin-top: 9px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid #293a58;
        background: #0b1422;
        color: #b8c2d4;
        font-size: 11px;
        cursor: pointer;
      }

      /* Prepare screen: compact 2-column application picker. */
      .ov3-prepare .ov3-applications-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .ov3-prepare .ov2-job {
        display: flex !important;
        align-items: flex-start !important;
        flex-direction: column !important;
        position: relative !important;
        gap: 7px !important;
      }

      .ov3-prepare .ov2-job-main {
        width: 100% !important;
      }

      .ov3-prepare .ov2-pill {
        position: absolute !important;
        top: 9px !important;
        right: 9px !important;
      }

      .ov3-prepare .ov2-job .ov2-job-main small {
        white-space: normal !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
      }

      @media (max-width: 380px) {
        .ov3-prepare .ov3-applications-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function makeHomeCompact(app) {
    app.classList.add("ov3-home");

    const jobs = Array.from(app.querySelectorAll(".ov2-job"));
    if (!jobs.length) return;

    const label = app.querySelector(".ov2-label");
    if (!label) return;

    jobs.slice(4).forEach(job => {
      job.style.display = "none";
    });

    if (!app.querySelector(".ov3-view-all") && jobs.length > 4) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ov3-view-all";
      button.textContent = `View all ${jobs.length} applications`;
      let expanded = false;
      button.addEventListener("click", function () {
        expanded = !expanded;
        jobs.forEach((job, index) => {
          if (index >= 4) job.style.display = expanded ? "grid" : "none";
        });
        button.textContent = expanded
          ? "Show fewer applications"
          : `View all ${jobs.length} applications`;
      });
      jobs[3].insertAdjacentElement("afterend", button);
    }
  }

  function makePrepareCompact(app) {
    app.classList.add("ov3-prepare");

    const jobs = Array.from(app.querySelectorAll(".ov2-job"));
    if (!jobs.length) return;

    if (jobs.length > 6) {
      jobs.slice(6).forEach(job => {
        job.style.display = "none";
      });
    }

    const label = app.querySelector(".ov2-label");
    if (!label || label.nextElementSibling?.classList.contains("ov3-applications-grid")) return;

    const grid = document.createElement("div");
    grid.className = "ov3-applications-grid";
    jobs.slice(0, 6).forEach(job => grid.appendChild(job));
    label.insertAdjacentElement("afterend", grid);
  }

  function sync() {
    installStyles();

    const view = document.getElementById(VIEW_ID);
    const app = view?.querySelector(".ov2-app");
    if (!app) return;

    app.classList.remove("ov3-home", "ov3-prepare");

    const title = app.querySelector(".ov2-title")?.textContent?.trim() || "";

    if (title === "Orbit AI") {
      makeHomeCompact(app);
    } else if (title === "Prepare for a Job") {
      makePrepareCompact(app);
    }
  }

  function start() {
    installStyles();
    sync();

    const view = document.getElementById(VIEW_ID);
    if (!view) return;

    const observer = new MutationObserver(sync);
    observer.observe(view, {
      childList: true,
      subtree: true
    });

    window.addEventListener("resize", sync, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
