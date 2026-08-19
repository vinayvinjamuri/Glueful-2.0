/* =========================================================
   GLUEFUL RESUME STUDIO — CANONICAL DOCUMENT MODEL
   Architecture E foundation:
   DOCX/PDF import -> canonical model -> deterministic page renderer
   -> separate editing surface.

   This file contains only the document model. It is intentionally
   independent from contenteditable, docx-preview, and application UI.
   ========================================================= */
(function () {
  'use strict';

  const VERSION = 1;

  const DEFAULT_PAGE = Object.freeze({
    widthPt: 595.28,
    heightPt: 841.89,
    marginTopPt: 54,
    marginRightPt: 54,
    marginBottomPt: 54,
    marginLeftPt: 54,
    headerDistancePt: 20,
    footerDistancePt: 20
  });

  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  function createRun(text = '', properties = {}) {
    return {
      id: uid('run'),
      type: 'run',
      text: String(text ?? ''),
      fontFamily: properties.fontFamily || 'Times New Roman',
      fontSizePt: clamp(properties.fontSizePt || 11, 4, 96),
      bold: !!properties.bold,
      italic: !!properties.italic,
      underline: !!properties.underline,
      color: properties.color || '#202124',
      verticalAlign: properties.verticalAlign || 'baseline'
    };
  }

  function createParagraph(properties = {}) {
    return {
      id: uid('p'),
      type: 'paragraph',
      alignment: properties.alignment || 'left',
      styleId: properties.styleId || null,
      beforeSpacingPt: Number(properties.beforeSpacingPt || 0),
      afterSpacingPt: Number(properties.afterSpacingPt || 0),
      lineSpacing: properties.lineSpacing == null ? 1 : Number(properties.lineSpacing),
      lineRule: properties.lineRule || 'auto',
      leftIndentPt: Number(properties.leftIndentPt || 0),
      rightIndentPt: Number(properties.rightIndentPt || 0),
      firstLineIndentPt: Number(properties.firstLineIndentPt || 0),
      keepWithNext: !!properties.keepWithNext,
      keepLines: !!properties.keepLines,
      pageBreakBefore: !!properties.pageBreakBefore,
      border: properties.border ? clone(properties.border) : null,
      bullet: properties.bullet ? clone(properties.bullet) : null,
      runs: []
    };
  }

  function createImage(properties = {}) {
    return {
      id: uid('img'),
      type: 'image',
      src: properties.src || '',
      name: properties.name || '',
      widthPt: Number(properties.widthPt || 0),
      heightPt: Number(properties.heightPt || 0),
      xPt: properties.xPt == null ? null : Number(properties.xPt),
      yPt: properties.yPt == null ? null : Number(properties.yPt),
      anchor: properties.anchor || 'inline',
      wrap: properties.wrap || 'inline',
      behindText: !!properties.behindText
    };
  }

  function createRule(properties = {}) {
    return {
      id: uid('rule'),
      type: 'rule',
      thicknessPt: Number(properties.thicknessPt || 0.75),
      color: properties.color || '#808080',
      widthPercent: Number(properties.widthPercent || 100),
      spacingBeforePt: Number(properties.spacingBeforePt || 0),
      spacingAfterPt: Number(properties.spacingAfterPt || 0)
    };
  }

  function createHeader(properties = {}) {
    return {
      id: uid('header'),
      type: 'header',
      distancePt: Number(properties.distancePt || 20),
      blocks: []
    };
  }

  function createFooter(properties = {}) {
    return {
      id: uid('footer'),
      type: 'footer',
      distancePt: Number(properties.distancePt || 20),
      blocks: []
    };
  }

  function createPage(number = 1, properties = {}) {
    const page = { ...DEFAULT_PAGE, ...clone(properties), number };
    return {
      id: uid('page'),
      type: 'page',
      ...page,
      header: null,
      footer: null,
      blocks: []
    };
  }

  function createDocument(properties = {}) {
    const firstPage = createPage(1, {
      ...DEFAULT_PAGE,
      ...(properties.page || {})
    });

    return {
      model: 'glueful-resume-document',
      version: VERSION,
      metadata: {
        sourceType: properties.sourceType || 'unknown',
        sourceName: properties.sourceName || '',
        importedAt: new Date().toISOString(),
        compatibility: 'word-layout'
      },
      settings: {
        defaultFontFamily: 'Times New Roman',
        defaultFontSizePt: 11,
        unit: 'pt'
      },
      pages: [firstPage]
    };
  }

  function walkBlocks(document, visitor) {
    (document?.pages || []).forEach((page) => {
      (page.blocks || []).forEach((block) => visitor(block, page));
      [page.header, page.footer].forEach((container) => {
        (container?.blocks || []).forEach((block) => visitor(block, page, container));
      });
    });
  }

  function findNode(document, id) {
    let found = null;
    walkBlocks(document, (block) => {
      if (block.id === id) found = block;
      if (found || block.type !== 'paragraph') return;
      const run = (block.runs || []).find((item) => item.id === id);
      if (run) found = run;
    });
    return found;
  }

  function toPlainText(document) {
    const pages = (document?.pages || []).map((page) => {
      return (page.blocks || []).map((block) => {
        if (block.type === 'paragraph') return (block.runs || []).map((run) => run.text).join('');
        if (block.type === 'rule') return '';
        if (block.type === 'image') return '';
        return '';
      }).filter((line) => line !== '').join('\n');
    });
    return pages.filter(Boolean).join('\n\n');
  }

  function validate(document) {
    const errors = [];
    if (!document || document.model !== 'glueful-resume-document') errors.push('Invalid canonical document model.');
    if (!Array.isArray(document?.pages) || !document.pages.length) errors.push('Document has no pages.');
    (document?.pages || []).forEach((page, index) => {
      if (!(page.widthPt > 0) || !(page.heightPt > 0)) errors.push(`Page ${index + 1} has invalid geometry.`);
      if (page.marginLeftPt < 0 || page.marginRightPt < 0 || page.marginTopPt < 0 || page.marginBottomPt < 0) errors.push(`Page ${index + 1} has negative margins.`);
    });
    return { valid: errors.length === 0, errors };
  }

  function normalize(document) {
    const next = clone(document || createDocument());
    next.model = 'glueful-resume-document';
    next.version = VERSION;
    if (!Array.isArray(next.pages) || !next.pages.length) next.pages = [createPage(1)];
    next.pages.forEach((page, index) => {
      Object.assign(page, DEFAULT_PAGE, page, { number: index + 1 });
      if (!Array.isArray(page.blocks)) page.blocks = [];
    });
    return next;
  }

  window.gluefulResumeCanonicalModel = {
    VERSION,
    DEFAULT_PAGE,
    createRun,
    createParagraph,
    createImage,
    createRule,
    createHeader,
    createFooter,
    createPage,
    createDocument,
    clone,
    findNode,
    walkBlocks,
    toPlainText,
    validate,
    normalize
  };
})();
