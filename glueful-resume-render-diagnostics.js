/* GLUEFUL RESUME STUDIO — exact runtime diagnostics
 * This is intentionally diagnostic-only. It does not alter conversion,
 * editor content, master resume data, or layout.
 *
 * IMPORTANT: the fixed-PDF bootstrap is loaded directly from this runtime
 * as well as defensively through the service worker. This removes the
 * first-load/service-worker-control race that previously allowed the legacy
 * Adobe controller to remain authoritative.
 */
(function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;');
  }

  function show(report) {
    if (!report || report.renderer !== 'error') return;
    const editor = document.getElementById('job-resume-editor-text');
    if (!editor) return;
    const message = String(report.error || 'Unknown Resume Studio renderer error');
    const stack = String(report.stack || '');
    const stage = String(report.stage || 'unknown');
    editor.innerHTML = `
      <div class="glueful-resume-exact-error" style="margin:24px;padding:24px;border:1px solid #d66;border-radius:10px;background:#fff8f8;color:#351010;font:14px/1.5 Inter,Arial,sans-serif;">
        <div style="font-size:18px;font-weight:700;margin-bottom:10px">Resume Studio diagnostic failure</div>
        <div style="font-weight:700">Stage: ${esc(stage)}</div>
        <pre style="white-space:pre-wrap;word-break:break-word;margin:12px 0;padding:14px;background:#fff0f0;border-radius:6px">${esc(message)}</pre>
        ${stack ? `<details><summary>Stack trace</summary><pre style="white-space:pre-wrap;word-break:break-word">${esc(stack)}</pre></details>` : ''}
        <div style="margin-top:14px;font-size:12px;color:#633">This diagnostic does not modify the master resume.</div>
      </div>`;
    editor.contentEditable = 'false';
  }

  window.gluefulShowExactResumeRendererError = show;

  let last = '';
  const tick = () => {
    const report = window.gluefulResumeRendererReport;
    const signature = JSON.stringify(report || null);
    if (signature !== last) {
      last = signature;
      if (report?.renderer === 'error') show(report);
    }
  };

  window.setInterval(tick, 250);
  window.addEventListener('glueful:resume-render-error', (event) => show(event.detail));
  tick();

  function loadFixedPdfBootstrap() {
    if (document.getElementById('glueful-fixed-pdf-bootstrap-direct')) return;
    const script = document.createElement('script');
    script.id = 'glueful-fixed-pdf-bootstrap-direct';
    script.src = './glueful-resume-fixed-page-bootstrap.js?v=20260820-fixedpdf20';
    script.async = false;
    script.dataset.gluefulRuntime = 'fixed-pdf-direct';
    script.onload = () => console.info('[Glueful Resume Studio] FIXED PDF bootstrap loaded directly from page runtime.');
    script.onerror = () => console.error('[Glueful Resume Studio] FIXED PDF bootstrap direct load failed.');
    (document.body || document.head).appendChild(script);
  }

  /*
   * Do not depend on service-worker control for the authoritative renderer.
   * The SW remains a cache/injection defence, but the page itself guarantees
   * that the fixed-PDF runtime is loaded on every normal app load.
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFixedPdfBootstrap, { once: true });
  } else {
    loadFixedPdfBootstrap();
  }

  /* Header fidelity is intentionally disabled in the current fixed-PDF phase.
   * The legacy runtime is not present in the repository and must not be
   * requested from production. Fixed-PDF owns the resume artwork here. */
})();