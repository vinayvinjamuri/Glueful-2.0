/* Glueful dashboard cleanup v1 — permanently remove the Job Network panel from Dashboard. */
(function(){
  'use strict';
  var DONE='data-glueful-job-network-removed';

  function hideNetwork(){
    var dashboard=document.getElementById('view-dashboard');
    if(!dashboard) return;

    var nodes=dashboard.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span');
    for(var i=0;i<nodes.length;i++){
      var el=nodes[i];
      if(el.children.length!==0) continue;
      var label=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(label!=='job network') continue;

      var best=null;
      var p=el;
      for(var depth=0;p&&depth<10;depth++,p=p.parentElement){
        var text=(p.textContent||'').replace(/\s+/g,' ').toLowerCase();
        var score=0;
        if(text.indexOf('company discovery')>=0) score++;
        if(text.indexOf('source health')>=0) score++;
        if(text.indexOf('active jobs')>=0) score++;
        if(text.indexOf('jobs added')>=0) score++;
        if(text.indexOf('healthy sources')>=0) score++;
        if(score>=3){best=p;break;}
      }

      if(best){
        best.style.setProperty('display','none','important');
        best.setAttribute(DONE,'1');
      }else{
        el.style.setProperty('display','none','important');
      }
    }
  }

  function start(){
    hideNetwork();
    var observer=new MutationObserver(function(){hideNetwork()});
    observer.observe(document.body,{subtree:true,childList:true});
    [100,300,700,1500,3000,6000,10000].forEach(function(t){setTimeout(hideNetwork,t)});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
