/**
 * ============================================================================
 * Cortex Quest — Hash-Based Single Page Application Router (CortexRouter)
 * ============================================================================
 * Exposes window.CortexRouter
 * Handles routing, route registration, query parameter parsing, animations, and document title.
 */

(function () {
  'use strict';

  function ensureRouterStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('cq-router-styles')) return;

    const style = document.createElement('style');
    style.id = 'cq-router-styles';
    style.textContent = `
      .cq-page-enter {
        animation: cqPageFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      @keyframes cqPageFadeIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  const routes = {};
  let currentActiveRoute = null;
  let currentActiveParams = {};
  let isRouting = false;

  const ROUTE_TITLES = {
    'splash': 'Welcome',
    'login': 'Sign In',
    'register': 'Create Account',
    'dashboard': 'Command Center',
    'modules': 'Quest Modules',
    'level-map': 'Module Levels',
    'quiz': 'Challenge in Progress',
    'results': 'Quest Results',
    'achievements': 'Trophies & Badges',
    'leaderboard': 'Global Rankings',
    'store': 'Bazaar & Power-Ups',
    'mock-test': 'Timed Mock Exam',
    'brain-training': 'Block Neural Matrix',
    'profile': 'Scholar Profile',
    'daily-challenge': 'Daily Objective'
  };

  const CortexRouter = {
    /**
     * Initialize router, bind hashchange listener, render initial route
     */
    init: function () {
      ensureRouterStyles();

      window.addEventListener('hashchange', () => {
        CortexRouter.onHashChange();
      });

      // Intercept anchor clicks matching #/
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#/"], [data-route]');
        if (link) {
          const targetRoute = link.getAttribute('data-route') || link.getAttribute('href').replace(/^#\/?/, '');
          if (targetRoute) {
            e.preventDefault();
            CortexRouter.navigate(targetRoute);
          }
        }
      });

      // Render starting route
      CortexRouter.onHashChange();
    },

    /**
     * Register a route handler function
     * @param {string} route 
     * @param {Function} renderFn (params, container) => string | HTMLElement | Promise<void>
     */
    registerPage: function (route, renderFn) {
      if (!route || typeof renderFn !== 'function') return;
      const cleanRoute = route.replace(/^#?\/?/, '').toLowerCase();
      routes[cleanRoute] = renderFn;
    },

    /**
     * Navigate to route with optional query parameters
     * @param {string} route 
     * @param {object} [params={}] 
     */
    navigate: function (route, params = {}) {
      if (!route) return;
      const cleanRoute = route.replace(/^#?\/?/, '').split('?')[0].toLowerCase();
      let newHash = `#/${cleanRoute}`;

      const keys = Object.keys(params);
      if (keys.length > 0) {
        const usp = new URLSearchParams();
        keys.forEach(k => {
          if (params[k] !== undefined && params[k] !== null) {
            usp.append(k, params[k]);
          }
        });
        const query = usp.toString();
        if (query) {
          newHash += `?${query}`;
        }
      }

      if (window.location.hash === newHash) {
        // If hash is already equal, hashchange won't fire automatically
        CortexRouter.onHashChange();
      } else {
        window.location.hash = newHash;
      }
    },

    /**
     * Get current route identifier
     * @returns {string} e.g. 'dashboard', 'quiz', 'splash'
     */
    getCurrentRoute: function () {
      const rawHash = window.location.hash || '';
      if (!rawHash || rawHash === '#' || rawHash === '#/') {
        return 'splash';
      }
      const pathPart = rawHash.replace(/^#\/?/, '').split('?')[0];
      return pathPart.toLowerCase() || 'splash';
    },

    /**
     * Parse query parameters from hash
     * @returns {object} key-value map
     */
    getCurrentParams: function () {
      const rawHash = window.location.hash || '';
      const qIndex = rawHash.indexOf('?');
      if (qIndex === -1) return {};

      const queryString = rawHash.slice(qIndex + 1);
      const usp = new URLSearchParams(queryString);
      const params = {};
      for (const [key, value] of usp.entries()) {
        params[key] = value;
      }
      return params;
    },

    /**
     * Set page title helper
     */
    setTitle: function (title) {
      if (typeof document !== 'undefined') {
        document.title = title ? `${title} | Cortex Quest` : 'Cortex Quest — Gamified Learning';
      }
    },

    /**
     * Route change lifecycle: lookup handler, update #cq-main, animate
     */
    onHashChange: async function () {
      if (isRouting) return;
      isRouting = true;

      try {
        const route = CortexRouter.getCurrentRoute();
        const params = CortexRouter.getCurrentParams();
        currentActiveRoute = route;
        currentActiveParams = params;

        let mainContainer = document.getElementById('cq-main');
        if (!mainContainer) {
          mainContainer = document.querySelector('main');
        }
        if (!mainContainer) {
          // If no main container found in DOM yet, create it
          mainContainer = document.createElement('main');
          mainContainer.id = 'cq-main';
          document.body.appendChild(mainContainer);
        }

        // Set appropriate page title
        const pageTitle = ROUTE_TITLES[route] || CortexRouter.capitalize(route.replace(/-/g, ' '));
        CortexRouter.setTitle(pageTitle);

        // Check if page handler is registered
        const handler = routes[route];
        if (!handler) {
          // Fallback to splash if route unknown
          if (route !== 'splash' && routes['splash']) {
            isRouting = false;
            CortexRouter.navigate('splash');
            return;
          }
        }

        // Before rendering: scroll to top and clear container
        window.scrollTo({ top: 0, behavior: 'instant' });
        mainContainer.innerHTML = '';

        if (typeof handler === 'function') {
          const result = await handler(params, mainContainer);
          if (typeof result === 'string') {
            mainContainer.innerHTML = result;
          } else if (result instanceof HTMLElement) {
            mainContainer.appendChild(result);
          }
        }

        // Trigger entrance animation
        const pageRoot = mainContainer.querySelector('.cq-page') || mainContainer.firstElementChild;
        if (pageRoot) {
          pageRoot.classList.remove('cq-page-enter');
          void pageRoot.offsetWidth; // Force DOM reflow
          pageRoot.classList.add('cq-page-enter');
        }

        // Update active navigation links across the app
        CortexRouter.updateNavLinks(route);

        // Dispatch router event
        window.dispatchEvent(new CustomEvent('cortex-route-changed', {
          detail: { route, params }
        }));
      } catch (err) {
        console.error('[CortexRouter] Navigation error:', err);
      } finally {
        isRouting = false;
      }
    },

    /**
     * Helper to capitalize words
     */
    capitalize: function (str) {
      if (!str) return '';
      return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    },

    /**
     * Update active state on navigation elements matching current route
     */
    updateNavLinks: function (currentRoute) {
      if (typeof document === 'undefined') return;

      document.querySelectorAll('[data-nav-route], a[href^="#/"]').forEach(el => {
        const routeAttr = el.getAttribute('data-nav-route') || el.getAttribute('href').replace(/^#\/?/, '').split('?')[0];
        if (routeAttr === currentRoute) {
          el.classList.add('active');
          el.setAttribute('aria-current', 'page');
        } else {
          el.classList.remove('active');
          el.removeAttribute('aria-current');
        }
      });
    }
  };

  // Expose on global window
  window.CortexRouter = CortexRouter;

  // Initialize router when DOM is ready
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => CortexRouter.init());
    } else {
      CortexRouter.init();
    }
  }
})();
