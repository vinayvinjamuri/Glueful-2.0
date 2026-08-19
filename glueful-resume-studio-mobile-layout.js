/* =========================================================
   GLUEFUL RESUME STUDIO — MOBILE VIEW + SAFE IMAGE RECOVERY
   ---------------------------------------------------------
   Evidence-driven runtime compatibility layer:
   - keeps the desktop DOCX renderer unchanged
   - makes the 794px Word page usable on mobile
   - restores native pinch gestures for the document viewport
   - exposes mobile zoom / fit-width / fit-page controls
   - only recovers a missing image when the Adobe DOCX contains
     exactly one media image and docx-preview rendered no images
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
      #${MODAL_ID} .glueful-mobile-view-controls{
        display:none;
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
        #${MODAL_ID} .job-resume-editor-actions{
          bottom:0!important;
        }
        #${MODAL_ID} .glueful-docx-header-recovered{
          display:flex!important;
          align-items:flex-start!important;
          gap:12px!important;
          width:100%!important;
          box-sizing:border-box!important;
          margin:0 0 14px!important;
        }
        #${MODAL_ID} .glueful-docx-header-recovered img{
          flex:0 0 auto!important;
          width:68px!important;
          height:68px!important;
          max-width:68px!important;
          object-fit:contain!important;
        }
        #${MODAL_ID} .glueful-docx-header-recovered .glueful-docx-header-text{
          min-width:0!important;
          flex:1 1 auto!important;
        }
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
      const ratio = distance / startDistance;
      setZoomPercent(startZoom * ratio);
      event.preventDefault();
    }, { passive: false });

    const reset = () => { startDistance = 0; };
    host.addEventListener('touchend', reset, { passive: true });
    host.addEventListener('touchcancel', reset, { passive: true });
  }

  async function recoverSingleDocxImageIfNeeded() {
    const report = window.gluefulResumeDocxForensics;
    const buffer = window.gluefulLastAdobeDocxBuffer;
    const ed = editor();
    if (!ed || !buffer || ed.classList.contains('glueful-docx-image-recovered')) return;
    if (ed.querySelector('img')) return;

    let JSZip = window.JSZip;
    if (!JSZip) {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', { cache: 'no-store' });
        if (!response.ok) return;
        const code = await response.text();
        (0, eval)(code);
        JSZip = window.JSZip;
      } catch (_) { return; }
    }
    if (!JSZip) return;

    try {
      const zip = await JSZip.loadAsync(buffer);
      const mediaNames = Object.keys(zip.files).filter((name) => /^word\/media\//i.test(name) && !zip.files[name].dir);
      if (mediaNames.length !== 1) return; // deterministic safety: no first-image heuristic

      const mediaName = mediaNames[0];
      const data = await zip.files[mediaName].async('base64');
      const ext = (mediaName.split('.').pop() || 'png').toLowerCase();
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'gif' ? 'image/gif' : ext === 'svg' ? 'image/svg+xml' : 'image/png';
      const dataUrl = `data:${mime};base64,${data}`;

      const page = ed.querySelector('.docx-wrapper > section, .docx > section') || ed.querySelector('.docx') || ed;
      const blocks = Array.from(page.children).filter((node) => node.textContent.trim()).slice(0, 4);
      if (!blocks.length) return;

      const header = document.createElement('div');
      header.className = 'glueful-docx-header-recovered';
      const img = document.createElement('img');
      img.src = dataUrl;
      img.alt = 'Resume header logo';
      img.draggable = true;
      const text = document.createElement('div');
      text.className = 'glueful-docx-header-text';
      blocks.forEach((node) => text.appendChild(node));
      header.append(img, text);
      page.insertBefore(header, page.firstChild);
      ed.classList.add('glueful-docx-image-recovered');
      console.info('[Glueful Resume Studio] Recovered the only DOCX media image into the document header.', { mediaName, source: report || null });
    } catch (error) {
      console.warn('[Glueful Resume Studio] Safe DOCX image recovery skipped:', error);
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
      recoverObserver.observe(modal, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    window.addEventListener('resize', () => { if (isMobile() && modal.classList.contains('open')) fitWidth(); }, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(() => { if (isMobile() && modal.classList.contains('open')) fitWidth(); }, 250), { passive: true });
    refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
