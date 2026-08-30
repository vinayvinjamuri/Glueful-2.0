/* Glueful Orbit force-home v1
 * Runs after Orbit v2 exists and replaces the legacy application-list home.
 * Uses polling because Orbit v2 can create its root after DOMContentLoaded.
 */
(function () {
  "use strict";
  if (window.__GLUEFUL_ORBIT_FORCE_HOME_V1__) return;
  window.__GLUEFUL_ORBIT_FORCE_HOME_V1__ = true;

  const ROOT_ID = "glueful-orbit-v2-root";
  const MARK = "data-orbit-force-home-v1";
  const STYLE_ID = "glueful-orbit-force-home-style-v1";

  function styles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      .ovfh-home{height:100%;min-height:0;display:flex;flex-direction:column;padding:0 14px calc(env(safe-area-inset-bottom) + 10px);background:radial-gradient(circle at 50% 28%,rgba(113,59,255,.13),transparent 30%),#060912}
      .ovfh-main{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:auto;padding:18px 4px 14px}
      .ovfh-mark{width:92px;height:92px;flex:0 0 92px;display:grid;place-items:center;border-radius:30px;margin-bottom:18px;font-size:48px;background:radial-gradient(circle,#6638ff,#17112f 67%);box-shadow:0 0 44px rgba(115,64,255,.34)}
      .ovfh-main h2{margin:0;color:#f6f8ff;font-size:25px;line-height:1.15;letter-spacing:-.5px}
      .ovfh-sub{margin:9px 0 0;max-width:330px;color:#929db1;font-size:14px;line-height:1.5}
      .ovfh-prompts{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;max-width:360px;margin-top:22px}
      .ovfh-prompt{appearance:none;-webkit-appearance:none;border:1px solid #273650;background:#0d1625;color:#dce2ec;border-radius:999px;padding:10px 13px;font-size:11px;line-height:1.2;cursor:pointer;touch-action:manipulation}
      .ovfh-prompt.primary{border-color:#7744ff}.ovfh-prompt:active{transform:scale(.98)}
      .ovfh-composer{flex:0 0 auto;display:flex;align-items:center;gap:8px;width:100%;min-height:58px;padding:8px;border:1px solid #293853;border-radius:17px;background:#0c1422;box-shadow:0 10px 30px rgba(0,0,0,.35)}
      .ovfh-input{flex:1;min-width:0;height:42px;border:0;outline:0;background:transparent;color:#fff;padding:10px 3px;font-size:14px}.ovfh-input::placeholder{color:#7f8ba0}
      .ovfh-plus,.ovfh-send{flex:0 0 42px;width:42px;height:42px;min-width:42px;min-height:42px;border-radius:13px;cursor:pointer;touch-action:manipulation}.ovfh-plus{border:1px solid #26364f;background:#101a2a;color:#dbe2ef;font-size:20px}.ovfh-send{border:0;background:#743cff;color:#fff;font-size:17px}
      .ovfh-note{text-align:center;color:#68758a;font-size:9px;line-height:1.25;margin:7px 0 0}
      @media(max-width:380px){.ovfh-mark{width:78px;height:78px;flex-basis:78px;font-size:40px}.ovfh-main h2{font-size:22px}.ovfh-prompt{font-size:10px;padding:9px 11px}}
    `;
    document.head.appendChild(s);
  }

  function getApp() {
    return document.querySelector(`#${ROOT_ID} .ov2-app`);
  }

  function openChat(text) {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    let bridge = root.querySelector('[data-orbit-force-bridge="1"]');
    if (!bridge) {
      bridge = document.createElement("button");
      bridge.type = "button";
      bridge.dataset.action = "glueful";
      bridge.dataset.orbitForceBridge = "1";
      bridge.style.display = "none";
      root.appendChild(bridge);
    }
    bridge.click();
    if (!text) return;
    let tries = 0;
    const fill = () => {
      tries += 1;
      const input = root.querySelector(".ov2-chat .ov2-input");
      const form = root.querySelector('.ov2-chat form[data-action="send"]');
      if (input && form) {
        input.value = text;
        input.dispatchEvent(new Event("input", { bubbles:true }));
        form.dispatchEvent(new Event("submit", { bubbles:true, cancelable:true }));
        return;
      }
      if (tries < 40) setTimeout(fill, 50);
    };
    setTimeout(fill, 50);
  }

  function render(app) {
    if (!app || app.getAttribute(MARK) === "1") return;
    const title = app.querySelector(".ov2-title")?.textContent?.trim();
    if (title !== "Orbit AI") return;
    const body = app.querySelector(".ov2-body");
    if (!body) return;

    app.setAttribute(MARK, "1");
    body.classList.add("ovfh-home");
    body.innerHTML = `
      <main class="ovfh-main">
        <div class="ovfh-mark">🪐</div>
        <h2>Hi there! 👋</h2>
        <p class="ovfh-sub">How can I help you with your career today?</p>
        <div class="ovfh-prompts">
          <button type="button" class="ovfh-prompt primary" data-force-prompt="Help me prepare for an interview">🎯 Prepare for an interview</button>
          <button type="button" class="ovfh-prompt" data-force-prompt="Review my resume">📄 Review my resume</button>
          <button type="button" class="ovfh-prompt" data-force-prompt="How should I answer behavioral questions?">💬 Behavioral questions</button>
          <button type="button" class="ovfh-prompt" data-force-prompt="Tell me about my current job applications">📋 My applications</button>
        </div>
      </main>
      <form class="ovfh-composer" data-force-composer="1">
        <button type="button" class="ovfh-plus" aria-label="Focus message">+</button>
        <input class="ovfh-input" autocomplete="off" placeholder="Message Orbit AI..." aria-label="Message Orbit AI" />
        <button type="submit" class="ovfh-send" aria-label="Send">➤</button>
      </form>
      <div class="ovfh-note">Orbit can make mistakes. Please verify important information.</div>`;

    const input = body.querySelector(".ovfh-input");
    body.querySelector(".ovfh-plus")?.addEventListener("click", () => input?.focus());
    body.querySelectorAll("[data-force-prompt]").forEach(btn => btn.addEventListener("click", () => openChat(btn.dataset.forcePrompt || "")));
    body.querySelector("[data-force-composer]")?.addEventListener("submit", e => {
      e.preventDefault();
      const text = String(input?.value || "").trim();
      if (text) openChat(text); else input?.focus();
    });
  }

  function sync() { styles(); render(getApp()); }

  function start() {
    styles();
    sync();
    const observer = new MutationObserver(() => requestAnimationFrame(sync));
    observer.observe(document.documentElement, { childList:true, subtree:true });
    setInterval(sync, 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
