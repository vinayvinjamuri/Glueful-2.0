/* Glueful — Feature Loader V4 */
(function(){
'use strict';
if(window.__GLUEFUL_FEATURE_LOADER_V4__)return;
window.__GLUEFUL_FEATURE_LOADER_V4__=true;
const GROUPS={
applications:['./glueful-navigation-responsive-v1.js','./glueful-profile-instant-open-v1.js','./glueful-dashboard-hamburger-v2.js','./glueful-applications-reference-v4.js?v=1'],
dashboard:['./glueful-navigation-responsive-v1.js','./glueful-profile-instant-open-v1.js','./glueful-dashboard-fixed-v1.js','./glueful-dashboard-header-fix-v1.js','./glueful-dashboard-hamburger-v2.js'],
jobs:['./glueful-jobs-auth-bootstrap-v1.js','./glueful-jobs-discover-v15-authoritative.js'],
resume:['./glueful-resume-render-diagnostics.js','./glueful-resume-fixed-page-bootstrap.js'],
gmail:['./glueful-gmail-loader-v1.js'],
orbit:['./glueful-orbit-bootstrap-v1.js','./glueful-orbit-v2.js']};
const loaded={},loading={};
function active(id){const e=document.getElementById(id);return !!e&&(e.classList.contains('active')||e.style.display==='block')}
function load(src){return new Promise((ok,bad)=>{if(document.querySelector('script[data-gf-v4="'+src+'"]'))return ok();const s=document.createElement('script');s.src=src;s.async=false;s.dataset.gfV4=src;s.onload=ok;s.onerror=bad;document.body.appendChild(s)})}
async function group(n){if(loaded[n])return;if(loading[n])return loading[n];loading[n]=(async()=>{for(const src of GROUPS[n]||[]){try{await load(src)}catch(e){console.warn('[Glueful] feature load failed',src,e)}}loaded[n]=1;const v={applications:'view-applications',dashboard:'view-dashboard',jobs:'view-jobs',resume:'view-resume',gmail:'view-gmail'}[n];if(v&&active(v))window.dispatchEvent(new CustomEvent('glueful-initial-view-ready',{detail:{group:n,view:v}}))})();return loading[n]}
function sync(){if(active('view-applications'))group('applications');if(active('view-dashboard'))group('dashboard');if(active('view-jobs'))group('jobs');if(active('view-resume'))group('resume');if(active('view-gmail'))group('gmail');const o=document.getElementById('glueful-orbit-v2-root');if(o&&(o.classList.contains('open')||o.style.display==='block'))group('orbit')}
window.gluefulLoadFeature=group;window.gluefulFeatureLoader={sync,loaded,groups:Object.keys(GROUPS)};
function boot(){sync();new MutationObserver(sync).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();