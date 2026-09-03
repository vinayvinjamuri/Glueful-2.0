/* Glueful — Feature Loader V1
 * Loads feature-specific JavaScript only when its view becomes active.
 * Keeps the initial main thread free from Jobs / Resume / Orbit work.
 */
(function () {
  'use strict';
  if (window.__GLUEFUL_FEATURE_LOADER_V1__) return;
  window.__GLUEFUL_FEATURE_LOADER_V1__ = true;

  const GROUPS = {
    dashboard: [
      './glueful-dashboard-fixed-v1.js',
      './glueful-dashboard-header-fix-v1.js',
      './glueful-dashboard-hamburger-v2.js',
      './glueful-dashboard-approved-v1.js',
      './glueful-dashboard-job-network-removal-v1.js',
      './glueful-profile-instant-open-v1.js'
    ],
    jobs: [
      './glueful-jobs-auth-bootstrap-v1.js',
      './glueful-jobs-discover-v15-authoritative.js',
      './glueful-jobs-relevance-v1.js',
      './glueful-jobs-resume-action-v1.js',
      './glueful-jobs-logo-patch-v1.js',
      './glueful-jobs-mobile-card-polish-v1.js',
      './glueful-jobs-mobile-ux-v15.js',
      './glueful-jobs-smooth-logos-v1.js',
      './glueful-jobs-feed-recovery-v2.js',
      './glueful-jobs-official-link-guard-v1.js',
      './glueful-jobs-logo-recovery-v1.js',
      './glueful-jobs-logo-recovery-v2.js',
      './glueful-jobs-logo-recovery-v3.js',
      './glueful-jobs-brandfetch-final-v1.js',
      './glueful-jobs-page-scroll-fix-v4.js'
    ],
    orbit: [
      './glueful-orbit-bootstrap-v1.js',
      './glueful-orbit-v2.js',
      './glueful-orbit-ui-v3.js',
      './glueful-orbit-ui-v16.js',
      './glueful-orbit-ui-v17.js',
      './glueful-orbit-ai-bridge-v1.js',
      './glueful-orbit-career-engine-v1.js',
      './glueful-orbit-navigation-v1.js',
      './glueful-orbit-stability-v1.js',
      './glueful-orbit-chat-layout-v1.js',
      './glueful-orbit-ime-final-v1.js'
    ],
    resume: [
      './glueful-resume-render-diagnostics.js',
      './glueful-resume-fixed-page-bootstrap.js',
      './glueful-resume-layout-model.js',
      './glueful-resume-pdf-layout-importer.js',
      './glueful-resume-fixed-page-renderer.js',
      './glueful-resume-fixed-page-ux-v6.js',
      './glueful-resume-fixed-page-controller.js',
      './glueful-resume-vector-docx-export-v2.js',
      './glueful-resume-typography-patch-v1.js',
      './glueful-resume-import-guard-v1.js',
      './glueful-resume-pdf-export-fix-v1.js',
      './glueful-resume-viewer-v1.js'
    ],
    gmail: [
      './glueful-gmail-loader-v1.js'
    ]
  };

  const loaded = Object.create(null);
  const loading = Object.create(null);

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[data-glueful-feature-src="' + src + '"]');
      if (existing) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.dataset.gluefulFeatureSrc = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.body.appendChild(s);
    });
  }

  async function loadGroup(name) {
    if (loaded[name]) return;
    if (loading[name]) return loading[name];
    const files = GROUPS[name];
    if (!files) return;

    loading[name] = (async function () {
      for (const src of files) {
        try {
          await loadScript(src);
        } catch (error) {
          console.error('[Glueful] Feature load failed:', name, src, error);
        }
      }
      loaded[name] = true;
    })();

    return loading[name];
  }

  function isActive(id) {
    const el = document.getElementById(id);
    return !!el && (el.classList.contains('active') || el.style.display === 'block');
  }

  function sync() {
    if (isActive('view-dashboard')) void loadGroup('dashboard');
    if (isActive('view-jobs') || document.getElementById('jobs-view')?.closest('.active')) void loadGroup('jobs');
    if (isActive('view-resume')) void loadGroup('resume');
    if (isActive('view-gmail')) void loadGroup('gmail');

    const orbit = document.getElementById('glueful-orbit-v2-root');
    if (orbit && (orbit.classList.contains('open') || orbit.style.display === 'block')) {
      void loadGroup('orbit');
    }
  }

  window.gluefulLoadFeature = loadGroup;
  window.gluefulFeatureLoader = { sync: sync, loaded: loaded, groups: Object.keys(GROUPS) };

  function boot() {
    sync();
    if (!document.body) return;
    const observer = new MutationObserver(function (mutations) {
      let relevant = false;
      for (const m of mutations) {
        if (m.type === 'childList' || (m.type === 'attributes' && m.attributeName === 'class')) {
          relevant = true;
          break;
        }
      }
      if (relevant) sync();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
