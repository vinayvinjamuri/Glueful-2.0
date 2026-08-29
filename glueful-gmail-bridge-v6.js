/* Glueful Gmail bridge v6: catch every Gmail/Connected Services entry point. */
(function () {
  "use strict";

  function openGmail() {
    if (typeof window.openGmailIntegration === "function") {
      window.openGmailIntegration();
      return true;
    }
    return false;
  }

  function relevant(node) {
    if (!(node instanceof Element)) return false;
    const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    return text.includes("gmail integration") || text.includes("connected services");
  }

  document.addEventListener("click", function (event) {
    let node = event.target instanceof Element ? event.target : event.target?.parentElement;
    let found = false;
    for (let i = 0; node && i < 12; i++, node = node.parentElement) {
      if (relevant(node)) {
        found = true;
        break;
      }
    }
    if (!found) return;
    if (!openGmail()) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }, true);

  // Also neutralize the old coming-soon handler when it is globally exposed.
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
