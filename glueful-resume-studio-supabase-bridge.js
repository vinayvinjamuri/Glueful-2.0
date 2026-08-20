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

  function loadJobsResumeActionRuntime() {
    if (!document.getElementById('jobs-view')) return;
    if (window.__GLUEFUL_JOBS_RESUME_ACTION_V1__ || window.gluefulJobsResumeActionV1) return;

    const existing = document.querySelector(
      'script[data-glueful-jobs-resume-action="1"]'
    );
    if (existing) return;

    const script = document.createElement('script');
    script.src = './glueful-jobs-resume-action-v1.js?v=20260821-resume-action1';
    script.async = false;
    script.dataset.gluefulJobsResumeAction = '1';
    script.onload = function () {
      console.info('[Glueful Jobs] Resume Studio action + logo fallback loaded.');
    };
    script.onerror = function (error) {
      console.error('[Glueful Jobs] Resume Studio action failed to load:', error);
    };
    document.head.appendChild(script);
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

    /* If V15 was already injected by the service worker, do not load it a
     * second time; still load the Resume Studio action layer. */
    if (window.__GLUEFUL_JOBS_V15__ || window.gluefulJobsV15) {
      loadJobsResumeActionRuntime();
      return;
    }

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
      loadJobsResumeActionRuntime();
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
