/* =========================================================
   GLUEFUL RESUME STUDIO — AUTHORITATIVE ADOBE/DOCX CONTROLLER
   PDF -> Supabase glueful-pdf-to-docx -> Adobe PDF Services -> DOCX
   -> docx-preview -> existing contenteditable Word-style editor.
   ========================================================= */
(function () {
  'use strict';
  const FUNCTION_NAME = 'glueful-pdf-to-docx';
  const EDITOR_ID = 'job-resume-editor-text';
  const MODAL_ID = 'job-resume-editor-modal';
  const DOCX_PREVIEW_JS = 'https://cdn.jsdelivr.net/npm/docx-preview@0.4.0/dist/docx-preview.min.js';
  const JSZIP_JS = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  const $ = (id) => document.getElementById(id);
  const editor = () => $(EDITOR_ID);
  const modal = () => $(MODAL_ID);
  const safeText = (value) => String(value ?? '').trim();
  function showConversionNote(message) { const note = $('job-resume-editor-ats-note'); if (note) note.textContent = message; }
  function showConversionBanner(message) {
    document.querySelectorAll('.glueful-adobe-conversion-banner').forEach((n) => n.remove());
    const host = modal()?.querySelector('.job-resume-editor-scroll') || modal(); if (!host) return null;
    const banner = document.createElement('div'); banner.className = 'glueful-adobe-conversion-banner'; banner.textContent = message;
    banner.style.cssText = ['position:sticky','top:0','z-index:95','width:fit-content','max-width:calc(100% - 32px)','margin:10px auto -8px','padding:7px 12px','border:1px solid rgba(130,105,255,.45)','border-radius:999px','background:rgba(22,20,38,.94)','color:#ddd8ff','font:500 12px/1.2 Inter,Arial,sans-serif','box-shadow:0 8px 24px rgba(0,0,0,.18)'].join(';');
    host.insertBefore(banner, host.firstChild); return banner;
  }
  function clearConversionUi() { document.querySelectorAll('.glueful-adobe-conversion-banner').forEach((n) => n.remove()); }
  function loadScriptOnce(src, id) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) { if (existing.dataset.loaded === 'true') return resolve(); existing.addEventListener('load', resolve, { once: true }); existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true }); return; }
      const script = document.createElement('script'); script.id = id; script.src = src; script.async = true;
      script.onload = () => { script.dataset.loaded = 'true'; resolve(); }; script.onerror = () => reject(new Error(`Failed to load ${src}`)); document.head.appendChild(script);
    });
  }
  async function ensureDocxPreview() {
    if (window.gluefulDocxPreview?.renderAsync) return window.gluefulDocxPreview;
    const existingDocxGenerator = window.docx;
    await loadScriptOnce(JSZIP_JS, 'glueful-jszip-runtime');
    await loadScriptOnce(DOCX_PREVIEW_JS, 'glueful-docx-preview-runtime');
    if (!window.docx?.renderAsync) throw new Error('docx-preview did not expose renderAsync.');
    window.gluefulDocxPreview = window.docx;
    if (existingDocxGenerator) window.docx = existingDocxGenerator;
    return window.gluefulDocxPreview;
  }
  async function getSourceFile() {
    try { if (typeof candidateResumeFile !== 'undefined' && candidateResumeFile) return candidateResumeFile; } catch (_) {}
    if (typeof window.ensureCandidateResumeCloudFile === 'function') return window.ensureCandidateResumeCloudFile();
    if (typeof window.loadCandidateResumeFromDevice === 'function') return window.loadCandidateResumeFromDevice(); return null;
  }
  function getSupabaseConfig() { let url = '', key = ''; try { url = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : ''; } catch (_) {} try { key = typeof SUPABASE_KEY !== 'undefined' ? SUPABASE_KEY : ''; } catch (_) {} return { url: String(url || '').replace(/\/$/, ''), key: String(key || '') }; }
  function getSupabaseClient() {
    if (window.gluefulResumeSupabaseClient?.auth) return window.gluefulResumeSupabaseClient;
    try { if (typeof supabaseClient !== 'undefined' && supabaseClient?.auth) return supabaseClient; } catch (_) {}
    if (window.supabaseClient?.auth) return window.supabaseClient;
    return null;
  }
  async function convertPdfWithAdobe(pdfBuffer) {
    if (!(pdfBuffer instanceof ArrayBuffer)) throw new Error('Invalid PDF data.'); if (!pdfBuffer.byteLength) throw new Error('The PDF is empty.');
    const bytes = new Uint8Array(pdfBuffer); if (bytes[0] !== 0x25 || bytes[1] !== 0x50 || bytes[2] !== 0x44 || bytes[3] !== 0x46) throw new Error('The uploaded file does not appear to be a PDF.');
    const client = getSupabaseClient(); const config = getSupabaseConfig();
    if (!client?.auth || !config.url || !config.key) throw new Error(`Supabase authentication client is not available for PDF conversion. client=${!!client} auth=${!!client?.auth} url=${!!config.url} key=${!!config.key}`);
    const { data: sessionData, error: sessionError } = await client.auth.getSession(); if (sessionError) throw new Error(`Supabase session lookup failed: ${sessionError.message || sessionError}`); if (!sessionData?.session?.access_token) throw new Error('Your Glueful session is unavailable. Please sign in again.');
    const response = await fetch(`${config.url}/functions/v1/${FUNCTION_NAME}`, { method: 'POST', headers: { apikey: config.key, Authorization: `Bearer ${sessionData.session.access_token}`, 'Content-Type': 'application/pdf' }, body: pdfBuffer, cache: 'no-store' });
    if (!response.ok) { let detail = ''; try { const payload = await response.json(); detail = payload?.detail || payload?.error || ''; } catch (_) {} throw new Error(detail || `Adobe PDF conversion failed (${response.status}).`); }
    const contentType = String(response.headers.get('content-type') || '').toLowerCase(); if (!contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) throw new Error('Adobe conversion returned an unexpected content type.');
    const docxBuffer = await response.arrayBuffer(); if (!docxBuffer.byteLength) throw new Error('Adobe conversion returned an empty DOCX.');
    window.gluefulLastAdobeDocxBuffer = docxBuffer.slice(0);
    console.info('[Glueful Resume Studio] Adobe DOCX received:', { bytes: docxBuffer.byteLength, contentType });
    if (window.gluefulResumeDocxForensics?.inspectBuffer) { try { window.gluefulResumeDocxForensics.inspectBuffer(docxBuffer); } catch (error) { console.warn('[Glueful Resume Studio] DOCX forensic inspection failed:', error); } }
    return docxBuffer;
  }
  async function renderDocxWithLayout(docxBuffer, ed) {
    const docxPreview = await ensureDocxPreview();
    const renderHost = document.createElement('div'); renderHost.className = 'glueful-docx-render-host'; renderHost.contentEditable = 'true'; renderHost.spellcheck = true;
    ed.replaceChildren(renderHost); ed.contentEditable = 'true'; ed.classList.remove('pdf-structured-canvas', 'pdf-native-canvas'); ed.classList.add('glueful-word-document-mode', 'glueful-docx-layout-mode', 'job-resume-master-imported'); ed.setAttribute('role', 'textbox'); ed.setAttribute('aria-multiline', 'true');
    const styleHost = document.createElement('div'); styleHost.className = 'glueful-docx-style-host'; styleHost.setAttribute('aria-hidden', 'true'); styleHost.style.display = 'none'; document.head.appendChild(styleHost);
    try { await docxPreview.renderAsync(docxBuffer, renderHost, styleHost, { className: 'glueful-docx', inWrapper: true, hideWrapperOnPrint: false, ignoreWidth: false, ignoreHeight: false, ignoreFonts: false, breakPages: true, ignoreLastRenderedPageBreak: false, experimental: true, renderHeaders: true, renderFooters: true, renderFootnotes: true, renderEndnotes: true, useBase64URL: false, renderChanges: false, renderComments: false, renderAltChunks: true, debug: false }); } catch (error) { styleHost.remove(); throw error; }
    const pages = renderHost.querySelectorAll('.docx-wrapper > section, .docx > section').length; const images = renderHost.querySelectorAll('img').length; const tables = renderHost.querySelectorAll('table').length;
    const report = { pages, images, tables, renderer: 'docx-preview', bytes: docxBuffer.byteLength }; window.gluefulResumeRendererReport = report; console.info('[Glueful Resume Studio] DOCX layout render complete:', report);
    if (!pages && !renderHost.textContent.trim() && !images && !tables) throw new Error('docx-preview completed without producing document content.');
    return { html: renderHost.innerHTML, imported: true, pdfConverted: true, renderer: 'docx-preview' };
  }
  async function sourceFileToEditor(file, ed) { if (!file) return null; const name = safeText(file.name).toLowerCase(); if (name.endsWith('.docx')) { return await renderDocxWithLayout(await file.arrayBuffer(), ed); } if (name.endsWith('.pdf')) { showConversionBanner('Converting your PDF to an editable Word document…'); showConversionNote('Converting your PDF with Adobe PDF Services…'); return await renderDocxWithLayout(await convertPdfWithAdobe(await file.arrayBuffer()), ed); } return null; }
  function preparePlainEditor(ed) { if (!ed) return; ed.classList.remove('pdf-structured-canvas', 'pdf-native-canvas', 'glueful-docx-layout-mode'); ed.classList.add('glueful-word-document-mode', 'job-resume-master-imported'); ed.contentEditable = 'true'; ed.setAttribute('role', 'textbox'); ed.setAttribute('aria-multiline', 'true'); ed.spellcheck = true; }
  async function loadMasterIntoEditor() { const ed = editor(); if (!ed) throw new Error('Resume editor surface is missing.'); let master = safeText(window.gluefulMasterResumeText); if (!master && typeof window.ensureMasterResumeText === 'function') master = safeText(await window.ensureMasterResumeText()); const base = master || (typeof window.buildProfileResumeFallback === 'function' ? safeText(window.buildProfileResumeFallback()) : ''); const imported = await sourceFileToEditor(await getSourceFile(), ed); if (imported?.html) { showConversionNote(imported.renderer === 'docx-preview' ? 'PDF converted by Adobe and rendered with docx-preview. Your master resume remains protected.' : 'Editable document loaded.'); return imported; } if (typeof window.resumeTextToEditorHtml === 'function') ed.innerHTML = window.resumeTextToEditorHtml(base); else ed.innerHTML = base.split(/\r?\n/).map((line) => line.trim() ? `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : '<p><br></p>').join(''); preparePlainEditor(ed); return { html: ed.innerHTML, imported: false, pdfConverted: false, renderer: 'plain-fallback' }; }
  async function openJobResumeEditor(id) { const job = typeof window.findActiveJobById === 'function' ? window.findActiveJobById(id) : null; if (!job) return; window.gluefulJobResumeEditorId = String(job.id); if (typeof window.openModal === 'function') window.openModal(MODAL_ID); const jobEl = $('job-resume-editor-job'); const ats = $('job-resume-editor-ats'); const ed = editor(); if (jobEl) { const logoHtml = typeof window.renderCompanyLogo === 'function' ? window.renderCompanyLogo(job) : ''; const escape = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#39;'); jobEl.innerHTML = `${logoHtml}<div class="job-resume-editor-job-copy"><div class="job-resume-editor-job-title">${escape(job.title)}</div><div class="job-resume-editor-job-company">${escape(job.company)} · ${escape(job.location)}</div></div>`; if (typeof window.loadCompanyLogos === 'function') window.loadCompanyLogos(); } if (ats) ats.textContent = '…'; if (ed) { ed.innerHTML = '<p style="padding:40px;text-align:center;color:#777;font-family:Inter,Arial,sans-serif">Preparing editable Word document…</p>'; ed.contentEditable = 'true'; } try { clearConversionUi(); await loadMasterIntoEditor(); } catch (error) { console.error('[Glueful Resume Studio Adobe] load failed:', error); window.gluefulResumeRendererReport = { renderer: 'error', stage: 'PDF source acquisition / Supabase authentication / Adobe conversion / DOCX rendering', error: String(error?.message || error), stack: String(error?.stack || '') }; if (ed) { ed.innerHTML = `<div style="padding:40px;text-align:center;font-family:Inter,Arial,sans-serif;color:#8b1e1e;background:#fff7f7;border:1px solid #e8b4b4;border-radius:8px"><strong>Resume layout renderer failed.</strong><br><span style="font-size:12px">${String(error?.message || error).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span></div>`; ed.contentEditable = 'false'; } showConversionNote('Resume layout rendering failed; no semantic fallback was inserted.'); if (typeof window.showError === 'function') window.showError(error?.message || 'Could not render the Adobe-generated Word document.'); } finally { clearConversionUi(); } if (typeof window.updateJobResumeEditorAts === 'function') { try { window.updateJobResumeEditorAts(); } catch (_) {} } if (typeof window.gluefulResumeStudioEnhance === 'function') { try { window.gluefulResumeStudioEnhance(); } catch (_) {} } }
  async function resetJobResumeToMaster() { const ed = editor(); if (!ed) return; try { clearConversionUi(); await loadMasterIntoEditor(); if (typeof window.updateJobResumeEditorAts === 'function') { try { window.updateJobResumeEditorAts(); } catch (_) {} } ed.focus(); } catch (error) { console.error('[Glueful Resume Studio Adobe] reset failed:', error); if (typeof window.showError === 'function') window.showError(error?.message || 'Could not reset the temporary resume.'); } finally { clearConversionUi(); } }
  window.gluefulAdobeResumeStudio = { version: '2.8.0', functionName: FUNCTION_NAME, pipeline: ['PDF master', 'Supabase glueful-pdf-to-docx', 'real DOCX', 'docx-preview layout renderer', 'existing contenteditable Word-style editor'], openJobResumeEditor, resetJobResumeToMaster };
  window.openJobResumeEditor = openJobResumeEditor; window.resetJobResumeToMaster = resetJobResumeToMaster; console.info('[Glueful Resume Studio] authoritative DOCX layout controller loaded.');
})();
