/* Glueful Gmail integration v6: automatic sync + dashboard control. */
(function () {
  "use strict";
  const FUNCTION_URL = (window.SUPABASE_URL || "https://xztbhheexianejsvwpva.supabase.co") + "/functions/v1/gmail-application-capture";
  const AUTO_SYNC_MS = 15 * 60 * 1000;
  let gmailStatus = { connected: false, connection: null };
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
  async function callGmail(action) {
    const session = await getSession();
    if (!session?.access_token) throw new Error("Please sign in to Glueful first.");
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action })
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
      .glueful-gmail-modal-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,6,12,.72);backdrop-filter:blur(12px)}
      .glueful-gmail-modal{width:min(460px,100%);border:1px solid rgba(255,255,255,.10);border-radius:24px;padding:24px;background:#101521;color:#fff;box-shadow:0 24px 80px rgba(0,0,0,.45);font-family:Inter,system-ui,sans-serif}
      .glueful-gmail-modal h3{margin:0 0 8px;font-size:21px}.glueful-gmail-modal p{margin:0 0 18px;color:#aeb7c8;line-height:1.55;font-size:14px}
      .glueful-gmail-actions{display:flex;gap:10px;flex-wrap:wrap}.glueful-gmail-btn{border:0;border-radius:13px;padding:12px 16px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#7b36ff,#286dff);color:#fff}.glueful-gmail-btn.secondary{background:rgba(255,255,255,.08);color:#dce3f2}.glueful-gmail-status{font-size:12px;color:#8d9ab0;margin-top:12px;min-height:18px}
      #glueful-dashboard-gmail-sync{position:fixed;right:18px;bottom:18px;z-index:9000;border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:9px 13px;background:rgba(16,21,33,.94);color:#dce3f2;font:600 12px Inter,system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.28);cursor:pointer;backdrop-filter:blur(10px);display:none}
      #glueful-dashboard-gmail-sync.syncing{opacity:.65;cursor:wait}
      /* Dashboard is intentionally free of background ingestion telemetry. */
      .ingestion-monitor-card{display:none !important}
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
    button.classList.toggle("syncing", syncInFlight);
    button.disabled = syncInFlight;
  }
  function ensureDashboardSyncButton() {
    ensureStyles();
    let button = document.getElementById("glueful-dashboard-gmail-sync");
    if (!button) {
      button = document.createElement("button");
      button.id = "glueful-dashboard-gmail-sync";
      button.type = "button";
      button.setAttribute("aria-label", "Sync Gmail applications");
      button.addEventListener("click", () => syncNow(true));
      document.body.appendChild(button);
    }
    updateDashboardSyncButton();
  }
  function renderModalState() {
    const primary = document.getElementById("glueful-gmail-primary");
    const sync = document.getElementById("glueful-gmail-sync");
    const copy = document.getElementById("glueful-gmail-copy");
    if (!primary || !sync || !copy) return;
    if (gmailStatus.connected) {
      primary.textContent = "Disconnect Gmail";
      sync.style.display = "inline-block";
      copy.textContent = `Connected${gmailStatus.connection?.gmail_email ? ` to ${gmailStatus.connection.gmail_email}` : ""}. Glueful automatically checks recent application emails.`;
    } else {
      primary.textContent = "Connect Gmail";
      sync.style.display = "none";
      copy.textContent = "Connect Gmail so Glueful can detect job application confirmation emails from LinkedIn, company career sites, ATS platforms, job portals, and other sources. Gmail access is read-only.";
    }
    updateDashboardSyncButton();
  }
  async function loadStatus() {
    try {
      gmailStatus = await callGmail("status");
      updateSettingsRows();
      renderModalState();
      ensureDashboardSyncButton();
      configureAutoSync();
      return gmailStatus;
    } catch (error) {
      console.warn("[Glueful] Gmail status unavailable:", error.message || error);
      updateDashboardSyncButton();
      return gmailStatus;
    }
  }
  async function connectOrDisconnect() {
    setStatus(gmailStatus.connected ? "Disconnecting…" : "Opening Google…");
    try {
      if (gmailStatus.connected) {
        await callGmail("disconnect");
        gmailStatus = { connected: false, connection: null };
        stopAutoSync();
        updateSettingsRows();
        renderModalState();
        setStatus("Gmail disconnected.");
        return;
      }
      const data = await callGmail("authorize");
      if (!data.authorization_url) throw new Error("Google authorization URL was not returned.");
      window.location.href = data.authorization_url;
    } catch (error) { setStatus(error.message || "Unable to connect Gmail."); }
  }
  async function syncNow(showModalStatus = false) {
    if (syncInFlight || !gmailStatus.connected) return null;
    syncInFlight = true;
    updateDashboardSyncButton();
    if (showModalStatus) setStatus("Checking Gmail…");
    try {
      const result = await callGmail("sync");
      await loadStatus();
      const imported = Number(result?.imported || 0);
      if (showModalStatus) setStatus(`Gmail sync complete: ${imported} new application${imported === 1 ? "" : "s"}.`);
      if (imported && typeof window.renderApplications === "function") { try { window.renderApplications(); } catch (_) {} }
      return result;
    } catch (error) {
      console.warn("[Glueful] Gmail sync failed:", error.message || error);
      if (showModalStatus) setStatus(error.message || "Gmail sync failed.");
      return null;
    } finally { syncInFlight = false; updateDashboardSyncButton(); }
  }
  function stopAutoSync() { if (autoSyncTimer) clearInterval(autoSyncTimer); autoSyncTimer = null; }
  function configureAutoSync() {
    stopAutoSync();
    if (!gmailStatus.connected) return;
    autoSyncTimer = setInterval(() => syncNow(false), AUTO_SYNC_MS);
  }
  function handleAppReturn() { if (gmailStatus.connected) void syncNow(false); }
  function openModal() {
    ensureStyles(); closeModal();
    const backdrop = document.createElement("div");
    backdrop.className = "glueful-gmail-modal-backdrop";
    backdrop.innerHTML = `
      <div class="glueful-gmail-modal" role="dialog" aria-modal="true" aria-label="Gmail integration">
        <h3>Gmail integration</h3><p id="glueful-gmail-copy">Checking Gmail connection…</p>
        <div class="glueful-gmail-actions">
          <button class="glueful-gmail-btn" id="glueful-gmail-primary">Connect Gmail</button>
          <button class="glueful-gmail-btn secondary" id="glueful-gmail-sync" style="display:none">Sync now</button>
          <button class="glueful-gmail-btn secondary" id="glueful-gmail-close">Close</button>
        </div><div class="glueful-gmail-status" id="glueful-gmail-status"></div>
      </div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
    document.getElementById("glueful-gmail-close").onclick = closeModal;
    document.getElementById("glueful-gmail-primary").onclick = () => connectOrDisconnect();
    document.getElementById("glueful-gmail-sync").onclick = () => syncNow(true);
    renderModalState();
  }
  function openIntegration() { openModal(); loadStatus(); }
  function updateSettingsRows() {
    const rows = [...document.querySelectorAll("button.settings-item, .profile-row")];
    rows.forEach(row => {
      const text = (row.textContent || "").toLowerCase();
      if (!text.includes("gmail integration") && !text.includes("connected services")) return;
      if (row.classList.contains("settings-item")) {
        row.onclick = openIntegration;
        const status = row.querySelector(".settings-status");
        if (status) status.textContent = gmailStatus.connected ? `Connected${gmailStatus.connection?.gmail_email ? ` · ${gmailStatus.connection.gmail_email}` : ""}` : "Not connected";
      } else row.onclick = openIntegration;
    });
  }
  function findGmailClickable(start) {
    let node = start instanceof Element ? start : start?.parentElement;
    while (node && node !== document.body) {
      if (node.closest(".glueful-gmail-modal-backdrop")) return null;
      const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (text.includes("gmail integration") && text.length <= 320) {
        const clickable = node.matches("button, a, [role='button'], [onclick], .settings-item, .profile-row") || typeof node.onclick === "function" || node.tabIndex >= 0;
        if (clickable) return node;
      }
      node = node.parentElement;
    }
    return null;
  }
  function installGmailClickInterceptor() {
    if (document.documentElement.dataset.gluefulGmailInterceptor === "6") return;
    document.documentElement.dataset.gluefulGmailInterceptor = "6";
    document.addEventListener("click", function (event) {
      if (event.target instanceof Element && event.target.closest(".glueful-gmail-modal-backdrop")) return;
      const row = findGmailClickable(event.target);
      if (!row) return;
      event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); openIntegration();
    }, true);
  }
  function install() {
    if (!getClient()) { setTimeout(install, 1200); return; }
    ensureDashboardSyncButton(); installGmailClickInterceptor(); updateSettingsRows(); void loadStatus();
  }
  window.openGmailIntegration = openIntegration;
  window.gluefulGmailSync = syncNow;
  window.addEventListener("focus", handleAppReturn);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) handleAppReturn(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true }); else install();
})();
