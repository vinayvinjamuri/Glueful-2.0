/* =========================================================
   GLUEFUL RESUME STUDIO — MOBILE VIEW + DOCX HEADER PRESERVATION
   ---------------------------------------------------------
   Keeps the Adobe/docx-preview document layout authoritative.
   Mobile-only viewport controls are layered on top.
   If docx-preview misses the single DOCX media image, recover that
   image in-place inside the existing paragraph instead of rebuilding
   the header with flex layout. This preserves the PDF/DOCX alignment.
   ========================================================= */
(function () {
  'use strict';

  const EDITOR_ID = 'job-resume-editor-text';
  const MODAL_ID = 'job-resume-editor-modal';
  const PAGE_WIDTH = 794;
  const PAGE_HEIGHT = 1123;
  const MOBILE_QUERY = '(max-width: 700px)';

  const $ = (id) => document.getElementById(id);
  const isMobile = () => window.matchMedia?.(MOBILE_QUERY).matches === true;
  const editor = () => $(EDITOR_ID);
  const scrollHost = () => $(MODAL_ID)?.querySelector('.job-resume-editor-scroll');

  function injectStyles() {
    if ($('glueful-resume-mobile-layout-style')) return;

    const style = document.createElement('style');
    style.id = 'glueful-resume-mobile-layout-style';
    style.textContent = `
      #${MODAL_ID} .job-resume-editor-scroll{
        touch-action:pan-x pan-y pinch-zoom!important;
        -webkit-overflow-scrolling:touch!important;
        overscroll-behavior:contain!important;
      }
      #${MODAL_ID} #${EDITOR_ID}{
        transform-origin:top left!important;
        touch-action:pan-x pan-y pinch-zoom!important;
      }
      #${MODAL_ID} .glueful-mobile-view-controls{display:none;}

      /* Never rewrite the desktop document geometry. */
      #${MODAL_ID} .glueful-docx-layout-mode .docx-wrapper,
      #${MODAL_ID} .glueful-docx-layout-mode .docx{
        box-sizing:border-box;
      }

      /* Recovered DOCX images stay inline with the original paragraph. */
      #${MODAL_ID} .glueful-docx-image-recovered-inline{
        display:inline-block!important;
        vertical-align:middle!important;
        object-fit:contain!important;
        max-width:none!important;
        height:auto!important;
        margin:0!important;
        padding:0!important;
      }

      @media(max-width:700px){
        #${MODAL_ID} .job-resume-editor-scroll{
          padding:8px 8px 210px!important;
          align-items:flex-start!important;
          justify-content:flex-start!important;
          overflow:auto!important;
        }
        #${MODAL_ID} #${EDITOR_ID}{
          width:794px!important;
          min-width:794px!important;
          max-width:794px!important;
          margin:0!important;
          transform-origin:top left!important;
        }
        #${MODAL_ID} .glueful-mobile-view-controls{
          position:fixed!important;
          left:8px!important;
          right:8px!important;
          bottom:78px!important;
          z-index:10060!important;
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          gap:6px!important;
          padding:7px 8px!important;
          border:1px solid rgba(255,255,255,.12)!important;
          border-radius:12px!important;
          background:rgba(24,27,35,.97)!important;
          box-shadow:0 -10px 28px rgba(0,0,0,.28)!important;
        }
        #${MODAL_ID} .glueful-mobile-view-controls button{
          flex:0 0 auto!important;
          min-width:44px!important;
          height:38px!important;
          padding:0 10px!important;
          border:1px solid rgba(255,255,255,.13)!important;
          border-radius:8px!important;
          background:#242832!important;
          color:#f5f7fb!important;
          font-weight:800!important;
        }
        #${MODAL_ID} .glueful-mobile-view-controls .glueful-mobile-zoom-value{
          min-width:54px!important;
          text-align:center!important;
          font:700 11px/1 'JetBrains Mono',monospace!important;
          color:#f5f7fb!important;
        }
        #${MODAL_ID} .job-resume-editor-actions{bottom:0!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function currentZoom() {
    const el = editor();
    return Number(el?.dataset.gluefulMobileZoom || el?.dataset.v41Zoom || 100);
  }

  function setZoomPercent(percent) {
    const el = editor();
    if (!el) return;
    const min = isMobile() ? 30 : 70;
    const next = Math.max(min, Math.min(160, Math.round(percent)));
    el.dataset.gluefulMobileZoom = String(next);
    el.dataset.v41Zoom = String(next);
    el.style.zoom = (next / 100).toFixed(3);

    const label = $('glueful-mobile-zoom-value');
    if (label) label.textContent = `${next}%`;
    const desktopLabel = $('glueful-zoom-value');
    if (desktopLabel) desktopLabel.textContent = `${next}%`;
  }

  function fitWidth() {
    if (!isMobile()) return;
    const scroll = scrollHost();
    if (!scroll) return;
    const available = Math.max(240, scroll.clientWidth - 16);
    setZoomPercent((available / PAGE_WIDTH) * 100);
  }

  function fitPage() {
    if (!isMobile()) return;
    const scroll = scrollHost();
    if (!scroll) return;
    const availableHeight = Math.max(280, scroll.clientHeight - 24);
    const availableWidth = Math.max(240, scroll.clientWidth - 16);
    const byWidth = (availableWidth / PAGE_WIDTH) * 100;
    const byHeight = (availableHeight / PAGE_HEIGHT) * 100;
    setZoomPercent(Math.min(byWidth, byHeight));
  }

  function installControls() {
    const modal = $(MODAL_ID);
    if (!modal || !isMobile() || modal.querySelector('.glueful-mobile-view-controls')) return;

    const controls = document.createElement('div');
    controls.className = 'glueful-mobile-view-controls';
    controls.setAttribute('aria-label', 'Mobile document view controls');
    controls.innerHTML = `
      <button type="button" data-action="zoom-out" aria-label="Zoom out">−</button>
      <span class="glueful-mobile-zoom-value">100%</span>
      <button type="button" data-action="zoom-in" aria-label="Zoom in">+</button>
      <button type="button" data-action="fit-width">Fit</button>
      <button type="button" data-action="fit-page">Page</button>
    `;

    controls.addEventListener('click', (event) => {
      const action = event.target?.dataset?.action;
      if (action === 'zoom-out') setZoomPercent(currentZoom() - 10);
      if (action === 'zoom-in') setZoomPercent(currentZoom() + 10);
      if (action === 'fit-width') fitWidth();
      if (action === 'fit-page') fitPage();
    });

    modal.appendChild(controls);
  }

  function removeControls() {
    document.querySelectorAll('.glueful-mobile-view-controls').forEach((node) => node.remove());
  }

  function installPinchZoom() {
    const host = scrollHost();
    if (!host || host.dataset.gluefulPinchInstalled === '1') return;
    host.dataset.gluefulPinchInstalled = '1';

    let startDistance = 0;
    let startZoom = 100;

    host.addEventListener('touchstart', (event) => {
      if (!isMobile() || event.touches.length !== 2) return;
      const [a, b] = event.touches;
      startDistance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      startZoom = currentZoom();
    }, { passive: true });

    host.addEventListener('touchmove', (event) => {
      if (!isMobile() || event.touches.length !== 2 || !startDistance) return;
      const [a, b] = event.touches;
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (!distance) return;
      setZoomPercent(startZoom * (distance / startDistance));
      event.preventDefault();
    }, { passive: false });

    const reset = () => { startDistance = 0; };
    host.addEventListener('touchend', reset, { passive: true });
    host.addEventListener('touchcancel', reset, { passive: true });
  }

  async function ensureJSZip() {
    if (window.JSZip) return window.JSZip;
    try {
      const existing = document.getElementById('glueful-mobile-jszip-runtime');
      if (existing) {
        await new Promise((resolve, reject) => {
          if (window.JSZip) return resolve();
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        });
        return window.JSZip;
      }

      const response = await fetch('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', { cache: 'no-store' });
      if (!response.ok) return null;
      const code = await response.text();
      const script = document.createElement('script');
      script.id = 'glueful-mobile-jszip-runtime';
      script.textContent = code;
      document.head.appendChild(script);
      return window.JSZip || null;
    } catch (_) {
      return null;
    }
  }

  function xmlDoc(text) {
    return new DOMParser().parseFromString(text, 'application/xml');
  }

  function localName(node) {
    return String(node?.localName || node?.nodeName || '').split(':').pop();
  }

  function firstAttr(node, names) {
    for (const name of names) {
      const value = node?.getAttribute?.(name);
      if (value) return value;
    }
    return '';
  }

  async function findDocxImagePlacement(zip, mediaNames) {
    const mediaName = mediaNames[0];
    const xmlNames = Object.keys(zip.files).filter((name) => /^word\/(document|header\d+|footer\d+)\.xml$/i.test(name));

    for (const xmlName of xmlNames) {
      const xml = await zip.files[xmlName].async('text');
      const doc = xmlDoc(xml);
      const drawingNodes = Array.from(doc.getElementsByTagName('*')).filter((node) => localName(node) === 'drawing');

      for (const drawing of drawingNodes) {
        const blip = Array.from(drawing.getElementsByTagName('*')).find((node) => localName(node) === 'blip');
        const embedId = firstAttr(blip, ['r:embed', 'embed', 'r:id', 'id']);
        if (!embedId) continue;

        const relPath = `${xmlName}.rels`.replace(/^word\/(document|header\d+|footer\d+)\.xml\.rels$/i, 'word/_rels/$1.xml.rels');
        const relFile = zip.files[relPath];
        if (!relFile) continue;
        const relXml = xmlDoc(await relFile.async('text'));
        const relationship = Array.from(relXml.getElementsByTagName('*')).find((node) => localName(node) === 'Relationship' && (node.getAttribute('Id') === embedId || node.getAttribute('id') === embedId));
        if (!relationship) continue;

        let target = String(relationship.getAttribute('Target') || '').replace(/\\/g, '/');
        if (target.startsWith('../')) target = target.replace(/^\.\.\//, '');
        if (target.startsWith('/')) target = target.slice(1);
        if (!target.startsWith('word/')) target = `word/${target.replace(/^\//, '')}`;
        if (target !== mediaName) continue;

        const paragraph = (() => {
          let node = drawing;
          while (node && localName(node) !== 'p') node = node.parentElement;
          return node;
        })();

        const allParagraphs = Array.from(doc.getElementsByTagName('*')).filter((node) => localName(node) === 'p');
        const paragraphIndex = paragraph ? allParagraphs.indexOf(paragraph) : -1;
        const extent = Array.from(drawing.getElementsByTagName('*')).find((node) => localName(node) === 'extent');

        return {
          mediaName,
          xmlName,
          paragraphIndex,
          widthEmu: Number(firstAttr(extent, ['cx'])) || 0,
          heightEmu: Number(firstAttr(extent, ['cy'])) || 0,
          anchored: !!Array.from(drawing.getElementsByTagName('*')).find((node) => localName(node) === 'anchor')
        };
      }
    }

    return { mediaName, xmlName: 'word/document.xml', paragraphIndex: -1, widthEmu: 0, heightEmu: 0, anchored: false };
  }

  function findRenderedParagraph(editorRoot, placement) {
    const headerCandidates = Array.from(editorRoot.querySelectorAll('header, [class*="header"], [class*="Header"]'));
    if (/^word\/header\d+\.xml$/i.test(placement.xmlName)) {
      const header = headerCandidates.find((node) => node.querySelectorAll('p').length > Math.max(0, placement.paragraphIndex)) || headerCandidates[0];
      if (header) {
        const paragraphs = Array.from(header.querySelectorAll('p'));
        return paragraphs[placement.paragraphIndex] || paragraphs[0] || null;
      }
    }

    const sections = Array.from(editorRoot.querySelectorAll('.docx-wrapper > section, .docx > section'));
    const root = sections[0] || editorRoot;
    const paragraphs = Array.from(root.querySelectorAll('p'));
    return paragraphs[placement.paragraphIndex] || paragraphs[0] || null;
  }

  async function recoverSingleDocxImageIfNeeded() {
    const buffer = window.gluefulLastAdobeDocxBuffer;
    const ed = editor();
    if (!ed || !buffer || ed.classList.contains('glueful-docx-image-recovered')) return;
    if (ed.querySelector('img')) return;

    const JSZip = await ensureJSZip();
    if (!JSZip) return;

    try {
      const zip = await JSZip.loadAsync(buffer);
      const mediaNames = Object.keys(zip.files).filter((name) => /^word\/media\//i.test(name) && !zip.files[name].dir);
      if (mediaNames.length !== 1) return;

      const placement = await findDocxImagePlacement(zip, mediaNames);
      const paragraph = findRenderedParagraph(ed, placement);
      if (!paragraph) return;

      const data = await zip.files[placement.mediaName].async('base64');
      const ext = (placement.mediaName.split('.').pop() || 'png').toLowerCase();
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'gif' ? 'image/gif' : ext === 'svg' ? 'image/svg+xml' : 'image/png';
      const img = document.createElement('img');
      img.src = `data:${mime};base64,${data}`;
      img.alt = 'Resume logo';
      img.className = 'glueful-docx-image-recovered-inline';
      img.draggable = true;

      /* Use the DOCX drawing dimensions instead of inventing a mobile size. */
      if (placement.widthEmu > 0) img.style.width = `${placement.widthEmu / 9525}px`;
      if (placement.heightEmu > 0) img.style.height = `${placement.heightEmu / 9525}px`;

      /* Preserve the paragraph's existing alignment and flow. Do not move text. */
      paragraph.insertBefore(img, paragraph.firstChild);
      ed.classList.add('glueful-docx-image-recovered');

      console.info('[Glueful Resume Studio] Recovered the single DOCX image in-place.', placement);
    } catch (error) {
      console.warn('[Glueful Resume Studio] In-place DOCX image recovery skipped:', error);
    }
  }

  let recoverObserver;

  function boot() {
    injectStyles();
    const modal = $(MODAL_ID);
    if (!modal) return;

    const refresh = () => {
      if (!modal.classList.contains('open')) {
        removeControls();
        return;
      }

      installControls();
      installPinchZoom();

      if (isMobile() && !editor()?.dataset.gluefulMobileFitted) {
        setTimeout(() => {
          fitWidth();
          const el = editor();
          if (el) el.dataset.gluefulMobileFitted = '1';
        }, 80);
      }

      void recoverSingleDocxImageIfNeeded();
    };

    if (!recoverObserver) {
      recoverObserver = new MutationObserver(refresh);
      recoverObserver.observe(modal, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
    }

    window.addEventListener('resize', () => {
      if (isMobile() && modal.classList.contains('open')) fitWidth();
    }, { passive: true });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        if (isMobile() && modal.classList.contains('open')) fitWidth();
      }, 250);
    }, { passive: true });

    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
