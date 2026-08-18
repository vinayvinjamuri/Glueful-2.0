/*
 * Glueful V51 — lightweight Word-style resume authoring bridge
 *
 * The previous V50 bridge used Nutrient Document Authoring. That SDK is
 * trial-watermarked unless a commercial license is supplied. Glueful now
 * keeps Adobe PDF Services for high-fidelity PDF -> DOCX conversion, but
 * uses a native contenteditable document surface for editing so there is
 * no third-party editor watermark or editor license dependency.
 */

const GLUEFUL_DOCAUTH_VERSION = "1.0.0-native";

let gluefulDocAuthEditor = null;
let gluefulDocAuthTextCache = "";
let gluefulDocAuthTextRefreshInFlight = null;

function gluefulDocAuthHost() {
  return document.getElementById("glueful-docauth-editor");
}

function gluefulDocAuthInstallStyles() {
  if (document.getElementById("glueful-native-docauth-style")) return;

  const style = document.createElement("style");
  style.id = "glueful-native-docauth-style";
  style.textContent = `
    #glueful-docauth-editor {
      position: relative;
      width: 100%;
      height: min(78vh, 980px);
      min-height: 520px;
      overflow: auto !important;
      box-sizing: border-box;
      padding: 32px;
      background: #20242d;
      border-radius: 12px;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }

    #glueful-docauth-editor .glueful-native-document-wrap {
      width: max-content;
      min-width: 100%;
      display: flex;
      justify-content: center;
      box-sizing: border-box;
    }

    #glueful-docauth-editor .glueful-native-page {
      flex: 0 0 auto;
      width: 794px;
      min-height: 1123px;
      box-sizing: border-box;
      padding: 72px;
      background: #fff;
      color: #111;
      box-shadow: 0 8px 32px rgba(0,0,0,.32);
      overflow: visible;
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.25;
    }

    #glueful-docauth-editor .glueful-native-page[contenteditable="true"] {
      outline: none;
    }

    #glueful-docauth-editor .glueful-native-page p {
      margin: 0 0 8px;
    }

    #glueful-docauth-editor .glueful-native-page h1,
    #glueful-docauth-editor .glueful-native-page h2,
    #glueful-docauth-editor .glueful-native-page h3 {
      margin-top: 10px;
      margin-bottom: 8px;
    }

    #glueful-docauth-editor .glueful-native-page ul,
    #glueful-docauth-editor .glueful-native-page ol {
      margin-top: 4px;
      margin-bottom: 8px;
      padding-left: 24px;
    }

    #glueful-docauth-editor .glueful-native-loading,
    #glueful-docauth-editor .glueful-native-error {
      padding: 40px;
      color: #cbd5e1;
      text-align: center;
      font-family: Inter, Arial, sans-serif;
    }

    @media (max-width: 760px) {
      #glueful-docauth-editor {
        height: 70vh;
        min-height: 420px;
        padding: 16px;
      }
    }
  `;
  document.head.appendChild(style);
}

function gluefulDocAuthTextFromEditor() {
  if (!gluefulDocAuthEditor) return gluefulDocAuthTextCache;
  const page = gluefulDocAuthEditor.querySelector(".glueful-native-page");
  return String(page?.innerText || "").trim();
}

async function gluefulDocAuthRefreshTextCache() {
  if (!gluefulDocAuthEditor) return gluefulDocAuthTextCache;
  if (gluefulDocAuthTextRefreshInFlight) return gluefulDocAuthTextRefreshInFlight;

  gluefulDocAuthTextRefreshInFlight = Promise.resolve().then(() => {
    gluefulDocAuthTextCache = gluefulDocAuthTextFromEditor();
    return gluefulDocAuthTextCache;
  }).finally(() => {
    gluefulDocAuthTextRefreshInFlight = null;
  });

  return gluefulDocAuthTextRefreshInFlight;
}

