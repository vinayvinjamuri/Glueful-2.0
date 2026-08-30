/*
 * Glueful Orbit UI v5 — functional chat-first home.
 *
 * Fixes the v4 interaction path: the hidden bridge button now lives inside
 * Orbit's root so the existing Orbit event delegation can receive its click.
 * The home composer is also explicitly anchored at the bottom of the Orbit
 * viewport so it cannot disappear below the scroll area.
 *
 * Complexity:
 * - Time: O(1) for home UI rendering and prompt wiring.
 * - Space: O(1) additional JavaScript state; existing Orbit state is reused.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V5__) return;
  window.__GLUEFUL_ORBIT_UI_V5__ = true;

  const STYLE_ID = "glueful-orbit-ui-v5-style";
  const ROOT_ID = "glueful-orbit-v2-root";
  const VIEW_ID = "glueful-orbit-v2-view";
  const HOME_MARK = "data-orbit-chat-home";
  const BRIDGE_ID = "glueful-orbit-v5-open-chat";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ov5-chat-home {
        display:flex !important;
        flex-direction:column !important;
        height:100% !important;
        min-height:0 !important;
        padding:10px 14px calc(env(safe-area-inset-bottom) + 12px) !important;
        overflow:auto !important;
      }
      .ov5-welcome {
        flex:1 1 auto !important;
        min-height:0 !important;
        display:flex !important;
        flex-direction:column !important;
        justify-content:center !important;
        align-items:center !important;
        text-align:center !important;
        padding:24px 6px 18px !important;
      }
      .ov5-orbit {
        width:92px;
        height:92px;
        flex:0 0 92px;
        border-radius:30px;
        display:grid;
        place-items:center;
        font-size:48px;
        margin-bottom:20px;
        background:radial-gradient(circle,#6438ff,#17112f 68%);
        box-shadow:0 0 42px rgba(115,64,255,.32);
      }
      .ov5-welcome h2 {
        margin:0;
        font-size:24px;
        line-height:1.15;
        letter-spacing:-.35px;
      }
      .ov5-welcome p {
        max-width:330px;
        margin:9px auto 0;
        color:#929db1;
        font-size:13px;
        line-height:1.5;
      }
      .ov5-prompts {
        width:100%;
        display:flex;
        flex-wrap:wrap;
        justify-content:center;
        gap:8px;
        margin-top:22px;
      }
      .ov5-prompt {
        appearance:none;
        -webkit-appearance:none;
        border:1px solid #273650;
        background:#0d1625;
        color:#dce2ec;
        border-radius:999px;
        padding:10px 13px;
        font-size:11px;
        line-height:1.2;
        cursor:pointer;
        touch-action:manipulation;
      }
      .ov5-prompt:active { transform:scale(.98); }
      .ov5-composer {
        position:sticky !important;
        bottom:0 !important;
        z-index:10 !important;
        flex:0 0 auto !important;
        display:flex !important;
        align-items:center !important;
        gap:8px !important;
        width:100% !important;
        min-height:58px !important;
        padding:8px !important;
        margin:0 !important;
        border:1px solid #293853 !important;
        border-radius:17px !important;
        background:#0c1422 !important;
        box-shadow:0 10px 30px rgba(0,0,0,.35) !important;
      }
      .ov5-plus,
      .ov5-send {
        appearance:none;
        -webkit-appearance:none;
        flex:0 0 42px !important;
        width:42px !important;
        height:42px !important;
        min-width:42px !important;
        min-height:42px !important;
        border-radius:13px !important;
        border:1px solid #26364f !important;
        background:#101a2a !important;
        color:#dbe2ef !important;
        cursor:pointer;
        touch-action:manipulation;
      }
      .ov5-send {
        border:0 !important;
        background:#743cff !important;
        color:#fff !important;
        font-size:17px !important;
      }
      .ov5-input {
        flex:1 !important;
        min-width:0 !important;
        width:auto !important;
        border:0 !important;
        outline:0 !important;
        background:transparent !important;
        color:#fff !important;
        font-size:14px !important;
        padding:11px 2px !important;
      }
      .ov5-input::placeholder { color:#7f8ba0; }
      .ov5-note {
        flex:0 0 auto !important;
        text-align:center !important;
        color:#68758a !important;
        font-size:9px !important;
        line-height:1.25 !important;
        margin:7px 0 0 !important;
      }
      #${BRIDGE_ID} { display:none !important; }
      @media (max-width:380px) {
        .ov5-welcome { padding-top:14px !important; }
        .ov5-orbit { width:78px; height:78px; flex-basis:78px; font-size:40px; }
        .ov5-welcome h2 { font-size:21px; }
        .ov5-prompt { font-size:10px; padding:9px 11px; }
      }
    `;
    document.head.appendChild(style);
  }

  function getView() {
    return document.getElementById(VIEW_ID);
  }

  function getApp() {
    return getView()?.querySelector(".ov2-app") || null;
  }

  function getName() {
    try {
      const client = window.supabaseClient || window.gluefulSupabaseClient;
      if (client?.auth?.getUser) {
        return client.auth.getUser().then(({ data }) => {
          const meta = data?.user?.user_metadata || {};
          const first = String(meta.first_name || "").trim();
          if (first) return first;
          const raw = String(meta.full_name || meta.name || "").trim();
          return raw ? raw.split(/\s+/)[0] : "there";
        }).catch(() => "there");
      }
    } catch (_) {}
    return Promise.resolve("there");
  }

  function hiddenChatEntry() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return null;

    let button = document.getElementById(BRIDGE_ID);
    if (button && button.parentElement === root) return button;

    button = document.createElement("button");
    button.id = BRIDGE_ID;
    button.type = "button";
    button.dataset.action = "glueful";
    button.textContent = "Open Orbit chat";
    root.appendChild(button);
    return button;
  }

  function openExistingChat(text) {
    const button = hiddenChatEntry();
    if (!button) return;

    /* v2 delegates data-action clicks from the Orbit root. */
    button.click();

    if (!text) return;

    let attempts = 0;
    const fill = () => {
      attempts += 1;
      const input = getView()?.querySelector(".ov2-input");
      const form = getView()?.querySelector('form[data-action="send"]');
      if (input && form) {
        input.value = text;
        input.focus();
        form.dispatchEvent(new Event("submit", { bubbles:true, cancelable:true }));
        return;
      }
      if (attempts < 40) window.setTimeout(fill, 50);
    };
    window.setTimeout(fill, 50);
  }

  function renderHome(app) {
    if (app.getAttribute(HOME_MARK) === "1") return;

    const body = app.querySelector(".ov2-body");
    if (!body) return;

    app.setAttribute(HOME_MARK, "1");
    body.classList.add("ov5-chat-home");
    body.innerHTML = `
      <section class="ov5-welcome">
        <div class="ov5-orbit">🪐</div>
        <h2 id="ov5-greeting">Hi there! 👋</h2>
        <p>How can I help you with your career today?</p>
        <div class="ov5-prompts">
          <button type="button" class="ov5-prompt" data-orbit-prompt="Help me prepare for an interview">🎯 Prepare for an interview</button>
          <button type="button" class="ov5-prompt" data-orbit-prompt="Review my resume">📄 Review my resume</button>
          <button type="button" class="ov5-prompt" data-orbit-prompt="How should I answer behavioral questions?">💬 Behavioral questions</button>
          <button type="button" class="ov5-prompt" data-orbit-prompt="Tell me about my current job applications">📋 My applications</button>
        </div>
      </section>
      <form class="ov5-composer" id="ov5-composer">
        <button type="button" class="ov5-plus" aria-label="Focus message">+</button>
        <input class="ov5-input" autocomplete="off" placeholder="Message Orbit AI..." aria-label="Message Orbit AI" />
        <button type="submit" class="ov5-send" aria-label="Send">➤</button>
      </form>
      <div class="ov5-note">Orbit can make mistakes. Please verify important information.</div>
    `;

    const input = body.querySelector(".ov5-input");
    const form = body.querySelector("#ov5-composer");
    const plus = body.querySelector(".ov5-plus");

    plus?.addEventListener("click", () => input?.focus());

    body.querySelectorAll("[data-orbit-prompt]").forEach(button => {
      button.addEventListener("click", () => {
        openExistingChat(button.dataset.orbitPrompt || "");
      });
    });

    form?.addEventListener("submit", event => {
      event.preventDefault();
      const text = String(input?.value || "").trim();
      if (!text) {
        input?.focus();
        return;
      }
      openExistingChat(text);
    });

    getName().then(name => {
      const greeting = body.querySelector("#ov5-greeting");
      if (greeting && app.getAttribute(HOME_MARK) === "1") {
        greeting.textContent = `Hi ${name}! 👋`;
      }
    });
  }

  function sync() {
    installStyles();
    const app = getApp();
    if (!app) return;

    const title = app.querySelector(".ov2-title")?.textContent?.trim() || "";
    if (title === "Orbit AI") renderHome(app);
  }

  function start() {
    installStyles();
    sync();
    const view = getView();
    if (!view) return;

    const observer = new MutationObserver(() => window.requestAnimationFrame(sync));
    observer.observe(view, { childList:true, subtree:true });
    window.addEventListener("resize", sync, { passive:true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
