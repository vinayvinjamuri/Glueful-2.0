/* Glueful Gmail bridge v7: safe entry-point interception without blocking modal controls. */
(function () {
  "use strict";

  function openGmail() {
    if (typeof window.openGmailIntegration === "function") {
      window.openGmailIntegration();
      return true;
    }
    return false;
  }

  function relevantEntry(node) {
    if (!(node instanceof Element)) return false;
    if (node.closest(".glueful-gmail-modal-backdrop")) return false;
    const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!text.includes("gmail integration") && !text.includes("connected services")) return false;
    return node.matches("button, a, [role='button'], [onclick], .settings-item, .profile-row") ||
      typeof node.onclick === "function" || node.tabIndex >= 0;
  }

  document.addEventListener("click", function (event) {
    if (event.target instanceof Element && event.target.closest(".glueful-gmail-modal-backdrop")) return;

    let node = event.target instanceof Element ? event.target : event.target?.parentElement;
    let entry = null;
    for (let i = 0; node && i < 12; i++, node = node.parentElement) {
      if (relevantEntry(node)) {
        entry = node;
        break;
      }
    }
    if (!entry) return;
    if (!openGmail()) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }, true);

  // Replace only the legacy Gmail/Connected Services placeholder handler.
  let attempts = 0;
  const timer = setInterval(function () {
    attempts++;
    if (typeof window.showComingSoon === "function" && !window.showComingSoon.__gluefulWrapped) {
      const original = window.showComingSoon;
      function wrapped(feature) {
        const value = String(feature || "").toLowerCase();
        if (value.includes("gmail") || value.includes("connected services")) {
          return openGmail();
        }
        return original.apply(this, arguments);
      }
      wrapped.__gluefulWrapped = true;
      window.showComingSoon = wrapped;
    }
    if (attempts > 120) clearInterval(timer);
  }, 500);
})();
