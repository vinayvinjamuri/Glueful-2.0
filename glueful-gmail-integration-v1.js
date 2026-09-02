/* Glueful Gmail integration v11: single authoritative Gmail entry point. */
(function () {
  "use strict";
  const FUNCTION_URL = (window.SUPABASE_URL || "https://xztbhheexianejsvwpva.supabase.co") + "/functions/v1/gmail-application-capture";
  const AUTO_SYNC_MS = 15 * 60 * 1000;
  let gmailStatus = { connected: false, connections: [] };
  let autoSyncTimer = null;
  let syncInFlight = false;

  function client() { return window.supabaseClient || null; }
  async function session() { const c = client(); if (!c?.auth) return null; return (await c.auth.getSession()).data?.session || null; }
  async function callGmail(action, extra = {}) {
    const s = await session();
    if (!s?.access_token) throw new Error("Please sign in to Glueful first.");
    const r = await fetch(FUNCTION_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.access_token}` }, body: JSON.stringify({ action, ...extra }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.error) throw new Error(d?.error || `Gmail request failed (${r.status})`);
    return d;
  }
  function ensureStyles() {
    if (document.getElementById("glueful-gmail-style")) return;
    const s = document.createElement("style"); s.id = "glueful-gmail-style";
    s.textContent = `
      .glueful-gmail-modal-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,6,12,.72);backdrop-filter:blur(12px);overflow:auto}
      .glueful-gmail-modal{width:min(560px,100%);max-height:calc(100vh - 40px);overflow:auto;border:1px solid rgba(255,255,255,.10);border-radius:24px;padding:24px;background:#101521;color:#fff;box-shadow:0 24px 80px rgba(0,0,0,.45);font-family:Inter,system-ui,sans-serif}
      .glueful-gmail-modal h3{margin:0 0 8px;font-size:21px}.glueful-gmail-modal p{margin:0 0 18px;color:#aeb7c8;line-height:1.55;font-size:14px}
      .glueful-gmail-actions{display:flex;gap:10px;flex-wrap:wrap}.glueful-gmail-btn{border:0;border-radius:13px;padding:12px 16px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#7b36ff,#286dff);color:#fff}.glueful-gmail-btn.secondary{background:rgba(255,255,255,.08);color:#dce3f2}.glueful-gmail-btn.danger{background:transparent;border:1px solid rgba(255,90,90,.55);color:#ff7777}.glueful-gmail-status{font-size:12px;color:#8d9ab0;margin-top:12px;min-height:18px}
      .glueful-gmail-section-label{font-size:11px;font-weight:800;letter-spacing:.12em;color:#8d9ab0;margin:22px 0 9px;text-transform:uppercase}.glueful-gmail-account{border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.035);padding:14px;margin-bottom:10px}.glueful-gmail-account-head{display:flex;align-items:center;gap:12px}.glueful-gmail-logo{width:38px;height:38px;border-radius:10px;background:#fff;display:grid;place-items:center;flex:0 0 auto}.glueful-gmail-logo svg{width:25px;height:25px}.glueful-gmail-account-main{min-width:0;flex:1}.glueful-gmail-email{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.glueful-gmail-meta{font-size:12px;color:#8d9ab0;margin-top:3px}.glueful-gmail-pill{font-size:11px;font-weight:800;color:#72e6b0;background:rgba(45,190,120,.13);padding:6px 9px;border-radius:999px;white-space:nowrap}.glueful-gmail-account-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.glueful-gmail-account-actions button{border:0;border-radius:11px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#7b36ff,#286dff);color:#fff}.glueful-gmail-account-actions button.danger{background:transparent;border:1px solid rgba(255,90,90,.45);color:#ff7777}.glueful-gmail-add{width:100%;text-align:left;border:1px dashed rgba(255,255,255,.18);border-radius:14px;padding:14px;background:transparent;color:#dce3f2;font-weight:700;cursor:pointer}.glueful-gmail-add span{font-size:20px;vertical-align:-2px;margin-right:9px}.glueful-gmail-empty{padding:16px;border:1px dashed rgba(255,255,255,.14);border-radius:14px;color:#8d9ab0;font-size:13px}
      #glueful-dashboard-gmail-sync{position:static;right:auto;bottom:auto;z-index:auto;border:1px solid rgba(255,255,255,.12);border-radius:13px;padding:9px 13px;background:rgba(16,21,33,.94);color:#dce3f2;font:600 12px Inter,system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.28);cursor:pointer;display:none;width:max-content}.ingestion-monitor-card{display:none!important}
    `; document.head.appendChild(s);
  }
  function closeModal() { document.querySelector(".glueful-gmail-modal-backdrop")?.remove(); }
  function statusText(t) { const n = document.getElementById("glueful-gmail-status"); if (n) n.textContent = t || ""; }
  function list() { return Array.isArray(gmailStatus.connections) ? gmailStatus.connections : []; }
  function icon() { return `<svg viewBox="0 0 24 24"><path fill="#EA4335" d="M3 6.8 12 13l9-6.2V19H3z"/><path fill="#4285F4" d="M3 5h3v14H3z"/><path fill="#34A853" d="M18 5h3v14h-3z"/><path fill="#FBBC04" d="M3 5h3l6 4.2L18 5h3l-9 6.2z"/></svg>`; }
  function fmt(v) { if (!v) return "Not synced yet"; try { return `Last synced: ${new Date(v).toLocaleString([], { dateStyle:"medium", timeStyle:"short" })}`; } catch (_) { return "Last synced recently"; } }
  function esc(v) { return String(v ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
  function render() {
    const copy = document.getElementById("glueful-gmail-copy"), accounts = document.getElementById("glueful-gmail-accounts"), all = document.getElementById("glueful-gmail-sync"), primary = document.getElementById("glueful-gmail-primary");
    if (!copy || !accounts || !all || !primary) return;
    const rows = list();
    if (!rows.length) { primary.style.display="inline-block"; all.style.display="none"; copy.textContent="Connect Gmail so Glueful can detect job application confirmation emails. Gmail access is read-only."; accounts.innerHTML=`<div class="glueful-gmail-empty">No Gmail account connected.</div>`; return; }
    primary.style.display="none"; all.style.display="inline-block"; copy.textContent="Glueful automatically checks recent application emails from your connected accounts.";
    accounts.innerHTML=`<div class="glueful-gmail-section-label">Connected account${rows.length===1?"":"s"}</div>${rows.map(c=>`<div class="glueful-gmail-account"><div class="glueful-gmail-account-head"><div class="glueful-gmail-logo">${icon()}</div><div class="glueful-gmail-account-main"><div class="glueful-gmail-email">${esc(c.gmail_email||"Gmail account")}</div><div class="glueful-gmail-meta">${esc(fmt(c.last_synced_at))}</div></div><span class="glueful-gmail-pill">Connected</span></div><div class="glueful-gmail-account-actions"><button type="button" data-gmail-sync="${esc(c.id)}">↻ Sync now</button><button type="button" class="danger" data-gmail-disconnect="${esc(c.id)}">Disconnect</button></div></div>`).join("")}<div class="glueful-gmail-section-label">Add another account</div><button type="button" class="glueful-gmail-add" id="glueful-gmail-add"><span>＋</span>Integrate another Gmail</button>`;
    accounts.querySelectorAll("[data-gmail-sync]").forEach(b=>b.addEventListener("click",()=>syncNow(true,b.dataset.gmailSync))); accounts.querySelectorAll("[data-gmail-disconnect]").forEach(b=>b.addEventListener("click",()=>disconnect(b.dataset.gmailDisconnect))); document.getElementById("glueful-gmail-add")?.addEventListener("click",connectAnother);
  }
  async function loadStatus() { try { gmailStatus=await callGmail("status"); render(); updateDashboardButton(); configureAutoSync(); bindSettingsEntries(); } catch(e) { console.warn("[Glueful] Gmail status:",e.message||e); } }
  async function connectAnother() { statusText("Opening Google account picker…"); try { const d=await callGmail("authorize"); if(!d.authorization_url) throw new Error("Google authorization URL was not returned."); window.location.href=d.authorization_url; } catch(e) { statusText(e.message||"Unable to connect Gmail."); } }
  async function disconnect(id) { const c=list().find(x=>x.id===id); if(!c) return; if(!window.confirm(`Disconnect ${c.gmail_email||"this Gmail account"}?`)) return; statusText("Disconnecting…"); try { await callGmail("disconnect",{connection_id:id}); await loadStatus(); statusText("Gmail account disconnected."); } catch(e) { statusText(e.message||"Unable to disconnect Gmail."); } }
  async function syncNow(show=false,id=null) { if(syncInFlight||!gmailStatus.connected) return; syncInFlight=true; updateDashboardButton(); if(show) statusText("Checking Gmail…"); try { const d=await callGmail("sync",id?{connection_id:id}:{}); await loadStatus(); if(show) statusText(`Gmail sync complete: ${Number(d?.imported||0)} new application${Number(d?.imported||0)===1?"":"s"}.`); if(d?.imported&&typeof window.renderApplications==="function") window.renderApplications(); } catch(e) { if(show) statusText(e.message||"Gmail sync failed."); } finally { syncInFlight=false; updateDashboardButton(); } }
  function configureAutoSync() { if(autoSyncTimer) clearInterval(autoSyncTimer); autoSyncTimer=gmailStatus.connected?setInterval(()=>syncNow(false),AUTO_SYNC_MS):null; }
  function updateDashboardButton() { const b=document.getElementById("glueful-dashboard-gmail-sync"); if(!b) return; b.style.display=gmailStatus.connected?"block":"none"; b.textContent=syncInFlight?"Syncing Gmail…":"Sync Gmail"; b.disabled=syncInFlight; }
  function dashboardHost() { return document.querySelector("#view-dashboard .view-header") || document.getElementById("view-dashboard"); }
  function ensureDashboardButton() { ensureStyles(); const existing=document.getElementById("glueful-dashboard-gmail-sync"); if(existing){updateDashboardButton();return;} const host=dashboardHost(); if(!host){setTimeout(ensureDashboardButton,1200);return;} const b=document.createElement("button"); b.id="glueful-dashboard-gmail-sync"; b.type="button"; b.textContent="Sync Gmail"; b.onclick=()=>syncNow(true); host.appendChild(b); updateDashboardButton(); }
  function openModal() { ensureStyles(); closeModal(); const back=document.createElement("div"); back.className="glueful-gmail-modal-backdrop"; back.innerHTML=`<div class="glueful-gmail-modal" role="dialog" aria-modal="true" aria-label="Gmail integration"><h3>Gmail integration</h3><p id="glueful-gmail-copy">Checking Gmail connection…</p><div id="glueful-gmail-accounts"></div><div class="glueful-gmail-actions" style="margin-top:14px"><button class="glueful-gmail-btn" id="glueful-gmail-primary">Connect Gmail</button><button class="glueful-gmail-btn secondary" id="glueful-gmail-sync" style="display:none">Sync all now</button><button class="glueful-gmail-btn secondary" id="glueful-gmail-close">Close</button></div><div class="glueful-gmail-status" id="glueful-gmail-status"></div></div>`; document.body.appendChild(back); back.addEventListener("click",e=>{if(e.target===back)closeModal();}); document.getElementById("glueful-gmail-close").onclick=closeModal; document.getElementById("glueful-gmail-primary").onclick=connectAnother; document.getElementById("glueful-gmail-sync").onclick=()=>syncNow(true); render(); loadStatus(); }
  function normalizeText(v) { return String(v||"").replace(/\s+/g," ").trim().toLowerCase(); }
  function isGmailEntry(node) { if (!(node instanceof Element)) return false; if (node.closest(".glueful-gmail-modal-backdrop")) return false; const text=normalizeText(node.textContent); return text==="connected services" || text==="gmail integration"; }
  function bindSettingsEntries(root=document) {
    const nodes=[];
    if(root instanceof Element && isGmailEntry(root)) nodes.push(root);
    root.querySelectorAll?.("*").forEach(node=>{if(isGmailEntry(node)) nodes.push(node);});
    nodes.forEach(row=>{
      if(row.dataset.gluefulGmailEntryBound==="1") return;
      row.dataset.gluefulGmailEntryBound="1";
      row.style.cursor="pointer";
      row.onclick=function(event){ event.preventDefault(); event.stopPropagation(); openModal(); };
    });
  }
  function installEntryObserver() {
    bindSettingsEntries(document);
    if(window.__gluefulGmailEntryObserver) return;
    window.__gluefulGmailEntryObserver=new MutationObserver(function(mutations){
      mutations.forEach(function(m){m.addedNodes.forEach(function(node){if(node.nodeType===1) bindSettingsEntries(node);});});
    });
    if(document.body) window.__gluefulGmailEntryObserver.observe(document.body,{childList:true,subtree:true});
  }
  function install() { if(!client()){setTimeout(install,1200);return;} ensureDashboardButton(); installEntryObserver(); loadStatus(); }
  window.openGmailIntegration=openModal; window.gluefulGmailSync=syncNow;
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install,{once:true}); else install();
})();
