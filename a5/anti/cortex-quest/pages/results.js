(function() {
  'use strict';

  window.PageResults = {
    render: function(moduleId = 'general-aptitude', submoduleId = 'arithmetic', levelNumber = 1) {
      const main = document.getElementById('cq-main');
      if (!main) return;

      // Audio: Victory BGM & Level-complete voice
      if (window.CortexAudio) {
        try {
          if (window.CortexAudio.playBGM) window.CortexAudio.playBGM('victory');
          if (window.CortexAudio.playVoice) window.CortexAudio.playVoice('level-complete');
        } catch(e) {
          console.warn('Audio play error:', e);
        }
      }

      // Fetch results from quiz engine
      let results = null;
      if (window.CortexQuiz && window.CortexQuiz.getLevelResults) {
        results = window.CortexQuiz.getLevelResults();
      }

      const correct = results ? (results.correct ?? 8) : 8;
      const total = results ? (results.total ?? 10) : 10;
      const accuracy = Math.round((correct / total) * 100);
      const xp = results ? (results.xpEarned ?? results.xp ?? (correct * 20)) : 160;
      const coins = results ? (results.coinsEarned ?? results.coins ?? (correct * 5)) : 40;

      let stars = results ? results.stars : 0;
      if (!results || stars === undefined) {
        if (accuracy >= 80) stars = 3;
        else if (accuracy >= 60) stars = 2;
        else if (accuracy >= 40) stars = 1;
        else stars = 0;
      }

      // Puzzle score
      const puzzleScore = (window.CortexPuzzle && window.CortexPuzzle.getScore && window.CortexPuzzle.getScore()) || 450;

      // Format titles
      const formatTitle = (str) => (str || '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const subTitle = formatTitle(submoduleId);

      const isPassed = stars >= 1;
      const hasNextLevel = isPassed && levelNumber < 50;

      main.innerHTML = `
        <div class="cq-results-screen min-vh-100 d-flex flex-column align-items-center justify-content-center p-3 position-relative overflow-hidden" style="background: radial-gradient(circle at center top, #1a2d0a 0%, #0d1a05 75%, #050a02 100%); color: var(--cq-text-primary, #e8f0d8);">
          
          <!-- Confetti particles overlay effect -->
          <div class="position-absolute" style="inset: 0; pointer-events: none; overflow: hidden;">
            <div class="position-absolute" style="top: 10%; left: 20%; width: 12px; height: 12px; background: #f0c040; border-radius: 2px; animation: bounceIn 1.5s infinite alternate;"></div>
            <div class="position-absolute" style="top: 15%; right: 25%; width: 16px; height: 16px; background: #38bdf8; border-radius: 50%; animation: pulse 2s infinite ease-in-out;"></div>
            <div class="position-absolute" style="top: 25%; left: 30%; width: 10px; height: 18px; background: #a855f7; transform: rotate(45deg); animation: floatIdle 3s infinite;"></div>
            <div class="position-absolute" style="top: 20%; right: 15%; width: 14px; height: 14px; background: #22c55e; border-radius: 3px; animation: bounceIn 2s infinite alternate;"></div>
          </div>

          <!-- Main Results Card -->
          <div class="cq-card p-4 p-md-5 rounded-4 position-relative z-1 animate-slide-up text-center shadow-xl" style="width: 100%; max-width: 580px; background: rgba(26, 45, 10, 0.92); border: 2px solid ${isPassed ? '#7a9a5c' : '#ef4444'}; box-shadow: 0 20px 50px rgba(0,0,0,0.6); backdrop-filter: blur(16px);">
            
            <!-- Badge / Status -->
            <div class="mb-2">
              <span class="badge rounded-pill px-3 py-1 fw-bold" style="background: ${isPassed ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}; color: ${isPassed ? '#4ade80' : '#f87171'}; border: 1px solid ${isPassed ? '#22c55e' : '#ef4444'}; font-size: 0.85rem;">
                ${isPassed ? 'VICTORY ACHIEVED' : 'CHALLENGE FAILED'}
              </span>
            </div>

            <!-- Level Header -->
            <h1 class="display-6 fw-bold text-white mb-1" style="font-family: var(--cq-font-heading);">
              Level ${levelNumber} ${isPassed ? 'Complete!' : 'Incomplete'}
            </h1>
            <p class="small text-muted mb-4" style="color: var(--cq-sage-light) !important;">
              ${subTitle} Track
            </p>

            <!-- Star Rating (Animated Reveal) -->
            <div class="d-flex align-items-center justify-content-center gap-3 mb-4">
              <div class="cq-star fs-1 animate-bounce-in" style="color: ${stars >= 1 ? '#f0c040' : 'rgba(255,255,255,0.15)'}; filter: drop-shadow(0 0 12px ${stars >= 1 ? '#f0c040' : 'transparent'});">
                ⭐
              </div>
              <div class="cq-star fs-1 animate-bounce-in delay-150" style="color: ${stars >= 2 ? '#f0c040' : 'rgba(255,255,255,0.15)'}; transform: scale(1.25); filter: drop-shadow(0 0 16px ${stars >= 2 ? '#f0c040' : 'transparent'});">
                ⭐
              </div>
              <div class="cq-star fs-1 animate-bounce-in delay-300" style="color: ${stars >= 3 ? '#f0c040' : 'rgba(255,255,255,0.15)'}; filter: drop-shadow(0 0 12px ${stars >= 3 ? '#f0c040' : 'transparent'});">
                ⭐
              </div>
            </div>

            <!-- Accuracy & Score Counter -->
            <div class="p-3 rounded-3 mb-4" style="background: rgba(13, 26, 5, 0.8); border: 1px solid rgba(122, 154, 92, 0.25);">
              <div class="row g-2 text-center align-items-center">
                <div class="col-6 border-end" style="border-color: rgba(122,154,92,0.2) !important;">
                  <div class="h4 fw-bold text-white mb-0">${correct} / ${total}</div>
                  <small style="color: var(--cq-text-muted); font-size: 0.78rem;">Correct Answers</small>
                </div>
                <div class="col-6">
                  <div class="h4 fw-bold mb-0" style="color: ${accuracy >= 80 ? '#4ade80' : (accuracy >= 60 ? '#f0c040' : '#f87171')};">${accuracy}%</div>
                  <small style="color: var(--cq-text-muted); font-size: 0.78rem;">Accuracy Rating</small>
                </div>
              </div>
            </div>

            <!-- Rewards Grid -->
            <div class="mb-4">
              <div class="small fw-bold text-uppercase mb-2" style="color: var(--cq-text-muted); letter-spacing: 0.5px; font-size: 0.72rem;">Rewards Claimed</div>
              <div class="d-flex align-items-center justify-content-center gap-3">
                <div class="px-3 py-2 rounded-3 animate-slide-up" style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); color: var(--cq-color-xp-light);">
                  <div class="fw-bold fs-5">+${xp} XP</div>
                  <small style="font-size: 0.7rem;">Experience</small>
                </div>
                <div class="px-3 py-2 rounded-3 animate-slide-up delay-100" style="background: rgba(212, 160, 23, 0.15); border: 1px solid rgba(212, 160, 23, 0.4); color: var(--cq-gold-light);">
                  <div class="fw-bold fs-5">+${coins} 🪙</div>
                  <small style="font-size: 0.7rem;">Coins</small>
                </div>
                <div class="px-3 py-2 rounded-3 animate-slide-up delay-200" style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); color: var(--cq-color-diamonds-light);">
                  <div class="fw-bold fs-5">${puzzleScore} 🧩</div>
                  <small style="font-size: 0.7rem;">Puzzle Score</small>
                </div>
              </div>
            </div>

            <!-- Action Buttons Grid -->
            <div class="d-flex flex-column gap-2">
              ${hasNextLevel ? `
                <button id="cq-res-next-btn" class="btn btn-warning fw-bold py-2 rounded-pill shadow" style="background: linear-gradient(135deg, #f0c040, #d4a017); border: none; color: #0d1a05; font-size: 1rem;">
                  <i class="bi bi-arrow-right-circle-fill me-1"></i> Next Level (${levelNumber + 1})
                </button>
              ` : ''}

              <div class="d-flex gap-2">
                <button id="cq-res-retry-btn" class="btn btn-outline-light flex-grow-1 py-2 rounded-pill fw-semibold" style="border-color: rgba(122,154,92,0.4); background: rgba(13,26,5,0.6);">
                  <i class="bi bi-arrow-repeat me-1"></i> Retry
                </button>
                <button id="cq-res-map-btn" class="btn btn-outline-light flex-grow-1 py-2 rounded-pill fw-semibold" style="border-color: rgba(122,154,92,0.4); background: rgba(13,26,5,0.6);">
                  <i class="bi bi-map me-1"></i> Level Map
                </button>
              </div>

              <button id="cq-res-home-btn" class="btn btn-link text-decoration-none small text-muted mt-1" style="color: var(--cq-sage-light) !important;">
                <i class="bi bi-house-door me-1"></i> Return to Dashboard
              </button>
            </div>

          </div>
        </div>
      `;

      // Next level button
      const nextBtn = document.getElementById('cq-res-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (window.CortexRouter) {
            window.CortexRouter.navigate('quiz', {
              module: moduleId,
              submodule: submoduleId,
              level: levelNumber + 1
            });
          }
        });
      }

      // Retry button
      const retryBtn = document.getElementById('cq-res-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          if (window.CortexRouter) {
            window.CortexRouter.navigate('quiz', {
              module: moduleId,
              submodule: submoduleId,
              level: levelNumber
            });
          }
        });
      }

      // Map button
      const mapBtn = document.getElementById('cq-res-map-btn');
      if (mapBtn) {
        mapBtn.addEventListener('click', () => {
          if (window.CortexRouter) {
            window.CortexRouter.navigate('level-map', { module: moduleId, submodule: submoduleId });
          }
        });
      }

      // Home button
      const homeBtn = document.getElementById('cq-res-home-btn');
      if (homeBtn) {
        homeBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
        });
      }
    }
  };
})();
