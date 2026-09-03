/* Glueful — Profile & Settings Instant Open V1
 * Opens the profile sheet immediately. The existing openProfile() routine
 * continues in the background to hydrate account fields and theme state.
 */
(function () {
  'use strict';
  if (window.__GLUEFUL_PROFILE_INSTANT_OPEN_V1__) return;
  window.__GLUEFUL_PROFILE_INSTANT_OPEN_V1__ = true;

  function showProfileSheet() {
    const sheet = document.getElementById('profile-sheet');
    if (!sheet) return false;
    sheet.classList.add('open');
    return true;
  }

  function install() {
    const original = window.openProfile;
    if (typeof original !== 'function') {
      setTimeout(install, 50);
      return;
    }
    if (original.__gluefulProfileInstantWrapped) return;

    async function instantOpenProfile() {
      // Critical path: make the destination visible before any auth/network
      // operation can delay the interaction.
      const opened = showProfileSheet();

      // Preserve the existing profile loading, field hydration and theme
      // behavior without making the tap wait for supabase.auth.getUser().
      setTimeout(() => {
        Promise.resolve(original.apply(this, arguments)).catch(error => {
          console.error('[Glueful] Profile background load failed:', error);
        });
      }, 0);

      return opened;
    }

    instantOpenProfile.__gluefulProfileInstantWrapped = true;
    instantOpenProfile.__gluefulOriginal = original;
    window.openProfile = instantOpenProfile;
  }

  install();
})();
