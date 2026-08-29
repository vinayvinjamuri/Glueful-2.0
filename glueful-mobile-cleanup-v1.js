/* Glueful mobile cleanup V3
 * Fixes literal \\n leakage and stabilizes the mobile splash logo.
 */
(function () {
  'use strict';
  if (window.__GLUEFUL_MOBILE_CLEANUP_V3__) return;
  window.__GLUEFUL_MOBILE_CLEANUP_V3__ = true;

  function removeLiteralNewlines(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    nodes.forEach(function (textNode) {
      const value = String(textNode.nodeValue || '');
      if (!value.includes('\\n')) return;
      const cleaned = value.replace(/\\n+/g, '');
      if (!cleaned) textNode.remove();
      else textNode.nodeValue = cleaned;
    });
  }

  function stabilizeSplashLogo() {
    const splash = document.getElementById('glueful-splash');
    if (!splash) return;

    const content = splash.querySelector('.glueful-splash-content');
    const host = splash.querySelector('.glueful-splash-logo');
    if (content) {
      content.style.setProperty('animation', 'none', 'important');
      content.style.setProperty('transform', 'none', 'important');
      content.style.setProperty('filter', 'none', 'important');
    }
    if (!host) return;

    host.dataset.gluefulStableLogo = '3';
    host.style.setProperty('animation', 'none', 'important');
    host.style.setProperty('transform', 'none', 'important');
    host.style.setProperty('filter', 'none', 'important');
    host.style.setProperty('mix-blend-mode', 'normal', 'important');
    host.style.setProperty('will-change', 'auto', 'important');
    host.style.setProperty('overflow', 'hidden', 'important');
    host.style.setProperty('display', 'flex', 'important');
    host.style.setProperty('align-items', 'center', 'important');
    host.style.setProperty('justify-content', 'center', 'important');

    let img = host.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      host.replaceChildren(img);
    }

    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.loading = 'eager';
    img.decoding = 'sync';
    img.alt = 'Glueful';
    img.src = './icons/icon-192.png?v=20260829-logo-fix-v3';
    img.style.setProperty('width', '100%', 'important');
    img.style.setProperty('height', '100%', 'important');
    img.style.setProperty('display', 'block', 'important');
    img.style.setProperty('object-fit', 'contain', 'important');
    img.style.setProperty('object-position', 'center', 'important');
    img.style.setProperty('transform', 'none', 'important');
    img.style.setProperty('filter', 'none', 'important');
    img.style.setProperty('mix-blend-mode', 'normal', 'important');
  }

  function installCss() {
    if (document.getElementById('glueful-mobile-cleanup-v3-css')) return;
    const style = document.createElement('style');
    style.id = 'glueful-mobile-cleanup-v3-css';
    style.textContent = `
      #glueful-splash .glueful-splash-content,
      #glueful-splash .glueful-splash-logo,
      #glueful-splash .glueful-splash-logo img {
        animation: none !important;
        transform: none !important;
        filter: none !important;
        mix-blend-mode: normal !important;
        will-change: auto !important;
      }
      #glueful-splash .glueful-splash-logo img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        object-position: center !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function clean() {
    installCss();
    // Clean the entire document, not only body, so root-level stray text is removed.
    removeLiteralNewlines(document.documentElement);
    stabilizeSplashLogo();
  }

  function boot() {
    clean();
    const observer = new MutationObserver(function () { clean(); });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true
    });
    window.__GLUEFUL_MOBILE_CLEANUP_READY__ = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
