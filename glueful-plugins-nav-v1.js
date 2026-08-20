/* Compatibility shim for the existing Jobs logo patch.
 * The authoritative Quick Actions / Plug-ins implementation lives in
 * glueful-jobs-logo-patch-v1.js. This file intentionally does not create a
 * second drawer or marketplace implementation.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_QUICK_ACTIONS_PLUGINS_V1__){
    console.log('[Glueful] Plug-ins: existing authoritative implementation active');
  }
})();
