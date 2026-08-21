/* Glueful runtime bridge: keep existing Supabase client and boot the authoritative Jobs UI. */
(function () {
  'use strict';
  try {
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      window.gluefulResumeSupabaseClient = supabaseClient;
    }
  } catch (_) {}

  function loadScript(src, attr, onload) {
    if (document.querySelector(`script[${attr}="1"]`)) return;
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.setAttribute(attr, '1');
    s.onload = onload || null;
    s.onerror = (e) => console.error('[Glueful runtime] Failed:', src, e);
    document.head.appendChild(s);
  }

  function bootJobs() {
    if (!document.getElementById('jobs-view')) return;
    loadScript('./glueful-jobs-discover-v16-authoritative.js?v=20260821-jobs-v16', 'data-glueful-jobs-v16', () => {
      loadScript('./glueful-jobs-resume-action-v1.js?v=20260821-resume-action2', 'data-glueful-jobs-resume-action-v1');
      loadScript('./glueful-jobs-logo-patch-v1.js?v=20260821-brand-fetch2', 'data-glueful-jobs-brand-fetch-v1');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootJobs, { once: true });
  else bootJobs();
})();
