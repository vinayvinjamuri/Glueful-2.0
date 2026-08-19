/* GLUEFUL Resume Studio — DOCX layout fidelity layer
 * Evidence-driven header/logo reconstruction from the actual Adobe DOCX.
 * Does not use PDF coordinates or first-image heuristics.
 */
(function () {
  'use strict';

  const EDITOR_ID = 'job-resume-editor-text';
  const MODAL_ID = 'job-resume-editor-modal';
  const PAGE_WIDTH_PX = 794;
  const EMU_PER_INCH = 914400;
  const CSS_PX_PER_INCH = 96;

  const $ = (id) => document.getElementById(id);
  const editor = () => $(EDITOR_ID);

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inchesToPx(emu) {
    const n = Number(emu || 0);
    return n > 0 ? (n / EMU_PER_INCH) * CSS_PX_PER_INCH : 0;
  }

  function normalizePath(base, target) {
    const baseParts = base.split('/');
    baseParts.pop();
    const parts = baseParts.concat(String(target || '').split('/'));
    const out = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') out.pop();
      else out.push(part);
    }
    return out.join('/');
  }

  function parseXml(text) {
    return new DOMParser().parseFromString(text, 'application/xml');
  }

  function q(root, selector) {
    try { return root.querySelector(selector); } catch (_) { return null; }
  }

  function qa(root, selector) {
    try { return Array.from(root.querySelectorAll(selector)); } catch (_) { return []; }
  }

  async function openDocx(buffer) {
    if (!buffer) return null;
    let JSZip = window.JSZip;
    if (!JSZip) {
      const existing = document.getElementById('glueful-layout-fidelity-jszip');
      if (existing) {
        await new Promise((resolve, reject) => {
          if (window.JSZip) return resolve();
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        });
        JSZip = window.JSZip;
      } else {
        const script = document.createElement('script');
        script.id = 'glueful-layout-fidelity-jszip';
        script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Could not load JSZip for DOCX layout fidelity.'));
          document.head.appendChild(script);
        });
        JSZip = window.JSZip;
      }
    }
    if (!JSZip) throw new Error('JSZip is unavailable.');
    return JSZip.loadAsync(buffer);
  }

  async function readZipText(zip, name) {
    const file = zip.files[name];
    if (!file) return null;
    return file.async('text');
  }

  async function readRelationshipMap(zip, relPath) {
    const xml = await readZipText(zip, relPath);
    const map = new Map();
    if (!xml) return map;
    const doc = parseXml(xml);
    qa(doc, 'Relationship').forEach((node) => {
      const id = node.getAttribute('Id');
      const type = node.getAttribute('Type') || '';
      const target = node.getAttribute('Target') || '';
      if (id) map.set(id, { type, target });
    });
    return map;
  }

  async function extractHeaderModel(buffer) {
    const zip = await openDocx(buffer);
    const names = Object.keys(zip.files);
    const headerNames = names.filter((n) => /^word\/header\d+\.xml$/i.test(n));
    const media = names.filter((n) => /^word\/media\//i.test(n) && !zip.files[n].dir);
    const candidates = [];

    for (const headerName of headerNames) {
      const xml = await readZipText(zip, headerName);
      if (!xml) continue;
      const doc = parseXml(xml);
      const relMap = await readRelationshipMap(zip, 'word/_rels/' + headerName.slice('word/'.length) + '.rels');
      const paragraphs = qa(doc, 'p').map((p) => qa(p, 't').map((t) => t.textContent || '').join('')).filter(Boolean);
      const drawings = qa(doc, 'drawing');

      for (const drawing of drawings) {
        const blip = q(drawing, 'blip');
        const embed = blip?.getAttribute('r:embed') || blip?.getAttribute('embed');
        const rel = embed ? relMap.get(embed) : null;
        if (!rel) continue;
        const mediaPath = normalizePath(headerName, rel.target).replace(/^word\//, 'word/');
        if (!zip.files[mediaPath]) continue;

        const extent = q(drawing, 'extent');
        const cx = Number(extent?.getAttribute('cx') || 0);
        const cy = Number(extent?.getAttribute('cy') || 0);
        candidates.push({
          headerName,
          mediaPath,
          paragraphs,
          widthPx: inchesToPx(cx),
          heightPx: inchesToPx(cy),
          anchor: !!q(drawing, 'anchor'),
          inline: !!q(drawing, 'inline'),
          relType: rel.type
        });
      }
    }

    return { zip, headerNames, media, candidates };
  }

  async function dataUrlForMedia(zip, mediaPath) {
    const file = zip.files[mediaPath];
    if (!file) return null;
    const base64 = await file.async('base64');
    const ext = (mediaPath.split('.').pop() || 'png').toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      ext === 'gif' ? 'image/gif' :
      ext === 'svg' ? 'image/svg+xml' :
      ext === 'webp' ? 'image/webp' : 'image/png';
    return `data:${mime};base64,${base64}`;
  }

  function pageHost(ed) {
    return ed.querySelector('.docx-wrapper > section, .docx > section, .docx');
  }

  function findExistingHeaderImage(ed) {
    const page = pageHost(ed);
    if (!page) return null;
    return page.querySelector('img');
  }

  function headerTextNodes(page) {
    return Array.from(page.children)
      .filter((node) => {
        const text = String(node.textContent || '').trim();
        return text && !node.querySelector('img');
      })
      .slice(0, 4);
  }

  function removeKnownHeaderArtifacts(page) {
    // The Adobe/docx-preview path can surface unsupported header shape/drawing
    // placeholders as a wide empty top element. Only remove an element when
    // it is a direct child, visually empty, and occupies most of the page width.
    Array.from(page.children).slice(0, 4).forEach((node) => {
      if (node.classList?.contains('glueful-docx-fidelity-header')) return;
      const text = String(node.textContent || '').trim();
      const images = node.querySelectorAll ? node.querySelectorAll('img').length : 0;
      const rect = typeof node.getBoundingClientRect === 'function' ? node.getBoundingClientRect() : null;
      const width = rect?.width || 0;
      const height = rect?.height || 0;
      if (!text && !images && width > PAGE_WIDTH_PX * 0.82 && height > 18 && height < 120) {
        node.remove();
      }
    });
  }

  async function rebuildHeaderFromDocx() {
    const ed = editor();
    const buffer = window.gluefulLastAdobeDocxBuffer;
    if (!ed || !buffer || ed.classList.contains('glueful-docx-header-fidelity-applied')) return;

    try {
      const model = await extractHeaderModel(buffer);
      const candidate = model.candidates
        .filter((c) => c.relType.includes('/image'))
        .sort((a, b) => (b.widthPx * b.heightPx) - (a.widthPx * a.heightPx))[0];

      if (!candidate) {
        console.info('[Glueful Resume Studio] No header image relationship found in Adobe DOCX.', {
          headers: model.headerNames,
          media: model.media.length,
          candidates: model.candidates
        });
        return;
      }

      const page = pageHost(ed);
      if (!page) return;

      // Only reconstruct when the actual DOCX proves that an image belongs to
      // a Word header. This is deliberately not a PDF first-image heuristic.
      const dataUrl = await dataUrlForMedia(model.zip, candidate.mediaPath);
      if (!dataUrl) return;

      const existing = findExistingHeaderImage(ed);
      if (existing) {
        existing.closest('p,div,td')?.querySelector('img')?.remove();
      }

      removeKnownHeaderArtifacts(page);
      headerTextNodes(page).forEach((node) => node.remove());

      const header = document.createElement('div');
      header.className = 'glueful-docx-fidelity-header';
      header.contentEditable = 'true';

      const image = document.createElement('img');
      image.src = dataUrl;
      image.alt = 'Resume logo';
      image.draggable = true;
      const width = Math.max(48, Math.min(110, candidate.widthPx || 78));
      const height = Math.max(48, Math.min(110, candidate.heightPx || 78));
      image.style.cssText = `width:${width}px;height:${height}px;object-fit:contain;flex:0 0 ${width}px;display:block;`;

      const text = document.createElement('div');
      text.className = 'glueful-docx-fidelity-header-text';
      text.contentEditable = 'true';

      const lines = model.candidates.find((c) => c.mediaPath === candidate.mediaPath)?.paragraphs || [];
      const useLines = lines.slice(0, 4);
      if (useLines.length) {
        useLines.forEach((line, index) => {
          const p = document.createElement('p');
          p.textContent = line;
          p.style.margin = index === 0 ? '0 0 4px' : '0 0 3px';
          if (index === 0) p.style.fontWeight = '500';
          text.appendChild(p);
        });
      } else {
        // Preserve current editor text if the header XML contains no text.
        text.innerHTML = headerTextNodes(page).map((n) => n.outerHTML).join('');
      }

      header.append(image, text);
      page.insertBefore(header, page.firstChild);
      ed.classList.add('glueful-docx-header-fidelity-applied');
      console.info('[Glueful Resume Studio] Reconstructed Word header from Adobe DOCX relationship:', candidate);
    } catch (error) {
      console.warn('[Glueful Resume Studio] DOCX header fidelity reconstruction skipped:', error);
    }
  }

  function injectStyles() {
    if ($('glueful-docx-header-fidelity-style')) return;
    const style = document.createElement('style');
    style.id = 'glueful-docx-header-fidelity-style';
    style.textContent = `
      #${MODAL_ID} .glueful-docx-fidelity-header{
        width:100%!important;
        display:flex!important;
        align-items:flex-start!important;
        column-gap:18px!important;
        margin:0 0 34px!important;
        padding:0!important;
        box-sizing:border-box!important;
      }
      #${MODAL_ID} .glueful-docx-fidelity-header-text{
        min-width:0!important;
        flex:1 1 auto!important;
        padding-top:0!important;
      }
      #${MODAL_ID} .glueful-docx-fidelity-header-text p{
        margin:0 0 4px!important;
        padding:0!important;
        line-height:1.15!important;
      }
      @media(max-width:700px){
        #${MODAL_ID} .glueful-docx-fidelity-header{
          column-gap:14px!important;
          margin-bottom:30px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function boot() {
    injectStyles();
    const modal = $(MODAL_ID);
    if (!modal) return;
    const run = () => {
      if (!modal.classList.contains('open')) return;
      if (!editor()?.classList.contains('glueful-docx-layout-mode')) return;
      void rebuildHeaderFromDocx();
    };
    new MutationObserver(run).observe(modal, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    run();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
