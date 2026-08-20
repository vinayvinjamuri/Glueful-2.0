/* Glueful Jobs V6 visual compatibility patch — fix company-name/card CSS collision */
(function(){'use strict';
const style=document.createElement('style');
style.id='glueful-jobs-v6-visual-fix';
style.textContent=`#glueful-discover-root-v6 .g6-card .g6-company{box-sizing:content-box;flex:none;min-height:0;width:auto;border:0;background:transparent;border-radius:0;color:var(--text-muted);padding:0;text-align:left;font-size:11px;font-weight:400;margin-top:4px;display:block}#glueful-discover-root-v6 .g6-card .g6-company strong,#glueful-discover-root-v6 .g6-card .g6-company b,#glueful-discover-root-v6 .g6-card .g6-company small{display:inline;font-size:inherit;min-height:0;margin:0;color:inherit}`;
document.head.appendChild(style);
window.__GLUEFUL_JOBS_LOGO_PATCH__={version:'20260820-jobs-v6-visual-fix'};
})();
