(function() {
  'use strict';

  function getLevelTitle(level) {
    if (level >= 50) return 'Legend';
    if (level >= 41) return 'Grandmaster';
    if (level >= 31) return 'Master';
    if (level >= 21) return 'Tactician';
    if (level >= 11) return 'Scholar';
    if (level >= 6) return 'Apprentice';
    return 'Novice';
  }

  function getLevelEmoji(level) {
    if (level >= 50) return '🌟';
    if (level >= 41) return '👑';
    if (level >= 31) return '🔮';
    if (level >= 21) return '⚔️';
    if (level >= 11) return '🛡️';
    if (level >= 6) return '⚡';
    return '🌱';
  }

  window.PageProfile = {
    render: function() {
      const main = document.getElementById('cq-main');
      if (!main) return;

      const player = (window.CortexStore && window.CortexStore.getPlayer && window.CortexStore.getPlayer()) || {};
      const username = player.username || 'Adventurer';
      const level = (window.CortexPlayer && window.CortexPlayer.getLevel && window.CortexPlayer.getLevel()) || player.level || 1;
      const xp = (window.CortexPlayer && window.CortexPlayer.getXP && window.CortexPlayer.getXP()) ?? player.xp ?? 0;
      const coins = (window.CortexPlayer && window.CortexPlayer.getCoinsBalance && window.CortexPlayer.getCoinsBalance()) ?? player.coins ?? 100;
      const diamonds = (window.CortexPlayer && window.CortexPlayer.getDiamondsBalance && window.CortexPlayer.getDiamondsBalance()) ?? player.diamonds ?? 10;
      const stars = (window.CortexPlayer && window.CortexPlayer.getStarsCount && window.CortexPlayer.getStarsCount()) ?? player.stars ?? 0;
      const isGuest = window.CortexAuth && window.CortexAuth.isGuest ? window.CortexAuth.isGuest() : (!player.email);

      const title = getLevelTitle(level);
      const emoji = getLevelEmoji(level);
      const memberSince = player.createdAt ? new Date(player.createdAt).toLocaleDateString() : 'October 2026';

      let completedLvs = 0;
      if (player.progress) {
        for (const subKey in player.progress) {
          if (player.progress[subKey]?.completedLevels) {
            completedLvs += player.progress[subKey].completedLevels.length;
          }
        }
      }

      const unlockedAchCount = (player.achievements || ['first_step']).length;
      const totalAchCount = 16;

      let volume = 0.8;
      let muted = false;
      if (window.CortexAudio) {
        if (window.CortexAudio.getVolume) volume = window.CortexAudio.getVolume();
        if (window.CortexAudio.isMuted) muted = window.CortexAudio.isMuted();
      }

      main.innerHTML = `
        <div class="cq-profile-page min-vh-100 pb-5" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
          
          <!-- TOP NAVBAR -->
          <div class="sticky-top px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.94); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
            <div class="d-flex align-items-center gap-3">
              <button id="cq-prof-back" class="btn btn-sm btn-icon rounded-circle" style="width: 38px; height: 38px; background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #9ab87e;">
                <i class="bi bi-arrow-left fs-5"></i>
              </button>
              <div>
                <h1 class="h4 fw-bold mb-0 text-white">Adventurer Dossier</h1>
                <small style="color: var(--cq-text-muted);">Player stats, configuration preferences, and system settings</small>
              </div>
            </div>

            <button id="cq-prof-logout" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" style="border-color: rgba(239,68,68,0.5);">
              <i class="bi bi-box-arrow-right me-1"></i> Log Out
            </button>
          </div>

          <div class="container-fluid px-3 px-lg-4 py-4" style="max-width: 900px;">
            
            <!-- PROFILE HERO CARD -->
            <div class="cq-card p-4 p-md-5 rounded-4 shadow-xl mb-4 position-relative overflow-hidden" style="background: linear-gradient(135deg, rgba(58,83,17,0.95) 0%, rgba(26,45,10,0.95) 100%); border: 1px solid rgba(122, 154, 92, 0.4);">
              <div class="d-flex flex-column flex-sm-row align-items-center gap-4 position-relative z-1 text-center text-sm-start">
                
                <div class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 shadow-lg"
                     style="width: 100px; height: 100px; background: rgba(13,26,5,0.8); border: 3px solid #7a9a5c; font-size: 3.5rem;">
                  ${emoji}
                </div>

                <div class="flex-grow-1">
                  <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2 mb-1">
                    <h2 class="h3 fw-bold text-white mb-0">${username}</h2>
                    ${isGuest ? `<span class="badge bg-warning text-dark fw-bold">GUEST</span>` : `<span class="badge bg-success">VERIFIED</span>`}
                    <span class="badge" style="background: rgba(212,160,23,0.25); color: #f0c040; border: 1px solid #f0c040;">Lv.${level} ${title}</span>
                  </div>
                  <p class="small text-muted mb-2" style="color: var(--cq-cream-muted) !important;">
                    <i class="bi bi-calendar-check me-1"></i> Member since ${memberSince}
                  </p>

                  <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-3 small">
                    <span class="fw-bold" style="color: var(--cq-color-coins-light);">🪙 ${coins} Coins</span>
                    <span class="fw-bold" style="color: var(--cq-color-diamonds-light);">💎 ${diamonds} Diamonds</span>
                    <span class="fw-bold" style="color: var(--cq-color-stars);">⭐ ${stars} Stars</span>
                  </div>
                </div>

              </div>
            </div>

            <!-- GUEST UPGRADE CALLOUT (if guest) -->
            ${isGuest ? `
              <div class="cq-card p-4 rounded-4 shadow-lg mb-4" style="background: rgba(212, 160, 23, 0.12); border: 1px solid rgba(212, 160, 23, 0.4);">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                  <div>
                    <h3 class="h6 fw-bold mb-1" style="color: var(--cq-gold-light);"><i class="bi bi-shield-lock-fill me-2"></i>Permanent Account Conversion</h3>
                    <p class="small mb-0 text-muted" style="color: var(--cq-cream) !important;">
                      Convert your temporary guest session to a cloud profile so you never lose your XP, coins, or achievements.
                    </p>
                  </div>
                  <button id="cq-prof-convert-btn" class="btn btn-warning rounded-pill px-4 py-2 fw-bold flex-shrink-0" style="background: linear-gradient(135deg, #f0c040, #d4a017); border: none; color: #0d1a05;">
                    Save Quest Progress
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- STATS GRID -->
            <div class="cq-card p-4 rounded-4 shadow-lg mb-4" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3);">
              <h3 class="h6 fw-bold text-white mb-3"><i class="bi bi-clipboard2-data-fill me-2 text-warning"></i>Combat & Academic Milestones</h3>
              <div class="row g-3 text-center">
                <div class="col-6 col-md-3">
                  <div class="p-3 rounded-3" style="background: rgba(13,26,5,0.8); border: 1px solid rgba(122,154,92,0.2);">
                    <div class="h4 fw-bold text-white mb-0">${xp}</div>
                    <small style="color: var(--cq-text-muted); font-size: 0.75rem;">Total XP</small>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 rounded-3" style="background: rgba(13,26,5,0.8); border: 1px solid rgba(122,154,92,0.2);">
                    <div class="h4 fw-bold text-white mb-0">${completedLvs}</div>
                    <small style="color: var(--cq-text-muted); font-size: 0.75rem;">Levels Cleared</small>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 rounded-3" style="background: rgba(13,26,5,0.8); border: 1px solid rgba(122,154,92,0.2);">
                    <div class="h4 fw-bold text-white mb-0">${stars}</div>
                    <small style="color: var(--cq-text-muted); font-size: 0.75rem;">Stars Collected</small>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 rounded-3" style="background: rgba(13,26,5,0.8); border: 1px solid rgba(122,154,92,0.2);">
                    <div class="h4 fw-bold text-white mb-0">${unlockedAchCount} / ${totalAchCount}</div>
                    <small style="color: var(--cq-text-muted); font-size: 0.75rem;">Achievements</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- SETTINGS SECTION -->
            <div class="cq-card p-4 rounded-4 shadow-lg mb-4" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3);">
              <h3 class="h6 fw-bold text-white mb-4"><i class="bi bi-gear-fill me-2 text-warning"></i>Audio & System Configuration</h3>

              <!-- Volume Slider -->
              <div class="mb-4">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <label for="cq-prof-vol" class="small fw-semibold text-white">Audio & Sound FX Volume</label>
                  <span id="cq-prof-vol-val" class="small fw-bold text-warning">${Math.round(volume * 100)}%</span>
                </div>
                <input type="range" class="form-range" id="cq-prof-vol" min="0" max="1" step="0.05" value="${volume}">
              </div>

              <!-- Mute Sound Switch -->
              <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom" style="border-color: rgba(122,154,92,0.2) !important;">
                <div>
                  <div class="fw-semibold small text-white">Mute All Audio</div>
                  <small style="color: var(--cq-text-muted);">Silences background orchestral themes and voice effects</small>
                </div>
                <div class="form-check form-switch fs-5">
                  <input class="form-check-input" type="checkbox" id="cq-prof-mute" ${muted ? 'checked' : ''}>
                </div>
              </div>

              <!-- Theme Toggle -->
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="fw-semibold small text-white">Color Theme Mode</div>
                  <small style="color: var(--cq-text-muted);">Switch between Juniper Dark Matrix and Emerald Light</small>
                </div>
                <button id="cq-prof-theme-toggle" class="btn btn-sm btn-outline-light rounded-pill px-3" style="border-color: rgba(122,154,92,0.3);">
                  <i class="bi bi-moon-stars me-1"></i> Toggle Theme
                </button>
              </div>

            </div>

            <!-- DANGER ZONE -->
            <div class="cq-card p-4 rounded-4 shadow-lg" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3);">
              <h3 class="h6 fw-bold text-danger mb-2"><i class="bi bi-exclamation-octagon-fill me-2"></i>Danger Zone</h3>
              <p class="small text-muted mb-3">Irreversible operational state manipulations.</p>
              
              <div class="d-flex flex-wrap gap-2">
                <button id="cq-prof-reset-btn" class="btn btn-sm btn-outline-danger rounded-pill px-4 fw-bold">
                  <i class="bi bi-trash3 me-1"></i> Reset Progress
                </button>
              </div>
            </div>

          </div>
        </div>
      `;

      // Back navigation
      const backBtn = document.getElementById('cq-prof-back');
      if (backBtn) backBtn.addEventListener('click', () => {
        if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
      });

      // Volume slider
      const volSlider = document.getElementById('cq-prof-vol');
      const volVal = document.getElementById('cq-prof-vol-val');
      if (volSlider) {
        volSlider.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          if (volVal) volVal.textContent = Math.round(val * 100) + '%';
          if (window.CortexAudio && window.CortexAudio.setVolume) {
            window.CortexAudio.setVolume(val);
          }
        });
      }

      // Mute toggle
      const muteSwitch = document.getElementById('cq-prof-mute');
      if (muteSwitch) {
        muteSwitch.addEventListener('change', (e) => {
          const isM = e.target.checked;
          if (window.CortexAudio && window.CortexAudio.setMuted) {
            window.CortexAudio.setMuted(isM);
          }
        });
      }

      // Theme toggle
      const themeToggle = document.getElementById('cq-prof-theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          if (window.CortexTheme && window.CortexTheme.toggle) {
            window.CortexTheme.toggle();
          } else {
            document.body.classList.toggle('light-theme');
          }
        });
      }

      // Convert guest
      const convertBtn = document.getElementById('cq-prof-convert-btn');
      if (convertBtn) {
        convertBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('register');
        });
      }

      // Logout
      const logoutBtn = document.getElementById('cq-prof-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (confirm('Log out of Cortex Quest?')) {
            if (window.CortexAuth && window.CortexAuth.logout) {
              window.CortexAuth.logout();
            }
            if (window.CortexRouter) window.CortexRouter.navigate('login');
          }
        });
      }

      // Reset progress
      const resetBtn = document.getElementById('cq-prof-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (confirm('WARNING: Are you sure you want to completely reset all levels, stars, XP, and coin balances? This action cannot be reversed!')) {
            if (window.CortexStore && window.CortexStore.updatePlayer) {
              window.CortexStore.updatePlayer({
                xp: 0,
                level: 1,
                coins: 100,
                diamonds: 10,
                stars: 0,
                progress: {},
                achievements: ['first_step'],
                purchaseHistory: []
              });
            }
            alert('Progress has been reset.');
            window.PageProfile.render();
          }
        });
      }
    }
  };
})();
