/* Glueful mobile cleanup V2
 * Source-level runtime guard for two mobile regressions:
 * 1) literal "\\n" text leaking into the page
 * 2) animated/glitched splash logo rendering
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_MOBILE_CLEANUP_V2__) return;
  window.__GLUEFUL_MOBILE_CLEANUP_V2__=true;

  function removeLiteralNewlineText(root){
    if(!root) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    let node;
    while((node=walker.nextNode())) nodes.push(node);

    nodes.forEach(function(textNode){
      const value=String(textNode.nodeValue||'');
      if(!value.includes('\\n')) return;

      // Remove the literal two-character sequence backslash+n, including
      // repeated sequences, without touching real line breaks or content.
      const cleaned=value.replace(/\\n+/g,'');
      if(cleaned.trim()==='') textNode.remove();
      else textNode.nodeValue=cleaned;
    });
  }

  function stabilizeSplashLogo(){
    const splash=document.getElementById('glueful-splash');
    if(!splash) return;

    let host=splash.querySelector('.glueful-splash-logo');
    if(!host) return;

    if(host.dataset.gluefulStableLogo!=='2'){
      host.dataset.gluefulStableLogo='2';
      host.classList.add('glueful-stable-splash-logo');

      // Kill all animation/compositing effects that can produce a transient
      // distorted logo on mobile GPUs.
      host.style.setProperty('animation','none','important');
      host.style.setProperty('transform','none','important');
      host.style.setProperty('filter','none','important');
      host.style.setProperty('mix-blend-mode','normal','important');
      host.style.setProperty('will-change','auto','important');
      host.style.setProperty('overflow','hidden','important');
      host.style.setProperty('display','flex','important');
      host.style.setProperty('align-items','center','important');
      host.style.setProperty('justify-content','center','important');

      let img=host.querySelector('img');
      if(!img){
        img=document.createElement('img');
        host.replaceChildren(img);
      }

      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.loading='eager';
      img.decoding='sync';
      img.alt='Glueful';
      img.style.setProperty('width','100%','important');
      img.style.setProperty('height','100%','important');
      img.style.setProperty('display','block','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center','important');
      img.style.setProperty('transform','none','important');
      img.style.setProperty('filter','none','important');
      img.style.setProperty('mix-blend-mode','normal','important');

      // Use the stable app icon asset directly; cache-bust this fix.
      img.src='./icons/icon-192.png?v=20260829-logo-fix-v2';
    }
  }

  function installStableSplashCss(){
    if(document.getElementById('glueful-mobile-cleanup-v2-css')) return;
    const style=document.createElement('style');
    style.id='glueful-mobile-cleanup-v2-css';
    style.textContent='\n      #glueful-splash .glueful-splash-logo,\n      #glueful-splash .glueful-splash-logo img{\n        animation:none !important;\n        transform:none !important;\n        filter:none !important;\n        mix-blend-mode:normal !important;\n        will-change:auto !important;\n      }\n      #glueful-splash .glueful-splash-logo img{\n        width:100% !important;\n        height:100% !important;\n        object-fit:contain !important;\n        object-position:center !important;\n      }\n    ';
    (document.head||document.documentElement).appendChild(style);
  }

  function clean(){
    installStableSplashCss();
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
