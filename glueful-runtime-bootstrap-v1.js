/* Glueful Runtime Bootstrap V1
 * Phase 1: one idempotent runtime entry point.
 * The service worker injects this file once; feature runtimes are loaded here
 * in a deterministic order so individual feature patches cannot become
 * competing navigation bootstrap paths.
 */
(function () {
  'use strict';
  if (window.__GLUEFUL_RUNTIME_BOOTSTRAP_V1__) return;
  window.__GLUEFUL_RUNTIME_BOOTSTRAP_V1__ = true;

  const VERSION = '20260823-phase1-runtime1';
  const scripts = [
    './glueful-resume-render-diagnostics.js',
    './glueful-resume-fixed-page-bootstrap.js',
    './glueful-resume-viewer-v1.js',
    './glueful-jobs-auth-bootstrap-v1.js',
    './glueful-jobs-discover-v15-authoritative.js',
    './glueful-jobs-relevance-v1.js',
    './glueful-resume-studio-supabase-bridge.js',
    './glueful-jobs-resume-action-v1.js',
    './glueful-jobs-feed-recovery-v2.js',
    './glueful-jobs-logo-patch-v1.js',
    './glueful-jobs-mobile-card-polish-v1.js',
    './glueful-jobs-mobile-ux-v15.js',
    './glueful-jobs-smooth-logos-v1.js',
    './glueful-jobs-official-link-guard-v1.js',
    './glueful-mobile-update-guard-v1.js',
    './glueful-app-branding-v1.js'
  ];

  const loaded = new Set();

  function load(src) {
    return new Promise((resolve, reject) => {
      if (loaded.has(src)) return resolve();
      const selector = `script[data-glueful-runtime-src="${src}"]`;
      const existing = document.querySelector(selector);
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          loaded.add(src);
          return resolve();
        }
        existing.addEventListener('load', () => { loaded.add(src); resolve(); }, { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = `${src}?v=${VERSION}`;
      script.async = false;
      script.dataset.gluefulRuntimeSrc = src;
      script.dataset.loaded = 'false';
      script.onload = () => {
        loaded.add(src);
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      (document.head || document.documentElement).appendChild(script);
    });
  }

  async function boot() {
    const failures = [];
    for (const src of scripts) {
      try {
        await load(src);
      } catch (error) {
        failures.push({ src, message: String(error?.message || error) });
        console.error('[Glueful Runtime] Failed:', src, error);
      }
    }

    window.__GLUEFUL_RUNTIME_BOOTSTRAP_COMPLETE__ = true;
    window.__GLUEFUL_RUNTIME_BOOTSTRAP_FAILURES__ = failures;
    console.info('[Glueful Runtime] Phase 1 bootstrap complete:', {
      loaded: loaded.size,
      total: scripts.length,
      failures: failures.length
    });
  }

  function start() {
    if (window.__GLUEFUL_RUNTIME_BOOT_STARTED__) return;
    window.__GLUEFUL_RUNTIME_BOOT_STARTED__ = true;
    void boot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
