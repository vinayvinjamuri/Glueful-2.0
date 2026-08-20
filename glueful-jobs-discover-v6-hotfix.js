/* Glueful Jobs Discover V6 hotfix */
(function(){'use strict';
function restore(){if(!document.querySelector('.g6-sheet'))document.body.style.removeProperty('overflow')}
document.addEventListener('click',function(){setTimeout(restore,0)},true);
window.addEventListener('pageshow',restore);
})();