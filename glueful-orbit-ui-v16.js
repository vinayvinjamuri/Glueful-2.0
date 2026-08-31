/*
 * Glueful Orbit UI v16 — consolidated chat + Android IME runtime.
 *
 * v16 intentionally replaces the older additive keyboard layers. It never
 * reads or writes visualViewport geometry and never positions the composer
 * with keyboard coordinates. The browser owns keyboard resizing through
 * interactive-widget=resizes-content; Orbit is a single fixed flex surface.
 *
 * It also takes ownership of chat form submission so the legacy v2 client
 * cannot send a second request. Conversation state is persisted server-side
 * by the orbit-ai Edge Function and the conversation id is kept per job.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_UI_V16__) return;
  window.__GLUEFUL_ORBIT_UI_V16__ = true;

  const ROOT_ID = "glueful-orbit-v2-root";
  const STYLE_ID = "glueful-orbit-ui-v16-style";
  const CONVERSATION_PREFIX = "glueful_orbit_conversation_v1:";

  const esc = value => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

  function getRoot() { return document.getElementById(ROOT_ID); }
  function getClient() { return window.supabaseClient || window.gluefulSupabaseClient || null; }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width:700px) {
        html:has(#${ROOT_ID}.open), body:has(#${ROOT_ID}.open) {
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
          flex:0 0 auto !important;
          width:100% !important;
          transform:none !important;
        }
        #${ROOT_ID}.open .ov2-chat-messages {
          flex:1 1 0 !important;
          min-height:0 !important;
          height:auto !important;
          max-height:none !important;
          overflow-x:hidden !important;
          overflow-y:auto !important;
          overscroll-behavior:contain !important;
          -webkit-overflow-scrolling:touch !important;
          transform:none !important;
          padding-bottom:14px !important;
        }
        #${ROOT_ID}.open .ov2-chat .ov2-composer {
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
          z-index:3 !important;
        }
        #${ROOT_ID}.open .ov2-chat .ov2-input {
          flex:1 1 auto !important;
          min-width:0 !important;
          width:0 !important;
          min-height:46px !important;
          height:46px !important;
          max-height:46px !important;
          font-size:16px !important;
          transform:none !important;
        }
        #${ROOT_ID}.open .ov2-chat .ov2-send {
          flex:0 0 44px !important;
          width:44px !important;
          height:44px !important;
        }
      }
      #${ROOT_ID} .ov16-thinking {
        background:#0e1726;border:1px solid #1d2b43;border-radius:16px;
        padding:12px;margin:8px 0;color:#dce3ef;font-size:13px;
      }
      #${ROOT_ID} .ov16-error {
        color:#ffb4b4;background:#2a1218;border:1px solid #5b2630;
        border-radius:14px;padding:10px 12px;margin:8px 0;font-size:12px;
      }
      #${ROOT_ID} .ov16-busy { opacity:.7; pointer-events:none; }
    `;
    document.head.appendChild(style);
  }

  function conversationKey(applicationId) {
    return `${CONVERSATION_PREFIX}${applicationId || "general"}`;
  }

  function getStoredConversation(applicationId) {
    try { return localStorage.getItem(conversationKey(applicationId)) || null; }
    catch (_) { return null; }
  }

  function storeConversation(applicationId, id) {
    if (!id) return;
    try { localStorage.setItem(conversationKey(applicationId), id); } catch (_) {}
  }

  function currentApplicationId() {
    const root = getRoot();
    if (!root) return null;
    return root.dataset.orbitApplicationId || null;
  }

  function setApplicationId(id) {
    const root = getRoot();
    if (root) root.dataset.orbitApplicationId = id || "";
  }

  function appendBubble(role, text) {
    const messages = getRoot()?.querySelector(".ov2-chat-messages");
    if (!messages) return null;
    const bubble = document.createElement("div");
    bubble.className = `ov2-bubble ${role === "user" ? "user" : "assistant"}`;
    bubble.textContent = String(text ?? "");
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function appendThinking() {
    const messages = getRoot()?.querySelector(".ov2-chat-messages");
    if (!messages) return null;
    const node = document.createElement("div");
    node.className = "ov16-thinking";
    node.textContent = "Orbit is thinking…";
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
    return node;
  }

  function findInput() { return getRoot()?.querySelector('.ov2-chat form[data-action="send"] .ov2-input'); }
  function findForm() { return getRoot()?.querySelector('.ov2-chat form[data-action="send"]'); }

  async function loadExistingConversation(applicationId) {
    const conversationId = getStoredConversation(applicationId);
    if (!conversationId) return;
    const client = getClient();
    if (!client?.from) return;
    const messages = getRoot()?.querySelector(".ov2-chat-messages");
    if (!messages || messages.dataset.v16Hydrated === "1") return;

    try {
      const { data, error } = await client
        .from("orbit_messages")
        .select("role,content,created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(40);
      if (error) throw error;
      if (!Array.isArray(data) || !data.length) return;
      const seed = messages.querySelector(".ov2-card");
      if (seed) seed.remove();
      for (const row of data) appendBubble(row.role, row.content);
      messages.dataset.v16Hydrated = "1";
    } catch (error) {
      console.warn("[Orbit v16] conversation hydration failed", error);
    }
  }

  async function resolveApplicationFromContext() {
    if (currentApplicationId()) return currentApplicationId();
    const label = getRoot()?.querySelector('.ov2-chat-messages .ov2-label')?.textContent || "";
    const match = label.match(/^(.+?)\s+·\s+(.+)$/);
    if (!match) return null;
    const company = match[1].trim();
    const role = match[2].trim();
    const client = getClient();
    if (!client?.auth?.getUser || !client?.from) return null;
    try {
      const { data: userData } = await client.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return null;
      const { data } = await client
        .from("applications")
        .select("id")
        .eq("user_id", userId)
        .eq("company", company)
        .eq("role", role)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.id) setApplicationId(data.id);
      return data?.id || null;
    } catch (_) { return null; }
  }

  async function ask(message) {
    const clean = String(message || "").trim();
    if (!clean) return;
    const form = findForm();
    if (!form || form.dataset.v16Busy === "1") return;

    form.dataset.v16Busy = "1";
    form.classList.add("ov16-busy");
    const input = findInput();
    if (input) input.value = "";

    const applicationId = await resolveApplicationFromContext();
    const conversationId = getStoredConversation(applicationId);
    appendBubble("user", clean);
    const thinking = appendThinking();

    try {
      const client = getClient();
      if (!client?.functions?.invoke) throw new Error("Supabase client unavailable");
      const { data, error } = await client.functions.invoke("orbit-ai", {
        body: {
          message: clean,
          application_id: applicationId,
          conversation_id: conversationId
        }
      });
      if (error) throw error;
      thinking?.remove();
      if (!data?.ok) throw new Error(data?.error || "Orbit request failed");
      appendBubble("assistant", data.answer || "Orbit couldn't form an answer this time.");
      if (data.conversation_id) storeConversation(applicationId, data.conversation_id);
    } catch (error) {
      thinking?.remove();
      appendBubble("assistant", "I hit a temporary problem reaching Orbit. Please try again in a moment.");
      console.warn("[Orbit v16] request failed", error);
    } finally {
      form.dataset.v16Busy = "0";
      form.classList.remove("ov16-busy");
      if (input) input.focus({ preventScroll: true });
    }
  }

  function handleClick(event) {
    const button = event.target.closest?.('[data-action="select-job"]');
    if (!button) return;
    const id = button.getAttribute("data-job-id");
    if (!id) return;
    setApplicationId(id);
    try { localStorage.removeItem(conversationKey(id)); } catch (_) {}
  }

  function handleSubmit(event) {
    const form = event.target.closest?.('form[data-action="send"]');
    if (!form) return;
    // Capture-phase ownership prevents legacy Orbit v2 from issuing a second request.
    event.preventDefault();
    event.stopImmediatePropagation();
    const input = form.elements.message;
    void ask(input?.value || "");
  }

  function observeChat() {
    const root = getRoot();
    if (!root || root.dataset.v16Bound === "1") return;
    root.dataset.v16Bound = "1";
    root.addEventListener("click", handleClick, true);
    root.addEventListener("submit", handleSubmit, true);

    const observer = new MutationObserver(() => {
      const app = root.querySelector(".ov2-chat");
      if (!app) return;
      const applicationId = currentApplicationId();
      void loadExistingConversation(applicationId);
    });
    observer.observe(root, { childList: true, subtree: true });
    void loadExistingConversation(currentApplicationId());
  }

  function start() {
    installStyles();
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const content = viewport.getAttribute("content") || "";
      if (!/interactive-widget\s*=/i.test(content)) {
        viewport.setAttribute("content", `${content}, interactive-widget=resizes-content`);
      }
    }
    observeChat();

    const pageObserver = new MutationObserver(observeChat);
    pageObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
