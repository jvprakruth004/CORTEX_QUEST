(function() {
  'use strict';

  window.PageAuth = {
    render: function(mode = 'login') {
      const main = document.getElementById('cq-main');
      if (!main) return;

      const isLogin = mode === 'login';

      main.innerHTML = `
        <div class="cq-auth-page min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative overflow-hidden" style="background: radial-gradient(circle at center top, #1a2d0a 0%, #0d1a05 75%, #050a02 100%);">
          <!-- Background decorative glow -->
          <div class="position-absolute" style="top: -100px; left: 50%; transform: translateX(-50%); width: 600px; height: 350px; background: radial-gradient(circle, rgba(58, 83, 17, 0.4) 0%, transparent 70%); filter: blur(50px); pointer-events: none;"></div>

          <div class="cq-card p-4 p-md-5 position-relative z-1 animate-slide-up shadow-xl" style="width: 100%; max-width: 460px; background: rgba(26, 45, 10, 0.9); border: 1px solid rgba(122, 154, 92, 0.35); border-radius: var(--cq-radius-lg, 18px); backdrop-filter: blur(16px); box-shadow: 0 16px 40px rgba(0,0,0,0.6);">
            <!-- Logo Header -->
            <div class="text-center mb-4">
              <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style="width: 68px; height: 68px; background: linear-gradient(135deg, #4d6e18 0%, #2a3d0c 100%); border: 2px solid #7a9a5c; box-shadow: 0 0 20px rgba(122, 154, 92, 0.5);">
                <i class="bi bi-cpu text-light" style="font-size: 2rem;"></i>
              </div>
              <h2 class="h3 fw-bold mb-1" style="font-family: var(--cq-font-heading, sans-serif); color: #f5f0e8; letter-spacing: 0.5px;">
                CORTEX <span style="color: var(--cq-gold-light, #f0c040);">QUEST</span>
              </h2>
              <p class="small text-muted" style="color: var(--cq-text-secondary, #a0b88d) !important;">
                ${isLogin ? 'Enter your credentials to resume your journey' : 'Create an account to track your progress & rank'}
              </p>
            </div>

            <!-- Mode Switcher Tabs -->
            <div class="d-flex rounded-pill p-1 mb-4" style="background: rgba(13, 26, 5, 0.7); border: 1px solid rgba(122, 154, 92, 0.2);">
              <button id="cq-tab-login" class="btn btn-sm w-50 rounded-pill fw-semibold transition-fast ${isLogin ? 'btn-success text-white' : 'text-muted'}" style="${isLogin ? 'background: #3A5311; border-color: #4d6e18;' : 'background: transparent; border: none;'}">
                <i class="bi bi-box-arrow-in-right me-1"></i> Log In
              </button>
              <button id="cq-tab-register" class="btn btn-sm w-50 rounded-pill fw-semibold transition-fast ${!isLogin ? 'btn-success text-white' : 'text-muted'}" style="${!isLogin ? 'background: #3A5311; border-color: #4d6e18;' : 'background: transparent; border: none;'}">
                <i class="bi bi-person-plus me-1"></i> Register
              </button>
            </div>

            <!-- Error Banner -->
            <div id="cq-auth-error" class="alert alert-danger py-2 px-3 small d-none animate-shake" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; border-radius: var(--cq-radius-sm, 8px);"></div>

            <!-- Forms Container -->
            ${isLogin ? `
              <!-- LOGIN FORM -->
              <form id="cq-login-form" autocomplete="on">
                <div class="mb-3">
                  <label for="cq-login-user" class="form-label small fw-semibold" style="color: var(--cq-text-secondary, #a0b88d);">Username or Email</label>
                  <div class="input-group">
                    <span class="input-group-text border-end-0" style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #7a9a5c;"><i class="bi bi-person"></i></span>
                    <input type="text" id="cq-login-user" class="form-control border-start-0" placeholder="Enter username" required style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #e8f0d8;" autofocus>
                  </div>
                </div>

                <div class="mb-4">
                  <label for="cq-login-pass" class="form-label small fw-semibold" style="color: var(--cq-text-secondary, #a0b88d);">Password</label>
                  <div class="input-group">
                    <span class="input-group-text border-end-0" style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #7a9a5c;"><i class="bi bi-lock"></i></span>
                    <input type="password" id="cq-login-pass" class="form-control border-start-0 border-end-0" placeholder="••••••••" required style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #e8f0d8;">
                    <button type="button" id="cq-toggle-login-pass" class="btn border-start-0" style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #7a9a5c;"><i class="bi bi-eye"></i></button>
                  </div>
                </div>

                <button type="submit" id="cq-login-btn" class="btn w-100 fw-bold py-2 mb-3 shadow" style="background: linear-gradient(135deg, #4d6e18 0%, #3A5311 100%); color: #fff; border: 1px solid #7a9a5c; border-radius: var(--cq-radius-md, 12px); box-shadow: 0 4px 15px rgba(58, 83, 17, 0.5);">
                  <i class="bi bi-box-arrow-in-right me-1"></i> Log In to Quest
                </button>
              </form>
            ` : `
              <!-- REGISTER FORM -->
              <form id="cq-register-form" autocomplete="on">
                <div class="mb-3">
                  <label for="cq-reg-user" class="form-label small fw-semibold" style="color: var(--cq-text-secondary, #a0b88d);">Username (3-20 characters)</label>
                  <div class="input-group">
                    <span class="input-group-text border-end-0" style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #7a9a5c;"><i class="bi bi-person"></i></span>
                    <input type="text" id="cq-reg-user" class="form-control border-start-0" placeholder="Choose username" minlength="3" maxlength="20" required style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #e8f0d8;" autofocus>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="cq-reg-email" class="form-label small fw-semibold" style="color: var(--cq-text-secondary, #a0b88d);">Email Address</label>
                  <div class="input-group">
                    <span class="input-group-text border-end-0" style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #7a9a5c;"><i class="bi bi-envelope"></i></span>
                    <input type="email" id="cq-reg-email" class="form-control border-start-0" placeholder="name@example.com" required style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #e8f0d8;">
                  </div>
                </div>

                <div class="mb-3">
                  <label for="cq-reg-pass" class="form-label small fw-semibold" style="color: var(--cq-text-secondary, #a0b88d);">Password (min 8 chars)</label>
                  <div class="input-group">
                    <span class="input-group-text border-end-0" style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #7a9a5c;"><i class="bi bi-lock"></i></span>
                    <input type="password" id="cq-reg-pass" class="form-control border-start-0 border-end-0" placeholder="••••••••" minlength="8" required style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #e8f0d8;">
                    <button type="button" id="cq-toggle-reg-pass" class="btn border-start-0" style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #7a9a5c;"><i class="bi bi-eye"></i></button>
                  </div>
                </div>

                <div class="mb-4">
                  <label for="cq-reg-pass-confirm" class="form-label small fw-semibold" style="color: var(--cq-text-secondary, #a0b88d);">Confirm Password</label>
                  <div class="input-group">
                    <span class="input-group-text border-end-0" style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #7a9a5c;"><i class="bi bi-shield-check"></i></span>
                    <input type="password" id="cq-reg-pass-confirm" class="form-control border-start-0" placeholder="••••••••" minlength="8" required style="background: rgba(13, 26, 5, 0.8); border-color: rgba(122, 154, 92, 0.3); color: #e8f0d8;">
                  </div>
                </div>

                <button type="submit" id="cq-register-btn" class="btn w-100 fw-bold py-2 mb-3 shadow" style="background: linear-gradient(135deg, #4d6e18 0%, #3A5311 100%); color: #fff; border: 1px solid #7a9a5c; border-radius: var(--cq-radius-md, 12px); box-shadow: 0 4px 15px rgba(58, 83, 17, 0.5);">
                  <i class="bi bi-person-check me-1"></i> Create Quest Account
                </button>
              </form>
            `}

            <!-- Divider -->
            <div class="position-relative my-3 text-center">
              <hr style="border-color: rgba(122, 154, 92, 0.25);">
              <span class="position-absolute top-50 start-50 translate-middle px-3 small" style="background: #1a2d0a; color: var(--cq-text-muted, #6c845b);">OR</span>
            </div>

            <!-- Guest Play Option -->
            <button type="button" id="cq-guest-btn" class="btn w-100 py-2 fw-semibold" style="background: rgba(13, 26, 5, 0.8); color: var(--cq-sage-light, #9ab87e); border: 1px dashed rgba(122, 154, 92, 0.45); border-radius: var(--cq-radius-md, 12px);">
              <i class="bi bi-controller me-2"></i> Play Instantly as Guest
            </button>
          </div>
        </div>
      `;

      // Wire tab switches
      const tabLogin = document.getElementById('cq-tab-login');
      const tabReg = document.getElementById('cq-tab-register');
      if (tabLogin) tabLogin.addEventListener('click', () => {
        if (window.CortexRouter) window.CortexRouter.navigate('login');
        else window.PageAuth.render('login');
      });
      if (tabReg) tabReg.addEventListener('click', () => {
        if (window.CortexRouter) window.CortexRouter.navigate('register');
        else window.PageAuth.render('register');
      });

      // Error helper
      const errorBox = document.getElementById('cq-auth-error');
      const showError = (msg) => {
        if (errorBox) {
          errorBox.textContent = msg;
          errorBox.classList.remove('d-none');
        }
      };

      // Toggle password visibility
      const setupPassToggle = (btnId, inputId) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (btn && input) {
          btn.addEventListener('click', () => {
            const isText = input.type === 'text';
            input.type = isText ? 'password' : 'text';
            btn.innerHTML = `<i class="bi bi-eye${isText ? '' : '-slash'}"></i>`;
          });
        }
      };

      setupPassToggle('cq-toggle-login-pass', 'cq-login-pass');
      setupPassToggle('cq-toggle-reg-pass', 'cq-reg-pass');

      // Login form handler
      const loginForm = document.getElementById('cq-login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const userVal = document.getElementById('cq-login-user').value.trim();
          const passVal = document.getElementById('cq-login-pass').value;
          const submitBtn = loginForm.querySelector('button[type="submit"]');

          if (!userVal || !passVal) {
            showError('Please enter both username and password.');
            return;
          }

          if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Signing in...'; }

          if (window.CortexAuth && window.CortexAuth.login) {
            try {
              const result = await window.CortexAuth.login(userVal, passVal);
              if (result && result.success) {
                if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
              } else {
                showError((result && result.message) || 'Invalid username or password.');
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Log In to Quest'; }
              }
            } catch(err) {
              showError('Login error. Please try again.');
              if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Log In to Quest'; }
            }
          } else {
            // Fallback if no auth engine
            if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
          }
        });
      }

      // Register form handler
      const regForm = document.getElementById('cq-register-form');
      if (regForm) {
        regForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const userVal = document.getElementById('cq-reg-user').value.trim();
          const emailVal = document.getElementById('cq-reg-email').value.trim();
          const passVal = document.getElementById('cq-reg-pass').value;
          const confirmVal = document.getElementById('cq-reg-pass-confirm').value;
          const submitBtn = regForm.querySelector('button[type="submit"]');

          if (userVal.length < 3 || userVal.length > 20) {
            showError('Username must be between 3 and 20 characters.');
            return;
          }
          if (!/^[a-zA-Z0-9_]+$/.test(userVal)) {
            showError('Username can only contain letters, numbers, and underscores.');
            return;
          }
          if (passVal.length < 8) {
            showError('Password must be at least 8 characters long.');
            return;
          }
          if (passVal !== confirmVal) {
            showError('Passwords do not match.');
            return;
          }

          if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating account...'; }

          if (window.CortexAuth && window.CortexAuth.register) {
            try {
              const result = await window.CortexAuth.register(userVal, passVal, emailVal);
              if (result && result.success) {
                if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
              } else {
                showError((result && result.message) || 'Registration failed. Username may already exist.');
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="bi bi-person-check me-1"></i> Create Account'; }
              }
            } catch(err) {
              showError('Registration error. Please try again.');
              if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="bi bi-person-check me-1"></i> Create Account'; }
            }
          } else {
            if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
          }
        });
      }

      // Guest Play Handler
      const guestBtn = document.getElementById('cq-guest-btn');
      if (guestBtn) {
        guestBtn.addEventListener('click', () => {
          if (window.CortexAuth && window.CortexAuth.loginAsGuest) {
            window.CortexAuth.loginAsGuest();
          }
          if (window.CortexRouter) {
            window.CortexRouter.navigate('dashboard');
          }
        });
      }
    }
  };
})();
