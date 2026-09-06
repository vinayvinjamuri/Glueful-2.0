/* Glueful — Interviews Final Layout V2
 * Safe presentation guard. Removes the legacy duplicate presentation without
 * deleting interview data or action handlers. No document-wide mutation loop.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_INTERVIEWS_FINAL_LAYOUT_V2__) return;
  window.__GLUEFUL_INTERVIEWS_FINAL_LAYOUT_V2__=true;

  const VIEW='view-interviews';
  const SHELLS=['.glueful-interviews-reference-v6-shell','.glueful-interviews-final-v1-shell'];
  const STYLE='glueful-interviews-final-layout-v2-style';

  function installStyle(){
    if(document.getElementById(STYLE)) return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      @media(min-width:1280px){
        body #${VIEW}{position:fixed!important;left:245px!important;right:0!important;top:0!important;bottom:0!important;width:auto!important;height:100vh!important;margin:0!important;padding:16px 64px 48px!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;background:#f7f8fc!important;}
        body #${VIEW}>.glueful-interviews-reference-v6-shell,body #${VIEW}>.glueful-interviews-final-v1-shell{display:block!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;box-sizing:border-box!important;}
        body #${VIEW} .glueful-interviews-final-layout-legacy-hidden{display:none!important;}
      }
      @media(min-width:768px) and (max-width:1279px){
        body #${VIEW}{margin-left:260px!important;width:calc(100vw - 260px)!important;box-sizing:border-box!important;overflow-x:hidden!important;}
        body #${VIEW} .glueful-interviews-final-layout-legacy-hidden{display:none!important;}
      }
    `;
    document.head.appendChild(s);
  }

  function hasShell(v){return SHELLS.some(sel=>v.querySelector(sel));}
  function hasCards(v){return !!v.querySelector('.interview-card,.interview-item,[class*="interview-card"],[data-interview-id]');}
  function hide(el){if(el)el.classList.add('glueful-interviews-final-layout-legacy-hidden');}

  function hideLegacy(v){
    const shell=SHELLS.map(sel=>v.querySelector(sel)).find(Boolean);
    if(!shell) return;

    /* Empty state: there are no data cards, so every non-shell direct child is
       legacy presentation. This removes the duplicate header, title, toolbar,
       filters and empty box in one deterministic operation. */
    if(!hasCards(v)){
      Array.from(v.children).forEach(function(el){if(el!==shell)hide(el);});
      return;
    }

    /* With real interview cards present, preserve the data/action containers and
       hide only recognizable legacy presentation elements. */
    v.querySelectorAll('.view-title').forEach(function(el){if(!el.closest(SHELLS.join(',')))hide(el);});
    v.querySelectorAll('button').forEach(function(b){
      if(b.closest(SHELLS.join(','))) return;
      const t=(b.textContent||'').replace(/\s+/g,' ').trim();
      if(/^\+?\s*add interview/i.test(t)||/add interview/i.test(t)) hide(b);
    });

    const legacyText=['Never miss an interview','No interviews yet.'];
    v.querySelectorAll('p,div,span,h1,h2,h3').forEach(function(el){
      if(el.closest(SHELLS.join(','))) return;
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(legacyText.includes(t)) hide(el);
    });
  }

  function run(){
    installStyle();
    const v=document.getElementById(VIEW);
    if(!v||!hasShell(v)) return;
    hideLegacy(v);
  }

  function start(){
    run();
    const v=document.getElementById(VIEW);
    if(v){
      const mo=new MutationObserver(function(mutations){
        for(const m of mutations){
          if(m.type==='childList' && (m.addedNodes.length||m.removedNodes.length)){run();break;}
        }
      });
      mo.observe(v,{childList:true,subtree:true});
    }
    [100,300,750,1500,3000].forEach(function(t){setTimeout(run,t);});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
