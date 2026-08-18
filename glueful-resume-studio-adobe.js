/* =========================================================
   GLUEFUL RESUME STUDIO — AUTHORITATIVE ADOBE CONTROLLER
   ---------------------------------------------------------
   Runtime path:
     PDF master
       -> Supabase glueful-pdf-to-docx
       -> Adobe PDF Services
       -> real DOCX
       -> Mammoth
       -> existing contenteditable Word-style editor

   This controller is injected by sw.js after index.html so it becomes
   the final open/reset controller without deleting the older V41/V50
   implementations. Existing save/download/apply flows remain owned by
   the main application.
   ========================================================= */
(function () {
  'use strict';

  const FUNCTION_NAME = 'glueful-pdf-to-docx';
  const EDITOR_ID = 'job-resume-editor-text';
  const MODAL_ID = 'job-resume-editor-modal';

  const $ = (id) => document.getElementById(id);
  const editor = () => $(EDITOR_ID);
  const modal = () => $(MODAL_ID);

  function safeText(value) {
    return String(value ?? '').trim();
  }

  function showConversionNote(message) {
    const note = $('job-resume-editor-ats-note');
    if (note) note.textContent = message;
  }

  function showConversionBanner(message) {
    document.querySelectorAll('.glueful-adobe-conversion-banner').forEach((n) => n.remove());

    const host = modal()?.querySelector('.job-resume-editor-scroll') || modal();
    if (!host) return null;

    const banner = document.createElement('div');
    banner.className = 'glueful-adobe-conversion-banner';
    banner.textContent = message;
    banner.style.cssText = [
      'position:sticky',
      'top:0',
      'z-index:95',
      'width:fit-content',
      'max-width:calc(100% - 32px)',
      'margin:10px auto -8px',
      'padding:7px 12px',
      'border:1px solid rgba(130,105,255,.45)',
      'border-radius:999px',
      'background:rgba(22,20,38,.94)',
      'color:#ddd8ff',
      'font:500 12px/1.2 Inter,Arial,sans-serif',
      'box-shadow:0 8px 24px rgba(0,0,0,.18)'
    ].join(';');

    host.insertBefore(banner, host.firstChild);
    return banner;
  }

  function clearConversionUi() {
    document.querySelectorAll('.glueful-adobe-conversion-banner').forEach((n) => n.remove());
  }

  async function waitForMammoth(timeout = 12000) {
    const started = Date.now();
    while (!window.mammoth) {
      if (Date.now() - started >= timeout) {
        throw new Error('Mammoth DOCX importer did not finish loading.');
      }
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    return window.mammoth;
  }

  async function getSourceFile() {
    if (typeof window.candidateResumeFile !== 'undefined' && window.candidateResumeFile) {
      return window.candidateResumeFile;
    }

    if (typeof window.ensureCandidateResumeCloudFile === 'function') {
      return window.ensureCandidateResumeCloudFile();
    }

    if (typeof window.loadCandidateResumeFromDevice === 'function') {
      return window.loadCandidateResumeFromDevice();
    }

    return null;
  }

  async function convertPdfWithAdobe(pdfBuffer) {
    if (!window.supabaseClient?.functions) {
      throw new Error('Supabase client is not available for PDF conversion.');
    }

    if (!(pdfBuffer instanceof ArrayBuffer)) {
      throw new Error('Invalid PDF data.');
    }

    if (!pdfBuffer.byteLength) {
      throw new Error('The PDF is empty.');
    }

    const bytes = new Uint8Array(pdfBuffer);
    if (bytes[0] !== 0x25 || bytes[1] !== 0x50 || bytes[2] !== 0x44 || bytes[3] !== 0x46) {
      throw new Error('The uploaded file does not appear to be a PDF.');
    }

    const { data, error } = await window.supabaseClient.functions.invoke(FUNCTION_NAME, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/pdf'
      },
      body: pdfBuffer
    });

    if (error) {
      let detail = '';
      try {
        if (error.context) {
          const payload = await error.context.json();
          detail = payload?.detail || payload?.error || '';
        }
      } catch (_) {}

      throw new Error(detail || error.message || 'Adobe PDF conversion failed.');
    }

    if (!(data instanceof ArrayBuffer)) {
      throw new Error('Adobe conversion returned an unexpected response type.');
    }

    if (!data.byteLength) {
      throw new Error('Adobe conversion returned an empty DOCX.');
    }

    return data;
  }

  async function docxToHtml(docxBuffer) {
    const mammoth = await waitForMammoth();

    const result = await mammoth.convertToHtml({ arrayBuffer: docxBuffer });
    const html = safeText(result?.value);

    if (!html) {
      throw new Error('The converted Word document did not contain editable content.');
    }

    const holder = document.createElement('div');
    holder.innerHTML = html;

    holder.querySelectorAll('script,style,iframe,object,embed').forEach((node) => node.remove());

    holder.querySelectorAll('img').forEach((img) => {
      const src = safeText(img.getAttribute('src'));
      if (!src) {
        img.remove();
        return;
      }

      img.removeAttribute('width');
      img.removeAttribute('height');
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.objectFit = 'contain';
    });

    return holder.innerHTML.trim();
  }

  async function sourceFileToEditorHtml(file) {
    if (!file) return null;

    const name = safeText(file.name).toLowerCase();

    if (name.endsWith('.docx')) {
      const html = await docxToHtml(await file.arrayBuffer());
      return { html, imported: true, pdfConverted: false };
    }

    if (name.endsWith('.pdf')) {
      showConversionBanner('Converting your PDF to an editable Word document…');
      showConversionNote('Converting your PDF with Adobe PDF Services…');

      const docxBuffer = await convertPdfWithAdobe(await file.arrayBuffer());
      const html = await docxToHtml(docxBuffer);

      return { html, imported: true, pdfConverted: true };
    }

    return null;
  }

  function prepareEditor(ed) {
    if (!ed) return;

    ed.classList.remove('pdf-structured-canvas', 'pdf-native-canvas', 'job-resume-master-imported');
    ed.classList.add('glueful-word-document-mode', 'job-resume-master-imported');
    ed.contentEditable = 'true';
    ed.setAttribute('role', 'textbox');
    ed.setAttribute('aria-multiline', 'true');
    ed.spellcheck = true;

    /* Never let converted DOCX images inherit stale PDF/editor dimensions. */
    ed.querySelectorAll('img').forEach((img) => {
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.objectFit = 'contain';
    });
  }

  async function loadMasterIntoEditor() {
    const ed = editor();
    if (!ed) throw new Error('Resume editor surface is missing.');

    let master = safeText(window.gluefulMasterResumeText);
    if (!master && typeof window.ensureMasterResumeText === 'function') {
      master = safeText(await window.ensureMasterResumeText());
    }

    const base = master || (typeof window.buildProfileResumeFallback === 'function'
      ? safeText(window.buildProfileResumeFallback())
      : '');

    const file = await getSourceFile();
    const imported = await sourceFileToEditorHtml(file);

    if (imported?.html) {
      ed.innerHTML = imported.html;
      prepareEditor(ed);
      showConversionNote(imported.pdfConverted
        ? 'PDF converted to an editable Word document. Your master resume remains protected.'
        : 'Editable master resume loaded. Your master resume remains protected.');
      return imported;
    }

    if (typeof window.resumeTextToEditorHtml === 'function') {
      ed.innerHTML = window.resumeTextToEditorHtml(base);
    } else {
      ed.innerHTML = base
        .split(/\r?\n/)
        .map((line) => line.trim() ? `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : '<p><br></p>')
        .join('');
    }

    prepareEditor(ed);
    showConversionNote(master
      ? 'Loaded from your Candidate Profile master resume. This job-specific copy is temporary.'
      : 'No readable master resume is available yet. Upload one in Candidate Profile.');

    return { html: ed.innerHTML, imported: false, pdfConverted: false };
  }

  async function openJobResumeEditor(id) {
    const job = typeof window.findActiveJobById === 'function'
      ? window.findActiveJobById(id)
      : null;

    if (!job) return;

    window.gluefulJobResumeEditorId = String(job.id);

    if (typeof window.openModal === 'function') {
      window.openModal(MODAL_ID);
    }

    const jobEl = $('job-resume-editor-job');
    const ats = $('job-resume-editor-ats');
    const ed = editor();

    if (jobEl) {
      const logoHtml = typeof window.renderCompanyLogo === 'function'
        ? window.renderCompanyLogo(job)
        : '';
      const escape = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

      jobEl.innerHTML = `${logoHtml}<div class="job-resume-editor-job-copy"><div class="job-resume-editor-job-title">${escape(job.title)}</div><div class="job-resume-editor-job-company">${escape(job.company)} · ${escape(job.location)}</div></div>`;

      if (typeof window.loadCompanyLogos === 'function') window.loadCompanyLogos();
    }

    if (ats) ats.textContent = '…';

    if (ed) {
      ed.innerHTML = '<p style="padding:40px;text-align:center;color:#777;font-family:Inter,Arial,sans-serif">Preparing editable Word document…</p>';
      ed.contentEditable = 'true';
    }

    try {
      clearConversionUi();
      await loadMasterIntoEditor();
    } catch (error) {
      console.error('[Glueful Resume Studio Adobe] load failed:', error);

      if (ed) {
        let master = safeText(window.gluefulMasterResumeText);
        if (!master && typeof window.buildProfileResumeFallback === 'function') {
          master = safeText(window.buildProfileResumeFallback());
        }

        if (typeof window.resumeTextToEditorHtml === 'function') {
          ed.innerHTML = window.resumeTextToEditorHtml(master);
        } else {
          ed.innerHTML = `<p>${master.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
        }

        prepareEditor(ed);
      }

      showConversionNote('Adobe PDF conversion failed. The editable text fallback was loaded; your master resume was not changed.');

      if (typeof window.showError === 'function') {
        window.showError(error?.message || 'Could not convert the PDF into an editable Word document.');
      }
    } finally {
      clearConversionUi();
    }

    if (typeof window.updateJobResumeEditorAts === 'function') {
      try { window.updateJobResumeEditorAts(); } catch (_) {}
    }

    if (typeof window.gluefulResumeStudioEnhance === 'function') {
      try { window.gluefulResumeStudioEnhance(); } catch (_) {}
    }
  }

  async function resetJobResumeToMaster() {
    const ed = editor();
    if (!ed) return;

    try {
      clearConversionUi();
      await loadMasterIntoEditor();
      if (typeof window.updateJobResumeEditorAts === 'function') {
        try { window.updateJobResumeEditorAts(); } catch (_) {}
      }
      ed.focus();
    } catch (error) {
      console.error('[Glueful Resume Studio Adobe] reset failed:', error);
      if (typeof window.showError === 'function') {
        window.showError(error?.message || 'Could not reset the temporary resume.');
      }
    } finally {
      clearConversionUi();
    }
  }

  window.gluefulAdobeResumeStudio = {
    version: '1.0.0',
    functionName: FUNCTION_NAME,
    pipeline: [
      'PDF master',
      'Supabase glueful-pdf-to-docx',
      'Adobe PDF Services',
      'real DOCX',
      'Mammoth',
      'existing contenteditable Word-style editor'
    ],
    openJobResumeEditor,
    resetJobResumeToMaster
  };

  /* This script is deliberately loaded last so these are the sole active
     Resume Studio open/reset entry points at runtime. */
  window.openJobResumeEditor = openJobResumeEditor;
  window.resetJobResumeToMaster = resetJobResumeToMaster;

  console.info('[Glueful Resume Studio Adobe] authoritative controller loaded.');
})();
