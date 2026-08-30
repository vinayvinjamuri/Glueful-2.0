/*
 * Glueful Orbit UI v6 — consistent chat UI + real application prompt.
 *
 * Fixes the visual mismatch between Orbit home and Orbit Chat, and makes the
 * "My applications" quick action use the user's real applications directly.
 *
 * Complexity:
 * - Home/chat decoration: O(1) per DOM mutation.
 * - Application lookup: O(n) for n application rows returned by Supabase.
 * - Application message rendering: O(n) time and O(n) DOM space.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V6__) return;
  window.__GLUEFUL_ORBIT_UI_V6__ = true;

  const ROOT_ID = "glueful-orbit-v2-root";
  const VIEW_ID = "glueful-orbit-v2-view";
  const BRIDGE_ID = "glueful-orbit-v6-open-chat";
  const STYLE_ID = "glueful-orbit-ui-v6-style";
  const APP_PROMPT = "Tell me about my current job applications";

  const esc = value => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* Same composer language on home and chat. */
      .ov5-chat-home .ov5-composer,
      .ov2-chat .ov2-composer {
        display:flex !important;
        align-items:center !important;
        gap:8px !important;
        width:calc(100% - 28px) !important;
        margin:8px 14px 0 !important;
        padding:8px !important;
        min-height:58px !important;
        border:1px solid #293853 !important;
        border-radius:17px !important;
        background:#0c1422 !important;
        box-shadow:0 10px 30px rgba(0,0,0,.35) !important;
      }
      .ov2-chat .ov2-composer {
        flex:0 0 auto !important;
        border-top:1px solid #293853 !important;
        padding-bottom:calc(env(safe-area-inset-bottom) + 8px) !important;
      }
      .ov2-chat .ov2-chat-messages {
        padding-bottom:10px !important;
      }
      .ov6-plus,
      .ov5-plus,
      .ov2-chat .ov6-plus {
        appearance:none !important;
        -webkit-appearance:none !important;
        flex:0 0 42px !important;
        width:42px !important;
        height:42px !important;
        min-width:42px !important;
        min-height:42px !important;
        border:1px solid #26364f !important;
        border-radius:13px !important;
        background:#101a2a !important;
        color:#dbe2ef !important;
        cursor:pointer !important;
      }
      .ov2-chat .ov2-input {
        flex:1 !important;
        min-width:0 !important;
        width:auto !important;
        height:42px !important;
        border:0 !important;
        outline:0 !important;
        background:transparent !important;
        color:#fff !important;
        border-radius:12px !important;
        padding:11px 4px !important;
      }
      .ov2-chat .ov2-send {
        flex:0 0 42px !important;
        width:42px !important;
        height:42px !important;
        border:0 !important;
        border-radius:13px !important;
        background:#743cff !important;
        color:#fff !important;
        cursor:pointer !important;
        font-size:17px !important;
      }
      .ov2-chat .ov2-bubble.user { margin-bottom:8px !important; }
      .ov6-app-list { margin-top:8px; }
      .ov6-app-row {
        display:flex;
        align-items:center;
        gap:9px;
        padding:9px 0;
        border-top:1px solid #1d2a40;
      }
      .ov6-app-row:first-child { border-top:0; }
      .ov6-app-logo {
        width:34px;
        height:34px;
        flex:0 0 34px;
        display:grid;
        place-items:center;
        border-radius:10px;
        background:#17233a;
        color:#a77bff;
        font-size:10px;
        font-weight:800;
      }
      .ov6-app-main { min-width:0; flex:1; }
      .ov6-app-main b { display:block; font-size:12px; }
      .ov6-app-main small { display:block; color:#8e99ad; margin-top:2px; font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .ov6-app-status { font-size:9px; color:#63e2a6; white-space:nowrap; }
    `;
    document.head.appendChild(style);
  }

  function getView() { return document.getElementById(VIEW_ID); }
  function getRoot() { return document.getElementById(ROOT_ID); }
  function getClient() { return window.supabaseClient || window.gluefulSupabaseClient || null; }

  function hiddenChatEntry() {
    const root = getRoot();
    if (!root) return null;
    let button = document.getElementById(BRIDGE_ID);
    if (button && button.parentElement === root) return button;
    button = document.createElement("button");
    button.id = BRIDGE_ID;
    button.type = "button";
    button.dataset.action = "glueful";
    button.textContent = "Open Orbit chat";
    button.style.display = "none";
    root.appendChild(button);
    return button;
  }

  function openChat() {
    const button = hiddenChatEntry();
    if (button) button.click();
  }

  function addChatBubble(role, html) {
    const messages = getView()?.querySelector(".ov2-chat-messages");
    if (!messages) return false;
    const bubble = document.createElement("div");
    bubble.className = `ov2-bubble ${role}`;
    bubble.innerHTML = html;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return true;
  }

  async function showApplications() {
    let attempts = 0;
    const waitForChat = () => {
      const view = getView();
      return view?.querySelector(".ov2-chat-messages") ? true : false;
    };

    while (!waitForChat() && attempts < 40) {
      attempts += 1;
      await new Promise(resolve => window.setTimeout(resolve, 50));
    }
    if (!waitForChat()) return;

    addChatBubble("user", esc(APP_PROMPT));

    const client = getClient();
    let rows = [];
    try {
      const { data: userData } = await client.auth.getUser();
      const userId = userData?.user?.id;
      if (userId && client?.from) {
        const { data, error } = await client
          .from("applications")
          .select("company,role,status,date,captured_at")
          .eq("user_id", userId)
          .order("date", { ascending:false, nullsFirst:false })
          .limit(12);
        if (error) throw error;
        rows = Array.isArray(data) ? data : [];
      }
    } catch (error) {
      console.warn("[Orbit] application quick action failed", error);
    }

    if (!rows.length) {
      addChatBubble("assistant", "I couldn't find any saved job applications yet. Once Glueful captures an application, it will appear here. 📋");
      return;
    }

    const list = rows.map(row => {
      const company = row.company || "Unknown company";
      const role = row.role || "Job application";
      const status = row.status || "Applied";
      const initials = esc(String(company).trim().slice(0, 2).toUpperCase() || "G");
      return `<div class="ov6-app-row"><span class="ov6-app-logo">${initials}</span><span class="ov6-app-main"><b>${esc(company)}</b><small>${esc(role)}</small></span><span class="ov6-app-status">${esc(status)}</span></div>`;
    }).join("");

    addChatBubble("assistant", `<b>Here are your current applications 📋</b><div class="ov6-app-list">${list}</div>`);
  }

  function decorateChatComposer() {
    const form = getView()?.querySelector('.ov2-chat form[data-action="send"]');
    if (!form || form.querySelector(".ov6-plus")) return;
    const input = form.querySelector(".ov2-input");
    if (!input) return;
    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "ov6-plus";
    plus.setAttribute("aria-label", "Focus message");
    plus.textContent = "+";
    plus.addEventListener("click", () => input.focus());
    form.insertBefore(plus, input);
  }

  function wireHome() {
    const view = getView();
    if (!view) return;
    view.querySelectorAll("[data-orbit-prompt]").forEach(button => {
      if (button.dataset.v6Bound === "1") return;
      button.dataset.v6Bound = "1";
      button.addEventListener("click", event => {
        event.preventDefault();
        const text = String(button.dataset.orbitPrompt || "");
        if (text === APP_PROMPT) {
          openChat();
          void showApplications();
          return;
        }
        openChat();
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
      });
    });
  }

  function sync() {
    installStyles();
    wireHome();
    decorateChatComposer();
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
