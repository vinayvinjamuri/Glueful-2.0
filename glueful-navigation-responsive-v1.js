/* Glueful — Navigation Responsive V2
 * Keeps drawer taps visually immediate even when the destination view has
 * heavier work to do. Adds a very small view-entry transition after routing.
 * No observers, polling, or additional network work are introduced.
 */
(function () {
  'use strict';
  if (window.__GLUEFUL_NAVIGATION_RESPONSIVE_V2__) return;
  window.__GLUEFUL_NAVIGATION_RESPONSIVE_V2__ = true;

  function installTransitionStyles() {
    if (document.getElementById('glueful-navigation-transition-v2')) return;

    const style = document.createElement('style');
    style.id = 'glueful-navigation-transition-v2';
    style.textContent = `
      /* Premium, low-amplitude view entry: content feels like it arrives
         from the right without delaying the route or blocking interaction. */
      .glueful-nav-enter-v2 {
        animation: gluefulNavEnterV2 180ms cubic-bezier(.22,.8,.25,1) both;
        will-change: transform, opacity;
      }

      @keyframes gluefulNavEnterV2 {
        from {
          opacity: .72;
          transform: translate3d(12px, 0, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .glueful-nav-enter-v2 {
          animation: none !important;
        }
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function animateDestination(view) {
    const targetId = String(view || '').replace(/^#/, '');
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    target.classList.remove('glueful-nav-enter-v2');
    void target.offsetWidth;
    target.classList.add('glueful-nav-enter-v2');

    window.setTimeout(function () {
      target.classList.remove('glueful-nav-enter-v2');
    }, 220);
  }

  function install() {
    installTransitionStyles();

    const original = window.drawerNavigate;
    if (typeof original !== 'function') {
      setTimeout(install, 50);
      return;
    }
    if (original.__gluefulNavigationResponsiveWrapped) return;

    function responsiveDrawerNavigate(view) {
      // Make the menu reaction immediate. Do not wait for route rendering.
      if (typeof window.toggleGluefulDrawer === 'function') {
        window.toggleGluefulDrawer(false);
      }

      // Give the browser a paint opportunity before switchView and any
      // feature-loader work execute. This is especially important on mobile.
      const run = function () {
        try {
          original.call(this, view);
          animateDestination(view);
        } catch (error) {
          console.error('[Glueful] Navigation failed:', error);
        }
      };

      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(function () {
          setTimeout(run, 0);
        });
      } else {
        setTimeout(run, 0);
      }
    }

    responsiveDrawerNavigate.__gluefulNavigationResponsiveWrapped = true;
    responsiveDrawerNavigate.__gluefulOriginal = original;
    window.drawerNavigate = responsiveDrawerNavigate;
  }

  install();
})();
