/**
 * ============================================================================
 * Cortex Quest — Theme Manager (CortexTheme)
 * ============================================================================
 * Exposes window.CortexTheme
 * Supports Juniper Green Dark and Light modes.
 */

(function () {
  'use strict';

  function ensureThemeStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('cq-theme-override-styles')) return;

    const style = document.createElement('style');
    style.id = 'cq-theme-override-styles';
    style.textContent = `
      [data-theme="light"] {
        --cq-bg: #f5f0e8;
        --cq-bg-rgb: 245, 240, 232;
        --cq-surface: #e9e2d3;
        --cq-surface-rgb: 233, 226, 211;
        --cq-surface-alt: #ded5c2;
        --cq-surface-hover: #d2c7b0;
        --cq-surface-active: #c5b89e;
        --cq-surface-glass: rgba(245, 240, 232, 0.92);
        --cq-surface-glass-border: rgba(58, 83, 17, 0.25);
        --cq-text-primary: #152405;
        --cq-text-secondary: #354d14;
        --cq-text-muted: #647539;
        --cq-text-inverse: #f5f0e8;
        --cq-border: rgba(58, 83, 17, 0.25);
        --cq-border-light: rgba(58, 83, 17, 0.15);
        --cq-border-focus: #3A5311;
        --cq-divider: rgba(58, 83, 17, 0.18);
        --cq-shadow-sm: 0 2px 4px rgba(26, 45, 5, 0.08);
        --cq-shadow-md: 0 4px 12px rgba(26, 45, 5, 0.12);
        --cq-shadow-lg: 0 8px 24px rgba(26, 45, 5, 0.16);
        --cq-shadow-xl: 0 16px 40px rgba(26, 45, 5, 0.22);
      }
      [data-theme="light"] .cq-modal {
        background: #f7f3ec;
        color: #152405;
        border-color: rgba(58, 83, 17, 0.35);
      }
      [data-theme="light"] .cq-modal-title {
        color: #152405;
      }
      [data-theme="light"] .cq-modal-close-btn {
        background: rgba(0, 0, 0, 0.06);
        color: #152405;
      }
      [data-theme="light"] .cq-toast {
        background: #fdfaf5;
        color: #152405;
        border-color: rgba(58, 83, 17, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  const CortexTheme = {
    /**
     * Initialize theme from store or system preference
     */
    init: function () {
      ensureThemeStyles();

      let savedTheme = 'dark'; // Dark theme is default for Cortex Quest
      try {
        const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
        if (player && player.settings && player.settings.theme) {
          savedTheme = player.settings.theme;
        } else {
          const localVal = localStorage.getItem('cq_theme');
          if (localVal === 'light' || localVal === 'dark') {
            savedTheme = localVal;
          }
        }
      } catch (e) {
        // Fallback to dark
      }

      CortexTheme.setTheme(savedTheme);

      // Attach click listener for theme toggle buttons
      if (typeof document !== 'undefined') {
        const setupToggleListeners = () => {
          const btn = document.getElementById('cq-theme-toggle');
          if (btn && !btn.hasAttribute('data-cq-listener')) {
            btn.setAttribute('data-cq-listener', 'true');
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              CortexTheme.toggle();
            });
          }

          document.querySelectorAll('[data-theme-toggle]').forEach((el) => {
            if (!el.hasAttribute('data-cq-listener')) {
              el.setAttribute('data-cq-listener', 'true');
              el.addEventListener('click', (e) => {
                e.preventDefault();
                CortexTheme.toggle();
              });
            }
          });
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupToggleListeners);
        } else {
          setupToggleListeners();
        }
      }
    },

    /**
     * Get active theme name ('dark' | 'light')
     */
    getTheme: function () {
      if (typeof document !== 'undefined' && document.documentElement) {
        const attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'light' || attr === 'dark') return attr;
      }
      return 'dark';
    },

    /**
     * Set active theme and persist
     * @param {'dark'|'light'} theme 
     */
    setTheme: function (theme) {
      const mode = (theme === 'light') ? 'light' : 'dark';

      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.dataset.theme = mode;
        document.documentElement.setAttribute('data-theme', mode);
      }

      try {
        localStorage.setItem('cq_theme', mode);
        if (window.CortexStore && window.CortexStore.getPlayer()) {
          window.CortexStore.updatePlayer({
            settings: { theme: mode }
          });
        }
      } catch (e) {
        // Storage fail-safe
      }

      CortexTheme.updateToggleUI(mode);

      // Notify other components if needed
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        try {
          window.dispatchEvent(new CustomEvent('cortex-theme-changed', { detail: { theme: mode } }));
        } catch (e) {}
      }
    },

    /**
     * Toggle between dark and light themes
     */
    toggle: function () {
      const current = CortexTheme.getTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      CortexTheme.setTheme(next);
      return next;
    },

    /**
     * Check if dark mode is active
     */
    isDark: function () {
      return CortexTheme.getTheme() === 'dark';
    },

    /**
     * Update icon and label of toggle button(s)
     */
    updateToggleUI: function (mode) {
      if (typeof document === 'undefined') return;

      const icon = mode === 'dark' ? '☀️' : '🌙';
      const label = mode === 'dark' ? 'Light Mode' : 'Dark Mode';

      const toggleBtn = document.getElementById('cq-theme-toggle');
      if (toggleBtn) {
        const iconEl = toggleBtn.querySelector('.cq-theme-icon') || toggleBtn;
        if (iconEl.tagName === 'SPAN' || iconEl.tagName === 'DIV' || iconEl.id === 'cq-theme-toggle') {
          if (toggleBtn.querySelector('.cq-theme-icon')) {
            toggleBtn.querySelector('.cq-theme-icon').textContent = icon;
          } else {
            toggleBtn.innerHTML = `<span class="cq-theme-icon">${icon}</span> <span class="cq-theme-label d-none d-md-inline ms-1">${label}</span>`;
          }
        }
        toggleBtn.setAttribute('title', `Switch to ${label}`);
        toggleBtn.setAttribute('aria-label', `Switch to ${label}`);
      }

      document.querySelectorAll('[data-theme-toggle]').forEach((el) => {
        el.setAttribute('title', `Switch to ${label}`);
        el.setAttribute('aria-label', `Switch to ${label}`);
        const iconChild = el.querySelector('.cq-theme-icon');
        if (iconChild) {
          iconChild.textContent = icon;
        }
      });
    }
  };

  // Expose on global window
  window.CortexTheme = CortexTheme;

  // Auto-init theme as early as possible to prevent flash of wrong theme
  if (typeof window !== 'undefined') {
    CortexTheme.init();
  }
})();
