/* Glueful — Navigation Responsive V1
 * Keeps drawer taps visually immediate even when the destination view has
 * heavier work to do. The drawer closes first; route work gets the next
 * browser turn so the tap can paint instead of feeling stuck.
 */
(function () {
  'use strict';
  if (window.__GLUEFUL_NAVIGATION_RESPONSIVE_V1__) return;
  window.__GLUEFUL_NAVIGATION_RESPONSIVE_V1__ = true;

  function install() {
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
