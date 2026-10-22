/**
 * ============================================================================
 * Cortex Quest — Leaderboard Engine & Renderer (CortexLeaderboard)
 * ============================================================================
 * Exposes window.CortexLeaderboard
 * Manages player rankings, AI opponent integration, and responsive UI rendering.
 */

(function () {
  'use strict';

  function ensureLeaderboardStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('cq-leaderboard-styles')) return;

    const style = document.createElement('style');
    style.id = 'cq-leaderboard-styles';
    style.textContent = `
      .cq-lb-wrapper {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
      }
      .cq-lb-banner {
        background: linear-gradient(135deg, rgba(26, 45, 10, 0.95), rgba(58, 83, 17, 0.4));
        border: 1px solid rgba(122, 154, 92, 0.35);
        border-radius: 16px;
        padding: 20px 24px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .cq-lb-table-container {
        background: rgba(20, 34, 8, 0.7);
        border: 1px solid rgba(122, 154, 92, 0.25);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      }
      .cq-lb-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.95rem;
      }
      .cq-lb-table th {
        background: rgba(26, 45, 10, 0.95);
        color: #a0b88d;
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(58, 83, 17, 0.4);
      }
      .cq-lb-table td {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(58, 83, 17, 0.2);
        color: #e8f0d8;
        vertical-align: middle;
      }
      .cq-lb-table tr:last-child td {
        border-bottom: none;
      }
      .cq-lb-table tr:hover {
        background: rgba(58, 83, 17, 0.15);
      }
      .cq-lb-current-user {
        background: rgba(58, 83, 17, 0.35) !important;
        box-shadow: inset 3px 0 0 #d4a017;
      }
      .cq-rank-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-weight: 800;
        font-size: 0.9rem;
      }
      .cq-rank-1 { background: #d4a017; color: #0d1a05; box-shadow: 0 0 12px rgba(212, 160, 23, 0.5); }
      .cq-rank-2 { background: #94a3b8; color: #0d1a05; }
      .cq-rank-3 { background: #b45309; color: #f5f0e8; }
      .cq-rank-other { background: rgba(255, 255, 255, 0.08); color: #a0b88d; }
      .cq-ai-tag {
        background: rgba(6, 182, 212, 0.15);
        color: #38bdf8;
        border: 1px solid rgba(6, 182, 212, 0.4);
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 0.725rem;
        font-weight: 700;
        margin-left: 8px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .cq-you-tag {
        background: rgba(34, 197, 94, 0.2);
        color: #4ade80;
        border: 1px solid rgba(34, 197, 94, 0.4);
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 0.725rem;
        font-weight: 700;
        margin-left: 8px;
        text-transform: uppercase;
      }
      .cq-guest-tag {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.4);
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 0.725rem;
        font-weight: 600;
        margin-left: 8px;
      }
      @media (max-width: 640px) {
        .cq-lb-table th, .cq-lb-table td {
          padding: 12px 14px;
        }
        .cq-hide-sm {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const CortexLeaderboard = {
    /**
     * Get sorted array of leaderboard entries
     * Combines all real registered users and realistic AI opponents
     * @returns {Array<object>} Sorted entries with assigned ranks
     */
    getEntries: function () {
      if (window.CortexStore && typeof window.CortexStore.getLeaderboard === 'function') {
        return window.CortexStore.getLeaderboard();
      }
      return [];
    },

    /**
     * Get rank number of current logged-in user
     * @returns {number|null} Rank number or null if not found
     */
    getPlayerRank: function () {
      const currentUsername = window.CortexStore ? window.CortexStore.getCurrentUser() : null;
      if (!currentUsername) return null;

      const entries = CortexLeaderboard.getEntries();
      const match = entries.find(e => e.username === currentUsername);
      return match ? match.rank : null;
    },

    /**
     * Render responsive leaderboard component into target container
     * @param {string|HTMLElement} containerId 
     */
    renderLeaderboard: function (containerId) {
      ensureLeaderboardStyles();

      const container = typeof containerId === 'string'
        ? document.getElementById(containerId)
        : containerId;

      if (!container) return;

      const entries = CortexLeaderboard.getEntries().slice(0, 100);
      const currentUsername = window.CortexStore ? window.CortexStore.getCurrentUser() : null;
      const isGuest = window.CortexAuth ? window.CortexAuth.isGuest() : false;
      const playerRank = CortexLeaderboard.getPlayerRank();

      let guestBannerHtml = '';
      if (isGuest) {
        guestBannerHtml = `
          <div class="cq-lb-banner">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 1.25rem;">🎮</span>
                <strong style="color: #fbbf24; font-size: 1rem;">Guest Session Active</strong>
              </div>
              <p style="color: #a0b88d; font-size: 0.9rem; margin: 0;">
                Your progress is temporary. Create a free scholar account to cement your official place on the Hall of Fame!
              </p>
            </div>
            <button id="cq-lb-guest-register-btn" style="
              background: #3A5311;
              color: #f5f0e8;
              border: 1px solid #7a9a5c;
              padding: 10px 20px;
              border-radius: 10px;
              font-weight: 700;
              font-size: 0.9rem;
              cursor: pointer;
              white-space: nowrap;
            ">Claim Your Rank</button>
          </div>
        `;
      } else if (playerRank) {
        guestBannerHtml = `
          <div class="cq-lb-banner">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 1.25rem;">🏅</span>
                <strong style="color: #e8f0d8; font-size: 1rem;">Your Current Standing</strong>
              </div>
              <p style="color: #a0b88d; font-size: 0.9rem; margin: 0;">
                You are currently ranked <strong style="color: #d4a017;">#${playerRank}</strong> among scholars and neural challengers.
              </p>
            </div>
            <div style="text-align: right;">
              <span style="color: #c084fc; font-weight: 700; font-size: 1.1rem;">
                ${window.CortexPlayer ? window.CortexUtils.formatXP(window.CortexPlayer.getXP()) : ''}
              </span>
            </div>
          </div>
        `;
      }

      let rowsHtml = '';
      entries.forEach((item) => {
        const isSelf = currentUsername && item.username === currentUsername;
        let rankClass = 'cq-rank-other';
        if (item.rank === 1) rankClass = 'cq-rank-1';
        else if (item.rank === 2) rankClass = 'cq-rank-2';
        else if (item.rank === 3) rankClass = 'cq-rank-3';

        let badgeTag = '';
        if (item.isAI) {
          badgeTag = '<span class="cq-ai-tag">AI Challenger</span>';
        } else if (isSelf) {
          badgeTag = '<span class="cq-you-tag">You</span>';
        } else if (item.isGuest) {
          badgeTag = '<span class="cq-guest-tag">Guest</span>';
        }

        const titleStr = item.title || (window.CortexPlayer ? window.CortexPlayer.getLevelTitle(item.level) : 'Novice');
        const formattedXP = window.CortexUtils ? window.CortexUtils.formatXP(item.xp) : `${item.xp} XP`;
        const avatar = item.avatar || (window.CortexPlayer ? window.CortexPlayer.getAvatarEmoji(item.level) : '🌱');

        rowsHtml += `
          <tr class="${isSelf ? 'cq-lb-current-user' : ''}">
            <td style="width: 60px; text-align: center;">
              <span class="cq-rank-pill ${rankClass}">${item.rank}</span>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.4rem;">${avatar}</span>
                <div>
                  <div style="font-weight: 700; display: flex; align-items: center; flex-wrap: wrap;">
                    <span>${item.username}</span>
                    ${badgeTag}
                  </div>
                  <div style="font-size: 0.8rem; color: #a0b88d;">
                    Level ${item.level} • <span class="cq-hide-sm">${titleStr}</span>
                  </div>
                </div>
              </div>
            </td>
            <td class="cq-hide-sm" style="text-align: center;">
              <span style="color: #fbbf24; font-weight: 600;">⭐ ${item.stars}</span>
            </td>
            <td style="text-align: right; font-weight: 700; color: #c084fc;">
              ${formattedXP}
            </td>
          </tr>
        `;
      });

      container.innerHTML = `
        <div class="cq-lb-wrapper">
          ${guestBannerHtml}
          <div class="cq-lb-table-container">
            <table class="cq-lb-table">
              <thead>
                <tr>
                  <th style="width: 70px; text-align: center;">Rank</th>
                  <th>Scholar</th>
                  <th class="cq-hide-sm" style="text-align: center; width: 100px;">Stars</th>
                  <th style="text-align: right; width: 120px;">Experience</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Attach register handler if guest button is displayed
      const regBtn = container.querySelector('#cq-lb-guest-register-btn');
      if (regBtn) {
        regBtn.addEventListener('click', () => {
          if (window.CortexRouter) {
            window.CortexRouter.navigate('register');
          } else {
            window.location.hash = '#/register';
          }
        });
      }
    }
  };

  // Expose on global window
  window.CortexLeaderboard = CortexLeaderboard;
})();
