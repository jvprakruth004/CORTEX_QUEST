(function() {
  'use strict';

  let testState = null;
  let testInterval = null;

  const MODULES_LIST = [
    { id: 'general-aptitude', name: 'General Aptitude', icon: 'bi-calculator' },
    { id: 'data-interpretation', name: 'Data Interpretation', icon: 'bi-bar-chart-line' },
    { id: 'logical-reasoning', name: 'Logical Reasoning', icon: 'bi-puzzle' },
    { id: 'general-knowledge', name: 'General Knowledge', icon: 'bi-globe-americas' },
    { id: 'programming', name: 'Programming', icon: 'bi-code-slash' },
    { id: 'computer-science', name: 'Computer Science', icon: 'bi-motherboard' },
    { id: 'engineering', name: 'Engineering', icon: 'bi-gear-wide-connected' },
    { id: 'medical', name: 'Medical Science', icon: 'bi-heart-pulse' }
  ];

  window.PageMockTest = {
    render: function() {
      const main = document.getElementById('cq-main');
      if (!main) return;

      // Reset state if not in test
      if (testInterval) {
        clearInterval(testInterval);
        testInterval = null;
      }
      testState = null;

      const renderConfig = () => {
        main.innerHTML = `
          <div class="cq-mock-page min-vh-100 pb-5" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
            
            <!-- TOP NAVBAR -->
            <div class="sticky-top px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.94); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
              <div class="d-flex align-items-center gap-3">
                <button id="cq-mock-back" class="btn btn-sm btn-icon rounded-circle" style="width: 38px; height: 38px; background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #9ab87e;">
                  <i class="bi bi-arrow-left fs-5"></i>
                </button>
                <div>
                  <h1 class="h4 fw-bold mb-0 text-white">Grand Mock Examination</h1>
                  <small style="color: var(--cq-text-muted);">Timed multi-domain cognitive assessment simulate real exam pressure</small>
                </div>
              </div>
            </div>

            <!-- CONFIG FORM CONTAINER -->
            <div class="container-fluid px-3 px-lg-4 py-4" style="max-width: 900px;">
              <div class="cq-card p-4 p-md-5 rounded-4 shadow-xl animate-slide-up" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.35);">
                
                <div class="text-center mb-4">
                  <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style="width: 64px; height: 64px; background: rgba(212,160,23,0.15); border: 2px solid #f0c040; color: #f0c040;">
                    <i class="bi bi-stopwatch-fill fs-2"></i>
                  </div>
                  <h2 class="h3 fw-bold text-white mb-1" style="font-family: var(--cq-font-heading);">Assessment Parameters</h2>
                  <p class="small text-muted mb-0">Configure question scope, difficulty calibration, and duration</p>
                </div>

                <!-- Module Select Grid -->
                <div class="mb-4">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <label class="fw-bold small text-uppercase" style="color: var(--cq-gold-light);">1. Select Target Modules</label>
                    <button id="cq-mock-toggle-all" type="button" class="btn btn-sm btn-link text-decoration-none p-0 small" style="color: var(--cq-sage-light);">
                      Deselect All
                    </button>
                  </div>
                  <div class="row g-2">
                    ${MODULES_LIST.map(m => `
                      <div class="col-6 col-md-3">
                        <label class="cq-module-checkbox d-flex align-items-center gap-2 p-2 rounded-3 cursor-pointer w-100" style="background: rgba(13,26,5,0.7); border: 1px solid rgba(122,154,92,0.25); cursor: pointer;">
                          <input type="checkbox" name="cq-mock-mod" value="${m.id}" checked class="form-check-input mt-0">
                          <span class="small text-white text-truncate"><i class="bi ${m.icon} me-1 text-warning"></i> ${m.name}</span>
                        </label>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Difficulty & Question Count -->
                <div class="row g-3 mb-4">
                  <div class="col-12 col-md-6">
                    <label class="fw-bold small text-uppercase mb-2 d-block" style="color: var(--cq-gold-light);">2. Difficulty Profile</label>
                    <select id="cq-mock-diff" class="form-select" style="background: rgba(13,26,5,0.8); border: 1px solid rgba(122,154,92,0.3); color: #e8f0d8;">
                      <option value="mixed" selected>Adaptive Mixed (Easy + Medium + Hard)</option>
                      <option value="easy">Beginner / Easy</option>
                      <option value="medium">Standard / Medium</option>
                      <option value="hard">Advanced / Hard</option>
                    </select>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="fw-bold small text-uppercase mb-2 d-block" style="color: var(--cq-gold-light);">3. Exam Volume & Duration</label>
                    <select id="cq-mock-count" class="form-select" style="background: rgba(13,26,5,0.8); border: 1px solid rgba(122,154,92,0.3); color: #e8f0d8;">
                      <option value="30">30 Questions (30 Minutes)</option>
                      <option value="15">15 Questions (15 Minutes - Quick Sprint)</option>
                      <option value="45">45 Questions (45 Minutes - Full Mock)</option>
                    </select>
                  </div>
                </div>

                <!-- Start Action -->
                <button id="cq-mock-start-btn" class="btn btn-warning w-100 py-3 rounded-pill fw-bold fs-5 shadow-lg" style="background: linear-gradient(135deg, #f0c040, #d4a017); border: none; color: #0d1a05;">
                  <i class="bi bi-play-fill-circle me-1"></i> Start Examination Now
                </button>

              </div>
            </div>

          </div>
        `;

        // Back button
        const backBtn = document.getElementById('cq-mock-back');
        if (backBtn) backBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
        });

        // Toggle all modules
        const toggleAllBtn = document.getElementById('cq-mock-toggle-all');
        if (toggleAllBtn) {
          toggleAllBtn.addEventListener('click', () => {
            const boxes = document.querySelectorAll('input[name="cq-mock-mod"]');
            const allChecked = Array.from(boxes).every(b => b.checked);
            boxes.forEach(b => b.checked = !allChecked);
            toggleAllBtn.textContent = allChecked ? 'Select All' : 'Deselect All';
          });
        }

        // Start button
        const startBtn = document.getElementById('cq-mock-start-btn');
        if (startBtn) {
          startBtn.addEventListener('click', () => {
            const checkedMods = Array.from(document.querySelectorAll('input[name="cq-mock-mod"]:checked')).map(b => b.value);
            if (checkedMods.length === 0) {
              alert('Please select at least one module for the mock examination!');
              return;
            }
            const qCount = parseInt(document.getElementById('cq-mock-count').value, 10);
            const diff = document.getElementById('cq-mock-diff').value;
            startTest(checkedMods, qCount, diff);
          });
        }
      };

      const startTest = (modules, qCount, diff) => {
        // Generate mock test questions dynamically
        const questions = [];
        for (let i = 0; i < qCount; i++) {
          const mod = modules[i % modules.length];
          const mInfo = MODULES_LIST.find(m => m.id === mod) || { name: 'Cognitive' };
          questions.push({
            id: `mock_${i + 1}`,
            module: mod,
            moduleName: mInfo.name,
            text: `[${mInfo.name}] Problem ${i + 1}: Analyze the fundamental constraints and select the mathematically sound deduction for this case scenario.`,
            options: [
              `Option A: Primary condition holds invariant with constant slope`,
              `Option B: Secondary parameter reduces equilibrium by 25%`,
              `Option C: Optimal solution satisfies convergence criteria`,
              `Option D: Boundary conditions violate initial theorem hypothesis`
            ],
            correct: (i % 4),
            explanation: `Standard analytical evaluation confirms Option ${['A','B','C','D'][i % 4]} satisfies boundary bounds.`
          });
        }

        testState = {
          questions: questions,
          currentIndex: 0,
          answers: {},     // { [index]: selectedOptionIndex }
          flagged: {},     // { [index]: bool }
          totalSeconds: qCount * 60,
          remainingSeconds: qCount * 60,
          startTime: Date.now()
        };

        // Start timer
        testInterval = setInterval(() => {
          if (!testState) return;
          testState.remainingSeconds--;
          const tEl = document.getElementById('cq-mock-timer');
          if (tEl) {
            const m = Math.floor(testState.remainingSeconds / 60);
            const s = testState.remainingSeconds % 60;
            tEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          }
          if (testState.remainingSeconds <= 0) {
            clearInterval(testInterval);
            testInterval = null;
            finishTest();
          }
        }, 1000);

        renderTestUI();
      };

      const renderTestUI = () => {
        if (!testState) return;
        const q = testState.questions[testState.currentIndex];
        const currentAns = testState.answers[testState.currentIndex];
        const isFlagged = !!testState.flagged[testState.currentIndex];

        const m = Math.floor(testState.remainingSeconds / 60);
        const s = testState.remainingSeconds % 60;

        main.innerHTML = `
          <div class="cq-mock-test-screen min-vh-100 d-flex flex-column" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
            
            <!-- HEADER BAR -->
            <header class="px-3 px-lg-4 py-2 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.95); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
              <div class="d-flex align-items-center gap-2">
                <span class="badge rounded-pill fw-bold" style="background: #3A5311; border: 1px solid #7a9a5c;">Mock Examination</span>
                <span class="small text-muted d-none d-sm-inline">Q${testState.currentIndex + 1} of ${testState.questions.length}</span>
              </div>

              <!-- Center Timer -->
              <div class="d-flex align-items-center gap-2 px-3 py-1 rounded-pill" style="background: rgba(26, 45, 10, 0.9); border: 1px solid #f0c040;">
                <i class="bi bi-clock-fill text-warning"></i>
                <span id="cq-mock-timer" class="font-monospace fw-bold fs-6 text-white">${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}</span>
              </div>

              <!-- Submit Early Button -->
              <button id="cq-mock-submit-early" class="btn btn-sm btn-danger fw-bold rounded-pill px-3 shadow-sm" style="background: #ef4444; border: none;">
                <i class="bi bi-send-check me-1"></i> Submit All
              </button>
            </header>

            <!-- SPLIT SCREEN: LEFT QUESTION / RIGHT QUESTION PALETTE -->
            <div class="container-fluid flex-grow-1 px-3 px-lg-4 py-3" style="max-width: 1400px;">
              <div class="row g-3 h-100">
                
                <!-- LEFT QUESTION VIEW -->
                <div class="col-12 col-lg-8 col-xl-9 d-flex flex-column">
                  <div class="cq-card flex-grow-1 p-4 rounded-4 position-relative d-flex flex-column justify-content-between shadow-lg" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3);">
                    
                    <div>
                      <!-- Question Sub-header -->
                      <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style="border-color: rgba(122, 154, 92, 0.2) !important;">
                        <span class="badge rounded-pill px-3 py-1" style="background: rgba(212,160,23,0.15); color: var(--cq-gold-light); border: 1px solid rgba(212,160,23,0.3);">
                          ${q.moduleName}
                        </span>
                        
                        <!-- Flag for review button -->
                        <button id="cq-mock-flag-btn" class="btn btn-sm rounded-pill px-3 fw-semibold ${isFlagged ? 'btn-warning text-dark' : 'btn-outline-secondary text-light'}" style="border-color: rgba(122,154,92,0.3);">
                          <i class="bi bi-flag-fill me-1"></i> ${isFlagged ? 'Flagged for Review' : 'Flag Question'}
                        </button>
                      </div>

                      <h3 class="h5 fw-bold text-white mb-4" style="line-height: 1.5; font-family: var(--cq-font-heading);">${q.text}</h3>

                      <!-- 4 Options -->
                      <div class="d-flex flex-column gap-3 mb-4">
                        ${q.options.map((optStr, optIdx) => {
                          const isSelected = currentAns === optIdx;
                          return `
                            <button type="button" class="cq-mock-opt-btn btn w-100 p-3 text-start d-flex align-items-center justify-content-between rounded-3 transition-fast"
                                    data-opt="${optIdx}"
                                    style="background: ${isSelected ? 'rgba(58, 83, 17, 0.7)' : 'rgba(13, 26, 5, 0.7)'}; 
                                           border: 1px solid ${isSelected ? '#7a9a5c' : 'rgba(122, 154, 92, 0.25)'}; 
                                           color: #e8f0d8;">
                              <div class="d-flex align-items-center gap-3">
                                <span class="d-flex align-items-center justify-content-center rounded-circle fw-bold" style="width: 32px; height: 32px; background: rgba(58,83,17,0.4); border: 1px solid #7a9a5c; color: #fff;">
                                  ${['A','B','C','D'][optIdx]}
                                </span>
                                <span>${optStr}</span>
                              </div>
                              <i class="bi bi-${isSelected ? 'check-circle-fill text-warning fs-5' : 'circle text-muted'}"></i>
                            </button>
                          `;
                        }).join('')}
                      </div>
                    </div>

                    <!-- Action Bar -->
                    <div class="d-flex align-items-center justify-content-between pt-3 border-top" style="border-color: rgba(122, 154, 92, 0.2) !important;">
                      <button id="cq-mock-prev" class="btn btn-outline-light rounded-pill px-4 fw-semibold" ${testState.currentIndex === 0 ? 'disabled' : ''} style="border-color: rgba(122,154,92,0.3);">
                        <i class="bi bi-arrow-left me-1"></i> Previous
                      </button>

                      <div class="d-flex gap-2">
                        <button id="cq-mock-next" class="btn btn-warning rounded-pill px-4 fw-bold" style="background: linear-gradient(135deg, #f0c040, #d4a017); border: none; color: #0d1a05;">
                          ${testState.currentIndex === testState.questions.length - 1 ? 'Review & Submit' : 'Next <i class="bi bi-arrow-right ms-1"></i>'}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- RIGHT QUESTION GRID PALETTE -->
                <div class="col-12 col-lg-4 col-xl-3 d-flex flex-column">
                  <div class="cq-card flex-grow-1 p-3 rounded-4 shadow-lg" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3);">
                    <h4 class="h6 fw-bold text-white mb-2 pb-2 border-bottom" style="border-color: rgba(122,154,92,0.2) !important;">
                      <i class="bi bi-grid-3x3-gap-fill me-2 text-warning"></i>Question Palette
                    </h4>

                    <!-- Palette Legend -->
                    <div class="d-flex flex-wrap gap-2 mb-3 small" style="font-size: 0.72rem;">
                      <span class="d-flex align-items-center gap-1"><span class="badge bg-success rounded-circle p-1"></span> Answered</span>
                      <span class="d-flex align-items-center gap-1"><span class="badge bg-warning rounded-circle p-1"></span> Flagged</span>
                      <span class="d-flex align-items-center gap-1"><span class="badge bg-secondary rounded-circle p-1"></span> Unvisited</span>
                    </div>

                    <!-- Number Grid -->
                    <div class="d-flex flex-wrap gap-2" style="max-height: 400px; overflow-y: auto;">
                      ${testState.questions.map((_, idx) => {
                        const isAns = testState.answers[idx] !== undefined;
                        const isFlg = !!testState.flagged[idx];
                        const isCurr = testState.currentIndex === idx;

                        let bg = 'rgba(13,26,5,0.7)';
                        let color = '#94a3b8';
                        let border = '1px solid rgba(122,154,92,0.2)';

                        if (isFlg) {
                          bg = 'rgba(212,160,23,0.3)';
                          border = '1px solid #f0c040';
                          color = '#f0c040';
                        } else if (isAns) {
                          bg = 'rgba(34,197,94,0.3)';
                          border = '1px solid #22c55e';
                          color = '#4ade80';
                        }

                        if (isCurr) {
                          border = '2px solid #fff';
                          color = '#fff';
                        }

                        return `
                          <button class="cq-palette-num btn btn-sm rounded-3 fw-bold p-0 d-inline-flex align-items-center justify-content-center"
                                  data-idx="${idx}"
                                  style="width: 36px; height: 36px; background: ${bg}; border: ${border}; color: ${color}; font-size: 0.8rem;">
                            ${idx + 1}
                          </button>
                        `;
                      }).join('')}
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        `;

        // Wire option buttons
        const optBtns = document.querySelectorAll('.cq-mock-opt-btn');
        optBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const selIdx = parseInt(btn.getAttribute('data-opt'), 10);
            testState.answers[testState.currentIndex] = selIdx;
            renderTestUI();
          });
        });

        // Flag toggle
        const flagBtn = document.getElementById('cq-mock-flag-btn');
        if (flagBtn) {
          flagBtn.addEventListener('click', () => {
            testState.flagged[testState.currentIndex] = !testState.flagged[testState.currentIndex];
            renderTestUI();
          });
        }

        // Previous
        const prevBtn = document.getElementById('cq-mock-prev');
        if (prevBtn) {
          prevBtn.addEventListener('click', () => {
            if (testState.currentIndex > 0) {
              testState.currentIndex--;
              renderTestUI();
            }
          });
        }

        // Next
        const nextBtn = document.getElementById('cq-mock-next');
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            if (testState.currentIndex < testState.questions.length - 1) {
              testState.currentIndex++;
              renderTestUI();
            } else {
              confirmSubmit();
            }
          });
        }

        // Palette jump
        const paletteBtns = document.querySelectorAll('.cq-palette-num');
        paletteBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            testState.currentIndex = parseInt(btn.getAttribute('data-idx'), 10);
            renderTestUI();
          });
        });

        // Submit early button
        const submitEarlyBtn = document.getElementById('cq-mock-submit-early');
        if (submitEarlyBtn) {
          submitEarlyBtn.addEventListener('click', confirmSubmit);
        }
      };

      const confirmSubmit = () => {
        const total = testState.questions.length;
        const answered = Object.keys(testState.answers).length;
        const flagged = Object.values(testState.flagged).filter(Boolean).length;
        const unanswered = total - answered;

        const msg = `Submit Examination?\n\n• Answered: ${answered} / ${total}\n• Unanswered: ${unanswered}\n• Flagged for Review: ${flagged}\n\nAre you sure you want to finish now?`;
        if (confirm(msg)) {
          if (testInterval) clearInterval(testInterval);
          finishTest();
        }
      };

      const finishTest = () => {
        let correctCount = 0;
        const moduleBreakdown = {};

        testState.questions.forEach((q, idx) => {
          if (!moduleBreakdown[q.moduleName]) {
            moduleBreakdown[q.moduleName] = { correct: 0, total: 0 };
          }
          moduleBreakdown[q.moduleName].total++;

          const userAns = testState.answers[idx];
          if (userAns === q.correct) {
            correctCount++;
            moduleBreakdown[q.moduleName].correct++;
          }
        });

        const totalQ = testState.questions.length;
        const accuracy = Math.round((correctCount / totalQ) * 100);
        const xpEarned = correctCount * 25;
        const coinsEarned = correctCount * 8;

        if (window.CortexPlayer) {
          if (window.CortexPlayer.addXP) window.CortexPlayer.addXP(xpEarned);
          if (window.CortexPlayer.addCoins) window.CortexPlayer.addCoins(coinsEarned);
        }

        // Render Results Screen
        main.innerHTML = `
          <div class="cq-mock-results-screen min-vh-100 pb-5" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
            
            <!-- TOP NAVBAR -->
            <div class="sticky-top px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.94); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
              <h1 class="h4 fw-bold mb-0 text-white">Examination Performance Report</h1>
              <button id="cq-mock-done-btn" class="btn btn-sm btn-success rounded-pill px-4 fw-bold" style="background: #3A5311; border: 1px solid #7a9a5c;">
                Done
              </button>
            </div>

            <div class="container-fluid px-3 px-lg-4 py-4" style="max-width: 1000px;">
              
              <!-- OVERALL SCORE CARD -->
              <div class="cq-card p-4 p-md-5 rounded-4 shadow-xl mb-4 text-center" style="background: rgba(26, 45, 10, 0.9); border: 2px solid #7a9a5c;">
                <span class="badge rounded-pill px-3 py-1 mb-2 fw-bold" style="background: rgba(212,160,23,0.2); color: var(--cq-gold-light); border: 1px solid rgba(212,160,23,0.4);">
                  EXAM COMPLETED
                </span>
                <h2 class="display-5 fw-bold text-white mb-2" style="font-family: var(--cq-font-heading);">
                  Score: ${correctCount} / ${totalQ}
                </h2>
                <div class="h5 fw-bold mb-3" style="color: ${accuracy >= 75 ? '#4ade80' : (accuracy >= 50 ? '#f0c040' : '#f87171')};">
                  ${accuracy}% Accuracy Rating (${accuracy >= 80 ? 'Outstanding Performance' : (accuracy >= 60 ? 'Competent' : 'Needs Practice')})
                </div>

                <div class="d-flex justify-content-center gap-3 mb-4">
                  <span class="badge px-3 py-2 rounded-pill" style="background: rgba(168,85,247,0.2); color: var(--cq-color-xp-light); border: 1px solid rgba(168,85,247,0.4);">
                    +${xpEarned} XP Awarded
                  </span>
                  <span class="badge px-3 py-2 rounded-pill" style="background: rgba(212,160,23,0.2); color: var(--cq-gold-light); border: 1px solid rgba(212,160,23,0.4);">
                    +${coinsEarned} Coins Awarded
                  </span>
                </div>
              </div>

              <!-- MODULE BREAKDOWN -->
              <div class="cq-card p-4 rounded-4 shadow-lg mb-4" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3);">
                <h3 class="h6 fw-bold text-white mb-3"><i class="bi bi-bar-chart-steps me-2 text-warning"></i>Domain Competency Breakdown</h3>
                <div class="d-flex flex-column gap-3">
                  ${Object.entries(moduleBreakdown).map(([modName, bData]) => {
                    const modAcc = Math.round((bData.correct / bData.total) * 100);
                    return `
                      <div>
                        <div class="d-flex justify-content-between small fw-bold mb-1">
                          <span class="text-white">${modName}</span>
                          <span style="color: ${modAcc >= 70 ? '#4ade80' : '#f0c040'};">${bData.correct}/${bData.total} (${modAcc}%)</span>
                        </div>
                        <div class="progress" style="height: 6px; background: rgba(13,26,5,0.7); border-radius: 999px;">
                          <div class="progress-bar" style="width: ${modAcc}%; background: ${modAcc >= 70 ? '#22c55e' : '#f0c040'};"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- QUESTION REVIEW ACCORDION -->
              <div class="cq-card p-4 rounded-4 shadow-lg mb-4" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3);">
                <h3 class="h6 fw-bold text-white mb-3"><i class="bi bi-search me-2 text-warning"></i>Question-by-Question Audit</h3>
                <div class="d-flex flex-column gap-3">
                  ${testState.questions.map((q, idx) => {
                    const userAns = testState.answers[idx];
                    const isCorrect = userAns === q.correct;
                    const letters = ['A', 'B', 'C', 'D'];
                    return `
                      <div class="p-3 rounded-3" style="background: rgba(13,26,5,0.7); border: 1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                          <span class="badge" style="background: ${isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${isCorrect ? '#4ade80' : '#f87171'}; border: 1px solid ${isCorrect ? '#22c55e' : '#ef4444'};">
                            Q${idx + 1}: ${isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                          </span>
                          <span class="small text-muted">${q.moduleName}</span>
                        </div>
                        <p class="small text-white mb-2 fw-medium">${q.text}</p>
                        <div class="small mb-1" style="color: ${isCorrect ? '#4ade80' : '#f87171'};">
                          Your Answer: ${userAns !== undefined ? `${letters[userAns]} - ${q.options[userAns]}` : 'Unanswered'}
                        </div>
                        ${!isCorrect ? `
                          <div class="small text-success mb-2">
                            Correct Answer: ${letters[q.correct]} - ${q.options[q.correct]}
                          </div>
                        ` : ''}
                        <div class="small text-muted border-top pt-2 mt-2" style="border-color: rgba(122,154,92,0.2) !important;">
                          <strong>Rationale:</strong> ${q.explanation}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Retake Button -->
              <div class="text-center">
                <button id="cq-mock-retake-btn" class="btn btn-warning rounded-pill px-5 py-2 fw-bold shadow" style="background: linear-gradient(135deg, #f0c040, #d4a017); border: none; color: #0d1a05;">
                  Take Another Examination
                </button>
              </div>

            </div>

          </div>
        `;

        const doneBtn = document.getElementById('cq-mock-done-btn');
        if (doneBtn) doneBtn.onclick = () => { if (window.CortexRouter) window.CortexRouter.navigate('dashboard'); };

        const retakeBtn = document.getElementById('cq-mock-retake-btn');
        if (retakeBtn) retakeBtn.onclick = renderConfig;
      };

      renderConfig();
    }
  };
})();
