(function() {
  'use strict';

  let countdownTimer = null;
  let remainingSeconds = 30;
  let selectedOptionIndex = null;
  let hasSubmitted = false;
  let currentQIndex = 0;
  const TOTAL_QUESTIONS = 10;

  window.PageQuizScreen = {
    render: function(moduleId = 'general-aptitude', submoduleId = 'arithmetic', levelNumber = 1, difficulty = 'medium') {
      const main = document.getElementById('cq-main');
      if (!main) return;

      // Stop previous timers
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      selectedOptionIndex = null;
      hasSubmitted = false;
      currentQIndex = 0;

      // Play gameplay BGM
      if (window.CortexAudio && window.CortexAudio.playBGM) {
        try { window.CortexAudio.playBGM('gameplay'); } catch(e) {}
      }

      // Initialize quiz engine
      if (window.CortexQuiz && window.CortexQuiz.startLevel) {
        window.CortexQuiz.startLevel(moduleId, submoduleId, levelNumber, difficulty);
      }

      const formatTitle = (str) => (str || '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const subTitle = formatTitle(submoduleId);

      let playerCoins = (window.CortexPlayer && window.CortexPlayer.getCoinsBalance && window.CortexPlayer.getCoinsBalance()) || 100;
      let playerDiamonds = (window.CortexPlayer && window.CortexPlayer.getDiamondsBalance && window.CortexPlayer.getDiamondsBalance()) || 10;

      // Render outer layout (75% quiz / 25% puzzle on desktop)
      main.innerHTML = `
        <div class="cq-quiz-screen min-vh-100 d-flex flex-column" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
          
          <!-- TOP NAVBAR -->
          <header class="px-3 px-lg-4 py-2 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.95); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
            <div class="d-flex align-items-center gap-2">
              <button id="cq-quiz-exit-btn" class="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold" style="border-color: rgba(122,154,92,0.3); color: #9ab87e;">
                <i class="bi bi-x-lg me-1"></i> Exit
              </button>
              <div class="d-flex align-items-center gap-2">
                <span class="badge rounded-pill fw-bold" style="background: #3A5311; border: 1px solid #7a9a5c;">Level ${levelNumber}</span>
                <span class="fw-semibold text-white d-none d-sm-inline">${subTitle}</span>
                <span class="badge rounded-pill" style="background: rgba(255,255,255,0.1); text-transform: uppercase; font-size: 0.72rem;">${difficulty}</span>
              </div>
            </div>

            <!-- Currencies Mini Display -->
            <div class="d-flex align-items-center gap-2 px-3 py-1 rounded-pill" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3);">
              <span class="small fw-bold" style="color: var(--cq-color-coins, #d4a017);">🪙 <span id="cq-quiz-coins">${playerCoins}</span></span>
              <span class="small fw-bold" style="color: var(--cq-color-diamonds, #06b6d4);">💎 <span id="cq-quiz-diamonds">${playerDiamonds}</span></span>
            </div>
          </header>

          <!-- MAIN SPLIT VIEW (75% / 25%) -->
          <div class="container-fluid flex-grow-1 px-3 px-lg-4 py-3" style="max-width: 1500px;">
            <div class="row g-3 h-100">
              
              <!-- LEFT QUIZ PANEL (75%) -->
              <div class="col-12 col-lg-8 col-xl-9 d-flex flex-column">
                <div class="cq-card flex-grow-1 p-3 p-md-4 rounded-4 position-relative d-flex flex-column justify-content-between shadow-lg" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3); backdrop-filter: blur(8px);">
                  
                  <!-- QUIZ HEADER ROW (Timer & Progress Tracker) -->
                  <div>
                    <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style="border-color: rgba(122, 154, 92, 0.2) !important;">
                      <!-- Question Counter & Dots -->
                      <div class="d-flex align-items-center gap-2">
                        <span id="cq-q-counter" class="fw-bold fs-6 text-white">Question 1/10</span>
                        <div id="cq-q-dots" class="d-flex align-items-center gap-1 ms-2"></div>
                      </div>

                      <!-- 30s Countdown Timer -->
                      <div class="d-flex align-items-center gap-2">
                        <div id="cq-timer-container" class="d-flex align-items-center justify-content-center rounded-pill px-3 py-1" style="background: rgba(13,26,5,0.8); border: 1px solid #7a9a5c; min-width: 80px;">
                          <i class="bi bi-stopwatch text-warning me-1"></i>
                          <span id="cq-timer-text" class="fw-bold font-monospace text-white">30s</span>
                        </div>
                      </div>
                    </div>

                    <!-- Question Content Area -->
                    <div id="cq-question-card" class="mb-4">
                      <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
                        <h2 id="cq-question-text" class="h4 fw-bold text-white mb-0" style="line-height: 1.4; font-family: var(--cq-font-heading);">
                          Loading question...
                        </h2>
                        <!-- Hint Button -->
                        <button id="cq-hint-btn" class="btn btn-sm btn-outline-warning rounded-pill px-3 text-nowrap fw-semibold flex-shrink-0" style="border-color: rgba(212,160,23,0.5);">
                          💡 Hint (10 🪙)
                        </button>
                      </div>

                      <!-- Hint Box (Hidden by default) -->
                      <div id="cq-hint-box" class="alert alert-warning py-2 px-3 small d-none animate-slide-down mb-3" style="background: rgba(212, 160, 23, 0.15); border: 1px solid rgba(212, 160, 23, 0.4); color: #f0c040; border-radius: 12px;">
                        <i class="bi bi-lightbulb-fill me-1"></i> <span id="cq-hint-text"></span>
                      </div>

                      <!-- 4 Options Grid -->
                      <div id="cq-options-container" class="d-flex flex-column gap-2 mb-3">
                        <!-- Options injected dynamically -->
                      </div>

                      <!-- Answer Feedback Overlay/Alert -->
                      <div id="cq-feedback-banner" class="alert py-2 px-3 fw-semibold small d-none animate-bounce-in mb-3" style="border-radius: 12px;"></div>

                      <!-- Explanation Box (revealed after submitting) -->
                      <div id="cq-explanation-box" class="p-3 rounded-3 small d-none animate-slide-up" style="background: rgba(13, 26, 5, 0.9); border: 1px solid rgba(122, 154, 92, 0.35); color: #e8f0d8;">
                        <div class="fw-bold mb-1" style="color: var(--cq-gold-light);"><i class="bi bi-info-circle-fill me-1"></i> Explanation:</div>
                        <p id="cq-explanation-text" class="mb-0 text-muted" style="color: #cbd5e1 !important;"></p>
                      </div>
                    </div>
                  </div>

                  <!-- BOTTOM CONTROLS (Submit & Next Buttons) -->
                  <div class="d-flex align-items-center justify-content-end gap-2 pt-3 border-top" style="border-color: rgba(122, 154, 92, 0.2) !important;">
                    <button id="cq-submit-btn" class="btn btn-success fw-bold px-4 py-2 rounded-pill shadow" disabled style="background: #3A5311; border: 1px solid #7a9a5c;">
                      Submit Answer <i class="bi bi-check2-circle ms-1"></i>
                    </button>
                    <button id="cq-next-btn" class="btn btn-warning fw-bold px-4 py-2 rounded-pill shadow d-none" style="background: linear-gradient(135deg, #f0c040, #d4a017); border: none; color: #0d1a05;">
                      Next Question <i class="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>

                </div>
              </div>

              <!-- RIGHT PUZZLE PANEL (25%) -->
              <div class="col-12 col-lg-4 col-xl-3 d-flex flex-column">
                <div class="cq-card flex-grow-1 p-3 rounded-4 position-relative d-flex flex-column shadow-lg" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3); backdrop-filter: blur(8px);">
                  <div class="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom" style="border-color: rgba(122, 154, 92, 0.2) !important;">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-puzzle-fill text-warning"></i>
                      <span class="fw-bold small text-white">Quest Puzzle</span>
                    </div>
                    <span class="badge rounded-pill" style="background: rgba(212,160,23,0.2); color: var(--cq-gold-light); border: 1px solid rgba(212,160,23,0.4);">
                      Score: <span id="cq-puzzle-score-val">0</span>
                    </span>
                  </div>

                  <!-- Puzzle Container -->
                  <div id="cq-puzzle-container" class="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-2 rounded-3 position-relative overflow-hidden" style="background: rgba(13,26,5,0.7); border: 1px dashed rgba(122,154,92,0.3); min-height: 280px;">
                    <!-- Canvas / blocks rendered here by CortexPuzzle -->
                  </div>

                  <div class="text-center mt-2">
                    <small style="color: var(--cq-text-muted); font-size: 0.72rem;">
                      <i class="bi bi-info-circle me-1"></i> Correct answers place blocks!
                    </small>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      `;

      // Initialize Puzzle in right panel
      if (window.CortexPuzzle && window.CortexPuzzle.init) {
        try {
          window.CortexPuzzle.init('cq-puzzle-container');
        } catch(e) {
          console.warn('CortexPuzzle init error:', e);
        }
      }

      // Render dots
      const updateDots = (currentIdx, results = []) => {
        const dotsContainer = document.getElementById('cq-q-dots');
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < TOTAL_QUESTIONS; i++) {
          const dot = document.createElement('span');
          dot.style.cssText = 'width: 10px; height: 10px; border-radius: 50%; display: inline-block; transition: all 0.2s;';
          if (i < results.length) {
            dot.style.background = results[i] ? '#22c55e' : '#ef4444';
          } else if (i === currentIdx) {
            dot.style.background = '#f0c040';
            dot.style.boxShadow = '0 0 8px #f0c040';
          } else {
            dot.style.background = 'rgba(255,255,255,0.2)';
          }
          dotsContainer.appendChild(dot);
        }
      };

      const resultsHistory = [];
      updateDots(0, resultsHistory);

      // Load question function
      const loadQuestion = () => {
        hasSubmitted = false;
        selectedOptionIndex = null;
        remainingSeconds = 30;

        const qCounter = document.getElementById('cq-q-counter');
        if (qCounter) qCounter.textContent = `Question ${currentQIndex + 1}/${TOTAL_QUESTIONS}`;
        updateDots(currentQIndex, resultsHistory);

        // Hide explanation, banner, next btn; show submit btn disabled
        const expBox = document.getElementById('cq-explanation-box');
        if (expBox) expBox.classList.add('d-none');
        const feedbackBanner = document.getElementById('cq-feedback-banner');
        if (feedbackBanner) feedbackBanner.classList.add('d-none');
        const hintBox = document.getElementById('cq-hint-box');
        if (hintBox) hintBox.classList.add('d-none');

        const submitBtn = document.getElementById('cq-submit-btn');
        if (submitBtn) {
          submitBtn.classList.remove('d-none');
          submitBtn.disabled = true;
        }
        const nextBtn = document.getElementById('cq-next-btn');
        if (nextBtn) nextBtn.classList.add('d-none');

        // Fetch question from quiz engine
        let q = null;
        if (window.CortexQuiz && window.CortexQuiz.getCurrentQuestion) {
          q = window.CortexQuiz.getCurrentQuestion();
        }

        // Fallback default question if engine didn't provide one
        if (!q) {
          q = {
            id: 'fallback_' + currentQIndex,
            text: `Question ${currentQIndex + 1}: Solve the challenge presented in this ${subTitle} test scenario.`,
            options: ['Option A - Standard Formula', 'Option B - Alternative Hypothesis', 'Option C - Verified Deduction', 'Option D - Invariant Constant'],
            correct: 2,
            explanation: 'The verified deduction adheres to foundational axioms and theorem constraints.',
            hint: 'Focus on core principles verified under standard parameters.'
          };
        }

        const qText = document.getElementById('cq-question-text');
        if (qText) qText.textContent = q.text;

        // Populate options
        const optContainer = document.getElementById('cq-options-container');
        if (optContainer) {
          optContainer.innerHTML = '';
          const letters = ['A', 'B', 'C', 'D'];
          (q.options || []).forEach((optStr, idx) => {
            const optBtn = document.createElement('button');
            optBtn.type = 'button';
            optBtn.className = 'cq-option-btn btn w-100 p-3 text-start d-flex align-items-center justify-content-between rounded-3 transition-fast';
            optBtn.style.cssText = 'background: rgba(13, 26, 5, 0.75); border: 1px solid rgba(122, 154, 92, 0.25); color: #e8f0d8;';
            optBtn.innerHTML = `
              <div class="d-flex align-items-center gap-3">
                <span class="d-flex align-items-center justify-content-center rounded-circle fw-bold" style="width: 32px; height: 32px; background: rgba(58,83,17,0.4); border: 1px solid #7a9a5c; color: #fff;">
                  ${letters[idx]}
                </span>
                <span class="cq-option-text fw-medium">${optStr}</span>
              </div>
              <i class="cq-option-icon bi bi-circle text-muted"></i>
            `;

            optBtn.addEventListener('click', () => {
              if (hasSubmitted) return;
              selectedOptionIndex = idx;
              // Reset other option styles
              const allOpts = optContainer.querySelectorAll('.cq-option-btn');
              allOpts.forEach((btn, bIdx) => {
                if (bIdx === idx) {
                  btn.style.background = 'rgba(58, 83, 17, 0.6)';
                  btn.style.borderColor = '#7a9a5c';
                  btn.style.boxShadow = '0 0 15px rgba(122,154,92,0.4)';
                  const icon = btn.querySelector('.cq-option-icon');
                  if (icon) icon.className = 'cq-option-icon bi bi-record-circle text-warning';
                } else {
                  btn.style.background = 'rgba(13, 26, 5, 0.75)';
                  btn.style.borderColor = 'rgba(122, 154, 92, 0.25)';
                  btn.style.boxShadow = 'none';
                  const icon = btn.querySelector('.cq-option-icon');
                  if (icon) icon.className = 'cq-option-icon bi bi-circle text-muted';
                }
              });

              if (submitBtn) submitBtn.disabled = false;
            });

            optContainer.appendChild(optBtn);
          });
        }

        // Start 30s timer
        startCountdown();
      };

      const startCountdown = () => {
        if (countdownTimer) clearInterval(countdownTimer);
        const timerText = document.getElementById('cq-timer-text');
        const timerContainer = document.getElementById('cq-timer-container');

        countdownTimer = setInterval(() => {
          remainingSeconds--;
          if (timerText) timerText.textContent = remainingSeconds + 's';

          if (remainingSeconds <= 5) {
            if (timerContainer) {
              timerContainer.style.borderColor = '#ef4444';
              timerContainer.classList.add('animate-pulse');
            }
          }

          if (remainingSeconds <= 0) {
            clearInterval(countdownTimer);
            countdownTimer = null;
            // Auto submit wrong
            handleAnswerSubmit(true);
          }
        }, 1000);
      };

      const handleAnswerSubmit = (isTimeOut = false) => {
        if (hasSubmitted) return;
        hasSubmitted = true;
        if (countdownTimer) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }

        let res = { correct: false, explanation: '', xpEarned: 0, coinsEarned: 0 };
        if (window.CortexQuiz && window.CortexQuiz.submitAnswer) {
          res = window.CortexQuiz.submitAnswer(selectedOptionIndex);
        } else {
          // fallback check
          res = {
            correct: selectedOptionIndex === 2,
            explanation: 'Verified solution based on standard formula.',
            xpEarned: selectedOptionIndex === 2 ? 20 : 0,
            coinsEarned: selectedOptionIndex === 2 ? 5 : 0
          };
        }

        const isCorrect = !!res.correct;
        resultsHistory.push(isCorrect);
        updateDots(currentQIndex, resultsHistory);

        // Feedback styling on option buttons
        const optContainer = document.getElementById('cq-options-container');
        if (optContainer) {
          const allOpts = optContainer.querySelectorAll('.cq-option-btn');
          allOpts.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === selectedOptionIndex) {
              if (isCorrect) {
                btn.style.background = 'rgba(34, 197, 94, 0.25)';
                btn.style.borderColor = '#22c55e';
                btn.style.boxShadow = '0 0 20px rgba(34,197,94,0.5)';
                const icon = btn.querySelector('.cq-option-icon');
                if (icon) icon.className = 'cq-option-icon bi bi-check-circle-fill text-success fs-5';
              } else {
                btn.style.background = 'rgba(239, 68, 68, 0.25)';
                btn.style.borderColor = '#ef4444';
                btn.style.boxShadow = '0 0 20px rgba(239,68,68,0.5)';
                const icon = btn.querySelector('.cq-option-icon');
                if (icon) icon.className = 'cq-option-icon bi bi-x-circle-fill text-danger fs-5';
              }
            }
          });
        }

        // Feedback Banner
        const banner = document.getElementById('cq-feedback-banner');
        if (banner) {
          banner.classList.remove('d-none');
          if (isCorrect) {
            banner.className = 'alert alert-success py-2 px-3 fw-bold small animate-bounce-in mb-3';
            banner.style.cssText = 'background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; border-radius: 12px;';
            banner.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> CORRECT! Earned +${res.xpEarned || 20} XP and +${res.coinsEarned || 5} Coins!`;
          } else {
            banner.className = 'alert alert-danger py-2 px-3 fw-bold small animate-shake mb-3';
            banner.style.cssText = 'background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #f87171; border-radius: 12px;';
            banner.innerHTML = `<i class="bi bi-x-circle-fill me-1"></i> ${isTimeOut ? 'Time Expired!' : 'INCORRECT!'} Keep fighting!`;
          }
        }

        // Voice Clip
        if (window.CortexAudio && window.CortexAudio.playVoice) {
          try {
            window.CortexAudio.playVoice(isCorrect ? 'great' : 'oops');
          } catch(e) {}
        }

        // Puzzle integration
        if (window.CortexPuzzle) {
          if (isCorrect && window.CortexPuzzle.triggerCorrect) {
            window.CortexPuzzle.triggerCorrect();
          } else if (!isCorrect && window.CortexPuzzle.triggerWrong) {
            window.CortexPuzzle.triggerWrong();
          }
          const pScoreVal = document.getElementById('cq-puzzle-score-val');
          if (pScoreVal && window.CortexPuzzle.getScore) {
            pScoreVal.textContent = window.CortexPuzzle.getScore();
          }
        }

        // Reveal Explanation
        const expBox = document.getElementById('cq-explanation-box');
        const expText = document.getElementById('cq-explanation-text');
        if (expBox && expText) {
          expText.textContent = res.explanation || 'Detailed answer derivation provided in syllabus review.';
          expBox.classList.remove('d-none');
        }

        // Update Top Balances
        const coinEl = document.getElementById('cq-quiz-coins');
        if (coinEl && window.CortexPlayer && window.CortexPlayer.getCoinsBalance) {
          coinEl.textContent = window.CortexPlayer.getCoinsBalance();
        }

        // Switch Submit to Next Button
        const submitBtn = document.getElementById('cq-submit-btn');
        if (submitBtn) submitBtn.classList.add('d-none');
        const nextBtn = document.getElementById('cq-next-btn');
        if (nextBtn) {
          nextBtn.classList.remove('d-none');
          if (currentQIndex === TOTAL_QUESTIONS - 1) {
            nextBtn.innerHTML = `Complete Level <i class="bi bi-trophy-fill ms-1"></i>`;
          }
        }
      };

      // Wire Submit Button
      const submitBtn = document.getElementById('cq-submit-btn');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => handleAnswerSubmit(false));
      }

      // Wire Next Button
      const nextBtn = document.getElementById('cq-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          let hasNext = false;
          if (window.CortexQuiz && window.CortexQuiz.nextQuestion) {
            // nextQuestion() returns {hasNext: bool, question: obj}
            const nqResult = window.CortexQuiz.nextQuestion();
            hasNext = nqResult && nqResult.hasNext === true;
          } else {
            hasNext = currentQIndex < TOTAL_QUESTIONS - 1;
          }

          if (hasNext && currentQIndex < TOTAL_QUESTIONS - 1) {
            currentQIndex++;
            loadQuestion();
          } else {
            // Level is complete! Navigate to Results
            if (countdownTimer) clearInterval(countdownTimer);
            if (window.CortexRouter) {
              window.CortexRouter.navigate('results', {
                module: moduleId,
                submodule: submoduleId,
                level: levelNumber
              });
            }
          }
        });
      }

      // Wire Hint Button
      const hintBtn = document.getElementById('cq-hint-btn');
      if (hintBtn) {
        hintBtn.addEventListener('click', () => {
          if (hasSubmitted) return;
          if (window.CortexQuiz && window.CortexQuiz.useHint) {
            const hRes = window.CortexQuiz.useHint();
            if (hRes && hRes.success) {
              const hintBox = document.getElementById('cq-hint-box');
              const hintText = document.getElementById('cq-hint-text');
              if (hintBox && hintText) {
                hintText.textContent = hRes.hint || 'Carefully evaluate standard logic rules.';
                hintBox.classList.remove('d-none');
              }
              const coinEl = document.getElementById('cq-quiz-coins');
              if (coinEl && window.CortexPlayer && window.CortexPlayer.getCoinsBalance) {
                coinEl.textContent = window.CortexPlayer.getCoinsBalance();
              }
            } else {
              alert('Insufficient coins for hint (10 coins required)!');
            }
          } else {
            const hintBox = document.getElementById('cq-hint-box');
            const hintText = document.getElementById('cq-hint-text');
            if (hintBox && hintText) {
              hintText.textContent = 'Carefully review each equation variable step by step.';
              hintBox.classList.remove('d-none');
            }
          }
        });
      }

      // Exit button
      const exitBtn = document.getElementById('cq-quiz-exit-btn');
      if (exitBtn) {
        exitBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to exit? Current level progress will be lost.')) {
            if (countdownTimer) clearInterval(countdownTimer);
            if (window.CortexRouter) {
              window.CortexRouter.navigate('level-map', { module: moduleId, submodule: submoduleId });
            }
          }
        });
      }

      // Load first question
      loadQuestion();
    }
  };
})();
