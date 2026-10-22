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

  const MODULES_INFO = [
    { id: 'general-aptitude', name: 'General Aptitude', icon: 'bi-calculator', defaultSub: 'arithmetic', gradient: 'linear-gradient(135deg, rgba(58,83,17,0.85) 0%, rgba(30,45,10,0.95) 100%)', border: '#7a9a5c', desc: 'Arithmetic, Quantitative & Time-Work' },
    { id: 'data-interpretation', name: 'Data Interpretation', icon: 'bi-bar-chart-line', defaultSub: 'tables-charts', gradient: 'linear-gradient(135deg, rgba(14,116,144,0.85) 0%, rgba(8,47,73,0.95) 100%)', border: '#06b6d4', desc: 'Tables, Charts & Caselets' },
    { id: 'logical-reasoning', name: 'Logical Reasoning', icon: 'bi-puzzle', defaultSub: 'verbal-reasoning', gradient: 'linear-gradient(135deg, rgba(126,34,206,0.85) 0%, rgba(59,7,100,0.95) 100%)', border: '#a855f7', desc: 'Verbal, Analytical & Non-Verbal' },
    { id: 'general-knowledge', name: 'General Knowledge', icon: 'bi-globe-americas', defaultSub: 'science-tech', gradient: 'linear-gradient(135deg, rgba(194,65,12,0.85) 0%, rgba(67,20,7,0.95) 100%)', border: '#f97316', desc: 'Science, History & Current Affairs' },
    { id: 'programming', name: 'Programming', icon: 'bi-code-slash', defaultSub: 'prog-fundamentals', gradient: 'linear-gradient(135deg, rgba(2,132,199,0.85) 0%, rgba(12,74,110,0.95) 100%)', border: '#38bdf8', desc: 'Fundamentals, Logic & Data Structures' },
    { id: 'computer-science', name: 'Computer Science', icon: 'bi-motherboard', defaultSub: 'operating-systems', gradient: 'linear-gradient(135deg, rgba(79,70,229,0.85) 0%, rgba(30,27,75,0.95) 100%)', border: '#818cf8', desc: 'Operating Systems, DBMS & Networks' },
    { id: 'engineering', name: 'Engineering', icon: 'bi-gear-wide-connected', defaultSub: 'electrical', gradient: 'linear-gradient(135deg, rgba(161,98,7,0.85) 0%, rgba(66,32,6,0.95) 100%)', border: '#eab308', desc: 'Electrical, Mechanical & Engineering Math' },
    { id: 'medical', name: 'Medical Science', icon: 'bi-heart-pulse', defaultSub: 'anatomy', gradient: 'linear-gradient(135deg, rgba(190,18,60,0.85) 0%, rgba(76,5,25,0.95) 100%)', border: '#f43f5e', desc: 'Anatomy, Physiology & Medical Science' }
  ];

  window.PageDashboard = {
    render: function() {
      const main = document.getElementById('cq-main');
      if (!main) return;

      // Ensure audio plays
      if (window.CortexAudio && window.CortexAudio.playBGM) {
        try { window.CortexAudio.playBGM('home'); } catch(e) {}
      }

      // Fetch player data defensively
      const player = (window.CortexStore && window.CortexStore.getPlayer && window.CortexStore.getPlayer()) || {
        username: (window.CortexAuth && window.CortexAuth.getUsername && window.CortexAuth.getUsername()) || 'Quest Adventurer',
        level: 1,
        xp: 0,
        coins: 100,
        diamonds: 10,
        stars: 0,
        progress: {},
        achievements: []
      };

      const username = player.username || 'Adventurer';
      const level = (window.CortexPlayer && window.CortexPlayer.getLevel && window.CortexPlayer.getLevel()) || player.level || 1;
      const coins = (window.CortexPlayer && window.CortexPlayer.getCoinsBalance && window.CortexPlayer.getCoinsBalance()) ?? player.coins ?? 0;
      const diamonds = (window.CortexPlayer && window.CortexPlayer.getDiamondsBalance && window.CortexPlayer.getDiamondsBalance()) ?? player.diamonds ?? 0;
      const stars = (window.CortexPlayer && window.CortexPlayer.getStarsCount && window.CortexPlayer.getStarsCount()) ?? player.stars ?? 0;
      const xp = (window.CortexPlayer && window.CortexPlayer.getXP && window.CortexPlayer.getXP()) ?? player.xp ?? 0;
      
      const _lpRaw = (window.CortexPlayer && window.CortexPlayer.getLevelProgress && window.CortexPlayer.getLevelProgress()) || {};
      const levelProgress = {
        current: _lpRaw.xpInLevel ?? _lpRaw.current ?? (xp % 500),
        needed: _lpRaw.xpForNextLevel ?? _lpRaw.needed ?? 500,
        percent: _lpRaw.percent ?? Math.min(100, Math.floor(((xp % 500) / 500) * 100))
      };

      const title = getLevelTitle(level);
      const emoji = getLevelEmoji(level);

      // Greeting based on time
      const hour = new Date().getHours();
      let greeting = 'Welcome back';
      if (hour < 12) greeting = 'Good morning';
      else if (hour < 18) greeting = 'Good afternoon';
      else greeting = 'Good evening';

      // Check active progress to see if continue quest button should be shown
      let continueSub = null;
      let continueMod = null;
      let totalCompletedLevels = 0;

      if (player.progress) {
        for (const [subId, pData] of Object.entries(player.progress)) {
          if (pData && pData.completedLevels && pData.completedLevels.length > 0) {
            totalCompletedLevels += pData.completedLevels.length;
            if (!continueSub) {
              continueSub = subId;
              // find parent module
              for (const m of MODULES_INFO) {
                if (m.defaultSub === subId || subId.startsWith(m.id)) {
                  continueMod = m.id;
                  break;
                }
              }
              if (!continueMod) continueMod = 'general-aptitude';
            }
          }
        }
      }

      // Daily challenge status
      let dailyChallenge = {
        title: 'Neural Ignition',
        desc: 'Complete 2 quiz levels with at least 80% accuracy',
        progress: 0,
        target: 2,
        rewardXP: 150,
        rewardCoins: 50
      };

      if (window.CortexGamification && window.CortexGamification.getDailyChallenge) {
        const dc = window.CortexGamification.getDailyChallenge();
        if (dc) {
          dailyChallenge = {
            title: dc.title || dailyChallenge.title,
            desc: dc.desc || dc.description || dailyChallenge.desc,
            progress: dc.progress || 0,
            target: dc.target || 2,
            rewardXP: dc.rewardXP || 150,
            rewardCoins: dc.rewardCoins || 50,
            completed: !!dc.completed
          };
        }
      }

      // Stats calculations
      const stats = (window.CortexGamification && window.CortexGamification.getStats && window.CortexGamification.getStats()) || {
        levelsCompleted: totalCompletedLevels,
        questionsAnswered: totalCompletedLevels * 10,
        accuracy: totalCompletedLevels > 0 ? 86 : 0,
        streak: 1
      };

      main.innerHTML = `
        <div class="cq-dashboard d-flex flex-column min-vh-100" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
          
          <!-- TOP BAR -->
          <header class="cq-topbar sticky-top px-3 px-lg-4 py-2 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1030;">
            <!-- Brand & Player Profile Left -->
            <div class="d-flex align-items-center gap-3">
              <a href="#/dashboard" class="d-flex align-items-center text-decoration-none me-2">
                <div class="d-flex align-items-center justify-content-center rounded-circle me-2" style="width: 38px; height: 38px; background: linear-gradient(135deg, #4d6e18, #2a3d0c); border: 1px solid #7a9a5c;">
                  <i class="bi bi-cpu text-light" style="font-size: 1.25rem;"></i>
                </div>
                <span class="d-none d-sm-inline fw-extrabold tracking-wide" style="font-family: var(--cq-font-heading); color: #f5f0e8; font-size: 1.1rem;">
                  CORTEX<span style="color: var(--cq-gold-light, #f0c040);">QUEST</span>
                </span>
              </a>

              <!-- Avatar & Level Badge -->
              <div class="d-flex align-items-center gap-2 px-2 py-1 rounded-pill" style="background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.25);">
                <span style="font-size: 1.3rem;">${emoji}</span>
                <div class="d-none d-md-block text-start lh-1">
                  <div class="fw-bold small text-truncate" style="max-width: 120px;">${username}</div>
                  <small style="color: var(--cq-gold-light); font-size: 0.72rem;">${title}</small>
                </div>
                <span class="badge rounded-pill" style="background: #3A5311; border: 1px solid #7a9a5c; font-size: 0.75rem;">Lv.${level}</span>
              </div>
            </div>

            <!-- Currencies & Controls Right -->
            <div class="d-flex align-items-center gap-2 gap-md-3">
              <!-- Currencies -->
              <div class="d-flex align-items-center gap-2 px-3 py-1 rounded-pill" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.25);">
                <div class="d-flex align-items-center gap-1 small fw-bold" title="Quest Coins" style="color: var(--cq-color-coins, #d4a017);">
                  <span>🪙</span>
                  <span id="cq-top-coins">${coins}</span>
                </div>
                <div class="vr my-1" style="background-color: rgba(122, 154, 92, 0.4);"></div>
                <div class="d-flex align-items-center gap-1 small fw-bold" title="Diamonds" style="color: var(--cq-color-diamonds, #06b6d4);">
                  <span>💎</span>
                  <span id="cq-top-diamonds">${diamonds}</span>
                </div>
                <div class="vr my-1" style="background-color: rgba(122, 154, 92, 0.4);"></div>
                <div class="d-flex align-items-center gap-1 small fw-bold" title="Stars" style="color: var(--cq-color-stars, #fbbf24);">
                  <span>⭐</span>
                  <span id="cq-top-stars">${stars}</span>
                </div>
              </div>

              <!-- Audio & Settings Buttons -->
              <button id="cq-dash-mute-btn" class="btn btn-sm btn-icon rounded-circle" style="width: 36px; height: 36px; background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #9ab87e;" title="Audio Toggle">
                <i class="bi bi-volume-up"></i>
              </button>

              <button id="cq-dash-theme-btn" class="btn btn-sm btn-icon rounded-circle" style="width: 36px; height: 36px; background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #f0c040;" title="Theme Toggle">
                <i class="bi bi-moon-stars"></i>
              </button>

              <button id="cq-dash-profile-btn" class="btn btn-sm rounded-circle p-0" style="width: 36px; height: 36px; background: #3A5311; border: 1px solid #7a9a5c; color: white;" title="Profile">
                <i class="bi bi-person-fill"></i>
              </button>
            </div>
          </header>

          <!-- MAIN CONTAINER (Content + Desktop Sidebar Navigation) -->
          <div class="container-fluid flex-grow-1 px-3 px-lg-4 py-3" style="max-width: 1400px; padding-bottom: 90px !important;">
            <div class="row g-3 g-lg-4">
              
              <!-- LEFT / MAIN CONTENT AREA -->
              <div class="col-12 col-xl-9">
                
                <!-- HERO BANNER -->
                <div class="cq-card p-4 rounded-4 mb-4 position-relative overflow-hidden shadow-lg animate-slide-down" style="background: linear-gradient(135deg, rgba(58,83,17,0.95) 0%, rgba(26,45,10,0.98) 100%); border: 1px solid rgba(122,154,92,0.4);">
                  <!-- Ambient background pattern -->
                  <div class="position-absolute" style="right: -40px; top: -40px; width: 220px; height: 220px; background: radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>

                  <div class="row align-items-center position-relative z-1">
                    <div class="col-md-8">
                      <span class="badge mb-2 px-3 py-1 rounded-pill" style="background: rgba(212, 160, 23, 0.2); color: var(--cq-gold-light, #f0c040); border: 1px solid rgba(212, 160, 23, 0.4);">
                        <i class="bi bi-shield-fill-check me-1"></i> Rank: ${title}
                      </span>
                      <h1 class="h2 fw-bold text-white mb-1">
                        ${greeting}, <span style="color: var(--cq-gold-light);">${username}</span>!
                      </h1>
                      <p class="mb-3" style="color: var(--cq-sage-light, #9ab87e); font-size: 0.95rem;">
                        Sharpen your neural circuits today. 8 mastery domains and 1,200 interactive challenges await.
                      </p>

                      <!-- XP Progress Bar -->
                      <div class="mb-3" style="max-width: 480px;">
                        <div class="d-flex justify-content-between small mb-1 fw-semibold" style="color: var(--cq-text-secondary);">
                          <span>XP Progress (Level ${level})</span>
                          <span>${levelProgress.current} / ${levelProgress.needed} XP (${levelProgress.percent}%)</span>
                        </div>
                        <div class="progress" style="height: 10px; background: rgba(13,26,5,0.7); border-radius: 999px; border: 1px solid rgba(122,154,92,0.3);">
                          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${levelProgress.percent}%; background: linear-gradient(90deg, #a855f7, #c084fc);"></div>
                        </div>
                      </div>

                      <!-- CTA Button -->
                      <div class="d-flex flex-wrap gap-2">
                        ${continueSub ? `
                          <button id="cq-dash-continue-btn" class="btn btn-warning fw-bold px-4 py-2 rounded-pill shadow-sm" style="background: linear-gradient(135deg, #f0c040, #d4a017); color: #0d1a05; border: none;">
                            <i class="bi bi-play-fill-circle me-1"></i> Continue Your Quest
                          </button>
                        ` : `
                          <button id="cq-dash-start-btn" class="btn btn-warning fw-bold px-4 py-2 rounded-pill shadow-sm" style="background: linear-gradient(135deg, #f0c040, #d4a017); color: #0d1a05; border: none;">
                            <i class="bi bi-rocket-takeoff me-1"></i> Start Your Adventure
                          </button>
                        `}
                        <button id="cq-dash-all-modules-btn" class="btn btn-outline-light px-4 py-2 rounded-pill fw-semibold" style="border-color: rgba(122,154,92,0.4); background: rgba(26,45,10,0.6);">
                          <i class="bi bi-grid me-1"></i> View All Modules
                        </button>
                      </div>
                    </div>

                    <!-- Right Illustration / Trophy -->
                    <div class="col-md-4 d-none d-md-flex justify-content-center align-items-center">
                      <div class="d-flex align-items-center justify-content-center rounded-circle animate-float" style="width: 140px; height: 140px; background: radial-gradient(circle, rgba(212,160,23,0.2) 0%, rgba(58,83,17,0.3) 100%); border: 2px solid rgba(212,160,23,0.5); box-shadow: 0 0 30px rgba(212,160,23,0.3);">
                        <i class="bi bi-trophy-fill" style="font-size: 4rem; color: var(--cq-gold-light, #f0c040); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- DAILY CHALLENGE CARD -->
                <div class="cq-card p-3 p-md-4 rounded-4 mb-4 position-relative overflow-hidden" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(212, 160, 23, 0.4); box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
                  <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div class="d-flex align-items-center gap-3">
                      <div class="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style="width: 54px; height: 54px; background: rgba(212,160,23,0.15); border: 1px solid rgba(212,160,23,0.5); color: var(--cq-gold-light);">
                        <i class="bi bi-lightning-charge-fill fs-2"></i>
                      </div>
                      <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                          <span class="badge rounded-pill" style="background: rgba(212,160,23,0.25); color: #f0c040; border: 1px solid rgba(212,160,23,0.4);">TODAY'S MISSION</span>
                          <span class="small" style="color: var(--cq-text-muted);">Resets at Midnight</span>
                        </div>
                        <h3 class="h5 fw-bold mb-1 text-white">${dailyChallenge.title}</h3>
                        <p class="small mb-0" style="color: var(--cq-sage-light);">${dailyChallenge.desc}</p>
                      </div>
                    </div>

                    <!-- Reward preview & CTA -->
                    <div class="d-flex align-items-center gap-3 align-self-end align-self-md-center">
                      <div class="text-end small">
                        <div class="text-muted" style="font-size: 0.75rem;">REWARD</div>
                        <span class="fw-bold" style="color: var(--cq-color-xp-light);">+${dailyChallenge.rewardXP} XP</span>
                        <span class="mx-1">•</span>
                        <span class="fw-bold" style="color: var(--cq-color-coins-light);">+${dailyChallenge.rewardCoins} 🪙</span>
                      </div>
                      <button id="cq-dash-daily-btn" class="btn btn-sm btn-outline-warning fw-bold px-3 py-2 rounded-pill" style="border-color: #d4a017;">
                        ${dailyChallenge.completed ? 'Claimed ✓' : 'Accept Challenge <i class="bi bi-arrow-right ms-1"></i>'}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- MODULE GRID (8 CARDS) -->
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h2 class="h4 fw-bold mb-0 text-white">
                    <i class="bi bi-compass me-2" style="color: var(--cq-sage-light);"></i>Learning Modules
                  </h2>
                  <a href="#/modules" class="small fw-semibold text-decoration-none" style="color: var(--cq-gold-light);">
                    Explore All (8) <i class="bi bi-chevron-right"></i>
                  </a>
                </div>

                <div class="row g-3">
                  ${MODULES_INFO.map(mod => {
                    // compute module progress
                    let modLevelsDone = 0;
                    if (player.progress) {
                      for (const [subKey, sData] of Object.entries(player.progress)) {
                        if (subKey.startsWith(mod.id) || (mod.id === 'general-aptitude' && ['arithmetic','quantitative','time-work'].includes(subKey))) {
                          modLevelsDone += (sData.completedLevels ? sData.completedLevels.length : 0);
                        }
                      }
                    }
                    const totalModLevels = 150;
                    const pct = Math.min(100, Math.floor((modLevelsDone / totalModLevels) * 100));

                    return `
                      <div class="col-12 col-sm-6 col-lg-3">
                        <div class="cq-module-card h-100 p-3 rounded-4 d-flex flex-column justify-content-between position-relative overflow-hidden cursor-pointer shadow-sm transition-normal" data-mod="${mod.id}" data-sub="${mod.defaultSub}" style="background: ${mod.gradient}; border: 1px solid ${mod.border}40; min-height: 190px; cursor: pointer;">
                          <!-- Ambient accent glow -->
                          <div class="position-absolute" style="right: -20px; bottom: -20px; width: 90px; height: 90px; background: radial-gradient(circle, ${mod.border}30 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>

                          <div>
                            <div class="d-flex align-items-center justify-content-between mb-2">
                              <div class="d-flex align-items-center justify-content-center rounded-3" style="width: 44px; height: 44px; background: rgba(0,0,0,0.3); border: 1px solid ${mod.border}60; color: #fff;">
                                <i class="bi ${mod.icon} fs-4"></i>
                              </div>
                              <span class="badge rounded-pill small" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); color: #e8f0d8;">3 Submodules</span>
                            </div>
                            <h4 class="h6 fw-bold text-white mb-1">${mod.name}</h4>
                            <p class="small mb-3 text-truncate" style="color: rgba(255,255,255,0.75); font-size: 0.78rem;">${mod.desc}</p>
                          </div>

                          <div>
                            <div class="d-flex justify-content-between small mb-1" style="color: rgba(255,255,255,0.85); font-size: 0.72rem;">
                              <span>Progress</span>
                              <span>${modLevelsDone}/150 Lvs (${pct}%)</span>
                            </div>
                            <div class="progress mb-2" style="height: 5px; background: rgba(0,0,0,0.4); border-radius: 999px;">
                              <div class="progress-bar" role="progressbar" style="width: ${pct}%; background: ${mod.border};"></div>
                            </div>
                            <button class="btn btn-sm w-100 py-1 rounded-pill fw-semibold text-white" style="background: rgba(0,0,0,0.35); border: 1px solid ${mod.border}80; font-size: 0.78rem;">
                              Play Now <i class="bi bi-chevron-right ms-1"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- RIGHT SIDE PANEL / STATS & LEADERBOARD -->
              <div class="col-12 col-xl-3">
                <div class="d-flex flex-column gap-3">
                  
                  <!-- QUICK STATS CARD -->
                  <div class="cq-card p-3 rounded-4" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.25);">
                    <h3 class="h6 fw-bold mb-3 d-flex align-items-center text-white">
                      <i class="bi bi-speedometer2 me-2" style="color: var(--cq-sage-light);"></i>Combat Statistics
                    </h3>

                    <div class="row g-2 text-center">
                      <div class="col-6">
                        <div class="p-2 rounded-3" style="background: rgba(13,26,5,0.7); border: 1px solid rgba(122,154,92,0.15);">
                          <div class="h5 fw-bold text-white mb-0">${stats.levelsCompleted}</div>
                          <div class="small" style="color: var(--cq-text-muted); font-size: 0.72rem;">Levels Cleared</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="p-2 rounded-3" style="background: rgba(13,26,5,0.7); border: 1px solid rgba(122,154,92,0.15);">
                          <div class="h5 fw-bold text-white mb-0">${stats.questionsAnswered}</div>
                          <div class="small" style="color: var(--cq-text-muted); font-size: 0.72rem;">Questions</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="p-2 rounded-3" style="background: rgba(13,26,5,0.7); border: 1px solid rgba(122,154,92,0.15);">
                          <div class="h5 fw-bold text-white mb-0">${stats.accuracy}%</div>
                          <div class="small" style="color: var(--cq-text-muted); font-size: 0.72rem;">Accuracy</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="p-2 rounded-3" style="background: rgba(13,26,5,0.7); border: 1px solid rgba(122,154,92,0.15);">
                          <div class="h5 fw-bold text-white mb-0">🔥 ${stats.streak}d</div>
                          <div class="small" style="color: var(--cq-text-muted); font-size: 0.72rem;">Streak</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- RECENT ACHIEVEMENTS PREVIEW -->
                  <div class="cq-card p-3 rounded-4" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.25);">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <h3 class="h6 fw-bold mb-0 text-white">
                        <i class="bi bi-award me-2" style="color: var(--cq-gold-light);"></i>Achievements
                      </h3>
                      <a href="#/achievements" class="small text-decoration-none" style="color: var(--cq-sage-light); font-size: 0.75rem;">View All</a>
                    </div>

                    <div class="d-flex flex-column gap-2">
                      <div class="d-flex align-items-center gap-2 p-2 rounded-3" style="background: rgba(13,26,5,0.6); border: 1px solid rgba(212,160,23,0.3);">
                        <span class="fs-4">🚀</span>
                        <div class="flex-grow-1 lh-1">
                          <div class="fw-semibold small text-white">First Step</div>
                          <small style="color: var(--cq-text-muted); font-size: 0.7rem;">Completed your first level</small>
                        </div>
                        <span class="badge" style="background: rgba(212,160,23,0.2); color: #f0c040; border: 1px solid rgba(212,160,23,0.4); font-size: 0.65rem;">+50 XP</span>
                      </div>

                      <div class="d-flex align-items-center gap-2 p-2 rounded-3" style="background: rgba(13,26,5,0.6); border: 1px solid rgba(122,154,92,0.2);">
                        <span class="fs-4">🎯</span>
                        <div class="flex-grow-1 lh-1">
                          <div class="fw-semibold small text-white">Sharpshooter</div>
                          <small style="color: var(--cq-text-muted); font-size: 0.7rem;">Score 100% on any level</small>
                        </div>
                        <span class="badge" style="background: rgba(122,154,92,0.2); color: #9ab87e; border: 1px solid rgba(122,154,92,0.4); font-size: 0.65rem;">+100 XP</span>
                      </div>
                    </div>
                  </div>

                  <!-- LEADERBOARD PREVIEW -->
                  <div class="cq-card p-3 rounded-4" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.25);">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <h3 class="h6 fw-bold mb-0 text-white">
                        <i class="bi bi-bar-chart me-2" style="color: var(--cq-color-diamonds-light);"></i>Top Champions
                      </h3>
                      <a href="#/leaderboard" class="small text-decoration-none" style="color: var(--cq-sage-light); font-size: 0.75rem;">Rankings</a>
                    </div>

                    <div class="d-flex flex-column gap-2 small">
                      <div class="d-flex align-items-center justify-content-between p-2 rounded-3" style="background: rgba(13,26,5,0.6); border: 1px solid rgba(212,160,23,0.3);">
                        <div class="d-flex align-items-center gap-2">
                          <span class="badge bg-warning text-dark rounded-circle" style="width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center;">1</span>
                          <span class="fw-semibold text-white">AlphaMind</span>
                        </div>
                        <span class="fw-bold" style="color: var(--cq-gold-light);">4,820 XP</span>
                      </div>

                      <div class="d-flex align-items-center justify-content-between p-2 rounded-3" style="background: rgba(13,26,5,0.6); border: 1px solid rgba(122,154,92,0.2);">
                        <div class="d-flex align-items-center gap-2">
                          <span class="badge bg-secondary rounded-circle" style="width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center;">2</span>
                          <span class="fw-semibold text-white">CortexZero</span>
                        </div>
                        <span class="fw-bold" style="color: var(--cq-text-secondary);">3,950 XP</span>
                      </div>

                      <div class="d-flex align-items-center justify-content-between p-2 rounded-3" style="background: rgba(13,26,5,0.6); border: 1px solid rgba(122,154,92,0.2);">
                        <div class="d-flex align-items-center gap-2">
                          <span class="badge bg-danger rounded-circle" style="width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center;">3</span>
                          <span class="fw-semibold text-white">NovaPrime</span>
                        </div>
                        <span class="fw-bold" style="color: var(--cq-text-secondary);">3,210 XP</span>
                      </div>

                      <!-- Player's Rank Snippet -->
                      <div class="d-flex align-items-center justify-content-between p-2 rounded-3 mt-1" style="background: rgba(58,83,17,0.3); border: 1px dashed #7a9a5c;">
                        <div class="d-flex align-items-center gap-2">
                          <span class="badge" style="background: #3A5311; color: #fff;">YOU</span>
                          <span class="fw-bold text-white text-truncate" style="max-width: 90px;">${username}</span>
                        </div>
                        <span class="fw-bold" style="color: var(--cq-gold-light);">${xp} XP</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          <!-- BOTTOM NAV BAR (Mobile & Tablet) / Quick Navigation Hub -->
          <nav class="cq-bottom-nav fixed-bottom d-flex align-items-center justify-content-around py-2 px-1" style="background: rgba(13, 26, 5, 0.95); backdrop-filter: blur(14px); border-top: 1px solid rgba(122, 154, 92, 0.3); z-index: 1040;">
            <a href="#/dashboard" class="cq-nav-item d-flex flex-column align-items-center text-decoration-none active" style="color: var(--cq-gold-light);">
              <i class="bi bi-house-door-fill fs-5"></i>
              <span style="font-size: 0.68rem; font-weight: 600;">Home</span>
            </a>
            <a href="#/modules" class="cq-nav-item d-flex flex-column align-items-center text-decoration-none" style="color: var(--cq-sage-light);">
              <i class="bi bi-grid fs-5"></i>
              <span style="font-size: 0.68rem; font-weight: 500;">Modules</span>
            </a>
            <a href="#/mock-test" class="cq-nav-item d-flex flex-column align-items-center text-decoration-none" style="color: var(--cq-sage-light);">
              <i class="bi bi-file-earmark-check fs-5"></i>
              <span style="font-size: 0.68rem; font-weight: 500;">Tests</span>
            </a>
            <a href="#/brain-training" class="cq-nav-item d-flex flex-column align-items-center text-decoration-none" style="color: var(--cq-sage-light);">
              <i class="bi bi-controller fs-5"></i>
              <span style="font-size: 0.68rem; font-weight: 500;">Arcade</span>
            </a>
            <a href="#/store" class="cq-nav-item d-flex flex-column align-items-center text-decoration-none" style="color: var(--cq-sage-light);">
              <i class="bi bi-shop fs-5"></i>
              <span style="font-size: 0.68rem; font-weight: 500;">Store</span>
            </a>
            <a href="#/leaderboard" class="cq-nav-item d-flex flex-column align-items-center text-decoration-none" style="color: var(--cq-sage-light);">
              <i class="bi bi-trophy fs-5"></i>
              <span style="font-size: 0.68rem; font-weight: 500;">Ranks</span>
            </a>
            <a href="#/profile" class="cq-nav-item d-flex flex-column align-items-center text-decoration-none" style="color: var(--cq-sage-light);">
              <i class="bi bi-person fs-5"></i>
              <span style="font-size: 0.68rem; font-weight: 500;">Profile</span>
            </a>
          </nav>

        </div>
      `;

      // Event Listeners
      const contBtn = document.getElementById('cq-dash-continue-btn');
      if (contBtn) {
        contBtn.addEventListener('click', () => {
          if (window.CortexRouter) {
            window.CortexRouter.navigate('level-map', { module: continueMod, submodule: continueSub });
          }
        });
      }

      const startBtn = document.getElementById('cq-dash-start-btn');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('modules');
        });
      }

      const allModBtn = document.getElementById('cq-dash-all-modules-btn');
      if (allModBtn) {
        allModBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('modules');
        });
      }

      const dailyBtn = document.getElementById('cq-dash-daily-btn');
      if (dailyBtn) {
        dailyBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('daily-challenge');
        });
      }

      // Audio mute/unmute toggle button
      const muteBtn = document.getElementById('cq-dash-mute-btn');
      if (muteBtn && window.CortexAudio) {
        muteBtn.addEventListener('click', () => {
          const isMuted = window.CortexAudio.isMuted ? window.CortexAudio.isMuted() : false;
          if (window.CortexAudio.setMuted) {
            window.CortexAudio.setMuted(!isMuted);
          }
          muteBtn.innerHTML = !isMuted ? '<i class="bi bi-volume-mute"></i>' : '<i class="bi bi-volume-up"></i>';
        });
      }

      // Theme toggle button
      const themeBtn = document.getElementById('cq-dash-theme-btn');
      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          if (window.CortexTheme && window.CortexTheme.toggle) {
            window.CortexTheme.toggle();
          } else {
            document.body.classList.toggle('light-theme');
          }
        });
      }

      // Profile button
      const profBtn = document.getElementById('cq-dash-profile-btn');
      if (profBtn) {
        profBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('profile');
        });
      }

      // Module cards click
      const modCards = document.querySelectorAll('.cq-module-card');
      modCards.forEach(card => {
        card.addEventListener('click', () => {
          const mod = card.getAttribute('data-mod');
          const sub = card.getAttribute('data-sub');
          if (window.CortexRouter) {
            window.CortexRouter.navigate('level-map', { module: mod, submodule: sub });
          }
        });
      });
    }
  };
})();
