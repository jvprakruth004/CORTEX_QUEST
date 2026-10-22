(function() {
  'use strict';

  const GAMES = [
    {
      id: 'memory-match',
      name: 'Memory Matrix',
      icon: 'bi-grid-3x3-gap-fill',
      color: '#38bdf8',
      desc: 'Flip pairs of neural cards and match matching symbol pairs with minimal moves.',
      bestScoreKey: 'cq_best_memory'
    },
    {
      id: 'number-sequence',
      name: 'Number Sequence',
      icon: 'bi-sort-numeric-up',
      color: '#f0c040',
      desc: 'Identify recursive numerical progression rules and fill in missing pattern terms.',
      bestScoreKey: 'cq_best_sequence'
    },
    {
      id: 'speed-math',
      name: 'Speed Math Blitz',
      icon: 'bi-lightning-charge-fill',
      color: '#22c55e',
      desc: 'Rapid-fire mental calculation sprint! Solve as many equations as possible in 45 seconds.',
      bestScoreKey: 'cq_best_speedmath'
    },
    {
      id: 'pattern-rec',
      name: 'Pattern Recognition',
      icon: 'bi-gem',
      color: '#a855f7',
      desc: 'Decipher logical geometric glyph cycles and choose the logical successor.',
      bestScoreKey: 'cq_best_pattern'
    }
  ];

  window.PageBrainTraining = {
    render: function() {
      const main = document.getElementById('cq-main');
      if (!main) return;

      const getBestScore = (key) => {
        try { return parseInt(localStorage.getItem(key) || '0', 10); } catch(e) { return 0; }
      };

      const setBestScore = (key, val) => {
        try {
          const cur = getBestScore(key);
          if (val > cur) localStorage.setItem(key, val.toString());
        } catch(e) {}
      };

      const renderHub = () => {
        main.innerHTML = `
          <div class="cq-brain-page min-vh-100 pb-5" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
            
            <!-- TOP NAVBAR -->
            <div class="sticky-top px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.94); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
              <div class="d-flex align-items-center gap-3">
                <button id="cq-brain-back" class="btn btn-sm btn-icon rounded-circle" style="width: 38px; height: 38px; background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #9ab87e;">
                  <i class="bi bi-arrow-left fs-5"></i>
                </button>
                <div>
                  <h1 class="h4 fw-bold mb-0 text-white">Brain Arcade & Cognitive Gym</h1>
                  <small style="color: var(--cq-text-muted);">Exercise memory, calculation velocity, and spatial pattern deduction</small>
                </div>
              </div>
            </div>

            <!-- CONTAINER -->
            <div class="container-fluid px-3 px-lg-4 py-4" style="max-width: 1200px;">
              <div id="brain-training-container">
                <div class="row g-4">
                  ${GAMES.map(g => {
                    const best = getBestScore(g.bestScoreKey);
                    return `
                      <div class="col-12 col-md-6">
                        <div class="cq-card h-100 p-4 rounded-4 d-flex flex-column justify-content-between position-relative overflow-hidden shadow-lg transition-normal" style="background: rgba(26, 45, 10, 0.85); border: 1px solid ${g.color}40;">
                          
                          <div>
                            <div class="d-flex align-items-center justify-content-between mb-3">
                              <div class="d-flex align-items-center justify-content-center rounded-3 shadow" style="width: 58px; height: 58px; background: rgba(13,26,5,0.8); border: 2px solid ${g.color}; color: ${g.color}; font-size: 2rem;">
                                <i class="bi ${g.icon}"></i>
                              </div>
                              <span class="badge rounded-pill px-3 py-1" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: var(--cq-gold-light); font-size: 0.75rem;">
                                High Score: ${best}
                              </span>
                            </div>

                            <h2 class="h5 fw-bold text-white mb-2">${g.name}</h2>
                            <p class="small text-muted mb-4" style="color: var(--cq-cream-muted) !important; font-size: 0.85rem; line-height: 1.5;">
                              ${g.desc}
                            </p>
                          </div>

                          <button class="cq-play-game-btn btn w-100 py-2 rounded-pill fw-bold text-white shadow" data-game="${g.id}" style="background: linear-gradient(135deg, ${g.color}cc, ${g.color}88); border: 1px solid ${g.color};">
                            <i class="bi bi-play-circle-fill me-1"></i> Play Game
                          </button>

                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

          </div>
        `;

        const backBtn = document.getElementById('cq-brain-back');
        if (backBtn) backBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
        });

        const playBtns = document.querySelectorAll('.cq-play-game-btn');
        playBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const gameId = btn.getAttribute('data-game');
            launchGame(gameId);
          });
        });
      };

      const launchGame = (gameId) => {
        const container = document.getElementById('brain-training-container');
        if (!container) return;

        if (gameId === 'speed-math') {
          playSpeedMath(container);
        } else if (gameId === 'memory-match') {
          playMemoryMatch(container);
        } else if (gameId === 'number-sequence') {
          playNumberSequence(container);
        } else {
          playPatternRec(container);
        }
      };

      const showGameCompleteModal = (gameName, score, bestKey) => {
        setBestScore(bestKey, score);
        if (window.CortexPlayer) {
          if (window.CortexPlayer.addXP) window.CortexPlayer.addXP(50);
          if (window.CortexPlayer.addCoins) window.CortexPlayer.addCoins(15);
        }

        const container = document.getElementById('brain-training-container');
        if (!container) return;

        container.innerHTML = `
          <div class="cq-card p-4 p-md-5 rounded-4 shadow-xl text-center mx-auto animate-bounce-in" style="max-width: 480px; background: rgba(26, 45, 10, 0.95); border: 2px solid #7a9a5c;">
            <i class="bi bi-trophy-fill text-warning display-4 mb-2 d-block"></i>
            <h3 class="h4 fw-bold text-white mb-1">Game Over!</h3>
            <p class="small text-muted mb-3">${gameName} Session Complete</p>

            <div class="p-3 rounded-3 mb-4" style="background: rgba(13,26,5,0.8); border: 1px solid rgba(122,154,92,0.3);">
              <div class="display-6 fw-bold text-white mb-1">${score}</div>
              <small class="text-warning">Points Scored</small>
            </div>

            <div class="d-flex justify-content-center gap-2 mb-4">
              <span class="badge bg-purple px-3 py-2 rounded-pill" style="background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid #a855f7;">+50 XP</span>
              <span class="badge bg-warning px-3 py-2 rounded-pill" style="background: rgba(212,160,23,0.2); color: #f0c040; border: 1px solid #f0c040;">+15 🪙 Coins</span>
            </div>

            <div class="d-flex gap-2">
              <button id="cq-game-replay" class="btn btn-warning flex-grow-1 py-2 rounded-pill fw-bold" style="background: linear-gradient(135deg, #f0c040, #d4a017); border: none; color: #0d1a05;">
                Play Again
              </button>
              <button id="cq-game-hub" class="btn btn-outline-light flex-grow-1 py-2 rounded-pill fw-semibold" style="border-color: rgba(122,154,92,0.4);">
                Arcade Hub
              </button>
            </div>
          </div>
        `;

        const rep = document.getElementById('cq-game-replay');
        if (rep) rep.onclick = () => launchGame(GAMES.find(g => g.name === gameName)?.id || 'speed-math');
        const hub = document.getElementById('cq-game-hub');
        if (hub) hub.onclick = renderHub;
      };

      // SPEED MATH GAME
      const playSpeedMath = (container) => {
        let score = 0;
        let timeLeft = 45;
        let timer = null;
        let currentProblem = null;

        const genProblem = () => {
          const ops = ['+', '-', '*'];
          const op = ops[Math.floor(Math.random() * ops.length)];
          let a, b, ans;
          if (op === '+') {
            a = Math.floor(Math.random() * 50) + 10;
            b = Math.floor(Math.random() * 50) + 10;
            ans = a + b;
          } else if (op === '-') {
            a = Math.floor(Math.random() * 60) + 30;
            b = Math.floor(Math.random() * 30) + 5;
            ans = a - b;
          } else {
            a = Math.floor(Math.random() * 12) + 2;
            b = Math.floor(Math.random() * 12) + 2;
            ans = a * b;
          }

          // Generate 3 distractors
          const choices = [ans];
          while (choices.length < 4) {
            const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 10) + 1);
            const wrong = ans + delta;
            if (!choices.includes(wrong) && wrong >= 0) choices.push(wrong);
          }
          choices.sort(() => Math.random() - 0.5);
          return { text: `${a} ${op} ${b} = ?`, correct: ans, choices: choices };
        };

        const renderRound = () => {
          currentProblem = genProblem();
          container.innerHTML = `
            <div class="cq-card p-4 rounded-4 shadow-lg mx-auto" style="max-width: 540px; background: rgba(26, 45, 10, 0.9); border: 2px solid #22c55e;">
              <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom" style="border-color: rgba(122,154,92,0.2) !important;">
                <span class="fw-bold text-white">Speed Math Blitz</span>
                <span class="badge bg-warning text-dark font-monospace fw-bold fs-6">⏱️ <span id="sm-timer">${timeLeft}</span>s</span>
                <span class="badge bg-success fw-bold">Score: ${score}</span>
              </div>

              <div class="text-center py-4 mb-4 rounded-3" style="background: rgba(13,26,5,0.8); border: 1px solid rgba(122,154,92,0.3);">
                <div class="display-4 fw-bold text-white mb-0">${currentProblem.text}</div>
              </div>

              <div class="row g-2 mb-3">
                ${currentProblem.choices.map(c => `
                  <div class="col-6">
                    <button class="cq-sm-btn btn btn-outline-light w-100 py-3 rounded-3 fw-bold fs-4" data-val="${c}" style="background: rgba(13,26,5,0.7); border-color: rgba(122,154,92,0.3);">
                      ${c}
                    </button>
                  </div>
                `).join('')}
              </div>

              <button id="cq-sm-quit" class="btn btn-sm btn-link text-muted text-decoration-none w-100">Quit to Arcade</button>
            </div>
          `;

          const btns = container.querySelectorAll('.cq-sm-btn');
          btns.forEach(b => {
            b.addEventListener('click', () => {
              const val = parseInt(b.getAttribute('data-val'), 10);
              if (val === currentProblem.correct) {
                score += 10;
              } else {
                score = Math.max(0, score - 5);
              }
              renderRound();
            });
          });

          const quitBtn = document.getElementById('cq-sm-quit');
          if (quitBtn) quitBtn.onclick = () => {
            if (timer) clearInterval(timer);
            renderHub();
          };
        };

        timer = setInterval(() => {
          timeLeft--;
          const el = document.getElementById('sm-timer');
          if (el) el.textContent = timeLeft;
          if (timeLeft <= 0) {
            clearInterval(timer);
            showGameCompleteModal('Speed Math Blitz', score, 'cq_best_speedmath');
          }
        }, 1000);

        renderRound();
      };

      // MEMORY MATCH GAME
      const playMemoryMatch = (container) => {
        const symbols = ['⚡', '🧠', '💎', '🌟', '🚀', '🛡️'];
        let deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
        let flipped = [];
        let matched = [];
        let moves = 0;

        const renderBoard = () => {
          container.innerHTML = `
            <div class="cq-card p-4 rounded-4 shadow-lg mx-auto" style="max-width: 540px; background: rgba(26, 45, 10, 0.9); border: 2px solid #38bdf8;">
              <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom" style="border-color: rgba(122,154,92,0.2) !important;">
                <span class="fw-bold text-white">Memory Matrix</span>
                <span class="badge bg-info text-dark fw-bold">Moves: ${moves}</span>
                <span class="badge bg-success fw-bold">Matched: ${matched.length / 2} / 6</span>
              </div>

              <div class="row g-2 mb-4">
                ${deck.map((sym, idx) => {
                  const isFlipped = flipped.includes(idx) || matched.includes(idx);
                  return `
                    <div class="col-3">
                      <button class="cq-card-tile btn w-100 rounded-3 d-flex align-items-center justify-content-center shadow-sm"
                              data-idx="${idx}"
                              style="height: 80px; font-size: ${isFlipped ? '2rem' : '1.2rem'}; 
                                     background: ${isFlipped ? 'rgba(58,83,17,0.7)' : 'rgba(13,26,5,0.9)'}; 
                                     border: 2px solid ${isFlipped ? '#38bdf8' : 'rgba(122,154,92,0.3)'}; color: #fff;">
                        ${isFlipped ? sym : '❓'}
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>

              <button id="cq-mem-quit" class="btn btn-sm btn-link text-muted text-decoration-none w-100">Quit to Arcade</button>
            </div>
          `;

          const tiles = container.querySelectorAll('.cq-card-tile');
          tiles.forEach(tile => {
            tile.addEventListener('click', () => {
              const idx = parseInt(tile.getAttribute('data-idx'), 10);
              if (flipped.includes(idx) || matched.includes(idx) || flipped.length >= 2) return;

              flipped.push(idx);
              renderBoard();

              if (flipped.length === 2) {
                moves++;
                const [i1, i2] = flipped;
                if (deck[i1] === deck[i2]) {
                  matched.push(i1, i2);
                  flipped = [];
                  if (matched.length === deck.length) {
                    const finalScore = Math.max(10, 200 - moves * 10);
                    setTimeout(() => showGameCompleteModal('Memory Matrix', finalScore, 'cq_best_memory'), 500);
                  } else {
                    renderBoard();
                  }
                } else {
                  setTimeout(() => {
                    flipped = [];
                    renderBoard();
                  }, 800);
                }
              }
            });
          });

          const quitBtn = document.getElementById('cq-mem-quit');
          if (quitBtn) quitBtn.onclick = renderHub;
        };

        renderBoard();
      };

      // NUMBER SEQUENCE GAME
      const playNumberSequence = (container) => {
        let round = 1;
        let score = 0;
        const totalRounds = 5;

        const sequences = [
          { q: '2, 4, 8, 16, ?', correct: 32, options: [24, 30, 32, 36] },
          { q: '3, 7, 11, 15, ?', correct: 19, options: [18, 19, 21, 23] },
          { q: '1, 4, 9, 16, ?', correct: 25, options: [20, 24, 25, 30] },
          { q: '5, 10, 20, 40, ?', correct: 80, options: [60, 70, 80, 90] },
          { q: '2, 3, 5, 8, ?', correct: 12, options: [11, 12, 13, 15] }
        ];

        const renderSeqRound = () => {
          if (round > totalRounds) {
            showGameCompleteModal('Number Sequence', score, 'cq_best_sequence');
            return;
          }

          const cur = sequences[round - 1];
          container.innerHTML = `
            <div class="cq-card p-4 rounded-4 shadow-lg mx-auto" style="max-width: 500px; background: rgba(26, 45, 10, 0.9); border: 2px solid #f0c040;">
              <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom" style="border-color: rgba(122,154,92,0.2) !important;">
                <span class="fw-bold text-white">Number Sequence</span>
                <span class="badge bg-warning text-dark fw-bold">Round ${round}/${totalRounds}</span>
                <span class="badge bg-success fw-bold">Score: ${score}</span>
              </div>

              <div class="text-center py-4 mb-4 rounded-3" style="background: rgba(13,26,5,0.8); border: 1px solid rgba(122,154,92,0.3);">
                <div class="h3 fw-bold text-white mb-0">${cur.q}</div>
              </div>

              <div class="row g-2 mb-3">
                ${cur.options.map(opt => `
                  <div class="col-6">
                    <button class="cq-seq-btn btn btn-outline-light w-100 py-3 rounded-3 fw-bold fs-4" data-val="${opt}" style="background: rgba(13,26,5,0.7); border-color: rgba(122,154,92,0.3);">
                      ${opt}
                    </button>
                  </div>
                `).join('')}
              </div>

              <button id="cq-seq-quit" class="btn btn-sm btn-link text-muted text-decoration-none w-100">Quit to Arcade</button>
            </div>
          `;

          const btns = container.querySelectorAll('.cq-seq-btn');
          btns.forEach(b => {
            b.addEventListener('click', () => {
              const val = parseInt(b.getAttribute('data-val'), 10);
              if (val === cur.correct) score += 20;
              round++;
              renderSeqRound();
            });
          });

          const quitBtn = document.getElementById('cq-seq-quit');
          if (quitBtn) quitBtn.onclick = renderHub;
        };

        renderSeqRound();
      };

      // PATTERN RECOGNITION GAME
      const playPatternRec = (container) => {
        let round = 1;
        let score = 0;
        const totalRounds = 5;

        const patterns = [
          { q: '🔴  🟢  🔵  🔴  🟢  ?', correct: '🔵', options: ['🔴', '🟢', '🔵', '🟡'] },
          { q: '⬆️  ➡️  ⬇️  ⬅️  ⬆️  ?', correct: '➡️', options: ['⬆️', '➡️', '⬇️', '🔄'] },
          { q: '⭐  ⭐⭐  ⭐⭐⭐  ?', correct: '⭐⭐⭐⭐', options: ['⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '🌟'] },
          { q: '🔺  🔻  🔺  🔻  ?', correct: '🔺', options: ['🔺', '🔻', '🔶', '🔷'] },
          { q: '🌙  🌓  🌕  🌓  ?', correct: '🌙', options: ['🌙', '🌕', '☀️', '⭐'] }
        ];

        const renderPatRound = () => {
          if (round > totalRounds) {
            showGameCompleteModal('Pattern Recognition', score, 'cq_best_pattern');
            return;
          }

          const cur = patterns[round - 1];
          container.innerHTML = `
            <div class="cq-card p-4 rounded-4 shadow-lg mx-auto" style="max-width: 500px; background: rgba(26, 45, 10, 0.9); border: 2px solid #a855f7;">
              <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom" style="border-color: rgba(122,154,92,0.2) !important;">
                <span class="fw-bold text-white">Pattern Matrix</span>
                <span class="badge bg-purple fw-bold" style="background: rgba(168,85,247,0.3); color: #c084fc;">Round ${round}/${totalRounds}</span>
                <span class="badge bg-success fw-bold">Score: ${score}</span>
              </div>

              <div class="text-center py-4 mb-4 rounded-3" style="background: rgba(13,26,5,0.8); border: 1px solid rgba(122,154,92,0.3);">
                <div class="h3 fw-bold text-white mb-0" style="letter-spacing: 4px;">${cur.q}</div>
              </div>

              <div class="row g-2 mb-3">
                ${cur.options.map(opt => `
                  <div class="col-6">
                    <button class="cq-pat-btn btn btn-outline-light w-100 py-3 rounded-3 fw-bold fs-4" data-val="${opt}" style="background: rgba(13,26,5,0.7); border-color: rgba(122,154,92,0.3);">
                      ${opt}
                    </button>
                  </div>
                `).join('')}
              </div>

              <button id="cq-pat-quit" class="btn btn-sm btn-link text-muted text-decoration-none w-100">Quit to Arcade</button>
            </div>
          `;

          const btns = container.querySelectorAll('.cq-pat-btn');
          btns.forEach(b => {
            b.addEventListener('click', () => {
              const val = b.getAttribute('data-val');
              if (val === cur.correct) score += 20;
              round++;
              renderPatRound();
            });
          });

          const quitBtn = document.getElementById('cq-pat-quit');
          if (quitBtn) quitBtn.onclick = renderHub;
        };

        renderPatRound();
      };

      renderHub();
    }
  };
})();
