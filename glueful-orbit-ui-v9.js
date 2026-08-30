/*
 * Glueful Orbit UI v10 — mobile viewport/composer authority fix.
 *
 * The Orbit shell is a fixed overlay. On mobile, Android can shrink
 * visualViewport when the keyboard opens while layout viewport remains tall.
 * This patch makes visualViewport the explicit height authority and keeps the
 * composer inside the flex chat column so it cannot float behind the keyboard.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V10__) return;
  window.__GLUEFUL_ORBIT_UI_V10__ = true;

  const ROOT_ID = "glueful-orbit-v2-root";
  const STYLE_ID = "glueful-orbit-ui-v10-style";
  let rafId = 0;

  function root() {
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
        top:0 !important;
        right:auto !important;
        bottom:auto !important;
        width:100% !important;
        height:100dvh !important;
        max-height:100dvh !important;
        overflow:hidden !important;
        transform:none !important;
        display:block !important;
      }

      #${ROOT_ID}.open .ov2-app {
        width:100% !important;
        height:100% !important;
        min-height:0 !important;
        max-height:none !important;
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
      }

      #${ROOT_ID}.open .ov2-app .ov2-head {
        flex:0 0 auto !important;
      }

      #${ROOT_ID}.open .ov2-app .ov2-body {
        flex:1 1 0 !important;
        min-height:0 !important;
        overflow:auto !important;
      }

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
        flex:1 1 0 !important;
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
        left:auto !important;
        right:auto !important;
        top:auto !important;
        bottom:auto !important;
        inset:auto !important;
        width:100% !important;
        height:auto !important;
        min-height:74px !important;
        margin:0 !important;
        box-sizing:border-box !important;
        padding-bottom:calc(env(safe-area-inset-bottom) + 9px) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function syncViewport() {
    const el = root();
    if (!el || !el.classList.contains("open")) return;

    const vv = window.visualViewport;
    const height = Math.max(1, Math.round(vv?.height || window.innerHeight || 1));
    const top = Math.max(0, Math.round(vv?.offsetTop || 0));

    el.style.height = `${height}px`;
    el.style.maxHeight = `${height}px`;
    el.style.top = `${top}px`;
    el.style.bottom = "auto";
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
    window.addEventListener("orientationchange", scheduleSync, { passive:true });
    window.addEventListener("focusin", scheduleSync, { passive:true });
    window.addEventListener("focusout", () => window.setTimeout(scheduleSync, 120), { passive:true });

    const observer = new MutationObserver(() => {
      if (root()?.classList.contains("open")) scheduleSync();
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
