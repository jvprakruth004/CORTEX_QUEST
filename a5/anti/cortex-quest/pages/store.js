(function() {
  'use strict';

  const DEFAULT_ITEMS = [
    { id: 'hint_pack_5', name: 'Neural Hint Pack (x5)', category: 'powerup', desc: 'Grants 5 instant hints for tough quiz challenges', icon: '💡', price: 40, currency: 'coins', owned: 2 },
    { id: 'xp_booster_2x', name: 'Hyper XP Booster', category: 'powerup', desc: 'Double all earned XP for 45 minutes of gameplay', icon: '⚡', price: 80, currency: 'coins', owned: 1 },
    { id: 'streak_shield', name: 'Streak Freeze Shield', category: 'powerup', desc: 'Protects your daily streak if you miss a single day', icon: '🛡️', price: 120, currency: 'coins', owned: 0 },
    { id: 'time_warp', name: 'Chrono Time Warp', category: 'powerup', desc: 'Adds +15 bonus seconds on all 30-second quiz timers', icon: '⏳', price: 60, currency: 'coins', owned: 3 },
    { id: 'theme_cyberpunk', name: 'Neon Cyberpunk Theme', category: 'cosmetic', desc: 'Unlock vibrant cyber aesthetics and neon glow highlights', icon: '🔮', price: 25, currency: 'diamonds', owned: 0 },
    { id: 'avatar_crown', name: 'Imperial Golden Crown', category: 'cosmetic', desc: 'Flaunt a prestige animated crown over your avatar', icon: '👑', price: 50, currency: 'diamonds', owned: 0 },
    { id: 'diamond_pouch', name: 'Diamond Transmutation', category: 'exchange', desc: 'Transmute 100 Quest Coins into 5 Precious Diamonds', icon: '💎', price: 100, currency: 'coins', owned: 0 }
  ];

  function showToast(msg, type = 'info') {
    if (window.CortexUtils && window.CortexUtils.showToast) {
      window.CortexUtils.showToast(msg, type);
      return;
    }
    const container = document.getElementById('cq-toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : (type === 'warning' ? 'warning' : 'success')} position-fixed shadow-lg animate-slide-up`;
    toast.style.cssText = 'bottom: 24px; right: 24px; z-index: 9999; max-width: 360px; border-radius: 12px; font-weight: 500; font-size: 0.9rem;';
    toast.innerHTML = `<i class="bi bi-${type === 'error' ? 'x-circle' : 'check-circle'}-fill me-2"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  function openConfirmModal(title, bodyText, onConfirm) {
    const overlay = document.getElementById('cq-modal-overlay');
    const modal = document.getElementById('cq-modal');
    if (!overlay || !modal) {
      if (confirm(bodyText)) onConfirm();
      return;
    }

    modal.innerHTML = `
      <div class="cq-card p-4 rounded-4 shadow-xl text-center" style="max-width: 420px; width: 100%; background: rgba(26, 45, 10, 0.96); border: 2px solid #7a9a5c; color: #e8f0d8;">
        <i class="bi bi-cart-check-fill fs-1 text-warning mb-2 d-block"></i>
        <h4 class="h5 fw-bold text-white mb-2">${title}</h4>
        <p class="small text-muted mb-4" style="color: var(--cq-cream-muted) !important;">${bodyText}</p>
        <div class="d-flex gap-2 justify-content-center">
          <button id="cq-modal-cancel" class="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" style="border-color: rgba(122,154,92,0.3); color: #cbd5e1;">
            Cancel
          </button>
          <button id="cq-modal-confirm" class="btn btn-warning px-4 py-2 rounded-pill fw-bold" style="background: linear-gradient(135deg, #f0c040, #d4a017); border: none; color: #0d1a05;">
            Confirm Purchase
          </button>
        </div>
      </div>
    `;

    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    overlay.style.backdropFilter = 'blur(6px)';
    overlay.style.zIndex = '1050';

    const close = () => { overlay.style.display = 'none'; };
    const cancelBtn = document.getElementById('cq-modal-cancel');
    if (cancelBtn) cancelBtn.onclick = close;

    const confirmBtn = document.getElementById('cq-modal-confirm');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        close();
        onConfirm();
      };
    }
  }

  window.PageStore = {
    render: function() {
      const main = document.getElementById('cq-main');
      if (!main) return;

      const player = (window.CortexStore && window.CortexStore.getPlayer && window.CortexStore.getPlayer()) || {};
      let coins = (window.CortexPlayer && window.CortexPlayer.getCoinsBalance && window.CortexPlayer.getCoinsBalance()) ?? player.coins ?? 100;
      let diamonds = (window.CortexPlayer && window.CortexPlayer.getDiamondsBalance && window.CortexPlayer.getDiamondsBalance()) ?? player.diamonds ?? 10;

      let items = DEFAULT_ITEMS;
      if (window.CortexShop && window.CortexShop.getItems) {
        const shopItems = window.CortexShop.getItems();
        if (shopItems && shopItems.length > 0) items = shopItems;
      }

      let history = player.purchaseHistory || [
        { item: 'Neural Hint Pack (x5)', cost: 40, currency: 'coins', date: '2026-10-12 14:30' },
        { item: 'Chrono Time Warp', cost: 60, currency: 'coins', date: '2026-10-13 18:20' }
      ];
      if (window.CortexShop && window.CortexShop.getPurchaseHistory) {
        history = window.CortexShop.getPurchaseHistory() || history;
      }

      let activeTab = 'items';

      const renderView = () => {
        const container = document.getElementById('cq-store-content');
        if (!container) return;

        if (activeTab === 'history') {
          container.innerHTML = `
            <div class="cq-card p-4 rounded-4 shadow-lg" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3);">
              <h3 class="h5 fw-bold text-white mb-3"><i class="bi bi-clock-history me-2 text-warning"></i>Purchase Transaction Log</h3>
              ${history.length === 0 ? `
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-receipt fs-1 mb-2 d-block"></i>
                  No purchases recorded yet. Visit the store items catalog!
                </div>
              ` : `
                <div class="table-responsive">
                  <table class="table table-borderless text-white mb-0" style="vertical-align: middle;">
                    <thead>
                      <tr class="border-bottom" style="border-color: rgba(122,154,92,0.2) !important; color: var(--cq-text-muted); font-size: 0.8rem;">
                        <th>ITEM</th>
                        <th>DATE & TIME</th>
                        <th>COST</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${history.map(h => `
                        <tr class="border-bottom" style="border-color: rgba(122,154,92,0.1) !important;">
                          <td class="fw-semibold">${h.item}</td>
                          <td class="small text-muted">${h.date || 'Recent'}</td>
                          <td class="fw-bold" style="color: ${h.currency === 'diamonds' ? 'var(--cq-color-diamonds-light)' : 'var(--cq-gold-light)'};">
                            ${h.cost} ${h.currency === 'diamonds' ? '💎' : '🪙'}
                          </td>
                          <td><span class="badge bg-success small"><i class="bi bi-check-lg"></i> Completed</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          `;
          return;
        }

        // Active tab: Items & Power-ups
        container.innerHTML = `
          <!-- INVENTORY STATUS BAR -->
          <div class="p-3 rounded-4 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3 shadow-sm" style="background: rgba(13, 26, 5, 0.7); border: 1px dashed rgba(122, 154, 92, 0.35);">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-backpack-fill text-warning fs-5"></i>
              <span class="fw-bold text-white small">Backpack Inventory:</span>
              <span class="badge rounded-pill" style="background: rgba(255,255,255,0.1); color: #e8f0d8;">5 Hints</span>
              <span class="badge rounded-pill" style="background: rgba(255,255,255,0.1); color: #e8f0d8;">1 XP Booster</span>
              <span class="badge rounded-pill" style="background: rgba(255,255,255,0.1); color: #e8f0d8;">3 Time Warps</span>
            </div>
            <span class="small" style="color: var(--cq-sage-light);">Instant activation in any quiz</span>
          </div>

          <!-- ITEMS GRID -->
          <div class="row g-3 g-md-4">
            ${items.map(item => {
              const isDiamond = item.currency === 'diamonds';
              return `
                <div class="col-12 col-md-6 col-xl-4">
                  <div class="cq-shop-card h-100 p-4 rounded-4 d-flex flex-column justify-content-between position-relative overflow-hidden shadow-lg transition-normal" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.35);">
                    
                    <div>
                      <div class="d-flex align-items-center justify-content-between mb-3">
                        <div class="d-flex align-items-center justify-content-center rounded-3 shadow" style="width: 54px; height: 54px; background: rgba(13,26,5,0.8); border: 1px solid rgba(122,154,92,0.4); font-size: 2rem;">
                          ${item.icon}
                        </div>
                        <span class="badge rounded-pill text-uppercase px-3 py-1" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: var(--cq-sage-light); font-size: 0.68rem;">
                          ${item.category || 'General'}
                        </span>
                      </div>

                      <h3 class="h6 fw-bold text-white mb-1">${item.name}</h3>
                      <p class="small text-muted mb-3" style="font-size: 0.82rem; line-height: 1.4; color: var(--cq-cream-muted) !important;">
                        ${item.desc}
                      </p>
                    </div>

                    <div class="d-flex align-items-center justify-content-between pt-3 border-top" style="border-color: rgba(122,154,92,0.2) !important;">
                      <div class="fw-extrabold fs-5" style="color: ${isDiamond ? 'var(--cq-color-diamonds-light, #38bdf8)' : 'var(--cq-gold-light, #f0c040)'};">
                        ${isDiamond ? '💎' : '🪙'} ${item.price}
                      </div>
                      <button class="cq-buy-btn btn btn-sm px-4 py-2 rounded-pill fw-bold shadow-sm"
                              data-id="${item.id}"
                              data-name="${item.name}"
                              data-price="${item.price}"
                              data-curr="${item.currency}"
                              style="background: ${isDiamond ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'linear-gradient(135deg, #f0c040, #d4a017)'}; border: none; color: #0d1a05;">
                        <i class="bi bi-bag-plus-fill me-1"></i> Buy
                      </button>
                    </div>

                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;

        // Wire purchase buttons
        const buyBtns = container.querySelectorAll('.cq-buy-btn');
        buyBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const itemId = btn.getAttribute('data-id');
            const itemName = btn.getAttribute('data-name');
            const itemPrice = parseInt(btn.getAttribute('data-price'), 10);
            const itemCurr = btn.getAttribute('data-curr');

            openConfirmModal(
              'Confirm Store Purchase',
              `Spend ${itemPrice} ${itemCurr === 'diamonds' ? '💎 Diamonds' : '🪙 Coins'} on ${itemName}?`,
              () => {
                // Check balance & perform transaction
                if (itemCurr === 'coins') {
                  if (coins < itemPrice) {
                    showToast('Not enough coins to complete this purchase!', 'error');
                    return;
                  }
                  if (window.CortexPlayer && window.CortexPlayer.spendCoins) {
                    window.CortexPlayer.spendCoins(itemPrice);
                    coins = window.CortexPlayer.getCoinsBalance();
                  } else {
                    coins -= itemPrice;
                  }
                } else {
                  if (diamonds < itemPrice) {
                    showToast('Not enough diamonds to complete this purchase!', 'error');
                    return;
                  }
                  if (window.CortexPlayer && window.CortexPlayer.spendDiamonds) {
                    window.CortexPlayer.spendDiamonds(itemPrice);
                    diamonds = window.CortexPlayer.getDiamondsBalance();
                  } else {
                    diamonds -= itemPrice;
                  }
                }

                // If CortexShop purchase exists, call it
                if (window.CortexShop && window.CortexShop.purchase) {
                  window.CortexShop.purchase(itemId);
                }

                // Record history
                history.unshift({
                  item: itemName,
                  cost: itemPrice,
                  currency: itemCurr,
                  date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                });

                // Update UI balances
                const cEl = document.getElementById('cq-store-coins');
                const dEl = document.getElementById('cq-store-diamonds');
                if (cEl) cEl.textContent = coins;
                if (dEl) dEl.textContent = diamonds;

                showToast(`Successfully purchased ${itemName}!`, 'success');
              }
            );
          });
        });
      };

      main.innerHTML = `
        <div class="cq-store-page min-vh-100 pb-5" style="background-color: var(--cq-bg, #0d1a05); color: var(--cq-text-primary, #e8f0d8);">
          
          <!-- TOP NAVBAR -->
          <div class="sticky-top px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between" style="background: rgba(13, 26, 5, 0.94); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(122, 154, 92, 0.25); z-index: 1020;">
            <div class="d-flex align-items-center gap-3">
              <button id="cq-store-back" class="btn btn-sm btn-icon rounded-circle" style="width: 38px; height: 38px; background: rgba(26, 45, 10, 0.8); border: 1px solid rgba(122, 154, 92, 0.3); color: #9ab87e;">
                <i class="bi bi-arrow-left fs-5"></i>
              </button>
              <div>
                <h1 class="h4 fw-bold mb-0 text-white">Quest Store</h1>
                <small style="color: var(--cq-text-muted);">Empower your brain with tactical aids and custom themes</small>
              </div>
            </div>

            <!-- Balances -->
            <div class="d-flex align-items-center gap-2 px-3 py-1 rounded-pill" style="background: rgba(26, 45, 10, 0.9); border: 1px solid rgba(122, 154, 92, 0.3);">
              <span class="small fw-bold" style="color: var(--cq-color-coins, #d4a017);">🪙 <span id="cq-store-coins">${coins}</span></span>
              <span class="mx-1 text-muted">|</span>
              <span class="small fw-bold" style="color: var(--cq-color-diamonds, #06b6d4);">💎 <span id="cq-store-diamonds">${diamonds}</span></span>
            </div>
          </div>

          <div class="container-fluid px-3 px-lg-4 pt-4" style="max-width: 1400px;">
            <!-- STORE TABS -->
            <div class="d-flex align-items-center p-1 rounded-pill mb-4" style="background: rgba(26, 45, 10, 0.85); border: 1px solid rgba(122, 154, 92, 0.3); width: fit-content;">
              <button id="cq-tab-store-items" class="btn btn-sm rounded-pill px-4 py-2 fw-semibold active" style="background: #3A5311; border: 1px solid #7a9a5c; color: #fff;">
                <i class="bi bi-bag-check me-1"></i> Power-ups & Boosters
              </button>
              <button id="cq-tab-store-history" class="btn btn-sm rounded-pill px-4 py-2 fw-semibold" style="background: transparent; border: none; color: var(--cq-text-secondary);">
                <i class="bi bi-clock-history me-1"></i> Purchase History
              </button>
            </div>

            <!-- DYNAMIC TAB CONTENT -->
            <div id="cq-store-content"></div>
          </div>

        </div>
      `;

      // Back navigation
      const backBtn = document.getElementById('cq-store-back');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.CortexRouter) window.CortexRouter.navigate('dashboard');
        });
      }

      // Tab switching
      const tabItems = document.getElementById('cq-tab-store-items');
      const tabHistory = document.getElementById('cq-tab-store-history');
      if (tabItems && tabHistory) {
        tabItems.addEventListener('click', () => {
          activeTab = 'items';
          tabItems.style.background = '#3A5311';
          tabItems.style.border = '1px solid #7a9a5c';
          tabItems.style.color = '#fff';
          tabHistory.style.background = 'transparent';
          tabHistory.style.border = 'none';
          tabHistory.style.color = 'var(--cq-text-secondary)';
          renderView();
        });
        tabHistory.addEventListener('click', () => {
          activeTab = 'history';
          tabHistory.style.background = '#3A5311';
          tabHistory.style.border = '1px solid #7a9a5c';
          tabHistory.style.color = '#fff';
          tabItems.style.background = 'transparent';
          tabItems.style.border = 'none';
          tabItems.style.color = 'var(--cq-text-secondary)';
          renderView();
        });
      }

      renderView();
    }
  };
})();
