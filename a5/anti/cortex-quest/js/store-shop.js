/**
 * ============================================================================
 * CORTEX QUEST — IN-GAME STORE & INVENTORY (store-shop.js)
 * ============================================================================
 * Exposes window.CortexShop
 * Catalog management, purchasing, inventory tracking, power-ups, and boosts.
 */

(function (window) {
  'use strict';

  // --------------------------------------------------------------------------
  // Catalog Definition
  // --------------------------------------------------------------------------
  const CATALOG = [
    {
      id: 'hint-pack-1',
      name: 'Hint Pack',
      type: 'consumable',
      description: 'Get 1 hint for any question in quiz mode',
      icon: '💡',
      currency: 'coins',
      price: 10,
      quantity: 1,
      targetInventoryKey: 'hints'
    },
    {
      id: 'hint-pack-5',
      name: 'Hint Bundle',
      type: 'consumable',
      description: 'Get 5 hints at a discounted rate',
      icon: '💡',
      currency: 'coins',
      price: 40,
      quantity: 5,
      targetInventoryKey: 'hints'
    },
    {
      id: 'eliminate-1',
      name: 'Option Eliminator',
      type: 'power-up',
      description: 'Eliminate 2 incorrect options from a tough question',
      icon: '❌',
      currency: 'diamonds',
      price: 2,
      quantity: 1,
      targetInventoryKey: 'eliminators'
    },
    {
      id: 'eliminate-5',
      name: 'Eliminator Pack',
      type: 'power-up',
      description: '5× option eliminators for competitive quizzing',
      icon: '❌',
      currency: 'diamonds',
      price: 8,
      quantity: 5,
      targetInventoryKey: 'eliminators'
    },
    {
      id: 'time-freeze',
      name: 'Time Freeze',
      type: 'power-up',
      description: 'Pause the quiz or test timer for 30 seconds',
      icon: '⏸️',
      currency: 'diamonds',
      price: 3,
      quantity: 1,
      targetInventoryKey: 'timeFreeze'
    },
    {
      id: 'double-xp',
      name: 'Double XP Boost',
      type: 'boost',
      description: 'Double XP earned for the next 5 questions',
      icon: '⚡',
      currency: 'diamonds',
      price: 5,
      quantity: 5,
      targetInventoryKey: 'doubleXPQuestions'
    },
    {
      id: 'coin-bonus',
      name: 'Coin Magnet',
      type: 'boost',
      description: 'Instant cache of +50 bonus gold coins',
      icon: '🪙',
      currency: 'coins',
      price: 30,
      quantity: 50,
      targetInventoryKey: 'directCoins'
    },
    {
      id: 'star-saver',
      name: 'Star Shield',
      type: 'power-up',
      description: 'Guarantees a minimum of 2 stars on your next level',
      icon: '⭐',
      currency: 'diamonds',
      price: 4,
      quantity: 1,
      targetInventoryKey: 'starShields'
    }
  ];

  // In-memory fallback if store is not yet initialized
  let fallbackState = {
    inventory: {
      hints: 2,
      eliminators: 1,
      timeFreeze: 1,
      starShields: 0
    },
    activeBoosts: {
      doubleXPQuestions: 0,
      starShieldActive: false,
      timeFreezeUntil: 0
    },
    purchaseHistory: []
  };

  // --------------------------------------------------------------------------
  // Internal Helpers for Persistence
  // --------------------------------------------------------------------------
  function getStoredData() {
    try {
      if (window.CortexStore && typeof window.CortexStore.getPlayer === 'function') {
        const player = window.CortexStore.getPlayer();
        if (player) {
          player.inventory = player.inventory || {
            hints: 2,
            eliminators: 1,
            timeFreeze: 1,
            starShields: 0
          };
          player.activeBoosts = player.activeBoosts || {
            doubleXPQuestions: 0,
            starShieldActive: false,
            timeFreezeUntil: 0
          };
          player.purchaseHistory = player.purchaseHistory || [];
          return player;
        }
      }
    } catch (e) {
      console.warn('[CortexShop] Error reading player data:', e);
    }
    return fallbackState;
  }

  function saveStoredData(inventoryUpdates, boostUpdates, newPurchase) {
    try {
      if (window.CortexStore && typeof window.CortexStore.updatePlayer === 'function') {
        const player = getStoredData();
        const updates = {};

        if (inventoryUpdates) {
          updates.inventory = { ...(player.inventory || {}), ...inventoryUpdates };
        }
        if (boostUpdates) {
          updates.activeBoosts = { ...(player.activeBoosts || {}), ...boostUpdates };
        }
        if (newPurchase) {
          const history = [...(player.purchaseHistory || [])];
          history.unshift(newPurchase);
          updates.purchaseHistory = history;
        }

        window.CortexStore.updatePlayer(updates);
        return;
      }
    } catch (e) {
      console.warn('[CortexShop] Error updating player data:', e);
    }

    // Update in-memory fallback
    if (inventoryUpdates) {
      fallbackState.inventory = { ...fallbackState.inventory, ...inventoryUpdates };
    }
    if (boostUpdates) {
      fallbackState.activeBoosts = { ...fallbackState.activeBoosts, ...boostUpdates };
    }
    if (newPurchase) {
      fallbackState.purchaseHistory.unshift(newPurchase);
    }
  }

  // --------------------------------------------------------------------------
  // CortexShop API
  // --------------------------------------------------------------------------
  const CortexShop = {
    /**
     * Get the complete item catalog
     */
    getItems: function () {
      return [...CATALOG];
    },

    /**
     * Get player's current owned inventory
     */
    getInventory: function () {
      const data = getStoredData();
      return { ...(data.inventory || {}) };
    },

    /**
     * Get item count in inventory
     * @param {string} itemIdOrKey
     */
    getInventoryCount: function (itemIdOrKey) {
      const inv = this.getInventory();
      if (inv[itemIdOrKey] !== undefined) {
        return inv[itemIdOrKey];
      }
      // Check catalog mapping
      const catalogItem = CATALOG.find(item => item.id === itemIdOrKey);
      if (catalogItem && catalogItem.targetInventoryKey) {
        return inv[catalogItem.targetInventoryKey] || 0;
      }
      return 0;
    },

    /**
     * Get player's coin and diamond balances
     */
    getBalance: function () {
      let coins = 0;
      let diamonds = 0;

      try {
        if (window.CortexPlayer) {
          if (typeof window.CortexPlayer.getCoinsBalance === 'function') {
            coins = window.CortexPlayer.getCoinsBalance();
          }
          if (typeof window.CortexPlayer.getDiamondsBalance === 'function') {
            diamonds = window.CortexPlayer.getDiamondsBalance();
          }
        }
      } catch (e) {
        console.warn('[CortexShop] Balance fetch error:', e);
      }

      return { coins, diamonds };
    },

    /**
     * Purchase an item from the catalog
     * @param {string} itemId
     */
    purchase: function (itemId) {
      const item = CATALOG.find(it => it.id === itemId);
      if (!item) {
        return { success: false, message: 'Item not found in catalog' };
      }

      const balance = this.getBalance();

      // Check sufficient funds
      if (item.currency === 'coins' && balance.coins < item.price) {
        return {
          success: false,
          message: `Insufficient coins. You need ${item.price} coins, but have ${balance.coins}.`,
          item
        };
      }

      if (item.currency === 'diamonds' && balance.diamonds < item.price) {
        return {
          success: false,
          message: `Insufficient diamonds. You need ${item.price} diamonds, but have ${balance.diamonds}.`,
          item
        };
      }

      // Deduct currency via CortexPlayer
      let deducted = false;
      try {
        if (window.CortexPlayer) {
          if (item.currency === 'coins') {
            deducted = typeof window.CortexPlayer.spendCoins === 'function'
              ? window.CortexPlayer.spendCoins(item.price)
              : true;
          } else if (item.currency === 'diamonds') {
            deducted = typeof window.CortexPlayer.spendDiamonds === 'function'
              ? window.CortexPlayer.spendDiamonds(item.price)
              : true;
          }
        } else {
          deducted = true;
        }
      } catch (e) {
        console.warn('[CortexShop] Error deducting currency:', e);
        deducted = true;
      }

      if (!deducted) {
        return { success: false, message: 'Transaction could not be completed', item };
      }

      // Apply item purchase effects
      const data = getStoredData();
      const currentInv = { ...(data.inventory || {}) };
      const currentBoosts = { ...(data.activeBoosts || {}) };

      if (item.id === 'coin-bonus') {
        // Direct bonus: grant 50 coins immediately
        try {
          if (window.CortexPlayer && typeof window.CortexPlayer.addCoins === 'function') {
            window.CortexPlayer.addCoins(50);
          }
        } catch (e) {
          console.warn('[CortexShop] Coin bonus error:', e);
        }
      } else if (item.id === 'double-xp') {
        // Activate 5 questions of double XP
        currentBoosts.doubleXPQuestions = (currentBoosts.doubleXPQuestions || 0) + item.quantity;
      } else if (item.id === 'star-saver') {
        // Star shield active
        currentBoosts.starShieldActive = true;
        currentInv.starShields = (currentInv.starShields || 0) + 1;
      } else {
        // Add to standard inventory
        const key = item.targetInventoryKey;
        currentInv[key] = (currentInv[key] || 0) + item.quantity;
      }

      // Record purchase entry
      const purchaseRecord = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        itemId: item.id,
        name: item.name,
        price: item.price,
        currency: item.currency,
        timestamp: Date.now()
      };

      saveStoredData(currentInv, currentBoosts, purchaseRecord);

      // Trigger achievement check
      try {
        if (window.CortexGamification && typeof window.CortexGamification.checkAchievements === 'function') {
          window.CortexGamification.checkAchievements();
        }
      } catch (e) {
        console.warn('[CortexShop] Achievement hook error:', e);
      }

      return {
        success: true,
        message: `Successfully purchased ${item.name}!`,
        item: item
      };
    },

    /**
     * Get purchase history
     */
    getPurchaseHistory: function () {
      const data = getStoredData();
      return [...(data.purchaseHistory || [])];
    },

    /**
     * Use one consumable or power-up from inventory
     * @param {string} itemId - e.g., 'hints', 'hint-pack-1', 'eliminators', 'timeFreeze', 'star-saver'
     */
    useItem: function (itemId) {
      const data = getStoredData();
      const inv = { ...(data.inventory || {}) };
      const boosts = { ...(data.activeBoosts || {}) };

      // Normalize key
      let key = itemId;
      if (itemId === 'hint' || itemId === 'hint-pack-1' || itemId === 'hint-pack-5') {
        key = 'hints';
      } else if (itemId === 'eliminate' || itemId === 'eliminate-1' || itemId === 'eliminate-5') {
        key = 'eliminators';
      } else if (itemId === 'time-freeze') {
        key = 'timeFreeze';
      } else if (itemId === 'star-saver') {
        key = 'starShields';
      }

      if (!inv[key] || inv[key] <= 0) {
        return { success: false, message: `No ${key} remaining in inventory` };
      }

      inv[key]--;

      // Activate specific power-up effects
      if (key === 'timeFreeze') {
        boosts.timeFreezeUntil = Date.now() + 30 * 1000; // 30 seconds
      } else if (key === 'starShields') {
        boosts.starShieldActive = true;
      }

      saveStoredData(inv, boosts, null);

      return {
        success: true,
        message: `Used ${key}`,
        remaining: inv[key]
      };
    },

    /**
     * Hint specific convenience methods
     */
    getHintCount: function () {
      const inv = this.getInventory();
      return inv.hints || 0;
    },

    useHint: function () {
      return this.useItem('hints');
    },

    /**
     * Double XP Boost checks & consumption
     */
    isDoubleXPActive: function () {
      const data = getStoredData();
      return Boolean(data.activeBoosts && data.activeBoosts.doubleXPQuestions > 0);
    },

    consumeDoubleXP: function () {
      const data = getStoredData();
      const boosts = { ...(data.activeBoosts || {}) };
      if (boosts.doubleXPQuestions > 0) {
        boosts.doubleXPQuestions--;
        saveStoredData(null, boosts, null);
        return true;
      }
      return false;
    },

    /**
     * Time Freeze check
     */
    isTimeFreezeActive: function () {
      const data = getStoredData();
      const until = data.activeBoosts?.timeFreezeUntil || 0;
      return Date.now() < until;
    },

    /**
     * Star Shield check & consumption
     */
    isStarShieldActive: function () {
      const data = getStoredData();
      return Boolean(data.activeBoosts && data.activeBoosts.starShieldActive);
    },

    consumeStarShield: function () {
      const data = getStoredData();
      const boosts = { ...(data.activeBoosts || {}) };
      boosts.starShieldActive = false;
      saveStoredData(null, boosts, null);
    },

    // ------------------------------------------------------------------------
    // UI Renderer Helper (for Shop View)
    // ------------------------------------------------------------------------
    renderShop: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const balance = this.getBalance();
      const inv = this.getInventory();
      const items = this.getItems();

      container.innerHTML = `
        <div class="cq-shop-view">
          <div class="cq-shop-header mb-4">
            <div>
              <h2 class="h3 fw-bold mb-1">Cortex Bazaar</h2>
              <p class="text-secondary small mb-0">Power up your mind with exclusive boosts, hints, and tactical artifacts.</p>
            </div>
            <div class="cq-shop-balances d-flex gap-3">
              <div class="cq-balance-pill coins">
                <span class="icon">🪙</span>
                <span class="val fw-bold">${balance.coins}</span>
                <span class="lbl small text-muted">Coins</span>
              </div>
              <div class="cq-balance-pill diamonds">
                <span class="icon">💎</span>
                <span class="val fw-bold">${balance.diamonds}</span>
                <span class="lbl small text-muted">Diamonds</span>
              </div>
            </div>
          </div>

          <div class="cq-inventory-banner p-3 mb-4 rounded-3 d-flex flex-wrap gap-4 align-items-center">
            <span class="fw-bold small text-uppercase tracking-wider">Your Inventory:</span>
            <div class="badge bg-dark border border-secondary px-3 py-2">💡 Hints: <span class="fw-bold text-warning">${inv.hints || 0}</span></div>
            <div class="badge bg-dark border border-secondary px-3 py-2">❌ Eliminators: <span class="fw-bold text-info">${inv.eliminators || 0}</span></div>
            <div class="badge bg-dark border border-secondary px-3 py-2">⏸️ Time Freezes: <span class="fw-bold text-primary">${inv.timeFreeze || 0}</span></div>
            <div class="badge bg-dark border border-secondary px-3 py-2">⭐ Star Shields: <span class="fw-bold text-warning">${inv.starShields || 0}</span></div>
          </div>

          <div class="row g-4 cq-shop-items-grid">
            ${items.map(item => `
              <div class="col-12 col-md-6 col-lg-3">
                <div class="cq-item-card h-100 p-3 rounded-4 d-flex flex-column justify-content-between">
                  <div>
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div class="cq-item-icon-circle">${item.icon}</div>
                      <span class="badge ${item.currency === 'coins' ? 'bg-warning text-dark' : 'bg-info text-dark'} fw-bold">
                        ${item.price} ${item.currency === 'coins' ? '🪙 Coins' : '💎 Diamonds'}
                      </span>
                    </div>
                    <h5 class="fw-bold mb-1 mt-2">${item.name}</h5>
                    <p class="small text-secondary mb-3">${item.description}</p>
                  </div>
                  <div>
                    <button class="btn w-100 cq-buy-btn ${item.currency === 'coins' ? 'btn-outline-warning' : 'btn-outline-info'}" data-item-id="${item.id}">
                      Purchase
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // Attach buy button events
      const buttons = container.querySelectorAll('.cq-buy-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.itemId;
          const res = this.purchase(id);
          if (res.success) {
            alert(res.message);
            this.renderShop(containerId);
          } else {
            alert(res.message);
          }
        });
      });
    }
  };

  // Expose globally
  window.CortexShop = CortexShop;

})(window);
