/* GLUEFUL Resume Studio — header alignment refinement
 * Uses the actual DOCX header paragraphs + drawing geometry to align the
 * candidate header as a Word-style logo/text row without touching body flow.
 */
(function () {
  'use strict';

  const EDITOR_ID = 'job-resume-editor-text';
  const MODAL_ID = 'job-resume-editor-modal';
  const PAGE_WIDTH = 794;
  const JSZIP_URL = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';

  const $ = (id) => document.getElementById(id);

  function norm(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
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

  function xml(text) {
    return new DOMParser().parseFromString(text, 'application/xml');
  }

  async function headerModel(buffer) {
    const zip = await loadZip(buffer);
    const names = Object.keys(zip.files);
    const headerName = names.find((name) => /^word\/header\d+\.xml$/i.test(name));
    if (!headerName) return null;

    const headerXml = await zip.files[headerName].async('text');
    const doc = xml(headerXml);
    const paragraphs = Array.from(doc.getElementsByTagName('p'))
      .map((p) => Array.from(p.getElementsByTagName('t')).map((t) => t.textContent || '').join(''))
      .map(norm)
      .filter(Boolean);

    const relName = `${headerName}.rels`.replace(/^word\//, 'word/_rels/');
    const relFile = zip.files[relName];
    let imageTarget = null;
    let imageWidthPx = 72;
    let imageLeftPx = 0;

    const drawing = headerXml.match(/<wp:(inline|anchor)\b[\s\S]*?<\/wp:\1>/i)?.[0] || '';
    const embed = drawing.match(/<a:blip\b[^>]*r:embed=["']([^"']+)["']/i)?.[1] || '';
    const extent = drawing.match(/<wp:extent\b[^>]*cx=["'](\d+)["'][^>]*cy=["'](\d+)["']/i);
    const positionH = drawing.match(/<wp:positionH\b[^>]*>[\s\S]*?<wp:posOffset>(-?\d+)<\/wp:posOffset>[\s\S]*?<\/wp:positionH>/i);
    if (extent) imageWidthPx = Math.max(1, Number(extent[1]) / 9525);
    if (positionH) imageLeftPx = Math.max(0, Number(positionH[1]) / 9525);

    if (relFile && embed) {
      const relXml = await relFile.async('text');
      const relDoc = xml(relXml);
      const relNode = Array.from(relDoc.getElementsByTagName('Relationship')).find((node) => node.getAttribute('Id') === embed);
      const target = relNode?.getAttribute('Target') || '';
      if (target) {
        const base = headerName.slice(0, headerName.lastIndexOf('/') + 1);
        const parts = (base + target).split('/');
        const out = [];
        for (const part of parts) {
          if (!part || part === '.') continue;
          if (part === '..') out.pop();
          else out.push(part);
        }
        imageTarget = out.join('/');
      }
    }

    return { zip, paragraphs, imageTarget, imageWidthPx, imageLeftPx };
  }

  function sections(ed) {
    return Array.from(ed.querySelectorAll('.docx-wrapper > section, .docx > section'));
  }

  function textBlocks(root) {
    return Array.from(root.querySelectorAll('p,li,div,td'))
      .filter((node) => !node.querySelector('p,li,td') || node.matches('p,li,td'))
      .filter((node) => norm(node.textContent));
  }

  function removeTopArtifact(section) {
    Array.from(section.children).slice(0, 5).forEach((node) => {
      if (node.classList?.contains('glueful-header-fidelity-layer')) return;
      if (node.classList?.contains('glueful-header-alignment')) return;
      const rect = node.getBoundingClientRect?.();
      const empty = !norm(node.textContent) && !node.querySelector?.('img,canvas,svg');
      if (empty && rect && rect.width > PAGE_WIDTH * 0.82 && rect.height > 18 && rect.height < 120) node.remove();
    });
  }

  function findHeaderNodes(section, paragraphs) {
    const candidates = textBlocks(section);
    const wanted = paragraphs.slice(0, 4);
    const found = [];
    for (const text of wanted) {
      const match = candidates.find((node) => norm(node.textContent) === text && !found.includes(node));
      if (match) found.push(match);
    }
    return found;
  }

  function alignSection(section, model) {
    if (section.querySelector('.glueful-header-alignment')) return;
    const nodes = findHeaderNodes(section, model.paragraphs);
    if (!nodes.length) return;
    const parent = nodes[0].parentElement;
    if (!parent || nodes.some((node) => node.parentElement !== parent)) return;

    const pageRect = section.getBoundingClientRect();
    const firstRect = nodes[0].getBoundingClientRect();
    const currentLeft = firstRect.left - pageRect.left;
    const targetLeft = model.imageLeftPx + Math.min(110, Math.max(56, model.imageWidthPx || 72)) + 18;

    removeTopArtifact(section);

    const alignment = document.createElement('div');
    alignment.className = 'glueful-header-alignment';
    alignment.contentEditable = 'true';
    alignment.style.marginLeft = `${Math.max(0, targetLeft)}px`;
    alignment.style.width = `calc(100% - ${Math.max(0, targetLeft)}px)`;
    alignment.style.boxSizing = 'border-box';

    const shouldMove = currentLeft < targetLeft * 0.72;
    if (shouldMove) {
      parent.insertBefore(alignment, nodes[0]);
      nodes.forEach((node) => alignment.appendChild(node));
    }

    section.classList.add('glueful-header-alignment-applied');
    console.info('[Glueful Resume Studio] Header alignment calibrated from DOCX geometry:', {
      currentLeft,
      targetLeft,
      imageLeftPx: model.imageLeftPx,
      imageWidthPx: model.imageWidthPx,
      moved: shouldMove
    });
  }

  async function apply() {
    const ed = $(EDITOR_ID);
    if (!ed || !window.gluefulLastAdobeDocxBuffer || !ed.classList.contains('glueful-docx-layout-mode')) return;
    if (ed.dataset.gluefulHeaderAlignmentBusy === '1') return;
    ed.dataset.gluefulHeaderAlignmentBusy = '1';
    try {
      const model = await headerModel(window.gluefulLastAdobeDocxBuffer);
      if (!model?.paragraphs?.length) return;
      sections(ed).forEach((section) => alignSection(section, model));
    } catch (error) {
      console.warn('[Glueful Resume Studio] Header alignment refinement skipped:', error);
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
        boot.timer = setTimeout(() => void apply(), 160);
      }
    };
    new MutationObserver(run).observe(ed, { childList:true, subtree:true });
    run();
  }

  window.gluefulResumeHeaderAlignment = { apply };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
