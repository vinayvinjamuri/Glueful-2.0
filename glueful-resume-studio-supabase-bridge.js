/* Resume Studio runtime bridge: expose the existing Supabase client safely.
 * The app creates it as a top-level const, which is not a window property.
 * The Adobe controller therefore cannot rely on window.supabaseClient.
 */
(function () {
  'use strict';
  try {
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      window.gluefulResumeSupabaseClient = supabaseClient;
      console.info('[Glueful Resume Studio] Supabase client bridge ready.');
    } else {
      console.error('[Glueful Resume Studio] Existing Supabase client is not available.');
    }
  } catch (error) {
    console.error('[Glueful Resume Studio] Supabase bridge failed:', error);
  }

  /*
   * Jobs V15 must not depend on the service worker to become visible.
   * index.html already loads this bridge on every page, so use it as the
   * direct runtime bootstrap for the authoritative Jobs renderer.
   * The loader is deliberately conditional: Resume Studio and all other
   * screens are untouched when #jobs-view is not present.
   */
  function loadAuthoritativeJobsRuntime() {
    if (!document.getElementById('jobs-view')) return;
    if (window.__GLUEFUL_JOBS_V15__ || window.gluefulJobsV15) return;

    const existing = document.querySelector(
      'script[data-glueful-direct-jobs-v15="1"]'
    );
    if (existing) return;

    const script = document.createElement('script');
    script.src = './glueful-jobs-discover-v15-authoritative.js?v=20260821-jobs-v15-direct';
    script.async = false;
    script.dataset.gluefulDirectJobsV15 = '1';
    script.onload = function () {
      console.info('[Glueful Jobs] V15 loaded directly from index-mounted runtime.');
    };
    script.onerror = function (error) {
      console.error('[Glueful Jobs] V15 direct runtime failed to load:', error);
    };
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAuthoritativeJobsRuntime, { once: true });
  } else {
    loadAuthoritativeJobsRuntime();
  }
})();
