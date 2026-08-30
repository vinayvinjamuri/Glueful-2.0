/*
 * Glueful Orbit UI v14 — CSS-first Android IME layout.
 *
 * Root-cause fix: Orbit must have exactly one viewport owner. The runtime
 * must not fix <body>, copy visualViewport geometry into the Orbit root, or
 * repeatedly force document/message scroll positions while the IME animates.
 *
 * The page opts into resizes-content through the viewport meta tag. Orbit is
 * a fixed 100dvh flex column; the message list is the only scroll container
 * and the composer is a normal flex child. Android therefore raises the
 * composer naturally when the keyboard resizes the layout viewport.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V14__) return;
  window.__GLUEFUL_ORBIT_UI_V14__ = true;

  const ROOT_ID = "glueful-orbit-v2-root";
  const STYLE_ID = "glueful-orbit-ui-v14-style";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        html:has(#${ROOT_ID}.open),
        body:has(#${ROOT_ID}.open) {
          height:100% !important;
          overflow:hidden !important;
          overscroll-behavior:none !important;
        }

        #${ROOT_ID}.open {
          position:fixed !important;
          inset:0 !important;
          width:100% !important;
          height:100dvh !important;
          min-height:0 !important;
          max-height:none !important;
          margin:0 !important;
          transform:none !important;
          overflow:hidden !important;
          overscroll-behavior:none !important;
        }

        #${ROOT_ID}.open .ov2-app,
        #${ROOT_ID}.open .ov2-app.ov2-chat {
          width:100% !important;
          height:100% !important;
          min-height:0 !important;
          max-height:none !important;
          display:flex !important;
          flex:1 1 auto !important;
          flex-direction:column !important;
          overflow:hidden !important;
          transform:none !important;
        }

        #${ROOT_ID}.open .ov2-app .ov2-head {
          flex:0 0 auto !important;
          transform:none !important;
        }

        #${ROOT_ID}.open .ov2-app.ov2-chat .ov2-chat-messages {
          flex:1 1 0 !important;
          min-width:0 !important;
          min-height:0 !important;
          height:auto !important;
          max-height:none !important;
          overflow-x:hidden !important;
          overflow-y:auto !important;
          overscroll-behavior:contain !important;
          -webkit-overflow-scrolling:touch !important;
          overflow-anchor:auto !important;
          touch-action:pan-y !important;
          transform:none !important;
        }

        #${ROOT_ID}.open .ov2-app.ov2-chat .ov2-composer {
          position:relative !important;
          inset:auto !important;
          flex:0 0 auto !important;
          width:100% !important;
          min-height:74px !important;
          height:auto !important;
          margin:0 !important;
          box-sizing:border-box !important;
          transform:none !important;
          padding-bottom:calc(env(safe-area-inset-bottom) + 9px) !important;
          overflow:visible !important;
        }

        #${ROOT_ID}.open .ov2-app.ov2-chat .ov2-input {
          scroll-margin:0 !important;
          scroll-padding:0 !important;
          transform:none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function scrubLegacyInlineGeometry() {
    const root = document.getElementById(ROOT_ID);
    if (!root?.classList.contains("open")) return;

    /*
     * Older Orbit UI layers wrote height/top/max-height inline. Remove only
     * those legacy geometry properties so the v14 CSS remains authoritative.
     * This is cleanup, not viewport calculation: no visualViewport values are
     * read or copied into the layout.
     */
    root.style.removeProperty("height");
    root.style.removeProperty("max-height");
    root.style.removeProperty("top");
    root.style.removeProperty("right");
    root.style.removeProperty("bottom");
    root.style.removeProperty("left");
  }

  function start() {
    installStyles();

    const observer = new MutationObserver(() => {
      scrubLegacyInlineGeometry();
    });

    observer.observe(document.documentElement, {
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:["class", "style"]
    });

    scrubLegacyInlineGeometry();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
