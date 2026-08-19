/* GLUEFUL Resume Studio — header alignment compatibility layer
 *
 * V2 is now the single authoritative header geometry engine. It resolves
 * word/_rels/headerN.xml.rels and word/_rels/document.xml.rels directly,
 * including the embedded logo, and applies the 794px Word-page geometry.
 *
 * Keeping this shim prevents the legacy alignment observer from fighting the
 * authoritative V2 layer and moving the four-line header back and forth.
 */
(function () {
  'use strict';

  const EDITOR_ID = 'job-resume-editor-text';
  const MODAL_ID = 'job-resume-editor-modal';
  const PAGE_WIDTH = 794;
  const JSZIP_URL = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  const RELATIONSHIP_ROOT = 'word/_rels/';

  function apply() {
    const ed = document.getElementById(EDITOR_ID);
    if (!ed || !ed.classList.contains('glueful-docx-layout-mode')) return;
    console.info('[Glueful Resume Studio] Legacy header alignment disabled; V2 owns DOCX geometry.');
  }

  window.gluefulResumeHeaderAlignment = { apply };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }
})();
