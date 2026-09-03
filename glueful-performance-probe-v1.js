/* Glueful Performance Probe V1
 * Diagnostic only. Measures long main-thread tasks and slow interactions.
 * No UI mutation and no feature behavior changes.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_PERFORMANCE_PROBE_V1__) return;
  window.__GLUEFUL_PERFORMANCE_PROBE_V1__=true;

  const longTasks=[];
  const interactions=[];
  const now=()=>performance.now();
  const record=(type,duration,name)=>{
    const item={type,duration:Math.round(duration),name:name||'' ,time:Math.round(now())};
    if(type==='longtask') longTasks.push(item); else interactions.push(item);
    if(longTasks.length>40)longTasks.shift();
    if(interactions.length>40)interactions.shift();
  };

  if('PerformanceObserver' in window){
    try{
      const po=new PerformanceObserver(list=>list.getEntries().forEach(e=>{
        if(e.duration>=50)record('longtask',e.duration,e.name);
      }));
      po.observe({type:'longtask',buffered:true});
    }catch(e){}
    try{
      const po=new PerformanceObserver(list=>list.getEntries().forEach(e=>{
        if(e.duration>=100)record('interaction',e.duration,e.name);
      }));
      po.observe({type:'event',buffered:true,durationThreshold:100});
    }catch(e){}
  }

  window.gluefulPerformanceProbe={
    get:()=>({longTasks:[...longTasks],interactions:[...interactions],now:Math.round(now())}),
    clear:()=>{longTasks.length=0;interactions.length=0;}
  };
})();
