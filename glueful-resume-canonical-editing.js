/* =========================================================
   GLUEFUL RESUME STUDIO — CANONICAL EDITING BRIDGE
   Architecture E:
   - the page/root surface stays non-editable
   - individual paragraph blocks are editable
   - toolbar commands target the active canonical block
   - DOM edits are synchronized back into the canonical model
   ========================================================= */
(function () {
  'use strict';

  const M = () => window.gluefulResumeCanonicalModel;
  const R = () => window.gluefulResumeCanonicalRenderer;
  let history = [];
  let historyIndex = -1;
  let restoring = false;

  const activeBlockElement = () => {
    const selection = window.getSelection?.();
    const node = selection?.anchorNode;
    const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    return element?.closest?.('[data-block-id].glueful-canonical-editable') || document.activeElement?.closest?.('[data-block-id].glueful-canonical-editable') || null;
  };

  const activeModel = () => R()?.getActiveModel?.() || window.gluefulResumeCanonicalState?.model || null;

  function styleFromElement(node, inherited = {}) {
    const next = { ...inherited };
    if (node.nodeType !== Node.ELEMENT_NODE) return next;
    const computed = getComputedStyle(node);
    const fontSizePx = parseFloat(computed.fontSize || '11');
    return {
      fontFamily: computed.fontFamily?.split(',')[0]?.replace(/^['\"]|['\"]$/g, '') || next.fontFamily || 'Times New Roman',
      fontSizePt: Math.max(4, fontSizePx * 72 / 96),
      bold: Number(computed.fontWeight || 400) >= 600,
      italic: computed.fontStyle === 'italic' || next.italic,
      underline: String(computed.textDecorationLine || '').includes('underline') || next.underline,
      color: computed.color || next.color || '#202124',
      verticalAlign: computed.verticalAlign === 'super' ? 'superscript' : computed.verticalAlign === 'sub' ? 'subscript' : 'baseline'
    };
  }

  function collectRuns(node, inherited, out) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue) out.push({ type: 'text', text: node.nodeValue, props: inherited });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.matches('img.glueful-canonical-image')) {
      const runId = node.dataset.runId || null;
      out.push({ type: 'image', runId, src: node.src, widthPt: parseFloat(node.style.width || '0') * 72 / 96, heightPt: parseFloat(node.style.height || '0') * 72 / 96 });
      return;
    }
    const next = styleFromElement(node, inherited);
    node.childNodes.forEach((child) => collectRuns(child, next, out));
  }

  function sameProps(a, b) {
    return ['fontFamily', 'fontSizePt', 'bold', 'italic', 'underline', 'color', 'verticalAlign'].every((key) => a[key] === b[key]);
  }

  function syncBlock(blockElement) {
    if (!blockElement || restoring) return null;
    const model = activeModel();
    if (!model) return null;
    const block = M().findNode(model, blockElement.dataset.blockId);
    if (!block || block.type !== 'paragraph') return null;

    const collected = [];
    blockElement.childNodes.forEach((node) => collectRuns(node, {
      fontFamily: 'Times New Roman', fontSizePt: 11, bold: false, italic: false,
      underline: false, color: '#202124', verticalAlign: 'baseline'
    }, collected));

    const currentImages = (block.runs || []).filter((run) => run.type === 'image');
    const nextRuns = [];
    collected.forEach((item) => {
      if (item.type === 'image') {
        const existing = currentImages.find((run) => run.id === item.runId);
        if (existing) nextRuns.push(existing);
        else nextRuns.push(M().createImage({ src: item.src, widthPt: item.widthPt, heightPt: item.heightPt }));
        return;
      }
      if (!item.text) return;
      const previous = nextRuns[nextRuns.length - 1];
      if (previous?.type === 'run' && sameProps(previous, item.props)) previous.text += item.text;
      else nextRuns.push(M().createRun(item.text, item.props));
    });
    if (!nextRuns.length) nextRuns.push(M().createRun(''));
    block.runs = nextRuns;
    return block;
  }

  function snapshot() {
    const model = activeModel();
    if (!model) return;
    const copy = M().clone(model);
    history = history.slice(0, historyIndex + 1);
    history.push(copy);
    if (history.length > 40) history.shift();
    historyIndex = history.length - 1;
  }

  function restore(model) {
    if (!model) return;
    restoring = true;
    try {
      const state = R()?.render?.(model, document.getElementById('job-resume-editor-text'), { onChange: () => {} });
      window.gluefulResumeCanonicalState = R()?.getState?.();
      return state;
    } finally {
      restoring = false;
    }
  }

  function ensureHistoryBaseline() {
    if (!history.length) snapshot();
  }

  function command(cmd, value = null) {
    const block = activeBlockElement();
    if (!block) return false;
    ensureHistoryBaseline();
    block.focus();
    try {
      document.execCommand(cmd, false, value);
    } catch (error) {
      console.warn('[Glueful Resume Studio] canonical editing command failed:', cmd, error);
      return false;
    }
    syncBlock(block);
    snapshot();
    block.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  function pointSize(size) {
    const numeric = Number(size);
    if (!Number.isFinite(numeric)) return false;
    const block = activeBlockElement();
    if (!block) return false;
    ensureHistoryBaseline();
    block.focus();
    try {
      document.execCommand('fontSize', false, '7');
      block.querySelectorAll('font[size="7"]').forEach((node) => {
        node.removeAttribute('size');
        node.style.fontSize = `${numeric}pt`;
      });
    } catch (error) {
      console.warn('[Glueful Resume Studio] canonical size command failed:', error);
      return false;
    }
    syncBlock(block);
    snapshot();
    return true;
  }

  function formatBlock(tag) {
    const block = activeBlockElement();
    if (!block || !tag) return false;
    ensureHistoryBaseline();
    try { document.execCommand('formatBlock', false, tag.toLowerCase()); } catch (_) {}
    const result = syncBlock(block);
    snapshot();
    return !!result;
  }

  function insertLink() {
    const url = window.prompt('Enter the URL:');
    if (!url) return false;
    try {
      const parsed = new URL(url, window.location.href);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error('Invalid protocol');
      return command('createLink', parsed.href);
    } catch (_) {
      window.showError?.('Please enter a valid http(s) URL.');
      return false;
    }
  }

  function undo() {
    if (historyIndex <= 0) return false;
    historyIndex -= 1;
    restore(M().clone(history[historyIndex]));
    return true;
  }

  function redo() {
    if (historyIndex >= history.length - 1) return false;
    historyIndex += 1;
    restore(M().clone(history[historyIndex]));
    return true;
  }

  function attach() {
    const host = document.getElementById('job-resume-editor-text');
    if (!host || host.dataset.gluefulCanonicalEditingAttached === '1') return;
    host.dataset.gluefulCanonicalEditingAttached = '1';
    host.addEventListener('focusin', (event) => {
      const block = event.target.closest?.('.glueful-canonical-editable');
      if (block) window.gluefulCanonicalActiveBlockId = block.dataset.blockId;
    });
    host.addEventListener('input', (event) => {
      const block = event.target.closest?.('.glueful-canonical-editable');
      if (!block || restoring) return;
      syncBlock(block);
      snapshot();
      try { window.updateJobResumeEditorAts?.(); } catch (_) {}
    });
  }

  window.gluefulCanonicalEditing = {
    attach,
    syncBlock,
    command,
    pointSize,
    formatBlock,
    insertLink,
    undo,
    redo,
    snapshot,
    getActiveBlock: activeBlockElement
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach, { once: true });
  else attach();
})();
