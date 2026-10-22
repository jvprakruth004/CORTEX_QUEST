(function() {
  'use strict';

  const MODULES_DETAIL = [
    {
      id: 'general-aptitude',
      name: 'General Aptitude',
      icon: 'bi-calculator',
      color: '#7a9a5c',
      bgGrad: 'linear-gradient(135deg, rgba(58,83,17,0.9) 0%, rgba(26,45,10,0.95) 100%)',
      desc: 'Master fundamental mental arithmetic, quantitative formulations, rates, ratios, time, and work problems.',
      submodules: [
        { id: 'arithmetic', name: 'Arithmetic Ability', icon: 'bi-plus-slash-minus' },
        { id: 'quantitative', name: 'Quantitative Aptitude', icon: 'bi-percent' },
        { id: 'time-work', name: 'Time, Speed & Work', icon: 'bi-hourglass-split' }
      ]
    },
    {
      id: 'data-interpretation',
      name: 'Data Interpretation',
      icon: 'bi-bar-chart-line',
      color: '#06b6d4',
      bgGrad: 'linear-gradient(135deg, rgba(14,116,144,0.9) 0%, rgba(8,47,73,0.95) 100%)',
      desc: 'Analyze complex data tables, extract statistical insights, and decode multidimensional caselets with precision.',
      submodules: [
        { id: 'tables-charts', name: 'Tables & Data Sheets', icon: 'bi-table' },
        { id: 'graph-analysis', name: 'Bar, Line & Pie Graphs', icon: 'bi-pie-chart' },
        { id: 'caselet', name: 'Caselet & Mixed DI', icon: 'bi-file-earmark-spreadsheet' }
      ]
    },
    {
      id: 'logical-reasoning',
      name: 'Logical Reasoning',
      icon: 'bi-puzzle',
      color: '#a855f7',
      bgGrad: 'linear-gradient(135deg, rgba(126,34,206,0.9) 0%, rgba(59,7,100,0.95) 100%)',
      desc: 'Deconstruct deductive syllogisms, complex seating arrangements, blood relations, and abstract patterns.',
      submodules: [
        { id: 'verbal-reasoning', name: 'Verbal Reasoning', icon: 'bi-chat-left-dots' },
        { id: 'analytical-reasoning', name: 'Analytical & Arrangement', icon: 'bi-diagram-3' },
        { id: 'non-verbal', name: 'Non-Verbal & Pattern Matrices', icon: 'bi-grid-3x3' }
      ]
    },
    {
      id: 'general-knowledge',
      name: 'General Knowledge',
      icon: 'bi-globe-americas',
      color: '#f97316',
      bgGrad: 'linear-gradient(135deg, rgba(194,65,12,0.9) 0%, rgba(67,20,7,0.95) 100%)',
      desc: 'Broaden your worldview spanning modern science, technology breakthroughs, world history, geography, and current affairs.',
      submodules: [
        { id: 'science-tech', name: 'Science & Technology', icon: 'bi-cpu' },
        { id: 'history-geo', name: 'History & Geography', icon: 'bi-geo-alt' },
        { id: 'current-affairs', name: 'Current Affairs & Economy', icon: 'bi-newspaper' }
      ]
    },
    {
      id: 'programming',
      name: 'Programming',
      icon: 'bi-code-slash',
      color: '#38bdf8',
      bgGrad: 'linear-gradient(135deg, rgba(2,132,199,0.9) 0%, rgba(12,74,110,0.95) 100%)',
      desc: 'Code with confidence across procedural logic, control flows, loops, pointers, dynamic memory, and core data structures.',
      submodules: [
        { id: 'prog-fundamentals', name: 'Programming Fundamentals', icon: 'bi-terminal' },
        { id: 'control-statements', name: 'Control Statements & Logic', icon: 'bi-arrow-repeat' },
        { id: 'arrays-ds', name: 'Arrays, Strings & Data Structures', icon: 'bi-collection' }
      ]
    },
    {
      id: 'computer-science',
      name: 'Computer Science',
      icon: 'bi-motherboard',
      color: '#818cf8',
      bgGrad: 'linear-gradient(135deg, rgba(79,70,229,0.9) 0%, rgba(30,27,75,0.95) 100%)',
      desc: 'Deepen your foundational mastery of operating systems, relational database query optimization, and networking protocols.',
      submodules: [
        { id: 'operating-systems', name: 'Operating Systems', icon: 'bi-hdd-network' },
        { id: 'dbms', name: 'DBMS & Relational Data', icon: 'bi-database' },
        { id: 'networks', name: 'Computer Networks & Security', icon: 'bi-wifi' }
      ]
    },
    {
      id: 'engineering',
      name: 'Engineering',
      icon: 'bi-gear-wide-connected',
      color: '#eab308',
      bgGrad: 'linear-gradient(135deg, rgba(161,98,7,0.9) 0%, rgba(66,32,6,0.95) 100%)',
      desc: 'Tackle core technical concepts across circuit analysis, mechanical forces, thermodynamics, and differential engineering mathematics.',
      submodules: [
        { id: 'electrical', name: 'Electrical & Electronics', icon: 'bi-lightning' },
        { id: 'mechanical', name: 'Mechanical & Mechanics', icon: 'bi-wrench-adjustable' },
        { id: 'eng-math', name: 'Engineering Mathematics', icon: 'bi-infinity' }
      ]
    },
    {
      id: 'medical',
      name: 'Medical Science',
      icon: 'bi-heart-pulse',
      color: '#f43f5e',
      bgGrad: 'linear-gradient(135deg, rgba(190,18,60,0.9) 0%, rgba(76,5,25,0.95) 100%)',
      desc: 'Explore human anatomy, organ systems, biological feedback mechanisms, pathology, and clinical diagnostic science.',
      submodules: [
        { id: 'anatomy', name: 'Human Anatomy', icon: 'bi-person-bounding-box' },
        { id: 'physiology', name: 'Physiology & Systems', icon: 'bi-activity' },
        { id: 'medical-science', name: 'Pathology & Clinical Science', icon: 'bi-capsule' }
      ]
    }
  ];

  window.PageModules = {
    render: function() {
      const main = document.getElementById('cq-main');
      if (!main) return;

      const player = (window.CortexStore && window.CortexStore.getPlayer && window.CortexStore.getPlayer()) || {};
      const progress = player.progress || {};

      main.innerHTML = `
        <div class="cq-modules-page min-vh-100 pb-5" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
          <!-- Top Header Navigation -->
          <div class="sticky-top px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
            <div class="d-flex align-items-center gap-3">
              <button id="cq-modules-back" class="btn btn-sm btn-icon rounded-circle" style="width: 38px; height: 38px; background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #9ab87e;">
                <i class="bi bi-arrow-left fs-5"></i>
              </button>
              <div>
                <h1 class="h4 fw-bold mb-0 text-white">Learning Modules</h1>
                <small style="color: var(--cq-text-muted);">Select a domain to begin your path to mastery</small>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <span class="badge px-3 py-2 rounded-pill" style="background: rgba(58,83,17,0.4); border: 1px solid #7a9a5c; color: var(--cq-gold-light);">
                <i class="bi bi-unlock-fill me-1"></i> All 8 Modules Open
              </span>
            </div>
          </div>

          <!-- Content Grid Container -->
          <div class="container-fluid px-3 px-lg-4 py-4" style="max-width: 1400px;">
            <div class="row g-4">
              ${MODULES_DETAIL.map(mod => {
                let startedSubs = 0;
                let totalCompletedLvs = 0;

                mod.submodules.forEach(sub => {
                  const sData = progress[sub.id];
                  if (sData && sData.completedLevels && sData.completedLevels.length > 0) {
                    startedSubs++;
                    totalCompletedLvs += sData.completedLevels.length;
                  }
                });

                const totalModLevels = mod.submodules.length * 50; // 150
                const pct = Math.min(100, Math.floor((totalCompletedLvs / totalModLevels) * 100));

                return `
                  <div class="col-12 col-md-6 col-xl-4">
                    <div class="cq-card h-100 p-4 rounded-4 d-flex flex-column justify-content-between position-relative overflow-hidden shadow-lg transition-normal" style="background: ${mod.bgGrad}; border: 1px solid ${mod.color}40;">
                      
                      <!-- Ambient Glow -->
                      <div class="position-absolute" style="top: -20px; right: -20px; width: 120px; height: 120px; background: radial-gradient(circle, ${mod.color}25 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>

                      <div>
                        <!-- Module Card Header -->
                        <div class="d-flex align-items-center justify-content-between mb-3">
                          <div class="d-flex align-items-center justify-content-center rounded-3 shadow" style="width: 58px; height: 58px; background: rgba(0,0,0,0.35); border: 2px solid ${mod.color}80; color: #fff;">
                            <i class="bi ${mod.icon}" style="font-size: 2rem;"></i>
                          </div>
                          <span class="badge rounded-pill px-3 py-1" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); color: #e8f0d8;">
                            ${startedSubs}/3 Submodules Active
                          </span>
                        </div>

                        <h2 class="h5 fw-bold text-white mb-2">${mod.name}</h2>
                        <p class="small mb-3" style="color: rgba(255,255,255,0.75); font-size: 0.85rem; line-height: 1.5;">${mod.desc}</p>
                        
                        <!-- Overall Module Progress Bar -->
                        <div class="mb-4">
                          <div class="d-flex justify-content-between small mb-1" style="color: rgba(255,255,255,0.85); font-size: 0.75rem;">
                            <span>Domain Mastery</span>
                            <span>${totalCompletedLvs}/${totalModLevels} Levels (${pct}%)</span>
                          </div>
                          <div class="progress" style="height: 6px; background: rgba(0,0,0,0.4); border-radius: 999px;">
                            <div class="progress-bar" role="progressbar" style="width: ${pct}%; background: ${mod.color};"></div>
                          </div>
                        </div>

                        <!-- Submodule Chips Grid -->
                        <div class="mb-3">
                          <small class="text-uppercase fw-bold d-block mb-2" style="color: rgba(255,255,255,0.5); font-size: 0.68rem; letter-spacing: 0.5px;">Choose Submodule Track:</small>
                          <div class="d-flex flex-column gap-2">
                            ${mod.submodules.map(sub => {
                              const sData = progress[sub.id];
                              const completedCount = (sData && sData.completedLevels) ? sData.completedLevels.length : 0;
                              return `
                                <div class="cq-submodule-chip d-flex align-items-center justify-content-between p-2 px-3 rounded-3 cursor-pointer transition-fast" data-mod="${mod.id}" data-sub="${sub.id}" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); cursor: pointer;">
                                  <div class="d-flex align-items-center gap-2">
                                    <i class="bi ${sub.icon}" style="color: ${mod.color};"></i>
                                    <span class="small fw-semibold text-white">${sub.name}</span>
                                  </div>
                                  <div class="d-flex align-items-center gap-2">
                                    <span class="badge rounded-pill" style="background: rgba(255,255,255,0.1); font-size: 0.7rem; color: #e8f0d8;">
                                      ${completedCount > 0 ? `${completedCount}/50 ⭐` : 'Start'}
                                    </span>
                                    <i class="bi bi-chevron-right small text-muted"></i>
                                  </div>
                                </div>
                              `;
                            }).join('')}
                          </div>
                        </div>
                      </div>

                      <!-- Explore Action Button -->
                      <button class="cq-module-launch btn w-100 py-2 rounded-pill fw-bold text-white shadow-sm mt-2" data-mod="${mod.id}" data-sub="${mod.submodules[0].id}" style="background: rgba(0,0,0,0.45); border: 1px solid ${mod.color}; font-size: 0.9rem;">
                        <i class="bi bi-map-fill me-1"></i> Open Level Map
                      </button>

                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;

      // Back button
      const backBtn = document.getElementById('cq-modules-back');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
        });
      }

      // Submodule chip clicks
      const subChips = document.querySelectorAll('.cq-submodule-chip');
      subChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const mod = chip.getAttribute('data-mod');
          const sub = chip.getAttribute('data-sub');
          if (window.CortexRouter) {
            window.CortexRouter.navigate('level-map', { module: mod, submodule: sub });
          }
        });
      });

      // Launch buttons
      const launchBtns = document.querySelectorAll('.cq-module-launch');
      launchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const mod = btn.getAttribute('data-mod');
          const sub = btn.getAttribute('data-sub');
          if (window.CortexRouter) {
            window.CortexRouter.navigate('level-map', { module: mod, submodule: sub });
          }
        });
      });
    }
  };
})();
