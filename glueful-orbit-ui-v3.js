/* Glueful Orbit home v7 — robust startup version.
 * Waits for Orbit v2 to create its DOM instead of assuming it exists at startup.
 */
(function () {
  "use strict";
  if (window.__GLUEFUL_ORBIT_UI_V7__) return;
  window.__GLUEFUL_ORBIT_UI_V7__ = true;

  const ROOT = "glueful-orbit-v2-root";
  const MARK = "data-orbit-home-v7";
  const STYLE = "orbit-home-v7-style";

  function installStyles() {
    if (document.getElementById(STYLE)) return;
    const s = document.createElement("style");
    s.id = STYLE;
    s.textContent = `
      .ov7-home{height:100%!important;min-height:0!important;display:flex!important;flex-direction:column!important;padding:0 14px calc(env(safe-area-inset-bottom) + 10px)!important;background:radial-gradient(circle at 50% 28%,rgba(113,59,255,.13),transparent 30%),#060912!important}
      .ov7-main{flex:1!important;min-height:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;overflow:auto!important;padding:18px 4px 14px!important}
      .ov7-mark{width:92px!important;height:92px!important;flex:0 0 92px!important;display:grid!important;place-items:center!important;border-radius:30px!important;margin-bottom:18px!important;font-size:48px!important;background:radial-gradient(circle,#6638ff,#17112f 67%)!important;box-shadow:0 0 44px rgba(115,64,255,.34)!important}
      .ov7-main h2{margin:0!important;color:#f6f8ff!important;font-size:25px!important;line-height:1.15!important;letter-spacing:-.5px!important}
      .ov7-sub{margin:9px 0 0!important;max-width:330px!important;color:#929db1!important;font-size:14px!important;line-height:1.5!important}
      .ov7-prompts{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:8px!important;max-width:360px!important;margin-top:22px!important}
      .ov7-prompt{appearance:none!important;-webkit-appearance:none!important;border:1px solid #273650!important;background:#0d1625!important;color:#dce2ec!important;border-radius:999px!important;padding:10px 13px!important;font-size:11px!important;line-height:1.2!important;cursor:pointer!important;touch-action:manipulation!important}.ov7-prompt.primary{border-color:#7744ff!important}
      .ov7-composer{flex:0 0 auto!important;display:flex!important;align-items:center!important;gap:8px!important;width:100%!important;min-height:58px!important;padding:8px!important;border:1px solid #293853!important;border-radius:17px!important;background:#0c1422!important;box-shadow:0 10px 30px rgba(0,0,0,.35)!important}
      .ov7-input{flex:1!important;min-width:0!important;height:42px!important;border:0!important;outline:0!important;background:transparent!important;color:#fff!important;padding:10px 3px!important;font-size:14px!important}.ov7-input::placeholder{color:#7f8ba0!important}
      .ov7-plus,.ov7-send{flex:0 0 42px!important;width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important;border-radius:13px!important;cursor:pointer!important;touch-action:manipulation!important}.ov7-plus{border:1px solid #26364f!important;background:#101a2a!important;color:#dbe2ef!important;font-size:20px!important}.ov7-send{border:0!important;background:#743cff!important;color:#fff!important;font-size:17px!important}
      .ov7-note{text-align:center!important;color:#68758a!important;font-size:9px!important;line-height:1.25!important;margin:7px 0 0!important}
      @media(max-width:380px){.ov7-mark{width:78px!important;height:78px!important;flex-basis:78px!important;font-size:40px!important}.ov7-main h2{font-size:22px!important}.ov7-prompt{font-size:10px!important;padding:9px 11px!important}}
    `;
    document.head.appendChild(s);
  }

  function getApp() { return document.querySelector(`#${ROOT} .ov2-app`); }

  function openChat(text) {
    const root = document.getElementById(ROOT);
    if (!root) return;
    let bridge = root.querySelector("[data-orbit-v7-bridge]");
    if (!bridge) {
      bridge = document.createElement("button");
      bridge.type = "button";
      bridge.dataset.action = "glueful";
      bridge.dataset.orbitV7Bridge = "1";
      bridge.style.display = "none";
      root.appendChild(bridge);
    }
    bridge.click();
    if (!text) return;
    let tries = 0;
    const fill = () => {
      tries++;
      const input = root.querySelector(".ov2-chat .ov2-input");
      const form = root.querySelector('.ov2-chat form[data-action="send"]');
      if (input && form) {
        input.value = text;
        input.dispatchEvent(new Event("input", {bubbles:true}));
        form.dispatchEvent(new Event("submit", {bubbles:true,cancelable:true}));
        return;
      }
      if (tries < 40) setTimeout(fill, 50);
    };
    setTimeout(fill, 50);
  }

  function render(app) {
    if (!app || app.getAttribute(MARK) === "1") return;
    if ((app.querySelector(".ov2-title")?.textContent || "").trim() !== "Orbit AI") return;
    const body = app.querySelector(".ov2-body");
    if (!body) return;

    app.setAttribute(MARK, "1");
    body.classList.add("ov7-home");
    body.innerHTML = `
      <main class="ov7-main">
        <div class="ov7-mark">🪐</div>
        <h2>Hi there! 👋</h2>
        <p class="ov7-sub">How can I help you with your career today?</p>
        <div class="ov7-prompts">
          <button type="button" class="ov7-prompt primary" data-orbit-v7="Help me prepare for an interview">🎯 Prepare for an interview</button>
          <button type="button" class="ov7-prompt" data-orbit-v7="Review my resume">📄 Review my resume</button>
          <button type="button" class="ov7-prompt" data-orbit-v7="How should I answer behavioral questions?">💬 Behavioral questions</button>
          <button type="button" class="ov7-prompt" data-orbit-v7="Tell me about my current job applications">📋 My applications</button>
        </div>
      </main>
      <form class="ov7-composer" data-orbit-v7-composer="1">
        <button type="button" class="ov7-plus" aria-label="Focus message">+</button>
        <input class="ov7-input" autocomplete="off" placeholder="Message Orbit AI..." aria-label="Message Orbit AI" />
        <button type="submit" class="ov7-send" aria-label="Send">➤</button>
      </form>
      <div class="ov7-note">Orbit can make mistakes. Please verify important information.</div>`;

    const input = body.querySelector(".ov7-input");
    body.querySelector(".ov7-plus")?.addEventListener("click", () => input?.focus());
    body.querySelectorAll("[data-orbit-v7]").forEach(btn => btn.addEventListener("click", () => openChat(btn.dataset.orbitV7 || "")));
    body.querySelector("[data-orbit-v7-composer]")?.addEventListener("submit", e => {
      e.preventDefault();
      const text = String(input?.value || "").trim();
      if (text) openChat(text); else input?.focus();
    });
  }

  function sync() { installStyles(); render(getApp()); }

  function start() {
    installStyles();
    sync();
    const observer = new MutationObserver(() => requestAnimationFrame(sync));
    observer.observe(document.documentElement, {childList:true,subtree:true});
    setInterval(sync, 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once:true});
  else start();
})();
