// ============================================================
// js/app.js — Application Entry Point (load LAST)
// ============================================================

(function() {
  'use strict';

  // Track load progress for init screen
  function setInitProgress(pct, msg) {
    var bar = document.getElementById('cq-init-bar');
    var loader = document.getElementById('cq-init-loader');
    if (bar) bar.style.width = pct + '%';
    if (loader && msg) {
      var msgEl = loader.querySelector('div:last-child');
      if (msgEl) msgEl.textContent = msg;
    }
  }

  function hideInitLoader() {
    var loader = document.getElementById('cq-init-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.5s';
      setTimeout(function() {
        loader.style.display = 'none';
      }, 500);
    }
  }

  function initApp() {
    try {
      setInitProgress(10, 'Loading theme...');

      // 1. Initialize theme
      if (window.CortexTheme) CortexTheme.init();

      setInitProgress(25, 'Setting up audio...');

      // 2. Initialize audio
      if (window.CortexAudio) CortexAudio.init();

      setInitProgress(40, 'Building navigation...');

      // 3. Initialize router
      if (!window.CortexRouter) {
        console.error('CortexRouter not loaded');
        return;
      }
      CortexRouter.init();

      setInitProgress(55, 'Loading game data...');

      // 4. Initialize gamification
      if (window.CortexGamification) CortexGamification.init();

      setInitProgress(70, 'Registering pages...');

      // 5. Register all routes
      CortexRouter.registerPage('splash', function() {
        if (window.PageSplash) PageSplash.render();
      });
      CortexRouter.registerPage('login', function() {
        if (window.PageAuth) PageAuth.render('login');
      });
      CortexRouter.registerPage('register', function() {
        if (window.PageAuth) PageAuth.render('register');
      });
      CortexRouter.registerPage('dashboard', function() {
        if (!CortexAuth.isLoggedIn()) { CortexRouter.navigate('login'); return; }
        if (window.PageDashboard) PageDashboard.render();
      });
      CortexRouter.registerPage('modules', function() {
        if (!CortexAuth.isLoggedIn()) { CortexRouter.navigate('login'); return; }
        if (window.PageModules) PageModules.render();
      });
      CortexRouter.registerPage('level-map', function() {
        if (!CortexAuth.isLoggedIn()) { CortexRouter.navigate('login'); return; }
        var p = CortexRouter.getCurrentParams();
        if (window.PageLevelMap) PageLevelMap.render(p.module, p.submodule);
      });
      CortexRouter.registerPage('quiz', function() {
        if (!CortexAuth.isLoggedIn()) { CortexRouter.navigate('login'); return; }
        var p = CortexRouter.getCurrentParams();
        if (window.PageQuizScreen) PageQuizScreen.render(p.module, p.submodule, parseInt(p.level) || 1, p.difficulty || 'medium');
      });
      CortexRouter.registerPage('results', function() {
        var p = CortexRouter.getCurrentParams();
        if (window.PageResults) PageResults.render(p.module, p.submodule, parseInt(p.level) || 1);
      });
      CortexRouter.registerPage('achievements', function() {
        if (!CortexAuth.isLoggedIn()) { CortexRouter.navigate('login'); return; }
        if (window.PageAchievements) PageAchievements.render();
      });
      CortexRouter.registerPage('leaderboard', function() {
        if (window.PageLeaderboard) PageLeaderboard.render();
      });
      CortexRouter.registerPage('store', function() {
        if (!CortexAuth.isLoggedIn()) { CortexRouter.navigate('login'); return; }
        if (window.PageStore) PageStore.render();
      });
      CortexRouter.registerPage('mock-test', function() {
        if (!CortexAuth.isLoggedIn()) { CortexRouter.navigate('login'); return; }
        if (window.PageMockTest) PageMockTest.render();
      });
      CortexRouter.registerPage('brain-training', function() {
        if (!CortexAuth.isLoggedIn()) { CortexRouter.navigate('login'); return; }
        if (window.PageBrainTraining) PageBrainTraining.render();
      });
      CortexRouter.registerPage('profile', function() {
        if (!CortexAuth.isLoggedIn()) { CortexRouter.navigate('login'); return; }
        if (window.PageProfile) PageProfile.render();
      });
      CortexRouter.registerPage('daily-challenge', function() {
        if (!CortexAuth.isLoggedIn()) { CortexRouter.navigate('login'); return; }
        if (window.PageDailyChallenge) PageDailyChallenge.render();
      });

      setInitProgress(85, 'Unlocking adventure...');

      // 6. Global event listeners
      // Unlock audio on first interaction
      var audioUnlocked = false;
      function unlockAudio() {
        if (!audioUnlocked) {
          audioUnlocked = true;
          if (window.CortexAudio) CortexAudio.unlock();
        }
      }
      document.addEventListener('click', unlockAudio, { once: true });
      document.addEventListener('keydown', unlockAudio, { once: true });
      document.addEventListener('touchstart', unlockAudio, { once: true });

      // Global error handler (silent, no crash)
      window.addEventListener('error', function(e) {
        console.error('[CortexQuest Error]', e.message, e.filename, e.lineno);
      });
      window.addEventListener('unhandledrejection', function(e) {
        console.error('[CortexQuest Unhandled Promise]', e.reason);
      });

      setInitProgress(95, 'Ready!');

      // 7. Determine initial route
      setTimeout(function() {
        setInitProgress(100, 'Launching...');
        hideInitLoader();

        // If hash is already set to something, let router handle it
        var currentHash = window.location.hash;
        var hasRoute = currentHash && currentHash.length > 2;

        if (hasRoute) {
          // Router will handle it via hashchange or manual call
          CortexRouter.onHashChange();
        } else {
          // Navigate to initial page
          if (window.CortexAuth && CortexAuth.isLoggedIn()) {
            CortexRouter.navigate('dashboard');
          } else {
            CortexRouter.navigate('splash');
          }
        }
      }, 300);

    } catch (err) {
      console.error('[CortexQuest] Fatal initialization error:', err);
      hideInitLoader();
      document.getElementById('cq-main').innerHTML = `
        <div style="
          min-height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:1rem;
          background:#0d1a05; color:#e8f0d8; font-family:'Inter',sans-serif;
          padding:2rem; text-align:center;
        ">
          <div style="font-size:3rem;">⚠️</div>
          <h2 style="color:#d4a017;">Cortex Quest failed to start</h2>
          <p style="color:rgba(232,240,216,0.6); max-width:400px;">${err.message || 'An unexpected error occurred during initialization.'}</p>
          <button onclick="location.reload()" style="
            padding:0.75rem 2rem; background:linear-gradient(135deg,#3A5311,#4d6e18);
            border:none; border-radius:8px; color:#fff; font-size:1rem;
            cursor:pointer; font-family:'Outfit',sans-serif; font-weight:600;
          ">🔄 Reload</button>
          <details style="margin-top:1rem; text-align:left; max-width:600px;">
            <summary style="cursor:pointer; color:#7a9a5c;">Technical details</summary>
            <pre style="color:rgba(232,240,216,0.4); font-size:0.75rem; margin-top:0.5rem; white-space:pre-wrap;">${err.stack || err}</pre>
          </details>
        </div>
      `;
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
