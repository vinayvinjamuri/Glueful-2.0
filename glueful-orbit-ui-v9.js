/*
 * Glueful Orbit UI v12 — Android IME scroll-anchor fix.
 *
 * v11 fixed the root-height regression, but Android can still auto-pan the
 * document or scroll the focused input's ancestors when the IME opens. That
 * makes the existing chat bubbles appear to jump upward.
 *
 * v12 treats Orbit as a modal viewport:
 * - lock document scrolling while Orbit is open;
 * - keep the chat message scroller anchored to the bottom when it was already
 *   at the bottom before focus/resize;
 * - restore that anchor after visualViewport changes and focus events;
 * - never manually translate the message list or composer.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V12__) return;
  window.__GLUEFUL_ORBIT_UI_V12__ = true;

  const ROOT_ID = "glueful-orbit-v2-root";
  const STYLE_ID = "glueful-orbit-ui-v12-style";
  const LOCK_CLASS = "glueful-orbit-scroll-locked";
  let rafId = 0;
  let unlockTimer = 0;
  let lockedBodyOverflow = null;
  let lockedHtmlOverflow = null;
  let lockedBodyPosition = null;
  let lockedBodyTop = null;
  let lockedScrollY = 0;
  let wasAtBottom = true;

  function root() {
    return document.getElementById(ROOT_ID);
  }

  function messages() {
    return root()?.querySelector(".ov2-chat-messages") || null;
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      html.${LOCK_CLASS},
      body.${LOCK_CLASS} {
        overflow:hidden !important;
        overscroll-behavior:none !important;
      }

      #${ROOT_ID}.open {
        position:fixed !important;
        inset:0 !important;
        width:100% !important;
        height:100dvh !important;
        max-height:none !important;
        overflow:hidden !important;
        transform:none !important;
        display:block !important;
        overscroll-behavior:none !important;
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
        overscroll-behavior:contain !important;
      }

      #${ROOT_ID}.open .ov2-app.ov2-chat {
        flex:1 1 auto !important;
        width:100% !important;
        height:100% !important;
        min-height:0 !important;
        max-height:none !important;
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
        overscroll-behavior:none !important;
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
        overflow-anchor:auto !important;
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

      #${ROOT_ID}.open .ov2-app.ov2-chat .ov2-input {
        scroll-margin:0 !important;
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

  function lockDocumentScroll() {
    if (!document.documentElement || !document.body) return;
    if (document.documentElement.classList.contains(LOCK_CLASS)) return;

    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    lockedHtmlOverflow = document.documentElement.style.overflow;
    lockedBodyOverflow = document.body.style.overflow;
    lockedBodyPosition = document.body.style.position;
    lockedBodyTop = document.body.style.top;

    document.documentElement.classList.add(LOCK_CLASS);
    document.body.classList.add(LOCK_CLASS);
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.width = "100%";
  }

  function unlockDocumentScroll() {
    if (!document.documentElement || !document.body) return;
    document.documentElement.classList.remove(LOCK_CLASS);
    document.body.classList.remove(LOCK_CLASS);
    document.body.style.overflow = lockedBodyOverflow || "";
    document.body.style.position = lockedBodyPosition || "";
    document.body.style.top = lockedBodyTop || "";
    document.body.style.width = "";
    window.scrollTo?.(0, lockedScrollY);
  }

  function updateBottomState() {
    const el = messages();
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    wasAtBottom = distance <= 24;
  }

  function restoreChatAnchor() {
    const el = messages();
    if (!el) return;

    if (wasAtBottom) {
      el.scrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
    }
  }

  function syncViewport() {
    const el = root();
    if (!el || !el.classList.contains("open")) return;

    /* Keep the shell full-screen. Do not copy raw visualViewport.height here. */
    el.style.height = "100dvh";
    el.style.maxHeight = "none";
    el.style.top = "0px";
    el.style.bottom = "0px";

    restoreChatAnchor();
  }

  function scheduleSync() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      syncViewport();
      window.setTimeout(restoreChatAnchor, 30);
      window.setTimeout(restoreChatAnchor, 150);
    });
  }

  function handleFocusIn(event) {
    if (!root()?.classList.contains("open")) return;
    if (event.target?.matches?.(".ov2-input")) {
      updateBottomState();
      lockDocumentScroll();
      scheduleSync();
      window.setTimeout(() => {
        window.scrollTo?.(0, 0);
        restoreChatAnchor();
      }, 50);
    }
  }

  function handleFocusOut() {
    if (!root()?.classList.contains("open")) return;
    window.setTimeout(scheduleSync, 120);
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
    window.addEventListener("focusin", handleFocusIn, { passive:true });
    window.addEventListener("focusout", handleFocusOut, { passive:true });

    const observer = new MutationObserver(() => {
      const open = root()?.classList.contains("open");
      if (open) {
        lockDocumentScroll();
        scheduleSync();
      } else {
        if (unlockTimer) window.clearTimeout(unlockTimer);
        unlockTimer = window.setTimeout(unlockDocumentScroll, 0);
      }
    });
    observer.observe(document.documentElement, {
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:["class"]
    });

    document.addEventListener("scroll", () => {
      if (!root()?.classList.contains("open")) return;
      window.scrollTo?.(0, 0);
    }, { passive:true });

    document.addEventListener("scroll", event => {
      if (!root()?.classList.contains("open")) return;
      if (event.target === messages()) updateBottomState();
    }, { passive:true, capture:true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
