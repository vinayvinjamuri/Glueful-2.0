/* =========================================================
   GLUEFUL RESUME STUDIO — HEADER FIDELITY FIX
   ---------------------------------------------------------
   Keeps the Adobe/DOCX layout intact while recovering a logo that
   docx-preview fails to paint from a DOCX header drawing.

   Important:
   - Never moves the first body paragraphs into a synthetic flex row.
   - Resolves images only from word/header*.xml relationships.
   - Uses the DOCX drawing dimensions/position when available.
   - If an earlier compatibility layer created .glueful-docx-header-recovered,
     unwrap it so the original body flow/alignment is restored.
   ========================================================= */
(function () {
  'use strict';

  const EDITOR_ID = 'job-resume-editor-text';
  const JSZIP_URL = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  const STYLE_ID = 'glueful-resume-header-fidelity-style';
  const DONE_CLASS = 'glueful-header-fidelity-applied';

  const $ = (id) => document.getElementById(id);
  const editor = () => $(EDITOR_ID);

  function loadScriptOnce(src, id) {
    return new Promise((resolve, reject) => {
      if (window.JSZip) return resolve(window.JSZip);
      const existing = document.getElementById(id);
      if (existing) {
        existing.addEventListener('load', () => resolve(window.JSZip), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => resolve(window.JSZip);
      script.onerror = () => reject(new Error('Could not load JSZip.'));
      document.head.appendChild(script);
    });
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${EDITOR_ID} .glueful-docx-header-fidelity-overlay {
        position:absolute !important;
        z-index:4 !important;
        pointer-events:none !important;
        margin:0 !important;
        padding:0 !important;
        line-height:0 !important;
      }
      #${EDITOR_ID} .glueful-docx-header-fidelity-overlay img {
        display:block !important;
        margin:0 !important;
        padding:0 !important;
        border:0 !important;
        max-width:none !important;
        object-fit:contain !important;
      }
      #${EDITOR_ID} .glueful-docx-header-fidelity-layer {
        position:relative !important;
      }
    `;
    document.head.appendChild(style);
  }

  function unwrapLegacyRecovery(ed) {
    const wrappers = Array.from(ed.querySelectorAll('.glueful-docx-header-recovered'));
    if (!wrappers.length) return false;

    wrappers.forEach((wrapper) => {
      const parent = wrapper.parentElement;
      if (!parent) return;
      const textNodes = Array.from(wrapper.querySelectorAll('.glueful-docx-header-text'));
      const movable = textNodes.length
        ? Array.from(textNodes[0].children)
        : Array.from(wrapper.children).filter((node) => node.tagName !== 'IMG');

      movable.forEach((node) => parent.insertBefore(node, wrapper));
      wrapper.remove();
    });

    ed.querySelectorAll('.glueful-docx-header-recovered').forEach((node) => node.remove());
    ed.classList.remove('glueful-docx-image-recovered');
    return true;
  }

  function resolveTarget(headerName, target) {
    const clean = String(target || '').replace(/\\/g, '/');
    if (!clean) return '';
    if (clean.startsWith('/')) return clean.slice(1);
    const base = headerName.slice(0, headerName.lastIndexOf('/') + 1);
    const parts = (base + clean).split('/');
    const out = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') out.pop();
      else out.push(part);
    }
    return out.join('/');
  }

  function mimeFor(name) {
    const ext = String(name).split('.').pop()?.toLowerCase();
    return ({
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      bmp: 'image/bmp',
      svg: 'image/svg+xml',
      tif: 'image/tiff',
      tiff: 'image/tiff'
    })[ext] || '';
  }

  function firstHeaderDrawing(xmlText) {
    const match = String(xmlText || '').match(/<wp:(inline|anchor)\b[\s\S]*?<\/wp:\1>/i);
    if (!match) return null;
    const drawing = match[0];
    const rel = drawing.match(/<a:blip\b[^>]*r:embed=["']([^"']+)["']/i);
    if (!rel) return null;

    const extent = drawing.match(/<wp:extent\b[^>]*cx=["'](\d+)["'][^>]*cy=["'](\d+)["']/i);
    const posH = drawing.match(/<wp:positionH\b[^>]*>[\s\S]*?<wp:posOffset>(-?\d+)<\/wp:posOffset>[\s\S]*?<\/wp:positionH>/i);
    const posV = drawing.match(/<wp:positionV\b[^>]*>[\s\S]*?<wp:posOffset>(-?\d+)<\/wp:posOffset>[\s\S]*?<\/wp:positionV>/i);
    const wrap = drawing.match(/<wp:(wrap[^\s>]*)\b/i);

    return {
      relId: rel[1],
      widthPx: extent ? Number(extent[1]) / 9525 : null,
      heightPx: extent ? Number(extent[2]) / 9525 : null,
      leftPx: posH ? Number(posH[1]) / 9525 : 0,
      topPx: posV ? Number(posV[1]) / 9525 : 0,
      floating: /<wp:anchor\b/i.test(drawing),
      wrap: wrap ? wrap[1] : ''
    };
  }

  async function headerImages(buffer) {
    const JSZip = await loadScriptOnce(JSZIP_URL, 'glueful-header-fidelity-jszip');
    const zip = await JSZip.loadAsync(buffer);
    const names = Object.keys(zip.files);
    const headers = names.filter((name) => /^word\/header\d+\.xml$/i.test(name));
    const found = [];

    for (const headerName of headers) {
      const headerXml = await zip.files[headerName].async('text');
      const drawing = firstHeaderDrawing(headerXml);
      if (!drawing) continue;

      const relName = `${headerName}.rels`.replace(/^word\//, 'word/_rels/');
      const relFile = zip.files[relName];
      if (!relFile) continue;
      const relXml = await relFile.async('text');

      const relDoc = new DOMParser().parseFromString(relXml, 'application/xml');
      const relNode = Array.from(relDoc.getElementsByTagName('Relationship'))
        .find((node) => node.getAttribute('Id') === drawing.relId);
      const relTarget = relNode?.getAttribute('Target') || '';
      if (!relTarget) continue;

      const target = resolveTarget(headerName, relTarget);
      const mediaFile = zip.files[target];
      if (!mediaFile || mediaFile.dir) continue;

      const mime = mimeFor(target);
      if (!mime) {
        console.warn('[Glueful Resume Header Fidelity] Unsupported header image format:', target);
        continue;
      }

      const base64 = await mediaFile.async('base64');
      found.push({
        headerName,
        target,
        dataUrl: `data:${mime};base64,${base64}`,
        ...drawing
      });
    }

    return found;
  }

  function findPageSections(ed) {
    return Array.from(ed.querySelectorAll('.docx-wrapper > section, .docx > section'));
  }

  function findHeaderHost(section) {
    return section.querySelector('header, .docx-header, [class~="docx-header"], [class*="header-"]');
  }

  function applyOneImage(section, image, index) {
    const already = Array.from(section.querySelectorAll('.glueful-docx-header-fidelity-overlay'))
      .some((node) => node.dataset.gluefulHeaderTarget === image.target);
    if (already) return;

    const headerHost = findHeaderHost(section);
    const host = headerHost || section;
    host.classList.add('glueful-header-fidelity-layer');

    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

    const overlay = document.createElement('div');
    overlay.className = 'glueful-docx-header-fidelity-overlay';
    overlay.dataset.gluefulHeaderTarget = image.target;
    overlay.dataset.gluefulHeaderIndex = String(index);

    const img = document.createElement('img');
    img.src = image.dataUrl;
    img.alt = 'Resume logo';
    img.draggable = true;
    if (image.widthPx) img.style.width = `${Math.max(1, image.widthPx)}px`;
    if (image.heightPx) img.style.height = `${Math.max(1, image.heightPx)}px`;

    overlay.appendChild(img);
    overlay.style.left = `${Math.max(0, image.leftPx || 0)}px`;
    overlay.style.top = `${Math.max(0, image.topPx || 0)}px`;
    host.appendChild(overlay);
  }

  async function applyHeaderFidelity() {
    const ed = editor();
    if (!ed || !window.gluefulLastAdobeDocxBuffer) return;
    if (ed.dataset.gluefulHeaderFidelityBusy === '1') return;
    ed.dataset.gluefulHeaderFidelityBusy = '1';

    try {
      injectStyles();
      unwrapLegacyRecovery(ed);
      const images = await headerImages(window.gluefulLastAdobeDocxBuffer);
      if (!images.length) {
        console.info('[Glueful Resume Header Fidelity] No header image relationship found; leaving DOCX layout untouched.');
        return;
      }

      const sections = findPageSections(ed);
      if (!sections.length) return;

      sections.forEach((section) => {
        images.forEach((image, index) => applyOneImage(section, image, index));
      });

      ed.classList.add(DONE_CLASS);
      console.info('[Glueful Resume Header Fidelity] Recovered header image(s) without changing body paragraph alignment.', {
        count: images.length,
        targets: images.map((item) => item.target)
      });
    } catch (error) {
      console.warn('[Glueful Resume Header Fidelity] Recovery skipped:', error);
    } finally {
      ed.dataset.gluefulHeaderFidelityBusy = '0';
    }
  }

  let observer;
  function boot() {
    const ed = editor();
    if (!ed) return;
    if (!observer) {
      observer = new MutationObserver(() => {
        if (ed.querySelector('.docx-wrapper, .docx > section, .glueful-docx')) {
          clearTimeout(boot._timer);
          boot._timer = setTimeout(() => void applyHeaderFidelity(), 120);
        }
      });
      observer.observe(ed, { childList: true, subtree: true, attributes: false });
    }
    void applyHeaderFidelity();
  }

  window.gluefulResumeHeaderFidelity = { apply: applyHeaderFidelity };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
