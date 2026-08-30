/*
 * Glueful Orbit UI v9 — direct chat entry.
 *
 * Orbit should open as a conversation, not as a separate landing page.
 * The existing Orbit v2 runtime owns the real chat, AI request flow,
 * application context, keyboard handling, and composer.
 *
 * Complexity:
 * - Startup observation: O(1) work per relevant DOM mutation.
 * - Orbit-home detection: O(1) using direct selectors.
 * - Chat transition: O(1); delegated to the existing Orbit runtime.
 * - Space: O(1) additional DOM memory.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_DIRECT_CHAT_V9__) return;
  window.__GLUEFUL_ORBIT_DIRECT_CHAT_V9__ = true;

  const ROOT = "glueful-orbit-v2-root";
  const MARK = "data-orbit-direct-chat-v9";

  function getApp() {
    return document.querySelector(`#${ROOT} .ov2-app`);
  }

  function isOrbitHome(app) {
    if (!app) return false;

    const title = (app.querySelector(".ov2-title")?.textContent || "").trim();
    if (title !== "Orbit AI") return false;

    return !!app.querySelector(".ov2-body");
  }

  function openExistingChat(root) {
    let bridge = root.querySelector("[data-orbit-direct-chat-bridge]");

    if (!bridge) {
      bridge = document.createElement("button");
      bridge.type = "button";
      bridge.dataset.action = "glueful";
      bridge.dataset.orbitDirectChatBridge = "1";
      bridge.setAttribute("aria-hidden", "true");
      bridge.tabIndex = -1;
      bridge.style.cssText = "display:none!important;position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;";
      root.appendChild(bridge);
    }

    bridge.click();
  }

  function render() {
    const root = document.getElementById(ROOT);
    const app = getApp();

    if (!root || !isOrbitHome(app)) return;
    if (app.getAttribute(MARK) === "1") return;

    app.setAttribute(MARK, "1");

    // Do not render another Orbit landing page.
    // Immediately enter the real Orbit v2 chat runtime.
    openExistingChat(root);
  }

  function start() {
    render();

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(render);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
