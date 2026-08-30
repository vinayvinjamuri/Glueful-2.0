/*
 * Glueful Orbit UI v9.1 — mobile composer/keyboard layout correction.
 *
 * The previous v9 patch was too specific about the chat element being a direct
 * child of .ov2-app. The Orbit renderer can wrap that element, so this patch
 * intentionally targets .ov2-app .ov2-chat at any descendant level.
 *
 * Desired mobile behavior:
 * - keyboard closed: composer is pinned to the bottom of Orbit;
 * - keyboard open: visualViewport shrinks Orbit and composer sits immediately
 *   above the Android keyboard;
 * - message history is the only scrolling region.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V9_1__) return;
  window.__GLUEFUL_ORBIT_UI_V9_1__ = true;

  const ROOT_ID = "glueful-orbit-v2-root";
  const STYLE_ID = "glueful-orbit-ui-v9-style";
  let rafId = 0;

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}.open {
        position:fixed !important;
        left:0 !important;
        right:0 !important;
        bottom:auto !important;
        width:100% !important;
        overflow:hidden !important;
        transform:none !important;
      }

      #${ROOT_ID}.open .ov2-app {
        width:100% !important;
        height:100% !important;
        min-height:0 !important;
        max-height:100% !important;
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
      }

      #${ROOT_ID}.open .ov2-app .ov2-head {
        flex:0 0 auto !important;
      }

      /* Do NOT use height:100% here. Header + chat must fit together. */
      #${ROOT_ID}.open .ov2-app .ov2-chat {
        flex:1 1 0 !important;
        width:100% !important;
        height:auto !important;
        min-height:0 !important;
        max-height:none !important;
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
      }

      #${ROOT_ID}.open .ov2-app .ov2-chat-messages {
        flex:1 1 auto !important;
        width:100% !important;
        height:auto !important;
        min-height:0 !important;
        max-height:none !important;
        overflow-y:auto !important;
        overflow-x:hidden !important;
        overscroll-behavior:contain !important;
        -webkit-overflow-scrolling:touch !important;
      }

      #${ROOT_ID}.open .ov2-app .ov2-chat .ov2-composer {
        flex:0 0 auto !important;
        position:relative !important;
        inset:auto !important;
        width:100% !important;
        height:auto !important;
        min-height:74px !important;
        margin:0 !important;
        box-sizing:border-box !important;
      }
    `;
    document.head.appendChild(style);
  }

  function syncViewport() {
    const root = getRoot();
    if (!root || !root.classList.contains("open")) return;

    const viewport = window.visualViewport;
    const height = Math.max(1, Math.round(viewport?.height || window.innerHeight || 1));
    const top = Math.max(0, Math.round(viewport?.offsetTop || 0));

    root.style.height = `${height}px`;
    root.style.maxHeight = `${height}px`;
    root.style.top = `${top}px`;
    root.style.bottom = "auto";
  }

  function scheduleSync() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      syncViewport();
    });
  }

  function start() {
    installStyles();
    scheduleSync();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", scheduleSync, { passive:true });
      window.visualViewport.addEventListener("scroll", scheduleSync, { passive:true });
    }

    window.addEventListener("resize", scheduleSync, { passive:true });
    window.addEventListener("focusin", scheduleSync, { passive:true });
    window.addEventListener("focusout", () => window.setTimeout(scheduleSync, 80), { passive:true });

    const observer = new MutationObserver(() => {
      if (getRoot()?.classList.contains("open")) scheduleSync();
    });
    observer.observe(document.documentElement, {
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:["class"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
