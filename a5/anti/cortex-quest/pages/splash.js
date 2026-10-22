// ============================================================
// pages/splash.js — Animated Splash / Welcome Screen
// ============================================================

window.PageSplash = (function() {
  'use strict';

  var splashTimer = null;

  function render() {
    if (window.CortexRouter) CortexRouter.setTitle('Cortex Quest — Welcome');
    if (window.CortexAudio) CortexAudio.playBGM('home');

    var main = document.getElementById('cq-main');
    main.innerHTML = `
      <div class="cq-splash-page" id="cq-splash" style="
        position:fixed; inset:0; background:#0d1a05;
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        overflow:hidden; z-index:100;
      ">
        <!-- Particle background -->
        <div id="splash-particles" style="position:absolute; inset:0; pointer-events:none; overflow:hidden;"></div>

        <!-- Skip button -->
        <button id="splash-skip" onclick="window.PageSplash.skip()" style="
          position:absolute; top:1.5rem; right:1.5rem;
          background:rgba(58,83,17,0.3); border:1px solid rgba(122,154,92,0.3);
          color:rgba(232,240,216,0.7); padding:0.4rem 1rem; border-radius:999px;
          cursor:pointer; font-family:'Inter',sans-serif; font-size:0.85rem;
          transition:all 0.2s; z-index:10;
        " onmouseover="this.style.background='rgba(58,83,17,0.6)'" onmouseout="this.style.background='rgba(58,83,17,0.3)'">
          Skip ›
        </button>

        <!-- Logo + rings -->
        <div style="position:relative; display:flex; flex-direction:column; align-items:center; gap:2rem; z-index:5;">
          <!-- Pulsing energy rings -->
          <div style="position:absolute; inset:50%; transform:translate(-50%,-50%);">
            <div class="splash-ring" style="
              position:absolute; border-radius:50%; border:2px solid rgba(58,83,17,0.6);
              animation:splashRing 3s ease-out infinite;
              width:120px; height:120px; top:50%; left:50%;
              transform:translate(-50%,-50%);
            "></div>
            <div class="splash-ring" style="
              position:absolute; border-radius:50%; border:2px solid rgba(122,154,92,0.4);
              animation:splashRing 3s ease-out infinite 0.5s;
              width:180px; height:180px; top:50%; left:50%;
              transform:translate(-50%,-50%);
            "></div>
            <div class="splash-ring" style="
              position:absolute; border-radius:50%; border:1px solid rgba(212,160,23,0.3);
              animation:splashRing 3s ease-out infinite 1s;
              width:240px; height:240px; top:50%; left:50%;
              transform:translate(-50%,-50%);
            "></div>
          </div>

          <!-- Brain logo -->
          <div style="
            width:100px; height:100px; border-radius:50%;
            background:linear-gradient(135deg,#1a2d0a,#3A5311);
            border:3px solid #7a9a5c;
            box-shadow: 0 0 30px rgba(58,83,17,0.8), 0 0 60px rgba(122,154,92,0.3);
            display:flex; align-items:center; justify-content:center;
            font-size:3rem; animation:glowPulse 2s ease-in-out infinite;
            position:relative; z-index:2;
          ">🧠</div>

          <!-- Title -->
          <div style="text-align:center; z-index:2;">
            <h1 style="
              font-family:'Outfit',sans-serif; font-size:clamp(2.5rem,6vw,4rem);
              font-weight:900; letter-spacing:4px; margin:0;
              background:linear-gradient(135deg,#7a9a5c,#d4a017,#7a9a5c);
              background-size:200% 100%;
              -webkit-background-clip:text; -webkit-text-fill-color:transparent;
              background-clip:text;
              animation:shimmer 3s ease-in-out infinite;
              text-shadow:none;
            ">CORTEX QUEST</h1>
            <p style="
              font-family:'Inter',sans-serif; font-size:clamp(0.9rem,2vw,1.1rem);
              color:rgba(232,240,216,0.7); margin:0.5rem 0 0 0; letter-spacing:2px;
              font-style:italic;
            ">Train Your Mind. Conquer Every Challenge.</p>
          </div>

          <!-- Version / loading info -->
          <div style="
            font-size:0.75rem; color:rgba(232,240,216,0.35);
            font-family:'Inter',sans-serif; letter-spacing:1px; z-index:2;
          ">v1.0 · 8 Modules · 1,200 Levels</div>
        </div>

        <!-- Loading bar at bottom -->
        <div style="
          position:absolute; bottom:3rem; left:50%; transform:translateX(-50%);
          width:min(300px,80vw); display:flex; flex-direction:column; align-items:center; gap:0.75rem;
        ">
          <div style="
            width:100%; height:3px; background:rgba(58,83,17,0.3);
            border-radius:999px; overflow:hidden;
          ">
            <div id="splash-load-bar" style="
              height:100%; width:0%;
              background:linear-gradient(90deg,#3A5311,#d4a017);
              border-radius:999px; transition:width 0.1s;
            "></div>
          </div>
          <div id="splash-load-text" style="
            font-family:'Inter',sans-serif; font-size:0.75rem;
            color:rgba(232,240,216,0.4); letter-spacing:1px;
          ">Loading your adventure...</div>
        </div>

        <!-- Start prompt (appears after bar fills) -->
        <button id="splash-start" onclick="window.PageSplash.skip()" style="
          display:none; position:absolute; bottom:3rem;
          background:linear-gradient(135deg,#3A5311,#4d6e18);
          border:1px solid rgba(122,154,92,0.4); color:#e8f0d8;
          padding:0.85rem 3rem; border-radius:999px; font-size:1rem;
          font-family:'Outfit',sans-serif; font-weight:700; cursor:pointer;
          box-shadow:0 0 20px rgba(58,83,17,0.6); letter-spacing:1px;
          transition:all 0.3s; animation:glowPulse 2s ease-in-out infinite;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          ⚔️ Begin Quest
        </button>
      </div>

      <style>
        @keyframes splashRing {
          0% { transform:translate(-50%,-50%) scale(0.5); opacity:0.8; }
          100% { transform:translate(-50%,-50%) scale(2.5); opacity:0; }
        }
      </style>
    `;

    // Create particles
    createSplashParticles();

    // Animate loading bar
    var bar = document.getElementById('splash-load-bar');
    var txt = document.getElementById('splash-load-text');
    var steps = [
      { pct: 20, msg: 'Loading modules...' },
      { pct: 45, msg: 'Initializing game engine...' },
      { pct: 70, msg: 'Preparing questions...' },
      { pct: 90, msg: 'Almost ready...' },
      { pct: 100, msg: 'Ready!' }
    ];
    var stepIdx = 0;
    var barInterval = setInterval(function() {
      if (stepIdx >= steps.length) {
        clearInterval(barInterval);
        // Show start button
        var startBtn = document.getElementById('splash-start');
        var loadBar = document.querySelector('#cq-splash > div:last-child');
        if (startBtn) {
          if (loadBar) loadBar.style.display = 'none';
          startBtn.style.display = 'block';
          startBtn.style.animation = 'glowPulse 2s ease-in-out infinite, bounceIn 0.5s ease-out';
        }
        return;
      }
      var step = steps[stepIdx++];
      if (bar) bar.style.width = step.pct + '%';
      if (txt) txt.textContent = step.msg;
    }, 400);

    // Auto-navigate after 3.5s
    if (splashTimer) clearTimeout(splashTimer);
    splashTimer = setTimeout(function() {
      skip();
    }, 3500);
  }

  function createSplashParticles() {
    var container = document.getElementById('splash-particles');
    if (!container) return;
    for (var i = 0; i < 40; i++) {
      var p = document.createElement('div');
      var size = Math.random() * 3 + 1;
      var x = Math.random() * 100;
      var delay = Math.random() * 5;
      var duration = Math.random() * 10 + 5;
      p.style.cssText = `
        position:absolute;
        width:${size}px; height:${size}px;
        border-radius:50%;
        background:rgba(${Math.random() > 0.5 ? '122,154,92' : '212,160,23'},${Math.random() * 0.5 + 0.1});
        left:${x}%;
        bottom:-10px;
        animation:coinFloat ${duration}s ease-in-out infinite ${delay}s;
        pointer-events:none;
      `;
      container.appendChild(p);
    }
  }

  function skip() {
    if (splashTimer) { clearTimeout(splashTimer); splashTimer = null; }
    if (window.CortexAuth && CortexAuth.isLoggedIn()) {
      CortexRouter.navigate('dashboard');
    } else {
      CortexRouter.navigate('login');
    }
  }

  return { render: render, skip: skip };
})();
