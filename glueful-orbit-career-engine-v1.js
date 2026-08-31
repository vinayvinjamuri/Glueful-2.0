/*
 * Glueful Orbit Career Engine v1
 *
 * Original implementation for Glueful, informed by open-source career-copilot
 * patterns: structured JD parsing, priority scoring, gap-oriented coaching,
 * and action-driven interview preparation. No source code is copied from
 * third-party projects.
 *
 * The engine is intentionally UI/runtime agnostic: it reads the active Orbit
 * job context from the DOM, derives deterministic intelligence locally, and
 * turns high-value actions into prompts for Orbit's existing AI runtime.
 */
(function () {
  "use strict";

  if (window.__GLUEFUL_ORBIT_CAREER_ENGINE_V1__) return;
  window.__GLUEFUL_ORBIT_CAREER_ENGINE_V1__ = true;

  const ROOT = "glueful-orbit-v2-root";
  const STORE_PREFIX = "glueful_orbit_career_intel_v1:";

  const TAXONOMY = [
    ["C / C++", /\b(?:c\+\+|c language|c programming|embedded c)\b/i, "core"],
    ["Python", /\bpython\b/i, "core"],
    ["Java", /\bjava\b/i, "core"],
    ["JavaScript / TypeScript", /\b(?:javascript|typescript|node\.js|nodejs)\b/i, "software"],
    ["SQL", /\bsql\b/i, "software"],
    ["Linux", /\blinux\b/i, "systems"],
    ["RTOS", /\brtos\b|real[- ]time operating system/i, "embedded"],
    ["Embedded Systems", /\bembedded(?: systems?| software)?\b/i, "embedded"],
    ["Microcontrollers", /\b(?:microcontroller|mcu|stm32|arm cortex|esp32|arduino)\b/i, "embedded"],
    ["Firmware", /\bfirmware\b/i, "embedded"],
    ["I2C / SPI / UART", /\b(?:i2c|spi|uart|can bus|i2s)\b/i, "embedded"],
    ["Digital Electronics", /\b(?:digital electronics|logic design|digital design|verilog|systemverilog|fpga)\b/i, "hardware"],
    ["Analog / Mixed Signal", /\b(?:analog|mixed[- ]signal|op[- ]amp|adc|dac|pmic|power management)\b/i, "hardware"],
    ["VLSI / CMOS", /\b(?:vlsi|cmos|asic|physical design|standard cells)\b/i, "hardware"],
    ["Computer Architecture", /\b(?:computer architecture|cpu|cache|pipeline|memory hierarchy)\b/i, "systems"],
    ["Operating Systems", /\b(?:operating systems?|os concepts?|processes?|threads?|scheduling|virtual memory)\b/i, "systems"],
    ["Networking", /\b(?:tcp\/?ip|networking|ethernet|http|https|sockets?)\b/i, "systems"],
    ["Git", /\bgit(?:hub)?\b/i, "software"],
    ["Docker / Containers", /\b(?:docker|containers?|kubernetes|k8s)\b/i, "software"],
    ["Cloud", /\b(?:aws|azure|gcp|cloud)\b/i, "software"],
    ["Machine Learning", /\b(?:machine learning|deep learning|neural networks?|pytorch|tensorflow)\b/i, "ai"],
    ["Data Structures & Algorithms", /\b(?:data structures?|algorithms?|dsa|complexity|big[- ]o)\b/i, "fundamentals"],
    ["Debugging / Testing", /\b(?:debugging|unit testing|integration testing|test automation|validation|verification)\b/i, "engineering"],
    ["System Design", /\b(?:system design|architecture|distributed systems?)\b/i, "engineering"],
    ["Communication", /\b(?:communication|cross[- ]functional|stakeholder|presentation)\b/i, "behavioral"]
  ];

  function root() { return document.getElementById(ROOT); }
  function esc(v) {
    return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function activeContext() {
    const r = root();
    const label = r?.querySelector(".ov2-chat-messages .ov2-label")?.textContent || "";
    const match = label.match(/^(.+?)\s+·\s+(.+)$/);
    return {
      company: match?.[1]?.trim() || "",
      role: match?.[2]?.trim() || "",
      applicationId: r?.dataset.orbitApplicationId || ""
    };
  }

  function sourceText() {
    const r = root();
    if (!r) return "";
    return [
      r.querySelector(".ov2-chat-messages")?.textContent || "",
      r.dataset.orbitJobDescription || ""
    ].join("\n");
  }

  function extractSkills(text) {
    return TAXONOMY
      .filter(([, pattern]) => pattern.test(text))
      .map(([name, , category]) => ({ name, category }));
  }

  function priorityFor(skill, text) {
    const escaped = skill.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hits = [...text.matchAll(new RegExp(escaped, "gi"))].map(m => m.index || 0);
    if (!hits.length) return "medium";
    const windows = hits.map(i => text.slice(Math.max(0, i - 90), Math.min(text.length, i + 140)));
    if (windows.some(w => /required|must have|mandatory|essential|minimum|strong knowledge/i.test(w))) return "high";
    if (windows.some(w => /preferred|nice to have|plus|good to have/i.test(w))) return "low";
    return "medium";
  }

  function analyze() {
    const text = sourceText();
    const skills = extractSkills(text);
    const groups = { high: [], medium: [], low: [] };
    for (const skill of skills) groups[priorityFor(skill, text)].push(skill);
    return {
      skills,
      high: groups.high,
      medium: groups.medium,
      low: groups.low,
      counts: { total: skills.length, high: groups.high.length, medium: groups.medium.length, low: groups.low.length }
    };
  }

  function storageKey(ctx) { return STORE_PREFIX + (ctx.applicationId || `${ctx.company}:${ctx.role}`); }
  function save(analysis, ctx) {
    try { sessionStorage.setItem(storageKey(ctx), JSON.stringify({ savedAt: Date.now(), analysis })); } catch (_) {}
  }

  function load(ctx) {
    try { return JSON.parse(sessionStorage.getItem(storageKey(ctx)) || "null")?.analysis || null; } catch (_) { return null; }
  }

  function prompt(text) {
    const r = root();
    const input = r?.querySelector('.ov2-chat form[data-action="send"] .ov2-input');
    const form = r?.querySelector('.ov2-chat form[data-action="send"]');
    if (!input || !form) return false;
    input.value = text;
    form.requestSubmit();
    return true;
  }

  function ensureStyles() {
    if (document.getElementById("orbit-career-engine-v1-style")) return;
    const style = document.createElement("style");
    style.id = "orbit-career-engine-v1-style";
    style.textContent = `
      #${ROOT} .oce-panel{margin:10px 0;padding:13px;border:1px solid #263653;border-radius:16px;background:#0b1422}
      #${ROOT} .oce-title{font-size:13px;font-weight:800;margin-bottom:8px}
      #${ROOT} .oce-meta{color:#8f9bb0;font-size:11px;line-height:1.5}
      #${ROOT} .oce-skills{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0}
      #${ROOT} .oce-skill{padding:5px 8px;border-radius:999px;background:#17243a;border:1px solid #273a59;color:#dce5f4;font-size:10px}
      #${ROOT} .oce-skill.high{border-color:#75404a;background:#2a171c}
      #${ROOT} .oce-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}
      #${ROOT} .oce-actions button{border:1px solid #293b5a;background:#101c2d;color:#fff;border-radius:10px;padding:9px 7px;font-size:10px;cursor:pointer}
      #${ROOT} .oce-actions button.primary{border-color:#7447ed;background:#392070}
    `;
    document.head.appendChild(style);
  }

  function renderPanel() {
    const r = root();
    const chat = r?.querySelector(".ov2-chat-messages");
    if (!chat || chat.querySelector(".oce-panel")) return;
    const ctx = activeContext();
    const analysis = load(ctx) || analyze();
    save(analysis, ctx);
    if (!analysis.skills.length) return;

    const panel = document.createElement("section");
    panel.className = "oce-panel";
    panel.innerHTML = `
      <div class="oce-title">🧠 Career Intelligence</div>
      <div class="oce-meta">${analysis.counts.total} relevant skill signals detected from the active job context.</div>
      <div class="oce-skills">${analysis.high.slice(0,8).map(s => `<span class="oce-skill high">${esc(s.name)}</span>`).join("")}${analysis.medium.slice(0,6).map(s => `<span class="oce-skill">${esc(s.name)}</span>`).join("")}</div>
      <div class="oce-actions">
        <button class="primary" data-oce="plan">Build my study plan</button>
        <button data-oce="questions">Generate interview questions</button>
        <button data-oce="gaps">Find my skill gaps</button>
        <button data-oce="explain">Explain the highest-priority skills</button>
      </div>`;
    chat.insertBefore(panel, chat.firstChild?.nextSibling || null);
  }

  function action(kind) {
    const ctx = activeContext();
    const analysis = load(ctx) || analyze();
    const high = analysis.high.map(x => x.name).join(", ") || "the most important requirements";
    const all = analysis.skills.map(x => x.name).join(", ");
    const base = `Role: ${ctx.role || "target role"} at ${ctx.company || "the company"}. Detected job skills: ${all || "not yet extracted"}.`;
    const prompts = {
      plan: `${base} Build a practical study plan for this job. Prioritize ${high}. Ask me for my interview deadline only if it is genuinely needed. Break the plan into fundamentals, practice, and interview questions.`,
      questions: `${base} Generate a realistic interview set for this role. Mix fundamentals, role-specific technical questions, project questions, and behavioral questions. Start with 10 questions and do not reveal answers unless I ask.`,
      gaps: `${base} Perform a skill-gap analysis against my profile/resume if it is available in Glueful. Separate confirmed strengths, likely gaps, and unknowns. Never invent experience I have not provided.`,
      explain: `${base} Teach me the highest-priority job requirements one by one. Start with the most important prerequisite and connect each topic to likely interview questions.`
    };
    prompt(prompts[kind]);
  }

  function observe() {
    ensureStyles();
    const r = root();
    if (!r) return;
    const chat = r.querySelector(".ov2-chat");
    if (!chat) return;
    renderPanel();
  }

  document.addEventListener("click", event => {
    const button = event.target.closest?.("[data-oce]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    action(button.dataset.oce);
  }, true);

  const observer = new MutationObserver(observe);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  observe();
})();
