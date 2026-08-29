/* Glueful mobile cleanup V1
 * Fixes two UI regressions without touching Jobs data/rendering:
 * 1) literal "\\n" text leaking into the page
 * 2) unstable/glitched splash logo rendering
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_MOBILE_CLEANUP_V1__) return;
  window.__GLUEFUL_MOBILE_CLEANUP_V1__=true;

  const LITERAL_NEWLINE=/\\n/g;

  function removeLiteralNewlineText(root){
    if(!root) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    let node;
    while((node=walker.nextNode())) nodes.push(node);
    nodes.forEach(function(textNode){
      const value=String(textNode.nodeValue||'');
      if(!LITERAL_NEWLINE.test(value)){
        LITERAL_NEWLINE.lastIndex=0;
        return;
      }
      LITERAL_NEWLINE.lastIndex=0;
      const cleaned=value.replace(LITERAL_NEWLINE,'');
      if(cleaned.trim()==='') textNode.remove();
      else textNode.nodeValue=cleaned;
    });
  }

  function stabilizeSplashLogo(){
    const splash=document.getElementById('glueful-splash');
    if(!splash) return;
    const host=splash.querySelector('.glueful-splash-logo');
    const img=host?.querySelector('img');
    if(!host||!img) return;

    if(host.dataset.gluefulStableLogo!=='1'){
      host.dataset.gluefulStableLogo='1';
      host.classList.add('glueful-stable-splash-logo');
      host.style.animation='none';
      host.style.transform='none';
      host.style.willChange='auto';
      host.style.overflow='hidden';
      host.style.display='flex';
      host.style.alignItems='center';
      host.style.justifyContent='center';
      host.style.background='#05070D';
      img.style.width='100%';
      img.style.height='100%';
      img.style.display='block';
      img.style.objectFit='contain';
      img.style.objectPosition='center';
      img.style.transform='none';
      img.style.filter='none';
      img.style.mixBlendMode='normal';
      img.decoding='async';
      img.loading='eager';
    }

    const stableSrc='./icons/icon-512.png?v=20260829-logo-fix';
    if(!img.dataset.gluefulStableSrc){
      img.dataset.gluefulStableSrc='1';
      img.removeAttribute('srcset');
      img.src=stableSrc;
    }
  }

  function clean(){
    removeLiteralNewlineText(document.body);
    stabilizeSplashLogo();
  }

  function boot(){
    clean();
    const observer=new MutationObserver(function(mutations){
      let relevant=false;
      mutations.forEach(function(m){
        if(m.type==='characterData' || m.addedNodes.length) relevant=true;
      });
      if(relevant) clean();
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    window.__GLUEFUL_MOBILE_CLEANUP_READY__=true;
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
