/* =========================================================
   GLUEFUL RESUME STUDIO — DOCX -> CANONICAL MODEL IMPORTER V2
   Direct WordprocessingML import. No docx-preview dependency.
   ========================================================= */
(function () {
  'use strict';

  const M = () => window.gluefulResumeCanonicalModel;
  const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const R_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
  const A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main';
  const VML_NS = 'urn:schemas-microsoft-com:vml';
  const EMU_PER_PT = 12700;

  const attr = (node, name) => {
    if (!node) return null;
    return node.getAttribute(`w:${name}`) ?? node.getAttribute(name);
  };
  const child = (node, localName) => Array.from(node?.children || []).find((n) => n.localName === localName) || null;
  const children = (node, localName) => Array.from(node?.children || []).filter((n) => !localName || n.localName === localName);
  const numeric = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };
  const escPath = (value) => String(value || '').replace(/\\/g, '/');

  async function readXml(zip, path) {
    const file = zip.file(path);
    if (!file) return null;
    const raw = await file.async('text');
    return new DOMParser().parseFromString(raw, 'application/xml');
  }

  async function relationships(zip, path) {
    const doc = await readXml(zip, path);
    const map = new Map();
    if (!doc) return map;
    Array.from(doc.getElementsByTagNameNS(R_NS, 'Relationship')).forEach((rel) => map.set(rel.getAttribute('Id'), {
      target: rel.getAttribute('Target') || '',
      type: rel.getAttribute('Type') || '',
      targetMode: rel.getAttribute('TargetMode') || ''
    }));
    return map;
  }

  function resolvePart(baseFile, target) {
    if (!target || /^https?:/i.test(target)) return target || '';
    const base = escPath(baseFile).split('/').slice(0, -1);
    const pieces = base.concat(escPath(target).split('/'));
    const out = [];
    for (const piece of pieces) {
      if (!piece || piece === '.') continue;
      if (piece === '..') out.pop();
      else out.push(piece);
    }
    return out.join('/');
  }

  async function dataUrl(zip, path) {
    const file = zip.file(path);
    if (!file) return '';
    const bytes = await file.async('uint8array');
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    const ext = String(path).split('.').pop().toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'gif' ? 'image/gif' : ext === 'svg' ? 'image/svg+xml' : 'image/png';
    return `data:${mime};base64,${btoa(binary)}`;
  }

  function borderSpec(node) {
    if (!node) return null;
    const val = String(attr(node, 'val') || '').toLowerCase();
    if (!val || val === 'nil' || val === 'none') return null;
    const colorValue = attr(node, 'color');
    return {
      style: val,
      color: colorValue && colorValue !== 'auto' ? `#${String(colorValue).replace(/^#/, '')}` : '#808080',
      sizePt: Math.max(.25, numeric(attr(node, 'sz'), 6) / 8),
      spacePt: numeric(attr(node, 'space'), 0)
    };
  }

  function paragraphBorder(pBdr) {
    if (!pBdr) return null;
    const border = {
      top: borderSpec(child(pBdr, 'top')),
      right: borderSpec(child(pBdr, 'right')),
      bottom: borderSpec(child(pBdr, 'bottom')),
      left: borderSpec(child(pBdr, 'left'))
    };
    return Object.values(border).some(Boolean) ? border : null;
  }

  function runProps(rPr, inherited = {}) {
    const rFonts = child(rPr, 'rFonts');
    const size = child(rPr, 'sz');
    const color = child(rPr, 'color');
    const underline = child(rPr, 'u');
    const vert = child(rPr, 'vertAlign');
    return {
      fontFamily: attr(rFonts, 'ascii') || attr(rFonts, 'hAnsi') || attr(rFonts, 'eastAsia') || inherited.fontFamily || 'Times New Roman',
      fontSizePt: size ? numeric(attr(size, 'val'), 22) / 2 : (inherited.fontSizePt || 11),
      bold: !!child(rPr, 'b') || !!inherited.bold,
      italic: !!child(rPr, 'i') || !!inherited.italic,
      underline: !!underline || !!inherited.underline,
      color: color && attr(color, 'val') && attr(color, 'val') !== 'auto' ? `#${attr(color, 'val')}` : (inherited.color || '#202124'),
      verticalAlign: attr(vert, 'val') || inherited.verticalAlign || 'baseline'
    };
  }

  function paragraphProps(pPr, styleMap) {
    const spacing = child(pPr, 'spacing');
    const ind = child(pPr, 'ind');
    const jc = child(pPr, 'jc');
    const style = child(pPr, 'pStyle');
    const styleProps = styleMap.get(attr(style, 'val')) || {};
    const line = spacing ? numeric(attr(spacing, 'line'), 240) : 240;
    return {
      ...styleProps,
      alignment: String(attr(jc, 'val') || styleProps.alignment || 'left').toLowerCase(),
      styleId: attr(style, 'val') || styleProps.styleId || null,
      beforeSpacingPt: spacing ? numeric(attr(spacing, 'before'), 0) / 20 : (styleProps.beforeSpacingPt || 0),
      afterSpacingPt: spacing ? numeric(attr(spacing, 'after'), 0) / 20 : (styleProps.afterSpacingPt || 0),
      lineSpacing: Math.max(.2, line / 240),
      lineRule: String(attr(spacing, 'lineRule') || 'auto').toLowerCase(),
      leftIndentPt: ind ? numeric(attr(ind, 'left'), 0) / 20 : (styleProps.leftIndentPt || 0),
      rightIndentPt: ind ? numeric(attr(ind, 'right'), 0) / 20 : (styleProps.rightIndentPt || 0),
      firstLineIndentPt: ind ? (numeric(attr(ind, 'firstLine'), 0) || -numeric(attr(ind, 'hanging'), 0)) / 20 : (styleProps.firstLineIndentPt || 0),
      keepWithNext: !!child(pPr, 'keepNext'),
      keepLines: !!child(pPr, 'keepLines'),
      pageBreakBefore: !!child(pPr, 'pageBreakBefore'),
      border: paragraphBorder(child(pPr, 'pBdr'))
    };
  }

  function styleMap(stylesXml) {
    const map = new Map();
    if (!stylesXml) return map;
    Array.from(stylesXml.getElementsByTagNameNS(W_NS, 'style')).forEach((style) => {
      const id = attr(style, 'styleId');
      if (!id) return;
      const pPr = child(style, 'pPr');
      const rPr = child(style, 'rPr');
      const value = {};
      if (pPr) Object.assign(value, paragraphProps(pPr, new Map()));
      if (rPr) Object.assign(value, runProps(rPr));
      map.set(id, value);
    });
    return map;
  }

  async function imageFromDrawing(runNode, zip, rels, basePath) {
    const drawing = child(runNode, 'drawing');
    const pict = child(runNode, 'pict');
    let rid = '';
    let extent = null;
    let anchored = false;
    let behindText = false;

    if (drawing) {
      const inline = child(drawing, 'inline');
      const anchor = child(drawing, 'anchor');
      const container = inline || anchor;
      anchored = !!anchor;
      extent = child(container, 'extent');
      const blip = container?.getElementsByTagNameNS(A_NS, 'blip')?.[0];
      rid = blip?.getAttribute('r:embed') || blip?.getAttribute('embed') || '';
      const wrap = container ? Array.from(container.children || []).find((n) => /^wrap/i.test(n.localName)) : null;
      behindText = wrap?.localName === 'wrapNone' || !!container?.getElementsByTagNameNS(A_NS, 'positionH')?.length;
    } else if (pict) {
      const imageData = pict.getElementsByTagNameNS(VML_NS, 'imagedata')?.[0];
      rid = imageData?.getAttribute('r:id') || imageData?.getAttribute('id') || '';
      const style = imageData?.parentElement?.getAttribute('style') || '';
      const width = /width\s*:\s*([\d.]+)pt/i.exec(style)?.[1];
      const height = /height\s*:\s*([\d.]+)pt/i.exec(style)?.[1];
      extent = { getAttribute: (key) => key === 'cx' ? (numeric(width, 0) * EMU_PER_PT) : (numeric(height, 0) * EMU_PER_PT) };
    }

    if (!rid) return null;
    const relation = rels.get(rid);
    if (!relation || relation.targetMode === 'External') return null;
    const target = resolvePart(basePath, relation.target);
    const src = await dataUrl(zip, target);
    if (!src) return null;

    return M().createImage({
      src,
      name: target.split('/').pop() || 'image',
      widthPt: numeric(extent?.getAttribute('cx'), 0) / EMU_PER_PT,
      heightPt: numeric(extent?.getAttribute('cy'), 0) / EMU_PER_PT,
      anchor: anchored ? 'anchor' : 'inline',
      wrap: anchored ? 'floating' : 'inline',
      behindText
    });
  }

  async function paragraph(node, context) {
    const pPr = child(node, 'pPr');
    const p = M().createParagraph(paragraphProps(pPr, context.styles));
    let inheritedRun = context.styles.get(p.styleId) || {};
    for (const nodeChild of Array.from(node.children || [])) {
      if (nodeChild.localName !== 'r' && nodeChild.localName !== 'hyperlink') continue;
      const runNodes = nodeChild.localName === 'r' ? [nodeChild] : children(nodeChild, 'r');
      for (const runNode of runNodes) {
        const props = runProps(child(runNode, 'rPr'), inheritedRun);
        inheritedRun = props;
        const texts = children(runNode).filter((n) => n.localName === 't' || n.localName === 'instrText');
        texts.forEach((t) => p.runs.push(M().createRun(t.textContent || '', props)));
        children(runNode, 'tab').forEach(() => p.runs.push(M().createRun('\t', props)));
        const br = child(runNode, 'br');
        if (br && String(attr(br, 'type') || '').toLowerCase() === 'page') p.pageBreakBefore = true;
        const drawingImage = await imageFromDrawing(runNode, context.zip, context.rels, context.basePath);
        if (drawingImage) p.runs.push(drawingImage);
      }
    }
    if (!p.runs.length) p.runs.push(M().createRun('', inheritedRun));

    const numPr = child(pPr, 'numPr');
    if (numPr) {
      p.bullet = {
        ilvl: numeric(attr(child(numPr, 'ilvl'), 'val'), 0),
        numId: attr(child(numPr, 'numId'), 'val') || null
      };
    }
    return p;
  }

  async function table(node, context) {
    const model = { id: `table-${Math.random().toString(36).slice(2)}`, type: 'table', rows: [] };
    for (const tr of children(node, 'tr')) {
      const cells = [];
      for (const tc of children(tr, 'tc')) {
        const blocks = [];
        for (const p of children(tc, 'p')) blocks.push(await paragraph(p, context));
        cells.push({ blocks });
      }
      model.rows.push(cells);
    }
    return model;
  }

  async function bodyBlocks(body, context) {
    const out = [];
    let sectPr = null;
    for (const node of Array.from(body?.children || [])) {
      if (node.localName === 'p') out.push(await paragraph(node, context));
      else if (node.localName === 'tbl') out.push(await table(node, context));
      else if (node.localName === 'sectPr') sectPr = node;
    }
    return { blocks: out, sectPr };
  }

  function pageGeometry(sectPr) {
    const page = { ...M().DEFAULT_PAGE };
    const size = child(sectPr, 'pgSz');
    const margins = child(sectPr, 'pgMar');
    if (size) {
      page.widthPt = numeric(attr(size, 'w'), 11906) / 20;
      page.heightPt = numeric(attr(size, 'h'), 16838) / 20;
    }
    if (margins) {
      page.marginTopPt = numeric(attr(margins, 'top'), 108) / 20;
      page.marginRightPt = numeric(attr(margins, 'right'), 108) / 20;
      page.marginBottomPt = numeric(attr(margins, 'bottom'), 108) / 20;
      page.marginLeftPt = numeric(attr(margins, 'left'), 108) / 20;
      page.headerDistancePt = numeric(attr(margins, 'header'), 20) / 20;
      page.footerDistancePt = numeric(attr(margins, 'footer'), 20) / 20;
    }
    return page;
  }

  async function headerFooter(zip, rels, relId, kind) {
    if (!relId) return null;
    const rel = rels.get(relId);
    if (!rel) return null;
    const path = resolvePart('word/document.xml', rel.target);
    const doc = await readXml(zip, path);
    if (!doc) return null;
    const root = doc.getElementsByTagNameNS(W_NS, kind === 'header' ? 'hdr' : 'ftr')[0];
    if (!root) return null;
    const partRels = await relationships(zip, `word/_rels/${path.replace(/^word\//, '')}.rels`);
    const { blocks } = await bodyBlocks(root, { zip, rels: partRels, basePath: path, styles: new Map() });
    const container = kind === 'header' ? M().createHeader() : M().createFooter();
    container.blocks = blocks;
    return container;
  }

  async function importDocx(buffer, options = {}) {
    if (!buffer) throw new Error('DOCX buffer is required.');
    if (!window.JSZip) throw new Error('JSZip is required for canonical DOCX import.');
    const zip = await window.JSZip.loadAsync(buffer);
    const documentXml = await readXml(zip, 'word/document.xml');
    if (!documentXml) throw new Error('DOCX is missing word/document.xml.');
    const stylesXml = await readXml(zip, 'word/styles.xml');
    const styles = styleMap(stylesXml);
    const rels = await relationships(zip, 'word/_rels/document.xml.rels');
    const body = documentXml.getElementsByTagNameNS(W_NS, 'body')[0];
    if (!body) throw new Error('DOCX body is missing.');

    const model = M().createDocument({ sourceType: 'docx', sourceName: options.sourceName || '' });
    const parsed = await bodyBlocks(body, { zip, rels, basePath: 'word/document.xml', styles });
    Object.assign(model.pages[0], pageGeometry(parsed.sectPr));

    const headerRef = children(parsed.sectPr, 'headerReference')[0];
    const footerRef = children(parsed.sectPr, 'footerReference')[0];
    if (headerRef) model.pages[0].header = await headerFooter(zip, rels, attr(headerRef, 'id'), 'header');
    if (footerRef) model.pages[0].footer = await headerFooter(zip, rels, attr(footerRef, 'id'), 'footer');

    let page = model.pages[0];
    for (const block of parsed.blocks) {
      if (block.type === 'paragraph' && block.pageBreakBefore) {
        page = M().createPage(model.pages.length + 1, page);
        page.header = model.pages[0].header ? M().clone(model.pages[0].header) : null;
        page.footer = model.pages[0].footer ? M().clone(model.pages[0].footer) : null;
        model.pages.push(page);
        block.pageBreakBefore = false;
      }
      page.blocks.push(block);
    }

    model.metadata.importDiagnostics = {
      importer: 'wordprocessingml-v2',
      sourceName: options.sourceName || '',
      paragraphCount: count(model, 'paragraph'),
      tableCount: count(model, 'table'),
      imageCount: countImages(model),
      headerPresent: !!model.pages[0].header,
      footerPresent: !!model.pages[0].footer
    };

    return M().normalize(model);
  }

  function count(model, type) {
    let total = 0;
    M().walkBlocks(model, (block) => { if (block.type === type) total += 1; });
    return total;
  }

  function countImages(model) {
    let total = 0;
    M().walkBlocks(model, (block) => {
      if (block.type === 'image') total += 1;
      if (block.type === 'paragraph') total += (block.runs || []).filter((run) => run.type === 'image').length;
    });
    return total;
  }

  window.gluefulResumeDocxImporterV2 = { importDocx };
})();
