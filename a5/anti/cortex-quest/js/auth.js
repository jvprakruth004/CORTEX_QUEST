/**
 * ============================================================================
 * Cortex Quest — Authentication Engine (CortexAuth)
 * ============================================================================
 * Exposes window.CortexAuth
 * Supports password-based accounts, SHA-256 hashing, guest sessions, and prompts.
 */

(function () {
  'use strict';

  const CortexAuth = {
    /**
     * Register a new user
     * @param {string} username 
     * @param {string} password 
     * @param {string} [email] 
     * @returns {Promise<{success: boolean, message: string}>}
     */
    register: async function (username, password, email) {
      try {
        if (!username || typeof username !== 'string') {
          return { success: false, message: 'Username is required.' };
        }

        const trimmedUser = username.trim();
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUser)) {
          return {
            success: false,
            message: 'Username must be 3-20 characters long and contain only letters, numbers, or underscores.'
          };
        }

        if (!password || typeof password !== 'string' || password.length < 8) {
          return {
            success: false,
            message: 'Password must be at least 8 characters long.'
          };
        }

        const trimmedEmail = email ? String(email).trim() : '';
        if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          return {
            success: false,
            message: 'Please enter a valid email address.'
          };
        }

        // Check if username already exists
        const existing = window.CortexStore.getUser(trimmedUser);
        if (existing) {
          return {
            success: false,
            message: 'That username is already taken. Please choose another username.'
          };
        }

        // Hash password
        let passwordHash = '';
        if (typeof window.hashPassword === 'function') {
          passwordHash = await window.hashPassword(password);
        } else {
          passwordHash = 'pwd_' + trimmedUser;
        }

        // Create player profile
        const newPlayer = window.CortexStore.initializeNewPlayer(
          trimmedUser,
          trimmedEmail,
          passwordHash,
          false
        );

        // If the user was previously playing as guest in this session, migrate guest progress!
        const currentSession = window.CortexStore.getSession();
        if (currentSession && currentSession.isGuest) {
          const guestPlayer = window.CortexStore.getUser(currentSession.username);
          if (guestPlayer) {
            newPlayer.xp = Math.max(newPlayer.xp, guestPlayer.xp || 0);
            newPlayer.level = Math.max(newPlayer.level, guestPlayer.level || 1);
            newPlayer.coins = (newPlayer.coins || 0) + (guestPlayer.coins || 0);
            newPlayer.diamonds = (newPlayer.diamonds || 0) + (guestPlayer.diamonds || 0);
            newPlayer.stars = Math.max(newPlayer.stars, guestPlayer.stars || 0);
            newPlayer.progress = Object.assign({}, guestPlayer.progress || {});
            newPlayer.achievements = Array.from(new Set([...(newPlayer.achievements || []), ...(guestPlayer.achievements || [])]));
            newPlayer.questionsAnswered = (newPlayer.questionsAnswered || 0) + (guestPlayer.questionsAnswered || 0);
            newPlayer.questionsCorrect = (newPlayer.questionsCorrect || 0) + (guestPlayer.questionsCorrect || 0);
          }
        }

        // Save & Set Session
        window.CortexStore.saveUser(trimmedUser, newPlayer);
        window.CortexStore.setSession(trimmedUser, false);
        window.CortexStore.updateLeaderboard();

        return {
          success: true,
          message: 'Account created successfully! Welcome to Cortex Quest.'
        };
      } catch (err) {
        console.error('[CortexAuth] Registration failed:', err);
        return { success: false, message: 'An unexpected error occurred during registration.' };
      }
    },

    /**
     * Authenticate and log in user
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<{success: boolean, message: string}>}
     */
    login: async function (username, password) {
      try {
        if (!username || !password) {
          return { success: false, message: 'Please enter both username and password.' };
        }

        const trimmedUser = String(username).trim();
        const user = window.CortexStore.getUser(trimmedUser);

        if (!user) {
          return { success: false, message: 'Account not found. Please verify your username.' };
        }

        if (user.isGuest) {
          window.CortexStore.setSession(trimmedUser, true);
          return { success: true, message: 'Resumed guest session.' };
        }

        let inputHash = '';
        if (typeof window.hashPassword === 'function') {
          inputHash = await window.hashPassword(password);
        } else {
          inputHash = 'pwd_' + trimmedUser;
        }

        if (inputHash !== user.passwordHash) {
          return { success: false, message: 'Incorrect password. Please try again.' };
        }

        // Update session & last login
        window.CortexStore.setSession(trimmedUser, false);
        window.CortexStore.updatePlayer({ lastLogin: Date.now() });

        return { success: true, message: `Welcome back, ${trimmedUser}!` };
      } catch (err) {
        console.error('[CortexAuth] Login failed:', err);
        return { success: false, message: 'An unexpected error occurred during login.' };
      }
    },

    /**
     * Sign in as an anonymous guest
     * @returns {{success: boolean}}
     */
    loginAsGuest: function () {
      try {
        const guestPlayer = window.CortexStore.createGuestPlayer();
        return { success: true, username: guestPlayer.username };
      } catch (err) {
        console.error('[CortexAuth] Guest login failed:', err);
        return { success: false };
      }
    },

    /**
     * Log out current user and return to splash screen
     */
    logout: function () {
      try {
        window.CortexStore.clearSession();
        if (window.CortexAudio) {
          window.CortexAudio.stopBGM();
        }
        if (window.CortexRouter) {
          window.CortexRouter.navigate('splash');
        } else {
          window.location.hash = '#/splash';
        }
      } catch (err) {
        console.error('[CortexAuth] Logout failed:', err);
      }
    },

    /**
     * Check if user is currently logged in
     */
    isLoggedIn: function () {
      return Boolean(window.CortexStore.getCurrentUser());
    },

    /**
     * Check if active session is a guest
     */
    isGuest: function () {
      const session = window.CortexStore.getSession();
      return Boolean(session && session.isGuest);
    },

    /**
     * Get active username
     */
    getUsername: function () {
      return window.CortexStore.getCurrentUser();
    },

    /**
     * Guard route or action. Returns true if authenticated; otherwise shows login prompt modal.
     */
    requireAuth: function () {
      if (CortexAuth.isLoggedIn()) {
        return true;
      }

      // Show attractive modal prompt
      if (window.CortexUtils && typeof window.CortexUtils.showModal === 'function') {
        window.CortexUtils.showModal(`
          <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🛡️</div>
            <h4 style="color: #e8f0d8; font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin-bottom: 8px;">
              Access Cortex Quest
            </h4>
            <p style="color: #a0b88d; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px;">
              You need an active session to test your knowledge, earn XP, and climb the leaderboard!
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button id="cq-auth-prompt-login" style="
                background: #3A5311; color: #f5f0e8; border: 1px solid #7a9a5c;
                padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer;
                transition: background 0.2s ease;
              ">Log In</button>
              <button id="cq-auth-prompt-register" style="
                background: #1a2d0a; color: #9ab87e; border: 1px solid rgba(122, 154, 92, 0.4);
                padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer;
                transition: background 0.2s ease;
              ">Create Free Account</button>
              <button id="cq-auth-prompt-guest" style="
                background: transparent; color: #d4a017; border: 1px dashed rgba(212, 160, 23, 0.4);
                padding: 10px; border-radius: 10px; font-size: 0.9rem; cursor: pointer;
              ">Continue as Guest</button>
            </div>
          </div>
        `, {
          title: 'Sign In Required',
          size: 'sm'
        });

        setTimeout(() => {
          const loginBtn = document.getElementById('cq-auth-prompt-login');
          const regBtn = document.getElementById('cq-auth-prompt-register');
          const guestBtn = document.getElementById('cq-auth-prompt-guest');

          if (loginBtn) {
            loginBtn.addEventListener('click', () => {
              window.CortexUtils.closeModal();
              if (window.CortexRouter) window.CortexRouter.navigate('login');
            });
          }
          if (regBtn) {
            regBtn.addEventListener('click', () => {
              window.CortexUtils.closeModal();
              if (window.CortexRouter) window.CortexRouter.navigate('register');
            });
          }
          if (guestBtn) {
            guestBtn.addEventListener('click', () => {
              window.CortexUtils.closeModal();
              CortexAuth.loginAsGuest();
              if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
            });
          }
        }, 50);
      }

      return false;
    },

    /**
     * Show friendly modal reminding guest to register to preserve quest progress
     */
    showGuestReminder: function () {
      if (!CortexAuth.isGuest()) return;

      if (window.CortexUtils && typeof window.CortexUtils.showModal === 'function') {
        window.CortexUtils.showModal(`
          <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 3rem; margin-bottom: 12px;">💾</div>
            <h4 style="color: #e8f0d8; font-family: 'Outfit', sans-serif; font-size: 1.35rem; margin-bottom: 8px;">
              Save Your Progress!
            </h4>
            <p style="color: #a0b88d; font-size: 0.925rem; line-height: 1.5; margin-bottom: 20px;">
              You are currently playing as a <strong>Guest</strong>. Your XP, stars, coins, and leaderboard rank are stored temporarily in this browser. Create a free account now to preserve your progress across devices!
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button id="cq-guest-reminder-create" style="
                background: #3A5311; color: #f5f0e8; border: 1px solid #7a9a5c;
                padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; flex: 1;
              ">Create Account</button>
              <button id="cq-guest-reminder-dismiss" style="
                background: rgba(255, 255, 255, 0.08); color: #a0b88d; border: 1px solid rgba(122, 154, 92, 0.2);
                padding: 10px 18px; border-radius: 10px; font-weight: 500; cursor: pointer;
              ">Later</button>
            </div>
          </div>
        `, {
          title: 'Guest Session',
          size: 'sm'
        });

        setTimeout(() => {
          const createBtn = document.getElementById('cq-guest-reminder-create');
          const dismissBtn = document.getElementById('cq-guest-reminder-dismiss');

          if (createBtn) {
            createBtn.addEventListener('click', () => {
              window.CortexUtils.closeModal();
              if (window.CortexRouter) window.CortexRouter.navigate('register');
            });
          }
          if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
              window.CortexUtils.closeModal();
            });
          }
        }, 50);
      }
    }
  };

  // Expose on global window
  window.CortexAuth = CortexAuth;
})();
