/**
 * ============================================================================
 * Cortex Quest — Gamification Engine (CortexGamification)
 * ============================================================================
 * Exposes window.CortexGamification
 * Manages Achievements, Daily Challenges, Quests, Stats computation, and Celebrations.
 */

(function () {
  'use strict';

  // Comprehensive default achievements roster
  const DEFAULT_ACHIEVEMENTS = [
    {
      id: 'first_steps',
      title: 'First Steps',
      description: 'Complete your very first quest level in any module.',
      icon: '👣',
      category: 'progression',
      reward: { xp: 50, coins: 30, diamonds: 1 },
      condition: (stats, player) => stats.totalLevelsCompleted >= 1
    },
    {
      id: 'novice_scholar',
      title: 'Novice Scholar',
      description: 'Reach Player Level 5.',
      icon: '📜',
      category: 'level',
      reward: { xp: 100, coins: 50, diamonds: 2 },
      condition: (stats, player) => stats.level >= 5
    },
    {
      id: 'adept_mind',
      title: 'Adept Mind',
      description: 'Reach Player Level 10.',
      icon: '⚡',
      category: 'level',
      reward: { xp: 250, coins: 100, diamonds: 3 },
      condition: (stats, player) => stats.level >= 10
    },
    {
      id: 'cortex_master',
      title: 'Cortex Master',
      description: 'Reach Player Level 25.',
      icon: '🔮',
      category: 'level',
      reward: { xp: 600, coins: 250, diamonds: 5 },
      condition: (stats, player) => stats.level >= 25
    },
    {
      id: 'grandmaster',
      title: 'Ascended Grandmaster',
      description: 'Reach Player Level 50.',
      icon: '🌌',
      category: 'level',
      reward: { xp: 1500, coins: 750, diamonds: 15 },
      condition: (stats, player) => stats.level >= 50
    },
    {
      id: 'sharp_shooter',
      title: 'Sharp Shooter',
      description: 'Answer 50 questions correctly across all modules.',
      icon: '🎯',
      category: 'mastery',
      reward: { xp: 150, coins: 75, diamonds: 2 },
      condition: (stats, player) => stats.totalCorrect >= 50
    },
    {
      id: 'centurion',
      title: 'Centurion',
      description: 'Answer 100 questions correctly.',
      icon: '🏛️',
      category: 'mastery',
      reward: { xp: 300, coins: 150, diamonds: 4 },
      condition: (stats, player) => stats.totalCorrect >= 100
    },
    {
      id: 'stargazer',
      title: 'Stargazer',
      description: 'Earn 15 stars across your quest journey.',
      icon: '⭐',
      category: 'stars',
      reward: { xp: 150, coins: 80, diamonds: 2 },
      condition: (stats, player) => (player.stars || 0) >= 15
    },
    {
      id: 'constellation',
      title: 'Constellation',
      description: 'Accumulate 50 stars.',
      icon: '✨',
      category: 'stars',
      reward: { xp: 400, coins: 200, diamonds: 5 },
      condition: (stats, player) => (player.stars || 0) >= 50
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Attain a flawless 3-star rating on at least 5 levels.',
      icon: '💎',
      category: 'mastery',
      reward: { xp: 250, coins: 120, diamonds: 3 },
      condition: (stats, player) => {
        let threeStarCount = 0;
        if (player.progress) {
          for (const sId in player.progress) {
            const highScores = player.progress[sId]?.highScores || {};
            for (const lvl in highScores) {
              if (highScores[lvl] === 3) threeStarCount++;
            }
          }
        }
        return threeStarCount >= 5;
      }
    },
    {
      id: 'polymath',
      title: 'Polymath',
      description: 'Tackle and complete levels in at least 4 distinct modules.',
      icon: '🌿',
      category: 'exploration',
      reward: { xp: 250, coins: 120, diamonds: 3 },
      condition: (stats, player) => stats.modulesStarted >= 4
    },
    {
      id: 'universal_scholar',
      title: 'Universal Scholar',
      description: 'Complete levels in all 8 core knowledge domains.',
      icon: '👑',
      category: 'exploration',
      reward: { xp: 1000, coins: 500, diamonds: 10 },
      condition: (stats, player) => stats.modulesStarted >= 8
    },
    {
      id: 'coin_hoarder',
      title: 'Coin Hoarder',
      description: 'Accumulate 500 or more coins in your vault.',
      icon: '🪙',
      category: 'wealth',
      reward: { xp: 150, coins: 0, diamonds: 5 },
      condition: (stats, player) => (player.coins || 0) >= 500
    },
    {
      id: 'diamond_hands',
      title: 'Diamond Hands',
      description: 'Hold 25 diamonds simultaneously.',
      icon: '💍',
      category: 'wealth',
      reward: { xp: 300, coins: 200, diamonds: 0 },
      condition: (stats, player) => (player.diamonds || 0) >= 25
    },
    {
      id: 'flawless_focus',
      title: 'Flawless Focus',
      description: 'Achieve at least 85% accuracy with 30+ questions answered.',
      icon: '🏹',
      category: 'mastery',
      reward: { xp: 250, coins: 100, diamonds: 3 },
      condition: (stats, player) => stats.totalQuestions >= 30 && stats.accuracy >= 85
    },
    {
      id: 'daily_champion',
      title: 'Daily Champion',
      description: 'Successfully complete 3 Daily Challenges.',
      icon: '📅',
      category: 'daily',
      reward: { xp: 300, coins: 150, diamonds: 4 },
      condition: (stats, player) => (player.dailyChallengesCompleted || 0) >= 3
    }
  ];

  let achievementsList = DEFAULT_ACHIEVEMENTS.slice();

  const CortexGamification = {
    /**
     * Initialize achievements, merge custom data if present
     */
    init: function () {
      if (window.CortexAchievementsData && Array.isArray(window.CortexAchievementsData)) {
        // Merge custom data while keeping condition logic
        achievementsList = window.CortexAchievementsData;
      } else {
        achievementsList = DEFAULT_ACHIEVEMENTS.slice();
      }
    },

    /**
     * Pool of possible daily challenges
     */
    getDailyChallengePool: function () {
      return [
        {
          id: 'daily_correct_10',
          type: 'correct_answers',
          title: 'Sharp Mind',
          description: 'Answer 10 questions correctly today',
          target: 10,
          reward: { xp: 150, coins: 60, diamonds: 2 }
        },
        {
          id: 'daily_levels_2',
          type: 'complete_levels',
          title: 'Trailblazer',
          description: 'Complete 2 quest levels today',
          target: 2,
          reward: { xp: 200, coins: 75, diamonds: 2 }
        },
        {
          id: 'daily_stars_5',
          type: 'earn_stars',
          title: 'Star Gatherer',
          description: 'Earn 5 stars in total today',
          target: 5,
          reward: { xp: 180, coins: 60, diamonds: 2 }
        },
        {
          id: 'daily_high_score',
          type: 'high_score_level',
          title: 'Flawless Run',
          description: 'Score 90% or higher on any level today',
          target: 1,
          reward: { xp: 220, coins: 80, diamonds: 3 }
        },
        {
          id: 'daily_modules_3',
          type: 'try_modules',
          title: 'Renaissance Spirit',
          description: 'Attempt questions from 3 different modules',
          target: 3,
          reward: { xp: 250, coins: 100, diamonds: 3 }
        },
        {
          id: 'daily_streak_5',
          type: 'answer_streak',
          title: 'In The Zone',
          description: 'Achieve a 5-question correct streak',
          target: 5,
          reward: { xp: 180, coins: 50, diamonds: 2 }
        }
      ];
    },

    /**
     * Get or create current daily challenge for today
     * @returns {object} Challenge object
     */
    getDailyChallenge: function () {
      const today = window.CortexUtils ? window.CortexUtils.getToday() : new Date().toISOString().split('T')[0];
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;

      if (!player) {
        const pool = CortexGamification.getDailyChallengePool();
        return Object.assign({}, pool[0], { date: today, progress: 0, completed: false });
      }

      let dc = player.dailyChallenge;
      // If missing or from another date, rotate challenge
      if (!dc || dc.date !== today) {
        const pool = CortexGamification.getDailyChallengePool();
        // Deterministic pseudo-random based on date string so all players share daily challenge
        let seed = 0;
        for (let i = 0; i < today.length; i++) {
          seed = (seed * 31 + today.charCodeAt(i)) % pool.length;
        }
        const picked = pool[seed] || pool[0];

        dc = {
          id: picked.id,
          date: today,
          type: picked.type,
          title: picked.title,
          description: picked.description,
          target: picked.target,
          progress: 0,
          completed: false,
          reward: picked.reward
        };

        player.dailyChallenge = dc;
        window.CortexStore.saveUser(player.username, player);
      }

      return dc;
    },

    /**
     * Update progress toward daily challenge
     * @param {string} type 
     * @param {number} [amount=1] 
     */
    updateDailyChallengeProgress: function (type, amount = 1) {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) return;

      const dc = CortexGamification.getDailyChallenge();
      if (!dc || dc.completed || dc.type !== type) return;

      dc.progress = Math.min(dc.target, (dc.progress || 0) + (Number(amount) || 1));

      player.dailyChallenge = dc;
      window.CortexStore.saveUser(player.username, player);

      if (dc.progress >= dc.target) {
        CortexGamification.completeDailyChallenge();
      }
    },

    /**
     * Mark daily challenge complete, award rewards and celebrate
     */
    completeDailyChallenge: function () {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) return;

      const dc = player.dailyChallenge;
      if (!dc || dc.completed) return;

      dc.completed = true;
      player.dailyChallengesCompleted = (Number(player.dailyChallengesCompleted) || 0) + 1;
      window.CortexStore.saveUser(player.username, player);

      // Award rewards
      const r = dc.reward || { xp: 150, coins: 50, diamonds: 2 };
      if (window.CortexPlayer) {
        if (r.xp) window.CortexPlayer.addXP(r.xp);
        if (r.coins) window.CortexPlayer.addCoins(r.coins);
        if (r.diamonds) window.CortexPlayer.addDiamonds(r.diamonds);
      }

      // Audio & Visual feedback
      if (window.CortexAudio) {
        window.CortexAudio.playVoice('awesome');
      }

      if (window.CortexUtils && typeof window.CortexUtils.createParticles === 'function') {
        const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 200;
        const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 200;
        window.CortexUtils.createParticles(cx, cy, 30, '#d4a017');
      }

      if (window.CortexUtils && typeof window.CortexUtils.showModal === 'function') {
        window.CortexUtils.showModal(`
          <div style="text-align: center; padding: 12px 6px;">
            <div style="font-size: 3.5rem; margin-bottom: 8px;">🌟</div>
            <div style="
              display: inline-block;
              background: #d4a017;
              color: #0d1a05;
              padding: 3px 14px;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              margin-bottom: 12px;
            ">Daily Goal Achieved!</div>
            <h3 style="color: #e8f0d8; font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin: 0 0 6px;">
              ${dc.title}
            </h3>
            <p style="color: #a0b88d; font-size: 0.95rem; line-height: 1.4; margin-bottom: 20px;">
              ${dc.description}
            </p>
            <div style="
              background: rgba(26, 45, 10, 0.75);
              border: 1px solid rgba(122, 154, 92, 0.35);
              border-radius: 14px;
              padding: 14px;
              display: flex;
              justify-content: space-around;
              margin-bottom: 24px;
            ">
              <div style="text-align: center;">
                <div style="font-size: 1.3rem;">⚡</div>
                <div style="color: #c084fc; font-weight: 700; font-size: 1.1rem;">+${r.xp || 0}</div>
                <div style="color: #a0b88d; font-size: 0.75rem; text-transform: uppercase;">XP</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 1.3rem;">🪙</div>
                <div style="color: #f0c040; font-weight: 700; font-size: 1.1rem;">+${r.coins || 0}</div>
                <div style="color: #a0b88d; font-size: 0.75rem; text-transform: uppercase;">Coins</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 1.3rem;">💎</div>
                <div style="color: #38bdf8; font-weight: 700; font-size: 1.1rem;">+${r.diamonds || 0}</div>
                <div style="color: #a0b88d; font-size: 0.75rem; text-transform: uppercase;">Diamonds</div>
              </div>
            </div>
            <button id="cq-daily-claim-btn" style="
              background: linear-gradient(135deg, #3A5311, #4d6e18);
              color: #f5f0e8;
              border: 1px solid #7a9a5c;
              padding: 12px 24px;
              border-radius: 12px;
              font-size: 1rem;
              font-weight: 700;
              cursor: pointer;
              width: 100%;
            ">Claim Rewards</button>
          </div>
        `, {
          title: '',
          showClose: false,
          size: 'sm'
        });

        setTimeout(() => {
          const btn = document.getElementById('cq-daily-claim-btn');
          if (btn) {
            btn.addEventListener('click', () => {
              window.CortexUtils.closeModal();
            });
          }
        }, 50);
      }

      CortexGamification.checkAchievements();
    },

    /**
     * Compute comprehensive statistics from player progress
     */
    getStats: function () {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) {
        return {
          totalLevelsCompleted: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          accuracy: 0,
          streak: 0,
          modulesStarted: 0,
          highestLevel: 1,
          totalPlayTime: '0m',
          level: 1,
          xp: 0,
          coins: 0,
          diamonds: 0,
          stars: 0
        };
      }

      let totalLevelsCompleted = 0;
      let modulesStarted = 0;

      if (player.progress && typeof player.progress === 'object') {
        for (const sId in player.progress) {
          const sub = player.progress[sId];
          if (sub && Array.isArray(sub.completedLevels) && sub.completedLevels.length > 0) {
            modulesStarted++;
            totalLevelsCompleted += sub.completedLevels.length;
          } else if (sub && sub.currentLevel > 1) {
            modulesStarted++;
          }
        }
      }

      const totalQuestions = Number(player.questionsAnswered) || 0;
      const totalCorrect = Number(player.questionsCorrect) || 0;
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      const streak = Number(player.currentStreak) || 0;

      // Approximate play time from questions (avg 45s per question)
      const playMinutes = Math.round((totalQuestions * 45) / 60);
      const playHours = (playMinutes / 60).toFixed(1);
      const totalPlayTime = playMinutes >= 60 ? `${playHours}h` : `${playMinutes}m`;

      return {
        totalLevelsCompleted: totalLevelsCompleted,
        totalCorrect: totalCorrect,
        totalQuestions: totalQuestions,
        accuracy: accuracy,
        streak: streak,
        modulesStarted: modulesStarted,
        highestLevel: player.level || 1,
        totalPlayTime: totalPlayTime,
        level: player.level || 1,
        xp: player.xp || 0,
        coins: player.coins || 0,
        diamonds: player.diamonds || 0,
        stars: player.stars || 0
      };
    },

    /**
     * Check player progress against all achievements and unlock new ones
     * @returns {Array} Newly unlocked achievements
     */
    checkAchievements: function () {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) return [];

      if (!Array.isArray(player.achievements)) {
        player.achievements = [];
      }

      const stats = CortexGamification.getStats();
      const newlyUnlocked = [];

      achievementsList.forEach(ach => {
        if (!player.achievements.includes(ach.id)) {
          let isMet = false;
          try {
            if (typeof ach.condition === 'function') {
              isMet = ach.condition(stats, player);
            }
          } catch (e) {
            isMet = false;
          }

          if (isMet) {
            newlyUnlocked.push(ach);
            CortexGamification.unlockAchievement(ach.id);
          }
        }
      });

      return newlyUnlocked;
    },

    /**
     * Unlock single achievement by ID
     */
    unlockAchievement: function (id) {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      if (!player) return;

      if (!Array.isArray(player.achievements)) {
        player.achievements = [];
      }

      if (player.achievements.includes(id)) return;

      const ach = achievementsList.find(a => a.id === id);
      if (!ach) return;

      player.achievements.push(id);
      window.CortexStore.saveUser(player.username, player);

      // Award achievement rewards
      if (ach.reward) {
        if (window.CortexPlayer) {
          if (ach.reward.xp) window.CortexPlayer.addXP(ach.reward.xp);
          if (ach.reward.coins) window.CortexPlayer.addCoins(ach.reward.coins);
          if (ach.reward.diamonds) window.CortexPlayer.addDiamonds(ach.reward.diamonds);
        }
      }

      // Audio celebration
      if (window.CortexAudio) {
        window.CortexAudio.playVoice('amazing');
      }

      // Notification
      if (window.CortexUtils && typeof window.CortexUtils.showToast === 'function') {
        window.CortexUtils.showToast(`🏆 Badge Unlocked: ${ach.title}!`, 'success', 4500);
      }
    },

    /**
     * Get all achievements with player's unlock status merged
     */
    getAchievements: function () {
      const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
      const unlockedIds = (player && Array.isArray(player.achievements)) ? player.achievements : [];

      return achievementsList.map(ach => {
        const isUnlocked = unlockedIds.includes(ach.id);
        return {
          id: ach.id,
          title: ach.title,
          description: ach.description,
          icon: ach.icon || '🏆',
          category: ach.category || 'general',
          reward: ach.reward || { xp: 50, coins: 25 },
          unlocked: isUnlocked,
          unlockedAt: isUnlocked ? player.lastLogin : null
        };
      });
    }
  };

  // Expose on global window
  window.CortexGamification = CortexGamification;

  // Auto-init
  if (typeof window !== 'undefined') {
    CortexGamification.init();
  }
})();
