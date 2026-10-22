/**
 * ============================================================================
 * CORTEX QUEST — BRAIN TRAINING MINI-GAMES (brain-training.js)
 * ============================================================================
 * Exposes window.CortexBrainTraining
 * 4 fully functional interactive mini-games:
 * 1. Memory Match (4x4 card flip)
 * 2. Number Sequence (Arithmetic, geometric, fibonacci, alternating)
 * 3. Speed Math (Timed mental math challenges)
 * 4. Pattern Recognition (Visual symbol patterns)
 */

(function (window) {
  'use strict';

  // --------------------------------------------------------------------------
  // High Scores Storage Helpers
  // --------------------------------------------------------------------------
  function getStoredScores() {
    try {
      if (window.CortexStore && typeof window.CortexStore.getPlayer === 'function') {
        const p = window.CortexStore.getPlayer();
        if (p && p.brainTrainingScores) {
          return { ...p.brainTrainingScores };
        }
      }
      const raw = localStorage.getItem('cq_brain_training_scores');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[CortexBrainTraining] Error loading high scores:', e);
    }
    return {
      'memory-match': 0,
      'number-sequence': 0,
      'speed-math': 0,
      'pattern-recognition': 0
    };
  }

  function saveStoredScore(gameId, score) {
    const scores = getStoredScores();
    const currentBest = scores[gameId] || 0;
    if (score > currentBest) {
      scores[gameId] = score;
      try {
        if (window.CortexStore && typeof window.CortexStore.updatePlayer === 'function') {
          window.CortexStore.updatePlayer({ brainTrainingScores: scores });
        }
        localStorage.setItem('cq_brain_training_scores', JSON.stringify(scores));
      } catch (e) {
        console.warn('[CortexBrainTraining] Error saving high score:', e);
      }
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // Global Active Game State
  // --------------------------------------------------------------------------
  let activeGame = null;
  let activeTimer = null;

  function clearActiveTimer() {
    if (activeTimer) {
      clearInterval(activeTimer);
      activeTimer = null;
    }
  }

  // --------------------------------------------------------------------------
  // Brain Training Hub API
  // --------------------------------------------------------------------------
  const CortexBrainTraining = {
    /**
     * Get metadata and high scores for all 4 games
     */
    getGames: function () {
      const scores = getStoredScores();
      return [
        {
          id: 'memory-match',
          name: 'Memory Matrix',
          description: 'Flip cards and match neuro-synaptic symbol pairs in minimum moves.',
          icon: '🃏',
          bestScore: scores['memory-match'] || 0
        },
        {
          id: 'number-sequence',
          name: 'Number Sequence',
          description: 'Decipher mathematical progressions and predict the missing term.',
          icon: '🔢',
          bestScore: scores['number-sequence'] || 0
        },
        {
          id: 'speed-math',
          name: 'Speed Arithmetic',
          description: 'High-velocity mental calculations under strict time pressure.',
          icon: '⚡',
          bestScore: scores['speed-math'] || 0
        },
        {
          id: 'pattern-recognition',
          name: 'Pattern Recognition',
          description: 'Detect visual, directional, and logical sequence rules.',
          icon: '🧩',
          bestScore: scores['pattern-recognition'] || 0
        }
      ];
    },

    /**
     * Start a specific game by ID and render into container
     */
    startGame: function (gameId, containerId = 'brain-training-container') {
      clearActiveTimer();
      const targetId = containerId.replace(/^#/, '');

      switch (gameId) {
        case 'memory-match':
          return this.renderMemoryMatch(targetId);
        case 'number-sequence':
          return this.renderNumberSequence(targetId);
        case 'speed-math':
          return this.renderSpeedMath(targetId);
        case 'pattern-recognition':
          return this.renderPatternRecognition(targetId);
        default:
          console.error('[CortexBrainTraining] Unknown game:', gameId);
          return null;
      }
    },

    /**
     * Get active game state snapshot
     */
    getActiveGame: function () {
      return activeGame;
    },

    /**
     * End active game, award rewards, persist score
     */
    endGame: function (gameId, finalScore, stats = {}) {
      clearActiveTimer();
      const isNewHigh = saveStoredScore(gameId, finalScore);

      // Award XP and coins
      const xpEarned = Math.max(10, Math.round(finalScore / 10));
      const coinsEarned = Math.max(2, Math.round(finalScore / 50));

      try {
        if (window.CortexPlayer) {
          if (typeof window.CortexPlayer.addXP === 'function') window.CortexPlayer.addXP(xpEarned);
          if (typeof window.CortexPlayer.addCoins === 'function') window.CortexPlayer.addCoins(coinsEarned);
        }
      } catch (e) {
        console.warn('[CortexBrainTraining] Reward error:', e);
      }

      // Voice & audio feedback
      try {
        if (window.CortexAudio) {
          if (typeof window.CortexAudio.playVoice === 'function') {
            window.CortexAudio.playVoice(finalScore > 500 ? 'excellent' : 'good');
          }
          if (typeof window.CortexAudio.playBGM === 'function') {
            window.CortexAudio.playBGM('victory');
          }
        }
      } catch (e) {
        console.warn('[CortexBrainTraining] Audio error:', e);
      }

      // Achievement hook
      try {
        if (window.CortexGamification && typeof window.CortexGamification.checkAchievements === 'function') {
          window.CortexGamification.checkAchievements();
        }
      } catch (e) {
        console.warn('[CortexBrainTraining] Achievement error:', e);
      }

      return {
        gameId,
        score: finalScore,
        isNewHighScore: isNewHigh,
        xpEarned,
        coinsEarned,
        stats
      };
    },

    getBestScores: function () {
      return getStoredScores();
    },

    saveBestScore: function (gameId, score) {
      return saveStoredScore(gameId, score);
    },

    // ========================================================================
    // GAME 1: MEMORY MATCH (4x4 Grid, 8 Pairs)
    // ========================================================================
    renderMemoryMatch: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      this.injectStyles();

      const ICONS = ['🧠', '⚡', '🔬', '💡', '🎯', '🚀', '⭐', '🧬'];
      const cards = [...ICONS, ...ICONS]
        .sort(() => 0.5 - Math.random())
        .map((icon, idx) => ({
          id: idx,
          icon: icon,
          flipped: false,
          matched: false
        }));

      let moves = 0;
      let matchedCount = 0;
      let flippedCards = [];
      let lockBoard = false;
      let secondsElapsed = 0;

      activeGame = {
        id: 'memory-match',
        status: 'playing',
        moves: 0,
        matches: 0
      };

      container.innerHTML = `
        <div class="cq-game-wrapper">
          <div class="cq-game-hud">
            <div class="cq-hud-item"><span class="lbl">MOVES:</span> <span class="val" id="mm-moves">0</span></div>
            <div class="cq-hud-item"><span class="lbl">PAIRS:</span> <span class="val" id="mm-pairs">0 / 8</span></div>
            <div class="cq-hud-item"><span class="lbl">TIME:</span> <span class="val" id="mm-time">0s</span></div>
            <button class="cq-hud-btn" id="mm-restart">Restart</button>
          </div>
          <div class="cq-memory-grid" id="mm-grid"></div>
        </div>
      `;

      const gridEl = container.querySelector('#mm-grid');
      const movesEl = container.querySelector('#mm-moves');
      const pairsEl = container.querySelector('#mm-pairs');
      const timeEl = container.querySelector('#mm-time');

      activeTimer = setInterval(() => {
        secondsElapsed++;
        if (timeEl) timeEl.textContent = `${secondsElapsed}s`;
      }, 1000);

      // Render 16 cards
      function drawCards() {
        gridEl.innerHTML = '';
        cards.forEach((card, i) => {
          const cardEl = document.createElement('div');
          cardEl.className = `cq-memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`;
          cardEl.dataset.index = i;

          cardEl.innerHTML = `
            <div class="cq-card-inner">
              <div class="cq-card-front">?</div>
              <div class="cq-card-back">${card.icon}</div>
            </div>
          `;

          cardEl.addEventListener('click', () => handleCardClick(i));
          gridEl.appendChild(cardEl);
        });
      }

      const handleCardClick = (index) => {
        if (lockBoard) return;
        const card = cards[index];
        if (card.flipped || card.matched) return;

        // Flip card
        card.flipped = true;
        flippedCards.push({ card, index });
        drawCards();

        if (flippedCards.length === 2) {
          moves++;
          movesEl.textContent = moves;
          activeGame.moves = moves;

          const [first, second] = flippedCards;

          if (first.card.icon === second.card.icon) {
            // Match
            first.card.matched = true;
            second.card.matched = true;
            matchedCount++;
            pairsEl.textContent = `${matchedCount} / 8`;
            flippedCards = [];

            try {
              if (window.CortexAudio && typeof window.CortexAudio.playVoice === 'function') {
                window.CortexAudio.playVoice('good');
              }
            } catch (e) {}

            if (matchedCount === 8) {
              clearActiveTimer();
              const score = Math.max(100, 1000 - moves * 25 - secondsElapsed * 5);
              const summary = CortexBrainTraining.endGame('memory-match', score, { moves, secondsElapsed });

              setTimeout(() => {
                showGameOverModal(container, 'Memory Matrix Cleared!', score, [
                  { label: 'Moves Taken', value: moves },
                  { label: 'Time Elapsed', value: `${secondsElapsed}s` },
                  { label: 'XP Awarded', value: `+${summary.xpEarned} XP` },
                  { label: 'Coins Awarded', value: `+${summary.coinsEarned} 🪙` }
                ], () => CortexBrainTraining.renderMemoryMatch(containerId));
              }, 500);
            }
          } else {
            // No match
            lockBoard = true;
            setTimeout(() => {
              first.card.flipped = false;
              second.card.flipped = false;
              flippedCards = [];
              lockBoard = false;
              drawCards();
            }, 850);
          }
        }
      };

      container.querySelector('#mm-restart').addEventListener('click', () => {
        clearActiveTimer();
        this.renderMemoryMatch(containerId);
      });

      drawCards();
    },

    // ========================================================================
    // GAME 2: NUMBER SEQUENCE (10 Rounds, Increasing Difficulty)
    // ========================================================================
    renderNumberSequence: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      this.injectStyles();

      let currentRound = 0;
      const totalRounds = 10;
      let score = 0;
      let streak = 0;

      // Generators for different difficulty tiers
      function generateSequence(round) {
        let seq = [];
        let missing = 0;
        let rule = '';

        if (round <= 2) {
          // Tier 1: Simple Arithmetic Progression (+d)
          const start = Math.floor(Math.random() * 20) + 1;
          const diff = Math.floor(Math.random() * 6) + 2;
          seq = [start, start + diff, start + diff * 2, start + diff * 3];
          missing = start + diff * 4;
          rule = `Add ${diff} each step`;
        } else if (round <= 4) {
          // Tier 2: Decreasing or Alternating
          if (Math.random() > 0.5) {
            const start = Math.floor(Math.random() * 40) + 50;
            const diff = Math.floor(Math.random() * 5) + 3;
            seq = [start, start - diff, start - diff * 2, start - diff * 3];
            missing = start - diff * 4;
            rule = `Subtract ${diff} each step`;
          } else {
            const start = Math.floor(Math.random() * 10) + 5;
            const d1 = 4, d2 = -1;
            seq = [start, start + d1, start + d1 + d2, start + d1 + d2 + d1];
            missing = start + d1 + d2 + d1 + d2;
            rule = 'Alternating +4, -1';
          }
        } else if (round <= 6) {
          // Tier 3: Geometric Progression
          const start = Math.floor(Math.random() * 4) + 2;
          const r = Math.random() > 0.5 ? 2 : 3;
          seq = [start, start * r, start * r * r, start * r * r * r];
          missing = start * Math.pow(r, 4);
          rule = `Multiply by ${r} each step`;
        } else if (round <= 8) {
          // Tier 4: Squares or n^2 + 1
          const offset = Math.floor(Math.random() * 3);
          const base = Math.floor(Math.random() * 3) + 1;
          seq = [
            base * base + offset,
            (base + 1) * (base + 1) + offset,
            (base + 2) * (base + 2) + offset,
            (base + 3) * (base + 3) + offset
          ];
          missing = (base + 4) * (base + 4) + offset;
          rule = offset === 0 ? 'Consecutive squares' : `Squares + ${offset}`;
        } else {
          // Tier 5: Fibonacci-like
          const a = Math.floor(Math.random() * 4) + 1;
          const b = Math.floor(Math.random() * 5) + 2;
          const c = a + b;
          const d = b + c;
          seq = [a, b, c, d];
          missing = c + d;
          rule = 'Each term is the sum of previous two';
        }

        // Generate 3 plausible distractors
        const optionsSet = new Set([missing]);
        while (optionsSet.size < 4) {
          const delta = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
          const candidate = missing + delta;
          if (candidate > 0 && candidate !== missing) {
            optionsSet.add(candidate);
          }
        }

        const options = Array.from(optionsSet).sort(() => 0.5 - Math.random());

        return {
          sequence: seq,
          correct: missing,
          options: options,
          rule: rule
        };
      }

      function loadRound() {
        const roundData = generateSequence(currentRound);

        container.innerHTML = `
          <div class="cq-game-wrapper">
            <div class="cq-game-hud">
              <div class="cq-hud-item"><span class="lbl">ROUND:</span> <span class="val">${currentRound + 1} / ${totalRounds}</span></div>
              <div class="cq-hud-item"><span class="lbl">SCORE:</span> <span class="val">${score}</span></div>
              <div class="cq-hud-item"><span class="lbl">STREAK:</span> <span class="val">${streak}🔥</span></div>
            </div>

            <div class="cq-seq-card">
              <div class="cq-seq-prompt">Find the missing number in the sequence:</div>
              <div class="cq-seq-numbers">
                ${roundData.sequence.map(n => `<div class="cq-seq-pill">${n}</div>`).join('')}
                <div class="cq-seq-pill question">?</div>
              </div>

              <div class="cq-options-grid mt-4">
                ${roundData.options.map((opt, i) => `
                  <button class="cq-opt-btn" data-val="${opt}">
                    ${opt}
                  </button>
                `).join('')}
              </div>

              <div class="cq-feedback-area mt-3 d-none"></div>
            </div>
          </div>
        `;

        const optBtns = container.querySelectorAll('.cq-opt-btn');
        const feedbackEl = container.querySelector('.cq-feedback-area');

        optBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const chosen = parseInt(e.currentTarget.dataset.val, 10);
            optBtns.forEach(b => b.disabled = true);

            const isCorrect = chosen === roundData.correct;
            feedbackEl.classList.remove('d-none');

            if (isCorrect) {
              e.currentTarget.classList.add('correct');
              streak++;
              const roundPoints = 100 + (streak > 1 ? (streak - 1) * 20 : 0);
              score += roundPoints;
              feedbackEl.className = 'cq-feedback-area mt-3 alert alert-success p-2 text-center';
              feedbackEl.textContent = `Correct! +${roundPoints} points (${roundData.rule})`;

              try {
                if (window.CortexAudio && typeof window.CortexAudio.playVoice === 'function') {
                  window.CortexAudio.playVoice('great');
                }
              } catch (err) {}
            } else {
              e.currentTarget.classList.add('wrong');
              streak = 0;
              // Highlight correct
              optBtns.forEach(b => {
                if (parseInt(b.dataset.val, 10) === roundData.correct) {
                  b.classList.add('correct');
                }
              });
              feedbackEl.className = 'cq-feedback-area mt-3 alert alert-danger p-2 text-center';
              feedbackEl.textContent = `Incorrect! The answer was ${roundData.correct} (${roundData.rule})`;
            }

            setTimeout(() => {
              currentRound++;
              if (currentRound < totalRounds) {
                loadRound();
              } else {
                // Game Over
                const summary = CortexBrainTraining.endGame('number-sequence', score, { totalRounds });
                showGameOverModal(container, 'Sequence Training Complete!', score, [
                  { label: 'Final Score', value: score },
                  { label: 'Rounds Completed', value: `${totalRounds} / ${totalRounds}` },
                  { label: 'XP Awarded', value: `+${summary.xpEarned} XP` },
                  { label: 'Coins Awarded', value: `+${summary.coinsEarned} 🪙` }
                ], () => CortexBrainTraining.renderNumberSequence(containerId));
              }
            }, 1200);
          });
        });
      }

      loadRound();
    },

    // ========================================================================
    // GAME 3: SPEED MATH (10 Questions, 20s Per Question)
    // ========================================================================
    renderSpeedMath: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      this.injectStyles();

      let currentQuestion = 0;
      const totalQuestions = 10;
      let score = 0;
      let correctAnswers = 0;
      let timeLeft = 20;

      function generateMathProblem(qIndex) {
        let questionText = '';
        let answer = 0;

        if (qIndex < 3) {
          // Addition / Subtraction
          const a = Math.floor(Math.random() * 50) + 10;
          const b = Math.floor(Math.random() * 50) + 10;
          if (Math.random() > 0.5) {
            questionText = `${a} + ${b} = ?`;
            answer = a + b;
          } else {
            const big = Math.max(a, b);
            const small = Math.min(a, b);
            questionText = `${big} - ${small} = ?`;
            answer = big - small;
          }
        } else if (qIndex < 7) {
          // Multiplication / Division
          if (Math.random() > 0.4) {
            const a = Math.floor(Math.random() * 12) + 3;
            const b = Math.floor(Math.random() * 12) + 2;
            questionText = `${a} × ${b} = ?`;
            answer = a * b;
          } else {
            const b = Math.floor(Math.random() * 9) + 2;
            const mult = Math.floor(Math.random() * 12) + 2;
            const a = b * mult;
            questionText = `${a} ÷ ${b} = ?`;
            answer = mult;
          }
        } else {
          // Combined Operation: (a * b) - c
          const a = Math.floor(Math.random() * 10) + 2;
          const b = Math.floor(Math.random() * 6) + 2;
          const c = Math.floor(Math.random() * 20) + 5;
          questionText = `(${a} × ${b}) - ${c} = ?`;
          answer = a * b - c;
        }

        // Distractors
        const optionsSet = new Set([answer]);
        while (optionsSet.size < 4) {
          const delta = (Math.floor(Math.random() * 8) + 1) * (Math.random() > 0.5 ? 1 : -1);
          optionsSet.add(answer + delta);
        }

        const options = Array.from(optionsSet).sort(() => 0.5 - Math.random());
        return { text: questionText, answer, options };
      }

      function loadNextProblem() {
        clearActiveTimer();
        timeLeft = 20;

        const problem = generateMathProblem(currentQuestion);

        container.innerHTML = `
          <div class="cq-game-wrapper">
            <div class="cq-game-hud">
              <div class="cq-hud-item"><span class="lbl">QUESTION:</span> <span class="val">${currentQuestion + 1} / ${totalQuestions}</span></div>
              <div class="cq-hud-item"><span class="lbl">SCORE:</span> <span class="val">${score}</span></div>
              <div class="cq-hud-item timer"><span class="lbl">TIME:</span> <span class="val text-warning" id="sm-timer">${timeLeft}s</span></div>
            </div>

            <div class="cq-seq-card text-center">
              <div class="cq-math-expr mb-4">${problem.text}</div>
              
              <div class="cq-options-grid">
                ${problem.options.map(opt => `
                  <button class="cq-opt-btn" data-val="${opt}">${opt}</button>
                `).join('')}
              </div>
            </div>
          </div>
        `;

        const timerEl = container.querySelector('#sm-timer');
        const optBtns = container.querySelectorAll('.cq-opt-btn');

        activeTimer = setInterval(() => {
          timeLeft--;
          if (timerEl) timerEl.textContent = `${timeLeft}s`;

          if (timeLeft <= 0) {
            clearActiveTimer();
            // Time out: advance
            advance();
          }
        }, 1000);

        function advance(chosen = null) {
          clearActiveTimer();
          optBtns.forEach(b => b.disabled = true);

          if (chosen !== null) {
            const isCorrect = chosen === problem.answer;
            if (isCorrect) {
              correctAnswers++;
              const speedBonus = timeLeft * 10;
              score += 100 + speedBonus;
              try {
                if (window.CortexAudio && typeof window.CortexAudio.playVoice === 'function') {
                  window.CortexAudio.playVoice('awesome');
                }
              } catch (e) {}
            }
          }

          optBtns.forEach(b => {
            const val = parseInt(b.dataset.val, 10);
            if (val === problem.answer) b.classList.add('correct');
            else if (val === chosen) b.classList.add('wrong');
          });

          setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < totalQuestions) {
              loadNextProblem();
            } else {
              const summary = CortexBrainTraining.endGame('speed-math', score, { correctAnswers, totalQuestions });
              showGameOverModal(container, 'Speed Arithmetic Finished!', score, [
                { label: 'Accuracy', value: `${correctAnswers} / ${totalQuestions}` },
                { label: 'Final Score', value: score },
                { label: 'XP Awarded', value: `+${summary.xpEarned} XP` },
                { label: 'Coins Awarded', value: `+${summary.coinsEarned} 🪙` }
              ], () => CortexBrainTraining.renderSpeedMath(containerId));
            }
          }, 900);
        }

        optBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const val = parseInt(e.currentTarget.dataset.val, 10);
            advance(val);
          });
        });
      }

      loadNextProblem();
    },

    // ========================================================================
    // GAME 4: PATTERN RECOGNITION (10 Visual Symbol Sequences)
    // ========================================================================
    renderPatternRecognition: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      this.injectStyles();

      const PATTERN_ROUNDS = [
        {
          name: 'Alternating Duo',
          display: ['🔴', '🔵', '🔴', '🔵', '🔴'],
          correct: '🔵',
          options: ['🔵', '🔴', '🟢', '🟡']
        },
        {
          name: 'Compass Cycle',
          display: ['⬆️', '➡️', '⬇️', '⬅️', '⬆️'],
          correct: '➡️',
          options: ['⬅️', '⬇️', '➡️', '↖️']
        },
        {
          name: 'Growing Triangles',
          display: ['🔺', '🔷', '🔺', '🔺', '🔷', '🔺', '🔺'],
          correct: '🔺',
          options: ['🔺', '🔷', '🔶', '⬛']
        },
        {
          name: 'RGB Tri-Cycle',
          display: ['🟢', '🟡', '🟣', '🟢', '🟡'],
          correct: '🟣',
          options: ['🟢', '🟡', '🟣', '🔴']
        },
        {
          name: 'Clock Progression',
          display: ['🕐', '🕒', '🕔', '🕖'],
          correct: '🕘',
          options: ['🕗', '🕘', '🕙', '🕛']
        },
        {
          name: 'Celestial Cycle',
          display: ['☀️', '🌙', '⭐', '☀️', '🌙'],
          correct: '⭐',
          options: ['☀️', '⭐', '🌙', '🪐']
        },
        {
          name: 'Fruit Multiplier',
          display: ['🍎', '🍌', '🍎', '🍌', '🍌', '🍎', '🍌', '🍌'],
          correct: '🍌',
          options: ['🍎', '🍌', '🍇', '🍉']
        },
        {
          name: 'Dice Dots',
          display: ['⚀', '⚁', '⚂', '⚃', '⚄'],
          correct: '⚅',
          options: ['⚂', '⚃', '⚅', '⚁']
        },
        {
          name: 'Elemental Matrix',
          display: ['🔥', '💧', '⚡', '🌍', '🔥', '💧'],
          correct: '⚡',
          options: ['🔥', '⚡', '💧', '🌍']
        },
        {
          name: 'Math Operation Loop',
          display: ['➕', '➖', '✖️', '➕', '➖', '✖️', '➕'],
          correct: '➖',
          options: ['➕', '➖', '✖️', '➗']
        }
      ];

      let currentRound = 0;
      let score = 0;
      let streak = 0;

      function renderRound() {
        const round = PATTERN_ROUNDS[currentRound];

        container.innerHTML = `
          <div class="cq-game-wrapper">
            <div class="cq-game-hud">
              <div class="cq-hud-item"><span class="lbl">PATTERN:</span> <span class="val">${currentRound + 1} / ${PATTERN_ROUNDS.length}</span></div>
              <div class="cq-hud-item"><span class="lbl">SCORE:</span> <span class="val">${score}</span></div>
              <div class="cq-hud-item"><span class="lbl">STREAK:</span> <span class="val">${streak}🔥</span></div>
            </div>

            <div class="cq-seq-card text-center">
              <div class="cq-seq-prompt mb-3">Identify the rule and complete the pattern:</div>
              <div class="cq-pattern-row mb-4">
                ${round.display.map(s => `<div class="cq-pattern-symbol">${s}</div>`).join('')}
                <div class="cq-pattern-symbol question">?</div>
              </div>

              <div class="cq-options-grid">
                ${round.options.map(opt => `
                  <button class="cq-opt-btn pattern" data-symbol="${opt}">${opt}</button>
                `).join('')}
              </div>
            </div>
          </div>
        `;

        const btns = container.querySelectorAll('.cq-opt-btn');

        btns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            const sym = e.currentTarget.dataset.symbol;
            btns.forEach(b => b.disabled = true);

            const isCorrect = sym === round.correct;

            if (isCorrect) {
              e.currentTarget.classList.add('correct');
              streak++;
              score += 100 + (streak > 1 ? (streak - 1) * 25 : 0);

              try {
                if (window.CortexAudio && typeof window.CortexAudio.playVoice === 'function') {
                  window.CortexAudio.playVoice('amazing');
                }
              } catch (err) {}
            } else {
              e.currentTarget.classList.add('wrong');
              streak = 0;
              btns.forEach(b => {
                if (b.dataset.symbol === round.correct) b.classList.add('correct');
              });
            }

            setTimeout(() => {
              currentRound++;
              if (currentRound < PATTERN_ROUNDS.length) {
                renderRound();
              } else {
                const summary = CortexBrainTraining.endGame('pattern-recognition', score, { total: PATTERN_ROUNDS.length });
                showGameOverModal(container, 'Pattern Analysis Complete!', score, [
                  { label: 'Final Score', value: score },
                  { label: 'Total Patterns', value: PATTERN_ROUNDS.length },
                  { label: 'XP Awarded', value: `+${summary.xpEarned} XP` },
                  { label: 'Coins Awarded', value: `+${summary.coinsEarned} 🪙` }
                ], () => CortexBrainTraining.renderPatternRecognition(containerId));
              }
            }, 900);
          });
        });
      }

      renderRound();
    },

    // ------------------------------------------------------------------------
    // Visual Styling Injection
    // ------------------------------------------------------------------------
    injectStyles: function () {
      if (document.getElementById('cq-brain-training-styles')) return;

      const style = document.createElement('style');
      style.id = 'cq-brain-training-styles';
      style.textContent = `
        .cq-game-wrapper {
          background: #1a2d0a;
          border: 1px solid rgba(122, 154, 92, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          color: #e8f0d8;
          max-width: 650px;
          margin: 0 auto;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
          user-select: none;
        }
        .cq-game-hud {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(13, 26, 5, 0.8);
          border: 1px solid rgba(122, 154, 92, 0.25);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
        }
        .cq-hud-item .lbl {
          font-size: 0.75rem;
          color: #a0b88d;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-right: 0.25rem;
        }
        .cq-hud-item .val {
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
        }
        .cq-hud-btn {
          background: #3A5311;
          color: #f5f0e8;
          border: 1px solid #7a9a5c;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .cq-hud-btn:hover {
          background: #4d6e18;
        }
        /* Memory Grid */
        .cq-memory-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          perspective: 1000px;
        }
        .cq-memory-card {
          aspect-ratio: 1;
          cursor: pointer;
        }
        .cq-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.4s ease;
          transform-style: preserve-3d;
          border-radius: 12px;
        }
        .cq-memory-card.flipped .cq-card-inner,
        .cq-memory-card.matched .cq-card-inner {
          transform: rotateY(180deg);
        }
        .cq-card-front, .cq-card-back {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          backface-visibility: hidden;
          font-size: 2rem;
          border: 1px solid rgba(122, 154, 92, 0.3);
        }
        .cq-card-front {
          background: linear-gradient(135deg, #243d10, #1a2d05);
          color: #7a9a5c;
          font-weight: 900;
        }
        .cq-card-back {
          background: #3A5311;
          transform: rotateY(180deg);
          box-shadow: 0 0 12px rgba(122, 154, 92, 0.4);
        }
        .cq-memory-card.matched .cq-card-back {
          border-color: #22c55e;
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
        }
        /* Sequence Card & Options */
        .cq-seq-card {
          background: rgba(13, 26, 5, 0.6);
          border: 1px solid rgba(122, 154, 92, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
        }
        .cq-seq-prompt {
          font-weight: 600;
          color: #e8f0d8;
          font-size: 1.05rem;
          margin-bottom: 1.25rem;
        }
        .cq-seq-numbers, .cq-pattern-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 1.5rem;
        }
        .cq-seq-pill, .cq-pattern-symbol {
          background: #243d10;
          border: 1px solid #7a9a5c;
          border-radius: 10px;
          padding: 0.75rem 1.25rem;
          font-size: 1.4rem;
          font-weight: 800;
          color: #f5f0e8;
          min-width: 50px;
          text-align: center;
        }
        .cq-seq-pill.question, .cq-pattern-symbol.question {
          border-color: #d4a017;
          background: rgba(212, 160, 23, 0.15);
          color: #d4a017;
          animation: cqPulse 1.5s infinite;
        }
        @keyframes cqPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .cq-math-expr {
          font-size: 2.2rem;
          font-weight: 800;
          color: #f5f0e8;
          letter-spacing: 0.05em;
        }
        .cq-options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .cq-opt-btn {
          background: #243d10;
          border: 1px solid rgba(122, 154, 92, 0.4);
          color: #e8f0d8;
          font-size: 1.25rem;
          font-weight: 700;
          padding: 0.85rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cq-opt-btn.pattern {
          font-size: 1.8rem;
        }
        .cq-opt-btn:hover:not(:disabled) {
          background: #3A5311;
          border-color: #7a9a5c;
          transform: translateY(-2px);
        }
        .cq-opt-btn.correct {
          background: #22c55e !important;
          border-color: #16a34a !important;
          color: #fff !important;
        }
        .cq-opt-btn.wrong {
          background: #ef4444 !important;
          border-color: #dc2626 !important;
          color: #fff !important;
        }
        /* Modal */
        .cq-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .cq-modal-box {
          background: #1a2d0a;
          border: 2px solid #7a9a5c;
          border-radius: 20px;
          padding: 2rem;
          max-width: 450px;
          width: 90%;
          text-align: center;
          color: #e8f0d8;
          box-shadow: 0 0 40px rgba(58, 83, 17, 0.6);
        }
        .cq-modal-icon { font-size: 3rem; margin-bottom: 0.5rem; }
        .cq-modal-title { font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; }
        .cq-modal-score { font-size: 2.2rem; font-weight: 900; color: #d4a017; margin-bottom: 1.25rem; }
        .cq-modal-stats { background: rgba(13, 26, 5, 0.7); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; }
        .cq-modal-row { display: flex; justify-content: space-between; padding: 0.35rem 0; font-size: 0.95rem; border-bottom: 1px solid rgba(122, 154, 92, 0.15); }
        .cq-modal-row:last-child { border-bottom: none; }
        .cq-modal-row .k { color: #a0b88d; }
        .cq-modal-row .v { font-weight: 700; color: #fff; }
        .cq-modal-action-btn {
          background: #3A5311;
          color: #fff;
          border: 1px solid #7a9a5c;
          font-weight: 700;
          padding: 0.75rem 2rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .cq-modal-action-btn:hover {
          background: #4d6e18;
          transform: translateY(-2px);
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Helper Modal for Game Completion
  function showGameOverModal(container, title, score, statsList, onRestart) {
    const modal = document.createElement('div');
    modal.className = 'cq-modal-backdrop';

    modal.innerHTML = `
      <div class="cq-modal-box">
        <div class="cq-modal-icon">🏆</div>
        <div class="cq-modal-title">${title}</div>
        <div class="cq-modal-score">${score} PTS</div>
        
        <div class="cq-modal-stats">
          ${statsList.map(item => `
            <div class="cq-modal-row">
              <span class="k">${item.label}</span>
              <span class="v">${item.value}</span>
            </div>
          `).join('')}
        </div>

        <button type="button" class="cq-modal-action-btn" id="cq-modal-play-again">Play Again</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#cq-modal-play-again').addEventListener('click', () => {
      modal.remove();
      if (typeof onRestart === 'function') onRestart();
    });
  }

  // Expose globally
  window.CortexBrainTraining = CortexBrainTraining;

})(window);
