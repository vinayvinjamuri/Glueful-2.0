/* Glueful — Applications Page V2
 * Clean Applications presentation rebuilt from the supplied reference screenshot.
 * This file is the ONLY Applications presentation layer.
 * Data fetching, application creation/edit/delete handlers and navigation remain owned by the existing app.
 */
(function () {
  'use strict';

  const STYLE_ID = 'glueful-applications-page-v2-style';
  const HEADER_BRAND_ID = 'glueful-applications-reference-brand';
  const HEADER_PROFILE_ID = 'glueful-applications-reference-profile';

  function active(view) {
    return !!view && (view.classList.contains('active') || view.style.display === 'block');
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* ================================================================
         APPLICATIONS — REFERENCE GEOMETRY
         ================================================================ */
      html, body {
        overflow-x: hidden !important;
      }

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
          padding: 26px 42px 52px 31px !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          transform: none !important;
          background: #f7f8fc !important;
          color: #182033 !important;
        }

        /* Retired utility rails must never participate in this page. */
        body #view-applications > #glueful-applications-rail-v2,
        body #view-applications > #glueful-applications-workspace-v1,
        body #glueful-applications-rail-v2,
        body #glueful-applications-workspace-v1 {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        /* --------------------------------------------------------------
           HEADER
           The reference header is deliberately narrower than the list.
           Title starts at the content edge; brand sits beside it; Add and
           profile sit farther right with a generous empty tail.
           -------------------------------------------------------------- */
        body #view-applications > .view-header {
          position: relative !important;
          width: 1090px !important;
          max-width: 1090px !important;
          min-width: 1090px !important;
          height: 78px !important;
          min-height: 78px !important;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
          box-sizing: border-box !important;
          transform: none !important;
        }

        body #view-applications > .view-header > button,
        body #view-applications > .view-header > a {
          position: absolute !important;
          inset: auto !important;
          transform: none !important;
          margin: 0 !important;
        }

        /* Existing Add button — keep its original click handler. */
        body #view-applications > .view-header > button:first-of-type,
        body #view-applications > .view-header > a:first-of-type {
          left: 833px !important;
          top: 0 !important;
        }

        #${HEADER_BRAND_ID} {
          position: absolute !important;
          left: 238px !important;
          top: -10px !important;
          width: 235px !important;
          height: 48px !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          pointer-events: none !important;
          z-index: 20 !important;
        }

        #${HEADER_BRAND_ID} img {
          width: 42px !important;
          height: 42px !important;
          flex: 0 0 42px !important;
          border-radius: 12px !important;
          object-fit: cover !important;
          box-shadow: 0 5px 16px rgba(79, 48, 210, .18) !important;
        }

        #${HEADER_BRAND_ID} .glueful-app-brand-copy {
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          line-height: 1 !important;
          min-width: 0 !important;
        }

        #${HEADER_BRAND_ID} .glueful-app-brand-name {
          font-family: Inter, system-ui, sans-serif !important;
          font-size: 18px !important;
          line-height: 21px !important;
          font-weight: 700 !important;
          color: #15213a !important;
          letter-spacing: -.2px !important;
        }

        #${HEADER_BRAND_ID} .glueful-app-brand-date {
          margin-top: 3px !important;
          font-family: Inter, system-ui, sans-serif !important;
          font-size: 11px !important;
          line-height: 14px !important;
          font-weight: 500 !important;
          color: #66738d !important;
        }

        #${HEADER_PROFILE_ID} {
          position: absolute !important;
          left: 1052px !important;
          top: -1px !important;
          width: 40px !important;
          height: 40px !important;
          border: 0 !important;
          border-radius: 50% !important;
          background: #18212d !important;
          color: #ffffff !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          cursor: pointer !important;
          z-index: 30 !important;
          box-shadow: none !important;
        }

        #${HEADER_PROFILE_ID} svg {
          width: 16px !important;
          height: 16px !important;
          stroke: currentColor !important;
        }

        /* --------------------------------------------------------------
           SEARCH / FILTERS / LIST
           -------------------------------------------------------------- */
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

        body #view-applications > .glueful-applications-main-wide {
          margin-top: 11px !important;
        }

        body #view-applications input[type="search"],
        body #view-applications input[placeholder*="Search"],
        body #view-applications input[placeholder*="search"] {
          width: 100% !important;
          height: 44px !important;
          min-height: 44px !important;
          max-width: none !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 0 16px 0 42px !important;
          border: 1px solid #e1e6ef !important;
          border-radius: 12px !important;
          background: #ffffff !important;
          color: #26324a !important;
          box-shadow: 0 1px 3px rgba(28, 38, 62, .025) !important;
          box-sizing: border-box !important;
          outline: none !important;
        }

        body #view-applications input[type="search"]::placeholder,
        body #view-applications input[placeholder*="Search"]::placeholder,
        body #view-applications input[placeholder*="search"]::placeholder {
          color: #64728b !important;
          opacity: 1 !important;
        }

        body #view-applications > .glueful-applications-main-centered {
          margin-top: 18px !important;
        }

        body #view-applications > .glueful-applications-main-wide + .glueful-applications-main-centered {
          margin-top: 18px !important;
        }

        /* Filter pills remain compact and left aligned. */
        body #view-applications .glueful-applications-main-centered button,
        body #view-applications .glueful-applications-main-centered [role="button"] {
          border-radius: 14px !important;
          box-shadow: none !important;
        }

        /* Application cards match the reference's large horizontal rows. */
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
          border: 1px solid #e2e7ef !important;
          border-radius: 16px !important;
          box-shadow: 0 3px 13px rgba(30, 40, 70, .035) !important;
          box-sizing: border-box !important;
        }

        body #view-applications .application-card + .application-card,
        body #view-applications .job-application-card + .job-application-card,
        body #view-applications [class*="application-card"] + [class*="application-card"] {
          margin-top: 18px !important;
        }

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

        body #view-applications .application-card button,
        body #view-applications .job-application-card button {
          border-radius: 11px !important;
          box-shadow: none !important;
        }

        /* Never let an older layout transform this page. */
        body #view-applications > * {
          box-sizing: border-box !important;
        }

        body #view-applications > *:not(.view-header) {
          transform: none !important;
        }
      }

      @media (min-width: 768px) and (max-width: 1279px) {
        body #view-applications {
          width: calc(100vw - 245px) !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 24px 28px 48px !important;
          box-sizing: border-box !important;
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
          min-width: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        #${HEADER_BRAND_ID}, #${HEADER_PROFILE_ID} { display: none !important; }
      }

      @media (max-width: 767px) {
        body #view-applications {
          width: 100% !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 16px 13px 96px !important;
          box-sizing: border-box !important;
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
        #${HEADER_BRAND_ID}, #${HEADER_PROFILE_ID} { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function createReferenceHeader(view) {
    const header = view.querySelector(':scope > .view-header');
    if (!header) return;

    if (!document.getElementById(HEADER_BRAND_ID)) {
      const brand = document.createElement('div');
      brand.id = HEADER_BRAND_ID;
      brand.innerHTML = `
        <img src="./icons/icon-192.png" alt="Glueful" />
        <div class="glueful-app-brand-copy">
          <div class="glueful-app-brand-name">Glueful</div>
          <div class="glueful-app-brand-date"></div>
        </div>
      `;
      header.appendChild(brand);
    }

    const dateNode = document.querySelector('#' + HEADER_BRAND_ID + ' .glueful-app-brand-date');
    if (dateNode) {
      const now = new Date();
      dateNode.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }

    if (!document.getElementById(HEADER_PROFILE_ID)) {
      const profile = document.createElement('button');
      profile.id = HEADER_PROFILE_ID;
      profile.type = 'button';
      profile.setAttribute('aria-label', 'Profile & Settings');
      profile.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="3.2"></circle>
          <path d="M5.7 19c.9-3 3.1-4.6 6.3-4.6s5.4 1.6 6.3 4.6"></path>
        </svg>
      `;
      profile.addEventListener('click', function () {
        const candidates = Array.from(document.querySelectorAll('a,button,[role="button"]'));
        const target = candidates.find(function (el) {
          if (el.id === HEADER_PROFILE_ID) return false;
          const text = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
          return text.includes('profile & settings') || text.includes('profile and settings');
        });
        if (target) target.click();
      });
      header.appendChild(profile);
    }
  }

  function normalize(view) {
    installStyles();
    createReferenceHeader(view);
  }

  function sync() {
    const view = document.getElementById('view-applications');
    if (!active(view)) return;
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
