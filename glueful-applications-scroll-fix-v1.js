/* Glueful — Applications Scroll Fix V2
 * Forces the Applications view to start at the top after SPA navigation.
 * Presentation/navigation safety only; no application data is changed.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_SCROLL_FIX_V2__) return;
  window.__GLUEFUL_APPLICATIONS_SCROLL_FIX_V2__=true;

  try{ history.scrollRestoration='manual'; }catch(e){}

  function reset(){
    try{
      var scroller=document.scrollingElement||document.documentElement;
      if(scroller) scroller.scrollTop=0;
      document.documentElement.scrollTop=0;
      if(document.body) document.body.scrollTop=0;
      window.scrollTo(0,0);
    }catch(e){
      try{window.scrollTo(0,0);}catch(ignore){}
    }
  }

  function applicationsActive(){
    var view=document.getElementById('view-applications');
    return !!view&&(view.classList.contains('active')||view.style.display==='block');
  }

  function resetAfterActivation(){
    if(!applicationsActive()) return;
    reset();
    requestAnimationFrame(function(){
      reset();
      setTimeout(reset,50);
      setTimeout(reset,150);
      setTimeout(reset,350);
      setTimeout(reset,700);
      setTimeout(reset,1200);
    });
  }

  function boot(){
    resetAfterActivation();
    window.addEventListener('pageshow',resetAfterActivation,true);
    window.addEventListener('popstate',resetAfterActivation,true);
    window.addEventListener('hashchange',resetAfterActivation,true);

    document.addEventListener('click',function(e){
      var target=e.target&&e.target.closest?e.target.closest('button,a,[role="button"]'):null;
      if(!target) return;
      var text=(target.textContent||'').trim();
      if(/applications/i.test(text)&&!/add application/i.test(text)){
        setTimeout(resetAfterActivation,0);
        setTimeout(resetAfterActivation,100);
      }
    },true);

    var view=document.getElementById('view-applications');
    if(view){
      var observer=new MutationObserver(function(mutations){
        for(var i=0;i<mutations.length;i++){
          var m=mutations[i];
          if(m.type==='attributes'&&(m.attributeName==='class'||m.attributeName==='style')){
            if(applicationsActive()) resetAfterActivation();
            break;
          }
        }
      });
      observer.observe(view,{attributes:true,attributeFilter:['class','style']});
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
