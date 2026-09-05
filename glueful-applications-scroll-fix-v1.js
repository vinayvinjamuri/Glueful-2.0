/* Glueful — Applications Scroll Fix V1
 * Keeps the Applications view at the top when navigation activates it.
 * Presentation/navigation safety only; no application data is changed.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_SCROLL_FIX_V1__) return;
  window.__GLUEFUL_APPLICATIONS_SCROLL_FIX_V1__=true;

  function reset(){
    try{
      window.scrollTo({top:0,left:0,behavior:'auto'});
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
    }catch(e){
      window.scrollTo(0,0);
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
    }
  }

  function watch(){
    reset();
    setTimeout(reset,50);
    setTimeout(reset,250);
    setTimeout(reset,600);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',watch,{once:true});
  else watch();

  document.addEventListener('click',function(e){
    const target=e.target&&e.target.closest?e.target.closest('button,a,[role="button"]'):null;
    if(!target) return;
    const text=(target.textContent||'').trim();
    if(/applications/i.test(text) && !/add application/i.test(text)) setTimeout(reset,0);
  },true);
})();
