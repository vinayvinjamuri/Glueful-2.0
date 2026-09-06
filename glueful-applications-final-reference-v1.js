/* Glueful — Applications Page V1
 * Rebuilt from scratch from the supplied Applications reference screenshot.
 * This file owns the Applications presentation geometry.
 * Existing application data, navigation and button handlers are preserved.
 */
(function () {
  'use strict';

  const STYLE_ID = 'glueful-applications-page-v1-style';
  const VIEW_ID = 'view-applications';

  function isActive(view) {
    return !!view && (view.classList.contains('active') || view.style.display === 'block');
  }

  function install() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* ================================================================
         GLUEFUL APPLICATIONS — SINGLE SOURCE OF TRUTH
         Reference: 260px navigation + clean full-width application list.
         No utility/right rail on the Applications page.
         ================================================================ */

      html, body {
        overflow-x: hidden !important;
      }

      body #view-applications {
        background: #f7f8fc !important;
        color: #182033 !important;
      }

      /* Desktop -------------------------------------------------------- */
      @media (min-width: 1280px) {
        body #view-applications {
          position: fixed !important;
          left: 245px !important;
          right: 0 !important;
          top: 0 !important;
          bottom: 0 !important;
          width: auto !important;
          height: 100vh !important;
          min-height: 100vh !important;
          margin: 0 !important;
          padding: 26px 42px 52px 30px !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          transform: none !important;
        }

        /* The screenshot has one simple vertical content column. */
        body #view-applications > .view-header {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          min-height: 72px !important;
          margin: 0 0 0 !important;
          padding: 0 !important;
          display: flex !important;
          align-items: flex-start !important;
          justify-content: space-between !important;
          gap: 20px !important;
          box-sizing: border-box !important;
        }

        body #view-applications > .view-header > button,
        body #view-applications > .view-header > a {
          position: static !important;
          inset: auto !important;
          transform: none !important;
          margin: 0 !important;
          flex: 0 0 auto !important;
        }

        /* Completely remove the old Applications utility rail. */
        body #view-applications > #glueful-applications-rail-v2,
        body #view-applications > #glueful-applications-workspace-v1,
        body #glueful-applications-rail-v2,
        body #glueful-applications-workspace-v1 {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        /* Every real Applications content block spans the page. */
        body #view-applications > .glueful-applications-main-wide,
        body #view-applications > .glueful-applications-main-centered {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          box-sizing: border-box !important;
          transform: none !important;
        }

        /* Search directly below header. */
        body #view-applications > .glueful-applications-main-wide {
          margin-top: 9px !important;
        }

        body #view-applications input[type="search"],
        body #view-applications input[placeholder*="Search"],
        body #view-applications input[placeholder*="search"] {
          display: block !important;
          width: 100% !important;
          height: 44px !important;
          min-height: 44px !important;
          max-width: none !important;
          min-width: 0 !important;
          padding: 0 16px 0 44px !important;
          border: 1px solid #e3e7ef !important;
          border-radius: 12px !important;
          background: #ffffff !important;
          color: #26324a !important;
          box-shadow: 0 1px 2px rgba(25, 35, 60, .025) !important;
          box-sizing: border-box !important;
          outline: none !important;
        }

        body #view-applications input[type="search"]::placeholder,
        body #view-applications input[placeholder*="Search"]::placeholder,
        body #view-applications input[placeholder*="search"]::placeholder {
          color: #66738d !important;
          opacity: 1 !important;
        }

        /* Filter pills. */
        body #view-applications > .glueful-applications-main-centered {
          margin-top: 14px !important;
        }

        body #view-applications > .glueful-applications-main-wide + .glueful-applications-main-centered {
          margin-top: 14px !important;
        }

        /* Application cards. */
        body #view-applications .application-card,
        body #view-applications .job-application-card,
        body #view-applications [class*="application-card"] {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          min-height: 90px !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 15px 16px !important;
          background: #ffffff !important;
          color: #20283a !important;
          border: 1px solid #e3e7ef !important;
          border-radius: 16px !important;
          box-shadow: 0 3px 12px rgba(30, 40, 70, .035) !important;
          box-sizing: border-box !important;
        }

        body #view-applications .application-card + .application-card,
        body #view-applications .job-application-card + .job-application-card,
        body #view-applications [class*="application-card"] + [class*="application-card"] {
          margin-top: 18px !important;
        }

        /* Keep the compact typography from the reference. */
        body #view-applications .application-card h1,
        body #view-applications .application-card h2,
        body #view-applications .application-card h3,
        body #view-applications .application-card h4,
        body #view-applications .job-application-card h1,
        body #view-applications .job-application-card h2,
        body #view-applications .job-application-card h3,
        body #view-applications .job-application-card h4 {
          color: #20283a !important;
        }

        body #view-applications .application-card p,
        body #view-applications .job-application-card p {
          color: #77839a !important;
        }

        /* Reference action buttons: dark rounded squares on the right. */
        body #view-applications .application-card button,
        body #view-applications .job-application-card button {
          border-radius: 11px !important;
          box-shadow: none !important;
        }

        /* Prevent older scripts from injecting transforms/positioning. */
        body #view-applications > *:not(.view-header):not(#glueful-applications-rail-v2):not(#glueful-applications-workspace-v1) {
          transform: none !important;
          box-sizing: border-box !important;
        }
      }

      /* Tablet --------------------------------------------------------- */
      @media (min-width: 768px) and (max-width: 1279px) {
        body #view-applications {
          position: relative !important;
          left: 0 !important;
          right: auto !important;
          top: auto !important;
          bottom: auto !important;
          width: calc(100vw - 245px) !important;
          max-width: none !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 24px 28px 48px !important;
          box-sizing: border-box !important;
          transform: none !important;
        }

        body #view-applications > #glueful-applications-rail-v2,
        body #view-applications > #glueful-applications-workspace-v1 {
          display: none !important;
        }

        body #view-applications > .view-header,
        body #view-applications > .glueful-applications-main-wide,
        body #view-applications > .glueful-applications-main-centered {
          width: 100% !important;
          max-width: none !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          box-sizing: border-box !important;
        }
      }

      /* Mobile --------------------------------------------------------- */
      @media (max-width: 767px) {
        body #view-applications {
          position: relative !important;
          left: 0 !important;
          right: auto !important;
          top: auto !important;
          bottom: auto !important;
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 16px 13px 96px !important;
          box-sizing: border-box !important;
          transform: none !important;
        }

        body #view-applications > #glueful-applications-rail-v2,
        body #view-applications > #glueful-applications-workspace-v1 {
          display: none !important;
        }

        body #view-applications .application-card,
        body #view-applications .job-application-card,
        body #view-applications [class*="application-card"] {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function normalize(view) {
    if (!view) return;

    install();

    /* Remove classes left behind by the retired layout layers. */
    view.querySelectorAll('.glueful-applications-main-wide, .glueful-applications-main-centered').forEach(function (el) {
      if (el.id !== 'glueful-applications-rail-v2' && el.id !== 'glueful-applications-workspace-v1') {
        el.style.setProperty('transform', 'none', 'important');
      }
    });
  }

  function sync() {
    const view = document.getElementById(VIEW_ID);
    if (!isActive(view)) return;
    normalize(view);
  }

  function start() {
    sync();
    [100, 300, 700, 1200, 2200].forEach(function (delay) {
      setTimeout(sync, delay);
    });
    window.addEventListener('resize', sync, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();