(function() {
  'use strict';

  window.PageDailyChallenge = {
    render: function() {
      const main = document.getElementById('cq-main');
      if (!main) return;

      const player = (window.CortexStore && window.CortexStore.getPlayer && window.CortexStore.getPlayer()) || {};
      const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

      // Daily challenge state
      let challenge = {
        id: 'daily_arithmetic_blitz',
        title: 'Arithmetic Precision Blitz',
        desc: 'Solve 10 arithmetic questions with at least 80% accuracy',
        targetModule: 'general-aptitude',
        targetSubmodule: 'arithmetic',
        progress: 1,
        target: 2,
        completed: false,
        rewardXP: 150,
        rewardCoins: 50,
        rewardDiamonds: 2
      };

      if (window.CortexGamification && window.CortexGamification.getDailyChallenge) {
        const dc = window.CortexGamification.getDailyChallenge();
        if (dc) {
          challenge = Object.assign({}, challenge, dc);
        }
      }

      if (player.dailyChallenge && player.dailyChallenge.completed) {
        challenge.completed = true;
      }

      const streakDays = (player.dailyChallenge && player.dailyChallenge.streak) || 4;

      // 7-day calendar history
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const todayDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

      // Countdown to midnight
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = midnight - now;
      const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
      const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      const isCompleted = !!challenge.completed;
      const progressPercent = Math.min(100, Math.floor(((challenge.progress || 0) / (challenge.target || 1)) * 100));

      main.innerHTML = `
        <div class="cq-daily-page min-vh-100 pb-5" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
          
          <!-- TOP NAVBAR -->
          <div class="sticky-top px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.94); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
            <div class="d-flex align-items-center gap-3">
              <button id="cq-daily-back" class="btn btn-sm btn-icon rounded-circle" style="width: 38px; height: 38px; background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #9ab87e;">
                <i class="bi bi-arrow-left fs-5"></i>
              </button>
              <div>
                <h1 class="h4 fw-bold mb-0 text-white">Daily Neural Quest</h1>
                <small style="color: var(--cq-text-muted);">${todayStr}</small>
              </div>
            </div>

            <!-- Streak badge -->
            <span class="badge px-3 py-2 rounded-pill fw-bold" style="background: rgba(234,88,12,0.2); border: 1px solid #f97316; color: #fb923c; font-size: 0.85rem;">
              🔥 ${streakDays} Day Streak!
            </span>
          </div>

          <div class="container-fluid px-3 px-lg-4 py-4" style="max-width: 860px;">
            
            <!-- STREAK TRACKER CARD -->
            <div class="cq-card p-4 rounded-4 shadow-lg mb-4 text-center" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3);">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <span class="fw-bold small text-uppercase" style="color: var(--cq-gold-light);">Weekly Habit Matrix</span>
                <span class="small text-muted">Complete daily to amplify XP multipliers</span>
              </div>

              <!-- 7-day streak circles -->
              <div class="d-flex align-items-center justify-content-between gap-1 gap-sm-2">
                ${days.map((day, idx) => {
                  const isPast = idx < todayDayIdx;
                  const isToday = idx === todayDayIdx;
                  const isDone = isPast || (isToday && isCompleted);

                  let bg = 'rgba(13,26,5,0.7)';
                  let border = 'rgba(122,154,92,0.2)';
                  let color = '#6c845b';
                  let icon = day;

                  if (isDone) {
                    bg = 'rgba(234, 88, 12, 0.25)';
                    border = '#f97316';
                    color = '#fb923c';
                    icon = '<i class="bi bi-fire"></i>';
                  } else if (isToday) {
                    bg = 'rgba(58,83,17,0.5)';
                    border = '#f0c040';
                    color = '#f0c040';
                  }

                  return `
                    <div class="d-flex flex-column align-items-center gap-1 flex-grow-1">
                      <div class="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                           style="width: 44px; height: 44px; background: ${bg}; border: 2px solid ${border}; color: ${color}; font-size: 0.85rem;">
                        ${icon}
                      </div>
                      <small style="color: ${isToday ? '#f0c040' : 'var(--cq-text-muted)'}; font-size: 0.72rem; font-weight: ${isToday ? '700' : '500'};">
                        ${day}
                      </small>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- TODAY'S MISSION CARD -->
            <div class="cq-card p-4 p-md-5 rounded-4 shadow-xl mb-4 position-relative overflow-hidden"
                 style="background: linear-gradient(135deg, rgba(58,83,17,0.92) 0%, rgba(26,45,10,0.95) 100%); border: 2px solid ${isCompleted ? '#22c55e' : '#f0c040'};">
              
              <div class="d-flex align-items-center justify-content-between mb-3">
                <span class="badge rounded-pill px-3 py-1 fw-bold" style="background: rgba(212,160,23,0.25); color: var(--cq-gold-light); border: 1px solid var(--cq-gold-light);">
                  <i class="bi bi-star-fill me-1"></i> ACTIVE MISSION
                </span>
                <span class="small font-monospace" style="color: var(--cq-sage-light);">
                  <i class="bi bi-hourglass-split me-1"></i> Resets in ${hoursLeft}h ${minsLeft}m
                </span>
              </div>

              <h2 class="display-6 fw-bold text-white mb-2" style="font-family: var(--cq-font-heading);">
                ${challenge.title}
              </h2>
              <p class="lead mb-4" style="color: var(--cq-sage-light); font-size: 1.05rem;">
                ${challenge.desc}
              </p>

              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="d-flex justify-content-between small fw-bold mb-1 text-white">
                  <span>Objective Progress</span>
                  <span>${challenge.progress || 0} / ${challenge.target || 2} Completed (${progressPercent}%)</span>
                </div>
                <div class="progress" style="height: 10px; background: rgba(13,26,5,0.8); border-radius: 999px;">
                  <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: ${progressPercent}%; background: linear-gradient(90deg, #f0c040, #22c55e);"></div>
                </div>
              </div>

              <!-- Rewards Preview Row -->
              <div class="p-3 rounded-3 mb-4" style="background: rgba(13,26,5,0.7); border: 1px solid rgba(122,154,92,0.3);">
                <div class="small fw-bold text-uppercase mb-2 text-muted" style="font-size: 0.72rem;">Completion Bounties:</div>
                <div class="d-flex flex-wrap align-items-center gap-3">
                  <span class="fw-bold fs-6" style="color: var(--cq-color-xp-light);"><i class="bi bi-lightning-fill"></i> +${challenge.rewardXP} XP</span>
                  <span class="fw-bold fs-6" style="color: var(--cq-gold-light);"><i class="bi bi-coin"></i> +${challenge.rewardCoins} Coins</span>
                  <span class="fw-bold fs-6" style="color: var(--cq-color-diamonds-light);"><i class="bi bi-gem"></i> +${challenge.rewardDiamonds || 2} Diamonds</span>
                </div>
              </div>

              <!-- Action Button -->
              ${isCompleted ? `
                <button class="btn btn-success w-100 py-3 rounded-pill fw-bold fs-5 shadow" disabled style="background: #22c55e; border: none; opacity: 0.95;">
                  <i class="bi bi-check2-circle me-1"></i> Quest Bounties Claimed ✓
                </button>
              ` : `
                <button id="cq-daily-start-btn" class="btn btn-warning w-100 py-3 rounded-pill fw-bold fs-5 shadow-lg" style="background: linear-gradient(135deg, #f0c040, #d4a017); border: none; color: #0d1a05;">
                  <i class="bi bi-lightning-charge-fill me-1"></i> ${challenge.progress > 0 ? 'Continue Quest ⚔️' : 'Start Challenge Now ⚔️'}
                </button>
              `}

            </div>

            <!-- SNEAK PEEK TOMORROW -->
            <div class="cq-card p-4 rounded-4 shadow-lg text-center" style="background: rgba(13, 26, 5, 0.6); border: 1px dashed rgba(122, 154, 92, 0.3);">
              <i class="bi bi-eye-fill fs-3 text-muted mb-2 d-block"></i>
              <h3 class="h6 fw-bold text-white mb-1">Tomorrow's Intel: Logical Matrix Cipher</h3>
              <p class="small text-muted mb-0">Prepare your deductive powers for analytical reasoning challenges unlocking at 00:00 UTC.</p>
            </div>

          </div>
        </div>
      `;

      // Back navigation
      const backBtn = document.getElementById('cq-daily-back');
      if (backBtn) backBtn.addEventListener('click', () => {
        if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
      });

      // Start challenge click
      const startBtn = document.getElementById('cq-daily-start-btn');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          if (window.CortexRouter) {
            window.CortexRouter.navigate('quiz', {
              module: challenge.targetModule || 'general-aptitude',
              submodule: challenge.targetSubmodule || 'arithmetic',
              level: 1,
              difficulty: 'medium'
            });
          }
        });
      }
    }
  };
})();
