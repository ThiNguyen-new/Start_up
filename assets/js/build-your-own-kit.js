/**
 * Build Your Own Survival Kit - Client-side Interactive Builder
 * Handles item selection, quantities, theme filtering, panic level suggestions,
 * custom message preview, and demo cart persistence via sessionStorage.
 */
(function () {
  'use strict';

  var CART_KEY = 'survivalKitCart';
  var MAX_QTY = 20;
  var MIN_QTY = 0;
  var MAX_MESSAGE_LEN = 120;

  var state = {
    items: {},       // { [productId]: qty }
    message: '',
    theme: 'free'
  };

  // Product catalog cache from DOM
  var productsCatalog = {};

  var currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });

  function formatVND(amount) {
    try {
      return currencyFormatter.format(amount);
    } catch (e) {
      return (amount || 0).toLocaleString('vi-VN') + ' ₫';
    }
  }

  // Collect products metadata from DOM data attributes
  function initCatalog() {
    var cards = document.querySelectorAll('.js-byok-card');
    cards.forEach(function (card) {
      var id = card.getAttribute('data-id');
      if (!id) return;
      var price = parseInt(card.getAttribute('data-price'), 10) || 0;
      var name = card.getAttribute('data-name') || '';
      var category = card.getAttribute('data-category') || '';
      var themes = (card.getAttribute('data-themes') || '').split(',').map(function (t) { return t.trim(); });
      var suggested = (card.getAttribute('data-suggested-levels') || '').split(',').map(function (l) { return parseInt(l.trim(), 10); });

      productsCatalog[id] = {
        id: id,
        name: name,
        price: price,
        category: category,
        themes: themes,
        suggestedLevels: suggested
      };
    });
  }

  // Restore state from sessionStorage if existing
  function restoreSavedCart() {
    try {
      var saved = sessionStorage.getItem(CART_KEY);
      if (!saved) return;
      var parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.items)) {
        parsed.items.forEach(function (it) {
          if (it.id && Number.isInteger(it.qty) && it.qty > 0) {
            state.items[it.id] = Math.min(MAX_QTY, Math.max(0, it.qty));
          }
        });
      }
      if (typeof parsed.message === 'string') {
        state.message = parsed.message.slice(0, MAX_MESSAGE_LEN);
      }
      if (typeof parsed.theme === 'string') {
        state.theme = parsed.theme;
      }
    } catch (e) {
      // Ignore parse errors on demo storage
    }
  }

  // Calculate totals
  function getTotals() {
    var totalItems = 0;
    var totalPrice = 0;
    var selectedTypesCount = 0;

    Object.keys(state.items).forEach(function (id) {
      var qty = state.items[id] || 0;
      if (qty > 0 && productsCatalog[id]) {
        selectedTypesCount += 1;
        totalItems += qty;
        totalPrice += qty * productsCatalog[id].price;
      }
    });

    return {
      typesCount: selectedTypesCount,
      totalItems: totalItems,
      totalPrice: totalPrice
    };
  }

  // Update item quantity safely
  function updateItemQty(id, qty) {
    if (!productsCatalog[id]) return;
    var sanitized = parseInt(qty, 10);
    if (isNaN(sanitized) || sanitized < MIN_QTY) {
      sanitized = 0;
    } else if (sanitized > MAX_QTY) {
      sanitized = MAX_QTY;
    }

    if (sanitized === 0) {
      delete state.items[id];
    } else {
      state.items[id] = sanitized;
    }

    // Sync input field in card
    var card = document.querySelector('.js-byok-card[data-id="' + id + '"]');
    if (card) {
      var input = card.querySelector('.js-qty-input');
      var minusBtn = card.querySelector('.js-qty-minus');
      var plusBtn = card.querySelector('.js-qty-plus');
      if (input) input.value = sanitized;
      if (minusBtn) minusBtn.disabled = (sanitized <= 0);
      if (plusBtn) plusBtn.disabled = (sanitized >= MAX_QTY);
    }

    renderSummary();
    renderPreview();
  }

  // Render kit summary box & mobile sticky bar
  function renderSummary() {
    var totals = getTotals();

    // Counts
    var typesEls = document.querySelectorAll('.js-summary-types-count');
    typesEls.forEach(function (el) { el.textContent = totals.typesCount; });

    var itemsEls = document.querySelectorAll('.js-summary-items-count');
    itemsEls.forEach(function (el) { el.textContent = totals.totalItems; });

    // Prices
    var formattedPrice = formatVND(totals.totalPrice);
    var priceEls = document.querySelectorAll('.js-summary-total-price');
    priceEls.forEach(function (el) { el.textContent = formattedPrice; });

    // Empty state vs items list
    var emptyEl = document.querySelector('.js-summary-empty');
    var listEl = document.querySelector('.js-summary-items-list');

    if (totals.totalItems === 0) {
      if (emptyEl) emptyEl.removeAttribute('hidden');
      if (listEl) {
        listEl.setAttribute('hidden', 'hidden');
        listEl.innerHTML = '';
      }
    } else {
      if (emptyEl) emptyEl.setAttribute('hidden', 'hidden');
      if (listEl) {
        listEl.removeAttribute('hidden');
        listEl.innerHTML = '';

        Object.keys(state.items).forEach(function (id) {
          var qty = state.items[id];
          if (qty > 0 && productsCatalog[id]) {
            var item = productsCatalog[id];
            var row = document.createElement('div');
            row.className = 'sk-summary-item-row';

            var nameSpan = document.createElement('span');
            nameSpan.className = 'font-weight-medium text-dark';
            nameSpan.textContent = item.name + ' × ' + qty;

            var priceSpan = document.createElement('span');
            priceSpan.className = 'text-primary font-weight-bold';
            priceSpan.textContent = formatVND(item.price * qty);

            row.appendChild(nameSpan);
            row.appendChild(priceSpan);
            listEl.appendChild(row);
          }
        });
      }
    }

    // Add to cart buttons state
    var cartBtns = document.querySelectorAll('.js-btn-add-to-cart');
    cartBtns.forEach(function (btn) {
      btn.disabled = (totals.totalItems === 0);
    });
  }

  // Render preview using STRICT textContent (safe against XSS / HTML injection)
  function renderPreview() {
    var previewItems = document.querySelector('.js-preview-items');
    var previewNote = document.querySelector('.js-preview-note');
    var charCount = document.querySelector('.js-message-char-count');

    if (charCount) {
      charCount.textContent = state.message.length + '/' + MAX_MESSAGE_LEN + ' ký tự';
    }

    if (previewNote) {
      previewNote.textContent = state.message ? '“' + state.message + '”' : '(Chưa có lời nhắn cá nhân)';
    }

    if (previewItems) {
      var totals = getTotals();
      if (totals.totalItems === 0) {
        previewItems.textContent = 'Chưa chọn món đồ nào.';
      } else {
        var names = [];
        Object.keys(state.items).forEach(function (id) {
          var qty = state.items[id];
          if (qty > 0 && productsCatalog[id]) {
            names.push(productsCatalog[id].name + ' (' + qty + ')');
          }
        });
        previewItems.textContent = names.join(', ');
      }
    }
  }

  // Theme filter handler
  function applyTheme(themeKey) {
    state.theme = themeKey || 'free';

    // Update active button state
    document.querySelectorAll('.js-theme-btn').forEach(function (btn) {
      var t = btn.getAttribute('data-theme');
      if (t === state.theme) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // Filter/highlight product cards
    document.querySelectorAll('.js-byok-card').forEach(function (card) {
      var id = card.getAttribute('data-id');
      if (!productsCatalog[id]) return;
      var cardThemes = productsCatalog[id].themes;

      if (state.theme === 'free' || cardThemes.indexOf(state.theme) !== -1) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Update suggested badges based on current Panic Level
  function updateSuggestedBadges(level) {
    var currentLvl = Number(level || (window.PanicLevel ? window.PanicLevel.get() : 3));

    document.querySelectorAll('.js-byok-card').forEach(function (card) {
      var id = card.getAttribute('data-id');
      if (!productsCatalog[id]) return;
      var suggested = productsCatalog[id].suggestedLevels;
      var badge = card.querySelector('.js-suggested-badge');

      if (suggested && suggested.indexOf(currentLvl) !== -1) {
        card.classList.add('is-suggested');
        if (badge) badge.removeAttribute('hidden');
      } else {
        card.classList.remove('is-suggested');
        if (badge) badge.setAttribute('hidden', 'hidden');
      }
    });

    // Level 7 Quick Kits container toggle
    var presetsContainer = document.querySelector('.js-presets-container');
    if (presetsContainer) {
      if (currentLvl === 7) {
        presetsContainer.removeAttribute('hidden');
      } else {
        presetsContainer.setAttribute('hidden', 'hidden');
      }
    }
  }

  // Apply Quick Kit Preset for Level 7
  function applyPreset(presetId) {
    var presetEl = document.querySelector('.js-preset-data[data-preset-id="' + presetId + '"]');
    if (!presetEl) return;

    try {
      var itemsMap = JSON.parse(presetEl.textContent || '{}');
      // Reset current state items
      state.items = {};

      // Reset all card inputs to 0
      document.querySelectorAll('.js-byok-card').forEach(function (card) {
        var input = card.querySelector('.js-qty-input');
        var minusBtn = card.querySelector('.js-qty-minus');
        var plusBtn = card.querySelector('.js-qty-plus');
        if (input) input.value = 0;
        if (minusBtn) minusBtn.disabled = true;
        if (plusBtn) plusBtn.disabled = false;
      });

      // Apply preset items
      Object.keys(itemsMap).forEach(function (id) {
        updateItemQty(id, itemsMap[id]);
      });
    } catch (e) {
      // Ignore preset parse error
    }
  }

  // Add to Demo Cart & navigate to /cart-demo/
  function addToCartAndProceed() {
    var totals = getTotals();
    if (totals.totalItems === 0) return;

    var itemsList = [];
    Object.keys(state.items).forEach(function (id) {
      var qty = state.items[id];
      if (qty > 0 && productsCatalog[id]) {
        var prod = productsCatalog[id];
        itemsList.push({
          id: prod.id,
          name: prod.name,
          category: prod.category,
          price: prod.price,
          qty: qty,
          subtotal: prod.price * qty
        });
      }
    });

    var cartPayload = {
      level: window.PanicLevel ? window.PanicLevel.get() : 3,
      theme: state.theme,
      message: state.message,
      items: itemsList,
      total: totals.totalPrice,
      totalItems: totals.totalItems
    };

    try {
      sessionStorage.setItem(CART_KEY, JSON.stringify(cartPayload));
    } catch (e) {
      // Storage quota or disabled
    }

    var cartUrl = document.body.getAttribute('data-cart-url') || '/cart-demo/';
    window.location.href = cartUrl;
  }

  // Setup DOM event listeners
  function setupListeners() {
    // Quantity minus button
    document.addEventListener('click', function (e) {
      var minusBtn = e.target.closest('.js-qty-minus');
      if (minusBtn) {
        var card = minusBtn.closest('.js-byok-card');
        if (!card) return;
        var id = card.getAttribute('data-id');
        var current = state.items[id] || 0;
        updateItemQty(id, current - 1);
        return;
      }

      // Quantity plus button
      var plusBtn = e.target.closest('.js-qty-plus');
      if (plusBtn) {
        var cardPlus = plusBtn.closest('.js-byok-card');
        if (!cardPlus) return;
        var idPlus = cardPlus.getAttribute('data-id');
        var currentPlus = state.items[idPlus] || 0;
        updateItemQty(idPlus, currentPlus + 1);
        return;
      }

      // Theme filter button
      var themeBtn = e.target.closest('.js-theme-btn');
      if (themeBtn) {
        var theme = themeBtn.getAttribute('data-theme');
        applyTheme(theme);
        return;
      }

      // Apply preset button
      var presetBtn = e.target.closest('.js-apply-preset-btn');
      if (presetBtn) {
        var pId = presetBtn.getAttribute('data-preset-id');
        applyPreset(pId);
        return;
      }

      // Add to cart button
      var addBtn = e.target.closest('.js-btn-add-to-cart');
      if (addBtn) {
        addToCartAndProceed();
        return;
      }
    });

    // Quantity manual input change
    document.addEventListener('change', function (e) {
      if (e.target.classList.contains('js-qty-input')) {
        var card = e.target.closest('.js-byok-card');
        if (!card) return;
        var id = card.getAttribute('data-id');
        updateItemQty(id, e.target.value);
      }
    });

    // Message input change & live typing
    var msgInput = document.querySelector('.js-kit-message-input');
    if (msgInput) {
      msgInput.addEventListener('input', function () {
        state.message = msgInput.value.slice(0, MAX_MESSAGE_LEN);
        renderPreview();
      });
    }

    // Listen to Panic Level change
    document.addEventListener('paniclevelchange', function (e) {
      if (e.detail && e.detail.level) {
        updateSuggestedBadges(e.detail.level);
      }
    });
  }

  // Initialization
  function init() {
    initCatalog();
    restoreSavedCart();
    setupListeners();

    // Populate inputs from restored state
    Object.keys(state.items).forEach(function (id) {
      var qty = state.items[id];
      var card = document.querySelector('.js-byok-card[data-id="' + id + '"]');
      if (card) {
        var input = card.querySelector('.js-qty-input');
        var minusBtn = card.querySelector('.js-qty-minus');
        var plusBtn = card.querySelector('.js-qty-plus');
        if (input) input.value = qty;
        if (minusBtn) minusBtn.disabled = (qty <= 0);
        if (plusBtn) plusBtn.disabled = (qty >= MAX_QTY);
      }
    });

    var msgInput = document.querySelector('.js-kit-message-input');
    if (msgInput && state.message) {
      msgInput.value = state.message;
    }

    applyTheme(state.theme);
    updateSuggestedBadges(window.PanicLevel ? window.PanicLevel.get() : 3);
    renderSummary();
    renderPreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
