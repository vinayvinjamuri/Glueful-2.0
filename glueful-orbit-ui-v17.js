/* Glueful Orbit UI v17 — smooth chat surface, mobile IME polish, composer behavior. */
(function () {
  "use strict";
  if (window.__GLUEFUL_ORBIT_UI_V17__) return;
  window.__GLUEFUL_ORBIT_UI_V17__ = true;
  const ROOT = "#glueful-orbit-v2-root";
  const STYLE = "glueful-orbit-ui-v17-style";

  function install() {
    if (document.getElementById(STYLE)) return;
    const s = document.createElement("style");
    s.id = STYLE;
    s.textContent = `
      ${ROOT}.open { isolation:isolate; }
      ${ROOT}.open .ov2-app { background:var(--orbit-bg,#08101c); color:var(--orbit-text,#edf3fb); }
      ${ROOT}.open .ov2-head { min-height:58px; display:flex; align-items:center; padding:0 14px; box-sizing:border-box; border-bottom:1px solid rgba(255,255,255,.07); background:rgba(8,16,28,.94); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); }
      ${ROOT}.open .ov2-title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:750; letter-spacing:-.01em; }
      ${ROOT}.open .ov2-icon { width:38px; height:38px; border:0; border-radius:50%; background:transparent; color:inherit; font-size:24px; display:grid; place-items:center; cursor:pointer; }
      ${ROOT}.open .ov2-icon:active { background:rgba(255,255,255,.08); transform:scale(.96); }
      ${ROOT}.open .ov2-chat-messages { scroll-behavior:smooth; scrollbar-width:thin; overscroll-behavior-y:contain; }
      ${ROOT}.open .ov2-chat-messages > * { animation:orbitIn .16s ease-out both; }
      ${ROOT}.open .ov2-bubble { max-width:min(82%,720px); white-space:pre-wrap; overflow-wrap:anywhere; line-height:1.52; }
      ${ROOT}.open .ov2-bubble.assistant { align-self:flex-start; }
      ${ROOT}.open .ov2-bubble.user { align-self:flex-end; }
      ${ROOT}.open .ov2-composer { display:flex; align-items:flex-end; gap:8px; padding:10px 12px max(10px,env(safe-area-inset-bottom)); background:linear-gradient(180deg,rgba(8,16,28,.55),rgba(8,16,28,.98)); border-top:1px solid rgba(255,255,255,.07); }
      ${ROOT}.open .ov2-input { border:1px solid rgba(255,255,255,.13); background:#111c2b; color:#f4f7fb; border-radius:22px; outline:none; padding:12px 15px; line-height:21px; box-sizing:border-box; transition:border-color .15s,box-shadow .15s; }
      ${ROOT}.open .ov2-input::placeholder { color:#8190a4; }
      ${ROOT}.open .ov2-input:focus { border-color:rgba(120,170,255,.65); box-shadow:0 0 0 3px rgba(90,140,220,.12); }
      ${ROOT}.open .ov2-send { border:0; border-radius:50%; background:#f2f5f8; color:#0a1220; display:grid; place-items:center; cursor:pointer; font-size:18px; transition:transform .12s,opacity .12s; }
      ${ROOT}.open .ov2-send:active { transform:scale(.92); }
      ${ROOT}.open .ov2-send:disabled { opacity:.45; }
      ${ROOT}.open .ov16-thinking { align-self:flex-start; display:flex; align-items:center; gap:5px; border:0; background:transparent; padding:10px 4px; margin:0; color:#9aa9bb; }
      ${ROOT}.open .ov16-thinking::after { content:""; width:4px; height:4px; border-radius:50%; background:currentColor; box-shadow:8px 0 currentColor,16px 0 currentColor; animation:orbitDots 1.05s infinite ease-in-out; }
      @keyframes orbitDots { 0%,100%{opacity:.25;transform:translateY(0)} 45%{opacity:1;transform:translateY(-2px)} }
      @keyframes orbitIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
      @media (max-width:700px) {
        ${ROOT}.open .ov2-app { height:100%; min-height:0; }
        ${ROOT}.open .ov2-chat-messages { padding:14px 12px 18px !important; }
        ${ROOT}.open .ov2-composer { min-height:74px !important; }
        ${ROOT}.open .ov2-input { font-size:16px !important; }
      }
      @media (prefers-reduced-motion:reduce) {
        ${ROOT}.open .ov2-chat-messages > *,${ROOT}.open .ov16-thinking::after { animation:none !important; }
        ${ROOT}.open .ov2-chat-messages { scroll-behavior:auto; }
      }
    `;
    document.head.appendChild(s);
  }

  function resizeComposer(input) {
    if (!input || input.tagName !== "TEXTAREA") return;
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 128) + "px";
    input.style.overflowY = input.scrollHeight > 128 ? "auto" : "hidden";
  }

  function bind(root) {
    if (!root || root.dataset.v17Bound === "1") return;
    root.dataset.v17Bound = "1";
    root.addEventListener("input", e => {
      const input = e.target.closest?.(".ov2-input");
      if (!input) return;
      resizeComposer(input);
      const form = input.closest("form");
      const send = form?.querySelector(".ov2-send");
      if (send) send.disabled = !input.value.trim();
    }, true);
    root.addEventListener("keydown", e => {
      const input = e.target.closest?.(".ov2-input");
      if (!input) return;
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        const form = input.closest("form");
        if (form && input.value.trim()) form.requestSubmit();
      }
    }, true);
    root.addEventListener("focusin", e => {
      const input = e.target.closest?.(".ov2-input");
      if (!input) return;
      requestAnimationFrame(() => resizeComposer(input));
    }, true);
  }

  function start() {
    install();
    const root = document.getElementById("glueful-orbit-v2-root");
    bind(root);
    const observer = new MutationObserver(() => bind(root));
    if (root) observer.observe(root, {childList:true, subtree:true});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once:true});
  else start();
})();
