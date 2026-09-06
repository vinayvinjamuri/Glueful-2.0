/* Glueful — Applications Reference V3
 * Single source-of-truth presentation for the Applications page.
 * Rebuilt from the supplied reference screenshot.
 * Existing application data, navigation and CRUD handlers remain untouched.
 */
(function () {
  'use strict';

  if (window.__GLUEFUL_APPLICATIONS_REFERENCE_V3__) return;
  window.__GLUEFUL_APPLICATIONS_REFERENCE_V3__ = true;

  const VIEW_ID = 'view-applications';
  const RAIL_ID = 'glueful-applications-reference-rail-v3';
  const BRAND_ID = 'glueful-applications-reference-brand-v3';
  const PROFILE_ID = 'glueful-applications-reference-profile-v3';
  const STYLE_ID = 'glueful-applications-reference-v3-style';

  function getView() {
    return document.getElementById(VIEW_ID);
  }

  function active() {
    const view = getView();
    return !!view && (view.classList.contains('active') || view.style.display === 'block');
  }

  function findLogoSrc() {
    const candidates = [
      document.querySelector('#sidebar img'),
      document.querySelector('nav img'),
      document.querySelector('aside img'),
      ...Array.from(document.images || [])
    ];
    for (const img of candidates) {
      if (img && img.src && !img.src.startsWith('data:')) return img.src;
    }
    return './icons/icon-192.png';
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html, body {
        overflow-x: hidden !important;
      }

      @media (min-width: 1280px) {
        body #${VIEW_ID} {
          position: fixed !important;
          left: 245px !important;
          right: 0 !important;
          top: 0 !important;
          bottom: 0 !important;
          width: auto !important;
          height: 100vh !important;
          min-height: 100vh !important;
          margin: 0 !important;
          padding: 24px 0 48px 27px !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          transform: none !important;
          background: #f7f8fc !important;
          color: #172039 !important;
        }

        /* Remove every older Applications utility rail. V3 owns the rail. */
        body #${VIEW_ID} > #glueful-applications-rail-v2,
        body #${VIEW_ID} > #glueful-applications-workspace-v1,
        body #${VIEW_ID} #glueful-applications-rail-v2,
        body #${VIEW_ID} #glueful-applications-workspace-v1 {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        /* ------------------------------------------------------------
           LEFT UTILITY RAIL — exact reference position
           x ≈ 272, width ≈ 370 at the supplied desktop viewport.
           ------------------------------------------------------------ */
        body #${RAIL_ID} {
          position: absolute !important;
          left: 27px !important;
          top: 22px !important;
          width: 370px !important;
          max-width: 370px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 16px !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          z-index: 100 !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        body #${RAIL_ID} .gf-v3-card {
          width: 370px !important;
          box-sizing: border-box !important;
          background: #fff !important;
          border: 1px solid #e5e9f1 !important;
          border-radius: 15px !important;
          box-shadow: 0 4px 18px rgba(24,35,62,.045) !important;
          color: #172039 !important;
        }

        body #${RAIL_ID} .gf-v3-insights {
          min-height: 316px !important;
          padding: 18px !important;
        }

        body #${RAIL_ID} .gf-v3-upcoming {
          min-height: 197px !important;
          padding: 18px !important;
        }

        body #${RAIL_ID} .gf-v3-quick {
          min-height: 292px !important;
          padding: 18px !important;
        }

        /* ------------------------------------------------------------
           APPLICATIONS COLUMN — exact reference position
           x ≈ 675, width ≈ 952 at the supplied desktop viewport.
           ------------------------------------------------------------ */
        body #${VIEW_ID} > .view-header,
        body #${VIEW_ID} > .glueful-applications-main-wide,
        body #${VIEW_ID} > .glueful-applications-main-centered {
          width: 952px !important;
          max-width: 952px !important;
          min-width: 0 !important;
          margin-left: 430px !important;
          margin-right: 0 !important;
          box-sizing: border-box !important;
          transform: none !important;
        }

        body #${VIEW_ID} > .view-header {
          position: relative !important;
          height: 70px !important;
          min-height: 70px !important;
          margin-top: 0 !important;
          margin-bottom: 22px !important;
          padding: 0 !important;
          display: block !important;
        }

        body #${VIEW_ID} .view-title {
          margin: 0 0 5px !important;
          font-size: 36px !important;
          line-height: 39px !important;
          letter-spacing: -1.35px !important;
          font-weight: 750 !important;
          color: #172039 !important;
        }

        body #${VIEW_ID} .view-subtitle {
          margin: 0 !important;
          font-size: 16px !important;
          line-height: 22px !important;
          color: #72809d !important;
        }

        /* Preserve the real Add button's click handler. */
        body #${VIEW_ID} > .view-header > button,
        body #${VIEW_ID} > .view-header > a {
          position: absolute !important;
          inset: auto !important;
          transform: none !important;
          margin: 0 !important;
        }

        body #${VIEW_ID} > .view-header > button:first-of-type,
        body #${VIEW_ID} > .view-header > a:first-of-type {
          left: 870px !important;
          top: 0 !important;
        }

        /* Brand block from the reference. */
        body #${BRAND_ID} {
          position: absolute !important;
          left: 238px !important;
          top: -9px !important;
          width: 190px !important;
          height: 48px !important;
          display: flex !important;
          align-items: center !important;
          gap: 9px !important;
          margin: 0 !important;
          padding: 0 !important;
          pointer-events: none !important;
          z-index: 200 !important;
          box-sizing: border-box !important;
        }

        body #${BRAND_ID} img {
          width: 42px !important;
          height: 42px !important;
          flex: 0 0 42px !important;
          border-radius: 12px !important;
          object-fit: cover !important;
          box-shadow: 0 5px 16px rgba(79,48,210,.18) !important;
        }

        body #${BRAND_ID} .gf-v3-brand-copy {
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          line-height: 1 !important;
        }

        body #${BRAND_ID} .gf-v3-brand-name {
          font: 700 18px/21px Inter, system-ui, sans-serif !important;
          color: #15213a !important;
          letter-spacing: -.2px !important;
        }

        body #${BRAND_ID} .gf-v3-brand-date {
          margin-top: 3px !important;
          font: 500 11px/14px Inter, system-ui, sans-serif !important;
          color: #66738d !important;
        }

        /* Profile button in the top-right, matching the reference. */
        body #${PROFILE_ID} {
          position: absolute !important;
          left: 752px !important;
          top: -1px !important;
          width: 40px !important;
          height: 40px !important;
          padding: 0 !important;
          margin: 0 !important;
          border: 0 !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #18212d !important;
          color: #fff !important;
          z-index: 210 !important;
          cursor: pointer !important;
          box-sizing: border-box !important;
        }

        body #${PROFILE_ID} svg {
          width: 16px !important;
          height: 16px !important;
          stroke: currentColor !important;
        }

        /* Search / filter / application list occupy only the right column. */
        body #${VIEW_ID} > .glueful-applications-main-wide {
          margin-top: 0 !important;
        }

        body #${VIEW_ID} > .glueful-applications-main-centered {
          margin-top: 14px !important;
        }

        body #${VIEW_ID} > .glueful-applications-main-wide + .glueful-applications-main-centered {
          margin-top: 14px !important;
        }

        body #${VIEW_ID} input[type="search"],
        body #${VIEW_ID} input[placeholder*="Search"],
        body #${VIEW_ID} input[placeholder*="search"] {
          width: 952px !important;
          max-width: 952px !important;
          height: 48px !important;
          min-height: 48px !important;
          margin: 0 !important;
          padding: 0 16px 0 46px !important;
          border: 1px solid #e1e6ef !important;
          border-radius: 12px !important;
          background: #fff !important;
          color: #25324c !important;
          box-shadow: 0 1px 2px rgba(20,30,60,.025) !important;
          box-sizing: border-box !important;
        }

        body #${VIEW_ID} .application-card,
        body #${VIEW_ID} .job-application-card,
        body #${VIEW_ID} [class*="application-card"] {
          width: 952px !important;
          max-width: 952px !important;
          min-width: 0 !important;
          min-height: 94px !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 15px 16px !important;
          background: #fff !important;
          border: 1px solid #e2e7ef !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 14px rgba(25,35,65,.045) !important;
          box-sizing: border-box !important;
          color: #20283a !important;
        }

        body #${VIEW_ID} .application-card + .application-card,
        body #${VIEW_ID} .job-application-card + .job-application-card,
        body #${VIEW_ID} [class*="application-card"] + [class*="application-card"] {
          margin-top: 18px !important;
        }

        body #${VIEW_ID} > * {
          box-sizing: border-box !important;
        }

        body #${VIEW_ID} > *:not(.view-header):not(#${RAIL_ID}) {
          transform: none !important;
        }
      }

      /* --------------------------------------------------------------
         RAIL CARD CONTENT
         -------------------------------------------------------------- */
      .gf-v3-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 16px;
      }
      .gf-v3-card-head h3 {
        margin: 0;
        font: 750 17px/21px Inter, system-ui, sans-serif;
        letter-spacing: -.3px;
        color: #172039;
      }
      .gf-v3-month {
        height: 38px;
        padding: 0 12px;
        border: 1px solid #e3e7ef;
        border-radius: 10px;
        background: #fff;
        color: #25324c;
        font: 600 12px/38px Inter, system-ui, sans-serif;
      }
      .gf-v3-month span { margin-left: 12px; font-size: 13px; }
      .gf-v3-insight-body {
        display: flex;
        align-items: center;
        gap: 24px;
        margin: 4px 0 20px;
      }
      .gf-v3-donut {
        position: relative;
        width: 132px;
        height: 132px;
        flex: 0 0 132px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: conic-gradient(#6841ee 0 72%, #356ef6 72% 100%);
      }
      .gf-v3-donut::after {
        content: '';
        position: absolute;
        inset: 18px;
        border-radius: 50%;
        background: #fff;
      }
      .gf-v3-donut strong, .gf-v3-donut small { position: relative; z-index: 1; }
      .gf-v3-donut strong { font: 700 21px/22px Inter, system-ui, sans-serif; color: #172039; }
      .gf-v3-donut small { margin-top: 4px; font: 500 10px/12px Inter, system-ui, sans-serif; color: #75819b; }
      .gf-v3-legend { flex: 1; display: flex; flex-direction: column; gap: 14px; }
      .gf-v3-legend div { display: flex; align-items: center; gap: 9px; font: 500 12px/15px Inter, system-ui, sans-serif; color: #65728d; }
      .gf-v3-legend i { width: 10px; height: 10px; flex: 0 0 10px; border-radius: 50%; }
      .gf-v3-legend .applied { background: #f5bc32; }
      .gf-v3-legend .interview { background: #3f72f5; }
      .gf-v3-legend .offer { background: #15c48a; }
      .gf-v3-legend .rejected { background: #ef4b58; }
      .gf-v3-legend b { margin-left: auto; font-weight: 600; color: #26314b; }
      .gf-v3-tip {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        padding: 13px 12px;
        border-radius: 12px;
        background: #f7f6ff;
        color: #63708b;
        font: 500 12px/17px Inter, system-ui, sans-serif;
      }
      .gf-v3-tip span { font-size: 18px; line-height: 18px; }
      .gf-v3-tip p { margin: 0; }
      .gf-v3-tip b { color: #4d40d9; }
      .gf-v3-link { color: #4638e8; font: 700 12px/16px Inter, system-ui, sans-serif; text-decoration: none; }
      .gf-v3-action {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-top: 1px solid #f0f2f6;
      }
      .gf-v3-action:first-of-type { border-top: 0; padding-top: 0; }
      .gf-v3-action-icon {
        width: 38px;
        height: 38px;
        flex: 0 0 38px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: #f3f5f9;
        color: #6b7892;
        font-size: 22px;
      }
      .gf-v3-action-icon.check { background: #eafaf2; color: #12b879; font-size: 19px; }
      .gf-v3-action b { display: block; font: 600 13px/16px Inter, system-ui, sans-serif; color: #26314b; }
      .gf-v3-action small { display: block; margin-top: 4px; font: 500 11px/14px Inter, system-ui, sans-serif; color: #77839b; }
      .gf-v3-action small.red { color: #ef4b58; }
      .gf-v3-quick button {
        width: 100%;
        height: 42px;
        display: flex;
        align-items: center;
        gap: 11px;
        margin-top: 7px;
        padding: 0 12px;
        border: 1px solid #e4e8f0;
        border-radius: 10px;
        background: #fafbfe;
        color: #33405a;
        font: 500 12px/42px Inter, system-ui, sans-serif;
        text-align: left;
        cursor: pointer;
        box-sizing: border-box;
      }
      .gf-v3-quick button span { width: 25px; text-align: center; font-size: 18px; color: #46536c; }
      .gf-v3-quick button .purple {
        width: 25px; height: 25px; line-height: 23px;
        border-radius: 50%; color: #fff;
        background: linear-gradient(135deg,#7445ef,#4d67ee);
        font-size: 20px;
      }

      @media (min-width: 768px) and (max-width: 1279px) {
        body #${VIEW_ID} { width: calc(100vw - 245px) !important; margin: 0 !important; padding: 24px 28px 48px !important; box-sizing: border-box !important; }
        body #${RAIL_ID} { display: none !important; }
        body #${VIEW_ID} > .view-header,
        body #${VIEW_ID} > .glueful-applications-main-wide,
        body #${VIEW_ID} > .glueful-applications-main-centered { width: 100% !important; max-width: none !important; margin-left: 0 !important; }
        body #${BRAND_ID}, body #${PROFILE_ID} { display: none !important; }
      }

      @media (max-width: 767px) {
        body #${VIEW_ID} { width: 100% !important; margin: 0 !important; padding: 16px 13px 96px !important; box-sizing: border-box !important; }
        body #${RAIL_ID} { display: none !important; }
        body #${VIEW_ID} > .view-header,
        body #${VIEW_ID} > .glueful-applications-main-wide,
        body #${VIEW_ID} > .glueful-applications-main-centered { width: 100% !important; max-width: none !important; margin-left: 0 !important; }
        body #${BRAND_ID}, body #${PROFILE_ID} { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function createBrand(view) {
    let brand = document.getElementById(BRAND_ID);
    if (brand) return brand;

    brand = document.createElement('div');
    brand.id = BRAND_ID;
    brand.innerHTML = `
      <img alt="Glueful" src="${findLogoSrc()}">
      <div class="gf-v3-brand-copy">
        <span class="gf-v3-brand-name">Glueful</span>
        <span class="gf-v3-brand-date">Sunday, Sep 6</span>
      </div>
    `;
    const header = view.querySelector(':scope > .view-header');
    if (header) header.appendChild(brand);
    return brand;
  }

  function createProfile(view) {
    let profile = document.getElementById(PROFILE_ID);
    if (profile) return profile;

    profile = document.createElement('button');
    profile.id = PROFILE_ID;
    profile.type = 'button';
    profile.setAttribute('aria-label', 'Profile and settings');
    profile.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2"></circle>
        <path d="M5.8 19c.9-3.1 3.1-4.7 6.2-4.7s5.3 1.6 6.2 4.7"></path>
      </svg>
    `;

    profile.addEventListener('click', function () {
      const candidates = Array.from(document.querySelectorAll('button,a,[role="button"]'));
      const target = candidates.find(el => {
        if (el === profile) return false;
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
        const aria = el.getAttribute('aria-label') || '';
        return /profile|settings|account/i.test(text + ' ' + aria);
      });
      if (target) target.click();
    });

    const header = view.querySelector(':scope > .view-header');
    if (header) header.appendChild(profile);
    return profile;
  }

  function createRail(view) {
    let rail = document.getElementById(RAIL_ID);
    if (rail) return rail;

    rail = document.createElement('aside');
    rail.id = RAIL_ID;
    rail.setAttribute('aria-label', 'Application insights and quick actions');
    rail.innerHTML = `
      <section class="gf-v3-card gf-v3-insights">
        <div class="gf-v3-card-head">
          <h3>Application Insights</h3>
          <button class="gf-v3-month" type="button">This Month <span>⌄</span></button>
        </div>
        <div class="gf-v3-insight-body">
          <div class="gf-v3-donut"><strong>5</strong><small>Total</small></div>
          <div class="gf-v3-legend">
            <div><i class="applied"></i><span>Applied</span><b>5</b></div>
            <div><i class="interview"></i><span>Interview</span><b>0</b></div>
            <div><i class="offer"></i><span>Offer</span><b>0</b></div>
            <div><i class="rejected"></i><span>Rejected</span><b>0</b></div>
          </div>
        </div>
        <div class="gf-v3-tip"><span>💡</span><p><b>Tip:</b> Add interview dates and notes to track your progress better.</p></div>
      </section>

      <section class="gf-v3-card gf-v3-upcoming">
        <div class="gf-v3-card-head">
          <h3>Upcoming Actions</h3>
          <a class="gf-v3-link" href="#" data-gf-v3-action="calendar">View all</a>
        </div>
        <div class="gf-v3-action">
          <span class="gf-v3-action-icon">◷</span>
          <div><b>No upcoming interviews</b><small>You're all caught up! 🎉</small></div>
        </div>
        <div class="gf-v3-action">
          <span class="gf-v3-action-icon check">✓</span>
          <div><b>Follow ups</b><small class="red">1 application needs attention</small></div>
        </div>
      </section>

      <section class="gf-v3-card gf-v3-quick">
        <div class="gf-v3-card-head"><h3>Quick Actions</h3></div>
        <button type="button" data-gf-v3-action="add"><span class="purple">＋</span>Add New Application</button>
        <button type="button" data-gf-v3-action="resume"><span>▤</span>Import from Resume</button>
        <button type="button" data-gf-v3-action="calendar"><span>▣</span>View Calendar</button>
        <button type="button" data-gf-v3-action="export"><span>⇩</span>Export Applications</button>
      </section>
    `;

    view.appendChild(rail);

    rail.addEventListener('click', function (event) {
      const control = event.target.closest('[data-gf-v3-action]');
      if (!control) return;
      event.preventDefault();

      const type = control.dataset.gfV3Action;
      const candidates = Array.from(document.querySelectorAll('button,a,[role="button"]')).filter(el => el !== control);
      let pattern;
      if (type === 'calendar') pattern = /calendar|interview/i;
      else if (type === 'resume') pattern = /import.*resume|resume/i;
      else if (type === 'export') pattern = /export/i;
      else pattern = /add.*application|new application/i;

      const target = candidates.find(el => pattern.test((el.textContent || '').replace(/\s+/g, ' ')));
      if (target) target.click();
    });

    return rail;
  }

  function sync() {
    const view = getView();
    if (!view || !active()) return;

    installStyles();
    createBrand(view);
    createProfile(view);
    createRail(view);
  }

  function start() {
    sync();
    [100, 400, 1000, 1800].forEach(delay => setTimeout(sync, delay));

    const observer = new MutationObserver(() => {
      if (active()) sync();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();