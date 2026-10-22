/**
 * ============================================================================
 * Cortex Quest — Audio Manager (CortexAudio)
 * ============================================================================
 * Exposes window.CortexAudio
 * Manages Background Music (BGM), Voice Clips, Autoplay Unlocking, Volume & Mute.
 * Wrapped entirely in defensive try/catch to fail completely silently if audio files are absent.
 */

(function () {
  'use strict';

  const AUDIO_BASE_PATH = 'assets/audio/';

  const BGM_TRACKS = {
    'home': 'home-music.mp3.mp3',
    'general-aptitude': 'aptitude-music.mp3.mpeg',
    'data-interpretation': 'data-interpretation-music.mp3',
    'logical-reasoning': 'reasoning-music.mp3.mpeg',
    'general-knowledge': 'general-knowledge-music.mp3',
    'programming': 'programming-music.mp3.mpeg',
    'computer-science': 'computer-science-music.mp3.mpeg',
    'engineering': 'engineering-music.mp3',
    'medical': 'medical-music.mp3.mp3',
    'gameplay': 'gameplay-music.mp3.mp3',
    'victory': 'victory-music.mp3.mp3'
  };

  const VOICE_CLIPS = {
    'welcome': 'welcome.mp3',
    'good': 'good.mp3',
    'great': 'great.mp3',
    'awesome': 'awesome.mp3',
    'excellent': 'excellent.mp3',
    'oops': 'oops.mp3',
    'try-again': 'try-again.mp3',
    'keep-going': 'keep-going.mp3',
    'amazing': 'amazing.mp3',
    'level-complete': 'level-complete.mp3'
  };

  const POSITIVE_VOICES = ['good', 'great', 'awesome', 'excellent', 'amazing'];
  const NEGATIVE_VOICES = ['oops', 'try-again', 'keep-going'];

  // State
  let currentBGMKey = null;
  let currentBGMAudio = null;
  let currentVoiceAudio = null;
  let bgmFadeTimer = null;
  let pendingBGMKey = null;
  let isUnlocked = false;

  let positivePool = [];
  let negativePool = [];

  let volume = 0.7;
  let muted = false;

  const audioCache = {};

  const CortexAudio = {
    /**
     * Initialize audio manager, load settings from store, set up auto-unlock listeners
     */
    init: function () {
      try {
        const player = window.CortexStore ? window.CortexStore.getPlayer() : null;
        if (player && player.settings) {
          if (typeof player.settings.volume === 'number') {
            volume = Math.max(0, Math.min(1, player.settings.volume));
          }
          if (typeof player.settings.muted === 'boolean') {
            muted = player.settings.muted;
          }
        }
      } catch (e) {
        // Safe fallback
      }

      // Attach one-time unlock listeners on user interaction
      const unlockHandler = function () {
        CortexAudio.unlock();
        ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
          document.removeEventListener(evt, unlockHandler);
        });
      };

      ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
        document.addEventListener(evt, unlockHandler, { once: true, passive: true });
      });
    },

    /**
     * Unlock audio playback after user gesture
     */
    unlock: function () {
      isUnlocked = true;
      if (pendingBGMKey) {
        const key = pendingBGMKey;
        pendingBGMKey = null;
        CortexAudio.playBGM(key);
      }
    },

    /**
     * Get or create Audio element for a given source
     */
    getAudioElement: function (src) {
      if (!src) return null;
      if (!audioCache[src]) {
        try {
          const audio = new Audio();
          audio.src = src;
          audio.preload = 'auto';

          // Suppress unhandled network error popups or logs
          audio.onerror = function () {
            // Fail silently
          };

          audioCache[src] = audio;
        } catch (e) {
          return null;
        }
      }
      return audioCache[src];
    },

    /**
     * Play background music track by key
     * @param {string} trackKey 
     */
    playBGM: function (trackKey) {
      try {
        if (!trackKey || !BGM_TRACKS[trackKey]) return;

        // If same track is already playing, do nothing
        if (currentBGMKey === trackKey && currentBGMAudio && !currentBGMAudio.paused) {
          return;
        }

        const filename = BGM_TRACKS[trackKey];
        const fullSrc = AUDIO_BASE_PATH + filename;
        const newAudio = CortexAudio.getAudioElement(fullSrc);

        if (!newAudio) return;

        // Stop current track with fadeout
        CortexAudio.stopBGM(400);

        currentBGMKey = trackKey;
        currentBGMAudio = newAudio;
        currentBGMAudio.loop = true;
        currentBGMAudio.muted = muted;
        currentBGMAudio.volume = muted ? 0 : volume;

        const playPromise = currentBGMAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            // Autoplay blocked by browser policy
            pendingBGMKey = trackKey;
          });
        }
      } catch (e) {
        // Fail silently
      }
    },

    /**
     * Stop currently playing BGM with optional fade out
     * @param {number} [fadeDuration=500] 
     */
    stopBGM: function (fadeDuration) {
      try {
        if (bgmFadeTimer) {
          clearInterval(bgmFadeTimer);
          bgmFadeTimer = null;
        }

        if (!currentBGMAudio) return;

        const audioToStop = currentBGMAudio;
        const dur = typeof fadeDuration === 'number' ? fadeDuration : 500;

        if (dur <= 0 || audioToStop.paused) {
          audioToStop.pause();
          audioToStop.currentTime = 0;
          if (currentBGMAudio === audioToStop) {
            currentBGMAudio = null;
            currentBGMKey = null;
          }
          return;
        }

        const startVol = audioToStop.volume;
        const stepTime = 50;
        const steps = Math.max(1, Math.floor(dur / stepTime));
        const volStep = startVol / steps;

        bgmFadeTimer = setInterval(() => {
          try {
            if (audioToStop.volume > volStep) {
              audioToStop.volume = Math.max(0, audioToStop.volume - volStep);
            } else {
              clearInterval(bgmFadeTimer);
              bgmFadeTimer = null;
              audioToStop.pause();
              audioToStop.currentTime = 0;
              if (currentBGMAudio === audioToStop) {
                currentBGMAudio = null;
                currentBGMKey = null;
              }
            }
          } catch (err) {
            clearInterval(bgmFadeTimer);
            bgmFadeTimer = null;
          }
        }, stepTime);
      } catch (e) {
        // Fail silently
      }
    },

    /**
     * Pause BGM without resetting currentTime
     */
    pauseBGM: function () {
      try {
        if (currentBGMAudio && !currentBGMAudio.paused) {
          currentBGMAudio.pause();
        }
      } catch (e) {
        // Fail silently
      }
    },

    /**
     * Resume BGM playback
     */
    resumeBGM: function () {
      try {
        if (currentBGMAudio && currentBGMAudio.paused) {
          currentBGMAudio.muted = muted;
          currentBGMAudio.volume = muted ? 0 : volume;
          currentBGMAudio.play().catch(() => {});
        } else if (currentBGMKey) {
          CortexAudio.playBGM(currentBGMKey);
        }
      } catch (e) {
        // Fail silently
      }
    },

    /**
     * Play single voice clip without overlapping
     * @param {string} clipKey 
     */
    playVoice: function (clipKey) {
      try {
        if (muted) return;
        if (!clipKey || !VOICE_CLIPS[clipKey]) return;

        // Stop current active voice
        if (currentVoiceAudio) {
          try {
            currentVoiceAudio.pause();
            currentVoiceAudio.currentTime = 0;
          } catch (e) {}
          currentVoiceAudio = null;
        }

        const filename = VOICE_CLIPS[clipKey];
        const fullSrc = AUDIO_BASE_PATH + filename;
        const audio = CortexAudio.getAudioElement(fullSrc);

        if (!audio) return;

        audio.currentTime = 0;
        audio.volume = 1.0;
        audio.muted = false;
        currentVoiceAudio = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browser blocked or missing file; fail silently
          });
        }
      } catch (e) {
        // Fail silently
      }
    },

    /**
     * Pick next unused positive clip (cycles through all before repeating)
     */
    playCorrectVoice: function () {
      try {
        if (positivePool.length === 0) {
          positivePool = POSITIVE_VOICES.slice();
          if (window.CortexUtils && typeof window.CortexUtils.shuffleArray === 'function') {
            positivePool = window.CortexUtils.shuffleArray(positivePool);
          }
        }
        const clip = positivePool.pop();
        if (clip) {
          CortexAudio.playVoice(clip);
        }
      } catch (e) {
        // Fail silently
      }
    },

    /**
     * Pick next unused negative clip (cycles through all before repeating)
     */
    playWrongVoice: function () {
      try {
        if (negativePool.length === 0) {
          negativePool = NEGATIVE_VOICES.slice();
          if (window.CortexUtils && typeof window.CortexUtils.shuffleArray === 'function') {
            negativePool = window.CortexUtils.shuffleArray(negativePool);
          }
        }
        const clip = negativePool.pop();
        if (clip) {
          CortexAudio.playVoice(clip);
        }
      } catch (e) {
        // Fail silently
      }
    },

    /**
     * Set BGM volume (0 - 1)
     */
    setVolume: function (vol) {
      try {
        volume = Math.max(0, Math.min(1, Number(vol) || 0));
        if (currentBGMAudio && !muted) {
          currentBGMAudio.volume = volume;
        }

        if (window.CortexStore && window.CortexStore.getPlayer()) {
          window.CortexStore.updatePlayer({
            settings: { volume: volume }
          });
        }
      } catch (e) {
        // Fail silently
      }
    },

    /**
     * Set mute state
     */
    setMuted: function (isMuted) {
      try {
        muted = Boolean(isMuted);
        if (currentBGMAudio) {
          currentBGMAudio.muted = muted;
          currentBGMAudio.volume = muted ? 0 : volume;
        }
        if (currentVoiceAudio && muted) {
          currentVoiceAudio.pause();
        }

        if (window.CortexStore && window.CortexStore.getPlayer()) {
          window.CortexStore.updatePlayer({
            settings: { muted: muted }
          });
        }
      } catch (e) {
        // Fail silently
      }
    },

    /**
     * Get mute status
     */
    isMuted: function () {
      return muted;
    },

    /**
     * Get volume setting
     */
    getVolume: function () {
      return volume;
    }
  };

  // Expose on global window
  window.CortexAudio = CortexAudio;

  // Auto-init audio setup
  if (typeof window !== 'undefined') {
    CortexAudio.init();
  }
})();
