/*
 * Glueful Orbit bootstrap
 *
 * Exposes the existing global-script Supabase client to the Orbit runtime.
 * No new client is created, so auth/session state stays shared with Glueful.
 *
 * Complexity:
 * - Time: O(1)
 * - Space: O(1)
 */
(function () {
  "use strict";

  try {
    if (!window.supabaseClient && typeof supabaseClient !== "undefined") {
      window.supabaseClient = supabaseClient;
    }
  } catch (error) {
    console.warn("[Orbit] Supabase client bridge unavailable", error);
  }
})();