function gluefulDocAuthInlineRuns(node, docx) {
  const runs = [];

  const walk = (current, inherited = {}) => {
    if (current.nodeType === Node.TEXT_NODE) {
      const text = current.nodeValue || "";
      if (!text) return;

      runs.push(new docx.TextRun({
        text,
        bold: !!inherited.bold,
        italics: !!inherited.italics,
        underline: inherited.underline ? {} : undefined,
      }));
      return;
    }

    if (current.nodeType !== Node.ELEMENT_NODE) return;

    const tag = current.tagName.toLowerCase();

    const next = {
      bold: inherited.bold || tag === "strong" || tag === "b",
      italics: inherited.italics || tag === "em" || tag === "i",
      underline: inherited.underline || tag === "u",
    };

    current.childNodes.forEach(child => walk(child, next));
  };

  node.childNodes.forEach(child => walk(child));
  return runs.length ? runs : [new docx.TextRun("")];
}

function gluefulDocAuthHtmlToDocx() {
  const docx = window.docx;
  if (!docx) throw new Error("DOCX export library is not loaded.");

  const page = gluefulDocAuthEditor?.querySelector(".glueful-native-page");
  if (!page) throw new Error("The resume editor is not open.");

  const children = [];

  const addParagraph = (node, options = {}) => {
    const runs = gluefulDocAuthInlineRuns(node, docx);

    children.push(new docx.Paragraph({
      children: runs,
      alignment: options.alignment,
      heading: options.heading,
      bullet: options.bullet,
      spacing: { after: 100 },
    }));
  };

  const walkBlocks = (node) => {
    Array.from(node.children || []).forEach(child => {
      const tag = child.tagName.toLowerCase();

      if (["h1", "h2", "h3"].includes(tag)) {
        const heading =
          tag === "h1" ? docx.HeadingLevel.HEADING_1 :
          tag === "h2" ? docx.HeadingLevel.HEADING_2 :
          docx.HeadingLevel.HEADING_3;

        addParagraph(child, { heading });
        return;
      }

      if (tag === "p") {
        addParagraph(child);
        return;
      }

      if (tag === "ul" || tag === "ol") {
        Array.from(child.children).forEach(item => {
          if (item.tagName.toLowerCase() === "li") {
            addParagraph(item, { bullet: { level: 0 } });
          }
        });
        return;
      }

      if (tag === "br") {
        children.push(
          new docx.Paragraph({
            children: [new docx.TextRun("")]
          })
        );
        return;
      }

      if (tag === "table") {
        const rows = Array.from(child.querySelectorAll("tr")).map(tr =>
          new docx.TableRow({
            children: Array.from(tr.children).map(cell =>
              new docx.TableCell({
                children: [
                  new docx.Paragraph({
                    children: gluefulDocAuthInlineRuns(cell, docx)
                  })
                ]
              })
            )
          })
        );

        if (rows.length) {
          children.push(
            new docx.Table({
              rows,
              width: {
                size: 100,
                type: docx.WidthType.PERCENTAGE
              }
            })
          );
        }

        return;
      }

      if (child.children.length) {
        walkBlocks(child);
      } else {
        addParagraph(child);
      }
    });
  };

  walkBlocks(page);

  return new docx.Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906,
            height: 16838
          },
          margin: {
            top: 1080,
            right: 1080,
            bottom: 1080,
            left: 1080
          }
        }
      },
      children: children.length
        ? children
        : [new docx.Paragraph("")]
    }]
  });
}

async function gluefulDocAuthOpenDocx(host, docxBuffer) {
  if (!host) {
    throw new Error("The Word editor host is missing.");
  }

  if (!(docxBuffer instanceof ArrayBuffer)) {
    throw new Error("The Word document data is invalid.");
  }

  gluefulDocAuthInstallStyles();
  host.replaceChildren();

  const wrap = document.createElement("div");
  wrap.className = "glueful-native-document-wrap";

  const page = document.createElement("div");
  page.className = "glueful-native-page";
  page.contentEditable = "true";
  page.setAttribute("role", "textbox");
  page.setAttribute("aria-multiline", "true");
  page.spellcheck = true;

  page.innerHTML =
    '<div class="glueful-native-loading">Opening your resume…</div>';

  wrap.appendChild(page);
  host.appendChild(wrap);

  try {
    if (!window.mammoth) {
      throw new Error("Mammoth DOCX importer is not loaded.");
    }

    const result = await window.mammoth.convertToHtml({
      arrayBuffer: docxBuffer
    });

    const html = String(result?.value || "").trim();

    if (!html) {
      throw new Error(
        "The Word document did not contain editable content."
      );
    }

    page.innerHTML = html;

    gluefulDocAuthEditor = host;
    gluefulDocAuthTextCache = "";

    page.addEventListener("input", () => {
      gluefulDocAuthTextCache =
        gluefulDocAuthTextFromEditor();
    });

    await gluefulDocAuthRefreshTextCache();

  } catch (error) {
    host.innerHTML =
      `<div class="glueful-native-error">
        <strong>Resume could not be opened.</strong>
        <br><br>
        ${String(error?.message || error)
          .replace(/[<>]/g, "")}
      </div>`;

    gluefulDocAuthEditor = null;
    throw error;
  }

  return gluefulDocAuthEditor;
}

