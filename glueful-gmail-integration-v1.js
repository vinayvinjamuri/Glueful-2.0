/* Glueful Gmail integration v7: automatic sync + multi-account dashboard control. */
(function () {
  "use strict";
  const FUNCTION_URL = (window.SUPABASE_URL || "https://xztbhheexianejsvwpva.supabase.co") + "/functions/v1/gmail-application-capture";
  const AUTO_SYNC_MS = 15 * 60 * 1000;
  let gmailStatus = { connected: false, connections: [], connection: null };
  let autoSyncTimer = null;
  let syncInFlight = false;

  function getClient() {
    if (window.supabaseClient) return window.supabaseClient;
    try { if (typeof supabaseClient !== "undefined") return supabaseClient; } catch (_) {}
    return null;
  }
  async function getSession() {
    const client = getClient();
    if (!client?.auth) return null;
    const { data } = await client.auth.getSession();
    return data?.session || null;
  }
  async function callGmail(action, extra = {}) {
    const session = await getSession();
    if (!session?.access_token) throw new Error("Please sign in to Glueful first.");
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action, ...extra })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.error) throw new Error(data?.error || `Gmail request failed (${response.status})`);
    return data;
  }
  function ensureStyles() {
    if (document.getElementById("glueful-gmail-style")) return;
    const style = document.createElement("style");
    style.id = "glueful-gmail-style";
    style.textContent = `
      .glueful-gmail-modal-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,6,12,.72);backdrop-filter:blur(12px);overflow:auto}
      .glueful-gmail-modal{width:min(560px,100%);max-height:calc(100vh - 40px);overflow:auto;border:1px solid rgba(255,255,255,.10);border-radius:24px;padding:24px;background:#101521;color:#fff;box-shadow:0 24px 80px rgba(0,0,0,.45);font-family:Inter,system-ui,sans-serif}
      .glueful-gmail-modal h3{margin:0 0 8px;font-size:21px}.glueful-gmail-modal p{margin:0 0 18px;color:#aeb7c8;line-height:1.55;font-size:14px}
      .glueful-gmail-actions{display:flex;gap:10px;flex-wrap:wrap}.glueful-gmail-btn{border:0;border-radius:13px;padding:12px 16px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#7b36ff,#286dff);color:#fff}.glueful-gmail-btn.secondary{background:rgba(255,255,255,.08);color:#dce3f2}.glueful-gmail-btn.danger{background:transparent;border:1px solid rgba(255,90,90,.55);color:#ff7777}.glueful-gmail-status{font-size:12px;color:#8d9ab0;margin-top:12px;min-height:18px}
      .glueful-gmail-section-label{font-size:11px;font-weight:800;letter-spacing:.12em;color:#8d9ab0;margin:22px 0 9px;text-transform:uppercase}
      .glueful-gmail-account{border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.035);padding:14px;margin-bottom:10px}
      .glueful-gmail-account-head{display:flex;align-items:center;gap:12px}.glueful-gmail-logo{width:38px;height:38px;border-radius:10px;background:#fff;display:grid;place-items:center;flex:0 0 auto}.glueful-gmail-logo svg{width:25px;height:25px}.glueful-gmail-account-main{min-width:0;flex:1}.glueful-gmail-email{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.glueful-gmail-meta{font-size:12px;color:#8d9ab0;margin-top:3px}.glueful-gmail-pill{font-size:11px;font-weight:800;color:#72e6b0;background:rgba(45,190,120,.13);padding:6px 9px;border-radius:999px;white-space:nowrap}.glueful-gmail-account-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.glueful-gmail-account-actions button{border:0;border-radius:11px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#7b36ff,#286dff);color:#fff}.glueful-gmail-account-actions button.danger{background:transparent;border:1px solid rgba(255,90,90,.45);color:#ff7777}.glueful-gmail-add{width:100%;text-align:left;border:1px dashed rgba(255,255,255,.18);border-radius:14px;padding:14px;background:transparent;color:#dce3f2;font-weight:700;cursor:pointer}.glueful-gmail-add span{font-size:20px;vertical-align:-2px;margin-right:9px}.glueful-gmail-empty{padding:16px;border:1px dashed rgba(255,255,255,.14);border-radius:14px;color:#8d9ab0;font-size:13px}
      #glueful-dashboard-gmail-sync{position:fixed;right:18px;bottom:18px;z-index:9000;border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:9px 13px;background:rgba(16,21,33,.94);color:#dce3f2;font:600 12px Inter,system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.28);cursor:pointer;backdrop-filter:blur(10px);display:none}
      #glueful-dashboard-gmail-sync.syncing{opacity:.65;cursor:wait}.ingestion-monitor-card{display:none !important}
    `;
    document.head.appendChild(style);
  }
  function closeModal() { document.querySelector(".glueful-gmail-modal-backdrop")?.remove(); }
  function setStatus(text) { const node = document.getElementById("glueful-gmail-status"); if (node) node.textContent = text || ""; }
  function updateDashboardSyncButton() {
    const button = document.getElementById("glueful-dashboard-gmail-sync");
    if (!button) return;
    button.style.display = gmailStatus.connected ? "block" : "none";
    button.textContent = syncInFlight ? "Syncing Gmail…" : "Sync Gmail";
    button.classList.toggle("syncing", syncInFlight); button.disabled = syncInFlight;
  }
  function ensureDashboardSyncButton() {
    ensureStyles();
    let button = document.getElementById("glueful-dashboard-gmail-sync");
    if (!button) { button = document.createElement("button"); button.id = "glueful-dashboard-gmail-sync"; button.type = "button"; button.setAttribute("aria-label", "Sync Gmail applications"); button.addEventListener("click", () => syncNow(true)); document.body.appendChild(button); }
    updateDashboardSyncButton();
  }
  function connectionList() { return Array.isArray(gmailStatus.connections) ? gmailStatus.connections : (gmailStatus.connection ? [gmailStatus.connection] : []); }
  function gmailIcon() { return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M3 6.8 12 13l9-6.2V19H3z"/><path fill="#4285F4" d="M3 5h3v14H3z"/><path fill="#34A853" d="M18 5h3v14h-3z"/><path fill="#FBBC04" d="M3 5h3l6 4.2L18 5h3l-9 6.2z"/></svg>`; }
  function fmtDate(value) { if (!value) return "Not synced yet"; try { return `Last synced: ${new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`; } catch (_) { return "Last synced recently"; } }
  function renderModalState() {
    const primary = document.getElementById("glueful-gmail-primary");
    const sync = document.getElementById("glueful-gmail-sync");
    const copy = document.getElementById("glueful-gmail-copy");
    const accounts = document.getElementById("glueful-gmail-accounts");
    if (!primary || !sync || !copy || !accounts) return;
    const list = connectionList();
    if (list.length) {
      primary.style.display = "none"; sync.style.display = "inline-block";
      copy.textContent = "Glueful automatically checks recent application emails from your connected accounts.";
      accounts.innerHTML = `<div class="glueful-gmail-section-label">Connected account${list.length === 1 ? "" : "s"}</div>${list.map((c, i) => `
        <div class="glueful-gmail-account">
          <div class="glueful-gmail-account-head"><div class="glueful-gmail-logo">${gmailIcon()}</div><div class="glueful-gmail-account-main"><div class="glueful-gmail-email">${escapeHtml(c.gmail_email || "Gmail account")}</div><div class="glueful-gmail-meta">${escapeHtml(fmtDate(c.last_synced_at))}</div></div><span class="glueful-gmail-pill">${i === 0 ? "Connected" : "Connected"}</span></div>
          <div class="glueful-gmail-account-actions"><button type="button" data-gmail-sync="${c.id}">↻ Sync now</button><button type="button" class="danger" data-gmail-disconnect="${c.id}">Disconnect</button></div>
        </div>`).join("")}
        <div class="glueful-gmail-section-label">Add another account</div><button type="button" class="glueful-gmail-add" id="glueful-gmail-add"><span>＋</span>Integrate another Gmail</button>`;
      accounts.querySelectorAll("[data-gmail-sync]").forEach(b => b.onclick = () => syncNow(true, b.dataset.gmailSync));
      accounts.querySelectorAll("[data-gmail-disconnect]").forEach(b => b.onclick = () => disconnectConnection(b.dataset.gmailDisconnect));
      accounts.querySelector("#glueful-gmail-add").onclick = connectAnother;
    } else {
      primary.style.display = "inline-block"; sync.style.display = "none";
      primary.textContent = "Connect Gmail";
      copy.textContent = "Connect Gmail so Glueful can detect job application confirmation emails. Gmail access is read-only.";
      accounts.innerHTML = `<div class="glueful-gmail-empty">No Gmail account connected.</div>`;
    }
    updateDashboardSyncButton();
  }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
  async function loadStatus() {
    try { gmailStatus = await callGmail("status"); updateSettingsRows(); renderModalState(); ensureDashboardSyncButton(); configureAutoSync(); return gmailStatus; }
    catch (error) { console.warn("[Glueful] Gmail status unavailable:", error.message || error); updateDashboardSyncButton(); return gmailStatus; }
  }
  async function connectAnother() {
    setStatus("Opening Google account picker…");
    try { const data = await callGmail("authorize"); if (!data.authorization_url) throw new Error("Google authorization URL was not returned."); window.location.href = data.authorization_url; }
    catch (error) { setStatus(error.message || "Unable to connect Gmail."); }
  }
  async function connectOrDisconnect() { if (gmailStatus.connected) return disconnectConnection(); return connectAnother(); }
  async function disconnectConnection(connectionId) {
    const list = connectionList(); const target = connectionId ? list.find(c => c.id === connectionId) : list[0];
    if (!target) return;
    if (!window.confirm(`Disconnect ${target.gmail_email || "this Gmail account"}?`)) return;
    setStatus("Disconnecting…");
    try { await callGmail("disconnect", { connection_id: target.id }); await loadStatus(); setStatus("Gmail account disconnected."); }
    catch (error) { setStatus(error.message || "Unable to disconnect Gmail."); }
  }
  async function syncNow(showModalStatus = false, connectionId = null) {
    if (syncInFlight || !gmailStatus.connected) return null;
    syncInFlight = true; updateDashboardSyncButton(); if (showModalStatus) setStatus("Checking Gmail…");
    try {
      const result = await callGmail("sync", connectionId ? { connection_id: connectionId } : {}); await loadStatus();
      const imported = Number(result?.imported || 0);
      if (showModalStatus) setStatus(`Gmail sync complete: ${imported} new application${imported === 1 ? "" : "s"}.`);
      if (imported && typeof window.renderApplications === "function") { try { window.renderApplications(); } catch (_) {} }
      return result;
    } catch (error) { console.warn("[Glueful] Gmail sync failed:", error.message || error); if (showModalStatus) setStatus(error.message || "Gmail sync failed."); return null; }
    finally { syncInFlight = false; updateDashboardSyncButton(); }
  }
  function stopAutoSync() { if (autoSyncTimer) clearInterval(autoSyncTimer); autoSyncTimer = null; }
  function configureAutoSync() { stopAutoSync(); if (!gmailStatus.connected) return; autoSyncTimer = setInterval(() => syncNow(false), AUTO_SYNC_MS); }
  function handleAppReturn() { if (gmailStatus.connected) void syncNow(false); }
  function openModal() {
    ensureStyles(); closeModal();
    const backdrop = document.createElement("div"); backdrop.className = "glueful-gmail-modal-backdrop";
    backdrop.innerHTML = `<div class="glueful-gmail-modal" role="dialog" aria-modal="true" aria-label="Gmail integration"><h3>Gmail integration</h3><p id="glueful-gmail-copy">Checking Gmail connection…</p><div id="glueful-gmail-accounts"></div><div class="glueful-gmail-actions" style="margin-top:14px"><button class="glueful-gmail-btn" id="glueful-gmail-primary">Connect Gmail</button><button class="glueful-gmail-btn secondary" id="glueful-gmail-sync" style="display:none">Sync all now</button><button class="glueful-gmail-btn secondary" id="glueful-gmail-close">Close</button></div><div class="glueful-gmail-status" id="glueful-gmail-status"></div></div>`;
    document.body.appendChild(backdrop); backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
    document.getElementById("glueful-gmail-close").onclick = closeModal; document.getElementById("glueful-gmail-primary").onclick = () => connectOrDisconnect(); document.getElementById("glueful-gmail-sync").onclick = () => syncNow(true);
    renderModalState(); loadStatus();
  }
  function openIntegration() { openModal(); }
  function updateSettingsRows() {
    const rows = [...document.querySelectorAll("button.settings-item, .profile-row")]; const list = connectionList();
    rows.forEach(row => { const text = (row.textContent || "").toLowerCase(); if (!text.includes("gmail integration") && !text.includes("connected services")) return; if (row.classList.contains("settings-item")) { row.onclick = openIntegration; const status = row.querySelector(".settings-status"); if (status) status.textContent = list.length ? `Connected · ${list.length} account${list.length === 1 ? "" : "s"}` : "Not connected"; } else row.onclick = openIntegration; });
  }
  function findGmailClickable(start) {
    let node = start instanceof Element ? start : start?.parentElement;
    while (node && node !== document.body) { if (node.closest(".glueful-gmail-modal-backdrop")) return null; const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase(); if (text.includes("gmail integration") && text.length <= 320) { const clickable = node.matches("button, a, [role='button'], [onclick], .settings-item, .profile-row") || typeof node.onclick === "function" || node.tabIndex >= 0; if (clickable) return node; } node = node.parentElement; } return null;
  }
  function installGmailClickInterceptor() {
    if (document.documentElement.dataset.gluefulGmailInterceptor === "7") return; document.documentElement.dataset.gluefulGmailInterceptor = "7";
    document.addEventListener("click", function (event) { if (event.target instanceof Element && event.target.closest(".glueful-gmail-modal-backdrop")) return; const row = findGmailClickable(event.target); if (!row) return; event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); openIntegration(); }, true);
  }
  function install() { if (!getClient()) { setTimeout(install, 1200); return; } ensureDashboardSyncButton(); installGmailClickInterceptor(); updateSettingsRows(); void loadStatus(); }
  window.openGmailIntegration = openIntegration; window.gluefulGmailSync = syncNow; window.addEventListener("focus", handleAppReturn); document.addEventListener("visibilitychange", () => { if (!document.hidden) handleAppReturn(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true }); else install();
})();
