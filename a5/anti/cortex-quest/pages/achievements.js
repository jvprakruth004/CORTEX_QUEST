(function() {
  'use strict';

  const DEFAULT_ACHIEVEMENTS = [
    { id: 'first_step', name: 'First Step', desc: 'Completed your very first challenge level', icon: '🚀', rarity: 'Common', xp: 50 },
    { id: 'sharpshooter', name: 'Sharpshooter', desc: 'Score 100% accuracy on any level quiz', icon: '🎯', rarity: 'Rare', xp: 100 },
    { id: 'quick_thinker', name: 'Quick Thinker', desc: 'Answer 5 consecutive questions in under 10 seconds', icon: '⚡', rarity: 'Rare', xp: 100 },
    { id: 'novice_scholar', name: 'Novice Scholar', desc: 'Reach Player Level 5 and earn your first title badge', icon: '📚', rarity: 'Common', xp: 75 },
    { id: 'aptitude_ace', name: 'Aptitude Ace', desc: 'Clear all 50 levels of Arithmetic track', icon: '📐', rarity: 'Epic', xp: 250 },
    { id: 'data_decoder', name: 'Data Decoder', desc: 'Clear all 50 levels of Data Interpretation track', icon: '📊', rarity: 'Epic', xp: 250 },
    { id: 'logic_master', name: 'Logic Master', desc: 'Clear all 50 levels of Logical Reasoning track', icon: '🧠', rarity: 'Epic', xp: 250 },
    { id: 'code_prodigy', name: 'Code Prodigy', desc: 'Clear all 50 levels of Programming track', icon: '💻', rarity: 'Epic', xp: 250 },
    { id: 'polymath', name: 'Grand Polymath', desc: 'Complete at least 10 levels across all 8 modules', icon: '👑', rarity: 'Legendary', xp: 500 },
    { id: 'night_owl', name: 'Night Owl', desc: 'Complete a quiz challenge between 10 PM and 4 AM', icon: '🦉', rarity: 'Common', xp: 50 },
    { id: 'daily_warrior', name: 'Daily Warrior', desc: 'Maintain a continuous 7-day challenge streak', icon: '🔥', rarity: 'Rare', xp: 150 },
    { id: 'star_collector', name: 'Star Collector', desc: 'Collect 50 stars across your quest journey', icon: '⭐', rarity: 'Rare', xp: 150 },
    { id: 'galaxy_explorer', name: 'Galaxy Explorer', desc: 'Collect 300 stars across all learning tracks', icon: '🌌', rarity: 'Legendary', xp: 500 },
    { id: 'puzzle_virtuoso', name: 'Puzzle Virtuoso', desc: 'Score over 1,000 points in Quest Puzzle matrix', icon: '🧩', rarity: 'Rare', xp: 125 },
    { id: 'treasure_hunter', name: 'Treasure Hunter', desc: 'Accumulate 500 coins in your quest balance', icon: '🪙', rarity: 'Common', xp: 75 },
    { id: 'unstoppable', name: 'The Unstoppable', desc: 'Achieve a 30-day continuous study streak', icon: '🏆', rarity: 'Legendary', xp: 1000 }
  ];

  window.PageAchievements = {
    render: function() {
      const main = document.getElementById('cq-main');
      if (!main) return;

      const player = (window.CortexStore && window.CortexStore.getPlayer && window.CortexStore.getPlayer()) || {};
      const playerUnlocked = new Set(player.achievements || ['first_step']);

      let achievementsList = DEFAULT_ACHIEVEMENTS;
      if (window.CortexGamification && window.CortexGamification.getAchievements) {
        const gamData = window.CortexGamification.getAchievements();
        if (gamData && gamData.length > 0) {
          achievementsList = gamData;
        }
      }

      let activeFilter = 'all';
      let searchQuery = '';

      const renderGrid = () => {
        const grid = document.getElementById('cq-achievements-grid');
        if (!grid) return;

        const filtered = achievementsList.filter(ach => {
          const isUnlocked = ach.unlocked !== undefined ? ach.unlocked : playerUnlocked.has(ach.id);
          if (activeFilter === 'unlocked' && !isUnlocked) return false;
          if (activeFilter === 'locked' && isUnlocked) return false;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (ach.name && ach.name.toLowerCase().includes(q)) || (ach.desc && ach.desc.toLowerCase().includes(q));
          }
          return true;
        });

        if (filtered.length === 0) {
          grid.innerHTML = `
            <div class="col-12 text-center py-5">
              <i class="bi bi-search fs-1 text-muted"></i>
              <p class="text-muted mt-2">No achievements found matching your criteria.</p>
            </div>
          `;
          return;
        }

        grid.innerHTML = filtered.map(ach => {
          const isUnlocked = ach.unlocked !== undefined ? ach.unlocked : playerUnlocked.has(ach.id);
          const isNew = ach.isNew || (ach.id === 'first_step' && playerUnlocked.size <= 2);

          let rarityBadgeColor = '#6c845b';
          let rarityBorder = 'rgba(122,154,92,0.3)';
          if (ach.rarity === 'Legendary') {
            rarityBadgeColor = 'var(--cq-gold-light, #f0c040)';
            rarityBorder = 'rgba(212,160,23,0.5)';
          } else if (ach.rarity === 'Epic') {
            rarityBadgeColor = 'var(--cq-color-xp-light, #c084fc)';
            rarityBorder = 'rgba(168,85,247,0.5)';
          } else if (ach.rarity === 'Rare') {
            rarityBadgeColor = 'var(--cq-color-diamonds-light, #38bdf8)';
            rarityBorder = 'rgba(6,182,212,0.5)';
          }

          return `
            <div class="col-12 col-md-6 col-xl-4">
              <div class="cq-achievement-card h-100 p-3 p-md-4 rounded-4 position-relative d-flex align-items-start gap-3 transition-normal shadow-sm"
                   style="background: ${isUnlocked ? 'rgba(26, 45, 10, 0.85)' : 'rgba(13, 26, 5, 0.6)'}; 
                          border: 1px solid ${isUnlocked ? (isNew ? '#f0c040' : 'rgba(122, 154, 92, 0.4)') : 'rgba(255,255,255,0.08)'};
                          opacity: ${isUnlocked ? '1' : '0.6'};
                          ${isUnlocked ? 'box-shadow: 0 4px 20px rgba(0,0,0,0.3);' : ''}">
                
                ${isNew ? `
                  <span class="position-absolute top-0 end-0 translate-middle-y me-3 badge rounded-pill animate-pulse" style="background: #f0c040; color: #0d1a05; font-size: 0.65rem; font-weight: 800;">
                    NEW UNLOCKED!
                  </span>
                ` : ''}

                <!-- Icon Container -->
                <div class="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 shadow"
                     style="width: 58px; height: 58px; font-size: 2rem; background: ${isUnlocked ? 'rgba(58,83,17,0.5)' : 'rgba(0,0,0,0.4)'}; border: 1px solid ${isUnlocked ? '#7a9a5c' : 'rgba(255,255,255,0.1)'}; filter: ${isUnlocked ? 'none' : 'grayscale(100%)'};">
                  ${ach.icon}
                </div>

                <!-- Info Column -->
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <h3 class="h6 fw-bold mb-0 text-white">${ach.name}</h3>
                    <span class="badge rounded-pill small" style="background: rgba(0,0,0,0.3); border: 1px solid ${rarityBorder}; color: ${rarityBadgeColor}; font-size: 0.7rem;">
                      ${ach.rarity || 'Common'}
                    </span>
                  </div>

                  <p class="small text-muted mb-2" style="font-size: 0.8rem; line-height: 1.4; color: ${isUnlocked ? 'var(--cq-sage-light)' : 'var(--cq-text-muted)'} !important;">
                    ${ach.desc}
                  </p>

                  <div class="d-flex align-items-center justify-content-between">
                    <span class="badge rounded-pill" style="background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); color: var(--cq-color-xp-light); font-size: 0.72rem;">
                      +${ach.xp} XP
                    </span>
                    ${isUnlocked ? `
                      <span class="small fw-semibold text-success"><i class="bi bi-check-circle-fill me-1"></i> Unlocked</span>
                    ` : `
                      <span class="small text-muted"><i class="bi bi-lock-fill me-1"></i> Locked</span>
                    `}
                  </div>
                </div>

              </div>
            </div>
          `;
        }).join('');
      };

      const unlockedTotal = achievementsList.filter(a => a.unlocked !== undefined ? a.unlocked : playerUnlocked.has(a.id)).length;

      main.innerHTML = `
        <div class="cq-achievements-page min-vh-100 pb-5" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
          
          <!-- TOP NAVBAR -->
          <div class="sticky-top px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.94); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
            <div class="d-flex align-items-center gap-3">
              <button id="cq-ach-back" class="btn btn-sm btn-icon rounded-circle" style="width: 38px; height: 38px; background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #9ab87e;">
                <i class="bi bi-arrow-left fs-5"></i>
              </button>
              <div>
                <h1 class="h4 fw-bold mb-0 text-white">Achievements Showcase</h1>
                <small style="color: var(--cq-text-muted);">Trophies and milestones conquered during your journey</small>
              </div>
            </div>

            <!-- Total counter badge -->
            <span class="badge px-3 py-2 rounded-pill fw-bold" style="background: rgba(212,160,23,0.15); border: 1px solid rgba(212,160,23,0.4); color: var(--cq-gold-light); font-size: 0.85rem;">
              🏆 ${unlockedTotal} / ${achievementsList.length} Unlocked
            </span>
          </div>

          <!-- CONTROLS & FILTER BAR -->
          <div class="container-fluid px-3 px-lg-4 pt-4" style="max-width: 1400px;">
            <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
              
              <!-- Filter Tabs -->
              <div class="d-flex align-items-center p-1 rounded-pill" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3); width: fit-content;">
                <button class="cq-ach-filter btn btn-sm rounded-pill px-3 py-1 fw-semibold active" data-filter="all" style="background: #3A5311; border: 1px solid #7a9a5c; color: #fff;">All (${achievementsList.length})</button>
                <button class="cq-ach-filter btn btn-sm rounded-pill px-3 py-1 fw-semibold" data-filter="unlocked" style="background: transparent; border: none; color: var(--cq-text-secondary);">Unlocked (${unlockedTotal})</button>
                <button class="cq-ach-filter btn btn-sm rounded-pill px-3 py-1 fw-semibold" data-filter="locked" style="background: transparent; border: none; color: var(--cq-text-secondary);">Locked (${achievementsList.length - unlockedTotal})</button>
              </div>

              <!-- Search Input -->
              <div class="position-relative" style="max-width: 320px; width: 100%;">
                <span class="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"><i class="bi bi-search"></i></span>
                <input type="text" id="cq-ach-search" class="form-control form-control-sm ps-5 rounded-pill" placeholder="Search achievements..." style="background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #e8f0d8;">
              </div>

            </div>

            <!-- ACHIEVEMENTS GRID -->
            <div id="cq-achievements-grid" class="row g-3 g-md-4">
              <!-- Dynamically populated -->
            </div>

          </div>
        </div>
      `;

      // Back navigation
      const backBtn = document.getElementById('cq-ach-back');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
        });
      }

      // Filter tabs click
      const filterBtns = document.querySelectorAll('.cq-ach-filter');
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => {
            b.classList.remove('active');
            b.style.background = 'transparent';
            b.style.border = 'none';
            b.style.color = 'var(--cq-text-secondary)';
          });
          btn.classList.add('active');
          btn.style.background = '#3A5311';
          btn.style.border = '1px solid #7a9a5c';
          btn.style.color = '#fff';
          activeFilter = btn.getAttribute('data-filter');
          renderGrid();
        });
      });

      // Search input
      const searchInput = document.getElementById('cq-ach-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value.trim();
          renderGrid();
        });
      }

      // Initial render
      renderGrid();
    }
  };
})();
