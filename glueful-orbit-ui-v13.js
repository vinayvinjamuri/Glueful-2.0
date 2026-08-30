/*
 * Glueful Orbit UI v13 — Android IME viewport architecture fix.
 *
 * v12 attempted to fight Android focus scrolling by fixing <body> and
 * repeatedly restoring scroll positions. That is the wrong layer for this
 * UI: a fixed body can itself participate in Android's visual-viewport
 * adjustment and makes the focused composer move the whole chat surface.
 *
 * v13 keeps Orbit as a real viewport-sized modal:
 * - document scrolling is locked with overflow only; body is NOT fixed;
 * - Orbit remains fixed to the viewport and uses 100dvh;
 * - the message list is the only scroll container;
 * - the composer is a normal flex child, so it naturally moves above the IME
 *   when the layout viewport is resized;
 * - no visualViewport height/offset is copied into Orbit's geometry;
 * - focus handlers only restore document scroll position, never move Orbit.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V13__) return;
  window.__GLUEFUL_ORBIT_UI_V13__ = true;

  const ROOT_ID = "glueful-orbit-v2-root";
  const STYLE_ID = "glueful-orbit-ui-v13-style";
  const LOCK_CLASS = "glueful-orbit-document-locked-v13";

  let savedHtmlOverflow = null;
  let savedBodyOverflow = null;
  let savedHtmlOverscroll = null;
  let savedBodyOverscroll = null;
  let savedScrollY = 0;
  let rafId = 0;

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function getMessages() {
    return getRoot()?.querySelector(".ov2-chat-messages") || null;
  }

  function isMobile() {
    return window.matchMedia?.("(max-width:700px)").matches ?? window.innerWidth <= 700;
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        html.${LOCK_CLASS},
        body.${LOCK_CLASS} {
          height:100% !important;
          overflow:hidden !important;
          overscroll-behavior:none !important;
        }

        #${ROOT_ID}.open {
          position:fixed !important;
          inset:0 !important;
          top:0 !important;
          right:0 !important;
          bottom:0 !important;
          left:0 !important;
          width:100% !important;
          height:100dvh !important;
          min-height:0 !important;
          max-height:none !important;
          margin:0 !important;
          transform:none !important;
          overflow:hidden !important;
          overscroll-behavior:none !important;
          touch-action:none !important;
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
          transform:none !important;
        }

        #${ROOT_ID}.open .ov2-app.ov2-chat .ov2-composer {
          position:relative !important;
          inset:auto !important;
          top:auto !important;
          right:auto !important;
          bottom:auto !important;
          left:auto !important;
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

  function lockDocument() {
    if (!document.documentElement || !document.body) return;
    if (document.documentElement.classList.contains(LOCK_CLASS)) return;

    savedScrollY = window.scrollY || window.pageYOffset || 0;
    savedHtmlOverflow = document.documentElement.style.overflow;
    savedBodyOverflow = document.body.style.overflow;
    savedHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    savedBodyOverscroll = document.body.style.overscrollBehavior;

    document.documentElement.classList.add(LOCK_CLASS);
    document.body.classList.add(LOCK_CLASS);

    // Deliberately do NOT set body.position/fixed/top. Android keyboard focus
    // must be allowed to resize the viewport without moving the whole page.
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
  }

  function unlockDocument() {
    if (!document.documentElement || !document.body) return;

    document.documentElement.classList.remove(LOCK_CLASS);
    document.body.classList.remove(LOCK_CLASS);

    document.documentElement.style.overflow = savedHtmlOverflow ?? "";
    document.body.style.overflow = savedBodyOverflow ?? "";
    document.documentElement.style.overscrollBehavior = savedHtmlOverscroll ?? "";
    document.body.style.overscrollBehavior = savedBodyOverscroll ?? "";

    window.scrollTo?.(0, savedScrollY);
  }

  function restoreDocumentScroll() {
    if (!getRoot()?.classList.contains("open") || !isMobile()) return;
    // Android may try to scroll the document to reveal the focused input.
    // Orbit has its own message scroller, so document scroll must stay at the
    // position captured when Orbit opened.
    window.scrollTo?.(0, savedScrollY);
    if (document.documentElement) document.documentElement.scrollTop = savedScrollY;
    if (document.body) document.body.scrollTop = savedScrollY;
  }

  function stabilize() {
    const root = getRoot();
    if (!root?.classList.contains("open") || !isMobile()) return;

    lockDocument();
    restoreDocumentScroll();

    // Keep the geometry declarative. In particular, never use
    // visualViewport.height/offsetTop here.
    root.style.removeProperty("top");
    root.style.removeProperty("right");
    root.style.removeProperty("bottom");
    root.style.removeProperty("left");
    root.style.removeProperty("height");
    root.style.removeProperty("max-height");
  }

  function scheduleStabilize() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      stabilize();
    });
  }

  function handleFocusIn(event) {
    const root = getRoot();
    if (!root?.classList.contains("open") || !isMobile()) return;
    if (!event.target?.matches?.(".ov2-input")) return;

    restoreDocumentScroll();
    scheduleStabilize();

    // Cover the Android focus/IME animation without changing the chat's own
    // scroll position or translating the Orbit surface.
    window.setTimeout(restoreDocumentScroll, 0);
    window.setTimeout(restoreDocumentScroll, 50);
    window.setTimeout(restoreDocumentScroll, 150);
    window.setTimeout(restoreDocumentScroll, 300);
  }

  function handleFocusOut() {
    if (!getRoot()?.classList.contains("open") || !isMobile()) return;
    window.setTimeout(scheduleStabilize, 0);
    window.setTimeout(scheduleStabilize, 150);
  }

  function handleViewportChange() {
    const root = getRoot();
    if (!root?.classList.contains("open") || !isMobile()) return;

    // The viewport itself is responsible for keyboard resizing. We only make
    // sure legacy inline geometry from older Orbit UI versions cannot win.
    scheduleStabilize();
  }

  function handleRootMutation() {
    const root = getRoot();
    if (root?.classList.contains("open")) {
      if (isMobile()) {
        lockDocument();
        scheduleStabilize();
      }
    } else {
      unlockDocument();
    }
  }

  function start() {
    installStyles();

    const root = getRoot();
    if (root?.classList.contains("open")) lockDocument();

    window.addEventListener("focusin", handleFocusIn, true);
    window.addEventListener("focusout", handleFocusOut, true);
    window.addEventListener("resize", handleViewportChange, { passive:true });
    window.addEventListener("orientationchange", handleViewportChange, { passive:true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange, { passive:true });
      window.visualViewport.addEventListener("scroll", handleViewportChange, { passive:true });
    }

    const observer = new MutationObserver(handleRootMutation);
    observer.observe(document.documentElement, {
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:["class"]
    });

    if (root?.classList.contains("open")) scheduleStabilize();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
