/* Glueful Gmail bridge v7: replace the legacy coming-soon handlers directly. */
(function () {
  "use strict";

  function openGmail() {
    if (typeof window.openGmailIntegration === "function") {
      window.openGmailIntegration();
      return true;
    }
    return false;
  }

  function textOf(node) {
    return (node?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isGmailEntry(node) {
    if (!(node instanceof Element)) return false;
    const text = textOf(node);
    return text.includes("gmail integration") ||
      (text.includes("connected services") && text.length < 320);
  }

  function patchNode(node) {
    if (!(node instanceof Element)) return false;

    const candidates = [];
    if (node.matches("button, a, [role='button'], .settings-item, .profile-row")) {
      candidates.push(node);
    }
    candidates.push(...node.querySelectorAll("button, a, [role='button'], .settings-item, .profile-row"));

    let patched = false;
    for (const el of candidates) {
      if (!isGmailEntry(el)) continue;
      if (el.dataset.gluefulGmailPatched === "7") continue;

      el.dataset.gluefulGmailPatched = "7";
      el.removeAttribute("onclick");
      el.onclick = function (event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        return openGmail();
      };
      el.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        openGmail();
      }, true);
      patched = true;
    }
    return patched;
  }

  function patchAll() {
    patchNode(document.body);
  }

  function start() {
    patchAll();
    const observer = new MutationObserver(() => patchAll());
    observer.observe(document.body, { childList: true, subtree: true });

    // Catch taps before the application's legacy inline handler gets a chance.
    const capture = function (event) {
      let node = event.target instanceof Element ? event.target : event.target?.parentElement;
      for (let i = 0; node && i < 14; i++, node = node.parentElement) {
        if (!isGmailEntry(node)) continue;
        if (!openGmail()) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        return;
      }
    };
    document.addEventListener("click", capture, true);
    document.addEventListener("pointerdown", capture, true);
    document.addEventListener("touchstart", capture, true);

    // If the old global handler exists, redirect Gmail-related calls to the real flow.
    const timer = setInterval(function () {
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
    }, 250);
    setTimeout(() => clearInterval(timer), 120000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
