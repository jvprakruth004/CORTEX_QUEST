(function() {
  'use strict';

  const DEFAULT_LEADERBOARD = [
    { rank: 1, username: 'AlphaMind', isBot: true, level: 34, xp: 4820, stars: 88, emoji: '👑' },
    { rank: 2, username: 'CortexZero', isBot: true, level: 29, xp: 3950, stars: 72, emoji: '⚡' },
    { rank: 3, username: 'NovaPrime', isBot: true, level: 24, xp: 3210, stars: 60, emoji: '🔮' },
    { rank: 4, username: 'CyberSage', isBot: true, level: 19, xp: 2640, stars: 48, emoji: '🛡️' },
    { rank: 5, username: 'LogicViper', isBot: true, level: 16, xp: 2150, stars: 40, emoji: '⚔️' },
    { rank: 6, username: 'QuantumKid', isBot: true, level: 12, xp: 1420, stars: 25, emoji: '🌱' },
    { rank: 7, username: 'PixelMage', isBot: true, level: 8, xp: 980, stars: 18, emoji: '🌱' }
  ];

  window.PageLeaderboard = {
    render: function() {
      const main = document.getElementById('cq-main');
      if (!main) return;

      const player = (window.CortexStore && window.CortexStore.getPlayer && window.CortexStore.getPlayer()) || {};
      const username = player.username || 'Adventurer';
      const playerLevel = (window.CortexPlayer && window.CortexPlayer.getLevel && window.CortexPlayer.getLevel()) || player.level || 1;
      const playerXP = (window.CortexPlayer && window.CortexPlayer.getXP && window.CortexPlayer.getXP()) ?? player.xp ?? 0;
      const playerStars = (window.CortexPlayer && window.CortexPlayer.getStarsCount && window.CortexPlayer.getStarsCount()) ?? player.stars ?? 0;
      const isGuest = window.CortexAuth && window.CortexAuth.isGuest ? window.CortexAuth.isGuest() : (!player.email);

      let entries = DEFAULT_LEADERBOARD;
      if (window.CortexLeaderboard && window.CortexLeaderboard.getEntries) {
        const leadEntries = window.CortexLeaderboard.getEntries();
        if (leadEntries && leadEntries.length > 0) {
          entries = leadEntries;
        }
      }

      // Ensure current player is merged into leaderboard
      let playerEntry = {
        rank: 6,
        username: username,
        isBot: false,
        isCurrentPlayer: true,
        level: playerLevel,
        xp: playerXP,
        stars: playerStars,
        emoji: '⚔️'
      };

      // Recalculate ranks based on XP
      const fullList = [...entries.filter(e => e.username !== username), playerEntry];
      fullList.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      fullList.forEach((e, idx) => e.rank = idx + 1);

      const top1 = fullList[0] || { rank: 1, username: 'Champion', xp: 5000, level: 40, emoji: '👑' };
      const top2 = fullList[1] || { rank: 2, username: 'Contender', xp: 4000, level: 35, emoji: '⚡' };
      const top3 = fullList[2] || { rank: 3, username: 'Challenger', xp: 3000, level: 30, emoji: '🔮' };

      const myRank = fullList.find(e => e.isCurrentPlayer || e.username === username)?.rank || 6;

      main.innerHTML = `
        <div class="cq-leaderboard-page min-vh-100 pb-5" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
          
          <!-- TOP NAVBAR -->
          <div class="sticky-top px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.94); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
            <div class="d-flex align-items-center gap-3">
              <button id="cq-lead-back" class="btn btn-sm btn-icon rounded-circle" style="width: 38px; height: 38px; background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #9ab87e;">
                <i class="bi bi-arrow-left fs-5"></i>
              </button>
              <div>
                <h1 class="h4 fw-bold mb-0 text-white">Global Arena Leaderboard</h1>
                <small style="color: var(--cq-text-muted);">Climb the ranks and claim supreme intellectual supremacy</small>
              </div>
            </div>

            <!-- Player's Rank Highlight Badge -->
            <span class="badge px-3 py-2 rounded-pill fw-bold" style="background: rgba(58,83,17,0.4); border: 1px solid #7a9a5c; color: var(--cq-gold-light); font-size: 0.85rem;">
              Your Rank: #${myRank}
            </span>
          </div>

          <div class="container-fluid px-3 px-lg-4 py-4" style="max-width: 1000px;">
            
            <!-- Guest Banner Warning (if guest) -->
            ${isGuest ? `
              <div class="alert alert-warning d-flex align-items-center justify-content-between p-3 rounded-4 mb-4 shadow" style="background: rgba(212, 160, 23, 0.15); border: 1px solid rgba(212, 160, 23, 0.4); color: #f0c040;">
                <div class="d-flex align-items-center gap-3">
                  <i class="bi bi-exclamation-triangle-fill fs-3"></i>
                  <div>
                    <div class="fw-bold">Guest Mode Active</div>
                    <small style="color: var(--cq-cream-muted);">Register your free account to lock your place in the global hall of fame!</small>
                  </div>
                </div>
                <button id="cq-lead-register-btn" class="btn btn-sm btn-warning fw-bold px-3 py-2 rounded-pill shadow" style="background: linear-gradient(135deg, #f0c040, #d4a017); color: #0d1a05; border: none;">
                  Register Now
                </button>
              </div>
            ` : ''}

            <!-- TOP 3 PODIUM DISPLAY -->
            <div class="cq-podium-container d-flex align-items-end justify-content-center gap-2 gap-md-4 mb-5 pt-4">
              
              <!-- 2ND PLACE (Left / Silver) -->
              <div class="d-flex flex-column align-items-center animate-slide-up delay-100" style="width: 140px;">
                <div class="mb-2 text-center">
                  <span class="fs-1 d-block mb-1">${top2.emoji || '⚡'}</span>
                  <div class="fw-bold text-white text-truncate small" style="max-width: 130px;">${top2.username}</div>
                  <span class="badge" style="background: rgba(255,255,255,0.1); color: #cbd5e1; font-size: 0.7rem;">Lv.${top2.level}</span>
                </div>
                <div class="w-100 d-flex flex-column align-items-center justify-content-center rounded-top-4 shadow-lg p-2"
                     style="height: 140px; background: linear-gradient(180deg, #64748b 0%, #334155 100%); border: 2px solid #94a3b8; border-bottom: none;">
                  <span class="display-6 fw-extrabold text-white">2</span>
                  <div class="small fw-bold text-light">${top2.xp} XP</div>
                  <small style="color: #cbd5e1; font-size: 0.7rem;">⭐ ${top2.stars || 0}</small>
                </div>
              </div>

              <!-- 1ST PLACE (Center / Gold - Tallest) -->
              <div class="d-flex flex-column align-items-center animate-slide-up" style="width: 160px;">
                <div class="mb-2 text-center position-relative">
                  <i class="bi bi-trophy-fill position-absolute" style="top: -24px; left: 50%; transform: translateX(-50%); color: #f0c040; font-size: 1.5rem; filter: drop-shadow(0 0 10px #f0c040);"></i>
                  <span class="fs-1 d-block mb-1 mt-1">${top1.emoji || '👑'}</span>
                  <div class="fw-bold text-white text-truncate" style="max-width: 150px;">${top1.username}</div>
                  <span class="badge" style="background: rgba(212,160,23,0.25); color: #f0c040; border: 1px solid #f0c040; font-size: 0.72rem;">Lv.${top1.level}</span>
                </div>
                <div class="w-100 d-flex flex-column align-items-center justify-content-center rounded-top-4 shadow-lg p-2 position-relative overflow-hidden"
                     style="height: 180px; background: linear-gradient(180deg, #d4a017 0%, #854d0e 100%); border: 2px solid #f0c040; border-bottom: none; box-shadow: 0 0 30px rgba(240,192,64,0.35);">
                  <span class="display-5 fw-extrabold text-white">1</span>
                  <div class="fw-bold text-white">${top1.xp} XP</div>
                  <small style="color: #fef08a; font-size: 0.75rem;">⭐ ${top1.stars || 0} Stars</small>
                </div>
              </div>

              <!-- 3RD PLACE (Right / Bronze) -->
              <div class="d-flex flex-column align-items-center animate-slide-up delay-200" style="width: 140px;">
                <div class="mb-2 text-center">
                  <span class="fs-1 d-block mb-1">${top3.emoji || '🔮'}</span>
                  <div class="fw-bold text-white text-truncate small" style="max-width: 130px;">${top3.username}</div>
                  <span class="badge" style="background: rgba(255,255,255,0.1); color: #fed7aa; font-size: 0.7rem;">Lv.${top3.level}</span>
                </div>
                <div class="w-100 d-flex flex-column align-items-center justify-content-center rounded-top-4 shadow-lg p-2"
                     style="height: 110px; background: linear-gradient(180deg, #9a3412 0%, #431407 100%); border: 2px solid #ea580c; border-bottom: none;">
                  <span class="display-6 fw-extrabold text-white">3</span>
                  <div class="small fw-bold text-light">${top3.xp} XP</div>
                  <small style="color: #fdba74; font-size: 0.7rem;">⭐ ${top3.stars || 0}</small>
                </div>
              </div>

            </div>

            <!-- LEADERBOARD RANK LIST -->
            <div class="cq-card p-3 p-md-4 rounded-4 shadow-lg" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3);">
              <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style="border-color: rgba(122, 154, 92, 0.2) !important;">
                <span class="small fw-bold text-uppercase" style="color: var(--cq-text-muted);">Rank & Challenger</span>
                <span class="small fw-bold text-uppercase" style="color: var(--cq-text-muted);">Points & Stars</span>
              </div>

              <div class="d-flex flex-column gap-2">
                ${fullList.map(entry => {
                  const isCurrent = entry.isCurrentPlayer || entry.username === username;
                  return `
                    <div class="d-flex align-items-center justify-content-between p-3 rounded-3 transition-fast"
                         style="background: ${isCurrent ? 'rgba(58, 83, 17, 0.4)' : 'rgba(13, 26, 5, 0.65)'};
                                border: 1px solid ${isCurrent ? '#7a9a5c' : 'rgba(122, 154, 92, 0.15)'};
                                ${isCurrent ? 'box-shadow: 0 0 16px rgba(122,154,92,0.4);' : ''}">
                      
                      <!-- Left: Rank, Avatar, Name -->
                      <div class="d-flex align-items-center gap-3">
                        <span class="fw-bold d-inline-flex align-items-center justify-content-center rounded-circle"
                              style="width: 28px; height: 28px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: ${entry.rank <= 3 ? '#f0c040' : '#cbd5e1'}; font-size: 0.85rem;">
                          #${entry.rank}
                        </span>

                        <span class="fs-4">${entry.emoji || '🌱'}</span>

                        <div>
                          <div class="d-flex align-items-center gap-2">
                            <span class="fw-bold text-white">${entry.username}</span>
                            ${entry.isBot ? `<span class="badge" style="background: rgba(255,255,255,0.08); font-size: 0.65rem; color: #94a3b8;">[BOT]</span>` : ''}
                            ${isCurrent ? `<span class="badge" style="background: #3A5311; color: #fff; font-size: 0.65rem;">YOU</span>` : ''}
                          </div>
                          <small style="color: var(--cq-text-muted); font-size: 0.75rem;">Level ${entry.level}</small>
                        </div>
                      </div>

                      <!-- Right: XP & Stars -->
                      <div class="text-end">
                        <div class="fw-bold" style="color: var(--cq-gold-light); font-size: 0.95rem;">${entry.xp} XP</div>
                        <small style="color: var(--cq-sage-light); font-size: 0.75rem;">⭐ ${entry.stars || 0}</small>
                      </div>

                    </div>
                  `;
                }).join('')}
              </div>
            </div>

          </div>
        </div>
      `;

      // Back navigation
      const backBtn = document.getElementById('cq-lead-back');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
        });
      }

      // Guest register button
      const regBtn = document.getElementById('cq-lead-register-btn');
      if (regBtn) {
        regBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('register');
        });
      }
    }
  };
})();
