/* =========================================================
   GLUEFUL RESUME STUDIO — CANONICAL EXPORT BRIDGE
   Architecture E export starts from the canonical model, never from
   the editable DOM as the source of truth.
   ========================================================= */
(function () {
  'use strict';

  const M = () => window.gluefulResumeCanonicalModel;
  const R = () => window.gluefulResumeCanonicalRenderer;

  function asUint8Array(dataUrl) {
    const base64 = String(dataUrl || '').split(',')[1] || '';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function runToDocx(run, docx) {
    if (run.type === 'image') {
      try {
        return new docx.ImageRun({
          data: asUint8Array(run.src),
          transformation: {
            width: Math.max(1, Math.round(Number(run.widthPt || 48) * 96 / 72)),
            height: Math.max(1, Math.round(Number(run.heightPt || 48) * 96 / 72))
          }
        });
      } catch (_) {
        return new docx.TextRun('');
      }
    }
    return new docx.TextRun({
      text: String(run.text || ''),
      font: run.fontFamily || 'Times New Roman',
      size: Math.round(Number(run.fontSizePt || 11) * 2),
      bold: !!run.bold,
      italics: !!run.italic,
      underline: run.underline ? {} : undefined,
      color: String(run.color || '#202124').replace('#', '')
    });
  }

  function paragraphToDocx(block, docx) {
    const spacing = {
      before: Math.max(0, Math.round(Number(block.beforeSpacingPt || 0) * 20)),
      after: Math.max(0, Math.round(Number(block.afterSpacingPt || 0) * 20)),
      line: Math.max(1, Math.round(Number(block.lineSpacing || 1) * 240)),
      lineRule: block.lineRule === 'exact' ? 'exact' : 'auto'
    };
    const indent = {};
    if (block.leftIndentPt) indent.left = Math.round(block.leftIndentPt * 20);
    if (block.rightIndentPt) indent.right = Math.round(block.rightIndentPt * 20);
    if (block.firstLineIndentPt > 0) indent.firstLine = Math.round(block.firstLineIndentPt * 20);
    if (block.firstLineIndentPt < 0) indent.hanging = Math.round(Math.abs(block.firstLineIndentPt) * 20);

    const border = block.border?.bottom ? {
      bottom: {
        color: String(block.border.bottom.color || '#808080').replace('#', ''),
        size: Math.max(1, Math.round(Number(block.border.bottom.sizePt || .75) * 8)),
        style: block.border.bottom.style === 'double' ? 'double' : 'single',
        space: Math.max(0, Math.round(Number(block.border.bottom.spacePt || 0)))
      }
    } : undefined;

    const options = {
      children: (block.runs || []).map((run) => runToDocx(run, docx)),
      spacing,
      indent,
      alignment: block.alignment === 'both' ? docx.AlignmentType.JUSTIFIED : block.alignment === 'center' ? docx.AlignmentType.CENTER : block.alignment === 'right' ? docx.AlignmentType.RIGHT : docx.AlignmentType.LEFT,
      border
    };
    if (block.pageBreakBefore) options.pageBreakBefore = true;
    if (block.bullet) options.bullet = { level: Number(block.bullet.ilvl || 0) };
    return new docx.Paragraph(options);
  }

  function blocksToDocx(blocks, docx) {
    const out = [];
    (blocks || []).forEach((block) => {
      if (block.type === 'paragraph') out.push(paragraphToDocx(block, docx));
      else if (block.type === 'rule') {
        out.push(new docx.Paragraph({
          children: [new docx.TextRun('')],
          border: { bottom: { color: String(block.color || '#808080').replace('#', ''), size: Math.max(1, Math.round(Number(block.thicknessPt || .75) * 8)), style: 'single', space: 1 } },
          spacing: { before: Math.round(Number(block.spacingBeforePt || 0) * 20), after: Math.round(Number(block.spacingAfterPt || 0) * 20) }
        }));
      } else if (block.type === 'table') {
        const rows = (block.rows || []).map((row) => new docx.TableRow({
          children: (row || []).map((cell) => new docx.TableCell({ children: blocksToDocx(cell.blocks || [], docx) }))
        }));
        if (rows.length) out.push(new docx.Table({ rows, width: { size: 100, type: docx.WidthType.PERCENTAGE } }));
      }
    });
    return out;
  }

  async function exportDocx(model = R()?.getActiveModel?.()) {
    const docx = window.docx;
    if (!docx?.Packer) throw new Error('The DOCX export library is not loaded.');
    if (!model) throw new Error('No canonical resume model is active.');

    const first = model.pages?.[0] || M().DEFAULT_PAGE;
    const sections = (model.pages || []).map((page) => {
      const properties = {
        page: {
          size: { width: Math.round(page.widthPt * 20), height: Math.round(page.heightPt * 20) },
          margin: {
            top: Math.round(page.marginTopPt * 20),
            right: Math.round(page.marginRightPt * 20),
            bottom: Math.round(page.marginBottomPt * 20),
            left: Math.round(page.marginLeftPt * 20),
            header: Math.round(page.headerDistancePt * 20),
            footer: Math.round(page.footerDistancePt * 20)
          }
        },
        children: blocksToDocx(page.blocks, docx)
      };
      if (page.header?.blocks?.length) properties.headers = { default: new docx.Header({ children: blocksToDocx(page.header.blocks, docx) }) };
      if (page.footer?.blocks?.length) properties.footers = { default: new docx.Footer({ children: blocksToDocx(page.footer.blocks, docx) }) };
      return properties;
    });

    const doc = new docx.Document({
      sections,
      styles: { default: { document: { run: { font: first?.fontFamily || 'Times New Roman', size: Math.round(Number(model.settings?.defaultFontSizePt || 11) * 2) } } } }
    });
    const blob = await docx.Packer.toBlob(doc);
    const name = String(model.metadata?.sourceName || 'resume').replace(/\.(pdf|docx)$/i, '') || 'resume';
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = `${name}-edited.docx`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return blob;
  }

  function exportPdf(model = R()?.getActiveModel?.()) {
    if (!model) throw new Error('No canonical resume model is active.');
    const state = R()?.getState?.();
    const surface = state?.surface;
    if (!surface) throw new Error('Canonical renderer surface is not available.');

    const printable = window.document.createElement('div');
    printable.id = 'glueful-canonical-print-sheet';
    const pagesHost = window.document.createElement('div');
    pagesHost.className = 'glueful-canonical-print-pages';
    pagesHost.appendChild(surface.cloneNode(true));
    printable.appendChild(pagesHost);

    const first = model.pages?.[0] || M().DEFAULT_PAGE;
    const widthIn = Number(first.widthPt || 595.28) / 72;
    const heightIn = Number(first.heightPt || 841.89) / 72;
    const style = window.document.createElement('style');
    style.textContent = `
      @page { size: ${widthIn}in ${heightIn}in; margin:0; }
      html,body{margin:0!important;padding:0!important;background:#fff!important;}
      #glueful-canonical-print-sheet{position:fixed;inset:0;background:#fff;z-index:2147483647;overflow:auto;}
      #glueful-canonical-print-sheet .glueful-canonical-surface{display:flex!important;align-items:flex-start!important;gap:0!important;min-width:0!important;padding:0!important;margin:0!important;}
      #glueful-canonical-print-sheet .glueful-canonical-page{box-shadow:none!important;border:0!important;break-after:page;page-break-after:always;}
      #glueful-canonical-print-sheet .glueful-canonical-editable{outline:none!important;}
      @media print{#glueful-canonical-print-sheet{position:static;overflow:visible;}#glueful-canonical-print-sheet .glueful-canonical-page:last-child{break-after:auto;page-break-after:auto;}}
    `;
    printable.appendChild(style);
    window.document.body.appendChild(printable);
    const cleanup = () => {
      printable.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
    setTimeout(cleanup, 15000);
  }

  window.gluefulCanonicalExport = { exportDocx, exportPdf };
})();
