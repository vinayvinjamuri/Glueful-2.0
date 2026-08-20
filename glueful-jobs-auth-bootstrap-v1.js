/* Glueful Jobs auth bootstrap — exposes a session-capable Supabase client to injected job runtimes. */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_AUTH_BOOTSTRAP__) return;
  window.__GLUEFUL_JOBS_AUTH_BOOTSTRAP__=true;
  try{
    if(window.supabase && typeof window.supabase.createClient==='function' && !window.supabaseClient){
      window.supabaseClient=window.supabase.createClient(
        'https://xztbhheexianejsvwpva.supabase.co',
        'sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN',
        {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
      );
    }
  }catch(e){console.warn('[Glueful Jobs] auth bootstrap failed',e)}
})();
