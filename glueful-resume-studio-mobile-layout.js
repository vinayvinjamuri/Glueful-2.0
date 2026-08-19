/* =========================================================
   GLUEFUL RESUME STUDIO — MOBILE VIEWPORT LAYER
   ---------------------------------------------------------
   Mobile-only viewport behavior.
   The Adobe/docx-preview document and header-fidelity runtime remain
   authoritative for resume content, alignment, images, and positioning.
   This file must never reconstruct or move resume header/body content.
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

  let observer;
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
    };

    if (!observer) {
      observer = new MutationObserver(refresh);
      observer.observe(modal, {
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
