(function() {
  'use strict';

  function showToast(msg, type = 'info') {
    if (window.CortexUtils && window.CortexUtils.showToast) {
      window.CortexUtils.showToast(msg, type);
      return;
    }
    const container = document.getElementById('cq-toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : (type === 'warning' ? 'warning' : 'success')} position-fixed shadow-lg animate-slide-up`;
    toast.style.cssText = 'bottom: 24px; right: 24px; z-index: 9999; max-width: 340px; border-radius: 12px; font-weight: 500; font-size: 0.9rem;';
    toast.innerHTML = `<i class="bi bi-info-circle me-2"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  window.PageLevelMap = {
    render: function(moduleId = 'general-aptitude', submoduleId = 'arithmetic') {
      const main = document.getElementById('cq-main');
      if (!main) return;

      // Play module BGM
      if (window.CortexAudio && window.CortexAudio.playBGM) {
        try { window.CortexAudio.playBGM(moduleId); } catch(e) {}
      }

      // Fetch player progress
      const player = (window.CortexStore && window.CortexStore.getPlayer && window.CortexStore.getPlayer()) || {};
      const progress = player.progress || {};
      const subData = progress[submoduleId] || { currentLevel: 1, completedLevels: [], highScores: {} };

      const completedLevels = subData.completedLevels || [];
      const currentLevel = subData.currentLevel || (completedLevels.length > 0 ? Math.max(...completedLevels) + 1 : 1);
      const highScores = subData.highScores || {};

      let totalStars = 0;
      completedLevels.forEach(lvl => {
        totalStars += (highScores[lvl] || 3);
      });

      let currentDifficulty = 'medium';

      const formatTitle = (str) => {
        return (str || '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      };

      const modTitle = formatTitle(moduleId);
      const subTitle = formatTitle(submoduleId);

      // Build 50 level data array organized into 5 rows (bottom to top):
      // Row 5 (bottom): 1..10 (L to R)
      // Row 4: 20..11 (R to L)
      // Row 3: 21..30 (L to R)
      // Row 2: 40..31 (R to L)
      // Row 1 (top): 41..50 (L to R)
      const rows = [
        [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
        [40, 39, 38, 37, 36, 35, 34, 33, 32, 31],
        [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
        [1,  2,  3,  4,  5,  6,  7,  8,  9,  10]
      ];

      main.innerHTML = `
        <div class="cq-level-map-page min-vh-100 pb-5 position-relative overflow-hidden" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
          
          <!-- TOP HEADER BAR -->
          <div class="sticky-top px-3 px-lg-4 py-2 d-flex flex-wrap align-items-center justify-content-between gap-2" style="background: rgba(13, 26, 5, 0.94); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
            <!-- Left breadcrumbs -->
            <div class="d-flex align-items-center gap-2">
              <button id="cq-map-back" class="btn btn-sm btn-icon rounded-circle" style="width: 38px; height: 38px; background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #9ab87e;">
                <i class="bi bi-arrow-left fs-5"></i>
              </button>
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0 small">
                  <li class="breadcrumb-item"><a href="#/modules" class="text-decoration-none" style="color: var(--cq-sage-light);">Modules</a></li>
                  <li class="breadcrumb-item text-muted">${modTitle}</li>
                  <li class="breadcrumb-item active fw-bold text-white" aria-current="page">${subTitle}</li>
                </ol>
              </nav>
            </div>

            <!-- Center Difficulty Selector -->
            <div class="d-flex align-items-center gap-1 p-1 rounded-pill" style="background: rgba(26, 45, 10, 0.9); border: 1px solid rgba(122, 154, 92, 0.3);">
              <button class="cq-diff-pill btn btn-sm rounded-pill px-3 py-1 fw-semibold" data-diff="easy" style="background: transparent; border: none; color: var(--cq-diff-easy, #22c55e); font-size: 0.8rem;">Easy</button>
              <button class="cq-diff-pill btn btn-sm rounded-pill px-3 py-1 fw-semibold active" data-diff="medium" style="background: #3A5311; border: 1px solid #7a9a5c; color: #f0c040; font-size: 0.8rem;">Medium</button>
              <button class="cq-diff-pill btn btn-sm rounded-pill px-3 py-1 fw-semibold" data-diff="hard" style="background: transparent; border: none; color: var(--cq-diff-hard, #ef4444); font-size: 0.8rem;">Hard</button>
            </div>

            <!-- Right Stats Badge -->
            <div class="d-flex align-items-center gap-2">
              <span class="badge px-3 py-2 rounded-pill fw-semibold" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3); color: #e8f0d8; font-size: 0.82rem;">
                <i class="bi bi-check2-circle text-success me-1"></i> ${completedLevels.length}/50 Completed
              </span>
              <span class="badge px-3 py-2 rounded-pill fw-semibold" style="background: rgba(212, 160, 23, 0.15); border: 1px solid rgba(212, 160, 23, 0.4); color: var(--cq-gold-light); font-size: 0.82rem;">
                ⭐ ${totalStars}/150
              </span>
            </div>
          </div>

          <!-- MAP CONTAINER -->
          <div class="container-fluid px-3 px-lg-5 py-4" style="max-width: 1300px;">
            <div class="text-center mb-4">
              <h2 class="h3 fw-bold text-white mb-1" style="font-family: var(--cq-font-heading);">${subTitle} Quest Journey</h2>
              <p class="small text-muted mb-0">Follow the winding neural path from Level 1 to Level 50. Clear each node to advance!</p>
            </div>

            <!-- 5-Row Snake Level Map -->
            <div class="cq-map-matrix d-flex flex-column gap-4 p-3 p-md-4 rounded-4 position-relative" style="background: rgba(26, 45, 10, 0.65); border: 1px solid rgba(122, 154, 92, 0.3); backdrop-filter: blur(8px); box-shadow: 0 16px 40px rgba(0,0,0,0.5);">
              
              <!-- Subtle matrix grid background lines -->
              <div class="position-absolute" style="inset: 0; background-image: radial-gradient(rgba(122,154,92,0.15) 1px, transparent 1px); background-size: 24px 24px; pointer-events: none; border-radius: inherit;"></div>

              ${rows.map((rowArr, rowIndex) => {
                const isReversed = rowIndex % 2 === 1; // row 4 and row 2 are right-to-left
                return `
                  <div class="d-flex align-items-center justify-content-between position-relative py-2 px-1 flex-nowrap" style="overflow-x: auto; gap: 8px;">
                    <!-- Row connection line behind nodes -->
                    <div class="position-absolute top-50 start-0 w-100" style="height: 3px; background: rgba(122, 154, 92, 0.25); transform: translateY(-50%); z-index: 0; pointer-events: none;"></div>

                    ${rowArr.map(lvl => {
                      const isCompleted = completedLevels.includes(lvl);
                      const isCurrent = lvl === currentLevel;
                      const isLocked = lvl > currentLevel && !isCompleted;
                      const stars = highScores[lvl] || (isCompleted ? 3 : 0);

                      let nodeStyle = '';
                      let nodeClass = '';
                      let icon = '';

                      if (isCompleted) {
                        nodeClass = 'cq-node-completed';
                        nodeStyle = 'background: linear-gradient(135deg, #d4a017 0%, #aa7f10 100%); border: 2px solid #f0c040; box-shadow: 0 0 16px rgba(240,192,64,0.4); color: #0d1a05;';
                        icon = `<span class="fw-bold" style="font-size: 0.95rem;">${lvl}</span><div class="position-absolute" style="bottom: -8px; font-size: 0.6rem;">${'⭐'.repeat(stars)}</div>`;
                      } else if (isCurrent) {
                        nodeClass = 'cq-node-current animate-pulse';
                        nodeStyle = 'background: linear-gradient(135deg, #4d6e18 0%, #2a3d0c 100%); border: 3px solid #9ab87e; box-shadow: 0 0 24px rgba(154,184,126,0.8); color: #fff;';
                        icon = `<span class="fw-bold fs-5">${lvl}</span><span class="position-absolute top-0 end-0 translate-middle p-1 bg-warning border border-light rounded-circle"><span class="visually-hidden">Current</span></span>`;
                      } else {
                        nodeClass = 'cq-node-locked';
                        nodeStyle = 'background: rgba(13, 26, 5, 0.7); border: 2px solid rgba(122, 154, 92, 0.2); color: #6c845b; opacity: 0.75;';
                        icon = `<i class="bi bi-lock-fill small"></i><span class="small" style="font-size: 0.7rem;">${lvl}</span>`;
                      }

                      return `
                        <div class="cq-level-node position-relative d-flex flex-column align-items-center justify-content-center rounded-circle flex-shrink-0 cursor-pointer transition-fast ${nodeClass}"
                             data-level="${lvl}"
                             data-locked="${isLocked}"
                             style="width: 54px; height: 54px; z-index: 2; cursor: pointer; ${nodeStyle}"
                             title="Level ${lvl} ${isCompleted ? '(Completed)' : (isCurrent ? '(Current)' : '(Locked)')}">
                          ${icon}
                        </div>
                      `;
                    }).join('')}
                  </div>
                `;
              }).join('')}

              <!-- Bottom legend -->
              <div class="d-flex flex-wrap align-items-center justify-content-center gap-4 pt-3 border-top" style="border-color: rgba(122,154,92,0.2) !important;">
                <div class="d-flex align-items-center gap-2 small">
                  <span class="rounded-circle d-inline-block" style="width: 14px; height: 14px; background: #f0c040; border: 1px solid #d4a017;"></span>
                  <span>Completed (1-3 Stars)</span>
                </div>
                <div class="d-flex align-items-center gap-2 small">
                  <span class="rounded-circle d-inline-block animate-pulse" style="width: 14px; height: 14px; background: #4d6e18; border: 2px solid #9ab87e;"></span>
                  <span class="fw-bold" style="color: var(--cq-sage-light);">Current Level Node</span>
                </div>
                <div class="d-flex align-items-center gap-2 small">
                  <span class="rounded-circle d-inline-block" style="width: 14px; height: 14px; background: rgba(13, 26, 5, 0.8); border: 1px solid rgba(122, 154, 92, 0.3);"></span>
                  <span class="text-muted">Locked Node</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      `;

      // Back navigation
      const backBtn = document.getElementById('cq-map-back');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('modules');
        });
      }

      // Difficulty selector clicks
      const diffPills = document.querySelectorAll('.cq-diff-pill');
      diffPills.forEach(pill => {
        pill.addEventListener('click', () => {
          diffPills.forEach(p => {
            p.classList.remove('active');
            p.style.background = 'transparent';
            p.style.border = 'none';
          });
          pill.classList.add('active');
          pill.style.background = '#3A5311';
          pill.style.border = '1px solid #7a9a5c';
          currentDifficulty = pill.getAttribute('data-diff');
        });
      });

      // Level node clicks
      const nodes = document.querySelectorAll('.cq-level-node');
      nodes.forEach(node => {
        node.addEventListener('click', () => {
          const lvl = parseInt(node.getAttribute('data-level'), 10);
          const isLocked = node.getAttribute('data-locked') === 'true';

          if (isLocked) {
            showToast(`Complete level ${lvl - 1} first to unlock level ${lvl}!`, 'warning');
            return;
          }

          if (window.CortexRouter) {
            window.CortexRouter.navigate('quiz', {
              module: moduleId,
              submodule: submoduleId,
              level: lvl,
              difficulty: currentDifficulty
            });
          }
        });
      });
    }
  };
})();
