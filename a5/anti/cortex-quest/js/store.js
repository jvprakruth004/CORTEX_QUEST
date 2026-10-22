/**
 * ============================================================================
 * Cortex Quest — Storage & State Manager (CortexStore)
 * ============================================================================
 * Exposes window.CortexStore
 * Pure localStorage persistence.
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    USERS: 'cq_users',
    SESSION: 'cq_session',
    LEADERBOARD: 'cq_leaderboard',
    GLOBAL: 'cq_global',
    AI_OPPONENTS: 'cq_ai_opponents'
  };

  // Safe localStorage wrapper
  function storageGet(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      if (val === null || val === undefined) return fallback;
      return JSON.parse(val);
    } catch (e) {
      console.warn(`[CortexStore] Failed to read key "${key}":`, e);
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[CortexStore] Failed to write key "${key}":`, e);
      return false;
    }
  }

  function storageRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`[CortexStore] Failed to remove key "${key}":`, e);
      return false;
    }
  }

  const CortexStore = {
    /**
     * Get all users map { [username]: userData }
     */
    getUsers: function () {
      return storageGet(STORAGE_KEYS.USERS, {});
    },

    /**
     * Get user by username
     */
    getUser: function (username) {
      if (!username) return null;
      const users = CortexStore.getUsers();
      return users[username] || null;
    },

    /**
     * Save user data into users map
     */
    saveUser: function (username, data) {
      if (!username || !data) return;
      const users = CortexStore.getUsers();
      users[username] = data;
      storageSet(STORAGE_KEYS.USERS, users);
    },

    /**
     * Get current session object { username, isGuest, loginTime }
     */
    getSession: function () {
      return storageGet(STORAGE_KEYS.SESSION, null);
    },

    /**
     * Set current session
     */
    setSession: function (username, isGuest) {
      if (!username) return;
      const session = {
        username: username,
        isGuest: Boolean(isGuest),
        loginTime: Date.now()
      };
      storageSet(STORAGE_KEYS.SESSION, session);
    },

    /**
     * Clear active session (Logout)
     */
    clearSession: function () {
      storageRemove(STORAGE_KEYS.SESSION);
    },

    /**
     * Get current logged-in username
     */
    getCurrentUser: function () {
      const session = CortexStore.getSession();
      return session ? session.username : null;
    },

    /**
     * Helper to set current user (convenience alias for setSession)
     */
    setCurrentUser: function (username, isGuest = false) {
      CortexStore.setSession(username, isGuest);
    },

    /**
     * Get full player state for current active user
     */
    getPlayer: function () {
      const username = CortexStore.getCurrentUser();
      if (!username) return null;
      return CortexStore.getUser(username);
    },

    /**
     * Update current player with partial updates
     */
    updatePlayer: function (updates) {
      const username = CortexStore.getCurrentUser();
      if (!username || !updates) return null;

      const player = CortexStore.getUser(username);
      if (!player) return null;

      // Deep merge settings and progress if supplied
      if (updates.settings) {
        player.settings = Object.assign({}, player.settings || {}, updates.settings);
        delete updates.settings;
      }
      if (updates.progress) {
        player.progress = Object.assign({}, player.progress || {}, updates.progress);
        delete updates.progress;
      }
      if (updates.dailyChallenge) {
        player.dailyChallenge = Object.assign({}, player.dailyChallenge || {}, updates.dailyChallenge);
        delete updates.dailyChallenge;
      }
      if (updates.hintUsed) {
        player.hintUsed = Object.assign({}, player.hintUsed || {}, updates.hintUsed);
        delete updates.hintUsed;
      }

      Object.assign(player, updates);
      CortexStore.saveUser(username, player);
      return player;
    },

    /**
     * Initialize default player schema
     */
    initializeNewPlayer: function (username, email = '', passwordHash = '', isGuest = false) {
      return {
        username: username,
        passwordHash: passwordHash || '',
        email: email || '',
        isGuest: Boolean(isGuest),
        xp: 0,
        level: 1,
        coins: 100,        // Starting coin gift
        diamonds: 5,       // Starting diamond gift
        stars: 0,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        progress: {},
        achievements: [],
        dailyChallenge: {
          date: '',
          completed: false,
          challengeId: '',
          progress: 0
        },
        purchaseHistory: [],
        hintUsed: {},
        questionsAnswered: 0,
        questionsCorrect: 0,
        settings: {
          theme: 'dark',
          volume: 0.7,
          muted: false
        }
      };
    },

    /**
     * Create a new guest player session
     */
    createGuestPlayer: function () {
      const guestId = 'guest_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const guestPlayer = CortexStore.initializeNewPlayer(guestId, '', '', true);
      CortexStore.saveUser(guestId, guestPlayer);
      CortexStore.setSession(guestId, true);
      return guestPlayer;
    },

    /**
     * Get player progress for a specific submodule
     */
    getPlayerProgress: function (submoduleId) {
      const player = CortexStore.getPlayer();
      if (!player || !player.progress) {
        return { currentLevel: 1, completedLevels: [], highScores: {} };
      }
      if (!player.progress[submoduleId]) {
        return { currentLevel: 1, completedLevels: [], highScores: {} };
      }
      return player.progress[submoduleId];
    },

    /**
     * Update progress when a level is played/completed
     * @param {string} submoduleId 
     * @param {number} levelNumber 
     * @param {object} data - { stars, completed, score, xpEarned }
     */
    updateProgress: function (submoduleId, levelNumber, data) {
      const player = CortexStore.getPlayer();
      if (!player) return;

      const lvl = Number(levelNumber);
      if (!player.progress) player.progress = {};
      if (!player.progress[submoduleId]) {
        player.progress[submoduleId] = {
          currentLevel: 1,
          completedLevels: [],
          highScores: {}
        };
      }

      const subProg = player.progress[submoduleId];
      const starsEarned = Number(data.stars) || 0;
      const isCompleted = Boolean(data.completed) || starsEarned > 0;

      if (!subProg.highScores) subProg.highScores = {};
      const prevStars = subProg.highScores[lvl] || 0;
      if (starsEarned > prevStars) {
        subProg.highScores[lvl] = starsEarned;
      }

      if (isCompleted) {
        if (!Array.isArray(subProg.completedLevels)) {
          subProg.completedLevels = [];
        }
        if (!subProg.completedLevels.includes(lvl)) {
          subProg.completedLevels.push(lvl);
          subProg.completedLevels.sort((a, b) => a - b);
        }
        // Advance currentLevel if this was current level and not capped at 50
        if (lvl >= subProg.currentLevel && subProg.currentLevel < 50) {
          subProg.currentLevel = Math.min(50, lvl + 1);
        }
      }

      // Recompute total player stars from all submodules
      let totalStars = 0;
      for (const sId in player.progress) {
        const pObj = player.progress[sId];
        if (pObj && pObj.highScores) {
          for (const lKey in pObj.highScores) {
            totalStars += Number(pObj.highScores[lKey]) || 0;
          }
        }
      }
      player.stars = totalStars;

      CortexStore.saveUser(player.username, player);
      CortexStore.updateLeaderboard();
      return subProg;
    },

    /**
     * Check if a specific level is unlocked for the current player
     */
    isLevelUnlocked: function (submoduleId, levelNumber) {
      const lvl = Number(levelNumber);
      if (lvl <= 1) return true; // Level 1 always unlocked

      const subProg = CortexStore.getPlayerProgress(submoduleId);
      if (lvl <= subProg.currentLevel) return true;
      if (Array.isArray(subProg.completedLevels) && subProg.completedLevels.includes(lvl - 1)) {
        return true;
      }
      return false;
    },

    /**
     * Check if a specific level has been completed
     */
    isLevelCompleted: function (submoduleId, levelNumber) {
      const lvl = Number(levelNumber);
      const subProg = CortexStore.getPlayerProgress(submoduleId);
      return Array.isArray(subProg.completedLevels) && subProg.completedLevels.includes(lvl);
    },

    /**
     * Get global configuration
     */
    getGlobal: function (key) {
      const globals = storageGet(STORAGE_KEYS.GLOBAL, {});
      return key ? globals[key] : globals;
    },

    /**
     * Set global configuration
     */
    setGlobal: function (key, value) {
      const globals = storageGet(STORAGE_KEYS.GLOBAL, {});
      globals[key] = value;
      storageSet(STORAGE_KEYS.GLOBAL, globals);
    },

    /**
     * Full state getter for backup / debug
     */
    getState: function () {
      return {
        users: CortexStore.getUsers(),
        session: CortexStore.getSession(),
        leaderboard: CortexStore.getLeaderboard(),
        global: CortexStore.getGlobal()
      };
    },

    /**
     * Full state saver for restore
     */
    saveState: function (state) {
      if (!state || typeof state !== 'object') return;
      if (state.users) storageSet(STORAGE_KEYS.USERS, state.users);
      if (state.session) storageSet(STORAGE_KEYS.SESSION, state.session);
      if (state.leaderboard) storageSet(STORAGE_KEYS.LEADERBOARD, state.leaderboard);
      if (state.global) storageSet(STORAGE_KEYS.GLOBAL, state.global);
    },

    /**
     * Seed realistic AI opponents with clearly marked isAI: true
     */
    addAIOpponents: function () {
      const aiSeed = [
        {
          username: 'Athena_AI',
          level: 42,
          xp: 28400,
          stars: 195,
          isAI: true,
          isGuest: false,
          avatar: '🦉',
          title: 'Strategic Oracle'
        },
        {
          username: 'QuantumMind',
          level: 36,
          xp: 21800,
          stars: 160,
          isAI: true,
          isGuest: false,
          avatar: '🔮',
          title: 'Quantum Adept'
        },
        {
          username: 'Cipher_Bot',
          level: 29,
          xp: 14900,
          stars: 125,
          isAI: true,
          isGuest: false,
          avatar: '🤖',
          title: 'Cipher Sentinel'
        },
        {
          username: 'Sage_Neural',
          level: 22,
          xp: 9600,
          stars: 88,
          isAI: true,
          isGuest: false,
          avatar: '⚡',
          title: 'Neural Path'
        },
        {
          username: 'Nova_Scholar',
          level: 15,
          xp: 4800,
          stars: 45,
          isAI: true,
          isGuest: false,
          avatar: '🌿',
          title: 'Curious Novice'
        }
      ];

      storageSet(STORAGE_KEYS.AI_OPPONENTS, aiSeed);
      return aiSeed;
    },

    /**
     * Get AI opponents from storage (seed if missing)
     */
    getAIOpponents: function () {
      let aiList = storageGet(STORAGE_KEYS.AI_OPPONENTS, null);
      if (!Array.isArray(aiList) || aiList.length === 0) {
        aiList = CortexStore.addAIOpponents();
      }
      return aiList;
    },

    /**
     * Get leaderboard entries array
     */
    getLeaderboard: function () {
      let lb = storageGet(STORAGE_KEYS.LEADERBOARD, null);
      if (!Array.isArray(lb) || lb.length === 0) {
        lb = CortexStore.updateLeaderboard();
      }
      return lb;
    },

    /**
     * Rebuild leaderboard from all users + AI opponents
     */
    updateLeaderboard: function () {
      const users = CortexStore.getUsers();
      const aiList = CortexStore.getAIOpponents();
      const entries = [];

      // Collect real users
      for (const username in users) {
        const u = users[username];
        if (!u) continue;
        entries.push({
          username: u.username,
          level: u.level || 1,
          xp: u.xp || 0,
          stars: u.stars || 0,
          isAI: false,
          isGuest: Boolean(u.isGuest),
          avatar: u.isGuest ? '👤' : (window.CortexPlayer ? window.CortexPlayer.getAvatarEmoji(u.level || 1) : '🌱')
        });
      }

      // Collect AI opponents
      aiList.forEach(ai => {
        entries.push({
          username: ai.username,
          level: ai.level,
          xp: ai.xp,
          stars: ai.stars,
          isAI: true,
          isGuest: false,
          avatar: ai.avatar || '🤖',
          title: ai.title || 'AI Challenger'
        });
      });

      // Sort descending by XP, tiebreak by stars
      entries.sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        return b.stars - a.stars;
      });

      // Assign ranks
      entries.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });

      storageSet(STORAGE_KEYS.LEADERBOARD, entries);
      return entries;
    }
  };

  // Expose on global window
  window.CortexStore = CortexStore;
})();
