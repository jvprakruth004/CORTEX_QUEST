/**
 * Cortex Quest - Achievements Data
 * 44 detailed achievements across progression, module completion, streaks, mastery, and challenges.
 */

(function () {
  'use strict';

  var achievementsList = [
    // --- First Steps ---
    {
      id: 'first_step',
      name: 'First Step',
      description: 'Log into Cortex Quest and initiate your intellectual journey.',
      icon: 'bi-door-open',
      rarity: 'common',
      xpReward: 50,
      condition: { type: 'login_count', value: 1 }
    },
    {
      id: 'first_blood',
      name: 'First Spark',
      description: 'Answer your very first question correctly.',
      icon: 'bi-lightning',
      rarity: 'common',
      xpReward: 50,
      condition: { type: 'correct_answers_total', value: 1 }
    },
    {
      id: 'first_victory',
      name: 'Initiate Scholar',
      description: 'Complete your first quiz level.',
      icon: 'bi-check2-circle',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'levels_completed', value: 1 }
    },
    {
      id: 'five_levels',
      name: 'Curious Mind',
      description: 'Complete 5 quiz levels across any subjects.',
      icon: 'bi-compass',
      rarity: 'common',
      xpReward: 150,
      condition: { type: 'levels_completed', value: 5 }
    },

    // --- Module Specific (First level in each module) ---
    {
      id: 'mod_aptitude_start',
      name: 'Math Voyager',
      description: 'Complete your first level in General Aptitude.',
      icon: 'bi-calculator',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'module_level_completed', value: 'general-aptitude' }
    },
    {
      id: 'mod_di_start',
      name: 'Chart Navigator',
      description: 'Complete your first level in Data Interpretation.',
      icon: 'bi-bar-chart-line',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'module_level_completed', value: 'data-interpretation' }
    },
    {
      id: 'mod_logic_start',
      name: 'Deductive Thinker',
      description: 'Complete your first level in Logical Reasoning.',
      icon: 'bi-puzzle',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'module_level_completed', value: 'logical-reasoning' }
    },
    {
      id: 'mod_gk_start',
      name: 'World Explorer',
      description: 'Complete your first level in General Knowledge.',
      icon: 'bi-globe2',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'module_level_completed', value: 'general-knowledge' }
    },
    {
      id: 'mod_prog_start',
      name: 'Hello, World!',
      description: 'Complete your first level in Programming.',
      icon: 'bi-code-slash',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'module_level_completed', value: 'programming' }
    },
    {
      id: 'mod_cs_start',
      name: 'Kernel Awakened',
      description: 'Complete your first level in Computer Science.',
      icon: 'bi-cpu',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'module_level_completed', value: 'computer-science' }
    },
    {
      id: 'mod_eng_start',
      name: 'Circuit Builder',
      description: 'Complete your first level in Engineering.',
      icon: 'bi-gear-wide-connected',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'module_level_completed', value: 'engineering' }
    },
    {
      id: 'mod_med_start',
      name: 'Life Scientist',
      description: 'Complete your first level in Medical Science.',
      icon: 'bi-heart-pulse',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'module_level_completed', value: 'medical' }
    },

    // --- Streak Achievements ---
    {
      id: 'streak_5',
      name: 'Focused Streak',
      description: 'Answer 5 questions correctly in a row without a mistake.',
      icon: 'bi-fire',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'correct_streak', value: 5 }
    },
    {
      id: 'streak_10',
      name: 'Blazing Intellect',
      description: 'Answer 10 questions correctly in a row.',
      icon: 'bi-lightning-charge',
      rarity: 'rare',
      xpReward: 250,
      condition: { type: 'correct_streak', value: 10 }
    },
    {
      id: 'streak_25',
      name: 'Unstoppable Mind',
      description: 'Maintain an unbroken streak of 25 correct answers.',
      icon: 'bi-stars',
      rarity: 'epic',
      xpReward: 600,
      condition: { type: 'correct_streak', value: 25 }
    },
    {
      id: 'streak_50',
      name: 'Omniscient Flow',
      description: 'Achieve an astounding 50 consecutive correct answers.',
      icon: 'bi-trophy',
      rarity: 'legendary',
      xpReward: 1500,
      condition: { type: 'correct_streak', value: 50 }
    },

    // --- XP & Level Milestones ---
    {
      id: 'level_5',
      name: 'Apprentice Scholar',
      description: 'Reach Player Level 5.',
      icon: 'bi-award',
      rarity: 'common',
      xpReward: 200,
      condition: { type: 'player_level', value: 5 }
    },
    {
      id: 'level_10',
      name: 'Adept Researcher',
      description: 'Reach Player Level 10.',
      icon: 'bi-mortarboard',
      rarity: 'rare',
      xpReward: 500,
      condition: { type: 'player_level', value: 10 }
    },
    {
      id: 'level_25',
      name: 'Grand Polymath',
      description: 'Reach Player Level 25.',
      icon: 'bi-gem',
      rarity: 'epic',
      xpReward: 1200,
      condition: { type: 'player_level', value: 25 }
    },
    {
      id: 'level_50',
      name: 'Living Encyclopedia',
      description: 'Attain the supreme Player Level 50.',
      icon: 'bi-star-fill',
      rarity: 'legendary',
      xpReward: 3000,
      condition: { type: 'player_level', value: 50 }
    },

    // --- Currency & Wealth ---
    {
      id: 'coins_100',
      name: 'Pocket Money',
      description: 'Accumulate a balance of 100 Gold Coins.',
      icon: 'bi-coin',
      rarity: 'common',
      xpReward: 80,
      condition: { type: 'coins_balance', value: 100 }
    },
    {
      id: 'coins_500',
      name: 'Coin Collector',
      description: 'Accumulate a balance of 500 Gold Coins.',
      icon: 'bi-cash-coin',
      rarity: 'rare',
      xpReward: 300,
      condition: { type: 'coins_balance', value: 500 }
    },
    {
      id: 'coins_1000',
      name: 'Academy Treasurer',
      description: 'Accumulate a balance of 1,000 Gold Coins.',
      icon: 'bi-piggy-bank',
      rarity: 'epic',
      xpReward: 700,
      condition: { type: 'coins_balance', value: 1000 }
    },
    {
      id: 'diamonds_10',
      name: 'Glimmer of Brilliance',
      description: 'Collect 10 Rare Diamonds.',
      icon: 'bi-diamond',
      rarity: 'rare',
      xpReward: 350,
      condition: { type: 'diamonds_balance', value: 10 }
    },
    {
      id: 'diamonds_50',
      name: 'Diamond Monarch',
      description: 'Collect 50 Rare Diamonds.',
      icon: 'bi-gem',
      rarity: 'legendary',
      xpReward: 1500,
      condition: { type: 'diamonds_balance', value: 50 }
    },

    // --- Mastery & Perfect Scores ---
    {
      id: 'perfect_1',
      name: 'Flawless Precision',
      description: 'Score 100% accuracy on any level.',
      icon: 'bi-bullseye',
      rarity: 'common',
      xpReward: 150,
      condition: { type: 'perfect_levels', value: 1 }
    },
    {
      id: 'perfect_5',
      name: 'Master Tactician',
      description: 'Score 100% accuracy on 5 different levels.',
      icon: 'bi-shield-check',
      rarity: 'rare',
      xpReward: 400,
      condition: { type: 'perfect_levels', value: 5 }
    },
    {
      id: 'perfect_15',
      name: 'Perfectionist',
      description: 'Score 100% accuracy on 15 different levels.',
      icon: 'bi-patch-check-fill',
      rarity: 'epic',
      xpReward: 1000,
      condition: { type: 'perfect_levels', value: 15 }
    },

    // --- Speed Achievements ---
    {
      id: 'speed_2min',
      name: 'Quick Thinker',
      description: 'Complete a level in under 2 minutes with at least 80% accuracy.',
      icon: 'bi-stopwatch',
      rarity: 'rare',
      xpReward: 250,
      condition: { type: 'fast_level_time', value: 120 }
    },
    {
      id: 'speed_1min',
      name: 'Supersonic Wit',
      description: 'Complete a level in under 1 minute with 100% accuracy.',
      icon: 'bi-speedometer2',
      rarity: 'epic',
      xpReward: 750,
      condition: { type: 'lightning_level_time', value: 60 }
    },

    // --- Star Accumulation ---
    {
      id: 'stars_10',
      name: 'Starlit Path',
      description: 'Earn a total of 10 performance stars.',
      icon: 'bi-star',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'total_stars', value: 10 }
    },
    {
      id: 'stars_30',
      name: 'Constellation Weaver',
      description: 'Earn a total of 30 performance stars.',
      icon: 'bi-stars',
      rarity: 'rare',
      xpReward: 350,
      condition: { type: 'total_stars', value: 30 }
    },
    {
      id: 'stars_72',
      name: 'Galaxy Commander',
      description: 'Earn a maximum 3 stars across all 24 submodules (72 stars).',
      icon: 'bi-brightness-high',
      rarity: 'legendary',
      xpReward: 2000,
      condition: { type: 'total_stars', value: 72 }
    },

    // --- Completionist ---
    {
      id: 'complete_all_modules',
      name: 'Renaissance Intellect',
      description: 'Complete at least one level in every single module (all 8 modules).',
      icon: 'bi-diagram-2',
      rarity: 'epic',
      xpReward: 1000,
      condition: { type: 'all_modules_touched', value: 8 }
    },
    {
      id: 'all_submodules_done',
      name: 'Universal Conqueror',
      description: 'Complete all 24 submodules in Cortex Quest.',
      icon: 'bi-globe-americas',
      rarity: 'legendary',
      xpReward: 2500,
      condition: { type: 'submodules_completed', value: 24 }
    },

    // --- Hints & Self-Reliance ---
    {
      id: 'no_hints_level',
      name: 'Pure Instinct',
      description: 'Complete a full level without using any hints.',
      icon: 'bi-eye-slash',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'no_hint_levels', value: 1 }
    },
    {
      id: 'no_hints_5',
      name: 'Unyielding Resolve',
      description: 'Complete 5 levels without requesting a single hint.',
      icon: 'bi-shield-shaded',
      rarity: 'rare',
      xpReward: 350,
      condition: { type: 'no_hint_levels', value: 5 }
    },
    {
      id: 'hint_seeker',
      name: 'Knowledge Seeker',
      description: 'Use hints wisely to learn new problem-solving perspectives (5 hints used).',
      icon: 'bi-lightbulb',
      rarity: 'common',
      xpReward: 80,
      condition: { type: 'hints_used', value: 5 }
    },

    // --- Daily Challenges ---
    {
      id: 'daily_1',
      name: 'Daily Ritual',
      description: 'Complete your first Daily Quest Challenge.',
      icon: 'bi-calendar-check',
      rarity: 'common',
      xpReward: 120,
      condition: { type: 'daily_completed', value: 1 }
    },
    {
      id: 'daily_7',
      name: 'Weekly Devotee',
      description: 'Complete 7 Daily Quest Challenges.',
      icon: 'bi-calendar-week',
      rarity: 'rare',
      xpReward: 500,
      condition: { type: 'daily_completed', value: 7 }
    },
    {
      id: 'daily_30',
      name: 'Iron Consistency',
      description: 'Complete 30 Daily Quest Challenges.',
      icon: 'bi-calendar-heart',
      rarity: 'legendary',
      xpReward: 2000,
      condition: { type: 'daily_completed', value: 30 }
    },

    // --- Store & Economy ---
    {
      id: 'store_first_buy',
      name: 'Patron of the Arts',
      description: 'Make your first purchase in the Cortex Shop.',
      icon: 'bi-cart-check',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'purchases_made', value: 1 }
    },
    {
      id: 'store_big_spender',
      name: 'Elite Collector',
      description: 'Purchase 5 or more customizations or power-ups in the Cortex Shop.',
      icon: 'bi-bag-heart',
      rarity: 'rare',
      xpReward: 400,
      condition: { type: 'purchases_made', value: 5 }
    },

    // --- Puzzle Mini-Game ---
    {
      id: 'puzzle_first_line',
      name: 'Block Builder',
      description: 'Clear lines or score 500 points in the Cortex Block Puzzle.',
      icon: 'bi-boxes',
      rarity: 'common',
      xpReward: 100,
      condition: { type: 'puzzle_score', value: 500 }
    },
    {
      id: 'puzzle_master',
      name: 'Architect of Order',
      description: 'Reach a score of 2,500 points in the Cortex Block Puzzle.',
      icon: 'bi-building-check',
      rarity: 'epic',
      xpReward: 800,
      condition: { type: 'puzzle_score', value: 2500 }
    }
  ];

  window.CortexAchievementsData = {
    achievements: achievementsList,

    getAll: function () {
      return this.achievements;
    },

    getById: function (id) {
      for (var i = 0; i < this.achievements.length; i++) {
        if (this.achievements[i].id === id) {
          return this.achievements[i];
        }
      }
      return null;
    },

    getByRarity: function (rarity) {
      return this.achievements.filter(function (a) {
        return a.rarity === rarity;
      });
    }
  };
})();
