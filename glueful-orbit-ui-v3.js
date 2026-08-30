/*
 * Glueful Orbit UI v4 — chat-first home experience.
 *
 * The Orbit home now starts like a familiar AI chat: greeting, suggested
 * prompts, and a message composer. Existing Orbit preparation/chat flows are
 * preserved and are entered through the existing data-action handlers.
 *
 * Complexity:
 * - Time: O(n) per home render observation, where n is the number of existing
 *   Orbit DOM nodes inspected; prompt rendering itself is O(1).
 * - Space: O(1) additional JavaScript state; the browser owns the chat DOM.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V4__) return;
  window.__GLUEFUL_ORBIT_UI_V4__ = true;

  const STYLE_ID = "glueful-orbit-ui-v4-style";
  const VIEW_ID = "glueful-orbit-v2-view";
  const HOME_MARK = "data-orbit-chat-home";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ov4-chat-home {
        display:flex !important;
        flex-direction:column !important;
        min-height:100% !important;
        padding:10px 14px 18px !important;
      }
      .ov4-welcome {
        flex:1;
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        text-align:center;
        padding:28px 6px 20px;
      }
      .ov4-orbit {
        width:92px;
        height:92px;
        border-radius:30px;
        display:grid;
        place-items:center;
        font-size:48px;
        margin-bottom:20px;
        background:radial-gradient(circle,#6438ff,#17112f 68%);
        box-shadow:0 0 42px rgba(115,64,255,.32);
      }
      .ov4-welcome h2 {
        margin:0;
        font-size:24px;
        line-height:1.15;
        letter-spacing:-.35px;
      }
      .ov4-welcome p {
        max-width:330px;
        margin:9px auto 0;
        color:#929db1;
        font-size:13px;
        line-height:1.5;
      }
      .ov4-prompts {
        width:100%;
        display:flex;
        flex-wrap:wrap;
        justify-content:center;
        gap:8px;
        margin-top:22px;
      }
      .ov4-prompt {
        border:1px solid #273650;
        background:#0d1625;
        color:#dce2ec;
        border-radius:999px;
        padding:10px 13px;
        font-size:11px;
        line-height:1.2;
        cursor:pointer;
      }
      .ov4-prompt:hover { border-color:#7c45ff; }
      .ov4-composer {
        display:flex;
        align-items:center;
        gap:8px;
        width:100%;
        padding:8px;
        border:1px solid #293853;
        border-radius:17px;
        background:#0c1422;
        box-shadow:0 10px 30px rgba(0,0,0,.2);
      }
      .ov4-plus,
      .ov4-send {
        flex:0 0 42px;
        width:42px;
        height:42px;
        border-radius:13px;
        border:1px solid #26364f;
        background:#101a2a;
        color:#dbe2ef;
        cursor:pointer;
      }
      .ov4-send {
        border:0;
        background:#743cff;
        color:#fff;
        font-size:17px;
      }
      .ov4-input {
        flex:1;
        min-width:0;
        border:0;
        outline:0;
        background:transparent;
        color:#fff;
        font-size:13px;
        padding:11px 2px;
      }
      .ov4-input::placeholder { color:#7f8ba0; }
      .ov4-note {
        text-align:center;
        color:#68758a;
        font-size:9px;
        margin:8px 0 0;
      }
      #glueful-orbit-v4-open-chat {
        display:none !important;
      }
      @media (max-width:380px) {
        .ov4-welcome { padding-top:18px; }
        .ov4-orbit { width:78px; height:78px; font-size:40px; }
        .ov4-welcome h2 { font-size:21px; }
        .ov4-prompt { font-size:10px; padding:9px 11px; }
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
          const raw = meta.first_name || meta.full_name || meta.name || "";
          return String(raw).trim().split(/\\s+/)[0] || "there";
        }).catch(() => "there");
      }
    } catch (_) {}
    return Promise.resolve("there");
  }

  function hiddenChatEntry() {
    let button = document.getElementById("glueful-orbit-v4-open-chat");
    if (button) return button;
    button = document.createElement("button");
    button.id = "glueful-orbit-v4-open-chat";
    button.type = "button";
    button.dataset.action = "glueful";
    button.textContent = "Open Orbit chat";
    document.body.appendChild(button);
    return button;
  }

  function openExistingChat(text) {
    const button = hiddenChatEntry();
    button.click();

    if (!text) return;

    /* The v2 runtime renders its chat asynchronously after the action. */
    let attempts = 0;
    const fill = () => {
      attempts += 1;
      const input = getView()?.querySelector(".ov2-input");
      const send = getView()?.querySelector('[data-action="send"]');
      if (input && send) {
        input.value = text;
        input.dispatchEvent(new Event("input", { bubbles:true }));
        send.click();
        return;
      }
      if (attempts < 30) window.setTimeout(fill, 50);
    };
    window.setTimeout(fill, 50);
  }

  function renderHome(app) {
    if (app.getAttribute(HOME_MARK) === "1") return;

    const body = app.querySelector(".ov2-body");
    if (!body) return;

    app.setAttribute(HOME_MARK, "1");
    body.classList.add("ov4-chat-home");
    body.innerHTML = `
      <section class="ov4-welcome">
        <div class="ov4-orbit">🪐</div>
        <h2 id="ov4-greeting">Hi there! 👋</h2>
        <p>How can I help you with your career today?</p>
        <div class="ov4-prompts">
          <button type="button" class="ov4-prompt" data-orbit-prompt="Help me prepare for an interview">🎯 Prepare for an interview</button>
          <button type="button" class="ov4-prompt" data-orbit-prompt="Review my resume">📄 Review my resume</button>
          <button type="button" class="ov4-prompt" data-orbit-prompt="How should I answer behavioral questions?">💬 Behavioral questions</button>
          <button type="button" class="ov4-prompt" data-orbit-prompt="Tell me about my current job applications">📋 My applications</button>
        </div>
      </section>
      <form class="ov4-composer" id="ov4-composer">
        <button type="button" class="ov4-plus" aria-label="Attach">+</button>
        <input class="ov4-input" autocomplete="off" placeholder="Message Orbit AI..." aria-label="Message Orbit AI" />
        <button type="submit" class="ov4-send" aria-label="Send">➤</button>
      </form>
      <div class="ov4-note">Orbit can make mistakes. Please verify important information.</div>
    `;

    const input = body.querySelector(".ov4-input");
    const form = body.querySelector("#ov4-composer");

    body.querySelectorAll("[data-orbit-prompt]").forEach(button => {
      button.addEventListener("click", () => openExistingChat(button.dataset.orbitPrompt || ""));
    });

    form?.addEventListener("submit", event => {
      event.preventDefault();
      const text = String(input?.value || "").trim();
      if (!text) return;
      openExistingChat(text);
    });

    getName().then(name => {
      const greeting = body.querySelector("#ov4-greeting");
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

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(sync);
    });
    observer.observe(view, { childList:true, subtree:true });
    window.addEventListener("resize", sync, { passive:true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
