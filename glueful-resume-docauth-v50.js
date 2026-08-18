/*
 * Glueful V50 — Nutrient Document Authoring bridge
 *
 * This companion module replaces the fragile contenteditable/PDF-text reconstruction
 * with a page-based DOCX authoring engine.
 *
 * Nutrient Document Authoring is used because it is specifically designed as a
 * Word/Google-Docs-like WYSIWYG editor and supports DOCX import/export with
 * page-based layout, images, tables, headers and other Word structures.
 *
 * The npm package is loaded through jsDelivr here so the current Glueful project
 * can remain a static GitHub Pages application. For production, pin/self-host the
 * package assets after licensing rather than relying on a public CDN.
 */

const GLUEFUL_DOCAUTH_VERSION = "1.12.0";
const GLUEFUL_DOCAUTH_MODULE =
  `https://cdn.jsdelivr.net/npm/@nutrient-sdk/document-authoring@${GLUEFUL_DOCAUTH_VERSION}/+esm`;

let gluefulDocAuthSystem = null;
let gluefulDocAuthEditor = null;
let gluefulDocAuthDocument = null;
let gluefulDocAuthTextCache = "";
let gluefulDocAuthTextRefreshInFlight = null;

function gluefulDocAuthHost() {
  return document.getElementById("glueful-docauth-editor");
}

async function gluefulDocAuthLoadModule() {
  if (window.__gluefulDocAuthModulePromise) {
    return window.__gluefulDocAuthModulePromise;
  }

  window.__gluefulDocAuthModulePromise = import(GLUEFUL_DOCAUTH_MODULE).then((mod) => {
    if (!mod || typeof mod.createDocAuthSystem !== "function") {
      throw new Error("The Document Authoring SDK did not expose createDocAuthSystem().");
    }
    return mod;
  });

  return window.__gluefulDocAuthModulePromise;
}

async function gluefulDocAuthEnsureSystem() {
  if (gluefulDocAuthSystem) return gluefulDocAuthSystem;

  const mod = await gluefulDocAuthLoadModule();
  gluefulDocAuthSystem = await mod.createDocAuthSystem({
    // Keep the system reusable across multiple Resume Studio opens.
  });

  return gluefulDocAuthSystem;
}

async function gluefulDocAuthRefreshTextCache() {
  if (!gluefulDocAuthEditor) return gluefulDocAuthTextCache;
  if (gluefulDocAuthTextRefreshInFlight) return gluefulDocAuthTextRefreshInFlight;

  gluefulDocAuthTextRefreshInFlight = (async () => {
    try {
      const current = gluefulDocAuthEditor.currentDocument();
      const docx = await current.exportDOCX();

      if (window.mammoth) {
        const result = await window.mammoth.extractRawText({ arrayBuffer: docx });
        gluefulDocAuthTextCache = String(result?.value || "").trim();
      } else {
        gluefulDocAuthTextCache = "";
      }
    } catch (error) {
      console.warn("[Glueful V50] text-cache refresh failed:", error);
    } finally {
      gluefulDocAuthTextRefreshInFlight = null;
    }
    return gluefulDocAuthTextCache;
  })();

  return gluefulDocAuthTextRefreshInFlight;
}

async function gluefulDocAuthOpenDocx(host, docxBuffer) {
  if (!host) throw new Error("The Word editor host is missing.");
  if (!(docxBuffer instanceof ArrayBuffer)) {
    throw new Error("The Word document data is invalid.");
  }

  const system = await gluefulDocAuthEnsureSystem();

  if (gluefulDocAuthEditor) {
    try {
      gluefulDocAuthEditor.destroy?.();
    } catch (error) {
      console.warn("[Glueful V50] previous editor cleanup failed:", error);
    }
    gluefulDocAuthEditor = null;
  }

  host.replaceChildren();

  // Nutrient supports importing DOCX directly from an ArrayBuffer/Blob input.
  gluefulDocAuthDocument = await system.importDOCX(docxBuffer);

  gluefulDocAuthEditor = await system.createEditor(host, {
    document: gluefulDocAuthDocument,
  });

  gluefulDocAuthTextCache = "";
  await gluefulDocAuthRefreshTextCache();

  return gluefulDocAuthEditor;
}

async function gluefulDocAuthExportDocx() {
  if (!gluefulDocAuthEditor) throw new Error("The Word editor is not open.");
  return await gluefulDocAuthEditor.currentDocument().exportDOCX();
}

async function gluefulDocAuthExportPdf() {
  if (!gluefulDocAuthEditor) throw new Error("The Word editor is not open.");
  return await gluefulDocAuthEditor.currentDocument().exportPDF();
}

async function gluefulDocAuthRefreshText() {
  return await gluefulDocAuthRefreshTextCache();
}

async function gluefulDocAuthDestroy() {
  try {
    gluefulDocAuthEditor?.destroy?.();
  } catch (error) {
    console.warn("[Glueful V50] editor destroy failed:", error);
  }

  gluefulDocAuthEditor = null;
  gluefulDocAuthDocument = null;
  gluefulDocAuthTextCache = "";
}

window.gluefulDocAuth = {
  version: GLUEFUL_DOCAUTH_VERSION,
  openDocx: gluefulDocAuthOpenDocx,
  exportDocx: gluefulDocAuthExportDocx,
  exportPdf: gluefulDocAuthExportPdf,
  getText: () => gluefulDocAuthTextCache,
  refreshText: gluefulDocAuthRefreshText,
  destroy: gluefulDocAuthDestroy,
  get editor() {
    return gluefulDocAuthEditor;
  },
};

window.dispatchEvent(new CustomEvent("glueful:docauth-ready", {
  detail: { version: GLUEFUL_DOCAUTH_VERSION },
}));
