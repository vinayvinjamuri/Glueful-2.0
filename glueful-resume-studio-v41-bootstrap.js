/* Glueful Resume Studio V41 bootstrap.
 * Loaded before the app's own scripts by the service worker.
 * The V40 resume studio used a document-wide MutationObserver. That observer
 * fired for every contenteditable mutation, so block that specific pattern.
 */
(function(){
  try{
    if(window.__gluefulV41BodyObserverGuard) return;
    const NativeObserve = MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function(target, options){
      if(target === document.body && options && options.childList && options.subtree){
        return;
      }
      return NativeObserve.call(this, target, options);
    };
    window.__gluefulV41BodyObserverGuard = true;
  }catch(error){
    console.warn('[Glueful Resume Studio V41] bootstrap guard failed:', error);
  }
})();
