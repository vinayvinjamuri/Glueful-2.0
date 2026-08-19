/* GLUEFUL Resume Studio — DOCX layout fidelity layer
 * Reconstructs the editable Word header from the actual Adobe DOCX
 * relationships. It does not use PDF coordinates or first-image heuristics.
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

  function inchesToPx(emu) {
    const n = Number(emu || 0);
    return n > 0 ? (n / EMU_PER_INCH) * CSS_PX_PER_INCH : 0;
  }

  function normalizePath(base, target) {
    const parts = base.split('/');
    parts.pop();
    parts.push(...String(target || '').split('/'));
    const out = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') out.pop();
      else out.push(part);
    }
    return out.join('/');
  }

  function xml(text) {
    return new DOMParser().parseFromString(text, 'application/xml');
  }

  function q(root, selector) {
    try { return root.querySelector(selector); } catch (_) { return null; }
  }

  function qa(root, selector) {
    try { return Array.from(root.querySelectorAll(selector)); } catch (_) { return []; }
  }

  async function openZip(buffer) {
    let JSZip = window.JSZip;
    if (!JSZip) {
      const script = document.createElement('script');
      script.id = 'glueful-layout-fidelity-jszip';
      script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = () => reject(new Error('Could not load JSZip for DOCX header fidelity.'));
        document.head.appendChild(script);
      });
      JSZip = window.JSZip;
    }
    return JSZip ? JSZip.loadAsync(buffer) : null;
  }

  async function text(zip, name) {
    return zip.files[name] ? zip.files[name].async('text') : null;
  }

  async function relations(zip, relPath) {
    const raw = await text(zip, relPath);
    const map = new Map();
    if (!raw) return map;
    const doc = xml(raw);
    qa(doc, 'Relationship').forEach((node) => {
      const id = node.getAttribute('Id');
      if (id) map.set(id, {
        type: node.getAttribute('Type') || '',
        target: node.getAttribute('Target') || ''
      });
    });
    return map;
  }

  async function readHeaderModel(buffer) {
    const zip = await openZip(buffer);
    if (!zip) return null;
    const names = Object.keys(zip.files);
    const headers = names.filter((n) => /^word\/header\d+\.xml$/i.test(n));
    const models = [];

    for (const headerName of headers) {
      const raw = await text(zip, headerName);
      if (!raw) continue;
      const doc = xml(raw);
      const rels = await relations(zip, `word/_rels/${headerName.slice(5)}.rels`);
      const paragraphs = qa(doc, 'p').map((p) => qa(p, 't').map((t) => t.textContent || '').join('')).filter(Boolean);
      const images = [];

      for (const drawing of qa(doc, 'drawing')) {
        const blip = q(drawing, 'blip');
        const embed = blip?.getAttribute('r:embed') || blip?.getAttribute('embed');
        const rel = embed ? rels.get(embed) : null;
        if (!rel || !rel.type.includes('/image')) continue;
        const mediaPath = normalizePath(headerName, rel.target).replace(/^word\//, 'word/');
        if (!zip.files[mediaPath]) continue;
        const extent = q(drawing, 'extent');
        images.push({
          headerName,
          mediaPath,
          paragraphs,
          anchor: !!q(drawing, 'anchor'),
          inline: !!q(drawing, 'inline'),
          widthPx: Math.max(0, inchesToPx(extent?.getAttribute('cx'))),
          heightPx: Math.max(0, inchesToPx(extent?.getAttribute('cy')))
        });
      }
      if (images.length) models.push(...images);
    }

    return { zip, headers, images: models };
  }

  async function mediaDataUrl(zip, mediaPath) {
    const file = zip.files[mediaPath];
    if (!file) return null;
    const data = await file.async('base64');
    const ext = (mediaPath.split('.').pop() || 'png').toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'gif' ? 'image/gif' : ext === 'svg' ? 'image/svg+xml' : ext === 'webp' ? 'image/webp' : 'image/png';
    return `data:${mime};base64,${data}`;
  }

  function pageHost(ed) {
    return ed.querySelector('.docx-wrapper > section, .docx > section, .docx');
  }

  function removeWideEmptyHeaderArtifacts(page) {
    Array.from(page.children).slice(0, 5).forEach((node) => {
      if (node.classList?.contains('glueful-docx-fidelity-header')) return;
      const textContent = String(node.textContent || '').trim();
      const imageCount = node.querySelectorAll ? node.querySelectorAll('img').length : 0;
      const rect = node.getBoundingClientRect?.();
      const width = rect?.width || 0;
      const height = rect?.height || 0;
      if (!textContent && !imageCount && width > PAGE_WIDTH_PX * 0.82 && height > 18 && height < 120) node.remove();
    });
  }

  async function reconstruct() {
    const ed = editor();
    const buffer = window.gluefulLastAdobeDocxBuffer;
    if (!ed || !buffer || !ed.classList.contains('glueful-docx-layout-mode') || ed.classList.contains('glueful-docx-header-fidelity-applied')) return;

    try {
      const model = await readHeaderModel(buffer);
      if (!model?.images?.length) {
        console.info('[Glueful Resume Studio] Adobe DOCX has no header image relationship.', model?.headers || []);
        return;
      }

      const candidate = [...model.images].sort((a, b) => (b.widthPx * b.heightPx) - (a.widthPx * a.heightPx))[0];
      const page = pageHost(ed);
      if (!page) return;

      const dataUrl = await mediaDataUrl(model.zip, candidate.mediaPath);
      if (!dataUrl) return;

      removeWideEmptyHeaderArtifacts(page);

      // Only remove an existing rendered image at the top; all ordinary text remains untouched.
      const existingImage = page.querySelector('img');
      if (existingImage) existingImage.remove();

      const header = document.createElement('div');
      header.className = 'glueful-docx-fidelity-header';
      header.contentEditable = 'true';

      const image = document.createElement('img');
      image.src = dataUrl;
      image.alt = 'Resume logo';
      image.draggable = true;
      const width = Math.max(56, Math.min(96, candidate.widthPx || 72));
      const height = Math.max(56, Math.min(96, candidate.heightPx || 72));
      image.style.cssText = `width:${width}px;height:${height}px;object-fit:contain;flex:0 0 ${width}px;display:block;`;

      const text = document.createElement('div');
      text.className = 'glueful-docx-fidelity-header-text';
      text.contentEditable = 'true';
      const sourceLines = candidate.paragraphs.slice(0, 4);
      sourceLines.forEach((line, index) => {
        const p = document.createElement('p');
        p.textContent = line;
        p.style.margin = index === sourceLines.length - 1 ? '0' : '0 0 3px';
        if (index === 0) p.style.fontWeight = '500';
        text.appendChild(p);
      });

      header.append(image, text);
      page.insertBefore(header, page.firstChild);
      ed.classList.add('glueful-docx-header-fidelity-applied');
      console.info('[Glueful Resume Studio] DOCX header reconstructed from actual header relationship.', candidate);
    } catch (error) {
      console.warn('[Glueful Resume Studio] Header fidelity reconstruction skipped:', error);
    }
  }

  function styles() {
    if ($('glueful-docx-header-fidelity-style')) return;
    const style = document.createElement('style');
    style.id = 'glueful-docx-header-fidelity-style';
    style.textContent = `
      #${MODAL_ID} .glueful-docx-fidelity-header{width:100%!important;display:flex!important;align-items:flex-start!important;column-gap:18px!important;margin:0 0 28px!important;padding:0!important;box-sizing:border-box!important;}
      #${MODAL_ID} .glueful-docx-fidelity-header img{display:block!important;object-fit:contain!important;}
      #${MODAL_ID} .glueful-docx-fidelity-header-text{min-width:0!important;flex:1 1 auto!important;padding:0!important;}
      #${MODAL_ID} .glueful-docx-fidelity-header-text p{margin:0 0 3px!important;padding:0!important;line-height:1.15!important;}
      @media(max-width:700px){#${MODAL_ID} .glueful-docx-fidelity-header{column-gap:14px!important;margin-bottom:26px!important;}}
    `;
    document.head.appendChild(style);
  }

  function boot() {
    styles();
    const modal = $(MODAL_ID);
    if (!modal) return;
    const run = () => { if (modal.classList.contains('open')) void reconstruct(); };
    new MutationObserver(run).observe(modal, { childList:true, subtree:true, attributes:true, attributeFilter:['class'] });
    run();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
