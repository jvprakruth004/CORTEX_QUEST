/**
 * ============================================================================
 * Cortex Quest — Core Utilities (CortexUtils)
 * ============================================================================
 * Exposes window.CortexUtils and window.hashPassword
 * No ES modules. Direct window assignment.
 */

(function () {
  'use strict';

  // Ensure helper styling for toast, modal, and particles is present in document
  function ensureCoreStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('cq-utils-styles')) return;

    const style = document.createElement('style');
    style.id = 'cq-utils-styles';
    style.textContent = `
      .cq-toast-container {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 1080;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
        max-width: 90vw;
        width: 360px;
      }
      .cq-toast {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 18px;
        border-radius: 12px;
        color: #e8f0d8;
        background: #1a2d0a;
        border: 1px solid rgba(122, 154, 92, 0.35);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 0.925rem;
        font-weight: 500;
        opacity: 0;
        transform: translateY(-12px) scale(0.96);
        transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .cq-toast.cq-toast-visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .cq-toast-success {
        border-color: rgba(34, 197, 94, 0.5);
        background: linear-gradient(135deg, rgba(26, 45, 10, 0.95), rgba(34, 197, 94, 0.2));
      }
      .cq-toast-error {
        border-color: rgba(239, 68, 68, 0.5);
        background: linear-gradient(135deg, rgba(35, 10, 10, 0.95), rgba(239, 68, 68, 0.2));
      }
      .cq-toast-warning {
        border-color: rgba(245, 158, 11, 0.5);
        background: linear-gradient(135deg, rgba(40, 25, 5, 0.95), rgba(245, 158, 11, 0.2));
      }
      .cq-toast-info {
        border-color: rgba(59, 130, 246, 0.5);
        background: linear-gradient(135deg, rgba(10, 25, 45, 0.95), rgba(59, 130, 246, 0.2));
      }
      .cq-toast-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
      }
      .cq-toast-content {
        flex: 1;
        line-height: 1.4;
        word-break: break-word;
      }
      .cq-toast-close {
        background: transparent;
        border: none;
        color: rgba(232, 240, 216, 0.6);
        cursor: pointer;
        padding: 4px;
        font-size: 1.1rem;
        line-height: 1;
        transition: color 0.15s ease;
      }
      .cq-toast-close:hover {
        color: #e8f0d8;
      }
      .cq-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(8, 15, 3, 0.78);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 1040;
        opacity: 0;
        transition: opacity 0.25s ease;
      }
      .cq-modal-backdrop.cq-modal-visible {
        opacity: 1;
      }
      .cq-modal-container {
        position: fixed;
        inset: 0;
        z-index: 1050;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        overflow-y: auto;
      }
      .cq-modal {
        background: #142208;
        color: #e8f0d8;
        border: 1px solid rgba(122, 154, 92, 0.35);
        border-radius: 18px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(58, 83, 17, 0.4);
        width: 100%;
        max-width: 540px;
        position: relative;
        overflow: hidden;
        transform: scale(0.92) translateY(12px);
        opacity: 0;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
      }
      .cq-modal.cq-modal-visible {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
      .cq-modal-sm { max-width: 400px; }
      .cq-modal-lg { max-width: 760px; }
      .cq-modal-xl { max-width: 980px; }
      .cq-modal-header {
        padding: 18px 24px;
        border-bottom: 1px solid rgba(58, 83, 17, 0.35);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .cq-modal-title {
        margin: 0;
        font-family: 'Outfit', system-ui, sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: #e8f0d8;
      }
      .cq-modal-close-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(122, 154, 92, 0.25);
        color: #e8f0d8;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.1rem;
        transition: all 0.15s ease;
      }
      .cq-modal-close-btn:hover {
        background: rgba(239, 68, 68, 0.25);
        border-color: rgba(239, 68, 68, 0.5);
        color: #f87171;
      }
      .cq-modal-body {
        padding: 24px;
        max-height: calc(85vh - 120px);
        overflow-y: auto;
      }
      .cq-particle {
        position: fixed;
        pointer-events: none;
        border-radius: 50%;
        z-index: 1090;
        will-change: transform, opacity;
      }
    `;
    document.head.appendChild(style);
  }

  // Active modal tracker
  let activeModalState = null;

  const CortexUtils = {
    /**
     * Generate a unique random string ID
     */
    generateId: function (prefix) {
      const p = prefix || 'cq';
      const timestamp = Date.now().toString(36);
      const randomPart = Math.random().toString(36).substring(2, 9);
      return `${p}_${timestamp}_${randomPart}`;
    },

    /**
     * Format number with commas (e.g. 1234 -> "1,234")
     */
    formatNumber: function (n) {
      if (n === null || n === undefined || isNaN(n)) return '0';
      return Number(n).toLocaleString('en-US');
    },

    /**
     * Format XP into compact human readable format (e.g. 500 -> "500 XP", 1250 -> "1.3K XP", 2500000 -> "2.5M XP")
     */
    formatXP: function (n) {
      const num = Number(n) || 0;
      if (num < 1000) {
        return `${Math.round(num)} XP`;
      } else if (num < 1000000) {
        const k = (num / 1000).toFixed(num >= 10000 ? 0 : 1);
        return `${k.replace(/\.0$/, '')}K XP`;
      } else {
        const m = (num / 1000000).toFixed(1);
        return `${m.replace(/\.0$/, '')}M XP`;
      }
    },

    /**
     * Fisher-Yates array shuffle (returns a new array copy, leaves original intact)
     */
    shuffleArray: function (arr) {
      if (!Array.isArray(arr)) return [];
      const copy = arr.slice();
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
      }
      return copy;
    },

    /**
     * Deep clone JSON-serializable objects
     */
    deepClone: function (obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      try {
        if (typeof structuredClone === 'function') {
          return structuredClone(obj);
        }
      } catch (e) {
        // Fallback to JSON
      }
      return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Debounce a function call
     */
    debounce: function (fn, delay) {
      let timer = null;
      return function (...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => {
          fn.apply(context, args);
        }, delay);
      };
    },

    /**
     * Throttle a function call
     */
    throttle: function (fn, delay) {
      let lastCall = 0;
      return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          fn.apply(this, args);
        }
      };
    },

    /**
     * Get local date string 'YYYY-MM-DD'
     */
    getToday: function () {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    /**
     * Human readable relative time string (e.g. "2 hours ago", "just now")
     */
    timeSince: function (timestamp) {
      if (!timestamp) return 'never';
      const now = Date.now();
      const seconds = Math.floor((now - Number(timestamp)) / 1000);

      if (seconds < 30) return 'just now';
      if (seconds < 60) return `${seconds}s ago`;

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
      }

      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
      }

      const days = Math.floor(hours / 24);
      if (days < 30) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
      }

      const months = Math.floor(days / 30);
      if (months < 12) {
        return months === 1 ? '1 month ago' : `${months} months ago`;
      }

      const years = Math.floor(days / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    },

    /**
     * Capitalize the first letter of a string
     */
    capitalizeFirst: function (str) {
      if (!str || typeof str !== 'string') return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Clamp number between min and max
     */
    clamp: function (value, min, max) {
      const v = Number(value) || 0;
      return Math.min(Math.max(v, min), max);
    },

    /**
     * Linear interpolation
     */
    lerp: function (a, b, t) {
      return a + (b - a) * t;
    },

    /**
     * Inclusive random integer between min and max
     */
    randomInt: function (min, max) {
      const low = Math.ceil(min);
      const high = Math.floor(max);
      return Math.floor(Math.random() * (high - low + 1)) + low;
    },

    /**
     * Pick a random item from array
     */
    randomFrom: function (arr) {
      if (!Array.isArray(arr) || arr.length === 0) return null;
      const index = Math.floor(Math.random() * arr.length);
      return arr[index];
    },

    /**
     * Promise delay
     */
    sleep: function (ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    /**
     * Shows a toast notification on screen
     * @param {string} message 
     * @param {'success'|'error'|'warning'|'info'} [type='success']
     * @param {number} [duration=3000]
     */
    showToast: function (message, type, duration) {
      ensureCoreStyles();
      const toastType = type || 'success';
      const toastDuration = typeof duration === 'number' ? duration : 3000;

      let container = document.getElementById('cq-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'cq-toast-container';
        container.className = 'cq-toast-container';
        document.body.appendChild(container);
      }

      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      const toast = document.createElement('div');
      toast.className = `cq-toast cq-toast-${toastType}`;
      toast.setAttribute('role', 'alert');

      const iconEl = document.createElement('span');
      iconEl.className = 'cq-toast-icon';
      iconEl.textContent = icons[toastType] || 'ℹ';

      const contentEl = document.createElement('div');
      contentEl.className = 'cq-toast-content';
      contentEl.textContent = message;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'cq-toast-close';
      closeBtn.setAttribute('aria-label', 'Close toast');
      closeBtn.innerHTML = '&times;';

      toast.appendChild(iconEl);
      toast.appendChild(contentEl);
      toast.appendChild(closeBtn);
      container.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add('cq-toast-visible');
      });

      let removed = false;
      function removeToast() {
        if (removed) return;
        removed = true;
        toast.classList.remove('cq-toast-visible');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }

      closeBtn.addEventListener('click', removeToast);

      if (toastDuration > 0) {
        setTimeout(removeToast, toastDuration);
      }
    },

    /**
     * Shows a centered modal with HTML content
     * @param {string} html 
     * @param {object} [options={}] - { title, showClose, size, onClose }
     */
    showModal: function (html, options) {
      ensureCoreStyles();
      const opts = options || {};

      // Close existing modal if open
      if (activeModalState) {
        CortexUtils.closeModal();
      }

      const backdrop = document.createElement('div');
      backdrop.className = 'cq-modal-backdrop';

      const container = document.createElement('div');
      container.className = 'cq-modal-container';

      const modal = document.createElement('div');
      const sizeClass = opts.size ? `cq-modal-${opts.size}` : '';
      modal.className = `cq-modal ${sizeClass}`.trim();

      let headerHtml = '';
      if (opts.title || opts.showClose !== false) {
        headerHtml = `
          <div class="cq-modal-header">
            <h3 class="cq-modal-title">${opts.title || ''}</h3>
            ${opts.showClose !== false ? '<button class="cq-modal-close-btn" aria-label="Close modal">&times;</button>' : ''}
          </div>
        `;
      }

      modal.innerHTML = `
        ${headerHtml}
        <div class="cq-modal-body">${html}</div>
      `;

      container.appendChild(modal);
      document.body.appendChild(backdrop);
      document.body.appendChild(container);

      // Prevent background scrolling
      document.body.style.overflow = 'hidden';

      activeModalState = {
        backdrop: backdrop,
        container: container,
        modal: modal,
        onClose: opts.onClose
      };

      // Entrance animation
      requestAnimationFrame(() => {
        backdrop.classList.add('cq-modal-visible');
        modal.classList.add('cq-modal-visible');
      });

      // Close handlers
      const closeBtn = modal.querySelector('.cq-modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => CortexUtils.closeModal());
      }

      container.addEventListener('click', (e) => {
        if (e.target === container) {
          CortexUtils.closeModal();
        }
      });

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          CortexUtils.closeModal();
          document.removeEventListener('keydown', handleKeyDown);
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      activeModalState.keyHandler = handleKeyDown;
    },

    /**
     * Closes the currently active modal
     */
    closeModal: function () {
      if (!activeModalState) return;
      const { backdrop, container, modal, onClose, keyHandler } = activeModalState;

      if (keyHandler) {
        document.removeEventListener('keydown', keyHandler);
      }

      modal.classList.remove('cq-modal-visible');
      backdrop.classList.remove('cq-modal-visible');

      setTimeout(() => {
        if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        if (container && container.parentNode) container.parentNode.removeChild(container);
        document.body.style.overflow = '';
        if (typeof onClose === 'function') {
          try {
            onClose();
          } catch (err) {
            console.error('Error in modal onClose callback:', err);
          }
        }
      }, 260);

      activeModalState = null;
    },

    /**
     * Smoothly animate a number counting up inside an element
     */
    animateCounter: function (element, start, end, duration) {
      if (!element) return;
      const startTime = performance.now();
      const s = Number(start) || 0;
      const e = Number(end) || 0;
      const dur = duration || 1000;

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / dur, 1);

        // Ease out quad
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(s + (e - s) * easeOut);
        element.textContent = CortexUtils.formatNumber(currentVal);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.textContent = CortexUtils.formatNumber(e);
        }
      }

      requestAnimationFrame(update);
    },

    /**
     * Create floating particle explosion at (x, y) coordinates
     */
    createParticles: function (x, y, count, color) {
      ensureCoreStyles();
      const total = count || 20;
      const pColor = color || '#fbbf24';

      for (let i = 0; i < total; i++) {
        const p = document.createElement('div');
        p.className = 'cq-particle';
        const size = CortexUtils.randomInt(4, 9);
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.backgroundColor = pColor;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.boxShadow = `0 0 8px ${pColor}`;
        document.body.appendChild(p);

        const angle = Math.random() * Math.PI * 2;
        const velocity = CortexUtils.randomInt(40, 140);
        const destX = Math.cos(angle) * velocity;
        const destY = Math.sin(angle) * velocity + 40; // gravity effect
        const rot = CortexUtils.randomInt(0, 360);

        const anim = p.animate([
          { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
          { transform: `translate(${destX}px, ${destY}px) scale(0.2) rotate(${rot}deg)`, opacity: 0 }
        ], {
          duration: CortexUtils.randomInt(600, 1100),
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          fill: 'forwards'
        });

        anim.onfinish = () => {
          if (p.parentNode) p.parentNode.removeChild(p);
        };
      }
    },

    /**
     * Calculate 0-3 star rating based on score percentage
     * 90%+ : 3 stars
     * 70-89% : 2 stars
     * 50-69% : 1 star
     * < 50% : 0 stars
     */
    getProgressStars: function (percent) {
      const p = Number(percent) || 0;
      if (p >= 90) return 3;
      if (p >= 70) return 2;
      if (p >= 50) return 1;
      return 0;
    },

    /**
     * Fast djb2 string hashing algorithm
     */
    hashString: function (str) {
      const s = String(str || '');
      let hash = 5381;
      for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) + hash) + s.charCodeAt(i);
        hash |= 0;
      }
      return (hash >>> 0).toString(16);
    }
  };

  /**
   * Secure password hashing using SubtleCrypto SHA-256 with fallback
   * @param {string} password 
   * @returns {Promise<string>} Hex-encoded hash
   */
  window.hashPassword = async function (password) {
    const raw = String(password || '');
    const salt = 'cortex_quest_salt_v1';
    const salted = `${salt}_${raw}`;

    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && typeof TextEncoder !== 'undefined') {
        const encoder = new TextEncoder();
        const data = encoder.encode(salted);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
      }
    } catch (e) {
      // Fallback below
    }

    // Deterministic multi-round fallback hash if Web Crypto API is unavailable
    let h1 = CortexUtils.hashString(salted);
    for (let r = 0; r < 32; r++) {
      h1 = CortexUtils.hashString(`${h1}_round_${r}_${salt}`);
    }
    return `fb_${h1}`;
  };

  // Expose on global window object
  window.CortexUtils = CortexUtils;
})();
