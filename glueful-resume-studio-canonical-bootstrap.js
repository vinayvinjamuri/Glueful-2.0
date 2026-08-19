/* =========================================================
   GLUEFUL RESUME STUDIO — ARCHITECTURE E BOOTSTRAP
   Canonical model + DOCX importer + fixed-page renderer + controller.
   Legacy fidelity patches are intentionally not loaded by this bootstrap.
   ========================================================= */
(function () {
  'use strict';

  window.GLUEFUL_RESUME_CANONICAL_RENDERER = true;

  const assets = [
    ['./glueful-resume-canonical-model.js', 'glueful-canonical-model-runtime'],
    ['./glueful-resume-docx-importer-v2.js', 'glueful-canonical-docx-importer-runtime'],
    ['./glueful-resume-canonical-renderer.js', 'glueful-canonical-renderer-runtime'],
    ['./glueful-resume-studio-canonical-controller.js', 'glueful-canonical-controller-runtime']
  ];

  function load(src, id) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) {
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = `${src}?v=20260819-e1`;
      script.async = false;
      script.dataset.gluefulCanonicalRuntime = '1';
      script.onload = () => { script.dataset.loaded = 'true'; resolve(); };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  }

  async function boot() {
    try {
      for (const [src, id] of assets) await load(src, id);
      console.info('[Glueful Resume Studio] Architecture E bootstrap ready.');
    } catch (error) {
      console.error('[Glueful Resume Studio] Architecture E bootstrap failed:', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else void boot();
})();
