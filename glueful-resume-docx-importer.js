/* =========================================================
   GLUEFUL RESUME STUDIO — DOCX -> CANONICAL MODEL IMPORTER
   Reads WordprocessingML directly. docx-preview is deliberately not
   used here: the canonical model is the source of truth for editing.
   ========================================================= */
(function () {
  'use strict';

  const M = () => window.gluefulResumeCanonicalModel;
  const NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
  const EMU_PER_PT = 12700;

  const text = (node) => String(node?.textContent || '');
  const attr = (node, local) => node?.getAttribute?.(`w:${local}`) ?? node?.getAttribute?.(local) ?? null;
  const child = (node, name) => Array.from(node?.children || []).find((n) => n.localName === name) || null;
  const children = (node, name) => Array.from(node?.children || []).filter((n) => !name || n.localName === name);
  const num = (value, fallback = 0) => value == null || value === '' ? fallback : Number(value) || fallback;

  function xml(zip, path) {
    return zip.file(path)?.async('text');
  }

  async function readXml(zip, path) {
    const raw = await xml(zip, path);
    if (raw == null) return null;
    return new DOMParser().parseFromString(raw, 'application/xml');
  }

  function relationshipMap(documentXml) {
    const map = new Map();
    Array.from(documentXml?.children || []).forEach(() => {});
    return map;
  }

  async function loadRelationships(zip, relPath) {
    const doc = await readXml(zip, relPath);
    const result = new Map();
    if (!doc) return result;
    Array.from(doc.getElementsByTagNameNS(REL_NS, 'Relationship')).forEach((rel) => {
      result.set(rel.getAttribute('Id'), {
        target: rel.getAttribute('Target') || '',
        type: rel.getAttribute('Type') || '',
        targetMode: rel.getAttribute('TargetMode') || ''
      });
    });
    return result;
  }

  function resolveTarget(basePath, target) {
    if (!target) return '';
    if (/^https?:/i.test(target)) return target;
    const clean = target.replace(/\\/g, '/');
    const base = basePath.split('/').slice(0, -1);
    const parts = base.concat(clean.split('/'));
    const normalized = [];
    parts.forEach((part) => {
      if (!part || part === '.') return;
      if (part === '..') normalized.pop();
      else normalized.push(part);
    });
    return normalized.join('/').replace(/^\//, '');
  }

  async function mediaDataUrl(zip, path) {
    const file = zip.file(path);
    if (!file) return '';
    const bytes = await file.async('uint8array');
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    const base64 = btoa(binary);
    const ext = (path.split('.').pop() || 'png').toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      ext === 'gif' ? 'image/gif' :
      ext === 'webp' ? 'image/webp' :
      ext === 'svg' ? 'image/svg+xml' : 'image/png';
    return `data:${mime};base64,${base64}`;
  }

  function parsePageGeometry(sectPr) {
    const pgSz = child(sectPr, 'pgSz');
    const pgMar = child(sectPr, 'pgMar');
    const cols = child(sectPr, 'cols');
    const page = { ...M().DEFAULT_PAGE };
    if (pgSz) {
      page.widthPt = num(attr(pgSz, 'w'), 11906) / 20;
      page.heightPt = num(attr(pgSz, 'h'), 16838) / 20;
    }
    if (pgMar) {
      page.marginTopPt = num(attr(pgMar, 'top'), 108) / 20;
      page.marginRightPt = num(attr(pgMar, 'right'), 108) / 20;
      page.marginBottomPt = num(attr(pgMar, 'bottom'), 108) / 20;
      page.marginLeftPt = num(attr(pgMar, 'left'), 108) / 20;
      page.headerDistancePt = num(attr(pgMar, 'header'), 20) / 20;
      page.footerDistancePt = num(attr(pgMar, 'footer'), 20) / 20;
    }
    if (cols) page.columnCount = Math.max(1, num(attr(cols, 'num'), 1));
    return page;
  }

  function parseParagraphProperties(pPr, styles) {
    const spacing = child(pPr, 'spacing');
    const ind = child(pPr, 'ind');
    const jc = child(pPr, 'jc');
    const borderNode = child(pPr, 'pBdr');
    const pageBreak = !!child(pPr, 'pageBreakBefore');
    const keepNext = !!child(pPr, 'keepNext');
    const keepLines = !!child(pPr, 'keepLines');
    const styleNode = child(pPr, 'pStyle');

    const props = {
      alignment: (attr(jc, 'val') || 'left').toLowerCase(),
      styleId: attr(styleNode, 'val'),
      beforeSpacingPt: spacing ? num(attr(spacing, 'before'), 0) / 20 : 0,
      afterSpacingPt: spacing ? num(attr(spacing, 'after'), 0) / 20 : 0,
      lineSpacing: spacing ? (() => {
        const line = num(attr(spacing, 'line'), 240);
        const rule = (attr(spacing, 'lineRule') || 'auto').toLowerCase();
        return rule === 'exact' || rule === 'atleast' ? Math.max(.2, line / 240) : Math.max(.2, line / 240);
      })() : 1,
      lineRule: spacing ? (attr(spacing, 'lineRule') || 'auto').toLowerCase() : 'auto',
      leftIndentPt: ind ? num(attr(ind, 'left'), 0) / 20 : 0,
      rightIndentPt: ind ? num(attr(ind, 'right'), 0) / 20 : 0,
      firstLineIndentPt: ind ? (num(attr(ind, 'firstLine'), 0) || -num(attr(ind, 'hanging'), 0)) / 20 : 0,
      keepWithNext: keepNext,
      keepLines,
      pageBreakBefore: pageBreak,
      border: parseParagraphBorder(borderNode),
      ...((styles && styleNode && styles.get(attr(styleNode, 'val'))) || {})
    };
    return props;
  }

  function borderFromNode(node) {
    if (!node) return null;
    const val = (attr(node, 'val') || '').toLowerCase();
    if (!val || val === 'nil' || val === 'none') return null;
    const color = attr(node, 'color');
    return {
      style: val,
      color: color && color !== 'auto' ? `#${color.replace(/^#/, '')}` : '#808080',
      size: Math.max(.25, num(attr(node, 'sz'), 6) / 8),
      spacePt: num(attr(node, 'space'), 0)
    };
  }

  function parseParagraphBorder(pBdr) {
    if (!pBdr) return null;
    const bottom = borderFromNode(child(pBdr, 'bottom'));
    const top = borderFromNode(child(pBdr, 'top'));
    const left = borderFromNode(child(pBdr, 'left'));
    const right = borderFromNode(child(pBdr, 'right'));
    if (!bottom && !top && !left && !right) return null;
    return { top, right, bottom, left };
  }

  function styleTable(styles) {
    const table = new Map();
    styles?.getElementsByTagNameNS(NS, 'style') && Array.from(styles.getElementsByTagNameNS(NS, 'style')).forEach((style) => {
      const id = attr(style, 'styleId');
      if (!id) return;
      const pPr = child(style, 'pPr');
      const rPr = child(style, 'rPr');
      if (pPr || rPr) {
        const value = {};
        if (pPr) Object.assign(value, parseParagraphProperties(pPr, null));
        if (rPr) Object.assign(value, parseRunProperties(rPr, null));
        table.set(id, value);
      }
    });
    return table;
  }

  function parseRunProperties(rPr, styleProps) {
    const rFonts = child(rPr, 'rFonts');
    const sz = child(rPr, 'sz');
    const color = child(rPr, 'color');
    return {
      ...(styleProps || {}),
      fontFamily: attr(rFonts, 'ascii') || attr(rFonts, 'hAnsi') || attr(rFonts, 'cs') || styleProps?.fontFamily || 'Times New Roman',
      fontSizePt: sz ? num(attr(sz, 'val'), 22) / 2 : (styleProps?.fontSizePt || 11),
      bold: !!child(rPr, 'b') || !!styleProps?.bold,
      italic: !!child(rPr, 'i') || !!styleProps?.italic,
      underline: !!child(rPr, 'u') || !!styleProps?.underline,
      color: color && attr(color, 'val') && attr(color, 'val') !== 'auto' ? `#${attr(color, 'val')}` : (styleProps?.color || '#202124'),
      verticalAlign: attr(child(rPr, 'vertAlign'), 'val') || styleProps?.verticalAlign || 'baseline'
    };
  }

  function parseInlineImage(node) {
    const drawing = child(node, 'drawing');
    const pict = child(node, 'pict');
    let blip = null;
    let extent = null;
    let inline = true;
    if (drawing) {
      const container = child(drawing, 'inline') || child(drawing, 'anchor');
      inline = !!child(drawing, 'inline');
      extent = child(container, 'extent');
      blip = container?.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'blip')?.[0] || null;
    }
    if (pict) {
      const imageData = pict.getElementsByTagNameNS('urn:schemas-microsoft-com:vml', 'imagedata')?.[0];
      if (imageData) blip = imageData;
    }
    if (!blip) return null;
    const rid = blip.getAttribute('r:embed') || blip.getAttribute('r:id') || blip.getAttribute('id');
    const cx = num(extent?.getAttribute('cx'), 0);
    const cy = num(extent?.getAttribute('cy'), 0);
    return {
      rid,
      widthPt: cx ? cx / EMU_PER_PT : 0,
      heightPt: cy ? cy / EMU_PER_PT : 0,
      anchor: inline ? 'inline' : 'anchor',
      behindText: !inline
    };
  }

  async function parseParagraph(node, context) {
    const pPr = child(node, 'pPr');
    const paragraph = M().createParagraph(parseParagraphProperties(pPr, context.styles));
    const styleProps = context.styles.get(paragraph.styleId) || {};
    let previousRunProps = styleProps;

    for (const childNode of Array.from(node.children || [])) {
      if (childNode.localName === 'pPr') continue;
      if (childNode.localName === 'r') {
        const rPr = child(childNode, 'rPr');
        const props = parseRunProperties(rPr, previousRunProps);
        previousRunProps = props;
        const tNodes = Array.from(childNode.children || []).filter((n) => n.localName === 't' || n.localName === 'instrText');
        if (tNodes.length) {
          for (const tNode of tNodes) paragraph.runs.push(M().createRun(text(tNode), props));
        }
        const tabCount = children(childNode, 'tab').length;
        if (tabCount) paragraph.runs.push(M().createRun('\t'.repeat(tabCount), props));
        const br = child(childNode, 'br');
        if (br && (attr(br, 'type') || '').toLowerCase() === 'page') paragraph.pageBreakBefore = true;

        const image = parseInlineImage(childNode);
        if (image) {
          const asset = context.resolveImage(image.rid);
          if (asset) paragraph.runs.push({ ...M().createImage(asset), widthPt: image.widthPt, heightPt: image.heightPt, anchor: image.anchor, behindText: image.behindText });
        }
      } else if (childNode.localName === 'hyperlink') {
        for (const runNode of children(childNode, 'r')) {
          const rPr = child(runNode, 'rPr');
          const props = parseRunProperties(rPr, previousRunProps);
          const tNodes = Array.from(runNode.children || []).filter((n) => n.localName === 't');
          tNodes.forEach((tNode) => paragraph.runs.push(M().createRun(text(tNode), props)));
        }
      } else if (childNode.localName === 'proofErr' || childNode.localName === 'bookmarkStart' || childNode.localName === 'bookmarkEnd' || childNode.localName === 'commentRangeStart' || childNode.localName === 'commentRangeEnd') {
        continue;
      }
    }

    if (!paragraph.runs.length) paragraph.runs.push(M().createRun(''));

    const numPr = child(pPr, 'numPr');
    if (numPr) {
      paragraph.bullet = {
        ilvl: num(child(attrNode(numPr, 'ilvl')), 0),
        numId: attr(attrNode(numPr, 'numId'), 'val')
      };
    }
    return paragraph;
  }

  function attrNode(parent, name) {
    return child(parent, name);
  }

  async function parseBody(body, context) {
    const blocks = [];
    for (const node of Array.from(body?.children || [])) {
      if (node.localName === 'p') blocks.push(await parseParagraph(node, context));
      else if (node.localName === 'tbl') blocks.push(await parseTable(node, context));
      else if (node.localName === 'sectPr') context.sectionProperties = node;
    }
    return blocks;
  }

  async function parseTable(tblNode, context) {
    const table = {
      id: `table-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'table',
      rows: []
    };
    for (const tr of children(tblNode, 'tr')) {
      const row = [];
      for (const tc of children(tr, 'tc')) {
        const cellBlocks = [];
        for (const p of children(tc, 'p')) cellBlocks.push(await parseParagraph(p, context));
        row.push({ blocks: cellBlocks });
      }
      table.rows.push(row);
    }
    return table;
  }

  async function parseHeaderFooter(zip, path, context, kind) {
    const doc = await readXml(zip, path);
    if (!doc) return null;
    const body = doc.getElementsByTagNameNS(NS, 'hdr')[0] || doc.getElementsByTagNameNS(NS, 'ftr')[0];
    if (!body) return null;
    const relsPath = path.replace(/^word\//, 'word/_rels/') + '.rels';
    const rels = await loadRelationships(zip, relsPath);
    const localContext = {
      ...context,
      resolveImage: (rid) => resolveImageDescriptor(zip, rels, path, rid)
    };
    const blocks = await parseBody(body, localContext);
    const container = kind === 'header' ? M().createHeader() : M().createFooter();
    container.blocks = blocks;
    return container;
  }

  async function resolveImageDescriptor(zip, rels, basePath, rid) {
    const rel = rels.get(rid);
    if (!rel || rel.targetMode === 'External') return null;
    const targetPath = resolveTarget(basePath, rel.target);
    const src = await mediaDataUrl(zip, targetPath);
    if (!src) return null;
    return { src, name: targetPath.split('/').pop() || 'image', widthPt: 0, heightPt: 0 };
  }

  function sectionHeaderRef(sectPr) {
    const ref = Array.from(sectPr?.children || []).find((node) => node.localName === 'headerReference');
    return ref ? attr(ref, 'id') : null;
  }

  function sectionFooterRef(sectPr) {
    const ref = Array.from(sectPr?.children || []).find((node) => node.localName === 'footerReference');
    return ref ? attr(ref, 'id') : null;
  }

  async function importDocx(buffer, options = {}) {
    if (!buffer) throw new Error('DOCX buffer is required.');
    if (!window.JSZip) throw new Error('JSZip is required for canonical DOCX import.');
    const zip = await window.JSZip.loadAsync(buffer);
    const documentXml = await readXml(zip, 'word/document.xml');
    if (!documentXml) throw new Error('DOCX does not contain word/document.xml.');
    const stylesXml = await readXml(zip, 'word/styles.xml');
    const styles = styleTable(stylesXml);
    const documentRels = await loadRelationships(zip, 'word/_rels/document.xml.rels');
    const body = documentXml.getElementsByTagNameNS(NS, 'body')[0];
    if (!body) throw new Error('DOCX body is missing.');

    const model = M().createDocument({ sourceType: 'docx', sourceName: options.sourceName || '' });
    const context = {
      styles,
      documentRels,
      sectionProperties: null,
      resolveImage: (rid) => resolveImageDescriptor(zip, documentRels, 'word/document.xml', rid)
    };

    const blocks = await parseBody(body, context);
    const finalSectPr = context.sectionProperties || body.querySelector?.('sectPr');
    Object.assign(model.pages[0], parsePageGeometry(finalSectPr));

    const headerRid = sectionHeaderRef(finalSectPr);
    const footerRid = sectionFooterRef(finalSectPr);
    if (headerRid) {
      const relation = documentRels.get(headerRid);
      if (relation) model.pages[0].header = await parseHeaderFooter(zip, resolveTarget('word/document.xml', relation.target), context, 'header');
    }
    if (footerRid) {
      const relation = documentRels.get(footerRid);
      if (relation) model.pages[0].footer = await parseHeaderFooter(zip, resolveTarget('word/document.xml', relation.target), context, 'footer');
    }

    let currentPage = model.pages[0];
    for (const block of blocks) {
      if (block.type === 'paragraph' && block.pageBreakBefore) {
        const next = M().createPage(model.pages.length + 1, {
          widthPt: currentPage.widthPt,
          heightPt: currentPage.heightPt,
          marginTopPt: currentPage.marginTopPt,
          marginRightPt: currentPage.marginRightPt,
          marginBottomPt: currentPage.marginBottomPt,
          marginLeftPt: currentPage.marginLeftPt,
          headerDistancePt: currentPage.headerDistancePt,
          footerDistancePt: currentPage.footerDistancePt
        });
        next.header = currentPage.header ? M().clone(currentPage.header) : null;
        next.footer = currentPage.footer ? M().clone(currentPage.footer) : null;
        model.pages.push(next);
        currentPage = next;
        block.pageBreakBefore = false;
      }
      currentPage.blocks.push(block);
    }

    model.metadata.source = 'wordprocessingml';
    model.metadata.importDiagnostics = {
      paragraphCount: M().walkBlocks ? countBlocks(model, 'paragraph') : 0,
      imageCount: countBlocks(model, 'image'),
      tableCount: countBlocks(model, 'table'),
      headerPresent: !!model.pages[0].header,
      footerPresent: !!model.pages[0].footer
    };

    return M().normalize(model);
  }

  function countBlocks(model, type) {
    let count = 0;
    M().walkBlocks(model, (block) => {
      if (block.type === type) count += 1;
      if (block.type === 'paragraph') (block.runs || []).forEach((run) => { if (run.type === type) count += 1; });
    });
    return count;
  }

  window.gluefulResumeDocxImporter = { importDocx };
})();
