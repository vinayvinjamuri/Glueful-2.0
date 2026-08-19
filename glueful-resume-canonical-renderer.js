/* =========================================================
   GLUEFUL RESUME STUDIO — CANONICAL FIXED-PAGE RENDERER
   Architecture E runtime renderer.
   ========================================================= */
(function () {
  'use strict';

  const MODEL = () => window.gluefulResumeCanonicalModel;
  const PT_TO_PX = 96 / 72;
  const px = (pt) => Math.round(Number(pt || 0) * PT_TO_PX * 100) / 100;
  let active = null;

  const CSS = `
    .glueful-canonical-surface{position:relative;display:flex;flex-direction:column;gap:24px;align-items:center;width:max-content;min-width:100%;padding:0;margin:0;box-sizing:border-box;background:transparent;color:#202124;font-family:"Times New Roman",Times,serif;}
    .glueful-canonical-page{position:relative;flex:0 0 auto;overflow:hidden;box-sizing:border-box;background:#fff;color:#202124;box-shadow:0 12px 34px rgba(15,23,42,.18);border:1px solid #d8dce4;}
    .glueful-canonical-body{position:absolute;box-sizing:border-box;overflow:hidden;}
    .glueful-canonical-header,.glueful-canonical-footer{position:absolute;left:0;right:0;box-sizing:border-box;}
    .glueful-canonical-block{box-sizing:border-box;position:relative;}
    .glueful-canonical-paragraph{margin:0;white-space:pre-wrap;word-break:normal;overflow-wrap:break-word;}
    .glueful-canonical-editable{outline:none;cursor:text;min-height:1em;}
    .glueful-canonical-editable:focus{box-shadow:inset 0 0 0 1px rgba(80,120,220,.35);}
    .glueful-canonical-run{white-space:pre-wrap;}
    .glueful-canonical-image{display:inline-block;vertical-align:top;object-fit:contain;user-select:none;-webkit-user-drag:none;}
    .glueful-canonical-rule{height:0;box-sizing:content-box;border-top-style:solid;}
    .glueful-canonical-table{width:100%;border-collapse:collapse;table-layout:fixed;}
    .glueful-canonical-table td{vertical-align:top;padding:0;}
    .glueful-canonical-page[data-overflow="true"]{outline:2px solid rgba(190,70,70,.25);}
  `;

  function ensureCss(host) {
    if (host.querySelector(':scope > style[data-glueful-canonical-style]')) return;
    const style = document.createElement('style');
    style.dataset.gluefulCanonicalStyle = '1';
    style.textContent = CSS;
    host.prepend(style);
  }

  function alignment(value) {
    const map = { start: 'left', end: 'right', both: 'justify', distribute: 'justify' };
    return map[value] || value || 'left';
  }

  function borderCss(border) {
    if (!border) return '';
    const side = (item) => item ? `${item.sizePt || .75}pt ${item.style === 'double' ? 'double' : 'solid'} ${item.color || '#808080'}` : 'none';
    return `border-top:${side(border.top)};border-right:${side(border.right)};border-bottom:${side(border.bottom)};border-left:${side(border.left)};`;
  }

  function applyStyle(node, styles) { Object.entries(styles || {}).forEach(([key, value]) => { node.style[key] = value; }); }

  function runStyle(run) {
    return {
      fontFamily: run.fontFamily || 'Times New Roman',
      fontSize: `${Number(run.fontSizePt || 11)}pt`,
      fontWeight: run.bold ? '700' : '400',
      fontStyle: run.italic ? 'italic' : 'normal',
      textDecoration: run.underline ? 'underline' : 'none',
      color: run.color || '#202124',
      verticalAlign: run.verticalAlign === 'superscript' ? 'super' : run.verticalAlign === 'subscript' ? 'sub' : 'baseline'
    };
  }

  function pageUsableHeight(page) { return Math.max(36, page.heightPt - page.marginTopPt - page.marginBottomPt); }

  function createTextEditor(block, options) {
    const node = document.createElement('div');
    node.className = 'glueful-canonical-paragraph glueful-canonical-editable';
    node.dataset.blockId = block.id;
    node.contentEditable = 'true';
    node.spellcheck = true;
    node.setAttribute('role', 'textbox');
    node.setAttribute('aria-multiline', 'true');

    if (block.bullet) {
      const prefix = document.createElement('span');
      prefix.textContent = '• ';
      prefix.contentEditable = 'false';
      prefix.style.userSelect = 'none';
      prefix.style.display = 'inline-block';
      prefix.style.marginLeft = `${-Math.max(14, block.leftIndentPt || 18)}pt`;
      prefix.style.width = `${Math.max(14, block.leftIndentPt || 18)}pt`;
      node.appendChild(prefix);
    }

    (block.runs || []).forEach((run) => {
      if (run.type === 'image') {
        const img = document.createElement('img');
        img.className = 'glueful-canonical-image';
        img.dataset.runId = run.id;
        img.src = run.src;
        img.alt = run.name || 'Resume image';
        if (run.widthPt > 0) img.style.width = `${px(run.widthPt)}px`;
        if (run.heightPt > 0) img.style.height = `${px(run.heightPt)}px`;
        img.draggable = false;
        img.contentEditable = 'false';
        node.appendChild(img);
        return;
      }
      const span = document.createElement('span');
      span.className = 'glueful-canonical-run';
      span.dataset.runId = run.id;
      applyStyle(span, runStyle(run));
      span.textContent = run.text;
      node.appendChild(span);
    });

    node.style.textAlign = alignment(block.alignment);
    node.style.marginTop = `${block.beforeSpacingPt || 0}pt`;
    node.style.marginBottom = `${block.afterSpacingPt || 0}pt`;
    node.style.lineHeight = String(block.lineSpacing || 1);
    node.style.paddingLeft = `${Math.max(0, block.leftIndentPt || 0)}pt`;
    node.style.paddingRight = `${Math.max(0, block.rightIndentPt || 0)}pt`;
    if (block.firstLineIndentPt) node.style.textIndent = `${block.firstLineIndentPt}pt`;
    node.style.cssText += borderCss(block.border);
    if (block.keepLines) node.style.breakInside = 'avoid';

    node.addEventListener('input', () => {
      const parts = Array.from(node.childNodes).map((child) => {
        if (child.nodeType === Node.TEXT_NODE) return child.textContent;
        if (child.nodeType === Node.ELEMENT_NODE && child.matches('img')) return '';
        return child.textContent || '';
      });
      const textValue = parts.join('');
      const editableRuns = (block.runs || []).filter((run) => run.type === 'run');
      if (editableRuns.length === 1) editableRuns[0].text = textValue.replace(/^•\s*/, '');
      else {
        let cursor = textValue;
        editableRuns.forEach((run, index) => {
          if (index === editableRuns.length - 1) { run.text = cursor; return; }
          const old = String(run.text || '');
          const take = Math.min(old.length, cursor.length);
          run.text = cursor.slice(0, take);
          cursor = cursor.slice(take);
        });
      }
      options.onChange?.(block, node);
    });
    return node;
  }

  function renderRule(block) {
    const rule = document.createElement('div');
    rule.className = 'glueful-canonical-rule';
    rule.style.width = `${Math.max(0, Math.min(100, block.widthPercent || 100))}%`;
    rule.style.borderTopWidth = `${Math.max(.25, block.thicknessPt || .75)}pt`;
    rule.style.borderTopColor = block.color || '#808080';
    rule.style.marginTop = `${block.spacingBeforePt || 0}pt`;
    rule.style.marginBottom = `${block.spacingAfterPt || 0}pt`;
    return rule;
  }

  function renderTable(block, options) {
    const table = document.createElement('table');
    table.className = 'glueful-canonical-table';
    const body = document.createElement('tbody');
    (block.rows || []).forEach((row) => {
      const tr = document.createElement('tr');
      row.forEach((cell) => {
        const td = document.createElement('td');
        (cell.blocks || []).forEach((childBlock) => {
          if (childBlock.type === 'paragraph') td.appendChild(createTextEditor(childBlock, options));
        });
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    table.appendChild(body);
    return table;
  }

  function renderBlock(block, options) {
    if (block.type === 'paragraph') return createTextEditor(block, options);
    if (block.type === 'rule') return renderRule(block);
    if (block.type === 'table') return renderTable(block, options);
    if (block.type === 'image') {
      const img = document.createElement('img');
      img.className = 'glueful-canonical-image';
      img.src = block.src;
      img.alt = block.name || 'Resume image';
      if (block.widthPt) img.style.width = `${px(block.widthPt)}px`;
      if (block.heightPt) img.style.height = `${px(block.heightPt)}px`;
      return img;
    }
    return null;
  }

  function renderContainer(container, parent, options) {
    if (!container?.blocks?.length) return null;
    const wrapper = document.createElement('div');
    wrapper.className = container.type === 'header' ? 'glueful-canonical-header' : 'glueful-canonical-footer';
    wrapper.style.paddingLeft = `${options.page.marginLeftPt}pt`;
    wrapper.style.paddingRight = `${options.page.marginRightPt}pt`;
    if (container.type === 'header') wrapper.style.top = `${Math.max(0, container.distancePt || options.page.headerDistancePt || 20)}pt`;
    else wrapper.style.bottom = `${Math.max(0, container.distancePt || options.page.footerDistancePt || 20)}pt`;
    container.blocks.forEach((block) => { const node = renderBlock(block, options); if (node) wrapper.appendChild(node); });
    parent.appendChild(wrapper);
    return wrapper;
  }

  function pageShell(page, options) {
    const pageNode = document.createElement('section');
    pageNode.className = 'glueful-canonical-page';
    pageNode.dataset.pageNumber = String(page.number || 1);
    pageNode.style.width = `${px(page.widthPt)}px`;
    pageNode.style.height = `${px(page.heightPt)}px`;
    const body = document.createElement('div');
    body.className = 'glueful-canonical-body';
    body.style.left = `${page.marginLeftPt}pt`;
    body.style.right = `${page.marginRightPt}pt`;
    body.style.top = `${page.marginTopPt}pt`;
    body.style.minHeight = `${pageUsableHeight(page)}pt`;
    pageNode.appendChild(body);
    renderContainer(page.header, pageNode, { ...options, page });
    renderContainer(page.footer, pageNode, { ...options, page });
    return { pageNode, body };
  }

  function clonePageGeometry(source, number) {
    const page = MODEL().createPage(number, source);
    page.header = source.header ? MODEL().clone(source.header) : null;
    page.footer = source.footer ? MODEL().clone(source.footer) : null;
    page.blocks = [];
    return page;
  }

  function paginateModel(model, surface, options) {
    const outputPages = [];
    surface.replaceChildren();
    let pageNumber = 0;

    for (const sourcePage of model.pages) {
      let currentModelPage = clonePageGeometry(sourcePage, ++pageNumber);
      let current = pageShell(currentModelPage, options);
      surface.appendChild(current.pageNode);
      outputPages.push(currentModelPage);

      for (const block of sourcePage.blocks || []) {
        if (block.pageBreakBefore && currentModelPage.blocks.length) {
          block.pageBreakBefore = false;
          currentModelPage = clonePageGeometry(sourcePage, ++pageNumber);
          current = pageShell(currentModelPage, options);
          surface.appendChild(current.pageNode);
          outputPages.push(currentModelPage);
        }

        const node = renderBlock(block, { ...options, page: currentModelPage, onChange: options.onChange });
        if (!node) continue;
        node.classList.add('glueful-canonical-block');
        current.body.appendChild(node);

        const overflow = current.body.scrollHeight > current.body.clientHeight + 1;
        if (overflow && currentModelPage.blocks.length > 0) {
          current.body.removeChild(node);
          current.pageNode.dataset.overflow = 'false';
          currentModelPage = clonePageGeometry(sourcePage, ++pageNumber);
          current = pageShell(currentModelPage, options);
          surface.appendChild(current.pageNode);
          outputPages.push(currentModelPage);
          current.body.appendChild(node);
        }
        currentModelPage.blocks.push(block);
        if (current.body.scrollHeight > current.body.clientHeight + 1) current.pageNode.dataset.overflow = 'true';
      }
    }

    model.pages = outputPages;
    model.pages.forEach((page, index) => { page.number = index + 1; });
    return model;
  }

  function render(model, host, options = {}) {
    if (!host) throw new Error('Canonical renderer host is required.');
    const validation = MODEL().validate(model);
    if (!validation.valid) throw new Error(validation.errors.join(' '));
    const normalized = MODEL().normalize(model);
    host.replaceChildren();
    ensureCss(host);

    const surface = document.createElement('div');
    surface.className = 'glueful-canonical-surface';
    surface.dataset.renderer = 'canonical-fixed-page';
    surface.dataset.modelVersion = String(normalized.version);
    surface.contentEditable = 'false';
    host.appendChild(surface);

    const onChange = (block, node) => active?.onChange?.(block, node, normalized);
    paginateModel(normalized, surface, { ...options, model: normalized, onChange });

    active = { model: normalized, host, surface, onChange: options.onChange };
    window.gluefulResumeCanonicalState = active;
    return normalized;
  }

  function repaginate(model) {
    const state = active;
    if (!state || !model) return model;
    paginateModel(model, state.surface, { model, onChange: state.onChange });
    active.model = model;
    return model;
  }

  function getActiveModel() { return active?.model || window.gluefulResumeCanonicalState?.model || null; }
  function getPlainText() { return MODEL().toPlainText(getActiveModel()); }

  window.gluefulResumeCanonicalRenderer = {
    PT_TO_PX,
    render,
    repaginate,
    getActiveModel,
    getPlainText,
    getState: () => active
  };
})();
