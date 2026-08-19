/* =========================================================
   GLUEFUL RESUME STUDIO — CANONICAL CONTROLLER
   Architecture E runtime entry point.

   PDF -> Adobe DOCX -> WordprocessingML importer -> canonical model
   -> fixed-page renderer -> separate editable blocks.
   ========================================================= */
(function () {
  'use strict';

  const EDITOR_ID = 'job-resume-editor-text';
  const MODAL_ID = 'job-resume-editor-modal';
  const FUNCTION_NAME = 'glueful-pdf-to-docx';

  const $ = (id) => document.getElementById(id);
  const editor = () => $(EDITOR_ID);
  const modal = () => $(MODAL_ID);
  const safeText = (value) => String(value ?? '').trim();

  function supabaseConfig() {
    let url = '', key = '';
    try { url = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : ''; } catch (_) {}
    try { key = typeof SUPABASE_KEY !== 'undefined' ? SUPABASE_KEY : ''; } catch (_) {}
    return { url: String(url || '').replace(/\/$/, ''), key: String(key || '') };
  }

  function supabaseClient() {
    if (window.gluefulResumeSupabaseClient?.auth) return window.gluefulResumeSupabaseClient;
    try { if (typeof supabaseClient !== 'undefined' && supabaseClient?.auth) return supabaseClient; } catch (_) {}
    return window.supabaseClient?.auth ? window.supabaseClient : null;
  }

  async function sourceFile() {
    try { if (typeof candidateResumeFile !== 'undefined' && candidateResumeFile) return candidateResumeFile; } catch (_) {}
    if (typeof window.ensureCandidateResumeCloudFile === 'function') return window.ensureCandidateResumeCloudFile();
    if (typeof window.loadCandidateResumeFromDevice === 'function') return window.loadCandidateResumeFromDevice();
    return null;
  }

  async function adobePdfToDocx(buffer) {
    const bytes = new Uint8Array(buffer || 0);
    if (bytes.length < 4 || bytes[0] !== 0x25 || bytes[1] !== 0x50 || bytes[2] !== 0x44 || bytes[3] !== 0x46) throw new Error('The selected source is not a valid PDF.');
    const client = supabaseClient();
    const config = supabaseConfig();
    if (!client?.auth || !config.url || !config.key) throw new Error('Supabase authentication is unavailable for PDF conversion.');
    const { data, error } = await client.auth.getSession();
    if (error || !data?.session?.access_token) throw new Error(error?.message || 'Your Glueful session is unavailable. Please sign in again.');
    const response = await fetch(`${config.url}/functions/v1/${FUNCTION_NAME}`, {
      method: 'POST',
      headers: { apikey: config.key, Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/pdf' },
      body: buffer,
      cache: 'no-store'
    });
    if (!response.ok) {
      let detail = '';
      try { const payload = await response.json(); detail = payload?.detail || payload?.error || ''; } catch (_) {}
      throw new Error(detail || `Adobe PDF conversion failed (${response.status}).`);
    }
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) throw new Error('Adobe conversion returned an unexpected file type.');
    return response.arrayBuffer();
  }

  function textModel(textValue, sourceName) {
    const model = window.gluefulResumeCanonicalModel.createDocument({ sourceType: 'text', sourceName });
    const lines = String(textValue || '').split(/\r?\n/);
    model.pages[0].blocks = lines.map((line) => {
      const paragraph = window.gluefulResumeCanonicalModel.createParagraph({
        afterSpacingPt: line.trim() ? 4 : 0,
        lineSpacing: 1.0
      });
      paragraph.runs = [window.gluefulResumeCanonicalModel.createRun(line, { fontFamily: 'Times New Roman', fontSizePt: 11 })];
      return paragraph;
    });
    return model;
  }

  async function loadModel(file) {
    const name = safeText(file?.name).toLowerCase();
    if (name.endsWith('.docx')) return window.gluefulResumeDocxImporterV2.importDocx(await file.arrayBuffer(), { sourceName: file.name });
    if (name.endsWith('.pdf')) {
      const buffer = await adobePdfToDocx(await file.arrayBuffer());
      window.gluefulLastCanonicalDocxBuffer = buffer.slice(0);
      return window.gluefulResumeDocxImporterV2.importDocx(buffer, { sourceName: file.name });
    }
    return null;
  }

  function masterText() {
    const direct = safeText(window.gluefulMasterResumeText);
    if (direct) return direct;
    try { if (typeof window.ensureMasterResumeText === 'function') return safeText(window.ensureMasterResumeText()); } catch (_) {}
    try { if (typeof window.buildProfileResumeFallback === 'function') return safeText(window.buildProfileResumeFallback()); } catch (_) {}
    return '';
  }

  function installHostSurface(ed) {
    ed.classList.remove('pdf-structured-canvas', 'pdf-native-canvas', 'glueful-word-document-mode', 'glueful-docx-layout-mode', 'job-resume-master-imported');
    ed.classList.add('glueful-canonical-document-host');
    ed.contentEditable = 'false';
    ed.setAttribute('role', 'document');
    ed.removeAttribute('aria-multiline');
    ed.spellcheck = false;
    ed.style.minHeight = '1123px';
    ed.style.background = 'transparent';
    ed.style.border = '0';
    ed.style.boxShadow = 'none';
    ed.style.overflow = 'visible';
  }

  function wireModel(model, ed) {
    installHostSurface(ed);
    const rendered = window.gluefulResumeCanonicalRenderer.render(model, ed, {
      onChange: () => {
        try { window.updateJobResumeEditorAts?.(); } catch (_) {}
      }
    });
    window.gluefulResumeCanonicalState = window.gluefulResumeCanonicalRenderer.getState();
    window.gluefulResumeStudioGetCanonicalModel = () => window.gluefulResumeCanonicalRenderer.getActiveModel();
    window.gluefulResumeStudioGetText = () => window.gluefulResumeCanonicalRenderer.getPlainText();
    return rendered;
  }

  async function openJobResumeEditorCanonical(id) {
    const job = typeof window.findActiveJobById === 'function' ? window.findActiveJobById(id) : null;
    if (!job) return;
    window.gluefulJobResumeEditorId = String(job.id);
    window.GLUEFUL_RESUME_CANONICAL_RENDERER = true;
    if (typeof window.openModal === 'function') window.openModal(MODAL_ID);

    const jobEl = $('job-resume-editor-job');
    const ats = $('job-resume-editor-ats');
    const ed = editor();
    if (jobEl) {
      const logoHtml = typeof window.renderCompanyLogo === 'function' ? window.renderCompanyLogo(job) : '';
      const escape = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#39;');
      jobEl.innerHTML = `${logoHtml}<div class="job-resume-editor-job-copy"><div class="job-resume-editor-job-title">${escape(job.title)}</div><div class="job-resume-editor-job-company">${escape(job.company)} · ${escape(job.location)}</div></div>`;
      try { window.loadCompanyLogos?.(); } catch (_) {}
    }
    if (ats) ats.textContent = '…';
    if (!ed) throw new Error('Resume editor surface is missing.');
    ed.innerHTML = '<div style="padding:40px;text-align:center;color:#777;font:14px Arial,sans-serif">Preparing canonical document…</div>';

    try {
      const file = await sourceFile();
      let model = file ? await loadModel(file) : null;
      if (!model) model = textModel(masterText(), 'generated-master');
      wireModel(model, ed);
      window.gluefulResumeRendererReport = {
        renderer: 'canonical-fixed-page',
        architecture: 'E',
        importer: model.metadata?.importDiagnostics?.importer || model.metadata?.sourceType || 'text',
        pages: model.pages?.length || 0,
        source: model.metadata?.sourceType || 'unknown',
        diagnostics: model.metadata?.importDiagnostics || null
      };
      console.info('[Glueful Resume Studio] canonical document loaded:', window.gluefulResumeRendererReport);
    } catch (error) {
      console.error('[Glueful Resume Studio] canonical renderer failed:', error);
      ed.innerHTML = `<div style="padding:40px;color:#8b1e1e;background:#fff7f7;border:1px solid #e8b4b4;border-radius:8px;font:14px Arial,sans-serif"><strong>Canonical resume renderer failed.</strong><br><span style="font-size:12px">${String(error?.message || error).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span></div>`;
      ed.contentEditable = 'false';
      window.gluefulResumeRendererReport = { renderer: 'error', architecture: 'E', stage: 'canonical import/render', error: String(error?.message || error) };
      try { window.showError?.(error?.message || 'Could not render the canonical resume.'); } catch (_) {}
    }

    try { window.updateJobResumeEditorAts?.(); } catch (_) {}
    return window.gluefulResumeCanonicalState?.model || null;
  }

  async function resetJobResumeToMasterCanonical() {
    const ed = editor();
    if (!ed) return;
    const file = await sourceFile();
    const model = file ? await loadModel(file) : textModel(masterText(), 'generated-master');
    wireModel(model, ed);
    try { window.updateJobResumeEditorAts?.(); } catch (_) {}
    ed.focus();
  }

  window.gluefulCanonicalResumeStudio = {
    version: '0.1.0',
    architecture: 'E',
    openJobResumeEditor: openJobResumeEditorCanonical,
    resetJobResumeToMaster: resetJobResumeToMasterCanonical,
    getModel: () => window.gluefulResumeCanonicalRenderer?.getActiveModel?.() || null
  };

  window.openJobResumeEditor = openJobResumeEditorCanonical;
  window.resetJobResumeToMaster = resetJobResumeToMasterCanonical;
  console.info('[Glueful Resume Studio] canonical Architecture E controller loaded.');
})();
