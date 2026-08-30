/* Glueful Gmail bridge v8: only intercept the actual Gmail/Connected Services entry. */
(function () {
  "use strict";

  function openGmail() {
    if (typeof window.openGmailIntegration === "function") {
      window.openGmailIntegration();
      return true;
    }
    return false;
  }

  function isGmailEntry(node) {
    if (!(node instanceof Element)) return false;
    if (node.closest(".glueful-gmail-modal-backdrop")) return false;

    // IMPORTANT: inspect only the clickable element itself. Do not inspect
    // large parent containers, otherwise every item in the account sheet can
    // inherit the words "Connected services" and open Gmail accidentally.
    const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (text !== "gmail integration" && text !== "connected services") return false;

    return node.matches("button, a, [role='button'], [onclick], .settings-item, .profile-row");
  }

  document.addEventListener("click", function (event) {
    if (event.target instanceof Element && event.target.closest(".glueful-gmail-modal-backdrop")) return;

    let node = event.target instanceof Element ? event.target : event.target?.parentElement;
    // Walk only a few levels to find the specific clickable row. We never
    // accept a generic sheet/container just because it contains the label.
    for (let i = 0; node && i < 5; i++, node = node.parentElement) {
      if (!isGmailEntry(node)) continue;
      if (!openGmail()) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      return;
    }
  }, true);

  // Keep legacy placeholder handling, but only when the feature name itself
  // explicitly refers to Gmail or Connected Services.
  let attempts = 0;
  const timer = setInterval(function () {
    attempts++;
    if (typeof window.showComingSoon === "function" && !window.showComingSoon.__gluefulWrapped) {
      const original = window.showComingSoon;
      function wrapped(feature) {
        const value = String(feature || "").toLowerCase().trim();
        if (value === "gmail" || value === "gmail integration" || value === "connected services") {
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
