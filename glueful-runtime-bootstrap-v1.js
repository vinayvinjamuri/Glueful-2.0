/* Glueful Runtime Bootstrap V1
 * Phase 1: one controlled, idempotent runtime entry point.
 * The service worker injects this file instead of a competing stack of scripts.
 */
(function () {
  'use strict';
  if (window.__GLUEFUL_RUNTIME_BOOTSTRAP_V1__) return;
  window.__GLUEFUL_RUNTIME_BOOTSTRAP_V1__ = true;

  const scripts = [
    './glueful-resume-render-diagnostics.js',
    './glueful-resume-fixed-page-bootstrap.js',
    './glueful-jobs-auth-bootstrap-v1.js',
    './glueful-jobs-discover-v15-authoritative.js',
    './glueful-jobs-relevance-v1.js',
    './glueful-resume-studio-supabase-bridge.js',
    './glueful-jobs-resume-action-v1.js',
    './glueful-jobs-logo-patch-v1.js',
    './glueful-jobs-mobile-card-polish-v1.js',
    './glueful-jobs-mobile-ux-v15.js',
    './glueful-jobs-official-link-guard-v1.js',
    './glueful-mobile-update-guard-v1.js'
  ];

  const loaded = new Set();
  function load(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-glueful-runtime-src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }
      if (loaded.has(src)) return resolve();
      const script = document.createElement('script');
      script.src = `${src}?v=20260821-phase1-runtime2`;
      script.async = false;
      script.dataset.gluefulRuntimeSrc = src;
      script.onload = () => { loaded.add(src); script.dataset.loaded = 'true'; resolve(); };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      (document.head || document.documentElement).appendChild(script);
    });
  }

  async function boot() {
    for (const src of scripts) {
      try {
        await load(src);
      } catch (error) {
        console.error('[Glueful Runtime] Failed:', src, error);
        window.__GLUEFUL_RUNTIME_BOOTSTRAP_ERROR__ = { src, message: String(error?.message || error) };
        break;
      }
    }
    window.__GLUEFUL_RUNTIME_BOOTSTRAP_COMPLETE__ = true;
    console.info('[Glueful Runtime] Phase 1 bootstrap complete.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void boot(), { once: true });
  else void boot();
})();
