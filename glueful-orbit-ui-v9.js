/*
 * Glueful Orbit UI v9 — mobile composer/keyboard layout correction.
 *
 * Root cause addressed here:
 * v8 made .ov2-chat height:100% inside .ov2-app, while .ov2-app also contains
 * the chat header. That makes the chat column consume the full app height
 * instead of the remaining height, so the composer can stop above the bottom.
 *
 * v9 keeps the app as a single flex column: header + remaining chat viewport.
 * The root tracks visualViewport height so Android keyboard resize moves the
 * composer above the keyboard without scrolling the whole Orbit surface.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V9__) return;
  window.__GLUEFUL_ORBIT_UI_V9__ = true;

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
      /* The app is a header + chat column. The chat must consume only the remaining space. */
      #${ROOT_ID}.open .ov2-app {
        height:100% !important;
        min-height:0 !important;
        max-height:100% !important;
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
      }

      #${ROOT_ID}.open .ov2-app > .ov2-head {
        flex:0 0 auto !important;
      }

      #${ROOT_ID}.open .ov2-app > .ov2-chat {
        flex:1 1 auto !important;
        height:auto !important;
        min-height:0 !important;
        max-height:none !important;
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
      }

      #${ROOT_ID}.open .ov2-chat-messages {
        flex:1 1 auto !important;
        height:auto !important;
        min-height:0 !important;
        max-height:none !important;
        overflow-y:auto !important;
        overflow-x:hidden !important;
      }

      #${ROOT_ID}.open .ov2-chat .ov2-composer {
        flex:0 0 auto !important;
        position:relative !important;
        top:auto !important;
        right:auto !important;
        bottom:auto !important;
        left:auto !important;
        width:100% !important;
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
    window.addEventListener("focusout", () => window.setTimeout(scheduleSync, 50), { passive:true });

    const observer = new MutationObserver(() => {
      const root = getRoot();
      if (root?.classList.contains("open")) scheduleSync();
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
