/* Glueful Gmail integration v2 */
(function () {
  "use strict";

  const FUNCTION_URL = (window.SUPABASE_URL || "https://xztbhheexianejsvwpva.supabase.co") + "/functions/v1/gmail-application-capture";
  let gmailStatus = { connected: false, connection: null };
  let syncTimer = null;

  function getClient() { return window.supabaseClient || null; }

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
    `;
    document.head.appendChild(style);
  }

  function closeModal() { document.querySelector(".glueful-gmail-modal-backdrop")?.remove(); }

  function setStatus(text) {
    const node = document.getElementById("glueful-gmail-status");
    if (node) node.textContent = text || "";
  }

  function renderModalState() {
    const primary = document.getElementById("glueful-gmail-primary");
    const sync = document.getElementById("glueful-gmail-sync");
    const copy = document.getElementById("glueful-gmail-copy");
    if (!primary || !sync || !copy) return;
    if (gmailStatus.connected) {
      primary.textContent = "Disconnect Gmail";
      sync.style.display = "inline-block";
      copy.textContent = `Connected${gmailStatus.connection?.gmail_email ? ` to ${gmailStatus.connection.gmail_email}` : ""}. Glueful checks recent Gmail messages for LinkedIn application confirmations.`;
    } else {
      primary.textContent = "Connect Gmail";
      sync.style.display = "none";
      copy.textContent = "Connect Gmail so Glueful can detect LinkedIn application confirmation emails and add mobile applications automatically. Gmail access is read-only.";
    }
  }

  async function loadStatus() {
    try {
      gmailStatus = await callGmail("status");
      updateSettingsRows();
      renderModalState();
      return gmailStatus;
    } catch (error) {
      console.warn("[Glueful] Gmail status unavailable:", error.message || error);
      return gmailStatus;
    }
  }

  async function connectOrDisconnect() {
    setStatus(gmailStatus.connected ? "Disconnecting…" : "Opening Google…");
    try {
      if (gmailStatus.connected) {
        await callGmail("disconnect");
        gmailStatus = { connected: false, connection: null };
        updateSettingsRows();
        renderModalState();
        setStatus("Gmail disconnected.");
        return;
      }
      const data = await callGmail("authorize");
      if (!data.authorization_url) throw new Error("Google authorization URL was not returned.");
      window.location.href = data.authorization_url;
    } catch (error) {
      setStatus(error.message || "Unable to connect Gmail.");
    }
  }

  async function syncNow() {
    setStatus("Checking Gmail…");
    try {
      const result = await callGmail("sync");
      await loadStatus();
      setStatus(`Gmail sync complete: ${result.imported || 0} new application${result.imported === 1 ? "" : "s"}.`);
      if (result?.imported && typeof window.renderApplications === "function") {
        try { window.renderApplications(); } catch (_) {}
      }
    } catch (error) {
      setStatus(error.message || "Gmail sync failed.");
    }
  }

  function openModal() {
    ensureStyles();
    closeModal();
    const backdrop = document.createElement("div");
    backdrop.className = "glueful-gmail-modal-backdrop";
    backdrop.innerHTML = `
      <div class="glueful-gmail-modal" role="dialog" aria-modal="true" aria-label="Gmail integration">
        <h3>Gmail integration</h3>
        <p id="glueful-gmail-copy">Connect Gmail so Glueful can detect LinkedIn application confirmation emails and add mobile applications automatically. Gmail access is read-only.</p>
        <div class="glueful-gmail-actions">
          <button class="glueful-gmail-btn" id="glueful-gmail-primary">Connect Gmail</button>
          <button class="glueful-gmail-btn secondary" id="glueful-gmail-sync" style="display:none">Sync now</button>
          <button class="glueful-gmail-btn secondary" id="glueful-gmail-close">Close</button>
        </div>
        <div class="glueful-gmail-status" id="glueful-gmail-status"></div>
      </div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
    document.getElementById("glueful-gmail-close").onclick = closeModal;
    document.getElementById("glueful-gmail-primary").onclick = connectOrDisconnect;
    document.getElementById("glueful-gmail-sync").onclick = syncNow;
    renderModalState();
  }

  function openIntegration() { loadStatus().finally(openModal); }

  function updateSettingsRows() {
    const rows = [...document.querySelectorAll("button.settings-item, .profile-row")];
    rows.forEach(row => {
      const text = (row.textContent || "").toLowerCase();
      if (!text.includes("gmail integration") && !text.includes("connected services")) return;
      if (row.classList.contains("settings-item")) {
        row.onclick = openIntegration;
        const status = row.querySelector(".settings-status");
        if (status) status.textContent = gmailStatus.connected ? `Connected${gmailStatus.connection?.gmail_email ? ` · ${gmailStatus.connection.gmail_email}` : ""}` : "Not connected";
      } else {
        row.onclick = openIntegration;
      }
    });
  }

  /*
   * The original Settings page owns the Gmail row and may attach an onclick
   * handler that calls showComingSoon() from a private closure. Replacing the
   * global function cannot intercept that closure. Capture-phase delegation
   * runs before normal bubbling handlers, so Gmail always opens our integration.
   */
  function installGmailClickInterceptor() {
    if (document.documentElement.dataset.gluefulGmailInterceptor === "1") return;
    document.documentElement.dataset.gluefulGmailInterceptor = "1";

    document.addEventListener("click", function (event) {
      const target = event.target instanceof Element ? event.target : event.target?.parentElement;
      if (!target) return;

      const row = target.closest("button.settings-item, .profile-row");
      if (!row) return;

      const text = (row.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (!text.includes("gmail integration")) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openIntegration();
    }, true);
  }

  async function autoSync() {
    try {
      const status = await loadStatus();
      if (status?.connected) {
        const result = await callGmail("sync");
        if (result?.imported && typeof window.renderApplications === "function") {
          try { window.renderApplications(); } catch (_) {}
        }
      }
    } catch (error) {
      console.warn("[Glueful] Gmail auto-sync skipped:", error.message || error);
    }
  }

  function install() {
    if (!getClient()) {
      setTimeout(install, 1200);
      return;
    }
    installGmailClickInterceptor();
    updateSettingsRows();
    const observer = new MutationObserver(() => updateSettingsRows());
    observer.observe(document.body, { childList: true, subtree: true });
    autoSync();
    document.addEventListener("visibilitychange", () => { if (!document.hidden) autoSync(); });
    window.addEventListener("focus", autoSync);
    if (syncTimer) clearInterval(syncTimer);
    syncTimer = setInterval(autoSync, 15 * 60 * 1000);
  }

  window.openGmailIntegration = openIntegration;
  window.gluefulGmailSync = syncNow;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();