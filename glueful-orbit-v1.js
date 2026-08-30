/*
 * Glueful Orbit AI v1
 *
 * UI-only first slice for the Orbit experience:
 * Dashboard -> Orbit -> job selection -> analysis -> topics -> chat -> share/save.
 *
 * Complexity notes:
 * - Rendering the Orbit shell is O(1) DOM work.
 * - Rendering recent jobs is O(n), where n is the number of jobs shown.
 * - Rendering chat history is O(m), where m is the number of messages in the chat.
 * - Chat request latency is dominated by the network/LLM call; local preparation is O(m).
 * - Memory is O(m + n) for the visible conversation and job list.
 */
(function () {
  "use strict";

  const STYLE_ID = "glueful-orbit-style-v1";
  const ROOT_ID = "glueful-orbit-root";
  const VIEW_ID = "glueful-orbit-view";
  const MAX_HISTORY = 30;

  const fallbackJobs = [
    {
      id: "qualcomm",
      company: "Qualcomm",
      role: "Thermal Software Engineer",
      status: "In Progress",
      appliedAt: "18 Aug 2026",
      description: "Thermal management, limits management, DVFS, power management, embedded Linux, thermal framework, C/C++."
    },
    {
      id: "tcs",
      company: "TCS",
      role: "Embedded Software Engineer",
      status: "Applied",
      appliedAt: "16 Aug 2026",
      description: "Embedded C/C++, microcontrollers, RTOS, debugging and low-level software development."
    },
    {
      id: "bosch",
      company: "Bosch",
      role: "Software Developer",
      status: "Saved",
      appliedAt: "14 Aug 2026",
      description: "Software development, C/C++, debugging, testing and automotive systems."
    },
    {
      id: "amd",
      company: "AMD",
      role: "System Software Engineer",
      status: "Applied",
      appliedAt: "12 Aug 2026",
      description: "System software, operating systems, C/C++, performance and low-level programming."
    }
  ];

  const state = {
    screen: "home",
    job: null,
    jobs: [],
    messages: [],
    thinking: false,
    analysisTimer: null
  };

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} { display:none; }
      #${ROOT_ID}.open {
        display:block;
        position:fixed;
        inset:0;
        z-index:2147483000;
        background:#060912;
        color:#f6f7ff;
        font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }
      #${ROOT_ID} * { box-sizing:border-box; }
      #${ROOT_ID} button, #${ROOT_ID} input { font:inherit; }
      .orbit-app { height:100dvh; display:flex; flex-direction:column; background:
        radial-gradient(circle at 50% 18%, rgba(116,67,255,.14), transparent 28%), #060912; }
      .orbit-header { display:flex; align-items:center; justify-content:space-between; padding:calc(env(safe-area-inset-top) + 14px) 18px 12px; }
      .orbit-title { font-size:19px; font-weight:800; letter-spacing:-.4px; }
      .orbit-title span { color:#9b62ff; }
      .orbit-icon-btn { width:40px; height:40px; border:1px solid rgba(151,107,255,.5); border-radius:12px; background:#0d1220; color:#fff; display:grid; place-items:center; cursor:pointer; }
      .orbit-body { flex:1; min-height:0; overflow:auto; padding:8px 16px 18px; scrollbar-width:none; }
      .orbit-body::-webkit-scrollbar { display:none; }
      .orbit-card { background:linear-gradient(145deg,#10182a,#0b111d); border:1px solid #1d2940; border-radius:18px; padding:16px; margin-bottom:12px; box-shadow:0 10px 30px rgba(0,0,0,.2); }
      .orbit-hero { text-align:center; padding:20px 14px 18px; }
      .orbit-robot { width:118px; height:118px; margin:2px auto 10px; border-radius:38px; display:grid; place-items:center; font-size:62px; background:radial-gradient(circle,#5f32ff,#151229 62%); box-shadow:0 0 38px rgba(126,72,255,.35); }
      .orbit-sub { color:#8f9ab0; font-size:12px; line-height:1.45; }
      .orbit-action { width:100%; text-align:left; border:1px solid #283650; background:#0d1625; color:#fff; border-radius:15px; padding:14px; margin-top:10px; cursor:pointer; }
      .orbit-action.primary { border-color:#7c45ff; box-shadow:0 0 0 1px rgba(124,69,255,.2) inset; }
      .orbit-action strong { display:block; font-size:14px; margin-bottom:4px; }
      .orbit-action small { color:#8f9ab0; }
      .orbit-section-title { margin:18px 2px 9px; font-size:12px; text-transform:uppercase; letter-spacing:1.4px; color:#7f8ba3; }
      .orbit-job { display:flex; align-items:center; gap:11px; padding:12px; border:1px solid #1f2a40; background:#0c1320; border-radius:15px; margin-bottom:9px; cursor:pointer; }
      .orbit-job-logo { width:40px; height:40px; border-radius:12px; display:grid; place-items:center; background:#14213a; font-weight:800; color:#a982ff; }
      .orbit-job-main { min-width:0; flex:1; }
      .orbit-job-main b { display:block; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .orbit-job-main small { display:block; color:#8b96aa; margin-top:3px; font-size:11px; }
      .orbit-pill { border-radius:999px; padding:5px 8px; font-size:9px; background:#183e31; color:#65e7ae; }
      .orbit-thinking { padding:18px; text-align:left; }
      .orbit-thinking h3 { margin:0 0 13px; font-size:16px; }
      .orbit-step { display:flex; gap:10px; align-items:center; padding:7px 0; color:#aeb7c8; font-size:12px; }
      .orbit-step.done { color:#fff; }
      .orbit-check { width:19px; height:19px; border-radius:50%; display:grid; place-items:center; background:#113d31; color:#62e6ad; font-size:11px; }
      .orbit-ring { width:19px; height:19px; border:2px solid #6f43ff; border-top-color:transparent; border-radius:50%; animation:orbitSpin .8s linear infinite; }
      @keyframes orbitSpin { to { transform:rotate(360deg); } }
      .orbit-tabs { display:flex; gap:5px; overflow:auto; margin-bottom:11px; }
      .orbit-tab { border:1px solid #26334d; background:#0b1220; color:#8e99ac; border-radius:10px; padding:8px 11px; white-space:nowrap; cursor:pointer; font-size:11px; }
      .orbit-tab.active { color:#fff; background:#6d38ef; border-color:#8b5bff; }
      .orbit-priority { padding:14px; border:1px solid #24324b; border-radius:15px; background:#0d1524; margin-bottom:9px; }
      .orbit-priority h4 { margin:0 0 8px; font-size:12px; }
      .orbit-priority ul { margin:0; padding-left:18px; color:#aeb7c8; font-size:11px; line-height:1.8; }
      .orbit-chat { display:flex; flex-direction:column; height:100%; }
      .orbit-chat-messages { flex:1; min-height:0; overflow:auto; padding:8px 16px 12px; scrollbar-width:none; }
      .orbit-chat-messages::-webkit-scrollbar { display:none; }
      .orbit-bubble { max-width:88%; padding:12px 13px; border-radius:16px; margin:7px 0; font-size:13px; line-height:1.5; white-space:pre-wrap; }
      .orbit-bubble.user { margin-left:auto; background:linear-gradient(135deg,#7136e8,#5b39e7); }
      .orbit-bubble.assistant { background:#0e1726; border:1px solid #1d2b43; }
      .orbit-thinking-box { background:#0e1726; border:1px solid #1d2b43; border-radius:16px; padding:14px; margin:7px 0; }
      .orbit-thinking-box b { font-size:13px; }
      .orbit-thinking-line { color:#8f9ab0; font-size:11px; margin-top:7px; }
      .orbit-dots { display:inline-flex; gap:4px; margin-left:7px; }
      .orbit-dots i { width:5px; height:5px; border-radius:50%; background:#8d56ff; animation:orbitDot 1s infinite ease-in-out; }
      .orbit-dots i:nth-child(2){animation-delay:.15s}.orbit-dots i:nth-child(3){animation-delay:.3s}
      @keyframes orbitDot { 0%,80%,100%{opacity:.2;transform:scale(.7)}40%{opacity:1;transform:scale(1)} }
      .orbit-composer { display:flex; gap:8px; padding:10px 14px calc(env(safe-area-inset-bottom) + 10px); border-top:1px solid #192337; background:#080d17; }
      .orbit-input { flex:1; min-width:0; border:1px solid #26334c; background:#0d1522; color:#fff; border-radius:14px; padding:11px 12px; outline:none; }
      .orbit-send { width:44px; border:0; border-radius:13px; background:#743bff; color:#fff; cursor:pointer; }
      .orbit-share-sheet { position:absolute; inset:auto 12px calc(env(safe-area-inset-bottom) + 12px); background:#101827; border:1px solid #293750; border-radius:18px; padding:13px; box-shadow:0 20px 60px rgba(0,0,0,.55); }
      .orbit-share-sheet button { width:100%; text-align:left; border:0; background:transparent; color:#fff; padding:12px 8px; border-radius:10px; cursor:pointer; }
      .orbit-share-sheet button:hover { background:#172236; }
      .orbit-back-row { display:flex; align-items:center; gap:10px; }
      .orbit-back-row h2 { margin:0; font-size:17px; }
      .orbit-link { color:#9e72ff; text-decoration:none; }
      .orbit-bottom-fallback { position:fixed; left:12px; right:12px; bottom:calc(env(safe-area-inset-bottom) + 10px); display:none; }
      @media (min-width:701px) { #${ROOT_ID} { inset:auto; left:auto; top:50%; transform:translateY(-50%); width:430px; height:760px; right:22px; border:1px solid #293750; border-radius:24px; overflow:hidden; box-shadow:0 30px 100px rgba(0,0,0,.55); } }
    `;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.innerHTML = `<div id="${VIEW_ID}"></div>`;
    document.body.appendChild(root);
    return root;
  }

  function logoFor(company) {
    return String(company || "G").slice(0, 1).toUpperCase();
  }

  function discoverJobs() {
    // Try to reuse visible dashboard application cards when available.
    const found = [];
    const dashboard = document.getElementById("view-dashboard");
    if (dashboard) {
      dashboard.querySelectorAll("[data-company], .application-card, .job-application-card").forEach((el) => {
        const company = el.getAttribute("data-company") || el.querySelector(".company-name,.company,.application-company")?.textContent?.trim();
        const role = el.getAttribute("data-role") || el.querySelector(".job-title,.role,.application-role")?.textContent?.trim();
        if (company && role) found.push({ id:`dom-${found.length}`, company, role, status:"Applied", appliedAt:"", description:"" });
      });
    }
    state.jobs = found.length ? found.slice(0, 8) : fallbackJobs.slice();
  }

  function openOrbit() {
    installStyles();
    const root = ensureRoot();
    discoverJobs();
    root.classList.add("open");
    state.screen = "home";
    state.job = null;
    render();
  }

  function closeOrbit() {
    const root = document.getElementById(ROOT_ID);
    if (root) root.classList.remove("open");
    if (state.analysisTimer) clearTimeout(state.analysisTimer);
  }

  function renderHeader(title, back = true, share = false) {
    return `<header class="orbit-header">
      <div class="orbit-back-row">
        ${back ? `<button class="orbit-icon-btn" data-action="back" aria-label="Back">‹</button>` : ""}
        <div class="orbit-title">${esc(title)}</div>
      </div>
      <div style="display:flex;gap:7px">
        ${share ? `<button class="orbit-icon-btn" data-action="share" aria-label="Share">↗</button>` : ""}
        <button class="orbit-icon-btn" data-action="close" aria-label="Close">×</button>
      </div>
    </header>`;
  }

  function renderHome() {
    return `<div class="orbit-app">
      ${renderHeader("Orbit AI", false)}
      <main class="orbit-body">
        <section class="orbit-card orbit-hero">
          <div class="orbit-robot">🤖</div>
          <h2 style="margin:5px 0 5px;font-size:20px">Your career copilot.</h2>
          <p class="orbit-sub">Always here to help you prepare smarter, not harder.</p>
        </section>
        <section class="orbit-card">
          <button class="orbit-action primary" data-action="prepare"><strong>🎯 Prepare for a Job</strong><small>Pick an application and I'll build topics, resources, a study plan and interview Q&A.</small></button>
          <button class="orbit-action" data-action="glueful"><strong>💬 Ask Orbit about Glueful</strong><small>Features, integrations, Gmail, applications and how everything works.</small></button>
        </section>
        <div class="orbit-section-title">Recent applications</div>
        ${state.jobs.slice(0,4).map(jobCard).join("")}
        <section class="orbit-card" style="margin-top:12px">
          <div style="font-size:12px;color:#8f9ab0;margin-bottom:8px">Quick ask</div>
          <form data-action="quick-chat" style="display:flex;gap:8px"><input class="orbit-input" name="message" placeholder="Ask Orbit anything…"><button class="orbit-send" type="submit">➤</button></form>
        </section>
      </main>
    </div>`;
  }

  function jobCard(job) {
    return `<button class="orbit-job" data-action="select-job" data-job-id="${esc(job.id)}">
      <span class="orbit-job-logo">${esc(logoFor(job.company))}</span>
      <span class="orbit-job-main"><b>${esc(job.company)}</b><small>${esc(job.role)}</small></span>
      <span class="orbit-pill">${esc(job.status || "Applied")}</span>
    </button>`;
  }

  function renderPrepare() {
    return `<div class="orbit-app">
      ${renderHeader("Prepare for a Job")}
      <main class="orbit-body">
        <section class="orbit-card"><p style="margin:0;font-size:13px;line-height:1.5">Great! Let's get you ready 🚀<br><span class="orbit-sub">Select a recent application to start preparing.</span></p></section>
        <div class="orbit-section-title">Your recent applications</div>
        ${state.jobs.map(jobCard).join("")}
        <button class="orbit-action" data-action="manual-job"><strong>＋ Add manually</strong><small>Prepare for a role that isn't in your applications yet.</small></button>
      </main>
    </div>`;
  }

  function renderAnalysis() {
    const job = state.job || fallbackJobs[0];
    return `<div class="orbit-app">
      ${renderHeader(job.company)}
      <main class="orbit-body">
        <section class="orbit-card orbit-thinking">
          <h3>🚀 Orbit is thinking<span class="orbit-dots"><i></i><i></i><i></i></span></h3>
          <div class="orbit-step done"><span class="orbit-check">✓</span> Reading job description</div>
          <div class="orbit-step done"><span class="orbit-check">✓</span> Extracting key skills</div>
          <div class="orbit-step done"><span class="orbit-check">✓</span> Identifying important topics</div>
          <div class="orbit-step done"><span class="orbit-check">✓</span> Matching with your profile</div>
          <div class="orbit-step"><span class="orbit-ring"></span> Creating personalized plan</div>
        </section>
      </main>
    </div>`;
  }

  function renderTopics() {
    const job = state.job || fallbackJobs[0];
    const isThermal = /thermal/i.test(`${job.role} ${job.description}`);
    const high = isThermal ? ["Thermal Management", "DVFS (Dynamic Voltage & Frequency Scaling)", "Power Management", "Embedded Linux / Thermal Framework"] : ["Role fundamentals", "C/C++", "Operating systems", "Debugging & performance tuning"];
    const medium = isThermal ? ["C / C++", "Multithreading", "Debugging & Performance Tuning", "Linux Device Drivers"] : ["Data structures & algorithms", "Multithreading", "Testing", "System design basics"];
    return `<div class="orbit-app">
      ${renderHeader(`${job.company} · ${job.role}`, true, true)}
      <main class="orbit-body">
        <div class="orbit-tabs"><button class="orbit-tab active">Overview</button><button class="orbit-tab">Topics</button><button class="orbit-tab">Resources</button><button class="orbit-tab">Plan</button></div>
        <section class="orbit-card"><h3 style="margin:0 0 12px;font-size:14px">🔥 High Priority Topics <span style="float:right;color:#ff8f8f;font-size:10px">HIGH</span></h3><ul style="margin:0;padding-left:19px;line-height:1.9;font-size:12px">${high.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>
        <section class="orbit-priority"><h4>🟡 Medium Priority Topics <span style="float:right;color:#f5bd65">MEDIUM</span></h4><ul>${medium.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>
        <section class="orbit-priority"><h4>🟢 Low Priority Topics <span style="float:right;color:#63e2a5">LOW</span></h4><ul><li>Company-specific background</li><li>Behavioral preparation</li></ul></section>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px"><button class="orbit-action primary" data-action="plan" style="text-align:center;margin:0">📚 Study Plan</button><button class="orbit-action" data-action="chat" style="text-align:center;margin:0">❓ Interview Qs</button></div>
      </main>
    </div>`;
  }

  function renderChat() {
    const job = state.job;
    const messages = state.messages.map((m) => `<div class="orbit-bubble ${m.role === "user" ? "user" : "assistant"}">${esc(m.content)}</div>`).join("");
    const thinking = state.thinking ? `<div class="orbit-thinking-box"><b>🚀 Orbit is thinking…</b><div class="orbit-thinking-line">Understanding → Finding → Preparing</div><div style="margin-top:7px"><span class="orbit-dots"><i></i><i></i><i></i></span></div></div>` : "";
    return `<div class="orbit-app orbit-chat">
      ${renderHeader("Orbit Chat", true, true)}
      <div class="orbit-chat-messages" id="orbit-chat-messages">
        ${job ? `<div class="orbit-section-title" style="margin-top:4px">${esc(job.company)} · ${esc(job.role)}</div>` : ""}
        ${messages || `<div class="orbit-card"><b>Hey! 👋</b><p class="orbit-sub">Ask me about this job, what to study, interview questions, resources, or anything about Glueful.</p></div>`}
        ${thinking}
      </div>
      <form class="orbit-composer" data-action="send-chat"><input class="orbit-input" name="message" autocomplete="off" placeholder="Ask Orbit anything…"><button class="orbit-send" type="submit">➤</button></form>
    </div>`;
  }

  function render() {
    const view = document.getElementById(VIEW_ID);
    if (!view) return;
    if (state.screen === "home") view.innerHTML = renderHome();
    else if (state.screen === "prepare") view.innerHTML = renderPrepare();
    else if (state.screen === "analysis") view.innerHTML = renderAnalysis();
    else if (state.screen === "topics") view.innerHTML = renderTopics();
    else if (state.screen === "chat") view.innerHTML = renderChat();
    if (state.screen === "chat") requestAnimationFrame(() => { const el=document.getElementById("orbit-chat-messages"); if(el) el.scrollTop=el.scrollHeight; });
  }

  function selectJob(id) {
    state.job = state.jobs.find((job) => String(job.id) === String(id)) || fallbackJobs[0];
    state.screen = "analysis";
    render();
    if (state.analysisTimer) clearTimeout(state.analysisTimer);
    state.analysisTimer = setTimeout(() => { state.screen = "topics"; render(); }, 1600);
  }

  function fallbackAnswer(message) {
    const q = message.toLowerCase();
    const job = state.job;
    if (/processing time|how long|timeline/.test(q)) {
      return "The exact processing time isn't guaranteed unless the company has stated one. Usually, application review can take a few days to a few weeks depending on the company and hiring volume. If you share the job status or recruiter message, I can help interpret it. 😊";
    }
    if (/gmail integration|gmail/.test(q)) {
      return "Gmail integration lets Glueful check connected Gmail accounts for relevant application emails. You can sync an account, disconnect it, or add another Gmail account from the integration screen. 📬";
    }
    if (/fuck|shit|idiot|stupid/.test(q)) {
      return "Hmm, it's not technically possible 😅 — but no worries. I'm still here. Tell me what went wrong and let's fix it together. 🚀";
    }
    if (/what.*study|study|prepare|plan/.test(q) && job) {
      return `For ${job.role} at ${job.company}, I'd start with the high-priority topics shown above, then build a daily plan around them. If you tell me how many days you have, I'll turn it into a day-by-day schedule.`;
    }
    if (/resource|course|learn/.test(q)) {
      return "I can give you a focused resource list: official documentation first, then a strong course or lecture series, followed by practice questions. Tell me the topic and your deadline and I'll keep it targeted. 📚";
    }
    return "I'm Orbit 🚀 — your Glueful career copilot. I can help with job preparation, study plans, interview questions, resources, application timelines, and Glueful features. Ask me something specific and I'll jump in.";
  }

  async function askOrbit(message) {
    const clean = String(message || "").trim();
    if (!clean || state.thinking) return;
    state.messages.push({ role:"user", content:clean });
    state.messages = state.messages.slice(-MAX_HISTORY);
    state.thinking = true;
    render();

    let answer = "";
    try {
      if (window.supabaseClient?.functions?.invoke) {
        const { data, error } = await window.supabaseClient.functions.invoke("orbit-ai", {
          body: {
            message: clean,
            job: state.job,
            history: state.messages.slice(-12)
          }
        });
        if (!error && data?.answer) answer = data.answer;
      }
    } catch (error) {
      console.warn("[Orbit] AI request failed; using local fallback.", error);
    }

    answer = answer || fallbackAnswer(clean);
    state.messages.push({ role:"assistant", content:answer });
    state.thinking = false;
    render();
  }

  function chatText() {
    const title = state.job ? `${state.job.company} — ${state.job.role}` : "Orbit Chat";
    return [title, "", ...state.messages.map(m => `${m.role === "user" ? "You" : "Orbit"}: ${m.content}`)].join("\n");
  }

  function saveChat() {
    const blob = new Blob([chatText()], { type:"text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orbit-chat-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function shareChat() {
    const text = chatText();
    if (navigator.share) {
      try { await navigator.share({ title:"Orbit Chat", text }); return; } catch (_) {}
    }
    const existing = document.querySelector(".orbit-share-sheet");
    if (existing) { existing.remove(); return; }
    const sheet = document.createElement("div");
    sheet.className = "orbit-share-sheet";
    const encoded = encodeURIComponent(text.slice(0, 3500));
    sheet.innerHTML = `<div style="font-size:12px;color:#8f9ab0;padding:5px 8px 8px">Share this chat</div>
      <button data-share="whatsapp">🟢 WhatsApp</button>
      <button data-share="gmail">✉️ Gmail</button>
      <button data-share="copy">📋 Copy as Text</button>
      <button data-share="save">💾 Save chat to device</button>`;
    document.getElementById(ROOT_ID)?.appendChild(sheet);
    sheet.addEventListener("click", async (event) => {
      const action = event.target.closest("[data-share]")?.dataset.share;
      if (!action) return;
      if (action === "whatsapp") window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener");
      if (action === "gmail") window.open(`mailto:?subject=${encodeURIComponent("Orbit Chat")}&body=${encoded}`, "_self");
      if (action === "copy") await navigator.clipboard?.writeText(text);
      if (action === "save") saveChat();
      sheet.remove();
    });
  }

  function bindRoot() {
    const root = ensureRoot();
    root.addEventListener("click", (event) => {
      const actionEl = event.target.closest("[data-action]");
      if (!actionEl) return;
      const action = actionEl.dataset.action;
      if (action === "close") closeOrbit();
      else if (action === "back") { state.screen = state.screen === "chat" ? "topics" : state.screen === "topics" ? "prepare" : "home"; render(); }
      else if (action === "prepare") { state.screen="prepare"; render(); }
      else if (action === "glueful") { state.job=null; state.messages=[]; state.screen="chat"; render(); }
      else if (action === "select-job") selectJob(actionEl.dataset.jobId);
      else if (action === "chat" || action === "plan") { state.screen="chat"; if (!state.messages.length && state.job) state.messages.push({role:"assistant",content:`I’ve mapped ${state.job.role} at ${state.job.company}. Ask me for a study plan, resources, interview questions, or what to prioritize first.`}); render(); }
      else if (action === "share") shareChat();
      else if (action === "quick-chat") { event.preventDefault(); }
    });
    root.addEventListener("submit", (event) => {
      const form = event.target.closest("form[data-action]");
      if (!form) return;
      event.preventDefault();
      const message = form.elements.message?.value || "";
      form.reset();
      if (form.dataset.action === "quick-chat") { state.screen="chat"; state.job=null; state.messages=[]; render(); setTimeout(()=>askOrbit(message), 0); }
      else if (form.dataset.action === "send-chat") askOrbit(message);
    });
  }

  function findBottomNav() {
    const candidates = Array.from(document.querySelectorAll("nav, [class*='bottom'], [class*='navigation'], [class*='nav']"));
    return candidates.find((el) => {
      const text = (el.textContent || "").toLowerCase();
      return text.includes("dashboard") && text.includes("jobs");
    }) || null;
  }

  function injectNav() {
    const nav = findBottomNav();
    if (!nav || nav.querySelector("[data-glueful-orbit-nav]")) return !!nav;
    const item = document.createElement("button");
    item.type = "button";
    item.dataset.gluefulOrbitNav = "true";
    item.innerHTML = `<span style="font-size:18px;line-height:1">✦</span><span style="font-size:10px">Orbit</span>`;
    item.style.cssText = "flex:1;min-width:0;border:0;background:transparent;color:#8e99ad;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 2px;cursor:pointer;";
    item.addEventListener("click", openOrbit);
    nav.appendChild(item);
    return true;
  }

  function start() {
    installStyles();
    ensureRoot();
    bindRoot();
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (injectNav() || attempts >= 20) clearInterval(timer);
    }, 500);
    // Also expose a tiny debug hook for the prototype.
    window.openGluefulOrbit = openOrbit;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
