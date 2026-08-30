/*
 * Glueful Orbit UI v6 — chat-first home.
 *
 * Orbit opens like a conversational assistant. Application data is not shown
 * on the home screen; it is requested through chat or a quick action.
 *
 * Complexity:
 * - Home render: O(1).
 * - Prompt wiring: O(p), where p is the number of quick prompts.
 * - Space: O(1) JavaScript state; DOM space is proportional to the UI.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V6_HOME__) return;
  window.__GLUEFUL_ORBIT_UI_V6_HOME__ = true;

  const STYLE_ID = "glueful-orbit-chat-home-v6-style";
  const ROOT_ID = "glueful-orbit-v2-root";
  const VIEW_ID = "glueful-orbit-v2-view";
  const HOME_MARK = "data-orbit-chat-home-v6";
  const BRIDGE_ID = "glueful-orbit-home-open-chat";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ov6-home {
        height:100% !important;
        min-height:0 !important;
        display:flex !important;
        flex-direction:column !important;
        padding:0 14px calc(env(safe-area-inset-bottom) + 10px) !important;
        background:radial-gradient(circle at 50% 28%,rgba(113,59,255,.13),transparent 30%),#060912 !important;
      }
      .ov6-home-main {
        flex:1 !important;
        min-height:0 !important;
        display:flex !important;
        flex-direction:column !important;
        align-items:center !important;
        justify-content:center !important;
        text-align:center !important;
        overflow:auto !important;
        padding:18px 4px 14px !important;
      }
      .ov6-orbit-mark {
        width:92px !important;
        height:92px !important;
        flex:0 0 92px !important;
        display:grid !important;
        place-items:center !important;
        border-radius:30px !important;
        margin-bottom:18px !important;
        font-size:48px !important;
        background:radial-gradient(circle,#6638ff,#17112f 67%) !important;
        box-shadow:0 0 44px rgba(115,64,255,.34) !important;
      }
      .ov6-home h2 {
        margin:0 !important;
        color:#f6f8ff !important;
        font-size:25px !important;
        line-height:1.15 !important;
        letter-spacing:-.5px !important;
      }
      .ov6-home-sub {
        margin:9px 0 0 !important;
        max-width:330px !important;
        color:#929db1 !important;
        font-size:14px !important;
        line-height:1.5 !important;
      }
      .ov6-prompts {
        display:flex !important;
        flex-wrap:wrap !important;
        justify-content:center !important;
        gap:8px !important;
        max-width:360px !important;
        margin-top:22px !important;
      }
      .ov6-prompt {
        appearance:none !important;
        -webkit-appearance:none !important;
        border:1px solid #273650 !important;
        background:#0d1625 !important;
        color:#dce2ec !important;
        border-radius:999px !important;
        padding:10px 13px !important;
        font-size:11px !important;
        line-height:1.2 !important;
        cursor:pointer !important;
        touch-action:manipulation !important;
      }
      .ov6-prompt.primary { border-color:#7744ff !important; }
      .ov6-prompt:active { transform:scale(.98); }
      .ov6-composer {
        flex:0 0 auto !important;
        display:flex !important;
        align-items:center !important;
        gap:8px !important;
        width:100% !important;
        min-height:58px !important;
        padding:8px !important;
        border:1px solid #293853 !important;
        border-radius:17px !important;
        background:#0c1422 !important;
        box-shadow:0 10px 30px rgba(0,0,0,.35) !important;
      }
      .ov6-input {
        flex:1 !important;
        min-width:0 !important;
        height:42px !important;
        border:0 !important;
        outline:0 !important;
        background:transparent !important;
        color:#fff !important;
        padding:10px 3px !important;
        font-size:14px !important;
      }
      .ov6-input::placeholder { color:#7f8ba0 !important; }
      .ov6-plus,.ov6-send {
        flex:0 0 42px !important;
        width:42px !important;
        height:42px !important;
        min-width:42px !important;
        min-height:42px !important;
        border-radius:13px !important;
        cursor:pointer !important;
        touch-action:manipulation !important;
      }
      .ov6-plus {
        border:1px solid #26364f !important;
        background:#101a2a !important;
        color:#dbe2ef !important;
        font-size:20px !important;
      }
      .ov6-send {
        border:0 !important;
        background:#743cff !important;
        color:#fff !important;
        font-size:17px !important;
      }
      .ov6-disclaimer {
        text-align:center !important;
        color:#68758a !important;
        font-size:9px !important;
        line-height:1.25 !important;
        margin:7px 0 0 !important;
      }
      #${BRIDGE_ID} { display:none !important; }
      @media(max-width:380px){
        .ov6-orbit-mark{width:78px !important;height:78px !important;flex-basis:78px !important;font-size:40px !important;}
        .ov6-home h2{font-size:22px !important;}
        .ov6-prompt{font-size:10px !important;padding:9px 11px !important;}
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

  function bridgeToChat(text) {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    let bridge = document.getElementById(BRIDGE_ID);
    if (!bridge) {
      bridge = document.createElement("button");
      bridge.id = BRIDGE_ID;
      bridge.type = "button";
      bridge.dataset.action = "glueful";
      bridge.textContent = "Open Orbit chat";
      bridge.style.display = "none";
      root.appendChild(bridge);
    }

    bridge.click();

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
    body.classList.add("ov6-home");
    body.innerHTML = `
      <main class="ov6-home-main">
        <div class="ov6-orbit-mark">🪐</div>
        <h2 id="ov6-greeting">Hi there! 👋</h2>
        <p class="ov6-home-sub">How can I help you with your career today?</p>
        <div class="ov6-prompts">
          <button type="button" class="ov6-prompt primary" data-orbit-prompt="Help me prepare for an interview">🎯 Prepare for an interview</button>
          <button type="button" class="ov6-prompt" data-orbit-prompt="Review my resume">📄 Review my resume</button>
          <button type="button" class="ov6-prompt" data-orbit-prompt="How should I answer behavioral questions?">💬 Behavioral questions</button>
          <button type="button" class="ov6-prompt" data-orbit-prompt="Tell me about my current job applications">📋 My applications</button>
        </div>
      </main>
      <form class="ov6-composer" id="ov6-composer">
        <button type="button" class="ov6-plus" aria-label="Focus message">+</button>
        <input class="ov6-input" autocomplete="off" placeholder="Message Orbit AI..." aria-label="Message Orbit AI" />
        <button type="submit" class="ov6-send" aria-label="Send">➤</button>
      </form>
      <div class="ov6-disclaimer">Orbit can make mistakes. Please verify important information.</div>
    `;

    const input = body.querySelector(".ov6-input");
    const form = body.querySelector("#ov6-composer");

    body.querySelector(".ov6-plus")?.addEventListener("click", () => input?.focus());

    body.querySelectorAll("[data-orbit-prompt]").forEach(button => {
      button.addEventListener("click", () => {
        bridgeToChat(button.dataset.orbitPrompt || "");
      });
    });

    form?.addEventListener("submit", event => {
      event.preventDefault();
      const text = String(input?.value || "").trim();
      if (!text) {
        input?.focus();
        return;
      }
      bridgeToChat(text);
    });

    getName().then(name => {
      const greeting = body.querySelector("#ov6-greeting");
      if (greeting) greeting.textContent = `Hi ${name}! 👋`;
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
