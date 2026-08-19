/* =========================================================
   GLUEFUL RESUME STUDIO — HEADER FIDELITY / REGRESSION FIX
   ---------------------------------------------------------
   Restores the real DOCX header image and positions it from the
   rendered header text cluster so the same 794px Word page remains
   visually consistent on desktop and mobile.

   Regression guarantees:
   - Resolve header relationships from the correct word/_rels path.
   - Never move body paragraphs into a synthetic flex row.
   - Use the DOCX header image itself; never substitute a generic logo.
   - Position the logo relative to the real rendered header text.
   - Preserve the Word page geometry; mobile only scales the same page.
   ========================================================= */
(function () {
  'use strict';

  const EDITOR_ID = 'job-resume-editor-text';
  const JSZIP_URL = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  const STYLE_ID = 'glueful-resume-header-fidelity-style';
  const DONE_CLASS = 'glueful-header-fidelity-applied';
  const PAGE_WIDTH = 794;

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
        z-index:20 !important;
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
      #${EDITOR_ID} .glueful-header-fidelity-page {
        position:relative !important;
      }
    `;
    document.head.appendChild(style);
  }

  function unwrapLegacyRecovery(ed) {
    const wrappers = Array.from(ed.querySelectorAll('.glueful-docx-header-recovered'));
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
  }

  function resolveTarget(sourcePath, target) {
    const clean = String(target || '').replace(/\\/g, '/');
    if (!clean) return '';
    if (clean.startsWith('/')) return clean.slice(1);
    const base = sourcePath.slice(0, sourcePath.lastIndexOf('/') + 1);
    const parts = (base + clean).split('/');
    const out = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') out.pop();
      else out.push(part);
    }
    return out.join('/');
  }

  function headerRelationshipPath(headerName) {
    // DOCX relationship parts live at word/_rels/headerN.xml.rels.
    return `word/_rels/${headerName.slice(headerName.lastIndexOf('/') + 1)}.rels`;
  }

  function mimeFor(name) {
    const ext = String(name).split('.').pop()?.toLowerCase();
    return ({
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
      webp: 'image/webp', bmp: 'image/bmp', svg: 'image/svg+xml',
      tif: 'image/tiff', tiff: 'image/tiff'
    })[ext] || '';
  }

  function parseHeaderDrawing(xmlText) {
    const doc = new DOMParser().parseFromString(String(xmlText || ''), 'application/xml');
    const drawing = doc.getElementsByTagName('wp:inline')[0] || doc.getElementsByTagName('wp:anchor')[0];
    if (!drawing) return null;
    const blip = drawing.getElementsByTagName('a:blip')[0];
    const relId = blip?.getAttribute('r:embed') || blip?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed');
    if (!relId) return null;

    const extent = drawing.getElementsByTagName('wp:extent')[0];
    const posH = drawing.getElementsByTagName('wp:positionH')[0];
    const posV = drawing.getElementsByTagName('wp:positionV')[0];
    const posOffsetH = posH?.getElementsByTagName('wp:posOffset')[0]?.textContent;
    const posOffsetV = posV?.getElementsByTagName('wp:posOffset')[0]?.textContent;

    return {
      relId,
      widthPx: extent ? Number(extent.getAttribute('cx')) / 9525 : 68,
      heightPx: extent ? Number(extent.getAttribute('cy')) / 9525 : 68,
      leftPx: posOffsetH ? Number(posOffsetH) / 9525 : 0,
      topPx: posOffsetV ? Number(posOffsetV) / 9525 : 0
    };
  }

  async function headerModel(buffer) {
    const JSZip = await loadScriptOnce(JSZIP_URL, 'glueful-header-fidelity-jszip');
    const zip = await JSZip.loadAsync(buffer);
    const names = Object.keys(zip.files);
    const headers = names.filter((name) => /^word\/header\d+\.xml$/i.test(name));
    const found = [];

    for (const headerName of headers) {
      const headerXml = await zip.files[headerName].async('text');
      const drawing = parseHeaderDrawing(headerXml);
      if (!drawing) continue;

      const relFile = zip.files[headerRelationshipPath(headerName)];
      let target = '';
      if (relFile) {
        const relXml = await relFile.async('text');
        const relDoc = new DOMParser().parseFromString(relXml, 'application/xml');
        const relNode = Array.from(relDoc.getElementsByTagName('Relationship'))
          .find((node) => node.getAttribute('Id') === drawing.relId);
        target = resolveTarget(headerName, relNode?.getAttribute('Target') || '');
      }

      // Deterministic fallback for the common single-logo DOCX only.
      if (!target) {
        const media = names.filter((name) => /^word\/media\//i.test(name) && !zip.files[name].dir);
        if (media.length === 1) target = media[0];
      }
      const mediaFile = target ? zip.files[target] : null;
      const mime = mimeFor(target);
      if (!mediaFile || mediaFile.dir || !mime) continue;

      const base64 = await mediaFile.async('base64');
      const doc = new DOMParser().parseFromString(headerXml, 'application/xml');
      const paragraphs = Array.from(doc.getElementsByTagName('p'))
        .map((p) => Array.from(p.getElementsByTagName('t')).map((t) => t.textContent || '').join(''))
        .map((value) => value.replace(/\s+/g, ' ').trim())
        .filter(Boolean);

      found.push({
        headerName,
        target,
        dataUrl: `data:${mime};base64,${base64}`,
        paragraphs,
        ...drawing
      });
    }
    return found;
  }

  function sections(ed) {
    return Array.from(ed.querySelectorAll('.docx-wrapper > section, .docx > section'));
  }

  function textBlocks(root) {
    return Array.from(root.querySelectorAll('p,li,div,td'))
      .filter((node) => !node.querySelector('p,li,td') || node.matches('p,li,td'))
      .filter((node) => String(node.textContent || '').replace(/\s+/g, ' ').trim());
  }

  function findHeaderNodes(section, paragraphs) {
    const candidates = textBlocks(section);
    const wanted = paragraphs.slice(0, 4);
    const found = [];
    for (const text of wanted) {
      const match = candidates.find((node) => String(node.textContent || '').replace(/\s+/g, ' ').trim() === text && !found.includes(node));
      if (match) found.push(match);
    }
    return found;
  }

  function removeTopArtifact(section) {
    const pageRect = section.getBoundingClientRect();
    const nodes = Array.from(section.querySelectorAll('*')).filter((node) => {
      if (node.classList?.contains('glueful-docx-header-fidelity-overlay')) return false;
      if (node.classList?.contains('glueful-header-fidelity-page')) return false;
      const rect = node.getBoundingClientRect?.();
      if (!rect) return false;
      const top = rect.top - pageRect.top;
      const empty = !String(node.textContent || '').trim() && !node.querySelector('img,canvas,svg');
      if (!empty || top < -4 || top > 150) return false;
      const wide = rect.width > PAGE_WIDTH * 0.80;
      const barHeight = rect.height >= 14 && rect.height <= 90;
      const style = getComputedStyle(node);
      const hasPaint = style.backgroundColor !== 'rgba(0, 0, 0, 0)' || style.backgroundImage !== 'none' || style.borderTopStyle !== 'none' || style.borderBottomStyle !== 'none';
      return wide && barHeight && hasPaint;
    });
    // Remove the deepest matching nodes first so the actual page wrapper is never removed.
    nodes.sort((a, b) => b.querySelectorAll('*').length - a.querySelectorAll('*').length).forEach((node) => node.remove());
  }

  function applyImage(section, image, nodes) {
    if (section.querySelector(`.glueful-docx-header-fidelity-overlay[data-glueful-header-target="${CSS.escape(image.target)}"]`)) return;

    section.classList.add('glueful-header-fidelity-page');
    removeTopArtifact(section);

    const first = nodes[0];
    if (!first) return;
    const pageRect = section.getBoundingClientRect();
    const textRect = first.getBoundingClientRect();
    const textLeft = textRect.left - pageRect.left;
    const textTop = textRect.top - pageRect.top;

    // The original Word header is a logo + four-line text cluster. Prefer the
    // real DOCX geometry, but anchor to the rendered text when Word's drawing
    // position is not exposed by docx-preview. This keeps desktop/mobile equal.
    const width = Math.max(42, Math.min(110, image.widthPx || 68));
    const height = Math.max(42, Math.min(110, image.heightPx || width));
    const gap = 14;
    const geometryLeft = Number.isFinite(image.leftPx) ? image.leftPx : 0;
    const geometryLooksUseful = geometryLeft > 4;
    const left = geometryLooksUseful ? geometryLeft : Math.max(0, textLeft - width - gap);
    const top = textTop + Math.max(0, (Math.min(textRect.height * 1.15, height) - height) / 2);

    const overlay = document.createElement('div');
    overlay.className = 'glueful-docx-header-fidelity-overlay';
    overlay.dataset.gluefulHeaderTarget = image.target;
    overlay.style.left = `${Math.round(left * 10) / 10}px`;
    overlay.style.top = `${Math.round(top * 10) / 10}px`;

    const img = document.createElement('img');
    img.src = image.dataUrl;
    img.alt = 'Resume header logo';
    img.width = Math.round(width);
    img.height = Math.round(height);
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
    overlay.appendChild(img);
    section.appendChild(overlay);

    console.info('[Glueful Resume Header Fidelity] Logo calibrated:', {
      target: image.target, width, height, left, top, textLeft, textTop
    });
  }

  async function applyHeaderFidelity() {
    const ed = editor();
    if (!ed || !window.gluefulLastAdobeDocxBuffer) return;
    if (ed.dataset.gluefulHeaderFidelityBusy === '1') return;
    ed.dataset.gluefulHeaderFidelityBusy = '1';
    try {
      injectStyles();
      unwrapLegacyRecovery(ed);
      const images = await headerModel(window.gluefulLastAdobeDocxBuffer);
      if (!images.length) {
        console.warn('[Glueful Resume Header Fidelity] No DOCX header image was resolved.');
        return;
      }
      sections(ed).forEach((section) => {
        images.forEach((image) => {
          const nodes = findHeaderNodes(section, image.paragraphs);
          applyImage(section, image, nodes);
        });
      });
      ed.classList.add(DONE_CLASS);
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
          boot._timer = setTimeout(() => void applyHeaderFidelity(), 180);
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
