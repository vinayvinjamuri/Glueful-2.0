/* Glueful — Navigation Responsive V2
 * Keeps drawer taps visually immediate and guarantees that only the
 * requested top-level application view is visible at any time.
 */
(function () {
  'use strict';
  if (window.__GLUEFUL_NAVIGATION_RESPONSIVE_V2__) return;
  window.__GLUEFUL_NAVIGATION_RESPONSIVE_V2__ = true;

  const VIEW_IDS = [
    'view-dashboard','view-applications','view-interviews','view-profile',
    'view-saved-jobs','view-settings','view-jobs','view-resume',
    'view-add-application','view-gmail'
  ];

  const VIEW_MAP = {
    dashboard:'view-dashboard', home:'view-dashboard',
    applications:'view-applications', application:'view-applications',
    interviews:'view-interviews', interview:'view-interviews',
    profile:'view-profile', settings:'view-settings',
    jobs:'view-jobs', 'saved-jobs':'view-saved-jobs', savedjobs:'view-saved-jobs',
    resume:'view-resume', resumes:'view-resume',
    'add-application':'view-add-application', addapplication:'view-add-application',
    gmail:'view-gmail'
  };

  let currentView = null;

  function normalize(view) {
    if (!view) return null;
    const value = String(view).trim().replace(/^#/, '').toLowerCase();
    if (VIEW_IDS.includes(value)) return value;
    return VIEW_MAP[value] || null;
  }

  function requestedView(el) {
    if (!el) return null;
    const data = el.getAttribute('data-view');
    const href = el.getAttribute('href');
    const onclick = el.getAttribute('onclick');
    return normalize(data) || normalize(href) || normalize(
      onclick && ((onclick.match(/(?:drawerNavigate|navigateTo|switchView)\s*\(\s*["']([^"']+)["']/i) || [])[1])
    );
  }

  function installIsolationCSS() {
    if (document.getElementById('glueful-single-view-navigation-style')) return;
    const style = document.createElement('style');
    style.id = 'glueful-single-view-navigation-style';
    style.textContent = VIEW_IDS.map(id => `body #${id}{display:none!important;}`).join('') +
      VIEW_IDS.map(id => `body #${id}.glueful-nav-visible{display:block!important;}`).join('');
    (document.head || document.documentElement).appendChild(style);
  }

  function syncView(view) {
    const target = normalize(view) || currentView || 'view-dashboard';
    const targetEl = document.getElementById(target);
    if (!targetEl) return;
    currentView = target;

    VIEW_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('glueful-nav-visible', id === target);
    });
  }

  function installTransitionStyles() {
    if (document.getElementById('glueful-navigation-transition-v2')) return;

    const style = document.createElement('style');
    style.id = 'glueful-navigation-transition-v2';
    style.textContent = `
      .glueful-nav-enter-v2 {
        animation: gluefulNavEnterV2 180ms cubic-bezier(.22,.8,.25,1) both;
        will-change: transform, opacity;
      }
      @keyframes gluefulNavEnterV2 {
        from { opacity:.72; transform:translate3d(12px,0,0); }
        to { opacity:1; transform:translate3d(0,0,0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .glueful-nav-enter-v2 { animation:none!important; }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function animateDestination(view) {
    const targetId = normalize(view);
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;
    target.classList.remove('glueful-nav-enter-v2');
    void target.offsetWidth;
    target.classList.add('glueful-nav-enter-v2');
    window.setTimeout(function () { target.classList.remove('glueful-nav-enter-v2'); }, 220);
  }

  function install() {
    installIsolationCSS();
    installTransitionStyles();

    document.addEventListener('click', function (event) {
      const item = event.target && event.target.closest ? event.target.closest(
        '.sidebar [data-view],.sidebar [href],.sidebar [onclick],' +
        '.side-nav [data-view],.side-nav [href],.side-nav [onclick],' +
        '.app-sidebar [data-view],.app-sidebar [href],.app-sidebar [onclick],' +
        '#glueful-drawer [data-view],#glueful-drawer [href],#glueful-drawer [onclick],nav [data-view],nav [href],nav [onclick]'
      ) : null;
      const target = requestedView(item);
      if (target) {
        // Glueful is a single-page app: internal view links must not
        // trigger a document navigation/reload. Keep the current runtime
        // alive and let the existing drawerNavigate handler switch views.
        event.preventDefault();
        syncView(target);
      }
    }, true);

    const original = window.drawerNavigate;
    if (typeof original === 'function' && !original.__gluefulNavigationResponsiveWrapped) {
      function responsiveDrawerNavigate(view) {
        const target = normalize(view);
        if (typeof window.toggleGluefulDrawer === 'function') {
          window.toggleGluefulDrawer(false);
        }
        if (target) syncView(target);

        const run = function () {
          try {
            original.call(this, view);
            if (target) {
              syncView(target);
              animateDestination(target);
              setTimeout(function () { syncView(target); }, 0);
              setTimeout(function () { syncView(target); }, 120);
              setTimeout(function () { syncView(target); }, 500);
            }
          } catch (error) {
            console.error('[Glueful] Navigation failed:', error);
          }
        };

        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(function () { setTimeout(run, 0); });
        } else {
          setTimeout(run, 0);
        }
      }

      responsiveDrawerNavigate.__gluefulNavigationResponsiveWrapped = true;
      responsiveDrawerNavigate.__gluefulOriginal = original;
      window.drawerNavigate = responsiveDrawerNavigate;
    }

    const observer = new MutationObserver(function () {
      if (currentView) syncView(currentView);
    });
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class','style','aria-hidden']
      });
    }

    const active = document.querySelector(
      '.sidebar .active,.side-nav .active,.app-sidebar .active,#glueful-drawer .active,' +
      'nav .active,[aria-current="page"],[aria-current="true"]'
    );
    syncView(requestedView(active) || 'view-dashboard');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
