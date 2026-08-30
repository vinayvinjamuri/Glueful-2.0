/*
 * Glueful Orbit AI v2
 *
 * Real-data runtime for:
 * Dashboard -> Orbit -> user applications -> job context -> thinking -> chat -> share/save.
 *
 * Complexity:
 * - Fetch applications: O(n) returned rows; memory O(n).
 * - Render application list: O(n) time and O(n) DOM memory.
 * - Render chat history: O(m) time and O(m) memory for m visible messages.
 * - AI request preparation: O(min(m, 12)) time and O(m) request memory.
 * - Network/LLM latency is external and dominates response time.
 * - Chat is session-local only; no conversation persistence is performed by this client.
 */
(function () {
  "use strict";

  const STYLE_ID = "glueful-orbit-v2-style";
  const ROOT_ID = "glueful-orbit-v2-root";
  const VIEW_ID = "glueful-orbit-v2-view";
  const MAX_HISTORY = 30;

  const state = {
    screen: "home",
    jobs: [],
    job: null,
    messages: [],
    thinking: false,
    shareOpen: false,
    requestSerial: 0
  };

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}{display:none}
      #${ROOT_ID}.open{position:fixed;inset:0;z-index:2147483000;display:block;background:#060912;color:#f5f7ff}
      #${ROOT_ID} *{box-sizing:border-box}
      #${ROOT_ID} button,#${ROOT_ID} input,#${ROOT_ID} textarea{font:inherit}
      .ov2-app{height:100dvh;display:flex;flex-direction:column;background:radial-gradient(circle at 50% 12%,rgba(118,63,255,.16),transparent 30%),#060912;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .ov2-head{display:flex;align-items:center;justify-content:space-between;padding:calc(env(safe-area-inset-top) + 13px) 16px 10px;border-bottom:1px solid #151f32}
      .ov2-head-left{display:flex;align-items:center;gap:10px;min-width:0}
      .ov2-icon{width:40px;height:40px;border:1px solid #2a3853;border-radius:12px;background:#0d1422;color:#fff;display:grid;place-items:center;cursor:pointer}
      .ov2-title{font-weight:800;font-size:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ov2-title span{color:#9c61ff}
      .ov2-body{flex:1;min-height:0;overflow:auto;padding:14px 15px calc(env(safe-area-inset-bottom) + 18px);scrollbar-width:none}
      .ov2-body::-webkit-scrollbar{display:none}
      .ov2-card{background:linear-gradient(145deg,#10192a,#0b111d);border:1px solid #1c2940;border-radius:18px;padding:15px;margin-bottom:11px}
      .ov2-hero{text-align:center;padding:20px 14px 17px}
      .ov2-orbit{width:112px;height:112px;border-radius:36px;margin:2px auto 12px;display:grid;place-items:center;font-size:57px;background:radial-gradient(circle,#6136ff,#17112f 65%);box-shadow:0 0 42px rgba(115,64,255,.34)}
      .ov2-muted{color:#909bb0;font-size:12px;line-height:1.45}
      .ov2-action{width:100%;text-align:left;border:1px solid #283650;background:#0d1625;color:#fff;border-radius:15px;padding:14px;margin-top:9px;cursor:pointer}
      .ov2-action.primary{border-color:#7c45ff}
      .ov2-action strong{display:block;font-size:14px;margin-bottom:4px}.ov2-action small{color:#909bb0}
      .ov2-label{font-size:11px;letter-spacing:1.3px;text-transform:uppercase;color:#7f8ba1;margin:16px 2px 9px}
      .ov2-job{display:flex;align-items:center;gap:10px;width:100%;border:1px solid #1d2940;background:#0b1421;color:#fff;border-radius:15px;padding:12px;text-align:left;margin-bottom:8px;cursor:pointer}
      .ov2-job.selected{border-color:#8d58ff;box-shadow:0 0 0 1px rgba(141,88,255,.18) inset}
      .ov2-logo{width:42px;height:42px;border-radius:12px;background:#17233a;display:grid;place-items:center;color:#a77bff;font-weight:800;flex:none}
      .ov2-job-main{min-width:0;flex:1}.ov2-job-main b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ov2-job-main small{display:block;color:#8e99ad;margin-top:3px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ov2-pill{font-size:9px;padding:5px 8px;border-radius:999px;background:#183b30;color:#63e2a6}
      .ov2-think-row{display:flex;align-items:center;gap:9px;color:#abb5c7;font-size:12px;padding:7px 0}.ov2-check{width:20px;height:20px;border-radius:50%;background:#103c30;color:#61e0a4;display:grid;place-items:center}.ov2-spinner{width:20px;height:20px;border:2px solid #713eff;border-top-color:transparent;border-radius:50%;animation:ov2spin .8s linear infinite}@keyframes ov2spin{to{transform:rotate(360deg)}}
      .ov2-tabs{display:flex;gap:5px;overflow:auto;margin-bottom:10px}.ov2-tab{border:1px solid #25334d;background:#0a1220;color:#8e99ad;border-radius:10px;padding:8px 10px;white-space:nowrap;cursor:pointer;font-size:10px}.ov2-tab.active{background:#713cff;border-color:#8b5aff;color:#fff}
      .ov2-priority{padding:13px;border:1px solid #223049;border-radius:15px;background:#0c1523;margin-bottom:9px}.ov2-priority h3{font-size:12px;margin:0 0 8px}.ov2-priority ul{margin:0;padding-left:18px;color:#b0bac9;font-size:11px;line-height:1.8}
      .ov2-chat{height:100%}.ov2-chat-messages{flex:1;min-height:0;overflow:auto;padding:8px 14px 10px;scrollbar-width:none}.ov2-chat-messages::-webkit-scrollbar{display:none}.ov2-bubble{max-width:88%;border-radius:16px;padding:11px 12px;margin:7px 0;font-size:13px;line-height:1.5;white-space:pre-wrap}.ov2-bubble.user{margin-left:auto;background:linear-gradient(135deg,#6f35e8,#593ce9)}.ov2-bubble.assistant{background:#0e1726;border:1px solid #1d2b43}.ov2-thinking{background:#0e1726;border:1px solid #1d2b43;border-radius:16px;padding:13px;margin:8px 0}.ov2-thinking b{font-size:13px}.ov2-thinking small{display:block;color:#8f9ab0;margin-top:6px;font-size:11px}.ov2-dots{display:inline-flex;gap:4px;margin-left:6px}.ov2-dots i{width:5px;height:5px;border-radius:50%;background:#8d56ff;animation:ov2dot 1s infinite}.ov2-dots i:nth-child(2){animation-delay:.15s}.ov2-dots i:nth-child(3){animation-delay:.3s}@keyframes ov2dot{0%,80%,100%{opacity:.2}40%{opacity:1}}
      .ov2-composer{display:flex;gap:8px;padding:9px 13px calc(env(safe-area-inset-bottom) + 9px);border-top:1px solid #182236;background:#080d17}.ov2-input{flex:1;min-width:0;border:1px solid #26354e;background:#0d1522;color:#fff;border-radius:14px;padding:11px 12px;outline:none}.ov2-send{width:44px;border:0;border-radius:13px;background:#743cff;color:#fff;cursor:pointer}
      .ov2-share{position:absolute;right:12px;top:66px;width:min(320px,calc(100% - 24px));background:#101827;border:1px solid #2a3852;border-radius:17px;padding:10px;box-shadow:0 25px 70px rgba(0,0,0,.6);z-index:2}.ov2-share button{width:100%;background:transparent;border:0;color:#fff;text-align:left;padding:11px;border-radius:10px;cursor:pointer}.ov2-share button:hover{background:#172338}.ov2-share-title{font-size:12px;color:#919db1;padding:4px 8px 7px}
      .ov2-resource{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 0;border-top:1px solid #1a263a}.ov2-resource:first-child{border-top:0}.ov2-resource b{font-size:12px}.ov2-open{border:1px solid #2c3e5c;background:#0d1727;color:#fff;border-radius:9px;padding:7px 9px;font-size:10px;cursor:pointer}
      @media (min-width:701px){#${ROOT_ID}{inset:auto;right:24px;top:50%;transform:translateY(-50%);width:450px;height:800px;border:1px solid #293750;border-radius:24px;overflow:hidden;box-shadow:0 30px 100px rgba(0,0,0,.6)}}
    `;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.innerHTML = `<div id="${VIEW_ID}"></div>`;
      document.body.appendChild(root);
    }
    return root;
  }

  function getClient() {
    return window.supabaseClient || window.gluefulSupabaseClient || null;
  }

  async function loadRealApplications() {
    const client = getClient();
    if (!client?.auth || !client?.from) return false;
    try {
      const { data: userData } = await client.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return false;
      const { data, error } = await client
        .from("applications")
        .select("id,user_id,company,role,date,status,link,jd,resume_id,resume_name,resume_url,capture_source,captured_at,job_id")
        .eq("user_id", userId)
        .order("date", { ascending:false, nullsFirst:false })
        .limit(12);
      if (error) throw error;
      state.jobs = Array.isArray(data) ? data : [];
      return true;
    } catch (error) {
      console.warn("[Orbit] failed to load real applications", error);
      return false;
    }
  }

  function normalizeJob(row) {
    return {
      id: row?.id,
      company: row?.company || "Unknown company",
      role: row?.role || "Job application",
      status: row?.status || "Applied",
      appliedAt: row?.date || row?.captured_at || "",
      description: row?.jd || "",
      link: row?.link || "",
      jobId: row?.job_id || null,
      resumeName: row?.resume_name || ""
    };
  }

  function displayJobs() {
    return state.jobs.map(normalizeJob);
  }

  function logoFor(company) {
    return String(company || "G").trim().slice(0, 2).toUpperCase();
  }

  function jobButton(job) {
    return `<button class="ov2-job ${state.job?.id === job.id ? "selected" : ""}" data-action="select-job" data-job-id="${esc(job.id)}">
      <span class="ov2-logo">${esc(logoFor(job.company))}</span>
      <span class="ov2-job-main"><b>${esc(job.company)}</b><small>${esc(job.role)}</small></span>
      <span class="ov2-pill">${esc(job.status)}</span>
    </button>`;
  }

  function header(title, back = true, share = false) {
    return `<header class="ov2-head"><div class="ov2-head-left">${back ? `<button class="ov2-icon" data-action="back">‹</button>` : ""}<div class="ov2-title">${esc(title)}</div></div><div style="display:flex;gap:7px">${share ? `<button class="ov2-icon" data-action="share">↗</button>` : ""}<button class="ov2-icon" data-action="close">×</button></div></header>`;
  }

  function home() {
    const jobs = displayJobs();
    return `<div class="ov2-app">${header("Orbit AI", false)}<main class="ov2-body">
      <section class="ov2-card ov2-hero"><div class="ov2-orbit">🪐</div><div style="font-size:20px;font-weight:800">Your career copilot.</div><p class="ov2-muted">I'm here to help you prepare smarter, one opportunity at a time.</p></section>
      <section class="ov2-card"><button class="ov2-action primary" data-action="prepare"><strong>🎯 Prepare for a Job</strong><small>Select one of your real applications and I'll build the preparation around its job description.</small></button><button class="ov2-action" data-action="glueful"><strong>💬 Ask Orbit about Glueful</strong><small>Ask about Gmail integration, applications, settings or how Glueful works.</small></button></section>
      <div class="ov2-label">Recent applications</div>
      ${jobs.length ? jobs.slice(0,6).map(jobButton).join("") : `<section class="ov2-card"><div style="font-size:13px">No applications found yet.</div><p class="ov2-muted">Once Glueful captures an application, it will appear here.</p></section>`}
    </main></div>`;
  }

  function prepare() {
    const jobs = displayJobs();
    return `<div class="ov2-app">${header("Prepare for a Job")}<main class="ov2-body"><section class="ov2-card"><b>Great — let's get you ready 🚀</b><p class="ov2-muted" style="margin:6px 0 0">Choose a recent application. Orbit will use the actual job description when available.</p></section><div class="ov2-label">Your applications</div>${jobs.length ? jobs.map(jobButton).join("") : `<section class="ov2-card"><div>No applications are available for your account.</div></section>`}</main></div>`;
  }

  function thinking() {
    return `<div class="ov2-app">${header(state.job?.company || "Orbit", true)}<main class="ov2-body"><section class="ov2-card"><div style="font-size:16px;font-weight:800;margin-bottom:11px">🚀 Orbit is thinking<span class="ov2-dots"><i></i><i></i><i></i></span></div><div class="ov2-think-row"><span class="ov2-check">✓</span> Reading job description</div><div class="ov2-think-row"><span class="ov2-check">✓</span> Extracting key skills</div><div class="ov2-think-row"><span class="ov2-check">✓</span> Identifying important topics</div><div class="ov2-think-row"><span class="ov2-check">✓</span> Matching your profile context</div><div class="ov2-think-row"><span class="ov2-spinner"></span> Creating personalized plan</div></section></main></div>`;
  }

  function topicData(job) {
    const text = `${job?.role || ""} ${job?.description || ""}`.toLowerCase();
    if (text.includes("thermal")) return {
      high:["Thermal Management","DVFS (Dynamic Voltage & Frequency Scaling)","Power / Limits Management","Embedded Linux Thermal Framework"],
      medium:["C / C++","Multithreading","Debugging & Performance Tuning","Linux Device Drivers"],
      low:["Behavioral preparation","Company-specific systems","Project discussion"]
    };
    if (text.includes("embedded")) return {
      high:["C / C++ fundamentals","Embedded systems","RTOS concepts","Debugging"],
      medium:["Microcontrollers","Memory / interrupts","Device drivers","Testing"],
      low:["Behavioral preparation","Project discussion","Company background"]
    };
    return {
      high:["Role fundamentals","Core skills from the JD","Problem solving","Interview fundamentals"],
      medium:["C / C++ or primary language","Operating systems","Debugging","Testing"],
      low:["Behavioral preparation","Company background","Project discussion"]
    };
  }

  function topics() {
    const job = state.job || normalizeJob(state.jobs[0] || {});
    const d = topicData(job);
    return `<div class="ov2-app">${header(job.company,true,true)}<main class="ov2-body"><div class="ov2-tabs"><button class="ov2-tab active">Overview</button><button class="ov2-tab" data-action="chat">Chat</button><button class="ov2-tab" data-action="resources">Resources</button><button class="ov2-tab" data-action="plan">Plan</button></div><section class="ov2-priority"><h3>🔥 High Priority <span style="float:right;color:#ff8f8f">HIGH</span></h3><ul>${d.high.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section><section class="ov2-priority"><h3>🟡 Medium Priority <span style="float:right;color:#f4bf69">MEDIUM</span></h3><ul>${d.medium.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section><section class="ov2-priority"><h3>🟢 Low Priority <span style="float:right;color:#63e0a4">LOW</span></h3><ul>${d.low.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="ov2-action primary" style="text-align:center;margin:0" data-action="plan">📚 Study Plan</button><button class="ov2-action" style="text-align:center;margin:0" data-action="chat">❓ Interview Qs</button></div></main></div>`;
  }

  function resourceView() {
    const job = state.job || {};
    const d = topicData(job);
    const query = encodeURIComponent(`${job.company || "job"} ${job.role || ""} interview preparation ${d.high[0]}`.trim());
    const items = [
      ["Official company/career page","Search the employer's official engineering or careers content.",`https://www.google.com/search?q=${query}`],
      ["Google","Find current documentation, lectures and discussions for the selected topic.",`https://www.google.com/search?q=${encodeURIComponent(d.high[0])}`],
      ["YouTube","Use focused lectures and walkthroughs for difficult concepts.",`https://www.youtube.com/results?search_query=${encodeURIComponent(d.high[0])}`]
    ];
    return `<div class="ov2-app">${header("Resources",true)}<main class="ov2-body"><section class="ov2-card"><b>Orbit's resource approach 📚</b><p class="ov2-muted">Start with authoritative material, then use practical explanations and practice content.</p></section><section class="ov2-card">${items.map(([t,sub,url])=>`<div class="ov2-resource"><div><b>${esc(t)}</b><div class="ov2-muted">${esc(sub)}</div></div><button class="ov2-open" data-open-url="${esc(url)}">Open ↗</button></div>`).join("")}</section><button class="ov2-action primary" data-action="chat" style="text-align:center">Ask Orbit for a more specific resource list</button></main></div>`;
  }

  function chat() {
    const job = state.job;
    const bubbles = state.messages.map(m=>`<div class="ov2-bubble ${m.role === "user" ? "user" : "assistant"}">${esc(m.content)}</div>`).join("");
    const think = state.thinking ? `<div class="ov2-thinking"><b>🚀 Orbit is thinking<span class="ov2-dots"><i></i><i></i><i></i></span></b><small>Understanding → Finding → Preparing</small></div>` : "";
    return `<div class="ov2-app ov2-chat">${header("Orbit Chat",true,true)}<div class="ov2-chat-messages" id="ov2-chat-messages">${job ? `<div class="ov2-label" style="margin-top:2px">${esc(job.company)} · ${esc(job.role)}</div>` : ""}${bubbles || `<section class="ov2-card"><b>Hey! 👋 I'm Orbit.</b><p class="ov2-muted">Ask me about this job, what to study, interview questions, resources, timelines, or anything about Glueful.</p></section>`}${think}</div><form class="ov2-composer" data-action="send"><input class="ov2-input" name="message" autocomplete="off" placeholder="Ask Orbit anything…"><button class="ov2-send" type="submit">➤</button></form>${state.shareOpen ? shareSheet() : ""}</div>`;
  }

  function shareSheet() {
    return `<div class="ov2-share"><div class="ov2-share-title">Share this chat</div><button data-share="whatsapp">🟢 WhatsApp</button><button data-share="gmail">✉️ Gmail</button><button data-share="drive">☁️ Google Drive</button><button data-share="copy">📋 Copy as Text</button><button data-share="save">💾 Save chat to device</button><button data-share="native">↗ More options</button></div>`;
  }

  function render() {
    const view = document.getElementById(VIEW_ID);
    if (!view) return;
    if (state.screen === "home") view.innerHTML = home();
    else if (state.screen === "prepare") view.innerHTML = prepare();
    else if (state.screen === "thinking") view.innerHTML = thinking();
    else if (state.screen === "topics") view.innerHTML = topics();
    else if (state.screen === "resources") view.innerHTML = resourceView();
    else if (state.screen === "chat") view.innerHTML = chat();
    if (state.screen === "chat") requestAnimationFrame(()=>{ const el=document.getElementById("ov2-chat-messages"); if(el) el.scrollTop=el.scrollHeight; });
  }

  function openOrbit() {
    installStyles();
    const root = ensureRoot();
    state.screen = "home";
    state.job = null;
    state.messages = [];
    state.thinking = false;
    state.shareOpen = false;
    root.classList.add("open");
    loadRealApplications().finally(render);
    render();
  }

  function closeOrbit() {
    document.getElementById(ROOT_ID)?.classList.remove("open");
  }

  function selectJob(id) {
    const row = state.jobs.find(x => String(x.id) === String(id));
    if (!row) return;
    state.job = normalizeJob(row);
    state.screen = "thinking";
    state.messages = [];
    render();
    window.setTimeout(() => {
      state.screen = "topics";
      render();
    }, 1150);
  }

  function goChat(seed) {
    state.screen = "chat";
    state.shareOpen = false;
    if (seed && !state.messages.length) state.messages.push({ role:"assistant", content:`I’ve mapped ${state.job?.role || "this role"} at ${state.job?.company || "the company"}. Ask me for a study plan, resources, interview questions, or what to prioritize first. 🚀` });
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
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function shareChat(kind) {
    const text = chatText();
    const encoded = encodeURIComponent(text.slice(0, 7000));
    if (kind === "native" && navigator.share) { try { await navigator.share({ title:"Orbit Chat", text }); } catch (_) {} return; }
    if (kind === "whatsapp") window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener");
    else if (kind === "gmail") window.location.href = `mailto:?subject=${encodeURIComponent("Orbit Chat")}&body=${encoded}`;
    else if (kind === "drive") {
      await navigator.clipboard?.writeText(text);
      window.open("https://drive.google.com/drive/my-drive", "_blank", "noopener");
    } else if (kind === "copy") await navigator.clipboard?.writeText(text);
    else if (kind === "save") saveChat();
    state.shareOpen = false;
    render();
  }

  async function askOrbit(message) {
    const clean = String(message || "").trim();
    if (!clean || state.thinking) return;
    const serial = ++state.requestSerial;
    state.messages.push({ role:"user", content:clean });
    state.messages = state.messages.slice(-MAX_HISTORY);
    state.thinking = true;
    render();

    try {
      const client = getClient();
      if (!client?.functions?.invoke) throw new Error("Supabase client unavailable");
      const { data, error } = await client.functions.invoke("orbit-ai", {
        body:{ message:clean, job:state.job, history:state.messages.slice(-12) }
      });
      if (serial !== state.requestSerial) return;
      if (error) throw error;
      const answer = String(data?.answer || "").trim();
      if (!answer) throw new Error("Empty Orbit response");
      state.messages.push({ role:"assistant", content:answer });
    } catch (error) {
      console.warn("[Orbit] AI request failed", error);
      state.messages.push({ role:"assistant", content:fallbackAnswer(clean) });
    } finally {
      if (serial === state.requestSerial) {
        state.thinking = false;
        render();
      }
    }
  }

  function fallbackAnswer(message) {
    const q = message.toLowerCase();
    if (/fuck|shit|idiot|stupid/.test(q)) return "Hmm… it’s not technically possible 😌🪐 But I’m still here. Tell me what went wrong and let’s get you back on track.";
    if (/gmail/.test(q)) return "Gmail Integration lets Glueful check connected Gmail accounts for relevant application emails automatically. You can manage connected accounts and sync them from the Gmail integration screen. 📬";
    if (/processing|how long|timeline/.test(q)) return "Hmm… I don’t want to make up a time. 😌 The actual processing time depends on the company or the specific Glueful operation. Give me the exact thing you mean and I’ll narrow it down.";
    if (/study|prepare|plan/.test(q) && state.job) return `For ${state.job.role} at ${state.job.company}, I’d start with the high-priority topics from the analysis above, then build the plan around your deadline. Tell me how many days you have and I’ll make it day by day.`;
    return "I’m Orbit 🪐 — your Glueful career copilot. Ask me about this job, what to study, interview questions, resources, application timelines, or Glueful itself.";
  }

  function bind() {
    const root = ensureRoot();
    root.addEventListener("click", async event => {
      const urlEl = event.target.closest("[data-open-url]");
      if (urlEl) { window.open(urlEl.dataset.openUrl, "_blank", "noopener"); return; }
      const shareEl = event.target.closest("[data-share]");
      if (shareEl) { await shareChat(shareEl.dataset.share); return; }
      const actionEl = event.target.closest("[data-action]");
      if (!actionEl) return;
      const action = actionEl.dataset.action;
      if (action === "close") closeOrbit();
      else if (action === "back") {
        state.shareOpen = false;
        state.screen = state.screen === "chat" ? "topics" : state.screen === "resources" ? "topics" : state.screen === "topics" ? "prepare" : state.screen === "thinking" ? "prepare" : "home";
        render();
      } else if (action === "prepare") { state.screen="prepare"; render(); }
      else if (action === "glueful") { state.job=null; state.messages=[]; goChat(false); }
      else if (action === "select-job") selectJob(actionEl.dataset.jobId);
      else if (action === "chat") goChat(true);
      else if (action === "plan") goChat(true);
      else if (action === "resources") { state.screen="resources"; render(); }
      else if (action === "share") { state.shareOpen = !state.shareOpen; render(); }
    });
    root.addEventListener("submit", event => {
      const form = event.target.closest("form[data-action=\"send\"]");
      if (!form) return;
      event.preventDefault();
      const message = form.elements.message?.value || "";
      form.reset();
      askOrbit(message);
    });
  }

  function injectNavigation() {
    const nav = Array.from(document.querySelectorAll("nav,[class*=navigation],[class*=bottom]"))
      .find(el => /dashboard/i.test(el.textContent || "") && /jobs/i.test(el.textContent || ""));
    if (!nav || nav.querySelector("[data-glueful-orbit-nav]")) return !!nav;
    const item = document.createElement("button");
    item.type="button"; item.dataset.gluefulOrbitNav="true";
    item.innerHTML='<span style="font-size:18px;line-height:1">🪐</span><span style="font-size:10px">Orbit</span>';
    item.style.cssText="flex:1;min-width:0;border:0;background:transparent;color:#8e99ad;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 2px;cursor:pointer";
    item.addEventListener("click", openOrbit); nav.appendChild(item); return true;
  }

  function start() {
    installStyles(); ensureRoot(); bind();
    let attempts=0;
    const timer=setInterval(()=>{ attempts++; if (injectNavigation() || attempts >= 30) clearInterval(timer); }, 400);
    window.openGluefulOrbit = openOrbit;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true }); else start();
})();
