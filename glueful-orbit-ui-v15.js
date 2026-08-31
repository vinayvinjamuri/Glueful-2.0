/*
 * Glueful Orbit UI v15 — mobile IME layout hardening.
 *
 * v14 established the correct viewport architecture. v15 adds a final
 * browser-side guard so Android Chrome treats the software keyboard as a
 * layout-viewport resize and keeps the Orbit composer at the bottom of the
 * resized chat surface instead of moving the whole chat/search UI upward.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V15__) return;
  window.__GLUEFUL_ORBIT_UI_V15__ = true;

  const ROOT_ID = "glueful-orbit-v2-root";
  const STYLE_ID = "glueful-orbit-ui-v15-style";

  function installViewportMode() {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }

    const content = meta.getAttribute("content") || "width=device-width, initial-scale=1";
    if (!/interactive-widget\s*=/i.test(content)) {
      meta.setAttribute("content", `${content}, interactive-widget=resizes-content`);
    } else {
      meta.setAttribute(
        "content",
        content.replace(/interactive-widget\s*=\s*[^,\s]+/i, "interactive-widget=resizes-content")
      );
    }
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        html:has(#${ROOT_ID}.open),
        body:has(#${ROOT_ID}.open) {
          width:100% !important;
          height:100% !important;
          min-height:0 !important;
          margin:0 !important;
          padding:0 !important;
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
          padding:0 !important;
          transform:none !important;
          overflow:hidden !important;
          overscroll-behavior:none !important;
        }

        #${ROOT_ID}.open .ov2-app,
        #${ROOT_ID}.open .ov2-app.ov2-chat {
          position:relative !important;
          width:100% !important;
          height:100% !important;
          min-height:0 !important;
          max-height:none !important;
          display:flex !important;
          flex-direction:column !important;
          overflow:hidden !important;
          transform:none !important;
        }

        #${ROOT_ID}.open .ov2-head {
          position:relative !important;
          flex:0 0 auto !important;
          width:100% !important;
          transform:none !important;
        }

        #${ROOT_ID}.open .ov2-chat-messages {
          flex:1 1 auto !important;
          min-height:0 !important;
          height:auto !important;
          max-height:none !important;
          overflow-x:hidden !important;
          overflow-y:auto !important;
          overscroll-behavior:contain !important;
          -webkit-overflow-scrolling:touch !important;
          transform:none !important;
        }

        #${ROOT_ID}.open .ov2-chat .ov2-composer {
          position:relative !important;
          inset:auto !important;
          flex:0 0 auto !important;
          width:100% !important;
          min-height:74px !important;
          height:auto !important;
          margin:0 !important;
          margin-top:auto !important;
          box-sizing:border-box !important;
          transform:none !important;
          padding-bottom:calc(env(safe-area-inset-bottom) + 9px) !important;
          overflow:visible !important;
          z-index:3 !important;
        }

        #${ROOT_ID}.open .ov2-chat .ov2-input {
          position:relative !important;
          scroll-margin:0 !important;
          scroll-padding:0 !important;
          transform:none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function scrubRootGeometry() {
    const root = document.getElementById(ROOT_ID);
    if (!root?.classList.contains("open")) return;

    // Do not let older Orbit layers copy visualViewport coordinates into the
    // root. The layout viewport + 100dvh CSS owns keyboard geometry.
    root.style.removeProperty("height");
    root.style.removeProperty("max-height");
    root.style.removeProperty("top");
    root.style.removeProperty("right");
    root.style.removeProperty("bottom");
    root.style.removeProperty("left");
    root.style.removeProperty("transform");
  }

  function start() {
    installViewportMode();
    installStyles();
    scrubRootGeometry();

    const observer = new MutationObserver(scrubRootGeometry);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    window.addEventListener("resize", scrubRootGeometry, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
