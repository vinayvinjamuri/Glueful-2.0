/* Glueful mobile cleanup V4
 * Source-level mobile guard: removes leaked literal \\n nodes and prevents the
 * legacy splash compositor from rendering a corrupted logo.
 */
(function () {
  'use strict';
  if (window.__GLUEFUL_MOBILE_CLEANUP_V4__) return;
  window.__GLUEFUL_MOBILE_CLEANUP_V4__ = true;

  function installEarlyCss() {
    if (document.getElementById('glueful-mobile-cleanup-v4-css')) return;
    const style = document.createElement('style');
    style.id = 'glueful-mobile-cleanup-v4-css';
    style.textContent = `
      /* The old splash is the source of the corrupted mobile logo frame. */
      #glueful-splash {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function cleanTextNodes(root) {
    if (!root || !document.createTreeWalker) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    nodes.forEach(function (textNode) {
      const value = String(textNode.nodeValue || '');
      if (!value) return;
      // Remove both the two-character literal "\\n" and repeated variants.
      if (!value.includes('\\n')) return;
      const cleaned = value.replace(/(?:\\n)+/g, '');
      if (cleaned === '') textNode.remove();
      else textNode.nodeValue = cleaned;
    });
  }

  function removeSplash() {
    const splash = document.getElementById('glueful-splash');
    if (splash) splash.remove();
  }

  function clean() {
    installEarlyCss();
    cleanTextNodes(document.documentElement);
    removeSplash();
  }

  function boot() {
    clean();
    const observer = new MutationObserver(function (mutations) {
      let relevant = false;
      mutations.forEach(function (mutation) {
        if (mutation.type === 'characterData') relevant = true;
        mutation.addedNodes && mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) relevant = true;
        });
      });
      if (relevant) clean();
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true
    });
    window.__GLUEFUL_MOBILE_CLEANUP_READY__ = true;
  }

  // Install CSS immediately; the deployment workflow places this script in <head>.
  installEarlyCss();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