async function gluefulDocAuthExportDocx() {
  if (!gluefulDocAuthEditor) {
    throw new Error("The Word editor is not open.");
  }

  await gluefulDocAuthRefreshTextCache();

  const documentFile =
    gluefulDocAuthHtmlToDocx();

  return await window.docx.Packer.toBlob(
    documentFile
  );
}

async function gluefulDocAuthExportPdf() {
  if (!gluefulDocAuthEditor) {
    throw new Error("The Word editor is not open.");
  }

  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    throw new Error(
      "PDF export libraries are not loaded."
    );
  }

  const page =
    gluefulDocAuthEditor.querySelector(
      ".glueful-native-page"
    );

  if (!page) {
    throw new Error(
      "The resume page is not available."
    );
  }

  await gluefulDocAuthRefreshTextCache();

  const canvas =
    await window.html2canvas(page, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false
    });

  const { jsPDF } = window.jspdf;

  const pdf =
    new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    });

  const pageWidth = 210;
  const pageHeight = 297;

  const imageWidth = pageWidth;

  const imageHeight =
    (canvas.height * imageWidth) /
    canvas.width;

  let offset = 0;
  let first = true;

  while (offset < imageHeight) {
    if (!first) {
      pdf.addPage();
    }

    first = false;

    const sourceY =
      Math.floor(
        (offset / imageHeight) *
        canvas.height
      );

    const sourceHeight =
      Math.min(
        canvas.height - sourceY,
        Math.floor(
          (pageHeight / imageHeight) *
          canvas.height
        )
      );

    const slice =
      document.createElement("canvas");

    slice.width = canvas.width;
    slice.height = sourceHeight;

    const ctx =
      slice.getContext("2d");

    ctx.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      sourceHeight,
      0,
      0,
      canvas.width,
      sourceHeight
    );

    const sliceHeightMm =
      (sourceHeight * imageWidth) /
      canvas.width;

    pdf.addImage(
      slice.toDataURL(
        "image/jpeg",
        0.95
      ),
      "JPEG",
      0,
      0,
      imageWidth,
      sliceHeightMm
    );

    offset += pageHeight;
  }

  return pdf.output("arraybuffer");
}

async function gluefulDocAuthRefreshText() {
  return await gluefulDocAuthRefreshTextCache();
}

async function gluefulDocAuthDestroy() {
  gluefulDocAuthEditor = null;
  gluefulDocAuthTextCache = "";
  gluefulDocAuthTextRefreshInFlight = null;
}

window.gluefulDocAuth = {
  version: GLUEFUL_DOCAUTH_VERSION,

  openDocx:
    gluefulDocAuthOpenDocx,

  exportDocx:
    gluefulDocAuthExportDocx,

  exportPdf:
    gluefulDocAuthExportPdf,

  getText:
    () => gluefulDocAuthTextCache,

  refreshText:
    gluefulDocAuthRefreshText,

  destroy:
    gluefulDocAuthDestroy,

  get editor() {
    return gluefulDocAuthEditor;
  }
};

window.dispatchEvent(
  new CustomEvent(
    "glueful:docauth-ready",
    {
      detail: {
        version:
          GLUEFUL_DOCAUTH_VERSION
      }
    }
  )
);
