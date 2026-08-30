/*
 * Glueful Orbit UI v11 — mobile viewport regression fix.
 *
 * Keep the Orbit root as a true full-screen overlay. The previous v10 patch
 * wrote visualViewport.height directly onto the root. On Android/WebView,
 * visualViewport can temporarily report a keyboard-sized/stale value while
 * the keyboard is closed, which shrinks the entire Orbit shell and leaves the
 * composer near the top of the screen.
 *
 * The root therefore stays full viewport. The chat layout itself owns the
 * dynamic viewport through 100dvh, while visualViewport events only trigger
 * a layout refresh. This preserves the desired behavior: composer at the
 * bottom normally, and above the keyboard when the keyboard is open.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V11__) return;
  window.__GLUEFUL_ORBIT_UI_V11__ = true;

  const ROOT_ID = "glueful-orbit-v2-root";
  const STYLE_ID = "glueful-orbit-ui-v11-style";
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
        inset:0 !important;
        width:100% !important;
        height:100dvh !important;
        max-height:none !important;
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

      /* .ov2-chat is the app itself, not a child of .ov2-app. */
      #${ROOT_ID}.open .ov2-app.ov2-chat {
        flex:1 1 auto !important;
        width:100% !important;
        height:100% !important;
        min-height:0 !important;
        max-height:none !important;
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
      }

      #${ROOT_ID}.open .ov2-app.ov2-chat .ov2-head {
        flex:0 0 auto !important;
      }

      #${ROOT_ID}.open .ov2-app.ov2-chat .ov2-chat-messages {
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

      #${ROOT_ID}.open .ov2-app.ov2-chat .ov2-composer {
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

      @media (max-width:700px) {
        #${ROOT_ID}.open,
        #${ROOT_ID}.open .ov2-app,
        #${ROOT_ID}.open .ov2-app.ov2-chat {
          height:100dvh !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function syncViewport() {
    const el = root();
    if (!el || !el.classList.contains("open")) return;

    /*
     * Do NOT copy visualViewport.height to the root. Android can expose a
     * transient/stale keyboard-sized visual viewport while the IME is closed.
     * 100dvh is the browser's dynamic viewport authority and keeps the shell
     * full-screen when closed while shrinking naturally with the IME.
     */
    el.style.height = "100dvh";
    el.style.maxHeight = "none";
    el.style.top = "0px";
    el.style.bottom = "0px";
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
    window.addEventListener("focusin", () => window.setTimeout(scheduleSync, 80), { passive:true });
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
