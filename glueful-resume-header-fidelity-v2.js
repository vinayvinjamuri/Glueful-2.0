/* GLUEFUL Resume Studio — Header Fidelity V2
 * Word-reference reconstruction for the Adobe DOCX preview.
 * Supports DrawingML and legacy VML image relationships.
 */
(function () {
  'use strict';

  const EDITOR_ID = 'job-resume-editor-text';
  const JSZIP_URL = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  const STYLE_ID = 'glueful-resume-header-fidelity-v2-style';
  const PAGE_WIDTH = 794;
  const BODY_LEFT_FALLBACK = 24;
  const HEADER_TEXT_OFFSET = 96;

  const norm = (v) => String(v || '').replace(/\s+/g, ' ').trim();
  const editor = () => document.getElementById(EDITOR_ID);

  async function loadZip(buffer) {
    if (window.JSZip) return window.JSZip.loadAsync(buffer);
    const existing = document.getElementById('glueful-header-v2-jszip');
    if (existing) {
      await new Promise((resolve, reject) => {
        if (window.JSZip) return resolve();
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
      });
    } else {
      const script = document.createElement('script');
      script.id = 'glueful-header-v2-jszip';
      script.src = JSZIP_URL;
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return window.JSZip.loadAsync(buffer);
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${EDITOR_ID} .glueful-header-v2-page { position:relative !important; }
      #${EDITOR_ID} .glueful-header-v2-logo {
        position:absolute !important;
        z-index:40 !important;
        pointer-events:none !important;
        margin:0 !important;
        padding:0 !important;
        line-height:0 !important;
      }
      #${EDITOR_ID} .glueful-header-v2-logo img {
        display:block !important;
        width:100% !important;
        height:100% !important;
        max-width:none !important;
        object-fit:contain !important;
        margin:0 !important;
        padding:0 !important;
        border:0 !important;
      }
      #${EDITOR_ID} .glueful-header-v2-text {
        margin-left:var(--glueful-header-text-left) !important;
        width:calc(100% - var(--glueful-header-text-left)) !important;
        box-sizing:border-box !important;
      }
      #${EDITOR_ID} section.glueful-header-v2-page::before,
      #${EDITOR_ID} section.glueful-header-v2-page::after { display:none !important; content:none !important; }
    `;
    document.head.appendChild(style);
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

  function relPath(part) {
    const file = part.slice(part.lastIndexOf('/') + 1);
    const dir = part.slice(0, part.lastIndexOf('/'));
    return `${dir}/_rels/${file}.rels`;
  }

  function mime(name) {
    const ext = String(name).split('.').pop().toLowerCase();
    return ({ png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', gif:'image/gif',
      webp:'image/webp', bmp:'image/bmp', svg:'image/svg+xml', tif:'image/tiff', tiff:'image/tiff' })[ext] || '';
  }

  function attr(node, localName, namespace) {
    return node?.getAttribute(`r:${localName}`) ||
      (namespace ? node?.getAttributeNS(namespace, localName) : '') || '';
  }

  function pxFromEmu(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n / 9525 : fallback;
  }

  function parseVmlSize(style, fallback) {
    const match = String(style || '').match(/(?:^|;)\s*(width|height)\s*:\s*([0-9.]+)pt/i);
    return match ? Number(match[2]) * 96 / 72 : fallback;
  }

  function nearestParagraph(node) {
    let current = node;
    while (current) {
      if (String(current.localName || current.nodeName).toLowerCase() === 'p') return current;
      current = current.parentNode;
    }
    return null;
  }

  function paragraphText(p) {
    return norm(Array.from(p?.getElementsByTagName('t') || [])
      .map((t) => t.textContent || '').join(' '));
  }

  function parsePart(partName, xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const pNodes = Array.from(doc.getElementsByTagName('p'));
    const paragraphs = pNodes.map(paragraphText).filter(Boolean);
    const paragraphIndex = new Map(pNodes.map((p, i) => [p, i]));
    const drawings = [];

    const drawingNodes = Array.from(doc.getElementsByTagName('wp:inline'))
      .concat(Array.from(doc.getElementsByTagName('wp:anchor')));

    drawingNodes.forEach((drawing) => {
      const blip = drawing.getElementsByTagName('a:blip')[0];
      const rid = attr(blip, 'embed', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships');
      const extent = drawing.getElementsByTagName('wp:extent')[0];
      const posH = drawing.getElementsByTagName('wp:positionH')[0]?.getElementsByTagName('wp:posOffset')[0]?.textContent;
      const posV = drawing.getElementsByTagName('wp:positionV')[0]?.getElementsByTagName('wp:posOffset')[0]?.textContent;
      const p = nearestParagraph(drawing);
      drawings.push({
        rid,
        width: pxFromEmu(extent?.getAttribute('cx'), 68),
        height: pxFromEmu(extent?.getAttribute('cy'), 68),
        left: pxFromEmu(posH, 0),
        top: pxFromEmu(posV, 0),
        paragraphIndex: paragraphIndex.get(p) ?? 999,
        paragraphText: paragraphText(p)
      });
    });

    // Adobe/Word can emit the logo as legacy VML inside w:pict instead of
    // DrawingML. The old resolver ignored this entirely, which explains a
    // valid DOCX containing the logo but an empty Resume Studio header.
    Array.from(doc.getElementsByTagName('v:shape')).forEach((shape) => {
      const image = shape.getElementsByTagName('v:imagedata')[0];
      const rid = attr(image, 'id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships');
      if (!rid) return;
      const p = nearestParagraph(shape);
      const style = shape.getAttribute('style') || '';
      drawings.push({
        rid,
        width: parseVmlSize(style, 68),
        height: (() => {
          const match = style.match(/(?:^|;)\s*height\s*:\s*([0-9.]+)pt/i);
          return match ? Number(match[1]) * 96 / 72 : 68;
        })(),
        left: 0,
        top: 0,
        paragraphIndex: paragraphIndex.get(p) ?? 999,
        paragraphText: paragraphText(p),
        vml: true
      });
    });

    return { partName, paragraphs, drawings };
  }

  async function extractHeaderModel(buffer) {
    const zip = await loadZip(buffer);
    const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
    const xmlParts = names.filter((n) => /^word\/(document|header\d+)\.xml$/i.test(n));
    const candidates = [];

    for (const partName of xmlParts) {
      const model = parsePart(partName, await zip.files[partName].async('text'));
      if (!model.drawings.length) continue;
      const relFile = zip.files[relPath(partName)];
      let relMap = new Map();
      if (relFile) {
        const relDoc = new DOMParser().parseFromString(await relFile.async('text'), 'application/xml');
        relMap = new Map(Array.from(relDoc.getElementsByTagName('Relationship'))
          .map((r) => [r.getAttribute('Id'), r.getAttribute('Target')]));
      }

      for (const drawing of model.drawings) {
        const target = resolveTarget(partName, relMap.get(drawing.rid) || '');
        const file = zip.files[target];
        const type = mime(target);
        if (!file || !type) continue;
        drawing.target = target;
        drawing.type = type;
        drawing.dataUrl = `data:${type};base64,${await file.async('base64')}`;
        const partIsHeader = /^word\/header\d+\.xml$/i.test(partName);
        const square = Math.abs(drawing.width - drawing.height) <= 24;
        const plausibleSize = drawing.width >= 35 && drawing.width <= 150 && drawing.height >= 35 && drawing.height <= 150;
        const headerText = /VINJAMURI\s+VINAY|Hyderabad|MTech/i.test(drawing.paragraphText || '');
        let score = 0;
        if (partIsHeader) score += 120;
        if (plausibleSize) score += 50;
        if (square) score += 25;
        if (headerText) score += 80;
        if (drawing.paragraphIndex <= 6) score += 35;
        if (drawing.width > 180 || drawing.height > 180) score -= 80;
        candidates.push({ ...model, drawing, score });
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    const chosen = candidates[0] || null;
    if (chosen) {
      console.info('[Glueful Resume Header V2] selected DOCX image:', {
        part: chosen.partName,
        target: chosen.drawing.target,
        score: chosen.score,
        vml: !!chosen.drawing.vml,
        width: chosen.drawing.width,
        height: chosen.drawing.height,
        paragraphIndex: chosen.drawing.paragraphIndex
      });
    }
    return chosen;
  }

  function sections(ed) {
    return Array.from(ed.querySelectorAll('.docx-wrapper > section, .docx > section'));
  }

  function leafTextBlocks(root) {
    return Array.from(root.querySelectorAll('p,li,div,td')).filter((node) => {
      const text = norm(node.textContent);
      return text && !node.querySelector('p,li,td');
    });
  }

  function unwrapOldLayers(ed) {
    ed.querySelectorAll('.glueful-header-alignment').forEach((wrapper) => {
      const parent = wrapper.parentElement;
      if (!parent) return;
      Array.from(wrapper.childNodes).forEach((child) => parent.insertBefore(child, wrapper));
      wrapper.remove();
    });
    ed.querySelectorAll('.glueful-docx-header-fidelity-overlay, .glueful-header-v2-logo').forEach((node) => node.remove());
    ed.querySelectorAll('.glueful-header-v2-text').forEach((wrapper) => {
      const parent = wrapper.parentElement;
      if (!parent) return;
      Array.from(wrapper.childNodes).forEach((child) => parent.insertBefore(child, wrapper));
      wrapper.remove();
    });
  }

  function isPaintedEmpty(node, pageRect) {
    const rect = node.getBoundingClientRect?.();
    if (!rect) return false;
    const top = rect.top - pageRect.top;
    if (top < -4 || top > 150) return false;
    if (rect.width < PAGE_WIDTH * 0.55 || rect.height < 10 || rect.height > 110) return false;
    if (norm(node.textContent) || node.querySelector('img,canvas,svg')) return false;
    const style = getComputedStyle(node);
    return style.backgroundColor !== 'rgba(0, 0, 0, 0)' || style.backgroundImage !== 'none' ||
      style.borderTopStyle !== 'none' || style.borderBottomStyle !== 'none' || style.boxShadow !== 'none';
  }

  function removeTopArtifacts(section) {
    const pageRect = section.getBoundingClientRect();
    Array.from(section.children).filter((node) => isPaintedEmpty(node, pageRect)).forEach((node) => node.remove());
    Array.from(section.querySelectorAll('div,p,span')).filter((node) => isPaintedEmpty(node, pageRect)).forEach((node) => node.remove());
  }

  function findHeaderNodes(section, model) {
    const wanted = model.paragraphs.slice(0, 4).filter(Boolean);
    const candidates = leafTextBlocks(section);
    const found = [];
    wanted.forEach((text) => {
      const node = candidates.find((candidate) => norm(candidate.textContent) === text && !found.includes(candidate));
      if (node) found.push(node);
    });
    return found;
  }

  function findBodyLeft(section, headerNodes) {
    const summary = leafTextBlocks(section).find((node) => /PROFESSIONAL\s+SUMMARY/i.test(norm(node.textContent)));
    const reference = summary || leafTextBlocks(section).find((node) => !headerNodes.includes(node));
    if (!reference) return BODY_LEFT_FALLBACK;
    const pageRect = section.getBoundingClientRect();
    return Math.max(0, reference.getBoundingClientRect().left - pageRect.left);
  }

  function applySection(section, model) {
    section.classList.add('glueful-header-v2-page');
    removeTopArtifacts(section);
    const nodes = findHeaderNodes(section, model);
    if (!nodes.length) return;

    const pageRect = section.getBoundingClientRect();
    const bodyLeft = findBodyLeft(section, nodes);
    const textLeft = bodyLeft + HEADER_TEXT_OFFSET;
    const firstRect = nodes[0].getBoundingClientRect();
    const top = Math.max(8, firstRect.top - pageRect.top);
    const existing = nodes[0].parentElement;
    if (!existing) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'glueful-header-v2-text';
    wrapper.contentEditable = 'true';
    wrapper.style.setProperty('--glueful-header-text-left', `${Math.round(textLeft * 10) / 10}px`);
    existing.insertBefore(wrapper, nodes[0]);
    nodes.forEach((node) => wrapper.appendChild(node));

    const width = Math.max(52, Math.min(92, Number(model.drawing.width || 72)));
    const height = Math.max(52, Math.min(92, Number(model.drawing.height || width)));
    const logo = document.createElement('div');
    logo.className = 'glueful-header-v2-logo';
    logo.style.left = `${Math.round(bodyLeft * 10) / 10}px`;
    logo.style.top = `${Math.round((top - 2) * 10) / 10}px`;
    logo.style.width = `${width}px`;
    logo.style.height = `${height}px`;

    const img = document.createElement('img');
    img.src = model.drawing.dataUrl;
    img.alt = 'Resume header logo';
    logo.appendChild(img);
    section.appendChild(logo);

    console.info('[Glueful Resume Header V2] calibrated:', {
      part: model.partName,
      target: model.drawing.target,
      bodyLeft,
      textLeft,
      logoTop: top,
      logoWidth: width,
      logoHeight: height
    });
  }

  async function apply() {
    const ed = editor();
    if (!ed || !window.gluefulLastAdobeDocxBuffer || !ed.classList.contains('glueful-docx-layout-mode')) return;
    if (ed.dataset.gluefulHeaderV2Busy === '1') return;
    ed.dataset.gluefulHeaderV2Busy = '1';
    try {
      installStyles();
      unwrapOldLayers(ed);
      const model = await extractHeaderModel(window.gluefulLastAdobeDocxBuffer);
      sections(ed).forEach((section) => applySection(section, model || { paragraphs: [] }));
      ed.dataset.gluefulHeaderV2Applied = model ? '1' : '0';
    } catch (error) {
      console.warn('[Glueful Resume Header V2] skipped:', error);
    } finally {
      ed.dataset.gluefulHeaderV2Busy = '0';
    }
  }

  function boot() {
    const ed = editor();
    if (!ed) return;
    const run = () => {
      if (ed.querySelector('.docx-wrapper > section, .docx > section')) {
        clearTimeout(boot.timer);
        boot.timer = setTimeout(() => void apply(), 240);
      }
    };
    new MutationObserver(run).observe(ed, { childList:true, subtree:true });
    run();
  }

  window.gluefulResumeHeaderFidelityV2 = { apply };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
