/* =========================================================
   GLUEFUL RESUME STUDIO — DOCX FORENSICS
   ---------------------------------------------------------
   Development instrumentation only.
   Captures the real DOCX returned by glueful-pdf-to-docx, reports
   package structure, and identifies whether docx-preview or Mammoth
   actually rendered the editor.
   ========================================================= */
(function () {
  'use strict';

  if (window.__gluefulDocxForensicsInstalled) return;
  window.__gluefulDocxForensicsInstalled = true;

  const FUNCTION_MARKER = '/functions/v1/glueful-pdf-to-docx';
  const JSZIP_URL = 'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js';

  function log(...args) {
    console.info('[Glueful DOCX Forensics]', ...args);
  }

  async function loadJsZip() {
    if (window.JSZip) return window.JSZip;
    return new Promise((resolve, reject) => {
      const existing = document.getElementById('glueful-docx-forensics-jszip');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.JSZip), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = 'glueful-docx-forensics-jszip';
      script.src = JSZIP_URL;
      script.onload = () => resolve(window.JSZip);
      script.onerror = () => reject(new Error('Could not load JSZip for DOCX forensics.'));
      document.head.appendChild(script);
    });
  }

  async function inspectDocx(buffer) {
    try {
      const JSZip = await loadJsZip();
      const zip = await JSZip.loadAsync(buffer);
      const names = Object.keys(zip.files);
      const xmlNames = names.filter((name) => name.endsWith('.xml'));
      const media = names.filter((name) => /^word\/media\//i.test(name));
      const headers = names.filter((name) => /^word\/header\d+\.xml$/i.test(name));
      const footers = names.filter((name) => /^word\/footer\d+\.xml$/i.test(name));
      const drawings = [];
      const textBoxes = [];
      const anchors = [];
      const inlines = [];
      const tables = [];
      const sectionProperties = [];
      const rels = [];

      for (const name of xmlNames) {
        const text = await zip.files[name].async('text');
        const count = (needle) => (text.match(new RegExp(needle, 'g')) || []).length;
        if (name.startsWith('word/')) {
          if (count('<w:drawing') || count(':drawing')) drawings.push({ name, count: count('<w:drawing') || count(':drawing') });
          if (count('<wp:anchor')) anchors.push({ name, count: count('<wp:anchor') });
          if (count('<wp:inline')) inlines.push({ name, count: count('<wp:inline') });
          if (count('<w:tbl')) tables.push({ name, count: count('<w:tbl') });
          if (count('<w:txbxContent')) textBoxes.push({ name, count: count('<w:txbxContent') });
          if (count('<w:sectPr')) sectionProperties.push({ name, count: count('<w:sectPr') });
          if (name.endsWith('.rels')) rels.push({ name, imageRelations: count('/image'), headerRelations: count('/header'), footerRelations: count('/footer') });
        }
      }

      const report = {
        byteLength: buffer.byteLength,
        files: names.length,
        media,
        headers,
        footers,
        drawings,
        anchors,
        inlines,
        tables,
        textBoxes,
        sectionProperties,
        rels
      };

      window.gluefulResumeDocxForensics = report;
      log('Adobe DOCX structure:', report);
      return report;
    } catch (error) {
      console.warn('[Glueful DOCX Forensics] DOCX inspection failed:', error);
      return null;
    }
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = async function (...args) {
    const response = await originalFetch(...args);
    try {
      const input = args[0];
      const url = typeof input === 'string' ? input : input?.url || '';
      if (String(url).includes(FUNCTION_MARKER) && response.ok) {
        const clone = response.clone();
        clone.arrayBuffer().then((buffer) => {
          window.gluefulLastAdobeDocxBuffer = buffer;
          window.downloadGluefulLastAdobeDocx = function () {
            const blob = new Blob([window.gluefulLastAdobeDocxBuffer], {
              type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'glueful-adobe-converted-resume.docx';
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          };
          void inspectDocx(buffer);
          log('Captured Adobe DOCX. Run downloadGluefulLastAdobeDocx() to save it.');
        }).catch((error) => console.warn('[Glueful DOCX Forensics] capture failed:', error));
      }
    } catch (error) {
      console.warn('[Glueful DOCX Forensics] fetch inspection failed:', error);
    }
    return response;
  };

  const observer = new MutationObserver(() => {
    const editor = document.getElementById('job-resume-editor-text');
    if (!editor) return;
    const hasPreview = !!editor.querySelector('.docx-wrapper, .docx > section, .glueful-docx');
    const hasMammoth = !!editor.querySelector('p, h1, h2, h3, table') && !hasPreview;
    if (hasPreview && window.__gluefulLastRenderer !== 'docx-preview') {
      window.__gluefulLastRenderer = 'docx-preview';
      log('EDITOR RENDERER = docx-preview');
    } else if (hasMammoth && window.__gluefulLastRenderer !== 'mammoth-or-flow') {
      window.__gluefulLastRenderer = 'mammoth-or-flow';
      log('EDITOR RENDERER = semantic HTML flow (inspect console for fallback warning)');
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.gluefulResumeDocxForensics = {
    getReport: () => window.gluefulResumeDocxForensics || null,
    getLastRenderer: () => window.__gluefulLastRenderer || null,
    downloadDocx: () => window.downloadGluefulLastAdobeDocx?.()
  };

  log('Instrumentation installed. It will capture the next glueful-pdf-to-docx response.');
})();
