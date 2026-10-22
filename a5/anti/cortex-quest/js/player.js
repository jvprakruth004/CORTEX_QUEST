/**
 * ============================================================================
 * Cortex Quest — Player Stats & Progression Engine (CortexPlayer)
 * ============================================================================
 * Exposes window.CortexPlayer
 * Handles XP curves, Level-ups, Currencies (Coins, Diamonds, Stars), Stats, and Titles.
 */

(function () {
  'use strict';

  // Precomputed XP thresholds for Level 1 to 100
  const LEVEL_XP_TABLE = (function () {
    const table = [0]; // Level 0 unused
    table[1] = 0;
    table[2] = 100;
    table[3] = 250;
    table[4] = 450;
    table[5] = 700;

    // Levels 6 - 10 (+300 per level)
    for (let l = 6; l <= 10; l++) {
      table[l] = table[l - 1] + 300;
    }

    // Levels 11 - 20 (+500 per level)
    for (let l = 11; l <= 20; l++) {
      table[l] = table[l - 1] + 500;
    }

    // Levels 21 - 50 (+1000 per level)
    for (let l = 21; l <= 50; l++) {
      table[l] = table[l - 1] + 1000;
    }

    // Levels 51 - 100 (+2000 per level)
    for (let l = 51; l <= 100; l++) {
      table[l] = table[l - 1] + 2000;
    }

    return table;
  })();

  function calculateLevelFromXP(xp) {
    const totalXP = Math.max(0, Number(xp) || 0);
    for (let l = 100; l >= 1; l--) {
      if (totalXP >= LEVEL_XP_TABLE[l]) {
        return l;
      }
    }
    return 1;
  }

  const CortexPlayer = {
    /**
     * Total XP needed to reach a specific level (1-100)
     */
    getXPForLevel: function (level) {
      const lvl = Math.min(100, Math.max(1, Math.floor(Number(level) || 1)));
      return LEVEL_XP_TABLE[lvl] || 0;
    },

    /**
     * Current player level
     */
    getLevel: function () {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) return 1;
      return player.level || calculateLevelFromXP(player.xp || 0);
    },

    /**
     * Current total XP
     */
    getXP: function () {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      return player ? (player.xp || 0) : 0;
    },

    /**
     * Get detailed level progression object
     * @returns {{currentXP: number, xpInLevel: number, xpForNextLevel: number, percent: number, level: number}}
     */
    getLevelProgress: function () {
      const currentXP = CortexPlayer.getXP();
      const level = CortexPlayer.getLevel();

      if (level >= 100) {
        return {
          currentXP: currentXP,
          xpInLevel: 0,
          xpForNextLevel: 0,
          percent: 100,
          level: 100
        };
      }

      const baseXP = CortexPlayer.getXPForLevel(level);
      const nextXP = CortexPlayer.getXPForLevel(level + 1);
      const neededInLevel = nextXP - baseXP;
      const xpInLevel = Math.max(0, currentXP - baseXP);
      const percent = Math.min(100, Math.max(0, Math.round((xpInLevel / neededInLevel) * 100)));

      return {
        currentXP: currentXP,
        xpInLevel: xpInLevel,
        xpForNextLevel: neededInLevel,
        percent: percent,
        level: level
      };
    },

    /**
     * Add XP to the player. Handles level calculation, awards, animations.
     * @param {number} amount 
     * @returns {{oldLevel: number, newLevel: number, leveledUp: boolean, xpAdded: number}}
     */
    addXP: function (amount) {
      const added = Math.max(0, Number(amount) || 0);
      if (added === 0) {
        const lvl = CortexPlayer.getLevel();
        return { oldLevel: lvl, newLevel: lvl, leveledUp: false, xpAdded: 0 };
      }

      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) {
        return { oldLevel: 1, newLevel: 1, leveledUp: false, xpAdded: added };
      }

      const oldLevel = player.level || calculateLevelFromXP(player.xp || 0);
      const newXP = (player.xp || 0) + added;
      const newLevel = calculateLevelFromXP(newXP);
      const leveledUp = newLevel > oldLevel;

      player.xp = newXP;
      player.level = newLevel;

      if (leveledUp) {
        // Award bonus coins and diamonds on level up
        const bonusCoins = (newLevel - oldLevel) * 50;
        const bonusDiamonds = Math.max(1, newLevel - oldLevel);
        player.coins = (player.coins || 0) + bonusCoins;
        player.diamonds = (player.diamonds || 0) + bonusDiamonds;

        window.CortexStore.saveUser(player.username, player);
        CortexPlayer.triggerLevelUpCelebration(newLevel, bonusCoins, bonusDiamonds);
      } else {
        window.CortexStore.saveUser(player.username, player);
      }

      if (window.CortexGamification && typeof window.CortexGamification.checkAchievements === 'function') {
        window.CortexGamification.checkAchievements();
      }

      window.CortexStore.updateLeaderboard();

      return {
        oldLevel: oldLevel,
        newLevel: newLevel,
        leveledUp: leveledUp,
        xpAdded: added
      };
    },

    /**
     * Add coins to player balance
     */
    addCoins: function (amount) {
      const added = Math.max(0, Number(amount) || 0);
      if (added <= 0) return;
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) return;

      player.coins = (player.coins || 0) + added;
      window.CortexStore.saveUser(player.username, player);

      if (window.CortexGamification && typeof window.CortexGamification.checkAchievements === 'function') {
        window.CortexGamification.checkAchievements();
      }
    },

    /**
     * Add diamonds to player balance
     */
    addDiamonds: function (amount) {
      const added = Math.max(0, Number(amount) || 0);
      if (added <= 0) return;
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) return;

      player.diamonds = (player.diamonds || 0) + added;
      window.CortexStore.saveUser(player.username, player);

      if (window.CortexGamification && typeof window.CortexGamification.checkAchievements === 'function') {
        window.CortexGamification.checkAchievements();
      }
    },

    /**
     * Add stars to player total
     */
    addStars: function (amount) {
      const added = Math.max(0, Number(amount) || 0);
      if (added <= 0) return;
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) return;

      player.stars = (player.stars || 0) + added;
      window.CortexStore.saveUser(player.username, player);
      window.CortexStore.updateLeaderboard();
    },

    /**
     * Get coins balance
     */
    getCoinsBalance: function () {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      return player ? (player.coins || 0) : 0;
    },

    /**
     * Get diamonds balance
     */
    getDiamondsBalance: function () {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      return player ? (player.diamonds || 0) : 0;
    },

    /**
     * Get stars count
     */
    getStarsCount: function () {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      return player ? (player.stars || 0) : 0;
    },

    /**
     * Spend coins. Returns true on success, false if balance insufficient.
     */
    spendCoins: function (amount) {
      const cost = Math.max(0, Number(amount) || 0);
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) return false;

      if ((player.coins || 0) < cost) {
        if (window.CortexUtils && typeof window.CortexUtils.showToast === 'function') {
          window.CortexUtils.showToast('Not enough coins!', 'warning');
        }
        return false;
      }

      player.coins = (player.coins || 0) - cost;
      window.CortexStore.saveUser(player.username, player);
      return true;
    },

    /**
     * Spend diamonds. Returns true on success, false if balance insufficient.
     */
    spendDiamonds: function (amount) {
      const cost = Math.max(0, Number(amount) || 0);
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) return false;

      if ((player.diamonds || 0) < cost) {
        if (window.CortexUtils && typeof window.CortexUtils.showToast === 'function') {
          window.CortexUtils.showToast('Not enough diamonds!', 'warning');
        }
        return false;
      }

      player.diamonds = (player.diamonds || 0) - cost;
      window.CortexStore.saveUser(player.username, player);
      return true;
    },

    /**
     * Get all computed player statistics
     */
    getStats: function () {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) {
        return {
          totalXP: 0,
          level: 1,
          coins: 0,
          diamonds: 0,
          stars: 0,
          modulesStarted: 0,
          levelsCompleted: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          accuracy: 0
        };
      }

      let modulesStarted = 0;
      let levelsCompleted = 0;

      if (player.progress && typeof player.progress === 'object') {
        for (const subId in player.progress) {
          const sub = player.progress[subId];
          if (sub && Array.isArray(sub.completedLevels) && sub.completedLevels.length > 0) {
            modulesStarted++;
            levelsCompleted += sub.completedLevels.length;
          } else if (sub && sub.currentLevel > 1) {
            modulesStarted++;
          }
        }
      }

      const totalQuestions = Number(player.questionsAnswered) || 0;
      const correctAnswers = Number(player.questionsCorrect) || 0;
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      return {
        totalXP: player.xp || 0,
        level: player.level || 1,
        coins: player.coins || 0,
        diamonds: player.diamonds || 0,
        stars: player.stars || 0,
        modulesStarted: modulesStarted,
        levelsCompleted: levelsCompleted,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        accuracy: accuracy
      };
    },

    /**
     * Record a question answer for accuracy tracking
     */
    updateQuestionsStats: function (correct) {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) return;

      player.questionsAnswered = (Number(player.questionsAnswered) || 0) + 1;
      if (correct) {
        player.questionsCorrect = (Number(player.questionsCorrect) || 0) + 1;
      }

      window.CortexStore.saveUser(player.username, player);

      if (window.CortexGamification && typeof window.CortexGamification.checkAchievements === 'function') {
        window.CortexGamification.checkAchievements();
      }
    },

    /**
     * Get avatar emoji corresponding to player level
     */
    getAvatarEmoji: function (level) {
      const l = Number(level) || 1;
      if (l >= 100) return '🌌'; // Transcendence
      if (l >= 85) return '👑';  // Mythic
      if (l >= 70) return '🌟';  // Grandmaster
      if (l >= 50) return '⚔️';  // Master
      if (l >= 35) return '🔮';  // Expert
      if (l >= 20) return '⚡';  // Adept
      if (l >= 10) return '🌿';  // Explorer
      return '🌱';               // Novice
    },

    /**
     * Get rank title based on level
     */
    getLevelTitle: function (level) {
      const l = Number(level) || 1;
      if (l >= 100) return 'Ascended Legend';
      if (l >= 85) return 'Mythic Sage';
      if (l >= 70) return 'Grandmaster';
      if (l >= 50) return 'Cortex Master';
      if (l >= 35) return 'Domain Expert';
      if (l >= 20) return 'Tactical Mind';
      if (l >= 10) return 'Erudite Scholar';
      if (l >= 5) return 'Curious Apprentice';
      return 'Novice Seeker';
    },

    /**
     * Level-up celebration modal with particles and audio feedback
     */
    triggerLevelUpCelebration: function (newLevel, bonusCoins = 50, bonusDiamonds = 1) {
      const title = CortexPlayer.getLevelTitle(newLevel);
      const emoji = CortexPlayer.getAvatarEmoji(newLevel);

      // Play audio if available
      if (window.CortexAudio) {
        window.CortexAudio.playVoice('level-complete');
      }

      // Spawn celebratory particles
      if (window.CortexUtils && typeof window.CortexUtils.createParticles === 'function') {
        const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 200;
        const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 200;
        window.CortexUtils.createParticles(cx, cy, 35, '#d4a017');
        setTimeout(() => {
          window.CortexUtils.createParticles(cx, cy, 35, '#a855f7');
        }, 150);
      }

      // Show modal
      if (window.CortexUtils && typeof window.CortexUtils.showModal === 'function') {
        window.CortexUtils.showModal(`
          <div style="text-align: center; padding: 12px 6px;">
            <div style="font-size: 3.75rem; animation: cq-bounce 1s ease infinite alternate; line-height: 1;">
              ${emoji}
            </div>
            <div style="
              display: inline-block;
              background: linear-gradient(135deg, #d4a017, #f0c040);
              color: #0d1a05;
              padding: 4px 16px;
              border-radius: 9999px;
              font-size: 0.8rem;
              font-weight: 800;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              margin-top: 14px;
            ">Level Up!</div>
            <h2 style="
              color: #e8f0d8;
              font-family: 'Outfit', sans-serif;
              font-size: 2rem;
              margin: 10px 0 4px;
              font-weight: 800;
            ">Level ${newLevel}</h2>
            <p style="color: #9ab87e; font-size: 1.1rem; font-weight: 600; margin-bottom: 20px;">
              ${title}
            </p>
            <div style="
              background: rgba(26, 45, 10, 0.7);
              border: 1px solid rgba(122, 154, 92, 0.35);
              border-radius: 14px;
              padding: 14px;
              display: flex;
              justify-content: space-around;
              margin-bottom: 24px;
            ">
              <div style="text-align: center;">
                <div style="font-size: 1.4rem;">🪙</div>
                <div style="color: #f0c040; font-weight: 700; font-size: 1.1rem;">+${bonusCoins}</div>
                <div style="color: #a0b88d; font-size: 0.75rem; text-transform: uppercase;">Coins</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 1.4rem;">💎</div>
                <div style="color: #38bdf8; font-weight: 700; font-size: 1.1rem;">+${bonusDiamonds}</div>
                <div style="color: #a0b88d; font-size: 0.75rem; text-transform: uppercase;">Diamond</div>
              </div>
            </div>
            <button id="cq-levelup-claim" style="
              background: linear-gradient(135deg, #3A5311, #4d6e18);
              color: #f5f0e8;
              border: 1px solid #7a9a5c;
              padding: 12px 28px;
              border-radius: 12px;
              font-size: 1rem;
              font-weight: 700;
              cursor: pointer;
              width: 100%;
              box-shadow: 0 4px 14px rgba(58, 83, 17, 0.5);
              transition: transform 0.15s ease;
            ">Keep Questing</button>
          </div>
        `, {
          title: '',
          showClose: false,
          size: 'sm'
        });

        setTimeout(() => {
          const btn = document.getElementById('cq-levelup-claim');
          if (btn) {
            btn.addEventListener('click', () => {
              window.CortexUtils.closeModal();
            });
          }
        }, 50);
      }
    }
  };

  // Expose on global window
  window.CortexPlayer = CortexPlayer;
})();
