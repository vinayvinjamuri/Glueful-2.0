/* GLUEFUL Resume Studio — header alignment regression layer
 * Calibrates only the four-line header text cluster against the real DOCX
 * drawing geometry. Body content, section margins and page width remain intact.
 */
(function () {
  'use strict';

  const EDITOR_ID = 'job-resume-editor-text';
  const MODAL_ID = 'job-resume-editor-modal';
  const PAGE_WIDTH = 794;
  const JSZIP_URL = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';

  const $ = (id) => document.getElementById(id);
  const norm = (value) => String(value || '').replace(/\s+/g, ' ').trim();

  function relationshipPath(headerName) {
    return `word/_rels/${headerName.slice(headerName.lastIndexOf('/') + 1)}.rels`;
  }

  function resolveTarget(sourcePath, target) {
    const clean = String(target || '').replace(/\\/g, '/');
    if (!clean) return '';
    if (clean.startsWith('/')) return clean.slice(1);
    const base = sourcePath.slice(0, sourcePath.lastIndexOf('/') + 1);
    const out = [];
    for (const part of (base + clean).split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') out.pop(); else out.push(part);
    }
    return out.join('/');
  }

  async function loadZip(buffer) {
    let JSZip = window.JSZip;
    if (!JSZip) {
      const existing = document.getElementById('glueful-header-alignment-jszip');
      if (existing) {
        await new Promise((resolve, reject) => {
          if (window.JSZip) return resolve();
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        });
        JSZip = window.JSZip;
      } else {
        const script = document.createElement('script');
        script.id = 'glueful-header-alignment-jszip';
        script.src = JSZIP_URL;
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        JSZip = window.JSZip;
      }
    }
    return JSZip.loadAsync(buffer);
  }

  async function headerModel(buffer) {
    const zip = await loadZip(buffer);
    const names = Object.keys(zip.files);
    const headerName = names.find((name) => /^word\/header\d+\.xml$/i.test(name));
    if (!headerName) return null;

    const headerXml = await zip.files[headerName].async('text');
    const doc = new DOMParser().parseFromString(headerXml, 'application/xml');
    const paragraphs = Array.from(doc.getElementsByTagName('p'))
      .map((p) => Array.from(p.getElementsByTagName('t')).map((t) => t.textContent || '').join(''))
      .map(norm)
      .filter(Boolean);

    const drawing = doc.getElementsByTagName('wp:inline')[0] || doc.getElementsByTagName('wp:anchor')[0];
    const blip = drawing?.getElementsByTagName('a:blip')[0];
    const embed = blip?.getAttribute('r:embed') || blip?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed') || '';
    const extent = drawing?.getElementsByTagName('wp:extent')[0];
    const posH = drawing?.getElementsByTagName('wp:positionH')[0]?.getElementsByTagName('wp:posOffset')[0]?.textContent;

    let imageTarget = '';
    const relFile = zip.files[relationshipPath(headerName)];
    if (relFile && embed) {
      const relDoc = new DOMParser().parseFromString(await relFile.async('text'), 'application/xml');
      const relNode = Array.from(relDoc.getElementsByTagName('Relationship')).find((node) => node.getAttribute('Id') === embed);
      imageTarget = resolveTarget(headerName, relNode?.getAttribute('Target') || '');
    }

    if (!imageTarget) {
      const media = names.filter((name) => /^word\/media\//i.test(name) && !zip.files[name].dir);
      if (media.length === 1) imageTarget = media[0];
    }

    return {
      paragraphs,
      imageTarget,
      imageWidthPx: extent ? Math.max(42, Number(extent.getAttribute('cx')) / 9525) : 68,
      imageLeftPx: posH ? Math.max(0, Number(posH) / 9525) : 0
    };
  }

  function sections(ed) {
    return Array.from(ed.querySelectorAll('.docx-wrapper > section, .docx > section'));
  }

  function textBlocks(root) {
    return Array.from(root.querySelectorAll('p,li,div,td'))
      .filter((node) => !node.querySelector('p,li,td') || node.matches('p,li,td'))
      .filter((node) => norm(node.textContent));
  }

  function findHeaderNodes(section, paragraphs) {
    const candidates = textBlocks(section);
    const wanted = paragraphs.slice(0, 4);
    const found = [];
    wanted.forEach((text) => {
      const node = candidates.find((candidate) => norm(candidate.textContent) === text && !found.includes(candidate));
      if (node) found.push(node);
    });
    return found;
  }

  function removeTopArtifact(section) {
    const pageRect = section.getBoundingClientRect();
    const candidates = Array.from(section.querySelectorAll('*')).filter((node) => {
      if (node.classList?.contains('glueful-docx-header-fidelity-overlay')) return false;
      if (node.classList?.contains('glueful-header-alignment')) return false;
      const rect = node.getBoundingClientRect?.();
      if (!rect) return false;
      const top = rect.top - pageRect.top;
      if (top < -4 || top > 150) return false;
      const empty = !norm(node.textContent) && !node.querySelector('img,canvas,svg');
      if (!empty || rect.width < PAGE_WIDTH * 0.80 || rect.height < 14 || rect.height > 90) return false;
      const style = getComputedStyle(node);
      return style.backgroundColor !== 'rgba(0, 0, 0, 0)' || style.backgroundImage !== 'none' || style.borderTopStyle !== 'none' || style.borderBottomStyle !== 'none';
    });
    candidates.forEach((node) => node.remove());
  }

  function alignSection(section, model) {
    if (section.querySelector('.glueful-header-alignment')) return;
    const nodes = findHeaderNodes(section, model.paragraphs);
    if (!nodes.length) return;

    removeTopArtifact(section);

    const pageRect = section.getBoundingClientRect();
    const firstRect = nodes[0].getBoundingClientRect();
    const currentLeft = firstRect.left - pageRect.left;
    const width = Math.max(42, Math.min(110, model.imageWidthPx || 68));
    const gap = 14;
    const geometryTarget = Number(model.imageLeftPx || 0) + width + gap;
    const fallbackTarget = Math.max(0, currentLeft);
    const targetLeft = model.imageTarget ? geometryTarget : fallbackTarget;
    const delta = targetLeft - currentLeft;

    // Only correct a real discrepancy. A few pixels of browser rounding are
    // intentionally left untouched to avoid changing the original Word flow.
    if (Math.abs(delta) < 8) {
      section.classList.add('glueful-header-alignment-checked');
      return;
    }

    const parent = nodes[0].parentElement;
    if (!parent || nodes.some((node) => node.parentElement !== parent)) return;

    const alignment = document.createElement('div');
    alignment.className = 'glueful-header-alignment';
    alignment.contentEditable = 'true';
    alignment.style.marginLeft = `${Math.max(0, targetLeft)}px`;
    alignment.style.width = `calc(100% - ${Math.max(0, targetLeft)}px)`;
    alignment.style.boxSizing = 'border-box';
    parent.insertBefore(alignment, nodes[0]);
    nodes.forEach((node) => alignment.appendChild(node));

    section.classList.add('glueful-header-alignment-applied');
    console.info('[Glueful Resume Studio] Header alignment regression calibration:', {
      currentLeft, targetLeft, delta, imageTarget: model.imageTarget, imageWidthPx: width
    });
  }

  async function apply() {
    const ed = $(EDITOR_ID);
    const modal = $(MODAL_ID);
    if (!ed || !modal || !modal.classList.contains('open') || !window.gluefulLastAdobeDocxBuffer || !ed.classList.contains('glueful-docx-layout-mode')) return;
    if (ed.dataset.gluefulHeaderAlignmentBusy === '1') return;
    ed.dataset.gluefulHeaderAlignmentBusy = '1';
    try {
      const model = await headerModel(window.gluefulLastAdobeDocxBuffer);
      if (!model?.paragraphs?.length) return;
      sections(ed).forEach((section) => alignSection(section, model));
    } catch (error) {
      console.warn('[Glueful Resume Studio] Header alignment regression check skipped:', error);
    } finally {
      ed.dataset.gluefulHeaderAlignmentBusy = '0';
    }
  }

  function boot() {
    const modal = $(MODAL_ID);
    const ed = $(EDITOR_ID);
    if (!modal || !ed) return;
    const run = () => {
      if (modal.classList.contains('open') && ed.querySelector('.docx-wrapper, .docx > section, .glueful-docx')) {
        clearTimeout(boot.timer);
        boot.timer = setTimeout(() => void apply(), 220);
      }
    };
    new MutationObserver(run).observe(ed, { childList: true, subtree: true });
    new MutationObserver(run).observe(modal, { attributes: true, attributeFilter: ['class'] });
    run();
  }

  window.gluefulResumeHeaderAlignment = { apply };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
