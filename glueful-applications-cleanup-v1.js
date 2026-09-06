/* Glueful Applications — Cleanup V1
 * Removes presentation artifacts left by older Applications layout layers.
 * The sidebar owns the Glueful brand and Profile/Settings entry, so the
 * Applications canvas must not render duplicate copies.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_APPLICATIONS_CLEANUP_V1__) return;
  window.__GLUEFUL_APPLICATIONS_CLEANUP_V1__=true;

  const VIEW='view-applications';
  const STYLE='gf-applications-cleanup-v1-style';

  function active(){
    const v=document.getElementById(VIEW);
    return !!v&&(v.classList.contains('active')||v.style.display==='block');
  }

  function cleanup(){
    const v=document.getElementById(VIEW);
    if(!v||!active()) return;

    /* V5 injected a second Glueful brand into the Applications header.
       The permanent sidebar already contains the real brand. */
    v.querySelectorAll('#gf-brand-v5,#gf-brand-v4,#glueful-applications-reference-brand-v3').forEach(el=>el.remove());

    /* Do not show a second Profile/Settings control inside Applications.
       Profile remains available from the permanent sidebar. */
    v.querySelectorAll('#gf-profile-v5,#gf-profile-v4,#glueful-applications-reference-profile-v3,.profile-button').forEach(el=>el.remove());
    v.querySelectorAll('button[aria-label*="profile" i],button[aria-label*="settings" i],button[title*="profile" i],button[title*="settings" i]').forEach(el=>el.remove());
  }

  function installStyle(){
    if(document.getElementById(STYLE)) return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      #${VIEW} #gf-brand-v5,
      #${VIEW} #gf-brand-v4,
      #${VIEW} #glueful-applications-reference-brand-v3,
      #${VIEW} #gf-profile-v5,
      #${VIEW} #gf-profile-v4,
      #${VIEW} #glueful-applications-reference-profile-v3,
      #${VIEW} .profile-button,
      #${VIEW} button[aria-label*="profile" i],
      #${VIEW} button[aria-label*="settings" i],
      #${VIEW} button[title*="profile" i],
      #${VIEW} button[title*="settings" i]{display:none!important;visibility:hidden!important;pointer-events:none!important}
    `;
    document.head.appendChild(s);
  }

  function start(){
    installStyle();
    cleanup();
    [100,400,1000,2000,3500].forEach(t=>setTimeout(cleanup,t));
    new MutationObserver(cleanup).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','aria-label','title']});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
