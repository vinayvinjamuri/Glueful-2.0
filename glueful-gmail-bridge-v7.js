/* Glueful Gmail bridge v9: direct Connected Services entry only. */
(function () {
  "use strict";

  function openGmail() {
    if (typeof window.openGmailIntegration !== "function") {
      return false;
    }
    window.openGmailIntegration();
    return true;
  }

  function isGmailEntry(node) {
    if (!(node instanceof Element)) return false;
    if (node.closest(".glueful-gmail-modal-backdrop")) return false;
    const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    return text === "connected services" || text === "gmail integration";
  }

  function bindEntry(node) {
    if (!isGmailEntry(node) || node.dataset.gluefulGmailEntryBound === "1") return;
    node.dataset.gluefulGmailEntryBound = "1";
    node.addEventListener("click", function (event) {
      if (!openGmail()) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    }, true);
  }

  function scan(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof Element) bindEntry(root);
    root.querySelectorAll?.("*").forEach(bindEntry);
  }

  function install() {
    scan(document);
    const observer = new MutationObserver(function (mutations) {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) scan(node);
        });
      }
    });
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
