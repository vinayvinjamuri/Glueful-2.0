/* Resume Studio runtime bridge: expose the existing Supabase client safely.
 * The app creates it as a top-level const, which is not a window property.
 * The Adobe controller therefore cannot rely on window.supabaseClient.
 */
(function () {
  'use strict';
  try {
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      window.gluefulResumeSupabaseClient = supabaseClient;
      console.info('[Glueful Resume Studio] Supabase client bridge ready.');
    } else {
      console.error('[Glueful Resume Studio] Existing Supabase client is not available.');
    }
  } catch (error) {
    console.error('[Glueful Resume Studio] Supabase bridge failed:', error);
  }
})();
