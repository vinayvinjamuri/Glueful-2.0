/* Glueful — Critical Navigation V1
 *
 * Navigation is part of the app's critical interaction path. Keep this tiny
 * bridge globally available so hamburger/profile taps do not depend on the
 * lazy dashboard feature loader becoming ready first.
 */
(function () {
  'use strict';
  if (window.__GLUEFUL_CRITICAL_NAVIGATION_V1__) return;
  window.__GLUEFUL_CRITICAL_NAVIGATION_V1__ = true;

  function installDrawerNavigation() {
    const original = window.drawerNavigate;
    if (typeof original !== 'function') {
      setTimeout(installDrawerNavigation, 50);
      return;
    }
    if (original.__gluefulCriticalNavigationWrapped) return;

    function responsiveDrawerNavigate(view) {
      if (typeof window.toggleGluefulDrawer === 'function') {
        window.toggleGluefulDrawer(false);
      }

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

    responsiveDrawerNavigate.__gluefulCriticalNavigationWrapped = true;
    responsiveDrawerNavigate.__gluefulOriginal = original;
    window.drawerNavigate = responsiveDrawerNavigate;
  }

  function installProfileOpen() {
    const original = window.openProfile;
    if (typeof original !== 'function') {
      setTimeout(installProfileOpen, 50);
      return;
    }
    if (original.__gluefulCriticalProfileWrapped) return;

    async function instantOpenProfile() {
      const sheet = document.getElementById('profile-sheet');
      if (!sheet) return false;

      sheet.classList.add('open');

      setTimeout(function () {
        Promise.resolve(original.apply(this, arguments)).catch(function (error) {
          console.error('[Glueful] Profile background load failed:', error);
        });
      }, 0);

      return true;
    }

    instantOpenProfile.__gluefulCriticalProfileWrapped = true;
    instantOpenProfile.__gluefulOriginal = original;
    window.openProfile = instantOpenProfile;
  }

  installDrawerNavigation();
  installProfileOpen();
})();
